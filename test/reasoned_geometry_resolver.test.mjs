import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRectangleQuestion, createGardenQuestion, validateQuestion } from '../packages/content-factory/pilot.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { createReasonedTeachingTrace } from '../packages/contracts/reasoned_teaching_trace.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';

const api = await import('../packages/media/reasoned_geometry_resolver.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const bytesHash = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);
function resolve(input) {
  assert.equal(typeof api.resolveReasonedMediaGeometry, 'function', 'geometry resolver not implemented');
  return api.resolveReasonedMediaGeometry(input);
}
function fixture(family = 'perimeter', options = {}) {
  const source = family === 'concept_lesson' ? createPerimeterLesson()
    : family === 'garden_two_rows' ? createGardenQuestion({ id: 'geometry-garden' })
      : createRectangleQuestion({ id: `geometry-${family}`, template: family, width: 6, height: 4, gate: 2 });
  const trace = family === 'concept_lesson' ? createReasonedPerimeterLessonTrace() : createReasonedMathTrace(source);
  return { source, trace, job: createReasonedMediaJob(trace, options) };
}
function rehashQuestion(q) {
  q.contentSha256 = hash({ id: q.id, problem: q.problem, prompt: q.prompt, options: q.options,
    answerIndex: q.answerIndex, answerUnit: q.answerUnit, solutionGraph: q.solutionGraph,
    visual: q.visual, metadata: q.metadata, cognitiveIntent: q.cognitiveIntent, difficulty: q.difficulty,
    ...(q.problem.template === 'garden_two_rows' ? { inkPlan: q.inkPlan, inkPlanSha256: q.inkPlanSha256 } : {}) });
}
function rootDraft(trace) {
  return Object.fromEntries(['id', 'kind', 'source', 'goal', 'evidence', 'plan', 'steps', 'transfer', 'scope'].map(key => [key,
    key === 'steps' ? trace.steps.map(({ expression, dependsOn, ...step }) => clone(step)) : clone(trace[key])]));
}
const anchor = (binding, id) => binding.anchors.find(item => item.id === id);

// Break caught: binding an arbitrary trace or omitting canonical intermediate units.
for (const [family, results] of [
  ['perimeter', [[10, 'cm'], [20, 'cm']]], ['area', [[24, 'cm²']]],
  ['width_from_area', [[6, 'cm']]], ['width_from_perimeter', [[10, 'cm'], [6, 'cm']]],
  ['error_diagnosis', [[24, 'cm²'], [10, 'cm'], [20, 'cm']]],
  ['fence_gap', [[10, 'cm'], [20, 'cm'], [18, 'cm']]],
  ['garden_two_rows', [[9, 'm'], [27, 'm'], [45, 'm'], [90, 'm'], [86, 'm'], [172, 'm']]],
]) test(`${family} binds every canonical result and cue to the untouched source SVG`, () => {
  const input = fixture(family), before = JSON.stringify(input), binding = resolve(input);
  assert.equal(binding.source.contentSha256, input.source.contentSha256);
  assert.equal(binding.trace.contentSha256, input.trace.contentSha256);
  assert.equal(binding.job.contentSha256, input.job.contentSha256);
  assert.equal(binding.assets[0].svg, input.source.visual.svg);
  assert.equal(binding.assets[0].svgSha256, bytesHash(input.source.visual.svg));
  assert.deepEqual(binding.anchors.filter(item => item.origin === 'result').map(item => [item.value, item.unit]), results);
  assert.equal(binding.cues.length, input.job.cues.length);
  assert.ok(binding.cues.every(cue => cue.sourceVisualIds.length && cue.sourceVisualIds.every(id => binding.assets.some(asset => asset.id === id))));
  assert.deepEqual(binding.cues.map(cue => cue.displayAnchorIds), input.job.cues.map(cue => cue.displayAnchorIds));
  assert.ok(binding.cues.every(cue => cue.displayAnchorIds.every(id => anchor(binding, id))));
  assert.equal(JSON.stringify(input), before);
});

// Break caught: calculating pixel positions from world lengths on an unscaled SVG.
test('rectangle edge locations come from SVG coordinates without inventing a physical scale', () => {
  const binding = resolve(fixture());
  assert.deepEqual(binding.assets[0].viewBox, { x: 0, y: 0, width: 560, height: 340 });
  assert.deepEqual(binding.models[0].instances[0].bounds, { x: 65, y: 85, width: 400, height: 165 });
  assert.deepEqual(binding.models[0].dimensions, { width: 6, height: 4, unit: 'cm' });
  assert.equal(binding.models[0].instances[0].pixelsPerLengthUnit, null);
  assert.equal(binding.models[0].instances[0].notToScale, true);
  assert.deepEqual(anchor(binding, 'side_width').representation.regions[0].bounds, { x: 65, y: 85, width: 400, height: 0 });
  assert.deepEqual(anchor(binding, 'side_height').representation.regions[0].bounds, { x: 465, y: 85, width: 0, height: 165 });
});

test('fence gap and garden ratio roles retain their distinct source geometry and meanings', () => {
  const fence = resolve(fixture('fence_gap')), garden = resolve(fixture('garden_two_rows'));
  assert.deepEqual(anchor(fence, 'gap_width').representation.regions[0].bounds, { x: 125, y: 250, width: 70, height: 0 });
  assert.deepEqual(garden.models[0].instances[0].bounds, { x: 100, y: 315, width: 315, height: 210 });
  assert.deepEqual(anchor(garden, 'gap_width').representation.regions[0].bounds, { x: 237, y: 525, width: 65, height: 0 });
  assert.equal(anchor(garden, 'ratio_denominator').value, 2);
  assert.equal(anchor(garden, 'wire_rows').value, 2);
  assert.notEqual(anchor(garden, 'ratio_denominator').meaning, anchor(garden, 'wire_rows').meaning);
  assert.equal(anchor(garden, 'total_wire').representation.kind, 'logical_repeat');
  assert.equal(anchor(garden, 'total_wire').representation.repeatCount, 2);
  assert.equal(garden.models[0].instances[0].pixelsPerLengthUnit, null);
});

test('inverse-side evidence never promotes the computed width to a given anchor', () => {
  for (const family of ['width_from_area', 'width_from_perimeter']) {
    const binding = resolve(fixture(family));
    assert.equal(anchor(binding, 'side_width'), undefined);
    assert.equal(anchor(binding, 'unknown_side').origin, 'result');
    assert.equal(anchor(binding, 'unknown_side').value, 6);
    assert.match(binding.assets[0].svg, />\? cm<\/text>/u);
  }
});

test('definitions and the erroneous learner claim remain logical text rather than invented numeric evidence', () => {
  const area = resolve(fixture('area')), error = resolve(fixture('error_diagnosis'));
  assert.equal(anchor(area, 'unit_square').value, null);
  assert.equal(anchor(area, 'unit_square').representation.kind, 'logical_definition');
  assert.equal(anchor(error, 'learner_claim').value, null);
  assert.equal(anchor(error, 'learner_claim').representation.kind, 'text_claim');
  assert.equal(anchor(error, 'area_check').unit, 'cm²');
});

test('canonical concept lesson binds both source visuals, grid scales and counterexample dependencies', () => {
  const input = fixture('concept_lesson'), binding = resolve(input);
  assert.deepEqual(binding.assets.map(item => item.svg), input.source.visuals.map(item => item.svg));
  assert.deepEqual(binding.models.map(item => item.dimensions), [{ width: 6, height: 4, unit: 'cm' }, { width: 8, height: 3, unit: 'cm' }]);
  assert.deepEqual(binding.models[0].instances.map(item => item.pixelsPerLengthUnit), [42, 26]);
  assert.equal(binding.models[1].instances[0].pixelsPerLengthUnit, 26);
  assert.deepEqual(binding.anchors.filter(item => item.origin === 'result').slice(0, 4).map(item => [item.value, item.unit]), [[20, 'cm'], [24, 'cm²'], [24, 'cm²'], [22, 'cm']]);
  assert.equal(anchor(binding, 'boundary-definition').meaning, input.source.concept.perimeter);
  assert.equal(anchor(binding, 'counterexample').representation.kind, 'logical_comparison');
  assert.deepEqual(anchor(binding, 'counterexample').inputAnchorIds, ['area-first', 'area-second', 'boundary-first', 'boundary-second']);
});

test('new transfer geometry remains explicitly unsupported instead of reusing the source shape as proof', () => {
  const binding = resolve(fixture('concept_lesson'));
  for (const cue of binding.cues.filter(item => item.kind.startsWith('transfer_'))) {
    assert.equal(cue.representationStatus, 'unsupported_new_geometry_pending');
    assert.ok(cue.pending.includes('transfer_geometry_not_in_canonical_source'));
    assert.equal(cue.semantic.kind, 'transfer_text');
  }
  assert.equal(binding.videoRendered, false);
  assert.equal(binding.rendererBound, false);
  assert.equal(binding.teacherApproved, false);
  assert.equal(binding.publicationReady, false);
  assert.equal(binding.learnerReady, false);
  assert.equal(binding.productionReady, false);
});

test('serialized trace or job cannot acquire root trust merely by matching a hash', () => {
  const input = fixture();
  assert.throws(() => resolve({ ...input, trace: clone(input.trace) }), /untrusted_teaching_trace/u);
  assert.throws(() => resolve({ ...input, job: clone(input.job) }), /untrusted_reasoned_media_job/u);
});

test('swapped source trace and job revisions are rejected', () => {
  const first = fixture(), second = fixture('area');
  assert.throws(() => resolve({ ...first, source: second.source }), /reasoned_geometry_trace_mismatch/u);
  assert.throws(() => resolve({ ...first, trace: second.trace }), /reasoned_geometry_trace_mismatch/u);
  assert.throws(() => resolve({ ...first, job: second.job }), /reasoned_geometry_job_mismatch/u);
});

test('caller-rehashed source text visual geometry difficulty and fake approval cannot become canonical', () => {
  for (const change of [q => q.prompt += ' altered', q => q.visual.geometry.width++,
    q => q.visual.svg += '<!-- altered -->', q => q.difficulty.level = 'advanced', q => q.state = 'expert_approved']) {
    const input = fixture(); change(input.source); rehashQuestion(input.source);
    assert.throws(() => resolve(input), /reasoned_geometry_source_mismatch/u);
  }
  const lesson = fixture('concept_lesson'); lesson.source = clone(lesson.source);
  lesson.source.speechTranscript += ' altered';
  const { contentSha256, ...body } = lesson.source; lesson.source.contentSha256 = hash(body);
  assert.throws(() => resolve(lesson), /reasoned_geometry_source_mismatch/u);
});

test('mathematically valid branded trace with a changed rationale or unknown evidence anchor is not source truth', () => {
  for (const change of [draft => draft.steps[0].why = 'Unrelated rationale', draft => draft.evidence[0].anchor = 'shape:unknown-circle']) {
    const input = fixture(), draft = rootDraft(input.trace); change(draft);
    input.trace = createReasonedTeachingTrace(draft); input.job = createReasonedMediaJob(input.trace);
    assert.throws(() => resolve(input), /reasoned_geometry_trace_mismatch/u);
  }
});

test('source errors and fake review receipts are rejected even when numeric checks still pass', () => {
  const input = fixture(); input.source.review = { ...validateQuestion(input.source), publishReady: true };
  assert.equal(validateQuestion(input.source).localMathChecks, 'passed');
  assert.throws(() => resolve(input), /reasoned_geometry_source_mismatch/u);
  const extra = fixture(); extra.source.problem['width,height'] = 6; rehashQuestion(extra.source);
  assert.throws(() => resolve(extra), /reasoned_geometry_source_mismatch/u);
});

test('unknown source family and exact field violations do not use a generic geometric fallback', () => {
  const unknown = fixture(); unknown.source.problem.template = 'circle';
  assert.throws(() => resolve(unknown), /unsupported_reasoned_geometry_source/u);
  assert.throws(() => resolve({ ...fixture(), approved: true }), /invalid_reasoned_geometry_fields/u);
  const collision = fixture(); collision['source,trace'] = collision.source; delete collision.source; delete collision.trace;
  assert.throws(() => resolve(collision), /invalid_reasoned_geometry_fields/u);
});

test('getters proxies functions symbols sparse arrays and cycles fail without executing hooks', () => {
  let hooks = 0;
  const getter = fixture(); Object.defineProperty(getter.source, 'hidden', { get() { hooks++; return 'x'; } });
  assert.throws(() => resolve(getter), /invalid_reasoned_geometry_data/u);
  const proxy = new Proxy(fixture(), { ownKeys() { hooks++; throw Error('hook'); }, getPrototypeOf() { hooks++; throw Error('hook'); } });
  assert.throws(() => resolve(proxy), /invalid_reasoned_geometry_data/u);
  const nested = fixture(); nested.source.visual = new Proxy(nested.source.visual, { get() { hooks++; throw Error('hook'); } });
  assert.throws(() => resolve(nested), /invalid_reasoned_geometry_data/u);
  const revoked = Proxy.revocable(fixture(), {}); revoked.revoke();
  assert.throws(() => resolve(revoked.proxy), /invalid_reasoned_geometry_data/u);
  const fn = fixture(); fn.source.toJSON = () => { hooks++; return {}; };
  assert.throws(() => resolve(fn), /invalid_reasoned_geometry_data/u);
  const symbol = fixture(); symbol.source[Symbol('x')] = 1;
  assert.throws(() => resolve(symbol), /invalid_reasoned_geometry_data/u);
  const sparse = fixture(); delete sparse.source.options[0];
  assert.throws(() => resolve(sparse), /invalid_reasoned_geometry_data/u);
  const cyclic = fixture(); cyclic.self = cyclic;
  assert.throws(() => resolve(cyclic), /invalid_reasoned_geometry_data/u);
  assert.equal(hooks, 0);
});

test('changed declared style or provider binds a new draft without any provider call or approval', () => {
  const first = resolve(fixture()), second = resolve(fixture('perimeter', { style: 'Türkçe, sakin öğretmen.', provider: { id: 'synthetic-provider', modelId: 'synthetic-model', voiceId: 'synthetic-voice' } }));
  assert.notEqual(first.job.contentSha256, second.job.contentSha256);
  assert.notEqual(first.contentSha256, second.contentSha256);
  assert.equal(second.providerCallsMade, 0);
  assert.equal(second.sourceFilesRead, 0);
  assert.equal(second.privacyInspection, 'not_performed');
});

test('binding is deeply immutable and its hash covers every cue and source coordinate', () => {
  const binding = resolve(fixture()), { contentSha256, ...body } = binding;
  assert.equal(hash(body), contentSha256);
  assert.ok(Object.isFrozen(binding));
  assert.ok(Object.isFrozen(binding.anchors[0].representation.regions[0].bounds));
  assert.throws(() => { binding.models[0].instances[0].bounds.x++; }, TypeError);
  assert.throws(() => { binding.cues[0].sourceVisualIds.pop(); }, TypeError);
});
