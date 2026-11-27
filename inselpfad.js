'use strict';

(() => {
  const words = {
    de: {
      home: 'Zur Spielecke', language: 'Sprache', series: 'Dino-Kurier', title: 'Die Gezeitenpost',
      brief: 'Ein Brief für den Leuchtturm. Nimm den trockenen Höhenweg oder nutze die Ebbe für eine Abkürzung über die Riffe.',
      map: 'Inselkarte', how: 'Tippe auf ein Nachbarfeld oder nutze die Pfeiltasten. Mit der Leertaste wartest du. Jeder Zug wechselt die Gezeiten. Riffe kannst du bei Ebbe betreten.',
      order: 'Dein Postauftrag', walk: 'Laufen', up: 'Nach oben', right: 'Nach rechts', down: 'Nach unten', left: 'Nach links',
      tide: 'Wasserstand jetzt', next: 'Nach dem Zug', turns: 'Züge', low: 'Ebbe', high: 'Flut',
      wait: 'Gezeiten abwarten', reset: 'Neu starten', again: 'Noch einmal spielen',
      toPost: 'Zum Posthaus', postHint: 'Das Posthaus liegt zwei Felder über dem Steg.',
      toBeacon: 'Zum Leuchtturm', beaconHint: 'Der Brief ist in deiner Tasche. Oben führt der trockene Weg herum. Unten liegen zwei Riffe.',
      delivered: 'Post zugestellt!', endHint: 'Der Leuchtturm hat deinen Brief erhalten.',
      dock: 'Steg', post: 'Posthaus', beacon: 'Leuchtturm', island: 'Land', reef: 'Riff', sea: 'Wasser',
      here: 'Dein Standort', available: 'Erreichbar', column: 'Spalte', row: 'Reihe',
      start: 'Hol den Brief im Posthaus, zwei Felder über dem Steg.', walked: 'Angekommen', waited: 'Du bleibst stehen. Der Wasserstand wechselt.',
      seaBlocked: 'Hier ist tiefes Wasser. Such dir ein benachbartes Landfeld.',
      edge: 'Hier endet die Karte. Dein Dino bleibt stehen.', far: 'Immer ein Feld pro Zug. Wähle ein direktes Nachbarfeld.',
      tideBlocked: 'Das Riff liegt unter Wasser. Warte einen Zug auf die Ebbe oder nimm den Höhenweg.',
      parcel: 'Brief abgeholt! Jetzt zum Leuchtturm.', empty: 'Der Leuchtturm wartet auf seinen Brief. Hol ihn zuerst im Posthaus.',
      won: 'Zustellung geschafft', current: 'Hier steht dein Dino. Wähle ein Nachbarfeld oder warte auf die nächste Tide.'
    },
    en: {
      home: 'Back to games', language: 'Language', series: 'Dino Courier', title: 'The Tide Post',
      brief: 'A letter for the lighthouse. Take the dry ridge or catch the low tide for a shortcut across the reefs.',
      map: 'Island map', how: 'Tap a neighbouring square or use the arrow keys. Press Space to wait. Each turn changes the tide. You can step onto a reef at low tide.',
      order: 'Your delivery', walk: 'Move', up: 'Move up', right: 'Move right', down: 'Move down', left: 'Move left',
      tide: 'Tide now', next: 'After your turn', turns: 'Turns', low: 'Low tide', high: 'High tide',
      wait: 'Wait for the tide', reset: 'Start over', again: 'Play again',
      toPost: 'Reach the post office', postHint: 'The post office is two squares above the dock.',
      toBeacon: 'Reach the lighthouse', beaconHint: 'You have the letter. The dry ridge loops around the top. Two reefs cross the lower channel.',
      delivered: 'Letter delivered!', endHint: 'Your letter has reached the lighthouse.',
      dock: 'Dock', post: 'Post office', beacon: 'Lighthouse', island: 'Land', reef: 'Reef', sea: 'Water',
      here: 'You are here', available: 'Within reach', column: 'Column', row: 'Row',
      start: 'Collect the letter at the post office, two squares above the dock.', walked: 'Arrived', waited: 'You stay put while the tide turns.',
      seaBlocked: 'That is deep water. Choose a neighbouring land square.',
      edge: 'That is the edge of the map. Your dino stays put.', far: 'One square at a time. Choose a direct neighbour.',
      tideBlocked: 'This reef is submerged. Wait one turn for low tide or take the ridge.',
      parcel: 'Letter collected! Next stop, the lighthouse.', empty: 'The lighthouse is waiting for its letter. Pick it up at the post office first.',
      won: 'Delivery complete', current: 'Your dino is here. Choose a neighbouring square or wait for the tide.'
    },
    zh: {
      home: '返回游戏区', language: '语言', series: '恐龙邮差', title: '潮汐邮局',
      brief: '灯塔在等一封信。你可以沿高地绕行，也可以趁退潮抄近路穿过礁石。',
      map: '海岛地图', how: '轻点相邻格子，或按方向键移动。按空格键等待。每个回合潮位都会变化，低潮时才能踏上礁石。',
      order: '你的送信任务', walk: '移动', up: '向上走', right: '向右走', down: '向下走', left: '向左走',
      tide: '当前潮位', next: '下一回合', turns: '回合数', low: '低潮', high: '高潮',
      wait: '等待潮汐变化', reset: '重新开始', again: '再玩一次',
      toPost: '前往邮局', postHint: '邮局在码头正上方两格。', toBeacon: '前往灯塔', beaconHint: '信已装进邮袋。上方的高地可以绕行，下方的近路要经过两处礁石。',
      delivered: '信已送达！', endHint: '灯塔收到了你送来的信。',
      dock: '码头', post: '邮局', beacon: '灯塔', island: '陆地', reef: '礁石', sea: '海水',
      here: '你的位置', available: '可以抵达', column: '列', row: '行',
      start: '邮局在码头正上方两格，先去那里取信。', walked: '已到达', waited: '你原地等了一回合，潮位变了。',
      seaBlocked: '这里是深水区。请选择相邻的陆地。',
      edge: '已经到地图边缘了，小恐龙留在原地。', far: '每回合只能走一格，请选择上下左右相邻的格子。',
      tideBlocked: '礁石被海水淹没了。等一回合退潮，或者沿高地绕行。',
      parcel: '信已取到！下一站是灯塔。', empty: '灯塔正在等信，请先去邮局取信。',
      won: '送信成功', current: '小恐龙就在这里。可以走到相邻格子，或等一回合让潮位变化。'
    }
  };

  const core = GezeitenKern;
  const byId = id => document.getElementById(id);
  const board = byId('board');
  const cells = [];
  const languageButtons = [...document.querySelectorAll('[data-lang]')];
  const directionButtons = [...document.querySelectorAll('[data-dir]')];
  const arrows = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left', w: 'up', d: 'right', s: 'down', a: 'left', ' ': 'wait' };
  const url = new URL(window.location.href);
  const requested = (url.searchParams.get('lang') || 'de').toLowerCase().split('-')[0];
  let lang = Object.hasOwn(words, requested) ? requested : 'de';
  let state = core.start();
  let feedback = 'start';

  for (let y = 0; y < core.height; y++) {
    for (let x = 0; x < core.width; x++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'tile';
      Object.assign(cell.dataset, { x, y, terrain: core.terrain(x, y) });
      const art = document.createElement('span');
      art.className = 'tile-art';
      art.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'tile-name';
      cell.append(art, label);
      board.append(cell);
      cells.push(cell);
    }
  }
  function message(t) {
    if (feedback === 'walked') {
      return lang === 'zh' ? '已到达' + t[core.terrain(state.x, state.y)] + '。' : t.walked + ' · ' + t[core.terrain(state.x, state.y)] + '.';
    }
    if (feedback === 'won') {
      if (lang === 'zh') return t.won + '！共用了 ' + state.turn + ' 回合。';
      return t.won + ' · ' + state.turn + (lang === 'en' ? ' turns.' : ' Züge.');
    }
    return t[{ sea: 'seaBlocked', tide: 'tideBlocked' }[feedback] || feedback];
  }
  function render() {
    const t = words[lang];
    const tide = core.tide(state);
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
    document.title = t.title + ' · TheTwoKings';
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = t[el.dataset.copy]; });
    document.querySelectorAll('[data-label]').forEach(el => { el.setAttribute('aria-label', t[el.dataset.label]); });
    languageButtons.forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
    const returnPath = url.searchParams.get('from') === 'homepage-preview' ? '/homepage-preview' : '/';
    byId('home').href = returnPath + '?lang=' + lang + '#spiele';
    Object.assign(board.dataset, {
      x: state.x, y: state.y, status: state.won ? 'won' : 'playing', tide, carrying: state.carrying
    });
    for (const cell of cells) {
      const { x, y, terrain } = cell.dataset;
      const current = +x === state.x && +y === state.y;
      const available = !state.won && !core.blocked(state, +x, +y);
      cell.classList.toggle('current', current);
      cell.classList.toggle('step', available);
      cell.tabIndex = current ? 0 : -1;
      const location = lang === 'zh' ? '第' + (+y + 1) + '行第' + (+x + 1) + '列' : t.column + ' ' + (+x + 1) + ', ' + t.row + ' ' + (+y + 1);
      cell.setAttribute('aria-label', [t[terrain], location, current ? t.here : available ? t.available : ''].filter(Boolean).join(' · '));
      cell.lastElementChild.textContent = ['dock', 'post', 'beacon'].includes(terrain) ? t[terrain] : '';
    }
    byId('objective').textContent = t[state.won ? 'delivered' : state.carrying ? 'toBeacon' : 'toPost'];
    byId('route').textContent = t[state.won ? 'endHint' : state.carrying ? 'beaconHint' : 'postHint'];
    byId('tide').textContent = t[tide];
    byId('next').textContent = state.won ? '—' : t[tide === 'low' ? 'high' : 'low'];
    byId('turn').textContent = String(state.turn);
    byId('signal').dataset.event = feedback;
    byId('signal').textContent = message(t);
    byId('wait').disabled = state.won;
    directionButtons.forEach(el => {
      el.setAttribute('aria-label', t[el.dataset.dir]);
      el.disabled = state.won;
    });
    byId('reset').textContent = t[state.won ? 'again' : 'reset'];
    window.GezeitenBild.draw(board);
  }
  function move(action, focusBoard) {
    const result = core.step(state, action);
    state = result.state;
    feedback = result.event;
    render();
    if (state.won) byId('reset').focus({ preventScroll: true });
    else if (focusBoard) board.querySelector('.current').focus({ preventScroll: true });
  }
  board.addEventListener('click', event => {
    const cell = event.target.closest('.tile');
    if (!cell || state.won) return;
    const dx = +cell.dataset.x - state.x;
    const dy = +cell.dataset.y - state.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      move(dx > 0 ? 'right' : dx < 0 ? 'left' : dy < 0 ? 'up' : 'down', true);
    } else {
      feedback = dx === 0 && dy === 0 ? 'current' : 'far';
      render();
      board.querySelector('.current').focus({ preventScroll: true });
    }
  });
  board.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !Object.hasOwn(arrows, event.key)) return;
    event.preventDefault();
    if (!event.repeat) move(arrows[event.key], true);
  });
  directionButtons.forEach(el => el.addEventListener('click', () => move(el.dataset.dir, false)));
  byId('wait').addEventListener('click', () => move('wait', false));
  byId('reset').addEventListener('click', () => {
    state = core.start();
    feedback = 'start';
    render();
    board.querySelector('.current').focus({ preventScroll: true });
  });
  languageButtons.forEach(el => el.addEventListener('click', () => {
    lang = el.dataset.lang;
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
    render();
  }));
  render();
})();
