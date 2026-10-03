import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const api = await import('../packages/media/garden_reasoning.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function fn(name) { assert.equal(typeof api[name], 'function', `${name} is not implemented`); return api[name]; }
const create = (...args) => fn('createGardenReasoningOverlay')(...args);
const view = (...args) => fn('getGardenReasoningView')(...args);

// Break: using old narration as if it already explained the target and relations.
test('the teaching trace begins with the requested quantity, givens and plan before any calculation', () => {
  const overlay = create();
  assert.deepEqual(overlay.stages.map(s => s.id), ['goal', 'givens', 'plan', 'step1', 'step2', 'step3', 'step4', 'check', 'compare']);
  for (const stageIndex of [0, 1, 2]) {
    const current = view(overlay, { stageIndex });
    assert.equal(current.stage.kind, 'orient');
    assert.equal(current.stage.calculation, null);
    assert.deepEqual(current.priorResults, []);
    assert.doesNotMatch(JSON.stringify(current), /\b(?:27|90|86|172)\b/u, 'an unexplained result leaked into the orientation');
  }
  assert.equal(view(overlay).target.measurement, 'wire_length');
  assert.equal(view(overlay).target.wireRows, 2);
  assert.equal(view(overlay).target.excludesGatePerRow, true);
  assert.equal(view(overlay).target.unit, 'm');
});

// Break: binding the denominator 2 to the question's two wire rows.
test('eighteen and both ratio components have distinct question origins, separate from the row count', () => {
  const overlay = create();
  const byId = Object.fromEntries(overlay.givens.map(g => [g.id, g]));
  assert.equal(byId.short_side.value, 18); assert.equal(byId.short_side.unit, 'm');
  assert.equal(byId.ratio_denominator.value, 2); assert.equal(byId.ratio_denominator.role, 'short_side_equal_parts');
  assert.equal(byId.ratio_numerator.value, 3); assert.equal(byId.ratio_numerator.role, 'long_side_equal_parts');
  assert.equal(byId.wire_rows.value, 2); assert.equal(byId.wire_rows.role, 'wire_row_count');
  assert.equal(byId.gate_width.value, 4); assert.equal(byId.gate_width.role, 'per_row_gate_gap');
  const long = overlay.stages[3];
  assert.deepEqual(long.givenIds, ['short_side', 'ratio_denominator', 'ratio_numerator']);
  assert.equal(long.operands.find(o => o.value === 2).sourceId, 'ratio_denominator');
  assert.equal(overlay.stages[6].operands.find(o => o.value === 2).sourceId, 'wire_rows');
});

test('the perimeter multiplier counts two pairs of edges, not ratio shares or wire rows', () => {
  const perimeter = create().stages[4];
  const multiplier = perimeter.operands.find(o => o.value === 2);
  assert.equal(multiplier.sourceId, 'opposite_edge_pairs');
  assert.equal(multiplier.originKind, 'shape_property');
  assert.equal(perimeter.operands.find(o => o.value === 27).sourceId, 'step1');
  assert.deepEqual(perimeter.dependsOn, ['step1']);
});

test('revealing the ratio calculation explains nine as one equal part before twenty-seven as three parts', () => {
  const overlay = create();
  assert.deepEqual(view(overlay, { stageIndex: 3 }).stage.workedSteps, []);
  assert.deepEqual(view(overlay, { stageIndex: 3, revealAnswer: true }).stage.workedSteps, [
    { expression: '18 ÷ 2', value: 9, unit: 'm', meaning: 'Bir eş parçanın uzunluğu' },
    { expression: '9 × 3', value: 27, unit: 'm', meaning: 'Üç eş parça: uzun kenar' },
  ]);
});

test('every calculation has a reason and a source-bound meaning before its numbers are revealed', () => {
  const overlay = create();
  const fixtures = [
    { index: 3, expression: '18 ÷ 2 × 3', value: 27, meaning: 'Uzun kenar', prior: [] },
    { index: 4, expression: '2 × (18 + 27)', value: 90, meaning: 'Tam çevre', prior: [27] },
    { index: 5, expression: '90 − 4', value: 86, meaning: 'Kapı hariç bir sıra', prior: [27, 90] },
    { index: 6, expression: '86 × 2', value: 172, meaning: 'İki sıra toplam tel', prior: [27, 90, 86] },
  ];
  for (const f of fixtures) {
    const hidden = view(overlay, { stageIndex: f.index });
    assert.equal(hidden.stage.kind, 'calculate'); assert.equal(hidden.requiresReveal, true);
    assert.ok(hidden.stage.whyThisOperation.length > 50);
    assert.equal(hidden.stage.calculation, null); assert.equal(hidden.canAdvance, false);
    assert.deepEqual(hidden.priorResults.map(r => r.value), f.prior);
    const revealed = view(overlay, { stageIndex: f.index, revealAnswer: true });
    assert.deepEqual(revealed.stage.calculation, { expression: f.expression, value: f.value, unit: 'm', meaning: f.meaning });
    assert.equal(revealed.canAdvance, true);
  }
});

test('the check question is separated from its answer rather than immediately answering itself', () => {
  const overlay = create(); const hidden = view(overlay, { stageIndex: 7 });
  assert.equal(hidden.stage.checkQuestion, 'Kapı boşluğunu neden iki kez çıkardık?');
  assert.equal(hidden.stage.checkAnswer, null); assert.equal(hidden.canAdvance, false);
  const revealed = view(overlay, { stageIndex: 7, revealAnswer: true });
  assert.ok(revealed.stage.checkAnswer.length > 30); assert.equal(revealed.canAdvance, true);
});

// Literal arithmetic: two full rows 180; two 4m gaps 8; needed wire 172.
test('the shorter equivalent route removes both gaps and never treats 180 minus 4 as valid', () => {
  const alternate = view(create(), { stageIndex: 8 }).stage.alternate;
  assert.equal(alternate.expression, '2 × 90 − 2 × 4');
  assert.equal(alternate.value, 172); assert.equal(alternate.unit, 'm');
  assert.equal(alternate.fullRowsLength, 180); assert.equal(alternate.excludedGateLength, 8);
  assert.equal(alternate.validOnlyWhen, 'same_gap_in_each_row');
  assert.notEqual(alternate.value, 176);
  assert.equal(view(create(), { stageIndex: 8 }).canAdvance, false);
});

test('a new reasoning revision is hash-bound without silently replacing the old plan or voice', () => {
  const overlay = create();
  assert.equal(overlay.source.contentSha256, 'a5dde54c513fcca9ae4fbcf39917ccb37a761e3fca688ba3f2a1b3cc39cc77d4');
  assert.equal(overlay.source.inkPlanSha256, '309a08895704329e9db15782fe1fdf56a449421c21019bfaaa02c8344fdc6e6b');
  assert.equal(overlay.state, 'draft'); assert.equal(overlay.publicationReady, false);
  assert.equal(overlay.mediaStatus, 'new_narration_not_generated');
  assert.equal(view(overlay).mediaStatus, 'new_narration_not_generated');
  const { contentSha256, ...body } = overlay;
  assert.equal(contentSha256, createHash('sha256').update(JSON.stringify(body)).digest('hex'));
  assert.equal(view(overlay).source.overlaySha256, contentSha256);
});

test('reduced-motion views retain the exact question and reasons while declaring no animation', () => {
  const overlay = create();
  const normal = view(overlay, { stageIndex: 3, revealAnswer: true });
  const reduced = view(overlay, { stageIndex: 3, revealAnswer: true, reducedMotion: true });
  assert.deepEqual(reduced.stage, normal.stage); assert.equal(reduced.questionText, normal.questionText);
  assert.equal(reduced.reducedMotion, true); assert.equal(normal.reducedMotion, false);
});

test('immutable trusted overlays reject forged snapshots and caller publication claims', () => {
  const overlay = create();
  assert.throws(() => { overlay.stages[3].calculation.value = 999; }, TypeError);
  for (const bad of [null, {}, JSON.parse(JSON.stringify(overlay)), { ...overlay }]) assert.throws(() => view(bad), /invalid_reasoning_overlay/u);
  assert.throws(() => create({ publicationReady: true }), /invalid_reasoning_options/u);
  assert.throws(() => create({ questionId: '<private-student>' }), /invalid_reasoning_options/u);
});

test('bounds and own-data checks reject malformed stages or getters without invoking them', () => {
  const overlay = create();
  for (const options of [null, [], { stageIndex: -1 }, { stageIndex: 9 }, { stageIndex: 3.5 }, { stageIndex: '3' }, { revealAnswer: 'yes' }, { reducedMotion: 1 }, { sourceHash: 'forged' }]) assert.throws(() => view(overlay, options), /invalid_reasoning_options/u);
  let calls = 0;
  assert.throws(() => view(overlay, { get stageIndex() { calls++; return 3; } }), /invalid_reasoning_options/u);
  assert.throws(() => create({ get questionId() { calls++; return 'garden-two-rows-editor-v1'; } }), /invalid_reasoning_options/u);
  const proxy = new Proxy({}, { ownKeys() { calls++; throw Error('must not run'); } });
  assert.throws(() => create(proxy), /invalid_reasoning_options/u); assert.equal(calls, 0);
});
