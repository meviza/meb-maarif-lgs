# 6–8. Sınıf Fen Kaynak ve Soru Ailesi Planı

Tarih: 4 Ekim 2026. Durum: Kaynağa bağlı editoryal plan; ürün sorusu kabulü veya yıllık kapsam kabulü değildir.

Makinece okunabilir kayıt: [science-678-source-blueprint.json](../sources/science-678-source-blueprint.json).

## Sonuç ve Sayım

Dokuz sınıf–dal hücresi, 132 benzersiz gerçek program kodu ve 27 farklı öncelikli soru ailesi eşlendi. Fizik, kimya ve biyoloji burada bütünleşik **Fen Bilimleri** dersinin editoryal yönlendirme etiketleridir; üç ayrı resmî ders gibi sunulmaz. Çapraz disiplinli içerik birincil hücreye bir kez yazılır.

Her hücre için 50, toplam 450 soru hedefi kullanıcının üretim kotasıdır. Bu belge 450 soru üretmez; 27 aile önerisi de 27 ürün sorusu değildir. Bu dilimde yeni ürün taslağı, uzman kabulü ve yayımlanmış soru sayısı ayrı ayrı **0**’dır.

## Etkin Program Bağı

6 ve 7. sınıflar, 2026–27 TYMM uygulama grubuna ilişkin [TEGM’nin 3 Eylül 2026 duyurusu](https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316/tr) ve güncel [MEB Fen Bilimleri program kataloğu](https://tymm.meb.gov.tr/ogretim-programlari/ders/fen-bilimleri-dersi) üzerinden eşlendi. Katalogda bağlı PDF’nin kodları mevcut yerel dosyanın taze tam hash’iyle ve ilgili sayfa metinleriyle karşılaştırıldı.

8. sınıfta mevcut programın devamına ilişkin [MEB Menderes 5 Eylül 2026 duyurusu](https://menderes.meb.gov.tr/www/20262027-egitim-ve-ogretim-yili-turkiye-yuzyili-maarif-modeli-temel-egitim-taslak-cerceve-planlari-yayimlandi/icerik/1760/) temel alındı; gerçek `F.8.*` kodları [2018 Fen Bilimleri resmî programından](https://mufredat.meb.gov.tr/ProgramDetay.aspx?PID=325) alındı. Okula/ders yılına özel kesinleşmiş yıllık plan bu dilimde toplanmadı. Mevcut genel kaynak sicilindeki eski uygulama durumu değiştirilmedi; bu yeni kayıt kendi kanıtını ve kalan boşluğu birlikte gösterir.

| Hücre | Program Kodları / Sayısı | Fiziksel PDF Sayfaları | Üç Öncelikli Gerekçe Ailesi |
| --- | --- | --- | --- |
| 6. Fizik | `FB.6.1.1–4`, `FB.6.2.1–3`, `FB.6.4.1–7`, `FB.6.6.1–3` / 17 | 112, 116, 127, 138; sınır açıklaması 118 | Karşıt kuvvet okları; normale göre yansıma; devrede kontrollü değişken |
| 6. Kimya | `FB.6.5.1–6` / 6 | 132; açıklamalar 134–135 | Yer değiştirme ile yoğunluk; hâl değişimi gözlemi; eşit kütlede buz–su yoğunluğu |
| 6. Biyoloji | `FB.6.3.1–9`, `FB.6.7.1–4` / 13 | 120, 142 | Çimlenmede kontrol; üreme biçimi karşılaştırması; tür–birey sayısından biyoçeşitlilik |
| 7. Fizik | `FB.7.1.1–5`, `FB.7.2.1–3`, `FB.7.4.1–3`, `FB.7.6.1–3` / 14 | 147, 152, 165, 177; açıklamalar 153, 166 | İş ve yer değiştirme yönü; koşullu enerji dönüşümü; normale göre kırılma yolu |
| 7. Kimya | `FB.7.5.1–10` / 10 | 169; açıklamalar 170, 172, 175 | Tanecikten element–bileşik; çözünme hızında adil deney; özellikten ayırma yöntemi |
| 7. Biyoloji | `FB.7.3.1–9`, `FB.7.7.1–2` / 11 | 156–157, 181; açıklamalar 158–159 | Besin yolu ve yardımcı organ; küçük–büyük dolaşım yolu; besin ağında ok yönü |
| 8. Fizik | `F.8.1.*`, `F.8.3.1.1–3`, `F.8.5.1.1–2`, `F.8.7.*` / 19 | 49, 51, 53, 55–56 | Katı basıncında kontrol; sıvı derinliği karşılaştırması; ideal basit makinede kuvvet–yol ilişkisi |
| 8. Kimya | `F.8.4.*` / 17 | 52–53 | Periyodik örüntü; pH sınıflaması; yeni madde kanıtı |
| 8. Biyoloji | `F.8.2.*`, `F.8.6.*` / 25 | 50–51, 54–55 | Tek karakter çaprazlaması; mutasyon–modifikasyon; fotosentezde kontrollü deney |

Kısaltılmış kod aralıklarının tek tek açılımı JSON’dadır. Güncel PDF’de fiziksel ve basılı sayfa numaraları bu dilimde aynıdır; 2018 PDF’de basılı numara fiziksel numaradan 2 eksiktir. Eşleme 36 + 35 + 61 = 132 benzersiz kod içerir. Kodların listelenmesi bütün çıktılarda performans ölçüldüğü anlamına gelmez.

## Üretimi Doğrudan Sınırlayan Kaynak Kuralları

JSON’daki `activeScopeRules` 14 kural kaydıdır; bunlar bu dilimin üreticiye ilettiği kurallardır, programdaki bütün sınırların eksiksiz dökümü değildir.

- 6. sınıf `FB.6.2.3`, sayfa 118: Sürat/hız için matematiksel hesaplama, grafik okuma ve birim dönüştürme üretilmez. Yol, yer değiştirme ve yön nitel olarak karşılaştırılabilir.
- 6. sınıf `FB.6.5.3`, sayfa 134–135: Kütle/hacim oranıyla yoğunluk hesabı açıkça öğretilir. Yer değiştirme hacmi kullanılırsa tam batma, çözünmeme, taşmama ve uyumlu birimler açıklanır. Yoğunluk hesabı izni, sürat hesabı yasağını kaldırmaz.
- 6. sınıf `FB.6.5.2`, sayfa 134: Saf/saf olmayan madde anlatımı element–bileşik–karışım biçiminde resmî tanecik sınıflamasına genişletilmez. Öncelikli hâl değişimi sorusu erime/donma/kaynama gözlemine bağlıdır; yalnız sabit şekil/hacim sınıflaması bu çıktının yerine geçirilmez.
- 6. sınıf `FB.6.5.4`, sayfa 135: Yoğunluk ve batma/yüzme gözlemi kullanılabilir; kaldırma kuvveti formülüne girilmez.
- 7. sınıf `FB.7.2.3`, sayfa 153: Enerji dönüşümünün matematiksel bağıntılarına girilmez. Kinetik/potansiyel dönüşümünde sürtünmenin ihmal edilip edilmediği açık olmalıdır.
- 7. sınıf `FB.7.4.1–2`, sayfa 166: Snell hesabı, sınır açısı, tam yansıma, mercek özel ışınlarıyla görüntü çizimi ve mercek bağıntıları üretilmez. Saydam ortamlar ve normal açıkça belirtilerek nitel ışın yolu kullanılabilir.
- 7. sınıf `FB.7.3.1`, sayfa 158: Enzim yapısı hariçtir; fiziksel/kimyasal sindirim ve karaciğer/pankreas yardımcı organları kapsam içindedir.
- 7. sınıf `FB.7.3.3`, sayfa 159: Kalp odacıkları, aort gibi özel damar adları, kanın moleküler yapısı ve kan hücrelerinin yapısı hariçtir. Küçük/büyük dolaşım, oksijen oranı değişimi ve hücrelerin görevleri kullanılabilir.
- 7. sınıf `FB.7.5.10`, sayfa 175: Tanecik boyutu, çözünürlük, yoğunluk ve erime/kaynama farkları yöntem seçimini destekler. Buharlaştırma, yoğunluk farkı ve damıtma örnekleri kapalı bir üçlü değildir. Süzme çıkarımı tanecik/süzgeç/çözünmeme koşulları açık verilirse kurulabilir. Mıknatısla ayırma bu sayfada doğrudan adlandırılmadığı için bu dilimde sayfa bağı bulunmadan üretilmez; bu son kayıt MEB’in genel bir yasak kararı değil, editoryal kaynak-bağı bekletmesidir.
- 8. sınıf, fiziksel sayfa 51: Basınç denklemleri ve gaz basıncı değişken yasaları yerine kontrollü deney ve nitel sıralama kullanılır.
- 8. sınıf, fiziksel sayfa 53: Basit makine denklemleri, `Q = m·c·ΔT` ve hâl değişimi ısı hesapları üretilmez. Deney değişkenleri, sıcaklık gözlemleri ve ideal kuvvet–yol–iş ilişkisi kullanılabilir.
- 8. sınıf, fiziksel sayfa 52 ve 54: Kimyasal tepkime, fotosentez ve solunum denklemleri ile solunum basamaklarının sayısal verimine girilmez.

Bu kurallar yalnız dosyada kayıtlıdır; genel fabrikanın veya JEV’nin bunları fiilen uyguladığı kabulü bu belgeyle verilmez. Consumer ve bağımsız soru oracle’ı kendi testleriyle bağlanmalıdır.

## Gerçek Resmî Soru Biçimi Kanıtı

[MEB 7. sınıf beceri temelli arşivi](https://odsgm.meb.gov.tr/www/7-sinif-beceri-temelli-testler/icerik/490) ve [MEB LGS arşivi](https://karabukodm.meb.gov.tr/www/lgs-yayimlanmis-sorular/icerik/213) taze kontrol edildi. Bu dilimde mevcut önbellekteki 7. sınıf eski program 1. ünite dosyası ile 2024 LGS sayısal dosyasının seçili Fen sayfaları incelendi; 2018–2024 arşivinin bütün Fen soruları analiz edildi denmez. Sayısal kitapçığın Matematik sayfaları Fen kanıtı olarak sayılmadı.

11 soru-biçimi gözlemi; görsel destekli gerekçe, zaman dizisi, eksik çaprazlama kanıtı, kontrollü katı/sıvı basıncı, zorunlu çıkarım, periyodik tablo örüntüsü, yeni madde gözlemi, iddia–deney ilişkisi ve ısı deneyindeki değişken/aktarımı kapsar. Bunlar resmî soru taksonomisi veya ürün soru adedi değil, seçili arşivden editoryal gözlemlerdir. 27 önerinin hepsinde arşivden doğrudan biçim kanıtı yoktur; boş `styleEvidenceIds` alanları bunu görünür bırakır. Bu ailelerin kaynak temeli program çıktısı ve açıklamalarıdır.

Gerçek görsel inceleme yapılan dört fiziksel sayfa: 7. sınıf arşivi sayfa 2; LGS 2024 sayfa 19, 24 ve 28. Diğer seçili sayfalarda metin incelemesi yapıldı. Program sayfaları için bu dilimde görsel/raster kabulü verilmedi. Kaynak soru gövdeleri, şıklar, sayılar, şekiller ve cevap anahtarları ürün çıktısına kopyalanmadı.

## Bloom ve Gerekçeli Çözüm

[Iowa State University](https://celt.iastate.edu/prepare-and-teach/design-your-course/blooms-taxonomy/) ve [Arizona State University](https://lth.engineering.asu.edu/reference-guide/blooms-taxonomy/) birincil üniversite kaynakları üzerinden 2001 revizyonunun altı bilişsel süreç etiketi doğrulandı. Bu etiketler amaçlanan görev talebini gösterir; zorluk ölçeği, yaş uygunluğu kabulü veya öğrencinin bilişsel gelişim ölçümü değildir. “Yaratma” için seçenek işaretlemeden fazlası, gerçekten oluşturulmuş yanıt/ürün ve rubrik gerekir.

Önerilen çözüm hattı: Sorulan amaç → Verilenlerin anlamı → Yöntemin gerekçesi → Ara sonucun dayanağı → Koşullu püf nokta → Şık/şekil/model kontrolü → Aktarım sınırı. Aktarım alıştırması ayrı ürün sorusu olarak sayılmaz. Fen doğruluğu, şıklarda tek kesin yanıt ve görsel–model tutarlılığı JEV’den bağımsız doğrulanmalıdır; JEV yalnız danışma sinyali sağlar.

## Taze Veri Doğrulaması

Mevcut yetkili proje önbelleğindeki dört PDF’nin byte uzunluğu ve SHA-256’sı yeniden karşılaştırıldı. `pdftotext -layout -f P -l P ... -` çıktısının form-feed dahil UTF-8 byte’ları üzerinden 42 sayfa hash’i yeniden hesaplandı: 33 program, 9 arşiv sayfası. Bu metin hash’i bir PDF kırpma dosyasının veya görselin hash’i değildir; araç sürümü/çıktı biçimi değişirse metin hash’i yeniden ele alınır.

| Kaynak Kimliği | Taze Tam PDF SHA-256 |
| --- | --- |
| `tymm-current-fen-bilimleri` | `a56aab9c648f8293341be3f70c0b49e644ecb1d56be9fcaa200d6419bf1eeb97` |
| `legacy-2018-fen-bilimleri` | `3a8aa21327083bf15c33b9c404f299ff784b11d26024522a8c24b61387c8c0c1` |
| `meb-archive-grade7-science-skills-unit1` | `28d70fd1510969b7ef5d1b86cd0f8027a4a6f9ab0cdd8138768ffa690ac2f8fd` |
| `lgs-2024-numerical` | `93b7b44a2127680940d4e272dc72d7dc6dba21ee227135f58f2b22931d38881a` |

4 Ekim’de çalıştırılan salt-okunur Node assertion probu; her sayfa hash’ini, o sayfadaki gerçek kodun metinde bulunmasını, grup–kod–program–sayfa bağını, 27 benzersiz aileyi, bütün biçim/kural referanslarını ve sıfır kabul/yayın alanlarını kontrol etti. İlk probun hücrede doğrudan `outcomeCodes` varsayması araç hatasıydı; gerçek `outcomeGroups` şekline göre düzeltilen probda kaynak kodu değiştirilmedi.

Son çıktı:

```json
{"status":"PASS","pdfHashes":4,"pageTextHashes":42,"programPageTextHashes":33,"archivePageTextHashes":9,"uniqueActualOutcomeCodes":132,"outcomesByGrade":{"6":36,"7":35,"8":61},"cells":9,"distinctPriorityFamilies":27,"scopeRules":14,"styleObservations":11,"acceptedProductQuestions":0,"publishedQuestions":0,"newPdfDownloads":0}
```

Bu assertion probu veri bütünlüğü/eşleme tanığıdır; üretim kodu TDD testi, uzman fen kabulü, MEB onayı, psikometrik kalibrasyon, CMMI veya SPICE sertifikası değildir. Tamamlama beyanından önce taze doğrulama becerisi kullanıldı; probdaki alan hatası sistematik hata ayıklamayla veri/araç sınırında giderildi.

## Kalan Boşluklar ve Faaliyet Sınırı

6/7. sınıf ders kitabı 1/2 cilt katalog adayları kayıtta bulunur; bu dilimde bütün kitap içerikleri ve etkinlik sayfaları eşlenmedi. 2024 TYMM tarihsel PDF’sinin sicildeki HTTP 500 durumu değişmedi. Uzak 7. sınıf arşiv 1. ünite timeout’u ve 4. ünite yaklaşık 13 MB erişim hatası büyük indirmeyle aşılmadı; yalnız mevcut yetkili önbellek kullanıldı. Yıllık dağılım/ağırlık, ders kitabı etkinlikleri, bütün 2018–2024 biçim sayımı ve okulun kesin yıllık planı sonraki kaynak dilimleridir.

Yeni PDF indirme, provider/model çağrısı, ücretli servis, Drive aktarımı, SDK kurulumu, gerçek öğrenci/kurum verisi ve Git commit/push: **0**. Kaynak metni/özel önbellek yolları bu dosyalara eklenmedi. MEB onaylı kaynak güvenilir birincil temeldir; bizim özgün dönüştürülmüş sorularımız ayrıca çözüm, görsel, şık ve kaynak-çıktı uyumu kontrolünden geçer. Kapsam belirsizliği veya kaynak erişimi ticari yeniden yayımlama izni diye çevrilmez.
