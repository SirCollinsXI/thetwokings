'use strict';
// Independent, opt-in practice mode. It does not change Simple / Pro / Kids records.
// Fixed, Ebbinghaus-inspired review intervals: not a fitted cognitive model.
(() => {
  const $ = id => document.getElementById(id);
  const STORAGE = 'ttk-wilson-picture-input-v1';
  const DAY = 86400000;
  const pictureWords = [
    ['cup','die Tasse'], ['apple','der Apfel'], ['bread','das Brot'],
    ['water','das Wasser'], ['egg','das Ei'], ['banana','die Banane'],
    ['chair','der Stuhl'], ['book','das Buch'], ['key','der Schlüssel'],
    ['phone','das Handy'], ['bed','das Bett'], ['clock','die Uhr'],
    ['car','das Auto'], ['bike','das Fahrrad'], ['bus','der Bus'],
    ['plane','das Flugzeug'], ['house','das Haus'], ['tree','der Baum']
  ];
  const pronunciation = {
    'die Tasse':'/ˈtasə/', 'der Apfel':'/ˈapfəl/',
    'das Brot':'/bʁoːt/', 'das Wasser':'/ˈvasɐ/',
    'das Ei':'/aɪ̯/', 'die Banane':'/baˈnaːnə/',
    'der Stuhl':'/ʃtuːl/', 'das Buch':'/buːx/',
    'der Schlüssel':'/ˈʃlʏsl̩/', 'das Handy':'/ˈhɛndi/',
    'das Bett':'/bɛt/', 'die Uhr':'/uːɐ̯/',
    'das Auto':'/ˈaʊ̯to/', 'das Fahrrad':'/ˈfaːɐ̯ʁaːt/',
    'der Bus':'/bʊs/', 'das Flugzeug':'/ˈfluːktsɔʏ̯k/',
    'das Haus':'/haʊ̯s/', 'der Baum':'/baʊ̯m/'
  };
  // This linguistic annotation also supports future pictured entries.
  const weakNouns = new Set(['der Junge','der Kollege','der Kunde','der Student','der Mensch','der Herr']);
  const words = pictureWords.map(([picture,de]) => {
    const source = LEXICON.find(w => w.de === de && w.pos === 'noun');
    if (!source) return null;
    return Object.assign({}, source, {
      picture,
      numberMode: source.pos === 'plural' ? 'plural' :
                  source.plural === '—' ? 'singular' : 'both',
      nDeclension: weakNouns.has(de),
      ipa: pronunciation[de] || ''
    });
  }).filter(Boolean);
  const COPY = {
    zh:{
      back:'← 学习角',heading:'看图，<span>写德语。</span>',subtitle:'没有每日上限。输入德语单复数，按 Enter 检查；再按 Enter 进入下一张图片。',
      tested:'已测试词数',due:'待复习',first:'首次正确率',picture:'观察图片，然后输入德语',
      askBoth:'写出单数（含冠词）和复数',askOne:'写出单数（含冠词）',askPlural:'写出复数（含冠词）',
      both:'格式：der Apfel, Äpfel（复数也接受 die Äpfel）',singular:'只需输入单数：das Wasser',plural:'只需输入复数：die Arbeitsbedingungen',
      check:'检查 ↵',next:'下一张图片 ↵',listen:'🔊 再听一遍',
      retry:'还没完全正确。再试一次！',good:'回答正确！',second:'第二次回答正确！',wrong:'请记住正确答案。',dueWord:'现在该复习了',newWord:'新单词',extra:'自由练习 · 提前复习',
      repeat:'下次复习：',n:'N-Deklination（弱变化阳性名词）：单数的宾格、与格、属格通常加 -n/-en。',
      tools:'数据备份 / Data backup',storage:'学习记录只保存在此设备的浏览器中。清除浏览器数据可能导致记录丢失。',
      export:'导出学习记录',import:'导入：',foot:'当前有 18 张原创图片。使用受遗忘曲线启发的分级复习间隔，并非对个人遗忘曲线的精确预测。语音使用设备可用的德语声音。',
      invalid:'无效的备份文件。',loaded:'学习记录已导入。',savefail:'无法保存。请检查隐私浏览设置，并及时导出备份。',speechfail:'此设备目前无法播放德语语音。',empty:'没有可用的图片词汇。'
    },
    de:{
      back:'← Trainingsecke',heading:'Bild sehen. <span>Wort schreiben.</span>',subtitle:'Kein Tageslimit. Singular mit Artikel und Plural eingeben. Enter prüft; das nächste Enter zeigt das nächste Bild.',
      tested:'Wörter geprüft',due:'Wiederholung fällig',first:'Im ersten Versuch richtig',picture:'Bild ansehen und deutsches Wort eingeben',
      askBoth:'Singular (mit Artikel) und Plural eingeben',askOne:'Singular mit Artikel eingeben',askPlural:'Plural mit Artikel eingeben',
      both:'Format: der Apfel, Äpfel (auch die Äpfel erlaubt)',singular:'Nur Singular: das Wasser',plural:'Nur Plural: die Arbeitsbedingungen',
      check:'Prüfen ↵',next:'Nächstes Bild ↵',listen:'🔊 Noch einmal hören',
      retry:'Noch nicht ganz richtig. Ein zweiter Versuch!',good:'Auf Anhieb richtig!',second:'Im zweiten Versuch richtig!',wrong:'Merke dir die richtige Lösung.',dueWord:'Jetzt wiederholen',newWord:'Neuer Begriff',extra:'Freies Training · vorgezogene Wiederholung',
      repeat:'Nächste Wiederholung: ',n:'N-Deklination: Schwache maskuline Nomen erhalten in den meisten Singularfällen außer dem Nominativ -n/-en.',
      tools:'Lernstand sichern',storage:'Der Lernstand bleibt ausschließlich in diesem Browser. Beim Löschen von Browserdaten kann er verloren gehen.',
      export:'Lernstand exportieren',import:'Import:',foot:'Derzeit 18 originale Bildkarten. Wiederholungsintervalle sind von Ebbinghaus inspiriert, keine individuell kalibrierte Prognose. Audio verwendet die verfügbare Gerätestimme.',
      invalid:'Ungültige Sicherungsdatei.',loaded:'Lernstand importiert.',savefail:'Fortschritt konnte nicht gespeichert werden. Bitte Sicherung exportieren.',speechfail:'Keine deutsche Sprachausgabe verfügbar.',empty:'Keine Bildwörter verfügbar.'
    },
    en:{
      back:'← Learning corner',heading:'See the picture. <span>Type the word.</span>',subtitle:'No daily limit. Type the singular with article and the plural. Enter checks; press Enter again for the next picture.',
      tested:'Words tested',due:'Due for review',first:'Correct on first try',picture:'Look at the picture and type the German word',
      askBoth:'Enter singular (with article) and plural',askOne:'Enter singular with article',askPlural:'Enter plural with article',
      both:'Format: der Apfel, Äpfel (also accepts die Äpfel)',singular:'Singular only: das Wasser',plural:'Plural only: die Arbeitsbedingungen',
      check:'Check ↵',next:'Next picture ↵',listen:'🔊 Listen again',
      retry:'Not quite right. Try one more time!',good:'Correct on the first try!',second:'Correct on the second try!',wrong:'Remember the correct answer.',dueWord:'Time to review',newWord:'New word',extra:'Free practice · early review',
      repeat:'Next review: ',n:'N-declension: Weak masculine nouns usually take -n/-en outside the nominative singular.',
      tools:'Back up progress',storage:'Progress is saved only in this browser. Clearing browser data may delete it.',
      export:'Export progress',import:'Import:',foot:'Currently 18 original picture cards. Intervals are inspired by the Ebbinghaus forgetting curve, not fitted to individual memory. Audio uses the device voice.',
      invalid:'Invalid backup file.',loaded:'Progress imported.',savefail:'Could not save progress. Please export a backup.',speechfail:'German speech is not available on this device.',empty:'No pictured vocabulary is available.'
    }
  };
  let lang = 'zh';
  let progress = {version:1,tested:0,firstCorrect:0,items:{}};
  let current = null, stage = 0, wasFirstWrong = false;
  const normal = s => String(s||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE');
  const simple = s => normal(s).replace(/^die\s+/,'');
  const escapeTag = s => String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const t = key => COPY[lang][key];
  function parseProgress(x) {
    if (!x || x.version!==1 || !Number.isSafeInteger(x.tested) || x.tested<0 ||
        !Number.isSafeInteger(x.firstCorrect) || x.firstCorrect<0 || x.firstCorrect>x.tested ||
        !x.items || Array.isArray(x.items) || typeof x.items!=='object') return null;
    for (const [key,r] of Object.entries(x.items)) {
      if (!words.some(w=>w.id===key) || !r || !Number.isSafeInteger(r.seen) || r.seen<0 ||
          !Number.isSafeInteger(r.streak) || r.streak<0 ||
          !Number.isFinite(r.due) || r.due<0 || !Number.isFinite(r.last) || r.last<0) return null;
    }
    return x;
  }
  try { const saved = JSON.parse(localStorage.getItem(STORAGE)); const clean=parseProgress(saved); if(clean)progress=clean; } catch(e){}
  try { const locale=localStorage.getItem(STORAGE+'-lang'); if(COPY[locale])lang=locale; } catch(e){}
  function warn(message){$('warning').textContent=message;}
  function save(){
    try { localStorage.setItem(STORAGE,JSON.stringify(progress)); }
    catch(e){ warn(t('savefail')); }
  }
  function dueCount(){return words.filter(w=>progress.items[w.id] && progress.items[w.id].due<=Date.now()).length;}
  function stats(){
    $('tested').textContent=progress.tested;
    $('due').textContent=dueCount();
    $('accuracy').textContent=progress.tested ? Math.round(progress.firstCorrect/progress.tested*100)+'%' : '—';
  }
  function renderLang(){
    document.documentElement.lang=lang==='zh'?'zh-Hans':lang;
    $('lang').value=lang;
    $('back').textContent=t('back');
    $('heading').innerHTML=t('heading');
    $('subtitle').textContent=t('subtitle');
    $('tested-label').textContent=t('tested');
    $('due-label').textContent=t('due');
    $('first-label').textContent=t('first');
    $('picture-note').textContent=t('picture');
    $('listen').textContent=t('listen');
    $('tools-title').textContent=t('tools');
    $('storage-note').textContent=t('storage');
    $('export').textContent=t('export');
    $('import-label').textContent=t('import');
    $('footnote').textContent=t('foot');
    if(current) renderQuestion(false);
    stats();
  }
  function findNext(){
    const now=Date.now();
    const due=words.filter(w=>progress.items[w.id] && progress.items[w.id].due<=now)
      .sort((a,b)=>progress.items[a.id].due-progress.items[b.id].due);
    if(due.length) return {word:due[0],kind:'dueWord',extra:false};
    const unseen=words.filter(w=>!progress.items[w.id]);
    if(unseen.length) return {word:unseen[0],kind:'newWord',extra:false};
    const early=words.slice().sort((a,b)=>progress.items[a.id].last-progress.items[b.id].last);
    if(early.length) return {word:early[0],kind:'extra',extra:true};
    return null;
  }
  function expected(w){
    const s=w.de,p=w.plural;
    if(w.numberMode==='singular') return s;
    if(w.numberMode==='plural') return p;
    return s+', '+simple(p);
  }
  function matches(value,w){
    const parts=String(value).split(',').map(normal);
    if(w.numberMode==='singular') return parts.length===1 && matchSing(parts[0],w);
    if(w.numberMode==='plural') return parts.length===1 && matchPlural(parts[0],w,true);
    return parts.length===2 && matchSing(parts[0],w) && matchPlural(parts[1],w,false);
  }
  function matchSing(s,w){
    const candidates=[w.de];
    const variants=Array.isArray(w.articleVariants)?w.articleVariants:[];
    for(const article of variants) candidates.push(article+' '+w.de.replace(/^\S+\s+/,''));
    return candidates.some(x=>normal(x)===s);
  }
  function matchPlural(s,w,requireArticle){
    const plural=normal(w.plural);
    if(requireArticle) return s===plural;
    return s===plural || s===simple(plural);
  }
  function renderQuestion(reset){
    if(!current)return;
    const w=current.word;
    if(reset){stage=0;wasFirstWrong=false;}
    $('word-image').src='wilson/'+encodeURIComponent(w.picture)+'.svg';
    $('word-image').alt='Illustration';
    $('round-note').textContent=t(current.kind);
    $('question').textContent=t(w.numberMode==='both'?'askBoth':w.numberMode==='plural'?'askPlural':'askOne');
    $('format').textContent=t(w.numberMode==='both'?'both':w.numberMode==='plural'?'plural':'singular');
    $('submit').textContent=stage===2?t('next'):t('check');
    $('typed').placeholder=expected(w);
    $('typed').removeAttribute('disabled');
    $('listen').hidden=stage!==2;
    $('solution').hidden=stage!==2;
    if(reset){$('typed').value='';$('status').textContent='';$('status').className='status';}
    if(stage===2)fillSolution();
    $('typed').focus();
    stats();
  }
  function nextWord(){
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
    current=findNext();
    if(!current){$('question').textContent=t('empty');$('typed').disabled=true;return;}
    renderQuestion(true);
  }
  function speak(){
    if(!('speechSynthesis' in window)){warn(t('speechfail'));return;}
    const w=current.word, voice=new SpeechSynthesisUtterance(w.de+'. '+(w.numberMode==='both'?w.plural:''));
    voice.lang='de-DE'; voice.rate=.85;
    const voices=window.speechSynthesis.getVoices();
    const german=voices.find(v=>v.lang.toLowerCase().startsWith('de'));
    if(german)voice.voice=german;
    voice.onerror=()=>warn(t('speechfail'));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voice);
  }
  function fillSolution(){
    const w=current.word,r=progress.items[w.id];
    $('correct-answer').textContent=expected(w);
    $('ipa').textContent=w.ipa ? 'IPA '+w.ipa : '';
    $('english').textContent=w.en||'—';
    $('chinese').textContent=(w.zh||'—') + (w.pinyin?' · '+w.pinyin:'');
    $('declension').hidden=!w.nDeclension;
    $('declension').textContent=w.nDeclension?t('n'):'';
    $('repeat-note').textContent=t('repeat')+new Date(r.due).toLocaleString(lang==='zh'?'zh-CN':lang==='de'?'de-DE':'en-GB');
  }
  function resolve(ok,firstTry){
    const w=current.word,now=Date.now();
    const old=progress.items[w.id]||{seen:0,streak:0,due:0,last:0};
    const streak=ok&&firstTry?old.streak+1:0;
    const intervals=[1,3,7,14,30,60,120];
    let due=ok&&firstTry ? now+intervals[Math.min(streak-1,intervals.length-1)]*DAY :
            ok ? now+6*3600000 : now+10*60000;
    // An early successful review must not postpone its already planned due date.
    if(current.extra && ok && old.due>now) due=old.due;
    progress.items[w.id]={seen:old.seen+1,streak:streak,due,last:now};
    progress.tested++;
    if(ok&&firstTry)progress.firstCorrect++;
    save();stage=2;
    $('status').className='status '+(ok?'ok':'warn');
    $('status').textContent=t(ok?(firstTry?'good':'second'):'wrong');
    renderQuestion(false);
    speak();
  }
  function submit(value){
    if(!current) return;
    if(stage===2){nextWord();return;}
    const ok=matches(value,current.word);
    if(ok){resolve(true,stage===0);return;}
    if(stage===0){
      stage=1;wasFirstWrong=true;
      $('status').className='status warn';$('status').textContent=t('retry');
      $('typed').focus();$('typed').select();
    } else resolve(false,false);
  }
  $('entry').addEventListener('submit',e=>{e.preventDefault();submit($('typed').value);});
  $('listen').addEventListener('click',speak);
  document.querySelectorAll('[data-char]').forEach(btn=>btn.addEventListener('click',()=>{
    const inp=$('typed'),start=inp.selectionStart,end=inp.selectionEnd;
    inp.value=inp.value.slice(0,start)+btn.dataset.char+inp.value.slice(end);
    inp.focus();inp.setSelectionRange(start+1,start+1);
  }));
  $('lang').addEventListener('change',e=>{
    lang=COPY[e.target.value]?e.target.value:'zh';
    try{localStorage.setItem(STORAGE+'-lang',lang);}catch(err){}
    renderLang();
  });
  $('export').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='wilson-picture-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
  $('import').addEventListener('change',async e=>{
    const file=e.target.files&&e.target.files[0];if(!file)return;
    try {
      if(file.size>1000000)throw new Error('too big');
      const parsed=parseProgress(JSON.parse(await file.text()));
      if(!parsed)throw new Error('invalid');
      progress=parsed;save();nextWord();warn(t('loaded'));
    } catch(err){warn(t('invalid'));}
    e.target.value='';
  });
  renderLang();
  nextWord();
})();