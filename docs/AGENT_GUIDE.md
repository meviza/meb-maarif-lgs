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
│   └── test_suite.mjs                    # 18 Ayrıntılı Otomasyon Testi
├── scripts/
│   ├── drive_direct_streamer.mjs         # RAM'den Google Drive'a 0 Bayt Disk Tüketimli Akış
│   ├── show_granular_curriculum.mjs      # Mikro Konu Raporlama CLI Aracı
│   └── enrich_questions_with_visuals.mjs # Sorulara Vektörel SVG ve Tablo Zenginleştirici
├── public/                               # shadcn Tabanlı Web SPA (HTML5/CSS3/Vanilla JS)
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

### Protokol 5: Sıfır Yerel Disk Tüketimi
Büyük üretimler doğrudan RAM tamponunda paketlenmeli ve `DriveDirectStreamer` ile Google Drive'a (`kerem.newton571@gmail.com`) aktarılmalıdır. Yerel Mac diskine dosya biriktirilmez.

---

## 3. Temel Komut Seti

| Amaç | Komut |
|---|---|
| **Tüm Testleri Koş** | `npm test` (18/18 PASS doğrulaması) |
| **Mikro Konu Envanterini İncele** | `npm run curriculum:granular` |
| **Kalite Endeksini Denetle** | `npm run quality:audit` |
| **36 Haftalık Kapasiteyi Gör** | `npm run plan:36weeks` |
| **Toplu Soru Fabrikasını Çalıştır** | `npm run generate:bulk` |
| **Canlı Sunucuyu Başlat** | `npm run start` (Port 3333) |
| **Drive Bulut Akışını Test Et** | `npm run drive:stream` |
