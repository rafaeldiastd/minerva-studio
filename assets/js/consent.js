// Consentimento de cookies: o Google Analytics só carrega depois que o visitante aceita.
// A escolha fica guardada no navegador; o botão "Preferências de cookies" reabre o aviso.
(() => {
  const GA_ID = 'G-LWZMHDKPG6';
  const KEY = 'minerva-cookies'; // 'aceito' ou 'recusado'

  // localStorage pode estar bloqueado (aba anônima, cookies desligados): aí o aviso volta a cada visita
  const read = () => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  };

  const save = (value) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
  };

  let loaded = false;

  const startAnalytics = () => {
    window[`ga-disable-${GA_ID}`] = false;
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.append(script);
  };

  // Recusa depois de ter aceitado: para de enviar nesta página e apaga os cookies _ga,
  // tentando cada domínio possível (o GA grava no domínio mais alto que o navegador aceitar)
  const stopAnalytics = () => {
    window[`ga-disable-${GA_ID}`] = true;
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) domains.push(`; domain=.${parts.slice(i).join('.')}`);
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (name !== '_ga' && !name.startsWith('_ga_')) continue;
      for (const domain of domains) document.cookie = `${name}=; max-age=0; path=/${domain}`;
    }
  };

  if (read() === 'aceito') startAnalytics();

  // páginas sem o aviso (como a 404) só respeitam a escolha já feita
  const banner = document.querySelector('[data-cookies]');
  if (!banner) return;

  let opener = null;

  const choose = (value) => {
    save(value);
    if (value === 'aceito') startAnalytics();
    else stopAnalytics();
    banner.hidden = true;
    // quem reabriu o aviso pelo botão volta para ele
    if (opener) opener.focus();
    opener = null;
  };

  banner.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cookies-choice]');
    if (button) choose(button.dataset.cookiesChoice);
  });

  for (const button of document.querySelectorAll('[data-cookies-open]')) {
    button.addEventListener('click', () => {
      opener = button;
      banner.hidden = false;
      banner.querySelector('[data-cookies-choice]').focus();
    });
  }

  if (!read()) banner.hidden = false;
})();
