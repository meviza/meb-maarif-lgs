# Sentetik, makbuz-aralığına bağlı etkinlik özeti

Tarih: 2026-10-03. Durum: yerel sentetik dikey dilim doğrulandı; üretim ve gerçek öğrenci kullanımı kapalı.

## Kapsam ve DAMA amaç sınırı

Bu dilim, önceden güvenilir sunucu bileşenlerinin hazırladığı learning-sync komutunun **kendi akışındaki tek makbuz aralığını** okuyup teknik sayaç çıkarır. Mevcut sidecar amacı `learning_progress_sync` olarak korunur. Dosyanın `packages/analytics` altında olması, `learning_analytics` için ayrı bir yetkilendirme, okul BI ürünü, akademik analiz veya öğrenen değerlendirmesi sağlamaz. Ayrı analitik amaç/politika ve etkili erişim çözümleyicisi beklemektedir.

İzin verilen olaylar yalnız `activity_started`, `hint_requested`, `activity_completed` türleridir. Yanıt, doğruluk, puan, konu hâkimiyeti, zekâ, yetenek veya kariyer sonucu üretilmez. Notlar, çizimler/strokes ve serbest metin bu kapalı olay sözleşmesine eklenmez; dijital defter için ayrı yönetişimli kalıcılık sözleşmesi gereklidir.

## Uygulanan sınır

- `adapter.readActivityWindow(command)`: yalnız aynı adapter örneğinin `prepareCommand` ile verdiği canlı nesne referansını kabul eder. JSON, klon, Proxy ve başka adapter komutu DB'ye ulaşamaz. İstemci tenant, DB rolü, aralık veya amaç seçemez.
- Tek sabit SELECT ve sekiz bağlı değer; mevcut RLS altında stream, receipt, event ve receipt-governance tabloları aynı PostgreSQL statement snapshot'ından okunur. Aralık hazırlanan batch'in ilk/son ordinalidir; 1–100 olaydır. Olay alt sorgusu sıralı ve `LIMIT 101` sınırlıdır; eksik/fazla olay ret edilir. Migration ve rol izinleri değiştirilmedi.
- Kapalı, inert, 256 KiB bütçeli yanıt kopyası; derinlik/düğüm/dizi sınırları ve getter/Proxy/döngü reddi. Olay, batch, makbuz, state snapshot ve V2 sidecar hashleri ayrı hesaplanır. Kaynak batch, katalog/politika, receipt asset owner/steward ve amaç/retention bağları sunucu hazırlığından sabitlenir. Tamamı yeniden hashlenmiş başka batch bu kaynağın yerini alamaz.
- Cursor/snapshot alanları eşleşir; hazırlık cursor'undan veya makbuzdan geriye gidilemez. Makbuzdan sonraki her versiyon için 1–100 ek olay gereklidir. Hemen sonraki cursor'da SQL'in oluşturacağı snapshot revizyonu/hash'i tam eşleşmelidir. Olay zamanı sıralı ve makbuz zamanından geç değildir; snapshot zamanı makbuz ve hazırlanmış snapshot'tan eski değildir.
- `summarizeSyntheticActivityWindow(window)`: yalnız adapter'ın kapalı WeakSet'inde işaretlenmiş, doğrulanmış ve derin dondurulmuş canlı pencereyi kabul eder. Serileştirilmiş hash, `trusted`/`verified` bayrağı veya opsiyonlar yetki yaratmaz. Bu marka in-process bileşen sınırıdır; HTTP kimlik doğrulama değildir.

Sayaçlar: başlatma, ipucu, tamamlama olay sayıları ve her etkinliğin **dahil edilen aralıktaki son olayına göre** gözlenen active/completed sayısı. Bunlar etkinliğin küresel/güncel hâli değildir. Özet `completeHistory=false`, `currentWindowOnly=true`, `currentActivityStateVerified=false`, `productionReady=false` döndürür; tüm öğrenen çıkarımları `not_inferred` kalır. Fixture ilk ordinalinin 41 olması geçmiş 40 olayın okunduğu anlamına gelmez.

## TDD ve taze doğrulama

İlk test-first çalıştırma: 40 test, eski 28 PASS ve yalnız yeni API/SQL/özet davranışlarına ait 12 beklenen FAIL. Uygulama sonrası 40/40 PASS. Ardından iki ek RED yakalandı: imkânsız rehash edilmiş cursor versiyonu ve immediate snapshot-ID substitution. Makbuz-relative versiyon/olay sınırı ve exact SQL revizyonu kontrolü sonrası 42/42 PASS. Beş ilave regresyon/uç durumuyla son yerel kapsam 47/47 PASS (adapter 31, CLI 10, özet 6), sıfır skip.

Taze genişletilmiş komut:

```sh
node --test test/synthetic_learning_ledger_adapter.test.mjs test/synthetic_activity_summary.test.mjs test/synthetic_learning_ledger_cli.test.mjs test/learning_sync_ledger_port.test.mjs test/learning_event_sync_eligibility.test.mjs test/learning_event_sync_eligibility_v2.test.mjs test/learning_event_sync_batch_contract.test.mjs
```

Sonuç: **109/109 PASS**, 0 FAIL, 0 SKIP. Negatifler: klon/Proxy/getter, eksik/tekrarlı/ters sıralı olaylar, bütün batch+receipt+sidecar'ın yeniden hashlenmiş ikamesi, historical receipt timestamp ikamesi, yanlış owner/amaç/retention/source/catalog/policy, imkânsız cursor, erken snapshot, serbest metin/not/strokes, aşırı yanıt ve SQL hata bilgisi sızdırma. Pozitifler: exact replay, sonradan ilerlemiş cursor altında eski receipt aralığı, etkinlik bazlı ayrı son-olay sayaçları ve en büyük 100-olay penceresi.

## Gerçek yerel PostgreSQL kanıtı

```sh
node tools/test_synthetic_learning_ledger_postgres.mjs --run --container k12-synthetic-ledger-summary-v1
```

`synthetic_sql_proof_passed`: eski **22 SQL + 8 adapter** tanığı korunmuş, **5 yeni persisted-window/summary** tanığı geçmiş. İki okul, dört sentetik seed stream; application roller superuser değildir. Identity, sunucu closure'ının sabit rolü ve mevcut `session_user` eşlemesidir; istemci tenant GUC'si DB kapsamını değiştiremez.

School A'da eski 41–42 makbuz aralığı iki olay; School B'de ayrı scope'ta iki olay. A'nın yeni 43–45 batch'i start/hint/complete içerir; sayaç 1/1/1, observedActive 0 ve observedCompleted 1'dir. A'da toplam beş kayıt varken eski makbuz, current cursor 45 olmasına rağmen hâlâ yalnız iki dahil edilmiş olayı sayar. Yanlış okul read-window ret edilir; serileştirilmiş pencere özet yetkisi kazanmaz.

Önbellekteki `postgres:16.15-alpine`; pull yok, network `none`, host port yok, 1 CPU, 268435456 bayt RAM, 58 MiB explicit tmpfs + 2 MiB shm, read-only container ve kısa timeout'lar. `ownedContainerStoppedAndRemoved=true`; taze `docker container inspect k12-synthetic-ledger-summary-v1` sonucu `No such container` ile kaldırma ayrıca doğrulandı. Başka container'a dokunulmadı.

Adapter gerçek `text + values` parametreli sorgu üretir. Harness'in allowlist `PREPARE/EXECUTE` literal-escaping köprüsü **test içindir**, pg wire-driver değildir. Tek statement snapshot yapısı gerçek sorguyla çalışmıştır; eşzamanlı yük/HA/restore veya üretim güvenlik denetimi yapılmış değildir.

## Açık sınırlar

Güvenilir executor/receipt hook ve sunucu çözümleyicisi bileşim noktalarıdır; hash kontrolleri DB'nin kriptografik attestasyonu değildir. Gerçek HTTP login, tenant/öğrenci auth, güncel source/purpose/retention çözümleyicileri, production pg driver, gerçek çocuk verisi ve öğrenci analitiği bağlı değildir. Sonraki cursor ara batch'leri burada okunmadığından tüm tarihsel cursor zinciri kanıtlanmaz. Bu aralık-özeti, yıllık öğrenme süreci/puan veya öğrenci kabul kanıtı olarak sunulamaz.

Bu dilimde ağ, cloud, model, credential, Drive, yeni paket kurulum veya yayın işlemi yapılmadı. Git commit/push bu görevin dışında bırakıldı.

## Ana ajan ve bağımsız denetim — 4 Ekim 00:09

Ana ajan adapter diff'ini, summary modülünü, harness bağlantısını ve kanıtı okudu; source-gap testleriyle birlikte taze dar suite **68/68**, 0 fail/skip geçti. Ayrı root deneyi `k12-synthetic-ledger-root-summary-night` içinde gerçek PostgreSQL'de **22 SQL + 8 adapter + 5 aralık/özet tanığı** verdi. A/B ledger sayıları 5/2; 41–42 ve 43–45 aralıkları ve 1/1/1 start/hint/complete sayaçları doğrulandı. Kendi container kaldırıldı; ardından tam ad `docker container inspect` sonucu `No such container` oldu. Diğer container'lar değiştirilmedi; cloud kredi kullanılmadı.

Bağımsız salt-okunur denetimde 47/47 dar ve 109/109 bağlantılı test, ayrıca **156/156** hostile/forgery/boundary probe ret verdi; getter/proxy/coercion/thenable hook 0. Source/batch/receipt/sidecar tam rehash ikamesi, purpose/owner/policy/catalog değişimi, eksik/tekrar/ters olay, foreign-scope/imkânsız cursor ve marka-klon sınırları kontrol edildi. İncelenen sınırlı sentetik bileşimde yeniden üretilebilir P1/P2 yok.

Bilinen güven sınırı bağımsız probe ile de doğrulandı: güvenilir executor'dan gelen, aynı scope'ta tam yeniden hashlenmiş ileri snapshot ve keyfî sonraki lastEvent hash/snapshotId, aradaki batch'ler okunmadığından kabul edilebilir. Bu kod DB'nin kriptografik attestasyonu veya tüm cursor zincirinin ispatı değildir. `currentActivityStateVerified=false`, `completeHistory=false` ve tüm inference alanlarının `not_inferred` olması bu açık sınırı korur; gerçek/kalıcı defter ve ayrı learning_analytics yetkisi bağlanmış sayılmaz.

Son root tam suite **740/740**, fail 0/skip 0. Bu sayı CMMI/SPICE/DAMA sertifikası veya öğrenen değerlendirme geçerliği değildir. Adapter SHA-256 `6096d25c57c509b6e69acc08a79159d698959e1a08aec8e77f637c59239efc5d`; summary SHA-256 `9a1df0e57a781a57048de6e354c33692cb2d9d13570543aa035a63928178b315`.
