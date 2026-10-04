import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6ReferenceAuthoringPlan } from './grade6_reference_authoring_plan.mjs';

// One closed, answer-bearing editor task. A row, option or repeated call is not
// another question, and recorded metadata cannot confer publication authority.
const GATES = { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' };
const FLAGS = { humanApproval: null, publicationReady: false, learnerReady: false, productionReady: false, serializedHashIsAuthority: false };
const fail = code => { throw new Error(code); };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.grade6-prime-provenance.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const closed = (value, fields) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field));

// Only inert bounded candidate wire data reaches arithmetic or canonicalization.
// The much larger source snapshot is handled by the existing planner's own gate.
function inert(input) {
  const active = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 4096 || depth > 16) fail('invalid_prime_provenance_candidate');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail('invalid_prime_provenance_candidate'); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 8192 || bytes > 65536 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_prime_provenance_candidate');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || active.has(value)) fail('invalid_prime_provenance_candidate');
    const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
    if (array ? proto !== Array.prototype : ![Object.prototype, null].includes(proto)) fail('invalid_prime_provenance_candidate');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.length > 65 || keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value')
      || (key !== 'length' || !array) && !descriptors[key].enumerable || key.length > 128 || /[\u0000-\u001f]/u.test(key))) fail('invalid_prime_provenance_candidate');
    for (const key of keys) { bytes += Buffer.byteLength(key); if (bytes > 65536) fail('invalid_prime_provenance_candidate'); }
    active.add(value); let result;
    if (array) {
      const length = descriptors.length.value;
      if (length > 64 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_prime_provenance_candidate');
      result = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_prime_provenance_candidate');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.sort().map(key => [key, copy(descriptors[key].value, depth + 1)]));
    active.delete(value); return result;
  }
  return copy(input);
}

function binding(input) {
  const plan = createGrade6ReferenceAuthoringPlan(input);
  const brief = plan.briefs.find(row => row.briefId === 'g6-reference-authoring-18');
  if (!brief || brief.evidence.taskKind !== 'track_prime_selection_then_order'
    || !same(brief.proposedOutcomeCodes, ['MAT.6.1.3'])
    || !same(brief.purpose.microAimIds, ['G6Q18-M1', 'G6Q18-M2', 'G6Q18-M3'])) fail('invalid_prime_provenance_source_brief');
  return { brief, sourceLineage: { planContentSha256: plan.contentSha256, briefContentSha256: hash('source-brief', brief),
    briefId: brief.briefId, sourceId: brief.sourceReference.sourceId, sourceSha256: brief.sourceReference.sourceSha256,
    sourceOrdinal: brief.sourceReference.ordinal, physicalPdfPage: brief.sourceReference.physicalPdfPage,
    formMetadataSha256: plan.lineage.formMetadataRevisionSha256, semanticMetadataSha256: plan.lineage.semanticMetadataRevisionSha256,
    state: 'canonical_metadata_recomputed_not_authentication_or_fresh_bytes', freshPdfByteChecks: 0 } };
}

// Authoring strips prime powers from the remaining integer, then stably sorts.
// The independent mathematical oracle below does not use this helper, the
// authored solution or the supplied key to determine its expected answer.
function authorPrimeFactors(number) {
  let remaining = number; const factors = [];
  for (let divisor = 2; divisor <= remaining; divisor++) if (remaining % divisor === 0) {
    factors.push(divisor); while (remaining % divisor === 0) remaining /= divisor;
  }
  return factors;
}
const selectedEntry = row => ({ sourceRowId: row.sourceRowId, sourceNumber: row.sourceNumber, selectedPrime: row.selectedPrime });
function authoredTask(brief) {
  const rows = [
    { id: 'row-a', number: 54, selectionRule: 'largest' }, { id: 'row-b', number: 35, selectionRule: 'smallest' },
    { id: 'row-c', number: 28, selectionRule: 'largest' }, { id: 'row-d', number: 75, selectionRule: 'smallest' },
    { id: 'row-e', number: 121, selectionRule: 'largest' },
  ];
  const rowSelections = rows.map(row => {
    const distinctPrimeFactors = authorPrimeFactors(row.number);
    return { sourceRowId: row.id, sourceNumber: row.number, distinctPrimeFactors, selectionRule: row.selectionRule,
      selectedPrime: row.selectionRule === 'largest' ? distinctPrimeFactors.at(-1) : distinctPrimeFactors[0] };
  });
  const orderedSelections = [...rowSelections].sort((a, b) => a.selectedPrime - b.selectedPrime
    || rows.findIndex(row => row.id === a.sourceRowId) - rows.findIndex(row => row.id === b.sourceRowId)).map(selectedEntry);
  const copyOrder = () => orderedSelections.map(row => ({ ...row }));
  const wrongExtrema = copyOrder(); wrongExtrema.find(row => row.sourceRowId === 'row-b').selectedPrime = 7;
  const swappedTie = copyOrder(); [swappedTie[0], swappedTie[1]] = [swappedTie[1], swappedTie[0]];
  return {
    scope: { gradeCandidate: 6, courseCandidate: 'matematik', activeAcademicYear: null, programVersion: null,
      officialOutcomeCode: null, proposedOutcomeCodes: [...brief.proposedOutcomeCodes],
      programBinding: 'partial_content_link_candidate_not_accepted', activeProgramAccepted: false, fullOutcomeCoverage: false },
    problem: { family: 'prime_extrema_source_preserving_order', rows,
      ordering: { direction: 'ascending', ties: 'retain_all_in_source_row_order' }, options: [
        { id: 'ledger-a', entries: wrongExtrema }, { id: 'ledger-b', entries: copyOrder() },
        { id: 'ledger-c', entries: copyOrder().filter(row => row.sourceRowId !== 'row-d') }, { id: 'ledger-d', entries: swappedTie },
      ] },
    prompt: 'Sayı izleme defterinin A–E satırlarında başlangıç sayıları ve seçim kuralları var. A: 54 için en büyük, B: 35 için en küçük, C: 28 için en büyük, D: 75 için en küçük, E: 121 için en büyük asal çarpanı seç. Seçtiğin beş değeri küçükten büyüğe sırala; her değerin yanında geldiği satırı ve başlangıç sayısını koru. Eşit değerlerin hiçbirini silme ve eşitlikte A–E başlangıç satır sırasını kullan. Dört çözüm şeridinden hangisi bütün koşulları karşılar?',
    purpose: { statement: 'Satıra özgü asal uç değer seçimini başlangıç verisine bağlayıp tekrarları koruyarak sıralama',
      sourceBriefTaskKind: brief.evidence.taskKind, taskKind: 'audit_prime_extrema_provenance_order', microAimIds: [...brief.purpose.microAimIds],
      evidenceKind: 'recognition_of_given_selection_and_order_evidence', learnerEvidenceCollected: false, fullBriefEvidenceFulfilled: false,
      notMeasured: ['learner_constructed_factor_list', 'learner_explanation_quality', 'mastery', 'ability', 'speed', 'whole_outcome_coverage'] },
    solution: { rowSelections, orderedSelections, tiesRetained: true },
    explanation: { state: 'authored_editor_rationale_not_validated_pupil_evidence',
      goal: 'Beş başlangıç sayısını değil, her satırın kuralıyla seçilen beş asal değeri kaynaklarıyla sıralamak istiyoruz.',
      givenMeaning: '54, 35, 28, 75 ve 121, asal çarpanlarını inceleyeceğimiz başlangıç sayılarıdır. En küçük veya en büyük sözcüğü o satırın asal çarpan alt kümesindeki seçimi belirtir.',
      route: 'Her satırın farklı asal çarpanlarını bul → Satırdaki uç değer kuralını uygula → Değeri kaynak etiketiyle sırala → Eşitleri ve beş satırın tamamını denetle.',
      because: 'Başlangıç sayılarını doğrudan sıralamak istenen niceliği değiştirir. Önce asal alt kümeden doğru değeri seçmek ve kaynak etiketini taşımak, aynı 3 değerinin neden iki kez kaldığını açıklar.',
      conditions: ['Başlangıç verileri en az 2 olan küçük pozitif tamsayılardır.', 'Asal çarpanlar farklı değerler olarak yazılır; üsler yeni farklı asal oluşturmaz.', 'Eşit seçilen değerler ayrı başlangıç satırlarından geliyorsa ikisi de korunur; eşitlikte başlangıç satır sırası kullanılır.'],
      steps: [
        { id: 'find-prime-subsets', why: 'En küçük bölen 1 olabilir ama 1 asal değildir. Seçimi yalnız doğrulanmış asal çarpanların arasında yapacağız.',
          result: rowSelections.map(({ sourceRowId, sourceNumber, distinctPrimeFactors }) => ({ sourceRowId, sourceNumber, distinctPrimeFactors })),
          meaning: 'Her başlangıç sayısına bağlı farklı asal çarpan alt kümesi' },
        { id: 'select-by-row-rule', why: 'Aynı alt kümede en küçük ve en büyük farklı olabilir; her satırın kendi kuralını ayrı okuyoruz.',
          result: rowSelections.map(selectedEntry), meaning: 'Satır kuralıyla seçilen değer ve kaybolmayan başlangıç etiketi' },
        { id: 'order-with-source', why: 'Yalnız değerleri karşılaştırıp etiketleri birlikte taşıyoruz; A ve D satırlarının seçimi eşit olduğu için ikisini de tutuyoruz.',
          result: copyOrder(), meaning: 'Küçükten büyüğe sıralanmış, eşitlerde kaynak sırasını koruyan beş kayıt' },
        { id: 'verify-all-rows', why: 'Beş satırdan beş seçim olmalı; bir eşit değeri silmek veya bir kaynağı iki kez yazmak görev koşulunu bozar.',
          result: 5, meaning: 'Birer kez temsil edilen beş ayrı başlangıç satırı; farklı değer sayısı değil' },
      ],
      conditionalShortcut: { worksWhen: 'Her satırda farklı asal çarpan alt kümesi ve tek bir uç değer kuralı isteniyorsa',
        why: 'Asal çarpanları küçükten büyüğe yazdıktan sonra en küçük için ilkini, en büyük için sonuncusunu alabiliriz; sonra yalnız seçilen değerleri etiketleriyle karşılaştırırız.',
        check: '54 ve 75 ayrı asal alt kümelerinden kurala göre 3 seçer; bu iki 3 tek bir kayıt yapılmaz. 121 = 11 × 11 için farklı asal kümesi yalnız 11 içerir.',
        notImplied: 'Bu yol bütün pozitif bölenleri saymaz, asal çarpanları üsleri kadar tekrar yazmaz ve 1 için seçilebilir asal değer olduğunu söylemez.' },
      transfer: { number: 1, distinctPrimeFactors: [], selectable: false,
        meaning: '1 sayısının asal çarpanı yoktur; en küçük veya en büyük asal çarpan diye bir değer uydurmayız.' },
    },
    representation: { kind: 'semantic_prime_provenance_ledgers/v1', plannedRepresentationId: brief.plannedRepresentation.id,
      layout: 'five_rule_rows_and_four_source_labelled_order_strips', rendered: false, sourceTopologyCopied: false,
      colorOnlyMeaning: false, accessibilityPassed: false, pending: ['editor_table_renderer', 'native_visual_review', 'keyboard_and_screen_reader_review'] },
    difficulty: { level: 'hard', basis: 'author_estimate_not_empirical', calibrated: false, calibration: null, targetDistribution: null },
  };
}
function record(input) {
  const { brief, sourceLineage } = binding(input), task = authoredTask(brief);
  const draft = { schemaVersion: 'grade6-prime-provenance-draft/v1', id: 'grade6-prime-provenance-ledger-v1', title: 'Asal Seçimini Kaynağıyla Sırala',
    state: 'draft', artifactAudience: 'editor_only', sourceLineage, ...task, answerKey: { optionId: 'ledger-b' }, authoredTaskSha256: hash('task', task),
    counts: { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    repeatedCallsCreateDistinctStock: false, gates: { ...GATES },
    governance: { purpose: 'editor_original_math_draft', owner: 'pending', steward: 'pending', retention: 'pending', realLearnerDataPresent: false },
    originality: { origin: 'own_fixed_authoring_structurally_informed_by_brief_18', sourceBodiesOptionsNumericVectorsMediaCopied: false,
      sourceShape: 'prime_selection_code_slots_not_reused', originalShape: 'five_rule_rows_four_source_labelled_order_ledgers',
      archiveSimilarityPassed: false, originalityVerified: false, commercialReuseRights: 'unverified', sourceToModelTransferAllowed: false },
    activity: { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 }, ...FLAGS };
  draft.contentSha256 = hash('draft', draft); return draft;
}

/** Exactly one fixed original editor item, never parameterized stock or delivery. */
export function createGrade6PrimeProvenanceDraft(sourcePlannerInput) {
  if (arguments.length !== 1) fail('invalid_prime_provenance_authoring_arguments');
  const draft = record(sourcePlannerInput);
  if (Buffer.byteLength(JSON.stringify(draft)) > 65536) fail('prime_provenance_output_budget');
  return freeze(draft);
}

// Independent oracle exhaustively considers every possible prime candidate and
// every proper trial divisor. Ordering repeatedly extracts the first minimum;
// it does not share author factor-stripping, comparator, solution or answer key.
function independentlySolve(rows) {
  const rowSelections = [];
  for (const row of rows) {
    const distinctPrimeFactors = [];
    for (let candidate = 2; candidate <= row.number; candidate++) {
      let prime = true;
      for (let divisor = 2; divisor < candidate; divisor++) if (candidate % divisor === 0) { prime = false; break; }
      if (prime && row.number % candidate === 0) distinctPrimeFactors.push(candidate);
    }
    const selectedPrime = row.selectionRule === 'smallest' ? distinctPrimeFactors[0] : distinctPrimeFactors.at(-1);
    rowSelections.push({ sourceRowId: row.id, sourceNumber: row.number, distinctPrimeFactors, selectionRule: row.selectionRule, selectedPrime });
  }
  const remaining = rowSelections.map(row => ({ sourceRowId: row.sourceRowId, sourceNumber: row.sourceNumber, selectedPrime: row.selectedPrime }));
  const orderedSelections = [];
  while (remaining.length) {
    let minimum = 0;
    for (let index = 1; index < remaining.length; index++) if (remaining[index].selectedPrime < remaining[minimum].selectedPrime) minimum = index;
    orderedSelections.push(remaining.splice(minimum, 1)[0]);
  }
  return { rowSelections, orderedSelections };
}
function problemShape(problem) {
  return closed(problem, ['family', 'rows', 'ordering', 'options']) && problem.family === 'prime_extrema_source_preserving_order'
    && Array.isArray(problem.rows) && problem.rows.length === 5
    && problem.rows.every((row, index) => closed(row, ['id', 'number', 'selectionRule']) && row.id === `row-${'abcde'[index]}`
      && Number.isInteger(row.number) && row.number >= 2 && row.number <= 144 && ['smallest', 'largest'].includes(row.selectionRule))
    && same(problem.ordering, { direction: 'ascending', ties: 'retain_all_in_source_row_order' })
    && Array.isArray(problem.options) && problem.options.length === 4
    && problem.options.every((option, index) => closed(option, ['id', 'entries']) && option.id === `ledger-${'abcd'[index]}`
      && Array.isArray(option.entries) && option.entries.length <= 5 && option.entries.every(entry => closed(entry, ['sourceRowId', 'sourceNumber', 'selectedPrime'])
        && typeof entry.sourceRowId === 'string' && Number.isInteger(entry.sourceNumber) && entry.sourceNumber >= 2 && entry.sourceNumber <= 144
        && Number.isInteger(entry.selectedPrime) && entry.selectedPrime >= 2 && entry.selectedPrime <= 144));
}
function auditOptions(options, solved) {
  return options.map(option => {
    const cardinality = option.entries.length === solved.rowSelections.length && new Set(option.entries.map(row => row.sourceRowId)).size === solved.rowSelections.length;
    const provenance = option.entries.every(entry => solved.rowSelections.some(row => row.sourceRowId === entry.sourceRowId && row.sourceNumber === entry.sourceNumber));
    const exactSelection = option.entries.every(entry => solved.rowSelections.some(row => row.sourceRowId === entry.sourceRowId && row.selectedPrime === entry.selectedPrime));
    const orderedWithTies = same(option.entries, solved.orderedSelections);
    return { id: option.id, exactSelection, provenance, cardinality, orderedWithTies, valid: exactSelection && provenance && cardinality && orderedWithTies };
  });
}
const blank = () => ({ sourceLineage: false, scope: false, purpose: false, authoredProfile: false, rowSelections: false,
  orderedWithTies: false, exactlyOneCorrectOption: false, answerKey: false, reasonedEvidence: false, contentIntegrity: false });
function report(checks = blank(), errors = ['invalid_prime_provenance_candidate'], recomputed = null, optionChecks = []) {
  const valid = errors.length === 0;
  return freeze({ schemaVersion: 'grade6-prime-provenance-verification/v1', state: 'editor_diagnostic_only', valid,
    localMathChecks: valid ? 'passed' : 'failed', checks, errors, recomputed, optionChecks,
    counts: { auditedDrafts: recomputed ? 1 : 0, locallyMathPassedDrafts: valid ? 1 : 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...GATES }, ...FLAGS });
}

/** Closed canonical rebuild plus independent math; rehashing grants no authority. */
export function verifyGrade6PrimeProvenanceDraft(candidate, sourcePlannerInput) {
  if (arguments.length !== 2) return report(blank(), ['invalid_prime_provenance_verifier_arguments']);
  let draft, expected;
  try {
    draft = inert(candidate); expected = record(sourcePlannerInput);
    if (!closed(draft, Object.keys(expected)) || !problemShape(draft.problem)) return report();
  } catch { return report(blank(), ['invalid_prime_provenance_source_or_candidate']); }
  const solved = independentlySolve(draft.problem.rows), optionChecks = auditOptions(draft.problem.options, solved);
  const correctOptionIds = optionChecks.filter(row => row.valid).map(row => row.id);
  const solutionShape = closed(draft.solution, ['rowSelections', 'orderedSelections', 'tiesRetained']);
  const profile = value => Object.fromEntries(Object.entries(value).filter(([key]) => !['answerKey', 'contentSha256'].includes(key)));
  const steps = draft.explanation?.steps;
  const checks = {
    sourceLineage: same(draft.sourceLineage, expected.sourceLineage), scope: same(draft.scope, expected.scope), purpose: same(draft.purpose, expected.purpose),
    authoredProfile: same(profile(draft), profile(expected)),
    rowSelections: solutionShape && same(draft.solution.rowSelections, solved.rowSelections),
    orderedWithTies: solutionShape && draft.solution.tiesRetained === true && same(draft.solution.orderedSelections, solved.orderedSelections),
    exactlyOneCorrectOption: correctOptionIds.length === 1,
    answerKey: closed(draft.answerKey, ['optionId']) && correctOptionIds.length === 1 && draft.answerKey.optionId === correctOptionIds[0],
    reasonedEvidence: Array.isArray(steps) && steps.length === 4 && steps.every(step => closed(step, ['id', 'why', 'result', 'meaning']))
      && same(steps[0].result, solved.rowSelections.map(({ sourceRowId, sourceNumber, distinctPrimeFactors }) => ({ sourceRowId, sourceNumber, distinctPrimeFactors })))
      && same(steps[1].result, solved.rowSelections.map(row => ({ sourceRowId: row.sourceRowId, sourceNumber: row.sourceNumber, selectedPrime: row.selectedPrime })))
      && same(steps[2].result, solved.orderedSelections) && steps[3].result === solved.rowSelections.length,
    contentIntegrity: typeof draft.contentSha256 === 'string' && /^[a-f0-9]{64}$/u.test(draft.contentSha256)
      && draft.contentSha256 === hash('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))),
  };
  const errors = Object.entries(checks).filter(([, value]) => !value).map(([key]) => `prime_provenance_${key}_failed`);
  return report(checks, errors, { ...solved, correctOptionIds }, optionChecks);
}
