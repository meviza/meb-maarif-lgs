# 6. Sınıf Ortak İlişkiler: Sonuç Anlatımı Tekrarının Giderilmesi

Tarih: 4 Ekim 2026. Durum: Yerel, editöre yönelik anlatım metni düzeltmesi. Yeni soru, öğretmen kabulü, aktif program kabulü, ses veya video üretimi değildir.

## Gözlenen Hata Ve Kök Neden

Gerçek `createGrade6CommonRelationsMediaPreparation` tüketiminde tekrar bağlamının sonuç cue'su `[24, 48, 24, 48]`, paketleme bağlamınınki `[1, 2, 3, 4, 6, 12, 1, 2, 3, 4, 6, 12]` sayısal sırasını içeriyordu. Adapter, sayıları `interpret.result.value` içine yazıyor; zaten aynı sayıları açıklayan canonical `resultMeaning` de genel medya tüketicisi tarafından hemen arkasına ekleniyordu. Genel tüketici hatalı hesap yapmıyordu: iki ayrı metin alanına aynı listenin yazılması bu adapter sınırında tekrarı oluşturuyordu.

Sayısal sonuçları canonical anlamdan silmek, genel özet cue'sundaki anlamı ve sayıları da kaybettirebilirdi. Bu nedenle kaynak taslağı ve genel sözleşme değiştirilmedi. Yalnız yorumlama adımının `text` birimli değer alanı, bağlamı ve okunabilir birimi belirten bir etikete dönüştürüldü. Bu etiket yeni bir sayısal hesaplama iddiası değildir; sayısal kümeler mevcut ayrı doğrulayıcıda denetlenmeye devam eder.

## Yeni Sonuç Metinleri

- “Birlikte dönüş işaretleri (dakika): 24 ve 48, başlangıçtan sonra iki döngünün birlikte başlangıç noktasına döndüğü dakika işaretleridir.”
- “Ortak paket boyutları (bir paketteki kart sayısı): 1, 2, 3, 4, 6 ve 12 bir pakette bulunabilecek ortak kart adetleridir; paket sayısı değildir.”

Bu iki özgün ürün taslağı açıklaması kaynak soru metni değildir. Her sonuç cue'sunda sonuç sayıları bir kez yer alır. Kontrol ve özet aşamalarında tekrar hatırlatma ayrı bir pedagojik aşamadır; bu düzeltme onların metnini budamaz. `minute`, `card_per_package` literal birimleri ile `Dakika`, `Kart/paket` görüntüleme metadata'sı değişmedi. Gruplama sonucunun konuşma etiketi `/` işareti yerine bir paketteki kart sayısını açıkça adlandırır; paket sayısı ile paket boyutu eşitlenmez.

## Test Önce, Kanıt Sonra

TDD, iyi test yazma, sistematik hata ayıklama ve tamamlamadan önce doğrulama becerileri kullanıldı. Önce gerçek kaynak DTO → canonical taslak → adapter → branded trace/job → altyazı ve ses isteği yoluna iki davranış regresyonu eklendi. Beklenen `[24, 48]` ve `[1, 2, 3, 4, 6, 12]` dizileri testte bağımsız sabitlerdir; üretim biçimleyicisinin çıktısından türetilmez.

1. RED: `node --test test/grade6_common_relations_media_adapter.test.mjs` — 17 test, 14 başarılı, 3 başarısız, 0 atlanan. İki yeni regresyon gerçek çift sayısal listeler yüzünden; üçüncü, gruplama için okunur birim beklentisi yüzünden başarısızdı.
2. GREEN: aynı komut — 17/17 başarılı, 0 başarısız/atlanan.
3. Bağlı kapsam: adapter, canonical taslak, mevcut editör SVG/tablo görünümü, genel medya işi ve öğretim trace testleri birlikte — 68/68 başarılı, 0 başarısız/atlanan.

Yeni testler gerçek sonuç cue'su, `subtitleDraft.cues` ve `createReasonedMediaAudioRequest(job).cues` metinlerini karşılaştırır. Canonical anlam, cue sırası 4 ve yorumlama anchor'ı korunur; kontrol cevabı ve özet canonical sonuç anlamını tutar. Mevcut negatif testler yeniden çalıştı: yeniden hashlenmiş yanlış kümeler/birimler/anahtarlar, değişmiş koşullar ve kaynak pinleri, bozuk/deep/sparse/cyclic/aşırı büyük DTO'lar, getter/proxy/coercion, ek provider/style/scene parametreleri reddedilir. Hook sayısı 0; serileştirilmiş DTO live trace/job yetkisi kazanmaz. Reveal=false sonucu gizlemeye ve ilerlemeyi kapatmaya devam eder.

## Önce/Sonra Deterministik Tanığı

Aynı üç mevcut public kaynak metadata snapshot'ı ile, düzeltme öncesi ve sonrası bağımsız yeniden oluşturma yapıldı. Tanık bellekte tutuldu; kaynak PDF veya özel yol rapora kopyalanmadı.

- Canonical draft SHA değişmedi: `9c225c8f2bc97dfae1d89778cda3ff5980f0c31056330c639e5be15823d2abd7`.
- Authored task SHA değişmedi: `c20e190e87945d6a79140819490ab09e55342a5a988eae9df5a95e0054ee6aeb`.
- Tam sourceLineage nesnesi değişmedi; bu, metadata bağını gösterir, taze PDF byte veya hak doğrulaması değildir.
- Mevcut editör HTML SHA değişmedi: `7fd1e6607dab233c6244179fc52f98f020a241a60f49b0428316cd4f0f044dac`.
- 20 cue'nun yalnız iki `result` metin SHA'sı değişti; kalan 18 cue'nun SHA'sı aynı kaldı. `why`, dört koşullu kısa yol alanı, kontrol/özet ve üç aktarım metni korunur.
- Repeat sonuç SHA: `b4278c49decc5ca3e0e34013f35b34cd4a91e48154aedbf9aab6a517bdcfa502` → `ec7188978a7edf89e9cffb0367231e79417362e0a1ce45333faefb89476f8773`.
- Grouping sonuç SHA: `cb00dced0e7f229991f7673afd37758d9c2c06b1f1dc187ead671d55308ad779` → `e661f631bd474a4d85b2c225b338dafeb1d2955fa8bc0c3c93a652443cdf936c`.
- Preparation SHA: `37a21884435691ac17054ca65c8c4e2002531668fc309471a96e06c9f4cd260e` → `b182247ad5799dec161d14a8e564be47ce7d75e818f033d3e3f2a47a8d802fe5`.

İki trace, iki job ve iki audio request SHA'sı doğal olarak değişti; eski çıktılar yeni anlatımın kanıtı olarak yeniden kullanılamaz. API adı ve iki parametreli kapalı şekli değişmedi.

## Değişmeyen Sınırlar

Bu adapter hâlâ bir mevcut editör taslağı için iki bağlamsal medya işi hazırlar; yeni/accepted/published ürün sorusu sayısı 0'dır. Hesap kontrolü, anlamsal uzman kabulü değildir. Aktif program, haklar, pedagoji, zorluk, erişilebilirlik ve öğrenciye sunum kabulü yükseltilmedi. `humanApproval`, aktif yıl ve resmî çıktı kodu null; gate'ler pending, publication/learner/production false kalır.

Bu dilimde PDF inceleme/indirme, Drive, ağ/provider çağrısı, ses byte'ı, ses dinleme, video render, kelime–kalem senkronu veya native görsel kabulü yapılmadı. “Doğal insan sesi” ya da eğitsel etkinlik iddiası yoktur. Gerçek caption/scene/CLI entegrasyonu ve bağımsız audit başka sahiplerin ayrı kanıtıdır; yalnız mevcut editör SVG/tablo tüketicisinin değişmediği ve hermetik testlerden geçtiği gösterilmiştir. Kalite süreç testlerinin geçmesi CMMI/SPICE sertifikası veya uzman onayı anlamına gelmez.
