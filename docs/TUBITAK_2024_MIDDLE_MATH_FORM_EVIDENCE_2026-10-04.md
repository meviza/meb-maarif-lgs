# TÜBİTAK 2024 Ortaokul Matematik Biçim Gözlemleri — 4 Ekim 2026

Durum: üç seçilmiş referans madde için sınırlı enrichment/editör gözlemi. Özgün ürün sorusu, uzman onayı, MEB eşdeğerliği, hak veya yayın kabulü değildir. Yeni indirme, Drive, provider/model çağrısı ve öğrenci verisi yok.

## Gerçek soru–çözüm çifti

Mevcut ek registry ve özel önbellekteki iki resmî kaynağın tamamı yeniden hash'lendi; `pdfinfo` okundu. Canlı web veya arşiv tekrar indirimi yapılmadı. [Resmî geçmiş sınav kataloğu](https://bilimolimpiyatlari.tubitak.gov.tr/tr/gecmis-sinav-sorulari), registry'de iki dosyanın ortak girişidir.

| Kaynak | Taze SHA-256 | Bayt / sayfa |
| --- | --- | --- |
| [2024 I. Aşama Ortaokul Matematik Sorular A](https://bilimolimpiyatlari.tubitak.gov.tr/files/BJqEEdu6cFHQgwKFABFHsLePi392e0YX5RXakc8B.pdf), `tubitak-2024-middle-math-stage1-questions` | `ba67a4f067fcc4375822a15896210d9216a9743fa27c569045c45799da9b81a5` | 1.240.794 / 25 |
| [Aynı sınavın çözümleri A](https://bilimolimpiyatlari.tubitak.gov.tr/files/IPpguOcqPGxQEdSqQDXtNE0TnQaqYVoGOP66Gkul.pdf), `tubitak-2024-middle-math-stage1-solutions` | `c68687627066bf7354d9dc69b7db634ba1607b16d253a086467729b89d013425` | 249.646 / 11 |

İkisi A4, şifresiz ve `pdfinfo` JavaScript alanı no. PDF metadata tarihi yayın/yürürlük veya yeniden kullanım izni değildir. Registry'deki karşılıklı `pairedSourceId` ve seçilmiş ordinale bağlı soru/çözüm başlıkları çift bağını destekler; bütün cevapların bağımsız doğruluğunu kanıtlamaz.

Her dosyanın fiziksel 1–3 sayfalarında sınırlı metin çıkarımı gezinme için okundu. Komşu soru/çözüm metinlerinin çıkarımda görünmesi seçilmiş madde incelemesine katılmadı. Kesin gözlem yalnız **1, 2, 4** ordinalidir. Soru dosyasında üçü **fiziksel 2 / basılı 1**; çözümlerde üçü **fiziksel 2**. Seçilen çözüm sayfasında basılı numara native görüntüde saptanmadığı için `printedPage: null`; tahminen 1 yazılmadı.

Soru kapağı fiziksel 1, soru fiziksel 2 ve çözüm fiziksel 2'nin 75 dpi PNG'leri özel QA alanında üretildi; üç sayfanın tamamı native incelendi. Toplam **290.856 bayt**, 750 KiB altında. Kapak yalnız bağlamdır; üçünün yanında dördüncü soru olarak sayılmaz. Ham PDF, metin, seçenek, anahtar, sayısal vektör veya görsel bu Git artefaktlarına eklenmedi; özel QA yolları kamuya açık raporda bulunmaz.

## Sınav kuralları ayrı bağlamdır

Soru kapağı 18 Mayıs 2024 tarihini, **32 soru / 180 dakika** bilgisini bildiriyor. Bu, kaynağın bildirimi; tüm soru sayfalarının fiziksel enumerasyonu değildir. `sourceQuestionTotal: null` korunur. Soru sırasının zorluk sırası olmadığı açıkça belirtiliyor; buradan kolay/orta/zor oranı veya öğrenme rotası üretilemez.

Tek doğru cevaplı çoktan seçmeli biçim ve kitapçık boşluklarında çalışma imkânı gözlendi. Sınavda hesap makinesi yasağı ürünün öğrenme moduna otomatik taşınmaz. Kapakta üçüncü kişi kullanımlarına ilişkin hukuki sorumluluk uyarısı bulunması **ticari kullanım izni değildir**. Hak statüsü reference_only/unverified/pending kalır; bu bir lisans veya hukuki uygunluk görüşü değildir.

## Seçilen biçimlerin kısa gözlemi

| Ordinal | Gözlenen düşünme/sunum biçimi | Çözüm gerekçesi ile ilişkisi / sınır |
| --- | --- | --- |
| 1 | Geometrik sınırlama altında mümkün durumları ayırt etme | Bir geometrik toplam ilişkisiyle engel gerekçesi; mümkün durumlar için örnek varlığı. Özgün öğretimde farklı şekil gösterimleri yararlı olabilir. Kaynakta çizim yok; geometri başlığı tek başına kaynak görseli var demek değildir. |
| 2 | Tam sayı ilişkilerini sadeleştirerek durumları ve farklı sonuçları ayırma | Çözüm önce bilinmeyenleri azaltır, sonra durumları ve tekrar eden sonuçları inceler. Biçimsel ortak kat kavramı ve cebirsel önkoşullar ayrı program/yaş incelemesi gerektirir. Önceki MAT.6.1.4 çekirdeğine otomatik bağlanmaz. |
| 4 | Satır/sütun çakışması olmayan ızgara yerleşimlerini sayma | Boş kalan bileşen seçimi ile kalan eşleştirmeleri ayıran çarpımsal sayma. Özgün etkileşimli ızgara öğretimde yararlı olabilir; kaynakta çizim yok. Faktöriyel/permutasyon notasyonu için yaş ve önkoşul kabulü pending. |

Bu özetler yeni soru taslağı değildir; kaynak kökü/denklemi/şekli/cevabı veya sayı değiştirerek klonu oluşturmaz. Amaç, yalnız cevaba değil **istenen yapı → ilk yol seçimi → gerekçe → kontrol** ilişkisine dikkat etmek. Altı mikroamaç ve dört temsil adayı proje türetimidir; resmî TÜBİTAK/MEB taksonomisi değildir. Üç farklı aile, üç yeni ürün sorusu olarak sayılmaz.

“Ortaokul” başlığı 1–8'in her sınıfına, herhangi bir MEB çıktısına veya LGS zorluğuna eşdeğer değildir. Her maddede formal çıktı kodu **null**, yaş/sınıf uygunluğu uzman pending, zorluk **uncalibrated**. İkinci maddenin biçimsel EKOK içeriği, [önceki MAT.6.1.4 sınır gözlemi](GRADE6_COMMON_RELATIONS_SOURCE_EVIDENCE_2026-10-04.md) ile doğrudan çekirdek eşlemeyi engeller; bu, diğer sınıflardaki bütün öğretimi yasaklama veya bütün kaynağı reddetme değildir.

## Kayıt ve gerçek tüketici kanıtı

[Yeni kayıt](../sources/tubitak-2024-middle-math-form-observations.json) **15.157 bayt**, 16 KiB altında. `observations` iki satırdır: soru kaynağında üç seçilmiş item, çözüm kaynağında `items: []`. Çözüm ordinale bağlı ayrı referans, yeni soru değildir. Seçilen span kesintilidir; `allOrdinalPagePairsChecked: false` ve bütün kaynak/çıktı/aile paydaları bilinmiyor kalır. Ürün/konu/yayın katkısı **0**.

[Test](../test/tubitak_2024_middle_math_form_observations.test.mjs), mevcut gerçek `createSourceScopeGapReport` tüketicisini çalıştırır; prose grep'i veya sahte model testi yok.

- Önce RED **0/12**: yeni gözlem kaydı yoktu; beklenen assertion nedenidir.
- İlk veri koşusu **11/12**: test genel rolün `sourceIdentityCount` alanını hücre rolünden okumaya çalışıyordu. Sistematik hata ayıklamada gerçek hücre çıktısının `metadataCandidateCount: 0` ve iki unassigned kaynak olduğu görüldü. Yalnız test alanı düzeltildi; kaynak/üretim modülü değiştirilmedi.
- GREEN **12/12**, fail/skip **0**, 74,6 ms. Bağlı yeni gözlem + kapsam boşluğu + MAT.6.1.4 gözlemi **43/43**, fail/skip **0**, 160,0 ms. Test syntax exit **0**.
- Gerçek tüketici: **2 kaynak / 2 byte revizyonu / 2 bound gözlem / 3 seçilmiş kaynak maddesi / 0 çözüm maddesi / null toplam / 0 ürün**. İki kaynak da sınıf hücrelerine unassigned kalır.
- Stale soru SHA'sı üç madde katkısını kaldırır; stale çözüm SHA'sı çözüm satırını unbound yapar ama doğrulanmış soru satırındaki üç gözlemi silmez. Bu **tam çift cevap kabulü değildir**; iki kaynak ayrı lineage kayıtlarıdır.
- Sahte özet adetleri/aktif/yayın alanları kapıları açmaz. Tekrar kimlik/ordinal, bozuk ordinal, öğrenci-verisi işareti ve hostile nesneler reddedilir.
- Ayrı salt-okunur probe: **8 hostile ret + iki role dağıtılmış 10 stale/unbound vaka**, hook **0**, probe dosya yazımı **0**.

Son test okumasında değişmezlik assertion'ının snapshot'ı çağrı sonrasında aldığı fark edildi; bu karşılaştırma mutasyonu yakalayamazdı. Yalnız testte snapshot gerçek çağrı öncesine taşındı. Kaynak JSON ve üretim modülü değişmedi. Düzeltme sonrası taze bağlı suite **43/43**, fail/skip **0**, 184,8 ms; syntax exit **0**. Bu test kanıtı iyileştirmesi yeni bir production bug düzeltmesi veya kaynak kabulü değildir.

Generic gap tüketicisi metaveri bağlama/sayım içindir; item'in bütün semantik prose'unu veya nested çözüm referansını bağımsız doğrulayan bir soru/cevap kabul motoru değildir. Tam DTO digest testi ve gerçek registry eşlemesi bütünlük kanıtıdır, imza/auth değildir. Test geçişi pedagojik/hak kabulü olarak kullanılamaz.

Dosya SHA: JSON `a3b4e59686101ff56a310b239a26774b8c0dd44922a12958e5ac0e22f7ec4d5a`; test `f8d55700dd5c71d877aaee1f3bb980cf7f8da9795139d2a4596ebfd754b34b08`. JSON body SHA (contentSha alanı hariç insertion-order): `59fcca9defbce635ae742b7f903942606adcf01b10fa5f474e5dbf1795867f48`; tam sıralı-own-key kanonik SHA: `db5be1d8583aab9f74c5e1c0760c283d34a6bb4b07b39ea1dfffad6d458a49ff`.

PDF/TDD/doğrulama becerileri gerçek sayfa okumasını ve tüketici davranışını kabul iddialarından ayırdı. Owner/steward/retention, etkin program, uzman, cevap doğrulaması, hak ve erişilebilir medya kabulü **pending**. Teacher/MEB/publication/learner/production kapıları false; model aktarımı false. DAMA izlenebilirlik katkısıdır, CMMI/SPICE/MEB veya pedagojik sertifika değildir. Eski JSON/modül/ortak raporlar ve Git değiştirilmedi.
