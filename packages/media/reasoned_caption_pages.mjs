import { createHash } from 'node:crypto';
import { renderReasonedSceneFrame } from './reasoned_scene_renderer.mjs';
import { paginateReasonedCaptionText } from './reasoned_caption_text.mjs';
export { paginateReasonedCaptionText } from './reasoned_caption_text.mjs';

const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
const bytesHash = value => createHash('sha256').update(value).digest('hex');
const hash = value => bytesHash(JSON.stringify(value));
const fail = code => { throw new Error(code); };
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
/** Paginate only a current cue after the existing live scene-plan/reveal audit.
 * This does not render markup, shorten narration or mint audio/video authority. */
export function createReasonedCaptionPages(liveScenePlan, frameOptions = {}) {
  if (arguments.length > 2) fail('invalid_reasoned_caption_arguments');
  // This must precede every access to the caller's plan/options. It validates
  // local WeakSet trust and bounded own primitive options without hooks.
  const frame = renderReasonedSceneFrame(liveScenePlan, frameOptions);
  const cue = liveScenePlan.cues[frame.cueIndex];
  const locked = protectedKinds.has(frame.kind) && !frame.resultVisible;
  const fullTranscript = locked ? null : cue.transcript;
  const displayText = locked ? 'Yanıt henüz gösterilmiyor. Açık reveal ve tamamlanmış ilerleme gerekiyor.' : fullTranscript;
  const pagination = paginateReasonedCaptionText(displayText);
  const output = { schemaVersion: 'reasoned-caption-pages/v1', state: 'current_cue_caption_presentation_draft',
    contentFormat: pagination.contentFormat, source: frame.source, trace: frame.trace, job: frame.job,
    geometrySha256: frame.geometrySha256, scenePlanSha256: frame.scenePlanSha256,
    frameSha256: frame.contentSha256, frameSvgSha256: frame.svgSha256,
    cueId: frame.cueId, cueIndex: frame.cueIndex, kind: frame.kind, progress: frame.progress,
    revealRequested: frame.revealRequested, resultVisible: frame.resultVisible,
    transcriptVisibility: locked ? 'protected_response_locked' : 'current_cue_only',
    fullTranscript, fullTranscriptSha256: fullTranscript === null ? null : bytesHash(fullTranscript), displayText,
    paging: pagination.paging, pages: pagination.pages, pagingSha256: pagination.pagingSha256,
    sourceDiagramProof: frame.sourceDiagramProof, representationStatus: frame.representationStatus,
    captionPresentationPrepared: true, serializedAuthority: 'none', audience: 'editor_review_only',
    providerCallsMade: 0, sourceFilesRead: 0, privacyInspection: 'not_performed',
    teacherApproved: false, publicationReady: false, learnerReady: false, productionReady: false,
    audioGenerated: false, ttsPrepared: false, videoRendered: false, captionAudioSyncVerified: false,
    wordPenAlignmentVerified: false, wordBoundaryTimestampsProvided: false,
    expertReview: 'pending', curriculumReview: 'pending', rightsReview: 'pending',
    pending: [...new Set([...frame.pending, 'caption_glyph_width_and_geometry_fit_review',
      'caption_page_navigation_and_accessibility_review', 'full_narration_audio_and_word_alignment_not_implemented'])] };
  output.contentSha256 = hash(output); return freeze(output);
}
