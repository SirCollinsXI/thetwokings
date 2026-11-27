(() => {
  'use strict';
  const wall = document.getElementById('grusswand');
  if (!wall) return;
  const words = {
    title: ['Ein Gruß an die Welt', 'Say hello to the world', '向世界打个招呼'],
    intro: ['Hinterlasse ein Zeichen für alle, die heute vorbeischauen. Alle sehen den gemeinsamen Tagesstand.',
      'Leave a sign for everyone stopping by today. Everyone sees the same daily tally.',
      '给今天来访的人留个印记吧。大家都能看到当天每种印记的总数。'],
    day: ['Tag in Berlin', 'Berlin date', '柏林日期'],
    wave: ['Winken', 'Wave', '挥手'], star: ['Stern', 'Star', '星星'], crown: ['Krone', 'Crown', '王冠'],
    waveCount: ['Winkzeichen', 'Waves', '挥手次数'], starCount: ['Sterne', 'Stars', '星星数'], crownCount: ['Kronen', 'Crowns', '王冠数'],
    refresh: ['Stand neu laden', 'Refresh tally', '刷新总数'],
    privacy: ['Datenschutz zur Grußwand', 'Wall privacy details', '印记墙隐私说明'],
    loading: ['Der Tagesstand wird geladen.', 'Loading the daily tally.', '正在获取当天的总数。'],
    sending: ['Dein Zeichen wird gesendet.', 'Sending your sign.', '正在发送你的印记。'],
    sent: ['Dein Zeichen ist jetzt für alle mitgezählt.', 'Your sign is now part of the public tally.', '你的印记已计入公开的总数。'],
    stale: ['Der Stand hat sich geändert. Schau ihn dir an, bevor du ein weiteres Zeichen setzt.',
      'The tally has changed. Check it before leaving another sign.', '总数已更新。请先查看，再决定是否继续留印记。'],
    busy: ['Gerade kommen viele Zeichen an. Versuch es in einer Minute wieder.',
      'Many signs are arriving. Try again in a minute.', '现在有很多人同时留印记，请稍等一分钟再试。'],
    offline: ['Die öffentliche Grußwand ist derzeit nicht erreichbar.', 'The public wall is currently unavailable.', '公共印记墙暂时无法使用。'],
    uncertain: ['Die Bestätigung fehlt. Lade den Stand neu, bevor du es noch einmal versuchst.',
      'There was no confirmation. Refresh the tally before trying again.', '尚未收到确认。请先刷新总数，再决定是否重试。'],
    ready: ['', '', '']
  };
  const buttons = [...wall.querySelectorAll('[data-mark]')];
  const board = wall.querySelector('.wall-board');
  const status = wall.querySelector('.wall-status');
  const refresh = wall.querySelector('[data-wall-refresh]');
  let totals = null;
  let pending = false;
  let message = 'loading';

  function paint() {
    const short = document.documentElement.lang.toLowerCase().split('-')[0];
    const i = Math.max(0, ['de', 'en', 'zh'].indexOf(short));
    const locale = ['de', 'en', 'zh-Hans'][i];
    for (const el of wall.querySelectorAll('[data-wall-word]')) {
      el.textContent = words[el === status ? message : el.dataset.wallWord][i];
    }
    status.hidden = message === 'ready';
    board.hidden = !totals;
    refresh.hidden = message === 'loading';
    refresh.disabled = pending;
    const privacy = wall.querySelector('[data-wall-word="privacy"]');
    const privacyUrl = new URL(privacy.href);
    privacyUrl.searchParams.set('lang', short);
    privacyUrl.hash = short === 'en' || short === 'zh' ? 'spuren-' + short : 'spuren';
    privacy.href = privacyUrl.href;
    for (const button of buttons) {
      button.disabled = pending || !totals;
      const key = button.dataset.mark;
      const count = wall.querySelector('[data-count="' + key + '"]');
      count.setAttribute('aria-label', words[key + 'Count'][i]);
      count.value = totals ? new Intl.NumberFormat(locale).format(totals.counts[key]) : '';
    }
    if (totals) {
      const date = wall.querySelector('time');
      date.dateTime = totals.day;
      date.textContent = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' })
        .format(new Date(totals.day + 'T00:00:00Z'));
    }
  }

  async function update(mark) {
    if (pending || (mark && !totals)) return;
    pending = true;
    message = mark ? 'sending' : 'loading';
    paint();
    try {
      const options = { method: mark ? 'POST' : 'GET', credentials: 'omit', referrerPolicy: 'no-referrer',
        cache: 'no-store', signal: AbortSignal.timeout(12000) };
      if (mark) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ mark, seen: totals.counts[mark], day: totals.day });
      }
      const response = await fetch('/api/spuren', options);
      if (![200, 409, 429].includes(response.status)) throw new Error('Unavailable');
      const value = await response.json();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.day)
          || !buttons.every(b => Number.isSafeInteger(value.counts?.[b.dataset.mark]) && value.counts[b.dataset.mark] >= 0)) {
        throw new Error('Invalid daily tally');
      }
      totals = value;
      message = response.status === 409 ? 'stale' : response.status === 429 ? 'busy' : mark ? 'sent' : 'ready';
    } catch {
      totals = null;
      message = mark ? 'uncertain' : 'offline';
    } finally {
      pending = false;
      paint();
    }
  }
  refresh.addEventListener('click', () => update());
  for (const button of buttons) button.addEventListener('click', () => update(button.dataset.mark));
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  update();
})();
