# Faz 15 · Ortak ilişki görünümü: Bağımsız tarayıcı kanıtı

Durum: Dar teknik native inceleme yapıldı; öğrenci/uzman/yayın kabulü yok. Bu görünüm yanıt içeren editör artefaktıdır, öğrenci arayüzü veya öğrenci oturumu değildir.

## İnceleme envanteri ve önceden belirlenen ölçütler

- İstenen sayıların anlamı ve neden seçilen ilişkinin uygun olduğu görünür olmalı: İki bağlam, iki gerekçeli yol, üç aktarım kontrolü ve birimler incelenecek.
- Gerçek SVG zaman şeridi: Altı dakikalık daireler ve sekiz dakikalık kareler, toplam 16 işaret; 0 dışarıda, 48 içeride. Sayısal koordinatlar ve metin eşdeğeri ayrıca denetlenecek.
- İki semantik tablo: Zaman tablosunda iki satır; paket boyutu tablosunda altı satır ve üç sütun. Paket boyutu ile paket sayısı karıştırılmayacak.
- Dört kanıt kartı nötr kalmalı. Editör çözümü başlangıçta kapalı olmalı; çözüm açma/kapatma ve yeniden yükleme gerçek fare, dokunma veya klavye ile sınanacak. Kapalı olması erişim kontrolü değildir.
- 1440×1000 masaüstü, 390×844 mobil ve 320×844 dar görünüm: İlk viewport, tüm ana bölgeler, yoğun tablolar ve açık çözüm ayrı görsel incelemeye alınacak. Belge yatay taşmamalı; sabit genişlikli zaman şeridi adlandırılmış, odaklanabilir iç kaydırma alanında kalmalı.
- En az iki keşif senaryosu: Çözümün tekrarlı aç/kapat ve yeniden yükleme döngüsü; dar ekranda zaman şeridinin iki ucuna normal girişle ulaşma ve dikey gezinirken sayı/birimlerin kesilmemesi.
- Native görsel gözlem, DOM ölçümü, ağ/console kayıtları ve işlem sahipliği ayrı kanıtlar olacak. Sonuç tüm erişilebilirlik, gerçek cihaz, pedagojik uzman, etkin program veya yayın kabulü sayılmayacak.

## Test-önce CLI kanıtı

Yeni kapalı `--common-relations-html` kipi için test önce eklendi: 7 testin 6'sı geçti, yeni kip `invalid_grade6_reference_authoring_args` ile beklendiği gibi başarısız oldu. Allowlist ve yalnız mevcut sabit kaynaklarla renderer dalı eklendikten sonra CLI ve view testleri birlikte 20/20 geçti; 26 geçersiz kombinasyon izin kapısını genişletmedi. Girdi dosyası, sağlayıcı, soru adedi veya çıktı yolu seçeneği eklenmedi.

## Native inceleme sonucu

Kurulu Playwright ve Google Chrome ile ayrı headless oturum kullanıldı; kullanıcı profili/sekmesi veya SDK indirmesi yok. 1440×1000, 390×844 ve 320×844 görünümde ilk ekran, sayı şeridi, tablo/kartlar, iki gerekçe ve aktarım/son bölge native rasterla ayrı incelendi. 15 özel JPEG, toplam 1.296.749 bayt; görüntü ve özel arşiv yolu Git dışı. Bunlardan ilk mobil `End` denemesi görüntüsü kabul kanıtı değildir; aşağıdaki gerçek yatay girişle iki uç ayrıca doğrulandı.

Gerçek DOM tanıkları: Tek SVG'de 9 daire/7 kare; merkezler `120 + 12 × dakika`, karelerin sol kenarı merkezden 6 px önce. İki satırda 0 dışarıda, 48 içeride. İki tablo 2 ve 6 veri satırı; paket tablosu `[1,24,36]`, `[2,12,18]`, `[3,8,12]`, `[4,6,9]`, `[6,4,6]`, `[12,2,3]`. Gövde/tablo 18px, SVG sayı etiketleri 18px. Mobil belge genişliği 390/390, dar genişlik 320/320; belge yatay taşması yok. Zaman şeridi mobilde 442px iç kaydırma aralığını korur; tablo metin eşdeğeri bunun dışında erişilebilir.

Gerçek giriş döngüleri: Fare ile aç/kapat, reload sonrası kapalı; Tab ile önce adlandırılmış şerit, sonra summary, Enter ile açık ve Space ile kapalı. Mobil tap aç/kapat/reload döngüsü geçti. İki bağlamda istenen/verilen/neden/işlem/sonuç/birim/koşullu kontrol, üç aktarım ve editör eşlemesi görünür; dört kart seçili/doğru işareti almıyor. Toplam gözlem aralığı 160.254ms; normal keşif etkileşimleri ve görsel okumalar bu aralıkta yapıldı, kesintisiz 160 saniye giriş yapıldığı iddia edilmez.

İlk `ArrowRight`/`End` çağrısından hemen sonra `scrollLeft=2` gözlendi; `End` yatay uca erişim sayılmadı. Sistematik hata incelemesiyle odak/rect/scroll kaydı alındı: Odak şeritteydi, önceki ok hareketi sonraki karede 40px'e yerleşti; native `End` dikey gezinmeye etki etti. Kod değiştirmeden şeridin üzerine gerçek mouse konumu + yatay wheel ile 442px sağ uç, ters wheel ile 0 sol uç doğrulandı; iki stabil raster ayrıca incelendi. Bu sentetik tarayıcı girdisidir, fiziksel telefon/gerçek parmak testi değildir.

Dar ekran kozmetik açık iş: Üç sütunlu tablonun uzun başlıkları ve `kart/paket` sözcüğü 320px'de çok satıra bölünüyor; sayı/birim kaybı veya belge taşması yok, ancak premium öğrenci tasarımı/tipografi kabulü verilmedi. Ayrı polish ve yaş grubu kullanılabilirlik çalışması gerekir. Başlık/cümle başlangıçları büyük harfli; metinler literal DOM'dadır. Tam ekran okuyucu/AX, WCAG sertifikası ve öğrenme etkinliği testi yapılmadı; renderer manifestindeki native/erişilebilirlik kabul bayrakları false kalır.

Tarayıcı request günlüğü beş loopback GET içerir; dış resource isteği, console ve pageerror 0. Test fixture process'i beş GET sayıp exit0 ile kapandı. Sahip olunan üç context, browser/launchServer ve loopback server kapatıldı; exact iki PID için sonraki `ps` çıktısı boş (process bulunmadığı için exit1). Bu kontrolde `&&` sonrası diff kontrolü çalışmadı; `git diff --check` ayrı çağrıda doğrulandı. Kullanıcının eski 3337/3338 yüzeyleri değiştirilmedi.

## Bağımsız audit ve son test kanıtı

Salt-okunur ajan son frozen view/source kod/test/belge hashlerini yeniden eşledi. Dar suite **77/77**, 0 fail/skip, exit0; altı gerçek CLI kipi ve 26 geçersiz kombinasyon geçti. Renderer 277 negatif/3 pozitif probe, hook0; yeniden hashlenmiş yanlış yanıt/birim/amaç/kapsam/kaynak/onay, markup/getter/proxy/revoked/sparse/depth/arity reddedildi. SVG ayrıca sonlu/viewBox içi 16 koordinat, ortak `[24,48]`, altı paket satırı, 12 eşsiz ID ve çözülen IDREF; dış resource/event kanalı yok. Kaynak consumer için 3 pozitif, 30 hostile ret, 12 stale/unbound ve 12 sahte terfi negatif tanığı; hook0. Bu bounded denetimde P1/P2 bulunmadı; genel sistem güvenlik sertifikası değildir.

Son donmuş kodlarla tam suite: **1160/1160 PASS, fail0/skip0/cancel0/todo0, exit0; 18.767699666s**. Gerçek medya opt-in ve güvenilir mevcut Sharp kullanıldı; bu fazın kendi çıktısı ses/video değildir. Önceki 1134'e 13 view + 12 TÜBİTAK metadata + 1 CLI testi eklendi. Source testindeki bir purity snapshot başlangıçta çağrıdan sonra alınıyordu; assertion kanıtı zayıftı. Ajan bunu çağrı öncesine taşıdı, yeniden test etti; bağımsız auditor'un ayrı before-call tanığı da geçti. Eski zayıf assertion geçiş kanıtı sayılmadı.

## Kimlik ve kapsam

View module SHA `3e71276b6be5fdb8e6ea8f5d9720d7604a3e16a1eb163061455eb2b5c6d35f4a`; test SHA `668fa727d392114036723c03b5168e9907072557feddf73ebbde16db3064a9b6`. Doğrudan API HTML'i 19.363 bayt / SHA `7fd1e6607dab233c6244179fc52f98f020a241a60f49b0428316cd4f0f044dac`; CLI stdout son newline ile 19.364 bayt. Manifest 1.945 bayt. HTML/manifest hashleri izin veya kimlik doğrulama değildir.

Root ayrıca mevcut TÜBİTAK soru ve çözüm PDF'lerinin hashlerini yeniden aldı: `ba67a4f067fcc4375822a15896210d9216a9743fa27c569045c45799da9b81a5` ve `c68687627066bf7354d9dc69b7db634ba1607b16d253a086467729b89d013425`. Kaynak ajanının üç native rasterı root tarafından ayrı görüldü: Kapak, soru fiziksel2/basılı1 ve çözüm fiziksel2. Seçili 1/2/4; komşu 3 numara aynı sayfada görünse de envantere eklenmedi. Kaynak soru1 geometrik mümkünlük/sınır, soru2 biçimsel EKOK/ilişki/durum ayrımı, soru4 kısıtlı ızgara sayma içerir. Bunlar öğrenme amaçları için kendi sözcükleriyle aday biçim gözlemidir; cevap anahtarı doğruluğu, yaşa uygunluk veya etkin MEB eşlemesi kabul edilmedi. Ham metin/anahtar/şekil Git'e aktarılmadı.

Tek mevcut özgün taslağın HTML ve SVG görünümü: **0 yeni soru / 0 uzman kabulü / 0 yayın**. Kaynak çiftinden üç gözlem de ürün sorusu değildir. İndirme/Drive/Clef/TTS/video/Docker/ücretli cloud/credential/gerçek çocuk/kurum verisi/Cambridge mesajı/yayın 0. Genel fabrika medya bağlantısı, kalem-ses senkronu, tüm müfredat/kaynak semantiği, hak/uzman/zorluk ve öğrenci auth/tenant/analitik kapıları ayrı açık işlerdir. TDD, PDF okuma, systematic-debugging ve native browser verification becerileri bu dar kanıt yöntemini belirledi; belge/test sayısı pedagojik kalite veya CMMI/SPICE resmî derece değildir.
