import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createGardenQuestion, createRectangleQuestion } from '../packages/content-factory/pilot.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { createReasonedScenePlan, renderReasonedCaptionFrame } from '../packages/media/reasoned_scene_renderer.mjs';

const api = await import('../packages/media/reasoned_caption_review.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
const families = ['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap', 'garden_two_rows', 'concept_lesson'];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function fixture(family = 'garden_two_rows', dimensions = {}, jobOptions = {}) {
  const source = family === 'concept_lesson' ? createPerimeterLesson()
    : family === 'garden_two_rows' ? createGardenQuestion({ id: 'caption-review-garden' })
      : createRectangleQuestion({ id: `caption-review-${family}`, template: family, width: 6, height: 4, gate: 2, ...dimensions });
  const trace = family === 'concept_lesson' ? createReasonedPerimeterLessonTrace() : createReasonedMathTrace(source);
  return createReasonedScenePlan({ source, trace, job: createReasonedMediaJob(trace, jobOptions) });
}
function create(plan = fixture()) {
  assert.equal(typeof api.createReasonedCaptionReview, 'function', 'live caption review controller API missing');
  return api.createReasonedCaptionReview(plan);
}
const action = (controller, type) => controller.dispatch({ type });
function finishPages(controller) {
  for (let bound = 0; bound < 32 && controller.current().navigation.canNextPage; bound++) action(controller, 'next_page');
  assert.equal(controller.current().navigation.canNextPage, false);
}
function toCue(controller, cueIndex) {
  for (let bound = 0; bound < 100 && controller.current().cursor.cueIndex < cueIndex; bound++) {
    if (controller.current().navigation.canRevealCurrent) action(controller, 'reveal_current');
    finishPages(controller); action(controller, 'next_cue');
  }
  assert.equal(controller.current().cursor.cueIndex, cueIndex);
  return controller.current();
}
function assertFrozen(value) {
  if (value && typeof value === 'object') {
    assert.equal(Object.isFrozen(value), true);
    Object.values(value).forEach(assertFrozen);
  }
}

// Break caught: a configurable starting cue or an initial answer reveal can
// bypass the sequential editor-review presentation boundary.
test('a live controller starts on only the first locked-review page with immutable current output', () => {
  const plan = fixture(), controller = create(plan), current = controller.current();
  assert.equal(Object.isFrozen(controller), true);
  assert.equal(current.cursor.cueIndex, 0); assert.equal(current.cursor.kind, 'goal');
  assert.equal(current.cursor.pageIndex, 0); assert.equal(current.cursor.pageCount, 2);
  assert.equal(current.cursor.progress, 1); assert.equal(current.cursor.revealRequested, false);
  assert.equal(current.navigation.canNextPage, true); assert.equal(current.navigation.canNextCue, false);
  assert.equal(current.navigation.forwardBlockedReason, 'caption_pages_remaining');
  assert.equal(current.narrationPacket.fullTranscript, plan.cues[0].transcript);
  assert.deepEqual(current.caption.lines, ['Kapı her sırada açık kalacak biçimde iki tel sırası için',
    'gereken toplam tel uzunluğu isteniyor; alan ya da tek tur']);
  assert.doesNotMatch(JSON.stringify(current), /86 çarpı 2 eşittir 172 metre|18 bölü 2 eşittir 9 metre/u);
  assertFrozen(current);
  assert.strictEqual(controller.current(), current);
});

test('forward cue navigation cannot discard the remaining dense garden caption pages', () => {
  const controller = create();
  const first = controller.current();
  assert.throws(() => action(controller, 'next_cue'), /reasoned_caption_review_transition_blocked/u);
  assert.strictEqual(controller.current(), first);
  action(controller, 'next_page');
  const evidence = action(controller, 'next_cue');
  assert.equal(evidence.cursor.cueIndex, 1); assert.equal(evidence.cursor.pageIndex, 0);
  assert.equal(evidence.cursor.pageCount, 5);
  assert.deepEqual(evidence.caption.lines, ['Kısa kenarın soruda verilen uzunluğu. Verilen değer 18 metre.',
    'Kısa kenarı iki eş parça olarak düşünmemizi sağlayan kesrin']);
  for (let page = 0; page < 4; page++) {
    assert.equal(controller.current().navigation.canNextCue, false);
    assert.throws(() => action(controller, 'next_cue'), /reasoned_caption_review_transition_blocked/u);
    action(controller, 'next_page');
  }
  assert.equal(controller.current().cursor.pageIndex, 4);
  assert.equal(controller.current().navigation.canNextCue, true);
  assert.equal(action(controller, 'next_cue').cursor.kind, 'plan');
});

test('page-only navigation preserves source geometry while separate DOM captions stay independent of SVG scale', () => {
  const controller = create(), plan = fixture();
  toCue(controller, 1);
  const first = controller.current(), second = action(controller, 'next_page');
  assert.deepEqual(second.caption.lines, ['paydası; tel sırası sayısı değildir. Verilen değer 2. Uzun',
    'kenar için aynı büyüklükteki parçalardan kaç tane alınacağını']);
  assert.equal(second.caption.contentFormat, 'plain_text_textContent_only');
  assert.equal(second.caption.recommendedFontSizeCssPx, 18);
  assert.equal(second.caption.glyphFitVerified, false);
  for (const record of [first, second]) {
    assert.match(record.frame.svg, /viewBox="0 0 1280 858" width="1280" height="858"/u);
    assert.match(record.frame.svg, /M 302 525 L 415 525/u);
    assert.equal(record.visualPresentation.geometryRescaled, false);
    assert.equal(record.visualPresentation.cropped, false);
    assert.equal(record.visualPresentation.use, 'optional_secondary_closed_review_preview');
    assert.equal(record.visualPresentation.duplicateAccessibilityAcceptance, 'pending');
    assert.equal(Object.hasOwn(record.caption, 'html'), false);
    assert.equal(Object.hasOwn(record.caption, 'svg'), false);
    assert.equal(Object.hasOwn(record.caption, 'fullTranscript'), false);
    assert.equal(record.narrationPacket.fullTranscript, plan.cues[1].transcript);
    assert.deepEqual(record.caption.lines, record.frame.selectedPage.lines);
  }
  assert.deepEqual(first.frame.highlight, second.frame.highlight);
  assert.equal(first.frame.safeLayerSha256, second.frame.safeLayerSha256);
  assert.notEqual(first.frame.svgSha256, second.frame.svgSha256);
  assert.notEqual(first.contentSha256, second.contentSha256);
  assert.equal(first.cursor.pageIndex, 0);
  assert.deepEqual(action(controller, 'previous_page'), first);
});

// Break caught: treating a placeholder's one page as permission to skip an
// answer cue, or moving forward before all newly revealed summary pages.
test('protected cues require an explicit current reveal and the actual last revealed page', () => {
  const controller = create(), locked = toCue(controller, 4);
  assert.equal(locked.cursor.kind, 'result'); assert.equal(locked.cursor.pageCount, 1);
  assert.equal(locked.cursor.resultVisible, false); assert.equal(locked.narrationPacket.fullTranscript, null);
  assert.equal(locked.navigation.canRevealCurrent, true); assert.equal(locked.navigation.canNextCue, false);
  assert.equal(locked.navigation.forwardBlockedReason, 'protected_response_requires_explicit_editor_reveal');
  assert.doesNotMatch(JSON.stringify(locked), /18 bölü 2 eşittir 9 metre/u);
  assert.throws(() => action(controller, 'next_cue'), /reasoned_caption_review_transition_blocked/u);
  const revealed = action(controller, 'reveal_current');
  assert.equal(revealed.cursor.pageIndex, 0); assert.equal(revealed.cursor.progress, 1);
  assert.equal(revealed.cursor.resultVisible, true); assert.equal(revealed.cursor.revealRequested, true);
  assert.match(revealed.narrationPacket.fullTranscript, /^18 bölü 2 eşittir 9 metre/u);
  assert.equal(revealed.teacherApproved, false);
  const next = action(controller, 'next_cue');
  assert.equal(next.cursor.kind, 'check_prompt'); assert.equal(next.cursor.revealRequested, false);
  const summary = toCue(controller, 27);
  assert.equal(summary.cursor.kind, 'summary'); assert.equal(summary.cursor.pageCount, 1);
  const openSummary = action(controller, 'reveal_current');
  assert.equal(openSummary.cursor.pageCount, 2); assert.equal(openSummary.cursor.pageIndex, 0);
  assert.equal(openSummary.navigation.canNextCue, false);
  assert.throws(() => action(controller, 'next_cue'), /reasoned_caption_review_transition_blocked/u);
  action(controller, 'next_page');
  const transfer = action(controller, 'next_cue');
  assert.equal(transfer.cursor.kind, 'transfer_prompt'); assert.equal(transfer.cursor.revealRequested, false);
});

test('backward cue navigation always resets page and reveal even on a previously opened protected cue', () => {
  const controller = create(); toCue(controller, 4);
  const opened = action(controller, 'reveal_current');
  action(controller, 'next_cue');
  const returned = action(controller, 'previous_cue');
  assert.equal(returned.cursor.cueIndex, 4); assert.equal(returned.cursor.pageIndex, 0);
  assert.equal(returned.cursor.revealRequested, false); assert.equal(returned.cursor.resultVisible, false);
  assert.equal(returned.narrationPacket.fullTranscript, null);
  assert.notEqual(returned.contentSha256, opened.contentSha256);
  const why = action(controller, 'previous_cue');
  assert.equal(why.cursor.cueIndex, 3); assert.equal(why.cursor.pageIndex, 0);
  action(controller, 'next_page');
  const plan = action(controller, 'previous_cue');
  assert.equal(plan.cursor.cueIndex, 2); assert.equal(plan.cursor.pageIndex, 0);
});

test('boundary actions and reveal on an ordinary or already revealed cue fail without changing state', () => {
  const controller = create();
  for (const type of ['previous_page', 'previous_cue', 'reveal_current']) {
    const before = controller.current();
    assert.throws(() => action(controller, type), /reasoned_caption_review_transition_blocked/u);
    assert.strictEqual(controller.current(), before);
  }
  finishPages(controller);
  const lastGoalPage = controller.current();
  assert.throws(() => action(controller, 'next_page'), /reasoned_caption_review_transition_blocked/u);
  assert.strictEqual(controller.current(), lastGoalPage);
  toCue(controller, 29); action(controller, 'reveal_current');
  const last = controller.current();
  assert.equal(last.navigation.canNextCue, false); assert.equal(last.navigation.forwardBlockedReason, 'end_of_cues');
  for (const type of ['next_cue', 'next_page', 'reveal_current']) {
    assert.throws(() => action(controller, type), /reasoned_caption_review_transition_blocked/u);
    assert.strictEqual(controller.current(), last);
  }
});

test('only closed primitive actions may navigate, never supplied cue page progress text or approval fields', () => {
  const controller = create(), before = controller.current();
  for (const input of [null, [], {}, 'next_page', { type: 'go' }, { type: 'next_page', cueIndex: 27 },
    { type: 'next_page', pageIndex: 4 }, { type: 'next_page', progress: 0 }, { type: 'next_page', reveal: true },
    { type: 'next_page', caption: 'answer' }, { type: 'next_page', authorized: true },
    { type: 'next_page', maxRecordBytes: 999999999 }, { type: 'next_page', [Symbol('type')]: 'next_page' },
    { type: 1 }, { 'type,cueIndex': 'next_page' }, Object.create({ type: 'next_page' })]) {
    assert.throws(() => controller.dispatch(input), /invalid_reasoned_caption_review_action/u);
    assert.strictEqual(controller.current(), before);
  }
  assert.throws(() => controller.current({ reveal: true }), /invalid_reasoned_caption_review_arguments/u);
  assert.throws(() => controller.dispatch({ type: 'next_page' }, { cueIndex: 27 }), /invalid_reasoned_caption_review_arguments/u);
  assert.throws(() => api.createReasonedCaptionReview(fixture(), { cueIndex: 27 }), /invalid_reasoned_caption_review_arguments/u);
  assert.strictEqual(controller.current(), before);
});

test('live plan and exact controller receiver brands reject clones packets other controllers and hook-bearing inputs', () => {
  const plan = fixture(), controller = create(plan), another = create(plan), before = controller.current(); let hooks = 0;
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const fakePlan = structuredClone(plan); fakePlan.cues[0].transcript = 'caller answer';
  const { contentSha256, ...body } = fakePlan; fakePlan.contentSha256 = hash(body);
  const hostilePlan = new Proxy(plan, { get() { hooks++; return null; }, ownKeys() { hooks++; return []; } });
  for (const input of [null, structuredClone(plan), fakePlan, before.frame, before.narrationPacket, before,
    hostilePlan, revoked.proxy]) assert.throws(() => create(input), /untrusted_reasoned_scene_plan/u);
  const cloned = { ...controller };
  const hostileController = new Proxy(controller, { get() { hooks++; return null; }, getPrototypeOf() { hooks++; return null; } });
  for (const receiver of [null, cloned, another, hostileController, revoked.proxy]) {
    assert.throws(() => controller.current.call(receiver), /untrusted_reasoned_caption_review_controller/u);
    assert.throws(() => controller.dispatch.call(receiver, { type: 'next_page' }), /untrusted_reasoned_caption_review_controller/u);
  }
  const getter = {}; Object.defineProperty(getter, 'type', { enumerable: true, get() { hooks++; return 'next_page'; } });
  const hidden = {}; Object.defineProperty(hidden, 'type', { value: 'next_page' });
  const proxy = new Proxy({}, { ownKeys() { hooks++; return []; }, get() { hooks++; return 'next_page'; } });
  const cycle = {}; cycle.type = cycle;
  const coercion = { type: { toString() { hooks++; return 'next_page'; } } };
  for (const input of [getter, hidden, proxy, revoked.proxy, cycle, coercion, new Date()]) {
    assert.throws(() => controller.dispatch(input), /invalid_reasoned_caption_review_action/u);
  }
  assert.equal(hooks, 0); assert.strictEqual(controller.current(), before);
  assert.equal(action(controller, 'next_page').cursor.pageIndex, 1);
  assert.equal(another.current().cursor.pageIndex, 0);
});

for (const family of families) {
  test(`${family} walks every current cue and page without rewriting narration geometry or source assets`, () => {
    const plan = fixture(family), before = JSON.stringify(plan), controller = create(plan); let visited = 0;
    for (let cueIndex = 0; cueIndex < plan.cues.length; cueIndex++) {
      let record = controller.current();
      assert.equal(record.cursor.cueIndex, cueIndex); assert.equal(record.cursor.pageIndex, 0);
      assert.equal(record.cursor.revealRequested, false);
      if (protectedKinds.has(plan.cues[cueIndex].kind)) {
        assert.equal(record.narrationPacket.fullTranscript, null);
        assert.equal(record.navigation.canNextCue, false);
        record = action(controller, 'reveal_current');
      }
      assert.equal(record.narrationPacket.fullTranscript, plan.cues[cueIndex].transcript);
      const restored = record.narrationPacket.pages.map(page => page.lines.map((line, i) => line + page.lineSpans[i].separatorAfter).join('')).join('');
      assert.equal(restored, plan.cues[cueIndex].transcript);
      for (let pageIndex = 0; pageIndex < record.cursor.pageCount; pageIndex++) {
        record = controller.current();
        const delegated = renderReasonedCaptionFrame(plan, { cueIndex, progress: 1,
          reveal: protectedKinds.has(plan.cues[cueIndex].kind), pageIndex });
        assert.deepEqual(record.frame, delegated.frame);
        assert.deepEqual(record.narrationPacket, delegated.narrationPacket);
        assert.equal(record.cursor.pageIndex, pageIndex); assert.ok(record.caption.lines.length <= 2);
        assert.equal(Object.hasOwn(record, 'futureCues'), false);
        visited++;
        if (record.navigation.canNextPage) action(controller, 'next_page');
      }
      if (cueIndex < plan.cues.length - 1) action(controller, 'next_cue');
    }
    assert.ok(visited >= plan.cues.length);
    assert.equal(JSON.stringify(plan), before);
  });
}

test('transfer review is pending text-only rather than a new source geometry or approval', () => {
  const controller = create(fixture('concept_lesson'));
  while (controller.current().cursor.kind !== 'transfer_prompt') {
    if (controller.current().navigation.canRevealCurrent) action(controller, 'reveal_current');
    finishPages(controller); action(controller, 'next_cue');
  }
  const transfer = controller.current();
  assert.equal(transfer.frame.sourceDiagramProof, false);
  assert.equal(transfer.frame.sourceVisualId, null);
  assert.equal(transfer.frame.representationStatus, 'unsupported_new_geometry_pending');
  assert.equal(transfer.frame.highlight.paths.length, 0);
  assert.ok(transfer.pending.includes('transfer_geometry_not_in_canonical_source'));
  assert.equal(transfer.learnerReady, false);
});

test('frozen current records bind source and page digests without audio timing learner evidence or markup claims', () => {
  const plan = fixture(), controller = create(plan), before = controller.current();
  const { contentSha256, ...body } = before; assert.equal(contentSha256, hash(body));
  assert.equal(before.frameSha256, before.frame.contentSha256);
  assert.equal(before.frameSvgSha256, before.frame.svgSha256);
  assert.equal(before.pagingSha256, before.narrationPacket.pagingSha256);
  assert.equal(before.scenePlanSha256, plan.contentSha256);
  assert.equal(before.geometrySha256, plan.geometrySha256);
  assert.equal(before.source.contentSha256, plan.source.contentSha256);
  assert.equal(before.trace.contentSha256, plan.trace.contentSha256);
  assert.equal(before.job.contentSha256, plan.job.contentSha256);
  assert.equal(before.serializedAuthority, 'none');
  for (const key of ['teacherApproved', 'publicationReady', 'learnerReady', 'productionReady', 'audioGenerated',
    'ttsPrepared', 'videoRendered', 'captionAudioSyncVerified', 'wordPenAlignmentVerified', 'wordBoundaryTimestampsProvided',
    'pageNavigationUiVerified', 'browserAccessibilityAccepted']) assert.equal(before[key], false);
  assert.equal(before.providerCallsMade, 0); assert.equal(before.privacyInspection, 'not_performed');
  assert.equal(before.rightsReview, 'pending');
  assert.equal(Object.hasOwn(before, 'timestamps'), false); assert.equal(Object.hasOwn(before, 'mastery'), false);
  assert.equal(Object.hasOwn(before, 'visitCounts'), false); assert.equal(Object.hasOwn(before, 'score'), false);
  assertFrozen(before);
  assert.throws(() => { before.caption.lines[0] = 'future answer'; }, TypeError);
  action(controller, 'next_page');
  assert.equal(before.cursor.pageIndex, 0); assert.equal(controller.current().cursor.pageIndex, 1);
  assert.deepEqual(create(plan).current(), before);
});

test('large canonical source geometry remains bounded without caller byte-budget overrides or new external markup', () => {
  for (const family of ['perimeter', 'area', 'fence_gap']) {
    const plan = fixture(family, { width: 100, height: 100, gate: 1 }, { style: '<script>private-style</script> https://evil.invalid/font' });
    const controller = create(plan);
    for (let cueIndex = 0; cueIndex < plan.cues.length; cueIndex++) {
      if (controller.current().navigation.canRevealCurrent) action(controller, 'reveal_current');
      finishPages(controller);
      const current = controller.current();
      assert.ok(Buffer.byteLength(JSON.stringify(current), 'utf8') <= current.limits.maxRecordBytes);
      assert.ok(current.limits.maxRecordBytes <= 131072);
      assert.doesNotMatch(JSON.stringify(current), /private-style|evil\.invalid|<script|<image|foreignObject|href=|@font-face/iu);
      if (cueIndex < plan.cues.length - 1) action(controller, 'next_cue');
    }
  }
});
