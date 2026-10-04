import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { auditGrade6CommonRelationsVoiceBridge } from './grade6_common_relations_voice_bridge.mjs';
import { createGrade6CommonRelationsCurrentVoiceCue } from './grade6_common_relations_current_voice_cue.mjs';

const PREPARATIONS = new WeakSet(), AUDITS = new WeakMap();
const fail = kind => { throw new Error(`invalid_common_relations_closed_tts_${kind}`); };
const bytes = value => Buffer.byteLength(JSON.stringify(value));
const digest = value => createHash('sha256').update(`k12.grade6-common-relations.closed-tts/v1:${JSON.stringify(value)}`).digest('hex');
const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
};
const requiredDecisions = [
  'scoped_provider_authorization', 'provider_account_credential', 'rights_commercial',
  'adult_editor_minor_terms_review', 'privacy_retention_style_review', 'live_endpoint_schema_and_voice_review', 'paid_budget',
];

// A fixed documented candidate, NOT a transport, live schema/voice validation,
// account credential, commercial permission or call budget. Other declarations
// still yield a held local preparation without inventing protocol support.
function protocolCandidate(request) {
  const provider = request.provider;
  if (provider.id !== 'google-gemini-interactions' || provider.modelId !== 'gemini-3.8-flash-tts'
    || !['Charon', 'Kore'].includes(provider.voiceId)) return null;
  return {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/interactions', method: 'POST',
    docKnown: true, endpointVerified: false,
    body: {
      model: 'gemini-3.8-flash-tts',
      input: [{ type: 'user_input', content: [{ type: 'text', text: request.cue.transcript,
        annotations: [{ type: 'speech_metadata', style: request.style.text }] }] }],
      response_format: { type: 'audio', mime_type: 'audio/wav', sample_rate: 24000 },
      generation_config: { speech_config: [{ voice: provider.voiceId }] }, store: false, stream: false,
    },
  };
}

/** Recompute a single current cue from the original issued bridge and closed
 * primitive cursor. Local preparation issuance is NEVER a provider-call grant.
 * No network, transport, credential, filesystem, budget or response API exists. */
export function createGrade6CommonRelationsClosedTts(bridge, cursor) {
  if (arguments.length !== 2) fail('arguments');
  try { auditGrade6CommonRelationsVoiceBridge(bridge); }
  catch { fail('bridge'); }
  // After issuance audit the bridge is deeply immutable. The existing actual
  // consumer rejects all caller hooks, extra fields and cursor/default drift,
  // independently renders the current source frame and rechecks cue bindings.
  let currentCue;
  try { currentCue = createGrade6CommonRelationsCurrentVoiceCue(bridge, cursor); }
  catch { fail('cursor'); }
  const voiceRequest = currentCue.voiceRequest;
  const frame = currentCue.frame, locked = frame.responseLocked;
  const current = { contextId: frame.contextId, cueId: frame.cueId, order: frame.cueIndex, kind: frame.kind, responseLocked: locked };
  const binding = {
    currentRequestSha256: voiceRequest?.contentSha256 ?? null,
    transcriptSha256: voiceRequest?.cue.transcriptSha256 ?? null,
    contextId: frame.contextId, cueId: frame.cueId, order: frame.cueIndex, kind: frame.kind,
    bridgeSHA: currentCue.manifest.bridgeContentSha256,
  };
  const candidate = voiceRequest === null ? null : protocolCandidate(voiceRequest);
  const status = locked ? 'locked_no_request' : candidate === null ? 'unsupported_provider_candidate' : 'documented_unverified_candidate';
  const limits = {
    artifactAudience: 'editor_only', serializedAuthority: 'none', issuanceScope: 'local_preparation_not_call_grant',
    callsAllowed: false, callBudget: 0, transportCallsMade: 0, transportConfigured: false, retryBudget: 0,
    credentialPresent: false, authorized: false, humanApproval: null, rightsCommercialApproved: false,
    privacyReviewPassed: false, paidBudgetApproved: false, minorTermsReviewPassed: false, endpointVerified: false,
    providerAccountVerified: false, styleApproved: false,
    proposedPcmSampleRate: 24000, proposedPcmChannels: 1, proposedPcmBitsPerSample: 16,
    proposedAudioMaxBytes: 10485760, proposedAudioMaxSeconds: 120, proposedAudioProfileIsLiveBudget: false,
    measuredSpeechSeconds: null, wordAlignmentVerified: false, spokenTextVerified: false,
    voiceIdentityVerified: false, audioGenerated: false, audioBytesVerified: false, liveResponseParsed: false,
    playbackAllowed: false, videoRendered: false, learnerEvidenceCollected: false,
    learnerReady: false, publicationReady: false, productionReady: false,
    newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0,
  };
  const gates = { ...currentCue.manifest.gates };
  const pending = [...new Set([...currentCue.manifest.pending, ...requiredDecisions])];
  const preparation = {
    schemaVersion: 'grade6-common-relations-closed-tts/v1', state: 'held_no_provider_call',
    current, voiceRequest, protocolCandidateStatus: status, protocolCandidate: candidate, binding, limits, gates, pending,
  };
  const metadata = {
    schemaVersion: 'grade6-common-relations-closed-tts-audit/v1', state: 'held_no_provider_call',
    valid: true, preparationSha256: digest(preparation), responseLocked: locked, binding, limits, gates, pending,
  };
  if (bytes(preparation) > 65536 || bytes(metadata) > 16384 || candidate !== null && bytes(candidate.body) > 16384) fail('output_budget');
  freeze(preparation); freeze(metadata); PREPARATIONS.add(preparation); AUDITS.set(preparation, metadata); return preparation;
}

/** Audit only this local issued immutable preparation; copy/JSON/Proxy/hash
 * claimants cannot bind PCM bytes. No response delivery or speech is asserted. */
export function auditGrade6CommonRelationsClosedTts(preparation) {
  if (arguments.length !== 1) fail('arguments');
  if (!preparation || typeof preparation !== 'object' || isProxy(preparation) || !PREPARATIONS.has(preparation)) {
    throw new Error('untrusted_common_relations_closed_tts');
  }
  return AUDITS.get(preparation);
}
