import { isProxy } from 'node:util/types';
import { validateQuestion } from './pilot.mjs';
import { createReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';

const families = new Set(['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap', 'garden_two_rows']);

function sourceSnapshot(source) {
  const ancestors = new WeakSet();
  let entries = 0, textBytes = 0;
  function inspect(value, depth = 0) {
    if (++entries > 50000 || depth > 24) throw new Error('invalid_reasoned_math_source');
    if (value === null || typeof value === 'boolean') return;
    if (typeof value === 'number') { if (!Number.isFinite(value)) throw new Error('invalid_reasoned_math_source'); return; }
    if (typeof value === 'string') { textBytes += Buffer.byteLength(value); if (value.length > 512000 || textBytes > 2000000) throw new Error('invalid_reasoned_math_source'); return; }
    if (typeof value !== 'object' || isProxy(value) || ancestors.has(value)) throw new Error('invalid_reasoned_math_source');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) throw new Error('invalid_reasoned_math_source');
    ancestors.add(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = descriptors[key];
      if (typeof key !== 'string' || !Object.hasOwn(descriptor, 'value')) throw new Error('invalid_reasoned_math_source');
      inspect(descriptor.value, depth + 1);
    }
    ancestors.delete(value);
  }
  inspect(source);
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('invalid_reasoned_math_source');
  return structuredClone(source);
}

const evidence = (id, type, text, anchor, value, unit) => ({ id, type, text, anchor, value, unit });
const step = (id, why, kind, inputIds, value, unit, meaning, prompt, answer) => ({
  id, why, operation: { kind, inputIds }, result: { value, unit, meaning }, check: { prompt, answer },
});
const edgePairs = () => evidence('edge_pairs', 'shape_property', 'Dikdörtgende karşılıklı kenarlar eşittir; birer kenardan oluşan iki eş çift vardır.', 'shape:opposite-edge-pairs', 2, 'unitless');

function perimeterSteps(w, h) {
  return [
    step('edge_pair', 'Çevre dış sınırın toplamıdır. Önce farklı iki kenarı toplarız; karşı tarafta aynı iki uzunluk yeniden bulunur.', 'add', ['side_width', 'side_height'], w + h, 'cm', 'Bir kenar çiftinin uzunluğu',
      'Bu toplam dört kenarın tamamını mı anlatıyor?', 'Hayır. Birer kenarı topladık; karşılarındaki eş kenarları henüz saymadık.'),
    step('full_perimeter', 'Bir kenar çifti karşı tarafta bir kez daha vardır. İkiyle çarpmak bütün dört kenarı birer kez sayar; alanı hesaplamaz.', 'multiply', ['edge_pair', 'edge_pairs'], 2 * (w + h), 'cm', 'Dört kenarın toplam çevre uzunluğu',
      'Neden sonucu cm² değil cm ile yazıyoruz?', 'Dış sınırın uzunluğunu ölçtük. Uzunluk cm, kaplanan yüzey ise cm² ile ifade edilir.'),
  ];
}

function rectangleDraft(question) {
  const { template: family, width: w, height: h, gate } = question.problem;
  const area = w * h, perimeter = 2 * (w + h);
  const widthEvidence = evidence('side_width', 'given', 'Soruda verilen bir kenarın uzunluğu.', `${w} cm`, w, 'cm');
  const heightEvidence = evidence('side_height', 'given', 'Soruda verilen diğer kenarın uzunluğu.', `${h} cm`, h, 'cm');
  const areaEvidence = evidence('given_area', 'given', 'Soruda verilen toplam kaplanan yüzey alanı; bilinmeyen kenar değildir.', `Alanı ${area} cm²`, area, 'cm²');
  const perimeterEvidence = evidence('given_perimeter', 'given', 'Soruda verilen dört kenarın toplam çevresi; tek kenar değildir.', `Çevresi ${perimeter} cm`, perimeter, 'cm');
  const rows = {
    perimeter: {
      goal: { question: 'Dikdörtgenin dış sınırındaki dört kenarın toplam uzunluğu isteniyor; iç bölgenin alanı değil.', unit: 'cm', measurement: 'perimeter_length' },
      evidence: [widthEvidence, heightEvidence, edgePairs()],
      plan: { route: 'Verilen iki farklı kenarı topla → karşılıklı eş kenar çiftlerini say → birimi ve dört kenarı kontrol et.', why: 'Soru dış sınırın çevresini istiyor. Dikdörtgenin iki eş kenar çifti, toplamayı iki kez alarak bütün kenarları saymamızı sağlar.', conditions: ['Şekil dikdörtgendir; karşılıklı kenarlar eşittir.', 'Dört kenarın her biri yalnız bir kez sayılır.'] },
      steps: perimeterSteps(w, h),
      transfer: { prompt: 'Diğer kenar değişmeden ilk verilen kenar 1 cm uzatılsa çevre kaç cm artar ve yeni çevre ne olur? Neden?', answer: `Çevre 2 cm artar ve ${perimeter + 2} cm olur. İlk kenar ile karşısındaki eş kenar ayrı ayrı 1 cm uzar.` },
      prerequisite: 'Uzunluk toplama, karşılıklı kenarların eşitliği ve toplamın iki kez alınması.',
    },
    area: {
      goal: { question: 'Dikdörtgenin kapladığı yüzeyin birim kare sayısı, yani alanı isteniyor; kenarda yürünülen yol değil.', unit: 'cm²', measurement: 'covered_area' },
      evidence: [widthEvidence, heightEvidence, evidence('unit_square', 'definition', 'Kenarları 1 cm olan birim karenin alanı 1 cm² olur. Yan yana kareler sıralar oluşturur.', 'definition:unit-square', null, 'text')],
      plan: { route: 'Bir sıradaki kareleri ve sıra sayısını ilişkilendir → iki kenarı çarp → yüzey birimini kontrol et.', why: 'Yüzeyi birim karelerle örttüğümüzde bir kenar bir sıranın uzunluğunu, diğer kenar sıra sayısını belirler. Çarpma bütün kareleri kapsar.', conditions: ['Şekil dikdörtgendir ve kenar uzunlukları cm cinsindendir.', 'Kareler iç bölgeyi boşluksuz ve üst üste gelmeden kaplar.'] },
      steps: [step('covered_area', 'Çevre toplamak yerine yüzeyi kaplayan kareleri sayarız. Bir sıradaki kare sayısını sıra sayısıyla çarpmak bütün iç bölgeyi verir.', 'multiply', ['side_width', 'side_height'], area, 'cm²', 'İç bölgenin toplam yüzey alanı',
        'Bu çarpım neden çevreyi değil alanı verir?', 'İç bölgedeki kareleri sayar; kenarları dolaşmaz. Bu yüzden sonuç cm² cinsindendir.')],
      transfer: { prompt: 'Diğer kenar sabitken ilk verilen kenar 1 cm artsa alana kaç yeni birim kare eklenir ve yeni alan ne olur?', answer: `${h} birim kare eklenir; yeni alan ${area + h} cm² olur. Her sıraya bir kare eklendiği için artış diğer kenar boyunca oluşur.` },
      prerequisite: 'Birim kare, sıra düzeni ve çarpmanın eş grupları birleştirme anlamı.',
    },
    width_from_area: {
      goal: { question: 'Toplam alan ve bilinen bir kenardan, diğer kenarın uzunluğu isteniyor; verilen alanı yeniden bulmuyoruz.', unit: 'cm', measurement: 'unknown_side_length' },
      evidence: [areaEvidence, heightEvidence, evidence('area_relationship', 'definition', 'Dikdörtgenin alanı iki kenar uzunluğunun çarpımıdır.', 'definition:rectangle-area', null, 'text')],
      plan: { route: 'Verilen alanı ve bilinen kenarı belirle → çarpmanın tersini kullanarak böl → bulunan kenarla alanı geri kur.', why: 'Toplam yüzey ve bir kenar biliniyor. Toplamı bu kenar boyunca eş gruplara ayırmak, diğer kenarın uzunluğunu buldurur.', conditions: ['Alan cm², verilen kenar cm cinsindedir.', 'Bilinen kenar pozitif olduğu için toplam alanı bu kenara bölebiliriz.'] },
      steps: [step('unknown_side', 'Alan iki kenarın çarpımıdır. Bilinen çarpanı toplamdan ayırmak için böleriz; böylece soru tarafından verilmeyen diğer kenarı buluruz.', 'divide', ['given_area', 'side_height'], w, 'cm', 'Alana ve bilinen kenara uyan diğer kenar',
        'Bulduğumuz kenarın doğru olduğunu hangi işlemle kontrol ederiz?', `${w} cm ile ${h} cm çarpılırsa ${area} cm² geri elde edilir; bu değer sorudaki alanla aynıdır.`)],
      transfer: { prompt: 'Alan değişmeden bilinen kenar yarıya indirilse bilinmeyen kenar nasıl değişir? Eşit alanı korumayı kullanarak açıkla.', answer: `Bilinmeyen kenar iki katına, ${w * 2} cm uzunluğa çıkar. Çarpım aynı kalacağı için yarıya inen kenar diğer kenarın iki katıyla dengelenir.` },
      prerequisite: 'Alan bağıntısı, çarpma ile bölmenin ters işlemler olması ve cm²/cm ilişkisinin anlamı.',
    },
    width_from_perimeter: {
      goal: { question: 'Dört kenarın toplam çevresi ve bilinen bir kenardan, diğer kenarın uzunluğu isteniyor.', unit: 'cm', measurement: 'unknown_side_length' },
      evidence: [perimeterEvidence, heightEvidence, edgePairs()],
      plan: { route: 'Çevreyi iki eş kenar çiftine ayır → bir çift içinden bilinen kenarı çıkar → dört kenarı geri topla.', why: 'Çevre, birer kenardan oluşan aynı toplamın iki katıdır. Önce yarım çevreye, sonra bu çiftteki eksik kenara ulaşırız.', conditions: ['Şekil dikdörtgendir; çevrede her farklı kenar iki kez bulunur.', 'Bilinen kenarı bütün çevreden yalnız bir kez çıkarmak bilinmeyen tek kenarı vermez.'] },
      steps: [
        step('edge_pair', 'Verilen çevre iki aynı kenar çiftini içerir. İkiye bölmek yalnız bir kenarın değil, birer kenardan oluşan çiftin toplamını verir.', 'divide', ['given_perimeter', 'edge_pairs'], w + h, 'cm', 'Yarım çevre: farklı iki kenarın toplamı',
          'Yarım çevre doğrudan bilinmeyen kenar mı?', 'Hayır. Bilinen kenar ile aradığımız diğer kenarın toplamıdır.'),
        step('unknown_side', 'Yarım çevrede bilinen kenar da bulunuyor. Bu kenarı çıkardığımızda geriye aranan tek kenarın uzunluğu kalır.', 'subtract', ['edge_pair', 'side_height'], w, 'cm', 'Verilen çevreye uyan diğer kenar',
          'Bulduğumuz kenarla başlangıçtaki çevreyi nasıl geri elde ederiz?', `İki ${w} cm kenar ile iki ${h} cm kenar toplam ${perimeter} cm eder; başlangıç çevresi geri kurulur.`),
      ],
      transfer: { prompt: 'Bilinen kenar sabit kalırken çevre 4 cm artsa bilinmeyen kenar kaç cm artar ve yeni uzunluğu ne olur?', answer: `Bilinmeyen kenar 2 cm artar ve ${w + 2} cm olur. Çevrede bu kenarın iki eşi sayıldığı için toplam 4 cm artış ikiye bölünür.` },
      prerequisite: 'Çevre, eş kenar çiftleri, bölme ve eksik toplananı çıkarma.',
    },
    error_diagnosis: {
      goal: { question: 'Çarpımla yazılmış hatalı çevre ifadesini sorgulayıp, dış sınırın doğru çevre uzunluğu isteniyor.', unit: 'cm', measurement: 'perimeter_length' },
      evidence: [widthEvidence, heightEvidence, edgePairs(), evidence('learner_claim', 'text', `Soruda bir öğrenci ${w} × ${h} = ${area} cm işlemini çevre diye yazmış. Bu iddia doğrulanmış bir ölçüm değildir.`, `${w} × ${h} = ${area} cm`, null, 'text')],
      plan: { route: 'Çarpımın hangi büyüklüğü ölçtüğünü belirle → kenarları toplamaya geç → doğru uzunluk birimiyle kontrol et.', why: 'Önce çarpımın yüzeyi ölçtüğünü anlamalıyız. Yanlış bir işlemi yalnız yeni sayıyla değiştirmek, alan–çevre karışıklığının nedenini açıklamaz.', conditions: ['Çarpım alanı, sınırdaki kenarların toplamı çevreyi verir.', 'Hatalı iddiadaki cm etiketi alan işlemini doğru bir çevre ölçümüne dönüştürmez.'] },
      steps: [step('area_check', 'İki kenarın çarpımı yüzeyin alanını verir. Sayı doğru bir çarpım sonucu olsa da alanı çevre diye adlandırmak ve cm yazmak yanlıştır.', 'multiply', ['side_width', 'side_height'], area, 'cm²', 'Çarpımın gerçek anlamı: yüzey alanı',
        'Bu çarpımın doğru birimi ve ölçtüğü büyüklük nedir?', `${area} cm² alanı anlatır. cm² bir yüzey birimidir; dış sınırın çevre uzunluğu değildir.`), ...perimeterSteps(w, h)],
      transfer: { prompt: 'Aynı dikdörtgen çizimi döndürülse hangi kenara uzunluk yazdığımız değişebilir. Çevre hesabı değişir mi? Alanla karıştırmadan açıkla.', answer: `Çevre yine ${perimeter} cm olur. Çizimi döndürmek kenar uzunluklarını ve dış sınırın dört kenar toplamını değiştirmez; alanla çarpma yapılmaz.` },
      prerequisite: 'Alan ile çevrenin farkı, uzunluk ve yüzey birimleri, bir işlemin sonucuna anlam verme.',
    },
    fence_gap: {
      goal: { question: 'Dış sınırın tamamı değil, açıklık hariç şerit takılacak kısmın uzunluğu isteniyor.', unit: 'cm', measurement: 'required_strip_length' },
      evidence: [widthEvidence, heightEvidence, edgePairs(), evidence('gap_width', 'given', 'Bir kenarda şerit takılmadan açık bırakılacak bölümün uzunluğu.', `${gate} cm açıklık`, gate, 'cm')],
      plan: { route: 'Önce bütün sınırı say → takılmayacak tek açıklığı çıkar → sınırdan kısa bir uzunluk elde edildiğini kontrol et.', why: 'Şerit dış sınır boyunca takılır fakat belirtilen bölüm açık bırakılır. Önce tam çevreyi hesaplamak, kapsam dışı parçayı açıkça çıkarmamızı sağlar.', conditions: ['Yalnız bir açıklık bırakılıyor; şerit için iki sıra istenmiyor.', 'Açıklık, üzerinde bulunduğu kenardan uzun değildir.'] },
      steps: [...perimeterSteps(w, h), step('required_strip', 'Tam çevre açık bırakılacak kısmı da içerir. Şerit takılmayan bu tek parçayı çıkarmak gerçekten kullanılacak şerit miktarını verir.', 'subtract', ['full_perimeter', 'gap_width'], perimeter - gate, 'cm', 'Açıklık dışında takılacak şerit uzunluğu',
        'Bulduğumuz sonuç neden tam çevreden daha küçüktür?', `${gate} cm bölüm boş bırakılır. ${perimeter - gate} cm şerit ile ${gate} cm açıklık birlikte ${perimeter} cm tam sınırı oluşturur.`)],
      transfer: (() => {
        const newGap = gate < w ? gate + 1 : Math.max(0, gate - 1);
        return { prompt: `Modelin kenarları aynı kalırken tek açıklık ${newGap} cm olacak biçimde değiştirilse gereken şerit kaç cm olur? Açıklığın değişimini gerekçelendir.`, answer: `Gereken şerit ${perimeter - newGap} cm olur. Tam sınır ${perimeter} cm değişmez; yalnız şerit takılmayan ${newGap} cm bölüm bu toplamdan çıkarılır.` };
      })(),
      prerequisite: 'Çevre, bir bütünün kapsam dışı bölümünü çıkarma ve açıklığın kenar uzunluğuyla ilişkisi.',
    },
  };
  return rows[family];
}

function gardenDraft(question) {
  const { shortSide: short, longSideRatio: { numerator, denominator }, gateWidth: gap, wireRows: rows } = question.problem;
  const share = short / denominator, long = share * numerator, pair = short + long, perimeter = pair * 2, oneRow = perimeter - gap;
  return {
    goal: { question: 'Kapı her sırada açık kalacak biçimde iki tel sırası için gereken toplam tel uzunluğu isteniyor; alan ya da tek tur değil.', unit: 'm', measurement: 'required_wire_length' },
    evidence: [
      evidence('short_side', 'given', 'Kısa kenarın soruda verilen uzunluğu.', `Kısa kenarı ${short} m`, short, 'm'),
      evidence('ratio_denominator', 'given', 'Kısa kenarı iki eş parça olarak düşünmemizi sağlayan kesrin paydası; tel sırası sayısı değildir.', 'kısa kenarın 3/2 katıdır', denominator, 'unitless'),
      evidence('ratio_numerator', 'given', 'Uzun kenar için aynı büyüklükteki parçalardan kaç tane alınacağını gösteren kesrin payı.', 'kısa kenarın 3/2 katıdır', numerator, 'unitless'),
      evidence('gap_width', 'given', 'Her tel sırasında açık bırakılan kapı genişliği.', `${gap} m genişliğindeki kapı`, gap, 'm'),
      evidence('wire_rows', 'given', 'Aynı gerekli tel yolunun kaç kez uygulanacağını gösterir; kesrin paydası değildir.', 'İki sıra tel', rows, 'unitless'), edgePairs(),
    ],
    plan: { route: 'Bir eş parçayı bul → uzun kenarı kur → tam çevreyi say → tek sırada kapıyı çıkar → iki sırayı birleştir.', why: 'Sorunun özel koşulu kapının her sırada açık kalmasıdır. Önce bir sırayı doğru modellemek, kapı boşluğunu toplamda eksik çıkarmamızı önler.', conditions: ['Dikdörtgenin karşılıklı kenarları eşittir.', 'Aynı kapı boşluğu her tel sırasında bırakılır.', 'Kesirdeki payda, kenar çifti sayısı ve tel sırası farklı rollerdir.'] },
    steps: [
      step('equal_part', 'Kısa kenar kesrin paydasının gösterdiği iki eş parçadan oluşur. Önce tek parçanın uzunluğunu bulmak için kısa kenarı ikiye böleriz.', 'divide', ['short_side', 'ratio_denominator'], share, 'm', 'Kısa kenarın bir eş parçasının uzunluğu', 'Bu işlemdeki iki neden tel sırasını saymıyor?', 'Kesrin paydası kısa kenarın eş parça sayısını anlatır; tel sırası toplam tel hesabında ayrıca kullanılır.'),
      step('long_side', 'Kesrin payı aynı büyüklükte üç parça istediği için bir eş parçayı üç kez alırız. Bulduğumuz uzunluk bahçenin eksik uzun kenarıdır.', 'multiply', ['equal_part', 'ratio_numerator'], long, 'm', 'Üç eş parçadan oluşan uzun kenar', 'Uzun kenarın kısa kenara göre oranını nasıl kontrol ederiz?', `${long} m, ${short} m uzunluğun 3/2 katıdır; aynı parçalardan üçü ile ikisini karşılaştırırız.`),
      step('edge_pair', 'Bir kısa ve bir uzun kenarı toplamak dış sınırın yalnız bir kenar çiftini verir. Bu çiftin karşı tarafta bir eşi daha vardır.', 'add', ['short_side', 'long_side'], pair, 'm', 'Bir kısa ve bir uzun kenarın toplamı', 'Bu toplam tek başına tam çevre midir?', 'Hayır. Dört kenarın yalnız ikisini saydık; karşılarındaki eş kenarlar henüz eklenmedi.'),
      step('full_perimeter', 'Birer kenardan oluşan çift iki kez bulunur. Bu nedenle ikiyle çarparak kapı dahil tam dış sınırın uzunluğunu elde ederiz.', 'multiply', ['edge_pair', 'edge_pairs'], perimeter, 'm', 'Kapı dahil bir tam turun çevresi', 'Buradaki iki, kaç tel sırası kullanılacağını mı anlatıyor?', 'Hayır. Dikdörtgenin iki eş kenar çiftini sayar; kapı ve tel sırası koşullarını sonraki işlemlerde kullanacağız.'),
      step('one_row', 'Tam çevre kapının bulunduğu açıklığı da içerir. Tek sıra tel için kapıya tel çekilmeyecek uzunluğu bir kez çıkarırız.', 'subtract', ['full_perimeter', 'gap_width'], oneRow, 'm', 'Kapı boşluğu bırakılmış tek sıra tel', 'Bu sonuç kaç sıra telin uzunluğunu anlatır?', 'Yalnız bir sırayı anlatır. Bu sırada kapı boşluğu çıkarılmıştır; ikinci sıra aynı yolu tekrar edecektir.'),
      step('total_wire', 'Soru iki sıra istediği için kapısı boş bırakılmış tek sıra uzunluğunu iki kez alırız. Bu kez iki, tel sırası sayısıdır.', 'multiply', ['one_row', 'wire_rows'], oneRow * rows, 'm', 'Her kapısı açık bırakılmış iki sıra toplam tel', 'Kapı boşluğunu toplamda neden iki kez hesaba kattık?', `Her sırada ${gap} m kapı açık kaldı. ${rows} sıranın her biri ${oneRow} m olduğu için toplam ${oneRow * rows} m tel gerekir; sonuç bir uzunluktur.`),
    ],
    transfer: { prompt: 'Diğer koşullar aynı kalırken kapı 5 m genişliğinde olsaydı iki sıra için gereken toplam tel nasıl değişirdi? Her sıradaki açıklığı ayrı düşün.', answer: `${rows * (perimeter - 5)} m tel gerekir. Tek sıradan 5 m kapı çıkarılır, sonra ${rows} sıra alınır; kapıyı yalnız bir kez çıkarmak doğru olmaz.` },
    prerequisite: 'Kesirde eş parçalar, uzunluk işlemleri, dikdörtgen çevresi ve her sırada geçerli bir kısıtı izleme.',
  };
}

/** Source-bound review sidecar, not a rewritten question, media or approval. */
export function createReasonedMathTrace(source) {
  const question = sourceSnapshot(source);
  if (!question.problem || typeof question.problem.template !== 'string') throw new Error('invalid_reasoned_math_source');
  if (!families.has(question.problem.template)) throw new Error('unsupported_reasoned_math_family');
  let review;
  try { review = validateQuestion(question); } catch { throw new Error('unverified_reasoned_math_source'); }
  if (review.localMathChecks !== 'passed' || review.errors.length !== 0) throw new Error('unverified_reasoned_math_source');
  const draft = question.problem.template === 'garden_two_rows' ? gardenDraft(question) : rectangleDraft(question);
  return createReasonedTeachingTrace({
    id: `reasoned-math-${question.contentSha256.slice(0, 32)}`, kind: 'question_solution',
    source: { id: question.id, contentSha256: question.contentSha256 }, goal: draft.goal,
    evidence: draft.evidence, plan: draft.plan, steps: draft.steps, transfer: draft.transfer,
    scope: { gradeBand: 'unassigned', prerequisite: draft.prerequisite },
  });
}
