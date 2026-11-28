'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = [
  'wilson-lexicon.js',
  'wilson-image-candidates.js',
  'wilson-vocabulary.js'
].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n') + `
;globalThis.__WILSON_MISSING_AUDIT__ = (() => {
  const activeIds = new Set(WILSON_VOCABULARY.inputWords.map(word => word.id));
  const missing = WILSON_VOCABULARY.words
    .filter(word => word.pos === 'noun' && !word.picture)
    .map(word => {
      const match = /^(der|die|das)\\s+(.+)$/.exec(word.de || '');
      return {
        id: word.id,
        article: match?.[1] || '',
        singular: match?.[2] || word.de,
        de: word.de,
        plural: word.plural,
        en: word.en,
        zh: word.zh,
        pinyin: word.pinyin,
        cat: word.cat,
        pages: word.pages,
        articleVariants: word.articleVariants || [],
        nDeclension: word.nDeclension === true,
        numberMode: word.numberMode
      };
    })
    .sort((left, right) => {
      const categoryOrder = ['home', 'food', 'clothes', 'travel', 'health', 'family', 'work', 'numbers'];
      const categoryDifference = categoryOrder.indexOf(left.cat) - categoryOrder.indexOf(right.cat);
      if (categoryDifference) return categoryDifference;
      return Number(String(left.id).replace(/\\D/g, '')) - Number(String(right.id).replace(/\\D/g, ''));
    });
  return {
    activeCount: WILSON_VOCABULARY.activeCount,
    target: WILSON_VOCABULARY.target,
    activeIds: [...activeIds],
    missing
  };
})();`;

const context = {};
vm.createContext(context);
vm.runInContext(source, context, {filename: 'wilson-missing-audit.vm.js'});
const audit = context.__WILSON_MISSING_AUDIT__;

const outputPath = process.argv.find(argument => argument.startsWith('--json='))?.slice('--json='.length);
if (outputPath) fs.writeFileSync(path.resolve(outputPath), JSON.stringify(audit, null, 2) + '\n');

const counts = audit.missing.reduce((result, word) => {
  result[word.cat] = (result[word.cat] || 0) + 1;
  return result;
}, {});
console.log(`Wilson-Bildaudit: ${audit.activeCount} aktiv, ${audit.missing.length} unbebilderte Nomen, Ziel ${audit.target}.`);
console.log('Fehlende Nomen nach Kategorie: ' + Object.entries(counts).map(([category, count]) => `${category}=${count}`).join(', '));

if (process.env.GITHUB_ACTIONS === 'true' || process.argv.includes('--full')) {
  console.log('WILSON_MISSING_NOUNS_BEGIN');
  console.log(['ID', 'Artikel', 'Singular', 'Plural', 'Englisch', '简体中文', 'Kategorie', 'N-Deklination', 'Artikelvarianten'].join('\t'));
  for (const word of audit.missing) {
    console.log([
      word.id,
      word.article,
      word.singular,
      word.plural,
      word.en,
      word.zh,
      word.cat,
      word.nDeclension ? 'ja' : 'nein',
      word.articleVariants.join('|')
    ].map(value => String(value ?? '').replace(/[\t\r\n]+/g, ' ')).join('\t'));
  }
  console.log('WILSON_MISSING_NOUNS_END');
}
