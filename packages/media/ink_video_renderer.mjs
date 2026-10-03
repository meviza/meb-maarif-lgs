import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { lstat, mkdir, open, writeFile, stat, constants } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { isProxy } from 'node:util/types';
import { createInkPlan, renderInkFrameSvg } from './ink_timeline.mjs';
import { resolveRectangleVideoRuntime } from './rectangle_video_pilot.mjs';

const CUES = ['intro', 'step1', 'step2', 'step3', 'step4', 'outro'];
const TOTAL_LIMIT = 64 * 1024 * 1024;
const AUDIO_FILE_LIMIT = 10 * 1024 * 1024;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function ownRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('invalid_audio_manifest');
  const descriptors = Object.getOwnPropertyDescriptors(value), ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== keys.length || keys.some(key => !Object.hasOwn(descriptors, key) || !Object.hasOwn(descriptors[key], 'value'))) throw new Error('invalid_audio_manifest');
  return Object.fromEntries(keys.map(key => [key, descriptors[key].value]));
}
function ownAudioSegments(value) {
  if (!Array.isArray(value) || isProxy(value) || Object.getPrototypeOf(value) !== Array.prototype) throw new Error('invalid_audio_manifest');
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(value).length !== 7 || descriptors.length?.value !== 6) throw new Error('invalid_audio_manifest');
  return CUES.map((_, index) => {
    const descriptor = descriptors[String(index)];
    if (!Object.hasOwn(descriptors, String(index)) || !Object.hasOwn(descriptor, 'value')) throw new Error('invalid_audio_manifest');
    return ownRecord(descriptor.value, ['cueId', 'path', 'byteLength', 'sha256']);
  });
}
export function validateInkAudioManifest(manifest) {
  try {
    const data = ownRecord(manifest, ['schemaVersion', 'rightsStatus', 'segments']);
    if (data.schemaVersion !== 'ink-audio-preview/v1' || data.rightsStatus !== 'technical_preview_only') throw new Error();
    const supplied = ownAudioSegments(data.segments);
    const segments = CUES.map(cueId => {
      const matches = supplied.filter(value => value.cueId === cueId);
      if (matches.length !== 1) throw new Error();
      const s = matches[0];
      if (typeof s.path !== 'string' || !isAbsolute(s.path) || s.path.length > 4096 || /[\0\r\n]/.test(s.path) || !s.path.endsWith('.wav') || !Number.isSafeInteger(s.byteLength) || s.byteLength < 1 || s.byteLength > AUDIO_FILE_LIMIT || typeof s.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(s.sha256)) throw new Error();
      return Object.freeze({ ...s });
    });
    if (segments.reduce((sum, s) => sum + s.byteLength, 0) > 40 * 1024 * 1024) throw new Error();
    return Object.freeze({ schemaVersion: data.schemaVersion, rightsStatus: data.rightsStatus, segments: Object.freeze(segments) });
  } catch { throw new Error('invalid_audio_manifest'); }
}
export function createInkRenderBudget(durationSeconds) {
  if (typeof durationSeconds !== 'number' || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 180) throw new Error('invalid_render_duration');
  return Object.freeze({ fps: 24, frameCount: Math.ceil(durationSeconds * 24), width: 1280, height: 720, maximumTotalBytes: TOTAL_LIMIT });
}
const stamp = seconds => {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};
export function inkSegmentsToVtt(segments) {
  if (!Array.isArray(segments) || !segments.length || segments.length > 6 || segments.some(s => !s || !Number.isFinite(s.startSeconds) || s.startSeconds < 0 || !Number.isFinite(s.durationSeconds) || s.durationSeconds <= 0 || typeof s.narration !== 'string' || s.narration.length > 2000)) throw new Error('invalid_caption_segments');
  return 'WEBVTT\n\n' + segments.map((s, i) => `${i + 1}\n${stamp(s.startSeconds)} --> ${stamp(s.startSeconds + s.durationSeconds)}\n${s.narration.replaceAll('-->', '→')}\n`).join('\n');
}
async function boundedBytes(path, expectedSize, limit) {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size < 1 || before.size > limit || (expectedSize !== null && before.size !== expectedSize)) throw new Error('invalid_local_artifact');
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const start = await handle.stat();
    if (start.ino !== before.ino || start.size !== before.size) throw new Error('unstable_local_artifact');
    const buffer = Buffer.alloc(start.size + 1); let at = 0;
    while (at < buffer.length) { const { bytesRead } = await handle.read(buffer, at, buffer.length - at, at); if (!bytesRead) break; at += bytesRead; }
    const after = await handle.stat();
    if (at !== start.size || after.size !== start.size || after.mtimeMs !== start.mtimeMs || after.ctimeMs !== start.ctimeMs) throw new Error('unstable_local_artifact');
    return buffer.subarray(0, at);
  } finally { await handle.close(); }
}
async function probe(binary, path) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,pix_fmt,width,height,r_frame_rate,channels,sample_rate', '-of', 'json', path], { stdio: ['ignore', 'pipe', 'pipe'] });
    let data = '', invalid = false;
    const timer = setTimeout(() => { invalid = true; child.kill('SIGKILL'); }, 30000);
    child.stdout.on('data', chunk => { data += chunk; if (data.length > 65536) { invalid = true; child.kill('SIGKILL'); } });
    child.stderr.resume();
    child.once('error', () => { clearTimeout(timer); reject(new Error('probe_unavailable')); });
    child.once('close', code => { clearTimeout(timer); if (code !== 0 || invalid) return reject(new Error('probe_failed')); try { resolve(JSON.parse(data)); } catch { reject(new Error('probe_failed')); } });
  });
}

// Bound asynchronous raster/encoder waits too, not only the child process.
function whileEncoding(operation, signal) {
  if (signal.aborted) return Promise.reject(new Error('ink_encode_failed'));
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', aborted);
    const aborted = () => { cleanup(); reject(new Error('ink_encode_failed')); };
    signal.addEventListener('abort', aborted, { once: true });
    Promise.resolve(operation).then(
      value => { cleanup(); resolve(value); },
      error => { cleanup(); reject(error); },
    );
  });
}

// No inference/network or live student API. A verified WAV is still not a voice-rights approval.
export async function renderInkVideo({ outputDirectory, runtime = {}, audioManifest = null }) {
  if (typeof outputDirectory !== 'string' || !isAbsolute(outputDirectory) || /[\0\r\n]/.test(outputDirectory)) throw new Error('absolute_fresh_output_required');
  try { await stat(outputDirectory); throw new Error('output_directory_exists'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const checkedAudio = audioManifest === null ? null : validateInkAudioManifest(audioManifest);
  const config = resolveRectangleVideoRuntime(runtime);
  const require = createRequire(config.sharpPackage ?? import.meta.url);
  let sharp; try { sharp = require('sharp'); } catch { throw new Error('sharp_runtime_unavailable'); }
  sharp.concurrency(1); sharp.cache({ memory: 8, files: 0, items: 4 });
  // Exclusive mkdir fails rather than overwriting an output created concurrently.
  await mkdir(outputDirectory);
  let writtenBytes = 0;
  async function sidecar(name, bytes) {
    writtenBytes += Buffer.byteLength(bytes);
    if (writtenBytes > TOTAL_LIMIT - 1024 * 1024) throw new Error('artifact_budget_exceeded');
    await writeFile(join(outputDirectory, name), bytes, { flag: 'wx' });
  }
  const audioPaths = [], audioEvidence = [], measured = {};
  for (const s of checkedAudio?.segments ?? []) {
    const bytes = await boundedBytes(s.path, s.byteLength, AUDIO_FILE_LIMIT);
    if (sha(bytes) !== s.sha256) throw new Error('audio_integrity_mismatch');
    const name = `voice-${s.cueId}.wav`, path = join(outputDirectory, name);
    await sidecar(name, bytes); audioPaths.push(path);
    const info = await probe(config.ffprobePath, path), duration = Number(info.format?.duration);
    if (info.streams?.length !== 1 || info.streams[0].codec_type !== 'audio' || !info.streams[0].codec_name?.startsWith('pcm_') || info.streams[0].channels !== 1 || info.streams[0].sample_rate !== '24000' || !Number.isFinite(duration) || duration < 0.25 || duration > 120) throw new Error('unsupported_audio_artifact');
    measured[s.cueId] = duration;
    audioEvidence.push({ cueId: s.cueId, fileName: name, byteLength: bytes.length, sha256: s.sha256, measuredSeconds: duration, channels: info.streams[0].channels, sampleRateHz: Number(info.streams[0].sample_rate), codec: info.streams[0].codec_name });
  }
  const plan = createInkPlan(checkedAudio ? { segmentDurations: measured } : {});
  const budget = createInkRenderBudget(plan.durationSeconds);
  await sidecar('plan.json', JSON.stringify(plan, null, 2) + '\n');
  await sidecar('captions.vtt', inkSegmentsToVtt(plan.segments));
  const maximumVideoBytes = TOTAL_LIMIT - writtenBytes - 65536;
  const videoPath = join(outputDirectory, 'solution.mp4');
  const args = ['-nostdin', '-hide_banner', '-loglevel', 'error', '-n', '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', '1280x720', '-framerate', '24', '-i', 'pipe:0'];
  for (const path of audioPaths) args.push('-i', path);
  if (audioPaths.length) {
    const filters = plan.segments.map((s, i) => `[${i + 1}:a]aresample=24000,apad,atrim=duration=${s.durationSeconds},asetpts=PTS-STARTPTS[a${i}]`).join(';');
    args.push('-filter_complex', `${filters};${plan.segments.map((_, i) => `[a${i}]`).join('')}concat=n=6:v=0:a=1[voice]`, '-map', '0:v:0', '-map', '[voice]', '-c:a', 'aac', '-b:a', '96k');
  } else args.push('-an');
  args.push('-t', String(plan.durationSeconds), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-threads', '2', '-filter_threads', '1', '-filter_complex_threads', '1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-fs', String(maximumVideoBytes), videoPath);
  const child = spawn(config.ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let failed = false;
  const controller = new AbortController(), stopEncoding = () => { failed = true; controller.abort(); };
  child.stderr.resume(); child.stdin.on('error', stopEncoding);
  const inputClosed = () => { if (!child.stdin.writableEnded) stopEncoding(); };
  child.stdin.on('close', inputClosed);
  const completed = new Promise(resolve => {
    child.once('error', () => { stopEncoding(); resolve(-1); });
    child.once('close', code => { if (code !== 0 || !child.stdin.writableEnded) stopEncoding(); resolve(code); });
  });
  const timer = setTimeout(() => { stopEncoding(); child.kill('SIGKILL'); child.stdin.destroy(); }, 180000);
  try {
    for (let frame = 0; frame < budget.frameCount; frame++) {
      if (failed || child.exitCode !== null) throw new Error('ink_encode_failed');
      const svg = renderInkFrameSvg(plan, frame / budget.fps);
      const bytes = await whileEncoding(sharp(Buffer.from(svg), { limitInputPixels: 1280 * 720 }).removeAlpha().raw().toBuffer(), controller.signal);
      if (bytes.length !== 1280 * 720 * 3) throw new Error('invalid_raster_contract');
      if (!child.stdin.write(bytes)) await once(child.stdin, 'drain', { signal: controller.signal });
    }
    child.stdin.end();
    if (await whileEncoding(completed, controller.signal) !== 0 || failed) throw new Error('ink_encode_failed');
  } catch { stopEncoding(); child.kill('SIGKILL'); child.stdin.destroy(); child.stderr.destroy(); throw new Error('ink_encode_failed'); }
  finally {
    clearTimeout(timer); child.stdin.off('close', inputClosed);
    // Keep an error sink until asynchronous destroy/close has completed.
    if (child.stdin.closed) child.stdin.off('error', stopEncoding);
    else child.stdin.once('close', () => child.stdin.off('error', stopEncoding));
  }
  const info = await probe(config.ffprobePath, videoPath), duration = Number(info.format?.duration);
  const videos = info.streams?.filter(s => s.codec_type === 'video') ?? [], audios = info.streams?.filter(s => s.codec_type === 'audio') ?? [];
  if (videos.length !== 1 || videos[0].codec_name !== 'h264' || videos[0].pix_fmt !== 'yuv420p' || videos[0].width !== 1280 || videos[0].height !== 720 || videos[0].r_frame_rate !== '24/1' || audios.length !== (checkedAudio ? 1 : 0) || (checkedAudio && audios[0].codec_name !== 'aac') || !Number.isFinite(duration) || Math.abs(duration - plan.durationSeconds) > 0.15) throw new Error('ink_output_contract_failed');
  const video = await boundedBytes(videoPath, null, maximumVideoBytes);
  const receipt = { state: 'motion_draft_rendered', planId: plan.id, planSha256: sha(JSON.stringify(plan)), video: { fileName: 'solution.mp4', byteLength: video.length, sha256: sha(video), codec: 'h264', width: 1280, height: 720, fps: 24, durationSeconds: duration, frameCount: budget.frameCount, audio: !!checkedAudio }, audioEvidence, voiceStatus: checkedAudio ? 'muxed_audio_preview_unreviewed' : 'not_rendered_silent_motion_preview', alignmentStatus: checkedAudio ? 'measured_sentence_segments_not_word_alignment' : 'not_tested_no_audio', narrationQuality: 'not_listener_approved', expertReview: 'pending', curriculumStatus: 'unmapped_draft', publicationReady: false, encodingThreads: 2, maximumTotalBytes: TOTAL_LIMIT };
  const receiptText = JSON.stringify(receipt, null, 2) + '\n';
  if (writtenBytes + video.length + Buffer.byteLength(receiptText) > TOTAL_LIMIT) throw new Error('artifact_budget_exceeded');
  await writeFile(join(outputDirectory, 'receipt.json'), receiptText, { flag: 'wx' });
  return receipt;
}
