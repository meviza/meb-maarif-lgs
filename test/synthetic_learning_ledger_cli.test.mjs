import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { SYNTHETIC_LEARNING_LEDGER_SQL } from '../packages/persistence/synthetic_learning_ledger_adapter.mjs';

const moduleUrl = new URL('../tools/test_synthetic_learning_ledger_postgres.mjs', import.meta.url);
const api = await import(moduleUrl.href).catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function parse(args) {
  assert.equal(typeof api.parseSyntheticLedgerArgs, 'function', 'synthetic PostgreSQL opt-in harness missing');
  return api.parseSyntheticLedgerArgs(args);
}

test('absent explicit run opt-in performs no Docker call or database work', () => {
  parse([]);
  const output = execFileSync(process.execPath, [moduleUrl.pathname], {
    encoding: 'utf8', env: { ...process.env, PATH: '/nonexistent-synthetic-docker-path' }, timeout: 5000,
  });
  const result = JSON.parse(output);
  assert.equal(result.state, 'not_run');
  assert.equal(result.reason, 'explicit_run_required');
  assert.equal(result.databaseOpened, false);
});

test('an opted-in plan permits only its dedicated synthetic name with no host ports or network', () => {
  const options = parse(['--run', '--container', 'k12-synthetic-ledger-ci-001']);
  assert.equal(options.run, true);
  const args = api.buildSyntheticDockerArgs(options);
  assert.equal(args[0], 'run');
  assert.ok(args.includes('--pull=never'));
  assert.ok(args.includes('--network=none'));
  assert.ok(args.includes('--memory=256m'));
  assert.ok(args.includes('--cpus=1'));
  assert.ok(args.includes('--read-only'));
  assert.ok(args.includes('--user=postgres'));
  assert.equal(args.includes('-p'), false);
  assert.equal(args.some(value => value.startsWith('--publish')), false);
  assert.equal(args[args.indexOf('--name') + 1], 'k12-synthetic-ledger-ci-001');
  assert.ok(args.includes('postgres:16.15-alpine'));
});

test('host-container names path traversal and shell-like names fail before any Docker call', () => {
  for (const name of ['egitim-platformu-postgres-1', 'postgres', '../ledger', '-x', 'k12-synthetic-ledger-x;id', 'k12-synthetic-ledger-', 'k12-synthetic-ledger-' + 'x'.repeat(64)]) {
    assert.throws(() => parse(['--run', '--container', name]), /invalid_synthetic_container_name/u);
  }
});

test('unknown duplicate missing-value and malformed flags do not broaden the opt-in', () => {
  for (const args of [['--force'], ['--run', '--run'], ['--container'], ['--container', 'k12-synthetic-ledger-a', '--container', 'k12-synthetic-ledger-b'], ['--run=true'], [null], 'run']) {
    assert.throws(() => parse(args), /invalid_synthetic_ledger_args/u);
  }
});

test('a named but unapproved plan is still a no-op and cannot start a container', () => {
  const options = parse(['--container', 'k12-synthetic-ledger-review']);
  assert.equal(options.run, false);
  assert.throws(() => api.buildSyntheticDockerArgs(options), /explicit_run_required/u);
});

test('the Docker plan validates caller-shaped options instead of trusting a forged run flag', () => {
  assert.throws(() => api.buildSyntheticDockerArgs({ run: true, container: 'egitim-platformu-postgres-1' }), /invalid_synthetic_container_name/u);
  assert.throws(() => api.buildSyntheticDockerArgs({ run: true, container: 'k12-synthetic-ledger-safe', privileged: true }), /invalid_synthetic_ledger_args/u);
});

test('argument accessors and proxies cannot run code while choosing a container', () => {
  let reads = 0;
  const accessor = ['--container', 'k12-synthetic-ledger-safe'];
  Object.defineProperty(accessor, '1', { enumerable: true, get() { reads++; return 'k12-synthetic-ledger-safe'; } });
  const proxy = new Proxy([], { get() { reads++; return 0; } });
  assert.throws(() => parse(accessor), /invalid_synthetic_ledger_args/u);
  assert.throws(() => parse(proxy), /invalid_synthetic_ledger_args/u);
  assert.equal(reads, 0);
});

test('the synthetic psql bridge uses only the adapter allowlist and same-session PREPARE bound values', () => {
  assert.equal(typeof api.buildSyntheticPsqlStatement, 'function', 'bounded synthetic adapter psql bridge missing');
  const text = 'SELECT learning_ledger.replay_receipt($1::jsonb) AS ledger_result';
  const value = JSON.stringify({ receiptId: "quote'; SELECT secret; --" });
  const sql = api.buildSyntheticPsqlStatement({ text, values: [value] });
  assert.ok(sql.startsWith('PREPARE synthetic_adapter_request(jsonb) AS '));
  assert.ok(sql.includes(text));
  assert.ok(sql.includes("quote''; SELECT secret; --"));
  assert.ok(sql.endsWith('DEALLOCATE synthetic_adapter_request;'));
});

test('the synthetic psql bridge rejects identity changes arbitrary SQL accessors proxies and wrong value counts', () => {
  assert.equal(typeof api.buildSyntheticPsqlStatement, 'function', 'bounded synthetic adapter psql bridge missing');
  let reads = 0;
  const getter = { values: ['{}'] }; Object.defineProperty(getter, 'text', { enumerable: true, get() { reads++; return 'SELECT 1'; } });
  for (const query of [getter, new Proxy({}, { ownKeys() { reads++; return []; } }), { text: 'SET ROLE postgres; SELECT 1', values: [] },
    { text: 'SELECT learning_ledger.replay_receipt($1::jsonb) AS ledger_result', values: [] },
    { text: 'SELECT learning_ledger.replay_receipt($1::jsonb) AS ledger_result', values: ['{}'], dbRole: 'postgres' }]) {
    assert.throws(() => api.buildSyntheticPsqlStatement(query), /invalid_synthetic_adapter_query/u);
  }
  assert.equal(reads, 0);
});

test('the snapshot-window bridge binds eight fixed parameters and refuses range or role injection', () => {
  assert.equal(typeof SYNTHETIC_LEARNING_LEDGER_SQL.activityWindow, 'string', 'activity-window SQL missing');
  const text = SYNTHETIC_LEARNING_LEDGER_SQL.activityWindow;
  const values = ['ledgerstream_000000000001', 'a'.repeat(64), 'stream_000000000001', 'batch_000000000001', 'idem_000000000001', 'b'.repeat(64), '41', '42'];
  const sql = api.buildSyntheticPsqlStatement({ text, values });
  assert.ok(sql.startsWith('PREPARE synthetic_adapter_request(text,text,text,text,text,text,bigint,bigint) AS '));
  for (const query of [{ text, values: values.slice(0, 7) }, { text: text + '; SET ROLE postgres', values }, { text, values, role: 'postgres' }]) {
    assert.throws(() => api.buildSyntheticPsqlStatement(query), /invalid_synthetic_adapter_query/u);
  }
});
