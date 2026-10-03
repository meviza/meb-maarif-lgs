import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { renderReasonedCaptionFrame } from './reasoned_scene_renderer.mjs';

const controllers = new WeakSet();
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
const actions = new Set(['previous_page', 'next_page', 'previous_cue', 'next_cue', 'reveal_current']);
const MAX_RECORD_BYTES = 131072;
const fail = code => { throw new Error(code); };
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
function actionType(input) {
  if (!input || typeof input !== 'object' || isProxy(input) || Array.isArray(input)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) fail('invalid_reasoned_caption_review_action');
  const keys = Reflect.ownKeys(input);
  if (keys.length !== 1 || keys[0] !== 'type') fail('invalid_reasoned_caption_review_action');
  const descriptor = Object.getOwnPropertyDescriptor(input, 'type');
  if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value') || typeof descriptor.value !== 'string'
    || descriptor.value.length > 14 || !actions.has(descriptor.value)) fail('invalid_reasoned_caption_review_action');
  return descriptor.value;
}
function recordFor(rendered, cueCount) {
  const { frame, narrationPacket } = rendered;
  const protectedCue = protectedKinds.has(frame.kind);
  const lastPage = frame.pageIndex === frame.pageCount - 1, lastCue = frame.cueIndex === cueCount - 1;
  const locked = protectedCue && !frame.resultVisible;
  const record = { schemaVersion: 'reasoned-caption-review-record/v1', state: 'editor_caption_navigation_draft',
    cursor: { cueIndex: frame.cueIndex, cueCount, cueId: frame.cueId, kind: frame.kind,
      pageIndex: frame.pageIndex, pageCount: frame.pageCount, progress: frame.progress,
      revealRequested: frame.revealRequested, resultVisible: frame.resultVisible },
    navigation: { canPreviousPage: frame.pageIndex > 0, canNextPage: !lastPage,
      canPreviousCue: frame.cueIndex > 0, canNextCue: !lastCue && lastPage && !locked,
      canRevealCurrent: locked,
      forwardBlockedReason: lastCue ? 'end_of_cues' : locked ? 'protected_response_requires_explicit_editor_reveal'
        : !lastPage ? 'caption_pages_remaining' : null },
    caption: { contentFormat: 'plain_text_textContent_only', lines: frame.selectedPage.lines,
      pageIndex: frame.pageIndex, pageCount: frame.pageCount, recommendedFontSizeCssPx: 18,
      typography: 'dom_font_independent_of_svg_viewBox', glyphFitVerified: false },
    visualPresentation: { use: 'optional_secondary_closed_review_preview',
      primaryCaption: 'separate_dom_plain_text', containsSameCurrentCaption: true,
      geometryRescaled: false, cropped: false, duplicateAccessibilityAcceptance: 'pending' },
    frame, narrationPacket,
    source: frame.source, trace: frame.trace, job: frame.job, geometrySha256: frame.geometrySha256,
    scenePlanSha256: frame.scenePlanSha256, frameSha256: frame.contentSha256,
    frameSvgSha256: frame.svgSha256, pagingSha256: frame.pagingSha256,
    limits: { maxRecordBytes: MAX_RECORD_BYTES, measurement: 'json_utf8_bytes' },
    serializedAuthority: 'none', audience: 'editor_review_only',
    reviewMeaning: 'local_presentation_not_authentication_or_learning_evidence',
    privacyInspection: 'not_performed', providerCallsMade: 0, sourceFilesRead: 0,
    captionReviewControllerPrepared: true, pageNavigationUiVerified: false, browserAccessibilityAccepted: false,
    teacherApproved: false, publicationReady: false, learnerReady: false, productionReady: false,
    audioGenerated: false, ttsPrepared: false, videoRendered: false, captionAudioSyncVerified: false,
    wordPenAlignmentVerified: false, wordBoundaryTimestampsProvided: false,
    expertReview: 'pending', curriculumReview: 'pending', rightsReview: 'pending',
    pending: [...new Set([...frame.pending, 'dom_caption_typography_and_readability_review',
      'caption_navigation_ui_and_accessibility_review', 'optional_svg_duplicate_caption_accessibility_review'])] };
  record.contentSha256 = hash(record);
  if (Buffer.byteLength(JSON.stringify(record), 'utf8') > MAX_RECORD_BYTES) fail('reasoned_caption_review_record_budget_exceeded');
  return freeze(record);
}

/** Local editor capability, not learner authentication or pedagogic review.
 * The current live plan is audited by the existing source-bound renderer.
 * Full narration stays separate; caption.lines belong only in textContent.
 * Cursor state is private. A serialized record never becomes a controller. */
export function createReasonedCaptionReview(livePlan) {
  if (arguments.length !== 1) fail('invalid_reasoned_caption_review_arguments');
  // Do not inspect caller-owned plan fields until the existing renderer has
  // accepted its original local WeakSet brand without executing hooks.
  const first = renderReasonedCaptionFrame(livePlan, { cueIndex: 0, progress: 1, reveal: false, pageIndex: 0 });
  const cueCount = livePlan.cues.length;
  let cursor = { cueIndex: 0, pageIndex: 0, reveal: false }, record = recordFor(first, cueCount);
  function trustedReceiver(receiver) {
    if (!receiver || typeof receiver !== 'object' || isProxy(receiver)
      || !controllers.has(receiver) || receiver !== controller) fail('untrusted_reasoned_caption_review_controller');
  }
  function current() {
    trustedReceiver(this);
    if (arguments.length !== 0) fail('invalid_reasoned_caption_review_arguments');
    return record;
  }
  function dispatch(input) {
    trustedReceiver(this);
    if (arguments.length !== 1) fail('invalid_reasoned_caption_review_arguments');
    const type = actionType(input), next = { ...cursor };
    const permissions = { previous_page: 'canPreviousPage', next_page: 'canNextPage',
      previous_cue: 'canPreviousCue', next_cue: 'canNextCue', reveal_current: 'canRevealCurrent' };
    if (!record.navigation[permissions[type]]) fail('reasoned_caption_review_transition_blocked');
    if (type === 'previous_page') next.pageIndex--;
    else if (type === 'next_page') next.pageIndex++;
    else if (type === 'reveal_current') { next.reveal = true; next.pageIndex = 0; }
    else { next.cueIndex += type === 'next_cue' ? 1 : -1; next.pageIndex = 0; next.reveal = false; }
    // Prepare and byte-bound the immutable output before committing private
    // state: a rejected render/record does not partially advance the cursor.
    const rendered = renderReasonedCaptionFrame(livePlan, { ...next, progress: 1 });
    const nextRecord = recordFor(rendered, cueCount);
    cursor = next; record = nextRecord; return record;
  }
  const controller = Object.freeze({ current, dispatch });
  controllers.add(controller); return controller;
}
