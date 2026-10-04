# Soru Odaklı Dilim: Beş Ayrı Aile, İki Yeni Özgün Taslak

## Kullanıcı Önceliği ve Gerçek Teslim

4 Ekim yeni yönlendirmesi: Konu anlatımına göre sorulara daha fazla ağırlık ver. Bu dilimde yeni mini ders yazılmadı. İki ayrı özgün soru ailesi, mevcut üç görevle gerçek kapalı JSON ve HTML editör tüketicisine bağlandı. Aynı sorunun sayılarını değiştirerek stok artırılmadı.

| Görev | Amaç | Bu dilimdeki durum |
| --- | --- | --- |
| Eksik Bilgiden Bütünü Kur | İki eksik çarpan kartından sayıya geri git; biricikliği ve kalan listenin tamlığını ayrı kontrol et | Yeni özgün taslak |
| Asal Seçimini Kaynağıyla Sırala | Her satırın asal uç değerini seç; eşitleri ve kaynaklarını sıralamada koru | Yeni özgün taslak |
| İki Kuralı Birlikte Gör | İki bölünebilme koşulunu ayrı sınayıp tek kategoriye yerleştir | Mevcut görev |
| Dört Kanıt Panosunu Denetle | Eksiksiz çift listesi, farklı asal küme ve toplamı birlikte denetle | Mevcut görev |
| Zaman mı, Paket Boyutu mu? | Ortak ilişkiyi bağlamı ve istenen birimiyle eşleştir | Mevcut görev |

Sayım: **2 yeni özgün soru taslağı + 3 mevcut görev = 5 ayrı aile**. Yeni konu anlatımı 0, yalnız sayı varyantı 0, uzman kabulü/yayın 0. İç seçenekler, satırlar, iki bağlam ve aktarım örnekleri ayrıca soru sayılmaz. Tekrar çağrı yeni stok oluşturmaz. Bu sayı bütün platformun toplamı veya 36.000 hedefinin tamamlığı değildir.

## Kaynak, Matematik ve Gerekçeler

MEB kaynaklı mevcut biçim/mikroamaç kayıtları gerçek planner üzerinden yeniden tüketildi. Yeni iki görevin kaynak briefleri 17/18, kayıtlı PDF fiziksel sayfaları 15/16; aday çıktılar sırasıyla MAT.6.1.1/MAT.6.1.3. Kaynak gövde, sayısal vektör, seçenek veya medya kopyalanmadı; arşiv benzerliği/uzman özgünlük kabulü açıktır. Bu tur yeni kaynak indirmesi veya PDF bayt incelemesi yoktur.

Inverse bağımsız oracle her 60–95 adayını ve bütün pozitif bölenlerini sınar: tek aday 84; eksik satırlar 3×28 ve 6×14. Kalan tam liste 1×84, 2×42, 4×21, 7×12; seçenek B. 60–140 aktarımında 84/126 belirsizliği korunur; bu ikinci soru değildir. [Sahip kanıtı](GRADE6_INVERSE_FACTOR_DRAFT_EVIDENCE_2026-10-04.md).

Prime oracle yazarın asal ayırma/sıralama yardımcılarından bağımsızdır. A54→3, B35→5, C28→7, D75→3, E121→11; kaynak sıralı sonuç A/D/B/C/E, seçenek B. İki ayrı 3 silinmez. Verifier kapalı kayıt karşılaştırması için yazar profilini de yeniden kurar; yalnız matematik oracle'ının bağımsızlığı iddia edilir. [Sahip kanıtı](GRADE6_PRIME_PROVENANCE_DRAFT_EVIDENCE_2026-10-04.md).

HTML, gerçek verilenleri/seçenekleri ve kaynak etiketli tabloları gösterir. İstenen → verilenin anlamı → yolun nedeni → ara karar/anlam → kesin sonuç → koşullu kısa yöntem korunur. Rastgele nesne metne çevrilmez; `[object Object]` yoktur. Çözüm panelleri ilk yüklemede kapalıdır; bu editör kolaylığıdır, öğrenci cevap güvenliği değildir.

## Gerçek Tüketici ve Sınırlar

- `createGrade6QuestionReviewBank(input)` beş sabit kanonik görevi ve bağımsız verifier sonuçlarını yeniden kurar. Caller soru havuzu, cevap, onay, adet, provider veya ders metni kabul edilmez.
- `renderGrade6QuestionBankEditorView(input)` aynı kapalı bankayı tüketir; beş görev, beş gerekçeli çözüm ve iki yeni görevin sekiz gerçek seçeneği vardır. Script/network/media kapalı CSP; active resource veya arbitrary HTML yoktur.
- `node tools/grade6_reference_authoring_plan.mjs --question-bank-review` gerçek JSON; `--question-bank-html` gerçek HTML verir. Kipsiz/önceki seçenekler korunur. Yanlış/birleşik/count/provider/path/publish argümanları metaveri çıkmadan reddedilir.
- Banka JSON 57.790 bayt; banka SHA `a784542b3d1869440a3cdb31e6f3ccd6a8bd0ad622c68ba373a9fbffdfca184e`. HTML 35.582 bayt; SHA `da7b9ed05248bab7448bf0680a28e3833ddfcd0db29fbfbf41cbfdc816040549` (CLI son satır sonu hariç gerçek belge).

İki görev zorluğu atanmadı; diğer üçü yalnız yazar tahmini (iki orta, bir zor). Kalibrasyon 0, hedef dağılım null. Tahminler kolay/orta/zor/çok zor kotasına ölçülmüş kredi verilmiş gibi dönüştürülmedi. Etkin yıl/program/kazanım kabulü her görevde null/pending; bir araya gelmeleri tam ünite, sınav veya müfredat kabulü oluşturmaz.

Yeni iki taslak bu dilimde **genel medya/fabrika adapter'ına, ses/TTS, videoya, DB öğrenci kaydına veya öğrenci analitiğine bağlanmadı**. Çalışan banka editör tüketicisidir; canlı seri üretim ilan edilmez. DAMA kaynak/sürüm/amaç/kalite durumları tutulur; owner/steward/retention ve insan kabulü açıktır. TDD/negatif test/bağımsız audit kayıtları süreç kanıtıdır; CMMI/SPICE sertifikası değildir.

## TDD, Bağımsız Audit ve Root Kanıtı

Üç paralel kol: inverse yazımı, prime yazımı, salt-okunur bağımsız denetim. Root bankayı/CLI/renderer'ı/test ve native kontrolü üstlendi. Sahip dosyaları freeze pinleriyle, root tüketicileri gerçek hashleriyle denetlendi.

- Root RED: yeni bank/view testleri 12 toplam; eksik tüketici/CLI nedeniyle 11 beklenen başarısız, mevcut kapalı argüman sınırı 1 geçti; exit1. Beklenen assertion, import/sözdizimi çökmesi değildir. Bundan sonra uygulama yazıldı.
- Root GREEN: aynı 12 test 12/12, exit0, 2.368733333s; ekstra sayım, sahte yetki, stale source, getter/proxy/cycle/sparse/oversize, output mutation, gerçek CLI parity/negatif kipler denetlendi.
- İki yeni taslak: inverse15/15 ve prime14/14; sahip raporlarında RED/GREEN ve mevcut kaynak/görev regresyonları ayrı kaydedildi.
- İlk tam root suite: **1.431 toplam / 1.429 PASS / 0 FAIL / 2 opt-in gerçek medya SKIP**, exit0, 36.832939s. Son taze tekrar aşağıda ayrıca kayıtlıdır. Atlanan medya testleri yeni ses/video kabulü sayılmaz.
- Bağımsız frozen consumer suite: inverse15 + prime14 + bank6 + view/CLI6 + planner16 = **57/57 PASS**, skip0/fail0/exit0; 2.289521792s. Ayrı gerçek literal oracle inverse84/tüm6/kalan4 çift ve prime3,3,5,7,11/A-D-B-C-E sonucunu doğruladı. Yeniden hashlenmiş draft14, source/authority22, hostile14, banka5 ve CLI6 olmak üzere **61 negatif ret / hook0**, exit0; gerçek JSON/HTML boyut/hash, beş tekil görev id'si ve beş kapalı çözüm eşleşti. Kritik kabul engeli yok. Bağımsız runner'ın ilk HTML id matcher'ı data-choice-id'yi de sayıyordu; whitespace-anchored tanıkla yeniden kontrol edildi, ürün kodu değiştirilmedi.
- Son root tekrar doğrulaması: bütün dosyalar frozen pinleriyle aynıyken `node --test --test-reporter=tap test/*.test.mjs`, pipefail ile gerçek exit0; **1.431 toplam / 1.429 PASS / 0 FAIL / 2 SKIP**, 13.82850975s. İlk ve son tam suite atlanan gerçek medya testlerini açık bırakır.

## Native Tarayıcı Kanıtı

Root gerçek IAB'de `http://[::1]:56601/` adresini kapalı bellekten sunulan HTML ile açtı. Başlangıç DOM: beş aile, 12 seçenek kartı (4 inverse/4 prime/4 mevcut factor), beş kapalı çözüm. Fare, Space ve Enter ile bütün çözümler açıldı; inverse84/28/6 ve prime A/D/B/C/E tabloları, classification grupları, factor C anahtarı ve dakika/kart-paket anlamı görünür doğrulandı. Reload bütün çözümleri kapalı başlattı; error/warn console0.

Masaüstü DOM width/client/scroll1280; gerçek screenshot görülüp yerel ignored `outputs/question-bank-root-review/editor-desktop.jpg` içine kaydedildi; SHA `fdb11f255f868df7947730e020f3373ca8a858418a5257fc1d5a0313292d636d`. Ham görüntü Git'e eklenmez.

Desteklenen CDP ölçümü: 390/390/390 ve 320/320/320; sayfa yatay taşma0, seçenek grid tek sütun328/258px. Yeni çözümler açıkken 390px görünür tablolar da taşmadı. Bu **dar DOM ölçümüdür**; önceki yakalama yüzeyi sınırlılığı nedeniyle gerçek mobil piksel/cihaz kabulü ilan edilmez. Emülasyon sıfırlandı. Editör görünümü alan uzmanı/premium öğrenci tasarımı ve screen-reader/yaş testi yerine geçmez. Playwright native summary'yi generic görür; ilk button locator eşleşmedi, taze DOM ve exact summary metniyle işlem doğrulandı; uygulama güvenliği değiştirilmedi.

## Sonraki Soru Öncelikli Dilim

Öncelik, yeni uzun konu metni değil; eksik mikroamaçlarda gerçekten farklı soru aileleri, her sorunun ölçme amacı/çeldirici açıklığı/temsil çeşidi ve konu–beceri dengesi. Dört zorluk kotası ancak atanmış ve sonrasında kalibre edilmiş yeterli farklı stokla kapanır. Yeni iki görevin normal fabrika/gerekçeli medya bağlantısı ayrı adapter/negatif test kabulüyle ilerler; mevcut öğrenci teslim sınırı korunur.

Provider/API/credential/ücretli servis/model/SDK/Docker işi/Drive aktarımı/yeni SQL/gerçek çocuk verisi **0**. Kullanıcının asıl Gemini checkout'u değiştirilmedi. Yalnız güvenli kod/test ve küçük raporlar bu dala alınır.

Git hazırlığı: 14 açık sahip dosyası; added-line token/anahtar ve özel filesystem-path taraması0, binary diff0. Ham screenshot ve diğer `outputs/` varlıkları ignored/yüklenmez. Ayrı hook yolu yapılandırılmadı; ortak hooks dizini yok. Commit/uzak dal eşitliği ayrıca son Git çıktısıyla doğrulanır; bu rapor hazırlanırken yayımlanmış ürün beyanı yapılmaz.
