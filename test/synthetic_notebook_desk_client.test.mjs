import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { request as httpRequest } from 'node:http';
import { createSyntheticNotebookDeskServer } from '../packages/contracts/synthetic_notebook_application_server.mjs';
import { createSyntheticNotebookApplication } from '../packages/contracts/synthetic_notebook_application.mjs';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
import { createSyntheticNotebookFixture as fixture, createSyntheticNotebookRequest as request,
  createSyntheticNotebookReceipt as receipt, hashSyntheticNotebook as sha } from './support/synthetic_notebook_fixture.mjs';

const api=await import('../packages/student/notebook_desk.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const clone=v=>JSON.parse(JSON.stringify(v));
const empty=()=>({text:'',strokes:[],bookmarks:{questions:[],topics:[]},notes:[],concerns:[]});
const row=v=>({rowCount:1,rows:[{notebook_result:v}]});
function readValue(s,req=null) {
  const r=req?receipt(s,req):null;
  const binding=createSyntheticNotebookSyncPreparer(s).prepare({...request(),body:empty()}).intent.governanceBinding;
  return {scope:clone(s.scope),scopeSha256:sha('scope',s.scope),revision:r?.resultingRevision??0,
    body:req?clone(req.body):null,bodySha256:r?.bodySha256??null,receipt:r,governanceBinding:clone(binding),syntheticOnly:true,productionReady:false};
}
function session(initial=null) {
  const s=fixture();let head=initial,failWrite=false;const calls=[];
  function execute(q){
    calls.push(q.text);
    if(q.text.includes('read_current'))return row(readValue(s,head));
    const intent=JSON.parse(q.values[0]);head={contractVersion:'1.0.0',mutationId:intent.mutationId,idempotencyKey:intent.idempotencyKey,expectedRevision:intent.expectedRevision,body:intent.body};
    if(failWrite)throw new Error('private synthetic failure');
    const r=receipt(s,head);return row({outcome:'accepted',receipt:r,head:{revision:r.resultingRevision,bodySha256:r.bodySha256},syntheticOnly:true,productionReady:false});
  }
  const app=createSyntheticNotebookApplication({sourceFixture:s,execute});
  const requests=[];
  const transport=async(path,options)=>{
    requests.push({path,options});let out;
    if(path==='/api/notebook/current')out=app.current();
    else if(path==='/api/notebook/read')out=await app.readCurrent();
    else if(path==='/api/notebook/save')out=await app.save(JSON.parse(options.body));
    else throw new Error('unexpected_endpoint');
    const status=out.valid===false?(out.persisted===null?503:out.error?.code?.includes('conflict')?409:400):200;
    return JSON.stringify({status,body:JSON.stringify(out)});
  };
  return {app,transport,requests,calls,source:s,execute,get head(){return head;},set failWrite(v){failWrite=v;}};
}
function client(transport) {
  assert.equal(typeof api.createSyntheticNotebookDeskClient,'function','synthetic desk client missing');
  return api.createSyntheticNotebookDeskClient(transport);
}
const wire=(status,body)=>JSON.stringify({status,body:JSON.stringify(body)});
const blankText='Yerel taslak';

test('desk starts unread and initialization does not read SQL or enable saving',async()=>{
  const s=session(),c=client(s.transport);
  assert.equal(c.current().state,'not_read');assert.equal(c.current().canSave,false);
  assert.deepEqual(c.current().draft,empty());
  await c.initialize();assert.equal(c.current().state,'not_read');assert.equal(c.current().verifiedRead,null);
  assert.equal(c.current().canSave,false);assert.deepEqual(s.requests.map(r=>r.path),['/api/notebook/current']);assert.equal(s.calls.length,0);
  await c.save();assert.equal(s.requests.length,1);
});

test('explicit read binds revision zero but never silently replaces the local draft',async()=>{
  const s=session(),c=client(s.transport);c.replaceDraft(JSON.stringify({...empty(),text:blankText}));
  await c.read();const view=c.current();assert.equal(view.state,'verified_current');assert.equal(view.canSave,true);
  assert.equal(view.verifiedRead.revision,0);assert.equal(view.verifiedRead.body,null);assert.equal(view.draft.text,blankText);
  assert.equal(view.persisted,true);assert.equal(Object.isFrozen(view.draft),true);
  c.loadRead();assert.deepEqual(c.current().draft,empty());assert.equal(s.requests.length,1);
});

test('explicit load of a nonempty verified read preserves literal text and fixed notes',async()=>{
  const req=request(),s=session(req),c=client(s.transport);c.replaceDraft(JSON.stringify({...empty(),text:blankText}));
  await c.read();assert.equal(c.current().draft.text,blankText);c.loadRead();assert.deepEqual(c.current().draft,req.body);
  assert.equal(c.current().draft.notes[0].text,"<img src=x onerror=alert('literal')>");
});

test('confirmed save emits only closed DTO and keeps last read separate and stale',async()=>{
  const s=session(),c=client(s.transport);await c.read();c.replaceDraft(JSON.stringify({...empty(),text:'Yeni kayıt 📝'}));
  await c.save();const view=c.current();assert.equal(view.state,'read_stale_after_write');assert.equal(view.canSave,false);
  assert.equal(view.persisted,true);assert.equal(view.verifiedRead.revision,0);assert.equal(view.verifiedRead.body,null);
  assert.equal(view.draft.text,'Yeni kayıt 📝');assert.equal(view.receipt.resultingRevision,1);
  const sent=s.requests.at(-1),dto=JSON.parse(sent.options.body);
  assert.deepEqual(Object.keys(dto).sort(),['body','contractVersion','expectedRevision','idempotencyKey','mutationId']);assert.equal(dto.expectedRevision,0);
  assert.equal(sent.options.credentials,'omit');assert.equal(sent.options.redirect,'error');assert.equal(sent.options.cache,'no-store');assert.equal(Object.isFrozen(sent.options),true);
  await c.save();assert.equal(s.requests.length,2);assert.deepEqual(s.requests.map(x=>x.path),['/api/notebook/read','/api/notebook/save']);
  await c.read();assert.equal(c.current().verifiedRead.body.text,'Yeni kayıt 📝');assert.equal(c.current().canSave,true);
});

test('lost transport after real application commit locks save without automatic recovery or retry',async()=>{
  const s=session();let lost=false;
  const c=client(async(path,opts)=>{const raw=await s.transport(path,opts);if(path.endsWith('/save')&&lost)throw new Error('private unsafe error <script>');return raw;});
  await c.read();c.replaceDraft(JSON.stringify({...empty(),text:'Committed despite response loss'}));lost=true;await c.save();
  assert.equal(s.head.body.text,'Committed despite response loss');assert.equal(c.current().state,'save_unknown');assert.equal(c.current().persisted,null);assert.equal(c.current().canSave,false);
  assert.equal(c.current().verifiedRead.revision,0);assert.equal(JSON.stringify(c.current()).includes('private unsafe'),false);
  await c.save();assert.equal(s.requests.length,2);await c.read();assert.equal(c.current().verifiedRead.revision,1);assert.equal(c.current().canSave,true);
});

test('valid server 503 and 409 lock saving until an explicit fresh read',async()=>{
  for(const status of [503,409]) {
    const s=session(),c=client(async(path,opts)=>{
      if(path.endsWith('/save')) {
        s.failWrite=status===503;
        const out=await s.app.save({...request(),expectedRevision:status===409?1:0});
        return wire(status,out);
      }
      return s.transport(path,opts);
    });
    await c.read();await c.save();assert.equal(c.current().canSave,false);assert.equal(c.current().persisted,status===503?null:false);
    await c.read();assert.equal(c.current().canSave,true);
  }
});

test('busy operation blocks overlapping read save clear and load without queueing',async()=>{
  const s=session();let release;const held=new Promise(resolve=>{release=resolve;});let hold=false;
  const c=client(async(path,opts)=>{const raw=await s.transport(path,opts);if(hold)await held;return raw;});await c.read();hold=true;
  const pending=c.save();assert.equal(c.current().busy,true);await c.read();await c.save();
  assert.equal(c.clearDraft().ok,false);assert.equal(c.loadRead().ok,false);assert.equal(c.replaceDraft(JSON.stringify(empty())).ok,false);
  assert.equal(s.requests.length,2);release();await pending;assert.equal(c.current().busy,false);
});

test('server current read in a shared session does not authorize this client to save',async()=>{
  const s=session(request());await s.app.readCurrent();const c=client(s.transport);await c.initialize();
  assert.equal(c.current().verifiedRead,null);assert.equal(c.current().canSave,false);await c.read();assert.equal(c.current().verifiedRead.revision,1);
});

test('malformed primitive wire response invalidates freshness without echoing unsafe details',async()=>{
  const s=session();let broken=false;const c=client(async(path,opts)=>broken?'private <svg onload=bad>':s.transport(path,opts));
  await c.read();broken=true;await c.read();assert.equal(c.current().state,'read_unknown');assert.equal(c.current().canSave,false);
  assert.equal(c.current().verifiedRead.revision,0);assert.equal(JSON.stringify(c.current()).includes('<svg'),false);
});

test('untrusted object getter proxy revoked and callback response objects execute no hooks',async()=>{
  let hooks=0;const getter={};Object.defineProperty(getter,'status',{get(){hooks++;return 200;}});
  const proxy=new Proxy({}, {get(){hooks++;},ownKeys(){hooks++;return [];}});const revoked=Proxy.revocable({},{});revoked.revoke();
  for(const value of [getter,proxy,revoked.proxy,()=>{hooks++;}]) {const c=client(()=>value);await c.read();assert.equal(c.current().state,'read_unknown');}
  const c=client(()=>wire(200,session().app.current()));
  for(const value of [getter,proxy,revoked.proxy,()=>{hooks++;}])assert.equal(c.replaceDraft(value).ok,false);
  assert.equal(hooks,0);
});

test('duplicate escaped keys deep JSON unknown fields and oversized wire fail closed',async()=>{
  const s=session(),base=s.app.current();
  const bodies=[JSON.stringify({...base,approved:true}),'{"schemaVersion":"x","schema\\u0056ersion":"y"}',
    '['.repeat(25)+'0'+']'.repeat(25),'"'+'x'.repeat(524289)+'"'];
  for(const body of bodies){const c=client(()=>JSON.stringify({status:200,body}));await c.initialize();assert.equal(c.current().canSave,false);assert.equal(c.current().errorCode,'response_invalid');}
});

test('fully rehashed foreign scope and changed policy or analytical flags are rejected',async()=>{
  const s=session(request());const out=await s.app.readCurrent();
  const foreign=session();const other=clone(out);other.view.readProjection.scope.schoolId='demo-school-b';other.view.readProjection.scopeSha256=sha('scope',other.view.readProjection.scope);
  const changes=[other,clone(out),clone(out),clone(out)];
  changes[1].view.readProjection.governanceBinding.limits.textMaxUnits=100000;
  changes[2].view.productionReady=true;changes[3].view.learningAnalyticsMapped=true;
  for(const value of changes){const c=client(()=>wire(200,value));await c.read();assert.equal(c.current().verifiedRead,null);assert.equal(c.current().canSave,false);}
  assert.equal(foreign.calls.length,0);
});

test('body receipt request counts and prior revision tampering cannot become a verified read',async()=>{
  const s=session(request()),base=await s.app.readCurrent();
  for(const mutate of [o=>{o.view.readProjection.body.text='tampered';},o=>{o.view.readProjection.receipt.requestSha256='f'.repeat(64);},
    o=>{o.view.usageCounts.textUtf16Units=0;},o=>{o.view.readProjection.body.strokes[0].points[0].x=0.12345;},o=>{o.view.readProjection.revision=0;}]) {
    const out=clone(base);mutate(out);const c=client(()=>wire(200,out));await c.read();assert.equal(c.current().verifiedRead,null);assert.equal(c.current().canSave,false);
  }
});

test('save confirmation must bind this request and cannot project an invented readback body',async()=>{
  const s=session();let corrupt=false;const c=client(async(path,opts)=>{
    const raw=await s.transport(path,opts);if(path.endsWith('/save')&&corrupt){const env=JSON.parse(raw),out=JSON.parse(env.body);out.receipt.mutationId='other';return wire(200,out);}return raw;
  });await c.read();corrupt=true;await c.save();assert.equal(c.current().state,'save_unknown');assert.equal(c.current().persisted,null);assert.equal(c.current().receipt,null);
  assert.equal(c.current().verifiedRead.body,null);assert.equal(s.requests.length,2);
});

test('draft limits reject NUL surrogate oversized notes precision and target spoofing without rounding',()=>{
  const c=client(()=>''),valid=request().body;assert.equal(c.replaceDraft(JSON.stringify(valid)).ok,true);const original=c.current().draft;
  const candidates=[{...empty(),text:'\ud800'},{...empty(),text:'\0'},{...empty(),text:'x'.repeat(4001)},
    {...empty(),notes:[{id:'n',text:'x',grade:5,format:'plain_text'}]}, {...empty(),bookmarks:{questions:['question-b-001'],topics:[]}},
    {...empty(),strokes:Array.from({length:65},(_,i)=>({id:`s-${i}`,color:'#1c3532',width:4,points:[{x:0,y:0}]}))}];
  const precision=clone(valid);precision.strokes[0].points[0].x=0.12345;candidates.push(precision);
  const extra=clone(valid);extra.authorized=true;candidates.push(extra);
  for(const body of candidates)assert.equal(c.replaceDraft(JSON.stringify(body)).ok,false);
  assert.equal(c.current().draft,original);assert.equal(c.current().draft.strokes[0].points[0].x,0.125);
});

test('new pointer stroke profiling is explicit while invalid existing coordinate is never silently rounded',()=>{
  assert.equal(typeof api.profileSyntheticNotebookPointer,'function');assert.deepEqual(api.profileSyntheticNotebookPointer(0.123456,0.987654),{x:0.1235,y:0.9877});
  for(const args of [[-1,0],[1.1,0],[NaN,0],[0,Infinity],['0.1',0]])assert.throws(()=>api.profileSyntheticNotebookPointer(...args),/invalid_pointer/u);
  assert.throws(()=>api.profileSyntheticNotebookPointer(0,0,true),/invalid_pointer/u);
});

test('borrowed serialized proxy receivers and extra endpoint arguments cannot operate another desk',async()=>{
  const s=session(),c=client(s.transport);let hooks=0;const p=new Proxy(c,{get(){hooks++;}}),revoked=Proxy.revocable({},{});revoked.revoke();
  for(const receiver of [{},clone(c.current()),p,revoked.proxy]) {
    assert.throws(()=>c.current.call(receiver),/untrusted_desk/u);assert.throws(()=>c.replaceDraft.call(receiver,'{}'),/untrusted_desk/u);
    await assert.rejects(c.read.call(receiver),/untrusted_desk/u);
  }
  assert.throws(()=>c.current(true),/invalid_desk_arguments/u);await assert.rejects(c.read('/other'),/invalid_desk_arguments/u);
  assert.throws(()=>api.createSyntheticNotebookDeskClient(s.transport,{}),/invalid_desk_request/u);assert.equal(s.requests.length,0);assert.equal(hooks,0);
});

test('full server read values stay immutable and do not imply database authentication mastery or readiness',async()=>{
  const s=session(request()),c=client(s.transport);await c.read();const v=c.current();
  assert.equal(v.syntheticOnly,true);assert.equal(v.authentication,'not_implemented');assert.equal(v.realDatabaseVerified,false);
  assert.equal(v.learningAnalyticsMapped,false);assert.equal(v.productionReady,false);assert.equal(v.automaticRead,false);assert.equal(v.automaticRetry,false);
  assert.equal(Object.isFrozen(v.verifiedRead.body.notes[0]),true);assert.throws(()=>{v.verifiedRead.body.text='changed';},TypeError);
});

// This boundary double substitutes only native DOM/HTTP; the complete emitted
// module is executed, with real application responses. Native browser QA is separate.
class Element {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.textContent='';this.value='';this.disabled=false;this.hidden=false;this.children=[];this.listeners={};this.width=800;this.height=260;this.dataset={};this.paint=[];}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);} append(...nodes){this.children.push(...nodes);} replaceChildren(...nodes){this.children=nodes;}
  setAttribute(key,value){this[key]=String(value);} focus(){} setPointerCapture(){} releasePointerCapture(){} getBoundingClientRect(){return {left:0,top:0,width:800,height:260};}
  getContext(){const paint=this.paint;return {clearRect(...v){paint.push(['clear',...v]);},beginPath(){paint.push(['begin']);},moveTo(...v){paint.push(['move',...v]);},lineTo(...v){paint.push(['line',...v]);},stroke(){paint.push(['stroke']);},arc(...v){paint.push(['arc',...v]);},fill(){paint.push(['fill']);}};}
  get innerHTML(){throw new Error('innerHTML forbidden');}set innerHTML(_){throw new Error('innerHTML forbidden');}
  async fire(name,event={}){if(this.disabled&&name==='click')return;for(const fn of this.listeners[name]??[])await fn(event);}
}
async function dom(s,fetchOverride) {
  const html=await readFile(new URL('../packages/student/notebook_desk.html',import.meta.url),'utf8');
  const elements=new Map([...html.matchAll(/<([a-z][a-z0-9-]*)[^>]*\bid="([^"]+)"[^>]*>/gu)].map(m=>[m[2],new Element(m[1])]));
  const doc={getElementById(id){assert.ok(elements.has(id),`missing HTML id ${id}`);return elements.get(id);},createElement(tag){return new Element(tag);},readyState:'complete'};
  let src=await readFile(new URL('../packages/student/notebook_desk.mjs',import.meta.url),'utf8');src=src.replace(/^export /gmu,'');
  const calls=[];const fetch=fetchOverride??(async(path,options)=>{calls.push({path,options});const envelope=JSON.parse(await s.transport(path,options));return {status:envelope.status,headers:{get(){return 'application/json; charset=utf-8';}},text:async()=>envelope.body};});
  const context=vm.createContext({document:doc,fetch,crypto:webcrypto,TextEncoder,TextDecoder,AbortController,setTimeout,clearTimeout,console});
  new vm.Script(src,{filename:'actual-notebook-desk.mjs'}).runInContext(context);await new Promise(r=>setTimeout(r,10));return {elements,calls};
}

test('emitted browser client reads only manually keeps draft separate and renders unsafe text literally',async()=>{
  const s=session(request()),ui=await dom(s),e=id=>ui.elements.get(id);assert.equal(s.calls.length,0);assert.equal(e('save-notebook').disabled,true);
  e('draft-text').value='Taslak <script>literal</script>';await e('draft-text').fire('input');await e('read-notebook').fire('click');
  assert.equal(e('draft-text').value,'Taslak <script>literal</script>');assert.equal(e('read-text').textContent,request().body.text);
  assert.equal(e('save-notebook').disabled,false);await e('load-read').fire('click');assert.equal(e('draft-text').value,request().body.text);
  assert.equal(e('read-notes').children[0].textContent,"<img src=x onerror=alert('literal')>");
});

test('emitted browser save lost reply never retries and enables only explicit read recovery',async()=>{
  const s=session();let lose=false;const paths=[];
  const ui=await dom(s,async(path,options)=>{paths.push(path);const raw=JSON.parse(await s.transport(path,options));if(lose&&path.endsWith('/save'))throw new Error('<script>secret</script>');return {status:raw.status,headers:{get(){return 'application/json';}},text:async()=>raw.body};});
  const e=id=>ui.elements.get(id);await e('read-notebook').fire('click');e('draft-text').value='Keep my draft';await e('draft-text').fire('input');lose=true;await e('save-notebook').fire('click');
  assert.equal(e('save-notebook').disabled,true);assert.equal(e('read-notebook').disabled,false);assert.equal(e('draft-text').value,'Keep my draft');
  assert.deepEqual(paths,['/api/notebook/current','/api/notebook/read','/api/notebook/save']);assert.equal(e('desk-status').textContent.includes('secret'),false);
  await e('save-notebook').fire('click');assert.equal(paths.length,3);await e('read-notebook').fire('click');assert.equal(e('save-notebook').disabled,false);
});

test('new pointer stroke overflow rejects the entire capture instead of silently truncating it',async()=>{
  const s=session(),ui=await dom(s),e=id=>ui.elements.get(id);e('pen-color').value='#1c3532';e('pen-width').value='4';
  const canvas=e('pen-canvas');await canvas.fire('pointerdown',{button:0,pointerId:1,clientX:0,clientY:0});
  for(let i=0;i<512;i++)await canvas.fire('pointermove',{pointerId:1,clientX:i,clientY:100});
  await canvas.fire('pointerup',{pointerId:1});assert.equal(e('draft-counts').textContent.includes('0/64 çizgi'),true);
  assert.match(e('pen-error').textContent,/sınır|reddedildi/u);
});

test('new four-decimal pointer stroke reaches closed save DTO without rounding loaded strokes',async()=>{
  const s=session(),ui=await dom(s),e=id=>ui.elements.get(id);e('pen-color').value='#1c3532';e('pen-width').value='4';
  await e('read-notebook').fire('click');const canvas=e('pen-canvas');await canvas.fire('pointerdown',{button:0,pointerId:2,clientX:98.7648,clientY:0.026});
  await canvas.fire('pointermove',{pointerId:2,clientX:800,clientY:260});await canvas.fire('pointerup',{pointerId:2});await e('save-notebook').fire('click');
  const dto=JSON.parse(s.requests.at(-1).options.body);assert.deepEqual(dto.body.strokes[0].points,[{x:0.1235,y:0.0001},{x:1,y:1}]);assert.equal(dto.body.strokes[0].width,4);
});

test('client composed with actual desk HTTP assets read save and manual reread stays current-only',async t=>{
  const s=session(),server=createSyntheticNotebookDeskServer({sourceFixture:s.source,execute:s.execute});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
  const port=server.address().port,origin=`http://127.0.0.1:${port}`,paths=[];
  const transport=(path,options)=>new Promise((resolve,reject)=>{paths.push(path);const headers={...options.headers,...(options.method==='POST'?{Origin:origin}:{})};
    const req=httpRequest({hostname:'127.0.0.1',port,path,method:options.method,headers},res=>{let body='';res.on('data',part=>{body+=part;});res.on('end',()=>resolve(JSON.stringify({status:res.statusCode,body})));});req.on('error',reject);req.end(options.body);});
  const c=client(transport);await c.initialize();assert.equal(s.calls.length,0);await c.read();c.replaceDraft(JSON.stringify({...empty(),text:'Gerçek yerel HTTP; sentetik veri'}));await c.save();
  assert.equal(c.current().canSave,false);assert.equal(c.current().verifiedRead.body,null);await c.read();assert.equal(c.current().verifiedRead.body.text,'Gerçek yerel HTTP; sentetik veri');
  assert.deepEqual(paths,['/api/notebook/current','/api/notebook/read','/api/notebook/save','/api/notebook/read']);assert.equal(s.calls.length,3);
});

test('emitted browser pending read blocks all mutations and preserves the edited draft on delayed response',async()=>{
  const s=session(request());let release,hold=false,started;const pending=new Promise(resolve=>{release=resolve;}),entered=new Promise(resolve=>{started=resolve;});let postCount=0;
  const ui=await dom(s,async(path,options)=>{if(options.method==='POST')postCount++;const raw=JSON.parse(await s.transport(path,options));if(hold&&path.endsWith('/read')){started();await pending;}return {status:raw.status,headers:{get(){return 'application/json';}},text:async()=>raw.body};});
  const e=id=>ui.elements.get(id);e('draft-text').value='Held local text';await e('draft-text').fire('input');hold=true;
  const action=e('read-notebook').fire('click');await entered;assert.equal(e('read-notebook').disabled,true);assert.equal(e('save-notebook').disabled,true);assert.equal(e('clear-draft').disabled,true);
  for(const listener of e('save-notebook').listeners.click)await listener();for(const listener of e('clear-draft').listeners.click)await listener();
  assert.equal(postCount,1);release();await action;assert.equal(e('draft-text').value,'Held local text');assert.equal(e('save-notebook').disabled,false);
});

test('draft UTF8 body byte budget cannot be bypassed with many individually valid long notes',()=>{
  const c=client(()=>''),body=empty();body.notes=Array.from({length:12},(_,i)=>({id:`note-${i}`,text:'漢'.repeat(4000),grade:6,format:'plain_text'}));
  assert.equal(c.replaceDraft(JSON.stringify(body)).ok,false);assert.deepEqual(c.current().draft,empty());
  const valid=empty();valid.text='📝'.repeat(2000);assert.equal(c.replaceDraft(JSON.stringify(valid)).ok,true);assert.equal(c.current().draft.text.length,4000);
});

test('an old fully valid read cannot unlock saving after a newer confirmed receipt was observed',async()=>{
  const s=session();let stale=false,old;const c=client(async(path,options)=>{if(stale&&path.endsWith('/read'))return old;const out=await s.transport(path,options);if(path.endsWith('/read'))old=out;return out;});
  await c.read();await c.save();stale=true;await c.read();assert.equal(c.current().canSave,false);assert.equal(c.current().state,'read_unknown');assert.equal(c.current().verifiedRead.revision,0);
});

test('read result with incompatible outcome or preparation labels cannot grant a fresh revision',async()=>{
  const s=session(),base=JSON.parse(JSON.parse(await s.transport('/api/notebook/read',{body:'{}'})).body);
  for(const mutate of [o=>{o.preparationDecision='prepare_replace';o.view.lastOperation.preparationDecision='prepare_replace';},
    o=>{o.outcome='accepted';o.view.lastOperation.outcome='accepted';}]) {
    const out=clone(base);mutate(out);const c=client(()=>wire(200,out));await c.read();assert.equal(c.current().canSave,false);
  }
});

test('emitted browser entropy failure releases the operation gate without sending a write',async()=>{
  const s=session(),ui=await dom(s),e=id=>ui.elements.get(id);await e('read-notebook').fire('click');
  const original=webcrypto.randomUUID;webcrypto.randomUUID=()=>{throw new Error('unavailable');};
  try {await e('save-notebook').fire('click');assert.equal(e('read-notebook').disabled,false);assert.equal(e('save-notebook').disabled,true);assert.equal(s.requests.length,2);}
  finally {webcrypto.randomUUID=original;}
});

test('browser streaming read rejects BOM and malformed UTF8 before granting save freshness',async()=>{
  for(const malformed of ['bom','utf8']) {
    const s=session(),ui=await dom(s,async(path,options)=>{
      const env=JSON.parse(await s.transport(path,options));let data=Buffer.from(env.body,'utf8');
      if(path.endsWith('/read'))data=malformed==='bom'?Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),data]):Buffer.concat([data.subarray(0,10),Buffer.from([0xff]),data.subarray(10)]);
      return new Response(data,{status:env.status,headers:{'Content-Type':'application/json; charset=utf-8'}});
    });
    await ui.elements.get('read-notebook').fire('click');assert.equal(ui.elements.get('save-notebook').disabled,true);assert.equal(ui.elements.get('read-text').textContent,'Henüz okuma yapılmadı.');
  }
});

test('pending pointer ink paints immediately but cancelled ink never changes draft or sends a save',async()=>{
  const s=session(),ui=await dom(s),e=id=>ui.elements.get(id);e('pen-color').value='#1c3532';e('pen-width').value='4';const canvas=e('pen-canvas');
  const before=canvas.paint.length;await canvas.fire('pointerdown',{button:0,pointerId:9,clientX:80,clientY:26});await canvas.fire('pointermove',{pointerId:9,clientX:160,clientY:52});
  assert.equal(canvas.paint.slice(before).some(p=>p[0]==='stroke'),true);assert.equal(e('draft-counts').textContent.includes('0/64 çizgi'),true);
  assert.equal(s.requests.length,1);await canvas.fire('pointercancel',{pointerId:9});
  assert.equal(canvas.paint.at(-1)[0],'clear');assert.equal(e('draft-counts').textContent.includes('0/64 çizgi'),true);assert.equal(s.requests.length,1);
});

test('desk bookmark toggles change only permitted local targets without fetching or writing',()=>{
  const s=session(),c=client(s.transport);
  assert.equal(typeof c.toggleBookmark,'function','local bookmark action missing');
  c.replaceDraft(JSON.stringify({...empty(),text:'Notumu koru'}));
  assert.equal(c.toggleBookmark('question','question-a-001').ok,true);
  assert.equal(c.toggleBookmark('topic','topic-a-001').ok,true);
  assert.deepEqual(c.current().draft.bookmarks,{questions:['question-a-001'],topics:['topic-a-001']});
  assert.equal(c.current().draft.text,'Notumu koru');assert.equal(c.current().canSave,false);
  assert.equal(c.toggleBookmark('question','question-a-001').ok,true);
  assert.deepEqual(c.current().draft.bookmarks,{questions:[],topics:['topic-a-001']});
  assert.equal(s.requests.length,0);assert.equal(s.calls.length,0);
});

test('unknown foreign and malformed bookmark actions preserve the last local draft without transport',()=>{
  const s=session(),c=client(s.transport);
  assert.equal(typeof c.toggleBookmark,'function','local bookmark action missing');
  c.toggleBookmark('question','question-a-001');const before=c.current().draft;
  for(const [kind,id] of [['question','question-b-001'],['topic','topic-b-001'],['lesson','topic-a-001'],
    ['question','topic-a-001'],['topic','question-a-001'],['question','unknown'],[{},'question-a-001'],['question',null]]) {
    assert.equal(c.toggleBookmark(kind,id).ok,false);assert.equal(c.current().draft,before);
  }
  assert.throws(()=>c.toggleBookmark('question','question-a-001',true),/invalid_desk_arguments/u);
  assert.throws(()=>c.toggleBookmark.call({},'question','question-a-001'),/untrusted_desk/u);
  assert.equal(s.requests.length,0);
});

test('a pending explicit read locks bookmark editing without queueing or changing the local draft',async()=>{
  const s=session();let release;const held=new Promise(resolve=>{release=resolve;});
  const c=client(async(path,opts)=>{const result=await s.transport(path,opts);await held;return result;});
  assert.equal(typeof c.toggleBookmark,'function','local bookmark action missing');
  c.toggleBookmark('topic','topic-a-001');const before=c.current().draft;
  const pending=c.read();assert.equal(c.current().busy,true);
  assert.equal(c.toggleBookmark('question','question-a-001').ok,false);assert.equal(c.current().draft,before);
  release();await pending;assert.deepEqual(c.current().draft.bookmarks,{questions:[],topics:['topic-a-001']});
  assert.equal(s.requests.length,1);
});

test('adding a bookmark cannot exceed the existing whole-body UTF8 budget or change a full draft',()=>{
  const s=session(),c=client(s.transport);
  const body={...empty(),text:'界'.repeat(3300)+'x'.repeat(533),
    notes:Array.from({length:10},(_,i)=>({id:`n-${i}`,text:'界'.repeat(4000),grade:6,format:'plain_text'}))};
  assert.equal(Buffer.byteLength(JSON.stringify(body)),131072);
  assert.equal(c.replaceDraft(JSON.stringify(body)).ok,true);const before=c.current().draft;
  assert.equal(c.toggleBookmark('question','question-a-001').ok,false);
  assert.equal(c.current().draft,before);assert.deepEqual(c.current().draft.bookmarks,{questions:[],topics:[]});
  assert.equal(s.requests.length,0);
});

test('emitted desk bookmarks survive explicit save and read while local and read lists stay separate',async()=>{
  const s=session(),ui=await dom(s),e=id=>ui.elements.get(id);
  assert.ok(e('bookmark-question'),'question bookmark UI missing');assert.ok(e('bookmark-topic'),'topic bookmark UI missing');
  await e('bookmark-question').fire('click');await e('bookmark-topic').fire('click');
  assert.equal(e('bookmark-question')['aria-pressed'],'true');assert.equal(e('bookmark-topic')['aria-pressed'],'true');
  assert.equal(e('draft-question-bookmarks').children.length,1);assert.equal(e('draft-topic-bookmarks').children.length,1);
  assert.equal(e('read-question-bookmarks').children.length,0);assert.equal(s.requests.length,1);
  assert.equal(e('save-notebook').disabled,true);
  await e('read-notebook').fire('click');await e('save-notebook').fire('click');
  assert.deepEqual(s.head.body.bookmarks,{questions:['question-a-001'],topics:['topic-a-001']});
  assert.equal(e('read-question-bookmarks').children.length,0);assert.equal(e('save-notebook').disabled,true);
  await e('read-notebook').fire('click');
  assert.match(e('read-question-bookmarks').children[0].textContent,/question-a-001/u);
  assert.match(e('read-topic-bookmarks').children[0].textContent,/topic-a-001/u);
  await e('bookmark-question').fire('click');assert.equal(e('bookmark-question')['aria-pressed'],'false');
  assert.equal(e('draft-question-bookmarks').children.length,0);assert.equal(e('read-question-bookmarks').children.length,1);
  await e('save-notebook').fire('click');await e('read-notebook').fire('click');
  assert.equal(e('read-question-bookmarks').children.length,0);assert.equal(e('read-topic-bookmarks').children.length,1);
  assert.deepEqual(s.requests.map(r=>r.path),['/api/notebook/current','/api/notebook/read','/api/notebook/save',
    '/api/notebook/read','/api/notebook/save','/api/notebook/read']);
});

test('reading bookmarked records never selects the local draft until explicit load',async()=>{
  const s=session(request()),ui=await dom(s),e=id=>ui.elements.get(id);
  assert.ok(e('bookmark-question'),'question bookmark UI missing');
  await e('read-notebook').fire('click');
  assert.equal(e('read-question-bookmarks').children.length,1);assert.equal(e('read-topic-bookmarks').children.length,1);
  assert.equal(e('draft-question-bookmarks').children.length,0);assert.equal(e('bookmark-question')['aria-pressed'],'false');
  await e('load-read').fire('click');
  assert.equal(e('draft-question-bookmarks').children.length,1);assert.equal(e('draft-topic-bookmarks').children.length,1);
  assert.equal(e('bookmark-question')['aria-pressed'],'true');assert.equal(e('bookmark-topic')['aria-pressed'],'true');
  assert.equal(s.requests.length,2);
});

test('lost bookmark save reply does not invent a read list or retry before explicit recovery',async()=>{
  const s=session();let lose=false;const paths=[];
  const ui=await dom(s,async(path,options)=>{paths.push(path);const raw=JSON.parse(await s.transport(path,options));
    if(lose&&path.endsWith('/save'))throw new Error('private reply failure');
    return {status:raw.status,headers:{get(){return 'application/json';}},text:async()=>raw.body};});
  const e=id=>ui.elements.get(id);assert.ok(e('bookmark-question'),'question bookmark UI missing');
  await e('read-notebook').fire('click');await e('bookmark-question').fire('click');lose=true;
  await e('save-notebook').fire('click');
  assert.deepEqual(s.head.body.bookmarks,{questions:['question-a-001'],topics:[]});
  assert.equal(e('draft-question-bookmarks').children.length,1);assert.equal(e('read-question-bookmarks').children.length,0);
  assert.equal(e('save-notebook').disabled,true);await e('save-notebook').fire('click');
  assert.deepEqual(paths,['/api/notebook/current','/api/notebook/read','/api/notebook/save']);
  await e('read-notebook').fire('click');assert.equal(e('read-question-bookmarks').children.length,1);
  assert.equal(e('save-notebook').disabled,false);assert.equal(paths.length,4);
});
