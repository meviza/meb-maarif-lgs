# Antigravity kodunun bağımsız yeniden denetimi

**Tarih:** 3 Ekim 2026. **Dal:** `codex/k12-foundation-audit`. **Repo:** `meviza/meb-maarif-lgs`.

## Sonuç ve kapsam

Mevcut kod, üretime veya öğrenciye yayına hazır birleşik K–12 sistemi değildir. Eski üretim motorundaki soru sayıları, onay ifadeleri, video hazırlığı ve Drive başarı metinleri gerçek içerik çeşitliliği / uzman kabulü / render / bulut kayıt kanıtıyla eş anlamlı değildir. Güncel HTTP kapanışları bu verilerin öğrenciye veya uzaktan üretim akışına açılmasını engelliyor. Denetim başlangıcında eski CLI komutları doğrudan erişilebilirdi; ana teslim ayrıca karantina wrapper'ı uyguluyor. Doğrudan modül çağrıları kaynak incelemesi için hâlâ vardır.

İnceleme kod, Git geçmişi ve sınırlı yerel çalıştırma üzerinden yapılmıştır. PostgreSQL kurulumu, canlı AI/Drive, okul kimlik doğrulaması veya üretim ortamı denetlenmemiştir. Bu denetim eski kodları silmemiş veya yeniden açmamıştır. SQL izolasyonu değerlendirmesinde Postgres best-practices becerisinin en az yetki ve satır düzeyi izolasyon rehberleri kullanılmıştır; veritabanına müdahale yoktur.

## Git ve araç kökeni

- Antigravity'den devralınan dönem `a49e8a8`–`4d8d0f3` arasında görünür. `4d8d0f3`, 2 Ekim 2026 tarihli çok-sınıflı banka/arayüz değişikliğidir.
- `b4d249a` (3 Ekim 2026) güvenlik temeliyle başlayıp `7289283`e kadar giden sonraki commitler kapsam, içerik/varlık teslimi, DAMA ve öğrenme olayı sözleşmelerini ekler.
- Git yazarı bu örneklerde `Kerem Celik` olarak kayıtlıdır. Commit metni/yazarı kullanılan AI modelini doğrulamaz; “Terra 5.6 bu satırı yazdı” veya “Gemini bunu üretti” şeklinde satır kökeni iddiası yapılmamalıdır.
- Bu denetim sırasında atölye, arşiv ve pilot dosyaları commit öncesi çalışma ağacındaydı. Nihai commit/hash/test toplamı ana teslim raporunda ayrı kaydedilmelidir.

## Bulgular

### P1 — Yanlış sayısal çözüm, tekrarlar ve onay kanıtı eksikliği

`engine/curriculum_scale_factory.mjs:114`teki döngü, dört sabit soru ailesini yeni ID/alt kazanım etiketiyle çoğaltıyor. 6. sınıf matematik, 1. hafta, 28 soru için bağımsız yerel çağrı şu sonucu verdi:

```json
{"generated":28,"uniqueExactQuestions":4,"answers":{"A":0,"B":28,"C":0,"D":0},"packingReportedAnswer":"60","independentPackingAnswer":120}
```

Tekrar imzası `stem`, `stimulus`, `options`, `correctOption` alanlarının tamamına göre hesaplandı. Yukarıdaki çıktı **giderim öncesi** kayıttır; bu, 28 özgün soru değildir.

Üstelik `engine/curriculum_scale_factory.mjs:293`te 240×300×360 cm alanı 60 cm ayrıtlı küplerle tamamen doldurma sorusunun gerçek hesabı **4×5×6=120 (D)** iken eski kod **B=60** işaretliyordu. `:303`te olmayan bir “hacim denge katsayısı” gerekçesiyle 6 yerine 3 kullanılıyordu. Bu hata yazar tahmini veya pedagojik üslup farkı değil, yanlış yanıt anahtarıdır.

**Dar giderim uygulandı:** `test/legacy_curriculum_math_regression.test.mjs` önce gerçek motor çağrısında `60 !== 120` hatasıyla RED verdi; ardından yalnız bu geometri bloğunun yanıtı, çözümü ve çeldirici açıklamaları düzeltildi. Tüm altı yükseklik katmanı korunur. Güncel tekrar çağrısı 28 aday / 4 benzersiz içerik / B=23 / D=5 / ilgili soruda 120 sonucu verdi. **Tekrar ve diğer eski içeriklerin doğrulanmamış olması devam eder; bu bir onay veya büyük parti üretim kararı değildir.**

`engine/curriculum_scale_factory.mjs:495`te `jevCertified: true` koşulsuz; `:599`–`:604`te üretim/Drive başarı ifadeleri genel çıktıdır. Yanlış hafta/ders için `:116`–`:117`de Türkçe/ilk hafta fallback'i de beyan edilen kapsamla gerçek içerik arasındaki bağı bozabilir.

**Erişilebilirlik:** Öğrenci HTTP içerik/üretim uçları kapalı. Denetim başlangıcındaki `package.json:9`–`:19` üretim/seed/Drive CLI yolları ana teslimde ayrı bir karantina kapısıyla çevriliyor. Bu motorlar üretim için karantinada kalmalı, sayıları veya yıldızları analitik veri setine kabul edilmemelidir.

### P1 — Seed dosyası gerçek değerlendirme olmadan onay/yayın yazıyor

`engine/seed_runner.mjs:107` eksik audit için `{approved:true, score:0.99}` üretiyor; `:108`–`:109` soru onay/yayın alanlarını koşulsuz `true` yazıyor. Testlerin yayın alanı da `:82`de `true`. `db/schema.sql:92` test yayın varsayılanı `TRUE`.

**Erişilebilirlik:** Çalıştırılmadı, veritabanına uygulanmadı. Denetim başlangıcında `npm run seed` ile SQL çıktısı üreten yol mevcuttu; bu eski yol ana teslimde karantinaya alınmaktadır. Bu seedler canlı veri migrasyonu olarak kullanılmamalı. Uzman değerlendirme kayıtları, sürüm/varlık hashleri ve yayın/iptal zinciri olmadan bayrak çevirmek yasaklanmalıdır.

### P2 — “JEV” kalite raporu model veya uzman onayı değildir

`engine/jev_evaluator.mjs:38` yerel prototip kazanım sözlüğünü açıkça ayırıyor; `:166`–`:176` otomatik tarama sonucu üretip `publicationEligible:false` tutuyor. Bu koruma doğru.

Buna karşın `engine/quality_analytics.mjs:68` otomatik `passed` üzerinden `isApproved` türetiyor; `:165` onay sayaçları ve sonraki metinler bunu “JEV Onaylı” diye adlandırıyor. `modelName` tanımı (`engine/jev_evaluator.mjs:45`) tek başına canlı model çağrısı kanıtı değildir. Bu raporları uzman kabulü, MEB onayı veya kalibre zorluk olarak kullanmayın.

### P2 — Eski video çıktısı yalnız senaryodur

`engine/jev_video_solution_engine.mjs:89` `productionReady:true` veriyor; çıktı beş metin sahnesi, seslendirme repliği ve LaTeX parçasından oluşuyor. `:95`teki `auto_generated_geometry` gerçek görsel dosyası kanıtı değil. Render edilmiş video/ses/altyazı veya kare denetimi yok.

**Erişilebilirlik:** Eski istemcide çözüm/video butonları `public/app.js:231`–`:251`de kilitli; doğrudan açılan modal da `:741`–`:745`te salt-okunur sınırı koruyor. Yeni pilot açıkça `videoRendered:false` / SVG adım taslağı kullanıyor; bu render yerine geçmez.

### P2 — Eski Drive başarı sonucu bulut nesnesi kimliği değildir

`scripts/drive_direct_streamer.mjs:28` kimlik bilgisi yoksa simülasyonu seçiyor. `:261`–`:263` hem simülasyon hem “live” için dosya kimliğini yerelde uyduruyor; `:266` ve `:275` yine başarı bildiriyor. Gerçek Drive cevap gövdesinden nesne kimliği ve uzak checksum doğrulaması alınmıyor.

`public/app.js:196`–`:225` eski başarı metinlerini barındırıyor; bu butonlar kilitli, `/api/cloud/sync` ve `/api/ai/batch-generate` güncel sunucuda yok. **Aktif bir bulut bağlantısı veya yükleme kanıtı değildir.** Eski CLI yeniden kullanılmadan önce sonuç durumu ve credential davranışı yeniden tasarlanmalıdır.

### Mimari açığı — Okul tenancy, gerçek PostgreSQL ve DAMA yaşam döngüsü

`engine/db_adapter.mjs:14`–`:59` JSON bankalarını okuyup oturumları RAM `Map` içinde tutar; “hibrit PostgreSQL” başlığı çalışan PostgreSQL bağlantısı değildir. `db/schema.sql`da okul/tenant anahtarı, okul kotası, yetki politikaları/RLS, referans program sürümü, immutable içerik revizyonu, dört bağımsız değerlendirme veya geri çekme zinciri yoktur. Ders adı tek başına unique (`:11`) olduğu için sınıflar/sürümler arasında da uygun anahtar değildir.

**Erişilebilirlik:** Şema canlıya uygulanmış kabul edilmez. Role-policy ve DAMA sözleşmeleri saf mantık temeli sağlar; gerçek kimlik sağlayıcısı, transaction içi tenant bağlamı ve veritabanı izolasyonu yerine geçmez. Üretim şeması ayrı migration setiyle; servis rolü en az yetkili, tenant bağlamı güvenilen oturumdan çözülmüş, tenant-aşan erişim negatif testleriyle kurulmalıdır.

## Yeni atölye / doğrulanmış arşiv sınırları

`packages/studio/local_studio_server.mjs:4` yalnız dört açık statik dosya sunar; `:61` loopback Host kontrolü, `:65` salt-okunur yöntem sınırı, `:72` gerçek rapor okuma, CSP/no-store/no-CORS bulunur. CLI loopback'e bağlıdır. Bu yüzey yerel editör/geliştirici önizlemesidir: rapor yanıt anahtarları içerir, ağdaki öğrenci/okul servisi olarak yayınlanmamalıdır. Rapor yolları sunucu konfigürasyonundan gelir; istekle dosya yolu seçilmez.

`packages/storage/verified_archive.mjs:99` yalnız açık nonstudent dosya envanteri ve özel yeni hedef dizin alır; kopyalama öncesi/sonrası SHA-256 ve overwrite kapısı vardır. `:124`te `remoteSyncState:not_verified`; `:138`de başarılı durum yalnız `local_copy_verified`dir. Doğru olarak Drive Desktop dizinine kopyalama uzak sunucu kabulü sayılmaz.

**P2 giderildi — sınırlı, descriptor-temelli I/O:** Başlangıçta atölyede `stat` sonrası `readFile`, arşivde `lstat/hash` sonrası `copyFile` dosya büyümesi/değişmesi yarışına açıktı. Bu sınırlı kapılar test-first sertleştirildi:

- Yapılandırılmış JSON yolunun symlink veya nonregular dosya olması kabul edilmez. `O_NOFOLLOW` + nonblocking read descriptor'ı, açılış öncesi/sonrası inode ve metaveri karşılaştırması, 64 KiB okuma parçaları kullanılır. Üç MiB üstü veya okuma sırasında değişen/büyüyen dosya `invalid` olur; unbounded `readFile` kullanılmaz.
- Arşiv hash okumasında gerçek okunan baytlar sınırlandırılır; toplam 300 MiB bütçe yükseltilemez. Kaynaklar descriptor'la hashlenir; kopyalama aşamasında aynı inode/sürüm yeniden doğrulanır. `copyFile` yerine sınırlandırılmış parça okuma/yazma vardır; onaylanan kaynak boyutunu aşan parça hedefe yazılmaz.
- Hedef yeni ve overwrite'sızdır. Kaynak/kopya değişikliği veya hash tutarsızlığı başarılı manifest üretmez. Hata sonrası recoverable kısmi dizin bırakılır; mümkünse `archive-manifest.failed.json` içinde `local_copy_failed`, `remoteSyncState:not_verified` kaydedilir. Otomatik recursive temizlik veya veri silme yoktur.
- Nihai başarılı sonuç hâlâ yalnız `local_copy_verified`dir; Drive Desktop'a yerel kopya bulut sunucu kabulü değildir.

**Yarış testi kapsamı:** Testler gerçek geçici dosyaları kullanır; yalnız `open` sınırında zamanlama yönlendirilerek descriptor okuması sırasında append, aynı hashli inode değişimi ve kopya değişimi oluşturulur. Bu, geniş ölçekli/eşzamanlı dış süreç stresi veya işletim sistemi saldırı testi değildir. Sürekli yazan yetkili yerel bir aktöre karşı çok-dosyalı atomik snapshot garantisi verilmez; üretimde immutable object-store/snapshot ve transaction sınırı gerekir. Kaynak/üst dizin güvenilen konfigürasyon kapsamındadır; bütün ata dizinler için OS düzeyi sandbox iddiası yoktur.

## Doğrulama ve sonraki refactor

Sınırlı yeni yüzey için `node --test test/local_studio_server.test.mjs test/verified_archive.test.mjs test/studio_view_model.test.mjs` bu denetimde **17/17 geçti**, atlama/iptal yok. Tüm repo test toplamı ve gerçek tarayıcı ekran kanıtı ana raporda ayrı verilir. Testler sertifikasyon veya pedagojik kabul değildir.

Dar matematik giderimi sonrasında aynı komuta `test/legacy_curriculum_math_regression.test.mjs` eklenerek yapılan taze çalıştırma **18/18 geçti**. `node --check engine/curriculum_scale_factory.mjs` ve `git diff --check` de başarılıdır.

I/O sertleştirmesi için önce `node --test test/local_studio_server.test.mjs test/verified_archive.test.mjs` çalıştırıldı: **11 eski test geçti / 7 yeni kapı testi RED**. Giderim sonrası bu iki dosya **18/18 GREEN** oldu. Son birleşik dar doğrulama, matematik regresyonu ve viewmodel ile **25/25**tir; bu sayı tüm repo test toplamı yerine kullanılmamalıdır.

Önerilen sıralama eski kodu topluca silmek değil, doğrulanmış parçalarla kademeli değiştirmektir:

1. Eski motor/seed/Drive komutlarını yalnız karantina araçları olarak etiketleyin; yeni fabrika ve yönetişim geçidine bağlanana kadar dağıtım artefaktı üretmesinler.
2. Resmî belge/sürüm/hash → kazanım → mikro beceri → soru amacı/çözüm grafiği zincirini canonical kayıtta kurun; 36 hafta görünümünü resmî programın kendisi sanmayın.
3. Üretim miktarı yerine çeşitlilik, bağımsız cevap kontrolü, arşiv benzerliği, dil/pedagoji, görsel/ses erişilebilirliği ve uzman kabulünü ayrı kapılarla bağlayın. Clef karar desteği, bu kanıtları tek başına sağlayamaz.
4. Ayrı tenant/veri deposu sınırları, PostgreSQL migration/RLS/least-privilege, quota/metering ve append-only karar kayıtlarını negatif testlerle ekleyin; JSON/RAM adapteri geçici read-only kaynak olarak kalsın.
5. Onaylı çözüm grafiğini gerçek video/altyazı/ses render hattına ve kare denetimine bağlayın. Sonrasında öğrenci/veli/öğretmen/okul yönetimi yüzeyleri ve Flutter mobil istemciyi aynı API sözleşmelerine taşıyın.

Bu denetim eski varsayımlara güvenerek yayın veya canlı veri geçişini açmayı önermemektedir.
