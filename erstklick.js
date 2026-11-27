(() => {
  'use strict';

  const languages = ['de', 'en', 'zh'];
  const preferred = new URLSearchParams(location.search).get('lang') || navigator.language || 'de';
  const short = preferred.toLowerCase().split('-')[0];
  const language = languages.includes(short) ? short : 'de';
  const words = {
    title: ['Eine Aufgabe für die Startseite', 'A task for the homepage', '一个首页小任务'],
    task: ['Du möchtest deutsche Wörter anhand von Bildern üben. Öffne auf der Startseite das passende Angebot.', 'You want to practise German words using pictures. Open the part of the homepage where you can do that.', '你想通过图片练习德语单词。请从首页进入可以这样练习的地方。'],
    how: ['Du kannst jederzeit aufhören. Dein Ergebnis siehst zuerst nur du. Du entscheidest, ob du es teilst.', 'You can stop at any time. Only you see your result unless you choose to share it.', '你可以随时结束。结果只有你自己能看到，你可以自行决定是否分享。'],
    start: ['Startseite öffnen', 'Open the homepage', '打开首页'],
    loading: ['Startseite wird geladen …', 'Loading the homepage…', '首页加载中…'],
    beforeLoad: ['Vor dem Laden beendet.', 'Stopped before the homepage loaded.', '在首页加载完成前结束。'],
    study: ['Aufgabe', 'Task', '任务'],
    stop: ['Aufhören', 'Stop', '结束测试'],
    result: ['Dein Ergebnis', 'Your result', '你的结果'],
    reportLabel: ['Protokoll zum freiwilligen Teilen', 'Result to share if you wish', '可自愿分享的测试记录'],
    copy: ['Ergebnis kopieren', 'Copy result', '复制结果'],
    copied: ['Ergebnis kopiert.', 'Result copied.', '结果已复制。'],
    manual: ['Der Text ist markiert. Du kannst ihn jetzt selbst kopieren.', 'The text is selected. You can copy it manually.', '文字已选中，你可以手动复制。'],
    retry: ['Neu beginnen', 'Start again', '重新开始'],
    first: ['Erster Klick', 'First click', '首次点击'],
    opened: ['Geöffnet', 'Opened', '已打开'],
    actions: ['Klicks auf der Startseite', 'Homepage clicks', '首页点击次数'],
    menu: ['Hauptmenü', 'Main menu', '主菜单'],
    tiles: ['Bereichskacheln', 'Section tiles', '版块卡片'],
    content: ['Seiteninhalt', 'Page content', '页面内容'],
    sidebar: ['Seitenleiste', 'Sidebar', '侧栏'],
    footer: ['Fußzeile', 'Footer', '页脚'],
    plain: ['Fläche ohne Link', 'Area without a link', '无链接区域'],
    control: ['Bedienelement', 'Control', '控件'],
    link: ['Link', 'Link', '链接'],
    noClick: ['Kein Klick', 'No click', '尚未点击'],
    wilson: ['Wilsons Trainingsecke', 'Wilson’s Learning Corner', 'Wilson 的德语学习角'],
    other: ['Andere Seite', 'Another page', '其他页面'],
    stopped: ['Test beendet, bevor sich ein Angebot geöffnet hat.', 'Stopped before a destination opened.', '在打开目标页面之前结束了测试。'],
    unavailable: ['Seite konnte nicht bestätigt werden.', 'The page could not be verified.', '无法确认页面是否已打开。'],
  };
  const t = key => words[key][languages.indexOf(language)];
  const byId = id => document.getElementById(id);
  document.documentElement.lang = language === 'zh' ? 'zh-Hans' : language;
  document.title = t('title') + ' · TheTwoKings';
  for (const el of document.querySelectorAll('[data-text]')) el.textContent = t(el.dataset.text);
  for (const el of document.querySelectorAll('[data-label]')) el.setAttribute('aria-label', t(el.dataset.label));
  document.querySelector('nav [lang^="' + language + '"]').setAttribute('aria-current', 'true');

  const homepage = new URL('homepage-preview.html', location.href);
  homepage.searchParams.set('lang', language);
  const route = url => url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/$/, '');
  const trainer = route(new URL('wilson.html', location.href));
  let run = null;

  function screen(id) {
    for (const panel of ['intro', 'study', 'results']) byId(panel).hidden = panel !== id;
  }

  function region(element) {
    if (element.closest('#navigation')) return t('menu');
    if (element.closest('#projekte')) return t('tiles');
    if (element.closest('aside')) return t('sidebar');
    if (element.closest('footer')) return t('footer');
    const area = element.closest('#spiele, #comics, #lernen, #werkstatt');
    const heading = area?.querySelector('h2');
    return heading ? heading.textContent.trim() : t('content');
  }

  function record(event) {
    if (!run || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const element = event.target.closest?.('*');
    if (!element || element.closest('.languages, .skip')) return;
    const link = element.closest('a[href]');
    let label = t('plain');
    if (link) {
      // Only read editorial navigation labels. Free text and local traces never enter the report.
      const copy = link.matches('[data-copy]') ? link : link.querySelector('strong[data-copy]');
      label = copy?.textContent.trim() || (link.matches('.brand') ? 'TheTwoKings' : t('link'));
      const dest = new URL(link.href);
      run.destination = { path: route(dest), label };
    } else if (element.closest('button, summary, input, select, textarea, label')) {
      label = t('control');
    }
    run.count++;
    if (!run.first) {
      const langAtClick = element.ownerDocument.documentElement.lang.split('-')[0];
      const suffix = languages.includes(langAtClick) && langAtClick !== language ? ' (' + langAtClick.toUpperCase() + ')' : '';
      run.first = region(element) + ' → ' + label + suffix;
    }
  }

  function finish(outcome) {
    if (!run) return;
    const { frame, first, count } = run;
    run = null;
    frame.remove();
    byId('report').value = [
      'TheTwoKings · T1 · ' + language.toUpperCase(),
      t('first') + ' · ' + (first || t('noClick')),
      t('opened') + ' · ' + outcome,
      t('actions') + ' · ' + count,
    ].join('\n');
    byId('copy-status').textContent = '';
    screen('results');
    byId('results-title').focus();
  }

  function loaded(frame) {
    if (!run || run.frame !== frame) return;
    try {
      const doc = frame.contentDocument;
      if (!doc) return finish(t('unavailable'));
      if (doc.URL === 'about:blank') return;
      const path = route(new URL(doc.URL));
      if (path === route(homepage) && doc.getElementById('projekte')) {
        doc.addEventListener('click', record, true);
        run.ready = true;
        byId('loading').hidden = true;
        frame.removeAttribute('aria-busy');
        frame.focus();
        return;
      }
      if (!run.ready) return finish(t('unavailable'));
      if (path === trainer) return finish(t(doc.getElementById('path-picker') ? 'wilson' : 'unavailable'));
      const target = run.destination;
      finish(target?.path === path ? t('other') + ' · ' + target.label : t('unavailable'));
    } catch {
      finish(t('unavailable'));
    }
  }

  byId('start').disabled = false;
  byId('start').addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.id = 'site';
    frame.setAttribute('aria-busy', 'true');
    byId('loading').hidden = false;
    frame.title = t('study') + ' · TheTwoKings';
    run = { frame, first: '', count: 0, destination: null, ready: false };
    frame.addEventListener('load', () => loaded(frame));
    frame.src = homepage.href;
    screen('study');
    byId('study').append(frame);
  });
  byId('stop').addEventListener('click', () => finish(t(run?.ready ? 'stopped' : 'beforeLoad')));
  byId('retry').addEventListener('click', () => {
    byId('report').value = '';
    screen('intro');
    byId('start').focus();
  });
  byId('copy').addEventListener('click', async () => {
    const report = byId('report');
    try {
      await navigator.clipboard.writeText(report.value);
      byId('copy-status').textContent = t('copied');
    } catch {
      report.focus();
      report.select();
      byId('copy-status').textContent = t('manual');
    }
  });
})();
