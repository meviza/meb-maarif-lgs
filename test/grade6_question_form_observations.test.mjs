import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSourceScopeGapReport } from '../packages/content-factory/source_scope_gaps.mjs';

const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const artifact = await load('grade6-question-form-observations').catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
const supplement = await load('education-reference-supplement');
const prior = await load('meb-question-style-observations');
const sourceId = 'meb-archive-grade6-math-fascicle-unit1-hatay';
const clone = value => structuredClone(value);
function observed() {
  assert.ok(artifact, 'new bounded grade6 source observation artifact is missing');
  return clone(artifact);
}
function input(forms) {
  return { archives: [supplement], selection: { sources: [], inventory: [] },
    downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: forms };
}
const report = forms => createSourceScopeGapReport(input(forms));

// Break caught: options, subprompts and earlier source observations become new product stock.
test('the real consumer binds six non-repeated outer items, not product questions', () => {
  const forms = observed(), before = JSON.stringify(forms), result = report(forms);
  assert.equal(JSON.stringify(forms), before);
  assert.equal(result.sourceForm.boundObservationSourceCount, 1);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 0);
  assert.equal(result.sourceForm.observedItemCount, 6);
  assert.equal(result.sourceForm.sources[0].candidateFamilyCount, 6);
  assert.equal(result.sourceForm.sources[0].totalSourceItemCount, null);
  assert.equal(result.sourceForm.completelyEnumeratedOrdinalItemCount, 0);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.sourceForm.productQuestionContribution, 0);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.productQuestions.generatedByReport, 0);
  assert.equal(result.productQuestions.acceptedByReport, 0);
  assert.equal(result.coveragePercentage, null);
  assert.equal(result.freshPdfByteChecks, 0, 'consumer projection is not a fresh PDF inspection');
  assert.equal(result.publicationReady, false);
  assert.equal(result.learnerReady, false);
});

// Break caught: a second role or source-page sample increments physical PDF totals.
test('adding form metadata changes no recorded PDF acquisition or role count', () => {
  const result = report(observed()), baseline = report({ observations: [] });
  assert.deepEqual(result.inventory, baseline.inventory);
  assert.deepEqual(result.roles, baseline.roles);
  assert.ok(result.roles.lesson_activity.sourceIds.includes(sourceId));
  assert.ok(result.roles.question_bank.sourceIds.includes(sourceId));
  assert.equal(result.roleCountsOverlap, true);
});

// Break caught: new sample silently replaces or duplicates the earlier Hatay slice.
test('an in-memory union with prior observations increases 27 observed items to 33 only', () => {
  const forms = observed(), next = forms.observations[0];
  const merged = clone(prior), old = merged.observations.find(row => row.sourceId === sourceId);
  assert.deepEqual(next.items.map(item => item.ordinal), [13, 14, 15, 16, 17, 18]);
  assert.deepEqual(next.items.map(item => item.physicalPdfPage), [12, 13, 14, 15, 15, 16]);
  assert.ok(next.items.every(item => !old.items.some(previous => previous.ordinal === item.ordinal)));
  assert.equal(old.sourceSha256, next.sourceSha256);
  old.items.push(...clone(next.items));
  const baseline = report(prior), result = report(merged);
  assert.equal(baseline.sourceForm.observedItemCount, 27);
  assert.equal(result.sourceForm.observedItemCount, 33);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === sourceId).observedItemCount, 13);
  assert.equal(result.sourceForm.completelyEnumeratedOrdinalItemCount, 20);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.sourceForm.productQuestionContribution, 0);
  assert.deepEqual(result.inventory, baseline.inventory);
});

// Break caught: a SHA or source identity mismatch survives as bound source evidence.
test('stale SHA and unknown identity are excluded from bound item and family counts', () => {
  for (const mutation of [row => { row.sourceSha256 = '0'.repeat(64); }, row => { row.sourceId = 'unknown-archive'; }]) {
    const forms = observed(); mutation(forms.observations[0]);
    const result = report(forms);
    assert.equal(result.sourceForm.boundObservationSourceCount, 0);
    assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
    assert.equal(result.sourceForm.observedItemCount, 0);
    assert.equal(result.sourceForm.sources[0].candidateFamilyCount, 0);
    assert.equal(result.sourceForm.sources[0].lineageBound, false);
    assert.equal(result.sourceForm.sourceQuestionTotal, null);
    assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  }
});

// Break caught: client summary or claimed approval converts a partial legacy slice to acceptance.
test('forged totals, active-program approval and complete-span flags do not promote this slice', () => {
  const forms = observed(), row = forms.observations[0];
  forms.productQuestionCount = 36000;
  forms.publicationReady = true;
  row.expertAccepted = true;
  row.effectiveProgramMapping = 'accepted';
  row.itemOrdinalCoverage = { first: 1, last: 6, observedCount: 6, allOrdinalPagePairsChecked: true };
  const result = report(forms), source = result.sourceForm.sources[0];
  assert.equal(source.totalSourceItemCount, null, 'actual ordinals 13–18 do not form a complete 1-based source');
  assert.equal(source.expertAccepted, false);
  assert.equal(source.effectiveProgramMapping, 'unaccepted_current_program_equivalence_pending');
  assert.equal(result.pedagogy.activeOutcomeMappingAccepted, false);
  assert.equal(result.rights.modelTransferAllowed, false);
  assert.equal(result.rights.commercialReuseApproval, 'not_established');
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.fullSourcesVerified, false);
  assert.equal(result.fullQuestionCoverage, false);
  assert.equal(result.publicationReady, false);
});

// Break caught: duplicated source or outer ordinal inflates reference counts.
test('duplicate ordinals and duplicate observation identities are rejected by the consumer', () => {
  const ordinal = observed(); ordinal.observations[0].items.push(clone(ordinal.observations[0].items[0]));
  assert.throws(() => report(ordinal), /invalid_source_scope_item/);
  const duplicate = observed(); duplicate.observations.push(clone(duplicate.observations[0]));
  assert.throws(() => report(duplicate), /duplicate_source_scope_observation/);
});

// Break caught: observation getters or proxies run before safe metadata copying.
test('hostile observation hooks are rejected without being executed', () => {
  const forms = observed(); let calls = 0;
  Object.defineProperty(forms.observations[0].items[0], 'candidateFamily', {
    enumerable: true, get() { calls++; return 'injected'; }
  });
  assert.throws(() => report(forms), /invalid_source_scope_data/);
  const proxied = observed();
  proxied.observations[0] = new Proxy(proxied.observations[0], { ownKeys() { calls++; return []; } });
  assert.throws(() => report(proxied), /invalid_source_scope_data/);
  const cyclic = observed(); cyclic.observations[0].items[0].loop = cyclic;
  assert.throws(() => report(cyclic), /invalid_source_scope_data/);
  assert.equal(calls, 0);
});
