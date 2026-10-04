import { createHash } from 'node:crypto';
import { createGrade6FactorEvidenceDraft, verifyGrade6FactorEvidenceDraft } from './grade6_factor_evidence_draft.mjs';

// One answer-bearing editorial document. There is no arbitrary template, input
// approval, learner route, browser code or asset/network capability here.
const fail = code => { throw new Error(code); };
const escape = value => String(value).replace(/[&<>"']/gu, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const labels = { activeProgram: 'Etkin program', pedagogy: 'Pedagoji', rights: 'Haklar', difficulty: 'Zorluk', answer: 'Uzman yanıt incelemesi', accessibility: 'Erişilebilirlik' };
const boardLabel = id => `Pano ${id.slice(-1).toLocaleUpperCase('tr-TR')}`;
const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
const resultText = value => Array.isArray(value) ? value.map(item => Array.isArray(item) ? item.join(' × ') : item).join(Array.isArray(value[0]) ? '; ' : ', ') : String(value);

const STYLE = `
:root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #183342; background: #f3f6f7; }
* { box-sizing: border-box; }
body { margin: 0; font-size: 18px; line-height: 1.6; }
main { max-width: 1200px; margin: 0 auto; padding: 24px 16px 48px; }
h1, h2, h3, p { margin: 0 0 16px; }
h1 { font-size: clamp(28px, 4vw, 40px); line-height: 1.2; letter-spacing: -0.025em; }
h2 { font-size: 25px; line-height: 1.35; } h3 { font-size: 22px; line-height: 1.4; }
header { padding: 24px; border-radius: 20px; background: #183342; color: #fff; }
header p:last-child { margin-bottom: 0; }
.eyebrow { font-weight: 650; color: #bcdfdf; }
.scope { margin-bottom: 8px; }
.counts { font-weight: 650; }
aside { margin: 20px 0; padding: 20px 24px; background: #fff7e8; border: 1px solid #ead1a4; border-radius: 16px; }
aside p:last-child { margin-bottom: 0; }
.prompt { margin: 24px 0; padding: 24px; border: 1px solid #cbd8dd; border-radius: 16px; background: #fff; }
.boards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; align-items: start; }
.board { min-width: 0; padding: 22px; background: #fff; border: 1px solid #cbd8dd; border-top: 4px solid #3b737d; border-radius: 16px; }
table { border-collapse: collapse; table-layout: fixed; width: 100%; font-variant-numeric: tabular-nums; }
caption { text-align: left; font-weight: 650; padding-bottom: 12px; }
th, td { border-bottom: 1px solid #dce5e8; padding: 10px 4px; text-align: center; overflow-wrap: anywhere; }
thead th { background: #edf4f5; font-weight: 650; } tbody th { font-weight: 500; }
.badges { display: flex; flex-wrap: wrap; gap: 10px; padding: 0; margin: 8px 0 16px; list-style: none; }
.badges li { display: block; min-width: 38px; padding: 3px 10px; border: 1px solid #abc7ce; border-radius: 10px; text-align: center; background: #edf4f5; font-variant-numeric: tabular-nums; }
.badge-label { margin: 18px 0 0; font-weight: 650; } .sum { margin-bottom: 0; }
output, [data-result] { font-weight: 650; font-variant-numeric: tabular-nums; }
details { margin-top: 28px; border: 1px solid #9cb9c1; border-radius: 16px; background: #fff; overflow: hidden; }
summary { padding: 20px 24px; font-weight: 650; cursor: pointer; background: #e8f0f2; }
summary:focus-visible { outline: 3px solid #23596a; outline-offset: -4px; }
.solution { padding: 24px; } .solution section { margin-bottom: 28px; } .solution section:last-child { margin-bottom: 0; }
.solution ol, .solution ul { padding-left: 28px; } .solution li { margin-bottom: 16px; }
.solution li p { margin: 8px 0; } .answer { padding: 20px; background: #edf4f5; border-radius: 12px; }
footer { margin-top: 28px; color: #3f5865; } .lineage { overflow-wrap: anywhere; }
@media (min-width: 900px) { .boards { grid-template-columns: repeat(2, minmax(0, 1fr)); } main { padding: 40px 24px 64px; } }
@media (max-width: 480px) { header, aside, .prompt, .board, .solution { padding: 18px; } summary { padding: 18px; } th, td { padding: 10px 2px; } }
`;

function boardHtml(board) {
  return `<article class="board" data-board-id="${escape(board.id)}" aria-labelledby="${escape(board.id)}-heading">
<h3 id="${escape(board.id)}-heading">${escape(boardLabel(board.id))}</h3>
<table id="${escape(board.id)}-table"><caption>${escape(boardLabel(board.id))} · Pozitif çarpan çiftleri</caption>
<thead><tr><th scope="col">Küçük çarpan</th><th scope="col">Büyük çarpan</th><th scope="col">Çarpım</th></tr></thead>
<tbody>${board.factorPairs.map(([a, b]) => `<tr><th scope="row">${escape(a)}</th><td>${escape(b)}</td><td>${escape(a * b)}</td></tr>`).join('')}</tbody></table>
<p class="badge-label">Asal rozetleri</p><ul class="badges" aria-label="Asal rozetleri">${board.primeBadges.map(prime => `<li>${escape(prime)}</li>`).join('')}</ul>
<p class="sum">Rozet toplamı: <output>${escape(board.primeBadgeSum)}</output></p></article>`;
}
function solutionHtml(draft, verification) {
  const explanation = draft.explanation, shortcut = explanation.conditionalShortcut, transfer = explanation.transfer;
  const titles = { 'complete-pairs': 'Çarpan çiftlerini tamamla', 'distinct-primes': 'Farklı asal çarpanları ayır', 'target-sum': 'İstenen toplamı bul' };
  return `<details><summary>Editör: Gerekçeli çözümü ve sınırlarını aç</summary><div class="solution">
<section data-solution-part="goal"><h2>Ne isteniyor?</h2><p>${escape(explanation.goal)}</p></section>
<section data-solution-part="given"><h2>Verilen sayı neyi anlatıyor?</h2><p>${escape(explanation.givenMeaning)}</p></section>
<section data-solution-part="route"><h2>Hangi yolu izleyeceğiz?</h2><p>${escape(explanation.route)}</p></section>
<section data-solution-part="because"><h2>Neden bu yol?</h2><p>${escape(explanation.because)}</p></section>
<section data-solution-part="conditions"><h2>Geçerlilik koşulları</h2>${list(explanation.conditions)}</section>
<section data-solution-part="steps"><h2>Gerekçe → İşlem → Sonucun anlamı</h2><ol>${explanation.steps.map(step => `<li><h3>${escape(titles[step.id])}</h3><p>${escape(step.why)}</p><p data-result="${escape(step.id)}">${escape(resultText(step.result))}</p><p>${escape(step.meaning)}</p></li>`).join('')}</ol></section>
<section data-solution-part="shortcut"><h2>Kısa yol hangi koşulda işe yarar?</h2><p>${escape(shortcut.worksWhen)}</p><p>${escape(shortcut.why)}</p><p>${escape(shortcut.check)}</p><p>${escape(shortcut.notImplied)}</p></section>
<section data-solution-part="transfer"><h2>Aktarım: Başlangıç sayısı 1 olsaydı?</h2><p>${escape(transfer.prompt)}</p><p>Çarpan çifti: ${escape(resultText(transfer.factorPairs))} · Asal rozet yok · Rozet toplamı: ${escape(transfer.primeBadgeSum)}</p><p>${escape(transfer.meaning)}</p></section>
<section class="answer" data-solution-part="answer"><h2>Editör yanıtı: ${escape(boardLabel(draft.answerKey.boardId))}</h2><p>Tam çift listesi, farklı asal rozetler ve doğru toplam birlikte sağlanır.</p>
${list(verification.boardChecks.filter(board => !board.valid).map(board => `${boardLabel(board.id)}: ${!board.completePairs ? 'Çarpan çiftleri eksik veya hatalı.' : ''} ${!board.exactPrimeSubset ? 'Farklı asal çarpan koşulu sağlanmıyor.' : ''} ${!board.correctPrimeSum ? 'İstenen toplam sağlanmıyor.' : ''}`.trim()))}</section>
</div></details>`;
}

function documentHtml(draft, verification) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; img-src 'none'; media-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>36 için dört kanıt panosu · Editör incelemesi</title><style>${STYLE}</style></head><body><main>
<header><p class="eyebrow">Sayı atölyesi · Editör incelemesi</p><h1>36 için dört kanıt panosu</h1><p class="scope">6. sınıf adayı · Matematik · Etkin yıl ve program bağı kabul edilmedi</p>
<p>Önerilen içerik bağı: ${escape(draft.scope.proposedOutcomeCodes.join(' · '))} — resmî kazanım onayı değildir.</p>
<p class="counts">1 taslak · 0 kabul edilmiş soru · 0 yayımlanan soru</p></header>
<aside aria-label="İnceleme sınırları"><p>Bu belge yanıt içeren editör incelemesidir; öğrenciye sunulan içerik değildir. Kapalı çözüm bölümü güvenlik veya erişim kontrolü sağlamaz.</p>
<p>Verilmiş kanıtı tanıma ve hatayı ayırma amaçlanır. Öğrencinin listeyi kendisinin kurduğu, açıklama yaptığı veya kazanıma hâkim olduğu ölçülmedi.</p>
<p>${escape(Object.keys(draft.gates).map(key => `${labels[key]}: bekliyor`).join(' · '))}</p></aside>
<section class="prompt" aria-labelledby="task-heading"><h2 id="task-heading">Görev</h2><p>${escape(draft.prompt)}</p></section>
<section aria-labelledby="boards-heading"><h2 id="boards-heading">Dört ayrı kanıt</h2><div class="boards">${draft.problem.boards.map(boardHtml).join('')}</div></section>
${solutionHtml(draft, verification)}
<footer><p>Yerel matematik denetimi geçti; uzman yanıt incelemesi, haklar, pedagoji ve görsel/erişilebilirlik kabulü bekliyor. Bu HTML, PNG/SVG görsel dosyası, ses veya video üretimi değildir.</p>
<p class="lineage">Kaynak revizyonu: ${escape(draft.sourceLineage.sourceSha256)}<br>Plan revizyonu: ${escape(draft.sourceLineage.planContentSha256)}</p>
<p>Revizyon özetleri izlenebilirlik içindir; kimlik doğrulama, izin veya insan onayı sağlamaz.</p></footer>
</main></body></html>`;
}

/** Render only a verifier-passing revision. After that gate the caller's
 * candidate is never read: fresh canonical source-bound data supplies all sinks.
 * A closed details element is editorial convenience, not answer protection. */
export function renderGrade6FactorEvidenceEditorView(candidate, sourcePlannerInput) {
  if (arguments.length !== 2) fail('invalid_factor_editor_view_arguments');
  let draft, verification;
  try {
    verification = verifyGrade6FactorEvidenceDraft(candidate, sourcePlannerInput);
    if (!verification.valid) fail('invalid_factor_editor_view_input');
    draft = createGrade6FactorEvidenceDraft(sourcePlannerInput);
  } catch { fail('invalid_factor_editor_view_input'); }
  const html = documentHtml(draft, verification), htmlBytes = Buffer.byteLength(html);
  if (htmlBytes > 65536) fail('factor_editor_view_output_budget');
  const manifest = {
    schemaVersion: 'grade6-factor-evidence-editor-view-manifest/v1', state: 'editor_review_only',
    draftContentSha256: draft.contentSha256, authoredTaskSha256: draft.authoredTaskSha256,
    planContentSha256: draft.sourceLineage.planContentSha256, sourceSha256: draft.sourceLineage.sourceSha256,
    htmlSha256: createHash('sha256').update(html).digest('hex'), htmlBytes,
    boardCount: draft.problem.boards.length, factorPairRowCount: draft.problem.boards.reduce((sum, board) => sum + board.factorPairs.length, 0),
    primeBadgeCount: draft.problem.boards.reduce((sum, board) => sum + board.primeBadges.length, 0), closedSolutionCount: 1,
    defaultAnswerMarked: false, answerBearingEditorArtifact: true, hiddenDetailsAreLearnerSecurity: false,
    evidenceKind: draft.purpose.evidenceKind, fullBriefEvidenceFulfilled: false, learnerEvidenceCollected: false,
    activeAcademicYear: null, programVersion: null, officialOutcomeCode: null, fullOutcomeCoverage: false,
    counts: { newAuthoredDrafts: 1, acceptedProductQuestions: 0, publishedQuestions: 0 }, repeatedCallsCreateDistinctStock: false,
    gates: { ...draft.gates }, humanApproval: null, learnerReady: false, publicationReady: false, productionReady: false,
    accessibilityPassed: false, nativeVisualReviewPassed: false, serializedHashIsAuthority: false, freshPdfByteChecks: 0,
    intendedReviewViewports: [{ width: 390, height: 844 }, { width: 1440, height: 1000 }],
    activity: { htmlProduced: 1, imagesProduced: 0, audioProduced: 0, videosProduced: 0, networkCallsMade: 0, providersCalled: 0 },
  };
  if (Buffer.byteLength(JSON.stringify(manifest)) > 16384) fail('factor_editor_view_output_budget');
  return freeze({ schemaVersion: 'grade6-factor-evidence-editor-view/v1', state: 'editor_review_only', html, manifest });
}
