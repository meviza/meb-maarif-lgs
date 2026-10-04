# Yerel altyazı sunucusu — kapalı kaynak presetleri, 4 Ekim 2026

Durum: mevcut gerçek loopback editör sunucusuna construction-time dört kapalı mevcut kaynak seçimi bağlandı. Yeni test önce **0/12 RED**, minimal uygulama sonrası **12/12 GREEN**. Taze mevcut HTTP ve saf caption/renderer/denetleyici regresyonlarıyla **118/118 PASS**, 0 fail/skip; syntax exit 0. Bu dilim yeni soru stoku, kabul edilmiş/yayımlanmış içerik veya yeni comparison trace üretmez. Root CLI ve gerçek tarayıcı QA ayrı kapsamdır; burada browser/pixel/AX kabulü iddiası yoktur.

Yalnız `packages/media/reasoned_caption_review_server.mjs` değiştirildi; yeni `test/reasoned_caption_preset_server.test.mjs` ve bu belge yazıldı. UI assets, mevcut HTTP testi, CLI/tools, kaynak/trace/resolver/renderer/paginator/denetleyici ve ortak belgeler değiştirilmedi. Git, Docker, dış ağ, download, dependency, model/provider, hesap veya öğrenci verisi kullanılmadı. Testlerde gerçek geçici 127.0.0.1 HTTP bağlantısı kullanıldı; construction herhangi bir adresi dinlemeye başlamaz.

## Kapalı API ve desteklenen gerçek kaynaklar

```js
createReasonedCaptionReviewServer();               // aynı NOARGS garden
createReasonedCaptionReviewPresetServer('concept'); // yalnız tek primitive enum
```

Yeni export tam bir argüman, primitive string ve tam `garden`, `concept`, `perimeter`, `area` eşitliği ister. Object/boxed string/JSON/source/trace/job/config/callback, getter/coercion/proxy/revoked proxy, unknown string, prefix/suffix veya ikinci argüman reddedilir. Caller nesnesi okunmaz; negatif constructor testlerinde hook sayısı **0**. Eski factory argüman kabul etmeme kuralını korur, yalnız private ortak composition'a `garden` verir.

| Preset | Trusted mevcut kaynak ve trace | Gerçek öğrenme amacı | Cue / protected cue |
|---|---|---|---|
| `garden` | `createGardenQuestion`, aynı `caption-review-loopback-garden`; `createReasonedMathTrace` | Her sırada kapı açık kalırken iki sıra telin uzunluğunu gerekçelendirme; metre | 30 / 14 |
| `concept` | `createPerimeterLesson`, `lesson-perimeter-area-v1`; `createReasonedPerimeterLessonTrace` | Sınır/yüzey, çevre/alan ve birim ayrımı; mevcut 6×4 ve 8×3 karşı örneği | 26 / 12 |
| `perimeter` | `createRectangleQuestion`, `caption-review-loopback-perimeter`, sabit 6×4; `createReasonedMathTrace` | Dört dış kenarın toplamını bulma; santimetre | 14 / 6 |
| `area` | `createRectangleQuestion`, `caption-review-loopback-area`, sabit 6×4; `createReasonedMathTrace` | İç yüzeyi birim kare sayısıyla ilişkilendirme; santimetrekare | 10 / 4 |

Her kaynak mevcut `createReasonedMediaJob` → `createReasonedScenePlan` → `resolveReasonedMediaGeometry` canonical regeneration/audit → `createReasonedCaptionReview` canlı brand zinciriyle kurulur. Caller serialized artifact'ı trusted sayılmaz. Source/trace/job/geometry/scene/frame/paging hash bağları aynı mevcut immutable current kaydındadır; constructor için yeni browser authority veya config alanı eklenmedi. Dört kaynak purpose ve source/trace/job hashleri farklıdır; perimeter/area aynı kenarları kullanmasına rağmen farklı ölçüm amaçlarıdır. Bunlar dört sınıf/müfredat kabulü veya dört yeni stok sorusu sayılmaz.

Preset construction-time seçimdir. **HTTP selection endpoint yoktur**: `/api/preset` 404; query preset 400; action'a preset/grade/source alanı eklemek 400. Bound loopback Host, POST Origin, Fetch metadata, body/deadline, CSP/assets ve mevcut beş action sınırları ortak private HTTP implementation'da değişmedi. Yanıt yalnız current kaydıdır; bütün plan/future cue gönderilmez. Yerel shared editör, auth/çocuk/kalıcılık/çok kullanıcı sınırı ve unknown-state UI lock önceki dilimdeki gibi kalır.

## Comparison görevi neden ayrıca bekliyor?

`geometric_comparison_draft.mjs` iki construction family üretir: same-area/different-perimeter ve same-perimeter/different-area. Ancak mevcut math trace adapter yalnız yedi canonical math family, geometry resolver ise bunlar + sabit concept lesson kabul eder. Comparison draft'ın dedicated branded trace/anchor resolver'ı yoktur; mevcut teacher-reference SVG answer-bearing, learnerPayloadSafe/revealProtectionImplemented false ve medya entegrasyonu pending'dir.

Bu nedenle `same-area` / `same-perimeter` enum'u **reddedilir**, concept veya sıradan rectangle'a alias yapılmaz. Concept'in içindeki eşit alan örneği, tüm construction görevlerine ya da eşit çevre karşılaştırmasına destek değildir. Gelecek dilim için iki yöndeki model/birim/kaynak/trace/anchor semantiği, answer-bearing asset reveal tasarımı ve purpose binding ayrı TDD/audit ister; üç owned-file scope'u içinde bu açık gizlenmedi. Question stock, expert accepted ve published artışı **0**; mevcut farklı amaçların yerel sunucu bağlantısıdır.

## Test-first ve taze kanıt

TDD, writing-good-tests ve verification talimatları doğrudan tamamen okundu. Mevcut legacy HTTP baseline **16/16 PASS** alındı. Uygulamadan önce mevcut trusted builder'lardan dört literal initial source/trace/job/current fingerprint fixture'ı kaydedildi; goal/birim/ilk result metinleri elle kontrol edildi. Yeni export beklenen sonuç hesabında kullanılmadı; trace/controller/renderer mock edilmedi.

1. Yeni 12 test export yokken **0 PASS / 12 FAIL**: `closed caption preset server API missing` assertion'ı. Import/syntax hatası değil, eksik API hedefli RED.
2. Minimal private composition extraction ve yeni primitive export sonrası **12/12 PASS**. Son transfer answer'a geri gelmeden önce önceki prompt'un gerçek kalan sayfaları tamamlanır; sayfa atlama varsayımı yapılmaz.
3. Final taze altı-file suite **118/118 PASS**, 0 fail/skip: yeni preset 12 + eski gerçek HTTP 16 + saf caption/renderer/controller 90. Server ve yeni test `node --check` exit 0.

```sh
node --test test/reasoned_caption_preset_server.test.mjs
node --test test/reasoned_caption_preset_server.test.mjs test/reasoned_caption_review_server.test.mjs test/reasoned_caption_review.test.mjs test/reasoned_scene_renderer.test.mjs test/reasoned_caption_pages.test.mjs test/reasoned_caption_frame.test.mjs
node --check packages/media/reasoned_caption_review_server.mjs
node --check test/reasoned_caption_preset_server.test.mjs
```

Yeni testler dört gerçek preset purpose/hash/unit bağını; toplam **80 cue / 36 protected cue** gerçek HTTP yürüyüşünü; locked fullTranscript=null, açık current reveal + progress1, ordinary/repeated reveal reddini; gerçek last-page ve terminal sınırlarını; backward reset/relock; yeni transfer geometrisi pending; legacy garden initial/navigated JSON byte eşitliğini; **26** hostile constructor reddi/hook0; dört preset için **28** HTTP seçim/scope/origin/host negatifi ve değişmeyen current state'i; bağımsız sunucu cursor izolasyonunu denetler. Full narration current-only kalır. Eski 16 test, CONNECT/Upgrade/Expect, gerçek IPv6, body deadline/budget ve emitted-client unknown-state recovery kilidini tekrar çalıştırdı.

## Frozen hashler

| Owned dosya | SHA-256 |
|---|---|
| Değişen `packages/media/reasoned_caption_review_server.mjs` | `6b42f4cbf80fa30e18ede7048efcebb2abf22bb807fecfba4dc61d49c785fb59` |
| Yeni `test/reasoned_caption_preset_server.test.mjs` | `aaf39914763f1aee5a5e4e87151ff4bf9824f6ca3979934e511a4ad900fb58c1` |

Değişmeyen assets: HTML `70b262e5feca4e2e204a07a8bb3322f9c0d82faf1918887824102baa9fc40842`; client `06773fb2e90b35d2d5f365e542bc6fcbee9cbf1989511042d4652def1b4a1ec1`; CSS `221c9c4dba73f1903c3237fa1e7f7d5074a36c5600f23124974575c0e5bfb267`. Eski HTTP testi `2de9f80c90300c62e0e69cfc9e04aff2c6b58dfc90272d9b5161c670070ccea7`.

Değişmeyen renderer `62dc4a1e9079eda41d5a1b84b14b0a0ae90d67a5b75cc429c17d5dc09629fb7a`; pages `391e4862028a5ac711b43ddc21cfca5132aa315c03830ebff4f17c7f974ce341`; caption text `b687030d2b83112cd8a7249c063433bd4fac23a8f8dabb3d552f1118a008a468`; review controller `c86d99d5142a5512f5dcce31564771d66ec8550cae86fb543da76731d5559c1e`. Bu belgenin kendi hash'i finalde haricen verilir.

`serializedAuthority=none`, privacyInspection not_performed; curriculum/rights/expert pending; teacher/learner/publication/production/audio/video/sync false. Preset/navigasyon yeni değerlendirme, mastery/IQ/skor, insan handwriting veya öğretmen kabulü üretmez. 18px DOM ve 62-unit satır sınırı glyph-fit/ekran okuyucu/premium UI kabulü değildir. Root'un gerçek CLI/browser bağı ve bağımsız audit'i bu scope'taki HTTP testlerinden ayrı raporlanmalıdır.
