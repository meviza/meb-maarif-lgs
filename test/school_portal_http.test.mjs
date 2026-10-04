import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../packages/school-portal/server.mjs').catch(()=>({}));
const questions=[{id:'q6',grade:6,subject:'science',stem:'Hangisi?',options:['A','B','C','D'],answer:2,topic:'Deney',familyId:'comparison',explanation:{given:'Veri',wanted:'Sonuç',strategy:'Karşılaştır',steps:['İncele'],check:'Kontrol',tip:'Not'}}];
test('HTTP role sessions bind answers, notes and analytics to the authenticated child',async t=>{
 assert.equal(typeof mod.createSchoolPortalServer,'function');
 const s=await mod.createSchoolPortalServer({databasePath:':memory:',questions});t.after(()=>s.close());
 const root=await fetch(s.url);assert.equal(root.status,200);assert.match(await root.text(),/Okul Atölyesi/u);
 const post=async(path,body,cookie='',origin=s.url.slice(0,-1))=>fetch(s.url.slice(0,-1)+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify(body)});
 const login=await post('/api/login',{username:'demo.ogrenci.6.01',password:'Demo2026!'});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/u);
 const attempt=await (await post('/api/start',{examId:'grade-6-pilot'},cookie)).json();assert.equal(attempt.questions[0].answer,undefined);
 assert.equal((await post('/api/answer',{attemptId:attempt.id,questionId:'q6',choice:2,actorId:'student-a-7-01'},cookie)).status,400);
 assert.equal((await post('/api/answer',{attemptId:attempt.id,questionId:'q6',choice:2},cookie,'https://evil.test')).status,403);
 assert.equal((await post('/api/answer',{attemptId:attempt.id,questionId:'q6',choice:2},cookie)).status,200);
 const body={text:'Önce veriyi oku.',strokes:[]};assert.equal((await post('/api/note/save',{attemptId:attempt.id,questionId:'q6',expectedRevision:0,body},cookie)).status,200);
 const parent=await post('/api/login',{username:'demo.veli.6.02',password:'Demo2026!'});const pc=parent.headers.get('set-cookie').split(';')[0];assert.equal((await post('/api/attempt',{attemptId:attempt.id},pc)).status,403);
 assert.equal((await post('/api/finish',{attemptId:attempt.id},cookie)).status,200);
 const finish=await (await post('/api/attempt',{attemptId:attempt.id},cookie)).json();assert.equal(finish.result.correct,1);assert.equal(finish.questions[0].answer,2);
 assert.equal((await post('/api/logout',{},cookie)).status,200);assert.equal((await fetch(s.url+'api/dashboard',{headers:{Cookie:cookie}})).status,401);
});
test('HTTP refuses unauthenticated data, cross-origin login and unsafe asset paths',async t=>{
 assert.equal(typeof mod.createSchoolPortalServer,'function');const s=await mod.createSchoolPortalServer({databasePath:':memory:',questions});t.after(()=>s.close());
 assert.equal((await fetch(s.url+'api/dashboard')).status,401);
 assert.equal((await fetch(s.url+'service.mjs')).status,404);
 assert.equal((await fetch(s.url+'api/login',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json'},body:'{}'})).status,403);
});
