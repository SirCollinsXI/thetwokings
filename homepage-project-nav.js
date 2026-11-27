(() => {
  'use strict';

  const entry = new URLSearchParams(location.search);
  const script = document.currentScript;
  const section = script.dataset.section;
  const entryPage = entry.get('from');
  const homeFiles = new Map([
    ['homepage', 'index.html'],
    ['homepage-preview', 'homepage-preview.html'],
    ['klassische-startseite', 'klassische-startseite.html'],
  ]);
  if (!homeFiles.has(entryPage)) return;
  const home = new URL(homeFiles.get(entryPage), script.src);
  const classicSection = section === 'werkstatt' ? 'pc' : section;
  const homeSection = entryPage === 'klassische-startseite' ? classicSection : section;
  const root = new URL('.', script.src);
  const homePaths = new Set([root.pathname, new URL('index.html', root).pathname, new URL('/', root).pathname]);
  const returnLinks = [...document.querySelectorAll('a[href]')].filter(link => {
    const url = new URL(link.href);
    const isHome = url.origin === root.origin && homePaths.has(url.pathname);
    return isHome && (!url.hash || (url.hash === '#' + section || url.hash === '#' + classicSection));
  });
  const menuLink = document.querySelector('[data-preview-return]');
  const workshopLinks = document.querySelectorAll('a[href^="werkstatt.html"], a[href^="preisradar.html"]');
  const labels = {
    spiele: { de: '← Zur Spieleübersicht', en: '← Back to games', zh: '← 返回游戏区' },
    werkstatt: { de: '← Zur Werkstattübersicht', en: '← Back to the workshop overview', zh: '← 返回工坊总览' },
  };
  // The trainer has an independent interface language. Its return link keeps the homepage language.
  const homeLanguage = section === 'lernen' ? entry.get('homeLang') : null;

  function update() {
    const requested = (homeLanguage || document.documentElement.lang).toLowerCase().split('-')[0];
    const language = ['de', 'en', 'zh'].includes(requested) ? requested : 'de';
    home.searchParams.set('lang', language);
    home.hash = homeSection;
    for (const link of returnLinks) link.href = home.href;
    if (menuLink) {
      const label = labels[section][language];
      menuLink.href = home.href;
      if (menuLink.textContent !== label) menuLink.textContent = label;
      menuLink.hidden = false;
    }
    for (const link of workshopLinks) {
      const target = new URL(link.href);
      target.searchParams.set('from', entryPage);
      target.searchParams.set('lang', language);
      link.href = target.href;
    }
  }

  update();
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
