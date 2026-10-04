# Sayı Ünitesi Ve Native Defter — Root Kontrol Noktası

Tarih: 4 Ekim 2026. Başlangıç commit'i: `fef7563`. Dal: `codex/k12-foundation-audit`.

## Bu Dilimde Uygulananlar

Kaynak-bağlı ders bileşimi, güvenli defter erişimi ve salt-okunur bağımsız denetim üç paralel kola ayrıldı. Root, yeni akışı gerçek HTML tüketicisine ve kapalı CLI'ye bağladı; genel testleri ve tarayıcı akışlarını ayrıca çalıştırdı. Gemini'nin asıl checkout'u değiştirilmedi.

- Üç kısa kavram: çarpan/bölen/asal ayrımı, iki bölünebilme koşulu, ortak ilişki/istenen birim. Her kavramın koşullu pratik yöntemi ve kaynak görev revizyonu var.
- Mevcut bölünebilme sınıflaması **tek gerekçeli örnek** oldu. Mevcut çarpan kanıtı ile ortak ilişki/birim eşlemesi **iki farklı alıştırma ailesi** oldu. Ortak görevdeki iki bağlam, iki ayrı soru ailesi sayılmadı.
- Aynı görevi tekrar üreterek stok artırılmadı: **0 yeni soru, 1 yeni mini ders türevi, 3 mevcut taslak tekrar kullanımı, 0 kabul/yayın**. Bu sayı bütün projenin stok sayısı değil, bu dilimin sayımıdır.
- Verilen → istenen → neden bu yol → işlemin anlamı → sonuç/birim → koşullu kısa kontrol korunur. Formal EBOB/EKOK algoritması veya en küçük/en büyük ortak değer öğretimi eklenmedi.
- 10 soruluk örnek hedefin iki görevi mevcut, **8 görev eksik**. İki alıştırmanın zorluğu atanmadı: hedef kolay/orta/zor/çok zor kotası **1/3/3/3**, atanmış sayılar **0/0/0/0**. Eksik band toplamı 10; eksik görev sayısı 8 ile aynı ölçü değildir. Bu dağılım kullanıcının örneğidir, ölçülmüş MEB dağılımı veya yaş kalibrasyonu değildir.
- Genel dikdörtgen `mixed_practice_plan` kapsamı gevşetilmedi. Yeni sayı ünitesi ayrı kapalı editör tüketicisidir; normal sayımlı üretim fabrikasına veya öğrenciye sunulan sınava henüz bağlanmadı.

Detaylar: [ders bileşimi / kaynak kanıtı](GRADE6_NUMBER_LESSON_REVIEW_EVIDENCE_2026-10-04.md), [IPv6 teşhisi ve CLI](SYNTHETIC_NOTEBOOK_IPV6_PREVIEW_EVIDENCE_2026-10-04.md).

## Gerçek CLI Ve HTML Tüketicisi

```sh
node tools/grade6_reference_authoring_plan.mjs --number-unit-review
node tools/grade6_reference_authoring_plan.mjs --number-unit-review-html
node tools/synthetic_notebook_desk_preview.mjs --host ::1 --port 0
node tools/synthetic_notebook_desk_preview.mjs --host ::1 --port 0 --scenario reply-loss
```

İlk iki komut yalnız sabit public metadata dosyalarını okur, stdout verir. Kaynak yolu, çıktı dizini, provider, üretim sayısı veya onay seçeneği yok; yeni kiplerin kombinasyonu/tekrarı reddedilir. HTML, tek belge / üç ayrı kaynak-revizyonuna bağlı kapalı çözüm / bir kendi SVG'si / semantik tablolar içerir. Kapalı `details` öğrenci cevap güvenliği veya kimlik doğrulama değildir. Çağıran JSON paketinin hash'i yetki sayılmaz; kendi kanonik kaynaklardan yeniden kurulur.

Gerçek readback: JSON **52.533 bayt**, akış SHA-256 `2acd1bdfe85a84bbd8aa9add4cc77582f1a9874a7539b65e884de270043d2b8b`; mini ders SHA-256 `f7b4c3c4da229bb5e837b26760086fba32250856ad6348162c8c0847e2e1f1ea`.

HTML manifest'i: **30.904 bayt**, SHA-256 `bb96702a8a9b58ec1d405734b849c1afeb881e9d495bc248ac1c807825a7fea4`. CLI tek son satır sonuyla 30.905 bayt verir; SHA-256 `280a8db1af44bedf7604e522e82db99c39d7a34fab5c988d3711b2072e482d5b`. Bu iki hash aynı bayt dizisi diye sunulmaz. Root'un küçük loopback sunucusu CLI'nin gerçek son baytlarını gösterdi; diske HTML üretmedi.

## Kök Neden Ve Native Defter Kabulü

Önceki native engelin gerçek sebebi: IPv4 GET'inde tarayıcının gönderdiği `Cookie` header adı kapalı header kapısını tetikledi; sunucu 400 `closed_request_headers_required` verdi. Cookie değerleri okunmadı/loglanmadı; kişisel çerezler temizlenmedi. HEAD/OPTIONS preflight sebep değildi.

Mevcut server zaten `127.0.0.1` ve `::1` exact loopback'i kabul ediyordu. CLI yalnız bu iki literal host'u açığa çıkardı; varsayılan IPv4 kaldı. Aynı güvenlik kurallarıyla IPv6 bootstrap GET'leri 200 oldu, gözlenen isteklerde Cookie header adı yoktu. Host/Origin/header/CSP/auth sınırı değişmedi; `localhost`, wildcard, DNS, mapped IPv6 ve URL alias'ları reddedilir. Bunun ileride IPv6'da Cookie bulunmayacağına dair garantisi yoktur.

İlk instrument süreç erken kapatıldığı için bir native read denemesi `read_unknown` oldu; save kapalı kaldı. Bu girişim başarı sayılmadı. Ayrı taze instrument'te bootstrap GET4, açık read ve save POST2'nin altısı200; read0 → iki yer imi → makbuz1 ile eski read0 stale kaldı. Instrument sonraki readback'i görmedi; root onu ayrı final CLI'de tamamladı.

Root'un **dondurulmuş gerçek CLI → native IAB** normal denemesi:

1. Başlangıçta okuma yok, save disabled. Açık read sürüm0'ı aldı.
2. Sentetik metin ve iki yer imi yalnız taslağa girdi. Açık save makbuz1 verdi; read0 güncel değil, save disabled.
3. Taslak metin değiştirildi. Açık read1 iki kayıtlı yer imini getirdi; yeni yerel metni ezmedi.
4. Yalnız soru işareti kaldırıldı; save2 → açık read2'de yalnız konu yer imi kaldı.
5. Taslağı temizleme okunan kaydı değiştirmedi. Açık “Okunan kaydı taslağa al” konu yer imini geri koydu. Reload taslağı sildi, okuma yok/save disabled durumuna döndü. Son açık read2 kayıtlı içeriği tekrar aldı.

Ayrı **reply-loss** native denemesinde ilk save gerçekten kayıt sonrası yanıtını kaybetti. UI “sonuç belirsiz”, eski read0 stale, save disabled oldu; otomatik tekrar yapılmadı. Tek açık read sürüm1'de iki yer imini buldu, taslağı korudu ve save'i tekrar açtı. İki önizleme **process-memory test double**'dır; bu turda gerçek SQL, auth, tenant veya kalıcı öğrenci hesabı kabulü yapılmadı. İki sabit yer imi yeni dersin yayımlanmış hedeflerine bağlanmış değildir.

## Native Editör, Tipografi Ve Görüntü Sınırı

Gerçek DOM'da konu → örnek → alıştırma sırası, iki farklı family, 8 görev açığı / dört band açığı / iki atanmadı etiketi görüldü. Üç çözüm başlangıçta kapalıydı: örnek ve alıştırma1 ayrı açıldı; Space yalnız örneği kapattı, alıştırma1 açık kaldı; reload üçünü kapattı. Nesne placeholder'ı 0.

Masaüstünde gerçek `innerWidth=scrollWidth=1280`. CUA'nın desteklenen CDP emülasyonuyla sayı ünitesi ve defterde **gerçek 390 ve 320 px DOM** ölçümleri alındı; sayfa yatay taşmadı. Sayı ünitesi gövde yazısı18px. Zaman şeridi588px/etiket18px olarak korunur, dar kapsayıcı içinde yatay kayar; klavyeden sağ ok ile `scrollLeft=40` görüldü. Şekil/satır etiketi ve18px metin tablosu renk veya SVG ölçeğine bağımlılığı azaltır. Browser hata logları normal defter ve editörde boştu; kasıtlı yanıt kaybı hata senaryosu bu iddiaya eklenmedi.

Masaüstü JPEG yerel `outputs/number-unit-root-review/editor-desktop.jpg` altında saklandı; Git'e alınmaz. Dar JPEG yakalayıcısının yüzey/ölçek kırpması DOM ölçümüyle aynı değildir; dar rasterı doğru mobil görsel kabulü saymıyorum. Emülasyon override'ları temizlendi. **Fiziksel telefon/tablet, yaş grubu kullanılabilirliği, ekran okuyucu veya WCAG uygunluğu doğrulanmadı.** Manifest'in `nativeVisualReviewPassed` / `accessibilityPassed` alanları otomatik true yapılmadı.

Geçici iki teslim adresi root test anında çalışıyordu: sayı ünitesi `http://[::1]:51954/`, sentetik defter `http://[::1]:51118/`. Kendi instrument ve yanıt-kaybı süreçleri deney sonunda kapatılır; teslim önizlemeleri açık bırakılır. Kalıcı production adresi değildir.

## TDD, Bağımsız Denetim Ve Root Regresyonu

- Core: önce11 expected assertion RED, sonra11/11 GREEN; kaynak/generic regresyonla76/76.
- Host CLI: önce8 PASS/4 FAIL, sonra12/12 GREEN; mevcut HTTP/desk ile48/48.
- Root consumer/CLI: ilk8 testte1 PASS/7 expected FAIL. İlk uygulamada olmayan sabit factor/common `title` alanları kapalı HTML sink'inde reddedildi; mevcut editörlerin literal başlıklarıyla düzeltildi,8/8 GREEN.
- Dar şeridin rakamlarını küçültme sorununa önce ek test:5 PASS/1 FAIL. Kaydırılabilir, klavye-erişilebilir588px şerit ve ikinci satırda farklı kare şekli eklendi; son consumer/CLI **9/9 PASS**, exit0, `1274.279416 ms`.
- Bağımsız frozen denetim **74/74 PASS**, exit0, `2586.976708 ms`. Ayrı literal matematik/HTML witness:8kartın üyeliği;36'nın5çifti, tek Pano3, asal2/3 ve toplam5; ortak24/48dakika, boyut1/2/3/4/6/12 ve birimler;11tekilID/3kapalıçözüm/1SVG.33kaynak/paket,14hostile ve10IPv6alias ret; hook0. Doğru orijinal digest ile eşlenen9 yeniden-hashlenmiş sahte yetki/sayım/anahtar paketi ayrıca reddedildi. Bu tarama bütün kaynak arşivinin intihal veya pedagojik kabulü değildir.

Root son taze genel komut:

```sh
node --test --test-reporter=spec test/*.test.mjs | tail -n 14
```

**1.390 test / 1.388 PASS / 0 FAIL / 2 SKIP**, cancel/todo0, exit0, `32196.869291 ms`. Önceki32.261s koşusu arada test/değişiklik yapıldığı için final kabul koşusu değildir. İki SKIP mevcut opt-in gerçek FFmpeg/PCM medya testidir; yeni konuşma veya MP4 çalıştırılmış sayılmaz. Syntax ve `git diff --check` ayrıca denetlenir. Bu teknik süreç iş ürünleridir; CMMI/SPICE sertifikası veya ürün kabulü değildir.

## DAMA Ve Sonraki Faz

Kaynak revizyonu → önerilen çıktı/mikroamaç → özgün görev → ders/örnek/alıştırma türevi soy-ağacı korunur. Owner/steward/saklama ve etkin program/yıl kararları pending; defter yer imleri çözme olayı, akademik başarı veya psikometrik bulguya dönüştürülmedi.

API çağrı bütçesi0; bu dilimde provider/Clef/TTS, indirme, Drive aktarımı, yeni Docker/SQL, credential, ücretli servis, gerçek çocuk/kurum verisi veya yayın yok. MEB kaynak güveni karar kaydı korunur; yeni üretimin dönüşüm kontrolleri uygulanır.

Sonraki faz: yeni mini dersin gerçek gerekçeli medya/normal fabrika adaptörü; eksik farklı görev aileleri ve gerçek zorluk kanıtı; ardından kaynak/öğrenci-revizyon bağıyla izinli teslim. Yeni görev biçimini yalnız metin/sayı değiştirerek stok artırma yok. Mevcut Google imkanları öncelikli / yeni masraf yok kararına uyulur; yeni ses, senkronize video ve36.000 kabul edilmiş soru henüz tamamlanmadı.
