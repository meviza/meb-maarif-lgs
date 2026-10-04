# 6. Sınıf: Eksik Çarpan Kanıtından Bütünü Kurma

## Teslim edilen küçük dilim

Bir özgün, dört seçenekli editör taslağı ve bağımsız matematik denetimi uygulandı. Yeni amaç, verilen bir sayının çarpanlarını yeniden listelemek değil; eksik iki çarpan kartından bilinmeyen sayıya geri gitmek, sonlu aralıkta başka aday kalmadığını göstermek ve kartlar dışındaki çiftleri eksiksiz seçmektir.

- Verilenler: 60–95 kapalı aralığında pozitif tam sayı; aynı sayının farklı çarpan çiftleri olan `3 × □` ve `□ × 14`. Küçük veya eşit çarpan soldadır.
- Bağımsız sonuç: Tek aday **84**; boşluklar **28** ve **6**.
- Bütün çiftler: `(1,84), (2,42), (3,28), (4,21), (6,14), (7,12)`.
- Verilen kartların dışındaki eksiksiz liste: `(1,84), (2,42), (4,21), (7,12)`; doğru seçenek **B**.
- A doğru sayıyla eksik liste sunar; C ve D aynı iki kartı sağlayamaz. Doğru sayıyı bulmak ile tam listeyi kanıtlamak ayrı denetlenir.
- Açıklamadaki 60–140 aktarım örneği **84 ve 126** adaylarını gösterir; tek yanıt üretilemeyeceğini öğretir. Bu örnek ikinci ürün sorusu değildir.

Taslak çağrısını tekrar etmek soru stoğunu artırmaz: **1 yeni taslak, 1 anlamsal aile, 0 yalnız parametre varyantı, 0 uzman kabulü, 0 yayımlanmış ürün sorusu**.

## Kaynak ve amaç bağı

MEB kaynaklı, önceden incelenmiş biçim verisi gerçek `createGrade6ReferenceAuthoringPlan` tüketicisi üzerinden yeniden bağlandı; kaynak gövdesi, sayı vektörü, seçenekler ve şekil topolojisi kopyalanmadı.

- Brief: `g6-reference-authoring-17`, “Eksik Bilgiden Bütünü Kur”.
- Kaynak: `meb-archive-grade6-math-fascicle-unit1-hatay`, ordinal **17**, fiziksel PDF sayfası **15**.
- Kaynak SHA-256: `f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e`.
- Biçim metaverisi SHA-256: `6388cb4b9200d9fd7be078716b292bd7c97e478f8be12a94a8dc779c8a3b75be`.
- Anlamsal metaveri SHA-256: `5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8`.
- Gerçek aday çıktı: **MAT.6.1.1**; mikroamaçlar **G6Q17-M1** ve **G6Q17-M2**. Resmî mikrobeceri taksonomisi ilan edilmez.
- `activeAcademicYear`, `programVersion`, `officialOutcomeCode` null; etkin program kabulü ve bütün çıktı kapsamı false. Bu yerel dilim yeni program kabulü yapmadı.
- Yeni PDF indirmesi veya yeni PDF bayt denetimi **0**; mevcut kayıtlı kaynak pinleri ve gerçek planner zinciri kullanıldı.

Kaynağın güvenilir birincil temel olması korunur. Buradaki yeni testler kendi özgün sorumuzun aday biricikliğini, matematik cevabını ve açıklama sadakatini sınar.

## Bağımsız denetim ve güvenli veri sınırı

Yazar, 14’ün katlarını diğer bilinen çarpanla eleyerek aday seçer; çarpan çiftlerini karekök sınırına kadar çıkarır. **Bağımsız çözüm oracle’ı yazarın çözümünü veya anahtarını kullanmaz**: Aralıktaki her tam sayıyı ve her sayı için 1’den o sayıya kadar bütün pozitif bölenleri tarar; iki farklı eksik kartın eşleşmesini ve kalan çiftlerin tamlığını yeniden kurar. Verifier ayrıca yazarın anahtarını ve çözümünü bu bağımsız sonuçla karşılaştırır.

Denetim yalnız matematik eşleşmesi değildir: Gerçek planner’dan kaynak/scope/amaç profilini yeniden kurar; kapalı yazar profilini, gerekçeli adımları, aktarım örneğini ve bütünlük özetlerini ayrı karşılaştırır. Doğru yeniden-hash bir yanlış cevap, yeni yetki veya yayın kabulü değildir.

Negatif testler yanlış anahtar, iki doğru seçenek, hiç doğru seçenek, boş/çok-adaylı aralık, eksik/tekrarlı/ters/yanlış ürünlü çift, değiştirilmiş çözüm/anlatım/aktarım, kaynak revizyonu ve sahte onay yükseltmesini kapsar. Kesirli/negatif/aşırı büyük aralık ve bozuk kart yapıları çözümden önce reddedilir. Proxy, getter, revoked proxy, döngü, seyrek dizi ve aşırı büyük metin kod çalıştırmadan kapalı tanı üretir; null iç kayıtlar yerel TypeError oluşturmaz.

Veri çıktısı donuktur ve 64 KiB bütçesinin altındadır. Sahip/steward/saklama kararları pending, gerçek öğrenen verisi false. DAMA için kaynak, sürüm, amaç, kalite durumu ve değişmez özet izlenebilir; bu belge DAMA, CMMI veya SPICE sertifikası değildir.

## Gerekçeli anlatım ve gösterim

DTO, `goal`, `givenMeaning`, `route`, `because`, koşullu kısa yol, `answerMeaning` ve aktarım alanlarını taşır. Beş adımda istenen ayrılır, 3 ile 14’ün neyi anlattığı söylenir, yolun nedeni açıklanır, her ara değer kaynaklandırılır ve kalan listenin tamlığı sınanır. Kısa yolun her aralıkta biriciklik sağlamadığı açıkça gösterilir; genel bir EKOK öğretimi iddiası yoktur.

Çift tablosu için deterministik etiketli veri hazırdır; bu sahiplik diliminde renderer, SVG, video, TTS veya canlı fabrika çağrısı yapılmadı. Renderer/CLI entegrasyonu ayrı iş sahibindedir. Renk/konum tek anlam taşımaz; erişilebilirlik henüz kabul edilmemiştir.

Güçlük **medium / author_estimate_not_empirical**: Geriye kurma ile tamlık denetimini birlikte gerektirdiği için yazar tahminidir. Kalibrasyon, yaş uygunluğu geçişi, gerçek öğrenci ustalığı veya psikometri kanıtı değildir. Bütün dış kabul kapıları pending; editör dışı kullanım ve yayın false.

## TDD ve gerçek çalıştırma kanıtı

Komutlar repo kökünden çalıştırıldı; dış sağlayıcı/mock yoktur.

1. `node --test test/grade6_inverse_factor_draft.test.mjs` — **RED: exit 1, 0/15 geçti**, süre 210.921583 ms. Beklenen `inverse-factor authoring consumer is missing` assertion; import çökmesi değildir. Üretim dosyası bundan sonra yazıldı.
2. Aynı komut — ilk uygulama denemesi **14/15 geçti, exit 1**. Yalnız test-fixture’da ordinal 17 yanlışlıkla dizi indeksi 16 sanılmıştı; gerçek metaveri ordinals `[13,14,15,16,17,18]` tanığı ve bağımsız inceleme ile kök neden doğrulandı. Test, ordinal 17 kaydını `find` ile seçerek düzeltildi; üretim kodu değiştirilmedi.
3. Aynı komut — **GREEN: exit 0, 15/15 geçti**, süre 1271.718625 ms; skip/cancel/todo **0**.
4. `node --test test/grade6_inverse_factor_draft.test.mjs test/grade6_factor_evidence_draft.test.mjs test/grade6_divisibility_classification_draft.test.mjs test/grade6_reference_authoring_plan.test.mjs` — **exit 0, 61/61 geçti**, süre 1910.837041 ms; skip/cancel/todo **0**.

## Freeze pinleri ve dürüst bakiye

- Modül `packages/content-factory/grade6_inverse_factor_draft.mjs`: `3ac4f0efe300475543ffb76f7061a7f4c94cc81dab2946d30b34a80ac50e1393`.
- Test `test/grade6_inverse_factor_draft.test.mjs`: `3c53646e197c10204535325c94568ee2dcc181d91356851432fe7263d8fc4b85`.
- Geniş kanonik kaynak girdisi plan SHA: `cb53aa3522b9e9003ecddef79f19461d465da12ba53f1336391bb15c0f1dff51`; taslak SHA: `24c16cb90038e375717528705dd449d80e12d499d3df6e4ceb4aaca3958841a8`.
- İki kaynak satırlı dar girdi plan SHA: `22ce2385db5bb25314999d4376499642bfe9372838850102c59e8c62056cbe1d`; taslak SHA: `95c10a9897e1bbe2bcc33c78d3c34273c76d7b5125336b45daf3e31078644475`; gerçek verify valid true.
- Aynı özgün görev SHA: `a8ddc15166c1c5473d017b78d9c938e5bf8fa478a1ace81fedd89b78c1c2b6fc`; her iki taslak **8.795 bayt**. Kaynak profilinin değişmesi ayrı soru yaratmaz; profiller birbirinin soyunu kabul etmez.

Bu dilimde provider/API/network/download/Drive/DB/SDK/model çağrısı **0**, görsel/ses/video üretimi **0**, yeni masraf **0**. Öğretmen incelemesi, arşiv benzerlik kontrolü, kalibrasyon, erişilebilirlik ve ürün yayını açık kalır. Yeni taslak sayı bakımından tamamlandı; bütün müfredat, 36.000 soru veya seri video üretimi tamamlandı denmez.
