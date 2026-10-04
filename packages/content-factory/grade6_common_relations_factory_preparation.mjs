import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6CommonRelationsDraft, verifyGrade6CommonRelationsDraft } from './grade6_common_relations_draft.mjs';
import { createGrade6CommonRelationsMediaPreparation } from './grade6_common_relations_media_adapter.mjs';
import { createGrade6CommonRelationsScenePlan, renderGrade6CommonRelationsCaptionFrame } from '../media/grade6_common_relations_scene.mjs';
import { renderGrade6CommonRelationsReview } from '../media/grade6_common_relations_review.mjs';

const fail = code => { throw new Error(code); };
const sha = text => createHash('sha256').update(text).digest('hex');
const jsonBytes = value => Buffer.byteLength(JSON.stringify(value));
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

// A bounded inert snapshot precedes the existing canonical metadata-pin gate.
// No file/transport/provider hook, caller scene, options or serialized authority.
function sourceSnapshot(input) {
  const visiting = new WeakSet(); let nodes = 0, byteLength = 0;
  function copy(value, depth = 0) {
    if (++nodes > 100000 || depth > 24) fail('invalid_common_relations_factory_input');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail('invalid_common_relations_factory_input');
      return value;
    }
    if (typeof value === 'string') {
      byteLength += Buffer.byteLength(value);
      if (value.length > 65536 || byteLength > 2097152 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_common_relations_factory_input');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('invalid_common_relations_factory_input');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value), keys = Reflect.ownKeys(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail('invalid_common_relations_factory_input');
    if (keys.length > (array ? 2049 : 1024)) fail('invalid_common_relations_factory_input');
    for (const key of keys) {
      if (typeof key !== 'string' || key.length > 160 || /[\u0000-\u001f]/u.test(key)) fail('invalid_common_relations_factory_input');
      byteLength += Buffer.byteLength(key);
      if (byteLength > 2097152) fail('invalid_common_relations_factory_input');
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (keys.some(key => !Object.hasOwn(descriptors[key], 'value') || !descriptors[key].enumerable && !(array && key === 'length'))) fail('invalid_common_relations_factory_input');
    if (depth === 0 && (array || keys.length !== 3
      || !['applicationObservations', 'semanticMatrix', 'sourceRecord'].every(key => Object.hasOwn(descriptors, key)))) fail('invalid_common_relations_factory_input');
    visiting.add(value); let output;
    if (array) {
      const length = descriptors.length.value;
      if (length > 2048 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_common_relations_factory_input');
      output = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_common_relations_factory_input');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else output = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return output;
  }
  return copy(input);
}

/** One full answer-bearing editor packet, with a separate current-only preview.
 * Specialized scene support does not rewrite the upstream generic pending state.
 * No filesystem, model, TTS, audio attachment, video, student or publication call. */
export function createGrade6CommonRelationsFactoryPreparation(sourceBindingInput) {
  if (arguments.length !== 1) fail('invalid_common_relations_factory_arguments');
  let draft, verification, preparation, scenePlan, initialFrame, initialReview;
  try {
    const input = sourceSnapshot(sourceBindingInput);
    // All subsequent reads are of our inert snapshot or canonical live artifacts.
    draft = createGrade6CommonRelationsDraft(input);
    verification = verifyGrade6CommonRelationsDraft(draft, input);
    if (!verification.valid) fail('invalid_common_relations_factory_input');
    preparation = createGrade6CommonRelationsMediaPreparation(draft, input);
    scenePlan = createGrade6CommonRelationsScenePlan({ source: draft, sourceBindingInput: input, preparation });
    initialFrame = renderGrade6CommonRelationsCaptionFrame(scenePlan, {});
    initialReview = renderGrade6CommonRelationsReview(scenePlan, {});
  } catch { fail('invalid_common_relations_factory_input'); }

  const frame = initialFrame.frame, narrationPacket = initialFrame.narrationPacket;
  const componentBytes = Object.fromEntries(Object.entries({ draft, verification, preparation, scenePlan, initialFrame, initialReview })
    .map(([key, value]) => [key, jsonBytes(value)]));
  componentBytes.html = Buffer.byteLength(initialReview.html);
  componentBytes.frameSvg = Buffer.byteLength(frame.svg);
  if (componentBytes.html > 65536) fail('common_relations_factory_output_budget');
  const manifest = {
    schemaVersion: 'grade6-common-relations-factory-manifest/v1', state: 'editor_factory_preparation',
    artifactAudience: 'editor_only', sourceLineage: draft.sourceLineage,
    bindings: {
      draft: { id: draft.id, contentSha256: draft.contentSha256, authoredTaskSha256: draft.authoredTaskSha256 },
      verification: { jsonSha256: sha(JSON.stringify(verification)) },
      preparation: { contentSha256: preparation.contentSha256 },
      contexts: preparation.contexts.map(context => ({ contextId: context.contextId,
        trace: { id: context.trace.id, contentSha256: context.trace.contentSha256, byteLength: jsonBytes(context.trace) },
        job: { id: context.job.id, contentSha256: context.job.contentSha256, byteLength: jsonBytes(context.job) },
        audioRequest: { contentSha256: context.audioRequest.contentSha256, byteLength: jsonBytes(context.audioRequest),
          providerReady: context.audioRequest.providerReady, providerCallsAllowed: context.audioRequest.providerCallsAllowed },
        literalUnits: context.contextId === 'repeat' ? ['minute'] : ['card_per_package', 'package'] })),
      scenePlan: { contentSha256: scenePlan.contentSha256, geometrySha256: scenePlan.geometrySha256 },
      initialFrame: { contentSha256: frame.contentSha256, svgSha256: frame.svgSha256,
        narrationPacketSha256: narrationPacket.contentSha256, selectedPageSha256: frame.selectedPageSha256 },
      initialReview: { manifestContentSha256: initialReview.manifest.contentSha256, htmlSha256: initialReview.manifest.htmlSha256 },
    },
    componentBytes,
    current: { contextId: frame.contextId, cueId: frame.cueId, kind: frame.kind, cueIndex: frame.cueIndex,
      pageIndex: frame.pageIndex, pageCount: frame.pageCount, progress: frame.progress, revealRequested: frame.revealRequested,
      responseLocked: frame.responseLocked, resultVisible: frame.resultVisible, futureTranscriptsIncluded: false },
    literalUnits: ['minute', 'card_per_package', 'package'],
    geometryPreparation: { genericResolverSupported: false, specializedScenePrepared: true,
      specializedInitialFrameRendered: true, genericScenePlansCreated: 0,
      sourceDiagramOrigin: scenePlan.sourceDiagramOrigin, transferGeometry: 'not_in_source_pending' },
    counts: { existingAuthoredDrafts: 1, contextNarrationJobs: preparation.contexts.length,
      newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...draft.gates }, humanApproval: null, genericNumericStepsChecked: preparation.manifest.genericNumericStepsChecked,
    semanticReview: 'pending', manifestTranscriptText: false, answerBearingEditorArtifact: true, currentOnlyPreview: true,
    hiddenDetailsAreLearnerSecurity: false, inferredAnswerProtection: false, serializedAuthority: 'none',
    learnerEvidenceCollected: false, fullOutcomeCoverage: false, publicationReady: false, learnerReady: false, productionReady: false,
    audioGenerated: false, videoRendered: false, wordPenAlignmentVerified: false,
    responsiveLayoutVerified: false, accessibilityPassed: false,
    activity: { tracesPrepared: preparation.contexts.length, mediaJobsPrepared: preparation.contexts.length,
      audioRequestsPrepared: preparation.contexts.length, specializedScenePlansPrepared: 1,
      specializedInitialFramesRendered: 1, currentReviewHtmlProduced: 1,
      providerCallsMade: 0, audioGenerated: 0, videosRendered: 0, freshPdfByteChecks: 0, sourceFilesRead: 0 },
    pending: ['active_program_and_curriculum_review', 'teacher_rationale_and_age_review', 'rights_owner_steward_retention_review',
      'difficulty_and_answer_expert_review', 'generic_geometry_resolver_unsupported', 'transfer_geometry_not_in_source',
      'native_responsive_glyph_and_accessibility_acceptance', 'provider_selected_voice_job_bridge',
      'audio_bytes_and_listener_review', 'video_render_and_word_pen_alignment', 'student_delivery_authorization'],
  };
  manifest.contentSha256 = sha(`k12.grade6-common-relations.factory-manifest/v1:${JSON.stringify(manifest)}`);
  if (jsonBytes(manifest) > 16384) fail('common_relations_factory_output_budget');
  const output = { schemaVersion: 'grade6-common-relations-factory-preparation/v1', state: 'editor_factory_preparation',
    draft, verification, preparation, scenePlan, initialFrame, initialReview, manifest };
  if (jsonBytes(output) > 524288) fail('common_relations_factory_output_budget');
  return freeze(output);
}
