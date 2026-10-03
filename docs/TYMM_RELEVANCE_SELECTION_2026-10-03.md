# TYMM kaynak ilgililik seçimi — 3 Ekim 2026

Durum: dondurulmuş v1 metadata seçimi; PDF içerik/kalite incelemesi, indirme veya ürün/yayın onayı değil. [Makine kaydı](../sources/tymm-relevance-inventory.json) 143 kaydın tamamını gerekçesiyle listeler. Bu kısa rapor bütün başlıkları tekrar etmez.

## Seçim sonucu

| Karar | Kayıt | Bu fazdaki anlamı |
| --- | ---: | --- |
| select | 59 | Ana ders öğrenci kitabı, ilk okuma yazma veya çalışma kitabı; sınırlı referans incelemesi adayı |
| defer | 56 | Öğretmen kılavuzu, özel model/ek ders veya seçmeli/sınıfı atanmamış kaynak; ayrı eşleme/rol kararı |
| exclude | 28 | 7 Arapça, 12 Almanca modeli ve 9 okul öncesi kaydı bu ana ürün fazının dışında |
| Toplam | 143 | Hiçbir kayıt sessizce düşürülmedi |

Seçili 59 kaydın tamamında katalog PDF alanından gelen izinli resmî HTTPS bağlantısı var. Bu yalnız **ilk bağlantı metaverisi**: kısa `meb.ai` bağlantısının son hedefi, PDF baytları, dosya boyutu veya gerçek erişilebilirliği bu seçimde kontrol edilmedi. 143 kaydın hepsinde link mevcut; bekleyen boş PDF-link kaydı 0. İndirme adayları `sources` dizisinde 59 kayıttır, arşivleyicinin 100 üst sınırının altında; kırpma yapılmadı. Bu dizi otomatik 59 dosya indirme talimatı değildir.

| Ana ders adayı | Seçili kaynak | Backend sınıf atamaları |
| --- | ---: | --- |
| turkce | 14 | 1, 2, 3, 5, 6, 7 |
| matematik | 12 | 1, 2, 3, 5, 6, 7 |
| hayat-bilgisi | 6 | 1, 2, 3 |
| fen-bilimleri | 8 | 3, 5, 6, 7 |
| sosyal-bilgiler | 6 | 5, 6, 7 |
| inkilap-tarihi-ve-ataturkculuk | 0 | Yok |
| ingilizce | 8 | 2, 3, 5, 6 |
| din-kulturu-ve-ahlak-bilgisi | 5 | 4, 5, 6, 7, 8 |

Türkçe 14 kaynak içinde 2 ilk okuma yazma; standart İngilizce 8 kaynak içinde 4 çalışma kitabı var. Kitap 1/2 ayrı katalog kaynaklarıdır, yeni mikro beceri veya soru ailesi değildir. Kaynak sayısı kapsam zenginliği kanıtı değildir.

## 143 kayıt neden 143 zorunlu kaynak değil?

23 öğretmen kılavuzu ayrı rol taşır; bunların bazıları dışlanan Almanca modelindedir. 2 spor kılavuzunun başlığı 1–4 ve 5–8 aralığını söylerken backend yalnız 1 ve 5 atar. Bu kayıtlar bütün sınıflara çoğaltılmadı. Kılavuz/öğrenci/çalışma kitabı arasında olası öğretim örtüşmesi inceleme bekler; birebir dosya kopyası olduğu iddia edilmez.

Çoklu yabancı dil modeli İngilizce için 15 kayıt **defer**: genel İngilizceyle saat, hedef ve seviye eşdeğerliği kanıtlanmadı. 7/8 için standart İngilizce boşluğunu bu özel modelle otomatik kapatmadık. DKAB dışındaki Kur'an/Peygamber dersleri DKAB'a birleştirilmedi; sanat, müzik, spor, bilişim ve seçmeliler ayrıca gerekçelendirildi.

## Yıl ve kapsam sınırı

[Önceki MEB kanıtı](MEB_SOURCE_ARCHIVE_2026-10-03.md) ve [TEGM 3 Eylül 2026 duyurusu](https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316), 2026–2027 TYMM uygulama kohortlarını 1, 2, 3 ve 5, 6, 7 olarak kaydeder. Bu seçimde duyuru yeniden ağdan alınmadı. Her kitabın basım/program/öğrenme çıktısı eşlemesi yine bekler; 4 ve 8 için yürürlükteki program/yıl ayrıca doğrulanmalıdır.

Önerilen **42 sınıf-ders hücresi proje planıdır, resmî MEB paydası değildir**. Seçili metadata 31 hücreye işaret eder; 11 hücre bu katalog seçiminde gözlenmedi: 4'te Türkçe/matematik/fen/sosyal/standart İngilizce; 8'de Türkçe/matematik/fen/İnkılap/standart İngilizce; 7'de standart İngilizce. Bu, resmî materyal olmadığı veya 31 hücrenin tamamlandığı anlamına gelmez. 4/8 DKAB adayları diğer ders boşluklarını kapatmaz.

4. sınıf vatandaşlık ve trafik program adayları [mevcut supplement kayıtlarında](../sources/education-reference-supplement.json) ayrı tutulur; 143 kitap veya ana 42 hücreye eklenmez.

## İlk 10 sınırlı inceleme bağlantısı

Sıra yalnız metadata ve ürün ihtiyacına dayanır. Erken okuryazarlık, matematik/fen görsel temsil incelemesi, çalışma formatları ve 4/8 yıl doğrulaması dengelenmiştir; başlıktan gerçek görsel zenginlik/cevap anahtarı/kalite çıkarılmadı. Tam ayrıntılı gerekçeler JSON'daki `top10OfficialLinkCandidates` alanındadır.

| Sıra | Kaynak | Başlık | PDF alanındaki bağlantı |
| --- | --- | --- | --- |
| 1 | `tymm-book-31` | Türkçe 1.Sınıf İlk Okuma Yazma Kitabı (1.Kitap) | [Resmî katalog bağlantısı](https://tymm.meb.gov.tr/assets/pdf/turkce-1sinif-ilk-okuma-yazma-kitabi-1kitap_20260905_104336_599.pdf) |
| 2 | `tymm-book-32` | Türkçe 1.Sınıf İlk Okuma Yazma Kitabı (2.Kitap) | [Resmî katalog bağlantısı](https://tymm.meb.gov.tr/assets/pdf/turkce-1sinif-ilk-okuma-yazma-kitabi-2kitap_20260905_104355_902.pdf) |
| 3 | `tymm-book-23` | Matematik 1.Sınıf Ders Kitabı (1.Kitap) | [Resmî katalog bağlantısı](https://meb.ai/UhDljKM) |
| 4 | `tymm-book-25` | Matematik 5.Sınıf Ders Kitabı (1.Kitap) | [Resmî katalog bağlantısı](https://meb.ai/MxA2Nr) |
| 5 | `tymm-book-19` | Fen Bilimleri 5.Sınıf Ders Kitabı (1.Kitap) | [Resmî katalog bağlantısı](https://meb.ai/UTSNgQB) |
| 6 | `tymm-book-152` | İngilizce Dersi 2.Sınıf Çalışma Kitabı | [Resmî katalog bağlantısı](https://meb.ai/giUrK9) |
| 7 | `tymm-book-140` | İngilizce Dersi 5.Sınıf Çalışma Kitabı | [Resmî katalog bağlantısı](https://meb.ai/UZ2Ksse) |
| 8 | `tymm-book-46` | Sosyal Bilgiler 5.Sınıf Ders Kitabı (1.Kitap) | [Resmî katalog bağlantısı](https://meb.ai/UZTEDQC) |
| 9 | `tymm-book-514` | Din Kültürü Ve Ahlak Bilgisi 4.Sınıf Ders Kitabı | [Resmî katalog bağlantısı](https://tymm.meb.gov.tr/assets/pdf/din-kulturu-ve-ahlak-bilgisi-4sinif-ders-kitabi_20261003_183741_260.pdf) |
| 10 | `tymm-book-517` | Din Kültürü Ve Ahlak Bilgisi 8.Sınıf Ders Kitabı | [Resmî katalog bağlantısı](https://tymm.meb.gov.tr/assets/pdf/din-kulturu-ve-ahlak-bilgisi-8sinif-ders-kitabi_20261003_185300_204.pdf) |

İndirme sonrasında gerçek sayfalarda okunabilirlik, görsel/harita/diagram doğruluğu, örnek ve çözüm varlığı, cevapların bağımsız doğruluğu, yaş/yerel dil uygunluğu, erişilebilirlik, basım/yıl, program hedefi ve haklar incelenir. Kaynak/enrichment ağırlığı yalnız insan incelemesi sonrası belirlenir; kaynaklar otomatik soru üreticisine aktarılmaz.

## Haklar ve sonraki kapı

Bütün kayıtlar `reference_only / reuseRights: unverified`; hak incelemesi pending, semantik inceleme not_performed. Ders/sınıf/program/yayın/öğrenci erişimi onayı yok. Resmî kamu erişimi yeniden kullanım izni değildir; alışılmış bir kaynak kitabı satın almak da metin/görsel gömme hakkı vermez.

Ana ajan daha sonra küçük bir alt kümeyi mevcut güvenli arşivleyiciyle ele alabilir: en fazla 25 MiB/dosya, 250 MiB/önbellek, mevcut host allowlist ve sınırlı elle yönlendirme; PDF türü/başlığı/gerçek bayt/hash doğrulanır. Yetki veya sınır genişletilmedi. Bu seçim ağ, PDF işleme, Drive, kimlik/öğrenci verisi, model/provider çağrısı veya Git commit yapmadı.

Dondurulan dayanak: katalog v2 gözlemi `2026-10-03T19:14:15.631Z`, içerik SHA-256 `5ce7dab2708e6a87409b8eeba2387cf56ad6707872bfb2be23b6a27c694c1451`. Karar kanıtı katalog metadata'sıdır; kitap kalite incelemesi değildir.
