# Sesli kalem çözümü ve ayrı mini ders — kontrollü pilot

Tarih: 2026-10-03. Durum: **yerel, yarı otomatik teknik pilot**. Bir özgün soru, ayrı bir kavram anlatımı, iki ders görseli, gerçek Türkçe ses, hareketli kalem çözümü ve denetim hazırlığı var. **Uzman onayı, kanonik müfredat kabulü, ticari dağıtım onayı, öğrenci yayını ve tam otomatik TTS fabrikası yok.** 100 veya 36.000 sorunun tamamlandığı ileri sürülmez.

## Gerçek çıktılar

| Varlık | Bu koşuda doğrulanan | Açık kalan |
| --- | --- | --- |
| Bahçe sorusu | 18 m kısa kenar, uzun/kısa oranı 3/2, 4 m açıklık ve iki tel sırası; bağımsız dört-kenar/iki-açıklık hesabı **172 m** | Dil/yaş/zorluk/özgünlük ve alan öğretmeni incelemesi |
| Çeldiriciler | 176: kapıyı toplamdan yalnız bir kez çıkarma; 180: kapıyı unutma; 86: tek sıra hesaplama | Bunlar yazarın strateji hipotezleri, öğrenci teşhisi veya psikometrik ölçüm değil |
| Ayrı mini ders | 6×4 model: çevre 20 cm, alan 24 cm²; 8×3 karşılaştırma: alan 24 cm², çevre 22 cm; iki etkinlik/iki kontrol sorusu/öğretmen ipucu | Tam kazanım kapsamı, uzman ve erişilebilirlik kabulü |
| Çözüm sesi | Altı gerçek tarayıcı üretimi; toplam konuşma 31,28 s; seçicide ve kod önizlemesinde Charon yapılandırması | Gerçek konuşmanın metin/sayı/birim ve ses kimliğinin bağımsız doğrulaması |
| Mini ders sesi | Yedinci gerçek tarayıcı üretimi; 47,76 s; Sulafat yapılandırması | Dinleyici kabulü; kalıcı persona/ders ataması |
| Kalem videosu | Gerçek MP4: **36,375 s**, 1280×720, 24 fps, 873 kare, H.264 + mono 24 kHz AAC, **885.717 bayt**; tam video/ses decode çıkış kodu 0 | Kelime düzeyinde hizalama, öğretmen dinlemesi ve cihaz kalite kabulü |
| Clef görseli | 1280×720 gerçek PNG, kanonik özgün SVG ile bağlı; ilk karede cevap açılmıyor | Canlı değerlendirme yapılandırma bekliyor |

Soru–çözüm–ses metni–kalem planı tek kaynak plana bağlıdır. Kalemin veriyi işaretlemesi, işlemi yazması, sonucu çevrelemesi ve sonucun anlamını göstermesi seçili 14 s / 31 s karelerde ayrıca görüldü. Tam çözüm süreci hareketlidir; slaytların arka arkaya koyulması, sessiz video veya test tonu değildir. Sesin gerçek kelimelerinin doğru söylendiği, tüm anların dinlenerek onaylandığı veya ±150 ms hizalama sağlandığı **iddia edilmez**.

Mini ders ayrı içeriktir: bahçe sorusunun çözümünü “konu anlatımı” diye yeniden etiketlemeyiz. Şimdilik ders metni/görselleri ve ayrı ses vardır; animasyonlu mini ders videosu yoktur.

## Gerçek üretim sınırı ve ses kaynağı

Yetişkin editör akışında Google AI Studio konuşma sayfası kullanıldı. Bu pilotta **yedi Run işlemi**: Charon için altı sabit cue, Sulafat için ayrı 86 kelimelik ders. Yeni API anahtarı, SDK, faturalama, ücretli plan, Flow video işi veya öğrenci verisi aktarımı yapılmadı. Ücretsiz seviye arayüzü görülmesi gerçek fatura muhasebesi veya sınırsız üretim hakkı değildir.

İstenen model yapılandırması `gemini-3.8-flash-tts`; seçici/kod önizleme kanıtı özel yerel klasörde tutuldu. Bunlar sağlayıcı/ses **istek yapılandırmasıdır**, çıktıdan kriptografik ses kimliği doğrulaması değildir. Charon → Barış ve Sulafat → Selin önceki **aday isimlerdir**; kalıcı ders ataması veya kullanıcı tarafından bu yeni pilotun kabulü değildir.

Stil yönergesi: açık Türkçe, sıcak/saygılı yetişkin matematik öğretmeni; ölçülü vurgu ve duraklama; reklam tonu/aşırı heyecan yok; sayılar, birimler ve gerekçe net; sabit metne ekleme/değişiklik yok. Stil ayrı alanda, konuşma metni ayrı alandadır. Stil SHA-256: `b9e6479cd1045329b0a274a6e2fcdabdd61231032aec1bb145927874de4ac6da`.

Soru/mini ders bu koşuda **özgün deterministik yazarlık** ürünüdür. Canlı üretici LLM kullanılmadı. Clef bir serbest metin/soru/video/ses üreticisi olarak bağlanmadı; [resmî Workers AI belgesine](https://developers.cloudflare.com/workers-ai/models/clef-flash/) uygun metin+görsel danışma katmanı ayrı tutuldu.

## WAV başlığı: konuşmayı değiştirmeden onarım

Gerçek WAV'larda mono / 24 kHz / 16-bit PCM ve blockAlign 2 vardı; byteRate 96.000 bildiriliyordu. Bu formatta doğru değer 48.000'dir. Özgün dosyalar korundu. FFmpeg `-c:a copy` ile türev başlık üretildi; hız/gain/örnekleme filtresi uygulanmadı. Altı çözüm cue'su için kaynak ve türev **PCM payload SHA-256 eşitliği** ve kaynak dosyaların değişmediği doğrulandı.

Mini ders için de PCM değişmedi: 2.292.480 PCM baytı, 47,76 s; PCM SHA-256 `3908334beec5ba30664fdd85aa598fbee27b9bb532539879ffce416b79922fbd`. Türev WAV SHA-256 `f9cc17042494d78cab031b3cb45679d014a81e6192efd9d3f300ad2edad0ab8c`. Başlık onarımı insan benzeri kalite veya doğru telaffuz kabulü değildir.

## Müfredat adayları: program ve yıl sürümünü koru

Kullanılan referans, daha önce indirilen [2026 ortaokul matematik programı](https://tymm.meb.gov.tr/assets/pdf/ortaokul-matematik-dersi_20260902_111111_630.pdf): SHA-256 `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`. Referans statüsü `reference_only / reuseRights:unverified`; program/soru metni kopyalanıp model veya ürün girdisi yapılmadı.

- Bahçe sorusundaki `3/2` kesir işlemi nedeniyle **6. sınıf MAT.6.1.7** adaydır; PDF 74, uygulama 77–78. Dikdörtgen çevresi için **5. sınıf MAT.5.4.4** ön öğrenmesi; doğal sayılı işlem/öncelik için MAT.5.1.2 / MAT.5.2.2 adayları ayrıca tutulur. Bu soruyu yalnız “6. sınıf geometri” diye etiketlemeyiz.
- Ayrı ders: **5. sınıf MAT.5.4.2 / MAT.5.4.3**, PDF 51/53. İkinci çıktının eşit alan–farklı çevre kolu ele alınır; eşit çevre–farklı alan kolunun tamamlandığı söylenmez. Karşılaştırma modelleri 24 birim kare; programdaki 36 birim kare sınırı içinde.
- Bütün eşlemeler **kısmi kapsam / expert_pending**; MEB onayı veya tam kazanım kabulü değil. [Resmî 2026–2027 uygulama duyurusu](https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316) ve [taslak plan kataloğu](https://tymm.meb.gov.tr/taslak-cerceve-planlari/temel-egitim) ile yıl/sınıf ayrımı korunur.

## Clef: güvenli hazırlık var, canlı başarı yok

`tools/clef_teaching_pilot.mjs` iki aşamalıdır. Prepare ağ kullanmadan özgün SVG'yi PNG'ye dönüştürür, kaynak/PNG hashlerini kaydeder. Yerel asistan görsel incelemesi **alan uzmanı onayı değildir**. Evaluate kanonik SVG'den PNG'yi tekrar üretir; hem tam bayt hem hash eşitliği olmadan dosyayı dışarı göndermez. Değiştirilebilir manifest tek başına kaynak kanıtı sayılmaz.

Bu oturumda çalıştırılan evaluate, yerel `.env.local` token alanı boş olduğundan **`model_not_configured`**, dış ağ isteği **0**, Clef kullanım/fatura ölçümü **yok** sonucunda durdu. Hesap alanının dolu veya token dosyasının mevcut olması başarılı kimlik doğrulaması değildir. Eski sohbete yapıştırılmış anahtar kullanılmadı. Yeni Workers AI tokenı kullanıcı tarafından yerel dosyaya eklenecek; değeri sohbete/Git'e veya kanıta alınmaz.

Son CLI en fazla bir fetch, sıfır retry, kapalı HTTP redirect ve 30 s sağlayıcı zaman aşımı kullanır. Açık maliyet parametresi 0,01 USD'dir; 65.536 × 0,09 USD/milyon = **0,00589824 USD plan tahmini**. Bu bir sağlayıcı faturalama limiti veya gerçekleşmiş maliyet değildir. Fiyat tarihi 2026-10-03; farklı tarih/model/kapsamda tekrar kontrol gerekir.

Olası başarı yalnız `advisory_only`, `not_calibrated`, `publishReady:false`; model kendi içeriğini yayınlayamaz. Kontrollü test taşıması gerçek servis başarısı değildir.

## Bağımsız incelemede bulunan ve testle kapatılan iki boşluk

1. **PNG yeniden hash'leme:** geçerli ancak ilgisiz 1280×720 görsel ve yeniden yazılmış manifest eski evaluate yoluna girebiliyordu. RED test bunu gösterdi; kanonik yeniden render + exact-byte karşılaştırması eklendi. Artık `canonical_raster_mismatch`, sıfır çağrı, çıktı yok.
2. **Ses/stil ata symlink'leri:** son dosya symlink kontrolü yetmiyordu; üst klasör bağlantısı üzerinden veri okuma/yazma mümkündü. RED testler ardından raw `.`/`..` ve mevcut tüm ata dizinleri denetlenir. Stil dosyası reddedilmeden okunmaz, çıktıda var olan dosya üzerine yazılmaz. Bu kontroller bütün makine/bağımlılıklar için güvenlik sertifikası değildir.

## DAMA kayıtları ve kalite kapıları

Soru, mini ders, kaynak plan, altı konuşma metni, stil, WAV kaynak/türev, ölçülmüş plan, VTT ve MP4 ayrı hash/sürüm kaydıdır. Owner/steward gerçek kişi ataması, ticari hak, saklama kararı ve uzman kabulü **bekliyor**. Kaynak/model/voice belirsizliği “doğrulandı” durumuna yükseltilmez. Sadece özgün kişisel verisiz metinler hizmete gönderildi; öğrenci, veli veya okul kaydı kullanılmadı.

Hash zinciri bu koşuda bağımsız tekrar hesaplandı:

| Bağ | SHA-256 |
| --- | --- |
| Soru içerik | `a5dde54c513fcca9ae4fbcf39917ccb37a761e3fca688ba3f2a1b3cc39cc77d4` |
| Mini ders içerik | `ce0cfca9ecdbb6c3f0b810d89033923d43d48a9191a1cc84ddccc756ae37ae3f` |
| Kanonik kaynak kalem planı | `309a08895704329e9db15782fe1fdf56a449421c21019bfaaa02c8344fdc6e6b` |
| Ses süreleriyle oluşturulan render planı | `c45aad04b6e48fdf5d87340a9599d618fe1ae879e5cb3dc9161ad8da2fd22e79` |
| Gerçek MP4 | `8f42e3b6988ee1263bf1c2ddc099f31b50c7235f5903efbf7327fc95d484dc07` |
| Clef için ilk PNG | `2d8ca9614ea38c51dd0e42084e213d34087a22fa71b35f1b2a34f5968e0d6e5a` |

Başlangıç sekiz dosyalı `bundle` değiştirilmeyen bir metin/görsel anlık kaydıdır; oradaki `audio:not_attached` ilk oluşturma anına aittir. Son ses/video kanıtı ayrı audio/render receipt ve bu rapordur. Yeni yerel `index.html` iki önizlemeyi bir araya getirir. Yanıt anahtarlı editör paketleri öğrenci istemcisine servis edilmez.

Ham tarayıcı ekranları, sesler, yerel mutlak yol içeren manifestler ve MP4 **kamu GitHub deposuna eklenmedi**. Yerel pilot klasörü ~12 MiB; özel dosyalar 600, dizinler 700. Drive/cloud kopyası, yeni Docker işi veya büyük model/Flutter indirmesi bu koşuda yapılmadı. Yeni dış skill kurulmadı.

TDD, bağımsız kaynak incelemesi ve tamamlamadan önce gerçek çıktı doğrulaması kullanıldı. Faz kaydı CMMI/SPICE süreç hazırlığına kanıt sağlar; **CMMI seviye 3 veya SPICE seviye 2 sertifikası/değerlendirmesi değildir**.

## Bu oturumun taze test kanıtı

```sh
env K12_INK_REAL_MEDIA_TEST=1 K12_INK_SHARP_PACKAGE=ABS_TRUSTED_SHARP_PACKAGE npm test
```

Gerçek mevcut Sharp/FFmpeg/FFprobe ile **507 test / 507 PASS / 0 FAIL / 0 SKIP**, yaklaşık 17,61 s. Kontrollü sağlayıcı testleri gerçek servis sonucu sayılmaz. Ek 20/20 ses hazırlama testi gerçek FFmpeg/CLI opt-in'iyle geçti. Clef için native runtime sağlanan koşuda 12/12; runtime yokken 5 PASS / 7 SKIP açıkça raporlanır, SKIP raster kanıtı sayılmaz. Testler dış ağı veya credential dosyasını kullanmaz.

Soru/mini ders kanonik kayıtları, sekiz dosyalı bundle manifesti, altı gerçek ses hash'i, kaynak-plan bağı ve gerçek video receipt hash'i bağımsız tekrar hesaplandı: hepsi eşleşti. MP4 ve mini ders WAV'ın tam FFmpeg decode kontrolleri çıkış kodu 0. Bu gerçek medya ayrı kanıttır; test fixture'ları gerçek Türkçe öğretmen sesi olarak sunulmaz.

Yerel inceleme sayfası yalnız loopback adreste, sabit altı varlık izin listesiyle açıldı. Tarayıcı iki medyayı hatasız yükledi: video 36,375 s, ses 47,76 s, `readyState:4`, `error:null`. Video oynatma sonunda `currentTime:36.375`, `ended:true` görüldü; mini ders oynatıcısının zamanının ilerlediği görüldü. Bunlar oynatma/decode kanıtıdır, konuşmayı dinleyerek öğretmen kalitesini onaylama değildir. Oynatma ve ses seçimi ekranları yalnız özel yerel klasörde; kamu deposunda değiller.

Değişen 14 metin dosyasında bilinen token/özel anahtar biçimleri için yerel tarama bulgusu 0; `.env.local` Git dışında. Bu sınırlı tarama, kapsamlı secret/security sertifikası veya geçmiş Git geçmişinin yeniden denetimi değildir. Altı değişen uygulama/CLI modülünde `node --check` ve `git diff --check` başarılı.

## Yeniden çalıştırma ve sonraki kabul

Güvenilir mevcut Sharp/FFmpeg/FFprobe yollarını açıkça belirt; yeni SDK veya ağırlık gerekmez. `ABS_*` yer tutucuları mevcut gerçek mutlak yollarla değiştirilir. Her çıktı dizini yeni olmalıdır.

```sh
node tools/build_teaching_bundle.mjs --out ABS_FRESH_BUNDLE
node tools/prepare_ink_audio.mjs --source-dir ABS_SIX_ORIGINAL_WAVS --out ABS_FRESH_AUDIO --style-file ABS_STYLE_TXT
node tools/render_ink_video.mjs --out ABS_FRESH_RENDER --audio-manifest ABS_AUDIO_MANIFEST --sharp-package ABS_TRUSTED_SHARP_PACKAGE --ffmpeg ABS_TRUSTED_FFMPEG --ffprobe ABS_TRUSTED_FFPROBE
node tools/clef_teaching_pilot.mjs --prepare --out ABS_FRESH_PREPARED --sharp-package ABS_TRUSTED_SHARP_PACKAGE
```

PNG'yi kontrol et ve yerel görsel inceleme kaydını oluştur. Yeni token yalnız Git dışındaki korumalı `.env.local` dosyasına konduktan sonra:

```sh
node --env-file=.env.local tools/clef_teaching_pilot.mjs --evaluate --prepared ABS_PREPARED --out ABS_FRESH_CLEF_REPORT --review-record-id LOCAL_VISUAL_REVIEW_ID --max-estimated-usd 0.01 --sharp-package ABS_TRUSTED_SHARP_PACKAGE
```

Sonraki kapı: bu yeni video/sesleri baştan sona dinleme; sayılar/birimler ve parça geçişlerini öğretmen rubriğiyle değerlendirme; anahtar sözcük–kalem zamanlarını ölçme; hak/saklama ve kanonik kazanım eşlemesi. Sonra ayrıca üretici LLM/API TTS otomasyonu ve daha zor geometri/fen pilotu. **Bu kabulden önce 100'lük seri veya öğrenci yayını açılmaz.**
