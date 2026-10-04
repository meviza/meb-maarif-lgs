import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createSyntheticNotebookAdapter, SYNTHETIC_NOTEBOOK_ADAPTER_SQL as SQL } from '../packages/contracts/synthetic_notebook_adapter.mjs';
import { createSyntheticNotebookRequest, createSyntheticNotebookReceipt } from './support/synthetic_notebook_fixture.mjs';
import { createSyntheticNotebookDeskPreviewExecutor } from '../tools/synthetic_notebook_desk_preview.mjs';
import { createSyntheticNotebookDeskServer } from '../packages/contracts/synthetic_notebook_application_server.mjs';
import { parseSyntheticNotebookDeskPostgresArgs, createSyntheticNotebookDeskPostgresExecutor,
  planSyntheticNotebookDeskOwnedCleanup } from '../tools/synthetic_notebook_desk_postgres_preview.mjs';

// Only the slow external psql transport is replaced. Complete real adapter
// rows come from the existing synthetic memory test double, never SQL proof.
function transport() {
  const memory = createSyntheticNotebookDeskPreviewExecutor('normal');
  const calls = [];
  const execute = statement => {
    calls.push(statement);
    const match = /; EXECUTE synthetic_notebook_request\('((?:[^']|'')*)'\); DEALLOCATE synthetic_notebook_request;$/u.exec(statement);
    assert.ok(match, 'only one bounded parameter reaches the fixed proof bridge');
    const value = match[1].replaceAll("''", "'");
    const text = statement.includes('read_current(') ? SQL.current : SQL.commit;
    return JSON.stringify(memory.execute(Object.freeze({ text, values: Object.freeze([value]) })).rows[0].notebook_result);
  };
  return { execute, calls };
}

test('no opt-in returns a non-executed result and never starts Docker/server', () => {
  const out = spawnSync(process.execPath, ['tools/synthetic_notebook_desk_postgres_preview.mjs'], { encoding: 'utf8', timeout: 3000, maxBuffer: 8192 });
  assert.equal(out.status, 0, out.stderr);
  const report = JSON.parse(out.stdout);
  assert.equal(report.state, 'not_run'); assert.equal(report.databaseProofExecuted, false);
  assert.equal(report.serverStarted, false); assert.equal(report.productionReady, false);
  assert.equal(report.authenticationImplemented, false); assert.equal(report.nativeBrowserVerified, false);
});

test('explicit run closes options to fixed host and bounded test scenario', () => {
  const parsed = parseSyntheticNotebookDeskPostgresArgs(['--run', '--port', '0', '--container', 'k12-synthetic-notebook-desk-test', '--scenario', 'reply-loss-once']);
  assert.deepEqual(parsed, { run: true, host: '127.0.0.1', port: 0, container: 'k12-synthetic-notebook-desk-test', scenario: 'reply-loss-once' });
  assert.equal(Object.isFrozen(parsed), true);
  for (const args of [['--host','0.0.0.0'],['--run','--run'],['--port','80'],['--port','65536'],['--port','03341'],
    ['--scenario','normal','--scenario','normal'],['--container','postgres'],['--scenario','SQL'],['--token','secret']]) {
    assert.throws(() => parseSyntheticNotebookDeskPostgresArgs(args), /invalid_synthetic_notebook_desk_postgres_args/u);
  }
});

test('argument accessors/proxies/sparse/cyclic arrays are rejected before hooks', () => {
  let hooks = 0;
  const getter = []; Object.defineProperty(getter, '0', { enumerable: true, get() { hooks++; return '--run'; } });
  const proxy = new Proxy([], { get() { hooks++; return 0; }, ownKeys() { hooks++; return []; } });
  const cycle = []; cycle.push(cycle);
  for (const arg of [getter, proxy, new Array(1), cycle, Object.assign([], { extra: '--run' }), Array(8).fill('--run')]) {
    assert.throws(() => parseSyntheticNotebookDeskPostgresArgs(arg), /invalid_synthetic_notebook_desk_postgres_args/u);
  }
  assert.equal(hooks, 0);
});

test('fixed desk binding reads head0 then saves once and explicit read advances', async () => {
  const t = transport(), bridge = createSyntheticNotebookDeskPostgresExecutor(t.execute, 'normal');
  assert.equal(bridge.sourceFixture.scope.schoolId, 'demo-school-a');
  assert.equal(bridge.sourceFixture.currentRevision.revision, 0);
  const adapter = createSyntheticNotebookAdapter({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
  const read0 = await adapter.readCurrent(); assert.equal(read0.valid, true); assert.equal(read0.revision, 0);
  const prepared = adapter.prepare(createSyntheticNotebookRequest()); assert.equal(prepared.valid, true);
  const save = await adapter.commit(prepared.command); assert.equal(save.valid, true); assert.equal(save.receipt.resultingRevision, 1);
  const read1 = await adapter.readCurrent(); assert.equal(read1.valid, true); assert.equal(read1.revision, 1);
  assert.equal(read1.body.text, 'Çözüm: çevreyi düşün. 📝 "İpucu" \\ satır\nYeni satır\tve sekme.');
  assert.equal(bridge.witness().commitSuccessCount, 1); assert.equal(bridge.witness().currentReadCount, 2);
  assert.equal(bridge.witness().nativeBrowserVerified, false); assert.equal(bridge.witness().databaseProofExecuted, false);
});

test('post-success reply loss is used once and does not retry or auto-read', async () => {
  const t = transport(), bridge = createSyntheticNotebookDeskPostgresExecutor(t.execute, 'reply-loss-once');
  const adapter = createSyntheticNotebookAdapter({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
  assert.equal((await adapter.readCurrent()).revision, 0);
  const prepared = adapter.prepare(createSyntheticNotebookRequest());
  const unknown = await adapter.commit(prepared.command);
  assert.equal(unknown.valid, false); assert.equal(unknown.persisted, null); assert.equal(unknown.commitState, 'unknown');
  assert.equal(t.calls.length, 2); assert.equal(bridge.witness().commitSuccessCount, 1);
  assert.equal(bridge.witness().replyLossInjected, true);
  const recovered = await adapter.readCurrent(); assert.equal(recovered.valid, true); assert.equal(recovered.revision, 1);
  const replay = await adapter.commit(prepared.command); assert.equal(replay.valid, true); assert.equal(replay.outcome, 'idempotent_replay');
  assert.equal(t.calls.length, 4); assert.equal(bridge.witness().commitSuccessCount, 2);
  assert.equal(bridge.witness().acceptedCommitCount, 1); assert.equal(bridge.witness().replayCount, 1);
});

test('scripted alternate commit makes stale0 fail without claiming concurrency', async () => {
  const t = transport(), bridge = createSyntheticNotebookDeskPostgresExecutor(t.execute, 'stale-once');
  const adapter = createSyntheticNotebookAdapter({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
  assert.equal((await adapter.readCurrent()).revision, 0);
  assert.equal(bridge.witness().alternateCommitInjected, false);
  const request = createSyntheticNotebookRequest(), prepared = adapter.prepare(request);
  const stale = await adapter.commit(prepared.command);
  assert.equal(stale.valid, false); assert.equal(stale.persisted, null);
  assert.equal(stale.error.code, 'notebook_revision_conflict');
  assert.equal(bridge.witness().alternateCommitInjected, true); assert.equal(bridge.witness().concurrencyProof, false);
  const recovered = await adapter.readCurrent(); assert.equal(recovered.valid, true); assert.equal(recovered.revision, 1);
  assert.notEqual(recovered.body.text, request.body.text);
  assert.equal(t.calls.length, 4); assert.equal(bridge.witness().alternateCommitCount, 1);
});

test('foreign scope/unsafe query rejects before external transport', () => {
  let calls = 0, hooks = 0;
  const bridge = createSyntheticNotebookDeskPostgresExecutor(() => { calls++; return '{}'; }, 'normal');
  const badGetter = {}; Object.defineProperty(badGetter, 'text', { enumerable: true, get() { hooks++; return SQL.current; } });
  const badProxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; } });
  for (const query of [badGetter, badProxy, { text: SQL.current, values: ['foreign'] },
    Object.freeze({ text: SQL.current, values: Object.freeze(['foreign']) }),
    Object.freeze({ text: 'SELECT 1', values: Object.freeze([]) }),
    Object.freeze({ text: SQL.current, values: Object.freeze(['0a92002eb20bf7b25d71517674560c3388a01a425b3b3b893f74a54d7f584a82']), role: 'postgres' })]) {
    assert.throws(() => bridge.execute(query), /synthetic_notebook_desk_query_denied/u);
  }
  assert.equal(calls, 0); assert.equal(hooks, 0);
});

test('failed/malformed external output cannot activate post-commit fault or emit raw errors', async () => {
  for (const reply of ['not-json', '{}', 'x'.repeat(524289)]) {
    const bridge = createSyntheticNotebookDeskPostgresExecutor(() => reply, 'reply-loss-once');
    const adapter = createSyntheticNotebookAdapter({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
    const prepared = adapter.prepare(createSyntheticNotebookRequest());
    const out = await adapter.commit(prepared.command);
    assert.equal(out.valid, false); assert.equal(out.persisted, null); assert.equal(bridge.witness().replyLossInjected, false);
    assert.equal(bridge.witness().commitSuccessCount, 0);
  }
  const bridge = createSyntheticNotebookDeskPostgresExecutor(() => { const error = new Error('private-transport-sentinel'); error.code = '40001'; throw error; }, 'normal');
  const adapter = createSyntheticNotebookAdapter({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
  const prepared = adapter.prepare(createSyntheticNotebookRequest()), out = await adapter.commit(prepared.command);
  assert.equal(out.error.code, 'notebook_revision_conflict'); assert.doesNotMatch(JSON.stringify(bridge.witness()), /private-transport-sentinel/u);
});

test('cleanup stops only exact created ID and confirmed absence differs from unavailable', () => {
  const createdId = 'a'.repeat(64);
  assert.deepEqual(planSyntheticNotebookDeskOwnedCleanup(createdId, { status: 0, stdout: createdId+'\n', stderr: '', error: false }), { action: 'stop_owned_id', id: createdId, cleanupConfirmed: false });
  assert.deepEqual(planSyntheticNotebookDeskOwnedCleanup(createdId, { status: 1, stdout: '', stderr: 'Error: No such container: desk', error: false }), { action: 'already_absent', id: null, cleanupConfirmed: true });
  for (const result of [{ status: 0, stdout: 'b'.repeat(64), stderr: '', error: false },
    { status: 1, stdout: '', stderr: 'Cannot connect to Docker daemon', error: false },
    { status: null, stdout: '', stderr: '', error: true }]) {
    const decision = planSyntheticNotebookDeskOwnedCleanup(createdId, result);
    assert.equal(decision.action, 'ownership_or_absence_unconfirmed'); assert.equal(decision.id, null); assert.equal(decision.cleanupConfirmed, false);
  }
});

test('cleanup/query trust hooks reject accessors/proxies without invoking them', () => {
  let hooks = 0;
  const proxy = new Proxy({}, { ownKeys() { hooks++; return []; }, get() { hooks++; } });
  const getter = { status: 0, stdout: '', stderr: '' }; Object.defineProperty(getter, 'error', { enumerable: true, get() { hooks++; return false; } });
  for (const result of [proxy, getter]) assert.throws(() => planSyntheticNotebookDeskOwnedCleanup('a'.repeat(64), result), /invalid_synthetic_notebook_desk_cleanup/u);
  const hook = new Proxy(() => '{}', { apply() { hooks++; return '{}'; } });
  assert.throws(() => createSyntheticNotebookDeskPostgresExecutor(hook, 'normal'), /invalid_synthetic_notebook_desk_executor/u);
  assert.equal(hooks, 0);
});

test('external query budget blocks the 257th hook invocation without auto work', () => {
  const t = transport(), bridge = createSyntheticNotebookDeskPostgresExecutor(t.execute, 'normal');
  const query = Object.freeze({ text: SQL.current, values: Object.freeze(['0a92002eb20bf7b25d71517674560c3388a01a425b3b3b893f74a54d7f584a82']) });
  for (let i = 0; i < 256; i++) assert.equal(bridge.execute(query).rows[0].notebook_result.revision, 0);
  assert.throws(() => bridge.execute(query), /synthetic_notebook_desk_query_budget_exceeded/u);
  assert.equal(t.calls.length, 256); assert.equal(bridge.witness().queryCount, 256);
});

test('bounded JSON rejects deep and oversized intent before SQL/fault injection', () => {
  let calls = 0;
  const bridge = createSyntheticNotebookDeskPostgresExecutor(() => { calls++; return '{}'; }, 'stale-once');
  for (const raw of ['['.repeat(16)+'0'+']'.repeat(16), 'x'.repeat(524289), 'null']) {
    assert.throws(() => bridge.execute(Object.freeze({ text: SQL.commit, values: Object.freeze([raw]) })), /synthetic_notebook_desk_query_denied/u);
  }
  assert.equal(calls, 0); assert.equal(bridge.witness().alternateCommitInjected, false);
});

test('malformed prepared lineage cannot trigger the scripted alternate SQL commit', () => {
  const t = transport(), bridge = createSyntheticNotebookDeskPostgresExecutor(t.execute, 'stale-once');
  const adapter = createSyntheticNotebookAdapter({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
  const prepared = adapter.prepare(createSyntheticNotebookRequest());
  for (const mutate of [i => { i.intentSha256 = '0'.repeat(64); }, i => { i.governanceBinding.ownerId = 'foreign'; },
    i => { i.extra = 'untrusted'; }, i => { i.body.strokes[0].points[0].x = 0.12345; }]) {
    const intent = structuredClone(prepared.command.intent); mutate(intent);
    assert.throws(() => bridge.execute(Object.freeze({ text: SQL.commit, values: Object.freeze([JSON.stringify(intent)]) })), /synthetic_notebook_desk_query_denied/u);
  }
  assert.equal(t.calls.length, 0); assert.equal(bridge.witness().alternateCommitInjected, false);
});

test('JSON numeric overflow is rejected rather than canonicalized to null', () => {
  const bridge = createSyntheticNotebookDeskPostgresExecutor(() => '{"revision":1e999}', 'normal');
  const query = Object.freeze({ text: SQL.current, values: Object.freeze(['0a92002eb20bf7b25d71517674560c3388a01a425b3b3b893f74a54d7f584a82']) });
  assert.throws(() => bridge.execute(query), /synthetic_notebook_desk_sql_response_invalid/u);
});

for (const scenario of ['normal', 'reply-loss-once']) test(`malformed advanced replay SHA array cannot create success/fault witnesses (${scenario})`, async () => {
  const request = createSyntheticNotebookRequest();
  let fixture;
  const bridge = createSyntheticNotebookDeskPostgresExecutor(() => JSON.stringify({ outcome: 'idempotent_replay',
    receipt: createSyntheticNotebookReceipt(fixture, request), head: { revision: 2, bodySha256: ['a'.repeat(64)] },
    syntheticOnly: true, productionReady: false }), scenario);
  fixture = bridge.sourceFixture;
  const adapter = createSyntheticNotebookAdapter({ sourceFixture: fixture, execute: bridge.execute });
  const prepared = adapter.prepare(request), out = await adapter.commit(prepared.command);
  assert.equal(out.valid, false); assert.equal(out.persisted, null);
  assert.equal(bridge.witness().commitAttemptCount, 1);
  assert.equal(bridge.witness().commitSuccessCount, 0); assert.equal(bridge.witness().replayCount, 0);
  assert.equal(bridge.witness().acceptedCommitCount, 0); assert.equal(bridge.witness().replyLossInjected, false);
});

test('oversized argv token is rejected before matching or launching anything', () => {
  assert.throws(() => parseSyntheticNotebookDeskPostgresArgs(['--container', 'k12-synthetic-notebook-'+ 'a'.repeat(1048576)]), /invalid_synthetic_notebook_desk_postgres_args/u);
});

test('owned lifetime deadline starts before readiness and still cleans exact created ID', () => {
  // Run the actual CLI, replacing only the Docker OS transport and shortening
  // its documented lifetime timer. No Docker daemon, image, account or env.
  // If the lifetime timer is moved after readiness this exits startup_failure.
  const preload = `import child from 'node:child_process'; import {syncBuiltinESMExports} from 'node:module';
    const id='${'a'.repeat(64)}'; let owned=false;
    const ok=(stdout='')=>({status:0,stdout,stderr:''});
    child.spawnSync=(command,args)=>{
      if(command!=='docker') throw new Error('unexpected_command');
      if(args[0]==='image') return ok('{}');
      if(args[0]==='run'){owned=true;return ok(id+'\\n');}
      if(args[0]==='stop'){if(args.at(-1)!==id)throw new Error('not_owned');owned=false;return ok(id+'\\n');}
      if(args[0]==='container'){return owned?ok(id+'\\n'):{status:1,stdout:'',stderr:'Error: No such container: synthetic'};}
      if(args[0]==='exec')return {status:1,stdout:'',stderr:'not_ready'};
      throw new Error('unexpected_transport');};
    syncBuiltinESMExports();const timer=globalThis.setTimeout;
    globalThis.setTimeout=(callback,delay,...args)=>timer(callback,delay===600000?0:delay===200?1:delay,...args);`;
  const out = spawnSync(process.execPath, ['--import', 'data:text/javascript,'+encodeURIComponent(preload),
    'tools/synthetic_notebook_desk_postgres_preview.mjs', '--run', '--port', '0'], { encoding: 'utf8', timeout: 3000, maxBuffer: 16384 });
  assert.equal(out.status, 1, out.stderr);
  const report = JSON.parse(out.stdout.trim());
  assert.equal(report.termination, 'session_deadline');
  assert.equal(report.state, 'deadline_cleanup'); assert.equal(report.containerStopped, true);
  assert.equal(report.databaseProofExecuted, false); assert.equal(report.serverStarted, false);
  assert.equal(report.deadlineIsProofPass, false);
});

test('SIGINT during readiness cancels further SQL probes and never listens', () => {
  const preload = `import child from 'node:child_process'; import {syncBuiltinESMExports} from 'node:module';
    const id='${'a'.repeat(64)}'; let owned=false,afterStop=0;
    const ok=(stdout='')=>({status:0,stdout,stderr:''});
    child.spawnSync=(command,args)=>{
      if(command!=='docker')throw new Error('unexpected_command');
      if(args[0]==='image')return ok('{}');
      if(args[0]==='run'){owned=true;return ok(id+'\\n');}
      if(args[0]==='stop'){if(args.at(-1)!==id)throw new Error('not_owned');owned=false;return ok(id+'\\n');}
      if(args[0]==='container')return owned?ok(id+'\\n'):{status:1,stdout:'',stderr:'Error: No such container: synthetic'};
      if(args[0]==='exec'){if(!owned)afterStop++;return {status:1,stdout:'',stderr:'not_ready'};}
      throw new Error('unexpected_transport');};
    syncBuiltinESMExports();const timer=globalThis.setTimeout;
    globalThis.setTimeout=(callback,delay,...args)=>timer(()=>{if(delay===200)process.emit('SIGINT');callback(...args);},delay===200?0:delay);
    process.on('beforeExit',()=>console.error(JSON.stringify({postCleanupSqlCalls:afterStop})));`;
  const out = spawnSync(process.execPath, ['--import', 'data:text/javascript,'+encodeURIComponent(preload),
    'tools/synthetic_notebook_desk_postgres_preview.mjs', '--run', '--port', '0'], { encoding: 'utf8', timeout: 3000, maxBuffer: 16384 });
  assert.equal(out.status, 1, out.stderr); const report = JSON.parse(out.stdout.trim());
  assert.equal(report.termination, 'SIGINT'); assert.equal(report.containerStopped, true);
  assert.equal(report.serverStarted, false); assert.equal(report.databaseProofExecuted, false);
  assert.equal(JSON.parse(out.stderr.trim()).postCleanupSqlCalls, 0);
});

test('real desk HTTP GET does not execute SQL and saved receipt is not auto-read', async () => {
  const t = transport(), bridge = createSyntheticNotebookDeskPostgresExecutor(t.execute, 'normal');
  const server = createSyntheticNotebookDeskServer({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, body) => {
    const response = await fetch(origin+path, { headers: { Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      method: body ? 'POST' : 'GET', ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json() };
  };
  try {
    const initial = await request('/api/notebook/current'); assert.equal(initial.status, 200); assert.equal(initial.data.state, 'not_read');
    assert.equal(bridge.witness().queryCount, 0);
    const read0 = await request('/api/notebook/read', {}); assert.equal(read0.status, 200); assert.equal(read0.data.view.readProjection.revision, 0);
    const save = await request('/api/notebook/save', createSyntheticNotebookRequest()); assert.equal(save.status, 200); assert.equal(save.data.receipt.resultingRevision, 1);
    assert.equal(save.data.view.readProjection.revision, 0); assert.equal(save.data.view.state, 'read_stale_after_write');
    const previousQueries = bridge.witness().queryCount;
    const current = await request('/api/notebook/current'); assert.equal(current.data.readProjection.revision, 0);
    assert.equal(bridge.witness().queryCount, previousQueries);
    const read1 = await request('/api/notebook/read', {}); assert.equal(read1.data.view.readProjection.revision, 1);
    assert.equal(read1.data.view.realDatabaseVerified, false); assert.equal(read1.data.authentication, 'not_implemented');
    assert.equal(bridge.witness().currentReadCount, 2); assert.equal(bridge.witness().commitSuccessCount, 1);
  } finally { await new Promise(done => { server.close(done); server.closeAllConnections(); }); }
});
