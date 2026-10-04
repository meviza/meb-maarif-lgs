# Sentetik Defter Masası: Kök Tarayıcı ve CLI Kanıtı

## Test öncesi QA envanteri

Bu dilim ayrı yerel desk önizlemesidir; eski öğrenci çalışma alanının sentetik scope'u değiştirilmez. Fixed memory executor gerçek veritabanı değildir. Aynı API'nin gerçek izole PostgreSQL regresyonu ayrı kanıttır; SQL tanıkları browser witness veya UI→SQL ortak kanıtı diye sayılmaz.

| Görünen davranış / kontrol | Normal kullanıcı girdisi | Kontrol edilecek durum ve görsel |
| --- | --- | --- |
| Başlangıçta okuma yok; kayıt kilitli | Sayfayı aç | Sentetik sınır ve 6. sınıf bağlamı, başlangıç CTA, save disabled, read projection yok |
| Kaydı oku | Düğme | Boş revizyon0 veya doğrulanmış son kayıt; taslağın değişmemesi; save kilidinin açılması |
| Taslak metin, kısa not ve soru | Klavye ve ekleme düğmeleri | Literal metin; geçerli/boş/aşırı limit ret; kaynak read görünümü değişmez |
| Taslağı kaydet | Düğme / hızlı tekrar | Busy gate, tek yazma, ayrı makbuz, read hâlâ eski/stale, otomatik read/retry yok |
| Yeniden oku | Düğme | Ancak açık read yeni kayıt içeriğini getirir; taslağı sessiz değiştirmez |
| Okunan kaydı taslağa al | Düğme | Açık replace; sonra taslağı temizleme; read kaydı korunur |
| İsteğe bağlı kalem | Details, renk/kalınlık, pointer, temizle | Dört ondalık yeni capture, sayım ve literal readback; klavye metni eşdeğer alternatif |
| Yanıt kaybı | Ayrı sabit reply-loss CLI ve save/read düğmeleri | persisted bilinmiyor, makbuz uydurulmaz, save kilitli; açık read recovery |
| Yenileme / ikinci sekme | Browser reload/yeni sekme | Yerel taslak silinir, scope değiştirilmez; state SQL-free GET'ten oluşur, save için ayrı read gerekir |
| Mobil / klavye / reduced motion | 390×844 dokunma, Tab, details ve scroll | Başlangıç CTA görünür, yatay taşma yok, minimum44px ana kontrol; tüm ilgili bölgeler ayrıca incelenir |

Fonksiyonel kontrolden ayrı screenshot incelemesi ve en az30s keşif yapılacak. İki off-happy path: çift tıklama/unknown yazma; literal HTML-benzeri metin/boş not/büyük metin. Pointer capture ve arayüz normal input ile; evaluate yalnız salt-okunur DOM/geometry gözlemi. Fiziksel cihaz, erişilebilirlik sertifikası, pedagojik geçerlik, premium tasarım kabulü, ses/video ve üretim auth bu envanterin dışında açık kalır.

## Kök TDD ve ayrı gerçek SQL regresyonu

Yeni desk CLI/sabit memory executor6 tüketici testi doğru eksik tool/API davranışıyla0/6 RED, sonra6/6 GREEN oldu. Fixed main+supplement metadata tüketen authoring CLI3 test0/3 RED→3/3 GREEN; full plan testi planner'ın mevcut `answerValidationPolicy`/`imageProduced` alan adlarıyla uygulanmadan önce düzeltildi. CLI hiçbir PDF, provider, gerçek kullanıcı veya çıktı dosyası üretmez.

Yeni HTTP static profile sonrası cached/network-none izole PostgreSQL harness tekrar yürütüldü: **73 SQL +13 adapter +10 application +10 HTTP =106 tanık**, exit0. `httpProofExecuted:true`, `httpServerStopped:true`, `containerStopped:true`; yalnız kendi beş ephemeral HTTP server'ı ve ID-owned container temizlendi, ayrı inspect bulunamadı. Bu eski HTTP profili regresyonudur; yeni native UI→SQL ortak tanığı değildir. Cloud kredi/credential veya yeni image pull yoktur.

## Tarayıcı sonuçları

Frozen canonical HTML/CSS/JS hash'leri kök tarafından karşılaştırıldı. Mevcut Playwright ve kurulu native Chrome, ayrı headless geçici profil ile kullanıldı; paket/browser/SDK/model veya credential indirilmedi, kullanıcının açık hesap profiline girilmedi. İki gerçek CLI normal/reply-loss için kendi ephemeral loopback portlarında açıldı. Freeze öncesi iki CLI kapanıp frozen bundle ile yeniden kuruldu; eski3338 değişmedi.

Desktop1440×1000 ve mobile390×844 emülasyonunda normal klavye/fare/dokunma girdileri envanteri karşıladı. İlk GET yalnız current: SQL0, client read boş/save kilitli. Açık read0 sonrası metin/not/soru/çizgi oluşturuldu; HTML-benzeri not literal kaldı, HTML elementine dönüşmedi. Boş not ve4001UTF16 metin reddi son geçerli taslağı korudu. Beş renk/dört kalınlık seçildi. Pointerdown/move gerçek canvas'ı değiştirdi; draft strokeCount0 kaldı, valid pointerup sonra1. Alan dışı çizgi bütünüyle reddedilip önceki canvas/draft korundu, kırpılmadı. Mobil touch tap tek yeni nokta çizgisi ekledi. Clear/load döngüleri geçti. Native pointercancel/512nokta sınırı burada runtime tanığı sayılmaz; emitted-module testleri ayrıdır.

Hızlı çift click tek HTTPsave oluşturdu: memory head1, ayrı makbuz, eski read0 stale, save kilitli. Yeni taslak sonrası açık read1 taslağı ezmeden kayıt getirdi; yalnız load-read taslağı değiştirdi. Clear-draft/pen sunucudaki read'i silmedi. Reply-loss save503: makbuz/başarı uydurulmadı, persisted bilinmiyor/save kilitli. Açık read1 kayıt getirdi, yeni taslak korundu. Mobile save2 sonrası eski desktop read1 ile save409 reddedildi; açık read2 gerekti. Reload yerel taslağı sildi ve yalnız GET/current yaptı; server'ın önceki read2'si otomatik client read yetkisi olmadı.

API gözlemleri **15**: desktop7(GET2/read3/save2), reply-loss4(GET1/read2/save1), mobile4(GET1/read2/save1). Save'lerde iki kabul, bir reply-loss503 ve bir eski revision409 vardır. Normal eylemler dışında otomatik read/retry yoktur. Bunlar HTTP/memory tanıklarıdır, actualSQL/auth veya ürün/öğrenme soru adedi değildir. Hash denetimi tutarlılıktır, kimlik doğrulaması değildir.

Görsel inceleme fonksiyonel testten ayrıdır: ilk ekran, pending ink, makbuz/stale read, korunmuş yeni taslak, unknown/conflict, mobil ilk/read/kalem/footer, reload keyboard focus. Yatay belge genişliği1440/390; mobile başlangıç read y474.516–524.188, save y534.078–583.75, ikisi318×49.672CSSpx ve844viewport içinde. Mobil10button/select/summary44–49.672px, kök font18px. Scroll tasarımlı alt bölgeler ayrıca native incelendi; tüm sayfanın tekviewport'a sığdığı iddia edilmez. Görünür clipping/yatay taşma/katman çakışması bulunmadı; AX/contrast/physical-device/Apple-Android/premium tasarım kabulü değildir.

32.463s keşif:21cycle/252normal input burst; ayrıca ilk klavye/boş not/scroll13burst. Tab/ShiftTab, details, bütün kalem seçenekleri, metin/not/soru/scroll ve ayrı pencere revision çakışması kapsandı. Uncaught JavaScript hatası0. İki context, browser.close/browserServer.close kapandı; yalnız kendi PID'sinin dar metadata kontrolü süreç kalmadığını doğruladı. Exit-event null kaldığından browser exit0 iddiası yoktur. İki owned frozen CLI SIGINT sonrası exit0; kullanıcı Chrome'u/başka süreç değişmedi. Regression container ayrıca temizlendi.

## Özel screenshot bütünlüğü

Tüm12JPEG native incelendi; toplam1.013.340bayt yalnız özel çalışma çıktısında. Git'te görsel/özel mutlak yol yoktur.

| Dosya | Bayt | SHA-256 |
| --- | ---: | --- |
| desktop-initial.jpg | 105738 | 52c5ab8589b50cc626679d47f6e40406f2d05082f93b324faca6103aba52ce78 |
| desktop-pending-ink.jpg | 67198 | 5d76d19940a9cd8a9e00d2159758e211f4d6af519a91ec2f70e1adde7ac9dd5f |
| desktop-confirmed-write-stale-read.jpg | 117025 | 4508709fa9923ef42e7505d7fd66bab95d14fcab03aa9de11b92cf332a785555 |
| desktop-explicit-read-preserves-new-draft.jpg | 115677 | d4708979e2b30485578a9f7711930e92744ab4c1fd17bd564c85daab241539d9 |
| desktop-unknown-write.jpg | 117115 | 7a5ab74002b483feed9eedd54c3b4976707b6cfcf9faf31612dd05119dfa9229 |
| mobile-initial.jpg | 50407 | 54fcab035850c2f7fbe991818e511ab854eefaf1fe54a0f6b6e833ca23032d0f |
| mobile-explicit-read.jpg | 40187 | d659fc6ff336bed9a991c8cfffc1d46f95f10bdacad8ec397156acbab51ba624 |
| desktop-invalid-stroke-footer.jpg | 76604 | 9462850cd3a66ed0bdf35967d166e72272240bc97832680016315f592ae5f9e1 |
| mobile-touch-ink.jpg | 39849 | 49131b20945a0e1f75705d172826a2d95567b72ce097d026d510a964fb3a19f7 |
| mobile-receipt-footer.jpg | 50534 | 51ae832f6c4e234db99efbf5680a0b8028990989664c9b3d8e73b254a48fd6d5 |
| desktop-other-window-revision-conflict.jpg | 124885 | 7ce24f96cf7c7d3a643b425d9f02ab6926c43bb3f37826273e5591487e34e44b |
| desktop-reload-keyboard-focus.jpg | 108121 | 1d089adfa7b0502668412d97e8d82693e984259a12fa3b43a9ea92b8d005e0ce |

## Bağımsız audit, final gate ve açık işler

Üç paralel writer'a çapraz denetim yapıldı. Source null download row native hata kolu kök15PASS/1RED→record kontrolü→16GREEN; bağımsız19/19 ve76/76 + probe geçti. Pending-ink P2 writer29PASS/1RED→30GREEN; bağımsız130/130/emitted-canvas probe geçti. Ek9wire ret, gecikmiş save sırasında5overlap, unknown-receipt/no-autorecovery sınandı. Diğer denetçi server/rootCLI106/106 + kendi230HTTP/14pre-executor negatif +100memoryhead/disconnect/response-loss/replay sınadı. Denetçiler native browser/actualDB yaptıklarını iddia etmedi. Bu dar kapsamda açık yeni P1/P2 yoktur.

Kök frozen kodla final suite: **1056/1056 PASS,fail0/skip0/cancel0/todo0,exit0,18.425s**. Trusted Sharp/actual-media opt-in mevcut runtime'da kullanıldı. Önceki986'ya planner16+authoringCLI3+deskclient30+deskserver15+deskCLI6=70eklendi. ActualSQL/browser/probe adedi suite'e eklenmez. Passing tests DAMA/CMMI/SPICE sertifikası, MEB onayı, pedagojik geçerlik, ticari hak veya yayın kararı değildir.

Pending: native UI→actualSQL joint proof; prod wire-driver/auth/tenant/session/retention/erase/restore/rate/load/audit; gerçek öğrenci/schoolquota; read stroke/bookmark ayrıviewer, per-note edit/undo; physical-device/AX/contrast/uzman UX. Kaynak brieflerinde altı program/pedagoji/hak/zorluk/cevap/erişilebilirlik kapısı pending; verifier politikası çalışan verifier değildir. Generated/acceptedProductQuestions/yayın0; bu faz yeni video/ses/provider/Clef/Drive/download/paidcloud yapmadı.36.000hedef tamamlanmadı.
