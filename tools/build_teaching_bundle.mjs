#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join, parse, resolve, sep } from 'node:path';
import { createGardenQuestion, validateQuestion } from '../packages/content-factory/pilot.mjs';
import { createPerimeterLesson } from '../packages/content-factory/perimeter_lesson.mjs';
import { createInkPlan } from '../packages/media/ink_timeline.mjs';

const sha256 = text => createHash('sha256').update(text).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

async function freshOutput(argv) {
  if (argv.length !== 2 || argv[0] !== '--out') throw new Error('usage: node tools/build_teaching_bundle.mjs --out ABSOLUTE_FRESH_DIRECTORY');
  const raw = argv[1];
  if (!isAbsolute(raw)) throw new Error('absolute_output_directory_required');
  const parts = raw.slice(parse(raw).root.length).split(sep).filter(Boolean);
  if (parts.some(part => part === '.' || part === '..')) throw new Error('canonical_absolute_output_directory_required');
  let current = parse(raw).root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    let info;
    try { info = await lstat(current); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      if (index !== parts.length - 1) throw new Error('output_parent_directory_must_exist');
      continue;
    }
    if (info.isSymbolicLink()) throw new Error('symlink_output_path_not_allowed');
    if (index === parts.length - 1) throw new Error('output_directory_must_be_fresh');
    if (!info.isDirectory()) throw new Error('output_parent_directory_must_exist');
  }
  if (!parts.length) throw new Error('output_directory_must_be_fresh');
  return resolve(raw);
}

function curriculumCandidates(question, lesson) {
  const candidate = (grade, outcomeCode, pdfPage, applicationPages, relationship) => ({ grade, outcomeCode, pdfPage, applicationPages, relationship, coverage: 'partial', reviewStatus: 'expert_pending' });
  return {
    schemaVersion: 'teaching-curriculum-candidates/v1', schoolYear: '2026-2027', status: 'expert_pending',
    source: {
      registryEntryId: 'tymm-current-ortaokul-matematik',
      programVersion: 'TYMM-catalog-snapshot-2026-10-03-2026', editionYear: 2026,
      title: 'Ortaokul Matematik Dersi Öğretim Programı (5, 6, 7 ve 8. Sınıflar)',
      pdfUrl: 'https://tymm.meb.gov.tr/assets/pdf/ortaokul-matematik-dersi_20260902_111111_630.pdf',
      sha256: '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734',
      evidence: 'existing_archived_pdf_pages_and_live_official_catalog_checked_2026-10-03',
      usagePolicy: 'reference_only', reuseRights: 'unverified',
    },
    applicability: {
      schoolYear: '2026-2027', tymmGrades: [1, 2, 3, 5, 6, 7],
      officialNoticeUrl: 'https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316',
      officialPlanPage: 'https://tymm.meb.gov.tr/taslak-cerceve-planlari/temel-egitim',
      noticeDate: '2026-09-03',
    },
    question: {
      contentId: question.id, gradeCandidate: 6,
      description: 'Özgün 3/2 katı ifadesi kesir işlemi gerektirir. Çevre modeli 5. sınıf ön öğrenmesidir; bu soru 6. sınıfın yeni geometri çıktısı olarak etiketlenmez.',
      candidates: [candidate(6, 'MAT.6.1.7', 74, [77, 78], 'Gerçek yaşamda doğal sayı ile 1’den büyük kesrin çarpımı ve çok adımlı çözüm.')],
      prerequisites: [
        candidate(5, 'MAT.5.4.4', 51, [54], 'Dikdörtgen çevresi, kapı boşluğu ve şekilden matematiksel ilişkilere geçiş; alan kısmını ölçmez.'),
        candidate(5, 'MAT.5.1.2', 21, [23], 'Doğal sayılı işlemlerle kapı açıklığını çıkarma ve iki sıra teli hesaplama.'),
        candidate(5, 'MAT.5.2.2', 33, [36], 'Doğal sayılı işlem önceliği ve parantezli çevre hesabı.'),
      ],
    },
    lesson: {
      contentId: lesson.id, gradeCandidate: 5,
      candidates: [
        candidate(5, 'MAT.5.4.2', 51, [53], '6×4 modelinde 24 birim kare ile alanı ve iki kenarın çarpımını ilişkilendirme.'),
        candidate(5, 'MAT.5.4.3', 51, [53], 'Alanları 24 cm² olan 6×4 ve 8×3 modellerin çevrelerini karşılaştırma; aynı çevre–farklı alan kolunu içermez.'),
      ],
      comparisonAreaLimit: { value: 36, unit: 'unit_square', pdfPage: 53 },
    },
    approval: { officialMebApproval: false, expertApproved: false, canonicalMappingResolved: false },
  };
}

function figure(visual) {
  // Only the fixed, locally authored exports above can supply SVG bytes.
  return `<figure>${visual.svg}<figcaption>${escape(visual.alt)}</figcaption></figure>`;
}

function preview(question, lesson, plan, audit) {
  const steps = question.solutionGraph.map(step => `<li><span class="equation">${escape(step.expression)} = ${escape(step.value)} ${escape(step.unit)}</span><p>${escape(step.narration)}</p></li>`).join('');
  const choices = question.options.map((value, index) => `<span>${String.fromCharCode(65 + index)} · ${escape(value)} ${escape(question.answerUnit)}</span>`).join('');
  const activities = lesson.activities.map(activity => `<li><p>${escape(activity.instruction)}</p></li>`).join('');
  const checks = lesson.formativeQuestions.map(item => `<details><summary>${escape(item.prompt)}</summary><p class="equation">${escape(item.answer.value)} ${escape(item.answer.unit)}</p><p>${escape(item.feedback)}</p></details>`).join('');
  const cues = plan.segments.map(segment => `<li><span class="tag">${escape(segment.id)}</span> ${escape(segment.narration)}</li>`).join('');
  const pending = audit.pending.map(gate => `<li>${escape(gate)}</li>`).join('');
  const strategyDescriptions = {
    subtract_gate_once_after_two_rows: 'İki sıranın toplamından kapı boşluğunu yalnız bir kez çıkarma.',
    ignore_gate_gap: 'Kapı boşluğunu çıkarmadan iki sıranın tam çevresini toplama.',
    calculate_one_row_only: 'İki sıra yerine kapı boşluğu çıkarılmış tek sırayı hesaplama.',
  };
  const hypotheses = question.cognitiveIntent.distractorHypotheses.map(item => `<li data-strategy="${escape(item.strategy)}"><span class="equation">${escape(item.value)} ${escape(question.answerUnit)}</span><p>${escape(strategyDescriptions[item.strategy])}</p></li>`).join('');
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; img-src data:; media-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>Soru ve mini ders · İçerik editörü önizlemesi</title><style>
:root{color-scheme:light;--paper:#f6f1e7;--chalk:#fffdf6;--teal:#174e49;--ink:#233b37;--line:#cbd5cd;--muted:#56736b;--clay:#ae522f}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 system-ui,sans-serif}header{background:var(--teal);color:var(--chalk);padding:42px max(22px,calc((100vw - 1120px)/2))}h1,h2,h3{font-family:Georgia,serif;font-weight:400;line-height:1.25}h1{font-size:clamp(32px,5vw,54px);max-width:850px;margin:14px 0}h2{font-size:clamp(28px,4vw,38px);margin:0 0 20px}h3{font-size:23px}.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase}.badge{display:inline-block;border:1px solid #8ab5a7;padding:7px 14px;border-radius:99px;font-size:13px}header p{max-width:820px}nav{display:flex;gap:24px;flex-wrap:wrap;margin-top:24px}a{color:inherit}main{max-width:1120px;margin:36px auto;padding:0 22px}article{background:var(--chalk);padding:clamp(22px,4vw,42px);border:1px solid var(--line);border-radius:18px;margin:26px 0}.intro{font-size:19px;line-height:1.6}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}figure{margin:0 0 24px}svg{display:block;max-width:100%;width:100%;height:auto}figcaption{font-size:13px;color:var(--muted);margin-top:12px}.choices{display:flex;gap:12px;flex-wrap:wrap}.choices span{padding:8px 14px;border:1px solid var(--line);border-radius:7px}.equation{font:clamp(21px,3vw,29px)/1.4 Georgia,serif;color:var(--teal)}.result{background:#e8f0e7;border-left:4px solid var(--teal);padding:16px 20px}.note{border-left:3px solid var(--clay);padding-left:16px;font-size:14px}.steps{padding-left:24px}.steps li{padding:8px 0}.steps p{margin:5px 0}.tag{font-size:12px;color:var(--muted)}details{border-top:1px solid var(--line);padding:18px 0;margin-top:12px}summary{cursor:pointer;font-weight:600}a:focus-visible,summary:focus-visible{outline:3px solid var(--clay);outline-offset:5px}.concept{background:#eef3ea;padding:18px 22px;border-radius:10px}.concept p{margin:5px 0}footer{font-size:14px;color:var(--muted);padding:16px 0 40px}.gate-list{overflow-wrap:anywhere}@media(max-width:760px){header{padding:30px 22px}.grid{grid-template-columns:1fr}main{margin:24px auto}article{border-radius:12px}.intro{font-size:17px}}
</style></head><body><header><div class="eyebrow">İçerik editörü önizlemesi · öğrencilere kapalı</div><h1>Bir soruyu çöz.<br>Bir kavramı görünür kıl.</h1><span class="badge">Özgün taslak · uzman incelemesi bekliyor</span><p>Bahçenin tel hesabı ile çevre–alan mini dersi ayrı içeriklerdir. Sayısal kontrol, müfredat eşlemesi veya yayın onayı değildir.</p><nav aria-label="Önizleme bölümleri"><a href="#question">Soru</a><a href="#lesson">Çevre mi alan mı?</a><a href="#review">İnceleme durumu</a></nav></header><main>
<article id="question" aria-labelledby="question-heading"><div class="eyebrow">01 · Özgün bahçe problemi</div><h2 id="question-heading">Soru</h2><p class="intro">${escape(question.prompt)}</p>${figure(question.visual)}<div class="choices" aria-label="Cevap seçenekleri">${choices}</div><details open><summary>Editör için çözüm</summary><ol class="steps">${steps}</ol><p class="result"><span class="equation">172 m</span> · İki tel sırasında da 4 m kapı boşluğu bırakılır.</p></details><details><summary>Alternatif çözüm stratejileri</summary><p>Bu olası stratejiler yazar varsayımlarıdır; öğrenci teşhisi değildir. Tek bir seçenek, çocuğun neden o cevabı verdiğini kanıtlamaz.</p><ul class="steps">${hypotheses}</ul></details><p class="note">Kesir işlemi için 6. sınıf MAT.6.1.7 adaydır. Dikdörtgen çevresi 5. sınıf ön öğrenmesidir. Eşleme kısmi kapsamlıdır ve uzman onayı bekler.</p></article>
<article id="lesson" aria-labelledby="lesson-heading"><div class="eyebrow">02 · Ayrı mini ders</div><h2 id="lesson-heading">Çevre mi alan mı?</h2><div class="grid"><div>${figure(lesson.visuals[0])}</div><div><div class="concept"><h3>Kenar mı, iç bölge mi?</h3><p>${escape(lesson.concept.perimeter)}</p><p>${escape(lesson.concept.area)}</p></div><ol class="steps">${activities}</ol><p class="equation">${escape(lesson.workedExample.perimeter.expression)} = 20 cm</p><p class="equation">${escape(lesson.workedExample.area.expression)} = 24 cm²</p><p>${escape(lesson.workedExample.explanation)}</p></div></div><h3>Aynı alan, farklı çevre</h3><p>${escape(lesson.misconception.explanation)}</p>${figure(lesson.visuals[1])}<h3>Kısa kontrol</h3>${checks}<p class="note">Öğretmen için: ${escape(lesson.teacherHint)}</p><p class="tag">5. sınıf MAT.5.4.2 / MAT.5.4.3 adayları · kısmi kapsam · uzman incelemesi bekliyor</p></article>
<article id="review" aria-labelledby="review-heading"><div class="eyebrow">03 · Taslak kaydı</div><h2 id="review-heading">İnceleme durumu</h2><p>İki özgün içerik taslağı hazırlandı. Clef çağrılmadı. Ücretli API veya model çağrısı yapılmadı.</p><p class="result">Ses: eklenmedi · Video: eklenmedi · Yayın: kapalı</p><p>Bu sayfa metin ve SVG önizlemesidir. Üretilen taslaklar uzman veya MEB onayı taşımaz.</p><details><summary>Bahçe seslendirme metni · altı kaynak bölüm</summary><ol class="steps">${cues}</ol></details><details><summary>Mini ders konuşma metni</summary><p>${escape(lesson.speechTranscript)}</p></details><details><summary>Açık kalite kapıları</summary><ul class="gate-list">${pending}</ul></details><p class="note">Öğrenci ve özel kişi verisi kullanılmadı. Zorluk düzeyi yazar tahminidir; öğrenci yeteneği veya zekâ ölçümü değildir.</p></article><footer>Yerel içerik editörü paketi · deterministik özgün pilot · öğrencilere kapalı</footer></main></body></html>\n`;
}

try {
  const out = await freshOutput(process.argv.slice(2));
  const question = createGardenQuestion({ id: 'garden-two-rows-editor-v1' });
  const lesson = createPerimeterLesson();
  const plan = createInkPlan();
  const planSha256 = sha256(JSON.stringify(plan));
  const questionReview = validateQuestion(question);
  if (questionReview.localMathChecks !== 'passed' || question.inkPlanSha256 !== planSha256) throw new Error('question_or_source_plan_validation_failed');
  const speech = {
    schemaVersion: 'teaching-speech-script/v1', status: 'draft_text_only',
    sourcePlan: { id: plan.id, filename: 'source-plan.json', sha256: planSha256 },
    segments: plan.segments.map(({ id, narration }) => ({ id, narration })),
    audioStatus: 'not_attached',
  };
  const curriculum = curriculumCandidates(question, lesson);
  const audit = {
    schemaVersion: 'teaching-bundle-audit/v1', state: 'draft', audience: 'content_editor_only', studentsAllowed: false,
    providerStatus: { generator: 'owned_deterministic_pilot', clef: 'not_invoked', livePaidCalls: 0, modelCalls: 0 },
    sourcePlanSha256: planSha256,
    source: { rightsStatus: 'owned_original', externalSourceContentUsed: false, containsStudentData: false, containsPrivateData: false },
    generatedDrafts: 2, generatedDraftsAreApproval: false, questionReview,
    lessonReview: { ...lesson.review, publishReady: lesson.publishReady },
    audio: { status: 'not_attached' }, video: { status: 'not_attached' },
    publicationGate: { state: 'closed', expertApproved: false, officialMebApproved: false },
    pending: [...new Set([...questionReview.pending, ...lesson.pending, 'teacher_voice_audio_review', 'media_synchronization_review'])],
  };
  const files = {
    'question.json': json(question), 'lesson.json': json(lesson), 'source-plan.json': json(plan),
    'speech-script.json': json(speech), 'curriculum-candidates.json': json(curriculum),
    'audit.json': json(audit), 'editor-review.html': preview(question, lesson, plan, audit),
  };
  files['bundle-manifest.json'] = json({
    schemaVersion: 'teaching-bundle-manifest/v1', state: 'draft', sourcePlanSha256: planSha256,
    files: Object.entries(files).map(([name, bytes]) => ({ name, sha256: sha256(bytes), byteLength: Buffer.byteLength(bytes) })),
    mediaAttached: false, studentsAllowed: false,
  });
  try { await mkdir(out, { mode: 0o700 }); } catch (error) {
    if (error.code === 'EEXIST') throw new Error('output_directory_must_be_fresh');
    throw error;
  }
  for (const [name, bytes] of Object.entries(files)) await writeFile(join(out, name), bytes, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ out, files: Object.keys(files).length, state: 'draft', publishReady: false }));
} catch (error) {
  console.error(error?.message ?? 'teaching_bundle_failed');
  process.exitCode = 1;
}
