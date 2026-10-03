# Normal fabrika: Görünür caption ve farklı karşılaştırma görevleri

4 Ekim 2026, ana ajan kanıtı. Bu teknik editör dilimidir; öğrenci/pedagoji/yayın kabulü değildir. Gemini asıl checkout'u değiştirilmedi. Ham JSON/PNG/SVG review dosyaları repo dışı özel çıktı alanında; özel yollar ve medya Git'e alınmadı.

## Normal CLI bağlantısı ve TDD

`tools/content_factory_pilot.mjs` artık iki ayrı preparation sidecar'ı verir:

- `captionFramePreparation`: gerçek live scene plan'dan cue0/page0/progress1/revealfalse SVG ve ayrı tam anlatım paketi. İlk konu anlatımı + tek worked example altında exact hazırlanan SVG, kapalı details içinde gömülür. Başka sayfalar/cue'lar HTML oynatımına bağlanmadı; `initialCueOnly:true`, `pageNavigationImplemented:false`.
- `comparisonPreparation`: aynı alan/farklı çevre12 ve aynı çevre/farklı alan16 için iki ayrı görev. Üç+dört model satırı **yedi ürün sorusu değildir**. Oluşturma/tablo/açıklama/verification amaçları var; learner rubric ve media trace yok. SVG cevap içerir, yalnız kapalı editör eki; details auth mekanizması değildir.

İki comparison CLI regresyonu **0/2 RED → GREEN**; iki caption-frame CLI regresyonu **0/2 RED → GREEN**. Caption testinin ilk yanlış `index.html` beklentisi ENOENT'ti; gerçek çıktı `preview.html` olduğu doğrulanıp test düzeneği düzeltildi, bu loader hatası feature RED sayılmadı. Ardından eksik `captionFramePreparation` assertion'ı gerçek feature RED verdi. Model/schema/answer/stock mutasyonu yapılmadı.

Ana ajanın gerçek private CLI çıktıları:

| Aday | Stok taslağı/ret | Yeni ilk caption frame | Karşılaştırma görev/model | Audit bayt | Audit SHA-256 |
|---|---|---|---|---|---|
| 1 | 1/0 | 2 | 2/7 | 586628 | 4b7ee3bf6b59d9211de7af182121703349d5d2a465f5fe670786243c81f8ae5b |
| 100 | 12/88 | 13 | 2/7 | 2450455 | 70c48a603494a9e49b38235eef79a322caa19d7a115725b01934126dfe491fab |

İki pakette automatedPassed/expertApproved/published/acceptedProductQuestions0, provider calls0. İki görev mevcut pilot stock sayısını artırmaz. Audit JSON başka alanlarda cevaplar içerir, öğrenci payload'ı değildir. Media job unresolved/not-generated/not-rendered durumu korunur; eski preparation bayrakları yeni readiness iddiasına çevrilmez.

## Bağımsız denetim

Kendi karşılaştırma kodunu yazmayan ajan: 41 kabul target / 115 model / 1337 grid path domain kontrolü; 118 negatif ret, hook0; yeni module+CLI22/22. İki actual CLI gövdesi senaryosunda kapalı appendix/0accepted/count korunumu geçti. Foreign-realm exploratory VM guard hatası eksik harness koşusuydu, ürün başarısı sayılmadı.

İki root CLI bağını yazmayan ajan: 4/4 CLI ve 48/48 related; fresh kaynak/trace/job/live plan'dan 15 saved frame deepEqual. Original SVG sidecar bytes değişmedi; concept+worked ilk frame exact HTML insertion; serialized authority ret. Actual HTML ID/IDREF çakışması yok. İlk `\bid` probe'unun `data-trace-id` falsepositive'ları gerçek attribute sınırıyla ayrıldı; bu ürün ID düzeltmesi değildir.

Üçüncü salt-okunur audit: 137/137 related ve 26 source/4517 frame. `cueIndex:-0` metadata P2'si root TDD **23PASS/1FAIL → 24/24** ile kapandı; eski fingerprint'ler değişmedi. Actual 1/100 audit hashleri yukarıdakilerle aynı; toplam dört caption SVG eklemesi, 17 source SVG asset/hash ve 13 diagram byte kontrolü geçti. İçerik/UX/rights/öğretmen onayı bu teknik review değildir.

## Gerçek küçük raster gözlemi

Mevcut güvenilir Sharp ile yeni live API çıktı SVG'leri **native intrinsic boyutlarında** decode/raster edildi; hiçbir crop veya source-coordinate dönüşümü yapılmadı. 18 PNG toplam **583691 bayt**. Her PNG tam raw RGBA decode, boyut, SHA/piksel hash kontrolünden geçti. Kaynak asset/safe-layer/highlight eski renderer ile aynı kaldı.

| Dilim | PNG | Boyut |
|---|---|---|
| Yoğun bahçe evidence'ın bütün sayfaları | 5 | 1280×858 |
| Çevre why | 1 | 560×478 |
| Alandan bilinmeyen kenar goal | 2 | 560×478 |
| Kavram dersi evidence'ın bütün sayfaları | 5 | 560×428 |
| Kilitli bahçe result | 1 | 1280×858 |
| Bekleyen transfer prompt | 2 | 560×208 |
| Aynı alan / aynı çevre editör modeli | 2 | 1112×830 / 1112×858 |

Ana ajan **sekiz PNG'yi gerçekten görüntüledi**: iki karşılaştırma, concept evidence0, garden evidence2, inverse goal0, locked garden result, transfer0 ve perimeter why. İncelenen model/grid/tablo sayıları doğru; kare ve uzun ince dikdörtgen ayrı görünüyor; bilinmeyen kenar `?`, locked result cevapsız, transfer açıkça pending. Başlangıç elle/resim ardışıklığı veya video iddiası yok.

Tasarımsal borç açık: garden1280 canvas üzerinde şekil küçük/boşluk fazla; HTML `.figure`560'a ölçeklendiğinde garden/1112comparison metni küçülür. İki satır karakter bütçesi gerçek rendered-glyph fit kanıtı değil. Sayfa bazında cümle devamını korumak sonraki satıra yapay büyük harf eklemek değildir; canonical bütün cümle değiştirilmedi. Öğrenci için ayrı okunabilir geometri+DOM caption/zoom/keyboard sayfa akışı ve gerçek mobil/SR kabulü gerekir. Premium çocuk UI tamamlandı denmez.

Seçilmiş PNG SHA örnekleri: comparison-area `1e4c616bfbcfb79284e8e7284886ec9b2568743d57354d9073641d6ffce42509`, comparison-perimeter `fe918e4df33e7e54b01bc7d9d9f3a17a97357141685cfcf5331af76a224b2215`, concept0 `9f0b58b808a6f324a176851ea5fa17d8619468e60f3a3854f131642b29083fae`, garden2 `3626bd441dbfa4b1a9a9e1f487a30098ac0be304169d4545267a903cf672d26f`.

## Son teknik gate

Ana ajan `K12_INK_REAL_MEDIA_TEST=1` ve mevcut güvenilir Sharp opt-in'iyle **839/839 PASS, fail0/skip0**, 18.092s tam suite yürüttü. Önceki783'e comparison20 + captionframe24 + notebookCLI8 + rootCLI4 =56 eklendi. Gerçek defterSQL73 ve ad-hoc probes/raster bu toplama eklenmez.

Yeni TTS/MP4/Clef/provider/Drive aktarımı, kaynak indirmesi, credential, ücretli kredi/cloud/model işi veya gerçek çocuk verisi yok. 3338 açık UI değiştirilmedi; bu ayrı CLI editör HTML'idir. Yeni caption sayfaları önceki sesli pilotu yeniden seslendirmez. Genel video fabrikası/kelime–kalem senkronu, tüm ders/yaş/biçim kapsamı, alan/hak/uzman/erişilebilirlik kabulü ve 36.000 soru hâlâ açık. DAMA/CMMI/SPICE sertifikası verilmez.
