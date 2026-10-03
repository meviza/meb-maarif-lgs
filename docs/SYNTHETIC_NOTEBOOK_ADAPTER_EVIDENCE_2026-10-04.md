# Sentetik Defter Uygulama Adaptörü — 4 Ekim 2026

Durum: `synthetic_adapter_boundary_implemented`. Bu kayıt, ayrı `student_notebook` amacındaki sentetik defter hazırlığını sabit bir sunucu yürütücü sınırına taşır. HTTP oturumu, gerçek okul/öğrenci kimlik doğrulaması, üretim veritabanı sürücüsü, arayüz senkronizasyonu, saklama/silme operasyonu veya analitik bağlantı tamamlandı demek değildir. Bu dilimde ağ, Docker, kurum verisi, credential veya bağımlılık kurulumu kullanılmadı.

## API Ve Yetki Sınırı

`packages/contracts/synthetic_notebook_adapter.mjs` yalnız `createSyntheticNotebookAdapter({sourceFixture, execute})` ve donmuş `SYNTHETIC_NOTEBOOK_ADAPTER_SQL` sabitlerini dışa açar. Factory seçenekleri güvenilir sentetik sunucu composition root'una aittir; kullanıcı isteği veya serileştirilmiş arayüz durumu bu seçeneklere aktarılmamalıdır. Source, mevcut gerçek `createSyntheticNotebookSyncPreparer` ile doğrulanır ve dış mutasyondan ayrılan donmuş kopyası tutulur.

| İşlem | Sabit SQL | Ayrı Değerler |
| --- | --- | --- |
| `prepare(request)` | Veritabanı çağrısı yok | Mevcut kapalı istemci sözleşmesi |
| `commit(command)` | `SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result` | `[JSON.stringify(intent)]` |
| `readCurrent()` | `SELECT student_notebook.read_current($1::text) AS notebook_result` | `[fixedScopeSha256]` |
| `readRevision(revision)` | `SELECT student_notebook.read_revision($1::text,$2::bigint) AS notebook_result` | `[fixedScopeSha256, String(revision)]` |

Yürütücü, donmuş `{text, values}` alır; `values` ayrı donmuş string dizisidir. Yanıt tam olarak `{rowCount:1, rows:[{notebook_result: object}]}` projeksiyonudur. Uygulama DB kimliği yürütücünün sabit sunucu closure'ına aittir; adaptör DTO'dan rol, tenant, query, executor, amaç veya onay bayrağı seçmez. Parametreli sorgu ayrımı uygulama seviyesinde doğrulandı; bir wire driver kurulmadı. Gerçek sürücü ayrı değerleri gerçekten bind etmelidir. Mevcut test amaçlı psql literal köprüsü bir üretim prepared-statement sürücüsü değildir.

Prepare sonucu `command` bu adaptör örneğinin private WeakMap capability'sidir. Aynı hash'e sahip JSON kopyası, structured clone, Proxy, revoked Proxy veya başka adaptörün komutu commit yetkisi kazanmaz ve DB hook'una ulaşmaz. Bu process-içi marka kriptografik kullanıcı oturumu, kalıcı capability veya kimlik doğrulama değildir.

## Durum Ve Bütünlük

Hazırlık sürümü ilerletmez. Doğrulanmış commit makbuzu private bilinen makbuz listesine eklenir, ancak source/preparer başlığını değiştirmez. Yalnız kapsamı, kaynak/policy/catalog/owner/steward/retention bağları, gövde ve request/makbuz hash'leri doğrulanmış açık `readCurrent()` bu başlığı ilerletir. Tarihsel okuma ve eski işlemin tam replay'i güncel başlığı geriye almaz. Ters sırada tamamlanan iki native async okumanın eski yanıtı daha yeni başlığı değiştiremez.

Bilinen makbuz aynı mutation/idempotency anahtarına farklı içeriği DB öncesinde reddeder. Yeni commit sonrası source henüz okunmamış olsa da aynı tam isteğin replay hazırlığı izinlidir; eski hazırlık etiketi `prepare_replace` kalabilir, gerçek `outcome` DB yanıtından `idempotent_replay` olarak gelir. Replay başlığının gövde SHA'sı bilinen daha yeni makbuzla da eşleşmelidir. Maksimum 100 makbuz kapasitesi açık typed ret verir; yeni kayıt kabul etmek için eski anahtar sessizce silinmez.

Kapalı inert yanıtlar 512 KiB JSON/UTF-8, 18 derinlik, 100.000 düğüm, dizi başına 512 eleman ve nesne başına 32 alanla sınırlanır. Getter, Proxy, döngü, sparse dizi, özel prototip, işlev, uygunsuz alan, yabancı kapsam, yanlış amaç/retention, altered/rehashed bilinen makbuz ve gövde uyumsuzluğu reddedilir. Native Promise yalnız standart prototype, kendi string/getter alanı olmaması ve en çok 16 inert symbol alanı koşuluyla beklenir; Node async-hook symbol ID'leri içerik/yetki sayılmaz. Özel thenable/subclass veya constructor getter'ı çalıştırılmaz. Güvenilir JS runtime intrinsic'leri değiştirilmiş bir process'e karşı sandbox garantisi verilmez.

SQL hatası/bozuk yanıt sonrası write sonucu `commitState:'unknown', persisted:null, persistenceConfirmed:false, automaticRetry:false` olur; DB'nin gerçekte commit etmiş olabileceği inkâr edilmez. DB öncesi ret `persisted:false` olur. Okuma hatası `readState:'unknown', persisted:null` kalır. Doğru makbuz `commitState:'confirmed'` ve persistence confirmation verir ama `currentHeadVerified:false, sourceAdvanced:false` kalır. Güncel boş revision 0 okumasında gövde/hash/makbuz `null` olarak korunur; içerik uydurulmaz. Hiçbir hata rollback veya otomatik tekrar yapıldığını iddia etmez.

### Dar PostgreSQL Profili

Mevcut saf hazırlayıcı tüm sonlu `[0,1]` koordinatları ve JS string'lerini kabul edebilir. Adaptör ise mevcut 002 SQL codec'i için koordinatları en fazla dört ondalık basamakla sınırlar; `0.12345`/`0.00001` açık `notebook_postgres_profile_unsupported` ret alır. `0.0003`, `0.9999`, 0 ve 1 korunur; çarpma tabanlı yanlış floating-point ret ve sessiz yuvarlama yoktur. Önceden saf sözleşmede tanımlı `-0 → 0` kanonikleştirme dışında sayı dönüştürülmez. U+0000 ve eşleşmemiş surrogate aynı typed ret ile DB öncesinde kapanır; Türkçe, emoji ve combining scalar dizileri normalizasyon yapılmadan korunur. Revizyonlar JavaScript safe-integer üst sınırının altında kalır. Makbuz ID'si mevcut SQL'in `synthetic-receipt-` + request SHA ilk 32 hanesi biçimine daraltılır; saf sözleşmenin herhangi bir geçerli makbuz ID'si profiliyle aynı kapsamda değildir.

## TDD Ve Taze Kanıt

Hook, salt adaptör sınırını test etmek için kaçınılmaz bir test double'dır. İstek/gövde/makbuz/policy hash'leri bağımsız mevcut sentetik fixture yardımcılarından; intent gerçek saf hazırlayıcıdan elde edilir. Testler yalnız hook beklentisi değil, kapalı çıktı, sıfır çağrı retleri, literal payload değişmezliği, private state ilerlemesi ve negatifi denetler. SQL'in çalıştırıldığını bu unit testlerle iddia etmeyiz.

| Tarihsel TDD Adımı | Sonuç |
| --- | --- |
| Uygulama yokken ilk 22 davranış testi | RED: 0 / 22 geçer, beklenen factory eksikliği |
| İlk küçük adaptör | GREEN: 22 / 22 |
| Confirmed makbuz sonrası değiştirilmiş idempotency gövdesi | RED: 22 / 23 → GREEN: 23 / 23 |
| Confirmed yeni makbuz varken replay-head SHA sapması | RED: 23 / 24 → GREEN: 24 / 24 |
| Own constructor getter içeren native Promise | RED: 26 / 27; Node async-hook symbol teşhisi sonrası GREEN |

Taze komut:

```sh
node --test test/synthetic_notebook_adapter.test.mjs test/synthetic_notebook_sync.test.mjs test/synthetic_student_notebook_cli.test.mjs
```

Sonuç: **54 test / 54 geçer / 0 başarısız / 0 atlanan / exit 0** (27 yeni adaptör, 19 mevcut saf sözleşme, 8 mevcut güvenli CLI). Bunlar değişebilir test snapshot sayılarıdır; gerçek adapter→SQL çalıştırma kanıtı bu kayıtta henüz yoktur. Root'un ayrı opt-in gerçek sentetik DB adapter proof'u bağımsız olarak doğrulanmalı ve ayrıca kayıtlanmalıdır.

## Açık Kalan Sınırlar

- Önceden bilinmeyen fakat kendi scope'unda içsel olarak tutarlı bir makbuzun hash'i tek başına DB kökenini veya yetkisini kanıtlamaz. Güvenilir sabit yürütücü ve 002 SQL'in bağımsız `session_user`/FORCE RLS sınırı gerekir; gerçek auth/resolver/driver entegrasyonu pending.
- Kaynak/policy/catalog `declared_synthetic_reference` profilidir; canlı DAMA resolver veya gerçek okul retention/onay kaydı değildir. `student_notebook` metin, çizgi, bookmark, not ve concern payload'ı öğrenme telemetry/analitik akışına gönderilmez.
- Güncel okuma yalnız ilgili head makbuzunu ekler, bütün geçmişi geri yüklediğini söylemez. Önceki exact replay hazırlığı için güvenilir composition root'ta o tarihsel makbuzun bulunması gerekir; 100 üstü history yükleme/paging stratejisi pending.
- Belirsiz commit sonrası canlı uzlaşma/recovery, transaction/pool/persistence driver, çapraz process idempotency hazırlığı, çoklu eşzamanlı gerçek DB yük testi ve HTTP auth pending. Yerel ters sıralı Promise testi bunların yerine geçmez.
- Plain-text içeriğin literal olması PII tespit garantisi veya güvenli HTML rendering değildir. Öğrenci verisi, silme/hukuki retention ve üretim riskleri bu sentetik sınır dışında kalır.
- UI, kullanıcı giriş oturumu, medya, SQL migrationı/harness'i ve başka ortak dosyalar bu dilimde değiştirilmedi. CMMI/SPICE/DAMA belgelendirmesi veya üretim hazır sertifikası iddia edilmez.
