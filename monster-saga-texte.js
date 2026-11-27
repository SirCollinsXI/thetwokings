'use strict';
(() => {
  const interfaceText = [
    ["Die große Monster-Saga","The Great Monster Saga","怪物传奇"],
    ["Das Herz der Abenteuer","The Heart of Adventure","冒险之心"],
    ["Monster-Kompendium · 32 Seiten","Monster compendium · 32 pages","怪物图鉴 · 共 32 页"],
    ["Öffne das Archiv des Professors, lerne die Monster kennen und folge ihren Spuren durch zwölf Kapitel.","Open the Professor’s archive, meet its monsters and follow their trail through twelve chapters.","打开教授的档案，认识怪物们，跟随它们的足迹读完十二章故事。"],
    ["Kompendium lesen →","Read the compendium →","阅读图鉴 →"],
    ["Die Bildseiten dieses Kompendiums sind auf Deutsch.","The illustrated pages of this compendium are in German.","本图鉴插画中的文字为德语。"],
    ["Seite auswählen","Choose a page","选择页面"],
    ["Seitenwahl","Page navigation","翻页导航"],
    ["Zurückblättern","Previous page","上一页"],
    ["Weiterblättern","Next page","下一页"],
    ["Zum Anfang des Buchs","Book opening","卷首"],
    ["Monster und Helden","Monsters and heroes","怪物与英雄"],
    ["Rätsel und Pläne","Puzzles and plans","谜题与计划"],
    ["Die große Reise","The great journey","伟大的旅程"],
    ["Epilog und Extras","Epilogue and extras","尾声与附录"],
    ["Öffne eine Bildseite aus dem Inhaltsverzeichnis.","Open an illustrated page from the contents below.","从下方目录打开插画页面。"]
  ];
  const pageTitles = [
    ["Titelbild","Cover","封面"],
    ["Titel und Impressum","Title and credits","扉页与署名"],
    ["Bevor du das Archiv öffnest …","Before you open the archive …","打开档案之前……"],
    ["Wegweiser durch das Professor-Archiv","A guide to the Professor’s archive","教授档案馆导览"],
    ["Inhaltsverzeichnis","Contents","目录"],
    ["Monster-Stammbaum","Monster family tree","怪物家族谱"],
    ["Das Auge aus der Schatzkammer","The eye from the treasure chamber","宝藏室之眼"],
    ["Der Mondhai erhebt sich","The Moon Shark rises","月鲨崛起"],
    ["Der Verschlinger der Geschichten","The Devourer of Stories","故事吞噬者"],
    ["Der Skorpion-Schatten","The Scorpion Shadow","蝎影"],
    ["Lumius","Lumius","卢米乌斯"],
    ["Die letzte Allianz der Freunde","The friends’ final alliance","伙伴们的最后联盟"],
    ["Charakter-Lexikon","Character guide","角色图鉴"],
    ["Titan-Steve","Titan Steve","泰坦史蒂夫"],
    ["Der Professor","The Professor","教授"],
    ["Das verschwundene Herzfragment","The missing heart fragment","消失的心之碎片"],
    ["Plan Nummer 47","Plan number 47","第47号计划"],
    ["Das Monster der Tiefe","The monster of the deep","深海巨怪"],
    ["Der Drachenkrieg","The dragon war","巨龙之战"],
    ["Die Lavawelt","The lava world","熔岩世界"],
    ["Der Held in den Tentakeln","The hero in the tentacles","被触手缠住的英雄"],
    ["Die Freunde kommen","The friends arrive","伙伴们来了"],
    ["Der Fall der Lavaform","The fall of the lava form","熔岩形态的陨落"],
    ["Die Titanenprüfung","The trial of the titans","泰坦的试炼"],
    ["Der Mondhai erhebt sich","The Moon Shark rises","月鲨崛起"],
    ["Der Verschlinger der Geschichten","The Devourer of Stories","故事吞噬者"],
    ["Die Schlacht der Erinnerungen","The battle of memories","记忆之战"],
    ["Im Herzen der Dunkelheit","In the heart of darkness","黑暗之心"],
    ["Das Herz kehrt zurück","The heart returns","圣心归来"],
    ["Das Fest der verbundenen Welten","The festival of the united worlds","相连世界的庆典"],
    ["Die Lösung des verschwundenen Herzfragments","The missing heart fragment: solution","消失的心之碎片谜题答案"],
    ["Rückseite","Back cover","封底"]
  ];
  const options = pageTitles.map((row, index) => row.map(title =>
    String(index + 1).padStart(2, '0') + ' · ' + title
  ));
  window.samWorkshopCopy = (window.samWorkshopCopy || []).concat(interfaceText, pageTitles, options);
})();
