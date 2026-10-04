import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { isProxy, isUint8Array, isSharedArrayBuffer } from 'node:util/types';
import { auditGrade6CommonRelationsClosedTts } from './grade6_common_relations_closed_tts.mjs';

const RECEIPTS = new WeakSet(), RECEIPT_AUDITS = new WeakMap();
const BOUND = new WeakSet(), BOUND_AUDITS = new WeakMap();
const BYTE_LIMIT = 10 * 1024 * 1024, PCM_MIN = 12000, PCM_MAX = 5760000;
const typedPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const getByteLength = Object.getOwnPropertyDescriptor(typedPrototype, 'byteLength').get;
const getByteOffset = Object.getOwnPropertyDescriptor(typedPrototype, 'byteOffset').get;
const getBacking = Object.getOwnPropertyDescriptor(typedPrototype, 'buffer').get;
const backingLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get;
const backingResizable = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'resizable')?.get;
const setBytes = Uint8Array.prototype.set, alloc = Buffer.alloc;
const readSample = Buffer.prototype.readInt16LE, sliceBytes = Buffer.prototype.subarray;
const fail = code => { throw new Error(code); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const digest = (kind, body) => hash(`k12.common-relations.${kind}/v1:${JSON.stringify(body)}`);
const size = value => Buffer.byteLength(JSON.stringify(value));
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); if (!Object.isFrozen(value)) Object.freeze(value); }
  return value;
};
const gates = () => ({ activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' });
const limits = () => ({ artifactAudience: 'editor_only', serializedAuthority: 'none', providerCallsMade: 0, providerCallsAllowed: false,
  teacherSpeechVerified: false, spokenTranscriptVerified: false, voiceIdentityVerified: false, listenerVerified: false,
  wordPenAlignmentVerified: false, audioPlaybackAllowed: false, providerDeliveryVerified: false,
  learnerReady: false, publicationReady: false, productionReady: false, humanApproval: null,
  rawBytesRetained: false, rawBytesExposed: false, sourceFilesRead: 0, derivativeCreated: false,
  wavProfile: 'canonical_riff_fmt16_data_only', maxInputBytes: BYTE_LIMIT, minSeconds: .25, maxSeconds: 120 });
const pending = () => ['teacher_speech_and_transcript_not_verified', 'voice_identity_not_verified', 'teacher_listener_review',
  'word_pen_alignment_not_measured', 'provider_delivery_not_attested', 'file_race_and_derivative_verification_not_performed',
  'rights_owner_retention_and_student_delivery_review'];
const u16 = (bytes, offset) => bytes[offset] + bytes[offset + 1] * 256;
const u32 = (bytes, offset) => bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65536 + bytes[offset + 3] * 16777216;
const magic = (bytes, offset, text) => [...text].every((character, index) => bytes[offset + index] === character.charCodeAt(0));

function header(bytes, length) {
  if (length < 44 || length > PCM_MAX + 44 || !magic(bytes, 0, 'RIFF') || !magic(bytes, 8, 'WAVE')
    || u32(bytes, 4) !== length - 8 || !magic(bytes, 12, 'fmt ') || u32(bytes, 16) !== 16
    || u16(bytes, 20) !== 1 || u16(bytes, 22) !== 1 || u32(bytes, 24) !== 24000
    || u32(bytes, 28) !== 48000 || u16(bytes, 32) !== 2 || u16(bytes, 34) !== 16 || !magic(bytes, 36, 'data')) {
    fail('unsupported_common_relations_pcm_wav');
  }
  const dataLength = u32(bytes, 40);
  if (dataLength < PCM_MIN || dataLength > PCM_MAX || dataLength % 2 !== 0 || dataLength + 44 !== length) fail('unsupported_common_relations_pcm_wav');
  return dataLength;
}

function privateSnapshot(input) {
  if (!input || typeof input !== 'object' || isProxy(input) || !isUint8Array(input)
    || Object.getPrototypeOf(input) !== Buffer.prototype) fail('invalid_common_relations_pcm_bytes');
  const length = getByteLength.call(input), offset = getByteOffset.call(input), backing = getBacking.call(input);
  if (length < 44 || length > BYTE_LIMIT || isSharedArrayBuffer(backing) || Object.getPrototypeOf(backing) !== ArrayBuffer.prototype
    || backingResizable?.call(backing)) {
    fail('invalid_common_relations_pcm_bytes');
  }
  const backingBytes = backingLength.call(backing);
  if (offset > backingBytes || length > backingBytes - offset) fail('invalid_common_relations_pcm_bytes');
  // Numeric indexed access on a real non-shared native byte view cannot be
  // replaced with caller accessors. Unused named/symbol decorations are not
  // read or retained; enumerating millions of numeric keys would amplify RAM.
  // Never call caller length/copy/iterator/read/toJSON/constructor methods.
  header(input, length);
  const copy = alloc(length); setBytes.call(copy, input); header(copy, length); return copy;
}

/** Strict two-chunk local byte decode, not source, provider or speech evidence.
 * A native Uint8Array with Buffer.prototype is indistinguishable from an
 * ordinary Buffer here: this checks its technical view, not allocation origin. */
export function inspectCommonRelationsPcmWav(wavBytes) {
  if (arguments.length !== 1) fail('invalid_common_relations_pcm_arguments');
  let bytes;
  try { bytes = privateSnapshot(wavBytes); }
  catch (error) {
    fail(error?.message === 'unsupported_common_relations_pcm_wav' ? error.message : 'invalid_common_relations_pcm_bytes');
  }
  const pcmByteLength = bytes.length - 44, sampleCount = pcmByteLength / 2;
  let min = 32767, max = -32768, peakAbsolute = 0, nonzeroSampleCount = 0;
  for (let index = 0; index < sampleCount; index++) {
    const sample = readSample.call(bytes, 44 + index * 2);
    min = Math.min(min, sample); max = Math.max(max, sample); peakAbsolute = Math.max(peakAbsolute, Math.abs(sample));
    if (sample !== 0) nonzeroSampleCount++;
  }
  const audio = { audioSha256: hash(bytes), wavByteLength: bytes.length,
    pcmSha256: hash(sliceBytes.call(bytes, 44)), pcmByteLength, sampleCount, sampleRateHz: 24000, channelCount: 1,
    bitsPerSample: 16, sampleFormat: 'signed_16_le', durationSeconds: pcmByteLength / 48000,
    durationFraction: { numerator: sampleCount, denominator: 24000 }, decodedSamplesVerified: true,
    decodeStats: { min, max, peakAbsolute, nonzeroSampleCount }, evidenceOrigin: 'local_unattested_pcm', silenceAcceptedTechnicalOnly: true };
  const receipt = { schemaVersion: 'common-relations-pcm-receipt/v1', state: 'local_pcm_decoded_unattested',
    ...audio, limits: limits(), gates: gates(), pending: pending() };
  receipt.contentSha256 = digest('pcm-receipt', receipt);
  const audit = { schemaVersion: 'common-relations-pcm-receipt-audit/v1', state: receipt.state, valid: true,
    receiptSha256: receipt.contentSha256, audio, limits: receipt.limits, gates: receipt.gates, pending: receipt.pending };
  if (size(receipt) > 16384 || size(audit) > 16384) fail('invalid_common_relations_pcm_bytes');
  freeze(receipt); freeze(audit); RECEIPTS.add(receipt); RECEIPT_AUDITS.set(receipt, audit); return receipt;
}

/** Only a locally issued technical receipt, never a serialized byte claim. */
export function auditCommonRelationsPcmReceipt(receipt) {
  if (arguments.length !== 1) fail('invalid_common_relations_pcm_arguments');
  if (!receipt || typeof receipt !== 'object' || isProxy(receipt) || !RECEIPTS.has(receipt)) fail('untrusted_common_relations_pcm_receipt');
  return RECEIPT_AUDITS.get(receipt);
}

/** Binds a metadata pointer only. Even matching hashes cannot attest that this
 * local PCM contains the current words or came from the declared provider. */
export function bindCommonRelationsPcmReceipt(closedTtsPreparation, receipt) {
  if (arguments.length !== 2) fail('invalid_common_relations_pcm_arguments');
  let closed;
  try { closed = auditGrade6CommonRelationsClosedTts(closedTtsPreparation); }
  catch { fail('invalid_common_relations_pcm_binding'); }
  // No receipt properties or audit are read before the actual live preparation
  // and its protected-response gate have been checked.
  if (closed.responseLocked) fail('common_relations_pcm_response_locked');
  const binding = closed.binding, validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
  if (closed.valid !== true || closed.state !== 'held_no_provider_call' || !validHash(closed.preparationSha256)
    || !validHash(binding.currentRequestSha256) || !validHash(binding.transcriptSha256) || !validHash(binding.bridgeSHA)
    || !['repeat', 'grouping'].includes(binding.contextId) || !Number.isSafeInteger(binding.order) || binding.order < 0 || binding.order >= 10
    || Object.keys(closed.gates).length !== 6 || Object.keys(gates()).some(key => closed.gates[key] !== 'pending')) fail('invalid_common_relations_pcm_binding');
  const pcm = auditCommonRelationsPcmReceipt(receipt);
  const bound = { schemaVersion: 'common-relations-bound-pcm-receipt/v1', state: 'local_pcm_metadata_bound_unattested',
    binding: { ...binding, preparationSha256: closed.preparationSha256, pcmReceiptSha256: pcm.receiptSha256 },
    audio: pcm.audio, limits: limits(), gates: { ...closed.gates },
    pending: [...new Set([...closed.pending, ...pcm.pending, 'pcm_metadata_pointer_not_spoken_transcript_proof'])] };
  bound.contentSha256 = digest('bound-pcm-receipt', bound);
  const audit = { schemaVersion: 'common-relations-bound-pcm-receipt-audit/v1', state: bound.state, valid: true,
    boundReceiptSha256: bound.contentSha256, binding: bound.binding, audio: bound.audio,
    limits: bound.limits, gates: bound.gates, pending: bound.pending };
  if (size(bound) > 16384 || size(audit) > 16384) fail('invalid_common_relations_pcm_binding');
  freeze(bound); freeze(audit); BOUND.add(bound); BOUND_AUDITS.set(bound, audit); return bound;
}

export function auditCommonRelationsBoundPcmReceipt(boundReceipt) {
  if (arguments.length !== 1) fail('invalid_common_relations_pcm_arguments');
  if (!boundReceipt || typeof boundReceipt !== 'object' || isProxy(boundReceipt) || !BOUND.has(boundReceipt)) fail('untrusted_common_relations_bound_pcm_receipt');
  return BOUND_AUDITS.get(boundReceipt);
}
