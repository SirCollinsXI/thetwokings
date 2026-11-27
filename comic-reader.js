'use strict';
const pages=[['01','Sam auf der Planke',1],['02','Die Bauchwelt',2],['03','Planke und oranges Tuch',3],['04','Flucht durch das Maul',4],['05','Sam auf dem Meer',5],['06A','Floß und Signal',6],['06B','Piet entdeckt das Signal',7],['07','Wiedersehen auf dem Meer',8],['08','Piet holt Hilfe',9],['09A','Klaus Störtebeker hilft',10],['09B','Die geheimnisvolle Insel',11],['11','Ankunft am Sandstrand',null],['12','Die geheimnisvolle Karte',12],['13','Proviant und Feuerholz',13],['14','Bananen und Kokosmilch',14],['15','Die Nacht auf der Insel — Kapitelabschluss',15]];
const select=document.getElementById('page-select'),img=document.getElementById('comic-page'),frame=document.getElementById('page-frame');
const textEdition=document.createElement('div');
textEdition.className='reader-gap';
textEdition.hidden=true;
const editionTitle=document.createElement('h2');
editionTitle.textContent='Ankunft am Sandstrand';
const editionNote=document.createElement('p');
editionNote.textContent='Die Illustration folgt. Unter der Seitennavigation kannst du die Szene und ihre drei Sprechblasen lesen.';
textEdition.append(editionTitle,editionNote);
img.after(textEdition);
pages.forEach(([label],i)=>select.add(new Option('Storyseite '+label,i)));
function pageFromHash(){
 const requested=Number(location.hash.slice(1));
 return Number.isSafeInteger(requested)?Math.max(0,Math.min(pages.length-1,requested)):0;
}
let current=pageFromHash();
function pageImage(file){
 return 'comic/page-'+String(file).padStart(2,'0')+'.webp';
}
function show(i,scroll=true){
 current=Math.max(0,Math.min(pages.length-1,i));
 const [label,description,file]=pages[current];
 const caption='Storyseite '+label+': '+description;
 textEdition.hidden=!!file;
 img.hidden=!file;
 if(file){
  img.src=pageImage(file);
  img.alt=caption;
 }
 document.getElementById('caption').textContent=caption;
 document.getElementById('position').textContent=(current+1)+' / '+pages.length;
 select.value=String(current);
 document.getElementById('prev').disabled=current===0;
 document.getElementById('next').disabled=current===pages.length-1;
 const pageUrl=new URL(location.href);
 pageUrl.hash=String(current);
 history.replaceState(null,'',pageUrl.pathname+pageUrl.search+pageUrl.hash);
 document.dispatchEvent(new CustomEvent('ttk:comicpage',{detail:{label,index:current,file}}));
 if(scroll)frame.scrollIntoView({block:'start',behavior:'instant'});
 const following=pages[current+1];
 if(following?.[2]){
  const preload=new Image();
  preload.src=pageImage(following[2]);
 }
}
document.getElementById('prev').onclick=()=>show(current-1);document.getElementById('next').onclick=()=>show(current+1);select.onchange=()=>show(Number(select.value));img.onclick=()=>frame.classList.toggle('zoom');img.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();img.click()}};window.addEventListener('keydown',e=>{if(['SELECT','INPUT','BUTTON'].includes(document.activeElement.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}});
window.addEventListener('hashchange',()=>show(pageFromHash()));
show(current,false);
