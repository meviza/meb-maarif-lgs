# GitHub ve Drive teslim makbuzu — 3 Ekim 2026

## Kod ve plan teslimi

Uzak depo: https://github.com/meviza/meb-maarif-lgs; dal `codex/k12-foundation-audit`. Kod/plan/test teslim commit'i `2052da1384df51b1975d72971a8a7fd327a9266f` için push başarılı; sonrasında `git ls-remote --heads` kimliği yerel HEAD ile birebir eşit doğrulandı. Bu makbuz ayrı sonraki belge commit'inde kaydedilir; kendi commit kimliğini önden tahmin etmez. `master` birleştirilmedi, mevcut uzak geçmiş yeniden yazılmadı, PR oluşturulmadı.

Taze birleşik koşu: 377 test / 377 pass / 0 fail/skipped/cancelled. MJS/legacy JS syntax ve diff kontrolleri başarılı. Ayrıntılı kapsam ve eksikler [teslim kanıtı](DELIVERY_EVIDENCE_2026-10-03.md) içindedir.

## Drive Desktop arşivleri

Hesap köküne göre göreli konumlar; kişisel hesap adresi, anahtar ve ham öğrenci verisi bu makbuza yazılmaz.

| Paket | Göreli dizin | Dosya / bayt | Doğrulama |
| --- | --- | ---: | --- |
| Kaynak + taslak | `K12-Codex-Archive/2026-10-03/k12-archive-20261003-1791029020893` | 51 / 143.447.291 | Kaynak ve kopya SHA-256/boyutları tekrar doğrulandı |
| Güncel teslim kanıtı | `K12-Codex-Archive/2026-10-03/k12-archive-evidence-20261003-2052da1` | 17 / 250.338 | Kopyalama sonrası 17 hedef dosyanın SHA-256'sı tekrar doğrulandı |

İkinci paket bu commit'ten önceki README, plan/kanıt belgeleri, kaynak metaverisi, GitHub push makbuzu ve iki sentetik öğrenci UI görüntüsüdür. Bu belge ikinci paketin içinde değildir. Yeni paketler önceki dosyaları değiştirmedi veya silmedi.

İki paket de `local_copy_verified`; `remoteSyncState:not_verified`. Yerel Desktop mount'una kopya, Drive sunucusunda teslim/backup doğrulaması değildir. Yeni Drive OAuth/MCP kurulmadı; kapasite kullanıcı beyanı, API ile doğrulanmış boş kota değildir. Kaynak PDF'ler reference-only; kamuya açık Git'e kopyalanmadı.

## Canlı ve yayın sınırı

Cloudflare verify bir kez active; 0 inference çağrısı. Sohbette görünen anahtar yeni üretimde kullanılmıyor ve Git/arşiv kanıtlarına kaydedilmedi. Yeni güvenli credential ve açık canlı maliyet/çağrı sınırı olmadan ücretli benchmark başlatılmaz.

100 adaydan 12 kontrol edilmiş taslak, 88 tekrar/çeşitlilik reddi; 0 uzman kabulü / 0 yayın. Öğrenci 3335 ve editör 3334 yerel önizleme. Kalıcı defter, gerçek okul auth/PostgreSQL/kota, 36.000 içerik, MP4/ses ve Flutter fiziksel cihaz teslimi bu makbuzla tamamlanmış sayılmaz.
