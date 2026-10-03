import test from 'node:test';
import assert from 'node:assert/strict';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { getReasonedTeachingStage, auditReasonedTeachingTrace } from '../packages/contracts/reasoned_teaching_trace.mjs';

const api = await import('../packages/content-factory/reasoned_concept_lesson.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function create() {
  assert.equal(typeof api.createReasonedPerimeterLessonTrace, 'function', 'concept reasoning adapter not implemented');
  return api.createReasonedPerimeterLessonTrace();
}

// Break caught: treating lesson authoring as one question's answer instead of
// explaining concepts with an equal-area/different-perimeter counterexample.
test('the concept trace explains boundary and covering before a numeric counterexample', () => {
  const trace = create();
  assert.equal(trace.kind, 'concept_lesson');
  assert.equal(trace.goal.unit, 'text');
  assert.deepEqual(trace.steps.slice(0, 4).map(step => ({ value: step.result.value, unit: step.result.unit })), [
    { value: 20, unit: 'cm' }, { value: 24, unit: 'cm²' }, { value: 24, unit: 'cm²' }, { value: 22, unit: 'cm' },
  ]);
  assert.equal(trace.steps[4].operation.kind, 'interpret');
  assert.deepEqual(trace.steps[4].operation.inputIds, ['area-first', 'area-second', 'boundary-first', 'boundary-second']);
  assert.match(trace.steps[4].result.value, /eşit.*alan.*farklı.*çevre/iu);
  assert.ok(trace.plan.conditions.length >= 2);
});

test('the lesson source stays unchanged and its new trace never implies an already voiced video', () => {
  const source = createPerimeterLesson(), before = JSON.stringify(source), trace = create();
  assert.equal(trace.source.id, source.id);
  assert.equal(trace.source.contentSha256, source.contentSha256);
  assert.equal(JSON.stringify(source), before);
  assert.equal(trace.mediaStatus, 'new_narration_not_generated');
  assert.equal(trace.publicationReady, false);
  assert.equal(auditReasonedTeachingTrace(trace).semanticReview, 'pending');
  assert.equal(trace.scope.gradeBand, 'unassigned');
});

test('a new square context has an explicit transferable strategy with its explanation gated', () => {
  const trace = create();
  assert.match(trace.transfer.prompt, /3 cm/u);
  assert.match(trace.transfer.answer, /12 cm/u);
  assert.match(trace.transfer.answer, /9 cm²/u);
  const stageIndex = trace.steps.length + 4;
  assert.equal(getReasonedTeachingStage(trace, { stageIndex }).check.answer, null);
  assert.match(getReasonedTeachingStage(trace, { stageIndex, reveal: true }).check.answer, /12 cm/u);
});
