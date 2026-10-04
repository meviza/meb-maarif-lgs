# Docker Kredisi: Kullanıcının Paylaştığı Ekran Referansı

4 Ekim 2026. Kullanıcının “Bu da dursun, belki bir yerde kullanabiliriz” talebiyle kayıt altına alındı. Bu not hizmet seçimi, ücret onayı veya çalıştırılmış cloud deneyi değildir.

## Görülen Ve Korunan

Paylaşılan Docker Agentic Platform ekranında **250 dolarlık işlem kredisi uygulandığı** ve **henüz sandbox olmadığı** yazıyor. Bu kullanıcının paylaştığı ekran tanığıdır; root Docker hesabına girip bakiye/fatura/kredi koşullarını ayrıca sorgulamadı. Kredinin tamamının güncel kullanılabilir bakiye olduğu, sona erme tarihi veya her iş türünde geçerli olduğu kesinleştirilmedi.

Orijinal PNG Git dışındaki mevcut özel proje çıktısına, içerik değiştirilmeden tek kopya olarak saklandı. Gerçek kopya boyutu **290.715B**, SHA-256 `66830d7d7b9f38416c8a3643f1109884963baa6374793d5a5059648d8fc13a78`; kaynak-kopya hash eşliği ve normal dosya/mod0600 kontrol edildi. Ekran görüntüsü, tarayıcı geçmişi, hesap/izleme kimliği veya özel dosya yolu Git'e konmadı. Orijinal kullanıcı attachment'ı silinmedi. Bu screenshot müfredat/PDF arşivinin50/49 sayımına eklenmez.

## İleride Değerlendirilecek Dar Kullanım

Öneri: önce **sentetik verili küçük video render/FFmpeg veya test işi** için, durdurulabilir bir worker alternatifi olarak değerlendirmek. Görsel matematik doğruluğunu üretici videoya bırakmak veya gerçek öğrenci verisini deneme ortamına taşımak değildir. CPU/RAM/depolama/network yeterliliği ve yerel Mac'e göre maliyet, aynı gerçek küçük job ölçülmeden varsayılmaz. Screenshot GPU, persistent storage, yedek, üretim SLA'sı veya on-prem kapasitesi kanıtlamaz.

Kullanımdan önce ayrı kontrol:

1. Resmî güncel birim fiyatlar, faturalandırma çözünürlüğü, kredi kapsamı/son kullanımı, stopped/suspended kaynak ücreti, storage/egress ve otomatik aşım davranışı.
2. Exact CPU/RAM/disk ve gerekiyorsa GPU seçeneği; maksimum iş süresi ve job başına açık dolar/bayt bütçesi. **2,5 ay yeter** veya kaynak kapasitesi bu ekranla hesaplanamaz.
3. Bounded sentetik job; secrets/log politikası, ağ allowlist, kaynak lisansı ve çıktı bütünlüğü. Ham MEB/TÜBİTAK içeriği veya gerçek çocuk/kurum verisi aktarımı yok.
4. Sonucun exact artefact hash/süre/codec/decode ve native içerik incelemesi; job bitiminde kendi kaynaklarını durdurma/silme ve gerçekten tüketilen kredi tanığı.
5. Gerçek okul için veri işleyen sözleşmesi, bölge/KVKK, izolasyon, restore, destek/işletim ve truthful hosting beyanı. Bulut sandbox'a “kendi fiziksel on-prem sunucumuz” denmez.

Şimdilik sandbox oluşturma, Docker/MCP bağlantısı kurma, cloud upload, credential/ödeme değişikliği ve kredi harcaması **0**. Kullanıcı ekranı saklama talebi, bu operasyonları otomatik yetkilendirmedi. [Mühendislik hazırlık raporunda](ENGINEERING_READINESS_RECHECK_2026-10-04.md) yeni sesli video ve okul işletimi kapıları ayrı kalır.
