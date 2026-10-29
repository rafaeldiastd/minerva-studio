// Pontilhado em dither: as texturas de pontos viram uma grade Bayer desenhada em canvas,
// e cada ponto é atraído pelo cursor como limalha por um ímã, voltando ao lugar numa mola.
(() => {
  // aberto direto do disco (file://) o canvas não pode ler a imagem: ficam as imagens estáticas
  if (!window.HTMLCanvasElement || location.protocol === 'file:') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const CELL = 4;        // tamanho de cada ponto, em px de CSS
  const BLUR = 2;        // suavização da densidade, em células
  const PEAK = 0.62;     // densidade máxima depois de normalizar
  const RADIUS = 170;    // alcance do ímã, em px de CSS
  const PULL = 0.28;     // quanto o ponto anda em direção ao cursor (0 a 1)
  const STIFFNESS = 0.03; // força da mola: baixa deixa o movimento lento e macio
  const DAMPING = 0.78;  // atrito: segura o balanço para o ponto assentar sem quicar

  // Matriz Bayer 8x8 normalizada para limiares entre 0 e 1
  const BAYER = (() => {
    const m = new Float32Array(64);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let v = 0;
        for (let bit = 0, xx = x, yy = y; bit < 3; bit++, xx >>= 1, yy >>= 1) {
          v = (v << 2) | (((xx ^ yy) & 1) << 1) | (yy & 1);
        }
        m[y * 8 + x] = (v + 0.5) / 64;
      }
    }
    return m;
  })();

  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  function boxBlur(src, w, h, r) {
    const tmp = new Float32Array(src.length);
    const out = new Float32Array(src.length);
    const span = r * 2 + 1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let k = -r; k <= r; k++) sum += src[y * w + Math.min(w - 1, Math.max(0, x + k))];
        tmp[y * w + x] = sum / span;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let k = -r; k <= r; k++) sum += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
        out[y * w + x] = sum / span;
      }
    }
    return out;
  }

  const items = [];

  function adopt(img) {
    const canvas = document.createElement('canvas');
    canvas.className = `${img.className} dither`;
    canvas.width = Number(img.getAttribute('width')) || img.naturalWidth || 300;
    canvas.height = Number(img.getAttribute('height')) || img.naturalHeight || 150;
    canvas.setAttribute('aria-hidden', 'true');
    img.replaceWith(canvas);
    return { canvas, img, src: img.currentSrc || img.src, ratio: canvas.height / canvas.width, visible: false };
  }

  // Monta a grade a partir da imagem: a média do alfa em cada célula vira a densidade,
  // e cada célula que passa no limiar Bayer vira um ponto com posição de origem
  function build(item) {
    const { canvas, image } = item;
    const cssW = canvas.offsetWidth;
    if (!cssW || !image) return;
    const gw = Math.max(8, Math.round(cssW / CELL));
    const gh = Math.max(8, Math.round(gw * item.ratio));
    const scale = Math.max(1, Math.round(CELL * (window.devicePixelRatio || 1)));

    const sample = document.createElement('canvas');
    sample.width = gw;
    sample.height = gh;
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(image, 0, 0, gw, gh);
    const alpha = sctx.getImageData(0, 0, gw, gh).data;

    let density = new Float32Array(gw * gh);
    for (let i = 0; i < density.length; i++) density[i] = alpha[i * 4 + 3] / 255;
    density = boxBlur(boxBlur(density, gw, gh, BLUR), gw, gh, BLUR);
    let max = 0;
    for (const v of density) if (v > max) max = v;

    const home = [];
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        if (max > 0 && (density[y * gw + x] / max) * PEAK > BAYER[(y & 7) * 8 + (x & 7)]) home.push(x, y);
      }
    }

    const count = home.length / 2;
    item.hx = new Float32Array(count);
    item.hy = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      item.hx[i] = home[i * 2];
      item.hy[i] = home[i * 2 + 1];
    }
    item.x = item.hx.slice();
    item.y = item.hy.slice();
    item.vx = new Float32Array(count);
    item.vy = new Float32Array(count);

    canvas.width = gw * scale;
    canvas.height = gh * scale;
    item.ctx = canvas.getContext('2d');
    item.gw = gw;
    item.gh = gh;
    item.scale = scale;
    item.color = getComputedStyle(canvas).color;
    item.ready = true;
    draw(item);
  }

  function draw(item) {
    const { ctx, canvas, x, y, scale } = item;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = item.color;
    for (let i = 0; i < x.length; i++) {
      ctx.fillRect(Math.round(x[i] * scale), Math.round(y[i] * scale), scale, scale);
    }
  }

  function load(item) {
    if (item.loading) return;
    item.loading = true;
    const image = new Image();
    image.decoding = 'async';
    image.src = item.src;
    image.decode().then(() => {
      item.image = image;
      build(item);
    }).catch(() => {
      // sem canvas utilizável, volta a imagem original
      item.ready = false;
      item.canvas.replaceWith(item.img);
    });
  }

  // Leva o ponteiro para o espaço do canvas, desfazendo rotação e deslocamento do CSS
  function toLocal(item, clientX, clientY) {
    const { canvas } = item;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const style = getComputedStyle(canvas);
    const m = style.transform === 'none' ? new DOMMatrix() : new DOMMatrix(style.transform);
    const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
    const full = new DOMMatrix().translate(ox, oy).multiply(m).translate(-ox, -oy);

    let minX = Infinity;
    let minY = Infinity;
    for (const [cx, cy] of [[0, 0], [w, 0], [0, h], [w, h]]) {
      const p = full.transformPoint(new DOMPoint(cx, cy));
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
    }
    const rect = canvas.getBoundingClientRect();
    const p = full.inverse().transformPoint(new DOMPoint(clientX - rect.left + minX, clientY - rect.top + minY));
    return { x: (p.x / w) * item.gw, y: (p.y / h) * item.gh, r: (RADIUS / w) * item.gw };
  }

  // Um passo da física: cada ponto persegue seu alvo (a origem, puxada em direção ao cursor)
  // Devolve se ainda há algo se movendo
  function step(item, k) {
    const { hx, hy, x, y, vx, vy, gw, gh } = item;
    const m = pointer.inside ? toLocal(item, pointer.x, pointer.y) : null;
    const near = m && m.x > -m.r && m.y > -m.r && m.x < gw + m.r && m.y < gh + m.r;
    const damping = Math.pow(DAMPING, k);
    let moving = false;

    for (let i = 0; i < x.length; i++) {
      let tx = hx[i];
      let ty = hy[i];
      if (near) {
        const dx = m.x - tx;
        const dy = m.y - ty;
        if (dx > -m.r && dx < m.r && dy > -m.r && dy < m.r) {
          const f = (1 - smooth(Math.hypot(dx, dy) / m.r)) * PULL;
          tx = Math.min(gw - 1, Math.max(0, tx + dx * f));
          ty = Math.min(gh - 1, Math.max(0, ty + dy * f));
        }
      }
      vx[i] = (vx[i] + (tx - x[i]) * STIFFNESS * k) * damping;
      vy[i] = (vy[i] + (ty - y[i]) * STIFFNESS * k) * damping;
      x[i] += vx[i] * k;
      y[i] += vy[i] * k;
      if (!moving && (Math.abs(vx[i]) + Math.abs(vy[i]) > 0.003 || Math.abs(tx - x[i]) + Math.abs(ty - y[i]) > 0.02)) {
        moving = true;
      }
    }
    return moving;
  }

  // Ponteiro: guarda a posição; a física roda até tudo assentar e então para
  const pointer = { x: 0, y: 0, inside: false };
  let running = false;
  let last = 0;

  function frame(now) {
    const k = last ? Math.min(3, (now - last) / 16.67) : 1;
    last = now;
    let busy = false;

    for (const item of items) {
      if (!item.ready || !item.visible) continue;
      const moving = step(item, k);
      // desenha também o quadro em que o ponto assenta
      if (moving || item.moving) draw(item);
      item.moving = moving;
      busy = busy || moving;
    }

    if (busy) requestAnimationFrame(frame);
    else {
      running = false;
      last = 0;
    }
  }

  const wake = () => {
    if (running || reduceMotion.matches) return;
    running = true;
    requestAnimationFrame(frame);
  };

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.inside = true;
    wake();
  }, { passive: true });

  const leave = () => {
    pointer.inside = false;
    wake();
  };
  document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('pointerup', (event) => { if (event.pointerType !== 'mouse') leave(); });
  window.addEventListener('pointercancel', leave);
  window.addEventListener('blur', leave);

  // A página rola sob o cursor parado: o ímã acompanha
  window.addEventListener('scroll', () => { if (pointer.inside) wake(); }, { passive: true });

  // Só carrega e anima o que está perto da tela
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = items.find((it) => it.canvas === entry.target);
      item.visible = entry.isIntersecting;
      if (entry.isIntersecting) load(item);
    }
  }, { rootMargin: '50% 0px' });

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const item = items.find((it) => it.canvas === entry.target);
      if (item.ready && Math.round(entry.contentRect.width / CELL) !== item.gw) build(item);
    }
  });

  // Converte as texturas que estão na página; o portfólio, montado depois a partir
  // do JSON, avisa com o evento 'dither:scan' para as suas entrarem também
  const scan = () => {
    for (const img of document.querySelectorAll('img[data-dither]')) {
      const item = adopt(img);
      items.push(item);
      io.observe(item.canvas);
      ro.observe(item.canvas);
    }
  };

  scan();
  document.addEventListener('dither:scan', scan);
})();
