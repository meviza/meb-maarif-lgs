import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';

const api = await import('../tools/test_synthetic_student_notebook_postgres.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error;
});
const fixtures = await import('./support/synthetic_notebook_fixture.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error;
});
function parser(args) {
  assert.equal(typeof api.parseSyntheticNotebookArgs, 'function', 'notebook opt-in parser is missing');
  return api.parseSyntheticNotebookArgs(args);
}
function source(school = 'a') {
  assert.equal(typeof fixtures.createSyntheticNotebookFixture, 'function', 'independent notebook fixture is missing');
  return fixtures.createSyntheticNotebookFixture(school);
}
function request(school = 'a') {
  assert.equal(typeof fixtures.createSyntheticNotebookRequest, 'function', 'independent notebook request is missing');
  return fixtures.createSyntheticNotebookRequest(school);
}

test('notebook proof defaults to no run and accepts only bounded explicit opt-in', () => {
  assert.deepEqual(parser([]), { run: false, container: 'k12-synthetic-notebook-proof' });
  assert.deepEqual(parser(['--run', '--container', 'k12-synthetic-notebook-independent-1']), { run: true, container: 'k12-synthetic-notebook-independent-1' });
  assert.equal(Object.isFrozen(parser([])), true);
  for (const args of [['--run','--run'],['--container'],['--container','postgres'],['--container','k12-synthetic-notebook-X'],
    ['--container','k12-synthetic-notebook-../../other'],['--container','k12-synthetic-notebook-'+'a'.repeat(42)],['--pull'],['--run','--extra'],
    ['--container','k12-synthetic-notebook-safe','--run','extra']]) assert.throws(() => parser(args), /invalid_synthetic_notebook_args/u);
});

test('argument arrays reject getters proxies sparse inherited and extra properties without side effects', () => {
  let invoked = 0;
  const getter = ['--run']; Object.defineProperty(getter, '0', { enumerable: true, get() { invoked++; return '--run'; } });
  const extra = ['--run']; extra.extra = true;
  const inherited = ['--run']; Object.setPrototypeOf(inherited, {});
  const revoked = Proxy.revocable([], {}); revoked.revoke();
  for (const args of [null,{},new Array(1),getter,extra,inherited,revoked.proxy,new Proxy([], { ownKeys() { invoked++; return []; } })])
    assert.throws(() => parser(args), /invalid_synthetic_notebook_args/u);
  assert.equal(invoked, 0);
});

test('Docker plan is fixed cached networkless read-only bounded and does not accept caller resources or mounts', () => {
  assert.equal(typeof api.buildSyntheticNotebookDockerArgs, 'function');
  const args = api.buildSyntheticNotebookDockerArgs(parser(['--run']));
  assert.equal(args[0], 'run');
  for (const required of ['--rm','--pull=never','--network=none','--memory=256m','--cpus=1','--read-only','--user=postgres',
    '--cap-drop=ALL','--security-opt=no-new-privileges','--pids-limit=100','--shm-size=2m','postgres:16.15-alpine']) assert.ok(args.includes(required), required);
  assert.equal(args.includes('-p'), false); assert.equal(args.includes('--publish'), false); assert.equal(args.includes('--mount'), false); assert.equal(args.includes('-v'), false);
  assert.ok(args.includes('/var/lib/postgresql/data:rw,noexec,nosuid,size=56m,mode=1777'));
  assert.ok(args.includes('/tmp:rw,noexec,nosuid,size=1m,mode=1777'));
  assert.ok(args.includes('/var/run/postgresql:rw,noexec,nosuid,size=1m,mode=1777'));
  assert.throws(() => api.buildSyntheticNotebookDockerArgs(parser([])), /synthetic_notebook_run_required/u);
  for (const options of [{run:true,container:'other'},{run:true,container:'k12-synthetic-notebook-proof',mount:'/private'},
    {run:'true',container:'k12-synthetic-notebook-proof'},null]) assert.throws(() => api.buildSyntheticNotebookDockerArgs(options), /invalid_synthetic_notebook_args/u);
  let invoked = 0; const hostile = { container:'k12-synthetic-notebook-proof' };
  Object.defineProperty(hostile,'run',{enumerable:true,get(){invoked++;return true;}});
  assert.throws(() => api.buildSyntheticNotebookDockerArgs(hostile), /invalid_synthetic_notebook_args/u); assert.equal(invoked,0);
});

test('default CLI performs no database proof and emits an honest no-run state', () => {
  const outcome = spawnSync(process.execPath, [new URL('../tools/test_synthetic_student_notebook_postgres.mjs', import.meta.url).pathname],
    {encoding:'utf8',timeout:10000,maxBuffer:32768,shell:false});
  assert.equal(outcome.status, 0, outcome.stderr);
  assert.deepEqual(JSON.parse(outcome.stdout), {state:'not_run',syntheticOnly:true,databaseProofExecuted:false,productionReady:false});
});

test('independent two-school fixtures prepare separate Unicode and decimal intents with exact source hashes', () => {
  for (const school of ['a','b']) {
    const s = source(school), req = request(school), result = createSyntheticNotebookSyncPreparer(s).prepare(req);
    assert.equal(result.valid,true); assert.equal(result.decision,'prepare_replace');
    assert.equal(result.intent.scopeSha256, fixtures.hashSyntheticNotebook('scope',s.scope));
    assert.equal(result.intent.bodySha256, fixtures.hashSyntheticNotebook('body',req.body));
    assert.equal(result.intent.intentSha256, fixtures.hashSyntheticNotebook('intent',Object.fromEntries(Object.entries(result.intent).filter(([k])=>k!=='intentSha256'))));
    assert.equal(result.intent.governanceBinding.purpose,'student_notebook');
    assert.ok(req.body.text.includes('Çözüm')); assert.ok(req.body.text.includes('📝'));
    assert.deepEqual(req.body.strokes[0].points,[{x:0.125,y:0.0001},{x:1,y:0}]);
    assert.equal(result.persistence,'not_implemented');
  }
  assert.notEqual(fixtures.hashSyntheticNotebook('scope',source('a').scope), fixtures.hashSyntheticNotebook('scope',source('b').scope));
});

test('fixture receipts independently bind historical requests and let the preparer produce exact replay', () => {
  const s = source(), req = request();
  assert.equal(typeof fixtures.createSyntheticNotebookReceipt,'function');
  const receipt = fixtures.createSyntheticNotebookReceipt(s,req);
  assert.equal(receipt.receiptSha256,fixtures.hashSyntheticNotebook('receipt',Object.fromEntries(Object.entries(receipt).filter(([k])=>k!=='receiptSha256'))));
  s.receipts = [receipt]; s.currentRevision = {revision:1,bodySha256:receipt.bodySha256};
  const replay = createSyntheticNotebookSyncPreparer(s).prepare(req);
  assert.equal(replay.valid,true); assert.equal(replay.decision,'prepare_exact_replay');
  assert.equal(replay.intent.historicalReceipt.receiptSha256,receipt.receiptSha256);
  const changed = structuredClone(req); changed.body.text+=' değişti';
  assert.equal(createSyntheticNotebookSyncPreparer(s).prepare(changed).error.code,'notebook_idempotency_conflict');
});

test('canonical fixture preserves Unicode escapes and exposes rather than hides the SQL precision gap', () => {
  const example={z:'Çözüm 📝"\n\\',a:[0.125,0.0001,1,0]};
  assert.equal(fixtures.canonicalSyntheticNotebook(example),'{"a":[0.125,0.0001,1,0],"z":"Çözüm 📝\\"\\n\\\\"}');
  const req=request();req.body.strokes[0].points[0].x=0.12345;
  assert.equal(createSyntheticNotebookSyncPreparer(source()).prepare(req).valid,true,
    'pure preparation supports finer coordinates; database proof has a narrower explicit profile');
  const nul=request();nul.body.text='\u0000';
  assert.equal(createSyntheticNotebookSyncPreparer(source()).prepare(nul).valid,true,
    'PostgreSQL JSONB null-character rejection is a separate persistence profile, not silently sanitized');
});

test('bounded test-only parameter bridge allowlists SQL, quotes literals and cannot route a role', () => {
  assert.equal(typeof api.buildSyntheticNotebookPsqlStatement,'function');
  const malicious = "x'); SELECT 'not executed'; --";
  const sql = api.buildSyntheticNotebookPsqlStatement({text:api.SYNTHETIC_NOTEBOOK_SQL.current,values:[malicious]});
  assert.ok(sql.includes("x''); SELECT ''not executed''; --"));
  assert.ok(sql.startsWith('PREPARE synthetic_notebook_request(text) AS '));
  assert.ok(sql.endsWith('DEALLOCATE synthetic_notebook_request;'));
  for (const query of [{text:'SELECT $1',values:['x']},{text:api.SYNTHETIC_NOTEBOOK_SQL.current,values:[]},
    {text:api.SYNTHETIC_NOTEBOOK_SQL.current,values:['x'],role:'postgres'},
    {text:api.SYNTHETIC_NOTEBOOK_SQL.current,values:['x'.repeat(524289)]},
    {text:api.SYNTHETIC_NOTEBOOK_SQL.historical,values:['x','1.5']},
    {text:api.SYNTHETIC_NOTEBOOK_SQL.historical,values:['x','9007199254740991']},null])
    assert.throws(()=>api.buildSyntheticNotebookPsqlStatement(query),/invalid_synthetic_notebook_query/u);
  let invoked=0; const values=['x']; Object.defineProperty(values,'0',{enumerable:true,get(){invoked++;return 'secret';}});
  assert.throws(()=>api.buildSyntheticNotebookPsqlStatement({text:api.SYNTHETIC_NOTEBOOK_SQL.current,values}),/invalid_synthetic_notebook_query/u);
  const revoked=Proxy.revocable({},{});revoked.revoke();
  assert.throws(()=>api.buildSyntheticNotebookPsqlStatement(revoked.proxy),/invalid_synthetic_notebook_query/u);assert.equal(invoked,0);
});
