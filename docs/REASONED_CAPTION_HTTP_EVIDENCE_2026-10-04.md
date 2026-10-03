# Yerel editör altyazı incelemesi — HTTP dilimi, 4 Ekim 2026

Durum: gerçek Node HTTP sunucusu, yalnız geçerli adım/sayfayı taşıyan yerel API ve küçük Türkçe arayüz uygulandı. Yeni HTTP testleri **16/16**, mevcut ilgili saf modüllerle birleşik koşu **106/106 PASS**, 0 fail/skip. Bu ajanın kanıtı loopback HTTP ve yayımlanan istemci betiğinin dar DOM sınırında çalıştırılmasıdır; gerçek tarayıcı, piksel, ekran okuyucu veya premium tasarım kabulü değildir. Root'un CLI, dinleme ve tarayıcı QA çalışması ayrıdır.

Yalnız altı yeni dosya yazıldı: `packages/media/reasoned_caption_review_server.mjs`, `apps/caption-review/index.html`, `apps/caption-review/review.mjs`, `apps/caption-review/review.css`, `test/reasoned_caption_review_server.test.mjs` ve bu belge. Mevcut renderer, sayfalama, denetleyici, kaynak, CLI, ana UI ve ortak belgeler değiştirilmedi. Git, Docker, dış ağ, hesap, model/provider veya öğrenci verisi kullanılmadı. Testlerin kendi geçici IPv4/IPv6 loopback bağlantıları bu dilimin açık kapsamıdır; kalıcı sunucu başlatılmadı.

## API ve güven sınırı

```js
const server = createReasonedCaptionReviewServer(); // Node http.Server; henüz dinlemez
// Dinlemeyi yalnız composition root açık 127.0.0.1 veya ::1 üzerinde başlatır.
```

Constructor sıfır argümanlıdır. Caller plan, kaynak, rol, sınıf, tenant, port, path veya güven etiketi veremez. Sabit `caption-review-loopback-garden` kaynağı mevcut `createGardenQuestion` ile oluşturulur; `createReasonedMathTrace` → `createReasonedMediaJob` → `createReasonedScenePlan` → `createReasonedCaptionReview` zinciri canlı branded nesneleri kullanır. JSON'dan otorite yeniden kurulmaz.

- `GET /api/current`: mevcut immutable denetleyici kaydının doğrudan JSON'u; bütün plan, future cue, source asset listesi veya sonraki anlatımlar gönderilmez. Toplam adım/sayfa sayısı gizlilik iddiası değildir.
- `POST /api/action`: yalnız `{ "type": "previous_page|next_page|previous_cue|next_cue|reveal_current" }` biçiminde beş kapalı literal action'dan biri. İleri adım için gerçek son sayfa, protected yanıtta ayrıca açık current yanıtı gösterme isteği gerekir. Geri adım sayfayı sıfırlar ve yanıtı yeniden kilitler. Blocked geçiş 409 verir; durum değişmez.
- `GET`/`HEAD`: yalnız `/`, `/index.html`, `/review.mjs`, `/review.css` sabit varlıkları. API için HEAD yoktur; path/query normalizasyonu veya caller dosya yolu yoktur. Diğer path/metotlar 400/404/405 ile reddedilir.

Wire JSON profili bilinçli dardır: yalnız literal, unescaped ASCII `type` anahtarı ve beş literal action, çevresinde JSON whitespace kabul edilir. Duplicate member, unknown field, escaped-key alternatifi, özel text/grade/reveal/limit veya başka valid-JSON temsilleri kabul edilmez. Bu genel amaçlı JSON parser sözleşmesi değildir. UTF-8 decoding fatal'dır; malformed byte dizisi 400 verir.

## HTTP sınırlaması

Her ordinary request, `server.address()` ile gerçek bound IP/port'u ve socket adreslerini yeniden denetler. Yalnız tam `127.0.0.1:port` ya da `[::1]:port` Host kabul edilir; localhost alias'ı, farklı port/IP ve wildcard bağlama kabul edilmez. Mutating POST için tam `http://bound-IP:port` Origin zorunludur. GET'te verilmiş Origin de aynı olmalıdır. Sec-Fetch-Site varsa yalnız same-origin/none; POST mode varsa yalnız cors/same-origin, dest varsa yalnız empty kabul edilir. Bunlar **gerçek kullanıcı kimliği, çocuk yetkilendirmesi veya CSRF/auth sertifikası değildir**: yerel non-browser istemci bu header'ları taklit edebilir.

Duplicate header, auth/cookie/forwarding/X-* ve belirlenmiş scope/role/tenant/grade header'ları reddedilir; diğer inert header'lar rol otoritesi sayılmaz. CORS açılmaz. Content type yalnız application/json ve isteğe bağlı UTF-8 charset; encoding yoktur. Action body en fazla **256 UTF-8 byte**, streaming ve declared length birlikte sınırlıdır. Başlamış body için mutlak **1 saniye** deadline 408 verir; 256 byte positive ve 258 byte declared/chunked negative gerçek HTTP ile ölçüldü. Header bütçesi 8192 byte, headers timeout 2 saniye, request/socket timeout 3 saniye; runtime tanık body deadline ve header overflow için alındı, bütün olası yavaş header/OS kaynak davranışları için kabul iddiası yoktur.

CONNECT ve Upgrade 400, Expect:100-continue 417, parser hataları 400/431 verir; tunnel/socket yükseltmesi veya action dispatch yoktur. Reddedilmiş protokol/body/origin isteklerinden sonra aynı current kaydı ve valid follow-on doğrulandı. Geçerli mutation tamamlanırken bağlantının kesilmesi sonucu istemci açısından belirsiz kalabilir; mutation için retry/idempotency/persistence garantisi yoktur. İstemci POST'u otomatik tekrarlamaz, yalnız GET ile mevcut durumu yeniden okumayı dener. Yeniden okuma da başarısızsa private current otoritesi null olur: beş mutation kontrolü ve queued event yolu kilitlenir, eski görsel yalnız açık stale uyarısıyla kalır. Yalnız başarılı fresh GET/reload izinleri geri getirebilir; başarılı recovery yeni sayfayı önce gösterir. Bu UI recovery garantisi sunucu commit/persistence garantisi değildir.

## Görünür istemci

Birincil altyazı, sunucudan gelen seçili 1–2 literal satırın `textContent` ile ayrı DOM'a yazılmasıdır. CSS fontu **18 px**, source viewBox'a göre küçültme/transform/crop yoktur; bu font/glyph-fit garantisi değildir. HTML sink, inline script/style, dış URL/font, storage, telemetry, ses veya zaman eşlemesi yoktur. CSP default none; script/style/connect yalnız self; görsel yalnız data URL, media/font/object/frame/base/form kapalıdır. Yanıtlar no-store/nosniff/no-referrer/same-origin CORP taşır.

İsteğe bağlı kaynak-bağlı SVG, kapalı `<details>` içinde data-image olarak gösterilir. İç SVG caption'ı da taşıdığından bu ikincil incelemedir, çift anlatım/AX kabulü yapılmış sayılmaz; image empty alt ve aria-hidden ile işaretlenir. Tam **geçerli** anlatım ayrı, varsayılan kapalı editör bölümünde textContent'tir. Protected current cue kilitliyken fullTranscript null ve güvenli açıklama gösterilir. Gelecek adım anlatımı veya yanıtı tarayıcı payload'ında yoktur. Adım/sayfa değişiminde iki ayrıntı bölümü kapanır. Beş düğme yalnız sabit action type gönderir; skip/override yolu yoktur.

Yeni UI metinleri Türkçe ve yanıt gösterme isteğini **onay** diye sunmaz. Mevcut frozen kanonik protected placeholder'daki teknik `reveal` kelimesi bu dilimde değiştirilmedi; saf renderer byte/hash uyumluluğu korunur. Tek sunucuya bağlı bütün pencereler **aynı geçici yerel editör konumunu paylaşır**; ayrı sunucular bağımsızdır. Bu single shared in-memory synthetic editor, öğrenci UI/auth, çok kullanıcılı oturum, persistence veya production değildir. Reveal/sayfa ziyareti öğrenme becerisi, skor, öğretmen ya da yayın onayı değildir.

## Test-first ve taze doğrulama

TDD, writing-good-tests ve verification talimatları uygulamadan önce tamamen okundu. Testler gerçek canonical source/trace/job/scene/controller ve gerçek Node HTTP/TCP kullandı; renderer/controller mock edilmedi. İstemci testlerinde sunucunun verdiği gerçek betik `vm.Script` ile dar DOM double'da çalıştı; forbidden innerHTML/outerHTML/insertAdjacentHTML sink'leri hata verir. Bu double bir browser engine veya accessibility tree değildir.

1. Yeni 11 test, API/varlıklar yokken **0/11 PASS**: beklenen `loopback caption review HTTP API missing` assertion'ı RED. Import failure başarı/özellik kanıtı yapılmadı.
2. İlk implementation sonrası **10/11 PASS**: unsupported POST testinde Origin eksik olduğu için doğru boundary 403 verdi. Test valid Origin ile sadece 405 metot sınırını ölçmeye düzeltildi; güvenlik kuralı gevşetilmedi. Ardından **11/11 PASS**.
3. CONNECT + gerçek IPv6 testleri eklenince **12/13 PASS**. CONNECT ordinary request handler'ı atlayıp boş bağlantı kapanışı verdi; honest 400 hedefli RED. Tunnel/durum ilerlemesi görülmedi.
4. UI yerelleştirme assertion'ları önce eklenince **9/13 PASS**: CONNECT ve üç metin assertion'ı beklendiği gibi RED. Minimal connect handler + yeni UI literal düzeltmeleri sonrasında **13/13 PASS**.
5. İlk birleşik koşu **103/103 PASS** sonrası bağımsız source audit P2 yakaladı: gerçek POST commit edip yanıt kaybolurken recovery GET de başarısız olursa eski private current ile next-page yeniden açılıyordu; bir sonraki elle istek gösterilmemiş sayfayı atlayabilirdi. Yeni gerçek-HTTP + emitted-script regression **15/16 PASS**, hedef `next-page must stay locked until a fresh current read` RED verdi. Minimal current=null + send(!current) guard sonrası **16/16 PASS**. Sunucu gerçek page 1'de kalır; eski DOM tutulur ama beş düğme/direct queued listener yeni POST göndermez. Fresh reload page 1'i gösterip izinleri geri verir. Başarılı recovery ve in-flight double-click ayrı positive karakterizasyonlardır. Yanıt kaybı test HTTP response boundary'de simüle edildi; gerçek POST sunucuda commit oldu, ancak bu browser ağ kesintisi tanığı değildir.
6. Final taze birleşik koşu **106/106 PASS**, 0 fail/skip. Server ve yayımlanan istemci syntax kontrolleri exit 0. Dört frozen dependency hash'i önceki kayıtla aynı.

```sh
node --test test/reasoned_caption_review_server.test.mjs
node --test test/reasoned_caption_review_server.test.mjs test/reasoned_caption_review.test.mjs test/reasoned_scene_renderer.test.mjs test/reasoned_caption_pages.test.mjs test/reasoned_caption_frame.test.mjs
node --check packages/media/reasoned_caption_review_server.mjs
node --check apps/caption-review/review.mjs
```

16 test: unbound constructor; beş sayfalık gerçek garden evidence; protected reveal/backward reset; shared versus independent state; exact Host/Origin/Fetch metadata; duplicate/oversized headers; query/metot/route/scope; closed JSON/UTF-8/body sınırı; mutlak body deadline; HEAD/assets/CSP; CONNECT/Upgrade/Expect; gerçek ::1; gerçek yayımlanmış istemci literal DOM ve kilitli anlatım; unknown-state fail-closed/reload; successful recovery; in-flight double-click. Root browser/CLI doğrulaması bu test toplamına dahil değildir.

## Frozen hashler ve bekleyen kabul

| Yeni dosya | SHA-256 |
|---|---|
| `packages/media/reasoned_caption_review_server.mjs` | `4108b33dcd4630636191686821a0473abefe324b545c0cc1bed9e49a21d8f29c` |
| `apps/caption-review/index.html` | `70b262e5feca4e2e204a07a8bb3322f9c0d82faf1918887824102baa9fc40842` |
| `apps/caption-review/review.mjs` | `06773fb2e90b35d2d5f365e542bc6fcbee9cbf1989511042d4652def1b4a1ec1` |
| `apps/caption-review/review.css` | `221c9c4dba73f1903c3237fa1e7f7d5074a36c5600f23124974575c0e5bfb267` |
| `test/reasoned_caption_review_server.test.mjs` | `2de9f80c90300c62e0e69cfc9e04aff2c6b58dfc90272d9b5161c670070ccea7` |

Değişmeyen renderer `62dc4a1e9079eda41d5a1b84b14b0a0ae90d67a5b75cc429c17d5dc09629fb7a`; caption pages `391e4862028a5ac711b43ddc21cfca5132aa315c03830ebff4f17c7f974ce341`; caption text `b687030d2b83112cd8a7249c063433bd4fac23a8f8dabb3d552f1118a008a468`; review controller `c86d99d5142a5512f5dcce31564771d66ec8550cae86fb543da76731d5559c1e`.

Kaynak/trace/job/geometry/scene/frame/paging bağları mevcut immutable record'da taşınır; serialized browser kaydı otorite değildir. Approval, learner/publication/production/audio/video/sync bayrakları false; privacyInspection not_performed; müfredat/hak/uzman review pending kalır. Yeni transfer shape text-only pending korunur. Human handwriting, TTS, kelime-kalem alignment/timestamps, öğretmen kabulü, yayımlama, gerçek çocuk erişimi, gerçek tarayıcı okunurluğu ve screen reader kabulü üretilmedi. Bu belge kendisinin hash'ini içermez; final teslimde haricen alınır.
