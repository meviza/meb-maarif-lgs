import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createSyntheticNotebookRequest as request, hashSyntheticNotebook as hash } from './support/synthetic_notebook_fixture.mjs';
import { SYNTHETIC_NOTEBOOK_ADAPTER_SQL as sql } from '../packages/contracts/synthetic_notebook_adapter.mjs';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
const api = await import('../tools/synthetic_notebook_desk_preview.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error;
});
const parse = value => { assert.equal(typeof api.parseSyntheticNotebookDeskPreviewArgs, 'function'); return api.parseSyntheticNotebookDeskPreviewArgs(value); };
const create = value => { assert.equal(typeof api.createSyntheticNotebookDeskPreviewExecutor, 'function'); return api.createSyntheticNotebookDeskPreviewExecutor(value); };

test('desk preview CLI preserves the IPv4 default and original unique argument pairs', () => {
  assert.deepEqual(parse([]), { host: '127.0.0.1', port: 3340, scenario: 'normal' });
  assert.deepEqual(parse(['--scenario', 'reply-loss', '--port', '0']), { host: '127.0.0.1', port: 0, scenario: 'reply-loss' });
  assert.deepEqual(parse(['--port', '65535', '--scenario', 'normal']), { host: '127.0.0.1', port: 65535, scenario: 'normal' });
  assert.equal(Object.isFrozen(parse([])), true);
  for (const value of [['--host', '0.0.0.0'], ['--port', '80'], ['--scenario', 'real-db'], ['--file', 'anything'],
    ['--port', '01'], ['--port', '65536'], ['--scenario', 'normal', '--scenario', 'reply-loss'], ['--port', '0', '--port', '0'], ['--port']])
    assert.throws(() => parse(value), /invalid_synthetic_notebook_desk_preview_args/u);
});

test('desk CLI inert argv rejects getters proxies revoked proxies symbols and sparse arrays without hooks', () => {
  let hooks = 0; const getter = [];
  Object.defineProperty(getter, '0', { enumerable: true, get() { hooks++; return '--port'; } }); getter.length = 2;
  const proxy = new Proxy([], { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  const revoked = Proxy.revocable([], {}); revoked.revoke();
  const symbols = []; symbols[Symbol('extra')] = 'extra';
  for (const value of [null, {}, getter, proxy, revoked.proxy, symbols, new Array(2)])
    assert.throws(() => parse(value), error => error.message === 'invalid_synthetic_notebook_desk_preview_args');
  assert.equal(hooks, 0);
});

test('fixed memory executor supplies real adapter-shaped rows but never claims database authority', () => {
  const options = create('normal'), { sourceFixture, execute } = options;
  assert.equal(Object.isFrozen(options), true); assert.equal(Object.isFrozen(sourceFixture.scope), true);
  const scope = hash('scope', sourceFixture.scope);
  const current = () => execute(Object.freeze({ text: sql.current, values: Object.freeze([scope]) })).rows[0].notebook_result;
  assert.equal(current().revision, 0); assert.equal(current().body, null);
  const req = request(), intent = createSyntheticNotebookSyncPreparer(sourceFixture).prepare(req).intent;
  const query = Object.freeze({ text: sql.commit, values: Object.freeze([JSON.stringify(intent)]) });
  const write = execute(query).rows[0].notebook_result;
  assert.equal(write.outcome, 'accepted'); assert.equal(write.receipt.resultingRevision, 1);
  assert.deepEqual(current().body, req.body); assert.equal(current().syntheticOnly, true); assert.equal(current().productionReady, false);
  const replay = execute(query).rows[0].notebook_result;
  assert.equal(replay.outcome, 'idempotent_replay'); assert.deepEqual(replay.receipt, write.receipt); assert.equal(current().revision, 1);
  const other = create('normal'); assert.equal(other.execute(Object.freeze({text:sql.current,values:Object.freeze([scope])})).rows[0].notebook_result.revision, 0);
});

test('memory reply-loss commits exactly once then throws and only a later explicit read can observe it', () => {
  const { sourceFixture, execute } = create('reply-loss'), req = request();
  const intent = createSyntheticNotebookSyncPreparer(sourceFixture).prepare(req).intent;
  const query = Object.freeze({ text: sql.commit, values: Object.freeze([JSON.stringify(intent)]) });
  assert.throws(() => execute(query), error => error.message === 'synthetic_memory_reply_loss');
  const read = execute(Object.freeze({ text: sql.current, values: Object.freeze([hash('scope', sourceFixture.scope)]) }));
  assert.equal(read.rows[0].notebook_result.revision, 1); assert.deepEqual(read.rows[0].notebook_result.body, req.body);
  const replay = execute(query).rows[0].notebook_result;
  assert.equal(replay.outcome, 'idempotent_replay'); assert.equal(replay.head.revision, 1);
});

test('preview executor rejects unknown scenario or caller SQL/scope and conflicting mutation without new writes', () => {
  for (const scenario of [undefined, null, {}, 'real-db']) assert.throws(() => create(scenario), /invalid_synthetic_notebook_preview_scenario/u);
  const {sourceFixture,execute} = create('normal'), req = request(), preparer = createSyntheticNotebookSyncPreparer(sourceFixture);
  const intent = preparer.prepare(req).intent, make = intent => Object.freeze({ text: sql.commit, values: Object.freeze([JSON.stringify(intent)]) });
  for (const query of [{text:'DROP TABLE anything',values:[]}, Object.freeze({text:sql.current,values:Object.freeze(['wrong-scope'])}),
    Object.freeze({text:sql.historical,values:Object.freeze([])})]) assert.throws(() => execute(query), /synthetic_memory_query_denied/u);
  execute(make(intent));
  const changed = structuredClone(req); changed.body.text = 'Different body with same mutation and key';
  assert.throws(() => execute(make(preparer.prepare(changed).intent)), error => error.code === '23505');
  assert.equal(execute(Object.freeze({text:sql.current,values:Object.freeze([hash('scope',sourceFixture.scope)])})).rows[0].notebook_result.revision, 1);
});

test('invalid desk CLI arguments stop before source or server startup with a constant error', () => {
  const file = fileURLToPath(new URL('../tools/synthetic_notebook_desk_preview.mjs', import.meta.url));
  const out = spawnSync(process.execPath, [file, '--scenario', 'real-db'], {encoding:'utf8',timeout:3000});
  assert.equal(out.status, 1); assert.equal(out.stdout, ''); assert.equal(out.stderr.trim(), 'invalid_synthetic_notebook_desk_preview_args');
});

// Break: the preview cannot bind its already-supported canonical IPv6 boundary.
test('host flag selects only canonical loopback and keeps IPv4 default', () => {
  let result;
  try { result = parse(['--host', '::1']); }
  catch { assert.fail('canonical IPv6 host flag is not supported'); }
  assert.deepEqual(result, { host: '::1', port: 3340, scenario: 'normal' });
  assert.deepEqual(parse(['--host', '127.0.0.1']), { host: '127.0.0.1', port: 3340, scenario: 'normal' });
  assert.deepEqual(parse([]), { host: '127.0.0.1', port: 3340, scenario: 'normal' });
});

// Break: all three accepted pairs are rejected, ignored, or depend on argument order.
test('six inert arguments preserve selected host port and reply-loss scenario in any pair order', () => {
  const pairs = [['--host', '::1'], ['--port', '0'], ['--scenario', 'reply-loss']];
  for (const order of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) {
    let result;
    try { result = parse(order.flatMap(index => pairs[index])); }
    catch { assert.fail('all three unique canonical flags must be supported'); }
    assert.deepEqual(result, { host: '::1', port: 0, scenario: 'reply-loss' });
    assert.equal(Object.isFrozen(result), true);
  }
});

// Break: adding --host widens bind targets or accepts duplicates/extra input.
test('wildcards aliases foreign addresses duplicate hosts and extra pairs stop before listen', () => {
  const file = fileURLToPath(new URL('../tools/synthetic_notebook_desk_preview.mjs', import.meta.url));
  const bad = ['localhost', '0.0.0.0', '::', '[::1]', '::ffff:127.0.0.1', '127.0.0.2', 'example.invalid', ' ::1', '::1 '];
  const rejected = [...bad.map(host => ['--host', host]), ['--host', '::1', '--host', '127.0.0.1'],
    ['--host', '::1', '--port', '0', '--scenario', 'normal', '--extra', 'x']];
  for (const argv of rejected) {
    assert.throws(() => parse(argv), /invalid_synthetic_notebook_desk_preview_args/u);
    const out = spawnSync(process.execPath, [file, ...argv], { encoding: 'utf8', timeout: 3000 });
    assert.equal(out.status, 1); assert.equal(out.stdout, '');
    assert.equal(out.stderr.trim(), 'invalid_synthetic_notebook_desk_preview_args');
  }
});

// Break: the extended six-argument path executes a descriptor hook or accepts hidden arguments.
test('six argument descriptor validation rejects getter sparse symbol and non-enumerable entries', () => {
  let hooks = 0;
  const getter = ['--host', '::1', '--port', '0', '--scenario', 'normal'];
  Object.defineProperty(getter, '1', { enumerable: true, get() { hooks++; return '::1'; } });
  const sparse = ['--host', '::1', '--port', '0', '--scenario', 'normal']; delete sparse[5];
  const hidden = ['--host', '::1', '--port', '0', '--scenario', 'normal']; Object.defineProperty(hidden, '1', { enumerable: false });
  const symbols = ['--host', '::1', '--port', '0', '--scenario', 'normal']; symbols[Symbol('extra')] = 'x';
  for (const argv of [getter, sparse, hidden, symbols]) assert.throws(() => parse(argv), /invalid_synthetic_notebook_desk_preview_args/u);
  assert.equal(hooks, 0);
});

async function startCli(t, scenario = 'normal') {
  const file = fileURLToPath(new URL('../tools/synthetic_notebook_desk_preview.mjs', import.meta.url));
  const child = spawn(process.execPath, [file, '--host', '::1', '--port', '0', '--scenario', scenario], { stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '', stderr = '', done = false;
  const exit = new Promise(resolve => child.once('exit', (code, signal) => { done = true; resolve({ code, signal }); }));
  t.after(async () => { if (!done) child.kill('SIGINT'); await exit; assert.equal(stderr, ''); });
  child.stderr.on('data', chunk => { stderr += String(chunk); });
  const ready = await new Promise(resolve => {
    const deadline = setTimeout(() => { if (!done) child.kill('SIGKILL'); resolve(null); }, 3000);
    child.once('exit', () => { clearTimeout(deadline); resolve(null); });
    child.stdout.on('data', chunk => {
      output += String(chunk);
      if (output.length > 32768) { child.kill('SIGKILL'); clearTimeout(deadline); resolve(null); return; }
      const newline = output.indexOf('\n');
      if (newline !== -1) { clearTimeout(deadline); try { resolve(JSON.parse(output.slice(0, newline))); } catch { resolve(null); } }
    });
  });
  assert.ok(ready?.state === 'synthetic_notebook_desk_memory_preview', 'real IPv6 CLI must announce readiness before requests');
  assert.match(ready.url, /^http:\/\/\[::1\]:[1-9]\d{3,4}\/$/u);
  return { ready, child, exit, stop: async () => { child.kill('SIGINT'); const result = await exit; assert.deepEqual(result, { code: 0, signal: null }); } };
}
function wire(url, path = '/', { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(new URL(path, url), { method, headers }, res => {
      const chunks = []; let length = 0;
      res.on('data', chunk => { length += chunk.length; if (length > 524288) req.destroy(new Error('test_output_budget')); else chunks.push(chunk); });
      res.once('end', () => { const text = Buffer.concat(chunks).toString('utf8'); resolve({ status: res.statusCode, headers: res.headers, text,
        json: res.headers['content-type']?.startsWith('application/json') && text ? JSON.parse(text) : null }); });
    });
    req.setTimeout(3000, () => req.destroy(new Error('test_deadline'))); req.once('error', reject); req.end(body);
  });
}

// Break: the printed URL is non-canonical or the new bind weakens existing HTTP policy.
test('real IPv6 CLI serves fixed assets and unread current while rejecting Cookie alias Host and HEAD', async t => {
  const run = await startCli(t), url = run.ready.url;
  assert.equal(run.ready.realDatabaseVerified, false); assert.equal(run.ready.syntheticOnly, true);
  for (const path of ['/', '/notebook-desk.css', '/notebook-desk.mjs']) {
    const out = await wire(url, path); assert.equal(out.status, 200);
    assert.match(out.headers['content-security-policy'], /default-src 'none'/u);
    assert.equal(Object.hasOwn(out.headers, 'access-control-allow-origin'), false);
  }
  const current = await wire(url, '/api/notebook/current'); assert.equal(current.status, 200);
  assert.equal(current.json.state, 'not_read'); assert.equal(current.json.readProjection, null);
  const cookie = await wire(url, '/', { headers: { Cookie: 'synthetic-test-cookie=1' } });
  assert.equal(cookie.status, 400); assert.equal(cookie.json.error.code, 'closed_request_headers_required');
  assert.equal((await wire(url, '/', { method: 'HEAD' })).status, 405);
  assert.equal((await wire(url, '/', { method: 'OPTIONS' })).status, 405);
  assert.equal((await wire(url, '/', { headers: { Host: `localhost:${new URL(url).port}` } })).status, 403);
  await run.stop();
});

// Break: changing host breaks explicit read, reply-loss or same-origin checks.
test('real IPv6 reply-loss retains explicit recovery and does not accept a cross-origin read', async t => {
  const run = await startCli(t, 'reply-loss'), url = run.ready.url, origin = new URL(url).origin;
  const post = (path, body, declared = origin) => wire(url, `/api/notebook/${path}`, { method: 'POST',
    headers: { Origin: declared, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const foreign = await post('read', {}, 'http://127.0.0.1:3340'); assert.equal(foreign.status, 403);
  assert.equal(foreign.json.error.code, 'same_origin_required');
  const read = await post('read', {}); assert.equal(read.status, 200); assert.equal(read.json.view.readProjection.revision, 0);
  const req = request(), unknown = await post('save', req);
  assert.equal(unknown.status, 503); assert.equal(unknown.json.persisted, null); assert.equal(unknown.json.receipt, null);
  assert.equal(unknown.json.automaticRead, false); assert.equal(unknown.json.automaticRetry, false);
  const recovered = await post('read', {}); assert.equal(recovered.status, 200);
  assert.equal(recovered.json.view.readProjection.revision, 1); assert.deepEqual(recovered.json.view.readProjection.body, req.body);
  assert.equal(recovered.json.view.realDatabaseVerified, false);
  await run.stop();
});
