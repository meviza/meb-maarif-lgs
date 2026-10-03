# Drive bağlantısı ve uzak arşiv doğrulaması

Tarih: 2026-10-03. Bu belge önceki `ARCHIVE_DELIVERY_RECEIPT_2026-10-03.md` içindeki yalnız yerel Desktop kopyası kaydına ek kanıttır; eski tarihsel kaydı geriye dönük uzak teslim gibi değiştirmez.

## Hesap, kapasite ve özel klasör

Google Drive plugin bağlandı; profil ile mevcut arşiv hesabı eşleşmesi doğrulandı. Kişisel hesap adresi bu Git belgesine yazılmaz. Doğru hesapta Drive web araması eski `K12-Codex-Archive` klasörü için sonuç vermedi; connector aramalarında da bulunamadı. Sınırlı root listing tüm Drive'ın yokluk kanıtı değildir. Web kapasite göstergesi 13,8 GB / 5 TB kullanım gösterdi; bu üretim SLA'sı veya Drive API boş-kota doğrulaması değildir.

Yeni `K12-Codex-Archive-Verified` ve iki sürümlü alt klasör oluşturuldu; metadata `shared:false` ve yalnız tek kullanıcı/owner izni, doğru parent ile doğrulandı. Önceki klasör/dosya/senkronizasyon ayarı değiştirilmedi; paylaşım açılmadı, dosya silinmedi. Özel Drive ID/link'leri ve yerel devam manifesti chat `outputs/drive-remote-delivery-receipt-20261003.json` içinde; kamuya açık Git'e konulmadı.

## Gerçek teslim durumu

| Kapsam | Bayt doğrulaması |
| --- | --- |
| Kökteki küçük teslim kanıtı Markdown | 1 dosya / 1.598 byte; tam SHA-256 geri okuma |
| Sürümlü arşivlerde doğrulanan PDF'ler | 12 dosya / 65.495.532 byte; tam SHA-256 geri okuma |
| Arşiv planı | Toplam 70 dosya / 143.715.149 byte; iki paketin manifestleri dahil |
| Henüz aktarılmayan arşiv | 58 dosya / 78.219.617 byte |

Yani 13 gerçek uzak dosya byte düzeyinde doğrulandı; **70 dosyalık arşiv tamamlanmadı**. Yerelde 34 resmî PDF'nin hepsi tekrar hash/boyut doğrulandı; uzak arşivde şimdilik bunların 12'si var. Yerel cache veya öğrenci verisi silinmedi. Arşive gerçek çocuk/okul verisi, anahtar veya kişisel log eklenmedi.

Üç işçili aktarımda iki dosya streaming kabul kapısını geçemedi; toplu hat fail-closed durdu. Aynı uzak dosyalar yeniden yüklenmeden taze connector referansı ve seri geri okumayla hash/boyut geçti. İlk başarısızlıkların kök nedeni kanıtlanmadı; bunlar otomatik başarıya çevrilmedi. Devam concurrency=1, mevcut Drive ID üzerinden idempotent yeniden kontrol; kayıt başına doğrulama başarısızsa devam kapalı. Bütün arşiv ve yedek/restore kabulü henüz yok.

## Transfer güvenliği ve sınırlı skill incelemesi

`google-drive` router için mevcut `skill-inspector` kullanıldı. Kaynak `https://github.com/openai/plugins`, kurulu sürüm 0.1.16; upstream commit manifestte yok. Kurulu `SKILL.md` SHA-256 `dabae8a192c861b76cf7b5742bdf14f8ed35e67d8e6cacfd5f746ffbefd6da5c`, plugin manifest SHA `fb76d7ea1eeaf768fd8bd539e6fbd8bd5fb0a911d4bb0b3af3a875c40df9ecb4`.

SkillSpector 2.12.0 `--no-llm` exit 0; skor 0/LOW, 0 issue, recommendation **CAUTION**, completeness PARTIAL. Eksik referans/MIME-URI örneği ve binary ikon kapsamı başarıyla tam taranmış sayılmadı. İki “executable” sınıflanmış SVG kaynak incelemesinde yalnız çizim içerdi; script/href yok. PNG formatı ayrı kontrol edildi. Harici skill betiği veya bulut LLM taraması çalıştırılmadı.

Karar **CAUTION**: yalnız kullanıcının yetkilendirdiği metadata, özel klasör ve seçili referans/özgün taslak yüklemesi. Hosted connector/server kodu, OAuth gerçek kapsamı ve sağlayıcı güvenliği tam denetlenmiş değildir. Bu tarama bütün uygulama/bağımlılık/servisin güvenlik sertifikası değildir. Gerçek öğrenci/okul verisi aktarım izni olarak kullanılmaz.

`drive_file_reference_integrity` adaptörü içerik/mülkiyet yetkisi değil byte bütünlüğü kontrol eder. Metadata ile MIME/boyut/parent/yalnız owner önce kontrol edilir. Sonra connector'ın kısa ömürlü authenticated `file_uri` referansı: HTTPS `*.oaiusercontent.com` allowlist, redirect reddi, 25 MiB gerçek byte sınırı, streaming dahil 30 s deadline ve SHA-256. İmzalı URL çıktıya, argv'ye, Git'e, dosyaya veya rapora yazılmaz. Canlı araçta girdi PTY echo kapalı stdin'den gönderildi; düz pipe'ın hemen EOF vermesi ayrıca görüldü.

11 test: ikili stream, explicit network opt-in, URL/kimlik şekli, redirect/partial HTTP reddi, truncation/hash, gerçek byte artışı, sanitized error, fetch/stream timeout, CLI satır/boyut/argv reddi. Ana ajan iki ek red→green regresyonu ekledi: açık stdin'in EOF beklemesi ve gerçek connector `sediment://` taşıma kimliği. Model/Drive dosya ID'si aynı varsayılmaz. Gerçek Markdown + PDF byte kontrolü ayrıca yapıldı.

Drive bu kapsamda özel referans/taslak arşividir; veritabanı/CDN/sürekli okul sunucusu veya KVKK uygunluk kanıtı değildir.
