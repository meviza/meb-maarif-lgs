import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createGardenQuestion, createRectangleQuestion, validateQuestion } from '../packages/content-factory/pilot.mjs';

const adapterUrl = new URL('../packages/content-factory/reasoned_math_adapter.mjs', import.meta.url);
async function adapter() {
  assert.ok(existsSync(adapterUrl), 'source-bound reasoned math adapter is not implemented');
  return import(adapterUrl);
}
const rectangle = template => createRectangleQuestion({ id: `reasoned-${template}`, template, width: 6, height: 4, gate: 2 });
const sourceHash = question => createHash('sha256').update(JSON.stringify({
  id: question.id, problem: question.problem, prompt: question.prompt, options: question.options,
  answerIndex: question.answerIndex, answerUnit: question.answerUnit, solutionGraph: question.solutionGraph,
  visual: question.visual, metadata: question.metadata, cognitiveIntent: question.cognitiveIntent, difficulty: question.difficulty,
  ...(question.problem.template === 'garden_two_rows' ? { inkPlan: question.inkPlan, inkPlanSha256: question.inkPlanSha256 } : {}),
})).digest('hex');

// Catches hard-coded fixture values, wrong family routing, and dimensional
// confusion. Each expected result is checked by hand for a 6 by 4 rectangle.
for (const [family, values, units, target] of [
  ['perimeter', [10, 20], ['cm', 'cm'], 'perimeter_length'],
  ['area', [24], ['cm²'], 'covered_area'],
  ['width_from_area', [6], ['cm'], 'unknown_side_length'],
  ['width_from_perimeter', [10, 6], ['cm', 'cm'], 'unknown_side_length'],
  ['error_diagnosis', [24, 10, 20], ['cm²', 'cm', 'cm'], 'perimeter_length'],
  ['fence_gap', [10, 20, 18], ['cm', 'cm', 'cm'], 'required_strip_length'],
]) test(`${family} maps its own goal and dimensionally valid intermediate results`, async () => {
  const { createReasonedMathTrace } = await adapter();
  const question = rectangle(family);
  const before = JSON.stringify(question);
  const trace = createReasonedMathTrace(question);
  assert.equal(trace.kind, 'question_solution');
  assert.equal(trace.source.id, question.id);
  assert.equal(trace.source.contentSha256, question.contentSha256);
  assert.equal(trace.goal.measurement, target);
  assert.deepEqual(trace.steps.map(step => step.result.value), values);
  assert.deepEqual(trace.steps.map(step => step.result.unit), units);
  assert.equal(trace.state, 'draft');
  assert.equal(trace.publicationReady, false);
  assert.ok(Object.isFrozen(trace));
  assert.ok(trace.plan.why.length > 35);
  assert.ok(trace.plan.conditions.length > 0);
  for (const step of trace.steps) {
    assert.ok(step.why.length > 35);
    assert.ok(step.result.meaning.length > 10);
    assert.ok(step.check.prompt.length > 10);
    assert.ok(step.check.answer.length > 10);
  }
  assert.equal(JSON.stringify(question), before, 'original question, geometry, solution and hashes must not change');
});

// Catches accidentally promoting the latent width in a source problem into
// initial givens when that width is what the learner must derive.
test('unknown side lengths are not leaked into givens or the initial plan', async () => {
  const { createReasonedMathTrace } = await adapter();
  for (const family of ['width_from_area', 'width_from_perimeter']) {
    const trace = createReasonedMathTrace(rectangle(family));
    const givenNumbers = trace.evidence.filter(item => item.type === 'given').map(item => item.value);
    assert.ok(!givenNumbers.includes(6));
    assert.ok(givenNumbers.includes(4));
    assert.ok(givenNumbers.includes(family === 'width_from_area' ? 24 : 20));
    assert.doesNotMatch(trace.plan.route, /6/u);
  }
});

// Catches assigning an area unit to a boundary or repeating the incorrect cm
// label from the fictional learner's multiplication claim as a correct unit.
test('error diagnosis keeps the wrong claim textual and explains cm² versus cm before the correct perimeter', async () => {
  const { createReasonedMathTrace } = await adapter();
  const trace = createReasonedMathTrace(rectangle('error_diagnosis'));
  const claim = trace.evidence.find(item => item.id === 'learner_claim');
  assert.equal(claim.type, 'text');
  assert.equal(claim.value, null);
  assert.equal(claim.unit, 'text');
  assert.equal(trace.steps[0].operation.kind, 'multiply');
  assert.equal(trace.steps[0].result.value, 24);
  assert.equal(trace.steps[0].result.unit, 'cm²');
  assert.match(trace.steps[0].why, /alan/iu);
  assert.match(trace.steps[0].check.answer, /cm²/u);
  assert.equal(trace.steps.at(-1).result.unit, 'cm');
});

// Catches recycling a generic hint rather than a new, parameter-specific
// transfer task. Hand-checked changed-condition answers for 6 by 4 / gap 2.
test('each rectangle family has a distinct original transfer task with checked changed-condition answer', async () => {
  const { createReasonedMathTrace } = await adapter();
  const literals = [
    ['perimeter', /22 cm/u], ['area', /28 cm²/u], ['width_from_area', /12 cm/u],
    ['width_from_perimeter', /8 cm/u], ['error_diagnosis', /20 cm/u], ['fence_gap', /17 cm/u],
  ];
  const prompts = new Set();
  for (const [family, answer] of literals) {
    const question = rectangle(family);
    const trace = createReasonedMathTrace(question);
    assert.notEqual(trace.transfer.prompt, question.prompt);
    assert.match(trace.transfer.answer, answer);
    assert.ok(trace.transfer.prompt.length > 35);
    assert.ok(trace.transfer.answer.length > 35);
    prompts.add(trace.transfer.prompt);
  }
  assert.equal(prompts.size, 6);
});

// Catches conflating denominator, edge-pair multiplier and number of wire rows
// or changing the canonical v1 pen plan while adding a reasoned sidecar.
test('fixed garden adapts equal parts and every row gap without changing the original pen or source hash', async () => {
  const { createReasonedMathTrace } = await adapter();
  const question = createGardenQuestion({ id: 'reasoned-garden' });
  const before = JSON.stringify(question);
  const trace = createReasonedMathTrace(question);
  assert.equal(trace.source.contentSha256, question.contentSha256);
  assert.deepEqual(trace.steps.map(step => step.result.value), [9, 27, 45, 90, 86, 172]);
  assert.deepEqual(trace.steps.map(step => step.result.unit), ['m', 'm', 'm', 'm', 'm', 'm']);
  for (const id of ['ratio_denominator', 'ratio_numerator', 'edge_pairs', 'wire_rows']) assert.ok(trace.evidence.some(item => item.id === id));
  assert.deepEqual(trace.steps.at(-1).operation.inputIds, ['one_row', 'wire_rows']);
  assert.match(trace.plan.conditions.join(' '), /her.*sıra/iu);
  assert.match(trace.transfer.answer, /170 m/u);
  assert.equal(JSON.stringify(question), before);
});

// Catches hard-coding six/four or assuming the first side is always the long
// side. The changed 3 by 8 fixture still has area 24 and perimeter 22.
test('a second dimension pair derives its values without assuming width is the long side', async () => {
  const { createReasonedMathTrace } = await adapter();
  for (const [family, values] of [['perimeter', [11, 22]], ['area', [24]], ['width_from_area', [3]], ['width_from_perimeter', [11, 3]], ['fence_gap', [11, 22, 20]]]) {
    const trace = createReasonedMathTrace(createRectangleQuestion({ id: `other-${family}`, template: family, width: 3, height: 8, gate: 2 }));
    assert.deepEqual(trace.steps.map(step => step.result.value), values);
  }
});

// Catches trusting caller review flags, stale content hashes or incorrect
// answer keys instead of running the real source validator on the snapshot.
test('stale prompt answer and diagram sources are rejected despite caller claims of local success', async () => {
  const { createReasonedMathTrace } = await adapter();
  for (const change of [question => { question.prompt += ' değiştirilmiş'; }, question => { question.options[question.answerIndex] += 5; }, question => { question.visual.svg += '<text>değiştirildi</text>'; }]) {
    const question = rectangle('perimeter');
    change(question);
    question.review = { localMathChecks: 'passed', errors: [], automatedPass: true, publishReady: true };
    assert.throws(() => createReasonedMathTrace(question), /unverified_reasoned_math_source/u);
  }
});

// Catches checking only mathReady. Source metadata errors can coexist with
// passed arithmetic; no such source may become a reasoned trace.
test('math passed with source metadata errors is still rejected', async () => {
  const { createReasonedMathTrace } = await adapter();
  const question = rectangle('perimeter');
  question.metadata.source.purpose = '';
  question.contentSha256 = sourceHash(question);
  const review = validateQuestion(question);
  assert.equal(review.localMathChecks, 'passed');
  assert.ok(review.errors.includes('missing_source_metadata'));
  assert.throws(() => createReasonedMathTrace(question), /unverified_reasoned_math_source/u);
});

// Catches silently handling an unsupported algebra or future family with the
// rectangle boilerplate, rather than requiring an authored semantic adapter.
test('unsupported families are rejected without a generic reasoning fallback', async () => {
  const { createReasonedMathTrace } = await adapter();
  const question = rectangle('perimeter');
  question.problem.template = 'triangle_future';
  assert.throws(() => createReasonedMathTrace(question), /unsupported_reasoned_math_family/u);
});

// Catches invoking a getter, proxy or serialization hook while validating a
// caller-supplied source rather than treating it as bounded own data.
test('getters proxies functions and cyclic source graphs are rejected without invoking them', async () => {
  const { createReasonedMathTrace } = await adapter();
  let getterReads = 0;
  const accessor = rectangle('perimeter');
  Object.defineProperty(accessor.problem, 'width', { get() { getterReads++; return 6; } });
  assert.throws(() => createReasonedMathTrace(accessor), /invalid_reasoned_math_source/u);
  assert.equal(getterReads, 0);
  assert.throws(() => createReasonedMathTrace(new Proxy(rectangle('perimeter'), { get() { throw new Error('proxy_trap'); } })), /invalid_reasoned_math_source/u);
  const hooked = rectangle('perimeter');
  hooked.toJSON = () => { throw new Error('serialization_hook'); };
  assert.throws(() => createReasonedMathTrace(hooked), /invalid_reasoned_math_source/u);
  const cyclic = rectangle('perimeter'); cyclic.self = cyclic;
  assert.throws(() => createReasonedMathTrace(cyclic), /invalid_reasoned_math_source/u);
});

// Catches a gap transfer extending beyond its supporting edge or replacing a
// zero remaining gap with an impossible negative opening at the lower bound.
test('a gap equal to its edge gets a physically possible smaller-gap transfer', async () => {
  const { createReasonedMathTrace } = await adapter();
  for (const [width, height, gate, expectedFinal, expectedTransfer] of [[1, 1, 1, 3, 4], [100, 100, 100, 300, 301]]) {
    const trace = createReasonedMathTrace(createRectangleQuestion({ id: `gap-bound-${width}`, template: 'fence_gap', width, height, gate }));
    assert.equal(trace.steps.at(-1).result.value, expectedFinal);
    assert.match(trace.transfer.prompt, new RegExp(`${gate - 1} cm`, 'u'));
    assert.match(trace.transfer.answer, new RegExp(`${expectedTransfer} cm`, 'u'));
  }
});

// Catches implying that a source-validated adapter resolves human semantics,
// ownership, curriculum, or publication gates in the generic root contract.
test('root audit counts the adapter arithmetic but retains semantic rights and publication gates', async () => {
  const { createReasonedMathTrace } = await adapter();
  const { auditReasonedTeachingTrace, getReasonedTeachingStage } = await import('../packages/contracts/reasoned_teaching_trace.mjs');
  const trace = createReasonedMathTrace(rectangle('error_diagnosis'));
  const audit = auditReasonedTeachingTrace(trace);
  assert.equal(audit.structuralChecks, 'passed');
  assert.equal(audit.numericStepsChecked, 3);
  assert.equal(audit.sourceBinding, 'declared_requires_source_resolver');
  assert.equal(audit.semanticReview, 'pending');
  assert.equal(audit.publicationReady, false);
  for (const gate of ['source_resolver', 'expert_rationale_and_transfer_review', 'curriculum_mapping', 'rights_and_owner_review']) assert.ok(audit.pending.includes(gate));
  const initial = getReasonedTeachingStage(trace);
  assert.equal(initial.result, null);
  assert.equal(initial.expression, null);
  const calculation = getReasonedTeachingStage(trace, { stageIndex: 3, reveal: false });
  assert.equal(calculation.check.answer, null);
  const revealed = getReasonedTeachingStage(trace, { stageIndex: 3, reveal: true });
  assert.equal(revealed.result.value, 24);
  assert.equal(revealed.result.unit, 'cm²');
  assert.throws(() => auditReasonedTeachingTrace(JSON.parse(JSON.stringify(trace))), /untrusted_teaching_trace/u);
});
