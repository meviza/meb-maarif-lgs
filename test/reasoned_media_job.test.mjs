import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRectangleQuestion, createGardenQuestion } from '../packages/content-factory/pilot.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { createReasonedTeachingTrace } from '../packages/contracts/reasoned_teaching_trace.mjs';

const moduleUrl = new URL('../packages/media/reasoned_media_job.mjs', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Synthetic identity declaration only; this suite proves no live model or voice.
const provider = { id: 'synthetic-tts-provider', modelId: 'synthetic-teacher-v1', voiceId: 'synthetic-baritone' };
const style = 'Türkçe konuşan sıcak, net yetişkin öğretmen. Metni değiştirme; sayıları ve birimleri açık söyle.';
async function api() {
  assert.ok(existsSync(moduleUrl), 'general reasoned media job is not implemented');
  return import(moduleUrl);
}
function questionTrace(family = 'perimeter') {
  return createReasonedMathTrace(createRectangleQuestion({ id: `media-${family}`, template: family, width: 6, height: 4, gate: 2 }));
}
function evidenceFrom(request, duration = 1.5) {
  return {
    schemaVersion: 'reasoned-media-audio-evidence/v1', jobId: request.jobId, jobSha256: request.jobSha256,
    sourceSha256: request.sourceSha256, traceSha256: request.traceSha256, requestSha256: request.contentSha256,
    provider: structuredClone(request.provider), style: structuredClone(request.style),
    cues: request.cues.map((cue, index) => ({
      cueId: cue.id, order: cue.order, transcript: cue.transcript, transcriptSha256: cue.transcriptSha256,
      styleSha256: cue.styleSha256, audioSha256: sha(`synthetic-declared-audio-${index}`),
      byteLength: 2000 + index, measuredDurationSeconds: duration,
    })),
  };
}

// Catches a fixed six-cue garden shape, losing the lesson's text inference, or
// omitting reason/result/check boundaries for variable-length traces.
test('question and concept jobs use variable reasons results checks and transfer cues rather than fixed garden media', async () => {
  const { createReasonedMediaJob } = await api();
  const area = createReasonedMediaJob(questionTrace('area'));
  const perimeter = createReasonedMediaJob(questionTrace());
  const garden = createReasonedMediaJob(createReasonedMathTrace(createGardenQuestion({ id: 'media-garden' })));
  const lesson = createReasonedMediaJob(createReasonedPerimeterLessonTrace());
  assert.equal(area.cues.length, 10);
  assert.equal(perimeter.cues.length, 14);
  assert.equal(garden.cues.length, 30);
  assert.equal(lesson.cues.length, 26);
  assert.equal(lesson.trace.kind, 'concept_lesson');
  assert.deepEqual(perimeter.cues.slice(0, 3).map(cue => cue.kind), ['goal', 'evidence', 'plan']);
  assert.deepEqual(perimeter.cues.slice(3, 7).map(cue => cue.kind), ['why', 'result', 'check_prompt', 'check_answer']);
  assert.deepEqual(perimeter.cues.slice(-3).map(cue => cue.kind), ['summary', 'transfer_prompt', 'transfer_answer']);
  const inference = lesson.cues.find(cue => cue.kind === 'result' && cue.stepId === 'counterexample');
  assert.match(inference.transcript, /alanlar 24 cm², çevreler 20 cm ve 22 cm/u);
});

// Catches results narrated before their reasons, missing thought gaps, or
// throwing away the exact goal/conditions needed to choose the right method.
test('every number keeps its meaning and each question has a planned thinking gap before feedback', async () => {
  const { createReasonedMediaJob } = await api();
  const trace = questionTrace();
  const job = createReasonedMediaJob(trace);
  assert.match(job.cues[0].transcript, /dış sınır/iu);
  assert.match(job.cues[1].transcript, /6 santimetre/u);
  assert.match(job.cues[2].transcript, /karşılıklı kenarlar/iu);
  assert.equal(job.cues[3].transcript, trace.steps[0].why);
  assert.match(job.cues[4].transcript, /6 artı 4 eşittir 10 santimetre/u);
  assert.match(job.cues[4].transcript, /Bir kenar çiftinin uzunluğu/u);
  assert.equal(job.cues[5].transcript, trace.steps[0].check.prompt);
  assert.equal(job.cues[5].thoughtPauseSeconds, 4);
  assert.equal(job.cues[6].transcript, trace.steps[0].check.answer);
  assert.equal(job.cues[6].thoughtPauseSeconds, 0);
  assert.equal(job.cues.at(-2).thoughtPauseSeconds, 4);
  assert.equal(job.subtitleDraft.state, 'text_only_timing_pending');
  assert.deepEqual(job.subtitleDraft.cues.map(cue => cue.text), job.cues.map(cue => cue.transcript));
});

// Catches a stale trace/source/style relation, mutating the canonical trace or
// accepting a serialized job as trusted render evidence.
test('job cue request hashes bind immutable trace source transcript and style without changing source geometry', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, auditReasonedMediaJob } = await api();
  const trace = questionTrace();
  const before = JSON.stringify(trace);
  const job = createReasonedMediaJob(trace, { style, provider });
  const { contentSha256, ...body } = job;
  assert.equal(contentSha256, sha(JSON.stringify(body)));
  assert.equal(job.source.contentSha256, trace.source.contentSha256);
  assert.equal(job.trace.contentSha256, trace.contentSha256);
  for (const cue of job.cues) {
    assert.equal(cue.transcriptSha256, sha(cue.transcript));
    assert.equal(cue.styleSha256, sha(style));
  }
  const request = createReasonedMediaAudioRequest(job);
  assert.equal(request.jobSha256, job.contentSha256);
  assert.equal(request.sourceSha256, trace.source.contentSha256);
  assert.equal(request.traceSha256, trace.contentSha256);
  assert.equal(request.style.sha256, sha(style));
  assert.equal(request.cues.length, 14);
  assert.equal(request.providerCallsAllowed, false);
  assert.equal(JSON.stringify(trace), before);
  assert.ok(Object.isFrozen(job));
  assert.throws(() => createReasonedMediaAudioRequest(JSON.parse(JSON.stringify(job))), /untrusted_reasoned_media_job/u);
  assert.throws(() => auditReasonedMediaJob(JSON.parse(JSON.stringify(job))), /untrusted_reasoned_media_job/u);
  assert.equal(job.geometryPolicy, 'source_geometry_must_be_resolved_and_preserved_no_llm_edit');
});

// Catches claiming that a planned cue is synthesized, rendered or published,
// or treating a configured provider declaration as an inference call.
test('an unvoiced job and provider-unselected request remain honest closed-gate drafts', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, auditReasonedMediaJob, attachReasonedMediaAudio } = await api();
  const job = createReasonedMediaJob(questionTrace());
  const request = createReasonedMediaAudioRequest(job);
  const audit = auditReasonedMediaJob(job);
  assert.equal(job.provider, null);
  assert.equal(job.state, 'orchestration_draft');
  assert.equal(job.audioStatus, 'not_generated');
  assert.equal(job.videoStatus, 'not_rendered');
  assert.equal(job.publicationReady, false);
  assert.equal(request.providerReady, false);
  assert.equal(audit.rendered, false);
  assert.equal(audit.voiced, false);
  assert.equal(audit.audioEvidenceAttached, false);
  assert.equal(audit.providerCallsMade, 0);
  for (const gate of ['source_resolver', 'expert_rationale_and_transfer_review', 'rights_and_owner_review', 'new_voice_video_review']) assert.ok(audit.pending.includes(gate));
  assert.throws(() => attachReasonedMediaAudio(job, evidenceFrom(request)), /media_provider_not_selected/u);
});

// Field names containing the delimiter must not impersonate three required
// fields and mark a provider with undefined identifiers as ready.
test('provider fields are exact keys rather than a delimiter-joined key signature', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio } = await api();
  const trace = questionTrace();
  for (const malformed of [
    { 'id,modelId,voiceId': 'synthetic' },
    { id: provider.id, 'modelId,voiceId': 'synthetic' },
    { 'id,modelId': 'synthetic', voiceId: provider.voiceId },
  ]) {
    assert.throws(() => createReasonedMediaJob(trace, { provider: malformed }), /invalid_reasoned_media_fields/u);
  }
  const job = createReasonedMediaJob(trace, { provider });
  const request = createReasonedMediaAudioRequest(job);
  const evidence = evidenceFrom(request);
  evidence.provider = { 'id,modelId,voiceId': 'synthetic' };
  assert.throws(() => attachReasonedMediaAudio(job, evidence), /invalid_reasoned_media_fields/u);
  assert.deepEqual(request.provider, provider);
});

// Catches collapsing measured durations into a guessed total or claiming a
// valid declaration is listened-to, physically read or rendered media.
test('matching measured declarations produce a cue timeline with pauses but not voiced or rendered approval', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio, auditReasonedMediaJob } = await api();
  const job = createReasonedMediaJob(questionTrace(), { style, provider });
  const request = createReasonedMediaAudioRequest(job);
  const attachment = attachReasonedMediaAudio(job, evidenceFrom(request));
  assert.equal(attachment.jobSha256, job.contentSha256);
  assert.equal(attachment.state, 'declared_audio_evidence_attached_not_listener_verified');
  assert.equal(attachment.timeline.length, 14);
  assert.equal(attachment.timeline[0].startSeconds, 0);
  assert.equal(attachment.timeline[0].endSeconds, 1.5);
  assert.equal(attachment.timeline[5].endSeconds, 9);
  assert.equal(attachment.timeline[6].startSeconds, 13);
  assert.equal(attachment.measuredSpeechSeconds, 21);
  assert.equal(attachment.plannedThinkingPauseSeconds, 12);
  assert.equal(attachment.plannedTimelineSeconds, 33);
  assert.equal(attachment.subtitleCues[5].endSeconds, 9);
  assert.equal(attachment.subtitleCues[6].startSeconds, 13);
  assert.equal(attachment.audioBytesVerified, false);
  assert.equal(attachment.spokenTranscriptVerified, false);
  assert.equal(attachment.publicationReady, false);
  const audit = auditReasonedMediaJob(job, attachment);
  assert.equal(audit.audioEvidenceAttached, true);
  assert.equal(audit.voiced, false);
  assert.equal(audit.rendered, false);
  assert.equal(job.audioStatus, 'not_generated');
});

// Catches reusing the previous six-cue garden manifest or a different trace,
// even if an attacker refreshes a changed transcript's own hash.
test('old garden cues stale source request and rehashed changed text are rejected', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio } = await api();
  const job = createReasonedMediaJob(questionTrace(), { style, provider });
  const request = createReasonedMediaAudioRequest(job);
  const old = { schemaVersion: 'ink-audio-preview/v2', sourcePlanId: 'ink-garden-two-rows-v1', sourcePlanSha256: 'a'.repeat(64), segments: ['intro', 'step1', 'step2', 'step3', 'step4', 'outro'] };
  assert.throws(() => attachReasonedMediaAudio(job, old), /invalid_reasoned_media_/u);
  for (const change of [data => { data.jobSha256 = 'a'.repeat(64); }, data => { data.sourceSha256 = 'b'.repeat(64); }, data => { data.traceSha256 = 'c'.repeat(64); }, data => { data.requestSha256 = 'd'.repeat(64); }, data => { data.cues[0].transcript = 'Eski kısa ses'; data.cues[0].transcriptSha256 = sha(data.cues[0].transcript); }]) {
    const data = evidenceFrom(request); change(data);
    assert.throws(() => attachReasonedMediaAudio(job, data), /reasoned_media_audio_binding_mismatch/u);
  }
});

// Catches audio attached in a reordered sequence, wrong voice/style, duplicate
// payload declarations or a missing cue disguised as a complete solution.
test('cue order identity completeness provider style and distinct payload declarations are exact', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio } = await api();
  const job = createReasonedMediaJob(questionTrace(), { style, provider });
  const request = createReasonedMediaAudioRequest(job);
  for (const change of [data => data.cues.reverse(), data => { data.cues[0].cueId = 'intro'; }, data => { data.cues[0].order = 1; }, data => { data.cues.pop(); }, data => { data.provider.voiceId = 'Sulafat'; }, data => { data.style.text += ' değiştirilmiş'; data.style.sha256 = sha(data.style.text); }, data => { data.cues[0].styleSha256 = 'e'.repeat(64); }, data => { data.cues[1].audioSha256 = data.cues[0].audioSha256; }]) {
    const data = evidenceFrom(request); change(data);
    assert.throws(() => attachReasonedMediaAudio(job, data), /reasoned_media_audio_binding_mismatch/u);
  }
});

// Catches zero/NaN/oversized durations, fictional fractional byte counts and
// requests whose aggregate speech/storage budget is beyond the bounded pilot.
test('measured durations byte lengths and aggregate budgets fail closed', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio } = await api();
  const job = createReasonedMediaJob(createReasonedPerimeterLessonTrace(), { style, provider });
  const request = createReasonedMediaAudioRequest(job);
  for (const duration of [0, -1, NaN, Infinity, 180.001]) {
    const data = evidenceFrom(request); data.cues[0].measuredDurationSeconds = duration;
    assert.throws(() => attachReasonedMediaAudio(job, data), /invalid_reasoned_media_/u);
  }
  for (const bytes of [0, -1, 0.5, 20 * 1024 * 1024 + 1]) {
    const data = evidenceFrom(request); data.cues[0].byteLength = bytes;
    assert.throws(() => attachReasonedMediaAudio(job, data), /invalid_reasoned_media_/u);
  }
  assert.throws(() => attachReasonedMediaAudio(job, evidenceFrom(request, 180)), /reasoned_media_audio_budget_exceeded/u);
  const bytes = evidenceFrom(request); bytes.cues.forEach(cue => { cue.byteLength = 20 * 1024 * 1024; });
  assert.throws(() => attachReasonedMediaAudio(job, bytes), /reasoned_media_audio_budget_exceeded/u);
});

// Catches accepting accessors/coercion/foreign prototypes/extra sensitive
// fields, or accidentally treating untrusted job/trace JSON as a trusted plan.
test('unknown fields accessors proxies cycles and foreign plans are rejected without invocation', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio, auditReasonedMediaJob } = await api();
  const trace = questionTrace();
  assert.throws(() => createReasonedMediaJob(JSON.parse(JSON.stringify(trace))), /untrusted_teaching_trace/u);
  assert.throws(() => createReasonedMediaJob(trace, { style, provider, studentId: 'not-allowed' }), /invalid_reasoned_media_/u);
  const job = createReasonedMediaJob(trace, { style, provider }), request = createReasonedMediaAudioRequest(job);
  for (const change of [data => { data.studentId = 'not-allowed'; }, data => { data.cues[0].path = '/not-read'; }, data => { data.provider.token = 'not-allowed'; }]) {
    const data = evidenceFrom(request); change(data);
    assert.throws(() => attachReasonedMediaAudio(job, data), /invalid_reasoned_media_/u);
  }
  let reads = 0;
  const access = evidenceFrom(request);
  Object.defineProperty(access.cues[0], 'transcript', { enumerable: true, get() { reads++; return request.cues[0].transcript; } });
  assert.throws(() => attachReasonedMediaAudio(job, access), /invalid_reasoned_media_/u);
  const proxy = new Proxy({}, { ownKeys() { reads++; throw Error('trap'); } });
  assert.throws(() => attachReasonedMediaAudio(job, proxy), /invalid_reasoned_media_/u);
  assert.equal(reads, 0);
  const cycle = evidenceFrom(request); cycle.cues[0].self = cycle;
  assert.throws(() => attachReasonedMediaAudio(job, cycle), /invalid_reasoned_media_/u);
  assert.throws(() => auditReasonedMediaJob(job, {}), /untrusted_reasoned_media_audio/u);
});

// Catches an attachment from another job being mistaken for a successfully
// voiced current job, or text inference being fabricated into an equation.
test('cross-job attachment audit fails and interpretation narration never invents arithmetic', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio, auditReasonedMediaJob } = await api();
  const first = createReasonedMediaJob(questionTrace(), { style, provider });
  const second = createReasonedMediaJob(questionTrace('area'), { style, provider });
  const attachment = attachReasonedMediaAudio(first, evidenceFrom(createReasonedMediaAudioRequest(first)));
  assert.throws(() => auditReasonedMediaJob(second, attachment), /reasoned_media_audio_binding_mismatch/u);
  const lesson = createReasonedMediaJob(createReasonedPerimeterLessonTrace());
  const cue = lesson.cues.find(item => item.stepId === 'counterexample' && item.kind === 'result');
  assert.doesNotMatch(cue.transcript, /eşittir/u);
  assert.equal(cue.transcriptSha256, sha(cue.transcript));
});

// Catches a hidden fixed-stage ceiling, last-stage loss or sparse cue acceptance
// when the common contract's largest supported trace reaches the media planner.
test('the largest supported trace retains all 24 reasons results checks and final transfer', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio } = await api();
  const trace = createReasonedTeachingTrace({
    id: 'media-max-steps', kind: 'question_solution', source: { id: 'max-source', contentSha256: sha('synthetic source') },
    goal: { question: 'Uzunluğun birimini koruyarak son adımı kontrol et.', unit: 'cm', measurement: 'length' },
    evidence: [{ id: 'given-length', type: 'given', text: 'Başlangıç uzunluğu.', anchor: 'given-length', value: 6, unit: 'cm' }],
    plan: { route: 'Uzunluğu koru.', why: 'Birim ve değeri değiştirmeden izlemek için.', conditions: ['Her adım aynı uzunluğu gösterir.'] },
    steps: Array.from({ length: 24 }, (_, index) => ({
      id: `stage-${index + 1}`, why: `Adım ${index + 1} aynı uzunluğu korur.`,
      operation: { kind: 'identity', inputIds: [index ? `stage-${index}` : 'given-length'] },
      result: { value: 6, unit: 'cm', meaning: `Adım ${index + 1} sonunda değişmeyen uzunluk.` },
      check: { prompt: `Adım ${index + 1} uzunluğu değiştirdi mi?`, answer: 'Hayır, 6 cm olarak kaldı.' },
    })),
    transfer: { prompt: 'Başlangıç 8 cm olsaydı aynı yöntemle ne korunurdu?', answer: 'Uzunluk 8 cm olarak korunurdu.' },
    scope: { gradeBand: 'unassigned', prerequisite: 'Sentetik sınır testi; öğrenci kullanımı için onaylı değildir.' },
  });
  const job = createReasonedMediaJob(trace, { style, provider });
  assert.equal(job.cues.length, 102);
  assert.equal(job.cues.filter(cue => cue.kind === 'why').length, 24);
  assert.equal(job.cues.filter(cue => cue.kind === 'check_answer').length, 24);
  assert.match(job.cues.at(-4).transcript, /6 cm/u);
  assert.equal(job.cues.at(-1).transcript, trace.transfer.answer);
  const request = createReasonedMediaAudioRequest(job);
  const attachment = attachReasonedMediaAudio(job, evidenceFrom(request, 0.1));
  assert.equal(attachment.timeline.length, 102);
  assert.equal(attachment.measuredSpeechSeconds, 10.2);
  assert.equal(attachment.plannedThinkingPauseSeconds, 100);
  assert.equal(attachment.plannedTimelineSeconds, 110.2);
  const sparse = evidenceFrom(request); delete sparse.cues[8];
  assert.throws(() => attachReasonedMediaAudio(job, sparse), /invalid_reasoned_media_data/u);
});

// Catches invocation of untrusted configuration hooks and same-trace audio
// reuse after a style change, even though the stable job IDs are equal.
test('configuration hooks never run and changed style cannot reuse a prior same-trace attachment', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio, auditReasonedMediaJob } = await api();
  const trace = questionTrace(); let invocations = 0;
  const accessor = {};
  Object.defineProperty(accessor, 'style', { enumerable: true, get() { invocations++; return style; } });
  assert.throws(() => createReasonedMediaJob(trace, accessor), /invalid_reasoned_media_data/u);
  const proxy = new Proxy({}, { getPrototypeOf() { invocations++; throw Error('not safe to execute'); } });
  assert.throws(() => createReasonedMediaJob(trace, proxy), /invalid_reasoned_media_data/u);
  assert.equal(invocations, 0);
  const first = createReasonedMediaJob(trace, { style, provider });
  const changed = createReasonedMediaJob(trace, { style: `${style} Daha yavaş ilerle.`, provider });
  assert.equal(first.id, changed.id);
  assert.notEqual(first.contentSha256, changed.contentSha256);
  const evidence = evidenceFrom(createReasonedMediaAudioRequest(first));
  assert.throws(() => attachReasonedMediaAudio(changed, evidence), /reasoned_media_audio_binding_mismatch/u);
  const attachment = attachReasonedMediaAudio(first, evidence);
  assert.throws(() => auditReasonedMediaJob(changed, attachment), /reasoned_media_audio_binding_mismatch/u);
});

// Catches accidentally treating inclusive limits as invalid while preserving
// the upper aggregate budgets; these remain declarations, not real waveforms.
test('inclusive duration and per-cue byte bounds accept complete bounded declarations', async () => {
  const { createReasonedMediaJob, createReasonedMediaAudioRequest, attachReasonedMediaAudio } = await api();
  const job = createReasonedMediaJob(questionTrace('area'), { style, provider });
  const data = evidenceFrom(createReasonedMediaAudioRequest(job), 180);
  data.cues.forEach(cue => { cue.byteLength = 20 * 1024 * 1024; });
  const attachment = attachReasonedMediaAudio(job, data);
  assert.equal(attachment.measuredSpeechSeconds, 1800);
  assert.equal(attachment.declaredAudioBytes, 200 * 1024 * 1024);
  assert.equal(attachment.audioBytesVerified, false);
  assert.equal(attachment.videoRendered, false);
});
