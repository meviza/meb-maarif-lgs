import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsDraft, verifyGrade6CommonRelationsDraft } from './grade6_common_relations_draft.mjs';

// A single answer-bearing editor document, not a learner/auth/media-delivery API.
const fail = code => { throw new Error(code); };
const escape = value => String(value).replace(/[&<>"']/gu, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const units = { minute: 'Dakika', card_per_package: 'Kart/paket', package: 'Paket' };
const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
const labels = { activeProgram: 'Etkin program', pedagogy: 'Pedagoji', rights: 'Haklar', difficulty: 'Zorluk', answer: 'Uzman yanıt incelemesi', accessibility: 'Erişilebilirlik' };

const STYLE = `
:root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #183342; background: #f3f6f7; }
* { box-sizing: border-box; }
body { margin: 0; font-size: 18px; line-height: 1.6; }
main { max-width: 1200px; margin: 0 auto; padding: 24px 16px 48px; }
h1, h2, h3, p { margin: 0 0 16px; }
h1 { font-size: clamp(28px, 4vw, 40px); line-height: 1.2; letter-spacing: -0.025em; }
h2 { font-size: 25px; line-height: 1.35; } h3 { font-size: 22px; line-height: 1.4; }
header { padding: 24px; border-radius: 20px; background: #183342; color: #fff; }
header p:last-child { margin-bottom: 0; } .eyebrow { font-weight: 650; color: #bcdfdf; } .counts { font-weight: 650; }
aside { margin: 20px 0; padding: 20px 24px; background: #fff7e8; border: 1px solid #ead1a4; border-radius: 16px; }
aside p:last-child { margin-bottom: 0; }
.task, .context { margin: 24px 0; padding: 24px; border: 1px solid #cbd8dd; border-radius: 16px; background: #fff; min-width: 0; }
figure { margin: 20px 0; min-width: 0; max-width: 100%; }
.timeline-scroll { width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; border: 1px solid #b6cbd0; border-radius: 12px; background: #f6fafb; }
.timeline-scroll:focus-visible { outline: 3px solid #23596a; outline-offset: 3px; }
.timeline-svg { display: block; width: 760px; height: 240px; max-width: none; }
figcaption { margin-top: 12px; } .boundary { font-weight: 650; }
table { border-collapse: collapse; table-layout: fixed; width: 100%; font-variant-numeric: tabular-nums; }
caption { text-align: left; font-weight: 650; padding: 12px 0; }
th, td { border-bottom: 1px solid #dce5e8; padding: 10px 6px; text-align: center; overflow-wrap: anywhere; }
thead th { background: #edf4f5; font-weight: 650; } tbody th { font-weight: 500; }
.repeat-table th { width: 25%; } .repeat-table td { text-align: left; }
.cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
.card { min-width: 0; padding: 22px; background: #fff; border: 1px solid #cbd8dd; border-top: 4px solid #3b737d; border-radius: 16px; }
.card output { display: block; padding: 12px 0; font-weight: 650; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.unit { margin-bottom: 0; color: #3f5865; }
details { margin-top: 28px; border: 1px solid #9cb9c1; border-radius: 16px; background: #fff; overflow: hidden; }
summary { padding: 20px 24px; font-weight: 650; cursor: pointer; background: #e8f0f2; }
summary:focus-visible { outline: 3px solid #23596a; outline-offset: -4px; }
.solution { padding: 24px; } .solution section { margin-bottom: 28px; } .solution section:last-child { margin-bottom: 0; }
.solution h3 { margin: 24px 0 8px; } .solution ul { padding-left: 28px; } .solution li { margin-bottom: 12px; }
[data-rationale-part="result"] { font-weight: 650; font-variant-numeric: tabular-nums; }
.answer { padding: 20px; background: #edf4f5; border-radius: 12px; }
footer { margin-top: 28px; color: #3f5865; } .lineage { overflow-wrap: anywhere; }
@media (min-width: 900px) { .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } main { padding: 40px 24px 64px; } }
@media (max-width: 480px) { header, aside, .task, .context, .card, .solution { padding: 18px; } summary { padding: 18px; } th, td { padding: 10px 3px; } }
`;

function timelineHtml(draft) {
  const [repeat] = draft.problem.contexts, rows = draft.representation.repeatSequences.map(values => [repeat.startMinute, ...values]);
  const inWindow = minute => minute > repeat.window.from && (minute < repeat.window.to || minute === repeat.window.to && repeat.window.toInclusive);
  const x = minute => 120 + minute * 12;
  const svgRows = rows.map((values, index) => {
    const y = index === 0 ? 70 : 138;
    const marks = values.map(minute => {
      const inside = inWindow(minute), color = index === 0 ? '#23596a' : '#87541d', fill = inside ? color : '#ffffff';
      const common = `data-series="${index === 0 ? 'six-minute' : 'eight-minute'}" data-minute="${escape(minute)}" data-in-window="${inside}" fill="${fill}" stroke="${color}" stroke-width="2"${inside ? '' : ' stroke-dasharray="3 2"'}`;
      const shape = index === 0 ? `<circle ${common} cx="${x(minute)}" cy="${y}" r="6"></circle>`
        : `<rect ${common} x="${x(minute) - 6}" y="${y - 6}" width="12" height="12"></rect>`;
      return `${shape}<text data-minute-label="${index}" x="${x(minute)}" y="${y + 34}" text-anchor="middle" font-size="18" fill="#183342">${escape(minute)}</text>`;
    }).join('');
    return `<g><line x1="120" y1="${y}" x2="696" y2="${y}" stroke="#b6cbd0" stroke-width="2"></line>
<text x="20" y="${y + 6}" font-size="18" fill="#183342">${escape(repeat.intervals[index])} dk</text>${marks}</g>`;
  }).join('');
  return `<figure><div class="timeline-scroll" role="region" tabindex="0" aria-label="Zaman şeridi; dar ekranda yatay kaydırılabilir">
<svg class="timeline-svg" xmlns="http://www.w3.org/2000/svg" width="760" height="240" viewBox="0 0 760 240" role="img" aria-labelledby="cr-timeline-title cr-timeline-desc">
<title id="cr-timeline-title">0–48 dakika: İki hikâye döngüsünün işaretleri</title>
<desc id="cr-timeline-desc">6 dakikalık döngü daire, 8 dakikalık döngü kare ile gösterilir. 0 ortak başlangıçtır ve istenen aralık dışındadır. 48 dakika dahil sınırdır. Aynı sayıların metin tablosu hemen aşağıdadır.</desc>
${svgRows}<line x1="120" y1="208" x2="696" y2="208" stroke="#647f8b" stroke-width="2"></line>
<text x="120" y="236" text-anchor="middle" font-size="18" fill="#183342">0</text><text x="408" y="236" text-anchor="middle" font-size="18" fill="#183342">Dakika</text><text x="696" y="236" text-anchor="middle" font-size="18" fill="#183342">48</text>
</svg></div><figcaption>6 dakikalık döngü: daire. 8 dakikalık döngü: kare. Şekil ve satır etiketi birlikte okunur. <span class="boundary">0 dakika başlangıçtır, aralığın dışındadır; 48 dakika aralığa dahildir.</span> Küçük ekranda şeridi kaydırabilir veya aşağıdaki metin tablosunu kullanabilirsin.</figcaption></figure>
<table class="repeat-table" id="repeat-equivalent-table"><caption>Zaman şeridinin metin eşdeğeri · Başlangıç hariç, 48 dahil</caption>
<thead><tr><th scope="col">Döngü süresi</th><th scope="col">Pozitif işaretler (dakika)</th></tr></thead>
<tbody>${draft.representation.repeatSequences.map((values, index) => `<tr><th scope="row">${escape(repeat.intervals[index])} dakika</th><td>${escape(values.join(', '))}</td></tr>`).join('')}</tbody></table>`;
}
function groupingHtml(draft) {
  return `<table id="group-size-table"><caption>Kalansız ortak boyutlar · Boyut ve paket sayısı farklı nicelikler</caption>
<thead><tr><th scope="col">Paket boyutu (kart/paket)</th><th scope="col">24 karakter kartı için paket sayısı</th><th scope="col">36 mekân kartı için paket sayısı</th></tr></thead>
<tbody>${draft.representation.groupRows.map(row => `<tr><th scope="row">${escape(row.size)}</th><td>${escape(row.packageCounts[0])}</td><td>${escape(row.packageCounts[1])}</td></tr>`).join('')}</tbody></table>`;
}
function cardsHtml(draft) {
  return `<section aria-labelledby="cards-heading"><h2 id="cards-heading">Dört verilmiş kanıt kartı</h2><div class="cards">${draft.problem.evidenceCards.map((card, index) => `<article class="card" data-card-id="${escape(card.id)}" aria-labelledby="${escape(card.id)}-heading">
<h3 id="${escape(card.id)}-heading">Kart ${index + 1} · ${escape(card.label)}</h3><output>${escape(card.values.join(', '))}</output><p class="unit" data-unit="${escape(card.unit)}">${escape(units[card.unit])}</p></article>`).join('')}</div></section>`;
}
function solutionHtml(draft) {
  const title = id => draft.problem.contexts.find(context => context.id === id).title;
  const cardName = id => draft.problem.evidenceCards.find(card => card.id === id).label;
  const path = value => `<section data-rationale-context="${escape(value.contextId)}"><h2>${escape(title(value.contextId))} · Gerekçeli yol</h2>
<h3>Ne isteniyor?</h3><p data-rationale-part="goal">${escape(value.goal)}</p>
<h3>Verilen değer neyi anlatıyor?</h3><p data-rationale-part="given">${escape(value.givenMeaning)}</p>
<h3>Neden bu ilişki?</h3><p data-rationale-part="why">${escape(value.why)}</p>
<h3>İşlem neyi modelliyor?</h3><p data-rationale-part="operation">${escape(value.operationMeaning)}</p>
<h3>Sonuç ve birim</h3><p data-rationale-part="result">${escape(value.result.join(', '))} · ${escape(units[value.unit])}</p><p data-rationale-part="meaning">${escape(value.resultMeaning)}</p>
<h3>Koşullu pratik kontrol</h3><p data-rationale-part="when">${escape(value.conditionalNote.when)}</p><p data-rationale-part="note-why">${escape(value.conditionalNote.why)}</p><p data-rationale-part="check">${escape(value.conditionalNote.check)}</p><p data-rationale-part="not-implied">${escape(value.conditionalNote.notImplied)}</p></section>`;
  const [sum, boundary, counts] = draft.explanation.transfers;
  return `<details><summary>Editör: Gerekçeli çözümü, aktarımı ve eşlemeyi aç</summary><div class="solution">
${draft.explanation.paths.map(path).join('')}
<section data-transfer-id="${escape(sum.id)}"><h2>Karşı örnek: Süreleri toplamak</h2><p>${escape(sum.candidateMinute)} dakika · İki kalan: ${escape(sum.remainders.join(', '))}</p><p>${escape(sum.meaning)}</p></section>
<section data-transfer-id="${escape(boundary.id)}"><h2>Aktarım: Ortaklık ve sınır ayrı koşullar</h2>${list(boundary.cases.map(value => `${value.minute} dakika · Ortak: ${value.common ? 'Evet' : 'Hayır'} · Aralıkta: ${value.inWindow ? 'Evet' : 'Hayır'}`))}<p>${escape(boundary.meaning)}</p></section>
<section data-transfer-id="${escape(counts.id)}"><h2>Aktarım: Boyut, paket sayısı değildir</h2><p>${escape(counts.groupSize)} kart/paket · Paket sayıları: ${escape(counts.packageCounts.join(', '))}</p><p>${escape(counts.meaning)}</p></section>
<section class="answer" data-editor-answer="true"><h2>Editör eşlemesi</h2>${list(Object.entries(draft.answerKey).map(([context, card]) => `${title(context)} → ${cardName(card)}`))}<p>Bu eşleme verilmiş kanıtın tanınmasıdır; öğrencinin kendi listesini kurduğu veya açıklama yazdığı kanıtı değildir.</p></section>
</div></details>`;
}
function documentHtml(draft) {
  const [repeat, grouping] = draft.problem.contexts;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; img-src 'none'; media-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>Zaman mı, paket boyutu mu? · Editör incelemesi</title><style>${STYLE}</style></head><body><main>
<header><p class="eyebrow">İki bağlam · İki farklı anlam</p><h1>Zaman mı, paket boyutu mu?</h1><p>6. sınıf adayı · Matematik · Yalnız editör incelemesi</p><p>Önerilen içerik bağı: MAT.6.1.4 · Etkin yıl/program ve resmî kazanım onayı değildir</p><p class="counts">1 mevcut taslak · 0 yeni soru · 0 kabul edilen soru · 0 yayımlanan soru</p></header>
<aside aria-label="İnceleme sınırları"><p>Bu HTML yanıt içeren editör artefaktıdır; öğrenciye sunulan içerik değildir. Kapalı çözüm erişim kontrolü veya cevap güvenliği sağlamaz.</p><p>Verilmiş kanıtı eşleştirmek, öğrencinin kendi listesini/modelini oluşturması veya gerekçesini açıklaması değildir.</p><p>${escape(Object.keys(draft.gates).map(key => `${labels[key]}: bekliyor`).join(' · '))}</p></aside>
<section class="task" aria-labelledby="task-heading"><h2 id="task-heading">Görev</h2><p>${escape(draft.prompt)}</p></section>
<section class="context" aria-labelledby="repeat-heading"><h2 id="repeat-heading">${escape(repeat.title)}</h2><p>${escape(repeat.statement)}</p>${timelineHtml(draft)}</section>
<section class="context" aria-labelledby="grouping-heading"><h2 id="grouping-heading">${escape(grouping.title)}</h2><p>${escape(grouping.statement)}</p>${groupingHtml(draft)}</section>
${cardsHtml(draft)}${solutionHtml(draft)}
<footer><p>Yerel matematik denetimi geçti; etkin program, uzman, hak, zorluk ve erişilebilirlik kabulü bekliyor. Bir özgün gömülü SVG ve HTML hazırlandı; PNG, ses veya video üretilmedi.</p>
<p class="lineage">Kaynak revizyonu: ${escape(draft.sourceLineage.sourceSha256)}<br>Uygulama metaveri revizyonu: ${escape(draft.sourceLineage.applicationMetadataSha256)}</p><p>Hashler izlenebilirlik içindir; kimlik doğrulama, izin veya insan onayı değildir.</p></footer>
</main></body></html>`;
}

/** The gate consumes candidate through the old independent verifier. After it
 * passes, only freshly rebuilt canonical data reaches any HTML/SVG sink. */
export function renderGrade6CommonRelationsEditorView(candidate, sourceBindingInput) {
  if (arguments.length !== 2) fail('invalid_common_relations_editor_arguments');
  let draft;
  try {
    if (!verifyGrade6CommonRelationsDraft(candidate, sourceBindingInput).valid) fail('invalid_common_relations_editor_input');
    draft = createGrade6CommonRelationsDraft(sourceBindingInput);
  } catch { fail('invalid_common_relations_editor_input'); }
  const html = documentHtml(draft), htmlBytes = Buffer.byteLength(html);
  if (htmlBytes > 65536) fail('common_relations_editor_output_budget');
  const manifest = { schemaVersion: 'grade6-common-relations-editor-view-manifest/v1', state: 'editor_review_only',
    draftContentSha256: draft.contentSha256, authoredTaskSha256: draft.authoredTaskSha256,
    sourceSha256: draft.sourceLineage.sourceSha256, applicationMetadataSha256: draft.sourceLineage.applicationMetadataSha256,
    priorMatrixMetadataSha256: draft.sourceLineage.priorMatrixMetadataSha256, sourceRowMetadataSha256: draft.sourceLineage.sourceRowMetadataSha256,
    htmlSha256: createHash('sha256').update(html).digest('hex'), htmlBytes,
    contextCount: 2, inlineSvgCount: 1, timelineMarkCount: 16, timelineDimensions: { width: 760, height: 240 },
    textualTimelineRowCount: 2, groupRowCount: 6, evidenceCardCount: 4, closedSolutionCount: 1,
    defaultMatchingMarked: false, answerBearingEditorArtifact: true, hiddenDetailsAreLearnerSecurity: false,
    evidenceKind: draft.purpose.evidenceKind, learnerEvidenceCollected: false, fullOutcomeCoverage: false,
    counts: { existingAuthoredDrafts: 1, newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...draft.gates }, humanApproval: null, activeAcademicYear: null, programVersion: null, officialOutcomeCode: null,
    publicationReady: false, learnerReady: false, productionReady: false, accessibilityPassed: false, nativeVisualReviewPassed: false,
    serializedHashIsAuthority: false, freshPdfByteChecks: 0,
    intendedReviewViewports: [{ width: 320, height: 844 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }],
    activity: { htmlProduced: 1, inlineSvgsProduced: 1, pngProduced: 0, audioProduced: 0, videosProduced: 0, networkCallsMade: 0, providersCalled: 0 } };
  if (Buffer.byteLength(JSON.stringify(manifest)) > 16384) fail('common_relations_editor_output_budget');
  return freeze({ schemaVersion: 'grade6-common-relations-editor-view/v1', state: 'editor_review_only', html, manifest });
}
