(() => {
  'use strict';
  const panel = document.getElementById('grusskarte');
  if (!panel) return;
  const icons = { wave: '👋', star: '★', crown: '♛' };
  const copy = {
    title: ['Grußkarte per Link teilen', 'Share a greeting card by link', '用链接分享问候卡'],
    intro: ['Alle mit dem Link können deine Karte öffnen. Das Bildzeichen und das Datum stehen im Link. Die Karte erscheint nur über diesen Link.',
      'Anyone with the link can open your card. The link contains the symbol and the date. The card is visible through this link only.',
      '有链接的人都可以打开你的卡片。链接中包含图案和日期，只有通过链接才能看到这张卡片。'],
    choose: ['Dein Bildzeichen', 'Choose a symbol', '选择图案'],
    wave: ['Winken', 'Wave', '挥手'], star: ['Stern', 'Star', '星星'], crown: ['Krone', 'Crown', '王冠'],
    greeting: ['Ein Gruß für dich', 'A greeting for you', '送给你的一声问候'],
    create: ['Grußlink erstellen', 'Create greeting link', '生成问候链接'],
    link: ['Link zur Karte', 'Card link', '问候卡链接'], copy: ['Link kopieren', 'Copy link', '复制链接'],
    copied: ['Link kopiert.', 'Link copied.', '链接已复制。'],
    manual: ['Der Link ist markiert. Kopiere ihn und teile ihn mit den Menschen deiner Wahl.',
      'The link is selected. Copy it to share with the people you choose.', '链接已选中，你可以复制并分享给想问候的人。'],
    invalid: ['Dieser Grußlink ist ungültig. Du kannst hier eine eigene Karte erstellen.',
      'This greeting link is invalid. You can create a new card here.', '这个问候链接无效。你可以在这里制作一张新卡片。']
  };
  const dateInBerlin = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
  const view = panel.querySelector('#card-view');
  const box = panel.querySelector('#card-link-box');
  const link = panel.querySelector('#card-link');
  const selector = panel.querySelector('#card-mark');
  const status = panel.querySelector('#card-status');
  let card = null;
  let message = '';
  let openedForLink = false;

  function readCard(hash) {
    const parts = /^#gruss-(\d{4}-\d{2}-\d{2})-(wave|star|crown)$/.exec(hash);
    if (!parts) return null;
    const [, day, mark] = parts;
    const date = new Date(day + 'T00:00:00Z');
    if (day.startsWith('0000') || day > dateInBerlin.format(Date.now()) || !Number.isFinite(date.valueOf())
        || date.toISOString().slice(0, 10) !== day) return null;
    return { day, mark, date };
  }

  function render() {
    const lang = document.documentElement.lang.toLowerCase().split('-')[0];
    const i = Math.max(0, ['de', 'en', 'zh'].indexOf(lang));
    for (const el of panel.querySelectorAll('[data-card-word]')) el.textContent = copy[el.dataset.cardWord][i];
    status.textContent = message ? copy[message][i] : '';
    view.hidden = !card;
    box.hidden = !card;
    if (!card) { link.value = ''; return; }
    panel.querySelector('#card-icon').textContent = icons[card.mark];
    const stamp = new Intl.DateTimeFormat(['de', 'en', 'zh-Hans'][i], { dateStyle: 'long', timeZone: 'UTC' }).format(card.date);
    panel.querySelector('#card-description').textContent = copy[card.mark][i] + ' · ' + stamp;
    const url = new URL(location.pathname, location.href);
    url.searchParams.set('lang', ['de', 'en', 'zh'][i]);
    url.hash = 'gruss-' + card.day + '-' + card.mark;
    link.value = url.href;
  }

  function navigate() {
    card = readCard(location.hash);
    const intended = location.hash.startsWith('#gruss-');
    message = intended && !card ? 'invalid' : '';
    if (intended) {
      if (!panel.open) openedForLink = true;
      panel.open = true;
    } else if (openedForLink) {
      panel.open = false;
      openedForLink = false;
    }
    if (card) selector.value = card.mark;
    render();
    if (intended) {
      const target = card ? view : panel.querySelector('summary');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }

  panel.querySelector('#card-create').addEventListener('click', () => {
    const hash = '#gruss-' + dateInBerlin.format(Date.now()) + '-' + selector.value;
    if (location.hash === hash) navigate();
    else location.hash = hash;
  });
  panel.querySelector('#card-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(link.value);
      message = 'copied';
    } catch {
      message = 'manual';
      render();
      link.focus();
      link.select();
      return;
    }
    render();
  });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('hashchange', navigate);
  navigate();
})();
