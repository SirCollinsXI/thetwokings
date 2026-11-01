/* TheTwoKings multilingual comic/game UI. Does not alter comic artwork or physics. */
(()=>{'use strict';
const lines=[["← Zur Comic-Welt","← Back to comics","← 返回漫画世界"],["PC-Werkstatt ↗","PC Workshop ↗","电脑工作室 ↗"],["SAM & PIET / BAND 1","SAM & PIET / VOL. 1","SAM 与 PIET / 第一卷"],["Ein Sturz.","One fall.","一次坠落。"],["Ein riesiges","One incredible","一段非凡的"],["Abenteuer.","adventure.","冒险。"],["Von einer Planke mitten hinein in eine unglaubliche Welt. Lies den Auftakt von Sam & Piet — mit Piraten, einer Riesenschildkröte und einer Freundschaft, die aufs offene Meer hinausführt.","From a pirate plank into an unbelievable world. Discover Sam & Piet, a giant turtle and a friendship sailing into the unknown.","从海盗船的木板坠入不可思议的世界。阅读 Sam 与 Piet 的冒险开篇：海盗、巨型海龟与海上的友谊。"],["Kapitel 1 · 15 fertige Bildseiten.","Chapter 1 · 15 completed illustrated pages.","第一章 · 15页已完成的漫画。"],["Eine Brückenseite ist noch in Arbeit und im Leser gekennzeichnet. Die vier bereits fertigen Seiten bis zum Kapitelabschluss sind trotzdem zugänglich.","One transition page is still in progress and marked in the reader. The four later finished pages are still available.","仍有一页衔接漫画正在制作，阅读器中已明确标注。后续四页已完成画面可以查看。"],["← Zurück","← Previous","← 上一页"],["Weiter →","Next →","下一页 →"],["Comic-Seitensteuerung","Comic page controls","漫画翻页控制"],["Vorherige Seite","Previous page","上一页"],["Nächste Seite","Next page","下一页"],["Comicseite auswählen","Select comic page","选择漫画页"],["Comicseite 1: Sam auf der Planke und der Sturz in die Riesenschildkröte","Comic page 1: Sam on the plank and the fall into the giant turtle","漫画第1页：Sam站在木板上，跌入巨型海龟"],["Zum Vergrößern auf die Bildseite klicken. Blättern mit den Pfeiltasten oder den Buttons. Der Leser verwendet die vorhandenen freigegebenen Seiten in ihrer Reihenfolge; geteilte Seiten 06A/B und 09A/B sind vollständig enthalten.","Tap the comic image to zoom. Use the arrows or buttons to turn pages. All available approved pages, including split pages 06A/B and 09A/B, are shown in order.","点击漫画放大。使用方向键或按钮翻页。已发布画面按原顺序显示，包括06A/B和09A/B拆分页。"],["Mehr aus unserer Welt ↗","Explore more ↗","探索更多 ↗"],["Hier fehlt noch eine Brücke.","One transition is still missing.","仍有一页衔接内容。"],["Die Landung und der Übergang zur Hütte werden noch überarbeitet. Die folgenden vier Bildseiten sind bereits fertig und hier schon lesbar.","The landing and transition to the hut are being revised. The following four illustrated pages are already available.","登陆场景及到达小屋的过渡仍在修改，后面四页已经完成，可以继续浏览。"],["Mit „Weiter“ gelangst du zur Karte in der Hütte.","Select “Next” to continue to the map in the hut.","点击“下一页”，继续阅读小屋里的地图。"],["Brückenseite in Arbeit","Transition page in progress","过渡页制作中"],["Offene Brückenseite · kein fertiges Artwork","Transition page pending · artwork unfinished","过渡页尚未完成 · 暂无画面"],["Storyseite","Story page","故事页"],["Storyseite 01: Sam auf der Planke","Story page 01: Sam on the plank","故事第01页：Sam站在木板上"],["Sam auf der Planke","Sam on the plank","Sam站在木板上"],["Die Bauchwelt","Inside the giant turtle","巨型海龟内部"],["Planke und oranges Tuch","Plank and orange cloth","木板与橙色布料"],["Flucht durch das Maul","Escape through the mouth","从巨口逃脱"],["Sam auf dem Meer","Sam at sea","海上的Sam"],["Floß und Signal","Raft and signal","木筏与求救信号"],["Piet entdeckt das Signal","Piet spots the signal","Piet发现信号"],["Wiedersehen auf dem Meer","Reunion at sea","海上重逢"],["Piet holt Hilfe","Piet gets help","Piet寻求帮助"],["Klaus Störtebeker hilft","Klaus Störtebeker helps","Klaus Störtebeker前来帮忙"],["Die geheimnisvolle Insel","The mysterious island","神秘岛屿"],["Die geheimnisvolle Karte","The mysterious map","神秘地图"],["Proviant und Feuerholz","Supplies and firewood","补给与柴火"],["Bananen und Kokosmilch","Bananas and coconut milk","香蕉与椰奶"],["Die Nacht auf der Insel — Kapitelabschluss","Night on the island — chapter ending","岛上的夜晚——章节结尾"],["SPIELLABOR / NEUE 2,5D-FASSUNG","GAME LAB / NEW 2.5D VERSION","游戏实验室 / 全新2.5D版"],["Ton aus","Sound off","关闭声音"],["Ton an","Sound on","开启声音"],["Vollbild ↗","Fullscreen ↗","全屏 ↗"],["Piratenjagd. Fünf Netze mit Tasten 1 bis 5 auslösen. P pausiert.","Pirate Hunt. Use keys 1–5 to deploy nets. P pauses.","海盗狩猎：按数字键1–5放下渔网，按P暂停。"],["FÄNGE","CATCHES","捕获"],["AUF DEM KANONENDECK","ON THE CANNON DECK","大炮甲板"],["Bereit, Kapitän?","Ready, Captain?","准备好了吗，船长？"],["ZEIT","TIME","时间"],["SAM & PIET / PIRATEN-SPIELLABOR","SAM & PIET / PIRATE GAME LAB","SAM与PIET / 海盗游戏实验室"],["AN DECK!","ON DECK!","登船！"],["Der größte blinde Passagier aller Zeiten.","The biggest stowaway ever.","史上最大的偷渡客。"],["Fünf Netze. Drei Fänge. Dein Timing.","Five nets. Three catches. Your timing.","五张网，三次捕获，考验时机。"],["Vorausschauen:","Think ahead:","提前预判："],["Der Dino läuft weiter, während dein Netz fällt.","The dinosaur keeps moving while your net falls.","网落下时，恐龙仍在奔跑。"],["Den Rumpf treffen:","Aim for the body:","瞄准身体："],["Schwanz und Fußspitzen zählen nicht als Fang.","Tail and toes do not count as a catch.","尾巴和脚尖不算有效捕获。"],["Antippen oder 1–5:","Tap or use 1–5:","点击或按1–5："],["Jedes Netz wird einzeln ausgelöst.","Each net is deployed separately.","每张网单独发射。"],["Spiel wird geladen …","Loading game …","游戏加载中……"],["Spielbare neue Testszene · 3 Fänge · keine Online-Bestenliste","Playable prototype · 3 catches · no online leaderboard","可玩测试版 · 3次捕获 · 无在线排行榜"],["ALLE MANN DURCHATMEN.","CREW, TAKE A BREATH.","全体船员稍作休息。"],["Kurze Pause.","Short break.","暂停一下。"],["Deine Zeit wartet mit dir.","Your timer is paused too.","计时器也已暂停。"],["Weiter aufs Deck ↗","Back to deck ↗","返回甲板 ↗"],["Neu beginnen","Start over","重新开始"],["DIE CREW KANN DURCHATMEN.","THE CREW CAN RELAX.","船员们可以放心了。"],["Deck gesichert!","Deck secured!","甲板安全了！"],["Noch eine Runde ↗","Play again ↗","再来一局 ↗"],["Zur Spiele-Welt","Back to games","返回游戏世界"],["Netze auslösen","Deploy nets","放下渔网"],["Netz","Net","渔网"],["Trefferzone zeigen","Show hit zone","显示命中区域"],["Trefferzone ausblenden","Hide hit zone","隐藏命中区域"],["Pause","Pause","暂停"],["Auf dem Handy spielt es sich im Querformat am besten.","Landscape mode is best on phones.","手机横屏体验更好。"],["Was wir in dieser Szene testen","What this prototype tests","测试内容"],["Neue Bildwelt im Piratenstil, animierter Dino, gezielter Netzfang, Trefferfeedback und Touch-/Tastatursteuerung. Die grüne Zone zeigt exakt den fangbaren Rumpf. Mindestens 65 % dieser Zone müssen beim Durchqueren von der Netzöffnung überdeckt sein. Die Auswertung berücksichtigt die Bewegung zwischen zwei Bildern; Nachladen dauert pro Netz 1,2 Sekunden. Dies ist eine kurze Testszene, noch kein fertiger Kapitel- oder Zehn-Level-Modus.","Pirate setting, animated dinosaur, timed nets, hit feedback, touch and keyboard control. The green zone marks the catchable body. The net opening must cover at least 65% of this zone; movement between frames is included. Each net reloads in 1.2 seconds. This is a short prototype, not a finished ten-level game.","本测试版包含海盗风场景、恐龙动画、定时落网、命中反馈及触屏/键盘操作。绿色区域是可捕获的身体部位，网口覆盖率至少需达到65%。判定会考虑帧间运动，每张网的冷却时间为1.2秒。当前仅为短场景原型，尚非完整十关游戏。"],["Grafiken wurden neu mit KI erstellt und als Spielassets eingebunden. Phaser 4.2.1 (MIT) übernimmt Darstellung, Animation und Audio. Fangregeln sind separat implementiert und geprüft. Keine Datenbankverbindung.","Graphics are AI-generated game assets. Phaser 4.2.1 (MIT) handles graphics, animation and audio. Catch rules are separate and tested. No database connection.","画面素材由AI生成。Phaser 4.2.1（MIT许可）负责渲染、动画和音频；捕获规则独立实现并测试。不连接数据库。"],["Spiel konnte nicht geladen werden","Unable to load the game","游戏加载失败"],["Bitte Seite erneut laden.","Please reload the page.","请刷新页面。"],["Eine Spieldatei fehlt — bitte neu laden","A game asset is missing — please reload","缺少游戏资源，请刷新"],["Leinen los — spielen ↗","Set sail — play ↗","起航，开始游戏 ↗"],["Fang den Rumpf","Catch the body","捕获身体"],["VORAUSSCHAUEN. LOSLASSEN.","ANTICIPATE. DROP.","提前预判，放网！"],["Crew lädt nach","Crew is reloading","船员正在重新装填"],["Netz auslösen","Deploy net","放下渔网"],["KNAPP DANEBEN — RUMPF ZENTRIEREN","CLOSE MISS — AIM AT BODY","差一点——瞄准身体"],["DIE CREW LÄDT NACH","THE CREW RELOADS","船员正在重新装填"],["Die Crew hat es geschafft!","The crew did it!","船员成功了！"],["Nächster Ausbruch","Next escape","下一轮逃脱"],["DECK GESICHERT!","DECK SECURED!","甲板已确保安全！"],["SAUBERER FANG!","CLEAN CATCH!","捕获成功！"],["Vollbild wird von diesem Browser nicht unterstützt.","Fullscreen is not supported in this browser.","此浏览器不支持全屏。"],["Wähle ein Abenteuer aus. Dein Fortschritt wird für den aktuellen Browser-Tab gespeichert.","Choose an adventure. Your progress is saved in this browser tab.","选择一段冒险。进度仅在当前浏览器标签页中保存。"],["Session-Fortschritt","Session progress","本次游戏进度"],["0 / 2 abgeschlossen","0 / 2 completed","0 / 2 已完成"],["Spieleauswahl","Choose a game","游戏选择"],["Noch nicht gespielt","Not played yet","尚未玩过"],["In dieser Session gestartet","Started this session","本次已开始"],["Abgeschlossen","Completed","已完成"],["Zuletzt gespielt","Last played","最近玩过"],["Session-Bestzeit: –","Session best: –","本次最佳：–"],["Session-Fortschritt zurücksetzen","Reset session progress","重置本次进度"],["Präzisionsschießen im Wüstensand mit Wind und Böen.","Precision archery in desert winds and gusts.","在沙漠阵风中挑战精准射箭。"],["Fange den ausgebrochenen T. rex unter Deck.","Catch the escaped T. rex below deck.","在甲板下捕获逃脱的霸王龙。"],["Starte dein erstes Abenteuer.","Start your first adventure.","开始你的第一场冒险吧。"],["🏆 Session-Kampagne abgeschlossen!","🏆 Session campaign complete!","🏆 本次冒险全部完成！"],["Ein Abenteuer geschafft. Eines wartet noch.","One adventure complete. One remains.","完成一场冒险，还有一场等待你。"],["Impressum","Legal notice","法律声明"],["Datenschutz","Privacy","隐私政策"],["Bestenlisten-Regeln","Leaderboard rules","排行榜规则"],["Wüsten-Bogen","Desert Bow","沙漠射箭"],["Bogenschießspiel","Archery game","射箭游戏"],["Treffer","Hits","命中"],["Pfeile","Arrows","箭矢"],["Zeit","Time","时间"],["Wind: Still (0)","Wind: Calm (0)","风：无风（0）"],["Linke Hälfte ziehen und loslassen. Wind verändert Flugweite und Kurve.","Drag from the left half and release. Wind changes arrow distance and trajectory.","从左半屏拖动并松开。风会改变箭的飞行距离和轨迹。"],["Wind-Simulation mit Böen und Flugbahn-Vorschau.","Wind simulation with gusts and trajectory preview.","模拟阵风并预览箭矢轨迹。"],["10 Level mit jeweils 3 Treffern","10 levels with 3 hits each","10关，每关命中3次"],["Windstufen von 0 bis 10, nach jeder Runde neu","Wind strength 0–10, changes each round","风力0–10级，每局变化"],["Ab Level 5: 10 Pfeile pro Runde. Danach Ziel fixiert und Wind pro Schuss.","From level 5: 10 arrows per round. Then the target is fixed and wind changes per shot.","从第5关开始：每局10支箭。之后靶位固定，每箭风向变化。"],["Spiel starten","Start game","开始游戏"],["Zum Game Hub","Back to Game Hub","返回游戏中心"],["Rechtliche Informationen","Legal information","法律信息"],["Kampagne geschafft!","Campaign completed!","挑战全部完成！"],["Zeichne deinen Avatar und speichere deinen Lauf. Name, Kommentar und Avatar werden öffentlich angezeigt.","Draw your avatar and save your run. Your name, comment and avatar will be public.","绘制头像并保存成绩。名称、评论和头像将公开显示。"],["Öffentliche Bestenliste:","Public leaderboard:","公开排行榜："],["Name, Kommentar, Avatar und Spielzeit werden öffentlich angezeigt. Verwende bitte ein Pseudonym und keine persönlichen Daten über dich oder andere.","Name, comment, avatar and play time will be public. Use a nickname and do not include personal data about yourself or others.","名称、评论、头像和游戏时间会公开显示。请使用昵称，勿填写自己或他人的个人信息。"],["Ich möchte meinen Eintrag öffentlich speichern und habe die","I agree to publish my entry and have read the","我同意公开保存成绩，且已阅读"],["Datenschutzerklärung","privacy notice","隐私声明"],["gelesen.",".","。"],["Leeren","Clear","清空"],["Score speichern","Save score","保存成绩"],["Neuer Lauf","New run","重新挑战"],["Ohne Speichern zum Game Hub","Back to Game Hub without saving","不保存，返回游戏中心"],["Gespeichert!","Saved!","已保存！"],["Dein Name (max. 15 Zeichen)","Your name (max. 15 characters)","你的名称（最多15字）"],["Möchtest du der Welt etwas sagen?","Anything you want to say?","想说点什么？"],["Finale Zeit:","Final time:","最终时间："],["Keine Verbindung zur Bestenliste.","Cannot connect to leaderboard.","无法连接排行榜。"],["Die Online-Bestenliste konnte nicht geladen werden.","Unable to load the online leaderboard.","无法加载在线排行榜。"],["Bitte bestätige zuerst die freiwillige Veröffentlichung.","Please consent to public posting first.","请先同意公开发布。"],["Wird gespeichert …","Saving …","正在保存……"],["Der Score konnte nicht gespeichert werden. Bitte erneut versuchen.","Could not save the score. Please try again.","保存成绩失败，请重试。"],["Level 1 / 10","Level 1 / 10","第1关 / 共10关"],["Ausbrüche","Escapes","逃脱次数"],["Netze an Deck","Nets on deck","甲板上的渔网"],["Fehlserie:","Miss streak:","连续失误："],["· Level-Fehler:","· Level misses:","· 本关失误："],["🔊 Sound","🔊 Sound","🔊 声音"],["📳 Haptik","📳 Haptics","📳 触觉反馈"],["· Die Piratencrew bedient Netze und Gitterkiste. Graublaue Schwergewichte fallen am schnellsten.","· The pirate crew controls nets and the cage. Heavy grey-blue cages drop fastest.","· 海盗船员操控渔网与铁笼。灰蓝色重型笼子下落最快。"],["T. rex Piratenjagd","T. rex Pirate Hunt","霸王龙海盗狩猎"],["V16 · CAGED T. REX · SANDBOX SAFE · 06.08.2026","V16 · CAGED T. REX · TEST VERSION · 06 AUG 2026","V16 · 霸王龙铁笼版 · 测试版本 · 2026年8月6日"],["Ein Tyrannosaurus verwüstet das Kanonendeck. Die beiden Crewfiguren stehen ab Level 1 sichtbar links und rechts auf dem Deck.","A T. rex wreaks havoc on the cannon deck. Two crew members are visible on either side from level 1.","霸王龙在炮甲板上横冲直撞。从第一关起，甲板左右两侧都能看到船员。"],["Übrige Netze bleiben nach einem Fang an der Decke.","Unused nets remain overhead after a catch.","捕获后未使用的渔网会留在顶棚。"],["Erst bei leerem Bestand installiert die Crew fünf neue Netze.","The crew reloads five nets only once all are used.","只有渔网用完后，船员才安装五张新网。"],["Nach drei Fehlschüssen werden beim nächsten Nachladen Großnetze montiert.","After three misses, large nets are used at the next reload.","连续失误三次后，下次补给将使用大型渔网。"],["Nach 15 Fehlschüssen im aktuellen Level ist der T. rex erschöpft.","After 15 misses in the current level, the T. rex becomes tired.","本关累计失误15次后，霸王龙会疲惫。"],["Zwei Piratenfiguren transportieren im Finale die verriegelte Gitterkiste.","Two crew members carry the locked cage in the finale.","最后两名海盗船员会搬走锁好的铁笼。"],["Laufzeit wird geprüft …","Checking runtime …","正在检查运行环境……"],["Jagd starten","Start hunt","开始狩猎"],["T. rex gesichert","T. rex captured","霸王龙已捕获"],["Die Piratencrew hat die verriegelte Gitterkiste aus dem Kanonendeck gebracht. Zeichne einen Avatar und speichere die Zeit.","The pirate crew secured the cage. Draw an avatar and save your time.","海盗船员成功将霸王龙锁入铁笼。现在绘制头像并保存成绩。"],["Speichern","Save","保存"],["Gerät drehen","Rotate device","旋转设备"],["Bitte ins Querformat drehen. Danach kannst du im Startfenster scrollen und „Jagd starten“ wählen.","Rotate to landscape. Then scroll the start panel and choose “Start hunt”.","请将设备旋转为横屏。然后滚动开始窗口并选择“开始狩猎”。"],["Spiel wird geladen","Loading game","游戏加载中"]];
const extra=[["T. REX IST ERSCHÖPFT!","T. REX IS EXHAUSTED!","霸王龙已经筋疲力尽！"],["Session-Speicher nicht verfügbar. Einstellungen gelten nur bis zum Neuladen der Seite.","Session storage unavailable. Settings last only until reload.","会话存储不可用，设置仅在刷新前有效。"],["Audio nicht verfügbar","Audio unavailable","音频不可用"],["Supabase nicht verfügbar. Lokaler Fallback wird verwendet.","Online service unavailable. Using local fallback.","在线服务不可用，改用本地模式。"],["Avatar zu groß.","Avatar too large.","头像文件过大。"],["Noch keine Online-Einträge vorhanden.","No online entries yet.","暂无在线排行榜记录。"],["Der Avatar ist ungültig oder größer als 100 KB.","Avatar is invalid or exceeds 100 KB.","头像无效或超过100KB。"],["Die Kampagne wurde nicht vollständig abgeschlossen.","Campaign not fully completed.","尚未完成全部关卡。"],["Der Avatar ist ungültig oder zu groß.","Avatar invalid or too large.","头像无效或过大。"],["Der Score liegt außerhalb des zulässigen Bereichs.","Score is outside the permitted range.","成绩超出允许范围。"],["Bitte bestätige zuerst die freiwillige Veröffentlichung.","Please agree to public posting first.","请先同意自愿公开发布。"]];
const dict=new Map(lines.map(([de,en,zh])=>[de,{en,zh}]));
for(const [de,en,zh] of extra)dict.set(de,{en,zh});
let lang='de';
const allowed=['de','en','zh'],original=new WeakMap(),last=new WeakMap(),attributes=new WeakMap();
const locale=(v)=>v==='zh'?'zh-CN':v;
function choose(){const q=new URLSearchParams(location.search).get('lang');if(allowed.includes(q))return q;
 try{const p=sessionStorage.getItem('ttk-language');if(allowed.includes(p))return p;}catch(_){}
 const b=(navigator.language||'de').toLowerCase();return b.startsWith('zh')?'zh':b.startsWith('en')?'en':'de';}
function dynamic(s){
 if(lang==='de')return null;
 const zh=lang==='zh';
 let m=s.match(/^Storyseite (\d+[A-Z]?): (.+)$/);
 if(m)return (zh?'故事页 ':'Story page ')+m[1]+': '+(dict.get(m[2])?.[lang]||m[2]);
 m=s.match(/^Storyseite (\d+[A-Z]?)$/);
 if(m)return (zh?'故事页 ':'Story page ')+m[1];
 m=s.match(/^(\d+) \/ 2 abgeschlossen$/);if(m)return m[1]+(zh?' / 2 已完成':' / 2 completed');
 m=s.match(/^Session-Bestzeit: (.*)$/);if(m)return (zh?'本次最佳：':'Session best: ')+m[1];
 m=s.match(/^Wind: (Still|Rückenwind|Gegenwind) \((\d+)\)$/);
 if(m)return (zh?'风：':'Wind: ')+({"Still":zh?'无风':'Calm',"Rückenwind":zh?'顺风':'Tailwind',"Gegenwind":zh?'逆风':'Headwind'}[m[1]])+' ('+m[2]+')';
 m=s.match(/^Netz (\d+) auslösen$/);if(m)return (zh?'放下第':'Deploy net ')+m[1]+(zh?'张网':'');
 m=s.match(/^Drei Fänge in (.+)\.$/);if(m)return zh?'三次捕获完成，用时 '+m[1]+'。':'Three catches in '+m[1]+'.';
 m=s.match(/^(\d+) Netze ausgelöst · (\d+) Streifer · (\d+) % Fangquote$/);
 if(m)return zh?m[1]+' 张网 · '+m[2]+' 次擦边 · '+m[3]+'% 捕获率':m[1]+' nets deployed · '+m[2]+' grazes · '+m[3]+'% catch rate';
 m=s.match(/^Level (\d+) \/ (\d+)$/);
 if(m)return zh?'第'+m[1]+'关 / 共'+m[2]+'关':'Level '+m[1]+' / '+m[2];
 m=s.match(/^(Finale Zeit:|Gespeichert:) (.*)$/);if(m)return (m[1]==='Gespeichert:'?(zh?'已保存：':'Saved: '):(zh?'最终时间：':'Final time: '))+m[2];
 return null;
}
function translation(raw){
 if(lang==='de')return raw;
 let s=raw.trim();if(!s)return raw;
 const translation=dict.get(s)?.[lang]??dynamic(s);
 if(translation==null)return raw;
 return (raw.match(/^\s*/)?.[0]||'')+translation+(raw.match(/\s*$/)?.[0]||'');
}
function visit(n){
 if(!n.parentElement||n.parentElement.closest('script,style,#language-tools'))return;
 let de=original.get(n);const current=n.nodeValue;
 if(de===undefined||(last.has(n)&&last.get(n)!==current)){de=current;original.set(n,de);}
 const out=translation(de);
 if(current!==out)n.nodeValue=out;
 last.set(n,out);
}
function attrsTranslate(e){
 if(e.closest('#language-tools'))return;
 let saved=attributes.get(e);if(!saved){saved={};attributes.set(e,saved);}
 for(const key of ['aria-label','placeholder','title','alt']){
  if(!e.hasAttribute(key))continue;
  const val=e.getAttribute(key);
  if(!(key in saved)||saved['last-'+key]!==undefined&&val!==saved['last-'+key])saved[key]=val;
  const next=translation(saved[key]);
  if(next!==val)e.setAttribute(key,next);
  saved['last-'+key]=next;
 }
}
let working=false;
function walk(root){
 if(!root)return;
 if(root.nodeType===3){visit(root);return;}
 if(root.nodeType!==1)return;
 const el=root;
 if(el.matches('script,style,#language-tools')||el.closest('#language-tools'))return;
 attrsTranslate(el);
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
 let n;while((n=walker.nextNode()))visit(n);
 for(const a of el.querySelectorAll('[aria-label],[placeholder],[title],[alt]'))attrsTranslate(a);
}
function apply(){
 if(working)return;working=true;
 try{
  walk(document.body);
  document.documentElement.lang=locale(lang);
  document.querySelectorAll('[data-set-language]').forEach(b=>{const yes=b.dataset.setLanguage===lang;b.setAttribute('aria-pressed',String(yes));b.classList.toggle('selected',yes);});
  const isComic=document.body.dataset.playI18n==='comic';
  if(isComic){const msg=document.getElementById('comic-language-notice');
   if(msg)msg.textContent=lang==='zh'?'阅读器界面已翻译；漫画插画中的对话仍为德语原版。':lang==='en'?'The reader interface is translated; dialogue inside the artwork remains in the original German.':'Die Bedienoberfläche ist übersetzt; die Sprechblasen im Comic bleiben im deutschen Original.';}
  for(const a of document.querySelectorAll('a[href$=".html"],a[href*=".html#"],a[href*=".html?"]')){
   let href=a.getAttribute('href');
   if(!href||/^(?:https?:|mailto:)/i.test(href))continue;
   const dest=new URL(href,location.href);
   if(dest.origin!==location.origin)continue;
   dest.searchParams.set('lang',lang);
   const updated=dest.pathname.split('/').pop()+dest.search+dest.hash;
   if(href!==updated)a.setAttribute('href',updated);
  }
  const oldTitle=document.title;
  const titleMap={comic:{en:'Sam & Piet — Comic Preview | TheTwoKings',zh:'Sam与Piet — 漫画试读 | TheTwoKings'},
    pirate:{en:'T. rex — On Deck! | TheTwoKings',zh:'霸王龙海盗狩猎 | TheTwoKings'},
    bow:{en:'Desert Bow | TheTwoKings',zh:'沙漠射箭 | TheTwoKings'},
    trex:{en:'T. rex Pirate Hunt | TheTwoKings',zh:'霸王龙海盗狩猎 | TheTwoKings'},
    hub:{en:'TheTwoKings — Game Hub',zh:'TheTwoKings — 游戏中心'}};
  const titles=titleMap[document.body.dataset.playI18n];
  if(titles)document.title=lang==='de'?(document.titleDE||oldTitle):titles[lang];
 }finally{working=false;}
}
function setLanguage(v,manual=false){
 if(!allowed.includes(v))return;lang=v;
 try{sessionStorage.setItem('ttk-language',v)}catch(_){}
 if(manual){const u=new URL(location.href);u.searchParams.set('lang',v);history.replaceState(null,'',u.pathname+u.search+u.hash);}
 apply();
}
document.titleDE=document.title;
document.querySelectorAll('[data-set-language]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.setLanguage,true)));
const observer=new MutationObserver(changes=>{
 if(working)return;working=true;
 try{for(const change of changes){
  if(change.type==='characterData')visit(change.target);
  else if(change.type==='childList')for(const n of change.addedNodes)walk(n);
 }}finally{working=false;}
});
setLanguage(choose());
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
})();