import { createHash } from 'node:crypto';
import { createGrade6NumberLessonReview } from './grade6_number_lesson_review.mjs';

// A closed, answer-bearing editorial consumer. Caller packets, prose, answers,
// approvals and difficulty overrides never reach the HTML sink.
const fail = code => { throw new Error(code); };
const escape = value => {
  if (!['string', 'number', 'boolean'].includes(typeof value)) fail('invalid_number_lesson_editor_input');
  return String(value).replace(/[&<>"']/gu, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
};
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
const pairText = values => values.map(value => Array.isArray(value) ? value.join(' × ') : value).join(Array.isArray(values[0]) ? '; ' : ', ');
const bands = { introductory:'Kolay', intermediate:'Orta', advanced:'Zor', challenge:'Çok zor' };
const units = { minute:'Dakika', card_per_package:'Kart/paket', package:'Paket' };
const STYLE = `
:root{color-scheme:light;color:#203b42;background:#f5f3ed;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box}body{margin:0;font-size:18px;line-height:1.65}main{max-width:1120px;margin:auto;padding:28px 20px 60px}
h1,h2,h3,p{margin:0 0 16px}h1{font-size:clamp(30px,4vw,44px);line-height:1.2;letter-spacing:-.025em}h2{font-size:28px;line-height:1.3}h3{font-size:21px;line-height:1.4}
header{padding:34px;border-radius:24px;background:#153e45;color:#fff}.eyebrow{color:#b8e0d5;font-weight:650}.counts{font-weight:650}
nav{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0}nav a{display:block;padding:10px 16px;border-radius:12px;border:1px solid #96aca7;color:#173f39;background:white;text-decoration:none;font-weight:650}
a:focus-visible,summary:focus-visible{outline:3px solid #a35129;outline-offset:4px}aside{padding:22px;background:#fff5df;border:1px solid #d4b989;border-radius:16px;margin:24px 0}
.stage{margin:40px 0;scroll-margin-top:24px}.section-number{color:#48716b;font-weight:650;font-size:16px}.concepts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.concept,.task{min-width:0;padding:24px;border:1px solid #b8c8c3;border-radius:18px;background:#fff}.task{margin:20px 0}.shortcut{padding:16px;border-left:4px solid #46796a;background:#edf5f0;border-radius:0 10px 10px 0}
.shortcut p:last-child,aside p:last-child{margin-bottom:0}.lineage{font-size:14px;overflow-wrap:anywhere;color:#49645f}.cards{display:flex;gap:10px;flex-wrap:wrap;padding:0;list-style:none}.cards li{min-width:56px;border:1px solid #9db7ac;background:#f0f6f3;border-radius:12px;padding:10px;text-align:center;font-weight:650}
.boards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.board{border:1px solid #ccd6ce;border-radius:12px;padding:16px;min-width:0}.board h3{margin-bottom:10px}
table{border-collapse:collapse;table-layout:fixed;width:100%;font-variant-numeric:tabular-nums;margin:16px 0}caption{text-align:left;font-weight:650;padding:8px 0}
th,td{padding:10px 5px;border-bottom:1px solid #d4dfd8;text-align:left;overflow-wrap:anywhere}thead th{background:#edf3ee}
.status{display:inline-block;padding:6px 12px;background:#fff0d1;border-radius:10px;font-size:16px;font-weight:650}.quota{padding:24px;background:#eef2ee;border-radius:16px}
details{margin-top:24px;border:1px solid #9ab7aa;border-radius:12px;overflow:hidden}summary{padding:18px;background:#e7f1ea;cursor:pointer;font-weight:650}.solution{padding:22px}.solution h3{margin-top:24px}.solution li{margin-bottom:12px}.result{font-weight:650;color:#19533d}.answer{padding:16px;background:#e7f1ea;border-radius:10px}
footer{padding-top:24px;border-top:1px solid #bacbc1;color:#49645f}svg{display:block;width:100%;height:auto}figcaption{font-size:16px}figure{margin:18px 0}
.timeline-window{max-width:100%;overflow-x:auto}.timeline-window svg{width:588px;max-width:none}.timeline-window:focus-visible{outline:3px solid #a35129;outline-offset:4px}
@media(max-width:900px){.concepts{grid-template-columns:1fr}}@media(max-width:600px){main{padding:20px 12px 40px}header{padding:24px}.concept,.task,.quota,.solution{padding:18px}.boards{grid-template-columns:1fr}h2{font-size:25px}th,td{padding:8px 3px}}
`;

function shortcutHtml(s) {
  return `<div class="shortcut"><h3>Pratik bilgi ve püf nokta</h3><p><strong>Ne zaman?</strong> ${escape(s.worksWhen)}</p><p>${escape(s.why)}</p><p><strong>Kontrol:</strong> ${escape(s.check)}</p><p><strong>Sınır:</strong> ${escape(s.notImplied)}</p></div>`;
}
function sourceHtml(row) {
  return `<p class="lineage" data-source-id="${escape(row.source.id)}" data-source-revision="${escape(row.source.contentSha256)}">Kaynak görev: ${escape(row.source.id)}<br>Revizyon: ${escape(row.source.contentSha256)}<br>Önerilen çıktı bağı: ${escape(row.draft.scope.proposedOutcomeCodes.join(' · '))} · Etkin yıl ve program kabulü bekliyor.</p>`;
}
function workedHtml(row) {
  const d = row.draft, e = d.explanation;
  return `<article class="task" data-worked-family="${escape(row.family)}"><h3>${escape(d.title)}</h3><p>${escape(d.prompt)}</p>
<ul class="cards" aria-label="Bölünebilme kartları">${d.problem.cards.map(card=>`<li>${escape(card.value)}</li>`).join('')}</ul>
${list(d.problem.categories.map(value=>value.label))}
<p class="lineage">Örnek zorluğu: Orta · Yazar tahmini; öğrenci verisiyle kalibre edilmedi. Alıştırma kotasına sayılmaz.</p>
<details data-answer-source="${escape(row.source.id)}" data-answer-revision="${escape(row.source.contentSha256)}"><summary>Örneğin gerekçeli çözümünü aç</summary><div class="solution">
<h3>Ne isteniyor?</h3><p>${escape(e.goal)}</p><h3>Verilenler neyi anlatıyor?</h3><p>${escape(e.givenMeaning)}</p>
<h3>Neden bu yol?</h3><p>${escape(e.route)}</p><p>${escape(e.because)}</p>${list(e.conditions)}
<ol>${row.reasonedTrace.steps.map(step=>`<li><p>${escape(step.why)}</p><p class="result">${escape(step.result.value)}</p><p>${escape(step.result.meaning)}</p><p>${escape(step.check.prompt)} ${escape(step.check.answer)}</p></li>`).join('')}</ol>
${shortcutHtml(e.conditionalShortcut)}<p class="lineage">Yanıtlar ayrı matematik denetimiyle doğrulandı. Gerekçeli iz denetimi metin yapısını kontrol eder; sayısal doğrulama veya pedagojik kabul yerine geçmez.</p>
</div></details>${sourceHtml(row)}</article>`;
}
function factorHtml(row) {
  const d = row.draft, e = d.explanation;
  return `<article class="task" data-practice-family="${escape(row.family)}"><p class="section-number">Alıştırma 1 · Kanıt denetimi</p><h3>36 için dört kanıt panosu</h3><p>${escape(d.prompt)}</p><p class="status">Zorluk atanmadı</p>
<div class="boards">${d.problem.boards.map((board,index)=>`<section class="board"><h3>Pano ${index+1}</h3><table><caption>Verilmiş çarpan çiftleri</caption><thead><tr><th scope="col">Küçük çarpan</th><th scope="col">Büyük çarpan</th><th scope="col">Çarpım</th></tr></thead><tbody>${board.factorPairs.map(([a,b])=>`<tr><th scope="row">${escape(a)}</th><td>${escape(b)}</td><td>${escape(a*b)}</td></tr>`).join('')}</tbody></table><p>Asal rozetler: ${escape(board.primeBadges.join(', '))}</p><p>Rozet toplamı: ${escape(board.primeBadgeSum)}</p></section>`).join('')}</div>
<details data-answer-source="${escape(row.source.id)}" data-answer-revision="${escape(row.source.contentSha256)}"><summary>Alıştırma 1: Çözümü ve kanıtı aç</summary><div class="solution">
<h3>Ne isteniyor?</h3><p>${escape(e.goal)}</p><h3>Verilenler neyi anlatıyor?</h3><p>${escape(e.givenMeaning)}</p><h3>Neden bu yol?</h3><p>${escape(e.because)}</p>${list(e.conditions)}
<ol>${e.steps.map(step=>`<li><p>${escape(step.why)}</p><p class="result">${escape(Array.isArray(step.result)?pairText(step.result):step.result)}</p><p>${escape(step.meaning)}</p></li>`).join('')}</ol>
${shortcutHtml(e.conditionalShortcut)}<p class="answer">Doğru pano: ${escape(d.problem.boards.findIndex(board=>board.id===d.answerKey.boardId)+1)}. Tam çift listesi, farklı asal rozetler ve toplam birlikte sağlanmalı.</p><p>${escape(e.transfer.meaning)}</p></div></details>${sourceHtml(row)}</article>`;
}
function commonHtml(row) {
  const d = row.draft, [repeat,grouping] = d.problem.contexts;
  const x = minute=>30+minute*11;
  const timeline = d.representation.repeatSequences.map((marks,index)=>`<g><text x="12" y="${26+index*65}" font-size="18" fill="#203b42">${escape(repeat.intervals[index])} dk</text><line x1="30" y1="${46+index*65}" x2="558" y2="${46+index*65}" stroke="#9fb5ab"/>${marks.map(minute=>`${index?`<rect x="${x(minute)-5}" y="${106}" width="10" height="10" data-series="eight-minute" fill="#96552e"/>`:`<circle cx="${x(minute)}" cy="46" r="5" data-series="six-minute" fill="#19533d"/>`}<text x="${x(minute)}" y="${68+index*65}" text-anchor="middle" font-size="18" fill="#203b42">${escape(minute)}</text>`).join('')}</g>`).join('');
  return `<article class="task" data-practice-family="${escape(row.family)}"><p class="section-number">Alıştırma 2 · Bağlam ve birim</p><h3>Zaman mı, paket boyutu mu?</h3><p>${escape(d.prompt)}</p><p class="status">Zorluk atanmadı</p>
<h3>${escape(repeat.title)}</h3><p>${escape(repeat.statement)}</p><figure><div class="timeline-window" role="region" tabindex="0" aria-label="Zaman şeridi; dar ekranda yatay kaydırılabilir"><svg viewBox="0 0 588 150" role="img" aria-labelledby="number-repeat-title number-repeat-description"><title id="number-repeat-title">İki döngünün zaman işaretleri</title><desc id="number-repeat-description">6 ve 8 dakikalık döngüler ayrı satırlarda. Başlangıç hariç, 48 dakika dahil. Aynı değerler aşağıdaki tabloda.</desc>${timeline}</svg></div><figcaption>6 dakikalık döngü: daire. 8 dakikalık döngü: kare. 0 dakika ortak başlangıçtır ve istenen aralık dışındadır; 48 dakika aralığa dahildir. Dar ekranda şeridi kaydırabilir veya metin tablosunu kullanabilirsin.</figcaption></figure>
<table><caption>Zaman şeridinin metin eşdeğeri</caption><thead><tr><th scope="col">Döngü</th><th scope="col">Pozitif zaman işaretleri (dakika)</th></tr></thead><tbody>${d.representation.repeatSequences.map((marks,index)=>`<tr><th scope="row">${escape(repeat.intervals[index])} dk</th><td>${escape(marks.join(', '))}</td></tr>`).join('')}</tbody></table>
<h3>${escape(grouping.title)}</h3><p>${escape(grouping.statement)}</p><table><caption>Ortak boyut ve paket sayısı farklı niceliklerdir</caption><thead><tr><th scope="col">Kart/paket</th><th scope="col">24 kartın paket sayısı</th><th scope="col">36 kartın paket sayısı</th></tr></thead><tbody>${d.representation.groupRows.map(r=>`<tr><th scope="row">${escape(r.size)}</th><td>${escape(r.packageCounts[0])}</td><td>${escape(r.packageCounts[1])}</td></tr>`).join('')}</tbody></table>
<h3>Dört verilmiş kanıt kartı</h3>${list(d.problem.evidenceCards.map(card=>`${card.label}: ${card.values.join(', ')} · ${units[card.unit]}`))}
<details data-answer-source="${escape(row.source.id)}" data-answer-revision="${escape(row.source.contentSha256)}"><summary>Alıştırma 2: Çözümü ve eşlemeyi aç</summary><div class="solution">
${d.explanation.paths.map(path=>`<h3>Ne isteniyor?</h3><p>${escape(path.goal)}</p><h3>Verilenler neyi anlatıyor?</h3><p>${escape(path.givenMeaning)}</p><h3>Neden bu yol?</h3><p>${escape(path.why)}</p><p>${escape(path.operationMeaning)}</p><p class="result">${escape(path.result.join(', '))} · ${escape(units[path.unit])}</p><p>${escape(path.resultMeaning)}</p><h3>Pratik bilgi ve püf nokta</h3>${list(Object.values(path.conditionalNote))}`).join('')}
<div class="answer">${list(Object.entries(d.answerKey).map(([context,card])=>`${d.problem.contexts.find(c=>c.id===context).title} → ${d.problem.evidenceCards.find(c=>c.id===card).label}`))}</div>
${list(d.explanation.transfers.map(t=>t.meaning))}<p>Bu görev verilmiş kanıtı eşlemektir; en küçük ortak kat veya en büyük ortak bölen algoritması öğretmez.</p></div></details>${sourceHtml(row)}</article>`;
}

export function renderGrade6NumberLessonEditorView(input) {
  if(arguments.length!==1) fail('invalid_number_lesson_editor_arguments');
  let review;
  try { review=createGrade6NumberLessonReview(input); } catch { fail('invalid_number_lesson_editor_input'); }
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; img-src 'none'; media-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>Sayı atölyesi · Konu, örnek, alıştırma</title><style>${STYLE}</style></head><body><main>
<header><p class="eyebrow">Sayı atölyesi · Editör incelemesi</p><h1>Önce anlamı bul,<br>sonra yolu seç.</h1><p>6. sınıf matematik adayı · Etkin yıl ve program bağı kabul edilmedi</p><p class="counts">1 mini ders · 1 örnek · 2 farklı alıştırma · 0 yeni soru</p></header>
<nav aria-label="Ders aşamaları"><a href="#concepts">01 · Konuyu anla</a><a href="#worked-example">02 · Bir örneği incele</a><a href="#practice">03 · Farklı yolları dene</a></nav>
<aside aria-label="İnceleme sınırları"><p>Bu belge yanıt içeren editör incelemesidir; öğrenci teslimi veya kimlik doğrulanmış sınav değildir. Kapalı çözümler cevap güvenliği sağlamaz.</p><p>Üç mevcut taslak tekrar kullanıldı; mini ders yeni bir türevdir. Kabul edilmiş ve yayımlanmış soru: 0.</p></aside>
<section id="concepts" class="stage" aria-labelledby="concepts-title"><p class="section-number">01 · Konu anlatımı</p><h2 id="concepts-title">${escape(review.lesson.title)}</h2><p>${escape(review.lesson.purpose)}</p><div class="concepts">${review.lesson.concepts.map(c=>`<article class="concept"><h3>${escape(c.title)}</h3><p>${escape(c.statement)}</p>${shortcutHtml(c.conditionalShortcut)}<p class="lineage">Kaynak görev: ${escape(c.sourceReferences[0].draftId)}<br>Önerilen çıktı: ${escape(c.sourceReferences[0].proposedOutcomeCodes.join(' · '))}</p></article>`).join('')}</div></section>
<section id="worked-example" class="stage" aria-labelledby="worked-title"><p class="section-number">02 · Tek örnek</p><h2 id="worked-title">İki koşul, tek karar</h2><p>Aynı soru biçimini üst üste tekrar etmek yerine gerekçeli bir örneği incele.</p>${workedHtml(review.workedExample)}</section>
<section id="practice" class="stage" aria-labelledby="practice-title"><p class="section-number">03 · Karışık alıştırma adayı</p><h2 id="practice-title">Şimdi farklı becerilerle dene</h2><div class="quota"><h3>10 soruluk hedef, 2 mevcut farklı görev</h3><p>8 soru eksik. İki alıştırmanın zorluğu atanmadığından hiçbir banda kredi verilmedi; hedef dağılım henüz sağlanmıyor.</p><table><caption>Önerilen dağılım · Ölçülmüş kaynak dağılımı veya yaş politikası değildir</caption><thead><tr><th scope="col">Zorluk</th><th scope="col">Hedef</th><th scope="col">Atanmış</th><th scope="col">Eksik</th></tr></thead><tbody>${review.quotaReport.difficulty.map(r=>`<tr data-difficulty-band="${escape(r.id)}"><th scope="row">${escape(bands[r.id])}</th><td>${escape(r.requested)}</td><td>${escape(r.selected)}</td><td>${escape(r.missing)}</td></tr>`).join('')}</tbody></table></div>${factorHtml(review.selectedQuestions[0])}${commonHtml(review.selectedQuestions[1])}</section>
<footer><p>Yerel matematik kontrolleri geçti. Dersin pedagojik kabulü, her görevin etkin program bağı, haklar, zorluk ve erişilebilirlik incelemesi bekliyor. Ses, video veya yeni soru üretimi yapılmadı.</p><p class="lineage">Ders revizyonu: ${escape(review.lesson.contentSha256)}<br>Akış revizyonu: ${escape(review.contentSha256)}</p></footer></main></body></html>`;
  const htmlBytes=Buffer.byteLength(html);
  if(htmlBytes>131072) fail('number_lesson_editor_output_budget');
  const manifest={schemaVersion:'grade6-number-lesson-editor-view-manifest/v1',state:'partial_editor_sequence',
    reviewContentSha256:review.contentSha256,lessonContentSha256:review.lesson.contentSha256,
    htmlSha256:createHash('sha256').update(html).digest('hex'),htmlBytes,
    newAuthoredQuestions:0,existingDraftsReused:3,newLessonDerivatives:1,publishedQuestions:0,
    practice:{requestedCount:10,selectedCount:2,missingCount:8,difficultyUnassignedCount:2,selectionReady:false,dataMeasured:false},
    providerCallsMade:0,audioGenerated:false,videoRendered:false,hiddenDetailsAreLearnerSecurity:false,
    answerBearingEditorArtifact:true,closedAnswerSections:3,inlineSvgCount:1,
    activeAcademicYear:null,programVersion:null,officialOutcomeCode:null,
    learnerReady:false,publicationReady:false,productionReady:false,nativeVisualReviewPassed:false,
    accessibilityPassed:false,serializedHashIsAuthority:false};
  return freeze({html,manifest});
}
