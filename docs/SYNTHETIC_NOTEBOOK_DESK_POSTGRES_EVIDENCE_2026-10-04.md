# Sentetik defter masası → PostgreSQL önizleme seam’i

Son frozen araçla ana ajanın ayrıca yürüttüğü üç gerçek SQL ve native tarayıcı denemesi [ortak kabul kaydındadır](SYNTHETIC_NOTEBOOK_DESK_SQL_BROWSER_EVIDENCE_2026-10-04.md). Aşağıdaki yazar testi ile bu ayrı dış tanık birbirinin yerine sayılmaz.

## Durum ve sınır

Bu faz, mevcut sabit defter arayüzünü mevcut sentetik SQL sözleşmesine bağlayan **ayrı, opt-in geliştirme aracıdır**. Aracın hermetik testleri geçti; bu belgeyi yazan ajan gerçek Docker, SQL veya tarayıcı denemesini çalıştırmadı. Gerçek PostgreSQL + yerel tarayıcı ortak kanıtı ana ajanın ayrı, taze kanıtına bağlıdır. Aracın hazır URL yazması tek başına kullanıcı akışı, üretim kabulü veya kimlik doğrulama değildir.

Mevcut bellek önizlemesi, ürün API’si, SQL migration’ı, web arayüzü, kaynak envanterleri ve onay kapıları değiştirilmedi. `realDatabaseVerified:false`, `authentication:not_implemented`, `learnerReady:false`, `productionReady:false` ve `learningAnalyticsMapped:false` istemci/API üzerinde korunur. Gerçek SQL çalıştırma kanıtı yalnız araç dışındaki kapsamlı kanıtla eşleştirilir; callback’in verdiği bir satır DB/kimlik yetkisi değildir.

## Sahiplik ve kullanım

- `tools/synthetic_notebook_desk_postgres_preview.mjs`
- `test/synthetic_notebook_desk_postgres_preview.test.mjs`
- Bu kanıt belgesi.

Varsayılan çağrı Docker veya HTTP sunucusu çalıştırmadan `not_run` döndürür:

```sh
node tools/synthetic_notebook_desk_postgres_preview.mjs
```

Yetkili, mevcut cached imajla gerçek pilotu başlatmak için:

```sh
node tools/synthetic_notebook_desk_postgres_preview.mjs --run --port 0 --container k12-synthetic-notebook-desk-root-normal --scenario normal
```

`normal`, `reply-loss-once` ve `stale-once` senaryoları kapalı seçimlerdir; başka host, SQL, veritabanı rolü, kaynak, hesap, dosya yolu, token veya endpoint seçeneği yoktur. `--run` tekrar edemez; port `0` veya `1024–65535`, konteyner adı yalnız mevcut sentetik harness ad profilidir. Gerçek tarayıcı QA’sı için araç, yalnız `127.0.0.1` üzerinde OS’nin verdiği portla hazır URL çıktısı üretir. `SIGINT`/`SIGTERM` kapanışı veya 600 saniyelik sahip olunan oturum süresi, sunucuyu kapatıp son SQL tanığını toplar ve ID-sahipli temizlemeye gider. Otomatik süre sonu `deadline_cleanup`, çıkış kodu 1 ve `deadlineIsProofPass:false` olur; başarıya çevrilmez.

## Veri ve işletim sınırı

`demo-school-a` / `synthetic-student-a`, 6. sınıf, 2026–2027 ve `synthetic-notebook-a` test fixture’ı aynı sabit katalog/politika hash’leriyle başlar. İlk SQL okumasında sürüm 0, gövde ve makbuz null doğrulanmadan hazır sunucu açılmaz. Bu bir sentetik scope’tur; gerçek okul/çocuk kaydı değildir.

Mevcut harness’ın public Docker/psql builder’ları kullanılır. Yalnız cached `postgres:16.15-alpine`; `--pull=never`, network-none, 1 CPU, 256 MiB RAM, 58 MiB tmpfs, 2 MiB shm, read-only kök, postgres kullanıcısı, capability drop ve no-new-privileges korunur. Host port/mount yoktur. İzole test konteynerindeki parola gerektirmeyen yerel test kurulumu üretim kimlik doğrulaması için örnek değildir.

Mevcut ad bulunursa takeover yapılmaz. Dönen gerçek 64 haneli oluşturma ID’si doğrulanır; bütün sonraki `docker exec` ve `stop` bu ID’ye gider. Temizleme öncesi exact-ID inspect yapılır; bilinmeyen daemon durumu veya başka ID, yokluk/sahiplik onayı sayılmaz. Oluşturma denendiyse fakat ID doğrulanamıyorsa temizleme **belirsiz** raporlanır; isim üzerinden tahmini silme yapılmaz.

Readiness toplamı 10 saniyelik zaman sınırı, en çok 50 probe ve probe başına en çok 500 ms ile sınırlıdır. Diğer komutlar en çok 20 saniye, subprocess çıktı bütçesi 2 MiB’dir. Yaşam süresi saati ID alındığı anda başlar; SIGINT/süre sonu sonrası startup devam edip yeni sunucu dinlemeye geçemez. Senkron subprocess çalışırken event-loop sinyal/süre işleme gecikebilir; komut deadline’ı bu gecikmeyi sınırlar, işlem anında atomik durdurma garantisi değildir. SIGKILL, host/daemon kaybı ve aynı UID’li dış müdahale otomatik temizleme garantisi kapsamında değildir.

Uygulama SQL rolü `synthetic_notebook_school_a_app` olarak sabittir. Rolün superuser/bypass-RLS/createdb/createrole olmaması başlangıçta doğrulanır. Migration’ın `session_user → principal_scopes` sınırı korunur; istemci rol veya tenant seçemez. `PREPARE/EXECUTE/DEALLOCATE` bridge’i allowlist’li typed SQL ve literal-escaped değerler kullanır; bu bir üretim wire-protocol parametreli driver değildir.

## Kayıt ve hata tanıkları

`createSyntheticNotebookDeskPostgresExecutor(trustedSyncTransport, scenario)` yalnız güvenilir kod bileşimidir. Sabit fixture ve inert/frozen sorgu sınırı, mevcut adapter’ın pure preparation kontrolüyle exact canonical intent’e bağlanır. İddia edilen prior hash/sürüm, yalnız biçim preflight’ıdır; gerçek güncellik ve commit kararı SQL tarafından ayrıca doğrulanır. Tam yeniden hashlenen başka kaynak veya permission yetkisi yaratılmaz. Bozuk intent/hash/governance/ek alan ve PostgreSQL dışı 5 ondalıklı nokta, senaryo yan etkisinden önce reddedilir.

En çok 256 dış SQL-hook çağrısı; tek parametre, 512 KiB JSON, 14 düzey ve 100.000 node sınırı vardır. JSON sayısal taşması (`1e999`), proxy/accessor/thenable ve ham callback hatası başarı veya tekrar sebebi olmaz. SQLSTATE’den yalnız bilinen dört sınıf güvenli hata koduna taşınır; raw stderr, kaynak gövdesi, private yol veya credential çıktılanmaz.

- **Normal:** `GET /api/notebook/current` cached görünümü okur, SQL 0. Açık POST-read sürüm 0’ı doğrular; save yazma makbuzu verir fakat önceki read’i değiştirmez. Yeni POST-read kayıtlı gövdeyi doğrular.
- **Reply-loss-once:** İlk doğrulanmış başarılı SQL commit sonucu alındıktan sonra bir kez kontrollü hata atılır. API `persisted:null` verir; gerçek commit yapılmış olabilir. Otomatik yeniden yazma veya okuma yoktur. Açık okuma, gerçek SQL head’i getirir. Bu senaryo **post-SQL uygulama yanıt kaybı enjeksiyonudur**; gerçek TCP kaybı, rollback veya ağ arızası deneyi değildir.
- **Stale-once:** İlk valide save öncesi sabit özgün sentetik gövdeyle bir alternatif gerçek SQL commit yapılır; ardından eski expectedRevision 0 isteği SQL’e gider ve çatışır. Açık okuma sürüm 1’de alternatif gövdeyi getirir. Bu **scripted alternate commit**; çok bağlantılı yarış, yük veya eşzamanlılık kanıtı değildir.

Kapanışta ayrı fixed-role SQL-read ve history count; sürüm/history tutarlılığı, body/receipt hash’i ve operasyonel gövde adetleri küçük güvenli özetle raporlanır. Final SQL-read/startup-read sayaçları uygulama hook sayaçlarına dahil değildir. `currentReadCount`, açık adapter read **denemelerini** sayar; API GET veya her denemenin doğrulandığı iddiası değildir. Makbuz/çizgi/metin adetleri öğrenme ve akademik/bilişsel ilerleme ölçümü değildir. Tam gövde veya başlık metni rapora kopyalanmaz.

## TDD ve taze doğrulama

İlk missing-module RED’den sonra kapalı davranış stublarında **0/10 RED**, minimal implementation sonrasında **10/10 GREEN** gözlendi. Query-budget/JSON-depth/oversize karakterizasyonları ile 13 test geçti. Sonra dört gözlemlenebilir bug/sınır için **13 pass / 4 fail RED → 17/17 GREEN**:

1. Readiness sırasında yaşam süresi saatinin başlatılmaması.
2. SIGINT temizlemesinden sonra startup’ın 49 ek SQL probe’a devam etmesi.
3. JSON numeric overflow’un null’a canonicalize edilebilmesi.
4. Bozuk frozen raw intent’in scripted alternate commit’i tetikleyebilmesi.

Gerçek CLI’nin Docker OS transport’u hermetik olarak stublandı; süre testi 600s timer’ı daraltarak pending-readiness kapanışını, SIGINT testi temizlemeden sonraki SQL çağrısı 0’ı gözledi. Bu stub testleri gerçek Docker/PostgreSQL çalıştırma onayı değildir. Ek gerçek yerel HTTP testinde mevcut server+adapter+bridge, SQL-free GET ve save/read ayrımını çalıştırdı; dış SQL taşıma katmanı o testte bellek test double’ıydı.

Bağımsız denetimde P2 düzeyinde bir tanık doğruluğu bulgusu daha kapatıldı: advanced-replay head hash alanındaki tek elemanlı dizi, regex’in örtük string dönüşümünden geçiyordu. Ana adapter bu bozuk yanıtı zaten `persisted:null` ile reddediyordu; fakat araçta success/replay sayacı ve reply-loss enjeksiyonu yanlış etkinleşebiliyordu. Normal ve reply-loss senaryolarında iki davranış regresyonu **18 pass / 2 fail RED → 20/20 GREEN** oldu. Minimal düzeltme yalnız hash alanının primitive string olmasını regex’ten önce zorunlu tutar; bozuk yanıt success/replay 0, reply-loss false kalır. Bu bulgu gerçek DB veya kullanıcı yetkisi ihlali olarak sayılmaz. Düzeltme öncesi modül hash’indeki gerçek QA tanıkları yeni hash için kabul kanıtı değildir; ana ajan yeni frozen modülle tekrar çalıştıracaktır.

Taze sonuçlar:

```text
node --test test/synthetic_notebook_desk_postgres_preview.test.mjs
20 tests, 20 pass, 0 fail, 0 skip

node --check tools/synthetic_notebook_desk_postgres_preview.mjs
exit 0

10 dar defter/adapter/server/legacy SQL CLI dosyasının birleşik koşusu:
133 tests, 133 pass, 0 fail, 0 skip; exit 0

Varsayılan gerçek CLI: not_run, SQL false, server false, auth false, browser false.
```

Bu fazda TDD, iyi-test ve doğrulama becerileri; bug’larda sistematik debugging kullanıldı. PostgreSQL best-practices becerisi, sabit en az yetkili rol/RLS ve statement-lock-idle timeout kararlarını destekledi. Hiçbiri CMMI/SPICE sertifikası, DAMA tam uyum veya üretim güvenlik kabulü değildir.

## Açık kabul işleri

Ana ajan taze gerçek PostgreSQL/native tarayıcı koşusunda metin/not/çizim kaydı, eski ikinci sayfa çatışması, post-SQL reply-loss kilidi ve açık okuma toparlanmasını; final hash/receipt/history tanıkları ve sahipli temizlemeyle eşleştirmelidir. Bu belgedeki hermetik sonuçlar o ortak kanıtın yerine geçmez. Üretim wire driver, kimlik/tenant çözümü, gerçek çocuk verisi, öğrenme analitiği, veri silme/retention ve kurum yayını hâlâ bu aracın dışındadır.
