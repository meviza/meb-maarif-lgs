# Öğrenci çalışma alanı — 3 Ekim 2026

## Durum ve kapsam

`packages/student/index.html`, `student.css` ve `student.mjs` bağımlılıksız bir **yerel, sentetik 6. sınıf tasarım önizlemesi** oluşturur. Oturum açılmış öğrenci hesabı, canlı okul aboneliği, yayımlanmış içerik veya üretim ortamı değildir. Öğrenci adı, gerçek okul/veli/öğretmen bilgisi alınmaz. Arayüz yalnız `GET /api/workspace` okur; içerik yayımlama, not yükleme veya öğretmene ağ üzerinden gönderim yapmaz.

Altı ders sunucunun kaynak kataloğu eşlemesinden gelir: Türkçe, Matematik, Fen Bilimleri, Sosyal Bilgiler, İngilizce, Din Kültürü ve Ahlak Bilgisi. Bir dersin kataloğa eşlenmesi pedagojik kabul, lisans izni veya MEB onayı değildir. Onaylı soru, konu anlatımı ve video listeleri boşken bu durum açıkça gösterilir. Başka sınıf seçicisi, yapay başarı puanı, soru sayacı veya pazarlama metriği yoktur. Desteklenmeyen API modu/sınıf/içerik/erişim durumu alanı açmaz ve görünür hata metni verir.

## Tasarım kararları

- Sıcak kâğıt, petrol ve mercan; kurumsal okul ürünü ile öğrencinin kişisel masasını aynı dilde birleştirir. Sistem sans yazı ailesi ve yerel Georgia serif kullanılır; harici font veya görsel yüklenmez.
- Başlangıçta kısa, yaşa uygun bir karşılama; gecikmeli açılış/splash, konfeti, sonuç taklidi veya ödül baskısı yoktur. Sayfanın geometrik defter çizimi CSS ile özgün olarak hazırlanmıştır; satın alınmış ikon seti veya AI görseli değildir.
- Açılır menüde “Çalışma masam”, “Kaydettiklerim”, “Takıldıklarım”, “Defterim” ve altı ders bulunur. Ders kısayolu kaydetmek içerik tamamlamak anlamına gelmez.
- Metinler `textContent` ile oluşturulur; gelen içerik HTML olarak yürütülmez. CSP uyumlu ayrı stil/betik dosyaları; inline olay işleyicisi, uzak ikon, font veya analitik yoktur.

## Defter ve kişisel listeler

`/notebook.mjs` ayrı test edilen saf modüldür. Arayüz bu modülün gerçek frozen state referanslarını ve sunucunun **sentetik** okul/öğrenci/sınıf/yıl bağlamını kullanır. Bu bağlam kimlik doğrulama kanıtı değildir.

Metin en fazla 4000 karakter; çizim en fazla 64 çizgi, çizgi başına 512 normalize koordinat noktasıdır. Kabul edilen modül paleti ve kalem kalınlığı kullanılır. Metin, çizim, not ve takılma kayıtları yalnız açık sayfanın belleğindedir; sayfa yenilenince kaybolur. LocalStorage, IndexedDB, Drive veya arka uç kayıt işlemi yoktur.

“Bu sayfayı temizle” yalnız mevcut metin/çizimi boşaltır, eklenmiş notları silmez. “Temizlemeyi geri al” aynı gerçek state referansına döner; sonraki değişiklik geri alma fırsatını kapatır. JSON'dan state yeniden üretme yoktur. Çizim fare/dokunma/kalemle isteğe bağlıdır; etiketli metin alanı ve çizimin yazılı anlatımı eşdeğer erişilebilir alternatif sunar. “Paylaşmaya hazır” yalnız bellekte tutulan yerel bir hazırlık işaretidir; hiçbir kişiye veri gönderilmez.

## Okul yılı erişim modeli

Ürünün ilerideki gerçek mimarisinde erişim; okul, kayıtlı öğrenci, sınıf, okul yılı ve geçerli yıllık okul sözleşmesine bağlanmalıdır. İstemci sınıf/rol seçerek yetki alamaz. Yeni yılda sınıf geçişi, geçmiş kayıt erişimi, saklama/silme ve veli/öğretmen yetkileri sunucu politikası ile ayrıca çözülmelidir; geçmiş defterin otomatik olarak başka okul veya öğretmene açılması varsayılmaz. DAMA sahiplik, amaç, metaveri, kaynak, sürüm, erişim, saklama ve denetim kuralları bu kalıcı sürümün yayın kapısıdır. Mevcut sentetik yıllık erişim bu mimarinin kabulü veya faturalandırması değildir.

## Doğrulama sınırı

Arayüz durumları: `loading → ready` veya görünür `error`; `ready` içinde başlangıç/ders/kayıt/takılma/defter. Menü Escape ile kapanır, odağı açma düğmesine geri verir; Tab menü içinde dolaşır, arka plan inert olur. Mobil/tablet kırılımları, atlama bağlantısı, klavye odakları ve reduced-motion stili bulunur. Önizleme yalnız metadata/boş kütüphane modunu kabul eder; yeni içerik durumlarının desteği açık bir geliştirme işidir.

Saf defter ve sunucu negatif testleri diğer sahiplerce yürütülür. Bu arayüzün gerçek tarayıcı etkileşim, responsive ve ekran görüntüsü kabulünü ana görev ayrıca yapar; kaynak dosya/sözdizimi kontrolü tek başına UI kabulü değildir. Üretim kimlik doğrulama, kalıcı saklama, okul kotası, erişilebilirlik sertifikası veya gerçek cihaz/mobil uygulama kabulü bu kapsamda yapılmadı.

### Tablet çizim iptali regresyonu

Bağımsız denetim, etkin kalem `pointerId=1` ile çizilirken ikinci temasın `pointercancel(2)` olayının etkin çizgiyi de sildiğini buldu. `test/student_pointer_cancel.test.mjs` gerçek arayüz ve saf defter kodunu aynı VM realm'inde çalıştırır; yalnız DOM, GET çalışma alanı ve pointer teslimi fixture'dır. Düzeltmeden önce iki test de beklenen assertion ile kırmızı görüldü: farklı temasta çizgi sayısı `0 !== 1`; etkin kalem iptalinde capture `true !== false`.

Dar düzeltme, yalnız `event.pointerId === state.pointerId` ve etkin çizgi varken iptali uygular; yalnız bu pointer'ın kalan capture'ını bırakır. İptal edilen çizgi kaydedilmez, farklı temas etkin kalemi değiştirmez. Bu regresyon, fiziksel tablet/kalem veya avuç içi algılama testinin yerine geçmez.

Düzeltmeden sonra aynı kalıcı regresyonun iki testi yeşil; defter, çalışma alanı ve yerel sunucu testleriyle birlikte taze doğrulama **33/33** geçti. `node --check packages/student/student.mjs` ve kapsamlı dosya diff kontrolü de temizdir. Fiziksel çoklu temas testi yapılmadı.
