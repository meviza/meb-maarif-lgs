import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRectangleQuestion, createGardenQuestion } from '../packages/content-factory/pilot.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { createReasonedScenePlan, renderReasonedSceneFrame } from '../packages/media/reasoned_scene_renderer.mjs';
import { createReasonedCaptionPages, paginateReasonedCaptionText } from '../packages/media/reasoned_caption_pages.mjs';

const api = await import('../packages/media/reasoned_scene_renderer.mjs');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const bytesHash = value => createHash('sha256').update(value).digest('hex');
const families = ['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap', 'garden_two_rows', 'concept_lesson'];
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
function fixture(family = 'perimeter', options = {}) {
  const source = family === 'concept_lesson' ? createPerimeterLesson()
    : family === 'garden_two_rows' ? createGardenQuestion({ id: 'caption-frame-garden' })
      : createRectangleQuestion({ id: `caption-frame-${family}`, template: family, width: 6, height: 4, gate: 2 });
  const trace = family === 'concept_lesson' ? createReasonedPerimeterLessonTrace() : createReasonedMathTrace(source);
  return createReasonedScenePlan({ source, trace, job: createReasonedMediaJob(trace, options) });
}
function render(plan, options = {}) {
  assert.equal(typeof api.renderReasonedCaptionFrame, 'function', 'source-bound paged SVG frame API missing');
  return api.renderReasonedCaptionFrame(plan, options);
}
const index = (plan, kind, stepId) => plan.cues.findIndex(cue => cue.kind === kind && (stepId === undefined || cue.stepId === stepId));
const captionText = frame => [...frame.svg.matchAll(/<text data-caption-line="\d+"[^>]*>(.*?)<\/text>/gu)].map(match => match[1]);
const restored = packet => packet.pages.map(page => page.lines.map((line, i) => line + page.lineSpans[i].separatorAfter).join('')).join('');

test('new caption API normalizes negative-zero cue indices before hashing and metadata', () => {
  const plan = fixture();
  const canonical = render(plan, { cueIndex: 0, progress: 0, pageIndex: 0 });
  const negative = render(plan, { cueIndex: -0, progress: -0, pageIndex: -0 });
  assert.deepEqual(negative, canonical);
  assert.equal(Object.is(negative.frame.cueIndex, -0), false);
  assert.equal(Object.is(negative.narrationPacket.cueIndex, -0), false);
});

// Break caught: a dense paragraph emitted in SVG, instead of only its selected
// two-line page, or a page-change silently changing source coordinates.
test('dense garden evidence emits only its selected literal two-line page', () => {
  const plan = fixture('garden_two_rows'), cueIndex = index(plan, 'evidence');
  const { frame, narrationPacket } = render(plan, { cueIndex, progress: 0.5, pageIndex: 0 });
  const expected = ['Kısa kenarın soruda verilen uzunluğu. Verilen değer 18 metre.',
    'Kısa kenarı iki eş parça olarak düşünmemizi sağlayan kesrin'];
  assert.deepEqual(frame.selectedPage.lines, expected);
  assert.deepEqual(captionText(frame), expected);
  assert.equal(frame.pageIndex, 0); assert.equal(frame.pageCount, 5);
  assert.equal(narrationPacket.fullTranscript, plan.cues[cueIndex].transcript);
  assert.equal(restored(narrationPacket), plan.cues[cueIndex].transcript);
  assert.doesNotMatch(frame.svg, /paydası; tel sırası sayısı değildir|Her tel sırasında açık/u);
  assert.equal(Object.hasOwn(frame, 'fullTranscript'), false);
  assert.equal(Object.hasOwn(frame, 'pages'), false);
});

test('page switches preserve source paths and continuous highlight-pen coordinates', () => {
  const plan = fixture(), cueIndex = index(plan, 'why', 'edge_pair');
  const frames = [0, 0.5, 1].map(progress => render(plan, { cueIndex, progress }).frame);
  assert.deepEqual(frames.map(frame => frame.highlight.drawnLength), [0, 282.5, 565]);
  assert.deepEqual(frames.map(frame => frame.highlight.pen), [null, { x: 347.5, y: 85 }, { x: 465, y: 250 }]);
  assert.deepEqual(frames[1].highlight.paths[0].points, [{ x: 65, y: 85 }, { x: 347.5, y: 85 }]);
  const garden = fixture('garden_two_rows'), options = { cueIndex: index(garden, 'evidence'), progress: 0.5 };
  const first = render(garden, { ...options, pageIndex: 0 }).frame;
  const next = render(garden, { ...options, pageIndex: 1 }).frame;
  const old = renderReasonedSceneFrame(garden, options);
  assert.deepEqual(next.selectedPage.lines, ['paydası; tel sırası sayısı değildir. Verilen değer 2. Uzun',
    'kenar için aynı büyüklükteki parçalardan kaç tane alınacağını']);
  for (const frame of [first, next]) {
    assert.deepEqual(frame.highlight, old.highlight);
    assert.equal(frame.safeLayerSha256, old.safeLayerSha256);
    assert.equal(frame.sourceAssetSvgSha256, old.sourceAssetSvgSha256);
    assert.equal(frame.coordinatePolicy, old.coordinatePolicy);
  }
  assert.notEqual(first.svgSha256, next.svgSha256);
  assert.notEqual(first.contentSha256, next.contentSha256);
});

test('caption reservation stays fixed without scaling geometry or shrinking dense paragraph fonts', () => {
  const plan = fixture('garden_two_rows'), cueIndex = index(plan, 'evidence');
  const packets = [0, 1, 4].map(pageIndex => render(plan, { cueIndex, progress: 1, pageIndex }));
  for (const { frame } of packets) {
    assert.match(frame.svg, /viewBox="0 0 1280 858" width="1280" height="858"/u);
    assert.equal(frame.captionLayout.fontSizeSvgUnits, 17);
    assert.equal(frame.captionLayout.reservedLines, 2);
    assert.equal(frame.captionLayout.glyphFitVerified, false);
    assert.ok(frame.pending.includes('caption_glyph_width_and_geometry_fit_review'));
    assert.doesNotMatch(frame.svg, /transform=|textLength=|lengthAdjust=|\.\.\.|…/u);
    assert.match(frame.svg, /M 302 525 L 415 525/u);
  }
});

// Break caught: a new renderer shortcut skipping the existing source/reveal
// context, or rendering every page while trying to preserve full narration.
for (const family of families) {
  test(`${family} binds every selected cue page to unchanged source geometry and complete separate narration`, () => {
    const plan = fixture(family), before = JSON.stringify(plan);
    for (let cueIndex = 0; cueIndex < plan.cues.length; cueIndex++) {
      const options = { cueIndex, progress: 1, reveal: true };
      const old = renderReasonedSceneFrame(plan, options);
      const first = render(plan, options);
      assert.equal(first.narrationPacket.fullTranscript, plan.cues[cueIndex].transcript);
      assert.equal(restored(first.narrationPacket), plan.cues[cueIndex].transcript);
      for (let pageIndex = 0; pageIndex < first.narrationPacket.pages.length; pageIndex++) {
        const { frame, narrationPacket } = render(plan, { ...options, pageIndex });
        assert.deepEqual(frame.selectedPage, narrationPacket.pages[pageIndex]);
        assert.ok(frame.selectedPage.lines.length >= 1 && frame.selectedPage.lines.length <= 2);
        assert.equal(captionText(frame).length, frame.selectedPage.lines.length);
        assert.deepEqual(frame.highlight, old.highlight);
        assert.equal(frame.safeLayerSha256, old.safeLayerSha256);
        assert.equal(frame.sourceVisualId, old.sourceVisualId);
        assert.equal(frame.resultVisible, old.resultVisible);
        assert.equal(frame.frameRepresentation, 'derived_safe_geometry_not_original_svg_embedding');
        for (const line of frame.selectedPage.lines) assert.ok(line.length <= 62);
        assert.equal(Object.hasOwn(frame, 'assets'), false);
      }
    }
    assert.equal(JSON.stringify(plan), before);
  });
}

test('protected answer pages and separate transcripts remain locked until explicit reveal and complete progress', () => {
  for (const family of ['perimeter', 'garden_two_rows', 'concept_lesson']) {
    const plan = fixture(family);
    for (let cueIndex = 0; cueIndex < plan.cues.length; cueIndex++) {
      if (!protectedKinds.has(plan.cues[cueIndex].kind)) continue;
      for (const options of [{ progress: 0, reveal: true }, { progress: 0.5, reveal: true }, { progress: 1, reveal: false }]) {
        const output = render(plan, { cueIndex, ...options });
        assert.equal(output.frame.resultVisible, false);
        assert.equal(output.frame.highlightStage, 'locked_for_reveal');
        assert.equal(output.frame.highlight.paths.length, 0);
        assert.equal(output.narrationPacket.fullTranscript, null);
        assert.equal(output.narrationPacket.fullTranscriptSha256, null);
        assert.equal(output.narrationPacket.transcriptVisibility, 'protected_response_locked');
        assert.ok(!JSON.stringify(output).includes(plan.cues[cueIndex].transcript));
        assert.match(output.frame.svg, /Yanıt henüz gösterilmiyor/u);
        assert.throws(() => render(plan, { cueIndex, ...options, pageIndex: 1 }), /invalid_reasoned_caption_page_index/u);
      }
    }
  }
});

test('a revealed result uses only its canonical caption page without adding a third compact-equation line', () => {
  const plan = fixture(), cueIndex = index(plan, 'result', 'full_perimeter');
  const { frame, narrationPacket } = render(plan, { cueIndex, progress: 1, reveal: true });
  assert.equal(frame.resultVisible, true);
  assert.match(narrationPacket.fullTranscript, /20 santimetre/u);
  assert.doesNotMatch(frame.svg, /10 × 2 = 20 cm/u);
  assert.ok(captionText(frame).length <= 2);
  assert.deepEqual(frame.selectedPage.lines, narrationPacket.pages[0].lines);
});

test('side-by-side different and duplicate pages use only their current self-contained safe AX caption', () => {
  const plan = fixture('garden_two_rows'), cueIndex = index(plan, 'evidence');
  const first = render(plan, { cueIndex, progress: 1, pageIndex: 0 }).frame;
  const second = render(plan, { cueIndex, progress: 1, pageIndex: 1 }).frame;
  const duplicate = render(plan, { cueIndex, progress: 1, pageIndex: 0 }).frame;
  assert.equal(first.svg, duplicate.svg);
  const joined = first.svg + second.svg + duplicate.svg;
  assert.doesNotMatch(joined, /\bid=|aria-labelledby=|aria-describedby=/u);
  for (const frame of [first, second, duplicate]) {
    const label = frame.svg.match(/aria-label="([^"]*)"/u)?.[1];
    assert.match(label, /^Kaynak &amp; gerekçe — /u);
    assert.equal(frame.svg.match(/<title>(.*?)<\/title>/u)?.[1], label);
    assert.equal(frame.svg.match(/<desc>(.*?)<\/desc>/u)?.[1], label);
    for (const line of frame.selectedPage.lines) assert.ok(label.includes(line));
  }
  assert.doesNotMatch(first.svg.match(/aria-label="([^"]*)"/u)[1], /paydası; tel sırası sayısı değildir/u);
  assert.doesNotMatch(second.svg.match(/aria-label="([^"]*)"/u)[1], /Kısa kenarın soruda verilen uzunluğu/u);
});

test('concept frames never inline answer-bearing original assets or future responses before current reveal', () => {
  const plan = fixture('concept_lesson');
  for (const kind of ['goal', 'evidence', 'plan', 'why']) {
    const output = render(plan, { cueIndex: index(plan, kind), progress: 1 });
    assert.doesNotMatch(output.frame.svg, /(?:20|22|24) (?:cm|santimetre)/u);
    for (const asset of plan.assets) assert.ok(!output.frame.svg.includes(asset.svg));
    assert.equal(output.frame.sourceDiagramProof, true);
    assert.equal(Object.hasOwn(output.narrationPacket, 'assets'), false);
    assert.equal(Object.hasOwn(output.narrationPacket, 'svg'), false);
  }
});

test('transfer pages remain visibly honest pending text and never manufacture source geometry', () => {
  const plan = fixture('concept_lesson');
  for (const kind of ['transfer_prompt', 'transfer_answer']) {
    const { frame, narrationPacket } = render(plan, { cueIndex: index(plan, kind), progress: 1, reveal: true });
    assert.equal(frame.sourceDiagramProof, false);
    assert.equal(frame.sourceVisualId, null);
    assert.equal(frame.representationStatus, 'unsupported_new_geometry_pending');
    assert.equal(frame.highlight.paths.length, 0);
    assert.equal(frame.highlight.pen, null);
    assert.match(frame.svg, /Yeni transfer şekli kaynakta yok; geometrik temsil bekliyor/u);
    assert.doesNotMatch(frame.svg, /data-model=|data-layer="source-geometry"/u);
    assert.ok(narrationPacket.pending.includes('transfer_geometry_not_in_canonical_source'));
    assert.ok(captionText(frame).length <= 2);
  }
});

test('closed page options reject invalid bounds custom text or authority rather than clamp or coerce', () => {
  const plan = fixture();
  for (const options of [{ pageIndex: -1 }, { pageIndex: 0.5 }, { pageIndex: '0' }, { pageIndex: NaN },
    { pageIndex: Infinity }, { pageIndex: 32 }, { pageIndex: Number.MAX_SAFE_INTEGER },
    { cueIndex: -1 }, { cueIndex: plan.cues.length }, { progress: NaN }, { progress: 1.01 },
    { reveal: 'true' }, { caption: 'future answer' }, { lines: ['future answer'] },
    { approved: true }, { 'cueIndex,pageIndex': 0 }, { [Symbol('pageIndex')]: 0 }, null, []]) {
    assert.throws(() => render(plan, options), /invalid_reasoned_(?:caption|scene)_/u);
  }
  const current = render(plan);
  assert.throws(() => render(plan, { pageIndex: current.frame.pageCount }), /invalid_reasoned_caption_page_index/u);
  assert.throws(() => api.renderReasonedCaptionFrame(plan, {}, 'third'), /invalid_reasoned_caption_arguments/u);
});

// Break caught: one selected page carrying -0 in its binding while its own
// canonical selectedPage.pageIndex is 0, despite sharing the same JSON hash.
test('negative-zero page selection normalizes to the same immutable packet as page zero', () => {
  const plan = fixture();
  const zero = render(plan, { pageIndex: 0, progress: 0 });
  const negativeZero = render(plan, { pageIndex: -0, progress: -0 });
  assert.equal(Object.is(negativeZero.frame.pageIndex, -0), false);
  assert.equal(Object.is(negativeZero.narrationPacket.pageIndex, -0), false);
  assert.deepEqual(negativeZero, zero);
});

test('getters proxies revoked proxies cycles and hostile prototypes execute zero option or plan hooks', () => {
  const plan = fixture(); let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'pageIndex', { enumerable: true, get() { hooks++; return 0; } });
  const proxy = new Proxy({}, { ownKeys() { hooks++; return []; }, get() { hooks++; return 0; }, getPrototypeOf() { hooks++; return Object.prototype; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cycle = {}; cycle.pageIndex = cycle;
  const coercion = { pageIndex: { valueOf() { hooks++; return 0; } } };
  for (const options of [getter, proxy, revoked.proxy, cycle, coercion, new Date(), Object.create({ pageIndex: 0 }),
    { pageIndex() { hooks++; return 0; } }]) assert.throws(() => render(plan, options), /invalid_reasoned_caption_/u);
  const hostile = new Proxy(plan, { get() { hooks++; return null; }, ownKeys() { hooks++; return []; } });
  for (const candidate of [hostile, revoked.proxy]) assert.throws(() => render(candidate), /untrusted_reasoned_scene_plan/u);
  assert.equal(hooks, 0);
});

test('serialized rehashed plans frame and narration packets cannot mint renderer authority', () => {
  const plan = fixture(), copied = structuredClone(plan);
  copied.cues[0].transcript = 'caller answer';
  const { contentSha256, ...body } = copied; copied.contentSha256 = hash(body);
  const output = render(plan);
  for (const candidate of [structuredClone(plan), copied, output.frame, output.narrationPacket, createReasonedCaptionPages(plan)]) {
    assert.throws(() => render(candidate), /untrusted_reasoned_scene_plan/u);
  }
});

test('markup-bearing style cannot become SVG text executable markup URLs or audio egress', () => {
  const plan = fixture('perimeter', { style: '<image href="https://evil.invalid/x"/><script>caption-secret</script>&"\'' });
  const output = render(plan);
  assert.match(output.frame.svg, /Kaynak &amp; gerekçe/u);
  assert.doesNotMatch(JSON.stringify(output), /caption-secret|evil\.invalid|<script|<image|foreignObject|href=|@font-face/iu);
  assert.equal(output.frame.providerCallsMade, 0);
});

test('immutable frame and separate packet hashes bind source cue page progress paging and safe layer without sync authority', () => {
  const plan = fixture('garden_two_rows'), options = { cueIndex: index(plan, 'evidence'), progress: 0.5, pageIndex: 1 };
  const output = render(plan, options), { frame, narrationPacket } = output;
  assert.deepEqual(output, render(plan, options));
  for (const value of [frame, narrationPacket]) {
    assert.equal(value.source.contentSha256, plan.source.contentSha256);
    assert.equal(value.trace.contentSha256, plan.trace.contentSha256);
    assert.equal(value.job.contentSha256, plan.job.contentSha256);
    assert.equal(value.geometrySha256, plan.geometrySha256);
    assert.equal(value.scenePlanSha256, plan.contentSha256);
    const { contentSha256, ...body } = value; assert.equal(contentSha256, hash(body));
    for (const key of ['audioGenerated', 'ttsPrepared', 'videoRendered', 'captionAudioSyncVerified',
      'wordPenAlignmentVerified', 'wordBoundaryTimestampsProvided', 'teacherApproved', 'publicationReady', 'learnerReady', 'productionReady']) assert.equal(value[key], false);
    assert.equal(value.serializedAuthority, 'none');
    assert.equal(value.rightsReview, 'pending');
    assert.equal(Object.hasOwn(value, 'timestamps'), false);
  }
  assert.equal(frame.svgSha256, bytesHash(frame.svg));
  assert.equal(frame.selectedPageSha256, hash(frame.selectedPage));
  assert.equal(frame.pagingSha256, hash({ paging: narrationPacket.paging, pages: narrationPacket.pages }));
  assert.equal(narrationPacket.frameSha256, frame.contentSha256);
  assert.equal(narrationPacket.frameSvgSha256, frame.svgSha256);
  assert.equal(narrationPacket.fullTranscriptSha256, bytesHash(narrationPacket.fullTranscript));
  assert.ok(Object.isFrozen(output) && Object.isFrozen(frame.selectedPage.lines) && Object.isFrozen(narrationPacket.pages));
  assert.throws(() => { frame.selectedPage.lines[0] = 'spoiler'; }, TypeError);
});

// Characterization captured BEFORE changes using real canonical sources/jobs.
// Break caught: paginator extraction/private model reuse changes legacy bytes,
// metadata property order or digest domains consumed by existing sidecars.
test('existing scene and caption APIs retain pre-change real fixture byte and manifest fingerprints', () => {
  const expected = [
    ['perimeter', 'b0d51a48883fb7882c47d9b1209e4266345ae8e5427f9e2b3d9f479324affd85', 'bf4159e9166ec468fc2cb7136a20e879c6d4b28f715c9e367e739e7f5ce58af9', 'b77be4f5bf1cd2d2450249fbe288d992cbf20111b2fe5767c5cbb7134cf39f6a'],
    ['garden_two_rows', '552d42a8d33dcf3e8d65a96f559cb50f46f662fa8e60e084db2582d398519c9d', '0b7e4434432ccd97536059c33d4703f94fefefe7824a408d94752f6fa78b106d', 'e9b2b2d1cd4812c14bc635f91c85e0da8a1dc47775216b1bf43955e6b2d8256b'],
    ['concept_lesson', '1bd54bfc6e66ea8b55c29e45c259626b639a35efffa92028932f179964937c82', 'c59c53a25a2cba1a303298f99aadb8bcee3e3b79df166b954c9f0be20885e187', '9d5376de7a2b60ce2fa6e8c0bbe85f8404b157b1acff14ce25d72db24415cd04'],
  ];
  for (const [family, svgSha256, frameSha256, captionSha256] of expected) {
    const plan = fixture(family), options = { cueIndex: index(plan, 'evidence'), progress: 0.5, reveal: false };
    const frame = renderReasonedSceneFrame(plan, options), caption = createReasonedCaptionPages(plan, options);
    assert.equal(bytesHash(frame.svg), svgSha256);
    assert.equal(frame.contentSha256, frameSha256);
    assert.equal(caption.contentSha256, captionSha256);
  }
  assert.deepEqual(paginateReasonedCaptionText('a'.repeat(59) + ' +3 santimetre sonra').pages[0].lines,
    ['a'.repeat(59), '+3 santimetre sonra']);
});
