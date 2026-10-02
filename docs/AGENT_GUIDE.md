# MEB Maarif LGS Platformu — Ajan (Agent) Devir Teslim ve Yürütme Kılavuzu
**Hedef Kitle:** Sistemi yönetecek, genişletecek veya paralel çalıştırılacak otonom AI ajanları.

---

## 1. Dizin Yapısı ve Çekirdek Modüller

```
fearless-pasteur/
├── engine/                               # Çekirdek Mantık ve Algoritmalar
│   ├── jev_evaluator.mjs                 # JEV System-1 Kalite Kapısı ve 1-5 Yıldız Puanlama
│   ├── jev_self_correction.mjs           # Model-JEV Arası Revizyon ve İyileştirme Döngüsü
│   ├── jev_video_solution_engine.mjs     # 5 Aşamalı Video Çözüm Storyboard & InDesign Dizgi Motoru
│   ├── meb_granular_curriculum.mjs       # 5, 6, 7, 8. Sınıflar 1.538 Mikro Konu ve Kazanım Ağacı
│   ├── curriculum_scale_factory.mjs      # 4 Kademe x 36 Hafta x 28 Soru Üretim & Drive Akışı
│   ├── bulk_generator.mjs                # 4 Branş x 4 Zorluk Matris Üretimi
│   ├── db_adapter.mjs                    # PostgreSQL ve Bellek-İçi Hibrit Veri Katmanı
│   ├── llm_client.mjs                    # Çoklu Sağlayıcı LLM İstemcisi (Ollama & Gemini API)
│   ├── quality_analytics.mjs             # Maarif Kalite Endeksi ve Yıldız Dağılım Raporlayıcı
│   └── test_suite.mjs                    # 20 Ayrıntılı Otomasyon Testi
├── scripts/
│   ├── drive_direct_streamer.mjs         # RAM'den Google Drive'a 0 Bayt Disk Tüketimli Akış
│   ├── show_granular_curriculum.mjs      # Mikro Konu Raporlama CLI Aracı
│   ├── enrich_questions_with_visuals.mjs # Sorulara Vektörel SVG ve Tablo Zenginleştirici
│   └── generate_grades_5_6_7_banks.mjs   # 5, 6 ve 7. Sınıflar Soru Havuzu Üreticisi
├── public/                               # shadcn Tabanlı Web SPA (HTML5/CSS3/Vanilla JS)
│   ├── questions.json                    # 8. Sınıf LGS Soru Bankası (108 Soru, 16 Test)
│   ├── questions_grade_5.json            # 5. Sınıf Maarif Soru Bankası (56 Soru, 8 Test)
│   ├── questions_grade_6.json            # 6. Sınıf Maarif Soru Bankası (56 Soru, 8 Test)
│   └── questions_grade_7.json            # 7. Sınıf Maarif Soru Bankası (56 Soru, 8 Test)
├── db/                                   # PostgreSQL Şemaları ve Seed SQL Dosyaları
└── docs/                                 # Kurumsal Şartnameler ve Kılavuzlar
```

---

## 2. Ajanlar İçin Kesin Protokoller (SOP)

### Protokol 1: Asla Çalıntı/Telifli Soru Üretme (SoruSat & MEB Koruma)
Soru üretirken hiçbir zaman hazır kaynaklardan veya internetten soru kopyalama. JEV'in `zero_plagiarism_guarantee` kontrolünü çalıştır. Tüm sayılar, bağlamlar ve çeldirici mantıkları sıfırdan türetilmelidir.

### Protokol 2: 100+ Mikro Konu Hedefleme
Her derste sadece genel ünite adı kullanma. `engine/meb_granular_curriculum.mjs` içindeki mikro konuları ve resmî TTKB kazanım kodlarını (Örn: `M.8.1.1.2`, `F.8.3.1.2`, `T.8.3.20`) baz al.

### Protokol 3: Video Çözüm Senaryosu Üretimi
Yeni sorular sisteme eklenirken `JevVideoSolutionEngine.generateVideoScript(q)` çalıştırılarak 5 aşamalı storyboard (görsel aksiyon ve öğretmen seslendirme replikleri) JSON verisine eklenmelidir. Bu işlem yayınevi değerini en az %20-30 artırır.

### Protokol 4: Vektörel Görsel & Yeni Nesil Ağırlığı
LGS sorularının %90+'ı beceri temelli (Yeni Nesil) olmalıdır. Matematik, geometri ve fen sorularında mutlaka inline SVG çizimleri (`visualContent`) kullanılmalıdır.

### Protokol 5: Çok Kademeli (5, 6, 7, 8) Pedagojik Seviye Ayrımı
Soru eklerken ilgili kademenin bilişsel yükünü gözet: 5. sınıfa 8. sınıf LGS karekök/cebir formülü koyma; 6. sınıfa mitoz/mayoz koyma. `auditor.evaluateGradeSuitability(draft, grade)` ile doğrula.

### Protokol 6: Sıfır Yerel Disk Tüketimi
Büyük üretimler doğrudan RAM tamponunda paketlenmeli ve `DriveDirectStreamer` ile Google Drive'a (`kerem.newton571@gmail.com`) aktarılmalıdır. Yerel Mac diskine dosya biriktirilmez.

---

## 3. Temel Komut Seti

| Amaç | Komut |
|---|---|
| **Tüm Testleri Koş** | `npm test` (20/20 PASS doğrulaması) |
| **5-7. Sınıf Havuzunu Derle** | `node scripts/generate_grades_5_6_7_banks.mjs` |
| **Mikro Konu Envanterini İncele** | `npm run curriculum:granular` |
| **Kalite Endeksini Denetle** | `npm run quality:audit` |
| **36 Haftalık Kapasiteyi Gör** | `npm run plan:36weeks` |
| **Toplu Soru Fabrikasını Çalıştır** | `npm run generate:bulk` |
| **Canlı Sunucuyu Başlat** | `npm run start` (Port 3333) |
| **Drive Bulut Akışını Test Et** | `npm run drive:stream` |
