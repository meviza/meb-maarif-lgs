import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createSourceScopeGapReport } from './source_scope_gaps.mjs';

// These pins bind the reviewed metadata revision, not authenticity, rights or
// an active curriculum decision. A changed source needs a separately reviewed
// revision; a caller-provided replacement digest cannot promote it here.
const FORM_REVISION = '6388cb4b9200d9fd7be078716b292bd7c97e478f8be12a94a8dc779c8a3b75be';
const MATRIX_REVISION = '5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8';
const SOURCES = [
  { id: 'meb-archive-grade6-math-fascicle-unit1-hatay',
    pdfSha256: 'f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e',
    byteLength: 6199288, courseKey: 'matematik',
    rowSha256: 'e93f7e528f80858a4b4e4e779f9a69f4184deab617269a40991c023d7006c875' },
  { id: 'tymm-current-ortaokul-matematik',
    pdfSha256: '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734',
    byteLength: 3916466, courseKey: 'ortaokul-matematik',
    rowSha256: '610d60eeb3d8387517d2f74f71be171fa8663e3a177d42bd217b647ac6bdea19' }
];
const fail = code => { throw new Error(code); };
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// Copy before inspecting fields or calling the scope consumer. No getters,
// proxies, toJSON functions, sparse arrays, cycles or non-public data channels.
// Sorted own data keys make harmless object-key ordering irrelevant to hashes.
function inertSnapshot(input) {
  const visiting = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 100000 || depth > 24) fail('grade6_authoring_invalid_data');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) fail('grade6_authoring_invalid_data');
      return value;
    }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 65536 || bytes > 2 * 1024 * 1024 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('grade6_authoring_invalid_data');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('grade6_authoring_invalid_data');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail('grade6_authoring_invalid_data');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value')
      || (key !== 'length' || !array) && !descriptors[key].enumerable)) fail('grade6_authoring_invalid_data');
    for (const key of keys) {
      if (key.length > 160 || /[\u0000-\u001f]/u.test(key)) fail('grade6_authoring_invalid_data');
      bytes += Buffer.byteLength(key);
      if (bytes > 2 * 1024 * 1024) fail('grade6_authoring_invalid_data');
    }
    visiting.add(value);
    let result;
    if (array) {
      const length = descriptors.length.value;
      if (length > 2048 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('grade6_authoring_invalid_data');
      result = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('grade6_authoring_invalid_data');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else {
      if (keys.length > 1024) fail('grade6_authoring_invalid_data');
      result = Object.fromEntries(keys.sort().map(key => [key, copy(descriptors[key].value, depth + 1)]));
    }
    visiting.delete(value); return result;
  }
  return copy(input);
}
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
function record(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('grade6_authoring_invalid_fields');
}
function list(value, error = 'grade6_authoring_invalid_scope') {
  if (!Array.isArray(value)) fail(error);
  return value;
}

function sourceScope(input, forms) {
  record(input);
  const fields = ['archives', 'selection', 'downloadObservations', 'monthly', 'formObservations'];
  if (Object.keys(input).length !== fields.length || fields.some(field => !Object.hasOwn(input, field))) fail('grade6_authoring_invalid_scope');
  for (const container of [input.selection, input.downloadObservations, input.monthly, input.formObservations]) record(container);
  if (digest(input.formObservations) !== digest(forms)) fail('grade6_authoring_scope_revision_mismatch');
  const archives = list(input.archives);
  const rows = [...archives.flatMap(snapshot => { record(snapshot); return list(snapshot.sources, 'grade6_authoring_invalid_source'); }),
    ...list(input.selection?.sources, 'grade6_authoring_invalid_source'),
    ...list(input.monthly?.sources, 'grade6_authoring_invalid_source')];
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || !row.id || seen.has(row.id)) fail('grade6_authoring_duplicate_or_invalid_source');
    seen.add(row.id);
  }
  for (const expected of SOURCES) {
    const row = rows.find(row => row.id === expected.id);
    if (!row || !Array.isArray(row.grades) || !row.grades.includes(6) || row.courseKey !== expected.courseKey
      || row.download?.status !== 'downloaded' || row.download.sha256 !== expected.pdfSha256
      || row.download.byteLength !== expected.byteLength || row.reuseRights !== 'unverified'
      || row.usagePolicy !== 'reference_only' || digest(row) !== expected.rowSha256) fail('grade6_authoring_source_revision_mismatch');
  }
  if (list(input.downloadObservations?.sources).some(row => {
    record(row); return SOURCES.some(expected => expected.id === row.sourceId);
  })) fail('grade6_authoring_source_override_not_allowed');
  let report;
  try { report = createSourceScopeGapReport(input); }
  catch { fail('grade6_authoring_invalid_scope_source_snapshot'); }
  const observed = report.sourceForm;
  if (observed.observationSourceCount !== 1 || observed.boundObservationSourceCount !== 1
    || observed.unboundObservationSourceCount !== 0 || observed.observedItemCount !== 6
    || observed.sources[0]?.sourceId !== SOURCES[0].id || observed.sources[0]?.candidateFamilyCount !== 6
    || observed.sourceQuestionTotal !== null || observed.productQuestionContribution !== 0) fail('grade6_authoring_scope_lineage_mismatch');
  return report;
}

function requirements(verifierId, checks) {
  return { verifierId, state: 'required_not_implemented_or_run', requiredChecks: checks,
    automatedVerifierPassed: false, expertAccepted: false, answerKey: null,
    nonVerifiableClosedItemPolicy: 'reject_before_product_acceptance' };
}

// Own-word briefs: no numeric parameterization, source question body/options,
// answer key or SVG. The representation is a new design proposal, not a render.
const DESIGNS = [
  {
    title: 'İki Kuralı Birlikte Gör', purpose: 'Bir nesnenin iki koşula ayrı ayrı ve birlikte uymasını gerekçesiyle ayırt et',
    taskKind: 'classify_and_justify_joint_rules', representationId: 'criteria_sorting_cards',
    design: 'Yeni seçilecek kartları iki özellik için etiketle; sonra yalnız birine, ikisine veya hiçbirine uyanları metin ve örüntülü bölgelere taşı',
    traces: ['Her özellik için ayrı karar ve kısa gerekçe', 'Ortak sınıfı tek koşullu sınıftan ayıran kanıt', 'Son sınıfların bütün nesneleri bir kez kapsadığını kontrol'],
    note: { when: 'İki bağımsız koşul aynı anda isteniyorsa', why: 'Koşulları önce ayrı test etmek kesişimi tahmin ederek seçmeyi azaltabilir', check: 'Ortak sınıftaki her kart iki ayrı koşul kontrolünü de geçmeli' },
    verifier: 'joint_rule_exact_membership', checks: ['Özgün veri alanı ve iki koşul için tam, deterministik doğruluk tablosu oluşturulmalı', 'Dört üyelik durumu ve tekrar/eksik kartlar bağımsız oracle ile karşılaştırılmalı', 'Kapalı seçim kullanılacaksa tek kabul edilebilir üyelik haritası ve çeldirici ayrımı doğrulanmalı']
  },
  {
    title: 'Aynı Değeri Yeni Yolla Kur', purpose: 'Değeri korurken verilen araç kısıtını karşılayan bir işlem ifadesi oluştur ve sınamasını göster',
    taskKind: 'construct_and_check_equivalent_expression', representationId: 'expression_token_workspace',
    design: 'Hesap makinesi kopyası yerine izin verilen işlem jetonları, özgün hedef ifadesi ve eşdeğerlik kontrol şeridi tasarla',
    traces: ['İzin verilen ve yasaklanan araçların ayrımı', 'Kurulan ifadenin hedefle eşdeğer olduğunu gösteren adımlar', 'Kısıta uygunluk denetimi'],
    note: { when: 'Doğru sonuç kadar kullanılabilecek araçlar da kısıtlıysa', why: 'Kısıtı çözümden önce ayırmak matematikçe doğru ama görevce geçersiz yolu fark etmeyi kolaylaştırabilir', check: 'Son ifade hem aynı değeri vermeli hem yasak bir jeton içermemeli' },
    verifier: 'bounded_expression_equivalence_and_constraints', checks: ['Sonlu izinli dil, operatör önceliği, uzunluk sınırı ve sıfıra bölme reddi tanımlanmalı; öğrenci metni eval ile çalıştırılmamalı', 'Kesin tamsayı/rasyonel yorumlayıcı ile eşdeğerlik ve kısıt uygunluğu ayrı doğrulanmalı', 'Açık yanıtın farklı geçerli ifadeleri kabul edilmeli; tek bir yazılış cevap anahtarı yapılmamalı']
  },
  {
    title: 'Bir Hatanın İzini Sür', purpose: 'Yerel kararları ve toplam hata sayısını birlikte takip ederek hangi yolların mümkün kaldığını açıkla',
    taskKind: 'enumerate_and_explain_single_error_paths', representationId: 'error_budget_path_ledger',
    design: 'Özgün ve küçük bir karar yapısı için adım, hesaplanan sonuç, seçilen yön ve kalan hata hakkı sütunlarından oluşan yol defteri öner',
    traces: ['Her kararın hesaplanan değeri ve yönle ilişkisi', 'Yol boyunca hata sayısının birikimi', 'Koşulu sağlayan bütün yollar ve elenenlere gerekçe'],
    note: { when: 'Tam bir yanlış karar içeren yollar aranıyorsa', why: 'Hata durumunu her adımda taşımak yalnız doğru yolu bulup diğer olasılıkları atlamayı önleyebilir', check: 'Kabul edilen her tam yolda hata sayısı koşula eşit olmalı' },
    verifier: 'exact_one_error_reachability', checks: ['Özgün düğüm/kenar yapısı sonlu, erişilebilir, açıkça tanımlı ve kaynak topolojisinden bağımsız olmalı', 'Kesin işlem değerlendirmesi ve hata bütçeli durum gezmesi bütün mümkün yolları sıralamalı', 'Aynı çıkışa farklı yollarla ulaşmayı ve eksik/fazla hata koşullarını bağımsız oracle sınamalı']
  },
  {
    title: 'Çarpanları Düzenle, Asalları Ayır', purpose: 'Çarpan listesinin tamlığını göster; asal olanları ve sorunun istediği niceliği bu listeden gerekçeyle ayır',
    taskKind: 'list_factors_and_distinguish_prime_subset', representationId: 'factor_pairs_and_prime_badges',
    design: 'Boş yayılan kutular yerine eş çarpan tablosu ve yalnız doğrulanmış asallar için metinli rozetler tasarla; sonraki hedefi ayrı satırda belirt',
    traces: ['Her çarpan için karşılık gelen eş çarpan', 'Tekrar olmadan tamamlanan pozitif çarpan listesi', 'Asal alt küme ile istenen nicelik arasındaki ayrım'],
    note: { when: 'Bütün çarpanlardan yalnız belirli bir türü seçmek gerekiyorsa', why: 'Listeyi tamamlayıp sonra süzmek en küçük çarpan ile en küçük asal çarpanı karıştırmayı azaltabilir', check: 'Bir asal sayı tanımına uymaz; aynı asal çarpanı çoklu üs nedeniyle tekrar toplama' },
    verifier: 'positive_divisors_and_distinct_prime_subset', checks: ['Pozitif ve sınırlandırılmış tamsayı girdisinde tam bölen kümesi kesin yöntemle çıkarılmalı; sıfır için sonlu liste uydurulmamalı', 'Bir asal değil; asal alt küme ayrı test edilmeli ve farklı asal çarpanlar tekrar sayılmamalı', 'Seçme/toplama hedefi açık tanımlı olmalı; iki bağımsız çözüm ve alt görev yanıtları tutarlı olmalı']
  },
  {
    title: 'Eksik Bilgiden Bütünü Kur', purpose: 'Kısmi çarpan kanıtından başlangıç sayısına geri git; eksikleri ve olası belirsizliği gerekçesiyle denetle',
    taskKind: 'reconstruct_and_prove_factor_list_completeness', representationId: 'inverse_factor_pair_board',
    design: 'Kaynağın sıralı dairelerini kopyalamadan, verilen ve önerilen eş çarpanları karşılaştıran tamlık panosu oluştur',
    traces: ['Hangi veri ile başlangıç sayısının aday yapıldığı', 'Eksik eş çarpanların neden eklendiği', 'Başka bir başlangıç sayısının da mümkün olup olmadığına ilişkin kontrol'],
    note: { when: 'Başlangıç sayısı verilmeden çarpan ilişkilerinden geri gidiliyorsa', why: 'Eş çarpan çarpımlarını ve tamlığı birlikte sınamak boşluğu yalnız sıra örüntüsüyle tahmin etmeyi azaltabilir', check: 'Birden fazla uygun sayı varsa kapalı soruya tek doğru cevap atama' },
    verifier: 'inverse_factor_candidate_uniqueness', checks: ['Sonlu aday alanı, verilen çarpanların anlamı ve sıralama/tamlık varsayımı açıkça yazılmalı', 'Bütün adaylar kesin çarpan oracle ile elenmeli; kalan sayı ve eksik liste doğrulanmalı', 'Kapalı yanıt için biriciklik kanıtı gerekli; birden fazla aday açık belirsizlik görevi yapılmalı veya reddedilmeli']
  },
  {
    title: 'Seçimin Kaynağını Kaybetme', purpose: 'Her sayıda istenen asal çarpanı seç; sıralarken hangi ara sonuçtan geldiğini göster',
    taskKind: 'track_prime_selection_then_order', representationId: 'prime_selection_provenance_table',
    design: 'Kaynak şifre kutuları yerine özgün veri, asal alt küme, seçilen değer ve sıralamadaki konumu bağlayan açıklamalı tablo tasarla',
    traces: ['Her başlangıç verisine bağlı ayrı asal çarpan kümesi', 'Seçim kuralının her satırda uygulanması', 'Sıralanmış sonuçta tekrarlar ve kaynak ilişkilerinin korunması'],
    note: { when: 'Birden fazla ara sonuç seçildikten sonra sıralanıyorsa', why: 'Seçimi önce satırına bağlamak bir değerin neden kullanıldığını son sıralamada kaybetmeyi azaltabilir', check: 'Eşit seçilen değerleri kural gereği koru; asal çarpanı olmayan girdiye değer uydurma' },
    verifier: 'prime_extrema_ordered_multiset', checks: ['Özgün girdi alanı en az iki olan sınırlı pozitif tamsayılarla tanımlanmalı; birin asal çarpanı yoktur', 'Her satırın farklı asal çarpan kümesi ve seçilen uç değeri kesin oracle ile sınanmalı', 'Sıralama yönü, tekrarların korunması ve çıktı biçimi açık olmalı; karışık satır/yanlış uç değer negatifleri reddedilmeli']
  }
];

/** Pure, bounded pre-blueprint planning; no approved item or source transfer. */
export function createGrade6ReferenceAuthoringPlan(input) {
  const data = inertSnapshot(input); record(data);
  const fields = ['formObservations', 'semanticMatrix', 'sourceScopeInput'];
  if (Object.keys(data).length !== fields.length || fields.some(field => !Object.hasOwn(data, field))) fail('grade6_authoring_invalid_fields');
  if (digest(data.formObservations) !== FORM_REVISION || digest(data.semanticMatrix) !== MATRIX_REVISION) fail('grade6_authoring_input_revision_mismatch');
  const scope = sourceScope(data.sourceScopeInput, data.formObservations);
  const observed = data.formObservations.observations[0];
  const gates = { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', difficulty: 'pending', answer: 'pending', accessibility: 'pending' };
  const briefs = observed.items.map((item, index) => {
    const design = DESIGNS[index];
    return {
      briefId: `g6-reference-authoring-${item.ordinal}`, state: 'editor_candidate_pre_blueprint', title: design.title,
      sourceReference: { sourceId: observed.sourceId, sourceSha256: observed.sourceSha256,
        ordinal: item.ordinal, physicalPdfPage: item.physicalPdfPage, printedPage: item.printedPage,
        family: item.candidateFamily, representation: item.representation.candidateId },
      purpose: { statement: design.purpose, microAimIds: item.microPurposes.map(row => row.id), origin: 'original_editor_brief_informed_by_reviewed_form_not_official_taxonomy' },
      evidence: { taskKind: design.taskKind, requiredTraces: [...design.traces], learnerEvidenceCollected: false,
        solutionNarrationRequired: ['Sorunun ne istediğini ayır', 'Verinin neyi anlattığını belirt', 'Yolun neden seçildiğini açıkla', 'Ara değerlerin kaynağını göster', 'Sonucu koşullara göre kontrol et'] },
      practicalNote: { state: 'conditional_editor_note_not_validated_teaching', ...design.note },
      plannedRepresentation: { id: design.representationId, description: design.design, state: 'design_requirement_not_rendered',
        sourceGeometryReused: false, numericInputs: null, imageProduced: false,
        accessibilityRequirements: ['Renk ve konum dışında metin/örüntü/sıra eşdeğeri', 'Öğrenen görevine göre klavye ve ekran okuyucu incelemesi'],
        accessibilityPassed: false },
      answerValidationPolicy: requirements(design.verifier, [...design.checks]),
      proposedOutcomeCodes: item.sourceProgramProposedLinks.map(row => row.outputCode), officialOutcomeCode: null,
      programBinding: item.sourceProgramProposedLinks.length ? 'partial_content_link_candidate_not_accepted' : 'unbound_additional_mapping_pending',
      fullOutcomeCoverage: false, difficultyBand: null, difficultyCalibration: null,
      gates: { ...gates }, teacherApproved: false, publicationReady: false, learnerReady: false
    };
  });
  const result = {
    schemaVersion: 'grade6-reference-authoring-plan/v1', state: 'editor_candidate_pre_blueprint',
    artifactAudience: 'editor_only', gradeCandidate: 6, courseCandidate: 'matematik',
    lineage: { formMetadataRevisionSha256: FORM_REVISION, semanticMetadataRevisionSha256: MATRIX_REVISION,
      sourceRecords: SOURCES.map(row => ({ sourceId: row.id, sourceSha256: row.pdfSha256, sourceRowMetadataSha256: row.rowSha256 })),
      sourceScope: { reportSha256: scope.contentSha256, inputSnapshotSha256: scope.inputSnapshotSha256,
        observedItemCount: scope.sourceForm.observedItemCount, boundObservationSourceCount: scope.sourceForm.boundObservationSourceCount,
        sourceQuestionTotal: scope.sourceForm.sourceQuestionTotal, freshPdfByteChecks: scope.freshPdfByteChecks,
        state: 'recorded_metadata_binding_not_source_authentication_or_fresh_byte_check' } },
    counts: { plannedBriefs: briefs.length, observedSourceItems: scope.sourceForm.observedItemCount,
      generatedQuestions: 0, acceptedProductQuestions: 0, briefsAreProductQuestionCount: false },
    briefs, familyTaxonomyIsOfficial: false, targetQuestionCount: null,
    sourceDifficultyDistribution: null, difficultyCalibration: null,
    exampleDifficultyTarget: { basis: 'user_example_only_not_source_distribution_or_universal_policy',
      percentages: { easy: 10, medium: 30, hard: 30, veryHard: 30 }, applied: false },
    gaps: [{ code: 'MAT.6.1.4', status: 'not_observed_in_this_sample', globallyAbsent: false },
      { code: 'extra_arithmetic_outputs', status: 'two_unbound_tasks_need_actual_program_mapping' },
      { code: 'full_grade_source_and_family_denominators', status: 'unknown' }],
    gates, humanApproval: null, canonicalCurriculumBinding: null, coverageBlueprintReady: false,
    teacherApproved: false, publicationReady: false, learnerReady: false, productionReady: false,
    modelTransferAllowed: false, commercialReuseRights: 'unverified', usagePolicy: 'reference_only',
    originalityPolicy: { sourceBodiesOptionsNumbersMediaAndKeysCopied: false, parameterClonesAreNewQuestions: false,
      originalityVerified: false, futureSimilarityAndRightsReviewRequired: true },
    governance: { owner: 'pending', steward: 'pending', retention: 'pending', realLearnerDataPresent: false },
    activity: { questionsProduced: 0, lessonsProduced: 0, imagesProduced: 0, audioProduced: 0, videosProduced: 0,
      providersCalled: 0, networkCallsMade: 0, downloadsMade: 0 },
    serializedHashIsAuthority: false
  };
  const body = inertSnapshot(result);
  result.contentSha256 = createHash('sha256').update(`k12.grade6-reference-authoring-plan/v1:${JSON.stringify(body)}`).digest('hex');
  if (Buffer.byteLength(JSON.stringify(result)) > 64 * 1024) fail('grade6_authoring_output_budget_exceeded');
  return freeze(result);
}
