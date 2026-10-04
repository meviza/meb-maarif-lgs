# 6. Sınıf İngilizce Program–Materyal Aday Karşılaştırması

Faz 17, 4 Ekim 2026. Yeni indirme, Drive aktarımı, provider/model çağrısı, öğrenci verisi ve yayın yok. Bu küçük dilim mevcut iki kaynağı gerçekten inceleyerek tema, biçim ve modalite farklarını kaydeder; tam müfredat veya ürün kabulü sağlamaz.

## Gerçek Mevcut Kaynaklar

| Rol | Kaynak ID | Taze SHA-256 | Bayt / PDF sayfası | Seçili fiziksel ve basılı sayfalar |
| --- | --- | --- | --- | --- |
| Program | `tymm-current-ingilizce` | `38cc26d455c178e4366fdc0abf522c7ad6eb7883ebc8a8971fea390def2c2034` | 12.114.454 / 1.114 | 562, 563 / 562, 563 |
| Çalışma kitabı | `meb-2026-grade6-english-workbook` | `9ba6273f74bf478b8cd313400486d8b1dce5a89e51f255945318f4e5f075dc7d` | 8.345.722 / 75 | 7, 10 / 7, 10 |

İki PDF'nin SHA'ları mevcut registry kayıtlarıyla taze eşleşti; `pdfinfo` boyut/sayfa sayılarını doğruladı. Kaynakların metadata'sı birebir aynı baskı yılı değildir: program katalog yılı 2025, çalışma kitabı katalog yılı 2026. Kitabın PDF değişiklik tarihi 30 Eylül 2026'dır; bu teknik tarih Kurul kabulü veya etkin öğretim yılı değildir. Kitap kaydı gerçekten vardır, `materialMissing=false`; eksik materyal uydurulmadı.

Programın 563. sayfasında Year 6 başlığı ve ENG.6 kodları doğrudan görülür. Kitabın seçili sayfalarında 6. sınıf kapak başlığı yoktur; kitabın sınıf ataması mevcut resmî katalog satırına bağlıdır. Seçili sayfalar School Life tema adını doğrular. [Mevcut programın resmî kaynağı](https://tymm.meb.gov.tr/assets/pdf/ingilizce-dersi-2-8.pdf), [çalışma kitabının resmî katalog kaydı](https://tymm.meb.gov.tr/kitap/297/ingilizce-dersi-6sinif-calisma-kitabi) ve [kitap PDF bağlantısı](https://tymm.meb.gov.tr/assets/pdf/ingilizce-dersi-6sinif-calisma-kitabi_20260930_124530_359.pdf) yeniden indirilmedi.

## Programda Gerçekten Görülen Kesit

562. sayfa disiplinler arası bağlar ve düşünme becerileri bağlamıdır; listedeki başka dersler ilave soru veya ölçülmüş öğrenci becerisi sayılmadı. 563. sayfada 6. sınıfın ilk okul yaşamı bağlamı için aşağıdaki **4 resmî kod etiketi ve 14 görülen süreç bileşeni** var:

| Kod | Görülen parçalar | Kendi sözcüklerimizle amaç | Sınır |
| --- | --- | --- | --- |
| `ENG.6.1.L1` | a, b, c, d — 4 | Ön bilgiyi ve görsel bağlamı kullanarak dinleme/izleme öncesi hazırlanma ve tahmin | Fotoğrafa sözcük atamak tek başına bu dinleme hazırlığını ölçmez |
| `ENG.6.1.L2` | a, b — 2 | Dinlenen/izlenen bütünde konu ve önemli ayrıntıları fark etme | Gerçek dinleme/izleme uyaranı gerekir |
| `ENG.6.1.L3` | a–g — 7 | Tahmin, ayrıntı, sınıflama, karşılaştırma ve çıkarımla anlam kurma | Tek etiket seçimi bütün bu sürecin kanıtı değildir |
| `ENG.6.1.L4` | Yalnız a — 1 | Dinleme/izleme sürecine ilişkin kişisel yansıtmayı ifade etme | Sonraki sayfa incelenmedi; bileşen devamı ve tam çıktı kapsamı **unobserved** |

Bu kodlar kaynaktaki etiketlerdir. JSON'daki mikroamaçlar ve aile adları ise **türetilmiş editoryal adaylardır**, resmî beceri taksonomisi değildir. Dört etiketin görülmesi dört tam çıktının uzman kabulü veya bütün tema paydası demek değildir. Tam çıktı/süreç toplamı null kalır.

## Materyalde Gerçekten Görülen Biçimler

Kitap fiziksel/basılı 7. sayfası içerik listesidir: sekiz tema başlığı gözlendi, ilk School Life başlangıcı 9 olarak gösteriliyor. Bu sayfa ilave etkinlik sayılmadı. Listede cevap anahtarı/referans sayfası 73 gösterilir; **anahtar sayfası açılmadı ve hiçbir cevap kopyalanmadı**.

Fiziksel/basılı 10. sayfada iki etiketli etkinlik var:

1. Görsel–söz varlığı eşleştirme: dokuz fotoğraf yuvasına on yazılı etiket arasından seçim yapılması; bir etiket dışarıda kalır. Dokuz görsel veya on etiket ayrı soru değildir. Aday mikroamaç bağlamdaki eylemi/durumu yorumlama ve anlam ayrımıdır. Öğrencinin seçimi gerekçelendirmesi faydalı ek kanıt olabilir; kaynakta ölçülmüş performans veya kabul edilmiş pedagojik amaç gibi sunulmadı.
2. Önceki dil malzemesinden ikili konuşma oluşturma: model konuşma balonları iletişim için iskele sağlar. Bu, anlamlı konuşma dönüşü ve söz varlığını bağlama taşıma adayıdır. Açık öğrenci üretimi tek doğru seçenekli anahtara indirgenmemeli; yaşa uygun öğretmen rubriği ve geri bildirim henüz pending.

Kaynak fotoğrafları, sözcük listesi, özgün yönergeler, model diyalog veya cevaplar JSON/rapora aktarılmadı. Bazı olay fotoğraflarının etiket yorumları ve görmeyen öğrenci için alternatif anlatımlar uzman erişilebilirlik/cevap denetimi ister; hata bulundu veya anahtar doğrulandı iddiası yok.

## Aday Bağ ve Gerçek Fark

İlk etkinlik ile `ENG.6.1.L1` b/c arasında **tema ve görsel önkoşul hipotezi** kurulabilir: okul bağlamı ve görsel ipuçları ortaktır. Ancak etkinlikte gelecek dinleme içeriğine yönelik tahmin veya sesli akış kanıtı görülmedi. `formalOutputCode=null`, `outcomeEquivalenceAccepted=false` kalır.

İkinci etkinlik konuşma etkileşimidir; seçili program sayfası ise dinleme/izleme çıktılarıdır. Görülmeyen konuşma/söz varlığı çıktılarını uydurmadık; aday çıktı referansı boş kalır. Her ikili diyalog `L4` dinleme sürecine yansıtma değildir. Kitabın bu sayfasında ses uyaranı gözlenmemesi **bütün kitapta ses yok** anlamına gelmez.

Kısa pratik ipuçları yeni editoryal önerilerdir: önce görseldeki eylemi açıkla ve etiketin gerekçesini belirt; konuşmada modeli yalnız tekrarlamadan gerçek bir iletişim amacı ve karşı tarafa anlamlı dönüş kur. Bunlar model tarafından onaylanmış ders, resmî çıktı eşleştirmesi veya öğrenci başarısı değildir.

`ENGLISH_ACTIVE_PROGRAM_BOUNDARY_EVIDENCE_2026-10-04.md` içindeki 45/2025 başlangıç ve 2026–27 sınıf-3/6 materyal duyurusu sınırları değişmedi. Olağan İngilizce ile Çoklu Yabancı Dil profili ayrı; 2026–27 etkin okul profili ve kitabın program/yıl eşdeğerliği **pending**. Kaynak yılı 2026 etiketi bu kapıları açmaz.

## Gerçek Tüketici, Sayımlar ve Test Kanıtı

Yeni DTO `sources/grade6-english-program-material-candidate-observations.json`, mevcut `createSourceScopeGapReport` saf tüketicisine gerçekten verildi; üretim modülü değişmedi. Kontrollü iki gerçek registry satırı ile taze sonuç:

- Kaynak kimliği 2; kayıtlı benzersiz PDF revizyonu 2; toplam **20.460.176 bayt**. Bunlar yeni indirme sayısı değildir.
- Program rolü 1, lesson/activity rolü 1. Program `items=[]`: kodlar soru sayılmaz.
- İki bound observation source, **2 gözlenen kaynak etkinliği**, 2 türetilmiş aday aile. Bütün etkinlik ordinals taranmadı; tam kaynak soru/etkinlik toplamları **null**.
- Yeni/üretilmiş/kabul edilmiş ürün soru katkısı **0**; bütün kapsam, aktif çıktı eşleştirme, uzman/hak ve yayın kapıları false/pending. Zorluk ve aile dağılımı kalibrasyonu null.

TDD: JSON yazılmadan `test/grade6_english_program_material_candidate_observations.test.mjs` çalıştırıldı; **0/12 RED**, beklenen eksik gözlem artifact assertion'ı. Kaynak gözlemleri yazıldıktan sonra **12/12 GREEN**, 0 fail/skip. Taze bağlı koşu:

`node --test test/grade6_english_program_material_candidate_observations.test.mjs test/source_scope_gaps.test.mjs test/tubitak_2024_middle_math_form_observations.test.mjs test/grade6_common_relations_application_observations.test.mjs`

**55/55 GREEN**, 0 fail/skip; yeni test dosyası syntax kontrolü exit 0. Negatifler stale/unknown hash-kimlik, duplicate source/ordinal, hatalı ordinal, getter/proxy/cycle/oversize, learner-data marker ve sahte sayım/onay alanlarını kapsar. Getter/proxy hook çağrısı 0; önceden alınmış snapshot ile girdi mutasyonsuzluğu kontrol edildi. Stale materyal iki etkinlik katkısını kaldırır; stale program görünür unbound kalırken kitap etkinlikleri kayıtlı olabilir, **eşdeğerlik kabulü olmaz**.

`contentSha256` DTO revizyonunu bağlar; kendi hash'ini yeniden üretmek kaynak/hak onayı sağlamaz. Generic tüketici bir metadata projeksiyonudur, imzalı kaynak veya pedagojik onay validator'ı değildir. Tüketicinin `freshPdfByteChecks=0` alanı dürüstçe korunur: kendisi I/O yapmaz; bu fazdaki gerçek dosya hashleri ve native inceleme ayrı kanıt katmanıdır. Yazılım testleri resmî veya uzman kabulü değildir.

## Görsel ve Yetki Sınırı

Yeni incelenen sayfalar yalnız program 562/563 ve materyal 7/10. Dört tam sayfa 75 dpi PNG üzerinden native görüntülendi; boyutları 40.252, 141.610, 59.695 ve 284.079 bayt: **525.636 bayt**, 750 KiB bütçesinin altında. Özel ara çıktılar Git dışında; burada ham medya/yerel yollar yok. PDF becerisi metin çıkarımına ek native kontrolü gerektirdi; TDD ve verification gerçek tüketici/negatif/taze koşu kanıtını yönlendirdi.

İndirme, ağ/API, Drive, dependency, credential, model çağrısı ve yayın: **0**. Eski source JSON/registry, ortak belgeler, shared modules, CLI ve Git işlemi değişmedi. Sonraki güvenli kaynak dilimi, ayrı onaylı küçük sayfa bütçesiyle konuşma/söz varlığı çıktıları veya dinleme uyaranının varlığını incelemek olabilir; bu faz o boşlukları kapatmadı.
