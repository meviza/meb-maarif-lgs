# Kalite Sistemi — CMMI Seviye 3 ve SPICE/ISO 330xx Hazırlığı

Bu belge sertifika veya resmî değerlendirme iddiası değildir. Amaç, CMMI Seviye 3’ün tanımlı, kurum çapında uyarlanabilir süreç fikrini ve ISO/IEC 33002’nin kanıta dayalı süreç değerlendirme yaklaşımını ürün geliştirmeye çevirmektir. Resmî olgunluk derecesi için yetkili bir appraisal/assessment gerekir. [CMMI seviyeleri](https://dev.cmmiinstitute.com/learning/appraisals/levels) · [ISO/IEC 33002](https://www.iso.org/obp/ui?_escaped_fragment_=iso%3Astd%3Aiso-iec%3A33002%3Aed-1%3Av1%3Aen)

## 1. Yayın yaşam döngüsü ve kanıt durumu

| Durum | Anlamı | Gerekli kanıt |
| --- | --- | --- |
| `planning` | İhtiyaç veya fikir kaydı | iş hedefi, rol sahibi, risk ve kabul ölçütü |
| `draft` | Henüz kullanıcıya sunulamaz | kaynak/kazanım taslağı ve sürüm |
| `automated_pass` | Sadece makine kontrolleri geçti | test raporu, şema/calc/görsel denetimi |
| `editor_review` | İnsan uzmanı inceliyor | öğretmen, ölçme uzmanı ve dil/görsel yorumları |
| `pilot` | Sınırlı ve izinli deneme | izin, gözlem, hata/geri bildirim kaydı |
| `approved` | Onaylı, yayınlanmamış | sorumlu rollerin imzası ve geri alma planı |
| `published` | Sürüm kontrollü kullanıcı yayını | sürüm etiketi, erişim kapsamı, izleme uyarıları |
| `withdrawn` | Geri çekildi | neden, etkilenen kullanıcı/kayıt ve düzeltme bağlantısı |

`automated_pass` hiçbir zaman pedagojik onay, telif serbestliği veya MEB onayı demek değildir.

## 2. Süreç haritası

| Alan | CMMI/ISO niyeti | Platformdaki somut uygulama |
| --- | --- | --- |
| Gereksinim | İzlenebilir, kontrollü ihtiyaç | ürün/öğrenme gereksinimi → kabul kriteri → test → kanıt bağı |
| Planlama ve risk | Tahmin, sahiplik, risk yönetimi | faz hedefi, çocuk verisi, telif, model, cihaz ve erişilebilirlik risk kayıtları |
| Konfigürasyon | Sürümlü varlık yönetimi | program sürümü, içerik sürümü, görsel sürümü, model sürümü, yayın etiketi |
| Teknik çözüm | Doğrulanabilir tasarım | API sözleşmesi, şema, hata durumları, geriye uyumluluk ve ADR |
| Doğrulama | “Doğru inşa ettik mi?” | birim, sözleşme, entegrasyon, görsel regresyon, güvenlik testleri |
| Geçerleme | “Doğru şeyi mi inşa ettik?” | öğretmen/öğrenci kullanılabilirliği, pilot, rubrik ve öğrenme kanıtı |
| Kalite güvence | Süreç uyumu ve bağımsız göz | kapı raporu, peer review, yayın öncesi kontrol listesi |
| Ölçüm | Karar için güvenilir metrik | içerik kapsama, hata, erişilebilirlik, gecikme, geri çekme ve pilot metrikleri |

## 3. Zorunlu kalite kapıları

### G0 — Kapsam ve haklar

- Program kaynağı, akademik yıl ve karar/program sürümü kaydedildi mi?
- Kaynak kullanım hakkı `approved` veya `reference_only` olarak açık mı?
- Öğrenci verisi, biyometrik veri, yurtdışı aktarım ya da tedarikçi riski var mı?
- Kabul kriteri, olumsuz senaryo ve geri alma ölçütü yazıldı mı?

### G1 — İçerik ve ölçme tasarımı

- Her etkinlik/soru hedef öğrenme çıktısı, süreç bileşeni, öğrenme kanıtı ve farklılaştırma yolu içeriyor mu?
- Cevap anahtarı veya rubrik tekil, gerekçeli ve bağımsız doğrulanabilir mi?
- Hata örüntüsü/çeldirici, hedef yaş için anlamlı mı?
- Görsel/işitsel varlıkların lisansı, alternatif metni ve mobil okunabilirliği var mı?

### G2 — Otomasyon

- Şema, aralık, birim, hesap/çizim parametresi ve API sözleşmesi testleri geçti mi?
- Sınır koşulları, boş/bozuk girdi, düşük bağlantı ve erişilebilirlik tercihleri test edildi mi?
- Benzerlik taramasının veri kaynağı ve sınırı raporda açık mı?
- Jev/Clef-Flash varsa güven eşiği, model sürümü, prompt şeması ve insan incelemesine eskalasyon kaydedildi mi?

### G3 — İnsan doğrulaması

- Alan öğretmeni, ölçme-değerlendirme uzmanı ve dil/görsel erişilebilirlik inceleyicisi ayrık rollerle onay verdi mi?
- İnceleyenler aynı üretici modelin değerlendirmesini yalnızca yardımcı kanıt olarak mı kullandı?
- Kritik yanlışta geri çekme sahibi ve süresi belirlendi mi?

### G4 — Pilot ve yayın

- Küçük, yetkili pilotta yaş/sınıf uygunluğu, anlaşılırlık, cihaz performansı ve olumsuz etki izlendi mi?
- Öğrenme verileri için rol/amaç/saklama sınırı ve kullanıcı açıklaması var mı?
- Sürüm, geçiş, izleme, geri alma ve destek koşulları doğrulandı mı?

## 4. Test kataloğu

| Kod | Test | Başarı ölçütü |
| --- | --- | --- |
| `CURR-*` | Program/kazanım izlenebilirliği | Her yayımlanmış varlık tek kanonik sürüme bağlanır |
| `ITEM-*` | Şema, cevap, rubrik, çeldirici | Eksik/çelişkili alan yayına geçemez |
| `MATH-*` | Sayısal/geometri doğruluğu | Kodla doğrulanan sonuç ve diyagram parametresi eşleşir |
| `REASON-*` | Hedef, kanıt/veri, yol gerekçesi, sonuç anlamı, kontrol ve aktarım | Adımlar kaynağa/birime/önceki sonuca bağlıdır; koşul, neden ve amaç açıklanır; sayısal hata kapalı kalır; alan/yaş/transfer anlamı insan incelemesi bekler |
| `VIS-*` | Görsel/alt metin/kontrast | Küçük ekran, baskı ve ekran okuyucu kontrolü geçer |
| `LANG-*` | Türkçe ve yaş seviyesi | İnsan incelemesi + örnekleme raporu vardır |
| `RIGHTS-*` | Telif/lisans | Her varlıkta kaynak/izin/attribution kanıtı vardır |
| `SEC-*` | Kimlik, yetki, öğrenci verisi | Yetkisiz rol veriye veya cevap anahtarına erişemez |
| `ACC-*` | WCAG 2.2 AA | Klavye, odak, kontrast, hareket azaltma ve alternatifler test edilir |
| `PERF-*` | Düşük cihaz/ağ | Öğrenci temel akışı kabul edilen süre/bellek sınırında kalır |
| `PILOT-*` | Psikometri ve kullanılabilirlik | Madde hatası, anlaşılmama ve öğretmen geri bildirimi kapatılır |
| `INK-*` | Kalem izi, işaretleme/yazma/sonuç sırası | Kalem ucu gerçek iz ucunda; sonuç yazım tamamlanmadan açılmaz; pen-up geçişi ve kapanma/deadline testleri geçer |
| `VOICE-*` | Öğretmen karakteri, Türkçe okunuş, dinleyici kabulü | Yaş bandı/yetişkin voice hakkı kayıtlı; metin aynen korunur; en az iki alan öğretmeni + bir Türkçe uzmanıyla kör dinleme ve kritik hata ret kaydı gerekir |
| `SYNC-*` | Ses–kalem–altyazı | Gerçek ses/anahtar kelime/kare sınırı ölçülür; yalnız cümle süresi veya codec testi kelime hizalaması sayılmaz |

WCAG 2.2 bir W3C Recommendation’dır; erişilebilirlik hedefi için uygun temel standardı sağlar. [W3C WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

Videoda teknik MP4 başarısı ile öğretici kalite kabulü ayrıdır. Önceki statik/sessiz pilot kullanıcı tarafından kalite bakımından reddedildi; [yeni öğretmen/kalem/ses kabul standardı](TEACHER_VIDEO_STANDARD_2026-10-03.md) uygulanır. Unit test, model öz-değerlendirmesi veya AI-detector puanı dinleyici kabulünün yerine geçemez.

Gerekçe sözleşmesi ve altı soru ailesi + ayrı kavram dersi normal fabrika pilotuna bağlandı; [kapsam ve taze test kanıtı](REASONED_FACTORY_STATUS_2026-10-03.md). İşlem sayısı değişkendir; her alan dokuz adıma zorlanmaz. Genel kaynak hash'i beyanı gerçek resolver değildir; yorum adımlarının anlamsal doğruluğu ve cevap sızıntısı insan incelemesi gerektirir. Editörde `reveal` veya sonraki adımın açılması öğrenci yetkisi, öğrenme, ustalık veya analitik puan kanıtı değildir.

## 5. UI/UX kalite standardı

UI/UX için tek bir “güzel tema” ölçütü yoktur. Bu projede kalite; insan merkezli tasarım, yaşa uygun bilişsel yük, erişilebilirlik, hata önleme, öğrenme akışı ve görsel özgünlük birleşimidir.

- Her rol için görev analizi ve kullanılabilirlik senaryosu yazılır.
- İlkokul testlerinde çocuğun okuma hızı varsayılmaz; ses/ikon/örnekle desteklenir.
- Öğretmen paneli karar gerekçesi ve geri alma imkânı sunar; sadece gösterişli KPI kartları sunmaz.
- Veli deneyimi çocuğu sıralamaz, açıklanabilir gelişim ve evde destek önerisi verir.
- Tasarım tokenları, bileşen kütüphanesi, lisanslı varlık envanteri ve görsel regresyon testleri sürümlenir.

## 6. Kanıt deposu

Her faz için aşağıdaki küçük ve denetlenebilir kayıtlar tutulur; büyük ham içerik depoya kopyalanmaz:

```text
evidence/
  requirements/      gereksinim → test izlenebilirlik matrisi
  reviews/           öğretmen/uzman inceleme kayıtları
  tests/             makine çıktıları ve çevre sürümleri
  pilots/            anonimleştirilmiş pilot özeti
  releases/          sürüm, onay ve geri alma kayıtları
  risks/             açık riskler ve kararlar
```

Bir kapı başarısızsa “tamamlandı” yazılmaz; durum, sahip ve sonraki doğrulama adımı açıkça kaydedilir.
