import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { access, constants, lstat, mkdir, open, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, join, parse, sep } from 'node:path';
import { isProxy } from 'node:util/types';
import { createInkPlan } from './ink_timeline.mjs';
import { validateInkAudioManifest } from './ink_video_renderer.mjs';

const CUES = ['intro', 'step1', 'step2', 'step3', 'step4', 'outro'];
const INPUT_KEYS = ['sourceDirectory', 'outputDirectory', 'style', 'provider', 'modelId', 'voiceId', 'ffmpegPath'];
const FILE_LIMIT = 10 * 1024 * 1024, TOTAL_LIMIT = 40 * 1024 * 1024;
const TRUSTED_FFMPEG = '/opt/homebrew/bin/ffmpeg';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const safePath = path => typeof path === 'string' && path.length <= 4096 && isAbsolute(path) && !/[\0\r\n]/.test(path);
const ERRORS = new Set(['invalid_audio_prepare_request', 'output_directory_exists', 'invalid_audio_source', 'audio_source_budget_exceeded', 'unsupported_audio_source', 'unsupported_audio_derivative', 'audio_source_changed', 'trusted_ffmpeg_unavailable', 'audio_remux_failed', 'pcm_integrity_mismatch', 'invalid_audio_manifest']);

// Validate raw segments before join() can normalize away '.' or '..'. The
// executable has its separate Homebrew trust policy; this guard is for data.
export async function assertLocalAudioDataPath(path, leaf) {
  if (!safePath(path) || !['file', 'directory', 'fresh'].includes(leaf)) throw new Error('invalid_audio_prepare_request');
  const parts = path.slice(parse(path).root.length).split(sep).filter(Boolean);
  if (!parts.length || parts.some(part => part === '.' || part === '..')) throw new Error('invalid_audio_prepare_request');
  let current = parse(path).root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part); const last = index === parts.length - 1;
    let info;
    try { info = await lstat(current); } catch (error) {
      if (error.code === 'ENOENT' && last && leaf === 'fresh') return;
      throw new Error('invalid_audio_prepare_request');
    }
    if (info.isSymbolicLink() || (last && leaf === 'fresh')) throw new Error('invalid_audio_prepare_request');
    if (last && leaf === 'file' ? !info.isFile() : !info.isDirectory()) throw new Error('invalid_audio_prepare_request');
  }
}

function ownInput(value) {
  if (!value || typeof value !== 'object' || isProxy(value) || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('invalid_audio_prepare_request');
  const keys = Reflect.ownKeys(value), descriptors = Object.getOwnPropertyDescriptors(value);
  if (keys.length !== INPUT_KEYS.length || INPUT_KEYS.some(key => !Object.hasOwn(descriptors, key) || !Object.hasOwn(descriptors[key], 'value'))) throw new Error('invalid_audio_prepare_request');
  const input = Object.fromEntries(INPUT_KEYS.map(key => [key, descriptors[key].value]));
  if (!safePath(input.sourceDirectory) || !safePath(input.outputDirectory) || input.provider !== 'Google AI Studio' || input.modelId !== 'gemini-3.8-flash-tts' || input.voiceId !== 'Charon' || input.ffmpegPath !== TRUSTED_FFMPEG) throw new Error('invalid_audio_prepare_request');
  return input;
}

function manifestFrom(input, plan, files) {
  return {
    schemaVersion: 'ink-audio-preview/v2', rightsStatus: 'technical_preview_only',
    sourcePlanId: plan.id, sourcePlanSha256: sha(JSON.stringify(plan)),
    segments: CUES.map((cueId, index) => {
      const transcript = plan.segments[index].narration;
      return {
        cueId, path: join(input.outputDirectory, `cue-${cueId}.wav`), byteLength: files[index].byteLength, sha256: files[index].sha256,
        transcript, transcriptSha256: sha(transcript), style: input.style, styleSha256: typeof input.style === 'string' ? sha(input.style) : '',
        provider: input.provider, modelId: input.modelId, voiceId: input.voiceId,
      };
    }),
  };
}

async function sourceStat(path) {
  let info; try { info = await lstat(path); } catch { throw new Error('invalid_audio_source'); }
  if (!info.isFile() || info.isSymbolicLink() || info.size < 1) throw new Error('invalid_audio_source');
  if (info.size > FILE_LIMIT) throw new Error('audio_source_budget_exceeded');
  return info;
}

function sameFile(a, b) {
  return a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs;
}

async function boundedFile(path, expected, errorCode) {
  let handle;
  try {
    const before = await lstat(path);
    if (!before.isFile() || before.isSymbolicLink() || before.size < 1 || before.size > FILE_LIMIT || (expected && !sameFile(before, expected))) throw new Error();
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const start = await handle.stat();
    if (!sameFile(before, start)) throw new Error();
    const buffer = Buffer.alloc(start.size + 1); let at = 0;
    while (at < buffer.length) {
      const { bytesRead } = await handle.read(buffer, at, buffer.length - at, at);
      if (!bytesRead) break;
      at += bytesRead;
    }
    const after = await handle.stat();
    if (at !== start.size || !sameFile(start, after)) throw new Error();
    return buffer.subarray(0, at);
  } catch { throw new Error(errorCode); }
  finally { if (handle) await handle.close(); }
}

// Only RIFF PCM mono / 24 kHz / signed 16-bit is accepted. The sole tolerated
// source-header defect is Google's observed 96,000 byteRate with blockAlign 2.
function inspectWav(bytes, derivative = false) {
  const errorCode = derivative ? 'unsupported_audio_derivative' : 'unsupported_audio_source';
  try {
    if (bytes.length < 44 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE' || bytes.readUInt32LE(4) !== bytes.length - 8) throw new Error();
    let at = 12, count = 0, format = null, pcm = null;
    while (at < bytes.length) {
      if (++count > 64 || at + 8 > bytes.length) throw new Error();
      const id = bytes.toString('ascii', at, at + 4), length = bytes.readUInt32LE(at + 4), start = at + 8, end = start + length;
      if (end > bytes.length || end + length % 2 > bytes.length) throw new Error();
      if (id === 'fmt ') {
        if (format || length !== 16 || pcm) throw new Error();
        format = { encoding: bytes.readUInt16LE(start), channels: bytes.readUInt16LE(start + 2), sampleRateHz: bytes.readUInt32LE(start + 4), byteRate: bytes.readUInt32LE(start + 8), blockAlign: bytes.readUInt16LE(start + 12), bitsPerSample: bytes.readUInt16LE(start + 14) };
        if (format.encoding !== 1 || format.channels !== 1 || format.sampleRateHz !== 24000 || format.blockAlign !== 2 || format.bitsPerSample !== 16 || !(derivative ? [48000] : [48000, 96000]).includes(format.byteRate)) throw new Error();
      } else if (id === 'data') {
        if (!format || pcm || length < 12000 || length > 120 * 48000 || length % 2 !== 0) throw new Error();
        pcm = bytes.subarray(start, end);
      }
      at = end + length % 2;
    }
    if (at !== bytes.length || !format || !pcm) throw new Error();
    return { ...format, durationSeconds: pcm.length / 48000, pcmDataByteLength: pcm.length, pcmDataSha256: sha(pcm) };
  } catch { throw new Error(errorCode); }
}

async function requireTrustedFfmpeg(path) {
  try {
    const resolved = await realpath(path), info = await lstat(resolved);
    if (!info.isFile() || info.isSymbolicLink()) throw new Error();
    await access(resolved, constants.X_OK);
  } catch { throw new Error('trusted_ffmpeg_unavailable'); }
}

function remux(bytes, outputPath, ffmpegPath) {
  const args = ['-nostdin', '-hide_banner', '-loglevel', 'error', '-n', '-protocol_whitelist', 'pipe', '-f', 'wav', '-i', 'pipe:0', '-map', '0:a:0', '-c:a', 'copy', '-map_metadata', '-1', '-fs', String(FILE_LIMIT), '-f', 'wav', outputPath];
  return new Promise((resolve, reject) => {
    let child, finished = false, timer;
    const finish = success => {
      if (finished) return;
      finished = true; clearTimeout(timer);
      if (success) resolve(); else reject(new Error('audio_remux_failed'));
    };
    try {
      child = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'], shell: false });
      child.stderr.resume();
      child.once('error', () => finish(false));
      child.once('close', code => finish(code === 0));
      child.stdin.on('error', () => { child.kill('SIGKILL'); finish(false); });
      timer = setTimeout(() => { child.kill('SIGKILL'); finish(false); }, 30000);
      child.stdin.end(bytes);
    } catch { if (child) child.kill('SIGKILL'); finish(false); }
  });
}

async function prepare(inputValue) {
  const input = ownInput(inputValue), plan = createInkPlan();
  // Preflight only the declaration schema; no placeholder manifest is saved.
  try { validateInkAudioManifest(manifestFrom(input, plan, CUES.map(() => ({ byteLength: 1, sha256: sha('') })))); }
  catch { throw new Error('invalid_audio_prepare_request'); }
  try { await lstat(input.outputDirectory); throw new Error('output_directory_exists'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await assertLocalAudioDataPath(input.outputDirectory, 'fresh');
  try { await assertLocalAudioDataPath(input.sourceDirectory, 'directory'); }
  catch { throw new Error('invalid_audio_source'); }
  let sourceDirectoryInfo;
  try { sourceDirectoryInfo = await lstat(input.sourceDirectory); } catch { throw new Error('invalid_audio_source'); }
  if (!sourceDirectoryInfo.isDirectory() || sourceDirectoryInfo.isSymbolicLink()) throw new Error('invalid_audio_source');
  // Enumerate only six fixed names; unrelated files are never listed or read.
  const sources = [];
  for (const cueId of CUES) {
    const path = join(input.sourceDirectory, `cue-${cueId}-source.wav`), info = await sourceStat(path);
    sources.push({ cueId, path, info });
  }
  if (sources.reduce((sum, source) => sum + source.info.size, 0) > TOTAL_LIMIT) throw new Error('audio_source_budget_exceeded');
  for (const source of sources) {
    source.bytes = await boundedFile(source.path, source.info, 'audio_source_changed');
    source.wav = inspectWav(source.bytes);
    source.sha256 = sha(source.bytes);
  }
  await requireTrustedFfmpeg(input.ffmpegPath);
  try { await mkdir(input.outputDirectory, { mode: 0o700 }); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('output_directory_exists'); throw error; }
  const files = [], evidence = [];
  for (const source of sources) {
    const fileName = `cue-${source.cueId}.wav`, path = join(input.outputDirectory, fileName);
    await remux(source.bytes, path, input.ffmpegPath);
    const bytes = await boundedFile(path, null, 'unsupported_audio_derivative'), wav = inspectWav(bytes, true);
    if (wav.pcmDataByteLength !== source.wav.pcmDataByteLength || wav.pcmDataSha256 !== source.wav.pcmDataSha256) throw new Error('pcm_integrity_mismatch');
    const derivedHash = sha(bytes);
    files.push({ byteLength: bytes.length, sha256: derivedHash });
    evidence.push({
      cueId: source.cueId, durationSeconds: wav.durationSeconds, pcmBytesUnchanged: true,
      source: { fileName: `cue-${source.cueId}-source.wav`, byteLength: source.bytes.length, sha256: source.sha256, byteRate: source.wav.byteRate, pcmDataByteLength: source.wav.pcmDataByteLength, pcmDataSha256: source.wav.pcmDataSha256 },
      derivative: { fileName, byteLength: bytes.length, sha256: derivedHash, byteRate: wav.byteRate, pcmDataByteLength: wav.pcmDataByteLength, pcmDataSha256: wav.pcmDataSha256 },
    });
  }
  const afterDirectory = await lstat(input.sourceDirectory);
  if (!afterDirectory.isDirectory() || afterDirectory.isSymbolicLink() || afterDirectory.ino !== sourceDirectoryInfo.ino || afterDirectory.dev !== sourceDirectoryInfo.dev) throw new Error('audio_source_changed');
  for (const source of sources) {
    const after = await boundedFile(source.path, source.info, 'audio_source_changed');
    if (sha(after) !== source.sha256) throw new Error('audio_source_changed');
  }
  const manifest = validateInkAudioManifest(manifestFrom(input, plan, files));
  const receipt = {
    schemaVersion: 'ink-audio-preparation-receipt/v1', state: 'technical_audio_prepared', rightsStatus: 'technical_preview_only',
    sourcePlanId: manifest.sourcePlanId, sourcePlanSha256: manifest.sourcePlanSha256,
    method: 'ffmpeg_wav_remux_pcm_stream_copy', sourceImmutabilityStatus: 'verified_unchanged_at_preparation',
    sampleRateHz: 24000, channels: 1, bitsPerSample: 16, resampled: false, speedChanged: false, gainChanged: false,
    segments: evidence, speechContentStatus: 'not_listener_verified', identityStatus: 'provider_model_voice_declaration_not_attested',
    auditionStatus: 'not_performed', expertReview: 'pending', curriculumStatus: 'unmapped_draft', publicationReady: false,
  };
  await writeFile(join(input.outputDirectory, 'audio-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  await writeFile(join(input.outputDirectory, 'audio-preparation-receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return { manifest, receipt };
}

/** Local container preparation only; provider/model/voice and spoken words remain declarations. */
export async function prepareInkAudio(input) {
  try { return await prepare(input); }
  catch (error) { throw new Error(ERRORS.has(error?.message) ? error.message : 'audio_preparation_failed'); }
}
