'use strict';
// Run: node scripts/test-wilson-input.cjs
// DOM and speech are mocked. This tests logic; real iOS/Android audio still needs device QA.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(ROOT,'wilson-input.js'),'utf8');
const lex=fs.readFileSync(path.join(ROOT,'wilson-lexicon.js'),'utf8');
const code=vm.runInNewContext(lex+';\nLEXICON.map(x=>({...x,articleVariants:[...(x.articleVariants||[])]}))');
const dictionary=new Map(code.map(w=>[w.de,w]));
const pictures=[
['cup','die Tasse','die Tassen'],['apple','der Apfel','die Äpfel'],['bread','das Brot','die Brote'],
['water','das Wasser','—'],['egg','das Ei','die Eier'],['banana','die Banane','die Bananen'],
['chair','der Stuhl','die Stühle'],['book','das Buch','die Bücher'],['key','der Schlüssel','die Schlüssel'],
['phone','das Handy','die Handys'],['bed','das Bett','die Betten'],['clock','die Uhr','die Uhren'],
['car','das Auto','die Autos'],['bike','das Fahrrad','die Fahrräder'],['bus','der Bus','die Busse'],
['plane','das Flugzeug','die Flugzeuge'],['house','das Haus','die Häuser'],['tree','der Baum','die Bäume'],
['junge','der Junge','die Jungen'],['kollege','der Kollege','die Kollegen'],
['eltern','die Eltern','die Eltern'],['ferien','die Ferien','die Ferien']
];
const shared=vm.runInNewContext(['wilson-image-candidates.js','wilson-vocabulary.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';WILSON_VOCABULARY',{LEXICON:code});
const STORE='ttk-wilson-picture-input-v1';
const stored={};
const storage={getItem:k=>stored[k]??null,setItem:(k,v)=>{stored[k]=v}};
function boot({audio=true,word='',locks}={}){
 const elements=new Map(),events={},plays=[];
 const makeElement=id=>({
    id, value:'', textContent:'', placeholder:'', hidden:false, className:'', dataset:{},
    addEventListener:(n,fn)=>events[id+':'+n]=fn,
    focus(){},select(){},setSelectionRange(){},
    removeAttribute(){},setAttribute(){},click(){},append(){},replaceChildren(){}
 });
 const get=id=>{if(!elements.has(id))elements.set(id,makeElement(id));return elements.get(id);};
 const doc={createElement:makeElement,getElementById:get,documentElement:{lang:'zh-Hans'},querySelectorAll:()=>[]};
 const speech=audio?{getVoices(){return [{lang:'de-DE',name:'German Voice'}]},cancel(){},speak(u){plays.push(u.text)}}:undefined;
 const win=audio?{speechSynthesis:speech}:{};
 win.location={search:word?'?word='+encodeURIComponent(word):''};
 if(locks)win.navigator={locks};
 win.addEventListener=(name,fn)=>events['window:'+name]=fn;
 const ctx={document:doc,window:win,localStorage:storage,LEXICON:code,WILSON_VOCABULARY:shared,
   SpeechSynthesisUtterance:function(text){this.text=text;},
   Date,JSON,Math,Number,String,Object,Array,Intl,URLSearchParams,encodeURIComponent,setTimeout(){}};
 vm.runInNewContext(app,ctx,{filename:'wilson-input.js'});
 return {get,plays,events,
    submit(value){get('typed').value=value;return events['entry:submit']({preventDefault(){}});},
    dump(){return JSON.parse(stored[STORE])}
 };
}
function answer(w){return w.task||w.numberMode==='singular'?w.de:w.numberMode==='plural'?w.plural:w.de+', '+w.plural.replace(/^die /,'');}
function format(de,plural){
 return plural==='—'?de:plural===de?de:de+', '+plural.replace(/^die /,'');
}
let test=boot();
assert.equal(test.get('typed').placeholder,'der ..., ...','must not leak answer');
assert.equal(test.get('word-image').src,'wilson/cup.svg');
test.submit('Tasse, Tassen'); // missing definite article
assert.equal(test.dump===undefined?0:Number(stored[STORE]!==undefined),0,'first incorrect input is not scored');
assert.match(test.get('status').textContent,/再试一次/);
test.submit('die Tasse, Tassen');
assert.equal(test.dump().tested,1);
assert.equal(test.dump().firstCorrect,0);
assert.equal(test.plays.length,1,'audio should auto-play after final answer');
assert.equal(test.get('solution').hidden,false);
test.submit(''); // next
assert.equal(test.get('word-image').src,'wilson/apple.svg');
test.submit('der Apfel, die Äpfel');
assert.equal(test.dump().firstCorrect,1);
assert.equal(test.dump().tested,2);
assert.equal(test.get('correct-answer').textContent,'der Apfel, Äpfel');
test.submit(''); // bread

// Complete the entire content set, including noun classes and singular-only forms.
for(const [id,de,plural] of pictures.slice(2)){
 assert.ok(fs.existsSync(path.join(ROOT,'wilson',id+'.svg')),id+' missing original SVG');
 assert.equal(test.get('word-image').src,'wilson/'+id+'.svg',id+' question image');
 test.submit(format(de,plural));
 assert.equal(test.get('solution').hidden,false,id+' did not resolve');
 if(['junge','kollege'].includes(id)) assert.equal(test.get('declension').hidden,false,'N-declension not visible');
 if(['eltern','ferien','water'].includes(id))
   assert.equal(test.get('correct-answer').textContent,format(de,plural),'incorrect number form');
 test.submit(''); // advance
}
// Newly approved entries must all be reachable and accept the displayed number forms.
for (const w of shared.inputWords.slice(22)) {
 assert.ok(fs.existsSync(path.join(ROOT,w.imagePath)),w.id+' missing approved asset');
 assert.equal(test.get('word-image').src,w.imagePath,w.id+' image');
 test.submit(answer(w));
 assert.equal(test.get('solution').hidden,false,w.id+' did not resolve');
 assert.ok(test.get('ipa').textContent.startsWith('IPA /'),w.id+' missing IPA');
 test.submit('');
}
const total=shared.inputWords.length;
assert.equal(test.dump().tested,total,'all approved answers must be saved');
assert.equal(test.dump().firstCorrect,total-1);
assert.equal(Object.keys(test.dump().items).length,total);
assert.equal(test.plays.length,total,'speak after every fully judged word');
assert.equal(test.get('tested').textContent,total);
// A reload retains the count and offers an unlimited extra round.
test=boot();
assert.equal(test.get('tested').textContent,total);
assert.match(test.get('round-note').textContent,/自由练习/);
// Force the n-declension card to be due: scheduler must prioritize due before extra.
const progress=test.dump(),junge=dictionary.get('der Junge').id;
progress.items[junge].due=0;
stored[STORE]=JSON.stringify(progress);
test=boot();
assert.equal(test.get('word-image').src,'wilson/junge.svg','due words must have highest priority');
test.submit('der Junge, Jungen');
assert.equal(test.dump().tested,total+1);
assert.ok(test.dump().items[junge].due>Date.now());
// Two wrong attempts: exactly one scored item and a near-term retry.
test.submit('');
const before=test.dump().tested;
test.submit('wrong');
assert.equal(test.dump().tested,before);
test.submit('still wrong');
assert.equal(test.dump().tested,before+1);
assert.match(test.get('status').textContent,/正确答案/);
// No audio hardware: the app should give a warning, not crash.
delete stored[STORE];
const noSpeech=boot({audio:false});
noSpeech.submit('die Tasse, Tassen');
assert.match(noSpeech.get('warning').textContent,/语音/);
console.log('Wilson tests passed: '+total+' illustrated cards, spelling, retry, audio hooks, N-declension, plural-only, persistence, scheduling and fallback.');

// Cross-release storage compatibility, IME protection and punctuation/case feedback.
delete stored[STORE];
test=boot();
test.events['typed:compositionstart']();
test.submit('die Tasse, Tassen');
assert.equal(stored[STORE],undefined,'composing input must not be scored');
test.events['typed:compositionend']();
test.submit('die tasse，die tassen');
assert.equal(test.dump().firstCorrect,1);
assert.match(test.get('status').textContent,/大小写/);
const originalDue=test.dump().items[shared.inputWords[0].id].due;
// Score all remaining words, then take an early review and preserve its due date and streak.
for (const w of shared.inputWords.slice(1)) {test.submit('');test.submit(answer(w));}
test.submit('');
const firstID=shared.inputWords[0].id;
const oldStreak=test.dump().items[firstID].streak;
test.submit('die Tasse, Tassen');
assert.equal(test.dump().items[firstID].due,originalDue);
assert.equal(test.dump().items[firstID].streak,oldStreak);
const backup=test.dump();
backup.items.retired_card={seen:2,streak:1,due:100,last:90};
stored[STORE]=JSON.stringify(backup);
test=boot();
assert.equal(test.get('attempts').textContent,backup.tested,'temporarily absent IDs must not discard the whole backup');
console.log('Compatibility passed: original IDs, future/retired records, Chinese comma, capitalisation, IME, early reviews.');

// Different word classes must get suitable tasks, accept reviewed alternatives and
// reject the noun format; gallery links must not postpone a future review.
for(const w of shared.inputWords.filter(w=>w.task)){
 delete stored[STORE];
 const drill=boot({word:w.id});
 assert.equal(drill.get('word-image').src,w.imagePath,w.id+' gallery link opened wrong card');
 assert.equal(drill.get('question').textContent,w.task.prompt.zh,w.id+' unsuitable task');
 assert.equal(drill.get('typed').placeholder,'…',w.id+' noun format leaked into action/number task');
 drill.submit(w.de+', —');
 assert.equal(stored[STORE],undefined,w.id+' accepted inappropriate noun format');
 const answer=w.task.answers?.[0] || w.de;
 drill.submit(answer);
 assert.equal(drill.dump().tested,1,w.id+' second-try answer not saved');
 assert.equal(drill.dump().firstCorrect,0);
 assert.equal(drill.get('correct-answer').textContent,w.de);
 assert.equal(drill.plays[0],w.de+'. ',w.id+' audio read a fictitious plural');
 const oldDue=drill.dump().items[w.id].due,oldStreak=drill.dump().items[w.id].streak;
 const early=boot({word:w.id});early.submit(w.de);
 assert.equal(early.dump().items[w.id].due,oldDue,w.id+' selected early practice delayed review');
 assert.equal(early.dump().items[w.id].streak,oldStreak,w.id+' selected early practice increased streak');
}
for(const w of shared.inputWords.filter(w=>w.answerVariants?.length)){
 for(const variant of w.answerVariants){
  delete stored[STORE];const drill=boot({word:w.id});
  drill.submit(answer({...w,...variant}));
  assert.equal(drill.dump().firstCorrect,1,w.id+' rejected reviewed noun synonym');
  assert.equal(drill.get('correct-answer').textContent,answer(w));
  assert.doesNotMatch(drill.get('status').textContent,/大小写/,'correct synonym misreported as capitalisation error');
 }
}
delete stored[STORE];
test=boot({word:'missing-or-retired'});
assert.equal(test.get('word-image').src,'wilson/cup.svg','unknown gallery ID must fall back to normal queue');
console.log('Expansion passed: '+shared.inputWords.filter(w=>w.task).length+' typed action/number/location tasks, reviewed synonyms, gallery links and early-review protection.');

// Similar objects must remain different answers, even with the correct article.
for(const [id,confusable] of [
 ['v810','der Mülleimer, Mülleimer'],
 ['v1101','das Starthilfekabel, Starthilfekabel'],
 ['v1079','das Stromkabel, Stromkabel'],
 ['v531','der Schlüssel, Schlüssel'],
 ['v1102','der Sicherungskasten, Sicherungskästen']
]){
 delete stored[STORE];
 const w=shared.inputWords.find(entry=>entry.id===id);
 const drill=boot({word:id});
 assert.equal(drill.get('word-image').src,w.imagePath);
 assert.equal(drill.get('picture-note').textContent,w.context.zh);
 drill.submit(confusable);
 assert.equal(drill.get('solution').hidden,true,id+' accepted a different object');
 drill.submit(answer(w));
 assert.equal(drill.get('solution').hidden,false);
 assert.equal(drill.get('correct-answer').textContent,answer(w));
 assert.equal(drill.get('chinese').textContent,w.zh+' · '+w.pinyin);
 drill.submit('');
 assert.notEqual(drill.get('word-image').src,w.imagePath);
}
console.log('Paket 2: five targeted images, confusable answers, Mandarin and advance verified.');

// Two open views used to overwrite each other's attempts. Also cover browsers
// without Web Locks: each write must at least start from the latest saved state.
delete stored[STORE];
const tabA=boot({word:'v424'}),tabB=boot({word:'v72'});
tabA.submit('gießen');tabB.submit('der Bagel, Bagels');
assert.equal(tabB.dump().tested,2,'second tab lost the first tab’s attempt');
assert.ok(tabB.dump().items.v424&&tabB.dump().items.v72,'second tab lost a learned word');
tabA.events['window:storage']({key:STORE});
assert.equal(tabA.get('attempts').textContent,2,'other tab did not refresh visible statistics');
const stale=boot({word:'v424'}),other=boot({word:'v424'});
other.submit('gießen');
const prior=other.dump().items.v424;
stale.submit('gießen');
assert.equal(stale.dump().items.v424.due,prior.due,'stale view postponed a future review');
assert.equal(stale.dump().items.v424.streak,prior.streak,'stale view increased a future review streak');
(async()=>{
 delete stored[STORE];let calls=0,queue=Promise.resolve();
 const locks={request(name,fn){assert.equal(name,STORE);calls++;const result=queue.then(fn);queue=result.catch(()=>{});return result;}};
 const first=boot({word:'v424',locks}),second=boot({word:'v72',locks});
 await Promise.all([first.submit('gießen'),second.submit('der Bagel, Bagels')]);
 assert.equal(calls,2,'origin-wide lock not requested');
 assert.equal(second.dump().tested,2,'serialized views lost an attempt');
 assert.equal(Object.keys(second.dump().items).length,2);
 console.log('Multiple views passed: latest-state writes, storage events, stale-review protection and origin-wide locking.');
})().catch(err=>{console.error(err);process.exitCode=1});
