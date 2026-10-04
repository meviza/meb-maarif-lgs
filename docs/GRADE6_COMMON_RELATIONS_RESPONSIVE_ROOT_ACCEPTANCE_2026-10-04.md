# Ortak İlişkiler · Responsive Current-Cue Root Kanıtı

4 Ekim 2026, Faz18. Başlangıç `cd7db9d9a9a633b04c103a670b19cea7a16185d9`; yerel/origin/gerçek ls-remote eşliği görüldü. Gemini checkout ve kullanıcının açık hesap/önizleme sekmeleri değiştirilmedi. Bu dar editör dilimi, tam öğrenci arayüzü veya platform teslimi değildir.

## Değişiklik ve Amaç

[Anlatım düzeltmesi](GRADE6_COMMON_RELATIONS_NARRATION_POLISH_EVIDENCE_2026-10-04.md), yorumlama sonucunda sayısal listeyi iki kez okumayı kaldırdı. Gerçek trace/job/subtitle/audio request yalnız bir kez 24/48 dakika veya 1/2/3/4/6/12 ortak kart boyutlarını okur; neyi anlattıkları, koşullar ve aktarım korunur. Eski kaynak/task/view değişmedi. Yeni ses üretilmedi; öğretmen üslubu, telaffuz veya dinleyici kabulü çıkarılmaz.

[Responsive review](GRADE6_COMMON_RELATIONS_RESPONSIVE_REVIEW_EVIDENCE_2026-10-04.md), gerçek live scene renderer'ın tek güncel adım/sayfasını tüketir. Kaynak SVG ayrı yatay bölgede; doğal sarılan 18px HTML caption onun dışındadır. Kanonik verilenlerin gerçek HTML tablosu, görünür kaydırma ipucu ve iki ayrı etiketli klavye odaklı bölge vardır. SVG erişilebilirlik ağacında gizlidir; tablo ve açıklama eşdeğeri korunur. Transfer için kaynakta olmayan şekil veya tablo uydurulmaz.

Exact2 `renderGrade6CommonRelationsReview(plan, options)` clone/rehashed/foreign/proxy/closed-option sınırını eski live renderer'a uygulatır. Protected response ancak explicit reveal=true ve progress=1 birlikte olduğunda açılır. Verilen geometriden matematiksel sonuç çıkarılabilir: bu anti-cheat, auth veya öğrenci erişim güvenliği değildir. Açık details yalnız güncel adımın tam metnidir, gelecekteki cue paketi değildir. `pageNavigationUiBound:false`; ilerleme/paging kontrolü uygulamaya henüz bağlanmadı.

Root CLI yalnız tek sabit `--common-relations-review` seçeneğiyle varsayılan HTML+newline verir; path/count/provider/cue/reveal/out seçenekleri yok. Eski varsayılan özet ve dokuz önceki kip korunur.

## TDD ve Doğrudan Root Tanığı

Root CLI **10PASS/1FAIL** (`invalid_grade6_reference_authoring_args`) → implementasyon → **11/11**. Yeni review missing API **0/10**, ardından **10/10**; görünür scrollhint davranışı **10PASS/1FAIL →11/11**. Adapter gerçek tekrar/birim regresyonu **14PASS/3FAIL →17/17**. Writer düzeyinde bir future-text negatif testi, canonical current plan'ın aynı cümleyi içerdiği için yanlış beklenti taşıyordu; actual current fallback eşliğine daraltıldı, üretim hatası veya ilave RED iddiası olmadı.

Root ilk eşzamanlı birleşik koşuda writer'ın henüz RED adapter'ıyla **56PASS/3FAIL** gördü; frozen kabul sayılmadı. Yeni adapter sonrası **59/59**, hint düzeltmesi sonrası dört dosyalı final **60/60 PASS**, fail/skip0, exit0. CLI future-leak guard'ının ilk cümlesi gerçek canonical metin değildi; bağımsız denetçi uyardı. Gerçek korunan resultMeaning literal'iyle güçlendirildi; bu test iyileştirmesi yeni üretim RED→fix diye sayılmadı.

Gerçek source→draft→preparation→scene→review root zinciri:

- İki context / 20cue / **49 güncel sayfa**, mevcut tek taslak; yeni soru/kabul/yayın0.
- **40 protected lock**; result/check/summary/transfer yanıtı için reveal/progress ve bir-önceki-double sınırı; details0/current-transcript hash null.
- **4 transfer cue** SVG/table0; clone/proxy2ret, hook0; frozen manifest ve byte SHA eşliği.
- Varsayılan API HTML ile actual CLI stdout **byte parity** (yalnız ek newline).
- Result tokenları literal **[24,48]** ve **[1,2,3,4,6,12]**; doğruluk generic text trace'den değil eski ayrı bağımsız modulo oracle'dan gelir.

| Pin | Gerçek Değer |
| --- | --- |
| Canonical taslak | `9c225c8f2bc97dfae1d89778cda3ff5980f0c31056330c639e5be15823d2abd7` |
| Authored task | `c20e190e87945d6a79140819490ab09e55342a5a988eae9df5a95e0054ee6aeb` |
| Yeni preparation domain | `b182247ad5799dec161d14a8e564be47ce7d75e818f033d3e3f2a47a8d802fe5` |
| Yeni scene domain | `f78086e9af4976688952053c611fdb0a25efc6b7e153e68477245367f3163891` |
| Default HTML byte SHA | `26749f591b71ac2397e4854d6d1631f4db2954dc56afbc2b17e7e2b087620686` |
| Default manifest domain | `13153bc6a20bf2db515cebed14532a7422382346ee0d02da1b73ae8cfae0a147` |

Default HTML **9.649B**, stdout9.650B; root49page maxHTML11.128B. Domain hash ile dosya/HTML byte SHA farklı sözleşmelerdir. Source-PDF baytları bu fazda yeniden kontrol edilmedi; yeni kayıt/indirme yok.

## Gerçek Native QA

Playwright becerisi, mevcut cached runtime ve kurulu Chrome; ayrı sahip olunan headless profil, loopback-only geçici QA sunucusu. Gerçek öğrenci/account/auth/üretim akışı yok. Başlamadan inventory: bağımsız caption/source scroll, literal tablolar/birimler, protected açık/kapalı/erken durumlar, transfer, details roundtrip, font/taşma, klavye ve390/320 dar ekran; iki off-happy yol source pan geri dönüşü ve details+reload kilidi.

Son donmuş HTML ile **59 görünüm ×1440/390/320 =177 gerçek DOM sayfası**. Her görünümde current-caption, bağımsız literal tablonun tüm hücreleri, protected notice/details, transfer geometry0, 18px computed font ve actual Range glyph/line kutuları incelendi. Document width eşliği1440/390/320; caption-parent taşması0. Maksimum caption satırı1/4/5. Kaynak SVG'nin görünür kaynak bölümünde **3.234 glyph kutusu**, canvas dışına0; bilerek croplanmış eski SVG-caption bu sayıya katılmadı. Verilmiş geniş kaynak ve280px semantic tablo yatay kaydırılır; kaynak çizimi tamamen viewport'a sığdı veya fiziksel cihaz/swipe kanıtlandı denmez.

Normal girdiler:

- 390 mobil emülasyonda source wheel **0→438(max)→0**; current caption'ın exact bounding rectangle'ı değişmedi. ArrowRight actual pozitif ilerleme, ArrowLeft0; Tab source→given-table→summary.
- Enter aç / Space kapat; mouse click aç-kapat; native touchscreen tap aç-kapat. Açık current-full fallback tam kanonik güncel transkriptle eşleşti.
- Erken reveal progress0,5'te kilitli; reload kilidi korunur. Transfer açık text fakat SVG/table yok.
- **32.033ms /185 döngü** normal input keşfi: dört context/state, tap roundtrip, arrows, wheel ve yedi döngüde bir reload; uncaught/pageerror/console error0.
- Taze native AX snapshot gerçek tablo/captionı içerir, gizli SVG img tekrarını içermez. Bu gerçek screenreader, WCAG veya bütün erişilebilirlik kabulü değildir.

Görsel geçiş functional testten ayrı yapıldı: final on JPEG **710.958B**, gerçekten incelendi. Eski üç baseline JPEG186.225B final sayılmadı; toplam13JPEG897.183B yalnız özel output'ta. İlk baseline'da scroll yönü yalnız ARIA'daydı ve göze gelmiyordu; görünür ipucu/IDREF ve klavye table-region fix'i yeni RED→GREEN ile uygulandı, son frozen HTML tekrar görüldü. Matematik vurgu kutuları24/48 etiketleri üstünden geçmiyor, gerekçe ile boyut/paket birimleri okunuyor; visible caption clipping veya dış kaynak hatası gözlenmedi.

İlk QA server3GET (2HTML+1case JSON) eski baseline'dır. Son server **398GET/0ret**:397HTML+1case JSON. Final native browser **397 request/397 response200**; eski iki browser HTML isteği ayrıca dışarıda bırakıldı. External request0, gerçek provider0. Static sayfa maksatlı dikey kayar; dar initial viewport editör kapsamı/kaynak/hint gösterir, güncel adım aşağıdadır. Çocuk home/oyunlaştırma/premium tasarım kabulü veya öğrenci kanalına entegrasyon sayılmaz.

İki own static server SIGINTexit0, üç browser context/browser/server explicit close ve gerçek Chrome exitCode0. Exact üç own PID yokluğu `ps` exit1/no-row ile doğrulandı. Kullanıcı profili/sekmesi/process'i veya private kaynakları temizleme/değiştirme yok.

## Bağımsız Audit ve Açık Kapılar

Salt-okunur denetçi final10suite **143/143 PASS**, fail/skip0, exit0;10validCLI/82invalid kombinasyon ve default API–CLI parity ayrıca yürüttü. **141 review +395 source/scene hostile ret**, hook0;346actual HTML72locked/44transfer/302given-table/274currentfull-fallback/200nextpage-ret/604focusable labelled region-IDREF tanığı. Float-progress matrix maxmanifest3.670B, writer49progress1page matrix3.666B: aynı kapsam diye gösterilmez.18eski cue byte-identical, sadece2result cue değişti; genuine eski branded preparation yeni canonical scene'de stale ret. Bounded kapsamda açık P1/P2 bulunmadı; genel sertifika değildir.

Root son donmuş kodla trusted cached Sharp/real-media opt-in tam suite **1228/1228 PASS**, fail/skip/cancel/todo0, exit0; **19.584079917s**. Önceki1214'e11review+2adapter+1CLI eklendi. Native/HTTP/probe/glyph sayıları test toplamına eklenmedi. TDD, systematic-debugging, Playwright ve verification becerileri uygulandı; harici skill/dependency kurulmadı.

DAMA amaç/sürüm/soybağı/hak/saklama/quality gate sınırı, CMMI/SPICE faz test–kanıt süreci korunur. Test sayısı olgunluk derecesi, MEB onayı, insan üslubu, yaş uygunluğu veya öğrenci başarı metriği değildir. Genel resolver/domain factory bu family için hâlâ unsupported, generic numericStepsChecked0; yeni static review bu sınırı yükseltmez. UI current-cue/paging gerçek uygulamaya ve kayıtlı deftere bağlanmadı. Birim atomları, narration semantic anchors, uzman/yaş/hak/etkin program, physical phone/tablet/screenreader, kelime–kalem/TTS/oynatılabilir yeni MP4 ve seri üretim açık.

Yeni PDF/Drive/Clef/TTS/video/Docker/paidcloud/credential/gerçek çocukkurum verisi/Cambridge mesajı/yayın0. Tarihsel kaynak/Drive sayıları burada fresh remote-byte kontrolü sayılmaz.54büyük kitap/87indirilmemiş aylık bağlantı,42aday hücrenin resmî ders/çıktı/mikrobeceri/aile paydası, auth/tenant/retention/restore ve CUA owner session/access review açık.36.000, tam semantik müfredat ve genel sesli kalem-video üretimi tamamlanmadı. Gece çalışma sınırı4Ekim08:00 Europe/Istanbul'dur.
