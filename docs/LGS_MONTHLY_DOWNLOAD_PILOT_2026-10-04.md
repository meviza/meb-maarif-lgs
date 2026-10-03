# LGS aylık örnekleri: sınırlı gerçek PDF edinim pilotu

Tarih: 4 Ekim 2026, Europe/Istanbul. Durum: **1 gerçek PDF edinimi ve kısmi kaynak-biçimi incelemesi**. Bu çalışma iki eski aylık kaynağa uygulanmıştır; bütün arşiv, etkin müfredat, cevap doğruluğu, ticari lisans veya ürün kabulü değildir. [Yeni pilot kaydı](../sources/lgs-monthly-download-pilot.json), eski keşif kaydının **aynı 88 kimliğini** korur. Eski registry, boşluk raporu, indirme aracı ve ürün fabrikası değiştirilmedi.

## Seçim ve güncel resmî bağlantı kontrolü

Eski [aylık keşif kaydında](../sources/lgs-monthly-reference-discovery.json) 44 duyurunun 88 sözel/sayısal kimliği bulunuyordu; PDF GET yapılmamıştı. Bu, gözlenen indeks kapsamıdır; internetteki bütün aylık kaynakların veya zorunlu derslerin kapanmış paydası değildir. Önceki HEAD kayıtlarında 3 MiB ve altında Content-Length görülen yalnız iki **sayısal** aday seçildi. HEAD gözlemi dosya edinimi sayılmadı; düşük boyut bu iki kaynağın pedagojik bakımdan en iyi olduğunu göstermez.

[25 Kasım 2019 resmî duyurusu](https://odsgm.meb.gov.tr/www/sinavla-ogrenci-alacak-ortaogretim-kurumlarina-iliskin-merkezi-sinava-yonelik-kasim-ayi-ornek-sorulari-yayimlandi/icerik/499) ve [24 Mayıs 2019 resmî duyurusu](https://odsgm.meb.gov.tr/www/sinavla-ogrenci-alacak-ortaogretim-kurumlarina-iliskin-merkezi-sinava-yonelik-mayis-ayi-ornek-sorulari-yayimlandi/icerik/460) önce web aracıyla açıldı. Ardından yalnız bu iki HTML sayfası taze, bounded HTTPS fetch ile kontrol edildi. Her ikisi 200 döndü; eski `merkez-` slug'ı aynı resmî hostta `merkezi-` slug'ına bir kez yönlendi. Yayın tarihi ve registry'deki **exact PDF href** canlı HTML'de görüldü. 46 duyuruluk eski tarama tekrar yapılmadı.

Taze HTML kontrolü 3 Ekim 2026 22:19:02–03 UTC, yani 4 Ekim 01:19:02–03 Türkiye saatinde yapıldı. HTML başına 256 KiB, 20 saniye ve üç resmî-host yönlendirme üst sınırı uygulandı. Gövdeler diske/Git'e kaydedilmedi; 21.754 / 21.701 bayt ve SHA-256 gözlemleri yeni registry'dedir. İki sayfanın hakların saklı tutulduğu altbilgisi de görüldü; açık erişim, açık ticari lisans olarak yükseltilmedi.

## Gerçek edinim sonucu

| Kaynak kimliği / bölüm | Tarihî okul yılı | Önceki HEAD baytı | Bu pilotun sonucu |
| --- | --- | ---: | --- |
| `lgs-sample-2019-11-series1-page499-numerical` | 2019–2020 | 2.200.644 | Bir GET denemesi başarısız: `request_or_storage_failed`; PDF kaydı, SHA, bayt veya soru sayısı yok |
| `lgs-sample-2019-05-series1-page460-numerical` | 2018–2019 | 2.954.686 | Bir GET ile 2.954.686 bayt gerçek PDF indirildi; HTTP 200, PDF magic, SHA ve cache yeniden kontrolü geçti |

Mevcut `tools/meb_source_archive.mjs` içindeki `archiveSources` kullanıldı. Yeni indirme modülü, özel HTTP bypass, alternatif cache veya limit artışı yapılmadı. Exact HTTPS allowlist, manual redirect doğrulaması, PDF/octet-stream Content-Type, `%PDF-` magic, chunk/file/cache sınırları ve SHA denetimi mevcut araçtan geldi. Ek fetch sayacı toplam **iki gerçek PDF GET** ile sınırlandı. Başarısız CDN denemesi tekrar edilmedi; arşivleyicinin genel hata projeksiyonu ayrıntılı neden vermediği için ağ/TLS/depolama nedeni uydurulmadı.

Başarılı dosyanın SHA-256 değeri `2c4fea59203a1392df21a77765575df79c54e26249d7f6041fea890a95d36b3e` ve yeni cacheFile adı aynı kimlik+SHA biçimindedir. `wx` ve mode `0600` ile oluşturuldu; mevcut dosya üzerine yazma veya silme yapılmadı. Son salt-okunur lstat/bayt/magic/SHA kontrolü aynı sonucu verdi. Ham PDF, metin, PNG ve özel arşiv yolu Git dosyalarına eklenmedi.

88 kimliğin son durumu: **1 indirildi, 1 edinim denemesi başarısız, 86 bu iki-GET pilotunda denenmedi**. Başarısız kaynak “başarıyla edinildi” veya “kaynak yok” diye etiketlenmedi. Denenmeyen 86 kaynağın PDF soru toplamları `null`/bilinmiyor kalır. İki seçimin sözel çiftleri de otomatik edinilmiş sayılmaz.

## Yerel ve küresel bayt bütçesi

| Ölçü | Gerçek gözlem veya sabit sınır |
| --- | ---: |
| Dosya başına sabit üst sınır | 3.145.728 bayt (3 MiB) |
| Bu fazın sabit üst sınırı | 6.291.456 bayt (6 MiB) |
| Bu fazda edinilen bayt | 2.954.686 |
| Ana cache sabit toplam üst sınırı | 149.303.541 |
| Başlangıç ana cache | 34 PDF, 142.959.822 bayt |
| Son ana cache | 35 PDF, 145.914.508 bayt |
| Önceki üç registry'nin kayıtlı tekil SHA toplamı | 48 SHA, 250.396.912 bayt |
| Yeni SHA ile kayıt bazlı tekil toplam | 49 SHA, 253.351.598 bayt |
| Küresel tekil üst sınır | 262.144.000 bayt (250 MiB) |

Talimatın başlangıç cache değeri 143.012.085 bayttı. Gerçek ön lstat sayımı 34 dosyada **52.263 bayt daha düşük** çıktı. Bu farkın nedeni bu pilotta araştırılmadı; kayıtta iki değer ayrı tutuldu. Üst sınır değiştirilmedi ve düşük gözlem faz bütçesini artırmak için kullanılmadı.

Önceki ana/ek/TYMM indirme kayıtları yeniden okununca 49 kimlik kaydı, 48 tekil SHA ve kesin 250.396.912 tekil bayt doğrulandı. Yeni SHA bunların hiçbirinde yoktu; pilot ile 50 indirme kimlik kaydı / 49 tekil SHA elde edilir. **199 kaynak kimliği 200'e çıkmaz:** aylık kimlik zaten keşif envanterinin içindeydi, yalnız edinim durumu değişti. Küresel toplam dosya/Drive erişiminin taze doğrulaması değil, kayıtlı SHA/baytların birleşimidir; bu fazda Drive işlemi yapılmadı. Eski boşluk raporuna otomatik overlay/entegrasyon henüz yoktur; eski 49/48 snapshot kendi tarihiyle korunur.

## PDF'nin gerçekten incelenen kısmı

[Mayıs 2019 resmî sayısal kitapçığı](https://odsgm.meb.gov.tr/meb_iys_dosyalar/2019_05/24094027_Sayisal_mayis_ornek_sorular.pdf) `pdfinfo` ile **23 sayfa**, A4, PDF 1.5, şifresiz, form/JavaScript yok ve tagged değil olarak gözlendi. Bu alanlar PDF güvenlik veya erişilebilirlik sertifikası değildir.

`pdftotext -layout` ile **23 fiziksel sayfanın tamamının metni** okundu; 28.608 UTF-8 bayt, SHA-256 `86f6696004654c0a2639841dfcc4caa80a4b719b6c4e8297c6cd4cc73d2696bb`. Metin dosyası oluşturulmadı. Kapakta görülen ders bazlı sayılar, gövdedeki gerçek ordinal dizileriyle bağımsız kontrol edildi:

| Gözlenen içerik | Fiziksel sayfalar | Gerçek ordinal/öğe gözlemi |
| --- | --- | --- |
| Matematik | 3–12 | 1–10, 10 kaynak sorusu |
| Fen Bilimleri | 13–22 | 1–10, 10 kaynak sorusu |
| Cevap anahtarı | 23 | İki ders için toplam 20 anahtar girdisi |
| Ayrıntılı adım adım çözüm | 23 sayfalık metin incelemesi | 0 gözlendi; cevap anahtarı çözüm videosu veya işlemli çözüm değildir |

Bu sayım yalnız bu dosyanın **20 referans sorusu** içindir; diğer 87 aylık kimliğe, gerçek LGS sınavlarına veya ürünün 36.000 hedefine yayılmaz. Anahtar değerleri yeni kamu kaydına kopyalanmadı ve çözülerek doğrulanmadı. **Ürün sorusu ekleme/yayın sayısı 0** kalır.

Metin çıkarımında bazı Yunan harfleri, üsler ve şekil yazıları bozulabildi. Bu nedenle çıkarılan metin tek başına formül, ölçek, uzamsal yorum veya cevap doğruluğu otoritesi değildir. Tam metin okuma, bütün sayfaların raster incelemesi anlamına gelmez.

## İki gerçek matematik şekli ve soru-biçimi gözlemi

PDF becerisi kapsamında yalnız **fiziksel/basılı 3 ve 12. sayfalar** Poppler ile 90 dpi PNG'ye dönüştürüldü ve native image viewer'da gerçekten görüldü. Her görsel 745×1053 piksel; toplam **177.787 bayt**, sabit 1 MiB önizleme bütçesinin altındadır. Kırpma, yeniden çizme, metin/görsel düzenleme yapılmadı. Diğer 21 sayfanın native raster incelemesi yapılmadı. Görseller yalnız özel yerel inceleme çıktısıdır; ürün veya Git görseli değildir.

| Kaynak ordinali | Görselde gerçekten görülen temsil | Kendi sözlerimizle mikroamaç / pratik yöntem adayı |
| --- | --- | --- |
| Matematik 1, sayfa 3 | Dik üçgen bağıntısı çizimi; birim ızgaralı kuş bakışı plan; etiketli doğru parçaları | Izgara ölçeğinden yatay/düşey farkları seçip eğik uzunlukları karşılaştırma. Yalnız sıralama aranıyorsa karelerini karşılaştırmak, erken yuvarlama ve görünüşten tahminden kaçınmak |
| Matematik 10, sayfa 12 | Önce/sonra iki üç boyutlu bileşik cisim; cebirsel boyut etiketleri | Kaybolan dış yüzlerle yeni açılan yüzleri ayrı izleyip net yüzey değişimini cebirsel ifade etme. Çıkarılan parçanın bütün yüzleri dış yüz kaybı değildir |

Her iki kaynak maddesi dört seçenekli çoktan seçmelidir. Aile ve mikroamaç etiketleri **proje yazarlık adaylarıdır**, resmî öğrenme çıktısı veya ölçülmüş zorluk etiketi değildir. Kaynak geometrisini anlamak için görsel gerekir; lake dekoru, watermark veya eş soru görseli ürün varlığı olarak kopyalanmadı. İnceleme, ileride farklı bağlam ve farklı geometriyle özgün üretim için biçim/amaç referansıdır; yalnız sayıları değiştirerek türev soru üretme izni vermez.

Görülen sayfalarda ordinal, soru ve şekil etiketleri okunabildi; eksik/kırpılmış parça gözlenmedi. Bu, premium UI, metin alternatifleri, ekran okuyucu veya öğrenci erişilebilirliği kabulü değildir. Kaynak PDF tagged değildi; erişilebilir ürün temsili ayrıca hazırlanmalı ve denetlenmelidir.

## Kabul sınırları ve devam kuyruğu

- Tarihî okul yılı korunur: Mayıs 2019 kaynağı 2018–2019'dur. 8. sınıf aday kapsamı, 2026–2027 etkin program/çıktı eşdeğerliği değildir; eşdeğerlik `unknown`, çıktı eşlemesi `null` kalır.
- Kaynak-biçimi incelemesi kısmi; tüm programın semantik kapsamı false, resmî tam payda null. Zorluk kalibrasyonu unknown, öğretmen/uzman/hak onayı pending.
- `usagePolicy=reference_only`, `reuseRights=unverified`; kaynak yeniden dağıtımı, ticari aktarım ve modele gönderim izni false. API/token/model/cloud/Drive çağrısı yapılmadı; öğrenci verisi yok.
- `publicationReady`, `learnerReady`, `productionReady` false; fabrika, ses/video veya öğrenci analitiğine bağlanmadı. Kaynak soru adedi ürün stoku değildir.
- Kasım 2019 başarısız edinim ve kalan 86 denenmemiş kimlik görünür kuyruktadır. Yeni bir yetkili bounded faz olmadan GET tekrarı veya büyük PDF indirmesi yoktur. 54 büyük TYMM kitabının bütçesi değişmedi.
- Bu bir kaynak edinim/inceleme dilimidir; yeni TDD ürünü yazılmadı. Herhangi bir yazılım test geçişi kaynak hakları, cevap doğruluğu, MEB onayı, pedagojik kabul veya CMMI/SPICE sertifikası sayılmadı.

## Tekrarlanabilirlik ve dosya sınırı

Eski keşif registry'si SHA-256 `aaa1df208839b26e05219f6dd6f99305b0e44d46255f10b2cf2d842ce890962a`; 88 kimliğin sıralı liste SHA'sı `39279caf9bbeed4741f26c9f79692749374f42e72a0d9e1db9284f471bb30072`. Yeni pilot bu kimlikleri ve resmî URL/date/section ilişkisini kontrolle devralır; eski kayıt `downloaded=false` snapshot olarak yerinde kalır. İndirilen SHA'ya bağlı soru/cevap/görsel gözlemleri tek yeni kayıt altında tutulur; kaynak metni/seçenekler veya cevapları seri kopyalanmaz.

Yalnız yeni `sources/lgs-monthly-download-pilot.json` ve bu belge yazıldı; eski kod/JSON/docs/Git değiştirilmedi. İzinli arşivleyici bir PDF, izinli PDF incelemesi iki küçük özel PNG oluşturdu. Süreç listesi/environment/CUA/token/credential okuma, Drive, Docker veya bulut model işlemi yapılmadı. Son fresh doğrulama eski registry hash'i, 88 kimlik eşliği, 1/1/86 durumları, source/source-observation SHA bağları, sabit bütçeler ve kamu dosyalarında özel yol/credential bulunmamasını kontrol eder. Bu belge kendi hash'ini içermediği için final freeze hash'leri üst göreve ayrıca bildirilir.
