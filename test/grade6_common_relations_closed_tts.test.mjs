import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsFactoryPreparation } from '../packages/content-factory/grade6_common_relations_factory_preparation.mjs';
import { createGrade6CommonRelationsVoiceBridge } from '../packages/media/grade6_common_relations_voice_bridge.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { createGrade6CommonRelationsCurrentVoiceCue } from '../packages/media/grade6_common_relations_current_voice_cue.mjs';

const api = await import('../packages/media/grade6_common_relations_closed_tts.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [applicationObservations, semanticMatrix, registry] = await Promise.all([
  'grade6-common-relations-application-observations', 'grade6-source-semantic-candidate-matrix', 'meb-reference-registry',
].map(load));
const sourceBindingInput = { applicationObservations, semanticMatrix,
  sourceRecord: registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') };
const factory = createGrade6CommonRelationsFactoryPreparation(sourceBindingInput);
const provider = { id: 'google-gemini-interactions', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon' };
const style = 'Türkçe, açık ve sıcak bir öğretmen; verilen metni ve birimleri değiştirmeden oku.';
const hash = text => createHash('sha256').update(text).digest('hex');
const bytes = value => Buffer.byteLength(JSON.stringify(value));
function bridge(contextId = 'repeat', declaration = provider, voiceStyle = style) {
  const trace = factory.preparation.contexts.find(row => row.contextId === contextId).trace;
  const voiceJob = createReasonedMediaJob(trace, { provider: declaration, style: voiceStyle });
  return createGrade6CommonRelationsVoiceBridge({ factoryPreparation: factory, sourceBindingInput, contextId, voiceJob });
}
function prepare(...args) {
  assert.equal(typeof api.createGrade6CommonRelationsClosedTts, 'function', 'closed TTS consumer API is missing');
  return api.createGrade6CommonRelationsClosedTts(...args);
}
function audit(...args) {
  assert.equal(typeof api.auditGrade6CommonRelationsClosedTts, 'function', 'closed TTS audit API is missing');
  return api.auditGrade6CommonRelationsClosedTts(...args);
}
const argsError = error => error.message === 'invalid_common_relations_closed_tts_arguments';
const bridgeError = error => error.message === 'invalid_common_relations_closed_tts_bridge';
const cursorError = error => error.message === 'invalid_common_relations_closed_tts_cursor';
const untrusted = error => error.message === 'untrusted_common_relations_closed_tts';

test('missing closed TTS API is measured by a real consumer assertion rather than an import crash', () => {
  assert.equal(typeof api.createGrade6CommonRelationsClosedTts, 'function', 'closed TTS constructor is missing');
  assert.equal(typeof api.auditGrade6CommonRelationsClosedTts, 'function', 'closed TTS audit is missing');
});

// Break: caller-supplied request-shaped data or a shortened page replaces the live current-cue request.
test('actual live bridge recomputes the single full current request with a fixed held state and source-bound receipt', () => {
  const live = bridge(), actual = createGrade6CommonRelationsCurrentVoiceCue(live, {}), result = prepare(live, {}), checked = audit(result);
  assert.deepEqual(Object.keys(result), ['schemaVersion', 'state', 'current', 'voiceRequest', 'protocolCandidateStatus', 'protocolCandidate', 'binding', 'limits', 'gates', 'pending']);
  assert.equal(result.schemaVersion, 'grade6-common-relations-closed-tts/v1');
  assert.equal(result.state, 'held_no_provider_call'); assert.equal(checked.valid, true);
  assert.deepEqual(result.voiceRequest, actual.voiceRequest);
  assert.deepEqual(result.current, { contextId: 'repeat', cueId: 'cue-001-goal', order: 0, kind: 'goal', responseLocked: false });
  assert.deepEqual(result.binding, { currentRequestSha256: actual.voiceRequest.contentSha256,
    transcriptSha256: hash(actual.voiceRequest.cue.transcript), contextId: 'repeat', cueId: 'cue-001-goal', order: 0, kind: 'goal',
    bridgeSHA: actual.manifest.bridgeContentSha256 });
  assert.equal(checked.preparationSha256, hash(`k12.grade6-common-relations.closed-tts/v1:${JSON.stringify(result)}`));
});

// Break: an endpoint, model, voice, user label or synthetic pause is silently rewritten into the proposed provider request.
test('documented candidate has an exact fixed protocol body and no permission to call it', () => {
  for (const voiceId of ['Charon', 'Kore']) {
    const result = prepare(bridge('grouping', { ...provider, voiceId }), { cueIndex: 2 });
    const text = result.voiceRequest.cue.transcript;
    assert.equal(result.protocolCandidateStatus, 'documented_unverified_candidate');
    assert.deepEqual(result.protocolCandidate, { endpoint: 'https://generativelanguage.googleapis.com/v1beta/interactions', method: 'POST',
      docKnown: true, endpointVerified: false, body: {
        model: 'gemini-3.8-flash-tts',
        input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style }] }] }],
        response_format: { type: 'audio', mime_type: 'audio/wav', sample_rate: 24000 },
        generation_config: { speech_config: [{ voice: voiceId }] }, store: false, stream: false,
      } });
    assert.equal(result.protocolCandidate.body.input.length, 1);
    assert.equal(result.protocolCandidate.body.input[0].content.length, 1);
    assert.equal(result.limits.callsAllowed, false); assert.equal(result.limits.callBudget, 0);
    assert.equal(result.limits.transportCallsMade, 0); assert.equal(result.limits.retryBudget, 0);
  }
});

// Break: arbitrary accepted provider declarations are falsely treated as documented protocol support.
test('other issued providers models or voices remain held with no protocol candidate rather than fabricating an endpoint', () => {
  for (const declaration of [{ ...provider, id: 'synthetic-provider' }, { ...provider, modelId: 'other-model' },
    { ...provider, voiceId: 'OtherVoice' }, { ...provider, voiceId: 'charon' }]) {
    const result = prepare(bridge('repeat', declaration), {});
    assert.equal(result.state, 'held_no_provider_call'); assert.equal(result.voiceRequest.provider.voiceId, declaration.voiceId);
    assert.equal(result.protocolCandidate, null); assert.equal(result.protocolCandidateStatus, 'unsupported_provider_candidate');
    assert.equal(audit(result).valid, true); assert.equal(result.limits.callsAllowed, false);
    assert.equal(result.limits.transportCallsMade, 0); assert.equal(result.limits.endpointVerified, false);
  }
});

// Break: protected response metadata or an official protocol bypasses the original reveal-and-completion gate.
test('all protected context cues with incomplete or absent explicit reveal suppress text provider style and single-cue hashes', () => {
  for (const contextId of ['repeat', 'grouping']) {
    const live = bridge(contextId);
    for (const cueIndex of [4, 6, 7, 9]) for (const [progress, reveal] of [[0, false], [0.5, true], [1, false]]) {
      const result = prepare(live, { cueIndex, progress, reveal }), checked = audit(result), json = JSON.stringify(result);
      assert.equal(result.current.responseLocked, true); assert.equal(result.voiceRequest, null);
      assert.equal(result.protocolCandidate, null); assert.equal(result.protocolCandidateStatus, 'locked_no_request');
      assert.equal(result.binding.currentRequestSha256, null); assert.equal(result.binding.transcriptSha256, null);
      assert.equal(checked.binding.currentRequestSha256, null); assert.equal(checked.binding.transcriptSha256, null);
      for (const context of factory.preparation.contexts) for (const cue of context.job.cues) {
        assert.equal(json.includes(cue.transcript), false); assert.equal(json.includes(cue.transcriptSha256), false);
      }
      assert.equal(json.includes(style), false); assert.equal(json.includes(provider.voiceId), false);
      assert.equal(json.includes('generativelanguage.googleapis.com'), false);
    }
  }
});

test('protected result opens only at exact completed progress and explicit reveal but never grants network playback or learner delivery', () => {
  const live = bridge('repeat');
  for (const progress of [0.999999, 1]) {
    const result = prepare(live, { cueIndex: 4, progress, reveal: true });
    assert.equal(result.current.responseLocked, progress !== 1);
    assert.equal(result.voiceRequest === null, progress !== 1);
    if (progress === 1) assert.ok(result.voiceRequest.cue.transcript.includes('24 ve 48'));
    assert.equal(result.limits.callsAllowed, false); assert.equal(result.limits.playbackAllowed, false);
    assert.equal(result.limits.learnerReady, false); assert.equal(result.limits.publicationReady, false);
  }
});

// Break: re-page/progress results are treated as distinct cue synthesis requests or injected pauses are spoken as text.
test('pagination and nonprotected progress preserve the same request and preparation identity with measured time still unknown', () => {
  const live = bridge('grouping'), first = prepare(live, { cueIndex: 2 }), last = prepare(live, { cueIndex: 2, pageIndex: 1, progress: 0.5, reveal: true });
  assert.equal(first.voiceRequest.contentSha256, last.voiceRequest.contentSha256);
  assert.deepEqual(first, last); assert.equal(audit(first).preparationSha256, audit(last).preparationSha256);
  assert.equal(first.voiceRequest.cue.transcript, live.voice.job.cues[2].transcript);
  const check = prepare(live, { cueIndex: 5 });
  assert.equal(check.voiceRequest.thoughtPause.afterCueSeconds, 4); assert.equal(check.voiceRequest.thoughtPause.contextPlannedSeconds, 8);
  assert.equal(check.limits.measuredSpeechSeconds, null); assert.equal(check.limits.wordAlignmentVerified, false);
  assert.deepEqual(check.voiceRequest.literalUnits, ['card_per_package', 'package']);
});

test('all twenty actual current cues keep their complete canonical text and real dimensions with no extra speech labels', () => {
  for (const contextId of ['repeat', 'grouping']) {
    const live = bridge(contextId);
    for (let cueIndex = 0; cueIndex < 10; cueIndex++) {
      const result = prepare(live, { cueIndex, progress: 1, reveal: true }), cue = live.voice.job.cues[cueIndex];
      assert.equal(result.voiceRequest.cue.id, cue.id); assert.equal(result.voiceRequest.cue.order, cueIndex);
      assert.equal(result.protocolCandidate.body.input[0].content[0].text, cue.transcript);
      assert.equal(result.protocolCandidate.body.input[0].content[0].annotations[0].style, style);
      assert.equal(result.binding.transcriptSha256, hash(cue.transcript));
    }
    const result = prepare(live, { cueIndex: 4, progress: 1, reveal: true });
    assert.deepEqual(result.voiceRequest.literalUnits, contextId === 'repeat' ? ['minute'] : ['card_per_package', 'package']);
    assert.ok(result.voiceRequest.cue.transcript.includes(contextId === 'repeat' ? '24 ve 48' : '1, 2, 3, 4, 6 ve 12'));
  }
});

test('supported large multibyte style fits without truncation while an overbudget actual candidate is refused before issuance', () => {
  const maxStyle = 'Ş'.repeat(4096), result = prepare(bridge('grouping', provider, maxStyle), { cueIndex: 2 });
  assert.equal(result.protocolCandidate.body.input[0].content[0].annotations[0].style, maxStyle);
  assert.equal(result.voiceRequest.style.text, maxStyle); assert.ok(bytes(result.protocolCandidate.body) <= 16384);
  assert.ok(bytes(result) <= 65536); assert.ok(bytes(audit(result)) <= 16384);
  const excessive = bridge('repeat', provider, '\ud800'.repeat(4096));
  assert.equal(createGrade6CommonRelationsCurrentVoiceCue(excessive, {}).voiceRequest.style.text.length, 4096);
  assert.throws(() => prepare(excessive, {}), error => error.message === 'invalid_common_relations_closed_tts_output_budget');
});

test('all six human gates and actual upstream pending obligations remain required decisions in every state', () => {
  for (const [live, cursor] of [[bridge(), {}], [bridge('grouping', { ...provider, id: 'synthetic' }), {}], [bridge(), { cueIndex: 4 }]]) {
    const upstream = createGrade6CommonRelationsCurrentVoiceCue(live, cursor), result = prepare(live, cursor);
    assert.ok(Object.values(result.gates).every(value => value === 'pending')); assert.equal(Object.keys(result.gates).length, 6);
    for (const item of upstream.manifest.pending) assert.ok(result.pending.includes(item));
    for (const item of ['scoped_provider_authorization', 'provider_account_credential', 'rights_commercial',
      'adult_editor_minor_terms_review', 'privacy_retention_style_review', 'live_endpoint_schema_and_voice_review', 'paid_budget']) {
      assert.ok(result.pending.includes(item));
    }
    assert.equal(result.limits.credentialPresent, false); assert.equal(result.limits.authorized, false);
    assert.equal(result.limits.humanApproval, null); assert.equal(result.limits.privacyReviewPassed, false);
    assert.equal(result.limits.rightsCommercialApproved, false); assert.equal(result.limits.paidBudgetApproved, false);
  }
});

// Break: caller configuration or approval metadata becomes an execution capability or a request override.
test('exact arity and existing closed cursor deny transport endpoint token response and approval hooks before invocation', () => {
  const live = bridge(); let calls = 0;
  for (const args of [[], [live], [live, {}, {}]]) assert.throws(() => prepare(...args), argsError);
  for (const key of ['transport', 'endpoint', 'credential', 'token', 'approved', 'authorized', 'budget', 'request', 'response', 'provider', 'style']) {
    assert.throws(() => prepare(live, { [key]: key === 'transport' ? () => { calls++; } : true }), cursorError);
  }
  const result = prepare(live, {});
  assert.throws(() => audit(), argsError); assert.throws(() => audit(result, {}), argsError);
  assert.equal(calls, 0);
  assert.deepEqual(Object.keys(api).sort(), ['auditGrade6CommonRelationsClosedTts', 'createGrade6CommonRelationsClosedTts']);
});

test('cursor bounds null values and overbudget own keys fail closed rather than defaulting or changing synthesis scope', () => {
  const live = bridge();
  for (const cursor of [null, 1, '0', { cueIndex: null }, { cueIndex: -1 }, { cueIndex: 10 }, { cueIndex: 1.5 },
    { pageIndex: null }, { pageIndex: 32 }, { pageIndex: 1 }, { progress: null }, { progress: Infinity },
    { progress: -0.1 }, { progress: 1.01 }, { reveal: null }, { reveal: 'true' }, { ['x'.repeat(257)]: 1 },
    Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`unknown${i}`, true]))]) assert.throws(() => prepare(live, cursor), cursorError);
  assert.deepEqual(prepare(live, { cueIndex: -0, pageIndex: -0, progress: -0 }), prepare(live, {}));
});

test('serialized changed fake-approved and wrong-source bridge data cannot authorize even a held preparation', () => {
  const live = bridge();
  for (const value of [structuredClone(live), JSON.parse(JSON.stringify(live)), { ...live }, null, [],
    { valid: true, authorized: true, bridgeSHA: 'a'.repeat(64) }]) assert.throws(() => prepare(value, {}), bridgeError);
  const result = prepare(live, {}), clone = structuredClone(result);
  clone.limits.authorized = true; clone.limits.callsAllowed = true;
  for (const value of [structuredClone(result), JSON.parse(JSON.stringify(result)), { ...result }, clone]) assert.throws(() => audit(value), untrusted);
});

test('getter proxy revoked hidden symbol inherited coercion and sparse cursors execute no hooks and cannot mint local issuance', () => {
  const live = bridge(); let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'cueIndex', { enumerable: true, get() { hooks++; return 0; } });
  const proxy = new Proxy({}, { ownKeys() { hooks++; return []; }, get() { hooks++; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const hidden = {}; Object.defineProperty(hidden, 'reveal', { value: true });
  const primitive = { cueIndex: { [Symbol.toPrimitive]() { hooks++; return 0; } } };
  for (const cursor of [getter, proxy, revoked.proxy, hidden, primitive, Object.create({ reveal: true }), Array(1),
    { [Symbol('scope')]: true }, { toJSON() { hooks++; return {}; } }]) assert.throws(() => prepare(live, cursor), cursorError);
  const getterBridge = {}; Object.defineProperty(getterBridge, 'visual', { get() { hooks++; } });
  for (const value of [new Proxy(live, { get() { hooks++; } }), revoked.proxy, getterBridge]) assert.throws(() => prepare(value, {}), bridgeError);
  const result = prepare(live, {});
  assert.throws(() => audit(new Proxy(result, { get() { hooks++; } })), untrusted);
  assert.throws(() => audit(revoked.proxy), untrusted); assert.equal(hooks, 0);
});

test('frozen bounded metadata audit does not duplicate text body provider or style and never claims a delivered response', () => {
  const live = bridge(), result = prepare(live, {}), checked = audit(result), json = JSON.stringify(checked);
  assert.deepEqual(Object.keys(checked), ['schemaVersion', 'state', 'valid', 'preparationSha256', 'responseLocked', 'binding', 'limits', 'gates', 'pending']);
  assert.equal(Object.isFrozen(result.protocolCandidate.body.input[0].content[0].annotations[0]), true);
  assert.equal(Object.isFrozen(checked.pending), true); assert.equal(Object.isFrozen(result.voiceRequest.cue), true);
  assert.throws(() => { result.protocolCandidate.body.store = true; }, TypeError);
  assert.throws(() => { result.voiceRequest.cue.transcript = 'başka metin'; }, TypeError);
  assert.equal(json.includes(result.voiceRequest.cue.transcript), false); assert.equal(json.includes(style), false);
  assert.equal(json.includes(provider.voiceId), false); assert.equal(json.includes('generativelanguage.googleapis.com'), false);
  assert.ok(bytes(result) <= 65536); assert.ok(bytes(checked) <= 16384); assert.ok(bytes(result.protocolCandidate.body) <= 16384);
  assert.equal(result.limits.proposedPcmSampleRate, 24000); assert.equal(result.limits.proposedPcmChannels, 1);
  assert.equal(result.limits.proposedPcmBitsPerSample, 16); assert.equal(result.limits.proposedAudioMaxBytes, 10485760);
  assert.equal(result.limits.proposedAudioMaxSeconds, 120); assert.equal(result.limits.audioGenerated, false);
  assert.equal(result.limits.audioBytesVerified, false); assert.equal(result.limits.spokenTextVerified, false);
  assert.equal(result.limits.videoRendered, false); assert.equal(result.limits.liveResponseParsed, false);
  assert.equal(result.limits.serializedAuthority, 'none');
});
