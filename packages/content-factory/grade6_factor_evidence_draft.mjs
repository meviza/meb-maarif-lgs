import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6ReferenceAuthoringPlan } from './grade6_reference_authoring_plan.mjs';

// A single fixed editorial record, not a parameter/count/learner delivery API.
// Metadata pins bind a reviewed revision; neither a SHA nor this diagnostic
// supplies source authenticity, rights, expert approval or pupil authority.
const GATES = { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' };
const FLAGS = { humanApproval: null, publicationReady: false, learnerReady: false, productionReady: false, serializedHashIsAuthority: false };
const ROOT = ['schemaVersion', 'id', 'state', 'artifactAudience', 'sourceLineage', 'scope', 'problem', 'prompt', 'answerKey', 'purpose',
  'explanation', 'representation', 'authoredTaskSha256', 'counts', 'repeatedCallsCreateDistinctStock', 'gates', 'governance', 'originality', 'activity', ...Object.keys(FLAGS), 'contentSha256'];
const fail = code => { throw new Error(code); };
const frozen = value => { if (value && typeof value === 'object') { Object.values(value).forEach(frozen); Object.freeze(value); } return value; };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const digest = (kind, value) => createHash('sha256').update(`k12.grade6-factor-evidence.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const closed = (v, fields) => v !== null && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).length === fields.length && fields.every(field => Object.hasOwn(v, field));

// Candidate wire data only. The larger public source snapshot goes through the
// existing planner's separate bounded, descriptor-safe snapshot, never this DTO.
function inert(input) {
  const ancestors = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 4096 || depth > 16) fail('invalid_factor_evidence_candidate');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail('invalid_factor_evidence_candidate'); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 8192 || bytes > 65536 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_factor_evidence_candidate');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || ancestors.has(value)) fail('invalid_factor_evidence_candidate');
    const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
    if (array ? proto !== Array.prototype : ![Object.prototype, null].includes(proto)) fail('invalid_factor_evidence_candidate');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value')
      || (key !== 'length' || !array) && !descriptors[key].enumerable || key.length > 128 || /[\u0000-\u001f]/u.test(key))) fail('invalid_factor_evidence_candidate');
    for (const key of keys) { bytes += Buffer.byteLength(key); if (bytes > 65536) fail('invalid_factor_evidence_candidate'); }
    ancestors.add(value); let result;
    if (array) {
      const length = descriptors.length.value;
      if (length > 64 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_factor_evidence_candidate');
      result = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_factor_evidence_candidate');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else {
      if (keys.length > 64) fail('invalid_factor_evidence_candidate');
      result = Object.fromEntries(keys.sort().map(key => [key, copy(descriptors[key].value, depth + 1)]));
    }
    ancestors.delete(value); return result;
  }
  return copy(input);
}

function binding(sourceInput) {
  const plan = createGrade6ReferenceAuthoringPlan(sourceInput);
  const brief = plan.briefs.find(item => item.briefId === 'g6-reference-authoring-16');
  if (!brief || brief.evidence.taskKind !== 'list_factors_and_distinguish_prime_subset'
    || !same(brief.proposedOutcomeCodes, ['MAT.6.1.1', 'MAT.6.1.3'])) fail('invalid_factor_evidence_source_brief');
  return { brief, lineage: { planContentSha256: plan.contentSha256, briefContentSha256: digest('source-brief', brief),
    briefId: brief.briefId, sourceId: brief.sourceReference.sourceId, sourceSha256: brief.sourceReference.sourceSha256,
    sourceOrdinal: brief.sourceReference.ordinal, formMetadataSha256: plan.lineage.formMetadataRevisionSha256,
    semanticMetadataSha256: plan.lineage.semanticMetadataRevisionSha256,
    state: 'canonical_metadata_recomputed_not_authentication_or_fresh_bytes', freshPdfByteChecks: 0 } };
}

// Authoring path: enumerate smaller pair members and strip prime powers.
// The verification path below never calls these authoring helpers or reads a key.
function authorMath(number) {
  const pairs = [], primes = []; let remainder = number;
  for (let a = 1; a <= Math.floor(number / a); a++) if (number % a === 0) pairs.push([a, number / a]);
  for (let p = 2; p <= remainder; p++) if (remainder % p === 0) {
    primes.push(p); while (remainder % p === 0) remainder /= p;
  }
  return { pairs, primes, sum: primes.reduce((total, value) => total + value, 0) };
}
function task(brief) {
  const number = 36, math = authorMath(number), pairs = () => math.pairs.map(pair => [...pair]);
  const boards = [
    { id: 'board-a', factorPairs: pairs(), primeBadges: [1, ...math.primes], primeBadgeSum: 1 + math.sum },
    { id: 'board-b', factorPairs: pairs().filter(pair => pair[0] !== pair[1]), primeBadges: [...math.primes], primeBadgeSum: math.sum },
    { id: 'board-c', factorPairs: pairs(), primeBadges: [...math.primes], primeBadgeSum: math.sum },
    { id: 'board-d', factorPairs: pairs(), primeBadges: [2, 2, 3, 3], primeBadgeSum: 10 },
  ];
  return {
    scope: { gradeCandidate: 6, courseCandidate: 'matematik', activeAcademicYear: null, programVersion: null,
      officialOutcomeCode: null, proposedOutcomeCodes: [...brief.proposedOutcomeCodes],
      programBinding: 'partial_content_link_candidate_not_accepted', activeProgramAccepted: false, fullOutcomeCoverage: false },
    problem: { family: 'complete_factor_pair_board_prime_subset_audit', number, boards },
    prompt: 'Sayı atölyesinde 36 için dört kanıt panosu hazırlanmış. Her panoda pozitif çarpan çiftleri, asal rozetleri ve rozet toplamı var. Bütün kuralları birlikte karşılayan tek panoyu seç: 36 sayısının bütün pozitif çarpan çiftleri eksiksiz bulunmalı. Her çiftin çarpımı 36 olmalı; küçük çarpan önce yazılmalı ve her çift yalnız bir kez bulunmalı. Eş çarpanlı çift de listede yer almalı. Rozetlerde yalnız farklı asal çarpanlar bulunmalı; 1 asal değildir. Toplam, bu farklı asal çarpanların toplamı olmalı.',
    purpose: { statement: 'Verilmiş bir kanıtı çarpan çiftlerinin tamlığı, farklı asal çarpanlar ve istenen toplam bakımından denetleme',
      sourceBriefTaskKind: brief.evidence.taskKind, taskKind: 'audit_given_factor_evidence', microAimIds: [...brief.purpose.microAimIds],
      evidenceKind: 'recognition_of_given_evidence', learnerEvidenceCollected: false, fullBriefEvidenceFulfilled: false,
      notMeasured: ['learner_constructed_factor_list', 'learner_explanation_quality', 'mastery', 'ability', 'speed', 'whole_outcome_coverage'] },
    explanation: { state: 'authored_editor_rationale_not_validated_pupil_evidence',
      goal: 'Tek tek doğru sayılar değil, üç koşulu aynı anda sağlayan tam kanıt panosu isteniyor.',
      givenMeaning: '36, her çarpan çiftinin geri kuracağı başlangıç sayısıdır; rozet toplamı veya çarpan sayısı değildir.',
      route: 'Önce kalansız çiftleri tamamla → yalnız asal olan farklı çarpanları ayır → istenen toplamı bu alt kümeden bul → her panoyu üç koşulla karşılaştır.',
      because: 'Sadece toplamın 5 olması çarpan tablosunun tam olduğunu göstermez. Önce tamlığı, sonra asal alt kümeyi kontrol etmek iki farklı hedefi karıştırmayı önler.',
      conditions: ['Başlangıç sayısı pozitif bir tamsayıdır; sıfır için böyle sonlu bir tablo kurmayız.', 'Çiftler küçük çarpan önce olacak şekilde yazılır; dönmüş aynı çift yeni çift sayılmaz.', 'Eş çarpanlı 6 × 6 çifti bir kez bulunur; 6 asal olmadığı için rozet değildir.'],
      conditionalShortcut: { worksWhen: 'Kalansız pozitif çarpan çiftleri küçük çarpan önce olacak şekilde aranıyorsa',
        why: 'Çiftin iki üyesi yer değiştirince aynı çarpım elde edilir. Küçük üye büyük üyeyi geçtiğinde daha önce görülen çiftlerin tersleri başlar.',
        check: 'Her çarpımı 36 ile karşılaştır; üyeler eşit olduğunda çifti atlama.',
        notImplied: 'Bu kısa yol asal sayıyı tanımlamaz, asallık kontrolünün yerine geçmez ve sıfır için uygulanmaz.' },
      steps: [
        { id: 'complete-pairs', why: 'Her kalansız küçük çarpanın eşini bölmeyle bulmak tüm çarpanları ve eş çifti görünür tutar.', result: pairs(), meaning: '36 sayısını geri kuran beş farklı sırasız pozitif çarpan çifti' },
        { id: 'distinct-primes', why: 'Çiftlerdeki her çarpan asal değildir. Yalnız iki farklı pozitif böleni olan çarpanları seçer, aynı asalı tekrar yazmayız.', result: [...math.primes], meaning: 'Bütün çarpanlar değil, iki farklı asal çarpan' },
        { id: 'target-sum', why: 'Görev farklı asal rozetlerinin toplamını istiyor; tüm çarpanları veya asal çarpanların tekrarlarını toplamıyoruz.', result: math.sum, meaning: '2 ve 3 rozetlerinin toplamı; çarpan sayısı değil' },
      ],
      transfer: { number: 1, prompt: 'Aynı kuralları 1 için düşün: Çarpan çifti var mı, asal rozet olur mu?',
        factorPairs: [[1, 1]], distinctPrimeFactors: [], primeBadgeSum: 0,
        meaning: '1 × 1 bir çift oluşturur; 1 asal olmadığı için rozet yoktur. Boş rozet toplamı 0 olarak tanımlanır.' },
    },
    representation: { kind: 'semantic_factor_evidence_boards/v1', layout: 'four_separate_pair_tables_with_text_prime_badges',
      rendered: false, sourceTopologyCopied: false, accessibilityPassed: false,
      pending: ['table_renderer', 'native_visual_review', 'keyboard_and_screen_reader_review'] },
  };
}
function record(sourceInput) {
  const { brief, lineage } = binding(sourceInput), authored = task(brief);
  const draft = { schemaVersion: 'grade6-factor-evidence-draft/v1', id: 'grade6-factor-evidence-board-v1', state: 'draft', artifactAudience: 'editor_only',
    sourceLineage: lineage, ...authored, answerKey: { boardId: 'board-c' }, authoredTaskSha256: digest('task', authored),
    counts: { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    repeatedCallsCreateDistinctStock: false, gates: { ...GATES },
    governance: { purpose: 'editor_original_math_draft', owner: 'pending', steward: 'pending', retention: 'pending', realLearnerDataPresent: false },
    originality: { origin: 'own_fixed_authoring_structurally_informed_by_brief_16', sourceBodiesOptionsNumericVectorsMediaCopied: false,
      sourceShape: 'two_number_fanout_not_reused', originalShape: 'one_number_four_evidence_board_tables', archiveSimilarityPassed: false,
      originalityVerified: false, commercialReuseRights: 'unverified', sourceToModelTransferAllowed: false },
    activity: { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 }, ...FLAGS };
  draft.contentSha256 = digest('draft', draft);
  return draft;
}

/** Returns one immutable, answer-bearing editor draft. No arbitrary templates. */
export function createGrade6FactorEvidenceDraft(sourceInput) {
  if (arguments.length !== 1) fail('invalid_factor_draft_arguments');
  const draft = record(sourceInput);
  if (Buffer.byteLength(JSON.stringify(draft)) > 65536) fail('factor_draft_output_budget');
  return frozen(draft);
}

// Independent oracle: exhaustively test every positive divisor, then primality
// by trial divisors. No authorMath, author key, explanation result or metadata
// approval is an input. It is intentionally small (1..100), exact integer math.
function independentlySolve(number) {
  const positiveDivisors = [], factorPairs = [], distinctPrimeFactors = [];
  for (let divisor = 1; divisor <= number; divisor++) if (number % divisor === 0) {
    positiveDivisors.push(divisor);
    const other = number / divisor; if (divisor <= other) factorPairs.push([divisor, other]);
    let prime = divisor >= 2;
    for (let trial = 2; trial < divisor; trial++) if (divisor % trial === 0) { prime = false; break; }
    if (prime) distinctPrimeFactors.push(divisor);
  }
  let primeBadgeSum = 0; for (const prime of distinctPrimeFactors) primeBadgeSum += prime;
  return { positiveDivisors, factorPairs, distinctPrimeFactors, primeBadgeSum };
}
function problemShape(problem) {
  return closed(problem, ['family', 'number', 'boards']) && problem.family === 'complete_factor_pair_board_prime_subset_audit'
    && Number.isInteger(problem.number) && problem.number >= 1 && problem.number <= 100 && problem.number === 36
    && Array.isArray(problem.boards) && problem.boards.length === 4
    && problem.boards.every((board, index) => closed(board, ['id', 'factorPairs', 'primeBadges', 'primeBadgeSum']) && board.id === `board-${'abcd'[index]}`
      && Array.isArray(board.factorPairs) && board.factorPairs.length <= 16
      && board.factorPairs.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(v => Number.isInteger(v) && v >= 1 && v <= 100))
      && Array.isArray(board.primeBadges) && board.primeBadges.length <= 16 && board.primeBadges.every(v => Number.isInteger(v) && v >= 1 && v <= 100)
      && Number.isInteger(board.primeBadgeSum) && board.primeBadgeSum >= 0 && board.primeBadgeSum <= 512);
}
function auditBoards(problem, solved) {
  const expectedPairs = new Set(solved.factorPairs.map(pair => pair.join(':')));
  return problem.boards.map(board => {
    const pairKeys = board.factorPairs.map(pair => pair.join(':'));
    const completePairs = pairKeys.length === expectedPairs.size && new Set(pairKeys).size === pairKeys.length
      && board.factorPairs.every(([a, b]) => a <= b && a * b === problem.number && expectedPairs.has(`${a}:${b}`));
    const expectedPrimes = new Set(solved.distinctPrimeFactors), exactPrimeSubset = board.primeBadges.length === expectedPrimes.size
      && new Set(board.primeBadges).size === board.primeBadges.length && board.primeBadges.every(value => expectedPrimes.has(value));
    const correctPrimeSum = board.primeBadgeSum === solved.primeBadgeSum;
    return { id: board.id, completePairs, exactPrimeSubset, correctPrimeSum, valid: completePairs && exactPrimeSubset && correctPrimeSum };
  });
}
const blankChecks = () => ({ sourceLineage: false, scope: false, purpose: false, authoredProfile: false, reasonedEvidence: false,
  exactlyOneCorrectBoard: false, answerKey: false, contentIntegrity: false });
function report(checks = blankChecks(), errors = ['invalid_factor_evidence_candidate'], recomputed = null, boardChecks = [], audited = 0) {
  const valid = !errors.length;
  return frozen({ schemaVersion: 'grade6-factor-evidence-verification/v1', state: 'editor_diagnostic_only', valid,
    localMathChecks: valid ? 'passed' : 'failed', checks, errors, recomputed, boardChecks,
    counts: { auditedDrafts: audited, locallyMathPassedDrafts: valid ? 1 : 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...GATES }, ...FLAGS });
}

/** Diagnostic only. Rebuild real canonical source/plan lineage separately;
 * serialized candidate hashes/flags never grant authority or resolve gates. */
export function verifyGrade6FactorEvidenceDraft(candidate, sourceInput) {
  if (arguments.length !== 2) return report(blankChecks(), ['invalid_factor_verifier_arguments']);
  let draft, expected;
  try {
    draft = inert(candidate); if (!closed(draft, ROOT) || !problemShape(draft.problem)) return report();
    expected = record(sourceInput);
  } catch { return report(blankChecks(), ['invalid_factor_evidence_source_or_candidate']); }
  const solved = independentlySolve(draft.problem.number), boardChecks = auditBoards(draft.problem, solved);
  const correctBoardIds = boardChecks.filter(board => board.valid).map(board => board.id);
  const checks = {
    sourceLineage: same(draft.sourceLineage, expected.sourceLineage), scope: same(draft.scope, expected.scope), purpose: same(draft.purpose, expected.purpose),
    authoredProfile: same(Object.fromEntries(Object.entries(draft).filter(([key]) => !['answerKey', 'contentSha256'].includes(key))),
      Object.fromEntries(Object.entries(expected).filter(([key]) => !['answerKey', 'contentSha256'].includes(key)))),
    reasonedEvidence: Array.isArray(draft.explanation?.steps) && draft.explanation.steps.length === 3
      && draft.explanation.steps.every(step => closed(step, ['id', 'why', 'result', 'meaning']))
      && same(draft.explanation.steps.map(step => step.result), [solved.factorPairs, solved.distinctPrimeFactors, solved.primeBadgeSum])
      && same(draft.explanation?.transfer, expected.explanation.transfer)
      && same(independentlySolve(1), { positiveDivisors: [1], factorPairs: [[1, 1]], distinctPrimeFactors: [], primeBadgeSum: 0 }),
    exactlyOneCorrectBoard: correctBoardIds.length === 1,
    answerKey: closed(draft.answerKey, ['boardId']) && correctBoardIds.length === 1 && draft.answerKey.boardId === correctBoardIds[0],
    contentIntegrity: typeof draft.contentSha256 === 'string' && /^[a-f0-9]{64}$/u.test(draft.contentSha256)
      && draft.contentSha256 === digest('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))),
  };
  const errors = Object.entries(checks).filter(([, value]) => !value).map(([key]) => `factor_evidence_${key}_failed`);
  return report(checks, errors, { ...solved, correctBoardIds }, boardChecks, 1);
}
