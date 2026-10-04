import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createSourceScopeGapReport } from '../packages/content-factory/source_scope_gaps.mjs';

const artifactUrl = new URL('../sources/tubitak-2024-middle-math-form-observations.json', import.meta.url);
const supplement = JSON.parse(await readFile(new URL('../sources/education-reference-supplement.json', import.meta.url), 'utf8'));
const QUESTION_ID = 'tubitak-2024-middle-math-stage1-questions';
const SOLUTION_ID = 'tubitak-2024-middle-math-stage1-solutions';
const actualPair = supplement.sources.filter(row => [QUESTION_ID, SOLUTION_ID].includes(row.id));
const clone = value => structuredClone(value);
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function artifact() {
  const raw = await readFile(artifactUrl, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  assert.ok(raw, 'selected TÜBİTAK 2024 form observations are not prepared');
  return { raw, value: JSON.parse(raw) };
}
function input(value) {
  return { archives: [{ sources: actualPair }], selection: { sources: [], inventory: [] },
    downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: value };
}
function report(value) { return createSourceScopeGapReport(input(value)); }

// Break caught: a question/solution pair creates duplicate questions or product stock.
test('real consumer counts three selected questions and zero duplicate solution questions', async () => {
  const { value } = await artifact(), result = report(value);
  assert.equal(result.inventory.sourceIdentityCount, 2);
  assert.equal(result.inventory.uniqueDownloadedByteRevisionCount, 2);
  assert.equal(result.sourceForm.observationSourceCount, 2);
  assert.equal(result.sourceForm.boundObservationSourceCount, 2);
  assert.equal(result.sourceForm.observedItemCount, 3);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === QUESTION_ID).candidateFamilyCount, 3);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === SOLUTION_ID).observedItemCount, 0);
  assert.equal(result.sourceForm.productQuestionContribution, 0);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
});

// Break caught: an incomplete selected span becomes the full exam denominator.
test('a noncontiguous ordinal sample never closes source or official family denominators', async () => {
  const { value } = await artifact(), result = report(value);
  assert.deepEqual(value.observations[0].items.map(row => row.ordinal), [1, 2, 4]);
  assert.equal(result.sourceForm.completelyEnumeratedOrdinalItemCount, 0);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === QUESTION_ID).totalSourceItemCount, null);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.sourceForm.acceptedOfficialFamilyCount, null);
  assert.equal(result.sourceQuestionTotal, null);
  assert.equal(result.coveragePercentage, null);
});

// Break caught: stale question bytes retain observable item provenance.
test('stale question hash removes all selected item contributions while keeping the solution record separate', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[0].sourceSha256 = 'a'.repeat(64);
  const result = report(changed);
  assert.equal(result.sourceForm.boundObservationSourceCount, 1);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 0);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === QUESTION_ID).candidateFamilyCount, 0);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === SOLUTION_ID).lineageBound, true);
});

// Break caught: a stale solution revision falsely stays paired and accepted.
test('stale solution hash is visibly unbound and never promotes question or expert acceptance', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[1].sourceSha256 = 'a'.repeat(64);
  const result = report(changed);
  assert.equal(result.sourceForm.boundObservationSourceCount, 1);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 3);
  assert.equal(result.sourceForm.sources.find(row => row.sourceId === SOLUTION_ID).lineageBound, false);
  assert.ok(result.sourceForm.sources.every(row => row.expertAccepted === false));
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
});

// Break caught: middle-school title fans out into every MEB grade automatically.
test('actual official enrichment rows remain unassigned to grade-specific curriculum cells', async () => {
  const { value } = await artifact(), result = report(value);
  assert.deepEqual([...result.unassignedSourceIds].sort(), [QUESTION_ID, SOLUTION_ID].sort());
  assert.ok(result.cells.every(row => row.roles.olympiad_questions.metadataCandidateCount === 0));
  assert.ok(result.cells.every(row => row.roles.olympiad_solutions.metadataCandidateCount === 0));
  assert.equal(result.denominators.officialGradeCourseCount, null);
  assert.equal(result.denominators.officialOutcomeCount, null);
  assert.equal(result.fullSourcesVerified, false);
});

// Break caught: caller summary counters or signed-looking fields open gates.
test('phantom total counts and caller approval fields cannot promote observed stock or publication', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.scope.selectedSourceItemCount = 36000;
  changed.scope.sourceQuestionTotal = 36000;
  changed.scope.productQuestionsContributed = 36000;
  changed.governance.publicationReady = true;
  changed.governance.teacherApproved = true;
  changed.activeProgram.programAccepted = true;
  changed.observations[0].observedCount = 36000;
  const result = report(changed);
  assert.equal(result.sourceForm.observedItemCount, 3);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.fullQuestionCoverage, false);
  assert.equal(result.publicationReady, false);
  assert.equal(result.learnerReady, false);
});

// Break caught: duplicate source rows or ordinals count selected evidence twice.
test('duplicate question sources and duplicate selected ordinals fail closed', async () => {
  const { value } = await artifact();
  const repeatedSource = clone(value);
  repeatedSource.observations.push(clone(repeatedSource.observations[0]));
  assert.throws(() => report(repeatedSource), /duplicate_source_scope_observation/u);
  const repeatedOrdinal = clone(value);
  repeatedOrdinal.observations[0].items.push(clone(repeatedOrdinal.observations[0].items[0]));
  assert.throws(() => report(repeatedOrdinal), /invalid_source_scope_item/u);
});

// Break caught: malformed phantom ordinal data enters observed counters.
test('zero fractional and nonfinite source ordinals are rejected', async () => {
  const { value } = await artifact();
  for (const ordinal of [0, -1, 1.5, Infinity]) {
    const changed = clone(value);
    changed.observations[0].items[0].ordinal = ordinal;
    assert.throws(() => report(changed));
  }
});

// Break caught: metadata ingestion executes hostile code or accepts cycles.
test('getters revoked proxies cycles and oversized text are inertly rejected with zero hooks', async () => {
  const { value } = await artifact();
  let calls = 0;
  const getter = clone(value);
  Object.defineProperty(getter.observations[0], 'sourceSha256', { enumerable: true, get() { calls++; return 'hook'; } });
  assert.throws(() => report(getter));
  const proxyValue = clone(value), revoked = Proxy.revocable(proxyValue.observations[0], {});
  revoked.revoke();
  proxyValue.observations[0] = revoked.proxy;
  assert.throws(() => report(proxyValue));
  const cycle = clone(value);
  cycle.observations[0].self = cycle;
  assert.throws(() => report(cycle));
  const oversized = clone(value);
  oversized.observations[0].untrustedProse = 'x'.repeat(65537);
  assert.throws(() => report(oversized));
  assert.equal(calls, 0);
});

// Break caught: real child data enters a reference-only metadata projection.
test('learner-data marker is rejected before source projection', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.studentData = true;
  assert.throws(() => report(changed), /nonpublic_source_scope_input/u);
});

// Break caught: a caller-created source name creates provenance out of a title.
test('unregistered question source has no item contribution', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[0].sourceId = 'unregistered-olympiad-question-book';
  const result = report(changed);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 0);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
});

// Break caught: corrupt pair metadata loses actual registry lineage or public bounds.
test('bounded pair DTO binds actual question and solution revisions without copying source text or answer keys', async () => {
  const { raw, value } = await artifact();
  assert.ok(Buffer.byteLength(raw) <= 16384);
  const { contentSha256, ...body } = value;
  assert.equal(contentSha256, digest(body));
  for (const role of ['questions', 'solutions']) {
    const bound = value.sourcePair[role], actual = actualPair.find(row => row.id === bound.sourceId);
    assert.ok(actual);
    assert.equal(bound.sha256, actual.download.sha256);
    assert.equal(bound.byteLength, actual.download.byteLength);
    assert.equal(bound.pdfUrl, actual.url);
    assert.equal(bound.pairedSourceId, actual.pairedSourceId);
  }
  const before = JSON.stringify(value), result = report(value);
  assert.ok(Object.isFrozen(result));
  assert.equal(JSON.stringify(value), before);
  assert.equal(value.sourcePair.questions.pdfPageCount, 25);
  assert.equal(value.sourcePair.solutions.pdfPageCount, 11);
  assert.equal(value.activeProgram.programAccepted, false);
  assert.equal(value.governance.publicationReady, false);
  assert.equal(value.scope.productQuestionsContributed, 0);
  assert.ok(value.observations[0].items.every(row => row.formalOutputCode === null && row.answerKeyCopied === false));
  assert.ok(value.observations[0].items.every(row => row.solutionReference.sourceId === SOLUTION_ID));
  assert.doesNotMatch(raw, /\/Users\/|\.env|Bearer\s|cfut_|data:image|<svg|questionText"|options"|answerKey"|sourceParagraph"|verbatim"|numberVector"/iu);
});
