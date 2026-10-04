import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookletServer } from '../packages/science-booklet/server.mjs';
const fixture = grade => ({id:`YF${grade}-01`,grade,stimulus:'Bir deney yapılıyor.',stem:'Hangisi doğrudur?',options:['A','B','C','D'],answer:1,explanation:{given:'Verilen',wanted:'İstenen',strategy:'Yol',steps:['Adım'],check:'Kontrol',tip:'İpucu'},figure:{svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150"><circle cx="100" cy="70" r="20"/></svg>',alt:'Deney'},layout:'regular',bloom:'analyze',source:{private:'metadata'}});
async function start(t){const s=await createBookletServer({grade:6,items:[fixture(6),fixture(7)]});t.after(()=>s.close());const entry=await fetch(s.url);const cookie=entry.headers.get('set-cookie').split(';')[0];return {...s,cookie};}
test('HTTP student entry locks grade; spoofed paths, headers and body cannot expose another grade',async t=>{
 const s=await start(t);const get=path=>fetch(s.url+path,{headers:{Cookie:s.cookie}});
 const b=await (await get('api/booklet')).json();assert.equal(b.grade,6);assert.equal(b.questions.length,1);assert.equal(b.questions[0].id,'YF6-01');assert.equal('answer' in b.questions[0],false);
 assert.equal((await get('api/booklet?grade=7')).status,400);
 assert.equal((await fetch(s.url+'api/booklet',{headers:{Cookie:s.cookie,'x-role':'editor'}})).status,400);
 assert.equal((await get('api/editor')).status,404);
 assert.equal((await get('api/review')).status,409);
 const p=await fetch(s.url+'api/answer',{method:'POST',headers:{Cookie:s.cookie,Origin:s.url.slice(0,-1),'Content-Type':'application/json'},body:JSON.stringify({id:'YF7-01',choice:1})});assert.equal(p.status,400);
});
test('real save then finish exposes only this session solution; cross-origin and missing session reject',async t=>{
 const s=await start(t);const send=(path,body,origin=s.url.slice(0,-1))=>fetch(s.url+path,{method:'POST',headers:{Cookie:s.cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await fetch(s.url+'api/booklet')).status,401);
 assert.equal((await send('api/answer',{id:'YF6-01',choice:1},'https://evil.invalid')).status,403);
 assert.equal((await send('api/answer',{id:'YF6-01',choice:1})).status,200);
 const r=await (await send('api/finish',{})).json();assert.deepEqual(r.summary,{correct:1,incorrect:0,blank:0,total:1});
 assert.equal((await send('api/answer',{id:'YF6-01',choice:2})).status,409);
 const another=await fetch(s.url);const cookie=another.headers.get('set-cookie').split(';')[0];
 const other=await (await fetch(s.url+'api/booklet',{headers:{Cookie:cookie}})).json();assert.equal(other.finished,false);assert.equal(other.responses['YF6-01'],null);
});
test('arbitrary resource paths, unsupported method and oversized body fail without source disclosure',async t=>{
 const s=await start(t);for(const path of ['grade7.mjs','.env.local','session.mjs','api/booklet/extra'])assert.equal((await fetch(s.url+path,{headers:{Cookie:s.cookie}})).status,404);
 assert.equal((await fetch(s.url+'api/booklet',{method:'PUT',headers:{Cookie:s.cookie}})).status,405);
 const response=await fetch(s.url+'api/answer',{method:'POST',headers:{Cookie:s.cookie,Origin:s.url.slice(0,-1),'Content-Type':'application/json'},body:JSON.stringify({id:'x'.repeat(5000),choice:0})});assert.equal(response.status,413);
});
test('same-host previews on different ports keep their own session cookies and immutable enrollment stock',async t=>{
 const items=[fixture(6)];const a=await createBookletServer({grade:6,items}),b=await createBookletServer({grade:7,items:[fixture(7)]});t.after(()=>a.close());t.after(()=>b.close());
 items[0].answer=3;items[0].options[1]='mutated after startup';
 const ca=(await fetch(a.url)).headers.get('set-cookie').split(';')[0],cb=(await fetch(b.url)).headers.get('set-cookie').split(';')[0];
 assert.notEqual(ca.split('=')[0],cb.split('=')[0]);
 const both=ca+'; '+cb;
 const av=await (await fetch(a.url+'api/booklet',{headers:{Cookie:both}})).json(),bv=await (await fetch(b.url+'api/booklet',{headers:{Cookie:both}})).json();
 assert.equal(av.grade,6);assert.equal(bv.grade,7);assert.equal(av.questions[0].options[1],'B');
});
