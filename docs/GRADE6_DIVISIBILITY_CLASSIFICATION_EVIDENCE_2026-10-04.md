# 6. Sınıf Bölünebilme Sınıflaması — 4 Ekim 2026

Durum: kaynak-bağlı özgün editör taslağı ve bağımsız matematik denetimi uygulandı. Bir görev, sekiz kart ve dört üyelik kategorisi vardır; sekiz yeni soru veya dört ayrı aile değildir. Normal fabrika CLI ve editör HTML entegrasyonu ayrı root dilimidir; bu belgenin ilk sürümü bunları tamamlandı saymaz.

## Gerçek Kaynak Ve Yeni Eğitim Amacı

MEB kaynaklarını güvenilir birincil eğitim temeli kabul ediyoruz. Bu dilim, kaynakların pedagojik denetimini tekrarlamaz; gözlenen kaynak biçiminden yararlanarak bizim yeni görevimizin amaç, matematik ve anlatım tutarlılığını denetler.

Mevcut `createGrade6ReferenceAuthoringPlan` gerçek, pinli kaynak metaverisini tüketir. `g6-reference-authoring-13` briefi `MAT.6.1.2` için kısmi eşleme adayıdır. Kaynak `meb-archive-grade6-math-fascicle-unit1-hatay`, gözlem ordinal 13, fiziksel sayfa 12; SHA-256 `f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e`. Program semantik matrisi ayrıca bu mevcut planın pinli zincirindedir. Yeni PDF indirme, web kontrolü veya kaynak byte incelemesi yapılmadı.

Yeni görev, gözlenen kaynağın 4×4 renkli matrisini, soru metnini, seçeneklerini veya görselini kullanmaz. Kendi yazımımızda sekiz metinli kart, dört anlamlı kategori ve iki ayrı karar vardır. Bu yapısal değişiklik arşiv benzerlik taramasının tamamlandığı anlamına gelmez.

| Katman | Yeni görevin dar eşlemesi |
| --- | --- |
| Sınıf–ders | 6. sınıf Matematik editör adayı |
| Çıktı | `MAT.6.1.2` kısmi içerik bağı; tam çıktı kapsamı değil |
| Mikro amaç | `G6Q13-M1` ilk kural, `G6Q13-M2` ikinci kural, `G6Q13-M3` ikisinin birlikte sağlanması |
| Aile | `joint_divisibility_card_classification` |
| Temsil | `text_labelled_membership_cards/v1`; `criteria_sorting_cards` briefine bağlı |
| Ölçüm sınırı | Verilmiş kartları sınıflama görevi; henüz öğrenci yanıtı veya açıklama rubriği yok |
| Zorluk | Orta, yazarın geçici tahmini; ampirik kalibrasyon ve test dağılımı yok |

## İşlemden Önce Anlam Ve Neden

Anlatım sırası: istenen iki koşulu ayırma → karttaki sayının neyi temsil ettiğini açıklama → iki ayrı kararı verme → birleşimine uygun grubu seçme → kartları eksiksiz ve yalnız birer kez yerleştirme.

Pratik not koşulludur: 2 ile bölünebilme için son basamak, 3 için rakamlar toplamı kontrol edilir. İkinci kararı birinciden tahmin etmeyiz. Örneğin 24, son basamağı 4 ve rakamları toplamı 6 olduğundan iki koşulu da sağlar. 14, son basamağı 4 olmasına rağmen toplamı 5 olduğu için ortak gruba girmez. Bu kurallar diğer bölenlere otomatik taşınmaz.

| Kategori | Kendi yazımımızdaki sayılar |
| --- | --- |
| Yalnız 2 ile | 14, 32 |
| Yalnız 3 ile | 21, 33 |
| 2 ve 3 ile | 24, 42 |
| İkisiyle de değil | 25, 47 |

Her kart iki karar ve ayrı gerekçe taşır. Renk tek anlam kanalı değildir. Matematiksel DTO henüz çizilmiş görsel, tamamlanmış AX incelemesi, öğrenci uygulaması, ses veya video değildir.

## Gerçek Public API Ve Bağımsız Oracle

`packages/content-factory/grade6_divisibility_classification_draft.mjs`:

- `createGrade6DivisibilityClassificationDraft(plannerInput)`: tek değişmez editör taslağı.
- `verifyGrade6DivisibilityClassificationDraft(candidate, plannerInput)`: gerçek kaynak-plan bağını yeniden çözer; her kartı ve cevap kapsamını bağımsız hesaplar.

Authoring, sayının kendisi üzerinde `%2` ve `%3` kalanı kullanır. Bağımsız çözüm oracle’ı yazarın çözümünü veya cevap anahtarını kullanmaz: ondalık son basamağın çiftliğini ve rakamlar toplamının 3 ile bölünebilmesini ayrı yöntemle sınar. Verifier ayrıca cevap anahtarını bu bağımsız sonuçla karşılaştırır. Ortak/tek/hiç üyeliği, bütün kartların tam ve bir kez bulunması, yanıt anahtarı, ara kararlar, gerekçeli profil ve içerik bütünlüğü ayrı kontrol edilir. Yeniden hashlenmiş yanlış yanıt hâlâ reddedilir. Kart/yanıt sunum sırasının değişmesi matematiksel grubu değiştirmez.

Mevcut dar `plannerInput` fixtureleri: `grade6-question-form-observations`, `grade6-source-semantic-candidate-matrix`, `meb-reference-registry`, `education-reference-supplement`. Kaynak/planner dosyaları değiştirilmedi. Yeni bir sözleşme veya dış servis kurmak yerine mevcut plan gerçek tüketildi.

## TDD Ve Taze Kanıt

TDD ve writing-good-tests becerileri uygulama öncesinde tamamen okundu. Tüketici testleri public API ve gerçek mevcut fixtureleri kullanır; mock, prose grep veya kendi sonucunu beklenti yapan mirror oracle yoktur. Beklenen dört grup bağımsız elde hesaplanan literal veridir.

1. İlk 12 test, module yokken çalıştırıldı: **0 PASS /12 FAIL**, exit 1, 69.597875 ms. Beklenen `divisibility classification authoring is missing` assertion'ı görüldü; eksik import istisnası başarı sayılmadı.
2. İlk uygulama sonrası: **12/12 PASS**, exit 0, 720.176 ms.
3. Yeni malformed nested-record negatif testi önce **12 PASS /1 FAIL**, exit 1, 366.243833 ms verdi. `solution.cardReasons[0] = null`, shape kontrolü öncesi `row.cardId` erişiminde TypeError üretti. Systematic-debugging ve root-cause-tracing yönergeleriyle aynı tek test yeniden üretildi; row kapalı-şekil kontrolü, map erişiminden önce eklendi. Geniş catch ile hata gizlenmedi, public DTO değiştirilmedi.
4. Son yeni suite: **13/13 PASS**, fail/skip/cancel/todo 0, exit 0, 823.437167 ms.
5. Mevcut planner ve factor taslağı regresyonlarıyla: **46/46 PASS**, fail/skip/cancel/todo 0, exit 0, 1429.452833 ms. Bu dar suite kanıtıdır; bütün repo suite'i bu ajan tarafından koşulmadı.

```sh
node --test test/grade6_divisibility_classification_draft.test.mjs
node --test test/grade6_reference_authoring_plan.test.mjs test/grade6_factor_evidence_draft.test.mjs test/grade6_divisibility_classification_draft.test.mjs
node --check packages/content-factory/grade6_divisibility_classification_draft.mjs
node --check test/grade6_divisibility_classification_draft.test.mjs
```

İki syntax komutu ve `git diff --check` exit 0. Negatifler: tek-kural/yanlış ortaklık, eksik/tekrar/yabancı kart, yanlış çözüm ara kararı, sıfır/negatif/kesir/sınır dışı sayı, aynı kart kimliği, yanlış bölen/kategori, kaynak/semantik pin değişikliği, geçersiz gerekçe, sahte kalibrasyon/kapsam/yayın/öğrenci kanıtı, getter/proxy/cycle/aşırı metin ve null nested kayıt.

## Sayaçlar Ve Kalan Bağlantılar

- Yeni özgün editör taslağı 1; anlamsal aile 1; yalnız sayısal varyant 0; uzman kabulü 0; yayın 0.
- Provider/ağ/indirme/Clef/ses/video/Drive/SDK çağrısı 0. Yeni maliyet veya gerçek okul/çocuk verisi yok.
- Taslak JSON 9.984 byte, 64 KiB sınırı altında. Content SHA-256 `ef2a2c71338df6037f8ee794599266a0c1999aea43a98a0e22f04d82fb179df5`.
- Tekrarlı çağrı aynı taslağı verir; yeni stok sayılmaz. Yaşam döngüsünde amaç ve kaynak zinciri bağlı; owner/steward/saklama atamaları pending.
- En küçük consumer yolu: mevcut `tools/grade6_reference_authoring_plan.mjs` içine doğrulamadan sonra `--divisibility-draft` JSON ve `--divisibility-html` editör render. Bu bağlantılar, yerel görsel/klavye kontrolü ve root bağımsız kabulü ayrı kanıtlanmalıdır.
- Tam program/soru paydası ve kapsam yüzdesi bu tek görevden hesaplanmaz. Gerçek öğrenci yanıtı, ölçüm rubriği, deneysel zorluk, sesli video ve yayımlanmış okul teslimi henüz yoktur. Test-first ve tamamlanma doğrulaması bu durum ayrımlarını korudu; CMMI/SPICE sertifikası iddia edilmez.

Bu ajan yalnız yeni module, testi ve bu raporu yazdı; Git commit/push, kaynak metaverisi veya mevcut uygulama dosyası değişikliği yapmadı. Root renderer/CLI/audit işi bu sahiplik kapsamının dışındadır.
