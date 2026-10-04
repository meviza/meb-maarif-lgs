# MEB Onaylı Kaynak Temeli Ve Yeni Masrafsız Üretim Kararı

Tarih: 4 Ekim 2026. Başlangıç: `f5c02accaca09e4ba3aa7112da564cb0913ea603`; dal: `codex/k12-foundation-audit`. Kullanıcının iki açıklaması birlikte ele alınmıştır: mevcut Google imkânlarını öncelemek/yeni servis masrafı çıkarmamak ve MEB tarafından kabul edilmiş eğitim materyalinin kurumsal denetimini güvenilir kaynak temeli olarak tanımak.

## Kullanıcının Vurgusu Ve Resmî Doğrulama

**TTKB kabulü olan ders kitabı, denetimsiz internet metni olarak ele alınmaz.** [TTKB resmî açıklaması](https://ttkb.meb.gov.tr/www/sss.php?DIL=tr) öğretmen ve akademisyen paneli, bireysel inceleme, ortak hata raporu/puanlama, Kurul kararı ve basıma hazırlık sürecini tarif eder. Panel 5–8 kişidir; kabulde her kriter puanı en az 75. Kitaptaki Kurul karar tarihi/sayısı kabulün tanığıdır. Bu inceleme bilimsel yeterliği, programa uyumu, ölçme-değerlendirme, dil, görsel tasarım ve yaş/sınıf uygunluğunu kapsar.

[20 Şubat 2026 süreç duyurusu](https://ttkb.meb.gov.tr/www/quotders-kitaplari-ve-ogretim-materyalleri-inceleme-ve-degerlendirme-surecleriquot-dokumani-paydaslarin-erisimine-sunuldu/icerik/871/tr), başvuru/panel/rapor/Kurul zincirinin kayıt altına alındığını doğrular. [TYMM değerlendirme kriterlerinin 2024 güncellemesi](https://ttkb.meb.gov.tr/www/quotders-kitaplari-ve-egitim-araclari-ile-bunlara-ait-elektronik-iceriklerin-incelenmesinde-degerlendirmeye-esas-olacak-kriterler-ve-aciklamalariquot-guncellendi/icerik/657), bütünleşik program ve ölçme-değerlendirmeyi ayrıca ele alır. İnceleme mekanizmasının varlığı doğrulandı; indirilen bütün PDF'lerin tek tek kabul kararı/etkin baskı eşliği bu araştırmada yeniden yapılmadı.

## Fabrikadaki Doğru Ayrım

1. Kaynak kitap/program/kazanım seçilir. Belgenin kimliği, etkin sınıf/yıl, baskı/sürüm, resmî URL/hash ve varsa Kurul kararı kaydedilir. Kararı doğrulanmış kitap için kurumsal inceleme **mevcut olumlu kanıttır**, baştan yok sayılmaz.
2. Kaynaktan amaç, kavram, beceri, yaş sınırı ve soru ailesi öğrenilir. Özel yayınevi metni, özgün soru, çizim, ses veya sayfa otomatik kopyalanmaz; bu ayrı kullanım hakkı konusudur.
3. Bizim özgün görev/konu anlatımı/ses/video üretimimiz kaynakla eşleştirilir. Kontrolün odağı yeni üretimde eklenen/değiştirilen şeydir: sayı/birim/cevap, koşul/gerekçe, metin–görsel–ses eşliği, telaffuz ve yaş düzeyi.
4. Kurumsal kaynak kabulü bizim yeni sorumuzun/video dosyamızın otomatik kabulü diye yazılmaz. Teknik geçiş, alan/öğretmen incelemesi ve yayın ayrı durumlar olur. Kaynak değişikliği veya tespit edilen hata sürüm/geri çekme kaydına bağlanır.

Bu yaklaşım MEB kaynağının pedagojik güvenilirliğine tekrar tekrar genel şüphe üretmez. Kabulü bilinen kaynağı birincil temel alır; kaynak numarası/cevabı/ifadesi yeni üretimde yanlış aktarıldığında yakalayacak denetimi sürdürür. Resmî derskitabı incelemesinin kapsamı, bütün MEB alan adlarında bulunan her soru/PDF'ye delilsiz taşınmaz; materyal türü ve resmî kabul/yayın kaydı ayrı saklanır.

## Masraf Ve Araç Sırası

| Karar | Bu Fazdaki Sınır |
| --- | --- |
| Google önce | Mevcut abonelikle gerçekten sunulan araç/kota/model/hak doğrulanır. Yeni plan, kart, billing veya kredi paketi açılmaz. |
| API çağrı bütçesi | `callBudget=0`, otomatik çağrı/retry 0. Yeni kullanıcı inisiyatif yetkisi mevcut kapalı tüketiciyi sessizce canlı API'ye çevirmez. |
| Docker/Drive | 250 USD kredi ve 5 TB kullanıcı beyanı kaynak planına alınır; güncel bakiye, GPU/iş kapasitesi, API kotası veya ücretsiz sunucu diye sunulmaz. Bu fazda job/provision/upload yok. |
| Ses/video | Önce Google kapsamı; uygun değilse ticari lisansı doğrulanan açık kaynak. Code/weight/voice/data izinleri ayrı; büyük model veya kurulum otomatik değil. |
| Matematik görseli | Mevcut deterministik SVG/kalem/FFmpeg yolu önce gelir; generatif görüntü/video matematiksel şekli ve sonucu rastgele değiştirmez. |
| Öğrenci teslimi | Onaylı statik içerik sunumu ile çocuğun canlı bulut AI kullanımı ayrı tasarlanır. Şu an gerçek çocuk/kurum verisi gönderilmez. |

[Kapalı TTS/PCM hattı](GRADE6_COMMON_RELATIONS_TTS_PCM_ROOT_ACCEPTANCE_2026-10-04.md) bu kararla uyumludur; çağrı izni değil, yerel hazırlık/byte kanıtıdır. Kullanıcının ürünün işletme/ticari haklarını kendinde tutma hedefi korunur; kullanılan üçüncü taraf kaynak/model/medya koşullarının kalktığı varsayılmaz.

## Google Hesabı: Bugün Fiilen Görülen Durum

4 Ekim 2026, Chrome üzerinden Google One genel plan sayfası görüldü; bu kamu kataloğu aktif hesap üyeliğini kanıtlamaz. Sayfadaki hesaplı ayar bağlantısı ve Flow açılışı, varsayılan tarayıcı hesabında yeniden kimlik doğrulaması istedi. Parola/OTP okunmadı/girilmedi; abonelik, billing, üretim veya kredi satın alımı yapılmadı. Proje Google AI Pro hesabında Flow'u açması kullanıcıdan istendi. Özel hesap kimliği/URL ve ekran görüntüsü kamu raporuna alınmaz. Mevcut proje planı, kredi bakiyesi ve live TTS yetkisi **bugün doğrulanamadı**; geçmiş ses pilotları tarihsel kanıttır.

Kullanıcı proje hesabıyla Flow'u açacağını bildirdi. [Google'ın 27 Ocak 2026 duyurusu](https://blog.google/innovation-and-ai/technology/developers-tools/gdp-premium-ai-pro-ultra/) AI Pro'ya aylık 10 USD developer Cloud kredi avantajı eklediğini ve Gemini API'de kullanılabileceğini açıklıyor. Dolayısıyla “Pro hiçbir API kredisi sağlamaz” denmez. Aktivasyon/uygun proje/bakiye ayrı kanıt gerektirir; [güncel billing açıklamasında](https://ai.google.dev/gemini-api/docs/billing) Prepay hesabında promosyon kredisi kullanımından önce ödenmiş bakiye gerektiği belirtilir. Bu fazda bu ödeme veya hesap değişikliği yapılmaz; callBudget 0 kalır.

## Teminat: Doğru Beyan Ve Kanıt

Sağlayıcıya/okula yalnız kanıtlanmış hususlar beyan edilebilir: yetişkin editör kontrolünde taslak hazırlık, sıfır çağrı bütçesi, gerçek çocuk verisi kullanılmaması, resmî kaynak/sürüm izlenebilirliği ve uygulanmış test/audit sınırları. Sağlanacak gelecek taahhütler, bugün uygulanmış kontrol diye sunulmaz. Sağlayıcı şartlarına uyum, gerekli hakların alınması, erişim/saklama ve öğretmen/yaş inceleme süreçleri yapılacak işler olarak açıkça yazılır.

Bu fazda herhangi bir dış kuruma garanti mektubu, sözleşme veya izin başvurusu gönderilmedi. Hukuk/öğretmen kabulü yapılmış ya da platform MEB onaylı/risksiz ilan edilmedi. Amaç işi durdurmak değil, mevcut kurumsal güvenilirlik kanıtını doğru tanıyıp yeni üretimin kalitesini ve satışa uygunluğunu belgelemektir.

## Takip

### Bu Oturumun Doğrulaması

Üretim kodu değişmedi. Mevcut kapalı TTS hazırlığı, PCM byte doğrulaması, fabrika entegrasyonu ve CLI ön kontrolünün dört test dosyası yeniden çalıştırıldı: **41/41 geçti**, başarısız/iptal/atlanan test 0, exit 0, süre 3097,058709 ms. Bu teknik kontrol hesap/kota, canlı Türkçe konuşma veya yeni video teslimi kanıtı değildir. Önceki 1336 test sonucu tarihsel faz kaydıdır; bu oturumda tam paket tekrar çalıştırılmış gibi gösterilmez.

```sh
node --test test/grade6_common_relations_closed_tts.test.mjs test/common_relations_pcm_receipt.test.mjs test/grade6_common_relations_closed_tts_pcm_integration.test.mjs test/common_relations_audio_preflight_cli.test.mjs
```

### Bağlı Kayıtlar

- [MEB denetim ve ticari yeniden kullanım incelemesi](MEB_COMMERCIAL_REUSE_RECHECK_2026-10-04.md)
- [Google öncelikli, yeni masrafsız medya incelemesi](GOOGLE_FIRST_ZERO_SPEND_MEDIA_RECHECK_2026-10-04.md)
- [Genel güncel faz planı](PLATFORM_REBASE_PLAN_2026-10-03.md)

Bu belge karar/araştırma kaydıdır. Üretim kodu, model, kaynak arşivi ve yayın stoku değiştirilmedi; yeni soru/ses/video sayısı 0. DAMA'da kaynak kabulü, üretim kalitesi, kullanım hakları ve owner kararları farklı metaveri alanları olarak korunur. Bu alanların tamamlandığı veya süreç sertifikası alındığı iddia edilmez.
