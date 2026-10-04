import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { auditGrade6CommonRelationsVoiceBridge } from './grade6_common_relations_voice_bridge.mjs';
import { renderGrade6CommonRelationsCaptionFrame } from './grade6_common_relations_scene.mjs';

const fail = kind => { throw new Error(`invalid_common_relations_current_voice_${kind}`); };
const sha = text => createHash('sha256').update(text).digest('hex');
const bytes = value => Buffer.byteLength(JSON.stringify(value));
const digest = (kind, value) => sha(`k12.grade6-common-relations.${kind}/v1:${JSON.stringify(value)}`);
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const gates = () => ({ activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' });
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);

// A four-primitive cursor only: reject foreign hooks before property access.
function cursor(input, cueCount) {
  if (!input || typeof input !== 'object' || isProxy(input) || Array.isArray(input)) fail('options');
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) fail('options');
  const keys = Reflect.ownKeys(input), allowed = ['cueIndex', 'pageIndex', 'progress', 'reveal'];
  if (keys.length > 4 || keys.some(key => typeof key !== 'string' || Buffer.byteLength(key) > 256 || !allowed.includes(key))) fail('options');
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (keys.some(key => !Object.hasOwn(descriptors[key], 'value') || !descriptors[key].enumerable)) fail('options');
  const read = (key, fallback) => Object.hasOwn(descriptors, key) ? descriptors[key].value : fallback;
  const cueIndex = read('cueIndex', 0), pageIndex = read('pageIndex', 0), progress = read('progress', 0), reveal = read('reveal', false);
  if (!Number.isSafeInteger(cueIndex) || cueIndex < 0 || cueIndex >= cueCount
    || !Number.isSafeInteger(pageIndex) || pageIndex < 0 || pageIndex >= 32
    || typeof progress !== 'number' || !Number.isFinite(progress) || progress < 0 || progress > 1
    || typeof reveal !== 'boolean') fail('options');
  return { cueIndex: cueIndex === 0 ? 0 : cueIndex, pageIndex: pageIndex === 0 ? 0 : pageIndex,
    progress: progress === 0 ? 0 : progress, reveal };
}

function checkBinding(bridge, audit, frame, narration, selected) {
  const binding = audit.binding, visual = bridge.visual, voice = bridge.voice;
  const visualCue = visual.job.cues[selected.cueIndex], voiceCue = voice.job.cues[selected.cueIndex];
  const visualRequestCue = visual.request.cues[selected.cueIndex], voiceRequestCue = voice.request.cues[selected.cueIndex];
  const mapping = binding.cueMappings[selected.cueIndex];
  const sources = [frame.source, visual.trace.source, visual.job.source, voice.job.source];
  const traces = [frame.trace, visual.trace, visual.job.trace, voice.job.trace];
  if (audit.valid !== true || audit.contextId !== bridge.contextId || frame.contextId !== bridge.contextId
    || sources.some(source => source.id !== binding.source.id || source.contentSha256 !== binding.source.contentSha256)
    || traces.some(trace => trace.id !== binding.trace.id || trace.contentSha256 !== binding.trace.contentSha256)
    || frame.job.id !== binding.visualJob.id || frame.job.contentSha256 !== binding.visualJob.contentSha256
    || visual.job.id !== binding.visualJob.id || visual.job.contentSha256 !== binding.visualJob.contentSha256
    || voice.job.id !== binding.voiceJob.id || voice.job.contentSha256 !== binding.voiceJob.contentSha256
    || visual.request.contentSha256 !== binding.visualJob.requestSha256 || voice.request.contentSha256 !== binding.voiceJob.requestSha256
    || visual.request.jobSha256 !== visual.job.contentSha256 || voice.request.jobSha256 !== voice.job.contentSha256
    || frame.scenePlanSha256 !== binding.scenePlanSha256 || frame.geometrySha256 !== binding.geometrySha256
    || frame.preparationSha256 !== binding.preparationSha256 || !same(frame.literalUnits, binding.literalUnits)
    || !same(voice.job.provider, binding.provider) || !same(voice.request.provider, binding.provider)
    || visual.job.provider !== null || visual.request.provider !== null
    || voice.job.style.sha256 !== binding.style.voiceSha256 || sha(voice.job.style.text) !== binding.style.voiceSha256
    || visual.job.style.sha256 !== binding.style.visualSha256 || !same(voice.job.style, voice.request.style)
    || !same(visual.job.style, visual.request.style) || !same(binding.gates, gates())) fail('binding');
  for (const cue of [visualCue, voiceCue]) {
    if (!cue || cue.id !== frame.cueId || cue.order !== selected.cueIndex || cue.kind !== frame.kind
      || cue.id !== mapping.cueId || cue.order !== mapping.order || cue.kind !== mapping.kind || cue.stepId !== mapping.stepId
      || cue.transcriptSha256 !== mapping.transcriptSha256 || sha(cue.transcript) !== cue.transcriptSha256
      || !same(cue.displayAnchorIds, mapping.displayAnchorIds) || cue.thoughtPauseSeconds !== mapping.thoughtPauseSeconds) fail('binding');
  }
  if (visualCue.transcript !== voiceCue.transcript || visualCue.styleSha256 !== binding.style.visualSha256
    || voiceCue.styleSha256 !== binding.style.voiceSha256
    || mapping.visualStyleSha256 !== visualCue.styleSha256 || mapping.voiceStyleSha256 !== voiceCue.styleSha256
    || [visualRequestCue, voiceRequestCue].some(cue => !cue || cue.id !== visualCue.id || cue.order !== selected.cueIndex
      || cue.transcript !== visualCue.transcript || cue.transcriptSha256 !== visualCue.transcriptSha256)
    || visualRequestCue.styleSha256 !== visualCue.styleSha256 || voiceRequestCue.styleSha256 !== voiceCue.styleSha256
    || binding.plannedThinkingPauseSeconds !== 8) fail('binding');
  const locked = protectedKinds.has(visualCue.kind) && !(selected.reveal && selected.progress === 1);
  if (frame.responseLocked !== locked || frame.resultVisible !== (protectedKinds.has(visualCue.kind) && !locked)
    || narration.frameSha256 !== frame.contentSha256 || narration.cueId !== frame.cueId
    || narration.fullTranscript !== (locked ? null : visualCue.transcript)
    || narration.fullTranscriptSha256 !== (locked ? null : visualCue.transcriptSha256)
    || frame.fullTranscriptSha256 !== narration.fullTranscriptSha256) fail('binding');
  return voiceCue;
}

/** Pure current-cue projection. Issuance audit is first; no provider or audio
 * access. Serialized bridges cannot authorize a scene, request or reveal. */
export function createGrade6CommonRelationsCurrentVoiceCue(bridge, options) {
  if (arguments.length !== 2) fail('arguments');
  let audit;
  try { audit = auditGrade6CommonRelationsVoiceBridge(bridge); }
  catch { fail('bridge'); }
  // Only the audited, deeply immutable live bridge may be read below.
  if (audit.valid !== true) fail('bridge');
  const selected = cursor(options, audit.binding.cueCount);
  let frame, narrationPacket;
  try {
    ({ frame, narrationPacket } = renderGrade6CommonRelationsCaptionFrame(bridge.visual.scenePlan,
      { contextId: bridge.contextId, ...selected }));
  } catch { fail('options'); }
  let cue;
  try { cue = checkBinding(bridge, audit, frame, narrationPacket, selected); }
  catch { fail('binding'); }
  const binding = audit.binding;
  let voiceRequest = null;
  if (!frame.responseLocked) {
    voiceRequest = {
      schemaVersion: 'grade6-common-relations-current-voice-request/v1', state: 'draft_only_no_provider_call',
      contextId: bridge.contextId, bridgeContentSha256: audit.bridgeContentSha256,
      source: { ...binding.source }, trace: { ...binding.trace },
      visual: { jobId: binding.visualJob.id, jobSha256: binding.visualJob.contentSha256,
        requestSha256: binding.visualJob.requestSha256, scenePlanSha256: binding.scenePlanSha256, geometrySha256: binding.geometrySha256 },
      voice: { jobId: binding.voiceJob.id, jobSha256: binding.voiceJob.contentSha256, requestSha256: binding.voiceJob.requestSha256 },
      provider: { ...binding.provider }, style: { ...bridge.voice.job.style },
      cue: { id: cue.id, order: cue.order, kind: cue.kind, transcript: cue.transcript,
        transcriptSha256: cue.transcriptSha256, styleSha256: cue.styleSha256, thoughtPauseSeconds: cue.thoughtPauseSeconds },
      literalUnits: [...binding.literalUnits],
      thoughtPause: { afterCueSeconds: cue.thoughtPauseSeconds, contextPlannedSeconds: binding.plannedThinkingPauseSeconds,
        measuredSpeechSeconds: null, state: 'declared_not_measured' },
      artifactAudience: 'editor_only', serializedAuthority: 'none', gates: gates(),
      providerDeclarationOnly: true, providerCallsAllowed: false, providerCallsMade: 0, endpointVerified: false,
      privacyInspection: 'not_performed', styleApproved: false, spokenTranscriptVerified: false,
      voiceIdentityVerified: false, audioPlaybackAllowed: false, audioBytesVerified: false,
      wordPenAlignmentVerified: false, publicationReady: false, learnerReady: false, productionReady: false,
    };
    voiceRequest.contentSha256 = digest('current-voice-request', voiceRequest);
    if (bytes(voiceRequest) > 32768) fail('binding');
    freeze(voiceRequest);
  }
  // No provider/style/voice job/current transcript hash or future cue list is
  // copied into this manifest, including the protected-response locked case.
  const manifest = {
    schemaVersion: 'grade6-common-relations-current-voice-cue-manifest/v1', state: 'draft_only_no_provider_call',
    contextId: bridge.contextId, bridgeContentSha256: audit.bridgeContentSha256,
    source: { ...binding.source }, trace: { ...binding.trace },
    scenePlanSha256: binding.scenePlanSha256, preparationSha256: binding.preparationSha256, geometrySha256: binding.geometrySha256,
    current: { cueId: frame.cueId, cueIndex: frame.cueIndex, kind: frame.kind, pageIndex: frame.pageIndex,
      pageCount: frame.pageCount, progress: frame.progress, revealRequested: frame.revealRequested,
      responseLocked: frame.responseLocked, resultVisible: frame.resultVisible },
    frameSha256: frame.contentSha256, narrationPacketSha256: narrationPacket.contentSha256,
    voiceRequestSha256: voiceRequest?.contentSha256 ?? null,
    componentBytes: { frame: bytes(frame), narrationPacket: bytes(narrationPacket), voiceRequest: voiceRequest === null ? 0 : bytes(voiceRequest) },
    voicePayloadIncluded: voiceRequest !== null, sourceDiagramProof: frame.sourceDiagramProof,
    artifactAudience: 'editor_only', serializedAuthority: 'none', gates: gates(),
    limits: { outputBytes: 131072, requestBytes: 32768, manifestBytes: 16384 },
    counts: { existingAuthoredDrafts: 1, contextNarrationJobs: 2, newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    providerCallsMade: 0, endpointVerified: false, voiceIdentityVerified: false, audioGenerated: false,
    videoRendered: false, audioBytesVerified: false, wordPenAlignmentVerified: false, audioPlaybackAllowed: false,
    privacyInspection: 'not_performed', styleApproved: false, spokenTranscriptVerified: false,
    captionAudioSyncVerified: false, humanApproval: null, learnerEvidenceCollected: false,
    learnerReady: false, publicationReady: false, productionReady: false,
    pending: [...new Set([...audit.pending, 'teacher_current_cue_listening_review', 'provider_endpoint_voice_and_rights_review', 'audio_bytes_and_duration_not_generated',
      'word_pen_alignment_not_measured', 'rights_owner_and_retention_review', 'native_caption_and_accessibility_review',
      ...(frame.sourceDiagramProof ? [] : ['transfer_geometry_not_in_source'])])],
  };
  manifest.contentSha256 = digest('current-voice-cue-manifest', manifest);
  if (bytes(manifest) > 16384) fail('binding');
  const output = { schemaVersion: 'grade6-common-relations-current-voice-cue/v1', state: 'draft_only_no_provider_call',
    frame, narrationPacket, voiceRequest, manifest };
  if (bytes(output) > 131072) fail('binding');
  return freeze(output);
}
