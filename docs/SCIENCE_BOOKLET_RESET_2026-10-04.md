# Fen kitapçığı: Öğrenci deneyimini yeniden kurma kararı

## Kullanıcı kabul kararı

4 Ekim 2026: Önceki 54 soruluk Fen Atölyesi paketi **kullanıcı tarafından reddedildi**. Paylaşılan sekiz ekran yalnız örneklemdir; ortak sunum ve temsil kusurları 54 soruluk paketin tamamına ilişkindir. Önceki teknik test sonuçları bu kabul kararını değiştirmez. Eski stok yeni stok sayısına taşınmayacaktır.

## Değişmez ürün ilkeleri

- Öğrenci sınavı bir editör/üretim paneli değildir. Sınıf sunucudaki kayıtla belirlenir; başka sınıflar, Bloom etiketleri, tahmini zorluk, kaynak hash'leri, JEV/Clef ve maliyet sayaçları öğrenciye gönderilmez.
- Sınav yüzeyi beyaz kitapçık, siyah okunaklı metin, ölçülü gerçek fen çizimleri ve belirgin soru köküdür. Büyük renkli kartlar ve görünür yinelenen alt metin kaldırılır. İki sütun, orta ayırıcı ve içerik uzunluğuna göre sayfalama esastır; küçük telefonda okunurluk için tek sütuna geçilir. Her soruyu zorla aynı sayıya/sayfa yoğunluğuna sıkıştırmak kabul değildir.
- MEB kitapçıklarındaki görev dili ve temsil biçimleri referanstır. Kaynak sorular ve resimler kopyalanmaz; kazanımdan özgün soru yazılır. 6/7 için etkin TYMM, 8 için 2018 programı kullanılır. MEB kurum logosu veya onay izlenimi kullanılmaz.
- Görselin mevcut olması yeterli değildir: devrede bağlantı, deneyde değişken, grafikte eksen/birim, ışında normal/açı, kuvvette yön/büyüklük ve nesne ilişkisi doğru okunmalıdır. Metin kartı fen görseli yerine geçmez.
- Soru yazarken öğretmen; çözerken öğrenci; değerlendirirken ilgili öğretmen, veli ve okul yöneticisinin ihtiyacı esas alınır. Öğrenci çözümü soru bitince verilen → istenen → neden bu yol → adımlar → kontrol → kısa ipucu düzenindedir.
- Velinin kendi çocuğunun ilerlemesi, öğretmenin sınıf/kazanım ve yanlış örüntüleri, yöneticinin yetkili toplulaştırılmış okul göstergeleri, editörün kaynak/kalite/üretim bilgileri ayrıdır. Yeni öğrenci kitapçığı bu dört ayrı yetişkin arayüzünün tamamlandığı anlamına gelmez.
- Clef'e müfredat yaş/sınıf sınırı, MEB tarzı anlaşılır soru kökü, tek cevap, geçerli çeldirici ve görsel yeterliliği ayrı ölçütlerle sorulmalıdır. Modelin olumlu olasılığı MEB onayı veya LGS'de çıkacak soru garantisi değildir.

## Doğrudan açılan kaynaklar

- [2024 LGS sayısal kitapçık](https://karabukodm.meb.gov.tr/meb_iys_dosyalar/2025_07/01134301_2024sayislbolum.pdf), fiziksel s.19: iki sütun, merkezi ayırıcı, kısa deney bağlamı, sade bilimsel çizim ve belirgin soru kökü. Kaynak orijinal dosyası ürünle/Git ile dağıtılmadı.
- [7. sınıf beceri temelli Fen, 1. ünite](https://cdn.eba.gov.tr/yardimcikaynaklar/2022/01/odsgm/beceri/2223/fen/7_fen_1.pdf), fiziksel s.2: görev gereğine göre tam genişlikte grafik ve uzun soru. Bu eski arşivin konu yerleşimi güncel TYMM sınıf eşlemesi yerine kullanılmaz.
- Program/kod/sayfa envanteri: `sources/science-678-source-blueprint.json`. İndirilmiş program, tüm kazanımların yeni sorularla kapsandığı anlamına gelmez.

## Kabul kanıtı politikası

Önceki 1.539 depo testi öğrenci deneyimi puanı değildi. Yeni kabul; aynı sınıfa bağlı veri, cevap anahtarının deneme bitmeden gönderilmemesi, gerçek cevap kaydı/sonuç, oturum ayrımı, negatif istekler, bütün yeni şekillerin ekran görüntüsü üzerinden okunması ve tablet/masaüstü görev akışının fiilen denenmesine dayanır. Otomatik test sayısı estetik, pedagojik uzman kabulü veya psikometrik doğrulama yerine sunulmaz.

Bu karar yalnız eski hatalı pilotu ve yeni Fen kitapçığını hedefler; müfredat arşivi, hak envanteri, DAMA sözleşmeleri, diğer güvenli backend/DB işleri ve Gemini'nin ayrı checkout'u silinmez. Git geçmişi, geri dönüş için korunur.
