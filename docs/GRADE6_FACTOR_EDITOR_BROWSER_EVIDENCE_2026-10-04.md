# Çarpan Kanıtı: Görsel Editör Önizlemi ve Native Tarayıcı Kanıtı

## Test Öncesi QA Envanteri

Kapsam: önceki tek kaynak-bağlı editör taslağının gerçek HTML tabloları ve neden–amaç ilişkili açıklaması. Dört pano aynı görevde dört farklı kanıt seçeneğidir; dört yeni soru, parametre varyantı veya tekrarlanan test stoğu değildir. Bu sayfa cevap içeren editör artifact'idir; kapalı `details` güvenli öğrenci cevabı gizleme sistemi değildir.

| İddia / kontrol | İşlev kontrolü | Görsel kontrol ve kanıt |
| --- | --- | --- |
| Başlangıç amacı, sayı ve taslak sınırı görünür | Native URL, başlık ve uyarı; tek görev | Desktop1440×1000 ve mobile390×844 ilk viewport |
| Dört pano gerçek tablo olarak okunur | Native DOM'da dört caption, sütun başlığı ve literal sayısal satır | Tüm panolar; mobil kaydırarak her tablo |
| Cevap başlangıçta işaretlenmez | Çözüm kapalı; pano stilleri ve görünür içerik | Açılmadan önce tablolar |
| Tek gerekçeli çözüm aç/kapat | Normal mouse/tap, Tab ve Enter/Space; tam tersinir döngü | Açık hedef/verilen/yol/neden/üç adım/kısa yol/1 transferi |
| Responsive metin ve tablo | Genişlik, bölge sınırları ve okunabilir font | Yatay taşma/clipping/çakışma ayrı görüntü incelemesi |
| JS, harici asset ve model çağrısı yok | Request/response ve pageerror gözlemi; HTML-only çıktı | Varsayılan tek yerel document akışı |

Exploratory/off-happy-path: hızlı tekrar aç/kapat ile klavye geri dönüşü; mobil açık yoğun açıklama ve dar görünümde yeniden yükleme. En az30 saniye normal input keşfi yapılmadan tamamlandı denmez. Değerlendirme girdileri yalnız normal Playwright klavye/mouse/touch API'leri; evaluate salt-okunur DOM/geometry için. Fiziksel cihaz, kontrast/ekran okuyucu sertifikası, premium ürün UI'sı veya pedagojik kabul bu faza dahil değildir.

Planlanan kanıt, kurulu native Chrome ve mevcut Playwright ile ayrı owned headless profil ve loopback geçici static QA sunucusudur. Kullanıcının Chrome profili, eski3337/3338 önizlemeleri, DB ve öğrenci kanalına dokunulmaz. Ham JPEG/özel output yolu Git'e alınmaz. Önce tam TDD RED/GREEN, frozen kod ve bağımsız audit; sonra gerçek emitted HTML'nin native işlev/görsel kontrolü; son test/güvenli Git kapıları ayrı tutulur.

## Frozen Kod, TDD ve Bağımsız Denetim

Başlangıç checkpoint'i `137b1cb3c0ff394606f75b1e3abcee667d04985d`; kanonik dal temizdi. Yeni renderer SHA `e7d3cb74a484330ed5ef9695ae13e8a914c2d250960905af25b229fc2e0072b6`, test SHA `5a99efe766fcda54f9f13e1c6e2663ab1d2359a40fe779ed63d3761fd4d63822`. [Yazarın sınır/TDD kaydı](GRADE6_FACTOR_EVIDENCE_EDITOR_VIEW_EVIDENCE_2026-10-04.md) ayrı kanıttır; yazar native browser çalıştırmadı.

Renderer exact iki argüman, existing bağımsız verifier geçişi ve kanonik taslağı yeniden kurma zorunluluğuyla çalışır. Geçişten sonra raw candidate sink'e gitmez. Dört gerçek tablo /19 çift satırı /11 rozet /12 sütun başlığı; tek kapalı gerekçeli çözüm. Render öncesi source draft ve bütün altı kapı değişmez; renderer'ın ayrı manifest'i HTML çıktısını sayar, kabul/yayın/öğrenci yetkisi sağlamaz.

Yazar missing export **0/14 RED →14/14 GREEN**. Root yeni `--factor-html` CLI testi eski davranışta **4 PASS /1 FAIL** (`invalid_grade6_reference_authoring_args`) verdi; minimal kapalı dal ve gerçek renderer sonrası **5/5 GREEN**. Üç sütun (iki çarpan +çarpım) için root header beklentisi12 olarak açıklandı; prose veya CSS satırları için sahte RED icat edilmedi. Varsayılan summary, `--plan` ve `--factor-draft` korunur. Root renderer+CLI19/19 ve ayrı denetçi renderer14+draft17+planner16+CLI5 =52/52 taze geçti.

Son frozen kodla ayrı denetçi **218 adversarial negatif /3 pozitif**, hook0; ayrıca12 kapalı-invalid CLI çağrısı /3 pozitif actual çıktı geçti. Rehash edilen key/prime/pair/scope/purpose/source/onay, malformed DTO/bütçe/argument ve kaynak hook'ları HTML üretmedi. Bu bounded kapsamda kalan P1/P2 bulunmadı; genel güvenlik veya pedagojik sertifika değildir. Source/meta hash'leri izin veya kimlik yetkisi değildir.

## Gerçek Emitted HTML ve Native Akış

Root actual `node tools/grade6_reference_authoring_plan.mjs --factor-html` çıktısını yalnız bellekte, ayrı loopback static QA sunucusuna verdi; CLI trailing newline dışında canonical HTML değişmedi. Son HTML **12.567 bayt**, SHA `7a3b44acc19ef7365cae5f372e3a3a915dbbc456c66debbd2a55b0a285b80ca7`; manifest **1.633 bayt**. Önceki kaynak/task/draft SHA'ları değişmedi. Sabit HTML dışında route/API/DB/öğrenci profili veya dosya okuma seçeneği eklenmedi; QA sunucusu repo ürünü değildir.

Kurulu native Chrome, mevcut Playwright CommonJS girişi ve ayrı owned headless profil kullanıldı. Desktop1440×1000 /mobile390×844 touch-emulation; dar ek320×844. Kullanıcının Chrome hesabı ve eski önizleme sekmeleri değişmedi. Native tabloların bütün literal hücreleri, rozetleri ve toplamları bağımsız elle yazılmış beklentilerle karşılaştırıldı; dört tablonun toplamları6/5/5/10, kare çift satırı yalnız B'de eksik, yanlış 1/tekrarlı asal rozetler aynen görünür. Renderer yanlış seçenekleri otomatik düzeltmez.

Başlangıçta çözüm kapalı ve Pano C yanıt bölümü görünmez; kartlar tarafsızdır. Mouse ile aç/kapat, Tab/Shift+Tab ile gerçek SUMMARY focus, Enter/Space ile tersinir tam döngü geçti. Mobil tap ile aç/kapat geçti. Açık çözümde hedef, verilen36'nın anlamı, yol, neden, geçerlilik koşulları, üç gerekçe–sonuç–anlam adımı, kısa yol sınırı,1 aktarımı ve yanlış pano koşulları ayrı görüntülendi. Reload çözümü tekrar kapattı. Bu HTML bütün yanıtı içerdiği için kapalı görünüm sınav cevabı güvenliği değildir.

Native normal input keşfi **30.529 saniye /610 döngü**: Space iki yön, Tab/ShiftTab, küçük ileri/geri wheel; ardından çift click ve reload. Yeni script/model/API veya stok artışı yok. Source metadata ve örtük learning analytics değişmedi. Bu sayımlar öğrenci öğrenme/bilişsel kapasite/psikometri verisi değildir.

## Görsel ve Ağ Kanıtı

Desktop,390 ve320 genişlikte document scrollWidth viewport'a eşit; tablo hücrelerinde scrollWidth>clientWidth gözlenmedi. Gövde ve tablo sayıları native computed **18px**. Desktop kart genişliği566px;390'da358px,320'de288px. Mobil tablo başlıkları doğal satır kırar; sayılar ve rozetler taşmaz. SUMMARY touch bölgesi390'da356×93.594px; desktop1150×68.797px. Native sütun/satır başlığı scope değerleri12col/19row olarak gözlendi.

İlk mobil viewport editör başlığı/sayı/kapsam ve pending uyarısını gösterir; görev, tablolar ve çözüm aşağı kaydırılarak incelenir. Bütün görev/çözümün ilk viewport'a sığdığı veya çocuk için hazır home/landing olduğu iddia edilmez. Tablo, üç adım, kısa yol/aktarım, yanıt ve footer bölgeleri ayrı görüldü. Kararlı görüntülerde görünür yatay taşma, bölge içi clipping, üst üste binme, hücre bozulması veya okunamayan sayı bulunmadı. Kontrast/AX/ekran okuyucu, fiziksel telefon/tablet veya premium tasarım kabulü değildir; uzman/öğrenci incelemesi açık.

İlk wheel'in hemen ardından bir ekran görüntüsünün üst bölgesi geçici boş çıktı. Systematic-debugging ile aynı frozen HTML/DOM geometrisi kontrol edildi; yalnız iki animation frame sonrasında yeniden çekilen görüntü tam içeriği gösterdi. Kod/CSS veya kabul kapısı değiştirilmedi. Sorunlu kare final görsel tanığa eklenmedi; headless capture/paint zamanlaması gözlemi bütün gerçek cihazlarda sorunsuz kaydırma garantisi değildir.

İlk desktop event listener'ı, REPL'de yeniden atanan log listesiyle birleşik final ağ sayımını tam toplamıyordu. Bu gözlem ürün/ağ yokluğu kanıtı yapılmadı. Ayrı sabit log nesnesi ve iki yeni native sayfa ile kontrol tekrarlandı: **4 request /4 response**, tamamı aynı local document için GET/200; pageerror0. Bu dört tanık bütün eski oturumların toplamı değildir. Final static sunucu toplam8GET/0ret gözledi; aç/kapat sırasında dış asset/script/API çağrısı gözlenmedi. Renderer ve HTML ayrıca dış font/image/media/script/connect içermez; bu browser profili genel OS/ağ izolasyonu sertifikası değildir.

## Temizleme ve Özel Görüntü Bütünlüğü

Footer prose netleşmeden açılan ilk static QA sunucusu bir exploratory GET sonrası SIGINT/exit0 ile kapandı; son kabulde kullanılmadı. Final sunucu son frozen HTML ile ayrı açıldı,8GET sonrası SIGINT/exit0/serverStoppedtrue. Browser iki context ve bağlantı/server explicit kapandı; exact owned browser ve iki server PID kontrolü exit1/empty ile süreç yokluğunu gösterdi. Browser exit-event null kaldığı için browser exit0 iddiası yok. Başka süreç/hesap/sekme değiştirilmedi.

Toplam18 özel JPEG **1.311.946 bayt**; bir transient kare34.159bayt final görsel kanıttan çıkarıldı. Final17 kare **1.277.787 bayt**. Görüntüler native incelendi; Git'e ham medya veya özel mutlak çıktı yolu alınmadı.

| Final dosya | Bayt | SHA-256 |
| --- | ---: | --- |
| desktop-initial.jpg | 153698 | 59ad08e1411a2811162a879d5d5e6510fb4e763d6aee0d75352222ebf96f2962 |
| desktop-boards.jpg | 97201 | 812733a4d201c1a6a8b693eb0e422c2abdea485b5c9eeff7b55091e82f955bc3 |
| desktop-reasoning-open.jpg | 88493 | b05be7c477a4895633c1b592b013de3b2e9dd6e3df52aa02fc10638864a34696 |
| desktop-reasoning-context-stable.jpg | 128860 | 88036e44c1c11526b03ae5e7a46911a6b0870b408147150c0e63c1ab68e5e76b |
| desktop-reasoning-steps.jpg | 129496 | 00208b909ea1e261f70ccd94c156f68ab5e0114cb6cd6f849d948a20e5df62cd |
| desktop-transfer-answer.jpg | 140985 | 49f6410ef28bee7d8f2593bc93cf34b362ff782e61300e6a42781b6dd93fe236 |
| mobile-initial.jpg | 72076 | 19b70e9e82558cee0931fc01bccecbd734a342a8a0651b438f93a6f4b74ac5e2 |
| mobile-board-a.jpg | 34085 | a3159dc81dc78613affa5665d154f317f2b6841453a01d033c7a386f84dc44d3 |
| mobile-board-b.jpg | 31837 | 2d5e2e4e7328cea16e7d13548d4ffe46f06401e4e8e0792d2d6e2ab6c3faeaf0 |
| mobile-board-c.jpg | 33046 | 550e91bb6531347454f3ec8b4200df4dd650616be209cb61ed668923225f1e1c |
| mobile-board-d.jpg | 31413 | db846cf1dad4a5f9d6044ada8636e410e1724497643c5b6f442fefe796fc3217 |
| mobile-reasoning-open.jpg | 63978 | e48d7f6b09427eb0474aad449c9c4303cfa0c699b39a6435d04c3c104f378a2f |
| mobile-reasoning-steps.jpg | 62643 | b508dde9297d8cc6327b2bae60e3008f434fdd38cc5debd602f5d87d1f450bb4 |
| mobile-shortcut-transfer.jpg | 64309 | 6ef9e9d94adc838daf9334b8d97b6478b2bf1819b0d92e20f63ac914045c8842 |
| mobile-answer.jpg | 57839 | 44d2d8760794805bcf4244fd199deb2e4aa6697577289d10847f1d397cb544a3 |
| mobile-narrow-board.jpg | 31617 | 6d1d06606ad156a9026d991f4cc3907136cbc4eff83f92fc1bde51153ab2f837 |
| mobile-footer.jpg | 56211 | c2d2b034e07fdd3c63846e904395079af90fb207f197d5eb6cd4e64d1a518e1a |

## Final Test ve Açık Kapılar

Son frozen kodla root trusted Sharp/real-media opt-in full suite: **1109/1109 PASS, fail0/skip0/cancel0/todo0, exit0,18.299s**. Önceki1094'e renderer14 +CLI1 =15 eklendi. Native browser, probe, source web ve JPEG tanıkları suite test sayısına katılmaz. DAMA/CMMI/SPICE faz kaydı sertifikasyon, pedagojik geçerlik veya MEB onayı değildir.

Bu faz **1 mevcut taslağın HTML sunumu /0 yeni soru /0 uzman kabulü /0 yayın**. PNG/SVG üretimi, ses/video, genel medya renderer/adaptation, learning analytics, gerçek auth/tenant veya öğrenci kanalına bağlanmadı. Tek taslak için temsil ve açıklama bağlantısı artık somut native kanıtlı; altı uzman kapısı, bütün arşiv özgünlüğü, etkin program ve haklar ayrı pending kalır. [Resmî kaynak öncelik kontrolü](SOURCE_SCOPE_PRIORITY_CHECK_2026-10-04.md), genel TYMM kohortu ile ders–sınıf–yıl kararlarını eşitlememe sınırını ekler; yerel yeni kaynak/Drive edinimi yoktur.

36.000, tam anlamsal müfredat ve genel sesli kalem-video seri üretimi tamamlanmadı. **4 Ekim 08:00 Europe/Istanbul** gece durdurma/sabah raporu sınırı korunur.
