# MEB Maarif LGS Platformu — Yapay Zekâ (AI) ve Model Geliştirme Rehberi
**Hedef Kitle:** Bu projeyi devralacak veya geliştirmeye devam edecek tüm Yapay Zekâ Modelleri (Google Gemini 4 Argon, Claude, GPT, Yerel Ollama Ajanları).

---

## 1. Temel Felsefe ve Proje Mimarisi

Bu platform, **T.C. Millî Eğitim Bakanlığı Türkiye Yüzyılı Maarif Modeli** ve **8. Sınıf LGS Sınavı** için soru üreten, denetleyen ve optik sınav deneyimi sunan kurumsal bir EdTech altyapısıdır.

Projeye dâhil olan her yapay zekâ modeli, **System-1 (Hızlı Sezgisel Denetim — JEV)** ve **System-2 (Derin Üretim — LLM)** ayrımına tam riayet etmek zorundadır.

---

## 2. Değeri Etkileyecek Kritik Kriterler (Hayati Kurallar)

### 🚨 Kural 1: Özgünlük ve İntihal (Zero-Plagiarism Gate)
- **Sıfır Tolerans:** Üretilen hiçbir soru, **[SoruSat](https://sorusat.com/)** gibi platformlarda, piyasadaki deneme kitaplarında veya MEB'in yayımladığı geçmiş LGS çıkmış sorularında birebir yer alamaz.
- **Yasal ve Ticari Risk:** Tek bir çalıntı soru dahi projenin feshine, telif davalarına ve telafisi imkânsız kurumsal zarara yol açar.
- **Pedagojik İlham Kuralı:** MEB çıkmış soruları mantık ve pedagojik beceri açısından incelenebilir; ancak sayısal değerler, kurgusal hikâyeler, isimler, deney düzenekleri ve soru kökleri %100 özgün olmalıdır.

### 🎬 Kural 2: 5 Aşamalı Video Çözüm Desteği (%20 - %30 Değer Artışı)
Her sorunun yalnız metin cevabı değil, yayınevlerinin anında video kaydı alabileceği **Video Çözüm Senaryosu (Storyboard & Voiceover Replikleri)** hazır olmalıdır:
1. **Sahne 1 (00:00 - 00:15):** Soru kökü ve kritik ipucu analizi (Sarı fosforlu vurgu).
2. **Sahne 2 (00:15 - 00:35):** Verilenlerin şematize edilmesi (Geometri/deney şeması veya öncül listesi).
3. **Sahne 3 (00:35 - 01:05):** Adım adım çözüm hamlesi ve tahta animasyon aksiyonları.
4. **Sahne 4 (01:05 - 01:20):** Çeldirici analizi (Öğrenci tuzağının ifşası ve yanlış seçeneklerin elenmesi).
5. **Sahne 5 (01:20 - 01:30):** Doğru seçeneğin mühürlenmesi ve başarı dileği.

### 📐 Kural 3: Dizgi ve Vektörel Grafik Standartları (InDesign & LaTeX)
- Sorular Adobe InDesign (`LGS_Standard_2Column_A4.indd`) şablonlarına doğrudan aktarılabilir formatta XML / Tagged Text meta verisi içermelidir.
- Matematik ve Fen formülleri KaTeX / LaTeX formatında olmalıdır.
- Geometri, veri analizi (grafikler) ve fen deneyleri için **inline Vektörel SVG (`<svg viewBox="..."`)** kullanılmalıdır. Soru sadece kuru metinden ibaret bırakılmamalıdır.

### 🎯 Kural 4: Branş Başına 100+ Mikro Konu Hedefleme Kuralı
- Müfredat yüzeysel bir 36 hafta listesi değildir.
- MEB TTKB Öğretim Programında her branşta **100'ün üzerinde bağımsız mikro konu** bulunur (8. Sınıfta 491, 5-8 toplamında 1.538 mikro konu).
- Soru üretirken `engine/meb_granular_curriculum.mjs` içindeki `getGranularSubtopics(courseKey, grade)` çağrılarak spesifik mikro konu ve resmî kazanım kodu hedeflenmelidir.

---

## 3. JEV System-1 Kalite Standartları

Üretilen her soru JEV Kalite Kapısı'ndan (`engine/jev_evaluator.mjs`) onay almak zorundadır:

1. **Tek Deterministik Cevap:** Tartışmalı, çift cevaplı veya muğlak hiçbir soru onay alamaz (`zero_ambiguity: true`).
2. **Güçlü Çeldirici Gerekçeleri:** Yanlış olan 3 seçeneğin her birinin öğrenciyi neden yanılttığı pedagojik olarak belgelenmelidir (`distractors` nesnesi).
3. **1 - 5 Yıldız Zorluk Derecelendirmesi:**
   - 1★: Temel Kavrama & Isınma (Test başı)
   - 2★: Ön Hazırlık & Doğrudan İşlem
   - 3★: Standart Çok Adımlı Çıkarım
   - 4★: LGS Yeni Nesil Omurgası (%50-%60 ağırlık)
   - 5★: Şampiyon Seçici (%1'lik dilim)
4. **Sıfır İşletim Sistemi Emojisi:** Arayüzde veya sorularda asla renkli platform emojisi kullanılmaz. Yalnızca UI8 SVG ikonları veya metin karakterleri (`★/☆`) kullanılır.

---

## 4. Sıfır Yerel Disk Tüketimi (Cloud Direct Streaming)

Büyük ölçekli soru üretimlerinde (4.000 veya 16.000 soru):
- **KESİNLİKLE** kullanıcının yerel SSD diskine devasa JSON dosyaları yazılmaz.
- Veriler bellek içi (RAM Buffer) tamponlanır, Gzip Seviye-9 ile %95+ oranında sıkıştırılır ve doğrudan `kerem.newton571@gmail.com` Google Drive alanına akıtılır (`engine/curriculum_scale_factory.mjs`).

---

## 5. Doğrulama ve Test Komutları

Geliştirme yaparken aşağıdaki komutlarla sistemin sağlamlığı denetlenmelidir:
```bash
npm test                  # 18/18 Otomasyon Testi (%100 Başarı Zorunludur)
npm run quality:audit     # JEV Kalite Endeksi ve Yıldız Dağılım Denetimi
npm run curriculum:granular # 4 Kademe 1.538 Mikro Konu Envanteri
npm run start             # Canlı Portalı Başlat (http://localhost:3333)
```
