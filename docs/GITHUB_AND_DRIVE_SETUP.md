# GitHub ve Drive — Gerçek İşlem ve Doğrulama Sınırı

## Git dalı

Kanonik çalışma dalı `codex/k12-foundation-audit`, uzak depo `https://github.com/meviza/meb-maarif-lgs.git`. Antigravity'nin ana dalına veya özgün çalışma ağacına reset/merge yapılmaz. 3 Ekim 2026 denetiminde uzak depo PUBLIC olarak doğrulandı; bu nedenle anahtarlar, öğrenci verisi, kullanıcı kimliği ve telifli ham PDF'ler yüklenmez.

Kod, testler, planlar ve resmî kaynakların URL/hash/sürüm/hak durum metaverisi Git'te sürümlenir. Çalışma kodu için yayın/üretim onayı verilmiş sayılmaz. Push sonrasında uzak dal commit'i yerel HEAD ile karşılaştırılır; yalnız yerel commit, GitHub'a yükleme değildir.

## Drive (kullanıcının bildirdiği 5 TB hesap)

Mevcut Google Drive Desktop senkronizasyon alanı bulundu. Yeni Google Drive MCP bağlantısı veya OAuth kurulmadı. Mevcut Desktop mount'u üzerinden yalnız açık, öğrenci verisi içermeyen kaynak referansları ve özgün inceleme taslakları ayrı bir `K12-Codex-Archive` dizinine kopyalanabilir.

`packages/storage/verified_archive.mjs`:

- explicit, sınırlı dosya envanteri ve izin verilen veri sınıfı ister;
- kaynak ve kopya için SHA-256/bayt bütünlüğünü doğrular;
- yeni `k12-archive-...` dizini kullanır; eski dosyaların üstüne yazmaz veya silmez;
- 300 MiB toplam sınır uygular; kaynaklar için hak/purpose/retention defteri ayrıca geçerlidir;
- `local_copy_verified` ile `remoteSyncState: not_verified` durumlarını ayrı tutar.

Masaüstü klasörüne doğrulanmış kopya, Google Drive sunucusuna başarıyla yüklendiğine kanıt değildir. Uzak dosya/hash doğrulaması için sonradan yetkili Drive API/MCP veya Desktop eşitleme kanıtı gerekir. Kullanıcının bildirdiği 5 TB toplam/boş kota bu çalışmada API ile doğrulanmadı.

## Disk ve veri mimarisi

“Sıfır SSD kullanımı” garantisi yoktur. Drive Desktop önbelleği, çevrimdışı tutulan dosyalar ve geçici çıktı yer tüketebilir. Referans indirme cache'i repo dışındadır; otomatik cache silme yapılmaz. Doğrulanmış uzak yedek olmadan yerel tek kopya kaldırılmaz.

Drive arşiv/taşıma alanıdır; işlem veritabanı, PostgreSQL eşdeğeri, öğrenci verisi deposu veya canlı uygulama içerik sunucusu değildir. Okul verisi için tenant izolasyonlu PostgreSQL, yetkili nesne deposu, saklama/silme/yedekleme ve kota rezervasyonu ayrı fazda uygulanacaktır.
