import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { createGrade6CommonRelationsFactoryPreparation } from '../packages/content-factory/grade6_common_relations_factory_preparation.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { createGrade6CommonRelationsVoiceBridge } from '../packages/media/grade6_common_relations_voice_bridge.mjs';

const target = new URL('../packages/media/common_relations_pcm_receipt.mjs', import.meta.url);
const api = await import(target.href).catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && error.url === target.href) return {};
  throw error;
});
function inspect() {
  assert.equal(typeof api.inspectCommonRelationsPcmWav, 'function', 'PCM byte consumer export is not implemented');
  return api.inspectCommonRelationsPcmWav;
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const size = value => Buffer.byteLength(JSON.stringify(value));
const invalid = error => /^(?:invalid_common_relations_pcm_(?:arguments|bytes|binding)|unsupported_common_relations_pcm_wav|untrusted_common_relations_(?:pcm_receipt|bound_pcm_receipt)|common_relations_pcm_response_locked)$/u.test(error.message);
const noSpeech = value => {
  for (const field of ['teacherSpeechVerified', 'spokenTranscriptVerified', 'voiceIdentityVerified', 'listenerVerified',
    'wordPenAlignmentVerified', 'audioPlaybackAllowed', 'providerDeliveryVerified', 'learnerReady', 'publicationReady', 'productionReady']) {
    assert.equal(value.limits[field], false, field);
  }
  assert.equal(value.limits.providerCallsMade, 0);
  assert.equal(value.limits.providerCallsAllowed, false);
  assert.deepEqual(value.gates, { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' });
};
let fixturePromise;
async function fixtures() {
  inspect();
  assert.equal(typeof api.bindCommonRelationsPcmReceipt, 'function');
  return fixturePromise ??= (async () => {
    const tts = await import('../packages/media/grade6_common_relations_closed_tts.mjs');
    const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
    const [applicationObservations, semanticMatrix, main] = await Promise.all([
      'grade6-common-relations-application-observations', 'grade6-source-semantic-candidate-matrix', 'meb-reference-registry',
    ].map(load));
    const sourceBindingInput = { applicationObservations, semanticMatrix,
      sourceRecord: main.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') };
    const factory = createGrade6CommonRelationsFactoryPreparation(sourceBindingInput);
    const contexts = factory.preparation.contexts.map(context => {
      const voiceJob = createReasonedMediaJob(context.trace, { provider: { id: 'synthetic-tts-provider', modelId: 'synthetic-model', voiceId: 'synthetic-voice' }, style: 'Sentetik test yönergesi; metni değiştirme.' });
      const bridge = createGrade6CommonRelationsVoiceBridge({ factoryPreparation: factory, sourceBindingInput, contextId: context.contextId, voiceJob });
      return { context, bridge, open: tts.createGrade6CommonRelationsClosedTts(bridge, {}),
        locked: tts.createGrade6CommonRelationsClosedTts(bridge, { cueIndex: 4, progress: 1, reveal: false }) };
    });
    return { tts, contexts, factory };
  })();
}
function wav(sampleCount = 6000) {
  const bytes = Buffer.alloc(44 + sampleCount * 2);
  bytes.write('RIFF', 0); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(24000, 24); bytes.writeUInt32LE(48000, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(sampleCount * 2, 40);
  [-32768, -1, 0, 1, 32767].forEach((sample, index) => bytes.writeInt16LE(sample, 44 + index * 2));
  bytes.writeInt16LE(7, bytes.length - 2); return bytes;
}

test('PCM consumer assertion precedes any future TTS import and every signed sample including the final sample is decoded', () => {
  const parse = inspect(), bytes = wav(), receipt = parse(bytes);
  assert.equal(receipt.sampleCount, 6000); assert.equal(receipt.durationSeconds, .25);
  assert.deepEqual(receipt.durationFraction, { numerator: 6000, denominator: 24000 });
  assert.deepEqual(receipt.decodeStats, { min: -32768, max: 32767, peakAbsolute: 32768, nonzeroSampleCount: 5 });
  assert.equal(receipt.audioSha256, sha(bytes)); assert.equal(receipt.pcmSha256, sha(bytes.subarray(44)));
  assert.equal(receipt.wavByteLength, 12044); assert.equal(receipt.pcmByteLength, 12000);
  assert.equal(receipt.sampleRateHz, 24000); assert.equal(receipt.channelCount, 1); assert.equal(receipt.bitsPerSample, 16);
  assert.equal(receipt.decodedSamplesVerified, true); assert.equal(receipt.evidenceOrigin, 'local_unattested_pcm');
});

test('silence is a valid technical waveform but cannot assert speech identity listening delivery or playback', () => {
  const parse = inspect(), bytes = wav(); bytes.fill(0, 44);
  const receipt = parse(bytes), audit = api.auditCommonRelationsPcmReceipt(receipt);
  assert.deepEqual(receipt.decodeStats, { min: 0, max: 0, peakAbsolute: 0, nonzeroSampleCount: 0 });
  assert.equal(receipt.silenceAcceptedTechnicalOnly, true); noSpeech(receipt); noSpeech(audit);
  assert.equal(audit.valid, true); assert.equal(audit.receiptSha256, receipt.contentSha256);
  assert.equal(audit.audio.audioSha256, sha(bytes));
});

test('the last sample participates in decode and PCM hash and a later caller byte mutation cannot stale a receipt', () => {
  const parse = inspect(), bytes = wav(), first = parse(bytes), firstAudit = api.auditCommonRelationsPcmReceipt(first);
  const changed = Buffer.from(bytes); changed.writeInt16LE(0, changed.length - 2);
  const second = parse(changed);
  assert.equal(second.decodeStats.nonzeroSampleCount, 4); assert.notEqual(second.pcmSha256, first.pcmSha256);
  assert.equal(first.decodeStats.nonzeroSampleCount, 5);
  bytes.fill(0); assert.equal(api.auditCommonRelationsPcmReceipt(first).receiptSha256, firstAudit.receiptSha256);
  assert.equal(first.pcmSha256, firstAudit.audio.pcmSha256);
});

test('inclusive quarter-second and two-minute sample bounds accept complete decode while adjacent bounds and oversized bytes fail', () => {
  const parse = inspect(); assert.equal(parse(wav()).durationSeconds, .25);
  const maximum = parse(wav(2880000));
  assert.equal(maximum.durationSeconds, 120); assert.equal(maximum.sampleCount, 2880000);
  assert.equal(maximum.pcmByteLength, 5760000); assert.equal(maximum.wavByteLength, 5760044);
  assert.deepEqual(maximum.decodeStats, { min: -32768, max: 32767, peakAbsolute: 32768, nonzeroSampleCount: 5 });
  for (const value of [wav(5999), wav(2880001), Buffer.alloc(10 * 1024 * 1024 + 1)]) assert.throws(() => parse(value), invalid);
});

test('canonical header arithmetic rejects the legacy Google byteRate defect and other formats rather than repairing them', () => {
  const parse = inspect();
  const changes = [bytes => bytes.write('RIFX', 0), bytes => bytes.write('RF64', 0), bytes => bytes.write('NOPE', 8),
    bytes => bytes.writeUInt32LE(bytes.length - 9, 4), bytes => bytes.writeUInt32LE(0xffffffff, 4),
    bytes => bytes.writeUInt32LE(18, 16), bytes => bytes.writeUInt16LE(3, 20), bytes => bytes.writeUInt16LE(65534, 20),
    bytes => bytes.writeUInt16LE(2, 22), bytes => bytes.writeUInt32LE(22050, 24), bytes => bytes.writeUInt32LE(48000, 24),
    bytes => bytes.writeUInt32LE(96000, 28), bytes => bytes.writeUInt32LE(47999, 28), bytes => bytes.writeUInt32LE(0, 28),
    bytes => bytes.writeUInt16LE(1, 32), bytes => bytes.writeUInt16LE(4, 32), bytes => bytes.writeUInt16LE(8, 34),
    bytes => bytes.writeUInt16LE(24, 34), bytes => bytes.writeUInt32LE(0, 40), bytes => bytes.writeUInt32LE(12001, 40),
    bytes => bytes.writeUInt32LE(0xffffffff, 40)];
  for (const change of changes) { const value = wav(); change(value); assert.throws(() => parse(value), invalid); }
});

test('only exact fmt16 then one data chunk is supported and metadata duplicate reordered trailing and truncated layouts are rejected', () => {
  const parse = inspect(), original = wav();
  const riff = chunks => { const value = Buffer.concat([original.subarray(0, 12), ...chunks]); value.writeUInt32LE(value.length - 8, 4); return value; };
  const fmt = original.subarray(12, 36), data = original.subarray(36), junk = Buffer.from([74, 85, 78, 75, 1, 0, 0, 0, 17, 0]);
  const unknown = Buffer.from(original); unknown.write('JUNK', 12);
  for (const value of [riff([fmt, fmt, data]), riff([data, fmt]), riff([fmt, data, data]), riff([fmt, junk, data]),
    riff([fmt, data, junk]), unknown, original.subarray(0, 43), original.subarray(0, original.length - 1),
    Buffer.concat([original, Buffer.from([0])])]) assert.throws(() => parse(value), invalid);
});

test('byte input rejects proxies fake byte brands altered prototypes and nonnative values without invoking hooks', () => {
  const parse = inspect(); let hooks = 0; const hook = () => { hooks++; throw new Error('private-caller-payload'); };
  const proxy = new Proxy(wav(), { get: hook, getPrototypeOf: hook, ownKeys: hook, getOwnPropertyDescriptor: hook });
  const revoked = Proxy.revocable(wav(), {}); revoked.revoke();
  const fake = Object.create(Buffer.prototype), subclass = wav(); Object.setPrototypeOf(subclass, Object.create(Buffer.prototype));
  const values = [proxy, revoked.proxy, fake, subclass, new Uint8Array(wav()), new ArrayBuffer(12044), [], 'RIFF', {}, null];
  for (const value of values) assert.throws(() => parse(value), invalid);
  assert.equal(hooks, 0);
});

test('unused native byte-view and backing decorations cannot affect private bytes metadata or invoke hooks', () => {
  const parse = inspect(), clean = wav(), expected = parse(clean), decorated = wav();
  let hooks = 0; const hook = () => { hooks++; throw new Error('private-unused-decoration'); };
  for (const key of ['length', 'byteLength', 'byteOffset', 'buffer', 'constructor', 'readInt16LE', 'copy', 'toJSON', 'caller_extra']) {
    Object.defineProperty(decorated, key, { configurable: true, get: hook });
  }
  for (const key of [Symbol.iterator, Symbol.toPrimitive, Symbol.toStringTag]) Object.defineProperty(decorated, key, { get: hook });
  Object.defineProperty(decorated, 'hidden_claim', { value: { publicationReady: true, providerDeliveryVerified: true } });
  const typed = Object.getPrototypeOf(Uint8Array.prototype);
  const backing = Object.getOwnPropertyDescriptor(typed, 'buffer').get.call(decorated);
  Object.defineProperty(backing, 'byteLength', { get: hook });
  Object.defineProperty(backing, 'resizable', { get: hook });
  Object.defineProperty(backing, 'unused', { get: hook });
  const actual = parse(decorated);
  assert.deepEqual(actual, expected); assert.equal(hooks, 0); noSpeech(actual);
  assert.equal(JSON.stringify(actual).includes('hidden_claim'), false);
  assert.equal(JSON.stringify(actual).includes('private-unused-decoration'), false);
});

test('maximum WAV snapshot does not enumerate millions of byte-view own keys or descriptors', () => {
  const parse = inspect(), bytes = wav(2880000), backing = bytes.buffer;
  const targets = new Set([bytes, backing]), originals = [], calls = [];
  for (const [object, name] of [[Reflect, 'ownKeys'], [Object, 'keys'], [Object, 'getOwnPropertyNames'],
    [Object, 'getOwnPropertySymbols'], [Object, 'getOwnPropertyDescriptors']]) {
    const original = object[name]; originals.push([object, name, original]);
    object[name] = function (value, ...args) {
      if (targets.has(value)) { calls.push(name); throw new Error('byte_index_enumeration_forbidden'); }
      return original.call(this, value, ...args);
    };
  }
  try {
    const receipt = parse(bytes);
    assert.equal(receipt.sampleCount, 2880000); assert.equal(receipt.durationSeconds, 120);
    assert.equal(receipt.pcmSha256, sha(bytes.subarray(44))); assert.equal(receipt.audioSha256, sha(bytes));
    assert.deepEqual(calls, []);
  } finally { for (const [object, name, original] of originals) object[name] = original; }
});

test('shared resizable detached and backing-prototype altered byte views cannot create a private local snapshot', () => {
  const parse = inspect(), shared = Buffer.from(new SharedArrayBuffer(12044)); wav().copy(shared);
  assert.throws(() => parse(shared), invalid);
  const backing = new ArrayBuffer(12044), detached = Buffer.from(backing); wav().copy(detached);
  structuredClone(backing, { transfer: [backing] }); assert.throws(() => parse(detached), invalid);
  const alteredBacking = new ArrayBuffer(12044), altered = Buffer.from(alteredBacking); wav().copy(altered);
  Object.setPrototypeOf(alteredBacking, Object.create(ArrayBuffer.prototype)); assert.throws(() => parse(altered), invalid);
  const resizable = new ArrayBuffer(12044, { maxByteLength: 12046 });
  const getter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'resizable')?.get;
  if (getter?.call(resizable)) { const view = Buffer.from(resizable); wav().copy(view); assert.throws(() => parse(view), invalid); }
});

test('a native view indistinguishable from an ordinary Buffer does not gain allocation provenance or speech authority', () => {
  const parse = inspect(), view = new Uint8Array(wav()); Object.setPrototypeOf(view, Buffer.prototype);
  const receipt = parse(view); assert.equal(receipt.sampleCount, 6000); noSpeech(receipt);
  assert.equal(receipt.evidenceOrigin, 'local_unattested_pcm');
});

test('receipt audits accept only their locally issued capabilities not clones rehashed claims proxies or caller approval fields', () => {
  const receipt = inspect()(wav());
  for (const value of [structuredClone(receipt), JSON.parse(JSON.stringify(receipt)), { ...receipt, decodedSamplesVerified: true },
    { ...receipt, limits: { ...receipt.limits, publicationReady: true }, contentSha256: 'a'.repeat(64) }, new Proxy(receipt, {})]) {
    assert.throws(() => api.auditCommonRelationsPcmReceipt(value), invalid);
  }
  assert.throws(() => api.auditCommonRelationsPcmReceipt(), invalid);
  assert.throws(() => api.auditCommonRelationsPcmReceipt(receipt, {}), invalid);
});

test('issued metadata is bounded deeply immutable independently hashed and exposes no raw PCM or per-sample array', () => {
  const receipt = inspect()(wav()), { contentSha256, ...body } = receipt;
  assert.equal(contentSha256, sha('k12.common-relations.pcm-receipt/v1:' + JSON.stringify(body)));
  assert.ok(size(receipt) <= 16384); assert.equal(Object.isFrozen(receipt.decodeStats), true);
  assert.throws(() => { receipt.decodeStats.nonzeroSampleCount = 0; }, TypeError);
  for (const key of ['bytes', 'pcm', 'samples', 'path', 'transcript', 'provider', 'style']) assert.equal(Object.hasOwn(receipt, key), false);
  noSpeech(receipt);
});

test('genuine unsupported-provider held preparations bind only one current cue hash to technical local PCM metadata', async () => {
  const fx = await fixtures(), receipt = inspect()(wav()), before = JSON.stringify(fx.factory);
  for (const { context, open } of fx.contexts) {
    const closedAudit = fx.tts.auditGrade6CommonRelationsClosedTts(open), bound = api.bindCommonRelationsPcmReceipt(open, receipt);
    assert.deepEqual(bound.binding, { ...closedAudit.binding, preparationSha256: closedAudit.preparationSha256, pcmReceiptSha256: receipt.contentSha256 });
    assert.equal(bound.binding.contextId, context.contextId); assert.equal(bound.binding.order, 0);
    assert.equal(bound.audio.audioSha256, receipt.audioSha256); assert.equal(bound.audio.sampleCount, 6000);
    assert.equal(bound.audio.evidenceOrigin, 'local_unattested_pcm'); noSpeech(bound);
    assert.equal(api.auditCommonRelationsBoundPcmReceipt(bound).boundReceiptSha256, bound.contentSha256);
    for (const cue of context.job.cues) assert.equal(JSON.stringify(bound).includes(cue.transcript), false);
    for (const pending of closedAudit.pending) assert.ok(bound.pending.includes(pending), pending);
    const { contentSha256, ...body } = bound;
    assert.equal(contentSha256, sha('k12.common-relations.bound-pcm-receipt/v1:' + JSON.stringify(body)));
  }
  assert.equal(JSON.stringify(fx.factory), before);
});

test('valid wrong-tone or garden-compatible PCM can only be local unattested data and never proves the current narration was spoken', async () => {
  const fx = await fixtures(), first = wav(), second = wav(); second.fill(0, 44);
  const a = api.bindCommonRelationsPcmReceipt(fx.contexts[0].open, inspect()(first));
  const b = api.bindCommonRelationsPcmReceipt(fx.contexts[0].open, inspect()(second));
  assert.equal(a.binding.currentRequestSha256, b.binding.currentRequestSha256);
  assert.notEqual(a.audio.pcmSha256, b.audio.pcmSha256); noSpeech(a); noSpeech(b);
  assert.equal(a.limits.providerDeliveryVerified, false); assert.equal(b.limits.teacherSpeechVerified, false);
});

test('closed preparation authority and protected locks are checked before receipt data and all rejected calls remain hook-free', async () => {
  const fx = await fixtures(), receipt = inspect()(wav()); let hooks = 0;
  const hook = () => { hooks++; throw new Error('private-secret-path'); };
  const hostile = new Proxy({}, { get: hook, getPrototypeOf: hook, ownKeys: hook });
  const getter = Object.defineProperty({}, 'contentSha256', { get: hook });
  for (const { open, locked } of fx.contexts) {
    for (const badReceipt of [hostile, getter, structuredClone(receipt)]) assert.throws(() => api.bindCommonRelationsPcmReceipt(locked, badReceipt), error => error.message === 'common_relations_pcm_response_locked');
    for (const badPrep of [hostile, getter, structuredClone(open), null]) assert.throws(() => api.bindCommonRelationsPcmReceipt(badPrep, hostile), invalid);
    assert.throws(() => api.bindCommonRelationsPcmReceipt(open, hostile), invalid);
  }
  assert.equal(hooks, 0);
});

test('exact API arities and bound receipt audits reject missing extra foreign and serialized authority without echoing callers', async () => {
  const parse = inspect(); for (const args of [[], [wav(), {}]]) assert.throws(() => parse(...args), invalid);
  const fx = await fixtures(), receipt = parse(wav()), prep = fx.contexts[0].open;
  for (const args of [[], [prep], [prep, receipt, {}]]) assert.throws(() => api.bindCommonRelationsPcmReceipt(...args), invalid);
  const bound = api.bindCommonRelationsPcmReceipt(prep, receipt);
  for (const value of [receipt, structuredClone(bound), JSON.parse(JSON.stringify(bound)), new Proxy(bound, {}), {}]) assert.throws(() => api.auditCommonRelationsBoundPcmReceipt(value), invalid);
  assert.throws(() => api.auditCommonRelationsBoundPcmReceipt(), invalid);
  assert.throws(() => api.auditCommonRelationsBoundPcmReceipt(bound, {}), invalid);
});
