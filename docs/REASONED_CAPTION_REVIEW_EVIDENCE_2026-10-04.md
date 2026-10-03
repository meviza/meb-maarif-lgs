# Kaynak-bağlı caption review controller — 4 Ekim 2026

Durum: saf, yerel editör-preview navigasyonu uygulandı ve Node ile doğrulandı. Bu dilim DOM/HTML üretmez, tarayıcı çalıştırmaz, öğrenci yetkilendirmez ve içerik onaylamaz. Yalnız yeni controller, yeni testi ve bu belge yazıldı; mevcut renderer, pagination, kaynaklar, CLI ve UI değiştirilmedi.

## Kapalı API ve güven sınırı

```js
const review = createReasonedCaptionReview(liveScenePlan);
const record = review.current();
const next = review.dispatch({ type: 'next_page' });
```

Constructor yalnız bir argüman alır. `liveScenePlan`, mevcut `renderReasonedCaptionFrame` tarafından original yerel WeakSet brand ile kabul edilmeden hiçbir plan alanı okunmaz. JSON clone, yeniden hashlenmiş clone, frame, narration packet veya review record canlı plan yerine geçmez. Controller nesnesi frozen ve yerel WeakSet-branded'dir; metot receiver'ı ayrıca tam olarak o controller olmalıdır. Metodu clone'a, başka controller'a veya Proxy receiver'a bağlamak reddedilir. Metotları bağımsız işlev gibi çağırmak değil, `review.current()` / `review.dispatch(...)` biçimi kullanılmalıdır.

Başlangıç: cue 0, page 0, progress 1, reveal false. Progress 1 yalnız tamamlanmış sabit review-vurgusudur; süre, frame rate, ses veya kalem-kelime senkronu değildir. Mutable cursor closure içinde kalır; dönen her record ve iç DTO frozen'dır. Reddedilen action, boundary, render veya record bütçe kontrolü state'i değiştirmeden hata verir.

Tek own enumerable data alanı `type` olan aşağıdaki beş action kabul edilir. Caller cue/page/progress/reveal/text/limit/approval/role/path veremez. Prototype, symbol, getter, proxy, revoked proxy, coercion, cycle veya unknown field üzerinden hook çalıştırılmaz.

| Action | İzin ve etkisi |
|---|---|
| `previous_page` | Yalnız current page > 0; aynı cue/reveal korunur |
| `next_page` | Yalnız current page gerçek son sayfadan önce; aynı cue/reveal korunur |
| `previous_cue` | Yalnız önceki cue varsa; page 0 ve reveal false'a döner |
| `next_cue` | Sonraki cue + gerçek son sayfa gerekir; protected current cue ayrıca açık reveal gerektirir; yeni cue page 0/reveal false |
| `reveal_current` | Yalnız current protected cue kilitliyse; reveal true, page 0; ordinary cue veya tekrar reveal reddedilir |

Protected türler `result`, `check_answer`, `summary`, `transfer_answer`dır. Kilitli placeholder bir sayfadır, ancak bu tek sayfa ileri geçiş izni değildir. Reveal sonrasında gerçek narration sayfa sayısı tekrar renderer'dan alınır: iki sayfalık garden summary ilk revealed sayfasındayken next cue yine reddedilir. Önceki protected cue'ya geri dönmek onu yeniden kilitler. İleri yönde direct go/skip yolu yoktur; geriye dönüp açıklamayı tekrar açmak öğrenme veya yetkilendirme kanıtı sayılmaz.

## Current record, DOM ve kaynak geometrisi

`current()` ve başarılı `dispatch()` aynı record şeklini döndürür:

- `cursor`: yalnız current cue/page kimliği, toplam cue/page sayısı, progress/reveal/resultVisible.
- `navigation`: beş izin boole'ı ve `forwardBlockedReason`; başka cue metni taşımaz.
- `caption.lines`: yalnız seçili sayfanın 1–2 literal düz metin satırı. `contentFormat=plain_text_textContent_only`, önerilen bağımsız DOM fontu `recommendedFontSizeCssPx=18`. `innerHTML` veya SVG/HTML string sink kullanılmamalıdır.
- `frame`: mevcut kaynak-bağlı renderer'ın bire bir immutable frame'i; mevcut derived safe geometry ve highlight nib korunur. Bu original kaynak SVG byte'larının doğrudan inline edildiği iddiası değildir.
- `narrationPacket`: ayrı editör-only packet. Tam canonical current narration ve kayıpsız span/separator paging korunur; protected cue kilitliyken fullTranscript ve digest null'dır. Gelecek cue narration'ı içermez. Bu packet varsayılan görünür DOM caption yerine konmamalıdır.

Kaynak, trace, job, geometry, scene, frame SVG ve paging digestleri record'a bağlanır. `contentSha256` kendi alanı hariç record'un JSON SHA-256'sıdır. Aynı live plan + aynı cursor/reveal aynı record bytes/hash üretir; önceki frozen record sonradan ilerleyen cursor nedeniyle değişmez.

1280-unit garden viewBox'u nedeniyle DOM fontu küçültülmez. Diagram/source path değiştirilmez, crop/resize/transform eklenmez; geometrik çizim mevcut SVG'de aynı kalır. Mevcut frame SVG seçili caption'ı da içerdiğinden `visualPresentation.use=optional_secondary_closed_review_preview` işaretlidir: DOM caption birincil, SVG isteğe bağlı ikincil kapalı review preview olmalıdır. Controller bunu DOM üzerinde uygulamış veya çift AX anlatımını çözmüş sayılmaz; görünür consumer ve erişilebilirlik incelemesi ayrı bekler.

Her record'un hash dahil serialized UTF-8 JSON boyutu en fazla 131,072 byte'tır. Limit caller tarafından genişletilemez; aşım `reasoned_caption_review_record_budget_exceeded` verir ve private cursor commit edilmez. Bu serialized-output kotasıdır, process memory/time sertifikası değildir. Mevcut canonical fixture matrisinde en büyük observed record 15,893 byte oldu; oversized live branded fixture üretilmediğinden 128 KiB aşım dalı için gerçek runtime negatif tanık iddiası yapılmaz.

Yeni transfer şekli kaynakta bulunmadığında mevcut renderer'ın text-only pending fallback'i korunur: sourceDiagramProof false, sourceVisualId null, yeni source path veya sahte ölçek yoktur.

## Test-first ve taze kanıt

TDD, writing-good-tests ve verification talimatları uygulamadan önce tamamen okundu. Gerçek kaynak/trace/job/scene fixture'ları kullanıldı; renderer/paginator mock edilmedi.

1. Önceki üç scene/caption test dosyası baseline: **71/71 PASS**, 0 fail/skip.
2. Yeni controller testi module yokken yazıldı. İlk `node --test test/reasoned_caption_review.test.mjs`: **0 PASS / 19 FAIL**, beklenen `live caption review controller API missing` assertion'ları. Import hatası test sonucu diye sunulmadı; eksik export açık assertion'la RED verdi.
3. Minimal yeni module sonrası aynı komut: **19/19 PASS**. Kapalı action descriptor okuması GREEN sonrası yalnız tek own descriptor okuyacak şekilde sadeleştirildi; tekrar **19/19 PASS**.
4. Son taze birleşik koşu: **90/90 PASS**, 0 fail/skip. Syntax kontrolü exit 0.

```sh
node --test test/reasoned_caption_review.test.mjs
node --test test/reasoned_caption_review.test.mjs test/reasoned_scene_renderer.test.mjs test/reasoned_caption_pages.test.mjs test/reasoned_caption_frame.test.mjs
node --check packages/media/reasoned_caption_review.mjs
```

19 test: dense garden evidence'in gerçek beş sayfası; goal/plan/why/result/check/summary bağlamları; last-page ve explicit-current-reveal gate; iki sayfalık revealed summary; backward reset/relock; sınırdaki immutable reddi; clone/başka controller receiver reddi; current-only narration; source geometry/paging/hash bağı; textContent önerisi; altı rectangle ailesi + sabit garden + canonical concept lesson; transfer pending; büyük 100×100 canonical şekiller ve markup-bearing inert style egress reddi. Tüm approval/audio/video/sync/UI acceptance bayrakları false'tır.

Ek bounded, salt-okunur ad-hoc Node probe tamamlandı:

- Width/height 1, 2, 4, 6, 50, 100; altı rectangle ailesi, fence gate 1 ve tam width; sabit garden/concept: **253 canonical source case**, **3,710 cue**, **5,606 revealed/current page record**. Alan ve çevresi aynı olan 4×4 error-diagnosis case canonical ambiguity nedeniyle bilinçli dışarıda bırakıldı; desteklenmiş gibi sayılmadı.
- **1,602 protected forward reddi + 60 ek hostile/receiver/plan/boundary reddi = 1,662 negatif tanık**; getter/proxy/coercion hook **0**. Valid follow-on ve bağımsız ikinci controller state'i de kontrol edildi.
- Her record renderer delegasyonu, complete current transcript, frozen satırlar, frame/paging/record digestleri ve kaynak planın byte-eşit kalışıyla denetlendi. Bu Node kanıtı gerçek browser, raster, font/glyph-fit veya insan pedagojik kabul yerine geçmez.

## Frozen hashler ve açık kapılar

| Dosya | SHA-256 |
|---|---|
| Yeni `packages/media/reasoned_caption_review.mjs` | `c86d99d5142a5512f5dcce31564771d66ec8550cae86fb543da76731d5559c1e` |
| Yeni `test/reasoned_caption_review.test.mjs` | `aeab5de1c09544000fe6a42901482bf601d2dbcb8e3fdc13e8fc493dee5b9e2a` |
| Değişmeyen `packages/media/reasoned_scene_renderer.mjs` | `62dc4a1e9079eda41d5a1b84b14b0a0ae90d67a5b75cc429c17d5dc09629fb7a` |
| Değişmeyen `packages/media/reasoned_caption_pages.mjs` | `391e4862028a5ac711b43ddc21cfca5132aa315c03830ebff4f17c7f974ce341` |
| Değişmeyen `packages/media/reasoned_caption_text.mjs` | `b687030d2b83112cd8a7249c063433bd4fac23a8f8dabb3d552f1118a008a468` |

`serializedAuthority=none`, `audience=editor_review_only`, `privacyInspection=not_performed`. Reveal yalnız yerel current içeriği editöre açar; gerçek çocuk auth, consent, öğretmen onayı, learner/cue-visit mastery veya skor değildir. Curriculum/rights/expert review pending; teacher/publication/learner/production false. TTS, ses, video, zaman damgası, kelime-kalem alignment veya senkron üretmez. Sabit 62 UTF-16 birim sınırı glyph genişliği garantisi değildir; bağımsız DOM 18 px önerisi gerçek font, ekran, okunurluk ve screen reader kabulü yerine geçmez. Root consumer/CLI/UI entegrasyonu, gerçek tarayıcı/raster incelemesi ve bağımsız source audit bu module testlerinden ayrı yapılmalıdır. Bu ajan Git, Docker, ağ, model/provider, CUA veya gerçek öğrenci verisi kullanmadı.
