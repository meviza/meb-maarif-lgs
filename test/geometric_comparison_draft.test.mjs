import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const api = await import('../packages/content-factory/geometric_comparison_draft.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const A2P = 'same_area_different_perimeter';
const P2A = 'same_perimeter_different_area';
const bytesHash = value => createHash('sha256').update(value).digest('hex');
function build(input = { id: 'comparison-area-12', direction: A2P, target: 12 }) {
  assert.equal(typeof api.createGeometricComparisonDraft, 'function', 'comparison draft builder not implemented');
  return api.createGeometricComparisonDraft(input);
}
const rows = draft => draft.models.map(m => [m.width, m.height, m.areaSquareUnits, m.perimeterUnits]);

// Break caught: only one reversed operation replaces multiple constructed models.
test('same area twelve has three nonrotated models with distinct hand-checked perimeters', () => {
  const d = build();
  assert.deepEqual(rows(d), [[1, 12, 12, 26], [2, 6, 12, 16], [3, 4, 12, 14]]);
  assert.deepEqual(d.table.rows.map(r => [r.width, r.height, r.areaSquareUnits, r.perimeterUnits]), rows(d));
  assert.equal(d.comparison.fixedQuantity, 'area');
  assert.equal(d.comparison.varyingQuantity, 'perimeter');
  assert.equal(d.comparison.minimumConstructedModels, 2);
});

// Break caught: the second semantic direction is mislabeled or absent.
test('same perimeter sixteen has four models with distinct hand-checked areas including a square', () => {
  const d = build({ id: 'comparison-perimeter-16', direction: P2A, target: 16 });
  assert.deepEqual(rows(d), [[1, 7, 7, 16], [2, 6, 12, 16], [3, 5, 15, 16], [4, 4, 16, 16]]);
  assert.equal(d.comparison.fixedQuantity, 'perimeter');
  assert.equal(d.comparison.varyingQuantity, 'area');
  assert.equal(d.models.at(-1).isSquare, true);
});

// Break caught: natural-number area constraints exclude a valid boundary square.
test('area thirty-six retains all five factor models including six by six', () => {
  assert.deepEqual(rows(build({ id: 'area-36', direction: A2P, target: 36 })),
    [[1, 36, 36, 74], [2, 18, 36, 40], [3, 12, 36, 30], [4, 9, 36, 26], [6, 6, 36, 24]]);
});

// Break caught: the 36-square-unit rule is applied only in the same-area branch.
test('perimeter forty excludes models above thirty-six square units', () => {
  assert.deepEqual(rows(build({ id: 'perimeter-40', direction: P2A, target: 40 })), [[1, 19, 19, 40], [2, 18, 36, 40]]);
});

// Break caught: a strict less-than bound silently drops the source's inclusive limit.
test('perimeter twenty-four accepts its thirty-six-square-unit square', () => {
  assert.deepEqual(rows(build({ id: 'perimeter-24', direction: P2A, target: 24 })),
    [[1, 11, 11, 24], [2, 10, 20, 24], [3, 9, 27, 24], [4, 8, 32, 24], [5, 7, 35, 24], [6, 6, 36, 24]]);
});

// Break caught: an impossible comparison is emitted with one model or rotated copies.
test('one-model targets reject instead of claiming a comparison task', () => {
  build();
  for (const [direction, targets] of [[A2P, [1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]], [P2A, [4, 6, 42, 74]]]) {
    for (const target of targets) assert.throws(() => build({ id: 'single-model', direction, target }), /insufficient_distinct_rectangle_models/u);
  }
});

// Break caught: zero, a fractional value, unsafe count or coercible value enters the bounded search.
test('target type range and perimeter parity reject without coercion', () => {
  build();
  for (const target of [0, -1, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, '12', 12n, null, undefined, {}, () => 12]) {
    assert.throws(() => build({ id: 'bad-target', direction: A2P, target }), /invalid_geometric_comparison_input/u);
  }
  for (const [direction, target] of [[A2P, 37], [P2A, 3], [P2A, 7], [P2A, 75], [P2A, 76]]) {
    assert.throws(() => build({ id: 'bad-range', direction, target }), /invalid_geometric_comparison_input/u);
  }
});

// Break caught: arbitrary prompt/markup/path text becomes an ID or freeform mode.
test('ids and semantic directions are exact bounded primitive inputs', () => {
  build();
  for (const id of ['', 'a'.repeat(81), '../archive', '<script>x</script>', 'two words', 'a\n', 'ödev', null, {}]) {
    assert.throws(() => build({ id, direction: A2P, target: 12 }), /invalid_geometric_comparison_input/u);
  }
  for (const direction of ['', 'same_area', 'same_perimeter', A2P + ' ', 'x'.repeat(100000), null, {}]) {
    assert.throws(() => build({ id: 'bad-mode', direction, target: 12 }), /invalid_geometric_comparison_input/u);
  }
});

// Break caught: a caller-controlled approval, source reference or model list bypasses canonical construction.
test('exact fields forbid caller models source overrides and approvals including hidden fields', () => {
  build();
  const input = { id: 'extra-fields', direction: A2P, target: 12 };
  for (const key of ['approved', 'models', 'source', 'matrix', 'provider', 'unit', 'svg', 'caption', 'id,direction,target']) {
    assert.throws(() => build({ ...input, [key]: true }), /invalid_geometric_comparison_input/u);
  }
  const hidden = { ...input }; Object.defineProperty(hidden, 'approved', { value: true });
  assert.throws(() => build(hidden), /invalid_geometric_comparison_input/u);
  assert.throws(() => build({ ...input, [Symbol('approved')]: true }), /invalid_geometric_comparison_input/u);
});

// Break caught: inspecting hostile objects invokes a getter/proxy/coercion hook.
test('getters proxies revoked proxies cycles and foreign objects reject with zero hooks', () => {
  build(); let hooks = 0;
  const good = { id: 'hostile', direction: A2P, target: 12 };
  const getter = { ...good }; Object.defineProperty(getter, 'target', { get() { hooks++; return 12; } });
  const proxy = new Proxy(good, { get() { hooks++; return null; }, ownKeys() { hooks++; return []; }, getPrototypeOf() { hooks++; return Object.prototype; } });
  const revoked = Proxy.revocable(good, {}); revoked.revoke();
  const cycle = { ...good }; cycle.target = cycle;
  const coercible = { ...good, target: { valueOf() { hooks++; return 12; }, toString() { hooks++; return '12'; } } };
  const manyFields = { ...good, ...Object.fromEntries(Array.from({ length: 20000 }, (_, i) => ['key' + i, i])) };
  for (const input of [getter, proxy, revoked.proxy, cycle, coercible, manyFields, [], null, new Date(), new Map(), () => good, Object.create(good)]) {
    assert.throws(() => build(input), /invalid_geometric_comparison_input/u);
  }
  assert.equal(hooks, 0);
});

// Break caught: input mutation or hidden noncanonical output differences prevent deterministic replay.
test('plain and null-prototype input key order produce the same immutable draft', () => {
  const first = { id: 'stable', direction: A2P, target: 12 }, before = JSON.stringify(first);
  const other = Object.assign(Object.create(null), { target: 12, id: 'stable', direction: A2P });
  const a = build(first), b = build(other);
  assert.deepEqual(a, b); assert.equal(JSON.stringify(first), before);
  assert.ok(Object.isFrozen(a) && Object.isFrozen(a.models[0]) && Object.isFrozen(a.assessment.requiredEvidence) && Object.isFrozen(a.visual.models));
  assert.throws(() => { a.models[0].width = 99; }, TypeError);
});

// Break caught: changing the semantic request leaves hashes or source bindings stale.
test('content and SVG hashes cover their complete deterministic artifacts', () => {
  const a = build(), { contentSha256, ...body } = a;
  assert.equal(contentSha256, bytesHash(JSON.stringify(body)));
  assert.equal(a.visual.svgSha256, bytesHash(a.visual.svg));
  assert.notEqual(build({ id: 'different-id', direction: A2P, target: 12 }).contentSha256, contentSha256);
  assert.notEqual(build({ id: 'comparison-area-12', direction: A2P, target: 18 }).contentSha256, contentSha256);
  assert.notEqual(build({ id: 'comparison-area-12', direction: P2A, target: 12 }).contentSha256, contentSha256);
});

// Break caught: arithmetic rows are counted as learner-ready questions or replace construction/explanation.
test('the task asks for construction table explanation and verification rather than an answer-only MCQ', () => {
  const a = build(), b = build({ id: 'perimeter-task', direction: P2A, target: 16 });
  for (const d of [a, b]) {
    assert.deepEqual(d.assessment.requiredEvidence.map(e => e.kind), ['construction', 'table', 'explanation', 'verification']);
    assert.equal(d.assessment.constructionRequired, true); assert.equal(d.assessment.explanationRequired, true);
    assert.equal(d.assessment.rubricImplemented, false); assert.equal(d.assessment.learnerEvidenceCaptured, false);
    assert.equal(d.assessment.masteryInferenceAllowed, false);
    assert.equal(Object.hasOwn(d, 'options'), false); assert.equal(Object.hasOwn(d, 'answerIndex'), false);
    assert.equal(d.counts.authoringTasks, 1); assert.equal(d.counts.semanticFamilies, 1);
    assert.equal(d.counts.modelRowsAreQuestionCount, false); assert.equal(d.counts.publishedQuestions, 0);
    assert.ok(d.shortPracticalNotes.length >= 3);
  }
  assert.notEqual(a.taskPrompt, b.taskPrompt); assert.notEqual(a.rationale.fixedMeaning, b.rationale.fixedMeaning);
});

// Break caught: logical dimensions are silently rotated or stretched without correct visual unit geometry.
test('abstract unit-square geometry explicitly rotates the first model without making a duplicate', () => {
  const d = build(), m = d.visual.models[0];
  assert.equal(m.modelId, 'model-1'); assert.equal(m.logicalWidthUnits, 1); assert.equal(m.logicalHeightUnits, 12);
  assert.equal(m.displayWidthUnits, 12); assert.equal(m.displayHeightUnits, 1); assert.equal(m.rotationDegrees, 90);
  assert.equal(m.pixelsPerLengthUnit, 20); assert.equal(m.bounds.width, 240); assert.equal(m.bounds.height, 20);
  assert.equal(m.unitSquareCount, 12);
  assert.match(d.visual.svg, /data-model="model-1"[^>]*width="240"[^>]*height="20"/u);
});

// Break caught: answer-bearing teacher tables lose their editor-only warning or become a hidden learner payload.
test('model and table SVG is visibly answer-bearing editor-only and does not claim reveal protection', () => {
  const d = build();
  assert.equal(d.visual.answerBearing, true); assert.equal(d.visual.learnerPayloadSafe, false);
  assert.equal(d.visual.revealProtectionImplemented, false); assert.equal(d.visual.review, 'pending');
  assert.match(d.visual.svg, /Editör çözüm referansı/u); assert.match(d.visual.svg, /Öğrenciye teslim onayı yok/u);
  assert.match(d.visual.svg, /26/u); assert.match(d.visual.svg, /16/u); assert.match(d.visual.svg, /14/u);
});

// Break caught: duplicate inline drafts depend on global IDs or emit executable/external markup.
test('SVG is self-contained with local accessible text and no document-global IDs or external resources', () => {
  const d = build(); const joined = d.visual.svg + d.visual.svg;
  assert.doesNotMatch(joined, /\bid=|aria-labelledby=|aria-describedby=|<script\b|<image\b|<foreignObject\b|(?:href|src)=|url\(|undefined|NaN|Infinity/u);
  assert.match(d.visual.svg, /role="img" aria-label="/u); assert.match(d.visual.svg, /<title>/u); assert.match(d.visual.svg, /<desc>/u);
  assert.equal(d.visual.originalProgramImageEmbedded, false);
});

// Break caught: a canvas-fit choice implies physical unit scale or clips the longest allowed model.
test('area thirty-six and six-model perimeter previews fit their explicitly bounded abstract canvas', () => {
  for (const d of [build({ id: 'fit-area-36', direction: A2P, target: 36 }), build({ id: 'fit-perim-24', direction: P2A, target: 24 })]) {
    assert.equal(d.visual.coordinateSpace, 'authored_abstract_unit_grid');
    for (const m of d.visual.models) {
      assert.ok(m.pixelsPerLengthUnit > 0 && Number.isFinite(m.pixelsPerLengthUnit));
      assert.equal(m.bounds.width, m.displayWidthUnits * m.pixelsPerLengthUnit);
      assert.equal(m.bounds.height, m.displayHeightUnits * m.pixelsPerLengthUnit);
      assert.equal(m.unitSquareCount, m.logicalWidthUnits * m.logicalHeightUnits);
      assert.ok(m.bounds.x >= 0 && m.bounds.y >= 0 && m.bounds.x + m.bounds.width <= d.visual.viewBox.width && m.bounds.y + m.bounds.height <= d.visual.viewBox.height);
    }
  }
});

// Break caught: pinned metadata promotes partial source review to active-program/rights/expert acceptance.
test('the real pinned source matrix retains partial review and closed acceptance gates', async () => {
  const d = build(), bytes = await readFile(new URL('../sources/grade5-geometric-quantities-authoring-matrix.json', import.meta.url));
  assert.equal(d.sourceReference.matrixSha256, bytesHash(bytes));
  assert.equal(d.sourceReference.programPdfSha256, '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734');
  assert.equal(d.sourceReference.programOutputCandidate, 'MAT.5.4.3');
  assert.deepEqual(d.sourceReference.physicalAndPrintedPages, [51, 53, 54]);
  assert.equal(d.sourceReference.mappingStatus, 'authoring_reference_only');
  for (const field of ['teacherApproved', 'expertApproved', 'publicationReady', 'learnerReady', 'productionReady', 'activeProgramVerified', 'learnerDataPresent']) assert.equal(d[field], false);
  assert.equal(d.curriculumReview, 'pending'); assert.equal(d.rightsReview, 'pending'); assert.equal(d.difficultyCalibration, 'unknown');
  assert.equal(d.originalityReview, 'archive_similarity_not_performed'); assert.equal(d.providerCallsMade, 0);
});

// Break caught: a numerical variant or rotated model falsely becomes another semantic family.
test('all bounded targets use the independently hand-classified acceptance domains', () => {
  build();
  const sameAreaAccepted = new Set([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36]);
  const samePerimeterAccepted = new Set([8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]);
  for (const [direction, end, step, accepted] of [[A2P, 36, 1, sameAreaAccepted], [P2A, 74, 2, samePerimeterAccepted]]) {
    for (let target = direction === A2P ? 1 : 4; target <= end; target += step) {
      const input = { id: 'domain-' + target, direction, target };
      if (!accepted.has(target)) { assert.throws(() => build(input), /insufficient_distinct_rectangle_models/u); continue; }
      const d = build(input); assert.ok(d.models.length >= 2); assert.equal(new Set(d.models.map(m => m.width + 'x' + m.height)).size, d.models.length);
      for (const m of d.models) {
        assert.ok(Number.isInteger(m.width) && Number.isInteger(m.height) && m.width > 0 && m.width <= m.height);
        assert.ok(m.areaSquareUnits <= 36); assert.equal(m.width * m.height, m.areaSquareUnits); assert.equal(2 * (m.width + m.height), m.perimeterUnits);
        assert.equal(direction === A2P ? m.areaSquareUnits : m.perimeterUnits, target);
      }
      assert.equal(d.counts.semanticFamilies, 1);
    }
  }
});

// Break caught: caller-rehashed DTOs or serialized drafts become an alternate accepted input contract.
test('serialized and caller-rehashed draft objects cannot bypass the three-field builder', () => {
  const d = build(), copied = structuredClone(d); copied.publicationReady = true;
  const { contentSha256, ...body } = copied; copied.contentSha256 = bytesHash(JSON.stringify(body));
  assert.throws(() => build(copied), /invalid_geometric_comparison_input/u);
  assert.throws(() => build(JSON.parse(JSON.stringify(d))), /invalid_geometric_comparison_input/u);
});
