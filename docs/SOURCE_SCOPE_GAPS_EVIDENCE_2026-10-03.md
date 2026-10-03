# Kaynak kapsamı boşluk raporu — 3 Ekim 2026

## Teslim edilen sınır

`packages/content-factory/source_scope_gaps.mjs` içindeki `createSourceScopeGapReport(input)`, mevcut küçük kamuya açık JSON anlık görüntülerinden **saf ve değişmez bir metaveri/eksik raporu** üretir. Dosya açmaz, PDF indirmez/okumaz, ağ/model/Drive çağırmaz; kaynak veya ürün kabulü vermez. CLI, mevcut registry ve eski belgeler değiştirilmedi. Türetilmiş JSON bu dilimde diske yazılmadı.

Girdi: `{ archives: [anaRegistry, ekRegistry], selection, downloadObservations, monthly, formObservations }`. Entegrasyon testleri bu altı gerçek JSON'u salt-okunur yükler; işlev yalnız verilen veri nesnelerini alır. İndirme gözlemleri, 59 seçilmiş TYMM kimliğinin üzerine bağlanır; 59 yeni kaynakmış gibi eklenmez. Girdi summary alanları tamlık/indirme sayısı için otorite değildir.

42 sınıf–ders hücresi ürünün **aday ana ders profili**dir; resmî zorunlu ders çizelgesi veya bütün 1–8 müfredatının paydası değildir. İnsan hakları/vatandaşlık, trafik, sanat, müzik, beden eğitimi, bilişim, rehberlik ve diğer dersler bu profilden çıkarılarak “gereksiz” kabul edilmez. İki 4. sınıf ek programı ve sınıfı kesinleştirilmemiş olimpiyat/kılavuz referansları `unassignedSourceIds` altında görünür kalır.

## Yeniden sayılan gerçek kayıtlar

| Ölçü | Sonuç | Anlamı |
| --- | ---: | --- |
| Ana registry | 42 kaynak kimliği | 34 kayıtlı indirme, 8 başarısız eski program bağlantısı |
| Ek registry | 10 kaynak kimliği | 10 kayıtlı indirme |
| TYMM seçimi | 59 kaynak kimliği | 5 kayıtlı indirme, 54 dosya bütçesi nedeniyle bekleyen/başarısız |
| Aylık/seri örnekler | 88 kaynak kimliği | 44 duyuru grubu; PDF indirmesi yok |
| Birleşik kimlik | 199 | URL/kimlik metaverisi; 199 PDF indirmesi değildir |
| İndirme kayıtları | 49 | SHA-256 ve bayt uzunluğu kayıtta mevcut; burada taze PDF kontrolü yapılmadı |
| Tekil indirilen bayt revizyonu | 48 | 6. sınıf İngilizce çalışma kitabının iki kimliği tek SHA revizyonudur |
| Kimlik bazlı kayıtlı bayt toplamı | 258.742.634 | Tekrar kimliği içerir; gerçek tekil saklama ihtiyacı değildir |
| Tekil revizyon bayt toplamı | 250.396.912 | Kaydedilmiş uzunluklardan SHA başına bir kez sayılır |
| Başarısız kaynak | 62 | 8 eski bağlantı + 54 bütçeli TYMM kaynağı; sessizce paydadan çıkarılmaz |
| Yalnız metaveri/HEAD kaynağı | 88 | Başarısız edinim sınıfından ayrı aylık bağlantı kimlikleri |

Tek tekrar: `meb-2026-grade6-english-workbook` ve `tymm-book-297`; SHA-256 `9ba6273f74bf478b8cd313400486d8b1dce5a89e51f255945318f4e5f075dc7d`, 8.345.722 bayt. Bu modül dosyanın bugün yerelde/Drive'da var olduğunu veya erişimin doğrulandığını söylemez; `freshPdfByteChecks: 0` kalır.

## Ayrı kaynak rolleri

| Rol | Kaynak kimliği | Kayıtlı indirme | Tekil indirilen revizyon |
| --- | ---: | ---: | ---: |
| Program | 28 | 20 | 20 |
| Öğrenci ders/ilk okuryazarlık kitabı | 55 | 4 | 4 |
| Konu anlatımı/etkinlik/çalışma kaynağı | 6 | 3 | 2 |
| Soru/çalışma bankası arşivi | 3 | 3 | 3 |
| Gerçek LGS sınavı | 14 | 14 | 14 |
| Aylık/seri örnek soru | 88 | 0 | 0 |
| Olimpiyat soruları | 2 | 2 | 2 |
| Olimpiyat çözümleri | 2 | 2 | 2 |
| Ortak model/soru yazımı kılavuzu | 2 | 2 | 2 |

Bir fasikül hem etkinlik hem soru bankası adayıdır. Bu nedenle rol satırları toplanarak yeni PDF/kimlik sayısı elde edilmez (`roleCountsOverlap: true`). Rol sınıflaması mevcut kaydın türüne dayanır; başlıktan kaliteli görsel, çözüm doğruluğu, cevap anahtarı veya pedagojik uygunluk çıkarılmaz. Bilinmeyen tür `unclassified` kalır.

## Hücre ve anlamsal boşluklar

TYMM kataloğunun kaydedilmiş 143 kimliği: 59 seçilmiş, 56 ertelenmiş, 28 kapsam dışı seçim kararı. Seçilmiş metaveri, 42 aday hücrenin 31'ine aday bağlantı verir; 11 hücrede seçilmiş katalog metaverisi görülmemiştir. Bu **tek kayıtlı katalog anlık görüntüsü**dür; diğer resmî katalogların kapanışı veya hiçbir kaynak bulunmadığının ispatı değildir.

Her hücrede rol bazında kaynak kimlikleri, edinim bekleyen kimlikler ve dersi doğrulanmamış çok-dersli arşiv kimlikleri ayrı gösterilir. 8. sınıf sözel/sayısal LGS ve aylık kitapçıklar sınıf çapında çok-dersli adaydır; her dersin tamamını kapsadığı iddia edilmez. TÜBİTAK ortaokul etiketi otomatik olarak 5–8'in her hücresine yayılmaz.

2026–27 için önceki resmî duyuru kaydındaki TYMM kohortu 1, 2, 3, 5, 6, 7'dir; profilde 30 aday hücre eder. Ders/kitap/çıktı bazında güncel uygulama kabulü yine pending'dir. 4/8'in 12 aday hücresinde etkin eski programın resmî ders kararı ve PDF semantiği pending kalır. Güncel katalog programı, tarihî program arşivi ve etkin program kabulü birbirine dönüştürülmez; özellikle İngilizce/DKAB baskıları otomatik etkin sayılmaz. Bu dilimde yeni web doğrulaması yapılmadı.

Resmî sınıf–ders, beklenen belge/parça, çıktı, süreç bileşeni, mikrobeceri, soru ailesi ve temsil paydaları `null`dır. Her hücrenin çıktı/mikrobeceri/soru ailesi/temsil kapsamı `null`, semantik kapsamı `unknown`dır. **Kapsam yüzdesi hesaplanmaz.** 36 hafta ürün planlama görünümüdür; resmî takvim veya öğretim saati kararı değildir.

## Kaynak sorusu ve ürün sorusu ayrımı

2018–2024 gerçek sınavın 14 kayıtlı PDF'si, 88 aylık/seri bağlantı metaverisine eklenmiş sayılmaz. Aylık HEAD kayıtları 69 başarılı gözlem, 17 timeout, 2 sorgulanmamış PDF hedefidir; HEAD 200 dosya indirmesi değildir. Beklenen bütün aylık kaynak paydası kapanmış sayılmaz ve PDF soru toplamı bilinmiyor kalır. Duyuru metnindeki toplu soru sayıları ürün stokuna eklenmez.

İki önceki kaynak-biçimi gözlemi indirme kaydındaki aynı kaynak kimliği/SHA'ya bağlıdır: beceri testinde 20 ordinal gözlemi, fasikülde 7 örnek gözlem; toplam **27 incelenmiş referans maddesi gözlemi**. İlk testte 1–20 ordinal dizisi bütünü kaydedilmiş olsa da cevap anahtarı/uzman/doğruluk kabulü değildir. Fasikülün toplam soru sayısı `null`dır. Bütün kaynakların soru toplamı ve resmî soru ailesi paydası yine `null`dır. Yanlış kaynak hash'i görünür biçimde unbound olur ve gözlem toplamına eklenmez.

`sourceReferenceContribution: 0`, `generatedByReport: 0`, `acceptedByReport: 0`; platform ürün bankası bu rapora bağlanmadığından `inventoryCount: null`dır. 36.000 hacim hedefidir; bugünkü üretilmiş/onaylı soru sayısı değildir.

Hak ve pedagojik kabul ayrı alanlardır: 199 kaynak için ticari/model aktarım izni burada kurulmaz, uzman ve etkin çıktı eşlemesi kabul edilmez. `fullSourcesVerified`, `fullQuestionCoverage`, `publicationReady`, `learnerReady`, `productionReady` false kalır. DAMA izlenebilirlik/kalite kanıtıdır; MEB onayı, CMMI/SPICE belgesi veya pedagojik sertifikasyon değildir.

## TDD ve taze doğrulama

- İlk RED: 0/15; beklenen hata eksik `createSourceScopeGapReport` API'siydi.
- İlk GREEN: 15/15. Bir testin frozen çıktı üzerinde `sort()` denemesi kopya diziye düzeltilerek gerçek değişmezlik korunmuştur.
- Ek RED: tekrar katalog/duyuru kimliği ve çelişen sınıf alanı için 0/2; eksik ret davranışı gözlendi.
- Son GREEN: 17/17, 0 fail/skip; 151,9 ms.
- Bağlantılı regresyon: kaynak boşlukları + geometri resolver + müfredat registry + soru kapsam blueprint, 65/65; 0 fail/skip, 198,5 ms.
- `node --check packages/content-factory/source_scope_gaps.mjs`: exit 0.
- Ek salt-okunur sınır denemesi: 9 olumsuz vaka geçti (dizi/derinlik/toplam metin/düğüm/kaynak sayısı sınırları, function/revoked proxy ve öğrenci verisi bayrakları). Ayrı sahte ticari/semantik/yayın onayı denemesi hiçbir kabul kapısını açmadı; hook, ağ ve çıktı dosyası yazımı 0.
- Son tekrar: 17/17, 0 fail/skip, 147,2 ms; üç owned dosyada token/kişisel yol ve satır sonu boşluk aramasında bulgu yok.

Sayaç düzeltmesi sonrası kod SHA-256: `4a0ea28fd34a6c644927782712038f8f11f973992b104063dc38a613e5351a32`; test SHA-256: `17e6de7d6b8ccfb6baf2d0060243f1aa06fc88ec46d4946463241cb4cd1ae9a8`.

Getter, proxy/revoked proxy, döngü, sembol, seyrek dizi ve aşırı uzun metin reddedildi; hook sayısı 0. Tekrarlanan kaynak, aynı SHA için çelişen bayt uzunluğu, bağsız indirme gözlemi ve çelişen sınıf alanları da reddedilir. Yalnız SHA/bayt kanıtı bulunmayan `downloaded` etiketi indirme toplamını artırmaz. Girdi sınırları: 100.000 düğüm, 24 derinlik, 64 Ki karakter/tek metin, toplam 2 MiB metin, 2.048 öğe/dizi, 1.024 birleşik kaynak. Çıktı raw girdi prose'u, URL'leri, kişisel yolları veya tokenları taşımaz; bu sınırlı projeksiyon genel bir gizlilik tarayıcısı değildir.

Türetilmiş rapor 256.929 bayt kompakt / 357.321 bayt okunur JSON; dosya olarak kaydedilmedi. Girdi anlık görüntü digest'i `419581902970d220f0490248ed03d30e82a9c89060aa71fe51b7198b8696120d`; rapor digest'i `24532a523f923539e71dae72d6601e5e3d4675ad3c382acdaead3481dfbacd42`. Bunlar önceki arşiv kaydından rapor tekrarını kanıtlar; taze PDF semantiği/depoya aktarım veya yetkili kabul kanıtı değildir.

## Bağımsız denetim sonrası bayt toplamı düzeltmesi

Bağımsız root denetimi gerçek bir sayaç sınır hatası buldu: her kaydın `byteLength` değeri ayrı ayrı güvenli tamsayı olsa da eski `reduce` toplamı tekrar doğrulanmıyordu. Üç ayrı kimlik/SHA için `[Number.MAX_SAFE_INTEGER, 1, 1]` girdisi, gerçek `9007199254740993` yerine yuvarlanmış `9007199254740992` üretiyordu. Bu teknik metaveri sayacı hatasıdır; yeni bir credential olayı değildir. Gerçek 49/48 arşiv anlık görüntüsü bu sınıra yaklaşmıyordu.

Önce gözlenebilir üç-kayıt regresyonu, rol grupları ayrı ayrı güvenli olsa da birleşik toplamın taşması ve tekrar kimliklerin kayıt toplamının taşması için testler eklendi. RED çalışmasında iki ret testi beklenen `Missing expected exception` nedeniyle başarısız oldu; güvenli üst sınır davranışı geçiyordu. Tek düzeltme: kimlik ve tekil-SHA bayt toplamlarında, her eklemeden önce güvenli tamsayı kapasitesini kontrol eden `sumBytes`; taşma `source_scope_byte_total_overflow` ile reddedilir. Yuvarlama, kırpma, BigInt JSON alanı veya kaynak başına indirme bütçesi değişikliği yapılmadı.

Son GREEN: **21/21**, 0 fail/skip. Bağlantılı regresyon **69/69**, 0 fail/skip, 189,9 ms. Ayrı salt-okunur denemede üç taşma vakası reddedildi; tek `Number.MAX_SAFE_INTEGER` kayıt değeri ve tam güvenli sınıra ulaşan toplamlar kabul edildi. Aynı SHA'lı iki kaydın güvenli kayıt toplamı `9007199254740990`, tekil toplamı `4503599627370495` olarak kesin kaldı. Yalnız bellekte guard kaldırıldığında tekrar-kimlik taşmasının yeniden oluşması regresyonun anlamlı olduğunu doğruladı; dosya/Git/ağ değişimi yoktu.

Altı gerçek kaynak JSON'u yeniden okunarak 49 kayıt, 48 SHA revizyonu ve `258742634`/`250396912` bayt toplamları doğrulandı. Kod/test digest'leri değişti; gerçek girdinin ve türetilmiş raporun yukarıdaki digest'leri **değişmedi**. Bu, düzeltmenin sınır dışı girdiyi reddederken gerçek baseline çıktısını değiştirmediğini gösterir. Kaynak dosyaları, Drive ve indirme limitleri aynı kaldı.

## Okunan anlık görüntüler

| Dosya | Bayt | SHA-256 |
| --- | ---: | --- |
| `sources/meb-reference-registry.json` | 64.117 | `40996a2fa263851f2687c7e51750b1ebdc81ae96071ada1be485d95c618b9386` |
| `sources/education-reference-supplement.json` | 16.029 | `617ed248764be6bbae578633e18380b224d76a61c13286aaff8bd763d435239c` |
| `sources/tymm-relevance-inventory.json` | 212.729 | `f63580b2032ff3f9ffd8f3994fa15f918622677a7c01c04c64216af653cb0c1d` |
| `sources/tymm-download-observations.json` | 40.840 | `66832915b1ab47fb3687897923028a2607eb2e82008659cc69f14cb920858b02` |
| `sources/lgs-monthly-reference-discovery.json` | 179.516 | `aaa1df208839b26e05219f6dd6f99305b0e44d46255f10b2cf2d842ce890962a` |
| `sources/meb-question-style-observations.json` | 8.297 | `ac7f6a51c0fd8e0162c18a14a272a9758dde4dff1371af8e0e5dca26e5519c4f` |

Sonraki kabul kapısı: yetkili resmî payda → etkin PDF sürüm/sayfa/çıktı semantiği → insan-onaylı mikrobeceri/amaç/temsil matrisi → ayrı özgün ürün ve pedagojik/erişilebilirlik/hak kabulü. Metaveri raporu bu kapıları açmaz.

4 Ekim root, aynı saf rapordan [42 aday hücrenin küçük okunabilir Markdown matrisini](SOURCE_SCOPE_CELL_MATRIX_2026-10-04.md) kaydetti. Kayıt/indirme/bekleyen kaynak kimlikleri gösterilir; tam JSON raporu ve ham PDF yeni bir arşiv dosyası olarak yazılmadı. Root taze yeniden sayımı aynı rapor SHA, 49/48 ve kesin bayt toplamlarını doğruladı; kaynak boşluğu dar suite'i 21/21, son tam suite 740/740 fail 0/skip 0. Yeni semantik/rights kabulü veya kaynak indirmesi eklenmedi.
