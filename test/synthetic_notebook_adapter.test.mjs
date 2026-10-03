import assert from 'node:assert/strict';
import test from 'node:test';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
import { createSyntheticNotebookFixture as fixture, createSyntheticNotebookRequest as request,
  createSyntheticNotebookReceipt as receipt, hashSyntheticNotebook as sha } from './support/synthetic_notebook_fixture.mjs';
const api=await import('../packages/contracts/synthetic_notebook_adapter.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
const copy=value=>JSON.parse(JSON.stringify(value));
const without=(value,key)=>Object.fromEntries(Object.entries(value).filter(([k])=>k!==key));
function adapter(execute,sourceFixture=fixture()) {
  assert.equal(typeof api.createSyntheticNotebookAdapter,'function','server-owned notebook adapter missing');
  return api.createSyntheticNotebookAdapter({sourceFixture,execute});
}
function binding(source) {return createSyntheticNotebookSyncPreparer(source).prepare(request(source.scope.schoolId.endsWith('-b')?'b':'a')).intent.governanceBinding;}
function writeResult(source,req,outcome='accepted',head=null) {const r=receipt(source,req);return {outcome,receipt:r,head:head??{revision:r.resultingRevision,bodySha256:r.bodySha256},syntheticOnly:true,productionReady:false};}
function readResult(source,req=null) {
  const r=req?receipt(source,req):null;
  return {scope:copy(source.scope),scopeSha256:sha('scope',source.scope),revision:r?.resultingRevision??0,body:req?copy(req.body):null,
    bodySha256:r?.bodySha256??null,receipt:r,governanceBinding:copy(binding(source)),syntheticOnly:true,productionReady:false};
}
const row=result=>({rowCount:1,rows:[{notebook_result:result}]});
function rehashReceipt(r) {r.receiptSha256=sha('receipt',without(r,'receiptSha256'));return r;}
function noPersistence(result,state='not_attempted') {
  assert.equal(result.valid,false);assert.equal(result.commitState,state);assert.equal(result.persistenceConfirmed,false);
  assert.equal(result.persisted,state==='unknown'?null:false);assert.equal(result.automaticRetry,false);assert.equal(result.productionReady,false);
}

// Removing adapter branding or accepting caller query/role fields must fail.
test('prepared command is an immutable adapter-only capability and emits fixed parameter SQL with literal data values',async()=>{
  const source=fixture(),req=request();req.body.notes[0].text="x'); DROP TABLE private; --";const calls=[];
  const a=adapter(query=>{calls.push(query);return row(writeResult(source,req));},source),p=a.prepare(req);
  assert.equal(p.valid,true);assert.equal(p.decision,'prepare_replace');assert.equal(p.persisted,false);
  assert.equal(Object.isFrozen(p.command),true);assert.equal(Object.isFrozen(p.command.intent.body.strokes[0].points[0]),true);
  assert.equal(p.command.intent.intentSha256,sha('intent',without(p.command.intent,'intentSha256')));
  const out=await a.commit(p.command);assert.equal(out.valid,true);assert.equal(out.outcome,'accepted');assert.equal(out.commitState,'confirmed');
  assert.equal(out.persisted,true);assert.equal(out.persistenceConfirmed,true);assert.equal(out.currentHeadVerified,false);assert.equal(out.sourceAdvanced,false);
  assert.equal(calls.length,1);assert.deepEqual(Object.keys(calls[0]),['text','values']);
  assert.equal(calls[0].text,'SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result');
  assert.deepEqual(JSON.parse(calls[0].values[0]),copy(p.command.intent));assert.equal(calls[0].text.includes('DROP'),false);
  assert.equal(Object.isFrozen(calls[0]),true);assert.equal(Object.isFrozen(calls[0].values),true);
  assert.deepEqual(out.receipt,copy(receipt(source,req)));assert.equal(Object.isFrozen(out.receipt),true);
});

test('cloned rehashed forged revoked and another-adapter commands execute zero database hooks',async()=>{
  let calls=0,hooks=0;const a=adapter(()=>{calls++;return {};});const p=a.prepare(request()),other=adapter(()=>{calls++;return {};});
  const revoked=Proxy.revocable({},{});revoked.revoke();const getter={};Object.defineProperty(getter,'intent',{get(){hooks++;return p.command.intent;}});
  for(const value of [copy(p.command),structuredClone(p.command),{...p.command,trusted:true},null,getter,revoked.proxy,
    new Proxy(p.command,{get(){hooks++;throw new Error('bad');}})]) {const out=await a.commit(value);noPersistence(out);assert.equal(out.error.code,'untrusted_notebook_command');}
  noPersistence(await other.commit(p.command));assert.equal(calls,0);assert.equal(hooks,0);
});

test('constructor options are closed inert and fixed synthetic source rather than client authorization claims',()=>{
  assert.equal(typeof api.createSyntheticNotebookAdapter,'function');let hooks=0;const good={sourceFixture:fixture(),execute(){hooks++;}};
  const getter={sourceFixture:fixture()};Object.defineProperty(getter,'execute',{enumerable:true,get(){hooks++;return()=>{};}});
  const revoked=Proxy.revocable({},{});revoked.revoke();
  for(const options of [null,{},getter,revoked.proxy,new Proxy(good,{ownKeys(){hooks++;return [];}}),{...good,dbRole:'postgres'},
    {...good,scope:{schoolId:'demo-school-b'}},{...good,authorized:true},{...good,execute:new Proxy(()=>{}, {apply(){hooks++;}})},
    {...good,sourceFixture:{...fixture(),productionReady:true}}]) assert.throws(()=>api.createSyntheticNotebookAdapter(options),/invalid_synthetic_notebook_adapter_options/u);
  assert.equal(hooks,0);
});

test('scope purpose owner steward catalog hashes and policy are pinned before preparation',()=>{
  assert.equal(typeof api.createSyntheticNotebookAdapter,'function');let calls=0;
  for(const mutate of [s=>{s.sourceKind='production';},s=>{s.scope.schoolId='real-school';},s=>{s.policy.purpose='learning_progress_sync';},
    s=>{s.catalog.asset.ownerId='';},s=>{s.catalog.asset.stewardId='';},s=>{s.catalog.catalogSha256='f'.repeat(64);},s=>{s.policy.policySha256='f'.repeat(64);},
    s=>{s.policy.limits.maxBodyBytes=524288;},s=>{s.allowedTargets[0].grade=7;}]) {
    const s=fixture();mutate(s);assert.throws(()=>adapter(()=>{calls++;},s),/invalid_synthetic_notebook_adapter_options/u);
  }
  assert.equal(calls,0);
});

test('preparation denies role query scope purpose flags getters proxies cycles and private state without effects',()=>{
  let calls=0,hooks=0;const a=adapter(()=>{calls++;});
  for(const key of ['role','dbRole','scope','schoolId','purpose','query','execute','trusted','persisted','productionReady']) {
    const out=a.prepare({...request(),[key]:true});noPersistence(out);assert.equal(out.error.code,'notebook_request_invalid');
  }
  const getter=request();Object.defineProperty(getter.body,'text',{enumerable:true,get(){hooks++;return 'private';}});
  const cycle=request();cycle.body.loop=cycle.body;const sparse=request();delete sparse.body.strokes[0].points[0];
  const revoked=Proxy.revocable({},{});revoked.revoke();
  for(const req of [getter,cycle,sparse,revoked.proxy,new Proxy(request(),{ownKeys(){hooks++;return [];}})])noPersistence(a.prepare(req));
  assert.equal(calls,0);assert.equal(hooks,0);
});

test('unsupported PostgreSQL coordinate and Unicode profiles fail before DB without rounding or normalization',()=>{
  let calls=0;const a=adapter(()=>{calls++;});
  for(const mutate of [r=>{r.body.strokes[0].points[0].x=0.12345;},r=>{r.body.strokes[0].points[0].y=0.00001;},
    r=>{r.body.text='\0';},r=>{r.body.notes[0].text='\ud800';},r=>{r.body.concerns[0].text='\udfff';}]) {
    const req=request();mutate(req);const before=copy(req);const out=a.prepare(req);noPersistence(out);assert.equal(out.error.code,'notebook_postgres_profile_unsupported');assert.deepEqual(req,before);
  }
  const valid=request();valid.body.strokes[0].points=[{x:0.0003,y:0.9999},{x:-0,y:1}];valid.body.text='Çözüm 📝 e\u0301';
  const out=a.prepare(valid);assert.equal(out.valid,true);assert.equal(out.command.intent.body.strokes[0].points[0].x,0.0003);
  assert.equal(out.command.intent.body.text,valid.body.text);assert.equal(Object.is(out.command.intent.body.strokes[0].points[1].x,-0),false);assert.equal(calls,0);
});

test('caller arguments cannot replace current scope revision or executor on any adapter method',async()=>{
  let calls=0;const a=adapter(()=>{calls++;});const p=a.prepare(request());
  noPersistence(a.prepare(request(),{scope:'other'}));noPersistence(await a.commit(p.command,{role:'postgres'}));
  const current=await a.readCurrent({scope:'other'});assert.equal(current.valid,false);assert.equal(current.readState,'not_attempted');
  for(const args of [[1,{role:'other'}],[0],[-1],[1.5],['1'],[Number.MAX_SAFE_INTEGER]]) {const out=await a.readRevision(...args);assert.equal(out.valid,false);assert.equal(out.readState,'not_attempted');}
  assert.equal(calls,0);
});

test('accepted receipt alone never advances current source; explicit verified current read does',async()=>{
  const source=fixture(),req=request(),queries=[];const a=adapter(q=>{queries.push(q);return row(q.text.includes('commit_intent')?writeResult(source,req):readResult(source,req));},source);
  const p=a.prepare(req);assert.equal((await a.commit(p.command)).valid,true);
  const next=request();next.expectedRevision=1;next.mutationId='mutation-next';next.idempotencyKey='idem-next';
  assert.equal(a.prepare(next).error.code,'notebook_revision_conflict');
  const read=await a.readCurrent();assert.equal(read.valid,true);assert.equal(read.currentHeadVerified,true);assert.equal(read.sourceAdvanced,true);assert.equal(read.readState,'confirmed');
  assert.equal(queries[1].text,'SELECT student_notebook.read_current($1::text) AS notebook_result');assert.deepEqual(queries[1].values,[sha('scope',source.scope)]);
  const prepared=a.prepare(next);assert.equal(prepared.valid,true);assert.equal(prepared.command.intent.priorBodySha256,sha('body',req.body));
  source.scope.grade=7;source.policy.limits.textMaxUnits=128;req.body.text='tampered external';
  assert.equal(prepared.command.intent.scope.grade,6);assert.equal(a.prepare(next).command.intent.scope.grade,6);
});

test('confirmed receipt detects changed idempotency bodies before DB without pretending the current source advanced',async()=>{
  const s=fixture(),req=request();let calls=0;
  const a=adapter(()=>{calls++;return row(writeResult(s,req,calls===1?'accepted':'idempotent_replay'));});
  const p=a.prepare(req);assert.equal((await a.commit(p.command)).valid,true);
  const changed=copy(req);changed.body.text='same key, changed body';const rejected=a.prepare(changed);noPersistence(rejected);
  assert.equal(rejected.error.code,'notebook_idempotency_conflict');assert.equal(calls,1);
  const duplicate=a.prepare(req);assert.equal(duplicate.valid,true);assert.equal((await a.commit(duplicate.command)).outcome,'idempotent_replay');
  const next=request();next.expectedRevision=1;next.idempotencyKey='idem-new';next.mutationId='mutation-new';
  assert.equal(a.prepare(next).error.code,'notebook_revision_conflict');
});

test('verified empty current read stays explicitly revision zero with no fabricated content or receipt',async()=>{
  const source=fixture(),a=adapter(()=>row(readResult(source)));const out=await a.readCurrent();
  assert.equal(out.valid,true);assert.equal(out.revision,0);assert.equal(out.body,null);assert.equal(out.receipt,null);assert.equal(out.bodySha256,null);
  assert.equal(out.sourceAdvanced,false);assert.equal(out.currentHeadVerified,true);assert.equal(a.prepare(request()).valid,true);
});

test('historical exact replay and read never roll back a verified newer head',async()=>{
  const s=fixture(),first=request(),firstReceipt=receipt(s,first),second=request();second.expectedRevision=1;second.mutationId='mutation-two';second.idempotencyKey='idem-two';second.body.text='İkinci kayıt';
  let current=readResult(s,first);const a=adapter(q=>{
    if(q.text.includes('read_current'))return row(current);
    if(q.text.includes('read_revision'))return row(readResult(s,first));
    const i=JSON.parse(q.values[0]);return row(writeResult(s,i.mutationId===first.mutationId?first:second,i.historicalReceipt?'idempotent_replay':'accepted',
      i.historicalReceipt?{revision:2,bodySha256:sha('body',second.body)}:null));
  });
  assert.equal((await a.readCurrent()).valid,true);const p2=a.prepare(second);assert.equal(p2.valid,true);assert.equal((await a.commit(p2.command)).valid,true);
  current=readResult(s,second);assert.equal((await a.readCurrent()).valid,true);
  const historical=a.prepare(first);assert.equal(historical.decision,'prepare_exact_replay');assert.equal(historical.command.intent.historicalReceipt.receiptSha256,firstReceipt.receiptSha256);
  const replay=await a.commit(historical.command);assert.equal(replay.valid,true);assert.equal(replay.outcome,'idempotent_replay');assert.equal(replay.head.revision,2);assert.equal(replay.sourceAdvanced,false);
  const old=await a.readRevision(1);assert.equal(old.valid,true);assert.equal(old.revision,1);assert.equal(old.sourceAdvanced,false);assert.equal(old.currentHeadVerified,false);
  const third=request();third.expectedRevision=2;third.mutationId='mutation-three';third.idempotencyKey='idem-three';assert.equal(a.prepare(third).valid,true);
});

test('replay head hash is pinned by a confirmed newer receipt before a current read advances the source',async()=>{
  const s=fixture(),first=request(),firstReceipt=receipt(s,first),second=request();
  s.receipts=[firstReceipt];s.currentRevision={revision:1,bodySha256:firstReceipt.bodySha256};
  second.expectedRevision=1;second.mutationId='mutation-two';second.idempotencyKey='idem-two';second.body.text='Confirmed second';
  let calls=0;const a=adapter(()=>{calls++;return row(calls===1?writeResult(s,second):writeResult(s,first,'idempotent_replay',{revision:2,bodySha256:'f'.repeat(64)}));},s);
  assert.equal((await a.commit(a.prepare(second).command)).valid,true);
  const replay=await a.commit(a.prepare(first).command);noPersistence(replay,'unknown');assert.equal(replay.error.code,'notebook_response_invalid');
  assert.equal(calls,2);const third=request();third.expectedRevision=2;third.mutationId='mutation-three';third.idempotencyKey='idem-three';
  assert.equal(a.prepare(third).error.code,'notebook_revision_conflict');
});

test('write exceptions have unknown persistence with no automatic retry rollback invention or secret echo',async()=>{
  for(const code of ['42501','40001','23505','22023','XX000']) {
    let calls=0;const a=adapter(()=>{calls++;const error=new Error('private credential body');error.code=code;throw error;});
    const out=await a.commit(a.prepare(request()).command);noPersistence(out,'unknown');assert.equal(out.automaticRetry,false);assert.equal(calls,1);
    assert.equal(JSON.stringify(out).includes('private'),false);assert.equal(Object.hasOwn(out,'rolledBack'),false);
  }
});

test('malformed write envelopes rows outcomes flags and receipt-head mismatches stay unknown',async()=>{
  const s=fixture(),req=request(),good=writeResult(s,req);
  const payloads=[undefined,null,{rowCount:0,rows:[]},{rowCount:2,rows:[{notebook_result:good},{notebook_result:good}]},
    {rowCount:1,rows:[]},{...row(good),debug:'private'},{rowCount:1,rows:[{notebook_result:good,extra:true}]},
    row({...good,outcome:'published'}),row({...good,productionReady:true}),row({...good,syntheticOnly:false}),
    row({...good,head:{revision:3,bodySha256:good.receipt.bodySha256}}),row({...good,head:{revision:1,bodySha256:'f'.repeat(64)}})];
  for(const raw of payloads){let calls=0;const a=adapter(()=>{calls++;return raw;});const out=await a.commit(a.prepare(req).command);noPersistence(out,'unknown');assert.equal(out.error.code,'notebook_response_invalid');assert.equal(calls,1);}
});

test('correctly rehashed foreign or altered receipt fields cannot detach a write from its prepared body source or request',async()=>{
  const s=fixture(),req=request();
  for(const mutate of [r=>{r.scopeSha256='f'.repeat(64);},r=>{r.policySha256='f'.repeat(64);},r=>{r.catalogSha256='f'.repeat(64);},
    r=>{r.bodySha256='f'.repeat(64);},r=>{r.requestSha256='f'.repeat(64);},r=>{r.expectedRevision=1;r.resultingRevision=2;},
    r=>{r.idempotencyKey='another-key';},r=>{r.mutationId='another-mutation';},r=>{r.receiptId='synthetic-fake';},r=>{r.receiptId=null;}]) {
    const raw=writeResult(s,req);mutate(raw.receipt);rehashReceipt(raw.receipt);const a=adapter(()=>row(raw));const out=await a.commit(a.prepare(req).command);noPersistence(out,'unknown');
  }
});

test('response getters proxies cycles thenables hostile roots and oversized values execute no response hooks',async()=>{
  let hooks=0;const s=fixture(),req=request();
  const getter=row(writeResult(s,req));Object.defineProperty(getter.rows[0].notebook_result.receipt,'bodySha256',{enumerable:true,get(){hooks++;return 'private';}});
  const thenable={then(){hooks++;}},cycle=row(writeResult(s,req));cycle.loop=cycle;
  const revoked=Proxy.revocable({},{});revoked.revoke();
  for(const raw of [getter,thenable,cycle,revoked.proxy,new Proxy(row(writeResult(s,req)),{get(){hooks++;},ownKeys(){hooks++;return [];}}),
    {...row(writeResult(s,req)),padding:'x'.repeat(524289)}]) {const a=adapter(()=>raw);noPersistence(await a.commit(a.prepare(req).command),'unknown');}
  assert.equal(hooks,0);
  const a=adapter(()=>{const error={};Object.defineProperty(error,'code',{get(){hooks++;return '42501';}});throw error;});
  noPersistence(await a.commit(a.prepare(req).command),'unknown');assert.equal(hooks,0);
});

test('native async executor results are validated but arbitrary thenables are never awaited',async()=>{
  const s=fixture(),req=request(),a=adapter(async()=>row(writeResult(s,req)));
  assert.equal((await a.commit(a.prepare(req).command)).valid,true);
  let hooks=0;const bad=adapter(()=>({then(resolve){hooks++;resolve(row(writeResult(s,req)));}}));
  noPersistence(await bad.commit(bad.prepare(req).command),'unknown');assert.equal(hooks,0);
});

test('native promises with own getters or custom prototypes are denied before await can execute constructor hooks',async()=>{
  const s=fixture(),req=request();let hooks=0;
  const constructorGetter=Promise.resolve(row(writeResult(s,req)));
  Object.defineProperty(constructorGetter,'constructor',{get(){hooks++;return Promise;}});
  const thenGetter=Promise.resolve(row(writeResult(s,req)));
  Object.defineProperty(thenGetter,'then',{get(){hooks++;return Promise.prototype.then;}});
  class CustomPromise extends Promise {}
  for(const raw of [constructorGetter,thenGetter,CustomPromise.resolve(row(writeResult(s,req)))]) {
    const a=adapter(()=>raw);noPersistence(await a.commit(a.prepare(req).command),'unknown');
  }
  assert.equal(hooks,0);
});

test('malformed current reads cannot advance revision including fully rehashed known-write body forgeries',async()=>{
  const s=fixture(),req=request();
  for(const mutate of [r=>{r.scope.schoolId='demo-school-b';r.scopeSha256=sha('scope',r.scope);},r=>{r.governanceBinding.purpose='learning_progress_sync';},
    r=>{r.governanceBinding.ownerId='forged';},r=>{r.governanceBinding.limits.textMaxUnits=9999;},r=>{r.body.bookmarks.questions=['other-school'];},
    r=>{r.body.strokes[0].points[0].x=0.12345;},r=>{r.body.notes[0].text='\0';},r=>{r.body.notes[0].grade=7;},r=>{r.body.text='\ud800';},
    r=>{r.revision=2;},r=>{r.receipt.bodySha256='f'.repeat(64);rehashReceipt(r.receipt);},r=>{r.receipt=null;},
    r=>{r.body.text='forged but rehashed';r.bodySha256=sha('body',r.body);r.receipt.bodySha256=r.bodySha256;
      r.receipt.requestSha256=sha('request',{scopeSha256:r.scopeSha256,contractVersion:'1.0.0',mutationId:r.receipt.mutationId,idempotencyKey:r.receipt.idempotencyKey,expectedRevision:r.receipt.expectedRevision,body:r.body});rehashReceipt(r.receipt);}
  ]) {
    const raw=readResult(s,req);mutate(raw);const a=adapter(q=>row(q.text.includes('commit_intent')?writeResult(s,req):raw));const p=a.prepare(req);assert.equal((await a.commit(p.command)).valid,true);
    const out=await a.readCurrent();assert.equal(out.valid,false);assert.equal(out.readState,'unknown');assert.equal(out.persistenceConfirmed,false);assert.equal(out.persisted,null);
    const next=request();next.expectedRevision=1;next.mutationId='mutation-next';next.idempotencyKey='idem-next';assert.equal(a.prepare(next).error.code,'notebook_revision_conflict');
  }
});

test('read body receipt request governance scope and literal payload hashes must bind even without a previous local write',async()=>{
  const s=fixture(),req=request();
  for(const mutate of [r=>{r.bodySha256='f'.repeat(64);},r=>{r.receipt.requestSha256='f'.repeat(64);rehashReceipt(r.receipt);},
    r=>{r.receipt.policySha256='f'.repeat(64);rehashReceipt(r.receipt);},r=>{r.receipt.catalogSha256='f'.repeat(64);rehashReceipt(r.receipt);},
    r=>{r.receipt.idempotencyKey=null;rehashReceipt(r.receipt);},r=>{r.governanceBinding.targetCatalogSha256='f'.repeat(64);},
    r=>{r.body.notes[0].format='html';},r=>{r.body.extra=true;},r=>{r.body.bookmarks.topics=['question-a-001'];},r=>{r.syntheticOnly=false;},r=>{r.productionReady=true;}]) {
    const raw=readResult(s,req);mutate(raw);const a=adapter(()=>row(raw));assert.equal((await a.readCurrent()).valid,false);
  }
});

test('stale and equal-revision divergent read responses cannot overwrite newer verified source state',async()=>{
  const s=fixture(),one=request(),two=request();two.expectedRevision=1;two.mutationId='mutation-two';two.idempotencyKey='idem-two';two.body.text='İkinci';
  let raw=readResult(s,two);const a=adapter(()=>row(raw));assert.equal((await a.readCurrent()).valid,true);
  raw=readResult(s,one);assert.equal((await a.readCurrent()).valid,false);
  const different=copy(two);different.body.text='same revision another body';raw=readResult(s,different);assert.equal((await a.readCurrent()).valid,false);
  const next=request();next.expectedRevision=2;next.mutationId='mutation-three';next.idempotencyKey='idem-three';assert.equal(a.prepare(next).valid,true);
});

test('out-of-order native asynchronous current reads cannot replace a later verified head with a stale response',async()=>{
  const s=fixture(),one=request(),two=request();two.expectedRevision=1;two.mutationId='mutation-two';two.idempotencyKey='idem-two';two.body.text='Later head';
  const resolvers=[];const a=adapter(()=>new Promise(resolve=>{resolvers.push(resolve);}));
  const slow=a.readCurrent(),fast=a.readCurrent();assert.equal(resolvers.length,2);
  resolvers[1](row(readResult(s,two)));assert.equal((await fast).valid,true);
  resolvers[0](row(readResult(s,one)));const stale=await slow;assert.equal(stale.valid,false);assert.equal(stale.readState,'unknown');assert.equal(stale.persisted,null);
  const next=request();next.expectedRevision=2;next.mutationId='mutation-three';next.idempotencyKey='idem-three';assert.equal(a.prepare(next).valid,true);
});

test('historical read is fixed-scope exact-revision and rejects other revisions without changing current state',async()=>{
  const s=fixture(),req=request(),queries=[];let raw=readResult(s,req);
  const a=adapter(q=>{queries.push(q);return row(raw);});const out=await a.readRevision(1);
  assert.equal(out.valid,true);assert.equal(out.revision,1);assert.equal(out.sourceAdvanced,false);
  assert.equal(queries[0].text,'SELECT student_notebook.read_revision($1::text,$2::bigint) AS notebook_result');assert.deepEqual(queries[0].values,[sha('scope',s.scope),'1']);
  assert.equal(a.prepare(req).decision,'prepare_replace');
  raw.revision=2;assert.equal((await a.readRevision(1)).valid,false);
});

test('failed reads stay read-unknown and never report a fabricated rollback or retry',async()=>{
  for(const execute of [()=>{throw new Error('private credential');},()=>({rowCount:0,rows:[]}),()=>row(null)]) {
    const a=adapter(execute),out=await a.readCurrent();assert.equal(out.valid,false);assert.equal(out.readState,'unknown');assert.equal(out.persisted,null);
    assert.equal(out.commitState,'not_attempted');assert.equal(out.automaticRetry,false);assert.equal(JSON.stringify(out).includes('private'),false);assert.equal(a.prepare(request()).valid,true);
  }
});

test('verified receipt history capacity is bounded and never silently evicts a key to accept a new write',()=>{
  const s=fixture(),requests=Array.from({length:100},(_,n)=>{const r=request();r.expectedRevision=n;r.mutationId=`mutation-${n}`;r.idempotencyKey=`idem-${n}`;r.body.text=`rev${n+1}`;return r;});
  s.receipts=requests.map(r=>receipt(s,r));s.currentRevision={revision:100,bodySha256:s.receipts.at(-1).bodySha256};let calls=0;const a=adapter(()=>{calls++;},s);
  const next=request();next.expectedRevision=100;next.mutationId='mutation-101';next.idempotencyKey='idem-101';const out=a.prepare(next);noPersistence(out);assert.equal(out.error.code,'notebook_history_capacity_exceeded');
  assert.equal(a.prepare(requests[0]).decision,'prepare_exact_replay');assert.equal(calls,0);
});

test('an exact newly confirmed replay remains available at the history bound before explicit current read',async()=>{
  const s=fixture(),requests=Array.from({length:99},(_,n)=>{const r=request();r.expectedRevision=n;r.mutationId=`mutation-${n}`;r.idempotencyKey=`idem-${n}`;r.body.text=`rev${n+1}`;return r;});
  s.receipts=requests.map(r=>receipt(s,r));s.currentRevision={revision:99,bodySha256:s.receipts.at(-1).bodySha256};
  const last=request();last.expectedRevision=99;last.mutationId='mutation-99';last.idempotencyKey='idem-99';last.body.text='rev100';
  let calls=0;const a=adapter(()=>{calls++;return row(writeResult(s,last,calls===1?'accepted':'idempotent_replay'));},s);
  assert.equal((await a.commit(a.prepare(last).command)).valid,true);const duplicate=a.prepare(last);assert.equal(duplicate.valid,true);
  assert.equal((await a.commit(duplicate.command)).outcome,'idempotent_replay');
  const next=request();next.expectedRevision=99;next.mutationId='mutation-new';next.idempotencyKey='idem-new';
  const denied=a.prepare(next);noPersistence(denied);assert.equal(denied.error.code,'notebook_history_capacity_exceeded');assert.equal(calls,2);
});

test('two fixed-school adapter instances never exchange command authority or returned notebook contents',async()=>{
  const sa=fixture('a'),sb=fixture('b'),ra=request('a'),rb=request('b');let callsA=0,callsB=0;
  const a=adapter(()=>{callsA++;return row(readResult(sb,rb));},sa),b=adapter(()=>{callsB++;return row(writeResult(sb,rb));},sb);
  const pa=a.prepare(ra);noPersistence(await b.commit(pa.command));assert.equal(callsB,0);
  const read=await a.readCurrent();assert.equal(read.valid,false);assert.equal(Object.hasOwn(read,'body'),false);assert.equal(callsA,1);
});
