import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6ReferenceAuthoringPlan } from '../packages/content-factory/grade6_reference_authoring_plan.mjs';
import { validateQuestionCoverageBlueprint } from '../packages/contracts/question_coverage_blueprint.mjs';

const api = await import('../packages/content-factory/grade6_factor_evidence_draft.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement] = await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement'].map(load));
const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-factor-evidence.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
function source() { return { formObservations: clone(forms), semanticMatrix: clone(matrix), sourceScopeInput: {
  archives: [clone(main), clone(supplement)], selection: { sources: [], inventory: [] },
  downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: clone(forms) } }; }
function create(value = source()) {
  assert.equal(typeof api.createGrade6FactorEvidenceDraft, 'function', 'factor evidence authoring is missing');
  return api.createGrade6FactorEvidenceDraft(value);
}
function verify(draft, value = source()) {
  assert.equal(typeof api.verifyGrade6FactorEvidenceDraft, 'function', 'independent factor verifier is missing');
  return api.verifyGrade6FactorEvidenceDraft(draft, value);
}
function rehash(value) { value.contentSha256 = hash('draft', Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256'))); return value; }
const pairs = [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]];

// Break: calls or numeric clones are presented as six new approved questions.
test('one fixed original editor task has four evidence boards but one draft and zero product stock', () => {
  const value = source(), before = JSON.stringify(value), draft = create(value);
  assert.equal(JSON.stringify(value), before);
  assert.equal(draft.problem.number, 36); assert.equal(draft.problem.boards.length, 4);
  assert.equal(draft.problem.family, 'complete_factor_pair_board_prime_subset_audit');
  assert.deepEqual(draft.counts, { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(draft.artifactAudience, 'editor_only'); assert.equal(draft.state, 'draft');
  assert.equal(draft.repeatedCallsCreateDistinctStock, false);
  assert.deepEqual(create(), draft);
});

// Break: supplied key or factorization is treated as the solver's answer.
test('the independent oracle recomputes the hand-derived square pairs prime subset and unique correct board', () => {
  const draft = create(), audit = verify(draft);
  assert.equal(audit.valid, true); assert.equal(audit.localMathChecks, 'passed');
  assert.deepEqual(audit.recomputed, { positiveDivisors: [1, 2, 3, 4, 6, 9, 12, 18, 36], factorPairs: pairs,
    distinctPrimeFactors: [2, 3], primeBadgeSum: 5, correctBoardIds: ['board-c'] });
  assert.deepEqual(draft.answerKey, { boardId: 'board-c' });
  assert.deepEqual(draft.problem.boards[2], { id: 'board-c', factorPairs: pairs, primeBadges: [2, 3], primeBadgeSum: 5 });
  assert.equal(audit.checks.exactlyOneCorrectBoard, true); assert.equal(audit.checks.answerKey, true);
  assert.equal(audit.counts.locallyMathPassedDrafts, 1); assert.equal(audit.counts.acceptedProductQuestions, 0);
});

// Break: missing square pair, one-as-prime or repeated prime badges is accepted.
test('the three authored wrong boards fail distinct structural rules rather than just disagreeing with a key', () => {
  const audit = verify(create());
  assert.deepEqual(audit.boardChecks.map(row => ({ id: row.id, completePairs: row.completePairs, exactPrimeSubset: row.exactPrimeSubset, correctPrimeSum: row.correctPrimeSum, valid: row.valid })), [
    { id: 'board-a', completePairs: true, exactPrimeSubset: false, correctPrimeSum: false, valid: false },
    { id: 'board-b', completePairs: false, exactPrimeSubset: true, correctPrimeSum: true, valid: false },
    { id: 'board-c', completePairs: true, exactPrimeSubset: true, correctPrimeSum: true, valid: true },
    { id: 'board-d', completePairs: true, exactPrimeSubset: false, correctPrimeSum: false, valid: false }
  ]);
});

// Break: a correctly rehashed wrong key becomes a locally verified answer.
test('wrong or missing board keys fail after caller rehash and preserve a recomputed independent answer', () => {
  for (const id of ['board-a', 'board-b', 'board-d', 'board-missing']) {
    const draft = clone(create()); draft.answerKey.boardId = id; rehash(draft);
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true);
    assert.equal(audit.checks.answerKey, false); assert.deepEqual(audit.recomputed.correctBoardIds, ['board-c']);
  }
});

// Break: a duplicate correct option or absence of one is ignored.
test('exactly one correct board is proven independently even when every edited candidate is rehashed', () => {
  const multiple = clone(create()); multiple.problem.boards[0] = { ...clone(multiple.problem.boards[2]), id: 'board-a' }; rehash(multiple);
  const none = clone(create()); none.problem.boards[2].primeBadges = [1, 2, 3]; rehash(none);
  for (const [draft, ids] of [[multiple, ['board-a', 'board-c']], [none, []]]) {
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.checks.exactlyOneCorrectBoard, false);
    assert.deepEqual(audit.recomputed.correctBoardIds, ids); assert.equal(audit.counts.locallyMathPassedDrafts, 0);
  }
});

// Break: pair order, reversed orientation, repetition, wrong product or missing factor is not checked.
test('board pair completeness is set-correct but rejects duplicates orientation and missing or false factors', () => {
  const mutations = [b => { b.factorPairs.pop(); }, b => { b.factorPairs.push([6, 6]); },
    b => { b.factorPairs[0] = [36, 1]; }, b => { b.factorPairs[3] = [4, 8]; }];
  for (const mutate of mutations) {
    const draft = clone(create()); mutate(draft.problem.boards[2]); rehash(draft);
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.boardChecks[2].completePairs, false);
    assert.deepEqual(audit.recomputed.factorPairs, pairs);
  }
});

// Break: all divisors or prime powers are confused with distinct prime factors or their sum.
test('prime classification and requested sum are separate from full divisor membership', () => {
  for (const [badges, sum] of [[[1, 2, 3], 6], [[2, 3, 6], 11], [[2, 2, 3, 3], 10], [[2, 3], 91]]) {
    const draft = clone(create()); Object.assign(draft.problem.boards[2], { primeBadges: badges, primeBadgeSum: sum }); rehash(draft);
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.boardChecks[2].valid, false);
    assert.deepEqual(audit.recomputed.distinctPrimeFactors, [2, 3]); assert.equal(audit.recomputed.primeBadgeSum, 5);
  }
});

// Break: recognizing supplied evidence claims pupil construction, mastery or whole official output coverage.
test('recognition evidence and conditional rationale do not claim constructed proof or learner mastery', () => {
  const draft = create();
  assert.equal(draft.purpose.evidenceKind, 'recognition_of_given_evidence'); assert.equal(draft.purpose.learnerEvidenceCollected, false);
  assert.equal(draft.purpose.fullBriefEvidenceFulfilled, false);
  assert.deepEqual(draft.scope.proposedOutcomeCodes, ['MAT.6.1.1', 'MAT.6.1.3']);
  assert.equal(draft.scope.officialOutcomeCode, null); assert.equal(draft.scope.activeProgramAccepted, false); assert.equal(draft.scope.fullOutcomeCoverage, false);
  assert.equal(draft.explanation.conditions.length >= 2, true);
  assert.equal(draft.explanation.conditionalShortcut.worksWhen.length > 0, true);
  assert.equal(draft.explanation.conditionalShortcut.notImplied.length > 0, true);
  assert.deepEqual(draft.explanation.steps.map(row => row.id), ['complete-pairs', 'distinct-primes', 'target-sum']);
  assert.deepEqual(draft.explanation.steps[0].result, pairs); assert.deepEqual(draft.explanation.steps[1].result, [2, 3]);
  assert.equal(draft.explanation.steps[2].result, 5);
  assert.equal(draft.explanation.transfer.number, 1); assert.deepEqual(draft.explanation.transfer.factorPairs, [[1, 1]]);
  assert.deepEqual(draft.explanation.transfer.distinctPrimeFactors, []); assert.equal(draft.explanation.transfer.primeBadgeSum, 0);
});

// Break: rehashing different source, grade, aim, governance purpose or instructional results changes the authorized profile.
test('wrong source scope purpose and reasoned result fail independently of a fresh caller hash', () => {
  for (const mutate of [d => { d.sourceLineage.sourceSha256 = 'f'.repeat(64); }, d => { d.scope.gradeCandidate = 7; },
    d => { d.scope.proposedOutcomeCodes.push('MAT.6.1.4'); }, d => { d.purpose.evidenceKind = 'learner_constructed_proof'; },
    d => { d.governance.purpose = 'learning_analytics'; }, d => { d.explanation.steps[2].result = 91; },
    d => { d.explanation.transfer.primeBadgeSum = 1; }]) {
    const draft = clone(create()); mutate(draft); rehash(draft); const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true); assert.equal(audit.productionReady, false);
  }
});

// Break: known PDF/plan metadata becomes interchangeable with a caller-provided approval digest.
test('canonical planner really consumes the source revision and lineage instead of serialized plan flags', () => {
  const value = source(), plan = createGrade6ReferenceAuthoringPlan(value), draft = create(value);
  assert.equal(draft.sourceLineage.planContentSha256, plan.contentSha256);
  assert.equal(draft.sourceLineage.briefId, 'g6-reference-authoring-16'); assert.equal(draft.sourceLineage.sourceOrdinal, 16);
  assert.equal(draft.sourceLineage.freshPdfByteChecks, 0);
  const corrupted = source(); corrupted.formObservations.observations[0].items[3].microPurposes[0].meaning = 'Caller approved alternative';
  assert.throws(() => create(corrupted), /grade6_authoring_/u);
  assert.equal(verify(draft, corrupted).valid, false);
  assert.throws(() => create(plan), /grade6_authoring_/u);
  assert.equal(verify(draft, { approved: true, contentSha256: plan.contentSha256 }).valid, false);
});

// Break: source-scope metadata variants inflate semantic stock or rewrite authored values.
test('same authored task from narrow and broad canonical source snapshots retains one semantic revision', () => {
  const wide = source(), narrow = source();
  narrow.sourceScopeInput.archives = [{ sources: wide.sourceScopeInput.archives.flatMap(row => row.sources)
    .filter(row => ['tymm-current-ortaokul-matematik', 'meb-archive-grade6-math-fascicle-unit1-hatay'].includes(row.id)) }];
  const a = create(wide), b = create(narrow);
  assert.notEqual(a.sourceLineage.planContentSha256, b.sourceLineage.planContentSha256);
  assert.equal(a.authoredTaskSha256, b.authoredTaskSha256); assert.deepEqual(a.problem, b.problem);
  assert.equal(a.counts.newAuthoredDrafts, 1); assert.equal(b.counts.newAuthoredDrafts, 1);
  assert.equal(verify(a, narrow).valid, false); assert.equal(verify(b, narrow).valid, true);
});

// Break: passing local math resolves rights, answer expert approval, accessibility, production or media.
test('successful numeric audit leaves every external gate pending and no learner media or approval issued', () => {
  const draft = create(), audit = verify(clone(draft));
  for (const value of [draft, audit]) {
    assert.equal(value.humanApproval, null); assert.equal(value.publicationReady, false); assert.equal(value.learnerReady, false);
    assert.equal(value.productionReady, false); assert.equal(value.serializedHashIsAuthority, false);
    assert.equal(Object.values(value.gates).every(v => v === 'pending'), true);
    assert.equal(value.counts.acceptedProductQuestions, 0); assert.equal(value.counts.publishedQuestions, 0);
  }
  assert.equal(draft.representation.rendered, false); assert.equal(draft.representation.sourceTopologyCopied, false);
  assert.deepEqual(draft.activity, { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 });
  assert.equal(draft.originality.archiveSimilarityPassed, false); assert.equal(draft.originality.originalityVerified, false);
  assert.equal(validateQuestionCoverageBlueprint(draft).valid, false);
});

// Break: zero, noninteger or huge authoring inputs turn the oracle into an unbounded template generator.
test('number options and board cardinality are a fixed bounded editor profile not a bulk authoring API', () => {
  for (const number of [0, -1, 1.5, 101, 9007199254740991]) {
    const draft = clone(create()); draft.problem.number = number; rehash(draft);
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.recomputed, null);
  }
  for (const mutate of [d => d.problem.boards.push(clone(d.problem.boards[0])), d => d.problem.boards[0].factorPairs.push(...Array(30).fill([1, 36]))]) {
    const draft = clone(create()); mutate(draft); rehash(draft); assert.equal(verify(draft).valid, false);
  }
  assert.throws(() => api.createGrade6FactorEvidenceDraft(source(), { number: 72 }), /invalid_factor_draft_arguments/u);
  assert.equal(api.verifyGrade6FactorEvidenceDraft(create(), source(), { approve: true }).valid, false);
});

// Break: DTO accessors, revoked proxies, sparse/cyclic/oversized data run code during diagnostic checks.
test('hostile candidate hooks are never executed and retain no authority in failed diagnostics', () => {
  let hooks = 0; const getter = {}; Object.defineProperty(getter, 'problem', { get() { hooks++; return {}; }, enumerable: true });
  const proxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; return []; } }); const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cyclic = {}; cyclic.x = cyclic; const sparse = clone(create()); sparse.problem.boards = new Array(4);
  const oversized = clone(create()); oversized.prompt = 'x'.repeat(65537);
  const extra = clone(create()); extra.approved = true;
  for (const value of [getter, proxy, revoked.proxy, cyclic, sparse, oversized, extra, () => { hooks++; }]) {
    const audit = verify(value); assert.equal(audit.valid, false); assert.equal(audit.publicationReady, false);
    assert.equal(audit.recomputed, null); assert.equal(JSON.stringify(audit).includes('65537'), false);
  }
  assert.equal(hooks, 0);
});

// Break: caller mutation, object-key order or a stale digest changes a supposedly immutable draft.
test('frozen output hash is reproducible with canonical key order and content modifications are observable', () => {
  const draft = create(), audit = verify(draft);
  assert.equal(draft.contentSha256, hash('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))));
  assert.equal(Object.isFrozen(draft.problem.boards[0].factorPairs[0]), true); assert.equal(Object.isFrozen(audit.recomputed.factorPairs), true);
  assert.throws(() => { draft.answerKey.boardId = 'board-a'; }, TypeError);
  const changed = clone(draft); changed.answerKey.boardId = 'board-a'; assert.equal(verify(changed).checks.contentIntegrity, false);
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  assert.deepEqual(verify(reverse(draft)), audit);
  assert.equal(Buffer.byteLength(JSON.stringify(draft)) < 65536, true);
});

// Break: malformed plain-data explanation containers cause a native map/property exception.
test('malformed explanation containers and null steps yield a closed diagnostic not a native exception', () => {
  for (const steps of [{}, 'not-an-array', [null], [{ id: 'empty' }]]) {
    const draft = clone(create()); draft.explanation.steps = steps; rehash(draft);
    assert.doesNotThrow(() => verify(draft)); assert.equal(verify(draft).valid, false);
  }
});

// Break: source accessors or approval booleans bypass canonical binding before the authoring record is built.
test('source hooks and forged approval never execute or produce an authoring record', () => {
  let hooks = 0; const getter = source(); Object.defineProperty(getter, 'formObservations', { get() { hooks++; return forms; }, enumerable: true });
  const proxy = new Proxy(source(), { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  const revoked = Proxy.revocable(source(), {}); revoked.revoke();
  for (const value of [getter, proxy, revoked.proxy]) {
    assert.throws(() => create(value), /grade6_authoring_/u); assert.equal(verify(create(), value).valid, false);
  }
  assert.equal(hooks, 0);
  const promoted = clone(create()); promoted.gates.answer = 'approved'; promoted.humanApproval = { approved: true }; promoted.learnerReady = true;
  rehash(promoted); const audit = verify(promoted); assert.equal(audit.valid, false); assert.equal(audit.humanApproval, null); assert.equal(audit.learnerReady, false);
});
