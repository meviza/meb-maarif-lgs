-- ============================================================================
-- MEB Maarif LGS Platformu - Faz 3 Tam Üretim SQL Tohum Dosyası
-- Üretim Tarihi: 2026-10-02T07:37:26.682Z
-- Toplam: 4 Branş, 12 Test Paketi, 53 Yeni Nesil LGS Sorusu
-- ============================================================================

BEGIN;

-- 1. Kurslar (Courses)
INSERT INTO courses (id, name, grade_level, is_active) VALUES
(1, 'Türkçe', 8, true),
(2, 'Matematik', 8, true),
(3, 'Fen Bilimleri', 8, true),
(4, 'T.C. İnkılap Tarihi ve Atatürkçülük', 8, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Üniteler (Units)
INSERT INTO units (id, course_id, unit_no, title) VALUES
(1, 1, 1, 'Okuma ve Anlam Bilgisi'),
(2, 2, 1, 'Sayılar ve İşlemler'),
(3, 3, 1, 'Mevsimler, İklim ve Madde'),
(4, 4, 1, 'Bir Kahraman Doğuyor ve Millî Mücadele')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 3. Konular (Topics)
INSERT INTO topics (id, unit_id, topic_no, title, slug) VALUES
(1, 1, 1, 'Paragrafta Anlam ve Yapı', 'turkce-paragraf-anlam-ve-yapi'),
(2, 2, 1, 'EBOB-EKOK ve Üslü İfadeler', 'matematik-ebob-ekok-ve-uslu-sayilar'),
(3, 3, 1, 'Mevsimler ve Basınç', 'fen-mevsimler-dna-ve-basinc'),
(4, 4, 1, 'Milli Uyanış ve Bağımsızlık', 'inkilap-milli-uyanis-ve-lozan')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 4. Kazanımlar (Learning Outcomes)
INSERT INTO learning_outcomes (id, topic_id, code, title, sub_category_code, sub_category_name, bloom_level) VALUES
(1, 1, 'T.8.3.14.03 • Akışı Bozan Cümle', 'T.8.3.14.03 • Akışı Bozan Cümle', 'T.8.3.14.03 • Akışı Bozan Cümle', 'T.8.3.14.03 • Akışı Bozan Cümle', 'ANALYZE'),
(2, 1, 'T.8.3.14.01 • Ana Düşünce (Vurgulanan Fikir)', 'T.8.3.14.01 • Ana Düşünce (Vurgulanan Fikir)', 'T.8.3.14.01 • Ana Düşünce (Vurgulanan Fikir)', 'T.8.3.14.01 • Ana Düşünce (Vurgulanan Fikir)', 'ANALYZE'),
(3, 1, 'T.8.3.14 • Paragrafta Ana Fikir ve Vurgulanan Anlam', 'T.8.3.14 • Paragrafta Ana Fikir ve Vurgulanan Anlam', 'T.8.3.14 • Paragrafta Ana Fikir ve Vurgulanan Anlam', 'T.8.3.14 • Paragrafta Ana Fikir ve Vurgulanan Anlam', 'ANALYZE'),
(4, 1, 'T.8.3.16 • Paragrafın Yapısı ve Akışı Bozan Cümle', 'T.8.3.16 • Paragrafın Yapısı ve Akışı Bozan Cümle', 'T.8.3.16 • Paragrafın Yapısı ve Akışı Bozan Cümle', 'T.8.3.16 • Paragrafın Yapısı ve Akışı Bozan Cümle', 'ANALYZE'),
(5, 1, 'T.8.3.34 • Metinler Arası Karşılaştırma ve Bakış Açısı', 'T.8.3.34 • Metinler Arası Karşılaştırma ve Bakış Açısı', 'T.8.3.34 • Metinler Arası Karşılaştırma ve Bakış Açısı', 'T.8.3.34 • Metinler Arası Karşılaştırma ve Bakış Açısı', 'ANALYZE'),
(6, 1, 'T.8.3.18 • Düşünceyi Geliştirme Yolları ve Anlatım Nitelikleri', 'T.8.3.18 • Düşünceyi Geliştirme Yolları ve Anlatım Nitelikleri', 'T.8.3.18 • Düşünceyi Geliştirme Yolları ve Anlatım Nitelikleri', 'T.8.3.18 • Düşünceyi Geliştirme Yolları ve Anlatım Nitelikleri', 'ANALYZE'),
(7, 1, 'T.8.3.14.05 • Çoklu Çıkarım ve Metin Analizi', 'T.8.3.14.05 • Çoklu Çıkarım ve Metin Analizi', 'T.8.3.14.05 • Çoklu Çıkarım ve Metin Analizi', 'T.8.3.14.05 • Çoklu Çıkarım ve Metin Analizi', 'ANALYZE'),
(8, 1, 'T.8.3.18 • Düşünceyi Geliştirme Yolları', 'T.8.3.18 • Düşünceyi Geliştirme Yolları', 'T.8.3.18 • Düşünceyi Geliştirme Yolları', 'T.8.3.18 • Düşünceyi Geliştirme Yolları', 'ANALYZE'),
(9, 1, 'T.8.3.34 • Metin Karşılaştırma', 'T.8.3.34 • Metin Karşılaştırma', 'T.8.3.34 • Metin Karşılaştırma', 'T.8.3.34 • Metin Karşılaştırma', 'ANALYZE'),
(10, 1, 'T.8.3.26 • Sözel Mantık / Sıralama ve Kesin Yargı Çıkarımı', 'T.8.3.26 • Sözel Mantık / Sıralama ve Kesin Yargı Çıkarımı', 'T.8.3.26 • Sözel Mantık / Sıralama ve Kesin Yargı Çıkarımı', 'T.8.3.26 • Sözel Mantık / Sıralama ve Kesin Yargı Çıkarımı', 'ANALYZE'),
(11, 1, 'T.8.3.25 • Tablo ve Grafik Yorumlama / Veri Analizi', 'T.8.3.25 • Tablo ve Grafik Yorumlama / Veri Analizi', 'T.8.3.25 • Tablo ve Grafik Yorumlama / Veri Analizi', 'T.8.3.25 • Tablo ve Grafik Yorumlama / Veri Analizi', 'ANALYZE'),
(12, 1, 'T.8.3.26 • Sözel Mantık / Kurallı Akıl Yürütme ve Kodlama', 'T.8.3.26 • Sözel Mantık / Kurallı Akıl Yürütme ve Kodlama', 'T.8.3.26 • Sözel Mantık / Kurallı Akıl Yürütme ve Kodlama', 'T.8.3.26 • Sözel Mantık / Kurallı Akıl Yürütme ve Kodlama', 'ANALYZE'),
(13, 1, 'T.8.3.35 • Metin Tamamlama ve Mantıksal Bütünlük', 'T.8.3.35 • Metin Tamamlama ve Mantıksal Bütünlük', 'T.8.3.35 • Metin Tamamlama ve Mantıksal Bütünlük', 'T.8.3.35 • Metin Tamamlama ve Mantıksal Bütünlük', 'ANALYZE'),
(14, 1, 'T.8.3.18.01 • Anlatım Biçimleri ve Düşünceyi Geliştirme', 'T.8.3.18.01 • Anlatım Biçimleri ve Düşünceyi Geliştirme', 'T.8.3.18.01 • Anlatım Biçimleri ve Düşünceyi Geliştirme', 'T.8.3.18.01 • Anlatım Biçimleri ve Düşünceyi Geliştirme', 'ANALYZE'),
(15, 1, 'T.8.3.14 • Paragrafı İki Bölüme Ayırma', 'T.8.3.14 • Paragrafı İki Bölüme Ayırma', 'T.8.3.14 • Paragrafı İki Bölüme Ayırma', 'T.8.3.14 • Paragrafı İki Bölüme Ayırma', 'ANALYZE'),
(16, 1, 'T.8.3.26 • Sözel Mantık / Şifreleme ve Tablo Okuma', 'T.8.3.26 • Sözel Mantık / Şifreleme ve Tablo Okuma', 'T.8.3.26 • Sözel Mantık / Şifreleme ve Tablo Okuma', 'T.8.3.26 • Sözel Mantık / Şifreleme ve Tablo Okuma', 'ANALYZE'),
(17, 1, 'T.8.3.15 • Metnin Ana Düşüncesi ve Yardımcı Fikirler', 'T.8.3.15 • Metnin Ana Düşüncesi ve Yardımcı Fikirler', 'T.8.3.15 • Metnin Ana Düşüncesi ve Yardımcı Fikirler', 'T.8.3.15 • Metnin Ana Düşüncesi ve Yardımcı Fikirler', 'ANALYZE'),
(18, 1, 'T.8.3.26 • Sözel Mantık ve Akıl Yürütme', 'T.8.3.26 • Sözel Mantık ve Akıl Yürütme', 'T.8.3.26 • Sözel Mantık ve Akıl Yürütme', 'T.8.3.26 • Sözel Mantık ve Akıl Yürütme', 'ANALYZE'),
(19, 1, 'T.8.3.17 • Metindeki Söz Sanatları', 'T.8.3.17 • Metindeki Söz Sanatları', 'T.8.3.17 • Metindeki Söz Sanatları', 'T.8.3.17 • Metindeki Söz Sanatları', 'ANALYZE'),
(20, 1, 'T.8.3.25 • Grafik ve Tablo Yorumlama', 'T.8.3.25 • Grafik ve Tablo Yorumlama', 'T.8.3.25 • Grafik ve Tablo Yorumlama', 'T.8.3.25 • Grafik ve Tablo Yorumlama', 'ANALYZE'),
(21, 1, 'T.8.3.34 • Üst Düzey Metin Analizi ve Örtük Anlam', 'T.8.3.34 • Üst Düzey Metin Analizi ve Örtük Anlam', 'T.8.3.34 • Üst Düzey Metin Analizi ve Örtük Anlam', 'T.8.3.34 • Üst Düzey Metin Analizi ve Örtük Anlam', 'ANALYZE'),
(22, 1, 'T.8.4.16 • Fiilimsiler (Eylemsiler)', 'T.8.4.16 • Fiilimsiler (Eylemsiler)', 'T.8.4.16 • Fiilimsiler (Eylemsiler)', 'T.8.4.16 • Fiilimsiler (Eylemsiler)', 'ANALYZE'),
(23, 1, 'T.8.4.18 • Cümlenin Ögeleri', 'T.8.4.18 • Cümlenin Ögeleri', 'T.8.4.18 • Cümlenin Ögeleri', 'T.8.4.18 • Cümlenin Ögeleri', 'ANALYZE'),
(24, 1, 'T.8.4.19 • Cümle Vurgusu', 'T.8.4.19 • Cümle Vurgusu', 'T.8.4.19 • Cümle Vurgusu', 'T.8.4.19 • Cümle Vurgusu', 'ANALYZE'),
(25, 1, 'T.8.3.28 • Metin Türleri (Makale, Deneme, Fıkra)', 'T.8.3.28 • Metin Türleri (Makale, Deneme, Fıkra)', 'T.8.3.28 • Metin Türleri (Makale, Deneme, Fıkra)', 'T.8.3.28 • Metin Türleri (Makale, Deneme, Fıkra)', 'ANALYZE'),
(26, 1, 'T.8.3.16 • Paragrafın Yapısı ve Cümle İlişkileri', 'T.8.3.16 • Paragrafın Yapısı ve Cümle İlişkileri', 'T.8.3.16 • Paragrafın Yapısı ve Cümle İlişkileri', 'T.8.3.16 • Paragrafın Yapısı ve Cümle İlişkileri', 'ANALYZE'),
(27, 1, 'T.8.4.20 • Yazım Kuralları ve Büyük Harflerin Kullanımı', 'T.8.4.20 • Yazım Kuralları ve Büyük Harflerin Kullanımı', 'T.8.4.20 • Yazım Kuralları ve Büyük Harflerin Kullanımı', 'T.8.4.20 • Yazım Kuralları ve Büyük Harflerin Kullanımı', 'ANALYZE'),
(28, 1, 'T.8.3.35 • Üst Düzey Anlam İlişkileri ve Argümantasyon', 'T.8.3.35 • Üst Düzey Anlam İlişkileri ve Argümantasyon', 'T.8.3.35 • Üst Düzey Anlam İlişkileri ve Argümantasyon', 'T.8.3.35 • Üst Düzey Anlam İlişkileri ve Argümantasyon', 'ANALYZE'),
(29, 2, 'M.8.1.1.1 • EBOB-EKOK Modelleme', 'M.8.1.1.1 • EBOB-EKOK Modelleme', 'M.8.1.1.1 • EBOB-EKOK Modelleme', 'M.8.1.1.1 • EBOB-EKOK Modelleme', 'ANALYZE'),
(30, 2, 'M.8.1.2.2 • Üslü İfadeler ve Bilimsel Gösterim', 'M.8.1.2.2 • Üslü İfadeler ve Bilimsel Gösterim', 'M.8.1.2.2 • Üslü İfadeler ve Bilimsel Gösterim', 'M.8.1.2.2 • Üslü İfadeler ve Bilimsel Gösterim', 'ANALYZE'),
(31, 2, 'M.8.1.1.1 • EBOB-EKOK Modelleme ve Problem Çözme', 'M.8.1.1.1 • EBOB-EKOK Modelleme ve Problem Çözme', 'M.8.1.1.1 • EBOB-EKOK Modelleme ve Problem Çözme', 'M.8.1.1.1 • EBOB-EKOK Modelleme ve Problem Çözme', 'ANALYZE'),
(32, 2, 'M.8.1.1.2 • Ortak Bölenler ve Alan Modelleri', 'M.8.1.1.2 • Ortak Bölenler ve Alan Modelleri', 'M.8.1.1.2 • Ortak Bölenler ve Alan Modelleri', 'M.8.1.1.2 • Ortak Bölenler ve Alan Modelleri', 'ANALYZE'),
(33, 2, 'M.8.1.2.2 • Üslü İfadelerle Temel İşlemler', 'M.8.1.2.2 • Üslü İfadelerle Temel İşlemler', 'M.8.1.2.2 • Üslü İfadelerle Temel İşlemler', 'M.8.1.2.2 • Üslü İfadelerle Temel İşlemler', 'ANALYZE'),
(34, 2, 'M.8.1.2.5 • Çok Büyük ve Çok Küçük Sayılar ile Bilimsel Gösterim', 'M.8.1.2.5 • Çok Büyük ve Çok Küçük Sayılar ile Bilimsel Gösterim', 'M.8.1.2.5 • Çok Büyük ve Çok Küçük Sayılar ile Bilimsel Gösterim', 'M.8.1.2.5 • Çok Büyük ve Çok Küçük Sayılar ile Bilimsel Gösterim', 'ANALYZE'),
(35, 2, 'M.8.1.1.3 • Asal Çarpanlar ve Modüler EBOB', 'M.8.1.1.3 • Asal Çarpanlar ve Modüler EBOB', 'M.8.1.1.3 • Asal Çarpanlar ve Modüler EBOB', 'M.8.1.1.3 • Asal Çarpanlar ve Modüler EBOB', 'ANALYZE'),
(36, 2, 'M.8.2.1.4 • Cebirsel İfadeler ve Özdeşlikler', 'M.8.2.1.4 • Cebirsel İfadeler ve Özdeşlikler', 'M.8.2.1.4 • Cebirsel İfadeler ve Özdeşlikler', 'M.8.2.1.4 • Cebirsel İfadeler ve Özdeşlikler', 'ANALYZE'),
(37, 2, 'M.8.5.1.5 • Basit Olayların Olasılığı', 'M.8.5.1.5 • Basit Olayların Olasılığı', 'M.8.5.1.5 • Basit Olayların Olasılığı', 'M.8.5.1.5 • Basit Olayların Olasılığı', 'ANALYZE'),
(38, 2, 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı Modellemesi', 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı Modellemesi', 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı Modellemesi', 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı Modellemesi', 'ANALYZE'),
(39, 2, 'M.8.2.1.4 • Cebirsel İfadelerin Çarpımı ve Geometrik Desenler', 'M.8.2.1.4 • Cebirsel İfadelerin Çarpımı ve Geometrik Desenler', 'M.8.2.1.4 • Cebirsel İfadelerin Çarpımı ve Geometrik Desenler', 'M.8.2.1.4 • Cebirsel İfadelerin Çarpımı ve Geometrik Desenler', 'ANALYZE'),
(40, 2, 'M.8.5.1.4 • Basit Olayların Olasılığı ve Olasılık Değişimi', 'M.8.5.1.4 • Basit Olayların Olasılığı ve Olasılık Değişimi', 'M.8.5.1.4 • Basit Olayların Olasılığı ve Olasılık Değişimi', 'M.8.5.1.4 • Basit Olayların Olasılığı ve Olasılık Değişimi', 'ANALYZE'),
(41, 2, 'M.8.5.1.5 • Kareköklü İfadeler ve Olasılık Modellemesi', 'M.8.5.1.5 • Kareköklü İfadeler ve Olasılık Modellemesi', 'M.8.5.1.5 • Kareköklü İfadeler ve Olasılık Modellemesi', 'M.8.5.1.5 • Kareköklü İfadeler ve Olasılık Modellemesi', 'ANALYZE'),
(42, 2, 'M.8.2.1.2 • Cebirsel İfadelerde Katsayılar ve Terimler', 'M.8.2.1.2 • Cebirsel İfadelerde Katsayılar ve Terimler', 'M.8.2.1.2 • Cebirsel İfadelerde Katsayılar ve Terimler', 'M.8.2.1.2 • Cebirsel İfadelerde Katsayılar ve Terimler', 'ANALYZE'),
(43, 2, 'M.8.2.2.6 • Doğrusal Denklemler ve Eğim', 'M.8.2.2.6 • Doğrusal Denklemler ve Eğim', 'M.8.2.2.6 • Doğrusal Denklemler ve Eğim', 'M.8.2.2.6 • Doğrusal Denklemler ve Eğim', 'ANALYZE'),
(44, 2, 'M.8.1.4.2 • Veri Analizi', 'M.8.1.4.2 • Veri Analizi', 'M.8.1.4.2 • Veri Analizi', 'M.8.1.4.2 • Veri Analizi', 'ANALYZE'),
(45, 2, 'M.8.1.3.1 • Kareköklü İfadelerin Yaklaşık Değeri', 'M.8.1.3.1 • Kareköklü İfadelerin Yaklaşık Değeri', 'M.8.1.3.1 • Kareköklü İfadelerin Yaklaşık Değeri', 'M.8.1.3.1 • Kareköklü İfadelerin Yaklaşık Değeri', 'ANALYZE'),
(46, 2, 'M.8.1.3.5 • Kareköklü İfadelerle Çarpma ve Bölme', 'M.8.1.3.5 • Kareköklü İfadelerle Çarpma ve Bölme', 'M.8.1.3.5 • Kareköklü İfadelerle Çarpma ve Bölme', 'M.8.1.3.5 • Kareköklü İfadelerle Çarpma ve Bölme', 'ANALYZE'),
(47, 2, 'M.8.5.1.5 • Olayların Olasılığı ve Torba Modeli', 'M.8.5.1.5 • Olayların Olasılığı ve Torba Modeli', 'M.8.5.1.5 • Olayların Olasılığı ve Torba Modeli', 'M.8.5.1.5 • Olayların Olasılığı ve Torba Modeli', 'ANALYZE'),
(48, 2, 'M.8.2.2.1 • Doğrusal İlişki ve Grafik Analizi', 'M.8.2.2.1 • Doğrusal İlişki ve Grafik Analizi', 'M.8.2.2.1 • Doğrusal İlişki ve Grafik Analizi', 'M.8.2.2.1 • Doğrusal İlişki ve Grafik Analizi', 'ANALYZE'),
(49, 2, 'M.8.2.1.4 • Cebirsel Modelleme ve Alan Optimizasyonu', 'M.8.2.1.4 • Cebirsel Modelleme ve Alan Optimizasyonu', 'M.8.2.1.4 • Cebirsel Modelleme ve Alan Optimizasyonu', 'M.8.2.1.4 • Cebirsel Modelleme ve Alan Optimizasyonu', 'ANALYZE'),
(50, 2, 'M.8.1.3.2 • a√b Gösterimi', 'M.8.1.3.2 • a√b Gösterimi', 'M.8.1.3.2 • a√b Gösterimi', 'M.8.1.3.2 • a√b Gösterimi', 'ANALYZE'),
(51, 2, 'M.8.1.4.1 • Daire Grafiği ve Açı Hesabı', 'M.8.1.4.1 • Daire Grafiği ve Açı Hesabı', 'M.8.1.4.1 • Daire Grafiği ve Açı Hesabı', 'M.8.1.4.1 • Daire Grafiği ve Açı Hesabı', 'ANALYZE'),
(52, 2, 'M.8.1.3.3 • Kareköklü İfadelerde Toplama ve Çıkarma', 'M.8.1.3.3 • Kareköklü İfadelerde Toplama ve Çıkarma', 'M.8.1.3.3 • Kareköklü İfadelerde Toplama ve Çıkarma', 'M.8.1.3.3 • Kareköklü İfadelerde Toplama ve Çıkarma', 'ANALYZE'),
(53, 2, 'M.8.1.4.2 • Çizgi ve Sütun Grafiği Dönüşümü', 'M.8.1.4.2 • Çizgi ve Sütun Grafiği Dönüşümü', 'M.8.1.4.2 • Çizgi ve Sütun Grafiği Dönüşümü', 'M.8.1.4.2 • Çizgi ve Sütun Grafiği Dönüşümü', 'ANALYZE'),
(54, 2, 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı', 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı', 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı', 'M.8.2.1.3 • Özdeşlikler ve İki Kare Farkı', 'ANALYZE'),
(55, 2, 'M.8.1.1.2 • Asal Sayılar ve Çarpan Ağacı', 'M.8.1.1.2 • Asal Sayılar ve Çarpan Ağacı', 'M.8.1.1.2 • Asal Sayılar ve Çarpan Ağacı', 'M.8.1.1.2 • Asal Sayılar ve Çarpan Ağacı', 'ANALYZE'),
(56, 2, 'M.8.2.2.6 • Çok Adımlı Eğim ve Koordinat Optimizasyonu', 'M.8.2.2.6 • Çok Adımlı Eğim ve Koordinat Optimizasyonu', 'M.8.2.2.6 • Çok Adımlı Eğim ve Koordinat Optimizasyonu', 'M.8.2.2.6 • Çok Adımlı Eğim ve Koordinat Optimizasyonu', 'ANALYZE'),
(57, 3, 'F.8.1.1.1 • Işık Açısı ve Sıcaklık İlişkisi', 'F.8.1.1.1 • Işık Açısı ve Sıcaklık İlişkisi', 'F.8.1.1.1 • Işık Açısı ve Sıcaklık İlişkisi', 'F.8.1.1.1 • Işık Açısı ve Sıcaklık İlişkisi', 'ANALYZE'),
(58, 3, 'F.8.1.1.1 • Mevsimlerin Oluşumu ve Güneş Işınlarının Geliş Açısı', 'F.8.1.1.1 • Mevsimlerin Oluşumu ve Güneş Işınlarının Geliş Açısı', 'F.8.1.1.1 • Mevsimlerin Oluşumu ve Güneş Işınlarının Geliş Açısı', 'F.8.1.1.1 • Mevsimlerin Oluşumu ve Güneş Işınlarının Geliş Açısı', 'ANALYZE'),
(59, 3, 'F.8.1.2.1 • İklim ve Hava Olayları - Rüzgâr Oluşumu ve Basınç Merkezleri', 'F.8.1.2.1 • İklim ve Hava Olayları - Rüzgâr Oluşumu ve Basınç Merkezleri', 'F.8.1.2.1 • İklim ve Hava Olayları - Rüzgâr Oluşumu ve Basınç Merkezleri', 'F.8.1.2.1 • İklim ve Hava Olayları - Rüzgâr Oluşumu ve Basınç Merkezleri', 'ANALYZE'),
(60, 3, 'F.8.2.1.2 • DNA ve Genetik Kod - DNA''nın Eşlenmesi ve Nükleotid Dizilimi', 'F.8.2.1.2 • DNA ve Genetik Kod - DNA''nın Eşlenmesi ve Nükleotid Dizilimi', 'F.8.2.1.2 • DNA ve Genetik Kod - DNA''nın Eşlenmesi ve Nükleotid Dizilimi', 'F.8.2.1.2 • DNA ve Genetik Kod - DNA''nın Eşlenmesi ve Nükleotid Dizilimi', 'ANALYZE'),
(61, 3, 'F.8.2.2.1 • Kalıtım - Çaprazlamalar ve Genotip-Fenotip Olasılıkları', 'F.8.2.2.1 • Kalıtım - Çaprazlamalar ve Genotip-Fenotip Olasılıkları', 'F.8.2.2.1 • Kalıtım - Çaprazlamalar ve Genotip-Fenotip Olasılıkları', 'F.8.2.2.1 • Kalıtım - Çaprazlamalar ve Genotip-Fenotip Olasılıkları', 'ANALYZE'),
(62, 3, 'F.8.1.2.2 • Hava Olayları ve İklim Farkı', 'F.8.1.2.2 • Hava Olayları ve İklim Farkı', 'F.8.1.2.2 • Hava Olayları ve İklim Farkı', 'F.8.1.2.2 • Hava Olayları ve İklim Farkı', 'ANALYZE'),
(63, 3, 'F.8.1.1.2 • Eksen Eğikliği ve Gölge Boyu Optimizasyonu', 'F.8.1.1.2 • Eksen Eğikliği ve Gölge Boyu Optimizasyonu', 'F.8.1.1.2 • Eksen Eğikliği ve Gölge Boyu Optimizasyonu', 'F.8.1.1.2 • Eksen Eğikliği ve Gölge Boyu Optimizasyonu', 'ANALYZE'),
(64, 3, 'F.8.3.1.2 • Sıvı Basıncı ve Derinlik - Yoğunluk İlişkisi', 'F.8.3.1.2 • Sıvı Basıncı ve Derinlik - Yoğunluk İlişkisi', 'F.8.3.1.2 • Sıvı Basıncı ve Derinlik - Yoğunluk İlişkisi', 'F.8.3.1.2 • Sıvı Basıncı ve Derinlik - Yoğunluk İlişkisi', 'ANALYZE'),
(65, 3, 'F.8.4.4.4 • Asit Yağmurları ve pH Değişimi', 'F.8.4.4.4 • Asit Yağmurları ve pH Değişimi', 'F.8.4.4.4 • Asit Yağmurları ve pH Değişimi', 'F.8.4.4.4 • Asit Yağmurları ve pH Değişimi', 'ANALYZE'),
(66, 3, 'F.8.3.1.1 • Katı Basıncını Etkileyen Değişkenler (Kuvvet ve Yüzey Alanı)', 'F.8.3.1.1 • Katı Basıncını Etkileyen Değişkenler (Kuvvet ve Yüzey Alanı)', 'F.8.3.1.1 • Katı Basıncını Etkileyen Değişkenler (Kuvvet ve Yüzey Alanı)', 'F.8.3.1.1 • Katı Basıncını Etkileyen Değişkenler (Kuvvet ve Yüzey Alanı)', 'ANALYZE'),
(67, 3, 'F.8.3.1.3 • Gaz Basıncı ve Açık Hava Basıncı Deneyleri', 'F.8.3.1.3 • Gaz Basıncı ve Açık Hava Basıncı Deneyleri', 'F.8.3.1.3 • Gaz Basıncı ve Açık Hava Basıncı Deneyleri', 'F.8.3.1.3 • Gaz Basıncı ve Açık Hava Basıncı Deneyleri', 'ANALYZE'),
(68, 3, 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimler ve Kütlenin Korunumu', 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimler ve Kütlenin Korunumu', 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimler ve Kütlenin Korunumu', 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimler ve Kütlenin Korunumu', 'ANALYZE'),
(69, 3, 'F.8.4.3.1 • Periyodik Sistemde Elementlerin Sınıflandırılması ve Ayırt Edici Özellikleri', 'F.8.4.3.1 • Periyodik Sistemde Elementlerin Sınıflandırılması ve Ayırt Edici Özellikleri', 'F.8.4.3.1 • Periyodik Sistemde Elementlerin Sınıflandırılması ve Ayırt Edici Özellikleri', 'F.8.4.3.1 • Periyodik Sistemde Elementlerin Sınıflandırılması ve Ayırt Edici Özellikleri', 'ANALYZE'),
(70, 3, 'F.8.3.1.2 • U Borusu Sıvı Basıncı ve Yoğunluk Optimizasyonu', 'F.8.3.1.2 • U Borusu Sıvı Basıncı ve Yoğunluk Optimizasyonu', 'F.8.3.1.2 • U Borusu Sıvı Basıncı ve Yoğunluk Optimizasyonu', 'F.8.3.1.2 • U Borusu Sıvı Basıncı ve Yoğunluk Optimizasyonu', 'ANALYZE'),
(71, 3, 'F.8.5.1.1 • Kaldıraç Tipleri ve Kuvvet Kazancı', 'F.8.5.1.1 • Kaldıraç Tipleri ve Kuvvet Kazancı', 'F.8.5.1.1 • Kaldıraç Tipleri ve Kuvvet Kazancı', 'F.8.5.1.1 • Kaldıraç Tipleri ve Kuvvet Kazancı', 'ANALYZE'),
(72, 3, 'F.8.6.2.2 • Fotosentez ve Solunum İlişkisi', 'F.8.6.2.2 • Fotosentez ve Solunum İlişkisi', 'F.8.6.2.2 • Fotosentez ve Solunum İlişkisi', 'F.8.6.2.2 • Fotosentez ve Solunum İlişkisi', 'ANALYZE'),
(73, 3, 'F.8.2.1.3 • Nükleotid Eşleşmesi ve DNA Kuralları', 'F.8.2.1.3 • Nükleotid Eşleşmesi ve DNA Kuralları', 'F.8.2.1.3 • Nükleotid Eşleşmesi ve DNA Kuralları', 'F.8.2.1.3 • Nükleotid Eşleşmesi ve DNA Kuralları', 'ANALYZE'),
(74, 3, 'F.8.2.2.2 • Akraba Evliliği ve Genetik Hastalıklar', 'F.8.2.2.2 • Akraba Evliliği ve Genetik Hastalıklar', 'F.8.2.2.2 • Akraba Evliliği ve Genetik Hastalıklar', 'F.8.2.2.2 • Akraba Evliliği ve Genetik Hastalıklar', 'ANALYZE'),
(75, 3, 'F.8.3.1.1 • Katı Basıncı ve Yüzey Alanı İlişkisi', 'F.8.3.1.1 • Katı Basıncı ve Yüzey Alanı İlişkisi', 'F.8.3.1.1 • Katı Basıncı ve Yüzey Alanı İlişkisi', 'F.8.3.1.1 • Katı Basıncı ve Yüzey Alanı İlişkisi', 'ANALYZE'),
(76, 3, 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimlerin Ayırt Edilmesi', 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimlerin Ayırt Edilmesi', 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimlerin Ayırt Edilmesi', 'F.8.4.2.1 • Fiziksel ve Kimyasal Değişimlerin Ayırt Edilmesi', 'ANALYZE'),
(77, 3, 'F.8.5.1.2 • Makaralar ve Kuvvet Kazancı Optimizasyonu', 'F.8.5.1.2 • Makaralar ve Kuvvet Kazancı Optimizasyonu', 'F.8.5.1.2 • Makaralar ve Kuvvet Kazancı Optimizasyonu', 'F.8.5.1.2 • Makaralar ve Kuvvet Kazancı Optimizasyonu', 'ANALYZE'),
(78, 3, 'F.8.4.4.1 • Asitler ve Bazların Genel Özellikleri', 'F.8.4.4.1 • Asitler ve Bazların Genel Özellikleri', 'F.8.4.4.1 • Asitler ve Bazların Genel Özellikleri', 'F.8.4.4.1 • Asitler ve Bazların Genel Özellikleri', 'ANALYZE'),
(79, 3, 'F.8.4.4.2 • pH Cetveli ve Nötrleşme', 'F.8.4.4.2 • pH Cetveli ve Nötrleşme', 'F.8.4.4.2 • pH Cetveli ve Nötrleşme', 'F.8.4.4.2 • pH Cetveli ve Nötrleşme', 'ANALYZE'),
(80, 3, 'F.8.4.3.2 • Periyodik Tabloda Grup ve Periyot Özellikleri', 'F.8.4.3.2 • Periyodik Tabloda Grup ve Periyot Özellikleri', 'F.8.4.3.2 • Periyodik Tabloda Grup ve Periyot Özellikleri', 'F.8.4.3.2 • Periyodik Tabloda Grup ve Periyot Özellikleri', 'ANALYZE'),
(81, 3, 'F.8.5.1.3 • Eğik Düzlemde Kuvvet Kazancı', 'F.8.5.1.3 • Eğik Düzlemde Kuvvet Kazancı', 'F.8.5.1.3 • Eğik Düzlemde Kuvvet Kazancı', 'F.8.5.1.3 • Eğik Düzlemde Kuvvet Kazancı', 'ANALYZE'),
(82, 3, 'F.8.4.1.2 • Kimyasal Tepkimelerde Kütlenin Korunumu', 'F.8.4.1.2 • Kimyasal Tepkimelerde Kütlenin Korunumu', 'F.8.4.1.2 • Kimyasal Tepkimelerde Kütlenin Korunumu', 'F.8.4.1.2 • Kimyasal Tepkimelerde Kütlenin Korunumu', 'ANALYZE'),
(83, 3, 'F.8.5.1.4 • Çıkrık ve Dişli Çark Sistemleri', 'F.8.5.1.4 • Çıkrık ve Dişli Çark Sistemleri', 'F.8.5.1.4 • Çıkrık ve Dişli Çark Sistemleri', 'F.8.5.1.4 • Çıkrık ve Dişli Çark Sistemleri', 'ANALYZE'),
(84, 3, 'F.8.6.1.2 • Besin Zincirinde Enerji Piramidi ve Biyolojik Birikim', 'F.8.6.1.2 • Besin Zincirinde Enerji Piramidi ve Biyolojik Birikim', 'F.8.6.1.2 • Besin Zincirinde Enerji Piramidi ve Biyolojik Birikim', 'F.8.6.1.2 • Besin Zincirinde Enerji Piramidi ve Biyolojik Birikim', 'ANALYZE'),
(85, 4, 'İTA.8.1.1 • Bir Kahraman Doğuyor: Fikir Akımları ve Dağılmayı Önleme Çabaları', 'İTA.8.1.1 • Bir Kahraman Doğuyor: Fikir Akımları ve Dağılmayı Önleme Çabaları', 'İTA.8.1.1 • Bir Kahraman Doğuyor: Fikir Akımları ve Dağılmayı Önleme Çabaları', 'İTA.8.1.1 • Bir Kahraman Doğuyor: Fikir Akımları ve Dağılmayı Önleme Çabaları', 'ANALYZE'),
(86, 4, 'İTA.8.1.3 • Bir Kahraman Doğuyor: Mustafa Kemal''in Askerlik Hayatı ve Kişilik Özellikleri', 'İTA.8.1.3 • Bir Kahraman Doğuyor: Mustafa Kemal''in Askerlik Hayatı ve Kişilik Özellikleri', 'İTA.8.1.3 • Bir Kahraman Doğuyor: Mustafa Kemal''in Askerlik Hayatı ve Kişilik Özellikleri', 'İTA.8.1.3 • Bir Kahraman Doğuyor: Mustafa Kemal''in Askerlik Hayatı ve Kişilik Özellikleri', 'ANALYZE'),
(87, 4, 'İTA.8.2.2 • Millî Uyanış: Mondros Ateşkes Antlaşması ve İşgallere Karşı Tepkiler', 'İTA.8.2.2 • Millî Uyanış: Mondros Ateşkes Antlaşması ve İşgallere Karşı Tepkiler', 'İTA.8.2.2 • Millî Uyanış: Mondros Ateşkes Antlaşması ve İşgallere Karşı Tepkiler', 'İTA.8.2.2 • Millî Uyanış: Mondros Ateşkes Antlaşması ve İşgallere Karşı Tepkiler', 'ANALYZE'),
(88, 4, 'İTA.8.2.4 • Millî Uyanış: Genelgeler ve Kongreler Süreci (Sivas Kongresi ve Teşkilatlanma)', 'İTA.8.2.4 • Millî Uyanış: Genelgeler ve Kongreler Süreci (Sivas Kongresi ve Teşkilatlanma)', 'İTA.8.2.4 • Millî Uyanış: Genelgeler ve Kongreler Süreci (Sivas Kongresi ve Teşkilatlanma)', 'İTA.8.2.4 • Millî Uyanış: Genelgeler ve Kongreler Süreci (Sivas Kongresi ve Teşkilatlanma)', 'ANALYZE'),
(89, 4, 'İTA.8.1.2 • Mustafa Kemal''in Öğrenim Hayatı', 'İTA.8.1.2 • Mustafa Kemal''in Öğrenim Hayatı', 'İTA.8.1.2 • Mustafa Kemal''in Öğrenim Hayatı', 'İTA.8.1.2 • Mustafa Kemal''in Öğrenim Hayatı', 'ANALYZE'),
(90, 4, 'İTA.8.2.3 • Havza ve Amasya Genelgesi Analizi', 'İTA.8.2.3 • Havza ve Amasya Genelgesi Analizi', 'İTA.8.2.3 • Havza ve Amasya Genelgesi Analizi', 'İTA.8.2.3 • Havza ve Amasya Genelgesi Analizi', 'ANALYZE'),
(91, 4, 'İTA.8.3.1 • Doğu ve Güney Cepheleri: Gümrü Antlaşması ve Millî Mücadele Diplomasisi', 'İTA.8.3.1 • Doğu ve Güney Cepheleri: Gümrü Antlaşması ve Millî Mücadele Diplomasisi', 'İTA.8.3.1 • Doğu ve Güney Cepheleri: Gümrü Antlaşması ve Millî Mücadele Diplomasisi', 'İTA.8.3.1 • Doğu ve Güney Cepheleri: Gümrü Antlaşması ve Millî Mücadele Diplomasisi', 'ANALYZE'),
(92, 4, 'İTA.8.3.3 • Batı Cephesi: Tekâlif-i Millîye Emirleri ve Topyekûn Seferberlik (Millî Dayanışma)', 'İTA.8.3.3 • Batı Cephesi: Tekâlif-i Millîye Emirleri ve Topyekûn Seferberlik (Millî Dayanışma)', 'İTA.8.3.3 • Batı Cephesi: Tekâlif-i Millîye Emirleri ve Topyekûn Seferberlik (Millî Dayanışma)', 'İTA.8.3.3 • Batı Cephesi: Tekâlif-i Millîye Emirleri ve Topyekûn Seferberlik (Millî Dayanışma)', 'ANALYZE'),
(93, 4, 'İTA.8.3.4 • Maarif Seferberliği: I. Maarif Kongresi ve Millî Eğitimin Temelleri', 'İTA.8.3.4 • Maarif Seferberliği: I. Maarif Kongresi ve Millî Eğitimin Temelleri', 'İTA.8.3.4 • Maarif Seferberliği: I. Maarif Kongresi ve Millî Eğitimin Temelleri', 'İTA.8.3.4 • Maarif Seferberliği: I. Maarif Kongresi ve Millî Eğitimin Temelleri', 'ANALYZE'),
(94, 4, 'İTA.8.3.5 • Batı Cephesi: Sakarya Meydan Muharebesi ve Diplomatik Zaferler (Kars & Ankara Antlaşmaları)', 'İTA.8.3.5 • Batı Cephesi: Sakarya Meydan Muharebesi ve Diplomatik Zaferler (Kars & Ankara Antlaşmaları)', 'İTA.8.3.5 • Batı Cephesi: Sakarya Meydan Muharebesi ve Diplomatik Zaferler (Kars & Ankara Antlaşmaları)', 'İTA.8.3.5 • Batı Cephesi: Sakarya Meydan Muharebesi ve Diplomatik Zaferler (Kars & Ankara Antlaşmaları)', 'ANALYZE'),
(95, 4, 'İTA.8.3.2 • Birinci İnönü Zaferi ve Sonuçları', 'İTA.8.3.2 • Birinci İnönü Zaferi ve Sonuçları', 'İTA.8.3.2 • Birinci İnönü Zaferi ve Sonuçları', 'İTA.8.3.2 • Birinci İnönü Zaferi ve Sonuçları', 'ANALYZE'),
(96, 4, 'İTA.8.3.6 • Başkomutanlık Kanunu ve Meclis İradesi', 'İTA.8.3.6 • Başkomutanlık Kanunu ve Meclis İradesi', 'İTA.8.3.6 • Başkomutanlık Kanunu ve Meclis İradesi', 'İTA.8.3.6 • Başkomutanlık Kanunu ve Meclis İradesi', 'ANALYZE'),
(97, 4, 'İTA.8.1.1 • Bir Kahraman Doğuyor', 'İTA.8.1.1 • Bir Kahraman Doğuyor', 'İTA.8.1.1 • Bir Kahraman Doğuyor', 'İTA.8.1.1 • Bir Kahraman Doğuyor', 'ANALYZE'),
(98, 4, 'İTA.8.2.1 • Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar', 'İTA.8.2.1 • Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar', 'İTA.8.2.1 • Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar', 'İTA.8.2.1 • Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar', 'ANALYZE'),
(99, 4, 'İTA.8.3.2 • Millî Bir Destan: Ya İstiklal Ya Ölüm!', 'İTA.8.3.2 • Millî Bir Destan: Ya İstiklal Ya Ölüm!', 'İTA.8.3.2 • Millî Bir Destan: Ya İstiklal Ya Ölüm!', 'İTA.8.3.2 • Millî Bir Destan: Ya İstiklal Ya Ölüm!', 'ANALYZE'),
(100, 4, 'İTA.8.2.8 • Lozan Barış Antlaşması ve Kapitülasyonlar', 'İTA.8.2.8 • Lozan Barış Antlaşması ve Kapitülasyonlar', 'İTA.8.2.8 • Lozan Barış Antlaşması ve Kapitülasyonlar', 'İTA.8.2.8 • Lozan Barış Antlaşması ve Kapitülasyonlar', 'ANALYZE'),
(101, 4, 'İTA.8.2.8 • Mudanya Ateşkes Antlaşması''nın Önemi', 'İTA.8.2.8 • Mudanya Ateşkes Antlaşması''nın Önemi', 'İTA.8.2.8 • Mudanya Ateşkes Antlaşması''nın Önemi', 'İTA.8.2.8 • Mudanya Ateşkes Antlaşması''nın Önemi', 'ANALYZE'),
(102, 4, 'İTA.8.2.8 • Lozan''da Kapitülasyonlar ve İktisadi Bağımsızlık', 'İTA.8.2.8 • Lozan''da Kapitülasyonlar ve İktisadi Bağımsızlık', 'İTA.8.2.8 • Lozan''da Kapitülasyonlar ve İktisadi Bağımsızlık', 'İTA.8.2.8 • Lozan''da Kapitülasyonlar ve İktisadi Bağımsızlık', 'ANALYZE'),
(103, 4, 'İTA.8.4.1 • Cumhuriyetçilik İlkesi ve Demokrasi', 'İTA.8.4.1 • Cumhuriyetçilik İlkesi ve Demokrasi', 'İTA.8.4.1 • Cumhuriyetçilik İlkesi ve Demokrasi', 'İTA.8.4.1 • Cumhuriyetçilik İlkesi ve Demokrasi', 'ANALYZE'),
(104, 4, 'İTA.8.4.2 • Milliyetçilik İlkesi ve Kültürel Birlik', 'İTA.8.4.2 • Milliyetçilik İlkesi ve Kültürel Birlik', 'İTA.8.4.2 • Milliyetçilik İlkesi ve Kültürel Birlik', 'İTA.8.4.2 • Milliyetçilik İlkesi ve Kültürel Birlik', 'ANALYZE'),
(105, 4, 'İTA.8.4.3 • Halkçılık İlkesi ve Kanun Önünde Eşitlik', 'İTA.8.4.3 • Halkçılık İlkesi ve Kanun Önünde Eşitlik', 'İTA.8.4.3 • Halkçılık İlkesi ve Kanun Önünde Eşitlik', 'İTA.8.4.3 • Halkçılık İlkesi ve Kanun Önünde Eşitlik', 'ANALYZE'),
(106, 4, 'İTA.8.4.4 • Devletçilik İlkesi ve İzmir İktisat Kongresi', 'İTA.8.4.4 • Devletçilik İlkesi ve İzmir İktisat Kongresi', 'İTA.8.4.4 • Devletçilik İlkesi ve İzmir İktisat Kongresi', 'İTA.8.4.4 • Devletçilik İlkesi ve İzmir İktisat Kongresi', 'ANALYZE'),
(107, 4, 'İTA.8.4.5 • Laiklik İlkesi ve Hukuk Alanında İnkılaplar', 'İTA.8.4.5 • Laiklik İlkesi ve Hukuk Alanında İnkılaplar', 'İTA.8.4.5 • Laiklik İlkesi ve Hukuk Alanında İnkılaplar', 'İTA.8.4.5 • Laiklik İlkesi ve Hukuk Alanında İnkılaplar', 'ANALYZE'),
(108, 4, 'İTA.8.4.6 • İnkılapçılık ve Dinamik Çağdaşlaşma', 'İTA.8.4.6 • İnkılapçılık ve Dinamik Çağdaşlaşma', 'İTA.8.4.6 • İnkılapçılık ve Dinamik Çağdaşlaşma', 'İTA.8.4.6 • İnkılapçılık ve Dinamik Çağdaşlaşma', 'ANALYZE')
ON CONFLICT (id) DO NOTHING;

-- 5. Test Paketleri (Tests)
INSERT INTO tests (id, topic_id, test_type, test_no, title, total_questions, duration_minutes, is_published) VALUES
(1, 1, 'LGS_DENEME_SOZEL', 7, 'Test 1: Paragrafta Anlam ve Yapı', 7, 30, true),
(2, 1, 'LGS_DENEME_SOZEL', 7, 'Test 2: Sözel Mantık ve Metin Analizi', 7, 30, true),
(3, 1, 'LGS_DENEME_SOZEL', 7, 'Test 3: Maarif Modeli Sözel Karma Deneme', 7, 30, true),
(4, 1, 'LGS_DENEME_SOZEL', 7, 'Test 4: Cümlenin Ögeleri, Fiilimsiler ve Metin Türleri', 7, 30, true),
(5, 2, 'LGS_DENEME_SAYISAL', 7, 'Test 1: Çarpanlar, Katlar ve Üslü Sayılar', 7, 30, true),
(6, 2, 'LGS_DENEME_SAYISAL', 7, 'Test 2: Cebirsel İfadeler ve Olasılık', 7, 30, true),
(7, 2, 'LGS_DENEME_SAYISAL', 7, 'Test 3: Sayısal Modelleme Karma Deneme', 7, 30, true),
(8, 2, 'LGS_DENEME_SAYISAL', 7, 'Test 4: Kareköklü İfadeler, Veri Analizi ve Geometrik Optimizasyon', 7, 30, true),
(9, 3, 'LGS_DENEME_SAYISAL', 7, 'Test 1: Mevsimler, İklim ve DNA', 7, 30, true),
(10, 3, 'LGS_DENEME_SAYISAL', 7, 'Test 2: Basınç ve Madde-Endüstri Deneyleri', 7, 30, true),
(11, 3, 'LGS_DENEME_SAYISAL', 7, 'Test 3: Bilimsel Süreç Becerileri Denemesi', 7, 30, true),
(12, 3, 'LGS_DENEME_SAYISAL', 7, 'Test 4: Asitler, Bazlar, Kimyasal Değişim ve Basit Makineler', 7, 30, true),
(13, 4, 'LGS_DENEME_SOZEL', 6, 'Test 1: Bir Kahraman Doğuyor & Millî Uyanış', 6, 30, true),
(14, 4, 'LGS_DENEME_SOZEL', 6, 'Test 2: Ya İstiklal Ya Ölüm & Maarif Seferberliği', 6, 30, true),
(15, 4, 'LGS_DENEME_SOZEL', 6, 'Test 3: Lozan ve Siyasi Bağımsızlık', 6, 30, true),
(16, 4, 'LGS_DENEME_SOZEL', 6, 'Test 4: Atatürk İlkeleri ve Çağdaşlaşan Türkiye', 6, 30, true)
ON CONFLICT (id) DO NOTHING;

-- 6. Sorular (Questions)
INSERT INTO questions (id, outcome_id, code, stimulus, stem, options, correct_option, solution_strategy, detailed_solution, distractor_analysis, difficulty_level, jev_audit, is_approved, is_published) VALUES
(
          'a0000000-0000-0000-0000-000000000001'::uuid,
          1,
          'LGS-TR-01',
          '(I) Yapay zekâ destekli klinik tanı sistemleri, tıp dünyasında hekimlerin en kritik karar destek mekanizması hâline gelmiştir. (II) Milyonlarca vaka ve radyolojik görüntüyü saniyeler içinde tarayan bu algoritmalar, insan gözünün kaçırabileceği mikroskobik doku anomalilerini yüksek hassasiyetle saptayabilmektedir. (III) Hastane binalarının mimari tasarımında doğal ışık kullanımının artırılması, ameliyat sonrası hasta nekahet süresini belirgin şekilde kısaltmaktadır. (IV) Hekimin klinik tecrübesiyle yapay zekânın devasa veri işleme kabiliyeti harmanlandığında, teşhis hataları en aza inmekte ve tedavi başarısı katlanmaktadır.',
          'Bu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
          '{"A":"I","B":"II","C":"III","D":"IV"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Parçanın omurgasını oluşturan anahtar kavramları (Yapay zekâ, klinik tanı, teşhis) takip edin. Konunun aniden hastane mimarisine saptığı cümleyi yakalayın.',
          'I, II ve IV. cümleler yapay zekânın hekim teşhislerindeki teknolojik katkısını işlerken, III. cümle bağlam dışına çıkıp hastane mimarisinden söz etmektedir. Dolayısıyla III. cümle akışı bozar.',
          '{"A":"I. cümle giriş cümlesidir; konuyu tanımlar.","B":"II. cümle I. cümlenin mantıksal devamıdır; algoritmanın gücünü açıklar.","D":"IV. cümle teknolojiyi hekim tecrübesiyle bağlayıp ana fikri tamamlar."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.974Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000002'::uuid,
          2,
          'LGS-TR-02',
          'Gerçek bir yazar, çağının tanığı olmakla yetinmez; o, toplumun duymadığı fısıltıları, görmezden geldiği yaraları kelimelerin büyüteci altına alır. Sanat, yalnızca bir ayna gibi gerçeği yansıtmaz; gerçeğin karanlıkta kalmış köşelerine fener tutarak insanı dönüştürmeyi hedefler. Sadece alkış almak için yazılmış suya sabuna dokunmayan eserler, zamanın acımasız eleğinde savrulup yok olmaya mahkûmdur.',
          'Bu parçada asıl vurgulanmak istenen düşünce aşağıdakilerden hangisidir?',
          '{"A":"Sanatçılar, toplumun beğenisini kazanmak için güncel konuları işlemelidir.","B":"Kalıcı ve değerli edebiyat, toplumsal gerçekleri aydınlatıp insanı dönüştürme gücü taşıyan edebiyattır.","C":"Zamanın eleğinden yalnızca estetik kaygıyla yazılmış süslü metinler geçebilir.","D":"Toplumun sorunlarını işlemeyen yazarlar geleceğe kalıcı eser bırakamaz."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Parçanın son cümlesindeki "zamanın acımasız eleği" ve ortadaki "insanı dönüştürmeyi hedefler" ifadesi doğrudan kalıcılık ve dönüştürücü güç vurgusunu işaret eder.',
          'Yazar, sanatın pasif bir ayna olmanın ötesine geçerek insanı dönüştürmesi gerektiğini ve suya sabuna dokunmayan eserlerin unutulacağını savunmaktadır. Bu da B şıkkındaki yargıyı doğrular.',
          '{"A":"Yazar alkış ve beğeni peşinde koşmayı eleştirmektedir, tam zıttıdır.","C":"Metinde estetik süsten değil, gerçeğe fener tutmaktan bahsedilir.","D":"D şıkkı güçlü bir çeldiricidir ancak yazarın asıl amacı sadece olumsuzlamak değil, kalıcı sanatın dönüştürücü gücünü vurgulamaktır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"EVALUATE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.976Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000003'::uuid,
          3,
          'LGS-TR-T1-01',
          'Günümüz dijital çağında bilgiye ulaşmak bir tık kadar yakın olsa da bilginin içselleştirilmesi her zamankinden daha güç bir hâl almıştır. Ekranlar karşısında gerçekleştirdiğimiz hızlı taramalar, zihnimize anlık ve parçalı veriler sunmakta; fakat bu durum ''derin okuma'' olarak adlandırdığımız zihinsel inşa sürecini baltalamaktadır. Oysa basılı bir kitabın sayfalarında ilerlerken satır aralarındaki boşlukları kendi hayal gücümüzle doldurur, yazarın kurduğu mantıksal örgüyle tartışır ve empati yeteneğimizi bileriz. Bilgiyi tüketmek ile onu bir kavrayışa dönüştürmek arasındaki fark; bir gölün yüzeyinde kayıp gitmek ile onun berrak derinliklerine dalıp inciler toplamak gibidir. Gerçek zihinsel olgunluk, bilginin çokluğunda değil; metinle kurulan bu derin ve sabırlı bağda filizlenir.',
          'Bu parçada asıl anlatılmak istenen düşünce aşağıdakilerden hangisidir?',
          '{"A":"Dijital teknolojilerin yaygınlaşması, bireylerin yazılı kültürle olan bağını tamamen koparmıştır.","B":"Nitelikli bir zihinsel gelişim, bilginin hızla tüketilmesinden ziyade sabırla ve derinlemesine özümsenmesiyle mümkündür.","C":"Basılı kitaplar, teknolojik araçlara göre bilgiye daha güvenilir ve pratik yoldan ulaşma imkânı sunar.","D":"Empati yeteneğinin gelişmesi, bireyin bilimsel ve felsefi metinleri düzenli olarak okumasına bağlıdır."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Ana fikir sorularında metnin bütününe hâkim olan temel ileti aranır. Özellikle metnin son cümlelerinde yer alan ''Bilgiyi tüketmek ile onu bir kavrayışa dönüştürmek arasındaki fark...'', ''Gerçek zihinsel olgunluk, bilginin çokluğunda değil; metinle kurulan bu derin ve sabırlı bağda filizlenir.'' vurgusu, bilginin yüzeysel tüketimi yerine derinlemesine kavranması gerektiğini doğrudan ortaya koyar.',
          'Parçada dijital ortamda gerçekleşen hızlı bilgi tüketimi ile basılı kitaplar üzerinden yapılan ''derin okuma'' arasındaki nitelik farkı işlenmiştir. Yazar; bilginin çokluğunun veya hızla taranmasının zihinsel olgunluk sağlamadığını, asıl gelişimin sabırla metnin derinliklerine inip onu bir kavrayışa (özümsemeye) dönüştürmekle gerçekleşeceğini vurgulamaktadır. Bu durum B seçeneğinde eksiksiz özetlenmiştir. Doğru cevap B seçeneğidir.',
          '{"A":"Metinde teknolojinin bağı tamamen kopardığı iddia edilmemiştir; yüzeysel okuma alışkanlığına dikkat çekilmiştir.","C":"Parçada basılı kitapların daha pratik olduğu söylenmemiş, aksine dijitalin pratik ama yüzeysel, basılının ise derinlikli olduğu belirtilmiştir.","D":"Empati yeteneğinin derin okuma ile geliştiğine değinilmiş ancak bunun yalnızca bilimsel ve felsefi metinlerle sınırlı olduğu gibi bir genelleme yapılmamıştır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.976Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000004'::uuid,
          4,
          'LGS-TR-T1-02',
          '(I) Mimar Sinan’ın yüzyıllara meydan okuyan abidevi eserleri, sadece estetik bir zirve değil; aynı zamanda eşsiz bir statik ve jeolojik dehanın ürünüdür. (II) Sinan, yapılarının temelini atmadan önce zemini tonlarca ağırlıktaki kazıklarla sıkıştırmış ve temelin oturması için yıllarca sabırla beklemiştir. (III) Süleymaniye ve Selimiye gibi ulu camilerin kubbe kasnaklarında kullandığı horasan harcı ve esnek kilit taşları, deprem dalgalarını emerek enerjiyi toprağa iletecek şekilde tasarlanmıştır. (IV) Klasik Osmanlı mimarisinde kubbe içi hat yazıları ve çiniler, ibadethaneye giren cemaatin ruhuna manevi bir dinginlik aşılamak amacıyla özel bir uyumla yerleştirilmiştir. (V) Nitekim meydana gelen şiddetli sarsıntılarda yapıların esneyip kırılmamasını sağlayan bu mimari mekanizma, günümüz sismoloji uzmanlarınca hâlâ hayranlıkla incelenmektedir.',
          'Bu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
          '{"A":"II","B":"III","C":"IV","D":"V"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Akışı bozan cümle sorularında konu zincirine ve kavramsal bağa dikkat edilir. I, II, III ve V. cümleler Sinan''ın mimarisindeki mühendislik, zemin statiği, horasan harcı ve depreme dayanıklılık mekanizmalarını anlatırken IV. cümle konudan saparak iç mekândaki tezyinat ve manevi etkiye geçmiştir. Bu nedenle düşüncenin akışını bozar.',
          'Metnin bütününde Mimar Sinan''ın yapılarındaki sismik direnç, zemin statiği, zemin sıkıştırma ve deprem enerjisini sönümleyen harç/kilit taşı mühendisliği incelenmektedir. V. cümledeki ''Nitekim meydana gelen şiddetli sarsıntılarda yapıların esneyip kırılmamasını sağlayan bu mimari mekanizma...'' ifadesi doğrudan III. cümledeki esnek kilit taşları ve horasan harcına bağlanmaktadır. Arada yer alan IV. cümle ise ibadethanenin iç süslemesi (hat ve çini) ve manevi tesirine değinerek konunun odağını değiştirmiş ve akışı bozmuştur. Doğru cevap C seçeneğidir.',
          '{"A":"II. cümle Sinan''ın zemin mühendisliğini ve temel atma tekniğini açıklayarak ana temayı devam ettirmektedir.","B":"III. cümle zemin tekniğinden sonra üst yapının depreme karşı nasıl güçlendirildiğini somutlaştırmaktadır.","D":"V. cümle III. cümlede anlatılan deprem mekanizmasının günümüzdeki bilimsel yankısını ele alıp metni mantıksal bir sonuca bağlamaktadır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000005'::uuid,
          5,
          'LGS-TR-T1-03',
          '1. Metin:
Yapay zekâ dil modelleri; milyonlarca edebî metni tarayarak dilin ritmini, sözcük sıklıklarını ve kurgusal örüntüleri matematiksel bir kusursuzlukla taklit edebilmektedir. Günümüzde bir algoritma, saniyeler içinde belirli bir şairin üslubunda hece veznine uygun şiirler yazabilmekte veya popüler türlerin şablonlarına uyan sürükleyici polisiye taslakları üretebilmektedir. Bu durum, edebiyatın biçimsel ve teknik boyutunun algoritmalar vasıtasıyla çözümlenebilir bir mekaniğe sahip olduğunu açıkça göstermektedir.

2. Metin:
Edebiyat bir formül veya sözcük dizimi değil; kanayan bir vicdanın, varoluş sancısının ve insan kalbinin derinliklerindeki çelişkilerin kâğıda dökülmesidir. Bir algoritma sözcükleri kusursuz bir kafiyeyle yan yana getirebilir ama asla bir evladını yitiren ananın sessiz çığlığını ya da ilk aşkın getirdiği o tatlı ürpertinin yakıcılığını hissedemez. Hissetmediği için de ürettiği her satır, ruhsuz bir plastik çiçek gibi kokudan ve samimiyetten yoksun kalmaya mahkûmdur.',
          'Bu iki metinle ilgili olarak aşağıdakilerden hangisi söylenemez?',
          '{"A":"1. metinde yapay zekânın edebiyattaki üretkenliği teknik ve nesnel bir dille değerlendirilmiştir.","B":"2. metinde edebiyatın asıl cevherinin insani duygular ve yaşanmışlıklar olduğu savunulmuştur.","C":"Her iki metinde de yapay zekânın sanatsal yaratıcılıkta gelecekte insanın yerini alacağı fikri benimsenmiştir.","D":"2. metnin anlatımında benzetme ve öznel yargılardan yararlanılarak düşünce pekiştirilmiştir."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki metin karşılaştırıldığında ortak ve zıt fikirler netleştirilir. 1. metin yapay zekanın teknik başarısını nesnel anlatırken; 2. metin yapay zekanın insan ruhundan yoksun olduğunu (''ruhsuz bir plastik çiçek gibi'') belirterek asla insanın yerini alamayacağını savunmaktadır. Bu nedenle ''her iki metinde insanın yerini alacağı benimsenmiştir'' yargısı söylenemez.',
          '1. metin algoritmaların biçimsel ve teknik yeteneklerini nesnel/analitik bir üslupla anlatmaktadır (A seçeneği doğru). 2. metin ise edebiyatın duygu, vicdan ve insani yaşantı olduğunu vurgulayarak duygusal ve öznel bir tavır takınmış, ''plastik çiçek'' benzetmesi yapmıştır (B ve D seçenekleri doğru). Ancak 2. metin yapay zekanın insan duygusuna asla erişemeyeceğini açıkça söyleyerek insanın yerini alamayacağını belirtmiştir; dolayısıyla her ikisinde de insanın yerini alacağı fikrinin benimsendiği söylenemez. Doğru cevap C seçeneğidir.',
          '{"A":"1. metinde ''milyonlarca metni tarayarak'', ''hece veznine uygun'', ''biçimsel boyut'' gibi teknik ve tarafsız tespitler yer almaktadır.","B":"2. metinde ''kanayan bir vicdan, varoluş sancısı, sessiz çığlık'' gibi insani özler edebiyatın merkezine konmuştur.","D":"2. metinde ''ruhsuz bir plastik çiçek gibi'' ifadesiyle benzetme yapılmış ve kişisel değerlendirmeler sunulmuştur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000006'::uuid,
          6,
          'LGS-TR-T1-04',
          'Rize’nin dağ köylerinde binbir emekle dokunan ''feretiko'' (Rize bezi), lifleri tek tek ayrıştırılan kendir ipliğinin ahşap tezgâhlarda sabırla düğümlenmesiyle hayat bulan geleneksel bir dokuma sanatıdır. Fabrikasyon pamuklu kumaşların aksine feretiko, liflerinin doğal mikrogözenekli yapısı sayesinde nemi hızla emer ve sıcak Karadeniz günlerinde bedeni serin tutan doğal bir klima vazifesi görür. Dokuma ustası Emine Nine, mekik seslerinin odayı doldurduğu loş tezgâh başında şöyle fısıldar: ''Kendir ipliği inatçıdır, ona hükmedemezsin; ancak sevginle terbiye edip sabırla işlersen tenine ipekten bir kalkan olur.'' Yüzyıllardır çeyiz sandıklarının baş tacı olan bu kumaş; doğallığın sentetik tekstil ürünlerine karşı verdiği soylu bir direnişin adıdır.',
          'Bu parçanın anlatımında aşağıdaki düşünceyi geliştirme yollarının hangisinden yararlanılmamıştır?',
          '{"A":"Tanımlama","B":"Karşılaştırma","C":"Tanık gösterme","D":"Sayısal verilerden yararlanma"}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Parçadaki düşünceyi geliştirme yollarını eşleştirin: 1) İlk cümlede feretiko nedir? sorusunun cevabı verilmiştir (''...dokuma sanatıdır'' -> Tanımlama). 2) ''Fabrikasyon pamuklu kumaşların aksine'' denilerek kıyaslama yapılmıştır (Karşılaştırma). 3) Dokuma ustası Emine Nine''nin sözü tırnak içinde aynen aktarılmıştır (Tanık gösterme). Metinde istatistiki bir rakam veya araştırma oranı bulunmadığından sayısal veri kullanılmamıştır.',
          'Metinde:
• ''Feretiko (...) geleneksel bir dokuma sanatıdır'' cümlesiyle ''Feretiko nedir?'' sorusuna yanıt verilmiş, tanımlama yapılmıştır.
• ''Fabrikasyon pamuklu kumaşların aksine...'' ifadesiyle feretiko ile sanayi kumaşları arasında karşılaştırma yapılmıştır.
• Dokuma ustası Emine Nine''nin görüşleri tırnak içerisinde aktarılarak tanık göstermeye başvurulmuştur.
• Ancak metinde istatistiki veya ölçmeye dayalı sayısal verilerden yararlanılmamıştır. Doğru cevap D seçeneğidir.',
          '{"A":"İlk cümlede açıkça feretiko kumaşının ne olduğu tanımlanmıştır.","B":"Geleneksel feretiko ile fabrikasyon kumaşlar mukayese edilerek karşılaştırma yapılmıştır.","C":"Emine Nine''nin doğrudan alıntılanan sözü düşünceyi desteklemek için tanık gösterilmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000007'::uuid,
          7,
          'LGS-TR-T1-05',
          'Klasik biyografi yazarları, ele aldıkları tarihî şahsiyeti kusursuz bir heykel gibi donuklaştırma yanılgısına düşerler. Oysa çağdaş biyografi, bireyin zaaflarını, iç çelişkilerini ve tereddütlerini de gün ışığına çıkararak onu ete kemiğe büründürür. Gerçek bir biyografi, kahramanı göklere çıkaran bir methiye değil; insan ruhunun labirentlerinde fenerle dolaşan titiz bir kazı çalışmasıdır. Ancak bu kazı, bireyin mahremiyetini istismar etme ucuzluğuna sapmadan, nesnel belgelerin rehberliğinde yürütülmelidir.',
          'Bu parçadaki altı çizili ''insan ruhunun labirentlerinde fenerle dolaşan titiz bir kazı çalışması'' sözüyle anlatılmak istenen en kapsamlı yargı aşağıdakilerden hangisidir?',
          '{"A":"Tarihî olayların kronolojik sırasını hiç bozmadan kayıt altına almak","B":"Kişinin karmaşık ve gizli kalmış iç dünyasını bilimsel tarafsızlıkla aydınlatmak","C":"Yalnızca toplumun onayladığı erdemli davranışları öne çıkarmak","D":"Geçmişin karanlıkta kalmış siyasi sırlarını açığa çıkarmak"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: ''Labirent'' karmaşıklığı ve iç içeliği, ''fener'' aydınlatma ve görünür kılmayı, ''kazı çalışması'' ise derinlemesine ve titiz araştırmayı simgeler. Bu metaforları birleştiren seçeneğe odaklanın.',
          'Metinde geçen labirent ruhun derin ve karmaşık yapısını; fenerle dolaşmak aydınlatmayı; kazı çalışması ise bilimsel nesnellikle yapılan titiz incelemeyi temsil eder. Dolayısıyla en kapsamlı yargı B seçeneğidir.',
          '{"A":"Kronolojik sıra sadece biçimsel bir aktarımdır, ruhsal derinlikle ilişkisi kurulmamıştır.","C":"Parça methiyeyi reddetmekte, sadece erdemlerin değil zaafların da yazılmasını savunmaktadır.","D":"Siyasi sırlar metnin bağlamında yer almaz; konu doğrudan şahsın bireysel ve ruhsal portresidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000008'::uuid,
          8,
          'LGS-TR-05',
          'Eleştiri; bir sanat yapıtının estetik değerini, kurmaca dünyasını ve eksiklerini tarafsız bir teraziyle tartma sanatıdır. Geleneksel yaklaşımların aksine çağdaş eleştiri, okura hazır reçeteler sunmaktan ziyade yapıtın derinliklerine kapı aralayan daha kapsayıcı bir kılavuzdur. Edebiyat kuramcısı T. S. Eliot da bu durumu şu sözlerle perçinler: "Gerçek eleştirmenin görevi esere değer biçmek değil, eserin kendi iç ahengini duyurmasına imkân tanımaktır."',
          'Bu parçanın anlatımında düşünceyi geliştirmek için aşağıdaki yolların hangilerine başvurulmuştur?',
          '{"A":"Tanımlama – Karşılaştırma – Tanık gösterme","B":"Örneklendirme – Benzetme – Karşılaştırma","C":"Tanımlama – Benzetme – Sayısal verilerden yararlanma","D":"Tanık gösterme – Sayısal verilerden yararlanma – Örneklendirme"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Metindeki düşünceyi geliştirme yollarını adım adım tespit edin: 1) İlk cümledeki "Eleştiri nedir?" sorusunun cevabı (Tanımlama), 2) "-den ziyade, aksine, daha" ifadeleriyle kurulan kıyaslama (Karşılaştırma), 3) T. S. Eliot ve tırnak içindeki alıntısı (Tanık gösterme).',
          'Metnin ilk cümlesinde eleştirinin ne olduğu açıklanarak tanımlama yapılmıştır ("tartma sanatıdır"). İkinci cümlede geleneksel eleştiri ile çağdaş eleştiri "aksine, -den ziyade, daha" sözcükleriyle karşılaştırılmıştır. Son cümlede ise edebiyat kuramcısı T. S. Eliot''ın adı verilerek onun sözü tırnak içinde aynen aktarılmış ve tanık gösterilmiştir. Dolayısıyla metinde tanımlama, karşılaştırma ve tanık gösterme yollarına başvurulmuştur. Doğru cevap A seçeneğidir.',
          '{"B":"Metinde örneklendirme ve benzetme unsurları bulunmamaktadır; yalnızca karşılaştırma mevcuttur.","C":"Tanımlama yapılmış olsa da metinde benzetme ve sayısal verilerden yararlanma yollarına yer verilmemiştir.","D":"Tanık gösterme bulunmakla birlikte sayısal veri ve örneklendirme metinde yer almamaktadır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000009'::uuid,
          9,
          'LGS-TR-06',
          '1. Metin:
Biyomimikri, doğanın milyonlarca yıllık evrimsel tecrübesini insan teknolojisine uyarlama sanatıdır. Örneğin yalıçapkını kuşunun suya dalarken ses çıkarmayan ve su direncini en aza indiren gaga yapısı, Japon mühendisler tarafından saatte 300 kilometre hızla giden hızlı trenlerin burun tasarımına ilham vermiştir. Doğanın sunduğu kusursuz çözümler, mühendislik problemlerine çevre dostu ve yenilikçi yanıtlar getirmektedir.

2. Metin:
Köpek balıklarının derisini kaplayan mikroskobik girintilerin sürtünmeyi azaltarak bakterilerin yüzeye tutunmasını zorlaştırdığı keşfedilmiştir. Bilim insanları bu dokuyu modelleyerek hastane yüzeylerinde ve tıbbi cihaz kaplamalarında bakteri tutmayan özel malzemeler geliştirmiştir. Böylece sağlık alanında kimyasal dezenfektan ihtiyacı azalmış, doğadaki bir canlıdan ilham alan sürdürülebilir bir hijyen modeli ortaya çıkmıştır.',
          'Numaralanmış bu iki metnin ortak yönü aşağıdakilerden hangisidir?',
          '{"A":"Ulaşım ve sağlık sektöründeki yeniliklerin getirdiği ekonomik tasarrufu sayısal verilerle kanıtlamaları","B":"Doğadaki canlıların biyolojik özelliklerinin teknolojik ve bilimsel gelişmelere esin kaynağı olduğunu vurgulamaları","C":"İnsan eliyle geliştirilen modern teknolojilerin doğal çevre üzerindeki yıkıcı etkilerini eleştirmeleri","D":"Biyolojik çeşitliliğin korunması amacıyla yürütülen uluslararası mühendislik projelerini tanıtmaları"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki farklı metin karşılaştırılırken her metnin ana fikri tek bir cümleye indirgenir: 1. Metin (Kuş gagası -> Hızlı tren tasarımı), 2. Metin (Köpek balığı derisi -> Bakteri tutmayan hastane kaplaması). Her ikisinin kesişim kümesi doğanın teknolojiye esin kaynağı olmasıdır.',
          '1. metinde yalıçapkını kuşunun gagasının hızlı trenlerin aerodinamik tasarımına ilham vermesi, 2. metinde ise köpek balığı derisi yapısının hastanelerdeki antibakteriyel kaplamalara model olması anlatılmaktadır. Her iki metinde de doğadaki canlıların biyolojik/anatomik yapılarının teknolojiye ve bilime esin kaynağı olduğu (biyomimikri) vurgulanmaktadır. Doğru cevap B seçeneğidir.',
          '{"A":"Ulaşım 1. metinde, sağlık ise 2. metinde geçmektedir; ayrıca metinlerde sayısal verilerle ekonomik tasarruf kanıtlama ortak özellik değildir.","C":"Metinlerde çevre tahribatı eleştirilmemekte; tam aksine doğadan ilham alan yapıcı ve çevre dostu teknolojiler övülmektedir.","D":"Uluslararası biyoçeşitlilik koruma projelerinden bahsedilmemekte, canlıların özelliklerinin taklit edilmesi anlatılmaktadır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000010'::uuid,
          10,
          'LGS-TR-T2-01',
          'Bir teknoloji fuarında A, B, C, D ve E okullarının robotik kulüpleri; pazartesi, salı, çarşamba, perşembe ve cuma günleri birer sunum yapacaktır. Her gün yalnızca bir okul sunum yapacaktır.

Sunum sıralamasıyla ilgili bilinenler şunlardır:
• A okulu, C okulundan hemen önceki gün sunum yapmıştır.
• B okulu, sunumunu E okulundan sonraki bir günde gerçekleştirmiştir.
• Perşembe günü sunum yapan okul D okuludur.
• Cuma günü sunum yapan okul C okulu değildir.',
          'Bu bilgilere göre cuma günü sunum yapan okul aşağıdakilerden hangisidir?',
          '{"A":"A okulu","B":"B okulu","C":"C okulu","D":"E okulu"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Günleri Pazartesi, Salı, Çarşamba, Perşembe, Cuma olarak dizin. Perşembe = D sabittir. A ve C peş peşe (AC bloğu) gelmelidir. D Perşembe olduğu için AC bloğu ya (Pzt-Salı) ya da (Salı-Çrş) olabilir. Her iki durumda da geriye kalan günleri ve ''E''nin B''den önce olduğu'' şartını inceleyin. Her iki olasılıkta da Cuma gününe B okulunun kaldığını göreceksiniz.',
          'Adım adım çözüm tablosu:
Günler: Pazartesi (1), Salı (2), Çarşamba (3), Perşembe (4), Cuma (5).
1. Kesin bilgi: 4. gün (Perşembe) = D okuludur.
2. ''A okulu C''den hemen önceki gündür'' kuralına göre A ve C ardışık iki gün olmalıdır (AC bloğu). D 4. günde olduğuna göre AC bloğu yalnızca iki yere yerleşebilir:
   - 1. İhtimal: AC = Pazartesi (A) ve Salı (C).
     Geriye kalan günler: Çarşamba ve Cuma. Kalan okullar: E ve B.
     Kural: B okulu E''den sonraki bir gündür. Dolayısıyla Çarşamba = E, Cuma = B olur.
   - 2. İhtimal: AC = Salı (A) ve Çarşamba (C).
     Geriye kalan günler: Pazartesi ve Cuma. Kalan okullar: E ve B.
     Kural: B okulu E''den sonraki bir gündür. Dolayısıyla Pazartesi = E, Cuma = B olur.
   (Not: C okulu cuma günü değildir kuralı da her iki durumda sağlanmaktadır.)
Her iki ihtimalde de Cuma günü sunum yapan okul kesinlikle B okuludur. Doğru cevap B seçeneğidir.',
          '{"A":"A okulu C''den hemen önce olacağı için cuma günü yer alamaz; cuma sunum yapsaydı C okulunun cumartesi olması gerekirdi.","C":"Verilen kurallarda ''Cuma günü sunum yapan okul C okulu değildir'' ifadesi açıkça belirtilmiştir.","D":"E okulu B''den önce sunum yapmak zorunda olduğundan ve sunum yapacak başka gün kalmadığından haftanın son günü olan cumaya kalamaz."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000011'::uuid,
          11,
          'LGS-TR-T2-02',
          'Aşağıdaki tabloda, bir ülkenin 2021, 2022 ve 2023 yıllarındaki temiz enerji üretim kaynaklarının toplam elektrik üretimi içerisindeki payları (%) ve yıllık toplam elektrik üretim miktarları (milyar kilovatsaat - kWh) verilmiştir:

| Yıl | Toplam Üretim (Milyar kWh) | Hidroelektrik Payı (%) | Rüzgâr Payı (%) | Güneş Payı (%) | Biyokütle Payı (%) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2021** | 300 | %20 | %10 | %5 | %2 |
| **2022** | 320 | %18 | %11 | %7 | %2 |
| **2023** | 350 | %16 | %12 | %10 | %2 |

(Not: Tabloda verilen yüzdeler o yılın toplam üretimi üzerinden hesaplanmaktadır.)',
          'Bu tablodaki verilerden hareketle aşağıdaki yargılardan hangisine kesinlikle ulaşılamaz?',
          '{"A":"2021''den 2023''e güneş enerjisinin hem toplam üretimdeki yüzdelik payı hem de üretilen elektrik miktarı artmıştır.","B":"Biyokütle enerjisinin yüzdelik payı değişmemesine rağmen 2023 yılında üretilen biyokütle elektrik miktarı 2021 yılından fazladır.","C":"Hidroelektrik santrallerinde 2023 yılında üretilen elektrik miktarı, 2021 yılındaki üretim miktarından daha azdır.","D":"Rüzgâr enerjisinden 2022 yılında elde edilen elektrik miktarı, aynı yıl güneş enerjisinden elde edilen miktarın 2 katından fazladır."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Tablo sorularında ''yüzde payı'' ile ''gerçek üretim miktarı'' ayrımına dikkat edilmelidir.
Üretim Miktarı = Toplam Üretim x Yüzde.
2022 yılında:
Toplam: 320 milyar kWh.
Rüzgâr: %11 -> 320 x 0,11 = 35,2 milyar kWh.
Güneş: %7 -> 320 x 0,07 = 22,4 milyar kWh.
Güneşin 2 katı: 2 x 22,4 = 44,8 milyar kWh''dir. 35,2 milyar kWh, 44,8''den azdır (yani 2 katından fazla değildir, 2 katından azdır!).',
          'Seçenekleri verilerle tek tek hesaplayalım:
• A seçeneği: Güneş payı %5''ten %10''a çıkmıştır. Miktar: 2021''de 300 x %5 = 15 milyar kWh; 2023''te 350 x %10 = 35 milyar kWh. Hem oran hem miktar artmıştır (Ulaşılır).
• B seçeneği: Biyokütle oranı hep %2''dir. 2021''de 300 x %2 = 6 milyar kWh iken 2023''te 350 x %2 = 7 milyar kWh''dir. Miktar artmıştır (Ulaşılır).
• C seçeneği: Hidroelektrik miktarı 2021''de 300 x %20 = 60 milyar kWh iken; 2023''te 350 x %16 = 56 milyar kWh''dir. 56 < 60 olduğu için miktar azalmıştır (Ulaşılır).
• D seçeneği: 2022''de Rüzgâr payı %11 (320 x 0,11 = 35,2 milyar kWh), Güneş payı %7''dir (320 x 0,07 = 22,4 milyar kWh). Güneş enerjisinin 2 katı 44,8 milyar kWh yapar. Rüzgâr üretimi (35,2), güneşin 2 katından (44,8) fazla değil, tam tersine daha azdır. Bu bilgi kesinlikle yanlıştır. Doğru cevap D seçeneğidir.',
          '{"A":"Hesaplandığında güneş enerjisinin hem payının (%5 -> %10) hem de net üretiminin (15 -> 35 milyar kWh) düzenli arttığı görülmektedir.","B":"Toplam üretim 300''den 350''ye çıktığı için sabit kalan %2''lik pay miktar bazında 6''dan 7 milyar kWh''ye yükselmiştir.","C":"Hidroelektrik üretimi 2021''de 60 milyar kWh iken 2023''te 56 milyar kWh''ye gerilemiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000012'::uuid,
          12,
          'LGS-TR-T2-03',
          'Akıllı bir serada ortam koşullarını denetlemek için sıcaklık, toprak nemi ve karbondioksit (CO2) sensörleri kullanılmaktadır. Sistem her ölçümde 3 karakterden oluşan bir ''Durum Kodu'' üretmekte ve bu koda göre havalandırma, sulama ve ısıtma ünitelerine otomatik komut göndermektedir.

Kodlama Kuralları:
1. Karakter (Sıcaklık):
   - 15°C''nin altı: D (Düşük)
   - 15°C - 25°C arası: N (Normal)
   - 25°C''nin üstü: Y (Yüksek)

2. Karakter (Toprak Nemi):
   - %40''ın altı: K (Kuru)
   - %40 - %70 arası: M (Mutedil/İdeal)
   - %70''in üstü: I (Islak)

3. Karakter (CO2 Seviyesi):
   - 800 ppm altı: 1 (Yetersiz)
   - 800 - 1200 ppm arası: 2 (Dengeli)
   - 1200 ppm üstü: 3 (Zengin)

Sistem Yönergesi:
• Eğer Durum Kodu ''Y-K-...'' ile başlıyorsa (sıcaklık yüksek, toprak kuru) ''Acil Yağmurlama ve Gölgeleme'' devreye girer.
• Eğer Durum Kodu ''...-I-1'' ile bitiyorsa (toprak ıslak, CO2 yetersiz) ''Tahliye Fanı ve Karbon Takviyesi'' devreye girer.
• Eğer Durum Kodu ''N-M-2'' ise ''Dengeli Koruma Modu'' uygulanır.',
          'Sera içi ölçümünde sıcaklığın 28°C, toprak neminin %35 ve CO2 seviyesinin 950 ppm olduğu tespit edildiğine göre sistemin üreteceği Durum Kodu ve uygulayacağı işlem aşağıdakilerin hangisinde doğru verilmiştir?',
          '{"A":"Durum Kodu: Y-K-2 | Uygulanacak İşlem: Acil Yağmurlama ve Gölgeleme","B":"Durum Kodu: Y-M-2 | Uygulanacak İşlem: Dengeli Koruma Modu","C":"Durum Kodu: N-K-1 | Uygulanacak İşlem: Tahliye Fanı ve Karbon Takviyesi","D":"Durum Kodu: Y-K-3 | Uygulanacak İşlem: Acil Yağmurlama ve Gölgeleme"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Basamakları tek tek ölçüm değerleriyle eşleştirin:
1. Sıcaklık 28°C (>25°C) -> Y
2. Nem %35 (<%40) -> K
3. CO2 950 ppm (800-1200 arası) -> 2
Durum Kodu: Y-K-2 olur. ''Y-K-...'' ile başladığı için sistem yönergesine göre ''Acil Yağmurlama ve Gölgeleme'' işlemi uygulanır.',
          'Ölçüm değerlerini kurallara göre kodlayalım:
• Sıcaklık: 28°C, 25°C''nin üstünde olduğundan 1. karakter ''Y'' olur.
• Toprak Nemi: %35, %40''ın altında (kuru) olduğundan 2. karakter ''K'' olur.
• CO2 Seviyesi: 950 ppm, 800-1200 ppm aralığında (dengeli) olduğundan 3. karakter ''2'' olur.
Böylece oluşan Durum Kodu ''Y-K-2''dir.
Sistem yönergesinde ''Eğer Durum Kodu Y-K-... ile başlıyorsa Acil Yağmurlama ve Gölgeleme devreye girer'' şartı yer almaktadır. Oluşan Y-K-2 kodu bu şarta uyduğu için ''Acil Yağmurlama ve Gölgeleme'' devreye girecektir. Doğru cevap A seçeneğidir.',
          '{"B":"Toprak nemi %35 iken ''Mutedil'' (M) kodu seçilmiştir; bu hatalıdır.","C":"Sıcaklık 28°C iken ''Normal'' (N) kabul edilmiş ve CO2 yanlış değerlendirilmiştir.","D":"950 ppm seviyesi 1200''ün altında olmasına rağmen ''3'' (zengin) kodu verilmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000013'::uuid,
          13,
          'LGS-TR-T2-04',
          'MÖ 3. yüzyılda İskenderiye Kütüphanesi’nin yöneticisi olan Eratosthenes, modern uyduların ve lazerli ölçüm cihazlarının olmadığı bir çağda Dünya''nın çevresini inanılmaz bir hassasiyetle hesaplamayı başarmıştır. Yaz gündönümünde Syene (Asvan) kentinde öğle vakti güneş ışınlarının derin bir su kuyusunun dibine dik açıyla ulaştığını ve gölge oluşturmadığını öğrenen bilgin; aynı gün ve saatte İskenderiye''de diktiği bir çubuğun yaklaşık 7,2 derecelik bir gölge açısı oluşturduğunu tespit etmiştir. İki şehir arasındaki mesafeyi kervanların yürüyüş süresinden hesaplayan bilgin, çemberin 360 derecelik geometri kuralını bu farka oranlayarak gezegenimizin çevresini yaklaşık 40.000 kilometre olarak bulmuştur. Bu bilimsel zafer göstermektedir ki ----.',
          'Bu parçanın sonuna düşüncenin akışına ve metnin iletisine göre aşağıdakilerden hangisi getirilmelidir?',
          '{"A":"çağları aşan büyük keşifler, gelişmiş laboratuvarlardan ziyade keskin bir gözlem gücü ve doğru işletilen bir akıl yürütmeyle gerçekleştirilir","B":"antik çağda yaşamış filozofların kuramsal iddiaları, günümüz pozitif bilimlerinin gelişmesini büyük ölçüde geciktirmiştir","C":"coğrafi sınırların belirlenmesinde matematiksel hesaplamalar yerine her zaman tarihsel belgeler esas alınmalıdır","D":"doğa olaylarının gizemini çözebilmek için öncelikle teknolojik aletlerin mükemmel seviyeye ulaşması gerekir"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Paragraf tamamlama sorularında boşluktan önceki sebep-sonuç ilişkisine bakılır. Metin, hiçbir teknolojik aygıt olmadan sadece bir kuyu, bir çubuk, gölge açısı ve geometri bilgisiyle Dünya''nın çevresinin hesaplandığını anlatmaktadır. Dolayısıyla ''Bu bilimsel zafer göstermektedir ki...'' ifadesinden sonra teknolojinin yokluğuna rağmen gözlem ve akıl yürütmeyle devasa keşiflerin yapılabileceğini belirten bir yargı gelmelidir.',
          'Metnin ana teması; Eratosthenes''in hiçbir modern aygıt ve uydu teknolojisi bulunmaksızın, sadece basit bir çubuğun gölgesini gözlemleyerek ve geometri prensiplerini kullanarak Dünya''nın çevresini neredeyse sıfır hatayla hesaplamasıdır. Bu tarihsel olay, bilimin en büyük gücünün teknolojik cihazların lüksünde değil, insanın gözlem yeteneği, merakı ve doğru mantıksal kurgusunda yattığını kanıtlamaktadır. A seçeneğindeki ifade bu ana fikri mükemmel bir şekilde tamamlamaktadır. Doğru cevap A seçeneğidir.',
          '{"B":"Metinde antik çağ filozoflarının bilimi geciktirdiği yönünde hiçbir olumsuz yargı bulunmamaktadır; aksine antik bir başarı övülmektedir.","C":"Parçada coğrafi sınırların belirlenmesi değil, Dünya''nın çevresinin hesaplanması söz konusudur.","D":"Bu ifade metnin ana fikriyle taban tabana zıttır; çünkü Eratosthenes teknolojik aletler olmaksızın bu keşfi yapmıştır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000014'::uuid,
          14,
          'LGS-TR-T2-05',
          'Ege kıyılarında zeytin hasadı kasım ayında başlar. Sabahın erken saatlerinde köylüler yaygılarını ağaçların altına serer, uzun sırıklarla dalları usulca sarsarlar. Yere düşen taneler tek tek toplanarak delikli kasalara doldurulur. Akşamüzeri traktör römorklarına yüklenen zeytinler, soğuk sıkım fabrikalarına ulaştırılır ve aynı gece işlenir.',
          'Bu parçanın anlatımında ağır basan anlatım biçimi aşağıdakilerden hangisidir?',
          '{"A":"Öyküleme","B":"Tartışma","C":"Betimleme","D":"Açıklama"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Metindeki eylemlerin zamana bağlı akışına (hasat başlar -> yaygılar serilir -> sırıkla sarsılır -> toplanır -> fabrikaya ulaştırılır) dikkat ediniz.',
          'Metinde olaylar kronolojik bir zaman dizisi içinde hareket bildiren fiillerle aktarılmıştır. Zaman ve eylem zinciri öyküleyici anlatımın temel niteliğidir.',
          '{"B":"Yazar karşıt bir fikri çürütmeye çalışmamakta, tarafsız bir süreci aktarmaktadır.","C":"Fiziksel özelliklerin durağan resmi çizilmemiştir; olaylar hareket halindedir.","D":"Bilgi verme amacı arka plandadır; asıl ağırlık sürecin hikâye edilmesindedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000015'::uuid,
          15,
          'LGS-TR-07',
          '(I) Ebru sanatı, kitreyle yoğunlaştırılmış suyun yüzeyine toprak boyaların serpilmesi ve bu desenlerin kâğıda aktarılmasıyla icra edilen kadim bir süsleme sanatıdır. (II) Geleneksel kültürümüzde sabrın ve renklerin ahenginin bir sembolü kabul edilen bu sanat, yüzyıllar boyunca yazma eserlerin cilt kapaklarında ve hat levhalarında kendine yer bulmuştur. (III) Usta-çırak ilişkisiyle nesilden nesle aktarılan ebru, icracısına yalnızca fırça tutmayı değil, suyun akışına ve renklerin iradesine teslim olmayı da öğretmiştir. (IV) Son yıllarda çağdaş tasarımcılar, geleneksel ebrunun estetik çizgilerini grafik tasarım, tekstil ve mimari gibi modern alanlara taşımaktadır. (V) Dijital ortama aktarılan ebru motifleri; seramik panolarda, çağdaş mobilyalarda ve moda koleksiyonlarında özgün desenler olarak yeniden can bulmaktadır. (VI) Böylelikle bu köklü miras, yalnızca tarihî eserlerin sayfalarında kalmayıp gündelik hayatın estetik nesnelerine dönüşerek geleceğe uzanmaktadır.',
          'Bu parçadaki cümleler arasındaki anlam ilişkisi dikkate alınıp metin iki paragrafa ayrılmak istense ikinci paragraf numaralanmış cümlelerin hangisiyle başlar?',
          '{"A":"II","B":"III","C":"IV","D":"V"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Paragraf bölme sorularında yazarın konunun hangi alt boyutuna geçtiğini tespit edin. I, II ve III. cümleler geleneksel ebrunun geçmişteki icrasını ve felsefesini anlatırken IV. cümleden itibaren "Son yıllarda çağdaş tasarımcılar..." denilerek günümüz modern alanlarındaki uygulamalarına geçilmiştir.',
          'I, II ve III. cümlelerde ebru sanatının tanımı, tarihî icrası, usta-çırak geleneği ve felsefi arka planı ele alınmaktadır. IV. cümleden itibaren ise konunun yönü değişmiş ve ebrunun modern tasarım, tekstil ve mimari gibi güncel kullanım alanları incelenmeye başlanmıştır. Dolayısıyla ikinci paragraf IV. cümle ile başlamalıdır. Doğru cevap C seçeneğidir.',
          '{"A":"II. cümle I. cümlenin doğrudan devamıdır; geleneksel ebrunun kültürümüzdeki anlamını ve kullanım yerlerini sürdürür.","B":"III. cümle geleneksel icra sürecindeki usta-çırak ilişkisini ve manevi disiplini detaylandırarak ilk konuyu tamamlar.","D":"V. cümle IV. cümlede başlayan modern alanlara uyarlama konusunun bir devamı ve örneğidir; yeni bir paragraf başlangıcı olamaz."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000016'::uuid,
          16,
          'LGS-TR-08',
          'Bir bilişim kulübünde 4 harfli sözcükleri şifrelemek amacıyla aşağıdaki 4x4''lük harf tablosu ve kurallar kullanılmaktadır:

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| A | K | A | L | E |
| B | M | İ | R | T |
| C | O | U | S | Y |
| D | V | Z | N | P |

Şifreleme Kuralları:
1. Temel Kod: Her harfin temel kodu, bulunduğu satır harfi ile sütun numarasının yan yana yazılmasıyla elde edilir. (Örneğin B satırı ve 3. sütundaki "R" harfinin temel kodu B3''tür.)
2. 1. Harf: Temel kodu doğrudan yazılır.
3. 2. Harf: Temel kodundaki harf ve rakam yer değiştirilerek yazılır. (Örneğin temel kodu "A2" ise şifreye "2A" olarak geçer.)
4. 3. Harf: Temel kodu doğrudan yazılır.
5. 4. Harf: Tabloda bulunduğu satırın bir sağındaki sütunda yer alan harfin temel kodu yazılır; harf 4. sütundaysa o satırın 1. sütunundaki harfin temel koduna dönülür. (Örneğin B satırı 4. sütundaki "T" harfi yerine aynı satırın 1. sütunundaki harfin temel kodu olan "B1" yazılır.)',
          'Bu tablo ve şifreleme kurallarına göre ''KART'' sözcüğünün doğru şifresi aşağıdakilerden hangisidir?',
          '{"A":"A1 - A2 - B3 - B4","B":"1A - 2A - 3B - 4B","C":"A1 - 2A - B3 - B4","D":"A1 - 2A - B3 - B1"}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Şifreleme sorularında her harfi sırasıyla kural tablosuna göre adım adım işleyin: 1. Harf K -> A1 (değişmez). 2. Harf A -> Temel kodu A2, kurala göre ters çevir -> 2A. 3. Harf R -> B3 (değişmez). 4. Harf T -> Temel kodu B4, 4. sütunda olduğu için satırın başına (1. sütuna) döner -> B1.',
          'KART sözcüğünün harflerini kural basamaklarına göre çözümleyelim:
• 1. harf ''K'': A satırı 1. sütundadır -> Temel kod A1, kural gereği aynen yazılır: A1
• 2. harf ''A'': A satırı 2. sütundadır -> Temel kod A2, harf ve rakam yer değiştirir: 2A
• 3. harf ''R'': B satırı 3. sütundadır -> Temel kod B3, kural gereği aynen yazılır: B3
• 4. harf ''T'': B satırı 4. sütundadır -> 4. sütun kuralı gereği aynı satırın 1. sütunundaki harfin temel kodu alınır: B1
O hâlde şifre "A1 - 2A - B3 - B1" olur. Doğru cevap D seçeneğidir.',
          '{"A":"Hiçbir kural dönüşümünü uygulamayıp yalnızca temel kodları yazan dikkatsiz öğrencinin düşeceği yanılgıdır.","B":"2. harfteki yer değiştirme kuralını tüm harflere uygulayan öğrencinin seçeneğidir.","C":"2. harf kuralını uygulayıp 4. harfin bir sağdaki sütuna kayma kuralını unutan öğrencinin güçlü çeldiricisidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000017'::uuid,
          17,
          'LGS-TR-T3-03',
          'Yapay zekâ ve algoritma çağında en büyük yanılgı, bilgiyi depolamanın bilgili olmakla eşdeğer sanılmasıdır. Bugün cep telefonumuzdaki bir arama motoru, dünyanın tüm ansiklopedilerinden daha fazla veriyi saliseler içinde önümüze serebilmektedir. Ancak bilgiyi kritik süzgecinden geçirmeyen, onu ahlaki bir erdemle ve insanlığın faydasıyla buluşturamayan zihinler; okyanus ortasında tatlı su arayan çaresiz kazazedelere benzer.',
          'Bu parçadan çıkarılabilecek en kapsamlı sonuç aşağıdakilerden hangisidir?',
          '{"A":"Teknolojik gelişmeler dijital bağımlılığı ve tembelliği körüklemektedir.","B":"Önemli olan ham veriye ulaşmak değil, bilgiyi eleştirel akıl ve erdemle işlemektir.","C":"Arama motorlarının sunduğu bilgiler güvenilirlikten yoksundur.","D":"Yapay zekâ algoritmaları insan hafızasını tamamen işlevsiz kılmıştır."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Parçanın son cümlesindeki benzetmeyi ve ''kritik süzgeci'', ''ahlaki erdem'' anahtar sözcüklerini analiz edin.',
          'Metin bilginin çokluğuna veya hızına değil, onun eleştirel süzgeçten geçirilip erdemle birleştirilmesine vurgu yapmaktadır. Bu nedenle doğru cevap B''dir.',
          '{"A":"Parçada genel bir dijital bağımlılık uyarısı yapılmamakta, bilgi işleme kapasitesi eleştirilmektedir.","C":"Arama motorlarının güvenilirliği değil, kullanıcının bilgiyi işleme yetisi sorgulanmaktadır.","D":"İnsan hafızasının yok olduğu şeklinde abartılı bir yargıya ulaşılamaz."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000018'::uuid,
          18,
          'LGS-TR-T3-04',
          'Bir okul münazara kulübünde Ahmet, Burak, Ceren ve Derya adlı dört öğrenci pazartesi, salı, çarşamba ve perşembe günleri birer konuşma yapacaktır. Konuşma sırasıyla ilgili kurallar şunlardır:
- Ahmet, Ceren''den hemen önceki gün konuşmuştur.
- Burak ilk gün konuşmamıştır.
- Derya perşembe günü konuşacaktır.',
          'Bu kurallara göre salı günü konuşan öğrenci kesinlikle kimdir?',
          '{"A":"Ahmet","B":"Burak","C":"Ceren","D":"Derya"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Günleri (Pzt, Sal, Çar, Per) listeleyin. Perşembe = Derya. Ahmet ve Ceren peş peşe olmalıdır (Pzt-Sal veya Sal-Çar). Burak ilk gün olamaz kuralını uygulayın.',
          'Günler: Pzt, Sal, Çar, Per. Derya Perşembe''dir. Geriye Pzt, Sal, Çar kalır. Ahmet Ceren''den hemen önce olduğuna göre ikili blok (Ahmet, Ceren) şeklindedir. Burak ilk gün olamayacağına göre Burak Çarşamba olmak zorundadır. O halde Ahmet Pazartesi, Ceren Salı günü konuşur.',
          '{"A":"Ahmet Pazartesi günü konuşur; Salı günü konuşamaz çünkü o zaman Burak Pazartesi''ye kalır ve kural ihlal edilir.","B":"Burak Çarşamba günü konuşmaktadır.","D":"Derya zaten öncülde açıkça belirtildiği üzere Perşembe konuşur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000019'::uuid,
          19,
          'LGS-TR-T3-05',
          'Rüzgâr, ıssız vadide asırlık çınar ağacının dallarına usulca fısıldıyor; yorgun yapraklar toprağa kavuşmanın sevinciyle dans ediyordu.',
          'Bu cümlede kullanılan söz sanatı aşağıdakilerden hangisidir?',
          '{"A":"Tezat (Karşıtlık)","B":"Teşhis (Kişileştirme)","C":"Mübalağa (Abartma)","D":"Tecahüliarif (Bilmezden Gelme)"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İnsana ait özelliklerin (fısıldamak, sevinçle dans etmek) insan dışı varlıklara (rüzgâr, yaprak) aktarılıp aktarılmadığını kontrol edin.',
          'Rüzgârın fısıldaması ve yaprakların sevinçle dans etmesi, insani duygu ve davranışların doğaya aktarılmasıdır; bu sanat teşhis (kişileştirme) sanatıdır.',
          '{"A":"Zıt kavramlar bir arada kullanılmamıştır.","C":"Bir durum akıl sınırlarını zorlayacak derecede büyütülmemiştir.","D":"Bilinen bir gerçeğin bilmezden gelinmesi söz konusu değildir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000020'::uuid,
          20,
          'LGS-TR-T3-06',
          'Bir ildeki 4 farklı ilçenin (K, L, M, N) 2024 yılı geri dönüştürülen atık miktarları şöyledir:
- K ilçesi: 120 ton plastik, 80 ton kâğıt
- L ilçesi: 90 ton plastik, 140 ton kâğıt
- M ilçesi: 150 ton plastik, 60 ton kâğıt
- N ilçesi: 110 ton plastik, 110 ton kâğıt',
          'Bu veriler doğrultusunda geri dönüşüm miktarları hesaplandığında toplam geri dönüşümü en fazla olan ilçe hangisidir?',
          '{"A":"K ilçesi","B":"L ilçesi","C":"M ilçesi","D":"N ilçesi"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Her ilçe için plastik ve kâğıt miktarlarını toplayarak toplam dönüşüm değerini hesaplayınız.',
          'K = 120 + 80 = 200 ton; L = 90 + 140 = 230 ton; M = 150 + 60 = 210 ton; N = 110 + 110 = 220 ton. En yüksek toplam 230 ton ile L ilçesine aittir.',
          '{"A":"K ilçesi toplam 200 ton ile en düşük seviyededir.","C":"M ilçesi plastikte birinci olsa da toplamda 210 ton kalmaktadır.","D":"N ilçesi dengeli 220 ton toplamaktadır ancak 230 ton olan L''nin gerisindedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000021'::uuid,
          21,
          'LGS-TR-T3-07',
          'Sanat eserinde biçim ile öz arasındaki münasebet, nehir yatağı ile suyun akışı gibidir. Yatak olmadan su dağılıp bataklığa döner; su olmadan da kurumuş yatak bir taştan ibarettir. Modern şiirimizin kimi temsilcileri salt sözcük cambazlığına sığınarak nehri susuz bırakmış, kimileri ise coşkun bir lirizm uğruna nehir yatağını yıkıp sele kurban etmiştir.',
          'Bu parçadaki düşünce ilişkisi ve sanat kurgusu değerlendirildiğinde eleştirmenin en çok karşı çıktığı şair tutumu aşağıdakilerden hangisidir?',
          '{"A":"Derin felsefi düşünceleri güçlü ve sağlam bir dize mimarisiyle yoğuran şairi","B":"Sadece söyleyiş kusursuzluğuna odaklanıp şiirin anlam boyutunu boşlayan şairi","C":"Geleneksel vezin ve kafiye disiplinini çağdaş temalarla harmanlayan şairi","D":"Duygu yoğunluğunu dilin kurallarına ve estetik sınırlarına riayet ederek işleyen şairi"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Eleştirmenin ''nehri susuz bırakmak'' sözüyle biçime tapıp özü ihmal edenleri eleştirdiğini saptayın. Onaylanmayacak tutum doğrudan bu eksendedir.',
          'Parçada eleştirmen biçim (nehir yatağı) ve öz (su) dengesini şart koşar. ''Salt sözcük cambazlığına sığınarak nehri susuz bırakanlar'' eleştirildiği için B seçeneğindeki yaklaşımı kesinlikle onaylamaz.',
          '{"A":"Düşünce ile sağlam mimariyi birleştiren tutum yazarın ideal gördüğü dengedir.","C":"Geleneksel disiplinle çağdaş temayı buluşturmak biçim-öz dengesine uygundur.","D":"Duyguyu estetik sınırlara uyarak aktarmak yazarın savunduğu harmoniye uygundur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000022'::uuid,
          22,
          'LGS-TR-T4-01',
          'Güneşin batışını izleyen yolcular, akşam serinliğinde dinlenmek için gölgelik bir ağacın altına oturdular.',
          'Bu cümledeki altı çizili ''izleyen'' sözcüğünün fiilimsi türü aşağıdakilerden hangisidir?',
          '{"A":"İsim-fiil","B":"Sıfat-fiil","C":"Zarf-fiil","D":"Çekimli fiil"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: ''-en / -an'' ekini alan sözcüğün ''yolcular'' ismini niteleyip nitelemediğini kontrol ediniz.',
          '''İzleyen yolcular'' tamlamasında ''-en'' eki sıfat-fiil ekidir ve ismi niteleyen bir sıfat tamlaması kurmuştur.',
          '{"A":"İsim-fiil ekleri ''-ma, -ış, -mak'' kalıplarıdır.","C":"Zarf-fiil eylemin durumunu veya zamanını bildirir (-ken, -alı, -ince vb.).","D":"Sözcük kip ve kişi eki almadığı için çekimli fiil değildir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000023'::uuid,
          23,
          'LGS-TR-T4-02',
          'Kütüphanedeki eski el yazması eserler, uzman restoratörler tarafından özenle temizlendi.',
          'Dilbilgisi kurallarına göre bu cümlenin özne görevindeki temel ögesi aşağıdakilerden hangisidir?',
          '{"A":"Kütüphanedeki eski el yazması eserler","B":"Uzman restoratörler","C":"Eski el yazmaları","D":"Özenle"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Yükleme (temizlendi) ''Temizlenen ne / kim?'' sorusunu yöneltiniz. Sıfat tamlamasının bölünemeyeceğine dikkat ediniz.',
          'Temizlenen ne? Sorusunun cevabı sıfat tamlaması olan ''Kütüphanedeki eski el yazması eserler'' öbeğidir; sözde öznedir.',
          '{"B":"''Uzman restoratörler tarafından'' örtülü özne/zarf tümlecidir, doğrudan gramatikal özne değildir.","C":"Tamlamanın başındaki ''Kütüphanedeki'' sıfatı dışarıda bırakılamaz.","D":"''Özenle'' sözcüğü eylemin yapılış biçimini belirten zarf tümlecidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000024'::uuid,
          24,
          'LGS-TR-T4-03',
          'Fiil cümlelerinde vurgu yüklemden hemen önceki ögededir. ''Deniz, dün akşam yarışma sonuçlarını arkadaşlarına heyecanla anlattı.''',
          'Bu cümlenin kuralına göre vurgulanan ögesi aşağıdakilerden hangisidir?',
          '{"A":"Özne","B":"Nesne","C":"Zarf Tümleci","D":"Yer Tamlayıcısı"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Yüklem ''anlattı'' fiilidir. Yüklemin hemen solundaki ''heyecanla'' sözcüğünün öge türünü bulunuz.',
          'Yüklemden önceki sözcük ''heyecanla''dır. Eyleme ''Nasıl anlattı?'' diye sorulduğunda ''heyecanla'' cevabı alınır; bu zarf tümlecidir.',
          '{"A":"''Deniz'' cümlenin başında yer alan öznedir, vurgulanmamıştır.","B":"''Yarışma sonuçlarını'' belirtili nesnedir ancak yüklemin hemen bitişiğinde değildir.","D":"''Arkadaşlarına'' yer tamlayıcısıdır ancak araya zarf tümleci girmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000025'::uuid,
          25,
          'LGS-TR-T4-04',
          'Bana göre dostluk, insanın kendi eksikliklerini bir başkasının aynasında sevgiyle tamir edebilme sanatıdır. Dost dediğin, insanın kusurunu örtbas eden değil; o kusurun nasıl onarılacağını kırmadan dökmeden fısıldayandır. Belki yanılıyorumdur ama ömrüm boyunca edindiğim tecrübe bana dostluğun hesap kitap kaldırmayan bir teslimiyet olduğunu öğretti.',
          'Bu parçanın metin türü aşağıdakilerden hangisidir?',
          '{"A":"Makale","B":"Deneme","C":"Biyografi","D":"Röportaj"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Yazarın ''Bana göre'', ''Belki yanılıyorumdur'' gibi ifadelerle kanıtlama kaygısı gütmeden içten bir üslupla yazdığına dikkat edin.',
          'Yazar kendi kişisel görüşlerini samimi ve serbest bir üslupla, kesin kanıtlara başvurmadan kaleme almıştır. Bu özellikler deneme türünün belirleyicisidir.',
          '{"A":"Makalede bilimsel nesnellik, istatistiki veri ve kanıtlama zorunluluğu vardır.","C":"Biyografi tanınmış bir şahsın yaşam öyküsünü üçüncü ağızdan belgelerle sunar.","D":"Röportaj karşılıklı soru-cevap veya yerinde araştırma gerektirir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000026'::uuid,
          26,
          'LGS-TR-T4-05',
          '(I) Şehir hayatının gürültüsü ve koşturmacası, bireylerin kendi iç seslerini duymalarını engellemektedir. (II) Sürekli bir yerlere yetişme telaşı, insanı anın getirdiği estetik güzellikleri fark etmekten alıkoyar. (III) İşte tam bu noktada doğaya kaçış, insanın yıpranan ruhunu dinginleştiren bir sığınak işlevi görür. (IV) Oysa doğada geçirilen bir hafta sonu bile zihinsel yenilenme için eşsiz bir fırsat sunar.',
          'Bu parçadaki numaralanmış cümlelerin hangisinden sonra ''Yeşilin tonları ve kuş sesleri, şehirde yorulan zihne adeta şifa dağıtır.'' cümlesi getirilmelidir?',
          '{"A":"I","B":"II","C":"III","D":"IV"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Eklenecek cümledeki ''Yeşilin tonları ve kuş sesleri'' ile ''zihne şifa dağıtır'' ifadelerinin III. cümledeki ''doğaya kaçış'' ve ''sığınak işlevi görür'' ile organik bağını yakalayın.',
          'III. cümlede doğaya kaçışın bir sığınak olduğu belirtildikten sonra doğanın bu şifa verici özellikleri sıralanmalıdır; ardından IV. cümledeki özet fırsat yargısına geçilmelidir.',
          '{"A":"I. cümleden sonra şehir koşturmacasının olumsuzlukları devam etmektedir.","B":"II. cümleden sonra henüz doğa kavramı metne dâhil edilmemiştir.","D":"IV. cümle metnin kapanış cümlesidir; araya sokulamaz."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000027'::uuid,
          27,
          'LGS-TR-T4-06',
          'Aşağıdaki cümlelerin hangisinde yazım yanlışı yapılmıştır?',
          'Aşağıdaki cümlelerin hangisinde büyük harflerin veya kısaltmaların yazımıyla ilgili bir yanlışlık yapılmıştır?',
          '{"A":"Bu yıl LGS sınavı haziran ayının ilk pazar günü yapılacaktır.","B":"Toplantı için gelen heyet, Dicle Nehri kıyısındaki tarihî konakta ağırlandı.","C":"Türk Dil Kurumu Başkanı, yeni sözlüğün tanıtımında konuştu.","D":"Güneydoğu Anadolu''nun güney kesimlerinde sıcaklık rekorları kırıldı."}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Belirli bir tarih (gün/yıl rakamı) bildirmeyen ay ve gün adlarının küçük harfle başlaması kuralını kontrol ediniz. ''haziran'' doğru ancak ''LGS sınavı'' ifadesindeki anlatım bozukluğundan ziyade ''haziran ayı'' belirli bir tarih olmadığı için küçük yazılırken, dikkat edilmesi gereken kuralı inceleyin.',
          '''LGS'' zaten ''Liselere Geçiş Sistemi'' kısaltmasıdır; ''LGS sınavı'' gereksiz sözcük kullanımı ve ''haziran ayının ilk pazar günü'' ifadesinde belirli bir gün sayısı olmadığı için küçük yazım doğrudur ancak A şıkkında kısaltma açılımı ve kural gereği hata barındırır.',
          '{"B":"''Dicle Nehri'' özel ad ve nehir tür adı büyük harfle yazılır, doğrudur.","C":"''Türk Dil Kurumu Başkanı'' makam bildirdiği için büyük harfle yazılır.","D":"''Güneydoğu Anadolu'' ve yön bildiren ''güney'' sözcüğünün doğru yazımı kurallara uygundur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000028'::uuid,
          28,
          'LGS-TR-T4-07',
          'Bir toplumda bilimsel düşüncenin kök salması, salt laboratuvar binalarının inşa edilmesine veya teknik cihazların ithal edilmesine bağlı değildir. Eğer bireyler olaylar arasında sebep-sonuç ilişkisi kurma zahmetine katlanmıyor, sorgulanmamış dogmaları mutlak hakikat sayıyorsa; en gelişmiş mikroskoplar dahi o zihniyetin körlüğüne çare olamaz. Gerçek bilimsel tutum, şüphe duymayı bir erdem saymakla ve dogmalar karşısında aklın bağımsızlığını cesaretle savunma stratejisiyle başlar.',
          'Bu parçanın yazarına göre bilimsel gelişmenin önündeki en fazla engel oluşturan zihniyet aşağıdakilerden hangisidir?',
          '{"A":"Yeterli teknolojik altyapı ve finansal kaynağın bulunmaması","B":"Eğitim kurumlarında pratik deneylerin az yapılması","C":"Zihinsel tembellik ve sorgulamadan kabullenilen peşin yargılar","D":"Uluslararası bilimsel yayınların yeterince takip edilmemesi"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Parçada teknik imkânların yetersizliği değil, ''sebep-sonuç kurmama zahmeti'' ve ''sorgulanmamış dogmalar'' eleştirilmiştir. Buradan ''zihinsel tembellik ve peşin yargı'' sonucuna ulaşın.',
          'Yazar laboratuvar ve mikroskop gibi fiziksel donanımların düşünce dönüşümü olmadan anlamsız kalacağını; asıl engelin dogmaları mutlak saymak ve sebep-sonuç ilişkisi kurmaktan kaçınmak (zihinsel tembellik) olduğunu vurgular.',
          '{"A":"Teknolojik altyapı yazarın ikincil gördüğü, asıl çözümün zihniyette yattığını belirttiği unsurdur.","B":"Deney sayısından değil, genel eleştirel düşünme tutumundan söz edilmiştir.","D":"Uluslararası yayınlar metnin bağlamında hiç geçmemektedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000029'::uuid,
          29,
          'LGS-MAT-01',
          'Bir belediye, kenar uzunlukları 180 metre ve 240 metre olan dikdörtgen biçimindeki bir afet lojistik alanının etrafına ve içine, eşit aralıklarla güneş enerjili aydınlatma direkleri dikecektir. Sahadaki köşelere de birer direk dikilmesi zorunludur. Ayrıca afet durumunda güvenli geçişi sağlamak amacıyla iki direk arasındaki mesafenin metre cinsinden bir tam sayı ve 15 metreden küçük olması istenmektedir.',
          'Buna göre bu lojistik sahasının sadece çevresi boyunca dikilecek aydınlatma direği sayısı en az kaç olabilir?',
          '{"A":"35","B":"42","C":"70","D":"84"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: En az direk için aralık en büyük seçilmelidir. Kısıt: Mesafe < 15 m. 180 ve 240''ın EBOB''unun (60) 15''ten küçük en büyük bölenini bulunuz.',
          'EBOB(180, 240) = 60 m. 60''ın 15''ten küçük en büyük böleni: 12 m. Çevre = 2 x (180 + 240) = 840 m. Direk Sayısı = 840 / 12 = 70 adet.',
          '{"A":"Aralığı yanlışlıkla 24 m kabul eden öğrencilerin bulduğu sonuçtur.","B":"15''ten küçük kuralını unutup aralığı 20 m alanların düştüğü güçlü çeldiricidir (840/20 = 42).","D":"Aralığı 10 m seçip en büyük böleni yakalayamayanların sonucudur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000030'::uuid,
          30,
          'LGS-MAT-02',
          'Bir veri depolama merkezi, saniyede 2^14 bayt veri işleyen 16 adet özdeş sunucu barındırmaktadır. Bu merkezde veri işleme işlemi kesintisiz olarak 32 saniye boyunca devam etmiştir.',
          'Buna göre 32 saniye sonunda işlenen toplam veri miktarının bayt cinsinden değeri aşağıdakilerden hangisine eşittir?',
          '{"A":"2^21","B":"2^23","C":"2^25","D":"2^27"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Verilen tüm sayıları 2''nin kuvveti olarak yazınız: 16 = 2^4, 32 = 2^5.',
          '1 sunucu saniyede: 2^14 bayt. 16 sunucu saniyede: 16 x 2^14 = 2^4 x 2^14 = 2^18 bayt. 32 saniyede toplam: 32 x 2^18 = 2^5 x 2^18 = 2^23 bayt işlenir.',
          '{"A":"Zamanı hesaba katmayan öğrencilerin sonucudur.","C":"16 ve 32''yi çarpmayıp üsleri yanlış toplayanların sonucudur.","D":"Üsleri birbiriyle çarpanların düştüğü kavram yanılgısıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000031'::uuid,
          31,
          'LGS-MAT-T1-01',
          'Bir belediye, yeni yapılan doğrusal bir sahil bisiklet yolunun her iki tarafına da aydınlatma ve geri dönüşüm üniteleri yerleştirecektir.

• Yolun deniz tarafındaki kenarına yolun başından sonuna kadar 12 metre aralıklarla solar aydınlatma direkleri dikilmiştir.
• Yolun kara tarafındaki kenarına ise yolun başından sonuna kadar 18 metre aralıklarla atık pil toplama kutuları yerleştirilmiştir.
• Bisiklet yolunun hem başlangıç hem de bitiş noktalarında her iki kenarda da karşılıklı olarak bu direk ve kutulardan birer tane bulunmaktadır.
• Aydınlatma direği ile atık pil kutusunun tam karşılıklı geldiği her noktaya (başlangıç ve bitiş dahil) acil yardım butonu yerleştirilmiş olup toplam 9 adet acil yardım butonu kullanılmıştır.',
          'Buna göre bu bisiklet yoluna yerleştirilen solar aydınlatma direkleri ile atık pil toplama kutularının toplam sayısı kaçtır?',
          '{"A":"38","B":"40","C":"42","D":"44"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Karşılıklı gelme durumları iki sayının En Küçük Ortak Katı (EKOK) ile ilişkilidir. EKOK(12, 18)''i hesaplayınız. Başlangıç ve bitiş dahil 9 buton yerleştirilmişse, ardışık butonlar arasında 8 aralık olduğunu unutmayınız. Yolun toplam uzunluğunu bulduktan sonra her iki kenar için [Uzunluk / Aralık + 1] formülüyle eleman sayılarını tespit ediniz.',
          '1. Adım (Karşılaşma Aralığının Hesaplanması):
Solar direkler 12 m, pil kutuları 18 m aralıklarla yerleştirilmektedir. İkisinin aynı hizaya geldiği mesafeler 12 ve 18''in ortak katlarıdır:
EKOK(12, 18) = 36 metredir.
Demek ki her 36 metrede bir direk ve kutu karşılıklı gelmektedir.

2. Adım (Yol Uzunluğunun Bulunması):
Başlangıç ve bitiş noktaları dahil olmak üzere karşılıklı gelen toplam 9 nokta (acil buton) vardır.
9 nokta arasında (9 - 1) = 8 adet 36 metrelik aralık bulunur.
Bisiklet yolunun toplam uzunluğu = 8 x 36 = 288 metredir.

3. Adım (Direk ve Kutu Sayılarının Hesaplanması):
Yolun başında ve sonunda da eleman bulunduğundan:
• Solar Aydınlatma Direği Sayısı = (288 / 12) + 1 = 24 + 1 = 25 adet.
• Atık Pil Kutusu Sayısı = (288 / 18) + 1 = 16 + 1 = 17 adet.

4. Adım (Toplam Sayı):
Toplam Ünite Sayısı = 25 + 17 = 42 adettir.
Doğru cevap C şıkkıdır.',
          '{"A":"Yolun uzunluğunu (288 m) doğru bulup başlangıç ve bitişteki direkleri eklemeyi unutan ve 24 + 16 = 40 bulduktan sonra 2 adet buton düşenlerin seçeneğidir.","B":"Başlangıç noktalarındaki (+1) ilave direk ve kutuları eklemeyi unutup yalnızca aralık sayılarını toplayan öğrencilerin düştüğü çeldiricidir: 24 + 16 = 40.","D":"9 noktayı 9 aralık zannedip yolu 9 x 36 = 324 metre hesaplayan veya hesaplama hatası yaparak fazladan ekleme yapan öğrencilerin sonucudur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000032'::uuid,
          32,
          'LGS-MAT-T1-02',
          'Kenar uzunlukları metre cinsinden 1''den büyük birer tam sayı olan dikdörtgen biçimindeki bir hobi bahçesi projesinde zemin, yatay ve dikey doğrusal hatlarla 4 farklı dikdörtgensel parsele ayrılmıştır.

Bu parsellerden üçünün kullanım alanları krokide gösterilmiştir:
• Domates ekili alan: 48 m²
• Biber ekili alan: 36 m²
• Salatalık ekili alan: 60 m²
• Çilek ekili alan: Alanı belirtilmemiştir.

Domates ve Biber parselleri yan yana (üst sırada), Salatalık ve Çilek parselleri ise yan yana (alt sırada) bulunmaktadır. Domates ile Salatalık parselleri aynı dikey sütunda yer almaktadır.',
          'Buna göre kenar uzunlukları tam sayı olan bu hobi bahçesinin dış çevre uzunluğu en az kaç metredir?',
          '{"A":"54","B":"60","C":"68","D":"72"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Parsellerin ortak kenarlarını değişkenlerle modelleyiniz: Üst sıranın dikey kenarına x, alt sıranın dikey kenarına y; sol sütunun yatay kenarına a, sağ sütunun yatay kenarına b deyiniz. x·a = 48, x·b = 36, y·a = 60 eşitliklerinden ortak çarpanları ve oranları (a/b = 4/3, x/y = 4/5) elde ediniz. Çevrenin en az olması için kenarların birbirine en yakın değerlerini seçiniz.',
          '1. Adım (Geometrik Modelleme ve Oranlar):
Parsellerin kenarlarını belirleyelim:
• Domates: x · a = 48
• Biber: x · b = 36
• Salatalık: y · a = 60
• Çilek: y · b = ?

Buradan oranlama yaparsak:
(x · a) / (x · b) = a / b = 48 / 36 = 4 / 3 => a = 4k ve b = 3k (k bir tam sayı).
(x · a) / (y · a) = x / y = 48 / 60 = 4 / 5 => x = 4m ve y = 5m (m bir tam sayı).

2. Adım (Çarpan Eşitliği):
x · a = (4m) · (4k) = 16 · m · k = 48 => m · k = 3 bulunur.
m ve k pozitif tam sayılar olduğundan iki durum mümkündür:

1. Durum (m = 1, k = 3):
• a = 4 · 3 = 12 m, b = 3 · 3 = 9 m => Toplam Yatay Kenar = a + b = 21 m
• x = 4 · 1 = 4 m, y = 5 · 1 = 5 m => Toplam Dikey Kenar = x + y = 9 m
• Dış Çevre = 2 · (21 + 9) = 2 · 30 = 60 metredir.
(Tüm kenarlar 1''den büyüktür: 12, 9, 4, 5 > 1, şart sağlanır).

2. Durum (m = 3, k = 1):
• a = 4 · 1 = 4 m, b = 3 · 1 = 3 m => Toplam Yatay Kenar = 7 m
• x = 4 · 3 = 12 m, y = 5 · 3 = 15 m => Toplam Dikey Kenar = 27 m
• Dış Çevre = 2 · (7 + 27) = 2 · 34 = 68 metredir.

3. Adım (En Küçük Değer):
Bizden çevrenin en az değeri istendiğinden cevap 60 metredir.
Doğru cevap B şıkkıdır.',
          '{"A":"Çevre hesabında kenarları eksik toplayan veya 21 + 9 = 30 bulup iki katını almayı unutanların tahminidir.","C":"m = 3 ve k = 1 durumunu seçerek soruda istenen ''en az'' yerine ''en çok'' çevre değerini hesaplayan öğrencilerin düştüğü çeldiricidir: 2 · (7 + 27) = 68.","D":"Ortak kenarları EBOB değerleri yerine rastgele çarpanlarla seçip çevreyi gereksiz büyüten öğrencilerin sonucudur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000033'::uuid,
          33,
          'LGS-MAT-T1-03',
          'Yenilenebilir enerji üreten modern bir güneş enerjisi santralinde dikdörtgen biçiminde özdeş fotovoltaik paneller kullanılmıştır.

Santraldeki teknik özellikler şu şekildedir:
• Her bir güneş panelinin kısa kenar uzunluğu 2^6 cm, uzun kenar uzunluğu 2^8 cm''dir.
• Santral sahasına bu panellerden 2^7 tanesi aralarında boşluk bırakılmadan yan yana yerleştirilerek dev bir solar platform oluşturulmuştur.
• Bu solar platformun her 1 cm²''lik yüzeyi 1 saatte 4^-3 watt elektrik enerjisi üretmektedir.',
          'Buna göre kurulan bu solar platformun kesintisiz 16 saat çalışması durumunda ürettiği toplam elektrik enerjisi kaç watt''tır?',
          '{"A":"2^17","B":"2^19","C":"2^20","D":"2^22"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Adım adım tüm nicelikleri 2''nin kuvveti biçiminde ifade ediniz: 1 panelin alanı = 2^6 · 2^8 = 2^14 cm². Toplam alanı bulmak için panel sayısı (2^7) ile çarpınız. Birim yüzey üretimini (4^-3 = 2^-6) ve süreyi (16 = 2^4) üslü sayı çarpma kuralı [2^a · 2^b = 2^(a+b)] ile birleştiriniz.',
          '1. Adım (Bir Panelin Alanı):
Bir adet dikdörtgen panelin alanı = Kısa Kenar x Uzun Kenar
Alan = 2^6 cm x 2^8 cm = 2^(6 + 8) = 2^14 cm²''dir.

2. Adım (Platformun Toplam Alanı):
Platformda 2^7 adet özdeş panel bulunmaktadır.
Toplam Alan = 2^7 x 2^14 = 2^(7 + 14) = 2^21 cm²''dir.

3. Adım (1 Saatteki Enerji Üretimi):
Her 1 cm² yüzey 1 saatte 4^-3 watt enerji üretir.
4^-3 = (2^2)^-3 = 2^(-6) watt''tır.
Platformun 1 saatteki toplam üretimi = 2^21 x 2^(-6) = 2^(21 - 6) = 2^15 watt''tır.

4. Adım (16 Saatteki Toplam Üretim):
Süre: 16 saat = 2^4 saattir.
Toplam Üretilen Enerji = 2^15 x 2^4 = 2^(15 + 4) = 2^19 watt''tır.
Doğru cevap B şıkkıdır.',
          '{"A":"16 saatlik süreyi (2^4) çarpmak yerine 1 saatlik enerjiden 2^4 değerini çıkaran veya üs toplarken işlem hatası yapan öğrencilerin sonucudur: 2^15 x 2^2 = 2^17.","C":"Panel sayısını yanlışlıkla 2^8 alarak üssü 1 fazla bulan öğrencilerin işaretlediği çeldiricidir: 2^20.","D":"Negatif üssü (4^-3) pozitif kabul edip 2^21 ile 2^6''yı çarpan öğrencilerin düştüğü kavram yanılgısıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000034'::uuid,
          34,
          'LGS-MAT-T1-04',
          'Millî Eğitim Bakanlığı ve Çevre Vakfı iş birliğiyle yürütülen ''Geleceğe Akan Damlalar'' projesi kapsamında okullarda su israfını önlemek amacıyla fotoselli (sensörlü) musluk dönüşümü başlatılmıştır.

Proje verilerine göre:
• Projeye dahil edilen 80 ilin her birinde 250 okula sensörlü musluklar takılmıştır.
• Klasik muslukların açık kalması veya damlatması sebebiyle bir okulda günde ortalama 80 litre su boşa akmaktadır.
• Takılan sensörlü musluklar sayesinde okullardaki bu su israfının %75''i engellenmiştir.
• Tasarruf hesabı, okulların bir eğitim-öğretim yılında açık olduğu 200 gün esas alınarak yapılmıştır.
(1 Litre = 1000 mililitredir).',
          'Buna göre bu proje sayesinde bir eğitim-öğretim yılında tasarruf edilen toplam su miktarının mililitre (mL) cinsinden bilimsel gösterimi aşağıdakilerden hangisidir?',
          '{"A":"2,4 · 10^11","B":"2,4 · 10^8","C":"24 · 10^10","D":"3,2 · 10^11"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Önce toplam okul sayısını (80 x 250 = 20.000 = 2 x 10^4) ve bir okulun günlük tasarruf miktarını (80 x %75 = 60 L) bulunuz. 200 gün ile çarparak toplam litreyi, ardından 10^3 ile çarparak mililitreyi elde ediniz. Bilimsel gösterim koşulunun 1 ≤ |a| < 10 olduğunu unutmayınız.',
          '1. Adım (Toplam Okul Sayısı):
Toplam Okul Sayısı = 80 il x 250 okul = 20.000 okul = 2 x 10^4 okuldur.

2. Adım (Bir Okuldaki Günlük Tasarruf Miktarı):
Bir okulda günde 80 L su israf ediliyordu. Bunun %75''i tasarruf edildiğine göre:
Günlük Tasarruf = 80 x (75 / 100) = 80 x (3 / 4) = 60 litredir.

3. Adım (Bir Okulun 200 Günlük Tasarrufu):
1 Okulun Yıllık Tasarrufu = 60 L x 200 gün = 12.000 litredir.

4. Adım (Tüm Okulların Toplam Su Tasarrufu):
Toplam Tasarruf (Litre) = 20.000 okul x 12.000 L
= (2 x 10^4) x (1,2 x 10^4) = 2,4 x 10^8 litredir.

5. Adım (Mililitreye Dönüştürme ve Bilimsel Gösterim):
1 Litre = 1000 mL = 10^3 mL olduğuna göre:
Toplam Tasarruf (mL) = 2,4 x 10^8 x 10^3 = 2,4 x 10^(8+3) = 2,4 x 10^11 mililitredir.
2,4 katsayısı 1 ≤ a < 10 şartını sağladığından ifade bilimsel gösterimdedir.
Doğru cevap A şıkkıdır.',
          '{"B":"Litre cinsinden bulduğu sonucu (2,4 · 10^8) mililitreye çevirmeyi unutan öğrencilerin düştüğü çeldiricidir.","C":"Sonucu 24 · 10^10 bularak bilimsel gösterim tanımındaki 1 ≤ |a| < 10 kuralını ihmal eden öğrencilerin seçeneğidir.","D":"%75 tasarruf yerine kalan %25 israfı veya yanlış çarpma işlemi yaparak katsayıyı 3,2 bulan öğrencilerin sonucudur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000035'::uuid,
          35,
          'LGS-MAT-T1-05',
          'Kenar uzunlukları metre cinsinden birer tam sayı olan dikdörtgen biçimindeki bir parkın alanı 360 metrekaredir. Bu parkın etrafına köşelere de dikilmek şartıyla eşit aralıklarla aydınlatma direkleri dikilecektir. Parkın kenar uzunlukları aralarında asaldır.',
          'Buna göre parkın etrafına dikilecek direk sayısı en az kaçtır?',
          '{"A":"76","B":"82","C":"98","D":"124"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: 360''ın aralarında asal çarpan çiftlerini listeleyin: (1, 360), (5, 72), (8, 45), (9, 40). Direk sayısının en az olması için çevrenin en küçük olması gerekir. Çevresi en küçük olan çift (9, 40)''tır. EBOB(9, 40)=1 olduğuna göre aralık 1 m''dir. Çevre = 2*(9+40) = 98 m. Direk = 98 / 1 = 98.',
          '360 = 2^3 * 3^2 * 5. Aralarında asal kenar çiftleri: (1, 360), (5, 72), (8, 45), (9, 40). En küçük çevre için kenarlar birbirine en yakın seçilir: 9 m ve 40 m. EBOB(9, 40) = 1 m aralık. Çevre = 2 * (9 + 40) = 98 metre. Direk sayısı = Çevre / Aralık = 98 / 1 = 98 direk gerekir.',
          '{"A":"76 sayısı çarpanların hatalı toplanması sonucudur.","B":"82 sayısı (18, 20) çiftinden gelir ancak 18 ile 20 aralarında asal değildir (ortak bölen 2''dir).","D":"124 sayısı (8, 45) çiftinin yanlış hesaplanmasıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000036'::uuid,
          36,
          'LGS-MAT-04',
          'Bir peyzaj mimarı, bir sitenin bahçesine yapacağı rekreasyon alanı için kenar uzunluğu (4x + 6) metre olan kare şeklinde bir arsa tahsis etmiştir.

Mimarın hazırladığı yerleşim planında:
• Bu arsanın dört köşesine, kenar uzunlukları (x + 1) metre olan kare biçiminde dört adet özdeş ahşap kamelya inşa edilecektir.
• Kamelyaların dışında kalan orta bölgenin tamamına ise çim ekilerek dinlenme alanı oluşturulacaktır.',
          'Buna göre çim ekilecek bölgenin alanının metrekare cinsinden değerini veren cebirsel ifade aşağıdakilerden hangisidir?',
          '{"A":"12x^2 + 40x + 32","B":"15x^2 + 46x + 35","C":"12x^2 + 48x + 32","D":"16x^2 + 40x + 32"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki kare farkı özdeşliğini [A^2 - B^2 = (A - B)(A + B)] veya toplam alandan 4 kamelyanın alanını çıkarma yöntemini kullanınız. 4(x + 1)^2 ifadesinin [2(x + 1)]^2 olduğuna dikkat ediniz.',
          '1. Arsanın toplam alanı bir karedir: Alan = (4x + 6)^2 = 16x^2 + 48x + 36 metrekaredir.
2. Bir adet kamelyanın alanı = (x + 1)^2 = x^2 + 2x + 1 metrekaredir.
3. Dört köşede toplam 4 adet özdeş kamelya vardır: 4 x (x^2 + 2x + 1) = 4x^2 + 8x + 4 metrekare.
4. Çim ekilecek alan = Toplam Alan - 4 Kamelyanın Alanı
= (16x^2 + 48x + 36) - (4x^2 + 8x + 4)
= 16x^2 - 4x^2 + 48x - 8x + 36 - 4
= 12x^2 + 40x + 32 metrekaredir.
(İki kare farkı ile: [(4x + 6) - (2x + 2)][(4x + 6) + (2x + 2)] = (2x + 4)(6x + 8) = 12x^2 + 40x + 32). Doğru cevap A şıkkıdır.',
          '{"B":"Dört kamelya yerine yalnızca bir kamelyanın alanını çıkaran öğrencilerin düştüğü çeldiricidir: (4x + 6)^2 - (x + 1)^2 = 15x^2 + 46x + 35.","C":"(x + 1)^2 açılımında birinci ile ikincinin çarpımının iki katını unutup x^2 + 1 kabul eden öğrencilerin bulduğu sonuçtur.","D":"Toplam alandaki 16x^2 teriminden kamelyaların 4x^2 alanını çıkarmayı unutan öğrencilerin işaretlediği seçenektir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000037'::uuid,
          37,
          'LGS-MAT-05',
          'Bir spor kulübünde basketbol ve voleybol branşlarına kayıtlı toplam 60 sporcu bulunmaktadır. Bu sporcuların yaşları 13 veya 14''tür.

Kulüpteki sporcularla ilgili bilinenler şunlardır:
• Basketbol branşına kayıtlı sporcu sayısı, voleybol branşına kayıtlı sporcu sayısının 2 katıdır.
• Basketbol branşındaki 14 yaşındaki sporcu sayısı, 13 yaşındaki sporcu sayısından 8 fazladır.
• Kulüpteki tüm sporcular arasından rastgele seçilen bir sporcunun 13 yaşında olma olasılığı 2/5''tir.',
          'Buna göre voleybol branşındaki sporcular arasından rastgele seçilen bir sporcunun 14 yaşında olma olasılığı kaçtır?',
          '{"A":"1/5","B":"2/5","C":"3/5","D":"4/5"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Öncelikle branş sayılarını (Basketbol = 40, Voleybol = 20) ve tüm kulüpteki yaş dağılımını (13 yaş: 24 kişi, 14 yaş: 36 kişi) bulunuz. Ardından basketbolcuların yaş denklemini çözüp voleybolculara geçiş yapınız.',
          '1. Adım: Toplam 60 sporcu vardır. Basketbolcu sayısı (B), voleybolcu sayısının (V) 2 katı olduğuna göre: B + V = 2V + V = 3V = 60 => V = 20, B = 40 kişidir.
2. Adım: Tüm sporcular arasından rastgele seçilen birinin 13 yaşında olma olasılığı 2/5 ise; kulüpteki toplam 13 yaşındaki sporcu sayısı = 60 x (2/5) = 24 kişidir. O hâlde 14 yaşındaki toplam sporcu sayısı = 60 - 24 = 36 kişidir.
3. Adım: Basketbol branşındaki toplam 40 sporcudan 14 yaşındakiler (B14), 13 yaşındakilerden (B13) 8 fazla olduğuna göre:
B13 + B14 = 40 => B13 + (B13 + 8) = 40 => 2 B13 = 32 => B13 = 16 kişidir.
Buradan basketbol branşındaki 14 yaşındaki sporcu sayısı B14 = 16 + 8 = 24 kişidir.
4. Adım: Kulüpte toplam 36 adet 14 yaşında sporcu vardı. Basketbolda 24 kişi olduğuna göre voleyboldaki 14 yaşındaki sporcu sayısı = 36 - 24 = 12 kişidir.
5. Adım: Voleybol branşında toplam 20 sporcu olduğundan, bu gruptan rastgele seçilen birinin 14 yaşında olma olasılığı = 12 / 20 = 3/5''tir. Doğru cevap C şıkkıdır.',
          '{"A":"14 yaşındaki voleybolcu sayısını (12) tüm kulüp mevcuduna (60) oranlayan öğrencilerin düştüğü çeldiricidir: 12 / 60 = 1/5.","B":"14 yaş yerine 13 yaşındaki voleybolcuların olasılığını hesaplayan öğrencilerin yanılgısıdır: 8 / 20 = 2/5.","D":"Basketbol branşındaki 13 yaşındakileri voleybola aktarıp hesaplayan öğrencilerin sonucudur: 16 / 20 = 4/5."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000038'::uuid,
          38,
          'LGS-MAT-T2-01',
          'Bir teknoloji ve havacılık kulübü, geliştirdikleri insansız hava araçları (İHA) için kare şeklinde düz bir test ve iniş pisti inşa etmiştir.

Pistin mimari planında şu detaylar yer almaktadır:
• Pistin tamamı kenar uzunluğu (3x + 4) metre olan kare biçimindedir.
• Bu pistin tam orta kısmına acil inişler için kenar uzunluğu (x - 2) metre olan kare şeklinde bir alan kırmızı renge boyanmıştır.
• Pistin kırmızı bölge dışında kalan tüm zeminine ise kaydırmaz özel epoksi kaplama yapılacaktır.',
          'Buna göre epoksi kaplama yapılacak bölgenin alanının metrekare cinsinden değerini veren cebirsel ifade aşağıdakilerden hangisidir?',
          '{"A":"8x^2 + 28x + 12","B":"8x^2 + 20x + 12","C":"8x^2 + 28x + 20","D":"10x^2 + 28x + 12"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki kare farkı özdeşliği [A^2 - B^2 = (A - B)(A + B)] ile çok hızlı çözüme ulaşabilirsiniz. Terimleri açarak çıkarırken parantez önündeki eksi işaretinin tüm terimlerin işaretini değiştirdiğine [-(x^2 - 4x + 4) = -x^2 + 4x - 4] dikkat ediniz.',
          '1. Yöntem (İki Kare Farkı Özdeşliği ile Çözüm):
Epoksi Alanı = Pistin Toplam Alanı - Kırmızı Alan
= (3x + 4)^2 - (x - 2)^2
A^2 - B^2 = (A - B) · (A + B) kuralını uygulayalım:
• A - B = (3x + 4) - (x - 2) = 3x + 4 - x + 2 = 2x + 6
• A + B = (3x + 4) + (x - 2) = 4x + 2
Çarpım = (2x + 6)(4x + 2) = 8x^2 + 4x + 24x + 12 = 8x^2 + 28x + 12 metrekaredir.

2. Yöntem (Kare Açılımları ile Çözüm):
• Toplam Alan = (3x + 4)^2 = 9x^2 + 24x + 16
• Kırmızı Alan = (x - 2)^2 = x^2 - 4x + 4
• Epoksi Alanı = (9x^2 + 24x + 16) - (x^2 - 4x + 4)
= 9x^2 - x^2 + 24x - (-4x) + 16 - 4
= 8x^2 + 28x + 12 metrekaredir.
Doğru cevap A şıkkıdır.',
          '{"B":"-(x - 2)^2 açılımında eksi işaretini -4x terimine dağıtmayıp +24x - 4x = 20x olarak hesaplayan öğrencilerin düştüğü en yaygın işaret çeldiricisidir.","C":"Sabit terimler farkında 16 - 4 yerine 16 - (-4) = 20 yazarak hata yapan öğrencilerin işaretlediği seçenektir.","D":"Alanları çıkarmak yerine 9x^2 ile x^2''yi toplayıp 10x^2 bulan dikkatsiz öğrencilerin seçeneğidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000039'::uuid,
          39,
          'LGS-MAT-T2-02',
          'Bir marangoz, kısa kenar uzunluğu (x + 2) cm, uzun kenar uzunluğu (3x + 4) cm olan dikdörtgen biçimindeki 4 adet özdeş ahşap çıtayı düz bir masa üzerinde birleştirerek bir resim çerçevesi oluşturmuştur.

Çıtalar birbirine dik olacak şekilde, aralarında boşluk bırakılmadan ve uçları dışarı taşmayacak biçimde yan yana getirilmiş; böylece çerçevenin ortasında kare şeklinde boş bir resim yerleştirme alanı oluşmuştur.',
          'Buna göre çerçevenin ortasında oluşan kare biçimindeki boş bölgenin alanını santimetrekare cinsinden veren cebirsel ifade aşağıdakilerden hangisidir?',
          '{"A":"4x^2 + 8x + 4","B":"4x^2 + 4x + 4","C":"4x^2 + 16x + 16","D":"9x^2 + 24x + 16"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Çerçevenin ortasında kalan kare boşluğun bir kenar uzunluğunu bulunuz. Şeklin simetrisinden bu kenar uzunluğu, dikdörtgen çıtanın uzun kenarından kısa kenarının çıkarılmasıyla elde edilir: Kenar = (3x + 4) - (x + 2) = 2x + 2. Ardından bu kenarın karesini alınız.',
          '1. Adım (Ortadaki Boşluğun Kenar Uzunluğu):
4 özdeş dikdörtgen çıta ile oluşturulan çerçevenin iç kenarı, çıtanın uzun kenarından bitişiğindeki çıtanın kısa kenarının çıkarılmasıyla bulunur:
İç Boşluğun Bir Kenarı = Uzun Kenar - Kısa Kenar
= (3x + 4) - (x + 2)
= 3x + 4 - x - 2 = 2x + 2 cm''dir.

2. Adım (İç Boşluğun Alanının Hesaplanması):
İç bölge bir kare olduğundan alanı bir kenarının karesine eşittir:
Alan = (2x + 2)^2
Tam kare açılımı kuralına göre [(a + b)^2 = a^2 + 2ab + b^2]:
= (2x)^2 + 2 · (2x) · 2 + 2^2
= 4x^2 + 8x + 4 cm² bulunur.

3. Adım (Alternatif Doğrulama - Toplam Alandan Çıkarma):
Dış büyük karenin bir kenarı = Uzun Kenar + Kısa Kenar = (3x + 4) + (x + 2) = 4x + 6 cm.
Dış Alan = (4x + 6)^2 = 16x^2 + 48x + 36 cm².
4 adet çıtanın alanı = 4 · [(x + 2)(3x + 4)] = 4 · (3x^2 + 10x + 8) = 12x^2 + 40x + 32 cm².
İç Boşluk = (16x^2 + 48x + 36) - (12x^2 + 40x + 32) = 4x^2 + 8x + 4 cm².
Doğru cevap A şıkkıdır.',
          '{"B":"(2x + 2)^2 açılımında birinci ile ikincinin çarpımının iki katını almayı unutup 2 · 2x = 4x yazan öğrencilerin düştüğü çeldiricidir.","C":"İç kenarı yanlışlıkla (2x + 4) olarak hesaplayıp karesini alan öğrencilerin bulduğu sonuçtur.","D":"Doğrudan bir çıtanın uzun kenarının karesini (3x + 4)^2 hesaplayan dikkatsiz öğrencilerin seçeneğidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000040'::uuid,
          40,
          'LGS-MAT-T2-03',
          'Bir okul kütüphanesinde Roman, Bilim Kurgu, Şiir ve Tarih olmak üzere 4 farklı türde toplam 90 adet kitap bulunmaktadır.

Bu kitapların türlerine göre dağılımı ile ilgili şunlar bilinmektedir:
• Kütüphaneden rastgele seçilen bir kitabın Şiir kitabı olma olasılığı 1/6''dır.
• Tarih kitaplarının sayısı, Şiir kitaplarının sayısından 15 fazladır.
• Roman kitaplarının sayısı, Bilim Kurgu kitaplarının sayısının 2 katıdır.

Kütüphane haftasında bir yayınevi bu okula destek olmak amacıyla kütüphaneye 30 adet yeni Bilim Kurgu kitabı daha bağışlamış ve bu kitaplar kütüphanedeki diğer kitapların arasına yerleştirilmiştir.',
          'Buna göre son durumda bu kütüphaneden rastgele seçilen bir kitabın Bilim Kurgu kitabı olma olasılığı kaçtır?',
          '{"A":"1/4","B":"3/8","C":"1/2","D":"5/8"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İlk durumdaki 90 kitaptan yola çıkarak Şiir (90 x 1/6 = 15) ve Tarih (15 + 15 = 30) sayılarını bulunuz. Kalan 45 kitabı 2k ve k oranında Roman (30) ve Bilim Kurgu (15) olarak paylaştırınız. Yeni eklenen 30 kitabı hem Bilim Kurgu sayısına hem de toplam kitap sayısına ekleyerek yeni olasılığı hesaplayınız.',
          '1. Adım (Başlangıçtaki Kitap Sayılarının Hesaplanması):
• Toplam kitap sayısı = 90 adettir.
• Şiir kitabı olma olasılığı = 1/6 olduğundan:
  Şiir Kitabı Sayısı = 90 x (1/6) = 15 adettir.
• Tarih kitapları sayısı Şiir''den 15 fazla olduğundan:
  Tarih Kitabı Sayısı = 15 + 15 = 30 adettir.
• Geriye kalan kitaplar (Roman ve Bilim Kurgu):
  Kalan = 90 - (15 + 30) = 90 - 45 = 45 adettir.
• Roman sayısı (R), Bilim Kurgu sayısının (BK) 2 katıdır:
  R = 2 · BK => 2 · BK + BK = 3 · BK = 45 => BK = 15, Roman = 30 adettir.

2. Adım (Bağış Sonrası Yeni Durum):
• 30 adet yeni Bilim Kurgu kitabı eklenmiştir:
  Yeni Bilim Kurgu Sayısı = 15 + 30 = 45 adet.
• Kütüphanedeki yeni toplam kitap mevcudu:
  Yeni Toplam = 90 + 30 = 120 adettir.

3. Adım (Olasılığın Hesaplanması):
Seçilen bir kitabın Bilim Kurgu olma olasılığı:
Olasılık = İstenen Durum Sayısı / Tüm Durum Sayısı
= 45 / 120
Pay ve paydayı 15 ile sadeleştirelim:
= (45 / 15) / (120 / 15) = 3 / 8''dir.
Doğru cevap B şıkkıdır.',
          '{"A":"Son durumda Roman seçilme olasılığını hesaplayan öğrencilerin sonucudur: 30 / 120 = 1/4.","C":"Yeni eklenen 30 kitabı sadece Bilim Kurgu''ya ekleyip paydada toplamı değiştirmeyi unutanların sonucudur: 45 / 90 = 1/2.","D":"Roman veya Bilim Kurgu kitaplarının toplam olasılığını hesaplayan öğrencilerin düştüğü çeldiricidir: (45 + 30) / 120 = 75 / 120 = 5/8."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000041'::uuid,
          41,
          'LGS-MAT-T2-04',
          'Bir matematik öğretmeni, olasılık ve kareköklü ifadeler konusunu pekiştirmek için üzerinde kareköklü sayılar yazan kartlarla bir etkinlik tasarlamıştır.

Öğretmen masaya iki kutu koymuş ve içlerine üzerlerinde aşağıdaki sayıların yazılı olduğu dörder kart atmıştır:
• 1. Kutu: √18, √20, √24, √48
• 2. Kutu: √2, √8, √12, √45

Bu etkinlikte bir öğrenci 1. Kutudan rastgele bir kart, ardından 2. Kutudan rastgele bir kart çekmiş ve kartların üzerinde yazan iki kareköklü ifadeyi birbiriyle çarpmıştır.',
          'Buna göre yapılan bu çarpma işleminin sonucunun bir doğal sayı olma olasılığı kaçtır?',
          '{"A":"1/8","B":"3/16","C":"1/4","D":"5/16"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki kareköklü ifadenin çarpımının bir doğal sayı (kökten kurtulmuş pozitif sayı) olabilmesi için kök içlerindeki kısımların (a√b gösteriminde ''b'' sayılarının) aynı olması gerekir. Tüm kartları önce a√b biçiminde sadeleştiriniz. Toplam olası durum sayısının 4 x 4 = 16 olduğunu belirleyip eşleşen durumları sayınız.',
          '1. Adım (Kartların a√b Biçiminde Yazılması):
• 1. Kutudaki Kartlar:
  - √18 = √(9 · 2) = 3√2
  - √20 = √(4 · 5) = 2√5
  - √24 = √(4 · 6) = 2√6
  - √48 = √(16 · 3) = 4√3

• 2. Kutudaki Kartlar:
  - √2 = 1√2
  - √8 = √(4 · 2) = 2√2
  - √12 = √(4 · 3) = 2√3
  - √45 = √(9 · 5) = 3√5

2. Adım (Tüm Olası Durumların Sayısı):
1. Kutudan 4 farklı, 2. Kutudan 4 farklı kart seçilebileceğinden:
Tüm Olası Durumlar = 4 x 4 = 16 tanedir.

3. Adım (Çarpımı Doğal Sayı Yapan İstenen Durumlar):
İki köklü sayının çarpımının doğal sayı olması için aynı kök katsayısına (√2, √3, √5 vb.) sahip olmaları gerekir:
• 1. Kutudaki 3√2 ile:
  - 2. Kutudaki √2 çarpılırsa: 3√2 · √2 = 6 (Doğal sayı)
  - 2. Kutudaki 2√2 çarpılırsa: 3√2 · 2√2 = 12 (Doğal sayı) => (2 durum)
• 1. Kutudaki 2√5 ile:
  - 2. Kutudaki 3√5 çarpılırsa: 2√5 · 3√5 = 30 (Doğal sayı) => (1 durum)
• 1. Kutudaki 2√6 ile:
  - 2. Kutuda kök içi 6 olan kart yoktur => (0 durum)
• 1. Kutudaki 4√3 ile:
  - 2. Kutudaki 2√3 çarpılırsa: 4√3 · 2√3 = 24 (Doğal sayı) => (1 durum)

Toplam İstenen Durum Sayısı = 2 + 1 + 0 + 1 = 4 durumdur.

4. Adım (Olasılığın Hesaplanması):
Olasılık = İstenen Durum Sayısı / Tüm Olası Durumlar
= 4 / 16 = 1 / 4''tür.
Doğru cevap C şıkkıdır.',
          '{"A":"Yalnızca √2 köküne sahip eşleşmeleri (3√2 ile √2 ve 2√2) hesaba katıp diğerlerini unutan öğrencilerin sonucudur: 2 / 16 = 1/8.","B":"√8 sayısını kök dışına çıkarırken hata yapıp veya tek bir √2 eşleşmesi sayıp toplam 3 durum bulanların seçeneğidir: 3/16.","D":"2√6 ile 2√3''ün çarpımını (2√6 · 2√3 = 4√18 = 12√2) yanlışlıkla doğal sayı zannedip 5 durum bulan öğrencilerin düştüğü çeldiricidir: 5/16."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.977Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000042'::uuid,
          42,
          'LGS-MAT-T2-05',
          'Verilen cebirsel ifade: 3x² - 5x + 7',
          'Bu cebirsel ifadenin katsayılar toplamı kaçtır?',
          '{"A":"3","B":"5","C":"7","D":"15"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Katsayıları işaretleriyle birlikte toplayınız: 3 + (-5) + 7 = 5.',
          'Katsayılar 3, -5 ve +7''dir. Toplam = 3 - 5 + 7 = 5''tir.',
          '{"A":"-5 ve +7 toplanıp 3 ihmal edilirse veya işaret hatası yapılırsa bulunur.","C":"Sadece sabit terim alınırsa bulunur.","D":"Tüm katsayılar mutlak değerce toplanırsa (3+5+7=15) bulunur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000043'::uuid,
          43,
          'LGS-MAT-06',
          'Erişilebilirlik mevzuatına göre tekerlekli sandalye kullanıcıları için tasarlanan açık alan rampalarında eğim en fazla %6 olmalıdır.

Bir kültür merkezinin giriş kapısının zeminden yüksekliği 150 cm''dir. Bu kapıya ulaşmak için yapılacak rampa projesinde şu planlama yapılmıştır:
• Rampa; zemin ile yatay dinlenme sahanlığı arasındaki ''1. Rampa'' ve sahanlık ile giriş kapısı arasındaki ''2. Rampa'' olmak üzere iki bölümden oluşmaktadır.
• Yatay dinlenme sahanlığının zeminden yüksekliği 60 cm''dir.
• 1. Rampanın eğimi standarttaki üst sınıra eşit olup %6''dır.
• 2. Rampanın eğimi ise %5 olarak projelendirilmiştir.',
          'Buna göre yapılan bu projede 2. Rampanın yatay uzunluğu, 1. Rampanın yatay uzunluğundan kaç metre fazladır?',
          '{"A":"5","B":"6","C":"8","D":"12"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Eğim formülünü [Eğim = Dikey Uzunluk / Yatay Uzunluk] uygulayınız. 1. Rampanın dikey yüksekliğinin 60 cm, 2. Rampanın dikey yüksekliğinin ise (150 - 60 = 90 cm) olduğuna dikkat ediniz.',
          '1. Adım (1. Rampa Analizi):
• 1. Rampanın dikey yüksekliği = 60 cm''dir.
• Eğimi = %6 = 6 / 100''dür.
• Eğim = Dikey / Yatay1 => 6 / 100 = 60 / Yatay1 => Yatay1 = (60 x 100) / 6 = 1000 cm = 10 metredir.

2. Adım (2. Rampa Analizi):
• Giriş kapısı 150 cm, sahanlık 60 cm yükseklikte olduğundan 2. Rampanın dikey yüksekliği = 150 - 60 = 90 cm''dir.
• Eğimi = %5 = 5 / 100 = 1 / 20''dir.
• Eğim = Dikey / Yatay2 => 1 / 20 = 90 / Yatay2 => Yatay2 = 90 x 20 = 1800 cm = 18 metredir.

3. Adım (Farkın Hesaplanması):
• Yatay uzunluklar farkı = Yatay2 - Yatay1 = 18 - 10 = 8 metredir. Doğru cevap C şıkkıdır.',
          '{"A":"Dikey yükseklikleri yanlışlıkla eşit (75 cm) kabul eden öğrencilerin bulduğu sonuçtur.","B":"2. Rampanın eğimini de %6 kabul edip dikey yükseklik farkını (30 cm) eğime bölenlerin sonucudur: (90 - 60) / 0,06 = 500 cm (veya 6 m hatası).","D":"2. Rampanın dikey yüksekliğini sahanlığı çıkarmadan doğrudan 150 cm alan öğrencilerin düştüğü güçlü çeldiricidir: 150 x 20 = 3000 cm (30 m) ve 30 - 18 = 12 metre."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"APPLY","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":5,"starLabel":"★★★★★","category":"5 Yıldız • Şampiyon / Üst Düzey Seçici","placement":"Deneme Sınavı Seçici Soruları (%1''lik Dilim Ayırt Edici)","rationale":"Çok adımlı optimizasyon, soyut modelleme ve yüksek analitik akıl yürütme içerir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.980Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000044'::uuid,
          44,
          'LGS-MAT-07',
          'Bir organik tarım kooperatifinin bir sezonda hasat ettiği toplam 72 ton zeytinin türlerine göre (Gemlik, Domat, Ayvalık) dağılımı Grafik 1''deki daire grafiğinde gösterilmiştir.

Kooperatif, hasat ettiği zeytinlerin bir kısmını zeytinyağı üretiminde kullanmış, kalan kısmını ise sofralık olarak satışa ayırmıştır. Zeytin türlerine göre zeytinyağı üretiminde kullanılan miktarların yüzdesi ise Grafik 2''deki sütun grafiğinde verilmiştir.

• Grafik 1 (Daire Grafiği - Hasat Dağılımı): Gemlik zeytini 150°, Domat zeytini 90° ve Ayvalık zeytini 120°''lik merkez açıyla gösterilmiştir.
• Grafik 2 (Sütun Grafiği - Zeytinyağına Ayrılan Pay %): Gemlik %40, Domat %50, Ayvalık %75.',
          'Buna göre bu kooperatifin zeytinyağı üretiminde kullanmadığı (sofralık olarak ayırdığı) toplam zeytin miktarı kaç tondur?',
          '{"A":"27","B":"33","C":"36","D":"39"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Daire grafiğinde 360° = 72 ton bağıntısından 1° = 0,2 ton oranını yakalayınız. Her türün toplam miktarını bulduktan sonra zeytinyağına ayrılan yüzdeleri değil, geriye kalan sofralık yüzdeleri (%60, %50, %25) hesaplayarak toplayınız.',
          '1. Adım (Türlerin Toplam Miktarının Bulunması):
360° toplam 72 ton zeytini temsil ettiğine göre 1° = 72 / 360 = 0,2 tondur.
• Gemlik zeytini: 150 x 0,2 = 30 ton
• Domat zeytini: 90 x 0,2 = 18 ton
• Ayvalık zeytini: 120 x 0,2 = 24 ton
(Toplam: 30 + 18 + 24 = 72 ton)

2. Adım (Sofralık Ayrılan Miktarların Hesaplanması):
• Gemlik zeytini: %40''ı yağ için kullanılırsa geriye %60''ı sofralık kalır => 30 x (60 / 100) = 18 ton sofralık.
• Domat zeytini: %50''si yağ için kullanılırsa geriye %50''si sofralık kalır => 18 x (50 / 100) = 9 ton sofralık.
• Ayvalık zeytini: %75''i yağ için kullanılırsa geriye %25''i sofralık kalır => 24 x (25 / 100) = 6 ton sofralık.

3. Adım (Toplam Sofralık Zeytin Miktarı):
Toplam Sofralık Miktar = 18 + 9 + 6 = 33 tondur. Doğru cevap B şıkkıdır.',
          '{"A":"Yalnızca Gemlik ve Domat zeytinlerinin sofralık miktarını toplayıp Ayvalık''ı unutanların sonucudur: 18 + 9 = 27 ton.","C":"Tüm ürünlerin yarısının sofralık ayrıldığını varsayan dikkatsiz öğrenci tahminidir: 72 / 2 = 36 ton.","D":"Soru kökündeki ''kullanmadığı'' ifadesini gözden kaçırıp zeytinyağı üretiminde KULLANILAN toplam miktarı hesaplayan öğrencilerin düştüğü en güçlü tuzaktır: (12 + 9 + 18 = 39 ton)."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.980Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000045'::uuid,
          45,
          'LGS-MAT-T3-03',
          'Bir marangoz elindeki çıtayı ölçtüğünde uzunluğunun √75 desimetre olduğunu tespit ediyor.',
          'Buna göre bu çıtanın uzunluğu hangi iki ardışık tam sayı arasındadır?',
          '{"A":"6 ile 7","B":"7 ile 8","C":"8 ile 9","D":"9 ile 10"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: 75 sayısının hangi iki tam kare sayı arasında olduğunu bulunuz: 64 < 75 < 81.',
          '√64 = 8 ve √81 = 9 olduğundan √75 sayısı 8 ile 9 arasındadır (9''a daha yakındır).',
          '{"A":"6 ile 7 aralığı √36 ile √49 arasındadır.","B":"7 ile 8 aralığı √49 ile √64 arasındadır.","D":"9 ile 10 aralığı √81 ile √100 arasındadır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000046'::uuid,
          46,
          'LGS-MAT-T3-04',
          'Bir kenar uzunluğu √48 cm olan karenin alanı ile kısa kenarı √12 cm olan bir dikdörtgenin alanı birbirine eşittir.',
          'Buna göre bu dikdörtgenin uzun kenarı kaç santimetredir?',
          '{"A":"4√3","B":"8√3","C":"12","D":"16"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Karenin alanı = (√48)² = 48. Dikdörtgenin alanı = Kısa * Uzun -> 48 = √12 * x. √12 = 2√3. x = 48 / (2√3) = 24 / √3 = 8√3 cm.',
          'Karenin alanı = (√48)² = 48 cm². Dikdörtgenin alanı = √12 * x = 48. 2√3 * x = 48 -> x = 48 / 2√3 = 24 / √3 = 8√3 cm.',
          '{"A":"4√3 kısa kenarın iki katıdır.","C":"12 köksüz hatalı bölme sonucudur.","D":"16 kök üçe bölmeyi unutan işlemdir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000047'::uuid,
          47,
          'LGS-MAT-T3-05',
          'Bir torbada özdeş 6 kırmızı, 8 mavi ve bir miktar sarı bilye vardır. Bu torbadan rastgele çekilen bir bilyenin sarı olma olasılığı 1/3''tür.',
          'Buna göre torbada kaç adet sarı bilye vardır?',
          '{"A":"5","B":"7","C":"9","D":"14"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Sarı bilye sayısı s olsun. Kırmızı + Mavi = 14. Toplam bilye = 14 + s. Olasılık: s / (14 + s) = 1/3 -> 3s = 14 + s -> 2s = 14 -> s = 7.',
          'Kırmızı + Mavi = 6 + 8 = 14 bilye. Sarı bilye = s. Sarı olma olasılığı = s / (14 + s) = 1/3. 3s = 14 + s => 2s = 14 => s = 7 adet sarı bilye vardır.',
          '{"A":"5 sayısı 14''ün 1/3''ü sanılarak yapılan yaklaşımdır.","C":"9 sayısı toplamı 27 varsayarak yapılan hatadır.","D":"14 kırmızı ve mavi bilyelerin toplamıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000048'::uuid,
          48,
          'LGS-MAT-T3-06',
          'Bir su deposunda başlangıçta 120 litre su bulunmaktadır. Deponun altındaki vanadan her saatte sabit 8 litre su akmaktadır.',
          'Buna göre depoda kalan su miktarı (y) ile geçen süre (x, saat) arasındaki doğrusal ilişkinin denklemi aşağıdakilerden hangisidir?',
          '{"A":"y = 120 + 8x","B":"y = 120 - 8x","C":"y = 8x - 120","D":"y = 120 / 8x"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Başlangıç değeri sabit terimdir (120). Su boşaldığı için her saatte miktar azalacaktır, bu yüzden eğim negatiftir (-8x).',
          'Başlangıçta x = 0 iken y = 120''dir. Her saat 8 litre eksildiği için x saat sonra boşalan su 8x''tir. Kalan su y = 120 - 8x olur.',
          '{"A":"y = 120 + 8x depoya su doldurulduğunda geçerlidir.","C":"y = 8x - 120 negatif su miktarı üretir.","D":"Ters orantı denklemi değildir, doğrusal ilişkidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000049'::uuid,
          49,
          'LGS-MAT-T3-07',
          'Kenar uzunluğu (3x + 4) cm olan kare şeklindeki bir mukavvanın dört köşesinden, kenar uzunluğu (x - 1) cm olan özdeş kareler kesilip atılıyor. Kalan parça katlanarak üstü açık bir kutu oluşturulacaktır.',
          'Buna göre kutunun taban alanını santimetrekare cinsinden veren cebirsel modelleme ifadesi aşağıdakilerden hangisidir?',
          '{"A":"(x + 6)²","B":"(x + 2)²","C":"(2x + 5)²","D":"(x + 5)²"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bir kenardan iki adet köşe kesilir. Yeni taban kenarı = (3x + 4) - 2*(x - 1) = 3x + 4 - 2x + 2 = x + 6 cm. Taban kare olduğundan alan = (x + 6)².',
          'Büyük karenin bir kenarı 3x + 4''tür. İki köşeden de (x - 1) uzunluğunda parçalar kesilince tabanın bir kenarı: (3x + 4) - 2(x - 1) = 3x + 4 - 2x + 2 = x + 6 cm olur. Taban alanı kare olduğundan (x + 6)² cm²''dir.',
          '{"B":"-2 dağıtılırken işaret hatası yapılıp 4 - 2 = 2 bulunursa (x + 2)² çıkar.","C":"Sadece tek bir köşe çıkarılırsa (2x + 5) bulunur.","D":"Köşedeki 1 ihmal edilirse (x + 5)² yanılgısı oluşur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000050'::uuid,
          50,
          'LGS-MAT-T4-01',
          '√108 sayısı a√b şeklinde yazılacaktır.',
          'Buna göre a ve b pozitif tam sayılar olmak üzere a''nın en büyük değeri için b kaçtır?',
          '{"A":"2","B":"3","C":"6","D":"12"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: 108 sayısının en büyük tam kare çarpanını bulunuz: 108 = 36 * 3. Buradan a = 6, b = 3 olur.',
          '108 = 36 * 3 = 6² * 3. √108 = 6√3. a''nın en büyük değeri 6''dır; bu durumda b = 3 olur.',
          '{"A":"2 çarpanı 108''in kök içi çarpanı olamaz (108 / 4 = 27 = 3√3).","C":"6 katsayı a''dır, kök içi b değildir.","D":"12 alınırsa a = 3 olur (3√12), ancak soru a''nın en büyük değerini istemektedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000051'::uuid,
          51,
          'LGS-MAT-T4-02',
          'Bir çiftlikteki 720 hayvanın 180''i koyun, 240''ı inek ve geri kalanı keçidir.',
          'Bu hayvanların dağılımı bir daire grafiğinde gösterildiğinde keçileri temsil eden merkez açı kaç derece olur?',
          '{"A":"90°","B":"120°","C":"150°","D":"160°"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Keçi sayısı = 720 - (180 + 240) = 300. Orantı: 720 hayvana 360° düşerse (yarısı kadar derece), 300 keçiye 300 / 2 = 150° düşer.',
          'Koyun + İnek = 180 + 240 = 420. Keçi sayısı = 720 - 420 = 300. Daire grafiğinde 720 hayvan 360°''ye karşılık gelmektedir (her 2 hayvana 1°). Dolayısıyla 300 keçi 300 / 2 = 150° merkez açıya sahip olur.',
          '{"A":"90° 180 koyunun merkez açısıdır.","B":"120° 240 ineğin merkez açısıdır.","D":"160° hatalı toplama ve çıkarma işlemidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000052'::uuid,
          52,
          'LGS-MAT-T4-03',
          'Bir kenarı √72 cm olan bir tel bükülerek √18 cm''lik parçası kesilip atılıyor.',
          'Kalan telin uzunluğu kaç santimetredir?',
          '{"A":"3√2","B":"4√2","C":"5√2","D":"√54"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: √72 = 6√2 ve √18 = 3√2 olarak yazınız. Çıkarma işlemi: 6√2 - 3√2 = 3√2 cm.',
          '√72 = √(36 * 2) = 6√2 cm. √18 = √(9 * 2) = 3√2 cm. Kalan parça = 6√2 - 3√2 = 3√2 cm.',
          '{"B":"4√2 işlem hatasıdır.","C":"5√2 toplama hatasıdır.","D":"√54 kök içlerinin birbirinden doğrudan çıkarılması (72 - 18 = 54) şeklindeki klasik kavram yanılgısıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000053'::uuid,
          53,
          'LGS-MAT-T4-04',
          'Bir teknoloji mağazasında haftalık satılan tablet sayıları şöyledir: Pazartesi 20, Salı 35, Çarşamba 25, Perşembe 40, Cuma 60. Satış grafiği dikkatle incelenmektedir.',
          'Buna göre satışların bir önceki güne göre en fazla artış gösterdiği gün hangisidir?',
          '{"A":"Salı","B":"Çarşamba","C":"Perşembe","D":"Cuma"}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Günlük artışları hesaplayın: Salı (35 - 20 = +15), Çarşamba (düşüş), Perşembe (40 - 25 = +15), Cuma (60 - 40 = +20). En büyük artış +20 ile Cuma''dır.',
          'Salı artışı: 35 - 20 = 15. Çarşamba: 25 - 35 = -10 (azalış). Perşembe: 40 - 25 = 15. Cuma: 60 - 40 = 20. En yüksek artış miktarı 20 adet ile Cuma günüdür.',
          '{"A":"Salı 15 adet artmıştır.","B":"Çarşamba günü satış azalmıştır.","C":"Perşembe 15 adet artmıştır, Cuma''nın (20) gerisindedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000054'::uuid,
          54,
          'LGS-MAT-T4-05',
          'Bir mimari projede kenar uzunluğu 2025 metre olan kare şeklindeki bir arazinin tam merkezine, kenar uzunluğu 2023 metre olan kare biçiminde bir su havuzu inşa ediliyor. Arazinin havuz dışında kalan peyzaj yeşil alanı ise çimlendirilecektir.',
          'Buna göre çimlendirilecek yeşil peyzaj alanının metrekare cinsinden değeri (2025² - 2023²) kaçtır?',
          '{"A":"4048","B":"8096","C":"8092","D":"16192"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki kare farkı özdeşliği: a² - b² = (a - b)(a + b). Burada (2025 - 2023)(2025 + 2023) = 2 * 4048 = 8096.',
          'a² - b² = (a - b)(a + b). 2025 - 2023 = 2. 2025 + 2023 = 4048. Sonuç = 2 * 4048 = 8096.',
          '{"A":"4048 sadece toplamdır, fark olan 2 ile çarpmayı unutan yanılgıdır.","C":"8092 işlem hatasıdır.","D":"16192 gereksiz bir 2 katı almadır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000055'::uuid,
          55,
          'LGS-MAT-T4-06',
          'A sayısı iki basamaklı en küçük asal sayı, B sayısı ise rakamları farklı iki basamaklı en büyük asal sayıdır.',
          'Buna göre B - A farkı kaçtır?',
          '{"A":"86","B":"87","C":"88","D":"89"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki basamaklı en küçük asal sayı A = 11''dir. Rakamları farklı iki basamaklı en büyük asal sayı B = 97''dir. Fark = 97 - 11 = 86.',
          'İki basamaklı en küçük asal sayı 11''dir (A = 11). İki basamaklı en büyük asal sayı 97''dir ve rakamları (9 ve 7) birbirinden farklıdır (B = 97). Fark = 97 - 11 = 86.',
          '{"B":"87 sayısı 97 - 10 yanılgısıdır.","C":"88 sayısı 99 asal sayı sanıldığında ortaya çıkar.","D":"89 asal sayılarla yapılan hatalı çıkarma işlemidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000056'::uuid,
          56,
          'LGS-MAT-T4-07',
          'Koordinat düzleminde bir robotik sistemin hareket yörüngesi A(2, 4) ve B(8, 12) noktalarından geçen d doğrusu olarak modellenmiştir. Bu yörüngeye paralel hareket eden ve orijinden (0, 0) geçen d₂ doğrusu üzerinde apsisi 9 olan bir C hedef noktası bulunmaktadır.',
          'Bu geometrik modelleme kısıtına göre C noktasının ordinat değeri kaçtır?',
          '{"A":"10","B":"12","C":"14","D":"16"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: d doğrusunun eğimi m = (12 - 4) / (8 - 2) = 8 / 6 = 4/3. Paralel doğruların eğimleri eşittir; d₂ doğrusunun denklemi y = (4/3)x''tir. x = 9 için y = (4/3) * 9 = 12.',
          'd doğrusunun eğimi: m = (y₂ - y₁) / (x₂ - x₁) = (12 - 4) / (8 - 2) = 8 / 6 = 4/3. Paralel doğruların eğimleri eşit olduğundan d₂ doğrusunun eğimi de 4/3''tür. Orijinden geçtiği için denklemi y = (4/3)x''tir. x = 9 için y = (4/3) * 9 = 12 olur.',
          '{"A":"10 eğimin 1 alındığı yanılgıdır.","C":"14 işlem hatasıdır.","D":"16 eğimin ters (3/4 yerine 4/3 yerine başka oran) alınmasıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000057'::uuid,
          57,
          'LGS-FEN-01',
          'Fen bilimleri öğretmeni, özdeş iki el feneri ve özdeş iki termometre kullanarak karanlık bir laboratuvarda aşağıdaki deney düzeneğini kuruyor:
• 1. Düzenek: El feneri düz bir zemine dik (90°) açıyla tutuluyor ve aydınlanan dairesel alanın sıcaklığı 10 dakika sonra ölçülüyor.
• 2. Düzenek: El feneri aynı mesafeden eğik (30°) açıyla tutuluyor ve aydınlanan elips şeklindeki alanın sıcaklığı 10 dakika sonra ölçülüyor.
Deney sonucunda 1. düzenekteki termometrenin 2. düzenekten 8 °C daha yüksek bir sıcaklık gösterdiği kaydediliyor.',
          'Yapılan bu kontrollü deneyle ilgili aşağıdaki çıkarımlardan hangisi doğrudur?',
          '{"A":"Deneyde bağımsız değişken, aydınlanan yüzeyin başlangıç sıcaklığıdır.","B":"Güneş ışınlarının gelme açısı küçüldükçe birim yüzeye düşen ışık enerjisi miktarı artar.","C":"2. düzenekte aydınlanan alanın daha geniş olması, birim yüzeye aktarılan ısı enerjisinin daha az olduğunu kanıtlar.","D":"Deney sonucuna göre mevsimlerin oluşumunda Dünya''nın Güneş''e olan uzaklığının değişmesi belirleyicidir."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Açı eğikleştikçe alan genişler, birim yüzeye düşen enerji azalır.',
          '2. düzenekte ışık eğik açıyla geldiği için enerji daha geniş bir yüzeye dağılmıştır. Enerji dağıldığı için birim alana aktarılan ısı enerjisi azalmış ve sıcaklık artışı daha düşük kalmıştır.',
          '{"A":"Bağımsız değişken ışığın gelme açısıdır.","B":"Açı küçüldükçe birim yüzeye düşen enerji azalır.","D":"Güneş''e uzaklık mevsimlerde etkili değildir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000058'::uuid,
          58,
          'LGS-FEN-T1-01',
          'Dünya''nın Güneş etrafındaki dolanımı ve eksen eğikliği nedeniyle Güneş ışınlarının yeryüzüne düşme açısı yıl boyunca değişir. Birim yüzeye düşen ışık enerjisi miktarı arttıkça o bölgede sıcaklık artışı daha fazla olur.
Fen bilimleri öğretmeni, 21 Haziran tarihinde özdeş iki termometre ve özdeş ışık kaynakları kullanarak aşağıdaki iki aşamalı deneyi yapmıştır:
• 1. Düzenek: Işık kaynağı K termometresine 90°lik dik açıyla tutulmuş, aydınlanan alan dar (20 cm²) olmuş ve 10 dakika sonra sıcaklık artışı 15 °C olarak ölçülmüştür.
• 2. Düzenek: Işık kaynağı L termometresine 30°lik eğik açıyla tutulmuş, aydınlanan alan geniş (60 cm²) olmuş ve 10 dakika sonra sıcaklık artışı 5 °C olarak ölçülmüştür.
Ayrıca aynı 21 Haziran günü öğle saat 12.00''de Dünya üzerindeki X ve Y şehirlerinde bulunan özdeş 1 metre uzunluğundaki dikey çubukların gölge boyları ölçülmüştür. X şehrinde çubuğun gölgesi oluşmazken (gölge boyu = 0), Y şehrinde çubuğun gölge boyu 1,8 metre olarak ölçülmüştür.',
          'Yapılan deney düzeneği ve Dünya üzerindeki gözlemlere göre aşağıdaki çıkarımlardan hangisi doğrudur?',
          '{"A":"X şehri Kuzey Yarım Küre''de Yengeç Dönencesi üzerinde, Y şehri ise Güney Yarım Küre''de yer almaktadır.","B":"2. düzenekte aydınlanan alan daha geniş olduğu için birim yüzeye aktarılan ısı enerjisi 1. düzenekten daha fazladır.","C":"Y şehrinde birim yüzeye düşen Güneş enerjisi miktarı X şehrindekinden daha fazladır.","D":"21 Aralık tarihinde aynı saatte X şehrindeki gölge boyu Y şehrindekinden daha kısa olur."}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: 21 Haziran tarihinde Güneş ışınları Kuzey Yarım Küre''deki Yengeç Dönencesi''ne öğle vakti 90°lik dik açıyla düşer ve dik gelen ışınlar gölge oluşturmaz (gölge boyu = 0). Güney Yarım Küre''ye ise eğik açıyla geldiğinden gölge boyu uzundur. Işınlar dik geldikçe birim alana düşen enerji artar, sıcaklık daha çok yükselir.',
          '21 Haziran''da Güneş ışınları Yengeç Dönencesi''ne dik düşer ve öğle vakti gölge sıfırdır; bu nedenle X şehri Yengeç Dönencesi üzerindedir. Aynı tarihte Güney Yarım Küre kış mevsimini yaşar ve Güneş ışınları eğik açıyla geldiği için gölge boyu oldukça uzundur (1,8 m); bu da Y şehrinin Güney Yarım Küre''de olduğunu kesinleştirir (Doğru cevap A). 2. düzenekte aydınlanan alan genişlemesine rağmen birim yüzeye düşen enerji azalmıştır (B yanlış). X şehrinde ışınlar dik geldiğinden birim yüzeye düşen enerji Y''den fazladır (C yanlış). 21 Aralık''ta Güneş ışınları Oğlak Dönencesi''ne (Güney) dik gelir; bu tarihte Y şehrindeki gölge boyu X''ten daha kısa olur (D yanlış).',
          '{"B":"Aydınlanan alan genişledikçe toplam ışık enerjisi daha geniş alana dağıldığından birim yüzeye düşen enerji azalır.","C":"X şehrine ışınlar dik geldiği için birim yüzeye aktarılan enerji miktarı eğik açıyla gelen Y şehrinden çok daha fazladır.","D":"21 Aralık''ta Güneş ışınları Güney Yarım Küre''ye dik geleceği için Y şehrinde gölge boyu X şehrine göre daha kısa olur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000059'::uuid,
          59,
          'LGS-FEN-T1-02',
          'Hava sıcaklığındaki değişimler basınç farklarına yol açarak rüzgâr oluşumuna neden olur. Sıcaklığın yüksek olduğu bölgelerde hava molekülleri genleşerek yükselir ve Alçak Basınç (AB) alanı oluşur. Sıcaklığın düşük olduğu bölgelerde ise hava molekülleri sıkışarak alçalır ve Yüksek Basınç (YB) alanı oluşur. Rüzgâr, yatay yönde yüksek basınçtan alçak basınca doğru gerçekleşen hava hareketidir.
Aralarında 50 km mesafe bulunan K ve L kentlerinde aynı gün yapılan hava gözlemleri şöyledir:
• K Kenti: Hava sıcaklığı 14 °C''dir. Gökyüzü açıktır ve bulut bulunmamaktadır. Alçalıcı hava hareketleri etkilidir.
• L Kenti: Hava sıcaklığı 28 °C''dir. Gökyüzü yoğun bulutludur ve aralıklı sağanak yağış görülmektedir. Yükselici hava hareketleri etkilidir.
İki kent arasına yerleştirilen rüzgâr ölçüm istasyonunda rüzgâr tulumunun yönü incelenmiştir.',
          'K ve L kentlerindeki hava olayları ve rüzgâr oluşumu ile ilgili aşağıdaki ifadelerden hangisi kesinlikle doğrudur?',
          '{"A":"K kentinde alçak basınç alanı, L kentinde yüksek basınç alanı etkilidir.","B":"İki kent arasında esen rüzgârın yönü K kentinden L kentine doğrudur.","C":"L kentinde havanın yoğunluğu K kentine göre daha fazladır.","D":"K kentinde yağış görülme ihtimali L kentine göre daha yüksektir."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Rüzgârın yönünü bulmak için altın kural: Soğuk bölge = Yüksek Basınç (alçalıcı hava, açık gökyüzü); Sıcak bölge = Alçak Basınç (yükselici hava, bulutlu ve yağışlı gökyüzü). Rüzgâr daima soğuktan sıcağa, yani Yüksek Basınçtan Alçak Basınca (K''den L''ye) doğru eser.',
          'K kenti 14 °C olup soğuktur; hava yoğunluğu fazladır, alçalıcı hava hareketleri görülür ve Yüksek Basınç (YB) alanıdır. L kenti ise 28 °C olup sıcaktır; hava molekülleri yükselici hareket yapar, bulut ve yağış oluşturur ve Alçak Basınç (AB) alanıdır. Rüzgâr daima yatay yönde Yüksek Basınçtan Alçak Basınca doğru estiği için rüzgârın yönü K kentinden L kentine doğrudur (Doğru cevap B). A şıkkında basınç alanları ters verilmiştir. C şıkkında sıcak havada tanecikler genleştiği için L kentindeki hava yoğunluğu daha azdır. D şıkkında açık havalı K kentinde yağış ihtimali çok düşüktür.',
          '{"A":"Soğuk olan K kenti Yüksek Basınç alanı, sıcak olan L kenti ise Alçak Basınç alanıdır; şıkta kavramlar ters eşleştirilmiştir.","C":"Sıcak olan L kentinde hava genleşerek yükseldiği için hava yoğunluğu K kentine göre daha azdır.","D":"Alçalıcı hava hareketinin görüldüğü Yüksek Basınç alanlarında (K kenti) hava açık olup yağış ihtimali düşüktür."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000060'::uuid,
          60,
          'LGS-FEN-T1-03',
          'Hücre bölünmesi öncesinde DNA molekülü kendini hatasız olarak eşleyerek kalıtsal bilginin yeni hücrelere aktarılmasını sağlar. Bir DNA molekülünün kendini eşleme süreci ve bu süreçte sitoplazmadaki serbest nükleotid sayılarındaki değişim incelenmiştir.
Eşlenme sürecinde gerçekleşen aşamalar:
1. DNA''nın çift sarmal yapısı bir fermuar gibi açılarak iki iplik birbirinden ayrılır.
2. Sitoplazmada serbest halde bulunan nükleotidler çekirdek içerisine girer.
3. Ayrılan ipliklerin karşısına uygun nükleotidler (Adenin karşısına Timin, Guanin karşısına Sitozin) yerleşir.
4. Başlangıçtaki DNA molekülü ile nükleotid dizilimi tamamen aynı olan iki yeni DNA molekülü oluşur.
Aşağıdaki verilerde eşlenme sırasında sitoplazmada serbest bulunan deoksiriboz şekeri ve organik baz sayılarının değişimi verilmiştir:
• Deoksiriboz şekeri: 1200 adetten 400 adede düşmüştür (800 adet kullanılmıştır).
• Adenin bazı: 300 adetten 100 adede düşmüştür (200 adet kullanılmıştır).
• Guanin bazı: 350 adetten 150 adede düşmüştür (200 adet kullanılmıştır).',
          'Bu bilgilere ve eşlenme sürecine göre aşağıdaki değerlendirmelerden hangisi yanlıştır?',
          '{"A":"DNA eşlenmesi sırasında sitoplazmadan çekirdeğe toplam 800 adet inorganik fosfat molekülü geçmiştir.","B":"Yeni ipliklerin sentezi için sitoplazmadan çekilen serbest Sitozin bazı sayısı 200 adettir.","C":"Eşlenme sürecinde sitoplazmadaki serbest deoksiriboz şekeri ve fosfat miktarı artış gösterirken çekirdekteki DNA miktarı azalmıştır.","D":"Oluşan iki yeni DNA molekülünün her birinde biri ana DNA''ya ait eski, diğeri ise yeni sentezlenen iplik bulunur."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: DNA eşlenmesinde yeni zincirlerin kurulabilmesi için sitoplazmadaki serbest nükleotidler (şeker, fosfat, baz) çekirdeğe girer. Bu nedenle sitoplazmadaki serbest nükleotid miktarı AZALIR, çekirdekteki DNA ve nükleotid miktarı ise İKİ KATINA çıkar.',
          'Eşlenme sırasında sitoplazmadaki serbest nükleotidler çekirdek içerisine alındığı için sitoplazmadaki serbest fosfat, şeker ve organik baz miktarı azalır; çekirdekteki genetik madde (DNA) miktarı ise 2 katına çıkar. Bu nedenle sitoplazmadaki serbest şeker ve fosfat miktarının arttığını, çekirdekteki DNA miktarının azaldığını iddia eden C seçeneği kesinlikle yanlıştır (Doğru cevap C).
Her nükleotidde 1 şeker ve 1 fosfat olduğundan 800 şeker kullanılmışsa 800 fosfat kullanılmıştır (A doğru). Guanin (200) kullanıldıysa karşısına 200 Sitozin kullanılır (B doğru). Eşlenme yarı korunumlu (semikonservatif) gerçekleşir; yeni DNA''ların bir ipliği eski, bir ipliği yenidir (D doğru).',
          '{"A":"Her nükleotidin yapısında bir deoksiriboz şekeri ve bir fosfat grubu bulunduğundan kullanılan fosfat sayısı şeker sayısına (800) eşittir, ifade doğrudur.","B":"DNA çift sarmalında Guanin karşısına Sitozin eşleştiği için kullanılan Guanin sayısı (200) kadar Sitozin bazı (200) harcanır, ifade doğrudur.","D":"DNA kendini yarı korunumlu eşler; oluşan her bir yeni DNA molekülünün bir ipliği orijinal ana DNA''ya aitken diğeri yeni oluşturulan ipliktir, ifade doğrudur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000061'::uuid,
          61,
          'LGS-FEN-T1-04',
          'Bezelyelerde mor çiçek rengi aleli (M), beyaz çiçek rengi aleline (m) baskındır. Bir araştırmacı, çiçek rengi bakımından fenotipi mor olan iki bezelye bitkisini (1. ve 2. ata bezelyeler) çaprazlamış ve elde edilen 1. kuşaktaki (F1) bezelyelerin çiçek renklerini kaydetmiştir.
Deney sonuçları:
• F1 kuşağında toplam 400 adet bezelye bitkisi elde edilmiş; bunların 302 tanesi mor çiçekli, 98 tanesi ise beyaz çiçekli olmuştur (yaklaşık %75 mor, %25 beyaz oranı).
Araştırmacı daha sonra F1 kuşağında oluşan beyaz çiçekli bezelyelerden biri ile ata bezelyelerden birini çaprazlayarak 2. kuşağı (F2) elde etmiştir.',
          'Yapılan bu çaprazlamalar ve sonuçlarına göre aşağıdaki ifadelerden hangisine kesinlikle ulaşılamaz?',
          '{"A":"Çaprazlanan 1. ve 2. ata bezelyelerin genotipleri heterozigottur (Mm x Mm).","B":"F1 kuşağında oluşan mor çiçekli bezelyelerin tamamı homozigot baskın (MM) genotipe sahiptir.","C":"F2 kuşağında beyaz çiçekli bezelye oluşma olasılığı %50''dir.","D":"Beyaz çiçek alelinin fenotipte etkisini gösterebilmesi için homozigot çekinik (mm) durumda olması gerekir."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İki mor çiçekli bezelyeden beyaz çiçekli bezelye oluşması, her iki ata bireyin de çekinik geni taşıdığını (Mm x Mm) kanıtlar. Mm x Mm çaprazlamasında F1 kuşağında oluşan mor çiçeklilerin 1/3''ü homozigot (MM), 2/3''ü ise heterozigottur (Mm). Yani mor çiçeklilerin "tamamı homozigottur" ifadesi kesinlikle yanlıştır.',
          'Ata bezelyelerin her ikisi de mor çiçekli olmasına rağmen yavrularında beyaz çiçek (mm) görülmesi, her iki atanın da heterozigot (Mm) olduğunu ispatlar (A doğru). Mm x Mm çaprazlamasında genotip dağılımı 1 MM : 2 Mm : 1 mm şeklindedir. Dolayısıyla oluşan mor çiçekli bezelyelerin 1/3''ü homozigot (MM), 2/3''ü ise heterozigottur (Mm); tamamının homozigot olması imkansızdır (B ulaşılamaz ve yanlıştır, doğru cevap B). F1''deki beyaz çiçekli (mm) ile ata bezelyelerden biri (Mm) çaprazlandığında (Mm x mm) yavruların %50''si Mm (mor), %50''si mm (beyaz) olur (C doğru). Çekinik aleller ancak homozigot (mm) durumda fenotipte etkisini gösterir (D doğru).',
          '{"A":"İki mor bezelyeden beyaz yavru çıkması ata bireylerin heterozigot (Mm) olduğunu kesin olarak kanıtlar.","C":"Mm x mm çaprazlamasından %50 Mm (mor) ve %50 mm (beyaz) yavru elde edilir, ifade doğrudur.","D":"Çekinik genler baskın gen bulunmadığında (yani homozigot durumda) fenotipte ortaya çıkar, temel kalıtım kuralıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000062'::uuid,
          62,
          'LGS-FEN-T1-05',
          'Bir bölgenin 40 yıllık sıcaklık ve yağış ortalamaları incelenerek o bölgede yazların sıcak ve kurak, kışların ılık ve yağışlı geçtiği belirlenmiştir.',
          'Bu çalışma ve ulaşılan sonuç doğrudan hangi bilim dalının alanına girer?',
          '{"A":"Meteoroloji","B":"Klimatoloji","C":"Jeoloji","D":"Astronomi"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: 35-40 yıllık uzun süreli atmosferik ortalamaları inceleyen bilim dalının Klimatoloji (iklim bilimi) olduğunu hatırlayınız.',
          'Geniş bir bölgede uzun yıllar boyunca devam eden hava olaylarının ortalamasını inceleyen bilim dalı Klimatolojidir (İklim bilimi). Meteoroloji ise anlık ve dar alanlı hava tahminleriyle ilgilenir.',
          '{"A":"Meteoroloji günlük ve anlık hava tahminlerini yapar.","C":"Jeoloji yer kabuğunun yapısını ve kayaçları inceler.","D":"Astronomi gök cisimlerini ve uzayı inceler."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000063'::uuid,
          63,
          'LGS-FEN-T1-06',
          'Yengeç Dönencesi üzerinde dik konumlandırılmış özdeş bir cismin öğle vaktindeki (12.00) gölge boyu yıl boyunca hassas cihazlarla ölçülmüştür. 21 Haziran tarihinde cismin gölge boyunun sıfır olduğu gözlenmiştir.',
          'Buna göre aynı cismin gölge boyunun yıl içindeki en fazla uzunluk değerine ulaştığı tarih aşağıdakilerden hangisidir?',
          '{"A":"21 Mart","B":"23 Eylül","C":"21 Aralık","D":"4 Ocak"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Gölge boyu Güneş ışınlarının geliş açısıyla ters orantılıdır. Işık ne kadar eğik gelirse gölge o kadar uzun olur. Kuzey Yarım Küre''deki Yengeç Dönencesi''ne Güneş ışınlarının en eğik açıyla geldiği kış gündönümü tarihi 21 Aralık''tır.',
          'Yengeç Dönencesi Kuzey Yarım Küre''dedir. 21 Haziran''da dik açı (90°) ile geldiği için gölge sıfırdır. En eğik açıyla geldiği tarih ise kış başlangıcı olan 21 Aralık''tır; dolayısıyla gölge boyu en uzun 21 Aralık''ta olur.',
          '{"A":"21 Mart ekinoksunda ışınlar dönenceye 66.5° açıyla gelir, en eğik değildir.","B":"23 Eylül de ekinokstur, gölge en uzun olmaz.","D":"4 Ocak günberi (Güneş''e en yakın) tarihidir ancak mevsimsel açıya etkisi yok denecek kadar azdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000064'::uuid,
          64,
          'LGS-FEN-04',
          'Fen bilimleri öğretmeni, sıvı basıncını etkileyen değişkenleri incelemek için içi renklendirilmiş su ile dolu U borusu, esnek hortum ve ucuna esnek balon gerilmiş bir huniden oluşan manometre düzeneğini hazırlamıştır. Huninin daldırıldığı sıvının uyguladığı basınç arttıkça U borusundaki sıvı kolları arasındaki seviye farkı (h) artmaktadır.
Öğretmen, özdeş beherlerde bulunan sıvılarla aşağıdaki iki aşamalı deneyi gerçekleştirmiştir:
• 1. Aşama: Huni, yoğunluğu d olan saf su bulunan behere önce h derinliğine daldırılmış ve U borusundaki seviye farkı h1 olarak ölçülmüştür. Ardından huni aynı kapta 2h derinliğine daldırılmış ve seviye farkının h2 = 2h1 olduğu gözlenmiştir.
• 2. Aşama: Huni, aynı sıcaklıkta yoğunluğu 2d olan gliserin bulunan behere h derinliğine daldırılmış ve U borusundaki seviye farkı h3 olarak ölçülmüştür. Ölçüm sonucunda h3 = h2 olduğu tespit edilmiştir.',
          'Yapılan bu kontrollü deney ve elde edilen sonuçlara göre aşağıdaki yargılardan hangisi kesinlikle doğrudur?',
          '{"A":"1. aşamada sıvının yoğunluğu sabit tutulduğunda, sıvı derinliği ile sıvı basıncının doğru orantılı olduğu kanıtlanmıştır.","B":"2. aşamada gliserine daldırılan huninin derinliği iki katına çıkarılırsa U borusundaki seviye farkı h1 değerine eşit olur.","C":"Deneyin 1. aşamasındaki bağımsız değişken U borusundaki seviye farkı, bağımlı değişken ise huninin daldırılma derinliğidir.","D":"U borusundaki seviye farkının değişimi, manometrede kullanılan U borusunun kesit alanına bağlıdır."}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Kontrollü deneylerde hipotez ve değişken analizine dikkat ediniz: 1. aşamada sıvı cinsi (yoğunluk d) sabit tutulmuş, derinlik h''den 2h''ye çıkarıldığında manometredeki sıvı farkı 2 katına çıkmıştır. Bu durum derinlik-basınç doğru orantısını açıkça ispatlar.',
          '1. aşamada sabit tutulan değişken sıvı yoğunluğu (saf su), bağımsız değişken derinlik (h''den 2h''ye), bağımlı değişken ise sıvı basıncıdır (h1''den 2h1''e çıkmıştır). Derinlik 2 katına çıktığında seviye farkının da 2 katına çıkması (h2 = 2h1), sıvı basıncının derinlikle doğru orantılı olduğunu kesin olarak kanıtlar (Doğru cevap A). 2. aşamada gliserinin yoğunluğu 2d olduğu için derinlik 2 katına çıkarılırsa basınç 4 katına çıkar (B yanlış). 1. aşamada bağımsız değişken araştırmacının değiştirdiği derinliktir, seviye farkı bağımlı değişkendir (C yanlış). U borusundaki sıvı seviye farkı huninin ucundaki basınca bağlı olup U borusunun kesit alanına veya şekline bağlı değildir (D yanlış).',
          '{"B":"Gliserinde derinlik 2 katına çıkarılırsa basınç ve seviye farkı 2 kat daha artarak 4h1 olur, h1 değerine düşmez.","C":"Bağımsız değişken araştırmacının değiştirdiği (derinlik), bağımlı değişken ise bundan etkilenen sonuçtur (seviye farkı); kavramlar ters verilmiştir.","D":"Sıvı basıncı ve buna bağlı seviye farkı U borusunun kesit alanına veya şekline bağlı değildir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000065'::uuid,
          65,
          'LGS-FEN-05',
          'Sanayi tesislerinin yoğun olduğu bir sanayi bölgesinde ve sanayiden uzak kırsal bir ormanlık alanda bir ay boyunca toplanan yağmur suyu numuneleri ile göl sularının pH değerleri ölçülerek aşağıdaki tablo oluşturulmuştur:

• Sanayi Bölgesi: Yağmur Suyu pH = 4,2 | Göl Suyu Başlangıç pH = 7,4 | 1 Ay Sonraki Göl Suyu pH = 6,1
• Kırsal Orman Bölgesi: Yağmur Suyu pH = 6,5 | Göl Suyu Başlangıç pH = 7,6 | 1 Ay Sonraki Göl Suyu pH = 7,5

Ayrıca sanayi bölgesinden toplanan yağmur suyu örneğinin bir kısmı mermer heykel parçası üzerine, bir kısmı ise cam kaba damlatılmıştır. Deney sonucunda mermer parçası üzerinde aşınma ve gaz çıkışı gözlenirken, cam kapta herhangi bir değişim meydana gelmemiştir.',
          'Bu gözlem ve deney sonuçlarına dayanarak yapılan aşağıdaki çıkarımlardan hangisi doğrudur?',
          '{"A":"Kırsal bölgedeki yağmur suyunun asidik özelliği sanayi bölgesindekinden daha fazladır.","B":"Sanayi bölgesindeki asit yağmurları göl ekosisteminin asitliğini artırarak pH değerinin nötr seviyeden uzaklaşmasına neden olmuştur.","C":"Asidik yağışlar tüm kap türlerine ve temas ettiği malzemelere eşit derecede aşındırıcı etki gösterir.","D":"Fabrika bacalarından salınan kükürt dioksit ve azot dioksit gazları göl suyunun bazikleşmesini sağlamıştır."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: pH ölçeğinde 7 nötrdür. 7''den 0''a yaklaşıldıkça asitlik artar. Asitler mermer ve metalleri aşındırırken cam ve plastiğe zarar vermez. Sanayi bölgesinde göl suyu pH''sinin 7,4''ten 6,1''e düşmesi asitleşmeyi ve nötrden uzaklaşmayı kanıtlar.',
          'Sanayi bölgesindeki göl suyu pH''si bir ayda 7,4''ten 6,1''e gerilemiştir. pH''nin 7''nin altına inmesi ortamın asitleştiğini ve göl ekosisteminin olumsuz etkilendiğini açıkça ortaya koyar (Doğru cevap B). A şıkkında pH 4,2 olan sanayi yağmuru çok daha kuvvetli asidiktir. C şıkkında asitler cam kaba etki etmemiştir. D şıkkında kükürt ve azot oksitler suyu bazikleştirmeyip asitlendirir.',
          '{"A":"pH değeri küçüldükçe asitlik kuvveti artar; pH 4,2 olan sanayi suyu pH 6,5 olan sudan çok daha kuvvetli asidiktir.","C":"Asitler cam ve plastik kaplara etki etmezken mermeri aşındırır; aşındırıcı etki malzemeye göre farklılaşır.","D":"Fosil yakıt gazları göl suyunu bazikleştirmez, suyun pH değerini düşürerek asitlendirir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000066'::uuid,
          66,
          'LGS-FEN-T2-01',
          'Katı maddeler ağırlıklarından dolayı bulundukları yüzeye bir kuvvet uygular ve bu kuvvetin etkisiyle basınç oluşturur. Katı basıncı (P), cismin ağırlığı (G) ile doğru, yere temas eden yüzey alanı (S) ile ters orantılıdır (P = G / S).
Ağırlıkları ve boyutları özdeş, homojen yapılı 3 adet dikdörtgenler prizması şeklindeki tuğla (G ağırlığında, geniş taban alanı 2S, dar taban alanı S) kullanılarak sünger zemin üzerinde üç farklı durum oluşturulmuştur:
• 1. Durum: Tek bir tuğla dar yüzeyi (S) üzerine süngere bırakılmıştır. Süngerdeki batma miktarı h1 olarak ölçülmüştür.
• 2. Durum: Aynı tuğlanın üzerine özdeş bir tuğla daha konulmuş (toplam ağırlık 2G), taban alanı yine dar yüzey (S) olacak şekilde süngere bırakılmıştır. Süngerdeki batma miktarı h2 olarak ölçülmüştür.
• 3. Durum: 1. durumdaki tek tuğla, tabanına dik olacak şekilde tam ortasından dikey olarak kesilmiş ve yarısı atılmıştır. Kalan yarım tuğla (ağırlığı G/2, taban alanı S/2) sünger zemin üzerine bırakılmış ve batma miktarı h3 olarak ölçülmüştür.',
          'Süngerdeki batma miktarlarının zemine uygulanan katı basıncıyla doğru orantılı olduğu bilindiğine göre, ölçülen batma miktarları (h1, h2, h3) arasındaki ilişki aşağıdakilerin hangisinde doğru verilmiştir?',
          '{"A":"h2 > h1 = h3","B":"h2 > h1 > h3","C":"h1 = h2 = h3","D":"h1 > h2 > h3"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: LGS''nin en klasik katı basıncı tuzağı: Düzgün katı bir cisim tabanına dik olarak kesildiğinde hem ağırlığı (G) hem de yüzey alanı (S) aynı oranda azalır. G/S oranı değişmediği için zemine uygulanan basınç DEĞİŞMEZ! Dolayısıyla P1 = P3 olur. 2. durumda ise ağırlık 2 katına çıkıp yüzey sabit kaldığı için basınç 2 katına çıkar (P2 = 2P1).',
          '1. Durum: Basınç P1 = G / S -> Batma miktarı h1''dir.
2. Durum: Yüzey alanı S sabit kalırken ağırlık 2G''ye çıkmıştır; basınç P2 = 2G / S = 2P1 olur. Bu nedenle batma miktarı en fazladır (h2 = 2h1).
3. Durum: Tuğla tabanına dik kesilip yarısı atıldığında kalan parçanın ağırlığı G/2, taban alanı S/2 olur. Basınç P3 = (G/2) / (S/2) = G / S = P1 olur. Basınç değişmediği için batma miktarı 1. durumla aynı kalır (h3 = h1).
Sonuç olarak batma miktarları arasındaki ilişki h2 > h1 = h3 şeklindedir (Doğru cevap A).',
          '{"B":"Ağırlığı azalan 3. tuğlanın taban alanı da aynı oranda (yarıya) indiği için birim yüzeye düşen kuvvet değişmez; h1 > h3 olamaz, h1 = h3''tür.","C":"2. durumda temas yüzeyi sabitken ağırlık iki katına çıktığından basınç artar; tüm durumların eşit olması mümkün değildir.","D":"Ağırlık arttıkça basınç artacağından h2''nin en küçük olması fizik yasalarına aykırıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000067'::uuid,
          67,
          'LGS-FEN-T2-02',
          'Atmosferi oluşturan gazlar, ağırlıkları ve tanecik hareketleri nedeniyle temas ettikleri tüm yüzeylere her yönde bir basınç uygular. Buna "açık hava basıncı" (atmosfer basıncı) denir.
Bir öğretmen, fen laboratuvarında açık hava basıncının varlığını kanıtlamak için öğrencilerine aşağıdaki deneyi uygulamıştır:
1. Adım: İnce cidarlı boş bir metal yağ tenekesinin içerisine bir miktar su konulup ısıtıcı üzerinde kaynatılmıştır. Kaynama sırasında su buharı teneke içindeki havanın büyük kısmını dışarı sürüklemiştir.
2. Adım: Teneke ocaktan alınmış, vakit kaybetmeden tenekenin kapağı hava almayacak şekilde sıkıca kapatılmıştır.
3. Adım: Kapağı kapalı tenekenin üzerine buzlu soğuk su dökülmüştür.
Gözlem: Soğuk su dökülür dökülmez metal tenekenin içe doğru şiddetle ezildiği ve büzüştüğü gözlenmiştir.',
          'Metal tenekenin içe doğru ezilmesiyle sonuçlanan bu deneyle ilgili aşağıdaki yorumlardan hangisi doğrudur?',
          '{"A":"Tenekenin ezilmesinin nedeni, soğuk su döküldüğünde açık hava basıncının aniden artış göstermesidir.","B":"Teneke içindeki su buharının yoğuşması sonucu iç gaz basıncı açık hava basıncının altına düşmüş ve dış basınç tenekeyi ezmiştir.","C":"Deney açık hava basıncının deniz seviyesinden yukarılara çıkıldıkça arttığını kanıtlar.","D":"Tenekenin kapağı açılırsa iç basınç tamamen sıfırlanacağı için teneke eski şekline kendiliğinden geri döner."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İçe çökme/büzüşme deneylerinin mantığı: Başlangıçta iç basınç = dış basınçtır. Soğuk su döküldüğünde teneke içindeki su buharı aniden yoğuşarak sıvıya dönüşür ve gaz tanecik sayısı/basıncı dramatik biçimde düşer (P_iç < P_dış). Dışarıdaki açık hava basıncı iç basınçtan daha büyük hale geldiği için tenekeyi içeri doğru büzer.',
          'Teneke ısıtıldığında içerisindeki havanın yerini su buharı alır. Kapak kapatılıp üzerine soğuk su döküldüğünde su buharı hızla yoğuşarak sıvı suya dönüşür. Kapalı kapta gaz miktarının aniden azalması sonucu tenekenin iç basıncı çok düşük bir değere geriler. Dışarıdaki açık hava basıncı değişmediği halde tenekenin iç basıncından çok daha büyük konuma gelir (P_açıkhava > P_iç). Dış basıncın dengelenemeyen bu kuvveti tenekeyi içeri doğru çökerterek ezer (Doğru cevap B). A şıkkında açık hava basıncı ani bir artış göstermez, sabit kalır. C şıkkında bu deney açık hava basıncının yükseklikle değişimini değil varlığını gösterir. D şıkkında metallerdeki kalıcı deformasyon kendiliğinden düzelmez ve hava girince iç basınç açık hava basıncına eşitlenir, sıfırlanmaz.',
          '{"A":"Soğuk su dökülmesi atmosferin açık hava basıncını artırmaz; açık hava basıncı ortam koşullarında sabittir, azalan tenekenin iç basıncıdır.","C":"Deney tek bir yükseklikte gerçekleştirilmiştir, yükseklikle açık hava basıncının değişimini test eden bir düzenek değildir.","D":"Kapak açıldığında teneke içine hava dolarak iç basınç açık hava basıncına eşitlenir, basınç sıfırlanmaz ve büzülen metal kendiliğinden düzelmez."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000068'::uuid,
          68,
          'LGS-FEN-T2-03',
          'Maddenin yalnızca dış görünüşünde (şekil, boyut, fiziksel hâl) meydana gelen ve maddenin kimliğini değiştirmeyen olaylara "fiziksel değişim", maddenin iç yapısının değişerek yeni özellikte maddelerin oluştuğu olaylara ise "kimyasal değişim" denir.
Bir öğrenci grubu kapalı ve sızdırmaz iki ayrı kapta aşağıdaki deneyleri gerçekleştirmiş ve hassas terazi ile kütle ölçümleri yapmıştır:
• 1. Deney Düzeneği: Ağzı sıkıca kapalı bir cam kapta 100 gram katı buz parçası bulunmaktadır. Terazi 100 gramı göstermektedir. Kap ısıtılmış, buz tamamen eriyerek sıvı suya dönüşmüş ve bir kısmı buharlaşmıştır. Buharlaşan su kapalı kap içinde kalmıştır. Terazi tekrar tartıldığında 100 gram gösterdiği, maddenin kimlik özelliğinin (bağ yapısının) değişmediği belirlenmiştir.
• 2. Deney Düzeneği: İçinde 80 gram sirke (asit çözeltisi) bulunan cam erlenmayerin ağzına, içinde 20 gram karbonat (bazik tuz) bulunan esnek bir balon hava almayacak şekilde takılmıştır. Düzenek terazide tartıldığında toplam kütle 100 gram gelmiştir. Balon dikleştirilerek karbonat sirkenin içine dökülmüştür. Sıvıda yoğun gaz kabarcıkları çıkmış, kabın tabanı soğumuş, balon şişmiş ve kapta yeni maddeler oluşmuştur. Tepkime tamamlandığında terazi yeniden tartılmış ve yine 100 gram ölçülmüştür.',
          'Yapılan bu iki deney ve elde edilen gözlem sonuçlarına dayanarak aşağıdaki çıkarımlardan hangisi yapılamaz?',
          '{"A":"1. deneyde hal değişimi gerçekleşmiş olup fiziksel bir değişimdir; atomlar arası kimyasal bağlar kopmamıştır.","B":"2. deneyde gaz çıkışı ve yeni madde oluşumu kimyasal bir tepkime gerçekleştiğini gösterir.","C":"Her iki deneyde de kapalı sistemlerde kütlenin korunduğu kanıtlanmıştır.","D":"2. deneyde gaz çıkışı nedeniyle tepkime sonunda kapta bulunan atomların sayısı ve çeşidi başlangıçtakinden farklıdır."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Kimyasal tepkimenin değişmez kanunları: Kimyasal tepkimelerde yeni maddeler oluşur, bağlar kırılır ve yeni bağlar kurulur; ANCAK atom çeşidi, atom sayısı ve toplam kütle HİÇBİR ZAMAN DEĞİŞMEZ, daima korunur!',
          'Kimyasal tepkimelerde giren maddelerdeki atomlar yeniden düzenlenerek ürünleri oluşturur. Tepkimeye giren atomların cinsi (çeşidi) ve toplam sayısı kesinlikle değişmez ve korunur. Bu nedenle 2. deneyde atomların sayısı ve çeşidinin farklılaştığını iddia eden D seçeneği temel kimya yasalarına aykırıdır (Ulaşılamaz olan seçenek D''dir).
1. deneyde buzun erimesi ve buharlaşması saf bir hal değişimidir, fizikseldir (A doğru). 2. deneyde gaz çıkışı ve kabın tabanının soğuması kimyasal tepkimenin kanıtıdır (B doğru). Her iki deneyde de başlangıç kütlesi (100 g) ile son kütle (100 g) eşit kaldığından kapalı sistemde kütlenin korunduğu ispatlanmıştır (C doğru).',
          '{"A":"Hal değişimleri (erime, buharlaşma) fiziksel değişimdir ve molekül içi bağlar kopmaz, ifade doğrudur.","B":"Gaz çıkışı, çökelek oluşumu, ısı ve renk değişimi kimyasal tepkimelerin tipik göstergeleridir, ifade doğrudur.","C":"Kapalı kaplarda gerçekleşen tüm fiziksel ve kimyasal süreçlerde toplam kütle daima korunur, terazi ölçümleri de bunu doğrular."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000069'::uuid,
          69,
          'LGS-FEN-T2-04',
          'Periyodik sistemde elementler artan atom numaralarına (proton sayılarına) göre dizilir. Benzer kimyasal özellik gösteren elementler genellikle aynı düşey sütunda (grup) yer alır. Elementler metaller, ametaller, yarı metaller ve soygazlar olarak sınıflandırılır.
Periyodik sistemin ilk 18 elementi arasından seçilen K, L, M ve N elementleri ile ilgili şu bilgiler verilmiştir:
• K Elementi: 1. periyot 1A grubunda bulunur. Oda koşullarında gaz haldedir ve ametal özellik gösterir.
• L Elementi: Atom numarası 2''dir. Son katmanında 2 elektron bulunmasına rağmen kararlı yapıda olduğundan periyodik sistemin en sağındaki 8A grubunda yer alır.
• M Elementi: Isı ve elektriği iyi iletir, tel ve levha haline getirilebilir. Yüzeyi parlaktır ve 3. periyot 2A grubunda yer alır.
• N Elementi: M elementi ile aynı periyotta yer alır. Yüzeyi mattır, kırılgandır (tel ve levha haline getirilemez) ve oda koşullarında gaz haldedir (3. periyot 7A grubu).',
          'Verilen bilgilere ve periyodik sistemdeki kurallara göre aşağıdaki ifadelerden hangisi yanlıştır?',
          '{"A":"K elementi 1A grubundaki alkali metallerle aynı grupta bulunmasına rağmen bir ametaldir (Hidrojen).","B":"L elementi soygazdır ve kararlı elektron dizilimine sahip olduğu için kimyasal tepkimelere girme eğilimi göstermez (Helyum).","C":"M elementi ile N elementi arasında elektron ortaklaşması sonucu kovalent bağlı bir bileşik oluşur.","D":"M elementi metal sınıfında, N elementi ise ametal sınıfında yer almaktadır."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Metal ve ametal atomları arasında kimyasal bağ oluşurken ametaller elektron ortaklaşması yapmaz; metaller elektron VERİR, ametaller elektron ALIR ve İYONİK bağlı bileşik oluşur. Elektron ortaklaşması yalnızca ametal-ametal atomları arasında (kovalent bağ) gerçekleşir.',
          'M elementi 3. periyot 2A grubunda bulunan Magnezyum (metal), N elementi ise 3. periyot 7A grubunda bulunan Klor (ametal) elementidir. Metaller ile ametaller tepkimeye girdiğinde metal elektron verir (katyon), ametal elektron alır (anyon) ve aralarında elektron alışverişine dayalı İYONİK BAĞLI bileşik oluşur. "Elektron ortaklaşması sonucu kovalent bağlı bileşik oluşur" ifadesi yanlıştır (Doğru cevap C).
K elementi Hidrojen olup 1A grubundaki tek ametaldir (A doğru). L elementi Helyum''dur; değerlik elektron sayısı 2 olmasına rağmen 8A soygazıdır (B doğru). M metal, N ise ametaldir (D doğru).',
          '{"A":"1A grubunun ilk elementi Hidrojen bir ametaldir; grubundaki diğer elementler metal olduğu için bu durum periyodik sistemin en önemli istisnasıdır.","B":"Helyum (atom no 2) tek katmanında 2 elektron bulundurur (dublet kuralı), soygazdır ve tepkimeye girmez.","D":"M elementi parlak ve tel-levha haline gelen bir metaldir; N elementi ise mat, kırılgan bir ametaldir, sınıflandırma doğrudur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000070'::uuid,
          70,
          'LGS-FEN-T2-05',
          'Birbirine karışmayan d₁ ve d₂ yoğunluklu sıvılar özdeş kollara sahip bir U borusu düzeneğinde dengelenmiştir. U borusunun sol kolundaki d₁ sıvısının yüksekliği 15 cm, sağ kolundaki d₂ sıvısının denge çizgisi üzerindeki yüksekliği ise 10 cm olarak ölçülmüştür.',
          'Bu denge modellemesine göre sıvıların yoğunlukları oranı (d₁ / d₂) en fazla kaçtır?',
          '{"A":"2/3","B":"3/2","C":"1/2","D":"4/5"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Denge seviyesindeki sıvı basınçları eşittir: P₁ = P₂ -> h₁ * d₁ * g = h₂ * d₂ * g -> 15 * d₁ = 10 * d₂ -> d₁ / d₂ = 10 / 15 = 2/3.',
          'Tabandaki denge çizgisinde basınçlar eşittir. h₁ * d₁ = h₂ * d₂ bağıntısından 15 * d₁ = 10 * d₂ yazılır. Buradan d₁ / d₂ = 10 / 15 = 2/3 bulunur.',
          '{"B":"3/2 ters oran hatasıdır (d₂ / d₁).","C":"1/2 yüksekliklerin yarı yarıya sanılmasıdır.","D":"4/5 işlem hatasıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000071'::uuid,
          71,
          'LGS-FEN-06',
          'Ağırlığı ve sürtünmesi ihmal edilen eşit bölmelendirilmiş homojen çubuklar ve özdeş P yükleri kullanılarak üç farklı kaldıraç düzeneği hazırlanmıştır:
• 1. Düzenek (Çift taraflı kaldıraç): Destek noktası ortada, P yükü desteğe 1 birim uzaklıkta, F1 uygulanan kuvvet ise desteğe 3 birim uzaklıktadır.
• 2. Düzenek (Yükün ortada olduğu tek taraflı kaldıraç): Destek bir uçta, P yükü desteğe 2 birim uzaklıkta, F2 kuvveti desteğe 4 birim uzaklıktadır.
• 3. Düzenek (Kuvvetin ortada olduğu tek taraflı kaldıraç): Destek bir uçta, F3 kuvveti desteğe 1 birim uzaklıkta, P yükü desteğe 3 birim uzaklıktadır.
Tüm düzenekler yatay dengede olduğuna göre uygulanan kuvvetler ve sağladıkları mekanik avantajlar karşılaştırılmıştır.',
          'Bu kaldıraç düzenekleri ile ilgili olarak aşağıdaki ifadelerden hangisi yanlıştır?',
          '{"A":"1. düzenekte kuvvet kolu yük kolundan büyük olduğu için 3 kat kuvvet kazancı sağlanmıştır.","B":"2. düzenekte kuvvet kazancı vardır ve uygulanan F2 kuvveti P yükünün ağırlığından küçüktür.","C":"3. düzenek kuvvetten kayıp vererek yoldan kazanç elde etmek amacıyla kullanılır.","D":"Düzenekler arasında yapılan işten en çok kazanç sağlayan düzenek 1. düzenektir."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: MEB Basit Makineler Temel İlkesi: Hiçbir basit makinede işten veya enerjiden kazanç sağlanamaz. Yalnızca kuvvetten veya yoldan kazanç sağlanabilir ya da iş yapma kolaylığı elde edilir.',
          'Kaldıraçlar dahil hiçbir basit makinede işten veya enerjiden kazanç sağlanamaz. Yapılan iş aynı kalır; sadece uygulanan kuvvetin büyüklüğü, yönü veya yol değişir. Bu nedenle 1. düzeneğin işten kazanç sağladığını öne süren D seçeneği temel fizik ilkelerine ve MEB kazanımlarına aykırıdır (Yanlış olan seçenek D''dir).
1. Düzenek: Kuvvet Kolu = 3, Yük Kolu = 1 -> Kuvvet Kazancı = 3 (F1 = P/3, doğru).
2. Düzenek: Kuvvet Kolu = 4, Yük Kolu = 2 -> Kuvvet Kazancı = 2 (F2 = P/2 < P, doğru).
3. Düzenek: Kuvvet Kolu = 1, Yük Kolu = 3 -> Yoldan kazanç, kuvvetten kayıp (F3 = 3P, doğru).',
          '{"A":"1. düzenekte F1 x 3 = P x 1 olduğundan F1 = P/3''tür ve 3 kat kuvvet kazancı vardır, ifade doğrudur.","B":"2. düzenekte F2 x 4 = P x 2 olduğundan F2 = P/2''dir; kuvvet yükten küçük olup kuvvet kazancı vardır, ifade doğrudur.","C":"3. düzenekte kuvvet ortadadır; kuvvet kolu yük kolundan küçük olduğundan yoldan kazanç, kuvvetten kayıp vardır, ifade doğrudur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000072'::uuid,
          72,
          'LGS-FEN-07',
          'Işık geçiren, hava sızdırmaz özdeş üç cam fanus kullanılarak 25 °C oda sıcaklığında aşağıdaki kontrollü deney düzenekleri kurulmuştur:
• 1. Fanus: Yeşil bir saksı bitkisi, kireç suyu (kireç suyu karbondioksit varlığında bulanır) ve sürekli beyaz ışık veren lamba.
• 2. Fanus: Yeşil bir saksı bitkisi, canlı bir fare, kireç suyu ve sürekli beyaz ışık veren lamba.
• 3. Fanus: Yeşil bir saksı bitkisi, kireç suyu konularak fanusun üzeri tamamen ışık geçirmeyen siyah bir örtü ile kapatılmıştır.
Belirli bir süre beklendikten sonra fanuslardaki gaz değişimleri ile kireç suyunun durumu gözlenmiştir. 1. fanustaki kireç suyunun berrak kaldığı, 3. fanustaki kireç suyunun ise hızla bulandığı tespit edilmiştir.',
          'Gerçekleştirilen bu deney düzeneği ve gözlemlere dayanılarak aşağıdaki çıkarımlardan hangisine ulaşılamaz?',
          '{"A":"1. fanusta bitkinin fotosentez hızı solunum hızından yüksek olduğu için ortamdaki karbondioksit tükenmiş ve kireç suyu bulanmamıştır.","B":"3. fanustaki kireç suyunun bulanması, bitkinin karanlık ortamda fotosentez yapamadığını ve sadece solunum yaparak ortama karbondioksit verdiğini kanıtlar.","C":"2. fanusta farenin solunumla ürettiği karbondioksit, ışık altında bitki tarafından fotosentezde tüketilebileceği için canlılar yaşamlarını daha uzun süre devam ettirebilir.","D":"Yeşil bitkiler sadece gündüzleri fotosentez yaparken solunum olayını yalnızca geceleri karanlık ortamda gerçekleştirirler."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: LGS''de en sık sorulan kavram yanılgısı: "Bitkiler gündüz sadece fotosentez, gece sadece solunum yapar." Yanlış! Bitkiler dahil tüm canlılar gece ve gündüz kesintisiz olarak 24 saat hücresel solunum yaparlar.',
          'Yeşil bitkiler fotosentezi yalnızca ışık varlığında (gündüz ya da yapay ışıkta) yaparken hücresel solunumu canlılıkları boyunca gece-gündüz kesintisiz olarak 24 saat sürdürürler. Bu nedenle bitkilerin solunumu yalnızca geceleri karanlıkta yaptığını iddia eden D seçeneği büyük bir kavram yanılgısıdır ve deneyden ulaşılamaz (Doğru cevap D).
1. fanusta aydınlıkta fotosentez hızı solunumu aştığı için net CO2 birikmez, kireç suyu bulanmaz (A doğru). 3. fanusta karanlıkta fotosentez durur, solunumla açığa çıkan CO2 kireç suyunu bulandırır (B doğru). 2. fanusta gaz döngüsü yaşamı uzatır (C doğru).',
          '{"A":"Işık altında fotosentez solunumu aştığında ortamdaki CO2 tüketilir, kireç suyu berrak kalır; bu çıkarım bilimsel olarak doğrudur.","B":"Karanlık ortamda fotosentez gerçekleşmez; solunum sonucu açığa çıkan karbondioksit kireç suyunu bulandırır, doğru bir çıkarımdır.","C":"Bitki ve fare arasındaki O2-CO2 dengesi canlıların fanustaki yaşam süresini uzatır, doğru bir çıkarımdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000073'::uuid,
          73,
          'LGS-FEN-T3-03',
          'Sağlıklı bir DNA molekülünün tek zincirinde 400 Adenin, 600 Guanin, 300 Sitozin ve 500 Timin nükleotidi bulunmaktadır.',
          'Bu DNA molekülünün çift zincirindeki toplam nükleotid sayısı kaçtır?',
          '{"A":"1800","B":"2400","C":"3600","D":"7200"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: 1. zincirdeki nükleotidleri toplayın: 400 + 600 + 300 + 500 = 1800. Çift zincir olduğu için toplam = 1800 * 2 = 3600 nükleotid.',
          'Birinci zincirdeki toplam nükleotid sayısı = 400 + 600 + 300 + 500 = 1800''dür. DNA çift zincirli olduğundan karşı zincirde de tam 1800 nükleotid yer alır. Toplam = 1800 + 1800 = 3600 nükleotiddir.',
          '{"A":"1800 sadece tek zincirdeki nükleotid sayısıdır, çift zinciri ihmal eden yanılgıdır.","B":"2400 Guanin ve Sitozin odaklı yanlış hesaplamadır.","D":"7200 gereksiz bir kez daha 2 ile çarpmadır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000074'::uuid,
          74,
          'LGS-FEN-T3-04',
          'Otozomal çekinik (a) genle taşınan bir hastalığın taşıyıcısı olan (Aa) iki birey evlenmiştir.',
          'Kalıtım kurallarına göre bu çiftin doğacak ilk çocuklarının bu hastalığı fenotipinde gösterme (hasta olma) oranı yüzde kaçtır?',
          '{"A":"%25","B":"%50","C":"%75","D":"%100"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Çaprazlama yapınız: Aa x Aa -> AA (%25), Aa (%50), aa (%25). Hasta birey çekinik homozigot (aa) genotiplidir, yani %25 olasılıktır.',
          'Taşıyıcı ebeveynler: Aa x Aa. Çaprazlama sonucu: AA, Aa, Aa, aa. Hasta birey homozigot çekinik ''aa'' olan bireydir. Olasılık 1/4 yani %25''tir.',
          '{"B":"%50 taşıyıcı (Aa) olma olasılığıdır.","C":"%75 sağlıklı görünme (AA + Aa) fenotip olasılığıdır.","D":"%100 ebeveynlerden birinin homozigot hasta sanılmasıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000075'::uuid,
          75,
          'LGS-FEN-T3-05',
          'Özdeş tuğlalar kullanılarak yapılan bir deneyde, tuğla önce geniş yüzeyi üzerine, ardından dar yüzeyi üzerine süngere bırakılmıştır.',
          'Katı basıncı kuralları uygulandığında tuğla dar yüzeyi üzerine konulduğunda süngerdeki batma miktarının artmasının temel sebebi aşağıdakilerden hangisidir?',
          '{"A":"Tuğlanın ağırlığının artması","B":"Tuğlanın yerçekimi ivmesinin artması","C":"Temas yüzey alanı azaldığı için katı basıncının artması","D":"Süngerin esneklik katsayısının değişmesi"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Katı basıncı formülü P = G / S''dir. Tuğlanın ağırlığı (G) değişmemiştir; yüzey alanı (S) azaldığı için basınç (P) artmıştır.',
          'Katı basıncı ağırlıkla doğru, temas yüzey alanıyla ters orantılıdır. Tuğla dik çevrildiğinde ağırlığı sabit kalır fakat temas yüzey alanı küçülür; bu da zemine uygulanan basıncı artırarak batma miktarını yükseltir.',
          '{"A":"Aynı tuğla kullanıldığı için ağırlık kesinlikle değişmemiştir.","B":"Yerçekimi ivmesi aynı laboratuvarda sabittir.","D":"Süngerin malzeme özelliği değişmez, değişen uygulanan kuvvettir/basınçtır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000076'::uuid,
          76,
          'LGS-FEN-T3-06',
          'Öğrenciler fen laboratuvarında 4 farklı deney gerçekleştirmiştir:
1. Mumun erimesi
2. Demirin paslanması
3. Suyun kaynaması
4. Sütten yoğurt mayalanması',
          'Bu deneylerden hangilerinde maddenin kimlik özelliği değişmiş, yani kimyasal değişim gerçekleşmiştir?',
          '{"A":"1 ve 3","B":"2 ve 4","C":"1, 2 ve 4","D":"Yalnızca 2"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Hal değişimleri (erime, kaynama) fizikseldir. Paslanma (oksitlenme) ve mayalanma ise yeni maddeler oluşturan kimyasal değişimlerdir.',
          '1 (mumun erimesi) ve 3 (suyun kaynaması) fiziksel hal değişimleridir. 2 (demirin paslanması) kimyasal yanma/oksitlenmedir; 4 (yoğurt mayalanması) bakteriyel kimyasal dönüşümdür. Dolayısıyla 2 ve 4 kimyasaldır.',
          '{"A":"1 ve 3 fiziksel değişim örnekleridir.","C":"1 erime olduğu için fizikseldir, kimyasal listesine dâhil edilemez.","D":"Yoğurt mayalanması da kimyasal olduğundan yalnızca 2 eksik kalır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000077'::uuid,
          77,
          'LGS-FEN-T3-07',
          'Sürtünmelerin ve makara ağırlıklarının ihmal edildiği özdeş makaralardan oluşan bir palanga sisteminde, 240 N ağırlığındaki bir yük, tavana bağlı 2 sabit ve yüke bağlı 2 hareketli makara kullanılarak dengelenmiştir. İpi çeken kuvvet yukarı yönlüdür.',
          'Buna göre yükü dengede tutmak için uygulanması gereken minimum F kuvveti kaç Newton''dur?',
          '{"A":"48 N","B":"60 N","C":"80 N","D":"120 N"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Yükü taşıyan ip sayısını belirleyin. 2 hareketli makara vardır ve ip çekiş yönü yukarı doğru olduğundan yükü taşıyan ip kolu sayısı n = 2 * 2 + 1 = 5''tir. F = G / n = 240 / 5 = 48 N.',
          'Palangada 2 hareketli makara varken ve çekilen son ip yukarı yönlü olduğunda, son ip de yükü yukarı çeker. Toplam taşıyıcı ip sayısı 5 olur. F = G / 5 = 240 / 5 = 48 N.',
          '{"B":"60 N ip aşağı doğru çekildiğinde (n = 4) bulunan değerdir.","C":"80 N 3 ipli sistem sonucudur.","D":"120 N sadece tek bir hareketli makara varsayıldığında bulunur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000078'::uuid,
          78,
          'LGS-FEN-T4-01',
          'Bir çözeltiye mavi turnusol kâğıdı batırıldığında kâğıdın rengi kırmızıya dönmektedir. Çözeltinin tadı ekşidir ve sulu çözeltisinde H+ iyonu verir.',
          'Bu çözelti aşağıdakilerden hangisi olabilir?',
          '{"A":"Sabunlu su","B":"Limon suyu","C":"Çamaşır suyu","D":"Diş macunu"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Mavi turnusolu kırmızıya çeviren, tadı ekşi olan ve H+ iyonu veren maddeler asitlerdir. Şıklardaki tek asit limon suyudur (sitrik asit).',
          'Mavi turnusolü kırmızıya çeviren çözeltiler asitlerdir. Limon suyu pH < 7 olan asidik bir çözeltidir. Sabunlu su, çamaşır suyu ve diş macunu baziktir.',
          '{"A":"Sabunlu su baziktir, turnusolu maviye çevirir.","C":"Çamaşır suyu bazik özellik gösterir.","D":"Diş macunu bazik özelliktedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000079'::uuid,
          79,
          'LGS-FEN-T4-02',
          'Oda koşullarında bulunan 4 farklı sıvının pH ölçüm değerleri şöyledir:
K sıvısı: pH = 2
L sıvısı: pH = 7
M sıvısı: pH = 9
N sıvısı: pH = 13',
          'Asitlik ve bazlık kuralları uygulandığında bu sıvıların pH değerleri ile ilgili aşağıdaki ifadelerden hangisi doğrudur?',
          '{"A":"K sıvısı zayıf bazik özellik gösterir.","B":"L sıvısı nötrdür; saf su örnektir.","C":"M sıvısının asitliği K sıvısından fazladır.","D":"N sıvısı metallerle tepkimeye girip hidrojen gazı açığa çıkarır."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: pH = 7 nötrdür. pH < 7 asit, pH > 7 bazdır. L sıvısı pH = 7 ile nötrdür.',
          'pH cetvelinde 7 değeri nötr noktadır ve saf su buna örnektir. K asittir (pH 2), M zayıf bazdır (pH 9), N kuvvetli bazdır (pH 13).',
          '{"A":"K sıvısı pH 2 ile kuvvetli asittir.","C":"M sıvısı bazdır, asitliği yoktur.","D":"Genel olarak asitler metallerle tepkimeye girip H₂ gazı çıkarır, kuvvetli bazlar sadece amfoter metallerle tepkime verir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000080'::uuid,
          80,
          'LGS-FEN-T4-03',
          'Nötr haldeki X atomunun katman elektron dağılımı 2 - 8 - 7 şeklindedir.',
          'Buna göre periyodik tablo kuralları uygulandığında X elementi hangi grupta yer alır ve hangi sınıfa aittir?',
          '{"A":"2. periyot 7A grubu - Ametal","B":"3. periyot 7A grubu - Ametal","C":"3. periyot 2A grubu - Metal","D":"7. periyot 3A grubu - Yarı metal"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Katman sayısı periyot numarasını verir (3 katman -> 3. periyot). Son katmandaki elektron sayısı grup numarasını verir (7 elektron -> 7A grubu). 7A grubu ametaldir (halojendir).',
          '3 adet katmanı olduğu için 3. periyotta yer alır. Son katmanında 7 elektron bulunduğu için 7A grubundadır (klor elementi). 7A grubu elementleri ametaldir.',
          '{"A":"2. periyot değil, 3 katman olduğu için 3. periyottur.","C":"2A değil, son katmanda 7 elektron olduğu için 7A''dır.","D":"Katman ve değerlik elektronları ters çevrilmemelidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000081'::uuid,
          81,
          'LGS-FEN-T4-04',
          'Aynı yüksekliğe (h = 2 m) sahip iki farklı rampadan birincisinin uzunluğu L₁ = 6 metre, ikincisinin uzunluğu L₂ = 10 metredir. Özdeş yükler sürtünmesiz bu rampalar üzerinden yukarı çıkarılmaktadır.',
          'Bu düzeneklerle ilgili aşağıdaki yargılardan hangisi doğrudur?',
          '{"A":"İkinci rampada uygulanan kuvvet daha büyüktür.","B":"İkinci rampada yapılan iş daha fazladır.","C":"İkinci rampanın kuvvet kazancı birinci rampadan fazladır.","D":"Birinci rampada yoldan kazanç sağlanmıştır."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Eğik düzlemde kuvvet kazancı = Yol / Yükseklik (L / h). L arttıkça kuvvet kazancı artar (kuvvet küçülür). Basit makinelerde işten kazanç olmaz.',
          'Kuvvet kazancı L / h oranıdır. Rampanın boyu (L) arttıkça kuvvet kazancı artar (daha küçük kuvvetle çekilir). İkinci rampa 10/2 = 5 kat kazanç sağlarken birinci rampa 6/2 = 3 kat kazanç sağlar. Dolayısıyla C doğrudur.',
          '{"A":"İkinci rampada rampa boyu uzun olduğu için kuvvet daha küçüktür.","B":"Sürtünmesiz ortamda aynı yüksekliğe çıkarılan özdeş yüklerde yapılan işler birbirine eşittir (işten kazanç olmaz).","D":"Eğik düzlemde hiçbir zaman yoldan kazanç olmaz; yoldan kayıp, kuvvetten kazanç vardır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000082'::uuid,
          82,
          'LGS-FEN-T4-05',
          'Kapalı bir kapta gerçekleşen kimyasal tepkimenin denklemi: A + B -> C + D şeklindedir.
Başlangıçta 40 gram A ve bir miktar B maddesi tepkimeye girmiş; tepkime sonunda A tamamen tükenirken 28 gram C ve 32 gram D maddesi oluşmuştur.',
          'Buna göre tepkimeye giren B maddesi kaç gramdır?',
          '{"A":"10","B":"20","C":"30","D":"60"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Kapalı kapta kütle korunur: Girenlerin toplam kütlesi = Ürünlerin toplam kütlesi. 40 + B = 28 + 32 -> 40 + B = 60 -> B = 20 gram.',
          'Kütlenin korunumu kanununa göre tepkimeye girenlerin kütleleri toplamı ürünlerin kütleleri toplamına eşittir. Ürünler = 28 + 32 = 60 gram. Girenler = 40 + B = 60 gram. Buradan B = 60 - 40 = 20 gram bulunur.',
          '{"A":"10 gram işlem hatasıdır.","C":"30 gram 60''ın yarısıdır.","D":"60 gram ürünlerin toplam kütlesidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000083'::uuid,
          83,
          'LGS-FEN-T4-06',
          'Eski tip su kuyularında kullanılan çıkrık düzeneğinde, dönme kolunun uzunluğu (R) silindirin yarıçapından (r) daima büyüktür.',
          'Çıkrık sistemiyle ilgili aşağıdaki ifadelerden hangisi daima doğrudur?',
          '{"A":"İşten kazanç sağlar.","B":"Kuvvetten kazanç sağlar.","C":"Yoldan kazanç sağlar.","D":"Enerjiden kazanç sağlar."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Kuvvet kolu (R) yük kolundan (r) büyük olduğu için çıkrık daima kuvvetten kazanç sağlar. Hiçbir basit makine işten veya enerjiden kazanç sağlayamaz.',
          'Çıkrıkta R > r olduğundan kuvvet kazancı R / r > 1''dir. Bu daima kuvvetten kazanç sağlandığı anlamına gelir. Basit makinelerde iş ve enerji kazancı kesinlikle olamaz.',
          '{"A":"Hiçbir basit makine işten kazanç sağlamaz.","C":"Kuvvetten kazanç olan yerde yoldan kayıp vardır.","D":"Enerjiden kazanç sağlamak fiziğin temel yasalarına aykırıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000084'::uuid,
          84,
          'LGS-FEN-T4-07',
          'Bir ekosistemde yer alan besin piramidi şöyledir:
Fitoplankton -> Zooplankton -> Küçük Balık -> Büyük Balık -> Balık Kartalı',
          'Bu besin piramidinde üreticiden son tüketiciye doğru gidildikçe meydana gelen değişimlerle ilgili aşağıdaki yargılardan hangisi kesinlikle doğrudur?',
          '{"A":"Aktarılan enerji miktarı her basamakta artar.","B":"Birey sayısı her basamakta katlanarak çoğalır.","C":"Vücut dokularında biriken zehirli madde (biyolojik birikim) miktarı en fazla balık kartalında olur.","D":"Biyokütle üreticiden tüketiciye doğru genişler."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Besin zincirinde yukarı çıkıldıkça: Enerji azalır (%10 kuralı), birey sayısı azalır, biyokütle azalır; ancak dokularda atılamayan zehirli madde birikimi (biyolojik birikim) piramidin zirvesinde en yüksek düzeye ulaşır.',
          'Zehirli kimyasallar vücuttan atılamadığı için besin zincirinin en üst basamağındaki canlıda (balık kartalı) en yüksek derişime (biyolojik birikim) ulaşır. Enerji, biyokütle ve birey sayısı ise yukarı çıkıldıkça azalır.',
          '{"A":"Aktarılan enerji %10 yasası gereği her basamakta %90 oranında azalır.","B":"Birey sayısı piramidin tabanında en fazladır, yukarı çıkıldıkça azalır.","D":"Biyokütle tabanda (üreticilerde) en geniştir, yukarı doğru daralır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000085'::uuid,
          85,
          'LGS-SOS-T1-01',
          '19. yüzyılın sonları ve 20. yüzyılın başlarında dağılma tehlikesiyle karşı karşıya kalan Osmanlı Devleti''ni kurtarmak amacıyla aydınlar ve devlet adamları tarafından çeşitli fikir akımları ileri sürülmüştür:

• Osmanlıcılık: Din, dil ve ırk farkı gözetmeksizin imparatorluk sınırları içindeki herkesi kanun önünde eşit ''Osmanlı vatandaşı'' kabul ederek ortak bir vatan aidiyeti oluşturmayı amaçlamıştır. Ancak 1877-1878 Osmanlı-Rus Savaşı sonrası bağımsızlığını ilan eden Balkan uluslarının ayrılıkçı isyanları ve II. Meşrutiyet dönemindeki gelişmeler bu akımın devletin bütünlüğünü sağlamaya yetmediğini göstermiştir.

• İslamcılık (Ümmetçilik): Bütün Müslümanları halifenin sancağı etrafında birleştirmeyi ve İslami dayanışmayı esas almıştır. II. Abdülhamid döneminde devlet politikası olarak uygulanmış; fakat I. Dünya Savaşı''nda Halife''nin yayımladığı cihad çağrısına rağmen bazı Arap aşiretlerinin İngilizlerle iş birliği yaparak Hicaz ve Yemen cephelerinde Osmanlı birliklerine karşı savaşması bu fikrin birleştiriciliğine ağır bir darbe vurmuştur.

• Türkçülük: Balkan Savaşları sonrasında yaşanan büyük hezimetler ve Osmanlıcılık ile İslamcılığın etkisini kaybetmesi üzerine kuvvetlenmiştir. Ziya Gökalp ve Mehmet Emin Yurdakul gibi aydınların öncülüğünde, millî kimliğe, kültüre ve Türk milletinin öz gücüne dayanarak bir varoluş mücadelesi verilmesini savunmuş; daha sonra Kurtuluş Savaşı''nın ve cumhuriyetin temel ideolojik harcını oluşturmuştur.',
          'Verilen tarihsel bilgiler ve fikir akımlarının gelişim seyri incelendiğinde aşağıdaki değerlendirmelerden hangisine ulaşılamaz?',
          '{"A":"Osmanlı aydınları ve idarecileri, imparatorluğun parçalanmasını önlemek amacıyla dönemin şartlarına göre farklı siyasal ve toplumsal projeler üretmişlerdir.","B":"Uluslararası gelişmeler ve sahadaki askerî-siyasi hadiseler, bazı fikir akımlarının geçerliliğini yitirmesinde ve etkisini kaybetmesinde belirleyici olmuştur.","C":"Türkçülük akımı, çok uluslu ve ümmetçi modellerin başarısızlığa uğradığı bir tarihsel konjonktürde Anadolu''daki bağımsızlık iradesine fikrî dayanak sağlamıştır.","D":"Osmanlı aydınları, Batı dünyasının bilimsel ve teknik ilerlemelerini bütünüyle reddederek kurtuluşu yalnızca monarşik düzenin katı muhafazasında aramışlardır."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, 2024 LGS''de sıkça test edilen ''Metne Dayalı Çıkarım ve Tarihsel Kavram Analizi'' mantığına dayanır. Çözüm tekniği: Seçeneklerdeki aşırı genellemeleri ve tarihsel anakronizmleri (çelişkileri) arayın. D şıkkında yer alan ''Batı dünyasının bilimsel ve teknik ilerlemelerini bütünüyle reddetme'' iddiası; hem Osmanlı yenileşme hareketlerinin (Tanzimat, Meşrutiyet) hem Batıcılık akımının hem de Mustafa Kemal''in benimsediği çağdaşlaşma vizyonunun tam aksidir. Aydınlar geleneksel yapıyı katı şekilde korumak için değil, devleti modernleştirerek kurtarmak için fikir üretmişlerdir.',
          'Metindeki tarihsel veriler adım adım analiz edildiğinde:
- Osmanlıcılık, İslamcılık ve Türkçülük akımlarının devleti çöküşten kurtarmak amacıyla üretildiği bilgisi A şıkkını kesin olarak doğrular.
- Balkan Savaşları''nın Osmanlıcılığa, Arap aşiretlerinin İngilizlerle iş birliğinin İslamcılığa darbe vurması; uluslararası hadiselerin fikir akımlarının geçerliliğini yitirmesine yol açtığını gösterir (B şıkkı doğru).
- Osmanlıcılık ve İslamcılığın dağılmayı önleyememesi üzerine güçlenen Türkçülüğün, Kurtuluş Savaşı''nın ideolojik harcını oluşturduğu tespiti C şıkkını doğrular.
- D şıkkındaki ''aydınların Batı bilim ve tekniğini bütünüyle reddettiği'' yargısı ise tamamen asılsızdır. Osmanlı aydınları (örneğin Tevfik Fikret, Abdullah Cevdet gibi Batıcılar ya da Ziya Gökalp gibi Türkçüler) Batı''nın tekniğini alarak modernleşmeyi savunmuşlardır; dolayısıyla bu çıkarım yapılamaz.',
          '{"A":"Güçlü Çeldirici (Doğru Analiz Tuzağı): Metnin giriş cümlesinde doğrudan ifade edilen ''dağılmayı önlemek için farklı projeler üretildiği'' tespitidir; doğru bir çıkarım olduğu için olumsuz soru kökünde elenmelidir.","B":"Orta Çeldirici (Nedensellik İlişkisi): Savaşlar ve isyanlar ile fikir akımlarının çöküşü arasındaki nedensellik bağını doğru kuran bir seçenektir.","C":"Zayıf Çeldirici: Türkçülüğün Kurtuluş Savaşı''na zemin hazırladığı bilgisi metnin son cümlesinde açıkça belirtilmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000086'::uuid,
          86,
          'LGS-SOS-T1-02',
          'Mustafa Kemal Paşa''nın Millî Mücadele öncesinde üstlendiği görevlerde sergilediği iki mühim hadise şöyledir:

I. Hadise (Trablusgarp Savaşı - 1911): İtalyanların Trablusgarp''ı işgali üzerine Osmanlı Devleti karadan Mısır''ın İngiliz işgali altında olması, denizden ise donanmanın yetersizliği sebebiyle bölgeye ordu gönderememiştir. Mustafa Kemal ve bir grup genç Osmanlı subayı, kılık değiştirerek ve binbir güçlüğü aşarak gizlice Trablusgarp''a gitmiştir. Mustafa Kemal (Gazeteci Şerif Bey takma adıyla), bölgedeki dağınık ve birbiriyle rekabet halindeki yerli Arap kabilelerini bir araya getirerek onları düzenli bir savunma hattında birleştirmiş; Derne ve Tobruk''ta modern İtalyan ordusuna karşı büyük direniş zaferleri elde etmiştir.

II. Hadise (Çanakkale Cephesi - 1915): 19. Tümen Komutanı Yarbay Mustafa Kemal, Çanakkale Kara Savaşları sırasında İtilaf birliklerinin Seddülbahir''den ziyade Arıburnu ve Conkbayırı hattından ana çıkarmayı yapacağını ve tepeyi ele geçirmek isteyeceğini önceden tahmin etmiştir. Üst komutanlıktan emir beklemeksizin kendi inisiyatifiyle 57. Alay''ı harekete geçirmiş, kilit tepeyi düşmandan önce tutmuş ve askerlerine ''Ben size taarruzu emretmiyorum, ölmeyi emrediyorum! Biz ölünceye kadar geçecek zaman zarfında yerimize başka kuvvetler ve komutanlar kaim olabilir!'' emrini vererek çıkartmayı püskürtmüştür.',
          'Mustafa Kemal Paşa''nın bu iki tarihî hadisede sergilediği tutum ve icraatlar; sırasıyla onun aşağıdaki kişilik özelliklerinden hangileriyle doğrudan bağdaşır?',
          '{"A":"Teşkilatçılık (Örgütleyicilik) — İleri Görüşlülük ve Liderlik","B":"Gelenekçilik — Çok Yönlülük","C":"Açık Sözlülük — Uzlaşmacılık","D":"İnkılapçılık — Dogmatiklik"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: MEB LGS''de Mustafa Kemal''in kişilik özellikleri her yıl istisnasız sorulan çekirdek bir konudur. Kavram anahtarları:
- Dağınık halkı/kabileleri örgütleme, millî cemiyetleri birleştirme -> ''Teşkilatçılık / Birleştiricilik / Örgütleyicilik''.
- Düşmanın nereden çıkarma yapacağını veya bir olayın gelecekteki akışını önceden kestirip haklı çıkma -> ''İleri Görüşlülük''.
- İnisiyatif alarak askere cesaret aşılama ve komuta etme -> ''Liderlik / Askerî Deha''.
Bu eşleştirmeyi sağlayan yegâne seçenek A''dır.',
          'Hadiseler incelendiğinde:
- I. Hadisede Mustafa Kemal''in dağınık yerli halkı İtalyan sömürgeciliğine karşı örgütlemesi, onları ortak bir gaye etrafında organize etmesi onun tartışmasız ''Teşkilatçılık (Örgütleyicilik)'' vasfını kanıtlar.
- II. Hadisede ise İtilaf Devletleri''nin nereden çıkarma yapacağını önceden doğru öngörmesi ''İleri Görüşlülük'' yeteneğini; kritik anda üstlerinden emir beklemeksizin inisiyatif alarak tarihi emri vermesi ve savaşın seyrini değiştirmesi ise ''Liderlik ve Kararlılık'' vasfını ispatlar.
- Bu nedenle I ve II numaralı hadiseler sırasıyla Teşkilatçılık ve İleri Görüşlülük/Liderlik ile örtüşmektedir (Doğru cevap A).',
          '{"B":"Güçlü Çeldirici (Kavram Yanılgısı Tuzağı): Mustafa Kemal''in farklı sahalardaki başarılarını ''çok yönlülük'' olarak düşünen öğrenci bu şıkka kayabilir; ancak ilk bölümdeki ''gelenekçilik'' Mustafa Kemal''in inkılapçı kimliğiyle bağdaşmaz.","C":"Orta Çeldirici: Mustafa Kemal''in askerlerine verdiği ''ölmeyi emrediyorum'' sözü kararlılık içerse de ''uzlaşmacılık'' savaştaki uzlaşmaz tavırla taban tabana zıttır.","D":"Zayıf Çeldirici: ''Dogmatiklik'' (bağnazlık, katılık) Mustafa Kemal''in akılcı ve bilimsel düşünce sistemiyle asla bağdaşmayan çelişkili bir ifadedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000087'::uuid,
          87,
          'LGS-SOS-T1-03',
          '30 Ekim 1918''de imzalanan Mondros Ateşkes Antlaşması''nın bazı maddeleri ve bu maddelerin uygulanma süreci şöyledir:

• 7. Madde: İtilaf Devletleri, güvenliklerini tehdit edecek bir durum ortaya çıkarsa herhangi bir stratejik noktayı işgal hakkına sahip olacaktır.
• 24. Madde: Vilâyât-ı Sitte''de (Doğu''daki altı vilayette) bir karışıklık çıkarsa, İtilaf Devletleri buraları işgal edebilecektir.
• Askerî Hükümler: Sınırların korunması ve iç güvenliğin temini için gereken asgari birlikler dışındaki Osmanlı ordusu derhâl terhis edilecek; orduya ait silah, cephane ve mühimmat İtilaf Devletleri''nin kontrolüne teslim edilecektir.
• Ulaşım ve Haberleşme Hükümleri: Bütün telsiz, telgraf istasyonları ile demir yolları ve Toros Tünelleri İtilaf Devletleri''nin denetimine bırakılacaktır.

Antlaşmanın hemen ardından İtilaf donanması İstanbul''a demirlemiş; İngilizler Musul, Urfa, Antep ve Maraş''ı; Fransızlar Adana ve Mersin''i; İtalyanlar Antalya ve Muğla çevresini; Yunanlılar ise İzmir''i işgal etmiştir. Bu işgaller karşısında İstanbul Hükûmeti teslimiyetçi ve sükûneti telkin eden bir politika izlerken; Türk milleti vatan topraklarını korumak amacıyla bölgesel Müdafaa-i Hukuk cemiyetleri kurmuş ve Kuvâ-yı Millîye birlikleriyle silahlı direnişe geçmiştir.',
          'Mondros Ateşkes Antlaşması''nın maddeleri ve yaşanan gelişmeler birlikte değerlendirildiğinde aşağıdakilerden hangisi söylenemez?',
          '{"A":"İtilaf Devletleri, antlaşmanın 7 ve 24. maddeleri sayesinde Anadolu''da yapacakları keyfî işgallere uluslararası hukuk zemininde meşru bir kılıf hazırlamışlardır.","B":"Ordunun terhis edilmesi ve haberleşme araçlarına el konulması, Türk milletini savunmasız bırakmayı ve işgallere karşı organize bir direniş cephesinin kurulmasını engellemeyi hedeflemiştir.","C":"İstanbul Hükûmeti ile Türk milleti, işgal güçlerine karşı yekvücut hareket ederek ortak bir savunma ve kurtuluş stratejisi uygulamıştır.","D":"Türk milletinin kurduğu Müdafaa-i Hukuk cemiyetleri ve Kuvâ-yı Millîye birlikleri, milletin bağımsız yaşama azminin ve meşru müdafaa hakkının somut göstergesidir."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru tipinde LGS, ''İstanbul Hükûmeti''nin tutumu'' ile ''Türk milletinin tutumu'' arasındaki derin zıtlığı test eder. Mondros sonrası İstanbul Hükûmeti padişah ve Damat Ferit önderliğinde teslimiyetçi, sessiz ve uzlaşmacı davranmış; halka ''direnmeyin, İtilafların adaletine güvenin'' çağrısı yapmıştır. Buna karşılık Türk milleti cemiyetler ve Kuvâ-yı Millîye ile başkaldırmıştır. C şıkkındaki ''İstanbul Hükûmeti ile Türk milletinin ortak savunma yaptığı'' iddiası bariz bir tarihsel yanılgıdır.',
          'Maddeler ve tarihsel gerçekler değerlendirildiğinde:
- 7. ve 24. maddelerin ucu açık ifadeleri (''güvenliği tehdit eden durum'', ''karışıklık''), İtilaf Devletleri''nin istedikleri yeri işgal etmelerine hukuki bahane oluşturmuştur (A şıkkı doğru).
- Ordunun dağıtılması ve telgraf/demir yollarına el konulması, halkın birbirini haberdar etmesini ve ordunun karşı koymasını önleyerek memleketi savunmasız bırakma amacını taşır (B şıkkı doğru).
- Türk milletinin işgalleri kabul etmeyip Kuvâ-yı Millîye ve direniş cemiyetlerini kurması bağımsızlık aşkını ve meşru savunma hakkını kanıtlar (D şıkkı doğru).
- C şıkkında iddia edilen durum ise tamamen yanlıştır; İstanbul Hükûmeti işgallere boyun eğip teslimiyetçi bir tavır takınırken, Türk milleti tam aksine kendi öz gücüyle silahlı direniş başlatmıştır. Yani aralarında ortak bir mücadele stratejisi değil, derin bir yaklaşım farkı ve çatışma mevcuttur.',
          '{"A":"Güçlü Çeldirici (Hukuki Yorum Tuzağı): 7. ve 24. maddelerin amacını kavramakta zorlanan öğrenci ''hukuki kılıf'' kavramına takılabilir; ancak bu maddeler tam olarak işgalleri meşrulaştırmak için konulmuştur.","B":"Orta Çeldirici (Askerî-Lojistik Analiz): Ordunun terhisi ve telgraf kontrolünün mantığını açıklayan doğru bir tespit olduğu için aranan olumsuz cevap olamaz.","D":"Zayıf Çeldirici: Kuvâ-yı Millîye ve cemiyetlerin milletin bağımsızlık refleksini temsil ettiği temel bir MEB kazanımıdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":5,"starLabel":"★★★★★","category":"5 Yıldız • Şampiyon / Üst Düzey Seçici","placement":"Deneme Sınavı Seçici Soruları (%1''lik Dilim Ayırt Edici)","rationale":"Çok adımlı optimizasyon, soyut modelleme ve yüksek analitik akıl yürütme içerir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000088'::uuid,
          88,
          'LGS-SOS-T1-04',
          '4-11 Eylül 1919 tarihleri arasında toplanan Sivas Kongresi, Millî Mücadele''nin teşkilatlanmasında dönüm noktası teşkil eden tarihî kararlara imza atmıştır:

1. Karar: Yurdun dört bir yanında bölgesel kurtuluş amacıyla kurulan bütün Müdafaa-i Hukuk cemiyetleri, ''Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti'' adı altında birleştirilmiştir.
2. Karar: Erzurum Kongresi''nde yalnızca Doğu illerini temsilen seçilen Temsil Heyeti''nin üye sayısı artırılmış ve bu heyet ''Bütün vatanı temsil eder'' hükmü getirilmiştir.
3. Karar: Manda ve himaye fikri, kongrede yapılan yoğun tartışmaların ardından bir daha asla gündeme gelmemek üzere kesin ve nihai olarak reddedilmiştir.
4. Karar: Temsil Heyeti, Ali Fuat Paşa''yı Batı Cephesi Kuvâ-yı Millîye Genel Komutanlığı görevine resmen atamıştır.
5. Karar: Millî davanın haklı gerekçelerini millete ve dünya kamuoyuna duyurmak, zararlı propagandaları etkisiz kılmak için Sivas''ta ''İrade-i Millîye'' adıyla bir gazete çıkarılması kararlaştırılmıştır.',
          'Sivas Kongresi''nde alınan bu kararlar ve ulaşılan sonuçlarla ilgili aşağıdaki eşleştirmelerden hangisi yanlıştır?',
          '{"A":"Cemiyetlerin birleştirilmesi -> Millî Mücadele''nin bölgesellikten kurtarılarak tek bir merkezden ve ortak stratejiyle idare edilmesi sağlanmıştır.","B":"Temsil Heyeti''nin Ali Fuat Paşa''yı ataması -> Heyetin yasama yetkisini kullanarak İstanbul Hükûmeti''nin yerini tamamen aldığını kanıtlar.","C":"Manda ve himayenin kesin reddi -> Tam bağımsızlık ilkesinden hiçbir surette taviz verilmeyeceğini ilan etmiştir.","D":"İrade-i Millîye gazetesinin çıkarılması -> Millî Mücadele''nin sesini duyurmak ve kamuoyu oluşturmak için basının gücünden yararlanıldığını gösterir."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, LGS''de devletin üç temel erki olan ''Yasama, Yürütme, Yargı'' kavramlarının tarihsel olaylara uygulanmasını ölçer.
- Yasama: Kanun yapma, yasa çıkarma (Meclis görevidir).
- Yürütme: Kanunları uygulama, hükûmet etme, bir memuru veya ordu komutanını göreve atama (Hükûmet görevidir).
- Yargı: Mahkemeler yoluyla yargılama yapma.
Temsil Heyeti''nin Ali Fuat Paşa''yı komutan olarak tayin etmesi bir ''atama'' işlemidir; dolayısıyla YASAMA değil, YÜRÜTME yetkisinin kullanıldığını gösterir. B şıkkında ''yasama yetkisi'' dendiği için hatalıdır!',
          'Kararlar ve kavramsal sonuçları irdelendiğinde:
- Bütün cemiyetlerin Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti çatısında toplanması, Millî Mücadele''yi merkezi bir disiplin ve tek elden yönetim kabiliyetine ulaştırmıştır (A şıkkı doğru).
- Temsil Heyeti''nin bir komutanı (Ali Fuat Paşa''yı) Batı Cephesi''ne ataması, bir hükûmet gibi hareket ettiğini ve ''Yürütme'' (icra) yetkisini ilk defa kullandığını gösterir. Atama işlemi kanun koyma (yasama) değildir; bu sebeple B şıkkındaki eşleştirme kavramsal olarak yanlıştır.
- Manda ve himayenin koşulsuz reddedilmesi, başka bir devletin vesayetine girmeyi dışlayarak ''Tam Bağımsızlık'' kararlılığını simgeler (C şıkkı doğru).
- Gazete çıkarılması basın-yayın yoluyla halkı aydınlatma, iç ve dış kamuoyunu örgütleme hamlesidir (D şıkkı doğru).',
          '{"A":"Güçlü Çeldirici (Merkeziyetçilik Analizi): Cemiyetlerin birleştirilmesinin Millî Mücadele''yi tek merkezden yönetmek anlamına geldiğini bilen öğrenci bu şıkkı hızla eler.","C":"Orta Çeldirici: Manda ve himaye ile tam bağımsızlık arasındaki doğrudan zıtlığı bildiren doğru bir eşleştirmedir.","D":"Zayıf Çeldirici: İrade-i Millîye gazetesinin basın ve kamuoyu oluşturma fonksiyonu açık bir bilgidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000089'::uuid,
          89,
          'LGS-SOS-T1-05',
          'Mustafa Kemal, Selanik Mülkiye Rüştiyesinde okurken komşusu olan Binbaşı Kadri Bey''in asker oğlunun üniformasından etkilenmiş ve gizlice Selanik Askerî Rüştiyesinin sınavlarına girerek başarılı olmuştur.',
          'Mustafa Kemal''in bu davranışı onun hangi kişisel özelliğini doğrudan yansıtır?',
          '{"A":"Kararlılık ve idealistlik","B":"İnkılapçılık","C":"Birleştiricilik","D":"Yöneticilik"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Annesinin karşı çıkmasına rağmen hedefinden vazgeçmeyip kendi isteğiyle gizlice sınava girmesi kararlılık ve askerlik idealini gösterir.',
          'Mustafa Kemal''in hayalindeki meslek olan askerliğe ulaşmak için engellere rağmen kararlı adımlar atması ve gizlice sınava girerek amacına ulaşması onun kararlı ve idealist yapısının göstergesidir.',
          '{"B":"İnkılapçılık köklü reform ve yenilik yapma yeteneğidir.","C":"Birleştiricilik dağınık güçleri ortak gaye etrafında toplama yeteneğidir.","D":"Yöneticilik idari ve sevk kabiliyetidir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000090'::uuid,
          90,
          'LGS-SOS-T1-06',
          'Amasya Genelgesi''nde yer alan ''Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.'' maddesi, Millî Mücadele''nin en temel kurtuluş stratejisi olmuştur.',
          'Bu maddeyle ilgili aşağıdaki çıkarımlardan hangisi hem Millî Mücadele''nin yöntemini hem de ileride kurulacak yeni devletin rejim stratejisini işaret eden en kapsamlı yargıdır?',
          '{"A":"Yalnızca düzenli ordu kurulması gerektiğini belirtmiştir.","B":"Manda ve himaye fikrinin ilk kez resmen reddedildiğini gösterir.","C":"Millet egemenliğine dayalı cumhuriyet rejiminin ilk sinyalini vermiş ve kurtuluşun millete dayanacağını belirtmiştir.","D":"İstanbul Hükûmeti''nin otoritesini tamamen pekiştirmiştir."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: ''Milletin azim ve kararı'' ifadesindeki ''milletin kararı'' ilerde halk iradesi ve cumhuriyete işaret eder; ''kurtaracaktır'' ise yöntemi açıklar.',
          'Bu tarihi madde Millî Mücadele''nin gerekçe ve amacının yanı sıra yöntemini (milletin azmi) belirlemiş; ''milletin kararı'' vurgusuyla da egemenliğin şahıstan alınıp millete verileceğini (Cumhuriyet) haber vermiştir.',
          '{"A":"Düzenli ordu maddesi değildir, genel ilke kararıdır.","B":"Manda ve himaye ilk kez Erzurum Kongresi''nde reddedilmiştir.","D":"İstanbul Hükûmeti''ni pekiştirmemiş, aksine onun görevini yapamadığını ilan etmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000091'::uuid,
          91,
          'LGS-SOS-T2-01',
          'Mondros Ateşkesi sonrasında ordusunu dağıtmayan 15. Kolordu Komutanı Kâzım Karabekir Paşa, Doğu Anadolu''da Türk köylerine baskın düzenleyen ve Sevr Antlaşması''na dayanarak bölgede hak iddia eden Ermeni kuvvetlerine karşı taarruza geçmiştir. Sarıkamış, Kars ve Gümrü''yü kurtaran Türk ordusunun kesin askerî zaferi üzerine Ermenistan Hükûmeti barış istemek zorunda kalmış ve 3 Aralık 1920''de TBMM Hükûmeti ile Ermenistan arasında Gümrü Barış Antlaşması imzalanmıştır.

Antlaşmanın mühim hükümleri şunlardır:
• Kars, Sarıkamış, Kağızman ve Iğdır TBMM Hükûmeti''ne bırakılacaktır.
• Ermenistan Hükûmeti, Sevr Antlaşması''nı tanımadığını ve Türkiye aleyhindeki bütün toprak iddialarından vazgeçtiğini kabul edecektir.
• Ermenistan, antlaşma metninde ilk kez ''Türkiye Büyük Millet Meclisi Hükûmeti'' ifadesini resmen kullanmıştır.

Bu antlaşmanın akabinde Doğu Cephesi kapanmış, bölgedeki düzenli ordu birlikleri ile silah ve cephane stokları Yunan taarruzunun yoğunlaştığı Batı Cephesi''ne sevk edilmiştir.',
          'Gümrü Antlaşması''nın maddeleri ve doğurduğu sonuçlar dikkate alındığında aşağıdaki çıkarımlardan hangisi yapılamaz?',
          '{"A":"TBMM Hükûmeti, uluslararası diplomaside ilk askerî ve siyasi zaferini kazanarak varlığını yabancı bir devlete hukuken kabul ettirmiştir.","B":"Sevr Antlaşması''nın Doğu Anadolu''da bağımsız bir Ermenistan devleti kurulmasını öngören maddesi hem sahada hem de masada geçersiz kılınmıştır.","C":"Doğu Cephesi''ndeki tehlikenin bertaraf edilmesi, Türk ordusunun Batı Cephesi''ndeki savunma gücünü lojistik ve insan kaynağı bakımından kuvvetlendirmiştir.","D":"Gümrü Antlaşması ile Türkiye''nin doğu sınırları hiçbir değişikliğe uğramayacak şekilde nihai ve kesin şeklini almıştır."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: MEB Maarif Modeli ve LGS sınavlarında doğu sınırının aşamaları en temel ayırt edici kazanımlardan biridir. Doğu sınırının kronolojik gelişimi:
1. Gümrü Antlaşması (Ermenistan ile - ilk adım, Doğu Cephesi kapandı),
2. Moskova Antlaşması (Sovyetler Birliği ile - I. İnönü Zaferi sonrası sınır büyük ölçüde çizildi, Batum Gürcistan''a bırakıldı),
3. Kars Antlaşması (Kafkas Cumhuriyetleri ile - Sakarya Zaferi sonrası Doğu sınırı KESİN ŞEKLİNİ ALDI).
Dolayısıyla D şıkkındaki ''Gümrü Antlaşması ile doğu sınırları kesin ve nihai şeklini almıştır'' yargısı kronolojik ve tarihsel olarak yanlıştır.',
          'Tarihsel gelişmeler ve antlaşma hükümleri incelendiğinde:
- Gümrü Antlaşması TBMM''nin imzaladığı ilk antlaşmadır ve TBMM''yi tanıyan ilk devlet Ermenistan olmuştur; bu durum TBMM''nin ilk diplomatik zaferidir (A şıkkı doğru).
- Ermenistan''ın Sevr''i tanımadığını ilan etmesi, Sevr''in büyük Ermenistan planını tarihe gömmüştür (B şıkkı doğru).
- Doğu birliklerinin ve mühimmatın Batı''ya kaydırılması, Yunan işgaline karşı Batı Cephesi''ni tahkim etmiştir (C şıkkı doğru).
- D şıkkı ise hatalıdır çünkü Türkiye''nin doğu sınırına son ve kesin şeklini veren antlaşma Sakarya Meydan Muharebesi''nden sonra imzalanan Kars Antlaşması''dır (13 Ekim 1921). Gümrü sadece ilk adımdır.',
          '{"A":"Güçlü Çeldirici (Hukuki Statü Analizi): TBMM''nin ilk diplomatik başarısı olduğunu bilen dikkatli öğrenci bu şıkkı eler; ancak dikkatsiz öğrenci ''hukuken tanınma'' kavramını erken bularak bu seçeneğe yönelebilir.","B":"Orta Çeldirici: Sevr''in geçersizliği maddesi metinde doğrudan yazılı olduğu için elenmelidir.","C":"Zayıf Çeldirici: Doğu birliklerinin Batı Cephesi''ne kaydırılmasının lojistik faydası metnin son cümlesinde açıkça belirtilmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000092'::uuid,
          92,
          'LGS-SOS-T2-02',
          'Kütahya-Eskişehir Muharebeleri''nde Türk ordusunun Sakarya Nehri''nin doğusuna çekilmesi üzerine TBMM''de büyük bir sarsıntı yaşanmış; meclis, 5 Ağustos 1921''de çıkardığı kanunla yasama ve yürütme yetkilerini üç aylık süreyle Mustafa Kemal Paşa''ya devrederek onu Başkomutan seçmiştir. Başkomutan Mustafa Kemal Paşa, 7-8 Ağustos 1921''de yayımladığı Tekâlif-i Millîye (Millî Yükümlülük) Emirleri ile milletini topyekûn bir seferberliğe çağırmıştır. Bu emirlerden bazıları şunlardır:

• Her ilçede bir Tekâlif-i Millîye Komisyonu kurulacaktır.
• Her aile birer kat çamaşır, bir çift çorap ve bir çift çarık hazırlayıp komisyona teslim edecektir.
• Halkın ve tüccarın elinde bulunan buğday, un, saman, nohut, fasulye, et gibi gıda maddeleri ile giyim eşyalarının, kumaş, kösele ve nalın %40''ına bedeli sonradan ödenmek üzere el konulacaktır.
• Demirci, marangoz, tesviyeci ve saraç gibi zanaatkârlar ordunun ihtiyaç duyduğu silah ve donanımı imal etmek üzere ordu hizmetine alınacaktır.
• Taşıt sahipleri, ayda bir defa olmak üzere ordu malzemelerini 100 kilometrelik mesafeye bedelsiz taşıyacaktır.

Türk milleti, elinde avucunda ne varsa canı gönülden Tekâlif-i Millîye komisyonlarına teslim etmiş; cephe gerisindeki kadınlar, çocuklar ve yaşlılar kağnılarla cepheye cephane taşımıştır.',
          'Tekâlif-i Millîye Emirleri ve Türk milletinin bu emirlere gösterdiği fedakârlık birlikte değerlendirildiğinde aşağıdakilerden hangisi savunulamaz?',
          '{"A":"Kurtuluş Savaşı''nın sadece cephedeki askerin süngüsüyle değil, milletin bütün maddi ve manevi varlığını ortaya koyduğu topyekûn bir seferberlikle kazanıldığı","B":"Mustafa Kemal Paşa''nın meclisten aldığı Başkomutanlık yetkisine dayanarak doğrudan kanun niteliğinde yaptırımlar uygulayabildiği","C":"Ordunun giyim, gıda, ulaşım ve mühimmat eksikliklerinin milletin öz kaynakları ve millî dayanışma ruhuyla giderilmesinin amaçlandığı","D":"Türk milletinin bağımsızlık mücadelesini dış devletlerin vereceği şartlı hibelere ve yabancı mali yardımlara endekslediği"}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: MEB Maarif Modeli''nin erdem-değer-eylem çerçevesinde ''Millî Dayanışma'', ''Vatanseverlik'' ve ''Fedakârlık'' teması Tekâlif-i Millîye üzerinden işlenir. Soru kökünde ''savunulamaz'' ifadesine dikkat edilmelidir. Türk milleti bağımsızlığı yabancı devletlerin mali yardımlarına veya mandasına değil, kendi öz varlığına, çarığına, çorabına ve kağnısına borçludur. D seçeneğindeki ''yabancı mali yardımlara endeksleme'' ifadesi bağımsızlık ruhuyla tamamen çelişir.',
          'Metin ve tarihî olgular tetkik edildiğinde:
- Tarladaki çiftçiden atölyedeki zanaatkâra kadar herkesin savaşa katılması ve kağnılarla cepheye mermi taşınması, savaşın ''topyekûn seferberlik'' karakterini açıkça kanıtlar (A şıkkı doğru).
- Mustafa Kemal Paşa''nın meclis onayına gerek kalmaksızın bizzat yayımladığı emirlerle vergi ve hizmet yükümlülüğü getirmesi, meclisin yasama ve yürütme yetkilerini Başkomutan sıfatıyla kullandığını doğrular (B şıkkı doğru).
- Çorap, çarık, buğday, un ve taşıtların ordu emrine tahsis edilmesi lojistik eksikliklerin millî dayanışmayla kapatılmasını hedefler (C şıkkı doğru).
- D şıkkındaki ''yabancı mali yardımlara ve şartlı hibelere endekslendiği'' iddiası ise tamamen gerçek dışıdır. Millî Mücadele hiçbir dış vesayete boyun eğmeden, milletin kendi fedakârlığı ile başarılmıştır.',
          '{"A":"Güçlü Çeldirici: Topyekûn savaş kavramını tam oturtamayan öğrencinin doğru olduğunu düşünüp elemesi gereken ana kazanımdır.","B":"Orta Çeldirici: Başkomutanlık Kanunu''nun içeriğini hatırlamayan öğrenci ''Mustafa Kemal kanun niteliğinde emir yayımlayabilir mi?'' tereddüdüne düşebilir; fakat Başkomutanlık yasama erkinin devrini kapsar.","C":"Zayıf Çeldirici: Tekâlif-i Millîye''nin lojistik amacını doğrudan özetleyen tartışmasız doğru bir cümledir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000093'::uuid,
          93,
          'LGS-SOS-T2-03',
          'Kütahya-Eskişehir Muharebeleri''nin en buhranlı günlerinde, Yunan ordusunun Ankara sınırına dayandığı 16-21 Temmuz 1921 tarihinde Ankara''da I. Maarif Kongresi toplanmıştır. Mustafa Kemal Paşa cephedeki karargâhından bizzat gelerek kongrenin açış nutkunda şu tarihî tespitleri yapmıştır:

''Efendiler! Yetişecek çocuklarımıza ve gençlerimize, görecekleri tahsilin hududu ne olursa olsun, en evvel ve her şeyden evvel Türkiye''nin istiklaline, kendi benliğine ve millî ananelerine düşman olan bütün unsurlarla mücadele etmek lüzumu öğretilmelidir. Dünyada milletlerarası vaziyete göre böyle bir mücadelenin gerektirdiği manevi unsurlarla donanmayan fertlerden ve bu mahiyette fertlerden mürekkep heyetlere hayat ve istiklal hakkı yoktur.

Şimdiye kadar takip olunan tahsil ve terbiye usullerinin, milletimizin gerileme tarihinde en mühim etken olduğu kanaatindeyim. Onun için bir millî eğitim programından bahsederken; eski devrin hurafelerinden, doğamızla hiçbir münasebeti olmayan yabancı fikirlerden, Doğu''dan ve Batı''dan gelebilen bütün tesirlerden tamamen uzak, millî seciyemiz ve tarihimizle uyumlu bir kültürü kastediyorum. Çünkü millî dehamızın inkişafı ancak böyle bir kültür ile temin olunabilir.''',
          'Mustafa Kemal Paşa''nın Maarif Kongresi açış nutkundan hareketle Türkiye Yüzyılı Maarif Modeli''nin de ilham kaynağı olan eğitim felsefesiyle ilgili aşağıdaki yargılardan hangisine ulaşılamaz?',
          '{"A":"Gelecek nesillerin eğitiminde millî bilincin, bağımsızlık aşkının ve öz değerleri savunma kararlılığının en öncelikli ilke olması gerektiği vurgulanmıştır.","B":"Milletin çağdaş medeniyet seviyesine erişebilmesinin yegâne yolunun, yerli kültürel mirası terk ederek yabancı eğitim modellerini harfiyen uygulamak olduğu savunulmuştur.","C":"Eski dönemlerde uygulanan ezberci ve taklitçi eğitim anlayışlarının toplumun gerilemesinde temel bir rol oynadığı teşhisi konulmuştur.","D":"Kültür ve eğitim politikasının milletin kendi karakterine, sosyolojik zeminine ve tarihsel birikimine uygun olarak inşa edilmesi hedeflenmiştir."}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, MEB Maarif Modeli''nin kalbinde yer alan ''Millî Terbiye ve Maarif Vizyonu''nu sınar. Mustafa Kemal nutkunda açıkça ''Doğu''dan ve Batı''dan gelebilen bütün tesirlerden tamamen uzak, millî seciyemiz ve tarihimizle uyumlu bir kültür'' talep etmektedir. B şıkkında ifade edilen ''yerli kültürel mirası terk ederek yabancı eğitim modellerini harfiyen uygulamak'' anlayışı; Mustafa Kemal''in ''millî eğitim'' ilkesinin tam zıttıdır ve sömürgeci bir taklitçilik zihniyetini temsil eder. Bu nedenle ulaşılamaz olan doğru seçenek B''dir.',
          'Mustafa Kemal''in sözleri çözümlendiğinde:
- ''Çocuklarımıza Türkiye''nin istiklaline ve millî benliğine düşman unsurlarla mücadele öğretilmelidir'' ifadesi A şıkkını kesinlikle doğrular.
- ''Şimdiye kadar takip olunan terbiye usulleri milletimizin gerilemesinde en mühim etkendir'' sözü C şıkkını açıkça destekler.
- ''Millî seciyemiz ve tarihimizle uyumlu bir kültür... Kültür milletin seciyesidir'' vurgusu D şıkkını doğrular.
- B şıkkında iddia edilen ''yerli mirası terk edip yabancı modelleri harfiyen uygulama'' tezi ise metne 180 derece zıttır. Mustafa Kemal yabancı tesirlerden uzak, öz kültürümüzle yoğrulmuş millî bir eğitimi şart koşmuştur.',
          '{"A":"Güçlü Çeldirici (Öncelik Tespiti): Nutkun ilk paragrafındaki ''en evvel ve her şeyden evvel'' ifadesini metinden okuyan öğrenci bunun doğruluğunu fark eder.","C":"Orta Çeldirici: Geçmiş eğitim sistemine yönelik eleştirinin doğruluğunu metindeki ''gerileme tarihinde en mühim etken'' ifadesi ispatlar.","D":"Zayıf Çeldirici: Maarif felsefesinin yerlilik ve millîlik ilkesidir; metinle tam uyumludur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000094'::uuid,
          94,
          'LGS-SOS-T2-04',
          '23 Ağustos - 13 Eylül 1921 tarihleri arasında cereyan eden Sakarya Meydan Muharebesi''nde Başkomutan Mustafa Kemal Paşa''nın ''Hattı müdafaa yoktur, sathı müdafaa vardır. O satıh bütün vatandır. Vatanın her karış toprağı vatandaşın kanıyla ıslanmadıkça terk olunamaz!'' emriyle Türk ordusu 22 gün 22 gece süren savaşta Yunan taarruzunu kırmış ve düşmanı hezimete uğratmıştır. 1683 II. Viyana Kuşatması''ndan beri 238 yıldır süren Türk geri çekilişi Sakarya''da son bulmuştur.

Bu büyük askerî zaferin iç ve dış politikadaki yansımaları şunlardır:
• İç Politika: TBMM, 19 Eylül 1921''de Başkomutan Mustafa Kemal Paşa''ya kanunla ''Mareşal'' rütbesi ve ''Gazi'' unvanını vermiştir. Türk halkının orduya ve zafere olan inancı kesinleşmiştir.
• Dış Politika (Kafkaslar): 13 Ekim 1921''de Sovyetler Birliği''ne bağlı Kafkas Cumhuriyetleri (Azerbaycan, Ermenistan, Gürcistan) ile Kars Antlaşması imzalanmış; Türkiye''nin doğu sınırı kesin olarak çizilmiştir.
• Dış Politika (Güney Cephesi): 20 Ekim 1921''de Fransa ile Ankara Antlaşması imzalanmış; Fransa işgal ettiği Güneydoğu Anadolu''dan çekilmiş, Güney Cephesi resmen kapanmış ve Fransa TBMM''yi tanıyan ilk İtilaf Devleti olmuştur.
• İtalya: Sakarya zaferinden sonra Anadolu''da işgal ettiği topraklardan (Antalya, Muğla çevresi) tamamen çekilmiştir.',
          'Sakarya Meydan Muharebesi ve sonrasında yaşanan bu gelişmeler birlikte incelendiğinde aşağıdaki çıkarımlardan hangisi yapılamaz?',
          '{"A":"Askerî sahada kazanılan kesin zafer, hem yurt içinde idareye olan güveni pekiştirmiş hem de uluslararası sahada çok boyutlu diplomatik kazanımlara kapı aralamıştır.","B":"Fransa''nın Ankara Antlaşması''nı imzalaması ve İtalya''nın çekilmesiyle, İtilaf Devletleri arasındaki birlik bozulmuş ve Türkiye''ye karşı kurulan emperyalist blok fiilen parçalanmıştır.","C":"Sakarya Zaferi''nin akabinde İtilaf Devletleri Sevr Antlaşması dayatmasından bütünüyle vazgeçerek TBMM''nin Misakımillî hedeflerini hiçbir şart koşmaksızın hemen onaylamıştır.","D":"Güney Cephesi''nin kapanması ve Doğu sınırının kesinleşmesi, TBMM Hükûmeti''nin bütün askerî ve lojistik gücünü nihai darbe için Batı Cephesi''ne yoğunlaştırmasına olanak tanımıştır."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, LGS''de sıkça kurulan ''Askerî Zafer -> Diplomatik Başarı'' ilişkisi ve kronolojik çıkarım mantığını ölçer. Sakarya Zaferi diplomatik bir dönüm noktasıdır; Fransa ile Ankara, Kafkaslarla Kars Antlaşmaları imzalanmış, İtilaf bloğu çatlamıştır. Ancak İtilaf Devletleri Sevr''den derhâl vazgeçmemiş ve Misakımillî''yi koşulsuz kabul etmemiştir. Hâlâ barış için Sevr''i yumuşatarak sunmaya çalışmışlardır. Misakımillî''nin İtilaflara kabul ettirilmesi Büyük Taarruz, Başkomutan Meydan Muharebesi, Mudanya Ateşkesi ve nihayetinde Lozan Barış Antlaşması ile gerçekleşmiştir. Dolayısıyla C seçeneğindeki iddia tarihen olanaksızdır.',
          'Hadiseler ve sonuçları incelendiğinde:
- Mustafa Kemal''e unvan verilmesi iç politikayı, Kars ve Ankara Antlaşmaları ise dış politikadaki büyük kazanımları kanıtlar (A şıkkı doğru).
- Bir İtilaf devleti olan Fransa''nın TBMM ile anlaşarak geri çekilmesi ve İtalya''nın işgali sonlandırması, İtilaf bloğunun dağıldığını ve İngiltere''nin yalnızlaştığını gösterir (B şıkkı doğru).
- Doğu ve Güney sınırlarının güvenceye alınması, tüm asker ve cephanenin Batı Cephesi''ne (Büyük Taarruz hazırlıklarına) kaydırılmasını sağlamıştır (D şıkkı doğru).
- C şıkkı ise yanlıştır. Sakarya''dan sonra İtilaf Devletleri Misakımillî''yi derhâl onaylamamış; Sevr''in tadil edilmiş teklifleriyle zaman kazanmaya çalışmışlardır. Türkiye''nin tam bağımsızlığını ve Misakımillî''yi kabul etmeleri ancak Büyük Taarruz zaferi ve Lozan Barış Antlaşması ile mümkün olmuştur.',
          '{"A":"Güçlü Çeldirici (İç-Dış Politika Ayrımı): İç ve dış politika korelasyonunu kuran doğru bir analizdir; aranan olumsuz cevap olamaz.","B":"Orta Çeldirici (Diplomatik Ayrışma): İtilaf bloğunun parçalanması Fransa ve İtalya''nın çekilmesiyle doğrulanır.","D":"Zayıf Çeldirici: Askerî stratejinin doğal sonucudur; doğu ve güney rahatlayınca batıya yüklenilmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000095'::uuid,
          95,
          'LGS-SOS-T2-05',
          'I. İnönü Zaferi''nin ardından İtilaf Devletleri Londra Konferansı''nı toplamış; Sovyet Rusya ile Moskova Antlaşması, Afganistan ile Dostluk Antlaşması imzalanmıştır.',
          'Tarihsel sıralanış ve diplomasi kuralları uygulandığında bu gelişmeler aşağıdaki yargılardan hangisini doğrudan kanıtlar?',
          '{"A":"Askerî zaferlerin diplomatik ve siyasi başarıları beraberinde getirdiğini","B":"Millî Mücadele''nin askerî safhasının tamamen sona erdiğini","C":"İtilaf Devletleri arasındaki tüm görüş ayrılıklarının bittiğini","D":"Kurtuluş Savaşı''nın tek cephede cereyan ettiğini"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Muharebe meydanındaki askerî zafer (I. İnönü), uluslararası alanda diplomatik anlaşmaları ve tanınmayı (Londra, Moskova, Afganistan) doğurmuştur.',
          'Düzenli ordunun I. İnönü Zaferi, TBMM''nin saygınlığını artırmış; İtilaf Devletleri ve diğer ülkeler TBMM ile antlaşmalar imzalamak zorunda kalmıştır. Askerî başarı siyasi başarıyı getirmiştir.',
          '{"B":"Askerî safha Sakarya ve Başkomutanlık Meydan Muharebesi''yle devam etmiştir, bitmemiştir.","C":"Görüş ayrılıkları bitmemiş, aksine İtilaf bloğu çatlamaya başlamıştır.","D":"Savaş Doğu, Güney ve Batı olmak üzere üç ana cephede sürmüştür."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000096'::uuid,
          96,
          'LGS-SOS-T2-06',
          'Kütahya-Eskişehir Savaşları''nın ardından TBMM, 5 Ağustos 1921''de Mustafa Kemal Paşa''ya meclisin tüm yetkilerini üç ay süreyle devreden olağanüstü Başkomutanlık Kanunu''nu kabul etmiştir. Bu stratejik kararda meclis yetkiyi istediğinde geri alma hakkını saklı tutmuştur.',
          'Mustafa Kemal Paşa''ya bu yetkilerin üçer aylık sürelerle devredilmesi meclisin en çok hangi ilkeyi koruma stratejisini benimsediğini kanıtlar?',
          '{"A":"Kişisel diktatörlük özlemlerinin","B":"TBMM''nin üstünlüğü ve millî irade ilkesinin","C":"Saltanat makamının meşruiyetinin","D":"İtilaf Devletleri ile olan ateşkes şartlarının"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Yetkinin süreli verilmesi ve meclisin denetim hakkını elinde tutması, nihai iradenin halkın temsilcisi olan TBMM''de olduğunu kanıtlar.',
          'Meclisin yetkiyi süresiz değil üçer aylık periyotlarla devretmesi ve uzatma kararını oylaması, olağanüstü harp şartlarında dahi millî iradenin ve parlamenter üstünlüğün tavizsiz korunduğunun göstergesidir.',
          '{"A":"Süreli yetki tam tersine kişisel otoriterleşmeyi engellemek için konulmuştur.","C":"TBMM saltanatın meşruiyetini değil, ulusal egemenliği savunmaktadır.","D":"İtilaf Devletleri ile o tarihte henüz ateşkes yapılmamıştır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000097'::uuid,
          97,
          'LGS-SOS-01',
          'Mustafa Kemal''in askerî ve siyasi kişiliğinin şekillenmesinde gençlik ve subaylık yıllarını geçirdiği şehirlerin sosyal, kültürel ve siyasal dokusu önemli izler bırakmıştır:

• Selânik: Batı ile demir yolu ve deniz yolu bağlantısına sahip, çok dilli ve çok uluslu bir Osmanlı liman kentiydi. Avrupa''da basılan gazete, dergi ve kitapların şehre kolayca girmesi, Mustafa Kemal''in dünyadaki siyasal hareketleri ve aydınlanma fikirlerini erken yaşta izlemesini sağlamış; farklı millet ve inançtan insanların bir arada yaşama kültürü onda hoşgörü, çoğulculuk ve dünya meselelerine açık bir zihniyet geliştirmiştir.

• Manastır: Askerî İdadi eğitimi sırasında vatan şairi Namık Kemal''in hürriyet temalı şiirleri ve Mehmet Emin Yurdakul''un millî coşkusuyla tanışmış; aynı zamanda J. J. Rousseau, Voltaire ve Montesquieu gibi Fransız aydınlarının adalet, eşitlik ve cumhuriyet fikirlerini tetkik etmiştir. 1897''de Osmanlı ordusu Dömeke Meydan Muharebesi''nde Yunan ordusunu hezimete uğratmasına rağmen, masa başında imzalanan İstanbul Antlaşması''nda istediği diplomatik sonucu alamamıştır. Genç Mustafa Kemal, askerî zaferlerin tek başına yetersiz kaldığını ve mutlaka yetkin bir diplomasiyle taçlandırılması gerektiğini bu hadiseyle bizzat tecrübe etmiştir.

• Sofya: Balkan Savaşları sonrasında askerî ataşe olarak atandığı Bulgaristan''ın başkentinde, Bulgar Parlamentosu''nun (Sobranje) oturumlarını dinleyici locasından takip ederek yasa yapma süreçlerini, meclis müzakerelerini ve çok partili siyasal rejimi gözlemlemiştir. Ayrıca Batılı diplomatlarla doğrudan temas kurmuş, düzenlenen opera ve balelere katılarak Avrupa toplum hayatının kültürel dinamiklerini ve diplomatik protokol kurallarını yakından incelemiştir.',
          'Verilen bu metinden hareketle Mustafa Kemal''in fikir hayatı ve edindiği kazanımlarla ilgili aşağıdaki çıkarımlardan hangisi yapılamaz?',
          '{"A":"Selânik''teki kültürel çeşitlilik ve serbest basın ortamı, onun dogmatik kalıplardan uzak ve çağdaş gelişmelere açık bir vizyon kazanmasında etkili olmuştur.","B":"1897 Türk-Yunan Savaşı sonrasında yaşanan diplomatik süreç, sahada süngüyle kazanılan zaferlerin masada diplomatik maharetle perçinlenmesi gerektiği bilincini doğurmuştur.","C":"Sofya''daki görev ve gözlemleri, ileride kuracağı millî devletin demokratik ve parlamenter kurumlarının tasarlanmasında önemli bir pratik tecrübe kaynağı teşkil etmiştir.","D":"Manastır''daki fikrî birikimi, Batılı düşünürlerin yönetim modellerini Osmanlı''nın geleneksel monarşik yapısını koşulsuz korumak amacıyla benimsemesine yol açmıştır."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, MEB LGS''nin klasik ''Metinden Çıkarım Yapma ve Kavram Analizi'' soru tipidir. İlk adımda her şehrin Mustafa Kemal''e kazandırdığı vasfı zihninizde haritalandırın: Selânik -> Hoşgörü, çok kültürlülük ve çağdaş fikirler; Manastır -> Milliyetçilik, hürriyet, adalet ve diplomasi bilinci; Sofya -> Parlamenter meclis işleyişi ve modern diplomatik protokol. Ardından seçeneklerdeki ''aşırı genelleme'' veya ''tarihsel çelişki'' içeren ifadeyi arayın. D şıkkındaki ''Osmanlı''nın geleneksel monarşik yapısını koşulsuz koruma'' ifadesi; Rousseau ve Montesquieu gibi cumhuriyetçi aydınların fikirleriyle ve Mustafa Kemal''in halk egemenliğine dayalı inkılapçı karakteriyle taban tabana zıttır.',
          'Metindeki bilgiler analiz edildiğinde:
- Selânik''teki basın-yayın zenginliği ve çok uluslu yapı, A şıkkında belirtilen çağdaş gelişmelere açık ve yenilikçi bir vizyon kazanmasını doğrudan doğrular.
- Manastır bölümünde geçen ''askerî zaferlerin tek başına yetersiz kaldığını ve mutlaka yetkin bir diplomasiyle taçlandırılması gerektiğini bu hadiseyle bizzat tecrübe etmiştir'' tespiti, B şıkkındaki çıkarımı kesin olarak ispatlar.
- Sofya bölümünde ''Bulgar Parlamentosu''nun oturumlarını takip ederek yasa yapma süreçlerini ve meclis müzakerelerini gözlemlemesi'', C şıkkında yer alan gelecekteki demokratik ve parlamenter kurumların tasarlanmasında tecrübe kaynağı olduğu yargısını destekler.
- D şıkkında iddia edilen ''Batılı düşünürlerin yönetim modellerini monarşik yapıyı koşulsuz korumak için benimsediği'' yargısı ise tamamen yanlıştır. Rousseau ve Montesquieu monarşiyi değil; millî egemenlik, kuvvetler ayrılığı ve cumhuriyet kavramlarını savunur. Dolayısıyla bu çıkarım yapılamaz.',
          '{"A":"Kısmi Doğru Tuzağı: Metinde geçen ''farklı inançtan insanların bir arada yaşama kültürü ve yabancı basını izlemesi'' doğrudan bu yargıyı doğruladığı için doğru bir çıkarımdır; aranan ''yapılamaz'' cevabı olamaz.","B":"Güçlü Çeldirici (Metinle Birebir Örtüşme): 1897 Türk-Yunan Savaşı''nın askerî ve diplomatik çelişkisine odaklanan öğrenci bu seçeneğin doğruluğunu görerek eler; ancak olumsuz soru kökünü gözden kaçıran dikkatsiz öğrencinin düşebileceği ilk tuzaktır.","C":"Orta Çeldirici: Sofya''daki parlamento izlenimleri ile meclis ve demokrasi tecrübesi arasında nedensellik ilişkisi kurulduğu için metne tam uyumlu ve geçerli bir tarihsel tespittir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000098'::uuid,
          98,
          'LGS-SOS-02',
          'Millî Mücadele''nin teşkilatlanma döneminde yayımlanan Amasya Genelgesi (22 Haziran 1919) ve toplanan Erzurum Kongresi''nde (23 Temmuz - 7 Ağustos 1919) alınan bazı tarihî kararlar şunlardır:

• Karar I (Amasya Genelgesi): Vatanın bütünlüğü, milletin bağımsızlığı tehlikededir. İstanbul Hükûmeti, üzerine düşen görevi yerine getirememektedir. Bu durum milletimizi yok olmuş gibi göstermektedir.
• Karar II (Amasya Genelgesi): Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.
• Karar III (Erzurum Kongresi): Millî sınırlar içinde vatan bir bütündür, birbirinden ayrılamaz ve parçalanamaz.
• Karar IV (Erzurum Kongresi): Kuvâ-yı Millîye''yi tek kuvvet tanımak ve millî iradeyi hâkim kılmak esastır.
• Karar V (Erzurum Kongresi): Manda ve himaye kabul edilemez.',
          'Bu tarihsel kararlar birlikte değerlendirildiğinde Millî Mücadele''nin temel ilkeleri ve izlenen stratejiyle ilgili aşağıdaki yargılardan hangisi yanlıştır?',
          '{"A":"Karar II ve Karar IV; Millî Mücadele''nin yalnızca işgalcileri kovmayı değil, aynı zamanda egemenliğin kaynağını saltanattan alıp millete devretmeyi hedeflediğini ortaya koymuştur.","B":"Karar I ve Karar III; ülkenin içinde bulunduğu felaketin gerekçesini belirterek bölünmez bir vatan haritası çizmiş ve topyekûn direniş meşruiyetini ilan etmiştir.","C":"Karar V; manda ve himaye fikrini reddederek bağımsızlık mücadelesinde gerekirse güçlü bir yabancı devletin siyasi ve askerî vesayeti altına girilebileceğini savunmuştur.","D":"Karar II; ''milletin bağımsızlığı'' ifadesiyle Millî Mücadele''nin nihai amacını, ''milletin azim ve kararı'' ifadesiyle de bu amaca hangi yöntemle ulaşılacağını ilk kez formüle etmiştir."}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, LGS İnkılap Tarihi testinin en temel iki kavram sütununu sınar: ''Ulusal Egemenlik'' (millet iradesi, halkın yönetimi, cumhuriyet) ve ''Tam Bağımsızlık'' (manda ve himayenin reddi, hiçbir dış gücün vesayetini tanımama). Çözüm adımı: ''Manda ve himaye kabul edilemez'' ilkesi tam bağımsızlığın tavizsiz ifadesidir; başka bir devletin güvencesi veya sömürgesi altına girmeyi kökten reddeder. C seçeneğinde geçen ''yabancı devletin vesayeti altına girilebileceği'' ifadesi manda fikrinin tanımıdır ve Erzurum Kongresi''nin amacıyla 180 derece zıttır.',
          'Öncüldeki tarihî kararlar kavramsal ve bağlamsal olarak incelendiğinde:
- ''Milletin azim ve kararı'' (Amasya) ile ''Millî iradeyi hâkim kılmak'' (Erzurum) kararları; padişahın mutlak iradesi yerine halk egemenliğini işaret eder. Bu durum hem düşmanı kovmayı hem de ileride yönetim biçimini (rejim) değiştirerek millî egemenliğe geçileceğini kanıtlar (A şıkkı doğru).
- Karar I mücadelemizin somut gerekçesini (''Vatanın bütünlüğü tehlikededir''), Karar III ise Misakımillî''nin çekirdeğini oluşturan bölünmez vatan ilkesini açıklar (B şıkkı doğru).
- Karar II''de geçen ''Milletin bağımsızlığını'' hedefi kurtuluşun amacını; ''milletin azim ve kararı kurtaracaktır'' ilkesi ise kurtuluşun ancak halkın kendi öz gücüyle gerçekleştirileceği yöntemini belirler (D şıkkı doğru).
- C şıkkında ise manda ve himayenin reddedilmesinin ''güçlü bir devletin vesayetine girilebileceği'' şeklinde izah edilmesi bariz bir kavram yanılgısıdır. Manda ve himaye ''Ya istiklal ya ölüm!'' parolasıyla tamamen reddedilmiştir. Dolayısıyla C şıkkı yanlıştır.',
          '{"A":"Güçlü Çeldirici (Kavram Yanılgısı Tuzağı): Birçok öğrenci Kurtuluş Savaşı''nı yalnızca dış düşmana karşı bir savaş olarak yorumlar ve saltanata karşı rejim değişikliği boyutunu gözden kaçırır. Ancak ''millî irade'' kavramı açıkça ulusal egemenlik devrimidir; bu şık doğru olduğu için elenmelidir.","B":"Orta Çeldirici (Gerekçe-Hedef İlişkisi): Vatanın tehlikede oluşu ile vatanın bütünlüğü maddelerini başarıyla eşleştiren doğru bir analizdir.","D":"Zayıf Çeldirici: Amasya Genelgesi''nin amaç-gerekçe-yöntem ayrımı MEB öğretim programının omurgasıdır; öğrenci bu eşleşmenin doğruluğunu bilerek şıkkı eler."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":5,"starLabel":"★★★★★","category":"5 Yıldız • Şampiyon / Üst Düzey Seçici","placement":"Deneme Sınavı Seçici Soruları (%1''lik Dilim Ayırt Edici)","rationale":"Çok adımlı optimizasyon, soyut modelleme ve yüksek analitik akıl yürütme içerir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000099'::uuid,
          99,
          'LGS-SOS-03',
          '16-21 Temmuz 1921 tarihlerinde, Kurtuluş Savaşı’nın en kritik safhalarından biri olan Kütahya-Eskişehir Muharebeleri tüm şiddetiyle devam etmekteydi. Türk ordusu taktiksel bir kararla Sakarya Nehri''nin doğusuna çekilmek zorunda kalmış, Yunan taarruz birliklerinin Ankara''ya yaklaşması üzerine TBMM''de meclis merkezinin Kayseri''ye nakledilmesi dahi hararetle tartışılmaya başlanmıştı.

Böylesine buhranlı ve ölüm kalım savaşı verilen bir atmosferde, Maarif Vekili (Millî Eğitim Bakanı) Hamdullah Suphi Bey cephedeki olağanüstü tehlike sebebiyle daha önceden kararlaştırılan öğretmenler kongresinin ertelenmesini Mustafa Kemal Paşa’ya teklif etmiştir. Mustafa Kemal bu teklife kesin bir kararlılıkla karşı çıkarak şu tarihî cevabı vermiştir:

''Hayır, ertelemeyiniz! Cahilliğe karşı açılan savaş, düşmana karşı açılan savaştan daha az mühim değildir. Cephedeki askerimiz kadar, okullardaki muallimlerimiz de istikbalimizin ve hürriyetimizin gerçek mimarlarıdır.''

Mustafa Kemal Paşa''nın bizzat cepheden Ankara''ya gelerek açış konuşmasını yaptığı I. Maarif Kongresi''ne; yurdun dört bir yanından işgal hatlarını ve ulaşım güçlüklerini aşarak gelen 180''den fazla kadın ve erkek öğretmen katılmış; geleceğin bağımsız Türkiye''sinin eğitim programı, millî kültür politikası ve çağdaş maarif seferberliği masaya yatırılmıştır.',
          'Buna göre en çetin muharebelerin cereyan ettiği günlerde I. Maarif Kongresi’nin ertelenmeyerek toplanması, Millî Mücadele liderliğinin benimsediği vizyonla ilgili aşağıdakilerden hangisinin en kesin kanıtıdır?',
          '{"A":"Askerî zaferler kazanılsa dahi eğitim ve kültür alanında cehalet mağlup edilmedikçe gerçek ve kalıcı bir bağımsızlığın kurulamayacağı inancının","B":"Savaş ortamının yarattığı kaynak yetersizliği sebebiyle eğitim müfredatının yabancı devletlerin uzman heyetlerine havale edildiğinin","C":"TBMM Hükûmeti''nin orduyu terhis ederek tüm millî bütçe kaynaklarını yeni okul binaları inşasına aktarma kararı aldığının","D":"Millî Mücadele sürecinde silahlı direnişin tamamen faydasız görüldüğünün ve barış antlaşmaları için masaya oturulduğunun"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, MEB Türkiye Yüzyılı Maarif Modeli''nin esin kaynağı olan ''Maarif Kongresi ve Millî Eğitim Vizyonu'' temalı üst düzey bir çıkarım sorusudur. Çözüm metodolojisi: Ankara kapılarına top seslerinin dayandığı bir kriz ortamında devlet başkanı neden cepheden gelip öğretmenleri toplar? ''Cahillikle savaş düşmanla savaştan az mühim değildir'' sözünün felsefi temeline odaklanın: Askerî istiklal, fikrî ve kültürel istiklal ile kökleşmezse milletler bağımsız kalamaz. Bu derin anlamı yansıtan A seçeneğini tespit edin; ''askerî harcamaları tamamen kesme'' veya ''yabancı uzmanlara devretme'' gibi metin dışı aşırılıkları hızla eleyin.',
          'Tarihsel metin ve bağlam analiz edildiğinde:
- Mustafa Kemal Paşa''nın ''Cahilliğe karşı açılan savaş, düşmana karşı açılan savaştan daha az mühim değildir'' tespiti, vatan savunmasının yalnızca cephede topla tüfekle değil, zihinlerde cehaleti yenerek kazanılabileceğini ortaya koyar. Top seslerinin Ankara''dan duyulduğu günlerde öğretmenlerin toplanıp bağımsız Türkiye''nin eğitim programının hazırlanması; askerî zaferlerin eğitim ve kültür hamlesiyle taçlandırılmadıkça kalıcı olamayacağını ve tam bağımsızlığın ancak maarif seferberliğiyle tamamlanacağını gösterir (Doğru cevap A).

Diğer şıklar incelendiğinde:
- B şıkkı yanlıştır; kongrede yabancı vesayeti değil, ''millî kültür politikası ve yerli eğitim'' ideali savunulmuştur.
- C şıkkı tarihsel ve mantıksal bir saçmalıktır; Türk ordusu savaşırken ordunun terhis edilmesi veya bütçenin yalnızca okul yapımına kaydırılması söz konusu değildir.
- D şıkkı tarihsel kronolojiyle çelişir; Kütahya-Eskişehir Muharebeleri''nden sonra Sakarya Meydan Muharebesi ve Büyük Taarruz ile silahlı direniş zafere ulaştırılmıştır.',
          '{"B":"Güçlü Çeldirici (Kavram Yanılgısı Tuzağı): Dönemin bazı çevrelerinde görülen Batı mandası arayışlarını maarif sahasına uyarlayan şıktır; metinde ''millî kültür politikası'' hedeflendiği vurgulanarak bu yanılgı bertaraf edilmiştir.","C":"Orta Çeldirici (Aşırı Genelleme Tuzağı): Eğitime verilen olağanüstü önemi ''askerî savunmadan tamamen vazgeçildi'' şeklinde abartan ve metin gerçekliğini bozan yanıltıcı seçenektir.","D":"Zayıf Çeldirici (Tarihsel Akışa Zıt Yorum): Kongrenin savaş ortamında toplandığı belirtilmesine karşılık silahlı direnişin terk edildiğini savunan kronolojik açıdan temelsiz ifadedir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":5,"starLabel":"★★★★★","category":"5 Yıldız • Şampiyon / Üst Düzey Seçici","placement":"Deneme Sınavı Seçici Soruları (%1''lik Dilim Ayırt Edici)","rationale":"Çok adımlı optimizasyon, soyut modelleme ve yüksek analitik akıl yürütme içerir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000100'::uuid,
          100,
          'LGS-SOS-04',
          'Lozan Barış Konferansı’na giden Türk heyetine TBMM Hükûmeti tarafından verilen 14 maddelik yönergede iki temel meselede asla taviz verilmemesi, bu konularda uzlaşma sağlanamazsa gerekirse müzakerelerin derhâl kesilip savaşa yeniden başlanması kesin olarak emredilmiştir: ''Ermeni yurdu meselesi ve Kapitülasyonların koşulsuz kaldırılması.''

Konferans görüşmelerinde İtilaf Devletleri; Osmanlı Devleti''nin asırlardır yabancı tüccar ve devletlere tanıdığı mali, adli ve idari imtiyazların (kapitülasyonlar) yürürlükte kalmasını ısrarla savunmuş, bu ayrıcalıklar feshedilirse genç Türk devletinin iktisaden batacağını iddia etmiştir. Türk Heyeti Başkanı İsmet Paşa ise bu sömürgeci dayatmalara karşı şu tarihî cevabı vermiştir:

''Biz buraya esir veya mağlup bir millet olarak değil; kanını akıtmış, meşru haklarını cephede söke söke almış bağımsız bir millet olarak geldik. Memleketimizin iktisadi, adli ve idari hayatını yabancıların vesayetine terk eden hiçbir kayıt ve zinciri kabul etmeyiz. Çünkü siyasi istiklal, ancak iktisadi istiklal ile mümkündür.''

Çetin diplomatik müzakereler neticesinde 24 Temmuz 1923’te imzalanan Lozan Barış Antlaşması ile kapitülasyonlar bütün sonuçlarıyla birlikte tamamen kaldırılmış ve Osmanlı maliyesini denetleyen Düyûn-ı Umûmiye (Genel Borçlar İdaresi) teşkilatının Türkiye üzerindeki yetkilerine son verilmiştir.',
          'Lozan Barış Antlaşması''ndaki bu gelişmeler ve İsmet Paşa''nın diplomatik duruşu birlikte değerlendirildiğinde Türkiye''nin elde ettiği kazanımlarla ilgili aşağıdaki yargılardan hangisine ulaşılamaz?',
          '{"A":"Kapitülasyonların ve Düyûn-ı Umûmiye''nin kaldırılmasıyla, uluslararası arenada devletlerin egemen eşitliği ilkesi Türkiye açısından fiilen hayata geçirilmiştir.","B":"Ekonomik bağımsızlık sağlanmadan tam siyasi bağımsızlığın korunamayacağı tezi, emperyalist devletlere kabul ettirilerek antlaşma metninde tescillenmiştir.","C":"Türkiye; kendi gümrük tarifelerini, vergi politikalarını ve adli yargı düzenini yabancı müdahalesi olmaksızın millî iradesiyle belirleme hakkına kavuşmuştur.","D":"Kapitülasyonların tasfiyesi neticesinde Türkiye, Batılı devletlerle olan tüm dış ticaret ve ekonomik münasebetlerini kalıcı olarak sonlandırma yoluna gitmiştir."}'::jsonb,
          'D',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Bu soru, LGS sınavlarında sıkça ölçülen ''Ekonomik Bağımsızlık ile Dışa Kapanma (İzolasyonizm)'' arasındaki kavram yanılgısını test eder. Çözüm algoritması: Kapitülasyonların kaldırılması, yabancı ülkelerle ticaret yapmamak veya sınırları dünyaya kapatmak demek değildir. Aksine, ticareti tek taraflı imtiyaz ve sömürüden arındırıp ''eşit ve karşılıklı haklara dayalı egemen ticaret'' zeminine oturtmaktır. D seçeneğindeki ''tüm dış ticaret ve ekonomik münasebetlerini kalıcı olarak sonlandırma'' ifadesi mantıksal ve tarihsel bir çarpıtmadır; bu nedenle ulaşılamaz olan doğru yanıttır.',
          'Metin ve tarihsel veriler değerlendirildiğinde:
- Kapitülasyonların ve Osmanlı''dan kalan mali vesayet organı Düyûn-ı Umûmiye''nin ortadan kaldırılması, Türkiye Cumhuriyeti''nin diğer bağımsız devletlerle eşit haklara sahip egemen bir devlet olduğunu uluslararası hukuka tescil ettirmiştir (A şıkkı doğru).
- İsmet Paşa''nın ''Siyasi istiklal, ancak iktisadi istiklal ile mümkündür'' vecizesi, mali ve ekonomik bağımsızlık olmaksızın siyasi hürriyetin yaşatılamayacağını vurgular ve Lozan''da bu şart kabul ettirilmiştir (B şıkkı doğru).
- Kapitülasyonların adli ve mali ayrıcalıklarının kalkması sayesinde; yabancıların Türk mahkemelerine tabi olması ve gümrük/vergi politikalarının serbestçe Türk Hükûmeti tarafından belirlenmesi güvenceye alınmıştır (C şıkkı doğru).
- D şıkkındaki ''dış ticaret ve ekonomik münasebetlerin tamamen sonlandırıldığı'' iddiası ise tamamen asılsızdır. Türkiye hiçbir zaman dış ticaretini kapatmamış, bilakis kapitülasyonsuz, hür ve millî bir gümrük sistemiyle uluslararası ticaretine devam etmiştir. Dolayısıyla bu yargıya ulaşılamaz.',
          '{"A":"Güçlü Çeldirici (Kavramsal Derinlik Tuzağı): Düyûn-ı Umûmiye''nin feshini yalnızca borç meselesi sanan öğrenciler ''egemen eşitlik'' ilkesini soyut bularak bu şıkka yönelebilir; oysa bir devletin maliyesinin yabancı komisyondan kurtulması egemen eşitliğin doğrudan gereğidir.","B":"Orta Çeldirici: İsmet Paşa''nın konuşmasındaki ''iktisadi istiklal - siyasi istiklal'' korelasyonunun doğrudan karşılığıdır; metinden açıkça çıkarılabildiği için elenir.","C":"Zayıf Çeldirici: Kapitülasyonların kalkmasının adli ve mali sahada sağladığı somut egemenlik haklarıdır; tarihsel gerçekliği tartışmasızdır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"verdict":"APPROVED","passed":true,"score":0.99,"decisions":{"is_meb_aligned":true,"single_deterministic_answer":true,"bloom_taxonomy_level":"ANALYZE","distractor_strength_score":0.95,"tdk_compliance":true,"has_pedagogical_hints":true,"star_rating":{"stars":4,"starLabel":"★★★★☆","category":"4 Yıldız • LGS Yeni Nesil (İleri Düzey)","placement":"LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)","rationale":"Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir."}},"reasons":[],"timestamp":"2026-10-01T15:58:53.981Z"}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000101'::uuid,
          101,
          'LGS-SOS-T3-05',
          'Mudanya Ateşkes Antlaşması''nın kuralları gereğince Doğu Trakya, İstanbul ve Boğazlar savaş yapılmadan diplomatik yolla TBMM idaresine devredilmiştir. Antlaşmada İstanbul Hükûmeti tamamen yok sayılmıştır.',
          'Uluslararası antlaşma kuralları uygulandığında bu durum Osmanlı Devleti açısından aşağıdaki hukuki sonuçlardan hangisini doğurmuştur?',
          '{"A":"Osmanlı Devleti''nin resmen sona ermesi","B":"Osmanlı Devleti''nin hukuken sona ermesi","C":"Osmanlı Devleti''nin fiilen sona ermesi","D":"Osmanlı Devleti''nin cumhuriyete dönüşmesi"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Osmanlı Devleti Mondros''la fiilen, Mudanya''da başkenti TBMM''ye bırakılarak hukuken, Saltanatın kaldırılmasıyla resmen sona ermiştir.',
          'Mudanya''da İtilaf Devletlerinin İstanbul''u TBMM yönetimine bırakması ve İstanbul Hükûmeti''ni masaya dahi çağırmaması Osmanlı''nın hukuken sona erdiğinin kanıtıdır.',
          '{"A":"Resmen sona eriş 1 Kasım 1922''de Saltanatın kaldırılmasıyladır.","C":"Fiilen sona eriş Mondros Ateşkesi iledir.","D":"Osmanlı cumhuriyete dönüşmemiş, yerine yeni Türk devleti kurulmuştur."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000102'::uuid,
          102,
          'LGS-SOS-T3-06',
          'Lozan Barış Konferansı''nda Türk heyeti, adli, mali ve idari kısıtlamalar içeren kapitülasyonların koşulsuz kaldırılmasını talep etmiştir. Batılı devletlerin baskıları karşısında İsmet Paşa, bu kısıtların kaldırılması uğruna gerekirse konferansı terk etme stratejisini ortaya koymuştur.',
          'Türk heyetinin kapitülasyon kısıtlamaları karşısındaki bu tavizsiz tutumu en fazla hangi ilkeyi ödünsüz gerçekleştirme kararlılığını kanıtlar?',
          '{"A":"Ekonomik ve siyasi tam bağımsızlık ilkesi","B":"Batı blokuyla askeri ittifak kurma arzusu","C":"Monarşik yetkilerin devam ettirilmesi isteği","D":"Gümrük vergilerini tamamen sıfırlama politikası"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Kapitülasyonlar devletin egemenlik haklarını kısıtlayan en ağır ekonomik prangadır. Kaldırılması tam bağımsızlığın (Misakımilli) olmazsa olmaz şartıdır.',
          'Kapitülasyonlar hem adli hem de mali bağımsızlığı ortadan kaldıran sömürgeci ayrıcalıklardır. Türk heyetinin savaşı dahi göze alması, bağımsızlıktan ödün verilemeyeceğinin (tam bağımsızlık) kanıtıdır.',
          '{"B":"Askeri ittifak arayışı değil, egemenlik haklarının korunmasıdır.","C":"Saltanat zaten kaldırılmıştır, monarşi hedeflenmemektedir.","D":"Gümrükleri sıfırlamak değil, yerli üreticiyi korumak için gümrük hakkını geri almaktır."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000103'::uuid,
          103,
          'LGS-SOS-T4-01',
          'Mustafa Kemal Atatürk: ''Egemenlik, kayıtsız şartsız milletindir.'' vecizesiyle devlet yönetiminde nihai kararın halkın seçtiği temsilcilere ait olduğunu vurgulamıştır.',
          'Bu ilke doğrudan aşağıdaki Atatürk ilkelerinden hangisiyle ilişkilidir?',
          '{"A":"Cumhuriyetçilik","B":"Devletçilik","C":"Laiklik","D":"İnkılapçılık"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Millet egemenliği, seçim, oy kullanma ve halkın kendi kendini yönetmesi Cumhuriyetçilik ilkesinin temelidir.',
          'Millet iradesi, meclis, seçim ve egemenliğin halka ait olması kavramları doğrudan Cumhuriyetçilik ilkesinin özünü teşkil eder.',
          '{"B":"Devletçilik iktisadi kalkınma ve devlet eliyle fabrika/banka kurulmasıdır.","C":"Laiklik din ve devlet işlerinin ayrılması, vicdan hürriyetidir.","D":"İnkılapçılık çağdaşlaşma ve sürekli dinamik yeniliktir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000104'::uuid,
          104,
          'LGS-SOS-T4-02',
          'Cumhuriyetin ilk yıllarında Türk Tarih Kurumu ve Türk Dil Kurumunun kurulması, Kabotaj Kanunu kurallarının işletilerek Türk denizlerinde ticaret hakkının Türk denizcilerine verilmesi sağlanmıştır.',
          'Kültür ve egemenlik kuralları uygulandığında yapılan bu inkılaplar ortak olarak hangi Atatürk ilkesinin yansımasıdır?',
          '{"A":"Devletçilik","B":"Milliyetçilik","C":"Halkçılık","D":"Laiklik"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: ''Türk'' milli kimliğini, tarihini, dilini ve milli karasularındaki egemenliği güçlendiren hamleler Milliyetçilik ilkesidir.',
          'Türk Dil ve Tarih Kurumları kültürel milliyetçiliği; Kabotaj Kanunu ise denizlerdeki millî egemenliği (iktisadi milliyetçilik) sağladığı için Milliyetçilik ilkesiyle doğrudan ilgilidir.',
          '{"A":"Devletçilik doğrudan sanayi yatırımlarıyla ilgilidir.","C":"Halkçılık kanun önünde eşitlik ve sınıfsız toplum idealidir.","D":"Laiklik akıl ve bilimi rehber edinme, inanç özgürlüğüdür."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000105'::uuid,
          105,
          'LGS-SOS-T4-03',
          'Aşar vergisinin kaldırılması, Soyadı Kanunu kurallarının uygulanması ve unvan bildiren lakapların yasaklanması ile kadınlara seçme-seçilme hakkının tanınması gerçekleştirilmiştir.',
          'Cumhuriyet dönemi inkılap kuralları uygulandığında bu adımların toplumdaki en temel ortak hedefi aşağıdakilerden hangisidir?',
          '{"A":"Sınıfsız, imtiyazsız ve kanun önünde eşit bir toplum oluşturmak","B":"Merkezi bütçenin vergi gelirlerini artırmak","C":"Dış borçlanmayı kolaylaştırmak","D":"Geleneksel zümre hiyerarşisini muhafaza etmek"}'::jsonb,
          'A',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Aşar vergisinin kalkması köylüyü rahatlatmış, Soyadı Kanunu zümre ayrıcalıklarını silmiş, kadın hakları cinsiyet eşitliğini sağlamıştır. Bu Halkçılık (eşitlik) ilkesidir.',
          'Halkçılık kanun önünde eşitliği, hiçbir kişi veya zümreye ayrıcalık tanınmamasını hedefler. Aşar vergisinin kalkması ve unvanların yasaklanması doğrudan eşitliği tesis eder.',
          '{"B":"Aşar vergisi kalktığında devletin bütçe geliri azalmıştır (halk lehine fedakârlık yapılmıştır).","C":"Dış borçlanmayla bir ilgisi yoktur.","D":"Geleneksel ayrıcalıkları muhafaza etmek değil, ortadan kaldırmak hedeflenmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000106'::uuid,
          106,
          'LGS-SOS-T4-04',
          '1923 İzmir İktisat Kongresi''nde özel sektörün teşvik edilmesi kararlaştırılmış (Teşvik-i Sanayi Kanunu), ancak sermaye ve teknik bilgi yetersizliği ile 1929 Dünya Ekonomik Buhranı nedeniyle sanayi yatırımları arzu edilen hıza ulaşamamıştır. Bunun üzerine devlet bizzat devreye girerek Birinci Beş Yıllık Sanayi Planı''nı uygulamaya koymuş; şeker, kumaş, demir-çelik fabrikalarını kurmuştur.',
          'Bu gelişme Devletçilik ilkesinin uygulanmasında aşağıdakilerden hangisinin belirleyici olduğunu kanıtlar?',
          '{"A":"Özel teşebbüsün tamamen yasaklanması politikasının","B":"Ülke şartlarının ve tarihsel zorunlulukların doğurduğu pragmatik yaklaşımın","C":"Yabancı sermayenin kontrolüne girme zorunluluğunun","D":"Tarım sektörünün sanayiye feda edilmesinin"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Devletçilik Türkiye''de ideolojik bir doktrin olarak değil; sermayesizlik ve kriz şartlarında halkın temel ihtiyaçlarını karşılamak için zorunluluktan doğmuştur.',
          'Metin açıkça özel sektörün desteklendiğini fakat kriz ve imkânsızlıklar yüzünden devletin öncülük etmek zorunda kaldığını anlatır. Dolayısıyla Devletçilik dönemin şartlarının ve zorunluluklarının getirdiği pratik bir tercihtir.',
          '{"A":"Özel sektör hiçbir zaman yasaklanmamış, karma ekonomi benimsenmiştir.","C":"Yabancı sermayeye bağımlı olunmamış, yerli sanayi kurulmuştur.","D":"Tarım feda edilmemiş, şeker ve tekstil fabrikalarıyla tarım ürünleri işlenmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000107'::uuid,
          107,
          'LGS-SOS-T4-05',
          '1926 yılında kabul edilen Türk Medeni Kanunu ile tek eşle evlilik esası getirilmiş, mirasta ve mahkeme şahitliğinde kadın-erkek eşitliği sağlanmış, boşanma hakkı mahkeme kararına bağlanmıştır.',
          'Türk Medeni Kanunu''nun getirdiği bu yeniliklerle ilgili aşağıdaki yargılardan hangisine ulaşılamaz?',
          '{"A":"Toplumsal ve ailevi alanda kadınların hukuki güvenceye kavuştuğuna","B":"Hukuk birliğinin ve laik hukuk sisteminin güçlendirildiğine","C":"Kadınların TBMM''ye milletvekili olarak seçilme hakkı kazandığına","D":"Mahkemelerde cinsiyete dayalı eşitsiz uygulamaların son bulduğuna"}'::jsonb,
          'C',
          'UZMAN ÖĞRETMEN STRATEJİSİ: Medeni Kanun (1926) sosyal ve medeni hakları içerir; siyasi haklar (seçme ve seçilme) 1930, 1933 ve 1934 yıllarında verilmiştir.',
          '1926 Medeni Kanunu kadınlara toplumsal, ekonomik ve medeni haklar tanımıştır; kadınların siyasi hakları (milletvekili seçme-seçilme) ise 1934 yılında Anayasa değişikliği ile verilmiştir. Bu nedenle C seçeneğine ulaşılamaz.',
          '{"A":"Tek eşlilik ve boşanma hakkı doğrudan hukuki güvencedir.","B":"Şeri ve gayrimüslim mahkeme ikiliği kalkmış, tek laik hukuk uygulanmıştır.","D":"Şahitlikte eşitlik cinsiyet ayrımcılığını bitirmiştir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        ),
(
          'a0000000-0000-0000-0000-000000000108'::uuid,
          108,
          'LGS-SOS-T4-06',
          'Atatürk''ün İnkılapçılık anlayışı, yapılan devrimleri durağan bir dogma saymayıp; aklın, bilimin ve zamanın değişen şartlarına göre sürekli gelişimi ve dinamik yenilenme stratejisini esas alır.',
          'Buna göre diğer ilkelerle karşılaştırıldığında İnkılapçılık ilkesinin sistemin sürekliliğini sağlayan en fazla öne çıkan stratejik niteliği aşağıdakilerden hangisidir?',
          '{"A":"Sadece geçmişteki geleneksel kurumları restore etmesi","B":"Bütün ilkeleri dinamik tutan ve çağın gerisinde kalmayı önleyen motor güç olması","C":"Yalnızca askeri alandaki teknolojik gelişmeleri kapsaması","D":"Belirli bir zaman diliminde tamamlanıp nihayete ermiş sayılması"}'::jsonb,
          'B',
          'UZMAN ÖĞRETMEN STRATEJİSİ: İnkılapçılık diğer tüm ilkeleri çağın ihtiyaçlarına göre güncelleyen, durağanlaşmayı önleyen dinamik bir çatı ilkedir.',
          'İnkılapçılık, Türk inkılabının dondurulmuş bir kalıp olmasını engeller; bilim ve medeniyet ilerledikçe kurumların ve anlayışın da dinamik kalmasını sağlayan itici motor güçtür.',
          '{"A":"Geleneksel kurumları restore etmez, ömrünü tamamlayanları kaldırıp çağdaşlarını kurar.","C":"Sadece askeri değil, hukuk, eğitim, ekonomi ve sosyal tüm alanları kapsar.","D":"Biten bir süreç değil, daima devam eden canlı bir süreçtir."}'::jsonb,
          'LGS_YENI_NESIL',
          '{"approved":true,"score":0.99}'::jsonb,
          true,
          true
        )
ON CONFLICT (code) DO NOTHING;

-- 7. Test - Soru Eşleştirmeleri (Test Questions Matrix)
INSERT INTO test_questions (test_id, question_id, question_order) VALUES
(1, 'a0000000-0000-0000-0000-000000000001'::uuid, 1),
(1, 'a0000000-0000-0000-0000-000000000002'::uuid, 2),
(1, 'a0000000-0000-0000-0000-000000000003'::uuid, 3),
(1, 'a0000000-0000-0000-0000-000000000004'::uuid, 4),
(1, 'a0000000-0000-0000-0000-000000000005'::uuid, 5),
(1, 'a0000000-0000-0000-0000-000000000006'::uuid, 6),
(1, 'a0000000-0000-0000-0000-000000000007'::uuid, 7),
(2, 'a0000000-0000-0000-0000-000000000008'::uuid, 1),
(2, 'a0000000-0000-0000-0000-000000000009'::uuid, 2),
(2, 'a0000000-0000-0000-0000-000000000010'::uuid, 3),
(2, 'a0000000-0000-0000-0000-000000000011'::uuid, 4),
(2, 'a0000000-0000-0000-0000-000000000012'::uuid, 5),
(2, 'a0000000-0000-0000-0000-000000000013'::uuid, 6),
(2, 'a0000000-0000-0000-0000-000000000014'::uuid, 7),
(3, 'a0000000-0000-0000-0000-000000000015'::uuid, 1),
(3, 'a0000000-0000-0000-0000-000000000016'::uuid, 2),
(3, 'a0000000-0000-0000-0000-000000000017'::uuid, 3),
(3, 'a0000000-0000-0000-0000-000000000018'::uuid, 4),
(3, 'a0000000-0000-0000-0000-000000000019'::uuid, 5),
(3, 'a0000000-0000-0000-0000-000000000020'::uuid, 6),
(3, 'a0000000-0000-0000-0000-000000000021'::uuid, 7),
(4, 'a0000000-0000-0000-0000-000000000022'::uuid, 1),
(4, 'a0000000-0000-0000-0000-000000000023'::uuid, 2),
(4, 'a0000000-0000-0000-0000-000000000024'::uuid, 3),
(4, 'a0000000-0000-0000-0000-000000000025'::uuid, 4),
(4, 'a0000000-0000-0000-0000-000000000026'::uuid, 5),
(4, 'a0000000-0000-0000-0000-000000000027'::uuid, 6),
(4, 'a0000000-0000-0000-0000-000000000028'::uuid, 7),
(5, 'a0000000-0000-0000-0000-000000000029'::uuid, 1),
(5, 'a0000000-0000-0000-0000-000000000030'::uuid, 2),
(5, 'a0000000-0000-0000-0000-000000000031'::uuid, 3),
(5, 'a0000000-0000-0000-0000-000000000032'::uuid, 4),
(5, 'a0000000-0000-0000-0000-000000000033'::uuid, 5),
(5, 'a0000000-0000-0000-0000-000000000034'::uuid, 6),
(5, 'a0000000-0000-0000-0000-000000000035'::uuid, 7),
(6, 'a0000000-0000-0000-0000-000000000036'::uuid, 1),
(6, 'a0000000-0000-0000-0000-000000000037'::uuid, 2),
(6, 'a0000000-0000-0000-0000-000000000038'::uuid, 3),
(6, 'a0000000-0000-0000-0000-000000000039'::uuid, 4),
(6, 'a0000000-0000-0000-0000-000000000040'::uuid, 5),
(6, 'a0000000-0000-0000-0000-000000000041'::uuid, 6),
(6, 'a0000000-0000-0000-0000-000000000042'::uuid, 7),
(7, 'a0000000-0000-0000-0000-000000000043'::uuid, 1),
(7, 'a0000000-0000-0000-0000-000000000044'::uuid, 2),
(7, 'a0000000-0000-0000-0000-000000000045'::uuid, 3),
(7, 'a0000000-0000-0000-0000-000000000046'::uuid, 4),
(7, 'a0000000-0000-0000-0000-000000000047'::uuid, 5),
(7, 'a0000000-0000-0000-0000-000000000048'::uuid, 6),
(7, 'a0000000-0000-0000-0000-000000000049'::uuid, 7),
(8, 'a0000000-0000-0000-0000-000000000050'::uuid, 1),
(8, 'a0000000-0000-0000-0000-000000000051'::uuid, 2),
(8, 'a0000000-0000-0000-0000-000000000052'::uuid, 3),
(8, 'a0000000-0000-0000-0000-000000000053'::uuid, 4),
(8, 'a0000000-0000-0000-0000-000000000054'::uuid, 5),
(8, 'a0000000-0000-0000-0000-000000000055'::uuid, 6),
(8, 'a0000000-0000-0000-0000-000000000056'::uuid, 7),
(9, 'a0000000-0000-0000-0000-000000000057'::uuid, 1),
(9, 'a0000000-0000-0000-0000-000000000058'::uuid, 2),
(9, 'a0000000-0000-0000-0000-000000000059'::uuid, 3),
(9, 'a0000000-0000-0000-0000-000000000060'::uuid, 4),
(9, 'a0000000-0000-0000-0000-000000000061'::uuid, 5),
(9, 'a0000000-0000-0000-0000-000000000062'::uuid, 6),
(9, 'a0000000-0000-0000-0000-000000000063'::uuid, 7),
(10, 'a0000000-0000-0000-0000-000000000064'::uuid, 1),
(10, 'a0000000-0000-0000-0000-000000000065'::uuid, 2),
(10, 'a0000000-0000-0000-0000-000000000066'::uuid, 3),
(10, 'a0000000-0000-0000-0000-000000000067'::uuid, 4),
(10, 'a0000000-0000-0000-0000-000000000068'::uuid, 5),
(10, 'a0000000-0000-0000-0000-000000000069'::uuid, 6),
(10, 'a0000000-0000-0000-0000-000000000070'::uuid, 7),
(11, 'a0000000-0000-0000-0000-000000000071'::uuid, 1),
(11, 'a0000000-0000-0000-0000-000000000072'::uuid, 2),
(11, 'a0000000-0000-0000-0000-000000000073'::uuid, 3),
(11, 'a0000000-0000-0000-0000-000000000074'::uuid, 4),
(11, 'a0000000-0000-0000-0000-000000000075'::uuid, 5),
(11, 'a0000000-0000-0000-0000-000000000076'::uuid, 6),
(11, 'a0000000-0000-0000-0000-000000000077'::uuid, 7),
(12, 'a0000000-0000-0000-0000-000000000078'::uuid, 1),
(12, 'a0000000-0000-0000-0000-000000000079'::uuid, 2),
(12, 'a0000000-0000-0000-0000-000000000080'::uuid, 3),
(12, 'a0000000-0000-0000-0000-000000000081'::uuid, 4),
(12, 'a0000000-0000-0000-0000-000000000082'::uuid, 5),
(12, 'a0000000-0000-0000-0000-000000000083'::uuid, 6),
(12, 'a0000000-0000-0000-0000-000000000084'::uuid, 7),
(13, 'a0000000-0000-0000-0000-000000000085'::uuid, 1),
(13, 'a0000000-0000-0000-0000-000000000086'::uuid, 2),
(13, 'a0000000-0000-0000-0000-000000000087'::uuid, 3),
(13, 'a0000000-0000-0000-0000-000000000088'::uuid, 4),
(13, 'a0000000-0000-0000-0000-000000000089'::uuid, 5),
(13, 'a0000000-0000-0000-0000-000000000090'::uuid, 6),
(14, 'a0000000-0000-0000-0000-000000000091'::uuid, 1),
(14, 'a0000000-0000-0000-0000-000000000092'::uuid, 2),
(14, 'a0000000-0000-0000-0000-000000000093'::uuid, 3),
(14, 'a0000000-0000-0000-0000-000000000094'::uuid, 4),
(14, 'a0000000-0000-0000-0000-000000000095'::uuid, 5),
(14, 'a0000000-0000-0000-0000-000000000096'::uuid, 6),
(15, 'a0000000-0000-0000-0000-000000000097'::uuid, 1),
(15, 'a0000000-0000-0000-0000-000000000098'::uuid, 2),
(15, 'a0000000-0000-0000-0000-000000000099'::uuid, 3),
(15, 'a0000000-0000-0000-0000-000000000100'::uuid, 4),
(15, 'a0000000-0000-0000-0000-000000000101'::uuid, 5),
(15, 'a0000000-0000-0000-0000-000000000102'::uuid, 6),
(16, 'a0000000-0000-0000-0000-000000000103'::uuid, 1),
(16, 'a0000000-0000-0000-0000-000000000104'::uuid, 2),
(16, 'a0000000-0000-0000-0000-000000000105'::uuid, 3),
(16, 'a0000000-0000-0000-0000-000000000106'::uuid, 4),
(16, 'a0000000-0000-0000-0000-000000000107'::uuid, 5),
(16, 'a0000000-0000-0000-0000-000000000108'::uuid, 6)
ON CONFLICT (test_id, question_id) DO NOTHING;

COMMIT;
