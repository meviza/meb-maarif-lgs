#!/usr/bin/env node
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createPilotBatch, createStoryboard, createLesson } from '../packages/content-factory/pilot.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { auditReasonedTeachingTrace, getReasonedTeachingStage } from '../packages/contracts/reasoned_teaching_trace.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
// The owned rectangle renderer uses these exact three attributes. Namespace
// its review-only copy so document-wide IDREFs never resolve another card.
// The question, diagram digest and canonical SVG remain unchanged in JSON.
const reviewRectangleSvg = (svg, index) => svg
  .replace('aria-labelledby="title desc"', `aria-labelledby="question-${index + 1}-title question-${index + 1}-desc"`)
  .replace('<title id="title">', `<title id="question-${index + 1}-title">`)
  .replace('<desc id="desc">', `<desc id="question-${index + 1}-desc">`);
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

function reasonedPanel(trace) {
  const count = trace.steps.length + 5;
  const stages = Array.from({ length: count }, (_, stageIndex) => {
    const hidden = getReasonedTeachingStage(trace, { stageIndex });
    const shown = getReasonedTeachingStage(trace, { stageIndex, reveal: true });
    const evidence = hidden.kind === 'evidence' ? `<ul>${hidden.evidence.map(item => `<li><strong>${escape(item.text)}</strong> <span class="intent">Kaynak: ${escape(item.anchor)}</span></li>`).join('')}</ul>` : '';
    const result = shown.result ? `<p class="expression">${escape(typeof shown.result.value === 'number' ? `${shown.expression} = ${shown.result.value} ${shown.result.unit}` : shown.result.value)}</p><p>${escape(shown.result.meaning)}</p>` : '';
    const answer = hidden.requiresReveal ? `<button type="button" data-reveal-reason>${hidden.kind === 'transfer' ? 'Aktarım açıklamasını gör' : 'Gerekçeyi düşündüm · sonucu gör'}</button><div data-reason-answer hidden>${result}<p>${escape(shown.check.answer)}</p></div>` : '';
    const check = hidden.kind === 'reasoning' ? `<p class="intent">Kontrol sorusu: ${escape(hidden.check.prompt)}</p>` : '';
    const prior = hidden.priorResults.length ? `<ul class="intent">${hidden.priorResults.map(item => `<li>${escape(item.meaning)}: ${escape(item.value)}${item.unit === 'text' ? '' : ` ${escape(item.unit)}`}</li>`).join('')}</ul>` : '';
    const conditions = ['plan', 'summary'].includes(hidden.kind) ? `<ul>${hidden.conditions.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : '';
    return `<section data-reason-stage="${stageIndex}" data-kind="${hidden.kind}" data-requires-reveal="${hidden.requiresReveal}" ${stageIndex ? 'hidden' : ''}><h3>${escape(hidden.title)}</h3><p>${escape(hidden.explanation)}</p>${evidence}${conditions}${prior}${check}${answer}</section>`;
  }).join('');
  return `<div class="scene reasoned" data-reasoned-review data-trace-id="${escape(trace.id)}">${stages}<div class="controls"><button type="button" data-reason-back>Önceki gerekçe</button><span aria-live="polite" data-reason-counter>Adım 1 / ${count}</span><button type="button" data-reason-next>Sonraki gerekçe</button></div><p class="notice">Editör taslağı; adım açılması öğrenme kanıtı değildir. Yeni gerekçe metinleri henüz seslendirilmedi.</p></div>`;
}

function preview(report) {
  const cards = report.items.map((item, index) => {
    const storyboard = report.storyboards[index];
    return `<article class="question"><div class="eyebrow">${escape(item.id)} · Taslak · ${escape(item.difficulty.calibrationStatus)}</div><h2>${escape(item.prompt)}</h2><div class="figure">${reviewRectangleSvg(item.visual.svg, index)}</div><p class="intent">Amaç: ${escape(item.cognitiveIntent.description)}</p><div class="choices">${item.options.map((option, i) => `<span>${String.fromCharCode(65 + i)} · ${option} ${escape(item.answerUnit)}</span>`).join('')}</div><details class="reasoned-details"><summary>Neden bu yolu seçiyoruz? · gerekçeli çözüm</summary>${reasonedPanel(report.reasonedTeaching.questionTraces[index])}</details><details><summary>Önceki sayısal storyboard · yeni gerekçe değil</summary><div class="scene" data-scene>${storyboard.frames.map((frame, frameIndex) => `<section data-step="${frameIndex}" ${frameIndex ? 'hidden' : ''}><div class="expression">${escape(frame.expression)}${frame.expression.includes('=') ? '' : ' = ' + frame.value}</div><p>${escape(frame.narration)}</p></section>`).join('')}<div class="controls"><button type="button" data-direction="-1" aria-label="Önceki çözüm adımı">Geri</button><span aria-live="polite" data-indicator>Adım 1 / ${storyboard.frames.length}</span><button type="button" data-direction="1" aria-label="Sonraki çözüm adımı">İleri</button></div></div><p class="notice">Bu oynatım SVG/adım önizlemesidir; MP4 veya sesli video üretilmedi.</p><p>${escape(report.lessons[index].teacherHint)}</p></details></article>`;
  }).join('');
  const concept = `<article class="question concept-lesson"><div class="eyebrow">Ayrı konu anlatımı · taslak</div><h2>Konu anlatımı: çevre–alan ve karşı örnek</h2><p>Bu ders tek sorunun cevap açıklaması değildir: sınırı izleme, yüzeyi kaplama, karşı örnek ve yeni bir göreve aktarım içerir.</p><div class="figure">${report.reasonedTeaching.conceptSource.visuals[1].svg}</div>${reasonedPanel(report.reasonedTeaching.conceptLessons[0])}</article>`;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:"><title>İçerik Atölyesi · Matematik Pilot</title><style>
:root{color-scheme:light;--ink:#173b36;--paper:#f6f0e5;--line:#d8dfd4;--accent:#b8563d}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}header{padding:48px max(24px,calc((100vw - 1060px)/2));background:#173b36;color:#fff8ec}h1{font:clamp(30px,5vw,48px)/1.1 Georgia,serif;margin:8px 0 16px}.eyebrow{text-transform:uppercase;font-size:11px;letter-spacing:.08em;color:#7e6758}header .eyebrow{color:#d5cbb5}header p{max-width:760px;margin:0}.metrics{display:flex;flex-wrap:wrap;gap:16px;margin-top:24px}.metrics span{border:1px solid #526d60;padding:8px 14px;border-radius:12px}main{max-width:1060px;margin:32px auto;padding:0 20px}.notice{color:#8b4938;background:#f4e6db;padding:12px 16px;border-radius:8px;font-size:14px}.question{background:#fffdf7;border:1px solid var(--line);border-radius:24px;padding:28px;margin:24px 0;box-shadow:0 8px 20px #193b3805}h2{font:24px/1.4 Georgia,serif;margin:14px 0}.figure{max-width:560px;margin:auto}.figure svg{width:100%;height:auto}.intent{font-size:14px;color:#617269}.choices{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.choices span{background:#f0f4ed;border:1px solid #d4ddd1;border-radius:10px;padding:12px;text-align:center}details{margin-top:22px;border-top:1px solid var(--line);padding-top:18px}summary{cursor:pointer;font-weight:600}.scene{background:#eef3ed;border-radius:14px;padding:24px;margin-top:18px}.expression{font:28px/1.3 Georgia,serif}.controls{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px}button{padding:10px 18px;border:1px solid #8da496;border-radius:10px;background:#fffdf7;color:var(--ink);font:inherit;cursor:pointer}button:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:4px}button:disabled{opacity:.4;cursor:default}[hidden]{display:none!important}@media(max-width:600px){header{padding:32px 20px}.question{padding:20px}.choices{grid-template-columns:repeat(2,1fr)}.expression{font-size:23px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style></head><body><header><div class="eyebrow">K–12 · Editör inceleme ortamı</div><h1>Matematiği görünür kıl.</h1><p>Özgün sayısal problemler, çizimiyle bağlı çözüm grafiği ve adımlı anlatım. Yerel kalite kontrolü geçti; resmî müfredat eşlemesi ve uzman onayı bekleniyor.</p><div class="metrics"><span>${report.summary.requested} aday</span><span>${report.summary.producedDrafts} taslak</span><span>${report.summary.rejected} çeşitlilik reddi</span><span>0 yayın</span></div></header><main><p class="notice">Taslak içeriktir. MEB onaylı değildir; öğrenciye teslim veya puanlama yapmaz. Clef Flash çağrılmadı. Özgünlük arşiv karşılaştırması henüz tamamlanmadı.</p>${cards}${concept}</main><script>
for(const scene of document.querySelectorAll('[data-scene]')){const steps=[...scene.querySelectorAll('[data-step]')];let index=0;const buttons=[...scene.querySelectorAll('button')];function show(){steps.forEach((step,i)=>{step.hidden=i!==index});scene.querySelector('[data-indicator]').textContent='Adım '+(index+1)+' / '+steps.length;buttons[0].disabled=index===0;buttons[1].disabled=index===steps.length-1}buttons.forEach(button=>button.addEventListener('click',()=>{index=Math.max(0,Math.min(steps.length-1,index+Number(button.dataset.direction)));show()}));show()}
for(const review of document.querySelectorAll('[data-reasoned-review]')){const stages=[...review.querySelectorAll('[data-reason-stage]')];let index=0;const back=review.querySelector('[data-reason-back]'),next=review.querySelector('[data-reason-next]');function show(){stages.forEach((stage,i)=>{stage.hidden=i!==index});const stage=stages[index],answer=stage.querySelector('[data-reason-answer]');back.disabled=index===0;next.disabled=index===stages.length-1||(stage.dataset.requiresReveal==='true'&&answer.hidden);review.querySelector('[data-reason-counter]').textContent='Adım '+(index+1)+' / '+stages.length;}function clear(){const stage=stages[index],answer=stage.querySelector('[data-reason-answer]'),reveal=stage.querySelector('[data-reveal-reason]');if(answer)answer.hidden=true;if(reveal)reveal.hidden=false;}back.addEventListener('click',()=>{if(index>0){index--;clear();show();}});next.addEventListener('click',()=>{if(!next.disabled&&index<stages.length-1){index++;clear();show();}});for(const reveal of review.querySelectorAll('[data-reveal-reason]'))reveal.addEventListener('click',()=>{const stage=stages[index];stage.querySelector('[data-reason-answer]').hidden=false;reveal.hidden=true;show();});show();}
</script></body></html>`;
}

try {
  const options = args(process.argv.slice(2));
  const metadata = options.metadata ? JSON.parse(await readFile(options.metadata, 'utf8')) : undefined;
  const batch = createPilotBatch({ requested: options.count, metadata });
  // Any source or reasoning error aborts before a directory/file is written.
  // Counts still reflect diversity-rejected drafts, never 100 accepted originals.
  const questionTraces = batch.items.map(createReasonedMathTrace);
  const conceptLessons = [createReasonedPerimeterLessonTrace()];
  const report = {
    schemaVersion: 'content-factory-pilot-report/v1', ...batch,
    providerStatus: { generator: 'deterministic_math_pilot', clef: 'not_invoked', livePaidCalls: 0, studentDataTransferred: false },
    storyboards: batch.items.map(createStoryboard), lessons: batch.items.map(createLesson),
    reasonedTeaching: {
      schemaVersion: 'reasoned-factory-review/v1', questionTraces, conceptLessons,
      conceptSource: createPerimeterLesson(),
      questionAudits: questionTraces.map(auditReasonedTeachingTrace),
      conceptAudits: conceptLessons.map(auditReasonedTeachingTrace),
      summary: { reasonedQuestionDrafts: questionTraces.length, reasonedConceptDrafts: conceptLessons.length, expertApproved: 0, published: 0, liveProviderCalls: 0 },
    },
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
