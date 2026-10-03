import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { auditReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';

const JOBS = new WeakSet(), ATTACHMENTS = new WeakSet();
const DEFAULT_STYLE = 'Türkçe konuşan sıcak, net ve saygılı yetişkin öğretmen. Gerekçeyi işlemden önce anlat. Metni, sayıları ve birimleri değiştirme; doğal, ölçülü duraklamalar kullan. Yönergeyi seslendirme.';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const digest = value => sha256(JSON.stringify(value));
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const fail = message => { throw new Error(message); };
const roundSeconds = value => Math.round(value * 1e6) / 1e6;

function safeCopy(input) {
  const visiting = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 12000 || depth > 16) fail('invalid_reasoned_media_data');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) fail('invalid_reasoned_media_data');
      return value;
    }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 16384 || bytes > 512 * 1024 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_reasoned_media_data');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('invalid_reasoned_media_data');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail('invalid_reasoned_media_data');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value'))) fail('invalid_reasoned_media_data');
    visiting.add(value);
    let result;
    if (array) {
      if (value.length > 128 || keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_reasoned_media_data');
      result = Array.from({ length: value.length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_reasoned_media_data');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return result;
  }
  return copy(input);
}

function fields(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('invalid_reasoned_media_fields');
  const actual = Object.keys(value);
  if (actual.length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) fail('invalid_reasoned_media_fields');
}
function text(value, max = 16384) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_reasoned_media_text');
}
function id(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,79}$/u.test(value)) fail('invalid_reasoned_media_id');
}
function hash(value) { if (typeof value !== 'string' || !/^[a-f0-9]{64}$/u.test(value)) fail('invalid_reasoned_media_hash'); }
function providerDeclaration(value) {
  if (value === null) return null;
  fields(value, ['id', 'modelId', 'voiceId']);
  Object.values(value).forEach(id);
  return { id: value.id, modelId: value.modelId, voiceId: value.voiceId };
}
function trustedJob(job) { if (!job || typeof job !== 'object' || !JOBS.has(job)) fail('untrusted_reasoned_media_job'); }
function trustedAttachment(attachment) { if (!attachment || typeof attachment !== 'object' || !ATTACHMENTS.has(attachment)) fail('untrusted_reasoned_media_audio'); }

const unitWords = { m: 'metre', cm: 'santimetre', 'm²': 'metrekare', 'cm²': 'santimetrekare', count: 'adet', unitless: '', text: '' };
const numberText = value => String(value).replace('.', ',');
function resultTranscript(step) {
  if (step.operation.kind === 'interpret') return `${step.result.value} ${step.result.meaning}`;
  const expression = step.expression.replaceAll(' + ', ' artı ').replaceAll(' − ', ' eksi ').replaceAll(' × ', ' çarpı ').replaceAll(' ÷ ', ' bölü ').replaceAll('.', ',');
  return `${expression} eşittir ${numberText(step.result.value)}${unitWords[step.result.unit] ? ' ' + unitWords[step.result.unit] : ''}. ${step.result.meaning}`;
}

/** Pure, source-bound orchestration; no file, account, model or renderer access. */
export function createReasonedMediaJob(trace, options = {}) {
  const traceAudit = auditReasonedTeachingTrace(trace); // Requires the branded root trace, not a caller hash claim.
  const settings = safeCopy(options);
  if (!settings || typeof settings !== 'object' || Array.isArray(settings) || Object.keys(settings).some(key => !['style', 'provider'].includes(key))) fail('invalid_reasoned_media_fields');
  const styleText = Object.hasOwn(settings, 'style') ? settings.style : DEFAULT_STYLE;
  text(styleText, 4096);
  const style = { text: styleText, sha256: sha256(styleText) };
  const provider = providerDeclaration(Object.hasOwn(settings, 'provider') ? settings.provider : null);
  const cues = [];
  const addCue = (kind, transcript, { stepId = null, anchors = [], pause = 0 } = {}) => {
    text(transcript);
    const order = cues.length;
    cues.push({ id: `cue-${String(order + 1).padStart(3, '0')}-${kind}`, order, kind, stepId, transcript,
      transcriptSha256: sha256(transcript), styleSha256: style.sha256, displayAnchorIds: [...anchors], thoughtPauseSeconds: pause });
  };
  addCue('goal', trace.goal.question + (unitWords[trace.goal.unit] ? ` Yanıtın birimi ${unitWords[trace.goal.unit]} olacak.` : ''));
  addCue('evidence', trace.evidence.map(item => `${item.text}${item.value !== null ? ` Verilen değer ${numberText(item.value)}${unitWords[item.unit] ? ' ' + unitWords[item.unit] : ''}.` : ''}`).join(' '), { anchors: trace.evidence.map(item => item.id) });
  addCue('plan', `${trace.plan.route.replaceAll('→', '; sonra')} ${trace.plan.why} Koşullar: ${trace.plan.conditions.join(' ')}`);
  for (const step of trace.steps) {
    addCue('why', step.why, { stepId: step.id, anchors: step.operation.inputIds });
    addCue('result', resultTranscript(step), { stepId: step.id, anchors: [step.id] });
    addCue('check_prompt', step.check.prompt, { stepId: step.id, anchors: step.operation.inputIds, pause: 4 });
    addCue('check_answer', step.check.answer, { stepId: step.id, anchors: [step.id] });
  }
  const final = trace.steps.at(-1);
  addCue('summary', `${final.result.meaning} ${trace.plan.conditions.join(' ')}`, { anchors: [final.id] });
  addCue('transfer_prompt', trace.transfer.prompt, { pause: 4 });
  addCue('transfer_answer', trace.transfer.answer);
  const job = {
    schemaVersion: 'reasoned-media-job/v1', id: `media-${trace.contentSha256.slice(0, 32)}`, source: { ...trace.source },
    trace: { id: trace.id, kind: trace.kind, contentSha256: trace.contentSha256 }, style, provider, cues,
    subtitleDraft: { state: 'text_only_timing_pending', timing: 'not_measured', cues: cues.map(cue => ({ cueId: cue.id, text: cue.transcript, transcriptSha256: cue.transcriptSha256 })) },
    geometryPolicy: 'source_geometry_must_be_resolved_and_preserved_no_llm_edit', geometryStatus: 'source_geometry_not_resolved',
    state: 'orchestration_draft', audioStatus: 'not_generated', videoStatus: 'not_rendered', alignmentStatus: 'not_measured',
    sourceBinding: trace.sourceBinding, publicationReady: false, learnerEvidence: 'none_collected', audience: 'editor_review_only',
    pending: [...new Set([...traceAudit.pending, 'audio_byte_and_duration_verification', 'spoken_transcript_and_voice_identity_review', 'teacher_listener_review', 'source_geometry_resolution', 'real_renderer_binding', 'word_pen_alignment_review'])],
  };
  job.contentSha256 = digest(job); freeze(job); JOBS.add(job); return job;
}

/** Separate derived manifest avoids a recursive job hash while binding every cue. */
export function createReasonedMediaAudioRequest(job) {
  trustedJob(job);
  const request = {
    schemaVersion: 'reasoned-media-audio-request/v1', jobId: job.id, jobSha256: job.contentSha256,
    sourceSha256: job.source.contentSha256, traceSha256: job.trace.contentSha256,
    provider: job.provider, style: job.style, providerReady: job.provider !== null, providerCallsAllowed: false,
    state: 'draft_only_no_provider_call', cues: job.cues.map(({ id, order, transcript, transcriptSha256, styleSha256 }) => ({ id, order, transcript, transcriptSha256, styleSha256 })),
  };
  request.contentSha256 = digest(request); return freeze(request);
}

/** Attaches declared metadata, not decoded audio or a listener transcript attestation. */
export function attachReasonedMediaAudio(job, evidence) {
  trustedJob(job);
  if (job.provider === null) fail('media_provider_not_selected');
  const data = safeCopy(evidence);
  fields(data, ['schemaVersion', 'jobId', 'jobSha256', 'sourceSha256', 'traceSha256', 'requestSha256', 'provider', 'style', 'cues']);
  if (data.schemaVersion !== 'reasoned-media-audio-evidence/v1') fail('invalid_reasoned_media_schema');
  id(data.jobId);
  [data.jobSha256, data.sourceSha256, data.traceSha256, data.requestSha256].forEach(hash);
  const declaredProvider = providerDeclaration(data.provider);
  fields(data.style, ['text', 'sha256']); text(data.style.text, 4096); hash(data.style.sha256);
  const request = createReasonedMediaAudioRequest(job);
  if (data.jobId !== job.id || data.jobSha256 !== job.contentSha256 || data.sourceSha256 !== job.source.contentSha256 || data.traceSha256 !== job.trace.contentSha256 || data.requestSha256 !== request.contentSha256 || declaredProvider === null || ['id', 'modelId', 'voiceId'].some(key => declaredProvider[key] !== job.provider[key]) || data.style.text !== job.style.text || data.style.sha256 !== job.style.sha256 || !Array.isArray(data.cues) || data.cues.length !== job.cues.length) fail('reasoned_media_audio_binding_mismatch');
  const seenAudioHashes = new Set(); let measuredSpeech = 0, totalBytes = 0;
  for (const [index, cue] of data.cues.entries()) {
    fields(cue, ['cueId', 'order', 'transcript', 'transcriptSha256', 'styleSha256', 'audioSha256', 'byteLength', 'measuredDurationSeconds']);
    id(cue.cueId); text(cue.transcript); [cue.transcriptSha256, cue.styleSha256, cue.audioSha256].forEach(hash);
    if (!Number.isInteger(cue.byteLength) || cue.byteLength < 1 || cue.byteLength > 20 * 1024 * 1024 || typeof cue.measuredDurationSeconds !== 'number' || !Number.isFinite(cue.measuredDurationSeconds) || cue.measuredDurationSeconds < 0.1 || cue.measuredDurationSeconds > 180) fail('invalid_reasoned_media_audio_bounds');
    const target = job.cues[index];
    if (cue.cueId !== target.id || cue.order !== index || cue.transcript !== target.transcript || cue.transcriptSha256 !== target.transcriptSha256 || cue.styleSha256 !== job.style.sha256 || seenAudioHashes.has(cue.audioSha256)) fail('reasoned_media_audio_binding_mismatch');
    seenAudioHashes.add(cue.audioSha256); measuredSpeech += cue.measuredDurationSeconds; totalBytes += cue.byteLength;
  }
  if (measuredSpeech > 3600 || totalBytes > 256 * 1024 * 1024) fail('reasoned_media_audio_budget_exceeded');
  let cursor = 0;
  const timeline = data.cues.map((cue, index) => {
    const target = job.cues[index], startSeconds = roundSeconds(cursor), endSeconds = roundSeconds(cursor + cue.measuredDurationSeconds);
    cursor = endSeconds + target.thoughtPauseSeconds;
    return { cueId: cue.cueId, order: index, startSeconds, endSeconds, measuredDurationSeconds: cue.measuredDurationSeconds, thoughtPauseSeconds: target.thoughtPauseSeconds,
      audioSha256: cue.audioSha256, declaredByteLength: cue.byteLength, transcriptSha256: cue.transcriptSha256, styleSha256: cue.styleSha256 };
  });
  const attachment = {
    schemaVersion: 'reasoned-media-audio-binding/v1', jobId: job.id, jobSha256: job.contentSha256,
    sourceSha256: job.source.contentSha256, traceSha256: job.trace.contentSha256, requestSha256: request.contentSha256,
    provider: job.provider, styleSha256: job.style.sha256, state: 'declared_audio_evidence_attached_not_listener_verified',
    timeline, subtitleCues: timeline.map((cue, index) => ({ cueId: cue.cueId, startSeconds: cue.startSeconds, endSeconds: cue.endSeconds, text: job.cues[index].transcript, transcriptSha256: cue.transcriptSha256 })),
    measuredSpeechSeconds: roundSeconds(measuredSpeech), plannedThinkingPauseSeconds: job.cues.reduce((sum, cue) => sum + cue.thoughtPauseSeconds, 0),
    plannedTimelineSeconds: roundSeconds(cursor), declaredAudioBytes: totalBytes, timelinePrecision: 'declared_seconds_rounded_6dp_not_sample_verified',
    audioBytesVerified: false, spokenTranscriptVerified: false, voiceIdentityVerified: false, videoRendered: false, publicationReady: false,
  };
  attachment.contentSha256 = digest(attachment); freeze(attachment); ATTACHMENTS.add(attachment); return attachment;
}

export function auditReasonedMediaJob(job, attachment = null) {
  trustedJob(job);
  if (attachment !== null) {
    trustedAttachment(attachment);
    if (attachment.jobSha256 !== job.contentSha256 || attachment.jobId !== job.id || attachment.sourceSha256 !== job.source.contentSha256 || attachment.traceSha256 !== job.trace.contentSha256) fail('reasoned_media_audio_binding_mismatch');
  }
  return freeze({
    state: 'editor_orchestration_review', jobId: job.id, jobSha256: job.contentSha256, cueCount: job.cues.length,
    sourceBinding: job.sourceBinding, audioEvidenceAttached: attachment !== null, audioBytesVerified: false,
    spokenTranscriptVerified: false, voiceIdentityVerified: false, voiced: false, rendered: false,
    providerCallsMade: 0, sourceFilesRead: 0, privacyInspection: 'not_performed', geometryStatus: job.geometryStatus,
    publicationReady: false, expertReview: 'pending', rightsReview: 'pending', pending: job.pending,
  });
}
