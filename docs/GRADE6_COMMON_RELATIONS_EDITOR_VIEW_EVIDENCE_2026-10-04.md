# 6. sınıf ortak ilişkiler: Editör HTML ve SVG görünümü

Tarih: 2026-10-04. Durum: **Tek mevcut taslağın cevap içeren editör inceleme artefaktı hazır; öğrenci teslimatı, uzman kabulü veya yayın değildir.**

Bu dilim, önceki özgün iki-bağlamlı ortak ilişki taslağını gerçek HTML tabloları ve tek özgün gömülü SVG zaman şeridiyle gösterir. Yeni soru, sayı varyantı, kaynak örneği veya ürün stoku üretmez. İki bağlam ve dört verilmiş kanıt kartı tek eşleme görevinin parçalarıdır; altı ayrı soru değildir.

## Sahiplik ve kapalı API

Yalnız üç yeni dosya bu yazarın kapsamındadır:

- `packages/content-factory/grade6_common_relations_editor_view.mjs`
- `test/grade6_common_relations_editor_view.test.mjs`
- Bu kanıt belgesi.

Eski taslak/verifier, kaynak JSON, planner, CLI, SQL, notebook, ortak dokümanlar ve Git bu yazar tarafından değiştirilmedi. CLI bağlama ve gerçek tarayıcı kanıtı ana ajanın ayrı kapsamıdır.

```js
renderGrade6CommonRelationsEditorView(candidate, sourceBindingInput)
```

Tam iki argüman gerekir. Eksik/fazla argüman `invalid_common_relations_editor_arguments`, geçersiz aday/kaynak `invalid_common_relations_editor_input` sabit hatasını verir. Ham soru, metin, HTML veya iç verifier ayrıntıları hata mesajına yansıtılmaz. Çağıran şablon, sayı, soru adedi, yol, rol, öğrenci, onay veya hook seçemez.

Başarılı dönüş iç içe dondurulur:

```js
{
  schemaVersion: 'grade6-common-relations-editor-view/v1',
  state: 'editor_review_only',
  html: '<!doctype html>...',
  manifest: { /* kanonik bağlar, tam HTML hash/bayt ve dürüst durum */ }
}
```

Modül dosya sistemi, ağ, model/sağlayıcı, tarayıcı veya gerçek öğrenci verisi çağrısı yapmaz. Testler gerçek yerel kaynak metaverilerini ve önceki gerçek taslak API'sini kullanır; PDF indirme ya da PDF baytlarını yeniden denetleme yapmaz.

## Verifier → kanonik yeniden kurma

Önce mevcut bağımsız `verifyGrade6CommonRelationsDraft(candidate, sourceBindingInput)` çalışır. Matematik, amaç, kapsam, kapılar veya kaynak bağları geçmezse HTML üretilmez.

Başarılı denetimden sonra **ham candidate yeniden okunmaz**. `createGrade6CommonRelationsDraft(sourceBindingInput)` kanonik taslağı tekrar kurar. Bütün metin, sayı, nitelik ve SVG koordinatları yalnız bu kayıttan üretilir. Çağıran getter/proxy/thenable veya ham HTML ile çıktı şablonuna ulaşamaz; bu girdiler eski descriptor-safe sınırda reddedilir. Literal metin ve nitelik değerleri `& < > " '` için escaped yerleştirilir.

Geçerli serialized clone aynı sınırlı görünümü üretebilir; clone/hash kimlik, yayın veya issuance yetkisi değildir. Yeniden hashlenen yanlış eşleme, eksik ortak aday, yanlış birim, değişmiş amaç/sınıf veya insan-onayı iddiası geçemez. Kaynak taslağın `representation.rendered: false` alanı aynen kalır. Ayrı manifest yalnız yeni görünüm faaliyetini sayar, eski taslağa onay yazmaz.

Bu çağrıda bağlanan sabit revizyonlar:

| Bağ | SHA-256 |
| --- | --- |
| Kaynak program PDF revizyonu | `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734` |
| Tam uygulama gözlemi metaverisi, kanonik snapshot | `3c1ccf730931f9704bd95ce5137ee0154d6b05daea6eb12c35a70bfa23b89c38` |
| Önceki semantik matris, kanonik snapshot | `5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8` |
| Gerçek ana kaynak row, kanonik snapshot | `610d60eeb3d8387517d2f74f71be171fa8663e3a177d42bd217b647ac6bdea19` |
| Mevcut taslak content hash | `9c225c8f2bc97dfae1d89778cda3ff5980f0c31056330c639e5be15823d2abd7` |
| Mevcut özgün görev hash | `c20e190e87945d6a79140819490ab09e55342a5a988eae9df5a95e0054ee6aeb` |

Bu bağlar metaveri izlenebilirliğidir; taze PDF bayt kontrolü, resmî kimlik doğrulama, aktif akademik yıl kabulü veya ticari hak açıklığı değildir. Kaynak uygulama sayfaları soru bankası sayılmaz; kaynak gözlemindeki `items: []` değişmez.

## Gerçek SVG ve metin eşdeğeri

Tek `figure`, isimli `role="img"` SVG ve `title`/`desc` bulunur. SVG 760×240, `viewBox="0 0 760 240"` ölçüsündedir. Zaman konumu bağımsız elle denetlenen `x = 120 + 12 × dakika` kuralıyla çizilir. Kaynak crop/görseli ya da dış asset kullanılmaz.

| Seri | Gerçek şekil | Dakika işaretleri | Yeri |
| --- | --- | --- | --- |
| 6 dakikalık döngü | Daire | 0, 6, 12, 18, 24, 30, 36, 42, 48 | merkez y=70; x=120,192,264,336,408,480,552,624,696 |
| 8 dakikalık döngü | Kare | 0, 8, 16, 24, 32, 40, 48 | merkez y=138; x=120,216,312,408,504,600,696 |

Toplam **16 işaret: 9 daire + 7 kare**. Her işarette literal seri/dakika/aralık verisi, altında gerçek sayı metni vardır. İki satır etiketi `6 dk` ve `8 dk`, yatay eksende `0`, `Dakika`, `48` metinleri bulunur. Tüm SVG metinlerinin literal font-size niteliği 18'dir. Seri, yalnız renk değil şekil ve satır etiketi ile ayrılır. 24/48 doğru eşleme olarak farklı renklendirilmez.

Başlangıç 0 her iki seride gösterilir ancak aralık dışında (`data-in-window="false"`); içi boş/kesikli şekille ayrılır. Pozitif işaretler ve 48 içeridedir. 48 dahil, 0 hariç koşulu figcaption ve eşdeğer tablonun caption'ında da yazılıdır.

SVG, isimli ve klavye ile odaklanabilen yatay kaydırma bölgesi içindedir. 760 px çizim dar ekranı doldurmak için küçültülmez. Aynı sayılar hemen altındaki semantik tabloda vardır:

- 6 dakika: `6, 12, 18, 24, 30, 36, 42, 48`.
- 8 dakika: `8, 16, 24, 32, 40, 48`.

Tabloda caption, iki `scope="col"` başlık ve iki `scope="row"` satır başlığı bulunur. SVG'nin standart namespace URI'si bir ağ çağrısı değildir. `image`, `use`, `foreignObject`, uzak href veya olay işleyicisi yoktur.

## Kalansız paket: Boyut ile adet ayrımı

İkinci gerçek semantik tablo üç sütun ve altı veri satırıdır. Başlıklar kart/paket boyutunu 24 karakter ve 36 mekân kartı için paket adetlerinden ayırır. Türler karıştırılmaz, artan kart bırakılmaz.

| Boyut (kart/paket) | 24 karakter kartı: paket adedi | 36 mekân kartı: paket adedi |
| --- | --- | --- |
| 1 | 24 | 36 |
| 2 | 12 | 18 |
| 3 | 8 | 12 |
| 4 | 6 | 9 |
| 6 | 4 | 6 |
| 12 | 2 | 3 |

Caption, üç sütun başlığı ve her boyut için gerçek satır başlığı kullanılır. Bu sayıların literal emitted hücreleri elle türetilmiş beklentilerle test edilir; taslağın answerKey'inin aynen gösterilmesi matematik doğrulaması yerine sayılmaz.

## Tarafsız kanıt kartları ve gerekçeli çözüm

Dört kart aynı tarafsız sınıfla gösterilir:

| Kart | Verilmiş değer | Birim |
| --- | --- | --- |
| Ortak zamanlar | 24, 48 | Dakika |
| Kalansız paket boyutları | 1, 2, 3, 4, 6, 12 | Kart/paket |
| Sürelerin toplamı | 14 | Dakika |
| Bir boyut için paket adetleri | 4, 6 | Paket |

Varsayılan kartlarda correctness/seçilmiş işareti, cevap rengi, checkbox, doğruluk ARIA etiketi veya eşleme yanıtı yoktur. Verilmiş sayılar ve tablolar doğal olarak kanıtı görünür yapar; bu görev zaten verilmiş kanıtı tanıma/eşleme (`matching_of_given_evidence`) görevidir.

Tek başlangıçta kapalı `details` içinde iki gerekçeli yol bulunur. Her yol hedef, verilen değerin anlamı, neden ilişki seçildiği, işlemin temsil ettiği anlam, sonuç/birim/sonucun anlamı ve koşullu pratik kontrolün geçerliği/sınırını taşır. Üç aktarım:

1. Süreleri toplamak 14 dakika verir; 6 ve 8 ile kalanları 2 ve 6'dır. Toplama ortak zamanın gerekçesi değildir.
2. 0, 48, 72 üzerinden ortaklık ile pencere koşulunu ayırır: 0 başlangıç olduğu için dışarıda, 48 ortak ve içeride, 72 ortak ama sonlu pencere dışındadır.
3. 6 kart/paket boyutu, 4 ve 6 paket adetleriyle aynı nicelik değildir.

Eşleme yanıtı yalnız bu editör çözüm bölümündedir. **HTML'nin tamamı yanıt içerir; kapalı details güvenlik veya öğrenci cevap koruması değildir.** Öğrenci kendi listesini kurmuş, gerekçesini yazmış veya bir ustalık testi geçmiş sayılmaz. Formal EBOB/EKOK algoritması ya da en küçük/en büyük ortak ilişki sorusu öğretilmez; sonlu pozitif pencere ve tüm kalansız pozitif boyutlar ayrılır.

## Görünüm bütçesi, CSP ve kabul sınırları

Türkçe UTF-8 ve viewport metaverisi bulunur. Sistem fontları, tasarlanmış 18 px taban metin, tabular sayılar, dar ekran tek/geniş ekran iki kart sütunu, sabit SVG için yalnız iç kaydırma kullanılır. Amaçlanan bağımsız görsel inceleme ölçüleri 320×844, 390×844 ve 1440×1000'dır.

Test parser'ı gerçek HTML/SVG ağacını ve literal sayıları inceler; tarayıcı veya tam HTML standardı doğrulayıcısı değildir. CSS satırları, media/grid kuralı veya prose bire bir snapshot olarak test edilmez. Gerçek computed font, glyph kırpılması, yatay belge taşması, pointer/klavye ile details açma-kapama, ekran okuyucu ve görsel/pedagojik kabul bu yazar tarafından yapılmış değildir; ana ajan/uzman kanıtının ayrı kapsamıdır.

Betik, dış font/icon, raster resim, audio/video, iframe, form, dış asset ve ağ çağrısı yoktur. Sabit meta CSP script/img/media/connect/base-uri/form-action kapalı; yalnız gömülü CSS açıktır. Gömülü kendi vektör primitifi dış resim yüklemesi değildir. CSP meta etiketi gerçek HTTP başlığı, kimlik doğrulama, OS güvenliği, üretim route güvenliği veya güvenlik sertifikası değildir.

Üst sınır: HTML **65.536 UTF-8 bayt**, manifest **16.384 UTF-8 bayt**. Aday/source büyüklük, derinlik, getter/proxy/cycle/sparse/kapalı şema sınırları önceki verifier tarafından uygulanır; bu görünüm bunları gevşetmez. Güncel gerçek çıktı:

- HTML: **19.363 bayt**, SHA-256 `7fd1e6607dab233c6244179fc52f98f020a241a60f49b0428316cd4f0f044dac`.
- Manifest JSON: **1.945 bayt**; tam dönüş JSON'u **22.292 bayt**.
- Yapı: 1 SVG / 16 işaret / 2 tablo / 8 veri satırı / 4 kanıt kartı / 1 kapalı çözüm / 2 gerekçeli yol / 3 aktarım.

## DAMA ve durum ayrımı

Manifest mevcut draft/task/source/metaveri hashleri ile çıktı HTML hash/baytını bağlar. Hashler izin veya insan onayı değildir. Aktif akademik yıl/program sürümü/resmî kazanım kodu null kalır; MAT.6.1.4 yalnız önerilen içerik bağıdır. Bütün müfredat/öğrenme çıktısı kapsandı denmez. Kaynak programdaki uygulama anlatımı soru bankası, kaynak soru sayısı veya ürün stoku sayılmaz.

Altı kapı pending: etkin program, pedagoji, haklar, zorluk, uzman yanıt incelemesi, erişilebilirlik. `humanApproval: null`; learner/publication/production readiness, fullOutcomeCoverage, nativeVisualReviewPassed ve accessibilityPassed false. Yerel matematik geçmesi `answer: approved` veya MEB/sertifika onayı değildir. DAMA/CMMI/SPICE sertifikası veya resmî uygunluk değerlendirmesi yapılmış sayılmaz.

Sayım: **1 mevcut özgün taslak / 0 yeni soru / 0 kabul edilen ürün sorusu / 0 yayımlanan soru**. Görünüm faaliyeti **1 HTML / 1 kendi gömülü SVG / 0 PNG / 0 ses / 0 video / 0 ağ / 0 sağlayıcı çağrısı**. Öğrenci cevabı, defter verisi, score, bilişsel/psikometrik/kariyer analizi yoktur. Taze PDF bayt denetimi 0'dır.

## Gerçek TDD ve taze doğrulama

1. Üretim modülü yokken emitted HTML/SVG semantiği ve ret sınırları için 13 test yazıldı. `node --test test/grade6_common_relations_editor_view.test.mjs` → **0 PASS / 13 FAIL**, exit 1; beklenen eksik özellik assertion'ı `common-relations editor renderer is missing`.
2. SVG literal metinlerinin en az 18 olması beklentisi de implementasyondan önce eklenip aynı doğru eksik özellik RED gözlendi. Minimal renderer sonrası aynı komut **13/13 PASS**, 0 skip, exit 0.
3. Sonradan tautolojik parser kök sayımı kaldırıldı ve footer Türkçe etiketi netleştirildi. Bu test/prose temizliği yeni davranış RED→GREEN diye sayılmaz; CSS/prose snapshot change-detector eklenmedi.
4. Erken birleşik koşuda 43 PASS / 1 FAIL vardı: ana ajan yeni CLI testinin `--common-relations-html` bayrağı henüz uygulanmadığı için `invalid_grade6_reference_authoring_args` RED verdi. Bu tarihi sonuç gizlenmez; bu yazar root CLI'yı değiştirmedi.
5. Root bayrağı mevcutken taze gerçek birleşik koşu:

```sh
node --test test/grade6_common_relations_editor_view.test.mjs test/grade6_common_relations_draft.test.mjs test/grade6_common_relations_application_observations.test.mjs test/grade6_reference_authoring_cli.test.mjs
```

**44/44 PASS**, 0 fail, 0 skip, exit 0: görünüm13 + taslak14 + kaynak gözlemi10 + mevcut gerçek root CLI7. CLI/provider/onay varsayımı veya mock kullanılmadı; root CLI'nın gerçek sabit source snapshot çıktısı çalıştı.

```sh
node --check packages/content-factory/grade6_common_relations_editor_view.mjs
node --check test/grade6_common_relations_editor_view.test.mjs
```

İkisi de exit 0. Testler gerçek sayı/şekil/koordinat/aralık, tablo hücreleri/birimleri, tarafsız kart, tek kapalı çözüm, iki yol/üç aktarım, CSP/yasak dış yetenek, bütçe/hash/freeze, yanlış-key/unit/scope/source/gate yeniden hashleme, kötü nesne/getter/proxy/cycle ve tam API arity davranışlarını kontrol eder. Hostile hook sayısı 0. Bu sınırlı geçiş tüm kaynak arşivi, intihal, erişilebilirlik, öğrenci güvenliği veya üretim kabulü kanıtı değildir.

Donmuş uygulama/test dosyaları:

| Dosya | Bayt | SHA-256 |
| --- | --- | --- |
| `grade6_common_relations_editor_view.mjs` | 16.351 | `3e71276b6be5fdb8e6ea8f5d9720d7604a3e16a1eb163061455eb2b5c6d35f4a` |
| `grade6_common_relations_editor_view.test.mjs` | 20.298 | `668fa727d392114036723c03b5168e9907072557feddf73ebbde16db3064a9b6` |

Bağımsız yeniden denetim ve ana ajan native ekran kanıtı bu frozen revizyonlara bağlanmalıdır; bu rapor henüz yapılmamış tarayıcı incelemesini yapılmış saymaz.
