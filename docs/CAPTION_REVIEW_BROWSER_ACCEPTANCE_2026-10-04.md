# Gerekçeli altyazı gezinmesi: Tarayıcı doğrulama kaydı

## Kapsam ve önceden belirlenen QA envanteri

Bu faz tek bir yerel **editör** oturumudur. Öğrenci kimlik doğrulaması, sınıf yetkisi, çok kullanıcılı oturum, yeni ses/video, pedagog kabul veya yayın değildir. İlk sayfa ve yalnız mevcut adımın metni sunulmalıdır; istemci gelecekteki canlı planı yetki olarak kullanamaz.

| İddia / kontrol | İşlevsel kontrol | Görsel kontrol / kanıt |
|---|---|---|
| İlk metin anlaşılır ve büyük harfle başlar | İlk API adımı ve DOM satırlarının eşitliği | Masaüstü ilk viewport, 18 CSS px altyazı |
| Önceki / sonraki metin sayfası | Sınırdaki kapalı düğmeler; varsa ilerle/geri dön döngüsü | En uzun erişilebilir sayfada kırpılma / yatay taşma |
| Önceki / sonraki anlatım adımı | Gerçek düğmelerle ilk–ileri–geri; sayfa/reveal sıfırlanır | Adım sayacı ve metin birlikte değişir |
| Korunan cevap yalnız açık gösterme isteğiyle | Sonuç/check/özet adımında ileri engeli; açık göster ve devam et | Kilitli ve açılmış durum; anlam/birim açıklaması |
| SVG isteğe bağlı, kapalı ikincil içerik | Details aç/kapat; yalnız mevcut çerçeve | Kaynak geometrisi değiştirilmeden inceleme; duplicate AX kabulü yok |
| Seslendirme paketi yeni ses değildir | Varsa ayrı paket aç/kapat; medya yok | Editör/taslak etiketleri ve uyarılar |
| Responsive metin / kontrol | 390 × 844 dokunmatik viewport | 18 CSS px metin, görünür kontroller, yatay taşma yok |
| Hatalar durumu bozmamalı | Geçersiz action / yabancı origin negatif HTTP testi | UI hata durumu varsa açık etiket; yanlış başarı yok |

Ek keşif senaryoları: hızlı ileri/geri düğmeleri; iki tarayıcı sayfasında paylaşılan tek editör oturumu. Paylaşılan oturum çok kullanıcı desteği sayılmaz. Kapsam dışında: doğal çocuk kullanımı, tüm Türkçe glifler / ekran okuyucu matrisi, öğrenme başarısı, ses-kalem zaman eşlemesi, üretim güvenliği.

## Durum

Ön kontrol: Mevcut Playwright paketi ve yüklü Chrome kullanıldı; yeni bağımlılık / tarayıcı indirilmedi. REPL ESM girişindeki default-export hatası bağımsız Node ESM kontrolünde tekrarlanmadı; mevcut CommonJS girişinde izole tarayıcı başlatılabildi. Kullanıcının oturum açmış Chrome profili veya açık sekmeleri kullanılmadı.

## Kök ajanın gerçek tarayıcı tanıkları

Final server SHA-256 `4108b33dcd4630636191686821a0473abefe324b545c0cc1bed9e49a21d8f29c`, client `06773fb2e90b35d2d5f365e542bc6fcbee9cbf1989511042d4652def1b4a1ec1`; mevcut controller ve renderer değiştirilmedi. Kök CLI'si yalnız kendi loopback önizlemesini ephemeral portla başlattı; kullanıcıdaki eski3338 sayfası değiştirilmedi. Düzeltmelerden sonra sahip olunan sunucu yeniden başlatılarak diskten final varlıklar alındı.

- Masaüstü **1440 × 1000**: İlk görünüm, beş düğme, iki details, verilenler sayfaları, kilitli/açık sonuç, son aktarım cevabı ve footer incelendi. Sayfa ileri/geri ve gerekçe ileri/geri gerçek tıklamalarla; klavyeyle Enter; protected açma açık düğmeyle çalıştı. Geri dönüş sayfa0'a ve kilitli sonuca döner.
- Son ayrı takip kaydı bütün **30 adımı** kapsar: **88 snapshot (1 başlangıç +87 kontrol sonrası)**. Trace SHA-256 `22d166968cde065e98b1868a823083f845543b78b30fd9550e2e8a116d3392aa`. Her post-action DOM satırı actual current API satırlarıyla birebir karşılaştırıldı; doğrudan state/skip staging yapılmadı. Son adımda next cue kapalıydı. İlk yardımcı log'u yeniden atanınca eski closure eski diziye yazmıştı ve yanlış3 sayacı verdi; bu ölçüm kullanılmadı. Takip aynı hücrede yeni helper/diziyle yeniden yapılıp gerçek30 indeks doğrulandı; ürün kodu değiştirilmedi.
- **Gerçek POST commit + kayıp yanıt + başarısız recovery GET**: Native browser route, gerçek sunucu POST'unu önce tamamladı, sonra yanıtı düşürdü; current GET de düşürüldü. Sunucu verilenler page0→page1 ilerledi; UI eski page0 metnini stale uyarıyla tuttu, **beş düğme de kapandı**, mutation count1. Hiç otomatik POST tekrar yok. Route'lar kaldırılıp sayfa yeniden yüklendiğinde fresh GET page1'i getirdi ve uygun düğmeleri açtı. Bu ayrı DOM-double auditinden bağımsız gerçek browser tanığıdır.
- Mobil emülasyon **390 × 844**, dokunmatik tap ile ileri/geri sayfa döngüsü: caption ve ayrı tam anlatım **18 CSS px**. Doküman genişliği390/viewport390; desktop1440/1440. Beş düğmenin sınırları31–340.47px, yükseklik46.80px; başlangıçtaki birincil kontroller görünür. Uzun tam anlatım/footer açılıp kaydırılarak incelendi; yatay taşma gözlenmedi. Bu gerçek telefon testi veya tüm cihaz/font matrisi değildir.
- İkincil SVG details aç/kapat: Gerçek image load1280 ×858, display width1280; geometri rescale/crop yapılmadı. Scroll alanı native görseli tutar. Tam mobil kaynak görselinin viewport'a sığdığı, duplicate AX veya bu tasarımın learner-ready olduğu iddia edilmez.
- Ayrı tam anlatım details aç/kapat, kilitli anlatım null ve açılmış anlam/birim metni doğrulandı; `audio,video` element sayısı0. Yeni ses/video yoktur.
- Ayrı **32.282ms** keşif: Klavye, details aç/kapat ve kaydırma, hızlı çift tıklama, ikinci pencere fresh reload. 1.128 kontrol/scroll/klavye eylemi, uncaught page error0; çift tıklama yalnız page1'e geçti. Aynı sunucuya yeniden yüklenen ikinci pencere ortak güncel page1'i okur; zaten açık eski ekranlar canlı push ile eşzamanlanmaz. Bu concurrency/load testi değildir.

Dar görsel kontrolde birincil metinde kırpılma, yatay taşma, kapatılmış düğmenin üzerinde etkinlik veya kontrol/metin sayaç uyumsuzluğu gözlenmedi. Yerleşim sade bir editör kontrolüdür; premium öğrenci arayüzü, marka/özgün ikon seti veya çocuk kullanılabilirliği kabulü değildir. Kaynak SVG'nin bol boşluğu/native boyutu, canonical kilit placeholder'ındaki eski `reveal` sözcüğü, belirsiz durumda görünür reload yönlendirmesi ve ekran okuyucu/kontrast kapsamı sonraki inceleme işleridir. Cümle devamı olan sayfaların küçük harfle başlaması yeni cümle/başlık değildir; kayıpsız canonical metin korunur.

## Özel görsel kanıtların özeti

Dokuz JPEG toplam **696.491byte**, yalnız özel QA çıktı alanında; Git'e görseller veya özel absolute path konmadı. Aşağıdaki ad/hash kaydı byte kimliğidir, görsel/uzman kabulü değil.

| Yerel kanıt adı | SHA-256 |
|---|---|
| desktop-initial.jpg | eafd52169ed9c975e9ecd94a047be5eb3deaa6d94015bc2e3eb9216efa7cf4a8 |
| desktop-evidence-last.jpg | 5f77481bcc2cb33f015f4cf867dd31faa3c9fea6b69cba38f385953a7a2ffaad |
| desktop-result-locked.jpg | 2b74722fc69745529220c2f6c5b849f4aab6c7a4cd6f1700b8445f2c06d7cb36 |
| desktop-result-revealed.jpg | 0ae3ea563f5f7c10de48e1b358905c8938575fcfe9b4d45f27463348101a944b |
| desktop-unknown-locked.jpg | 7ce65f69d2d8b9718653c50768c409b0ab52bede59f605a169fc723f50f254a3 |
| desktop-source-open.jpg | 8be85ce5acb44e4320ebda8074718bdde3def5e946059bfb80eecc7315c437d8 |
| desktop-final.jpg | 3d4cb180f9e718008bd09b6cf7da6f6b2067abc0daf4e4e4852d506c1d72081a |
| mobile-initial.jpg | 24487a1082e83c67853d20f6324265a29c865e5260bee03e878dc3384649ebc5 |
| mobile-narration-footer.jpg | 228492713b925c165984a6b4c4eaec7672061600516149374302fd6aa3b38f00 |

Taze tam suite: **940/940**, fail0/skip0,17.818s; trusted Sharp + real-media opt-in. HTTP/client16 ve controller19/code kaynakları dahil; actual browser/SQL ad-hoc tanıkları bu940'a eklenmez. Ayrı salt-okunur agent106/106 scoped regresyon ve gerçek HTTP+actual client+DOM-double P2 recovery tanığı geçti. No remaining P1/P2 yalnız incelenen dar seam için raporlandı; genel güvenlik sertifikası değildir.

Kendi geçici server'ı ve iki izolasyon context'i/browser'ı kapatıldı; kullanıcının Chrome profiline, açık sekmelerine veya diğer server'lara dokunulmadı. Kaynak indirme/Drive/paid call/credential/gerçek çocuk verisi/yayın yok. Uygulanmış kontrol, teknik test, tarayıcı görünümü ve pedagojik/yayın kabulü ayrı durumlardır.
