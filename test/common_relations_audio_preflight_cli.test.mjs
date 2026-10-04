import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const tool = fileURLToPath(new URL('../tools/common_relations_audio_preflight.mjs', import.meta.url));
const invoke = args => exec(process.execPath, [tool, ...args], { timeout: 30000, maxBuffer: 65536 });

test('default audio preflight is not run and cannot read sources mint capabilities or claim speech', async () => {
  const { stdout, stderr } = await invoke([]);
  assert.equal(stderr, '');
  const result = JSON.parse(stdout);
  assert.equal(result.schemaVersion, 'common-relations-audio-preflight/v1');
  assert.equal(result.state, 'not_run');
  assert.equal(result.sourceMetadataFilesRead, 0); assert.equal(result.providerCallsMade, 0);
  assert.equal(result.syntheticPcmClipsDecoded, 0); assert.equal(result.boundCurrentCues, 0);
  assert.equal(result.audioGeneratedByProvider, false); assert.equal(result.spokenTranscriptVerified, false);
  assert.equal(result.learnerReady, false); assert.equal(result.publicationReady, false);
  assert.equal(result.serializedAuthority, 'none');
  assert.ok(Buffer.byteLength(stdout) < 4096);
});

test('explicit fixed synthetic preflight exercises twenty real current cue bindings without transport or a speech assertion', async () => {
  const { stdout, stderr } = await invoke(['--synthetic-pcm']);
  assert.equal(stderr, ''); assert.ok(Buffer.byteLength(stdout) <= 32768);
  const result = JSON.parse(stdout);
  assert.equal(result.state, 'synthetic_pcm_preflight_only');
  assert.equal(result.sourceMetadataFilesRead, 3); assert.equal(result.providerCallsMade, 0);
  assert.equal(result.syntheticPcmClipsDecoded, 20); assert.equal(result.boundCurrentCues, 20);
  assert.equal(result.counts.existingAuthoredTasks, 1); assert.equal(result.counts.existingContexts, 2);
  for (const key of ['newAuthoredQuestions', 'acceptedProductQuestions', 'publishedQuestions']) assert.equal(result.counts[key], 0);
  assert.equal(result.audioGeneratedByProvider, false); assert.equal(result.spokenTranscriptVerified, false);
  assert.equal(result.voiceIdentityVerified, false); assert.equal(result.wordPenAlignmentVerified, false);
  assert.equal(result.audioPlaybackAllowed, false); assert.equal(result.learnerReady, false);
  assert.equal(result.publicationReady, false); assert.equal(result.productionReady, false);
  assert.equal(result.evidenceOrigin, 'local_unattested_pcm');
  assert.equal(result.audioFilesWritten, 0); assert.equal(result.videoFilesWritten, 0);
  assert.equal(result.rows.length, 20);
  assert.equal(new Set(result.rows.map(row => row.currentRequestSha256)).size, 20);
  assert.equal(new Set(result.rows.map(row => row.audioSha256)).size, 20);
  assert.deepEqual(new Set(result.rows.map(row => row.contextId)), new Set(['repeat', 'grouping']));
  for (const row of result.rows) {
    assert.match(row.currentRequestSha256, /^[a-f0-9]{64}$/u);
    assert.match(row.audioSha256, /^[a-f0-9]{64}$/u);
    assert.equal(row.evidenceOrigin, 'local_unattested_pcm');
    assert.equal(row.decodedSamplesVerified, true);
    assert.equal(row.durationSeconds, row.sampleCount / 24000);
    assert.equal(row.wavByteLength, 44 + row.sampleCount * 2);
    assert.equal(row.protocolCandidateStatus, 'unsupported_provider_candidate');
    for (const field of ['transcript', 'style', 'body', 'endpoint', 'provider', 'path', 'samples']) assert.equal(Object.hasOwn(row, field), false);
  }
  for (const value of Object.values(result.gates)) assert.equal(value, 'pending');
  for (const obligation of ['active_program_and_curriculum_review', 'teacher_current_cue_listening_review',
    'provider_account_credential', 'rights_commercial', 'privacy_retention_style_review',
    'live_endpoint_schema_and_voice_review', 'paid_budget']) assert.ok(result.pending.includes(obligation), obligation);
  assert.equal(result.serializedAuthority, 'none'); assert.equal(result.artifactAudience, 'editor_only');
  assert.equal(stdout.includes('/Users/'), false); assert.equal(stdout.includes('/var/folders/'), false);
});

test('live credentials endpoints paths budgets or extra arguments are sanitized before any preflight work', async () => {
  for (const args of [['--live'], ['--token', 'private-marker'], ['--endpoint', 'https://private-marker.invalid'],
    ['--out', '/private-marker'], ['--synthetic-pcm', '--budget', '1'], ['--synthetic-pcm', '--synthetic-pcm']]) {
    await assert.rejects(invoke(args), error => {
      assert.equal(error.code, 2);
      assert.equal(error.stdout, ''); assert.equal(error.stderr, 'common_relations_audio_preflight_invalid_arguments\n');
      assert.equal(error.stderr.includes('private-marker'), false);
      return true;
    });
  }
});
