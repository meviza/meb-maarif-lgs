# Okul barındırması ve geliştirme kapasitesi kararı

Tarih: 2026-10-03. Durum: araştırma ve dağıtım tasarımı; canlı okul kurulumu veya KVKK uygunluk belgesi değil. Docker hesabına giriş, kart işlemi, abonelik/kredi aktivasyonu ve ücretli kaynak oluşturma yapılmadı.

## Karar

Mac geliştirme/önizleme cihazı olarak kalır; okulun sürekli sunucusu olmaz. Docker Cloud Sandboxes, hesap/kredi/aşım sınırı ayrıca doğrulandıktan sonra yalnız süreli, sentetik veya hakları uygun özgün içerik işlerine adaydır. İlk müşterinin gerçek verisi için okul tesisinde kurulum veya sözleşmeli, konumu ve destek erişimi belgelenmiş yönetilen barındırma ayrı değerlendirilir. Donanım satın almak şu an ön koşul değildir.

“On-prem”: okulun kendi tesisindeki kurulum. “Yönetilen barındırma”: belirli veri merkezindeki altyapının işletilmesi. Kiralanmış bulut altyapısı fiziksel olarak bize ait sunucu veya okul içi on-prem diye tanıtılmaz. Hizmetin yazılımı ve işletimi bize ait olabilir; altyapının mülkiyeti/konumu ayrı açıklanır.

## Docker fiyat ve kredi hesabı

[Docker'ın resmî promosyonu](https://www.docker.com/c/sbx-promo/) Small = 2 vCPU / 4 GiB, $0,14/saat; Medium = 4 vCPU / 8 GiB, $0,28/saat. Başlatma–durdurma arasındaki kurulum, boşta bekleme ve tekrarlar da ücretlenir. Model API/ajan aboneliği ayrı. $250 teklif yeni Agentic Platform kayıtları için 22 Eylül–31 Ekim 2026; kart gerekiyor, aşım karta yansıyor, kredi altı ayda bitiyor. Hesabın teklife uygunluğu burada doğrulanmadı.

| Compute varsayımı | Sandbox-saat | Compute USD |
| --- | ---: | ---: |
| Small, 30 gün × 24 saat | 720 | 100,80 |
| Small, 75 gün × 24 saat | 1.800 | 252,00 |
| Small, ayda 22 gün × 2 saat | 44 | 6,16 |
| Medium, ayda 22 gün × 4 saat | 88 | 24,64 |
| Üç ayrı Small, her biri 22 gün × 4 saat | 264 | 36,96 |

`250 / 0,14 = 1.785,714 saat = 74,405 gün`. Bu kredi karşılığıdır, kesintisiz çalışma taahhüdü değil. Vergi, model, diğer sağlayıcı ve operasyon giderleri dahil değil. Paralel yerel Codex ajanı sayısı ile ücretli sandbox sayısı aynı şey değildir.

## Neden ilk okulun üretim sunucusu değil?

[Cloud CLI desteği deneysel](https://docs.docker.com/ai/sandboxes/cloud/). [Yaşam döngüsü](https://docs.docker.com/ai/sandboxes/cloud/usage/) varsayılan bir saat; uzatmalar oluşturulmadan itibaren 24 saati aşamaz. Always-on yeniden başlatma ayrı hesap yetkisine bağlıdır; özel uptime SLA doğrulanmadı. Volume snapshot sürekli yazılmıyor; aynı volume'a paralel sandbox çıkışları son-yazan-kazan davranışı gösterebilir. `docker exec`/Compose healthcheck için belgeli dosya sistemi sorunu var. Uygulama testinin exit 0 vermesi gerçek container/health kabulü değildir.

[Duyuru](https://www.docker.com/blog/introducing-cloud-sandboxes-start-on-your-laptop-finish-in-the-cloud/) volume/egress için ayrı ücret olmadığını belirtiyor; kapasitenin sınırsız olduğu sonucu çıkarılmadı. Disk kotası hesap bazında teyit edilmeden büyük arşiv buraya taşınmaz. [Gizlilik metni](https://www.docker.com/legal/privacy/) self-service AI altyapısını ABD'de konumlandırıyor; otomatik paused snapshot'lar ayrıca kaydedilmezse yedi günlük silme sürecine tabi. Sandbox disk/snapshot bağımsız yedek değildir.

## KVKK ve DAMA geçiş kapısı

Yalnız yerel sunucu veya şifreleme seçmek bütün yükümlülükleri sağlamaz. [KVKK güvenlik yükümlülükleri](https://www.kvkk.gov.tr/Icerik/2040/Veri-Guvenligine-Iliskin-Yukumlulukler) teknik/idari tedbir, denetim ve veri işleyenle güvenlik sorumluluğunu açıklar. [Yurt dışına aktarım rehberi](https://www.kvkk.gov.tr/Icerik/8142/Kisisel-Verilerin-Yurt-Disina-Aktarilmasi-Rehberi) kapsamında ülke, yedek, destek erişimi, log, analitik ve AI alıcıları birlikte haritalanır. Düzenli bulut aktarımı arızi aktarım istisnasıyla varsayılmaz. Gerektiğinde uygun aktarım güvencesi ve [standart sözleşme usulü](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu) hukuk uzmanıyla değerlendirilir.

Gerçek veri için zorunlu karar/kanıt:

1. Okul/platform/alt sağlayıcı rolleri ve yazılı talimat; amaç, dayanak, owner/steward, saklama/silme envanteri.
2. Çocuk/veli için anlaşılır aydınlatma, hak başvurusu ve gereken temsil/rıza doğrulaması. Çocuk verileriyle model eğitimi veya bağımsız profilleme varsayılan kapalı.
3. Veri konumu ve tüm alıcı/alt sağlayıcılar; yurt dışı yönetici erişimi dahil aktarım değerlendirmesi.
4. Tenant+sınıf/yıl izolasyonu, MFA/rol yetkileri, şifreleme/anahtar ayrımı, private medya ve denetlenebilir erişim.
5. Geri yükleme/silme/ihlal tatbikatı; bağımsız güvenlik incelemesi ve gerçek yük testi.
6. Okul yetkilisi ve KVKK hukuk uzmanı tarafından belgeli geçiş kararı.

Bu koşullar plan; uygulanmış üretim güvenliği veya hukuki sertifika değildir. Geliştirme yalnız sentetik kayıtlarla sürer.

## Ölçülenler ve kapasiteyi nasıl belirleyeceğiz?

Mac ARM64 / 16 GiB RAM; anlık `df` yaklaşık 19 GiB boş alan gösterdi. Kişisel dosyalar silinmedi. Tek özgün dikdörtgen çözümünün 35 s / 720p sessiz MP4 tekrar üretimi `/usr/bin/time -l`: 2,82 s gerçek süre, 545.767.424 byte maksimum RSS (yaklaşık 520,5 MiB), 0 swap. Bu bütün Mac'in veya eşzamanlı işlerin toplam bellek ölçümü değil; tek koşunun araç çıktısıdır. Docker, TTS ve difüzyon video benchmark'ı yapılmadı; 36.000'e doğrusal performans garantisi çıkarılmaz.

Başlangıç yük deneyi: tek CPU worker, encoder iki thread, sınırlı cache; RSS/CPU/süre/output-byte ve başarısız tekrar ölçümü. Okul API/PostgreSQL/medya yükü worker'dan ayrılır. Eşzamanlı kullanıcı sayısı, içerik tüketimi, istek profili ve restore hedefi bilinmeden okul için “4 GB yeterli” denmez. Kabul hedefi: tenant kaçışı 0; doğru cevap/medya bağı hatası 0; bütçe aşımı reddi; p95 gecikme, restore RPO/RTO ve hata oranı pilotta belgelenir.

## Medya depolama planı — yalnız varsayım

36.000 videonun her biri 90 s varsayılırsa içerik toplamı 900 saat; bu render-compute süresi değildir. Video 2 Mbps + ses 96 kbps = 848,88 GB tek kodlanmış kopya. 3 Mbps + aynı ses = 1.253,88 GB. Ayrı bir yedekle iki kopya sırasıyla 1,698 / 2,508 TB. Kayıpsız master, ek çözünürlükler, HLS/kapsayıcı, sürümler ve görseller dahil değil. Her sorunun videolu olması da henüz ürün kararı değil.

100/200 eşzamanlı izleyici 2,096 Mbps payload ile yaklaşık 209,6/419,2 Mbps toplam aktarım ister; CPU sayısından çok medya sunumu/ağ önem kazanabilir. Gerçek tüketim ölçülmeden bant genişliği taahhüdü verilmez.

Drive'ın 5 TB alanı referans/özgün taslak ve arşive yararlı; PostgreSQL/üretim CDN'i veya okul kişisel verisi için otomatik onaylı depo değildir. Canlı sistemde yetkili nesne deposu, metadata/veritabanı ve analitik ayrılır. SSD mevcut araç/cache için seçenek; gerekli olmayan modeller indirilmez, kalıcı öğrenci sunucusu diye kullanılmaz.

## Fazlar

- Şimdi: yerel kod/test, kaynak hak ve çıktı eşlemesi, video taslağı; yeni büyük SDK/model indirmesi yok.
- Sonra: hesap/kredi/limit doğrulaması ve açık maliyet sınırıyla tek sentetik Docker CPU işi; job çıktısını hash'li özel arşive doğrula, sandbox'ı durdur.
- Ses: [model/lisans araştırması](MEDIA_TOOL_RESEARCH_2026-10-03.md), izinli yetişkin ses/provenans, küçük Türkçe pilot; başarı/süre/RAM ölçülmeden toplu iş yok.
- Okul: gerçek auth/tenant/DB, hukuk ve güvenlik kapıları, yük/restore testi; uygun hosting sözleşmesi ve ayrıca üretim izni.
