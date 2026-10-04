# Ortak Kat–Bölen Görevi — Kök Entegrasyonu ve Kabul Sınırları

Bu dilimin amacı, yalnız sayıları değişen bir çarpan sorusu eklemek değil; sorulan niceliğe göre ortak kat ile ortak bölen ilişkisinin neden seçildiğini gösteren ayrı bir editör görevi kurmaktır. Başlangıç checkpoint'i `36681b1f21ce4b4416b212311499754c99b64f4e`; kanonik dal `codex/k12-foundation-audit`. Gemini checkout'u değiştirilmez.

## Kök Kaynak Okuması

Mevcut ortaokul matematik programının yerel baytları yeniden SHA-256 ile denetlendi: `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`, 3.916.466 bayt. Bundled Poppler `pdfinfo`, 222 sayfa/A4/PDF1.7/şifresiz bilgisini verdi; bu teknik alanlar hak, güvenlik, erişilebilirlik veya etkin program kabulü değildir. PDF bu dilimde yeniden indirilmedi.

Kök, fiziksel71–73 metnini okudu. **71–72** uygulama ve farklılaştırma sayfaları; **73** sonraki temanın başlangıcıdır, bu çıktı uygulamasının kapsam sayacına eklenmedi. Bundled Poppler ile71/72 için1250px üst sınırında iki özel PNG üretildi ve ikisi de native görüntü aracıyla incelendi. Sayfa71'de çıktı kodu, paragraf sınırı, EBOB/EKOK kavramlarına değinmeme sınırı ve izleme türleri;72'de zenginleştirme devamı, destekleme ve öğretmen yansıması ayrı görüldü. QR kod takip edilmedi.

| Özel raster | Bayt | SHA-256 |
| --- | ---: | --- |
| Sayfa71 | 264.941 | `74c3dafcb0357a6898a0689d31201e9f8d604cbe3b1323f822226053743a16b7` |
| Sayfa72 | 88.620 | `f293331d653342d22be6bc1de1dd112f1037d5ff02421c1d0b044efb6c6008f0` |

Toplam353.561bayt özel QA rasterıdır; kaynak görseli, ham PDF veya özel yol Git'e girmez. Raster komutunun ilk kısa tool çıktısında session/exit bilgisi saklanmadı; daha sonra iki dosyanın varlığı/hash'i/native içeriği doğrulandı. Bu nedenle ilk renderer process için kaydedilmiş exit0 iddiası yoktur. Tamlık, geçerli son kaynak, Drive uzak baytları veya bütün programın görsel incelemesi iddia edilmez.

Kaynağın uygulama bölümünden kendi sözlerimizle çıkarılan sınır: Günlük bağlamdaki iki doğal sayının ortak ilişkisi çeşitli temsillerle yorumlanır; çözüm gerekçeleri ve farklı yollar tartışılır. Bu aşama formal EBOB/EKOK kavramlarını öğretmeye dönüştürülmez. Açık uçlu, doğru-yanlış ve eşleştirme izlemeleri belirtilebilir; bu ifade resmî soru türü kotası veya zorluk dağılımı değildir.

Kaynağın fidan, hayvan ve trafik örnekleri ürün kökü olarak kopyalanmaz. [Yeni uygulama gözlemi](GRADE6_COMMON_RELATIONS_SOURCE_EVIDENCE_2026-10-04.md), önceki67–70 matrisinin üstüne ayrı kayıt olarak bağlanır; eski checkpoint ve eski açık boşluk kaydı sessizce değiştirilmez. Bu gözlem kaynak sorusu envanteri değildir.

## Kök CLI Test-Önce Kaydı

Kapalı `--common-relations-draft` seçeneği için gerçek CLI tüketici testi önce yazılıp çalıştırıldı: **5PASS/1FAIL**, beklenen hata `invalid_grade6_reference_authoring_args`. Mevcut varsayılan plan ve iki factor opt-in testi geçti. Sonra kapalı argüman ve sabit metadata okuma seam'i eklendi; yeni modül henüz bulunmadığından5PASS/1FAIL, sanitised `grade6_reference_authoring_failed` görüldü. Bu ara sonuç GREEN veya tamamlanma değildir.

Seçenek yalnız sabit public kaynak kaydı, mevcut semantik matris ve yeni uygulama gözlemiyle kendi editör taslağını denetlemek için tasarlanır; keyfi kaynak, sayaç, provider, path, output veya birleşik seçenek açmaz. Normal dört metadata tüketen eski plan/factor davranışları korunur. Yeni gözlem yalnız bu opt-in'de ek olarak okunur. İndirme, yazma, sunucu veya model çağrısı bu CLI'nin işi değildir.

## Açık Kabul Sınırları

Matematik denetimi kaynak gözlemi, özgünlük, uzman kabulü ve yayın yetkisinden ayrıdır. Sabit görevi tekrar çağırmak yeni stok değildir. Kaynağın açık erişimi ticari yeniden kullanım veya ayrı üretim modeline yükleme izni değildir. Kaynak metin/raster bu Codex inceleme oturumunda görülür; üretim fabrikasının harici provider endpoint'lerine aktarım yapılmaz.

Bu dilim genel medya renderer'ı, PNG/SVG ürün varlığı, ses, video, öğrenci defteri, gerçek analiz, auth/tenant veya okul kotası kabulünü kapatmaz. CMMI/SPICE faz kaydı ve DAMA köken/amaç/kalite ayrımı tutulur; sertifikasyon, MEB onayı veya çocukta öğretim etkinliği iddia edilmez.

## İlk Gerçek Entegrasyon Kanıtı

Kaynak writer'ın gözlemi frozen olduktan sonra kök source/scope/önceki matrix testlerini taze çalıştırdı: **39/39PASS, fail0/skip0, exit0**. Ardından yeni görev modülü hazırken yeni draft14 + kaynak10 + rootCLI6 olmak üzere **30/30PASS, fail0/skip0, exit0**. Root'un ilk5PASS/1FAIL CLI RED'i bu gerçek consumer koşusuyla6/6GREEN oldu. Bunlar bütün repo suite veya son frozen code kabulü diye sayılmaz.

Gerçek `--common-relations-draft` stdout'u kök tarafından bütünüyle okundu. İki bağlam, dört verilen kanıt kartı, iki gerekçeli yol, üç karşı örnek/sınır kontrolü ve birim taşıyan ayrı tablolaştırma metadatası vardır. Sonlu ortak dakika işaretleri24/48; ortak pozitif kart/paket boyutları1/2/3/4/6/12. Toplama14 iki tekrar için kalansız işaret değildir;6kart/paket seçilirse4 ve6 paket çıkar, bu sonuçlar paket boyutu yerine geçmez. Başlangıç0 dışarıda,48 sınırı içeride,72 dışarıdadır. Kaynak ve doğrulayıcı verisi aynı JSON çıktısında olsa da kaynak program, özgün matematik ve yetkili kabul birbirinin yerine konmaz.

Bu ilk frozen metindeki bir paketleme cümlesi, türler ayrı şartına rağmen karışık paket gibi okunabilirdi. Kök writer'dan bir pakette yalnız tek tür/hepsinde ortak adet ifadesini açıklaştırmasını istedi. Bu bir prose netleştirmesidir; yeni üretim davranışı veya ayrı özellik RED sayılmaz. Kelime snapshot testi eklenmedi. Final statement, tek tür paket ve iki türün paketlerinde ortak kart adedini açık yazar; goal'da da “artan kart bırakmadan” denir. Kök gerçek final CLI cümlesini yeniden okudu.

## Son Frozen Kod ve Gerçek Çıktı

Modül SHA `de2f20571407a49e063bbaa82d96b465ab75ca54d0760a43cddb00d40e0cae3a` (24.407bayt), writer test SHA `696fc01123e4dcf53aed953599140f3559ffeafaa9e4610a51c05b6e70f0f4d9` ve writer rapor SHA `06411b5d4264212f2f522c833fd9e7c16fa454fcc22b355abf9bd575d76549af` kök tarafından yeniden hesaplanıp eşleştirildi. Source JSON13.725bayt ve canonical3c1ccf73 revizyonu değişmedi.

Gerçek final CLI stdout **10.854bayt**, SHA `96d74377f484f6f8b9516106b0877dd5762c5d19a41a5042b63b190ce4be357b`. Draft9.076bayt, content SHA `9c225c8f2bc97dfae1d89778cda3ff5980f0c31056330c639e5be15823d2abd7`; task SHA `c20e190e87945d6a79140819490ab09e55342a5a988eae9df5a95e0054ee6aeb`. Diagnostic1.698bayt, yerel kontrolvalidtrue; listeler ve unique eşleşmeler elle türetilen beklentilerle aynı. Hash, pupil delivery veya kabul yetkisi değildir.

İlk full suite, writer'ın saf prose düzeltmesi sırasında çalıştı: **1134/1134PASS, fail0/skip0/exit0,18.468s**; bu koşu tek başına son frozen revizyon kabulü yapılmadı. Final hash'ler dondurulduktan sonra kök tam komutu tekrar çalıştırdı: **1134/1134PASS, fail0/skip0/cancel0/todo0,exit0,18.673s**. Mevcut trusted Sharp/real-media opt-in ile bütün npm test yolu koşuldu; yeni bağımlılık indirilmedi. Önceki1109'a10source+14draft+1CLI eklendi. Negatif probe ve PDF raster sayıları test adedine eklenmez.

Bu başarı yeni soru ailesinin sınırlı teknik sözleşmesine aittir; formal program, pedagojik veya psikometrik kabul değildir. Sağlayıcı/ses/video/DB/Docker/Drive/üretim/gerçek veri faaliyeti0. Genel caption/medya/fabrika ve öğrenci kullanım hattı bu opt-in'den bağımsız, hâlâ bağlama/kabul bekler.

## Bağımsız Audit

Ayrı audit ajanı source/draft/CLI/matrix/önceki factor/renderer için **69/69 tazePASS, fail0/skip0/exit0** bildirdi. Final module/test/writer doc hash'leri root'un kendi hash kontrolüyle aynı. Ayrıca salt bellekte **262 negatif +3 pozitif**, hook0; actualCLI beş çıktı modu ve18 kapalı invalid seçenek geçti. Negatifler rehashed yanlış key/units/strategy/window/source/purpose/gates, nullable/malformed/depth/byte/descriptor sınırlarını kapsar. Kaynak, sonlu aday aralığı, birim ve yerel key audit'i için açık P1/P2 bulunmadı; bütün ürüne güvenlik, hak veya pedagoji sertifikası değildir. Audit ajanı dosya, Git, DB, provider veya ağ yazımı yapmadı. Root30 ve1134 testleri ayrı kendi kanıtıdır; aynı testler toplanarak yeni “toplam test” uydurulmaz.

## Git Checkpoint Kapısı

İlk seçili staging kapısı **13 regular UTF-8 metin dosyası /269.992bayt**, her biri512KiB altında; **5 JavaScript syntax /237 yerel Markdown link** geçti. NUL, symlink, bilinen credential marker, özel yol, imzalı URL marker, staged–working bytes eşliği, unstaged drift ve diff whitespace kontrolü bulgusuz. JSON ayrıca parse edildi. Bu sınırlı marker kontrolü bütün repo veya genel secret/güvenlik sertifikası değildir. Bu küçük gate kaydı eklendikten sonra aynı13 dosya ve kapılar commit öncesi tekrar denetlenir; eski toplam bayt son doc boyutu diye sunulmaz. Git yalnız bu code/metadata/küçük raporları taşır; ham PDF/raster/media/credential/Drive dosya kimliği yok.
