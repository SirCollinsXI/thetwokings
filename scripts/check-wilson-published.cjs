'use strict';

const {execFileSync} = require('node:child_process');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {setTimeout: delay} = require('node:timers/promises');

const root = path.join(__dirname, '..');
const sources = ['wilson-lexicon.js', 'wilson-image-candidates.js', 'wilson-vocabulary.js'];
const source = sources.map(file => readFileSync(path.join(root, file), 'utf8')).join('\n');
const {words, candidates} = vm.runInNewContext(source + '\n({words: WILSON_VOCABULARY.inputWords, candidates: WILSON_IMAGE_CANDIDATES})');
const recent = candidates.filter(card => card.active && card.review?.decision === 'approved').at(-1);
const last = words.find(word => word.imagePath === recent.path);
const origin = 'https://thetwokings.de';

function render(route) {
  return execFileSync(process.env.CHROME || 'google-chrome', [
    '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--virtual-time-budget=3000', '--dump-dom', origin + route
  ], {encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore']});
}

async function checkPublished() {
  const gallery = render('/wilson-image-review');
  const count = Number(gallery.match(/id="summary">\s*(\d+) aktive Wörter/)?.[1]);
  if (!(count >= words.length)) throw new Error('Galerie: ' + (count || 'kein Zähler') + ', erwartet mindestens ' + words.length);
  const route = '/wilson-input?word=' + encodeURIComponent(last.id);
  const trainer = render(route);
  const imageTag = trainer.match(/<img\b[^>]*\bid="word-image"[^>]*>/)?.[0] || '';
  if (!imageTag.includes('src="' + last.imagePath + '"')) throw new Error('Falsches Trainerbild für ' + last.id);
  const asset = await fetch(new URL(last.imagePath, origin), {signal: AbortSignal.timeout(15000)});
  const expected = readFileSync(path.join(root, last.imagePath));
  if (!asset.ok || !Buffer.from(await asset.arrayBuffer()).equals(expected)) throw new Error('Veröffentlichtes Bild weicht ab: ' + last.imagePath);
  console.log('Öffentliche Galerie: ' + count + ' aktive Karten. Eingabetrainer und SVG bestätigt: ' + last.de + ' (' + last.id + ').');
}

async function main() {
  for (let attempt = 1; ; attempt++) {
    try {
      await checkPublished();
      return;
    } catch (error) {
      if (attempt === 12) throw error;
      console.log('Warte auf die Veröffentlichung: ' + error.message);
      await delay(15000);
    }
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
