import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createSourceScopeGapReport } from '../packages/content-factory/source_scope_gaps.mjs';

const artifactUrl = new URL('../sources/grade6-common-relations-application-observations.json', import.meta.url);
const registry = JSON.parse(await readFile(new URL('../sources/meb-reference-registry.json', import.meta.url), 'utf8'));
const matrix = JSON.parse(await readFile(new URL('../sources/grade6-source-semantic-candidate-matrix.json', import.meta.url), 'utf8'));
const clone = value => structuredClone(value);
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function artifact() {
  const raw = await readFile(artifactUrl, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  assert.ok(raw, 'MAT.6.1.4 application observation artifact is not prepared');
  return { raw, value: JSON.parse(raw) };
}
function input(value) {
  return { archives: [registry], selection: { sources: [], inventory: [] },
    downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: value };
}
function report(value) { return createSourceScopeGapReport(input(value)); }

// Break caught: application-guidance rows are fabricated as source questions,
// or source observations create a second PDF identity in the real consumer.
test('real gap consumer binds the existing program while counting no application rows as questions', async () => {
  const { value } = await artifact(), result = report(value);
  assert.equal(result.inventory.sourceIdentityCount, 42);
  assert.equal(result.sourceForm.observationSourceCount, 1);
  assert.equal(result.sourceForm.boundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 0);
  assert.equal(result.sourceForm.completelyEnumeratedOrdinalItemCount, 0);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.sourceQuestionTotal, null);
});

// Break caught: stale source revisions retain source lineage authority.
test('changing the actual program SHA makes observations unbound without adding source or product stock', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[0].sourceSha256 = 'a'.repeat(64);
  const result = report(changed);
  assert.equal(result.sourceForm.boundObservationSourceCount, 0);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 0);
  assert.equal(result.sourceForm.sources[0].lineageBound, false);
  assert.equal(result.inventory.sourceIdentityCount, 42);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
});

// Break caught: a title-only or caller-invented source ID creates provenance.
test('unknown program identity stays visibly unbound in the real gap consumer', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[0].sourceId = 'unregistered-common-relations-program';
  const result = report(changed);
  assert.equal(result.sourceForm.boundObservationSourceCount, 0);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.fullQuestionCoverage, false);
});

// Break caught: serialized caller approval or count fields open real gates.
test('caller promotion fields never approve curriculum rights or publication through the gap consumer', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.governance.publicationReady = true;
  changed.governance.learnerReady = true;
  changed.governance.teacherApproved = true;
  changed.activeProgram.grade6ProgramCourseAccepted = true;
  changed.scope.sourceQuestionTotal = 36000;
  changed.scope.productQuestionsContributed = 36000;
  const result = report(changed);
  assert.equal(result.fullSourcesVerified, false);
  assert.equal(result.fullQuestionCoverage, false);
  assert.equal(result.publicationReady, false);
  assert.equal(result.learnerReady, false);
  assert.equal(result.sourceQuestionTotal, null);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.denominators.officialOutcomeCount, null);
  assert.equal(result.cells.find(row => row.grade === 6 && row.courseKey === 'matematik').roles.program.activeProgramVerified, false);
});

// Break caught: duplicate source observation IDs are counted twice.
test('duplicate application observation source rows fail closed', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations.push(clone(changed.observations[0]));
  assert.throws(() => report(changed), /duplicate_source_scope_observation/u);
});

// Break caught: malformed phantom source-question ordinals enter counters.
test('invalid source-question ordinals are rejected rather than interpreted as application evidence', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[0].items.push({ ordinal: 0 });
  assert.throws(() => report(changed), /invalid_source_scope_item/u);
});

// Break caught: metadata ingestion executes accessors or hostile proxies.
test('inert input boundary rejects accessors proxies and cycles without invoking hooks', async () => {
  const { value } = await artifact();
  let calls = 0;
  const getter = clone(value);
  Object.defineProperty(getter.observations[0], 'sourceSha256', { enumerable: true, get() { calls++; return value.source.sha256; } });
  assert.throws(() => report(getter));
  const proxyInput = clone(value);
  proxyInput.observations[0] = new Proxy(proxyInput.observations[0], { get() { calls++; throw new Error('hook'); } });
  assert.throws(() => report(proxyInput));
  const cyclic = clone(value);
  cyclic.observations[0].cycle = cyclic;
  assert.throws(() => report(cyclic));
  assert.equal(calls, 0);
});

// Break caught: oversized untrusted metadata bypasses the bounded copier.
test('oversized application metadata is rejected before projection', async () => {
  const { value } = await artifact(), changed = clone(value);
  changed.observations[0].untrustedProse = 'x'.repeat(65537);
  assert.throws(() => report(changed));
});

// Break caught: report projection mutates the frozen older semantic boundary,
// or accepted gates are inferred from the new observation record.
test('actual projection leaves old matrix application gap and source snapshots untouched', async () => {
  const { value } = await artifact();
  const before = JSON.stringify({ value, registry, matrix });
  const result = report(value);
  assert.equal(JSON.stringify({ value, registry, matrix }), before);
  const old = matrix.outcomes.find(row => row.code === value.outputBinding.code);
  assert.ok(old);
  assert.equal(old.applicationReview, 'continuation_outside_selected_pages_pending');
  assert.equal(matrix.gaps.find(row => row.id === value.priorMatrixBinding.applicationGapId).state, 'unresolved');
  assert.ok(Object.isFrozen(result));
  assert.equal(result.sourceForm.sources[0].effectiveProgramMapping, 'unaccepted_current_program_equivalence_pending');
  assert.equal(result.sourceForm.sources[0].expertAccepted, false);
});

// Break caught: a corrupt DTO no longer binds the existing source output;
// digest integrity is not authentication or semantic acceptance.
test('bounded application DTO has exact existing source and prior-output lineage without learner acceptance', async () => {
  const { raw, value } = await artifact();
  assert.ok(Buffer.byteLength(raw) <= 16384);
  const { contentSha256, ...body } = value;
  assert.equal(contentSha256, digest(body));
  const source = registry.sources.find(row => row.id === value.source.sourceId);
  assert.ok(source);
  assert.equal(value.source.sha256, source.download.sha256);
  assert.equal(value.source.byteLength, source.download.byteLength);
  assert.equal(value.source.pdfUrl, source.url);
  assert.equal(value.priorMatrixBinding.contentSha256, matrix.contentSha256);
  assert.equal(value.outputBinding.code, 'MAT.6.1.4');
  const outcome = matrix.outcomes.find(row => row.code === value.outputBinding.code);
  assert.deepEqual(value.outputBinding.priorProcessLabels, outcome.processComponents.map(row => row.printedLabel));
  assert.equal(value.boundaries.formalGcdLcmTeachingAllowed, false);
  assert.equal(value.boundaries.extremalCommonRelationTasksAccepted, false);
  assert.equal(value.activeProgram.grade6ProgramCourseAccepted, false);
  assert.equal(value.governance.publicationReady, false);
  assert.equal(value.governance.learnerReady, false);
  assert.equal(value.source.sourceToModelTransferAllowed, false);
  assert.doesNotMatch(raw, /\/Users\/|\.env|Bearer\s|cfut_|data:image|<svg|questionText"|options"|sourceParagraph"|verbatim"/iu);
});
