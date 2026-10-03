# Sentetik öğrenci defteri PostgreSQL sınırı — 4 Ekim 2026

Güncel durum: Ana ajan dondurulmuş SQL/düzeneği okuyup gerçek ağsız PostgreSQL koşusunu yürüttü: **73/73 runtime tanığı**, exit 0; `databaseProofExecuted:true`, `productionReady:false`, `containerStopped:true`. Exact-name bağımsız Docker inspect de `No such container` verdi. Aşağıdaki ajan Node sonuçları ve gerçek root SQL sonucu ayrı kanıtlardır; biri diğerinin yerine sayılmaz. Gerçek öğrenci uygulaması bağlı değildir.

## Amaç ve sahiplik

Defterin serbest metni, notları, soruları kaydetme işaretleri, endişeleri ve kalem çizgileri `student_notebook` amacıyla ayrı saklama sınırına hazırlanır. `learning_progress_sync` olaylarına veya öğrenme/zeka/başarı analitiğine aktarılmaz. Yeni beş dosya dışında mevcut sözleşme, 001 migration, adapter, öğrenci arayüzü ve ortak testler değiştirilmedi.

Bu bir **bağımsız, taze, ağsız sentetik veritabanı kanıtıdır**. 002 dosyası mevcut 001 uygulanmış veritabanına veya bir üretim migration zincirine çalıştırılacak sürüm değildir; kendi `pgcrypto` şemasını kurar. İki sentetik okul/öğrenciye yalnız sabit rol–kapsam eşlemesiyle erişim verilir. Gerçek okul/çocuk verisi yoktur.

## Güven sınırı ve SQL API

| Çağrı | Amaç | Yetki kaynağı |
|---|---|---|
| `student_notebook.commit_intent(jsonb)` | Kapalı şemalı hazırlanmış niyeti doğrula; beklenen revizyonu atomik kaydet veya aynı makbuzu döndür | Değiştirilemeyen sunucu bağlantı rolünün `session_user` eşlemesi ve DB'ye önceden yerleştirilmiş kaynaklar |
| `student_notebook.read_current(text)` | Yalnız kendi kapsamının güncel gövdesi ve eşleşen makbuzu; tek join/snapshot | Aynı kapsam eşlemesi + FORCE RLS |
| `student_notebook.read_revision(text,bigint)` | Güncel başlık ilerlemiş olsa bile yalnız kendi kesin tarihsel revizyonunu oku | Aynı kapsam eşlemesi + FORCE RLS |

İstemci okul, öğrenci, sınıf, yıl, rol, `trusted` veya `authorized` alanı vererek yetki alamaz. Hash yeniden hesaplamak da yetki değildir. JSON locator eşleşse bile kapsam FORCE RLS tarafından bağımsız denetlenir. GUC'ler hiçbir erişim politikasında okunmaz; `SET ROLE` ve başka `SESSION AUTHORIZATION` geçişleri negatif kanıt düzeneğinde reddedilir. Fonksiyon sahibi NOLOGIN/NOSUPERUSER/NOBYPASSRLS; uygulama rolleri süper kullanıcı değildir. PUBLIC tablo/fonksiyon varsayılanları kaldırılır, `search_path` sabittir ve tablo referansları şema niteliklidir.

DB kendi güvenilir katalog/asset/policy/target kayıtlarının kapalı şemasını, hashlerini, amaç/sınıflandırma/saklama sınıfını, owner/steward alanlarını ve izin verilen hedefleri kontrol eder. Niyetin governance binding'i bunlardan yeniden türetilen kayıtla bire bir eşleşmelidir. Canlı DAMA kaynak çözümleyicisi veya efektif politika servisi burada uygulanmış değildir: kaynaklar `declared_synthetic_reference` durumundadır.

## Revizyon, geçmiş ve atomiklik

- Bir defter satırı kısa `FOR UPDATE` kilidiyle alınır; dış ağ/model çağrısı yoktur.
- Yeni yazıda `expectedRevision` ve `priorBodySha256` güncel başlıkla eşleşir. Gövde, request ve intent hashleri SQL'de tekrar hesaplanır.
- Aynı kapsam + idempotency/mutation çifti + aynı istek/gövde aynı değişmez makbuzu döndürür; yeni tarihçe satırı oluşturmaz. Farklı içerik veya tek anahtarın başka mutation'la kullanılması `23505` çakışmasıdır.
- Hazırlayıcının `historicalReceipt` beyanı yetki değildir; gerçekten saklanan makbuzla eşleşmelidir. Tarihsel exact replay güncel başlığı geri almaz.
- Gövde + ilk niyet + governance binding + hashli makbuz tek tarihçe satırında kaydedilir ve başlık aynı işlemde güncellenir. UPDATE/DELETE/TRUNCATE değişmezlik trigger'larıyla reddedilir.
- Kanıt düzeneği başarılı transaction içi yazıdan sonra hata oluşturup başlık/tarihçe geri alınmasını denetler. İleri başlık sonrası eski revizyona bağlı ikinci aday yazı ayrıca reddedilir. **Gerçek eşzamanlı çoklu bağlantı yük/race testi henüz yoktur**; serialize edilmiş aday ve rollback tanıkları bunun yerine sunulmaz.

## Hash ve gövde profili

Sözleşmenin JS canonical JSON alan sırası ASCII şema anahtarları için SQL `COLLATE "C"` ile karşılaştırılır. Sayısal trailing zero normalize edilir, Unicode metin normalize edilmez veya çevrilmez. Çizim koordinatları yalnız `0..1` ve en fazla dört ondalık basamakla kabul edilir (`0.125`, `0.0001`, `0`, `1` dahil). Daha hassas koordinat `22023` ile reddedilir; **otomatik yuvarlama yoktur**. Saf JS hazırlayıcı `0.12345` gibi daha hassas sonlu koordinatları kabul ettiğinden bu persistence profili bilinçli olarak daha dardır.

PostgreSQL JSONB, U+0000 ve eşleşmeyen Unicode surrogate karakterleri saklayamaz; bunlar sessizce silinmez veya dönüştürülmez. Saf hazırlayıcı U+0000 metni kabul edebilir. Bu farklılık açık profile gap'tir, veri kaybı gizlenmez. Metin bütçesi JS ile aynı UTF-16 birimlerine göre ayrıca ölçülür (emoji iki birim). HTML benzeri metin yalnız literal `plain_text` içerik olarak saklanabilir; bu ne güvenli HTML renderı ne PII tespit garantisidir.

Outer intent en fazla 512 KiB; kaynak policy gövde bütçesi bağımsız 64/128/256 KiB profilindedir. Nokta, çizgi, not, endişe, bookmark sayıları ve hedef/sınıf/kind kapsamı kapalı şemayla doğrulanır. Bütçeler ve gövde şekli hash hesabından önce denetlenir. Ana ajanın gerçek PostgreSQL koşusunda Türkçe + emoji + tırnak/backslash/newline/tab ve `0.125/0.0001` için altı bağımsız canonical/hash karşılaştırması geçti. Bu yalnız denenen dar profil kanıtıdır; genel IEEE754/JSON-number codec uyumluluğu iddiası yoktur.

## TDD ve taze yerel doğrulama

İlk test dosyası yeni uygulama/fixture'dan önce yazıldı. `node --test test/synthetic_student_notebook_cli.test.mjs` ilk koşu **0 pass / 7 fail**, yeni API ve dosyalar olmadığı için beklenen feature-missing RED verdi. CLI/fixture uygulaması sonrası aynı komut **7 pass / 0 fail / 0 skip** oldu. Daha sonra mevcut sınırın açıklığını doğrulayan bir bağımsız canonical/profile-gap test eklendi; bu son test için yeni üretim davranışı uygulandığı veya ayrı RED görüldüğü iddia edilmez.

Son taze komutlar:

```sh
node --test test/synthetic_student_notebook_cli.test.mjs test/synthetic_notebook_sync.test.mjs
# 27 tests / 27 pass / 0 fail / 0 skip
node --check tools/test_synthetic_student_notebook_postgres.mjs
# exit 0
```

Gerçek SQL runtime assertionları migration implementation dosyası oluşturulmadan önce düzeneğe eklendi. Bu ajan runtime RED/GREEN yürütmedi. Ana ajan yalnız migration sonrası gerçek GREEN koşusu yürüttü; ayrı function-missing SQL RED koşusu yapılmadı ve yapılmış gibi sayılmaz. CLI/fixture'ın yukarıdaki gerçek RED/GREEN kanıtı bundan ayrıdır.

## Opt-in gerçek kanıt koşusu

```sh
node tools/test_synthetic_student_notebook_postgres.mjs --run --container k12-synthetic-notebook-root-green-20261004
```

`--run` olmadan çıktı yalnız `state:not_run`, `databaseProofExecuted:false`, `productionReady:false` olur. Import veya varsayılan testler Docker çağırmaz. İsim yalnız `k12-synthetic-notebook-*` allowlist'inden seçilebilir; mevcut aynı isimli konteyner devralınmaz. Kaynaklar değiştirilemez: önbellekteki `postgres:16.15-alpine`, `--pull=never`, network none, host port/mount yok, CPU 1, RAM 256 MiB, read-only, postgres kullanıcı, cap-drop ALL/no-new-privileges, 100 PID; tmpfs toplam 58 MiB + shm 2 MiB. Host PG/driver/SDK kurulmaz, dosya indirilmez, credential gerekmez.

Test köprüsü yalnız üç sabit SQL metniyle aynı psql oturumunda PREPARE/EXECUTE/DEALLOCATE yapar; literal quoting yalnız bu bounded proof içindir. **Gerçek wire-protocol parameterized driver veya uygulama adapterı değildir**. Rol private server-owned harness closure'ındadır; query DTO rol seçemez.

Cleanup yalnız yeni oluşturulan konteynerin adı ve exact ID yeniden eşleşirse `stop --time 5` ile yapılır; `--rm` kendisini kaldırır. Sıradan Docker hatası “yok” sayılmaz: açık `No such container/object` kanıtı gerekir. Cleanup doğrulanmadan passed çıktısı verilemez. Ana ajan koşusunda cleanup confirmed; ardından ayrı exact-name inspect yine `No such container` verdi.

Ana ajan tarafından gerçekleşen **73 tanık**: role/RLS/no-scope; başka okul ve yeniden hashlenmiş sınıf/öğrenci/yıl/defter reddi; GUC/rol değiştirme reddi; Unicode/decimal hash eşitliği; null/extra schema/format/unknown hedef/duplicate/budget/precision/hash/governance ihlalleri; tek commit–exact replay–literal readback; stale/prior-body/key çakışması; transaction rollback; başlık ilerleyince tarihi makbuz ve revizyon okuma; direct write + history değişmezliği; iki okulun bağımsız başlıkları. A'nın güncel revizyonu2/tarihçe2, B'nin revizyonu1/tarihçe1; unmapped rol0 satır. Tekrar aynı makbuzu verir; eski revizyon1 güncel2 olsa da kendi değişmez gövdesiyle okunur. Serialized rakip aday gerçek çoklu bağlantı race testi değildir. Önceki ledger35 tanığı tekrar koşulmadı ve bu73 sayısına eklenmez.

Koşulan image ID: `sha256:ef738a34a8651d11b2bace81c55c7e2187f786b484add6c83070884340074368`. Pull/network/port/mount/ücretli kredi yok; yalnız sentetik fixture. Taze tüm repo koşusu ayrıca **839/839 PASS, fail0/skip0**; SQL73 bunlara eklenmez.

## Frozen core hashleri

| Dosya | SHA-256 |
|---|---|
| `db/migrations/002_synthetic_student_notebook.sql` | `34f902f4b367420a886e6a8b28496587d218f0fe3eeb21d3b0ae0b0be913a0a4` |
| `tools/test_synthetic_student_notebook_postgres.mjs` | `3d729fb4e601d76414a44888882ed0f3353c10dd1538065a01da97200583d289` |
| `test/synthetic_student_notebook_cli.test.mjs` | `afb89d17712abffe1827fa360d9012706fc74a75b0721c2b35c09b77fc9f9717` |
| `test/support/synthetic_notebook_fixture.mjs` | `2586324f63245d66c703847b7fe5ad6f33aacec49cad2ae9381d354f3a9eb672` |

Core toplamı 63,529 bayt / 744 satır; istenen 512 KiB üst sınırının altındadır.

## Üretim için açık kapılar

SQL dilimini yazmayan ajan bütün migration/harness/fixture'ı salt-okunur inceledi: taze **27/27** test, syntax exit0; ek **94 negatif ret/19 pozitif** JS-fixture-PREPARE probe ve hook0. Fixed `session_user`/FORCE RLS/definer/grants, null/kapalı şema, governance/hash ve replay sınırında yeniden üretilebilir P1/P2 bulgu yok. Dört frozen core SHA tekrar aynı. Bu ajan Docker çalıştırmadı; bağımsız statik/pure audit root'ın gerçek73 SQL tanığı yerine geçmez. İlk null-prototype deepEqual exploratory hatası audit düzeneğine aitti; tamamlanmamış probe başarı sayılmadı.

Gerçek HTTP/auth, kullanıcı oturumundan rol seçimini sağlayan güvenilir sunucu composition root'u, canlı DAMA/effective-policy/catalog zinciri, wire driver/adapter, UI→commit→readback entegrasyonu, disconnect sonrası commit-unknown politikası, gerçek çocuk verisi, şifreleme, yedek/restore, çoklu bağlantı race/load, saklama/erasure ve kurum operasyonları bu dilimde uygulanmadı. Değişmez sentetik geçmiş gerçek kişisel veriye uygulanmadan önce bağımsız, yetkili ve denetlenebilir retention/erasure tasarımı gerektirir. Bu kanıt için hiçbir CMMI/SPICE/DAMA/KVKK veya pedagojik sertifikasyon/onay iddiası yapılmaz.
