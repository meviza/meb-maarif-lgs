import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import childProcess from 'node:child_process';
import moduleApi, { syncBuiltinESMExports } from 'node:module';
import { EventEmitter } from 'node:events';
import { PassThrough, Writable } from 'node:stream';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { createHash } from 'node:crypto';

const api = await import('../packages/media/ink_video_renderer.mjs').catch(() => ({}));
const fn = name => { assert.equal(typeof api[name], 'function', `${name} is not implemented`); return api[name]; };
const cueIds = ['intro', 'step1', 'step2', 'step3', 'step4', 'outro'];
const manifest = () => ({ schemaVersion: 'ink-audio-preview/v1', rightsStatus: 'technical_preview_only', segments: cueIds.map(cueId => ({ cueId, path: `/tmp/ink-voice-${cueId}.wav`, byteLength: 100, sha256: '1'.repeat(64) })) });
const digest = value => createHash('sha256').update(value).digest('hex');
// Reviewed default-plan revision, not a measured-audio plan or caller clone.
const sourcePlanSha256 = '309a08895704329e9db15782fe1fdf56a449421c21019bfaaa02c8344fdc6e6b';
const transcripts = [
  'İki sıra tel çekilecek, ama kapı açık kalacak. Nasıl hesaplarız?',
  'On sekizin yarısı dokuz; üç katı yirmi yedi. Uzun kenarı bulduk.',
  'İki kenarı toplayıp ikiyle çarpalım. Doksan metre, bahçenin tam çevresi.',
  'Kapının dört metresini çıkaralım. Bir sıra için seksen altı metre tel gerekir.',
  'İki sıra istendiği için seksen altıyı ikiyle çarparız. Yüz yetmiş iki metre.',
  'Gizli nokta: kapı boşluğu her iki tel sırasında da bırakılır.',
];
const manifestV2 = () => ({
  schemaVersion: 'ink-audio-preview/v2', rightsStatus: 'technical_preview_only',
  sourcePlanId: 'ink-garden-two-rows-v1', sourcePlanSha256,
  segments: manifest().segments.map((segment, i) => ({ ...segment,
    transcript: transcripts[i], transcriptSha256: digest(transcripts[i]),
    style: 'Sakin, açık ve doğal yetişkin öğretmen tonu.', styleSha256: digest('Sakin, açık ve doğal yetişkin öğretmen tonu.'),
    provider: 'fixture-provider', modelId: 'fixture-tts', voiceId: 'fixture-adult',
  })),
});

test('v2 accepts six exact default-plan transcripts with immutable declared style and provider identity', () => {
  const source = manifestV2(), checked = fn('validateInkAudioManifest')(source);
  assert.equal(checked.schemaVersion, 'ink-audio-preview/v2');
  assert.equal(checked.sourcePlanId, 'ink-garden-two-rows-v1'); assert.equal(checked.sourcePlanSha256, sourcePlanSha256);
  assert.deepEqual(checked.segments.map(s => s.transcript), transcripts);
  assert.equal(checked.segments[0].provider, 'fixture-provider');
  assert.equal(checked.segments[0].styleSha256, digest('Sakin, açık ve doğal yetişkin öğretmen tonu.'));
  source.segments[0].style = 'caller mutation';
  assert.equal(checked.segments[0].style, 'Sakin, açık ve doğal yetişkin öğretmen tonu.');
  assert.equal(Object.isFrozen(checked.segments[0]), true);
});

test('v2 denies foreign source plan identities and altered canonical source hashes', () => {
  fn('validateInkAudioManifest')(manifestV2());
  for (const override of [{ sourcePlanId: 'foreign-plan' }, { sourcePlanSha256: '0'.repeat(64) }, { sourcePlanSha256: 'bad-hash' }]) {
    assert.throws(() => fn('validateInkAudioManifest')({ ...manifestV2(), ...override }), /invalid_audio_manifest/);
  }
});

test('v2 rejects a stale transcript hash and a correctly rehashed wrong transcript or wrong cue', () => {
  fn('validateInkAudioManifest')(manifestV2());
  for (const override of [
    { transcriptSha256: '0'.repeat(64) },
    { transcript: 'Yanlış sonuç: yüz yetmiş üç metre.', transcriptSha256: digest('Yanlış sonuç: yüz yetmiş üç metre.') },
    { transcript: transcripts[1], transcriptSha256: digest(transcripts[1]) },
  ]) {
    const candidate = manifestV2(); Object.assign(candidate.segments[0], override);
    assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
  }
});

test('v2 style is a bounded hash-bound declaration rather than invented listener approval', () => {
  fn('validateInkAudioManifest')(manifestV2());
  for (const style of ['', 'x'.repeat(2001), 'ı'.repeat(1001), 'https://example.com/private-voice', 'data:audio/wav;base64,fixture', 'Bearer fixture-not-a-real-secret', 'api_key=fixture-not-a-real-secret']) {
    const candidate = manifestV2(); Object.assign(candidate.segments[0], { style, styleSha256: digest(style) });
    assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
  }
  const stale = manifestV2(); stale.segments[0].style = 'Başka bir üslup.';
  assert.throws(() => fn('validateInkAudioManifest')(stale), /invalid_audio_manifest/);
});

test('v2 provider model and voice declarations reject URLs secret forms nonstrings and unbounded identifiers', () => {
  fn('validateInkAudioManifest')(manifestV2());
  for (const field of ['provider', 'modelId', 'voiceId']) for (const value of ['', 'x'.repeat(97), 'https://example.com/voice', 'cfut_fixture_not_a_real_secret', { toString() { throw new Error('must not coerce'); } }]) {
    const candidate = manifestV2(); candidate.segments[0][field] = value;
    assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
  }
});

test('v2 keeps exact own schemas and denies transcript accessors array hooks and reflection proxies without invoking them', () => {
  fn('validateInkAudioManifest')(manifestV2());
  for (const mutate of [
    candidate => { candidate.listenerApproved = true; },
    candidate => { candidate.segments[0].publicationReady = true; },
    candidate => { delete candidate.segments[0].voiceId; },
    candidate => { delete candidate.segments[0]; },
    candidate => { candidate.segments.map = () => { throw new Error('must not execute'); }; },
  ]) {
    const candidate = manifestV2(); mutate(candidate);
    assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
  }
  for (const target of ['header', 'segment', 'proxy_header', 'proxy_segment']) {
    const candidate = manifestV2(); let invoked = false;
    if (target === 'header') Object.defineProperty(candidate, 'sourcePlanId', { get() { invoked = true; return 'ink-garden-two-rows-v1'; } });
    if (target === 'segment') Object.defineProperty(candidate.segments[0], 'transcript', { get() { invoked = true; return transcripts[0]; } });
    const trap = { getOwnPropertyDescriptor() { invoked = true; throw new Error('must not reflect proxy'); } };
    const value = target === 'proxy_header' ? new Proxy(candidate, trap) : candidate;
    if (target === 'proxy_segment') candidate.segments[0] = new Proxy(candidate.segments[0], trap);
    assert.throws(() => fn('validateInkAudioManifest')(value), /invalid_audio_manifest/);
    assert.equal(invoked, false);
  }
});

test('frame budget bounds continuous motion frames rather than allocating a full frame directory', () => {
  assert.deepEqual(fn('createInkRenderBudget')(35), { fps: 24, frameCount: 840, width: 1280, height: 720, maximumTotalBytes: 64 * 1024 * 1024 });
  assert.equal(fn('createInkRenderBudget')(180).frameCount, 4320);
  for (const seconds of [0, -1, NaN, Infinity, 181, '35']) assert.throws(() => fn('createInkRenderBudget')(seconds), /invalid_render_duration/);
});

test('audio evidence needs all six unique local bounded content hashes and cannot claim publication rights', () => {
  const checked = fn('validateInkAudioManifest')(manifest());
  assert.deepEqual(checked.segments.map(s => s.cueId), cueIds);
  assert.equal(checked.rightsStatus, 'technical_preview_only');
  assert.equal(Object.isFrozen(checked), true);
  assert.equal(Object.isFrozen(checked.segments[0]), true);
  for (const invalid of [
    { ...manifest(), rightsStatus: 'commercially_approved' },
    { ...manifest(), segments: manifest().segments.slice(1) },
    { ...manifest(), segments: manifest().segments.map(s => ({ ...s, cueId: 'intro' })) },
    { ...manifest(), networkUrl: 'https://example.com/voice.wav' },
  ]) assert.throws(() => fn('validateInkAudioManifest')(invalid), /invalid_audio_manifest/);
});

test('remote paths, excessive bytes, hash placeholders and accessor-based audio metadata are denied', () => {
  for (const override of [{ path: 'https://example.com/a.wav' }, { path: '/tmp/a\0.wav' }, { byteLength: 11 * 1024 * 1024 }, { byteLength: 0 }, { sha256: 'not-a-hash' }]) {
    const candidate = manifest(); Object.assign(candidate.segments[0], override);
    assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
  }
  let invoked = false; const candidate = manifest();
  Object.defineProperty(candidate.segments[0], 'path', { get() { invoked = true; return '/tmp/voice.wav'; } });
  assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
  assert.equal(invoked, false);
});

test('audio segments require plain own dense array values without evaluating getters or custom map hooks', () => {
  for (const mutate of [
    (array, touched) => Object.defineProperty(array, '0', { get() { touched.value = true; return manifest().segments[0]; } }),
    (array, touched) => Object.defineProperty(array, 'map', { get() { touched.value = true; return Array.prototype.map; } }),
    (array, touched) => { array.map = () => { touched.value = true; return manifest().segments; }; },
    array => { delete array[0]; },
    array => { array.extra = 'unbound'; },
    array => Object.setPrototypeOf(array, Object.create(Array.prototype)),
  ]) {
    const candidate = manifest(), touched = { value: false }; mutate(candidate.segments, touched);
    assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
    assert.equal(touched.value, false);
  }
  let trapped = false; const candidate = manifest();
  candidate.segments = new Proxy(candidate.segments, { get() { trapped = true; throw new Error('must not read proxy'); } });
  assert.throws(() => fn('validateInkAudioManifest')(candidate), /invalid_audio_manifest/);
  assert.equal(trapped, false);
});

test('cue captions preserve real timeline boundaries without treating predicted speech timing as alignment proof', () => {
  const plan = { segments: [{ id: 'intro', startSeconds: 0, durationSeconds: 4, narration: 'Soruyu birlikte inceleyelim.' }, { id: 'step1', startSeconds: 4, durationSeconds: 7.25, narration: 'Uzun kenarı bulalım.' }] };
  const vtt = fn('inkSegmentsToVtt')(plan.segments);
  assert.match(vtt, /00:00:04\.000 --> 00:00:11\.250/);
  assert.match(vtt, /Uzun kenarı bulalım\./);
  assert.throws(() => fn('inkSegmentsToVtt')([{ ...plan.segments[0], durationSeconds: Infinity }]), /invalid_caption_segments/);
});

test('renderer refuses existing output before loading dependencies and preserves unrelated files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'k12-ink-output-test-'));
  try {
    const keep = join(root, 'keep.txt'); await writeFile(keep, 'user-owned');
    await assert.rejects(fn('renderInkVideo')({ outputDirectory: root }), /output_directory_exists/);
    assert.equal(await readFile(keep, 'utf8'), 'user-owned');
  } finally { await rm(root, { recursive: true }); }
});

test('CLI rejects relative, remote, duplicate and incomplete arguments without invoking encoding', () => {
  for (const args of [[], ['--out', 'relative'], ['--out', 'https://example.com/out'], ['--unknown', '/tmp/out'], ['--out', '/tmp/a', '--out', '/tmp/b'], ['--out', '/tmp/a', '--audio-manifest']]) {
    const result = spawnSync(process.execPath, ['tools/render_ink_video.mjs', ...args], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^ink_render_request_rejected\n$/);
  }
});

// Only the slow encoder/raster boundaries are replaced. The renderer's file,
// timeline, pressure handling, deadline and error paths remain the real code.
async function withBlockedRenderer(t, { blockRaster = false } = {}, check) {
  const root = await mkdtemp(join(tmpdir(), 'k12-ink-pressure-test-'));
  const child = new EventEmitter(); child.exitCode = null;
  let markRasterStarted, markWriteStarted;
  const rasterStarted = new Promise(resolve => { markRasterStarted = resolve; });
  const writeStarted = new Promise(resolve => { markWriteStarted = resolve; });
  child.stdin = new Writable({ highWaterMark: 1, write(_bytes, _encoding, _callback) { markWriteStarted(); } });
  child.stderr = new PassThrough();
  child.kill = () => { child.exitCode = -1; queueMicrotask(() => child.emit('close', -1)); return true; };
  const sharp = () => ({
    removeAlpha() { return this; }, raw() { return this; },
    toBuffer() { markRasterStarted(); return blockRaster ? new Promise(() => {}) : Promise.resolve(Buffer.alloc(1280 * 720 * 3)); },
  });
  sharp.concurrency = () => {}; sharp.cache = () => {};
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(moduleApi, 'createRequire', () => name => {
    assert.equal(name, 'sharp'); return sharp;
  });
  t.mock.method(childProcess, 'spawn', (binary, args) => {
    assert.equal(binary, 'ffmpeg'); assert.equal(args.includes('rawvideo'), true); return child;
  });
  syncBuiltinESMExports();
  const outcome = { state: 'pending' };
  // A failing regression must not wait on the buggy promise forever.
  fn('renderInkVideo')({ outputDirectory: join(root, 'output') }).then(
    () => { outcome.state = 'resolved'; },
    error => { outcome.state = 'rejected'; outcome.message = error.message; },
  );
  try {
    await check({ child, outcome, rasterStarted, writeStarted });
  } finally {
    child.stdin.destroy(); child.stderr.destroy();
    t.mock.restoreAll(); syncBuiltinESMExports(); t.mock.timers.reset();
    await rm(root, { recursive: true });
  }
}

test('encoder close rejects rendering while input is backpressured instead of waiting forever for drain', async t => {
  await withBlockedRenderer(t, {}, async ({ child, outcome, writeStarted }) => {
    await writeStarted;
    child.exitCode = 1; child.stdin.destroy(); child.emit('close', 1);
    await nextTurn();
    assert.deepEqual(outcome, { state: 'rejected', message: 'ink_encode_failed' });
  });
});

test('encoder error rejects rendering while input is backpressured', async t => {
  await withBlockedRenderer(t, {}, async ({ child, outcome, writeStarted }) => {
    await writeStarted;
    child.emit('error', new Error('technical fixture encoder failure'));
    await nextTurn();
    assert.deepEqual(outcome, { state: 'rejected', message: 'ink_encode_failed' });
  });
});

test('render deadline rejects a backpressured encoder without requiring a drain event', async t => {
  await withBlockedRenderer(t, {}, async ({ outcome, writeStarted }) => {
    await writeStarted;
    t.mock.timers.tick(180000);
    await nextTurn();
    assert.deepEqual(outcome, { state: 'rejected', message: 'ink_encode_failed' });
  });
});

test('the same render deadline rejects a raster operation that never settles', async t => {
  await withBlockedRenderer(t, { blockRaster: true }, async ({ outcome, rasterStarted }) => {
    await rasterStarted;
    t.mock.timers.tick(180000);
    await nextTurn();
    assert.deepEqual(outcome, { state: 'rejected', message: 'ink_encode_failed' });
  });
});

function technicalPcmTone(frequency, { sampleRate = 24000, channels = 1 } = {}) {
  const samples = sampleRate / 2, bytes = Buffer.alloc(44 + samples * channels * 2);
  bytes.write('RIFF', 0); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(channels, 22);
  bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(sampleRate * channels * 2, 28);
  bytes.writeUInt16LE(channels * 2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36);
  bytes.writeUInt32LE(samples * channels * 2, 40);
  for (let i = 0; i < samples; i++) for (let channel = 0; channel < channels; channel++) bytes.writeInt16LE(Math.round(8000 * Math.sin(2 * Math.PI * frequency * i / sampleRate)), 44 + (i * channels + channel) * 2);
  return bytes;
}

async function renderTechnicalReceipt(t, audio) {
  const root = await mkdtemp(join(tmpdir(), 'k12-ink-binding-test-'));
  try {
    const bytes = technicalPcmTone(330);
    for (const segment of audio.segments) {
      segment.path = join(root, `${segment.cueId}.wav`); segment.byteLength = bytes.length; segment.sha256 = digest(bytes);
      await writeFile(segment.path, bytes, { flag: 'wx' });
    }
    const sharp = () => ({ removeAlpha() { return this; }, raw() { return this; }, toBuffer() { return Promise.resolve(rgb); } });
    const rgb = Buffer.alloc(1280 * 720 * 3); sharp.concurrency = () => {}; sharp.cache = () => {};
    t.mock.method(moduleApi, 'createRequire', () => () => sharp);
    t.mock.method(childProcess, 'spawn', (binary, args) => {
      const child = new EventEmitter(); child.exitCode = null; child.stderr = new PassThrough(); child.kill = () => true;
      if (binary === 'ffmpeg') {
        child.stdin = new Writable({ write(_bytes, _encoding, done) { done(); }, final(done) {
          // Not a playable MP4: the real native encode/decode lives in the opt-in test.
          writeFile(args.at(-1), Buffer.alloc(32), { flag: 'wx' }).then(() => { done(); child.exitCode = 0; child.emit('close', 0); }, done);
        } });
      } else {
        assert.equal(binary, 'ffprobe'); child.stdout = new PassThrough();
        const isAudio = args.at(-1).endsWith('.wav');
        const streams = isAudio ? [{ codec_type: 'audio', codec_name: 'pcm_s16le', channels: 1, sample_rate: '24000', r_frame_rate: '0/0' }] : [
          { codec_type: 'video', codec_name: 'h264', pix_fmt: 'yuv420p', width: 1280, height: 720, r_frame_rate: '24/1' },
          { codec_type: 'audio', codec_name: 'aac', channels: 1, sample_rate: '24000', r_frame_rate: '0/0' },
        ];
        queueMicrotask(() => { child.stdout.end(JSON.stringify({ streams, format: { duration: isAudio ? '0.500000' : '35.000000', size: String(isAudio ? bytes.length : 32) } })); child.stderr.end(); child.emit('close', 0); });
      }
      return child;
    });
    syncBuiltinESMExports();
    return await fn('renderInkVideo')({ outputDirectory: join(root, 'output'), audioManifest: audio });
  } finally { t.mock.restoreAll(); syncBuiltinESMExports(); await rm(root, { recursive: true }); }
}

test('v1 renderer receipt declares technically muxed audio unbound and not listener verified', async t => {
  const receipt = await renderTechnicalReceipt(t, manifest());
  assert.equal(receipt.contentBindingStatus, 'unbound_technical_preview_only');
  assert.equal(receipt.speechContentStatus, 'not_listener_verified');
  assert.equal(receipt.publicationReady, false); assert.equal(receipt.expertReview, 'pending');
  assert.equal(receipt.narrationQuality, 'not_listener_approved');
});

test('v2 renderer keeps the default source binding separate from the measured plan and does not certify spoken words', async t => {
  const receipt = await renderTechnicalReceipt(t, manifestV2());
  assert.equal(receipt.contentBindingStatus, 'declared_transcript_bound_not_listener_verified');
  assert.equal(receipt.speechContentStatus, 'not_listener_verified');
  assert.equal(receipt.audioSourcePlan.sourcePlanId, 'ink-garden-two-rows-v1');
  assert.equal(receipt.audioSourcePlan.sourcePlanSha256, sourcePlanSha256);
  assert.notEqual(receipt.planSha256, sourcePlanSha256);
  assert.equal(receipt.audioEvidence[0].declaration.transcript, transcripts[0]);
  assert.equal(receipt.audioEvidence[0].declaration.transcriptSha256, digest(transcripts[0]));
  assert.equal(receipt.audioEvidence[0].declaration.styleSha256, digest('Sakin, açık ve doğal yetişkin öğretmen tonu.'));
  assert.equal(receipt.audioEvidence[0].declaration.provider, 'fixture-provider');
  assert.equal(receipt.audioEvidence[0].declaration.modelId, 'fixture-tts');
  assert.equal(receipt.audioEvidence[0].declaration.voiceId, 'fixture-adult');
  assert.equal(receipt.publicationReady, false); assert.equal(receipt.expertReview, 'pending');
  assert.equal(receipt.narrationQuality, 'not_listener_approved');
});

test('local audio preview rejects stereo and non-24kHz PCM rather than normalizing their source format', async t => {
  for (const format of [{ sampleRate: 24000, channels: 2 }, { sampleRate: 48000, channels: 1 }]) {
    const root = await mkdtemp(join(tmpdir(), 'k12-ink-format-test-'));
    try {
      const bytes = technicalPcmTone(330, format), audio = { schemaVersion: 'ink-audio-preview/v1', rightsStatus: 'technical_preview_only', segments: [] };
      for (const cueId of cueIds) {
        const path = join(root, `${cueId}.wav`); await writeFile(path, bytes, { flag: 'wx' });
        audio.segments.push({ cueId, path, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      }
      const sharp = () => { throw new Error('rejected_source_must_not_rasterize'); };
      sharp.concurrency = () => {}; sharp.cache = () => {};
      t.mock.method(moduleApi, 'createRequire', () => () => sharp);
      t.mock.method(childProcess, 'spawn', (binary, args) => {
        if (binary !== 'ffprobe') throw new Error('encoding_started_for_rejected_pcm');
        assert.equal(args.at(-1).endsWith('.wav'), true);
        const response = new EventEmitter(); response.stdout = new PassThrough(); response.stderr = new PassThrough(); response.kill = () => true;
        queueMicrotask(() => {
          response.stdout.end(JSON.stringify({ streams: [{ codec_type: 'audio', codec_name: 'pcm_s16le', channels: format.channels, sample_rate: String(format.sampleRate), r_frame_rate: '0/0' }], format: { duration: '0.500000', size: String(bytes.length) } }));
          response.stderr.end(); response.emit('close', 0);
        });
        return response;
      });
      syncBuiltinESMExports();
      await assert.rejects(fn('renderInkVideo')({ outputDirectory: join(root, 'output'), audioManifest: audio }), /unsupported_audio_artifact/);
    } finally {
      t.mock.restoreAll(); syncBuiltinESMExports(); await rm(root, { recursive: true });
    }
  }
});

test('optional real six-PCM mux verifies audio cue starts and silence padding, not a teacher voice', {
  skip: process.env.K12_INK_REAL_MEDIA_TEST !== '1',
}, async () => {
  const root = await mkdtemp(join(tmpdir(), 'k12-ink-pcm-integration-'));
  try {
    const audio = { schemaVersion: 'ink-audio-preview/v1', rightsStatus: 'technical_preview_only', segments: [] };
    const frequencies = [330, 392, 440, 494, 523, 587];
    for (let i = 0; i < cueIds.length; i++) {
      const bytes = technicalPcmTone(frequencies[i]), path = join(root, `${cueIds[i]}.wav`);
      await writeFile(path, bytes, { flag: 'wx' });
      audio.segments.push({ cueId: cueIds[i], path, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
    const runtime = process.env.K12_INK_SHARP_PACKAGE ? { sharpPackage: process.env.K12_INK_SHARP_PACKAGE } : {};
    const outputDirectory = join(root, 'output');
    const receipt = await fn('renderInkVideo')({ outputDirectory, runtime, audioManifest: audio });
    assert.equal(receipt.video.audio, true); assert.equal(receipt.video.frameCount, 840);
    assert.equal(receipt.voiceStatus, 'muxed_audio_preview_unreviewed');
    assert.equal(receipt.publicationReady, false); assert.equal(receipt.narrationQuality, 'not_listener_approved');
    assert.deepEqual(receipt.audioEvidence.map(s => s.measuredSeconds), [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    const decoded = spawnSync('ffmpeg', ['-v', 'error', '-i', join(outputDirectory, 'solution.mp4'), '-map', '0:a:0', '-ac', '1', '-ar', '24000', '-f', 's16le', 'pipe:1'], { maxBuffer: 4 * 1024 * 1024, timeout: 30000 });
    assert.equal(decoded.status, 0); assert.equal(decoded.signal, null);
    assert.ok(decoded.stdout.length >= 34.9 * 24000 * 2);
    const rmsAt = seconds => {
      let total = 0; const first = Math.round(seconds * 24000);
      for (let i = first; i < first + 2400; i++) total += decoded.stdout.readInt16LE(i * 2) ** 2;
      return Math.sqrt(total / 2400);
    };
    // Independently hand-derived starts of the six minimum-duration cues.
    for (const start of [0, 4, 11, 18, 24, 31]) {
      assert.ok(rmsAt(start + 0.1) > 500, `PCM fixture missing at cue ${start}`);
      assert.ok(rmsAt(start + 1) < 30, `padding is not silent at cue ${start}`);
    }
  } finally { await rm(root, { recursive: true }); }
});
