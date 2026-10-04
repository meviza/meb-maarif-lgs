import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const file = fileURLToPath(new URL('../tools/grade6_reference_authoring_plan.mjs', import.meta.url));
const run = args => spawnSync(process.execPath, [file, ...args], { encoding: 'utf8', timeout: 6000, maxBuffer: 524288 });

// Break: the normal source-authoring entry point still cannot emit the new verified task.
test('divisibility opt-in connects the real fixed source planner to one independently verified draft', () => {
  const out = run(['--divisibility-draft']);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(out.stderr, '');
  const value = JSON.parse(out.stdout);
  assert.equal(value.schemaVersion, 'grade6-divisibility-classification-preview/v1');
  assert.equal(value.verification.valid, true);
  assert.deepEqual(value.draft.problem.cards.map(card => card.value), [14,21,24,25,32,33,42,47]);
  assert.deepEqual(value.verification.recomputed.correctGroups.map(group => group.cardIds), [['card-14','card-32'],['card-21','card-33'],['card-24','card-42'],['card-25','card-47']]);
});

// Break: the HTML consumer produces a JSON dump or omits the given task or solution.
test('divisibility HTML opt-in delivers actual Turkish editor HTML with no network or media output', () => {
  const out = run(['--divisibility-html']);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(out.stderr, '');
  assert.match(out.stdout, /^<!doctype html><html lang="tr">/u);
  assert.equal([...out.stdout.matchAll(/class="number-card"/gu)].length, 8);
  assert.equal([...out.stdout.matchAll(/class="category"/gu)].length, 4);
  assert.equal([...out.stdout.matchAll(/<details>/gu)].length, 1);
  assert.ok(Buffer.byteLength(out.stdout) < 65536);
  assert.equal(/<script\b|<iframe\b|<img\b|<video\b|<audio\b/iu.test(out.stdout), false);
});

// Break: new flags let callers substitute a source, count, provider, or output path.
test('divisibility consumer rejects mixed duplicated and authority-bearing options before output', () => {
  for (const flag of ['--divisibility-draft','--divisibility-html']) {
    for (const tail of [[flag],['--plan'],['--factor-html'],['--count','100'],['--source','private'],['--out','private'],['--provider','clef'],['--reveal']]) {
      const out = run([flag, ...tail]);
      assert.equal(out.status, 1);
      assert.equal(out.stdout, '');
      assert.equal(out.stderr.trim(), 'invalid_grade6_reference_authoring_args');
    }
  }
});
