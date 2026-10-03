import { createHash } from 'node:crypto';
import { createInkPlan, renderInkFrameSvg } from '../media/ink_timeline.mjs';

// Review-only authoring data. Never send the answer key/solution graph to a learner client.
const TEMPLATES = ['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap'];
const DEFAULT_METADATA = {
  source: { sourceId: 'internal-authoring:rectangle-pilot', rightsStatus: 'owned_original', purpose: 'original_math_pilot' },
  curriculum: { mappingStatus: 'unresolved', registryEntryId: null, programVersion: null, grade: null, outcomeCode: null, sourceUrl: null, sourceSha256: null },
  governance: { ownerId: 'unassigned', stewardId: 'unassigned', purpose: 'review_only', retentionPolicyId: 'pilot-review-v1' },
};
const clone = value => structuredClone(value);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const GARDEN_PLAN = createInkPlan();
const GARDEN_PLAN_SHA256 = hash(GARDEN_PLAN);
const DEFAULT_GARDEN_METADATA = { ...DEFAULT_METADATA, source: { ...DEFAULT_METADATA.source, sourceId: `internal-authoring:${GARDEN_PLAN.id}` } };
const isGarden = problem => problem?.template === 'garden_two_rows';

function gardenSnapshotDigest(value) {
  // Clone as data first: a caller's toJSON function must not conceal altered fields.
  try { return hash(structuredClone(value)); } catch { return null; }
}

function gardenContentIntegrity(question) {
  try { return question.contentSha256 === contentDigest(question); } catch { return false; }
}

function validGardenGeometry(problem) {
  const ratio = problem?.longSideRatio;
  return Object.keys(problem).sort().join(',') === 'gateWidth,longSideRatio,shortSide,template,wireRows'
    && problem.shortSide === 18 && problem.gateWidth === 4 && problem.wireRows === 2
    && ratio && Object.keys(ratio).sort().join(',') === 'denominator,numerator'
    && ratio.numerator === 3 && ratio.denominator === 2;
}

function validGeometry(problem) {
  if (isGarden(problem)) return !!validGardenGeometry(problem);
  if (!problem || !TEMPLATES.includes(problem.template)) return false;
  const { width, height, gate, template } = problem;
  if (![width, height].every(value => Number.isInteger(value) && value > 0 && value <= 100)) return false;
  if (template === 'fence_gap' && !(Number.isInteger(gate) && gate > 0 && gate <= width)) return false;
  if (template === 'error_diagnosis' && width * height === 2 * (width + height)) return false;
  return true;
}

function buildAuthoring(problem) {
  const { template, width: w, height: h, gate } = problem;
  const perimeter = 2 * (w + h), area = w * h;
  const rows = {
    perimeter: { prompt: `Kenarları ${w} cm ve ${h} cm olan dikdörtgenin çevresi kaç santimetredir?`, answer: perimeter, unit: 'cm', intent: 'Dört kenarın toplamını çevre olarak yorumlama.', steps: [{ expression: `${w} + ${h}`, value: w + h, narration: 'Bir uzun ve bir kısa kenarı topla.' }, { expression: `2 × ${w + h}`, value: perimeter, narration: `İki eş kenar çiftini say: çevre ${perimeter} santimetre.` }] },
    area: { prompt: `Kenarları ${w} cm ve ${h} cm olan dikdörtgenin alanı kaç santimetrekaredir?`, answer: area, unit: 'cm²', intent: 'Birim karelerle alan ile kenar uzunluğunu ilişkilendirme.', steps: [{ expression: `${h} sıra, her sırada ${w} birim kare`, value: w, narration: 'Bir sıradaki birim kareleri belirle.' }, { expression: `${w} × ${h}`, value: area, narration: `${h} sıradaki tüm kareleri say: alan ${area} santimetrekare.` }] },
    width_from_area: { prompt: `Alanı ${area} cm² ve bir kenarı ${h} cm olan dikdörtgenin diğer kenarı kaç santimetredir?`, answer: w, unit: 'cm', intent: 'Alan bağıntısını tersine kullanarak bilinmeyen kenarı bulma.', steps: [{ expression: `Alan = ${area} cm²`, value: area, narration: 'Toplam birim kare sayısını belirle.' }, { expression: `${area} ÷ ${h}`, value: w, narration: `${h} eş sıraya ayır: diğer kenar ${w} santimetre.` }] },
    width_from_perimeter: { prompt: `Çevresi ${perimeter} cm ve bir kenarı ${h} cm olan dikdörtgenin diğer kenarı kaç santimetredir?`, answer: w, unit: 'cm', intent: 'Çevre bağıntısını tersine kullanarak bilinmeyen kenarı bulma.', steps: [{ expression: `${perimeter} ÷ 2`, value: w + h, narration: 'Bir uzun ve bir kısa kenarın toplamını bul.' }, { expression: `${w + h} − ${h}`, value: w, narration: `Bilinen kenarı çıkar: diğer kenar ${w} santimetre.` }] },
    error_diagnosis: { prompt: `Bir öğrenci ${w} cm ve ${h} cm kenarlı dikdörtgenin çevresini ${w} × ${h} = ${area} cm diye hesapladı. Alan ile çevreyi karıştırmış olabilir. Dikdörtgenin doğru çevresi kaç santimetredir?`, answer: perimeter, unit: 'cm', intent: 'Alan ile çevreyi ayırt etme ve işlem hatasını gerekçelendirme.', steps: [{ expression: `${w} × ${h} alanı verir; çevreyi değil`, value: area, narration: 'Çarpım alanı verir. Çevre, sınırdaki kenarların toplamıdır.' }, { expression: `${w} + ${h} + ${w} + ${h}`, value: perimeter, narration: `Dört kenarı topla: doğru çevre ${perimeter} santimetre.` }] },
    fence_gap: { prompt: `Kenarları ${w} cm ve ${h} cm olan dikdörtgen biçimindeki bir modelin sınırına şerit takılacak. Bir kenarda ${gate} cm açıklık bırakılırsa kaç santimetre şerit gerekir?`, answer: perimeter - gate, unit: 'cm', intent: 'Çevre modelini kısıtlı bir duruma aktarma ve gereksiz kısmı çıkarma.', steps: [{ expression: `2 × (${w} + ${h})`, value: perimeter, narration: 'Önce bütün sınırın uzunluğunu hesapla.' }, { expression: `${perimeter} − ${gate}`, value: perimeter - gate, narration: `Açık bırakılan kısmı çıkar: ${perimeter - gate} santimetre şerit gerekir.` }] },
  };
  return rows[template];
}

function renderDiagram(problem) {
  const { template, width, height, gate } = problem;
  const hiddenWidth = template.startsWith('width_from_');
  const topLabel = hiddenWidth ? '? cm' : `${width} cm`;
  const innerLabel = template === 'width_from_area' ? `Alan: ${width * height} cm²` : template === 'width_from_perimeter' ? `Çevre: ${2 * (width + height)} cm` : '';
  const gateMark = template === 'fence_gap' ? `<path d="M 125 250 L 195 250" stroke="#fff8ec" stroke-width="11"/><path d="M 125 250 L 195 250" stroke="#b9563e" stroke-width="3" stroke-dasharray="5 5"/><text x="160" y="292" text-anchor="middle">Açıklık: ${gate} cm</text>` : '';
  const alt = `Ölçekli olmayan dikdörtgen çizimi. Yatay kenar ${hiddenWidth ? 'bilinmiyor' : width + ' cm'}, düşey kenar ${height} cm.${innerLabel ? ' ' + innerLabel + '.' : ''}${template === 'fence_gap' ? ' Bir kenarda ' + gate + ' cm açıklık var.' : ''}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 340" role="img" aria-labelledby="title desc"><title id="title">Dikdörtgen problemi</title><desc id="desc">${escape(alt)}</desc><rect width="560" height="340" rx="26" fill="#fff8ec"/><g font-family="Georgia,serif" font-size="22" fill="#193b38"><rect x="65" y="85" width="400" height="165" rx="2" fill="#e6efe9" stroke="#32635a" stroke-width="4"/><path d="M 65 105 L 85 105 L 85 85" stroke="#32635a" fill="none" stroke-width="2"/><text x="265" y="62" text-anchor="middle">${topLabel}</text><text x="485" y="172">${height} cm</text><text x="265" y="177" text-anchor="middle" font-size="20">${innerLabel}</text>${gateMark}<text x="265" y="325" font-size="14" text-anchor="middle" fill="#66766d">Şekil ölçekli değildir.</text></g></svg>`;
  return { format: 'image/svg+xml', svg, alt, sha256: hash({ svg, alt }), geometry: clone(problem), notToScale: true };
}

function contentDigest(item) {
  return hash({ id: item.id, problem: item.problem, prompt: item.prompt, options: item.options, answerIndex: item.answerIndex, answerUnit: item.answerUnit, solutionGraph: item.solutionGraph, visual: item.visual, metadata: item.metadata, cognitiveIntent: item.cognitiveIntent, difficulty: item.difficulty, ...(isGarden(item.problem) ? { inkPlan: item.inkPlan, inkPlanSha256: item.inkPlanSha256 } : {}) });
}

function buildGardenAuthoring(plan) {
  return {
    prompt: plan.question, answer: plan.answer, unit: plan.answerUnit,
    steps: plan.solutionGraph.map(step => ({ stepId: step.id, dependsOn: clone(step.dependsOn), expression: step.expression, value: step.value, unit: step.unit, meaning: step.meaning, narration: plan.segments.find(segment => segment.id === step.id).narration })),
  };
}

function gardenDistractorHypotheses(plan) {
  const perimeter = plan.solutionGraph[1].value;
  const { gateWidth, wireRows } = plan.problem;
  return [
    { value: perimeter * wireRows - gateWidth, strategy: 'subtract_gate_once_after_two_rows', status: 'author_hypothesis_not_student_diagnosis' },
    { value: perimeter * wireRows, strategy: 'ignore_gate_gap', status: 'author_hypothesis_not_student_diagnosis' },
    { value: perimeter - gateWidth, strategy: 'calculate_one_row_only', status: 'author_hypothesis_not_student_diagnosis' },
  ];
}

function renderGardenDiagram(plan, problem) {
  const svg = renderInkFrameSvg(plan, 0);
  const alt = `Ölçekli olmayan bahçe çizimi. ${plan.question} Başlangıç karesinde uzun kenar bilinmiyor; çözüm sonucu gösterilmiyor.`;
  return { format: 'image/svg+xml', svg, alt, sha256: hash({ svg, alt }), geometry: clone(problem), notToScale: true, sourcePlanSha256: hash(plan) };
}

/** Original fixed garden fixture, in the same private-review question contract as rectangles. */
export function createGardenQuestion({ id, metadata = DEFAULT_GARDEN_METADATA }) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('invalid_question_id');
  const plan = GARDEN_PLAN;
  const problem = { template: 'garden_two_rows', ...clone(plan.problem) };
  if (!validGeometry(problem)) throw new Error('invalid_geometry');
  const authored = buildGardenAuthoring(plan);
  const distractorHypotheses = gardenDistractorHypotheses(plan);
  const options = [authored.answer, ...distractorHypotheses.map(item => item.value)];
  const rotation = [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 4;
  const rotated = [...options.slice(rotation), ...options.slice(0, rotation)];
  const question = {
    schemaVersion: 'content-factory-pilot/v1', id, state: 'draft', problem, prompt: authored.prompt,
    options: rotated, answerIndex: rotated.indexOf(authored.answer), answerUnit: authored.unit,
    solutionGraph: authored.steps,
    cognitiveIntent: { description: 'Oranla kenar uzunluğunu bulma, dört kenarı sayma ve her tel sırasında kapı açıklığını çıkarma.', family: problem.template, measurementClaim: 'observed_task_performance_only', distractorHypotheses },
    difficulty: { level: 'intermediate', calibrationStatus: 'AUTHOR_ESTIMATED', notAPsychometricScore: true },
    metadata: clone(metadata), visual: renderGardenDiagram(plan, problem),
    inkPlan: clone(plan), inkPlanSha256: GARDEN_PLAN_SHA256,
  };
  question.contentSha256 = contentDigest(question);
  return question;
}

export function createRectangleQuestion({ id, template, width, height, gate = 2, metadata = DEFAULT_METADATA }) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('invalid_question_id');
  const problem = { template, width, height, ...(template === 'fence_gap' ? { gate } : {}) };
  if (!validGeometry(problem)) throw new Error('invalid_geometry');
  const authored = buildAuthoring(problem);
  const options = [authored.answer, authored.answer + 1, authored.answer + 2, Math.max(0, authored.answer - 1)];
  const rotation = [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 4;
  const rotated = [...options.slice(rotation), ...options.slice(0, rotation)];
  const question = {
    schemaVersion: 'content-factory-pilot/v1', id, state: 'draft', problem, prompt: authored.prompt,
    options: rotated, answerIndex: rotated.indexOf(authored.answer), answerUnit: authored.unit,
    solutionGraph: authored.steps.map((step, index) => ({ stepId: `step-${index + 1}`, dependsOn: index ? [`step-${index}`] : [], ...step })),
    cognitiveIntent: { description: authored.intent, family: template, measurementClaim: 'observed_task_performance_only' },
    difficulty: { level: ['width_from_area', 'width_from_perimeter', 'fence_gap'].includes(template) ? 'intermediate' : 'introductory', calibrationStatus: 'AUTHOR_ESTIMATED', notAPsychometricScore: true },
    metadata: clone(metadata), visual: renderDiagram(problem),
  };
  question.contentSha256 = contentDigest(question);
  return question;
}

// Separate path from the generator: enumerate the four edges / count repeated rows.
// It is deterministic arithmetic validation, not an independent human or second AI review.
function independentlySolve(problem) {
  if (isGarden(problem)) {
    // Count ratio shares, then enumerate each row's four edges and its own gate gap.
    // This path never reads the ink plan's answer or solution graph.
    const share = problem.shortSide / problem.longSideRatio.denominator;
    let longSide = 0;
    for (let part = 0; part < problem.longSideRatio.numerator; part++) longSide += share;
    let wire = 0;
    for (let row = 0; row < problem.wireRows; row++) {
      for (const edge of [problem.shortSide, longSide, problem.shortSide, longSide]) wire += edge;
      wire -= problem.gateWidth;
    }
    return wire;
  }
  const edges = [problem.width, problem.height, problem.width, problem.height];
  const edgeTotal = edges.reduce((sum, value) => sum + value, 0);
  let squares = 0;
  for (let row = 0; row < problem.height; row++) squares += problem.width;
  if (problem.template === 'area') return squares;
  if (problem.template === 'width_from_area') {
    let candidate = 0;
    while (candidate * problem.height < squares) candidate++;
    return candidate;
  }
  if (problem.template === 'width_from_perimeter') return (edgeTotal - problem.height - problem.height) / 2;
  if (problem.template === 'fence_gap') return edgeTotal - problem.gate;
  return edgeTotal;
}

export function validateQuestion(question) {
  const errors = [], pending = [];
  const garden = isGarden(question?.problem);
  const geometry = validGeometry(question?.problem);
  if (!geometry) errors.push('invalid_geometry');
  const expected = geometry ? independentlySolve(question.problem) : null;
  const uniqueOptions = Array.isArray(question?.options) && question.options.length === 4 && question.options.every(Number.isFinite) && new Set(question.options).size === 4;
  if (!uniqueOptions) errors.push('invalid_options');
  const numericAnswer = geometry && uniqueOptions && Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < 4 && question.options[question.answerIndex] === expected;
  if (!numericAnswer) errors.push('incorrect_answer_key');
  const expectedVisual = geometry ? garden ? renderGardenDiagram(GARDEN_PLAN, question.problem) : renderDiagram(question.problem) : null;
  const diagram = geometry && question.visual?.svg === expectedVisual.svg && question.visual?.sha256 === hash({ svg: question.visual.svg, alt: question.visual.alt }) && (!garden || (question.visual.format === expectedVisual.format && question.visual.notToScale === true && gardenSnapshotDigest(question.visual.geometry) === hash(question.problem) && question.visual.sourcePlanSha256 === GARDEN_PLAN_SHA256));
  if (!diagram) errors.push('stale_or_invalid_diagram');
  const accessibility = typeof question?.visual?.alt === 'string' && question.visual.alt.trim().length > 10;
  if (!accessibility) errors.push('missing_visual_alt');
  const expectedAuthored = geometry ? garden ? buildGardenAuthoring(GARDEN_PLAN) : buildAuthoring(question.problem) : null;
  const semanticBinding = geometry && question.prompt === expectedAuthored.prompt && question.answerUnit === expectedAuthored.unit && question.visual?.alt === expectedVisual.alt;
  if (!semanticBinding) errors.push('problem_semantics_mismatch');
  const expectedSteps = expectedAuthored?.steps ?? [];
  const solutionGraph = geometry && Array.isArray(question.solutionGraph) && question.solutionGraph.length === expectedSteps.length && (garden ? gardenSnapshotDigest(question.solutionGraph) === hash(expectedSteps) : question.solutionGraph.every((step, index) => step.value === expectedSteps[index].value && step.expression === expectedSteps[index].expression && step.narration === expectedSteps[index].narration && step.stepId === `step-${index + 1}` && JSON.stringify(step.dependsOn) === JSON.stringify(index ? [`step-${index}`] : []))) && question.solutionGraph.at(-1).value === expected;
  if (!solutionGraph) errors.push('stale_or_invalid_solution_graph');
  const inkPlanBinding = !garden || (!!question.inkPlan && question.inkPlanSha256 === GARDEN_PLAN_SHA256 && gardenSnapshotDigest(question.inkPlan) === GARDEN_PLAN_SHA256 && expected === 172);
  if (!inkPlanBinding) errors.push('invalid_or_unbound_ink_plan');
  const expectedDistractors = garden ? gardenDistractorHypotheses(GARDEN_PLAN) : [];
  const distractorBinding = !garden || (uniqueOptions && gardenSnapshotDigest([...question.options].sort((a, b) => a - b)) === hash([172, ...expectedDistractors.map(item => item.value)].sort((a, b) => a - b)) && gardenSnapshotDigest(question.cognitiveIntent?.distractorHypotheses) === hash(expectedDistractors));
  if (!distractorBinding) errors.push('invalid_distractor_binding');
  const integrity = !!question && (garden ? gardenContentIntegrity(question) : question.contentSha256 === contentDigest(question));
  if (!integrity) errors.push('content_integrity_mismatch');
  const source = question?.metadata?.source;
  if (!(source && typeof source.sourceId === 'string' && source.sourceId && typeof source.rightsStatus === 'string' && source.purpose)) errors.push('missing_source_metadata');
  const curriculum = question?.metadata?.curriculum;
  if (!(curriculum && typeof curriculum.mappingStatus === 'string' && Object.hasOwn(curriculum, 'programVersion') && Object.hasOwn(curriculum, 'outcomeCode'))) errors.push('missing_curriculum_metadata');
  // No caller-supplied "verified" flag can resolve registry evidence in this local pilot.
  pending.push('canonical_curriculum_mapping', 'archive_similarity_review', 'language_and_pedagogy_review', 'trusted_expert_review', 'calibrated_item_difficulty');
  const mathReady = geometry && numericAnswer && uniqueOptions && diagram && accessibility && semanticBinding && solutionGraph && inkPlanBinding && distractorBinding && integrity;
  return { state: 'draft', localMathChecks: mathReady ? 'passed' : 'failed', automatedPass: false, publishReady: false, checks: { geometry, numericAnswer, uniqueOptions, diagram, accessibility, semanticBinding, solutionGraph, integrity, ...(garden ? { inkPlanBinding, distractorBinding } : {}) }, errors, pending };
}

export function requestStateTransition(question, targetState) {
  if (!['draft', 'automated_pass', 'expert_approved', 'published'].includes(targetState)) return { allowed: false, reason: 'invalid_state' };
  if (['expert_approved', 'published'].includes(targetState)) return { allowed: false, reason: 'trusted_review_store_not_connected' };
  if (targetState === 'automated_pass') return { allowed: false, reason: 'canonical_registry_and_full_quality_gates_not_connected', review: validateQuestion(question) };
  return { allowed: true, state: 'draft' };
}

export function auditBatch(items, { variantCap = 2 } = {}) {
  if (!Array.isArray(items) || items.length > 100 || !Number.isInteger(variantCap) || variantCap < 1 || variantCap > 2) throw new Error('batch_limit_or_variant_cap');
  const retained = [], rejections = [], seenProblems = new Set(), familyCounts = new Map();
  for (const item of items) {
    if (!validGeometry(item?.problem)) { rejections.push({ id: item?.id ?? null, reason: 'invalid_geometry' }); continue; }
    const sides = item.problem.template.startsWith('width_from_') ? [item.problem.width, item.problem.height] : [item.problem.width, item.problem.height].sort((a, b) => a - b);
    const signature = isGarden(item.problem) ? hash({ template: item.problem.template, ...GARDEN_PLAN.problem }) : hash({ template: item.problem.template, sides, gate: item.problem.gate ?? null });
    if (seenProblems.has(signature)) { rejections.push({ id: item.id, reason: 'duplicate_problem' }); continue; }
    seenProblems.add(signature);
    const family = item.problem.template;
    if ((familyCounts.get(family) ?? 0) >= variantCap) { rejections.push({ id: item.id, reason: 'low_diversity_variant_cap', family }); continue; }
    const review = validateQuestion(item);
    if (review.errors.length) { rejections.push({ id: item.id, reason: 'failed_local_validation', errors: review.errors }); continue; }
    familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
    retained.push({ ...item, state: 'draft', review });
  }
  return { items: retained, rejections, summary: { requested: items.length, producedDrafts: retained.length, mathematicallyVerified: retained.filter(item => item.review.localMathChecks === 'passed').length, rejected: rejections.length, semanticFamilies: familyCounts.size, automatedPassed: 0, expertApproved: 0, published: 0, variantCap, originalityClaim: 'no_archive_similarity_clearance' } };
}

export function createPilotBatch({ requested = 12, metadata = DEFAULT_METADATA } = {}) {
  if (!Number.isInteger(requested) || requested < 1 || requested > 100) throw new Error('batch_limit_1_to_100');
  const candidates = [];
  for (let index = 0; index < requested; index++) {
    const template = TEMPLATES[index % TEMPLATES.length];
    let width = 2 + index % 13;
    const height = 2 + Math.floor(index / 13) % 9;
    if (template === 'error_diagnosis' && width * height === 2 * (width + height)) width++;
    candidates.push(createRectangleQuestion({ id: `rectangle-${String(index + 1).padStart(3, '0')}`, template, width, height, gate: 1, metadata }));
  }
  return auditBatch(candidates);
}

export function createStoryboard(question) {
  const review = validateQuestion(question);
  if (review.localMathChecks !== 'passed' || review.errors.length) throw new Error('unverified_solution');
  return {
    format: 'svg-step-storyboard/v1', questionId: question.id, sourceContentSha256: question.contentSha256, state: 'draft', videoRendered: false, audioRendered: false,
    frames: question.solutionGraph.map((step, index) => ({ frameId: `frame-${index + 1}`, startMs: index * 4500, durationMs: 4500, sourceStepId: step.stepId, expression: step.expression, value: step.value, narration: step.narration, diagramSha256: question.visual.sha256, svg: question.visual.svg })),
    transcript: question.solutionGraph.map(step => step.narration).join('\n'),
    pending: ['expert_scene_review', 'audio_and_caption_render', 'video_render', 'rendered_frame_semantic_check'],
  };
}

export function createLesson(question) {
  const storyboard = createStoryboard(question);
  return { schemaVersion: 'lesson-factory-pilot/v1', id: `lesson-${question.id}`, state: 'draft', metadata: clone(question.metadata), learningIntent: question.cognitiveIntent.description, concept: question.problem.template === 'area' || question.problem.template === 'width_from_area' ? 'Alan, şeklin kapladığı birim karelerin sayısıdır.' : 'Çevre, şeklin sınırındaki bütün kenarların toplamıdır.', workedExample: { questionId: question.id, sourceContentSha256: question.contentSha256, prompt: question.prompt, answer: question.options[question.answerIndex], steps: clone(question.solutionGraph), visual: clone(question.visual) }, teacherHint: 'Çevre ile alanı karıştırıyorsa önce kenarları parmakla izletin, sonra birim kareleri saydırın. Hata tek başına zekâ veya kalıcı yetenek kanıtı değildir.', storyboard, pending: [...question.review?.pending ?? validateQuestion(question).pending] };
}
