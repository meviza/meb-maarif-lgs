import assert from 'node:assert/strict';
import test from 'node:test';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
import { createSyntheticNotebookFixture as fixture, createSyntheticNotebookRequest as request,
  createSyntheticNotebookReceipt as receipt, hashSyntheticNotebook as sha } from './support/synthetic_notebook_fixture.mjs';
const api=await import('../packages/contracts/synthetic_notebook_application.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const copy=value=>JSON.parse(JSON.stringify(value));
const SQL={commit:'SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result',current:'SELECT student_notebook.read_current($1::text) AS notebook_result'};
function application(execute,sourceFixture=fixture()) {
  assert.equal(typeof api.createSyntheticNotebookApplication,'function','guarded synthetic notebook application missing');
  return api.createSyntheticNotebookApplication({sourceFixture,execute});
}
const row=value=>({rowCount:1,rows:[{notebook_result:value}]});
function read(s,req=null) {
  const r=req?receipt(s,req):null,binding=createSyntheticNotebookSyncPreparer(s).prepare(request(s.scope.schoolId.endsWith('-b')?'b':'a')).intent.governanceBinding;
  return {scope:copy(s.scope),scopeSha256:sha('scope',s.scope),revision:r?.resultingRevision??0,body:req?copy(req.body):null,
    bodySha256:r?.bodySha256??null,receipt:r,governanceBinding:copy(binding),syntheticOnly:true,productionReady:false};
}
function write(s,req,outcome='accepted',head=null) {
  const r=receipt(s,req);return {outcome,receipt:r,head:head??{revision:r.resultingRevision,bodySha256:r.bodySha256},syntheticOnly:true,productionReady:false};
}
function next(n,text='Next body') {const r=request();r.expectedRevision=n-1;r.mutationId=`mutation-app-${n}`;r.idempotencyKey=`idem-app-${n}`;r.body.text=text;return r;}
function pending() {let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};}
const flags=value=>{assert.equal(value.syntheticOnly,true);assert.equal(value.authentication,'not_implemented');assert.equal(value.automaticRead,false);
  assert.equal(value.automaticRetry,false);assert.equal(value.learnerReady,false);assert.equal(value.productionReady,false);};
function rejected(value,code) {assert.equal(value.valid,false);assert.equal(value.error.code,code);flags(value);}

// If the application starts presenting a source fixture or hook as a live
// read or production connection, this consumer-visible initial state fails.
test('application begins unread and does not infer database or authentication evidence from a function hook',()=>{
  let calls=0;const app=application(()=>{calls++;});assert.equal(Object.isFrozen(app),true);
  assert.deepEqual(Object.keys(app),['current','readCurrent','save']);const view=app.current();
  assert.equal(view.state,'not_read');assert.equal(view.busy,false);assert.equal(view.readProjection,null);assert.equal(view.usageCounts,null);
  assert.equal(view.lastOperation,null);assert.equal(view.currentHeadVerified,false);assert.equal(view.executorProvenance,'trusted_server_hook_unverified');
  assert.equal(view.realDatabaseVerified,false);assert.equal(view.completeHistory,false);assert.equal(view.learningAnalyticsMapped,false);
  assert.equal(view.purpose,'student_notebook');assert.equal(view.classification,'sensitive_student_notebook');flags(view);assert.equal(calls,0);
});

test('unsafe factory options cannot supply a caller role source approval or execute getter',()=>{
  assert.equal(typeof api.createSyntheticNotebookApplication,'function');let hooks=0;const good={sourceFixture:fixture(),execute(){hooks++;}};
  const getter={sourceFixture:fixture()};Object.defineProperty(getter,'execute',{enumerable:true,get(){hooks++;return good.execute;}});
  const revoked=Proxy.revocable({},{});revoked.revoke();
  for(const options of [null,{},getter,revoked.proxy,new Proxy(good,{ownKeys(){hooks++;return[];}}),{...good,dbRole:'postgres'},
    {...good,databaseConnected:true},{...good,sourceFixture:{...fixture(),authorized:true}},
    {...good,execute:new Proxy(()=>{}, {apply(){hooks++;}})}])assert.throws(()=>api.createSyntheticNotebookApplication(options),/invalid_synthetic_notebook_application_options/u);
  assert.throws(()=>api.createSyntheticNotebookApplication(good,true),/invalid_synthetic_notebook_application_options/u);assert.equal(hooks,0);
});

test('explicit verified current read projects only scoped readback and operational notebook counts',async()=>{
  const s=fixture(),req=request();req.body.text='Not 📝';const calls=[];
  const app=application(q=>{calls.push(q);return row(read(s,req));});const out=await app.readCurrent();assert.equal(out.valid,true);
  assert.equal(out.decision,'current_read_confirmed');assert.equal(out.commitState,'not_attempted');assert.equal(out.readState,'confirmed');
  const view=out.view;assert.equal(view.state,'verified_current');assert.equal(view.projectionFreshness,'verified_current');assert.equal(view.currentHeadVerified,true);
  assert.deepEqual(view.readProjection.body,req.body);assert.equal(view.readProjection.revision,1);assert.deepEqual(view.readProjection.receipt,receipt(s,req));
  assert.deepEqual(view.usageCounts,{textUtf16Units:6,strokeCount:1,pointCount:2,questionBookmarkCount:1,topicBookmarkCount:1,noteCount:1,concernCount:1,
    bodyJsonUtf8Bytes:Buffer.byteLength(JSON.stringify(req.body),'utf8')});
  assert.equal(view.usageCountMeaning,'operational_notebook_counts_not_learning_evidence');assert.equal(view.realDatabaseVerified,false);
  assert.deepEqual(calls,[{text:SQL.current,values:[sha('scope',s.scope)]}]);assert.equal(Object.isFrozen(view.readProjection.body.strokes[0].points[0]),true);
  assert.equal(Object.isFrozen(out),true);assert.equal(Object.isFrozen(view),true);assert.equal(Object.isFrozen(view.usageCounts),true);
  assert.deepEqual(app.current(),view);rejected(await app.save(copy(view)),'notebook_request_invalid');assert.equal(calls.length,1);
});

test('verified empty revision zero reports no invented body or usage content',async()=>{
  const s=fixture(),app=application(()=>row(read(s)));const out=await app.readCurrent();assert.equal(out.valid,true);
  assert.equal(out.view.readProjection.revision,0);assert.equal(out.view.readProjection.body,null);assert.equal(out.view.readProjection.receipt,null);
  assert.deepEqual(Object.values(out.view.usageCounts),[0,0,0,0,0,0,0,0]);assert.equal(out.view.state,'verified_current');
});

test('confirmed save never replaces last explicit read with request or receipt and never performs an automatic read',async()=>{
  const s=fixture(),first=request(),second=next(2,'New request must not become a read');const calls=[];
  const app=application(q=>{calls.push(q);return row(q.text===SQL.current?read(s,first):write(s,second));});
  const prior=(await app.readCurrent()).view.readProjection,priorCounts=app.current().usageCounts;
  const out=await app.save(second);assert.equal(out.valid,true);assert.equal(out.decision,'save_confirmed');assert.equal(out.commitState,'confirmed');
  assert.equal(out.persisted,true);assert.equal(out.persistenceConfirmed,true);assert.deepEqual(out.receipt,receipt(s,second));assert.equal(out.head.revision,2);
  assert.equal(out.view.state,'read_stale_after_write');assert.equal(out.view.projectionFreshness,'stale_after_write');assert.equal(out.view.currentHeadVerified,false);
  assert.equal(out.view.readProjection,prior);assert.equal(out.view.usageCounts,priorCounts);assert.equal(out.view.readProjection.body.text,first.body.text);
  assert.deepEqual(calls.map(q=>q.text),[SQL.current,SQL.commit]);assert.equal(out.view.busy,false);assert.equal(app.current().lastOperation.decision,'save_confirmed');
  const blocked=await app.save(next(3));rejected(blocked,'notebook_revision_conflict');assert.equal(blocked.decision,'request_rejected');assert.equal(calls.length,2);
  assert.equal(blocked.view.projectionFreshness,'stale_after_write');
});

test('save without any verified read returns a receipt but no request-derived read projection',async()=>{
  const s=fixture(),req=request(),app=application(()=>row(write(s,req)));const out=await app.save(req);
  assert.equal(out.valid,true);assert.equal(out.view.readProjection,null);assert.equal(out.view.usageCounts,null);
  assert.equal(out.view.state,'not_read');assert.equal(out.view.projectionFreshness,'not_read');assert.equal(out.view.currentHeadVerified,false);
  assert.equal(JSON.stringify(out).includes(req.body.text),false);assert.equal(Object.hasOwn(out,'command'),false);assert.equal(Object.hasOwn(out,'intent'),false);
});

test('unknown write preserves the old read as stale with persisted null and recovers only through explicit read',async()=>{
  const s=fixture(),first=request(),second=next(2,'Actually committed synthetic hook state');let head=first;const calls=[];
  const app=application(q=>{calls.push(q.text);if(q.text===SQL.current)return row(read(s,head));head=second;throw new Error('private token or notebook');});
  const before=(await app.readCurrent()).view.readProjection,out=await app.save(second);rejected(out,'notebook_execution_failed');
  assert.equal(out.decision,'save_unknown');assert.equal(out.commitState,'unknown');assert.equal(out.persisted,null);assert.equal(out.persistenceConfirmed,false);
  assert.equal(out.view.readProjection,before);assert.equal(out.view.state,'read_stale_after_write');assert.equal(out.view.busy,false);
  assert.deepEqual(calls,[SQL.current,SQL.commit]);assert.equal(JSON.stringify(out).includes('private token'),false);assert.equal(Object.hasOwn(out,'rolledBack'),false);
  const recovered=await app.readCurrent();assert.equal(recovered.valid,true);assert.equal(recovered.view.readProjection.revision,2);
  assert.equal(recovered.view.readProjection.body.text,second.body.text);assert.equal(recovered.view.projectionFreshness,'verified_current');
  assert.deepEqual(calls,[SQL.current,SQL.commit,SQL.current]);
});

test('malformed post-write response remains unknown without publishing request content as verified read',async()=>{
  const s=fixture(),first=request(),second=next(2,'Committed but response malformed');let head=first;
  const app=application(q=>{if(q.text===SQL.current)return row(read(s,head));head=second;const raw=write(s,second);raw.head.bodySha256='f'.repeat(64);return row(raw);});
  const old=(await app.readCurrent()).view.readProjection,out=await app.save(second);rejected(out,'notebook_response_invalid');
  assert.equal(out.commitState,'unknown');assert.equal(out.persisted,null);assert.equal(out.view.readProjection,old);assert.equal(out.view.state,'read_stale_after_write');
  assert.equal((await app.readCurrent()).view.readProjection.body.text,second.body.text);
});

test('preflight invalid requests and PostgreSQL profile failures preserve a verified read without executing a write',async()=>{
  const s=fixture(),first=request();let calls=0,hooks=0;const app=application(()=>{calls++;return row(read(s,first));});
  const initial=(await app.readCurrent()).view.readProjection;
  const getter=next(2);Object.defineProperty(getter.body,'text',{enumerable:true,get(){hooks++;return 'private';}});
  const fine=next(2);fine.body.strokes[0].points[0].x=0.12345;
  const revoked=Proxy.revocable({},{});revoked.revoke();
  for(const value of [{...next(2),role:'postgres'}, {...next(2),purpose:'learning_analytics'},copy(app.current()),getter,fine,revoked.proxy,
    new Proxy(next(2),{ownKeys(){hooks++;return [];}})]) {
    const out=await app.save(value);assert.equal(out.valid,false);assert.equal(out.decision,'request_rejected');assert.equal(out.commitState,'not_attempted');
    assert.equal(out.persisted,false);assert.equal(out.view.readProjection,initial);assert.equal(out.view.projectionFreshness,'verified_current');
  }
  assert.equal(calls,1);assert.equal(hooks,0);assert.equal(app.current().busy,false);
});

test('failed or cross-school current read retains only the prior scoped projection with unknown freshness',async()=>{
  const s=fixture(),first=request();let current=read(s,first);const app=application(()=>row(current));
  const prior=(await app.readCurrent()).view.readProjection;current=read(fixture('b'),request('b'));
  const out=await app.readCurrent();rejected(out,'notebook_response_invalid');assert.equal(out.readState,'unknown');assert.equal(out.persisted,null);
  assert.equal(out.view.readProjection,prior);assert.equal(out.view.state,'read_unknown');assert.equal(out.view.projectionFreshness,'unknown_after_read_failure');
  assert.equal(out.view.currentHeadVerified,false);assert.equal(JSON.stringify(out).includes('demo-school-b'),false);
});

test('failed first read remains explicitly unknown with no fabricated body and releases the operation gate',async()=>{
  let calls=0;const app=application(()=>{calls++;throw new Error('private credentials');});const out=await app.readCurrent();
  rejected(out,'notebook_execution_failed');assert.equal(out.view.state,'read_unknown');assert.equal(out.view.readProjection,null);assert.equal(out.view.usageCounts,null);
  assert.equal(out.persisted,null);assert.equal(out.view.busy,false);assert.equal(calls,1);assert.equal(JSON.stringify(out).includes('private credentials'),false);
});

test('a delayed save rejects overlapping save or read before execution without queueing or touching hostile request getters',async()=>{
  const s=fixture(),first=request(),second=next(2),wait=pending();let calls=0,hooks=0;
  const app=application(q=>{calls++;return q.text===SQL.current?row(read(s,first)):wait.promise;});
  const prior=(await app.readCurrent()).view.readProjection,save=app.save(second);assert.equal(app.current().busy,true);
  assert.equal(app.current().readProjection,prior);assert.equal(app.current().projectionFreshness,'stale_after_write');
  const hostile={};Object.defineProperty(hostile,'body',{get(){hooks++;return {};}});
  const overlap=await app.save(hostile),overlapRead=await app.readCurrent();rejected(overlap,'synthetic_notebook_application_busy');rejected(overlapRead,'synthetic_notebook_application_busy');
  assert.equal(overlap.decision,'application_busy');assert.equal(overlap.persisted,false);assert.equal(overlap.view.busy,true);assert.equal(calls,2);assert.equal(hooks,0);
  wait.resolve(row(write(s,second)));const done=await save;assert.equal(done.valid,true);assert.equal(done.view.busy,false);assert.equal(calls,2);
});

test('a delayed read rejects overlapping save and read without an automatic later write',async()=>{
  const s=fixture(),req=request(),wait=pending();let calls=0;const app=application(()=>{calls++;return wait.promise;});
  const operation=app.readCurrent();assert.equal(app.current().busy,true);
  rejected(await app.save(req),'synthetic_notebook_application_busy');rejected(await app.readCurrent(),'synthetic_notebook_application_busy');assert.equal(calls,1);
  wait.resolve(row(read(s,req)));const result=await operation;assert.equal(result.valid,true);assert.equal(result.view.readProjection.revision,1);
  assert.equal(result.view.busy,false);assert.equal(calls,1);
});

test('borrowed or proxy receivers and extra caller routing arguments cannot expose projections or execute',async()=>{
  const s=fixture(),req=request();let calls=0;const app=application(()=>{calls++;return row(read(s,req));});await app.readCurrent();
  const other=application(()=>{calls++;});const revoked=Proxy.revocable({},{});revoked.revoke();
  for(const receiver of [undefined,{},copy(app.current()),other,revoked.proxy,new Proxy(app,{})]) {
    assert.throws(()=>app.current.call(receiver),/untrusted_synthetic_notebook_application/u);
    const out=await app.save.call(receiver,req),readOut=await app.readCurrent.call(receiver);rejected(out,'untrusted_synthetic_notebook_application');
    rejected(readOut,'untrusted_synthetic_notebook_application');assert.equal(out.view,null);assert.equal(readOut.view,null);
  }
  assert.throws(()=>app.current({role:'postgres'}),/invalid_synthetic_notebook_application_arguments/u);
  rejected(await app.readCurrent({scope:'other'}),'invalid_synthetic_notebook_application_arguments');
  rejected(await app.save(req,{scope:'other'}),'invalid_synthetic_notebook_application_arguments');assert.equal(calls,1);
});

test('separate fixed-school applications never use a caller snapshot or target to switch scope',async()=>{
  const sa=fixture(),sb=fixture('b'),ra=request(),rb=request('b');let callsA=0,callsB=0;
  const a=application(()=>{callsA++;return row(read(sa,ra));},sa),b=application(()=>{callsB++;return row(read(sb,rb));},sb);
  await a.readCurrent();await b.readCurrent();rejected(await b.save(copy(a.current())),'notebook_request_invalid');
  assert.equal((await b.save(ra)).valid,false);assert.equal(callsA,1);assert.equal(callsB,1);
  assert.equal(a.current().readProjection.scope.schoolId,'demo-school-a');assert.equal(b.current().readProjection.scope.schoolId,'demo-school-b');
});

test('historical exact replay keeps the latest explicitly read body and makes it stale without rolling it back',async()=>{
  const s=fixture(),first=request(),second=next(2,'Current head two');s.receipts=[receipt(s,first),receipt(s,second)];s.currentRevision={revision:2,bodySha256:sha('body',second.body)};
  const calls=[];const app=application(q=>{calls.push(q.text);return row(q.text===SQL.current?read(s,second):write(s,first,'idempotent_replay',{revision:2,bodySha256:sha('body',second.body)}));},s);
  const prior=(await app.readCurrent()).view.readProjection,out=await app.save(first);assert.equal(out.valid,true);assert.equal(out.outcome,'idempotent_replay');
  assert.equal(out.preparationDecision,'prepare_exact_replay');assert.equal(out.view.readProjection,prior);assert.equal(out.view.readProjection.revision,2);
  assert.equal(out.view.readProjection.body.text,second.body.text);assert.equal(out.view.projectionFreshness,'stale_after_write');assert.deepEqual(calls,[SQL.current,SQL.commit]);
});

test('large allowed read and save outputs stay bounded inert and do not duplicate or expose submitted command bodies',async()=>{
  const s=fixture();s.policy.limits.maxBodyBytes=262144;s.policy.policySha256=sha('policy',Object.fromEntries(Object.entries(s.policy).filter(([k])=>k!=='policySha256')));
  const first=request();first.body.text='a'.repeat(4000);first.body.notes=Array.from({length:60},(_,n)=>({id:`note-${n}`,text:'b'.repeat(4000),grade:6,format:'plain_text'}));
  const second=next(2,'unread submission');const app=application(q=>row(q.text===SQL.current?read(s,first):write(s,second)),s);
  const observed=await app.readCurrent();assert.equal(observed.valid,true);assert.ok(Buffer.byteLength(JSON.stringify(observed),'utf8')<524288);
  const out=await app.save(second);assert.equal(out.valid,true);assert.ok(Buffer.byteLength(JSON.stringify(out),'utf8')<524288);
  assert.equal(JSON.stringify(out).includes('unread submission'),false);assert.equal(Object.hasOwn(out,'intent'),false);
  first.body.notes[0].text='external mutation';assert.equal(out.view.readProjection.body.notes[0].text,'b'.repeat(4000));
});

test('synchronous executor reentry sees the busy gate and cannot schedule a second write',async()=>{
  const s=fixture(),req=request();let app,calls=0,reentry;
  app=application(()=>{calls++;reentry=app.save(req);assert.equal(app.current().busy,true);return row(read(s,req));});
  const out=await app.readCurrent();assert.equal(out.valid,true);rejected(await reentry,'synthetic_notebook_application_busy');assert.equal(calls,1);
});
