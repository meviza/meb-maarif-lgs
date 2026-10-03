# K-12 Eğitim Platformu — Ürün ve Mimari Planı

## Ürün vaadi

Amaç; öğrencinin 1. sınıftan 8. sınıfa geçerken uygulama, öğrenme geçmişi ve güvenli destek bağlamını kaybetmediği; öğretmen, veli ve idarenin kendi görevlerine uygun fakat aynı öğrenme kanıtına dayalı deneyimler kullandığı bir platform kurmaktır.

Türkiye Yüzyılı Maarif Modeli’nin beceri, değer, farklılaştırma ve öğrenme kanıtı yaklaşımı çekirdektir. Finlandiya veya Singapur gibi ülkelerden alınan uygulamalar bir “ülke modu” ya da hazır reçete değildir; öğrenci için hangi yaklaşımın ne zaman işe yaradığını küçük, ölçülebilir ve öğretmen denetimli deneylerle araştırma kaynağıdır.

## Kullanıcı katmanları

| Katman | Birincil iş | Asla otomatikleştirilmemesi gereken karar |
| --- | --- | --- |
| Öğrenci | Anlatım, etkinlik, pratik, geri bildirim, portföy | Yetenek/kişilik etiketi, kariyer hükmü, ceza veya sınıflandırma |
| Öğretmen | Hedef seçme, grup/farklılaştırma, öneri inceleme, geri bildirim | AI önerisini incelemeden öğrenciye kalıcı hüküm verme |
| Veli | Açıklanabilir ilerleme, evde destek önerisi, izin tercihleri | Çocuğun ayrıntılı psikolojik/akademik profilini üçüncü tarafla paylaşma |
| Okul yöneticisi | Yetki, içerik sürümü, sınıf/okul düzeyi kalite göstergeleri | Ham öğrenci verisiyle öğretmen veya çocuk sıralaması |
| İçerik kurulu | Kaynak, içerik, görsel, çözüm ve yayın onayı | Kaynak/hak kaydı olmadan yayın |

## Öğrenme modeli

Her öğrenme nesnesi aşağıdaki kanıt zincirine bağlanır:

```text
resmî program sürümü
  -> tema / öğrenme çıktısı / süreç bileşeni
  -> öğrenme yaşantısı ve farklılaştırma seçeneği
  -> etkinlik veya soru
  -> öğrenci yanıtı ve geri bildirim
  -> öğretmen incelemesi ve bir sonraki adım
```

Bu model, sadece çoktan seçmeli testten ibaret değildir. İlkokul için resimli/işitsel etkinlik, kısa yanıt, gözlem, oyun ve portfolyo; ortaokul için açık uçlu/kısa yanıt, rubrik, beceri temelli bağlam sorusu ve gerektiğinde LGS deneme modu birlikte tasarlanır.

Uyarlama motoru “öğrenciyi model seçerek etiketlemek” yerine hipotez üretir: örneğin aynı kazanım için somut görsel, akran işbirliği, anlatımlı örnek veya problem çözme rotası denenir; başarı, çaba, hata örüntüsü ve öğrencinin seçimi kayda alınır. Düşük güvenli öneri öğretmene gider; kalıcı profil veya kariyer yönlendirmesi yapılmaz.

## Hedef teknik yapı

Önerilen uzun vadeli yapı, ayrı sınıf uygulamaları yerine tek depoda sürümlü bir ürün ailesidir:

```text
apps/
  learner-mobile/      iOS + Android öğrenci deneyimi
  teacher-web/         öğretmen ve veli web deneyimi
  admin-web/           içerik, yetki ve okul yönetimi
services/
  api/                 kimlik, içerik, değerlendirme ve raporlama API'si
  content-worker/      taslak, denetim ve yayın iş akışı
packages/
  curriculum/          program ve takvim sözleşmeleri
  content-contract/    soru/etkinlik şemaları ve doğrulayıcılar
  assessment/          puanlama, rubrik ve psikometrik hesaplar
  design-system/       erişilebilir ortak bileşen ve tokenlar
  audit/               değişmez kanıt/audit olayları
```

Mevcut Node prototipi, veri/iş kuralı envanteri olarak korunur; doğrudan K–12 üretim omurgası sayılmaz. Mobil için iOS ve Android’i aynı anda destekleyecek ortak bir çapraz platform uygulaması değerlendirilecektir. Teknoloji seçimi, mevcut Android denemesinin lisans/kalite denetimi ile öğrenci cihaz pilotundan sonra yapılır; bu aşamada yeniden yazım kararı verilmez.

## Görsel deneyim ilkeleri

- 1–4. sınıfta okuma yükü azaltılır; sesli yönerge, belirgin görsel hiyerarşi ve okumayı destekleyen semboller kullanılır. Sesin metin/işaret alternatifi bulunur.
- Geometri ve fen sorularında kritik diyagramlar dekoratif görsel değil, sürümlü vektör varlığıdır: etiket, ölçü, alternatif metin, kaynak/üretim yöntemi ve doğrulama kaydı zorunludur.
- Tasarım sistemi “rastgele AI ikonları” kullanmaz. Özgün/komisyonlu veya lisansı kaydedilmiş ikon ve illüstrasyon kütüphanesi oluşturulur.
- Animasyon ödül değil yön bulma aracıdır: hareket azaltma tercihi, klavye erişimi ve düşük güçlü cihaz performansı test edilir.
- Öğrenci uygulaması eğlenceli, öğretmen ve yönetici arayüzleri bilgi yoğun fakat sakin olmalıdır; aynı token sistemi farklı bilgi yoğunluğu uygular.

## Veri ve güvenlik sınırı

Çocukların uzun dönemli öğrenme verisi yüksek hassasiyetlidir. En az veri, takma kimlik, rol-temelli erişim, amaç/süre sınırlaması, silme/ihracat süreçleri, denetlenebilir ebeveyn/okul izinleri ve yurtdışı aktarım değerlendirmesi ürün gereksinimidir. Ses/görüntü veya biyometrik nitelik taşıyabilecek veri varsayılan olarak toplanmaz. KVKK, uzaktan eğitim platformlarında öğrenci verisi ve yurtdışı aktarımı için özellikle uyarıda bulunur. [KVKK duyurusu](https://www.kvkk.gov.tr/Icerik/6723/Uzaktan-Egitim-Platformlari-Hakkinda-Kamuoyu-Duyurusu)

## İlk ürün dilimi

İlk uygulama hedefi, program kaydından başlayıp öğrenci etkinliği, öğretmen geri bildirimi ve veliye açıklanabilir özetle biten **tek bir sınıf–ders–tema dikey dilimi**dir. Sınıf/ders seçimi, kaynak hakları ve resmi program kayıtları tamamlandıktan sonra içerik kuruluyla yapılacaktır. Bu, 1–4 için gerçekten görsel/işitsel erişilebilirlik altyapısını kanıtlamadan binlerce soru üretme riskini önler.
