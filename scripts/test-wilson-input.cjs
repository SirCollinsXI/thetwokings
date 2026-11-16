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
const STORE='ttk-wilson-picture-input-v1';
const stored={};
const storage={getItem:k=>stored[k]??null,setItem:(k,v)=>{stored[k]=v}};
function boot({audio=true}={}){
 const elements=new Map(),events={},plays=[];
 const makeElement=id=>({
    id, value:'', textContent:'', placeholder:'', hidden:false, className:'', dataset:{},
    addEventListener:(n,fn)=>events[id+':'+n]=fn,
    focus(){},select(){},setSelectionRange(){},
    removeAttribute(){},setAttribute(){},click(){}
 });
 const get=id=>{if(!elements.has(id))elements.set(id,makeElement(id));return elements.get(id);};
 const doc={getElementById:get,documentElement:{lang:'zh-Hans'},querySelectorAll:()=>[]};
 const speech=audio?{getVoices(){return [{lang:'de-DE',name:'German Voice'}]},cancel(){},speak(u){plays.push(u.text)}}:undefined;
 const win=audio?{speechSynthesis:speech}:{};
 const ctx={document:doc,window:win,localStorage:storage,LEXICON:code,
   SpeechSynthesisUtterance:function(text){this.text=text;},
   Date,JSON,Math,Number,String,Object,Array,Intl,encodeURIComponent,setTimeout(){}};
 vm.runInNewContext(app,ctx,{filename:'wilson-input.js'});
 return {get,plays,
    submit(value){get('typed').value=value;events['entry:submit']({preventDefault(){}});},
    dump(){return JSON.parse(stored[STORE])}
 };
}
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
assert.equal(test.dump().tested,pictures.length,'all 22 answers must be saved');
assert.equal(test.dump().firstCorrect,pictures.length-1);
assert.equal(Object.keys(test.dump().items).length,pictures.length);
assert.equal(test.plays.length,pictures.length,'speak after every fully judged word');
assert.equal(test.get('tested').textContent,pictures.length);
// A reload retains the count and offers an unlimited extra round.
test=boot();
assert.equal(test.get('tested').textContent,pictures.length);
assert.match(test.get('round-note').textContent,/自由练习/);
// Force the n-declension card to be due: scheduler must prioritize due before extra.
const progress=test.dump(),junge=dictionary.get('der Junge').id;
progress.items[junge].due=0;
stored[STORE]=JSON.stringify(progress);
test=boot();
assert.equal(test.get('word-image').src,'wilson/junge.svg','due words must have highest priority');
test.submit('der Junge, Jungen');
assert.equal(test.dump().tested,pictures.length+1);
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
const noSpeech=boot({audio:false});
noSpeech.submit('die Tasse, Tassen');
assert.match(noSpeech.get('warning').textContent,/语音/);
console.log('Wilson tests passed: 22 illustrated cards, spelling, retry, audio hooks, N-declension, plural-only, persistence, scheduling and fallback.');
