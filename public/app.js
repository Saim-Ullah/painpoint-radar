'use strict';
const $=s=>document.querySelector(s); let current=null;
function element(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function render(data){current=data;const a=data.analysis;$('#welcome').hidden=true;$('#report').hidden=false;$('#repo-name').textContent=data.repo;$('#scope').textContent=data.sample?'Fictional demo data — not real GitHub issues.':`${a.total} most recently updated open issues analyzed · ${data.complete?'All open issues included':'Sample capped at 100; not all open issues included'}`;
 const stats=$('#stats');stats.replaceChildren();for(const [n,l] of [[a.total,'OPEN ISSUES ANALYZED'],[a.groups.length,'THEMES DETECTED'],[a.recurring.length,'REPEATED TITLE WORDS']]){let d=element('div','stat');d.append(element('strong','',String(n)),element('span','',l));stats.append(d)}
 const groups=$('#groups');groups.replaceChildren();if(!a.groups.length)groups.append(element('p','','No open issues found in this sample.'));
 for(const g of a.groups){const c=element('article','card'),top=element('div','cardtop'),head=element('div');head.append(element('small','','THEME'),element('h3','',g.label));top.append(head,element('span','badge',`${g.count} issues · ${g.score} signal`));c.append(top,element('small','','TOP MATCHING ISSUES'));const ul=element('ul');for(const i of g.issues){let li=element('li');if(i.url&&!data.sample){let link=element('a','',`#${i.number} ${i.title}`);link.href=i.url;link.target='_blank';link.rel='noopener noreferrer';li.append(link)}else li.append(element('span','',`#${i.number} ${i.title}`));li.append(element('span','issue-meta',`${i.comments} comments · ${i.reactions} reactions · signal ${i.score}`));ul.append(li)}c.append(ul);groups.append(c)}
 const words=$('#words');words.replaceChildren();if(!a.recurring.length)words.append(element('p','','No repeated title words in this sample.'));for(const w of a.recurring)words.append(element('span','word',`${w.word} · ${w.count}`));
}
async function load(url){document.body.classList.add('loading');$('#scan').disabled=true;$('#demo').disabled=true;$('#status').textContent='Reading issues and looking for patterns…';try{const r=await fetch(url);const j=await r.json();if(!r.ok)throw Error(j.error||'Unable to fetch report');render(j);$('#status').textContent='';}catch(e){$('#status').textContent=e.message}finally{document.body.classList.remove('loading');$('#scan').disabled=false;$('#demo').disabled=false}}
$('#form').addEventListener('submit',e=>{e.preventDefault();load('/api/analyze?repo='+encodeURIComponent($('#repo').value))});$('#demo').addEventListener('click',()=>load('/api/sample'));$('#download').addEventListener('click',()=>{if(!current)return;let blob=new Blob([JSON.stringify({...current,exported_at:new Date().toISOString()},null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='painpoint-radar-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});

// Pointer-based dimensional movement is decorative.
const scene = document.querySelector('.radar-scene');
scene.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  const rect = scene.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - .5) * 10;
  const y = ((event.clientY - rect.top) / rect.height - .5) * -10;
  scene.style.setProperty('--tilt-x', `${y}deg`);
  scene.style.setProperty('--tilt-y', `${x}deg`);
});
scene.addEventListener('pointerleave', () => {scene.style.setProperty('--tilt-x','0deg'); scene.style.setProperty('--tilt-y','0deg')});
