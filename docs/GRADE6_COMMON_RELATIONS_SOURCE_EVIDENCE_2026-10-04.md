# 6. Sınıf Ortak İlişkiler Kaynak Kanıtı — 4 Ekim 2026

Durum: mevcut resmî programın sınırlı uygulama gözlemi, editör taslağı. Etkin program, uzman, hak veya ürün kabulü değildir. Yeni indirme, Drive, provider, ses/video üretimi, yayın ve öğrenci verisi yok.

## Gerçek kaynak ve sınır

Kaynak kimliği `tymm-current-ortaokul-matematik`; [resmî katalog](https://tymm.meb.gov.tr/ogretim-programlari/ders/ortaokul-matematik-dersi) ve [kayıtlı PDF URL'si](https://tymm.meb.gov.tr/assets/pdf/ortaokul-matematik-dersi_20260902_111111_630.pdf). Bu koşuda yeniden indirilmedi. Mevcut yerel PDF'de taze SHA-256 **75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734**, `pdfinfo` ile **3.916.466 bayt, 222 sayfa**, A4, şifresiz, JavaScript yok doğrulandı. PDF oluşturulma zamanı basım/yürürlük onayı değildir.

Fiziksel 71–73 sayfalar sınırlı `pdftotext -layout` ile okundu; aynı üç sayfanın 75 dpi PNG'leri yerel özel QA alanında üretildi ve üçünün tamamı native görüntüyle incelendi. Fiziksel ve basılı sayfa numaraları aynı: 71, 72, 73. PNG toplamı **251.904 bayt**, 1 MiB sınırının altında; ham sayfa ve özel QA yolları bu kamuya açık rapora eklenmedi. PDF becerisi metin çıkarımının tek başına görsel doğrulama sayılmamasını sağladı. Öğrenciye sunulacak medya veya tipografi kabulü yapılmadı.

| Fiziksel / basılı sayfa | Gerçek görülen bölüm | Bu kayıtta sayılan kapsam |
| --- | --- | --- |
| 71 / 71 | MAT.6.1.4 uygulama başlığı, ardından farklılaştırma/zenginleştirme | Ortak bölen/kat uygulama sınırları, temsil, açıklama ve izleme biçimleri |
| 72 / 72 | Zenginleştirme devamı, destekleme ve öğretmen yansıtmaları | Gerçek yaşam uygulaması ve tema çapındaki destek; zorunlu tek öğretim rotası değil |
| 73 / 73 | Sayılar ve Nicelikler (2) teması başlangıcı | Yalnız sonraki tema sınırı; yeni çıktı veya MAT.6.1.4 kapsamı sayılmadı |

## Pedagojik sınır

Sayfa 71'de bu öğrenme sürecinin **EBOB/EKOK kavramlarını tanıtmaması** açık. Bu dilimde en büyük/en küçük ortak ilişki veya biçimsel algoritma görevi kabul edilmiyor. İki sayının ortak bölenlerini/katlarını keşfetme; çizim, tablo ve sayı doğrusuyla ilişkiyi açıklama hedefleniyor. Ortak böleni yalnız 1 olan sayıların aralarında asal olması tartışılabiliyor; bunu iki sayının ayrı ayrı asal olmasıyla karıştırmamak türetilmiş doğruluk kontrolüdür, yeni resmî süreç kodu değildir.

Günlük bağlam seçimi, bireysel/birlikte inceleme, çoklu çözümü tartışma ve gerekçeli açıklama kaynakta yer alıyor. Açık uçlu, doğru-yanlış ve eşleştirme biçimleri izleme/geri bildirim için anılıyor; bunlardan testteki soru sayısı, dağılımı veya zorluk oranı çıkarılmadı. Sayfa 72'de görsel/işitsel/dijital destek ve uygun düzeyde olimpiyat referansı görülmesi bütün olimpiyat sorularının uygun/hakları açık olduğunu veya ürün videolarının hazır bulunduğunu kanıtlamaz.

Kaynak örneklerinin kökleri, sayıları, seçenekleri, cevapları ve görselleri aktarılmadı. Gözlem cümleleri kısa, kendi sözcüklerimizle özetlerdir. Pozitif tam sayı ve açık sonlu kat aralığı, özgün yazımda belirsizliği önlemek için **proje guard'larıdır**; resmî sayısal müfredat limiti değildir. Sonsuz kat listesinin tamamı istenmez. Kaynak aile/temsil kavramı resmî taksonomi olarak ilan edilmez.

## Yeni kayıt ve eski matris bağı

[Yeni küçük kayıt](../sources/grade6-common-relations-application-observations.json), [67–70 eski matrisini](../sources/grade6-source-semantic-candidate-matrix.json) değiştirmeden ona bağlanır. Önceki matrisin `contentSha256` değeri `88865918f2c6a10ae874b7ef63d7fcfb18ab096d4a13a40a9c095b0c8ccf5e98`; eski `G02` ve MAT.6.1.4 uygulama durumu eski dosyada hâlâ unresolved/pending'dir. Ek kayıt sadece yeni gözlenmiş 71/72 devamını kanıtlar; eski raporun geçmiş durumunu geriye dönük değiştirmez.

Yeni DTO'da mevcut **MAT.6.1.4** ve 67. sayfadaki **a, b, c** süreç etiketleri yeniden referans alınır; yeni resmî çıktı/süreç kodu **0**. **7 uygulama gözlemi, 6 türetilmiş mikroamaç, 2 türetilmiş aile, 3 kaynakta adı geçen temsil** vardır. Bunlar soru değildir: `items: []`, gözlenen kaynak soru maddesi **0**, `sourceQuestionTotal: null`, ürün sorusu/konu/yayın katkısı **0**. Tam müfredat ve resmî ders/çıktı paydaları, zorluk kalibrasyonu ve dağılımı bilinmiyor kalır.

Özgün taslak tüketicisi için kapalı giriş anlaşması:

```text
{ applicationObservations, semanticMatrix, sourceRecord }
```

`applicationObservations` yeni tam inert anlık görüntüdür; `semanticMatrix` eski tam matris; `sourceRecord` ana registry'deki gerçek tek program satırıdır. Bu üç alanın tek başına kullanıcı tarafından doldurulması otorite değildir. Tüketici sabit kaynak/program/metaveri revizyonunu bağımsız doğrulamalıdır. Sıralı-own-key kanonik tam anlık görüntü hash'leri:

- Yeni gözlem: `3c1ccf730931f9704bd95ce5137ee0154d6b05daea6eb12c35a70bfa23b89c38`.
- Eski matris: `5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8`.
- Gerçek program satırı: `610d60eeb3d8387517d2f74f71be171fa8663e3a177d42bd217b647ac6bdea19`.

Hash'ler bütünlük/revizyon bağıdır; kimlik doğrulama, hak veya semantik uzman onayı değildir. Yeni kayıt body `contentSha256` değeri, bu alan hariç insertion-order JSON için `6d8cdadc7e1e52980bbaf027e83a2226508e98d13b956169fc1e3d74c6ec0205`.

## TDD ve taze doğrulama

[Yeni test](../test/grade6_common_relations_application_observations.test.mjs), gerçek `createSourceScopeGapReport` tüketicisini kullanır. Uygulama özetlerini sahte kaynak soru ordinali yapmaz. Kaynak kod metnini grep eden veya insan raporunu kabul testi sayan test yok.

- İlk gözlenen RED: **0/9**, yeni MAT.6.1.4 gözlem kaydı yoktu; beklenen assert nedeni eksik artifact idi.
- Son dar GREEN: **10/10**, fail/skip **0**; 82,7 ms. Ek onuncu test mevcut inert copier'ın aşırı metin sınırını karakterize eder; yeni uygulama kodu yazılmadı.
- Bağlı taze suite: yeni gözlem + eski sınıf 6 matris + kaynak kapsamı, **39/39**, fail/skip **0**; 157,8 ms.
- Yeni test için `node --check`: exit **0**.
- Gerçek tüketici yeni kayıtla **1 bound kaynak / 0 madde / null toplam / 0 ürün katkısı** üretir. Eski ana registry'deki 42 kaynak kimliği artmaz; bu 42 kimlik ürünün ayrı 42 aday hücresiyle aynı kavram değildir.
- Stale/uydurma SHA ve bilinmeyen kaynak ID'si unbound olur. Yinelenen gözlem veya bozuk ordinal reddedilir; çağıranın sahte aktif/yayın/soru sayısı alanları kabul kapılarını açmaz.
- Ayrı salt-okunur deneme: **6 hostile vaka** (getter, revoked proxy, döngü, tekrar ordinal, symbol, function) reddedildi; **5 bozuk/stale revizyon** unbound kaldı; hook **0**. Bu denemede yeni dosya yazımı veya dış çağrı yok.

Bu testler metaveri kökeni/sayım/kapı sınırını kanıtlar; özetlerdeki pedagojik anlamı veya kaynak kullanım hakkını otomatik doğrulamaz. Formal EBOB/EKOK yasağı gerçek sayfa okumasıyla tespit edilmiştir; yeni özgün aile/cevap/görsel doğrulaması ayrı fazdır. TDD ve doğrulama becerileri, test sonucu ile kaynak kabulünün karıştırılmamasını yönlendirdi.

Dosya sınırı: yeni JSON **13.725 bayt**, 16 KiB altında; raw kaynak/özel yol/credential içermez. JSON dosya SHA `56797b561747c51eb5a4a36b2d5296b40f8d6d955942e3290d97ee5a2bf1cb71`; test SHA `0e269e30c77fca63f236b5a204ab9a67b4ab37ddfd42e65f0b89bcb35335ecd8`.

Etkin 2026–27 ders/sınıf kararı, okul türü, owner/steward/retention, bağımsız uzman, haklar ve erişilebilir ürün kabulü **pending**. `teacherApproved`, `officialMebApprovalClaim`, `publicationReady`, `learnerReady`, `productionReady` false; kaynak/model aktarımı false. DAMA izlenebilirlik katkısıdır; MEB, CMMI/SPICE veya pedagojik sertifika değildir. Eski matris/registry/ortak modül/CLI/Git değişmedi.
