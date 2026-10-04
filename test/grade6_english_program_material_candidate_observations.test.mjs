import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createSourceScopeGapReport } from '../packages/content-factory/source_scope_gaps.mjs';

const artifactUrl = new URL('../sources/grade6-english-program-material-candidate-observations.json', import.meta.url);
const registry = JSON.parse(await readFile(new URL('../sources/meb-reference-registry.json', import.meta.url), 'utf8'));
const supplement = JSON.parse(await readFile(new URL('../sources/education-reference-supplement.json', import.meta.url), 'utf8'));
const PROGRAM = 'tymm-current-ingilizce';
const MATERIAL = 'meb-2026-grade6-english-workbook';
const actualPair = [registry.sources.find(row => row.id === PROGRAM), supplement.sources.find(row => row.id === MATERIAL)];
const clone = value => structuredClone(value);
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function artifact() {
  const raw = await readFile(artifactUrl, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  assert.ok(raw, 'bounded grade-six English program/material observations are not prepared');
  return { raw, value: JSON.parse(raw) };
}
function input(value) {
  return { archives: [{ sources: actualPair }], selection: { sources: [], inventory: [] },
    downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: value };
}
function report(value) { return createSourceScopeGapReport(input(value)); }

// Break caught: programme outcomes or a picture grid become additional questions.
test('actual consumer binds two source revisions but counts only two selected material activities', async () => {
  const { value } = await artifact(), result = report(value);
  assert.equal(result.inventory.sourceIdentityCount, 2);
  assert.equal(result.inventory.uniqueDownloadedByteRevisionCount, 2);
  assert.equal(result.inventory.uniqueDownloadedBytes, 20460176);
  assert.equal(result.roles.program.sourceIdentityCount, 1);
  assert.equal(result.roles.lesson_activity.sourceIdentityCount, 1);
  assert.equal(result.sourceForm.boundObservationSourceCount, 2);
  assert.equal(result.sourceForm.observedItemCount, 2);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === PROGRAM).observedItemCount, 0);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === MATERIAL).candidateFamilyCount, 2);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
});

// Break caught: local activity labels 1/2 are mistaken for an enumerated whole book.
test('selected ordinal labels never close material, outcome, or question denominators', async () => {
  const { value } = await artifact(), result = report(value);
  assert.deepEqual(value.observations[1].items.map(row => row.ordinal), [1, 2]);
  assert.equal(result.sourceForm.completelyEnumeratedOrdinalItemCount, 0);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === MATERIAL).totalSourceItemCount, null);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.denominators.officialOutcomeCount, null);
  assert.equal(result.denominators.requiredQuestionFamilyCount, null);
  assert.equal(result.coveragePercentage, null);
  assert.equal(result.fullQuestionCoverage, false);
});

// Break caught: a stale workbook revision keeps pictured activity provenance.
test('stale material hash removes both observed items without unbinding the programme row', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[1].sourceSha256 = 'a'.repeat(64);
  const result = report(changed);
  assert.equal(result.sourceForm.boundObservationSourceCount, 1);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 0);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === PROGRAM).lineageBound, true);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === MATERIAL).candidateFamilyCount, 0);
});

// Break caught: a stale programme falsely opens cross-source output equivalence.
test('stale programme remains visibly unbound even when the workbook observations remain available', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[0].sourceSha256 = 'a'.repeat(64);
  const result = report(changed);
  assert.equal(result.sourceForm.boundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 2);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === PROGRAM).lineageBound, false);
  assert.ok(result.sourceForm.sources.every(row => row.expertAccepted === false));
  assert.equal(result.pedagogy.activeOutcomeMappingAccepted, false);
  assert.equal(result.publicationReady, false);
});

// Break caught: a caller-created programme or workbook name creates canonical provenance.
test('unregistered workbook produces no selected activity contribution', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[1].sourceId = 'unregistered-english-workbook';
  const result = report(changed);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 0);
  assert.equal(result.productQuestions.acceptedByReport, 0);
});

// Break caught: theme similarity and caller counters become active programme or stock acceptance.
test('phantom counts and approval-like fields cannot promote activities or publication', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.scope.observedMaterialActivityCount = 36000;
  changed.scope.sourceQuestionTotal = 36000;
  changed.scope.productQuestionsContributed = 36000;
  changed.activeProgram.programAccepted = true;
  changed.governance.publicationReady = true;
  changed.governance.expertAccepted = true;
  changed.relationships.forEach(row => { row.outcomeEquivalenceAccepted = true; });
  const result = report(changed);
  assert.equal(result.sourceForm.observedItemCount, 2);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.productQuestions.generatedByReport, 0);
  assert.equal(result.productQuestions.acceptedByReport, 0);
  assert.equal(result.fullSourcesVerified, false);
  assert.equal(result.publicationReady, false);
  assert.equal(result.learnerReady, false);
});

// Break caught: duplicate source records or selected activity labels count evidence twice.
test('duplicate sources and activity ordinals fail closed', async () => {
  const { value } = await artifact();
  const duplicateSource = clone(value);
  duplicateSource.observations.push(clone(duplicateSource.observations[1]));
  assert.throws(() => report(duplicateSource), /duplicate_source_scope_observation/u);
  const duplicateOrdinal = clone(value);
  duplicateOrdinal.observations[1].items.push(clone(duplicateOrdinal.observations[1].items[0]));
  assert.throws(() => report(duplicateOrdinal), /invalid_source_scope_item/u);
});

// Break caught: malformed ordinals silently contribute phantom activity evidence.
test('zero fractional negative and nonfinite activity ordinals are rejected', async () => {
  const { value } = await artifact();
  for (const ordinal of [0, -1, 0.5, Infinity]) {
    const changed = clone(value);
    changed.observations[1].items[0].ordinal = ordinal;
    assert.throws(() => report(changed));
  }
});

// Break caught: metadata ingestion executes accessors or accepts hostile object graphs.
test('getters proxies cycles and oversized data are rejected with zero invoked hooks', async () => {
  const { value } = await artifact();
  let hooks = 0;
  const getter = clone(value);
  Object.defineProperty(getter.observations[1], 'sourceSha256', { enumerable: true, get() { hooks++; return 'hook'; } });
  assert.throws(() => report(getter));
  const proxy = clone(value);
  proxy.observations[1] = new Proxy(proxy.observations[1], { get() { hooks++; return 'hook'; } });
  assert.throws(() => report(proxy));
  const cycle = clone(value);
  cycle.observations[1].self = cycle;
  assert.throws(() => report(cycle));
  const oversized = clone(value);
  oversized.observations[1].prose = 'x'.repeat(65537);
  assert.throws(() => report(oversized));
  assert.equal(hooks, 0);
});

// Break caught: actual child data enters the reference-only projection.
test('learner-data marker is rejected before source projection', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.learnerData = true;
  assert.throws(() => report(changed), /nonpublic_source_scope_input/u);
});

// Break caught: reshuffling/rehashing prose turns metadata projection into source/rights authority.
test('a rewritten and self-rehashed candidate never gains fresh-byte or commercial authority', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.relationships[0].practicalWhy = 'A changed editorial hypothesis, not an approved outcome.';
  delete changed.contentSha256;
  changed.contentSha256 = digest(changed);
  const result = report(changed);
  assert.equal(result.sourceForm.observedItemCount, 2);
  assert.equal(result.freshPdfByteChecks, 0);
  assert.equal(result.rights.commercialReuseApproval, 'not_established');
  assert.equal(result.rights.modelTransferAllowed, false);
  assert.equal(result.pedagogy.activeOutcomeMappingAccepted, false);
  assert.equal(result.productionReady, false);
});

// Break caught: source pairing loses actual downloaded revisions, modal limits, or public bounds.
test('bounded candidate DTO characterizes real source lineage and preserves modality gaps', async () => {
  const { raw, value } = await artifact();
  assert.ok(Buffer.byteLength(raw) <= 16384);
  const { contentSha256, ...body } = value;
  assert.equal(contentSha256, digest(body));
  for (const role of ['program', 'material']) {
    const row = value.sourcePair[role], actual = actualPair.find(source => source.id === row.sourceId);
    assert.ok(actual);
    assert.equal(row.sha256, actual.download.sha256);
    assert.equal(row.byteLength, actual.download.byteLength);
    assert.equal(row.pdfUrl, actual.url);
  }
  assert.deepEqual(value.sourcePair.program.reviewedPhysicalPages, [562, 563]);
  assert.deepEqual(value.sourcePair.material.reviewedPhysicalPages, [7, 10]);
  assert.equal(value.programSlice.observedOutcomeCodeCount, 4);
  assert.equal(value.programSlice.visibleProcessComponentCount, 14);
  assert.ok(value.observations[1].items.every(row => row.formalOutputCode === null && row.answerKeyCopied === false));
  assert.ok(value.relationships.every(row => row.outcomeEquivalenceAccepted === false));
  const before = JSON.stringify(value), result = report(value);
  assert.equal(JSON.stringify(value), before);
  assert.ok(Object.isFrozen(result));
  assert.equal(value.activeProgram.programAccepted, false);
  assert.equal(value.scope.productQuestionsContributed, 0);
  assert.doesNotMatch(raw, /\/Users\/|\.env|Bearer\s|cfut_|data:image|<svg|questionText"|options"|answerKey"|sourceParagraph"|verbatim"|wordList"/iu);
});
