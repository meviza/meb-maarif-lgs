# Gerekçeli medya: kanonik geometri ve anchor resolver kanıtı

Gözlem tarihi: 2026-10-03. Durum: yerel, saf, editör-inceleme teknik dilimi; yayımlanmış ürün veya öğrenci erişim yetkisi değil.

## Kapsam ve API

Yeni export: `resolveReasonedMediaGeometry({ source, trace, job })`, `packages/media/reasoned_geometry_resolver.mjs`.

Bu dilim yalnız mevcut yerel kanonik kaynakları destekler:

- Matematik: `perimeter`, `area`, `width_from_area`, `width_from_perimeter`, `error_diagnosis`, `fence_gap`, `garden_two_rows`.
- Kavram dersi: varsayılan `createPerimeterLesson()` ve ona ait `createReasonedPerimeterLessonTrace()`; özelleştirilmiş veya başka kavram dersleri değil.
- Soru metadata kapsamı mevcut çözümlenmemiş pilotla sınırlıdır: program, sınıf, registry hedefi ve resmî kaynak eşlemesi null/çözümlenmemiş kalır. Kanonik geometri bağı bir müfredat veya hak onayı değildir.

Yalnız üç yeni owned dosya vardır: resolver modülü, `test/reasoned_geometry_resolver.test.mjs` ve bu belge. Mevcut modül/CLI değiştirilmedi; SDK, TTS, model, renderer, ağ, hesap veya Git işlemi yapılmadı.

## Güven sınırı

Girdi önce sınırlı, plain-data olarak incelenip kopyalanır. Proxy, revoked proxy, getter/accessor, function/toJSON, symbol, sparse/extra-key array, yabancı prototype, cycle, non-finite sayı ve veri bütçesi aşımı reddedilir. Anahtarlar delimiter ile birleştirilerek değil, exact own-key sayısı/varlığıyla kontrol edilir.

Orijinal trace ve job mevcut root WeakSet-audit kapısından geçmek zorundadır. Serialize edilmiş aynı hash'li kopyalar trusted sayılmaz. Ardından:

1. Kaynak kendi kanonik üreticisinden yeniden üretilir; tüm kaynak snapshot'ı, varsa taze yerel review dahil, karşılaştırılır. Yalnız aritmetik doğruluğu veya caller'ın yeniden hesapladığı hash yeterli değildir.
2. Gerekçe trace'i bu kanonik kaynaktan yeniden üretilir ve root audit edilir. Caller trace'in bütün verisi ve content hash'i eşleşmelidir; changed rationale/unknown evidence anchor reddedilir.
3. Job aynı kanonik trace ile mevcut job'da ilan edilmiş style/provider kullanılarak yeniden üretilir ve audit edilir. Bütün cue, source/trace/job hash ve metin bağları karşılaştırılır. Stale/swapped job reddedilir. Style/provider ilanı herhangi bir provider çağrısı vermez.

Serbest source hak etiketi bir hukuki onay değildir. `rightsReview`, `expertReview` ve `curriculumReview` beklemede; `teacherApproved`, `publicationReady`, `learnerReady` ve `productionReady` false kalır.

## Geometri ve cue temsil sözleşmesi

`assets` tam, değiştirilmemiş kanonik SVG string'ini, SVG byte SHA256'ını, kaynak visual hash'ini ve SVG viewBox'ını içerir. `models` kaynak dünya değerlerini ve mevcut SVG'den okunmuş instance bounds/gap koordinatlarını içerir. Arbitrary XML/SVG parser veya harici asset yükleme yapılmaz; küçük parsers yalnız yeniden üretilmiş, byte-eşit yerel SVG sözleşmelerini okur.

| Kaynak | Kaynak SVG koordinatı | Ölçek sınırı |
| --- | --- | --- |
| Dikdörtgen soruları | model `(65,85,400,165)`; fence gap `(125,250,70,0)` | Kaynak açıkça ölçekli değil; `pixelsPerLengthUnit=null`. Gate uzunluğu gap pixel genişliğinden hesaplanmaz. |
| Sabit bahçe | model `(100,315,315,210)`; gap `(237,525,65,0)` | Kaynak ölçekli değil; fiziksel ölçek null. Kesir paydası, kenar çifti ve tel sırası ayrı semantic role'lerdir. |
| Kanonik kavram dersi | ana ve karşılaştırma SVG'lerinin `data-model` rectangle bounds'ları | Kaynak birim-kare modelleri için bounds/dünya-kenarı oranı 42 veya 26 SVG user unit/cm; iki eksen oranı eşit olmalıdır. Bu layout oranı yeni bir ölçüm veya öğrenci kalibrasyonu değildir. |

Anchor'lar yalnız kanonik evidence/result ID'lerinden üretilir. Kaynak değerleri ve ara sayısal sonuçlar kaynak geometrisinden türetilir; unit ve meaning kanonik trace ile bağlanır. Ters sorularda hesaplanan genişlik given anchor'a dönüştürülmez. Tanım, hatalı öğrenci iddiası ve kavram karşı-örneği uydurulmuş sayısal kanıt değil, ayrı logical/text temsilidir. Çoklu tel sırası `logical_repeat` olarak bağlanır; yeni bir ikinci tel çizgisi çizildiği iddia edilmez.

Her cue, exact job cue kimliğini/sırasını/metnini/hash'lerini, source SVG asset ID'lerini, display anchor ID'lerini ve sayısal veya metinsel semantic temsilini taşır. Goal/plan/check cue'larında source SVG bağlamı korunur; bu, henüz uygulanmış highlight animasyonu değildir. Source-region bounds çizim yönergesi taslağıdır; SVG üzerine uygulanmaz.

Transfer prompt/answer cue'ları mevcut kaynak SVG'sine yalnız bağlam olarak referans verir. Yeni koşul veya kare gibi yeni bir şeklin temsili `unsupported_new_geometry_pending` ve `transfer_geometry_not_in_canonical_source` olarak açık kalır. Tanım/logical cue'nun spatial renderer'ı da pending'dir. İnsan tarafından gerekçe, karşı-örnek ve transfer anlamı incelemesi yapılmamıştır.

Sonuç immutable bir `reasoned-media-geometry-binding/v1` sidecar'dır. Bütün assets/models/anchors/cues output hash'ine dahildir. Orijinal source/trace/job değiştirilmez; eski job'un `source_geometry_not_resolved` durumunu geriye dönük değiştirmez. Yeni sidecar durumu `canonical_source_geometry_bound_renderer_pending` olur.

Binding çözüm değerleri ve editör metnini içerir; öğrenci client'ına teslim edilmek için güvenli veya yetkili kabul edilemez.

## TDD ve taze doğrulama

TDD ve verification-before-completion becerileri kullanıldı. Önce test yazıldı; üretim modülü henüz yokken `node --test test/reasoned_geometry_resolver.test.mjs` exit 1, **0 pass / 22 fail** verdi. Gözlenen beklenen temel hata `geometry resolver not implemented` assertion'ıydı; import-loader/syntax hatası başarı veya davranış kanıtı sayılmadı. Üretim kodu bundan sonra yazıldı.

GREEN: aynı komut exit 0, **22/22 PASS**, 0 fail/skip/todo.

Bağlantılı taze regresyon komutu:

```sh
node --test test/reasoned_geometry_resolver.test.mjs test/reasoned_teaching_trace.test.mjs test/reasoned_math_adapter.test.mjs test/reasoned_concept_lesson.test.mjs test/reasoned_media_job.test.mjs test/reasoned_media_jobs_cli.test.mjs test/reasoned_factory_cli.test.mjs test/mixed_practice_plan.test.mjs
```

Sonuç: exit 0, **85/85 PASS**, 0 fail/skip/todo. `node --check packages/media/reasoned_geometry_resolver.mjs` exit 0.

Salt okunur ad-hoc Node kontrolü: **36 adlandırılmış probe / 36 PASS**. Bunlar altı dikdörtgen ailesinde 1×1, 3×8, 100×100 boyutlarını ve gate=edge sınırını (18 vaka), sabit bahçeyi, 100 adaydan mevcut fabrikanın koruduğu **12 ayrı item**'ın doğru review ile çözülmesini, depth/array/string/aggregate-byte bütçelerini, NaN/Infinity, nonplain/prototype/array-key, unknown source/metadata, fake curriculum, serialized changed job, null/unknown source ve null-prototype plain veriyi kapsadı. On iki factory item, 36 named probe'a dahil tek batch probe'un alt kontrolleridir; 36 yeni kayıtlı test veya 48 test diye sayılmadı.

### Frozen uygulama/test snapshot'ı

| Owned dosya | SHA256 |
| --- | --- |
| `packages/media/reasoned_geometry_resolver.mjs` | `dbfe269e8e08f577d740cc01ffccbb2e552ae0bd72599cec95992197a8e76aa2` |
| `test/reasoned_geometry_resolver.test.mjs` | `aa66ba47d8bf328ad3cebcf3d41a83512c79b7a445611cea6fdd3658a052a85d` |

Bu belge kendi hash'ini içine almaz; nihai hash dış raporda bildirilir. Diğer ajanların veya önceki dal fazlarının dosya snapshot'ları bu fazın owned değişikliği veya doğrulama iddiası değildir.

## Açık kalan işler

Gerçek raster/renderer/video, yeni ses üretimi/byte doğrulaması, konuşulan transcript/voice identity incelemesi, word–pen alignment, transfer için yeni kanonik geometri, öğretmen dinleme/görsel-gerekçe incelemesi, hak ve müfredat/yaş/accessibility kabulü yoktur. `providerCallsMade=0`, `sourceFilesRead=0`, `privacyInspection=not_performed`; kişisel veri sınıflandırması yapılmış gibi sunulmaz.

Bu kanıt yalnız saf resolver ve mevcut kaynak sözleşmeleri için yerel teknik kanıttır; full product, browser, insan pedagojik kalite, rights clearance veya publication proof değildir.

## Ana ajan ek entegrasyonu — normal fabrika CLI'si

Saf resolver'ın frozen tesliminden sonra ana ajan `tools/content_factory_pilot.mjs` normal akışına ayrı `geometryPreparation` sidecar'ı ekledi. Her tutulan kaynak, canlı trace ve canlı medya işi output yazılmadan çözülür; bir eşleşme hatası işi durdurur. Orijinal medya işinin `source_geometry_not_resolved` alanı değiştirilmez; çözümlenmiş yeni sidecar, eski işin geriye dönük bir durum mutasyonu değildir. Renderer/ses/video/öğrenci/yayın/üretim kapıları false, canlı çağrı 0.

`test/reasoned_geometry_factory_cli.test.mjs` iki davranış testi önce gerçek CLI ile **0/2 RED**, yalnız eksik `geometryPreparation` assertion'ı; minimal bağlantıdan sonra **2/2 GREEN**. Resolver ve önceki factory regresyonlarıyla **53/53**, ana ajan tam suite ile **673/673 pass, fail 0, skip 0**. Gerçek medya opt-in'i ve önceden mevcut güvenilir Sharp kullanıldı; yeni bağımlılık veya model indirilmedi.

Gerçek, ayrı özel çıktı: 100 aday → 12 taslak/88 çeşitlilik reddi, **12 soru geometri bağı + bir kavram dersi bağı**. Ayrı bir-aday sınırında bir soru + bir ders bağı. SVG byte'ları tam korunur; ilk sorunun sonuçları 4 ve 8 cm, dersin ilk dört sonucu 20/24/24/22; transfer için yeni şekiller pending. Bu iki koşu yeni kabul edilmiş soru sayısı diye toplanmaz; genel kalem renderer veya yeni sesli MP4 değildir.

Bağımsız saf resolver audit'i: 22/22 taze test, 335 geçerli varyasyon, 56 hostile/stale ret; 1.864 anchor, 4.874 cue ve 2.442 kaynak yolu kontrolünde kapsam içi P1/P2 bulunmadı. Bu ad-hoc probe'lar 673 kayıtlı teste eklenmez. Serbest hak etiketi yeniden üretilmiş taslak metadata'sı olabilir; ticari hak veya pedagojik kabul değildir.

Aynı bağımsız denetçi gerçek bir/100-aday JSON, batch ve SVG dosyalarını ayrıca salt-okunur inceledi: source/trace/job ve binding digest'leri eşleşti. Dokuz ek bellek-içi CLI denemesinde deklaratif metadata/escaping, geçersiz count/metadata ve occupied-output sınırı kontrol edildi; bunlar disk artifact'i veya yeni kayıtlı test diye sayılmadı. Yeni kapsam içi P1/P2 raporlanmadı.
