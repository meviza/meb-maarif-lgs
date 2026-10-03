# Ayrı notebook adaptörü: gerçek sentetik SQL entegrasyon kanıtı

4 Ekim 2026. [Saf adaptörün kanıtı ve sınırları](SYNTHETIC_NOTEBOOK_ADAPTER_EVIDENCE_2026-10-04.md) gerçek SQL'den ayrı yazılmıştır. Bu root fazı aynı adaptörü existing cached PostgreSQL üzerinde yürüttü; gerçek çocuk, kurum, production auth, HTTP veya öğrenci UI kullanmadı.

## Test-first ve kapalı opt-in

Yeni üç CLI testi önce **0/3 feature RED** (eksik `--adapter` ve exact typed sorgular), minimal parser/allowlist sonrası3/3; eski CLI8 ile11/11 geçti. Eski varsayılan çıktı değişmedi. `--adapter` tek başına **not_run / databaseProofExecuted=false / adapterProofExecuted=false** verir; Docker başlatmaz. Kaynak limiti seçenekleri veya caller role kabul edilmez.

İlk gerçek `--run --adapter` koşusunda eski **73 SQL tanığı** geçti ve exact-owned container kaldırıldı, fakat `adapterProofExecuted` alanı yoktu. Root assertion beklenen `actual adapter integration witness missing` ile RED verdi. Bu **adaptör integration missing RED**'idir; SQL migration'ın yokluğuna ilişkin RED değildir.

Sonra runtime adaptör tanıkları eklendi ve şu komut taze exit0 verdi:

```sh
node tools/test_synthetic_student_notebook_postgres.mjs --run --adapter --container k12-synthetic-notebook-root-adapter-green
```

**Eski73 + yeni13 gerçek adaptör tanığı**. Bunlar Node suite'in893 testine eklenmez. İki gerçek proof koşusu (RED ve GREEN), ücretli Docker Cloud işi veya yeni image download değildir.

## Gerçek compositional sınır

Migration002 ayrı fresh notebook DB proof'udur; production001→002 zinciri değildir. Önceki proof gerçek A head2/history2 ve B1/history1 bırakır. Root trusted test composition bunları sabit DB rolünün current/history okumalarından seed eder; learner DTO veya hashes yetki sayılmaz.

Adaptör yürütücüsü fixed role closure'ıdır. `query` ve `values` frozen; exact allowlist:

```sql
SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result
SELECT student_notebook.read_current($1::text) AS notebook_result
SELECT student_notebook.read_revision($1::text,$2::bigint) AS notebook_result
```

Kapalı response `{rowCount:1,rows:[{notebook_result:sqlObject}]}`. Test köprüsü aynı-session PREPARE/EXECUTE ile quote edilen literal değer taşır; **wire-protocol parametrized driver değildir**. Role/query routing istemciye açılmaz. Production pool, timeout, resolver provenance ve HTTP auth ayrı işlerdir.

## Yeni13 runtime tanığı

1. Clone ve başka adapter'ın command'i DB çağrısı0 ile reddedilir.
2. Typed SQL+ayrı frozen değerlerle A revizyon3 gerçekten commit olur; gerçek receipt independent fixture hashleriyle eşleşir.
3. Receipt-confirmed write closure head'ini ilerletmez; değişmiş idempotency gövdesi yerelde reddedilir.
4. Aynı branded command'in gerçek exact replay'i yeni tarihçe oluşturmaz.
5. Yalnız explicit verified current read revision3'e source advancement sağlar; bir sonraki request hazırlanabilir.
6. Historical revision1 gerçek gövdesi okunur; current head geri dönmez.
7. A fixture+B fixed executor DB42501 scope_denied verir. Sanitized failure unknown/persistednull/noRetry; iki okul başlıkları değişmez.
8. Gerçek scoped read sonucu yanlış rowCount ile dönünce read unknown; eski source ilerlemez.
9. **Gerçek SQL revision4 commitinden sonra** transform throw uygulanır; persistednull/unknown, executor1, automaticRetryfalse. DB read gerçekten4/history4 gösterir; rollback uydurulmaz.
10. Explicit scoped current read kayıp yanıttan sonra actual4'ü doğrular ve closure'ı ilerletir.
11. **Gerçek revision5 commitinden sonra** response head SHA bozulur; write unknown/null. Explicit current read5'i doğrular.
12. Beşten sonraki fine-coordinate/U+0000/unpaired-surrogate isteği DB0 ile PostgreSQL profilinde reddedilir; yuvarlama/normalization yapılmaz.
13. Final A5/history5, B1/history1, unmapped history0; kapsamlar ayrıdır.

Unknown-state branch'ler gerçek write sonrasına enjekte edilir, ancak bağlantı kopması/daemon crash veya gerçek iki-connection yarış değildir. 42501/40001/23505/22023 typed kodları anlaşılabilir failure'a çevrilir; upstream mesaj/token dışarı yansıtılmaz. Fixed trusted executor'dan daha önce görülmeyen kendi içinde tutarlı receipt'in kökeni hâlâ server provenance varsayımıdır; digest DB/auth attestation değildir.

## İzolasyon ve bağımsız denetim

Cached `postgres:16.15-alpine`, önceki exact image `ef738a34...74368`; pullnever/networknone/hostport0/hostmount0/CPU1/RAM256MiB/read-only/postgresuser/capdropALL/no-new-privileges/tmpfs58MiB+shm2MiB. Oluşturulan exact container ID cleanup öncesi eşleşti. Ayrı root inspect, hem `k12-synthetic-notebook-root-adapter-red` hem `...-green` için **No such container** doğruladı. Başka container ele alınmadı.

Yazardan farklı ajan saf adaptörü46/46 ve bağımsız adversarial probes ile denetledi: post-effect throw/malformed response, command brand ve before-await/error hooks. Başka ajan root harness'i11/11 + exact typed3/hostile9 sorgu/hook0 ile salt-okunur denetledi. İncelenen kapsamda açıkP1/P2 yok; ikinci actual SQL koşusu veya güvenlik sertifikası sayılmaz.

Notebook amacı sensitive `student_notebook` olarak ayrı kalır; learning event/analytics'e metin/stroke aktarımı yok. Actual UI memory_only değişmedi. Gerçek DAMA resolver, consent/auth, wire driver, multi-connection race/load, retention/erasure/restore ve öğretmene seçili paylaşım pending. Teknik testler CMMI/SPICE derece, DAMA sertifikası veya production approval değildir.
