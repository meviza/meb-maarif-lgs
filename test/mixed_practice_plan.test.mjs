import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createPilotBatch, createRectangleQuestion, validateQuestion } from '../packages/content-factory/pilot.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';

const moduleUrl = new URL('../packages/content-factory/mixed_practice_plan.mjs', import.meta.url);
const exampleProfile = { introductory: 10, intermediate: 30, advanced: 30, challenge: 30 };
const previewProfile = { introductory: 50, intermediate: 50, advanced: 0, challenge: 0 };
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function api() {
  assert.ok(existsSync(moduleUrl), 'source-bound mixed practice selection is not implemented');
  return import(moduleUrl);
}
function input(overrides = {}) {
  return { lesson: createPerimeterLesson(), candidates: createPilotBatch({ requested: 12 }).items,
    request: { count: 6, seed: 'lesson-mixed-v1', scope: { grade: null, programVersion: null }, exampleFamily: 'perimeter',
      difficultyProfile: { ...previewProfile }, quotas: { skills: [], families: [], formats: [] }, ...overrides } };
}

// Catches using percentages as item counts, losing fractional remainder slots,
// or quietly imposing this caller-selected example as an age policy.
test('integer difficulty allocation uses largest remainder for the explicitly requested profile', async () => {
  const { apportionDifficultyQuota } = await api();
  assert.deepEqual(apportionDifficultyQuota(10, exampleProfile), { introductory: 1, intermediate: 3, advanced: 3, challenge: 3 });
  assert.deepEqual(apportionDifficultyQuota(20, exampleProfile), { introductory: 2, intermediate: 6, advanced: 6, challenge: 6 });
  assert.deepEqual(apportionDifficultyQuota(3, exampleProfile), { introductory: 0, intermediate: 1, advanced: 1, challenge: 1 });
  assert.deepEqual(apportionDifficultyQuota(7, exampleProfile), { introductory: 1, intermediate: 2, advanced: 2, challenge: 2 });
  assert.deepEqual(apportionDifficultyQuota(6, previewProfile), { introductory: 3, intermediate: 3, advanced: 0, challenge: 0 });
});

// Catches numeric variants inflating diversity and reusing the exact teaching
// question in the test rather than following lesson -> one example -> practice.
test('a six-family preview has one reasoned example and no repeated family or exact example revision', async () => {
  const { createMixedPracticePlan } = await api(); const plan = createMixedPracticePlan(input());
  assert.equal(plan.workedExample.family, 'perimeter'); assert.equal(plan.workedExample.reasonedTrace.kind, 'question_solution');
  assert.equal(plan.workedExample.reasonedTrace.source.contentSha256, plan.workedExample.source.contentSha256);
  assert.equal(plan.selectedCount, 6); assert.equal(plan.semanticFamilyCount, 6);
  assert.equal(new Set(plan.selectedQuestions.map(item => item.family)).size, 6);
  assert.ok(plan.selectedQuestions.every(item => item.source.id !== plan.workedExample.source.id || item.source.contentSha256 !== plan.workedExample.source.contentSha256));
  assert.deepEqual(plan.selectedDifficultyCounts, { introductory: 3, intermediate: 3, advanced: 0, challenge: 0 });
  assert.equal(plan.selectionState, 'review_plan_ready'); assert.equal(plan.selectionReady, true);
  assert.equal(plan.publicationReady, false); assert.equal(plan.learnerReady, false); assert.equal(plan.productionReady, false);
  assert.equal(plan.candidatePool.candidateCount, 12); assert.equal(plan.candidatePool.distinctFamilyCount, 6);
  assert.deepEqual(plan.sequence.map(stage => stage.stage), ['concept_lesson', 'reasoned_worked_example', 'mixed_test']);
});

// Catches filling missing advanced/challenge slots with easy variants or
// rebranding author-estimated bands as measured or publication-ready items.
test('the example ten-question profile stays blocked when advanced and challenge families are absent', async () => {
  const { createMixedPracticePlan } = await api(); const plan = createMixedPracticePlan(input({ count: 10, difficultyProfile: exampleProfile }));
  assert.equal(plan.selectionState, 'blocked_review_plan'); assert.equal(plan.selectionReady, false);
  assert.equal(plan.difficultyProfileMet, false); assert.equal(plan.selectedCount, 4);
  assert.deepEqual(plan.selectedDifficultyCounts, { introductory: 1, intermediate: 3, advanced: 0, challenge: 0 });
  assert.equal(plan.deficits.find(row => row.dimension === 'difficulty' && row.id === 'advanced').missing, 3);
  assert.equal(plan.deficits.find(row => row.dimension === 'difficulty' && row.id === 'challenge').missing, 3);
  assert.equal(plan.deficits.find(row => row.dimension === 'count').missing, 6);
  assert.equal(plan.dataAuthorEstimated, true); assert.equal(plan.dataMeasured, false);
  assert.equal(plan.publicationReady, false); assert.equal(plan.learnerReady, false); assert.equal(plan.productionReady, false);
  assert.equal(plan.scopeAlignment, 'unresolved_editor_scope_not_grade_assignment');
  assert.equal(plan.difficultyPolicy, 'caller_requested_not_universal_age_policy');
});

// Catches a large single-template pool being called a varied six-question test
// merely because the width, identifier or numeric answer is different.
test('one hundred numeric variants remain one eligible semantic family', async () => {
  const { createMixedPracticePlan } = await api(); const data = input({ difficultyProfile: { introductory: 100, intermediate: 0, advanced: 0, challenge: 0 } });
  data.candidates = Array.from({ length: 100 }, (_, index) => createRectangleQuestion({ id: `variant-${index}`, template: 'perimeter', width: index + 1, height: 2 }));
  const plan = createMixedPracticePlan(data);
  assert.equal(plan.candidatePool.candidateCount, 100); assert.equal(plan.candidatePool.distinctFamilyCount, 1);
  assert.equal(plan.selectedCount, 1); assert.equal(plan.semanticFamilyCount, 1); assert.equal(plan.selectionReady, false);
  assert.equal(plan.deficits.find(row => row.dimension === 'count').missing, 5);
});

// Catches a deterministic planner depending on caller array order or ignoring
// its seed; source revisions, not mutable IDs alone, bind the plan digest.
test('same seed and pool are order-independent while changed seeds can choose different revisions or order', async () => {
  const { createMixedPracticePlan } = await api(); const data = input();
  const first = createMixedPracticePlan(data), reversed = createMixedPracticePlan({ ...data, candidates: [...data.candidates].reverse() });
  assert.equal(first.contentSha256, reversed.contentSha256);
  const choices = new Set(Array.from({ length: 8 }, (_, index) => {
    const plan = createMixedPracticePlan(input({ seed: `seed-${index}` }));
    return JSON.stringify([plan.workedExample.source, plan.selectedQuestions.map(item => item.source)]);
  }));
  assert.ok(choices.size > 1);
});

// Catches satisfying a requested family/skill/format distribution by ignoring
// an absent format or repeating a family to fill the remaining quota.
test('family skill and format quotas are enforced together and unmet targets stay explicit', async () => {
  const { createMixedPracticePlan } = await api();
  const families = ['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap'];
  const skills = ['boundary_length', 'unit_square_area', 'inverse_area', 'inverse_perimeter', 'distinguish_area_perimeter', 'boundary_with_gap'];
  const ready = createMixedPracticePlan(input({ quotas: { families: families.map(id => ({ id, count: 1 })), skills: skills.map(id => ({ id, count: 1 })), formats: [{ id: 'visual_mcq', count: 6 }] } }));
  assert.equal(ready.quotasMet, true); assert.equal(ready.selectedCount, 6);
  assert.ok(Object.values(ready.quotaReport).flat().every(row => row.missing === 0));
  const repeated = createMixedPracticePlan(input({ quotas: { skills: [], formats: [], families: [{ id: 'perimeter', count: 2 }, { id: 'area', count: 1 }, { id: 'width_from_area', count: 1 }, { id: 'width_from_perimeter', count: 1 }, { id: 'fence_gap', count: 1 }] } }));
  assert.equal(repeated.selectionReady, false); assert.equal(repeated.selectedCount, 5);
  assert.equal(repeated.deficits.find(row => row.dimension === 'families' && row.id === 'perimeter').missing, 1);
  const missingFormat = createMixedPracticePlan(input({ quotas: { skills: [], families: [], formats: [{ id: 'visual_open_response', count: 6 }] } }));
  assert.equal(missingFormat.selectedCount, 0); assert.equal(missingFormat.selectionReady, false);
  assert.equal(missingFormat.deficits.find(row => row.dimension === 'formats').missing, 6);
});

// Catches using an unresolved prototype in a real grade/program scope, stale
// source content, caller difficulty relabelling or a caller-approved review.
test('scope mismatches stale sources and invented difficulty or approval claims fail closed', async () => {
  const { createMixedPracticePlan } = await api();
  for (const scope of [{ grade: 6, programVersion: null }, { grade: null, programVersion: 'tymm-2026' }, { grade: 6, programVersion: 'tymm-2026' }]) {
    assert.throws(() => createMixedPracticePlan(input({ scope })), /mixed_scope_mismatch/u);
  }
  for (const mutate of [
    data => { data.candidates[0].options[data.candidates[0].answerIndex] += 1; },
    data => { data.candidates[0].difficulty.level = 'advanced'; },
    data => { data.candidates[0].state = 'expert_approved'; },
    data => { data.candidates[0].review.publishReady = true; },
    data => { data.lesson = { ...data.lesson, title: 'changed without source revision' }; },
  ]) {
    const data = structuredClone(input()); mutate(data);
    assert.throws(() => createMixedPracticePlan(data), /mixed_(?:invalid|unverified|noncanonical|source)/u);
  }
});

// Catches leaking input mutation through a returned source or treating a
// hashed review artifact as proof of empirical difficulty or learner progress.
test('source snapshots are immutable and hashes bind the lesson example request and selected revisions', async () => {
  const { createMixedPracticePlan } = await api(); const data = input(); const before = JSON.stringify(data);
  const plan = createMixedPracticePlan(data); assert.equal(JSON.stringify(data), before);
  assert.ok(Object.isFrozen(plan)); assert.ok(Object.isFrozen(plan.selectedQuestions[0].question));
  assert.throws(() => { plan.selectedQuestions[0].question.prompt = 'overwrite'; }, TypeError);
  const { contentSha256, ...body } = plan; assert.equal(contentSha256, sha(body));
  assert.equal(plan.lessonSource.contentSha256, data.lesson.contentSha256);
  assert.equal(plan.modelCalls, 0); assert.equal(plan.egress, 'none'); assert.equal(plan.learnerEvidence, 'none_collected');
  assert.equal(plan.expertReview, 'pending'); assert.equal(plan.curriculumReview, 'pending'); assert.equal(plan.rightsReview, 'pending');
});

// Catches accepting unknown/compound keys, invoking data hooks or silently
// truncating huge inputs; all source data crosses the same plain-data guard.
test('unknown fields hooks cycles and bounded request failures are rejected without execution', async () => {
  const { createMixedPracticePlan, apportionDifficultyQuota } = await api();
  for (const mutate of [
    data => { data.studentId = 'not allowed'; }, data => { data.request.model = 'not allowed'; },
    data => { data.candidates[0].token = 'not allowed'; }, data => { data.request.count = 101; },
    data => { data.request.seed = ''; }, data => { data.request.scope.grade = 0; },
    data => { data.request.quotas.families = [{ id: 'perimeter', count: 1 }]; },
    data => { data.request.quotas.formats = [{ id: 'visual_mcq', count: 3 }, { id: 'visual_mcq', count: 3 }]; },
    data => { data.candidates.push(structuredClone(data.candidates[0])); },
  ]) {
    const data = structuredClone(input()); mutate(data);
    assert.throws(() => createMixedPracticePlan(data), /mixed_/u);
  }
  for (const profile of [{ introductory: 20, intermediate: 30, advanced: 30, challenge: 30 }, { 'introductory,intermediate': 50, advanced: 0, challenge: 0 }, { introductory: 0.5, intermediate: 99.5, advanced: 0, challenge: 0 }]) {
    assert.throws(() => apportionDifficultyQuota(10, profile), /mixed_/u);
  }
  let calls = 0; const hook = input();
  Object.defineProperty(hook.candidates[0], 'prompt', { enumerable: true, get() { calls++; return 'not safe'; } });
  assert.throws(() => createMixedPracticePlan(hook), /mixed_invalid_data/u);
  const proxy = new Proxy({}, { ownKeys() { calls++; throw Error('trap'); } });
  assert.throws(() => createMixedPracticePlan(proxy), /mixed_invalid_data/u); assert.equal(calls, 0);
  const cyclic = input(); cyclic.self = cyclic; assert.throws(() => createMixedPracticePlan(cyclic), /mixed_invalid_data/u);
  assert.throws(() => createMixedPracticePlan({ ...input(), candidates: Array(101).fill(input().candidates[0]) }), /mixed_/u);
});

// Catches trusting a freshly recomputed source digest as authorization to
// relabel a current pilot template into a difficulty band it never authored.
test('a rehashed mathematically valid pilot cannot manufacture an advanced difficulty family', async () => {
  const { createMixedPracticePlan } = await api(); const data = structuredClone(input());
  const question = data.candidates[0]; delete question.review; question.difficulty.level = 'advanced';
  // Independent test fixture mirrors the documented source digest fields,
  // creating a valid arithmetic source with a deliberately fabricated band.
  question.contentSha256 = sha({ id: question.id, problem: question.problem, prompt: question.prompt,
    options: question.options, answerIndex: question.answerIndex, answerUnit: question.answerUnit,
    solutionGraph: question.solutionGraph, visual: question.visual, metadata: question.metadata,
    cognitiveIntent: question.cognitiveIntent, difficulty: question.difficulty });
  const arithmetic = validateQuestion(question);
  assert.equal(arithmetic.localMathChecks, 'passed'); assert.deepEqual(arithmetic.errors, []);
  assert.throws(() => createMixedPracticePlan(data), /mixed_noncanonical_candidate/u);
});

// Catches coercing malformed data, hidden holes or getter configuration into
// valid source snapshots, without relying on provider/file-system side effects.
test('sparse candidates foreign objects and hidden property hooks fail without invocation', async () => {
  const { createMixedPracticePlan } = await api(); let calls = 0;
  const sparse = input(); delete sparse.candidates[1];
  assert.throws(() => createMixedPracticePlan(sparse), /mixed_invalid_data/u);
  const hidden = input(); Object.defineProperty(hidden.request, 'model', { get() { calls++; return 'not allowed'; } });
  assert.throws(() => createMixedPracticePlan(hidden), /mixed_invalid_data/u);
  const foreign = input(); foreign.request.scope = new Date();
  assert.throws(() => createMixedPracticePlan(foreign), /mixed_invalid_data/u);
  const callable = input(); callable.candidates[0].toJSON = () => { calls++; return {}; };
  assert.throws(() => createMixedPracticePlan(callable), /mixed_invalid_data/u);
  const symbol = input(); symbol[Symbol('extra')] = 'not allowed';
  assert.throws(() => createMixedPracticePlan(symbol), /mixed_invalid_data/u);
  assert.equal(calls, 0);
});
