'use strict';

const $ = id => document.getElementById(id);
const eur = n => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const day = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
$('price-date').value = day();
$('price-date').max = day();

function records(value) {
  const entries = Array.isArray(value) ? value : [value];
  return entries.filter(entry => entry && typeof entry === 'object' && !Array.isArray(entry));
}

function validAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function showProfile(data) {
  if (!data || typeof data !== 'object') throw Error('Kein unterstützter Hardwarebericht.');
  const cpu = records(data.cpu).map(item => item.Name).filter(Boolean);
  const gpu = records(data.gpu).map(item => item.Name).filter(Boolean);
  const ram = records(data.ram);
  const board = records(data.board).map(item => [item.Manufacturer, item.Product].filter(Boolean).join(' ')).filter(Boolean);
  const disks = records(data.disks);
  const capacities = ram.map(item => item.Capacity);
  const speeds = ram.map(item => item.ConfiguredClockSpeed || item.Speed).filter(validAmount);
  const drives = disks.map(item => [
    item.FriendlyName,
    validAmount(item.Size) ? (Number(item.Size) / 1e12).toFixed(1) + ' TB' : '',
  ].filter(Boolean).join(' · ')).filter(Boolean);
  if (!cpu.length && !gpu.length && !capacities.some(validAmount) && !speeds.length && !board.length && !drives.length) {
    throw Error('Kein unterstützter Hardwarebericht.');
  }

  const totalRam = capacities.length && capacities.every(validAmount)
    ? (capacities.reduce((sum, size) => sum + Number(size), 0) / 1024 ** 3).toFixed(0) + ' GiB · ' + ram.length + ' Module'
    : '';
  const dl = document.createElement('dl');
  for (const [label, value] of [
    ['CPU', cpu.join(' · ')], ['GPU', gpu.join(' · ')], ['RAM', totalRam],
    ['RAM-Takt', speeds.map(speed => speed + ' MT/s laut Windows').join(' · ')],
    ['Mainboard', board.join(' · ')], ['Speicher', drives.join(' / ')],
  ]) {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value || 'Nicht angegeben';
    dl.append(dt, dd);
  }
  $('system-profile').replaceChildren(dl);
  $('clear-system').disabled = false;
}

let importVersion = 0;
$('system-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  const version = ++importVersion;
  event.target.value = '';
  try {
    if (file.size > 1000000) throw Error('Datei ist zu groß.');
    const raw = await file.text();
    if (version !== importVersion) return;
    let data;
    try { data = JSON.parse(raw.replace(/^\uFEFF/, '')); }
    catch { throw Error('Die Datei enthält kein gültiges JSON.'); }
    showProfile(data);
    $('import-status').textContent = 'Importiert. Das Profil bleibt nur in dieser geöffneten Seite.';
  } catch (err) {
    if (version === importVersion) $('import-status').textContent = 'Import nicht möglich: ' + err.message;
  }
});
$('clear-system').onclick = () => {
  importVersion++;
  $('system-profile').textContent = 'Kein Hardwareprofil geladen.';
  $('import-status').textContent = 'Profil aus dieser Ansicht entfernt.';
  $('clear-system').disabled = true;
  $('system-file').focus();
};

const nextSteps = {
  none: ['Behalten ist auch ein Upgrade-Plan.', 'Wenn dein PC deine Aufgaben gut erfüllt, besteht aktuell kein begründeter Kaufbedarf. Nutze Preisreihen, um einen späteren Kauf vorzubereiten.'],
  disk: ['Kapazität statt Plattformwechsel.', 'Prüfe zuerst, welche Dateien und Programme den meisten Platz belegen. Reicht Aufräumen nicht aus, sieh im Mainboard-Handbuch nach, welche weitere SSD passt.'],
  ram: ['RAM-Engpass erst bestätigen.', 'Öffne die Programme, bei denen dein PC langsamer wird. Schließe eine große Anwendung. Wird der PC schneller und sinkt die Speicherauslastung deutlich, prüfe den Arbeitsspeicher genauer.'],
  ramHigh: ['Arbeitsspeicher zuerst prüfen.', 'Der Arbeitsspeicher ist während des Problems fast voll. Wiederhole die Messung ohne Hintergrundprogramme. Bevor du mehr RAM kaufst, prüfe die freien Steckplätze und den unterstützten Speichertyp.'],
  fps: ['Engpass noch nicht eindeutig.', 'Eine langsame Anwendung kann verschiedene Ursachen haben. Probiere zuerst den folgenden Vergleich.'],
  gpuHigh: ['Grafikleistung als ersten Kandidaten testen.', 'Die GPU ist während des Problems stark ausgelastet. Teste zuerst, ob eine geringere Grafiklast die Wartezeit verkürzt.'],
};
const useChecks = {
  gaming: 'Prüfe im selben Spiel dieselbe Szene bei niedrigerer Auflösung. Verbessert sich die Bildrate, lohnt ein genauerer Blick auf die GPU.',
  creative: 'Miss dieselbe Vorschau oder denselben Export zweimal. Prüfe dabei, ob die Anwendung die GPU-Beschleunigung unterstützt und nutzt.',
  office: 'Wiederhole genau die langsame Aufgabe. Sortiere die Prozesse im Task-Manager nach CPU, Arbeitsspeicher und Datenträger und beobachte, was dabei ansteigt.',
  '': 'Wiederhole dieselbe Aufgabe und beobachte, ob dabei GPU, Arbeitsspeicher oder Datenträger dauerhaft stark ausgelastet sind.',
};

function updateQuestions() {
  const symptom = $('symptom').value;
  const fps = symptom === 'fps', memory = symptom === 'ram';
  $('work-use').hidden = !fps;
  $('load-details').hidden = !fps && !memory;
  $('gpu-field').hidden = !fps;
  $('ram-field').hidden = !memory;
  $('gpu-load').disabled = !fps;
  $('ram-load').disabled = !memory;
  $('upgrade-result').hidden = true;
}

$('symptom').addEventListener('change', updateQuestions);
$('upgrade-form').addEventListener('input', () => { $('upgrade-result').hidden = true; });
$('upgrade-form').addEventListener('submit', event => {
  event.preventDefault();
  const symptom = $('symptom').value;
  let outcome = symptom;
  if (symptom === 'ram' && $('ram-load').valueAsNumber >= 90) outcome = 'ramHigh';
  if (symptom === 'fps' && $('gpu-load').valueAsNumber >= 95) outcome = 'gpuHigh';
  if (!Object.hasOwn(nextSteps, outcome)) return;
  const [title, advice] = nextSteps[outcome];
  $('upgrade-title').textContent = title;
  $('upgrade-advice').textContent = advice;
  $('upgrade-context').textContent = symptom === 'fps' ? useChecks[$('use').value] : '';
  $('upgrade-context').hidden = symptom !== 'fps';
  $('upgrade-result').hidden = false;
  $('upgrade-title').focus();
});
updateQuestions();

const NS='http://www.w3.org/2000/svg';function svgEl(tag,attrs={},txt){const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));if(txt!==undefined)n.textContent=txt;return n}function baseChart(target,max,yLabel){const s=svgEl('svg',{viewBox:'0 0 740 300',role:'img','aria-label':yLabel});for(let i=0;i<=4;i++){const y=250-i*52;s.append(svgEl('line',{x1:65,x2:715,y1:y,y2:y,class:'grid'}),svgEl('text',{x:55,y:y+4,'text-anchor':'end'},String(Math.round(max*i/4))))}s.append(svgEl('text',{x:65,y:20},yLabel));target.replaceChildren(s);return s}
const market=[{q:'Q1/26',dram:[90,95],nand:[55,60]},{q:'Q2/26',dram:[58,63],nand:[70,75]},{q:'Q3/26',dram:[13,18],nand:[10,15]},{q:'Q4/26',dram:[10,15],nand:[15,20]}];const marketSvg=baseChart($('market-chart'),100,'Veränderung zum Vorquartal (%) · damalige Prognosen');market.forEach((p,i)=>{const x=145+i*165;marketSvg.append(svgEl('text',{x,y:280,'text-anchor':'middle'},p.q));for(const [j,k]of ['dram','nand'].entries()){const a=p[k],bx=x+(j?17:-17),color=j?'#c8fa72':'#a78afa';marketSvg.append(svgEl('line',{x1:bx,x2:bx,y1:250-a[0]*2.08,y2:250-a[1]*2.08,stroke:color,'stroke-width':12,'stroke-linecap':'round'}));const dot=svgEl('circle',{cx:bx,cy:250-(a[0]+a[1])/2*2.08,r:3,fill:'#17171b'});dot.append(svgEl('title',{},`${p.q} ${k.toUpperCase()}: +${a[0]}–${a[1]} %`));marketSvg.append(dot)}});
const STORE='ttk-price-history-v1';let series=Object.create(null);function validPoint(p){return p&&typeof p.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)&&!isNaN(Date.parse(p.date))&&new Date(p.date).toISOString().slice(0,10)===p.date&&p.date<=day()&&Number.isFinite(p.price)&&p.price>0&&p.price<1e8&&typeof p.source==='string'&&p.source.trim().length>0}try{const saved=JSON.parse(localStorage.getItem(STORE)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){for(const [key,points]of Object.entries(saved).slice(0,100))if(Array.isArray(points)&&!['__proto__','constructor','prototype'].includes(key))series[key]=points.filter(validPoint).slice(0,3000)}}catch{}
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(series));
    return true;
  } catch {
    return false;
  }
}
function reportRemoval() {
  $('price-status').textContent = save() ? '' : 'Browser-Speicher konnte nicht aktualisiert werden. Beim Neuladen können alte Daten wieder erscheinen.';
}
function selected(){return $('series-select').value}function updateSelect(wanted=selected()){const sel=$('series-select');sel.replaceChildren();for(const key of Object.keys(series))sel.add(new Option(key,key));if(!sel.options.length)sel.add(new Option('Noch keine Zeitreihe',''));else if(series[wanted])sel.value=wanted;renderPrices()}
function ordered(){return [...(series[selected()]||[])].sort((a,b)=>a.date.localeCompare(b.date))}function addSeries(name, points) {
  name = name.trim().slice(0, 120);
  if (!name || ['__proto__', 'constructor', 'prototype'].includes(name)) throw Error('Bitte einen gültigen Modellnamen eingeben.');
  if (Object.keys(series).length >= 100 && !series[name]) throw Error('Maximal 100 Modelle.');
  const prior = series[name] || [];
  const pointKey = p => JSON.stringify([p.date, p.price, p.source]);
  const seen = new Set(prior.map(pointKey));
  const additions = points.filter(p => {
    const key = pointKey(p);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (prior.length + additions.length > 3000) throw Error('Dieses Modell enthält bereits zu viele Preispunkte. Exportiere oder entferne zuerst ältere Einträge.');
  series[name] = [...prior, ...additions];
  const persisted = save();
  updateSelect(name);
  if (!persisted) return 'Preispunkte nur in dieser Ansicht. Exportiere die Zeitreihe vor dem Schließen.';
  return additions.length ? 'Preisbeobachtungen hinzugefügt.' : 'Diese Preisbeobachtungen sind bereits vorhanden.';
}
$('price-form').onsubmit=e=>{e.preventDefault();const p={date:$('price-date').value,price:Number($('observed-price').value),source:$('price-source').value.trim()};if(!validPoint(p)){$('price-status').textContent='Bitte Datum, positiven Preis und eine Quelle prüfen. Keine zukünftigen Daten.';return}try{$('price-status').textContent=addSeries($('sku').value,[p])}catch(err){$('price-status').textContent=err.message}};
function renderPrices(){const points=ordered(),container=$('price-chart');$('export-history').disabled=!points.length;$('clear-history').disabled=!selected();$('price-list').replaceChildren();if(!points.length){container.className='chart empty-chart';container.textContent='Noch keine Preispunkte vorhanden.';$('price-stats').textContent='';renderTiming();return}container.className='chart';const max=Math.max(...points.map(p=>p.price))*1.15,minTime=Date.parse(points[0].date),maxTime=Date.parse(points.at(-1).date),span=maxTime-minTime||86400000;const svg=baseChart(container,max,'Gesamtpreis in € · eigene Beobachtungen');const coords=points.map(p=>[65+(Date.parse(p.date)-minTime)/span*650,250-p.price/max*208]);svg.append(svgEl('polyline',{points:coords.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#c8fa72','stroke-width':2}));coords.forEach(([x,y],i)=>{const dot=svgEl('circle',{cx:x,cy:y,r:4,fill:'#c8fa72'});dot.append(svgEl('title',{},`${points[i].date}: ${eur(points[i].price)} · ${points[i].source}`));svg.append(dot)});svg.append(svgEl('text',{x:65,y:280},points[0].date),svgEl('text',{x:715,y:280,'text-anchor':'end'},points.at(-1).date));const values=points.map(p=>p.price),low=Math.min(...values),high=Math.max(...values),latest=points.at(-1).price;$('price-stats').textContent=`${points.length} Beobachtungen · Tief ${eur(low)} · Hoch ${eur(high)} · zuletzt ${eur(latest)}`;points.forEach(p=>{const row=document.createElement('div');row.className='price-point';for(const v of [p.date,eur(p.price)]){const t=document.createElement('span');t.textContent=v;row.append(t)}let source;try{const url=new URL(p.source);if(!['https:','http:'].includes(url.protocol))throw Error();source=document.createElement('a');source.href=url.href;source.target='_blank';source.rel='noopener';source.textContent=url.hostname}catch{source=document.createElement('span');source.textContent=p.source}const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label',`Preispunkt vom ${p.date} entfernen`);remove.onclick=()=>{const index=series[selected()].indexOf(p);if(index>=0)series[selected()].splice(index,1);reportRemoval();renderPrices()};row.append(source,remove);$('price-list').append(row)});renderTiming()}
function renderTiming(){const points=ordered(),urgent=$('urgency').value==='yes',target=$('target-price').value===''?null:Number($('target-price').value);let title,advice;if(!points.length){title='Noch kein Kaufpreis-Signal.';advice='Lege eine belegte Zeitreihe für ein exaktes Modell an. Der Speichermarktausblick allein bestimmt deinen Kaufzeitpunkt nicht.'}else{const last=points.at(-1),age=(Date.parse(day())-Date.parse(last.date))/86400000,span=(Date.parse(last.date)-Date.parse(points[0].date))/86400000,days=new Set(points.map(p=>p.date)).size,low=Math.min(...points.map(p=>p.price));if(age>14){title='Preisstand aktualisieren.';advice=`Der jüngste Preis ist ${Math.floor(age)} Tage alt. Prüfe Verfügbarkeit und aktuellen Gesamtpreis, bevor du eine Kaufentscheidung triffst.`}else if(days<3||span<30){title='Noch zu wenig Historie.';advice='Für die Preisregel fehlen mindestens 3 Beobachtungstage über 30 Tage. '+(urgent?'Bei echtem Engpass kann der Nutzen eines sofortigen Kaufs überwiegen; vergleiche aktuelle Angebote.':'Wenn dein System reicht, sammle weitere vergleichbare Preispunkte.')}else if(target!==null&&last.price>target){title='Dein Zielpreis ist noch nicht erreicht.';advice=`Der letzte Preis ${eur(last.price)} liegt ${eur(last.price-target)} über deinem Ziel. `+(urgent?'Wäge diesen Aufpreis gegen den konkreten Engpass ab.':'Beobachten ist anhand deines selbst gewählten Preisziels nachvollziehbar.')}else if(last.price<=low*1.05&&urgent){title='Kauf anhand deiner Regeln vertretbar.';advice='Ein konkreter Engpass besteht und der letzte Preis liegt höchstens 5 % über dem beobachteten Tief. Prüfe Kompatibilität, Händler und aktuelle Verfügbarkeit. Ein künftig günstigerer Preis bleibt möglich.'}else if(!urgent){title='Kein Kaufdruck aus deinem Bedarf.';advice='Dein System reicht aktuell. Auch ein Preis nahe dem beobachteten Tief schafft allein keinen Bedarf. Beobachte dein exaktes Modell weiter.'}else{title='Bedarf vorhanden, Preis weiter vergleichen.';advice=`Der jüngste Preis liegt ${((last.price/low-1)*100).toFixed(1)} % über deinem beobachteten Tief. Prüfe Alternativen und bewerte die Kosten des Wartens gegenüber dem Upgrade-Nutzen.`}}$('timing-title').textContent=title;$('timing-advice').textContent=advice}
$('series-select').onchange=()=>{if(selected())$('sku').value=selected();renderPrices()};$('urgency').onchange=renderTiming;$('target-price').oninput=renderTiming;$('clear-history').onclick=()=>{if(!selected())return;delete series[selected()];reportRemoval();updateSelect()};
function parseCSV(raw){raw=raw.replace(/^\uFEFF/,'');const delimiter=raw.split(/\r?\n/,1)[0].includes(';')?';':',';let rows=[],row=[],cell='',quoted=false;for(let i=0;i<raw.length;i++){const c=raw[i];if(c==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===delimiter&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&raw[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell=''}else cell+=c}if(quoted)throw Error('Ungeschlossene Anführungszeichen in CSV.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows}
$('price-file').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1000000)throw Error('CSV maximal 1 MB.');const rows=parseCSV(await f.text());if(!rows.length)throw Error('CSV ist leer.');const header=rows.shift().map(x=>x.trim().toLowerCase());if(header.join(';')!=='datum;preis;quelle')throw Error('Erwartete Spalten: datum;preis;quelle');const points=rows.map((r,i)=>{const p={date:r[0]?.trim(),price:Number(r[1]?.trim().replace(',','.')),source:r[2]?.trim()};if(r.length!==3||!validPoint(p))throw Error('Ungültiger Preispunkt in Zeile '+(i+2));return p});if(!points.length)throw Error('Keine Preispunkte in der Datei.');$('price-status').textContent=addSeries($('sku').value,points)}catch(err){$('price-status').textContent=err.message}finally{e.target.value=''}};
$('export-history').onclick=()=>{if(!selected())return;const q=s=>'"'+String(s).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';const csv='\ufeffdatum;preis;quelle\r\n'+ordered().map(p=>[p.date,p.price,p.source].map(q).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=selected().replace(/[^a-z0-9_-]/gi,'_')+'-preise.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('tco-form').onsubmit=e=>{e.preventDefault();const price=Number($('tco-price').value),resale=Number($('tco-resale').value),years=Number($('tco-years').value),watts=Number($('tco-watts').value),hours=Number($('tco-hours').value),idle=Number($('tco-idle').value),idleHours=Number($('tco-idle-hours').value),electricity=Number($('tco-electricity').value);if(resale>price){$('tco-result').textContent='Restwert darf in diesem Kostenmodell nicht höher als der Kaufpreis sein.';return}if(hours+idleHours>8760){$('tco-result').textContent='Last- und Leerlaufstunden dürfen zusammen 8.760 Stunden pro Jahr nicht überschreiten.';return}const power=(watts*hours+idle*idleHours)/1000*electricity,total=price-resale+years*power;$('tco-result').textContent=`${eur(total)} über ${years} Jahre · ${eur(total/years)} pro Jahr · davon Strom ${eur(power)} pro Jahr.`};updateSelect();
