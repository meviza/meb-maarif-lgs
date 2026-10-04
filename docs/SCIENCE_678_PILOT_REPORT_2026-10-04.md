# 6–8. Sınıf Fen Bilimleri: Soru Odaklı Pilot

## Sonuç Ve Gerçek Sayılar

Kullanıcının isteği, her sınıfta 50 fizik, 50 kimya ve 50 biyoloji sorusu olmak üzere toplam 450 özgün, görselli, gerekçeli sorudur. Bu kontrol noktası **54 yazılmış taslak** sunar; **396 soru henüz hazırlanmadı**. Uzman kabulü, ürün yayını ve öğrenci teslimi sıfırdır. Fizik/kimya/biyoloji, resmî Fen Bilimleri dersi içindeki editoryal raporlama ayrımlarıdır.

| Sınıf | Fizik | Kimya | Biyoloji | Toplam | Hedefe Kalan |
| --- | ---: | ---: | ---: | ---: | ---: |
| 6 | 6 | 6 | 6 | 18 | 132 |
| 7 | 6 | 6 | 6 | 18 | 132 |
| 8 | 6 | 6 | 6 | 18 | 132 |
| Toplam | 18 | 18 | 18 | 54 | 396 |

27 editoryal ailede en fazla iki varyant vardır. Bunlar 24 ayrı teknik model görevi ve altı model türüne bağlanır; bu üç farklı payda birbiriyle karıştırılmaz. Varyantlar aynı ID'nin veya yalnız sayı/etiketlerin kopyası değildir; verilen, koşul veya istenen görev değişir. Arayüzde ilk tur farklı aileleri, ikinci tur diğer varyantları gösterir.

## Kaynak Omurgası

[Kaynak blueprint'i](SCIENCE_678_SOURCE_BLUEPRINT_2026-10-04.md) dört mevcut resmî PDF'nin byte/hash kontrolü, 42 sayfalık metin kanıtı ve seçili dört sayfanın görsel incelemesine dayanır; bu faz yeni kaynak indirmedi. 6/7 için TYMM, 8 için ilgili eski program adayının dönem bağlantısı ayrı tutulur. Hedef okulun etkin yıllık planıyla son eşleme henüz yapılmadı.

- [MEB TYMM Fen Bilimleri programı](https://tymm.meb.gov.tr/ogretim-programlari/ders/fen-bilimleri-dersi).
- [MEB eski Fen Bilimleri program kaydı](https://mufredat.meb.gov.tr/ProgramDetay.aspx?PID=325).

Blueprint'te 132 program çıktı kodu bulunur. Pilot, bunların 27'sine referans verir; 105'i henüz örneklenmemiştir. Bu referans sayısı, 27 çıktının tüm mikrobecerilerinin kapsandığı anlamına gelmez. Dokuz sınıf–alan hücresindeki açık kodlar [bağımsız audit kaydında](SCIENCE_678_INDEPENDENT_AUDIT_2026-10-04.md) listelenir. Seçili arşiv soru-biçimi gözlemleri, bütün 2018–2024 sınavlarının soru ağırlığı veya zorluk dağılımı istatistiği değildir.

Soruların metinleri ve verilenlerden çizilen SVG'ler özgün pilot yazımıdır. Kaynak PDF, soru metni veya kaynak görseli Git'e kopyalanmadı. Tam arşiv benzerlik/özgünlük karşılaştırması, ticari kaynak haklarının başlık/baskı bazlı son kabulü ve uzman yayını hâlâ açık kapılardır.

## Soru, Çözüm Ve Görsel Hattı

Her pakette kaynak sürümü/sayfası/çıktı kodu, verilenler, dört seçenek, yanlış seçenek gerekçeleri, çözüm stratejisi, adımların nedenleri, ara sonucun anlamı, sonucun kontrolü ve kısa püf nokta bulunur. Yapılandırılmış bilimsel model cevap anahtarını okumadan sonuç çıkarır. Yanlış anahtar, imkânsız koşul veya sahte çıktı kodu negatif testlerle reddedilir.

Bu matematiksel/sonlu model kanıtı serbest Türkçe metnin tamamını doğrulamaz: yanlış seçenek metni doğru typed claim ile birleştirildiğinde teknik geçiş hâlâ mümkün olabilir. Sistem bu sınırı `freeTextSemanticReview:pending` ve `publicationReady:false` ile açık tutar. 54 kanonik taslak ayrı yazar öz-incelemesi ve farklı ajan tarafından metin/model/görsel incelemesinden geçti; bu öğretmen/ölçme uzmanı kabulü değildir.

Görseller aynı verilenlerden çizilir: karşıt kuvvetler, ışın/normal, parçacık kümeleri, boş çaprazlama tablosu, besin ağı, gerçek başlangıç/son sıvı seviyeleri; diğer görevlerde okunabilir deney tabloları ve koşul kartları. 54 SVG, 54 ayrıntılı fiziksel illüstrasyon diye etiketlenmez. Görsel cevap anahtarını doğrudan işaretlemez. Bu yeni Fen diliminde TTS veya çözüm videosu üretilmedi; eski ses/video yeni sorulara yeniden etiketlenmedi.

## JEV Ve Kullanıcının Seçtiği Clef Flash

Gerçek eski `JevQualityAuditor`, her paket için çağrılır. Bu **yerel sezgisel JavaScript denetimidir**, TypeSafe JEV model/API çağrısı değildir. 54 yürütmeden 15'i prototip screen koşullarını geçti; prototip 16 çıktı kodunu tanıdı, 38 yeni FB kodunu tanımadı. Bu yüzden 54 denetimi 54 model onayı veya 54 uzman kabulü olarak saymıyoruz. Resmî kaynak eşlemesi ayrı blueprint/pin denetimindedir. [JEV sınır kaydı](SCIENCE_JEV_SCREEN_EVIDENCE_2026-10-04.md).

Kullanıcı mevcut Cloudflare / Clef Flash'ı seçti. Clef, yeni soru yazarı değil, tipli karar/ön-denetim katmanıdır. [Resmî Clef Flash sözleşmesi](https://developers.cloudflare.com/workers-ai/models/clef-flash/) `state + questions` girişini tanımlar.

Gerçek bankadan üç sabit 8. sınıf sorusu için altı `noul` karar isteği hazırlanır: belirsizlik ve cevabın verilenlerle desteklenmesi. İsteklerin boyutları 4.349 / 3.995 / 4.532 bayttır; soru/kaynak/banka/istek SHA'larına bağlıdır. Cevap anahtarı yazar iddiası olarak etiketlenir; bilimsel oracle çıktısı modele doğruluk varsayımı olarak gönderilmez. Hazırlık metinlidir: SVG görsel diye gönderilmez, raster/görsel denetimi iddia edilmez.

Ayrı `runScience678ClefPilot` taşıma API'si bu gerçek hazırlığı tüketir; keyfi model/URL/payload veya varsayılan credential/fetch yolu yoktur. Açık, güvenilir çağırıcı yetkisi ve fetch bağımlılığı zorunludur. En fazla üç sıralı istek, ilk hatada durma, sıfır retry, redirect reddi, istek başına 15 saniye ve 64 KiB yanıt sınırı vardır. Geç dönen yanıtın gövdesi de iptal edilir. UTF-8, çift JSON anahtarı, tipli iki olasılık ve usage negatif testleri geçmiştir. Fixture sonucu dış canlı çağrı diye sayılmaz. Resmî Clef zarfı ile resmî System One/JEV örneklerinden çıkarılan yanıt grameri, gerçek Clef yanıtıyla doğrulanana kadar `primary_cross_doc_pending_live_confirmation` olarak etiketlenir.

Bu kayıt anında canlı Clef çağrısı **0**. Cloudflare UI'da Workers Free planı ve önceki Workers AI tokenının aktif kaydı görüldü; korumalı yerel dosyadaki token alanı boştu. Dünkü teslim kaydı da önceki anahtarın yalnız verify isteğinde kullanıldığını ve kaydedilmediğini söylüyor. Anahtarın gizli değeri [Cloudflare'a göre yalnız bir kez gösterilir](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/); mevcut aktif kayıt anahtarın yeniden okunabildiğini göstermez. Yeni dar kapsamlı token taslağı hazırlanmış, son oluşturma onayı beklemektedir. Eski token değiştirilmedi/silinmedi; yeni token oluşturuldu veya bağlantı çalıştı diye sayılmadı. Hesap kimliği, e-posta veya token bu kamu raporunda yoktur.

Yeni masraf bütçesi 0'dır. [Workers AI Free planı günlük kotadan sonra istekleri durdurur](https://developers.cloudflare.com/workers-ai/platform/pricing/); ücretli plana geçilmedi. Planın Free olması, kalan günlük kotanın ölçüldüğü anlamına gelmez. Sonraki canlı deneme en fazla üç küçük istek, tekrar yok, hata halinde durma ve ücretli yükseltme yok sınırındadır.

## Zorluk, Bloom Ve Öğrenci Analitiği

Mevcut yazar tahmini: 10 kolay, 35 orta, 9 zor, 0 çok zor. Görev-talebi etiketleri: 10 anlama, 13 uygulama, 31 çözümleme. Her varyantın ayrı görev/yük gerekçesi vardır. Yanıt yerleri A14/B14/C13/D13'tür; dağılım ölçme geçerliği değildir.

Kullanıcının örnek test karışımı olan %10/%30/%30/%30, 50 soruluk her hücre için 5/15/15/15 editoryal hedeftir; pilot bu profili karşılamaz. MEB'in resmî yıllık sınav oranı diye sunulmaz. Bloom bir görev/hedef dili olarak kullanılır; [Iowa State'in öğretim çerçevesi](https://celt.iastate.edu/prepare-and-teach/design-your-course/blooms-taxonomy/) bu ayrımı destekler. Öğrencinin bilişsel/sezgisel gelişimi, zekâ türü, akademik benliği veya mesleğe uygunluğu bu pilotta ölçülmedi. Gerçek öğrenci verisi, psikometrik kalibrasyon ve Fen bankasına bağlı öğrenci DB yazımı yoktur.

## Gerçek Süre Ölçümü

Bir yerel koşuda mevcut 54 stok için banka hazırlığı **89,372 ms**, ayrı editör render'ı **87,160 ms** sürdü. Render dahili olarak aynı bankayı yeniden kurduğu için iki build / toplam 108 gerçek yerel JEV yürütmesi vardır; yeni soru sayısı yine 54'tür, 108 değildir. JSON 541.379 bayt, HTML 330.864 bayttır.

Bu, sabit yazılmış soruların yerel hazırlık hızıdır. Canlı metin üretimi, raster denetimi, alan uzmanı kabulü veya 450 sorunun üretim süresi değildir. Gerçek üretici denemesi olmadığından 450 için dakika/saat tahmini henüz kanıtlı olarak verilemez. Seri üretim ölçümü, tek küçük tam çevrimden sonra kabul edilen soru/süre ve ret oranıyla yapılacaktır.

## DAMA Ve Süreç Kalitesi

Paketler amaç, sürüm, kaynak/lineage, hash, kalite aşaması, yerel editör erişimi ve audit bilgisini taşır. Owner/steward ve saklama/silme kararları hâlâ pending'dir. Hash, kimlik doğrulama veya yayın yetkisi değildir. TDD RED→GREEN, bağımsız inceleme, negatif test ve [gerçek tarayıcı kanıtı](SCIENCE_678_BROWSER_EVIDENCE_2026-10-04.md) CMMI/SPICE hazırlık izidir; sertifika, seviye belgesi veya pedagojik onay değildir.

Yeni Drive/Docker aktarımı, okul tenant işlemi, SDK/model indirmesi, TTS/video veya gerçek kurum/çocuk verisi yoktur. Önceki sentetik SQL/defter dilimleri bu yeni Fen paketlerine bağlanmış öğrenci analitiği olarak sayılmaz.

## Sıradaki Faz: Çeşitlilik Ve Canlı Danışma

1. Yetkili anahtarı sohbet/Git dışında güvenli yapılandır; yalnız Free planında üç küçük Clef denemesini gerçek request/response ve süre kanıtıyla yap. Karar sonucu otomatik yayın izni değildir.
2. Kaynakların eksik 105 çıktı kodu ve her mikrobeceri/temsil için yeni özgün aile brief'leri çıkar. En fazla iki varyant sınırı korunursa 450 için en az 225 aile gerekir; mevcut 27'ye ek 198 aile hâlâ tasarlanmalıdır.
3. Önce zor/çok zor düzeylerin gerçek çok-adımlı, deney/veri okuma ve yeni duruma transfer görevlerini genişlet; etiketi yapay yükseltme. Her 50'lik hücreyi gerçek farklı aile/temsil ve anlamlı çeldiricilerle doldur.
4. Türkçe seçenek–model–çözüm uyumu, özgünlük/benzerlik, bilimsel görsel ve ölçme/yaş incelemesini bağımsız kapılarda yap. Teknik geçen, uzman kabul edilen ve yayımlanan sayıları ayrı tut.
5. Kabul edilen içerikte aynı gerekçeli trace'i yeni TTS/kalem/video hattına, ardından yetkili sentetik öğrenci olayları ve veri modeline bağla. Fiziksel cihaz ve öğrenci rolünün sınıf dışı kaynakları kapatması ayrı kabul kapısıdır.

## Teknik Doğrulama Durumu

İlgili bilim modüllerinde kaynak/yanlış cevap/koşul/hook/mutasyon/çıktı sınırı ve CLI/HTTP/transport negatif testleri vardır. Son donmuş koddan ana ajan gerçek medya opt-in'i ve mevcut güvenilir Sharp ile tam repo koşusunu yürüttü: **1.539 / 1.539 PASS, 0 FAIL / SKIP / CANCEL / TODO**, çıkış kodu 0; `duration_ms 45852.705167`. Shell pipeline'da `pipefail` etkin olduğundan çıkış kodu son görüntüleme komutunun değil test başarısının tanığıdır.

Bilim dilimindeki 108 test ve farklı ajan tarafından 68 kaynak/cevap/görünüm testi geçti. Taşıma/preflight'ın farklı yazarından bağımsız 24 test de taze geçti; bunlar ayrı sayılardır, 1.539'a tekrar eklenmez. Önceki tam koşu devam eden TDD düzenlemesiyle çakıştığından final kabul diye sayılmadı. Fixture ve testler yeni 450 soru, canlı API, uzman kabulü veya ürün videosu sayısı değildir.

Taşıma katmanının bağımsız salt-okunur incelemesinde ayrıca sekiz bozuk yanıt tanığı (kaçışlı çift JSON anahtarı, sonsuz olasılık, sınırı aşan usage, null usage, prototype anahtarı, metin cevap ve beklenmeyen onay alanı) reddedildi. İkinci istekte hata tanığında üçüncü istek yapılmadı. Gerçek 15 saniyelik sınırdan sonra gelen geç yanıtın gövdesi iptal edildi; karar, yanıt hash'i veya başarı üretmedi. Küresel fetch ve retry sayıları sıfır kaldı; donmuş dosya hash'leri değişmedi. İnceleme sonucu bu dar teknik kapsam için PASS'tir; canlı erişim, ölçülmüş kota, görsel denetim veya uzman/yayın kabulü değildir.

Yerel benchmark banka içerik kimliği `19f2dd31b595370d98429e2581e1788405899f1092497dafc5586cc8c71831f9`; HTML SHA `13ebea1418ac95e8e3397f64db6063d709aba1556e6bcfca9bdf552aa42aba9f`. `.env.local` ile özel ekran çıktılarının Git dışında kaldığı ayrıca doğrulandı. Dar metin/marker taraması genel güvenlik sertifikası değildir.
