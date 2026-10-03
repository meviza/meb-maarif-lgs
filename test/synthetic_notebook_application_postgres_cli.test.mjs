import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { parseSyntheticNotebookArgs } from '../tools/test_synthetic_student_notebook_postgres.mjs';

test('application SQL proof requires its adapter prerequisite and preserves prior modes', () => {
  assert.deepEqual(parseSyntheticNotebookArgs(['--run', '--adapter', '--application', '--container', 'k12-synthetic-notebook-app-test']),
    { run: true, container: 'k12-synthetic-notebook-app-test', adapter: true, application: true });
  assert.deepEqual(parseSyntheticNotebookArgs(['--adapter']), { run: false, container: 'k12-synthetic-notebook-proof', adapter: true });
  for (const args of [['--application'], ['--run', '--application'], ['--adapter', '--application', '--application'],
    ['--run', '--adapter', '--application', '--container', 'other'], ['--adapter', '--application', '--extra']])
    assert.throws(() => parseSyntheticNotebookArgs(args), /invalid_synthetic_notebook_args/u);
});

test('application opt-in without run honestly executes neither application nor database', () => {
  const outcome = spawnSync(process.execPath, [new URL('../tools/test_synthetic_student_notebook_postgres.mjs', import.meta.url).pathname,
    '--adapter', '--application'], { encoding: 'utf8', timeout: 10000, maxBuffer: 32768 });
  assert.equal(outcome.status, 0, outcome.stderr);
  assert.deepEqual(JSON.parse(outcome.stdout), { state: 'not_run', syntheticOnly: true, databaseProofExecuted: false,
    productionReady: false, adapterProofRequested: true, adapterProofExecuted: false,
    applicationProofRequested: true, applicationProofExecuted: false });
});
