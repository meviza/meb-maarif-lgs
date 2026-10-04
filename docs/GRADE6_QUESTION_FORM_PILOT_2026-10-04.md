# 6. Sınıf Soru Biçimi — Küçük Kaynak İnceleme Dilimi

Durum: Editör için kaynak gözlemi. Yeni özgün soru, ders, ses veya video üretilmedi. Etkin program, cevap doğruluğu, ticari yeniden kullanım ve uzman kabulü tamamlanmış değildir.

## Kaynak ve Gerçek İnceleme

Mevcut yerel arşivdeki `meb-archive-grade6-math-fascicle-unit1-hatay` kaydı kullanıldı. [MEB kaynak sayfası](https://odsgm.meb.gov.tr/www/6-sinif-calisma-fasikulleri/icerik/566) ve [resmî PDF adresi](https://cdn.eba.gov.tr/yardimcikaynaklar/2022/01/odsgm/fasikul/2021/6/6_1_mat_hatay.pdf) önceki kayıt kökenidir; bu fazda ağ üzerinden yeniden erişim veya indirme yapılmadı.

Taze yerel SHA-256: `f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e`. `pdfinfo` 6.199.288 bayt, 51 sayfa ve A4 boyut bildirdi. Gerçek kapak, 6. sınıf Matematik 1. ünite ve Hatay Ölçme Değerlendirme Merkezi bağlamını doğruladı. Kapakta öğretim/yayın yılı görülmedi. URL yolundaki 2021/2022 işaretleri ve PDF metadata içindeki 2020 oluşturma/değiştirme tarihleri, kesin yayın yılı veya 2026–2027 etkin program kabulü değildir.

Kaynak metni ve native sayfa rasterı birlikte incelendi: Kapak (fiziksel 1) ve seçili soruların fiziksel/basılı 12–16. sayfaları. Seçim için 8–11. sayfalarda yalnız sınırlı metin gezinmesi yapıldı; bunlar incelenmiş soru sayısına katılmadı. Altı özel PNG 100 dpi ile oluşturuldu; toplam 400.705 bayt, bu dilimin 2 MiB çıktı sınırının altında. Kaynak PDF, görseller, tam soru metni, seçenekler ve sayısal soru vektörleri bu rapora veya yeni kamu metadata dosyasına aktarılmadı.

PDF metin çıkarımı, 14. sayfadaki işlem grafiğinin düğüm işlemlerini yeterince göstermedi. Bu temsil bu yüzden metinden tahmin edilmedi; gerçek rasterda oklar, işlem düğümleri, çıkışlar ve tam bir hatalı karar koşulu kontrol edildi. `pdfinfo` belgenin etiketsiz ve AcroForm içeren bir PDF olduğunu bildirdi; bu araç bilgisi güvenlik veya erişilebilirlik sertifikası değildir.

## Seçili Altı Kaynak Dış Sıra

Önceki Hatay incelemesi dış sıra 1–7 idi. Yeni dilim 13–18; önceki `meb-question-style-observations.json` değiştirilmedi. Yeni dış sıralar farklıdır; bütün temsil biçimlerinin dünyada yeni veya önceki arşivden tamamen farklı olduğu iddia edilmez. Örneğin karar grafiği daha önce de vardı; burada yeni mikroamaç, işlemler boyunca tam bir hatayı izleyerek mümkün çıkışları ayırmaktır.

| Dış sıra / sayfa | Gözlenen biçim ve farklı amaç | Programla yalnız önerilen içerik ilişkisi |
| --- | --- | --- |
| 13 / 12 | İki bölünebilme koşulunu renkli sayı matrisinde ayrı ve birlikte sınıflandırma; dört görsel seçenek | MAT.6.1.2'nin dar uygulama adayı |
| 14 / 13 | Kısıtlı hesap aracıyla değeri koruyan farklı işlem ifadeleri oluşturma; sekiz alt görev ve bir örnek | Doğrudan MAT.6.1.1–4 eşlenmedi; ek/önkoşul karşılığı incelenecek |
| 15 / 14 | İşlem karar grafiğinde tam bir hata koşulunu koruyarak olası çıkışları belirleme | Doğrudan MAT.6.1.1–4 eşlenmedi; ek aritmetik muhakeme adayı |
| 16 / 15 | Bütün çarpanları listeleme, asal çarpanı ayırma ve istenen niceliği doğru gruptan seçme; üç alt görev | MAT.6.1.1 ve MAT.6.1.3'ün içerik alt kümesi |
| 17 / 15 | Eksik çarpan listesinden başlangıç sayısına ters gitme; iki satır | MAT.6.1.1'in destek becerisi adayı |
| 18 / 16 | Her sayının asal çarpanlarını ayrı bulma, uç değeri seçme ve kurala göre sıralama | MAT.6.1.3'ün içerik alt kümesi; sıralama yeni resmî çıktı değil |

Altı dış sorunun biri dört seçenekli, beşi yapılandırılmış/açık yanıtlıdır. 14. sorudaki sekiz alt görev, 16. sorudaki A/B/C, 17. sorudaki iki satır ve 18. sorudaki dört kaynak sayı, dış soru veya ürün stoğu olarak çoğaltılmadı. 16. sayfadaki komşu 19. soru örnekleme alınmadı. Tam 51 sayfalık fasikülün soru toplamı bilinmiyor.

Yeni metadata altı proje soru ailesi adayı, on altı türetilmiş mikroamaç ve altı birincil temsil adayı taşıyor. Bunlar resmî MEB taksonomisi, ampirik farklılık kanıtı veya kabul edilmiş soru sayısı değildir. Aynı sayfa/konu içinde çarpan listesini ileri oluşturmakla eksik listeden geri gitmek ayrı amaçlardır; sadece sayıları değiştirerek aynı şablonu çoğaltmak bu ayrımı sağlamaz.

## Program ve DAMA Sınırları

Önerilen kodlar fasikülde basılı TYMM kodları değildir. Daha önce gerçek program sayfalarında incelenen `tymm-current-ortaokul-matematik` PDF'si (SHA `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`, çıktı kodları fiziksel/basılı 67) ve [önceki aday matris](../sources/grade6-source-semantic-candidate-matrix.json) kullanıldı. Önceki matris dosya SHA'sı `31edb054438bda76809910ed0fcc87227093954401caec48abcd7e04ef5722c8`. Program PDF'si bu fazda yeniden okunmadı. Dört kaynak sorusunun içerik alt kümesi MAT.6.1.1–3 ile ilişkilendirilebilir; hiçbir soru bu çıktıların bütün keşif, genelleme ve muhakeme süreçlerini ölçtü sayılmaz.

MAT.6.1.4 için bu örneklemde uygun doğrudan soru yok. Bu, bütün kaynakta veya bütün programda yokluk iddiası değildir. 14/15. sorularına uygun bir resmî çıktı uydurulmadı; kod alanı boş ve ek eşleme bekliyor. Öğrenme yılı, etkin program eşdeğerliği, yayın hakkı ve uzman kabulü birbirinden ayrı tutuldu.

DAMA amaçlı metadata; kaynak kimliği, SHA, gerçek sayfa, kaynak rolü, gözlem tarihi, amaç, türetilmiş temsil, önkoşul/çıktı adayı ve açık kalite/izin kapılarını ayırıyor. Sorumlu veri sahibi/steward ve saklama kararı henüz atanmış değildir. Bu kayıt DAMA sertifikasyonu değildir. Kaynak açık erişimli olsa da ticari yeniden kullanım ve modele aktarım izni doğrulanmış değildir; `reference_only`, transfer kapalı, yayın/öğrenci/üretim hazır bayrakları false kaldı.

Her soruya kısa özgün editör notu eklendi: Neyi önce ayırmak veya kontrol etmek gerekir, bu neden işe yarayabilir? Bu notlar kaynak çözümünün kopyası, öğrenciye kabul edilmiş pratik yol veya hızın öğrenme kanıtı sayılması değildir. Sorunun istediğini yakalama, değerleri anlamlandırma ve sonucu kontrol etme ilkesi korunuyor.

## Tüketici Kanıtı ve Tekrar Üretim

Yeni çalışma bir metadata dilimidir; ortak runtime modülü yazılmadı/değiştirilmedi. Mevcut `createSourceScopeGapReport` gerçek tüketicisine yeni JSON bağlandı. İnsan raporu prose testi yapılmadı.

Önce yedi davranış testi yazıldı. Yeni JSON yokken 0/7 RED: Hepsi eksik yeni gözlem kaydı nedeniyle başarısız oldu. JSON sonrası 7/7 GREEN. Taze birleşik çalıştırma 36/36 PASS, sıfır hata/skip; yeni testin syntax kontrolü exit 0:

```sh
node --test test/grade6_question_form_observations.test.mjs test/source_scope_gaps.test.mjs test/grade6_source_semantic_matrix.test.mjs
node --check test/grade6_question_form_observations.test.mjs
```

Gerçek tüketici kanıtı:

- Bir SHA bağlı gözlem kaydı ve altı dış kaynak sorusu. Tam kaynak soru toplamı null; tam 1'den başlayan sıra sayımı 0. Ürün katkısı, üretim ve kabul 0; kapsam yüzdesi null.
- Yalnız bellek içinde eski ve yeni Hatay gözlemleri birleştirildiğinde, önceki iki kaynağın 27 gözlemi 33'e çıkar; Hatay 7'den 13'e çıkar. Bu birleşim hiçbir mevcut kayda/CLI'ye kaydedilmedi. Kaynak PDF edinim ve rol sayıları değişmez; rol kesişimi ikinci PDF değildir.
- Yanlış SHA veya bilinmeyen kaynak kimliği hata fırlatmaz: Açık `lineageBound:false` ile bağlanmamış gösterilir, bağlı soru/aile sayısına katkısı 0 olur. Duplicate dış sıra veya aynı kaynak için iki gözlem kaydı reddedilir.
- Getter/proxy sıfır hook çağrısıyla reddedilir; döngü de reddedilir. Sahte stok, uzman/etkin program/yayın bayrakları ve tam-sıra iddiası 13–18'i tamamlanmış kaynak yapamaz.

Sınır: Tüketici metadata projeksiyonu yapar; kaynak PDF'yi yeniden okumaz, gözlem sayfalarını veya mikroamaçların pedagojisini doğrulayan tam bir şema/uzman aracı değildir. SHA bağlaması tek başına düzenlenmiş metadata için kimlik doğrulaması veya resmî kabul değildir. Taze byte/raster kanıtı bu fazın insan incelemesidir; otomatik raporun `freshPdfByteChecks:0` değeri özellikle korunur. Testler MEB onayı veya CMMI/SPICE sertifikası değildir.

## Açık İşler

Kök ajan source SHA ve pdfinfo'yu ayrıca doğruladı; fiziksel12–16 metnini ve kapak+beş native PNG'yi kendi incelemesinde kontrol etti. Dış sıra13–18 ve alt görevlerin ayrı sayılması, karar grafiğinin text extraction'da eksik düğümleri, yıl belirsizliği ve MAT.6.1.4 örnek yokluğu gözlemiyle uyumlu kaldı. Bu ikinci insan/ajan source-form incelemesidir; answer-key/çözüm veya pedagojik kabul değildir. `modelTransferPerformed:false` yalnız ayrı canlı fabrika/Clef/üretici endpoint'ine kaynak aktarımı yapılmadığını ifade eder; kaynakların Codex inceleme bağlamında okunmadığı iddiası değildir.

Yayın/öğretim yılı ve arşiv program sürümü; etkin 2026–2027 eşdeğerliği; tam kaynak/sınıf paydaları; MAT.6.1.4 örneklemesi; iki ek aritmetik sorunun çıktı eşlemesi; cevap anahtarı ve bağımsız çözüm denetimi; zorluk/çeldirici kalibrasyonu; ticari hak ve uzman onayı; renk, ok, boşluk sırası için erişilebilir eşdeğerler bekliyor.

Seçili sayfalarda kolay/orta/zor/çok zor dağılımı gözlenmedi. Örnek yüzdeler resmî MEB dağılımı veya uygulanmış kalibrasyon olarak kullanılmadı. Bu dilimde soru/konu anlatımı fabrika çağrısı, ses/video üretimi, öğrenci verisi, yeni indirme, Drive işlemi veya yayına alma yok.
