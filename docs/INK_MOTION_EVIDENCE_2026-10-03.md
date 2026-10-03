# Sürekli kalem hareketi — teknik kanıt ve açık ses kapısı

Tarih 2026-10-03; dal `codex/k12-foundation-audit`. Önceki statik/sessiz MP4 kullanıcı kalite kabulünden geçmedi. Bu yeni çalışma o yaklaşımın yerini alabilecek hareket altyapısını doğrular; **doğal sesli ders videosunun bitmesi değildir**.

## Gerçek yerel MP4

Chat çalışma alanındaki `outputs/ink-motion-preview-v1/solution.mp4` mevcut Sharp + FFmpeg ile üretildi. Yeni model/SDK indirilmedi, cloud inference veya ödeme yok. Ana ajan ffprobe, tam FFmpeg decode ve 6,25 / 6,75 / 33 s karelerini ayrıca inceledi.

| Kanıt | Gerçek sonuç |
| --- | --- |
| Süre / görüntü | 35,000 s; 1280 × 720; 24 fps; 840 kare |
| Codec | H.264 / yuv420p |
| Dosya | 484.365 byte |
| SHA-256 | `d35b4cdb6c98264a586ee8ea3d1f96fefed033bd3bf18fefacbc718e96d8c2c6` |
| Kaynak plan hash'i | `309a08895704329e9db15782fe1fdf56a449421c21019bfaaa02c8344fdc6e6b` |
| Decode | ffprobe ve tam FFmpeg decode exit 0 |
| Ses | **0 audio stream**; bu klip sessiz hareket önizlemesi |
| Hareket | Kısa aralıklı karelerde çizgi uzuyor ve kalem ucu ilerliyor; finalde 27/90/86/172 m ayrı anlam etiketiyle |
| Gerçek Mac ölçümü | 15,05 s wall; 200.196.096 byte (~190,9 MiB) max RSS; 0 swap |
| Yayın / inceleme | `motion_draft_rendered`; `publicationReady=false`; `not_listener_approved`; uzman bekliyor; müfredat eşlemesi yok |

Bu RAM/süre tek yerel renderer koşusudur: toplam Mac belleği, TTS modelinin belleği, Docker performansı veya bütün derslerin batch tahmini değildir. Matematiksel sonuç ayrı bağımsız hesaplarla doğrulandı: `18 ÷ 2 × 3 = 27`; `2 × (18 + 27) = 90`; `90 − 4 = 86`; `86 × 2 = 172`. Kapı iki sırada da açık olduğu soruda açıkça yazılıdır. Özgün soru taslağı aktif resmî çıktıya henüz bağlanmadı.

## Teknik sözleşme

`ink_timeline.mjs`: immutable branded plan, altı cue, gerçek yay uzunluğuna göre kısmi iz, kalem–uç eşleşmesi, 66 iz ve 66 kalem havada geçiş. Veriyi işaretleme işlemden önce; sonucun görünmesi yazım bitince; çevreleme/alt çizgi ardından anlam etiketi. Formül glyph'leri özgün çizgi yolları; raster matematiği generatif I2V'den gelmez.

`ink_video_renderer.mjs` + `render_ink_video.mjs`: SVG → tek raster worker → FFmpeg stdin; 840 PNG'yi diskte biriktirmez. Encoder iki thread, 64 MiB toplam artefakt sınırı; mevcut dizine veya kullanıcı dosyasına yazılmaz. CLI yalnız yöneticinin verdiği mutlak yerel runtime/output/manifest yollarını kabul eder, uzak URL çalıştırmaz. PCM manifesti altı cue, yerel dosya, tam byte/hash kanıtı ve `technical_preview_only` ister. Şu an bu preview formatı ticari hak onayı taşıyamaz.

WAV kaynağı tek PCM ses stream'i, mono ve 24 kHz olmalıdır; stereo veya farklı örnekleme hızı normalize edilerek sessizce kabul edilmez. Receipt doğrulanmış kanal/sample-rate/codec değerlerini taşır. Segment array getter/custom map/proxy/holes/prototip değişimleri ret testindedir. Deadline JS bekleyişini sonlandırır; süreç içi native Sharp işinin anında durması garantisi değildir. Sabit 720p ve küçük kaynak plan bütçesi korunur.

`teacher_voice_direction.mjs`: grade 1–8 ve üç kontrollü tonu, doğrulanmış aynı planın anlatımını değiştirmeden ayrı yönlendirmeye dönüştürür. Düşünme molası önerisi sesi hızlandırmaz; kaynak planı değiştirmez ve renderer'a henüz bağlanmadı. Ses üretimi, canlı API, öğrenci verisi veya klonlama yok; hak/öğretmen/dinleyici onayları bekler. Aynı ortaokul sorusuna birinci sınıf yönlendirmesi vermek içerik yaş uygunluğu kanıtı değildir.

## Bağımsız hata incelemesi

İlk sürümde encoder stdin `drain` beklerken kapanırsa veya deadline gelirse Promise kapanmıyordu. Ajan bunu gerçek Writable davranışıyla tekrar üretti; dört renderer sınır testi eski kodda beklemede kalıp RED oldu. Abort/error/close/raster bekleyişi tek deadline'a bağlandı; sınırsız cleanup beklemesi kaldırıldı. Yeni testler gerçek renderer kullanır, yalnız yavaş encoder/raster sınırları kontrollü double'dır. Gerçek codec/mux ayrıca sınanır; mock bu kanıt yerine geçmez.

## Ses testi neyi kanıtlar, neyi kanıtlamaz?

Opt-in `K12_INK_REAL_MEDIA_TEST=1` entegrasyonu altı özgün 0,5 s mono 24 kHz PCM **teknik ton** kullanır. H.264 + AAC MP4 encode edilip ses yeniden decode edilir; hand-derived cue başlarında enerji ve devamındaki sessiz padding ölçülür. Bu, dosyaları gerçek sahne sürelerinde birleştirme kanıtıdır; Türkçe ses, telaffuz, prosodi, öğretmen karakteri veya kelime–kalem uyumu kanıtı değildir. Geçici fixture'lar yalnız testin kendi `mkdtemp` dizininde oluşup test sonunda kaldırılır; ürün ses kaydı diye saklanmaz.

## Son test kapısı

Ana ajan son kodları bağımsız okudu, aynı gerçek mux entegrasyonu açıkken bütün default test kataloğunu yeniden çalıştırdı: **433 test / 433 pass / 0 fail / 0 skipped / 0 cancelled**, exit 0; 17,74 s. Gerçek encoder/decode alt testi yaklaşık 16,58 s. `[0, 4, 11, 18, 24, 31]` s cue başlarından 0,1 s sonra RMS >500; cue başından 1 s sonra sessiz padding RMS <30. AAC codec ve video süresi renderer'ın ffprobe sözleşmesinden ayrıca geçer.

Yeni ink/renderer/persona/CLI ve üç test dosyası için yedi `node --check` exit 0; `git diff --check` temiz. Manifest ve stereo format regression'ları önce RED, sonra GREEN; öğretmen direction testleri de önce eksik API ile RED, ardından GREEN oldu. Varsayılan `npm test` ağır medya entegrasyonunu çalıştırmaz; opt-in test ayrıca açılmadığında onu açıkça skip eder. Yukarıdaki 433/433 sayısı **gerçek medya opt-in koşusudur**, varsayılan komut için 0 skip iddiası değildir.

Ana ajanın ayrı taze varsayılan `npm test` koşusu da exit 0: 433 total / 432 pass / 0 fail / 1 açık opsiyonel medya skip / 0 cancelled; 3,08 s. Böylece ağır runtime gerektirmeyen test yolu ile gerçek codec yolu ayrı kanıtlanır.

## Açık kapı ve sonraki iş

Hak/servis kapsamı netleşmiş küçük yetişkin Türkçe ses pilotu → kör alan öğretmeni/dil uzmanı dinlemesi → gerçek anahtar sözcük–kalem zamanlama ölçümü → zor geometri/fen örneği → erişilebilir cihaz pilotu. [Öğretmen standardı](TEACHER_VIDEO_STANDARD_2026-10-03.md) bu kabulü tanımlar. Yeni sessiz klip bu kapılardan geçmiş gibi sunulmaz; Google üyelik menüsü de üretim izni sayılmaz. Docker/GPU/öğrenci yayın/on-prem güvenlik ve kurum verisi kapıları açılmadı.

Git'te küçük kod, test, kaynak linkleri, bu redakte kanıt ve plan tutulur. MP4/PNG/WAV, kişisel hesap/proje/Drive ID, kredi bakiyesi veya anahtar bu kamuya açık repoya eklenmez.
