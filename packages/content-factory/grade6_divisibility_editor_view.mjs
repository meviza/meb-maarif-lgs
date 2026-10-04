import { createHash } from 'node:crypto';
import { createGrade6DivisibilityClassificationDraft, verifyGrade6DivisibilityClassificationDraft } from './grade6_divisibility_classification_draft.mjs';

const escape = value => String(value).replace(/[&<>"']/gu, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const STYLE = `
:root{color-scheme:light;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#213f48;background:#f5f2eb}
*{box-sizing:border-box}body{margin:0;font-size:18px;line-height:1.65}main{max-width:1120px;margin:auto;padding:40px 24px 64px}
h1,h2,h3,p{margin:0 0 16px}h1{font-family:Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.15}h2{font-size:25px;line-height:1.35}h3{font-size:21px;line-height:1.4}
header{padding:32px;border-radius:24px;background:#203f49;color:#fff}.eyebrow{font-size:15px;font-weight:650;letter-spacing:.08em;color:#d7e7df}.scope{color:#e4ece9;font-size:16px}
.intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.65fr);gap:24px;margin:24px 0}.paper,.tip{padding:26px;border:1px solid #d7d6ce;border-radius:18px;background:#fffdf8;min-width:0}.tip{background:#f3ead8;border-color:#dfcba7}.tip strong{display:block;margin-bottom:12px}.tip p:last-child{margin:0}
.cards{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:12px;padding:0;list-style:none;margin:20px 0 28px}.number-card{display:grid;place-items:center;min-height:80px;border:1px solid #c0cdc8;border-bottom:4px solid #577b74;border-radius:14px;background:#fffdf8;font-size:30px;font-weight:650;font-variant-numeric:tabular-nums}
.categories{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.category{padding:20px;min-height:156px;background:#e8efeb;border:1px solid #c5d4ce;border-radius:16px;min-width:0}.category p{font-size:16px;margin:0}.category h3{margin-bottom:10px}
details{margin-top:28px;border:1px solid #becdc7;border-radius:18px;background:#fffdf8;overflow:hidden}summary{padding:22px 26px;background:#e8efeb;font-weight:650;cursor:pointer}summary:focus-visible{outline:3px solid #203f49;outline-offset:-4px}.solution{padding:26px}.solution section{margin-bottom:28px}.solution section:last-child{margin:0}.solution li{margin-bottom:12px}.solution li p{margin-bottom:8px}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}caption{text-align:left;font-weight:650;margin-bottom:12px}th,td{padding:12px 8px;border-bottom:1px solid #dce5e0;text-align:left;overflow-wrap:anywhere}thead{background:#e8efeb}.review{margin-top:24px;font-size:16px;color:#465e62;overflow-wrap:anywhere}.review p:last-child{margin-bottom:0}
@media(max-width:800px){.intro{grid-template-columns:1fr}.categories{grid-template-columns:repeat(2,minmax(0,1fr))}.cards{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:480px){main{padding:18px 14px 40px}header,.paper,.tip,.solution{padding:20px}.category{padding:16px}summary{padding:20px}.cards{gap:10px}.number-card{font-size:27px;min-height:68px}.categories{grid-template-columns:1fr}}
`;
const CATEGORY_NOTES = {
  'only-2': '2 kuralını sağlar; 3 kuralını sağlamaz.',
  'only-3': '3 kuralını sağlar; 2 kuralını sağlamaz.',
  both: 'İki ayrı kuralı da sağlar.',
  neither: 'İki ayrı kuralı da sağlamaz.'
};

function stepResultHtml(step, cardById, labelById) {
  if (step.id === 'read-rules') return `<p><strong>${escape(step.result.join(' ve '))}</strong></p>`;
  if (step.id === 'check-two-rules') return list(step.result.map(row => `${cardById.get(row.cardId)}: 2 ile ${row.divisibleBy2 ? 'evet' : 'hayır'}; 3 ile ${row.divisibleBy3 ? 'evet' : 'hayır'}.`));
  if (step.id === 'partition-once') return list(step.result.map(group => `${labelById.get(group.categoryId)}: ${group.cardIds.map(id => cardById.get(id)).join(', ')}.`));
  return `<p><strong>${escape(step.result)}</strong></p>`;
}

function solutionHtml(draft, verification) {
  const { explanation: e, problem: p } = draft, shortcut = e.conditionalShortcut;
  const cardById = new Map(p.cards.map(card => [card.id, card.value]));
  const labelById = new Map(p.categories.map(category => [category.id, category.label]));
  // Use the independently recomputed groups, not the authored key, in this sink.
  const answers = verification.recomputed.correctGroups.map(group => `<tr data-answer-category="${escape(group.categoryId)}"><th scope="row">${escape(labelById.get(group.categoryId))}</th><td>${escape(group.cardIds.map(id => cardById.get(id)).join(', '))}</td></tr>`).join('');
  return `<details><summary>Editör: Gerekçeli çözümü aç</summary><div class="solution">
<section><h2>Ne isteniyor?</h2><p>${escape(e.goal)}</p></section>
<section><h2>Verilenler neyi anlatıyor?</h2><p>${escape(e.givenMeaning)}</p></section>
<section><h2>Hangi yolu izleyeceğiz?</h2><p>${escape(e.route)}</p></section>
<section><h2>Neden bu yol?</h2><p>${escape(e.because)}</p>${list(e.conditions)}</section>
<section><h2>Ara kararların anlamı</h2><ol>${e.steps.map(step => `<li><p>${escape(step.why)}</p>${stepResultHtml(step, cardById, labelById)}<p>${escape(step.meaning)}</p></li>`).join('')}</ol></section>
<section><h2>Pratik bilgi ve püf nokta</h2><p>${escape(shortcut.worksWhen)}</p><p>${escape(shortcut.why)}</p><p>${escape(shortcut.check)}</p><p>${escape(shortcut.notImplied)}</p></section>
<section><h2>Eksiksizlik kontrolü</h2><p>Sekiz kartın her biri yalnız bir grupta bulunmalı. İki koşulun kararlarını ayrı ayrı kontrol et.</p><table><caption>Bağımsız matematik denetiminin doğruladığı gruplar</caption><thead><tr><th scope="col">Grup</th><th scope="col">Kartlar</th></tr></thead><tbody>${answers}</tbody></table></section>
</div></details>`;
}

/** A bounded, answer-bearing editorial view, not a learner delivery route.
 * Rebuild canonical data after verification; never use caller prose in HTML. */
export function renderGrade6DivisibilityEditorView(candidate, plannerInput) {
  if (arguments.length !== 2) throw new Error('invalid_divisibility_editor_view_arguments');
  let draft, verification;
  try {
    verification = verifyGrade6DivisibilityClassificationDraft(candidate, plannerInput);
    if (!verification.valid) throw new Error('invalid');
    draft = createGrade6DivisibilityClassificationDraft(plannerInput);
  } catch { throw new Error('invalid_divisibility_editor_view_input'); }
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; img-src 'none'; media-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<title>İki kuralı birlikte gör · Sayı atölyesi</title><style>${STYLE}</style></head><body><main>
<header><p class="eyebrow">Sayı atölyesi · Editör önizlemesi</p><h1>İki kuralı birlikte gör</h1><p class="scope">6. sınıf · Matematik · Bölünebilme</p><p>1 özgün görev · Uzman incelemesi bekliyor · Yayımlanan soru: 0</p></header>
<div class="intro"><section class="paper"><h2>Görev</h2><p>${escape(draft.prompt)}</p>${list(draft.problem.rules.map(rule => rule.label))}</section>
<aside class="tip"><strong>İki soruyu sırayla sor.</strong><p>Son basamak çift mi? Rakamların toplamı 3 ile kalansız bölünüyor mu?</p><p>İki yanıt birlikte kartın grubunu belirler. Yalnız bir kuralı kontrol etmek yeterli değildir.</p></aside></div>
<section aria-labelledby="cards-title"><h2 id="cards-title">Sekiz sayı kartı</h2><ul class="cards" aria-label="Sınıflanacak sayılar">${draft.problem.cards.map(card => `<li class="number-card" data-card-id="${escape(card.id)}"><span>${escape(card.value)}</span></li>`).join('')}</ul></section>
<section aria-labelledby="groups-title"><h2 id="groups-title">Dört farklı grup</h2><div class="categories">${draft.problem.categories.map(category => `<article class="category" data-category-id="${escape(category.id)}" aria-labelledby="${escape(category.id)}-title"><h3 id="${escape(category.id)}-title">${escape(category.label)}</h3><p>${escape(CATEGORY_NOTES[category.id])}</p></article>`).join('')}</div></section>
${solutionHtml(draft, verification)}
<footer class="review"><p>Yanıt içeren editör taslağıdır; kapalı çözüm bölümü erişim güvenliği sağlamaz. Öğrenci performansı kaydedilmez.</p><p>Kaynak program bağı adayı: MAT.6.1.2. Zorluk: Orta, yazar tahmini; saha kalibrasyonu yapılmadı. Yeni ses veya video değildir.</p><p>Taslak revizyonu: ${escape(draft.contentSha256)}</p></footer>
</main></body></html>`;
  const htmlBytes = Buffer.byteLength(html);
  if (htmlBytes > 65536) throw new Error('divisibility_editor_view_output_budget');
  return freeze({ html, manifest: {
    schemaVersion: 'grade6-divisibility-editor-view-manifest/v1', state: 'editor_review_only',
    draftContentSha256: draft.contentSha256, htmlBytes,
    htmlSha256: createHash('sha256').update(html).digest('hex'), cardCount: 8, categoryCount: 4,
    answerBearingEditorArtifact: true, hiddenDetailsAreLearnerSecurity: false,
    counts: { newAuthoredDrafts: 1, acceptedProductQuestions: 0, publishedQuestions: 0 },
    repeatedCallsCreateDistinctStock: false, learnerReady: false, publicationReady: false,
    learnerEvidenceCollected: false, audioGenerated: false, videoRendered: false, providerCallsMade: 0,
    gates: { ...draft.gates }
  } });
}
