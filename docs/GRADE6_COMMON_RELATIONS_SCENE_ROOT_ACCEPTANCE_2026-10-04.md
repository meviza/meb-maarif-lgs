# Ortak İlişki Sahnesi: Root Kabul Kanıtı

Bu dilim tek mevcut editör taslağının zaman/paket temsili ile güncel gerekçeli anlatım bölümü arasındaki bağlantıyı inceler. Yeni soru stoku, öğrenci kanalı, insan el yazısı, ses veya video üretimi değildir. Kaynak program, hak, uzman, zorluk ve erişilebilirlik kabulü ayrı kapılardır.

## Test Öncesi Kapsam

Root kapalı CLI için iki yeni davranış testi önce çalıştırıldı: mevcut sekiz test geçti, yeni scene/frame kipleri `invalid_grade6_reference_authoring_args` nedeniyle başarısız oldu; toplam 8 PASS / 2 FAIL, exit 1. Sonraki uygulama yalnız bu iki sabit kipi ekler. Arbitrary source/path/output/count/provider/reveal/cue parametreleri kabul edilmez. CLI'in stdout çıktısı dosya, sunucu veya sağlayıcı işlemi değildir.

## Tarayıcı Öncesi QA Envanteri

Bu liste henüz test sonucunu iddia etmez. Özel, salt-okunur loopback QA yüzeyi gerçek canonical builder/frame API'sini tüketir; üretim editörü veya çocuk arayüzü sayılmaz.

| İncelenecek İddia / Kontrol | İşlevsel Tanık | Görsel Durum / Kanıt |
| --- | --- | --- |
| İki ayrı bağlamın verilen nicelikleri karışmaz. | Zaman ve paket sahneleri arasında normal bağlantı/klavye gidiş ve dönüşü. | Zamanın dakika ekseni; tablonun kart/paket ve paket sütunları. |
| Güncel anlatım bölümünün vurgusu verilen/neden/sonuç ayrımını korur. | Başlangıç, ara ve bitmiş ilerleme sahneleri arasında gezinme. | Verilen sayı/koşul bölgesi, ara kalem ucu, gerekçeyle ilişkili bölge. |
| Korunan cevap için açık reveal ve bitmiş ilerleme gerekir. | Aynı cue için kilitli, erken reveal, açık bitmiş ve yeniden kilitli durumlar. | Placeholder; doğru cevaba özel vurgu/başlık/ARIA/metaveri sızmaması. Verilmiş çizelge/tablodan sonuç türetilebilir; bu anti-cheat değildir. |
| Uzun anlatım kayıpsız sayfalara ayrılır. | Gerçek sonraki/önceki sayfa bağlantıları ve ilk sayfaya dönüş. | Her sayfanın iki satırı, sayı/birimler, başlık ve kaynak temsili kesilmez. |
| Kaynakta bulunmayan yeni transfer şekli uydurulmaz. | Zaman/paket aktarım cue'suna gidip kaynak sahnesine dönüş. | Yeni şekil yok; temsil bekliyor bildirimi. |
| Sunum okunur; bütün kaynak sayıları erişilebilir. | Desktop ve dar viewport; gerekiyorsa yalnız odaklanabilir iç yatay kaydırma. | Başlangıç, en yoğun tablo, en uzun caption ve sağ/sol sınırlar. |
| Durum URL'i yeniden yükleme ile aynı salt-okunur sahneyi verir. | Yeniden yükleme, geri/ileri, kilide geri dönüş. | Aynı sahne ve kapı; harici ağ/telemetri/sağlayıcı yok. |

Keşif senaryoları: (1) Uzun caption son sayfadan önceki sayfaya ve yeniden yüklemeye dönüş; (2) bitmiş açık cevaptan başka bağlama ve kilitli cevaba geri dönüş, dar viewport'ta sağ/sol uçları inceleme. İnceleme ölçümleri ve sonuçları, gerçekten çalıştırıldıktan sonra aşağıya eklenir.

## Mevcut Sınırlar

Genel legacy geometri/scene resolver bu yeni aileyi hâlâ desteklemez; ayrı kapalı canonical adapter bunu desteklediğinde eski destek kapsamını genişletmiş sayılmaz. Full media preparation cevap içerir ve editör-only kalır. Canlı plan brand'i serialized JSON/hash ile elde edilemez. Caption sayfası değişimi gerçek ses/kelime zamanı değildir. Genel pedagojik, MEB, DAMA, CMMI veya SPICE sertifikası iddiası yoktur.

## Son Donmuş Kodun Gerçek API ve CLI Tanıkları

[Yeni özel scene modülü](../packages/media/grade6_common_relations_scene.mjs), eski generic renderer'ı değiştirmeden canlı canonical source/preparation ve eski branded trace/job denetimleri üzerinden kendi planını kurar. Public plan gelecekteki anlatımı veya full preparation'ı taşımaz. Root doğrudan mevcut üç kaynak snapshot'ını okuyarak gerçek draft → preparation → live plan → current frame zincirini yeniden kurdu:

- İki kapalı CLI kipinin gerçek stdout JSON'u doğrudan canlı API sonucuyla birebir eşleşti; toplam dokuz geçerli kip. Arity/source/path/count/provider/output/reveal/cue seçenekleri genişletilmedi.
- 20 current cue / 47 sayfanın tam izinli metni kayıpsız yeniden birleştirildi. 40 ayrı protected-cue kilit tanığında response/result/highlight ve tam metin/hash null/kapalı kaldı.
- İki serialized clone ret, iki generic geometry desteklenmiyor tanığı; caller source/preparation ve sourceBindingInput mutasyonu 0.
- Açık zaman sonucu literal `[24,48]` dakika, paket boyutu `[1,2,3,4,6,12]` kart/paket; paket sayısı ayrı nicelik. Kaynak taslağın `rendered:false` durumu değiştirilmedi.

| Gerçek Çıktı | Bayt / Kimlik |
| --- | --- |
| Public plan | 3.613 bayt; domain SHA `9ea34deb3996b6ebbe9a9326d3827a2fb3c0a871f67120f21668aaa104c7ad76` |
| Aynı planın sıradan JSON bayt SHA'sı | `a31049605fe6f20400d8534241b3861adcf0231fafa42b6fb9a05e38887a136c` — domain digest ile aynı şey değildir |
| Default current frame/narration bundle | 12.585 bayt; bayt SHA `ef67e6d5ee3476f9f1018a75815413a56e89aa65947f3c50575c2fdb97086566` |
| Default goal SVG | 5.130 bayt; SHA `d58038bd4d34c068db876333c19146709421a57809ace38bae9b10170fa68b7b` |
| Düzeltilmiş açık zaman-result SVG | 6.046 bayt; SHA `40f36374071304afc9321e5af9bf0e1544f257d0b9f2ed61ff7641c0b258aa44` |

## Native Bulgusu, Minimal Düzeltme ve Yeniden Kontrol

İlk gerçek Chrome görüntüsünde result stroke'ları x=408/696, y=48–172 boyunca 24/48 sayı etiketlerinin üzerinden geçiyordu. Systematic-debugging kökü kaynak etiketlerinin y=104/172 baseline'larına bağladı. Writer yeni regresyonu önce **20 PASS / 1 FAIL** olarak gördü; iki ortak dakika × iki dizi işaretini çevreleyen dört küçük kapalı döngüyle minimal düzeltmeden sonra **21/21 PASS**. Metin, kaynak, aritmetik, API, birimler ve reveal kapısı değişmedi. Source mark'ları ile etiket bantları ayrı kaldı; insan el yazısı iddiası yok.

Root son kodla server/browser'ı yeniden başlatıp düzeltilmiş açık sonucu gerçekten gördü: dört işaret kutusu, dört sayı etiketini örtmüyor; pen sayıdan ayrı. Yoğun paket tablosunun altı satırı ve kart/paket–paket sütunları, why vurgusu, transfer'in yeni şekil bekliyor bildirimi, kilitli ve açık durumlar ayrı görüntülendi. Bu font ve viewport örneklerinin kontrolüdür; bütün cihaz veya pedagogik kabul değildir.

## Gerçek Tarayıcı, Etkileşim ve Görsel Sınırlar

Özel salt-okunur QA harness canlı API'den 57 sabit current-page durumu oluşturdu; production tool, endpoint, editör uygulaması veya öğrenci UI'si değildir. Yeni ayrı Chrome profili ve iki sahip loopback process dışında kullanıcı Chrome hesabına veya mevcut 3337/3338 servislerine müdahale edilmedi.

- Desktop 1440×1000: iki bağlamdaki bütün 15 bölüm kontrolü ve mevcut caption-page bağlantıları gerçek mouse tıklamalarıyla 57 kez dolaşıldı; current bağlamlar doğru, caption en çok iki satır. Uzun planın repeat 6 / grouping 7 sayfa olduğu görüldü. Şekil/başlık/sayılar kesilmedi; document 1440/1440, stage 798 piksel.
- 57 gerçek SVG sayfasında **1.151 text glyph kutusu**, gerçek Chrome `getBBox` ile kontrol edildi: canvas dışına taşan 0, tüm text fontları 18 px. Bu yalnız bu font/runtime/sabit corpus için gözlemdir; producer `glyphFitVerified:false` ve erişilebilirlik gate'leri otomatik true yapılmadı.
- Normal klavye Enter ile sayfa bağlantısı, Tab ile named scroll-region ve summary, Enter açma/Space kapama; mouse ve touch summary açma–kapama, yeniden yükleme ve history geri–ileri, açık cevaptan yeniden kilide dönüş kontrol edildi.
- 390×844 ve 320×844 emülasyonda dokunma gezinmesi geçti. Whole-document yatay taşma 0: 390/390 ve 320/320. Kaynak bölgesinde gerçek wheel ile sağ sınır 396/466 piksel ve sola 0 dönüş görüldü. Bu **native touch swipe veya gerçek telefon testi değildir**.
- Önemli mobil UX borcu: 760 px SVG'nin caption'ı da görselle beraber yatay kayıyor. Kaynak sayıları sağ/sol kaydırmayla erişilir, ancak metni rahat okumak için yeni responsive UI'de görsel ve caption ayrı panellerde sunulmalıdır. İlk dar görünümde bütün caption görünmez. Bu nedenle premium/mobil kullanım veya erişilebilirlik signoff'u verilmedi.
- Uzun plan son/ilk sayfa, reload/history ve iki bağlam arasında protected durum dönüşleriyle ayrı keşif yapıldı; ölçülen bölüm 103.125 ms, yaklaşık 103 saniye (30–90 saniye kısa keşif rehberini biraz aştı). Kontrol ve kaynak durumları geri döndü. Harici request, uygulama console/pageerror ve provider çağrısı 0.

Özel JPEG toplamı 18 dosya / 1.518.330 bayt; bunların **13 son-donmuş-kod görüntüsü / 1.016.252 bayt** gerçekten görüldü. Beş eski/yarım koşu resmi final kabul sayılmadı. Ham medya/harness ve özel yollar Git dışıdır.

QA koşu hataları başarı diye sayılmadı: bir JS syntax hatası işlem başlatmadı; var olmayan ikinci why sayfasını beklemek ilk REPL'i timeout/reset etti. Sahipsiz kalan kendi headless Chrome PID'si, beklenen executable/headless/özel Playwright profile doğrulanınca kapatıldı. Bir mobil tap→reload yarışında `ERR_ABORTED` görüldü; aynı akış gerçek navigation commit ve DOM-load beklemesiyle taze tekrarlandı ve aynı state doğrulandı. Son own browser/server temiz kapandı; dört bilinen own PID için ayrı `ps` kontrolü boş/exit1 verdi. Kullanıcı process'leri kapatılmadı.

## Kaynak Metaverisi P2 ve Bağımsız Audit

Auditor, eski [source gap consumer](../packages/content-factory/source_scope_gaps.mjs) boyut sayımının yalnız string değerlerini kapsayıp anahtarları dışarıda bıraktığını buldu. Root iki actual repro'da 2.097.153 bayt ASCII ve 258 bayt UTF-8 anahtarın kabul edildiğini doğruladı. Regresyon **22 PASS / 2 FAIL**; minimal fix anahtarları descriptor üretiminden önce ≤256 UTF-8 baytla sınırladı ve anahtar+değerleri aynı 2 MiB toplamına kattı. Taze ilgili root koşu **66/66 PASS**.

Bağımsız tekrar: 2 MiB exact kabul / +1 ret; 256 bayt ASCII/ğ/emoji pozitif, 258/260 bayt ret, 14 negatif / 4 pozitif ve hook 0. Son metadata-projection ordinal-span alanları yine bağımsız tam kitap taraması veya imzalı onay değildir; bu sınırlı düzeltme onların güven modelini değiştirmedi.

Son scene/CLI audit: üç frozen SHA eşliği, taze **177/177 PASS**, 395 adversarial ret / 3 pozitif / hook 0; 344 frame (72 locked, 44 transfer-pending, 300 own-source geometry), 864 finite/in-bounds highlight noktası, 1.032 current-page AX adı, 200 gerçek sonraki-page ret ve 16 near-one reveal lock. Dar yeni seam'de açık P1/P2 kalmadı; native/öğretmen/rights/audio/production kabulü türetilmedi. [Writer kanıtı](GRADE6_COMMON_RELATIONS_SCENE_EVIDENCE_2026-10-04.md) gerçek TDD ve savunma profili ayrımını korur.

Root son kodla tam suite: **1214/1214 PASS, fail/skip/cancel/todo 0, exit 0; 19.531797916 saniye**. Güvenilir cached Sharp ve opt-in gerçek medya testleri açıldı; yeni ses/video üretilmiş veya canlı sağlayıcı doğrulanmış değildir. Test-önce, sistematik hata inceleme, tarayıcı ve completion verification becerileri bu kanıt sınırlarını yönlendirdi.

## Sonraki Dikey Dilim

Öncelik: actual mevcut anlatımdaki yinelenen result ifadelerini insan üslubuyla düzeltmek; mobile UI'de kaynak görselini current caption'dan ayırmak; yeni dakika/kart-paket caption atomları ve semantic anchor incelemesi. Ardından gerçek ses/cue/kelime–kalem bağlantısı, hak/alan/öğretmen/dinleyici kabulü. Genel legacy resolver/normal rectangle factory'ye bu yeni ailenin katılmış olduğu iddia edilmez. İki narration job tek taslaktır; tekrar render veya 47 caption sayfası yeni soru değildir. 36.000, tam müfredat, genel video seri üretimi ve okul auth/tenant/analitik hâlâ açık.
