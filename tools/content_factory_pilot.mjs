#!/usr/bin/env node
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createPilotBatch, createStoryboard, createLesson } from '../packages/content-factory/pilot.mjs';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
function args(argv) {
  const result = { count: 12, out: null, metadata: null };
  for (let index = 0; index < argv.length; index++) {
    const option = argv[index];
    if (!['--count', '--out', '--metadata'].includes(option) || !argv[index + 1]) throw new Error('Usage: node tools/content_factory_pilot.mjs --count 1..100 --out EMPTY_DIRECTORY [--metadata JSON_FILE]');
    const value = argv[++index];
    if (option === '--count') result.count = Number(value);
    if (option === '--out') result.out = resolve(value);
    if (option === '--metadata') result.metadata = resolve(value);
  }
  if (!result.out) throw new Error('explicit_output_directory_required');
  return result;
}

function preview(report) {
  const cards = report.items.map((item, index) => {
    const storyboard = report.storyboards[index];
    return `<article class="question"><div class="eyebrow">${escape(item.id)} · Taslak · ${escape(item.difficulty.calibrationStatus)}</div><h2>${escape(item.prompt)}</h2><div class="figure">${item.visual.svg}</div><p class="intent">Amaç: ${escape(item.cognitiveIntent.description)}</p><div class="choices">${item.options.map((option, i) => `<span>${String.fromCharCode(65 + i)} · ${option} ${escape(item.answerUnit)}</span>`).join('')}</div><details><summary>Doğrulanmış sayısal çözüm ve adımlı sahne</summary><div class="scene" data-scene>${storyboard.frames.map((frame, frameIndex) => `<section data-step="${frameIndex}" ${frameIndex ? 'hidden' : ''}><div class="expression">${escape(frame.expression)}${frame.expression.includes('=') ? '' : ' = ' + frame.value}</div><p>${escape(frame.narration)}</p></section>`).join('')}<div class="controls"><button type="button" data-direction="-1" aria-label="Önceki çözüm adımı">Geri</button><span aria-live="polite" data-indicator>Adım 1 / ${storyboard.frames.length}</span><button type="button" data-direction="1" aria-label="Sonraki çözüm adımı">İleri</button></div></div><p class="notice">Bu oynatım SVG/adım önizlemesidir; MP4 veya sesli video üretilmedi.</p><p>${escape(report.lessons[index].teacherHint)}</p></details></article>`;
  }).join('');
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:"><title>İçerik Atölyesi · Matematik Pilot</title><style>
:root{color-scheme:light;--ink:#173b36;--paper:#f6f0e5;--line:#d8dfd4;--accent:#b8563d}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}header{padding:48px max(24px,calc((100vw - 1060px)/2));background:#173b36;color:#fff8ec}h1{font:clamp(30px,5vw,48px)/1.1 Georgia,serif;margin:8px 0 16px}.eyebrow{text-transform:uppercase;font-size:11px;letter-spacing:.08em;color:#7e6758}header .eyebrow{color:#d5cbb5}header p{max-width:760px;margin:0}.metrics{display:flex;flex-wrap:wrap;gap:16px;margin-top:24px}.metrics span{border:1px solid #526d60;padding:8px 14px;border-radius:12px}main{max-width:1060px;margin:32px auto;padding:0 20px}.notice{color:#8b4938;background:#f4e6db;padding:12px 16px;border-radius:8px;font-size:14px}.question{background:#fffdf7;border:1px solid var(--line);border-radius:24px;padding:28px;margin:24px 0;box-shadow:0 8px 20px #193b3805}h2{font:24px/1.4 Georgia,serif;margin:14px 0}.figure{max-width:560px;margin:auto}.figure svg{width:100%;height:auto}.intent{font-size:14px;color:#617269}.choices{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.choices span{background:#f0f4ed;border:1px solid #d4ddd1;border-radius:10px;padding:12px;text-align:center}details{margin-top:22px;border-top:1px solid var(--line);padding-top:18px}summary{cursor:pointer;font-weight:600}.scene{background:#eef3ed;border-radius:14px;padding:24px;margin-top:18px}.expression{font:28px/1.3 Georgia,serif}.controls{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px}button{padding:10px 18px;border:1px solid #8da496;border-radius:10px;background:#fffdf7;color:var(--ink);font:inherit;cursor:pointer}button:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:4px}button:disabled{opacity:.4;cursor:default}[hidden]{display:none!important}@media(max-width:600px){header{padding:32px 20px}.question{padding:20px}.choices{grid-template-columns:repeat(2,1fr)}.expression{font-size:23px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style></head><body><header><div class="eyebrow">K–12 · Editör inceleme ortamı</div><h1>Matematiği görünür kıl.</h1><p>Özgün sayısal problemler, çizimiyle bağlı çözüm grafiği ve adımlı anlatım. Yerel kalite kontrolü geçti; resmî müfredat eşlemesi ve uzman onayı bekleniyor.</p><div class="metrics"><span>${report.summary.requested} aday</span><span>${report.summary.producedDrafts} taslak</span><span>${report.summary.rejected} çeşitlilik reddi</span><span>0 yayın</span></div></header><main><p class="notice">Taslak içeriktir. MEB onaylı değildir; öğrenciye teslim veya puanlama yapmaz. Clef Flash çağrılmadı. Özgünlük arşiv karşılaştırması henüz tamamlanmadı.</p>${cards}</main><script>
for(const scene of document.querySelectorAll('[data-scene]')){const steps=[...scene.querySelectorAll('[data-step]')];let index=0;const buttons=[...scene.querySelectorAll('button')];function show(){steps.forEach((step,i)=>{step.hidden=i!==index});scene.querySelector('[data-indicator]').textContent='Adım '+(index+1)+' / '+steps.length;buttons[0].disabled=index===0;buttons[1].disabled=index===steps.length-1}buttons.forEach(button=>button.addEventListener('click',()=>{index=Math.max(0,Math.min(steps.length-1,index+Number(button.dataset.direction)));show()}));show()}
</script></body></html>`;
}

try {
  const options = args(process.argv.slice(2));
  const metadata = options.metadata ? JSON.parse(await readFile(options.metadata, 'utf8')) : undefined;
  const batch = createPilotBatch({ requested: options.count, metadata });
  const report = {
    schemaVersion: 'content-factory-pilot-report/v1', ...batch,
    providerStatus: { generator: 'deterministic_math_pilot', clef: 'not_invoked', livePaidCalls: 0, studentDataTransferred: false },
    storyboards: batch.items.map(createStoryboard), lessons: batch.items.map(createLesson),
    publicationGate: { state: 'closed', reasons: ['canonical_registry_and_full_quality_gates_not_connected', 'trusted_review_store_not_connected'] },
  };
  await mkdir(options.out, { recursive: true });
  if ((await readdir(options.out)).length) throw new Error('output_directory_must_be_empty_no_overwrite');
  await mkdir(join(options.out, 'diagrams'));
  await writeFile(join(options.out, 'audit.json'), JSON.stringify(report, null, 2) + '\n');
  await writeFile(join(options.out, 'batch.json'), JSON.stringify(report, null, 2) + '\n');
  await writeFile(join(options.out, 'preview.html'), preview(report));
  for (const item of batch.items) await writeFile(join(options.out, 'diagrams', `${item.id}.svg`), item.visual.svg + '\n');
  console.log(JSON.stringify({ out: options.out, summary: report.summary, providerStatus: report.providerStatus }));
} catch (error) {
  console.error(error?.message ?? 'pilot_failed');
  process.exitCode = 1;
}
