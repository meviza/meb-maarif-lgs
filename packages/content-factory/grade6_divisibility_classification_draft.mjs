import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6ReferenceAuthoringPlan } from './grade6_reference_authoring_plan.mjs';

// One original editor task, informed by the reviewed MEB source brief. Existing
// source pins are resolved by the real planner; this module performs new-task QA.
const fail = code => { throw new Error(code); };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-divisibility-classification.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
const closed = (value, fields) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key));
const GATES = { activeProgram: 'pending', newTaskPedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'local_math_only', accessibility: 'pending' };
const FLAGS = { humanApproval: null, publicationReady: false, learnerReady: false, productionReady: false };
const CATEGORIES = ['only-2', 'only-3', 'both', 'neither'];

// Candidate data is a small inert wire snapshot, not arbitrary executable input.
function inert(input) {
  const active = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 4096 || depth > 16) fail('invalid_divisibility_candidate');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('invalid_divisibility_candidate'); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 8192 || bytes > 65536 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_divisibility_candidate');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || active.has(value)) fail('invalid_divisibility_candidate');
    const array = Array.isArray(value), proto = Object.getPrototypeOf(value), keys = Reflect.ownKeys(value);
    if (array ? proto !== Array.prototype : ![Object.prototype, null].includes(proto)) fail('invalid_divisibility_candidate');
    if (keys.length > 65 || keys.some(key => typeof key !== 'string' || key.length > 128 || /[\u0000-\u001f]/u.test(key))) fail('invalid_divisibility_candidate');
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (keys.some(key => !Object.hasOwn(descriptors[key], 'value') || key !== 'length' && !descriptors[key].enumerable)) fail('invalid_divisibility_candidate');
    for (const key of keys) { bytes += Buffer.byteLength(key); if (bytes > 65536) fail('invalid_divisibility_candidate'); }
    active.add(value); let result;
    if (array) {
      const length = descriptors.length.value;
      if (length > 64 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_divisibility_candidate');
      result = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_divisibility_candidate');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.sort().map(key => [key, copy(descriptors[key].value, depth + 1)]));
    active.delete(value); return result;
  }
  return copy(input);
}

function binding(input) {
  const plan = createGrade6ReferenceAuthoringPlan(input);
  const brief = plan.briefs.find(row => row.briefId === 'g6-reference-authoring-13');
  if (!brief || brief.evidence.taskKind !== 'classify_and_justify_joint_rules'
    || !same(brief.proposedOutcomeCodes, ['MAT.6.1.2'])) fail('invalid_divisibility_source_brief');
  return { brief, sourceLineage: { planContentSha256: plan.contentSha256, briefContentSha256: hash('source-brief', brief),
    briefId: brief.briefId, sourceId: brief.sourceReference.sourceId, sourceSha256: brief.sourceReference.sourceSha256,
    sourceOrdinal: brief.sourceReference.ordinal, physicalPdfPage: brief.sourceReference.physicalPdfPage,
    formMetadataSha256: plan.lineage.formMetadataRevisionSha256, semanticMetadataSha256: plan.lineage.semanticMetadataRevisionSha256,
    state: 'reviewed_source_metadata_recomputed_for_new_task_qa', freshPdfByteChecks: 0 } };
}

// Authoring uses whole-value remainder tests, not the verification decimal rules.
function authorSolution(cards) {
  const cardReasons = cards.map(card => {
    const divisibleBy2 = card.value % 2 === 0, divisibleBy3 = card.value % 3 === 0;
    const categoryId = divisibleBy2 ? divisibleBy3 ? 'both' : 'only-2' : divisibleBy3 ? 'only-3' : 'neither';
    const digits = String(card.value).split('').map(Number), digitSum = digits.reduce((sum, digit) => sum + digit, 0);
    return { cardId: card.id, divisibleBy2, divisibleBy3, categoryId,
      why2: `${card.value} sayısının son basamağı ${digits.at(-1)}; bu nedenle 2 ile ${divisibleBy2 ? 'kalansız bölünür' : 'kalansız bölünmez'}.`,
      why3: `Rakamlar toplamı ${digits.join(' + ')} = ${digitSum}; ${digitSum}, 3 ile ${divisibleBy3 ? 'kalansız bölündüğü için sayı da bölünür' : 'kalansız bölünmediği için sayı da bölünmez'}.` };
  });
  const correctGroups = CATEGORIES.map(categoryId => ({ categoryId, cardIds: cardReasons.filter(row => row.categoryId === categoryId).map(row => row.cardId) }));
  return { correctGroups, cardReasons, onePlacementPerCard: true };
}
function record(input) {
  const { brief, sourceLineage } = binding(input);
  const cards = [14, 21, 24, 25, 32, 33, 42, 47].map(value => ({ id: `card-${value}`, value }));
  const solution = authorSolution(cards);
  const draft = {
    schemaVersion: 'grade6-divisibility-classification-draft/v1', id: 'grade6-divisibility-classification-v1', state: 'draft', artifactAudience: 'editor_only',
    title: 'İki Kuralı Birlikte Gör', sourceLineage,
    scope: { gradeCandidate: 6, courseCandidate: 'matematik', activeAcademicYear: null, programVersion: null,
      proposedOutcomeCodes: [...brief.proposedOutcomeCodes], officialOutcomeCode: null, activeProgramAccepted: false, fullOutcomeCoverage: false },
    problem: { family: 'joint_divisibility_card_classification', cards,
      rules: [{ id: 'divisible-by-2', divisor: 2, label: '2 ile kalansız bölünür' }, { id: 'divisible-by-3', divisor: 3, label: '3 ile kalansız bölünür' }],
      categories: [{ id: 'only-2', label: 'Yalnız 2 ile' }, { id: 'only-3', label: 'Yalnız 3 ile' }, { id: 'both', label: '2 ve 3 ile' }, { id: 'neither', label: 'İkisiyle de değil' }] },
    prompt: 'Sayı kartlarını iki kurala göre incele. Her kartı yalnız bir kategoriye yerleştir: Yalnız 2 ile, yalnız 3 ile, hem 2 hem 3 ile veya ikisiyle de kalansız bölünmeyenler. Her sayı için iki kuralı ayrı ayrı kontrol et; hiçbir kartı dışarıda bırakma veya iki kez yerleştirme.',
    purpose: { statement: 'İki bölünebilme koşulunu ayrı sınayıp ortak üyeliği tek koşullu üyelikten ayırma', sourceBriefTaskKind: brief.evidence.taskKind,
      taskKind: 'classify_given_cards_by_two_rules', microAimIds: [...brief.purpose.microAimIds],
      evidenceKind: 'authored_classification_task_not_learner_response', learnerEvidenceCollected: false, fullBriefEvidenceFulfilled: false,
      notMeasured: ['learner_explanation_quality', 'mastery', 'ability', 'speed', 'whole_outcome_coverage'] },
    solution,
    answerKey: { placements: solution.cardReasons.map(row => ({ cardId: row.cardId, categoryId: row.categoryId })) },
    explanation: {
      goal: 'Her kartın iki kurala ayrı ayrı uyup uymadığını bulup onu dört kategoriden yalnız birine yerleştirmek istiyoruz.',
      givenMeaning: 'Karttaki sayı, kalansız bölünebilme kararını vereceğimiz doğal sayıdır. 2 ve 3 ise kart adedi veya grup sayısı değil, kontrol edeceğimiz bölenlerdir.',
      route: 'İstenen iki kuralı ayır → Her sayıda iki kararı ayrı ver → İki kararın birleşimine uygun kategoriyi seç → Sekiz kartı birer kez yerleştirdiğini doğrula.',
      because: 'Çift olmak yalnız 2 ile bölünebilme kararını verir. Ortak kategoriye koymak için 3 ile bölünebilme koşulunun da sağlandığını göstermeliyiz; tek kontrol ortaklığı kanıtlamaz.',
      conditions: ['Bu görev pozitif ve küçük doğal sayı kartları içindir.', 'Kalansız bölünür demek, bölme sonunda kalan 0 demektir.', 'Yalnız sözcüğü diğer kuralın sağlanmadığını da belirtir; hem sözcüğü iki kuralın birlikte sağlanmasını ister.'],
      steps: [
        { id: 'read-rules', why: 'Tek bir doğru özellik bulmak yetmez; görev iki özelliğin birleşimini istiyor.', result: [2, 3], meaning: 'Her kartta ayrı ayrı sınanacak iki bölen' },
        { id: 'check-two-rules', why: 'Son basamak ve rakam toplamı farklı koşulları sınar; birinden ötekini tahmin etmeyiz.',
          result: solution.cardReasons.map(row => ({ cardId: row.cardId, divisibleBy2: row.divisibleBy2, divisibleBy3: row.divisibleBy3 })), meaning: 'Her kart için iki ayrı kalansız bölünebilme kararı' },
        { id: 'partition-once', why: 'İki evet, yalnız bir evet veya iki hayır kararı dört ayrı kategori oluşturur.', result: solution.correctGroups, meaning: 'Kartların birbirini dışlayan dört üyelik grubu' },
        { id: 'verify-coverage', why: 'Doğru kategori kadar eksik veya tekrarlı kart bırakmamak da görev koşuludur.', result: 8, meaning: 'Dört grupta birer kez yer alan sekiz farklı kart' },
      ],
      conditionalShortcut: { worksWhen: 'Pozitif doğal sayının 2 ve 3 ile kalansız bölünüp bölünmediğini kontrol ederken',
        why: '2 için yalnız son basamağın çiftliğini; 3 için rakamlar toplamının 3 ile kalansız bölünebilmesini kontrol edebiliriz. Böylece uzun bölme yerine iki anlamlı kısa kontrol yaparız.',
        check: '24 için son basamak 4 ve rakamlar toplamı 6 olduğundan iki kural da sağlanır. 14 için son basamak 4 olsa da toplam 5 olduğu için ortak kategori doğru değildir.',
        notImplied: 'Bu iki kısa kuralı başka bölenlere otomatik taşımayız; sınıflama yapmak öğrencinin kuralın gerekçesini açıklayabildiğini veya konuya hâkim olduğunu tek başına göstermez.' },
    },
    representation: { kind: 'text_labelled_membership_cards/v1', plannedRepresentationId: brief.plannedRepresentation.id,
      sourceTopologyCopied: false, colorOnlyMeaning: false, rendered: false, accessibilityPassed: false,
      pending: ['editor_renderer', 'keyboard_and_screen_reader_review'] },
    difficulty: { level: 'medium', basis: 'author_estimate_not_empirical', calibration: null, targetDistribution: null },
    counts: { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    repeatedCallsCreateDistinctStock: false, gates: { ...GATES },
    governance: { purpose: 'editor_original_math_draft', owner: 'pending', steward: 'pending', retention: 'pending', realLearnerDataPresent: false },
    originality: { origin: 'own_fixed_authoring_informed_by_reviewed_brief_13', sourceBodiesOptionsNumericVectorsMediaCopied: false,
      originalShape: 'eight_text_cards_four_semantic_categories_not_source_color_grid', archiveSimilarityPassed: false, originalityVerified: false },
    activity: { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 }, ...FLAGS,
  };
  draft.contentSha256 = hash('draft', draft); return draft;
}

/** One immutable original editor draft. Not a bulk generation or delivery API. */
export function createGrade6DivisibilityClassificationDraft(input) {
  if (arguments.length !== 1) fail('invalid_divisibility_authoring_arguments');
  const draft = record(input);
  if (Buffer.byteLength(JSON.stringify(draft)) > 65536) fail('divisibility_output_budget');
  return freeze(draft);
}

// Independent oracle: decimal final digit and digit sum, never whole-value %2/%3
// or the author's solution/key. Exact grouping is recomputed before comparisons.
function solve(cards) {
  const cardMembership = [...cards].sort((a, b) => a.value - b.value).map(card => {
    const digits = String(card.value).split(''), divisibleBy2 = ['0', '2', '4', '6', '8'].includes(digits.at(-1));
    let sum = 0; for (const digit of digits) sum += Number(digit);
    while (sum >= 3) sum -= 3;
    const divisibleBy3 = sum === 0;
    let categoryId = 'neither';
    if (divisibleBy2 && divisibleBy3) categoryId = 'both';
    else if (divisibleBy2) categoryId = 'only-2';
    else if (divisibleBy3) categoryId = 'only-3';
    return { cardId: card.id, value: card.value, divisibleBy2, divisibleBy3, categoryId };
  });
  return { cardMembership, correctGroups: CATEGORIES.map(categoryId => ({ categoryId, cardIds: cardMembership.filter(row => row.categoryId === categoryId).map(row => row.cardId) })) };
}
function problemShape(problem) {
  return closed(problem, ['family', 'cards', 'rules', 'categories']) && problem.family === 'joint_divisibility_card_classification'
    && Array.isArray(problem.cards) && problem.cards.length === 8 && problem.cards.every(card => closed(card, ['id', 'value'])
      && Number.isInteger(card.value) && card.value >= 1 && card.value <= 999 && card.id === `card-${card.value}`)
    && new Set(problem.cards.map(card => card.id)).size === 8
    && Array.isArray(problem.rules) && problem.rules.length === 2
    && problem.rules.every((rule, index) => closed(rule, ['id', 'divisor', 'label']) && rule.divisor === index + 2 && rule.id === `divisible-by-${index + 2}`)
    && Array.isArray(problem.categories) && problem.categories.length === 4
    && problem.categories.every((row, index) => closed(row, ['id', 'label']) && row.id === CATEGORIES[index]);
}
function placementCorrect(key, solved) {
  if (!closed(key, ['placements']) || !Array.isArray(key.placements) || key.placements.length !== 8) return false;
  const seen = new Set();
  return key.placements.every(row => {
    if (!closed(row, ['cardId', 'categoryId']) || seen.has(row.cardId)) return false;
    seen.add(row.cardId);
    return solved.cardMembership.some(card => card.cardId === row.cardId && card.categoryId === row.categoryId);
  });
}
function profile(draft) {
  const { contentSha256, answerKey, ...body } = draft;
  return { ...body, problem: { ...body.problem, cards: [...body.problem.cards].sort((a, b) => a.value - b.value) } };
}
const blank = () => ({ sourceLineage: false, scope: false, purpose: false, authoredProfile: false, exactMembership: false, answerKey: false, reasonedEvidence: false, contentIntegrity: false });
function report(checks = blank(), errors = ['invalid_divisibility_candidate'], recomputed = null) {
  const valid = errors.length === 0;
  return freeze({ schemaVersion: 'grade6-divisibility-classification-verification/v1', state: 'editor_diagnostic_only', valid,
    localMathChecks: valid ? 'passed' : 'failed', checks, errors, recomputed,
    counts: { auditedDrafts: recomputed ? 1 : 0, locallyMathPassedDrafts: valid ? 1 : 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...GATES }, ...FLAGS });
}

/** Recompute source binding and independently verify every card and answer.
 * Correct hashes are integrity evidence, not an expert approval or publication. */
export function verifyGrade6DivisibilityClassificationDraft(candidate, input) {
  if (arguments.length !== 2) return report(blank(), ['invalid_divisibility_verifier_arguments']);
  let draft, expected;
  try {
    draft = inert(candidate); expected = record(input);
    if (!closed(draft, Object.keys(expected)) || !problemShape(draft.problem)) return report();
  } catch { return report(blank(), ['invalid_divisibility_source_or_candidate']); }
  const solved = solve(draft.problem.cards);
  const reasons = draft.solution?.cardReasons;
  const exactMembership = closed(draft.solution, ['correctGroups', 'cardReasons', 'onePlacementPerCard'])
    && draft.solution.onePlacementPerCard === true && same(draft.solution.correctGroups, solved.correctGroups)
    && Array.isArray(reasons) && reasons.length === 8
    && reasons.every(row => closed(row, ['cardId', 'divisibleBy2', 'divisibleBy3', 'categoryId', 'why2', 'why3']))
    && new Set(reasons.map(row => row.cardId)).size === 8
    && reasons.every(row => solved.cardMembership.some(card => card.cardId === row.cardId && card.categoryId === row.categoryId
      && card.divisibleBy2 === row.divisibleBy2 && card.divisibleBy3 === row.divisibleBy3));
  const checks = {
    sourceLineage: same(draft.sourceLineage, expected.sourceLineage), scope: same(draft.scope, expected.scope), purpose: same(draft.purpose, expected.purpose),
    authoredProfile: same(profile(draft), profile(expected)), exactMembership, answerKey: placementCorrect(draft.answerKey, solved),
    reasonedEvidence: same(draft.explanation, expected.explanation)
      && same(draft.explanation.steps[2].result, solved.correctGroups)
      && draft.explanation.steps[3].result === solved.cardMembership.length,
    contentIntegrity: typeof draft.contentSha256 === 'string' && /^[a-f0-9]{64}$/u.test(draft.contentSha256)
      && draft.contentSha256 === hash('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))),
  };
  return report(checks, Object.entries(checks).filter(([, value]) => !value).map(([key]) => `divisibility_${key}_failed`), solved);
}
