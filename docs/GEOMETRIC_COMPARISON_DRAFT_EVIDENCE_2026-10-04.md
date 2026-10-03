# Geometrik Karşılaştırma Taslağı: Sınırlı Teknik Kanıt

Gözlem tarihi: 2026-10-04. Bu dilim yalnız yeni saf editör taslağı modülü, onun testi ve bu kanıt belgesidir. Paylaşılan fabrika, CLI, şema, mevcut kaynak matrisi veya medya modülleri değiştirilmedi. Öğrenci verisi, sağlayıcı, ağ, Drive, Docker, indirme, ortam değişkeni, geniş proses incelemesi veya Git işlemi kullanılmadı. Ana ajanın sonraki entegrasyonu bu dilimin tamamlanma iddiası değildir.

## API ve Güven Sınırı

```js
const draft = createGeometricComparisonDraft({
  id: 'comparison-area-12',
  direction: 'same_area_different_perimeter',
  target: 12,
});
// İkinci yön: direction: 'same_perimeter_different_area', target: 16.
```

Modül yalnız `id`, `direction`, `target` adlı üç kendi veri alanını kabul eder. Girdi normal veya null-prototipli nesne olmalı; anahtarların sırası sonucu değiştirmez. ID, en fazla 80 karakterlik ASCII harf/rakam/alt çizgi/kısa çizgidir. Yön yukarıdaki iki tam değerle sınırlıdır; hedef güvenli tam sayıdır. Kaynak, model, görsel, metin, birim, provider veya onay alanı verilmez. Proxy/revoked proxy, getter, gizli ek alan, sembol, yabancı prototip, döngü ve değer dönüştürme kancaları reddedilir; kullanıcı kancası çalıştırılmaz.

- Aynı alan yönü: hedef 1-36 birimkare aralığında.
- Aynı çevre yönü: hedef 4-74 aralığında çift tam sayı. 74, pozitif tam sayı kenarlı ve alanı en fazla 36 olan bir modelin matematiksel üst sınırından gelir; kaynakta ayrıca yazılmış resmî çevre sınırı değildir.
- Her iki yönde modeller pozitif tam sayı kenarlıdır; **her modelin alanı en fazla 36** olur. Kenarlar `width <= height` sırasıyla tutulur; döndürülmüş aynı dikdörtgen ikinci model olmaz. Kare dışlanmaz.
- En az iki farklı model bulunmadığında `insufficient_distinct_rectangle_models`; biçim/tür/aralık/yön/alan hatasında `invalid_geometric_comparison_input` oluşur. Tek model gizlenip geçerli karşılaştırma veya öğrenci yanlışı gibi gösterilmez.

Çıktı derin dondurulmuş, deterministik bir veri nesnesidir. `contentSha256` tüm gövdeyi, `visual.svgSha256` SVG byte'larını bağlar. Bunlar **imza, yetkilendirme, uzman kabulü veya seri hale getirilmiş nesneye güvenme mekanizması değildir**. Kopyalanmış ya da tekrar hash'lenmiş çıktı, üç alanlı builder girdisi olarak kabul edilmez. Başka bir tüketicinin kendi güvenlik/kimlik/yayın sınırı ayrıca gerekir.

## Kaynağa Bağlama ve Ayrı Semantik Yönler

Referans: `sources/grade5-geometric-quantities-authoring-matrix.json`, SHA-256 `38a87129dd7f4cc31adc48a81e600de0f65d1f32ae36ff3aef529168d3c61763`. Test bu gerçek dosyanın hash'ini yeni çıktıdaki pin ile karşılaştırır. Modül çağrısı dosya okumaz; pinned referans, çalışma anında kaynağın veya etkin programın yeniden doğrulandığı iddiası değildir.

Program PDF referansı `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`; aday çıktı MAT.5.4.3, fiziksel/basılı 51, 53, 54. `mappingStatus` yalnız `authoring_reference_only`. Tam program anlam incelemesi, 2026-27 etkin ders kararı, hak kabulü ve uzman değerlendirmesi devralınan pending sınırlarıdır. Bu kod diliminde PDF yeniden okunmadı veya kaynak soru kopyalanmadı.

| Yön | Sabit olan | Araştırılan | Gerekli öğrenci kanıtı |
| --- | --- | --- | --- |
| Aynı alan, farklı çevre | Birim kare sayısı | Dış sınır toplamının değişimi | En az iki oluşturulmuş model, tablo, birim/çevre kontrolü, gerekçeli ilişki |
| Aynı çevre, farklı alan | Dört kenarın toplamı | Kaplanan birim kare sayısının değişimi | En az iki oluşturulmuş model, tablo, birim kare sayımı, gerekçeli ilişki |

Görev, oluşturma ve açıklamayı yalnız hazır şekil seçme veya tek cevaplı çoktan seçmeli işleme indirmez. `assessment.requiredEvidence` oluşturma, tablo, açıklama ve kontrolü ayrı ister. Öğrencinin bütün öğretmen adaylarını tek tek bulması zorunlu kılınmaz; en az iki farklı uygun model gerekir. Rubrik uygulanmadı, öğrenci kanıtı toplanmadı ve otomatik hâkimiyet/zekâ çıkarımı yapılmaz. Kısa pratik notlar sabit büyüklüğü, formülün ölçme anlamını, kare/döndürme ayrımını ve geçerlilik koşullarını açıklar. Alan birimi dönüşümü istenmez.

## Elle Kontrol Edilen Örnekler ve Sayım

Alan 12 için kenar çiftleri 1×12, 2×6, 3×4; çevreleri 26, 16, 14. Çevre 16 için kenar çiftleri 1×7, 2×6, 3×5, 4×4; alanları 7, 12, 15, 16. Bunlar önceki matrisin aritmetik kontrol vektörleridir; yeni, arşiv karşılaştırması yapılmış ürün soruları diye sayılmaz.

İki çağrı iki semantik aile hazırlığıdır; yedi model satırı **yedi soru değildir**. Her sonuç `authoringTasks: 1`, `semanticFamilies: 1`, `modelRowsAreQuestionCount: false`, `expertAcceptedItems: 0`, `publishedQuestions: 0` bildirir. Sayısal hedef değiştirmek yeni semantik aile veya özgünlük kabulü değildir.

Üst sınır için alan 36'da 1×36, 2×18, 3×12, 4×9, 6×6 modelleri tutulur. Çevre 40'ta yalnız 1×19 ve 2×18 modelleri kalır; 3×17 gibi alanı 36'yı aşan modeller elenir. Çevre 24'te 6×6 kare, alanı tam 36 olduğu için kabul edilir. Sınır yalnız aynı alan yönüne uygulanırsa test başarısız olur.

## Görselin Ne Olduğu ve Ne Olmadığı

`visual.svg` model ve tamamlanmış tabloyu içeren **cevaplı editör referansıdır**. SVG üzerinde görünür olarak "Editör çözüm referansı" ve "Öğrenciye teslim onayı yok" uyarıları vardır. `answerBearing: true`, `learnerPayloadSafe: false`, `revealProtectionImplemented: false`; `review: pending`. Ham SVG, soruyu öğrencinin bağımsız çözmesi için güvenli bir başlangıç ekranı değildir. Cevap gizleme, yetkilendirme, ders sıralama veya öğrenci teslim mekanizması oluşturulmadı.

Çizim, mevcut kaynak/kitap SVG'sini içeri almaz; yeni soyut birim kare geometrisidir. Daha okunabilir yerleşim için uzun kenar çizimde yatay tutulur. Bunun 90 derece dönüşü `rotationDegrees`, mantıksal ve görüntülenen kenarlar ile açıkça belirtilir; yeni bir dikdörtgen sayılmaz. Eş karelerin piksel ölçeği yalnız bu yeni soyut model içindir; ölçekli olmayan kaynak şekline fiziksel ölçek atfetmez.

SVG iki sütunlu kartlar ve tablodan oluşur. Bir modelde en uzun görüntülenen kenar için en fazla 380 piksel ayrılır; eş kare ölçeği buna göre sınırlandırılır. Tüm modellenen grid dikdörtgenleri kendi kartına ve viewBox'a sığar. Aria-label ve ID'siz yerel title/desc kullanılır; yinelenen SVG global IDREF'e bağımlı değildir. Dış font/görsel/URL, script veya olay kancası yoktur.

Bu geometrik/textual kontroller gerçek PNG görünümü, erişilebilirlik kabulü, etkileşimli çizim, insan el yazısı, animasyon, TTS, çözüm videosu veya kelime-kalem senkronu kanıtı değildir. Ana ajan ayrıca sınırlı görsel/raster kanıtı toplayabilir; bu dosya böyle bir kanıt iddia etmez.

## İzlenen RED - GREEN ve Negatif Kanıt

TDD, `writing-good-tests` ve `verification-before-completion` yönergeleri doğrudan ve tamamen okundu. Beklentiler gerçek modül çağrıları, elle kontrol edilmiş örnekler ve gerçek pinned matris dosyasına dayanır; üretim helper'ı beklenen sayıların kaynağı yapılmadı.

1. Önce yalnız test dosyası yazıldı. `node --test test/geometric_comparison_draft.test.mjs`: exit 1, **0 PASS / 20 FAIL**. Başarısızlık builder'ın eksik olmasıyla ilgili beklenen `comparison draft builder not implemented` assertion'ıydı; loader/syntax hatası değildi.
2. Minimal saf modül eklendi. Aynı komut: exit 0, **20 PASS / 0 FAIL / 0 SKIP**.
3. `node --check packages/content-factory/geometric_comparison_draft.mjs`: exit 0.
4. Yeni test ile mevcut reasoned geometry/scene/media/math/concept/teaching-trace testlerinin birlikte taze koşusu: exit 0, **111 PASS / 0 FAIL / 0 SKIP**. Normal CLI'nin dosya yazan entegrasyon testleri bu ajan tarafından çalıştırılmadı; ana ajan ayrı kanıt toplar.

```sh
node --test test/geometric_comparison_draft.test.mjs test/reasoned_geometry_resolver.test.mjs test/reasoned_scene_renderer.test.mjs test/reasoned_media_job.test.mjs test/reasoned_math_adapter.test.mjs test/reasoned_concept_lesson.test.mjs test/reasoned_teaching_trace.test.mjs
```

Testler iki yönü, bütün modellerde alan sınırını, kareyi, döndürme tekrarını, tek model reddini, tam alan/aralık/tür doğrulamasını, sıfır kancalı hostile girdiyi, deterministik hash/freeze, oluşturma/açıklama görevini, answer-bearing görsel sınırını, gerçek matris pinini, negatif yayın kapılarını ve bounded parametre alanını kapsar.

Ek saf in-memory inceleme **72** aralık içi hedefi değerlendirdi: **41** yazım varyantı kabul, **31** karşılaştırmaya yetmeyen hedef reddi. Toplam **115 öğretmen model satırı** ve SVG'deki **115 gerçek model dikdörtgeni** matematik/geometri açısından doğrulandı. Bunlar ürün soru sayısı veya öğrenme başarısı değildir. En büyük SVG 9.452 byte; en yüksek viewBox 1.170 piksel. Pozitif tam sayı, farklı değişken ölçüsü, her modelde <=36, kart/viewBox sınırları, gerçek SVG rect ile metadata eşitliği ve kapalı yayın alanları incelendi.

Dosya değişikliği yapmadan, yalnız bellekte altı gerçekçi mutant çalıştırıldı. Bağımsız assertion'lar alan sınırını kaldırma, döndürülmüş kopyalara izin verme, tek modele izin verme, yönü ters etiketleme, teacherApproved'ı yükseltme ve global accessible IDREF ekleme mutantlarını **6/6** yakaladı. Mutasyonlar üretim dosyasına yazılmadı. Test başarıları özgünlük, pedagojik kalite veya sertifikasyon onayı değildir.

## Frozen Kod ve Açık Kapılar

| Dosya | SHA-256 |
| --- | --- |
| packages/content-factory/geometric_comparison_draft.mjs | 6c6031eb8d54a3755a2443b5bcc13ab877b2ad331d4c80a1d1819052a39c8bd7 |
| test/geometric_comparison_draft.test.mjs | 5aa4854af5bf95f814a56a9b53c26f53c3f9e73ab85c6a25ab29d167aab9313c |

Teacher/expert/active program/publication/learner/production alanları false; curriculum ve rights pending; zorluk unknown; arşiv benzerlik incelemesi yapılmadı. Owner/steward unassigned. Provider çağrısı, kaynak aktarımı ve öğrenci verisi yok. Medya trace/resolver ve ana fabrika entegrasyonu bu modülün dışında; mevcut renderer bu yeni şemayı kabul ediyor diye gösterilmez.
