import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const api = await import('../packages/content-factory/grade6_divisibility_classification_draft.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement] = await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement'].map(load));
const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-divisibility-classification.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
function source() {
  return { formObservations: clone(forms), semanticMatrix: clone(matrix), sourceScopeInput: {
    archives: [clone(main), clone(supplement)], selection: { sources: [], inventory: [] },
    downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: clone(forms) } };
}
function create(input = source()) {
  assert.equal(typeof api.createGrade6DivisibilityClassificationDraft, 'function', 'divisibility classification authoring is missing');
  return api.createGrade6DivisibilityClassificationDraft(input);
}
function verify(candidate, input = source()) {
  assert.equal(typeof api.verifyGrade6DivisibilityClassificationDraft, 'function', 'independent divisibility verifier is missing');
  return api.verifyGrade6DivisibilityClassificationDraft(candidate, input);
}
function rehash(value) {
  value.contentSha256 = hash('draft', Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256')));
  return value;
}
const values = [14, 21, 24, 25, 32, 33, 42, 47];
const groups = [
  { categoryId: 'only-2', cardIds: ['card-14', 'card-32'] },
  { categoryId: 'only-3', cardIds: ['card-21', 'card-33'] },
  { categoryId: 'both', cardIds: ['card-24', 'card-42'] },
  { categoryId: 'neither', cardIds: ['card-25', 'card-47'] },
];
const membership = [
  { cardId: 'card-14', value: 14, divisibleBy2: true, divisibleBy3: false, categoryId: 'only-2' },
  { cardId: 'card-21', value: 21, divisibleBy2: false, divisibleBy3: true, categoryId: 'only-3' },
  { cardId: 'card-24', value: 24, divisibleBy2: true, divisibleBy3: true, categoryId: 'both' },
  { cardId: 'card-25', value: 25, divisibleBy2: false, divisibleBy3: false, categoryId: 'neither' },
  { cardId: 'card-32', value: 32, divisibleBy2: true, divisibleBy3: false, categoryId: 'only-2' },
  { cardId: 'card-33', value: 33, divisibleBy2: false, divisibleBy3: true, categoryId: 'only-3' },
  { cardId: 'card-42', value: 42, divisibleBy2: true, divisibleBy3: true, categoryId: 'both' },
  { cardId: 'card-47', value: 47, divisibleBy2: false, divisibleBy3: false, categoryId: 'neither' },
];

// Break: eight cards or repeated deterministic calls become eight/new accepted questions.
test('one stable task has eight cards and four meaningful membership categories, not eight stock items', () => {
  const input = source(), before = JSON.stringify(input), draft = create(input);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(draft.problem.cards.map(card => card.value), values);
  assert.deepEqual(draft.problem.categories.map(category => category.id), ['only-2', 'only-3', 'both', 'neither']);
  assert.equal(draft.problem.family, 'joint_divisibility_card_classification');
  assert.deepEqual(draft.problem.rules.map(rule => rule.divisor), [2, 3]);
  assert.deepEqual(draft.counts, { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.deepEqual(create(), draft);
  assert.equal(draft.repeatedCallsCreateDistinctStock, false);
  assert.equal(draft.artifactAudience, 'editor_only');
  assert.deepEqual(draft.activity, { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 });
});

// Break: the verifier trusts the author's grouping or answer key instead of recomputing membership.
test('the independent decimal-rule oracle recomputes all four hand-derived groups', () => {
  const draft = create(), audit = verify(draft);
  assert.equal(audit.valid, true);
  assert.deepEqual(audit.recomputed.correctGroups, groups);
  assert.deepEqual(audit.recomputed.cardMembership, membership);
  assert.deepEqual(draft.solution.correctGroups, groups);
  assert.equal(audit.checks.exactMembership, true);
  assert.equal(audit.checks.answerKey, true);
  assert.equal(audit.counts.locallyMathPassedDrafts, 1);
  assert.equal(audit.counts.acceptedProductQuestions, 0);
});

// Break: rehashing a wrong answer creates a new trusted answer.
test('a rehashed one-rule-only or swapped answer remains mathematically wrong', () => {
  for (const categoryId of ['only-2', 'only-3', 'neither']) {
    const draft = clone(create());
    draft.answerKey.placements.find(row => row.cardId === 'card-24').categoryId = categoryId;
    rehash(draft);
    const audit = verify(draft);
    assert.equal(audit.valid, false);
    assert.equal(audit.checks.contentIntegrity, true);
    assert.equal(audit.checks.answerKey, false);
    assert.deepEqual(audit.recomputed.correctGroups, groups);
  }
});

// Break: a missing, duplicate or foreign card is accepted because the remaining placements are correct.
test('the answer must cover each known card exactly once', () => {
  const mutate = [
    placements => placements.pop(),
    placements => { placements[7] = clone(placements[0]); },
    placements => { placements[7].cardId = 'card-999'; },
    placements => placements.push({ cardId: 'card-47', categoryId: 'neither' }),
  ];
  for (const change of mutate) {
    const draft = clone(create()); change(draft.answerKey.placements); rehash(draft);
    const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.answerKey, false);
    assert.deepEqual(audit.recomputed.correctGroups, groups);
  }
});

// Break: altered solution groups or false intermediate explanations survive a correct answer key.
test('solution grouping and two independent card decisions are checked separately', () => {
  const wrongGroup = clone(create()); wrongGroup.solution.correctGroups[0].cardIds.push('card-24'); rehash(wrongGroup);
  const wrongReason = clone(create()); wrongReason.solution.cardReasons[0].divisibleBy3 = true; rehash(wrongReason);
  for (const draft of [wrongGroup, wrongReason]) {
    const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.exactMembership, false);
    assert.equal(audit.checks.answerKey, true); assert.deepEqual(audit.recomputed.correctGroups, groups);
  }
});

// Break: card presentation order changes the mathematically correct partition.
test('harmless card and answer ordering changes preserve the answer', () => {
  const draft = clone(create()); draft.problem.cards.reverse(); draft.answerKey.placements.reverse(); rehash(draft);
  const audit = verify(draft);
  assert.equal(audit.valid, true); assert.deepEqual(audit.recomputed.correctGroups, groups);
});

// Break: zero, negative, fraction, duplicate ID or unknown divisor silently changes the fixed task.
test('unsupported domains and card identity ambiguity fail closed', () => {
  const bad = [
    draft => { draft.problem.cards[0].value = 0; },
    draft => { draft.problem.cards[0].value = -14; },
    draft => { draft.problem.cards[0].value = 1.4; },
    draft => { draft.problem.cards[0].value = 1000001; },
    draft => { draft.problem.cards[1].id = 'card-14'; },
    draft => { draft.problem.rules[1].divisor = 7; },
    draft => { draft.problem.categories[3].id = 'both'; },
  ];
  for (const change of bad) { const draft = clone(create()); change(draft); rehash(draft); assert.equal(verify(draft).valid, false); }
});

// Break: source metadata substitution or a replacement digest is treated as real reviewed lineage.
test('source and semantic pins use the real current authoring plan rather than caller assertions', () => {
  const draft = create();
  assert.equal(draft.sourceLineage.briefId, 'g6-reference-authoring-13');
  assert.equal(draft.sourceLineage.sourceOrdinal, 13);
  assert.equal(draft.sourceLineage.sourceId, 'meb-archive-grade6-math-fascicle-unit1-hatay');
  assert.deepEqual(draft.scope.proposedOutcomeCodes, ['MAT.6.1.2']);
  assert.deepEqual(draft.purpose.microAimIds, ['G6Q13-M1', 'G6Q13-M2', 'G6Q13-M3']);
  const stale = clone(draft); stale.sourceLineage.sourceSha256 = 'a'.repeat(64); rehash(stale);
  assert.equal(verify(stale).checks.sourceLineage, false);
  const input = source(); input.semanticMatrix.outcomes[0].code = 'MAT.6.1.99';
  input.semanticMatrix.contentSha256 = createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(input.semanticMatrix).filter(([key]) => key !== 'contentSha256')))).digest('hex');
  assert.throws(() => create(input)); assert.equal(verify(draft, input).valid, false);
});

// Break: a rule explanation, meaning or shortcut is altered while the key remains correct.
test('reasoned narration preserves the requested goal, both conditions and a conditional shortcut', () => {
  const draft = create();
  assert.ok(draft.explanation.goal.length > 0 && draft.explanation.givenMeaning.length > 0 && draft.explanation.because.length > 0);
  assert.deepEqual(draft.explanation.steps.map(row => row.id), ['read-rules', 'check-two-rules', 'partition-once', 'verify-coverage']);
  assert.ok(draft.explanation.steps.every(row => row.why.length > 0 && row.meaning.length > 0));
  assert.ok(draft.explanation.conditionalShortcut.worksWhen.length > 0 && draft.explanation.conditionalShortcut.notImplied.length > 0);
  assert.ok(draft.solution.cardReasons.every(row => row.why2.length > 0 && row.why3.length > 0));
  const changed = clone(draft); changed.explanation.because = 'Yalnız çift sayılara bakmak yeterlidir.'; rehash(changed);
  assert.equal(verify(changed).checks.reasonedEvidence, false);
});

// Break: a new local draft becomes empirically calibrated, official whole-output coverage or student mastery.
test('provisional difficulty and recognition scope remain distinct from approval publication and learner evidence', () => {
  const draft = create(), audit = verify(draft);
  assert.deepEqual(draft.difficulty, { level: 'medium', basis: 'author_estimate_not_empirical', calibration: null, targetDistribution: null });
  assert.equal(draft.scope.fullOutcomeCoverage, false); assert.equal(draft.scope.officialOutcomeCode, null);
  assert.equal(draft.purpose.learnerEvidenceCollected, false); assert.equal(draft.purpose.fullBriefEvidenceFulfilled, false);
  assert.equal(draft.representation.kind, 'text_labelled_membership_cards/v1');
  assert.equal(draft.representation.sourceTopologyCopied, false); assert.equal(draft.representation.colorOnlyMeaning, false);
  for (const key of ['humanApproval', 'publicationReady', 'learnerReady', 'productionReady']) assert.equal(draft[key], key === 'humanApproval' ? null : false);
  for (const change of [d => { d.difficulty.calibration = 'passed'; }, d => { d.scope.fullOutcomeCoverage = true; }, d => { d.publicationReady = true; }, d => { d.purpose.learnerEvidenceCollected = true; }]) {
    const value = clone(draft); change(value); rehash(value); assert.equal(verify(value).valid, false);
  }
  assert.equal(audit.publicationReady, false); assert.equal(audit.learnerReady, false);
});

// Break: a payload executes getters/proxy hooks, overruns memory, or serializes cycles as valid candidate data.
test('unsafe wire candidates are rejected without executing hooks', () => {
  const draft = create(); let calls = 0;
  const getter = clone(draft); Object.defineProperty(getter, 'problem', { enumerable: true, get() { calls++; return draft.problem; } });
  const proxy = new Proxy(draft, { ownKeys() { calls++; return []; } });
  const cycle = clone(draft); cycle.extra = cycle;
  const oversized = clone(draft); oversized.prompt = 'x'.repeat(65537);
  for (const value of [getter, proxy, cycle, oversized]) assert.equal(verify(value).valid, false);
  assert.equal(calls, 0);
});

// Break: diagnostics mutate input, unfrozen state can be promoted, or stale digest is accepted.
test('draft and diagnostics are immutable bounded snapshots with integrity verification', () => {
  const draft = create(), before = JSON.stringify(draft), audit = verify(draft);
  assert.equal(JSON.stringify(draft), before);
  assert.ok(Object.isFrozen(draft.problem.cards[0]) && Object.isFrozen(audit.recomputed.cardMembership));
  assert.throws(() => { draft.problem.cards[0].value = 99; }, TypeError);
  assert.ok(Buffer.byteLength(before) < 65536);
  const stale = clone(draft); stale.contentSha256 = 'a'.repeat(64);
  assert.equal(verify(stale).checks.contentIntegrity, false);
  assert.equal(api.verifyGrade6DivisibilityClassificationDraft(draft).valid, false);
  assert.throws(() => api.createGrade6DivisibilityClassificationDraft(source(), {}));
});

// Break: malformed nested data throws during diagnostics rather than returning rejection.
test('null or primitive nested records fail closed without throwing', () => {
  for (const change of [
    draft => { draft.solution.cardReasons[0] = null; },
    draft => { draft.solution.cardReasons[0] = 14; },
    draft => { draft.solution.correctGroups[0] = null; },
    draft => { draft.answerKey.placements[0] = null; },
    draft => { draft.problem.cards[0] = null; },
    draft => { draft.explanation = null; },
    draft => { draft.sourceLineage = false; },
  ]) {
    const draft = clone(create()); change(draft); rehash(draft);
    let audit; assert.doesNotThrow(() => { audit = verify(draft); });
    assert.equal(audit.valid, false);
  }
});
