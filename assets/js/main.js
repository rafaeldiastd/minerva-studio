(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const toggleLabel = toggle.querySelector('.menu-toggle__label');
  const menu = document.getElementById('menu');
  const themed = [...document.querySelectorAll('main [data-theme], footer[data-theme]')];
  const suns = [...document.querySelectorAll('.sunburst')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
})();
