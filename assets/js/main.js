(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const toggleLabel = toggle.querySelector('.menu-toggle__label');
  const menu = document.getElementById('menu');
  const themed = [...document.querySelectorAll('main [data-theme], footer[data-theme]')];
  const suns = [...document.querySelectorAll('.sunburst')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Manifesto: quebra cada bloco em palavras para acendê-las uma a uma na rolagem
  const reveals = reduceMotion.matches ? [] : [...document.querySelectorAll('[data-reveal]')].map((block) => {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let count = 0;
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part.trim()) {
          fragment.append(part);
          continue;
        }
        const word = document.createElement('span');
        word.className = 'reveal__word';
        word.style.setProperty('--i', count++);
        word.textContent = part;
        fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    block.style.setProperty('--n', count);
    block.classList.add('is-revealing');
    const marks = [...block.querySelectorAll('mark')].map((mark) => ({
      mark,
      at: Number(mark.querySelector('.reveal__word').style.getPropertyValue('--i')),
    }));
    return { block, count, marks };
  });

  // Entrada do hero: espera a fonte para o título não pular de tamanho
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise((resolve) => setTimeout(resolve, 1200));
  Promise.race([fontsReady, timeout]).then(() => {
    requestAnimationFrame(() => root.classList.add('is-loaded'));
  });

  // Menu mobile
  let menuOpen = false;

  const setMenu = (open) => {
    menuOpen = open;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Fechar' : 'Menu';
    root.classList.toggle('menu-open', open);
    if (open) {
      header.dataset.theme = 'dark';
      header.classList.remove('is-hidden');
      menu.querySelector('a').focus();
    } else {
      update();
    }
  };

  toggle.addEventListener('click', () => setMenu(!menuOpen));

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 960px)').addEventListener('change', (event) => {
    if (event.matches && menuOpen) setMenu(false);
  });

  // Header acompanha a cor da seção que está embaixo dele e some ao rolar para baixo
  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    ticking = false;
    const y = window.scrollY;
    const viewport = window.innerHeight;

    if (!menuOpen) {
      const probe = header.offsetHeight / 2;
      const current = themed.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probe && rect.bottom > probe;
      });
      if (current) header.dataset.theme = current.dataset.theme;

      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > viewport * 0.5 && !header.contains(document.activeElement)) {
        header.classList.add('is-hidden');
      } else if (goingUp || y <= viewport * 0.5) {
        header.classList.remove('is-hidden');
      }
    }
    lastY = y;

    // Cada bloco acende do topo a 80% da tela até o fim dele chegar a 55%
    for (const { block, count, marks } of reveals) {
      const rect = block.getBoundingClientRect();
      const start = viewport * 0.8;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (rect.height + start - viewport * 0.55)));
      block.style.setProperty('--p', progress.toFixed(4));
      const lit = progress * (count + 4);
      for (const { mark, at } of marks) mark.classList.toggle('is-on', lit > at + 2);
    }

    // Sunbursts giram de leve conforme a rolagem
    if (!reduceMotion.matches) {
      for (const sun of suns) {
        const rect = sun.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) continue;
        const progress = (rect.top + rect.height / 2) / viewport;
        sun.style.setProperty('--spin', `${(progress * -40).toFixed(2)}deg`);
      }
    }
  }

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();

  // Portfólio: os cards vêm de projetos.json; sem projetos a seção continua escondida
  const work = document.getElementById('projetos');
  const workGrid = work && work.querySelector('.work__grid');

  // textura de pontos que segura o lugar de projeto ainda sem imagem: [arquivo, largura, altura]
  const placeholders = [['noise-3', 1548, 520], ['noise-1', 888, 1048], ['noise-4', 972, 1020], ['noise-2', 1568, 440]];

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  // só aceita links http(s), para o JSON não conseguir injetar javascript: no href
  const safeLink = (value) => {
    if (!value) return '';
    try {
      const url = new URL(value, document.baseURI);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch {
      return '';
    }
  };

  const projectCard = (project, index) => {
    const item = element('li', 'project');
    const href = safeLink(project.link);
    const card = element(href ? 'a' : 'div', 'project__card');
    if (href) {
      card.href = href;
      card.target = '_blank';
      card.rel = 'noopener';
    }

    const media = element('div', 'project__media');
    const image = element('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    if (project.imagem) {
      image.className = 'project__img';
      image.src = project.imagem;
      image.alt = project.alt || '';
    } else {
      const [file, width, height] = placeholders[index % placeholders.length];
      image.src = `assets/img/${file}.webp`;
      image.alt = '';
      image.width = width;
      image.height = height;
      image.dataset.dither = '';
    }
    media.append(image);

    const meta = element('div', 'project__meta');
    meta.append(element('h3', 'project__name', project.nome));
    if (project.ano) meta.append(element('span', 'project__year', String(project.ano)));
    card.append(media, meta);

    const services = Array.isArray(project.servicos) ? project.servicos.filter(Boolean) : [];
    if (services.length) card.append(element('p', 'project__tags', services.join(' · ')));
    if (project.descricao) card.append(element('p', 'project__desc', project.descricao));

    item.append(card);
    return item;
  };

  if (workGrid) {
    // no-cache: confere com o servidor a cada visita, então o projeto novo aparece logo após o deploy
    fetch('projetos.json', { cache: 'no-cache' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.status))))
      .then((data) => {
        const projects = (Array.isArray(data.projetos) ? data.projetos : []).filter((project) => project && project.nome);
        if (!projects.length) return;
        workGrid.replaceChildren(...projects.map(projectCard));
        work.hidden = false;
        document.dispatchEvent(new Event('dither:scan'));
        requestUpdate();
      })
      .catch(() => {});
  }

  // Quem somos: a ilustração de cada pessoa acompanha o cursor sobre o nome
  const names = [...document.querySelectorAll('[data-photo]')];
  if (names.length && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const photo = document.createElement('div');
    photo.className = 'cursor-photo';
    photo.setAttribute('aria-hidden', 'true');
    const photoImg = document.createElement('img');
    photoImg.alt = '';
    photoImg.decoding = 'async';
    photo.append(photoImg);
    document.body.append(photo);

    // baixa as ilustrações depois da página, para o primeiro hover já ter a imagem
    window.addEventListener('load', () => {
      for (const name of names) new Image().src = name.dataset.photo;
    }, { once: true });

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let following = 0;

    // a imagem persegue o cursor com atraso e inclina um pouco na direção do movimento
    const follow = () => {
      const ease = reduceMotion.matches ? 1 : 0.16;
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      pos.x += dx * ease;
      pos.y += dy * ease;
      const tilt = reduceMotion.matches ? 0 : Math.max(-8, Math.min(8, dx * 0.12));
      photo.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      following = Math.abs(dx) + Math.abs(dy) > 0.3 ? requestAnimationFrame(follow) : 0;
    };

    const aim = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!following) following = requestAnimationFrame(follow);
    };

    for (const name of names) {
      name.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        // ao entrar, a imagem nasce no cursor em vez de vir voando de onde sumiu
        if (!photo.classList.contains('is-visible')) {
          pos.x = event.clientX;
          pos.y = event.clientY;
        }
        photoImg.src = name.dataset.photo;
        photo.classList.add('is-visible');
        aim(event);
      });
      name.addEventListener('pointermove', aim);
      name.addEventListener('pointerleave', () => photo.classList.remove('is-visible'));
    }
  }
})();
