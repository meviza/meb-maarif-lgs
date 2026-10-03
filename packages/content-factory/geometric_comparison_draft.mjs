import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';

const A2P = 'same_area_different_perimeter';
const P2A = 'same_perimeter_different_area';
const sha256 = value => createHash('sha256').update(value).digest('hex');
const fail = code => { throw new Error(code); };
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

// Inspect before reading caller values. Only three bounded primitives are
// copied; no nested DTO, coercion, freeform source or caller approval enters.
function request(input) {
  if (!input || typeof input !== 'object' || isProxy(input) || Array.isArray(input)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) fail('invalid_geometric_comparison_input');
  const keys = Reflect.ownKeys(input);
  if (keys.length !== 3 || keys.some(key => !['id', 'direction', 'target'].includes(key))) fail('invalid_geometric_comparison_input');
  const d = Object.getOwnPropertyDescriptors(input);
  if (keys.some(key => !Object.hasOwn(d[key], 'value'))) fail('invalid_geometric_comparison_input');
  const id = d.id.value, direction = d.direction.value, target = d.target.value;
  if (typeof id !== 'string' || id.length > 80 || !/^[A-Za-z0-9_-]{1,80}$/u.test(id)
    || typeof direction !== 'string' || direction.length > 64 || ![A2P, P2A].includes(direction)
    || !Number.isSafeInteger(target)
    || (direction === A2P ? target < 1 || target > 36 : target < 4 || target > 74 || target % 2 !== 0)) fail('invalid_geometric_comparison_input');
  return { id, direction, target };
}

function candidateModels(direction, target) {
  const models = [];
  for (let width = 1; width <= 36; width++) {
    const height = direction === A2P ? target / width : target / 2 - width;
    if (!Number.isInteger(height) || height < width || height < 1) continue;
    const areaSquareUnits = width * height;
    if (areaSquareUnits > 36) continue;
    models.push({ id: `model-${models.length + 1}`, width, height, areaSquareUnits,
      perimeterUnits: 2 * (width + height), isSquare: width === height });
  }
  if (models.length < 2) fail('insufficient_distinct_rectangle_models');
  return models;
}

function visual(models, direction, target) {
  const width = 1112, cardWidth = 520, cardStep = 256, top = 100;
  const laidOut = models.map((m, index) => {
    const cardX = 24 + (index % 2) * 544, cardY = top + Math.floor(index / 2) * cardStep;
    // Rotate only the drawing for a readable canvas; canonical width <= height
    // remains the identity. The equal-cell abstract model is new authored art,
    // not a physical scale inferred from any original program/source SVG.
    const displayWidthUnits = m.height, displayHeightUnits = m.width;
    const scale = Math.min(20, 380 / displayWidthUnits);
    return { modelId: m.id, logicalWidthUnits: m.width, logicalHeightUnits: m.height,
      displayWidthUnits, displayHeightUnits, rotationDegrees: m.isSquare ? 0 : 90,
      pixelsPerLengthUnit: scale, unitSquareCount: m.areaSquareUnits,
      cardBounds: { x: cardX, y: cardY, width: cardWidth, height: 232 },
      bounds: { x: cardX + 32, y: cardY + 80, width: displayWidthUnits * scale, height: displayHeightUnits * scale } };
  });
  const tableTop = top + Math.ceil(models.length / 2) * cardStep + 16;
  const height = tableTop + 118 + models.length * 28;
  const heading = direction === A2P ? `Alan sabit: ${target} birimkare; çevreleri karşılaştır.` : `Çevre sabit: ${target} birim; alanları karşılaştır.`;
  const alt = `Editör çözüm referansı. Öğrenciye teslim onayı yok. ${heading} Model ve tablo cevapları içerir; öğrenci yanıtı değildir.`;
  const text = (x, y, value, size = 17) => `<text x="${x}" y="${y}" font-size="${size}" fill="#203b46">${escape(value)}</text>`;
  const drawings = laidOut.map((v, index) => {
    const m = models[index], b = v.bounds, s = v.pixelsPerLengthUnit;
    const grid = [];
    for (let col = 1; col < v.displayWidthUnits; col++) grid.push(`<path d="M ${b.x + col * s} ${b.y} V ${b.y + b.height}"/>`);
    for (let row = 1; row < v.displayHeightUnits; row++) grid.push(`<path d="M ${b.x} ${b.y + row * s} H ${b.x + b.width}"/>`);
    return `<g data-model-card="${m.id}"><rect x="${v.cardBounds.x}" y="${v.cardBounds.y}" width="520" height="232" rx="12" fill="#f0f6f1"/>`
      + text(v.cardBounds.x + 20, v.cardBounds.y + 30, `Model ${index + 1}: Kenarlar ${m.width} ve ${m.height} birim`, 18)
      + text(b.x, b.y - 16, `Yatay: ${v.displayWidthUnits} birim`, 15)
      + `<rect data-model="${m.id}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="#e4f0e9" stroke="#37675e" stroke-width="2"/>`
      + `<g data-layer="unit-grid" stroke="#8fafa5" stroke-width="1">${grid.join('')}</g>`
      + text(b.x + b.width + 12, b.y + b.height / 2 + 5, `${v.displayHeightUnits} birim`, 15)
      + text(v.cardBounds.x + 20, v.cardBounds.y + 215, `Alan: ${m.areaSquareUnits} birimkare · Çevre: ${m.perimeterUnits} birim`)
      + '</g>';
  }).join('');
  const tableHeader = text(24, tableTop + 24, 'Model') + text(160, tableTop + 24, 'Kenar a')
    + text(330, tableTop + 24, 'Kenar b') + text(500, tableTop + 24, 'Alan (birimkare)') + text(800, tableTop + 24, 'Çevre (birim)');
  const tableRows = models.map((m, index) => {
    const y = tableTop + 56 + index * 28;
    return text(24, y, String(index + 1)) + text(160, y, String(m.width)) + text(330, y, String(m.height))
      + text(500, y, String(m.areaSquareUnits)) + text(800, y, String(m.perimeterUnits));
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escape(alt)}"><title>${escape(alt)}</title><desc>${escape(alt)}</desc><rect width="${width}" height="${height}" fill="#fffaf1"/><g font-family="sans-serif">${text(24, 32, 'Editör çözüm referansı · Öğrenciye teslim onayı yok', 23)}${text(24, 65, heading, 20)}${drawings}<path d="M 24 ${tableTop - 4} H ${width - 24}" stroke="#b4c8bf"/>${tableHeader}${tableRows}${text(24, height - 24, 'Bu tablo öğrenci kanıtı değildir. Oluşturma ve açıklama ayrıca değerlendirilir.', 16)}</g></svg>`;
  return { format: 'image/svg+xml', coordinateSpace: 'authored_abstract_unit_grid',
    svg, svgSha256: sha256(svg), alt, viewBox: { x: 0, y: 0, width, height }, models: laidOut,
    answerBearing: true, learnerPayloadSafe: false, revealProtectionImplemented: false,
    originalProgramImageEmbedded: false, review: 'pending' };
}

/** Pure original editor task preparation, not a learner payload or acceptance. */
export function createGeometricComparisonDraft(input) {
  const { id, direction, target } = request(input), sameArea = direction === A2P;
  const models = candidateModels(direction, target);
  const taskPrompt = sameArea
    ? `Alanı ${target} birimkare olan, doğal sayı kenarlı en az iki farklı dikdörtgen oluştur. Kenarlarını ve çevrelerini tabloya yaz. Alan aynı kalırken çevre hakkında ne söyleyebilirsin? Şeklin ve işlemlerinle açıkla.`
    : `Çevresi ${target} birim olan, doğal sayı kenarlı en az iki farklı dikdörtgen oluştur. Her modelin alanı 36 birimkareyi aşmasın. Kenarlarını ve alanlarını tabloya yaz. Çevre aynı kalırken alan hakkında ne söyleyebilirsin? Şeklin ve işlemlerinle açıkla.`;
  const draft = {
    schemaVersion: 'geometric-comparison-editor-draft/v1', id, state: 'editor_authoring_draft', direction, target,
    taskPrompt, models,
    comparison: { fixedQuantity: sameArea ? 'area' : 'perimeter', varyingQuantity: sameArea ? 'perimeter' : 'area',
      minimumConstructedModels: 2, maximumModelAreaSquareUnits: 36, canonicalSideOrder: 'width_less_than_or_equal_to_height',
      rotatedModelIsNotAnotherRectangle: true, completeTeacherCandidateList: true, learnerMustEnumerateEveryCandidate: false },
    table: { state: 'answer_bearing_teacher_reference', columns: ['model', 'width', 'height', 'areaSquareUnits', 'perimeterUnits'],
      rows: models.map(m => ({ modelId: m.id, width: m.width, height: m.height, areaSquareUnits: m.areaSquareUnits, perimeterUnits: m.perimeterUnits })) },
    rationale: {
      fixedMeaning: sameArea ? 'Bütün modeller aynı sayıda birim kare kaplar.' : 'Bütün modellerin dört kenarının toplamı aynıdır.',
      variableMeaning: sameArea ? 'Kareleri farklı dikdörtgen düzenlerine yerleştirmek dış sınırı değiştirebilir.' : 'Aynı dış sınır toplamı farklı genişlik-yükseklik düzenlerinde farklı yüzeyler çevreleyebilir.',
      method: 'Önce çizimi ve sabit koşulu doğrula. Alanı birim karelerden, çevreyi dört kenardan belirle; tablo ile karşılaştır.',
      conclusion: sameArea ? 'Bu geçerli modeller aynı alanın aynı çevreyi zorunlu kılmadığını gösterir.' : 'Bu geçerli modeller aynı çevrenin aynı alanı zorunlu kılmadığını gösterir.',
      noSingleInverseAnswerAssumption: true,
    },
    shortPracticalNotes: [
      { title: 'Önce sabit olanı bul', text: sameArea ? 'Alan hedefini her modelde koru; çevreyi ayrıca hesapla.' : 'Çevre hedefini her modelde koru; alanı ayrıca hesapla.' },
      { title: 'Formülün anlamı', text: 'Çevre = 2 × (a + b); dört kenarı sayar. Alan = a × b; eş birim kareleri sayar.' },
      { title: 'Püf nokta', text: 'Döndürülmüş aynı modeli yeni dikdörtgen sayma. Kareyi dikdörtgenlerin dışında bırakma.' },
      { title: 'Geçerlilik koşulu', text: 'Pozitif tam sayı kenar, tutarlı birim ve her modelde en fazla 36 birimkare. Alan birimi dönüşümü bu görevde istenmez.' },
    ],
    assessment: { constructionRequired: true, explanationRequired: true, rubricImplemented: false,
      learnerEvidenceCaptured: false, masteryInferenceAllowed: false,
      requiredEvidence: [
        { kind: 'construction', description: 'Öğrencinin en az iki farklı koşula uygun dikdörtgen çizimi; hazır seçim tek başına yeterli değil.' },
        { kind: 'table', description: 'Kenar, alan ve çevre bilgilerinin çizimle eşleştiği öğrenci tablosu.' },
        { kind: 'explanation', description: 'Sabit ve değişen büyüklükleri modellerine dayanarak kendi sözleriyle açıklaması.' },
        { kind: 'verification', description: 'Sabit koşul, dört kenar sayımı, birim kareler ve 36 sınırı için kendi kontrolü.' },
      ] },
    visual: visual(models, direction, target),
    sourceReference: {
      matrixPath: 'sources/grade5-geometric-quantities-authoring-matrix.json',
      matrixSha256: '38a87129dd7f4cc31adc48a81e600de0f65d1f32ae36ff3aef529168d3c61763',
      programSourceId: 'tymm-current-ortaokul-matematik',
      programPdfSha256: '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734',
      programOutputCandidate: 'MAT.5.4.3', gradeCandidate: 5, physicalAndPrintedPages: [51, 53, 54],
      microSkillCandidateIds: sameArea ? ['GQ-413-a-A2P', 'GQ-413-b-A2P', 'GQ-413-c-A2P'] : ['GQ-413-a-P2A', 'GQ-413-b-P2A', 'GQ-413-c-P2A'],
      mappingStatus: 'authoring_reference_only', fullProgramSemanticsAccepted: false,
      effectiveProgramDecision: 'pending', commercialReuseRights: 'unverified', sourceRedistributionAllowed: false,
    },
    counts: { authoringTasks: 1, semanticFamilies: 1, referenceModelRows: models.length,
      modelRowsAreQuestionCount: false, expertAcceptedItems: 0, publishedQuestions: 0 },
    localMathChecks: 'passed', audience: 'editor_review_only', ownerId: 'unassigned', stewardId: 'unassigned',
    originalityReview: 'archive_similarity_not_performed', difficultyCalibration: 'unknown',
    activeProgramVerified: false, teacherApproved: false, expertApproved: false,
    curriculumReview: 'pending', rightsReview: 'pending', publicationReady: false, learnerReady: false, productionReady: false,
    providerCallsMade: 0, learnerDataPresent: false, sourceContentTransferred: false,
    pending: ['active_program_decision', 'source_to_item_semantic_acceptance', 'archive_similarity_review',
      'construction_and_open_ended_rubric', 'teacher_and_expert_review', 'commercial_rights_review',
      'difficulty_calibration', 'raster_visual_and_accessibility_review', 'learner_payload_and_reveal_design',
      'media_trace_and_factory_integration'] };
  draft.contentSha256 = sha256(JSON.stringify(draft));
  return freeze(draft);
}
