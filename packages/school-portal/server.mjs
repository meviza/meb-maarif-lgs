import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {createPortalService} from './service.mjs';
const assets=new Map([
 ['/',['index.html','text/html']],['/portal.mjs',['portal.mjs','text/javascript']],['/portal.css',['portal.css','text/css']],['/request_scope.mjs',['request_scope.mjs','text/javascript']],
 ['/annotation_widget.mjs',['annotation_widget.mjs','text/javascript']],['/annotation_model.mjs',['annotation_model.mjs','text/javascript']],['/annotation.css',['annotation.css','text/css']],
 ['/booklet.css',['../science-booklet/booklet.css','text/css']],['/pagination.mjs',['../science-booklet/pagination.mjs','text/javascript']]
]);
const policies={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
export async function createSchoolPortalServer({databasePath,questions,examBlueprints,port=0}){
 const files=new Map(await Promise.all([...assets].map(async([route,[file,type]])=>[route,{bytes:await readFile(new URL(file,import.meta.url)),type:type+'; charset=utf-8'}])));
 const service=createPortalService({databasePath,questions,examBlueprints,mode:'synthetic_only'});
 const cookieName='school_demo_'+randomBytes(8).toString('hex');let origin;const loginAttempts=new Map();
 const send=(res,status,data,type='application/json; charset=utf-8',headers={})=>{const bytes=Buffer.isBuffer(data)?data:Buffer.from(typeof data==='string'?data:JSON.stringify(data));res.writeHead(status,{...policies,...headers,'Content-Type':type,'Content-Length':bytes.length});res.end(bytes);};
 const specs={
  '/api/start':[['examId'],(a,b)=>service.startAttempt(a,b.examId)],
  '/api/attempt':[['attemptId'],(a,b)=>service.getAttempt(a,b.attemptId)],
  '/api/answer':[['attemptId','questionId','choice'],(a,b)=>service.answer(a,b.attemptId,b)],
  '/api/finish':[['attemptId'],(a,b)=>service.finish(a,b.attemptId)],
  '/api/note/read':[['attemptId','questionId'],(a,b)=>service.readAnnotation(a,b.attemptId,b.questionId)],
  '/api/note/save':[['attemptId','questionId','expectedRevision','body'],(a,b)=>service.saveAnnotation(a,b.attemptId,b.questionId,b)],
  '/api/feedback':[['attemptId','rating','text','questionIds'],(a,b)=>service.feedback(a,b.attemptId,b)],
  '/api/password':[['current','next'],(a,b)=>service.changePassword(a,b.current,b.next)],
  '/api/quota':[['schoolId','quota'],(a,b)=>service.setQuota(a,b.schoolId,b.quota)],
  '/api/import':[['schoolId','rows','confirmedSynthetic'],(a,b)=>service.importStudents(a,b)],
  '/api/student/update':[['studentId','grade','classroom','displayName','teacherId'],(a,b)=>service.updateStudent(a,b.studentId,b)],
  '/api/school/create':[['name','quota','adminUsername','adminDisplayName','temporaryPassword','confirmedSynthetic'],(a,b)=>service.createSchool(a,b)],
 };
 const server=createServer({maxHeaderSize:8192,requestTimeout:10000,headersTimeout:10000},async(req,res)=>{
  const reject=(status,error)=>send(res,status,{error});
  try{
   if(req.headers.host!==new URL(origin).host)return reject(403,'invalid_host');
   if(req.headers.origin&&req.headers.origin!==origin)return reject(403,'cross_origin');
   if(req.headers['sec-fetch-site']==='cross-site'&&req.headers['sec-fetch-mode']!=='navigate')return reject(403,'cross_site');
   if(req.url.includes('?')||Object.keys(req.headers).some(h=>/^x-(role|school-id|student-id|grade|tenant-id)$/u.test(h)))return reject(400,'invalid_request');
   const token=(req.headers.cookie??'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
   if(req.method==='GET'&&files.has(req.url)){const f=files.get(req.url);return send(res,200,f.bytes,f.type);}
   if(req.method==='GET'&&req.url==='/api/session'){const user=service.authenticate(token);return send(res,200,{user,mode:'synthetic_only'});}
   if(req.method==='GET'&&req.url==='/api/dashboard'){const user=service.authenticate(token);return send(res,200,service.dashboard(user.id));}
   if(req.method!=='POST')return reject(req.method==='GET'?404:405,'not_found');
   if(!specs[req.url]&&!['/api/login','/api/logout'].includes(req.url))return reject(404,'not_found');
   if(req.headers.origin!==origin)return reject(403,'same_origin_required');
   if(req.headers['content-type']!=='application/json')return reject(415,'json_required');
   if(Number(req.headers['content-length'])>524288)return reject(413,'body_too_large');
   let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>524288)return reject(413,'body_too_large');chunks.push(c);}
   let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return reject(400,'invalid_json');}
   const keys=req.url==='/api/login'?['username','password']:req.url==='/api/logout'?[]:specs[req.url][0];
   if(!body||Array.isArray(body)||Object.keys(body).length!==keys.length||keys.some(k=>!Object.hasOwn(body,k)))return reject(400,'invalid_body');
   if(req.url==='/api/login'){
    // Local demo throttling is not a production abuse-protection service.
    const key=String(body.username).slice(0,80),now=Date.now();for(const [k,v] of loginAttempts)if(now-v.since>60000)loginAttempts.delete(k);
    const recent=loginAttempts.get(key);if((recent?.count??0)>=10||loginAttempts.size>200)return reject(429,'login_throttled');
    try{const result=service.login(body.username,body.password);if(token)service.logout(token);loginAttempts.delete(key);return send(res,200,{user:result.user},undefined,{'Set-Cookie':`${cookieName}=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`});}
    catch(e){loginAttempts.set(key,{count:(recent?.count??0)+1,since:recent?.since??now});throw e;}
   }
   const user=service.authenticate(token);
   if(req.url==='/api/logout'){service.logout(token);return send(res,200,{ok:true},undefined,{'Set-Cookie':`${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`});}
   return send(res,200,specs[req.url][1](user.id,body));
  }catch(e){send(res,Number.isInteger(e.status)?e.status:400,{error:e.code??'request_rejected'});}
 });
 try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen({host:'127.0.0.1',port},resolve);});}
 catch(error){service.close();throw error;}
 origin=`http://127.0.0.1:${server.address().port}`;
 return {url:origin+'/',close:()=>new Promise((resolve,reject)=>{server.close(e=>{service.close();e?reject(e):resolve();});server.closeAllConnections();})};
}
