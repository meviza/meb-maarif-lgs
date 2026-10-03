import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { parseSyntheticNotebookArgs, buildSyntheticNotebookPsqlStatement } from '../tools/test_synthetic_student_notebook_postgres.mjs';

test('adapter SQL proof requires separate explicit opt-in without changing the legacy default', () => {
  assert.deepEqual(parseSyntheticNotebookArgs(['--run', '--adapter', '--container', 'k12-synthetic-notebook-adapter-test']),
    { run: true, container: 'k12-synthetic-notebook-adapter-test', adapter: true });
  assert.deepEqual(parseSyntheticNotebookArgs([]), { run: false, container: 'k12-synthetic-notebook-proof' });
  for (const args of [['--adapter','--adapter'], ['--run','--adapter','--unknown'],
    ['--run','--adapter','--container','postgres'], ['--run','--adapter','--container','k12-synthetic-notebook-test','--extra']])
    assert.throws(() => parseSyntheticNotebookArgs(args), /invalid_synthetic_notebook_args/u);
});

test('adapter-only default invocation reports no database or adapter execution', () => {
  const result = spawnSync(process.execPath, [new URL('../tools/test_synthetic_student_notebook_postgres.mjs', import.meta.url).pathname, '--adapter'],
    { encoding: 'utf8', timeout: 10000, maxBuffer: 32768, shell: false });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { state: 'not_run', syntheticOnly: true, databaseProofExecuted: false,
    productionReady: false, adapterProofRequested: true, adapterProofExecuted: false });
});

test('test-only bridge accepts the three exact typed adapter SQL queries with separate bound values', () => {
  const current = buildSyntheticNotebookPsqlStatement({ text: 'SELECT student_notebook.read_current($1::text) AS notebook_result', values: ['scope-test'] });
  assert.ok(current.startsWith('PREPARE synthetic_notebook_request(text) AS SELECT student_notebook.read_current($1::text)'));
  assert.ok(current.includes("EXECUTE synthetic_notebook_request('scope-test')"));
  const revision = buildSyntheticNotebookPsqlStatement({ text: 'SELECT student_notebook.read_revision($1::text,$2::bigint) AS notebook_result', values: ['scope-test', '2'] });
  assert.ok(revision.startsWith('PREPARE synthetic_notebook_request(text,bigint)'));
  const commit = buildSyntheticNotebookPsqlStatement({ text: 'SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result', values: ['{}'] });
  assert.ok(commit.startsWith('PREPARE synthetic_notebook_request(jsonb)'));
  for (const text of ['SELECT student_notebook.read_current($1::text) AS notebook_result; SELECT 1',
    'SELECT student_notebook.read_current($1::varchar) AS notebook_result'])
    assert.throws(() => buildSyntheticNotebookPsqlStatement({ text, values: ['scope-test'] }), /invalid_synthetic_notebook_query/u);
});
