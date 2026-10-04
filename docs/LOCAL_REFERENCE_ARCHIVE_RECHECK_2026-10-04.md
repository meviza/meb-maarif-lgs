# Yerel referans arşivi: dar kapsamlı bayt yeniden kontrolü

4 Ekim 2026. Son birleşik bayt kontrolü: **04:19:28 UTC**, exit 0. Durum: **kayıtlı yerel PDF bayt bütünlüğü yeniden doğrulandı**; uzak arşiv, kaynak içeriği, tam müfredat, lisans veya ürün kabulü değildir. Önceki [MEB arşivi](MEB_SOURCE_ARCHIVE_2026-10-03.md), [teslim makbuzu](ARCHIVE_DELIVERY_RECEIPT_2026-10-03.md), [tarihsel uzak kanıt](DRIVE_REMOTE_EVIDENCE_2026-10-03.md) ve [aylık kaynak kabul kaydı](LGS_MONTHLY_ROOT_ARCHIVE_ACCEPTANCE_2026-10-04.md) zaman kapsamları korunarak okundu.

## Kapsam ve yöntem

Yalnız önceden kayıtlı proje cache'leri, bunların üç JSON manifesti, dört kamu metaveri dosyası ve üç bilinen tarihsel özel receipt okundu. Cache yolları üst görevle özel olarak koordine edildi; bu belge kişisel yollar, hesap/Drive kimlikleri, imzalı URL, token veya PDF içeriği içermez. Home, Drive mount'u veya tüm çıktı dizini taranmadı. Cache'lerde doğrudan yaprak sayımı yapıldı; alt dizinlere yürünmedi.

Her kayıtlı PDF için cache/yaprak `lstat`, normal dosya/symlink ayrımı, güvenli içerik-adresli yaprak adı, `O_RDONLY | O_NOFOLLOW`, dosya başına mevcut 25 MiB sınırı, gerçek okunan bayt sayısı, `%PDF-` başlığı ve bütün dosyanın taze SHA-256'sı kontrol edildi. Açılan dosya ve yolun `dev/ino/size/mtime/ctime` alanları okuma öncesi/sonrası eşleştirildi. İçerik yalnız bounded bellek tamponundan hash'e geçti; kaynak metni çıkarılmadı, PDF parse/raster yapılmadı ve yeni PDF kopyası yazılmadı. TYMM yaprak adları kamu gözleminden tahmin edilmedi: mevcut özel manifestteki `cacheFile`, kamu kaydındaki aynı ID/URL/SHA/bayt ve hak statüsüyle eşleştirildi.

Bu audit yeni yazılım özelliği değildir; missing-feature RED veya TDD geçişi iddiası yoktur. Verification becerisi uyarınca tarihsel toplamlar taze dosya tanığı yerine kullanılmadı. PDF becerisinin içerik/görsel inceleme kabulü bu bayt envanterine aktarılmadı.

## Kayıtlar ve taze fiziksel sonuç

| Kayıt grubu | Kaynak kimliği | Download kaydı | Download kaydı baytı | Edinilmemiş durum |
|---|---:|---:|---:|---|
| Ana MEB registry | 42 | 34 | 142.959.822 | 8 eski bağlantı başarısız |
| Ek eğitim registry | 10 | 10 | 33.935.429 | 0 |
| Seçili TYMM gözlemi | 59 | 5 | 81.847.383 | 54 dosya bütçesinde bekleyen kitap |
| Aylık LGS pilotu | 88 | 1 | 2.954.686 | 1 başarısız +86 denenmemiş |
| Toplam | **199** | **50** | **261.697.320** | **149 edinilmemiş kimlik** |

199 kimlik ID açısından tekildir. İndirilmeyen 149 kimliğin 63'ü failed/budget-pending, 86'sı not_attempted durumundadır. 54 büyük kitap ve 87 aylık kaynak bu yeniden kontrolle indirilmiş olmaz. TYMM'nin 143 satırlık katalog/seçim envanteri ile seçilen 59 satır aynı payda değildir; 143 bütün müfredat veya zorunlu ürün kaynağı sayısı değildir.

| Gerçek kayıtlı cache, kişisel yolu olmadan | Fiziksel PDF | Fiziksel PDF baytı | Taze eşleşen kayıt | Kayıtsız PDF / symlink / eksik / değişmiş |
|---|---:|---:|---:|---|
| Ana MEB cache; aylık yeni PDF burada | 35 | 145.914.508 | 35 | 0 / 0 / 0 / 0 |
| Eğitim referans eki cache | 10 | 33.935.429 | 10 | 0 / 0 / 0 / 0 |
| Seçili TYMM cache | 5 | 81.847.383 | 5 | 0 / 0 / 0 / 0 |
| Toplam | **50** | **261.697.320** | **50/50** | **0 / 0 / 0 / 0** |

Bu 50 kayıt üç mevcut cache'te eşleşti; 50 PDF'nin tamamının dosya modu 0600'dür. Dördüncü bir cache veya repo dışındaki bütün PDF'ler için yokluk/tamlık iddiası verilmez. Bilinmeyen yeni yol geniş taramayla aranmadı. Normal dosya olmayan PDF yaprağı, başlık/size/hash/pin/hak uyuşmazlığı veya okuma sırasında inode/dosya değişimi gözlenmedi. Bu zaman noktasına ilişkin okuma tanığıdır; gelecekte değişmezlik garantisi değildir. Tam bayt eşleşmesi, dosyanın kötü amaçlı içerikten arındırıldığı veya bütün PDF sayfalarının okunabildiği anlamına gelmez.

İngilizce çalışma kitabı `meb-2026-grade6-english-workbook` ve `tymm-book-297` kimlikleri altında iki fiziksel dosyadır. İki dosyanın taze SHA'sı `9ba6273f74bf478b8cd313400486d8b1dce5a89e51f255945318f4e5f075dc7d`, boyutu 8.345.722 bayttır. Aynı revizyon iki yeni kaynak veya soru ailesi sayılmadı.

| Ayrı ölçü | Sonuç |
|---|---:|
| Download kimliği / fiziksel PDF kopyası | 50 / 50 |
| Eşsiz SHA-256 revizyonu | **49** |
| Eşsiz SHA bazında PDF baytı | **253.351.598** |
| Kimlik/fiziksel kopya bazında PDF baytı | **261.697.320** |
| Üç cache JSON manifestinin ayrı baytı | 288.033 |
| Bu üç dizinde PDF + bu üç JSON baytı | 261.985.353 |

SHA tekilleştirmesi disk kopyalarını silmez. 250 MiB, 262.144.000 bayttır; bu rapor dosya/cache/küresel bütçeyi artırmaz. Tekil toplamın bu sınırdan 8.792.402 bayt düşük olması yeni edinim izni değildir. Fiziksel kopya ve manifest toplamı farklıdır; cache dışındaki receipt, raster, log veya diğer arşivlerin disk tüketimi bu dar sayımda yoktur. Dosya sisteminin boş kapasitesi veya restore kabulü ölçülmedi.

## Kaynak kategorisi ve haklar

Ana 34 PDF: 14 gerçek 2018-2024 LGS sınav kitapçığı, 10 güncel program, 8 önceki program, 2 rehber/ortak metin. Ek 10 PDF: 2 program katalog belgesi, 1 çalışma kitabı, 2 tarihsel soru bankası, 1 fasikül, 2 TÜBİTAK ortaokul matematik soru PDF'si ve 2 çözüm PDF'si. TYMM beş kayıt üç DKAB kitap kimliği, bir İngilizce ders kitabı ve zaten ek registry'de bulunan çalışma kitabı revizyonudur. Aylık pilot bir sayısal kitapçıktır. Bu kategoriler tek sınıf/yıl/etkin çıktı kapsamına birleştirilmedi; TÜBİTAK olimpiyatı standart 1-8 müfredat eşdeğerliği sayılmadı.

Dört metaveri grubunun **199/199 satırında** `usagePolicy: reference_only` ve `reuseRights: unverified` korunuyor; başarılı kayıtların hak incelemesi pending kalıyor. Kamuya açık URL, indirilmiş PDF veya hash eşleşmesi ticari çoğaltma, kaynak metni/görseli ürüne gömme, modele gönderme veya yeniden dağıtım izni değildir. Arşivin bu fazdaki ürün sorusu/uzman kabulü/yayın katkısı **0**. Kaynakta soru/cevap/çözüm bulunması kabul edilmiş ürün stokuna eklenmedi. Bu faz program veya PDF içeriğini yeniden okumadığı için kaynak soru toplamı, cevap doğruluğu, etkin program eşdeğerliği ve bütün müfredat kapsamı hakkında yeni tanık üretmez. 36 haftalık ürün planı resmî takvim olarak yükseltilmedi.

## Manifest zamanları: tarihsel sayı güncel sayı değildir

| Yerel cache manifesti; yalnız güvenli yaprak adı | Bayt /dosya modu | Taze dosya SHA-256 | İçindeki tarihsel sonuç |
|---|---|---|---|
| Ana `archive-report-2026-10-03.json` | 52.263 /0600 | `319d2b63c4236a28d1b6365c7727fd5b279d58c30b1796ff2490935734da7526` | İlk 29 başarılı/13 başarısız |
| Ek `archive-report-v1.json` | 15.109 /0600 | `aa833f7646120bc8b4753fae091983320875012e4f2c87873f3b5731163c661a` | 10 başarılı/0 başarısız |
| TYMM `archive-report.json` | 220.661 /0600 | `b7ea150b4a3ce4b77300255c43bef7f657d95c65a4410b03ddf81609d893c0fe` | 5 başarılı/54 bütçe reddi |

Ana ilk rapor değiştirilmedi: sonraki sınırlı yeniden deneme registry'de 34/8, aylık edinim ayrı pilotta 1/1/86 durumundadır. İlk raporun 29 sayısını güncel cache için hata saymak da, eski snapshot'ı 35 başarılı diye yeniden yazmak da doğru değildir.

Aylık pilotta daha önce açıklanmamış ana başlangıç farkı **143.012.085 -142.959.822 =52.263** bayttır. Bu tam olarak ana JSON manifestinin taze boyutuna eşittir. PDF-only ile PDF+manifest ölçüm ayrımıyla aritmetik olarak uyumludur; eski ölçüm komutu bu fazda bulunup çalıştırılmadığından kesin kök neden ilan edilmez. Son ana cache PDF-only 145.914.508, aynı JSON dahil 145.966.771 bayttır.

## Özel receipt ile uzak tanık ayrımı

Yalnız üç bilinen tarihsel özel receipt dosyasının normal dosya/boyut/modu, yerel SHA'sı ve sınırlı tarih/status/count alanları okundu. Kişisel kimlik, Drive ID/link'i veya receipt içeriği Git'e kopyalanmadı. Üst görevin gönderdiği son v4 pointer'ı ayrıca aynı aylık public pinle eşleştirildi; v2/v3 dosyaları veya başka özel çıktı aranmadı.

| Tarihsel receipt | Yerel dosya baytı /modu | Yerel taze SHA | Dosyada kayıtlı eski durum |
|---|---|---|---|
| İlk uzak teslim receipt'i | 38.723 /0644 | `36db8ba5e52b621104249a662aa973a808a8e29610775cfbd44378aa7ac75126` | 70 planlı arşiv öğesi; 12 PDF/65.495.532 bayt geçmiş doğrulama; 58 pending |
| Referans kaynak gece-v1 receipt'i | 3.172 /0600 | `986a606b4ffc5c58a845c29830bee6f6cabf186daaf36ac9f91066b69f6ce5b1` | 19:06:28Z'de 4 metadata eşleşmiş/0 remote byte-SHA; 6 pending |
| Referans kaynak gece-v4 receipt'i | 1.077 /0600 | `3ecaa237f6051d9df68d93ae40672874ffbd661165940508d8b0e6d0a41a6bdd` | 22:44:18Z'de 1 metadata/remote byte-SHA kaydı; 1 pending; yalnız yeni tek kayıt kapsamı |

v4'ün `remoteByteHashScope` alanı `one_new_record_only_not_entire_archive`dır. Tek kaydın local SHA ve 2.954.686 baytı aylık registry ve taze yerel PDF ile eşleşir; pending ID de aylık registry'de bulunur. Bu receipt içindeki tarihsel `verified` durumu bu fazın yaptığı yeni uzak readback değildir.

Eski dosyalar, daha sonraki [49 kayıtlık liste ve tek aylık uzak readback tanığını](LGS_MONTHLY_ROOT_ARCHIVE_ACCEPTANCE_2026-10-04.md) geçersiz kılmaz veya bütün arşiv yetkisini kendiliğinden devralmaz. 49 uzak metadata kaydı bu ajan tarafından taze connector ile yeniden doğrulanmadı. Yerel receipt'in hash'lenmesi remote PDF hash'inin yeniden okunması değildir; eski pending sayısı güncel upload kuyruğu diye sunulmaz. İlk receipt'in 0644 modu gözlendi fakat izin değiştirilmedi; dosya Git dışı yerel çıktı alanındadır, bu faz yeni paylaşım/güvenlik kabulü vermez. Uzak owner/parent/paylaşım, byte readback ve restore kanıtı üst görevin ayrı kapsamıdır. Ağ/Drive çağrısı veya ikinci upload başlatılmadı.

## Kamu kayıtlarının bayt pinleri ve kapanış

| Kamu metaverisi | Taze byte SHA-256 |
|---|---|
| [Ana registry](../sources/meb-reference-registry.json) | `40996a2fa263851f2687c7e51750b1ebdc81ae96071ada1be485d95c618b9386` |
| [Ek registry](../sources/education-reference-supplement.json) | `617ed248764be6bbae578633e18380b224d76a61c13286aaff8bd763d435239c` |
| [TYMM download gözlemi](../sources/tymm-download-observations.json) | `66832915b1ab47fb3687897923028a2607eb2e82008659cc69f14cb920858b02` |
| [Aylık pilot](../sources/lgs-monthly-download-pilot.json) | `bd430587aa433656b1ec679de8900b7221392060751e76177858b758cb8455d7` |

Bu SHA'lar dosyanın gerçek byte SHA'sıdır; kaynak kapsam raporlarının domain-separated/canonical JSON digestleriyle karıştırılmaz. Yalnız bu yeni rapor yazıldı; registry, receipt, cache veya mevcut belge değiştirilmedi. Yeni indirme, dosya kopyalama/silme/onarım, arşivleyici import/çalıştırma, Git, öğrenci verisi, ortam/credential okuma, Docker/DB, provider/model, ağ veya Drive işlemi yapılmadı. Bir uyuşmazlık olsaydı kayıt başarıya çevrilmeden fail-closed raporlanacaktı; bu üç cache'in kayıtlı 50 yaprağında uyuşmazlık gözlenmedi.
