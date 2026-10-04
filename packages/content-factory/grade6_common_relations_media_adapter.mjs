import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsDraft, verifyGrade6CommonRelationsDraft } from './grade6_common_relations_draft.mjs';
import { renderGrade6CommonRelationsEditorView } from './grade6_common_relations_editor_view.mjs';
import { createReasonedTeachingTrace, auditReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';
import { createReasonedMediaJob, createReasonedMediaAudioRequest, auditReasonedMediaJob } from '../media/reasoned_media_job.mjs';

const fail = code => { throw new Error(code); };
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const digest = value => createHash('sha256').update(`k12.grade6-common-relations.media-preparation/v1:${JSON.stringify(value)}`).digest('hex');
const units = { minute: { display: 'Dakika', spoken: 'dakika' }, card_per_package: { display: 'Kart/paket', spoken: 'kart/paket' } };
const positiveList = values => values.length < 2 ? String(values[0]) : `${values.slice(0, -1).join(', ')} ve ${values.at(-1)}`;

function transferAnswer(contextId, transfers) {
  if (contextId === 'grouping') {
    const [transfer] = transfers;
    return `Boyut ${transfer.groupSize} kart/paket; iki tür için paket sayıları ${positiveList(transfer.packageCounts)}. ${transfer.meaning}`;
  }
  const [sum, boundary] = transfers;
  const cases = boundary.cases.map(value => `${value.minute} dakika: ortak ${value.common ? 'evet' : 'hayır'}, aralık içinde ${value.inWindow ? 'evet' : 'hayır'}`).join('. ');
  return `${sum.candidateMinute} dakika adayının 6 ve 8 ile kalanları ${positiveList(sum.remainders)}. ${sum.meaning} ${cases}. ${boundary.meaning}`;
}

// Generic trace units deliberately stay text: the generic arithmetic contract
// does not implement minute or card/package dimensions or set intersections.
// The separate existing draft verifier actually recomputes those finite sets.
function contextPreparation(draft, path) {
  const id = path.contextId, unit = units[path.unit];
  const transfers = draft.explanation.transfers.filter(value => id === 'repeat'
    ? ['sum-not-common-time', 'window-boundary'].includes(value.id) : value.id === 'group-size-not-count');
  const trace = createReasonedTeachingTrace({
    id: `${draft.id}-${id}`, kind: 'question_solution', source: { id: draft.id, contentSha256: draft.contentSha256 },
    goal: { question: path.goal, unit: 'text', measurement: `${id}_provided_evidence_interpretation` },
    evidence: [{ id: `${id}-given`, type: 'given', text: path.givenMeaning,
      anchor: `problem.contexts:${id}`, value: null, unit: 'text' }],
    plan: { route: path.operationMeaning, why: path.why,
      conditions: ['Verilmiş kanıtın yorumlanmasıdır; öğrencinin kendi listesi veya açıklaması ölçülmedi.',
        path.conditionalNote.when, path.conditionalNote.why, path.conditionalNote.check, path.conditionalNote.notImplied] },
    steps: [{ id: `${id}-interpretation`, why: path.why, operation: { kind: 'interpret', inputIds: [`${id}-given`] },
      result: { value: `${positiveList(path.result)} ${unit.spoken}`, unit: 'text', meaning: path.resultMeaning },
      check: { prompt: path.conditionalNote.check, answer: `${path.resultMeaning} ${path.conditionalNote.why}` } }],
    transfer: { prompt: id === 'repeat'
      ? 'Süreleri toplamak neden yetmez? 0, 48 ve 72 dakika için ortaklık ve sonlu aralık koşullarını ayrı denetle.'
      : '6 kart/paket için 24 ve 36 karttan kaç paket çıkar? Boyut ile paket sayısının neden ayrı nicelikler olduğunu açıkla.',
      answer: transferAnswer(id, transfers) },
    scope: { gradeBand: '5-6', prerequisite: 'Pozitif tam sayılar, sonlu aralık, kalansız paylaşım ve verilen niceliğin birimi.' },
  });
  // These are the actual branded general artifacts, never shape-compatible
  // caller claims or provider configuration supplied through this adapter.
  const traceAudit = auditReasonedTeachingTrace(trace), job = createReasonedMediaJob(trace);
  return { contextId: id, path, transfers, trace, traceAudit, job,
    jobAudit: auditReasonedMediaJob(job), audioRequest: createReasonedMediaAudioRequest(job) };
}

/** One answer-bearing editor orchestration packet. No source/provider options,
 * generic geometry fallback, narration, student delivery or publication. */
export function createGrade6CommonRelationsMediaPreparation(candidate, sourceBindingInput) {
  if (arguments.length !== 2) fail('invalid_common_relations_media_arguments');
  let draft, verification, contexts, editorView;
  try {
    verification = verifyGrade6CommonRelationsDraft(candidate, sourceBindingInput);
    if (!verification.valid) fail('invalid_common_relations_media_input');
    // The caller candidate is never read again after the independent gate.
    draft = createGrade6CommonRelationsDraft(sourceBindingInput);
    contexts = draft.explanation.paths.map(path => contextPreparation(draft, path));
    editorView = renderGrade6CommonRelationsEditorView(draft, sourceBindingInput);
  } catch { fail('invalid_common_relations_media_input'); }
  const manifest = {
    schemaVersion: 'grade6-common-relations-media-manifest/v1', state: 'editor_media_preparation',
    draftContentSha256: draft.contentSha256, authoredTaskSha256: draft.authoredTaskSha256,
    sourceSha256: draft.sourceLineage.sourceSha256, applicationMetadataSha256: draft.sourceLineage.applicationMetadataSha256,
    priorMatrixMetadataSha256: draft.sourceLineage.priorMatrixMetadataSha256, sourceRowMetadataSha256: draft.sourceLineage.sourceRowMetadataSha256,
    sourceBinding: draft.sourceLineage.state, localMathChecks: verification.localMathChecks,
    contextSemantics: draft.explanation.paths.map(path => ({ contextId: path.contextId, values: [...path.result],
      literalUnit: path.unit, displayUnit: units[path.unit].display, traceUnit: 'text' })),
    genericNumericStepsChecked: contexts.reduce((count, context) => count + context.traceAudit.numericStepsChecked, 0),
    semanticReview: 'pending', genericTraceSourceBinding: 'declared_requires_source_resolver',
    geometryPreparation: { state: 'unsupported_common_relations_family_pending', genericResolverSupported: false,
      genericScenePlansCreated: 0, captionFramesRendered: 0, reason: 'unsupported_reasoned_geometry_source' },
    editorHtmlSha256: editorView.manifest.htmlSha256, editorHtmlBytes: editorView.manifest.htmlBytes,
    answerBearingEditorArtifact: true, hiddenDetailsAreLearnerSecurity: false, fullTranscriptEditorOnly: true,
    serializedAuthority: 'none', genericSceneRevealImplemented: false,
    counts: { existingAuthoredDrafts: 1, contextNarrationJobs: 2, newAuthoredQuestions: 0,
      acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...draft.gates }, humanApproval: null, activeAcademicYear: null, programVersion: null, officialOutcomeCode: null,
    learnerEvidenceCollected: false, fullOutcomeCoverage: false, publicationReady: false, learnerReady: false, productionReady: false,
    audioAttached: false, videoAttached: false, voiceIdentityVerified: false, audioBytesVerified: false,
    captionAudioSyncVerified: false, wordPenAlignmentVerified: false, nativeVisualReviewPassed: false, accessibilityPassed: false,
    freshPdfByteChecks: 0,
    activity: { tracesPrepared: 2, mediaJobsPrepared: 2, audioRequestsPrepared: 2, htmlProduced: 1, inlineSvgsProduced: 1,
      audioGenerated: 0, videosRendered: 0, networkCallsMade: 0, providerCallsMade: 0 },
    pending: ['active_program_and_curriculum_review', 'teacher_rationale_and_age_review', 'rights_owner_steward_retention_review',
      'difficulty_and_answer_expert_review', 'common_relations_generic_geometry_adapter', 'common_relations_scene_and_caption_adapter',
      'audio_generation_and_bytes_listener_review', 'video_render_and_word_pen_alignment', 'student_delivery_authorization'],
  };
  if (Buffer.byteLength(JSON.stringify(manifest)) > 16384) fail('common_relations_media_output_budget');
  const output = { schemaVersion: 'grade6-common-relations-media-preparation/v1', state: 'editor_media_preparation',
    artifactAudience: 'editor_only', sourceLineage: draft.sourceLineage, verification, contexts, editorView, manifest };
  output.contentSha256 = digest(output);
  if (Buffer.byteLength(JSON.stringify(output)) > 131072) fail('common_relations_media_output_budget');
  return freeze(output);
}
