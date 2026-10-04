import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateQuestionCoverageBlueprint } from '../packages/contracts/question_coverage_blueprint.mjs';

const api = await import('../packages/content-factory/grade6_reference_authoring_plan.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement] = await Promise.all([
  'grade6-question-form-observations', 'grade6-source-semantic-candidate-matrix',
  'meb-reference-registry', 'education-reference-supplement'
].map(load));
const clone = value => structuredClone(value);
const sourceId = 'meb-archive-grade6-math-fascicle-unit1-hatay';
const programId = 'tymm-current-ortaokul-matematik';
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
function input() {
  return { formObservations: clone(forms), semanticMatrix: clone(matrix),
    sourceScopeInput: { archives: [clone(main), clone(supplement)], selection: { sources: [], inventory: [] },
      downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: clone(forms) } };
}
function plan(value = input()) {
  assert.equal(typeof api.createGrade6ReferenceAuthoringPlan, 'function', 'grade6 reference authoring planner is missing');
  return api.createGrade6ReferenceAuthoringPlan(value);
}
const findSource = (value, id = sourceId) => value.sourceScopeInput.archives.flatMap(row => row.sources).find(row => row.id === id);

test('null download observation receives the controlled planner rejection, never a native property error', () => {
  const value = input(); value.sourceScopeInput.downloadObservations.sources = [null];
  assert.throws(() => plan(value), error => /^grade6_authoring_/u.test(error.message));
});

// Break caught: numeric variations or source examples become question stock.
test('the real source-scope consumer binds six briefs while product contribution remains zero', () => {
  const value = input(), before = JSON.stringify(value), result = plan(value);
  assert.equal(JSON.stringify(value), before);
  assert.equal(result.briefs.length, 6);
  assert.equal(result.counts.plannedBriefs, 6);
  assert.equal(result.counts.observedSourceItems, 6);
  assert.equal(result.counts.generatedQuestions, 0);
  assert.equal(result.counts.acceptedProductQuestions, 0);
  assert.equal(result.counts.briefsAreProductQuestionCount, false);
  assert.equal(result.lineage.sourceScope.observedItemCount, 6);
  assert.equal(result.lineage.sourceScope.boundObservationSourceCount, 1);
  assert.equal(result.lineage.sourceScope.sourceQuestionTotal, null);
  assert.equal(result.lineage.sourceScope.freshPdfByteChecks, 0);
  assert.equal(result.targetQuestionCount, null);
  assert.equal(result.publicationReady, false);
});

// Break caught: changing numbers is the only difference between nominally distinct plans.
test('six independent purposes lead to distinct evidence tasks and new representations', () => {
  const result = plan();
  assert.deepEqual(result.briefs.map(row => row.sourceReference.ordinal), [13, 14, 15, 16, 17, 18]);
  assert.deepEqual(result.briefs.map(row => row.evidence.taskKind), [
    'classify_and_justify_joint_rules', 'construct_and_check_equivalent_expression',
    'enumerate_and_explain_single_error_paths', 'list_factors_and_distinguish_prime_subset',
    'reconstruct_and_prove_factor_list_completeness', 'track_prime_selection_then_order'
  ]);
  assert.deepEqual(result.briefs.map(row => row.plannedRepresentation.id), [
    'criteria_sorting_cards', 'expression_token_workspace', 'error_budget_path_ledger',
    'factor_pairs_and_prime_badges', 'inverse_factor_pair_board', 'prime_selection_provenance_table'
  ]);
  for (const row of result.briefs) {
    const item = forms.observations[0].items.find(item => item.ordinal === row.sourceReference.ordinal);
    assert.equal(row.sourceReference.family, item.candidateFamily);
    assert.equal(row.sourceReference.representation, item.representation.candidateId);
    assert.notEqual(row.plannedRepresentation.id, row.sourceReference.representation);
    assert.ok(row.purpose.microAimIds.length > 0);
    assert.ok(row.evidence.requiredTraces.length >= 2);
    assert.equal(row.plannedRepresentation.sourceGeometryReused, false);
    assert.equal(row.plannedRepresentation.numericInputs, null);
    assert.equal(row.practicalNote.state, 'conditional_editor_note_not_validated_teaching');
    assert.ok(row.practicalNote.when && row.practicalNote.why && row.practicalNote.check);
  }
});

// Break caught: unmatched arithmetic tasks get an invented official outcome or full-output acceptance.
test('priority links remain proposals, unmatched tasks null, and MAT.6.1.4 stays an explicit gap', () => {
  const result = plan();
  assert.deepEqual(result.briefs.map(row => row.proposedOutcomeCodes), [
    ['MAT.6.1.2'], [], [], ['MAT.6.1.1', 'MAT.6.1.3'], ['MAT.6.1.1'], ['MAT.6.1.3']
  ]);
  assert.ok(result.briefs.every(row => row.officialOutcomeCode === null && row.fullOutcomeCoverage === false));
  assert.equal(result.briefs[1].programBinding, 'unbound_additional_mapping_pending');
  assert.equal(result.briefs[2].programBinding, 'unbound_additional_mapping_pending');
  assert.equal(result.gaps.find(row => row.code === 'MAT.6.1.4').status, 'not_observed_in_this_sample');
  assert.equal(result.gaps.find(row => row.code === 'MAT.6.1.4').globallyAbsent, false);
  assert.equal(result.familyTaxonomyIsOfficial, false);
});

// Break caught: a requested automated verifier is reported as a solved or approved answer.
test('each distinct answer policy is required but no verifier or answer is produced', () => {
  const result = plan();
  assert.deepEqual(result.briefs.map(row => row.answerValidationPolicy.verifierId), [
    'joint_rule_exact_membership', 'bounded_expression_equivalence_and_constraints',
    'exact_one_error_reachability', 'positive_divisors_and_distinct_prime_subset',
    'inverse_factor_candidate_uniqueness', 'prime_extrema_ordered_multiset'
  ]);
  for (const row of result.briefs) {
    assert.equal(row.answerValidationPolicy.state, 'required_not_implemented_or_run');
    assert.equal(row.answerValidationPolicy.automatedVerifierPassed, false);
    assert.equal(row.answerValidationPolicy.expertAccepted, false);
    assert.equal(row.answerValidationPolicy.answerKey, null);
    assert.ok(row.answerValidationPolicy.requiredChecks.length >= 2);
    assert.equal(row.answerValidationPolicy.nonVerifiableClosedItemPolicy, 'reject_before_product_acceptance');
  }
});

// Break caught: example difficulty percentages or text quality become active curriculum/rights approval.
test('all approval gates stay pending and difficulty example is not a source or universal distribution', () => {
  const result = plan();
  assert.deepEqual(result.gates, {
    activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending',
    answer: 'pending', accessibility: 'pending'
  });
  assert.equal(result.sourceDifficultyDistribution, null);
  assert.equal(result.difficultyCalibration, null);
  assert.equal(result.exampleDifficultyTarget.basis, 'user_example_only_not_source_distribution_or_universal_policy');
  assert.deepEqual(result.exampleDifficultyTarget.percentages, { easy: 10, medium: 30, hard: 30, veryHard: 30 });
  assert.equal(result.exampleDifficultyTarget.applied, false);
  assert.equal(result.humanApproval, null);
  assert.equal(result.teacherApproved, false);
  assert.equal(result.modelTransferAllowed, false);
  assert.equal(result.learnerReady, false);
  assert.equal(result.productionReady, false);
});

// Break caught: source SHA is changed but a freshly calculated caller digest launders the new revision.
test('changed or rehashed form and semantic revisions fail closed', () => {
  for (const mutate of [
    value => { value.formObservations.observations[0].sourceSha256 = '0'.repeat(64); },
    value => { value.formObservations.observations[0].items[0].microPurposes[0].meaning = 'changed purpose'; },
    value => { value.formObservations.scope.selectedOuterSourceItemCount = 36000; },
    value => { value.formObservations.observations[0].items.push(clone(value.formObservations.observations[0].items[0])); },
    value => { value.formObservations.observations[0].items.reverse(); },
    value => { value.semanticMatrix.source.sha256 = '1'.repeat(64); },
    value => { value.semanticMatrix.outcomes.pop(); },
    value => { value.semanticMatrix.contentSha256 = createHash('sha256').update(JSON.stringify(value.semanticMatrix)).digest('hex'); }
  ]) {
    const value = input(); mutate(value);
    value.sourceScopeInput.formObservations = clone(value.formObservations);
    assert.throws(() => plan(value), /grade6_authoring_.*revision/);
  }
});

// Break caught: known SHA alone binds a source with no grade, wrong course, or invented reuse rights.
test('missing or corrupt source record scope and permissions fail closed', () => {
  for (const mutate of [
    row => { delete row.grades; }, row => { delete row.courseKey; }, row => { row.grades = [8]; },
    row => { row.courseKey = 'ingilizce'; }, row => { row.reuseRights = 'commercial_approved'; },
    row => { row.download.sha256 = '2'.repeat(64); }, row => { row.download.byteLength += 1; },
    row => { row.title = 'same revised source'; }, row => { row.expectedSha256 = '3'.repeat(64); }
  ]) {
    const value = input(); mutate(findSource(value));
    assert.throws(() => plan(value), /grade6_authoring_.*source/);
  }
  const missingProgram = input();
  missingProgram.sourceScopeInput.archives[0].sources = missingProgram.sourceScopeInput.archives[0].sources.filter(row => row.id !== programId);
  assert.throws(() => plan(missingProgram), /grade6_authoring_.*source/);
});

// Break caught: another sample or a forged duplicate source advances the existing scope consumer.
test('the source-scope input must carry the same six-item revision and unique source identities', () => {
  const different = input(); different.sourceScopeInput.formObservations.observations[0].sourceSha256 = '4'.repeat(64);
  assert.throws(() => plan(different), /grade6_authoring_.*scope/);
  const duplicate = input(); duplicate.sourceScopeInput.archives[1].sources.push(clone(findSource(duplicate)));
  assert.throws(() => plan(duplicate), /grade6_authoring_.*source/);
  const missing = input(); missing.sourceScopeInput.formObservations.observations = [];
  assert.throws(() => plan(missing), /grade6_authoring_.*scope/);
});

// Break caught: missing nested scope containers escape as an unclassified native error.
test('missing scope fields and malformed nested containers reject with a bounded domain error', () => {
  for (const mutate of [
    value => { delete value.sourceScopeInput.formObservations; },
    value => { value.sourceScopeInput.archives[0] = null; },
    value => { value.sourceScopeInput.selection = null; },
    value => { value.sourceScopeInput.monthly = null; },
    value => { value.sourceScopeInput.downloadObservations = null; }
  ]) {
    const value = input(); mutate(value);
    assert.throws(() => plan(value), /grade6_authoring_invalid_(scope|source|fields)/);
  }
});

// Break caught: harmless object order changes become authority or result mutation changes later reports.
test('canonical object order is stable and the hashed output is deeply immutable', () => {
  const value = input(), reordered = JSON.parse(JSON.stringify(canonical(value)));
  const result = plan(value), same = plan(reordered);
  assert.deepEqual(result, same);
  const { contentSha256, ...body } = result;
  const independent = createHash('sha256').update(`k12.grade6-reference-authoring-plan/v1:${JSON.stringify(canonical(body))}`).digest('hex');
  assert.equal(contentSha256, independent);
  assert.equal(result.serializedHashIsAuthority, false);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.briefs) && Object.isFrozen(result.briefs[0].evidence.requiredTraces));
  assert.throws(() => { result.briefs[0].sourceReference.ordinal = 1; }, TypeError);
  assert.throws(() => { result.gates.rights = 'approved'; }, TypeError);
  value.formObservations.observations[0].items[0].ordinal = 99;
  assert.equal(result.briefs[0].sourceReference.ordinal, 13);
});

// Break caught: input getters/proxies execute before the planner sees the closed inert metadata.
test('hostile data hooks fail without being called', () => {
  let calls = 0;
  const getter = input(); Object.defineProperty(getter.formObservations, 'scope', { enumerable: true, get() { calls++; return {}; } });
  const proxy = input(); proxy.semanticMatrix = new Proxy(proxy.semanticMatrix, { ownKeys() { calls++; return []; } });
  const callable = input(); callable.formObservations.toJSON = () => { calls++; return {}; };
  const rootProxy = new Proxy(input(), { getPrototypeOf() { calls++; return Object.prototype; } });
  for (const value of [getter, proxy, callable, rootProxy]) assert.throws(() => plan(value), /grade6_authoring_invalid_data/);
  assert.equal(calls, 0);
});

// Break caught: cycles, sparse arrays or arbitrary payloads use the snapshot as a model/data transfer channel.
test('cyclic sparse oversized and additional input fields are rejected', () => {
  const cyclic = input(); cyclic.semanticMatrix.loop = cyclic;
  const sparse = input(); delete sparse.formObservations.observations[0].items[0];
  const huge = input(); huge.formObservations.payload = 'x'.repeat(65537);
  const broad = input(); broad.formObservations.payload = Array(2049).fill(null);
  for (const value of [cyclic, sparse, huge, broad]) assert.throws(() => plan(value), /grade6_authoring_invalid_data/);
  const extra = input(); extra.targetCount = 36000;
  assert.throws(() => plan(extra), /grade6_authoring_invalid_fields/);
});

// Break caught: huge field names avoid the inert snapshot text budget before revision hashing.
test('oversized or control-character keys and aggregate text exceed the data budget', () => {
  const longKey = input(); longKey.formObservations['k'.repeat(65537)] = null;
  const controlKey = input(); controlKey.formObservations['bad\u0000key'] = null;
  const aggregate = input(); aggregate.formObservations.payload = Array(512).fill('x'.repeat(5000));
  for (const value of [longKey, controlKey, aggregate]) assert.throws(() => plan(value), /grade6_authoring_invalid_data/);
});

// Break caught: broad inventory length becomes a quota or narrow same-row snapshots lose valid lineage.
test('a narrow union of the two unchanged source rows yields the same six briefs', () => {
  const full = input(), narrow = input();
  narrow.sourceScopeInput.archives = [{ sources: [clone(findSource(full)), clone(findSource(full, programId))] }];
  const a = plan(full), b = plan(narrow);
  assert.deepEqual(a.briefs, b.briefs);
  assert.equal(b.lineage.sourceScope.observedItemCount, 6);
  assert.equal(b.counts.acceptedProductQuestions, 0);
  assert.notEqual(a.lineage.sourceScope.reportSha256, b.lineage.sourceScope.reportSha256);
});

// Break caught: this pending editor plan is passed directly as a human-approved coverage blueprint.
test('the existing approved coverage contract refuses the pre-blueprint editor plan', () => {
  const result = plan();
  assert.equal(validateQuestionCoverageBlueprint(result).valid, false);
  assert.equal(result.humanApproval, null);
  assert.equal(result.canonicalCurriculumBinding, null);
  assert.equal(result.coverageBlueprintReady, false);
});
