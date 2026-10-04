import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6ReferenceAuthoringPlan } from '../packages/content-factory/grade6_reference_authoring_plan.mjs';

const api = await import('../packages/content-factory/grade6_prime_provenance_draft.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement] = await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement'].map(load));
const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-prime-provenance.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
function source() { return { formObservations: clone(forms), semanticMatrix: clone(matrix), sourceScopeInput: {
  archives: [clone(main), clone(supplement)], selection: { sources: [], inventory: [] },
  downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: clone(forms) } }; }
function create(value = source()) {
  assert.equal(typeof api.createGrade6PrimeProvenanceDraft, 'function', 'prime provenance authoring is missing');
  return api.createGrade6PrimeProvenanceDraft(value);
}
function verify(draft, value = source()) {
  assert.equal(typeof api.verifyGrade6PrimeProvenanceDraft, 'function', 'independent prime provenance verifier is missing');
  return api.verifyGrade6PrimeProvenanceDraft(draft, value);
}
function rehash(value) { value.contentSha256 = hash('draft', Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256'))); return value; }
const rows = [
  { sourceRowId: 'row-a', sourceNumber: 54, distinctPrimeFactors: [2, 3], selectionRule: 'largest', selectedPrime: 3 },
  { sourceRowId: 'row-b', sourceNumber: 35, distinctPrimeFactors: [5, 7], selectionRule: 'smallest', selectedPrime: 5 },
  { sourceRowId: 'row-c', sourceNumber: 28, distinctPrimeFactors: [2, 7], selectionRule: 'largest', selectedPrime: 7 },
  { sourceRowId: 'row-d', sourceNumber: 75, distinctPrimeFactors: [3, 5], selectionRule: 'smallest', selectedPrime: 3 },
  { sourceRowId: 'row-e', sourceNumber: 121, distinctPrimeFactors: [11], selectionRule: 'largest', selectedPrime: 11 },
];
const ordered = [
  { sourceRowId: 'row-a', sourceNumber: 54, selectedPrime: 3 },
  { sourceRowId: 'row-d', sourceNumber: 75, selectedPrime: 3 },
  { sourceRowId: 'row-b', sourceNumber: 35, selectedPrime: 5 },
  { sourceRowId: 'row-c', sourceNumber: 28, selectedPrime: 7 },
  { sourceRowId: 'row-e', sourceNumber: 121, selectedPrime: 11 },
];

// Break: a row, option, call or numeric variant is counted as additional stock.
test('five source rows and four options remain one original editor item and one distinct semantic family', () => {
  const input = source(), before = JSON.stringify(input), draft = create(input);
  assert.equal(JSON.stringify(input), before); assert.deepEqual(create(), draft);
  assert.equal(draft.id, 'grade6-prime-provenance-ledger-v1');
  assert.equal(draft.problem.family, 'prime_extrema_source_preserving_order');
  assert.equal(draft.problem.rows.length, 5); assert.equal(draft.problem.options.length, 4);
  assert.equal(draft.problem.rows.some(row => row.number === 36), false);
  assert.deepEqual(draft.counts, { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(draft.repeatedCallsCreateDistinctStock, false); assert.equal(draft.artifactAudience, 'editor_only');
});

// Break: repeated prime powers, all divisors or a supplied key substitutes for exact prime selection.
test('an independent finite oracle recomputes all prime subsets extrema and the unique answer', () => {
  const draft = create(), audit = verify(draft);
  assert.equal(audit.valid, true); assert.equal(audit.localMathChecks, 'passed');
  assert.deepEqual(audit.recomputed, { rowSelections: rows, orderedSelections: ordered, correctOptionIds: ['ledger-b'] });
  assert.deepEqual(draft.solution.rowSelections, rows); assert.deepEqual(draft.solution.orderedSelections, ordered);
  assert.deepEqual(draft.answerKey, { optionId: 'ledger-b' });
  assert.equal(audit.checks.rowSelections, true); assert.equal(audit.checks.orderedWithTies, true);
  assert.equal(audit.checks.exactlyOneCorrectOption, true);
});

// Break: sorting collapses equal values, switches their source or uses the wrong per-row rule.
test('wrong extrema dropped ties and unstable tied provenance fail distinct option checks', () => {
  const audit = verify(create());
  assert.deepEqual(audit.optionChecks, [
    { id: 'ledger-a', exactSelection: false, provenance: true, cardinality: true, orderedWithTies: false, valid: false },
    { id: 'ledger-b', exactSelection: true, provenance: true, cardinality: true, orderedWithTies: true, valid: true },
    { id: 'ledger-c', exactSelection: true, provenance: true, cardinality: false, orderedWithTies: false, valid: false },
    { id: 'ledger-d', exactSelection: true, provenance: true, cardinality: true, orderedWithTies: false, valid: false },
  ]);
  assert.deepEqual(create().problem.ordering, { direction: 'ascending', ties: 'retain_all_in_source_row_order' });
});

// Break: a rehashed wrong key promotes a diagnostic or drives the oracle.
test('a rehashed wrong option key fails while retaining an independently recomputed correct option', () => {
  for (const optionId of ['ledger-a', 'ledger-c', 'ledger-d', 'unknown']) {
    const draft = clone(create()); draft.answerKey.optionId = optionId; rehash(draft);
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.checks.answerKey, false);
    assert.equal(audit.checks.contentIntegrity, true); assert.deepEqual(audit.recomputed.correctOptionIds, ['ledger-b']);
  }
});

// Break: merely recognizing the author's key ignores ambiguity or missing valid options.
test('duplicate correct options and a removed correct option are rejected after rehashing', () => {
  const duplicate = clone(create()); duplicate.problem.options[0].entries = clone(ordered); rehash(duplicate);
  const missing = clone(create()); missing.problem.options[1].entries[0].selectedPrime = 2; rehash(missing);
  for (const [draft, want] of [[duplicate, ['ledger-a', 'ledger-b']], [missing, []]]) {
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.checks.exactlyOneCorrectOption, false);
    assert.deepEqual(audit.recomputed.correctOptionIds, want);
  }
});

// Break: correct values without original rows pass as source-aware ordering.
test('wrong source numbers unknown row identities repeated rows and tied row swaps fail diagnostics', () => {
  const changes = [entries => { entries[0].sourceNumber = 75; }, entries => { entries[0].sourceRowId = 'row-z'; },
    entries => { entries[1] = clone(entries[0]); }, entries => { [entries[0], entries[1]] = [entries[1], entries[0]]; }];
  for (const change of changes) {
    const draft = clone(create()); change(draft.problem.options[1].entries); rehash(draft);
    const audit = verify(draft); assert.equal(audit.valid, false); assert.equal(audit.optionChecks[1].valid, false);
    assert.deepEqual(audit.recomputed.orderedSelections, ordered);
  }
});

// Break: author row calculations and intermediate explanation numbers are accepted after a fresh hash.
test('rehashed wrong prime subsets extrema order and explanation results fail independent checks', () => {
  const changes = [d => { d.solution.rowSelections[0].distinctPrimeFactors = [1, 2, 3]; },
    d => { d.solution.rowSelections[1].selectedPrime = 7; }, d => { d.solution.orderedSelections.pop(); },
    d => { d.explanation.steps[0].result[4].distinctPrimeFactors = [11, 11]; },
    d => { d.explanation.steps[2].result[0].sourceNumber = 75; }];
  for (const change of changes) {
    const draft = clone(create()); change(draft); rehash(draft); const audit = verify(draft);
    assert.equal(audit.valid, false); assert.equal(audit.checks.contentIntegrity, true);
    assert.equal(audit.checks.authoredProfile, false); assert.deepEqual(audit.recomputed.rowSelections, rows);
  }
});

// Break: source metadata, candidate outcomes or micro aims are replaced with caller authority.
test('canonical brief18 lineage preserves actual outcome and micro aims with unresolved program scope', () => {
  const input = source(), brief = createGrade6ReferenceAuthoringPlan(input).briefs.find(row => row.briefId === 'g6-reference-authoring-18');
  const draft = create(input);
  assert.equal(draft.sourceLineage.briefId, brief.briefId); assert.equal(draft.sourceLineage.sourceOrdinal, 18);
  assert.equal(draft.sourceLineage.sourceId, 'meb-archive-grade6-math-fascicle-unit1-hatay');
  assert.equal(draft.sourceLineage.sourceSha256, 'f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e');
  assert.deepEqual(draft.scope.proposedOutcomeCodes, ['MAT.6.1.3']);
  assert.deepEqual(draft.purpose.microAimIds, ['G6Q18-M1', 'G6Q18-M2', 'G6Q18-M3']);
  assert.equal(draft.scope.gradeCandidate, 6); assert.equal(draft.scope.activeAcademicYear, null);
  assert.equal(draft.scope.programVersion, null); assert.equal(draft.scope.officialOutcomeCode, null);
  assert.equal(draft.scope.activeProgramAccepted, false); assert.equal(draft.scope.fullOutcomeCoverage, false);
  for (const change of [d => { d.sourceLineage.sourceSha256 = 'a'.repeat(64); }, d => { d.scope.gradeCandidate = 7; },
    d => { d.scope.programVersion = 'approved'; }, d => { d.purpose.microAimIds[0] = 'official-mastery'; }]) {
    const edited = clone(draft); change(edited); rehash(edited); assert.equal(verify(edited).valid, false);
  }
  const fakeSource = source(); fakeSource.formObservations.observations[0].items[5].ordinal = 999;
  assert.throws(() => create(fakeSource), /grade6_authoring_/u); assert.equal(verify(draft, fakeSource).valid, false);
});

// Break: raw arithmetic lacks why the selection happens before ordering and why ties survive.
test('given goal reason meaning and a conditional shortcut retain the interpretation before arithmetic', () => {
  const draft = create();
  for (const name of ['goal', 'givenMeaning', 'route', 'because']) assert.equal(draft.explanation[name].length > 20, true);
  assert.deepEqual(draft.explanation.steps.map(step => step.id), ['find-prime-subsets', 'select-by-row-rule', 'order-with-source', 'verify-all-rows']);
  assert.deepEqual(draft.explanation.steps[0].result, rows.map(({ sourceRowId, sourceNumber, distinctPrimeFactors }) => ({ sourceRowId, sourceNumber, distinctPrimeFactors })));
  assert.deepEqual(draft.explanation.steps[1].result, rows.map(({ sourceRowId, sourceNumber, selectedPrime }) => ({ sourceRowId, sourceNumber, selectedPrime })));
  assert.deepEqual(draft.explanation.steps[2].result, ordered); assert.equal(draft.explanation.steps[3].result, 5);
  for (const step of draft.explanation.steps) { assert.equal(step.why.length > 20, true); assert.equal(step.meaning.length > 10, true); }
  for (const key of ['worksWhen', 'why', 'check', 'notImplied']) assert.equal(draft.explanation.conditionalShortcut[key].length > 20, true);
  assert.deepEqual(draft.explanation.transfer, { number: 1, distinctPrimeFactors: [], selectable: false,
    meaning: '1 sayısının asal çarpanı yoktur; en küçük veya en büyük asal çarpan diye bir değer uydurmayız.' });
  assert.match(draft.title, /^\p{Lu}/u); assert.match(draft.prompt, /^\p{Lu}/u);
});

// Break: a local exact-math pass or authored difficulty becomes learner/expert approval.
test('difficulty is an uncalibrated author estimate and all delivery gates remain pending', () => {
  const draft = create(), audit = verify(draft);
  assert.deepEqual(draft.difficulty, { level: 'hard', basis: 'author_estimate_not_empirical', calibrated: false, calibration: null, targetDistribution: null });
  for (const value of [draft, audit]) {
    assert.equal(value.publicationReady, false); assert.equal(value.learnerReady, false); assert.equal(value.productionReady, false);
    assert.equal(value.humanApproval, null); assert.equal(value.serializedHashIsAuthority, false);
    assert.equal(Object.values(value.gates).every(state => state === 'pending'), true);
    assert.equal(value.counts.acceptedProductQuestions, 0); assert.equal(value.counts.publishedQuestions, 0);
  }
  assert.equal(draft.purpose.fullBriefEvidenceFulfilled, false); assert.equal(draft.purpose.learnerEvidenceCollected, false);
  assert.equal(draft.governance.owner, 'pending'); assert.equal(draft.governance.realLearnerDataPresent, false);
  assert.equal(draft.representation.rendered, false); assert.equal(draft.representation.sourceTopologyCopied, false);
  assert.equal(draft.originality.sourceBodiesOptionsNumericVectorsMediaCopied, false);
  assert.equal(draft.originality.archiveSimilarityPassed, false); assert.equal(draft.originality.originalityVerified, false);
  assert.deepEqual(draft.activity, { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 });
  const promoted = clone(draft); promoted.humanApproval = { accepted: true }; promoted.learnerReady = true; rehash(promoted);
  assert.equal(verify(promoted).valid, false);
});

// Break: arbitrary row inputs, one, huge domains or additional options become an unbounded generator.
test('bounded fixed rows reject missing prime factors nonintegers huge numbers and caller overrides', () => {
  for (const number of [0, 1, -1, 1.5, 145, Number.MAX_SAFE_INTEGER]) {
    const draft = clone(create()); draft.problem.rows[0].number = number; rehash(draft);
    assert.equal(verify(draft).valid, false); assert.equal(verify(draft).recomputed, null);
  }
  for (const change of [d => { d.problem.rows.push(clone(d.problem.rows[0])); }, d => { d.problem.rows[0].selectionRule = 'sum'; },
    d => { d.problem.options.push(clone(d.problem.options[0])); }, d => { d.problem.options[0].entries.push(clone(d.problem.options[0].entries[0])); }]) {
    const draft = clone(create()); change(draft); rehash(draft); assert.equal(verify(draft).valid, false);
  }
  assert.throws(() => api.createGrade6PrimeProvenanceDraft(source(), { count: 100 }), /invalid_prime_provenance_authoring_arguments/u);
  assert.equal(api.verifyGrade6PrimeProvenanceDraft(create(), source(), { approve: true }).valid, false);
  const extra = source(); extra.rows = [2, 3]; assert.throws(() => create(extra), /grade6_authoring_/u);
});

// Break: DTO or source inspection executes accessors, proxies, toJSON or custom objects.
test('hostile candidate and source hooks remain inert and return sanitized closed diagnostics', () => {
  let hooks = 0; const getter = {}; Object.defineProperty(getter, 'problem', { get() { hooks++; return {}; }, enumerable: true });
  const proxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke(); const cycle = {}; cycle.x = cycle;
  const sparse = clone(create()); sparse.problem.rows = new Array(5);
  const huge = clone(create()); huge.prompt = 'x'.repeat(65537);
  const unknown = clone(create()); unknown.approve = true;
  const nestedGetter = clone(create()); Object.defineProperty(nestedGetter.problem.rows[0], 'number', { get() { hooks++; return 54; }, enumerable: true });
  const custom = Object.assign(Object.create({ inherited: true }), clone(create()));
  const hidden = clone(create()); Object.defineProperty(hidden, 'hidden', { value: true });
  for (const candidate of [getter, proxy, revoked.proxy, cycle, sparse, huge, unknown, nestedGetter, custom, hidden, () => { hooks++; }]) {
    const audit = verify(candidate); assert.equal(audit.valid, false); assert.equal(audit.recomputed, null);
    assert.equal(audit.publicationReady, false); assert.equal(audit.humanApproval, null);
  }
  const sourceGetter = source(); Object.defineProperty(sourceGetter, 'formObservations', { get() { hooks++; return forms; }, enumerable: true });
  const sourceProxy = new Proxy(source(), { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  for (const value of [sourceGetter, sourceProxy]) { assert.throws(() => create(value), /grade6_authoring_/u); assert.equal(verify(create(), value).valid, false); }
  assert.equal(hooks, 0);
});

// Break: malformed plain containers crash after safely copying an otherwise valid candidate.
test('null malformed solutions answer keys explanations and option entries never crash the verifier', () => {
  for (const change of [d => { d.solution = null; }, d => { d.solution.rowSelections = {}; }, d => { d.answerKey = null; },
    d => { d.explanation.steps = [null]; }, d => { d.explanation = null; }, d => { d.problem.options[0].entries = [null]; }]) {
    const draft = clone(create()); change(draft); rehash(draft);
    assert.doesNotThrow(() => verify(draft)); assert.equal(verify(draft).valid, false);
  }
});

// Break: caller mutation, fresh hashes or object-key order supply semantic authority.
test('frozen canonical hashes detect content changes and stay deterministic under harmless key ordering', () => {
  const draft = create(), audit = verify(draft);
  assert.equal(draft.contentSha256, hash('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))));
  assert.equal(Object.isFrozen(draft.solution.rowSelections[0].distinctPrimeFactors), true);
  assert.equal(Object.isFrozen(audit.recomputed.orderedSelections[0]), true);
  assert.throws(() => { draft.answerKey.optionId = 'ledger-a'; }, TypeError);
  const edit = clone(draft); edit.answerKey.optionId = 'ledger-a'; assert.equal(verify(edit).checks.contentIntegrity, false);
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  assert.deepEqual(verify(reverse(draft)), audit); assert.equal(Buffer.byteLength(JSON.stringify(draft)) <= 65536, true);
});
