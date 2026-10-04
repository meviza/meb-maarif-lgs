# Alt Sınıf Pilotu: Farklı Yazar İçerik İncelemesi

As-of: 4 Ekim 2026. İncelenen stok: `packages/school-portal/pilot_questions.mjs` içindeki **110** özgün/korunmuş editör taslağı, sınıf 1–7. Bu inceleme, farklı yazar tarafından soruların metni, seçenekleri, çözümleri ve sağlanan SVG/alternatif metinlerinin okunmasıdır; öğretmen/pedagog uzman kabulü, çocuklarla kullanılabilirlik deneyi veya tam müfredat doğrulaması değildir.

## Sonuç Ve Kanıt Sınırı

- Bütün **110 ID** okundu ve ayrı elle çözüm kontrolünden geçirildi; aşağıdaki liste her ID için beklenen cevabı gösterir. Kesin yanlış cevap anahtarı veya sunulan seçenekler arasında ikinci bir doğru cevap saptanmadı. Bu, sıfır hata garantisi değildir.
- Başlangıçta iki somut kusur bulundu: P1-04'te eksik kare koşulu ve cevabı söyleyen alternatif metin; P2-02'de yanlış çıkarma terimi. Root'un dar değişiklik izniyle bu iki satır düzeltildi. Düzeltmeleri yapan incelemeci, bu iki değişikliğin **bağımsız son kabulünü** kendi adına vermiyor; root/başka incelemeci taze kontrol etmelidir.
- İki kusur için test-önce: 10 bağımsız testin 8'i geçerken **2 RED**, 111.77225 ms. Minimal düzeltme sonrasında bağımsız ve mevcut yazar testleri birlikte **21/21 GREEN**, 141.680667 ms. Bunlar teknik regresyon kanıtıdır, pedagojik sertifika değildir.
- İncelenen başlangıç modülü SHA-256: `ae84e23182e21adfb5ac605b0c11fd1c7b4a3662e27b93cc93cb36c4d21c8d16`.
- Düzeltilmiş modül SHA-256: `0e7786eded3c69476304ea118d260cc4ad5a575607cb36c24b8b2005633f21de`.
- Bağımsız test SHA-256: `7fa03a0ab69011ec7ba0c20759e614611cd1ae8f47e67605d96d5c223295f9c0`.
- Provider/ağ/credential/gerçek öğrenci/kurum verisi/Git/yayın işlemi **0**. Bu dilimde yeni soru **0**; stok yine 110. 8. sınıfla birlikte 200 editör taslağı olması, 200 kabul edilmiş/yayımlanmış soru değildir.

## Düzeltilen Bulgular

| ID | Önceki Kusur | Yetkili Minimal Düzeltme | Anahtar |
| --- | --- | --- | --- |
| P1-04 | Dört eşit kenar ve dört köşe, metin tek başına ele alındığında kareyi eşkenar dörtgenden ayırmaz. Alternatif metin doğrudan “Kare” der. | Metne defter köşesiyle açıklanan dik köşe koşulu eklendi. Alternatif metin kenar/köşe özelliklerini anlatır, şeklin adını vermez. | Kare, Değişmedi |
| P2-02 | 40 − ? = 17 probleminde bilinmeyen çıkan; konu “Eksileni bulma” yazıyordu. | Konu “Çıkanı bulma” oldu; olay, seçenekler, aile ve açıklama değişmedi. | 23, Değişmedi |

## Yaş, Okuryazarlık Ve Gerçek Okul Kullanımı

1–2'nin **20/20** görevi `adultAssisted: true`, süresiz ve `draft`. Buna rağmen 1. sınıfta yalnız **2/10**, 2. sınıfta **0/10** görsel var; tüm görevler yönerge ve seçenekleri okumaya dayanıyor. Bu veri, çocuğun bağımsız okuryazarlık/zeka ölçümü değildir. Seslendirme/okuma-dinleme eşzamanlılığı, yetişkinin cevabı vermeden yönerge sunması, resimli/nesneli yanıt, dokunma alanları ve çocukla gözlem kanıtı henüz bu incelemeyle doğrulanmadı. 1. sınıf 13–18 sayıları gibi içerikler öğretim zamanı/hazırbulunuşluğa bağlıdır; yılın ilk günü için otomatik uygunluk çıkarılamaz.

İlkokulda çoktan seçmeli editör fixture'ı, gerçek okulda izinli ölçme biçimi değildir. [MEB pilot kaynak planındaki](SCHOOL_PILOT_MEB_BLUEPRINT_2026-10-04.md) resmî ilkokul oyun/gözlem/açık yanıt ve okul mevzuatı kapısı korunur. Ortak sınav, deneme, sıralama, resmî not ve otomatik çocuk profili açılmaz. Burada hukukî sonuç verilmedi.

## Kapsam, Etkin Program Ve Zorluk

| Sınıf | Fiilî Ana Ders Dağılımı | Soru | Görsel |
| --- | --- | ---: | ---: |
| 1 | Matematik 4, Türkçe 3, Hayat Bilgisi 3 | 10 | 2 |
| 2 | Matematik 3, Türkçe 3, Hayat Bilgisi 2, İngilizce 2 | 10 | 0 |
| 3 | Matematik 4, Türkçe 4, Fen 3, Hayat Bilgisi 2, İngilizce 2 | 15 | 1 |
| 4 | Matematik 4, Türkçe 3, Fen 3, Sosyal 2, İngilizce 2, DKAB 1 | 15 | 1 |
| 5 | Matematik 5, Türkçe 4, Fen 4, Sosyal 3, İngilizce 2, DKAB 2 | 20 | 0 |
| 6 | Matematik 5, Türkçe 4, Fen 4, Sosyal 3, İngilizce 2, DKAB 2 | 20 | 5 |
| 7 | Matematik 5, Türkçe 4, Fen 4, Sosyal 3, İngilizce 2, DKAB 2 | 20 | 5 |
| Toplam | 1–7 Editör Taslağı | 110 | 14 |

Kaynak planının 1/3/4 önerilen ders paylarından bazıları fiilî stoktan farklıdır; toplam kotalar aynıdır. Bu fark, kaynak planı ve ürün manifestinde açıklanmalı; öneri resmî MEB kotası değildir. Müfredatın tamamı, 36 hafta dağılımı veya tüm mikrobeceri/soru ailesi paydaları bu stokla tamamlanmış sayılmaz.

Genel sınıf-ders sınırları makul: 1'de İngilizce yok; 1–2'de Fen yok; 1–3'te Sosyal/DKAB yok. **Kesin çıktı/sayfa/program-yıl eşlemesi 110'un tamamında doğrulanmadı.** 6–7'den korunan sekiz fen sorusunun mevcut kaynak sayfa/kodları muhafaza edilir; bu inceleme bütün karar zincirini yeniden doğrulamadı. İngilizce okul profili, 4. sınıf Sosyal etkin kaynak sürümü ve ders özelindeki TYMM geçişleri pending kalır. Konu benzerliği, etkin program kabulü değildir.

Birçok görev bir adımlı işlem, doğrudan sözcük eşleme veya belirgin davranış seçimi içerir. Bunlar başlangıç dönütü için yararlı olabilir; üst düzey/seçici sınav zorluğu iddiasını taşımaz. Sekiz fen görevindeki zorluk/Bloom etiketleri yazar metadatasıdır; öğrenci ölçümü değildir. Diğer görevler için kalibre zorluk yok; %10/%30/%30/%30 karışımının sağlandığı da gösterilmedi.

## Cevap Örüntüsü Ve Açık İşler

Kaynak modülün cevap harfleri:

| Sınıf | Kaynak Sırasındaki Harfler |
| --- | --- |
| 1 | BCABACBCAB |
| 2 | BCABACBCAB |
| 3 | CABCABCABCABCAB |
| 4 | BCABCABCABCABCA |
| 5 | BCDABCDABCDABCDABCDA |
| 6 | BCDABCDABAABCCDABCDA |
| 7 | BCDABCDABBACACDABCDA |

3/4/5'te açık döngü, 1/2'de aynı dizi vardır. Bu, içerik anahtarının yanlışlığı değildir fakat sıralı tüketimde tahmin ipucu oluşturabilir. Root katalog tüketicisinde **deterministik seçenek permütasyonu**, cevap metni korunması ve tekrar okuma tutarlılığı için ayrı çalışma yapıyor; bu dosya onun geçişini doğrulamıyor veya katalog kodunu değiştirmiyor. Kaynak anahtarını karıştırıp açıklamayla uyumsuz hâle getirmek yerine tüketici dönüşümü test edilmelidir.

Kalan somut redaksiyon/UX önerileri:

- P2-01 “Onluk bozma ve toplama”: 24+18 çözümü onluk oluşturma/eldeyi kullanıyor; başlık bu matematiksel role göre sadeleştirilebilir. İki yetkili düzeltme dışında bu satır değiştirilmedi.
- P4-10 son ipucundaki açık/kapalı gündelik anlamı kafa karıştırabilir. “Açık anahtar yolu keser; kapalı anahtar kesintisiz yolu sağlar.” şeklinde öğretmen redaksiyonu uygundur. Anahtar doğru.
- P5-04, P6-03 ve benzeri geometri görevlerinde metin yeterli bilgi verse de üründe uygun ölçekli açı/şekil temsili eklenmesi yararlı. P5'te görsel sayısı sıfır; “Her fen/geometry sorusu görseldir” denemez.
- P7-09 grafik metinde anlatılıyor; veri 120→90 açıkça verildiğinden soru çözülebilir. Gerçek grafik gösterimi, metin-görsel tutarlılığı ve alternatif veri tablosu daha iyi deneyim sağlar.
- Çeldiriciler sıklıkla konu dışı veya aşırı (“Her”, “Hiç”, “Tamamen”) ifadelerle kolay eleniyor. Öğretmen gözlemi sonrasında yaşa uygun gerçek yanlış anlamalara göre geliştirilmelidir; bu küçük stoka kalite sertifikası verilmedi.

## 110 ID İçin Elle Çözüm Kontrol Listesi

Beklenen cevaplar kaynak yazar helper'ından hesaplanmadı. Sayısal görevler elle; dil, olay ve davranış görevleri verilen senaryo/seçeneklerle; sekiz fen görevi fiziksel/biolojik ilke ve SVG veri etiketleriyle ayrı kontrol edildi. Görsel SVG kaynak okuması vardır, **native ekran/glyph/çocuk testi yoktur**.

### 1. Sınıf: 10/10

| ID | Beklenen Cevap / Dayanak |
| --- | --- |
| P1-01 | 12; 7+5 |
| P1-02 | 5; 18−13 |
| P1-03 | 19; Birlikler 9>6>2 |
| P1-04 | Kare; Eşit Dört Kenar Ve Dik Köşeler, Düzeltildi |
| P1-05 | Çiçekleri Sulamak; Kuru Toprak Ve Su |
| P1-06 | Yemek Yemiştir; Yıkama Sonrasındaki Olay |
| P1-07 | Küçük; Aynı Boyut Özelliğinin Karşıtı |
| P1-08 | Öğretmene Haber; Kayma Riskinde Yetişkin Yardımı |
| P1-09 | Elleri Yıkamak; Yemek Öncesi Temizlik |
| P1-10 | Yaya Yeşilini Beklemek; Yetişkinle Yol Kontrolü |

### 2. Sınıf: 10/10

| ID | Beklenen Cevap / Dayanak |
| --- | --- |
| P2-01 | 42; 24+18 |
| P2-02 | 23; 40−17, Bilinmeyen Çıkan Başlığı Düzeltildi |
| P2-03 | 12; Üç Tane Dört |
| P2-04 | Birlikte Çalışmak İşi Kolaylaştırır; Yardımla İşin Bitmesi |
| P2-05 | Misafir; Konukla Aynı Bağlam |
| P2-06 | Rüzgâr Çıktığı İçin; Metindeki Önceki Değişim |
| P2-07 | 112; Türkiye Ortak Acil Çağrı |
| P2-08 | Mont Ve Kapalı Ayakkabı; Soğuk/Yağmur |
| P2-09 | Blue; Cümledeki Renk |
| P2-10 | Seven; Cümledeki Sayı Sözcüğü |

### 3. Sınıf: 15/15

| ID | Beklenen Cevap / Dayanak |
| --- | --- |
| P3-01 | 424; 246+178 |
| P3-02 | 9; 72÷8 |
| P3-03 | 9; 18'in İki Eş Grubu |
| P3-04 | 16 cm; 5+3+5+3 |
| P3-05 | Kalem; “İnce”nin Nitelediği Ad |
| P3-06 | Kitapların Yolculuğu; Yazımdan Okura Süreç |
| P3-07 | Soru İşareti; “Açık Mı” Soru |
| P3-08 | Tohumları Ekmek; İlk Olay |
| P3-09 | İtme; Araba Kişiden Uzaklaşıyor |
| P3-10 | El Feneri; Pilin Elektrik Enerjisi |
| P3-11 | Kulak; Sesin Algılanması |
| P3-12 | Güvenilen Yetişkine Haber; Adresi Paylaşmama |
| P3-13 | Güney; Kuzeyin Tersi |
| P3-14 | It Can Swim; Balığın Hareketi |
| P3-15 | Good Morning; Sabah Karşılaşması |

### 4. Sınıf: 15/15

| ID | Beklenen Cevap / Dayanak |
| --- | --- |
| P4-01 | 5/8; Sekizden Üç Boyanan Çıkarılır |
| P4-02 | 24; 168÷7 |
| P4-03 | 10.25; 09.35'e 50 Dakika |
| P4-04 | 24 cm²; 6×4 |
| P4-05 | Anlamak Sayfa Sayısından Önemli; Notla Anlamanın Artması |
| P4-06 | Kitabım Çantamda Kaldı; Bulunma Eki Bitişik |
| P4-07 | II–I–III; Yıkama, Soyma, Dilimleme |
| P4-08 | Yön Değişimi; Önceki/Sonraki Hareket |
| P4-09 | Süzme; Sıvı Geçer, Yaprak Kalır |
| P4-10 | Anahtarı Kapatmak; Kesintisiz Devre |
| P4-11 | Geçmiş Eşyalar; Müze Kaynağının Desteklediği Bilgi |
| P4-12 | Defter; Gereksinim İstekten Önce |
| P4-13 | Doctor; Hastanede Muayene |
| P4-14 | Swimming; Havuz/Su Hareketi |
| P4-15 | Onuru Koruyarak Yardım; Mahremiyet İsteği |

### 5. Sınıf: 20/20

| ID | Beklenen Cevap / Dayanak |
| --- | --- |
| P5-01 | 2,4; 2,40>2,35>2,09>2,04 |
| P5-02 | 1/2; 0,5=5/10 |
| P5-03 | 1/4; 25/100 |
| P5-04 | 55°; 90−35 |
| P5-05 | 19; Sabit +4 |
| P5-06 | Plan Zamanı Verimli Kılar; Unutma Sorununun Çözümü |
| P5-07 | Kuşları Ürkütmemek; Sessiz Yürümenin Amacı |
| P5-08 | Çalışmayla İlerleme; Yamuktan Düzgüne Geçiş |
| P5-09 | Gözlem→Karşılaştırma→Sonuç; Verilen Süreç |
| P5-10 | Tırtıklı Taban; Verilen Seçeneklerde Tutunma |
| P5-11 | Dolunay; Görünen Yüz Bütünü Aydınlık |
| P5-12 | Hücre Duvarı; Bitki/Hayvan Okul Modeli Farkı |
| P5-13 | Dinamometre; Newton/Kuvvet |
| P5-14 | Güncel MGM Tahmini; Uzmanlık Ve Güncellik |
| P5-15 | Batı; Kuzey Üstteyken Sol |
| P5-16 | Görev Paylaşımı; Ortak Proje |
| P5-17 | Maths; Sayı Problemleri Ve Şekiller |
| P5-18 | Cold; Sıfır Altı Sıcaklık |
| P5-19 | Şükür; Nimet İçin Allah'a Teşekkür |
| P5-20 | Herkese Söz Hakkı; Hakkaniyet |

### 6. Sınıf: 20/20

| ID | Beklenen Cevap / Dayanak |
| --- | --- |
| P6-01 | 30; 45÷3×2 |
| P6-02 | 3; 2+4+3=9, 243÷9=27 |
| P6-03 | 65°; 180−48−67 |
| P6-04 | 15 cm²; 6×5÷2 |
| P6-05 | 7; (4+6+8+10)÷4 |
| P6-06 | Gözlemleri Karşılaştırmak; Tek Güne Dayalı Yargı Değişiyor |
| P6-07 | Tatlı Sözler; Tat Alma Değil Hoşluk |
| P6-08 | Tekrar Yaparsa; Şarta Bağlı Hatırlama |
| P6-09 | Bütün Öğrenciler Aynı Türü Sever Söylenemez; İki Tercih |
| P6-10 | Yol>0, Yer Değiştirme=0; Tam Turda Aynı Konum |
| P6-11 | K Bakır/L Plastik; Sağlam Devrede İletken/Yalıtkan |
| P6-12 | L–K–M; Eşit 20 cm³, Kütle 16<20<24 g |
| P6-13 | Tozlaşma; Polen Başçıktan Tepeciğe |
| P6-14 | Vergiyle Ortak Hizmet Gideri; Yol/Park |
| P6-15 | Adayları Dinleme/Gizli Oy; Özgür Tercih |
| P6-16 | Kapanış Saati; Kontrol Edilebilir Bilgi |
| P6-17 | Always; Her Sabah, Hiç Atlamıyor |
| P6-18 | Train Faster; 120>80 |
| P6-19 | İftar; Gün Batımında Oruç Açma |
| P6-20 | Emaneti Koruyup Zamanında Verme; Söz/Hak |

### 7. Sınıf: 20/20

| ID | Beklenen Cevap / Dayanak |
| --- | --- |
| P7-01 | −1/4; −3/4+2/4 |
| P7-02 | 7; (25−4)÷3 |
| P7-03 | 160 TL; 200'ün %80'i |
| P7-04 | 192 TL; 120÷5×8 |
| P7-05 | 65°; Paralellerde Yöndeş Açı |
| P7-06 | Bakım Yapılmadığı İçin; Açık Neden |
| P7-07 | En Güzel Sokak; Kişisel Beğeni |
| P7-08 | Önceden Hazırlık; Yağmur Öncesi Çadır Tedbiri |
| P7-09 | Sayısal Destek; 120→90 Azalışı, Neden Kanıtı Değil |
| P7-10 | Yalnız II; Verilen Kuvvet Yönünde Yer Değiştirme |
| P7-11 | İkisinde De Toz Şeker; Sıcaklık Dışındaki Yüzey Farkını Kaldırma |
| P7-12 | İnce Bağırsak; Mide Sonrası Ve Emilim |
| P7-13 | K'de Kişi Başı Azalış; 6→3,6 L, L'de 6→6 L |
| P7-14 | Güvenilir Kaynaklarla Doğrulama; Paylaşım Sayısı Tek Kanıt Değil |
| P7-15 | Kültürel Etkileşim; Dil/Yemek/Sanat Karşılaşması |
| P7-16 | İş Olanakları Nüfusu Çeker; Verilen Olayın Sınırlı Çıkarımı |
| P7-17 | Ankara'ya Taşınma; 2015 Olayı |
| P7-18 | Gerekçeli Nazik Ret; Dentist Appointment |
| P7-19 | Tavaf; Kâbe Çevresinde Usulünce Dönme |
| P7-20 | Aynı Duruma Aynı Kural; Kayırmama |

Bu listenin tamamlığı, farklı yazarın **110 görev incelemesi** anlamındadır; içerik ve müfredat için evrensel uygunluk iddiası değildir. Sonraki kabul, iki değişikliğin bağımsız kontrolü, tüketici permütasyonunun cevap/anlatım tutarlılığı, yaşa uygun etkinlik ve öğretmen/pedagog değerlendirmesidir.
