import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as pilot from '../packages/content-factory/pilot.mjs';
import { createInkPlan, renderInkFrameSvg } from '../packages/media/ink_timeline.mjs';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const metadata = {
  source: { sourceId: 'internal-authoring:ink-garden-two-rows-v1', rightsStatus: 'owned_original', purpose: 'original_math_pilot' },
  curriculum: { mappingStatus: 'unresolved', registryEntryId: null, programVersion: null, grade: null, outcomeCode: null, sourceUrl: null, sourceSha256: null },
  governance: { ownerId: 'content-owner', stewardId: 'math-editor', purpose: 'review_only', retentionPolicyId: 'pilot-review-v1' },
};
function garden(overrides = {}) {
  assert.equal(typeof pilot.createGardenQuestion, 'function', 'createGardenQuestion is not implemented');
  return pilot.createGardenQuestion({ id: 'garden-1', metadata, ...overrides });
}
function rehash(item) {
  item.contentSha256 = digest({ id: item.id, problem: item.problem, prompt: item.prompt, options: item.options, answerIndex: item.answerIndex, answerUnit: item.answerUnit, solutionGraph: item.solutionGraph, visual: item.visual, metadata: item.metadata, cognitiveIntent: item.cognitiveIntent, difficulty: item.difficulty, inkPlan: item.inkPlan, inkPlanSha256: item.inkPlanSha256 });
}
function rehashVisual(item) { item.visual.sha256 = digest({ svg: item.visual.svg, alt: item.visual.alt }); }
function rehashPlan(item) { item.inkPlanSha256 = digest(item.inkPlan); item.visual.sourcePlanSha256 = item.inkPlanSha256; }

// Catches distractors that are numerical noise rather than identifiable alternative strategies.
test('garden distractors represent a single removed gap, no gap and only one wire row', () => {
  const item = garden();
  assert.deepEqual([...item.options].sort((a, b) => a - b), [86, 172, 176, 180]);
  assert.deepEqual(item.cognitiveIntent.distractorHypotheses.map(({ value, strategy }) => ({ value, strategy })), [
    { value: 176, strategy: 'subtract_gate_once_after_two_rows' },
    { value: 180, strategy: 'ignore_gate_gap' },
    { value: 86, strategy: 'calculate_one_row_only' },
  ]);
  assert.ok(item.cognitiveIntent.distractorHypotheses.every(h => h.status === 'author_hypothesis_not_student_diagnosis'));
});

test('rehashing an unrelated distractor cannot retain the garden strategy evidence', () => {
  const item = garden();
  const wrongIndex = item.options.findIndex(value => value !== 172);
  item.options[wrongIndex] = 999;
  rehash(item);
  assert.equal(pilot.validateQuestion(item).localMathChecks, 'failed');
  assert.ok(pilot.validateQuestion(item).errors.includes('invalid_distractor_binding'));
});

// Catches generating a generic rectangle or forgetting the gate in the second row.
test('garden question keeps the hand-checked 18, 3/2, 4 and two-row answer 172', () => {
  const item = garden();
  assert.deepEqual(item.problem, { template: 'garden_two_rows', shortSide: 18, longSideRatio: { numerator: 3, denominator: 2 }, gateWidth: 4, wireRows: 2 });
  assert.equal(item.options[item.answerIndex], 172);
  assert.equal(item.answerUnit, 'm');
  assert.deepEqual(item.solutionGraph.map(step => step.value), [27, 90, 86, 172]);
  assert.deepEqual([...item.options].sort((a, b) => a - b), [86, 172, 176, 180]);
  assert.equal(item.inkPlan.id, 'ink-garden-two-rows-v1');
  assert.equal(item.inkPlan.answer, 172);
  assert.equal(item.inkPlan.publicationReady, false);
  assert.equal(item.inkPlan.expertReview, 'pending');
  assert.equal(item.inkPlan.curriculumStatus, 'unmapped_draft');
  assert.equal(pilot.validateQuestion(item).localMathChecks, 'passed');
});

// Catches an unrelated prompt, diagram, transcript or plan substituted at the factory boundary.
test('garden text, solution and initial SVG are derived from the canonical ink plan', () => {
  const item = garden();
  const plan = createInkPlan();
  assert.equal(item.prompt, plan.question);
  assert.equal(item.visual.svg, renderInkFrameSvg(plan, 0));
  assert.equal(item.inkPlanSha256, digest(plan));
  assert.equal(item.visual.sourcePlanSha256, item.inkPlanSha256);
  assert.deepEqual(item.visual.geometry, item.problem);
  assert.match(item.visual.alt, /18 m/);
  assert.match(item.visual.alt, /3\/2/);
  assert.match(item.visual.alt, /4 m/);
  assert.match(item.visual.alt, /her iki tel sırasında/);
  assert.equal(item.visual.sha256, digest({ svg: item.visual.svg, alt: item.visual.alt }));
  assert.deepEqual(item.solutionGraph.map(step => step.stepId), ['step1', 'step2', 'step3', 'step4']);
  assert.deepEqual(item.solutionGraph.map(step => step.dependsOn), [[], ['step1'], ['step2'], ['step3']]);
  assert.deepEqual(item.solutionGraph.map(step => step.narration), plan.segments.slice(1, 5).map(segment => segment.narration));
  const originalDigest = item.contentSha256;
  rehash(item);
  assert.equal(item.contentSha256, originalDigest);
});

// Catches trusting author-supplied flags as a curriculum or expert approval.
test('garden verified flags keep draft status and the trusted publication gates pending', () => {
  const item = garden({ metadata: { ...metadata, verified: true, curriculum: { ...metadata.curriculum, mappingStatus: 'verified', verified: true } } });
  item.state = 'published';
  item.verified = true;
  item.publishReady = true;
  item.expertApproval = { approved: true, reviewerId: 'caller' };
  rehash(item);
  const report = pilot.validateQuestion(item);
  assert.equal(item.inkPlan.publicationReady, false);
  assert.equal(report.state, 'draft');
  assert.equal(report.localMathChecks, 'passed');
  assert.equal(report.automatedPass, false);
  assert.equal(report.publishReady, false);
  assert.ok(report.pending.includes('canonical_curriculum_mapping'));
  assert.ok(report.pending.includes('trusted_expert_review'));
  assert.equal(pilot.requestStateTransition(item, 'published').allowed, false);
});

test('garden questions reject malformed authoring IDs', () => {
  for (const id of ['', '../garden', 'g'.repeat(81), null]) assert.throws(() => garden({ id }), /invalid_question_id/);
});

// Catches garden being rejected by the existing review-only downstream factories.
test('garden enters the existing batch, storyboard and lesson validation path as one draft', () => {
  const item = garden();
  const batch = pilot.auditBatch([item, garden({ id: 'garden-duplicate' })]);
  assert.equal(batch.items.length, 1);
  assert.equal(batch.rejections[0].reason, 'duplicate_problem');
  assert.equal(batch.summary.mathematicallyVerified, 1);
  assert.equal(batch.summary.published, 0);
  assert.equal(batch.items[0].state, 'draft');
  const storyboard = pilot.createStoryboard(item);
  assert.equal(storyboard.frames.at(-1).value, 172);
  assert.equal(storyboard.sourceContentSha256, item.contentSha256);
  assert.equal(storyboard.frames[0].diagramSha256, item.visual.sha256);
  assert.equal(storyboard.videoRendered, false);
  const lesson = pilot.createLesson(item);
  assert.equal(lesson.workedExample.answer, 172);
  assert.equal(lesson.state, 'draft');
});

// Catches a wrong, but syntactically valid, selected option passing validation after rehashing.
test('garden independent edge-and-two-gap calculation rejects a rehashed wrong answer', () => {
  const item = garden();
  item.answerIndex = (item.answerIndex + 1) % 4;
  rehash(item);
  const report = pilot.validateQuestion(item);
  assert.equal(report.checks.integrity, true);
  assert.equal(report.checks.numericAnswer, false);
  assert.ok(report.errors.includes('incorrect_answer_key'));
  assert.equal(report.localMathChecks, 'failed');
  assert.throws(() => pilot.createStoryboard(item), /unverified_solution/);
});

test('garden rejects a rehashed 176 answer that subtracts the gate only once', () => {
  const item = garden();
  item.options[item.answerIndex] = 176;
  item.solutionGraph.at(-1).value = 176;
  item.inkPlan.answer = 176;
  item.inkPlan.solutionGraph.at(-1).value = 176;
  rehashPlan(item);
  rehash(item);
  const report = pilot.validateQuestion(item);
  assert.equal(report.checks.integrity, true);
  assert.equal(report.checks.numericAnswer, false);
  assert.equal(report.checks.solutionGraph, false);
  assert.equal(report.checks.inkPlanBinding, false);
  assert.equal(report.localMathChecks, 'failed');
});

// Catches accepting an end value while intermediate reasoning or dependencies are corrupt.
test('garden rejects rehashed incorrect expressions, narration, values and graph dependencies', () => {
  const mutations = [
    item => { item.solutionGraph[0].value = 28; },
    item => { item.solutionGraph[1].expression = '18 × 27'; },
    item => { item.solutionGraph[2].narration = 'Kapıyı yalnız son sıradan çıkar.'; },
    item => { item.solutionGraph[3].dependsOn = []; },
    item => { item.solutionGraph[3].unit = 'cm'; },
  ];
  for (const mutate of mutations) {
    const item = garden();
    mutate(item);
    rehash(item);
    const report = pilot.validateQuestion(item);
    assert.equal(report.checks.integrity, true);
    assert.equal(report.checks.solutionGraph, false);
    assert.equal(report.localMathChecks, 'failed');
  }
});

// Catches rehashing semantically inconsistent text rather than binding it back to the source plan.
test('garden rejects rehashed prompt, unit and alt tampering', () => {
  const mutations = [
    item => { item.prompt = item.prompt.replace('18 m', '20 m'); },
    item => { item.prompt = item.prompt.replace('her iki tel sırasında', 'yalnız bir tel sırasında'); },
    item => { item.answerUnit = 'cm'; },
    item => { item.visual.alt = 'Üçgen bahçenin alanını gösteren görsel.'; rehashVisual(item); },
  ];
  for (const mutate of mutations) {
    const item = garden();
    mutate(item);
    rehash(item);
    const report = pilot.validateQuestion(item);
    assert.equal(report.checks.integrity, true);
    assert.equal(report.checks.semanticBinding, false);
    assert.equal(report.localMathChecks, 'failed');
  }
});

// Catches SVG bytes rehashed by a caller after changing a stated quantity.
test('garden rejects a rehashed SVG with a different gate width', () => {
  const item = garden();
  item.visual.svg = item.visual.svg.replaceAll('4 m', '5 m');
  rehashVisual(item);
  rehash(item);
  const report = pilot.validateQuestion(item);
  assert.equal(report.checks.integrity, true);
  assert.equal(report.checks.diagram, false);
  assert.equal(report.localMathChecks, 'failed');
});

test('garden rejects stale or rehashed visual geometry and plan-reference hashes', () => {
  for (const mutate of [
    item => { item.visual.geometry.gateWidth = 3; },
    item => { item.visual.sourcePlanSha256 = '0'.repeat(64); },
    item => { item.visual.format = 'image/png'; },
    item => { item.visual.notToScale = false; },
  ]) {
    const item = garden();
    mutate(item);
    rehash(item);
    const report = pilot.validateQuestion(item);
    assert.equal(report.checks.integrity, true);
    assert.equal(report.checks.diagram, false);
    assert.equal(report.localMathChecks, 'failed');
  }
});

// Catches a copied plan whose root, math, motion or review status was modified and rehashed.
test('garden rejects fully rehashed tampering anywhere in its canonical plan snapshot', () => {
  const mutations = [
    item => { item.inkPlan.id = 'unrelated-plan'; },
    item => { item.inkPlan.problem.shortSide = 20; },
    item => { item.inkPlan.solutionGraph[0].value = 28; },
    item => { item.inkPlan.question = 'Alan kaç metrekaredir?'; },
    item => { item.inkPlan.motionEvents[0].points[0].x += 1; },
    item => { item.inkPlan.publicationReady = true; },
    item => { item.inkPlan.expertReview = 'approved'; },
  ];
  for (const mutate of mutations) {
    const item = garden();
    mutate(item);
    rehashPlan(item);
    rehash(item);
    const report = pilot.validateQuestion(item);
    assert.equal(report.checks.integrity, true);
    assert.equal(report.checks.inkPlanBinding, false);
    assert.equal(report.localMathChecks, 'failed');
  }
});

test('garden rejects changed fixed geometry even if every caller-controlled hash is refreshed', () => {
  for (const mutate of [
    item => { item.problem.shortSide = 20; },
    item => { item.problem.longSideRatio.numerator = 4; },
    item => { item.problem.longSideRatio.denominator = 0; },
    item => { item.problem.gateWidth = 3; },
    item => { item.problem.wireRows = 1; },
    item => { item.problem.shortSide = '18'; },
    item => { item.problem.extra = 'untrusted'; },
  ]) {
    const item = garden();
    mutate(item);
    rehash(item);
    const report = pilot.validateQuestion(item);
    assert.equal(report.checks.integrity, true);
    assert.equal(report.checks.geometry, false);
    assert.equal(report.localMathChecks, 'failed');
  }
});

test('garden missing plan, metadata or alt fails the existing fail-closed review path', () => {
  for (const [mutate, expectedError] of [
    [item => { delete item.inkPlan; }, 'invalid_or_unbound_ink_plan'],
    [item => { item.metadata.source = null; }, 'missing_source_metadata'],
    [item => { item.metadata.curriculum = null; }, 'missing_curriculum_metadata'],
    [item => { item.visual.alt = ''; rehashVisual(item); }, 'missing_visual_alt'],
  ]) {
    const item = garden();
    mutate(item);
    rehash(item);
    const report = pilot.validateQuestion(item);
    assert.ok(report.errors.includes(expectedError), expectedError);
    assert.equal(report.publishReady, false);
    assert.throws(() => pilot.createLesson(item), /unverified_solution/);
  }
});

test('garden stale root and content hashes fail before a downstream review artifact can be created', () => {
  for (const mutate of [
    item => { item.inkPlanSha256 = '0'.repeat(64); },
    item => { item.contentSha256 = '0'.repeat(64); },
    item => { item.visual.sha256 = '0'.repeat(64); },
  ]) {
    const item = garden();
    mutate(item);
    const report = pilot.validateQuestion(item);
    assert.equal(report.localMathChecks, 'failed');
    assert.throws(() => pilot.createStoryboard(item), /unverified_solution/);
  }
});

// Catches malformed plan/visual payloads crashing the validator before it can reject the question.
test('garden malformed or nonserializable bindings return a failed report without throwing', () => {
  for (const mutate of [
    item => { delete item.visual.geometry; rehash(item); },
    item => { item.inkPlan = () => {}; rehash(item); },
    item => { item.solutionGraph = [null, null, null, null]; rehash(item); },
    item => { item.inkPlan.self = item.inkPlan; },
    item => { item.inkPlan.answer = 172n; },
  ]) {
    const item = garden();
    mutate(item);
    let report;
    assert.doesNotThrow(() => { report = pilot.validateQuestion(item); });
    assert.equal(report.localMathChecks, 'failed');
    assert.equal(report.publishReady, false);
    assert.ok(report.errors.length > 0);
  }
});

// Catches JSON property ordering making the same fixed problem look like a second question.
test('garden duplicate detection uses quantities rather than caller JSON property order', () => {
  const first = garden();
  const reordered = garden({ id: 'garden-reordered' });
  reordered.problem = { wireRows: 2, gateWidth: 4, longSideRatio: { denominator: 2, numerator: 3 }, shortSide: 18, template: 'garden_two_rows' };
  reordered.visual.geometry = structuredClone(reordered.problem);
  rehash(reordered);
  assert.equal(pilot.validateQuestion(reordered).localMathChecks, 'passed');
  const batch = pilot.auditBatch([first, reordered]);
  assert.equal(batch.items.length, 1);
  assert.equal(batch.rejections[0].reason, 'duplicate_problem');
});

// Catches caller serialization hooks hiding corrupted data behind the old canonical digest.
test('garden rejects serialization hooks that disguise altered plan, graph or visual bindings', () => {
  for (const [targetFor, mutate, check] of [
    [item => item.inkPlan, target => { target.question = 'Başka soru'; }, 'inkPlanBinding'],
    [item => item.solutionGraph[0], target => { target.value = 28; }, 'solutionGraph'],
    [item => item.visual.geometry, target => { target.gateWidth = 5; }, 'diagram'],
  ]) {
    const item = garden();
    const target = targetFor(item);
    const canonical = structuredClone(target);
    mutate(target);
    target.toJSON = () => canonical;
    rehash(item);
    const report = pilot.validateQuestion(item);
    assert.equal(report.checks.integrity, true);
    assert.equal(report.checks[check], false);
    assert.equal(report.localMathChecks, 'failed');
  }
});
