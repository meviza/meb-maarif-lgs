# Fen Soruları İçin Gerçek JEV Danışma Ekranı

## Teslim ve Sınır

`screenScienceQuestionWithJev(question, sourceExpectation)` gerçek `engine/jev_evaluator.mjs` içindeki `JevQualityAuditor.evaluateQuestion` metodunu kullanır. Mevcut evaluator yerel yapı, metin ve prototip kayıt kontrolleri yapar; bu çağrıda Ollama, başka model veya LLM üretimi yoktur. Bu dilim yeni soru üretmez. Bağımsız bilimsel oracle, soru yazarlığı, kaynak/program incelemesi ve editör kabulü ayrı fabrika katmanlarıdır.

Sahiplik yalnız yeni wrapper, ona ait test ve bu kanıt kaydıdır. Eski engine, generator, self-correction, sağlayıcı istemcisi veya prototip müfredat kodu değiştirilmemiştir. Arayüz/CLI/seed/fabrika entegrasyonunun tamamlandığı bu kayıtla ilan edilmez.

## Kapalı API ve DTO

API tam iki argüman alır. Sınıf yalnız 6, 7 veya 8 olabilir. Bilinmeyen alanlar, yetki bayrakları, sağlayıcı ayarı ve cevap kanıtı alias'ı reddedilir.

- `question`: `grade`, `topic`, `branch`, `outcomeCode`, `stimulus`, `stem`, `options`, `correctOption`, `solutionStrategy`, `detailedSolution`, `distractors`, `difficulty`.
- `options`: Yalnız A, B, C ve D metinleri.
- `distractors`: Yalnız bildirilen doğru harfin dışındaki üç harfin açıklamaları.
- `branch`: `physics`, `chemistry`, `biology` veya `integrated`.
- `difficulty`: `KAVRAMA`, `UYGULAMA`, `LGS_YENI_NESIL` veya `SEKIL_VE_OLIMPIYAT`.
- `sourceExpectation`: `sourceId`, `sourceSha256`, `expectedGrade`, `expectedCourseKey`, `expectedOutcomeCode`.
- Kanonik ders anahtarı: `fen-bilimleri`; yalnız JEV'in yerel prototip çağrısına `fen` olarak açıkça projekte edilir. Kod alias'ı yapılmaz.
- F./FB. kodları aynen korunur. `null` kabul edilir fakat açık `science_outcome_expectation_unbound` tanısı üretir; çağrı yapılmaz ve bir kod uydurulmaz.

Kaynak beklentisi bağımsız bir editör girdisidir; sorunun kendi kodundan varsayılarak oluşturulmaz. Sınıf veya çıktı beklentisi eşleşmezse `scope_mismatch`, JEV çağrı sayısı sıfır olur. Wrapper kaynak kaydını kendisi doğruladığını söylemez: `officialSourceValidated: false`, `sourceRecordDeclared: true` ve `caller_declared_editor_scope_not_source_validation` etiketi kullanır. Gerçek kaynak kanıtı dış katmanda kalır.

## Gerçek JEV Sonucunun Sınırlı Projeksiyonu

Çıktı `science-jev-screen/v1`, `editor_only` ve `advisory_scored`, `input_rejected`, `scope_mismatch` veya `screen_unavailable` durumlarından biridir. Sonuç, sınırlı danışma puanı ve açık kontrollerle gösterilir:

| Wrapper alanı | Fiilen ölçülen |
| --- | --- |
| `prototypeCodeRecognized` / `prototypeScopeMatch` | Yerel prototip kod/kapsam eşleşmesi |
| `duplicateOptionCheckPassed` | Şık metinlerinin eşsizliği |
| `lexicalAmbiguityCheckPassed` | Sınırlı muğlak kelime ve şık örüntüsü taraması |
| `heuristicDifficultyScore` | Metin uzunluğu ve anahtar kelimelerden gelen eski sezgisel puan |
| `distractorEntryCountScore` | Çeldirici açıklama anahtar sayısı; bilimsel doğruluk değil |
| `lexicalSpellingCheckPassed` | Üç eski yazım örüntüsü kontrolü; tam TDK denetimi değil |
| `hintsPresent` | Çözüm stratejisi ve detay metninin bulunması |

Raw `is_meb_aligned`, `single_deterministic_answer`, `zero_plagiarism_guarantee`, Bloom, yıldız dağılımı, video hazırlığı ve timestamp alanları dışarı aktarılmaz. Kaynak beklentisi ile prototip tanıması ayrı tutulur; güncel FB kodunun eski listede bulunmaması resmî kaynak reddi yapılmaz. Tanı metinleri 16 kayıt ve kayıt başına 512 karakterle sınırlanır; kırpma açıkça etiketlenir.

## Bilimsel Doğrulama ile Karıştırılmayan Kanıt

Sentetik basınç test girdisinde 72 N / 0,3 m² = 240 Pa olup C doğru seçenektir. Gerçek JEV bu örneği 1 puanla geçirir; kendi raw cevabı yine `answer_key_status: unverified` olur. Anahtar A'ya yanlış çevrildiğinde de sezgisel puan 1 kalabilir. Tüketici testi bu sınırlılığı açıkça sınar; wrapper hiçbir zaman exact doğrulama sağlamış gibi davranmaz.

Aynı sentetik soru ve açık FB.8.3.1 beklentisinde beklenti eşleşmesi true kalırken prototip tanıması false, JEV geçişi false ve puan 0,8 olur. Bu test kod biçiminin yayın veya kaynak yetkisi olmadığı ayrımını korur. Test kaynak kimliği ve SHA'sı yalnız sentetik beklentidir; gerçek resmî belge indirimi/onayı veya çocuk verisi değildir.

Her durumda `answerIndependent: false`, `independentOracleRequired: true`, `plagiarismChecked: false`, `mebApproved: false`, `learnerEvidenceCollected: false` ve `humanApproval: null` olur. Yayımlama/öğrenci/üretim hazır bayrakları false; yedi kabul kapısı pending kalır. Bloom/zeka/psikometri veya sıfır hata beyanı yapılmaz.

## TDD ve Negatif Test Kanıtı

TDD, Writing Good Tests ve Verification Before Completion talimatları bu görevde yeniden tamamen okunmuştur. Tüketici önce eksik fonksiyonu assertion ile arar; eksik modül içe aktarma istisnası beklenen biçimde yakalanır.

- Nihai RED: `node --test test/science_jev_screen.test.mjs`; 14/14 beklenen `bounded real JEV science screen is missing` assertion hatası, 0 geçiş, çıkış 1; 79.471833 ms.
- İlk GREEN: Aynı komut; 14/14 geçiş, başarısız/iptal/atlanan/todo sıfır, çıkış 0; 87.829917 ms.
- Dar regresyon: Aşağıdaki komut; 24/24 geçiş, başarısız/iptal/atlanan/todo sıfır, çıkış 0; 97.108291 ms.

```sh
node --test test/science_jev_screen.test.mjs test/content_gate.test.mjs test/curriculum_registry_contract.test.mjs
```

Gerçek JEV'in tekrar eden şık, muğlak kök ve çok kısa öncül/soru işaretsiz kök yolları çalıştırılmıştır. Yapısal REJECTED cevabında decisions alanı bulunmayabilir; wrapper bunu null danışma ölçümleriyle gösterir, varsayılan geçiş üretmez.

Getter, proxy, revoked proxy, döngü, toJSON, nested getter, özel prototype, gizli alan, yanlış tip, boyut aşımı, ek harf, yanlış çeldirici anahtarı, ek argüman, uydurma otorite ve sağlayıcı ayarı reddedilir. Kancalar sıfır kez çalışmıştır. HTTP/HTTPS/fetch sınırına test koruması yerleştirilerek gerçek ekranın ağ çağrısı yapmadığı sınanmıştır; evaluator mock edilmemiştir.

Gerçek auditor'un timestamp üretiminde yalnız runtime clock hata enjeksiyonu yapılmıştır. Sonuç `screen_unavailable`, çağrı denemesi 1, gerçekleştirilen ön-kontrol 0 ve fallback 0 olur; native hata metni dışarı sızmaz. Model veya deterministik yedek soru üreterek başarısızlık gizlenmez.

## Bütünlük, Boyut ve Engine Revizyonları

Girdiler descriptor-safe, sınırlı ve inert kopyaya alınır; çıktılar derin dondurulur. Hashler canonical nesne anahtar sırasıyla deterministiktir. Timestamp dışarı taşınmadığı için aynı girdinin raporu aynıdır. Soru gövdesi/çözüm ham metni rapora kopyalanmaz. Hash otorite veya kaynak kabulü değildir.

Gerçek sentetik readback raporu 2.539 bayttır; rapor bütçesi 16.384 bayttır. Girdi metin/bayt/derinlik/düğüm sınırları ayrıca uygulanır.

- Soru SHA: `814288d578935ed69cd5e23a4e39c3d3ed2f9f2725ce18fcc4687c0e8d3beb28`.
- Beklenti SHA: `d4ce34646cdf4169e366cbe07a47b818a2365a9edd2a0ef2b768d0202eaeb702`.
- Rapor SHA: `8f41b14b27273dddd086cb9117ada0632a4099cd711255914382939b02f65452`.
- Wrapper dosya SHA256: `f56009fa2e19d5c87d0de5f0a42f652d24d099c4b1b146cb9202314caa26ae89`.
- Test dosya SHA256: `0881cac43498a7cd915d643baf2c7fae1eb68b595d6e93d071e36290c1e53267`.
- Kullanılan evaluator SHA256: `be01fa8ee4839b66406bbcc2e17c55faaafee2a274097c6456649617337a69e7`.
- Yerel prototip müfredat SHA256: `53e945b1a07e340af3349b94ce5501c95351ac9b2865e6c256952bdb8c184c47`.
- İncelenen, çağrılmayan LLM istemcisi SHA256: `659aa3561bc9b6d9d11494ee2c6929533bc0e8a35d2df50daf213519576b53d3`.
- İncelenen, çağrılmayan self-correction SHA256: `ab8fc790a574af24122c2e3caba3eda2583f31d2989c07e7d6f21628fba4d819`.

## Sayım ve Sonraki Katman

Başarılı danışma çağrısı bir aday ön-kontrolüdür; üretilmiş, kabul edilmiş veya yayımlanmış soru değildir. Rapor sayımı `screenedCandidates: 1`, `generatedQuestions: 0`, `acceptedProductQuestions: 0`, `publishedQuestions: 0` olur. Bu çalışma 450 üretim hızını veya stok hedefinin tamamlandığını göstermez.

Sahip/sorumlu/saklama kararı pending; gerçek öğrenci ve kurum verisi yoktur. Sağlayıcı, ağ, generator, model listeleme/indirme, credential, DB/cloud, tarayıcı, medya veya Git işlemi yapılmamıştır. Bağımsız kaynak/alan oracle'ı ve root fabrika/renderer entegrasyonu bu teknik danışma ekranının dışındadır. Bu kanıt CMMI/SPICE sertifikası veya uzman kabulü değildir.
