'use strict';
// Rebuild the standalone download from the same vocabulary, review decisions and UI.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bundle=['wilson-lexicon.js','wilson-image-candidates.js','wilson-vocabulary.js'].map(read).join('\n');
const words=vm.runInNewContext(bundle+';WILSON_VOCABULARY.inputWords');
const images=Object.fromEntries(words.map(w=>[w.imagePath,'data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,w.imagePath)).toString('base64')]));
let html=read('wilson.html').replace(/<link rel="stylesheet" href="wilson\.css[^\"]*">/,'<style>'+read('wilson.css')+'</style>');
html=html.replace(/<script src="([^"?]+)(?:\?[^"\n]*)?"><\/script>/g,(_,file)=>{
 let script=read(file);
 if(file==='wilson.js')script='const OFFLINE_IMAGES='+JSON.stringify(images)+';\n'+script.replace('escapeText(w.imagePath)','escapeText(OFFLINE_IMAGES[w.imagePath] || w.imagePath)');
 return '<script>'+script.replace(/<\/script/gi,'<\\/script')+'</script>';
});
html=html.replace(/src="(wilson\/[^"\n]+\.svg)"/g,(_,file)=>'src="'+images[file]+'"');
// Links remain usable when the downloaded file is opened under file://.
html=html.replace(/href="(index\.html|wilson\.html|wilson-input\.html|wilson-image-review\.html|wilson\/mulberry\/LICENSE\.txt|wilson-offline\.html)"/g,(_,file)=>'href="https://thetwokings.de/'+file+'"');
html=html.replace(/<link rel="icon"[^>]*>/g,'');
html=html.replace('<body>','<body><div role="note" style="padding:10px;background:#d8ede1;text-align:center">Offline · '+words.length+' Bildkarten · 2026-11-26 · Bildquellenlinks benötigen Internet / Source links need internet / 图片来源链接需联网</div>');
fs.writeFileSync(path.join(root,'wilson-offline.html'),html);
console.log('Standalone offline file rebuilt from shared data:',words.length,'embedded picture cards.');
