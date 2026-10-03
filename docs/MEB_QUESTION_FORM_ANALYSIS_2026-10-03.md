# MEB soru biçimleri — kaynak bağlı inceleme taslağı

İnceleme: 3 Ekim 2026. Bu, [kaynak kapsamı kabulünün](SOURCE_COVERAGE_ACCEPTANCE_2026-10-03.md) biçim/amaç sütununa aday veri sağlar; tam müfredat, bütün soru bankası, cevap veya uzman/hak kabulü değildir. [Metaveri gözlemleri](../sources/meb-question-style-observations.json) kaynak SHA, fiziksel PDF sayfası, incelenen soru numarası, temsil ve yanıt biçimini bağlar. Soru metni, sayı/cevap veya resimler ürün bankasına aktarılmaz.

## Gerçekte incelenen iki alt kapsam

- [6. sınıf matematik beceri kaynağı](https://odsgm.meb.gov.tr/www/6-sinif-beceri-temelli-testler/icerik/489): 14 sayfanın metni ve görselleri; 1–20 numaralı 20 dört-seçenekli madde. Proje taslak sınıflandırmasında üsler 4, çok adımlı işlemler 9, bölünebilme/çarpan/kat 5, kümeler 2. Tablo, bölünmüş şekil, ölçüm göstergesi ve yerleşim temsilleri farklı işler görür. Kaynakta zorluk bandı/10–30–30–30 dağılımı görülmedi; cevap anahtarı QR bağlantısı alınmadı. Bunlar resmî MEB taksonomisi veya ölçülmüş madde güçlüğü değildir.
- [Hatay 6. sınıf çalışma fasikülü](https://odsgm.meb.gov.tr/www/6-sinif-calisma-fasikulleri/icerik/566): 51 sayfanın tamamı değil, ilk yedi etkinlik; fiziksel 2–7 sayfalar görsel, 1–8 metin incelemesi. Bağlantı grafiği, işlem bulmacası, tablo tamamlama, karar yolu ve yanlış çözümü düzeltme vardır. Bütün fasikülün soru sayısı/örnek oranı çıkarılmadı.

İki kaynak eski arşivdir; güncel TYMM çıktılarıyla eşdeğerliği açık kalır. PDF boyutu/hash'i taze doğrulandı; kaynakların mevcut `reference_only` ve hakları `unverified` durumları değiştirilmedi. Kaynak soru sayısı, özgün ürün soru sayısına **0** ekler. Sayfa numarası ve soru numarası ayrı kimliktir.

## Fabrika kararları

1. Konu etiketi tek başına çeşitlilik değildir. Kavramı kurma, kural uygulama, seçimi gerekçelendirme, hatayı teşhis ve aktarım amaçları ayrı; çoktan seçmeli, açık yanıt, oluşturma ve karar yolu da ayrı temsil hücreleridir. Yeni hücreler resmî çıktı/yaş/hak kabulü olmadan bankaya zorunlu kota diye atanmaz.
2. Görsel bulunması, görselin bütün bilgiyi taşıması demek değildir. Veri taşıyan tablo/ölçü/ilişki ile dekoratif bağlam ayrılır. Özgün grafiklerde renk yanında desen/etiket ve erişilebilir metin gerekir; arşiv çizimi kopyalanmaz.
3. Ham PDF metin çıkarımı üsleri düz rakamlara çevirebiliyor. Görsel kontrol → yapılandırılmış matematik → bağımsız çözüm olmadan çıkarılan sayı işleme verilmez. Metin var diye şekil, üst simge veya ölçü ilişkisi doğrulanmış sayılmaz.
4. Zorluk dağılımı ancak ayrı yazar/uzman tahmini ve sonra pilot verisiyle kurulur. Kaynakta olmayan güçlük etiketi veya genel MEB oranı uydurulmaz. Mevcut karışık-test hazırlayıcısı karşılanamayan hücreyi açık eksik tutar.
5. Kaynak analizi ile içerik üretimi ayrıdır: bu gözlemler modeli beslemeyen metadata taslağıdır; özgün soru, gerekçeli örnek ve ses/kalem üretim işi ayrıca kaynak/cevap/hak/yaş denetiminden geçer.

Yerel renderler ve PDF'ler Git dışında kaldı; yeni indirme, Drive upload, model/TTS veya öğrenci verisi yok. Bu inceleme alan öğretmeninin veya bağımsız ölçme uzmanının kabulünün yerine geçmez.
