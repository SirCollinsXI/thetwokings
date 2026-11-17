'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const bundle=['wilson-lexicon.js','wilson-image-candidates.js','wilson-vocabulary.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const {v,c,lex}=vm.runInNewContext(bundle+';({v:WILSON_VOCABULARY,c:WILSON_IMAGE_CANDIDATES,lex:LEXICON})');
assert.equal(v.inputWords.length,222);
assert.equal(c.filter(w=>w.active).length,200);
assert.equal(c.filter(w=>w.review?.decision==='blocked').length,35);
assert.equal(c.filter(w=>w.status==='approved-alternative').length,5);
assert.equal(c.filter(w=>!w.review).length,0);
assert.equal(new Set(v.inputWords.map(w=>w.id)).size,v.activeCount,'duplicate input ID');
assert.equal(new Set(v.inputWords.map(w=>w.de)).size,v.activeCount,'alternative motifs must not add words');
assert.equal(new Set(v.mainWords.map(w=>w.id)).size,v.mainWords.length,'duplicate main ID');
const hashes=new Set();
for(const w of v.inputWords){
 assert.ok(w.en&&w.zh&&w.de&&w.plural&&w.ipa,w.id+' incomplete language fields');
 assert.ok(['singular','plural','both'].includes(w.numberMode),w.id+' missing number task');
 const svg=fs.readFileSync(path.join(root,w.imagePath),'utf8');
 assert.match(svg,/<svg\b/);
 assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i,w.id+' risky SVG');
 const hash=crypto.createHash('sha256').update(svg).digest('hex');
 assert.ok(!hashes.has(hash),w.id+' duplicates an active image');hashes.add(hash);
 if(w.imageCredit){
  const credit=w.imageCredit;
  assert.equal(credit.active,true);
  assert.equal(credit.review.decision,'approved');
  assert.equal(credit.creator,'Steve Lee');
  assert.equal(credit.license,'CC-BY-SA-4.0');
  assert.match(credit.source,/\/fa94a93ca1b5357c0b6e0d9f8a81c426a1dfefdf\/EN\//);
 }
}
for(const w of c.filter(w=>w.review.decision==='blocked'))assert.ok(!v.inputWords.some(x=>x.imagePath===w.path),'blocked image used');
assert.equal(v.inputWords.find(w=>w.de==='das Eiweiß').numberMode,'singular');
assert.equal(v.inputWords.find(w=>w.de==='die Eltern').id,'eltern');
assert.equal(v.inputWords.find(w=>w.de==='die Ferien').id,'ferien');
assert.equal(v.inputWords.find(w=>w.de==='der Junge').id,'v550');
assert.equal(v.inputWords.find(w=>w.de==='der Kollege').id,'v605');
// All historic main IDs: canonical lexicon IDs except the 18 original word overlays.
const originals=new Map(v.mainWords.filter(w=>['cup','apple','bread','water','egg','banana','chair','book','key','phone','bed','clock','car','bike','bus','plane','house','tree'].includes(w.id)).map(w=>[w.de,w.id]));
for(const w of lex)assert.ok(v.mainWords.some(x=>x.id===(originals.get(w.de)||w.id)),'lost main ID '+w.id);
assert.equal(v.mainWords.find(w=>w.de==='das Bier').childSuitable,false);
console.log('Vocabulary verified: 222 unique active IDs/images, complete IPA and DE/EN/ZH, 200 source credits, 35 exclusions, 5 alternatives, legacy IDs.');
