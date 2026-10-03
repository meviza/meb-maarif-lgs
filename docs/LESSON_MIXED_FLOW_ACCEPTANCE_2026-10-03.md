# Konu → tek gerekçeli örnek → karışık alıştırma

Tarih: 2026-10-03. Kullanıcı, aynı soru tipinin sayıları değiştirilerek art arda gösterilmesini reddetti; formül/kısa yöntem/püf nokta ve büyük harfle başlayan cümle/başlık istedi. Uygulama **mevcut yerel editör pilotuna** yapıldı. Yeni öğrenci ürünü, tam geometri anlatımı veya 1–8 müfredat kabulü değildir.

## Uygulanan davranış

- Sayfa önce mevcut çevre–alan kavram dersini gösterir; ardından bir gerekçeli öğretici örnek ve tek soruluk gezilebilir karışık alıştırma vardır. On iki ham taslak, varsayılan kapalı editör bankasında korunur.
- Derste Formül / Kısa yöntem / Püf nokta / Ne zaman geçerli? / Tahmin et, sonra açıkla paneli vardır. Bağıntıların dikdörtgen için olduğu ve uzunluk birimlerinin önce eşitlenmesi gerektiği yazılıdır. Çevre–alan ve cm–cm² ayrımı yapılır; koşulsuz “sihirli kısa yol” sunulmaz.
- Gerekçeli çözüm, isteneni, verilen değerleri, seçilen yolu, ara sonucun anlamını, kontrolü ve koşullu aktarımı ayrı tutar. Sonuç önce gizlidir; gerekçe adımında açmadan sonraki adım geçilemez. Başka soruya gidip geri dönüldüğünde çözüm başa döner, yanıtlar gizlenir ve açıklama kapanır. Öğretici örnek bağımsız kalır.
- Türkçe baş harf büyütme ve anlaşılır zorluk etiketleri sunum kopyasında kullanılır; kanonik soru/cevap/SVG/storyboard/medya kaynak byte'ları değişmez. SVG erişilebilir başlık kimlikleri belge içinde ayrılır; kaynak metaverisi HTML olarak çalıştırılmaz.

## Karışık test hazırlayıcısı

`packages/content-factory/mixed_practice_plan.mjs` normal fabrika CLI'sine bağlandı. Kaynak içerik hashleri, istek ve seçilen revizyonları immutable planda bağlar. Aynı seed ve havuz, girdi dizisi sırasından bağımsız seçim verir.

- Sayısal varyant yeni aile sayılmaz; testte **aile başına en çok bir soru**. Öğretici örneğin aynı kaynak revizyonu testte kullanılmaz.
- Zorluk, mikrobeceri, soru ailesi ve temsil kotaları birlikte kontrol edilir. Yüzdeler largest-remainder ile toplam soru sayısını koruyan tamsayı kotalara çevrilir. Mevcut ailelerin farklı varyantlarının farklı ölçülmüş zorluk/format taşıdığı daha geniş havuz için bu sınırlı temsilci yaklaşımı yeniden denetlenmelidir.
- Kullanıcının 10/30/30/30 oranı evrensel yaş kuralı değil **istenen örnek profil**. On soruda hedef 1 başlangıç / 3 orta / 3 ileri / 3 zorlayıcıdır. Pilotun ileri ve zorlayıcı ailesi yok; altı eksik açıkça raporlanır ve plan engellenir. Kolay soruya “çok zor” etiketi konmaz.
- Gerçek altı soruluk yerel inceleme seçimi 3 başlangıç / 3 orta / 0 ileri / 0 zorlayıcı, altı farklı ailedir. Zorluklar **yazar tahmini**, öğrenci verisiyle ölçülmüş kalibrasyon değildir.
- Şu an bütün sorular dikdörtgen tabanlı görsel çoktan seçmelidir. Üçgen/daire, şekil oluşturma, açık uçlu yanıt, farklı dersler veya gerçek karışık sınav temsil çeşitliliği tamamlanmış değildir. Bunlar kaynak/çıktı haritasından ayrı özgün ailelerle genişletilecek.
- `scope.grade=null`, `scope.programVersion=null`; bu kabul edilmiş sınıf ataması değildir. Caller'ın sınıf/program, onay veya zorluk uydurması reddedilir. `learnerReady`, `productionReady`, `publicationReady` false; öğrenci etkinliği/puanı üretilmez.

## Taze kanıt

Ana ajan, güvenilir mevcut Sharp ve gerçek medya opt-in'iyle tam suite'i yeniden çalıştırdı: **628/628 pass, fail 0, skip 0**. Yeni 21 test: motor 11 ve gerçek CLI/çıktı-controller 10. Dar beş dosyalık root koşusu 53/53 geçti. Bağımsız ajan frozen CLI/UI entegrasyonunu 10 testle; diğer bağımsız ajan motoru 11 test + 71 hostile/binding probe ile yeniden inceledi; bildirilen kapsamda yeniden üretilebilir P1/P2 bulunmadı. Diğer ajanın daha büyük kota/oracle alt-deneyi root'ın doğrudan koşusu olarak sayılmıyor.

Gerçek tarayıcıda ana ajan:

1. Eski ekranın on iki ardışık soru kartı ve sonda ders düzenini ekran görüntüsüyle kaydetti.
2. Yeni çıktıyı taze dizine üretti, eski sunulan paketi ayrı yedekte korudu, aynı loopback `127.0.0.1:3338` önizlemesine tutarlı HTML/audit/batch paketi taşıdı. Diğer 3336/3337 sayfalarını değiştirmedi.
3. Yeni başlık/ders ve formül panelini; tek örnek ve kapalı bankayı; altı soruluk gezintiyi; gerekçe-adımı geçiş engelini ve gerçek sonuç açılmasını kontrol etti. Örnekte `14 ÷ 2 = 7 cm` sonucunun bilinmeyen kenar değil **iki farklı kenarın toplamı** olduğu açıklanır.
4. İleri–geri soru geçişinde bir görünür soru, `Adım 1`, kapalı açıklama ve sıfır açık yanıtı DOM'da ölçtü. Öğretici örneğin durumu değişmedi.
5. Varsayılan 843 CSS px ve dar **gerçekte ölçülen 582 CSS px** için yatay sayfa taşması yoktu; not paneli dar görünümde tek sütuna geçti. Araçtan 390 px istendi, fakat gözlenen genişlik 582 idi: **390 px test edildi iddiası yok**, fiziksel mobil cihaz/ekran okuyucu kabulü yok. Geçici viewport override kaldırıldı.

Önce/sonra ekranları ve özel paketler repo dışındadır. Gerçek tarayıcıda formül paneli ve çözüm açma davranışı görülmesi, tam erişilebilirlik, çocuk kullanıcı deneyi veya psikometrik geçerlik değildir. Klavye odak stili ve azaltılmış hareket kuralı vardır; bunlar WCAG sertifikası değildir.

## Fabrikanın sonraki sırası

1. Etkin program → çıktı → mikrobeceri → gerçek aile/temsil ve hangi amaçla sorulduğu matrisi. Kaynak bankalarında soru biçimi, konu ağırlığı, açıklama/örnek/test ayrımı ve zorluk göstergeleri analiz edilir; 10/30/30/30 resmî MEB dağılımı olarak yazılmaz.
2. Hak/sürüm/kanıt ve kaynak önceliği; cevap doğruluğu, semantik/görsel benzerlik ve telif incelemesi. Sayı değişimi özgünlük kanıtı değildir.
3. Bu kavram akışını diğer derslere gerçek ders yazarlığı ve koşullu kısa yöntemle taşı. Önce küçük yaş/çıktı eşlemeli örnekler; sonra dengeli yüzlük üretim işi. Şu anki `100 → 12 taslak / 88 ret / 0 yayın` sayısı değişmedi.
4. Yeni gerekçeli trace'ten gerçek kaynak geometrisi/genel renderer ve yeni doğrulanmış TTS metnine geç. Clef yalnız danışma katmanı; otomatik kaynak kopyalama, model güveniyle yayın veya eski sesin yeni metne etiketlenmesi yok.

## Video durumunun açık düzeltmesi

“Video işi çözüldü, yalnız seri üretim eksik” doğru durum değildir. **Mevcut sesli/kalemli küçük pilot** bu koşuda yeniden `ffprobe` ve tam decode ile doğrulandı: 1280×720, H.264 + AAC, 36.375 saniye, 885.717 bayt. Bu eski pilot, bu teslimin yeni gerekçeli metinlerinin sesi/videosu değildir. Genel renderer, yeni ses/metin bağı ve kelime–kalem senkron ölçümü hâlâ açık; medya işleri hazırlamak, yeni sesli MP4 üretmek veya uzman dinleme kabulü değildir.
