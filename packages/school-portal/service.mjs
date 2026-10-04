import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {mkdirSync,chmodSync} from 'node:fs';
import {dirname} from 'node:path';

const SESSION_MS=8*60*60*1000;
const TARGETS={1:10,2:10,3:15,4:15,5:20,6:20,7:20,8:90};
const LGS_DISTRIBUTION={turkish:20,mathematics:20,science:20,history:10,religion:10,english:10};
const digest=value=>createHash('sha256').update(value).digest('hex');
const parse=value=>JSON.parse(value);
function error(code,status=400){const e=new Error(code);e.code=code;e.status=status;return e;}
const fail=(code,status)=>{throw error(code,status);};
function secret(password){const salt=randomBytes(16).toString('hex');return {salt,hash:scryptSync(password,salt,32).toString('hex')};}
function matches(password,row){if(typeof password!=='string'||password.length>256)return false;const actual=scryptSync(password,row.password_salt,32);return timingSafeEqual(actual,Buffer.from(row.password_hash,'hex'));}
function safeUser(row){return {id:row.id,username:row.username,displayName:row.display_name,role:row.role,schoolId:row.school_id,grade:row.grade,classroom:row.classroom,mustChangePassword:!!row.must_change};}
function normalizeQuestion(q){
 if(!q||typeof q.id!=='string'||!q.id.trim()||!Number.isInteger(q.grade)||q.grade<1||q.grade>8||!Array.isArray(q.options)||q.options.length<3||q.options.length>4||q.options.some(x=>typeof x!=='string'||!x.trim())||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length||typeof q.stem!=='string')fail('invalid_question');
 return {...structuredClone(q),subject:q.subject??'fen',familyId:q.familyId??`unclassified:${q.topic??'unknown'}`,topic:q.topic??'Belirtilmedi'};
}
function studentQuestion(q,finished){
 const result={id:q.id,grade:q.grade,subject:q.subject,stimulus:q.stimulus??'',stem:q.stem,options:q.options,figure:q.figure??null,layout:q.layout??'regular'};
 if(finished){result.answer=q.answer;result.explanation=q.explanation??null;}
 return result;
}
function annotationBody(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.text!=='string'||body.text.length>2000||!Array.isArray(body.strokes)||body.strokes.length>100)fail('invalid_annotation');
 let points=0;const ids=new Set(),strokes=body.strokes.map(stroke=>{
   if(!stroke||typeof stroke.id!=='string'||!/^[-_a-z0-9]{1,80}$/iu.test(stroke.id)||ids.has(stroke.id)||!Array.isArray(stroke.points)||stroke.points.length<1||stroke.points.length>512)fail('invalid_annotation');
   ids.add(stroke.id);points+=stroke.points.length;if(points>10000)fail('invalid_annotation');
   const {color,width}=stroke;
   if(!['#172b4d','#1d4ed8','#b91c1c'].includes(color)||![2,4,6].includes(width))fail('invalid_annotation');
   return {id:stroke.id,color,width,points:stroke.points.map(p=>{if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)fail('invalid_annotation');return {x:p.x,y:p.y};})};
 });
 return {text:body.text,strokes};
}

/** Local synthetic pilot only. No production tenant onboarding or real child data is authorized. */
export function createPortalService({databasePath,questions=[],mode,examBlueprints=[]}={}){
 if(mode!=='synthetic_only')fail('synthetic_only_required');
 if(typeof databasePath!=='string'||!databasePath)fail('database_path_required');
 const content=questions.map(normalizeQuestion);if(new Set(content.map(q=>q.id)).size!==content.length)fail('duplicate_question');
 if(!Array.isArray(examBlueprints)||new Set(examBlueprints.map(x=>x.grade)).size!==examBlueprints.length)fail('invalid_exam_blueprint');
 const scoring=new Map();for(const spec of examBlueprints){if(!Number.isInteger(spec.grade)||spec.grade<1||spec.grade>8||!['formative','lgs'].includes(spec.scoringMode))fail('invalid_exam_blueprint');if(spec.scoringMode==='lgs'){const qs=content.filter(q=>q.grade===spec.grade);if(spec.grade!==8||qs.length!==90||Object.entries(LGS_DISTRIBUTION).some(([subject,count])=>qs.filter(q=>q.subject===subject).length!==count))fail('invalid_lgs_blueprint');}scoring.set(spec.grade,spec.scoringMode);}
 if(databasePath!==':memory:')mkdirSync(dirname(databasePath),{recursive:true,mode:0o700});
 const db=new DatabaseSync(databasePath);if(databasePath!==':memory:')chmodSync(databasePath,0o600);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=4000;
 CREATE TABLE IF NOT EXISTS schools(id TEXT PRIMARY KEY,name TEXT NOT NULL,quota INTEGER NOT NULL CHECK(quota>=0));
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,display_name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('platform_admin','school_admin','teacher','student','parent')),school_id TEXT REFERENCES schools(id),grade INTEGER,classroom TEXT,password_salt TEXT NOT NULL,password_hash TEXT NOT NULL,must_change INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS teacher_classes(teacher_id TEXT REFERENCES users(id),school_id TEXT REFERENCES schools(id),classroom TEXT,PRIMARY KEY(teacher_id,classroom));
 CREATE TABLE IF NOT EXISTS guardian_links(parent_id TEXT REFERENCES users(id),student_id TEXT REFERENCES users(id),PRIMARY KEY(parent_id,student_id));
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS exams(id TEXT PRIMARY KEY,grade INTEGER NOT NULL,title TEXT NOT NULL,snapshot_json TEXT NOT NULL,content_hash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES users(id),exam_id TEXT NOT NULL REFERENCES exams(id),grade INTEGER NOT NULL,snapshot_json TEXT NOT NULL,answers_json TEXT NOT NULL DEFAULT '{}',status TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress','finished')),started_at TEXT NOT NULL,finished_at TEXT,result_json TEXT,UNIQUE(student_id,exam_id));
 CREATE TABLE IF NOT EXISTS annotations(attempt_id TEXT NOT NULL REFERENCES attempts(id),question_id TEXT NOT NULL,student_id TEXT NOT NULL REFERENCES users(id),revision INTEGER NOT NULL,body_json TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(attempt_id,question_id));
 CREATE TABLE IF NOT EXISTS feedback(attempt_id TEXT NOT NULL REFERENCES attempts(id),author_id TEXT NOT NULL REFERENCES users(id),student_id TEXT NOT NULL REFERENCES users(id),rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),text TEXT NOT NULL,question_ids_json TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(attempt_id,author_id));
 CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id TEXT,action TEXT NOT NULL,target_id TEXT,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS attempts_student ON attempts(student_id,status);
 CREATE INDEX IF NOT EXISTS users_school_role ON users(school_id,role);`);
 for(const table of ['exams','attempts'])if(!db.prepare(`PRAGMA table_info(${table})`).all().some(c=>c.name==='scoring_mode'))db.exec(`ALTER TABLE ${table} ADD COLUMN scoring_mode TEXT NOT NULL DEFAULT 'formative'`);
 if(!db.prepare('PRAGMA table_info(exams)').all().some(c=>c.name==='active'))db.exec('ALTER TABLE exams ADD COLUMN active INTEGER NOT NULL DEFAULT 1');
 const transaction=fn=>{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}};
 const audit=(actor,action,target)=>db.prepare('INSERT INTO audit(actor_id,action,target_id,created_at) VALUES(?,?,?,?)').run(actor??null,action,target??null,new Date().toISOString());
 function addUser({id=randomUUID(),username,displayName,role,schoolId=null,grade=null,classroom=null,password='Demo2026!',mustChange=false}){
   const encoded=secret(password);db.prepare('INSERT INTO users(id,username,display_name,role,school_id,grade,classroom,password_salt,password_hash,must_change) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,username,displayName,role,schoolId,grade,classroom,encoded.salt,encoded.hash,mustChange?1:0);return id;
 }
 if(!db.prepare('SELECT id FROM users LIMIT 1').get())transaction(()=>{
   db.prepare('INSERT INTO schools VALUES(?,?,?)').run('school-a','Demo Okul A',100);db.prepare('INSERT INTO schools VALUES(?,?,?)').run('school-b','Demo Okul B',20);
   addUser({id:'platform-admin',username:'demo.superadmin',displayName:'Demo Platform Yöneticisi',role:'platform_admin'});
   for(const suffix of ['a','b'])addUser({id:`school-admin-${suffix}`,username:`demo.mudur.${suffix}`,displayName:`Demo Müdür ${suffix.toUpperCase()}`,role:'school_admin',schoolId:`school-${suffix}`});
   for(let grade=1;grade<=8;grade++){
     const teacherId=addUser({id:`teacher-${grade}a`,username:`demo.ogretmen.${grade}a`,displayName:`Demo Öğretmen ${grade}A`,role:'teacher',schoolId:'school-a'});
     db.prepare('INSERT INTO teacher_classes VALUES(?,?,?)').run(teacherId,'school-a',`${grade}A`);
     for(let i=1;i<=10;i++){
       const n=String(i).padStart(2,'0'),studentId=addUser({id:`student-a-${grade}-${n}`,username:`demo.ogrenci.${grade}.${n}`,displayName:`Demo Öğrenci ${grade}-${n}`,role:'student',schoolId:'school-a',grade,classroom:`${grade}A`});
       const parentId=addUser({id:`parent-a-${grade}-${n}`,username:`demo.veli.${grade}.${n}`,displayName:`Demo Veli ${grade}-${n}`,role:'parent',schoolId:'school-a'});
       db.prepare('INSERT INTO guardian_links VALUES(?,?)').run(parentId,studentId);
     }
   }
   for(let i=1;i<=2;i++)addUser({id:`student-b-6-${i}`,username:`demo.b.ogrenci.6.0${i}`,displayName:`Demo B Öğrenci ${i}`,role:'student',schoolId:'school-b',grade:6,classroom:'6A'});
   audit(null,'synthetic_seed','school-a');
 });
 transaction(()=>{
   // This injected catalog is authoritative for current delivery. Keep older papers only as history.
   db.prepare('UPDATE exams SET active=0').run();
   for(let grade=1;grade<=8;grade++){
     const set=content.filter(q=>q.grade===grade);if(!set.length)continue;const json=JSON.stringify(set);
     const contentHash=digest(json),scoringMode=scoring.get(grade)??'formative';
     const existing=db.prepare('SELECT id FROM exams WHERE grade=? AND content_hash=? AND scoring_mode=?').get(grade,contentHash,scoringMode);
     if(existing){db.prepare('UPDATE exams SET active=1 WHERE id=?').run(existing.id);continue;}
     const baseId=`grade-${grade}-pilot`,hasEarlier=db.prepare('SELECT 1 FROM exams WHERE grade=? LIMIT 1').get(grade);
     const id=hasEarlier?`${baseId}-r${digest(json+'|'+scoringMode).slice(0,20)}`:baseId;
     db.prepare('INSERT INTO exams(id,grade,title,snapshot_json,content_hash,scoring_mode,active) VALUES(?,?,?,?,?,?,1)').run(id,grade,`${grade}. Sınıf Ders Denemesi`,json,contentHash,scoringMode);
   }
 });
 function actor(id,{allowChange=false}={}){const row=db.prepare('SELECT * FROM users WHERE id=? AND active=1').get(id);if(!row)fail('unauthenticated',401);if(row.must_change&&!allowChange)fail('password_change_required',403);return row;}
 function canReadStudent(who,student){
   if(who.role==='platform_admin')return true;
   if(who.role==='student')return who.id===student.id;
   if(who.school_id!==student.school_id)return false;
   if(who.role==='school_admin')return true;
   if(who.role==='teacher')return !!db.prepare('SELECT 1 FROM teacher_classes WHERE teacher_id=? AND school_id=? AND classroom=?').get(who.id,student.school_id,student.classroom);
   return who.role==='parent'&&!!db.prepare('SELECT 1 FROM guardian_links WHERE parent_id=? AND student_id=?').get(who.id,student.id);
 }
 function scopedStudents(who){return db.prepare("SELECT * FROM users WHERE role='student' AND active=1 ORDER BY grade,classroom,username").all().filter(s=>canReadStudent(who,s));}
 function ownAttempt(who,id,write=false){const row=db.prepare('SELECT * FROM attempts WHERE id=?').get(id);if(!row)fail('not_found',404);const child=db.prepare('SELECT * FROM users WHERE id=?').get(row.student_id);if(write?(who.role!=='student'||who.id!==row.student_id):!canReadStudent(who,child))fail('forbidden',403);return row;}
 function viewAttempt(row){return {id:row.id,examId:row.exam_id,studentId:row.student_id,grade:row.grade,status:row.status,scoringMode:row.scoring_mode,targetCount:TARGETS[row.grade],startedAt:row.started_at,finishedAt:row.finished_at,questions:parse(row.snapshot_json).map(q=>studentQuestion(q,row.status==='finished')),responses:parse(row.answers_json),result:row.result_json?parse(row.result_json):null};}
 function examView(row){const qs=parse(row.snapshot_json),targetCount=TARGETS[row.grade];return {id:row.id,title:row.title,grade:row.grade,questionCount:qs.length,targetCount,subjects:[...new Set(qs.map(q=>q.subject))],status:qs.length<targetCount?'incomplete':'draft',scoringMode:row.scoring_mode};}
 function listExamsFor(who){const grades=new Set(scopedStudents(who).map(s=>s.grade));return db.prepare('SELECT * FROM exams WHERE active=1 ORDER BY grade').all().filter(e=>who.role==='platform_admin'||who.role==='school_admin'||grades.has(e.grade)).map(examView);}
 function managementSchool(who,schoolId){if(who.role!=='platform_admin'&&!(who.role==='school_admin'&&who.school_id===schoolId))fail('forbidden',403);const school=db.prepare('SELECT * FROM schools WHERE id=?').get(schoolId);if(!school)fail('not_found',404);return school;}
 function summarize(who){
   const students=scopedStudents(who),ids=new Set(students.map(s=>s.id));const attempts=db.prepare("SELECT * FROM attempts WHERE status='finished' ORDER BY finished_at DESC").all().filter(a=>ids.has(a.student_id));
   const totals={correct:0,wrong:0,blank:0,total:0},maps={bySubject:new Map(),byTopic:new Map(),byFamily:new Map(),questions:new Map()};
   function bucket(map,key){if(!map.has(key))map.set(key,{key,correct:0,wrong:0,blank:0,total:0});return map.get(key);}
   for(const a of attempts){const responses=parse(a.answers_json);for(const q of parse(a.snapshot_json)){
     const state=responses[q.id]===undefined?'blank':responses[q.id]===q.answer?'correct':'wrong';totals[state]++;totals.total++;
     const questionVersion=digest(JSON.stringify(q));
     for(const [name,key] of [['bySubject',q.subject],['byTopic',q.topic],['byFamily',q.familyId],['questions',`${q.id}@${questionVersion}`]]){const b=bucket(maps[name],key);b[state]++;b.total++;if(name==='questions')Object.assign(b,{questionId:q.id,questionVersion,grade:q.grade,subject:q.subject,topic:q.topic,familyId:q.familyId,stem:q.stem});}
   }}
   const questionFeedback=new Map();const feedbackRows=db.prepare('SELECT * FROM feedback ORDER BY updated_at DESC').all().filter(f=>ids.has(f.student_id));
   const completedById=new Map(attempts.map(a=>[a.id,a]));
   for(const f of feedbackRows){const snapshot=parse(completedById.get(f.attempt_id).snapshot_json);for(const qid of parse(f.question_ids_json)){const question=snapshot.find(q=>q.id===qid),questionVersion=digest(JSON.stringify(question)),key=`${qid}@${questionVersion}`;if(!questionFeedback.has(key))questionFeedback.set(key,{questionId:qid,questionVersion,responses:0,sum:0,positive:0,negative:0});const r=questionFeedback.get(key);r.responses++;r.sum+=f.rating;if(f.rating>=4)r.positive++;if(f.rating<=2)r.negative++;}}
   const aggregate={completedAttempts:attempts.length,studentsWithCompletedAttempts:new Set(attempts.map(a=>a.student_id)).size,totals};
   for(const [name,map] of Object.entries(maps))aggregate[name]=[...map.values()].map(b=>({...b,exposures:b.total,correctRate:b.total?b.correct/b.total:null}));
   aggregate.questionFeedback=[...questionFeedback.values()].map(({sum,...r})=>({...r,averageRating:sum/r.responses}));
   const lgsAttempts=attempts.filter(a=>a.scoring_mode==='lgs'),lgsSubjects=new Map();for(const a of lgsAttempts){const responses=parse(a.answers_json);for(const q of parse(a.snapshot_json)){if(!lgsSubjects.has(q.subject))lgsSubjects.set(q.subject,{subject:q.subject,correct:0,wrong:0,blank:0,exposures:0});const group=lgsSubjects.get(q.subject);group[responses[q.id]===undefined?'blank':responses[q.id]===q.answer?'correct':'wrong']++;group.exposures++;}}
   aggregate.lgs={completedAttempts:lgsAttempts.length,averageNet:lgsAttempts.length?lgsAttempts.reduce((sum,a)=>sum+parse(a.result_json).net,0)/lgsAttempts.length:null,bySubject:[...lgsSubjects.values()].map(g=>({...g,net:g.correct-g.wrong/3,averageNet:(g.correct-g.wrong/3)/lgsAttempts.length}))};
   aggregate.feedback=feedbackRows.map(f=>({attemptId:f.attempt_id,studentId:f.student_id,authorRole:db.prepare('SELECT role FROM users WHERE id=?').get(f.author_id).role,rating:f.rating,text:f.text,questionIds:parse(f.question_ids_json),updatedAt:f.updated_at}));
   aggregate.recentAttempts=attempts.slice(0,40).map(a=>({id:a.id,studentId:a.student_id,examId:a.exam_id,grade:a.grade,finishedAt:a.finished_at,result:parse(a.result_json)}));
   return {students:students.map(safeUser),analytics:aggregate};
 }
 const service={
   login(username,password){
     const row=typeof username==='string'&&username.length<=80?db.prepare('SELECT * FROM users WHERE username=? AND active=1').get(username):null;
     if(!row||!matches(password,row))fail('invalid_credentials',401);const token=randomBytes(32).toString('base64url');
     db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(token),row.id,Date.now()+SESSION_MS);audit(row.id,'login',row.id);return {token,user:safeUser(row)};
   },
   authenticate(token){if(typeof token!=='string'||token.length>200)fail('unauthenticated',401);const session=db.prepare('SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?').get(digest(token),Date.now());if(!session)fail('unauthenticated',401);return safeUser(actor(session.user_id,{allowChange:true}));},
   logout(token){if(typeof token==='string')db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token));return {ok:true};},
   changePassword(actorId,current,next){const who=actor(actorId,{allowChange:true});if(!matches(current,who))fail('invalid_credentials',401);if(typeof next!=='string'||next.length<12||next.length>128||next===current)fail('weak_password');const encoded=secret(next);transaction(()=>{db.prepare('UPDATE users SET password_salt=?,password_hash=?,must_change=0 WHERE id=?').run(encoded.salt,encoded.hash,who.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(who.id);audit(who.id,'password_changed',who.id);});return {ok:true,loginRequired:true};},
   listStudents(actorId){return scopedStudents(actor(actorId)).map(safeUser);},
   listExams(actorId){return listExamsFor(actor(actorId));},
   dashboard(actorId){const who=actor(actorId),summary=summarize(who);const schools=db.prepare('SELECT * FROM schools ORDER BY id').all().filter(s=>who.role==='platform_admin'||s.id===who.school_id).map(s=>['platform_admin','school_admin'].includes(who.role)?{...s,enrollment:db.prepare("SELECT count(*) AS n FROM users WHERE school_id=? AND role='student' AND active=1").get(s.id).n}:{id:s.id,name:s.name});return {user:safeUser(who),schools,students:summary.students,exams:listExamsFor(who),analytics:summary.analytics,contributionPoints:db.prepare('SELECT count(*) AS n FROM feedback WHERE author_id=?').get(who.id).n,mode:'synthetic_only'};},
   startAttempt(actorId,examId){const who=actor(actorId);if(who.role!=='student')fail('forbidden',403);const exam=db.prepare('SELECT * FROM exams WHERE id=?').get(examId);if(!exam)fail('not_found',404);if(exam.grade!==who.grade)fail('forbidden',403);if(!exam.active)fail('exam_withdrawn',409);return transaction(()=>{let row=db.prepare('SELECT * FROM attempts WHERE student_id=? AND exam_id=?').get(who.id,exam.id);if(!row){const id=randomUUID();db.prepare('INSERT INTO attempts(id,student_id,exam_id,grade,snapshot_json,started_at,scoring_mode) VALUES(?,?,?,?,?,?,?)').run(id,who.id,exam.id,who.grade,exam.snapshot_json,new Date().toISOString(),exam.scoring_mode);audit(who.id,'attempt_started',id);row=db.prepare('SELECT * FROM attempts WHERE id=?').get(id);}return viewAttempt(row);});},
   getAttempt(actorId,attemptId){return viewAttempt(ownAttempt(actor(actorId),attemptId));},
   answer(actorId,attemptId,{questionId,choice}={}){const who=actor(actorId);return transaction(()=>{const row=ownAttempt(who,attemptId,true);if(row.status==='finished')fail('attempt_finished',409);const q=parse(row.snapshot_json).find(q=>q.id===questionId);if(!q)fail('invalid_question');if(choice!==null&&(!Number.isInteger(choice)||choice<0||choice>=q.options.length))fail('invalid_choice');const responses=parse(row.answers_json);if(choice===null)delete responses[q.id];else responses[q.id]=choice;db.prepare('UPDATE attempts SET answers_json=? WHERE id=?').run(JSON.stringify(responses),row.id);return viewAttempt(db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id));});},
   finish(actorId,attemptId){const who=actor(actorId);return transaction(()=>{const row=ownAttempt(who,attemptId,true);if(row.status==='finished')return viewAttempt(row);const qs=parse(row.snapshot_json),responses=parse(row.answers_json),result={correct:0,wrong:0,blank:0,total:qs.length,scoringMode:row.scoring_mode};for(const q of qs){if(responses[q.id]===undefined)result.blank++;else if(responses[q.id]===q.answer)result.correct++;else result.wrong++;}if(row.scoring_mode==='lgs')result.net=result.correct-result.wrong/3;db.prepare("UPDATE attempts SET status='finished',finished_at=?,result_json=? WHERE id=?").run(new Date().toISOString(),JSON.stringify(result),row.id);audit(who.id,'attempt_finished',row.id);return viewAttempt(db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id));});},
   readAnnotation(actorId,attemptId,questionId){const who=actor(actorId),row=ownAttempt(who,attemptId,true);if(!parse(row.snapshot_json).some(q=>q.id===questionId))fail('invalid_question');const note=db.prepare('SELECT * FROM annotations WHERE attempt_id=? AND question_id=?').get(attemptId,questionId);return note?{revision:note.revision,body:parse(note.body_json),updatedAt:note.updated_at}:{revision:0,body:{text:'',strokes:[]},updatedAt:null};},
   saveAnnotation(actorId,attemptId,questionId,{expectedRevision,body}={}){const who=actor(actorId);if(!Number.isInteger(expectedRevision)||expectedRevision<0)fail('invalid_revision');const safeBody=annotationBody(body);return transaction(()=>{const current=service.readAnnotation(who.id,attemptId,questionId);if(current.revision!==expectedRevision)fail('revision_conflict',409);const updatedAt=new Date().toISOString();db.prepare('INSERT INTO annotations VALUES(?,?,?,?,?,?) ON CONFLICT(attempt_id,question_id) DO UPDATE SET revision=excluded.revision,body_json=excluded.body_json,updated_at=excluded.updated_at').run(attemptId,questionId,who.id,expectedRevision+1,JSON.stringify(safeBody),updatedAt);return {revision:expectedRevision+1,body:safeBody,updatedAt};});},
   feedback(actorId,attemptId,{rating,text,questionIds=[]}={}){const who=actor(actorId),row=ownAttempt(who,attemptId);if(row.status!=='finished')fail('finish_required',409);if(!['student','parent'].includes(who.role))fail('forbidden',403);if(who.role==='parent'&&row.grade>4)fail('student_feedback_required',403);if(who.role==='student'&&row.grade<=4)fail('parent_feedback_required',403);if(!Number.isInteger(rating)||rating<1||rating>5||typeof text!=='string'||!text.trim()||text.length>3000||!Array.isArray(questionIds)||new Set(questionIds).size!==questionIds.length)fail('invalid_feedback');const ids=new Set(parse(row.snapshot_json).map(q=>q.id));if(questionIds.some(id=>!ids.has(id)))fail('invalid_question');const time=new Date().toISOString();db.prepare('INSERT INTO feedback VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(attempt_id,author_id) DO UPDATE SET rating=excluded.rating,text=excluded.text,question_ids_json=excluded.question_ids_json,updated_at=excluded.updated_at').run(row.id,who.id,row.student_id,rating,text.trim(),JSON.stringify(questionIds),time,time);return {saved:true,contributionPoints:db.prepare('SELECT count(*) AS n FROM feedback WHERE author_id=?').get(who.id).n,message:'Olumlu veya eleştirel her geri bildirim aynı katkı puanını kazanır. Teşekkürler.'};},
   setQuota(actorId,schoolId,quota){const who=actor(actorId);if(who.role!=='platform_admin')fail('forbidden',403);managementSchool(who,schoolId);if(!Number.isInteger(quota)||quota<0||quota>10000)fail('invalid_quota');return transaction(()=>{const enrolled=db.prepare("SELECT count(*) AS n FROM users WHERE school_id=? AND role='student' AND active=1").get(schoolId).n;if(quota<enrolled)fail('quota_below_enrollment',409);db.prepare('UPDATE schools SET quota=? WHERE id=?').run(quota,schoolId);audit(who.id,'quota_changed',schoolId);return {schoolId,quota,enrollment:enrolled};});},
   createSchool(actorId,{name,quota,adminUsername,adminDisplayName,temporaryPassword,confirmedSynthetic}={}){const who=actor(actorId);if(who.role!=='platform_admin')fail('forbidden',403);if(confirmedSynthetic!==true)fail('synthetic_confirmation_required');if(typeof name!=='string'||!/^Demo [\p{L}\p{N} .-]{1,60}$/u.test(name)||typeof adminUsername!=='string'||!/^demo\.[a-z0-9.]{3,60}$/u.test(adminUsername)||typeof adminDisplayName!=='string'||!/^Demo [\p{L}\p{N} .-]{1,60}$/u.test(adminDisplayName))fail('synthetic_alias_required');if(!Number.isInteger(quota)||quota<1||quota>10000)fail('invalid_quota');if(typeof temporaryPassword!=='string'||temporaryPassword.length<12||temporaryPassword.length>128)fail('weak_password');if(db.prepare('SELECT 1 FROM users WHERE username=?').get(adminUsername))fail('duplicate_username',409);return transaction(()=>{const id=`school-${randomUUID()}`;db.prepare('INSERT INTO schools VALUES(?,?,?)').run(id,name,quota);const adminId=addUser({username:adminUsername,displayName:adminDisplayName,role:'school_admin',schoolId:id,password:temporaryPassword,mustChange:true});audit(who.id,'synthetic_school_created',id);return {school:{id,name,quota,enrollment:0},administrator:safeUser(db.prepare('SELECT * FROM users WHERE id=?').get(adminId))};});},
   updateStudent(actorId,studentId,{grade,classroom,displayName,teacherId}={}){const who=actor(actorId),child=db.prepare("SELECT * FROM users WHERE id=? AND role='student' AND active=1").get(studentId);if(!child)fail('not_found',404);managementSchool(who,child.school_id);if(typeof displayName!=='string'||!/^Demo [\p{L}\p{N} .-]{1,60}$/u.test(displayName))fail('synthetic_alias_required');if(!Number.isInteger(grade)||grade<1||grade>8||typeof classroom!=='string'||!new RegExp(`^${grade}[A-ZÇĞİÖŞÜ]{1,2}$`,'u').test(classroom))fail('invalid_classroom');if(teacherId){const teacher=db.prepare("SELECT * FROM users WHERE id=? AND role='teacher' AND active=1").get(teacherId);if(!teacher||teacher.school_id!==child.school_id)fail('invalid_teacher');}return transaction(()=>{db.prepare('UPDATE users SET grade=?,classroom=?,display_name=? WHERE id=?').run(grade,classroom,displayName,child.id);if(teacherId)db.prepare('INSERT OR IGNORE INTO teacher_classes VALUES(?,?,?)').run(teacherId,child.school_id,classroom);audit(who.id,'student_roster_updated',child.id);return safeUser(db.prepare('SELECT * FROM users WHERE id=?').get(child.id));});},
   importStudents(actorId,{schoolId,rows,confirmedSynthetic}={}){const who=actor(actorId);managementSchool(who,schoolId);if(confirmedSynthetic!==true)fail('synthetic_confirmation_required');if(!Array.isArray(rows)||!rows.length||rows.length>300)fail('invalid_roster');const names=new Set();for(const row of rows){if(!row||typeof row.username!=='string'||!/^demo\.[a-z0-9.]{3,60}$/u.test(row.username)||typeof row.displayName!=='string'||!/^Demo [\p{L}\p{N} .-]{1,60}$/u.test(row.displayName))fail('synthetic_alias_required');if(names.has(row.username)||db.prepare('SELECT 1 FROM users WHERE username=?').get(row.username))fail('duplicate_username',409);names.add(row.username);if(!Number.isInteger(row.grade)||row.grade<1||row.grade>8||typeof row.classroom!=='string'||!new RegExp(`^${row.grade}[A-ZÇĞİÖŞÜ]{1,2}$`,'u').test(row.classroom))fail('invalid_classroom');if(row.teacherId){const teacher=db.prepare("SELECT * FROM users WHERE id=? AND role='teacher' AND active=1").get(row.teacherId);if(!teacher||teacher.school_id!==schoolId)fail('invalid_teacher');}}
     return transaction(()=>{const school=managementSchool(who,schoolId),enrolled=db.prepare("SELECT count(*) AS n FROM users WHERE school_id=? AND role='student' AND active=1").get(schoolId).n;if(enrolled+rows.length>school.quota)fail('quota_exceeded',409);const created=[];for(const row of rows){const temporaryPassword=`Demo-${randomBytes(12).toString('base64url')}!`,id=addUser({...row,schoolId,role:'student',password:temporaryPassword,mustChange:true});if(row.teacherId)db.prepare('INSERT OR IGNORE INTO teacher_classes VALUES(?,?,?)').run(row.teacherId,schoolId,row.classroom);created.push({id,username:row.username,temporaryPassword});}audit(who.id,'synthetic_roster_import',schoolId);return {created,enrollment:enrolled+rows.length,quota:school.quota};});},
   close(){db.close();}
 };
 return service;
}
