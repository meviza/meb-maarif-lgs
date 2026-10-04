# 6–8. Sınıf Fen Pilotu: Bağımsız Teknik ve İçerik Audit Kaydı

Tarih: 4 Ekim 2026. Durum: Kısmi editör pilotunun bağımsız incelemesi; uzman kabulü, yayın veya tam yıllık kapsam kabulü değildir.

## Sonuç ve İnceleme Sınırı

Kaynağa bağlı 54 özgün taslak, 27 editoryal soru ailesi ve 24 ayrı teknik model görevi incelendi. Dokuz sınıf–dal hücresinin her birinde üç aile ve altı taslak vardır. 450 hedefinin 396 sorusu henüz hazırlanmadı; kabul edilen ve yayımlanmış ürün sorusu sayıları ayrı ayrı 0’dır. Fizik, kimya ve biyoloji bütünleşik Fen Bilimleri dersinin editoryal yönlendirmeleridir; üç ayrı resmî ders değildir.

Bağımsız okuma; 54 sorunun verilenlerini, istenenini, dört seçeneğini, çeldirici açıklamalarını, çözüm gerekçelerini ve model/görsel verisini kapsadı. Ardından 54 ayrı görev-talebi ve 54 ayrı tahmini yük gerekçesi okundu. Bu okumada kalan yanlış cevap anahtarı veya kanonik verilen–model–seçenek çelişkisi saptanmadı. Bu bulgu alan uzmanının yaş uygunluğu, bütün serbest metin ve görsel kabulü yerine geçmez; sıfır hata garantisi değildir.

Bu audit sırasında uygulama, kaynak JSON’u veya test değiştirilmedi; yalnız bu küçük rapor oluşturuldu. Tarayıcı çalıştırılmadı. Native masaüstü/mobil tanıkları ve root’un ekran incelemesi ayrı teslim kaydındadır; burada bağımsız native UI kabulü verilmez.

## İncelenen Revizyonlar

| Dosya | Taze SHA-256 |
| --- | --- |
| `sources/science-678-source-blueprint.json` | `853c1af79a90ce29206d75be10fd1c27bf7c27b6e856f68cdef353f67d9d89ac` |
| `packages/content-factory/science_678_authoring_seeds.mjs` | `c62b20acce3352b7f9bd42c1a1b575bae9714c586ef910699fb633aae5dfd7f3` |
| `test/science_678_authoring_seeds.test.mjs` | `ec32237a0871e72ad40abdffddc4f07f8782b9f7386c0a108f3bea1f23527524` |
| `packages/content-factory/science_678_oracle.mjs` | `a5895f3fc0a2b8862ba236a891326283df0b2c8140a90a61612a5c314088a157` |
| `packages/content-factory/science_678_factory.mjs` | `3ed42057231a020527137270a2eb6aba4f7358dcda8ac8ad5d8904adfb5f6e06` |
| `packages/content-factory/science_678_editor_view.mjs` | `5332b3618785b185fa418170b98c4c8572d5b0acf607c920575e9918b58de5ec` |
| `test/science_678_editor_view.test.mjs` | `88456bd0eb5bcd503f30fc193a8778cc68f99049c8c73edb6e93446c2c3d4160` |

Kaynak metadata’sının içerik-alanı digest’i `815e947c2a55b706b29102e0b15c4fe4690072079efc861c3962095f4b648d7b` olarak fabrikada sabitlenmiştir. Bu değer JSON dosyasının yukarıdaki byte SHA’sından farklı bir hesaplamadır; ikisi aynı hash diye sunulmaz. Kaynak sayfaları ve PDF revizyonlarının önceki bağımsız incelemesi [kaynak planı kaydında](SCIENCE_678_SOURCE_BLUEPRINT_2026-10-04.md) bulunur. Bu son audit sırasında PDF’ler yeniden indirilmedi veya yeniden render edilmedi.

## Taze Test ve Tüketici Kanıtı

Tam ilgili komut:

```sh
node --test test/science_678_oracle.test.mjs test/science_678_authoring_seeds.test.mjs test/science_678_factory.test.mjs test/science_678_editor_view.test.mjs test/science_jev_screen.test.mjs
```

Sonuç: **68 test / 68 PASS / 0 FAIL / 0 SKIP**, çıkış kodu 0; `duration_ms 913.830167`. Bu süre yerel test yürütmesinin gözlemidir; üretim veya model performans ölçümü değildir. Önceki bağımsız çalıştırmada özgül gerekçe eksikliği için 52 testten ikisi RED görülmüştü; dondurulan nihai notlar ve son iki küçük regresyon testiyle bu eksiklikler artık güncel suite’te GREEN’dir. Bütün değişikliklerin TDD geçmişini bu tek sonuçtan türetmiyoruz.

Gerçek `buildScience678Pilot()` ve `renderScience678EditorView()` tüketici çıktıları ayrıca kontrol edildi:

```json
{
  "status": "PASS",
  "authoredDrafts": 54,
  "reasoningFamilies": 27,
  "technicalModelTasks": 24,
  "targetDrafts": 450,
  "remainingDrafts": 396,
  "acceptedProductQuestions": 0,
  "publishedQuestions": 0,
  "sourceActualCodes": 132,
  "pilotReferencedCodes": 27,
  "notYetReferencedCodes": 105,
  "uniqueDemandNotes": 54,
  "uniqueLoadNotes": 54,
  "externalCalls": {"generator": 0, "jev": 0, "clef": 0, "tts": 0}
}
```

Son banka içerik digest’i `19f2dd31b595370d98429e2581e1788405899f1092497dafc5586cc8c71831f9`; serileştirilmiş banka 541.379 bayttır. HTML SHA-256 `13ebea1418ac95e8e3397f64db6063d709aba1556e6bcfca9bdf552aa42aba9f`; HTML 330.864 bayttır. Bu hash’ler kimlik, izin veya pedagojik otorite oluşturmaz.

## Yeniden Sınanan Düzeltmeler

- Yoğunluk V1’de zorla tamamen batırmayı kendiliğinden batma sanan açıklama kaldırılmıştır. D çeldiricisi artık yalnız verilen K–L yoğunluk karşılaştırmasının yapılabilirliğini yanlış yorumlar. Kütle sayısı verilmeden suya göre mutlak yoğunluk iddiası üretilmez.
- Yoğunluk V2’de yanlış K cevabının gerekçesi, eşit kütlede büyük hacmi büyük yoğunluk sanma hatasını açıklar. Kaptaki son su düzeyi tek başına katının hacmi yapılmaz.
- Mekanik iş V2’de “bütün kuvvetlerin işi aynıdır” biçimindeki ölçülmemiş nicelik iddiası yerine “bütün kuvvetler mekanik iş yapar” yanılgısı kullanılmıştır.
- Çimlenme V2’nin her düzeneğinde 12 tohum bulunduğu açıkça yazılıdır; bütün düzeneklere dağıtılan toplam 12 gibi okunmaz.
- Modifikasyon için çevre değişimine ek olarak gözlenen özellik değişimi gerekir. Eksik/yanlış `phenotypeChanged` veya tek başına çevre değişimi reddedilir. Görünüm değişmeden DNA mutasyonu mümkün kabul edilir; kalıtsal aktarılabilirlik gerçekleşmiş aktarım sayılmaz.
- Katı basıncı, eşit alan–farklı ağırlık ve eşit ağırlık–farklı alan durumlarını ayrı kontrollü karşılaştırmalarla sınar. Sıvı basıncında aynı sıvı ve yüzeyden derinlik koşulları korunur; farklı kap şekli zorunlu koşul yapılmaz.
- Kuvvet çiziminin mevcut sözleşmesi tam iki oku destekler. Dört oku kabul edip çizim dışına düşürme riski negatif testle kapalıdır.
- Yoğunluk görselinde iki örneğin ilk/son düzeyleri aynı gerçek ölçekle, örnek/durum/hacim verisinden çizilir. Yansıyan/kırılan cevap ışını ve doldurulmuş çaprazlama cevap hücreleri soru görseline eklenmez.
- Türkçe görünür etiketler ve `ve/ile` sonrasındaki sayı boşlukları kontrol edildi. “Görsel kap genişliği” yük notu, gerçek kap silueti olmayan verilen kartları için “Verilen kap genişliği” biçiminde düzeltilmiştir.
- Tall SVG’lerde eski yükseklik sıkıştırması yoktur; `min-width:520px` ve klavyeden erişilebilir kaydırma bölgesi vardır. Dar metrik sütunlarına `overflow-wrap:anywhere` eklendiği kod/regresyon testinden doğrulandı. Gerçek ekranda bbox ve viewport ölçümü bu audit’in değil ayrı native UI kanıtının kapsamıdır.

## Kaynak Paydası ve Henüz Temsil Edilmeyen Çıktılar

Payda, bu dosyadaki `outcomeGroups[].outcomeCodes` kümelerinin birleşimidir. Pilot payı, gerçek 54 pakette bulunan `outcomeCode` değerleridir. Çıktı koduna iki soru bağlanması o çıktının bütün mikrobecerilerinin ölçüldüğünü göstermez. Aşağıdaki “referanslanan” sayısı tam öğrenme çıktısı kapsamı veya öğrenci performansı değildir.

| Sınıf–Editoryal Dal | Kaynakta Kod | Pilotta Referanslanan Kod | Henüz Referanslanmayan Kod | Aile / Taslak |
| --- | ---: | ---: | ---: | ---: |
| 6. Fizik | 17 | 3 | 14 | 3 / 6 |
| 6. Kimya | 6 | 3 | 3 | 3 / 6 |
| 6. Biyoloji | 13 | 3 | 10 | 3 / 6 |
| 7. Fizik | 14 | 3 | 11 | 3 / 6 |
| 7. Kimya | 10 | 3 | 7 | 3 / 6 |
| 7. Biyoloji | 11 | 3 | 8 | 3 / 6 |
| 8. Fizik | 19 | 3 | 16 | 3 / 6 |
| 8. Kimya | 17 | 3 | 14 | 3 / 6 |
| 8. Biyoloji | 25 | 3 | 22 | 3 / 6 |
| Benzersiz toplam | 132 | 27 | 105 | 27 / 54 |

Bu metadata yönlendirmesinde kaynak kodları 6. sınıfta 36, 7. sınıfta 35, 8. sınıfta 61 benzersiz kayıt olarak bulunur. Pilotun kaynak kümesi dışında kalan kodu yoktur. Çapraz disiplinli kodlar birincil hücrede bir kez sayılmıştır.

Henüz pilotta referanslanmayan kodların açık dökümü:

- **6. Fizik:** `FB.6.1.1`, `FB.6.1.2`, `FB.6.1.3`, `FB.6.1.4`, `FB.6.2.2`, `FB.6.2.3`, `FB.6.4.1`, `FB.6.4.3`, `FB.6.4.4`, `FB.6.4.5`, `FB.6.4.6`, `FB.6.4.7`, `FB.6.6.1`, `FB.6.6.3`.
- **6. Kimya:** `FB.6.5.1`, `FB.6.5.4`, `FB.6.5.6`.
- **6. Biyoloji:** `FB.6.3.2`, `FB.6.3.4`, `FB.6.3.5`, `FB.6.3.6`, `FB.6.3.7`, `FB.6.3.8`, `FB.6.3.9`, `FB.6.7.2`, `FB.6.7.3`, `FB.6.7.4`.
- **7. Fizik:** `FB.7.1.1`, `FB.7.1.2`, `FB.7.1.3`, `FB.7.1.4`, `FB.7.1.5`, `FB.7.2.2`, `FB.7.4.2`, `FB.7.4.3`, `FB.7.6.1`, `FB.7.6.2`, `FB.7.6.3`.
- **7. Kimya:** `FB.7.5.1`, `FB.7.5.2`, `FB.7.5.3`, `FB.7.5.5`, `FB.7.5.6`, `FB.7.5.7`, `FB.7.5.8`.
- **7. Biyoloji:** `FB.7.3.2`, `FB.7.3.4`, `FB.7.3.5`, `FB.7.3.6`, `FB.7.3.7`, `FB.7.3.8`, `FB.7.3.9`, `FB.7.7.2`.
- **8. Fizik:** `F.8.1.1.1`, `F.8.1.2.1`, `F.8.1.2.2`, `F.8.3.1.3`, `F.8.5.1.2`, `F.8.7.1.1`, `F.8.7.1.2`, `F.8.7.1.3`, `F.8.7.2.1`, `F.8.7.2.2`, `F.8.7.3.1`, `F.8.7.3.2`, `F.8.7.3.3`, `F.8.7.3.4`, `F.8.7.3.5`, `F.8.7.3.6`.
- **8. Kimya:** `F.8.4.1.1`, `F.8.4.3.1`, `F.8.4.4.1`, `F.8.4.4.2`, `F.8.4.4.3`, `F.8.4.4.5`, `F.8.4.4.6`, `F.8.4.4.7`, `F.8.4.5.1`, `F.8.4.5.2`, `F.8.4.5.3`, `F.8.4.5.4`, `F.8.4.6.1`, `F.8.4.6.2`.
- **8. Biyoloji:** `F.8.2.1.1`, `F.8.2.1.2`, `F.8.2.1.3`, `F.8.2.2.1`, `F.8.2.2.3`, `F.8.2.3.1`, `F.8.2.3.2`, `F.8.2.4.1`, `F.8.2.5.1`, `F.8.2.5.2`, `F.8.2.5.3`, `F.8.6.1.1`, `F.8.6.2.1`, `F.8.6.2.3`, `F.8.6.3.1`, `F.8.6.3.2`, `F.8.6.3.3`, `F.8.6.4.1`, `F.8.6.4.2`, `F.8.6.4.3`, `F.8.6.4.4`, `F.8.6.4.5`.

## Bilinen Serbest Metin Sınırı: Gerçek Negatif Tanık

Bağımsız çözüm oracle’ı yazarın doğru harfini beklenen cevap olarak kullanmaz; sınırlı typed bilimsel iddiaları verilen model koşullarından türetir. Ancak seçeneklerin doğal dildeki her sözcüğünü yorumlamaz. Verifier teknik sonuçla yazar anahtarını karşılaştırır; teknik pass serbest metin kabulü değildir.

Gerçek negatif probda `SCI-G6-density_displacement-V1` paketinin C metni “L katısı kesin daha yoğundur.” yapıldı; typed claim K ve yazar anahtarı C sabit bırakıldı. Kanonik paket veya dosya değiştirilmedi. `verifyScience678Question` sonucu:

```json
{
  "valid": true,
  "freeTextSemanticReview": "pending",
  "expertAcceptance": "pending",
  "publicationReady": false
}
```

Bu `valid` yalnız kaynak/model/görsel teknik kontrolünü ifade eder. Tek başına üretim kabul kapısı yapılamaz. Kanonik 54 taslakta bu yanlış doğal metin bulunmaz; prob otomatik hattın serbest metin semantik/uzman incelemesine niçin ihtiyaç duyduğunu doğrudan gösterir. Özgünlük/kaynak benzerliği incelemesi de bu dilimde çalıştırılmadı.

## Kaynak Bağı, Ölçüm ve Kalan İşler

MEB/TTKB onaylı kaynaklar güvenilir birincil eğitim temelidir. Kaynak metadata’sı ve özgün ürün dönüşümünün çözüm/görsel denetimi farklı kanıt katmanlarıdır; kaynak onayı ürün için yeni MEB onayı olarak aktarılmaz.

6/7. sınıf TYMM 2026–27 uygulama grubu ve güncel katalog kodları kaynak planında eşlenmiştir. 8. sınıfta mevcut programın devamı ve 2018 `F.8.*` kodları kullanılır; `FB.*`/`F.*` birbirine sessizce çevrilmez. Kesin okul/ders yılı planı, yıllık ünite/hafta ağırlığı ve mikrobecerilerin tam performans kapsamı bu pilotta hâlâ bekler. Kaynakta listelenen dört 6/7. sınıf kitap cildi bu dilimde tam içerik/sayfa/etkinlik incelemesi görmüş sayılmaz. Seçili resmî arşiv biçimi gözlemleri, bütün 2018–2024 Fen arşivinin tamamı değildir.

Kaynak gövdeleri, şekilleri, seçenekleri ve cevap anahtarları ürüne yeniden dağıtılmıyor. Her kaynağın yeniden kullanım/atfetme koşulu ve varsa ticari lisans/izin kararı insan yönetişim kaydında izlenmelidir; açık erişim tek başına izin kararı diye işaretlenmez. Bu rapor yeni lisans kararı veya izin başvurusu yapmaz.

Bloom görev etiketlerinin dağılımı: Anlama 10, Uygulama 13, Çözümleme 31. Tahmini zorluk: Kolay 10, Orta 35, Zor 9; Çok zor 0. Bu dağılım kullanıcının her hücre için 5/15/15/15 hedefini karşılamaz. Görev-talebi ve tahmini yük gerekçeleri özgüllenmiştir; öğrenci verisi, psikometrik kalibrasyon, sezgisel/bilişsel gelişim veya zekâ türü ölçümü yapılmadı.

Fabrikanın iki varyant/aile sınırında 450 hedefi için en az 225 aile, mevcut 27’ye ek 198 aile gerekir. Bu sayı kaynakla doğrulanmış 198 hazır aile olduğu anlamına gelmez. Sonraki dilimde henüz referanslanmayan çıktılar, örneklenen çıktıların kalan mikrobecerileri ve farklı kanıt/temsil gerektiren aileler açıkça eşlenmelidir.

DAMA açısından kaynak revizyonu → sayfa/çıktı → aile → model/görsel → paket → teknik durum zinciri görünürdür. `owner`, `steward`, saklama ve uzman/yayın kararları hâlâ bekleyen yönetişim alanlarıdır. Testler ve bu kayıt CMMI/SPICE süreç kanıtına katkı sağlar; süreç sertifikası değildir.

Bu audit için yeni indirme, provider/model/TTS çağrısı, ücretli servis, Drive aktarımı, gerçek çocuk/kurum verisi, tarayıcı, SDK kurulumu ve Git işlemi: 0. Üretici çalıştırılmış, Clef çağrılmış, ses/video render edilmiş, öğrenciye verilmiş veya 450 soru bitmiş gibi bir sonuç çıkarılmaz. Taze doğrulama için `verification-before-completion` becerisi uygulandı.
