# Gece geliştirme — doğrulanmış başlangıç kaydı

Tarih: 2026-10-03, Türkiye saati. Dal: `codex/k12-foundation-audit`. Önceki temiz başlangıç: `026cbee`. Bu dosya sabah raporunun başlangıç kanıtıdır; sonraki çalışmalarda tarihli ek kayıtlarla güncellenir. Önceki raporlardaki 561 test ve “gerçek DB yok” ifadeleri o teslimin tarihsel durumudur; aşağıdaki ilerleme bunların yerine güncel kanıt sağlar.

## Bu gece gerçekten eklenenler

| Akış | Uygulama ve taze kanıt | Hâlâ kapalı / eksik |
| --- | --- | --- |
| Soru ve ders medyası | Ortak gerekçeli trace'ten değişken uzunlukta medya işi, ses isteği, altyazı metni ve düşünme aralıkları; normal fabrika CLI'si tutulan her soru ve ayrı dersi bu işlere bağlıyor | Gerçek yeni TTS, genel kalem renderer, kaynak görsel resolver, kelime–kalem ölçümü ve dinleme kabulü yok |
| Ses beyanı | Kaynak/trace/iş/istek/metin/stil/sağlayıcı/sıra/hash eşleşmesi ve süre/boyut bütçesi; eski altı-cue manifest yeni metne bağlanamıyor | Beyan ses dosyasını veya konuşulan metni doğrulamıyor. `voiced`, `rendered`, `publicationReady` kapalı |
| Gerçek PostgreSQL | Disposable yerel PostgreSQL 16: iki sentetik okul, dört scoped stream, 22 olumlu/olumsuz davranış tanığı; JS V2 hazırlayıcısı → SQL fonksiyonları → psql | HTTP auth, canlı resolver, uygulama DB driver'ı, kota, restore, yük ve üretim dağıtımı yok |
| Veri yönetişimi | SQL makbuzu/olayları ve tarihsel yönetişim sidecar'ı immutable; kaynak, amaç, saklama sınıfı, owner/steward referansları kayıtlı | Owner/steward değerleri sentetik. Gerçek veri sözlüğü sorumluları ve silme/saklama işletimi atanıp uygulanmadı; DAMA sertifikası değildir |
| Müfredat | 5. sınıf matematik için kaynak sayfalı kısmi kapsam taslağı; 23 çıktı, altı tema/yedi blok ayrımı; çevre–alanın eksik iki yönlü karşılaştırması belirlendi | Tam 1–8 çıktı/mikrobeceri haritası, etkin okul yılı, uzman ve hak kabulü yok |

Medya işleri: `packages/media/reasoned_media_job.mjs`, bağımsız küçük editör paketi: `tools/build_reasoned_media_jobs.mjs`. SQL: `db/migrations/001_synthetic_learning_ledger.sql`; gerçek deney: `tools/test_synthetic_learning_ledger_postgres.mjs`. Migration yalnız **taze, izole sentetik veritabanı** içindir; var olan okul/üretim DB'sine çalıştırılmaz.

## Taze koşular ve güvenlik bulguları

- Ana ajan tam testi gerçek medya opt-in'i ve güvenilir Sharp ile yeniden çalıştırdı: **586/586 pass, 0 fail, 0 skip**. Önceki 561'e 25 test eklendi: medya 14, medya CLI 3, normal fabrika bağlantısı 1, sentetik DB CLI 7. Opt-in gerçek SQL deneyi bu 586'nın dışında ayrıca çalıştırıldı.
- Ana ajan bağımsız SQL koşusu: `node tools/test_synthetic_learning_ledger_postgres.mjs --run --container k12-synthetic-ledger-root-night`, exit 0, **22 tanık**. Başka okul/sınıf/öğrenci erişimi ve unmapped rol reddedildi; tekrar makbuz yeni olay üretmedi; çelişkili hash, eski cursor ve tarihsel sidecar uyuşmazlığı reddedildi; işlem ortası uniqueness hatası ve sonraki yetkisiz yazı tam rollback yaptı.
- SQL kimliği istemcinin değiştirebildiği tenant ayarından değil `session_user` → sunucunun sentetik rol eşlemesinden gelir. Uygulama rolleri superuser değildir; fonksiyon sahibi NOLOGIN/NOBYPASSRLS; FORCE RLS ve sabit `search_path` kullanılır. Bu, gerçek HTTP oturum/yetki çözümleyicisinin kanıtı değildir.
- SQL'de doğru yeniden hashlenmiş null olay türü, null etkinlik/zaman, string sıra numarası ve null makbuz zamanı gerçek RED→GREEN deneyiyle kapatıldı. Bunlar JavaScript'in önceden reddetmesine güvenmeden SQL sınırını test eder.
- Bağımsız medya denetimi, virgülle birleştirilen alan adlarının sahte sağlayıcıyı kabul ettirebildiğini buldu. Regresyon testi önce başarısız oldu; exact key sayısı/üyeliğiyle düzeltildi. Sonraki bağımsız 84 adversarial şema/hook probe'u geçti. Bu bulgu yayın veya ağ kapısını açmıyordu; yine de hazır sağlayıcı/ses-beyan durumunu yanlış gösterebiliyordu.
- Docker yalnız önbellekteki `postgres:16.15-alpine` imajını kullandı: pull yok, network none, host port yok, 1 CPU, 256 MiB RAM, tmpfs+shm toplam 60 MiB. Ana ajan koşusunun kendi container'ı durdurulup kaldırıldı; ardından ad filtresi boş döndü. Var olan diğer container'lara dokunulmadı. Cloud Sandbox/kredi kullanımı değildir.
- Taze normal fabrika koşusu: **100 aday → 12 matematik taslağı → 88 çeşitlilik reddi**, altı aile, ayrıca bir kavram dersi ve bunlara bağlı 13 medya işi. `automatedPassed=0`, `expertApproved=0`, `published=0`. İkinci küçük medya-yazım paketi yedi soru + bir ders için sekiz iş/ses isteği içerir; yeni ses/video yok. Paketler birbirinden farklıdır; bu sayılar birleştirilip yeni kabul edilmiş soru sayısı yapılmaz.
- Syntax ve `git diff --check` geçti. Özel JSON/HTML/SVG paketleri repo dışında, sahip erişimli izinlerle tutuldu. Yeni HTML'nin gerçek tarayıcı/ekran okuyucu kabulü bu koşuda yapılmadı; CLI ve statik içerik testleri vardır. Açık 3338 önizlemesi önceki teslimdir.

Sınırlı SQL hash kodlaması mevcut ASCII anahtar/tamsayı fixture'ları için doğrulandı; genel sayı/Unicode serileştirme standardı veya production güvenlik sertifikası değildir. Ham ses/video, PDF, hesap ekranı, yerel yol içeren manifest veya token kamu GitHub deposuna alınmaz. Yeni medya işi serileştirilmiş JSON'u, WeakSet ile markalanmış canlı nesnenin yerine otomatik olarak güvenilir sayılmaz; worker gerçek kaynak resolver'dan tekrar kurmalıdır.

## Kaynak ve dış hizmetlerin güncel durumu

34 yerel PDF'nin PDF başlığı, boyutu ve SHA-256 değeri yeniden kontrol edildi: **142.959.822 bayt**, bütünlük hatası 0. Türler: 14 LGS, 10 güncel katalog programı, 8 geçmiş program, 2 kılavuz/ortak belge. Kayıt toplamı 42; 8 arşiv başarısızlığı hâlâ var. 34'ü de `reference_only` / `reuseRights: unverified`; özel açık-lisanslı kaynak 0. Dosya bütünlüğü tam müfredat veya ticari hak kabulü değildir.

Kaynak analizi: [5. sınıf matematik kapsam taslağı](GRADE5_MATH_COVERAGE_DRAFT_2026-10-03.md). Bu gece yeni toplu indirme, Drive upload veya uzak Drive doğrulaması yapılmadı. Önceki Drive makbuzu güncel uzak durum diye sunulmaz. Drive depolama; PostgreSQL, render CPU/GPU veya medya CDN yerine geçmez.

Clef/üretici/TTS sağlayıcılarına bu teslimde istek 0; öğrenci verisi 0; yeni ücretli iş 0; credential/plan değişikliği 0. Clef danışma/ön-denetim katmanıdır, soru/ses/video üreticisinin yerine geçmez. Wan/Comfy/Qwen ağırlığı, Flutter veya büyük yeni SDK indirilmedi. Önceki sesli MP4 ve ders sesi bu yeni gerekçeli anlatımın sesi değildir.

CMMI 3 / SPICE 2 için gereksinim–test–kanıt, TDD, bağımsız inceleme ve raporlama sürdürülür. 586 teknik test veya 22 SQL tanığı, yetkili olgunluk değerlendirmesi/sertifika ya da pedagojik-psikometrik geçerlik anlamına gelmez.

## Sabaha kadar kontrollü devam sırası

1. Kaydı/Git'i/aktif ajanları kontrol et; aynı dosyaya iki ajan yazmasın. Tamamlanan deneyi tekrar ederek aday sayısını büyütme.
2. Geometrik niceliklerde eksik aynı-çevre/farklı-alan aile ve oluşturma/açık uçlu temsilini kaynak sınırlarıyla uygula. Mikrobeceri, süreç, çözüm grafiği ve amacı ayrı tut; sayısal varyant yeni konu sayılmaz. Kapsam taslağını kanonik/onaylı diye yükseltme.
3. Yeni medya işini gerçek kaynak geometrisine bağla; genel cue/kalem renderer ve byte/süre doğrulamasını önce yerel, sentetik ve küçük koşuyla test et. Yeni yetkili TTS yapılandırması ve belirli iş bütçesi olmadan canlı ses çağrısı yapma; eski sesi yeniden etiketleme. Stil/metin için PII/credential taraması ve dinleme kabulü ayrı kalır.
4. SQL kanıtını güvenli uygulama adapter'ına taşı; auth/resolver sınırını taklit veriyle belirgin göster. Kota ve restore testi için varsayılan olarak taze/izole disposable alan kullan. Öğrenci defteri/öğretmen/veli akışını ancak bu gerçek kayda bağla; demo metriğini gerçek öğrenme kanıtı sayma.
5. Faz başına bağımsız negatif test, syntax, diff ve uygun tam suite; küçük hassas olmayan raporları ayrı dalda Git'e kaydet. Gereksiz cache/model/artifact büyümesini önle; var olan kullanıcı dosyalarını silme.

Bu sohbette gece için yarım saatlik devam ve **4 Ekim 2026 08:00 Türkiye saati** tek sabah raporu kuruludur. Yerel Mac ve uygulama açık/ağa bağlı kalmalıdır; bu bir harici sürekli sunucu garantisi değildir. Gece boyunca normal/değişmeyen durumlarda bildirim istenmiyor; önemli hata, karar ihtiyacı veya gerçek tamamlanma bildirilir. İnsan hak/alan/yaş/publikasyon onayı, credential, gerçek okul verisi ve belirlenmemiş ücretli bütçe sınırları devam eder. Sabah raporu biten/eksik/karar bekleyen işleri ayrı verir; “36.000 tamamlandı”, “MEB onaylı” veya “hepsi bitti” iddiasını kanıtsız kurmaz.
