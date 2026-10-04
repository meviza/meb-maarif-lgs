import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsDraft } from '../packages/content-factory/grade6_common_relations_draft.mjs';
import { createGrade6CommonRelationsMediaPreparation } from '../packages/content-factory/grade6_common_relations_media_adapter.mjs';
import { auditReasonedTeachingTrace } from '../packages/contracts/reasoned_teaching_trace.mjs';
import { auditReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { renderReasonedCaptionFrame } from '../packages/media/reasoned_scene_renderer.mjs';

const api = await import('../packages/media/grade6_common_relations_scene.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [observations, matrix, registry] = await Promise.all(['grade6-common-relations-application-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry'].map(load));
const clone = value => structuredClone(value), sha = text => createHash('sha256').update(text).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
function binding() { return { applicationObservations: clone(observations), semanticMatrix: clone(matrix),
  sourceRecord: clone(registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik')) }; }
function input() { const sourceBindingInput = binding(), source = createGrade6CommonRelationsDraft(sourceBindingInput);
  return { source, sourceBindingInput, preparation: createGrade6CommonRelationsMediaPreparation(source, sourceBindingInput) }; }
function plan(data = input()) {
  assert.equal(typeof api.createGrade6CommonRelationsScenePlan, 'function', 'common-relations scene is missing');
  return api.createGrade6CommonRelationsScenePlan(data);
}
function frame(live, options = {}) {
  assert.equal(typeof api.renderGrade6CommonRelationsCaptionFrame, 'function', 'common-relations frame is missing');
  return api.renderGrade6CommonRelationsCaptionFrame(live, options);
}
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
const attrs = tag => Object.fromEntries([...tag.matchAll(/([A-Za-z_:][A-Za-z0-9_:.-]*)="([^"]*)"/gu)].map(value => [value[1], value[2]]));
const decode = text => text.replace(/&(?:amp|lt|gt|quot|apos);/gu, value => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" })[value]);
function texts(svg) { return [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/gu)].map(value => ({ attrs: attrs(value[1]), text: decode(value[2]) })); }
const invalid = error => error.message === 'invalid_common_relations_scene_input';
const invalidOptions = error => error.message === 'invalid_common_relations_frame_options';

// Break: caller claims or serialized job lookalikes are enough to mint a live scene, or public plan exposes full future narration.
test('closed scene factory consumes real live source-bound traces and jobs while its public plan omits future transcripts', () => {
  const data = input(), before = JSON.stringify(data), live = plan(data);
  assert.equal(JSON.stringify(data), before); assert.equal(live.schemaVersion, 'grade6-common-relations-scene-plan/v1');
  assert.equal(live.state, 'common_relations_scene_plan_draft'); assert.deepEqual(live.contexts.map(c => c.contextId), ['repeat', 'grouping']);
  assert.equal(live.contexts.every(c => c.cueCount === 10), true); assert.equal(live.preparationSha256, data.preparation.contentSha256);
  assert.equal(live.source.id, 'grade6-common-relations-two-context-v1'); assert.equal(live.source.contentSha256, data.source.contentSha256);
  assert.equal(live.source.authoredTaskSha256, data.source.authoredTaskSha256);
  for (const c of data.preparation.contexts) { assert.equal(auditReasonedTeachingTrace(c.trace).structuralChecks, 'passed'); assert.equal(auditReasonedMediaJob(c.job).jobId, c.job.id); }
  const publicText = JSON.stringify(live);
  for (const c of data.preparation.contexts) for (const cue of c.job.cues) assert.equal(publicText.includes(cue.transcript), false);
  assert.equal(Object.hasOwn(live, 'sourceBindingInput'), false); assert.equal(Object.hasOwn(live, 'preparation'), false);
  assert.equal(Object.hasOwn(live, 'paths'), false); assert.equal(Object.hasOwn(live, 'answerKey'), false);
  assert.equal(live.genericRendererSupported, false); assert.equal(live.semanticReview, 'pending');
});

// Break: timeline loses a series, maps time inconsistently, includes start in the target interval or drops the right endpoint.
test('actual repeat SVG retains all sixteen literal differently shaped time marks with correct start and endpoint conditions', () => {
  const { frame: f } = frame(plan(), { contextId: 'repeat' });
  const marks = [...f.svg.matchAll(/<(circle|rect)\b[^>]*data-series="([^"]+)" data-minute="(\d+)"[^>]*>/gu)].map(value => ({ tag: value[1], series: value[2], minute: Number(value[3]), attrs: attrs(value[0]) }));
  const six = marks.filter(value => value.series === 'six-minute'), eight = marks.filter(value => value.series === 'eight-minute');
  assert.deepEqual(six.map(value => value.minute), [0, 6, 12, 18, 24, 30, 36, 42, 48]);
  assert.deepEqual(eight.map(value => value.minute), [0, 8, 16, 24, 32, 40, 48]);
  assert.equal(six.every(value => value.tag === 'circle'), true); assert.equal(eight.every(value => value.tag === 'rect'), true);
  assert.equal(six[0].attrs['data-in-window'], 'false'); assert.equal(eight[0].attrs['data-in-window'], 'false');
  assert.equal(six.at(-1).attrs['data-in-window'], 'true'); assert.equal(eight.at(-1).attrs['data-in-window'], 'true');
  const coordinate = value => Number(value.attrs.cx ?? Number(value.attrs.x) + Number(value.attrs.width) / 2);
  const start = coordinate(six[0]), end = coordinate(six.at(-1));
  for (const value of [...six, ...eight]) assert.equal(coordinate(value), start + value.minute / 48 * (end - start));
  assert.equal(f.literalUnits.includes('minute'), true); assert.equal(f.sourceDiagramProof, true);
  assert.equal(texts(f.svg).every(value => Number(value.attrs['font-size']) >= 18), true);
});

// Break: group-size/count columns swap units, one valid divisor is dropped, or generated text is a placeholder instead of numeric cells.
test('actual grouping SVG table has six hand-derived size rows and separate package-count columns', () => {
  const { frame: f } = frame(plan(), { contextId: 'grouping' }), rendered = texts(f.svg);
  const rows = Array.from({ length: 6 }, (_, row) => rendered.filter(value => value.attrs['data-group-row'] === String(row))
    .sort((a, b) => Number(a.attrs['data-group-column']) - Number(b.attrs['data-group-column'])).map(value => Number(value.text)));
  assert.deepEqual(rows, [[1, 24, 36], [2, 12, 18], [3, 8, 12], [4, 6, 9], [6, 4, 6], [12, 2, 3]]);
  assert.deepEqual(f.literalUnits, ['card_per_package', 'package']);
  assert.ok(rendered.some(value => value.text.includes('kart/paket'))); assert.ok(rendered.some(value => value.text.includes('paket sayısı')));
  assert.equal(rendered.every(value => Number(value.attrs['font-size']) >= 18), true);
  assert.equal(f.sourceDiagramProof, true);
});

// Break: future or protected narration is copied into the current frame, title/desc/aria or selected-page metadata.
test('all protected cues require both explicit reveal and completed progress across the entire frame and narration DTO', () => {
  const data = input(), live = plan(data);
  for (const context of data.preparation.contexts) for (const cue of context.job.cues.filter(value => protectedKinds.has(value.kind))) {
    for (const [progress, reveal] of [[0, false], [.5, false], [1, false], [0, true], [.5, true]]) {
      const output = frame(live, { contextId: context.contextId, cueIndex: cue.order, progress, reveal });
      assert.equal(output.frame.responseLocked, true); assert.equal(output.frame.resultVisible, false);
      assert.equal(output.narrationPacket.fullTranscript, null); assert.equal(output.narrationPacket.fullTranscriptSha256, null);
      assert.equal(output.frame.fullTranscriptSha256, null); assert.equal(output.frame.result, null);
      assert.equal(output.narrationPacket.transcriptVisibility, 'protected_response_locked');
      assert.equal(output.frame.highlight.paths.length, 0); assert.equal(output.frame.highlight.pen, null);
      assert.equal(output.frame.highlight.semanticRegion, 'none');
      assert.equal(JSON.stringify(output).includes(cue.transcript), false);
      assert.equal(output.frame.pageCount, 1); assert.throws(() => frame(live, { contextId: context.contextId, cueIndex: cue.order, progress, reveal, pageIndex: 1 }), invalidOptions);
      for (const future of context.job.cues.filter(value => value.order > cue.order)) assert.equal(JSON.stringify(output).includes(future.transcript), false);
    }
    const shown = frame(live, { contextId: context.contextId, cueIndex: cue.order, progress: 1, reveal: true });
    assert.equal(shown.frame.responseLocked, false); assert.equal(shown.frame.resultVisible, true);
    assert.equal(shown.narrationPacket.fullTranscript, cue.transcript);
  }
});

// Break: metadata carries all future cue pages or reconstructing current pagination silently drops words/whitespace.
test('real caption pagination reconstructs only the exact current cue and binds the selected page without future narration', () => {
  const data = input(), live = plan(data);
  for (const context of data.preparation.contexts) for (const cue of context.job.cues) {
    const first = frame(live, { contextId: context.contextId, cueIndex: cue.order, progress: 1, reveal: true });
    assert.equal(first.narrationPacket.fullTranscript, cue.transcript);
    const restored = first.narrationPacket.pages.flatMap(page => page.lines.map((line, i) => line + page.lineSpans[i].separatorAfter)).join('');
    assert.equal(restored, cue.transcript); assert.equal(first.narrationPacket.fullTranscriptSha256, sha(cue.transcript));
    for (const page of first.narrationPacket.pages) {
      assert.equal(page.lines.length <= 2, true); assert.equal(page.lines.every(line => line.length <= 62), true);
      const output = frame(live, { contextId: context.contextId, cueIndex: cue.order, pageIndex: page.pageIndex, progress: 1, reveal: true });
      assert.deepEqual(output.frame.selectedPage, page); assert.equal(output.frame.pageIndex, page.pageIndex);
      assert.equal(output.frame.selectedPageSha256, sha(JSON.stringify(page)));
      const svgCaption = texts(output.frame.svg).filter(value => Object.hasOwn(value.attrs, 'data-caption-line'));
      assert.deepEqual(svgCaption.map(value => value.text), page.lines);
      const future = context.job.cues.at(-1);
      if (cue.order !== future.order) assert.equal(JSON.stringify(output).includes(future.transcript), false);
    }
  }
});

// Break: a why/plan cue highlights only a correct matching card or source result rows before response reveal.
test('early cues highlight given conditions or operation purpose rather than answer-specific marks and mappings', () => {
  const live = plan();
  for (const contextId of ['repeat', 'grouping']) {
    for (const cueIndex of [0, 1, 2]) {
      const f = frame(live, { contextId, cueIndex, progress: 1 }).frame;
      assert.equal(f.highlight.semanticRegion, 'given_conditions'); assert.equal(f.result, null);
      assert.equal(f.highlight.paths.some(path => path.anchorKind === 'canonical_result'), false);
    }
    const why = frame(live, { contextId, cueIndex: 3, progress: 1 }).frame;
    assert.equal(why.highlight.semanticRegion, 'operation_purpose'); assert.equal(why.result, null);
    assert.equal(/data-(?:correct|answer|selected-card)|correctMapping|selectedCardId/u.test(JSON.stringify(why)), false);
    assert.equal(why.highlight.paths.some(path => path.anchorKind === 'canonical_result'), false);
  }
});

// Break: an apparent pen jumps independently of the highlighted region, leaves bounds, or pretends to be handwriting/word-timed motion.
test('programmatic highlight grows continuously within the source coordinates without human or audio timing claims', () => {
  const live = plan(), options = { contextId: 'repeat', cueIndex: 3 };
  const zero = frame(live, { ...options, progress: 0 }).frame, half = frame(live, { ...options, progress: .5 }).frame,
    full = frame(live, { ...options, progress: 1 }).frame;
  assert.equal(zero.highlight.pen, null); assert.equal(zero.highlight.drawnLength, 0);
  assert.ok(half.highlight.drawnLength > 0); assert.equal(half.highlight.drawnLength, full.highlight.totalLength / 2);
  assert.equal(full.highlight.drawnLength, full.highlight.totalLength);
  for (const f of [half, full]) {
    const pen = f.highlight.pen, lastPath = f.highlight.paths.at(-1); assert.deepEqual(pen, lastPath.points.at(-1));
    assert.ok(pen.x >= 0 && pen.x <= 760 && pen.y >= 0 && pen.y <= f.captionLayout.sourceHeightSvgUnits);
    assert.equal(f.penMeaning, 'programmatic_highlight_not_human_handwriting');
    assert.equal(f.wordPenAlignmentVerified, false); assert.equal(f.videoRendered, false); assert.equal(f.audioGenerated, false);
  }
});

// Break: protected result shapes are drawn before the gate, or shown results use wrong units/coordinates unrelated to canonical data.
test('revealed response geometry marks canonical common times or valid group rows without relabeling real units', () => {
  const live = plan();
  const repeat = frame(live, { contextId: 'repeat', cueIndex: 4, progress: 1, reveal: true }).frame;
  assert.deepEqual(repeat.result, { values: [24, 48], unit: 'minute' });
  assert.equal(repeat.highlight.semanticRegion, 'canonical_result'); assert.equal(repeat.highlight.paths.length, 4);
  const grouping = frame(live, { contextId: 'grouping', cueIndex: 4, progress: 1, reveal: true }).frame;
  assert.deepEqual(grouping.result, { values: [1, 2, 3, 4, 6, 12], unit: 'card_per_package' });
  assert.equal(grouping.highlight.semanticRegion, 'canonical_result'); assert.equal(grouping.highlight.paths.length, 6);
  assert.equal(grouping.numericStepsChecked, 0); assert.equal(repeat.numericStepsChecked, 0);
});

// Native QA break: the result's vertical join crossed both literal number labels.
// These conservative layout bands are not a native glyph-fit certificate.
test('revealed time highlights and pen stay outside numeric label bands while enclosing both common marks in each series', () => {
  const live = plan();
  for (const cueIndex of [4, 6, 7]) {
    const f = frame(live, { contextId: 'repeat', cueIndex, progress: 1, reveal: true }).frame;
    const labels = texts(f.svg).filter(value => /^\d+$/u.test(value.text));
    const bands = [...new Set(labels.map(value => Number(value.attrs.y)))].map(baseline => ({ from: baseline - 18, to: baseline + 4.5 }));
    assert.deepEqual(bands, [{ from: 86, to: 108.5 }, { from: 154, to: 176.5 }]);
    for (const path of f.highlight.paths) for (let index = 1; index < path.points.length; index++) {
      const from = Math.min(path.points[index - 1].y, path.points[index].y) - 1.5;
      const to = Math.max(path.points[index - 1].y, path.points[index].y) + 1.5;
      for (const band of bands) assert.equal(to < band.from || from > band.to, true, 'result stroke crosses a number-label band');
    }
    const penBand = { from: f.highlight.pen.y - 13, to: f.highlight.pen.y + 4 };
    for (const band of bands) assert.equal(penBand.to < band.from || penBand.from > band.to, true, 'pen covers a number-label band');
    const loops = f.highlight.paths.map(path => ({
      x: (Math.min(...path.points.map(p => p.x)) + Math.max(...path.points.map(p => p.x))) / 2,
      y: (Math.min(...path.points.map(p => p.y)) + Math.max(...path.points.map(p => p.y))) / 2,
    }));
    assert.deepEqual(loops, [{ x: 408, y: 70 }, { x: 408, y: 138 }, { x: 696, y: 70 }, { x: 696, y: 138 }]);
    for (const path of f.highlight.paths) assert.deepEqual(path.points[0], path.points.at(-1));
    assert.deepEqual(f.result, { values: [24, 48], unit: 'minute' });
  }
});

// Break: source timeline/table is silently reused as geometric proof of a new transfer case.
test('every transfer cue stays geometry-unsupported even when its current text response is explicitly revealed', () => {
  const live = plan();
  for (const contextId of ['repeat', 'grouping']) for (const cueIndex of [8, 9]) for (const progress of [0, .5, 1]) for (const reveal of [false, true]) {
    const output = frame(live, { contextId, cueIndex, progress, reveal });
    assert.equal(output.frame.sourceDiagramProof, false); assert.equal(output.frame.sourceVisualId, null);
    assert.equal(output.frame.representationStatus, 'transfer_geometry_not_in_source_pending');
    assert.equal(output.frame.highlight.paths.length, 0); assert.equal(output.frame.highlight.pen, null);
    assert.equal(/data-series=|data-group-row=/u.test(output.frame.svg), false);
    assert.ok(output.frame.pending.includes('transfer_geometry_not_in_source'));
  }
});

// Break: a clone/hash acquires the live plan capability or generic old renderer accepts specialized plan as its brand.
test('serialized tampered foreign and rehashed plans never gain either specialized or generic renderer authority', () => {
  const live = plan(), serialized = clone(live); serialized.contentSha256 = sha(JSON.stringify(serialized));
  for (const value of [clone(live), serialized, {}, null, input().preparation]) {
    assert.throws(() => frame(value), error => error.message === 'untrusted_common_relations_scene_plan');
  }
  assert.throws(() => renderReasonedCaptionFrame(live, {}), /untrusted_reasoned_scene_plan/u);
  assert.equal(live.serializedAuthority, 'none'); assert.equal(Object.isFrozen(live), true);
  assert.throws(() => { live.gates.answer = 'approved'; }, TypeError);
});

// Break: matching hash strings let serialized/branded-but-different preparation pass the original capability and full canonical checks.
test('scene creation rejects cloned preparation and live branded wrong bindings before issuing a plan', () => {
  const data = input(); assert.throws(() => plan({ ...data, preparation: clone(data.preparation) }), invalid);
  const changed = { ...data, preparation: { ...data.preparation, contentSha256: 'f'.repeat(64) } };
  assert.throws(() => plan(changed), invalid);
  const contexts = [...data.preparation.contexts].reverse(); assert.throws(() => plan({ ...data, preparation: { ...data.preparation, contexts } }), invalid);
  const mixed = { ...data.preparation, contexts: data.preparation.contexts.map((c, i) => ({ ...c, job: data.preparation.contexts[1 - i].job })) };
  assert.throws(() => plan({ ...data, preparation: mixed }), invalid);
  assert.deepEqual(plan({ ...data, source: clone(data.source) }), plan(data));
});

// Break: source/rights/purpose/result/hash promotion legitimizes an altered source or narrative scene.
test('canonical source and preparation changes fail closed even with fresh caller-computed hash claims', () => {
  for (const mutate of [d => { d.source.answerKey.repeat = 'evidence-sum'; }, d => { d.source.problem.evidenceCards[0].values = [0, 24, 48]; },
    d => { d.source.scope.formalGcdLcmTeachingAllowed = true; }, d => { d.source.gates.answer = 'approved'; },
    d => { d.sourceBindingInput.sourceRecord.reuseRights = 'approved'; },
    d => { d.sourceBindingInput.applicationObservations.boundaries.formalGcdLcmTeachingAllowed = true; },
    d => { d.sourceBindingInput.semanticMatrix.source.sha256 = 'f'.repeat(64); }]) {
    const data = input(), changed = { ...data, source: clone(data.source), sourceBindingInput: clone(data.sourceBindingInput) };
    mutate(changed); const body = Object.fromEntries(Object.entries(changed.source).filter(([key]) => key !== 'contentSha256'));
    changed.source.contentSha256 = sha(`k12.grade6-common-relations.draft/v1:${JSON.stringify(canonical(body))}`);
    assert.throws(() => plan(changed), invalid);
  }
});

// Break: hidden/unknown options, null values or out-of-range pages are read, coerced or clamped instead of rejected.
test('frame primitive option and page bounds are closed and never silently default null or clamp values', () => {
  const live = plan();
  for (const options of [null, [], true, 'repeat', { contextId: 'outside' }, { contextId: null }, { cueIndex: -1 }, { cueIndex: 10 },
    { cueIndex: 1.5 }, { cueIndex: null }, { progress: -.1 }, { progress: 1.1 }, { progress: Infinity }, { progress: NaN },
    { progress: null }, { reveal: 1 }, { reveal: null }, { pageIndex: -1 }, { pageIndex: 32 }, { pageIndex: .5 },
    { pageIndex: null }, { voice: 'paid' }, { width: 300 }, { constructor: 1 }]) assert.throws(() => frame(live, options), invalidOptions);
  const hidden = {}; Object.defineProperty(hidden, 'reveal', { value: true }); assert.throws(() => frame(live, hidden), invalidOptions);
  const symbol = { [Symbol('x')]: true }; assert.throws(() => frame(live, symbol), invalidOptions);
  assert.throws(() => frame(live, { pageIndex: 1 }), invalidOptions);
  assert.equal(frame(live, Object.create(null)).frame.cueIndex, 0);
});

// Break: equal zero choices produce distinct signed-zero metadata or hashes.
test('negative zero cursor page and progress canonicalize to the same current frame as positive zero', () => {
  const live = plan();
  assert.deepEqual(frame(live, { cueIndex: -0, pageIndex: -0, progress: -0 }), frame(live, { cueIndex: 0, pageIndex: 0, progress: 0 }));
});

// Break: getters/revoked proxies/cycles reach option/source access or future-lookup before inert validation.
test('hostile factory plan and options data run zero caller hooks and expose only constant bounded errors', () => {
  const data = input(), live = plan(data); let hooks = 0;
  const outerGetter = {}; Object.defineProperty(outerGetter, 'source', { enumerable: true, get() { hooks++; return data.source; } });
  const proxy = new Proxy(data, { get() { hooks++; throw new Error('private'); }, ownKeys() { hooks++; throw new Error('private'); } });
  const revoked = Proxy.revocable(data, {}); revoked.revoke();
  const cyclic = { ...data }; cyclic.extra = cyclic;
  const hidden = { ...data }; Object.defineProperty(hidden, 'extra', { value: true });
  for (const value of [outerGetter, proxy, revoked.proxy, cyclic, hidden, { ...data, extra: 1 }]) assert.throws(() => plan(value), invalid);
  const optionsGetter = {}; Object.defineProperty(optionsGetter, 'reveal', { enumerable: true, get() { hooks++; return true; } });
  const optionsProxy = new Proxy({}, { get() { hooks++; throw new Error('private'); }, ownKeys() { hooks++; throw new Error('private'); } });
  const optionsRevoked = Proxy.revocable({}, {}); optionsRevoked.revoke();
  for (const options of [optionsGetter, optionsProxy, optionsRevoked.proxy, { cueIndex: { valueOf() { hooks++; return 4; } } }]) assert.throws(() => frame(live, options), invalidOptions);
  const planProxy = new Proxy(live, { get() { hooks++; throw new Error('private'); } });
  assert.throws(() => frame(planProxy), /untrusted_common_relations_scene_plan/u);
  assert.equal(hooks, 0);
});

// Break: extra factory arguments or frame arguments introduce configuration hooks outside the fixed contract.
test('exact factory and frame arities reject missing and extra parameters without reading them', () => {
  assert.equal(typeof api.createGrade6CommonRelationsScenePlan, 'function', 'common-relations scene is missing');
  assert.equal(typeof api.renderGrade6CommonRelationsCaptionFrame, 'function', 'common-relations frame is missing');
  const data = input(), live = plan(data); let hooks = 0;
  const extra = new Proxy({}, { get() { hooks++; throw new Error('private'); } });
  for (const args of [[], [data, extra]]) assert.throws(() => api.createGrade6CommonRelationsScenePlan(...args), /invalid_common_relations_scene_arguments/u);
  for (const args of [[], [live], [live, {}, extra]]) assert.throws(() => api.renderGrade6CommonRelationsCaptionFrame(...args), /invalid_common_relations_frame_arguments/u);
  assert.equal(hooks, 0);
});

// Break: source/preparation over-budget payloads or non-data arrays become arbitrary XML/narration at a factory sink.
test('bounded malformed sparse deep oversized and markup sources cannot be converted into scene plans', () => {
  for (const mutate of [d => { d.source = null; }, d => { d.preparation.contexts = new Array(2); }, d => { d.preparation.contexts[0].path = null; },
    d => { d.source.prompt = '<svg onload="private">'; }, d => { d.preparation.editorView.html = 'x'.repeat(65537); },
    d => { let value = d.source; for (let i = 0; i < 40; i++) { value.extra = {}; value = value.extra; } }]) {
    const original = input(), data = { ...original, source: clone(original.source), preparation: { ...original.preparation,
      contexts: original.preparation.contexts.map(c => ({ ...c })), editorView: { ...original.preparation.editorView } } };
    mutate(data); assert.throws(() => plan(data), invalid);
  }
});

// Closed-schema rejection already precedes issuance; these witnesses also cover
// key-sized input profiles without falsely treating their prior rejection as RED.
test('long UTF8 keys and overfull own-key objects remain rejected without hooks or a partial scene capability', () => {
  const live = plan(); let hooks = 0;
  const malformed = [
    { ['x'.repeat(65537)]: null },
    { ['ö'.repeat(129)]: null },
    Object.fromEntries(Array.from({ length: 129 }, (_, index) => [`key${index}`, null])),
    { ['\u0000key']: null },
  ];
  for (const options of malformed) assert.throws(() => frame(live, options), invalidOptions);
  for (const extra of malformed) {
    const data = input(); data.source = { ...clone(data.source), ...extra };
    assert.throws(() => plan(data), invalid);
  }
  const key = 'x'.repeat(65537), hostile = {};
  Object.defineProperty(hostile, key, { enumerable: true, get() { hooks++; return 1; } });
  assert.throws(() => frame(live, hostile), invalidOptions); assert.equal(hooks, 0);
  assert.deepEqual(frame(live), frame(live));
});

// Break: static SVG title/desc/aria reuse response prose, XML resource/event attributes or a full job may leak into the browser frame.
test('each current SVG has only safe local primitives and self-contained names with no script external resource or full preparation', () => {
  const output = frame(plan()), svg = output.frame.svg;
  for (const tag of ['script', 'image', 'use', 'foreignObject', 'iframe', 'audio', 'video', 'style']) assert.equal(new RegExp(`<${tag}\\b`, 'u').test(svg), false);
  assert.equal(/\s(?:on[a-z]+|href|xlink:href|src)=/iu.test(svg), false);
  assert.equal(/<!ENTITY|<!DOCTYPE|url\s*\(/iu.test(svg), false);
  assert.equal((svg.match(/<title>/gu) ?? []).length, 1); assert.equal((svg.match(/<desc>/gu) ?? []).length, 1);
  assert.equal(svg.includes('role="img"'), true); assert.equal(svg.includes('aria-label='), true);
  assert.equal(/\bid="|aria-labelledby=/u.test(svg), false);
  assert.equal(Object.hasOwn(output.frame, 'preparation'), false); assert.equal(Object.hasOwn(output.frame, 'contexts'), false);
  assert.equal(Object.hasOwn(output.narrationPacket, 'jobCues'), false);
  assert.equal(output.narrationPacket.contentFormat, 'plain_text_textContent_only');
});

// Break: hashes/budget or readiness fields grant rendering/caption/student/audio acceptance beyond this in-memory SVG preparation.
test('frozen frame and current packet hashes are exact bounded editor data with every downstream quality gate still pending', () => {
  const live = plan(), output = frame(live), f = output.frame, n = output.narrationPacket;
  assert.equal(f.svgSha256, sha(f.svg)); assert.equal(n.frameSha256, f.contentSha256); assert.equal(n.frameSvgSha256, f.svgSha256);
  assert.equal(f.scenePlanSha256, live.contentSha256); assert.equal(f.preparationSha256, live.preparationSha256);
  assert.equal(f.geometrySha256, live.geometrySha256); assert.equal(f.source.contentSha256, live.source.contentSha256);
  assert.deepEqual(frame(live), output); assert.equal(Buffer.byteLength(f.svg) <= 65536, true); assert.equal(Buffer.byteLength(JSON.stringify(output)) <= 131072, true);
  assert.equal(Object.isFrozen(output), true); assert.equal(Object.isFrozen(n.pages[0].lineSpans[0]), true);
  assert.equal(f.captionLayout.fontSizeSvgUnits >= 18, true); assert.equal(f.captionLayout.glyphFitVerified, false);
  assert.equal(f.captionLayout.newUnitAtomsVerified, false); assert.equal(f.captionLayout.measurement, 'utf16_code_units_not_rendered_glyph_width');
  for (const object of [live, f, n]) {
    for (const key of ['publicationReady', 'learnerReady', 'productionReady', 'teacherApproved', 'audioGenerated', 'videoRendered', 'wordPenAlignmentVerified', 'accessibilityPassed']) assert.equal(object[key], false);
    assert.equal(object.audience, 'editor_review_only'); assert.equal(object.serializedAuthority, 'none');
    assert.equal(object.inferredAnswerProtection, false); assert.equal(object.providerCallsMade, 0);
  }
  assert.deepEqual(live.counts, { existingAuthoredDrafts: 1, newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(Object.values(live.gates).every(value => value === 'pending'), true);
});
