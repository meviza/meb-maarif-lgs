import { createPerimeterLesson } from './perimeter_lesson.mjs';
import { createReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';

const evidence = (id, type, text, anchor, value, unit) => ({ id, type, text, anchor, value, unit });
const step = (id, why, kind, inputIds, value, unit, meaning, prompt, answer) => ({
  id, why, operation: { kind, inputIds }, result: { value, unit, meaning }, check: { prompt, answer },
});

/** Fixed original lesson derivative; no incoming learner/model/source payload. */
export function createReasonedPerimeterLessonTrace() {
  const source = createPerimeterLesson();
  const [first, second] = source.misconception.comparison.models;
  return createReasonedTeachingTrace({
    id: 'reasoned-perimeter-area-lesson-v1', kind: 'concept_lesson',
    source: { id: source.id, contentSha256: source.contentSha256 },
    goal: { question: 'Dış sınırın uzunluğu ile kaplanan yüzeyi ayırt et; bir görevin çevre mi alan mı istediğini gerekçesiyle açıkla.', unit: 'text', measurement: 'boundary_surface_discrimination' },
    evidence: [
      evidence('first-width', 'given', 'İlk modelin yatay kenarı 6 cm.', 'model:rectangle-6x4:width', first.width, 'cm'),
      evidence('first-height', 'given', 'İlk modelin düşey kenarı 4 cm.', 'model:rectangle-6x4:height', first.height, 'cm'),
      evidence('second-width', 'given', 'İkinci modelin yatay kenarı 8 cm.', 'model:rectangle-8x3:width', second.width, 'cm'),
      evidence('second-height', 'given', 'İkinci modelin düşey kenarı 3 cm.', 'model:rectangle-8x3:height', second.height, 'cm'),
      evidence('boundary-definition', 'definition', source.concept.perimeter, 'concept:perimeter', null, 'text'),
      evidence('surface-definition', 'definition', source.concept.area, 'concept:area', null, 'text'),
    ],
    plan: {
      route: 'Önce sınırı izle → sonra içini birim karelerle kapla → farklı şekil düzenlerini karşılaştır → hangi ölçümün istendiğini açıkla.',
      why: 'Aynı şekilden iki farklı büyüklük ölçülebilir. Neyi saydığımızı değiştirdiğimizde işlem ve birim de değişir; formülü yalnız şeklin adına bakarak seçmeyiz.',
      conditions: ['Sınır boyunca gidilen yol uzunluktur; birimi cm.', 'İç bölge boşluksuz birim karelerle kaplanır; alanın birimi cm².', 'Eşit alan tek başına eşit çevre anlamına gelmez.'],
    },
    steps: [
      step('boundary-first', 'Parmağınla turuncu sınırı dolaşırken dört kenarı birer kez izlersin. Bu yüzden dört kenarın uzunluklarını toplarız.', 'add', ['first-width', 'first-height', 'first-width', 'first-height'], first.perimeter.value, 'cm', 'İlk modelin dış sınırının toplam uzunluğu', 'Bu işlemde içerideki kareleri saydık mı?', 'Hayır. Kenarlar boyunca gittik; sonuç bir uzunluktur.'),
      step('area-first', 'Bu kez iç bölgeyi kaplayan birim kareleri düşün. Altışar kareden dört eş sıra, çarpmayla toplam yüzeyi verir.', 'multiply', ['first-width', 'first-height'], first.area.value, 'cm²', 'İlk modelin kapladığı yüzey', 'Neden cm² yazıyoruz?', '1 cm × 1 cm birim kareleri sayıyoruz; tek bir kenarın uzunluğunu ölçmüyoruz.'),
      step('area-second', 'Birim kareleri bu kez sekizerli üç sırada düzenledik. Farklı sıra düzeninin kapladığı yüzeyi yine iki kenarı çarparak buluruz.', 'multiply', ['second-width', 'second-height'], second.area.value, 'cm²', 'İkinci modelin kapladığı yüzey', 'Karelerin sayısı değişti mi?', 'Hayır; sekizerli üç sıra ile altışarlı dört sıra aynı sayıda birim kare içerir.'),
      step('boundary-second', 'Kare sayıları aynı olsa da sınırdaki kenar uzunlukları farklıdır. İkinci modelin dört kenarını yeniden birer kez saymalıyız.', 'add', ['second-width', 'second-height', 'second-width', 'second-height'], second.perimeter.value, 'cm', 'İkinci modelin dış sınırının toplam uzunluğu', 'Önceki modelin çevresini aynen kullanabilir miyiz?', 'Hayır. Alanın eşit olması dış kenarların toplamını belirlemez; bu modelin sınırını sayarız.'),
      step('counterexample', 'İki alanı ve iki çevreyi aynı ölçüm türünde karşılaştırırız. Bu iki örnek, eşit alanın her zaman eşit çevre getirdiği iddiasına karşı örnektir.', 'interpret', ['area-first', 'area-second', 'boundary-first', 'boundary-second'], 'Eşit alanlı bu iki modelin farklı çevreleri var: alanlar 24 cm², çevreler 20 cm ve 22 cm.', 'text', 'Çevre ve alan farklı büyüklüklerdir; görev neyi ölçtüğümüzü belirler.', 'Bu örneklerden her farklı alanın farklı çevre getireceğini de çıkarabilir miyiz?', 'Hayır. Bu karşı örnek yalnız eşit alanların zorunlu olarak eşit çevre getirmediğini gösterir; başka genellemeler için ayrı kanıt gerekir.'),
    ],
    transfer: { prompt: 'Kenarları 3 cm olan kare modelin dışına ip döşemek ve içini birim karelerle kaplamak iki ayrı görev. Her görev için neyi sayarsın ve hangi birimi yazarsın?', answer: 'İp için dört dış kenarı sayarız: 3 + 3 + 3 + 3 = 12 cm. İçini kaplamak için üçer kareden üç sırayı sayarız: 3 × 3 = 9 cm². Şekil aynı olsa da görev, işlem ve birim farklıdır.' },
    scope: { gradeBand: 'unassigned', prerequisite: 'Kenar uzunluğu, toplama, eş sıralarla çarpma ve birim kare; aktif program/sınıf eşlemesi uzman incelemesinde.' },
  });
}
