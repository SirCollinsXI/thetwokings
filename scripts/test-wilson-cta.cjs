'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../wilson.html'),'utf8');
const anchor=html.match(/<a href="wilson-input\.html" class="wilson-challenge-link"[^>]*>[\s\S]*?<\/a>/)?.[0];
assert.ok(anchor,'Challenge link missing');
assert.match(anchor,/background:\s*#1f5c4e/,'Challenge must remain green even with cached stylesheet');
assert.match(anchor,/color:\s*#fff/,'Contrast fallback missing');
assert.ok(!anchor.includes('data-t='),'Old scripts would overwrite new translation keys');
assert.match(anchor,/id="challenge-title"/);
assert.match(anchor,/id="challenge-subtitle"/);
assert.match(html,/href="wilson\.css\?v=20261126r1"/,'Stylesheet version not refreshed');
assert.match(html,/src="wilson\.js\?v=20261127corner"/,'Main JS version not refreshed');
assert.match(html,/src="wilson-paths\.js\?v=20261128-signals"/,'Paths JS version not refreshed');
const snippets=Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),x=>x[1]).filter(Boolean);
const script=snippets.at(-1);
assert.ok(script.includes("challenge-title"),'Independent CTA script missing');
const elements=new Map();
const choice={value:'zh',handlers:{},addEventListener:(event,fn)=>{choice.handlers[event]=fn}};
elements.set('ui',choice);
elements.set('preview-illustration',{alt:''});
elements.set('preview-prompt',{textContent:''});
elements.set('challenge-title',{textContent:''});
elements.set('challenge-subtitle',{textContent:''});
const document={getElementById:id=>elements.get(id)};
vm.runInNewContext(script,{document}, {filename:'wilson-cta-inline.js'});
for(const [language,expectedTitle,expectedSubtitle] of [
 ['zh','章鱼哥的德语单复数挑战','看图输入：冠词＋单数、复数'],
 ['de','Wilson Challenge · Singular & Plural','Artikel + Singular, Plural'],
 ['en','Wilson Challenge · German singular & plural','type article, singular and plural']]){
  choice.value=language;choice.handlers.change();
  assert.ok(elements.get('challenge-title').textContent.includes(expectedTitle),language+' title');
  assert.ok(elements.get('challenge-subtitle').textContent.includes(expectedSubtitle),language+' subtitle');
}
console.log('Wilson CTA cache regression passed: green fallback and independent DE/EN/ZH translations.');
