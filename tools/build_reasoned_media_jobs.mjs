#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join, parse, resolve, sep } from 'node:path';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

async function freshOutput(argv) {
  if (argv.length !== 2 || argv[0] !== '--out') throw new Error();
  const raw = argv[1];
  if (typeof raw !== 'string' || !isAbsolute(raw) || raw.length > 4096 || /[\0\r\n]/u.test(raw)) throw new Error();
  const parts = raw.slice(parse(raw).root.length).split(sep).filter(Boolean);
  if (!parts.length || parts.length > 128 || parts.some(part => part === '.' || part === '..')) throw new Error();
  let current = parse(raw).root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    let info;
    try { info = await lstat(current); } catch (error) {
      if (error.code !== 'ENOENT' || index !== parts.length - 1) throw new Error();
      continue;
    }
    if (info.isSymbolicLink() || !info.isDirectory() || index === parts.length - 1) throw new Error();
  }
  return resolve(raw);
}

function preview(report) {
  const jobs = [...report.questionJobs, ...report.conceptJobs];
  const cards = jobs.map(job => {
    const source = report.sources.find(item => item.id === job.source.id);
    const visuals = source.kind === 'concept_lesson' ? source.visuals : [source.visual];
    const images = visuals.map(visual => `<img width="560" src="data:image/svg+xml;base64,${Buffer.from(visual.svg).toString('base64')}" alt="${escape(visual.alt)}">`).join('');
    return `<article><p class="eyebrow">${escape(job.trace.kind)} · Taslak medya işi</p><h2>${escape(source.kind === 'concept_lesson' ? source.title : source.prompt)}</h2>${images}<p class="note">${job.cues.length} bağlı konuşma bölümü · ses ${escape(job.audioStatus)} · video ${escape(job.videoStatus)}</p><details><summary>Öğretmen metni ve düşünme araları</summary><ol>${job.cues.map(cue => `<li><small>${escape(cue.kind)} · ${escape(cue.id)}</small><p>${escape(cue.transcript)}</p>${cue.thoughtPauseSeconds ? `<p class="pause">Düşünme arası: ${cue.thoughtPauseSeconds} s (plan)</p>` : ''}</li>`).join('')}</ol></details><p class="hash">Kaynak ve metin sürümü bu işe bağlı; eski sesler otomatik eklenmez.</p></article>`;
  }).join('');
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>Öğretmen üretim masası · Gerekçeli medya işleri</title><style>
:root{--ink:#173b36;--paper:#f6f0e5;--sheet:#fffdf7;--muted:#617269;--line:#d8dfd4}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 system-ui,sans-serif}header{padding:40px max(24px,calc((100vw - 1060px)/2));background:var(--ink);color:var(--sheet)}h1{font:clamp(30px,5vw,48px)/1.15 Georgia,serif}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase}main{max-width:1060px;margin:28px auto;padding:0 20px}article{padding:28px;border:1px solid var(--line);border-radius:20px;background:var(--sheet);margin:24px 0}h2{font:25px/1.4 Georgia,serif}img{display:block;max-width:100%;height:auto;margin:20px auto}details{border-top:1px solid var(--line);padding-top:18px}summary{font-weight:600;cursor:pointer}li{padding:8px}small,.hash{font-size:12px;color:var(--muted);overflow-wrap:anywhere}.note{padding:14px;border-left:3px solid #b8563d;background:#f4e6db}.pause{font-size:13px;color:#955139}summary:focus-visible{outline:3px solid #b8563d;outline-offset:5px}@media(max-width:600px){article{padding:18px}header{padding:28px 20px}}
</style></head><body><header><p class="eyebrow">K–12 · Editör ve medya incelemesi</p><h1>Anlamdan öğretmen anlatımına.</h1><p>7 soru ve ayrı bir kavram dersi için kaynak-bağlı konuşma bölümleri. Yeni ses veya video üretilmedi.</p></header><main><p class="note">Bu sayfa üretim işlerinin taslağıdır; öğrenciler için değildir. Metin, yaş, hak, ses ve kelime–kalem incelemesi bekliyor. Sağlayıcı çağrısı: 0 · Yayın: 0.</p>${cards}</main></body></html>`;
}

try {
  // Validate arguments/path before loading a provider or creating an artifact.
  const out = await freshOutput(process.argv.slice(2));
  const [{ createGardenQuestion, createPilotBatch }, { createPerimeterLesson }, { createReasonedMathTrace }, { createReasonedPerimeterLessonTrace }, media] = await Promise.all([
    import('../packages/content-factory/pilot.mjs'), import('../packages/content-factory/perimeter_lesson.mjs'),
    import('../packages/content-factory/reasoned_math_adapter.mjs'), import('../packages/content-factory/reasoned_concept_lesson.mjs'),
    import('../packages/media/reasoned_media_job.mjs'),
  ]);
  const questions = [...createPilotBatch({ requested: 6 }).items, createGardenQuestion({ id: 'garden-two-rows-001' })];
  const questionTraces = questions.map(createReasonedMathTrace), conceptTrace = createReasonedPerimeterLessonTrace();
  const questionJobs = questionTraces.map(trace => media.createReasonedMediaJob(trace));
  const conceptJobs = [media.createReasonedMediaJob(conceptTrace)];
  const jobs = [...questionJobs, ...conceptJobs];
  const report = {
    schemaVersion: 'reasoned-media-authoring-review/v1', state: 'draft', publicationReady: false,
    providerCalls: 0, audioAttached: false, videoAttached: false, learnerData: false,
    questionJobs, conceptJobs, traces: [...questionTraces, conceptTrace],
    sources: [...questions.map(question => ({ ...question, kind: 'question_solution' })), { ...createPerimeterLesson(), kind: 'concept_lesson' }],
    audioRequests: jobs.map(job => media.createReasonedMediaAudioRequest(job)), audits: jobs.map(job => media.auditReasonedMediaJob(job)),
  };
  const files = { 'jobs.json': json(report), 'index.html': preview(report) };
  const manifest = {
    schemaVersion: 'reasoned-media-authoring-bundle/v1', state: 'private_editor_draft', publicationReady: false,
    files: Object.entries(files).map(([name, bytes]) => ({ name, sha256: sha(bytes), byteLength: Buffer.byteLength(bytes) })),
  };
  files['bundle-manifest.json'] = json(manifest);
  if (Object.values(files).reduce((total, bytes) => total + Buffer.byteLength(bytes), 0) > 2 * 1024 * 1024) throw new Error();
  await mkdir(out, { mode: 0o700 });
  for (const [name, bytes] of Object.entries(files)) await writeFile(join(out, name), bytes, { mode: 0o600, flag: 'wx' });
  console.log(JSON.stringify({ out, questionJobs: 7, conceptJobs: 1, publicationReady: false, audioAttached: false, videoAttached: false, providerCalls: 0 }));
} catch { console.error('reasoned_media_jobs_request_rejected'); process.exitCode = 1; }
