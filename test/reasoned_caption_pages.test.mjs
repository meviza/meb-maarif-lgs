import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRectangleQuestion, createGardenQuestion } from '../packages/content-factory/pilot.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { createReasonedScenePlan, renderReasonedSceneFrame } from '../packages/media/reasoned_scene_renderer.mjs';

const api = await import('../packages/media/reasoned_caption_pages.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const bytesHash = value => createHash('sha256').update(value).digest('hex');
function fixture(family = 'perimeter', options = {}) {
  const source = family === 'concept_lesson' ? createPerimeterLesson()
    : family === 'garden_two_rows' ? createGardenQuestion({ id: 'caption-garden' })
      : createRectangleQuestion({ id: `caption-${family}`, template: family, width: 6, height: 4, gate: 2 });
  const trace = family === 'concept_lesson' ? createReasonedPerimeterLessonTrace() : createReasonedMathTrace(source);
  return createReasonedScenePlan({ source, trace, job: createReasonedMediaJob(trace, options) });
}
function captions(plan, options) {
  assert.equal(typeof api.createReasonedCaptionPages, 'function', 'caption pages not implemented');
  return api.createReasonedCaptionPages(plan, options);
}
function paginate(text) {
  assert.equal(typeof api.paginateReasonedCaptionText, 'function', 'bounded caption text paginator not implemented');
  return api.paginateReasonedCaptionText(text);
}
function restored(output) {
  return output.pages.map(page => page.lines.map((line, i) => line + page.lineSpans[i].separatorAfter).join('')).join('');
}
const index = (plan, kind, stepId) => plan.cues.findIndex(cue => cue.kind === kind && (stepId === undefined || cue.stepId === stepId));
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);

// Break caught: shortening a dense source cue, changing its capitalization, or
// returning future cue text while trying to simplify its visual presentation.
for (const family of ['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap', 'garden_two_rows', 'concept_lesson']) {
  test(`${family} pages preserve every current canonical cue without changing narration or source artifacts`, () => {
    const plan = fixture(family), before = JSON.stringify(plan);
    for (let cueIndex = 0; cueIndex < plan.cues.length; cueIndex++) {
      const cue = plan.cues[cueIndex], output = captions(plan, { cueIndex, progress: 1, reveal: true });
      assert.equal(output.fullTranscript, cue.transcript);
      assert.equal(output.fullTranscriptSha256, bytesHash(cue.transcript));
      assert.equal(output.displayText, cue.transcript);
      assert.equal(restored(output), cue.transcript);
      assert.equal(output.cueId, cue.id);
      assert.ok(output.pages.length >= 1 && output.pages.length <= 32);
      for (const page of output.pages) {
        assert.ok(page.lines.length >= 1 && page.lines.length <= 2);
        for (let i = 0; i < page.lines.length; i++) {
          assert.ok(page.lines[i].length <= 62);
          const span = page.lineSpans[i]; assert.equal(page.lines[i], cue.transcript.slice(span.start, span.end));
        }
      }
    }
    assert.equal(JSON.stringify(plan), before);
  });
}

test('a dense garden evidence paragraph becomes multiple two-line pages without replacing the full narration', () => {
  const plan = fixture('garden_two_rows'), cueIndex = index(plan, 'evidence'), output = captions(plan, { cueIndex, progress: 0.5 });
  assert.ok(output.pages.length >= 4);
  assert.match(output.fullTranscript, /Kısa kenarın soruda verilen uzunluğu/u);
  assert.match(output.fullTranscript, /tel sırası sayısı değildir/u);
  assert.match(output.fullTranscript, /Her tel sırasında açık bırakılan kapı/u);
  assert.equal(restored(output), plan.cues[cueIndex].transcript);
  assert.equal(output.resultVisible, false); // Evidence itself is not a result.
});

// Literal boundary: a 60-unit word leaves no room for the five-unit "12 cm"
// atom; the number and unit must move together without adding/removing text.
test('word number-unit and mathematical-expression atoms never split across caption lines', () => {
  const first = paginate('A'.repeat(60) + ' 12 cm sonra');
  assert.deepEqual(first.pages.map(page => page.lines), [['A'.repeat(60), '12 cm sonra']]);
  assert.equal(restored(first), 'A'.repeat(60) + ' 12 cm sonra');
  const second = paginate('Ö'.repeat(59) + ' 3 + 3 + 3 + 3 = 12 cm. Sonra 3 × 3 = 9 cm².');
  assert.deepEqual(second.pages.map(page => page.lines), [['Ö'.repeat(59), '3 + 3 + 3 + 3 = 12 cm. Sonra 3 × 3 = 9 cm².']]);
  assert.equal(restored(second), 'Ö'.repeat(59) + ' 3 + 3 + 3 + 3 = 12 cm. Sonra 3 × 3 = 9 cm².');
});

test('canonical Turkish spoken units remain attached to their number at a full-line boundary', () => {
  for (const unit of ['santimetre', 'santimetrekare', 'metre', 'metrekare', 'adet']) {
    const input = 'a'.repeat(59) + ` 12 ${unit} sonra`, output = paginate(input);
    assert.deepEqual(output.pages.map(page => page.lines), [['a'.repeat(59), `12 ${unit} sonra`]]);
    assert.equal(restored(output), input);
  }
});

test('explicit positive numeric signs keep their units in the same caption atom', () => {
  for (const number of ['+3', '+3.5', '+3,5', '+3/2']) {
    const input = 'a'.repeat(59) + ` ${number} cm sonra`, output = paginate(input);
    assert.deepEqual(output.pages.map(page => page.lines), [['a'.repeat(59), `${number} cm sonra`]]);
    assert.equal(restored(output), input);
  }
});

test('exact spaces and lowercase canonical starts survive paging without title-casing or shortening', () => {
  const input = 'ilk ' + 'a'.repeat(57) + '   ikinci cümle & ölçü 3/2. üçüncü';
  const output = paginate(input);
  assert.equal(restored(output), input);
  assert.match(output.pages[0].lines[0], /^ilk /u);
  assert.equal(output.pages[0].lineSpans[0].separatorAfter, '   ');
  assert.ok(output.pages.flatMap(page => page.lines).some(line => line.includes('3/2.')));
});

test('a single overlong word or overlong math atom fails closed instead of slicing or truncating', () => {
  assert.deepEqual(paginate('a'.repeat(62)).pages[0].lines, ['a'.repeat(62)]);
  assert.throws(() => paginate('a'.repeat(63)), /reasoned_caption_token_too_long/u);
  assert.throws(() => paginate('1 + '.repeat(16) + '1 = 17 cm'), /reasoned_caption_token_too_long/u);
  assert.throws(() => paginate('a'.repeat(63) + ' son'), /reasoned_caption_token_too_long/u);
});

test('caption text and page budgets are fixed and cannot be expanded through options', () => {
  assert.throws(() => paginate(('a'.repeat(62) + ' ').repeat(64) + 'a'), /reasoned_caption_page_budget_exceeded/u);
  assert.throws(() => paginate('a'.repeat(4097)), /invalid_reasoned_caption_text/u);
  for (const value of ['', ' ', ' padded', 'padded ', 'line\nline', 'line\tline', null, 2, new String('text')]) {
    assert.throws(() => paginate(value), /invalid_reasoned_caption_text/u);
  }
  const plan = fixture();
  assert.throws(() => captions(plan, { maxPages: 1000 }), /invalid_reasoned_scene_options/u);
  assert.throws(() => captions(plan, { lineLimit: 1000 }), /invalid_reasoned_scene_options/u);
});

test('every protected response uses only a safe placeholder until renderer reveal and progress both permit it', () => {
  for (const family of ['perimeter', 'garden_two_rows', 'concept_lesson']) {
    const plan = fixture(family);
    for (let cueIndex = 0; cueIndex < plan.cues.length; cueIndex++) {
      if (!protectedKinds.has(plan.cues[cueIndex].kind)) continue;
      for (const options of [{ progress: 0, reveal: true }, { progress: 0.5, reveal: true }, { progress: 1, reveal: false }]) {
        const output = captions(plan, { cueIndex, ...options });
        assert.equal(output.resultVisible, false);
        assert.equal(output.fullTranscript, null);
        assert.equal(output.fullTranscriptSha256, null);
        assert.equal(output.transcriptVisibility, 'protected_response_locked');
        assert.equal(restored(output), output.displayText);
        assert.ok(!JSON.stringify(output).includes(plan.cues[cueIndex].transcript));
        assert.match(output.displayText, /Yanıt henüz gösterilmiyor/u);
      }
    }
  }
});

test('only the selected current cue narration is emitted, never later intermediate results or answer assets', () => {
  const plan = fixture('garden_two_rows'), cueIndex = index(plan, 'why', 'equal_part');
  const output = captions(plan, { cueIndex, progress: 0.5 });
  assert.equal(output.fullTranscript, plan.cues[cueIndex].transcript);
  assert.doesNotMatch(JSON.stringify(output), /172 metre|86 çarpı|27 metre|<svg|aria-label/u);
  assert.equal(Object.hasOwn(output, 'assets'), false);
  assert.equal(Object.hasOwn(output, 'svg'), false);
});

test('transfer captions keep text-only new-shape pending rather than asserting source diagram proof', () => {
  const plan = fixture('concept_lesson');
  for (const kind of ['transfer_prompt', 'transfer_answer']) {
    const output = captions(plan, { cueIndex: index(plan, kind), progress: 1, reveal: true });
    assert.equal(output.sourceDiagramProof, false);
    assert.equal(output.representationStatus, 'unsupported_new_geometry_pending');
    assert.ok(output.pending.includes('transfer_geometry_not_in_canonical_source'));
    assert.equal(restored(output), output.fullTranscript);
  }
});

test('plain text is literal data for textContent, not HTML SVG escaped markup or an executable caption', () => {
  const literal = '<img src="x" onerror="y"> & "literal"';
  const output = paginate(literal);
  assert.equal(restored(output), literal);
  assert.equal(output.contentFormat, 'plain_text_textContent_only');
  assert.equal(Object.hasOwn(output, 'html'), false);
  assert.equal(Object.hasOwn(output, 'svg'), false);
  assert.equal(output.sourceAuthority, 'none');
  const plan = fixture('perimeter', { style: '<script>style-secret</script>&"\'' });
  assert.doesNotMatch(JSON.stringify(captions(plan)), /style-secret|<script>/u);
});

test('clones caller-rehashed pages source swaps and proxy plans never become source authority', () => {
  const plan = fixture(), fake = structuredClone(plan);
  assert.throws(() => captions(fake), /untrusted_reasoned_scene_plan/u);
  fake.cues[0].transcript = 'a'.repeat(63); const { contentSha256, ...body } = fake; fake.contentSha256 = hash(body);
  assert.throws(() => captions(fake), /untrusted_reasoned_scene_plan/u);
  assert.throws(() => captions(captions(plan)), /untrusted_reasoned_scene_plan/u);
  assert.throws(() => captions(new Proxy(plan, {})), /untrusted_reasoned_scene_plan/u);
});

test('options getters proxies cycles unknown fields and invalid bounds execute no caption hooks', () => {
  const plan = fixture(); let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'progress', { get() { hooks++; return 0.5; }, enumerable: true });
  const proxy = new Proxy({}, { get() { hooks++; return 0; }, ownKeys() { hooks++; return []; } });
  const cycle = {}; cycle.progress = cycle; const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const options of [getter, proxy, cycle, revoked.proxy, { cueIndex: -1 }, { cueIndex: plan.cues.length }, { cueIndex: 0.5 },
    { progress: NaN }, { progress: Infinity }, { progress: -0.1 }, { progress: 1.1 }, { reveal: 'true' },
    { caption: 'future answer' }, { 'cueIndex,progress': 1 }, { [Symbol('x')]: 1 }]) {
    assert.throws(() => captions(plan, options), /invalid_reasoned_scene_options/u);
  }
  const forged = new Proxy({}, { get() { hooks++; return null; }, ownKeys() { hooks++; return []; } });
  assert.throws(() => captions(forged), /untrusted_reasoned_scene_plan/u);
  assert.equal(hooks, 0);
});

test('immutable deterministic manifests bind current paging and original frame digests without audio video sync or approval claims', () => {
  const plan = fixture('garden_two_rows'), options = { cueIndex: index(plan, 'evidence'), progress: 0.5, reveal: false };
  const scene = renderReasonedSceneFrame(plan, options), output = captions(plan, options);
  assert.deepEqual(output, captions(plan, options));
  assert.equal(output.source.contentSha256, scene.source.contentSha256);
  assert.equal(output.trace.contentSha256, scene.trace.contentSha256);
  assert.equal(output.job.contentSha256, scene.job.contentSha256);
  assert.equal(output.scenePlanSha256, plan.contentSha256);
  assert.equal(output.geometrySha256, scene.geometrySha256);
  assert.equal(output.frameSha256, scene.contentSha256);
  assert.equal(output.frameSvgSha256, scene.svgSha256);
  assert.equal(output.pagingSha256, hash({ paging: output.paging, pages: output.pages }));
  const { contentSha256, ...body } = output; assert.equal(contentSha256, hash(body));
  assert.ok(Object.isFrozen(output) && Object.isFrozen(output.pages[0].lines) && Object.isFrozen(output.pages[0].lineSpans[0]));
  assert.throws(() => { output.pages[0].lines[0] = 'future answer'; }, TypeError);
  for (const key of ['teacherApproved', 'publicationReady', 'learnerReady', 'productionReady', 'audioGenerated', 'ttsPrepared',
    'videoRendered', 'captionAudioSyncVerified', 'wordPenAlignmentVerified', 'wordBoundaryTimestampsProvided']) assert.equal(output[key], false);
  assert.equal(output.serializedAuthority, 'none');
  assert.equal(output.rightsReview, 'pending');
  assert.equal(output.providerCallsMade, 0);
  assert.equal(Object.hasOwn(output, 'timestamps'), false);
});
