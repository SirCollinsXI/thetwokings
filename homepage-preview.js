'use strict';

const copy = {
  title: ['TheTwoKings | Startseiten-Vorschau', 'TheTwoKings | Homepage preview', 'TheTwoKings｜首页预览'],
  skip: ['Zum Inhalt', 'Skip to content', '跳转到正文'],
  nav: ['Hauptnavigation', 'Main navigation', '主导航'],
  language: ['Sprache', 'Language', '语言'],
  game: ['Das Wehr & Samis Dino-Insel', 'Das Wehr & Sami’s Dino Island', '水坝与 Sami 的恐龙岛'],
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
  areaLearnHint: ['Deutsch mit Bildern', 'German with pictures', '看图学德语'],
  areaWorkshopHint: ['PC-Werkstatt und KingLab', 'PC Workshop and KingLab', '电脑工作室和 KingLab'],
  prototype: ['Prototyp', 'Prototype', '原型'],
  gameText: [
    'Fahre mit der Wehrfähre zur Dino-Insel, baue mit Holz und erkunde auf der Vulkaninsel den Weg zur Eisenhöhle.',
    'Take the ferry to Dino Island, build with timber and explore the route to the iron cave on Volcano Island.',
    '乘水坝渡船前往恐龙岛，用木材搭建，并在火山岛探索通往铁矿洞的道路。',
  ],
  gameNext: [
    'Vor der Webfreigabe: Browserexport erstellen, Ladezeit, Steuerung, Ton und Speichern testen und die Rechte an den Spielinhalten klären.',
    'Before the web release: export the web build, test loading, controls, audio and saves, and clear the rights to the game assets.',
    '网页版发布前：导出网页版本，测试加载时间、操作、声音和存档，并确认游戏素材的使用权。',
  ],
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
  learn: ['Training öffnen', 'Start practising', '开始练习'],
  picture: ['图', 'Image', '图片'],
  games: ['Sams Spielecke', 'Sam’s Games Corner', 'Sam 的游戏角'],
  browserGames: ['Diese Spiele kannst du direkt im Browser öffnen.', 'Open these games directly in your browser.', '这些游戏可以直接在浏览器中打开。'],
  gameVersion: ['Windows-Prototyp · V30', 'Windows prototype · V30', 'Windows 原型 · V30'],
  workshop: ['Werkstatt & Experimente', 'Workshop & experiments', '工作室与实验'],
  archery: ['Wüstenbogen', 'Desert Archery', '沙漠射箭'],
  pirates: ['Piratenjagd (Testszene)', 'Pirate Hunt (demo)', '海盗冒险（试玩）'],
  classics: ['Klassische Spiele', 'Classic games', '经典游戏'],
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
  comments: ['Kommentare', 'Comments', '评论'],
  commentsEmpty: ['Die Kommentarfunktion ist in Vorbereitung.', 'Comments are in development.', '评论功能正在准备中。'],
  commentsNext: [
    'Als Nächstes: Moderation, Spam-Schutz und Meldungen testen.',
    'Next: test moderation, spam protection and reporting.',
    '下一步：测试评论审核、防垃圾信息和举报功能。',
  ],
  stats: ['Seitenaufrufe', 'Page views', '页面浏览量'],
  statsEmpty: ['Die Messung hat noch nicht begonnen.', 'Counting has not started yet.', '尚未开始统计。'],
  statsNext: [
    'Geplant: heute, letzte 7 Tage und seit Messbeginn.',
    'Planned: today, last 7 days and since counting began.',
    '计划显示：今天、过去 7 天及开始统计以来的浏览量。',
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

function showLanguage(language) {
  const index = languages.indexOf(language);
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  document.title = copy.title[index];
  for (const node of textNodes) node.textContent = copy[node.dataset.copy][index];
  for (const node of labelledNodes) node.setAttribute('aria-label', copy[node.dataset.label][index]);
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  for (const link of languageLinks) {
    const target = new URL(link.href);
    target.searchParams.set('lang', language);
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
