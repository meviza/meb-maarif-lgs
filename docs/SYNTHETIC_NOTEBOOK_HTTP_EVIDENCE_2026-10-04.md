# Sentetik Defter HTTP Sınırı — 2026-10-04

## Kanıtın kapsamı

Bu dilim, mevcut gerçek `createSyntheticNotebookApplication` → adapter → hazırlama sözleşmesini yerel HTTP üzerinden kullanır. Gerçek loopback TCP/HTTP istekleri çalıştırıldı; yalnız dış veritabanı executor'ı tam şekilli, sabit ve kontrollü test double'ıdır. Bu dosyadaki sonuçlar gerçek PostgreSQL commit/history kanıtı değildir. Root'un ayrı gerçek SQL/HTTP koşusu burada yapılmış sayılmamalıdır.

Üç yeni dosya vardır: `packages/contracts/synthetic_notebook_application_server.mjs`, `test/synthetic_notebook_application_server.test.mjs` ve bu kanıt. Eski application/adapter/SQL/harness/caption sunucusu, UI, paylaşılmış kaynaklar değiştirilmedi. Yeni driver, bağımlılık, container, sağlayıcı, credential veya uzak bağlantı yoktur.

Bu **tek ortak sentetik yerel örnektir**; kullanıcı/okul kimlik doğrulaması, çok kullanıcılı oturum, yetkili gerçek öğrenci uygulaması, üretim driver'ı veya üretim hizmeti değildir. Loopback/Host/Origin kapıları authentication değildir. Gösterilen not/çizgi/bookmark sayıları bilişsel gelişim, başarı, ustalık, IQ veya kariyer çıkarımı değildir.

## Güvenilen composition ve API

Tek export:

```js
createSyntheticNotebookApplicationServer({ sourceFixture, execute })
```

Constructor tam bir inert/closed seçenek nesnesini mevcut application factory'ye doğrulatır. Proxy/getter/ek rol-origin-onay alanı kabul edilmez; constructor executor'ı çalıştırmaz. İstemcinin seri hale getirilmiş scope/hash veya `trusted`/`approved` beyanı source/executor seçme yetkisi değildir. Güvenilen sunucu composition root'u aynı okul/öğrenci/sınıf/yıl/defter ve DB rolünü executor kapanımında sabit tutmalıdır; bu dilim canlı auth/catalog/policy resolver kurmaz.

Native, henüz dinlemeyen bir Node `Server` döner. Yalnız root açıkça `127.0.0.1` veya `::1` üzerinde bind eder. Constructor otomatik listen etmez ve ek application kontrolcüsü dışarı açmaz. Sunucu lifecycle'ı ve gelecekteki driver lifecycle'ı root'a aittir.

| Route | İstek | Yanıt / etkisi |
| --- | --- | --- |
| `GET /api/notebook/current` | Body yok | Yalnız `app.current()` in-memory view; **0 executor çağrısı** |
| `POST /api/notebook/read` | Tam `{}` JSON | Açık `app.readCurrent()`; doğrulanmış readback varsa view güncellenir |
| `POST /api/notebook/save` | Var olan closed notebook request DTO | `app.save(request)`; receipt/commit sonucu ayrı, **otomatik read/retry yok** |

Başlangıç view `not_read`, `readProjection:null`, `usageCounts:null` ve `currentHeadVerified:false` olur. Source fixture'da eski revision/makbuz bulunması bunları güncel okuma olarak göstermez.

Yanıt JSON'ları mevcut application view/result sözleşmesidir. Application `realDatabaseVerified:false`, `executorProvenance:'trusted_server_hook_unverified'`, `authentication:'not_implemented'`, `productionReady:false`, `learnerReady:false` ve `learningAnalyticsMapped:false` işaretlerini korur. Gerçek executor bağlansa bile bu HTTP constructor otomatik DB doğrulama iddiası üretmez; gerçek runtime kanıtı ayrıca kaydedilir.

## Transport, JSON ve boyut kapıları

- Hem gerçek listener adresi hem local/remote socket yalnız canonical loopback olmalıdır; wildcard listener reddedilir. Host gerçek bind adresi/portuna birebir eşleşir. POST Origin tam `http://<bound-host>:<bound-port>` olmalıdır. GET Origin varsa da aynı olmalıdır.
- Query/fragment, başka route, encoded/absolute alternatif path ve yanlış method kapalıdır. HEAD/OPTIONS bir API veya yetki keşif kapısı değildir. CORS izni verilmez.
- Bütün raw header adları benzersiz olmalıdır. Yalnız sınırlı native/browser transport allowlist'i kabul edilir. Authorization, Cookie, forwarding, caller-scope, X-* ve başka keyfi header reddedilir. `Sec-Fetch-*` varsa same-origin uygunluğu ayrıca kontrol edilir.
- Başlık limiti 8.192 bayt; native oversized header 431, diğer parser hatası 400. CONNECT/upgrade 400; Expect 417. Hiçbiri uygulama dispatch'i veya tünel açmaz.
- JSON Content-Type zorunlu; yalnız UTF-8 seçeneği desteklenir. Sıkıştırılmış request body kabul edilmez. Fatal UTF-8 decoder bozuk sequence/BOM'u reddeder.
- **Toplam HTTP request body** en çok 262.144 bayttır: notebook body **ve request metadata/JSON overhead** dahildir. Bu, uygulamanın en yüksek 262.144 bayt *body* profilinden daha dar wire bütçesidir; en büyük application body'nin tümü aynı HTTP request'e sığar iddiası yoktur. Daha küçük policy body bütçeleri ayrıca gerçek preparer tarafından uygulanır.
- Body için 1.000 ms mutlak süre bütçesi vardır; az veri göndermek süreyi yenilemez. Eksik/aborted request uygulamaya ulaşmaz. Header timeout 2.000 ms, native request/socket timeout 3.000 ms; bunlar transaction iptali veya DB rollback garantisi değildir.
- `JSON.parse` öncesi exact grammar walk, bütün seviyelerde yinelenen property-name, trailing JSON, depth >14 ve node >100.000 reddi yapar. Escape çözülmüş ve NFC eşdeğer property-name'ler aynı duplicate kümesinde kontrol edilir. **Değerlerin** metni/Unicode'u/koordinatı normalize edilmez, yuvarlanmaz veya HTML olarak yorumlanmaz. Son parse inert native JSON üretir; schema/purpose/source/body/precision kapıları application/adapter'da ayrıca sürer.
- Response bütçesi 524.288 bayttır; no-store, JSON MIME, nosniff, restrictive CSP ve same-origin resource policy uygulanır. Body/token/SQL hata mesajı loglanmaz veya exception'dan geri yansıtılmaz. Doğrulanmış kendi read projection'ının metin içermesi bu sabit sentetik örneğin açık API davranışıdır; gizli request veya başka okulun yanıtı değildir.

## Sonuç ayrımları ve bağlantı kaybı

Başarılı current/read/save 200; preflight/schema reddi 400; busy veya **DB öncesi** revision/idempotency conflict 409'dur. Body/type/deadline/Origin hatalarının 413/415/408/403 kodları ayrıdır.

DB hook çağrısı başladıktan sonra exception veya bozuk/cross-scope envelope `save_unknown` / `read_unknown`, HTTP 503 ve **`persisted:null`** olarak korunur; `persistenceConfirmed:false` olur. DB gerçekten yazmış olabilir. Bu yüzden sunucu `persisted:false`/rollback uydurmaz, otomatik tekrar denemez veya otomatik read yapmaz. Beklenmeyen sunucu exception'ının 500 fallback'i sabit `synthetic_notebook_http_unavailable` kodunu verir; iç hata mesajı/body yoktur. Fallback 500 ve response-budget aşımı destekli profile ile ayrıca tetiklenmiş runtime dalı değildir.

Başarılı save yalnız makbuz ve head döndürür. Önceden açıkça okunmuş projection korunur ama `stale_after_write` olur. Sırf makbuz veya gönderilen request body yeni doğrulanmış view'a çevrilmez. Yeni current head ancak bir sonraki açık `POST /read` ile doğrulanır. Aynı idempotency request makbuzu aynı olan exact replay olarak kalır; değişen body DB öncesi 409 olur.

Full request ulaşıp executor başladıktan sonra istemcinin HTTP bağlantısını kapatması DB işlemini geri almaya çalışmaz. Testte kontrollü executor sonra tamamlandı; uygulama gate'i açıldı, last-operation confirmed oldu, **0 retry/0 auto-read** ve null projection korundu. Bu tanık gerçek SQL commit kanıtı değildir; yanıtı kaybeden gerçek DB/HTTP istemci tanığı root'un ayrı koşusunda gereklidir.

## TDD ve taze doğrulama

Önce ilk 17 davranış testi yazıldı; module henüz yokken fatal import değil beklenen guarded-factory assertion ile:

```text
node --test test/synthetic_notebook_application_server.test.mjs
RED: pass 0 / fail 17 / skipped 0 / exit 1
```

Minimal HTTP implementation sonrası aynı 17 test:

```text
GREEN: pass 17 / fail 0 / skipped 0 / exit 0
```

Sonrasında mevcut application davranışlarının HTTP üzerinden dört ek karakterizasyonu eklendi: eski source receipt hiçbir projection üretmez, exact replay, executor sonrası client disconnect ve eksik upload disconnect. Bunlar yeni bir RED döngüsü gibi sunulmaz. Son taze birleşik komut:

```text
node --test test/synthetic_notebook_application_server.test.mjs \
  test/synthetic_notebook_application.test.mjs \
  test/synthetic_notebook_adapter.test.mjs \
  test/synthetic_notebook_sync.test.mjs
85 tests / 85 pass / 0 fail / 0 skip / exit 0
```

HTTP 21 + application 18 + adapter 27 + pure contract 19. Gerçek IPv4/IPv6 loopback socket, wildcard reddi, Host/Origin/fetch guards, raw duplicate/huge headers, closed route/method/header/body, nested/escaped/NFC duplicate keys, fatal UTF-8/BOM, trailing/deep/node-budget JSON, declared/chunked cap ve **tam 262.144 bayt wire request** tanıkları bu koşudadır. Sparse body yaklaşık bir saniyede 408 olur; sonra valid read çalışır. Yerel farklı server instance'ları state paylaşmaz; bir instance'ın bütün istemcileri bilerek aynı sentetik application memory'sini paylaşır.

Executor double sabit parameter SQL text ve separate values kontrol eder; read/body/receipt/governance kapsamları bağımsız test fixture hashleriyle tam şekilli oluşturulur. Sunucu/application/adapter/preparer gerçektir. Double ne gerçek DB, ne parameterized wire-driver, ne RLS/auth başarısıdır.

## Açık kalan kapılar

Gerçek HTTP→SQL tanıkları ve cleanup root'un ayrı isolated koşusuna aittir. Production wire driver, authenticated role/session resolver, TLS, browser UI, gerçek çocuk verisi, okul tenant lifecycle/quotas, audit sink, retention/deletion workflow, çok örnekli server state ve global abuse/connection/rate limits bu dilimde yoktur. Request-byte/deadline kapıları global kapasite/load testi değildir.

`student_notebook` hassas payloadı hâlâ `learning_progress_sync` ve learning-analytics amaçlarından ayrıdır. Literal plain-text taşınması safe HTML rendering veya otomatik PII tespit garantisi değildir. DAMA lifecycle sahiplik/amaç/policy/catalog/retention hash bağları korunur; bu örnek gerçek kurumsal source çözümlemesi veya DAMA sertifikasyonu değildir.
