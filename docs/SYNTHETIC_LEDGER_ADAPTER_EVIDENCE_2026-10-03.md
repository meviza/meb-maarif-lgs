# Sentetik öğrenme kaydı — uygulama adaptörü kanıtı

2026-10-03 devam fazı. Kanonik dal `codex/k12-foundation-audit`; başlangıç `976505f`. Bu teslim yerel, izole ve sentetiktir. HTTP oturumu, gerçek yetki/kaynak çözümleyicisi, üretim PostgreSQL sürücüsü, okul verisi veya öğrenci analitiği bağlı değildir. Migration değiştirilmedi.

## Eklenen sınır

`packages/persistence/synthetic_learning_ledger_adapter.mjs` yalnız Node yerleşik modülleri ve mevcut sözleşmeleri kullanır. Sunucu kompozisyonu `createSyntheticLearningLedgerAdapter({ execute, createReceiptMetadata })` ile iki güvenilen hook'u kurar. Hook'lar kapalı constructor şemasındadır; DB rolü, tenant, connection string veya ek yetki alanı operation argümanı değildir. Gerçek sunucu bu factory/prepare API'sini ham HTTP istemcisine açamaz; bütün server-resolved DTO'ları yetkili çözümleyiciden sağlamalıdır.

- `prepareCommand(input)`, getter/Proxy çalıştırmadan descriptor kopyası alır; döngü, özel prototip, sparse array, symbol/function/undefined ve taşan veri reddedilir. Sınırlar: 256 KiB DTO, derinlik 24, 10.000 düğüm, record başına 64 alan ve array başına 128 eleman. Mevcut `prepareLearningSyncLedgerCommand` aynı çağrıda V2 kanıtı yeniden değerlendirir.
- Yalnız bu adaptörün hazırladığı, immutable canlı command referansı WeakMap capability'sidir. JSON/clone, başka adaptörün command'i ve Proxy yetki taşımaz. Bu işaretleme bir kimlik doğrulama sistemi veya serileştirilmiş iş kuyruğu imzası değildir.
- `append`, `replay`, `read` bu capability ile çalışır. Sabit SQL ve ayrı `$1…$3` değerleri üretilir; adapter içinde SQL literal interpolasyonu, `SET ROLE`, tenant GUC veya istemciden rol seçimi yoktur. Read yalnız locator + scope hash + event-stream üçlüsünü sorgular; mevcut FORCE RLS ve `session_user` eşlemesi DB sınırını uygular.
- Append makbuzu ve DAMA sidecar binding'i command'in sabit hash/range/cursor/catalog/purpose/retention kanıtlarından kurulur. O command için ilk sunucu receipt metadata'sı korunur; açıkça tekrar çağrılan append yeni receipt zamanı/kimliği üretmez. Tarihsel replay metadata hook'u çağırmaz.
- Executor yalnız `{ rowCount, rows: [{ ledger_result }] }` normalleştirilmiş cevabı döndürür. Tam `pg` response nesnesi bu kapalı sözleşme değildir. Response getter/Proxy/thenable/ek alan, yanlış tür, hash/range/outcome/cursor ve bütçe taşması reddedilir. Success kopyaları immutable ve `syntheticOnly=true`, `productionReady=false` taşır.

Fresh accepted cursor'u, SQL'in snapshot revision/capturedAt değişimiyle yeniden hesaplanan hash ve tam bir sonraki sürüm/aralıkla bağlanır. Replay ve read hazırlama snapshot'ına göre geriye gidemez. Aynı sürüm aynı sıra/son olay/state hashini korur; ilerleyen sürüm başına 1–100 yeni olay sınırı vardır. Read bütün scoped state snapshot'ını yeniden hashler. İlerlemiş tarihsel replay cevabı tam snapshot içermediği için onun yeni state hashinin yalnız biçimi/ilerleme bağları doğrulanır; bağımsız yeni snapshot hash kanıtı gerektiğinde ayrı read gerekir.

Yazma executor hatası veya geçersiz response **`commitState: unknown`** döndürür: başarılı commit iddiası yok, otomatik tekrar yok, veri/SQL/error message sızıntısı yok. Yerel capability/kind/metadata reddi `not_attempted` kalır. SQLSTATE yalnız sınırlı hata sınıfına çevrilir; `23505` bucket'ı idempotency dışındaki uniqueness hatalarını da kapsayabilir, tam hata nedeni/üretim kurtarma politikası değildir.

## RED → GREEN ve taze doğrulama

İlk **14 adapter testi**, export eksikliği nedeniyle doğru RED oldu; implementation sonrası 14/14 GREEN. Test-only psql köprüsünün iki davranışı önce RED oldu, sonra mevcut yedi CLI testiyle 9/9 GREEN. Sonraki cursor gerilemesi/same-version snapshot ikamesi için üç gerçek negatif RED; SQL'in uzun snapshot ID'sine revision eklemesinde bir yanlış ret RED; düzeltilince GREEN. Aşırı ama doğru yeniden hashlenmiş response regresyonu, byte budget kontrollü olarak 512 KiB'ye yükseltildiğinde RED oldu; 256 KiB sınırı geri getirildikten sonra GREEN. Geçici mutasyon teslimde yoktur.

Adapter dosyası **19**, CLI dosyası **9** test içerir. İlgili V1/V2/port sözleşmeleriyle koşu:

```sh
node --test test/synthetic_learning_ledger_adapter.test.mjs test/synthetic_learning_ledger_cli.test.mjs test/learning_sync_ledger_port.test.mjs test/learning_event_sync_eligibility.test.mjs test/learning_event_sync_eligibility_v2.test.mjs
```

Sonuç: **75/75 pass, fail 0, skip 0**. Bu rapor ana ajan tam suite koşusunun yerine geçmez. Ayrı salt-okunur adversarial probe: receipt'in 18 alanına dört yanlış tür/null, cursor'un dört alanına dört yanlış tür/null ve 270.000 karakterli, yeniden hashlenmiş geçerli read snapshot'ı; **89 probe, beklenmeyen kabul 0**. Probe davranış kanıtıdır, exhaustive güvenlik sertifikası değildir.

Syntax ve whitespace:

```sh
node --check packages/persistence/synthetic_learning_ledger_adapter.mjs
node --check tools/test_synthetic_learning_ledger_postgres.mjs
git diff --check -- tools/test_synthetic_learning_ledger_postgres.mjs test/synthetic_learning_ledger_cli.test.mjs
```

## Gerçek PostgreSQL entegrasyonu

```sh
node tools/test_synthetic_learning_ledger_postgres.mjs --run --container k12-synthetic-ledger-adapter-final-v1
```

`--run` olmadan araç Docker/veritabanı açmaz. Yalnız önbellekteki `postgres:16.15-alpine`, `--pull=never`, task-owned yeni container kullanılır; mevcut container devralınmaz. İmaj kimliği `sha256:ef738a34a8651d11b2bace81c55c7e2187f786b484add6c83070884340074368` gözlendi; indirme/kurulum yapılmadı.

Sonuç: eski **22 SQL tanığı** ve ayrıca **8 adapter tanığı** geçti; yeniden koşular toplanarak yeni kabul adedi oluşturulmaz. İki sentetik okul/dört seed stream; uygulama rolleri superuser değil. `a` executor 8, `b` executor 2 DB çağrısı; otomatik tekrar 0.

1. Fresh append ve duplicate aynı immutable server receipt'i kullanır; iki olay/bir makbuz ve metadata bir kez.
2. Scoped read gerçek persisted snapshot/cursor hashini doğrular.
3. Tarihsel replay receipt hashine bağlanır; generic fixture state'ini DB resolution saymak yerine önce gerçek read sonucu alınır.
4. Sabit okul-A DB rolü okul-B append/read'ini reddeder.
5. Gerçek stale cursor SQLSTATE `40001` güvenli hata sınıfına döner; tekrar yapılmaz.
6. Gerçek çelişkili batch hash SQLSTATE `23505` çatışma sınıfına döner.
7. Clone command ve constructor rol override DB çağrısı yapmaz.
8. İki sabit non-superuser role closure ayrı okul kayıtlarını korur.

SQL'in önceki null/hash, immutable receipt/sidecar, yetkisiz yazı ve atomic rollback tanıkları korunmuştur. Bu koşuda adapter'a ait transaction kabulü mevcut SQL fonksiyonlarının tek statement atomicliğinden gelir; production pool/retry/connection lifecycle kanıtı değildir.

PSQL köprüsü aynı session içinde allowlist sabit statement için `PREPARE/EXECUTE/DEALLOCATE` çalıştırır. JSON/text literal quote escaping **yalnız test köprüsündedir**; gerçek wire-parametreli `pg` driver kurulmuş veya test edilmiş değildir. DB kimliği test sunucusunun closure'ından gelir, query payload'ından gelmez.

Container sınırları: network none, host port 0, CPU 1, RAM 256 MiB, tmpfs 58 MiB + shm 2 MiB, read-only root, postgres user, cap-drop ALL. Statement timeout 5 s, lock timeout 2 s. Araç yalnız oluşturduğu ID'yi durdurur; `--rm` sonrasında task-owned container adı kontrolünde kayıt yoktur. Başka container'lara dokunulmadı.

## Açık kapılar / iddia edilmeyenler

Gerçek HTTP auth, school-entitlement/source resolver, server clock/receipt-ID işletimi, wire driver/pool ve transaction callback, restore, yük/kota, retention/deletion işletimi ve analitik bağlantısı yoktur. Hook'ların iç etkileri güvenilen sunucu entegrasyonuna aittir; özellikle native Promise resolution, DB bağlantı kimliği ve gerçek zaman/policy freshness adapter'ın tek başına ispatladığı şeyler değildir. Malformed response commit'i geri alamaz; uygulama unknown sonuçtan sonra yetkili historical lookup/reconciliation tasarlamalıdır.

SQL canonical hash kanıtı mevcut ASCII anahtar/tamsayı fixture'larıyla sınırlıdır; genel sayı/Unicode kodlaması veya bütün müfredat/öğrenme doğruluğu kabulü değildir. Gerçek öğrenci verisi, cloud/model/ücretli iş, yeni credential, Drive upload veya yayın çağrısı 0. DAMA lifecycle sidecar izlenebilirliği, CMMI/SPICE test–kanıt disiplini sürdürülür; sertifika, olgunluk derecesi veya üretim onayı verilmez.

## Ana ajan ve bağımsız tekrar kontrolü

Ana ajan aynı ilgili suite'i yeniden **75/75**, ardından tam suite'i **673/673 pass, fail 0, skip 0** çalıştırdı. `node tools/test_synthetic_learning_ledger_postgres.mjs --run --container k12-synthetic-ledger-root-adapter-night` ayrıca exit 0: **22 SQL + 8 adaptör kontrolü**, a/b 8/2 executor çağrısı, otomatik tekrar 0. `ownedContainerStoppedAndRemoved=true`; tam ad filtresi sonra boş döndü. İki koşunun kontrol sayıları toplanmaz; cloud Docker/kredi kullanımı değildir.

Başka ajan salt-okunur denetiminde ilgili 75 test ve 72 ayrı hostile/acceptance-boundary probe geçti; yeni yeniden üretilebilir P1/P2 raporlanmadı. Native Promise subclass'ın then hook'u çalışabilir: bu açıkça güvenilen server executor içidir, inert DTO/getter reddiyle karıştırılmaz. İlerlemiş tarihsel replay'in yeni hash kanıtı için ayrı scoped read gerekliliği ve genel wire driver/auth/resolver eksikleri korunur. Probe'lar tam suite sayısına eklenmez.
