'use strict';

const copy = {
  ...homepageGamesCopy,
  title: ['TheTwoKings | Startseiten-Vorschau', 'TheTwoKings | Homepage preview', 'TheTwoKings｜首页预览'],
  skip: ['Zum Inhalt', 'Skip to content', '跳转到正文'],
  nav: ['Hauptnavigation', 'Main navigation', '主导航'],
  language: ['Sprache', 'Language', '语言'],
  comics: ['Sams Comics', 'Sam’s comics', 'Sam 的漫画'],
  wilson: ['Wilsons Trainingsecke', 'Wilson’s Learning Corner', 'Wilson 的德语学习角'],
  preview: ['Startseiten-Vorschau', 'Homepage preview', '首页预览'],
  headline: ['Spielen, lesen, lernen.', 'Play, read, learn.', '玩游戏，读漫画，学德语。'],
  intro: [
    'Spiele im Browser, lies Sams Comics, lerne Deutsch mit Bildern oder plane dein nächstes PC-Upgrade.',
    'Play browser games, read Sam’s comics, learn German with pictures, or plan your next PC upgrade.',
    '玩网页游戏，读 Sam 的漫画，看图学德语，或规划你的下一次电脑升级。',
  ],
  areaNav: ['Bereiche entdecken', 'Explore sections', '浏览各个版块'],
  areaGames: ['Spiele', 'Games', '游戏'],
  areaComics: ['Comics', 'Comics', '漫画'],
  areaLearn: ['Lernen', 'Learn', '学习'],
  areaWorkshop: ['Werkstatt', 'Workshop', '工坊'],
  areaGamesHint: ['Browserspiele und Das Wehr', 'Browser games and Das Wehr', '网页游戏和《水坝》'],
  areaComicsHint: ['Sam & Piet lesen', 'Read Sam & Piet', '阅读《Sam 与 Piet》'],
  areaLearnHint: ['Deutsch mit Bildkarten üben ↗', 'Practise German with picture cards ↗', '看图学德语 ↗'],
  areaWorkshopHint: ['PC-Werkstatt und KingLab', 'PC Workshop and KingLab', '电脑工作室和 KingLab'],
  prototype: ['Prototyp', 'Prototype', '原型'],
  comicText: [
    'Lies die veröffentlichte Leseprobe von Sam & Piet.',
    'Read the published preview of Sam & Piet.',
    '阅读已发布的《Sam 与 Piet》试读内容。',
  ],
  comicNext: [
    'Als Nächstes: weitere Werke sichten und zur Veröffentlichung freigeben.',
    'Next: review more comics and clear them for publication.',
    '下一步：审阅更多漫画，确认是否可以公开发布。',
  ],
  read: ['Leseprobe öffnen', 'Read the preview', '开始试读'],
  wilsonText: [
    'Mit Bildern deutsche Wörter, Artikel und Pluralformen üben.',
    'Practise German words, articles and plurals through pictures.',
    '看图练习德语单词、冠词和复数形式。',
  ],
  learn: ['Bildtrainer öffnen', 'Open picture trainer', '打开看图练习'],
  workshop: ['Werkstatt & Experimente', 'Workshop & experiments', '工作室与实验'],
  pc: ['PC-Werkstatt', 'PC Workshop', '电脑工作室'],
  pcNow: [
    'Importiere dein Hardwareprofil lokal und prüfe, welcher Upgrade-Schritt sich für dich lohnt.',
    'Import your hardware profile locally and see which upgrade to prioritise.',
    '在浏览器本地导入电脑配置，评估应优先升级哪些配件。',
  ],
  pcData: [
    'Der Preisradar zeigt historische Preise aus Deutschland und den USA.',
    'The Price Radar shows historical prices from Germany and the US.',
    '价格雷达展示德国和美国市场的历史价格。',
  ],
  pcNext: [
    'Als Nächstes: zwei Aufrüstpläne vergleichen und eigene Angebote in Euro oder Yuan mit Datum und Quelle erfassen.',
    'Next: compare two upgrade plans and record your own offers in euros or yuan, with dates and sources.',
    '下一步：对比两套升级方案，并用欧元或人民币记录自己找到的报价、日期和来源。',
  ],
  pcOpen: ['Prototyp öffnen', 'Open prototype', '体验原型'],
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
  statsEmpty: ['Für diese Vorschau sind gerade keine Messwerte verfügbar.', 'Counts are currently unavailable for this preview.', '此预览页暂无统计数据。'],
  statsTimeZone: ['Ortszeit Berlin', 'Berlin time', '柏林时间'],
  statsViews: ['Startseitenaufrufe', 'Homepage views', '首页浏览次数'],
  statsCrowns: ['Kronenpunkte', 'Crown points', '皇冠积分'],
  statsSince: ['Messbeginn', 'Counting since', '统计开始日期'],
  statsRule: [
    'Jeder Tag startet mit 10.000 Kronenpunkten. Jeder erfasste Startseitenaufruf bringt einen Punkt.',
    'Each day starts with 10,000 crown points. Each recorded homepage view adds one point.',
    '每天的皇冠积分从 10,000 分起算。首页每被浏览一次，就增加一分。',
  ],
  statsExample: [
    'Beispiel für 1 Aufruf · 10.001 Kronenpunkte',
    'Example for 1 view · 10,001 crown points',
    '以浏览 1 次为例，皇冠积分为 10,001 分。',
  ],
  existing: ['Aktuelle Website', 'Current website', '当前网站'],
  imprint: ['Impressum', 'Legal notice', '网站法律声明'],
  privacy: ['Datenschutz', 'Privacy', '隐私政策'],
};

const languages = ['de', 'en', 'zh'];
const storageKey = 'ttk-language';
const textNodes = document.querySelectorAll('[data-copy]');
const labelledNodes = document.querySelectorAll('[data-label]');
const buttons = document.querySelectorAll('[data-lang]');
const languageLinks = document.querySelectorAll('[data-link-language]');

function showDailyStats(locale) {
  const { views, start, day } = document.getElementById('stats-panel').dataset;
  if (!views || !start || !day) return;

  const number = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  for (const [id, value] of [['stats-day', day], ['stats-start', start]]) {
    const time = document.getElementById(id);
    time.dateTime = value;
    time.textContent = date.format(new Date(value + 'T00:00:00Z'));
  }
  document.getElementById('stats-views').textContent = number.format(Number(views));
  document.getElementById('stats-crowns').textContent = number.format(10_000 + Number(views));
  document.getElementById('stats-empty').hidden = true;
  document.getElementById('stats-example').hidden = true;
  document.getElementById('stats-live').hidden = false;
}

function showLanguage(language) {
  const index = languages.indexOf(language);
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  document.title = copy.title[index];
  for (const node of textNodes) node.textContent = copy[node.dataset.copy][index];
  for (const node of labelledNodes) node.setAttribute('aria-label', copy[node.dataset.label][index]);
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  showDailyStats(document.documentElement.lang);
  for (const link of languageLinks) {
    const target = new URL(link.href);
    const mode = link.dataset.linkLanguage;
    target.searchParams.set(mode === 'home-only' ? 'homeLang' : 'lang', language);
    if (mode) target.searchParams.set('from', 'homepage-preview');
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
