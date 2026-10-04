# Defter: Gerçek sentetik SQL → yerel HTTP kanıtı

## Sonuç ve ayrı kanıt türleri

Kök ajan mevcut ağsız PostgreSQL test düzeneğini, yeni gerçek yerel HTTP sunucusu ve uygulama/adapter zinciriyle bağladı. Son koşuda **73 temel SQL +13 adapter +10 application +10 HTTP tanığı**, exit0. Bu106 tanık `npm test` sayısına eklenmez; gerçek wire-protocol sürücüsü, okul/öğrenci auth'u, kalıcı defter UI'si veya analitik kabulü değildir.

Komut: `node tools/test_synthetic_student_notebook_postgres.mjs --run --adapter --application --http --container k12-synthetic-notebook-root-http-final`.

Yeni bayrak testleri önce0/2 RED, sonra2/2 GREEN. `--http` yalnız application+adapter ile çalışabilir; `--run` yoksa SQL ve HTTP çalıştırılmadığı açık raporlanır. Eski varsayılan/adapter/application-only şekilleri korunur. İlk gerçek RED koşu73+13+10 eski tanığı başarıyla çalıştırıp kendi container'ını kapattı; yeni HTTP flag yürütülmediği için dış assertion başarısız oldu. HTTP bağlantısı sonrası GREEN, ardından bağımsız denetimin makbuz karşılaştırma önerisi eklenerek gerçek tam final koşu tekrar geçti. Makbuz karşılaştırması ek tanık adedi veya ayrı özellik RED'i değildir.

## Gerçekte sınanan geçişler

1. HTTP constructor yalnız güvenilen test kökünde, gerçek head7 ve tarihsel makbuzlardan sabit fixture/executor ile kurulur. İlk GET/current `not_read` ve null projection verir; executor0. POST/read gerçek okul rolüyle7'yi getirir; sonraki GET SQL çağırmaz.
2. POST/save gerçekten8'i yazar; eski read7 stale tutulur. İstek gövdesi current body diye gösterilmez ve otomatik read yoktur. Yalnız açık POST/read8 aynı gövdeyi getirir.
3. Aynı isteğin gerçek tekrarı `idempotent_replay`; önceki makbuzla deepEqual, history8'de kalır.
4. Fazla istemci grade alanı, escaped duplicate JSON ve Origin'siz POST gerçek SQL öncesi reddedilir; executor sayısı artmaz.
5. PostgreSQL9'u gerçekten yazar, ardından executor yanıt kaybı enjekte edilir: HTTP503, save_unknown, persisted:null, read8 stale, retry/read0. GET tek başına toparlanmaz; açık read9 gerçek kaydı getirir.
6. Yanlış okul B executor kimliği, A'nın sabit scope'u için gerçek SQL42501 alır. HTTP503 sanitized notebook_scope_denied, projectionnull; diğer okulun gövdesi sızmaz.
7. Ayrı test sunucusunda PostgreSQL10'u gerçekten yazdıktan sonra istemcinin gerçek fetch bağlantısı AbortController ile kesilir. İstemci başarı cevabı almaz; rollback varsayılmaz. GET eski read9 stale gösterir; açık POST/read10 kaydı geri getirir. Bu önceki executor-loss tanığından farklı bir gerçek HTTP transport kaybıdır.
8. Gerçek SQL okuması yapılmış, cevabı trusted hook'ta bekliyorken ikinci HTTPsave409 application_busy verir; ikinci executor çağrısı yoktur. Bu çok bağlantılı veritabanı yarış testi değildir.
9. Son A head/history10/10, B1/1, eşlenmemiş rol history0. Defter sayımları operasyonel kullanım verisidir; ayrı learning_analytics amacına, biliş/zeka/meslek çıkarımına aktarılmaz.
10. Beş yalnız bu deneye ait ephemeral loopback sunucusu finally'de kapandı. Sonra container ID sahipliğiyle yalnız kendi PostgreSQL container'ı durduruldu. Final ve önceki RED/GREEN adlarının ayrı inspect'i `No such container` verdi.

## İzolasyon, güven ve açık işler

Mevcut cached postgres:16.15-alpine; pullnever, ağnone, port/mount0, CPU1/RAM256MiB, tmpfs58MiB/shm2MiB, read-only, postgres kullanıcı, capdropALL/no-new-privileges. Cloud Sandbox/kredi/ücretli iş, yeni paket veya credential yoktur. HTTP sunucularının host loopback portları bu izole testin kontrol düzlemidir; PostgreSQL container'ının port/ağ/mount0 sınırı değişmez.

SQL query text allowlist ve ayrı immutable values, sabit okul rolleri, aynı-session PREPARE/EXECUTE/literal bridge korunur. Bu köprü üretim PostgreSQL wire-driver değildir. Kaynak fixture'ını gerçek SQL history'den test composition kökü kurar; gerçek auth/catalog resolver değil. HTTP constructor'a source/executor sağlamak güvenilen sunucu yetkisidir; localhost ve Origin kimlik doğrulaması değildir. Uygulamanın `realDatabaseVerified:false` flag'i doğru kalır; gerçek SQL kanıtı bu dış koşudur.

Bağımsız salt-okunur denetimler frozen HTTP modülünde85/85 ve50/50 ilişkili test, ayrıca45 negatif/4 pozitif HTTP probe ve source-level SQL/root cleanup incelemesi yaptı. Denetçiler ikinci Docker/SQL koşusu yaptıklarını iddia etmedi. İncelenen dar seam'de açık P1/P2 kalmadı. CLI'nin revoked-Proxy native hata kolu ayrı TDD3PASS/1FAIL→4/4 ile kapatıldı; göreve ait olmayan browser/account/env verisi aranmadı.

Gerçek auth/TLS, wire-driver/pooling, sunucu lifecycle/rate-limit ve never-settling trusted hook, çok bağlantılı yarış/crash/load, retention/erase/restore, migration001+002 üretim zinciri ve öğrenci defter UI'si açıktır. Testler DAMA/CMMI/SPICE/MEB sertifikası veya pedagojik geçerlik vermez. [HTTP sözleşmesi ve sınır testleri](SYNTHETIC_NOTEBOOK_HTTP_EVIDENCE_2026-10-04.md).
