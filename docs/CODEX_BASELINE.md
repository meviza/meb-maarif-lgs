# K-12 Platformu — Codex Başlangıç Kaydı

**Tarih:** 3 Ekim 2026
**Durum:** Planlama ve doğrulama aşamasındaki prototip
**Çalışma dalı:** `codex/k12-foundation-audit`
**Kapsam:** Türkiye’de 1–8. sınıfla başlayıp ileride K–12’ye genişleyebilecek tekil eğitim platformu

Bu belge, önceki sohbetlerde veya dosyalarda geçen iddialardan bağımsız olarak, bu dalda kabul edilen doğruluk sınırını kaydeder. Çelişen eski beyanlar tarihsel nottur; sürüm, test ve kanıt olmadan ürün beyanı değildir.

## Doğrulanmış başlangıç noktası

- Kanonik kaynak depo `meb-maarif-lgs` olup başlangıçta Node/ESM tabanlı bir web/API prototipidir.
- Çalışan veri yapısı yalnızca 5–8. sınıfı, dört dersi ve toplam 276 örnek soruyu kapsar. 1–4. sınıf ya da K–12 ürünü değildir.
- Ayrı bir Android/Compose denemesi bulunur; adı 1. sınıf, bazı metadatası 2. sınıf dediği için kanonik kaynak olarak kabul edilmemiştir.
- Antigravity’deki açık çalışma ağacı `master` dalında bırakılmıştır. Bu dal, ayrı worktree’de geliştirilir; önceki ajanın çalışması değiştirilmez.
- Yerel diskte sınırlı boş alan vardır. Büyük model, PDF veya soru arşivi indirmek için varsayılan hedef yerel disk değildir.

## Bu aşamada yapılmaması gereken iddialar

Aşağıdaki ifadeler kanıtlanmadıkça kullanılmayacaktır:

- “MEB onaylı”, “resmî olarak sertifikalı” veya “LGS ile eşdeğer”.
- “%100 müfredat uyumlu”, “sıfır hata”, “sıfır halüsinasyon”, “sıfır intihal” veya “production-ready”.
- Google Drive, PostgreSQL, LLM ya da mobil uygulama entegrasyonunun canlı çalıştığı.
- Bir modelin ürettiği sorunun otomatik olarak pedagojik, telifsiz veya yayıma hazır olduğu.

Resmî programla **izlenebilir uyum**, sürümlü kazanım–içerik–kanıt kaydıyla gösterilebilir. “MEB onayı” ise ayrı bir resmî inceleme/karar sürecidir; çevrim içi program dokümanlarını okumak onay oluşturmaz. [TTKB SSS](https://ttkb.meb.gov.tr/www/sss.php)

## İlk mimari kararlar

1. **Tek platform, ayrı deneyimler:** öğrenci uygulaması, öğretmen çalışma alanı, veli görünümü, idari/ içerik yönetimi aynı veri sözleşmesini paylaşır; ayrı ayrı sınıf uygulamaları yapılmaz.
2. **Müfredat sürümlüdür:** `academic_year`, `program_version`, `board_decision`, sınıf, ders, tema ve öğrenme çıktısı her içerik varlığında tutulur. “36 hafta” sabit sayı değil, okul yılı/takvim sürümünden üretilen bir planlama görünümüdür.
3. **Yapay zekâ taslak üretir; insan yayınlar:** içerik yaşam döngüsünde otomatik kapı, alan öğretmeni, ölçme-değerlendirme uzmanı, dil/görsel erişilebilirlik incelemesi ve pilot kanıtı ayrı adımlardır.
4. **Jev/Clef-Flash üretici değildir:** bunlar kapalı şemalı karar modelleri olarak ikincil değerlendirme, yönlendirme ve güven skoru katmanında ele alınır. Ayrıntı için [CONTENT_FACTORIES_AND_RIGHTS.md](CONTENT_FACTORIES_AND_RIGHTS.md).
5. **Drive bir ürün veritabanı değildir:** yetkili bağlantı ve veri koruma değerlendirmesi sonrasında yalnızca şifreli, sürümlü yedek/aktarım hedefi olabilir. Öğrenci etkinlik verisinin çalışma zamanı kaynağı, erişim denetimli uygulama veritabanıdır.

## İlk yayın ölçütü

İlk gerçek hedef, “16.000 soru” sayısı değildir. Seçilecek tek sınıf–ders–tema için aşağıdakilerin tamamı kanıtlandığında bir dikey dilim kabul edilir:

- Kanonik program kaynağı ve kullanım hakkı kaydı,
- kazanım/öğrenme kanıtı izlenebilirliği,
- metin, sayısal cevap ve görsel doğruluk testleri,
- öğretmen ve ölçme uzmanı onayı,
- öğrenci/veli rızası gerektirmeyen güvenli kullanılabilirlik testi,
- erişilebilirlik ve cihaz regresyonu,
- sürümlü yayın ve geri alma kaydı.

Bu disiplin, az sayıda fakat güvenilir içerikle başlayıp sonraki içerik fabrikasının aynı kaliteyi ölçeklemesini sağlar.
