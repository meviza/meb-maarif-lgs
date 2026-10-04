# Okul portalı: oturum ve geç yanıt güvenlik incelemesi

Tarih: 4 Ekim 2026. Kapsam: `portal.mjs`, `server.mjs`, ilgili yerel SQLite rol sınırları. Yalnız `synthetic_only` localhost demosu; gerçek öğrenci/veri ve dış yayın yok. Bu kayıt güvenlik sertifikası veya üretim kabulü değildir.

## Giderilen bulgular

1. **P1 — Önceki oturumun geç yanıtı yeni kullanıcı ekranını değiştirebiliyordu.** `api()` içindeki import makbuzu, yanıt geldiği andaki değişken `user.id` ile sahipleniliyordu. A hesabının bekleyen aktarım yanıtı, çıkış ve B hesabıyla giriş sonrasında B'ye bağlanabilirdi. Bekleyen deneme yanıtları da eski ekranı geri getirebilirdi. Yeni saf `request_scope.mjs`, istek başındaki kullanıcı kimliğini ve oturum dönemini yakalar; kimlik geçişinde önceki başarı, 401 ve ağ hatalarını geçersiz kılar. Kontrol hem HTTP yanıtı hem JSON çözümü sonrasında yapılır. Makbuz sahibi istek başındaki kimliktir.
2. **P2 — 401 sonrası cevap hatası boş denemeyi yeniden çiziyordu.** 401 temizliği `attempt=null` yaptıktan sonra cevap handler'ının koşulsuz `examView()` çağrısı hata doğuruyordu. Yeni handler yalnız hâlâ aynı oturum ve deneme etkinse yeniden çizer. Çıkışta gizli görünüm, not düzenleyici ve aktarım makbuzu hemen temizlenir.
3. **P2 — Oturum ve cevap mutasyonları eşzamanlı başlatılabiliyordu.** Giriş/çıkış için bekleme kilidi, eski logout cookie yanıtının yeni login cookie'sini temizleme yarışını bu sayfada engeller. Cevap kaydı ve bitirme de aynı kilidi paylaşır; geç cevap bitmiş denemeyi tekrar açık göstermez. Sunucunun idempotent bitirme ve tamamlandıktan sonra cevap kilidi korunur.
4. **P2 — Başarısız sunucu açılışı SQLite bağlantısını açık bırakıyordu.** Dolu port senaryosundaki test önce `close çağrısı: 0, beklenen: 1` ile başarısız oldu. Statik dosyalar artık DB açılmadan okunur; listen başarısızsa açılmış servis kapatılır.

## Doğrulama

- `test/school_portal_request_scope.test.mjs`: ertelenmiş başarılı import, eski 401, eski deneme yanıtı/ağ hatası ve güncel yanıt sahibinin korunması için 4 test. Yardımcı modül eklenmeden RED, sonra 4/4 PASS.
- `test/school_portal_server_lifecycle.test.mjs`: gerçek localhost dolu port ve SQLite kapanış sayacıyla 1 test; RED → GREEN.
- `test/school_portal_http.test.mjs`: 2 test; oturum/öğrenci bağlama, rol dışı not/deneme erişimi, cross-origin, açık servis dosyasının engellenmesi, çıkış sonrası 401.
- Yukarıdaki üç dosyanın son birleşik koşumu: **7/7 PASS**, 22.003 saniye. `portal.mjs` ve `server.mjs` Node sözdizimi denetimi ve `git diff --check` başarılı.
- Saf yardımcı testleri tarayıcı ekran kaydı değildir. Uçtan uca görsel akış kanıtı ana ajan tarafından ayrı tutulur; bu rapor onun yerine geçmez.

## Kalan sınırlar / sonraki faz

- `student/update` içindeki `teacherId:null`, mevcut şube atamasını silmez. Ancak mevcut atanmış şubelerden farklı yeni bir şubeye taşıma veya aktarım için öğretmen atama arayüzü henüz yoktur. Örneğin 6B'ye taşınan öğrenci, 6B'ye atanmış öğretmen yoksa yalnız okul yönetimi kapsamında kalır. Bu bir eksik yönetim akışıdır; başka okul erişimi değildir. Gerçek okul pilotundan önce açık öğretmen/şube ataması ve eksik atama uyarısı gerekir.
- İstek dönemi bu sayfadaki kimlik değişimlerini korur. Ayrı sekmeler arasında anlık çıkış/kimlik değişimi bildirimi (ör. BroadcastChannel) bu yamada eklenmedi. Ortak cihaz/çok sekme kabul testi üretim öncesi gerekir.
- Gerçek hesaplarda demo parolaları, localhost HTTP cookie yaklaşımı ve yerel hız sınırlama yeterli değildir. Üretim kimliği, HTTPS, kurtarma, çok faktörlü yönetici erişimi ve güvenli dağıtım ayrı kapılardır.
- Soru sürümleri hizmette ayrıdır. Yönetici tablosunda sürüm ayrımının okunur etiketlenmesi ve az örneklem uyarılarının gözden geçirilmesi sonraki UI kabulünde kontrol edilmelidir.
