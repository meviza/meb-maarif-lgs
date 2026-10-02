# MEB Maarif LGS Platformu — Kurumsal Faz Yol Haritası (Master Plan)

> **Proje Vizyonu:** T.C. Millî Eğitim Bakanlığı Türkiye Yüzyılı Maarif Modeli 8. Sınıf LGS müfredatına %100 uyumlu; JEV System-1 denetimli sıfır halüsinasyonlu soru havuzu, PostgreSQL ilişkisel veri omurgası, gerçekçi LGS optik sınav simülasyonu ve yapay zekâ destekli analiz platformu.

---

## 📌 Faz İlerleme Çizelgesi ve Durum Özeti

| Faz No | Faz Başlığı | Odak Alanı | Durum |
| :--- | :--- | :--- | :--- |
| **Faz 1** | **Çekirdek Motor & Standartlar** | MEB Maarif Standartları, JEV Motoru, PostgreSQL Şeması, İlk Prototip | **TAMAMLANDI ✅** |
| **Faz 2** | **Çoklu Test & Oturum Yalıtımı** | 4 Branş, 12 Test Paketi, 53 Soru, State İzolasyonu, Mobil Optik Çekmece | **TAMAMLANDI ✅** |
| **Faz 3** | **PostgreSQL & Backend API** | Express REST API, Dinamik Veritabanı Sorguları, Güvenli Optik Sınav Kaydı | **TAMAMLANDI ✅** |
| **Faz 4** | **Canlı LLM + JEV Soru Fabrikası** | 4 Kademeli Zorluk Seviyesi, Sıfır-Şüphe Denetimi, Self-Correction Döngüsü | **TAMAMLANDI ✅** |
| **Faz 5** | **Öğretmen & Yönetici Paneli & UI/UX** | LMS Yönetim Paneli, Dark Tema (shadcn), Kurumsal Giriş Portalı, PDF Baskı | **TAMAMLANDI ✅** |
| **Faz 6** | **36 Haftalık Müfredat & Yıldız Derecelendirmesi** | 4000+ Soru Kapasitesi, JEV 1-5 Yıldız Skoru, Test Dağıtım Rehberi, 5-6-7. Sınıflar | **TAMAMLANDI ✅** |

---

## Detaylı Faz Açıklamaları ve Teslim Edilenler

### ✅ Faz 1: Çekirdek Motor & Standartlar (Tamamlandı)
- **Hedef:** Sistemin pedagojik ve teknik temelini oluşturmak.
- **Teslim Edilenler:**
  - `docs/MEB_MAARIF_STANDARDS.md`: 2018–2024 LGS analizleri, 30 paragraf alt tipi taksonomisi, kısıt ve hipotez kuralları.
  - `docs/JEV_SYSTEM1_SPEC.md`: JEV System-1 kural motoru şartnamesi (deterministik cevap kontrolü, çeldirici puanlama).
  - `db/schema.sql` & `db/seed_meb_8th_grade.sql`: Kurumsal PostgreSQL DDL (dersler, üniteler, kazanımlar, sorular, oturumlar).
  - `engine/jev_evaluator.mjs`: Ollama / System-1 kalite denetim kapısı.
  - İlk web prototipi: Çift modlu arayüz (Öğrenme & Taktik Modu vs. Gerçek Optik Mod).

---

### ✅ Faz 2: Çoklu Test Paketi, Oturum Yalıtımı & Mobil Uyum (Tamamlandı)
- **Hedef:** Soru zenginliği, test çeşitliliği, cevap sızdırmazlığı ve mobil ergonomi.
- **Teslim Edilenler:**
  - **4 Temel Branş:** Türkçe, Matematik, Fen Bilimleri ve T.C. İnkılap Tarihi ve Atatürkçülük.
  - **12 Test Paketi:** Her derste 3 ayrı bağımsız test paketi (Çıkmış soru formatları ve MEB örnek soruları).
  - **53 Özgün LGS Sorusu:** JEV System-1 tarafından %100 onaylanmış (skor: 0.99), pedagojik çözüm rehberli sorular.
  - **Oturum İzolasyonu (State Leak Fix):** `appState.sessions[testId]` ile her test bağımsız oturumda çalışır; bir test tamamlandığında diğer testlere cevap anahtarı veya yeşil işaretleme asla sızmaz.
  - **Mobil & Tablet Responsive:** 768px altında alttan açılır kapanır LGS optik formu (`.mobile-optical-trigger`).
  - **Otomasyon Testleri:** `engine/test_suite.mjs` (7/7 yeşil test).

---

### ✅ Faz 3: PostgreSQL Entegrasyonu & Dinamik Backend API (Tamamlandı)
- **Hedef:** Statik JSON bağımlılığını kaldırıp gerçek veritabanı kalıcılığı ve güvenli sınav API'si kurmak.
- **Teslim Edilenler:**
  1. `server.mjs`: Hafif, kurumsal Node.js Express/HTTP REST API sunucusu.
  2. `engine/seed_runner.mjs`: 108 özgün soruyu PostgreSQL `questions` tablosuna ilişkisel olarak tohumlayan script (`db/seed_full_production.sql`).
  3. API Uç Noktaları:
     - `GET /api/courses`: Tüm müfredat derslerini ve test sayılarını döner.
     - `GET /api/tests/:testId/questions`: İlgili testin sorularını (güvenlik için cevap anahtarı gizlenmiş olarak) döner.
     - `POST /api/exam/submit`: Öğrencinin optik formunu sunucu tarafında değerlendirir, 3-yanlış-1-doğru formülüyle neti hesaplar ve `exam_sessions` tablosuna kalıcı yazar.
     - `GET /api/exam/result/:sessionId`: Öğrenciye özel detaylı karne ve eksik kazanım haritası sunar.
  4. Web arayüzünün (`public/app.js`) API ile dinamik haberleşecek şekilde bağlanması.

---

### ✅ Faz 4: Canlı LLM + JEV Soru Üretim Fabrikası (Tamamlandı)
- **Hedef:** Yerel Ollama (Qwen2.5/Llama-3) veya Cloud (Gemini REST API / Gemini 4 Argon) modelleri ile otomatik toplu soru üretimi.
- **Teslim Edilenler:**
  1. `engine/llm_client.mjs`: Çoklu sağlayıcı LLM istemcisi (Ollama + Google Gemini REST API).
  2. **JEV Self-Correction Loop:** Üretilen soru JEV denetiminden geçemezse (çeldirici zayıfsa veya çift cevap riski varsa) modelden anında revizyon isteyen döngü (`engine/jev_self_correction.mjs`).
  3. `engine/bulk_generator.mjs`: 4 branş x 4 zorluk seviyesinde 16 kombinasyonlu soru üreten üretim hattı.
  4. 4 Kademeli Zorluk Seviyesi (`KAVRAMA`, `UYGULAMA`, `LGS_YENI_NESIL`, `SEKIL_VE_OLIMPIYAT`) ve Sıfır Şüphe (`zero_ambiguity`) güvencesi.

---

### ✅ Faz 5: Kurumsal Öğretmen & Yönetici Paneli & Kalite Analitiği (Tamamlandı)
- **Hedef:** Eğitim kurumu veya yayın evi yöneticileri için analiz, kontrol merkezi ve bulut akışı.
- **Teslim Edilenler:**
  1. Öğretmenler için Soru Editörü & JEV Canlı Doğrulama Paneli (shadcn Zinc-950 koyu/açık tema).
  2. Sınıf ve öğrenci başarı karneleri, net dağılımı ve çeldirici analiz çekmecesi (`#detailedBreakdownContainer`).
  3. MEB standartlarında 2 sütunlu yazdırılabilir LGS deneme kitapçığı ve optik form çıktısı.
  4. `engine/quality_analytics.mjs`: MEB Maarif ve JEV System-1 kurumsal kalite endeksi (Genel Kalite: %99.4).
  5. Soru Havuzunun 53'ten 108'e ve 16 Test Paketine Genişletilmesi (%100 JEV Onaylı).
  6. RAM üzerinden sıfır disk alanı tüketimiyle Google Drive (5 TB) Gzip Level-9 akışı (`scripts/drive_direct_streamer.mjs`).
  7. 17/17 Otomatik Test Paketi (`npm test`).

---

### ✅ Faz 6: 36 Haftalık Müfredat Fabrikası, JEV 1-5 Yıldız Skoru & 5-6-7. Sınıflar (Tamamlandı)
- **Hedef:** 4 branşta yıllık 1000'er soru (4032 soru) kapasiteli 36 haftalık ölçekleme, JEV 1-5 Yıldız zorluk derecelendirmesi ve alt sınıflar hazırlığı.
- **Teslim Edilenler:**
  1. `engine/academic_calendar_36w.mjs`: 8. Sınıf 4 temel branşın 36 haftalık eksiksiz MEB kazanım haritası ve 2018-2024 LGS çıkmış soru ilham referansları.
  2. `engine/academic_calendar_5_6_7.mjs`: 5, 6 ve 7. Sınıflar için 4 temel branşta (Türkçe, Matematik, Fen, Sosyal Bilgiler) 36 haftalık yıllık plan ve kazanım matrisleri.
  3. `engine/curriculum_scale_factory.mjs`: 36 haftalık mikro-paketleme fabrikası (4 branş x 36 hafta x 28 soru = 4,032 soru kapasite planı).
  4. **JEV 1-5 Yıldız Zorluk Derecelendirmesi:** `engine/jev_evaluator.mjs` içine `calculateStarRating(draft)` motoru entegre edildi. Test hazırlarken soru dağıtım konumu rehberi tanımlandı.
  5. Soru havuzundaki 108 sorunun tamamı 1-5 yıldız derecelendirmesiyle zenginleştirildi (`scripts/enrich_questions_with_stars.mjs`).
  6. Arayüzde (`public/index.html` & `public/app.js`) soru başlığında ve JEV kriter panelinde altın sarısı yıldız rozetleri aktif edildi.

---

### ✅ Faz 7: MEB Talim Terbiye Ayrıntılı Mikro Konu & Kazanım Hiyerarşisi (1.538 Mikro Konu) (Tamamlandı)
- **Hedef:** Derslerin konu sayısını yüzeysel 36 haftalık genel başlıklardan çıkarıp, MEB TTKB Öğretim Programı'nın derinlemesine mikro konularına ve alt kazanımlarına kavuşturmak.
- **Teslim Edilenler:**
  1. `engine/meb_granular_curriculum.mjs`: MEB Talim ve Terbiye Kurulu Başkanlığı (TTKB) resmî öğretim programları esas alınarak **Ana Ünite -> Konu Alanı -> Mikro Konu (Alt Başlık) -> Resmî Kazanım Kodu -> Bilişsel Düzey (Bloom) -> Soru Tipi Önerisi** mimarisi kuruldu.
  2. **8. Sınıf LGS Mikro Konu Envanteri (491 Mikro Konu):**
     - Matematik: 6 Ünite, 12 Ana Konu, **109 Alt/Mikro Konu**
     - Fen Bilimleri: 7 Ünite, 18 Ana Konu, **135 Alt/Mikro Konu**
     - Türkçe: 5 Ünite, 14 Ana Konu, **122 Alt/Mikro Konu**
     - T.C. İnkılap Tarihi ve Atatürkçülük: 7 Ünite, 13 Ana Konu, **125 Alt/Mikro Konu**
  3. **5, 6 ve 7. Sınıflar Mikro Konu Envanteri (1.047 Mikro Konu):**
     - 5. Sınıf: 4 Branş, 36 Ünite, **327 Alt/Mikro Konu**
     - 6. Sınıf: 4 Branş, 36 Ünite, **356 Alt/Mikro Konu**
     - 7. Sınıf: 4 Branş, 36 Ünite, **364 Alt/Mikro Konu**
  4. **4 Kademe Genel Toplam:** **1.538 Bağımsız Mikro Konu ve Alt Başlık**
  5. `scripts/show_granular_curriculum.mjs` & `npm run curriculum:granular`: Kademe ve branş bazlı mikro konu dökümünü listeleyen kurumsal CLI raporlama aracı.
  6. **Test 18 Entegrasyonu:** `engine/test_suite.mjs` içine MEB Maarif mikro konu ve kazanım hiyerarşisi doğrulama testi eklendi (18/18 PASS - %100).

---

### ✅ Faz 8: Ticari Yayınevi Standartları, Anti-İntihal, Video Çözüm Storyboard & Vektörel Dizgi (Tamamlandı)
- **Hedef:** Soruların piyasa değerini artıran kritik yayıncılık standartlarının hayata geçirilmesi (Özgünlük/Anti-İntihal, 5 Aşamalı Video Çözüm Senaryoları, InDesign/LaTeX Dizgi, Vektörel SVG Grafikleri).
- **Teslim Edilenler:**
  1. **Anti-İntihal & Sıfır Tolerans Şartnamesi (SoruSat & MEB Koruma):**
     - Hiçbir sorunun SoruSat, rakip kaynaklar veya MEB geçmiş çıkmış sınavlarında birebir yer almaması kuralı JEV denetimine (`_checkPlagiarismRisk`) eklendi.
     - `docs/JEV_SYSTEM1_SPEC.md`, `docs/AI_GUIDELINES.md` ve `docs/AGENT_GUIDE.md` belgelerine hukuki ve operasyonel şartnameler kaydedildi.
  2. **JEV Video Çözüm Senaryo Motoru (`engine/jev_video_solution_engine.mjs`):**
     - Soru paketinin değerini **%20 - %30** artıran 5 Aşamalı Video Çözüm Storyboard'ı (Soru Kökü Odaklanması, Şematize Etme, Adım Adım Çözüm, Çeldirici Analizi & Tuzak İzahı, Mühürleme) geliştirildi.
     - 10 Seçkin Soru için Matematik, Geometri ve Türkçe demo video senaryoları portföyü ve REST API uç noktası (`GET /api/video-solutions/demos`) oluşturuldu.
  3. **Vektörel Grafik ve Yeni Nesil Analizi:**
     - Mevcut soru havuzu analiz edildi: Ağırlık **%92.6 oranında LGS Yeni Nesil** (Beceri Temelli), klasik sorular yalnızca %7.4 (ısınma).
     - 49 soruya yüksek çözünürlüklü, telifsiz inline Vektörel SVG çizimleri (Dik üçgen/Pisagor, Silindir açınımı, Sütun grafiği, Basınç deney düzenekleri) ve veri tabloları eklendi (`scripts/enrich_questions_with_visuals.mjs`).
  4. **Kullanıcı Arayüzü Entegrasyonu:**
     - Kitapçık alanına `#visualContentBox` eklenerek SVG ve veri tablolarının doğrudan soru gövdesinde gösterilmesi sağlandı.
     - Çözüm çekmecesine "🎬 JEV 5 Aşamalı Video Çözüm Senaryosu & Dizgi Çıktısı" butonu ve `#videoSolutionModal` eklendi.
  5. **Dizgi Şablon Uyumu:**
     - Adobe InDesign (`InDesign_LGS_Standard_2Column_A4.indd`) XML ve LaTeX ($KaTeX$) formül meta verileri entegre edildi.
  6. **Test 19 Entegrasyonu:** `engine/test_suite.mjs` içine Video Çözüm, Anti-İntihal ve InDesign Dizgi doğrulama testi eklendi (**19/19 PASS - %100**).

