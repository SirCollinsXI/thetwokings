'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const bundle=['wilson-lexicon.js','wilson-image-candidates.js','wilson-vocabulary.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const {v,c,lex}=vm.runInNewContext(bundle+';({v:WILSON_VOCABULARY,c:WILSON_IMAGE_CANDIDATES,lex:LEXICON})');
assert.equal(v.inputWords.length,774);
assert.equal(c.filter(w=>w.active&&w.provider!=='project').length,596);
assert.equal(c.filter(w=>w.review?.decision==='blocked').length,47);
assert.equal(c.filter(w=>w.status==='approved-alternative').length,10);
assert.equal(c.filter(w=>!w.review).length,0);
assert.equal(new Set(c.map(w=>w.id)).size,c.length,'candidate IDs must be unique; replaced decisions belong in reviewHistory');
assert.equal(c.filter(w=>w.reviewHistory?.length).length,12,'replacement decisions must retain their earlier review');
assert.equal(new Set(v.inputWords.map(w=>w.id)).size,v.activeCount,'duplicate input ID');
assert.equal(new Set(v.inputWords.map(w=>w.de)).size,v.activeCount,'alternative motifs must not add words');
assert.equal(new Set(v.mainWords.map(w=>w.id)).size,v.mainWords.length,'duplicate main ID');
const hashes=new Set(),sources=new Set();
for(const w of v.inputWords){
 assert.ok(w.en&&w.zh&&w.de&&w.plural&&w.ipa,w.id+' incomplete language fields');
 assert.ok(['singular','plural','both'].includes(w.numberMode),w.id+' missing number task');
 if(w.task){
  assert.ok(['number','infinitive','word','phrase'].includes(w.task.type));
  for(const l of ['de','en','zh'])assert.ok(w.task.prompt[l]&&w.task.hint[l],w.id+' incomplete task language');
  assert.ok(!w.task.answers?.includes(w.de),w.id+' canonical answer duplicated as synonym');
 }else assert.ok(['noun','plural'].includes(w.pos),w.id+' nonnoun has no appropriate task');
 const svg=fs.readFileSync(path.join(root,w.imagePath),'utf8');
 assert.match(svg,/<svg\b/);
 assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i,w.id+' risky SVG');
 const hash=crypto.createHash('sha256').update(svg).digest('hex');
 assert.ok(!hashes.has(hash),w.id+' duplicates an active image');hashes.add(hash);
 if(w.imageCredit){
  const credit=w.imageCredit;
  assert.equal(credit.active,true);
  assert.equal(credit.review.decision,'approved');
  if(credit.provider==='project'){assert.ok(credit.creator.includes('TheTwoKings'));continue;}
  assert.equal(hash,credit.svgSha256,w.id+' source content changed');
  const blob=crypto.createHash('sha1').update(Buffer.from('blob '+Buffer.byteLength(svg)+'\0')).update(svg).digest('hex');
  assert.equal(blob,credit.upstreamBlob,w.id+' differs from pinned original');
  assert.equal(credit.creator,'Steve Lee');
  assert.equal(credit.license,'CC-BY-SA-4.0');
  assert.match(credit.source,/\/fa94a93ca1b5357c0b6e0d9f8a81c426a1dfefdf\/EN\//);
  assert.ok(!sources.has(credit.sourcePath),w.id+' shares an active source motif');sources.add(credit.sourcePath);
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
assert.equal(v.inputWords.find(w=>w.id==='v407').nDeclension,true,'Geldautomat is a weak noun');
assert.equal(v.inputWords.find(w=>w.id==='v831').nDeclension,true,'Polizist is a weak noun');
assert.equal(v.inputWords.find(w=>w.id==='v585').ipa,'/ˈklaɪ̯nˌbʊs/','IPA must describe the German word');
assert.equal(v.inputWords.find(w=>w.id==='v11').imageCredit.sourcePath,'EN/eighth.svg','fraction must not be misassigned to ordinal achte');
assert.ok(!v.inputWords.some(w=>w.id==='v10'),'fraction image must not count as an ordinal card');

for(const old of JSON.parse(fs.readFileSync(path.join(root,'scripts/fixtures/wilson-active-20261117.json'),'utf8'))){
 const now=v.inputWords.find(w=>w.id===old.id);
 assert.ok(now,'lost previous active ID '+old.id);
 assert.equal(now.de,old.de,'previous ID reassigned');
 assert.equal(now.imagePath,old.imagePath,'previous image path changed');
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,now.imagePath))).digest('hex'),old.sha256,'previous image changed');
}
for(const id of ['v1355','v607','wx-brazil-nut','wx-ferret','wx-cornflakes','wx-crisps','v1185'])assert.ok(!v.inputWords.some(w=>w.id===id),id+' ambiguous/duplicate image enabled');
assert.equal(v.inputWords.find(w=>w.id==='wx-chinese-cabbage').de,'der Pak Choi');
assert.equal(v.inputWords.find(w=>w.id==='v724').numberMode,'plural');
assert.equal(v.inputWords.find(w=>w.id==='v363').plural,'die Frühstücksflocken');
assert.equal(v.inputWords.filter(w=>w.imageCredit?.provider==='project').length,156);
const household=v.inputWords.filter(w=>w.imageCredit?.review.batch==='kueche-haushalt-01');
assert.equal(household.length,25);
for (const w of household) {
 assert.equal(w.de,lex.find(entry=>entry.id===w.id)?.de,'household card must keep its PONS lexicon ID');
 assert.ok(w.pinyin && w.imageCredit.source.endsWith(w.imagePath),w.id+' incomplete card or provenance');
}
for (const id of ['v471','v974']) {
 const w=household.find(w=>w.id===id);
 assert.equal(w.imageCredit.reviewHistory.at(-1).decision,'blocked');
 assert.notEqual(w.imageCredit.reviewHistory.at(-1).path,w.imagePath);
}
const household2=v.inputWords.filter(w=>w.imageCredit?.review.batch==='kueche-haushalt-02');
assert.deepEqual(Array.from(household2,w=>w.id).sort(),['v1079','v1101','v1102','v531','v810']);
for(const w of household2){
 assert.equal(w.de,lex.find(entry=>entry.id===w.id)?.de);
 assert.equal(w.plural,lex.find(entry=>entry.id===w.id)?.plural);
 assert.ok(w.pinyin&&w.imageCredit.source.endsWith(w.imagePath));
 for(const l of ['de','en','zh'])assert.ok(w.context[l],w.id+' missing image context');
}
for(const id of ['v531','v810']){
 const w=household2.find(w=>w.id===id);
 assert.equal(w.imageCredit.reviewHistory.at(-1).decision,'blocked');
 assert.notEqual(w.imageCredit.reviewHistory.at(-1).path,w.imagePath);
}
const mobility=v.inputWords.filter(w=>w.imageCredit?.review.batch==='mobilitaet-01');
assert.deepEqual(Array.from(mobility,w=>w.id).sort(),['v164','v314','v473','v633','v74']);
for(const w of mobility){
 const original=lex.find(entry=>entry.id===w.id);
 for(const field of ['de','plural','en','zh','pinyin'])assert.equal(w[field],original[field],w.id+' changed the source word');
 assert.equal(w.imagePath,'wilson/original-mobility/'+w.id+'.svg');
 assert.equal(w.imageCredit.provider,'project');
 assert.ok(w.imageCredit.source.endsWith(w.imagePath));
 for(const l of ['de','en','zh'])assert.ok(w.context[l],w.id+' missing image context');
 const main=v.mainWords.find(entry=>entry.id===w.id);
 assert.equal(main.imagePath,w.imagePath);
 assert.equal(main.picture,true,w.id+' missing from main trainer');
 assert.equal(main.childSuitable,true,w.id+' missing from Kinderwelt');
}
assert.equal(mobility.find(w=>w.id==='v314').nDeclension,true,'Fahrkartenautomat is a weak noun');
const transit=v.inputWords.filter(w=>w.imageCredit?.review.batch==='mobilitaet-02');
assert.deepEqual(Array.from(transit,w=>w.id).sort(),['v168','v313','v315','v461','v462']);
for(const w of transit){
 const original=lex.find(entry=>entry.id===w.id);
 for(const field of ['de','plural','en'])assert.equal(w[field],original[field],w.id+' changed the source word');
 assert.equal(w.zh,w.id==='v461'?'下车铃按钮':original.zh);
 assert.equal(w.pinyin,w.id==='v461'?'xiàchēlíng ànniǔ':original.pinyin);
 assert.equal(w.numberMode,'both');
 assert.equal(w.nDeclension,false);
 assert.match(w.imagePath,new RegExp('^wilson/original-transit/'+w.id+'-[a-z]+\\.svg$'));
 assert.equal(w.imageCredit.provider,'project');
 assert.ok(w.imageCredit.source.endsWith(w.imagePath));
 for(const language of ['de','en','zh'])assert.ok(w.context[language],w.id+' missing image context');
 const main=v.mainWords.find(entry=>entry.id===w.id);
 assert.equal(main.imagePath,w.imagePath);
 assert.equal(main.picture,true,w.id+' missing from main trainer');
 assert.equal(main.childSuitable,true,w.id+' missing from Kinderwelt');
}
const pictureBatches = [
 { batch: 'mobilitaet-03', directory: 'original-car-parts', ids: ['v142', 'v39', 'v57', 'v673', 'v941'] },
 { batch: 'babyausstattung-01', directory: 'original-baby', ids: ['v1093', 'v60', 'v61', 'v63', 'v962'] },
 { batch: 'kleidung-01', directory: 'original-clothing', ids: ['v1100', 'v1172', 'v833', 'v896', 'v957'] },
 { batch: 'obst-gemuese-01', directory: 'original-produce', ids: ['v485', 'v497', 'v507', 'v903', 'v904'] },
 { batch: 'lebensmittel-01', directory: 'original-food', ids: ['v1112', 'v1120', 'v280', 'v342', 'v73'] },
 { batch: 'fahrrad-01', directory: 'original-bicycle', ids: ['v1063', 'v1262', 'v141', 'v499', 'v686'] },
 { batch: 'auto-06', directory: 'original-auto', ids: ['v1011', 'v1322', 'v623', 'v747', 'v791'] },
 { batch: 'haus-06', directory: 'original-house-exterior', ids: ['v186', 'v477', 'v479', 'v480', 'v75'] },
 { batch: 'supermarkt-06', directory: 'original-supermarket', ids: ['v1278', 'v408', 'v564', 'v646', 'v753'] },
 { batch: 'digital-06', directory: 'original-digital', ids: ['v1034', 'v1207', 'v352', 'v703', 'v996'] }
];
for (const { batch, directory, ids } of pictureBatches) {
 const words = v.inputWords.filter(word => word.imageCredit?.review.batch === batch);
 assert.deepEqual(Array.from(words, word => word.id).sort(), ids, batch);
 for (const word of words) {
  const original = lex.find(entry => entry.id === word.id);
  for (const field of ['de', 'plural', 'en', 'zh', 'pinyin']) assert.equal(word[field], original[field], word.id);
  assert.equal(word.numberMode, original.plural === '—' ? 'singular' : 'both');
  assert.equal(word.nDeclension, false);
  assert.equal(path.posix.dirname(word.imagePath), 'wilson/' + directory);
  assert.match(path.posix.basename(word.imagePath), /^v\d+-[a-z]+\.svg$/);
  for (const language of ['de', 'en', 'zh']) assert.ok(word.context[language], word.id);
  const trainerWord = v.mainWords.find(entry => entry.id === word.id);
  assert.equal(trainerWord.imagePath, word.imagePath);
  assert.equal(trainerWord.childSuitable, true);
 }
}
console.log('Vocabulary verified: 774 active cards; all 222 legacy IDs and image hashes preserved.');
