# Kaynak ve soru kapsamı — kabul ölçütleri, 3 Ekim 2026

## Karar ve bugünkü durum

Hedef yalnız öğretim programlarını almak değildir: **1–8. sınıfın programı, konu anlatımı/ders kitabı ve etkinlikleri, soru/çalışma bankaları, 2018–2024 sınav–örnek soru arşivleri ve uygun TÜBİTAK referansları** ayrı kaynak aileleri olarak izlenir. Bir program PDF'si, bütün konuların anlatıldığı veya bütün soru türlerinin üretildiği anlamına gelmez.

Bu belge kabul gereksinimidir; tam kaynak arşivi, tam soru bankası, uzman onayı, MEB onayı veya öğrenciye yayın kanıtı değildir. Mevcut durum **kısmi kaynak edinimi + sınırlı katalog keşfi**dir. `full_sources_verified` ve `full_question_coverage` iddiaları kapalıdır.

3 Ekim kayıt anlık görüntülerinden yeniden sayılan durum:

| Kanıt | Gerçek kayıt durumu | Kanıtlamadığı |
| --- | --- | --- |
| `sources/meb-reference-registry.json` | 34 indirme; 142.959.822 bayt; 8 eski TYMM bağlantısı başarısız | Tüm kitaplar, aylık örnekler veya geçmiş programların tamamı |
| `sources/education-reference-supplement.json` | 10 indirme; 0 başarısız; 33.935.429 bayt; beklenen SHA-256 sabitlenmiş | Bütün sınıf–ders–çıktı kapsamı veya PDF semantik kabulü |
| Birleşik kayıt | 44 indirilen PDF; 176.895.251 bayt; toplam 52 kayıt, 8 açık başarısızlık | 44 özgün ürün sorusu veya 44 onaylı eğitim nesnesi |
| TYMM temel eğitim katalog yürüyüşü | 8 sayfa, 143 tekil katalog kaydı; 117'si sınıf 1–8; 17 sınıf-atamasız seçmeli, 9 sınıf aralığı dışı | Diğer resmî portalların kapanışı veya 143 PDF indirmesi |

Katalog kanıtı repo dışındaki `outputs/tymm-book-catalog-night-v1.json` dosyasıdır; gözlem zamanı `2026-10-03T18:56:05.996Z`. Sınıf 1→8 kayıt sayıları **11, 12, 12, 2, 28, 24, 18, 10**dur. Bunlar **backend'in sınıf atadığı kayıt sayıları**dır; materyalin semantik sınıf kapsamı veya ders sayısı değildir. Örneğin katalog kimliği 179 olan 1–4 öğretmen kılavuzu backend'de 1'e, kimliği 180 olan 5–8 kılavuzu 5'e atanmıştır; bu atama diğer sınıfları yok saydırmaz ve her sınıf için otomatik tamlık da vermez. Kitap parçaları, çalışma/öğretmen kitapları, çoklu yabancı dil ve seçmeli içerikler ayrıştırılmalıdır. Özellikle bu katalogdaki 4. sınıfın iki kaydı Arapça ve DKAB'dır; 8. sınıfın on kaydı da ana derslerin tamamını temsil etmez.

Ek on PDF'nin türleri: iki 4. sınıf program kataloğu (vatandaşlık, trafik), bir 6. sınıf İngilizce çalışma kitabı, iki beceri testi, bir çalışma fasikülü ve TÜBİTAK ortaokul matematik 2024/2026 I. aşama soru–çözüm çiftleri. TÜBİTAK kayıtları zenginleştirme referansıdır; sınıf müfredatına otomatik eşdeğer değildir. Soru–çözüm kayıtlarında karşılıklı `pairedSourceId` olması çözüm doğruluğunu kanıtlamaz.

Kayıtlardaki PDF doğrulaması HTTPS/izinli adres, PDF başlığı, boyut sınırı ve SHA-256 bütünlüğüdür. Her iki kayıt grubunda `semanticReview: not_performed`, `rightsReview: pending`, `usagePolicy: reference_only`, `reuseRights: unverified` korunmuştur. Bu belge bütün dosyaların bağımsız semantik incelemesini yapmış sayılmaz.

## Beklenen kapsam: önce payda

Aşağıdaki **42 ana sınıf–ders hücresi**, kullanıcının ana ders odağından çıkarılan ürün aday profilidir; resmî haftalık ders çizelgesi veya bütün zorunlu/seçmeli ders listesi değildir. Etkin okul yılı, okul türü ve resmî ders çizelgesiyle içerik kurulu tarafından kesinleştirilmelidir.

| Sınıf | Ana ders adayları | Hücre sayısı |
| --- | --- | ---: |
| 1 | Türkçe, Matematik, Hayat Bilgisi | 3 |
| 2 | Türkçe, Matematik, Hayat Bilgisi, İngilizce | 4 |
| 3 | Türkçe, Matematik, Hayat Bilgisi, Fen Bilimleri, İngilizce | 5 |
| 4 | Türkçe, Matematik, Fen Bilimleri, Sosyal Bilgiler, İngilizce, DKAB | 6 |
| 5 | Türkçe, Matematik, Fen Bilimleri, Sosyal Bilgiler, İngilizce, DKAB | 6 |
| 6 | Türkçe, Matematik, Fen Bilimleri, Sosyal Bilgiler, İngilizce, DKAB | 6 |
| 7 | Türkçe, Matematik, Fen Bilimleri, Sosyal Bilgiler, İngilizce, DKAB | 6 |
| 8 | Türkçe, Matematik, Fen Bilimleri, T.C. İnkılap Tarihi ve Atatürkçülük, İngilizce, DKAB | 6 |

4. sınıf İnsan Hakları, Vatandaşlık ve Demokrasi ile Trafik Güvenliği ayrı kapsam adaylarıdır; iki PDF alınması uygulanacak okul yılını kesinleştirmez. Bu ikisinin kabulü ana profili 44 hücreye çıkarır. Görsel sanatlar, müzik, beden eğitimi/oyun, bilişim, rehberlik, seçmeli ve okul türüne özel dersler bu 42'de yoktur. Bu ürün profilinde kapsamı ayrıca kararlaştırılacak derslerdir; **resmî olarak hepsi seçmeli veya gereksiz** denmez. “Bütün 1–8 müfredatı” vaadi için bunlar da resmî çizelge karşılaştırmasında açık karar ister. Kapsam dışı karar, tam resmî kapsam iddiasına dönüştürülemez.

Her onaylı sınıf–ders–okul yılı için ayrı ayrı aşağıdaki paydalar oluşturulur:

| Payda | Gerekli içerik | Tamamlama hesabı |
| --- | --- | --- |
| Kaynak belgeleri | Etkin program + ders kitabının bütün parçaları + gerekli öğrenci/etkinlik/çalışma kitabı ve kılavuzları; tanımlı soru arşivi serileri | İncelenen beklenen belge/parça / bütün beklenen belge/parça; eksik ve alınamayanlar görünür |
| Öğrenme çıktıları | Etkin resmî sürümdeki bütün çıktı/kazanım kodları ve kapsam sınırlamaları | Kanonik eşlemesi kabul edilen çıktı / bütün resmî çıktılar |
| Süreç bileşenleri | Çıktıların alt bileşenleri, ön öğrenmeleri, kanıtı, farklılaştırma ve gerekli temsil biçimleri | Karşılanan zorunlu bileşen / bütün onaylı zorunlu bileşenler |
| Üretim hücreleri | Çıktı → mikro beceri → soru/etkinlik tipi → amaç → bilişsel süreç → zorluk → temsil/varyant | Kotası ve gerekli varyantları kabul edilen hücre / bütün onaylı gerekli hücreler |

Payda yalnız indirilenlerden türetilemez; aksine resmî beklenen kapsamdan türetilir. Payda henüz kapanmadıysa oran **bilinmiyor**dur, yüzde 100 değildir. Aynı PDF'nin ikinci URL'si, aynı soru revizyonunun yeni kimliği veya aynı kitap parçasının kopyası yeni kapsam sayılmaz. Tek soruya çok sayıda hedef etiketi eklemek hedefleri ayrı ayrı ölçtüğünü kanıtlamaz; birincil kota hücresi ve ikincil kanıt bağlantıları ayrılır.

2018–2024 LGS'nin yedi yıl × iki gerçek sınav kitapçığı ayrı kapanmış edinim alt kapsamıdır. Aylık örnekler, çalışma bankaları ve bursluluk/diğer arşivler bu 14 dosyaya eklenmiş sayılmaz; her serinin yıl–dönem–parça envanteri ayrı kapanır. 2020 LGS kapsamının birinci dönemle sınırlı olması, soru dağılımını bütün sezonun temsili kabul etmeyi engeller. “Değişmeyen beceri” daha fazla üretim için aday olabilir; resmî sürüm eşlemesi, güncel kapsam ve insan gerekçesi olmadan kota artırma kuralı değildir.

36 hafta ürün planlama görünümüdür; resmî takvim/öğretim saati yerine geçmez. 36.000 soru hacim hedefidir; mikro beceri dengesi veya kalite kabulünün alternatifi değildir. Konu anlatımı ve etkinlikler için soru sayısından bağımsız kapsam ve kabul ölçütü tutulur.

## Kaynak durumlarının anlamı

Bu etiketler raporlama/kabul sözlüğüdür; hepsinin yeni bir çalışan API alanı olarak uygulandığı iddia edilmez. Kayıttaki mevcut alanlar korunur, yükseltme için yeni kanıt gerekir.

| Durum | İstenen kanıt / sınır |
| --- | --- |
| `discovered` / `metadata_only` | Resmî giriş, kitap kimliği, URL, sınıf/ders adayı; PDF alınmış değildir |
| `downloaded_integrity_verified` | İzinli URL zinciri, gerçek PDF baytları, boyut, hash; semantik kapsam değildir |
| `semantic_review_pending` | Başlık/yıl/sınıf/ders/parça, içindekiler, sayfa ve çıktı eşlemesi henüz kabul edilmemiş |
| `source_semantically_verified` | Gerçek PDF'nin ilgili metin/görselleri, parçaları ve çıktı bağlantısı insan incelemesiyle sürüm/hash/sayfaya bağlı |
| `missing` / `failed` / `blocked_by_size` / `access_restricted` | Ayrı neden, son deneme ve sonraki işlem; paydadan sessizce çıkarılamaz |
| `withdrawn` / `superseded` | Geri çekme/yerine geçen resmî sürüm kanıtı; tarihî kayıt korunur, etkin payda değişimi ayrıca onaylanır |
| `reference_only` / `reuseRights: unverified` | Kamuya erişim ticari kullanım, yeniden barındırma, model girdisi veya eğitim izni değildir |

Örneğin 1. sınıf Türkçe birinci kitap için gözlenen yaklaşık **208 MB** PDF, mevcut 25 MiB dosya sınırını aşar. Yalnız HEAD/metaveri gözlemi `metadata_only`/`blocked_by_size`dür; küçük bir kapak veya sentetik PDF ile “kitap indirildi”ye çevrilemez. Büyük kitaplar onaylı depolama/bütçe tasarımı bekler; sınır sessizce yükseltilmez. Drive'da 5 TB kapasite bulunması bağlantı, hak, aktarım, yedek veya geri yükleme doğrulaması değildir.

2026–2027 TYMM uygulaması 1–3 ve 5–7 olarak duyurulmuştur; bütün derslerin her sınıfta aynı tarihte devreye girdiği varsayılmaz. 4 ve 8 için TYMM katalog boşluğu **müfredat yok** demek değildir. Resmî eski MEB 2018/2019 programları, ÖDSGM ve EBA kitap/çalışma kaynakları ayrı fallback envanteridir; etkin yıl ve ders uygulanabilirliği doğrulanır, yeni TYMM etiketi yapıştırılmaz. EBA oturum gerektiren kaynaklar `access_restricted` kalır; kamuya açık ana sayfa tam ders arşivi erişimi sayılmaz. Lise OGM/MEBİ kaynağı ortaokul tamlığına eklenmez.

## Somut kapsam matrisi

Her satırın anahtarı en az `academicYear + programVersion + grade + courseKey + outcomeCode + processComponent + microSkillId + itemType + instructionalPurpose + representation`dır. Amaç örnekleri: ön öğrenmeyi tanıla, kavramı kur, uygulama, yanlış kavramı ayırt et, stratejiyi karşılaştır, başka bağlama aktar. Zorluk tahmini ile pilotta ölçülmüş güçlük ayrı tutulur.

Satırda kaynak kimliği/hash/PDF sayfası, etkinlik ve konu anlatımı kimliği/revizyonu, onaylı blueprint hücresi, hedef kota/varyantlar, özgün soru revizyonları, görsel/ses/erişilebilirlik kanıtı, cevap/rubrik, inceleyenler ve açık eksik nedeni bulunur. Kaynaktaki soruların sayısı ayrı sütundur; **ürün soru kotasına eklenmez**.

| Sınıf–ders / hedef adayı | Mikro beceri ve amaç | Tür / gerekli temsil | Bugünkü kabul sınırı |
| --- | --- | --- | --- |
| 5 Matematik / `MAT.5.4.4` | Dikdörtgen çevre–alan ilişkisinde verilen/isteneni ayırt et; stratejiyi gerekçelendir ve aktar | Nicel problem; ölçüleri doğru diyagram; sonuç/birim kontrolü | Program sayfalı aday var; bütün süreç bileşenleri, varyantlar ve uzman kabulü tamam değil |
| 6 Matematik / `MAT.6.4.2` | Dikdörtgenden paralelkenar/üçgen alanına geçişi açıklama | Dönüşüm/görsel muhakeme; eş alan parçaları | Dikdörtgeni tek başına çözmek bu yeni hedefi kapsamaz; ön öğrenme ve yeni hedef ayrı satırlar |
| 6 İngilizce / çıktı kodu bekliyor | Çalışma kitabı etkinliğinden resmî çıktı ve iletişim amacını eşle | Görev türü, bağlam ve gerekli işitsel/metin alternatifini incele | Gerçek çalışma kitabı var; çıktı/mikro beceri kapsamı henüz semantik kabul değil |
| 7 Fen / çıktı kodu bekliyor | Birinci ünite beceri testinin kavram, kanıt ve yorum hedeflerini ayrıştır | Deney/tablo/grafik türü kaynağa göre belirlenir | Gerçek arşiv testi var; güncel TYMM eşdeğerliği ve tüm üniteler doğrulanmadı |
| 8 Türkçe / çıktı kodu bekliyor | Ana fikir, çıkarım, kanıt, metin/grafik ilişkisi gibi adayları resmî hedeflerden ayrıştır | Metin ve gerekirse grafik; yanıtın metindeki dayanağı | Genel “paragraf” etiketi veya LGS dosyası bütün alt türleri kapsamaz |
| 1 Türkçe / çıktı kodu bekliyor | Okuryazarlık öncesi yönergeyi anlama ve hedefe uygun tepki | Okuma zorunluluğu olmayan görsel/işitsel etkinlik ve alternatif | Çoktan seçmeli uzun metinle kapsam kapatılamaz; yaş/öğrenme amacı uzman incelemesi bekler |

Bunlar **aday/eksikliği görünür örnekler**dir; listelenen alt türler resmî tamamlanmış taksonomi değildir. Havuz/işçi/yaş gibi adlar da ilgili sınıfın etkin resmî hedefinde yoksa sırf yayıncılarda bulunduğu için zorunlu mikro beceriye dönüşmez.

Mevcut `question_coverage_blueprint.mjs` çıktı, `microSkillId`, madde/yanıt tipi, bilişsel süreç, zorluk, kota/varyant ve görsel/işitsel gereksinimleri bağlar. **Ayrı süreç-bileşeni kimliği ve soru öğretim amacı alanı yoktur**; `dataGovernance.processingPurpose` bu pedagojik amacın yerine geçmez. Bu ek matris ihtiyacı yetkili kaynak ayrıştırması ve sürümlü sözleşme/adapter geliştirmesi bekler. Saf sözleşmenin `coverage_evaluated`, `coverage_review_ready` veya `scopeCoverageComplete` sonucu, resolver'ın gerçek resmî paydayı kapattığını tek başına kanıtlamaz.

## İki ayrı tamlık kapısı

`full_sources_verified` **yalnız belirtilen, sürümlü kaynak kapsamı için** aşağıdakilerin tamamı sağlandığında kullanılabilir:

1. Resmî program, ders/kitap, etkinlik/çalışma ve tanımlı soru arşivi kataloglarının kapsamı kapanmış; bütün sayfa/seriler gezilmiş, eksik bağlantılar ve fallback'ler uzlaştırılmıştır. Tek TYMM endpoint kapanışı yeterli değildir.
2. Resmî ders çizelgesinden onaylı sınıf–ders–etkin yıl paydası; bütün çıktı/kazanımlar, süreç bileşenleri ve gerekli temsil bağlantıları çıkarılıp kaynak sayfalarıyla kabul edilmiştir.
3. Beklenen bütün kitap parçaları ve gerekli belgeler gerçekten alınmış; PDF bütünlüğü/hash yanında başlık, sürüm, sayfa, içindekiler, etkinlik ve görseller **semantik olarak incelenmiştir**. HEAD, URL, metin içinde kod bulma veya fixture bu incelemenin yerine geçmez.
4. Her sınıf/ders için etkin okul yılı ve geçiş durumu; eski–yeni sürüm/değişim ve geri çekmeler doğrulanmıştır. Kapsam içi `knownMissingCount = 0`; açık başarısız/erişilemeyen/bütçeli bekleyen belge yoktur.
5. Kaynak sahibinin/steward'ın kapsam kabulü, gözlem zamanı, tüm kaynak/inceleme özetleri ve açık hak durumu kayıtlıdır. Kaynak tamlığı **yeniden kullanım izni vermez**; `reference_only` sınırı sürer.

`full_question_coverage` bunlara ek olarak **ayrı üretim bankası kapısı** ister: her onaylı matris hücresinde özgün ürün kotası/varyantı ve konu anlatımı/etkinlik bağları; doğru cevap/rubrik ve gerekçeli öğretim; kaynak benzerliği/hak, yaş/erişilebilirlik ve görsel–sayısal doğruluk kontrolleri; aynı değişmez revizyonda bağımsız akademik, ölçme, haklar ve erişilebilirlik insan kabulü. Gerekli pilot/madde analizi kaydı bulunmadan zorluk “ölçülmüş” denmez. Yazar kendi bağımsız incelemesi değildir. Revizyon veya varlık değişince eski kabul otomatik taşınmaz.

Her soru/çözüm/anlatımda **ne verilmiş → ne isteniyor → neden bu yol → işlem/metin/deney kanıtı → ara sonucun anlamı → sonucun kontrolü → stratejinin koşulu ve aktarımı** zinciri yaşa ve derse göre uygulanır. Gereksiz aritmetik, ezber kalıp veya yalnız son cevabı okumak kapsam kabulü değildir. Kaynakta benzer soru bulunması doğruluk kanıtı değildir; çözüm bağımsız doğrulanır.

Kapsam kabulü ile yayın/öğrenci teslimi ayrı kapılardır. Mevcut gerçek uzman kabulü ve yetkili sunucu kaynak çözümleyicisi bağlanmadan **onaysız yayın kapalı** kalır; otomatik/model olumlu kararı insan kabulünü açmaz. Bu ölçütler DAMA izlenebilirlik/kalite yaklaşımıdır; CMMI/SPICE, pedagojik veya MEB sertifikasyonu değildir.

## Kabul ve olumsuz örnek testleri

Aşağıdakiler uygulanacak davranış/kabul örnekleridir; bu belge bu testleri gerçek tam arşiv veya gerçek üretim bankası üzerinde çalıştırmış sayılmaz. Mevcut otomatik sözleşme testleri sentetik girdilerle bazı teknik sınırları kanıtlar; kaynak otoritesini, bütün paydayı veya gerçek uzman kararını kanıtlamaz.

| Kapı | Olumlu örnek: kabul için gereken | Olumsuz örnek: ret/açık eksik |
| --- | --- | --- |
| Katalog kapanışı | Bütün tanımlı girişler/seriler, parça sayıları ve kapsam dışı nedenler uzlaştırılmış | 8 TYMM sayfası gezildi diye EBA/ÖDSGM ve bütün 1–8 arşivini tamam say |
| PDF gerçekliği | Doğru sınıf/ders/yıl/parça; gerçek bayt/hash ve sayfaya bağlı semantik inceleme | 208 MB kitabın yalnız HEAD'i, kapak PDF'si veya fixture'ı ile kitabı tamam say |
| Etkin program | Etkin yıl ve resmî geçiş/ders kararı doğru satırla bağlı | 4/8 eski programını otomatik TYMM yap; bütün derslere aynı devreye giriş yılını uygula |
| Tam payda | Eksik resmî çıktı/bileşen ve beklenen parça sıfır; sürümlü kabul kayıtlı | Eksik çıktıyı girdiden çıkarıp oranı yüzde 100 yap; başarısız URL'yi sil |
| Mikro beceri/amaç | Tam hedef, süreç, öğretim amacı ve gerekli temsil aynı hücrede ölçülüyor | 1.000 “paragraf” etiketiyle bütün çıkarım/kanıt/grafik alt hedeflerini doldur |
| Kota/tekillik | Bağımsız özgün revizyonlar, her gerekli varyant ve hücre kotası tamam | Bir revizyonu farklı ID ile tekrar say; bir konuda fazla soru ile diğer konu eksiğini kapat |
| Ön öğrenme sınırı | 6. sınıf alan dönüşümü gerçekten ölçülüyor, ön öğrenme ayrıca etiketli | Yalnız dikdörtgen çevresiyle `MAT.6.4.2`yi tamam say |
| Kaynak/ürün ayrımı | Kaynak soru sayısı analiz sütununda; özgün ürün bankası ayrı kabul edilmiş | MEB/TÜBİTAK PDF'lerindeki soruları 36.000 ürün sorusuna ekle veya yalnız ad/sayı değiştir |
| Hak/temsil | Amaç için izinli varlık; doğru diyagram/birim; okunabilir ve alternatif temsil | Açık erişimi ticari lisans say; görsel gereken hedefte metinle geç; okunamayan küçük etiket |
| Gerekçeli öğretim | İşlemin/metin kanıtının neden seçildiği, sonuç anlamı ve geçerlilik koşulu açık | Açıklamasız `18/2×3=27`, metne dayanmayan çıkarım veya her soruya aynı kısa yol |
| İnsan kabulü | Bağımsız yetkili kararlar tam değişmez revizyon/varlık setini hedefliyor | Model kararı, sentetik `approved` kaydı, yazarın öz onayı veya değişmiş revizyonda eski onay |
| Yayın sınırı | Ayrı yetki/hak/yayın/teslim kapıları kendi kanıtıyla geçiyor | Kaynak tamlığı veya saf `coverage_review_ready` sonucuyla öğrenci erişimini aç |

Öncelik: kaynak paydası ve etkin yıl → kitap parçaları/çıktı–süreç ayrıştırması → insan-onaylı mikro beceri/amaç matrisi → küçük özgün üretim/pilot → hücre bazlı kontrollü genişleme. Kaynak edinimi, ders/konu anlatımı fabrikası ve soru üretim fabrikası ayrı raporlanır; büyük toplamlar açık eksikleri örtemez.

## Kanıt ve başlangıç girişleri

Yerel dayanaklar: `docs/K12_PLATFORM_BLUEPRINT.md`, `docs/CONTENT_FACTORIES_AND_RIGHTS.md`, `docs/MEB_SOURCE_ARCHIVE_2026-10-03.md`, iki kaynak JSON'u ve repo dışı katalog anlık görüntüsü. Eski raporun 34 PDF sayısı kendi önceki edinim fazını anlatır; bu belge ek 10 PDF'yi ayrı tutar.

Resmî başlangıçlar: [TYMM kitap kataloğu](https://tymm.meb.gov.tr/ders-kitaplari), [TTKB programlar](https://mufredat.meb.gov.tr/Programlar.aspx), [2026–2027 uygulama duyurusu](https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316), [ÖDSGM temel eğitim kitapları](https://odsgm.meb.gov.tr/www/temel-egitim-kitaplari/icerik/834), [örnek soru indeksi](https://odsgm.meb.gov.tr/www/ornek-sorular/icerik/1011), [LGS arşivi](https://karabukodm.meb.gov.tr/www/lgs-yayimlanmis-sorular/icerik/213), [EBA](https://www.eba.gov.tr/), [TÜBİTAK geçmiş sınavları](https://bilimolimpiyatlari.tubitak.gov.tr/tr/gecmis-sinav-sorulari). Giriş listesinin varlığı, bu portalların tamamının indirilmesi veya haklarının kabulü değildir.
