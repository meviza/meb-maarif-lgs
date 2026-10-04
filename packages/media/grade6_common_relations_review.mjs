import { createHash } from 'node:crypto';
import { renderGrade6CommonRelationsCaptionFrame } from './grade6_common_relations_scene.mjs';

const sha = text => createHash('sha256').update(text).digest('hex');
const fail = code => { throw new Error(code); };
const escape = value => String(value).replace(/[&<>"']/gu, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const freeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const titles = { goal: 'Hedef', evidence: 'Verilenler', plan: 'Çözüm yolu', why: 'Neden bu yol?', result: 'Sonucun anlamı',
  check_prompt: 'Kontrol sorusu', check_answer: 'Kontrol açıklaması', summary: 'Koşullu kısa yöntem',
  transfer_prompt: 'Başka durumda düşün', transfer_answer: 'Aktarım açıklaması' };

function equivalent(contextId, geometry) {
  if (contextId === 'repeat') {
    return `<table><caption>Zaman şeridinin verilenleri · Dakika</caption><thead><tr><th scope="col">Seri</th><th scope="col">Dakika işaretleri</th></tr></thead><tbody>${geometry.sequences.map((values, index) =>
      `<tr><th scope="row">${geometry.intervals[index]} dakika</th><td>${[geometry.startMinute, ...values].join(', ')}</td></tr>`).join('')}</tbody></table>`;
  }
  return `<table><caption>Kalansız paket tablosunun verilenleri</caption><thead><tr><th scope="col">Boyut · Kart/paket</th><th scope="col">${geometry.totals[0]} kart · Paket</th><th scope="col">${geometry.totals[1]} kart · Paket</th></tr></thead><tbody>${geometry.rows.map(row =>
    `<tr><th scope="row">${row.size}</th>${row.packageCounts.map(count => `<td>${count}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

const css = `
:root{font-family:system-ui,sans-serif;font-size:18px;color:#193444;background:#f4f4ec;color-scheme:light}
*{box-sizing:border-box}body{margin:0}main{max-width:1080px;margin:0 auto;padding:24px;min-width:0}
h1{font-size:1.8rem;line-height:1.2;margin:.35em 0}h2{font-size:1.2rem;line-height:1.4;margin:0 0 12px}
p,figcaption,summary,th,td{font-size:1rem;line-height:1.65}p{margin:.6em 0;overflow-wrap:anywhere}
.eyebrow{color:#376878}.notice{padding:16px;border-left:4px solid #ba6739;background:#fff5df;border-radius:6px}
.panel{margin-top:20px;padding:20px;border:1px solid #ccd9d9;background:#fffdf7;border-radius:16px;min-width:0}
figure{margin:0}figcaption{margin-bottom:12px;color:#3d5863}.source-scroll{max-width:100%;overflow-x:auto;border:1px solid #d9e2df;border-radius:10px}
.source-scroll:focus-visible,.table-scroll:focus-visible,summary:focus-visible{outline:3px solid #216b82;outline-offset:3px}
.source-viewport{width:760px;overflow:hidden}.source-viewport svg{display:block;width:760px;max-width:none}
.caption{font-size:1rem;line-height:1.75;white-space:normal;overflow-wrap:anywhere;margin:0}
.cursor{color:#496572}.table-scroll{max-width:100%;overflow-x:auto}table{border-collapse:collapse;width:100%;margin-top:18px;min-width:280px}
caption{text-align:left;font-weight:650;margin-bottom:8px}th,td{text-align:left;padding:12px;border-bottom:1px solid #d8e0de;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
thead th{background:#edf3f1}details{margin-top:16px;padding:14px;border:1px solid #d5dfdf;border-radius:10px}summary{cursor:pointer;font-weight:650}
.transcript{white-space:pre-wrap;overflow-wrap:anywhere}footer{margin-top:24px;color:#526774}code{font-size:1rem;overflow-wrap:anywhere}
@media(max-width:600px){main{padding:16px}.panel{padding:16px}h1{font-size:1.5rem}th,td{padding:8px}}
`;

/** Static current-cue editor review. Only the actual live scene renderer can
 * authorize input; HTML/current transcript visibility is not learner auth. */
export function renderGrade6CommonRelationsReview(plan, options) {
  if (arguments.length !== 2) fail('invalid_common_relations_review_arguments');
  let frame, narrationPacket;
  try { ({ frame, narrationPacket } = renderGrade6CommonRelationsCaptionFrame(plan, options)); }
  catch { fail('invalid_common_relations_review_input'); }
  // Live brand + closed options have been checked. No caller option is reread.
  // Plan is the real renderer's frozen capability, not arbitrary supplied XML.
  const supported = frame.sourceDiagramProof, contextId = frame.contextId;
  const heading = contextId === 'repeat' ? 'Zaman ilişkisi' : 'Kalansız paketler';
  const sourceHeight = frame.captionLayout.sourceHeightSvgUnits;
  const description = contextId === 'repeat'
    ? 'Daireler 6 dakika, kareler 8 dakika aralıklarını gösterir. 0 başlangıcı hedef pencerenin dışındadır; 48 dakika dahildir.'
    : 'Kart türleri karıştırılmaz ve artan kart kalmaz. Kart/paket boyutu ile her türün paket adedi ayrı niceliklerdir.';
  // Fixed trusted root transform only; the renderer's own SVG body is retained.
  // Cropping excludes the lower SVG caption visually; aria-hidden avoids its
  // duplication in AX. Equivalent canonical givens remain real HTML tables.
  const geometrySvg = supported
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${sourceHeight}" viewBox="0 0 760 ${sourceHeight}" aria-hidden="true" focusable="false">${frame.svg.slice(frame.svg.indexOf('>') + 1)}`
    : null;
  const geometry = supported ? `<figure><figcaption>${escape(description)}</figcaption><p id="geometry-scroll-hint">Şeklin ve tablonun tamamını görmek için sağa–sola kaydırın. Klavyede ok tuşlarını kullanabilirsiniz.</p><div id="source-scroll" class="source-scroll" role="region" tabindex="0" aria-label="${escape(`${heading} · Verilen şekil, yatay kaydırılabilir`)}" aria-describedby="geometry-scroll-hint"><div class="source-viewport" style="height:${sourceHeight}px">${geometrySvg}</div></div><div id="given-table-scroll" class="table-scroll" role="region" tabindex="0" aria-label="${escape(`${heading} · Verilenler tablosu, gerektiğinde yatay kaydırılabilir`)}" aria-describedby="geometry-scroll-hint">${equivalent(contextId, plan.givenGeometry[contextId])}</div></figure>`
    : '<p class="notice">Aktarımın kendi geometrisi kaynak taslakta yok. Yeni şekil ve tablo gösterimi bekliyor; eski çizelge kanıt olarak kullanılmadı.</p>';
  const currentCaption = frame.selectedPage.lines.join(' ');
  const fallback = narrationPacket.fullTranscript === null ? '' : `<details><summary>Yalnız bu adımın tam metni</summary><p class="transcript">${escape(narrationPacket.fullTranscript)}</p></details>`;
  const lockNote = frame.responseLocked ? '<p class="notice">Yanıt kilitli: açık gösterme seçimi ve tamamlanmış ilerleme birlikte gerekir.</p>' : '';
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; media-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>Ortak ilişkiler · Editör incelemesi</title><style>${css}</style></head><body><main><header><p class="eyebrow">6. Sınıf · Editör taslağı</p><h1>${heading}</h1><p class="notice">Tek mevcut taslağın güncel anlatım adımı inceleniyor. Kabul edilmiş veya yayımlanmış soru değildir; öğrenci teslimatı ve ses/video içermez.</p></header><section class="panel" aria-label="Kaynak gösterim"><h2>Verilen gösterim</h2>${geometry}</section><section id="current-step" class="panel" aria-label="Güncel anlatım adımı"><p class="cursor">Adım ${frame.cueIndex + 1} · Sayfa ${frame.pageIndex + 1}/${frame.pageCount}</p><h2>${escape(titles[frame.kind])}</h2>${lockNote}<p id="current-caption" class="caption">${escape(currentCaption)}</p>${fallback}</section><footer><p>Şekil ve verilen tablo matematiksel sonucu çıkarmaya imkân verir. Gösterme kilidi erişim yetkisi veya kopya önleme güvenliği değildir.</p><p>Haklar, alan uzmanı, yaş uygunluğu ve native erişilebilirlik/yerleşim kontrolleri bekliyor. Bu sayfa gerçek ses, video veya el yazısı üretimi değildir.</p><p>Kaynak kaydı: <code>${escape(frame.source.id)}</code></p></footer></main></body></html>`;
  if (Buffer.byteLength(html) > 65536) fail('common_relations_review_output_budget');
  const manifest = {
    schemaVersion: 'grade6-common-relations-responsive-review-manifest/v1', state: 'editor_current_cue_review',
    htmlSha256: sha(html), htmlByteLength: Buffer.byteLength(html), source: frame.source, trace: frame.trace, job: frame.job,
    scenePlanSha256: frame.scenePlanSha256, preparationSha256: frame.preparationSha256, geometrySha256: frame.geometrySha256,
    frameSha256: frame.contentSha256, frameSvgSha256: frame.svgSha256, narrationPacketSha256: narrationPacket.contentSha256,
    selectedPageSha256: frame.selectedPageSha256, currentTranscriptSha256: frame.fullTranscriptSha256,
    contextId, cueId: frame.cueId, kind: frame.kind, cueIndex: frame.cueIndex, pageIndex: frame.pageIndex, pageCount: frame.pageCount,
    progress: frame.progress, revealRequested: frame.revealRequested, responseLocked: frame.responseLocked, resultVisible: frame.resultVisible,
    literalUnits: frame.literalUnits, sourceDiagramProof: frame.sourceDiagramProof, sourceVisualId: frame.sourceVisualId,
    representationStatus: frame.representationStatus, geometryRendered: supported, inlineSvgCount: supported ? 1 : 0,
    geometryEmbedding: 'canonical_svg_root_crop_not_original_byte_identity', geometrySvgSha256: geometrySvg === null ? null : sha(geometrySvg),
    sourceHeightSvgUnits: supported ? sourceHeight : null, svgAccessibility: supported ? 'hidden_with_canonical_given_table_equivalent' : 'geometry_pending',
    captionOutsideGeometryScroll: true, captionFontCssPx: 18, transcriptFallback: narrationPacket.fullTranscript === null ? 'none_protected' : 'current_cue_only_closed_details',
    manifestTranscriptText: false, futureTranscriptsIncluded: false, pageNavigationUiBound: false,
    counts: plan.counts, gates: plan.gates, audience: 'editor_review_only', serializedAuthority: 'none', inferredAnswerProtection: false,
    learnerReady: false, productionReady: false, publicationReady: false, teacherApproved: false,
    accessibilityPassed: false, responsiveLayoutVerified: false, audioGenerated: false, videoRendered: false,
    providerCallsMade: 0, scripts: 0, externalAssets: 0, numericStepsChecked: 0, semanticReview: 'pending',
    pending: [...frame.pending, 'native_responsive_html_and_screen_reader_review'],
  };
  manifest.contentSha256 = sha(`k12.grade6-common-relations.responsive-review/v1:${JSON.stringify(manifest)}`);
  if (Buffer.byteLength(JSON.stringify(manifest)) > 16384) fail('common_relations_review_output_budget');
  return freeze({ schemaVersion: 'grade6-common-relations-responsive-review/v1', state: 'editor_current_cue_review', html, manifest });
}
