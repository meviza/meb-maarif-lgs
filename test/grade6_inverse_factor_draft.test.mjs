import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6ReferenceAuthoringPlan } from '../packages/content-factory/grade6_reference_authoring_plan.mjs';

const api = await import('../packages/content-factory/grade6_inverse_factor_draft.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement] = await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement'].map(load));
const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-inverse-factor.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
function source() { return { formObservations: clone(forms), semanticMatrix: clone(matrix), sourceScopeInput: {
  archives: [clone(main), clone(supplement)], selection: { sources: [], inventory: [] },
  downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: clone(forms) } }; }
function create(input = source()) {
  assert.equal(typeof api.createGrade6InverseFactorDraft, 'function', 'inverse-factor authoring consumer is missing');
  return api.createGrade6InverseFactorDraft(input);
}
function verify(candidate, input = source()) {
  assert.equal(typeof api.verifyGrade6InverseFactorDraft, 'function', 'independent inverse-factor verifier is missing');
  return api.verifyGrade6InverseFactorDraft(candidate, input);
}
function rehash(value) {
  value.contentSha256 = hash('draft', Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256')));
  return value;
}
const domain = { minimum: 60, maximum: 95, inclusive: true, numericKind: 'positive_integer' };
const pairs = [[1, 84], [2, 42], [3, 28], [4, 21], [6, 14], [7, 12]];
const remaining = [[1, 84], [2, 42], [4, 21], [7, 12]];
const completed = [{ partialPairId: 'pair-3', left: 3, right: 28 }, { partialPairId: 'pair-14', left: 6, right: 14 }];

// Break: a known-number pair board or repeated call is presented as new inverse stock.
test('one fixed task reconstructs an unknown number from incomplete evidence without inflating question stock', () => {
  const input = source(), before = JSON.stringify(input), draft = create(input);
  assert.equal(JSON.stringify(input), before);
  assert.equal(draft.problem.family, 'inverse_factor_candidate_reconstruction');
  assert.deepEqual(draft.problem.candidateDomain, domain);
  assert.deepEqual(draft.problem.partialPairs, [{ id: 'pair-3', left: 3, right: null }, { id: 'pair-14', left: null, right: 14 }]);
  assert.equal(Object.hasOwn(draft.problem, 'number'), false);
  assert.equal(draft.problem.options.length, 4);
  assert.deepEqual(draft.counts, { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.deepEqual(create(), draft);
  assert.equal(draft.repeatedCallsCreateDistinctStock, false);
  assert.equal(draft.artifactAudience, 'editor_only');
});

// Break: builder answer or first matching option substitutes for exhaustive independent proof.
test('independent integer enumeration proves unique 84 and reconstructs every missing factor pair', () => {
  const draft = create(), audit = verify(draft);
  assert.equal(audit.valid, true);
  assert.equal(audit.localMathChecks, 'passed');
  assert.deepEqual(audit.recomputed, { candidateNumbers: [84], uniqueCandidate: true, number: 84,
    positiveDivisors: [1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84], completedPairs: completed,
    allFactorPairs: pairs, remainingPairs: remaining, correctOptionIds: ['option-b'] });
  assert.deepEqual(draft.solution, { candidateNumbers: [84], number: 84, completedPairs: completed,
    allFactorPairs: pairs, remainingPairs: remaining, correctOptionId: 'option-b' });
  assert.deepEqual(draft.answerKey, { optionId: 'option-b' });
  assert.equal(audit.checks.candidateUniqueness, true);
  assert.equal(audit.checks.completeReconstruction, true);
  assert.equal(audit.checks.exactlyOneCorrectOption, true);
});

// Break: option correctness only compares its number with a supplied key.
test('distractors distinguish an omitted pair from numbers inconsistent with the given partial evidence', () => {
  const audit = verify(create());
  assert.deepEqual(audit.optionChecks, [
    { id: 'option-a', candidateInDomain: true, partialEvidenceMatches: true, completeRemainingPairs: false, valid: false },
    { id: 'option-b', candidateInDomain: true, partialEvidenceMatches: true, completeRemainingPairs: true, valid: true },
    { id: 'option-c', candidateInDomain: true, partialEvidenceMatches: false, completeRemainingPairs: false, valid: false },
    { id: 'option-d', candidateInDomain: true, partialEvidenceMatches: false, completeRemainingPairs: false, valid: false },
  ]);
});

// Break: correctly rehashed wrong key becomes a locally verified answer.
test('wrong keys cannot change the independently recomputed unique option after caller rehash', () => {
  for (const optionId of ['option-a', 'option-c', 'option-d', 'missing']) {
    const draft = clone(create()); draft.answerKey.optionId = optionId; rehash(draft);
    const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true);
    assert.equal(audit.checks.answerKey, false); assert.deepEqual(audit.recomputed.correctOptionIds, ['option-b']);
  }
});

// Break: duplicate correct choices or no correct choice are accepted as a closed item.
test('duplicate and absent complete options fail the one-correct-option condition', () => {
  const multiple = clone(create()); multiple.problem.options[0] = { ...clone(multiple.problem.options[1]), id: 'option-a' }; rehash(multiple);
  const none = clone(create()); none.problem.options[1].remainingPairs.pop(); rehash(none);
  for (const [draft, expected] of [[multiple, ['option-a', 'option-b']], [none, []]]) {
    const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.exactlyOneCorrectOption, false);
    assert.deepEqual(audit.recomputed.correctOptionIds, expected);
  }
});

// Break: enumeration stops at 84 and hides 126 or treats an empty domain as unique.
test('expanded and empty candidate domains are diagnosed independently and never become fixed-profile acceptance', () => {
  for (const [maximum, candidates] of [[140, [84, 126]], [80, []]]) {
    const draft = clone(create()); draft.problem.candidateDomain.maximum = maximum; rehash(draft);
    const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true);
    assert.equal(audit.checks.candidateUniqueness, false); assert.deepEqual(audit.recomputed.candidateNumbers, candidates);
    assert.equal(audit.recomputed.number, null); assert.equal(audit.checks.authoredProfile, false);
    assert.equal(audit.counts.acceptedProductQuestions, 0);
  }
});

// Break: a duplicate, reversed, false or missing remaining pair is treated as a complete proof.
test('remaining pair set rejects omissions duplicates reversed orientation and incorrect products', () => {
  for (const mutate of [o => o.remainingPairs.pop(), o => o.remainingPairs.push([7, 12]),
    o => { o.remainingPairs[0] = [84, 1]; }, o => { o.remainingPairs[2] = [4, 20]; },
    o => o.remainingPairs.push([3, 28])]) {
    const draft = clone(create()); mutate(draft.problem.options[1]); rehash(draft);
    const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.optionChecks[1].completeRemainingPairs, false);
    assert.deepEqual(audit.recomputed.allFactorPairs, pairs);
  }
});

// Break: rehashing an authored solution, teaching result or ambiguity example replaces proof.
test('solution and causal teaching claims are checked against independent reconstruction and transfer enumeration', () => {
  const draft = create();
  assert.equal(draft.explanation.goal.length > 0, true); assert.equal(draft.explanation.givenMeaning.length > 0, true);
  assert.equal(draft.explanation.because.length > 0, true); assert.equal(draft.explanation.answerMeaning.length > 0, true);
  assert.deepEqual(draft.explanation.steps.map(row => row.id), ['read-evidence', 'filter-candidates', 'complete-given-pairs', 'prove-completeness', 'check-option']);
  assert.deepEqual(draft.explanation.steps[1].result, [84]); assert.deepEqual(draft.explanation.steps[2].result, completed);
  assert.deepEqual(draft.explanation.steps[3].result, remaining);
  assert.deepEqual(draft.explanation.transfer.candidateNumbers, [84, 126]); assert.equal(draft.explanation.transfer.unique, false);
  assert.equal(draft.explanation.conditionalShortcut.notImplied.length > 0, true);
  for (const mutate of [d => { d.solution.number = 72; }, d => { d.solution.remainingPairs.pop(); },
    d => { d.explanation.steps[1].result = [84, 90]; }, d => { d.explanation.transfer.candidateNumbers = [84]; },
    d => { d.explanation.transfer.unique = true; }]) {
    const changed = clone(draft); mutate(changed); rehash(changed);
    const audit = verify(changed); assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true);
    assert.deepEqual(audit.recomputed.candidateNumbers, [84]);
  }
});

// Break: actual brief17 bindings are replaced by nearby family/outcome or serialized approval.
test('canonical planner binds brief17 actual proposed outcome and immutable source revisions', () => {
  const input = source(), plan = createGrade6ReferenceAuthoringPlan(input), draft = create(input);
  assert.equal(draft.sourceLineage.planContentSha256, plan.contentSha256);
  assert.equal(draft.sourceLineage.briefId, 'g6-reference-authoring-17');
  assert.equal(draft.sourceLineage.sourceOrdinal, 17); assert.equal(draft.sourceLineage.physicalPdfPage, 15);
  assert.equal(draft.sourceLineage.sourceId, 'meb-archive-grade6-math-fascicle-unit1-hatay');
  assert.equal(draft.sourceLineage.freshPdfByteChecks, 0);
  assert.deepEqual(draft.scope.proposedOutcomeCodes, ['MAT.6.1.1']);
  assert.deepEqual(draft.purpose.microAimIds, ['G6Q17-M1', 'G6Q17-M2']);
  assert.equal(draft.purpose.sourceBriefTaskKind, 'reconstruct_and_prove_factor_list_completeness');
  const corrupted = source();
  const sourceItem = corrupted.formObservations.observations[0].items.find(row => row.ordinal === 17);
  assert.ok(sourceItem, 'canonical brief17 source observation exists before tampering');
  sourceItem.microPurposes[0].meaning = 'Caller alternative';
  assert.throws(() => create(corrupted), /grade6_authoring_/u); assert.equal(verify(draft, corrupted).valid, false);
  assert.throws(() => create(plan), /grade6_authoring_/u); assert.equal(verify(draft, plan).valid, false);
});

// Break: varied source scope invents separate authored stock or authorizes mismatched lineage.
test('narrow and broad canonical source snapshots retain one authored semantic task but cannot exchange lineage', () => {
  const wide = source(), narrow = source();
  narrow.sourceScopeInput.archives = [{ sources: wide.sourceScopeInput.archives.flatMap(row => row.sources)
    .filter(row => ['tymm-current-ortaokul-matematik', 'meb-archive-grade6-math-fascicle-unit1-hatay'].includes(row.id)) }];
  const a = create(wide), b = create(narrow);
  assert.notEqual(a.sourceLineage.planContentSha256, b.sourceLineage.planContentSha256);
  assert.equal(a.authoredTaskSha256, b.authoredTaskSha256); assert.deepEqual(a.problem, b.problem);
  assert.equal(verify(a, narrow).valid, false); assert.equal(verify(b, narrow).valid, true);
});

// Break: local math labels resolve pedagogy, calibration or production gates.
test('a valid fixed draft remains editor-only uncalibrated and unpublished with zero paid activity', () => {
  const draft = create(), audit = verify(draft);
  for (const value of [draft, audit]) {
    assert.equal(value.humanApproval, null); assert.equal(value.publicationReady, false);
    assert.equal(value.learnerReady, false); assert.equal(value.productionReady, false);
    assert.equal(value.serializedHashIsAuthority, false);
    assert.equal(Object.values(value.gates).every(g => g === 'pending'), true);
    assert.equal(value.counts.acceptedProductQuestions, 0); assert.equal(value.counts.publishedQuestions, 0);
  }
  assert.equal(draft.scope.activeAcademicYear, null); assert.equal(draft.scope.programVersion, null);
  assert.equal(draft.scope.officialOutcomeCode, null); assert.equal(draft.scope.activeProgramAccepted, false);
  assert.equal(draft.purpose.learnerEvidenceCollected, false); assert.equal(draft.purpose.fullBriefEvidenceFulfilled, false);
  assert.equal(draft.difficulty.basis, 'author_estimate_not_empirical'); assert.equal(draft.difficulty.calibration, null);
  assert.equal(draft.representation.rendered, false); assert.equal(draft.representation.sourceTopologyCopied, false);
  assert.equal(draft.originality.sourceBodiesOptionsNumericVectorsMediaCopied, false);
  assert.equal(draft.originality.archiveSimilarityPassed, false);
  assert.deepEqual(draft.activity, { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 });
});

// Break: nonfinite, fractional, negative or large domains run an unbounded generator.
test('bounded profile rejects invalid domain cardinality partial-row shapes and option sizes before solving', () => {
  for (const mutate of [d => { d.problem.candidateDomain.minimum = 0; }, d => { d.problem.candidateDomain.maximum = 1e9; },
    d => { d.problem.candidateDomain.maximum = 60.5; }, d => { d.problem.candidateDomain.minimum = 96; },
    d => { d.problem.candidateDomain.inclusive = false; }, d => { d.problem.partialPairs[0].right = 28; },
    d => { d.problem.partialPairs[0].left = null; }, d => { d.problem.partialPairs[1] = null; },
    d => { d.problem.options[0] = null; }, d => { d.problem.options[1].remainingPairs = [null]; },
    d => { d.problem.options.push(clone(d.problem.options[0])); }]) {
    const draft = clone(create()); mutate(draft); rehash(draft);
    assert.doesNotThrow(() => verify(draft));
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.recomputed, null);
  }
  assert.throws(() => api.createGrade6InverseFactorDraft(source(), { number: 126 }), /invalid_inverse_factor_authoring_arguments/u);
  assert.equal(api.verifyGrade6InverseFactorDraft(create(), source(), { approve: true }).valid, false);
});

// Break: hostile DTOs execute accessors/proxy hooks or gain authority through rehash.
test('hostile snapshots never execute hooks and rehashed source scope or approval tampering fails closed', () => {
  let hooks = 0; const accessor = {}; Object.defineProperty(accessor, 'problem', { enumerable: true, get() { hooks++; return {}; } });
  const proxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke(); const cycle = {}; cycle.x = cycle;
  const sparse = clone(create()); sparse.problem.options = new Array(4);
  const huge = clone(create()); huge.prompt = 'x'.repeat(65537);
  const symbol = clone(create()); symbol[Symbol('approved')] = true;
  for (const value of [accessor, proxy, revoked.proxy, cycle, sparse, huge, symbol, () => { hooks++; }]) {
    const audit = verify(value); assert.equal(audit.valid, false); assert.equal(audit.recomputed, null);
    assert.equal(audit.publicationReady, false);
  }
  const sourceAccessor = source(); Object.defineProperty(sourceAccessor, 'formObservations', { enumerable: true, get() { hooks++; return forms; } });
  assert.throws(() => create(sourceAccessor), /grade6_authoring_/u); assert.equal(verify(create(), sourceAccessor).valid, false);
  assert.equal(hooks, 0);
  for (const mutate of [d => { d.sourceLineage.sourceSha256 = 'f'.repeat(64); }, d => { d.scope.gradeCandidate = 8; },
    d => { d.scope.proposedOutcomeCodes.push('MAT.6.1.3'); }, d => { d.gates.answer = 'approved'; },
    d => { d.humanApproval = { approved: true }; d.learnerReady = true; }]) {
    const draft = clone(create()); mutate(draft); rehash(draft);
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true);
    assert.equal(audit.humanApproval, null); assert.equal(audit.productionReady, false);
  }
});

// Break: a malformed nested teaching container crashes outside the closed diagnostic.
test('null solution and malformed explanation containers return diagnostics rather than native exceptions', () => {
  for (const mutate of [d => { d.solution = null; }, d => { d.answerKey = null; }, d => { d.explanation = null; },
    d => { d.explanation.steps = {}; }, d => { d.explanation.steps = [null]; }, d => { d.explanation.transfer = null; }]) {
    const draft = clone(create()); mutate(draft); rehash(draft);
    assert.doesNotThrow(() => verify(draft)); assert.equal(verify(draft).valid, false);
  }
});

// Break: mutation of frozen arrays or stale content hash silently rewrites authoring evidence.
test('immutable output uses canonical hashes while caller edits remain observable', () => {
  const draft = create(), audit = verify(draft);
  assert.equal(draft.contentSha256, hash('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))));
  assert.equal(Object.isFrozen(draft.solution.allFactorPairs[0]), true); assert.equal(Object.isFrozen(audit.recomputed.positiveDivisors), true);
  assert.throws(() => { draft.problem.options[1].number = 72; }, TypeError);
  const changed = clone(draft); changed.answerKey.optionId = 'option-a'; assert.equal(verify(changed).checks.contentIntegrity, false);
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  assert.deepEqual(verify(reverse(draft)), audit);
  assert.equal(Buffer.byteLength(JSON.stringify(draft)) < 65536, true);
});
