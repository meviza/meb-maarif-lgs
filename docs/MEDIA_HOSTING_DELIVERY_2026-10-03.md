# Medya/depolama ek fazı — teslim ve açık kapılar

Dal `codex/k12-foundation-audit`; Antigravity özgün ağacı ve ana dal korunur. 3 Ekim 2026, önceki 377-test teslimine ek iş ürünü.

## Gereksinim → kanıt

| Gereksinim | Gerçek kanıt / durum |
| --- | --- |
| Docker $250 / 2 vCPU hesabı | Resmî güncel fiyat/şartlar araştırıldı: 4 GiB / $0,14/h / 74,405 gün compute karşılığı; [barındırma kararı](HOSTING_STRATEGY_2026-10-03.md) |
| Mac/Docker ekonomik iş bölümü | Mac 16 GiB / anlık 19 GiB boş; tek render ölçümü 2,82 s, ~520,5 MiB max RSS; bulut veya ağır AI benchmark değil |
| Kullanıcının animasyon/TTS kaynakları | 47 satır tamamı okundu; kod/ağırlık/Türkçe/voice/GPU ayrımı [araştırma matrisinde](MEDIA_TOOL_RESEARCH_2026-10-03.md) |
| Oynatılabilir çözüm videosu | 35 s sessiz gerçek H.264 MP4; ayrı üretimde aynı hash; ffprobe/decode/görsel kontrol; [kanıt](VIDEO_PILOT_EVIDENCE_2026-10-03.md) |
| Drive uzak arşivi | 12 PDF + 1 teslim belgesi tam byte/hash + private parent/MIME/size; 58 arşiv dosyası henüz aktarılmadı; [kısmi makbuz](DRIVE_REMOTE_EVIDENCE_2026-10-03.md) |
| İndirilen eğitim kaynaklarının sayısı | 42 kayıt; yerelde 34 PDF / 142.959.822 byte fresh SHA doğrulandı; 14 LGS, 10 güncel program, 8 geçmiş, 2 rehber; 8 eski program URL başarısız. Özel açık lisanslı kaynak 0; tüm reuse-rights unverified/reference-only |
| Test/güvenlik kapıları | Yeni 11 Drive stream + 9 video unit; default suite toplam 397 / 397 pass, 0 fail/skipped/cancelled; altı MJS syntax ve diff check başarılı |

Ana ajan ajan raporlarını bağımsız kod/test/gerçek render ve byte geri okumayla kontrol etti. Üç ayrı araştırma/uygulama ajanı Docker, KVKK/model lisansı ve video üretiminde kullanıldı; paralel ajan sayısı ücretli Docker sandbox sayısı değildir. Alan sahnesindeki açıklama/eşitlik hatası negatif testle yakalanıp düzeltildi; bağımsız tekrar kontrolü ve ikinci gerçek alan MP4'ü de doğrulandı. Testlerin geçmesi CMMI 3, SPICE 2, KVKK, MEB veya pedagojik sertifika değildir.

## Açık kapılar

- Docker kullanıcı hesabında promosyon hakkı, fatura/aşım kontrolü, disk kotası ve güvenli secret aktarımı doğrulanmadı; abonelik/kart/ücretli kaynak açılmadı.
- TTS/voice kurulmadı/üretilmedi; konuşmacı hakkı, exact checkpoint revision, Türkçe kalite ve süre/bellek benchmark'ı bekliyor.
- Generatif I2V yok; gerçek MP4 deterministik beş sahne ve hafif fade. Kanonik müfredat eşlemesi/uzman kabulü yok; öğrenciye yayın 0.
- İlk okulun auth/DB/tenant/restore/yük ve hukuk/güvenlik geçişi tamamlanmadı. On-prem ile yönetilen bulut sözleşme seçenekleri ayrı.
- Drive arşivi kısmi; iki paralel streaming başarısızlığı yeni upload olmadan seri geri okuma ile geçti, ilk kök neden kanıtlanmadı. Devam concurrency=1 ve mevcut ID/manifestten; otomatik silme/yayın yok.

## Geri alma / devam

Yeni video ve Drive verifier ayrı CLI/modüllerdir; eski üretim komutları karantinada kalır. Yeni video dizinleri eski çıktıyı değiştirmez. Yeni Drive klasörleri özel ve ayrıdır; bu fazda dosya silinmedi. Gerçek veriye veya ücretli işlemlere geçmeden açık kapılar için ayrıca yetki/kanıt gerekir. Sonraki güvenli iş: bir resmî çıktı eşlemesi ve lisansı/provenansı tamamlanmış küçük Türkçe ses pilotu; öğrenci yayın kapısını açmadan.

Git'te yalnız kod/test ve bu redakte özetler tutulur. Video/PDF'ler, özel Drive ID/link'leri, kişisel hesap adresi, kısa ömürlü signed reference ve token Git'e konulmaz. Push ardından remote dal hash'i ayrıca doğrulanır; bu belge kendi commit'ini önden tahmin etmez.
