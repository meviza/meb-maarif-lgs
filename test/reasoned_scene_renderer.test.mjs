import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRectangleQuestion, createGardenQuestion } from '../packages/content-factory/pilot.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { resolveReasonedMediaGeometry } from '../packages/media/reasoned_geometry_resolver.mjs';

const api = await import('../packages/media/reasoned_scene_renderer.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const bytesHash = value => createHash('sha256').update(value).digest('hex');
function fixture(family = 'perimeter', options = {}) {
  const source = family === 'concept_lesson' ? createPerimeterLesson()
    : family === 'garden_two_rows' ? createGardenQuestion({ id: 'scene-garden' })
      : createRectangleQuestion({ id: `scene-${family}`, template: family, width: 6, height: 4, gate: 2 });
  const trace = family === 'concept_lesson' ? createReasonedPerimeterLessonTrace() : createReasonedMathTrace(source);
  return { source, trace, job: createReasonedMediaJob(trace, options) };
}
function plan(input = fixture()) {
  assert.equal(typeof api.createReasonedScenePlan, 'function', 'scene plan not implemented');
  return api.createReasonedScenePlan(input);
}
function frame(p, options = {}) {
  assert.equal(typeof api.renderReasonedSceneFrame, 'function', 'scene frame not implemented');
  return api.renderReasonedSceneFrame(p, options);
}
const index = (p, kind, stepId = undefined) => p.cues.findIndex(c => c.kind === kind && (stepId === undefined || c.stepId === stepId));
const text = svg => svg.replace(/<[^>]*>/gu, ' ');
function rehashQuestion(q) {
  q.contentSha256 = hash({ id: q.id, problem: q.problem, prompt: q.prompt, options: q.options,
    answerIndex: q.answerIndex, answerUnit: q.answerUnit, solutionGraph: q.solutionGraph,
    visual: q.visual, metadata: q.metadata, cognitiveIntent: q.cognitiveIntent, difficulty: q.difficulty,
    ...(q.problem.template === 'garden_two_rows' ? { inkPlan: q.inkPlan, inkPlanSha256: q.inkPlanSha256 } : {}) });
}

// Break caught: a renderer accepting a digest without regenerating the source and root artifacts.
for (const family of ['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap', 'garden_two_rows', 'concept_lesson']) {
  test(`${family} creates an immutable source-bound scene plan without altering source SVG assets`, () => {
    const input = fixture(family), before = JSON.stringify(input), geometry = resolveReasonedMediaGeometry(input), p = plan(input);
    assert.equal(p.source.contentSha256, input.source.contentSha256);
    assert.equal(p.trace.contentSha256, input.trace.contentSha256);
    assert.equal(p.job.contentSha256, input.job.contentSha256);
    assert.equal(p.geometrySha256, geometry.contentSha256);
    assert.deepEqual(p.assets.map(a => a.svg), family === 'concept_lesson' ? input.source.visuals.map(v => v.svg) : [input.source.visual.svg]);
    for (const a of p.assets) assert.equal(a.svgSha256, bytesHash(a.svg));
    assert.equal(p.cues.length, input.job.cues.length);
    assert.deepEqual(p.cues.map(c => c.displayAnchorIds), input.job.cues.map(c => c.displayAnchorIds));
    assert.equal(p.sourceSvgBytesPreserved, true);
    assert.equal(p.frameRepresentation, 'derived_safe_geometry_not_original_svg_embedding');
    assert.equal(JSON.stringify(input), before);
    assert.ok(Object.isFrozen(p) && Object.isFrozen(p.assets[0]) && Object.isFrozen(p.cues));
    assert.throws(() => { p.models[0].instances[0].bounds.x++; }, TypeError);
    const { contentSha256, ...body } = p; assert.equal(contentSha256, hash(body));
  });
}

// Hand-derived length: top edge 400 + right edge 165 = 565 SVG user units.
test('the highlight pen advances continuously on actual rectangle coordinates, not world-unit scale', () => {
  const p = plan(), cueIndex = index(p, 'why', 'edge_pair');
  const frames = [0, 0.5, 1].map(progress => frame(p, { cueIndex, progress, reveal: false }));
  assert.deepEqual(frames.map(f => f.highlightStage), ['not_started', 'drawing', 'complete']);
  assert.deepEqual(frames.map(f => f.highlight.drawnLength), [0, 282.5, 565]);
  assert.ok(frames.every(f => f.highlight.totalLength === 565));
  assert.equal(frames[0].highlight.pen, null);
  assert.deepEqual(frames[1].highlight.pen, { x: 347.5, y: 85 });
  assert.deepEqual(frames[2].highlight.pen, { x: 465, y: 250 });
  assert.deepEqual(frames[1].highlight.paths[0].points, [{ x: 65, y: 85 }, { x: 347.5, y: 85 }]);
  assert.equal(p.models[0].instances[0].pixelsPerLengthUnit, null);
  assert.equal(frames[1].penMeaning, 'programmatic_highlight_pen_not_human_handwriting');
  assert.equal(new Set(frames.map(f => f.svg)).size, 3);
});

test('gap and boundary-without-gap highlights follow the actual source opening', () => {
  for (const [family, x, y, width] of [['fence_gap', 125, 250, 70], ['garden_two_rows', 237, 525, 65]]) {
    const p = plan(fixture(family)), evidence = frame(p, { cueIndex: index(p, 'evidence'), progress: 1 });
    const gap = evidence.highlight.paths.find(path => path.anchorId === 'gap_width');
    assert.deepEqual(gap.points, [{ x, y }, { x: x + width, y }]);
    const step = family === 'fence_gap' ? 'required_strip' : 'one_row';
    const result = frame(p, { cueIndex: index(p, 'result', step), progress: 1, reveal: true });
    const path = result.highlight.paths[0].points;
    assert.deepEqual(path[0], { x: x + width, y });
    assert.deepEqual(path.at(-1), { x, y });
    assert.equal(path.length, 6);
    assert.ok(result.svg.includes('stroke-dasharray="5 5"'));
  }
});

test('result text, equations and accessible names are gated by both explicit reveal and completed progress', () => {
  const p = plan(), cueIndex = index(p, 'result', 'full_perimeter');
  for (const options of [{ progress: 0 }, { progress: 1, reveal: false }, { progress: 0.5, reveal: true }]) {
    const f = frame(p, { cueIndex, ...options });
    assert.equal(f.resultVisible, false);
    assert.equal(f.highlightStage, 'locked_for_reveal');
    assert.equal(f.highlight.paths.length, 0);
    assert.doesNotMatch(text(f.svg), /20 (?:cm|santimetre)|10 × 2 = 20/u);
    assert.doesNotMatch(f.svg, /10 çarpı 2|Dört kenarın toplam çevre uzunluğu/u);
  }
  const revealed = frame(p, { cueIndex, progress: 1, reveal: true });
  assert.equal(revealed.resultVisible, true);
  assert.match(text(revealed.svg), /10 × 2 = 20 cm/u);
  assert.match(text(revealed.svg), /20 santimetre/u);
});

// Break caught: a locked inline SVG resolving a shared title ID to a revealed
// sibling, or duplicate identical frames sharing global accessible-name IDs.
test('side-by-side revealed locked and duplicate frames have self-contained safe accessible names without global IDREFs', () => {
  const p = plan(), cueIndex = index(p, 'result', 'full_perimeter');
  const revealed = frame(p, { cueIndex, progress: 1, reveal: true });
  const locked = frame(p, { cueIndex, progress: 1, reveal: false });
  const duplicate = frame(p, { cueIndex, progress: 1, reveal: false });
  assert.equal(duplicate.svg, locked.svg);
  assert.equal(duplicate.contentSha256, locked.contentSha256);
  const joined = revealed.svg + locked.svg + duplicate.svg;
  assert.equal(/aria-labelledby=|aria-describedby=/u.test(joined), false, 'inline frames must not depend on document-global accessible-name IDREFs');
  assert.equal(/\bid=/u.test(joined), false, 'duplicate frames must not introduce shared document IDs');
  for (const f of [revealed, locked, duplicate]) {
    assert.match(f.svg, /role="img"/u);
    const label = f.svg.match(/\baria-label="([^"]*)"/u)?.[1];
    assert.equal(typeof label, 'string', 'each inline SVG must carry its own escaped current safe caption');
    assert.match(label, /^Kaynak &amp; gerekçe — /u);
    assert.equal(f.svg.match(/<title>(.*?)<\/title>/u)?.[1], label);
    assert.equal(f.svg.match(/<desc>(.*?)<\/desc>/u)?.[1], label);
    if (f.resultVisible) assert.match(label, /20 santimetre/u);
    else assert.doesNotMatch(label, /20 santimetre|10 çarpı 2|Dört kenarın toplam çevre uzunluğu/u);
  }
});

test('check answers and summary cannot bypass the result reveal gate', () => {
  const p = plan(fixture('garden_two_rows'));
  for (const kind of ['check_answer', 'summary']) {
    const cueIndex = index(p, kind, kind === 'check_answer' ? 'total_wire' : undefined);
    assert.doesNotMatch(text(frame(p, { cueIndex, progress: 1, reveal: false }).svg), /172|86 m/u);
    const f = frame(p, { cueIndex, progress: 1, reveal: true });
    assert.equal(f.resultVisible, true);
    assert.match(text(f.svg), /172 m/u);
  }
});

test('concept source assets remain byte equal but answer-bearing SVG descriptions never enter unrevealed frames', () => {
  const input = fixture('concept_lesson'), p = plan(input);
  assert.match(p.assets[0].svg, /20|24/u); // The editor asset really contains spoilers.
  for (const kind of ['goal', 'evidence', 'plan', 'why']) {
    const f = frame(p, { cueIndex: index(p, kind), progress: 1, reveal: false });
    assert.doesNotMatch(text(f.svg), /(?:20|22|24) (?:cm|santimetre)/u);
    assert.ok(!f.svg.includes(p.assets[0].svg) && !f.svg.includes(p.assets[1].svg));
    assert.equal(f.frameRepresentation, 'derived_safe_geometry_not_original_svg_embedding');
    assert.equal(f.sourceDiagramProof, true);
  }
  const evidence = frame(p, { cueIndex: index(p, 'evidence'), progress: 1 });
  assert.equal(evidence.sourceVisualId, 'perimeter-area-comparison-v1');
  assert.match(evidence.svg, /data-layer="canonical-unit-grid"/u);
  assert.match(text(evidence.svg), /6 cm/u);
  assert.match(text(evidence.svg), /8 cm/u);
});

test('inverse questions show the given perimeter or area but never relabel computed width as a given', () => {
  for (const [family, given] of [['width_from_area', '24 cm²'], ['width_from_perimeter', '20 cm']]) {
    const p = plan(fixture(family)), f = frame(p, { cueIndex: index(p, 'goal'), progress: 1 });
    assert.match(text(f.svg), /\? cm/u);
    assert.ok(text(f.svg).includes(given));
    assert.doesNotMatch(text(f.svg), /6 cm/u);
    assert.equal(f.resultVisible, false);
  }
});

test('area highlighting uses an interior underline without inventing unit grids on unscaled source art', () => {
  const p = plan(fixture('area')), f = frame(p, { cueIndex: index(p, 'result'), progress: 1, reveal: true });
  assert.deepEqual(f.highlight.paths[0].points, [{ x: 73, y: 167.5 }, { x: 457, y: 167.5 }]);
  assert.doesNotMatch(f.svg, /data-layer="canonical-unit-grid"/u);
  assert.match(text(f.svg), /24 cm²/u);
});

test('logical repetition is one source path with pending repeated-wire representation, not invented second-row geometry', () => {
  const p = plan(fixture('garden_two_rows'));
  const f = frame(p, { cueIndex: index(p, 'result', 'total_wire'), progress: 1, reveal: true });
  assert.equal(f.highlight.paths.length, 1);
  assert.equal(f.representationStatus, 'source_regions_with_semantic_review_pending');
  assert.ok(f.pending.includes('logical_repeat_representation_review'));
  assert.match(text(f.svg), /86 × 2 = 172 m/u);
});

test('new transfer shapes are honest text-only pending fallbacks, including revealed transfer answers', () => {
  const p = plan(fixture('concept_lesson'));
  for (const kind of ['transfer_prompt', 'transfer_answer']) {
    const cueIndex = index(p, kind), f = frame(p, { cueIndex, progress: 1, reveal: kind === 'transfer_answer' });
    assert.equal(f.sourceVisualId, null);
    assert.equal(f.sourceDiagramProof, false);
    assert.equal(f.highlight.paths.length, 0);
    assert.equal(f.highlight.pen, null);
    assert.ok(f.pending.includes('transfer_geometry_not_in_canonical_source'));
    assert.doesNotMatch(f.svg, /data-model=|data-layer="source-geometry"/u);
    if (kind === 'transfer_answer') assert.match(text(f.svg), /12 cm/u);
  }
});

test('inert style text does not become SVG markup, accessible text, URLs or provider calls', () => {
  const p = plan(fixture('perimeter', { style: '<image href="https://evil.invalid/a"/><script>alert(1)</script>&"\'' }));
  const f = frame(p, { cueIndex: index(p, 'why'), progress: 0.5 });
  assert.doesNotMatch(f.svg, /evil\.invalid|<script|<image|href=|@font-face|foreignObject/iu);
  assert.match(f.svg, /Kaynak &amp; gerekçe/u);
  assert.equal(f.providerCallsMade, 0);
});

test('serialized and caller-rehashed plans cannot become renderer authority', () => {
  const p = plan(), copied = structuredClone(p);
  assert.throws(() => frame(copied), /untrusted_reasoned_scene_plan/u);
  copied.models[0].instances[0].bounds.x++;
  const { contentSha256, ...body } = copied; copied.contentSha256 = hash(body);
  assert.throws(() => frame(copied), /untrusted_reasoned_scene_plan/u);
  assert.throws(() => frame(new Proxy(p, {})), /untrusted_reasoned_scene_plan/u);
});

test('source text geometry fake approvals and serialized or swapped trace/job fail before rendering', () => {
  for (const change of [q => { q.prompt += '<script>spoiler</script>'; }, q => { q.visual.svg += '<!-- altered -->'; },
    q => { q.visual.geometry.width++; }, q => { q.state = 'expert_approved'; }]) {
    const input = fixture(); change(input.source); rehashQuestion(input.source);
    assert.throws(() => plan(input), /reasoned_geometry_source_mismatch/u);
  }
  const first = fixture(), second = fixture('area');
  assert.throws(() => plan({ ...first, trace: structuredClone(first.trace) }), /untrusted_teaching_trace/u);
  assert.throws(() => plan({ ...first, job: structuredClone(first.job) }), /untrusted_reasoned_media_job/u);
  assert.throws(() => plan({ ...first, trace: second.trace }), /reasoned_geometry_trace_mismatch/u);
  assert.throws(() => plan({ ...first, job: second.job }), /reasoned_geometry_job_mismatch/u);
  assert.throws(() => plan({ ...first, geometry: resolveReasonedMediaGeometry(first) }), /invalid_reasoned_geometry_fields/u);
});

test('cue bounds, finite progress, booleans and exact option keys reject rather than silently clamp', () => {
  const p = plan();
  for (const options of [{ cueIndex: -1 }, { cueIndex: p.cues.length }, { cueIndex: 0.5 }, { cueIndex: '0' },
    { progress: -0.001 }, { progress: 1.001 }, { progress: NaN }, { progress: Infinity }, { progress: '0.5' },
    { reveal: 1 }, { approved: true }, { 'cueIndex,progress': 0 }, [], null]) {
    assert.throws(() => frame(p, options), /invalid_reasoned_scene_options/u);
  }
});

test('options getters, proxies, revoked proxies, cycles, symbols and foreign objects execute no caller hooks', () => {
  const p = plan(); let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'progress', { enumerable: true, get() { hooks++; return 0.5; } });
  const proxy = new Proxy({}, { ownKeys() { hooks++; return []; }, get() { hooks++; return 0; }, getPrototypeOf() { hooks++; return Object.prototype; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke(); const cycle = {}; cycle.progress = cycle;
  for (const value of [getter, proxy, revoked.proxy, cycle, { [Symbol('x')]: 1 }, new Date(), { progress() { hooks++; return 0; } }, { extra: 'x'.repeat(100000) }]) {
    assert.throws(() => frame(p, value), /invalid_reasoned_scene_options/u);
  }
  assert.equal(hooks, 0);
});

test('source root getters and proxies remain rejected with zero hooks through fresh resolver validation', () => {
  let hooks = 0; const input = fixture();
  const getter = { trace: input.trace, job: input.job };
  Object.defineProperty(getter, 'source', { enumerable: true, get() { hooks++; return input.source; } });
  const proxy = new Proxy(input, { ownKeys() { hooks++; return []; }, get() { hooks++; return null; } });
  assert.throws(() => plan(getter), /invalid_reasoned_geometry_data/u);
  assert.throws(() => plan(proxy), /invalid_reasoned_geometry_data/u);
  assert.equal(hooks, 0);
});

test('frame manifest hashes bind the current cue and safe layer without promoting media or publication approvals', () => {
  const p = plan(), f = frame(p, { cueIndex: index(p, 'why'), progress: 0.5, reveal: false });
  assert.equal(f.source.contentSha256, p.source.contentSha256);
  assert.equal(f.trace.contentSha256, p.trace.contentSha256);
  assert.equal(f.job.contentSha256, p.job.contentSha256);
  assert.equal(f.geometrySha256, p.geometrySha256);
  assert.equal(f.scenePlanSha256, p.contentSha256);
  assert.equal(f.svgSha256, bytesHash(f.svg));
  const { contentSha256, ...body } = f; assert.equal(contentSha256, hash(body));
  assert.ok(Object.isFrozen(f) && Object.isFrozen(f.highlight.paths[0].points));
  for (const value of [p, f]) {
    for (const key of ['videoRendered', 'audioGenerated', 'wordPenAlignmentVerified', 'teacherApproved', 'publicationReady', 'learnerReady', 'productionReady']) assert.equal(value[key], false);
    assert.equal(value.privacyInspection, 'not_performed');
    assert.equal(value.rightsReview, 'pending');
    assert.equal(value.audience, 'editor_review_only');
  }
});
