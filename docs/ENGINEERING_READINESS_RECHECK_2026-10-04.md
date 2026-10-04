# Mühendislik Hazırlığı: Dar Yeniden Kontrol

4 Ekim 2026, Faz19. Başlangıç checkpoint'i kökün bildirdiği `c90d1627bb6b467b6843b7cdbe61a9362e5425ba`; bu denetim Git/remote durumunu yeniden doğrulamaz. Kod incelemesi ve aşağıdaki taze yerel tanıklar kullanıldı. Kaynak arşivi, Drive bütünlüğü, Faz18 native tarayıcı kabulü ve tam test kataloğu başka denetimlerin kapsamıdır; burada tekrar yapılmış sayılmaz.

## Sonuç

Mevcut sistem **kaynak bağlı editör taslakları, gerekçeli anlatım/görünüm ve dar sentetik veri-kalıcılık dilimleri** sunuyor. 36.000 kabul edilmiş soru, sekiz sınıfın tam ürün kütüphanesi, otomatik sesli çözüm fabrikası veya okula kurulabilir üretim sistemi değildir. MEB kaynağına izlenebilirlik, MEB onayı değildir.

Durumlar birbirine çevrilmez: `draft` → yerel teknik doğrulama → yetkili uzman kabulü → yayın → üretim işletimi. Matematik oracle'ı, metadata hash'i, canlı nesne markası, render veya geçen test; insan kabulü, telif izni, oturum yetkisi veya üretim uygunluğu sağlamaz.

## Taze kanıt: ürün sayımı değil

| Tanık | Gerçek sonuç | Sınır |
| --- | --- | --- |
| Normal CLI, argümansız `node tools/content_factory_pilot.mjs` | Exit1; `explicit_output_directory_required` | Varsayılan alias çıktı dizini olmadan üretim yapmaz; otomatik fabrika değildir. |
| Saf `createPilotBatch()` | 12 aday /12 matematik taslağı /0 ret /6 aile; automated/expert/published **0/0/0** | Varsayılan metadata'da sınıf, çıktı ve program eşlemesi unresolved. |
| Saf `createPilotBatch({requested:100})` | **100 aday →12 taslak /88 ret /6 aile**; matematik doğrulama12 | İki sayısal varyant/aile sınırı; 100 yeni soru veya kabul edilmiş stok değildir. |
| Taslak terfisi | automated: `canonical_registry_and_full_quality_gates_not_connected`; expert/published: `trusted_review_store_not_connected` | Terfi kapıları taze ret verdi. |
| Gerçek common draft → branded medya hazırlığı → normal `resolveReasonedMediaGeometry` | `repeat` ve `grouping` ayrı ayrı `unsupported_reasoned_geometry_source` | Özel sahne çalışması genel resolver'a destek eklemiş değildir. |
| Common bağımsız oracle / hazırlık | Dakika `[24,48]`; kart/paket `[1,2,3,4,6,12]`; 1 mevcut taslak /2 anlatım işi /0 yeni-kabul-yayın | Generic numericSteps0; iki iş iki soru değildir; providerCallsAllowed false. |
| Varsayılan `node tools/grade6_reference_authoring_plan.mjs` | 6 brief /6 kaynak gözlemi; generated/accepted0; ordinals14/15 eşlenmemiş; kapsam yüzdesi null | Altı kapı pending; programdaki MAT.6.1.4 uygulama gözlemi, incelenmiş kaynak soru veya tam çıktı kapsamı değildir. |
| Saf öğrenci çalışma alanı | Sentetik sınıf6, altı ders, question/lesson/video kütüphanesi **0/0/0** | Sınıf7 talebi `scope_mismatch`; süresi bitmiş abonelik ret; serialized context ret. Gerçek login/abonelik değildir. |
| Saf rol kuralı | Veli ilişkili öğrenci için izin; farklı okul `tenant_mismatch` | Sunucu kimlik çözümlemesi yerine geçmeyen politika sözleşmesi. |

Mevcut dört dar test dosyası: `content_factory_pilot`, `teacher_voice_direction`, `synthetic_activity_summary`, `synthetic_notebook_application`; **58/58 PASS, fail0/skip0**. Komut:

```sh
node --test --test-name-pattern='^(?!CLI)' test/content_factory_pilot.test.mjs test/teacher_voice_direction.test.mjs test/synthetic_activity_summary.test.mjs test/synthetic_notebook_application.test.mjs
```

Bu Node koşusunda amaçlanan CLI dışlama gerçekleşmedi: mevcut hermetik CLI testi kendi `mkdtemp` alanında 100-aday paketi yazdı, kontrol etti ve `finally` ile sildi. Kalıcı çıktı/repo değişikliği, provider, server veya DB çağrısı yoktur. Bu davranış saklanmaz ve 58'i yalnız saf test diye etiketlemeyiz. Ayrı **7/7 PASS, fail0/skip0, exit0**:

```sh
node --test test/cloudflare_generator.test.mjs
```

İkinci dosyanın fetch yanıtları test-double'dır; gerçek Cloudflare/model, faturalama veya yeni soru üretimi kanıtı değildir. Saf batch/common/workspace/rol probe'ları ayrı Node koşularında literal beklentilerle exit0 verdi; dosya yazmadı. Bu sayılar önceki test sonuçlarına eklenip stok veya pedagojik geçerlik olarak sunulmaz.

## Bağlantı ve işletim sınırları

| Katman | Kodda gerçekten bulunan | Hazır olmayan |
| --- | --- | --- |
| Normal içerik fabrikası | `pilot.mjs` altı dikdörtgen ailesi; normal CLI gerekçeli soru/ders, job, geometry, scene, caption ve karışık alıştırma hazırlığı tüketir. | Tüm ders/sınıf/çıktı/mikrobeceri paydası, kaynak benzerliği/hak denetimi, kalibrasyon, uzman store ve yayımlanmış paket yok. Sayı varyantları çeşitlilik değildir. |
| Yeni özgün aileler | Çarpan kanıtı ve ortak ilişkiler sabit, editör-only taslaklar; bağımsız oracle. Ortak ilişkilerin özel source→preparation→scene→responsive review zinciri ayrı grade6 CLI'de var. | Normal fabrika/domain resolver'a bağlanmadı. Generic geometry ret korunuyor. Tam kazanım veya öğrencinin kendi kanıt oluşturması başarısı iddia edilemez. |
| AI | `providers.mjs` Clef'i typed danışma/QA için kullanır; yayın yetkisi yok. `cloudflare_generator.mjs` ayrı GLM taşıma adaptörü ve açık bütçe/opt-in sınırı içerir. | Clef soru/ses/video üreticisi değildir. GLM çıktısı `unvalidated_drafts`; matematik/hak/müfredat onayı false. Normal CLI bu üreticiyi çağırmaz; bu tur canlı çağrı0. |
| Görsel anlatım | Özel common scene güncel cue/page ve reveal kapıları; timeline/tablo birimleri, programatik kalem vurgusu; ayrı responsive current-caption HTML. | Transfer geometrisi pending; yeni birimler için glyph/atom ölçümü ve genel semantik anchor desteği ayrı. HTML/SVG, video veya gerçek el yazısı değildir. Verilenlerden cevap türetilebilir; editör details öğrenci yanıt güvenliği değildir. |
| Ses/video | Eski sabit bahçe ink planı; yerel WAV hazırlama ve byte/hash/PCM denetimi; FFmpeg mux/render ve süre/codec kontrolü mevcut. | `prepareInkAudio` altı sabit eski cue'ya bağlıdır, TTS çağırmaz. Yeni reasoned job yalnız ses isteği/beyan hazırlıyor; dosya/söylenen metin/doğallık/kelime–kalem eşliği doğrulanmış değil. Genel iş kuyruğu ve yeni common sesli MP4 yok. |
| Kalıcı defter/ledger | Ayrı SQL001/002, sabit sentetik okul rolleri ve scope, FORCE RLS; immutable receipt/history, idempotency, explicit read, unknown/no-auto-retry sınırları. Geçmiş kök kayıtları gerçek izole SQL→HTTP→UI tanıkları içerir. | Bu tur DB yeniden koşulmadı. Test PREPARE/EXECUTE bridge üretim wire-driver değildir. Gerçek login, kurum catalog resolver, TLS/pooling/HA, migration zinciri, çok bağlantılı yarış/load ve gerçek öğrenci erişimi açık. |
| Analitik | Receipt-bound sınırlı pencere için started/hint/completed ve son dahil edilen aktivite sayımları; tam geçmiş false. Defterin text/stroke sayımları ayrı amaçta operasyoneldir. | Doğruluk, puan, mastery, IQ, yetenek, biliş/sezgi, kariyer çıkarımı yok; `learning_analytics` ayrı amaç/politika bekler. Not/stroke öğrenme-event hattına sokulmaz. |
| Roller/okul işletimi | Politika sözleşmeleri ve sentetik sınıf6 kapsamı; notebook masa client/server sabit sentetik örneğe bağlı. Eski3333 server'ın `/api/tests/:id` teslim yolu kapalı. | Veli/öğretmen/editör/yönetici girişleri gerçek kimlik yetkisine bağlanmadı. GB/TB/CPU/kayıt kotası, satış/billing/on-prem bakım/SLA, retention/erase/restore uygulaması incelenen hatlarda bağlı değil. İçerik zorluk kotası okul kaynak kotası değildir. |

Eski [ink kaydı](INK_MOTION_EVIDENCE_2026-10-03.md), [ses pilotu](TEACHER_VOICE_PILOT_EVIDENCE_2026-10-03.md), [gece ilerlemesi](OVERNIGHT_PROGRESS_2026-10-03.md) ve [gerçek defter UI→SQL kaydı](SYNTHETIC_NOTEBOOK_DESK_SQL_BROWSER_EVIDENCE_2026-10-04.md) ilgili bölümleriyle incelenmiştir. Eski sesli bahçe MP4 için 36,375s H.264+AAC kaydı bulunması, yeni gerekçeli metnin seslendirildiği anlamına gelmez; burada medya dosyasının hash/decode'u yenilenmedi. Önceki “DB yok / defter yalnız memory” ve eski test sayıları da tüm projenin güncel durum etiketi yapılmaz. Summary modülündeki `notebookPersistence: separate_contract_pending` yalnız o learning-sync ürününün bağlanmamış notebook sınırıdır; bağımsız sentetik SQL defter dilimini yok saymaz.

## Sonraki üç doğrulanabilir dikey dilim

1. **Bir kaynak/amaç → tek öğrenciye teslim edilebilir paket.** Özel common adapter'ı normal fabrikanın kapalı domain dispatch'ine bağla; unsupported family/unit/future-answer/source-rehash negatiflerini koru. Aktif yıl/çıktı bağlama ve yetkili review-store kararını ayrı tut. Bir adet uzman kabulü ve uygun delivery manifest'i olmadan öğrenci kütüphanesi/stok artmasın. Diğer ders/sınıfa otomatik yayma yok.
2. **Bir yeni gerekçeli iş → dinlenmiş, senkron, oynatılabilir çözüm.** Önce aynı metnin yetkili küçük TTS isteği, doğru cue byte/hash/duration, sayı/birim dinleme ve kelime-vurgu işaretleri; sonra gerçek mux/decode ve içerik native incelemesi. Yalnız eski sesi yeni metne etiketleme yok. 30–35s reklam türevi tam öğretim videosundan ayrı olsun; streaming raster/bütçe sınırı korunsun.
3. **Sentetik defter → işletilebilir dar okul pilotu.** Gerçek sunucu-owned identity/tenant/policy resolver ve üretim sürücüsüyle iki-okul adversarial read/write; yanıt kaybı/idempotency/restore ve yetkisiz rol tanıkları. Sonra retention/silme, audit ve okul kaynak kotalarını ölç. Önce yalnız sentetik veri; gerçek çocuk ve çok yıllı değerlendirme bu dilimin çıktısı değildir.

Teknik işler: domain bağlama, review-store/delivery bağlantısı, ölçülen TTS zamanlama, sürücü/pooling, rate-limit, kota, retention/restore ve testler. Ayrı yetki/karar gerektirenler: yayın/reuse hakları, aktif program/yıl kararı, alan/yaş uzmanı kabulü, sağlayıcı/iş bütçesi ve ses lisansı, gerçek okul/çocuk verisi ve kurum işletim hedefi. Önceki üyelik, metadata hash'i veya geniş geliştirme izni bu kapıları kendiliğinden açmaz.

DAMA için purpose/owner/steward/version/lineage/access/quality/retention alanları ve ayrı amaç sınırları teknik hazırlıktır; sentetik fixture gerçek kurum yönetişim kararı değildir. CMMI/SPICE faz/test kanıtı tutulur; bu rapor bir olgunluk seviyesi, güvenlik sertifikası, pedagojik sertifika veya MEB kabulü vermez. Bu faz yeni model, ücretli cloud, kaynak indirme/Drive, credential, okul verisi, yayın ya da Git işlemi yapmadı; yalnız bu rapor yeni kalıcı dosyadır.
