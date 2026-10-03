import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGardenQuestion, validateQuestion } from '../content-factory/pilot.mjs';

const OVERLAYS = new WeakSet();
const hash = data => createHash('sha256').update(JSON.stringify(data)).digest('hex');
const freeze = data => {
  if (data && typeof data === 'object') { for (const child of Object.values(data)) freeze(child); Object.freeze(data); }
  return data;
};
function ownOptions(value, allowed) {
  if (!value || typeof value !== 'object' || isProxy(value) || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('invalid_reasoning_options');
  const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
  if (keys.some(key => typeof key !== 'string' || !allowed.includes(key) || !Object.hasOwn(descriptors[key], 'value'))) throw new Error('invalid_reasoning_options');
  return Object.fromEntries(keys.map(key => [key, descriptors[key].value]));
}

/** Original review-only explanation trace; never represents an existing voice recording. */
export function createGardenReasoningOverlay(options = {}) {
  const values = ownOptions(options, ['questionId']);
  const questionId = values.questionId ?? 'garden-two-rows-editor-v1';
  if (typeof questionId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/u.test(questionId)) throw new Error('invalid_reasoning_options');
  const question = createGardenQuestion({ id: questionId });
  if (validateQuestion(question).localMathChecks !== 'passed') throw new Error('invalid_reasoning_source');
  const givens = [
    { id: 'short_side', value: 18, unit: 'm', questionPhrase: 'Kısa kenarı 18 m', meaning: 'Bahçenin kısa kenarının uzunluğu.', role: 'short_side_length' },
    { id: 'ratio_denominator', value: 2, unit: 'equal_part', questionPhrase: 'kısa kenarın 3/2 katıdır', meaning: 'Kısa kenarı iki eş parça olarak düşünürüz.', role: 'short_side_equal_parts' },
    { id: 'ratio_numerator', value: 3, unit: 'equal_part', questionPhrase: 'kısa kenarın 3/2 katıdır', meaning: 'Uzun kenar aynı büyüklükteki parçalardan üç tanesidir.', role: 'long_side_equal_parts' },
    { id: 'gate_width', value: 4, unit: 'm', questionPhrase: '4 m genişliğindeki kapı boşluğu her iki tel sırasında', meaning: 'Her sırada tel çekilmeyen kapı açıklığı.', role: 'per_row_gate_gap' },
    { id: 'wire_rows', value: 2, unit: 'row', questionPhrase: 'İki sıra tel için kaç metre', meaning: 'Kapıyı boş bırakan aynı tel güzergâhı iki kez uygulanır.', role: 'wire_row_count' },
  ];
  const base = (id, title, kind, explanation, whyThisOperation, extras = {}) => ({
    id, title, kind, explanation, whyThisOperation, givenIds: [], displayTargets: [], dependsOn: [],
    solutionStepId: null, operands: [], calculation: null, workedSteps: [], checkQuestion: null, checkAnswer: null, alternate: null, ...extras,
  });
  const calculation = step => ({ expression: step.expression, value: step.value, unit: step.unit, meaning: step.meaning });
  const operand = (value, sourceId, originKind, meaning) => ({ value, sourceId, originKind, meaning });
  const partLength = question.problem.shortSide / question.problem.longSideRatio.denominator;
  const stages = [
    base('goal', 'Önce isteneni yakala', 'orient',
      'Soru bize alanı ya da yalnız bir turun çevresini sormuyor. Kapıyı açık bırakan iki sıra için toplam tel uzunluğunu istiyor.',
      'İstenen büyüklüğü ve birimini belirlersek gereksiz alan hesabına yönelmeyiz. Cevabımız bir uzunluk olacak; birimi metre.',
      { givenIds: ['wire_rows', 'gate_width'], displayTargets: ['question-target', 'wire-rows', 'gate-gap'] }),
    base('givens', 'Sayılar neyi anlatıyor?', 'orient',
      '18 metre kısa kenar. 3/2, uzun kenarla kısa kenarın ilişkisi. 4 metre, her sırada açık bırakılan kapı. İki sıra, aynı gerekli tel uzunluğunu iki kez kullanacağımızı anlatıyor.',
      'Sayıları yalnız altını çizdiğimiz rakamlar olarak değil, ait oldukları büyüklükle birlikte okuyalım. Kesirdeki 2 ile tel sırasındaki 2 farklı görevler taşır.',
      { givenIds: givens.map(g => g.id), displayTargets: ['short-side', 'ratio', 'gate-gap', 'wire-rows'] }),
    base('plan', 'Hangi yolu seçelim, neden?', 'orient',
      'Planımız: eksik uzun kenarı bul → bir tam turun çevresini hesapla → bir sırada kapıyı çıkar → iki sıraya geç.',
      'Tel bu soruda dış sınır boyunca çekiliyor; bu yüzden alan değil çevre hesabı gerekir. Önce tek sırayı netleştirmek, kapı boşluğunu her sırada saymayı kolaylaştırır.',
      { givenIds: ['short_side', 'ratio_denominator', 'ratio_numerator', 'gate_width', 'wire_rows'], displayTargets: ['outer-boundary', 'gate-gap'] }),
    base('step1', 'Uzun kenar: iki parçadan üç parçaya', 'calculate',
      '18, kısa kenarın uzunluğu. Uzun kenarın 3/2 kat olması, kısa kenarı iki eş parçaya ayırıp aynı parçalardan üç tane almamız demek.',
      'Önce 18’i 2’ye bölerek bir eş parçayı buluruz. Sonra 3 ile çarparak uzun kenarı elde ederiz. Buradaki 2 tel sırası değil, kesrin paydasıdır.',
      { solutionStepId: 'step1', givenIds: ['short_side', 'ratio_denominator', 'ratio_numerator'], displayTargets: ['short-side', 'ratio'],
        operands: [operand(18, 'short_side', 'question_given', 'Kısa kenar'), operand(2, 'ratio_denominator', 'question_given', 'Kısa kenarın eş parça sayısı'), operand(3, 'ratio_numerator', 'question_given', 'Uzun kenarın eş parça sayısı')],
        calculation: calculation(question.solutionGraph[0]),
        workedSteps: [
          { expression: `${question.problem.shortSide} ÷ ${question.problem.longSideRatio.denominator}`, value: partLength, unit: 'm', meaning: 'Bir eş parçanın uzunluğu' },
          { expression: `${partLength} × ${question.problem.longSideRatio.numerator}`, value: question.solutionGraph[0].value, unit: 'm', meaning: 'Üç eş parça: uzun kenar' },
        ],
        checkQuestion: 'Bu işlemdeki 2, tel sırasını mı yoksa kesrin paydasını mı anlatıyor?',
        checkAnswer: 'Kesrin paydasını anlatır: kısa kenarı iki eş parça düşünürüz. Tel sırası sayısını toplam tel hesabında ayrıca kullanacağız.' }),
    base('step2', 'Bir tur: neden ikiyle çarpıyoruz?', 'calculate',
      'Uzun kenarı artık biliyoruz. Dikdörtgenin dış sınırında iki kısa ve iki uzun kenar var.',
      'Bir kısa ve bir uzun kenarı toplar, bu toplamı iki kez alırız. Buradaki 2, iki eş kenar çiftini sayar; iki tel sırasını henüz hesaplamıyoruz.',
      { solutionStepId: 'step2', dependsOn: ['step1'], givenIds: ['short_side'], displayTargets: ['outer-boundary'],
        operands: [operand(2, 'opposite_edge_pairs', 'shape_property', 'İki kısa–uzun kenar çifti'), operand(18, 'short_side', 'question_given', 'Kısa kenar'), operand(27, 'step1', 'previous_result', 'Bulduğumuz uzun kenar')],
        calculation: calculation(question.solutionGraph[1]), checkQuestion: 'Bu sonuç bir turun tamamı mı, iki sıra tel mi?', checkAnswer: 'Bir tam turun çevresidir. Kapı açıklığını ve iki tel sırasını sonraki adımlarda ele alacağız.' }),
    base('step3', 'Bir sırada neden kapıyı çıkarıyoruz?', 'calculate',
      'Tam çevre kapının bulunduğu açıklığı da içeriyor. Oysa 4 metre genişliğindeki kapıya tel çekilmeyecek.',
      'Tek sıra telin gerekli uzunluğunu bulmak için tam çevreden bir kapı boşluğunu çıkarırız. Bu sonuç yalnız bir sıra içindir.',
      { solutionStepId: 'step3', dependsOn: ['step2'], givenIds: ['gate_width'], displayTargets: ['gate-gap'],
        operands: [operand(90, 'step2', 'previous_result', 'Bir tam turun çevresi'), operand(4, 'gate_width', 'question_given', 'Bir sıradaki kapı açıklığı')], calculation: calculation(question.solutionGraph[2]),
        checkQuestion: 'Bu aşamada kaç sıra için tel uzunluğu bulduk?', checkAnswer: 'Kapı boşluğu çıkarılmış bir sıra için bulduk. İki sıra gerektiğinden bu uzunluğu iki kez kullanacağız.' }),
    base('step4', 'Bir sıradan iki sıraya geç', 'calculate',
      'Önceki sonuç kapıyı boş bırakan bir tel sırasını anlatıyor. Soru iki sıra istiyor.',
      'Bir sıra için bulduğumuz uzunluğu iki kez alırız. Bu kez 2, sorudaki tel sırası sayısıdır; kapı boşluğu her sırada zaten çıkarılmıştır.',
      { solutionStepId: 'step4', dependsOn: ['step3'], givenIds: ['wire_rows', 'gate_width'], displayTargets: ['wire-rows', 'gate-gap'],
        operands: [operand(86, 'step3', 'previous_result', 'Kapı hariç bir sıranın tel uzunluğu'), operand(2, 'wire_rows', 'question_given', 'İstenen tel sırası sayısı')], calculation: calculation(question.solutionGraph[3]),
        checkQuestion: 'Cevabımız hangi büyüklüğü ve hangi birimi taşıyor?', checkAnswer: 'İki sıra için gerekli toplam tel uzunluğu: 172 metre. Bu bir alan olmadığından metrekare yazmayız.' }),
    base('check', 'Sonucu koşulla kontrol et', 'check',
      'Sonuçta iki sırayı saydık mı? Kapıyı her iki sırada açık bıraktık mı? Birimimiz metre mi?',
      'İşlem bitince yalnız sayıya bakmayız; bulduğumuz miktarın sorudaki hedef ve özel koşulları karşılayıp karşılamadığını kontrol ederiz.',
      { dependsOn: ['step4'], givenIds: ['gate_width', 'wire_rows'], displayTargets: ['question-target', 'gate-gap', 'wire-rows'],
        checkQuestion: 'Kapı boşluğunu neden iki kez çıkardık?', checkAnswer: 'İki ayrı tel sırası var ve 4 metrelik kapı her sırada boş bırakılıyor. Önce bir sıradan kapıyı çıkarıp sonra ikiyle çarpmak, iki kapı boşluğunu da hesaba katar.' }),
    base('compare', 'Pratik yol: aynı gerekçe, kısa yazım', 'compare',
      'Öğrenirken tek sıradan iki sıraya gittik. Yapıyı açıklayabiliyorsan iki tam sırayı hesaplayıp iki kapı boşluğunu birlikte çıkarabilirsin.',
      'Bu farklı bir ezber değil, aynı hesabın eşdeğer yazımıdır. Yalnız bir kapı boşluğu çıkarmak koşulu ihlal eder. Hız, hangi miktarı saydığını kaybetmeden gelir.',
      { dependsOn: ['step4'], givenIds: ['gate_width', 'wire_rows'], displayTargets: ['gate-gap', 'wire-rows'], alternate: {
        expression: '2 × 90 − 2 × 4', value: 172, unit: 'm', fullRowsLength: 180, excludedGateLength: 8,
        validOnlyWhen: 'same_gap_in_each_row', condition: 'Aynı kapı boşluğu her tel sırasında bırakılıyor.',
        whyEquivalent: 'İki tam tur 180 m; iki ayrı 4 m açıklık toplam 8 m. 180 − 8 = 172 m. 180 − 4 yalnız bir açıklığı çıkarır ve bu soruda doğru değildir.',
      } }),
  ];
  const overlay = {
    schemaVersion: 'garden-reasoning-overlay/v1', id: 'garden-reasoned-teaching-v1', version: '1.0.0',
    source: { questionId, contentSha256: question.contentSha256, inkPlanId: question.inkPlan.id, inkPlanSha256: question.inkPlanSha256 },
    questionText: question.prompt, target: { measurement: 'wire_length', unit: 'm', wireRows: 2, excludesGatePerRow: true },
    givens, stages, state: 'draft', publicationReady: false, mediaStatus: 'new_narration_not_generated',
    audience: 'content_editor_review_only', expertReview: 'pending', curriculumStatus: 'candidate_mapping_expert_pending',
    learnerEvidence: 'none_collected', difficulty: 'author_estimated_not_calibrated',
  };
  overlay.contentSha256 = hash(overlay);
  freeze(overlay); OVERLAYS.add(overlay); return overlay;
}

/** A minimal visible stage. Gated results are not implied to be learner authorization. */
export function getGardenReasoningView(overlay, options = {}) {
  if (!overlay || typeof overlay !== 'object' || !OVERLAYS.has(overlay)) throw new Error('invalid_reasoning_overlay');
  const values = ownOptions(options, ['stageIndex', 'revealAnswer', 'reducedMotion']);
  const stageIndex = Object.hasOwn(values, 'stageIndex') ? values.stageIndex : 0;
  const revealAnswer = Object.hasOwn(values, 'revealAnswer') ? values.revealAnswer : false;
  const reducedMotion = Object.hasOwn(values, 'reducedMotion') ? values.reducedMotion : false;
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= overlay.stages.length || typeof revealAnswer !== 'boolean' || typeof reducedMotion !== 'boolean') throw new Error('invalid_reasoning_options');
  const stage = overlay.stages[stageIndex];
  const requiresReveal = ['calculate', 'check'].includes(stage.kind);
  return freeze({
    source: { ...overlay.source, overlaySha256: overlay.contentSha256 }, questionText: overlay.questionText, target: overlay.target, givens: overlay.givens,
    stageIndex, stageCount: overlay.stages.length, stage: { ...stage,
      calculation: revealAnswer ? stage.calculation : null, workedSteps: revealAnswer ? stage.workedSteps : [], checkAnswer: revealAnswer ? stage.checkAnswer : null,
    },
    priorResults: overlay.stages.slice(0, stageIndex).filter(item => item.calculation).map(item => ({ stepId: item.solutionStepId, ...item.calculation })),
    requiresReveal, revealAnswer, canAdvance: stageIndex < overlay.stages.length - 1 && (!requiresReveal || revealAnswer),
    publicationReady: false, mediaStatus: overlay.mediaStatus, reducedMotion,
  });
}
