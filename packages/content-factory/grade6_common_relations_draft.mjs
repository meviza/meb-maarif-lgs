import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';

// Fixed reviewed metadata revisions, not source authentication or permissions.
// Observation contentSha256 uses insertion-order JSON in its own artifact;
// these whole-snapshot pins independently use sorted inert own-data keys.
const APPLICATION_REVISION = '3c1ccf730931f9704bd95ce5137ee0154d6b05daea6eb12c35a70bfa23b89c38';
const MATRIX_REVISION = '5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8';
const ROW_REVISION = '610d60eeb3d8387517d2f74f71be171fa8663e3a177d42bd217b647ac6bdea19';
const SOURCE_SHA = '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734';
const GATES = { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' };
const FLAGS = { humanApproval: null, publicationReady: false, learnerReady: false, productionReady: false, serializedHashIsAuthority: false };
const ROOT = ['schemaVersion', 'id', 'state', 'artifactAudience', 'sourceLineage', 'scope', 'problem', 'prompt', 'answerKey',
  'purpose', 'explanation', 'representation', 'authoredTaskSha256', 'counts', 'repeatedCallsCreateDistinctStock', 'gates',
  'governance', 'originality', 'activity', ...Object.keys(FLAGS), 'contentSha256'];
const fail = code => { throw new Error(code); };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const pin = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const digest = (kind, value) => createHash('sha256').update(`k12.grade6-common-relations.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const closed = (v, fields) => v !== null && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).length === fields.length && fields.every(key => Object.hasOwn(v, key));
const integer = (value, min = 1, max = 100) => Number.isInteger(value) && value >= min && value <= max;
const shortString = value => typeof value === 'string' && value.length > 0 && value.length <= 128;

function inert(input, source = false) {
  const visiting = new WeakSet(); let nodes = 0, bytes = 0;
  const budget = source ? { nodes: 100000, depth: 24, bytes: 2097152, string: 65536, array: 2048, keys: 1024, key: 160 }
    : { nodes: 4096, depth: 16, bytes: 65536, string: 8192, array: 64, keys: 64, key: 128 };
  function copy(value, depth = 0) {
    if (++nodes > budget.nodes || depth > budget.depth) fail('invalid_common_relations_data');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail('invalid_common_relations_data'); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > budget.string || bytes > budget.bytes || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_common_relations_data');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('invalid_common_relations_data');
    const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
    if (array ? proto !== Array.prototype : ![Object.prototype, null].includes(proto)) fail('invalid_common_relations_data');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value')
      || (key !== 'length' || !array) && !descriptors[key].enumerable || key.length > budget.key || /[\u0000-\u001f]/u.test(key))) fail('invalid_common_relations_data');
    for (const key of keys) { bytes += Buffer.byteLength(key); if (bytes > budget.bytes) fail('invalid_common_relations_data'); }
    visiting.add(value); let result;
    if (array) {
      const length = descriptors.length.value;
      if (length > budget.array || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_common_relations_data');
      result = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_common_relations_data');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else {
      if (keys.length > budget.keys) fail('invalid_common_relations_data');
      result = Object.fromEntries(keys.sort().map(key => [key, copy(descriptors[key].value, depth + 1)]));
    }
    visiting.delete(value); return result;
  }
  return copy(input);
}

function binding(input) {
  let data;
  try {
    data = inert(input, true);
    if (!closed(data, ['applicationObservations', 'semanticMatrix', 'sourceRecord'])) fail('invalid_common_relations_source');
    const { applicationObservations: observations, semanticMatrix: matrix, sourceRecord: row } = data;
    if (pin(observations) !== APPLICATION_REVISION || pin(matrix) !== MATRIX_REVISION || pin(row) !== ROW_REVISION
      || observations.source.sha256 !== SOURCE_SHA || matrix.source.sha256 !== SOURCE_SHA || row.download.sha256 !== SOURCE_SHA
      || row.id !== 'tymm-current-ortaokul-matematik' || row.download.status !== 'downloaded' || row.download.byteLength !== 3916466
      || row.usagePolicy !== 'reference_only' || row.reuseRights !== 'unverified' || !row.grades.includes(6)
      || observations.priorMatrixBinding.contentSha256 !== matrix.contentSha256 || observations.outputBinding.code !== 'MAT.6.1.4'
      || !same(observations.outputBinding.priorProcessLabels, ['a', 'b', 'c'])
      || !same(matrix.outcomes.find(item => item.code === 'MAT.6.1.4').processComponents.map(item => item.printedLabel), ['a', 'b', 'c'])
      || observations.boundaries.formalGcdLcmTeachingAllowed !== false || observations.boundaries.extremalCommonRelationTasksAccepted !== false
      || observations.observations[0].items.length !== 0) fail('invalid_common_relations_source');
    return { sourceId: row.id, sourceSha256: SOURCE_SHA, sourceRowMetadataSha256: ROW_REVISION,
      applicationMetadataSha256: APPLICATION_REVISION, applicationContentSha256: observations.contentSha256,
      priorMatrixMetadataSha256: MATRIX_REVISION, priorMatrixContentSha256: matrix.contentSha256,
      applicationPage: 71, applicationEvidencePages: [71, 72], contextOnlyPage: 73,
      priorProcessLabels: ['a', 'b', 'c'], state: 'canonical_metadata_binding_not_authentication_or_fresh_bytes', freshPdfByteChecks: 0 };
  } catch { fail('invalid_common_relations_source'); }
}

// Authoring path uses stepped sequences and factor-pair generation. The oracle
// below instead exhaustively tests every bounded integer using modulo.
function authorValues() {
  const sequences = [6, 8].map(interval => { const values = []; for (let n = interval; n <= 48; n += interval) values.push(n); return values; });
  const divisors = number => { const values = []; for (let small = 1; small <= Math.floor(number / small); small++) if (number % small === 0) {
    values.push(small); if (small !== number / small) values.push(number / small);
  } return values.sort((a, b) => a - b); };
  return { sequences, times: sequences[0].filter(value => sequences[1].includes(value)),
    sizes: divisors(24).filter(value => divisors(36).includes(value)) };
}
function authoredTask() {
  const values = authorValues();
  return {
    scope: { gradeCandidate: 6, courseCandidate: 'matematik', activeAcademicYear: null, programVersion: null, officialOutcomeCode: null,
      proposedOutcomeCodes: ['MAT.6.1.4'], activeProgramAccepted: false, fullOutcomeCoverage: false,
      formalGcdLcmTeachingAllowed: false, extremalCommonRelationTasksAccepted: false,
      horizonIsOfficialNumericLimit: false, programBinding: 'partial_application_candidate_not_accepted' },
    problem: { family: 'common_relation_context_unit_evidence_matching', contexts: [
      { id: 'repeat', title: 'Sesli hikâye odası', statement: 'İki sesli hikâye döngüsü 0. dakikada birlikte başlatılıyor. Biri her 6, diğeri her 8 dakikada başlangıç noktasına dönüyor. Başlangıç anını saymadan, 48. dakika dahil olmak üzere ikisinin birlikte döndüğü bütün dakika işaretleri isteniyor.',
        intervals: [6, 8], startMinute: 0, window: { from: 0, fromInclusive: false, to: 48, toInclusive: true }, requestedUnit: 'minute', target: 'all_positive_common_marks_in_window' },
      { id: 'grouping', title: 'Hikâye kartı atölyesi', statement: '24 karakter kartı ve 36 mekân kartı ayrı türler olarak paketlenecek. Bir paket yalnız tek tür kart içerecek. Karakter kartı paketleri ile mekân kartı paketlerinin hepsinde aynı sayıda kart bulunacak. Tüm kartlar kullanılacak ve artan kart olmayacak. Uygun bütün pozitif paket boyutları, kart/paket birimiyle isteniyor; paket sayıları istenmiyor.',
        itemCounts: [24, 36], materialTypesMixed: false, leftoversAllowed: false, requestedUnit: 'card_per_package', target: 'all_positive_common_exact_group_sizes', examplePackageSize: 6 }
    ], evidenceCards: [
      { id: 'evidence-repeat', label: 'Ortak tekrar işaretleri', relation: 'common_multiple', unit: 'minute', values: [...values.times] },
      { id: 'evidence-group-size', label: 'Kalansız ortak paket boyutları', relation: 'common_divisor', unit: 'card_per_package', values: [...values.sizes] },
      { id: 'evidence-sum', label: 'İki tekrar süresini toplama', relation: 'sum_of_intervals', unit: 'minute', values: [14] },
      { id: 'evidence-package-counts', label: '6 kartlık paketlerin sayıları', relation: 'package_counts_at_example_size', unit: 'package', values: [4, 6] }
    ] },
    prompt: 'Dört kanıt kartından her bağlamın istediği bütün değerleri ve doğru birimi taşıyan tek kartı seçerek eşleştir. Her bağlam için bir kart kullan; bazı kartlar kullanılmayabilir. Verilmiş listeleri denetlemek ile listeyi kendin oluşturmak aynı kanıt değildir.',
    purpose: { statement: 'Birlikte tekrar zamanını, iki miktarı kalansız bölen ortak paket boyutundan ve paket sayısından ayırma',
      taskKind: 'match_given_common_relation_evidence_to_context_and_unit', evidenceKind: 'matching_of_given_evidence',
      proposedMicroPurposeIds: ['G6-CR-M01', 'G6-CR-M02', 'G6-CR-M03', 'G6-CR-M05'], microPurposeIdsAreOfficial: false,
      learnerEvidenceCollected: false, fullOutcomeEvidenceFulfilled: false,
      notMeasured: ['learner_constructed_lists', 'learner_explanation_quality', 'mastery', 'ability', 'speed', 'whole_outcome_coverage'] },
    explanation: { state: 'authored_editor_rationale_not_validated_pupil_evidence', paths: [
      { contextId: 'repeat', goal: 'Başlangıcı saymadan 48. dakikaya kadar birlikte dönüş olan bütün işaretleri bulmak.',
        givenMeaning: '6 ve 8 dakika, iki ayrı tekrarın süreleridir; birlikte dönüş zamanı veya toplam süre değildir. 0 birlikte başlangıçtır ama istenen aralığa dahil değildir.',
        why: 'Bir dakika işareti iki tekrar dizisinde de bulunmalıdır. Süreleri toplamak bu iki koşulu birlikte denetlemez.',
        operationMeaning: '6 ve 8 dakika aralıklarıyla oluşan iki diziyi 48 dahil sonlandırıp aynı işaretleri eşleştiririz.',
        result: [...values.times], unit: 'minute', resultMeaning: '24 ve 48, başlangıçtan sonra iki döngünün birlikte başlangıç noktasına döndüğü dakika işaretleridir.',
        conditionalNote: { when: 'Pozitif bir dakika adayı ve açık bir sonlu zaman aralığı verilmişse',
          why: 'Aday dakika her iki tekrar süresine de kalansız bölünüyorsa iki dizide bulunur.',
          check: 'Adayı 6 ve 8 ile ayrı ayrı kontrol et; ayrıca 0 < t ≤ 48 sınırını kontrol et.',
          notImplied: 'Süreleri toplamak ortak zamanı vermez; başlangıç veya aralık dışı bir işaret listede yer almaz. Burada bir uç değer algoritması öğretilmiyor.' } },
      { contextId: 'grouping', goal: 'İki kart türünü karıştırmadan ve artan kart bırakmadan paketleyecek bütün ortak pozitif kart/paket boyutlarını bulmak.',
        givenMeaning: '24 ve 36 toplam kart adetleridir. Aday boyut bir paketteki kart adedi; toplamın bu boyuta bölümü ise paket sayısıdır.',
        why: 'Aynı paket boyutu her iki toplamı da kalansız bölmelidir; yalnız bir türün artmaması yeterli değildir.',
        operationMeaning: 'İki toplamın pozitif bölenlerini ayrı bulur, ikisinde de bulunan boyutları eşleştiririz. Her boyut için iki paket sayısını ayrı satırda denetleriz.',
        result: [...values.sizes], unit: 'card_per_package', resultMeaning: '1, 2, 3, 4, 6 ve 12 bir pakette bulunabilecek ortak kart adetleridir; paket sayısı değildir.',
        conditionalNote: { when: 'Pozitif bir paket boyutu önerilmiş ve her iki türde tüm kartların kullanılması istenmişse',
          why: 'Toplam kart adedinin boyuta kalansız bölünmesi artan kart olmadığını gösterir.',
          check: '24 ve 36 için kalanı ayrı ayrı kontrol et; bölümün paket sayısı, bölenin kart/paket olduğunu söyle.',
          notImplied: 'Boyut ile paket sayısı birbirinin yerine yazılmaz; türleri birleştirip toplamı bölmek ayrı tür koşulunu karşılamaz. Bir uç değer seçimi istenmiyor.' } }
    ], transfers: [
      { id: 'sum-not-common-time', candidateMinute: 14, remainders: [2, 6], meaning: '6 + 8 = 14 olsa da 14 iki döngünün de tekrar işareti değildir; iki kalan da sıfır değil.' },
      { id: 'window-boundary', cases: [{ minute: 0, inWindow: false, common: true }, { minute: 48, inWindow: true, common: true }, { minute: 72, inWindow: false, common: true }],
        meaning: 'Ortaklık ve aralığa uygunluk ayrı koşullardır; 0 başlangıç ve 72 dış sınır nedeniyle dışarıda, 48 dahil sınırda.' },
      { id: 'group-size-not-count', groupSize: 6, packageCounts: [4, 6], meaning: '24 kart için 4, 36 kart için 6 paket gerekir. Bu iki sayı paket sayılarıdır; ortak boyut 6 kart/pakettir.' }
    ] },
    representation: { kind: 'semantic_two_context_matching_evidence/v1', rendered: false, accessibilityPassed: false,
      repeatSequences: values.sequences, groupRows: values.sizes.map(size => ({ size, packageCounts: [24 / size, 36 / size] })),
      unitLabelsRequired: true, sourceTopologyCopied: false, pending: ['renderer', 'native_visual_review', 'keyboard_and_screen_reader_review'] }
  };
}
function record(input) {
  const lineage = binding(input), task = authoredTask();
  const draft = { schemaVersion: 'grade6-common-relations-draft/v1', id: 'grade6-common-relations-two-context-v1', state: 'draft', artifactAudience: 'editor_only',
    sourceLineage: lineage, ...task, answerKey: { repeat: 'evidence-repeat', grouping: 'evidence-group-size' }, authoredTaskSha256: digest('task', task),
    counts: { newAuthoredDrafts: 1, semanticFamilies: 1, parameterOnlyVariants: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    repeatedCallsCreateDistinctStock: false, gates: { ...GATES },
    governance: { purpose: 'editor_original_common_relation_draft', owner: 'pending', steward: 'pending', retention: 'pending', realLearnerDataPresent: false },
    originality: { origin: 'own_fixed_two_context_task_informed_by_application_boundary', sourceContextCopied: false,
      sourceBodiesOptionsNumericVectorsMediaCopied: false, originalityVerified: false, archiveSimilarityPassed: false,
      commercialReuseRights: 'unverified', sourceToModelTransferAllowed: false },
    activity: { providersCalled: 0, networkCallsMade: 0, downloadsMade: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0 }, ...FLAGS };
  draft.contentSha256 = digest('draft', draft); return draft;
}

export function createGrade6CommonRelationsDraft(sourceBindingInput) {
  if (arguments.length !== 1) fail('invalid_common_relations_arguments');
  const draft = record(sourceBindingInput);
  if (Buffer.byteLength(JSON.stringify(draft)) > 65536) fail('common_relations_output_budget');
  return freeze(draft);
}

function problemShape(problem) {
  if (!closed(problem, ['family', 'contexts', 'evidenceCards']) || problem.family !== 'common_relation_context_unit_evidence_matching'
    || !Array.isArray(problem.contexts) || problem.contexts.length !== 2 || !Array.isArray(problem.evidenceCards) || problem.evidenceCards.length !== 4) return false;
  const [repeat, grouping] = problem.contexts;
  return closed(repeat, ['id', 'title', 'statement', 'intervals', 'startMinute', 'window', 'requestedUnit', 'target']) && repeat.id === 'repeat'
    && shortString(repeat.title) && typeof repeat.statement === 'string' && Array.isArray(repeat.intervals) && repeat.intervals.length === 2
    && repeat.intervals.every(value => integer(value)) && repeat.startMinute === 0
    && closed(repeat.window, ['from', 'fromInclusive', 'to', 'toInclusive']) && repeat.window.from === 0 && integer(repeat.window.to)
    && typeof repeat.window.fromInclusive === 'boolean' && typeof repeat.window.toInclusive === 'boolean' && shortString(repeat.requestedUnit) && shortString(repeat.target)
    && closed(grouping, ['id', 'title', 'statement', 'itemCounts', 'materialTypesMixed', 'leftoversAllowed', 'requestedUnit', 'target', 'examplePackageSize']) && grouping.id === 'grouping'
    && shortString(grouping.title) && typeof grouping.statement === 'string' && Array.isArray(grouping.itemCounts) && grouping.itemCounts.length === 2
    && grouping.itemCounts.every(value => integer(value)) && typeof grouping.materialTypesMixed === 'boolean' && typeof grouping.leftoversAllowed === 'boolean'
    && shortString(grouping.requestedUnit) && shortString(grouping.target) && integer(grouping.examplePackageSize)
    && problem.evidenceCards.every((card, index) => closed(card, ['id', 'label', 'relation', 'unit', 'values'])
      && card.id === ['evidence-repeat', 'evidence-group-size', 'evidence-sum', 'evidence-package-counts'][index]
      && shortString(card.label) && shortString(card.relation) && shortString(card.unit)
      && Array.isArray(card.values) && card.values.length <= 64 && card.values.every(value => integer(value, 0, 200)));
}

// Independent exhaustive oracle: no authorValues, supplied key/results or
// metadata approval is read as an answer. Horizons and quantities are <=100.
function independentlySolve(problem) {
  const [repeat, grouping] = problem.contexts, [a, b] = repeat.intervals, [x, y] = grouping.itemCounts;
  const commonPositiveTimes = [], repeatSequences = [[], []], commonPositiveGroupSizes = [], groupRows = [];
  for (let time = 1; time <= repeat.window.to; time++) {
    if (time === repeat.window.to && !repeat.window.toInclusive) continue;
    if (time % a === 0) repeatSequences[0].push(time);
    if (time % b === 0) repeatSequences[1].push(time);
    if (time % a === 0 && time % b === 0) commonPositiveTimes.push(time);
  }
  for (let size = 1; size <= x && size <= y; size++) if (x % size === 0 && y % size === 0) {
    commonPositiveGroupSizes.push(size); groupRows.push({ size, packageCounts: [x / size, y / size] });
  }
  const example = grouping.examplePackageSize;
  return { commonPositiveTimes, commonPositiveGroupSizes, intervalSum: a + b,
    packageCountsAtExampleSize: x % example === 0 && y % example === 0 ? [x / example, y / example] : null,
    repeatSequences, groupRows,
    sumRemainders: [(a + b) % a, (a + b) % b],
    boundaryCases: [0, repeat.window.to, 72].map(minute => ({ minute,
      inWindow: minute > 0 && (minute < repeat.window.to || minute === repeat.window.to && repeat.window.toInclusive), common: minute % a === 0 && minute % b === 0 })) };
}
function exactValues(actual, expected) {
  return actual.length === expected.length && new Set(actual).size === actual.length && actual.every(value => expected.includes(value));
}
function cardAudit(problem, solved) {
  return problem.evidenceCards.map(card => ({ id: card.id,
    matchesRepeat: card.relation === 'common_multiple' && card.unit === 'minute' && exactValues(card.values, solved.commonPositiveTimes),
    matchesGrouping: card.relation === 'common_divisor' && card.unit === 'card_per_package' && exactValues(card.values, solved.commonPositiveGroupSizes) }));
}
const blankChecks = () => ({ sourceLineage: false, scope: false, purpose: false, authoredProfile: false, reasonedEvidence: false,
  representation: false, uniqueMatching: false, answerKey: false, contentIntegrity: false });
function report(checks = blankChecks(), errors = ['invalid_common_relations_candidate'], recomputed = null, cardChecks = [], audited = 0) {
  const valid = errors.length === 0;
  return freeze({ schemaVersion: 'grade6-common-relations-verification/v1', state: 'editor_diagnostic_only', valid,
    localMathChecks: valid ? 'passed' : 'failed', checks, errors, recomputed, cardChecks,
    counts: { auditedDrafts: audited, locallyMathPassedDrafts: valid ? 1 : 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...GATES }, ...FLAGS });
}

export function verifyGrade6CommonRelationsDraft(candidate, sourceBindingInput) {
  if (arguments.length !== 2) return report(blankChecks(), ['invalid_common_relations_verifier_arguments']);
  let draft, expected;
  try { draft = inert(candidate); if (!closed(draft, ROOT) || !problemShape(draft.problem)) return report(); expected = record(sourceBindingInput); }
  catch { return report(blankChecks(), ['invalid_common_relations_source_or_candidate']); }
  const solved = independentlySolve(draft.problem), cardChecks = cardAudit(draft.problem, solved);
  const matchingCardIds = { repeat: cardChecks.filter(card => card.matchesRepeat).map(card => card.id), grouping: cardChecks.filter(card => card.matchesGrouping).map(card => card.id) };
  const paths = draft.explanation?.paths, transfers = draft.explanation?.transfers;
  const reasonedEvidence = Array.isArray(paths) && paths.length === 2 && Array.isArray(transfers) && transfers.length === 3
    && paths.every(path => closed(path, ['contextId', 'goal', 'givenMeaning', 'why', 'operationMeaning', 'result', 'unit', 'resultMeaning', 'conditionalNote']))
    && same(paths.map(path => [path.contextId, path.result, path.unit]), [['repeat', solved.commonPositiveTimes, 'minute'], ['grouping', solved.commonPositiveGroupSizes, 'card_per_package']])
    && same(transfers, expected.explanation.transfers)
    && same(transfers[0]?.remainders, solved.sumRemainders) && same(transfers[1]?.cases, solved.boundaryCases)
    && same(transfers[2]?.packageCounts, solved.packageCountsAtExampleSize);
  const checks = { sourceLineage: same(draft.sourceLineage, expected.sourceLineage), scope: same(draft.scope, expected.scope), purpose: same(draft.purpose, expected.purpose),
    authoredProfile: same(Object.fromEntries(Object.entries(draft).filter(([key]) => !['answerKey', 'contentSha256'].includes(key))),
      Object.fromEntries(Object.entries(expected).filter(([key]) => !['answerKey', 'contentSha256'].includes(key)))),
    reasonedEvidence, representation: same(draft.representation?.repeatSequences, solved.repeatSequences) && same(draft.representation?.groupRows, solved.groupRows),
    uniqueMatching: matchingCardIds.repeat.length === 1 && matchingCardIds.grouping.length === 1 && matchingCardIds.repeat[0] !== matchingCardIds.grouping[0],
    answerKey: closed(draft.answerKey, ['repeat', 'grouping']) && matchingCardIds.repeat.length === 1 && matchingCardIds.grouping.length === 1
      && draft.answerKey.repeat === matchingCardIds.repeat[0] && draft.answerKey.grouping === matchingCardIds.grouping[0],
    contentIntegrity: typeof draft.contentSha256 === 'string' && /^[a-f0-9]{64}$/u.test(draft.contentSha256)
      && draft.contentSha256 === digest('draft', Object.fromEntries(Object.entries(draft).filter(([key]) => key !== 'contentSha256'))) };
  const errors = Object.entries(checks).filter(([, passed]) => !passed).map(([id]) => `common_relations_${id}_failed`);
  return report(checks, errors, { ...solved, matchingCardIds }, cardChecks, 1);
}
