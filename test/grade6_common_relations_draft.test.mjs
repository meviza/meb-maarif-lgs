import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const api = await import('../packages/content-factory/grade6_common_relations_draft.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [matrix, registry] = await Promise.all(['grade6-source-semantic-candidate-matrix', 'meb-reference-registry'].map(load));
const observations = await load('grade6-common-relations-application-observations').catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
const clone = value => structuredClone(value);
function source() {
  return { applicationObservations: clone(observations), semanticMatrix: clone(matrix),
    sourceRecord: clone(registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik')) };
}
function create(input = source()) {
  assert.equal(typeof api.createGrade6CommonRelationsDraft, 'function', 'common-relations authoring is missing');
  assert.ok(observations, 'real common-relations source observation is not prepared');
  return api.createGrade6CommonRelationsDraft(input);
}
function verify(candidate, input = source()) {
  assert.equal(typeof api.verifyGrade6CommonRelationsDraft, 'function', 'independent common-relations verifier is missing');
  return api.verifyGrade6CommonRelationsDraft(candidate, input);
}
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-common-relations.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
function rehash(value) { value.contentSha256 = hash('draft', Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256'))); return value; }
const commonTimes = [24, 48], commonSizes = [1, 2, 3, 4, 6, 12];

// Break: two contexts or repeated calls are counted as two approved stock questions.
test('one fixed two-context matching draft has one semantic family and zero accepted or published stock', () => {
  const input = source(), before = JSON.stringify(input), draft = create(input);
  assert.equal(JSON.stringify(input), before); assert.equal(draft.schemaVersion, 'grade6-common-relations-draft/v1');
  assert.equal(draft.state, 'draft'); assert.equal(draft.artifactAudience, 'editor_only');
  assert.deepEqual(draft.counts, { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(draft.problem.contexts.length, 2); assert.equal(draft.problem.evidenceCards.length, 4);
  assert.equal(draft.repeatedCallsCreateDistinctStock, false); assert.deepEqual(create(), draft);
});

// Break: the author key or supplied evidence, rather than modulo relationships, supplies the oracle's result.
test('independent modulo oracle recomputes all bounded positive common times and common group sizes', () => {
  const audit = verify(create()); assert.equal(audit.valid, true); assert.equal(audit.localMathChecks, 'passed');
  assert.deepEqual(audit.recomputed.commonPositiveTimes, commonTimes);
  assert.deepEqual(audit.recomputed.commonPositiveGroupSizes, commonSizes);
  assert.equal(audit.recomputed.intervalSum, 14); assert.deepEqual(audit.recomputed.packageCountsAtExampleSize, [4, 6]);
  assert.deepEqual(audit.recomputed.matchingCardIds, { repeat: ['evidence-repeat'], grouping: ['evidence-group-size'] });
  assert.equal(audit.checks.uniqueMatching, true); assert.equal(audit.checks.answerKey, true);
  assert.deepEqual(create().answerKey, { repeat: 'evidence-repeat', grouping: 'evidence-group-size' });
});

// Break: zero is included, the horizon endpoint is omitted, or a shared mark outside the stated time is accepted.
test('repeat context declares a simultaneous start then excludes zero and includes exactly the forty-eight minute horizon', () => {
  const draft = create(), context = draft.problem.contexts[0];
  assert.deepEqual(context.intervals, [6, 8]); assert.equal(context.startMinute, 0);
  assert.deepEqual(context.window, { from: 0, fromInclusive: false, to: 48, toInclusive: true });
  assert.equal(context.requestedUnit, 'minute'); assert.equal(context.target, 'all_positive_common_marks_in_window');
  assert.deepEqual(draft.representation.repeatSequences, [[6, 12, 18, 24, 30, 36, 42, 48], [8, 16, 24, 32, 40, 48]]);
  for (const values of [[0, 24, 48], [24], [24, 48, 72], [24, 48, 48]]) {
    const changed = clone(draft); changed.problem.evidenceCards[0].values = values; rehash(changed);
    const audit = verify(changed); assert.equal(audit.valid, false); assert.equal(audit.cardChecks[0].matchesRepeat, false);
    assert.deepEqual(audit.recomputed.commonPositiveTimes, commonTimes);
  }
});

// Break: material types may be mixed or package count is confused with the common item count per package.
test('grouping keeps material types separate and asks all common positive items-per-package sizes not package counts', () => {
  const draft = create(), context = draft.problem.contexts[1];
  assert.deepEqual(context.itemCounts, [24, 36]); assert.equal(context.materialTypesMixed, false);
  assert.equal(context.leftoversAllowed, false); assert.equal(context.requestedUnit, 'card_per_package');
  assert.equal(context.target, 'all_positive_common_exact_group_sizes'); assert.equal(context.examplePackageSize, 6);
  assert.deepEqual(draft.representation.groupRows, [
    { size: 1, packageCounts: [24, 36] }, { size: 2, packageCounts: [12, 18] },
    { size: 3, packageCounts: [8, 12] }, { size: 4, packageCounts: [6, 9] },
    { size: 6, packageCounts: [4, 6] }, { size: 12, packageCounts: [2, 3] }
  ]);
  assert.equal(draft.problem.evidenceCards[3].unit, 'package'); assert.deepEqual(draft.problem.evidenceCards[3].values, [4, 6]);
  assert.equal(verify(draft).cardChecks[3].matchesGrouping, false);
});

// Break: interval addition or an incomplete common-divisor list is considered a valid strategy.
test('addition wrong unit nondivisor and missing common candidates fail independently even after rehash', () => {
  const draft = create();
  assert.deepEqual(draft.problem.evidenceCards[2].values, [14]); assert.equal(verify(draft).cardChecks[2].matchesRepeat, false);
  for (const mutate of [d => { d.problem.evidenceCards[0].values = [14]; }, d => { d.problem.evidenceCards[1].values = [2, 3, 4, 6, 12]; },
    d => { d.problem.evidenceCards[1].values.push(8); }, d => { d.problem.evidenceCards[1].unit = 'package'; }]) {
    const changed = clone(draft); mutate(changed); rehash(changed); const audit = verify(changed);
    assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true);
    assert.deepEqual(audit.recomputed.commonPositiveGroupSizes, commonSizes);
  }
});

// Break: duplicate valid cards or a changed supplied mapping is ignored by the independent verifier.
test('matching keys and exactly one correct evidence card per context are checked separately', () => {
  const draft = create(), wrong = clone(draft); wrong.answerKey.repeat = 'evidence-sum'; rehash(wrong);
  const audit = verify(wrong); assert.equal(audit.valid, false); assert.equal(audit.checks.answerKey, false);
  assert.deepEqual(audit.recomputed.matchingCardIds.repeat, ['evidence-repeat']);
  const duplicate = clone(draft); duplicate.problem.evidenceCards[2] = { ...clone(draft.problem.evidenceCards[0]), id: 'evidence-sum' }; rehash(duplicate);
  const multiple = verify(duplicate); assert.equal(multiple.valid, false); assert.equal(multiple.checks.uniqueMatching, false);
  assert.deepEqual(multiple.recomputed.matchingCardIds.repeat, ['evidence-repeat', 'evidence-sum']);
  const none = clone(draft); none.problem.evidenceCards[0].values = [14]; rehash(none);
  assert.deepEqual(verify(none).recomputed.matchingCardIds.repeat, []);
});

// Break: all GCD/LCM extrema algorithms or pupil construction/ability are claimed by a matching exercise.
test('provided matching evidence leaves construction formal extrema teaching and mastery unmeasured', () => {
  const draft = create(); assert.equal(draft.purpose.evidenceKind, 'matching_of_given_evidence');
  assert.equal(draft.purpose.learnerEvidenceCollected, false); assert.equal(draft.purpose.fullOutcomeEvidenceFulfilled, false);
  assert.deepEqual(draft.scope.proposedOutcomeCodes, ['MAT.6.1.4']); assert.equal(draft.scope.officialOutcomeCode, null);
  assert.equal(draft.scope.activeAcademicYear, null); assert.equal(draft.scope.programVersion, null);
  assert.equal(draft.scope.activeProgramAccepted, false); assert.equal(draft.scope.fullOutcomeCoverage, false);
  assert.equal(draft.scope.formalGcdLcmTeachingAllowed, false); assert.equal(draft.scope.extremalCommonRelationTasksAccepted, false);
  for (const id of ['learner_constructed_lists', 'learner_explanation_quality', 'mastery', 'ability', 'speed', 'whole_outcome_coverage']) assert.ok(draft.purpose.notMeasured.includes(id));
});

// Break: bare arithmetic replaces goal, meaning, strategy, unit, applicability or a counterexample.
test('two rationale paths retain why given meaning result unit conditional checks and counterexample transfer', () => {
  const explanation = create().explanation;
  assert.deepEqual(explanation.paths.map(path => path.contextId), ['repeat', 'grouping']);
  assert.deepEqual(explanation.paths.map(path => path.result), [commonTimes, commonSizes]);
  assert.deepEqual(explanation.paths.map(path => path.unit), ['minute', 'card_per_package']);
  for (const path of explanation.paths) for (const key of ['goal', 'givenMeaning', 'why', 'operationMeaning', 'resultMeaning']) assert.equal(path[key].length > 0, true);
  for (const path of explanation.paths) {
    assert.equal(path.conditionalNote.when.length > 0, true); assert.equal(path.conditionalNote.why.length > 0, true);
    assert.equal(path.conditionalNote.check.length > 0, true); assert.equal(path.conditionalNote.notImplied.length > 0, true);
  }
  assert.deepEqual(explanation.transfers.map(row => row.id), ['sum-not-common-time', 'window-boundary', 'group-size-not-count']);
  assert.deepEqual(explanation.transfers[0].remainders, [2, 6]); assert.equal(explanation.transfers[0].candidateMinute, 14);
  assert.deepEqual(explanation.transfers[1].cases, [{ minute: 0, inWindow: false, common: true }, { minute: 48, inWindow: true, common: true }, { minute: 72, inWindow: false, common: true }]);
  assert.equal(explanation.transfers[2].groupSize, 6); assert.deepEqual(explanation.transfers[2].packageCounts, [4, 6]);
});

// Break: caller source SHA/content hashes substitute for actual registry/prior-matrix/new observation pins.
test('real source row and immutable observation and matrix revisions are all required for the proposed binding', () => {
  const input = source(), draft = create(input);
  assert.equal(draft.sourceLineage.sourceSha256, '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734');
  assert.equal(draft.sourceLineage.sourceId, 'tymm-current-ortaokul-matematik');
  assert.equal(draft.sourceLineage.applicationPage, 71); assert.equal(draft.sourceLineage.freshPdfByteChecks, 0);
  for (const mutate of [s => { s.sourceRecord.download.sha256 = 'f'.repeat(64); }, s => { s.sourceRecord.reuseRights = 'approved'; },
    s => { s.semanticMatrix.outcomes[3].processComponents[0].printedLabel = 'caller'; },
    s => { s.applicationObservations.boundaries.formalGcdLcmTeachingAllowed = true; },
    s => { s.applicationObservations.scope.productQuestionsContributed = 36; }]) {
    const changed = source(); mutate(changed);
    assert.throws(() => create(changed), /invalid_common_relations_source/u); assert.equal(verify(draft, changed).valid, false);
  }
  for (const invalid of [{ approved: true, contentSha256: draft.sourceLineage.applicationMetadataSha256 }, {}, null]) {
    assert.throws(() => create(invalid), /invalid_common_relations_source/u); assert.equal(verify(draft, invalid).valid, false);
  }
});

// Break: valid candidate rehash changes purpose source units grade or approval independently of source decisions.
test('candidate rehash cannot promote different source purpose units scope or human gates', () => {
  for (const mutate of [d => { d.sourceLineage.sourceSha256 = 'f'.repeat(64); }, d => { d.scope.gradeCandidate = 8; },
    d => { d.scope.formalGcdLcmTeachingAllowed = true; }, d => { d.purpose.evidenceKind = 'learner_constructed_proof'; },
    d => { d.governance.purpose = 'learning_analytics'; }, d => { d.explanation.paths[0].result = [14]; },
    d => { d.problem.contexts[1].requestedUnit = 'package'; }, d => { d.gates.answer = 'approved'; d.humanApproval = true; }]) {
    const draft = clone(create()); mutate(draft); rehash(draft); const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true); assert.equal(audit.productionReady, false);
  }
});

// Break: invalid plain-data shapes produce a native exception or enter an unbounded oracle/template path.
test('malformed and over-budget candidate structures fail with a closed diagnostic', () => {
  for (const mutate of [d => { d.problem.contexts = null; }, d => { d.problem.evidenceCards = {}; },
    d => { d.explanation.paths = 'not-an-array'; }, d => { d.explanation.transfers = [null]; },
    d => { d.problem.contexts[0].intervals = [0, 8]; }, d => { d.problem.contexts[0].window.to = 1e9; },
    d => { d.problem.contexts[1].itemCounts = [24.5, 36]; }, d => { d.problem.evidenceCards.push(...Array(40).fill({})); },
    d => { d.prompt = 'x'.repeat(65537); }, d => { d.extraApproved = true; }]) {
    const draft = clone(create()); mutate(draft); rehash(draft);
    assert.doesNotThrow(() => verify(draft)); const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.localMathChecks, 'failed'); assert.equal(audit.publicationReady, false);
  }
});

// Break: descriptor hooks, proxy traps, hidden/cyclic/sparse data or coercion run during source/candidate validation.
test('hostile source and candidate objects execute zero hooks and return only safe rejection states', () => {
  let hooks = 0; const getter = {}; Object.defineProperty(getter, 'problem', { enumerable: true, get() { hooks++; return {}; } });
  const proxy = new Proxy({}, { ownKeys() { hooks++; return []; }, get() { hooks++; } }); const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cyclic = {}; cyclic.x = cyclic; const sparse = clone(create()); sparse.problem.evidenceCards = new Array(4);
  const nested = clone(create()); Object.defineProperty(nested.problem.contexts[0], 'intervals', { enumerable: true, get() { hooks++; return [6, 8]; } });
  const hidden = clone(create()); Object.defineProperty(hidden, 'hidden', { value: true });
  for (const candidate of [getter, proxy, revoked.proxy, cyclic, sparse, nested, hidden, () => { hooks++; }, null]) {
    const audit = verify(candidate); assert.equal(audit.valid, false); assert.equal(audit.recomputed, null); assert.equal(audit.humanApproval, null);
  }
  const sourceGetter = source(); Object.defineProperty(sourceGetter, 'sourceRecord', { enumerable: true, get() { hooks++; return {}; } });
  const sourceProxy = new Proxy(source(), { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  for (const input of [sourceGetter, sourceProxy, revoked.proxy]) assert.throws(() => create(input), /invalid_common_relations_source/u);
  assert.equal(hooks, 0);
});

// Break: options allow multiple drafts, caller numbers, provider or template authority.
test('exact authoring and verification arities never accept extra knobs or call their hooks', () => {
  assert.equal(typeof api.createGrade6CommonRelationsDraft, 'function'); assert.equal(typeof api.verifyGrade6CommonRelationsDraft, 'function');
  let hooks = 0; const extra = new Proxy({}, { get() { hooks++; } });
  assert.throws(() => api.createGrade6CommonRelationsDraft(source(), extra), /invalid_common_relations_arguments/u);
  assert.throws(() => api.createGrade6CommonRelationsDraft(), /invalid_common_relations_arguments/u);
  assert.equal(api.verifyGrade6CommonRelationsDraft(create(), source(), extra).valid, false);
  assert.equal(api.verifyGrade6CommonRelationsDraft(create()).valid, false); assert.equal(hooks, 0);
});

// Break: local math passes are reported as human acceptance, rendered media, learner data or production permission.
test('passing clone audit is immutable but leaves all six gates and media and learner delivery pending', () => {
  const draft = create(), audit = verify(clone(draft));
  for (const value of [draft, audit]) {
    assert.equal(Object.values(value.gates).every(state => state === 'pending'), true);
    assert.equal(value.humanApproval, null); assert.equal(value.publicationReady, false); assert.equal(value.learnerReady, false);
    assert.equal(value.productionReady, false); assert.equal(value.serializedHashIsAuthority, false);
    assert.equal(value.counts.acceptedProductQuestions, 0); assert.equal(value.counts.publishedQuestions, 0);
  }
  assert.equal(draft.representation.rendered, false); assert.equal(draft.representation.accessibilityPassed, false);
  assert.deepEqual(draft.activity, { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 });
  assert.equal(draft.originality.originalityVerified, false); assert.equal(draft.originality.sourceContextCopied, false);
  assert.equal(draft.governance.realLearnerDataPresent, false); assert.equal(Object.isFrozen(draft.problem.contexts[0].intervals), true);
  assert.equal(Object.isFrozen(audit.recomputed.commonPositiveTimes), true);
  assert.throws(() => { draft.gates.answer = 'approved'; }, TypeError); assert.equal(Buffer.byteLength(JSON.stringify(draft)) <= 65536, true);
  assert.equal(draft.contentSha256, hash('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))));
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  assert.deepEqual(verify(reverse(draft)), audit);
});
