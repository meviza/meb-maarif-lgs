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
