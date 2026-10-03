import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

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
