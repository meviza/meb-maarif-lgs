# Türkçe öğretmen sesi — ilk gerçek karşılaştırma pilotu

Tarih: 2026-10-03. Durum: **üç kısa ses dosyası üretildi, kaydedildi ve teknik olarak doğrulandı; dinleyici/öğretmen kabulü bekliyor.** Bu bir tamamlanmış sesli çözüm videosu, müfredat onayı veya pedagojik sertifika değildir.

## Kapsam ve değişmeyen kaynak

Kullanıcının önceki sınırlı ücretsiz ses denemesi önerisine “devam et” yanıtı, en fazla üç kısa özgün metin denemesi ve toplam en fazla 90 saniye kapsamında kullanıldı. Google AI Studio tarayıcı ses ekranında `gemini-3.8-flash-tts` seçildi; yeni API anahtarı oluşturulmadı/seçilmedi, faturalama etkinleştirilmedi ve ücretli plana geçilmedi. Flow'da üretim yapılmadı. Öğrenci, özel okul veya kişisel veri gönderilmedi. Bu gözlem, gelecek API işlerinin ücretsiz olduğuna dair garanti değildir.

Kaynak: `ink-garden-two-rows-v1`, varsayılan plan SHA-256 `309a08895704329e9db15782fe1fdf56a449421c21019bfaaa02c8344fdc6e6b`. Yalnız `step3` ve `step4` anlatımları birleştirildi; altı cue'luk tam çözüm ses manifesti oluşturulmadı.

> Kapının dört metresini çıkaralım. Bir sıra için seksen altı metre tel gerekir. İki sıra istendiği için seksen altıyı ikiyle çarparız. Yüz yetmiş iki metre.

24 kelime; UTF-8 metin SHA-256 `8ba8ee51c164f0b00c06ffbacc9da9e33046e7cd959ba520f1f06e43d46fe009`. Bağımsız matematik kontrolü: `18 × 3/2 = 27 m`, `2 × (18 + 27) = 90 m`, `90 − 4 = 86 m` bir sıra, `86 × 2 = 172 m` iki sıra. Alternatif kontrol `180 − 8 = 172 m`. Doğru kaynak metni, üretilen sesin aynı metni gerçekten okuduğunu kanıtlamaz.

## Karşılaştırma tasarımı ve gözlenen sınır

Ses seçicisinde Bodi/Kira seçilmeye çalışıldı, fakat konuşma bloğundaki ses etiketi **Fola** olarak kaldı. Üç **üslup yönergesi** denendi: A sakin, B merak uyandıran, C kararlı/strateji odaklı. A/B/C için gerçek ses kimliği bağımsız doğrulanmadı; aynı veya farklı hazır sesler kullandıkları söylenemez. Sonraki Charon pilotunda seçici ve kod önizlemesi Charon gösterirken konuşma bloğu Fola olarak kaldı; dolayısıyla bu etiket eski kalabiliyor ve tek başına ses kimliği kanıtı değil. İlk yerel receipt bu sonraki bulgudan önceki gözlem olarak korundu; yeni receipt bu açıklamayı içerir. Yönerge ve okunacak metin ayrı UI alanlarında tutuldu; klonlama veya referans ses yüklemesi yapılmadı. Hazır seslerin yaş/provenansı bağımsız doğrulanmış değildir.

Bu küçük karşılaştırma doğal ses karakterini kabul etmez; üslubun gerçekten değişip değişmediği dinlenmelidir. C yönergesinde 7–8. sınıf hitabı istenmesi, sorunun o sınıfa kanonik program eşlemesini sağlamaz. Kaynak soru hâlâ `unmapped_draft`.

| Örnek | İstenen üslup | Gerçek süre | Düzeltilmiş WAV byte sayısı | Düzeltilmiş WAV SHA-256 |
| --- | --- | --- | --- | --- |
| A | Sakin | 11,68 s | 560.718 | `c111294f114a8cf0ab91fd6ad1935629e892bff5931010d943877ba16f7ec4aa` |
| B | Merak uyandıran | 11,48 s | 551.118 | `2abddffac96c3cf99a00bcc03cff1df0b1cad7d3bd2bd02b84e7ce98677e7179` |
| C | Kararlı/strateji odaklı | 11,20 s | 537.678 | `c5c5e81671951a56c68e49d0b9f88d14b4611d5ffd9ffacfa1fd2e254c24a625` |

Toplam **34,36 s**, düzeltilmiş üç WAV toplam **1.649.514 byte**. Format: tek ses akışı, `pcm_s16le`, mono, 24.000 Hz, 16 bit. Yerel büyük model/SDK/skill indirilmedi.

## Konteyner kusuru ve değişmez ses kanıtı

İndirilen üç WAV'ın başlığında byte-rate `96.000`, mono 24 kHz/16 bit için beklenen değer `48.000` idi. FFmpeg bu tutarsızlığı toleransla okuyordu; yalnız codec/duration başarısı yeterli sayılmadı. Özgün dosyalar korundu. Ayrı `*-checked.wav` türevleri PCM WAV olarak, hızlandırma/yeniden örnekleme/ses düzenleme olmadan üretildi. Her kaynak ve türevin PCM payload SHA-256'sı birebir eşleşti; başlık byte-rate düzeldi. Dolayısıyla duyulan sese müdahale edilmedi.

FFprobe üç kaynak ve üç türevin codec/kanal/hız/süre bilgilerini doğruladı; altı dosyanın tam decode'u geçti. Türevin PCM eşitliği ve yerel kayıtların kaynak plan/metin/üslup/dosya hashleri ayrıca kontrol edildi. Bu kontroller telaffuz, doğallık veya kelime–kalem senkron testi değildir.

## Ses manifesti V2 ve taze yazılım kanıtı

`ink-audio-preview/v2`, bu tek pilotun varsayılan kaynak plan ID/hash'ini; her cue'nun kesin metni/hash'ini, ayrı üslup/hash'ini ve sağlayıcı/model/ses beyanlarını taşır. Doğru hash yeniden hesaplanmış olsa bile yanlış metin veya yanlış cue reddedilir. Eksik/fazla alan, accessor/proxy, uzak referans ve sınırı aşan beyanlar fail-closed kontrol edilir. Şüpheli credential biçimleri yalnız muhafazakâr biçim taramasıdır; genel DLP garantisi değildir. Manifest girdi sınırı dışındaki bütün yardımcı API'lerin hostile object güvenliği doğrulanmış sayılmaz.

V1 geriye uyumlu teknik fixture desteği `unbound_technical_preview_only` olarak korunur. V2 `declared_transcript_bound_not_listener_verified` der; her iki sürüm `speechContentStatus = not_listener_verified`, `expertReview = pending`, `publicationReady = false` tutar. Metin ve hash eşleşmesi, sesin o sözcükleri gerçekten okuduğu anlamına gelmez. Üç gerçek iki-cue önizlem V2'nin altı-cue çözüm manifesti olarak sunulmadı.

TDD RED: renderer testlerinde 12 geçti, 8 beklenen başarısızlık, 1 opsiyonel skip; GREEN: 20 geçti, 0 hata, 1 opsiyonel skip. İkinci ajanın bağımsız incelemesi aynı scoped sonucu aldı; yanlış metin/array Proxy ek denemeleri reddedildi. Root ayrıca değişikliği okuyup tüm paketi taze çalıştırdı:

```sh
K12_INK_REAL_MEDIA_TEST=1 K12_INK_SHARP_PACKAGE=/absolute/path/to/trusted/sharp/package.json npm test
```

Sonuç **441/441 geçti; 0 hata, 0 skip, 0 iptal; 16,99 s**. İki değişmiş MJS için `node --check` ve `git diff --check` exit 0. Yerel mevcut güvenilen Sharp ve FFmpeg kullanıldı; yeni bağımlılık kurulmadı. Gerçek native entegrasyon testi altı farklı teknik PCM tonunu V1 ile mux/decode ederek cue başlangıcını ve sessizlik dolgusunu ölçer; **öğretmen sesi değildir**. V2 receipt testleri gerçek renderer dosya/timeline kodu ile kontrollü Sharp/FFmpeg/FFprobe sınırları kullanır; onların placeholder MP4'ü oynatılabilir video veya native V2 kalite kanıtı sayılmaz. Bu kayıtlar CMMI/SPICE süreç hazırlığına kanıttır, olgunluk derecesi/sertifika değildir.

## DAMA kaydı ve erişim

Yerel, Git dışı karşılaştırma klasöründe kaynak WAV, düzeltilmiş WAV, üretim ekranı kanıtı ve `receipt.json` tutuldu. Kayıt; amaç, owner rolü, steward bekleme durumu, UTC zaman, kaynak plan/cue/metin hash'i, her üslup metni/hash'i, UI model/ses etiketi, dosya/PCM hashleri, gerçek süre, dönüşüm, hak kaynağı ve inceleme durumunu içerir. Anahtar, cookie, hesap/proje kimliği, özel URL veya çocuk verisi kayıt/kamu Git'ine alınmadı. Hesap arayüzünün ekran görüntüsü kamu Git'ine gönderilmedi; ses dosyaları da dağıtılmadı.

Yerel klasör yalnız proje operatörüne açık. Yerel 30 günlük inceleme saklama süresi **öneridir**, owner kararı ve otomatik silme henüz yoktur. Yerel silme sağlayıcıdaki kayıtları silmez; sağlayıcı saklama/kullanım koşulları ayrı incelenir. Hak durumu `provider_terms_review_pending`; yeniden kullanım/çocuk uygulamasına dağıtım onayı yoktur. [Sağlayıcı şartları](https://ai.google.dev/gemini-api/terms), [TTS kılavuzu](https://ai.google.dev/gemini-api/docs/speech-generation).

## Kabul kapısı ve sonraki adım

`generated → saved → technically_verified` gerçekleşti. `listener_reviewed`, doğal telaffuz/üslup kabulü, sayı/birim hatası denetimi, öğretmen onayı, kanonik müfredat ve yayın **gerçekleşmedi**. `publicationReady = false`. Üç örnek altı cue yerine tekrar edilerek videoya yerleştirilmez.

Dinleyici rubriği: dört/seksen altı/iki/yüz yetmiş iki ve **metre** doğruluğu; bir sıra–iki sıra ayrımı; doğal yetişkin öğretmen tonu; cümle sınırında duraklama; açıklık; ses sürekliliği. 1–5 medyan ≥4 ve kritik sayı/birim hatası 0 yalnız pilot kabul hedefidir, ölçülmüş sonuç değildir. Kullanıcı tercihi profesyonel öğretmen/dil uzmanı kabulünün yerine geçmez.

Sonraki uygulama: tercih edilen üslup ve hak kapsamı → altı cue için ayrı doğrulanmış ses → dinlenmiş metin kontrolü → gerçek ses zamanlarına bağlı kalem vurgusu → zor geometri/fen örneğinde uçtan uca oynatılabilir video → cihaz/erişilebilirlik ve öğretmen kabulü. Tam öğretici çözüm gerekli süreyi kullanır; 30–35 saniyelik reklam özeti ayrı türevdir.

## Kullanıcı tercihi ve erkek hazır ses ek denemesi

Kullanıcı B ve C arasında kaldığını ve ikisini de kullanmak istediğini bildirdi. İki üslup aday olarak korunur: B keşif/konu anlatımı/ipucu, C adımlı çözüm/strateji/özet için **ürün önerisidir**; ölçülmüş pedagojik eşleme veya profesyonel kabul değildir. Ses kimliği ile anlatım üslubu ayrı boyutlardır; aynı öğretmen kimliğinin iki modu olarak ürünleştirmek ileride ayrıca doğrulanmalıdır. Öğrenci seçimi için cinsiyete bağlı başarı veya yetenek varsayımı yapılmaz.

“Erkek sesi de var mı?” isteğine karşılık tek ek kısa özgün metin denemesi yapıldı. [Google'ın resmî ses tablosu](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts) Charon, Orus ve Puck'ı erkek ses olarak listeler. [Gemini TTS kılavuzu](https://ai.google.dev/gemini-api/docs/speech-generation) sırasıyla bilgilendirici, kararlı ve canlı karakterleri belirtir; bunlar sağlayıcı tanımıdır, Türkçe öğretmen performansı kabulü değildir.

Canlı seçicide `Masculine` filtresi altında Charon seçildi. `Get code` önizlemesindeki `voice_name="Charon"` üretimden önce görsel olarak doğrulandı; konuşma bloğu ve panel üst etiketi Fola olarak kaldı. Kod önizlemesi istenen konfigürasyonu gösterir; sağlayıcı yanıtından bağımsız bir ses kimliği attestasyonu elde edilmedi. Aynı 24 kelimelik kaynak ve C'nin birebir aynı üslup yönergesi kullanıldı; ses kimliği değişkenini ayırmayı hedefler, önceki C ses kimliği belirsizliği nedeniyle kontrollü deney sonucu sayılmaz.

| Ek örnek | İstenen ses/üslup | Süre | Düzeltilmiş WAV byte sayısı | Düzeltilmiş WAV SHA-256 |
| --- | --- | --- | --- | --- |
| D | Charon / C-kararlı | 10,76 s | 516.558 | `99b9544d690b2a0ccd12362e63259b9ef6f85fb5fd56ba5dd3a0ab6cd77139a3` |

Tek anahtarsız UI üretimi yapıldı; yeni credential, faturalama veya ücretli plan açılmadı. Aynı mono 24 kHz/16-bit PCM formatı ve kaynak WAV byte-rate kusuru görüldü. Özgün dosya korundu; ayrı türevin byte-rate'i 48.000 olarak düzeltildi. Kaynak ve türev tam decode, FFprobe, WAV başlığı ve dosya hash kontrollerinden geçti; PCM payload SHA-256 `cd2a3c5e202af61d3480c39c44668886827a07743f0e43e90df985be2cfa2e81` birebir eşleşti. Ses hızlandırılmadı, yeniden örneklenmedi veya düzenlenmedi.

Yerel `male-preview-receipt.json` kaynak/metin/üslup kimliği, kullanıcı tercihi, konfigürasyon kanıtı, hashler ve inceleme durumlarını kaydeder. Ses ve hesap arayüzü kanıtı kamu Git'ine yüklenmedi. Bu turda uygulama kodu değişmedi; önceki 441 test sonucu yeni bir yazılım testi olarak sunulmaz. Ek sesin telaffuz, sayı/birim, doğallık, yaş uygunluğu, hak ve öğretmen incelemeleri bekliyor; `publicationReady = false`. Tam sesli çözüm videosu veya kelime–kalem senkronu henüz üretilmedi.

## Iapetus ve Algieba alternatifleri — dinleme için hazır

Kullanıcı iki alternatifin kısa örneklerini dinlemeyi onayladı; kaliteli hitabet/ses halinde kullanmak ve dersler için Türkçe isimli farklı rehberler seçmek istedi. İki anahtarsız UI üretimi yapıldı: aynı 24 kelimelik özgün kaynak, aynı C üslup metni/hash'i ve aynı `gemini-3.8-flash-tts`. Üretimden önce seçicide `Current` ve kod önizlemesinde sırasıyla `voice_name="Iapetus"` / `voice_name="Algieba"` doğrulandı; eski Fola bloğu kimlik kanıtı sayılmadı. Sağlayıcı yanıtından bağımsız ses kimliği attestasyonu yoktur. Yeni anahtar, ücretli plan, Flow üretimi veya kişisel/öğrenci verisi aktarımı olmadı.

| Örnek | Hazır ses / üslup | Önerilen isim (seçilmedi) | Süre | Düzeltilmiş WAV byte sayısı | Düzeltilmiş WAV SHA-256 |
| --- | --- | --- | --- | --- | --- |
| E | Iapetus / C | Deniz | 11,08 s | 531.918 | `0ea6517ff60ad429fb743eb157a4a94a1a34f3c7adac52f63d8c0571ed3bd4ad` |
| F | Algieba / C | Arda | 11,04 s | 529.998 | `2bb9ebe7caf497400d821dc8437570d45d38f18843454fc9e2c1017185df2f44` |

Toplam 22,12 s, iki düzeltilmiş WAV 1.061.916 byte. Dört kaynak/türev FFprobe ve tam decode'dan geçti; mono 24 kHz/16-bit PCM doğrulandı. Kaynakların byte-rate'i yine 96.000 idi; ayrı türevlerde 48.000'e düzeltildi. Kaynak ve türev PCM hashleri birebir aynı: E `4d35bdf92e40a01b34ba99118efc647819befb4b2cae38005df27040118b87c5`, F `9963aff5ba9f3f4489a33a882a1784bbc9cf73d080cc01fa0e0200ace2a76680`. Yeniden örnekleme, hızlandırma, seviye değiştirme veya konuşma düzenleme yok.

Normalize PCM RMS/peak: E 0,123633 / 0,858521; F 0,121769 / 0,813751. Her ikisinde tam ölçek örnek sayısı 0. Bu yalnız dosya düzeyi ölçümdür; algısal kalite, clipping yokluğu, hitabet, öğretmen sıcaklığı veya gerçek okunmuş metin kabulü anlamına gelmez. Yerel `male-alternatives-receipt.json` kaynak/üslup/hash/konfigürasyon/ölçüm/tercih beyanlarını tutar; sesler ve hesap ekranları kamu Git'ine alınmadı. Uygulama kodu değişmedi; önceki test sayısı yeni koşu olarak sunulmaz.

Dinleme, hak ve öğretmen kabulü bekliyor; isimler/ders eşlemeleri seçilmedi, `publicationReady = false`. Çok sesli ürün yönü ve yaşa uygun şeffaf kurmaca karakter planı: [Türkçe rehber personaları](TEACHER_PERSONA_PLAN_2026-10-03.md). Önce isim/ses tercihi; sonra ders/yaş bazında daha temsilî değerlendirme ve kabul kapıları.

## Sulafat ve Erinome — iki kadın hazır ses önizlemi

Kullanıcı önceki seslerde tonlama/vurgu/duraklamayı doğal bulduğunu ve açık telaffuz/sıcak hitap istediğini bildirdi; tekil ses seçimi/rubrik skoru vermedi. İki kadın örneği daha üretmeyi onayladı. Sulafat ve Erinome [resmî tabloda kadın](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts); [hazır ses karakterleri](https://ai.google.dev/gemini-api/docs/speech-generation#prebuilt-voices) sırasıyla sıcak ve nettir. Bunlar sağlayıcı etiketleri, Türkçe performans kabulü değildir. Yeni önizlemlerden önceki olumlu geri bildirim bu iki örneğe uygulanmaz.

Canlı `Feminine` filtresi, seçicide `Current` ve üretim öncesi kod önizlemesinde `voice_name="Sulafat"` / `voice_name="Erinome"` doğrulandı. Eski Fola etiketi kimlik kanıtı olarak kullanılmadı. Erinome panel kapanışı sonrası ilk AX okumasında ana kontrol henüz görünmedi; yeni durum okunarak kontrol bulundu, tahminî tıklama/ek üretim yapılmadı. Konfigürasyon kanıtı sağlayıcı yanıtından bağımsız ses attestasyonu değildir. Aynı özgün 24 kelimelik kaynak ve C üslup hash'i kullanıldı; iki anahtarsız UI üretimi, yeni credential/faturalama/Flow/öğrenci verisi yok.

| Örnek | Hazır ses / üslup | Önizlem ismi | Süre | Düzeltilmiş WAV byte sayısı | Düzeltilmiş WAV SHA-256 |
| --- | --- | --- | --- | --- | --- |
| G | Sulafat / C | Selin | 11,64 s | 558.798 | `005f2bd509ba49138fe65c07c1a0a63f631678b7b6d52df71d0c332e88485631` |
| H | Erinome / C | Ece | 10,96 s | 526.158 | `807ce40dccbe929da0ecf15725166c73456a72c2ba3e1986643c90c00e019f54` |

Toplam 22,60 s, iki türev 1.084.956 byte. Kaynak/türevlerin FFprobe, tam decode, RIFF/WAV başlık ve hash kontrolleri geçti: mono 24 kHz/16-bit PCM. Kaynak byte-rate kusuru 96.000 → türev 48.000 olarak düzeltildi. PCM hashleri kaynak/türevde aynı: G `7245678b5e35cc5bdffaf6d8198cf0e42853e138f399724b3f4c03d7ccb640fb`, H `26a3cb82eb3833434d5d572fe38a2c35115d608fb3661d897e3acbbf0df8a6cb`. Ses hızı, seviyesi, örnekleme veya konuşma değiştirilmedi.

Normalize RMS/peak: G 0,112968 / 0,735931; H 0,093397 / 0,650940; tam ölçek örnek sayısı iki dosyada da 0. Ölçümler doğallık, algısal kalite, clipping yokluğu, kelime doğruluğu veya pedagojik başarı kanıtı değildir. Yerel `female-alternatives-receipt.json` dosya ve kaynak bağını, yeni örneklerde kabul beklediğini, önceki öznel geri bildirimle ölçülmemiş pedagojik hipotezi ayrı kaydeder. Sesler/hesap ekranları kamu Git'ine gönderilmedi. Kod değişmedi, önceki yazılım test sayısı yeni koşu sayılmadı. Yeni örneklerin dinleme/hak/öğretmen incelemesi bekliyor; isimler derslere atanmadı, `publicationReady = false`.
