import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, symlink, lstat, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { PassThrough, Writable } from 'node:stream';
import childProcess, { spawnSync } from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { validateInkAudioManifest } from '../packages/media/ink_video_renderer.mjs';

const api = await import('../packages/media/prepare_ink_audio.mjs').catch(() => ({}));
const prepare = input => { assert.equal(typeof api.prepareInkAudio, 'function', 'prepareInkAudio is not implemented'); return api.prepareInkAudio(input); };
const cues = ['intro', 'step1', 'step2', 'step3', 'step4', 'outro'];
const sha = value => createHash('sha256').update(value).digest('hex');
const style = 'Sakin, açık ve doğal yetişkin öğretmen tonu.';
const ffmpegPath = '/opt/homebrew/bin/ffmpeg';
const declarations = { style, provider: 'Google AI Studio', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon', ffmpegPath };
const transcripts = [
  'İki sıra tel çekilecek, ama kapı açık kalacak. Nasıl hesaplarız?',
  'On sekizin yarısı dokuz; üç katı yirmi yedi. Uzun kenarı bulduk.',
  'İki kenarı toplayıp ikiyle çarpalım. Doksan metre, bahçenin tam çevresi.',
  'Kapının dört metresini çıkaralım. Bir sıra için seksen altı metre tel gerekir.',
  'İki sıra istendiği için seksen altıyı ikiyle çarparız. Yüz yetmiş iki metre.',
  'Gizli nokta: kapı boşluğu her iki tel sırasında da bırakılır.',
];

// Independently built PCM: 12,000 mono signed-16 samples at 24 kHz = 0.5 seconds.
function wav(index = 0, byteRate = 96000) {
  const pcm = Buffer.alloc(24000);
  const samples = [1000 + index, -1000 - index, 0, 32767, -32768];
  for (let sample = 0; sample < 12000; sample++) pcm.writeInt16LE(samples[sample % 5], sample * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(24000, 24); header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'k12-prepare-audio-')));
  t.after(async () => { await rm(root, { recursive: true, force: true }); });
  const sourceDirectory = join(root, 'source'), outputDirectory = join(root, 'prepared');
  await mkdir(sourceDirectory);
  const originals = cues.map((_, index) => wav(index));
  for (const [index, cue] of cues.entries()) await writeFile(join(sourceDirectory, `cue-${cue}-source.wav`), originals[index], { flag: 'wx' });
  return { root, sourceDirectory, outputDirectory, originals, input: { sourceDirectory, outputDirectory, ...declarations } };
}

// Only the external remux boundary is doubled. File validation, RIFF parsing,
// manifest validation, hashes and source-preservation checks remain real.
function remuxDouble(t, { corruptPcm = false, keepBadByteRate = false, fail = false, hang = false, sourceMutation = null } = {}) {
  let markStarted; const started = new Promise(resolve => { markStarted = resolve; });
  const invocation = { calls: 0, started, killed: false };
  t.mock.method(childProcess, 'spawn', (binary, args, options) => {
    invocation.calls++;
    assert.equal(binary, ffmpegPath);
    assert.equal(Array.isArray(args), true);
    assert.equal(options.shell, false);
    assert.equal(args[args.indexOf('-c:a') + 1], 'copy');
    assert.equal(args[args.indexOf('-i') + 1], 'pipe:0');
    assert.equal(args.includes('-n'), true);
    for (const forbidden of ['-ar', '-ac', '-af', '-filter:a', '-filter_complex', '-vol']) assert.equal(args.includes(forbidden), false);
    const child = new EventEmitter(); child.stderr = new PassThrough(); child.stdout = null;
    child.kill = () => { invocation.killed = true; queueMicrotask(() => child.emit('close', -1)); return true; };
    const input = [];
    child.stdin = new Writable({
      write(chunk, _encoding, callback) { input.push(Buffer.from(chunk)); callback(); },
      final(callback) {
        callback();
        if (hang) return;
        if (fail) { child.stderr.end('private-upstream-error-fixture'); queueMicrotask(() => child.emit('close', 1)); return; }
        const bytes = Buffer.concat(input);
        if (!keepBadByteRate) bytes.writeUInt32LE(48000, 28);
        if (corruptPcm) bytes[44] ^= 1;
        Promise.resolve(sourceMutation?.()).then(() => writeFile(args.at(-1), bytes, { flag: 'wx' })).then(
          () => { child.stderr.end(); child.emit('close', 0); },
          () => child.emit('close', 1),
        );
      },
    });
    markStarted();
    return child;
  });
  syncBuiltinESMExports();
  t.after(() => { t.mock.restoreAll(); syncBuiltinESMExports(); });
  return invocation;
}
async function noOutput(path) { await assert.rejects(lstat(path), error => error.code === 'ENOENT'); }

// Catches a re-encode, overwritten source, stale byteRate or an unbound manifest.
test('preparation remuxes six WAV headers with identical PCM and a valid technical v2 manifest', async t => {
  const f = await fixture(t); remuxDouble(t);
  await writeFile(join(f.sourceDirectory, 'unrelated-file.txt'), 'do not read or copy');
  await symlink(join(f.root, 'does-not-exist'), join(f.sourceDirectory, 'unrelated-link'));
  const result = await prepare(f.input);
  const saved = JSON.parse(await readFile(join(f.outputDirectory, 'audio-manifest.json'), 'utf8'));
  const manifest = validateInkAudioManifest(saved);
  assert.deepEqual(result.manifest, manifest);
  assert.equal(manifest.schemaVersion, 'ink-audio-preview/v2');
  assert.equal(manifest.rightsStatus, 'technical_preview_only');
  assert.equal(manifest.sourcePlanId, 'ink-garden-two-rows-v1');
  assert.equal(manifest.sourcePlanSha256, '309a08895704329e9db15782fe1fdf56a449421c21019bfaaa02c8344fdc6e6b');
  assert.deepEqual(await readdir(f.outputDirectory).then(names => names.sort()), ['audio-manifest.json', 'audio-preparation-receipt.json', ...cues.map(cue => `cue-${cue}.wav`)].sort());
  for (const [index, segment] of manifest.segments.entries()) {
    const bytes = await readFile(segment.path);
    assert.equal(segment.path, join(f.outputDirectory, `cue-${cues[index]}.wav`));
    assert.equal(segment.byteLength, bytes.length);
    assert.equal(segment.sha256, sha(bytes));
    assert.equal(segment.transcript, transcripts[index]);
    assert.equal(segment.transcriptSha256, sha(transcripts[index]));
    assert.equal(segment.style, style); assert.equal(segment.styleSha256, sha(style));
    assert.equal(segment.provider, 'Google AI Studio'); assert.equal(segment.modelId, 'gemini-3.8-flash-tts'); assert.equal(segment.voiceId, 'Charon');
    assert.equal(bytes.readUInt32LE(28), 48000);
    assert.deepEqual(bytes.subarray(44), f.originals[index].subarray(44));
    assert.deepEqual(await readFile(join(f.sourceDirectory, `cue-${cues[index]}-source.wav`)), f.originals[index]);
    const evidence = result.receipt.segments[index];
    assert.equal(evidence.source.pcmDataSha256, sha(f.originals[index].subarray(44)));
    assert.equal(evidence.derivative.pcmDataSha256, evidence.source.pcmDataSha256);
    assert.equal(evidence.source.sha256, sha(f.originals[index]));
    assert.equal(evidence.derivative.sha256, sha(bytes));
    assert.equal(evidence.source.byteRate, 96000); assert.equal(evidence.derivative.byteRate, 48000);
    assert.equal(evidence.durationSeconds, 0.5);
    assert.equal(evidence.pcmBytesUnchanged, true);
  }
  assert.deepEqual(JSON.parse(await readFile(join(f.outputDirectory, 'audio-preparation-receipt.json'), 'utf8')), result.receipt);
  assert.equal(result.receipt.publicationReady, false);
  assert.equal(result.receipt.expertReview, 'pending');
  assert.equal(result.receipt.speechContentStatus, 'not_listener_verified');
  assert.equal(result.receipt.identityStatus, 'provider_model_voice_declaration_not_attested');
  assert.equal(result.receipt.auditionStatus, 'not_performed');
  assert.equal(result.receipt.resampled, false); assert.equal(result.receipt.speedChanged, false); assert.equal(result.receipt.gainChanged, false);
});

test('already-correct 48000 byteRate sources are also preserved and prepared without changing PCM', async t => {
  const f = await fixture(t); remuxDouble(t);
  for (const [index, cue] of cues.entries()) await writeFile(join(f.sourceDirectory, `cue-${cue}-source.wav`), wav(index, 48000));
  const result = await prepare(f.input);
  assert.ok(result.receipt.segments.every(segment => segment.source.byteRate === 48000 && segment.pcmBytesUnchanged));
});

// Catches executing FFmpeg or making an output before a complete local six-cue set exists.
test('incomplete source sets reject before FFmpeg or output creation', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  await rm(join(f.sourceDirectory, 'cue-outro-source.wav'));
  await assert.rejects(prepare(f.input), /invalid_audio_source/);
  assert.equal(invocation.calls, 0); await noOutput(f.outputDirectory);
});

test('existing output directories and output symlinks are never reused or overwritten', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  await mkdir(f.outputDirectory); const keep = join(f.outputDirectory, 'keep.txt'); await writeFile(keep, 'user-owned');
  await assert.rejects(prepare(f.input), /output_directory_exists/);
  assert.equal(await readFile(keep, 'utf8'), 'user-owned');
  const link = join(f.root, 'output-link'); await symlink(f.outputDirectory, link);
  await assert.rejects(prepare({ ...f.input, outputDirectory: link }), /output_directory_exists/);
  assert.equal(invocation.calls, 0);
});

test('source directory and individual WAV symlinks are rejected before remux', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  const directoryLink = join(f.root, 'source-link'); await symlink(f.sourceDirectory, directoryLink);
  await assert.rejects(prepare({ ...f.input, sourceDirectory: directoryLink }), /invalid_audio_source/);
  await rm(join(f.sourceDirectory, 'cue-intro-source.wav')); await symlink(join(f.sourceDirectory, 'cue-step1-source.wav'), join(f.sourceDirectory, 'cue-intro-source.wav'));
  await assert.rejects(prepare(f.input), /invalid_audio_source/);
  assert.equal(invocation.calls, 0); await noOutput(f.outputDirectory);
});

test('symlink ancestors and dot segments cannot redirect audio reads or output writes', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  const link = join(f.root, 'linked-parent'); await symlink(f.root, link);
  const cases = [
    { sourceDirectory: join(link, 'source') },
    { outputDirectory: join(link, 'redirected-output') },
    { sourceDirectory: `${f.root}/./source` },
    { sourceDirectory: `${f.sourceDirectory}/../source` },
    { outputDirectory: `${f.root}/./redirected-output` },
    { outputDirectory: `${f.sourceDirectory}/../redirected-output` },
  ];
  for (const change of cases) await assert.rejects(prepare({ ...f.input, ...change }), /invalid_audio_source|invalid_audio_prepare_request/);
  assert.equal(invocation.calls, 0);
  await noOutput(f.outputDirectory); await noOutput(join(f.root, 'redirected-output'));
});

test('a directory masquerading as a cue WAV is rejected before remux', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  await rm(join(f.sourceDirectory, 'cue-intro-source.wav')); await mkdir(join(f.sourceDirectory, 'cue-intro-source.wav'));
  await assert.rejects(prepare(f.input), /invalid_audio_source/);
  assert.equal(invocation.calls, 0);
});

test('source WAVs above ten MiB and six-file totals above forty MiB fail before reading PCM', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  await writeFile(join(f.sourceDirectory, 'cue-intro-source.wav'), Buffer.alloc(10 * 1024 * 1024 + 1));
  await assert.rejects(prepare(f.input), /audio_source_budget_exceeded/);
  for (const cue of cues) await writeFile(join(f.sourceDirectory, `cue-${cue}-source.wav`), Buffer.alloc(7 * 1024 * 1024));
  await assert.rejects(prepare(f.input), /audio_source_budget_exceeded/);
  assert.equal(invocation.calls, 0); await noOutput(f.outputDirectory);
});

// Catches accepting other PCM formats, unexplained header faults, malformed chunks or truncation.
test('bounded RIFF validation rejects wrong format headers and malformed fmt/data chunks', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  const mutations = [
    bytes => { bytes.write('RIFX'); return bytes; },
    bytes => { bytes.write('NOPE', 8); return bytes; },
    bytes => { bytes.writeUInt32LE(1, 4); return bytes; },
    bytes => { bytes.writeUInt16LE(3, 20); return bytes; },
    bytes => { bytes.writeUInt16LE(2, 22); return bytes; },
    bytes => { bytes.writeUInt32LE(48000, 24); return bytes; },
    bytes => { bytes.writeUInt32LE(72000, 28); return bytes; },
    bytes => { bytes.writeUInt16LE(4, 32); return bytes; },
    bytes => { bytes.writeUInt16LE(24, 34); return bytes; },
    bytes => { bytes.write('junk', 36); return bytes; },
    bytes => { bytes.writeUInt32LE(0xffffffff, 40); return bytes; },
    bytes => bytes.subarray(0, bytes.length - 1),
    bytes => { bytes.writeUInt32LE(0, 40); return bytes; },
    bytes => { const duplicate = Buffer.concat([bytes, bytes.subarray(12, 36)]); duplicate.writeUInt32LE(duplicate.length - 8, 4); return duplicate; },
    bytes => { const duplicate = Buffer.concat([bytes, bytes.subarray(36)]); duplicate.writeUInt32LE(duplicate.length - 8, 4); return duplicate; },
  ];
  for (const mutate of mutations) {
    await writeFile(join(f.sourceDirectory, 'cue-intro-source.wav'), mutate(wav()));
    await assert.rejects(prepare(f.input), /unsupported_audio_source/);
  }
  assert.equal(invocation.calls, 0); await noOutput(f.outputDirectory);
});

test('metadata guards reject incomplete declarations unknown providers and hostile own records', async t => {
  const f = await fixture(t), invocation = remuxDouble(t);
  for (const change of [
    { sourceDirectory: 'relative' }, { outputDirectory: 'relative' }, { outputDirectory: '/tmp/new\nline' },
    { style: '' }, { style: 'x'.repeat(2001) }, { style: 'ı'.repeat(1001) }, { style: ' natural ' }, { style: 'line\nbreak' },
    { style: 'https://example.com/style' }, { style: 'api_key=fixture' },
    { provider: 'Other' }, { modelId: 'Other' }, { voiceId: 'Other' },
    { ffmpegPath: 'ffmpeg' }, { ffmpegPath: '/tmp/ffmpeg' }, { expertApproval: true },
  ]) await assert.rejects(prepare({ ...f.input, ...change }), /invalid_audio_prepare_request/);
  for (const key of Object.keys(f.input)) { const candidate = { ...f.input }; delete candidate[key]; await assert.rejects(prepare(candidate), /invalid_audio_prepare_request/); }
  let invoked = false; const accessor = { ...f.input };
  Object.defineProperty(accessor, 'style', { get() { invoked = true; return style; } });
  await assert.rejects(prepare(accessor), /invalid_audio_prepare_request/); assert.equal(invoked, false);
  const proxy = new Proxy(f.input, { ownKeys() { invoked = true; throw new Error('must not reflect'); } });
  await assert.rejects(prepare(proxy), /invalid_audio_prepare_request/); assert.equal(invoked, false);
  assert.equal(invocation.calls, 0); await noOutput(f.outputDirectory);
});

test('remux PCM changes and unrepaired headers cannot produce a successful manifest', async t => {
  const f = await fixture(t); remuxDouble(t, { corruptPcm: true });
  await assert.rejects(prepare(f.input), /pcm_integrity_mismatch/);
  await noOutput(join(f.outputDirectory, 'audio-manifest.json'));
  await noOutput(join(f.outputDirectory, 'audio-preparation-receipt.json'));
  assert.deepEqual(await readFile(join(f.sourceDirectory, 'cue-intro-source.wav')), f.originals[0]);
});

test('a derivative with the original incorrect byteRate is rejected', async t => {
  const f = await fixture(t); remuxDouble(t, { keepBadByteRate: true });
  await assert.rejects(prepare(f.input), /unsupported_audio_derivative/);
  await noOutput(join(f.outputDirectory, 'audio-manifest.json'));
});

test('changed source files during preparation cannot claim source immutability', async t => {
  const f = await fixture(t);
  remuxDouble(t, { sourceMutation: async () => { await writeFile(join(f.sourceDirectory, 'cue-intro-source.wav'), wav(3)); } });
  await assert.rejects(prepare(f.input), /audio_source_changed/);
  await noOutput(join(f.outputDirectory, 'audio-preparation-receipt.json'));
});

test('FFmpeg errors never reveal stderr or raw upstream errors', async t => {
  const f = await fixture(t); remuxDouble(t, { fail: true });
  await assert.rejects(prepare(f.input), error => error.message === 'audio_remux_failed' && !error.message.includes('private-upstream'));
  await noOutput(join(f.outputDirectory, 'audio-manifest.json'));
});

test('a blocked FFmpeg is killed and rejected at the thirty-second deadline', async t => {
  const f = await fixture(t); t.mock.timers.enable({ apis: ['setTimeout'] });
  const invocation = remuxDouble(t, { hang: true });
  const outcome = prepare(f.input);
  const rejected = assert.rejects(outcome, /audio_remux_failed/);
  await invocation.started;
  t.mock.timers.tick(30000);
  await rejected; assert.equal(invocation.killed, true);
  await noOutput(join(f.outputDirectory, 'audio-manifest.json'));
});

test('CLI rejects relative duplicate missing and unknown arguments with a fixed redacted error', () => {
  for (const args of [[], ['--source-dir', 'relative'], ['--out', '/tmp/a', '--out', '/tmp/b'], ['--source-dir', '/tmp/a', '--out', '/tmp/b'], ['--unknown', '/tmp/a'], ['--style-file'], ['--ffmpeg', '/tmp/ffmpeg']]) {
    const result = spawnSync(process.execPath, ['tools/prepare_ink_audio.mjs', ...args], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
    assert.equal(result.status, 1); assert.equal(result.stdout, ''); assert.equal(result.stderr, 'ink_audio_prepare_request_rejected\n');
  }
});

test('CLI rejects oversized symlink and malformed UTF-8 style files before preparing audio', async t => {
  const f = await fixture(t);
  for (const [name, content] of [['oversize.txt', Buffer.alloc(2001, 65)], ['invalid-utf8.txt', Buffer.from([0xc3, 0x28])], ['empty.txt', Buffer.alloc(0)]]) await writeFile(join(f.root, name), content);
  await symlink(join(f.root, 'oversize.txt'), join(f.root, 'style-link.txt'));
  for (const name of ['oversize.txt', 'invalid-utf8.txt', 'empty.txt', 'style-link.txt']) {
    const result = spawnSync(process.execPath, ['tools/prepare_ink_audio.mjs', '--source-dir', f.sourceDirectory, '--out', f.outputDirectory, '--style-file', join(f.root, name)], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
    assert.equal(result.status, 1); assert.equal(result.stdout, ''); assert.equal(result.stderr, 'ink_audio_prepare_request_rejected\n');
    await noOutput(f.outputDirectory);
  }
});

test('CLI rejects style symlink ancestors and dot segments before opening the style file', async t => {
  const f = await fixture(t), stylePath = join(f.root, 'style.txt'); await writeFile(stylePath, style);
  const link = join(f.root, 'style-parent'); await symlink(f.root, link);
  for (const rawPath of [join(link, 'style.txt'), `${f.root}/./style.txt`, `${f.sourceDirectory}/../style.txt`]) {
    const script = `
      import fs from 'node:fs/promises';
      import { syncBuiltinESMExports } from 'node:module';
      const originalOpen = fs.open; let styleOpened = false;
      fs.open = async (path, ...args) => { if (path === ${JSON.stringify(rawPath)}) styleOpened = true; return originalOpen(path, ...args); };
      syncBuiltinESMExports();
      process.argv = [process.execPath, 'tools/prepare_ink_audio.mjs', '--source-dir', ${JSON.stringify(join(f.root, 'missing-source'))}, '--out', ${JSON.stringify(f.outputDirectory)}, '--style-file', ${JSON.stringify(rawPath)}];
      await import('./tools/prepare_ink_audio.mjs');
      console.log(JSON.stringify({ styleOpened }));
    `;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
    assert.equal(result.status, 1); assert.equal(result.stderr, 'ink_audio_prepare_request_rejected\n');
    assert.equal(JSON.parse(result.stdout).styleOpened, false, 'unsafe style path was read before rejecting it');
  }
  await noOutput(f.outputDirectory);
});

// Catches allocating a raced style-file size before checking the 2,000-byte limit.
test('CLI refuses a style file that grows between lstat and open without allocating the larger size', async t => {
  const f = await fixture(t), stylePath = join(f.root, 'growing-style.txt'); await writeFile(stylePath, style);
  const script = `
    import fs from 'node:fs/promises';
    import { syncBuiltinESMExports } from 'node:module';
    const originalOpen = fs.open, originalAlloc = Buffer.alloc;
    let largest = 0;
    fs.open = async (path, ...args) => {
      if (path === ${JSON.stringify(stylePath)}) await fs.truncate(path, 16 * 1024 * 1024);
      return originalOpen(path, ...args);
    };
    Buffer.alloc = (size, ...args) => { largest = Math.max(largest, size); return originalAlloc(size, ...args); };
    syncBuiltinESMExports();
    process.argv = [process.execPath, 'tools/prepare_ink_audio.mjs', '--source-dir', ${JSON.stringify(f.sourceDirectory)}, '--out', ${JSON.stringify(f.outputDirectory)}, '--style-file', ${JSON.stringify(stylePath)}];
    await import('./tools/prepare_ink_audio.mjs');
    console.log(JSON.stringify({ largest }));
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.equal(result.status, 1); assert.equal(result.stderr, 'ink_audio_prepare_request_rejected\n');
  assert.ok(JSON.parse(result.stdout).largest <= 2001, 'style file allocation exceeded the bounded reader budget');
  await noOutput(f.outputDirectory);
});

test('optional real FFmpeg and CLI repair the known byteRate defect without changing hand-checked PCM', { skip: process.env.K12_INK_REAL_MEDIA_TEST !== '1' }, async t => {
  const f = await fixture(t);
  const result = await prepare(f.input);
  for (const [index, segment] of result.receipt.segments.entries()) {
    assert.equal(segment.source.pcmDataSha256, sha(f.originals[index].subarray(44)));
    assert.equal(segment.derivative.pcmDataSha256, segment.source.pcmDataSha256);
    assert.equal(segment.derivative.byteRate, 48000);
  }
  const stylePath = join(f.root, 'style.txt'); await writeFile(stylePath, style + '\n');
  const cliOut = join(f.root, 'cli-prepared');
  const cli = spawnSync(process.execPath, ['tools/prepare_ink_audio.mjs', '--source-dir', f.sourceDirectory, '--out', cliOut, '--style-file', stylePath], { cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 30000 });
  assert.equal(cli.status, 0, cli.stderr); assert.equal(cli.stderr, '');
  const message = JSON.parse(cli.stdout);
  assert.equal(message.preparedCues, 6); assert.equal(message.publicationReady, false);
  assert.equal(Object.hasOwn(message, 'style'), false); assert.equal(Object.hasOwn(message, 'transcript'), false);
  const saved = JSON.parse(await readFile(join(cliOut, 'audio-manifest.json'), 'utf8'));
  assert.equal(validateInkAudioManifest(saved).segments.length, 6);
});
