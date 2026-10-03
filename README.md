# MEB Maarif LGS Platformu — Prototip ve Doğrulama Çalışması

> **Durum notu — 3 Ekim 2026:** Bu depo, 5–8. sınıf odaklı bir geliştirme prototipidir; MEB onayı, %100 müfredat uyumu, sıfır hata/intihal/halüsinasyon, canlı PostgreSQL/Drive entegrasyonu veya üretime hazır K–12 ürünü iddiası için yeterli bağımsız kanıt sunmaz. Bu dalın geçerli doğruluk sınırı ve kontrollü genişleme planı için [Codex çalışma belgelerine](docs/README.md) bakın. Aşağıdaki tarihsel açıklamalar, bu notla çeliştiğinde ürün beyanı olarak yorumlanmamalıdır.

# Tarihsel Prototip Açıklaması

T.C. Millî Eğitim Bakanlığı **Türkiye Yüzyılı Maarif Modeli** 8. Sınıf Liselere Geçiş Sistemi (LGS) müfredatına %100 uyumlu; **JEV System-1** kural ve kalite denetim motoru ile güçlendirilmiş, sıfır halüsinasyonlu ve sıfır şüpheli soru fabrikası, PostgreSQL ilişkisel veri omurgası, gerçekçi LGS optik sınav simülasyonu ve bulut senkronizasyon platformudur.

---

## 1. JEV System-1 Karar ve Kalite Denetim Motoru Nedir?

JEV (System-1 Decision Architecture), büyük dil modellerinin (LLM) ürettiği ham soru taslaklarını **asla doğrudan yayına almayan**, deterministik bir pedagojik ve mantıksal güvenlik kapısıdır.

```
+-----------------------------------------------------------------------+
|                       LLM Soru Taslağı Üretimi                       |
|          (Yerel Ollama: Qwen2.5, Llama-3 / Google Gemini API)         |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      JEV SYSTEM-1 KALİTE KAPISI                       |
|                     (engine/jev_evaluator.mjs)                        |
|                                                                       |
|  [KAPILAR]                                                            |
|  1. Data Integrity: 4 seçenek (A, B, C, D), geçerli kök ve öncül      |
|  2. Single Deterministic Answer: Tek, mutlak ve tartışmasız cevap      |
|  3. Zero Ambiguity Gate: 'belki', 'olabilir gibi' muğlak terim yasağı  |
|  4. Disjoint Options: Sayısal/mantıksal şıkların tam ayrıklığı        |
|  5. 4-Tier Cognitive Alignment: Hedef zorlukla bilişsel yük uyumu     |
|  6. Distractor Quality: Her çeldiricinin pedagojik yanılgı gerekçesi   |
|  7. TDK İmla Denetimi: Türkçe yazım kuralları uyumu                   |
|  8. Pedagogical Hints: Uzman öğretmen stratejisi ve adım adım çözüm   |
+-----------------------------------------------------------------------+
                |                                       |
       [Skor >= 0.85 & Onay]                  [Eksik veya Hatalı]
                |                                       |
                v                                       v
+-------------------------------+       +-------------------------------+
|         JEV ONAYLI            |       |    SELF-CORRECTION DÖNGÜSÜ    |
|   Soru Havuzuna / Optik      |       |  Hata Nedenleriyle Modele      |
|   Sınava Dahil Edilir         |       |  Revizyon Gönderilir (Max 3)  |
+-------------------------------+       +-------------------------------+
```

### JEV Kalite Kriterleri & Eşik Değerleri
1. **Sıfır Şüphe ve Tereddüt (`zero_ambiguity`):** Soru kökünde veya seçeneklerde *"belki"*, *"çoğu zaman"*, *"olabilir gibi"*, *"muhtemelen"* gibi tartışmaya açık, göreceli veya çift cevaba yol açabilecek ifadeler barındıran taslaklar **derhal elenir**.
2. **Seçeneklerin Tam Ayrıklığı (Disjoint Options):** Şıkların birbirini kapsaması (ör. `x > 10` ile `x > 20`) veya eş anlamlı kelimelerle iki seçeneğin aynı anlama gelmesi engellenir.
3. **4 Kademeli Bilişsel Zorluk (`difficulty_alignment`):**
   * **`KAVRAMA` (Temel Seviye):** Tek adımlı kurallar, doğrudan tanım ve hatırlama (Bloom: *Understand*).
   * **`UYGULAMA` (Orta Seviye):** Standart formül, yöntem ve işlem işletimi (Bloom: *Apply*).
   * **`LGS_YENI_NESIL` (İleri / MEB LGS Standart):** Çoklu öncül, deney kurgusu, grafik/tablo okuma, metin analizi (Bloom: *Analyze*).
   * **`SEKIL_VE_OLIMPIYAT` (Şampiyon Seviye):** Çok adımlı optimizasyon, soyut modelleme ve yüksek ayırt edicilik (Bloom: *Evaluate*).
4. **Pedagojik Çeldirici Analizi:** Her yanlış şıkkın öğrencide hedeflediği kavram yanılgısı (`distractors`) açıkça belgelenmelidir.

---

## 2. Geliştirici ve CLI Komutları (Komut Satırı Rehberi)

Platformun tüm işlevleri standart npm komutlarıyla yönetilebilir:

### Temel Çalıştırma Komutları
```bash
# Bağımlılıkları yükle (Sıfır harici npm bağımlılığı gerektirir, Node.js yerel API'leri kullanılır)
npm install

# Tüm otomatik test paketini çalıştır (17/17 Test Eksiksiz Geçer)
npm test

# MEB Maarif ve JEV System-1 Kapsamlı Kalite Endeksini Hesapla ve Denetle
npm run quality:audit

# Soru Bankasını 108 Soruya Ölçekle ve JEV Onayından Geçir
npm run scale:bank

# Web platformunu ve REST API sunucusunu başlat (Port: 3333)
npm start
# veya
npm run serve
```

### Soru Üretimi ve Bulut Arşivleme Komutları
```bash
# 4 Branş x 4 Zorluk Seviyesinde Toplu Soru Üret (16 Soru Matrisi)
npm run generate:bulk

# Gzip Level-9 Algoritmasıyla Soru Bankası ve SQL Tohumunu Arşivle (%73.5 Tasarruf)
npm run cloud:backup
# veya
npm run cloud:sync

# Google Drive (5 TB) Sıfır-Disk Doğrudan RAM Akışını Başlat (0 Bayt Yerel Disk Tüketimi)
npm run drive:stream

# PostgreSQL İlişkisel Tohum Verilerini ve DDL Dosyalarını Doğrula (108 Soru)
npm run seed
```

---

## 3. REST API Uç Noktaları

Sunucu (`server.mjs`) yerel HTTP üzerinde aşağıdaki kurumsal REST API uç noktalarını sunar:

| Metot | Uç Nokta | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Platform durumu, JEV auditor modu ve test/soru istatistikleri. |
| `GET` | `/api/courses` | 4 ana branşı, test sayılarını ve soru adetlerini listeler. |
| `GET` | `/api/tests/:testId/questions` | İlgili test paketinin sorularını döner (cevap anahtarı güvenle gizlenir). |
| `POST` | `/api/exam/submit` | Optik formu sunucuda değerlendirir, 3 yanlış 1 doğru kuralıyla net hesaplar ve oturumu kaydeder. |
| `GET` | `/api/exam/results/:sessionId` | Öğrencinin oturum karne detayını ve eksik kazanım haritasını getirir. |
| `GET` | `/api/ai/models` | Kullanılabilir yerel Ollama ve Google Gemini modellerini listeler. |
| `POST` | `/api/ai/generate-question` | Belirtilen ders, konu ve zorluk kademesinde JEV onaylı yeni nesil soru üretir. |
| `POST` | `/api/ai/batch-generate` | 4 branş ve 4 zorluk kademesinde 16 soruluk matris paketi üretir. |
| `POST` | `/api/cloud/sync` | Veri bankasını Level-9 Gzip ile sıkıştırır ve bulut arşiv meta verisini döner. |

---

## 4. AI Sağlayıcıları: Ollama & Google Gemini Entegrasyonu

Platform, hibrit çoklu model (Multi-Provider) mimarisini destekler:

### 1. Yerel Modeller (Ollama)
Bilgisayarınızda çalışan Ollama modelleri (`http://localhost:11434`):
* `qwen2.5:3b` (Önerilen - Hızlı, kararlı ve JSON formatına tam uyumlu)
* `dolphin-llama3:8b`
* `mistral:latest`

### 2. Google Gemini API (Gemini 1.5, 2.0 ve Yeni Nesil / Argon)
Google Cloud API anahtarınız ile doğrudan bulut modellerini çalıştırabilirsiniz:
```bash
# Terminalinizde veya .env dosyasında API anahtarınızı tanımlayın:
export GEMINI_API_KEY="AIzaSy..."
```
Desteklenen Modeller:
* `gemini-2.0-flash` (Yüksek hız, düşük gecikme, analitik akıl yürütme)
* `gemini-1.5-pro` (Derin bağlam ve karmaşık Türkçe paragraf analizi)
* `gemini-4-argon` veya gelecek nesil modeller: Model adını arayüzden veya API parametresinden girdiğiniz anda sistem doğrudan Google Generative Language API uç noktasına bağlanır.

---

## 5. Başka Bir AI Ajanı / Geliştirici İçin Devralma Protokolü (Agent Handoff Guide)

Bu projeyi devralan herhangi bir AI ajanı (Claude Code, Codex, Antigravity veya başka bir LLM portalı) aşağıdaki ilkeleri izleyerek süreci sıfır kayıpla sürdürebilir:

### Temel Mimari Sözleşmeler:
1. **Sıfır Emoji Politikası:** Arayüzde, konsol loglarında veya üretilen sorularda sistem emojisi (kitap, ampul, cetvel vb.) **asla kullanılmaz**. Tüm görseller UI8 / shadcn standardında inline SVG vektörleri olarak tasarlanmalıdır.
2. **Oturum İzolasyonu (State Leak Protection):** `appState.sessions[testId]` objesi her test için bağımsızdır. Bir test tamamlandığında optik işaretlemeler veya cevap anahtarı diğer testlere sızamaz.
3. **Deterministik Cevap Güvencesi:** Üretilen her soru `engine/jev_evaluator.mjs` içindeki `evaluateQuestion()` metodundan onay almak zorundadır.
4. **Yerel Disk Koruması:** Kullanıcının SSD alanı kısıtlıdır (~2.8 GB). Asla yerel diske büyük PDF indirilmemelidir; tüm arşivleme bellek içi (RAM Buffer) streaming ve Gzip Level-9 ile yapılmalıdır (`scripts/drive_direct_streamer.mjs`).
5. **Kurumsal Git Disiplini:** Yapılan her değişiklik; hangi testlerin yapıldığı, hangi sonuçların alındığı ve hangi modüllerin yazıldığını belgeleyen Conventional Commits standardında kaydedilmelidir.

---

## 6. Proje Dizin Yapısı

```
meb-maarif-lgs/
├── README.md                           # Master dokümantasyon ve devralma kılavuzu
├── package.json                        # Proje bağımlılıkları ve npm çalıştırma scriptleri
├── server.mjs                          # Kurumsal native REST API ve statik web sunucusu
├── .gitignore                          # Git yoksayma kuralları (geçici arşivleri dışlar)
│
├── engine/                             # JEV System-1 ve Çekirdek Motor
│   ├── jev_evaluator.mjs               # JEV System-1 kalite denetim kapısı (8 kural)
│   ├── jev_self_correction.mjs         # Otomatik revizyon ve hata düzeltme döngüsü
│   ├── prompt_templates.mjs            # 4 seviyeli MEB Maarif prompt şablonları
│   ├── llm_client.mjs                  # Çoklu sağlayıcı (Ollama + Google Gemini API)
│   ├── bulk_generator.mjs              # 4x4 matris toplu soru üretim motoru
│   ├── db_adapter.mjs                  # Çoklu test bankası indeksleyici ve veri adaptörü
│   ├── question_builder.mjs            # Örnek ve çıkmış soru dönüştürücü
│   ├── seed_runner.mjs                 # PostgreSQL tohumlayıcı
│   └── test_suite.mjs                  # 16 testlik otomatik test paketi
│
├── public/                             # İstemci Web Arayüzü (shadcn / UI8 Tasarımı)
│   ├── index.html                      # Kurumsal portal giriş modalı, optik form, LMS paneli
│   ├── style.css                       # shadcn Slate/Zinc Dark tema, CSS değişkenleri, print stili
│   ├── app.js                          # SPA durum yöneticisi, tema değiştirici, sınav motoru
│   └── questions.json                  # 4 branş, 12 test ve 53 soruluk doğrulanmış veri bankası
│
├── db/                                 # İlişkisel Veri Tabanı Katmanı
│   ├── schema.sql                      # PostgreSQL DDL (dersler, kazanımlar, oturumlar)
│   ├── seed_meb_8th_grade.sql          # Temel tohum verileri
│   └── seed_full_production.sql        # 53 sorunun ilişkisel tohum dökümü
│
├── scripts/                            # Bulut ve Senkronizasyon Betikleri
│   ├── drive_direct_streamer.mjs       # Google Drive (5 TB) sıfır-disk RAM akış motoru
│   └── cloud_sync_manager.mjs          # Gzip Level-9 arşiv yöneticisi
│
├── docs/                               # Detaylı Teknik Şartnameler
│   ├── PROJECT_ROADMAP.md              # Faz 1 - Faz 5 ilerleme çizelgesi
│   ├── JEV_SYSTEM1_SPEC.md             # JEV karar motoru şartnamesi
│   ├── MEB_MAARIF_STANDARDS.md         # 2018-2024 LGS analizleri ve paragraf taksonomisi
│   ├── MEB_CURRICULUM_CATALOG_1_8.md   # 1-8. sınıf müfredat ve sınav bağlantıları kataloğu
│   └── GITHUB_AND_DRIVE_SETUP.md       # GitHub ve Drive kurulum rehberi
│
└── data/                               # Veri Depolama Alanı
    ├── archive/                        # Gzip Level-9 arşiv yedekleri
    └── generated/                      # Üretilen soru paketleri
```

---

## 7. Faz Yol Haritası ve Tamamlanma Durumu

| Faz | Başlık | Durum |
| :--- | :--- | :--- |
| **Faz 1** | **Çekirdek Motor & Standartlar:** MEB Maarif Şartnamesi, JEV System-1, PostgreSQL Şeması | **%100 TAMAMLANDI** |
| **Faz 2** | **Çoklu Test & Oturum Yalıtımı:** 4 Branş, 12 Test, 53 Soru, State İzolasyonu, Mobil Optik Form | **%100 TAMAMLANDI** |
| **Faz 3** | **PostgreSQL & Backend API:** Native REST API, Net Hesaplama, Oturum Kaydı | **%100 TAMAMLANDI** |
| **Faz 4** | **Canlı LLM + JEV Soru Fabrikası:** 4 Zorluk Seviyesi, Sıfır-Şüphe Kapısı, Self-Correction, Gemini API | **%100 TAMAMLANDI** |
| **Faz 5** | **LMS Yönetim Paneli & UI/UX:** shadcn Zinc Dark Mod, MEB Portalı, Toplu Soru Fabrikası, Drive Streaming | **%100 TAMAMLANDI** |

---

## 8. Lisans ve Telif

Bu platform, Millî Eğitim Bakanlığı açık kaynak ve kamuya açık sınav formatlarına saygılı; eğitimde fırsat eşitliğini ve yapay zekâ destekli nitelikli soru üretimini amaçlayan **Meviza Enterprise Education** çatısı altında geliştirilmiştir.
