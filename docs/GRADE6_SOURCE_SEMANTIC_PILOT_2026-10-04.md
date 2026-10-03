# 6. Sınıf Sayı Muhakemesi Kaynak Semantik Pilotu - 4 Ekim 2026

Durum: dört fiziksel program sayfası metin ve görsel olarak incelendi; özgün yazıma hazırlık matrisi oluşturuldu. Bu pilot soru/konu anlatımı üretimi, tam müfredat kapsamı, etkin program kabulü veya yayın onayı değildir. Önceki indirmeler ve Drive işlemleri tekrar edilmedi. Yalnız yeni matris, yeni veri-contract testi ve bu belge yazıldı.

## Kaynak ve inceleme sınırı

Mevcut resmî kayıt `tymm-current-ortaokul-matematik`, [program kataloğuna](https://tymm.meb.gov.tr/ogretim-programlari/ders/ortaokul-matematik-dersi) ve [arşivlenen PDF'nin resmî adresine](https://tymm.meb.gov.tr/assets/pdf/ortaokul-matematik-dersi_20260902_111111_630.pdf) bağlıdır. URL'lerin bu fazda ağdan yeniden erişilebilirliği denenmedi. Katalog tarihli dosya adı, 2026–2027 sınıf/ders etkin programının kabul edildiği anlamına gelmez.

Yerel PDF, sayfa okumasından önce yeniden hashlenip `pdfinfo` ile denetlendi:

- SHA-256: `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`.
- Boyut: **3.916.466 byte**; **222 fiziksel sayfa**, A4, PDF1.7.
- `pdfinfo`: şifresiz, işaretlenmemiş; form ve JavaScript bildirmiyor. Bu alanlar güvenlik, erişilebilirlik veya pedagojik sertifika değildir.
- Seçilen semantik sayfalar: **67–70**. Basılı numaralar fiziksel numaralarla eşleşti.
- İçindekiler/bağlam için fiziksel2–4 ve66 okundu; semantik kapsam sayacına eklenmedi. Sayfa2 boş,3 içindekiler,4 genel yaklaşım,66 sınıf/tema girişidir.
- Dört sayfa `pdftotext -f 67 -l 70 -layout ... -` ile incelendi. Bu koşudaki UTF-8 metin19.975byte, SHA-256 `fb82fe3c3654af38db0bf03e10f8e2bc7efef8a86b0d3283f057ef4df9ffadbc`. Metin çıkarımı PDF'nin görsel doğruluğu yerine geçmez.
- Root'un mevcut sınırlı PNG çıktılarındaki dört sayfa bu ajan tarafından ayrı ayrı `view_image` ile açıldı. Çıktı kodları, harfler, bölüm devamları ve basılı numaralar görüldü. Bu fazda yeniden raster dosyası üretilmedi; kaynak görselleri ürün varlığına veya Git artefaktına taşınmadı.

| Fiziksel/basılı sayfa | Gözlenen kapsam | Açık sınır |
|---|---|---|
| 67/67 | Dört çıktı ve17 harfli süreç bileşeni | Tek sayfa tüm sınıf çıktılarının paydası değildir |
| 68/68 | İçerik çerçevesi, öğrenme kanıtları, ön kabuller ve köprü | Kaynak test/soru sayısı bu açıklamalardan çıkarılmaz |
| 69/69 | İlk çıktının uygulamaları ve bölünebilme uygulamasının başlangıcı | Örnek bağlamlar kopyalanmış ürün soruları değildir |
| 70/70 | Bölünebilme devamı ve asal sayı uygulamaları | Ortak kat/bölen uygulama devamı burada görülmedi |

## Gerçekte gözlenen çıktılar

Aşağıdaki anlam özetleri kendi sözlerimizle hazırlanmıştır. Çıktı kodları ve harf etiketleri resmî kaynakta gözlendi; proje mikrobecerileri ve aile adları resmî kod değildir.

| Resmî kod | Kendi sözlerimizle hedef | Sayfa67 süreç harfleri | Gözlenen bileşen |
|---|---|---|---|
| `MAT.6.1.1` | Doğal sayı çarpan–kat ilişkisini problem bağlamında gerekçelendirme | a,b,c,ç,d,e,f | 7 |
| `MAT.6.1.2` | Belirtilen sayılarla kalansız bölünebilme ilişkisini çıkarıp sınama | a,b,c,ç,d | 5 |
| `MAT.6.1.3` | Asallık kararını ve asal çarpan yapısını çözümleme | a,b | 2 |
| `MAT.6.1.4` | İki doğal sayının ortak kat/bölen ilişkisini yorumlama | a,b,c | 3 |

**4 gözlenen çıktı /17 gözlenen süreç**, seçilmiş dilimin sayımıdır; bütün sınıf/tema/program sayımı veya zorunlu ders paydası değildir. `MAT.6.1.4` için yalnız çıktı/süreç sayfası incelendi; uygulama devamı ayrıca bekliyor. İlk üç çıktı için uygulama destekleri görüldü fakat bütün uygulanabilir koşullar kabul edilmiş sayılmadı.

## Kaynak uyumu ve yazım adayları

Matris, her süreç harfiyle ilişkilendirilmiş **17 proje mikrobeceri adayı**, **13 soru ailesi adayı**, **8 temsil adayı** içerir. Tam sayı cevabı bulmanın yanı sıra tahmin, gerekçe, model oluşturma, karşı örnek, hata teşhisi ve aktarımın koşulları ayrılır. Model satırı, varyant veya süreç harfi yeni ürün sorusu sayılmaz.

Planlanan ailelerin dağılımı:

- Çarpan/kat: tahmini sınama; model oluşturma; anlamlı kısa yol seçimi; doğrulama yöntemini koşullu aktarma -4 aile.
- Bölünebilme: tablodan ilişki çıkarma; birden çok koşulu ayırma; yanlış gerekçeyi düzeltme; sınırlı adaylarla sayı oluşturma -4 aile.
- Asal sayılar: gerekçeli sınıflama; asal çarpan temsillerini karşılaştırma/doğrulama -2 aile.
- Ortak kat/bölen: kat dizisini yorumlama; kalansız gruplama; bağlama uygun ilişkiyi ayırma -3 aile. Son grubun uygulama devamı ve ayrıntılı sınıf sınırları hâlâ bekliyor.

Temsiller; sayma modeli, yüzlük tablo, çarpan ağacı, sayı doğrusu, karşılaştırma tablosu, söz/sembol, verilen–istenen–strateji notları ve basamak tablosudur. Bunlar kaynaktan alınmış görseller veya çizimi hazır ürünler değildir. Her temsilde öğrenci açıklamasını, ipucu sonrasında açıklamayı, oluşturulan modeli ve yalnız cevap doğruluğunu farklı öğrenme kanıtları olarak planlarız; gerçek öğrenci kaydı veya analitik entegrasyon üretmedik.

### Korunan matematiksel ve pedagojik sınırlar

- Bölünebilme hedef kümesi tam olarak **2,3,4,5,6,9,10**. Bu dilim7 ile bölünebilme için kabul kanıtı değildir; bütün programda yasak olduğu da iddia edilmez.
- Sonlu çarpan listesi için pozitif tam sayı koşulu yazım güvenlik kontrolüdür. Sıfırın çarpan/kat konvansiyonları ayrıca incelenmelidir; kaynak genel ifadeleri sıfır için kontrolsüz genellenmez.
- 1 ne asal ne bileşiktir; asal çarpan ağacı en az2 için planlanır. Bu matematiksel doğruluk koruyucuları yeni resmî süreç kodu değildir.
- 5. sınıf geometrisi matrisindeki36birimkare üst sınırı bu6. sınıf sayı dilimine otomatik taşınmadı. Döndürülmüş aynı sayma modeli yeni çarpan çifti sayılmaz.
- Ortak kat/böleni yorumlama çıktısı, EKOK/EBOB formal algoritması veya bütün en küçük/en büyük problem tiplerinin kabulüyle eşitlenmedi.
- Kaynakta kesir sadeleştirmesinin bir uygulama bağlamında anılması, bağımsız bir kesir öğrenme çıktısı veya tam kesir kapsamı kanıtı değildir.
- Oran, kesirlerin bağımsız çıktıları, işçi–havuz–yaş problem aileleri bu fazda incelenmedi. Bu alanlar programda var veya yok diye hüküm verilmedi.
- Kaynak bir dikdörtgen bağlamına değinse de program örneği kopyalanmadı; uç değer optimizasyonunu ürün şartı yapmadık.

## Pratik bilgilerde anlamı koruma

Her çıktı için kendi sözlerimizle bir kısa yol notu planlandı; tamamı `derived_project_candidate`, uzman onayıfalse ve video/ses hazırlığıfalse durumundadır. Her notta uygulanabilir koşul, yolun gerekçesi, sonuç kontrolü ve yolun neyi garanti etmediği ayrı alanlardır.

Örneğin çarpan çifti modelinde çarpımın neden verilen toplamı temsil ettiği açıklanır. Bölünebilmede koşulların birlikte sağlanması ile tek bir koşulun sağlanması ayırt edilir. Asal çarpan ağacında yaprakların asallığı ve çarpımın başlangıç sayısına eşitliği kontrol edilir. Ortaklıkta sorulanın grup büyüklüğü, grup sayısı veya tekrar aralığı olması strateji seçiminden önce ayrılır. Bunlar hazır ders, özgün soru metni veya ampirik etkinliği kanıtlanmış sınav taktiği değildir.

İlerideki anlatım sırası adaydır: verilenlerin anlamı → sorulan nicelik → temsilin nedeni → koşullu kısa yol → işlemin gerekçesi → sonuç/birim kontrolü → uygun aktarım. Hız, yeterlik veya bilişsel/mesleki yönelim kanıtı sayılmaz.

## Test-first ve taze doğrulama

PDF, TDD, writing-good-tests ve verification yönergeleri bu işe başlamadan/ilgili işlemden önce tamamen okundu. Yeni test gerçek public JSON ve mevcut kaynak kayıtlarını okur; PDF indiriciyi veya renderer'ı mock etmez. Prose belgesini grep ederek "uyum" iddia etmez.

1. Matris henüz yokken yeni8 veri-contract testi çalıştırıldı: **0 PASS /8 FAIL**. Beklenen neden açık `grade6 source semantic candidate matrix is not prepared` assertion'ıydı; eksik dosya/import istisnası test başarısı sayılmadı.
2. Gözlenen kaynak/derlenmiş aday JSON oluşturulduktan sonra aynı komut: **8/8 PASS**,0fail/skip.
3. Aynı test tüketicisi bellekte13 kez yanlış veriyle çalıştırıldı. Her varyantın digest'i yeniden hesaplandı; gerçek dosyalar değiştirilmedi. Yanlış kaynak hash'i, uydurulmuş çıktı kodu, eksik süreç, mikrobeceriyi resmî sayma, yinelenen temsil ID'si, aileyi ürün sorusuna sayma, kaynak soru paydası uydurma, etkin program kabulünü yükseltme, ticari izin yükseltme, model aktarımı izni,5. sınıf limitini taşıma, özel cache yolu ve aşırı uzun sentetik metin **13/13 reddedildi**. Bunlar çocuk verisi, gerçek telif metni veya credential içermeyen kontrollü yanlış verilerdir.

```sh
node --test test/grade6_source_semantic_matrix.test.mjs
node --check test/grade6_source_semantic_matrix.test.mjs
```

Test; kaynağın gerçekten resmî olarak onaylandığını, semantik özetlerin uzman kabulünü, zorluk kalibrasyonunu veya ürün eğitim başarısını kanıtlamaz. Matris iç hash'i veri tutarlılığıdır; kimlik, imza veya editör yetkisi değildir.

## Sayımlar ve kalan altı boşluk

| Sayaç | Bu fazdaki dürüst değer |
|---|---|
| Yeni indirilen kaynak | 0 |
| Seçilen semantik PDF sayfası | 4 |
| Gözlenen kaynak çıktı/süreç | 4 /17 |
| Türetilmiş mikrobeceri/aile/temsil | 17 /13 /8 |
| Kaynak soru toplamı | Bilinmiyor (`null`) |
| Kopyalanmış kaynak sorusu | 0 |
| Ürün sorusu/konu anlatımı/yayın katkısı | 0 /0 /0 |
| Tam müfredat paydası/kapsam yüzdesi | Bilinmiyor (`null`) |
| Zorluk dağılımı/kalibrasyon | Belirlenmedi /bilinmiyor |
| Yayın/öğrenci/üretim hazırlığı | false /false /false |

Altı açık boşluk: etkin2026–2027 sınıf/ders kararı; `MAT.6.1.4` uygulama devamı; sınıfın kalan temalarının semantik paydası; kitap/etkinlik/soru arşivlerinde gerçek biçim ve sayı gözlemi; haklar ve uzman kabulü; zorluk kalibrasyonu ve görsel/okuma erişilebilirliği. Bu dört sayfanın görsel incelemesi yapıldığı için "görsel inceleme bekliyor" açık boşluğu artık eklenmedi; öğrenciye yönelik temsil/font/AX kabulü bununla kapanmadı.

DAMA yaşam döngüsü alanları ayrı kaldı: köken ve amaç kayıtlı, owner/steward ataması ve saklama kararıpending; expert/curriculum/rightsreviewpending; kullanımreference_only, ticari yeniden kullanımunverified, kaynak aktarımı/yayınıfalse. Model/provider, ağ, Drive, Git, Docker, CUA, credential veya gerçek öğrenci verisi kullanılmadı. Test sonuçları CMMI/SPICE sertifikasyonu ya da pedagojik kabul değildir.

Matris dosyası28.693byte,32KiB metadata bütçesi altında; SHA-256 `31edb054438bda76809910ed0fcc87227093954401caec48abcd7e04ef5722c8`. Final dosya hashleri root'a ayrıca gönderilecek. Root'un bağımsız kaynak ve kod incelemesi bu ajan kanıtından ayrı tutulmalıdır.

Kök ayrıca aynı PDF'yi taze SHA ile doğruladı; 67–70 için dört bounded raster üretti ve native görsel olarak inceledi. Raster toplam709.484byte, yalnız özel QA alanında; Git'e veya ayrı canlı içerik üretici/denetçi servise yükleme yapılmadı. Kaynak metin ve raster okuması bu Codex denetim oturumundadır; "model aktarımı0" iş ürünü alanı kaynakların üretim fabrikasının harici endpoint'lerine gönderilmediğini anlatır, bu oturumda hiçbir AI kaynak görmediği iddiası değildir. 7+5+2+3 harf bileşenleri, sayfa numaraları ve MAT.6.1.4 uygulama devamının seçili sayfalarda olmayışı eşleşti. Public JSON/test tekrar8/8 geçer; bu kök kaynak kontrolü sınıfın tamamına genellenmez.
