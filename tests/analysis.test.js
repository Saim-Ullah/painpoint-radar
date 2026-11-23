const {test}=require('node:test');const assert=require('node:assert/strict');const {analyze}=require('../analysis');
const now=Date.parse('2026-11-24T00:00:00Z');
const issue=(n,title,extra={})=>({number:n,title,body:'',comments:0,reactions:{total_count:0},created_at:'2026-11-20T00:00:00Z',html_url:`https://github.com/example/repo/issues/${n}`,...extra});
test('groups issues in multiple themes',()=>{const a=analyze([issue(1,'installation documentation')],now);assert.deepEqual(a.groups.map(x=>x.id).sort(),['docs','setup'])});
test('ranks by engagement and calculates score',()=>{const a=analyze([issue(1,'login fails'),issue(2,'login broken',{comments:7})],now);assert.equal(a.issues[0].number,2);assert.equal(a.issues[0].score,5)});
test('unique repeated title words',()=>{const a=analyze([issue(1,'widget widget fails'),issue(2,'widget broken')],now);assert.deepEqual(a.recurring.find(x=>x.word==='widget'),{word:'widget',count:2})});
test('empty list and unknown issue',()=>{assert.equal(analyze([],now).groups.length,0);assert.equal(analyze([issue(1,'mysterious behavior')],now).groups[0].id,'other')});
test('filters pull requests and unsafe links',()=>{const a=analyze([issue(1,'hello',{pull_request:{}}),issue(2,'hello',{html_url:'javascript:alert(1)'})],now);assert.equal(a.total,1);assert.equal(a.issues[0].url,'')});
test('handles absent dates and negative engagement',()=>{const a=analyze([issue(1,'login',{created_at:null,comments:-3})],now);assert.equal(a.issues[0].score,1)});
