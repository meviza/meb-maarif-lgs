# Sentetik Defter Uygulama Denetleyicisi — 4 Ekim 2026

Durum: `guarded_synthetic_application_implemented`. Yalnız yeni uygulama modülü, onun testleri ve bu kanıt notu eklendi. Eski adaptör, SQL migrationı, DB harness'i, UI ve ortak belgeler değiştirilmedi. Bu katman gerçek kullanıcı oturumu/HTTP auth, üretim DB driver, ekran senkronizasyonu, retention/silme hizmeti veya öğrenme analitiği değildir.

## Sabit API

`createSyntheticNotebookApplication({sourceFixture, execute})` seçenekleri güvenilir sentetik sunucu composition root'una aittir. Factory mevcut gerçek `createSyntheticNotebookAdapter` örneğini private closure içinde kurar; source ve executor kullanıcı isteğinden seçilmez. Kapalı source/policy/catalog, scope, amaç, owner/steward ve retention doğrulaması aynı adaptörde kalır. Yeni callback, rol, query, approval bayrağı veya kaynak geçersiz kılma yolu açılmaz.

Donmuş controller yalnız şunları verir:

- `current()` — Senkron, salt okunur, donmuş son uygulama görünümü; DB çağrısı yok.
- `async readCurrent()` — Yalnız mevcut adaptörün sabit scope/current sorgusu; açıkça çağrılır.
- `async save(request)` — Mevcut kapalı istemci isteğini prepare eder; valid ise branded private komutu commit eder. Ardından otomatik okuma veya tekrar yapmaz.

Metotlar yalnız kendi controller receiver'ında ve belirtilen argüman sayısıyla çalışır. Borrowed/Proxy/clone/yabancı receiver typed ret alır; read projection sızdırılmaz. Serileştirilmiş `current()` DTO'su ne request ne source ne controller yetkisi kazanır. Bu process-içi receiver sınırı kullanıcı kimlik doğrulaması değildir; factory/controller bir HTTP istemcisine aktarılmamalıdır.

Operasyon DTO'sunun ortak alanları:

```text
schemaVersion, valid, operation, decision, preparationDecision,
commitState, readState, persisted, persistenceConfirmed,
outcome, receipt, head, error, view
```

`operation`: `save` veya `read_current`. `decision`: `save_confirmed`, `save_unknown`, `current_read_confirmed`, `read_unknown`, `request_rejected` veya `application_busy`. DB öncesi ret `persisted:false`; write/read girişiminden sonraki belirsizlik `persisted:null` taşır. Save'in confirmed receipt/head alanları doğrulanmış adaptör yanıtıdır; read sonucu gövdeyi yalnız `view.readProjection` içinde bir kez taşır. Command/intent/gönderilen gövde commit DTO'suna kopyalanmaz. `lastOperation`, gövde taşımayan aynı operasyon metadata'sıdır.

Görünüm alanları:

```text
schemaVersion, state, busy, projectionFreshness, readProjection,
usageCounts, lastOperation, currentHeadVerified, readProvenance,
executorProvenance, realDatabaseVerified, purpose, classification,
usageCountMeaning, completeHistory, learningAnalyticsMapped
```

`readProjection` yalnız valid adapter read'inden gelir: `scope, scopeSha256, revision, body, bodySha256, receipt, governanceBinding`. Constructor fixture'ı, save request'i ve commit receipt'i bu alana gövde sağlamaz. Bütün DTO'lar ve gövde alt verileri inert/donmuştur; görünüm ve sonuç UTF-8 JSON büyüklüğü ayrı ayrı en fazla 512 KiB ile kontrol edilir. Tek geçmiş-okuma projection'ı ve son operasyon tutulur; kuyruk veya büyüyen bir uygulama history dizisi yoktur. Maksimum mevcut body profili 256 KiB'dir; büyük valid gövdeyle read/save çıktısı bütçesi de test edildi.

## Geçiş Ve Eşzamanlılık

| Eylem | Projection Davranışı | Son Durum / Freshness |
| --- | --- | --- |
| Başlangıç | Gövde ve usage counts `null` | `not_read` / `not_read` |
| Valid açık current read | Doğrulanmış gövde/scope/revision değiştirilir | `verified_current` / `verified_current` |
| Save prepare reddi | Önceki projection ve freshness korunur | Önceki durum |
| Gerçek write girişimi | Önceki read varsa aynen tutulur; request ile değiştirilmez | `read_stale_after_write` / `stale_after_write` |
| Save confirmed veya unknown | Otomatik read/retry yok; stale projection devam eder | Aynı stale durum |
| Failed açık read | Önceki projection korunur; freshness unknown olur | `read_unknown` / `unknown_after_read_failure` |
| Tekrar valid açık read | Ancak şimdi yeni doğrulanmış başlık görünür | `verified_current` / `verified_current` |

Hiç valid read yapılmamışsa save makbuzu body uydurmaz; projection/counts `null` kalır. Valid revision 0 read'inde body/hash/receipt `null`, operasyonel sayımlar 0 kalır. Tarihsel idempotent replay son açık read gövdesini geriye döndürmez; her write girişimi gibi freshness'i stale yapar. Immutable önceki görünüm nesneleri tarihsel snapshot'tır; caller yeni state için `current()` çağırmalıdır. `verified_current` sürekli canlı DB izlemesi değil, son doğrulanmış açık okuma snapshot'ı anlamındadır.

Controller başına tek in-flight işlem vardır. İkinci save/read, ilk işlem sürerken `application_busy` ile **ikinci executor girişinden önce** reddedilir; kuyruğa alınmaz ve sonradan kendiliğinden çalışmaz. Busy ret yalnız reddedilen operasyonun `persisted:false` durumudur, başka in-flight write'ın DB sonucunu yorumlamaz. Synchronous executor reentry de aynı kapıda durur. Bu gate bir DB distributed lock, cross-process seri hale getirme veya transaction pool değildir; DB optimistic revision/RLS sınırı eski adaptör/SQL katmanında kalır.

## DAMA Amaç Ve Kanıt Sınırı

Her view `purpose:'student_notebook'`, `classification:'sensitive_student_notebook'` taşır. `usageCounts`: `textUtf16Units, strokeCount, pointCount, questionBookmarkCount, topicBookmarkCount, noteCount, concernCount, bodyJsonUtf8Bytes`. UTF-16 birim sayısı grapheme/kelime sayısı değildir. Bu alanlar yalnız okunan defter payload'ının operasyonel büyüklüğünü bildirir: `usageCountMeaning:'operational_notebook_counts_not_learning_evidence'`, `learningAnalyticsMapped:false`, `completeHistory:false`. Score, mastery, öğrenme başarısı, IQ, bilişsel/sezgisel kapasite, psikometrik profil veya meslek yönelimi hesaplanmaz. Metin/çizgi/not/concern başka bir learning telemetry amacına aktarılmaz.

Her output/view: `automaticRead:false`, `automaticRetry:false`, `syntheticOnly:true`, `authentication:'not_implemented'`, `learnerReady:false`, `productionReady:false`. View ayrıca daima `executorProvenance:'trusted_server_hook_unverified'`, `realDatabaseVerified:false` verir. Bir callback'in dönmesi, hashes'in tutması veya `persistenceConfirmed:true` **tek başına gerçek DB bağlantı kanıtı değildir**; confirmation güvenilir sabit hook üzerinden adaptörün kendi sözleşmesine göredir. Gerçek uygulama→PostgreSQL kanıtı root'un ayrı opt-in SQL witness koşusunda kaydedilmelidir; sahte hook ile aynı provenance dışarıdan ileri sürülmez.

Mevcut dar SQL profili aynen korunur: en çok dört ondalık koordinat, U+0000/unpaired-surrogate typed ret, exact scope/policy/catalog ve 100 makbuz history kapasitesi. Yeni katman bunları yuvarlama, amaç değiştirme veya yeniden hash/onay bayrağıyla aşmaz. Plain-text payload'ın literal olması HTML rendering güvenliği veya PII tespit garantisi değildir; gerçek auth, canlı catalog/policy resolver, hukuki retention/silme ve UI erişim katmanı ayrıca pending.

## TDD Ve Taze Doğrulama

Uygulama dosyası oluşturulmadan önce 18 tüketici davranış testi yazıldı. İlk koşu **0/18 geçer, 18 expected RED**: guarded factory eksikliği. Küçük uygulama eklendikten sonra aynı komut **18/18 GREEN** verdi. Existing gerçek hazırlayıcı ve adaptör çalışır; yalnız harici DB executor hook'u bağımsız tam sentetik SQL yanıt fixture'larıyla test double'dır. Fake hook'un varlığı değil, application state/projection değişimi, hash-bound readback, sıfır çağrı retleri, sıranın korunması ve tüketici çıktısı denetlenir.

Negatifler: unsafe factory/getter/Proxy, caller role/purpose veya serialized-state request, PostgreSQL precision ret, wrong receiver/extra args, yabancı okul read, malformed commit, executor exception/secret echo, unknown commit sonrası açık read recovery, delayed save/read overlaps, synchronous reentry ve tarihsel replay. Unknown write hiç `persisted:false` veya uydurma rollback demek değildir; önceki body request gövdesiyle değiştirilmez. Büyük valid 240 KiB not payload'ında sonuçlar 512 KiB altında ve immutable kalır.

Taze birleşik komut:

```sh
node --test test/synthetic_notebook_application.test.mjs test/synthetic_notebook_adapter.test.mjs test/synthetic_notebook_sync.test.mjs test/synthetic_student_notebook_cli.test.mjs test/synthetic_notebook_adapter_postgres_cli.test.mjs
```

Sonuç: **75 test / 75 geçer / 0 başarısız / 0 atlanan / exit 0** (18 application, 27 adapter, 19 saf sözleşme, 8 eski güvenli CLI, 3 adapter opt-in CLI). Bunlar bu katmanın hermetik snapshot sayılarıdır. Bu ajan Docker/SQL, network, provider, credential, kurum/çocuk verisi veya Git işlemi yapmadı. Root'un ayrıca çalıştıracağı gerçek application SQL proof'u henüz bu kayıtta iddia edilmez; HTTP auth/prod driver/UI/analytics/retention ve kurumsal kabul kapıları açıkça pending'dir.
