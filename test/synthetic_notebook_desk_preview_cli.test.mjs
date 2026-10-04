import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSyntheticNotebookRequest as request, hashSyntheticNotebook as hash } from './support/synthetic_notebook_fixture.mjs';
import { SYNTHETIC_NOTEBOOK_ADAPTER_SQL as sql } from '../packages/contracts/synthetic_notebook_adapter.mjs';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
const api = await import('../tools/synthetic_notebook_desk_preview.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error;
});
const parse = value => { assert.equal(typeof api.parseSyntheticNotebookDeskPreviewArgs, 'function'); return api.parseSyntheticNotebookDeskPreviewArgs(value); };
const create = value => { assert.equal(typeof api.createSyntheticNotebookDeskPreviewExecutor, 'function'); return api.createSyntheticNotebookDeskPreviewExecutor(value); };

test('desk preview CLI keeps fixed loopback and accepts only two inert unique pairs', () => {
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
