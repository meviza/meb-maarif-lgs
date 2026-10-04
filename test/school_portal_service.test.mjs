import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,copyFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createPortalService} from '../packages/school-portal/service.mjs';

const questions=[
 {id:'Q6-M1',grade:6,subject:'matematik',topic:'Kesir',familyId:'compare',stimulus:'İki eş parçadan biri boyalı.',stem:'Hangi kesir?',options:['1/2','1/3','2/3','1/4'],answer:0,explanation:{strategy:'Boyalı parçayı say.'}},
 {id:'Q6-F1',grade:6,subject:'fen',topic:'Kuvvet',familyId:'infer',stimulus:'Kutuya zıt yönde kuvvet uygulanır.',stem:'Sonuç?',options:['A','B','C','D'],answer:1,explanation:{strategy:'Kuvvetleri karşılaştır.'}},
 {id:'Q6-F2',grade:6,subject:'fen',topic:'Kuvvet',familyId:'compare',stimulus:'Kutu dengededir.',stem:'Sonuç?',options:['A','B','C','D'],answer:2,explanation:{strategy:'Dengeyi düşün.'}},
 {id:'Q1-T1',grade:1,subject:'turkce',topic:'Ses',familyId:'recognize',stimulus:'Bir ses dinle.',stem:'Hangisi?',options:['A','B','C'],answer:1,explanation:{strategy:'Sesi ayırt et.'}}
];
let dir,base,sequence=0;
before(()=>{dir=mkdtempSync(join(tmpdir(),'school-portal-service-'));base=join(dir,'base.sqlite');const s=createPortalService({databasePath:base,questions,mode:'synthetic_only'});s.close();});
after(()=>rmSync(dir,{recursive:true,force:true}));
function fixture(){const path=join(dir,`${++sequence}.sqlite`);copyFileSync(base,path);const s=createPortalService({databasePath:path,questions,mode:'synthetic_only'});return {s,path};}
const login=(s,name)=>s.login(name,'Demo2026!');
const student=(s,grade=6,index='01')=>login(s,`demo.ogrenci.${grade}.${index}`).user;
const reject=(fn,code)=>assert.throws(fn,e=>e.code===code);

test('explicit synthetic mode rejects unapproved real-data execution',()=>{
 assert.throws(()=>createPortalService({databasePath:':memory:',questions}),/synthetic_only/);
});
test('passwords and tokens are hashed, authenticated sessions survive restart and logout revokes them',()=>{
 const {s,path}=fixture(); const auth=login(s,'demo.ogrenci.6.01'); assert.equal(auth.user.role,'student');
 assert.equal(auth.user.grade,6);assert.equal('password_hash' in auth.user,false);
 reject(()=>s.login('demo.ogrenci.6.01','wrong'),'invalid_credentials');
 s.close(); const raw=readFileSync(path);assert.equal(raw.includes(Buffer.from(auth.token)),false);assert.equal(raw.includes(Buffer.from('Demo2026!')),false);
 const next=createPortalService({databasePath:path,questions,mode:'synthetic_only'});assert.equal(next.authenticate(auth.token).id,auth.user.id);
 next.logout(auth.token);reject(()=>next.authenticate(auth.token),'unauthenticated');next.close();
});
test('students cannot enumerate other students or receive another grade or answer keys',()=>{
 const {s}=fixture();const u=student(s);assert.deepEqual(s.listStudents(u.id).map(x=>x.id),[u.id]);
 assert.deepEqual(s.listExams(u.id).map(x=>x.grade),[6]);reject(()=>s.startAttempt(u.id,'grade-1-pilot'),'forbidden');
 const a=s.startAttempt(u.id,'grade-6-pilot'); assert.equal(a.questions.length,3);
 assert.equal(JSON.stringify(a).includes('Boyalı parçayı say'),false);assert.equal('answer' in a.questions[0],false);
 assert.equal('source' in a.questions[0],false);assert.equal(s.startAttempt(u.id,'grade-6-pilot').id,a.id);s.close();
});
test('teacher class, parent child and school isolation apply to attempt reads and rosters',()=>{
 const {s}=fixture();const u=student(s);const a=s.startAttempt(u.id,'grade-6-pilot');
 const ownParent=login(s,'demo.veli.6.01').user,foreignParent=login(s,'demo.veli.6.02').user;
 const teacher=login(s,'demo.ogretmen.6a').user,wrongTeacher=login(s,'demo.ogretmen.7a').user;
 const otherSchool=login(s,'demo.mudur.b').user;
 assert.equal(s.listStudents(ownParent.id).length,1);assert.equal(s.listStudents(teacher.id).length,10);
 for(const actor of [foreignParent,wrongTeacher,otherSchool])reject(()=>s.getAttempt(actor.id,a.id),'forbidden');
 reject(()=>s.answer(teacher.id,a.id,{questionId:'Q6-M1',choice:0}),'forbidden');
 assert.equal(s.getAttempt(ownParent.id,a.id).id,a.id);s.close();
});
test('latest answers score correct wrong blank, finish is idempotent and locks answers',()=>{
 const {s}=fixture();const u=student(s),a=s.startAttempt(u.id,'grade-6-pilot');
 s.answer(u.id,a.id,{questionId:'Q6-M1',choice:3});s.answer(u.id,a.id,{questionId:'Q6-M1',choice:0});
 s.answer(u.id,a.id,{questionId:'Q6-F1',choice:0});s.answer(u.id,a.id,{questionId:'Q6-F2',choice:2});s.answer(u.id,a.id,{questionId:'Q6-F2',choice:null});
 reject(()=>s.answer(u.id,a.id,{questionId:'Q1-T1',choice:0}),'invalid_question');reject(()=>s.answer(u.id,a.id,{questionId:'Q6-M1',choice:4}),'invalid_choice');
 const result=s.finish(u.id,a.id);assert.deepEqual(result.result,{correct:1,wrong:1,blank:1,total:3,scoringMode:'formative'});
 assert.deepEqual(s.finish(u.id,a.id),result);reject(()=>s.answer(u.id,a.id,{questionId:'Q6-M1',choice:1}),'attempt_finished');
 assert.equal(s.getAttempt(u.id,a.id).questions[0].answer,0);s.close();
});
test('attempt snapshot is immutable across restart and changed authoring input',()=>{
 const {s,path}=fixture(),u=student(s),a=s.startAttempt(u.id,'grade-6-pilot');s.answer(u.id,a.id,{questionId:'Q6-M1',choice:0});s.close();
 const revised=structuredClone(questions);revised[0].answer=2;revised[0].stem='Changed';
 const next=createPortalService({databasePath:path,questions:revised,mode:'synthetic_only'});assert.equal(next.getAttempt(u.id,a.id).questions[0].stem,'Hangi kesir?');
 assert.equal(next.finish(u.id,a.id).result.correct,1);next.close();
});
test('private editable notes persist after finish and use optimistic concurrency',()=>{
 const {s,path}=fixture(),u=student(s),a=s.startAttempt(u.id,'grade-6-pilot');const body={text:'Payı say.',strokes:[{id:'s1',points:[{x:.1,y:.2},{x:.5,y:.6}],color:'#172b4d',width:2}]};
 assert.equal(s.readAnnotation(u.id,a.id,'Q6-M1').revision,0);assert.equal(s.saveAnnotation(u.id,a.id,'Q6-M1',{expectedRevision:0,body}).revision,1);
 reject(()=>s.saveAnnotation(u.id,a.id,'Q6-M1',{expectedRevision:0,body}),'revision_conflict');
 for(const name of ['demo.veli.6.01','demo.ogretmen.6a','demo.mudur.a','demo.superadmin'])reject(()=>s.readAnnotation(login(s,name).user.id,a.id,'Q6-M1'),'forbidden');
 s.finish(u.id,a.id);s.saveAnnotation(u.id,a.id,'Q6-M1',{expectedRevision:1,body:{...body,text:'Kontrol ettim.'}});s.close();
 const next=createPortalService({databasePath:path,questions,mode:'synthetic_only'});assert.equal(next.readAnnotation(u.id,a.id,'Q6-M1').body.text,'Kontrol ettim.');next.close();
});
test('notes enforce normalized coordinates, stroke identities and bounded local payloads',()=>{
 const {s}=fixture(),u=student(s),a=s.startAttempt(u.id,'grade-6-pilot');const good={id:'line1',color:'#172b4d',width:2,points:[{x:.1,y:.2}]};
 for(const body of [{text:'a'.repeat(2001),strokes:[]},{text:'',strokes:[{...good,points:[{x:-.1,y:.2}]}]},{text:'',strokes:[{...good,color:'#000000'}]},{text:'',strokes:[{...good,width:3}]},{text:'',strokes:[{...good,id:''}]},{text:'',strokes:[good,good]},{text:'',strokes:[{...good,points:Array.from({length:513},()=>({x:0,y:0}))}]}])reject(()=>s.saveAnnotation(u.id,a.id,'Q6-M1',{expectedRevision:0,body}),'invalid_annotation');
 const saved=s.saveAnnotation(u.id,a.id,'Q6-M1',{expectedRevision:0,body:{text:'Deneme',strokes:[good]}});assert.deepEqual(saved.body,{text:'Deneme',strokes:[good]});s.close();
});
test('incomplete catalogs retain target counts and do not present partial grade8 as LGS',()=>{
 const {s}=fixture();const exam=s.listExams(student(s).id)[0];assert.equal(exam.questionCount,3);assert.equal(exam.targetCount,20);assert.equal(exam.status,'incomplete');
 const school=s.dashboard(student(s).id).schools[0];assert.equal('quota' in school,false);assert.equal('enrollment' in school,false);s.close();
});
test('analytics count completed attempts only and expose honest course/topic/family denominators',()=>{
 const {s}=fixture(),one=student(s),two=student(s,6,'02'),third=student(s,6,'03');
 const a=s.startAttempt(one.id,'grade-6-pilot');s.answer(one.id,a.id,{questionId:'Q6-M1',choice:0});s.answer(one.id,a.id,{questionId:'Q6-F1',choice:0});s.finish(one.id,a.id);
 const b=s.startAttempt(two.id,'grade-6-pilot');s.answer(two.id,b.id,{questionId:'Q6-F1',choice:1});s.finish(two.id,b.id);
 s.startAttempt(third.id,'grade-6-pilot');const d=s.dashboard(login(s,'demo.ogretmen.6a').user.id);
 assert.equal(d.analytics.completedAttempts,2);assert.equal(d.analytics.studentsWithCompletedAttempts,2);
 assert.deepEqual(d.analytics.totals,{correct:2,wrong:1,blank:3,total:6});
 assert.deepEqual(d.analytics.bySubject.find(x=>x.key==='fen'),{key:'fen',correct:1,wrong:1,blank:2,total:4,exposures:4,correctRate:.25});
 assert.equal(d.analytics.byTopic.find(x=>x.key==='Kuvvet').exposures,4);assert.equal(d.analytics.byFamily.find(x=>x.key==='compare').exposures,4);
 assert.equal(s.dashboard(login(s,'demo.veli.6.01').user.id).analytics.completedAttempts,1);
 assert.equal(s.dashboard(login(s,'demo.mudur.b').user.id).analytics.completedAttempts,0);s.close();
});
test('feedback requires completion, is updatable once rewarded and equally rewards criticism',()=>{
 const {s}=fixture(),u=student(s),a=s.startAttempt(u.id,'grade-6-pilot');reject(()=>s.feedback(u.id,a.id,{rating:1,text:'Şekil küçük.'}),'finish_required');s.finish(u.id,a.id);
 assert.equal(s.feedback(u.id,a.id,{rating:1,text:'Şekil küçük.',questionIds:['Q6-M1']}).contributionPoints,1);
 assert.equal(s.feedback(u.id,a.id,{rating:5,text:'Şimdi daha iyi.',questionIds:['Q6-M1']}).contributionPoints,1);
 const d=s.dashboard(login(s,'demo.ogretmen.6a').user.id);assert.equal(d.analytics.questionFeedback[0].responses,1);assert.equal(d.analytics.questionFeedback[0].averageRating,5);
 reject(()=>s.feedback(login(s,'demo.veli.6.01').user.id,a.id,{rating:4,text:'Yorum'}),'student_feedback_required');
 const little=student(s,1),la=s.startAttempt(little.id,'grade-1-pilot');s.finish(little.id,la.id);
 assert.equal(s.feedback(login(s,'demo.veli.1.01').user.id,la.id,{rating:2,text:'Çocuğum çizimi anlamadı.'}).contributionPoints,1);s.close();
});
test('quota import is atomic and rejects real names, foreign schools, duplicate rows and teacher scope',()=>{
 const {s}=fixture(),admin=login(s,'demo.mudur.a').user,superuser=login(s,'demo.superadmin').user;
 const before=s.listStudents(admin.id).length;assert.equal(before,80);
 const rows=[{username:'demo.yeni.01',displayName:'Demo Yeni 01',grade:6,classroom:'6A'},{username:'demo.yeni.02',displayName:'Demo Yeni 02',grade:6,classroom:'6A'}];
 s.setQuota(superuser.id,admin.schoolId,81);reject(()=>s.importStudents(admin.id,{schoolId:admin.schoolId,rows,confirmedSynthetic:true}),'quota_exceeded');assert.equal(s.listStudents(admin.id).length,80);
 s.setQuota(superuser.id,admin.schoolId,82);reject(()=>s.importStudents(admin.id,{schoolId:admin.schoolId,rows:[rows[0],rows[0]],confirmedSynthetic:true}),'duplicate_username');
 reject(()=>s.importStudents(admin.id,{schoolId:admin.schoolId,rows:[{...rows[0],displayName:'Ahmet Öztürk'}],confirmedSynthetic:true}),'synthetic_alias_required');
 reject(()=>s.importStudents(admin.id,{schoolId:'school-b',rows,confirmedSynthetic:true}),'forbidden');
 const added=s.importStudents(admin.id,{schoolId:admin.schoolId,rows,confirmedSynthetic:true});assert.equal(added.created.length,2);assert.equal(s.listStudents(admin.id).length,82);
 reject(()=>s.setQuota(superuser.id,admin.schoolId,81),'quota_below_enrollment');reject(()=>s.setQuota(admin.id,admin.schoolId,300),'forbidden');s.close();
});
test('first-login password change and reset revoke sessions without revealing password hashes',()=>{
 const {s}=fixture(),admin=login(s,'demo.mudur.a').user;const out=s.importStudents(admin.id,{schoolId:admin.schoolId,confirmedSynthetic:true,rows:[{username:'demo.yeni.03',displayName:'Demo Yeni 03',grade:6,classroom:'6A'}]});
 const auth=s.login('demo.yeni.03',out.created[0].temporaryPassword);assert.equal(auth.user.mustChangePassword,true);
 reject(()=>s.startAttempt(auth.user.id,'grade-6-pilot'),'password_change_required');
 s.changePassword(auth.user.id,out.created[0].temporaryPassword,'NewPassword2026!');reject(()=>s.authenticate(auth.token),'unauthenticated');
 assert.equal(s.login('demo.yeni.03','NewPassword2026!').user.mustChangePassword,false);s.close();
});
test('LGS net is enabled only for an explicitly configured complete 90-question distribution',()=>{
 const {s,path}=fixture();s.close();
 const full=Object.entries({turkish:20,mathematics:20,science:20,history:10,religion:10,english:10}).flatMap(([subject,count])=>Array.from({length:count},(_,i)=>({...questions[0],id:`LGS-${subject}-${i}`,grade:8,subject,answer:0})));
 reject(()=>createPortalService({databasePath:path,questions:full.slice(1),mode:'synthetic_only',examBlueprints:[{grade:8,scoringMode:'lgs'}]}),'invalid_lgs_blueprint');
 const exam=createPortalService({databasePath:path,questions:full,mode:'synthetic_only',examBlueprints:[{grade:8,scoringMode:'lgs'}]});const u=student(exam,8);assert.equal(exam.listExams(u.id)[0].scoringMode,'lgs');
 const a=exam.startAttempt(u.id,'grade-8-pilot');exam.answer(u.id,a.id,{questionId:'LGS-turkish-0',choice:0});exam.answer(u.id,a.id,{questionId:'LGS-turkish-1',choice:1});const result=exam.finish(u.id,a.id).result;
 assert.equal(result.correct,1);assert.equal(result.wrong,1);assert.equal(result.blank,88);assert.equal(result.scoringMode,'lgs');assert.ok(Math.abs(result.net-2/3)<1e-10);
 assert.equal(exam.dashboard(u.id).analytics.lgs.completedAttempts,1);exam.close();
 const reopened=createPortalService({databasePath:path,questions:full,mode:'synthetic_only'});assert.equal(reopened.getAttempt(u.id,a.id).result.scoringMode,'lgs');reopened.close();
});
test('expired sessions cannot resume even when their token hash remains stored',()=>{
 const {s,path}=fixture();const {token}=login(s,'demo.ogrenci.6.01');s.close();const sql=new DatabaseSync(path);sql.exec('UPDATE sessions SET expires_at=1');sql.close();
 const reopened=createPortalService({databasePath:path,questions,mode:'synthetic_only'});reject(()=>reopened.authenticate(token),'unauthenticated');reopened.close();
});
test('only platform admin creates a synthetic school with a forced-change scoped administrator',()=>{
 const {s}=fixture(),root=login(s,'demo.superadmin').user,school=login(s,'demo.mudur.a').user;
 const input={name:'Demo Okul C',quota:30,adminUsername:'demo.mudur.c',adminDisplayName:'Demo Müdür C',temporaryPassword:'DemoInitial2026!',confirmedSynthetic:true};
 reject(()=>s.createSchool(school.id,input),'forbidden');reject(()=>s.createSchool(root.id,{...input,name:'Özel Gerçek Kolej'}),'synthetic_alias_required');
 const created=s.createSchool(root.id,input);assert.equal(created.school.quota,30);const auth=s.login('demo.mudur.c','DemoInitial2026!');assert.equal(auth.user.mustChangePassword,true);assert.equal(auth.user.schoolId,created.school.id);
 reject(()=>s.dashboard(auth.user.id),'password_change_required');s.changePassword(auth.user.id,'DemoInitial2026!','DemoChanged2026!');assert.equal(s.listStudents(auth.user.id).length,0);
 reject(()=>s.setQuota(auth.user.id,created.school.id,300),'forbidden');assert.equal(s.dashboard(root.id).schools.length,3);s.close();
});
test('school roster edits stay scoped and cannot mutate an already-started exam snapshot',()=>{
 const {s}=fixture(),school=login(s,'demo.mudur.a').user,other=login(s,'demo.mudur.b').user,u=student(s),a=s.startAttempt(u.id,'grade-6-pilot');
 reject(()=>s.updateStudent(other.id,u.id,{grade:7,classroom:'7A',displayName:'Demo Yeni Sınıf'}),'forbidden');
 const changed=s.updateStudent(school.id,u.id,{grade:7,classroom:'7A',displayName:'Demo Yeni Sınıf',teacherId:'teacher-7a'});assert.equal(changed.grade,7);
 assert.equal(s.getAttempt(u.id,a.id).grade,6);assert.equal(s.listStudents(login(s,'demo.ogretmen.6a').user.id).length,9);assert.equal(s.listStudents(login(s,'demo.ogretmen.7a').user.id).length,11);s.close();
});
test('corrected item versions keep separate difficulty and liking denominators',()=>{
 const {s,path}=fixture(),u=student(s),first=s.startAttempt(u.id,'grade-6-pilot');s.answer(u.id,first.id,{questionId:'Q6-M1',choice:0});s.finish(u.id,first.id);s.feedback(u.id,first.id,{rating:5,text:'Açık soru.',questionIds:['Q6-M1']});s.close();
 const revised=structuredClone(questions);revised[0].stimulus='Üç eş parçadan ikisi boyalı.';revised[0].answer=2;
 const next=createPortalService({databasePath:path,questions:revised,mode:'synthetic_only'});const currentId=next.listExams(u.id)[0].id;assert.notEqual(currentId,'grade-6-pilot');const second=next.startAttempt(u.id,currentId);next.answer(u.id,second.id,{questionId:'Q6-M1',choice:0});next.finish(u.id,second.id);next.feedback(u.id,second.id,{rating:1,text:'Yeni çizimi beğenmedim.',questionIds:['Q6-M1']});
 const analysis=next.dashboard('teacher-6a').analytics;const rows=analysis.questions.filter(q=>q.questionId==='Q6-M1');assert.equal(rows.length,2);assert.equal(new Set(rows.map(q=>q.questionVersion)).size,2);assert.deepEqual(rows.map(q=>q.exposures),[1,1]);
 const ratings=analysis.questionFeedback.filter(q=>q.questionId==='Q6-M1');assert.equal(ratings.length,2);assert.deepEqual(ratings.map(q=>q.averageRating).sort(),[1,5]);assert.deepEqual(ratings.map(q=>q.responses),[1,1]);
 next.close();const stable=createPortalService({databasePath:path,questions:revised,mode:'synthetic_only'});assert.equal(stable.listExams(u.id)[0].id,currentId);assert.equal(stable.startAttempt(u.id,currentId).id,second.id);stable.close();
});
