# 6. Sınıf Sayı Dersi → Tek Örnek → Farklı Alıştırmalar

Tarih: 4 Ekim 2026. Başlangıç checkpoint'i: `fef7563`, `codex/k12-foundation-audit`.

## Gerçek Tüketici Paketi

`createGrade6NumberLessonReview({referencePlannerInput, commonSourceBindingInput})` tam bir argüman ve yalnız bu iki alanı kabul eder. Kaynak revizyonlarını mevcut sabit üreticilerle çözümler, üç mevcut bağımsız matematik doğrulayıcısını çalıştırır ve şu editör paketini oluşturur:

1. Özgün kısa **Sayıların özelliklerini kanıtla** dersi: çarpan–asal ayrımı, iki bölünebilme koşulu ve ortak ilişki–birim ayrımı. Üç kavramda koşullu pratik bilgi, gerekçe ve sınır vardır.
2. Tek mevcut gerekçeli örnek: sekiz kartlı bölünebilme sınıflaması. Sekiz kart sekiz soru sayılmaz.
3. İki mevcut, gerçekten farklı aileden alıştırma: çarpan kanıt panosu ve ortak-ilişki/birim eşleştirmesi. Örneğin sınıflama ailesi alıştırmaya tekrar alınmaz.

Bu bir soru üretim veya öğrenci sınavı API'si değildir. Yeni sorular **0**, yeniden kullanılan mevcut taslaklar **3**, kısa ders türevi **1**, örnek **1**, farklı alıştırma **2**, kabul/yayın **0**. Tekrarlı çağrı aynı revizyonları döndürür; stok artırmaz. Genel `mixed_practice_plan.mjs` ve rectangle ders/fabrika yolunun sınıf ve kapsam kısıtları değişmedi. Yalnız saf `apportionDifficultyQuota` yardımcı fonksiyonu mevcut biçimiyle yeniden kullanılır.

## Zorluk Ve Açık Eksikler

Sabit örnek hedef 10 alıştırma ve `10 / 30 / 30 / 30` profilidir; yaşa uygunluk kararı veya kaynakta ölçülmüş dağılım değildir. Kota `introductory:1 / intermediate:3 / advanced:3 / challenge:3` olur.

- Gerçek havuz iki farklı alıştırma sağlar: **2 / 10**, adet eksiği **8**.
- Örneğin `medium` etiketi yazar tahminidir ve alıştırma kotasına katılmaz.
- Çarpan ve ortak-ilişki taslaklarının zorluk etiketi yoktur. `level:null`, `basis:unassigned`, `calibration:null` korunur; sessizce kolay/orta/zor atanmaz.
- Alıştırmaların atanmış zorluk sayısı dört bantta da **0**; açık bant eksikleri **1 / 3 / 3 / 3**. Bu eksikler, adet eksiğiyle toplanıp yeni soru gereksinimi yapılmaz; ayrı boyutlardır.
- `selectionReady:false`, `difficultyProfileMet:false`, `quotasMet:false`, `selectionState:blocked_review_plan`.

## Kaynak, Kapsam Ve Açıklama Bağları

Görevlerin tam kanonik taslağı, kaynak SHA'sı, kaynak/brief/metaveri revizyonları, önerilen çıktılar ve mikroamaçları pakette ayrı kalır. Önerilen bağlar: sınıflama MAT.6.1.2; çarpan MAT.6.1.1/3; ortak ilişki MAT.6.1.4. Birleştirmek bunları tek kabul edilmiş program kapsamı yapmaz.

Üç görevde `gradeCandidate:6`; etkin yıl ve program sürümü `null`, resmî çıktı `null`, aktif program kabulü `false`. Mikroamaçlar resmî taksonomi ilan edilmez. Yeni PDF bayt kontrolü yoktur. Ortak ilişkide formal EBOB/EKOK öğretimi ve uç değer görevi açılmaz. DAMA sahip/steward/saklama durumu `pending`; gerçek öğrenen verisi yoktur.

Çalışılmış örnek, gerçek `createReasonedTeachingTrace` nesnesine bağlanır: istenen → verilenlerin anlamı → neden bu yol → dört gerekçeli karar → koşul/aktarımı kontrol. Bütün adımlar `interpret / text` olduğundan **numericStepsChecked:0**; bu aritmetik onay diye sunulmaz. Matematik kanıtı, üç mevcut bağımsız alan doğrulayıcısının ayrı `valid:true / localMathChecks:passed` sonucudur. Gösterim gizleme/reveal mekanizması gerçek öğrenci yetkisi değildir.

## Test-Önce Ve Regresyon Kanıtı

`test-driven-development` ve `writing-good-tests.md`, yeni API'nin gerçek kanonik kaynaklarla davranışını test etmeyi belirledi. Üretim kodundan önceki son RED koşusu: **11 beklenen FAIL / 0 PASS**, exit 1, skip 0; bütün hatalar `grade6 lesson-to-mixed-practice consumer is missing` arayüz assertion'ından geldi, import çökmesi değildi. İlk test koşusunda bir negatif testin guard'ı regex tarafından maskelenmişti; üretim kodundan önce guard düzeltildi ve RED tekrarlandı.

Minimal kod sonrası **11/11 PASS**, fail / cancel / skip / todo 0, exit 0. İlgili altı suite, ders paketiyle birlikte üç mevcut görev doğrulayıcısını, eski karma alıştırma kapısını ve ortak trace sözleşmesini çalıştırdı: **76/76 PASS**, fail / cancel / skip / todo 0, exit 0. Son tekrarın sayısı ve süresi teslim mesajında kaydedilir; önceki koşu `692.812417 ms` idi. `git diff --check` exit 0.

```sh
node --test test/grade6_number_lesson_review.test.mjs test/grade6_divisibility_classification_draft.test.mjs test/grade6_factor_evidence_draft.test.mjs test/grade6_common_relations_draft.test.mjs test/mixed_practice_plan.test.mjs test/reasoned_teaching_trace.test.mjs
```

Negatif kapsam: caller lesson/candidates/answer/provider/count/approval alanları, fazla/eksik argüman, proxy/revoked proxy/getter/cycle/sparse/büyük veri, kaynak SHA'sı, sınıf, önerilen çıktı ve program override reddi; caller hook sayısı 0. Dondurulmuş paket hash'i ders, üç kanonik revizyon ve eksik kota raporunu kapsar. Hash otorite veya kabul değildir.

## Küçük DTO Checkpoint'i

Kanonik JSON: **52.533 bayt**, sınır 131.072 bayt. Ders SHA256: `f7b4c3c4da229bb5e837b26760086fba32250856ad6348162c8c0847e2e1f1ea`. Paket SHA256: `2acd1bdfe85a84bbd8aa9add4cc77582f1a9874a7539b65e884de270043d2b8b`. Bunlar kaynak erişimi, pedagojik kabul veya yeni üretim kanıtı değildir.

Arayüz/CLI bağlantısı, native tarayıcı, fiziksel cihaz, ekran okuyucu ve bağımsız root kabulü ayrı kaydedilir. Bu çalışma yalnız bu modül, ilgili test ve bu raporu değiştirir; CLI/editor view başka yazım sahibindedir. Yeni sağlayıcı / Drive / credential / DB / indirme / ücretli iş / soru / ses / video / yayın yok. Süreç kanıtı, CMMI/SPICE sertifikası veya DAMA olgunluk derecesi değildir.
