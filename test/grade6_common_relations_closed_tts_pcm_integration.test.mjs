import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsFactoryPreparation } from '../packages/content-factory/grade6_common_relations_factory_preparation.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { createGrade6CommonRelationsVoiceBridge } from '../packages/media/grade6_common_relations_voice_bridge.mjs';
import { createGrade6CommonRelationsCurrentVoiceCue } from '../packages/media/grade6_common_relations_current_voice_cue.mjs';

// A missing new implementation is the first RED, not a broken old fixture.
async function optionalModule(name) {
  const url = new URL(`../packages/media/${name}.mjs`, import.meta.url);
  try { return await import(url.href); }
  catch (error) { if (error.code === 'ERR_MODULE_NOT_FOUND' && error.url === url.href) return {}; throw error; }
}
const tts = await optionalModule('grade6_common_relations_closed_tts');
const pcm = await optionalModule('common_relations_pcm_receipt');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function implemented() {
  assert.equal(typeof tts.createGrade6CommonRelationsClosedTts, 'function', 'closed TTS boundary is not implemented');
  assert.equal(typeof tts.auditGrade6CommonRelationsClosedTts, 'function');
  assert.equal(typeof pcm.inspectCommonRelationsPcmWav, 'function', 'actual PCM receipt is not implemented');
  assert.equal(typeof pcm.auditCommonRelationsPcmReceipt, 'function');
  assert.equal(typeof pcm.bindCommonRelationsPcmReceipt, 'function');
  assert.equal(typeof pcm.auditCommonRelationsBoundPcmReceipt, 'function');
}
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
const style = 'Sentetik editör yönergesi: Verilen metni, sayıları ve birimleri değiştirmeden sakin ve açık oku.';
let bindingPromise;
async function sourceBinding() {
  return bindingPromise ??= (async () => {
    const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
    const [applicationObservations, semanticMatrix, registry] = await Promise.all([
      'grade6-common-relations-application-observations', 'grade6-source-semantic-candidate-matrix', 'meb-reference-registry',
    ].map(load));
    return { applicationObservations, semanticMatrix,
      sourceRecord: registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') };
  })();
}
async function bridges(provider) {
  const sourceBindingInput = await sourceBinding();
  const factory = createGrade6CommonRelationsFactoryPreparation(sourceBindingInput);
  const before = JSON.stringify(factory);
  return { factory, before, bridges: factory.preparation.contexts.map(context => ({ context,
    bridge: createGrade6CommonRelationsVoiceBridge({ factoryPreparation: factory, sourceBindingInput,
      contextId: context.contextId, voiceJob: createReasonedMediaJob(context.trace, { provider, style }) }),
  })) };
}
// A local signed-PCM fixture. It is deliberately NOT speech or provider output.
function wave(sampleCount = 6000, seed = 0) {
  const buffer = Buffer.alloc(44 + sampleCount * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(24000, 24); buffer.writeUInt32LE(48000, 28); buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(sampleCount * 2, 40);
  const literals = [-32768, -1, 0, 1, 32767];
  for (let index = 0; index < sampleCount; index++) buffer.writeInt16LE(literals[(index + seed) % literals.length], 44 + index * 2);
  return buffer;
}

test('actual canonical factory can prepare a closed current request and bind a real local PCM receipt without promoting speech', async () => {
  implemented();
  const fx = await bridges({ id: 'google-gemini-interactions', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon' });
  const wav = wave(), receipt = pcm.inspectCommonRelationsPcmWav(wav);
  assert.ok(pcm.auditCommonRelationsPcmReceipt(receipt));
  const { bridge } = fx.bridges[0];
  const preparation = tts.createGrade6CommonRelationsClosedTts(bridge, {});
  const audit = tts.auditGrade6CommonRelationsClosedTts(preparation);
  const current = createGrade6CommonRelationsCurrentVoiceCue(bridge, {});
  assert.equal(audit.responseLocked, false);
  assert.equal(audit.binding.currentRequestSha256, current.voiceRequest.contentSha256);
  assert.equal(audit.binding.transcriptSha256, current.voiceRequest.cue.transcriptSha256);
  assert.ok(pcm.bindCommonRelationsPcmReceipt(preparation, receipt));
  assert.equal(JSON.stringify(fx.factory), fx.before);
});

test('twenty current canonical cues bind distinct requests and real sample metadata but no tone is attested as its words', async () => {
  implemented();
  const fx = await bridges({ id: 'google-gemini-interactions', modelId: 'gemini-3.8-flash-tts', voiceId: 'Kore' });
  const identities = new Set(), prepIdentities = new Set();
  let cases = 0;
  for (const { context, bridge } of fx.bridges) for (const cue of context.job.cues) {
    const cursor = { cueIndex: cue.order, progress: 1, reveal: true };
    const preparation = tts.createGrade6CommonRelationsClosedTts(bridge, cursor);
    const expected = createGrade6CommonRelationsCurrentVoiceCue(bridge, cursor).voiceRequest;
    const ttsAudit = tts.auditGrade6CommonRelationsClosedTts(preparation);
    const wav = wave(6000 + cue.order, cue.order);
    const receipt = pcm.inspectCommonRelationsPcmWav(wav), audioAudit = pcm.auditCommonRelationsPcmReceipt(receipt);
    const bound = pcm.bindCommonRelationsPcmReceipt(preparation, receipt);
    const boundAudit = pcm.auditCommonRelationsBoundPcmReceipt(bound);
    assert.equal(ttsAudit.binding.currentRequestSha256, expected.contentSha256);
    assert.equal(ttsAudit.binding.transcriptSha256, sha(cue.transcript));
    assert.deepEqual(bound.binding, { ...ttsAudit.binding, preparationSha256: ttsAudit.preparationSha256,
      pcmReceiptSha256: audioAudit.receiptSha256 });
    assert.deepEqual(bound.audio, audioAudit.audio);
    assert.deepEqual(boundAudit.binding, bound.binding); assert.deepEqual(boundAudit.audio, bound.audio);
    assert.equal(bound.audio.audioSha256, sha(wav));
    assert.equal(bound.audio.pcmSha256, sha(wav.subarray(44)));
    assert.equal(bound.audio.wavByteLength, wav.length); assert.equal(bound.audio.sampleCount, 6000 + cue.order);
    assert.equal(bound.audio.durationSeconds, (6000 + cue.order) / 24000);
    assert.equal(bound.audio.evidenceOrigin, 'local_unattested_pcm');
    assert.equal(bound.audio.decodedSamplesVerified, true);
    assert.equal(preparation.state, 'held_no_provider_call');
    assert.equal(preparation.protocolCandidateStatus, 'documented_unverified_candidate');
    const body = preparation.protocolCandidate.body;
    assert.equal(body.input[0].content[0].text, cue.transcript);
    assert.equal(body.input[0].content[0].annotations[0].style, style);
    assert.equal(body.store, false); assert.equal(body.stream, false);
    assert.deepEqual(body.response_format, { type: 'audio', mime_type: 'audio/wav', sample_rate: 24000 });
    assert.equal(body.generation_config.speech_config[0].voice, 'Kore');
    assert.equal(body.input.length, 1); assert.equal(body.input[0].content.length, 1);
    assert.equal(Object.hasOwn(body, 'tools'), false); assert.equal(Object.hasOwn(body, 'previous_interaction_id'), false);
    for (const [key, value] of Object.entries(bound.gates)) assert.equal(value, 'pending', key);
    for (const field of ['spokenTranscriptVerified', 'voiceIdentityVerified', 'wordPenAlignmentVerified',
      'audioPlaybackAllowed', 'learnerReady', 'publicationReady', 'productionReady']) {
      assert.equal(bound.limits[field], false, field);
    }
    assert.equal(bound.limits.providerCallsMade, 0);
    assert.equal(bound.limits.providerCallsAllowed, false);
    for (const item of ttsAudit.pending) assert.ok(bound.pending.includes(item), item);
    for (const item of audioAudit.pending) assert.ok(bound.pending.includes(item), item);
    const serialized = JSON.stringify(bound);
    assert.equal(serialized.includes(cue.transcript), false);
    for (const other of context.job.cues) if (other.id !== cue.id) assert.equal(serialized.includes(other.transcriptSha256), false);
    identities.add(ttsAudit.binding.currentRequestSha256); prepIdentities.add(ttsAudit.preparationSha256); cases++;
  }
  assert.equal(cases, 20); assert.equal(identities.size, 20); assert.equal(prepIdentities.size, 20);
  assert.equal(JSON.stringify(fx.factory), fx.before);
});

test('protected results remain locked through both new boundaries and cannot bind even technically valid PCM', async () => {
  implemented();
  const fx = await bridges({ id: 'google-gemini-interactions', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon' });
  const receipt = pcm.inspectCommonRelationsPcmWav(wave());
  let cases = 0;
  for (const { context, bridge } of fx.bridges) for (const cue of context.job.cues.filter(cue => protectedKinds.has(cue.kind))) {
    for (const [progress, reveal] of [[0, false], [.5, true], [1, false], [1 - Number.EPSILON, true]]) {
      const preparation = tts.createGrade6CommonRelationsClosedTts(bridge, { cueIndex: cue.order, progress, reveal });
      const audit = tts.auditGrade6CommonRelationsClosedTts(preparation);
      assert.equal(audit.responseLocked, true); assert.equal(audit.binding.currentRequestSha256, null);
      assert.equal(audit.binding.transcriptSha256, null); assert.equal(preparation.voiceRequest, null);
      assert.equal(preparation.protocolCandidate, null); assert.equal(preparation.protocolCandidateStatus, 'locked_no_request');
      const serialized = JSON.stringify(preparation);
      assert.equal(serialized.includes(cue.transcript), false); assert.equal(serialized.includes(cue.transcriptSha256), false);
      assert.equal(serialized.includes('Charon'), false); assert.equal(serialized.includes(style), false);
      assert.throws(() => pcm.bindCommonRelationsPcmReceipt(preparation, receipt)); cases++;
    }
  }
  assert.equal(cases, 32);
});

test('local unsupported and historical UI provider declarations never become an executable endpoint candidate', async () => {
  implemented();
  const declarations = [
    { id: 'synthetic-tts-provider', modelId: 'synthetic-teacher-v1', voiceId: 'synthetic-baritone' },
    { id: 'google-ai-studio', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon' },
    { id: 'google-gemini-interactions', modelId: 'gemini-3.1-flash-tts-preview', voiceId: 'Charon' },
    { id: 'google-gemini-interactions', modelId: 'gemini-3.8-flash-tts', voiceId: 'voice_custom_not_reviewed' },
  ];
  const receipt = pcm.inspectCommonRelationsPcmWav(wave());
  for (const provider of declarations) for (const { bridge } of (await bridges(provider)).bridges) {
    const preparation = tts.createGrade6CommonRelationsClosedTts(bridge, {});
    assert.equal(preparation.protocolCandidateStatus, 'unsupported_provider_candidate');
    assert.equal(preparation.protocolCandidate, null);
    assert.equal(tts.auditGrade6CommonRelationsClosedTts(preparation).limits.callsAllowed, false);
    const bound = pcm.bindCommonRelationsPcmReceipt(preparation, receipt);
    assert.equal(bound.audio.evidenceOrigin, 'local_unattested_pcm');
    assert.equal(bound.limits.spokenTranscriptVerified, false);
    assert.equal(bound.limits.providerCallsMade, 0);
  }
});

test('one valid PCM tone can bind two different current cues only as unattested bytes, not matching narration', async () => {
  implemented();
  const fx = await bridges({ id: 'google-gemini-interactions', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon' });
  const receipt = pcm.inspectCommonRelationsPcmWav(wave()), { bridge } = fx.bridges[0];
  const first = pcm.bindCommonRelationsPcmReceipt(tts.createGrade6CommonRelationsClosedTts(bridge, {}), receipt);
  const second = pcm.bindCommonRelationsPcmReceipt(tts.createGrade6CommonRelationsClosedTts(bridge, { cueIndex: 1 }), receipt);
  assert.equal(first.audio.audioSha256, second.audio.audioSha256);
  assert.notEqual(first.binding.currentRequestSha256, second.binding.currentRequestSha256);
  assert.notEqual(first.binding.transcriptSha256, second.binding.transcriptSha256);
  for (const result of [first, second]) assert.equal(result.limits.spokenTranscriptVerified, false);
});

test('serialized rehash claims and caller hooks do not authorize either byte binding or provider transport', async () => {
  implemented();
  const fx = await bridges({ id: 'google-gemini-interactions', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon' });
  const { bridge } = fx.bridges[0], receipt = pcm.inspectCommonRelationsPcmWav(wave());
  const preparation = tts.createGrade6CommonRelationsClosedTts(bridge, {});
  const bound = pcm.bindCommonRelationsPcmReceipt(preparation, receipt);
  let hooks = 0;
  const trap = { get: () => { hooks++; throw new Error('private-marker-must-not-be-observed'); },
    ownKeys: () => { hooks++; throw new Error('private-marker-must-not-be-observed'); },
    getPrototypeOf: () => { hooks++; throw new Error('private-marker-must-not-be-observed'); } };
  for (const claim of [JSON.parse(JSON.stringify(preparation)), { ...preparation }, structuredClone(preparation), new Proxy(preparation, trap)]) {
    assert.throws(() => pcm.bindCommonRelationsPcmReceipt(claim, new Proxy(receipt, trap)));
    assert.throws(() => tts.auditGrade6CommonRelationsClosedTts(claim));
  }
  for (const claim of [JSON.parse(JSON.stringify(receipt)), { ...receipt }, structuredClone(receipt), new Proxy(receipt, trap)]) {
    assert.throws(() => pcm.bindCommonRelationsPcmReceipt(preparation, claim));
    assert.throws(() => pcm.auditCommonRelationsPcmReceipt(claim));
  }
  for (const claim of [JSON.parse(JSON.stringify(bound)), { ...bound }, structuredClone(bound), new Proxy(bound, trap)]) {
    assert.throws(() => pcm.auditCommonRelationsBoundPcmReceipt(claim));
  }
  for (const injected of ['transport', 'fetch', 'endpoint', 'credential', 'apiKey', 'approved', 'budget', 'response']) {
    const options = Object.defineProperty({}, injected, { enumerable: true, get: () => { hooks++; return 'private-marker'; } });
    assert.throws(() => tts.createGrade6CommonRelationsClosedTts(bridge, options));
  }
  assert.equal(hooks, 0);
});
