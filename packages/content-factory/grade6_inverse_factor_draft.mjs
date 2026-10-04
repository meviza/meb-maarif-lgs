import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6ReferenceAuthoringPlan } from './grade6_reference_authoring_plan.mjs';

const fail = code => { throw new Error(code); };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-inverse-factor.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
const closed = (value, fields) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key));
const GATES = { activeProgram: 'pending', newTaskPedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' };
const FLAGS = { humanApproval: null, publicationReady: false, learnerReady: false, productionReady: false, serializedHashIsAuthority: false };
const positive = value => Number.isInteger(value) && value >= 1 && value <= 200;

// Only small inert wire snapshots reach mathematical checks; hooks never run.
function inert(input) {
  const active = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 4096 || depth > 16) fail('invalid_inverse_factor_candidate');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('invalid_inverse_factor_candidate'); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 8192 || bytes > 65536 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_inverse_factor_candidate');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || active.has(value)) fail('invalid_inverse_factor_candidate');
    const array = Array.isArray(value), proto = Object.getPrototypeOf(value), keys = Reflect.ownKeys(value);
    if (array ? proto !== Array.prototype : ![Object.prototype, null].includes(proto)) fail('invalid_inverse_factor_candidate');
    if (keys.length > 65 || keys.some(key => typeof key !== 'string' || key.length > 128 || /[\u0000-\u001f]/u.test(key))) fail('invalid_inverse_factor_candidate');
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (keys.some(key => !Object.hasOwn(descriptors[key], 'value') || key !== 'length' && !descriptors[key].enumerable)) fail('invalid_inverse_factor_candidate');
    for (const key of keys) { bytes += Buffer.byteLength(key); if (bytes > 65536) fail('invalid_inverse_factor_candidate'); }
    active.add(value); let result;
    if (array) {
      const length = descriptors.length.value;
      if (length > 64 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_inverse_factor_candidate');
      result = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_inverse_factor_candidate');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.sort().map(key => [key, copy(descriptors[key].value, depth + 1)]));
    active.delete(value); return result;
  }
  return copy(input);
}

function binding(input) {
  const plan = createGrade6ReferenceAuthoringPlan(input);
  const brief = plan.briefs.find(row => row.briefId === 'g6-reference-authoring-17');
  if (!brief || brief.evidence.taskKind !== 'reconstruct_and_prove_factor_list_completeness'
    || brief.sourceReference.family !== 'recover_number_and_missing_factor_pairs'
    || !same(brief.proposedOutcomeCodes, ['MAT.6.1.1'])) fail('invalid_inverse_factor_source_brief');
  return { brief, sourceLineage: { planContentSha256: plan.contentSha256, briefContentSha256: hash('source-brief', brief),
    briefId: brief.briefId, sourceId: brief.sourceReference.sourceId, sourceSha256: brief.sourceReference.sourceSha256,
    sourceOrdinal: brief.sourceReference.ordinal, physicalPdfPage: brief.sourceReference.physicalPdfPage,
    formMetadataSha256: plan.lineage.formMetadataRevisionSha256, semanticMetadataSha256: plan.lineage.semanticMetadataRevisionSha256,
    state: 'reviewed_source_metadata_recomputed_for_new_task_qa', freshPdfByteChecks: 0 } };
}

// Author uses multiples of the known right factor and a sqrt-bounded pair list.
// The independent mathematical oracle below does neither and does not use this
// solution or the key as its expected answer. The verifier then compares both.
function authorSolution() {
  const candidateNumbers = [];
  for (let number = 14; number <= 95; number += 14) {
    if (number >= 60 && number % 3 === 0 && 3 <= number / 3 && number / 14 <= 14) candidateNumbers.push(number);
  }
  const number = candidateNumbers[0], allFactorPairs = [];
  for (let left = 1; left * left <= number; left++) if (number % left === 0) allFactorPairs.push([left, number / left]);
  const completedPairs = [{ partialPairId: 'pair-3', left: 3, right: number / 3 }, { partialPairId: 'pair-14', left: number / 14, right: 14 }];
  const remainingPairs = allFactorPairs.filter(([left, right]) => !completedPairs.some(pair => pair.left === left && pair.right === right));
  return { candidateNumbers, number, completedPairs, allFactorPairs, remainingPairs, correctOptionId: 'option-b' };
}

function taskProfile(draft) {
  return { title: draft.title, scope: draft.scope, problem: draft.problem, prompt: draft.prompt, purpose: draft.purpose,
    solution: draft.solution, explanation: draft.explanation, representation: draft.representation, difficulty: draft.difficulty, originality: draft.originality };
}
function record(input) {
  const { brief, sourceLineage } = binding(input), solution = authorSolution();
  const draft = {
    schemaVersion: 'grade6-inverse-factor-draft/v1', id: 'grade6-inverse-factor-v1', state: 'draft', artifactAudience: 'editor_only',
    title: 'İki Eksik Karttan Bütünü Kur', sourceLineage,
    scope: { gradeCandidate: 6, courseCandidate: 'matematik', activeAcademicYear: null, programVersion: null,
      proposedOutcomeCodes: [...brief.proposedOutcomeCodes], officialOutcomeCode: null, activeProgramAccepted: false, fullOutcomeCoverage: false },
    problem: { family: 'inverse_factor_candidate_reconstruction', taskKind: 'reconstruct_and_select_complete_factor_evidence',
      candidateDomain: { minimum: 60, maximum: 95, inclusive: true, numericKind: 'positive_integer' },
      pairConvention: 'positive_factors_smaller_first', partialPairs: [{ id: 'pair-3', left: 3, right: null }, { id: 'pair-14', left: null, right: 14 }],
      completenessRequired: true, answerFormat: 'single_option',
      options: [
        { id: 'option-a', number: 84, remainingPairs: [[1, 84], [2, 42], [4, 21]] },
        { id: 'option-b', number: 84, remainingPairs: [[1, 84], [2, 42], [4, 21], [7, 12]] },
        { id: 'option-c', number: 72, remainingPairs: [[1, 72], [2, 36], [4, 18], [6, 12], [8, 9]] },
        { id: 'option-d', number: 90, remainingPairs: [[1, 90], [2, 45], [5, 18], [6, 15], [9, 10]] },
      ] },
    prompt: 'Gizli bir pozitif tam sayı 60 ile 95 arasındadır; 60 ve 95 de aralığa dahildir. İki kart aynı gizli sayının farklı çarpan çiftlerini gösterir: 3 × □ ve □ × 14. Her çifte küçük ya da eşit çarpan sola yazılır ve boşluklar pozitif tam sayıdır. Hangi seçenek hem gizli sayıyı hem de bu iki kart tamamlandıktan sonra geriye kalan bütün çarpan çiftlerini eksiksiz ve tekrarsız verir?',
    purpose: { statement: 'Kısmi çarpan kanıtından bilinmeyen sayıya geri gitme, adayın biricikliğini sınama ve eksik eş çarpanları tamamlama',
      sourceBriefTaskKind: brief.evidence.taskKind, taskKind: 'reconstruct_and_select_complete_factor_evidence', microAimIds: [...brief.purpose.microAimIds],
      evidenceKind: 'recognition_of_reconstructed_candidate_and_complete_pairs', learnerEvidenceCollected: false, fullBriefEvidenceFulfilled: false,
      notMeasured: ['learner_constructed_proof', 'mastery', 'ability', 'speed', 'whole_outcome_coverage'] },
    solution, answerKey: { optionId: solution.correctOptionId },
    explanation: {
      goal: 'Yalnız gizli sayıyı değil, iki kartın dışında kalan bütün çarpan çiftlerini de bulmak istiyoruz.',
      givenMeaning: '60–95 sayının izin verilen aralığıdır. 3 ve 14 kart adedi değildir; aynı sayının iki ayrı çarpan çiftinde bilinen çarpanlardır. Soldaki çarpan sağdakinden büyük olamaz.',
      route: 'İstenen sayı ve tamlık koşulunu ayır → İki kartla uyumlu aralık adaylarını bul → Boşlukları bölümle tamamla → Bütün çarpan çiftlerini çıkar → Kartta olmayanları seçenekle karşılaştır.',
      because: 'Sayı 3 ile de 14 ile de kalansız bölünmelidir. Yalnız bir kartı sağlayan sayı elenir. Aralık tek adayı bıraksa bile eksik bir çarpan listesi doğru seçenek olamaz.',
      conditions: ['Aralıktaki yalnız pozitif tam sayılar adaydır ve iki sınır da dahildir.',
        'İki kart aynı sayının farklı pozitif çarpan çiftleridir; küçük ya da eşit çarpan soldadır.',
        'Geriye kalan liste, tamamlanmış iki kartı içermez; diğer bütün çiftleri birer kez içerir.'],
      steps: [
        { id: 'read-evidence', why: 'İki kartın aynı sayıya ait olması iki koşulu birlikte zorunlu kılar.', result: [3, 14], meaning: 'Aynı gizli sayıda birlikte sınanacak bilinen çarpanlar' },
        { id: 'filter-candidates', why: '14’ün aralıktaki katları 70 ve 84’tür. 70, 3 ile kalansız bölünmez; 84 iki kartı da sağlar ve başka aralık adayı kalmaz.', result: solution.candidateNumbers, meaning: 'Verilen bütün koşulları aynı anda sağlayan tek sayı' },
        { id: 'complete-given-pairs', why: '84 ÷ 3 = 28 ilk boşluğu; 84 ÷ 14 = 6 ikinci boşluğu verir. İki çiftin çarpımı da 84’tür ve küçük çarpan soldadır.', result: solution.completedPairs, meaning: 'Her boşluğun kaynağı ve tamamlanmış iki verilen kart' },
        { id: 'prove-completeness', why: '84’ün küçük çarpanlarını sırayla 1, 2, 3, 4, 6 ve 7 olarak eşleriz. 8 ve 9 kalansız bölen değildir; 10’dan başlayınca küçük çarpan sınırı aşılır. Verilen 3 × 28 ve 6 × 14 çiftlerini çıkarırız.', result: solution.remainingPairs, meaning: 'Verilen kartlar dışında kalan dört çarpan çifti; 7 × 12 de mutlaka listede olmalı' },
        { id: 'check-option', why: 'A sayıyı doğru bulsa da 7 × 12’yi atlar. C ve D’nin sayıları 14’lü kartı tamamlayamaz. B hem sayıyı hem kalan listeyi doğru verir.', result: solution.correctOptionId, meaning: 'Sayının biricikliği ve kalan listenin tamlığı birlikte doğrulanmış seçenek' },
      ],
      conditionalShortcut: { worksWhen: 'Sonlu aralıkta aynı sayının pozitif çarpan çiftlerinde bilinen çarpanlar verilmişse',
        why: 'Aralıktaki her sayıyı uzun uzun denemek yerine bilinen çarpanlardan birinin katlarını aday yapıp diğer kartla eleyebiliriz. Kısa yol aday aramasını azaltır; tamlık kontrolünü kaldırmaz.',
        check: 'Bu aralıkta 14’ün katları 70 ve 84’tür. 3 koşulu yalnız 84’ü bırakır. Sonrasında 7 × 12 dahil bütün kalan çiftler yine denetlenir.',
        notImplied: 'İlk uygun sayı her zaman tek sayı değildir. Aralık veya kart koşulu değişirse bütün adaylar yeniden kontrol edilir; bu görevden genel bir EKOK algoritması ya da öğrencinin ustalığı sonucu çıkarılmaz.' },
      answerMeaning: '84, iki eksik kartın ortak gizli sayısıdır. 28 ve 6 boşlukların değeridir. B’deki dört çift, tamamlanan iki kart dışındaki eksiksiz kanıttır.',
      transfer: { candidateDomain: { minimum: 60, maximum: 140, inclusive: true, numericKind: 'positive_integer' },
        candidateNumbers: [84, 126], unique: false,
        meaning: 'Aynı kartlar için üst sınır 140 olursa 84 yanında 126 da uygundur: 3 × 42 ve 9 × 14. Ek koşul olmadan tek gizli sayı söyleyemeyiz; bu bir açıklama örneğidir, ikinci ürün sorusu değildir.' },
    },
    representation: { kind: 'text_labelled_inverse_factor_evidence_board/v1', plannedRepresentationId: brief.plannedRepresentation.id,
      sourceTopologyCopied: false, colorOnlyMeaning: false, rendered: false, accessibilityPassed: false,
      pending: ['editor_renderer', 'keyboard_and_screen_reader_review'] },
    difficulty: { level: 'medium', basis: 'author_estimate_not_empirical', calibration: null, targetDistribution: null,
      rationale: 'İki kısmi koşuldan sayıya geri gitme ile kalan listenin tamlığını ayrı kontrol etmeyi gerektirir; yaş uygunluğu veya öğrenci güçlüğü ölçülmüş değildir.' },
    counts: { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    repeatedCallsCreateDistinctStock: false, gates: { ...GATES },
    governance: { purpose: 'editor_original_math_draft', owner: 'pending', steward: 'pending', retention: 'pending', realLearnerDataPresent: false },
    originality: { origin: 'own_fixed_authoring_informed_by_reviewed_brief_17', sourceBodiesOptionsNumericVectorsMediaCopied: false,
      originalShape: 'bounded_unknown_number_two_partial_pairs_four_completion_options_not_source_circle_list', archiveSimilarityPassed: false, originalityVerified: false },
    activity: { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 }, ...FLAGS,
  };
  draft.authoredTaskSha256 = hash('authored-task', taskProfile(draft));
  draft.contentSha256 = hash('draft', draft); return draft;
}

/** One immutable original editor item, not a parameterized production API. */
export function createGrade6InverseFactorDraft(input) {
  if (arguments.length !== 1) fail('invalid_inverse_factor_authoring_arguments');
  const draft = record(input);
  if (Buffer.byteLength(JSON.stringify(draft)) > 65536) fail('inverse_factor_output_budget');
  return freeze(draft);
}

function domainShape(domain) {
  return closed(domain, ['minimum', 'maximum', 'inclusive', 'numericKind']) && positive(domain.minimum) && positive(domain.maximum)
    && domain.minimum <= domain.maximum && domain.inclusive === true && domain.numericKind === 'positive_integer';
}
function pairShape(pair) { return Array.isArray(pair) && pair.length === 2 && pair.every(positive); }
function problemShape(problem) {
  return closed(problem, ['family', 'taskKind', 'candidateDomain', 'pairConvention', 'partialPairs', 'completenessRequired', 'answerFormat', 'options'])
    && problem.family === 'inverse_factor_candidate_reconstruction' && problem.taskKind === 'reconstruct_and_select_complete_factor_evidence'
    && domainShape(problem.candidateDomain) && problem.pairConvention === 'positive_factors_smaller_first'
    && problem.completenessRequired === true && problem.answerFormat === 'single_option'
    && Array.isArray(problem.partialPairs) && problem.partialPairs.length === 2
    && problem.partialPairs.every((row, index) => closed(row, ['id', 'left', 'right']) && row.id === ['pair-3', 'pair-14'][index]
      && (row.left === null && positive(row.right) || positive(row.left) && row.right === null))
    && Array.isArray(problem.options) && problem.options.length === 4
    && problem.options.every((row, index) => closed(row, ['id', 'number', 'remainingPairs']) && row.id === `option-${'abcd'[index]}` && positive(row.number)
      && Array.isArray(row.remainingPairs) && row.remainingPairs.length <= 16 && row.remainingPairs.every(pairShape));
}

// Independent oracle: every integer in the domain and every possible positive
// divisor are examined. No author candidate list, sqrt pairing helper or key.
function exactNumber(number, partialPairs) {
  const positiveDivisors = [], allFactorPairs = [];
  for (let divisor = 1; divisor <= number; divisor++) {
    if (number % divisor !== 0) continue;
    positiveDivisors.push(divisor);
    const partner = number / divisor;
    if (divisor <= partner) allFactorPairs.push([divisor, partner]);
  }
  const completedPairs = [], selected = new Set();
  for (const partial of partialPairs) {
    const matches = allFactorPairs.filter(([left, right]) => (partial.left === null || partial.left === left)
      && (partial.right === null || partial.right === right));
    if (matches.length !== 1) return null;
    const [left, right] = matches[0], key = `${left}:${right}`;
    if (selected.has(key)) return null;
    selected.add(key); completedPairs.push({ partialPairId: partial.id, left, right });
  }
  const remainingPairs = allFactorPairs.filter(([left, right]) => !selected.has(`${left}:${right}`));
  return { number, positiveDivisors, allFactorPairs, completedPairs, remainingPairs };
}
function candidates(domain, partialPairs) {
  const found = [];
  for (let number = domain.minimum; number <= domain.maximum; number++) {
    const value = exactNumber(number, partialPairs); if (value) found.push(value);
  }
  return found;
}
function exactPairSet(actual, expected) {
  if (actual.length !== expected.length) return false;
  const seen = new Set();
  return actual.every(([left, right]) => {
    const key = `${left}:${right}`;
    if (left > right || seen.has(key) || !expected.some(([a, b]) => a === left && b === right)) return false;
    seen.add(key); return true;
  });
}
function solve(problem) {
  const found = candidates(problem.candidateDomain, problem.partialPairs), uniqueCandidate = found.length === 1;
  const optionChecks = problem.options.map(option => {
    const candidateInDomain = option.number >= problem.candidateDomain.minimum && option.number <= problem.candidateDomain.maximum;
    const evidence = exactNumber(option.number, problem.partialPairs), partialEvidenceMatches = evidence !== null;
    const completeRemainingPairs = partialEvidenceMatches && exactPairSet(option.remainingPairs, evidence.remainingPairs);
    return { id: option.id, candidateInDomain, partialEvidenceMatches, completeRemainingPairs,
      valid: candidateInDomain && partialEvidenceMatches && completeRemainingPairs };
  });
  const single = uniqueCandidate ? found[0] : null;
  return { optionChecks, recomputed: { candidateNumbers: found.map(row => row.number), uniqueCandidate, number: single?.number ?? null,
    positiveDivisors: single?.positiveDivisors ?? null, completedPairs: single?.completedPairs ?? null,
    allFactorPairs: single?.allFactorPairs ?? null, remainingPairs: single?.remainingPairs ?? null,
    correctOptionIds: optionChecks.filter(row => row.valid).map(row => row.id) } };
}
function profile(draft) { const { contentSha256, answerKey, ...body } = draft; return body; }
const blank = () => ({ sourceLineage: false, scope: false, purpose: false, authoredProfile: false, candidateUniqueness: false,
  completeReconstruction: false, exactlyOneCorrectOption: false, answerKey: false, reasonedEvidence: false, semanticIntegrity: false, contentIntegrity: false });
function report(checks = blank(), errors = ['invalid_inverse_factor_candidate'], recomputed = null, optionChecks = []) {
  const valid = errors.length === 0;
  return freeze({ schemaVersion: 'grade6-inverse-factor-verification/v1', state: 'editor_diagnostic_only', valid,
    localMathChecks: valid ? 'passed' : 'failed', checks, errors, recomputed, optionChecks,
    counts: { auditedDrafts: recomputed ? 1 : 0, locallyMathPassedDrafts: valid ? 1 : 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...GATES }, ...FLAGS });
}

/** Rebuild source binding and compare an independently solved finite item.
 * Integrity hashes are not authority, expert acceptance or publication. */
export function verifyGrade6InverseFactorDraft(candidate, input) {
  if (arguments.length !== 2) return report(blank(), ['invalid_inverse_factor_verifier_arguments']);
  let draft, expected;
  try {
    draft = inert(candidate); expected = record(input);
    if (!closed(draft, Object.keys(expected)) || !problemShape(draft.problem)) return report();
  } catch { return report(blank(), ['invalid_inverse_factor_source_or_candidate']); }
  const { recomputed, optionChecks } = solve(draft.problem);
  const exactlyOneCorrectOption = recomputed.correctOptionIds.length === 1;
  const completeReconstruction = recomputed.uniqueCandidate && same(draft.solution, {
    candidateNumbers: recomputed.candidateNumbers, number: recomputed.number, completedPairs: recomputed.completedPairs,
    allFactorPairs: recomputed.allFactorPairs, remainingPairs: recomputed.remainingPairs,
    correctOptionId: exactlyOneCorrectOption ? recomputed.correctOptionIds[0] : null,
  });
  const reasonedEvidence = same(draft.explanation, expected.explanation)
    && same(draft.explanation.steps[1].result, recomputed.candidateNumbers)
    && same(draft.explanation.steps[2].result, recomputed.completedPairs)
    && same(draft.explanation.steps[3].result, recomputed.remainingPairs)
    && domainShape(draft.explanation.transfer.candidateDomain)
    && same(draft.explanation.transfer.candidateNumbers, candidates(draft.explanation.transfer.candidateDomain, draft.problem.partialPairs).map(row => row.number))
    && draft.explanation.transfer.unique === (draft.explanation.transfer.candidateNumbers.length === 1);
  const checks = {
    sourceLineage: same(draft.sourceLineage, expected.sourceLineage), scope: same(draft.scope, expected.scope), purpose: same(draft.purpose, expected.purpose),
    authoredProfile: same(profile(draft), profile(expected)), candidateUniqueness: recomputed.uniqueCandidate, completeReconstruction, exactlyOneCorrectOption,
    answerKey: recomputed.uniqueCandidate && exactlyOneCorrectOption && closed(draft.answerKey, ['optionId']) && draft.answerKey.optionId === recomputed.correctOptionIds[0],
    reasonedEvidence, semanticIntegrity: draft.authoredTaskSha256 === hash('authored-task', taskProfile(draft)),
    contentIntegrity: typeof draft.contentSha256 === 'string' && /^[a-f0-9]{64}$/u.test(draft.contentSha256)
      && draft.contentSha256 === hash('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))),
  };
  return report(checks, Object.entries(checks).filter(([, value]) => !value).map(([key]) => `inverse_factor_${key}_failed`), recomputed, optionChecks);
}
