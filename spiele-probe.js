(() => {
  'use strict';
  const section = document.querySelector('.game-trials');
  if (!section) return;
  const copy = {
    de: {
      heading: 'Sams Spielecke', bowTitle: 'Wüstenbogen', dinoTitle: 'T. rex an Deck',
      bowHint: 'Der Wind drückt den Pfeil nach rechts. Halte links von der Mitte vor.',
      aim: 'Zielen', shoot: 'Probeschuss', bowLaunch: 'Wüstenbogen spielen ↗', dinoLaunch: 'Piratenjagd spielen ↗',
      positions: ['Weit links', 'Links', 'Mitte', 'Rechts', 'Weit rechts'],
      shot: ['Zu weit links. Korrigiere nach rechts.', 'Volltreffer!', 'Zu weit rechts. Halte weiter links vor.'],
      track: (lane, right) => 'Der Dino steht auf Feld ' + lane + ' und läuft nach ' + (right ? 'rechts' : 'links') + '. Wähle das Netz für seinen nächsten Schritt.',
      catch: lane => 'Gefangen auf Feld ' + lane + '!', miss: lane => 'Entwischt! Er ist auf Feld ' + lane + '.', net: lane => 'Netz ' + lane
    },
    en: {
      heading: 'Sam’s games', bowTitle: 'Desert Bow', dinoTitle: 'T. rex on deck',
      bowHint: 'The wind pushes the arrow to the right. Aim left of the bullseye.',
      aim: 'Aim', shoot: 'Take a shot', bowLaunch: 'Play Desert Bow ↗', dinoLaunch: 'Play Pirate Hunt ↗',
      positions: ['Far left', 'Left', 'Centre', 'Right', 'Far right'],
      shot: ['Too far left. Aim a little further right.', 'Bullseye!', 'Too far right. Aim further left.'],
      track: (lane, right) => 'The dinosaur is in lane ' + lane + ', moving ' + (right ? 'right' : 'left') + '. Pick a net for its next step.',
      catch: lane => 'Caught in lane ' + lane + '!', miss: lane => 'It got away to lane ' + lane + '!', net: lane => 'Net ' + lane
    },
    zh: {
      heading: 'Sam 的游戏角', bowTitle: '沙漠射箭', dinoTitle: '甲板上的霸王龙',
      bowHint: '风会把箭吹向右边。请瞄准靶心左侧。',
      aim: '瞄准', shoot: '试射一箭', bowLaunch: '开始沙漠射箭 ↗', dinoLaunch: '开始海盗捕龙 ↗',
      positions: ['最左侧', '左侧', '中间', '右侧', '最右侧'],
      shot: ['太靠左了。向右调整一点。', '正中靶心！', '太靠右了。再向左瞄一点。'],
      track: (lane, right) => '恐龙在第 ' + lane + ' 格，正在向' + (right ? '右' : '左') + '走。请选择它下一步会经过的网。',
      catch: lane => '在第 ' + lane + ' 格抓到了！', miss: lane => '扑空了！它跑到了第 ' + lane + ' 格。', net: lane => '第 ' + lane + ' 张网'
    }
  };
  const aim = section.querySelector('#trial-aim');
  const sight = section.querySelector('.trial-sight');
  const impact = section.querySelector('.trial-impact');
  const rex = section.querySelector('.trial-rex');
  const net = section.querySelector('.trial-net');
  const nets = [...section.querySelectorAll('[data-trial-net]')];
  let language, shot = null, caught = null, lane = 2, direction = 1;

  function bowPosition(offset) { return (77.5 + offset * 6.5) + '%'; }
  function lanePosition(n) { return (n * 20 - 10) + '%'; }

  function showAim() {
    sight.style.left = bowPosition(Number(aim.value));
    aim.setAttribute('aria-valuetext', copy[language].positions[Number(aim.value) + 2]);
  }
  function describeTurn() {
    const t = copy[language];
    section.querySelector('#trial-track').textContent = t.track(lane, direction === 1);
    if (caught !== null) section.querySelector('#dino-result').textContent = caught ? t.catch(lane) : t.miss(lane);
  }
  function applyLanguage() {
    const next = document.documentElement.lang.split('-')[0];
    const locale = Object.hasOwn(copy, next) ? next : 'de';
    if (locale === language) return;
    language = locale;
    const t = copy[language];
    section.querySelectorAll('[data-trial-copy]').forEach(el => { el.textContent = t[el.dataset.trialCopy]; });
    section.querySelectorAll('.trial-launch').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('lang', language);
      link.href = url.pathname + url.search;
    });
    nets.forEach(button => { button.querySelector('.trial-net-label').textContent = t.net(button.dataset.trialNet); });
    if (shot !== null) section.querySelector('#bow-result').textContent = t.shot[shot];
    showAim();
    describeTurn();
  }
  aim.addEventListener('input', showAim);
  section.querySelector('#trial-shoot').addEventListener('click', () => {
    const offset = Number(aim.value) + 1;
    shot = Math.sign(offset) + 1;
    impact.style.left = bowPosition(offset);
    impact.hidden = false;
    section.querySelector('#bow-result').textContent = copy[language].shot[shot];
  });
  nets.forEach(button => button.addEventListener('click', () => {
    const chosen = Number(button.dataset.trialNet);
    lane += direction;
    caught = chosen === lane;
    if (lane === 1 || lane === 5) direction *= -1;
    rex.style.left = lanePosition(lane);
    rex.classList.toggle('facing-left', direction < 0);
    net.style.left = lanePosition(chosen);
    net.hidden = false;
    describeTurn();
  }));
  applyLanguage();
  section.querySelectorAll('.trial-controls').forEach(el => { el.hidden = false; });
  new MutationObserver(applyLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
