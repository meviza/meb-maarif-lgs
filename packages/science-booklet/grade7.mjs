// Original editorial drafts. Curriculum/style references are provenance, not MEB approval.
// The student delivery boundary removes answer, explanation and editorial metadata.
const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const text = (x, y, value, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;
const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="1.4" ${extra}/>`;
const arrow = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 5;
  return line(x1, y1, x2, y2) + `<path d="M${x2 - s * Math.cos(a - .5)} ${y2 - s * Math.sin(a - .5)} L${x2} ${y2} L${x2 - s * Math.cos(a + .5)} ${y2 - s * Math.sin(a + .5)}" fill="none" stroke="#333" stroke-width="1.4"/>`;
};
const box = (x, y, w, h, fill = 'white') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#333" stroke-width="1.3"/>`;
const circle = (x, y, r, fill = 'white') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#333" stroke-width="1.2"/>`;
const figure = (body, alt, height = 150) => ({ svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img"><g font-family="Arial, sans-serif" font-size="12" fill="#161616">${body}</g></svg>`, alt });
const table = (headers, rows, widths = [100, 100, 100]) => {
  const start = 30, top = 10, rh = 27, total = widths.reduce((a, b) => a + b, 0);
  let s = box(start, top, total, rh * (rows.length + 1));
  [headers, ...rows].forEach((row, r) => {
    if (r) s += line(start, top + r * rh, start + total, top + r * rh);
    let x = start;
    row.forEach((v, c) => { s += text(x + widths[c] / 2, top + r * rh + 18, v); x += widths[c]; });
  });
  let x = start; for (const w of widths.slice(0, -1)) { x += w; s += line(x, top, x, top + rh * (rows.length + 1)); }
  return s;
};
const ex = (given, wanted, strategy, steps, check, tip) => ({ given, wanted, strategy, steps, check, tip });
const q = (n, branch, topic, outcomeCode, page, stimulus, stem, options, answer, fig, explanation, difficulty = 'medium', bloom = 'apply', layout = 'regular') => ({
  id: `YF7-${String(n).padStart(2, '0')}`, grade: 7, branch, topic, outcomeCode,
  source: { programId: 'tymm-current-fen-bilimleri', physicalPage: page, styleReference: 'lgs-2024-numerical:p19' },
  difficulty, bloom, stimulus, stem, options, answer, figure: fig, explanation, layout,
});

export const grade7Questions = [
  q(1, 'physics', 'Uzay gözlemi', 'FB.7.1.1', 147,
    'Bir okul, aynı özellikteki teleskoplarla yıl boyunca gökyüzü gözlemi yapacaktır. Dört yerin bazı özellikleri tabloda verilmiştir. Diğer koşullar aynıdır.',
    'Işık kirliliğinin az, açık gece sayısının fazla olması istendiğine göre hangi yer seçilmelidir?',
    ['K', 'L', 'M', 'N'], 0,
    figure(table(['Yer', 'Işık kirliliği', 'Açık gece / yıl'], [['K', 'Az', '220'], ['L', 'Fazla', '220'], ['M', 'Az', '90'], ['N', 'Fazla', '90']]), 'K ve M az, L ve N fazla ışık kirliliğine sahiptir. K ile L yılda 220, M ile N 90 açık geceye sahiptir.', 155),
    ex('İki koşul birlikte aranıyor: Az ışık kirliliği ve çok açık gece.', 'İki koşulu da sağlayan yeri bulmak.', 'Önce ışık kirliliğini, sonra açık gece sayısını karşılaştır.', ['L ve N, fazla ışık kirliliği nedeniyle elenir.', 'K ve M arasında K, daha fazla açık gece sunar.'], 'K iki koşulu da sağlar; diğer yerler en az birini sağlamaz.', 'Tek bir özelliğe bakma; seçimde istenen bütün koşulları birlikte kontrol et.'), 'easy', 'analyze'),

  q(2, 'physics', 'Fiziksel anlamda iş', 'FB.7.2.1', 152,
    'Bir öğrenci I. durumda çantayı yerden yüksekte hareketsiz tutuyor, II. durumda yukarı kaldırıyor, III. durumda aynı yükseklikte yatay taşıyor. Oklar yalnız öğrencinin çantaya uyguladığı yukarı yönlü kuvveti ve çantanın yer değiştirmesini gösteriyor.',
    'Öğrencinin gösterilen kuvveti hangi durumda fiziksel anlamda iş yapar?',
    ['I ve III', 'Yalnız II', 'II ve III', 'I, II ve III'], 1,
    figure([55, 170, 285].map((x, i) => box(x - 15, 66, 30, 23) + arrow(x, 63, x, 28) + text(x + 9, 29, 'F', 'start') + text(x, 116, ['I: Sabit', 'II: Yukarı', 'III: Yatay'][i])).join('') + arrow(199, 90, 199, 57) + arrow(266, 96, 317, 96), 'Üç çantada kuvvet yukarı doğrudur. I hareketsiz, II yukarı, III yatay yer değiştirir.'),
    ex('Kuvvet üç durumda da yukarı yönlü; yer değiştirmeler farklı.', 'Bu kuvvetin iş yaptığı durumu belirlemek.', 'Kuvvet doğrultusunda yer değiştirme olup olmadığına bak.', ['I’de yer değiştirme yoktur.', 'II’de kuvvet ve yer değiştirme aynı doğrultudadır.', 'III’te kuvvet dikey, yer değiştirme yataydır.'], 'Yalnız II, kuvvet doğrultusunda yer değiştirme koşulunu sağlar.', 'Yorulmak tek başına fiziksel anlamda iş yapıldığını göstermez.'), 'medium', 'analyze', 'extended'),

  q(3, 'physics', 'Enerji dönüşümü', 'FB.7.2.3', 152,
    'Bir salıncağın oturağı A konumundan serbest bırakılıyor. Hava direnci ve sürtünme ihmal ediliyor. B, salıncağın en alçak konumudur.',
    'Oturağın A’dan B’ye hareketi sırasında enerjisi nasıl değişir?',
    ['Kinetik enerjisi azalır, çekim potansiyel enerjisi artar.', 'İki enerji türü de azalır.', 'Çekim potansiyel enerjisi azalır, kinetik enerjisi artar.', 'İki enerji türü de değişmez.'], 2,
    figure(circle(180, 18, 3, '#333') + line(180, 18, 105, 74) + line(180, 18, 180, 112, 'stroke-dasharray="4 3"') + box(90, 74, 30, 5) + box(165, 112, 30, 5) + `<path d="M105 78 Q119 109 171 116" fill="none" stroke="#777" stroke-dasharray="4 3"/>` + text(90, 66, 'A') + text(200, 121, 'B') + line(65, 140, 285, 140), 'A konumundaki oturak B konumundan yüksektedir. B, asılma noktasının tam altındadır.'),
    ex('Salıncak alçalıyor; sürtünme ihmal ediliyor.', 'Potansiyel ve kinetik enerjideki değişimi bulmak.', 'Yüksekliği potansiyel, hareketi kinetik enerjiyle ilişkilendir.', ['A’dan B’ye yükseklik azalır, çekim potansiyel enerjisi azalır.', 'Salıncak hızlanır; kinetik enerjisi artar.'], 'Azalan potansiyel enerji kinetik enerjiye dönüşür; enerji yok olmaz.', 'Önce yükseklik ve süratin değişimini düşün; formül kullanman gerekmiyor.')),

  q(4, 'physics', 'Işığın kırılması', 'FB.7.4.1', 165,
    'Havadan suya eğik olarak gönderilen ışının izleyebileceği yollar kesikli çizgilerle gösterilmiştir. Su, havadan optikçe daha yoğundur. Yüzeye dik çizgi normaldir.',
    'Suyun içine geçen ışın hangi yolu izler?',
    ['I', 'III', 'IV', 'II'], 3,
    figure(line(25, 70, 335, 70) + line(180, 8, 180, 144, 'stroke-dasharray="4 3"') + text(31, 40, 'Hava', 'start') + text(31, 98, 'Su', 'start') + text(192, 15, 'Normal', 'start') + arrow(120, 15, 180, 70) + line(180, 70, 240, 125, 'stroke-dasharray="3 3"') + line(180, 70, 207, 130, 'stroke-dasharray="3 3"') + line(180, 70, 284, 125, 'stroke-dasharray="3 3"') + line(180, 70, 240, 15, 'stroke-dasharray="3 3"') + text(244, 142, 'I') + text(205, 146, 'II') + text(288, 142, 'III') + text(252, 21, 'IV'), 'Gelen ışın üst soldan yüzeye gelir. I doğrultuyu sürdürür, II normalle daha küçük açı yapar, III normalle daha büyük açı yapar, IV havada kalır.'),
    ex('Işın havadan optikçe daha yoğun suya geçiyor.', 'Kırılan ışının yönünü seçmek.', 'Açıları yüzeye değil normale göre karşılaştır.', ['Optikçe daha yoğun ortama geçen ışın normale yaklaşır.', 'II yolu, su tarafında normale daha yakındır.'], 'I yön değiştirmez; III normalden uzaklaşır; IV suya geçmez.', '“Normale yaklaşır” ifadesi, normalle yaptığı açının küçülmesi demektir.'), 'medium', 'apply'),

  q(5, 'physics', 'Elektrik yükleri', 'FB.7.6.3', 177,
    'X ve Y cisimlerinin yük durumları, eşit büyüklükteki birim yüklerle modellenmiştir. Modelde bütün birim yükler gösterilmiştir.',
    'Buna göre X ve Y için hangisi doğrudur?',
    ['İkisi de nötrdür.', 'İkisi de pozitif yüklüdür.', 'X pozitif, Y negatif yüklüdür.', 'X negatif, Y pozitif yüklüdür.'], 2,
    figure(`<g data-object="X">${box(35, 28, 120, 75)}${['+', '+', '+', '+', '−', '−'].map((v, i) => text(60 + i % 3 * 33, 58 + Math.floor(i / 3) * 26, v)).join('')}</g><g data-object="Y">${box(205, 28, 120, 75)}${['+', '+', '−', '−', '−', '−'].map((v, i) => text(230 + i % 3 * 33, 58 + Math.floor(i / 3) * 26, v)).join('')}</g>${text(95, 124, 'X')}${text(265, 124, 'Y')}`, 'X’te dört pozitif ve iki negatif; Y’de iki pozitif ve dört negatif birim yük vardır.'),
    ex('X’te pozitif yükler, Y’de negatif yükler fazladır.', 'Cisimlerin net yük işaretlerini bulmak.', 'Pozitif ve negatif yükleri kendi cisminin içinde karşılaştır.', ['X’te 4 pozitif ve 2 negatif birim yük vardır; pozitif fazladır.', 'Y’de 2 pozitif ve 4 negatif birim yük vardır; negatif fazladır.'], 'Nötr olmak için pozitif ve negatif yük miktarları eşit olmalıydı.', 'Her iki tür yükü içermek nötr olmak için yeterli değildir.'), 'easy', 'apply'),

  q(6, 'physics', 'Uzay kirliliği', 'FB.7.1.3', 147,
    'Dünya çevresindeki bir yörüngede çalışan uydular ile görevini tamamlamış araçlar birlikte bulunmaktadır. Görevi biten araç ve parçalarının çalışan uydulara çarpma riski vardır.',
    'Bu riski azaltmaya yönelik en uygun öneri hangisidir?',
    ['Daha fazla kullanılmayan araç bırakmak', 'Görevi biten araçları güvenli biçimde yörüngeden çıkarmak', 'Çalışan uyduların haberleşmesini durdurmak', 'Yeryüzündeki bütün teleskopları kaldırmak'], 1,
    figure(circle(165, 74, 28, '#eef0f2') + text(165, 79, 'Dünya') + `<ellipse cx="165" cy="74" rx="119" ry="55" fill="none" stroke="#888" stroke-dasharray="4 3"/>` + box(260, 41, 13, 10, '#ddd') + box(250, 43, 10, 6) + box(273, 43, 10, 6) + text(292, 33, 'Uydu') + circle(58, 96, 3, '#555') + circle(77, 112, 3, '#555') + circle(238, 117, 3, '#555') + circle(253, 107, 3, '#555') + text(301, 138, 'Parçalar') + line(280, 132, 256, 110), 'Dünya çevresindeki aynı yörüngede bir çalışan uydu ve dört kullanılmayan parça gösterilmiştir.'),
    ex('Riskin kaynağı yörüngedeki kullanılmayan araç ve parçalarıdır.', 'Riski kaynağında azaltacak çözümü bulmak.', 'Önerinin tehlikeli nesne sayısına etkisini düşün.', ['Yeni atık bırakmak riski artırır.', 'Kontrollü ve güvenli uzaklaştırma, çarpışabilecek kullanılmayan nesneleri azaltır.'], 'Haberleşmeyi veya teleskopları kapatmak yörüngedeki parçaları ortadan kaldırmaz.', 'Bir çözümün, sorunun asıl nedenini değiştirip değiştirmediğine bak.'), 'easy', 'apply'),

  q(7, 'chemistry', 'Atomun yapısı', 'FB.7.5.1', 169,
    'Bir atomun basitleştirilmiş modeli verilmiştir. Çekirdekte üç pozitif yüklü ve dört yüksüz parçacık, çekirdek çevresinde üç negatif yüklü parçacık bulunmaktadır.',
    'Bu atomun hangi elemente ait olduğunu belirleyen parçacık hangisidir?',
    ['Elektron', 'Nötron', 'Proton ve nötron birlikte', 'Proton'], 3,
    figure(circle(180, 77, 53) + circle(180, 77, 34) + circle(180, 77, 23, '#f2f2f2') + [[146,77], [214,77], [180,24]].map(([x,y]) => circle(x, y, 7) + text(x, y + 4, '−')).join('') + text(180, 73, '+ + +') + text(180, 88, '0 0 0 0') + text(82, 35, 'Çekirdek') + line(108, 40, 160, 61) + text(283, 125, 'Elektron') + line(261, 117, 219, 82), 'Çekirdekte üç artı işaretli ve dört sıfır işaretli parçacık; ilk katmanda iki, ikinci katmanda bir elektron vardır.'),
    ex('Modelde proton, nötron ve elektronlar gösteriliyor.', 'Elementin kimliğini belirleyen parçacığı bulmak.', 'Yük durumu ile elementin kimliğini ayır.', ['Elementin kimliğini çekirdeğindeki proton sayısı belirler.', 'Elektron sayısı yük durumuyla ilişkilidir; nötron sayısı elementin kimliğini belirlemez.'], 'Üç proton bilgisi atomun element kimliğini belirlemeye yeterlidir.', 'Kimlik sorusunda proton sayısına odaklan.'), 'easy', 'understand'),

  q(8, 'chemistry', 'Element ve bileşik', 'FB.7.5.4', 169,
    'X ve Y saf maddelerinin molekül modelleri gösterilmiştir. Aynı görünümdeki küreler aynı, farklı görünümdeki küreler farklı atom türlerini temsil etmektedir.',
    'Bu maddeler nasıl sınıflandırılır?',
    ['İkisi de elementtir.', 'X element, Y bileşiktir.', 'X bileşik, Y elementtir.', 'İkisi de karışımdır.'], 1,
    figure(box(28, 25, 135, 85) + box(197, 25, 135, 85) + [[62, 49], [115, 85]].map(([x,y]) => circle(x, y, 9) + circle(x + 17, y, 9)).join('') + [[230, 49], [280, 85]].map(([x,y]) => circle(x, y, 9) + circle(x + 17, y, 9, '#777')).join('') + text(95, 132, 'X') + text(265, 132, 'Y'), 'X’te her molekül iki aynı atomdan, Y’de her molekül iki farklı atomdan oluşur. Her kapta tek tür molekül vardır.'),
    ex('Her örnek saf; X’te tek, Y’de iki atom türü var.', 'Element ve bileşiği ayırmak.', 'Molekül sayısını değil atom türünü incele.', ['X’in bütün atomları aynı türdedir; X elementtir.', 'Y’nin aynı moleküllerinde farklı atom türleri birleşmiştir; Y bileşiktir.'], 'Molekül yapılı olmak tek başına bileşik olmak anlamına gelmez.', 'Saf madde + tek atom türü: Element. Saf madde + bağlı farklı atom türleri: Bileşik.')),

  q(9, 'chemistry', 'Element sembolleri', 'FB.7.5.5', 169,
    'Bir öğrenci element adlarının bulunduğu kartların altına uluslararası sembollerini yazacaktır.',
    'K, L ve M kartlarına sırasıyla hangileri yazılmalıdır?',
    ['N – C – M', 'NA – CL – MG', 'Na – Cl – Mg', 'Ne – Ca – Mn'], 2,
    figure(table(['Kart', 'K', 'L', 'M'], [['Element', 'Sodyum', 'Klor', 'Magnezyum']], [60, 80, 80, 80]), 'K kartında Sodyum, L kartında Klor, M kartında Magnezyum yazmaktadır.', 78),
    ex('Kartlarda sodyum, klor ve magnezyum adları var.', 'Adları doğru uluslararası sembollerle eşlemek.', 'Sembollerde ilk harfin büyük, ikinci harfin küçük yazıldığını hatırla.', ['Sodyumun sembolü Na, klorun Cl, magnezyumun Mg’dir.', 'İkinci harfleri büyük yazan seçenek doğru gösterim değildir.'], 'Üç sembol de hem elementi hem yazım kuralını karşılar.', 'Element sembolü günlük dildeki adının ilk harfi olmak zorunda değildir.'), 'easy', 'understand'),

  q(10, 'chemistry', 'Çözünme hızında deney tasarımı', 'FB.7.5.9', 169,
    'Bir öğrenci sıcaklığın şekerin çözünme hızına etkisini incelemek istiyor. Kaplarda eşit hacimde su ve eşit kütlede aynı tür şeker var. İki kap da karıştırılmıyor.',
    'Yalnız sıcaklığın etkisini incelemek için hangi değişiklik yapılmalıdır?',
    ['İkisinde de toz şeker kullanmak', 'Birinci kaptaki suyu azaltmak', 'İkinci kaba daha fazla şeker eklemek', 'Yalnız ikinci kabı karıştırmak'], 0,
    figure(`<path d="M55 33 V109 H140 V33 M215 33 V109 H300 V33" fill="none" stroke="#333" stroke-width="1.5"/>${line(56, 65, 139, 65)}${line(216, 65, 299, 65)}${box(82, 83, 18, 18, '#ddd')}${[227,240,254,268,280].map(x => circle(x, 101, 2, '#555')).join('')}${text(97, 22, '20 °C')}${text(257, 22, '40 °C')}${text(97, 135, 'Küp şeker')}${text(257, 135, 'Toz şeker')}`, 'Birinci kap 20 derece ve küp şekerli, ikinci kap 40 derece ve toz şekerlidir. Su ve şeker miktarları eşittir.'),
    ex('Sıcaklık yanında şekerin temas yüzeyi de farklı.', 'Deneyde yalnız sıcaklığı değiştirmek.', 'Araştırılan değişken dışındaki farkı kaldır.', ['Küp ve toz şekerin temas yüzeyleri farklıdır.', 'İkisinde de toz şeker kullanılırsa bu fark giderilir; sıcaklık farkı kalır.'], 'Diğer seçenekler su miktarı, şeker miktarı veya karıştırma gibi yeni farklar oluşturur.', 'Adil karşılaştırmada bir değişken değişir, ilgili diğer koşullar aynı tutulur.'), 'hard', 'analyze'),

  q(11, 'chemistry', 'Karışımları ayırma', 'FB.7.5.10', 169,
    'Bir öğretmen tuzlu sudan hem tuzu hem de sıvı suyu ayrı kaplarda elde etmek istiyor. Tuzun bu koşullarda buharlaşmadığı biliniyor. Kurduğu düzeneğin basitleştirilmiş çizimi verilmiştir.',
    'Bu amaç için kullanılan ayırma yöntemi hangisidir?',
    ['Süzme', 'Eleme', 'Yalnız buharlaştırma', 'Damıtma'], 3,
    figure(`<path d="M70 33 V54 C32 76 42 117 80 117 C118 117 128 76 90 54 V33" fill="none" stroke="#333" stroke-width="1.6"/>${box(65,26,30,7,'#ddd')}<path d="M81 49 V20 H137 L255 79 V91" fill="none" stroke="#333" stroke-width="1.6"/>${line(137, 36, 239, 77)}${line(140, 22, 246, 65)}${line(147, 16, 143, 28)}${line(234, 70, 230, 83)}${text(193, 15, 'Soğutulan boru')}${line(54, 96, 106, 96)}${text(79, 140, 'Isıtıcı')}${box(56, 124, 47, 5, '#ddd')}<path d="M229 88 V123 H286 V88" fill="none" stroke="#333"/>${line(230, 108, 285, 108)}${text(309, 142, 'Toplama kabı')}${text(38, 60, 'Tuzlu su')}`, 'Isıtılan tuzlu su balonunun tıpasından geçen boru, soğutulan bölüm üzerinden ayrı toplama kabına uzanır.'),
    ex('Amaç yalnız tuzu değil suyu da ayrı elde etmektir.', 'Buharı yeniden sıvı olarak toplayan yöntemi seçmek.', 'Düzeneğin ısıtma ve soğutma basamaklarını birlikte düşün.', ['Su buharlaşır; tuz ilk kapta kalır.', 'Su buharı soğutulan boruda yoğuşur ve diğer kapta birikir.'], 'Yalnız buharlaştırmada suyu ayrı bir kapta toplama basamağı yoktur.', 'Buharlaştırıp yeniden sıvı toplamak damıtmadır; bu deney öğretmen gözetiminde yapılır.')),

  q(12, 'chemistry', 'Karışımların sınıflandırılması', 'FB.7.5.8', 169,
    'K kabındaki tuz suda tamamen çözünmüştür. L kabındaki zeytinyağı ve su, bir süre beklendikten sonra iki ayrı tabaka oluşturmuştur.',
    'K ve L karışımlarının sınıflandırılması hangisinde doğrudur?',
    ['İkisi de homojendir.', 'K heterojen, L homojendir.', 'İkisi de saf maddedir.', 'K homojen, L heterojendir.'], 3,
    figure(`<path d="M45 25 V115 H140 V25 M220 25 V115 H315 V25" fill="none" stroke="#333" stroke-width="1.5"/>${box(46, 58, 93, 56, '#edf0f2')}${box(221, 83, 93, 31, '#edf0f2')}${box(221, 58, 93, 25, '#dedede')}${text(92, 93, 'Tuzlu su')}${text(267, 76, 'Zeytinyağı')}${text(267, 104, 'Su')}${text(92, 136, 'K')}${text(267, 136, 'L')}`, 'K tek görünümlü tuzlu sudur. L’de üstte zeytinyağı, altta su bulunur.'),
    ex('K her yerinde aynı görünür; L iki ayrı tabakalıdır.', 'Karışımları homojen veya heterojen olarak ayırmak.', 'Görünümün bütün karışım boyunca aynı olup olmadığına bak.', ['Tamamen çözünmüş tuzlu su homojendir.', 'Birbirinden ayrı yağ ve su tabakaları heterojen karışım oluşturur.'], 'Tek görünüm saf madde demek değildir; K hâlâ iki maddeden oluşan karışımdır.', '“Homojen” ile “saf” aynı anlama gelmez.'), 'easy', 'understand'),

  q(13, 'biology', 'Sindirim ve emilim', 'FB.7.3.1', 156,
    'Sindirim kanalının bir bölümü şemada gösterilmiştir. Sindirilen besinlerin büyük bölümünün kana geçtiği organ X ile belirtilmiştir.',
    'X hangi organdır?',
    ['Kalın bağırsak', 'Mide', 'İnce bağırsak', 'Yemek borusu'], 2,
    figure(box(18, 55, 67, 37) + text(51, 79, 'Mide') + arrow(85, 74, 116, 74) + box(118, 55, 81, 37) + text(158, 79, 'X') + arrow(200, 74, 231, 74) + box(233, 55, 110, 37) + text(288, 79, 'Kalın bağırsak') + arrow(158, 94, 158, 122) + text(158, 142, 'Besinlerin kana geçişi'), 'Mideden sonra X, sonra kalın bağırsak gelir. X’ten besinlerin kana geçişini gösteren bir ok vardır.'),
    ex('X mideden sonra gelir ve emilimin büyük bölümünü gerçekleştirir.', 'Görev ve konumdan organı belirlemek.', 'İki ipucunu birlikte kullan.', ['Mideden sonra ince bağırsak gelir.', 'Sindirilen besinlerin büyük bölümü ince bağırsakta kana geçer.'], 'Kalın bağırsak başlıca su ve minerallerin emiliminde görev alır; verilen konum da X değildir.', 'Organ sorularında yalnız adına değil, yaptığı iş ve sıradaki yerine de bak.'), 'easy', 'apply'),

  q(14, 'biology', 'Küçük kan dolaşımı', 'FB.7.3.3', 156,
    'Bir öğrenci, kanın oksijen bakımından zenginleşerek kalbe geri döndüğü dolaşım yolunu modelleyecektir. Kullanacağı organlar şekilde verilmiştir.',
    'Modelde hangi yol gösterilmelidir?',
    ['Kalp → Akciğer → Kalp', 'Kalp → Vücut → Kalp', 'Akciğer → Vücut → Akciğer', 'Vücut → Kalp → Vücut'], 0,
    figure(`<path d="M43 41 Q19 7 10 45 Q6 66 42 94 Q76 68 73 46 Q68 12 43 41Z" fill="#eee" stroke="#333" transform="translate(11 20)"/>${text(54, 136, 'Kalp')}<path d="M179 45 V77 M179 72 L165 88 M179 72 L193 88 M166 56 Q139 62 144 109 Q167 121 173 93 M192 56 Q219 62 214 109 Q191 121 185 93" fill="none" stroke="#333" stroke-width="2"/>${text(179, 136, 'Akciğer')}${circle(301, 49, 14)}${box(282, 66, 38, 48, '#eee')}${text(301, 136, 'Vücut')}`, 'Model için kalp, akciğer ve vücut simgeleri verilmiştir; aralarında henüz yol çizilmemiştir.'),
    ex('Kanın oksijen bakımından zenginleşmesi isteniyor.', 'Küçük kan dolaşımı yolunu bulmak.', 'Oksijen alışverişinin gerçekleştiği organı belirle.', ['Kalpten çıkan kan akciğere gider.', 'Akciğerde oksijen bakımından zenginleşen kan kalbe döner.'], 'Vücuda giden büyük dolaşımda dokular oksijen kullandığı için kanın oksijen oranı azalır.', 'Akciğerden geçip kalbe dönen yol küçük dolaşımdır.')),

  q(15, 'biology', 'Akciğerlerde gaz alışverişi', 'FB.7.3.6', 156,
    'Akciğerlerde hava ile kan arasında gaz alışverişi olur. Şemada oksijenin geçiş yönü gösterilmiş, karbondioksitin yönü boş bırakılmıştır.',
    'Karbondioksitin geçiş yönü nasıl gösterilmelidir?',
    ['Havadan kana', 'Kandan havaya', 'Yalnız kanın kendi içinde', 'Geçiş olmaz'], 1,
    figure(box(25, 36, 102, 76, '#f5f5f5') + box(231, 36, 103, 76, '#eee') + text(76, 70, 'Akciğerdeki') + text(76, 88, 'hava') + text(282, 80, 'Kan') + arrow(137, 54, 220, 54) + text(179, 42, 'Oksijen') + line(138, 96, 219, 96, 'stroke-dasharray="4 3"') + text(179, 124, 'Karbondioksit: ?'), 'Oksijen oku akciğerdeki havadan kana doğrudur. Karbondioksit için iki ortam arasındaki yön boş bırakılmıştır.'),
    ex('Oksijen havadan kana geçiyor; diğer gazın yönü soruluyor.', 'Karbondioksitin vücuttan uzaklaşma yönünü bulmak.', 'Akciğerlerin kana oksijen alıp kandaki karbondioksiti uzaklaştırdığını düşün.', ['Vücutta oluşan karbondioksit kanla akciğerlere taşınır.', 'Karbondioksit kandan akciğer havasına geçer ve soluk verme ile dışarı atılır.'], 'İki gaz bu şemada zıt yönlerde geçiş yapar.', 'Akciğerin iki işi birlikte düşünülür: Oksijen almak ve karbondioksit vermek.'), 'easy', 'apply'),

  q(16, 'biology', 'Boşaltım sistemi', 'FB.7.3.8', 157,
    'İdrarın oluştuğu ve vücut dışına atılıncaya kadar izlediği yolun bir bölümü modellenmiştir. K idrarın oluştuğu, L bir süre depolandığı yapıdır.',
    'K ve L hangi organlardır?',
    ['K mesane, L böbrektir.', 'K karaciğer, L midedir.', 'K böbrek, L mesanedir.', 'K akciğer, L kalptir.'], 2,
    figure(`<path d="M99 34 C57 8 56 92 100 87 C109 80 103 69 92 67 C81 66 81 48 92 47 C104 48 110 41 99 34Z" fill="#eee" stroke="#333"/><path d="M247 34 C289 8 290 92 246 87 C237 80 243 69 254 67 C265 66 265 48 254 47 C242 48 236 41 247 34Z" fill="#eee" stroke="#333"/><path d="M91 65 L151 113 M253 65 L193 113" fill="none" stroke="#333" stroke-width="2"/><ellipse cx="172" cy="121" rx="26" ry="17" fill="#eee" stroke="#333"/>${text(45, 56, 'K')}${line(54, 52, 67, 53)}${text(218, 126, 'L')}${line(203, 122, 196, 122)}${line(172, 138, 172, 149)}`, 'İki böbrek biçimli K yapısı, idrar borularıyla alt ortadaki kese biçimli L yapısına bağlanmıştır.'),
    ex('K idrar oluşturur, L idrarı bir süre depolar.', 'Görevleri organlarla eşlemek.', 'Oluşturma ve depolama görevlerini birbirinden ayır.', ['Böbrekler kanı süzerek idrar oluşumunda görev alır.', 'İdrar, idrar borularından mesaneye gelir ve burada depolanır.'], 'Mesane idrar üretmez; böbrek ile mesanenin görevleri farklıdır.', 'Yol: Böbrek → İdrar borusu → Mesane → İdrar kanalı.')),

  q(17, 'biology', 'Besin zincirinde biyolojik birikim', 'FB.7.7.1', 181,
    'Doğada kolay parçalanmayan bir madde otlara bulaşmıştır. Bu madde canlıların vücudunda birikmekte ve beslenme yoluyla aktarılmaktadır. Oklar besinden, beslenen canlıya doğrudur.',
    'Besin zincirinde bu maddenin vücut dokularındaki yoğunluğunun en fazla olması beklenen canlı hangisidir?',
    ['Ot', 'Çekirge', 'Kurbağa', 'Şahin'], 3,
    figure(['Ot', 'Çekirge', 'Kurbağa', 'Şahin'].map((v, i) => box(8 + i * 89, 51, 70, 36) + text(43 + i * 89, 74, v)).join('') + [0, 1, 2].map(i => arrow(80 + i * 89, 69, 95 + i * 89, 69)).join('') + text(180, 114, 'Beslenme yönü'), 'Ot → Çekirge → Kurbağa → Şahin zinciri verilmiştir.'),
    ex('Madde kolay parçalanmıyor; dokularda birikip beslenmeyle aktarılıyor.', 'Zincirin hangi basamağında yoğunlaşmanın en yüksek olacağını bulmak.', 'Üst basamaktaki canlının birçok avdan madde almasını düşün.', ['Çekirge otlardan, kurbağa çekirgelerden madde alır.', 'Şahin daha üst basamakta olduğundan madde onda daha yoğun birikebilir.'], 'Soru toplam maddeyi değil dokulardaki yoğunluğu soruyor; en üst basamak şahindir.', 'Biyolojik birikim ile enerji aktarımını karıştırma: Enerji yukarı doğru azalırken bu tür maddelerin yoğunluğu artabilir.'), 'hard', 'analyze'),

  q(18, 'biology', 'Su tasarrufunu kanıtla değerlendirme', 'FB.7.7.2', 181,
    'İki okulda su tasarrufu uygulaması deneniyor. Tablodaki tüketimler birer okul gününe aittir. Öğrenci başına kullanım karşılaştırılarak sonuç çıkarılacaktır.',
    'Verilere göre hangi sonuç doğrudur?',
    ['K uygulamasında öğrenci başına günlük kullanım azalmıştır.', 'L uygulamasında öğrenci başına günlük kullanım azalmıştır.', 'İki okulda da öğrenci başına kullanım aynı oranda azalmıştır.', 'K’de öğrenci başına kullanım artmıştır.'], 0,
    figure(table(['Okul / Dönem', 'Öğrenci', 'Su (L/gün)'], [['K / Önce', '100', '600'], ['K / Sonra', '100', '360'], ['L / Önce', '100', '600'], ['L / Sonra', '60', '360']], [120, 80, 100]), 'K okulunda öğrenci sayısı 100 kalırken tüketim 600’den 360 litreye iner. L’de öğrenci sayısı 100’den 60’a, tüketim 600’den 360 litreye iner.', 155),
    ex('Toplam su tüketimleri aynı düşüyor fakat öğrenci sayıları farklı değişiyor.', 'Öğrenci başına gerçek tasarruf olup olmadığını bulmak.', 'Günlük toplam suyu o günkü öğrenci sayısına böl.', ['K: Önce 600 ÷ 100 = 6 L, sonra 360 ÷ 100 = 3,6 L.', 'L: Önce 600 ÷ 100 = 6 L, sonra 360 ÷ 60 = 6 L.'], 'K’de 6’dan 3,6’ya düşüş var; L’de 6 olarak kalıyor.', 'Toplamın azalması tek başına verimli kullanım kanıtı değildir; kullanıcı sayısını da kontrol et.'), 'hard', 'analyze', 'extended'),
];
