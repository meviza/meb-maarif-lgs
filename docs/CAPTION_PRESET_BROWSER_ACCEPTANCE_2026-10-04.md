# Farklı anlatım önayarları: Yerel tarayıcı kanıtı

## Test öncesi kapsam

Bu fazdaki kullanıcıya görünür iddia, mevcut güvenilen taslakların ayrı sunucu örneklerinde aynı kontrollü altyazı ekranıyla incelenebilmesidir. Yeni soru stoku, öğrenci kimliği, premium tasarım, sesli video veya pedagojik kabul iddiası yoktur. Aynı alan/farklı çevre ve aynı çevre/farklı alan görevleri desteklenmiş gibi takma adla sunulmaz.

Kabul envanteri:

- CLI `--preset concept/perimeter/area --port 0`, sunucu tarafından sabit seçilmiş kaynak; istemci kaynak/sınıf seçimi yok. Eski varsayılan bahçe davranışı ayrı regresyon testinde korunur.
- Üç yeni önayarda başlangıç, tüm gerekçe adımları, çok sayfalı açıklama, korunan yanıt, açık gösterim ve geri dönüşte kilitlenme. DOM metni gerçekten okunan current kaydıyla eşleşmelidir.
- Beş kontrol, klavye, kapalı/açık kaynak SVG ve tam geçerli anlatım. Değişen kaynakta amaç ve sonuç tutarlılığı kontrol edilir.
- Masaüstü 1440×1000, mobil dokunma emülasyonu 390×844: başlangıçta ana açıklama ve kontroller görünür; sayfa yatay taşmaz, 18px yazı korunur. SVG'nin doğal genişliği ve erişilebilirlik sınırları ayrı kalır.
- En az iki olumsuz/keşif senaryosu: yanlış HTTP kaynak seçimi kapalı kalır; hızlı çift tıklama/geri dönüş yanıt kilidini aşmaz. Kısa serbest gezinme ve ikinci pencerenin ortak geçici cursor davranışı gözlenir.

Bu bölüm test öncesi envanterdir. Aşağıdaki sonuçlar testten sonra kaydedildi; planın kendisi başarılı kabul kanıtı değildir.

## Gerçek çalışma

Mevcut Playwright ve kurulu Chrome kullanıldı; paket/browser indirilmedi. Ayrı geçici profil ve headless tarayıcı, kullanıcının oturum açmış Chrome profilinden bağımsızdır. Üç gerçek CLI süreci kapalı enum ve geçici loopback portuyla başlatıldı.

| Önayar | Kaynak | İncelenen gerekçe | Açılan korunan yanıt | Normal ekran eylemi |
| --- | --- | --- | --- | --- |
| concept | lesson-perimeter-area-v1 | 26 | 12 | 52 |
| perimeter | caption-review-loopback-perimeter | 14 | 6 | 24 |
| area | caption-review-loopback-area | 10 | 4 | 20 |

Üç başlangıç +96 normal kontrol eylemi =99 current/DOM tanığı. Bütün50 adım ziyaret edildi. Ekrandaki literal metin ve beş düğmenin açık/kapalı durumu gerçek current API kaydıyla eşleşti; full narration kilitliyken cevap metni gösterilmedi. Bu99 kaydın metadata/metin trace SHA-256 değeri `4f32d53144fee8403fec112d8f98cfa4c7ddb5fef21a6976cdea19e51c77255e`. Trace özel bellekte tutuldu; yeni kaynak metni veya medya dosyası Git'e eklenmedi.

Üç aktarım sonucu ayrı amaç taşıdı: kavram anlatımında aynı şeklin çevre/alan görevi ve cm/cm² ayrımı; çevrede bir kenar ve karşısının uzamasının toplam artışa etkisi; alanda yeni sütunun diğer kenar boyunca katkısı. Bunlar yeni soru stoğu değildir. 6×4 dikdörtgenin çevre ve alan kaynak SVG baytlarının aynı olması doğrudur; farklı görsel çizildi iddiası yok, amaç/işlem/birim/anlatım bağları farklıdır.

Masaüstü1440×1000 ve mobil390×844 emülasyonda yazı18 CSS px, belge genişliği viewport ile aynı. Mobil başlangıçta beş kontrol x31–340.47 aralığında ve en alttaki kontrol y622.92+46.80 yüksekliğiyle görünür. Başlangıç, korunan/açılmış yanıt, son durum, tam anlatım, kaynak ve mobil footer özel JPEG'leri native boyutta incelendi. Sayfa tasarımı scroll edebilir; yardımcı SVG/anlatım/footer için aşağı kaydırma kabul edilen akıştır. Mobil caption'ın iki veri satırı birden fazla fiziksel satıra sarılır; iki piksel satırı/glyph-fit kabulü iddia edilmez.

Mobil dokunma ile sayfa ileri/geri döngüsü, yanıt açma, önceki gerekçeye dönüş ve bütün ara sayfalar tamamlandıktan sonra yeniden yanıt kilidi doğrulandı. İlk yardımcı, geri dönüşteki why adımının iki sayfasını bitirmeden disabled next-cue'yu kullanmaya çalıştı;30s bekleme ve REPL reset oldu. Bu yarım koşu başarılı sayılmadı. Current API'nin why/page0/pageCount2 kaydı nedeni doğruladı; sayfa kuralları izlenerek kısa2s işlem sınırlarıyla yeniden geçti. İlk tarayıcı geçici süreç kimliği/başlangıç/owned headless profil koşullarıyla dar kontrol edilip yalnız o süreç kapatıldı; kullanıcı tarayıcısı değiştirilmedi. Yeni launcher açık süreç sahipliğiyle çalıştı ve exit0/bağlantı kapalı kanıtıyla sonlandırıldı. Geniş process/env/token keşfi yapılmadı.

Son keşif: **31.678s /266 etkileşim burst /14 önayar yeniden yüklemesi**; Tab/Shift+Tab, normal adım/sayfa kontrolleri, SVG/anlatım aç/kapa, kaydırma ve yeni ikinci pencerenin aynı current cursor'ı görmesi. Yeni ve önceki başarılı gözlemlerde uncaught browser JS error0. İkinci pencere canlı push-sync değildir; fresh GET ile ortak yerel cursor gözlemidir. Bu faz çift tıklamanın tam zamanlı tek-istek sayımını yeni native tanıkta tekrarlamadı; in-flight gate eski test/bounded independent audit kapsamındadır.

Concept son aktarım SVG'si560×208/display560; geometri yerine kaynakta yeni şekil bulunmadığını açıklayan text-only pending katmandır. Bu şekilde geometri hazırmış gibi gösterilmez. Bütün mobil geometri/crop/AX/contrast/real-device, öğretmen dinleme ve premium öğrenci tasarım kabulü açık. Eski canonical kilit metnindeki `reveal` sözcüğü, tam tekil kaynak varsayımı, bitmemiş cümle gibi görünen kısa caption kesimleri ve yoğunluğu ayarlama editör borcudur; kaynak baytları otomatik yeniden yazılmadı. Ses/video/TTS/senkron, gerçek auth veya yayın yapılmadı.

Üç sahip olunan CLI sunucusu SIGINT ile exit0 kapandı; kendi tarayıcı/context/launcher'ları kapandı. Eski3338 kullanıcı önizlemesi değiştirilmedi.

## Özel ekran kanıtlarının küçük hash envanteri

17 JPEG toplam **1.378.347 bayt**; Git dışında. Bu hashler dosya bütünlüğü metaverisidir, uzaktaki erişim veya ekran okuyucu kabulü değildir.

| Dosya | SHA-256 |
| --- | --- |
| area-desktop-final.jpg | 930018224d4d80320c8bdd791e916e2b99108aead54d0682dfaf8990ac68399b |
| area-desktop-initial.jpg | df55acdfa90e947160be4027d942aa3e7dedf946fc52116a9b901764710471a5 |
| area-desktop-locked.jpg | 64eaaa6cfb2b0e1456af4aa59ae9da83838ba15de940f4a2635455d9a27dfef3 |
| area-desktop-revealed.jpg | c617eaf299916f864070584aa8b1213f7aefabb422b75375935f187f191b531e |
| area-mobile-initial.jpg | d9e2baa95f243a4f3454fce520e996243dd3e69bad34fcc70e5b170440ebe647 |
| area-mobile-narration-footer.jpg | 66ed4c29bb8c7718d019c8b9f6b9be92129e2a51454ffde2da13dc711defa5ab |
| area-mobile-revealed.jpg | 886b5deb8556664817c0bd1c80dfb5f5f2b682e71ade8c8ec53116f4667bdd40 |
| concept-desktop-final.jpg | 5020f525c055210fe7345aad049f45109de8ab64e7452095c2e7d8c45d40ee39 |
| concept-desktop-initial.jpg | 0c54f277054f2ac38233653a493afd7bbb7695cc66b9d811e08fec9c8c4baa93 |
| concept-desktop-locked.jpg | 21621695a810159ab36e843d0abe5465ce7c47aaf0d241c44e93fc21751e6d13 |
| concept-desktop-narration.jpg | 6cdb5aeff65377bde830293aa1de47841d743b1691891ce4fc4fe8b484f70289 |
| concept-desktop-revealed.jpg | e815af1234f4a90cc91d9facfd0774d4cf732f7d8a233d29e5d1539109765cb6 |
| concept-desktop-source.jpg | 418f3ad75856f5caf86daf23a3f02c718842f7d475056000f998229385b9e789 |
| perimeter-desktop-final.jpg | 897f9d802a3562221c1284e2db59fc9da43ed6b54d691e5eedf137a6aafce746 |
| perimeter-desktop-initial.jpg | 0d4d4d79893626a656c0fabbd0a4046258ff763df1baa596e60358e2373cffe8 |
| perimeter-desktop-locked.jpg | 5fd503bfc69cd530ef5f08205c1671cfb13ebcc443c942bf98d2a2ff61bfb718 |
| perimeter-desktop-revealed.jpg | 6d7fbd37ec6297fc67cbc0cee02f35bb744a4cb528d98da2cb8e4d124a431a8a |
