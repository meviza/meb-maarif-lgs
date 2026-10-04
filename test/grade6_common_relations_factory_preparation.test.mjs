import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { auditReasonedTeachingTrace } from '../packages/contracts/reasoned_teaching_trace.mjs';
import { auditReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio } from '../packages/media/reasoned_media_job.mjs';
import { renderGrade6CommonRelationsCaptionFrame } from '../packages/media/grade6_common_relations_scene.mjs';
import { renderGrade6CommonRelationsReview } from '../packages/media/grade6_common_relations_review.mjs';
import { resolveReasonedMediaGeometry } from '../packages/media/reasoned_geometry_resolver.mjs';

const api = await import('../packages/content-factory/grade6_common_relations_factory_preparation.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [applicationObservations, semanticMatrix, registry] = await Promise.all([
  'grade6-common-relations-application-observations', 'grade6-source-semantic-candidate-matrix', 'meb-reference-registry',
].map(load));
const sha = value => createHash('sha256').update(value).digest('hex');
const bytes = value => Buffer.byteLength(JSON.stringify(value));
const source = () => structuredClone({ applicationObservations, semanticMatrix,
  sourceRecord: registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') });
function prepare(...args) {
  assert.equal(typeof api.createGrade6CommonRelationsFactoryPreparation, 'function', 'common-relations factory preparation API is missing');
  return api.createGrade6CommonRelationsFactoryPreparation(...args);
}
const invalid = error => error.message === 'invalid_common_relations_factory_input';
const arity = error => error.message === 'invalid_common_relations_factory_arguments';
const kinds = ['goal', 'evidence', 'plan', 'why', 'result', 'check_prompt', 'check_answer', 'summary', 'transfer_prompt', 'transfer_answer'];
const decode = text => text.replace(/&(?:amp|lt|gt|quot|apos|#39);/gu, value =>
  ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'" })[value]);

// Break: the factory manufactures job-shaped DTOs or silently routes this task through the rectangle batch.
test('one existing draft enters the actual branded trace job scene and default-frame consumers', () => {
  const output = prepare(source());
  assert.deepEqual(Object.keys(output), ['schemaVersion', 'state', 'draft', 'verification', 'preparation', 'scenePlan', 'initialFrame', 'initialReview', 'manifest']);
  assert.equal(output.schemaVersion, 'grade6-common-relations-factory-preparation/v1');
  assert.equal(output.state, 'editor_factory_preparation');
  assert.deepEqual(output.preparation.contexts.map(context => context.contextId), ['repeat', 'grouping']);
  for (const context of output.preparation.contexts) {
    assert.equal(auditReasonedTeachingTrace(context.trace).structuralChecks, 'passed');
    assert.equal(auditReasonedMediaJob(context.job).jobId, context.job.id);
    assert.equal(createReasonedMediaAudioRequest(context.job).contentSha256, context.audioRequest.contentSha256);
    assert.deepEqual(context.job.cues.map(cue => cue.kind), kinds);
  }
  assert.equal(renderGrade6CommonRelationsCaptionFrame(output.scenePlan, {}).frame.contentSha256, output.initialFrame.frame.contentSha256);
  assert.equal(renderGrade6CommonRelationsReview(output.scenePlan, {}).html, output.initialReview.html);
  assert.deepEqual(output.manifest.counts, { existingAuthoredDrafts: 1, contextNarrationJobs: 2,
    newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
});

// Break: generic count/cm arithmetic or package counts replace the independent finite-set oracle.
test('hand-derived finite sets preserve minute card-per-package and package meanings', () => {
  const output = prepare(source());
  assert.equal(output.verification.valid, true); assert.equal(output.verification.localMathChecks, 'passed');
  assert.deepEqual(output.verification.recomputed.commonPositiveTimes, [24, 48]);
  assert.deepEqual(output.verification.recomputed.commonPositiveGroupSizes, [1, 2, 3, 4, 6, 12]);
  assert.deepEqual(output.verification.recomputed.packageCountsAtExampleSize, [4, 6]);
  assert.deepEqual(output.manifest.literalUnits, ['minute', 'card_per_package', 'package']);
  assert.deepEqual(output.manifest.bindings.contexts.map(row => row.literalUnits), [['minute'], ['card_per_package', 'package']]);
  assert.equal(output.manifest.genericNumericStepsChecked, 0); assert.equal(output.manifest.semanticReview, 'pending');
  assert.deepEqual(output.draft.problem.contexts[0].window, { from: 0, fromInclusive: false, to: 48, toInclusive: true });
  assert.equal(output.draft.purpose.learnerEvidenceCollected, false);
  assert.equal(output.draft.purpose.fullOutcomeEvidenceFulfilled, false);
});

// Break: orchestration drops rationale/conditions/transfer or changes canonical media to pretend generic support.
test('both complete paths and all three transfers survive without rewriting the upstream pending snapshot', () => {
  const output = prepare(source());
  assert.deepEqual(output.preparation.contexts.map(context => context.path), output.draft.explanation.paths);
  assert.deepEqual(output.preparation.contexts.flatMap(context => context.transfers).map(row => row.id),
    ['sum-not-common-time', 'window-boundary', 'group-size-not-count']);
  for (const context of output.preparation.contexts) {
    const transcript = context.job.cues.map(cue => cue.transcript).join(' ');
    for (const field of ['when', 'why', 'check', 'notImplied']) assert.ok(transcript.includes(context.path.conditionalNote[field]));
    assert.ok(transcript.includes(context.path.why)); assert.ok(transcript.includes(context.path.resultMeaning));
    assert.throws(() => resolveReasonedMediaGeometry({ source: output.draft, trace: context.trace, job: context.job }),
      error => error.message === 'unsupported_reasoned_geometry_source');
  }
  assert.equal(output.preparation.manifest.geometryPreparation.genericResolverSupported, false);
  assert.equal(output.preparation.manifest.geometryPreparation.captionFramesRendered, 0);
  assert.equal(output.manifest.geometryPreparation.genericResolverSupported, false);
  assert.equal(output.manifest.geometryPreparation.specializedScenePrepared, true);
  assert.equal(output.draft.representation.rendered, false);
});

// Break: the default preview embeds all future cues, chooses a result, loses source geometry or fabricates responsive acceptance.
test('initial preview is current goal only with real literal given geometry and separate caption', () => {
  const output = prepare(source()), { frame, narrationPacket } = output.initialFrame, html = output.initialReview.html;
  assert.equal(frame.contextId, 'repeat'); assert.equal(frame.kind, 'goal'); assert.equal(frame.cueIndex, 0);
  assert.equal(frame.pageIndex, 0); assert.equal(frame.progress, 0); assert.equal(frame.revealRequested, false);
  assert.equal(frame.result, null); assert.deepEqual(frame.highlight.paths, []);
  const paragraph = /<p id="current-caption"[^>]*>([\s\S]*?)<\/p>/u.exec(html);
  assert.ok(paragraph); assert.equal(decode(paragraph[1]), frame.selectedPage.lines.join(' '));
  assert.equal(narrationPacket.fullTranscript, output.preparation.contexts[0].job.cues[0].transcript);
  for (const context of output.preparation.contexts) for (const cue of context.job.cues.slice(1)) {
    assert.equal(html.includes(cue.transcript), false);
  }
  const marks = [...html.matchAll(/<(circle|rect)\b[^>]*data-series="([^"]+)" data-minute="(\d+)"/gu)];
  assert.deepEqual(marks.filter(row => row[2] === 'six-minute').map(row => Number(row[3])), [0, 6, 12, 18, 24, 30, 36, 42, 48]);
  assert.deepEqual(marks.filter(row => row[2] === 'eight-minute').map(row => Number(row[3])), [0, 8, 16, 24, 32, 40, 48]);
  assert.equal(output.initialReview.manifest.captionOutsideGeometryScroll, true);
  assert.equal(output.initialReview.manifest.responsiveLayoutVerified, false);
  assert.equal(output.manifest.current.futureTranscriptsIncluded, false);
  assert.equal(output.manifest.manifestTranscriptText, false);
  for (const context of output.preparation.contexts) for (const cue of context.job.cues) assert.equal(JSON.stringify(output.manifest).includes(cue.transcript), false);
});

// Break: the factory returns a different/untrusted scene or answer-bearing frame that bypasses explicit reveal.
test('real returned scene retains all protected response locks and separate transfer-pending rendering', () => {
  const output = prepare(source());
  for (const context of output.preparation.contexts) for (const cue of context.job.cues.filter(row => ['result', 'check_answer', 'summary', 'transfer_answer'].includes(row.kind))) {
    for (const [progress, reveal] of [[0, false], [.5, false], [1, false], [0, true], [.5, true], [.999999, true]]) {
      const { frame, narrationPacket } = renderGrade6CommonRelationsCaptionFrame(output.scenePlan,
        { contextId: context.contextId, cueIndex: cue.order, progress, reveal });
      assert.equal(frame.responseLocked, true); assert.equal(frame.result, null);
      assert.equal(frame.fullTranscriptSha256, null); assert.equal(narrationPacket.fullTranscript, null);
      assert.deepEqual(frame.highlight.paths, []); assert.equal(frame.svg.includes(cue.transcript), false);
    }
    assert.equal(renderGrade6CommonRelationsCaptionFrame(output.scenePlan,
      { contextId: context.contextId, cueIndex: cue.order, progress: 1, reveal: true }).frame.responseLocked, false);
  }
  for (const contextId of ['repeat', 'grouping']) for (const cueIndex of [8, 9]) {
    const review = renderGrade6CommonRelationsReview(output.scenePlan, { contextId, cueIndex, progress: 1, reveal: true });
    assert.equal(review.manifest.geometryRendered, false); assert.equal(review.manifest.sourceDiagramProof, false);
    assert.equal(review.manifest.sourceVisualId, null); assert.equal(/<svg\b|<table\b/u.test(review.html), false);
  }
});

// Break: metadata-only or byte accounting hashes are presented as human approval/provider execution/stock.
test('human publication media and learner claims remain closed with explicit editor-only distinctions', () => {
  const output = prepare(source()), manifest = output.manifest;
  assert.equal(manifest.artifactAudience, 'editor_only'); assert.equal(manifest.answerBearingEditorArtifact, true);
  assert.equal(manifest.currentOnlyPreview, true); assert.equal(manifest.hiddenDetailsAreLearnerSecurity, false);
  assert.equal(manifest.serializedAuthority, 'none'); assert.equal(manifest.humanApproval, null);
  assert.deepEqual(manifest.gates, { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending',
    difficulty: 'pending', answer: 'pending', accessibility: 'pending' });
  for (const key of ['publicationReady', 'learnerReady', 'productionReady', 'learnerEvidenceCollected', 'audioGenerated',
    'videoRendered', 'wordPenAlignmentVerified', 'responsiveLayoutVerified', 'accessibilityPassed']) assert.equal(manifest[key], false);
  assert.equal(manifest.activity.providerCallsMade, 0); assert.equal(manifest.activity.audioGenerated, 0);
  assert.equal(manifest.activity.videosRendered, 0);
  for (const context of output.preparation.contexts) {
    assert.equal(context.job.provider, null); assert.equal(context.audioRequest.providerCallsAllowed, false);
    assert.throws(() => attachReasonedMediaAudio(context.job, {}), /media_provider_not_selected/u);
  }
});

// Break: a mutable/serialized copy gains issuance authority or caller mutation influences already-prepared current output.
test('deep freeze and real downstream clone rejection preserve live capability boundaries', () => {
  const input = source(), before = JSON.stringify(input), output = prepare(input);
  assert.equal(JSON.stringify(input), before);
  assert.equal(Object.isFrozen(output), true); assert.equal(Object.isFrozen(output.manifest.bindings.contexts[0].job), true);
  assert.throws(() => { output.manifest.gates.answer = 'approved'; }, TypeError);
  const clone = structuredClone(output);
  for (const context of clone.preparation.contexts) {
    assert.throws(() => auditReasonedTeachingTrace(context.trace), /untrusted_teaching_trace/u);
    assert.throws(() => auditReasonedMediaJob(context.job), /untrusted_reasoned_media_job/u);
  }
  assert.throws(() => renderGrade6CommonRelationsCaptionFrame(clone.scenePlan, {}), /untrusted_common_relations_scene_plan/u);
  input.sourceRecord.reuseRights = 'approved';
  assert.equal(renderGrade6CommonRelationsReview(output.scenePlan, {}).html, output.initialReview.html);
  assert.equal(output.draft.gates.rights, 'pending');
});

// Break: manifest hashes/bytes refer to stale components, omit a request, or claim output budgets not actually enforced.
test('manifest binds actual component bytes identities current cursor and a bounded deterministic editor packet', () => {
  const output = prepare(source()), manifest = output.manifest;
  assert.deepEqual(prepare(source()), output);
  assert.equal(manifest.sourceLineage.sourceSha256, '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734');
  assert.equal(manifest.sourceLineage.applicationMetadataSha256, '3c1ccf730931f9704bd95ce5137ee0154d6b05daea6eb12c35a70bfa23b89c38');
  for (const key of ['draft', 'verification', 'preparation', 'scenePlan', 'initialFrame', 'initialReview']) {
    assert.equal(manifest.componentBytes[key], bytes(output[key]));
  }
  assert.equal(manifest.bindings.draft.contentSha256, output.draft.contentSha256);
  assert.equal(manifest.bindings.draft.authoredTaskSha256, output.draft.authoredTaskSha256);
  assert.equal(manifest.bindings.verification.jsonSha256, sha(JSON.stringify(output.verification)));
  assert.equal(manifest.bindings.preparation.contentSha256, output.preparation.contentSha256);
  for (const [index, context] of output.preparation.contexts.entries()) {
    const binding = manifest.bindings.contexts[index];
    assert.equal(binding.trace.contentSha256, context.trace.contentSha256); assert.equal(binding.trace.byteLength, bytes(context.trace));
    assert.equal(binding.job.contentSha256, context.job.contentSha256); assert.equal(binding.job.byteLength, bytes(context.job));
    assert.equal(binding.audioRequest.contentSha256, context.audioRequest.contentSha256);
    assert.equal(binding.audioRequest.byteLength, bytes(context.audioRequest));
  }
  assert.equal(manifest.bindings.scenePlan.contentSha256, output.scenePlan.contentSha256);
  assert.equal(manifest.bindings.initialFrame.contentSha256, output.initialFrame.frame.contentSha256);
  assert.equal(manifest.bindings.initialFrame.svgSha256, sha(output.initialFrame.frame.svg));
  assert.equal(manifest.bindings.initialFrame.narrationPacketSha256, output.initialFrame.narrationPacket.contentSha256);
  assert.equal(manifest.bindings.initialReview.manifestContentSha256, output.initialReview.manifest.contentSha256);
  assert.equal(manifest.bindings.initialReview.htmlSha256, sha(output.initialReview.html));
  assert.equal(manifest.componentBytes.html, Buffer.byteLength(output.initialReview.html));
  assert.equal(manifest.componentBytes.frameSvg, Buffer.byteLength(output.initialFrame.frame.svg));
  const body = Object.fromEntries(Object.entries(manifest).filter(([key]) => key !== 'contentSha256'));
  assert.equal(manifest.contentSha256, sha(`k12.grade6-common-relations.factory-manifest/v1:${JSON.stringify(body)}`));
  assert.ok(bytes(output) <= 524288); assert.ok(bytes(manifest) <= 16384); assert.ok(Buffer.byteLength(output.initialReview.html) <= 65536);
});

// Break: ignored arity/options enable caller source/plan/provider/reveal routing or leak payload errors.
test('exact arity and closed three-field source data reject arbitrary options without coercion', () => {
  assert.throws(() => prepare(), arity); assert.throws(() => prepare(source(), {}), arity);
  for (const value of [undefined, null, true, 6, 'source', [], {}, { applicationObservations, semanticMatrix },
    { ...source(), provider: 'tts' }, { ...source(), reveal: true }, { ...source(), scenePlan: {} }, { ...source(), path: '/private' }]) {
    assert.throws(() => prepare(value), invalid);
  }
});

// Break: rehashed metadata becomes authorization, active program or permission for different numbers/content.
test('whole source pins reject rehashed source scope process unit and approval alterations', () => {
  for (const mutate of [input => { input.applicationObservations.boundaries.formalGcdLcmTeachingAllowed = true; },
    input => { input.applicationObservations.outputBinding.code = 'MAT.6.1.3'; },
    input => { input.applicationObservations.observations[0].items.push({ question: 'new stock' }); },
    input => { input.semanticMatrix.outcomes[0] = null; }, input => { input.sourceRecord.reuseRights = 'approved'; },
    input => { input.sourceRecord.download.sha256 = '0'.repeat(64); }, input => { input.sourceRecord.grades = [7]; }]) {
    const input = source(); mutate(input);
    input.applicationObservations.contentSha256 = sha(JSON.stringify(Object.fromEntries(Object.entries(input.applicationObservations).filter(([key]) => key !== 'contentSha256'))));
    assert.throws(() => prepare(input), invalid);
  }
});

// Break: input copying invokes a hook or consumes accessor, proxy, hidden/symbol key, cycles or sparse arrays before rejection.
test('hostile source objects are denied without any caller getter proxy coercion or serialization hook', () => {
  let hooks = 0; const hook = () => { hooks++; throw new Error('sensitive hook'); };
  const getter = source(); Object.defineProperty(getter, 'sourceRecord', { get: hook, enumerable: true });
  const nestedGetter = source(); Object.defineProperty(nestedGetter.sourceRecord, 'id', { get: hook, enumerable: true });
  const proxy = new Proxy(source(), { ownKeys: hook, get: hook, getPrototypeOf: hook });
  const nestedProxy = source(); nestedProxy.sourceRecord = new Proxy(nestedProxy.sourceRecord, { ownKeys: hook, get: hook });
  const revoked = Proxy.revocable(source(), {}); revoked.revoke();
  const hidden = source(); Object.defineProperty(hidden, 'provider', { value: 'secret', enumerable: false });
  const symbol = source(); symbol[Symbol('approval')] = true;
  const cycle = source(); cycle.sourceRecord.cycle = cycle;
  const sparse = source(); delete sparse.sourceRecord.grades[0];
  const coercion = source(); coercion.sourceRecord.id = { toString: hook, valueOf: hook, toJSON: hook };
  const json = source(); json.toJSON = hook;
  for (const input of [getter, nestedGetter, proxy, nestedProxy, revoked.proxy, hidden, symbol, cycle, sparse, coercion, json]) assert.throws(() => prepare(input), invalid);
  assert.equal(hooks, 0);
});

// Break: long own keys, too many keys, depth, nodes, bytes or malformed number values escape the inert budget.
test('bounded key value depth array and number profiles fail closed before canonical artifacts are returned', () => {
  const longKey = source(); longKey['k'.repeat(1025)] = true;
  const many = source(); many.sourceRecord.extra = Object.fromEntries(Array.from({ length: 1025 }, (_, index) => [`k${index}`, index]));
  const deep = source(); let child = deep; for (let index = 0; index < 26; index++) child = child.extra = {};
  const huge = source(); huge.sourceRecord.extra = 'x'.repeat(65537);
  const aggregate = source(); aggregate.sourceRecord.extra = Array.from({ length: 40 }, () => 'x'.repeat(65536));
  const longArray = source(); longArray.sourceRecord.extra = Array.from({ length: 2049 }, () => null);
  for (const input of [longKey, many, deep, huge, aggregate, longArray]) assert.throws(() => prepare(input), invalid);
  for (const number of [NaN, Infinity, -Infinity, 1e10]) {
    const input = source(); input.sourceRecord.extra = number; assert.throws(() => prepare(input), invalid);
  }
});

// Break: accepting an inert reordered/null-prototype source snapshot is confused with arbitrary serialized live-plan authority.
test('equivalent inert metadata key ordering remains accepted but does not mint human or learner authority', () => {
  const reorder = value => Array.isArray(value) ? value.map(reorder) : value && typeof value === 'object'
    ? Object.assign(Object.create(null), Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reorder(item)]))) : value;
  const output = prepare(reorder(source()));
  assert.equal(output.verification.valid, true); assert.equal(output.manifest.serializedAuthority, 'none');
  assert.equal(output.manifest.learnerReady, false); assert.equal(output.manifest.gates.activeProgram, 'pending');
});
