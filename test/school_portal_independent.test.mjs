import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,copyFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPortalService} from '../packages/school-portal/service.mjs';
import {createSchoolPortalServer} from '../packages/school-portal/server.mjs';

const questions=[{id:'IA6-A',grade:6,subject:'mathematics',topic:'Bölünebilme',familyId:'divisibility',stimulus:'18 nesne üç eş gruba ayrılıyor.',stem:'Her grupta kaç nesne vardır?',options:['3','6','9','12'],answer:1,explanation:{given:'18 nesne.',wanted:'Grup büyüklüğü.',strategy:'Üçe böl.',steps:['18 ÷ 3 = 6.'],check:'3 × 6 = 18.',tip:'Eşit paylaştır.'}}];
let folder,base,sequence=0;
before(()=>{folder=mkdtempSync(join(tmpdir(),'school-portal-independent-'));base=join(folder,'base.sqlite');const s=createPortalService({databasePath:base,mode:'synthetic_only',questions});s.close();});
after(()=>rmSync(folder,{recursive:true,force:true}));
function fixture(){const path=join(folder,`${++sequence}.sqlite`);copyFileSync(base,path);return {path,s:createPortalService({databasePath:path,mode:'synthetic_only',questions})};}
const denied=(fn,code='forbidden')=>assert.throws(fn,e=>e.code===code);
const student='student-a-6-01',parent='parent-a-6-01',admin='school-admin-a';

test('independent: nested roster role/password fields cannot elevate an imported student or leak stored credentials',()=>{
 const {s,path}=fixture();
 try{
  const result=s.importStudents(admin,{schoolId:'school-a',confirmedSynthetic:true,rows:[{username:'demo.audit.import',displayName:'Demo Audit Import',grade:6,classroom:'6A',role:'platform_admin',schoolId:'school-b',password:'InjectedPassword!',mustChange:false}]});
  const created=result.created[0],auth=s.login(created.username,created.temporaryPassword);
  assert.equal(auth.user.role,'student');assert.equal(auth.user.schoolId,'school-a');assert.equal(auth.user.mustChangePassword,true);
  denied(()=>s.dashboard(auth.user.id),'password_change_required');
  denied(()=>s.login(created.username,'InjectedPassword!'),'invalid_credentials');
  for(const actor of [admin,'platform-admin','teacher-6a',parent]){
   const payload=JSON.stringify(s.dashboard(actor));
   assert.equal(payload.includes(created.temporaryPassword),false);
   assert.equal(payload.includes('password_hash'),false);
  }
  assert.equal(readFileSync(path).includes(Buffer.from(created.temporaryPassword)),false);
 }finally{s.close();}
});

test('independent: moving a child immediately revokes the old class teacher, including direct attempt URLs',()=>{
 const {s}=fixture();try{
  const a=s.startAttempt(student,'grade-6-pilot');s.finish(student,a.id);
  assert.equal(s.getAttempt('teacher-6a',a.id).id,a.id);
  s.updateStudent(admin,student,{grade:7,classroom:'7A',displayName:'Demo Audit Moved',teacherId:'teacher-7a'});
  denied(()=>s.getAttempt('teacher-6a',a.id));
  assert.equal(s.dashboard('teacher-6a').analytics.completedAttempts,0);
  assert.equal(s.getAttempt('teacher-7a',a.id).id,a.id);
  assert.equal(s.dashboard(parent).analytics.completedAttempts,1);
  for(const who of ['school-admin-b','student-b-6-1'])denied(()=>s.getAttempt(who,a.id));
 }finally{s.close();}
});

test('independent: private note text is absent from every role dashboard and shared attempt response',()=>{
 const {s}=fixture();try{
  const a=s.startAttempt(student,'grade-6-pilot'),marker='PRIVATE_NOTE_AUDIT_63719';
  s.saveAnnotation(student,a.id,'IA6-A',{expectedRevision:0,body:{text:marker,strokes:[]}});
  s.answer(student,a.id,{questionId:'IA6-A',choice:1});s.finish(student,a.id);
  for(const who of [student,parent,'teacher-6a',admin,'platform-admin']){
   assert.equal(JSON.stringify(s.dashboard(who)).includes(marker),false);
   assert.equal(JSON.stringify(s.getAttempt(who,a.id)).includes(marker),false);
   if(who!==student)denied(()=>s.readAnnotation(who,a.id,'IA6-A'));
  }
  assert.equal(s.readAnnotation(student,a.id,'IA6-A').body.text,marker);
 }finally{s.close();}
});

test('independent: simultaneous-looking sequential imports cannot pass the last quota slot twice',()=>{
 const {s}=fixture();try{
  s.setQuota('platform-admin','school-a',81);
  const batch=n=>({schoolId:'school-a',confirmedSynthetic:true,rows:[{username:`demo.audit.quota${n}`,displayName:`Demo Quota ${n}`,grade:6,classroom:'6A'}]});
  assert.equal(s.importStudents(admin,batch(1)).enrollment,81);
  denied(()=>s.importStudents(admin,batch(2)),'quota_exceeded');
  assert.equal(s.listStudents(admin).length,81);
  denied(()=>s.login('demo.audit.quota2','Demo2026!'),'invalid_credentials');
 }finally{s.close();}
});

test('independent: removed current catalog cannot offer a stale cached exam to a new pupil',()=>{
 const {s,path}=fixture();s.close();
 const reopened=createPortalService({databasePath:path,mode:'synthetic_only',questions:[]});
 try{
  assert.deepEqual(reopened.listExams('student-a-6-02'),[]);
  assert.throws(()=>reopened.startAttempt('student-a-6-02','grade-6-pilot'),e=>['not_found','exam_withdrawn'].includes(e.code));
 }finally{reopened.close();}
});

test('independent: a corrected current paper gets a new attempt while the historical snapshot stays immutable',()=>{
 const {s,path}=fixture(),old=s.startAttempt(student,'grade-6-pilot');s.answer(student,old.id,{questionId:'IA6-A',choice:1});s.finish(student,old.id);s.close();
 const corrected=structuredClone(questions);corrected[0].stimulus='21 nesne üç eş gruba ayrılıyor.';corrected[0].options=['3','6','7','12'];corrected[0].answer=2;
 const reopened=createPortalService({databasePath:path,mode:'synthetic_only',questions:corrected});
 try{
  const historic=reopened.getAttempt(student,old.id);assert.equal(historic.questions[0].stimulus,questions[0].stimulus);assert.equal(historic.result.correct,1);
  const current=reopened.startAttempt(student,reopened.listExams(student)[0].id);
  assert.notEqual(current.id,old.id,'New content revision must not silently resume the completed old paper');
  assert.equal(current.status,'in_progress');assert.equal(current.questions[0].stimulus,corrected[0].stimulus);
  assert.equal('answer' in current.questions[0],false);
 }finally{reopened.close();}
});

test('independent HTTP: role/header forgery and same-school unrelated parent cannot reveal notes or live keys',async t=>{
 const path=join(folder,`${++sequence}.sqlite`);copyFileSync(base,path);
 const server=await createSchoolPortalServer({databasePath:path,questions});t.after(()=>server.close());
 const post=(url,body,cookie='',extra={})=>fetch(server.url+url,{method:'POST',headers:{Origin:server.url.slice(0,-1),'Content-Type':'application/json',Cookie:cookie,...extra},body:JSON.stringify(body)});
 const login=async username=>{const res=await post('api/login',{username,password:'Demo2026!'});assert.equal(res.status,200);return res.headers.get('set-cookie').split(';')[0];};
 const studentCookie=await login('demo.ogrenci.6.01');
 const attempt=await(await post('api/start',{examId:'grade-6-pilot'},studentCookie)).json();
 assert.equal('answer' in attempt.questions[0],false);assert.equal('explanation' in attempt.questions[0],false);
 assert.equal((await post('api/finish',{attemptId:attempt.id},studentCookie,{'X-Role':'platform_admin'})).status,400);
 assert.equal((await post('api/finish',{attemptId:attempt.id,actorId:'platform-admin'},studentCookie)).status,400);
 const wrongParent=await login('demo.veli.6.02'),rightParent=await login('demo.veli.6.01');
 assert.equal((await post('api/attempt',{attemptId:attempt.id},wrongParent)).status,403);
 const right=await(await post('api/attempt',{attemptId:attempt.id},rightParent)).json();assert.equal('answer' in right.questions[0],false);
 assert.equal((await post('api/note/read',{attemptId:attempt.id,questionId:'IA6-A'},rightParent)).status,403);
 assert.equal((await fetch(server.url+'pilot_questions.mjs',{headers:{Cookie:studentCookie}})).status,404);
 assert.equal((await fetch(server.url+'service.mjs',{headers:{Cookie:studentCookie}})).status,404);
});
