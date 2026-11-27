(() => {
  'use strict';

  const languages = ['de', 'en', 'zh'];
  const params = new URLSearchParams(location.search);
  const secondRound = params.get('runde') === '2';
  const preferred = params.get('lang') || navigator.language || 'de';
  const short = preferred.toLowerCase().split('-')[0];
  const language = languages.includes(short) ? short : 'de';
  const words = {
    title: ['Eine Aufgabe für die Startseite', 'A task for the homepage', '一个首页小任务'],
    task: ['Du möchtest deutsche Wörter anhand von Bildern üben. Öffne auf der Startseite das passende Angebot.', 'You want to practise German words using pictures. Open the part of the homepage where you can do that.', '你想通过图片练习德语单词。请从首页进入可以这样练习的地方。'],
    gamesTask: ['Du hast ein paar Minuten Zeit und möchtest direkt hier etwas spielen. Öffne ein Spiel, das du ausprobieren kannst.', 'You have a few minutes and feel like playing something right here. Open a game you can try.', '你有几分钟空闲，想直接在这里玩一会儿。请找一个现在就能玩的游戏并打开它。'],
    comicTask: ['Du möchtest eine gezeichnete Geschichte lesen und darin blättern. Öffne sie auf der Startseite.', 'You’d like to read an illustrated story and turn its pages. Find and open one from the homepage.', '你想找个有图的故事，一页页往下读。请从首页找到并打开它。'],
    pcTask: ['Du möchtest herausfinden, welches Teil deines PCs du zuerst aufrüsten solltest. Öffne das Angebot, das dir dabei hilft.', 'You want to work out which part of your PC to upgrade first. Open the part of the site that can help you decide.', '你想弄清楚自己的电脑应该先升级哪个部件。请从首页找到能帮你做决定的地方。'],
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
    bow: ['Wüstenbogen', 'Desert Archery', '沙漠射箭'],
    pirate: ['Piratenjagd', 'Pirate Hunt', '海盗冒险'],
    bowTrial: ['Wüstenbogen · Spielprobe', 'Desert Archery · mini-game', '沙漠射箭 · 试玩'],
    pirateTrial: ['Piratenjagd · Spielprobe', 'Pirate Hunt · mini-game', '海盗冒险 · 试玩'],
    archiveReader: ['Sams Comic-Entwurf', 'Sam’s comic draft', 'Sam 的漫画草稿'],
    classicBow: ['Klassisches Bogenspiel', 'Classic archery', '经典射箭游戏'],
    classicDino: ['Klassisches Dino-Spiel', 'Classic dinosaur game', '经典恐龙游戏'],
    reader: ['Sam & Piet · Leseseiten', 'Sam & Piet · reader', 'Sam 与 Piet · 阅读页'],
    workshop: ['PC-Werkstatt', 'PC Workshop', '电脑工作室'],
    gameHub: ['Spieleklassiker', 'Classic games', '经典游戏'],
    saga: ['Die große Monster-Saga', 'The Great Monster Saga', '怪物传奇'],
    catalogue: ['Sams Comics · Übersicht', 'Sam’s comics · catalogue', 'Sam 的漫画目录'],
    endedIn: ['In der Übersicht beendet', 'Stopped in the catalogue', '在目录页结束'],
    goal: ['Ziel erreicht', 'Goal reached', '是否达成目标'],
    yes: ['Ja', 'Yes', '是'],
    no: ['Nein', 'No', '否'],
    undetermined: ['Offen', 'Undetermined', '未判定'],
    version: ['Vorschauversion', 'Preview version', '预览版本'],
    other: ['Andere Seite', 'Another page', '其他页面'],
    stopped: ['Test beendet, bevor sich ein Angebot geöffnet hat.', 'Stopped before a destination opened.', '在打开目标页面之前结束了测试。'],
    unavailable: ['Seite konnte nicht bestätigt werden.', 'The page could not be verified.', '无法确认页面是否已打开。'],
  };
  const tasks = { A: 'gamesTask', B: 'comicTask', C: 'task', D: 'pcTask' };
  const taskIds = Object.keys(tasks);
  const requested = params.get('aufgabe');
  let taskId = 'C';
  if (secondRound) {
    taskId = Object.hasOwn(tasks, requested) ? requested : taskIds[Math.floor(Math.random() * taskIds.length)];
  }
  const t = key => words[key === 'task' ? tasks[taskId] : key][languages.indexOf(language)];
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
  // Confirm an opened page using both its canonical path and an element unique to that page.
  const destinationPages = [
    ['wuestenbogen', 'A', '#gameCanvas', 'bow'],
    ['piratenjagd', 'A', '#pirate-idea-link', 'pirate'],
    ['bogen', 'A', '#gameCanvas', 'classicBow'],
    ['trex', 'A', '#netType', 'classicDino'],
    ['monster-saga', 'B', '#saga-reader #comic-page', 'saga'],
    ['comic', 'B', '#page-frame #comic-page', 'reader'],
    ['wilson', 'C', '#path-picker', 'wilson'],
    ['werkstatt', 'D', '#upgrade-form', 'workshop'],
    ['klassischer-game-hub', 'A', '#card-bogen', 'gameHub', true],
    ['comics', 'B', '#sam-piet-volume', 'catalogue', true],
  ];
  const destinations = new Map(destinationPages.map(([slug, task, marker, label, catalogue]) =>
    [route(new URL(slug + '.html', location.href)), { task, marker, label, catalogue }]));
  if (secondRound) {
    for (const link of document.querySelectorAll('nav a[hreflang]')) {
      const url = new URL(link.href);
      url.searchParams.set('runde', '2');
      url.searchParams.set('aufgabe', taskId);
      link.href = url.href;
    }
    if (requested !== taskId) {
      const url = new URL(location.href);
      url.searchParams.set('aufgabe', taskId);
      history.replaceState(null, '', url.href);
    }
  }
  const build = location.hostname.match(/^([0-9a-f]+)\.wuesten-bogen-app\.pages\.dev$/)?.[1];
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

  function finish(outcome, goal = 'undetermined') {
    if (!run) return;
    const { frame, first, count } = run;
    run = null;
    frame.remove();
    byId('report').value = [
      'TheTwoKings · ' + (secondRound ? 'T2 · ' + taskId : 'T1') + ' · ' + language.toUpperCase(),
      t('first') + ' · ' + (first || t('noClick')),
      t('opened') + ' · ' + outcome,
      ...(secondRound ? [t('goal') + ' · ' + t(goal)] : []),
      t('actions') + ' · ' + count,
      ...(secondRound && build ? [t('version') + ' · ' + build] : []),
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
        if (secondRound && taskId === 'A') {
          doc.addEventListener('click', event => {
            const action = event.target.closest?.('#trial-shoot, [data-trial-net]');
            if (!action) return;
            const bow = action.id === 'trial-shoot';
            if (doc.getElementById(bow ? 'bow-result' : 'dino-result')?.textContent.trim()) {
              finish(t(bow ? 'bowTrial' : 'pirateTrial'), 'yes');
            }
          });
        }
        run.catalogue = null;
        run.destination = null;
        run.ready = true;
        byId('loading').hidden = true;
        frame.removeAttribute('aria-busy');
        frame.focus();
        return;
      }
      if (!run.ready) return finish(t('unavailable'));
      if (secondRound) {
        if (/\/comic-entwurf-[a-z0-9-]+$/.test(path) && doc.querySelector('main.archive-reader .archive-plate img')) {
          return finish(t('archiveReader'), taskId === 'B' ? 'yes' : 'no');
        }
        const destination = destinations.get(path);
        if (destination) {
          if (!doc.querySelector(destination.marker)) return finish(t('unavailable'));
          if (destination.catalogue && destination.task === taskId) {
            run.catalogue = destination.label;
            return;
          }
          return finish(t(destination.label), destination.task === taskId ? 'yes' : 'no');
        }
      } else if (path === trainer) {
        return finish(t(doc.getElementById('path-picker') ? 'wilson' : 'unavailable'));
      }
      const target = run.destination;
      if (target?.path === path) return finish(t('other') + ' · ' + target.label, 'no');
      finish(t('unavailable'));
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
  byId('stop').addEventListener('click', () => {
    if (run?.catalogue) return finish(t('endedIn') + ' · ' + t(run.catalogue));
    finish(t(run?.ready ? 'stopped' : 'beforeLoad'));
  });
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
