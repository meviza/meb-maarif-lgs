# MEB kaynak kataloğu — kanıtlı referans arşivi

Güncelleme: 2026-10-03. Önceki belgedeki tahminî ProgramDetay kimlikleri, PDF yerine ana sayfaya giden sınav bağlantıları, sabit aylık paket/soru sayısı ve “~1.2 GB / sıfır disk” iddiaları doğrulanmış katalog değildi. Bu belge bunları kanonik kaynak olarak kullanımdan kaldırır; eski sürüm Git geçmişinde korunur.

## Tek doğruluk kaynağı

- Makine tarafından okunabilir kayıt: `sources/meb-reference-registry.json`.
- İndirme/başarısızlık ve sınır raporu: `docs/MEB_SOURCE_ARCHIVE_2026-10-03.md`.
- Bütçe sınırlı indirme aracı: `tools/meb_source_archive.mjs`.

Her kayıt gerçek resmî kaynak sayfası, PDF URL'si, program/sınav sürümü, alınma zamanı, bayt sayısı ve SHA-256 taşır. `downloaded` yalnız baytların alındığını gösterir; metin ayrıştırılması, öğrenme çıktısı eşlemesi, lisans veya pedagojik inceleme demek değildir. Başarısız ve incelenmemiş tarihsel adaylar gizlenmez.

## Resmî giriş noktaları

| Kaynak | Kullanım |
| --- | --- |
| [TYMM öğretim programları](https://tymm.meb.gov.tr/ogretim-programlari) | Güncel ders sayfaları ve program PDF'leri |
| [Karabük ODM yayımlanmış LGS soruları](https://karabukodm.meb.gov.tr/www/lgs-yayimlanmis-sorular/icerik/213) | 2018–2024 sözel/sayısal sınav PDF'leri |
| [ÖDSGM örnek sorular](https://odsgm.meb.gov.tr/www/ornek-sorular/icerik/1011) | Eğitim yılı bazında değişebilen örnek soru paketleri |
| [2026–2027 taslak çerçeve plan duyurusu](https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316) | Yıllık uygulama kapsamını doğrulayan ayrı kaynak |

Program PDF sürümü ile sınıflarda yürürlüğe girdiği akademik yıl farklı alanlardır. 36 haftalık yerel plan resmî program/takvim yerine geçmez. 2018/2019 ve 2024 sürümleri için erişilebilen resmî belgeler ayrı kaydedilir; eski URL çalışmazsa yeni belgeyi eski sürüm diye kaydetmeyiz.

## Haklar ve özgünlük

MEB'in kamuya açık dosyaları kendiliğinden açık lisanslı/ticari kullanıma serbest değildir. Arşivde `usagePolicy: reference_only`, `reuseRights: unverified` ve hak incelemesi bekleme durumu bulunur. PDF'ler GitHub'a eklenmez; yeniden dağıtım, model eğitimi ve sağlayıcıya aktarım ayrı hak kararlarıdır.

Yeni soru metni/çizimi kopyalanmaz; yalnız sayı/isim değişikliği özgünlük değildir. Geçmiş sınavın biçim/beceri incelemesi ile yeni sorunun benzerlik denetimi ayrıdır. Arşiv indirildi diye benzerlik taraması veya özgünlük kanıtı tamamlandı sayılmaz.

Sonraki kaynak kapısı: 1–8 tüm dersler için kapsama matrisi, sayfa/öğrenme çıktısı ayrıştırması, yürürlük kaydı ve öğretmen eşlemesi. Sürümler arasında `unchanged / changed / added / removed / uncertain` sınıflaması yapılır. PDF hash değişmesi tek başına anlam bakımından müfredat değişikliğini kanıtlamaz.
