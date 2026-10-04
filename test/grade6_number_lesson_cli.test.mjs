import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';

const run = args => spawnSync(process.execPath, ['tools/grade6_reference_authoring_plan.mjs', ...args],
  { cwd:new URL('..',import.meta.url), encoding:'utf8', timeout:10000, maxBuffer:524288 });

// Break: the actual entry point never consumes the source-bound three-family sequence.
test('closed source CLI emits the number-unit review with two genuinely different practice tasks', () => {
  const out = run(['--number-unit-review']);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(out.stderr, '');
  const flow = JSON.parse(out.stdout);
  assert.equal(flow.schemaVersion, 'grade6-number-lesson-review/v1');
  assert.equal(flow.workedExample.family, 'joint_divisibility_card_classification');
  assert.equal(flow.selectedQuestions.length, 2);
  assert.equal(new Set(flow.selectedQuestions.map(row => row.family)).size, 2);
  assert.equal(flow.request.count, 10);
  assert.equal(flow.selectionReady, false);
  assert.equal(flow.publicationReady, false);
  assert.equal(flow.learnerReady, false);
});

// Break: the live CLI presents JSON as HTML or invents a full ten-question bank.
test('closed source CLI renders the actual lesson example practice and deficit view', () => {
  const out = run(['--number-unit-review-html']);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(out.stderr, '');
  assert.match(out.stdout, /^<!doctype html>/iu);
  for (const section of ['concepts','worked-example','practice']) assert.ok(out.stdout.includes(`id="${section}"`));
  assert.equal((out.stdout.match(/data-practice-family=/gu) ?? []).length, 2);
  assert.equal((out.stdout.match(/data-difficulty-band=/gu) ?? []).length, 4);
  assert.equal(out.stdout.includes('[object Object]'), false);
});

// Break: adding arbitrary paths/model/count parameters starts unbounded authoring.
test('unit review rejects combined duplicate or live-provider flags before metadata work', () => {
  for (const args of [['--number-unit-review','--number-unit-review-html'],['--number-unit-review','--number-unit-review'],
    ['--number-unit-review','--count','100'],['--number-unit-review-html','--provider','live'],
    ['--number-unit-review','--source','private'],['--number-unit-review-html','--out','private']]) {
    const out = run(args);
    assert.equal(out.status, 1);
    assert.equal(out.stdout, '');
    assert.equal(out.stderr, 'invalid_grade6_reference_authoring_args\n');
  }
});
