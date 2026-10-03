# Tek platform: yeniden bazlama ve uygulama planı

Tarih: 2026-10-03. Dal: `codex/k12-foundation-audit`. Asıl Antigravity/Gemini çalışma alanı korunur. Bu belge satış taahhüdü, MEB onayı veya süreç sertifikası değildir.

## Ürün kararı

1–8 arasında kimliği ve öğrenme geçmişi devam eden tek platform; öğrenci, veli, öğretmen, içerik editörü, alan uzmanı ve okul idaresi farklı görev/erişimlerle hizmet alır. Önce Ankara okul pilotu, sonra Türkiye. Uluslararası açılım ayrı müfredat, hak ve veri konumu tasarımı gerektirir.

36.000 **özgün soru** ilk kapsam hedefidir; konu anlatımı, örnek, etkinlik ve çözüm varlıkları ayrıca sayılır. 36 hafta, plan görünümüdür; resmî yıllık takvim/öğretim süresi veya bütün sınıflarda aynı dersler varsayılmaz. Öğrenme ilerlemesi sarmal olabilir: aynı beceri üst sınıfta daha derin işlenebilir; tekrar ancak ön koşul veya gerçek öğrenme kanıtıyla gerekçelendirilir.

Önerilen başlangıç sınıf bütçesi, müfredat sayımından sonra yeniden dağıtılacak **planlama** değeridir:

| Sınıf | Soru bütçesi | Tasarım odağı |
| --- | ---: | --- |
| 1 | 1.600 | Okuma ön koşulu olmadan görsel/işitsel seçme, sıralama, eşleme |
| 2 | 2.400 | Somut model, kısa yönerge, okuma gelişimi |
| 3 | 3.200 | Açıklama, temsil değiştirme, basit araştırma |
| 4 | 4.000 | Çok adımlı düşünme, neden-sonuç, ön koşul kontrolü |
| 5 | 5.200 | Gerekçeli problem çözme ve disiplinler arası bağ |
| 6 | 6.000 | Analiz, hata teşhisi, karşılaştırma |
| 7 | 6.600 | Modelleme, kanıt değerlendirme, aktarım |
| 8 | 7.000 | Derin muhakeme + güncel LGS kapsamı |
| Toplam | 36.000 | Sayıdan önce kapsama ve madde niteliği |

Ders → program sürümü → öğrenme çıktısı → mikrobeceri → ön koşul/yanılgı → soru ailesi → temsil → bilişsel işlem → zorluk → amaç → kota. Örneğin “problemler” başlığı yeterli değildir; havuz/işçi/yaş gibi aileler ancak ilgili sınıfın resmî çıktısında gerçekten karşılığı varsa kullanılır. Değişmeyen çıktılar daha çok varyanta adaydır; eski sorunun aktif programa uygunluğu otomatik varsayılmaz.

## Model ve içerik mimarisi

Clef Flash üretici değil, çok modlu karar/ön-denetim modelidir. Serbest metin üretimi yapmaz; Jev/SystemOne uyumlu seçenek olasılıkları döndürür. Model ağırlıkları Apache-2.0; barındırılan hizmetin koşulları ve fiyatı ayrıdır. [Cloudflare model/API](https://developers.cloudflare.com/workers-ai/models/clef-flash/) · [Resmî model kartı](https://huggingface.co/Cloudflare/clef-flash)

Üretim akışı:

```text
Hak/kaynak kaydı + aktif program + kapsam hücresi
 → üretici (metin/ders taslağı veya doğrulanabilir parametrik soru)
 → şema + bağımsız çözüm + birim/tek cevap kontrolleri
 → deterministik diyagram / ayrı özgün illüstrasyon
 → hash + yapısal ve anlamsal benzerlik taraması
 → Clef metin ve raster görsel ön-denetimi
 → öğretmen + ölçme + dil/erişilebilirlik + hak incelemesi
 → izinli küçük pilot → sürümlü yayın / geri çekme
```

İlk pilotta sayı hesabı ve geometri programatik doğrulanır; “AI doğru dedi” kanıt değildir. Yalnız sayı değiştirilen şablonları 100 özgün soru diye saymayız. Şablon/strateji/temsil çeşitliliği kotaları, benzerlik veri kümesi ve tarama sınırı raporlanır. “Sıfır intihal garantisi” ve “halüsinasyon imkânsız” denmez; kritik hatayı yayına geçirmeyen kapılar ve geri çekme mekanizması kurulur.

Her üretim işinin üst sınırı 100; yeniden deneme sayısı, sağlayıcı maliyeti, prompt/model sürümü, kaynak kapsamı ve kabul/ret nedenleri kaydedilir. Başarısız 100'lük işi tamamlamak için denetim gevşetilmez. Onay/çeşitlilik/kazanım kapısı geçmeyen taslaklar toplam yayımlanmış banka sayısına eklenmez. Mevcut pilot tüm sınıfları/dersleri kapsamıyor.

Konu anlatımı hattı: çıktı ve ön koşul → somut örnek → görsel temsil → açıklama → kontrollü uygulama → farklı bakış açısı → biçimlendirici soru → öğretmen incelemesi. İlk sınıfta ses sonradan süs değildir; okuryazarlık engelini kaldıracak temel gereksinimdir. Konu anlatımı tek sorunun çözüme çevrilmiş metni değildir.

## Videolu çözüm

Doğrulanmış çözüm grafiği ortak kaynak olur: verilenler, hedef, işlem, gerekçe, sonuç ve yanılgı. Aynı sayılar soru, SVG ve sahne metninde kullanılır; rastgele LLM metninden animasyon çıkartılmaz.

İlk teslim hafif adım oynatımı + sahne/transkript JSON'uydu. Ek teslimde bir özgün dikdörtgen sorusu için 35 saniyelik gerçek **sessiz MP4** üretildi ve yeniden üretim/hash/codec/tam decode kontrolleri yapıldı; [video kanıtı](VIDEO_PILOT_EVIDENCE_2026-10-03.md). Bu, sesli çözüm veya uzman/müfredat onayı değildir. Sonraki adım lisanslı ve izinli Türkçe TTS, ses–sahne senkronu, hız/durdurma/hareket azaltma ve mobil okunurluk. Matematik şekli deterministik renderer ile korunur; generatif I2V ayrı dekoratif/öykü işidir. Clef kareleri ön-denetleyebilir, video üretemez ve matematik ispatının yerine geçemez. Başarı/terk ölçümü ve satış etkisi pilotta ölçülür; “değer iki katına çıkar” doğrulanmış sonuç değildir.

Kullanıcı bu statik/sessiz yaklaşımı kalite bakımından reddetti. Yenilenen kabul: önce veri altı çizme/çevreleme, sonra uç konumu çizgi ucunda ilerleyen gerçek kalem izi, ara sonucu işaretleme ve anlam etiketi; bunlarla aynı çözüm grafiğinden gelen, yaşa göre karakterli Türkçe öğretmen sesi. 1–2/3–4/5–6/7–8 persona, utandırmayan hata dili, vurgu–düşünme molası ve kör öğretmen dinlemesi [ayrı kalite standardıdır](TEACHER_VIDEO_STANDARD_2026-10-03.md). Yeni yerel hareket taslağı ses kalite kabulü değildir. Tam öğretici çözüm süresi ihtiyaca göre uzar; 30–35 s özet/reklam türevi ayrı tutulur. 1–4 yaklaşık %20 video kapsama hedefi, üst sınıflarda pedagojik yarara göre artış henüz üretilmiş kapsama değildir.

Google AI Pro/Flow avantajı, ücretli Gemini API projesi veya TTS kotasıyla aynı şey değildir. Google TTS yetişkin editör pilotuna aday; çocuk odaklı canlı API için hizmet yaş/dağıtım kapsamı ayrıca netleşmelidir. GPU'suz Docker CPU worker deterministik render/batch içindir; Wan gibi büyük I2V modelinin donanım ihtiyacını çözmez. Şu an yeni model/SDK, ücretli bulut işi veya ses klonlama açılmadı.

Mac/Docker/GPU iş bölümü, $250 kredi hesabı, gerçek okul veri kapısı ve depolama varsayımları [barındırma kararı](HOSTING_STRATEGY_2026-10-03.md); araç/ağırlık/ses lisansları [medya araştırması](MEDIA_TOOL_RESEARCH_2026-10-03.md). Docker Sandbox okulun on-prem sunucusu olarak sunulmaz. Büyük modeller ve ücretli hesap/işler otomatik açılmaz.

## DAMA-DMBOK merkezli veri tasarımı

DAMA 11 bilgi alanıyla bir yönetişim çerçevesidir; hazır bir veritabanı şeması veya kendiliğinden alınan sertifika değildir. Kullanılan temel DMBOK2 revizyonu ve sonraki revizyon değişiklikleri karar kaydına bağlanır. [DAMA resmî açıklaması](https://dama.org/about-dama/what-is-data-management/) · [Revizyon](https://dama.org/dama-dmbok-revision/)

| Alan | Ürün karşılığı / zorunlu kanıt |
| --- | --- |
| Yönetişim | Owner/steward, amaç, hak, saklama, yayın ve geri çekme kararları |
| Mimari | İşlemsel/medya/analitik ayrımı; tenant ve ülke sınırı |
| Modelleme | Kavramsal–mantıksal–fiziksel model; sürümlü veri sözlüğü |
| Depolama/operasyon | Kota, restore, cache bütçesi, checksum, RPO/RTO ölçümü |
| Güvenlik | Kimlik, rol+amaç, tenant izolasyonu, erişim denetimi |
| Entegrasyon | Sürümlü API, idempotent olay/senkronizasyon, taşınabilir içerik |
| Belge/içerik | Kaynak arşivi, ders/soru/görsel/ses/video yaşam döngüsü |
| Ana/referans veri | Okul/ders/sınıf/çıktı kodlarının kanonik kayıtları |
| Ambar/BI | Takma kimlikli olaylardan amaçla sınırlandırılmış veri ürünleri |
| Metaveri | Kaynak URL/hash/sürüm/sayfa, model/prompt/inceleme soy-ağacı |
| Kalite | Doğruluk, eksiksizlik, tutarlılık, güncellik ve olay kaydı |

PostgreSQL kimlik/yetki ve işlemsel kayıtlar; sürümlü nesne deposu medya; ayrı takma kimlikli analitik alan. Drive 5 TB referans/taslak arşivi ve yedek hedefidir; veritabanı, DB tranzaksiyonu veya üretim CDN'i değildir. Drive kapasitesi kota/CPU/tenant izolasyonu testi yerine geçmez. Büyük kaynaklar GitHub'a kopyalanmaz; küçük hash'li katalog/kod/raporlar kaydedilir. Cache sınırlı tutulur; harici SSD yolu yapılandırılabilir. Hiçbir rutin temizlik kişisel dosyaları otomatik silmez.

## Okula satış ve dağıtım

Modüler monolit ile başlanır; erken mikroservis karmaşıklığı yok. Tenant=okul; grup/öğretmen/veli ilişkileri sunucuda çözülür, istemci tenant beyanı yetki değildir. Yönetilen kurulum ve okul sunucusuna kurulum aynı sürümlü API/paket/veri sözlüğünü kullanır.

Kotalar: aktif hesap, depolanan fiziksel bayt, medya türevleri, günlük iş/istek, eşzamanlı görev ve işlem bütçesi ayrı sayaçtır. Rezervasyon → iş → commit/serbest bırakma atomik/idempotent olmalı; paralel işlerde aşım, tenantlar arası erişim ve başarısız upload temizliği negatif testlerle doğrulanır. CPU “gücü” pazarlama etiketi değil, worker/concurrency/runtime ve ölçümlü SLA olur. Yedek kotaya dahil mi açıkça sözleşmede belirlenir. Şu anda bunlar tasarımdır; üretim kotası/izolasyonu uygulanmış kabul edilmez.

## Analitik ve rehberlik

Ölçülebilir gözlemler: beceri/çıktı başarısı, hata örüntüsü, yardım kullanımı, cevap değişikliği, çözüme aktarım ve zaman içindeki kanıt. Zorluk etiketi başlangıçta uzman tahminidir; örneklem sonra madde güçlüğü, ayırt edicilik, çeldirici işleyişi ve belirsizlikle kalibre edilir. Eksik veri başarı veya başarısızlık gibi doldurulmaz.

Bir soru bankasından çocuğun “zekâ türü”, sezgisel kapasitesi, ahlaki niteliği veya gelecekteki mesleği kesin çıkarılamaz. Bunlar ayrı geçerlik/güvenirlik kanıtı ve uygun izin gerektirir. Çocuğu etiketlemeyen, öğretmenin değiştirebildiği destek önerileri ve ilgi keşfi sunulur. Veli özeti sıralama değil ilerleme ve destek açıklamasıdır. Küçük grupları yeniden tanımlayabilecek analitik gösterilmez.

Finlandiya/Singapur birer sabit kişilik profili değildir. Somut–görsel–soyut temsil, rehberli keşif, aralıklı geri çağırma, oyun/araştırma ve açık öğretim gibi teknikler görev ve öğrenci kanıtına göre denenir. Birkaç yanlış cevapla çocuğa kalıcı “öğrenme stili” atanmaz.

## Arayüz ve mobil

Flutter öğrenci Android/iOS; telefon/tablet ve erişilebilir çevrimdışı paket. Öğretmen/editör/veli/okul web portalı responsive; masaüstü/Mac tarayıcı desteği. Aynı marka/tokens ve öğrenme sözlüğü, yaşa göre kontrollü yoğunluk. Şimdiki İçerik Atölyesi SDK'sız bir yerel web prototipidir; Flutter uygulaması değildir.

### Okulun yıllık öğrenci/sınıf lisansı ve kişisel çalışma masası

Okul sözleşmesi öğretim yılı ve öğrenci sayısı üzerinden kapsam verir. Güvenilen kayıt zinciri: okul → yıllık sözleşme → öğrencinin aktif kayıt/sınıfı → izinli ders/aktif program → yayımlanmış içerik revizyonu. 6. sınıf öğrencisinin kullanıcı menüsünde diğer sınıflar yoktur. URL, arama, kaydedilenler, paylaşım, medya ve çevrimdışı paket isteğinde de sunucu aynı sınıf/yıl/tenant kapsamını kontrol eder; sınıf dropdown'unu gizlemek yetki mekanizması değildir. Sözleşme bittiğinde erişim ve saklama kararı ayrı değerlendirilir; veri geçmişi sessizce silinmez.

Öğrenci home: kişisel çalışma masası; sınıfına ait derslerin çekmecesi; kaydettiği soru ve anlatımlar; takıldığı noktalar; not/kalem/çizim alanı; öğretmene paylaşım için seçtiği çalışma. Reklam/landing sayacı ve editör cevap anahtarı öğrenci home'a taşınmaz. Kaydetme, çözme ve uzman kabulü farklı durumdur. Çalışma defteri sorunun değişmez revizyonuna ve kayıt kapsamına bağlanır; sil/geri al, metin alternatifi ve ekran okuyucu/klavye desteği tasarlanır. Paylaşım varsayılan özel; sınıf panosu veya tüm okul görünürlüğü otomatik açılmaz. Öğretmen ilişki/yetki kontrolü ve çocuğun paylaşım seçimi ayrı kapıdır.

Yaşa göre giriş/karşılama: 1–2 için ses ve az yazıyla somut oyun/keşif; 3–4 için küçük keşif görevleri; 5–6 için bağımsız çalışma ve merak; 7–8 için daha sakin, esprisi dozunda, problem/araştırma odaklı görünüm. Bunlar ayrı marka uygulamaları değil aynı tasarım sisteminin yaş varyantlarıdır. Animation yükleme engeli değildir, reduced-motion ile kapanır. Çocuğa kalıcı öğrenme/zekâ etiketi verilmez; Singapore tarzı somut–görsel–soyut temsil ile Finlandiya'dan esinlenen rehberli keşif ve öğrenci özerkliği görev bazında denenir. Eğitim etkinliği çocuk/öğretmen pilotu ile ölçülecek; ülke adı tek başına kalite kanıtı değildir.

Bu oturumun ilk öğrenci yüzeyi sadece sentetik 6. sınıf yerel önizlemesidir. Gerçek okul login'i, kalıcı kişisel notlar, öğretmene gönderim veya diğer yaş bantlarının bitmiş ekranları olarak gösterilmez. Defter oturum belleğinde çalışır; sayfa yenilenince kaybolduğu açıkça belirtilir. Kalıcı kayıt/senkronizasyon ancak kimlik, şifreleme, sürüm/çatışma, saklama ve yetki kapılarıyla backend fazında bağlanacaktır.

Mevcut ekranın denetimi: dar ekranda üst menü sıkışıyor; kapalı içerik API'si nedeniyle boş kartlar yanıltıcı “0 soru / soru 1” gösteriyor; rol/üretim ekranları henüz gerçek görev akışı değil. Yeni yerel stüdyo bu iddiaları tekrarlamaz; gerçek üretim/kaynak kanıtını açık durumlarıyla gösterir. Öğrenci/API güvenlik kapıları dashboard yapmak için açılmaz.

UI8/Behance/Dribbble yalnız görsel araştırma kaynağı; varlık/tema kopyalanmaz. [Dribbble eğitim panoları](https://dribbble.com/search/education-dashboard) erişildi; UI8/Behance doğrudan erişimi bu oturumda başarısızdı. Son marka adı, özgün ikon/illüstrasyon yönü ve çocuk senaryosu ayrıca seçilecek. Stüdyo tipografik/iş odaklıdır; öğrenci maskotu veya bitmiş ikon seti iddiası yok. Üretim kaynağı iç denetim kayıtlarında saklanır; görsel kaliteyi AI kullanımını saklama vaadine indirgemeyiz.

Hareket: konu geçişini açıklayan kısa animasyon, durdurulabilir adım oynatımı, reduced-motion tercihi; 1. sınıfta yönerge ve dokunma hedefleri, 5–8'de problem alanı ve okunabilir diyagram önceliklidir. Hedef WCAG 2.2 AA + gerçek yaş grubu kullanılabilirlik; ekran görüntüsü tek başına uygunluk kanıtı değildir. [W3C](https://www.w3.org/TR/WCAG22/)

## Faz kanıtları ve sıralama

1. Mevcut kod/referansları doğrula, sahte/kanıtsız iddiaları ayır; kaynak ve pilot araçlarını çalıştır.
2. Bir resmî sınıf/ders/çıktı için kanonik sayfa/hash eşlemesini öğretmenle doğrula. İlk 100'lük çeşitli soru/ders işini üretici+Clef canlı bağlantısı ile yürüt; tümünü alan/ölçme/hak incelemesine sok.
3. Gerçek okul backend'i: DB migrasyonu, auth/roller, kalıcı editör işlemleri, tenant ve kota. İlk öğrenci–öğretmen–veli dikey dilimi.
4. Gerçek video/ses ve Flutter fiziksel cihaz pilotu; restore/erişilebilirlik/düşük ağ.
5. Kapsam hücreleri üzerinden 1–4 ve 5–8 genişlemesi, madde kalibrasyonu; yayımlanmış sayıyı 36.000'e taşı.

Her faz: gereksinim → kabul/negatif test → değişiklik → bağımsız inceleme → test kanıtı → açık eksik/geri alma kaydı. CMMI seviye 3/ISO 330xx SPICE seviye 2 için süreç/iş ürünü kanıtı hazırlanır; testlerin geçmesi resmî derece vermez. [ISACA appraisal](https://www.isaca.org/resources/infographics/cmmi-appraisals) · [ISO 33020](https://www.iso.org/standard/78526.html)
