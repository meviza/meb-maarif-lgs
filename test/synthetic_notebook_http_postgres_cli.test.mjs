import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseSyntheticNotebookArgs } from '../tools/test_synthetic_student_notebook_postgres.mjs';

test('notebook HTTP database proof requires all explicit adapter and application opt-ins', () => {
  assert.deepEqual(parseSyntheticNotebookArgs(['--adapter', '--application', '--http']), {
    run: false, container: 'k12-synthetic-notebook-proof', adapter: true, application: true, http: true });
  assert.deepEqual(parseSyntheticNotebookArgs(['--http', '--run', '--adapter', '--application', '--container', 'k12-synthetic-notebook-http-test']), {
    run: true, container: 'k12-synthetic-notebook-http-test', adapter: true, application: true, http: true });
  for (const args of [['--http'], ['--adapter', '--http'], ['--application', '--http'],
    ['--adapter', '--application', '--http', '--http']]) assert.throws(() => parseSyntheticNotebookArgs(args), /invalid_synthetic_notebook_args/u);
});

test('HTTP proof without run reports no database or server execution', () => {
  const file = fileURLToPath(new URL('../tools/test_synthetic_student_notebook_postgres.mjs', import.meta.url));
  const outcome = spawnSync(process.execPath, [file, '--adapter', '--application', '--http'], { encoding: 'utf8', timeout: 3000 });
  assert.equal(outcome.status, 0); assert.equal(outcome.stderr, '');
  const record = JSON.parse(outcome.stdout);
  assert.equal(record.databaseProofExecuted, false); assert.equal(record.adapterProofExecuted, false);
  assert.equal(record.applicationProofExecuted, false); assert.equal(record.httpProofRequested, true);
  assert.equal(record.httpProofExecuted, false); assert.equal(record.productionReady, false);
});
