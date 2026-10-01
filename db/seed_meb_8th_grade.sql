-- ============================================================================
-- MEB 8. Sınıf LGS Çekirdek Müfredat ve Örnek Altın Standart Soru Tohumu (Seed)
-- ============================================================================

-- 1. Ders Ekleme
INSERT INTO courses (id, name, grade_level) VALUES
(1, 'Türkçe', 8),
(2, 'Matematik', 8),
(3, 'Fen Bilimleri', 8)
ON CONFLICT (name) DO NOTHING;

-- 2. Üniteler
INSERT INTO units (id, course_id, unit_no, title, description) VALUES
(1, 1, 1, 'Okuma ve Anlam Bilgisi', 'Metin analizi, paragrafta anlam, söz varlığı ve sözel mantık'),
(2, 2, 1, 'Sayılar ve İşlemler', 'Çarpanlar ve katlar, üslü ifadeler, kareköklü ifadeler'),
(3, 3, 1, 'Mevsimler ve İklim', 'Dünya''nın hareketleri, mevsimlerin oluşumu ve iklim-hava hareketleri')
ON CONFLICT (id) DO NOTHING;

-- 3. Konular
INSERT INTO topics (id, unit_id, topic_no, title, slug) VALUES
(1, 1, 1, 'Paragrafta Anlam ve Yapı', 'paragrafta-anlam-ve-yapi'),
(2, 2, 1, 'Çarpanlar ve Katlar (EBOB-EKOK)', 'carpanlar-ve-katlar-ebob-ekok'),
(3, 3, 1, 'Mevsimlerin Oluşumu ve İklim', 'mevsimlerin-olusumu-ve-iklim')
ON CONFLICT (id) DO NOTHING;

-- 4. MEB Kazanımları ve Soru Alt Tipleri
INSERT INTO learning_outcomes (id, topic_id, code, title, sub_category_code, sub_category_name, bloom_level) VALUES
(1, 1, 'T.8.3.14.03', 'Metindeki ana fikri ve düşüncenin akışını belirler.', '03_AKISI_BOZAN_CUMLE', 'Akışı Bozan Cümle', 'ANALYZE'),
(2, 1, 'T.8.3.14.01', 'Metindeki ana düşünceyi ve vurgulanmak isteneni bulur.', '01_ANA_DUSUNCE', 'Ana Düşünce', 'EVALUATE'),
(3, 2, 'M.8.1.1.1', 'İki doğal sayının en büyük ortak bölenini (EBOB) ve en küçük ortak katını (EKOK) hesaplar, ilgili problemleri çözer.', 'EBOB_EKOK_PROBLEMLERI', 'EBOB-EKOK Modelleme', 'APPLY'),
(4, 3, 'F.8.1.1.1', 'Mevsimlerin oluşumuna yönelik tahminlerde bulunur ve deney düzeneklerini yorumlar.', 'MEVSIM_DENEY_DUZENEGI', 'Işık Açısı ve Sıcaklık İlişkisi', 'ANALYZE')
ON CONFLICT (id) DO NOTHING;

-- 5. Altın Standart MEB Düzeyinde Sorular
INSERT INTO questions (
    id,
    outcome_id,
    code,
    stimulus,
    stem,
    options,
    correct_option,
    solution_strategy,
    detailed_solution,
    distractor_analysis,
    difficulty_level,
    cognitive_skill,
    jev_audit,
    is_approved,
    is_published
) VALUES 
(
    'a1b2c3d4-e5f6-4a5b-8c9d-012345678901',
    1,
    'LGS-TR-PAR-0001',
    '(I) Yapay zekâ destekli klinik tanı sistemleri, tıp dünyasında hekimlerin en kritik karar destek mekanizması hâline gelmiştir. (II) Milyonlarca vaka ve radyolojik görüntüyü saniyeler içinde tarayan bu algoritmalar, insan gözünün kaçırabileceği mikroskobik doku anomalilerini yüksek hassasiyetle saptayabilmektedir. (III) Hastane binalarının mimari tasarımında doğal ışık kullanımının artırılması, ameliyat sonrası hasta nekahet süresini belirgin şekilde kısaltmaktadır. (IV) Hekimin klinik tecrübesiyle yapay zekânın devasa veri işleme kabiliyeti harmanlandığında, teşhis hataları en aza inmekte ve tedavi başarısı katlanmaktadır.',
    'Bu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
    '{"A": "I", "B": "II", "C": "III", "D": "IV"}'::jsonb,
    'C',
    '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru tipi bir "Düşüncenin Akışını Bozan Cümle" sorusudur. Çözüm algoritması: Parçanın omurgasını oluşturan anahtar kelimeleri (Yapay zekâ, klinik tanı, hekim, algoritma, teşhis) takip edin. Konunun aniden başka bir alana sıçradığı cümleyi bulun.',
    'Parçanın I, II ve IV. cümlelerinde "Yapay zekânın hekim teşhislerindeki rolü ve tanı doğruluğu" ele alınmaktadır. III. cümlede ise konuyla hiçbir nedensellik bağı kurulmadan birdenbire "Hastane mimarisi ve doğal ışık" konusuna geçilmiştir. Dolayısıyla III. cümle metnin düşünce omurgasını kırmakta ve akışı bozmaktadır. Doğru cevap C şıkkıdır.',
    '{
        "A": "I. cümle parçanın giriş cümlesidir; konuyu (yapay zekâ ve klinik tanı) tanımlar, akış bozulması söz konusu değildir.",
        "B": "II. cümle I. cümlenin mantıksal devamıdır; algoritmanın teşhis yeteneğini açıklar.",
        "D": "IV. cümle II. cümledeki teknolojik gücü hekim tecrübesiyle bağlayarak ana fikri sonuca ulaştırır."
    }'::jsonb,
    'LGS_YENI_NESIL',
    'Metin İçi Mantıksal Tutarlılık ve Akıl Yürütme',
    '{"is_meb_aligned": true, "bloom_level": "ANALYZE", "distractor_quality": 0.95, "tdk_compliance": true, "approved": true}'::jsonb,
    true,
    true
),
(
    'b2c3d4e5-f6a7-5b6c-9d0e-123456789012',
    3,
    'LGS-MAT-EB-0001',
    'Bir belediye, kenar uzunlukları 180 metre ve 240 metre olan dikdörtgen biçimindeki bir afet lojistik alanının etrafına ve içine, eşit aralıklarla güneş enerjili aydınlatma direkleri dikecektir. Sahadaki köşelere de birer direk dikilmesi zorunludur. Ayrıca afet durumunda güvenli geçişi sağlamak amacıyla iki direk arasındaki mesafenin metre cinsinden bir tam sayı ve 15 metreden küçük olması istenmektedir.',
    'Buna göre bu lojistik sahasının sadece çevresi boyunca dikilecek aydınlatma direği sayısı en az kaç olabilir?',
    '{"A": "35", "B": "42", "C": "70", "D": "84"}'::jsonb,
    'C',
    '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru yeni nesil bir "Kısıtlı EBOB" problemidir. En az direk sayısı için aralık mesafesini mümkün olan en büyük seçmeliyiz. Ancak soru kökündeki gizli kısıta dikkat: "Direkler arası mesafe 15 metreden küçük olmalıdır!"',
    'Adım 1: 180 ve 240 sayılarının EBOB''unu bulalım:\nEBOB(180, 240) = 60 metredir.\n\nAdım 2: Direkler arası mesafe 60''ın böleni olmalıdır: 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1.\nSoru kuralı: Mesafe < 15 m olmalıdır. O hâlde 15''ten küçük en büyük bölen 12 metredir!\n\nAdım 3: Dikdörtgenin çevresi = 2 x (180 + 240) = 2 x 420 = 840 metre.\nDirek Sayısı = Çevre / Aralık = 840 / 12 = 70 adet direk dikilir. Doğru cevap C şıkkıdır.',
    '{
        "A": "Aralığı yanlışlıkla 24 m kabul eden öğrencilerin bulduğu sonuçtur.",
        "B": "Aralığı 20 m (15''ten küçük kuralını göz ardı edip 20 seçen) öğrencilerin düştüğü güçlü çeldiricidir (840/20 = 42).",
        "D": "Aralığı 10 m seçip en büyük böleni yakalayamayanların sonucudur."
    }'::jsonb,
    'LGS_YENI_NESIL',
    'Kısıtlı Matematiksel Modelleme ve EBOB Analizi',
    '{"is_meb_aligned": true, "bloom_level": "APPLY", "distractor_quality": 0.98, "tdk_compliance": true, "approved": true}'::jsonb,
    true,
    true
),
(
    'c3d4e5f6-a7b8-6c7d-0e1f-234567890123',
    4,
    'LGS-FEN-MEV-0001',
    'Fen bilimleri öğretmeni, özdeş iki el feneri ve özdeş iki termometre kullanarak karanlık bir laboratuvarda aşağıdaki deney düzeneğini kuruyor:\n• 1. Düzenek: El feneri düz bir zemine dik (90°) açıyla tutuluyor ve aydınlanan dairesel alanın sıcaklığı 10 dakika sonra ölçülüyor.\n• 2. Düzenek: El feneri aynı mesafeden eğik (30°) açıyla tutuluyor ve aydınlanan elips şeklindeki alanın sıcaklığı 10 dakika sonra ölçülüyor.\nDeney sonucunda 1. düzenekteki termometrenin 2. düzenekten 8 °C daha yüksek bir sıcaklık gösterdiği kaydediliyor.',
    'Yapılan bu kontrollü deneyle ilgili aşağıdaki çıkarımlardan hangisi doğrudur?',
    '{"A": "Deneyde bağımsız değişken, aydınlanan yüzeyin başlangıç sıcaklığıdır.", "B": "Güneş ışınlarının gelme açısı küçüldükçe birim yüzeye düşen ışık enerjisi miktarı artar.", "C": "2. düzenekte aydınlanan alanın daha geniş olması, birim yüzeye aktarılan ısı enerjisinin daha az olduğunu kanıtlar.", "D": "Deney sonucuna göre mevsimlerin oluşumunda Dünya''nın Güneş''e olan uzaklığının değişmesi belirleyicidir."}'::jsonb,
    'C',
    '💡 UZMAN ÖĞRETMEN STRATEJİSİ: MEB Fen testinde "Işığın Düşme Açısı - Alan - Sıcaklık" korelasyonu değişmez bir LGS klasiğidir. Kural: Açı dikleştikçe (büyüdükçe) alan daralır, birim yüzeye düşen enerji artar. Açı eğikleştikçe alan genişler, birim yüzeye düşen enerji azalır.',
    '2. düzenekte ışık eğik açıyla (30°) geldiği için ışık enerjisi daha geniş bir yüzeye dağılmıştır. Enerji dağıldığı için birim yüzeye düşen enerji miktarı azalmış ve sıcaklık artışı daha az olmuştur. Bu nedenle C şıkkı kesinlikle doğrudur.',
    '{
        "A": "Bağımsız değişken araştırmacının değiştirdiği ''ışığın gelme açısı''dır; başlangıç sıcaklığı kontrol edilen (sabit) değişkendir.",
        "B": "Açı küçüldükçe (eğikleştikçe) birim yüzeye düşen enerji azalır, artmaz; zıt önermeli çeldiricidir.",
        "D": "Dünya''nın Güneş''e uzaklığı mevsimlerin oluşumunda etkili değildir (en yaygın LGS kavram yanılgısıdır)."
    }'::jsonb,
    'LGS_YENI_NESIL',
    'Bilimsel Değişken Tespiti ve Hipotez Doğrulama',
    '{"is_meb_aligned": true, "bloom_level": "ANALYZE", "distractor_quality": 0.96, "tdk_compliance": true, "approved": true}'::jsonb,
    true,
    true
)
ON CONFLICT (id) DO NOTHING;
