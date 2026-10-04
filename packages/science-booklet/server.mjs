import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createExamSession} from './session.mjs';

const assets=new Map([['/',['index.html','text/html; charset=utf-8']],['/booklet.css',['booklet.css','text/css; charset=utf-8']],['/booklet.mjs',['booklet.mjs','text/javascript; charset=utf-8']],['/pagination.mjs',['pagination.mjs','text/javascript; charset=utf-8']]]);
const security={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY',
  'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};

export async function createBookletServer({grade,items,port=0}) {
  // Validate trusted enrollment/content before binding. No user data, account or external API.
  items=structuredClone(items);
  createExamSession(items,grade);
  if(!Number.isInteger(port)||port<0||port>65535)throw new Error('invalid_port');
  const content=new Map(await Promise.all([...assets].map(async([route,[file,type]])=>[route,{type,bytes:await readFile(new URL(file,import.meta.url))}])));
  const sessions=new Map();let origin;
  const cookieName='exam_'+randomBytes(8).toString('hex');
  const send=(res,status,body,type='application/json; charset=utf-8',headers={})=>{
    const bytes=Buffer.isBuffer(body)?body:Buffer.from(typeof body==='string'?body:JSON.stringify(body));
    res.writeHead(status,{...security,...headers,'Content-Type':type,'Content-Length':bytes.length});res.end(bytes);
  };
  const server=createServer({maxHeaderSize:8192,requestTimeout:5000,headersTimeout:5000},async(req,res)=>{
    const reject=(status,error)=>send(res,status,{error});
    try {
      if(req.headers.host!==new URL(origin).host)return reject(403,'invalid_host');
      if(req.url.includes('?')||req.url.includes('#')||Object.keys(req.headers).some(h=>/^(x-(grade|student-grade|role|tenant-id|school-id)|authorization)$/u.test(h)))return reject(400,'enrollment_not_client_controlled');
      if(!['GET','POST'].includes(req.method))return reject(405,'method_not_allowed');
      if(req.headers.origin&&req.headers.origin!==origin)return reject(403,'cross_origin');
      if(req.headers['sec-fetch-site']==='cross-site'&&req.headers['sec-fetch-mode']!=='navigate')return reject(403,'cross_site');
      const cookie=(req.headers.cookie??'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);
      let session=sessions.get(cookie);
      if(req.method==='GET'&&content.has(req.url)) {
        const {type,bytes}=content.get(req.url);let headers={};
        if(req.url==='/'&&!session){
          if(sessions.size>=64)return reject(503,'preview_session_limit');
          const id=randomBytes(24).toString('hex');session=createExamSession(items,grade);sessions.set(id,session);
          headers={'Set-Cookie':`${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/`};
        }
        return send(res,200,bytes,type,headers);
      }
      const routes=new Set(['/api/booklet','/api/review','/api/answer','/api/flag','/api/finish']);
      if(!routes.has(req.url))return reject(404,'not_found');
      if(!session)return reject(401,'session_required');
      if(req.method==='GET'){
        if(req.url==='/api/booklet')return send(res,200,session.booklet());
        if(req.url==='/api/review')return send(res,200,session.review());
        return reject(405,'post_required');
      }
      if(!['/api/answer','/api/flag','/api/finish'].includes(req.url))return reject(405,'get_required');
      if(req.headers.origin!==origin)return reject(403,'same_origin_required');
      if(req.headers['content-type']!=='application/json')return reject(415,'json_required');
      if(Number(req.headers['content-length'])>4096)return reject(413,'body_too_large');
      const chunks=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>4096)return reject(413,'body_too_large');chunks.push(chunk);}
      let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return reject(400,'invalid_json');}
      if(!body||Array.isArray(body)||typeof body!=='object')return reject(400,'invalid_body');
      const expected=req.url==='/api/answer'?['id','choice']:req.url==='/api/flag'?['id','enabled']:[];
      if(Object.keys(body).length!==expected.length||expected.some(k=>!Object.hasOwn(body,k)))return reject(400,'invalid_body');
      const response=req.url==='/api/answer'?session.answer(body.id,body.choice):req.url==='/api/flag'?session.flag(body.id,body.enabled):session.finish();
      return send(res,200,response);
    }catch(e){return reject(['finish_required','exam_finished'].includes(e.message)?409:400,['finish_required','exam_finished','question_not_in_exam','invalid_choice','invalid_flag'].includes(e.message)?e.message:'request_rejected');}
  });
  server.timeout=5000;
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen({host:'127.0.0.1',port},resolve);});
  origin=`http://127.0.0.1:${server.address().port}`;
  return {url:origin+'/',grade,close:()=>new Promise((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeAllConnections();sessions.clear();})};
}
