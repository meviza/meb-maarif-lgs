# Okul Portalı — Bağımsız Servis ve Erişim Denetimi

Tarih: 4 Ekim 2026. İlk durum: **5 test geçti / 2 test başarısız**. Son bağımsız tekrar: **7/7 PASS**. PORTAL-01/02 dar yeniden üretim bakımından kapandı; UI bulgularının ayrı tarayıcı kabulü bu raporun kapsamı dışındadır. Bu rapor üretim güvenlik sertifikası, KVKK uygunluk görüşü veya gerçek okul kabulü değildir.

## Bağımsızlık ve yöntem

İncelemeci 1–7 pilot soru içeriğini yazdı; bu denetimde `service.mjs`, `server.mjs`, `portal.mjs`, `annotation_model.mjs`, `annotation_widget.mjs` ve `index.html` dosyalarını okudu. Portal servis/UI uygulamasını yazmadı ve bu denetim sırasında değiştirmedi. Yalnız bağımsız test ve bu rapor eklendi.

`test/school_portal_independent.test.mjs`, gerçek geçici SQLite dosyaları ve loopback HTTP sunucusuyla çalışır. Sadece sentetik hesaplar ve tek bir sentetik soru kullanılır. Yeni paket, dış API, gerçek çocuk/kurum verisi, credential veya üretim erişimi yoktur. Geçici test dizini yalnız testin oluşturduğu hedefte temizlenir; uygulamanın demo veritabanı değiştirilmez.

## Yeniden Üretilen Açık Bulgular

| Kimlik | Öncelik | Bulgu | Kanıt ve beklenen davranış |
| --- | --- | --- | --- |
| PORTAL-01 | P1 | Kaldırılmış soru kataloğu eski SQLite sınavını yeniden sunuyor | İlk açılışta grade6 soru kaydedilir; `questions: []` ile yeniden açılınca `listExams` hâlâ eski sınavı verir. Yeni öğrenciye artık etkin olmayan içerik açılmamalı. Geçmiş denemelerin korunması bununla karıştırılmamalı. Bağımsız test RED. |
| PORTAL-02 | P1 | İçerik düzeltmesi tamamlanmış eski denemeye geri yönlendiriyor | Bir öğrenci eski kâğıdı bitirir. Kaynak soru değişip katalog güncellenince `startAttempt` eski `attempt.id` ve bitmiş snapshot'ı verir. Eski kanıt korunmalı; güncel içerik sürümü yeni bir deneme olabilmelidir. `UNIQUE(student_id,exam_id)` ve sabit sınıf sınavı kimliği değişik sürümleri birleştiriyor. Bağımsız test RED. |
| PORTAL-03 | P1 | Aktarım yanıtındaki ilk-giriş parolaları arayüzde atılıyor | `bindManagement` içindeki import başarı yolu servis yanıtını kullanmadan dashboard'a geçiyor. Servisin rastgele ürettiği geçici parolalar yalnız `created` yanıtında var. Yetkili yöneticinin güvenli tek seferlik teslimi olmadığı için yeni hesapların ilk girişi kullanılamıyor. Kod akışı bulgusu; tarayıcıda uçtan uca teslim kabulü yapılmadı. |
| PORTAL-04 | P1 | Oturum kaybında açık özel-not diyaloğu temizlenmiyor | `api` 401 yanıtında `loginView` çağırır; başlangıç kodunda bu yol not widget'ını kapatıp içeriğini silmez. `note-dialog`, temizlenen `main#app` dışında kalır. Paylaşılan cihazda eski not oturum sona erdikten sonra ekranda kalabilir. Kod akışı bulgusu; tarayıcıda oturum-sonu yeniden üretimi root tarafından yapılmalıdır. |

PORTAL-03 çözümü parolaları genel dashboard, analitik, log veya Git'e koymak değildir. Yalnız yetkili aktarım sahibine kontrollü teslim, parolaların tekrar gösterilememesi ve ilk girişte zorunlu değişiklik birlikte korunmalıdır.

PORTAL-04 çözümünde çıkış, oturum süresi dolması ve başka kullanıcıyla giriş aynı merkezi görünüm temizleme kuralını kullanmalıdır. Not kaydı sunucuda korunur; önceki kullanıcıya ait DOM/draft görünümü taşınmaz.

## Geçen Bağımsız Negatif Kontroller

1. İç içe aktarım satırındaki `role`, `schoolId`, `password`, `mustChange` sahteciliği yeni hesabı yükseltemedi. Oluşan hesap `student`, hedef okulda ve zorunlu parola değişiminde kaldı. Enjekte edilen parola çalışmadı.
2. Geçici parola genel yönetici/öğretmen/veli dashboard'larına veya veritabanına düz metin olarak sızmadı; parola hash alanları kullanıcı DTO'sunda yoktu.
3. Öğrenci 6A'dan 7A'ya taşındığında eski 6A öğretmeninin hem doğrudan geçmiş deneme erişimi hem analitik görünürlüğü kesildi. Yeni 7A öğretmeni ve bağlı veli ilgili geçmişi görebildi; başka okul göremedi.
4. Özel notun işaretleyici metni öğrenci dahil genel dashboard ve ortak deneme cevaplarına girmedi. Not API'si veli, öğretmen, müdür ve platform yöneticisi için reddedildi; yalnız sahibi okuyabildi.
5. Son kota yeri iki ardışık aktarımda iki kez kullanılamadı. İkinci aktarım bütünüyle reddedildi; öğrenci sayısı kotayı aşmadı.
6. HTTP üstbilgi/gövde rol sahteciliği reddedildi. Aynı okuldaki ilgisiz veli denemeyi okuyamadı. Bağlı veli açık denemenin cevap anahtarını veya özel notunu alamadı.
7. Öğrenciye açık deneme payload'ında cevap/çözüm yoktu; soru bankası ve servis kaynak modüllerinin HTTP üzerinden istenmesi 404 döndü.

## İncelenen Diğer Davranışlar ve Sınırlar

- Bitmiş deneme analitiği soru snapshot'ı ve kaydedilmiş yanıt üzerinden yeniden hesaplanıyor; açık denemeler toplama eklenmiyor. Önceki servis testleri ayrıca doğru/yanlış/boş ve LGS ham-net ayrımını kapsıyor. Bağımsız suite bunların tümünü yeniden yazmadı.
- Geri bildirim metni öğretmen/veli/müdür kapsamı içinde paylaşılan ürün görüşüdür; özel not değildir. İki veri türü karıştırılmıyor.
- Aynı soru kimliği altında değişmiş soru sürümlerini tek soru-analitik satırında toplama riski, sürümleme düzeltmesiyle birlikte incelenmelidir. Konu/family kayıtları snapshot'tan gelir; soru düzeyinde kimlik tek başına sürüm ayrımı sağlamaz.
- Öğretmen–sınıf tablosu bir sınıfta birden fazla öğretmene izin verir. `teacherId` eklemek eski öğretmen atamasını otomatik kaldırmaz; bunu tek-öğretmen ataması olarak sunacak bir arayüz için ayrıca kural gerekir. Sınıf değiştirme erişim testi geçmiştir; çoklu atama kendi başına bu raporda yetki açığı sayılmamıştır.
- Not gövdesinde boyut/koordinat/renk sınırları ve optimistic concurrency var. Çizim/text DOM'a metin olarak taşınıyor. Gerçek tablet, kalem, erişilebilirlik, tarayıcı yarışı ve oturum-sonu modal temizliği bu koşuda görsel olarak kabul edilmedi.
- Loopback demo ve ortak demo parolaları üretim kimlik yönetimi değildir. TLS, üretim hız sınırlama, kurtarma, veli ilişkisinin kurumca doğrulanması, gerçek verilerle saklama/silme ve bağımsız penetrasyon testi açık kalır.

## Test Komutu

`node --test test/school_portal_independent.test.mjs`

İlk çalıştırma: **7 test / 5 geçti / 2 başarısız**, beklenmeyen araç hatası yok. Başarısız testler PORTAL-01 ve PORTAL-02'yi yakalar. Bulgular uygulama sorumlusuna iletildi; düzeltmeler gelmeden tamamlandı denmedi. Son yeniden test sonucu aşağıya ayrıca eklenmelidir; bu tarihsel RED kaydı silinmemelidir.

## Sürümleme Düzeltmesi Sonrası Bağımsız Tekrar

Servis sorumlusu PORTAL-01/02'yi düzelttikten sonra **aynı bağımsız test dosyası değiştirilmeden taze çalıştırıldı: 7/7 PASS, 9.987,91 ms**. Kodda mevcut kataloğun etkin sınavlarının ayrılması, geri çekilmiş sınava yeni başlangıcın reddi, değişen içerik veya puanlama modu için farklı sınav sürümü ve eski snapshot'ın korunması doğrudan okundu. PORTAL-01 ve PORTAL-02 bu dar yeniden üretim bakımından kapandı; geçmiş ilk RED kanıtı yukarıda korunuyor.

Soru düzeyi analitik kayıtlarında kimlik ile içerik sürümünün birlikte kullanılması da servis kodunda gözlendi. `questionVersion` tam SHA özetiyle soru ve geri bildirim eşlemesi ayrı tutuluyor. Bu ek davranışın özel regresyon testi servis sahibinin suite'inde; yedi bağımsız testin hepsinin soru-analitik sürüm ayrımını ayrı ayrı ispatladığı söylenmiyor.

Sonraki birleştirilmiş sözel+portal koşumunda sözel **7/7**, bağımsız servisin ilk altı testi **6/6** geçti; HTTP açılışı devam eden başka bir işin henüz yazılmamış `request_scope.mjs` bağımlılığı nedeniyle `ENOENT` verdi. Uygulama sahibi dosyanın aynı anda geliştirildiğini doğruladı. Bu ara koşum genel GREEN sayılmadı. Dosya hazır olunca nihai tekrar bekleniyor; PORTAL-03/04'ün tarayıcı kabulü uygulama sahibinin ayrı kanıtıdır.

**Nihai servis tekrarı:** `request_scope.mjs` dosyası tamamlandıktan sonra aynı bağımsız suite tekrar çalıştırıldı: **7 test / 7 PASS / 0 FAIL, 11.362,49 ms, çıkış kodu 0**. HTTP üzerinden rol sahteciliği, ilgisiz veli, özel not ve açık denemenin cevap anahtarı kontrolleri bu kez gerçekten sunucu açılarak geçti. Önceki ENOENT ara-işbirliği hatası böylece temizlendi; yedi test herhangi bir UI/parola-teslim/oturum-sonu görsel kabulünün yerine geçmez.
