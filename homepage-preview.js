'use strict';

const copy = {
  ...(typeof homepageGamesCopy === 'undefined' ? {} : homepageGamesCopy),
  title: ['TheTwoKings | Spielen, lesen, lernen.', 'TheTwoKings | Play, read, learn.', 'TheTwoKings｜玩游戏，读漫画，学德语。'],
  skip: ['Zum Inhalt', 'Skip to content', '跳转到正文'],
  nav: ['Hauptnavigation', 'Main navigation', '主导航'],
  language: ['Sprache', 'Language', '语言'],
  comics: ['Sams Comic-Werkstatt', 'Sam’s Comic Workshop', 'Sam 的漫画工坊'],
  wilson: ['Wilsons Lernecke', 'Wilson’s Learning Corner', 'Wilson 的学习角'],
  headline: ['Spielen, lesen, lernen.', 'Play, read, learn.', '玩游戏，读漫画，学德语。'],
  intro: [
    'Spiele im Browser, lies Sams Comics, lerne Deutsch mit Bildern oder plane dein nächstes PC-Upgrade.',
    'Play browser games, read Sam’s comics, learn German with pictures, or plan your next PC upgrade.',
    '玩网页游戏，读 Sam 的漫画，看图学德语，或规划你的下一次电脑升级。',
  ],
  wallInvite: ['Gruß hinterlassen', 'Leave a greeting', '留下一个问候'],
  areaNav: ['Bereiche entdecken', 'Explore sections', '浏览各个版块'],
  areaGames: ['Spiele', 'Games', '游戏'],
  areaComics: ['Comics', 'Comics', '漫画'],
  areaLearn: ['Lernen', 'Learn', '学习'],
  areaWorkshop: ['Werkstatt', 'Workshop', '工坊'],
  areaGamesHint: ['Browserspiele und Das Wehr', 'Browser games and Das Wehr', '网页游戏和《水坝》'],
  areaComicsHint: ['Geschichten und frühe Entwürfe', 'Stories and early drafts', '故事与创作草稿'],
  areaLearnHint: ['Deutsch mit Bildkarten üben ↗', 'Practise German with picture cards ↗', '看图学德语 ↗'],
  areaWorkshopHint: ['Hilfe beim Aufrüsten', 'Help with PC upgrades', '电脑升级指南'],
  prototype: ['Prototyp', 'Prototype', '原型'],
  comicScene: [
    'Sam balanciert auf der Planke eines Piratenschiffs. Im nächsten Bild stürzt er vor dem offenen Maul einer Riesenschildkröte ins Meer.',
    'Sam balances on a pirate ship’s plank. In the next panel he falls towards the open mouth of a giant sea turtle.',
    '萨姆站在海盗船伸出的木板上。下一格里，他跌向海中一只张着大嘴的巨龟。'
  ],
  comicText: [
    'Sam zeichnet und erfindet Geschichten. Entdecke Sam & Piet, die Monster-Saga und seine ersten Versuche mit KI.',
    'Sam draws and invents stories. Explore Sam & Piet, the Monster Saga and his early experiments with AI.',
    'Sam 喜欢画画、编故事。来读《Sam 与 Piet》和《怪物传奇》，也可以看看他早期尝试用 AI 创作的草稿。',
  ],
  read: ['Sam & Piet lesen', 'Read Sam & Piet', '阅读《Sam 与 Piet》'],
  comicArchive: ['Alle Comics entdecken', 'Explore all comics', '浏览全部漫画'],
  wilsonText: [
    'Mit Bildern deutsche Wörter, Artikel und Pluralformen üben.',
    'Practise German words, articles and plurals through pictures.',
    '看图练习德语单词、冠词和复数形式。',
  ],
  learn: ['Bildtrainer öffnen', 'Open picture trainer', '打开看图练习'],
  workshop: ['Werkstatt & Experimente', 'Workshop & experiments', '工作室与实验'],
  pc: ['Phils PC-Werkstatt', 'Phil’s PC Workshop', 'Phil 的电脑工坊'],
  pcNow: [
    'Beschreibe, wo dein PC stockt. Der Check zeigt dir, was du als Nächstes prüfen kannst.',
    'Tell us where your PC slows down and see what to check next.',
    '说说电脑在什么时候会卡顿，看看下一步可以检查什么。',
  ],
  pcData: [
    'Der Preisradar zeigt historische Preise aus Deutschland und den USA.',
    'The Price Radar shows historical prices from Germany and the US.',
    '价格雷达展示德国和美国市场的历史价格。',
  ],
  pcOpen: ['PC-Check starten', 'Start the PC check', '开始电脑检查'],
  pcPlanner: ['Komponenten und Angebote vergleichen', 'Compare PC parts and offers', '比较电脑配件和报价'],
  pcRadar: ['Historische Preise', 'Historical prices', '历史价格'],
  labText: ['Vergleiche den Koffeingehalt von Getränken.', 'Compare how much caffeine different drinks contain.', '对比不同饮料的咖啡因含量。'],
  labOpen: ['Koffeinvergleich öffnen', 'Open caffeine comparison', '查看咖啡因对比'],
  traces: ['Spuren', 'Traces', '访客印记'],
  traceIntro: [
    'Zeig, dass du da warst, sag was geholfen hat oder bring eine Idee weiter.',
    'Show you were here, say what helped, or build on an idea.',
    '留个到访印记，说说什么帮到了你，或者接着完善一个点子。',
  ],
  traceLocal: ['Deine Spuren bleiben in diesem Browser.', 'Your traces stay in this browser.', '你的印记只保存在当前浏览器中。'],
  traceOpen: ['Spur hinterlassen', 'Leave a trace', '留下印记'],
  traceCategory: ['Bereich', 'Section', '版块'],
  tracePresence: ['Ich war hier', 'I was here', '我来过'],
  traceHelpful: ['Hat mir geholfen', 'This helped me', '对我有帮助'],
  traceIdea: ['Deine Idee', 'Your idea', '你的点子'],
  traceContinuing: ['Du baust an einer Spur weiter.', 'You’re building on a trace.', '你正在续写一条印记。'],
  traceCancel: ['Auswahl lösen', 'Clear selection', '取消续写'],
  traceSave: ['Idee speichern', 'Save idea', '保存点子'],
  stats: ['Aufrufe der Vorschau', 'Preview traffic', '预览页访问统计'],
  statsTimeZone: ['Ortszeit Berlin', 'Berlin time', '柏林时间'],
  statsViews: ['Startseitenaufrufe', 'Homepage views', '首页浏览次数'],
  statsSince: ['Messbeginn', 'Counting since', '统计开始日期'],
  existing: ['Klassische Startseite', 'Classic homepage', '经典首页'],
  imprint: ['Impressum', 'Legal notice', '网站法律声明'],
  privacy: ['Datenschutz', 'Privacy', '隐私政策'],
};

const languages = ['de', 'en', 'zh'];
const storageKey = 'ttk-language';
const isPreview = /\/homepage-preview(?:\.html)?\/?$/.test(location.pathname);
const originPage = isPreview ? 'homepage-preview' : 'homepage';

// Preserve bookmarks to tools on the original homepage, including their language.
const classicFragments = new Set([
  '#purpose', '#purpose-note', '#budget', '#total', '#remaining', '#parts',
  '#export', '#compare', '#comparison', '#about', '#info', '#close-info',
]);
function openClassicBookmark() {
  if (isPreview || !classicFragments.has(location.hash)) return;
  const target = new URL('klassische-startseite.html', location.href);
  target.search = location.search;
  target.hash = location.hash;
  location.replace(target.href);
}
openClassicBookmark();
window.addEventListener('hashchange', openClassicBookmark);
const textNodes = document.querySelectorAll('[data-copy]');
const imageDescriptions = document.querySelectorAll('img[data-alt]');
const labelledNodes = document.querySelectorAll('[data-label]');
const buttons = document.querySelectorAll('[data-lang]');
const languageLinks = document.querySelectorAll('[data-link-language]');

function showDailyStats(locale) {
  const panel = document.getElementById('stats-panel');
  const { views, start, day } = panel.dataset;
  panel.hidden = true;
  if (!/^\d+$/.test(views) || !Number.isSafeInteger(Number(views))) return;
  const validDay = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  };
  if (!validDay(start) || !validDay(day) || start > day) return;

  const format = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  for (const [id, value] of [['stats-day', day], ['stats-start', start]]) {
    const time = document.getElementById(id);
    time.dateTime = value;
    time.textContent = format.format(new Date(value + 'T00:00:00Z'));
  }
  document.getElementById('stats-views').textContent = new Intl.NumberFormat(locale).format(Number(views));
  panel.hidden = false;
}

function showLanguage(language) {
  const index = languages.indexOf(language);
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  document.title = copy.title[index];
  document.querySelector('meta[name="description"]').content = copy.intro[index];
  for (const node of textNodes) {
    const translation = copy[node.dataset.copy]?.[index];
    if (translation !== undefined) node.textContent = translation;
  }
  for (const image of imageDescriptions) {
    const description = copy[image.dataset.alt]?.[index];
    if (description !== undefined) image.alt = description;
  }
  for (const node of labelledNodes) {
    const label = copy[node.dataset.label]?.[index];
    if (label !== undefined) node.setAttribute('aria-label', label);
  }
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  showDailyStats(document.documentElement.lang);
  for (const link of languageLinks) {
    const target = new URL(link.href);
    const mode = link.dataset.linkLanguage;
    target.searchParams.set('lang', language);
    if (mode === 'home-only') target.searchParams.set('homeLang', language);
    if (mode) target.searchParams.set('from', originPage);
    link.href = target.href;
  }
}

function initialLanguage() {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested === 'zh-CN') return 'zh';
  if (languages.includes(requested)) return requested;
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (languages.includes(saved)) return saved;
  } catch {
    // A browser can disable session storage.
  }
  const preferred = navigator.language.toLowerCase().split('-')[0];
  return languages.includes(preferred) ? preferred : 'de';
}

showLanguage(initialLanguage());
for (const button of buttons) {
  button.addEventListener('click', () => {
    const language = button.dataset.lang;
    showLanguage(language);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    history.replaceState(history.state, '', url);
    try {
      sessionStorage.setItem(storageKey, language);
    } catch {
      // Language selection still works for the current page.
    }
  });
}
