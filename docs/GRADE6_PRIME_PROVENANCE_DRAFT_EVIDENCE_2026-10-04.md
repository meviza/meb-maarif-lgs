# 6. Sınıf Asal Seçim ve Kaynaklı Sıralama Taslağı

## Kapsam ve Sonuç

Bu dilim, konu anlatımı eklemek yerine **bir özgün editör soru taslağı ve bir yeni anlamsal aile** ekler. Beş başlangıç satırı, dört seçenek, çözüm adımları ve sınır açıklaması birlikte tek soru olarak sayılır. Tekrarlanan çağrı yeni stok oluşturmaz. Kabul edilmiş ve yayımlanmış ürün soru sayısı sıfırdır.

- Taslak: `grade6-prime-provenance-ledger-v1`.
- Aile: `prime_extrema_source_preserving_order`.
- API: `createGrade6PrimeProvenanceDraft(sourcePlannerInput)`.
- Denetçi: `verifyGrade6PrimeProvenanceDraft(candidate, sourcePlannerInput)`.
- Durum: `draft`, `editor_only`; öğrenci teslimi, yayımlama ve üretim hazır değil.

## Özgün Görev ve Matematik

Yeni sayılar, seçim kuralları ve gösterim yazar tarafından sabitlenmiştir. Kaynak soru metni, seçenekleri, sayısal vektörü, medya veya şifre-kutusu topolojisi kopyalanmamıştır. Arşiv benzerliği ve uzman özgünlük kabulü henüz geçilmemiştir.

| Kaynak satırı | Başlangıç sayısı | Farklı asal çarpanlar | Seçim kuralı | Seçilen değer |
| --- | ---: | --- | --- | ---: |
| A | 54 | 2, 3 | En büyük | 3 |
| B | 35 | 5, 7 | En küçük | 5 |
| C | 28 | 2, 7 | En büyük | 7 |
| D | 75 | 3, 5 | En küçük | 3 |
| E | 121 | 11 | En büyük | 11 |

Küçükten büyüğe sonuç, kaynak etiketleriyle `A:54→3, D:75→3, B:35→5, C:28→7, E:121→11` olur. Eşit değerler silinmez; eşitlikte başlangıç satır sırası korunur. Tek doğru seçenek `ledger-b` olur. Diğer seçenekler yanlış uç değer seçimi, eşit kayıt kaybı ve eşitlikte kaynak sıra ihlalini temsil eder.

Üretici asal üslerini kalandan ayırır ve kaynak indeksli sıralama yapar. Bağımsız matematik oracle'ı, 2–144 sonlu tamsayı alanındaki tüm asal adayları ve adayların bütün olası düzgün bölenlerini sınar; sıralama için ilk minimumu tekrar çıkarır. Beklenen matematik yanıtını belirlemek için üreticinin asal bulma yardımcısını, sıralama karşılaştırıcısını, çözümünü veya verilen cevap anahtarını kullanmaz. Toplam verifier, kapalı profil karşılaştırması için canonical kaydı ayrıca yeniden kurar; bu yeniden kurma üretici yardımcılarını çalıştırır. Verilen anahtar, bağımsız doğru seçenek sonucu ile karşılaştırılır. `eval`, rastgelelik, model çağrısı veya dış veri yoktur.

## Kaynak, Amaç ve Sınıf Bağı

Gerçek `createGrade6ReferenceAuthoringPlan` yeniden çalıştırılarak `g6-reference-authoring-18`, `track_prime_selection_then_order` görevi ve gerçek aday bağlantılar alınır. Kaynak ordinal 18, fiziksel PDF sayfa 16; kaynak `meb-archive-grade6-math-fascicle-unit1-hatay` olur. Aday çıktı `MAT.6.1.3`; mikroamaçlar `G6Q18-M1`, `G6Q18-M2`, `G6Q18-M3` olarak korunur.

`gradeCandidate: 6`, `activeAcademicYear: null`, `programVersion: null`, `officialOutcomeCode: null` korunmuştur. Kısmi aday bağlantı tam çıktı kapsamı değildir. Kaynak programın resmî kabulü, yeni taslağın uzman kabulü ve öğrenci yeterliği ilan edilmez. Bu dilimde yeni PDF bayt denetimi yapılmaz; `freshPdfByteChecks: 0` olur.

## Gerekçeli Çözüm ve Zorluk

Çözüm, verilenlerin anlamı → istenen hedef → yolun gerekçesi → ara sonuçların kaynak ve anlamı sırasını korur. Dört adım; asal alt kümeleri bulma, satır kuralını uygulama, kaynaklı sıralama ve bütün satırları denetlemedir. Koşullu kısa yol, ilk/son asal seçiminin ne zaman işe yaradığını ve neden 1 veya asal üs tekrarlarına taşınamayacağını açıklar. Sayı 1 için asal çarpan olmadığını belirten sınır açıklaması ek stok değildir.

Zorluk `hard`, yalnız `author_estimate_not_empirical`; `calibrated: false`, `calibration: null`, `targetDistribution: null` olur. Bu etiket kaynakların soru dağılımı veya öğrenci yaş normu olarak yorumlanmaz. Tanıma görevi, öğrencinin kendi çarpan listesini oluşturduğunu, açıklama ürettiğini, ustalık veya hız kazandığını göstermez.

## RED → GREEN ve Regresyon Kanıtı

TDD ve Writing Good Tests talimatları uygulama kodundan önce tamamen okunmuştur. Eksik modül içe aktarımı yakalanmış, tüketicide beklenen fonksiyon assertion ile aranmıştır.

- RED: `node --test test/grade6_prime_provenance_draft.test.mjs`; 14 testin tamamı `prime provenance authoring is missing` assertion nedeniyle başarısız, 0 geçiş; 346.987542 ms. Ayrı RED tekrarında süreç çıkışı 1 doğrulanmıştır. İçe aktarma veya sözdizimi kazası değildir.
- İlk GREEN: Aynı test komutu; 14/14 geçiş, başarısız/iptal/atlanan/todo sıfır, çıkış 0; 1173.618708 ms.
- Regresyon: Aşağıdaki altı dosyalı komut; 85/85 geçiş, başarısız/iptal/atlanan/todo sıfır, çıkış 0; 1617.849417 ms.

```sh
node --test test/grade6_prime_provenance_draft.test.mjs test/grade6_reference_authoring_plan.test.mjs test/grade6_factor_evidence_draft.test.mjs test/grade6_divisibility_classification_draft.test.mjs test/grade6_common_relations_draft.test.mjs test/grade6_number_lesson_review.test.mjs
```

Negatifler: Yeniden hashlenmiş yanlış anahtar, birden çok veya hiç doğru seçenek, yanlış/tekrarlı/bilinmeyen kaynak satırı, eşitlerde sıra değişimi, yanlış asal küme/uç değer, eksik sıra ve yanlış ara sonuç; bozuk kaynak/sınıf/program/mikroamaç; 0, 1, kesirli/negatif/aşırı büyük sayı; ekstra çağrı argümanı/üretim ayarı; getter, proxy, revoked proxy, döngü, seyrek dizi, özel prototype, gizli alan, boyut aşımı ve bozuk/null kapsayıcılar. Zararlı kancalar sıfır kez çalışmıştır. Hata tanısı kapalı ve temizdir; native exception veya kabul bayrağı taşınmaz.

## Hash, Boyut ve Değişmezlik

Gerçek API readback sonucu JSON 10.766 bayttır; çıktı bütçesi 65.536 bayttır. Nesneler derin dondurulur. Zararsız nesne anahtar sırası hash ve tanı sonucunu değiştirmez. SHA bütünlük bağıdır; kabul yetkisi değildir.

- Taslak `contentSha256`: `597aee55be5659e1fcd73e0ca7bc2904ca0500ee3f09804bcb5e0dc6f9d98016`.
- `authoredTaskSha256`: `a476509643fd5d62b951f2ee61c0b9257b57db2287b0e9177541494b31fb392a`.
- Plan SHA: `cb53aa3522b9e9003ecddef79f19461d465da12ba53f1336391bb15c0f1dff51`.
- Kaynak PDF kayıt SHA: `f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e`.
- Modül dosya SHA256: `b63b5606d80ddc5c4689f363142abcb719443a5db80a142fac3a452db0fcdbf3`.
- Test dosya SHA256: `6d98cb1a33f2aba37655541e247154968d392bcdfb99d2c63892dc3f00ebd1f0`.

## Teslim Sınırı

Yalnız yeni modül, dar test dosyası ve bu kanıt kaydı yazılmıştır. Mevcut şemalar, ders/review planı veya diğer üreticiler gevşetilmemiştir. CLI, banka renderer'ı ve gerçek tarayıcı görsel denetimi ayrı entegrasyon kapsamıdır; bu kayıt onların tamamlandığını söylemez.

Sahip, veri sorumlusu ve saklama kararı bekliyor; gerçek öğrenci/kurum verisi yoktur. Bütün altı kabul kapısı bekliyor. Ağ, sağlayıcı, indirme, görsel/ses/video üretimi, yeni DB, credential veya Git işlemi yapılmamıştır. Bu teknik kanıt CMMI/SPICE sertifikası veya pedagojik/psikometrik kabul değildir.
