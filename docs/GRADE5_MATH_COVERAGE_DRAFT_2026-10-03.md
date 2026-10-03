# 5. sınıf matematik — kaynak bağlı kapsam taslağı

Durum: `authoring_draft`; alan uzmanı, okul yılı/sınıf uygulaması ve hak incelemesi bekliyor. Bu belge tam müfredat eşlemesi, MEB onayı veya tamamlanmış soru bankası değildir. Konu adının bulunması ya da bir sayısal örneğin doğru olması, öğrenme çıktısının bütünüyle karşılandığı anlamına gelmez.

## İncelenen kaynak ve takvim sınırı

Kayıt: `tymm-current-ortaokul-matematik`, [MEB program sayfası](https://tymm.meb.gov.tr/ogretim-programlari/ders/ortaokul-matematik-dersi). Yerel referans PDF SHA-256: `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`. Fiziksel PDF sayfası ve basılı sayfa numarası aşağıdaki atıflarda aynıdır. Kaynak `reference_only`, ticari yeniden kullanım kanıtı `unverified`; PDF veya sorular ürün içeriğine kopyalanmaz.

Sayfa 10 görsel ve metin incelemesinde **23 çıktı, altı tema, yedi öğretim bloğu** görülür. Sayılar teması iki blokta işlenir. Toplam **180 ders saati**, bunun içinde **sekiz okul temelli planlama saati** vardır. Bu tablo resmî 36 haftalık takvim değildir. Haftalık dağıtım; ilgili okul yılı, resmî tatiller ve okulun yıllık planıyla ayrı sürümlenmelidir. Sayfa 11'deki 6. sınıf toplamı 24 çıktıdır; 5. sınıf çıktıları diğer sınıflara topluca taşınmaz.

| İşleniş bloğu | Çıktı aralığı | Çıktı / saat | Özgün yazım için ayrılacak beceri aileleri |
| --- | --- | --- | --- |
| Geometrik şekiller | `MAT.5.3.1–7` | 7 / 38 | Araçla oluşturma, açı ölçme, özellik gerekçesi ve karşı örnek; yalnız şekil adını seçmekle sınırlı değil |
| Sayılar (ilk bölüm) | `MAT.5.1.1–2` | 2 / 28 | Basamak yapısı, verilen–istenen ayrımı, işlem seçimi ve sonuç kontrolü |
| Geometrik nicelikler | `MAT.5.4.1–4` | 4 / 20 | Ters çevre görevi, birim kareyle alan, iki ayrı sabitlik karşılaştırması, bağlama uygun strateji |
| Sayılar (ikinci bölüm) | `MAT.5.1.3–4` | 2 / 33 | Kesir/ondalık/yüzde gösterimlerini ilişkilendirme, karşılaştırmayı gerekçelendirme |
| İstatistik | `MAT.5.5.1–2` | 2 / 24 | Kategorik veriyle araştırma tasarımı ve veri destekli iddia/yorum eleştirisi |
| Cebirsel düşünme | `MAT.5.2.1–4` | 4 / 20 | Eşitliği koruma, işlem sırasını açıklama, örüntü kuralı ve algoritma adımlarını izleme |
| Olasılığa giriş | `MAT.5.6.1–2` | 2 / 9 | Olasılık yelpazesi, öznel yargıyı gerekçeyle karşılaştırma |

Diğer tema aileleri ilk yazım adaylarıdır; süreç bileşeni ve sayfa eşlemesi tamamlanmadan kanonik kapsam hücresi veya üretim kotası olarak kabul edilmez.

## Çevre–alan pilotunda gerçek sınır

Sayfa 51–54 ayrı incelendi; sayfa 53 görsel olarak da kontrol edildi. Mevcut altı dikdörtgen ailesi ve ayrı kavram dersi bu temanın **kısmi örnekleridir**:

- `MAT.5.4.1`: verilen çevreye uygun doğal sayı kenarlı farklı dikdörtgenleri kurma/açıklama da gerekir. Tek çevre hesabı tam kapsam değildir.
- `MAT.5.4.2`: alanı birim kare sayısından ilişkiye taşıyan gerekçe gerekir. Yalnız formüle sayı koyma yeterli değildir. Bu öğrenme yaşantısında alan birimi dönüştürme çalışmaları yapılmaz; ön koşul uzunluk bilgisi ile yeni alan hedefi karıştırılmaz.
- `MAT.5.4.3`: **aynı alan–farklı çevre** ve **aynı çevre–farklı alan** ayrı ailelerdir. Doğal sayı kenarlar ve ilgili karşılaştırma çizimlerinde en fazla 36 birim kare alan sınırı vardır. Mevcut 24 alanlı iki model yalnız ilk kolu örnekler; ikinci kol eksiktir.
- `MAT.5.4.4`: bağlamı temsil etme, yol seçme, kontrol, alternatif yol ve aktarım koşullarını açıklama gerekir. Bir doğru seçenek, bütün süreç bileşenlerinin ölçüldüğü anlamına gelmez.

Bahçe pilotundaki kesirle çarpma, bu 5. sınıf teması için yeni hedef diye işaretlenmez. `MAT.6.1.7` için sayfa 74 ve 77–79 incelemesinde aday bağlantı vardır; tek doğal sayı × kesir problemi 6. sınıfın bütün işlem/problem kapsamını karşılamaz. Nihai sınıf/çıktı yerleşimini alan uzmanı onaylamalıdır.

## Kapsam kaydı ve üretim kabulü

Her yazım hücresinde kaynak kimliği/hash'i, PDF sayfası, çıktı kodu, kendi sözlerimizle mikrobeceri tanımı, süreç bileşeni, ön koşul/hedef ayrımı, sınırlar, soru ailesi ve çözüm grafiği, temsil, cevap biçimi, amaç ve zorluk kalibrasyon durumu bulunmalı. Sadece sayıları değiştirmek yeni mikrobeceri ya da yeni aile sayılmaz.

Mevcut blueprint'e bu kayıt kontrollü olarak projekte edilir. Opaque `microSkillId` veya haftada en az bir hücre bulunması, içerik kapsamını tek başına kanıtlamaz. `canonical_verified`, `expert_approved` ve `published` durumları; kaynak/hak, etkin program, alan/dil/yaş ve kalite kapıları tamamlanmadan atanmaz.

Bir sonraki kabul: geometrik nicelikler için sayfa–çıktı–süreç matrisinin uzmanla kesinleşmesi; eksik ikinci karşılaştırma ailesi ve açık uçlu/oluşturma biçimlerinin bağımsız çözümle doğrulanması. 36.000 hedefi bundan sonra hücre bazlı dağıtılır; mevcut 12 taslak yıllık kapsam sayılmaz.
