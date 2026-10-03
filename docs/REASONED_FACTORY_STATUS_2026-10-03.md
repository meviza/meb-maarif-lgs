# Gerekçeli öğretim fabrikası ve platform durum kaydı

Tarih: 2026-10-03. Dal: `codex/k12-foundation-audit`. Bu kayıt plan, uygulanan kod, yerel doğrulama ve insan/yayın kabulünü birbirinden ayırır. Antigravity/Gemini'nin asıl checkout'u değiştirilmedi. Ham medya, hesap ekranları, tokenlar ve özel yerel çıktılar kamu deposuna eklenmedi.

## Bu teslimde gerçekten değişenler

Ortak `reasoned-teaching-trace/v1` sözleşmesi artık yalnız bahçe örneğine bağlı değildir. Hedef → verinin/kanıtın anlamı → gerekçeli yol ve geçerlilik koşulları → değişken sayıda işlem/yorum adımı → koşulla kontrol → yeni duruma aktarım sırası uygulanır. Her adımın girdisi, önceki sonuç bağı, işlemi, birimi, sonuç anlamı ve kontrol sorusu kaydedilir. Her ders/soru dokuz adıma zorlanmaz.

| Kod | Gerçek kapsam |
| --- | --- |
| `packages/contracts/reasoned_teaching_trace.mjs` | Kapalı şema; sınırlı veri kopyası; kaynak referansı/hash; işlem/birim/bağımlılık doğrulaması; editör aşama görünümü; bekleyen insan incelemeleri |
| `packages/content-factory/reasoned_math_adapter.mjs` | Altı dikdörtgen ailesi ve mevcut sabit bahçe sorusu için kaynağı değiştirmeyen gerekçe türevi |
| `packages/content-factory/reasoned_concept_lesson.mjs` | Ayrı çevre–alan dersi: iki eş alanlı/farklı çevreli model, karşı örnek, yeni kare görevine aktarım |
| `tools/content_factory_pilot.mjs` | Normal fabrika CLI'sinde tutulan her soruya gerekçe kapısı; ayrı ders; inceleme JSON'u ve HTML |

Altı aile: çevre, alan, alandan bilinmeyen kenar, çevreden bilinmeyen kenar, alan–çevre hata teşhisi, açıklıklı sınır. Bahçe adaptörü kesrin paydası, eş kenar çiftleri ve tel sırası sayısının ayrı rollerini korur. Türkçe/fen/İngilizce/DKAB/sosyal bilgiler için alan adaptörleri henüz yoktur. Genel yorum şeması bulunması bu alanların anlamsal doğruluğunu kanıtlamaz.

Bağımsız denetimin yakaladığı iki hata önce başarısız testle doğrulandı, sonra düzeltildi: küçük yanlış ara sonucun sonraki çarpımda büyüyebilmesi; açık `null` seçeneğin varsayılan değer sanılması. Sayısal değerler artık hesaplanan değerle tam eşleşir. Bu sınırlı pilot, genel matematik ispatlayıcısı veya ondalık/rasyonel yuvarlama motoru değildir.

Tarayıcıda görülen üçüncü hata, aynı HTML'deki SVG `title/desc` ID çakışmasıydı. Regresyon testi önce başarısız oldu; yalnız önizleme kopyasındaki ID ve `aria-labelledby` referansları kart bazında ayrıldı. Kaynak SVG, görsel hash'i ve soru hash'i değiştirilmedi. Yorum sonuçlarında iç şema türü `text` öğrenciye gösterilecek ölçü birimi gibi yazılmaz.

## Taze fabrika koşusu

```sh
umask 077
node tools/content_factory_pilot.mjs --count 100 --out <YENI_OZEL_INCELEME_DIZINI>
```

Gerçek CLI sonucu: **100 aday → 12 matematik kontrolü geçmiş taslak → 88 çeşitlilik reddi**. Altı aile, aile başına en fazla iki varyant tutuldu. 12 kaynak-bağlı gerekçeli soru taslağı ve ayrıca bir gerekçeli kavram dersi çıktı. `automatedPassed=0`, `expertApproved=0`, `published=0`, `livePaidCalls=0`; Clef çağrılmadı. Benzerlik arşivi/hak incelemesi tamamlanmadığı için 12 taslak, 12 intihalsizliği onaylanmış soru diye sayılmaz.

`preview.html`, `batch.json`, `audit.json` ve 12 özgün parametrik SVG repo dışındaki özel inceleme alanındadır. `umask 077` bu koşunun dosyalarını korur; eski CLI'nin bütün çıktı yolu/symlink semantiğinin yeniden tasarlandığı iddia edilmez. Önceki çıktılar üzerine yazılmadı. Loopback 3338 yalnız `/` ve `/audit.json` için GET/HEAD sunar; geniş dizin paylaşımı açılmadı.

Gerekçeli HTML **editör incelemesidir**: sonuç açılmadan ilerleme kapalıdır, önceki sonuçlar anlam/birimle görünür, geri dönüşte cevap yeniden kapanır, paneller bağımsız durum tutar. HTML kaynak kodunda cevap bulunur; bu özellik öğrenci yetkilendirmesi veya cevap gizliliği değildir. Serbest gerekçe metninin yanlışlıkla cevabı erken vermesi ayrıca insan incelemesi gerektirir.

## Başlık başlık mevcut durum

| İş akışı | Kanıtlanan durum | Henüz kanıtlanmayan / sonraki kapı |
| --- | --- | --- |
| 36.000 soru | Kapsam/kota sözleşmeleri; gerçek küçük sayısal fabrika; bu koşuda 12 taslak | Tam 1–8 mikrobeceri/temsil/çeşitlilik haritası; bağımsız alan çözümü, arşiv benzerliği, hak ve insan kabulü; 36.000 yayın yok |
| Konu anlatımı | Ayrı çevre–alan kavram dersi, iki özgün model ve aktarım görevi; eski pilotta 12 soru-türevi açıklama | Tüm dersler için kavram/ön koşul/yanılgı/biçimlendirici ölçme dizileri ve yaş kabulü |
| Ses ve video | Önceki gerçek sesli kalem MP4: 36,375 s, 1280×720 H.264/AAC; ayrı ders WAV: 47,76 s; sekiz kısa ses önizlemesi | Yeni gerekçeli metin henüz seslendirilmedi; kelime–kalem ölçümü, kör dinleme ve API TTS otomasyonu tamamlanmadı; sekiz önizleme sekiz farklı ses demek değildir |
| Araç hattı | Deterministik SVG/kalem + Sharp/FFmpeg; yetişkin editör ses pilotu; üretici için GLM transport adayı; Clef metin/raster ön-denetim hazırlığı | Gerçek üretici ve Clef danışma sonucu yok; Workers AI token alanı boş; Wan/Comfy/Qwen ağırlığı veya yeni SDK kurulmadı |
| MEB/TYMM | 34 PDF'nin boyut, PDF başlığı ve SHA-256 değeri bu turda yeniden doğrulandı; 14 LGS, 10 güncel program, 8 eski program, 2 kılavuz/ortak metin | 8 başarısız kaynak, bütün aylık örnekler/ders kitapları/geçmiş sürümler, tam çıktı ayrıştırma ve değişim analizi; MEB onayı yok |
| Haklar | 34 kayıt `reference_only` / `reuseRights: unverified`; özel açık-lisanslı kaynak kaydı 0 | Her ürün varlığının ticari kullanım kanıtı; kamu erişimi açık lisans kabul edilmez |
| DAMA | Yaşam döngüsü, sözlük/katalog, hak/provenance, yetki, kalite ve audit sözleşmeleri; yeni trace'te amaç/saklama/erişim/pending inceleme metaverisi | Yeni trace owner/steward ataması bekliyor; gerçek resolver, kalıcı yönetişim ledger'ı ve işletim/saklama uygulaması yok |
| CMMI 3 / SPICE 2 | Gereksinim–test–kanıt kapıları, TDD, bağımsız inceleme, negatif test ve faz raporu | Kurum süreçlerinin gerçek işletimi ve yetkili değerlendirme; test sayısı sertifika/olgunluk derecesi değildir |
| Backend/veritabanı | Eski DB/SQL kodları korunuyor; yeni yetki, tenant/sınıf, yayın, varlık ve sync port sözleşmeleri testli | Yeni otoritatif PostgreSQL adapter/atomik transaction/auth/tenant izolasyonu, kota ve restore entegrasyonu yok; server salt-okunur prototip |
| Öğrenci analitiği | Takma kimlikli olay/senkronizasyon ve açıklanabilir öğrenme kanıtı tasarımı | Gerçek öğrenci geçmişi/DB'ye kalıcı yazım ve psikometrik geçerliği kanıtlanmış dashboard yok; adım açılması öğrenme kanıtı sayılmaz |
| Docker | Yerel Docker client 29.2.1 / server 29.6.2, `desktop-linux` erişilebilir | Cloud Sandbox hesabı/kredi/worker açılması doğrulanmadı; bu turda cloud iş veya ücret oluşmadı; yerel Docker, okul on-prem sunucusu değildir |
| Drive | Önceki makbuzda 12 PDF: 65.495.532 bayt + küçük kanıt dosyası; 70 dosyalık planın 58'i bekliyordu | Bu turda uzaktaki durum yeniden okunmadı veya dosya yüklenmedi; 34 PDF'nin tamamı Drive'da denmez; Drive veritabanı/CDN/CPU değildir |
| Arayüz/mobil | Yerel öğrenci ve atölye prototipleri; yeni gerekçeli editör inceleme yüzeyi gerçek tarayıcıda denetlendi | Üretim login/yetki/kalıcı defter, bütün yaş varyantları, Flutter ve gerçek Android/iOS cihaz kabulü yok |

Müfredat yılı/sınıf geçişi ve gerçek kazanım adaylarının kanıtı [kaynak arşivi raporundadır](MEB_SOURCE_ARCHIVE_2026-10-03.md). Bu turda tüm programlar yeniden çevrimiçi kontrol edilmedi; dosya bütünlüğü yeniden kontrol edildi. Kaynakları indirip hash'lemek, pedagojik kapsam veya ticari yeniden kullanım onayı değildir.

Clef **üretici/ses/video modeli değil**, danışma/ön-denetim katmanıdır. Mevcut API ve araç araştırması [yeniden bazlama](PLATFORM_REBASE_PLAN_2026-10-03.md), [medya araştırması](MEDIA_TOOL_RESEARCH_2026-10-03.md) ve [öğretmen video standardında](TEACHER_VIDEO_STANDARD_2026-10-03.md) tutulur. Bu tur yeni fiyat/kota araştırması veya canlı provider çağrısı yapmaz.

## Test ve bağımsız kontrol

Bu teslimin 34 yeni testi: ortak trace 10, matematik aileleri 17, ayrı kavram dersi 3, gerçek CLI/HTML 4. Önce başarısızlık, sonra uygulama/fix ve tekrar başarı görüldü. İki paralel ajan kullanıldı: aile adaptörü/kanıt denetimi; bağımsız pedagojik/teknik audit. Ana ajan entegrasyon, sınır kontrolleri, gerçek CLI, tarayıcı ve nihai doğrulamayı yaptı.

Son kodla tam test:

```sh
K12_INK_REAL_MEDIA_TEST=1 K12_INK_SHARP_PACKAGE=<GUVENILIR_SHARP_PACKAGE_JSON> npm test
```

**561/561 pass, 0 fail, 0 skip**. Bu sonuç yerel kod ve opt-in gerçek medya testleri içindir; canlı Clef/GLM/TTS, okul verisi, Drive upload, gerçek DB veya öğrenci kabulü değildir.

Tarayıcı kanıtları: goal/veri/yol aşamaları, reveal öncesi kapalı sonuç ve ilerleme, anlamlı ara sonuç, geri dönüşte tekrar kapanma, iki panelin bağımsızlığı, yanlış cm iddiasını alan cm² ile düzeltme, ayrı dersin 20/24/24/22 karşı örneği, 3 cm kare aktarımı. Son çıktıdaki ekran okuyucu etiketleri karta özgü; uyarı/hata konsol kaydı boş. Yeni ders/çözüm sesi veya MP4 eklenmedi. Ekran görüntüsü özel çıktı alanında tutuldu; WCAG veya pedagojik kabul ilan edilmedi.

## Güncellenen paralel iş planı

1. **Müfredat ve içerik:** tek sınıf/ders için aktif program–sayfa–öğrenme çıktısı → mikrobeceri → soru ailesi → temsil → zorluk/amaç hücrelerini insanla kesinleştir. Tek konuya yığılmayı önleyen kota/benzerlik kontrolüyle ilk çeşitli batch'i kur. Yetkili yapılandırma ve iş bütçesi hazır olduğunda üretici + Clef danışma denemesini ayrı raporla.
2. **Öğretim medyası:** kabul edilen yeni trace'ten yeni ses cue'ları, altyazı ve kalem timeline türet; tek soru ve ayrı kavram dersiyle yeni gerekçeli sesli video pilotunu doğrula. Eski sesin yeni metni anlattığı izlenimi verilmez. Sonra tekrar üretim ve gerçek TTS bağlantısını otomatikleştir; öğretmen/dil/dinleyici kapısını atlama.
3. **Backend/veri:** mevcut sözleşmeleri çoğaltmak yerine gerçek PostgreSQL migration/adapter + sentetik iki okul dikey dilimi kur. Aynı transaction'da yetki/policy, idempotency, event/cursor/receipt ve audit; tenantlar arası negatif test, kota aşımı ve restore ölçümü. Gerçek çocuk verisi kapalı kalır.
4. **Frontend/analitik:** aynı dikey dilimin öğrenci çalışma defteri, öğretmen incelemesi ve veli özeti; gerçek kayda bağlı beceri kanıtı/belirsizlik gösterimi. Üretimden alınmayan sayılar demo diye etiketlenir. Ardından cihaz/erişilebilirlik pilotu.
5. **İşletim:** önce küçük ve bütçesi ölçülü yerel CPU render; sonra doğrulanmış kredi/konum/güvenlik koşullarıyla bağımsız Docker worker. Nesne arşivi ve sınırlı cache'i işletimden ayır. Flutter SDK/cihaz ve 1–8 yaygınlaşması bu kabul zincirinden sonra gelir.

Plan devam etmeye izin verir; canlı hesap/kredi işlemleri, yeni credential, gerçek okul/çocuk verisi transferi, hak ve yayın onayı ayrı kapılarda kalır. 36.000 hedefi bu kapıları geçen içerik üzerinden ilerler, üretim denemesinin toplam aday sayısından hesaplanmaz.
