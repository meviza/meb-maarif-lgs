# Bölünebilme Görevi Ve Defter Yer İmleri — Root Kontrol Noktası

Tarih: 4 Ekim 2026. Başlangıç commit'i: `3f83650`. Dal: `codex/k12-foundation-audit`.

## Gerçek Değişiklik

Üç paralel kol kullanıldı: kaynak-bağlı görev yazımı, öğrenci defteri tüketicisi ve salt-okunur bağımsız denetim. Root, görevi mevcut kapalı yazım CLI'sine ve gerçek HTML editör görünümüne bağladı; genel regresyonu ayrıca çalıştırdı. Antigravity/Gemini'nin asıl checkout'u değiştirilmedi.

- Mevcut `g6-reference-authoring-13` brief'inden **bir özgün taslak görev / bir soru ailesi**: sekiz sayıyı 2 ve 3 ile kalansız bölünebilmenin dört birleşimine ayırma. Sekiz kart, sekiz ürün sorusu değildir; yalnız sayısal varyant sayısı 0, yeni kabul/yayın 0.
- Verilen sayıların anlamı, istenen hedef, neden iki ayrı kontrol gerektiği, kart başına gerekçeler, ara kararların anlamı, koşullu kısa yöntem ve eksiksizlik kontrolü görünür. Yazarın modulo hesabından ayrı çözüm oracle'ı son basamak/rakam toplamı kullanır; verifier anahtarı bu bağımsız sonuçla karşılaştırır.
- `tools/grade6_reference_authoring_plan.mjs` yalnız `--divisibility-draft` veya `--divisibility-html` kapalı seçenekleriyle yeni görevi verir. Mevcut plan/factor/common seçenekleri korunur; çağıran kaynak yolu, sağlayıcı, çıktı dizini veya toplu üretim seçenekleri eklenmedi.
- Sentetik öğrenci defterinin mevcut soru/konu yer imleri artık iki aç/kapat düğmesi, `aria-pressed` ve ayrı **taslak / son açık okuma** listeleriyle tüketilir. Yalnız `question-a-001` ve `topic-a-001`; yeni görev bu sentetik hedeflerin yerine geçirilmedi.
- Yer imi değiştirme tek başına kayıt/okuma başlatmaz. Kayıt makbuzu yeni okumanın yerine geçmez; eski okuma, açık read yapılmadan güncel ilan edilmez. Mevcut not/çizgi/gövde bütçesi ve belirsiz kayıt sınırları korunur.

Detaylar: [kaynak ve matematik kanıtı](GRADE6_DIVISIBILITY_CLASSIFICATION_EVIDENCE_2026-10-04.md), [defter istemcisi/mount kanıtı](STUDENT_BOOKMARK_UI_EVIDENCE_2026-10-04.md).

## TDD Ve Kök Neden Düzeltmeleri

Root renderer/CLI için ilk tüketici testleri, uygulamadan önce **1 PASS / 6 beklenen FAIL**, exit 1 verdi. Eksik API/seçenek davranışları eklendikten sonra testler geçti.

Bağımsız denetim, ara kararların nesne dizisinden `String(...)` ile `[object Object]` çıktığını buldu. Önce yeni gerçek HTML tüketici testi eklendi: **4 PASS / 1 FAIL**, exit 1. Kök neden, yapılandırılmış iki-karar ve grup sonuçlarının metne çevrilme biçimiydi. Tek düzeltme bu sonuçları kart/kural/grup anlamıyla listeledi. Taze root koşusu:

```sh
node --test test/grade6_divisibility_editor_view.test.mjs test/grade6_divisibility_cli.test.mjs test/grade6_divisibility_classification_draft.test.mjs
```

**21/21 PASS**, fail/cancel/skip/todo 0, exit 0, `919.297833 ms`. Bağımsız ajan aynı freeze pinlerinde **21/21 PASS**, exit 0, `898.72775 ms`; ayrı executable witness ile 12 literal ara karar/grup satırı ve `[object Object]` 0 doğruladı.

Kaynak kolunda null iç gerekçe satırı önce **12 PASS / 1 FAIL** üretti; kapalı satır kontrolünün sırası düzeltildi, taze **13/13 PASS**. Defter kolunda altı yeni beklenen RED ve ayrı 131.072 UTF-8 bayt gövde bütçesi RED'i minimal değişikliklerle kapandı; dört ilgili suite **78/78 PASS**, fail/skip 0, exit 0, `469.019459 ms`. Bu sayı native tarayıcı veya yeni gerçek SQL kabulü değildir.

Bağımsız görev denetimi ayrıca kendi sekiz literal üyelik satırını eşleştirdi; 24 yanlış anahtar, 10 yeniden-hashlenmiş manipülasyon, dört hostile wire ve iki hostile kaynak olmak üzere **40 ret**, getter/proxy hook 0 bildirdi. Bu denetim küçük sabit göreve aittir; tüm kaynak arşivi için benzerlik taraması değildir.

Son bağımsız freeze denetimi, sahiplerin 12 dosya pinini ayrıca eşleştirdi; defterin ilgili suite'lerini **78/78 PASS**, exit 0, `399.374 ms` ile yeniden çalıştırdı. Ayrı bookmark witness'ında 12 yabancı/hostile hedef reddedildi, diğer notlar korundu, ağ/koersiyon hook'u 0 kaldı ve işaretleme save yetkisi üretmedi. İki owner raporu ve root kaydının kapsamı incelendi; dar teknik kapsamda kalan kod blocker'ı bildirilmedi. Root genel 1.364 test koşusu bu ajan tarafından tekrar çalıştırılmadı.

## Root Genel Regresyonu

```sh
node --test --test-reporter=spec test/*.test.mjs
```

Taze gerçek koşu: **1.364 test; 1.362 PASS / 0 FAIL / 2 SKIP**, cancel/todo 0, exit 0, `13404.639208 ms`. İki SKIP, `K12_INK_REAL_MEDIA_TEST=1` opt-in gerektiren gerçek FFmpeg/PCM hazırlama ve altı-PCM mux testidir; bu turda opt-in açılmadı. Bu sonuç yeni öğretmen sesi/MP4 üretimi veya gerçek DB çalıştırması diye sayılmaz.

Root ayrıca gerçek `--divisibility-draft` CLI sonucunu okuyarak `valid:true`, bir yeni taslak, bir aile, parameter-only varyant 0, kabul/yayın 0 ve provider/network/download/audio/video 0 doğruladı. Taslak içerik SHA-256:

`ef2a2c71338df6037f8ee794599266a0c1999aea43a98a0e22f04d82fb179df5`

## Native Tarayıcı Kontrolü Ve Açık Sınır

Root kendi küçük loopback editör sunucusunda CLI'nin gerçek HTML baytlarını gösterdi; dosya üretmedi. Mevcut tarayıcı denetim aracı kullanıldı; bu oturumda ayrı Playwright REPL aracı bulunmadı.

- Gerçek DOM'da sekiz kart/dört kategori, başlangıçta kapalı çözüm, açık nedensel açıklamalar ve bağımsız dört cevap grubu görüldü.
- Aç/kapat tıklaması, klavyeden Space ile kapama ve reload sonrası kapalı başlangıç yeniden doğrulandı. Nesne placeholder'ı 0.
- Gerçek masaüstü ölçümünde `innerWidth=scrollWidth=1910`. 390 px viewport override istendiğinde araç **gerçekte 582 px** verdi; o ölçümde `innerWidth=scrollWidth=582`. Dar görünümde dört kart/satır ve iki kategori/satır görsel olarak kontrol edildi. Override reset edildi. **390 px mobil veya fiziksel cihaz kabulü yapılmış değildir.**
- Defter için mevcut güvenli memory sunucusu IAB ve Chrome'da `net::ERR_BLOCKED_BY_CLIENT` verdi; rastgele port ve standart 3343 denemeleri çalışır native akış olmadı. Ayrı doğrudan HTTP kontrolü kök sayfada 200, doğru HTML/CSP döndürdü. Bu farkın kök nedeni bu turda kanıtlanmadı; CSP, kapalı header/host/origin veya güvenlik denetimleri gevşetilmedi. **Native bookmark read→save→read kabulü açık**; istemci/mount/HTTP otomatik testlerinin yerine geçirilmedi.

Root ayrıca tarayıcı kabulünden ayrı iki **gerçek loopback HTTP → mevcut gerçek istemci → uygulama → sahipli memory executor** tanığı çalıştırdı, exit 0. Normal akışta read → iki işaret → save → read → soru işaretini kaldır → save → read sonucunda sürüm 2 ve yalnız konu yer imi kaldı; toplam altı açık HTTP isteği. Ayrı ilk-yazma-sonrası-yanıt-kaybı akışında sonuç `save_unknown`, eski okuma sürüm 0, save kilitli ve yalnız bir yazma isteği kaldı; tek açık read sürüm 1'de iki yer imini toparladı, toplam dört açık HTTP isteği. İşaretleme ağ çağrısı yapmadı, otomatik retry olmadı, taslak korundu. Bu taze API tanığı **native UI veya gerçek SQL** değildir; yukarıdaki tarayıcı engelini çözülmüş saymaz.

Geçici adresler kalıcı dokümantasyon API'si değildir. Tekrar üretim: `node tools/synthetic_notebook_desk_preview.mjs --port 0`; bu process-memory test double'dır, gerçek PostgreSQL veya kalıcı öğrenci hesabı değildir. Sahipli normal/yanıt-kaybı defter sunucuları deney sonunda kapatılır; başka kullanıcı sunucusu veya verisi hedeflenmez.

## DAMA Ve Faz Sınırı

Görevin kaynak/brief/çıktı-adayı/mikrobeceri/amaç/gerekçe/hash bağı korunur; defter mevcut amaç/sınıflama/sürüm/makbuz/yönetişim profilini kullanır. Yer imleri öğrenme puanı, soru çözme olayı, bilişsel kapasite veya psikometrik çıkarım değildir. Gereksinim → RED → düzeltme → GREEN → bağımsız denetim → root regresyon/eksik kaydı, süreç iş ürünü kanıtıdır; CMMI/SPICE derecesi veya sertifika değildir.

Bu dilimde yeni ders kitabı indirme, Drive aktarımı, model/SDK indirme, Docker/gerçek SQL, credential, Clef/TTS, yeni ses/video, gerçek çocuk/kurum verisi, satın alma veya API harcaması yok. Teknik görev denetimi/kapalı editör entegrasyonu geçer; öğrenci teslimi, tam mobil/native defter ve öğretmen dinleme kabulü ayrı açık işlerdir.

Sonraki küçük dilim: native defter erişim engelinin güvenlik korunarak tanılanması; gerçek 390/320 px kontrol; bu farklı görev ailesinin mevcut ders–karışık test ve gerekçeli medya yollarına TDD ile bağlanması. Hazır Google üyelik/kota kontrolü kullanıcı girişinden sonra yürür; mevcut sıfır ek harcama kararı korunur. Yeni soru için tamamlanan teknik dilim, 36.000 hedefinin veya genel video fabrikasının tamamlanması değildir.
