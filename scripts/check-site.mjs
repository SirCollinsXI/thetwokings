import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const file of fs.readdirSync(root)){
 if(file.endsWith('.js'))new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
 if(!file.endsWith('.html'))continue;
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
  if(/type=["']application\/json/.test(m[1]))JSON.parse(m[2]);else new vm.Script(m[2],{filename:file});
 }
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const link=m[1].split('#')[0];if(!link||link.includes(':')||link.startsWith('//')||link.includes('+'))continue;
  if(!fs.existsSync(path.join(root,link)))throw Error(file+' missing '+link);
 }
}
const data=JSON.parse(fs.readFileSync(path.join(root,'preisdaten.json'),'utf8'));
if(data.panels.flatMap(p=>p.series.flatMap(s=>s.points)).length!==251)throw Error('Price observation count changed');
if(/supabase|submit-score|fetch\(/i.test(fs.readFileSync(path.join(root,'piratenjagd.js'),'utf8')))throw Error('Unexpected network code in new game');
console.log('Scripts, JSON, local links and 251 price observations verified.');
