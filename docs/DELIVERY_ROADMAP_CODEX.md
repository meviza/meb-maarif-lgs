# Teslim Yol Haritası — Kontrollü K-12 Genişleme

Bu yol haritası tarihe bağlı satış veya yayın taahhüdü değildir. Her faz, aşağıdaki kabul kanıtları olmadan sonraki faza geçmez.

| Faz | Hedef | Bitti sayılması için |
| --- | --- | --- |
| 0 — Gerçeklik kaydı | Mevcut prototipi ve iddiaları ayırmak | Baseline, kaynak/hak politikası, ayrı worktree ve kalite kapıları kaydedildi |
| 1 — Kanonik müfredat | 1–8 program kayıtlarının sürümlü modeli | `curriculum_registry`, yıllık takvim, ders/tema/çıktı haritası ve kaynak denetimi |
| 2 — İçerik sözleşmesi | Soru/etkinlik/görsel/rubrik şeması | TDD ile doğrulanan sözleşme, hak kaydı ve örnek blueprint |
| 3 — Tasarım sistemi | Tek platform hissi ve çocuk/kurum dengesi | Rol ayrımı; sınavda MEB kitapçığına yakın beyaz, okunaklı düzen; öğrenme/kurum ekranlarında kendi görevine uygun tasarım ve erişilebilirlik |
| 4 — İlk dikey dilim | Tek sınıf–ders–tema uçtan uca | Öğrenci, öğretmen ve veli akışı; insan onaylı içerik; cihaz/erişilebilirlik testi |
| 5 — İçerik fabrikası pilotu | Güvenli ölçeklenebilir üretim | Jeneratör + deterministik test + Jev/Clef karar pilotu + uzman inceleme + küçük psikometri |
| 6 — 1–4 genişlemesi | Görsel/işitsel ve erken okuryazarlık desteği | Yaş düzeyi testi, alternatifler, sınıf bazlı kapsam ve öğretmen pilotu |
| 7 — 5–8/LGS | Ortaokul kapsamı ve yıllık LGS sürümü | Güncel program/kılavuz sürümü, açık uçlu + çoktan seçmeli denge, LGS format doğrulaması |
| 8 — Okul rolleri ve analitik | Öğretmen/veli/idare deneyimleri | Rol/yetki, KVKK tasarımı, açıklanabilir öneri ve denetim kayıtları |
| 9 — Mobil ve okul pilotu | iOS/Android ve gerçek okul bağlamı | Fiziksel cihaz, düşük ağ, bildirim, geri yükleme, destek ve pilot kanıtı |
| 10 — Bölgesel genişleme | Türkiye dışı yerelleştirme | Ayrı müfredat/hak/mahremiyet modeli; Türkçe içeriği kopyalamadan ülke bazlı süreç |

## Önceliklendirme kuralları

4 Ekim 2026 son kullanıcı onayı: 1–2 sınıfta 10, 3–4 sınıfta 15, 5–7 sınıfta 20 ve 8. sınıfta 90 soru; toplam 200 taslaklık [notlu kitapçık / rol bazlı okul portalı dikey dilimi](SCHOOL_PORTAL_PILOT_2026-10-04.md). Bu yerel sentetik çalışma, yukarıdaki 4/6/7/8/9. fazları tamamlandı yapmaz. Sonraki kapı içerik zorluğu ve öğretmen kabulü, erken yaş etkinlik biçimi ve gerçek pilot güvenliğidir; canlı okul veya 36.000 yayın ilan edilmez.

4 Ekim 2026 kullanıcı düzeltmesi: Eski 54 soruluk yeşil Fen Atölyesi reddedildi ve kaldırıldı. [Yeniden kuruluş kararı](SCIENCE_BOOKLET_RESET_2026-10-04.md) bundan sonraki Fen yazarlığı ve öğrenci UI'si için bağlayıcıdır. Sıradaki dilim yeni kitabın gerçek öğrenci akışı ve bütün soru/şekil incelemesidir; ardından aynı kabul kapılarıyla 450 hedefine devam edilir. Önceki yeşil test sayıları yeni öğrenci kabulü değildir.

1. Bir öğrenci veya öğretmenin gerçek akışını doğrulamayan gösterişli dashboard, içerik doğruluğunun önüne geçmez.
2. Birkaç doğrulanmış içerik, binlerce taslak içerikten değerlidir.
3. 4 ve 8. sınıf için güncel program/uygulama kapsamı her akademik yıl tekrar doğrulanır.
4. LGS deneme modu yalnızca ilgili yılın resmî kılavuzuna sürümlü olarak bağlanır. 2026 formatı iki oturumda 90 çoktan seçmeli soruydu; bunu gelecek yıllar için sabit varsaymayız. [2026 MEB LGS kılavuzu](https://www.meb.gov.tr/meb_iys_dosyalar/2026_03/23190605_LGS_BaYvuru_ve_Uygulama_Kilavuzu_2026.pdf)
5. Harici skill, model ağırlığı veya eklenti; kaynak/sürüm, lisans, gizlilik ve güvenlik kapısı geçmeden kurulmaz.

## 3 Ekim 2026 yeniden bazlama

İlk sözleşmeler, kaynak/program kayıt modeli, yayın/varlık ve senkronizasyon kapıları artık kodda bulunuyor. Bunlar çalışan çok-kiracılı backend, gerçek PostgreSQL entegrasyonu veya uzman onaylı içerik değildir. Sadece sözleşme zincirini büyütmek yerine, kaynak arşivi + üretim pilotu + gözle görülen inceleme akışı birlikte ilerletilir.

Güncel ayrıntılı plan: [PLATFORM_REBASE_PLAN_2026-10-03.md](PLATFORM_REBASE_PLAN_2026-10-03.md). Kanıtlar: kaynak arşivi raporu, içerik fabrikası pilot raporu, manifesto denetimi ve oturum teslim raporu.

| İş paketi | Mevcut aşama | Bir sonraki kabul kapısı |
| --- | --- | --- |
| Resmî kaynaklar | Sınırlı referans arşivi ve hash'li kayıt | Tüm sınıf/ders/program kapsamı; PDF sayfa/öğrenme çıktısı ayrıştırması ve alan uzmanı eşlemesi |
| 36.000 soru hedefi | Aşağıdan yukarıya kapsam bütçesi; henüz tamamlanmış banka yok | Mikrobeceri hücreleri toplamı 36.000; eksik ders ve kazanım sıfır; her hücrede gerçek çeşitlilik |
| Üretim | Özgün bahçe sorusu ortak kalem/çözüm kaynağına bağlı; tek görselli Clef hazırlığı ve negatif güvenlik testleri var; canlı Clef token alanı boş, dış istek 0; üretici LLM çağrılmadı | Yeni tokenla tek danışma çağrısı; sonra üretici + bağımsız çözüm + görsel + alan/ölçme/dil-hak incelemesinden geçen ilk 100 |
| Konu anlatımı / çözüm | Gerçek 36,375 s sesli kalem MP4 ve ayrı çevre–alan dersi; 47,76 s ders sesi, iki özgün şekil ve iki kontrol sorusu; kısmi müfredat adayları | Uzman/yaş düzeyi, tam konuşma-sayı-birim ve kelime–kalem ölçümü; mini ders animasyon videosu henüz yok |
| Gerekçeli öğretim revizyonu | Aynı bahçe sorusunda dokuz aşamalı yeni metin/kalem editör önizlemesi: hedef → veri → yol → ara sonuç/anlam → kontrol → eşdeğer pratik yol; 9 m ve 27 m ayrı; eski ses değiştirilmedi | Yeni metnin alan/dil kabulü → yeni ses cue'ları/altyazı/MP4 → kelime–kalem ve dinleyici ölçümü; [gerekçeli pilot kanıtı](REASONED_TEACHING_PILOT_2026-10-03.md) |
| Gerekçeli fabrika bağlantısı | Ortak trace + altı dikdörtgen ailesi/sabit bahçe adaptörü + ayrı kavram dersi normal CLI'ye bağlı; taze 100 adaydan 12 taslak, 88 çeşitlilik reddi, 0 yayın | Tüm dersler için alan adaptörü, gerçek kaynak resolver, yaş/kazanım/transfer kabulü ve yeni ses/video otomasyonu; [güncel durum](REASONED_FACTORY_STATUS_2026-10-03.md) |
| Türkçe öğretmen sesi | B+C korunuyor; ilk altı-cue Charon çözümü ve ayrı Sulafat mini ders sesi teknik doğrulandı; önceki seslere genel olumlu geri bildirim var, bu yeni pilotun dinleme kabulü bekliyor; ses üretimi tarayıcıdan yarı otomatik | Dinleme tercihi + hak/sayı/birim/karakter kabulü; [persona planı](TEACHER_PERSONA_PLAN_2026-10-03.md), kelime–kalem ölçümü ve ayrı API TTS otomasyonu; [uçtan uca pilot kanıtı](TEACHING_FACTORY_E2E_PILOT_2026-10-03.md) |
| İçerik Atölyesi | Yerel, salt-okunur inceleme prototipi | Kimlik/yetki ve kalıcı işlem kaydı; editör → uzman → yayıncı görev akışı |
| Okul backend'i | Mimari ve sözleşmeler; öğrenci verisi kapalı | Gerçek DB migrasyon/tenant izolasyonu/iş kotası/geri yükleme entegrasyon testleri |
| Analitik | Ölçülebilir öğrenme kanıtı tasarımı | Açıklanabilir beceri ölçümü ve psikometri; çocukları zekâ/meslek etiketleriyle sıralamama |
| Flutter | Bilinçli olarak sonraki mobil faz | SDK için depolama kararı; backend dikey dilimi; fiziksel Android/iOS telefon-tablet kanıtı |

Kaynak indirme ve içerik taslaklarının proje Drive klasörüne aktarımı kullanıcı tarafından yetkilendirildi. Öğrenci verisi veya kimlik bilgisinin Drive/model sağlayıcısına aktarımı bu kapsamda değildir. Canlı model çağrısında yapılandırılmış kimlik ve açık iş başına bütçe gerekir; yapılandırılmamış model başarılı sayılmaz.

Önceki yerel pilot: [sesli kalem çözümü + ayrı mini ders raporu](TEACHING_FACTORY_E2E_PILOT_2026-10-03.md). Önceki ek teslim: [gerekçeli metin/kalem önizlemesi](REASONED_TEACHING_PILOT_2026-10-03.md). Son teslim: [gerekçeli fabrika bağlantısı ve konu bazlı durum kaydı](REASONED_FACTORY_STATUS_2026-10-03.md); yeni ses veya MP4 değildir. Ham hesap ekranları, sesler/video, yerel tarayıcı görüntüsü ve yerel yol içeren manifestler kamu GitHub deposuna alınmadı. Güncel teknik test kapısı: gerçek medya opt-in'i ve güvenilir Sharp ile 561/561, 0 skip; bu pedagojik kabul veya üretim yayını değildir.

Bir sonraki paralel işler: aktif müfredat/kapsam hücreleri; yeni gerekçeli ses–kalem pilotu; gerçek sentetik PostgreSQL/tenant dikey dilimi. Ardından kalıcı öğrenci defteri/öğretmen/veli analitik akışı ve bütçeli worker kabulü. Sadece yeni sözleşmeler eklemek gerçek DB, otomatik medya veya 36.000 soruluk kapsam yerine geçmez.

## 3 Ekim gece ek ilerlemesi

[Gece kanıt kaydı](OVERNIGHT_PROGRESS_2026-10-03.md): normal fabrika çıktısına kaynak-bağlı medya işi/ses isteği hazırlığı eklendi; yeni ses/video hâlâ yok. Gerçek, izole PostgreSQL 16 üzerinde iki sentetik okul için 22 davranış tanığı ana ajan tarafından yeniden doğrulandı; HTTP auth/resolver/üretim driver'ı değildir. Güncel tam test **586/586, 0 fail, 0 skip**; SQL opt-in deneyi ayrıca çalıştırıldı. Önceki 561 ve DB yok ifadeleri yukarıdaki tarihsel teslimi anlatır.

[5. sınıf matematik kapsam taslağı](GRADE5_MATH_COVERAGE_DRAFT_2026-10-03.md) sayı/konu/alt beceri ayrımını ve mevcut çevre–alan pilotunun eksiklerini kaynak sayfalarıyla kaydeder; tam 1–8 eşlemesi veya uzman kabulü değildir. Sıradaki çalışma; eksik gerçek soru aileleri, kaynak geometri + genel medya renderer, uygulama DB adapter'ı ve gerçek kayda bağlı defter/analitik akışıdır. Yeni sözleşmelerin sayısı ilerleme metriği yapılmaz. Gece devamı ve 4 Ekim 08:00 Türkiye saati raporu planlandı; dış hizmet/insan/yayın kapıları değişmedi.

## 3 Ekim kaynak kapsamı öncelik güncellemesi

Yalnız programlar değil, **program + ders/konu anlatımı + etkinlik/çalışma + soru bankası + çıkmış soru/çözüm arşivi** ayrı ayrı toplanır. [Kaynak ve soru kapsamı kabul ölçütleri](SOURCE_COVERAGE_ACCEPTANCE_2026-10-03.md) beklenen kaynak/çıktı/mikro beceri/amaç/varyant paydalarını, açık eksikleri ve birbirinden ayrı tamlık kapılarını tanımlar. Mevcut blueprint'te ayrı süreç-bileşeni ve pedagojik amaç kimliği hâlâ geliştirme gereksinimidir; belge yazılması bu kod kapısını tamamlamaz.

Gerçek edinim **44 yerel PDF**ye çıktı; ek 10 PDF, MEB çalışma/test/fasikül ve TÜBİTAK soru–çözüm çiftlerini de içeriyor. Canlı katalog yürüyüşü 8 sayfa/143 kayıt; 117 backend sınıf ataması tam 1–8 materyal kapsamı değildir. Kaynak semantiği/etkin yıl, 4/8 fallback, büyük kitaplar ve bütün soru-bankası serileri açık. Yeni 10 dosyanın 4'ü özel Drive arşivinde metaveri readback ile doğrulandı, 6 aktarım bekliyor; uzak checksum doğrulanmadı. Güncel ana ajan tam test **607/607, 0 fail, 0 skip**. Ham referanslar, katalog snapshot ve aktarım makbuzları kamu GitHub'a alınmaz. Önce kaynak paydası/parçalar/çıktı eşlemesi, sonra özgün banka kapsama testleri; büyük soru toplamı bu sırayı değiştirmez.

## 4 Ekim Sabah Öncesi Teknik Checkpoint: Faz 17

Yukarıdaki sayaçlar kendi teslimlerinin tarihsel kanıtıdır. [Gece kaydı](OVERNIGHT_PROGRESS_2026-10-03.md) Faz14–17'nin mevcut kaynak/tek özgün ortak-ilişki taslağı/gerekçeli görünüm/gerçek narration işi ve özel current-cue scene zincirini ayırır. Son tam yerel test **1214/1214, fail/skip0**; bağımsız denetim ve native bulgu sonrası minimal düzeltme yapıldı. Test sayısı pedagojik kabul, CMMI/SPICE derecesi veya 36.000 ürün sorusu değildir.

| İş Paketi | Yeni Dar Kanıt | Sonraki Gerçek Kapı |
| --- | --- | --- |
| Kaynak semantiği | İngilizce mevcut program562/563 ve workbook7/10; program dinleme/izleme, materyal statik eşleştirme/konuşma modalitesi ayrı; resmî activity-output bağı null. | Bütün derslerin etkin program/yıl/okul profili; konuşma/söz varlığı ve dinleme uyaranı; tam çıktı/mikrobeceri/aile paydaları; kaynak ve ürün hakları. |
| Gerekçeli medya | Tek mevcut taslak için2live narration job→özel canonical scene;20cue/47captionpage; kaynak nicelik/birim ve reveal gate;0yeni soru. | Anlatımdaki tekrarları insan üslubuyla düzeltme; yeni birim atomları; genel domain/factory entegrasyonu ve öğretmen/yaş/semantik kabulü. |
| Mobil sunum | Son SVG57sayfa/1151glyph kutusu canvas içinde; desktop Chrome ve390/320 emülasyon, fiziksel telefon/tablet testi değil. İç kaynak kaydırma ve kontroller çalışıyor. | Caption hâlâ görselle yatay kayıyor: metin paneli görselden ayrılmalı; gerçek cihaz, screenreader, hareket ve çocuk kullanım kabulü. Premium/mobile ready değildir. |
| Kalite / veri | Source key-byte bütçe P2 ve sayıyı örten stroke native bug'ı, gerçek RED→minimal fix→bağımsız tekrar ile kapandı. | App auth/tenant/retention/restore ve gerçek yetkili veri lifecycle resolver; sentetik SQL tanığı gerçek okul işletimi değildir. |
| Ses / video | Eski sesli pilot korunur; yeni sahne yalnız SVG/current-caption ve programmatik vurgu. | Kabul edilen yeni anlatıma gerçek TTS/cue/ses baytları, dinleyici ve kelime–kalem ölçümü, oynatılabilir yeni MP4; seri üretim ve kullanım hakları. |

[Root current-cue kanıtı](GRADE6_COMMON_RELATIONS_SCENE_ROOT_ACCEPTANCE_2026-10-04.md) hangi native durumların görüldüğünü ve hangi UX/semantik kapıların açık olduğunu kaydeder. Yeni PDF/Drive/cloud/model/credential veya yayın işlemi yapılmadı. Clef danışma katmanı, üretici veya TTS modeli değildir; eski açıklanmamış/eksik credential ve canlı maliyet kapıları aşılmadı. Sabah raporu tam soru bankası veya üretim tamamlığı ilan etmeyecek; açık işler ve sıradaki küçük doğrulanabilir dilim verilecektir.

## 4 Ekim Sabah Öncesi Teknik Checkpoint: Faz 18

Faz17'deki mobil caption ve anlatım tekrarı borçları dar editör diliminde giderildi; tarihsel yukarıdaki bulgular silinmedi. [Root responsive kanıtı](GRADE6_COMMON_RELATIONS_RESPONSIVE_ROOT_ACCEPTANCE_2026-10-04.md):49currentpage, gerçek API–CLI HTML parity;177native DOM sayfası/1440–390–320, bağımsız caption/given geometry/table; normal wheel/keyboard/tap/details/reload. Root tam test **1228/1228, fail/skip0**; bağımsız143/143 +negatif sınırlar. Yeni soru, kabul, yayın, ses veya MP4 yok.

| İş Paketi | Yeni Dar Durum | Açık Kabul Kapısı |
| --- | --- | --- |
| Anlatım | Value+meaning kaynaklı sayısal tekrar kaldırıldı;2result değişti,18cue/path/transfer/birim/source/task korunur. | İnsan üslubu/alan/yaş incelemesi; yeni birim atomu/semantic anchor ve onaylı TTS/kelime–kalem. |
| Responsive editör | SVG yatay bölge, doğal18px HTML caption dışında; gerçek semantic verilen tablosu; görünür scrollhint, focusable source/table, actualcurrent-only fallback. | Uygulama paging/progress/rol resolver; fiziksel cihaz, screenreader/AX ve çocuk kullanım testi; öğrenci ana sayfa/premium tasarım ayrı. |
| Medya/fabrika | Aynı1taslağın yeni bağlanmış editör review'u ve kapalıdefaultCLI; live brand/answer lock/trace/job/PDFmetadata lineage sınırları korunur. | Genel domain resolver/factory ve yetkili defter/öğrenme kaydı; genericnumeric0 hâlâ semantik aritmetik onayı değildir. |
| Kaynak/işletim | Bu fazda edinim/Drive/provider/gerçek öğrenci/ücretli cloud0; eski veri/hak paydaları açık. |54büyük kitap/87aylık ve ders bazlı etkin kararlar; tam çıktı/mikrobeceri/aile/rights/uzman,tenant/auth/retention/restore;36.000 ve genel video seri üretimi. |

Bu kontrol, CMMI/SPICE sertifikası veya DAMA kurumsal olgunluk derecesi değildir. Gece döngüsü4Ekim08:00 Europe/Istanbul'da durur; sabah raporu tamamlanmış teknik dilimleri ve gerçek kaynak/üretim/uzman/altyapı boşluklarını birlikte sunar.

## 4 Ekim Sabah Hazırlığı: Faz19 Kaynak Ve Mühendislik Yeniden Kontrolü

[Sabah hazırlık raporu](MORNING_REPORT_2026-10-04.md) teknik geçiş/uzman/yayın/işletimi ayrı gösterir. Yeni uygulama kodu veya içerik stok artışı0; üç paralel readonly audit ve root tekrar tanıkları kullanıldı. Root taze tam test1228/1228, fail/skip0, exit0; test sayısı yeni soru sayısı değildir.

| İş Paketi | Taze Sonuç | Öncelikli Açık Kapı |
|---|---|---|
| Kaynak/Drive | Yerel50 fizikselPDF/49SHA tam hash eşliği; Drive49ad-boyut-parent-private-owner metaveri eşliği; remote raw/hash0. |54büyük kitap/87aylık, resmî ders/çıktı/mikrobeceri/aile/temsil paydaları; etkin program/okul profili; hak ve gerektiğinde bounded remote readback/restore. |
| Ders-sürüm kararı | DKAB2026 değişiklik takvimi iki resmî gövdede aynı; İngilizce olağan45/çoklu46 ve okul izin kohortu ayrı. |4/8 etkin dosya/kitap, hedef okulun profile/izin/yıl bağı;2026/70madde21/22/29 için yetkili okul/mevzuat incelemesi. |
| Genel fabrika | Normal100aday→12draft/88ret/6aile; common özel review çalışıyor, normal resolver hâlâ unsupported. |Tek aileyi normal kapalı domain dispatch'e bağlayan negatif test; trusted review-store ve gerçek learner delivery ayrı. |
| Ses/video | Önceki sesli pilot tarihsel; yeni reasoned common audio/video0. |Aynı yeni metnin küçük yetkili TTS, dinleme/sayı-birim/kelime–kalem ve gerçek playable/decode kabulü; genel serial factory açık. |
| Okul backend | Önceki actual synthetic SQL→HTTP→UI ve receipt-bound dar kayıtlar; yeniDB0. |Server-ownedidentity/tenant, prod wire-driver, retention/kota/restore/yük ve gerçek kurum kararı; gerçek çocuk kapalı. |
| Docker | Kullanıcının250USD applied/no-sandbox ekranı özel hash'li kopya ve küçük safe notla saklandı; spend0. |Güncel kredi/limit/aşım/fiyat ve açık iş bütçesi; önce tek sentetik ölçüm, üretim/on-prem kararı değil. |

Üç sonraki dikey dilim: **kaynaklı özgün paketi normal fabrikaya bağlamak**, **yeni gerekçeli tek sesli çözümü doğrulamak**, **sentetik dar okul identity/DB/lifecycle pilotunu işletim tanığına taşımak**. Uzman/hak/hesap bütçesi/gerçek çocuk/üretim ve okul mevzuatı kapıları teknik kod ilerlemesiyle kendiliğinden açılmaz.08:00 gece sınırı korunur; erken hazırlık snapshot'ı durdurma gerçekleşti iddiası değildir.

## 4 Ekim Sabah Sonrası: İlk Kapalı Fabrika Domain'i

Kullanıcının yeni devam talebiyle, sabah tesliminin `6d82979` checkpoint'i üzerine [ortak-ilişki fabrika dilimi](GRADE6_COMMON_RELATIONS_FACTORY_ROOT_ACCEPTANCE_2026-10-04.md) uygulandı. Gece ve tek seferlik sabah takipleri yeniden başlatılmadı. Önceki sayı/durumlar tarihsel checkpoint olarak korunur.

Normal aracın kapalı `--domain grade6_common_relations` girişi gerçek canonical draft→verifier→iki trace/job/request→özel scene→current başlangıç görünümünü tüketir. Üç küçük editör dosyasında exclusive yazım,0700/0600 izin ve tamamlanan kümede disk readback/hash uygulanır. Normal rectangle/count/metadata consumer gövdesi değişmedi; gerçek100aday→12taslak/88ret korunur. Root taze tam test1258/1258, fail/skip0; soru sayısı değildir.

Bu dilim yalnız **bir mevcut taslak/iki anlatım işi** için teknik bağlantıdır; generic resolver desteği, yeni kabul/yayın, öğrenci rol/teslimi, yeni TTS veya MP4 sağlamaz. Altı uzman kapısı pending; aktif okul/yıl ve DAMA owner/steward/access/retention kararları ayrıca gerekir. Sıradaki medya işi [ayrı çift-job/voice ve gerçek byte–kelime–kalem planı](NEXT_REASONED_VIDEO_ACCEPTANCE_2026-10-04.md); önce eski garden sesini yeni common metin diye yeniden etiketlemeyen saf bridge, sonra açık yetkili/bütçeli gerçek ses ve decode/dinleme kabulüdür. Kaynak blueprint'i, trusted review-store ve sentetik okul işletim kabulü de açık kalır.

## 4 Ekim Sabah Sonrası: Saf Görsel–Ses Köprüsü Ve Current Cue

`6172682` üzerine [saf bridge/current consumer teknik dilimi](GRADE6_COMMON_RELATIONS_VOICE_BRIDGE_ROOT_ACCEPTANCE_2026-10-04.md) eklendi. Gerçek normal-factory API'nin kanonik görsel packet'i değiştirilmeden ayrı provider/style beyanlı ses job/request bağlanır; bütün10cue/source/trace/anchor/durak ve farklı revision hash'leri denetlenir. Güncel scene tüketicisi yalnız bir tam cue ister; protected cevabı revealtrue ve progress1 olmadan sese açmaz. Request kimliği caption sayfasından bağımsızdır, gerçek playback/idempotency değildir.

İlk1290 sonrası bağımsız iki P2 (style/provider metadata'da bilinen cue referansı ve shallow-frozen request iç mutasyonu), ayrı RED→GREEN ile düzeltildi. Dar20cue literal metin/tekilSHA guard'ı ve recursive deep freeze eklendi; genel fragment/rephrase/encoding/privacy sınıflandırması hâlâ pending. Final root taze tam1295/1295, fail/skip/cancel/todo0; postrepair280 gerçek current durumunda56locked/224open ve20 request kimliği. Altı eski leaf/CLI ile altı kaynak metadata byte-identical. Bir mevcut görev/iki bağlam korunur; yeni soru, uzman kabulü, yayın, canlı TTS/ses/MP4 veya yeni DB0. DAMA yaşam döngüsü ve28 upstream açık iş kayıpsız; CMMI/SPICE/MEB sertifikası veya tam müfredat iddiası yok.

Yeni CLI/HTTP/audio UI veya genel renderer açılmadı. Sıradaki gerçek kapı: açık izin/credential/endpoint/privacy/hak ve sınırlı çağrı/maliyet/byte/süre bütçesi olmadan transport0; yeni tek-cue sesin actual byte/decode/metin/telaffuz/dinleyici kabulü, sonra measured kelime–kalem ve common MP4. Eski garden sesi yeni anlatım diye relabel edilmez. Kaynak tamlığı/okul tenant-auth-retention-restore/öğrenci veri ve36.000 seri üretim kapıları ayrı kalır; gece/sabah takipleri yeniden başlatılmaz.

## 4 Ekim Sabah Sonrası: Kapalı TTS/PCM Ve Gerçek Fabrika Tanısı

`27cae11` üzerine [yeni root kabul kaydı](GRADE6_COMMON_RELATIONS_TTS_PCM_ROOT_ACCEPTANCE_2026-10-04.md): saf markalı tek-current TTS hazırlığı, native canonical WAV/full signed16 sample decode ve gerçek factory/current/request ile local-unattested receipt bağı. Varsayılan tanı CLI'si `not_run`; açık sentetik seçenek20 current cue/20 farklı request ve audio SHA/53 pending doğrular. Bir mevcut görev/iki context korunur; yeni authored/accepted/published0. Canlı transport/hesap/credential/çağrı veya ses/video yok.

Root final tam1336/1336, fail/skip/cancel/todo0; bağımsız yeni41/41, syntax7/7 ve ek hostile/PCM/CLI fault tanıkları. Üç gerçek düzeltme test-önce: costly sample-index enumeration, explicit no-provider-call flag, upstream pending düşüşü.120s profile full decode korunur; tek yerel ölçümde maxRSS yaklaşık71MB, ilk yaklaşık661MB historical kabul değil. Benchmark/SLA veya cloud maliyet kararı çıkarılmaz.

| Sonraki Dikey Kapı | Kalan Gerçek Gereksinim |
| --- | --- |
| Yetkili yeni ses | Scoped provider hesabı/credential/call-maliyet bütçesi; haklar/privacy/retention/style ve reşit olmayanlara yönelik hizmet şartı incelemesi. Yetişkin offline-editor/statik asset uygunluğu doğrulanmadı. Sonra gerçek tek-cue response/disk/readback/decode/dinleyici; bütün on cue ayrı kabul. |
| Yeni sesli common video | Ölçülmüş veya insan doğrulanmış word–pen → common raster/mux/MP4/native playback; eski garden sesini relabel etme yok. Bellekte tone decode, konuşma/video teslimi değildir. |
| Ürün ve veri | Tam etkin müfredat/mikrobeceri/aile/hak paydaları, uzman kabulü/36.000; DAMA owner/steward/access/retention store; gerçek tenant/auth/kota/restore; premium UI/gerçek mobil cihaz ayrı fazlar. |

Clef advisory QA kalır, bu fazda çağrılmadı. Gerçek çocuk/kurum verisi, yeni PDF/Drive/Docker/DB/cloud/SDK/skill işlemi0. TDD/audit/test raporları CMMI/SPICE hazırlık kanıtıdır, sertifika değil. Gece/sabah otomasyonları yeniden açılmadı.

## 4 Ekim Soru Önceliği: Fen Bilimleri 6–8 Ve 450 Hedefi

Kullanıcının yeni önceliği, konu anlatımı genişletmekten önce üç sınıfın görselli ve gerekçeli Fen bankasıdır. [Güncel pilot raporu](SCIENCE_678_PILOT_REPORT_2026-10-04.md), [bağımsız audit](SCIENCE_678_INDEPENDENT_AUDIT_2026-10-04.md) ve [gerçek tarayıcı tanığı](SCIENCE_678_BROWSER_EVIDENCE_2026-10-04.md) önceki sayılardan ayrı kontrol noktasıdır.

| İş Paketi | Fiilî Durum | Sonraki Kabul |
| --- | --- | --- |
| Kaynak ve çeşitlilik | 132 resmî çıktı kodlu blueprint; 27 aile / 54 taslak / 9 sınıf–alan hücresi. Pilotta 27 kod referanslı, 105 henüz örneklenmemiş. | Okulun etkin yıllık planı; çıktı–mikrobeceri–temsil–aile farkı; 450 için en az 198 ek özgün aile brief'i. |
| Soru ve cevap | Kaynak bağı, cevaptan bağımsız sonlu bilim hesabı, yanlış anahtar ve koşul negatifleri; verilenlerden SVG; neden–yol–ara anlam–kontrol–püf nokta. | Serbest Türkçe–typed claim–çözüm uyumu, alan/ölçme/yaş ve özgünlük/benzerlik incelemesi; çok zor düzeyler henüz 0. |
| JEV / Clef | 54 gerçek yerel sezgisel JEV yürütmesi; canlı TypeSafe çağrısı değil. Kullanıcının seçimi Cloudflare/Clef. Üç gerçek sorudan altı tipli karar hazırlığı ve sınırlandırılmış taşıma kodu var. | Güvenli yeni token, Free planında en fazla üç gerçek danışma isteği; response grameri ve süre tanığı. Henüz canlı Clef 0. |
| Arayüz | Gerçek loopback editör önizlemesi; sınıf/alan/zorluk, seçenek ve gerekçeli çözüm. 54 aktif SVG metninde taşma yok; 320/390 piksel sayfa genişliği tekrar doğrulandı. | Fiziksel telefon/tablet, tam AX/WCAG ve çocuk/öğretmen UX; öğrenci rolünde başka sınıf kaynakları kesin kapalı. |
| Süre ve kalite | Mevcut sabit stok yerel hazırlığı yaklaşık 89 ms, editör ayrı yaklaşık 87 ms; gerçek tam repo 1539/1539, fail/skip 0. | Gerçek üretici–bağımsız çözüm–görsel–uzman çevriminden kabul/süre ve ret oranı. Yerel sabit stok hızı 450 üretim süresi değildir. |
| Medya / DAMA / veri | Yeni Fen sesi/video/öğrenci DB kaydı 0; amaç/sürüm/kaynak/hash/kalite/erişim kaydı var. | Owner/steward/retention, kabul edilen sorunun gerçek yeni TTS/kalem/video trace'i ve yetkili sentetik öğrenme olayı. |

Her hücre için 50 hedef ve en fazla iki varyant sınırı korunur. 54 mevcut taslak 450 diye genişletilmez; kalan 396 soru görünürdür. Yazarın %10/%30/%30/%30 test hedefi resmî MEB oranı değildir; Bloom görev etiketleri öğrenci gelişim ölçümü değildir. Canlı API ve seri üretim ayrı kalır; gece/sabah otomasyonları yeniden başlatılmaz.
