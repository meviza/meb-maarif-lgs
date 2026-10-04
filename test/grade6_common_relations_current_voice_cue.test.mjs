import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsFactoryPreparation } from '../packages/content-factory/grade6_common_relations_factory_preparation.mjs';
import { createReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';

const consumer = await import('../packages/media/grade6_common_relations_current_voice_cue.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && error.url === new URL('../packages/media/grade6_common_relations_current_voice_cue.mjs', import.meta.url).href) return {};
  throw error;
});
function create() {
  assert.equal(typeof consumer.createGrade6CommonRelationsCurrentVoiceCue, 'function', 'current voice cue consumer export is not implemented');
  return consumer.createGrade6CommonRelationsCurrentVoiceCue;
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = value => Buffer.byteLength(JSON.stringify(value));
const provider = { id: 'synthetic-tts-provider', modelId: 'synthetic-teacher-v1', voiceId: 'synthetic-baritone' };
const style = 'Sentetik test yönergesi: sabit Türkçe metni, sayıları ve birimleri değiştirme.';
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
let fixturePromise;
async function fixtures() {
  create(); // A missing current consumer, never an absent bridge import, is RED.
  return fixturePromise ??= (async () => {
    const bridgeApi = await import('../packages/media/grade6_common_relations_voice_bridge.mjs');
    const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
    const [applicationObservations, semanticMatrix, main] = await Promise.all([
      'grade6-common-relations-application-observations', 'grade6-source-semantic-candidate-matrix', 'meb-reference-registry',
    ].map(load));
    const sourceBindingInput = { applicationObservations, semanticMatrix,
      sourceRecord: main.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') };
    const factory = createGrade6CommonRelationsFactoryPreparation(sourceBindingInput);
    const contexts = factory.preparation.contexts.map(context => {
      const voiceJob = createReasonedMediaJob(context.trace, { provider, style });
      const bridge = bridgeApi.createGrade6CommonRelationsVoiceBridge({ factoryPreparation: factory,
        sourceBindingInput, contextId: context.contextId, voiceJob });
      return { context, voiceJob, bridge };
    });
    return { factory, contexts, bridgeApi, sourceBindingInput };
  })();
}
const invalid = error => /^invalid_common_relations_current_voice_(?:arguments|bridge|options|binding)$/u.test(error.message);
function noFuture(output, context, selected) {
  const text = JSON.stringify(output), current = context.job.cues[selected];
  for (const cue of context.job.cues) if (cue.order !== selected && cue.transcript !== current.transcript) {
    assert.equal(text.includes(cue.transcriptSha256), false, `${cue.kind} future hash`);
    // Literal overlap already authored inside current text is not extra leakage.
    if (!current.transcript.includes(cue.transcript)) assert.equal(text.includes(cue.transcript), false, `${cue.kind} future text`);
  }
  for (const key of ['cues', 'cueMappings', 'subtitleDraft', 'factoryPreparation', 'bridge', 'voiceJob', 'voiceRequest']) {
    if (key === 'voiceRequest') continue;
    assert.equal(Object.hasOwn(output, key), false);
  }
}

test('current consumer assertion precedes bridge construction and then observes default current text and protected request lock', async () => {
  create();
  const { contexts } = await fixtures(), { bridge, context } = contexts[0];
  assert.equal(create()(bridge, {}).voiceRequest.cue.transcript, context.job.cues[0].transcript);
  const locked = create()(bridge, { cueIndex: 4, progress: 1, reveal: false });
  assert.equal(locked.voiceRequest, null); assert.equal(locked.narrationPacket.fullTranscript, null);
  assert.equal(locked.manifest.voiceRequestSha256, null);
});

test('default repeat and grouping consume real bridge and scene with one current cue rather than a ten-cue request', async () => {
  const fx = await fixtures();
  for (const { bridge, context } of fx.contexts) {
    const output = create()(bridge, {});
    assert.deepEqual(Object.keys(output), ['schemaVersion', 'state', 'frame', 'narrationPacket', 'voiceRequest', 'manifest']);
    assert.equal(output.schemaVersion, 'grade6-common-relations-current-voice-cue/v1');
    assert.equal(output.state, 'draft_only_no_provider_call');
    assert.equal(output.frame.contextId, context.contextId); assert.equal(output.frame.cueIndex, 0);
    assert.equal(output.frame.pageIndex, 0); assert.equal(output.frame.progress, 0);
    assert.equal(output.frame.revealRequested, false); assert.equal(output.frame.resultVisible, false);
    assert.equal(output.voiceRequest.cue.transcript, context.job.cues[0].transcript);
    assert.equal(output.voiceRequest.schemaVersion, 'grade6-common-relations-current-voice-request/v1');
    assert.equal(Object.hasOwn(output.voiceRequest, 'cues'), false);
    noFuture(output, context, 0);
  }
});

test('canonical visual job remains provider-null while same-ID different-SHA voice job and selected declaration bind the current request', async () => {
  const fx = await fixtures(), before = JSON.stringify(fx.factory);
  for (const { bridge, context, voiceJob } of fx.contexts) {
    const { voiceRequest: request } = create()(bridge, {});
    assert.equal(context.job.provider, null);
    assert.equal(voiceJob.id, context.job.id); assert.notEqual(voiceJob.contentSha256, context.job.contentSha256);
    assert.equal(request.visual.jobSha256, context.job.contentSha256); assert.equal(request.voice.jobSha256, voiceJob.contentSha256);
    assert.equal(request.source.contentSha256, context.trace.source.contentSha256);
    assert.equal(request.trace.contentSha256, context.trace.contentSha256);
    assert.deepEqual(request.provider, provider); assert.equal(request.style.text, style); assert.equal(request.style.sha256, sha(style));
    assert.equal(request.cue.styleSha256, sha(style));
  }
  assert.equal(JSON.stringify(fx.factory), before);
});

test('multi-page evidence and plan cues request complete current text and page progress reveal do not change request identity', async () => {
  const fx = await fixtures();
  for (const { bridge, context } of fx.contexts) {
    const cueIndex = context.contextId === 'repeat' ? 1 : 2;
    const initial = create()(bridge, { cueIndex }), full = context.job.cues[cueIndex].transcript;
    assert.ok(initial.frame.pageCount > 1);
    assert.notEqual(initial.frame.selectedPage.lines.join(' '), full);
    for (let pageIndex = 0; pageIndex < initial.frame.pageCount; pageIndex++) for (const progress of [0, .5, 1]) for (const reveal of [false, true]) {
      const output = create()(bridge, { cueIndex, pageIndex, progress, reveal });
      assert.equal(output.voiceRequest.cue.transcript, full);
      assert.equal(output.voiceRequest.contentSha256, initial.voiceRequest.contentSha256);
      assert.equal(output.frame.pageIndex, pageIndex); assert.equal(output.frame.progress, progress);
      assert.equal(output.manifest.current.pageIndex, pageIndex);
      for (const field of ['pageIndex', 'progress', 'reveal', 'selectedPage', 'pages', 'paging']) assert.equal(Object.hasOwn(output.voiceRequest, field), false);
    }
    const { contentSha256, ...body } = initial.voiceRequest;
    assert.equal(contentSha256, sha('k12.grade6-common-relations.current-voice-request/v1:' + JSON.stringify(body)));
  }
});

test('all eight protected context cues keep voice payload and transcript hashes absent until explicit reveal and completed progress on every valid page', async () => {
  const fx = await fixtures();
  const vectors = [[0, false], [.5, false], [1, false], [0, true], [.5, true], [1 - Number.EPSILON, true], [1 - Number.EPSILON, false], [1, true]];
  let protectedCues = 0;
  for (const { bridge, context, voiceJob } of fx.contexts) for (const cue of context.job.cues.filter(cue => protectedKinds.has(cue.kind))) {
    protectedCues++;
    for (const [progress, reveal] of vectors) {
      const first = create()(bridge, { cueIndex: cue.order, progress, reveal });
      for (let pageIndex = 0; pageIndex < first.frame.pageCount; pageIndex++) {
        const output = create()(bridge, { cueIndex: cue.order, progress, reveal, pageIndex });
        const unlocked = progress === 1 && reveal;
        assert.equal(output.frame.responseLocked, !unlocked); assert.equal(output.frame.resultVisible, unlocked);
        if (unlocked) {
          assert.equal(output.voiceRequest.cue.transcript, cue.transcript);
          assert.equal(output.narrationPacket.fullTranscript, cue.transcript);
        } else {
          assert.equal(output.voiceRequest, null); assert.equal(output.manifest.voiceRequestSha256, null);
          assert.equal(output.manifest.componentBytes.voiceRequest, 0);
          assert.equal(output.narrationPacket.fullTranscript, null); assert.equal(output.frame.fullTranscriptSha256, null);
          const serialized = JSON.stringify(output);
          for (const value of [cue.transcript, cue.transcriptSha256, sha(style), style, provider.id, provider.modelId, provider.voiceId,
            voiceJob.contentSha256, bridge.voice.request.contentSha256]) assert.equal(serialized.includes(value), false);
          assert.equal(output.manifest.voicePayloadIncluded, false);
        }
        noFuture(output, context, cue.order);
      }
    }
  }
  assert.equal(protectedCues, 8);
});

test('current request identity separates cue context and selected provider style declarations without asserting a verified endpoint', async () => {
  const fx = await fixtures(), first = fx.contexts[0], base = create()(first.bridge, {});
  const changedProvider = { ...provider, voiceId: 'synthetic-other-voice' };
  const changedStyle = 'Başka sentetik yönerge: sabit metin, sayılar ve birimler korunur.';
  for (const settings of [{ provider: changedProvider, style }, { provider, style: changedStyle }]) {
    const voiceJob = createReasonedMediaJob(first.context.trace, settings);
    const bridge = fx.bridgeApi.createGrade6CommonRelationsVoiceBridge({ factoryPreparation: fx.factory,
      sourceBindingInput: fx.sourceBindingInput, contextId: 'repeat', voiceJob });
    const changed = create()(bridge, {});
    assert.equal(changed.voiceRequest.cue.transcript, base.voiceRequest.cue.transcript);
    assert.notEqual(changed.voiceRequest.contentSha256, base.voiceRequest.contentSha256);
    assert.equal(changed.voiceRequest.endpointVerified, false); assert.equal(changed.voiceRequest.providerCallsAllowed, false);
  }
  assert.notEqual(create()(first.bridge, { cueIndex: 1 }).voiceRequest.contentSha256, base.voiceRequest.contentSha256);
  assert.notEqual(create()(fx.contexts[1].bridge, {}).voiceRequest.contentSha256, base.voiceRequest.contentSha256);
});

// Break: a genuine declared job carries a same/other-context protected cue
// reference in metadata, and an open current goal copies it to the request.
// Added after the upstream repair: downstream characterization, not fake RED.
test('canonical protected references in style or provider are rejected before any current goal request can be emitted', async () => {
  const fx = await fixtures(); let currentCalls = 0, rejected = 0;
  for (const selected of fx.contexts) for (const referenceContext of fx.contexts) {
    for (const cue of referenceContext.context.job.cues.filter(value => protectedKinds.has(value.kind))) {
      const declarations = [cue.transcript, cue.transcriptSha256, cue.transcriptSha256.toUpperCase()]
        .map(reference => ({ provider, style: `Sabit metni oku. ${reference}` }));
      for (const field of ['id', 'modelId', 'voiceId']) for (const reference of [cue.transcriptSha256, cue.transcriptSha256.toUpperCase()]) {
        declarations.push({ provider: { ...provider, [field]: `ref.${reference}` }, style });
      }
      for (const settings of declarations) {
        const voiceJob = createReasonedMediaJob(selected.context.trace, settings);
        assert.equal(voiceJob.cues.length, 10);
        assert.throws(() => {
          const bridge = fx.bridgeApi.createGrade6CommonRelationsVoiceBridge({ factoryPreparation: fx.factory,
            sourceBindingInput: fx.sourceBindingInput, contextId: selected.context.contextId, voiceJob });
          currentCalls++; create()(bridge, {});
        }, error => error.message === 'invalid_common_relations_voice_bridge_input');
        rejected++;
      }
    }
  }
  assert.equal(rejected, 144); assert.equal(currentCalls, 0);
});

// Break: an already-frozen unbranded visual request root skips freezing its
// children, so a stored bridge audit digest can drift before a current call.
test('shallow-frozen canonical visual request becomes deeply immutable and current text request and issued bridge digest remain stable', async () => {
  const fx = await fixtures(), sourceBefore = JSON.stringify(fx.factory);
  for (const selected of fx.contexts) {
    const original = fx.factory.preparation.contexts;
    const request = Object.freeze(structuredClone(selected.context.audioRequest));
    assert.equal(Object.isFrozen(request.cues[0]), false); assert.equal(Object.isFrozen(request.style), false);
    const contexts = original.map(context => context.contextId === selected.context.contextId ? { ...context, audioRequest: request } : context);
    const factoryPreparation = { ...fx.factory, preparation: { ...fx.factory.preparation, contexts } };
    const bridge = fx.bridgeApi.createGrade6CommonRelationsVoiceBridge({ factoryPreparation,
      sourceBindingInput: fx.sourceBindingInput, contextId: selected.context.contextId, voiceJob: selected.voiceJob });
    const audit = fx.bridgeApi.auditGrade6CommonRelationsVoiceBridge(bridge), current = create()(bridge, {});
    assert.equal(bridge.visual.request, request);
    for (const nested of [request.cues, request.cues[0], request.style]) assert.equal(Object.isFrozen(nested), true);
    assert.throws(() => { request.cues[0].transcript = 'Bozuk güncel metin'; }, TypeError);
    assert.throws(() => { request.cues[0].styleSha256 = 'a'.repeat(64); }, TypeError);
    assert.throws(() => { request.style.text = 'Değişmiş style'; }, TypeError);
    const after = create()(bridge, {});
    assert.equal(after.voiceRequest.cue.transcript, selected.context.job.cues[0].transcript);
    assert.equal(after.voiceRequest.contentSha256, current.voiceRequest.contentSha256);
    assert.equal(after.frame.contentSha256, current.frame.contentSha256);
    assert.equal(fx.bridgeApi.auditGrade6CommonRelationsVoiceBridge(bridge).bridgeContentSha256, audit.bridgeContentSha256);
    assert.equal(audit.bridgeContentSha256, sha('k12.grade6-common-relations.voice-bridge/v1:' + JSON.stringify(bridge)));
  }
  assert.equal(JSON.stringify(fx.factory), sourceBefore);
});

test('all current cues omit other cue text and individual hashes while preserving only their own full narration and selected page', async () => {
  const fx = await fixtures();
  for (const { bridge, context } of fx.contexts) for (const cue of context.job.cues) {
    const first = create()(bridge, { cueIndex: cue.order, progress: 1, reveal: true });
    for (let pageIndex = 0; pageIndex < first.frame.pageCount; pageIndex++) {
      const output = create()(bridge, { cueIndex: cue.order, pageIndex, progress: 1, reveal: true });
      assert.equal(output.voiceRequest.cue.transcript, cue.transcript);
      assert.equal(output.voiceRequest.cue.transcriptSha256, sha(cue.transcript));
      noFuture(output, context, cue.order);
      assert.equal(Object.hasOwn(output.manifest, 'provider'), false);
      assert.equal(Object.hasOwn(output.manifest, 'style'), false);
      assert.equal(Object.hasOwn(output.manifest, 'cueMappings'), false);
    }
  }
});

test('literal current result units and authored integer sets remain distinct and pause declarations are not measured speech or word timing', async () => {
  const fx = await fixtures();
  for (const [index, values, units] of [[0, [24, 48], ['minute']], [1, [1, 2, 3, 4, 6, 12], ['card_per_package', 'package']]]) {
    const { bridge } = fx.contexts[index];
    const result = create()(bridge, { cueIndex: 4, progress: 1, reveal: true });
    assert.deepEqual(result.frame.result.values, values); assert.deepEqual(result.voiceRequest.literalUnits, units);
    assert.deepEqual((result.voiceRequest.cue.transcript.match(/\d+/gu) ?? []).map(Number), values);
    const prompt = create()(bridge, { cueIndex: 5 });
    assert.equal(prompt.voiceRequest.thoughtPause.afterCueSeconds, 4);
    assert.equal(prompt.voiceRequest.thoughtPause.contextPlannedSeconds, 8);
    assert.equal(prompt.voiceRequest.thoughtPause.measuredSpeechSeconds, null);
    const transfer = create()(bridge, { cueIndex: 8 });
    assert.equal(transfer.voiceRequest.thoughtPause.afterCueSeconds, 4);
    assert.equal(result.voiceRequest.thoughtPause.afterCueSeconds, 0);
    for (const field of ['wordTimes', 'timestamps', 'startSeconds', 'endSeconds', 'measuredDurationSeconds']) assert.equal(Object.hasOwn(result.voiceRequest, field), false);
  }
});

test('transfer narration never promotes nonexistent new source geometry or draft request into audio playback', async () => {
  const fx = await fixtures();
  for (const { bridge } of fx.contexts) for (const cueIndex of [8, 9]) {
    const output = create()(bridge, { cueIndex, reveal: true, progress: 1 });
    assert.equal(output.frame.sourceDiagramProof, false); assert.equal(output.frame.sourceVisualId, null);
    assert.equal(output.frame.representationStatus, 'transfer_geometry_not_in_source_pending');
    assert.equal(output.voiceRequest.audioPlaybackAllowed, false); assert.equal(output.voiceRequest.providerCallsAllowed, false);
    assert.equal(output.manifest.sourceDiagramProof, false);
  }
});

test('bounded immutable manifests bind actual current artifacts and explicitly retain every pending human and media gate', async () => {
  const fx = await fixtures();
  for (const { bridge } of fx.contexts) {
    const output = create()(bridge, {}), manifest = output.manifest;
    assert.equal(manifest.frameSha256, output.frame.contentSha256);
    assert.equal(manifest.narrationPacketSha256, output.narrationPacket.contentSha256);
    assert.equal(manifest.voiceRequestSha256, output.voiceRequest.contentSha256);
    assert.equal(manifest.componentBytes.frame, bytes(output.frame));
    assert.equal(manifest.componentBytes.narrationPacket, bytes(output.narrationPacket));
    assert.equal(manifest.componentBytes.voiceRequest, bytes(output.voiceRequest));
    assert.ok(bytes(output) <= 131072); assert.ok(bytes(output.voiceRequest) <= 32768); assert.ok(bytes(manifest) <= 16384);
    for (const flag of ['audioGenerated', 'videoRendered', 'audioBytesVerified', 'wordPenAlignmentVerified', 'learnerReady', 'publicationReady', 'productionReady', 'endpointVerified', 'voiceIdentityVerified']) assert.equal(manifest[flag], false);
    assert.equal(manifest.providerCallsMade, 0); assert.equal(manifest.serializedAuthority, 'none');
    assert.deepEqual(manifest.gates, { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' });
    assert.equal(Object.isFrozen(output), true); assert.equal(Object.isFrozen(output.voiceRequest.cue), true);
    assert.throws(() => { output.voiceRequest.cue.transcript = 'changed'; }, TypeError);
    const { contentSha256, ...body } = manifest;
    assert.equal(contentSha256, sha('k12.grade6-common-relations.current-voice-cue-manifest/v1:' + JSON.stringify(body)));
  }
});

test('current projection retains every upstream pending obligation without turning privacy style or listening into an approval', async () => {
  const fx = await fixtures();
  for (const { bridge } of fx.contexts) {
    const audit = fx.bridgeApi.auditGrade6CommonRelationsVoiceBridge(bridge), manifest = create()(bridge, {}).manifest;
    for (const pending of audit.pending) assert.ok(manifest.pending.includes(pending), pending);
    assert.equal(manifest.privacyInspection, 'not_performed'); assert.equal(manifest.styleApproved, false);
    assert.equal(manifest.spokenTranscriptVerified, false); assert.equal(manifest.captionAudioSyncVerified, false);
    assert.equal(manifest.humanApproval, null); assert.equal(manifest.learnerEvidenceCollected, false);
  }
});

test('existing provider and multibyte style upper boundaries fit the current request and total output caps without truncation', async () => {
  const fx = await fixtures(), { context } = fx.contexts[1];
  const maximumProvider = { id: 'p'.repeat(80), modelId: 'm'.repeat(80), voiceId: 'v'.repeat(80) }, maximumStyle = '界'.repeat(4096);
  const voiceJob = createReasonedMediaJob(context.trace, { provider: maximumProvider, style: maximumStyle });
  const bridge = fx.bridgeApi.createGrade6CommonRelationsVoiceBridge({ factoryPreparation: fx.factory,
    sourceBindingInput: fx.sourceBindingInput, contextId: 'grouping', voiceJob });
  const output = create()(bridge, { cueIndex: 2, pageIndex: 6, reveal: true, progress: 1 });
  assert.equal(output.voiceRequest.style.text, maximumStyle); assert.deepEqual(output.voiceRequest.provider, maximumProvider);
  assert.equal(output.voiceRequest.cue.transcript, context.job.cues[2].transcript);
  assert.ok(bytes(output.voiceRequest) <= 32768); assert.ok(bytes(output.manifest) <= 16384); assert.ok(bytes(output) <= 131072);
});

test('serialized rehashed changed and foreign bridge-shaped data do not become current render authority', async () => {
  const fx = await fixtures(), bridge = fx.contexts[0].bridge;
  const clone = structuredClone(bridge); clone.contextId = 'grouping'; clone.binding.contentSha256 = 'a'.repeat(64);
  for (const value of [structuredClone(bridge), JSON.parse(JSON.stringify(bridge)), clone, {}, fx.factory, fx.contexts[0].voiceJob]) {
    assert.throws(() => create()(value, {}), invalid);
  }
});

test('exact two arguments and closed primitive cursor options never coerce default clamp or accept endpoint provider context timing data', async () => {
  const fx = await fixtures(), bridge = fx.contexts[0].bridge;
  for (const args of [[], [bridge], [bridge, {}, {}]]) assert.throws(() => create()(...args), invalid);
  const cycle = {}; cycle.reveal = cycle;
  for (const options of [null, undefined, [], new Array(2), cycle, { cueIndex: -1 }, { cueIndex: 10 }, { cueIndex: .5 }, { cueIndex: '1' },
    { pageIndex: -1 }, { pageIndex: 32 }, { pageIndex: 1 }, { progress: NaN }, { progress: Infinity }, { progress: -.1 }, { progress: 1.001 },
    { progress: '1' }, { reveal: 1 }, { reveal: 'true' }, { contextId: 'grouping' }, { provider }, { url: 'https://invalid.example' },
    { sourcepath: '/not-readable' }, { wordTimes: [] }, { timing: {} }, { audio: {} }, { callback() {} }, { ['x'.repeat(2097153)]: true }]) {
    assert.throws(() => create()(bridge, options), invalid);
  }
  assert.equal(create()(bridge, { cueIndex: -0, pageIndex: -0, progress: -0 }).manifest.contentSha256, create()(bridge, {}).manifest.contentSha256);
  assert.equal(create()(bridge, Object.create(null)).manifest.contentSha256, create()(bridge, {}).manifest.contentSha256);
  for (const key of ['cueIndex', 'pageIndex', 'progress', 'reveal']) assert.throws(() => create()(bridge, { [key]: undefined }), invalid);
});

test('getter proxy revoked proxy hidden symbol inherited and conversion hooks execute zero times for bridge options and arity rejection', async () => {
  const fx = await fixtures(), bridge = fx.contexts[0].bridge; let calls = 0;
  const hook = () => { calls++; throw new Error('unsafe-echo-payload'); };
  const proxy = new Proxy({}, { get: hook, getPrototypeOf: hook, ownKeys: hook, getOwnPropertyDescriptor: hook });
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const getter = Object.defineProperty({}, 'cueIndex', { enumerable: true, get: hook });
  const hidden = Object.defineProperty({}, 'reveal', { value: true });
  const symbol = { [Symbol('unsafe')]: 1 }, inherited = Object.create({ cueIndex: 0 });
  for (const options of [proxy, revoked.proxy, getter, hidden, symbol, inherited, { progress: { valueOf: hook } }, { toJSON: hook }]) assert.throws(() => create()(bridge, options), invalid);
  for (const value of [proxy, revoked.proxy, getter, hidden, symbol]) assert.throws(() => create()(value, {}), invalid);
  assert.throws(() => create()(proxy, getter, revoked.proxy), invalid); assert.equal(calls, 0);
});
