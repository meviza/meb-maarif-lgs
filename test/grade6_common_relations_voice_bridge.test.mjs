import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsFactoryPreparation } from '../packages/content-factory/grade6_common_relations_factory_preparation.mjs';
import { createReasonedTeachingTrace, auditReasonedTeachingTrace } from '../packages/contracts/reasoned_teaching_trace.mjs';
import { createReasonedMediaJob, createReasonedMediaAudioRequest, auditReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { renderGrade6CommonRelationsCaptionFrame } from '../packages/media/grade6_common_relations_scene.mjs';
import { createGardenQuestion } from '../packages/content-factory/pilot.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';

const api = await import('../packages/media/grade6_common_relations_voice_bridge.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [applicationObservations, semanticMatrix, registry] = await Promise.all([
  'grade6-common-relations-application-observations', 'grade6-source-semantic-candidate-matrix', 'meb-reference-registry',
].map(load));
const source = () => structuredClone({ applicationObservations, semanticMatrix,
  sourceRecord: registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') });
const provider = { id: 'declared-test-provider', modelId: 'declared-model', voiceId: 'declared-voice' };
const style = 'Türkçe, sıcak ve açık yetişkin öğretmen. Verilen metni, sayıları ve birimleri değiştirmeden oku.';
const sha = value => createHash('sha256').update(value).digest('hex');
const bytes = value => Buffer.byteLength(JSON.stringify(value));
const kinds = ['goal', 'evidence', 'plan', 'why', 'result', 'check_prompt', 'check_answer', 'summary', 'transfer_prompt', 'transfer_answer'];
const bad = error => error.message === 'invalid_common_relations_voice_bridge_input';
const arity = error => error.message === 'invalid_common_relations_voice_bridge_arguments';
const untrusted = error => error.message === 'untrusted_common_relations_voice_bridge';
function create(...args) {
  assert.equal(typeof api.createGrade6CommonRelationsVoiceBridge, 'function', 'voice bridge consumer API is missing');
  return api.createGrade6CommonRelationsVoiceBridge(...args);
}
function audit(...args) {
  assert.equal(typeof api.auditGrade6CommonRelationsVoiceBridge, 'function', 'voice bridge audit API is missing');
  return api.auditGrade6CommonRelationsVoiceBridge(...args);
}
function input(contextId = 'repeat') {
  const sourceBindingInput = source(), factoryPreparation = createGrade6CommonRelationsFactoryPreparation(sourceBindingInput);
  const selected = factoryPreparation.preparation.contexts.find(row => row.contextId === contextId);
  return { factoryPreparation, sourceBindingInput, contextId, voiceJob: createReasonedMediaJob(selected.trace, { provider, style }) };
}
function resign(job) {
  const { contentSha256: ignored, ...body } = job;
  job.contentSha256 = sha(JSON.stringify(body)); return job;
}

test('consumer gets the two exact bridge APIs instead of an import-crash pseudo RED', () => {
  assert.equal(typeof api.createGrade6CommonRelationsVoiceBridge, 'function', 'voice bridge constructor is missing');
  assert.equal(typeof api.auditGrade6CommonRelationsVoiceBridge, 'function', 'voice bridge audit is missing');
});

// Break: bridge manufactures trusted children from cloned DTOs or silently changes the visual provider.
test('both contexts preserve actual live visual and declared selected-provider voice capabilities', () => {
  for (const contextId of ['repeat', 'grouping']) {
    const data = input(contextId), before = JSON.stringify(data.factoryPreparation), bridge = create(data);
    const selected = data.factoryPreparation.preparation.contexts.find(row => row.contextId === contextId);
    assert.deepEqual(Object.keys(bridge), ['schemaVersion', 'state', 'contextId', 'visual', 'voice', 'binding', 'limits', 'pending']);
    assert.equal(bridge.schemaVersion, 'grade6-common-relations-voice-bridge/v1');
    assert.equal(bridge.state, 'editor_voice_bridge_preparation'); assert.equal(bridge.contextId, contextId);
    assert.equal(bridge.visual.scenePlan, data.factoryPreparation.scenePlan);
    assert.equal(bridge.visual.trace, selected.trace); assert.equal(bridge.visual.job, selected.job);
    assert.equal(bridge.visual.request, selected.audioRequest); assert.equal(bridge.voice.job, data.voiceJob);
    assert.equal(bridge.visual.job.provider, null);
    assert.deepEqual(bridge.voice.job.provider, provider);
    assert.equal(auditReasonedTeachingTrace(bridge.visual.trace).numericStepsChecked, 0);
    assert.equal(auditReasonedMediaJob(bridge.visual.job).jobSha256, selected.job.contentSha256);
    assert.equal(auditReasonedMediaJob(bridge.voice.job).jobSha256, data.voiceJob.contentSha256);
    assert.deepEqual(createReasonedMediaAudioRequest(bridge.voice.job), bridge.voice.request);
    assert.equal(renderGrade6CommonRelationsCaptionFrame(bridge.visual.scenePlan, { contextId }).frame.contextId, contextId);
    assert.equal(JSON.stringify(data.factoryPreparation), before);
  }
});

// Break: the shared job ID is mistaken for the distinct provider/style-specific job and request digest.
test('same visual and voice job ID intentionally binds different full job and request hashes', () => {
  const bridge = create(input()), binding = bridge.binding;
  assert.equal(bridge.visual.job.id, bridge.voice.job.id);
  assert.notEqual(bridge.visual.job.contentSha256, bridge.voice.job.contentSha256);
  assert.notEqual(bridge.visual.request.contentSha256, bridge.voice.request.contentSha256);
  assert.deepEqual(binding.visualJob, { id: bridge.visual.job.id, contentSha256: bridge.visual.job.contentSha256,
    requestSha256: bridge.visual.request.contentSha256 });
  assert.deepEqual(binding.voiceJob, { id: bridge.voice.job.id, contentSha256: bridge.voice.job.contentSha256,
    requestSha256: bridge.voice.request.contentSha256 });
  assert.deepEqual(binding.style, { visualSha256: bridge.visual.job.style.sha256, voiceSha256: bridge.voice.job.style.sha256 });
  assert.equal(binding.factoryManifestSha256.length, 64); assert.equal(binding.geometrySha256.length, 64);
});

// Break: construction drops a cue, remaps its semantic anchor, or treats a thought pause as measured audio.
test('all ten cues have literal order kind anchors transcript hashes and two declared four-second pauses', () => {
  for (const id of ['repeat', 'grouping']) {
    const bridge = create(input(id));
    assert.deepEqual(bridge.voice.job.cues.map(cue => cue.kind), kinds);
    assert.deepEqual(bridge.voice.job.cues.map(cue => cue.order), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepEqual(bridge.voice.job.cues.map(cue => cue.thoughtPauseSeconds), [0, 0, 0, 0, 0, 4, 0, 0, 4, 0]);
    assert.equal(bridge.binding.cueCount, 10); assert.equal(bridge.binding.plannedThinkingPauseSeconds, 8);
    for (let index = 0; index < 10; index++) {
      const visual = bridge.visual.job.cues[index], voice = bridge.voice.job.cues[index], mapped = bridge.binding.cueMappings[index];
      for (const field of ['id', 'order', 'kind', 'stepId', 'transcript', 'transcriptSha256', 'displayAnchorIds', 'thoughtPauseSeconds']) {
        assert.deepEqual(voice[field], visual[field]);
      }
      assert.equal(voice.transcriptSha256, sha(voice.transcript));
      assert.deepEqual(mapped, { cueId: voice.id, order: index, kind: kinds[index], stepId: voice.stepId,
        transcriptSha256: voice.transcriptSha256, visualStyleSha256: visual.styleSha256, voiceStyleSha256: voice.styleSha256,
        displayAnchorIds: voice.displayAnchorIds, thoughtPauseSeconds: voice.thoughtPauseSeconds });
    }
    assert.equal(bridge.limits.measuredSpeechSeconds, null);
  }
});

// Break: minute and item-per-package meanings are relabelled as generic cm/count or package counts as group sizes.
test('independent finite-set oracle and literal dimensions remain separate in binding', () => {
  const repeat = create(input('repeat')), grouping = create(input('grouping'));
  assert.deepEqual(repeat.binding.literalUnits, ['minute']);
  assert.deepEqual(grouping.binding.literalUnits, ['card_per_package', 'package']);
  assert.deepEqual(repeat.binding.mathematicalWitness, { commonPositiveTimes: [24, 48],
    commonPositiveGroupSizes: [1, 2, 3, 4, 6, 12], packageCountsAtExampleSize: [4, 6], localMathChecks: 'passed' });
  assert.deepEqual(grouping.binding.mathematicalWitness, repeat.binding.mathematicalWitness);
  assert.ok(repeat.voice.job.cues[4].transcript.includes('dakika'));
  assert.ok(grouping.voice.job.cues[4].transcript.includes('bir paketteki kart sayısı'));
  assert.ok(grouping.voice.job.cues[9].transcript.includes('paket sayıları 4 ve 6'));
  assert.equal(repeat.limits.genericNumericStepsChecked, 0); assert.equal(repeat.limits.genericResolverSupported, false);
});

// Break: a factory wrapper, JSON digest, or a copied bridge is accidentally treated as an issued capability.
test('factory has no wrapper issuer: genuine live child references allow shallow wrapper but deep clone does not', () => {
  const data = input();
  assert.equal(audit(create({ ...data, factoryPreparation: { ...data.factoryPreparation } })).valid, true);
  assert.throws(() => create({ ...data, factoryPreparation: structuredClone(data.factoryPreparation) }), bad);
  assert.throws(() => create({ ...data, voiceJob: structuredClone(data.voiceJob) }), bad);
  const bridge = create(data);
  for (const clone of [structuredClone(bridge), JSON.parse(JSON.stringify(bridge)), { ...bridge }]) assert.throws(() => audit(clone), untrusted);
  assert.equal(audit(bridge).valid, true);
});

// Break: a pre-frozen unbranded request root makes recursive freeze skip mutable cue children after bridge issuance.
test('canonical shallow-frozen request children become deeply immutable and cannot stale the issued bridge digest', () => {
  const data = input(), originalContexts = data.factoryPreparation.preparation.contexts;
  const request = Object.freeze(structuredClone(originalContexts[0].audioRequest));
  assert.equal(Object.isFrozen(request), true); assert.equal(Object.isFrozen(request.cues[0]), false);
  const contexts = [{ ...originalContexts[0], audioRequest: request }, originalContexts[1]];
  const factoryPreparation = { ...data.factoryPreparation, preparation: { ...data.factoryPreparation.preparation, contexts } };
  const bridge = create({ ...data, factoryPreparation }), before = audit(bridge).bridgeContentSha256;
  assert.equal(bridge.visual.request, request);
  assert.equal(Object.isFrozen(bridge.visual.request.cues), true);
  assert.equal(Object.isFrozen(bridge.visual.request.cues[0]), true);
  assert.throws(() => { bridge.visual.request.cues[0].transcript = 'Değiştirilmiş güncel metin'; }, TypeError);
  assert.equal(audit(bridge).bridgeContentSha256, before);
  assert.equal(before, sha(`k12.grade6-common-relations.voice-bridge/v1:${JSON.stringify(bridge)}`));
});

test('default-provider other-context and an actual live garden job cannot bind to this selected context', () => {
  const data = input(), contexts = data.factoryPreparation.preparation.contexts;
  assert.throws(() => create({ ...data, voiceJob: contexts[0].job }), bad);
  assert.throws(() => create({ ...data, voiceJob: createReasonedMediaJob(contexts[1].trace, { provider, style }) }), bad);
  const garden = createReasonedMediaJob(createReasonedMathTrace(createGardenQuestion({ id: 'bridge-garden' })), { provider, style });
  assert.equal(auditReasonedMediaJob(garden).cueCount > 10, true);
  assert.throws(() => create({ ...data, voiceJob: garden }), bad);
});

// Break: live issuance alone authorizes a job for a different source explanation.
test('a genuinely issued trace/job with changed rationale is still rejected against canonical full semantics', () => {
  const data = input(), trace = data.factoryPreparation.preparation.contexts[0].trace;
  const changed = Object.fromEntries(['id', 'kind', 'source', 'goal', 'evidence', 'plan', 'transfer', 'scope'].map(key => [key, structuredClone(trace[key])]));
  changed.steps = trace.steps.map(({ expression, dependsOn, ...step }) => structuredClone(step));
  changed.steps[0].why = 'Farklı bir gerekçe beyanı; mevcut kanonik açıklamanın yerine geçmez.';
  const foreign = createReasonedTeachingTrace(changed);
  assert.equal(auditReasonedTeachingTrace(foreign).structuralChecks, 'passed');
  const job = createReasonedMediaJob(foreign, { provider, style });
  assert.equal(auditReasonedMediaJob(job).cueCount, 10);
  assert.throws(() => create({ ...data, voiceJob: job }), bad);
});

test('same canonical semantics from a separately issued trace bind without claiming hidden creator-object identity', () => {
  const data = input(), original = data.factoryPreparation.preparation.contexts[0].trace;
  const separate = createGrade6CommonRelationsFactoryPreparation(source()).preparation.contexts[0].trace;
  assert.notEqual(separate, original); assert.equal(separate.contentSha256, original.contentSha256);
  const voiceJob = createReasonedMediaJob(separate, { provider, style }), bridge = create({ ...data, voiceJob });
  assert.equal(bridge.visual.trace, original); assert.equal(bridge.voice.job, voiceJob);
  assert.equal(audit(bridge).valid, true);
});

test('rehashed cue provider style order anchor pause source and factory promotion drift are rejected', () => {
  const data = input();
  const mutations = [job => { job.cues[0].transcript += ' Değişti.'; job.cues[0].transcriptSha256 = sha(job.cues[0].transcript); },
    job => { job.cues.reverse(); }, job => { job.cues[5].thoughtPauseSeconds = 0; },
    job => { job.cues[1].displayAnchorIds = ['foreign']; }, job => { job.provider.voiceId = 'other'; },
    job => { job.style.text += ' farklı'; job.style.sha256 = sha(job.style.text); },
    job => { job.source.contentSha256 = 'a'.repeat(64); }, job => { job.trace.contentSha256 = 'b'.repeat(64); }];
  for (const mutation of mutations) {
    const job = structuredClone(data.voiceJob); mutation(job); resign(job);
    assert.throws(() => create({ ...data, voiceJob: job }), bad);
  }
  for (const mutate of [value => { value.manifest.publicationReady = true; },
    value => { value.preparation.manifest.geometryPreparation.genericResolverSupported = true; },
    value => { value.manifest.bindings.contexts[1].trace.contentSha256 = 'a'.repeat(64); }]) {
    const factoryPreparation = structuredClone(data.factoryPreparation); mutate(factoryPreparation);
    assert.throws(() => create({ ...data, factoryPreparation }), bad);
  }
  const sourceBindingInput = source(); sourceBindingInput.applicationObservations.boundaries.formalGcdLcmTeachingAllowed = true;
  assert.throws(() => create({ ...data, sourceBindingInput }), bad);
});

// Break: canonical validation is bypassed because unchanged live children alone authenticate a drifted wrapper.
test('canonical full factory and source metadata drift fails even when original live child brands are retained', () => {
  const data = input();
  for (const mutate of [value => { value.publicationReady = true; },
    value => { value.gates.answer = 'approved'; }, value => { value.bindings.contexts[1].trace.contentSha256 = 'a'.repeat(64); }]) {
    const manifest = structuredClone(data.factoryPreparation.manifest); mutate(manifest);
    const { contentSha256: omitted, ...body } = manifest;
    manifest.contentSha256 = sha(`k12.grade6-common-relations.factory-manifest/v1:${JSON.stringify(body)}`);
    assert.throws(() => create({ ...data, factoryPreparation: { ...data.factoryPreparation, manifest } }), bad);
  }
  const pendingSnapshot = structuredClone(data.factoryPreparation.preparation.manifest);
  pendingSnapshot.geometryPreparation.genericResolverSupported = true;
  assert.throws(() => create({ ...data, factoryPreparation: { ...data.factoryPreparation,
    preparation: { ...data.factoryPreparation.preparation, manifest: pendingSnapshot } } }), bad);
  const copiedOther = structuredClone(data.factoryPreparation.preparation.contexts[1]);
  assert.throws(() => create({ ...data, factoryPreparation: { ...data.factoryPreparation,
    preparation: { ...data.factoryPreparation.preparation, contexts: [data.factoryPreparation.preparation.contexts[0], copiedOther] } } }), bad);
});

test('outer pending work and all six human gates retain the actual upstream factory media and job obligations', () => {
  const data = input(), bridge = create(data);
  assert.deepEqual(bridge.binding.gates, data.factoryPreparation.draft.gates);
  for (const stage of [data.factoryPreparation.manifest, data.factoryPreparation.preparation.manifest,
    bridge.visual.job, bridge.voice.job]) {
    for (const obligation of stage.pending) assert.ok(bridge.pending.includes(obligation), `missing upstream obligation: ${obligation}`);
  }
  assert.equal(data.factoryPreparation.preparation.manifest.geometryPreparation.captionFramesRendered, 0);
  assert.equal(bridge.limits.sourceResolverImplemented, false);
});

test('a new valid declared style/provider variant has distinct digests without gaining endpoint or listener approval', () => {
  const data = input(), first = create(data), trace = data.factoryPreparation.preparation.contexts[0].trace;
  const voiceJob = createReasonedMediaJob(trace, { provider: { ...provider, voiceId: 'another-declared-voice' }, style: `${style} Ölçülü vurgu.` });
  const second = create({ ...data, voiceJob });
  assert.equal(second.visual.job.id, first.visual.job.id);
  assert.notEqual(second.binding.voiceJob.contentSha256, first.binding.voiceJob.contentSha256);
  assert.notEqual(audit(second).bridgeContentSha256, audit(first).bridgeContentSha256);
  assert.equal(second.limits.providerDeclarationOnly, true); assert.equal(second.limits.endpointVerified, false);
});

// Break: genuine job issuance lets raw style metadata carry current or foreign cue text/hashes into a current-only consumer.
test('declared style cannot contain an exact canonical full cue transcript or its hash from either context', () => {
  const data = input(), trace = data.factoryPreparation.preparation.contexts[0].trace, accepted = [];
  for (const context of data.factoryPreparation.preparation.contexts) for (const cue of context.job.cues) {
    for (const [kind, reference] of [['transcript', cue.transcript], ['sha256', cue.transcriptSha256], ['upper-sha256', cue.transcriptSha256.toUpperCase()]]) {
      const voiceJob = createReasonedMediaJob(trace, { provider, style: `Sabit metni oku. ${reference}` });
      assert.equal(auditReasonedMediaJob(voiceJob).cueCount, 10);
      try { create({ ...data, voiceJob }); accepted.push(`${context.contextId}:${cue.kind}:${kind}`); }
      catch (error) { assert.equal(error.message, 'invalid_common_relations_voice_bridge_input'); }
    }
  }
  assert.deepEqual(accepted, [], 'canonical reference metadata entered a bridge');
});

// Break: provider identifiers remain syntactically valid while transporting a protected cue hash, including the other context.
test('each declared provider identifier rejects an embedded exact transcript hash from either canonical context', () => {
  const data = input('grouping'), trace = data.factoryPreparation.preparation.contexts[1].trace, accepted = [];
  for (const context of data.factoryPreparation.preparation.contexts) for (const cue of context.job.cues) {
    for (const field of ['id', 'modelId', 'voiceId']) for (const [casing, hash] of [['lower', cue.transcriptSha256], ['upper', cue.transcriptSha256.toUpperCase()]]) {
      const voiceJob = createReasonedMediaJob(trace, { provider: { ...provider, [field]: `ref.${hash}` }, style });
      assert.equal(auditReasonedMediaJob(voiceJob).cueCount, 10);
      try { create({ ...data, voiceJob }); accepted.push(`${context.contextId}:${cue.kind}:${field}:${casing}`); }
      catch (error) { assert.equal(error.message, 'invalid_common_relations_voice_bridge_input'); }
    }
  }
  assert.deepEqual(accepted, [], 'canonical hash metadata entered a bridge');
});

test('existing provider ID and style upper boundaries fit the bridge budgets without truncation', () => {
  const data = input('grouping'), trace = data.factoryPreparation.preparation.contexts[1].trace;
  const declared = { id: 'p'.repeat(80), modelId: 'm'.repeat(80), voiceId: 'v'.repeat(80) }, maxStyle = 'Ş'.repeat(4096);
  const voiceJob = createReasonedMediaJob(trace, { provider: declared, style: maxStyle });
  const bridge = create({ ...data, voiceJob }), checked = audit(bridge);
  assert.deepEqual(bridge.binding.provider, declared); assert.equal(bridge.voice.job.style.text, maxStyle);
  assert.equal(bridge.voice.request.style.text, maxStyle);
  assert.ok(bytes(bridge) <= 524288); assert.ok(bytes(bridge.binding) <= 16384); assert.ok(bytes(checked) <= 16384);
  assert.equal(bridge.limits.styleApproved, false);
});

test('closed constructor and audit arity reject caller options audio attachment and injected scopes', () => {
  const data = input();
  for (const args of [[], [data, {}]]) assert.throws(() => create(...args), arity);
  for (const extra of ['options', 'audioEvidence', 'provider', 'execute', 'tenantId', 'audit']) assert.throws(() => create({ ...data, [extra]: null }), bad);
  for (const contextId of [null, 0, 'garden', 'Repeat']) assert.throws(() => create({ ...data, contextId }), bad);
  for (const args of [[], [create(data), {}]]) assert.throws(() => audit(...args), arity);
});

test('inert snapshot rejects accessor proxy revoked hidden symbol coercion cycle sparse and overbudget without executing hooks', () => {
  const data = input(); let hooks = 0;
  const getter = { ...data }; Object.defineProperty(getter, 'voiceJob', { enumerable: true, get() { hooks++; return data.voiceJob; } });
  const proxy = new Proxy(data, { ownKeys() { hooks++; return []; }, get() { hooks++; } });
  const revoked = Proxy.revocable(data, {}); revoked.revoke();
  const hidden = { ...data }; Object.defineProperty(hidden, 'hidden', { value: 1 });
  const symbol = { ...data, [Symbol('scope')]: true };
  const json = { ...data, toJSON() { hooks++; return {}; } };
  const cycle = { ...data }; cycle.sourceBindingInput = cycle;
  const sparse = { ...data, sourceBindingInput: Array(3) };
  const longKey = { ...data, ['k'.repeat(161)]: true };
  const longString = { ...data, contextId: 'x'.repeat(65537) };
  const manyKeys = { ...data, sourceBindingInput: Object.fromEntries(Array.from({ length: 1025 }, (_, i) => [`k${i}`, null])) };
  let depth = null; for (let i = 0; i < 26; i++) depth = { depth };
  const coercion = { ...data, contextId: { [Symbol.toPrimitive]() { hooks++; return 'repeat'; } } };
  for (const value of [getter, proxy, revoked.proxy, hidden, symbol, json, cycle, sparse, longKey, longString, manyKeys, { ...data, sourceBindingInput: depth }, coercion]) {
    assert.throws(() => create(value), bad);
  }
  const bridge = create(data);
  assert.throws(() => audit(new Proxy(bridge, { get() { hooks++; } })), untrusted);
  assert.throws(() => audit(revoked.proxy), untrusted);
  assert.equal(hooks, 0);
});

test('bounded frozen metadata audit carries no narration text and no delivery provider or rights acceptance', () => {
  const bridge = create(input()), output = audit(bridge);
  assert.equal(Object.isFrozen(bridge), true); assert.equal(Object.isFrozen(bridge.binding.cueMappings[0]), true);
  assert.equal(Object.isFrozen(output), true); assert.equal(output.valid, true);
  assert.equal(output.contextId, 'repeat'); assert.equal(output.binding, bridge.binding);
  assert.equal(output.bridgeContentSha256, sha(`k12.grade6-common-relations.voice-bridge/v1:${JSON.stringify(bridge)}`));
  const { contentSha256, ...body } = bridge.binding;
  assert.equal(contentSha256, sha(`k12.grade6-common-relations.voice-binding/v1:${JSON.stringify(body)}`));
  assert.ok(bytes(bridge) <= 524288); assert.ok(bytes(bridge.binding) <= 16384); assert.ok(bytes(output) <= 16384);
  for (const cue of bridge.voice.job.cues) assert.equal(JSON.stringify(output).includes(cue.transcript), false);
  assert.deepEqual(bridge.binding.counts, { existingAuthoredTasks: 1, selectedContexts: 1, visualJobs: 1, voiceVariants: 1,
    newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(Object.keys(bridge.binding.gates).length, 6); assert.ok(Object.values(bridge.binding.gates).every(value => value === 'pending'));
  for (const field of ['endpointVerified', 'privacyInspectionPassed', 'audioGenerated', 'audioBytesVerified', 'wordPenAlignmentVerified',
    'playbackReady', 'learnerReady', 'publicationReady', 'productionReady', 'voiceIdentityVerified']) assert.equal(bridge.limits[field], false);
  assert.equal(bridge.limits.providerCallsMade, 0); assert.equal(bridge.limits.providerCallsAllowed, false);
  assert.equal(bridge.limits.answerBearingEditorArtifact, true); assert.equal(bridge.limits.serializedAuthority, 'none');
  assert.equal(bridge.limits.sourceFilesRead, 0); assert.equal(bridge.limits.ownerReview, 'pending');
  assert.equal(bridge.limits.rightsReview, 'pending'); assert.equal(bridge.limits.listenerReview, 'pending');
});
