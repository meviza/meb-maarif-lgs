import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsDraft } from '../packages/content-factory/grade6_common_relations_draft.mjs';
import { auditReasonedTeachingTrace, getReasonedTeachingStage } from '../packages/contracts/reasoned_teaching_trace.mjs';
import { auditReasonedMediaJob, createReasonedMediaAudioRequest } from '../packages/media/reasoned_media_job.mjs';
import { resolveReasonedMediaGeometry } from '../packages/media/reasoned_geometry_resolver.mjs';
import { renderReasonedCaptionFrame } from '../packages/media/reasoned_scene_renderer.mjs';

const api = await import('../packages/content-factory/grade6_common_relations_media_adapter.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [observations, matrix, registry] = await Promise.all(['grade6-common-relations-application-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry'].map(load));
const clone = value => structuredClone(value);
function source() { return { applicationObservations: clone(observations), semanticMatrix: clone(matrix),
  sourceRecord: clone(registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik')) }; }
function prepare(candidate, input) {
  assert.equal(typeof api.createGrade6CommonRelationsMediaPreparation, 'function', 'common-relations media adapter is missing');
  return api.createGrade6CommonRelationsMediaPreparation(candidate, input);
}
function bundle() { const input = source(); return prepare(createGrade6CommonRelationsDraft(input), input); }
const sha = value => createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
function rehash(value) {
  value.contentSha256 = sha(`k12.grade6-common-relations.draft/v1:${JSON.stringify(canonical(
    Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256'))))}`);
  return value;
}
const invalid = error => error.message === 'invalid_common_relations_media_input';

// Break: the adapter only fabricates job-shaped DTOs, loses the context link, or counts two jobs as two questions.
test('two real context narration jobs remain parts of one pending fixed draft rather than two accepted questions', () => {
  const output = bundle();
  assert.equal(output.schemaVersion, 'grade6-common-relations-media-preparation/v1');
  assert.equal(output.state, 'editor_media_preparation'); assert.equal(output.artifactAudience, 'editor_only');
  assert.deepEqual(output.contexts.map(value => value.contextId), ['repeat', 'grouping']);
  for (const context of output.contexts) {
    assert.equal(auditReasonedTeachingTrace(context.trace).structuralChecks, 'passed');
    assert.equal(auditReasonedMediaJob(context.job).jobId, context.job.id);
    assert.equal(createReasonedMediaAudioRequest(context.job).contentSha256, context.audioRequest.contentSha256);
    assert.equal(context.job.trace.id, context.trace.id);
    assert.equal(context.job.trace.contentSha256, context.trace.contentSha256);
    assert.equal(context.job.source.contentSha256, output.manifest.draftContentSha256);
    assert.equal(context.trace.source.id, 'grade6-common-relations-two-context-v1');
    assert.equal(context.trace.source.contentSha256, output.manifest.draftContentSha256);
  }
  assert.deepEqual(output.manifest.counts, { existingAuthoredDrafts: 1, contextNarrationJobs: 2,
    newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
});

// Break: a made-up generic arithmetic pass substitutes for the independent finite-horizon/divisor oracle.
test('independent numeric sets and real units stay outside the intentionally text-only generic inference', () => {
  const output = bundle();
  assert.equal(output.verification.valid, true); assert.equal(output.verification.localMathChecks, 'passed');
  assert.deepEqual(output.verification.recomputed.commonPositiveTimes, [24, 48]);
  assert.deepEqual(output.verification.recomputed.commonPositiveGroupSizes, [1, 2, 3, 4, 6, 12]);
  assert.deepEqual(output.manifest.contextSemantics, [
    { contextId: 'repeat', values: [24, 48], literalUnit: 'minute', displayUnit: 'Dakika', traceUnit: 'text' },
    { contextId: 'grouping', values: [1, 2, 3, 4, 6, 12], literalUnit: 'card_per_package', displayUnit: 'Kart/paket', traceUnit: 'text' },
  ]);
  for (const context of output.contexts) {
    assert.equal(context.trace.steps.length, 1); assert.equal(context.trace.steps[0].operation.kind, 'interpret');
    assert.equal(context.trace.steps[0].result.unit, 'text'); assert.equal(context.trace.steps[0].expression, null);
    assert.equal(context.trace.goal.unit, 'text'); assert.equal(context.traceAudit.numericStepsChecked, 0);
    assert.equal(context.traceAudit.semanticReview, 'pending');
    assert.equal(context.traceAudit.sourceBinding, 'declared_requires_source_resolver');
    const result = context.job.cues.find(cue => cue.kind === 'result').transcript;
    assert.equal(result.includes('eşittir'), false);
    assert.ok(result.includes(context.contextId === 'repeat' ? 'dakika' : 'kart/paket'));
  }
  assert.equal(output.manifest.genericNumericStepsChecked, 0); assert.equal(output.manifest.semanticReview, 'pending');
});

// Break: cue generation drops the reason/meaning/conditions or narrates a result before explaining the route.
test('both complete paths survive into real reason result check cues including all four conditional-note fields', () => {
  const input = source(), draft = createGrade6CommonRelationsDraft(input), output = prepare(draft, input);
  for (const [index, context] of output.contexts.entries()) {
    const path = draft.explanation.paths[index]; assert.deepEqual(context.path, path);
    assert.deepEqual(context.job.cues.map(cue => cue.kind), ['goal', 'evidence', 'plan', 'why', 'result',
      'check_prompt', 'check_answer', 'summary', 'transfer_prompt', 'transfer_answer']);
    assert.ok(context.job.cues[0].transcript.includes(path.goal));
    assert.ok(context.job.cues[1].transcript.includes(path.givenMeaning));
    assert.ok(context.job.cues[2].transcript.includes(path.operationMeaning));
    assert.ok(context.job.cues[2].transcript.includes(path.why));
    const allTranscript = context.job.cues.map(cue => cue.transcript).join(' ');
    for (const key of ['when', 'why', 'check', 'notImplied']) assert.ok(allTranscript.includes(path.conditionalNote[key]), key);
    assert.ok(context.job.cues[3].transcript.includes(path.why));
    assert.ok(context.job.cues[4].transcript.includes(path.resultMeaning));
    assert.equal(context.job.cues[5].thoughtPauseSeconds, 4);
    assert.equal(context.job.cues[8].thoughtPauseSeconds, 4);
    assert.equal(context.trace.scope.gradeBand, '5-6');
  }
});

// Break: only a generic final transfer is kept while the sum, window and package-count counterexamples disappear.
test('all three hand-derived transfers retain their numeric meanings in the appropriate context and narrated answer', () => {
  const [repeat, grouping] = bundle().contexts;
  assert.deepEqual(repeat.transfers.map(value => value.id), ['sum-not-common-time', 'window-boundary']);
  assert.deepEqual(grouping.transfers.map(value => value.id), ['group-size-not-count']);
  assert.deepEqual(repeat.transfers[0].remainders, [2, 6]); assert.equal(repeat.transfers[0].candidateMinute, 14);
  assert.deepEqual(repeat.transfers[1].cases, [{ minute: 0, inWindow: false, common: true },
    { minute: 48, inWindow: true, common: true }, { minute: 72, inWindow: false, common: true }]);
  assert.equal(grouping.transfers[0].groupSize, 6); assert.deepEqual(grouping.transfers[0].packageCounts, [4, 6]);
  for (const context of [repeat, grouping]) {
    const narrated = context.job.cues.at(-1).transcript;
    for (const transfer of context.transfers) assert.ok(narrated.includes(transfer.meaning));
  }
  const repeatAnswer = repeat.job.cues.at(-1).transcript;
  for (const value of ['14', '2', '6', '0', '48', '72']) assert.ok(repeatAnswer.includes(value));
  assert.ok(grouping.job.cues.at(-1).transcript.includes('6 kart/paket'));
});

// Break: a selected provider, fabricated audio attachment or declared duration becomes real speech/video evidence.
test('unselected provider and actual generic requests never permit calls attachments voice or video claims', () => {
  const output = bundle();
  for (const context of output.contexts) {
    assert.equal(context.job.provider, null); assert.equal(context.audioRequest.provider, null);
    assert.equal(context.audioRequest.providerReady, false); assert.equal(context.audioRequest.providerCallsAllowed, false);
    assert.equal(context.audioRequest.state, 'draft_only_no_provider_call');
    assert.equal(context.audioRequest.sourceSha256, output.manifest.draftContentSha256);
    assert.equal(context.audioRequest.traceSha256, context.trace.contentSha256);
    assert.equal(context.audioRequest.jobSha256, context.job.contentSha256);
    assert.equal(context.job.audioStatus, 'not_generated'); assert.equal(context.job.videoStatus, 'not_rendered');
    assert.equal(context.jobAudit.audioEvidenceAttached, false); assert.equal(context.jobAudit.audioBytesVerified, false);
    assert.equal(context.jobAudit.spokenTranscriptVerified, false); assert.equal(context.jobAudit.voiced, false);
  }
  assert.equal(output.manifest.activity.audioGenerated, 0); assert.equal(output.manifest.activity.videosRendered, 0);
  assert.equal(output.manifest.activity.providerCallsMade, 0); assert.equal(output.manifest.audioAttached, false);
  assert.equal(output.manifest.wordPenAlignmentVerified, false);
});

// Break: old rectangle resolver is made to accept this family or an editor SVG is promoted to a branded generic scene.
test('real rectangle geometry rejects this canonical family and no generic scene or caption authority is fabricated', () => {
  const input = source(), draft = createGrade6CommonRelationsDraft(input), output = prepare(draft, input);
  assert.deepEqual(output.manifest.geometryPreparation, { state: 'unsupported_common_relations_family_pending',
    genericResolverSupported: false, genericScenePlansCreated: 0, captionFramesRendered: 0,
    reason: 'unsupported_reasoned_geometry_source' });
  for (const context of output.contexts) {
    assert.throws(() => resolveReasonedMediaGeometry({ source: draft, trace: context.trace, job: context.job }),
      error => error.message === 'unsupported_reasoned_geometry_source');
    assert.throws(() => renderReasonedCaptionFrame(context.job), /untrusted_reasoned_scene_plan/u);
  }
  assert.equal(output.editorView.manifest.inlineSvgCount, 1);
});

// Break: the adapter creates a fake view manifest rather than running the existing literal SVG/table renderer.
test('the actual existing renderer preserves sixteen timeline marks and six literal group rows without changing source state', () => {
  const input = source(), draft = createGrade6CommonRelationsDraft(input), before = JSON.stringify({ input, draft });
  const output = prepare(draft, input), html = output.editorView.html;
  assert.equal(JSON.stringify({ input, draft }), before); assert.equal(draft.representation.rendered, false);
  assert.equal((html.match(/<svg\b/gu) ?? []).length, 1);
  const marks = [...html.matchAll(/<(circle|rect)\b[^>]*data-series="([^"]+)" data-minute="(\d+)"/gu)];
  assert.deepEqual(marks.filter(match => match[2] === 'six-minute').map(match => Number(match[3])), [0, 6, 12, 18, 24, 30, 36, 42, 48]);
  assert.deepEqual(marks.filter(match => match[2] === 'eight-minute').map(match => Number(match[3])), [0, 8, 16, 24, 32, 40, 48]);
  const table = /<table id="group-size-table">([\s\S]*?)<\/table>/u.exec(html)[1];
  const body = /<tbody>([\s\S]*?)<\/tbody>/u.exec(table)[1];
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/gu)].map(match => [...match[1].matchAll(/<(?:th|td)[^>]*>(\d+)<\/(?:th|td)>/gu)].map(cell => Number(cell[1])));
  assert.deepEqual(rows, [[1, 24, 36], [2, 12, 18], [3, 8, 12], [4, 6, 9], [6, 4, 6], [12, 2, 3]]);
  assert.equal(output.editorView.manifest.htmlSha256, sha(html));
  assert.equal(output.manifest.editorHtmlSha256, sha(html));
  assert.equal(output.manifest.activity.inlineSvgsProduced, 1); assert.equal(output.manifest.activity.htmlProduced, 1);
  assert.equal(output.manifest.answerBearingEditorArtifact, true); assert.equal(output.manifest.hiddenDetailsAreLearnerSecurity, false);
});

// Break: serialization copies generic live capability or a trace/view math pass sets an approval gate.
test('serialized and rehashed packets never gain trace job scene learner or human approval authority', () => {
  const output = bundle(), serialized = clone(output);
  for (const context of serialized.contexts) {
    assert.throws(() => auditReasonedTeachingTrace(context.trace), /untrusted_teaching_trace/u);
    assert.throws(() => auditReasonedMediaJob(context.job), /untrusted_reasoned_media_job/u);
    assert.throws(() => createReasonedMediaAudioRequest(context.job), /untrusted_reasoned_media_job/u);
  }
  assert.equal(output.manifest.serializedAuthority, 'none'); assert.equal(output.manifest.humanApproval, null);
  assert.equal(Object.values(output.manifest.gates).every(value => value === 'pending'), true);
  for (const key of ['learnerReady', 'publicationReady', 'productionReady', 'learnerEvidenceCollected', 'fullOutcomeCoverage',
    'voiceIdentityVerified', 'audioBytesVerified', 'nativeVisualReviewPassed', 'accessibilityPassed']) assert.equal(output.manifest[key], false);
  assert.equal(output.manifest.activeAcademicYear, null); assert.equal(output.manifest.programVersion, null);
  assert.equal(output.manifest.officialOutcomeCode, null); assert.equal(output.manifest.freshPdfByteChecks, 0);
});

// Break: output mutation or non-determinism makes stale requests appear source-compatible.
test('frozen deterministic hashes bind source trace jobs requests and separate editor output inside a bounded packet', () => {
  const output = bundle(); assert.deepEqual(bundle(), output);
  const body = Object.fromEntries(Object.entries(output).filter(([key]) => key !== 'contentSha256'));
  assert.equal(output.contentSha256, sha(`k12.grade6-common-relations.media-preparation/v1:${JSON.stringify(body)}`));
  assert.equal(Buffer.byteLength(JSON.stringify(output)) <= 131072, true);
  assert.equal(output.manifest.sourceSha256, '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734');
  assert.equal(output.manifest.applicationMetadataSha256, '3c1ccf730931f9704bd95ce5137ee0154d6b05daea6eb12c35a70bfa23b89c38');
  assert.equal(output.manifest.sourceBinding, 'canonical_metadata_binding_not_authentication_or_fresh_bytes');
  assert.equal(Object.isFrozen(output), true); assert.equal(Object.isFrozen(output.contexts[0].path.conditionalNote), true);
  assert.equal(Object.isFrozen(output.manifest.contextSemantics[1].values), true);
  assert.throws(() => { output.manifest.gates.answer = 'approved'; }, TypeError);
});

// Break: a candidate hash can validate different math, scope, process or approval and enter the orchestration chain.
test('rehashed wrong numeric sets units keys conditions and source purpose are rejected before any returned media artifact', () => {
  for (const mutate of [d => { d.answerKey.repeat = 'evidence-sum'; }, d => { d.problem.evidenceCards[0].values = [0, 24, 48]; },
    d => { d.explanation.paths[1].result = [1, 2, 3, 4, 6]; }, d => { d.explanation.paths[1].unit = 'package'; },
    d => { d.explanation.paths[0].conditionalNote.notImplied = 'Toplama yeterlidir.'; },
    d => { d.explanation.transfers[1].cases[2].inWindow = true; }, d => { d.scope.formalGcdLcmTeachingAllowed = true; },
    d => { d.purpose.evidenceKind = 'learner_constructed_proof'; }, d => { d.gates.answer = 'approved'; },
    d => { d.sourceLineage.sourceSha256 = 'f'.repeat(64); }]) {
    const input = source(), changed = clone(createGrade6CommonRelationsDraft(input)); mutate(changed); rehash(changed);
    assert.throws(() => prepare(changed, input), invalid);
  }
});

// Break: canonical source revisions are treated as claims that a caller may rehash or promote.
test('whole source snapshot and registry pins still gate every preparation with no provider or approval knobs', () => {
  const draft = createGrade6CommonRelationsDraft(source());
  for (const mutate of [s => { s.applicationObservations.boundaries.formalGcdLcmTeachingAllowed = true; },
    s => { s.applicationObservations.source.sha256 = 'f'.repeat(64); }, s => { s.semanticMatrix.source.sha256 = 'f'.repeat(64); },
    s => { s.sourceRecord.reuseRights = 'approved'; }, s => { s.provider = { id: 'extra-provider' }; },
    s => { s.sourceRecord = null; }]) {
    const input = source(); mutate(input); assert.throws(() => prepare(draft, input), invalid);
  }
});

// Break: invalid structures or markup are coerced, printed or become narration and executable HTML.
test('malformed sparse cyclic deep and oversized candidates produce only a constant rejection with no payload echo', () => {
  const input = source();
  for (const mutate of [d => { d.explanation.paths = null; }, d => { d.explanation.paths = new Array(2); },
    d => { d.explanation.transfers = [null]; }, d => { d.problem.contexts[0].window = null; },
    d => { d.prompt = '<script>private-text</script>'; }, d => { d.prompt = 'x'.repeat(65537); },
    d => { d.cycle = d; }, d => { let nested = d; for (let i = 0; i < 40; i++) { nested.extra = {}; nested = nested.extra; } }]) {
    const changed = clone(createGrade6CommonRelationsDraft(input)); mutate(changed);
    assert.throws(() => prepare(changed, input), invalid);
  }
  for (const value of [null, true, 1, 'private-text', [], {}, NaN, Infinity]) assert.throws(() => prepare(value, input), invalid);
});

// Break: accessors/proxies/coercion run before source/candidate inert checks or a valid candidate is re-read after the gate.
test('hostile source and candidate inputs invoke no hooks while safe copies retain exact canonical output', () => {
  const input = source(), draft = createGrade6CommonRelationsDraft(input); let hooks = 0;
  const getter = clone(draft); Object.defineProperty(getter, 'prompt', { enumerable: true, get() { hooks++; return 'unsafe'; } });
  const coercion = clone(draft); coercion.extra = { toString() { hooks++; return 'unsafe'; } };
  const proxy = new Proxy(draft, { get() { hooks++; throw new Error('unsafe'); }, ownKeys() { hooks++; throw new Error('unsafe'); } });
  const revoked = Proxy.revocable(draft, {}); revoked.revoke();
  for (const value of [getter, coercion, proxy, revoked.proxy]) assert.throws(() => prepare(value, input), invalid);
  const sourceGetter = source(); Object.defineProperty(sourceGetter, 'sourceRecord', { enumerable: true, get() { hooks++; return input.sourceRecord; } });
  const sourceProxy = new Proxy(input, { get() { hooks++; throw new Error('unsafe'); }, ownKeys() { hooks++; throw new Error('unsafe'); } });
  for (const value of [sourceGetter, sourceProxy]) assert.throws(() => prepare(draft, value), invalid);
  assert.equal(hooks, 0);
  const safeClone = clone(draft); assert.deepEqual(prepare(safeClone, source()), bundle());
});

// Break: a third parameter introduces style/provider/scene hooks, or missing required input is silently defaulted.
test('exact two argument adapter never accepts arbitrary provider style source driver or scene options', () => {
  assert.equal(typeof api.createGrade6CommonRelationsMediaPreparation, 'function', 'common-relations media adapter is missing');
  const input = source(), draft = createGrade6CommonRelationsDraft(input); let hooks = 0;
  const extra = new Proxy({}, { get() { hooks++; throw new Error('unsafe'); }, ownKeys() { hooks++; throw new Error('unsafe'); } });
  for (const args of [[], [draft], [draft, input, extra], [draft, input, { provider: 'paid', scene: 'rectangle' }]]) {
    assert.throws(() => api.createGrade6CommonRelationsMediaPreparation(...args),
      error => error.message === 'invalid_common_relations_media_arguments');
  }
  assert.equal(hooks, 0);
});

// Break: source JSON/rendered flags are consumed as learner state or generic stage reveal is mistaken for saved mastery.
test('generic review reveal exposes only authored text and never records learner answers or delivery approval', () => {
  const output = bundle();
  for (const context of output.contexts) {
    const locked = getReasonedTeachingStage(context.trace, { stageIndex: 3, reveal: false });
    assert.equal(locked.result, null); assert.equal(locked.canAdvance, false);
    const shown = getReasonedTeachingStage(context.trace, { stageIndex: 3, reveal: true });
    assert.equal(shown.result.unit, 'text'); assert.equal(shown.publicationReady, false);
    assert.equal(context.trace.learnerEvidence, 'none_collected'); assert.equal(context.job.learnerEvidence, 'none_collected');
    assert.equal(context.trace.sourceBinding, 'declared_requires_source_resolver');
  }
  assert.equal(output.manifest.learnerEvidenceCollected, false); assert.equal(output.manifest.answerBearingEditorArtifact, true);
});
