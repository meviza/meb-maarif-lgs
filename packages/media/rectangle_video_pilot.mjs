import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, stat, open } from 'node:fs/promises';
import { isAbsolute, join, basename, dirname } from 'node:path';
import { validateQuestion } from '../content-factory/pilot.mjs';

const plans = new WeakSet();
const MAX_OUTPUT = 30 * 1024 * 1024;
const RECEIPT_RESERVED_BYTES = 64 * 1024;
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const escapeVideoXml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
function freeze(value) { if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); } return value; }

export function createRectangleVideoPlan(question) {
  let review;
  try { review = validateQuestion(question); } catch { throw new Error('unverified_question'); }
  if (!review || review.localMathChecks !== 'passed' || review.errors.length) throw new Error('unverified_question');
  if (!['perimeter', 'area'].includes(question.problem.template)) throw new Error('supported_rectangle_template_required');
  if (question.problem.width === question.problem.height) throw new Error('non_square_rectangle_required');
  const { width, height, template } = question.problem;
  const graph = structuredClone(question.solutionGraph);
  const roles = ['question', 'geometry', 'solution', 'result', 'pause'];
  const durations = [6, 7, 9, 6, 7];
  const captions = [question.prompt, `Dikdörtgenin karşılıklı kenarları eşittir. Kenarlar ${width} cm ve ${height} cm.`, graph.map(step => step.narration).join(' '), `${template === 'area' ? 'Alan' : 'Çevre'}: ${question.options[question.answerIndex]} ${question.answerUnit}.`, 'Videoyu durdur. Çözümün neden doğru olduğunu kendi cümlenle açıkla.'];
  let startSeconds = 0;
  const scenes = roles.map((role, index) => { const scene = { role, startSeconds, durationSeconds: durations[index], caption: captions[index] }; startSeconds += durations[index]; return scene; });
  const plan = {
    schemaVersion: 'rectangle-video-pilot/v1', state: 'draft', questionId: question.id, sourceContentSha256: question.contentSha256,
    problem: { width, height, template }, question: question.prompt, solutionGraph: graph,
    answer: question.options[question.answerIndex], answerUnit: question.answerUnit,
    width: 1280, height: 720, fps: 24, durationSeconds: startSeconds, scenes,
    audio: false, voiceStatus: 'not_rendered_silent_pilot', expertReview: 'pending', publicationReady: false,
    curriculumStatus: 'unresolved_not_approved', maxOutputBytes: MAX_OUTPUT,
  };
  plan.planSha256 = hash(plan);
  freeze(plan); plans.add(plan); return plan;
}

function validPlan(plan) { if (!plan || !plans.has(plan)) throw new Error('invalid_video_plan'); }
// Deployment configuration only: never derived from question content or browser input.
export function resolveRectangleVideoRuntime(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).some(key => !['sharpPackage', 'ffmpegPath', 'ffprobePath'].includes(key))) throw new Error('invalid_trusted_runtime');
  for (const [key, path] of Object.entries(options)) {
    if (typeof path !== 'string' || path.length > 4096 || !isAbsolute(path) || path.includes('\0')) throw new Error('invalid_trusted_runtime');
    if (key === 'sharpPackage' ? basename(path) !== 'package.json' || basename(dirname(path)) !== 'sharp' : basename(path) !== (key === 'ffmpegPath' ? 'ffmpeg' : 'ffprobe')) throw new Error('invalid_trusted_runtime');
  }
  return Object.freeze({ sharpPackage: options.sharpPackage ?? null, ffmpegPath: options.ffmpegPath ?? 'ffmpeg', ffprobePath: options.ffprobePath ?? 'ffprobe' });
}
export function createRectangleVideoOutputBudget(sidecarByteLength) {
  if (!Number.isSafeInteger(sidecarByteLength) || sidecarByteLength < 0) throw new Error('invalid_artifact_byte_length');
  const maximumVideoByteLength = MAX_OUTPUT - sidecarByteLength - RECEIPT_RESERVED_BYTES;
  if (maximumVideoByteLength <= 0) throw new Error('total_output_byte_limit');
  return Object.freeze({ maximumTotalByteLength: MAX_OUTPUT, sidecarByteLength, receiptReservedByteLength: RECEIPT_RESERVED_BYTES, maximumVideoByteLength });
}
function lines(text, max = 46) {
  const result = []; let line = '';
  for (const word of text.split(' ')) { if ((line + ' ' + word).trim().length > max && line) { result.push(line); line = word; } else line = (line + ' ' + word).trim(); }
  if (line) result.push(line); return result;
}
const textRows = (text, x, y, size = 26, max = 46, color = '#2c514a') => lines(text, max).slice(0, 4).map((line, index) => `<text x="${x}" y="${y + index * (size + 13)}" font-size="${size}" fill="${color}">${escapeVideoXml(line)}</text>`).join('');

export function renderRectangleSceneSvg(plan, index) {
  validPlan(plan);
  if (!Number.isInteger(index) || index < 0 || index >= plan.scenes.length) throw new Error('invalid_scene_index');
  const { template, width: w, height: h } = plan.problem;
  const role = plan.scenes[index].role;
  const headings = { question: 'Soruyu birlikte okuyalım.', geometry: 'Önce şekli anlayalım.', solution: 'İki adımda çözelim.', result: 'Sonucu kontrol edelim.', pause: 'Bir düşünme molası.' };
  let body = '';
  if (role === 'question') body = textRows(plan.question, 70, 290, 30, 38) + textRows('Hangi bilgi veriliyor? Senden ne isteniyor?', 70, 510, 22, 42, '#74857b');
  if (role === 'geometry') body = textRows('Karşılıklı kenarlar eşittir.', 70, 285, 31, 36) + textRows(template === 'area' ? 'Alan, içerideki birim karelerin sayısıdır.' : 'Çevre, sınırdaki bütün kenarların toplamıdır.', 70, 400, 27, 38) + textRows('Şekil ölçekli değildir.', 70, 535, 20, 40, '#74857b');
  if (role === 'solution') body = plan.solutionGraph.map((step, stepIndex) => {
    const displayLabel = template === 'area' && stepIndex === 0
      ? `Bir sırada: ${step.value} birim kare`
      : `${step.expression} = ${step.value}`;
    return `<circle cx="88" cy="${279 + stepIndex * 142}" r="18" fill="#e6b96d"/><text x="88" y="${285 + stepIndex * 142}" font-size="17" text-anchor="middle">${stepIndex + 1}</text><text x="124" y="${291 + stepIndex * 142}" font-size="39" font-weight="600">${escapeVideoXml(displayLabel)}</text>${textRows(step.narration, 72, 336 + stepIndex * 142, 20, 49, '#688078')}`;
  }).join('');
  if (role === 'result') body = `<text x="70" y="309" font-size="82" font-weight="600" fill="#245d50">${plan.answer} ${escapeVideoXml(plan.answerUnit)}</text>${textRows(template === 'area' ? `${w} sütun × ${h} sıra = ${plan.answer} birim kare.` : `${w} + ${h} + ${w} + ${h} = ${plan.answer} cm`, 70, 410, 29, 35)}${textRows('Sonuç, soruda istenen büyüklüğü ve birimi karşılıyor.', 70, 515, 22, 45, '#74857b')}`;
  if (role === 'pause') body = textRows('Videoyu burada durdur.', 70, 286, 33, 35) + textRows('Çözümün neden doğru olduğunu kendi cümlenle açıkla.', 70, 402, 28, 37) + textRows('Hazır olduğunda yeniden izleyebilirsin.', 70, 548, 20, 43, '#74857b');
  const progress = plan.scenes.map((_, i) => `<rect x="${70 + i * 224}" y="641" width="204" height="5" rx="2.5" fill="${i <= index ? '#245d50' : '#d4ddd1'}"/>`).join('');
  const grid = template === 'area' && index > 0 ? [...Array(w - 1)].map((_, i) => `<path d="M ${748 + (i + 1) * 360 / w} 306 V 486" stroke="#a7c1ac" stroke-width="1.5"/>`).join('') + [...Array(h - 1)].map((_, i) => `<path d="M 748 ${306 + (i + 1) * 180 / h} H 1108" stroke="#a7c1ac" stroke-width="1.5"/>`).join('') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#f5f1e8"/><g font-family="Arial, sans-serif" fill="#25473f"><text x="70" y="62" font-size="15" letter-spacing="2.5">ÇÖZÜM ATÖLYESİ / MATEMATİK</text><rect x="1030" y="36" width="180" height="38" rx="19" fill="#e4e9df"/><text x="1120" y="61" font-size="15" text-anchor="middle">Sessiz · Taslak</text><text x="70" y="173" font-family="Georgia, serif" font-size="43">${headings[role]}</text>${body}<rect x="686" y="218" width="524" height="388" rx="30" fill="#fffcf6" stroke="#dbe2d6"/><text x="948" y="265" font-size="15" text-anchor="middle" letter-spacing="2">DİKDÖRTGEN</text><rect x="748" y="306" width="360" height="180" rx="2" fill="#e6efdf" stroke="#346959" stroke-width="4"/>${grid}<path d="M 748 323 H 765 V 306" fill="none" stroke="#346959" stroke-width="2"/><path d="M 750 305 H 1107 M 750 487 H 1107" stroke="#bf8740" stroke-width="5"/><text x="928" y="291" font-size="25" text-anchor="middle">${w} cm</text><text x="1130" y="402" font-size="24">${h} cm</text><text x="948" y="549" font-size="16" text-anchor="middle" fill="#7b8b7a">Şekil ölçekli değildir.</text>${progress}<text x="70" y="687" font-size="13" fill="#788878">Özgün pilot · Müfredat eşlemesi ve uzman incelemesi bekleniyor · Ses/TTS yok</text><text x="1210" y="687" font-size="13" text-anchor="end" fill="#788878">${index + 1} / 5</text></g></svg>`;
}

function stamp(seconds) { const millis = Math.round(seconds * 1000); return `${String(Math.floor(millis / 3600000)).padStart(2, '0')}:${String(Math.floor(millis / 60000) % 60).padStart(2, '0')}:${String(Math.floor(millis / 1000) % 60).padStart(2, '0')}.${String(millis % 1000).padStart(3, '0')}`; }
export function rectanglePlanToVtt(plan) {
  validPlan(plan);
  return 'WEBVTT\n\n' + plan.scenes.map((scene, index) => `${index + 1}\n${stamp(scene.startSeconds)} --> ${stamp(scene.startSeconds + scene.durationSeconds)}\n${scene.caption.replaceAll('-->', '→')}\n`).join('\n');
}

function command(binary, args, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', finished = false;
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('render_process_timeout')); }, timeoutMs);
    child.stdout.on('data', bytes => { stdout += bytes; if (stdout.length > 128 * 1024) child.kill('SIGKILL'); });
    child.stderr.on('data', bytes => { stderr = (stderr + bytes).slice(-4096); });
    child.on('error', () => { if (!finished) { finished = true; clearTimeout(timer); reject(new Error('render_binary_unavailable')); } });
    child.on('close', code => { if (finished) return; finished = true; clearTimeout(timer); if (code !== 0) reject(new Error(`render_process_failed_${code}: ${stderr}`)); else resolve(stdout); });
  });
}
async function fileHash(path, byteLimit = MAX_OUTPUT) {
  const handle = await open(path, 'r'), buffer = Buffer.allocUnsafe(65536), digest = createHash('sha256');
  let count = 0;
  try { while (true) { const { bytesRead } = await handle.read(buffer, 0, buffer.length, count); if (!bytesRead) break; count += bytesRead; if (count > byteLimit) throw new Error('video_byte_limit'); digest.update(buffer.subarray(0, bytesRead)); } return { byteLength: count, sha256: digest.digest('hex') }; }
  finally { await handle.close(); }
}

export async function renderRectangleVideoPilot({ question, outputDirectory, runtime = {} }) {
  const rendererRuntime = resolveRectangleVideoRuntime(runtime);
  const plan = createRectangleVideoPlan(question);
  if (typeof outputDirectory !== 'string' || !isAbsolute(outputDirectory)) throw new Error('absolute_fresh_output_directory_required');
  try { await stat(outputDirectory); throw new Error('output_directory_exists'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const require = createRequire(rendererRuntime.sharpPackage ?? import.meta.url);
  let sharp;
  try { sharp = require('sharp'); } catch { throw new Error('sharp_runtime_unavailable_configure_trusted_path'); }
  sharp.concurrency(1);
  sharp.cache({ memory: 8, files: 0, items: 4 });
  await mkdir(outputDirectory); // Exclusive fresh directory: never overwrite or clean user files.
  const caption = rectanglePlanToVtt(plan), concat = ['ffconcat version 1.0'];
  let sidecarByteLength = 0;
  async function writeSidecar(name, data) {
    sidecarByteLength += Buffer.byteLength(data);
    createRectangleVideoOutputBudget(sidecarByteLength);
    await writeFile(join(outputDirectory, name), data, { flag: 'wx' });
  }
  for (let index = 0; index < plan.scenes.length; index++) {
    const name = `scene-${index + 1}`, svg = renderRectangleSceneSvg(plan, index);
    await writeSidecar(`${name}.svg`, svg);
    const raster = await sharp(Buffer.from(svg), { limitInputPixels: 1280 * 720 }).png().toBuffer();
    await writeSidecar(`${name}.png`, raster);
    concat.push(`file '${name}.png'`, `duration ${plan.scenes[index].durationSeconds}`);
  }
  concat.push("file 'scene-5.png'");
  await writeSidecar('scenes.ffconcat', concat.join('\n') + '\n');
  await writeSidecar('captions.vtt', caption);
  await writeSidecar('plan.json', JSON.stringify(plan, null, 2) + '\n');
  const outputBudget = createRectangleVideoOutputBudget(sidecarByteLength);
  const video = join(outputDirectory, 'solution.mp4');
  await command(rendererRuntime.ffmpegPath, ['-nostdin', '-hide_banner', '-loglevel', 'error', '-n', '-protocol_whitelist', 'file,pipe', '-f', 'concat', '-safe', '1', '-i', join(outputDirectory, 'scenes.ffconcat'), '-t', String(plan.durationSeconds), '-vf', 'fps=24,fade=t=in:st=0:d=0.45,fade=t=out:st=34.3:d=0.7,format=yuv420p', '-filter_threads', '1', '-filter_complex_threads', '1', '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', '-fs', String(outputBudget.maximumVideoByteLength), video]);
  const probe = JSON.parse(await command(rendererRuntime.ffprobePath, ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,pix_fmt,width,height', '-of', 'json', video], 30000));
  const videos = probe.streams?.filter(stream => stream.codec_type === 'video') ?? [];
  const audio = probe.streams?.some(stream => stream.codec_type === 'audio');
  const durationSeconds = Number(probe.format?.duration);
  if (videos.length !== 1 || audio || videos[0].codec_name !== 'h264' || videos[0].pix_fmt !== 'yuv420p' || videos[0].width !== 1280 || videos[0].height !== 720 || !Number.isFinite(durationSeconds) || Math.abs(durationSeconds - 35) > 0.15) throw new Error('render_output_contract_failed');
  const integrity = await fileHash(video, outputBudget.maximumVideoByteLength);
  if (integrity.byteLength === 0) throw new Error('video_byte_limit');
  const receipt = { state: 'draft_video_rendered', questionId: plan.questionId, sourceContentSha256: plan.sourceContentSha256, planSha256: plan.planSha256, video: { fileName: 'solution.mp4', ...integrity, codec: 'h264', pixelFormat: 'yuv420p', width: 1280, height: 720, durationSeconds, audio: false, faststartRequested: true }, captions: { fileName: 'captions.vtt', sha256: hash(caption) }, outputBudget, renderer: { sharpVersion: sharp.versions.sharp, encodingThreads: 2, rasterWorkers: 1 }, voiceStatus: 'not_rendered_silent_pilot', curriculumStatus: plan.curriculumStatus, expertReview: 'pending', publicationReady: false };
  const receiptJson = JSON.stringify(receipt, null, 2) + '\n';
  if (Buffer.byteLength(receiptJson) > RECEIPT_RESERVED_BYTES || sidecarByteLength + integrity.byteLength + Buffer.byteLength(receiptJson) > MAX_OUTPUT) throw new Error('total_output_byte_limit');
  await writeFile(join(outputDirectory, 'receipt.json'), receiptJson, { flag: 'wx' });
  return receipt;
}
