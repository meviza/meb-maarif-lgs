# 6. sınıf ortak ilişkiler: Özgün iki bağlamlı editör taslağı

Tarih: 2026-10-04. Durum: **Bir sabit editör taslağı ve bağımsız yerel hesap denetimi; öğrenci teslimatı, insan kabulü veya yayın değildir.**

Bu dilim, iki günlük bağlamın ortak kat/ortak bölen ve sonuç birimi bakımından ayrılmasını isteyen tek özgün eşleştirme görevidir. Kaynak soru gövdesi, kaynak bağlamları, sayı vektörü, cevap veya görsel kopyalanmaz. Sınırsız üretici, sayı şablonu, altı parametre klonu veya toplu stok hattı değildir.

## Sahiplik ve kapalı API

Yeni owned dosyalar:

- `packages/content-factory/grade6_common_relations_draft.mjs`
- `test/grade6_common_relations_draft.test.mjs`
- Bu kanıt belgesi.

Eski taslaklar, renderer, kaynak JSON/metaveri, CLI, SQL, notebook, ortak plan/doküman ve Git bu yazar tarafından değiştirilmedi. Yeni kaynak gözlemini kaynak ajanı, CLI tüketicisini ana ajan ayrı sahiplenir. Ağ, sağlayıcı, indirme, Drive, yeni bağımlılık veya model çağrısı yapılmadı.

```js
createGrade6CommonRelationsDraft(sourceBindingInput)              // tam 1 argüman
verifyGrade6CommonRelationsDraft(candidate, sourceBindingInput)   // tam 2 argüman
```

Güvenli metaveri girişinin tam üç alanı vardır:

```js
{
  applicationObservations, // yeni gerçek source JSON'un tamamı
  semanticMatrix,          // önceki gerçek semantik matrisin tamamı
  sourceRecord             // main registry'deki tek gerçek ortaokul matematik row
}
```

Çağıran sayı, adet, şablon, kaynak alternatifi, öğrenci, tenant, rol, sağlayıcı, hook veya onay belirleyemez. Create fazla/eksik argümanda `invalid_common_relations_arguments`, kaynak hatasında sabit `invalid_common_relations_source` ile durur. Verify yanlış argüman/aday/kaynak için küçük dondurulmuş tanısal sonuç döndürür; native hata ayrıntısı veya ham kaynak/çağıran metni yankılanmaz.

Create çıktısı `grade6-common-relations-draft/v1`, `state: draft`, `artifactAudience: editor_only` durumundadır. Verify çıktısı `grade6-common-relations-verification/v1`, `state: editor_diagnostic_only`, `valid`, `localMathChecks`, bağımsız `recomputed`, `cardChecks`, sabit kontrol/hata kimlikleri ve pending kapılardır. Serialized çıktı ve hash yetki/issuance markası değildir.

## Kaynak ve hash profili

Giriş gerçek yerel kamusal kaynak kayıtlarına bağlanır:

- Source id: `tymm-current-ortaokul-matematik`.
- PDF SHA: `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`; kaydedilmiş boyut 3.916.466 bayt; program 222 sayfa.
- Yeni application gözlemi: `sources/grade6-common-relations-application-observations.json`.
- Application bütün parsed snapshot, sorted-own-key JSON SHA: `3c1ccf730931f9704bd95ce5137ee0154d6b05daea6eb12c35a70bfa23b89c38`.
- Önceki matrisin bütün sorted snapshot SHA: `5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8`.
- Ana registry'deki bütün kaynak row'un sorted snapshot SHA: `610d60eeb3d8387517d2f74f71be171fa8663e3a177d42bd217b647ac6bdea19`.

Üç pin çalışma sırasında inert snapshot'tan yeniden hesaplanır. Sonradan değiştirilmiş bir metadata/hash/onay taşıyan çağıran beyanı gerçek bu revizyonlar yerine geçemez. Gerçek sourceRecord ayrıca kimlik/sınıf, kayıtlı indirme SHA/boyut ve `reference_only`/`unverified` hak profiliyle kontrol edilir. Önceki matrisin MAT.6.1.4 süreç etiketleri `a,b,c`, yeni gözlemdeki prior binding ile bağlanır. Hiçbir ham kaynak paragrafı çıktı metnine aktarılmaz.

**Hash algoritmaları karıştırılmaz:** Yeni kaynak JSON'un kendi `contentSha256` değeri insertion-order body JSON algoritmasıyla `6d8cdadc7e1e52980bbaf027e83a2226508e98d13b956169fc1e3d74c6ec0205`'tir. Önceki matrisin kendi content SHA'sı `88865918f2c6a10ae874b7ef63d7fcfb18ab096d4a13a40a9c095b0c8ccf5e98`'dir. Bu ikisi lineage alanı olarak taşınır; bunları sorted snapshot altında yeniden hashleyip yanlış eşdeğerlik iddiası kurmayız. Ayrı bütün-snapshot pinleri declared content SHA'yı da kapsar. Bir declared SHA tek başına kabul veya kaynak kimlik doğrulaması değildir.

Taslak/task hash profili ise sıralı array'leri koruyan sorted object JSON'a `k12.grade6-common-relations.<kind>/v1:` öneki ekler. Nesne anahtar sırasının değişmesi aynı tanısal revizyonu korur; dizilerin sırası authored revizyonun parçasıdır.

Kaynak gözleminde uygulama sayfaları 71 ve 72, 73 ise yalnız sonraki tema sınırıdır. Bu taslağın içerik dayanağı 71'deki MAT.6.1.4 ortak ilişki, günlük bağlam, temsil ve eşleştirme sınırıdır; 72 destek/zenginleştirmeyi bütün öğrencilere zorunlu veya olimpiyatı bu çıktıya otomatik eşdeğer saymaz. 73 yeni çıktı kabulü değildir. Önceki matris/gap dosyaları değiştirilmez.

Modül taze PDF baytı okumaz: `freshPdfByteChecks: 0`. Metaveri pini, kaynak ajanının ayrı PDF incelemesi yerine geçirilmez. Application observation satırları gerçek soru maddesi değildir: `items: []`, source-question denominator null, kaynak/ürün soru katkısı 0. Yeni gözlem ya da bu tek taslak tüm program/kazanım/alan açığını kapatmaz.

## Özgün görev ve elle türetilen beklentiler

**Sesli hikâye odası:** İki döngü 0. dakikada birlikte başlar; biri 6, diğeri 8 dakikada tekrar başlangıç noktasına döner. Başlangıç anı sayılmaz; 48. dakika dahil **0 < t ≤ 48** aralığındaki bütün ortak işaretler istenir. Sonuç birimi dakika. Kaynağın fidan/hayvan/traffic bağlamı kullanılmaz.

**Hikâye kartı atölyesi:** 24 karakter kartı ve 36 mekân kartı, türler karıştırılmadan paketlenir. Tüm kartlar kullanılmalı, artan olmamalı, her pakette iki tür için de aynı pozitif kart adedi bulunmalı. Bütün uygun boyutlar **kart/paket** olarak istenir; paket sayısı istenmez.

Dört verilmiş kanıt kartı, iki bağlamla eşleştirilir. Her bağlam için bütün doğru değerleri ve doğru birimi taşıyan tek kart gerekir; bazı kartlar kullanılmaz.

| Kart | Verilmiş değerler | Birim | İşlev |
| --- | --- | --- | --- |
| evidence-repeat | 24,48 | dakika | Ortak tekrar işaretleri |
| evidence-group-size | 1,2,3,4,6,12 | kart/paket | Kalansız ortak boyutlar |
| evidence-sum | 14 | dakika | Süreleri toplama çeldiricisi |
| evidence-package-counts | 4,6 | paket | 6 kartlık paketlerin sayılarını boyut sanma çeldiricisi |

Doğru eşleştirme: `repeat → evidence-repeat`, `grouping → evidence-group-size`. Bu, iki bağlamlı **tek görevdir**, dört soru veya iki yeni aile değildir.

Elle beklenen tekrar dizileri: 6,12,18,24,30,36,42,48 ve 8,16,24,32,40,48. Ortak pozitif işaretler 24 ve 48. 0 ortak başlangıç olmasına rağmen kapsam dışı; 48 dahil; 72 ortak olsa bile verilen horizon dışı.

Ortak pozitif paket boyutları ve paket sayıları:

| Kart/paket boyutu | 24 kart için paket | 36 kart için paket |
| --- | --- | --- |
| 1 | 24 | 36 |
| 2 | 12 | 18 |
| 3 | 8 | 12 |
| 4 | 6 | 9 |
| 6 | 4 | 6 |
| 12 | 2 | 3 |

Süreleri toplama sonucu 14'ün 6 ve 8'e göre kalanları 2 ve 6'dır. İki süreyi toplamak ortak işaret koşulunu sağlamaz. 6 kart/paket boyutu için 4 ve 6, **paket sayılarıdır**; cevap boyut listesi yerine yazılamaz.

## Bağımsız doğrulama gerçekten ne yapıyor?

Author yolu, interval adımlarıyla iki dizi oluşturur; bölenler için eş çarpanlardan ayrı listeler çıkarır. Verifier bu helper'ı çağırmaz, author key'ini veya explanation/representation sonucunu oracle girdisi saymaz.

Bağımsız oracle her pozitif dakika adayını sonlu horizon'a kadar tek tek dolaşır ve her iki interval için modulo koşulunu kontrol eder. Ortak boyut için 1'den iki toplamı aşmayan adaylara kadar iki modulo koşulunu ayrı test eder. Bağımsız dizi, boyut, paket sayısı, toplam, kalan ve sınır durumları yeniden hesaplanır.

Ardından her verilmiş kartı bu yeniden hesaplanan tam kümelerle, tekrarsızlıkla, ilişki türüyle ve birimle kontrol eder; her bağlama **tam bir** kart eşleştiğini ve iki bağlamın aynı kartı kullanmadığını doğrular. Cevap anahtarı en son bu bağımsız eşleşmeye karşı sınanır. Caller'ın yeniden hashlediği yanlış anahtar veya iki doğru kart çoğaltması `valid` kazanmaz.

Yerel hesap pass, altı kapıdan `answer: approved` kapısına geçmez. `localMathChecks: passed` bütün bu dar kaynak/profile/tutarlılık denetiminin başarı durumudur; uzman onayı veya öğrenciden toplanmış kanıt değildir.

## Neden-sonuç, amaç ve aktarım

Her bağlam için ayrı anlatım verisi vardır: hedef, verilen değerlerin anlamı, neden seçilen ilişki gerektiği, işlemin neyi modellediği, sonuç, birim, sonucun anlamı ve koşullu pratik kontrol. Öğrenciye hız veya mekanik kural değil, **hangi niceliği neden aradığı** gösterilecek editör gerekçesi hazırlanır.

Pratik notlar yalnız iki koşulu ve bağlam sınırını denetlemektir. Toplama kısa yol değildir. Kaynak sınırına uygun olarak bu dilimde formal EBOB/EKOK kavramı/algoritması, en küçük ortak zaman veya en büyük paket boyutu öğretimi/isteği yoktur. `formalGcdLcmTeachingAllowed` ve `extremalCommonRelationTasksAccepted` false; sonlu horizon resmî MEB sayısal sınırı değildir.

Aktarım verileri: 14 dakikanın ortak olmadığı karşı örneği; 0/48/72 için ortaklık ile kapsam koşulunun ayrımı; 6 kart/paket ile 4/6 paket sayısının ayrımı. Bu veriler sayısal varyant stoğu veya alınmış öğrenci yanıtı sayılmaz.

**Verilmiş kanıtı eşleştirme ≠ öğrenci listeyi/modeli kendi kurdu veya gerekçesini yazdı.** Evidence kind `matching_of_given_evidence`; learner evidence ve full outcome evidence false. Açıklama öğretim verisidir, öğrenci açıklamasının ölçümü değildir. Kendi modelini oluşturma, süreç a/b/c'nin tamamını yerine getirme, temsil üretme, ustalık, hız, biliş/zekâ veya kariyer çıkarımı yapılmaz. İlgili proje micro-purpose kimlikleri yalnız önerilen ilişkilerdir; resmî süreç kodu ya da full mastery değildir.

## Bounded güvenli veri sınırı

Önce inert descriptor snapshot alınır: getter, Proxy/revoked Proxy, symbol/hidden property, custom prototype, method/function, cycle, sparse array ve kontrol karakterleri reddedilir; caller hook'ları çalıştırılmaz. Object own-key sırası canonicalize edilir. `undefined`, sonsuz/NaN sayılar ve sayı mutlak değeri 1e9'dan fazla olanlar kabul edilmez.

- Kaynak snapshot: 100.000 node, depth24, 2 MiB toplam key+string UTF-8 bütçesi; tek string65.536, array2048, record1024, key160 sınırı.
- Aday snapshot: 4.096 node, depth16, 65.536 toplam key+string UTF-8 bütçesi; tek string8192, array64, record64, key128 sınırı.
- Problemde iki context ve dört fixed-id kart; iki pozitif integer interval/miktar, en fazla100 horizon/miktar; kart değerleri sınırlı tamsayılar. Sıfır interval, aşırı horizon ve kesirli materyal oracle'a girmeden reddedilir.
- Create çıktı JSON en fazla65.536 bayt. Mevcut fixed task için gerçek9.076 bayt.

Tür-safe malformed explanation containers yerel tanısal false durumuna gider; `.map` veya null property native hatası yayılmaz. Source/purpose/profile uyuşmazlığı matematikçe doğru bir listeyi yeni yetkili taslağa dönüştürmez. Yeniden hashlemek değişmiş anlamı onaylamaz. Wire'daki düz metin hiçbir kod/değerlendirici/sunum sink'ine çalıştırılarak geçirilmez.

## DAMA, kapsam ve yayın durumu

Amaç `editor_original_common_relation_draft`; owner/steward/retention pending; gerçek öğrenci verisi yok. Etkin akademik yıl ve program sürümü null; resmî outcome code null; yalnız önerilen MAT.6.1.4 bağı vardır. Etkin program kabulü, whole outcome/curriculum coverage false.

Altı gate pending: etkin program, pedagoji, haklar, zorluk, uzman yanıt incelemesi, erişilebilirlik. Human approval null; learner/publication/production readiness ve serialized hash authority false. Ticari haklar unverified; source-to-model transfer false; özgünlük/benzerlik taraması yapılmış sayılmaz. DAMA/CMMI/SPICE sertifikası veya pedagojik standarda kabul iddiası yoktur.

Representation yalnız semantik iki bağlam/kart/dizi/grup satırı verisidir; `rendered: false`, erişilebilirlik false. Görsel/HTML/PNG/SVG, ses veya video üretilmez; renderer ve native görsel/klavye/screen-reader kabulü ayrı pending işlerdir. Modül hiçbir HTTP/auth/persistence/analytics kapısı bağlamaz.

Sayım **1 özgün editör taslağı / 1 semantik aile / 0 parametre klonu / 0 kabul edilen ürün sorusu / 0 yayımlanan soru**. Aynı çağrıyı tekrarlamak stok artırmaz. Sağlayıcı/ağ/indirme/görüntü/ses/video faaliyeti her biri 0'dır.

## Gerçek TDD ve taze koşular

İlk14 test üretim modülü yokken yazıldı. `node --test test/grade6_common_relations_draft.test.mjs` → **0 PASS / 14 FAIL**, exit1; beklenen eksik export assertion: `common-relations authoring is missing`. Kaynak JSON henüz hazırlanırken test, kaynak yokluğunu modül yokluğu yerine sahte başarı saymadı. Gerçek kaynak freeze/pin sonrasında minimal modül yazıldı; aynı komut → **14/14 PASS**, 0 skip, exit0.

Ana ajan incelemesinde paketlerin tek tür olduğu ve aynı boyutun bütün karakter/mekân paketlerine uygulandığı cümleyle açıklaştırıldı; hedefte “artırmadan” yerine “artan kart bırakmadan” yazıldı. Bunlar matematik/DTO davranışını değiştirmeyen dil netleştirmeleridir; kelime snapshot testi veya sahte yeni RED→GREEN sayımı yapılmadı. Son prose sonrası mevcut bütün literal matematik/negatif testler yeniden koşuldu.

Literal beklentiler author helper'dan türetilmez. Gerçek mevcut kaynak JSON + matrix + main row ve gerçek create/verifier kullanılır. Negatifler: başlangıç/endpoint/dış sınır/tekrar, toplama/eksik bölen/yanlış birim, yanlış anahtar/çoklu veya sıfır kart eşleşmesi, source-row/whole-metadata/purpose/scope/approval değiştirme ve caller rehash, malformed/büyük aday, getter/proxy/revoked/nested getter/cycle/sparse/hidden veriler, fazla/eksik argüman. Hook sayacı 0.

Taze birleşik komut:

```sh
node --test test/grade6_common_relations_draft.test.mjs test/grade6_common_relations_application_observations.test.mjs test/grade6_source_semantic_matrix.test.mjs test/grade6_reference_authoring_cli.test.mjs test/grade6_factor_evidence_draft.test.mjs test/grade6_factor_evidence_editor_view.test.mjs
```

**69/69 PASS**, 0 fail, 0 skip, exit0: yeni draft14 + source10 + matrix8 + root CLI6 + önceki factor17 + önceki renderer14. Root CLI ayrı owned dosyadır; gerçek mevcut testleri bu birleşik koşuda ayrıca çalıştırıldı.

```sh
node --check packages/content-factory/grade6_common_relations_draft.mjs
node --check test/grade6_common_relations_draft.test.mjs
```

İkisi exit0. Üç gerçek kaynak pin'i ayrı canlı hesaplamada yeniden eşleşti.

## Frozen ölçüler

- Modül SHA: `de2f20571407a49e063bbaa82d96b465ab75ca54d0760a43cddb00d40e0cae3a` —24.407 bayt.
- Test SHA: `696fc01123e4dcf53aed953599140f3559ffeafaa9e4610a51c05b6e70f0f4d9` —18.419 bayt.
- Kanonik draft SHA: `9c225c8f2bc97dfae1d89778cda3ff5980f0c31056330c639e5be15823d2abd7`.
- Authored task SHA: `c20e190e87945d6a79140819490ab09e55342a5a988eae9df5a95e0054ee6aeb`.
- Draft JSON9.076 bayt; verification JSON1.698 bayt; `valid: true`, doğru listeler `[24,48]` ve `[1,2,3,4,6,12]`.

Bu belgenin self-hash'i içerisine yazılmaz; frozen araç çıktısında ayrıca raporlanır.

## Açık kalan kabul işleri

Uzman pedagojik/yanıt/hak kabulü, etkin yıl-program/okul türü kararı, kapsam ve yaşa uygun okuma yükü, zorluk kalibrasyonu, bağımsız arşiv benzerlik değerlendirmesi; öğrenci kendi listesini/modelini oluşturma ve açıklama evidence sözleşmesi; kaynak devamının bütün alanlarda semantik incelenmesi; gerçek renderer/native glyph/erişilebilirlik; insan yetkisi ve learner delivery; ses/video ve öğrencinin öğrenme verisi analizi bu dilimle tamamlanmış sayılmaz.
