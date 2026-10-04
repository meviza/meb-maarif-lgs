import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6CommonRelationsFactoryPreparation } from '../content-factory/grade6_common_relations_factory_preparation.mjs';
import { auditReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';
import { createReasonedMediaJob, createReasonedMediaAudioRequest, auditReasonedMediaJob } from './reasoned_media_job.mjs';
import { renderGrade6CommonRelationsCaptionFrame } from './grade6_common_relations_scene.mjs';

const BRIDGES = new WeakSet(), AUDITS = new WeakMap();
const INPUT_ERROR = 'invalid_common_relations_voice_bridge_input';
const fail = code => { throw new Error(code); };
const sha = text => createHash('sha256').update(text).digest('hex');
const bytes = value => Buffer.byteLength(JSON.stringify(value));
const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
};
const canonical = value => JSON.stringify(value, function (key, item) {
  return item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(name => [name, item[name]])) : item;
});
const same = (left, right) => canonical(left) === canonical(right);

// Inspect descriptors, prototypes and all own key/value bytes before reading
// the original capabilities. A JSON-shaped caller hash is never an issuer.
function snapshot(input) {
  const visiting = new WeakSet(); let nodes = 0, byteLength = 0;
  function copy(value, depth = 0) {
    if (++nodes > 100000 || depth > 24) fail(INPUT_ERROR);
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail(INPUT_ERROR);
      return value;
    }
    if (typeof value === 'string') {
      byteLength += Buffer.byteLength(value);
      if (value.length > 65536 || byteLength > 2097152 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail(INPUT_ERROR);
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail(INPUT_ERROR);
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value), keys = Reflect.ownKeys(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail(INPUT_ERROR);
    if (keys.length > (array ? 2049 : 1024)) fail(INPUT_ERROR);
    for (const key of keys) {
      if (typeof key !== 'string' || key.length > 160 || /[\u0000-\u001f]/u.test(key)) fail(INPUT_ERROR);
      byteLength += Buffer.byteLength(key); if (byteLength > 2097152) fail(INPUT_ERROR);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (keys.some(key => !Object.hasOwn(descriptors[key], 'value') || !descriptors[key].enumerable && !(array && key === 'length'))) fail(INPUT_ERROR);
    if (depth === 0 && (array || keys.length !== 4 || !['factoryPreparation', 'sourceBindingInput', 'contextId', 'voiceJob']
      .every(key => Object.hasOwn(descriptors, key)))) fail(INPUT_ERROR);
    visiting.add(value); let output;
    if (array) {
      const length = descriptors.length.value;
      if (length > 2048 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail(INPUT_ERROR);
      output = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail(INPUT_ERROR);
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else output = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return output;
  }
  return copy(input);
}

/** Pure answer-bearing editor bridge, not a TTS call or a learner payload.
 * Factory wrapper provenance is not asserted: canonical data plus the original
 * live issued child capabilities are required. Same ID is not same job hash. */
export function createGrade6CommonRelationsVoiceBridge(input) {
  if (arguments.length !== 1) fail('invalid_common_relations_voice_bridge_arguments');
  let draft, factory, selected, visual, voice, original, voiceAudit, contextId;
  try {
    const inert = snapshot(input);
    contextId = inert.contextId;
    if (!['repeat', 'grouping'].includes(contextId)) fail(INPUT_ERROR);
    // Only after all hostile-object checks: these are the actual caller-held
    // capabilities, not the copies that canonical reconstruction will issue.
    original = input.factoryPreparation;
    for (const context of original.preparation.contexts) {
      auditReasonedTeachingTrace(context.trace); auditReasonedMediaJob(context.job);
      if (!same(createReasonedMediaAudioRequest(context.job), context.audioRequest)) fail(INPUT_ERROR);
    }
    renderGrade6CommonRelationsCaptionFrame(original.scenePlan, { contextId });
    voiceAudit = auditReasonedMediaJob(input.voiceJob);
    factory = createGrade6CommonRelationsFactoryPreparation(inert.sourceBindingInput);
    if (!same(inert.factoryPreparation, factory)) fail(INPUT_ERROR);
    selected = factory.preparation.contexts.find(context => context.contextId === contextId);
    if (inert.voiceJob.provider === null || voiceAudit.cueCount !== 10) fail(INPUT_ERROR);
    // Declared metadata is later copied to a current-cue request. Isolate exact
    // known cue references from BOTH canonical contexts before issuing a bridge.
    // This is not a semantic/fragment/encoded-text privacy or prompt classifier.
    const metadata = [inert.voiceJob.style.text, ...['id', 'modelId', 'voiceId'].map(key => inert.voiceJob.provider[key])];
    for (const context of factory.preparation.contexts) for (const cue of context.job.cues) {
      if (metadata.some(value => value.includes(cue.transcript) || value.toLowerCase().includes(cue.transcriptSha256))) fail(INPUT_ERROR);
    }
    const expectedVoice = createReasonedMediaJob(selected.trace, { provider: inert.voiceJob.provider, style: inert.voiceJob.style.text });
    const expectedRequest = createReasonedMediaAudioRequest(expectedVoice);
    if (!same(inert.voiceJob, expectedVoice)) fail(INPUT_ERROR);
    const voiceRequest = createReasonedMediaAudioRequest(input.voiceJob);
    if (!same(voiceRequest, expectedRequest)) fail(INPUT_ERROR);
    const originalContext = original.preparation.contexts.find(context => context.contextId === contextId);
    // Issued trace/job semantics are bound by canonical equality, not by an
    // inaccessible claim about which trace object a job creator once received.
    const cueMeaning = cue => ({ id: cue.id, order: cue.order, kind: cue.kind, stepId: cue.stepId,
      transcript: cue.transcript, transcriptSha256: cue.transcriptSha256,
      displayAnchorIds: cue.displayAnchorIds, thoughtPauseSeconds: cue.thoughtPauseSeconds });
    if (originalContext.job.cues.length !== 10 || !same(originalContext.job.cues.map(cueMeaning), input.voiceJob.cues.map(cueMeaning))) fail(INPUT_ERROR);
    draft = factory.draft;
    visual = { scenePlan: original.scenePlan, trace: originalContext.trace, job: originalContext.job, request: originalContext.audioRequest };
    voice = { job: input.voiceJob, request: voiceRequest };
  } catch { fail(INPUT_ERROR); }

  const counts = { existingAuthoredTasks: 1, selectedContexts: 1, visualJobs: 1, voiceVariants: 1,
    newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 };
  const literalUnits = contextId === 'repeat' ? ['minute'] : ['card_per_package', 'package'];
  const binding = {
    schemaVersion: 'grade6-common-relations-voice-binding/v1', state: 'canonical_editor_binding',
    source: { id: draft.id, contentSha256: draft.contentSha256 }, sourceLineage: draft.sourceLineage, program: draft.scope,
    authoredTaskSha256: draft.authoredTaskSha256, factoryManifestSha256: factory.manifest.contentSha256,
    preparationSha256: factory.preparation.contentSha256, scenePlanSha256: visual.scenePlan.contentSha256,
    geometrySha256: visual.scenePlan.geometrySha256, trace: { id: visual.trace.id, contentSha256: visual.trace.contentSha256 },
    visualJob: { id: visual.job.id, contentSha256: visual.job.contentSha256, requestSha256: visual.request.contentSha256 },
    voiceJob: { id: voice.job.id, contentSha256: voice.job.contentSha256, requestSha256: voice.request.contentSha256 },
    style: { visualSha256: visual.job.style.sha256, voiceSha256: voice.job.style.sha256 }, provider: { ...voice.job.provider }, literalUnits,
    cueCount: 10, cueMappings: voice.job.cues.map((cue, index) => ({ cueId: cue.id, order: cue.order, kind: cue.kind, stepId: cue.stepId,
      transcriptSha256: cue.transcriptSha256, visualStyleSha256: visual.job.cues[index].styleSha256, voiceStyleSha256: cue.styleSha256,
      displayAnchorIds: [...cue.displayAnchorIds], thoughtPauseSeconds: cue.thoughtPauseSeconds })),
    plannedThinkingPauseSeconds: voice.job.cues.reduce((total, cue) => total + cue.thoughtPauseSeconds, 0),
    mathematicalWitness: { commonPositiveTimes: [...factory.verification.recomputed.commonPositiveTimes],
      commonPositiveGroupSizes: [...factory.verification.recomputed.commonPositiveGroupSizes],
      packageCountsAtExampleSize: [...factory.verification.recomputed.packageCountsAtExampleSize], localMathChecks: factory.verification.localMathChecks },
    counts, gates: { ...draft.gates }, manifestTranscriptText: false,
  };
  binding.contentSha256 = sha(`k12.grade6-common-relations.voice-binding/v1:${JSON.stringify(binding)}`);
  const limits = {
    artifactAudience: 'editor_only', answerBearingEditorArtifact: true, currentOnlyPayload: false, serializedAuthority: 'none',
    factoryWrapperIssuanceVerified: false, childCapabilitiesIssued: true, bridgeIssuanceScope: 'local_capability_only_not_authorization',
    sourceMetadataPinned: true, freshPdfByteChecks: 0, sourceFilesRead: 0, sourceResolverImplemented: false,
    genericResolverSupported: false, specializedScenePrepared: true, genericNumericStepsChecked: 0, semanticReview: 'pending',
    providerDeclarationOnly: true, endpointVerified: false, privacyInspectionPassed: false, styleApproved: false,
    providerCallsMade: 0, providerCallsAllowed: false, ttsCallsMade: 0, audioGenerated: false, videoRendered: false,
    audioBytesVerified: false, spokenTranscriptVerified: false, voiceIdentityVerified: false,
    measuredSpeechSeconds: null, wordPenAlignmentVerified: false, captionAudioSyncVerified: false, playbackReady: false,
    ownerReview: 'pending', rightsReview: 'pending', listenerReview: 'pending',
    learnerEvidenceCollected: false, humanApproval: null, learnerReady: false, publicationReady: false, productionReady: false,
  };
  const pending = [...new Set([...factory.manifest.pending, ...factory.preparation.manifest.pending, ...visual.job.pending, ...voice.job.pending,
    'active_program_and_curriculum_review', 'teacher_rationale_and_age_review', 'rights_owner_steward_retention_review',
    'provider_endpoint_privacy_and_declared_style_review', 'audio_bytes_spoken_text_and_listener_review',
    'video_render_and_word_pen_alignment', 'generic_geometry_resolver_unsupported', 'transfer_geometry_not_in_source', 'student_delivery_authorization'])];
  const bridge = { schemaVersion: 'grade6-common-relations-voice-bridge/v1', state: 'editor_voice_bridge_preparation',
    contextId, visual, voice, binding, limits, pending };
  const metadata = { schemaVersion: 'grade6-common-relations-voice-bridge-audit/v1', state: 'editor_voice_bridge_audit', valid: true,
    contextId, bridgeContentSha256: sha(`k12.grade6-common-relations.voice-bridge/v1:${JSON.stringify(bridge)}`), binding, limits, pending };
  if (bytes(bridge) > 524288 || bytes(binding) > 16384 || bytes(metadata) > 16384) fail('common_relations_voice_bridge_output_budget');
  freeze(bridge); freeze(metadata); BRIDGES.add(bridge); AUDITS.set(bridge, metadata); return bridge;
}

/** Local bridge issuance only. No endpoint, rights, privacy or student auth. */
export function auditGrade6CommonRelationsVoiceBridge(bridge) {
  if (arguments.length !== 1) fail('invalid_common_relations_voice_bridge_arguments');
  if (!bridge || typeof bridge !== 'object' || isProxy(bridge) || !BRIDGES.has(bridge)) fail('untrusted_common_relations_voice_bridge');
  return AUDITS.get(bridge);
}
