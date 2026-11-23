'use strict';
const STOP = new Set(('a about after again all also an and any are as at be been but by can could did do does for from get got had has have how i if in into is it its just me my no not of on or our out please so some than that the their then there these they this to too up use using was we were what when where which while who why will with would you your issue problem error bug feature support request').split(' '));
const THEMES = [
 {id:'setup', label:'Installation & setup', words:['install','installation','setup','configure','configuration','dependency','dependencies','deploy','deployment']},
 {id:'auth', label:'Login & permissions', words:['login','authentication','auth','permission','permissions','access','unauthorized','credential','credentials']},
 {id:'performance', label:'Performance & reliability', words:['slow','performance','timeout','crash','crashes','memory','hang','latency','freeze','freezes']},
 {id:'compatibility', label:'Compatibility & upgrades', words:['upgrade','update','version','compatibility','compatible','windows','linux','macos','breaking']},
 {id:'docs', label:'Documentation & onboarding', words:['documentation','docs','example','examples','tutorial','guide','onboarding']},
 {id:'integration', label:'Integrations & APIs', words:['api','integration','integrate','webhook','plugin','extension']},
 {id:'data', label:'Data & storage', words:['data','database','storage','save','export','import','sync','file','files']},
 {id:'ux', label:'Usability & workflow', words:['ui','ux','interface','workflow','usability','dashboard','button','form']}
];
function words(s){return (String(s||'').toLowerCase().match(/[a-z][a-z0-9-]{2,}/g)||[]).filter(w=>!STOP.has(w))}
function clean(s,n=240){return String(s||'').replace(/```[\s\S]*?```/g,' ').replace(/https?:\/\/\S+/g,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,n)}
function count(v){return Number.isFinite(v)&&v>0?Math.floor(v):0}
function analyze(issues, now=Date.now()) {
 if(!Array.isArray(issues)) throw new TypeError('issues must be an array');
 const prepared=issues.filter(i=>i && !i.pull_request && typeof i.number==='number').map(i=>{
  const title=clean(i.title||'Untitled',180), body=clean(i.body,1500), tokens=words(title+' '+body), set=new Set(tokens);
  const themes=THEMES.filter(t=>t.words.some(w=>set.has(w))).map(t=>t.id);
  const reactions=count(i.reactions?.total_count), comments=count(i.comments);
  const date=Date.parse(i.created_at), age=Number.isFinite(date)?Math.max(0,(now-date)/86400000):null;
  // Transparent attention score, not a measurement of unique affected users.
  const score=1+Math.min(5,Math.log2(1+comments))+Math.min(5,Math.log2(1+reactions))+(age!==null&&age<=30?1:0);
  const safeUrl=typeof i.html_url==='string' && /^https:\/\/github\.com\/[^\s]+$/i.test(i.html_url) ? i.html_url : '';
  return {number:i.number,title,excerpt:clean(body,220),url:safeUrl,comments,reactions,created_at:i.created_at||null,score:Math.round(score*10)/10,themes:themes.length?themes:['other'], tokens:words(title)};
 });
 const groups=[...THEMES,{id:'other',label:'Other / uncategorized'}].map(t=>{
  const list=prepared.filter(i=>i.themes.includes(t.id)).sort((a,b)=>b.score-a.score||a.number-b.number);
  if(!list.length)return null;
  const total=list.reduce((n,i)=>n+i.score,0);
  return {id:t.id,label:t.label,count:list.length,score:Math.round(total*10)/10,issues:list.slice(0,5).map(({tokens,...i})=>i)};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||b.count-a.count||a.label.localeCompare(b.label));
 const frequencies=new Map();
 for(const i of prepared) for(const w of new Set(i.tokens)) frequencies.set(w,(frequencies.get(w)||0)+1);
 const recurring=[...frequencies].filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,12).map(([word,count])=>({word,count}));
 return {total:prepared.length,groups,recurring,issues:prepared.map(({tokens,...i})=>i).sort((a,b)=>b.score-a.score||a.number-b.number)};
}
module.exports={analyze,clean,words,THEMES};
