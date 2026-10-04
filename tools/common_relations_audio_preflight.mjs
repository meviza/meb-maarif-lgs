// Local diagnostic only. The default and invalid-argument paths do not load
// source metadata or any media capability. No live/provider mode exists.
const args = process.argv.slice(2);
const idle = {
  schemaVersion: 'common-relations-audio-preflight/v1', state: 'not_run',
  artifactAudience: 'editor_only', serializedAuthority: 'none', sourceMetadataFilesRead: 0,
  providerCallsMade: 0, syntheticPcmClipsDecoded: 0, boundCurrentCues: 0,
  audioGeneratedByProvider: false, spokenTranscriptVerified: false,
  learnerReady: false, publicationReady: false, productionReady: false,
};

async function syntheticPreflight() {
  const fs = await import('node:fs');
  const { dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { createHash } = await import('node:crypto');
  const { createGrade6CommonRelationsFactoryPreparation } = await import('../packages/content-factory/grade6_common_relations_factory_preparation.mjs');
  const { createReasonedMediaJob } = await import('../packages/media/reasoned_media_job.mjs');
  const { createGrade6CommonRelationsVoiceBridge } = await import('../packages/media/grade6_common_relations_voice_bridge.mjs');
  const { createGrade6CommonRelationsClosedTts } = await import('../packages/media/grade6_common_relations_closed_tts.mjs');
  const { inspectCommonRelationsPcmWav, bindCommonRelationsPcmReceipt, auditCommonRelationsBoundPcmReceipt } = await import('../packages/media/common_relations_pcm_receipt.mjs');
  const sha = bytes => createHash('sha256').update(bytes).digest('hex');
  const sameIdentity = (a, b) => a.dev === b.dev && a.ino === b.ino;
  const sameFile = (a, b) => sameIdentity(a, b) && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs;
  function parents(path) {
    const paths = ['/']; let current = '';
    for (const part of dirname(path).split('/').slice(1)) { if (part) { current += '/' + part; paths.push(current); } }
    return paths.map(path => {
      const stat = fs.lstatSync(path);
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('source_unavailable');
      return { path, stat };
    });
  }
  function checkParents(snapshot) {
    for (const entry of snapshot) {
      const now = fs.lstatSync(entry.path);
      if (!now.isDirectory() || now.isSymbolicLink() || !sameIdentity(entry.stat, now)) throw new Error('source_unavailable');
    }
  }
  const files = [];
  function load(name) {
    // Names are code literals below, never caller paths or credentials.
    const path = fileURLToPath(new URL(`../sources/${name}.json`, import.meta.url));
    const parentState = parents(path), before = fs.lstatSync(path);
    if (!before.isFile() || before.isSymbolicLink() || before.size < 1 || before.size > 524288
      || typeof fs.constants.O_NOFOLLOW !== 'number') throw new Error('source_unavailable');
    const fd = fs.openSync(path, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    try {
      const held = fs.fstatSync(fd);
      if (!held.isFile() || !sameFile(before, held)) throw new Error('source_unavailable');
      const buffer = Buffer.alloc(held.size + 1); let size = 0;
      while (size < buffer.length) {
        const count = fs.readSync(fd, buffer, size, buffer.length - size, size);
        if (!count) break; size += count;
      }
      checkParents(parentState);
      const after = fs.fstatSync(fd), now = fs.lstatSync(path);
      if (size !== held.size || !now.isFile() || now.isSymbolicLink() || !sameFile(held, after) || !sameFile(held, now)) throw new Error('source_unavailable');
      const bytes = buffer.subarray(0, size);
      const data = JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes));
      files.push({ id: name, byteLength: size, rawSha256: sha(bytes) });
      return data;
    } finally { fs.closeSync(fd); }
  }
  const registry = load('meb-reference-registry');
  if (!Array.isArray(registry.sources)) throw new Error('source_unavailable');
  const records = registry.sources.filter(row => row?.id === 'tymm-current-ortaokul-matematik');
  if (records.length !== 1) throw new Error('source_unavailable');
  const sourceBindingInput = { sourceRecord: records[0],
    applicationObservations: load('grade6-common-relations-application-observations'),
    semanticMatrix: load('grade6-source-semantic-candidate-matrix') };
  const factory = createGrade6CommonRelationsFactoryPreparation(sourceBindingInput);
  const originalFactory = JSON.stringify(factory), rows = [];
  const pending = new Set([...factory.manifest.pending, ...factory.preparation.manifest.pending]);
  const provider = { id: 'local-pcm-fixture', modelId: 'signed16-test', voiceId: 'not-a-person' };
  const style = 'Yerel test verisi. Bu baytlar öğretmen konuşması veya sağlayıcı çıktısı değildir.';
  function wave(index) {
    const count = 6000 + index, bytes = Buffer.alloc(44 + count * 2);
    bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
    bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
    bytes.writeUInt32LE(24000, 24); bytes.writeUInt32LE(48000, 28); bytes.writeUInt16LE(2, 32);
    bytes.writeUInt16LE(16, 34); bytes.write('data', 36); bytes.writeUInt32LE(count * 2, 40);
    const samples = [-32768, -1, 0, 1, 32767];
    for (let i = 0; i < count; i++) bytes.writeInt16LE(samples[(i + index) % samples.length], 44 + i * 2);
    return bytes;
  }
  for (const context of factory.preparation.contexts) {
    const voiceJob = createReasonedMediaJob(context.trace, { provider, style });
    const bridge = createGrade6CommonRelationsVoiceBridge({ factoryPreparation: factory, sourceBindingInput,
      contextId: context.contextId, voiceJob });
    for (const cue of voiceJob.cues) {
      // Explicit editor simulation of all cues, NOT student reveal authorization.
      const preparation = createGrade6CommonRelationsClosedTts(bridge, { cueIndex: cue.order, progress: 1, reveal: true });
      const wav = wave(rows.length), receipt = inspectCommonRelationsPcmWav(wav);
      const bound = bindCommonRelationsPcmReceipt(preparation, receipt), audit = auditCommonRelationsBoundPcmReceipt(bound);
      if (audit.valid !== true || preparation.protocolCandidate !== null || bound.audio.audioSha256 !== sha(wav)
        || bound.audio.pcmSha256 !== sha(wav.subarray(44)) || bound.limits.spokenTranscriptVerified !== false
        || bound.limits.providerCallsMade !== 0 || Object.values(bound.gates).some(value => value !== 'pending')) throw new Error('preflight_mismatch');
      for (const obligation of bound.pending) pending.add(obligation);
      rows.push({ contextId: context.contextId, cueId: cue.id, order: cue.order, kind: cue.kind,
        currentRequestSha256: bound.binding.currentRequestSha256,
        boundReceiptSha256: audit.boundReceiptSha256, audioSha256: bound.audio.audioSha256,
        pcmSha256: bound.audio.pcmSha256, wavByteLength: bound.audio.wavByteLength,
        sampleCount: bound.audio.sampleCount, durationSeconds: bound.audio.durationSeconds,
        decodedSamplesVerified: bound.audio.decodedSamplesVerified, evidenceOrigin: bound.audio.evidenceOrigin,
        protocolCandidateStatus: preparation.protocolCandidateStatus });
    }
  }
  if (rows.length !== 20 || new Set(rows.map(row => row.currentRequestSha256)).size !== 20
    || new Set(rows.map(row => row.audioSha256)).size !== 20 || JSON.stringify(factory) !== originalFactory) throw new Error('preflight_mismatch');
  return { ...idle, state: 'synthetic_pcm_preflight_only', sourceMetadataFilesRead: files.length, sourceMetadata: files,
    syntheticPcmClipsDecoded: rows.length, boundCurrentCues: rows.length, evidenceOrigin: 'local_unattested_pcm',
    counts: { existingAuthoredTasks: 1, existingContexts: 2, newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    audioFilesWritten: 0, videoFilesWritten: 0, voiceIdentityVerified: false, wordPenAlignmentVerified: false,
    audioPlaybackAllowed: false, videoRendered: false, gates: { ...factory.draft.gates }, rows,
    pending: [...new Set([...pending, 'scoped_provider_authorization', 'adult_editor_minor_terms_review', 'rights_and_privacy_review',
      'actual_provider_response_and_audio', 'spoken_transcript_and_teacher_listening', 'word_pen_alignment',
      'bounded_audio_file_readback_and_derivative', 'real_common_video_and_learner_delivery'])] };
}

if (args.length === 0) process.stdout.write(JSON.stringify(idle) + '\n');
else if (args.length !== 1 || args[0] !== '--synthetic-pcm') {
  process.stderr.write('common_relations_audio_preflight_invalid_arguments\n'); process.exitCode = 2;
} else {
  try {
    const result = await syntheticPreflight(), output = JSON.stringify(result) + '\n';
    if (Buffer.byteLength(output) > 32768) throw new Error('output_budget');
    process.stdout.write(output);
  } catch {
    process.stderr.write('common_relations_audio_preflight_failed\n'); process.exitCode = 1;
  }
}
