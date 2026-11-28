'use strict';
// Rebuild the standalone download from the same vocabulary, review decisions and UI.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const onlineRoot='https://thetwokings.de/';
const bundle=['wilson-lexicon.js','wilson-image-candidates.js','wilson-vocabulary.js'].map(read).join('\n');
const words=vm.runInNewContext(bundle+';WILSON_VOCABULARY.inputWords');
const images=Object.fromEntries(words.map(w=>[w.imagePath,'data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,w.imagePath)).toString('base64')]));
let html=read('wilson.html').replace(/<link rel="stylesheet" href="(wilson(?:-learning)?\.css)(?:\?[^"\n]*)?">/g,(_,file)=>'<style>'+read(file)+'</style>');
html=html.replace(/<script\b([^>]*)>\s*<\/script\s*>/gi,(tag,attributes)=>{
 const source=attributes.match(/(?:^|\s)src\s*=\s*(["'])([^"']+)\1/i);
 if(!source)return tag;
 const file=source[2].split(/[?#]/)[0];
 let script=read(file);
 if(file==='wilson.js')script='const OFFLINE_IMAGES='+JSON.stringify(images)+';\n'+script.replace('escapeText(w.imagePath)','escapeText(OFFLINE_IMAGES[w.imagePath] || w.imagePath)')
   .replace("'wilson-input.html?lang='",JSON.stringify(onlineRoot+'wilson-input.html?lang='));
 if(file==='wilson-storage.js')script=script.replace("'wilson-backup.html?lang='",JSON.stringify(onlineRoot+'wilson-backup.html?lang='));
 if(file==='wilson-profile.js')script=script.replace("page + '.html?lang='",JSON.stringify(onlineRoot)+" + page + '.html?lang='");
 // Keep data-section on the inline element so currentScript remains meaningful.
 // Its src is empty after inlining, so the navigation's URL base is made explicit.
 if(file==='homepage-project-nav.js')script=script.replace(/\bscript\.src\b/g,JSON.stringify(onlineRoot+file));
 // Inline classic scripts execute in template order; profile/storage register
 // their own DOMContentLoaded handlers and must not remain external downloads.
 const inlineAttributes=attributes.replace(/(^|\s)src\s*=\s*(["'])[^"']+\2/i,'$1').replace(/\s+(?:defer|async)(?=\s|$)/gi,'').trim();
 return '<script'+(inlineAttributes?' '+inlineAttributes:'')+'>'+script.replace(/<\/script/gi,'<\\/script')+'</script>';
});
html=html.replace(/src="(wilson\/[^"\n]+\.svg)"/g,(_,file)=>'src="'+images[file]+'"');
// Links remain usable when the downloaded file is opened under file://.
html=html.replace(/href="((?:[a-z0-9-]+\.html|wilson\/mulberry\/LICENSE\.txt)(?:[?#][^"\n]*)?)"/gi,(_,file)=>'href="'+onlineRoot+file+'"');
html=html.replace(/<link rel="icon"[^>]*>/g,'');
html=html.replace(/<body\b[^>]*>/i,body=>body+'<div role="note" style="padding:10px;background:#d8ede1;text-align:center">Offline · '+words.length+' Bildkarten · 2026-11-28 · Zusatzseiten/Bildquellen brauchen Internet; Online- und Offline-Lernstand sind getrennt. / Additional pages/image sources need internet; online and offline progress are separate. / 附加页面和图片来源需联网；在线与离线学习进度分开保存。</div>');
fs.writeFileSync(path.join(root,'wilson-offline.html'),html);
console.log('Standalone offline file rebuilt from shared data:',words.length,'embedded picture cards.');
