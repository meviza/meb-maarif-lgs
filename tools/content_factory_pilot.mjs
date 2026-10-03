#!/usr/bin/env node
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createPilotBatch, createStoryboard, createLesson } from '../packages/content-factory/pilot.mjs';
import { createReasonedMathTrace } from '../packages/content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../packages/content-factory/reasoned_concept_lesson.mjs';
import { auditReasonedTeachingTrace, getReasonedTeachingStage } from '../packages/contracts/reasoned_teaching_trace.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { createReasonedMediaJob, auditReasonedMediaJob } from '../packages/media/reasoned_media_job.mjs';
import { resolveReasonedMediaGeometry } from '../packages/media/reasoned_geometry_resolver.mjs';
import { createReasonedScenePlan } from '../packages/media/reasoned_scene_renderer.mjs';
import { createMixedPracticePlan } from '../packages/content-factory/mixed_practice_plan.mjs';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
// The owned rectangle renderer uses these exact three attributes. Namespace
// its review-only copy so document-wide IDREFs never resolve another card.
// The question, diagram digest and canonical SVG remain unchanged in JSON.
const reviewRectangleSvg = (svg, copy) => {
  const prefix = typeof copy === 'number' ? `question-${copy + 1}` : copy;
  return svg
    .replace('aria-labelledby="title desc"', `aria-labelledby="${prefix}-title ${prefix}-desc"`)
    .replace('<title id="title">', `<title id="${prefix}-title">`)
    .replace('<desc id="desc">', `<desc id="${prefix}-desc">`);
};
const sentence = value => {
  const text = String(value).trim();
  return text ? text[0].toLocaleUpperCase('tr-TR') + text.slice(1) : text;
};
const difficultyName = level => ({ introductory: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri', challenge: 'Zorlayıcı' }[level] ?? 'Henüz sınıflandırılmadı');
const familyName = family => ({ perimeter: 'Çevreyi bulma', area: 'Alanı bulma', width_from_area: 'Alandan kenarı bulma', width_from_perimeter: 'Çevreden kenarı bulma', error_diagnosis: 'İşlem hatasını açıklama', fence_gap: 'Açıklık koşulunu uygulama' }[family] ?? 'İnceleme bekleyen soru ailesi');
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
    return `<section data-reason-stage="${stageIndex}" data-kind="${hidden.kind}" data-requires-reveal="${hidden.requiresReveal}" ${stageIndex ? 'hidden' : ''}><h3>${escape(sentence(hidden.title))}</h3><p>${escape(sentence(hidden.explanation))}</p>${evidence}${conditions}${prior}${check}${answer}</section>`;
  }).join('');
  return `<div class="scene reasoned" data-reasoned-review data-trace-id="${escape(trace.id)}">${stages}<div class="controls"><button type="button" data-reason-back>Önceki gerekçe</button><span aria-live="polite" data-reason-counter>Adım 1 / ${count}</span><button type="button" data-reason-next>Sonraki gerekçe</button></div><p class="notice">Editör taslağı; adım açılması öğrenme kanıtı değildir. Yeni gerekçe metinleri henüz seslendirilmedi.</p></div>`;
}

function questionBody(item, trace, copy) {
  return `<h2>${escape(sentence(item.prompt))}</h2><div class="figure">${reviewRectangleSvg(item.visual.svg, copy)}</div><p class="intent">Amaç: ${escape(sentence(item.cognitiveIntent.description))}</p><div class="choices">${item.options.map((option, index) => `<span>${String.fromCharCode(65 + index)} · ${escape(option)} ${escape(item.answerUnit)}</span>`).join('')}</div><details class="reasoned-details"><summary>Neden bu yolu seçiyoruz? · Gerekçeli çözüm</summary>${reasonedPanel(trace)}</details>`;
}

function profileTable(plan, title) {
  return `<section class="profile"><h3>${escape(title)}</h3><p>Hedef profil: ${Object.values(plan.request.difficultyProfile).map(escape).join(' / ')} · ${escape(plan.request.count)} soru. Mevcut havuz: ${escape(plan.candidatePool.candidateCount)} aday, ${escape(plan.candidatePool.distinctFamilyCount)} farklı aile. Aynı ailenin sayısal varyantı yeni aile sayılmaz.</p><div class="table-scroll"><table><thead><tr><th scope="col">Zorluk</th><th scope="col">Hedef %</th><th scope="col">Hedef soru</th><th scope="col">Mevcut farklı aile</th><th scope="col">Seçilen</th><th scope="col">Eksik</th></tr></thead><tbody>${plan.quotaReport.difficulty.map(row => `<tr><th scope="row">${difficultyName(row.id)}</th><td>${escape(plan.request.difficultyProfile[row.id])}</td><td>${escape(row.requested)}</td><td>${escape(row.availableDistinctFamilies)}</td><td>${escape(row.selected)}</td><td>${escape(row.missing)}</td></tr>`).join('')}</tbody></table></div><p class="${plan.selectionReady ? 'intent' : 'notice'}">${plan.selectionReady ? 'Yerel inceleme planı hazır; öğrenciye teslim onayı değildir.' : 'Üretim engeli: İstenen sayı, zorluk veya çeşitlilik mevcut havuzla karşılanmıyor. Eksik sorular üretilecek ve ayrıca incelenecek; mevcut sorular yeniden etiketlenmedi.'}</p></section>`;
}

function preview(report) {
  const cards = report.items.map((item, index) => {
    const storyboard = report.storyboards[index];
    return `<article class="question"><div class="eyebrow">${escape(item.id)} · Taslak · ${difficultyName(item.difficulty.level)} · Yazar tahmini</div>${questionBody(item, report.reasonedTeaching.questionTraces[index], index)}<p class="intent">Kaynak kaydı: ${escape(item.metadata.source.sourceId)}</p><details><summary>Önceki sayısal storyboard · Yeni gerekçe değil</summary><div class="scene" data-scene>${storyboard.frames.map((frame, frameIndex) => `<section data-step="${frameIndex}" ${frameIndex ? 'hidden' : ''}><div class="expression">${escape(frame.expression)}${frame.expression.includes('=') ? '' : ' = ' + frame.value}</div><p>${escape(sentence(frame.narration))}</p></section>`).join('')}<div class="controls"><button type="button" data-direction="-1" aria-label="Önceki çözüm adımı">Geri</button><span aria-live="polite" data-indicator>Adım 1 / ${storyboard.frames.length}</span><button type="button" data-direction="1" aria-label="Sonraki çözüm adımı">İleri</button></div></div><p class="notice">Bu oynatım SVG/adım önizlemesidir; MP4 veya sesli video üretilmedi.</p><p>${escape(report.lessons[index].teacherHint)}</p></details></article>`;
  }).join('');
  const plan = report.practicePreparation.reviewPlan;
  const source = report.reasonedTeaching.conceptSource;
  const concept = `<article class="question concept-lesson" data-lesson-introduction><div class="eyebrow">Önce kavramı keşfet · Taslak</div><h2>Konu anlatımı: çevre–alan ve karşı örnek</h2><div class="lesson-layout"><div><p>${escape(source.concept.perimeter)}</p><p>${escape(source.concept.area)}</p><div class="figure">${source.visuals[0].svg}</div><p>${escape(source.activities[0].instruction)}</p><p>${escape(source.activities[1].instruction)}</p></div><aside class="lesson-notes" aria-label="Formül ve yöntem notları"><h3>Formül</h3><p>Dikdörtgende çevre = 2 × (uzun kenar + kısa kenar).</p><p>Dikdörtgende alan = uzun kenar × kısa kenar.</p><h3>Kısa yöntem</h3><p>Önce istenen büyüklüğü belirle: Sınırı mı ölçüyoruz, yüzeyi mi kaplıyoruz? Sonra uygun bağıntıyı seç.</p><h3>Püf nokta</h3><p>Çevre bir uzunluktur: cm. Alan bir yüzeydir: cm². İşlemden önce birimi düşün.</p><h3>Ne zaman geçerli?</h3><p>Bu bağıntılar dikdörtgen içindir; karşılıklı kenarlar eşittir. Örnekte bütün kenar uzunlukları cm cinsindedir. Farklı birimler varsa önce aynı uzunluk birimine dönüştür.</p><h3>Tahmin et, sonra açıkla</h3><p>Kısa kenar aynı kalırken uzun kenar 1 cm artsa çevre ve alan nasıl değişir? Önce şekil üzerinde tahmin et; sonra değişen kenarları ve eklenen kareleri göster.</p></aside></div>${reasonedPanel(report.reasonedTeaching.conceptLessons[0])}<details><summary>Karşı örneği incele: Aynı alan, farklı çevre</summary><div class="figure">${source.visuals[1].svg}</div><p>${escape(source.misconception.explanation)}</p></details></article>`;
  const worked = plan.workedExample ? `<article class="question" data-worked-example><div class="eyebrow">Birlikte çözelim · Tek öğretici örnek</div><h2>${escape(sentence(plan.workedExample.question.prompt))}</h2><div class="figure">${reviewRectangleSvg(plan.workedExample.question.visual.svg, 'worked-example')}</div><p class="intent">${familyName(plan.workedExample.family)} · ${difficultyName(plan.workedExample.difficulty)} · Yazar tahmini</p>${reasonedPanel(plan.workedExample.reasonedTrace)}</article>` : `<p class="notice">Öğretici örnek için uygun soru bulunamadı; alıştırma kabulü engellendi.</p>`;
  const practice = `<section class="question" data-mixed-practice aria-labelledby="mixed-practice-heading"><div class="eyebrow">Şimdi farklı yolları dene · Editör alıştırma önizlemesi</div><h2 id="mixed-practice-heading">Karışık alıştırma</h2><p>Her aileden en fazla bir soru var. Öğretici örneğin aynı kaynak revizyonu bu seçime alınmadı. Soru başlıkları ve zorluklar yazar tahminidir; bu ekran öğrenci oturumu veya sınav değildir.</p><details><summary>Bu seçimin hedefi ve havuz sınırı</summary>${profileTable(plan, 'Altı soruluk mevcut pilot seçimi')}</details><div class="controls practice-navigation"><button type="button" data-practice-back aria-label="Önceki alıştırma">Önceki soru</button><span aria-live="polite" data-practice-counter>Soru ${plan.selectedCount ? 1 : 0} / ${plan.selectedCount}</span><button type="button" data-practice-next aria-label="Sonraki alıştırma">Sonraki soru</button></div>${plan.selectedQuestions.map((selected, index) => {
    const trace = report.reasonedTeaching.questionTraces.find(candidate => candidate.source.id === selected.source.id && candidate.source.contentSha256 === selected.source.contentSha256);
    return `<article class="practice-question" data-practice-question="${index}" ${index ? 'hidden' : ''}><div class="eyebrow">${familyName(selected.family)} · ${difficultyName(selected.difficulty)} · Yazar tahmini</div>${questionBody(selected.question, trace, `practice-${index + 1}`)}</article>`;
  }).join('')}${!plan.selectedCount ? '<p class="notice">Mevcut havuzdan uygun alıştırma seçilemedi.</p>' : ''}<details data-practice-profile-audit open><summary>Örnek hedef profil: 10 / 30 / 30 / 30</summary>${profileTable(report.practicePreparation.exampleProfileAudit, 'On soruluk örnek hedefin üretim denetimi')}</details></section>`;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:"><title>İçerik Atölyesi · Matematik Pilot</title><style>
:root{color-scheme:light;--ink:#173b36;--paper:#f6f0e5;--line:#d8dfd4;--accent:#b8563d}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}header{padding:48px max(24px,calc((100vw - 1060px)/2));background:#173b36;color:#fff8ec}h1{font:clamp(30px,5vw,48px)/1.1 Georgia,serif;margin:8px 0 16px}.eyebrow{text-transform:uppercase;font-size:11px;letter-spacing:.08em;color:#7e6758}header .eyebrow{color:#d5cbb5}header p{max-width:760px;margin:0}.metrics{display:flex;flex-wrap:wrap;gap:16px;margin-top:24px}.metrics span{border:1px solid #526d60;padding:8px 14px;border-radius:12px}main{max-width:1060px;margin:32px auto;padding:0 20px}.notice{color:#8b4938;background:#f4e6db;padding:12px 16px;border-radius:8px;font-size:14px}.question{background:#fffdf7;border:1px solid var(--line);border-radius:24px;padding:28px;margin:24px 0;box-shadow:0 8px 20px #193b3805}h2{font:24px/1.4 Georgia,serif;margin:14px 0}.figure{max-width:560px;margin:auto}.figure svg{width:100%;height:auto}.intent{font-size:14px;color:#617269}.choices{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.choices span{background:#f0f4ed;border:1px solid #d4ddd1;border-radius:10px;padding:12px;text-align:center}details{margin-top:22px;border-top:1px solid var(--line);padding-top:18px}summary{cursor:pointer;font-weight:600}.scene{background:#eef3ed;border-radius:14px;padding:24px;margin-top:18px}.expression{font:28px/1.3 Georgia,serif}.controls{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px}button{padding:10px 18px;border:1px solid #8da496;border-radius:10px;background:#fffdf7;color:var(--ink);font:inherit;cursor:pointer}button:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:4px}button:disabled{opacity:.4;cursor:default}[hidden]{display:none!important}@media(max-width:600px){header{padding:32px 20px}.question{padding:20px}.choices{grid-template-columns:repeat(2,1fr)}.expression{font-size:23px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.lesson-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(240px,1fr);gap:24px}.lesson-notes{padding:20px;background:#eef3ed;border-radius:14px}.lesson-notes h3{margin:12px 0 4px}.lesson-notes p{font-size:14px;margin:4px 0 16px}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:10px;border-bottom:1px solid var(--line)}.practice-question{margin-top:24px}.practice-navigation{padding:12px 0;border-bottom:1px solid var(--line)}@media(max-width:760px){.lesson-layout{grid-template-columns:1fr}.controls{flex-wrap:wrap}.table-scroll{max-width:100%}}
</style></head><body><header><div class="eyebrow">K–12 · Editör inceleme ortamı</div><h1>Matematiği görünür kıl.</h1><p>Önce konu anlatımı, sonra birlikte çözülen tek örnek, ardından farklı düşünme yollarını çalıştıran karışık alıştırma. Yerel aritmetik ve kaynak bağları kontrol edildi; resmî müfredat eşlemesi ve uzman onayı bekleniyor.</p><div class="metrics"><span>${report.summary.requested} aday</span><span>${report.summary.producedDrafts} taslak</span><span>${report.summary.rejected} çeşitlilik reddi</span><span>0 yayın</span></div></header><main><p class="notice">Taslak içeriktir. MEB onaylı değildir; öğrenciye teslim veya puanlama yapmaz. Clef Flash çağrılmadı. Özgünlük arşiv karşılaştırması henüz tamamlanmadı.</p>${concept}${worked}${practice}<details data-author-bank><summary>Editör: Tüm taslaklar</summary><p class="intent">${report.items.length} ham taslak ve eski storyboard yalnız inceleme içindir. Bu banka karışık alıştırma dizisi değildir. Bu özel editör paketi öğrenciye teslim için onaylı değildir; gerçek teslim ve kimlik katmanı bağlı değildir.</p>${cards}</details></main><script>
for(const scene of document.querySelectorAll('[data-scene]')){const steps=[...scene.querySelectorAll('[data-step]')];let index=0;const buttons=[...scene.querySelectorAll('button')];function show(){steps.forEach((step,i)=>{step.hidden=i!==index});scene.querySelector('[data-indicator]').textContent='Adım '+(index+1)+' / '+steps.length;buttons[0].disabled=index===0;buttons[1].disabled=index===steps.length-1}buttons.forEach(button=>button.addEventListener('click',()=>{index=Math.max(0,Math.min(steps.length-1,index+Number(button.dataset.direction)));show()}));show()}
for(const review of document.querySelectorAll('[data-reasoned-review]')){
  const stages=[...review.querySelectorAll('[data-reason-stage]')];
  const back=review.querySelector('[data-reason-back]'),next=review.querySelector('[data-reason-next]');
  let index=0;
  function clearAnswer(stage){
    const answer=stage.querySelector('[data-reason-answer]'),reveal=stage.querySelector('[data-reveal-reason]');
    if(answer)answer.hidden=true;
    if(reveal)reveal.hidden=false;
  }
  function show(){
    stages.forEach((stage,position)=>{stage.hidden=position!==index});
    const stage=stages[index],answer=stage.querySelector('[data-reason-answer]');
    back.disabled=index===0;
    next.disabled=index===stages.length-1||(stage.dataset.requiresReveal==='true'&&answer.hidden);
    review.querySelector('[data-reason-counter]').textContent='Adım '+(index+1)+' / '+stages.length;
  }
  back.addEventListener('click',()=>{if(index>0){index--;clearAnswer(stages[index]);show();}});
  next.addEventListener('click',()=>{if(!next.disabled&&index<stages.length-1){index++;clearAnswer(stages[index]);show();}});
  for(const reveal of review.querySelectorAll('[data-reveal-reason]'))reveal.addEventListener('click',()=>{
    const stage=stages[index];
    if(stage.querySelector('[data-reveal-reason]')!==reveal)return;
    stage.querySelector('[data-reason-answer]').hidden=false;
    reveal.hidden=true;
    show();
  });
  review.addEventListener('reset-reasoned-review',()=>{stages.forEach(clearAnswer);index=0;show();});
  show();
}
for(const practice of document.querySelectorAll('[data-mixed-practice]')){
  const questions=[...practice.querySelectorAll('[data-practice-question]')];
  const back=practice.querySelector('[data-practice-back]'),next=practice.querySelector('[data-practice-next]');
  let index=0;
  function show(){
    questions.forEach((question,position)=>{question.hidden=position!==index});
    back.disabled=index===0;
    next.disabled=questions.length===0||index===questions.length-1;
    practice.querySelector('[data-practice-counter]').textContent='Soru '+(questions.length?index+1:0)+' / '+questions.length;
  }
  function move(direction){
    const target=index+direction;
    if(target<0||target>=questions.length)return;
    index=target;
    const question=questions[index];
    for(const detail of question.querySelectorAll('details'))detail.open=false;
    for(const review of question.querySelectorAll('[data-reasoned-review]'))review.dispatchEvent(new Event('reset-reasoned-review'));
    show();
  }
  back.addEventListener('click',()=>{if(!back.disabled)move(-1);});
  next.addEventListener('click',()=>{if(!next.disabled)move(1);});
  show();
}
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
  const questionMediaJobs = questionTraces.map(trace => createReasonedMediaJob(trace));
  const conceptMediaJobs = conceptLessons.map(trace => createReasonedMediaJob(trace));
  const conceptSource = createPerimeterLesson();
  // Resolve live source/trace/job capabilities before writing any artifact.
  // This derived manifest does not rewrite the original jobs, attach audio,
  // render video or promote a local draft to expert-approved publication.
  const questionGeometryBindings = batch.items.map((source, index) => resolveReasonedMediaGeometry({
    source, trace: questionTraces[index], job: questionMediaJobs[index],
  }));
  const conceptGeometryBindings = conceptLessons.map((trace, index) => resolveReasonedMediaGeometry({
    source: conceptSource, trace, job: conceptMediaJobs[index],
  }));
  const questionScenePlans = batch.items.map((source, index) => createReasonedScenePlan({
    source, trace: questionTraces[index], job: questionMediaJobs[index],
  }));
  const conceptScenePlans = conceptLessons.map((trace, index) => createReasonedScenePlan({
    source: conceptSource, trace, job: conceptMediaJobs[index],
  }));
  const practiceRequest = {
    count: 6, seed: 'lesson-mixed-v1', scope: { grade: null, programVersion: null },
    exampleFamily: 'perimeter', difficultyProfile: { introductory: 50, intermediate: 50, advanced: 0, challenge: 0 },
    quotas: { skills: [], families: [], formats: [] },
  };
  const reviewPlan = createMixedPracticePlan({ lesson: conceptSource, candidates: batch.items, request: practiceRequest });
  const exampleProfileAudit = createMixedPracticePlan({ lesson: conceptSource, candidates: batch.items, request: {
    ...practiceRequest, count: 10, seed: 'lesson-example-profile-v1',
    difficultyProfile: { introductory: 10, intermediate: 30, advanced: 30, challenge: 30 },
  } });
  const report = {
    schemaVersion: 'content-factory-pilot-report/v1', ...batch,
    providerStatus: { generator: 'deterministic_math_pilot', clef: 'not_invoked', livePaidCalls: 0, studentDataTransferred: false },
    storyboards: batch.items.map(createStoryboard), lessons: batch.items.map(createLesson),
    reasonedTeaching: {
      schemaVersion: 'reasoned-factory-review/v1', questionTraces, conceptLessons,
      conceptSource,
      questionAudits: questionTraces.map(auditReasonedTeachingTrace),
      conceptAudits: conceptLessons.map(auditReasonedTeachingTrace),
      summary: { reasonedQuestionDrafts: questionTraces.length, reasonedConceptDrafts: conceptLessons.length, expertApproved: 0, published: 0, liveProviderCalls: 0 },
    },
    mediaPreparation: {
      schemaVersion: 'reasoned-factory-media-preparation/v1', questionJobs: questionMediaJobs, conceptJobs: conceptMediaJobs,
      audits: [...questionMediaJobs, ...conceptMediaJobs].map(job => auditReasonedMediaJob(job)),
      audioAttached: false, videoAttached: false, liveProviderCalls: 0,
    },
    geometryPreparation: {
      schemaVersion: 'reasoned-factory-geometry-preparation/v1',
      questionBindings: questionGeometryBindings, conceptBindings: conceptGeometryBindings,
      rendererBound: false, audioAttached: false, videoAttached: false,
      liveProviderCalls: 0, publicationReady: false, learnerReady: false, productionReady: false,
    },
    scenePreparation: {
      schemaVersion: 'reasoned-factory-scene-preparation/v1',
      questionPlans: questionScenePlans, conceptPlans: conceptScenePlans,
      audioAttached: false, videoAttached: false, liveProviderCalls: 0,
      publicationReady: false, learnerReady: false, productionReady: false,
    },
    practicePreparation: {
      schemaVersion: 'lesson-mixed-practice-preparation/v1', reviewPlan, exampleProfileAudit,
      liveProviderCalls: 0, publicationReady: false, learnerReady: false, productionReady: false,
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
