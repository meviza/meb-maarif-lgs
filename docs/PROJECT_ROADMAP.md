# MEB Maarif LGS Platformu — Kurumsal Faz Yol Haritası (Master Plan)

> **Proje Vizyonu:** T.C. Millî Eğitim Bakanlığı Türkiye Yüzyılı Maarif Modeli 8. Sınıf LGS müfredatına %100 uyumlu; JEV System-1 denetimli sıfır halüsinasyonlu soru havuzu, PostgreSQL ilişkisel veri omurgası, gerçekçi LGS optik sınav simülasyonu ve yapay zekâ destekli analiz platformu.

---

## 📌 Faz İlerleme Çizelgesi ve Durum Özeti

| Faz No | Faz Başlığı | Odak Alanı | Durum |
| :--- | :--- | :--- | :--- |
| **Faz 1** | **Çekirdek Motor & Standartlar** | MEB Maarif Standartları, JEV Motoru, PostgreSQL Şeması, İlk Prototip | **TAMAMLANDI ✅** |
| **Faz 2** | **Çoklu Test & Oturum Yalıtımı** | 4 Branş, 12 Test Paketi, 53 Soru, State İzolasyonu, Mobil Optik Çekmece | **TAMAMLANDI ✅** |
| **Faz 3** | **PostgreSQL & Backend API** | Express REST API, Dinamik Veritabanı Sorguları, Güvenli Optik Sınav Kaydı | **SIRADAKİ ADIM 🎯** |
| **Faz 4** | **Canlı LLM + JEV Soru Fabrikası** | Ollama / Gemini Entegrasyonu, Self-Correction Loop, Toplu Soru Üretimi | **PLANLANDI 📋** |
| **Faz 5** | **Öğretmen & Yönetici Paneli** | LMS Yönetim Paneli, Eksik Kazanım Karnesi, PDF Çıktı ve Optik Baskı | **PLANLANDI 📋** |

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

### 🎯 Faz 3: PostgreSQL Entegrasyonu & Dinamik Backend API (Sıradaki Aşama)
- **Hedef:** Statik JSON bağımlılığını kaldırıp gerçek veritabanı kalıcılığı ve güvenli sınav API'si kurmak.
- **Uygulanacak Adımlar:**
  1. `server.mjs`: Hafif, kurumsal Node.js Express REST API sunucusu.
  2. `engine/seed_runner.mjs`: Üretilen 53 özgün soruyu PostgreSQL `questions` tablosuna ilişkisel olarak tohumlama scripti.
  3. API Uç Noktaları:
     - `GET /api/courses`: Tüm müfredat derslerini ve test sayılarını döner.
     - `GET /api/tests/:testId/questions`: İlgili testin sorularını (güvenlik için cevap anahtarı gizlenmiş olarak) döner.
     - `POST /api/exam/submit`: Öğrencinin optik formunu sunucu tarafında değerlendirir, 3-yanlış-1-doğru formülüyle neti hesaplar ve `exam_sessions` tablosuna kalıcı yazar.
     - `GET /api/exam/result/:sessionId`: Öğrenciye özel detaylı karne ve eksik kazanım haritası sunar.
  4. Web arayüzünün (`public/app.js`) API ile dinamik haberleşecek şekilde bağlanması.

---

### 📋 Faz 4: Canlı LLM + JEV Soru Üretim Fabrikası
- **Hedef:** Yerel Ollama (Llama-3/Mistral) veya Cloud (Gemini/Claude) modelleri ile otomatik toplu soru üretimi.
- **Uygulanacak Adımlar:**
  1. `engine/llm_client.mjs`: Çoklu sağlayıcı LLM istemcisi.
  2. **JEV Self-Correction Loop:** Üretilen soru JEV denetiminden geçemezse (çeldirici zayıfsa veya çift cevap riski varsa) modelden anında revizyon isteyen döngü.
  3. `engine/bulk_generator.mjs`: Belirtilen kazanım ve zorlukta 100'lerce soruyu tek komutla üreten üretim hattı.

---

### 📋 Faz 5: Kurumsal Öğretmen & Yönetici Paneli
- **Hedef:** Eğitim kurumu veya yayın evi yöneticileri için analiz ve kontrol merkezi.
- **Uygulanacak Adımlar:**
  1. Öğretmenler için Soru Editörü & JEV Canlı Doğrulama Paneli.
  2. Sınıf ve öğrenci başarı grafikleri, net dağılım histogramları.
  3. MEB standartlarında yazdırılabilir PDF LGS deneme kitapçığı ve optik form çıktısı.
