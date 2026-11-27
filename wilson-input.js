'use strict';
// Independent, opt-in practice mode. It does not change Simple / Pro / Kids records.
// Fixed, Ebbinghaus-inspired review intervals: not a fitted cognitive model.
(() => {
  const $ = id => document.getElementById(id);
  const STORAGE = 'ttk-wilson-picture-input-v1';
  const FEEDBACK_STORAGE = 'ttk-wilson-card-feedback-v1';
  const FEEDBACK_REASONS = ['image', 'word', 'audio'];
  const DAY = 86400000;
  const words = WILSON_VOCABULARY.inputWords;
  const COPY = {
    zh:{
      feedbackTitle:'反馈这张卡', feedbackNote:'反馈保存在当前浏览器中，可导出后自行分享。', feedbackExport:'导出卡片反馈',
      image:'图片不清楚', word:'词语或翻译不清楚', audio:'没有声音',
      feedbackSaved:'反馈已保存在此浏览器。', feedbackTemporary:'反馈仅保存在当前页面。离开前请先导出。',
      back:'← 学习角',heading:'看图，<span>写德语。</span>',subtitle:'没有每日上限。名词练习冠词和单复数；动作和数字有对应的题目。按 Enter 检查，再按 Enter 看下一张。',
      selectedWord:'指定图片练习',alternatives:'也接受：',
      tested:'已练习的不同词汇',attempts:'完成的练习次数',caseNote:'词语正确，请注意大小写：',due:'待复习',first:'首次正确率',picture:'观察图片，然后输入德语',
      askBoth:'写出单数（含冠词）和复数',askOne:'写出单数（含冠词）',askPlural:'写出复数（含冠词）',
      both:'格式：der Apfel, Äpfel（复数也接受 die Äpfel）',singular:'只需输入单数：das Wasser',plural:'只需输入复数：die Arbeitsbedingungen',
      check:'检查 ↵',next:'下一张图片 ↵',listen:'🔊 再听一遍',
      retry:'还没完全正确。再试一次！',good:'回答正确！',second:'第二次回答正确！',wrong:'请记住正确答案。',dueWord:'现在该复习了',newWord:'新单词',extra:'自由练习 · 提前复习',
      repeat:'下次复习：',n:'N-Deklination（弱变化阳性名词）：单数的宾格、与格、属格通常加 -n/-en。',
      tools:'数据备份 / Data backup',storage:'学习记录只保存在此设备的浏览器中。清除浏览器数据可能导致记录丢失。',
      export:'导出学习记录',import:'导入：',foot:'当前有 {count} 张图片卡（项目插图和已审核的 Mulberry 符号）。使用受遗忘曲线启发的分级复习间隔，并非对个人遗忘曲线的精确预测。语音使用设备可用的德语声音。',
      invalid:'无效的备份文件。',loaded:'学习记录已导入。',savefail:'无法保存。请检查隐私浏览设置，并及时导出备份。',speechfail:'此设备目前无法播放德语语音。',empty:'没有可用的图片词汇。'
    },
    de:{
      feedbackTitle:'Feedback zu dieser Karte', feedbackNote:'Dein Feedback bleibt in diesem Browser. Du kannst es exportieren und selbst teilen.', feedbackExport:'Kartenfeedback exportieren',
      image:'Bild unklar', word:'Wort oder Übersetzung unklar', audio:'Ton fehlt',
      feedbackSaved:'Feedback in diesem Browser gespeichert.', feedbackTemporary:'Feedback für diese Seite erfasst. Bitte exportiere es, bevor du die Seite verlässt.',
      back:'← Trainingsecke',heading:'Bild sehen. <span>Wort schreiben.</span>',subtitle:'Kein Tageslimit. Nomen mit Artikel und Zahlform üben; Tätigkeiten und Zahlen haben passende Aufgaben. Enter prüft, das nächste Enter zeigt das nächste Bild.',
      selectedWord:'Gezielte Bildübung',alternatives:'Ebenfalls passend: ',
      tested:'Verschiedene Wörter',attempts:'Übungen insgesamt',caseNote:'Wort erkannt. Achte auf die Groß-/Kleinschreibung: ',due:'Wiederholung fällig',first:'Im ersten Versuch richtig',picture:'Bild ansehen und deutsches Wort eingeben',
      askBoth:'Singular (mit Artikel) und Plural eingeben',askOne:'Singular mit Artikel eingeben',askPlural:'Plural mit Artikel eingeben',
      both:'Format: der Apfel, Äpfel (auch die Äpfel erlaubt)',singular:'Nur Singular: das Wasser',plural:'Nur Plural: die Arbeitsbedingungen',
      check:'Prüfen ↵',next:'Nächstes Bild ↵',listen:'🔊 Noch einmal hören',
      retry:'Noch nicht ganz richtig. Ein zweiter Versuch!',good:'Auf Anhieb richtig!',second:'Im zweiten Versuch richtig!',wrong:'Merke dir die richtige Lösung.',dueWord:'Jetzt wiederholen',newWord:'Neuer Begriff',extra:'Freies Training · vorgezogene Wiederholung',
      repeat:'Nächste Wiederholung: ',n:'N-Deklination: Schwache maskuline Nomen erhalten in den meisten Singularfällen außer dem Nominativ -n/-en.',
      tools:'Lernstand sichern',storage:'Der Lernstand bleibt ausschließlich in diesem Browser. Beim Löschen von Browserdaten kann er verloren gehen.',
      export:'Lernstand exportieren',import:'Import:',foot:'Derzeit {count} Bildkarten: Projektillustrationen und redaktionell geprüfte Mulberry-Symbole. Wiederholungsintervalle sind von Ebbinghaus inspiriert, keine individuell kalibrierte Prognose. Audio verwendet die verfügbare Gerätestimme.',
      invalid:'Ungültige Sicherungsdatei.',loaded:'Lernstand importiert.',savefail:'Fortschritt konnte nicht gespeichert werden. Bitte Sicherung exportieren.',speechfail:'Keine deutsche Sprachausgabe verfügbar.',empty:'Keine Bildwörter verfügbar.'
    },
    en:{
      feedbackTitle:'Feedback on this card', feedbackNote:'Your feedback stays in this browser. You can export it and share it yourself.', feedbackExport:'Export card feedback',
      image:'Unclear image', word:'Unclear word or translation', audio:'Missing audio',
      feedbackSaved:'Feedback saved in this browser.', feedbackTemporary:'Feedback kept for this page. Export it before leaving.',
      back:'← Learning corner',heading:'See the picture. <span>Type the word.</span>',subtitle:'No daily limit. Practise nouns with articles and number forms; actions and numbers have matching tasks. Enter checks; press Enter again for the next picture.',
      selectedWord:'Selected picture practice',alternatives:'Also accepted: ',
      tested:'Different words practised',attempts:'Exercises completed',caseNote:'Word recognised. Check capitalisation: ',due:'Due for review',first:'Correct on first try',picture:'Look at the picture and type the German word',
      askBoth:'Enter singular (with article) and plural',askOne:'Enter singular with article',askPlural:'Enter plural with article',
      both:'Format: der Apfel, Äpfel (also accepts die Äpfel)',singular:'Singular only: das Wasser',plural:'Plural only: die Arbeitsbedingungen',
      check:'Check ↵',next:'Next picture ↵',listen:'🔊 Listen again',
      retry:'Not quite right. Try one more time!',good:'Correct on the first try!',second:'Correct on the second try!',wrong:'Remember the correct answer.',dueWord:'Time to review',newWord:'New word',extra:'Free practice · early review',
      repeat:'Next review: ',n:'N-declension: Weak masculine nouns usually take -n/-en outside the nominative singular.',
      tools:'Back up progress',storage:'Progress is saved only in this browser. Clearing browser data may delete it.',
      export:'Export progress',import:'Import:',foot:'Currently {count} picture cards: project illustrations and editorially reviewed Mulberry symbols. Intervals are inspired by the Ebbinghaus forgetting curve, not fitted to individual memory. Audio uses the device voice.',
      invalid:'Invalid backup file.',loaded:'Progress imported.',savefail:'Could not save progress. Please export a backup.',speechfail:'German speech is not available on this device.',empty:'No pictured vocabulary is available.'
    }
  };
  let lang = 'zh';
  let progress = {version:1,tested:0,firstCorrect:0,items:{}};
  let current = null, stage = 0, wasFirstWrong = false;
  const feedback = new Map();
  let feedbackMessage = '';
  // A gallery link can open one chosen card; subsequent cards use the due-first queue.
  let requestedID = new URLSearchParams(window.location?.search || '').get('word');
  const normal = s => String(s||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE');
  const simple = s => normal(s).replace(/^die\s+/,'');
  const escapeTag = s => String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const t = key => COPY[lang][key];
  function parseProgress(x) {
    if (!x || x.version!==1 || !Number.isSafeInteger(x.tested) || x.tested<0 ||
        !Number.isSafeInteger(x.firstCorrect) || x.firstCorrect<0 || x.firstCorrect>x.tested ||
        !x.items || Array.isArray(x.items) || typeof x.items!=='object') return null;
    for (const [key,r] of Object.entries(x.items)) {
      if (!/^[a-zA-Z0-9_-]{1,80}$/.test(key) || ['__proto__','constructor','prototype'].includes(key) || !r || !Number.isSafeInteger(r.seen) || r.seen<0 ||
          !Number.isSafeInteger(r.streak) || r.streak<0 ||
          !Number.isFinite(r.due) || r.due<0 || !Number.isFinite(r.last) || r.last<0) return null;
    }
    return x;
  }
  function readLatestProgress(){
    try { const clean=parseProgress(JSON.parse(localStorage.getItem(STORAGE))); if(clean)progress=clean; } catch(e){}
  }
  readLatestProgress();
  try { const locale=localStorage.getItem(STORAGE+'-lang'); if(Object.hasOwn(COPY,locale))lang=locale; } catch(e){}
  function warn(message){$('warning').textContent=message;}
  function save(){
    try { localStorage.setItem(STORAGE,JSON.stringify(progress)); }
    catch(e){ warn(t('savefail')); }
  }
  function readFeedback() {
    try {
      const saved = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE));
      if (saved?.version !== 1 || !Array.isArray(saved.reports)) return;
      for (const report of saved.reports) {
        if (typeof report?.cardId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(report.cardId)
            || !FEEDBACK_REASONS.includes(report.reason)) continue;
        const {cardId, reason} = report;
        feedback.set(cardId + ':' + reason, {cardId, reason});
      }
    } catch {}
  }
  function renderFeedback() {
    $('feedback-status').textContent = feedbackMessage ? t(feedbackMessage) : '';
    $('feedback-export').disabled = feedback.size === 0;
  }
  function saveFeedback(cardId, reason) {
    readFeedback();
    feedback.set(cardId + ':' + reason, {cardId, reason});
    let message = 'feedbackSaved';
    try {
      localStorage.setItem(FEEDBACK_STORAGE, JSON.stringify({version:1, reports:[...feedback.values()]}));
    } catch {
      message = 'feedbackTemporary';
    }
    if (current?.word.id === cardId) feedbackMessage = message;
    renderFeedback();
  }
  function dueCount(){return words.filter(w=>progress.items[w.id] && progress.items[w.id].due<=Date.now()).length;}
  function stats(){
    $('tested').textContent=words.filter(w=>progress.items[w.id]?.seen>0).length;
    $('attempts').textContent=progress.tested;
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
    $('attempts-label').textContent=t('attempts');
    $('due-label').textContent=t('due');
    $('first-label').textContent=t('first');
    $('picture-note').textContent=t('picture');
    $('listen').textContent=t('listen');
    $('tools-title').textContent=t('tools');
    $('storage-note').textContent=t('storage');
    $('export').textContent=t('export');
    $('import-label').textContent=t('import');
    $('feedback-title').textContent=t('feedbackTitle');
    $('feedback-note').textContent=t('feedbackNote');
    $('feedback-export').textContent=t('feedbackExport');
    for (const reason of FEEDBACK_REASONS) $('feedback-'+reason).textContent=t(reason);
    renderFeedback();
    $('footnote').textContent=t('foot').replace('{count}',words.length);
    if(current) renderQuestion(false);
    stats();
  }
  function findNext(){
    const now=Date.now();
    if(requestedID){
      const selected=words.find(w=>w.id===requestedID);requestedID=null;
      if(selected)return {word:selected,kind:'selectedWord',extra:!!progress.items[selected.id] && progress.items[selected.id].due>now};
    }
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
    if(w.task)return w.de;
    const s=w.de,p=w.plural;
    if(w.numberMode==='singular') return s;
    if(w.numberMode==='plural') return p;
    return s+', '+String(p).replace(/^die\s+/i,'');
  }
  function matches(value,w){
    if(w.task)return [w.de,...(w.task.answers||[])].some(answer=>normal(value)===normal(answer));
    if(w.answerVariants?.some(variant=>matches(value,{...w,...variant,answerVariants:[]})))return true;
    const parts=String(value).replace(/，/g,',').split(',').map(normal);
    if(w.numberMode==='singular') return parts.length===1 && matchSing(parts[0],w);
    if(w.numberMode==='plural') return parts.length===1 && matchPlural(parts[0],w,true);
    return parts.length===2 && matchSing(parts[0],w) && matchPlural(parts[1],w,false);
  }
  function caseMatches(value,w){
    if(w.answerVariants?.some(variant=>matches(value,{...w,...variant,answerVariants:[]}) && caseMatches(value,{...w,...variant,answerVariants:[]})))return true;
    const clean=s=>String(s).normalize('NFC').trim().replace(/\s+/g,' ');
    if(w.task)return [w.de,...(w.task.answers||[])].some(answer=>clean(value)===clean(answer));
    const parts=String(value).replace(/，/g,',').split(',').map(clean);
    const singulars=[w.de,...(w.articleVariants||[]).map(a=>a+' '+w.de.replace(/^\S+\s+/,''))];
    if(w.numberMode==='singular')return singulars.includes(parts[0]);
    if(w.numberMode==='plural')return parts[0]===w.plural;
    return singulars.includes(parts[0])&&[w.plural,w.plural.replace(/^die\s+/,'')].includes(parts[1]);
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
    $('picture-note').textContent=w.context?.[lang] || t('picture');
    $('word-image').src=w.imagePath;
    $('word-image').alt='Illustration';
    renderImageCredit(w);
    $('round-note').textContent=t(current.kind);
    $('question').textContent=w.task ? w.task.prompt[lang] : t(w.numberMode==='both'?'askBoth':w.numberMode==='plural'?'askPlural':'askOne');
    $('format').textContent=w.task ? (w.task.hint?.[lang] || '') : t(w.numberMode==='both'?'both':w.numberMode==='plural'?'plural':'singular');
    $('submit').textContent=stage===2?t('next'):t('check');
    $('typed').placeholder=w.task?'…':w.numberMode==='both'?'der ..., ...':w.numberMode==='plural'?'die ...':'der / die / das ...';
    $('typed').removeAttribute('disabled');
    $('typed').readOnly=stage===2;
    $('listen').hidden=stage!==2;
    $('solution').hidden=stage!==2;
    if(reset){
      $('typed').value='';$('status').textContent='';$('status').className='status';
      $('card-feedback').open=false;
      feedbackMessage='';
      renderFeedback();
    }
    if(stage===2)fillSolution();
    // On a phone the next picture should remain visible before the keyboard opens.
    if(reset && window.matchMedia?.('(max-width:720px)').matches){
      $('typed').blur();
      $('word-image').scrollIntoView({block:'start'});
    } else $('typed').focus({preventScroll:true});
    stats();
  }
  function renderImageCredit(w){
    const credit=$('image-credit');
    credit.replaceChildren();
    if(!w.imageCredit){credit.textContent={de:'Projektillustration · TheTwoKings',en:'Project illustration · TheTwoKings',zh:'项目插图 · TheTwoKings'}[lang];return;}
    if(w.imageCredit.provider==='project'){
      credit.textContent={de:'Eigene SVG-Zeichnung · TheTwoKings · KI-gestützt',en:'Original SVG drawing · TheTwoKings · AI-assisted',zh:'原创 SVG 插图 · TheTwoKings · AI 辅助'}[lang];
      return;
    }
    credit.append('Mulberry Symbols · © Steve Lee · ');
    for(const [label,url] of [['Original',w.imageCredit.source],['CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0/']]){
      const a=document.createElement('a');a.href=url;a.textContent=label;a.target='_blank';a.rel='noopener';credit.append(a,' · ');
    }
    credit.append({de:'SVG unverändert',en:'SVG unchanged',zh:'SVG 未修改'}[lang]);
  }
  function nextWord(){
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
    readLatestProgress();
    current=findNext();
    $('card-feedback').hidden=!current;
    if(!current){$('question').textContent=t('empty');$('typed').disabled=true;return;}
    renderQuestion(true);
  }
  function speak(){
    if(!('speechSynthesis' in window)){warn(t('speechfail'));return;}
    const w=current.word, voice=new SpeechSynthesisUtterance(w.de+'. '+(!w.task && w.numberMode==='both'?w.plural:''));
    voice.lang='de-DE'; voice.rate=.85;
    const voices=window.speechSynthesis.getVoices();
    const german=voices.find(v=>v.lang.toLowerCase().startsWith('de'));
    if(voices.length&&!german){warn(t('speechfail'));return;}
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
    const alternatives=w.task?.answers || (w.answerVariants||[]).map(variant=>expected({...w,...variant}));
    $('accepted').hidden=!alternatives.length;
    $('accepted').textContent=alternatives.length?t('alternatives')+alternatives.join(' · '):'';
    $('declension').hidden=!w.nDeclension;
    $('declension').textContent=w.nDeclension?t('n'):'';
    $('repeat-note').textContent=t('repeat')+new Date(r.due).toLocaleString(lang==='zh'?'zh-CN':lang==='de'?'de-DE':'en-GB');
  }
  function resolve(ok,firstTry){
    const w=current.word,now=Date.now();
    // Another tab may have answered since this question was opened. Read inside
    // the origin-wide Web Lock before adding this attempt to the shared record.
    readLatestProgress();
    const old=progress.items[w.id]||{seen:0,streak:0,due:0,last:0};
    const early=old.due>now;
    const streak=ok&&firstTry?(early?old.streak:old.streak+1):0;
    const intervals=[1,3,7,14,30,60,120];
    let due=ok&&firstTry ? now+intervals[Math.min(streak-1,intervals.length-1)]*DAY :
            ok ? now+6*3600000 : now+10*60000;
    // An early successful review must not postpone its already planned due date.
    if(early && ok && firstTry) due=old.due;
    else if(early) due=Math.min(old.due,due);
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
    if(ok){const spelling=caseMatches(value,current.word);resolve(true,stage===0);if(!spelling)$('status').textContent+=' '+t('caseNote')+expected(current.word);return;}
    if(stage===0){
      stage=1;wasFirstWrong=true;
      $('status').className='status warn';$('status').textContent=t('retry');
      $('typed').focus();$('typed').select();
    } else resolve(false,false);
  }
  let composing=false;
  $('typed').addEventListener('compositionstart',()=>composing=true);
  $('typed').addEventListener('compositionend',()=>composing=false);
  $('typed').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.isComposing||composing||e.keyCode===229))e.preventDefault();});
  let submitting=false;
  $('entry').addEventListener('submit',e=>{
    e.preventDefault();if(composing||submitting)return;
    const value=$('typed').value;
    const locks=window.navigator?.locks;
    if(!locks?.request){submit(value);return;}
    submitting=true;
    return locks.request(STORAGE,()=>{if(!composing)submit(value);})
      .catch(()=>warn(t('savefail'))).finally(()=>{submitting=false;});
  });
  window.addEventListener?.('storage',e=>{
    if(e.key===STORAGE){readLatestProgress();stats();}
    if(e.key===FEEDBACK_STORAGE){readFeedback();renderFeedback();}
  });
  $('listen').addEventListener('click',speak);
  document.querySelectorAll('[data-char]').forEach(btn=>btn.addEventListener('click',()=>{
    const inp=$('typed'),start=inp.selectionStart,end=inp.selectionEnd;
    inp.value=inp.value.slice(0,start)+btn.dataset.char+inp.value.slice(end);
    inp.focus();inp.setSelectionRange(start+1,start+1);
  }));
  $('lang').addEventListener('change',e=>{
    lang=Object.hasOwn(COPY,e.target.value)?e.target.value:'zh';
    try{localStorage.setItem(STORAGE+'-lang',lang);}catch(err){}
    renderLang();
  });
  function downloadJson(data, name) {
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name+'-'+new Date().toISOString().slice(0,10)+'.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  $('export').addEventListener('click',()=>downloadJson(progress,'wilson-picture-progress'));
  for (const reason of FEEDBACK_REASONS) {
    $('feedback-'+reason).addEventListener('click',()=>{
      const cardId=current?.word.id;
      if (!cardId) return;
      const locks=window.navigator?.locks;
      if (!locks?.request) return saveFeedback(cardId, reason);
      return locks.request(FEEDBACK_STORAGE,()=>saveFeedback(cardId, reason))
        .catch(()=>saveFeedback(cardId, reason));
    });
  }
  $('feedback-export').addEventListener('click',()=>{
    readFeedback();
    if (feedback.size) downloadJson({version:1, reports:[...feedback.values()]},'wilson-card-feedback');
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
  readFeedback();
  renderLang();
  nextWord();
})();
