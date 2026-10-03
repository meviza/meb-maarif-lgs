# Gerçek çözüm videosu pilotu — kanıt

Tarih: 2026-10-03. Durum `draft_video_rendered`; yayın kapalı, ses/TTS yok, uzman incelemesi bekliyor, kanonik müfredat eşlemesi çözülmedi.

**Sonraki kullanıcı kabulü:** aşağıdaki statik beş-sahne yaklaşımı ders videosu kalitesi bakımından reddedildi. Teknik render kanıtı tarihçe olarak korunur; pedagojik/satış kalitesi kabulü değildir. Yeni yön [öğretmen/kalem/ses standardında](TEACHER_VIDEO_STANDARD_2026-10-03.md); sürekli kalem hareketinin ayrı taslağı vardır, doğal ses kabulü hâlâ bekler.

Özgün `rectangle-007`: 8 cm × 2 cm dikdörtgenin çevresi. Doğrulanmış ortak çözüm grafiği `8 + 2 = 10`, `2 × 10 = 20 cm`; aynı sayılar soru, çizim, sonuç ve altyazıda kullanılır. Ham kullanıcı SVG'si veya generatif görselden-video modele şekil gönderilmez.

## Gerçek çıktılar

Yerel chat çalışma alanındaki `outputs/solution-video-pilot-v2` ve bağımsız tekrar koşusu `outputs/solution-video-measured`:

| Kanıt | Sonuç |
| --- | --- |
| Süre / görüntü | 35,000 s; 1280 × 720; 24 fps |
| Codec / piksel | H.264 / yuv420p |
| Ses | 0 audio stream; sessiz |
| Dosya | `solution.mp4`, 279.348 byte |
| SHA-256 | `920a7310e6889c274f4bd6447e1fadaa747a779b1492d957b106f2622e4dfbe5` |
| Kaynak içerik hash | `3cb43c5c9fd325d2a468a557caf86204af19bd4dc77430ddd99df5ddcbede58f` |
| Altyazı | Türkçe `captions.vtt`; SHA `770912ff7f38e28c5a09424e8989cc6593a0cd6feaad1b98926dd17a4481e30b` |
| Tekrarlanabilirlik | Ana ajan ayrı fresh dizinde tekrar üretti; aynı MP4 hash'i |
| Dosya çözme | Ana ajan ffprobe + tam ffmpeg decode: exit 0 |

Beş sahne soru → şekil → çözüm → kontrol → düşünme molası. Hafif açılış/kapanış fade ve sahne değişimi var; karakter canlandırma veya gerçek kalem çizimi animasyonu değildir. Her kare ölçekli olmayan şekli ve sessiz/taslak durumunu belirtir. Küçük pilotun başarılı üretimi pedagojik/sınıf onayı, bütün derslere video veya sesli çözüm hattının bitmesi değildir.

## Kod ve test sınırı

`packages/media/rectangle_video_pilot.mjs`, `tools/render_rectangle_video_pilot.mjs`, `test/rectangle_video_pilot.test.mjs`. Testler önce başarısız, sonra 9/9 başarılı. Yanlış anahtar, eski çözüm grafiği, bozuk şekil, uzak URL/girdi, plan tahrifi, mevcut kullanıcı dizinine yazma, runtime yolu ve 30 MiB toplam çıktı bütçesi test edilir. Bu unit testler FFmpeg kurulu olduğunu tek başına kanıtlamaz; gerçek render yukarıda ayrıca çalıştırıldı.

Bağımsız incelemede alan çözümünün ilk sayma açıklamasına yanlışlıkla `= genişlik` eklendiği bulundu. Yeni negatif/pozitif regression testi önce başarısız oldu; yalnız bu açıklamanın etiketi düzeltildi ve çözüm grafiği değiştirilmedi. İkinci ajan 9 testi ve çevre/alan ayrımını bağımsız doğruladı. Ana ajan `rectangle-008` için yeni `outputs/solution-video-area-checked` dizininde gerçek render, ffprobe, tam decode ve 16. saniye kare incelemesi yaptı: `Bir sırada: 9 birim kare`, `9 × 2 = 18`; 35 s / 720p / H.264 / sessiz; 291.999 byte; MP4 SHA `69d55db97ab721e0839a5ba7e4b59c3bd0198bc1db3286adb5778a93a6dd84d3`. Bu da yalnız taslak, müfredat/uzman kabulü bekleyen çıktıdır.

Runtime varsayılanları normal `sharp` module çözümü ve PATH'teki `ffmpeg`/`ffprobe`; kişisel Mac yolları kaynak koduna gömülmez. Yönetici tarafından seçilen mutlak runtime yolları CLI'da açıkça verilebilir; bunlar soru/model çıktısından alınmaz. Yeni bağımlılık/SDK/model kurulmadı. Docker/Linux üzerinde canlı koşu henüz yok.

Tek raster worker; encoder iki thread; bütün kaynak SVG/PNG, VTT, plan, concat, video ve receipt için 30 MiB üst sınır. Mevcut çıktı dizinine yazılmaz ve kullanıcı dosyası temizlenmez. Plan/MP4/voice/inceleme ayrı DAMA varlıkları; provenance/hak/amaç/sürüm/hash/saklama bilgisi üretim kapısına bağlanır.

## Ses ve generatif animasyon sonraki kapıları

İzinli yetişkin anlatıcı veya ticari kullanımı doğrulanmış TTS checkpoint/voice; Türkçe sayı/formül/birim okunuşu, kelime atlama/ekleme ve senkron incelemesi. Çocuk sesi klonlanmaz. Sesin kaynağı/ağırlık lisansı/konuşmacı hakkı ayrı kaydedilir. Apple sistem sesi otomatik ticari çözüm diye kullanılmadı.

Matematik/geometri ölçü, etiket ve işlem animasyonu deterministik kalır. Generatif I2V yalnız öğretici değeri olan, incelenmiş dekoratif/öykü sahnelerine aday; cevabın matematiksel kanıtı değildir. Clef kare/metin için yardımcı QA olabilir, video/TTS üreticisi değildir. TTS ve GPU maliyeti/çağrı yetkisi bu pilotla verilmiş sayılmaz.
