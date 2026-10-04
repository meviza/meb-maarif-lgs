# Fen Kitapçığı — Bağımsız İnceleme

Tarih: 4 Ekim 2026. Durum: Yeni taslakların teknik ve içerik incelemesi; uzman kabulü veya yayın onayı değildir.

## Kapsam ve yöntem

- 7 ve 8. sınıfın 18'er sorusu, bu soruları yazmayan ayrı ajan tarafından okundu ve seçeneklerden sonuç türetilerek anahtarları kontrol edildi. Her iki sınıfın bütün SVG'leri raster görüntüye dönüştürülüp açılarak incelendi.
- 6. sınıfın yazarı aynı incelemecidir; bu raporda 6. sınıf için **bağımsız yazarlık denetimi** iddia edilmiyor. Bu sınıfta ayrıca 18 bilimsel sonuç kontrolü, kaynak/şema testi ve bütün şekillerin raster incelemesi yapıldı.
- Güncel programın gerçek yerel PDF metni ile kapsam sınırları okundu. Fiziksel PDF sayfaları: TYMM 7. sınıf 147–148, 152, 156–162, 165–166, 169–172, 177, 181–183; 2018 programı 8. sınıf 49–56. 6. sınıf yazımında TYMM 112–145 aralığındaki ilgili ünite ve açıklamalar kullanıldı.
- Üslup/yoğunluk örneği olarak 2024 LGS sayısal kitapçığının fiziksel 19. sayfası görüntülendi. Kaynak soru metni, şekli veya cevap anahtarı yeni sorulara aktarılmadı.
- Kaynak kimlikleri: `tymm-current-fen-bilimleri`, `legacy-2018-fen-bilimleri`, `lgs-2024-numerical`. Kaynak PDF'nin indirilmiş olması müfredatın bütün anlamsal kapsamının işlendiği anlamına gelmez.

## Saptanan sorunlar ve yapılan düzeltmeler

| Bulgu | İşlem ve yeniden kontrol |
| --- | --- |
| İlk YF8-03 eski sorudaki aynı derinlik/farklı kap genişliği çekirdeğini tekrar ediyordu. | Soru değiştirildi: Sıvı türünün etkisini ayıran ikinci düzeneği tasarlama. Aynı derinlikte su/yağ karşılaştırması tek değişkeni değiştirir; doğru seçenek yağ/10 cm. Yeni şekil ve ölçüm etiketi açılarak kontrol edildi. |
| İlk YF8-07 eski periyodik sistem koordinatlarını yalnız harf değiştirerek kullanıyordu. | Soru değiştirildi: Al/Si/Ar sınıflandırmasındaki hatayı düzeltme. İlk 18 element gerçek konumlarında; Si yarı metal, Al metal, Ar soygaz. Kaynak kodu `F.8.4.1.2` olarak düzeltildi. |
| YF7-11 damıtma düzeneğinin açık gibi görünen balon boynu/buhar yolu. | Yazar boyun duvarlarını, tıpayı ve çıkış borusunu belirginleştirdi. Güncel raster yeniden açıldı. |
| YF7-06 görevine göre yüksek yazılmış Bloom etiketi. | Basit çözüm seçme görevi `apply` olarak düzeltildi. Etiket öğrenciye gösterilmiyor; ölçülmüş bilişsel gelişim sonucu değil. |
| YF7-09 gereksiz şekil boşluğu. | Tablo yüksekliği kısaltıldı; güncel raster kontrol edildi. |
| YF6-05 geçersiz SVG koordinatı; YF6-06 iletkeni kısa devre eden çizgi; YF6-15 gözlem sayısıyla uyuşmayan temsili filiz sayısı. | Sırasıyla sayısal koordinat testiyle hata yeniden üretildi ve giderildi; seri devrede malzemeyi atlayan bağlantı kaldırıldı; her kapta 10 tohum/9 filiz gösterildi. Bunlar yazar düzeltmeleridir, bağımsız pedagojik kabul değildir. |
| Aynı makinedeki farklı sınıf önizlemelerinin aynı çerez adını kullanması. | İki gerçek yerel HTTP sunucusunda ikinci sınıfın çerezi birinci sınıfta `401` üretti. Sunucu başına farklı çerez adı ve başlangıç içerik kopyası eklendi. İki sınıfın eşzamanlı çalışması ve sonradan değiştirilen giriş nesnesinin sunucuya sızmaması taze regresyon testiyle doğrulandı. |

### Son görsel takip

- YF8-02'de özdeş tuğlalar yatay 50×20 piksel, dikey 25×40 piksel çizilmişti. Uygulama sorumlusu dikey gösterimi 20×50, temas alanlarını 50/20 olarak düzeltti ve regresyon testi ekledi. Güncel gerçek SVG görüntüsü tekrar açıldı; ilgili test dâhil aşağıdaki testler yeniden geçti.
- YF8-15'in 150 birimlik SVG'sinde alt açıklama tabanı 149'da olduğundan harf alt uzantıları kırpılabiliyordu. Etiket tabanı 141'e alındı ve sınır regresyon testi eklendi. Son SVG hem tekil görüntü hem bütün sınıfın görüntüsünde tekrar açıldı; harfler sınırın içinde ve alt boşluk mevcut. Bu rapordaki görsel takipler kapatıldı.

## İçerik değerlendirmesi

### 7. sınıf

YF7-01–18'in anahtarlarında inceleme sırasında yanlış veya ikinci doğru seçenek saptanmadı. Kritik kontroller:

- Salıncak: Sabit uzunluklu ip, aşağı inerken azalan çekim potansiyel enerjisi ve artan kinetik enerji; sürtünme sınırı metinde.
- Kırılma: Havadan suya geçişte normale yaklaşan II ışını; I doğrusal devam, III normalden uzaklaşma, IV üst ortamda. Normal/ortam adları ayrılmış.
- Atom kimliği: Elementi belirleyen proton sayısı, TYMM açıklamasında yer alıyor. Şekilde çekirdekte 3 proton/4 nötron ve katmanlarda 3 elektron gösterilmiş.
- Sindirim: Mide → ince bağırsak → kalın bağırsak ve ince bağırsaktan emilim bağlantısı.
- Besin zinciri: Oklar besinden tüketiciye yöneliyor; kalıcı birikim varsayımı altında en üst tüketici şahin. Bu, genel bir besin ağı veya gerçek çevre ölçümü olarak sunulmuyor.
- Su kullanımı: K'de kişi başına 600/100 → 360/100, yani 6 → 3,6 L/gün; L'de 600/100 → 360/60, yani 6 → 6 L/gün. Toplam tüketim azalması tek başına bireysel tasarruf sayılmıyor.

### 8. sınıf

YF8-01–18'in güncel anahtarlarında inceleme sırasında yanlış veya ikinci doğru seçenek saptanmadı. Yukarıdaki görsel takip ayrıdır. Kritik kontroller:

- Mevsimler: 21 Aralık konumunda kuzey ekseni Güneş'ten uzağa eğik, K güneyde yaz/L kuzeyde kış.
- Basınç: Nicel basınç formülü kullanılmadı; tek değişkenli deney tasarımı. YF8-03'ün yeni görevi kaynak sınırlarıyla uyumlu.
- Kaldıraç: Destek yük tarafına yaklaşınca yük kolu kısalır/kuvvet kolu uzar. İşten kazanç iddiası yok.
- Saf madde ısınma grafiği: 2–5. dakikadaki sabit sıcaklık, çalışan ısıtıcı ve birlikte katı/sıvı gözlemi erimeyi destekliyor. Madde su diye tanımlanmadığından özel su ısı değerleri varsayılmadı; program dışı ısı formülü kullanılmadı.
- Kapalı şişe/balon: Gaz sistem içinde kaldığından toplam kütle 170 g; hacim artışı kütle artışı sayılmıyor.
- DNA: Yalnız A–T/G–C eşleşmesi; programın dışladığı nükleotit sayısı/eşlenme hesabı yok.
- Kalıtım: Bezelyede tek karakter `Aa × aa`; dört eş olasılıklı birleşmeden ikisi baskın fenotip, olasılık %50. Dört gerçek yavruda kesin iki sarı sonucu ileri sürülmüyor.
- Fotosentez: Aynı diğer koşullarda ışık kaynağına daha yakın bitkinin verilen göstergesi daha yüksek. Yapay ışıkta fotosentez olanaksız denmiyor; sonuç deney koşullarıyla sınırlı.

### Eski sorularla benzerlik kontrolü

Reddedilen eski bankanın Git'teki sürümü, çalışma ağacına geri alınmadan okunup yeni bankayla karşılaştırıldı. Yukarıdaki iki açık isim/sunum varyantı değiştirilmiştir. Yeni 6. sınıf setinde aynı örneğin yalnız sayı/isim değiştirilmiş tekrarı saptanmadı: Örneğin eski çimlenme sorusundaki su/hava kontrol çifti yerine ışık/karanlıktaki gözlemden sınırlı sonuç çıkarma, eski buzun kütle/hacim karşılaştırması yerine gölde sıvı su kalmasının canlılara etkisi soruluyor.

Aynı müfredattaki evrensel yasalar veya temel görev aileleri hâlâ ortaktır. Örneğin bezelye kalıtımı ve paslanmada yeni madde oluşması temel fen kazanımlarıdır; bunların ortak olması tek başına kopya sayılmaz. Bu inceleme dış dünyadaki tüm soru bankalarına karşı telif/benzerlik taraması değildir.

## Taze teknik doğrulama

Çalıştırılan test dosyaları:

```sh
node --test test/science_booklet_grade6.test.mjs test/science_booklet_grade7.test.mjs test/science_booklet_grade8.test.mjs test/science_booklet_server.test.mjs
```

Sonuç: **30 test geçti, 0 başarısız**. Bu sayı 30 ayrı soru veya 30 pedagojik kabul anlamına gelmez: 6. sınıf 20, 7. sınıf 2, 8. sınıf 4, gerçek yerel HTTP sunucusu 4 testtir. Soru testi içinde bütün 18 anahtar döngüyle kontrol edilir; manuel inceleme otomatik testten ayrı yapıldı.

Yerel, Git dışında görsel kanıtlar:

- `outputs/science-booklet-reset/grade6-native-diagrams-review.png`
- `outputs/science-booklet-reset/grade7-independent-native-review.png`
- `outputs/science-booklet-reset/grade8-independent-native-review.png`

Üç sınıfın son görüntülerinde kök SVG ve kendi görüntü sınırı korunarak raster üretildi; şekiller yalnız bir dış gruba açılıp taşma saklanmadı. Bunlar SVG raster incelemesidir; gerçek tablet/öğrenci oturumu kabulü değildir. Öğrenci sayfasının sayfa yoğunluğu, dokunmatik kullanım, sınıf kilidi ve çözüm açma akışı ayrı tarayıcı kanıtıyla değerlendirilmelidir.

## Kabul sınırı

Bu rapor yanlış cevap veya belirgin kapsam ihlali bulmayan bir teknik/içerik incelemesini kaydeder; hatasızlık garantisi değildir. Taslaklar alan öğretmeni ve pedagojik editör kabulü almış, zorluk/Bloom etiketleri öğrenci verisiyle kalibre edilmiş, MEB tarafından onaylanmış veya ticari yayına alınmış sayılmaz. Canlı Clef/JEV çağrısı ve gerçek öğrenci verisi bu incelemede kullanılmadı.
