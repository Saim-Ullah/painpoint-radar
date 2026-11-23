'use strict';
const http=require('node:http'); const fs=require('node:fs'); const path=require('node:path'); const {analyze}=require('./analysis');
const root=path.join(__dirname,'public');
const samples=require('./sample.json');
function parseRepo(input){const x=String(input||'').trim().replace(/^https:\/\/github\.com\//i,'').replace(/\/$/,''); if(!/^[a-z\d](?:[a-z\d-]{0,38})\/[a-z\d_.-]{1,100}$/i.test(x)||x.includes('..'))throw new Error('Enter owner/repository, for example: vercel/next.js');return x}
function response(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj))}
async function fetchIssues(repo,limit=100, fetcher=fetch){
 const headers={'Accept':'application/vnd.github+json','User-Agent':'Painpoint-Radar/1.0','X-GitHub-Api-Version':'2022-11-28'};
 if(process.env.GITHUB_TOKEN) headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
 let all=[], pages=0, complete=false;
 // At most 3 pages to keep API usage bounded. PRs are excluded by GitHub search.
 while(all.length<limit && pages<3){
  const u=new URL('https://api.github.com/search/issues');u.searchParams.set('q',`repo:${repo} is:issue is:open`);u.searchParams.set('sort','updated');u.searchParams.set('order','desc');u.searchParams.set('per_page',String(Math.min(100,limit-all.length)));u.searchParams.set('page',String(++pages));
  const r=await fetcher(u,{headers,signal:AbortSignal.timeout(12000)}); if(!r.ok){let msg=r.status===403||r.status===429?'GitHub rate limit or access restriction. Wait and try again, or set GITHUB_TOKEN locally.':r.status===422?'Repository not found, inaccessible, or search unavailable.':`GitHub returned HTTP ${r.status}`;throw Object.assign(new Error(msg),{status:r.status===403||r.status===429?429:502});}
  const data=await r.json();if(!Array.isArray(data.items))throw new Error('Unexpected response from GitHub'); all.push(...data.items);if(data.incomplete_results) throw new Error('GitHub search returned incomplete results; please retry.');if(all.length>=data.total_count||!data.items.length){complete=true;break}
 }
 return {issues:all.slice(0,limit),complete,pages};
}
function createServer(){return http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(req.method!=='GET'){res.writeHead(405,{'Allow':'GET'});return res.end()}
  if(url.pathname==='/api/sample')return response(res,200,{repo:'demo/fictional',sample:true,complete:true,analysis:analyze(samples)});
  if(url.pathname==='/api/analyze'){
   let repo;try{repo=parseRepo(url.searchParams.get('repo'))}catch(e){return response(res,400,{error:e.message})}
   const result=await fetchIssues(repo,100);return response(res,200,{repo,sample:false,complete:result.complete,pages:result.pages,analysis:analyze(result.issues)});
  }
  const assets={'/':'index.html','/app.js':'app.js','/style.css':'style.css'}; const name=assets[url.pathname]; if(!name){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'Content-Type':name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'"});fs.createReadStream(path.join(root,name)).pipe(res);
 }catch(e){response(res,e.status||502,{error:e.name==='TimeoutError'?'GitHub request timed out. Please retry.':e.message||'Request failed'})}
})}
if(require.main===module){const port=Number(process.env.PORT||3000);createServer().listen(port,process.env.HOST || '127.0.0.1',()=>console.log(`Painpoint Radar: http://localhost:${port}`))}
module.exports={createServer,parseRepo,fetchIssues};
