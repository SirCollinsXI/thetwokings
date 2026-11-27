'use strict';

(() => {
  const copy = {
    de: {
      title: 'Deck frei!', back: '← Zur Piratenjagd', board: 'Piratendeck', language: 'Sprache',
      goal: 'Öffne ein Gatter und lotse den T. rex ins passende Netz.',
      gate: 'Gatter öffnen', net: 'Netz auslösen', left: 'Links', right: 'Rechts',
      keys: 'Tastatur: ← → für das Gatter, 1 oder 2 für das Netz, P für Pause.',
      loading: 'Deck wird geladen …', start: 'Los geht’s', replay: 'Seiten tauschen', pause: 'Pause', resume: 'Weiterspielen',
      ready: 'Der T. rex wartet. Starte die Runde und wähle seinen Weg.',
      openLeft: 'Das linke Gatter ist offen. Bis zur Gabelung kannst du wechseln.',
      openRight: 'Das rechte Gatter ist offen. Bis zur Gabelung kannst du wechseln.',
      lockedLeft: 'Er läuft nach links. Warte, bis er das Fangfeld erreicht.',
      lockedRight: 'Er läuft nach rechts. Warte, bis er das Fangfeld erreicht.',
      nowLeft: 'Jetzt das linke Netz auslösen!', nowRight: 'Jetzt das rechte Netz auslösen!',
      late: 'Er ist am Fangfeld vorbei. Gleich kommt er wieder.',
      falling: 'Das Netz fällt …', paused: 'Pause. Der T. rex wartet auf dich.',
      catch: 'Gefangen! Der T. rex ruht sich aus. Noch einmal auf der anderen Seite?',
      graze: 'Fast! Das Netz hat ihn gestreift. Er kommt noch einmal.',
      miss: 'Das Netz blieb leer. Achte auf seine Spur und das Fangfeld.',
      wrong: 'Das Netz fiel auf die andere Spur. Schau, welches Gatter offen ist.',
      early: 'Das Netz war etwas zu früh. Lass den Dino näher herankommen.',
      lateNet: 'Der Dino war schon vorbei. Lass das Netz nächstes Mal etwas früher fallen.',
      empty: 'Der T. rex dreht eine neue Runde. Beim Fangfeld ist dein Netz gefragt.',
      error: 'Das Deck konnte nicht geladen werden. Bitte lade die Seite noch einmal.'
    },
    en: {
      title: 'Clear the deck!', back: '← Back to Pirate Hunt', board: 'Pirate deck', language: 'Language',
      goal: 'Open a gate and guide the T. rex into the matching net.',
      gate: 'Open a gate', net: 'Drop a net', left: 'Left', right: 'Right',
      keys: 'Keyboard: ← → for the gate, 1 or 2 for the net, P to pause.',
      loading: 'Loading the deck …', start: 'Let’s play', replay: 'Switch sides', pause: 'Pause', resume: 'Resume',
      ready: 'The T. rex is waiting. Start the round and choose its path.',
      openLeft: 'The left gate is open. You can switch until the fork.',
      openRight: 'The right gate is open. You can switch until the fork.',
      lockedLeft: 'It’s going left. Wait until it reaches the catch zone.',
      lockedRight: 'It’s going right. Wait until it reaches the catch zone.',
      nowLeft: 'Drop the left net now!', nowRight: 'Drop the right net now!',
      late: 'It passed the catch zone. It’ll be back for another lap.',
      falling: 'The net is falling …', paused: 'Paused. The T. rex will wait for you.',
      catch: 'Caught! The T. rex is resting. Try the other side?',
      graze: 'So close! The net brushed past. Here comes another lap.',
      miss: 'Empty net. Watch the path and the catch zone.',
      wrong: 'The net fell in the other lane. Watch which gate is open.',
      early: 'The net dropped too soon. Let the dinosaur come closer.',
      lateNet: 'The dinosaur got past. Drop the net a little earlier next time.',
      empty: 'The T. rex is coming around again. Use your net at the catch zone.',
      error: 'The deck could not be loaded. Please reload this page.'
    },
    zh: {
      title: '清空甲板！', back: '← 返回海盗追捕', board: '海盗船甲板', language: '语言',
      goal: '打开一道闸门，把霸王龙引到对应的捕网下。', gate: '打开闸门', net: '放下捕网', left: '左边', right: '右边',
      keys: '键盘：← → 选择闸门，1 或 2 放下捕网，P 暂停。',
      loading: '正在加载甲板……', start: '开始游戏', replay: '交换两侧', pause: '暂停', resume: '继续',
      ready: '霸王龙在等你。开始后选择它要走的路线。',
      openLeft: '左边的闸门已开。到达岔路前可以更换。', openRight: '右边的闸门已开。到达岔路前可以更换。',
      lockedLeft: '它往左走了。等它进入捕捉区。', lockedRight: '它往右走了。等它进入捕捉区。',
      nowLeft: '现在放下左边的网！', nowRight: '现在放下右边的网！',
      late: '它已经跑过捕捉区，很快会再跑一圈。', falling: '网正在落下……',
      paused: '已暂停。霸王龙在等你。', catch: '抓到了！霸王龙正在休息。要交换两侧再试一次吗？',
      graze: '差一点！网擦过了它，它还会再来。', miss: '网落空了。留意路线和捕捉区。',
      wrong: '网落在另一条路上了。看看哪边的闸门开着。', early: '网放早了。等霸王龙再靠近一点。', lateNet: '霸王龙已经跑过去了。下次早点放网。',
      empty: '霸王龙又跑了一圈。等它到了捕捉区就放网。', error: '甲板加载失败，请重新加载本页。'
    }
  };
  const $ = id => document.getElementById(id);
  const languageButtons = Array.from(document.querySelectorAll('[data-language]'));
  const gates = Array.from(document.querySelectorAll('[data-gate]'));
  const nets = Array.from(document.querySelectorAll('[data-net]'));
  const query = new URLSearchParams(location.search);
  let lang = query.get('lang');
  if (!Object.hasOwn(copy, lang)) {
    try { lang = sessionStorage.getItem('ttk-language'); } catch {}
  }
  if (!Object.hasOwn(copy, lang)) {
    const browserLang = navigator.language.slice(0, 2);
    lang = Object.hasOwn(copy, browserLang) ? browserLang : 'de';
  }
  const game = window.DeckMission?.create();
  let available = false;
  let failed = false;

  function messageKey(s) {
    if (failed) return 'error';
    if (!available) return 'loading';
    if (s.paused) return 'paused';
    if (s.phase === 'ready') return 'ready';
    if (s.phase === 'won') return 'catch';
    if (s.phase === 'retry') {
      if (s.result === 'graze') return 'graze';
      const misses = { 'wrong-lane': 'wrong', early: 'early', late: 'lateNet', 'no-drop': 'empty' };
      return misses[s.feedback] || 'miss';
    }
    if (s.armed) return 'falling';
    const right = (s.lane || s.gate) === 'right';
    if (!s.lane) return right ? 'openRight' : 'openLeft';
    if (s.inWindow) return right ? 'nowRight' : 'nowLeft';
    if (s.progress >= s.catchAt) return 'late';
    return right ? 'lockedRight' : 'lockedLeft';
  }

  function paint() {
    const s = game?.state;
    const key = messageKey(s);
    const message = copy[lang][key];
    if ($('message').textContent !== message) $('message').textContent = message;
    $('message').dataset.cue = key;
    const phase = s?.phase || 'ready';
    const running = available && phase === 'run' && !s.paused;
    $('go').hidden = !['ready','won'].includes(phase) || failed;
    $('go').disabled = !available;
    $('go').textContent = copy[lang][available ? phase === 'won' ? 'replay' : 'start' : 'loading'];
    $('pause').hidden = !available || !['run','retry'].includes(phase);
    $('pause').textContent = copy[lang][s?.paused ? 'resume' : 'pause'];
    gates.forEach(button => {
      button.disabled = !(running && !s.lane);
      button.setAttribute('aria-pressed', String(s?.gate === button.dataset.gate));
    });
    nets.forEach(button => { button.disabled = !running || Boolean(s.armed); });
  }

  function applyLanguage(updateUrl) {
    const t = copy[lang];
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.title = t.title + ' | TheTwoKings';
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = t[el.dataset.copy]; });
    $('languages').setAttribute('aria-label', t.language);
    languageButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.language === lang)));
    $('back').href = 'piratenjagd.html?lang=' + lang;
    if (updateUrl) {
      const url = new URL(location.href); url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
      try { sessionStorage.setItem('ttk-language', lang); } catch {}
    }
    paint();
  }

  $('go').onclick = () => {
    if (game.state.phase === 'won') game.replay();
    else game.start();
    paint();
  };
  function pause() { if (available) { game.togglePause(); paint(); } }
  $('pause').onclick = pause;
  gates.forEach(b => b.onclick = () => { game.setGate(b.dataset.gate); paint(); });
  nets.forEach(b => b.onclick = () => { game.drop(b.dataset.net); paint(); });
  languageButtons.forEach(b => b.onclick = () => { lang=b.dataset.language; applyLanguage(true); });
  document.addEventListener('keydown', event => {
    if (!available || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); game.setGate(event.key === 'ArrowLeft' ? 'left' : 'right');
    } else if (event.key === '1' || event.key === '2') {
      game.drop(event.key === '1' ? 'left' : 'right');
    } else if (event.code === 'KeyP') { pause(); return; }
    else return;
    paint();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && available && !game.state.paused && ['run','retry'].includes(game.state.phase)) pause();
  });
  applyLanguage(false);
  const fail = () => { failed = true; available = false; paint(); };
  if (!game || typeof window.createDeckScene !== 'function') { fail(); return; }
  let previousUI = '';
  try {
    window.createDeckScene($('deck-view'), {
      ready() { available=true; paint(); },
      fail,
      tick(milliseconds) {
        game.step(milliseconds);
        const s = game.state;
        const next = [s.phase,s.paused,s.gate,s.lane,Boolean(s.armed),messageKey(s)].join('|');
        if (next !== previousUI) { previousUI=next; paint(); }
        return s;
      }
    });
  } catch (error) { console.error(error); fail(); }
})();
