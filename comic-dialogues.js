/* TheTwoKings — Sam & Piet Dialogue Deck
   Original comic artwork is unchanged. Editorial data lives in comic-dialogues.json. */
(()=>{'use strict';
const deck=document.getElementById('dialogue-deck');
if(!deck)return;
const $=id=>document.getElementById(id);
const locales={
 de:{head:"DIALOG & ÜBERSETZUNG",sub:"Originalgrafik auf Deutsch · mehrsprachige Lesefassung",chapter:"KAPITEL 01 · SEITE",source:"Originalsprache: Deutsch",verified:"Originaltext aus dem Bild übertragen",pilot:"Übersetzungen: redaktionelle Erstfassung",scene:"SZENENKONTEXT",pending:"Diese Seite wird noch übersetzt.",pendingNote:"Die Originalzeichnung ist vollständig lesbar. Sprechblasen werden vor einer Übersetzung sorgfältig aus dem Bild übertragen.",error:"Die Dialogdaten konnten nicht geladen werden.",errorNote:"Bitte die Seite neu laden. Das Originalcomic ist weiterhin verfügbar.",panel:"Panel",thought:"Gedanke",credit:"Die Comicbilder bleiben unverändert. Übersetzungen sind redaktionelle Lesefassungen, keine Bearbeitung der Originalgrafik.",gap:"Brückenseite"},
 en:{head:"DIALOGUE & TRANSLATION",sub:"Original German artwork · international reading edition",chapter:"CHAPTER 01 · PAGE",source:"Original language: German",verified:"Dialogue transcribed from original artwork",pilot:"Translations: initial editorial draft",scene:"SCENE CONTEXT",pending:"Translation for this page is coming.",pendingNote:"You can still read the original artwork. We transcribe every speech bubble before translating it.",error:"Dialogue data could not be loaded.",errorNote:"Please refresh. The original comic is still available.",panel:"Panel",thought:"Thought",credit:"The comic artwork remains unchanged. Translations are editorial reading editions, not modifications of the illustrations.",gap:"Transition page"},
 zh:{head:"对话与翻译",sub:"德语原版漫画 · 国际阅读版",chapter:"第一章 · 第",source:"原作语言：德语",verified:"对话已从原版画面校对转录",pilot:"译文：编辑初稿",scene:"场景简介",pending:"本页翻译正在制作中。",pendingNote:"你仍可阅读原版漫画。我们会先核对每个对话气泡，再进行翻译。",error:"无法加载对话数据。",errorNote:"请刷新页面。原版漫画仍可正常阅读。",panel:"分镜",thought:"心声",credit:"漫画原图保持不变。译文为编辑提供的阅读版本，不修改原作画面。",gap:"过渡页"}
};
let content=null,page='01',language='de',failed=false;
const getLang=()=>{const html=document.documentElement.lang.toLowerCase();return html.startsWith('zh')?'zh':html.startsWith('en')?'en':'de';};
function el(tag,className,txt){const node=document.createElement(tag);if(className)node.className=className;if(txt!==undefined)node.textContent=txt;return node;}
function currentPage(){const v=Number(document.getElementById('page-select')?.value||0);const list=(typeof pages!=='undefined'&&Array.isArray(pages))?pages:[];return list[v]?.[0]||'01';}
function lineElement(item,index,lang){
 const li=el('li','dd-line'+(item.type==='thought'?' dd-thought':''));
 const num=el('span','dd-line-num',String(item.id||index+1).padStart(2,'0'));num.setAttribute('aria-hidden','true');
 const inner=el('div');
 const desc=(item.speaker?.[lang]||item.speaker?.de||'')+(item.type==='thought'?' · '+locales[lang].thought:'')+' · '+locales[lang].panel+' '+item.panel;
 inner.append(el('p','dd-line-who',desc),el('p','dd-line-text',item.text?.[lang]||item.text?.de||''));
 li.append(num,inner);return li;
}
function render(){
 language=getLang();
 const t=locales[language],id=page,pg=content?.pages?.[id];
 $('dd-head').textContent=t.head;
 $('dd-subtitle').textContent=t.sub;
 $('dd-page').textContent=t.chapter+' '+(id==='Lücke'?t.gap: id+(language==='zh'?'页':''));
 $('dd-original').textContent=t.source;
 $('dd-scene-label').textContent=t.scene;
 $('dd-credit').textContent=t.credit;
 const tabs=[...deck.querySelectorAll('[data-dialogue-lang]')];
 for(const b of tabs){
  const active=b.dataset.dialogueLang===language;
  b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
 }
 const active=tabs.find(b=>b.dataset.dialogueLang===language);
 if(active)$('dd-panel').setAttribute('aria-labelledby',active.id);
 $('dd-lines').replaceChildren();
 const status=$('dd-status'),scene=$('dd-summary'),summaryText=$('dd-summary-text'),list=$('dd-lines');
 if(!pg||!pg.dialogues?.length){
  status.textContent=failed?t.error:t.pending;
  const message=el('li','dd-pending');
  message.append(el('strong','',failed?t.error:t.pending),document.createTextNode(failed?t.errorNote:t.pendingNote));
  list.append(message);
  scene.hidden=true;
  return;
 }
 status.textContent=t.verified+' · '+t.pilot;
 pg.dialogues.forEach((item,i)=>list.append(lineElement(item,i,language)));
 summaryText.textContent=pg.summary?.[language]||pg.summary?.de||'';
 scene.hidden=!summaryText.textContent;
}
function updatePage(next){page=String(next||currentPage());render();}
function changeLanguage(next){
 const switcher=document.querySelector('#language-tools [data-set-language="'+next+'"]');
 if(switcher){switcher.click();} else {document.documentElement.lang=next==='zh'?'zh-CN':next;}
 render();
}
deck.querySelectorAll('[data-dialogue-lang]').forEach(btn=>{
 btn.addEventListener('click',()=>changeLanguage(btn.dataset.dialogueLang));
 btn.addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
  e.preventDefault();
  const all=[...deck.querySelectorAll('[data-dialogue-lang]')];
  const i=all.indexOf(btn),next=e.key==='Home'?0:e.key==='End'?all.length-1:e.key==='ArrowRight'?(i+1)%all.length:(i+all.length-1)%all.length;
  changeLanguage(all[next].dataset.dialogueLang);all[next].focus();
 });
});
document.addEventListener('ttk:comicpage',event=>updatePage(event.detail?.label));
const observer=new MutationObserver(records=>{
 if(records.some(r=>r.attributeName==='lang'))render();
});
observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
page=currentPage();render();
fetch('comic-dialogues.json',{cache:'no-cache'}).then(res=>{
 if(!res.ok)throw new Error('HTTP '+res.status);
 return res.json();
}).then(json=>{
 if(json?.schema_version!==1||!json.pages||!Array.isArray(json.pages['01']?.dialogues))throw new Error('Invalid dialogue schema');
 content=json;failed=false;render();
}).catch(err=>{console.warn('Dialogue Deck:',err);failed=true;render();});
})();
