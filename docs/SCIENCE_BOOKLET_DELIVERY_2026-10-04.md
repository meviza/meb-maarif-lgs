# Fen öğrenci kitapçığı — Yeniden kuruluş teslimi

Tarih: 4 Ekim 2026. Durum: Yerel, sentetik öğrenci önizlemesi ve yeni özgün soru taslakları. Eski Fen Atölyesi kabul edilmiş sayılmaz.

## Kullanıcı şikayetlerinden çıkan değişiklikler

| Sorun | Yeni davranış ve kanıt |
| --- | --- |
| Öğrenciye editör/üretim paneli sunulması | Öğrenciye yalnız kendi kitapçığı, cevapları, sonra bak işareti ve sonuç/çözüm akışı gönderilir. Bloom, tahmini zorluk, kaynak, model ve üretim sayacı öğrenci API nesnesinde yoktur. |
| Sınıf seçimiyle başka sınıfların açılması | Her yerel sunucu sabit sınıf kaydıyla başlar; istemci sınıf/rol belirleyemez. Yanlış sınıf ID'si, query/header sahteciliği ve başka sınıfın geçerli kaynak kodunu yeniden etiketleme testleri reddedilir. Bu yerel düzen gerçek okul kimlik doğrulaması değildir. |
| Büyük yeşil kartlar, tek soruda uzun kaydırma, metnin tekrarının görsel sayılması | Beyaz kağıt, siyah Arial metin, iki sütun ve orta ayırıcı. Soru uzunluğuna göre 2–4 soruluk sayfalar; son tek soru artık sayfada tek kalabilir. Son iki kısa soru iki sütuna bölünür. Telefon daraldığında tek sütun. |
| Gerçek düzenek yerine yazı kutuları, hatalı/taşan etiketler | Her soru için kompakt özgün fen şekli, tablo veya grafik. 54 şekil native SVG sınırı korunarak açıldı; gerçek kitapçıkta etiket sınırları ve yatay taşma da ölçüldü. |
| 1.539 testin görsel/pedagojik kalite gibi sunulması | Test sayısı yalnız yazılım regresyon kanıtıdır. Bu teslimde ayrı soru okuma/çözme, kaynak sınırı incelemesi, gerçek raster ve tarayıcı görev kanıtı vardır. Öğretmen kabulü bunların yerine geçirilmez. |
| Eski 54 sorunun düzeltilip tekrar aynı stok sayılması | Eski yazarlık tohumları, üretici, yeşil görünüm ve sunucu kaldırıldı. Eski CLI güvenli biçimde durur. Yeni `YF6/YF7/YF8` kimlikli taslaklar ayrı stoktur. Eski sürüm yalnız Git geçmişinden geri alınabilir; eski raporlar REDDEDİLMİŞ/TARİHSEL etiketlidir. |

Öğretmen, veli, okul yöneticisi ve editör ekranlarının işlevleri [ürün kararında](SCIENCE_BOOKLET_RESET_2026-10-04.md) ayrıldı. Bu teslim o dört ekranın yeniden geliştirildiği iddiasını taşımaz.

## İçerik kapsamı

| Sınıf | Fizik | Kimya | Biyoloji | Yeni taslak |
| --- | ---: | ---: | ---: | ---: |
| 6 | 6 | 6 | 6 | 18 |
| 7 | 6 | 6 | 6 | 18 |
| 8 | 6 | 6 | 6 | 18 |
| Toplam | 18 | 18 | 18 | 54 |

450 hedefine kalan: **396**. Yayımlanmış soru: **0**. Yeni stok sayısı eski reddedilen 54'ü içermez. Soru sayısı kaynak arşivinden, test sayısından veya model çağrısından türetilmedi.

Son içerik SHA-256: `d1ae87c7ee2d1f8673279587051c158ca383618604640047acf3f3a4a500a07d`.

6 ve 7. sınıf TYMM, 8. sınıf 2018 etkin program kodlarına bağlandı. Kaynak/kod/fiziksel sayfa doğrulaması `sources/science-678-source-blueprint.json` üzerinden yapılır. Üslup ve yerleşim referansları [yeniden kuruluş kararında](SCIENCE_BOOKLET_RESET_2026-10-04.md) doğrudan resmî bağlantılarla kayıtlıdır. Müfredatın tamamı ve tüm soru aileleri bu 54 taslakla kapsanmış değildir; bu paket tam bir LGS denemesi değil, sınıfa bağlı Fen pilotudur.

İki yazar paralel çalıştı; her sınıfın soru metni, seçenekleri, anahtarı ve çizimleri yazarından farklı bir ajan tarafından yeniden incelendi. 6. sınıfın iki editoryal düzeltmesi ilk yazarı tarafından da tekrar okundu. Bu bir alan öğretmeni onayı değildir.

- [7/8 bağımsız inceleme ve görsel bulgular](SCIENCE_BOOKLET_INDEPENDENT_REVIEW_2026-10-04.md)
- [6. sınıf bağımsız inceleme ve son metin düzeltmeleri](SCIENCE_BOOKLET_GRADE6_INDEPENDENT_REVIEW_2026-10-04.md)

Son tarayıcı sınır kontrolü ayrıca YF6-18'in “Yol” etiketini SVG alt sınırında buldu. Yolun çizim yüksekliği kısaltıldı, etiket ortalanıp 143 tabanına alındı; yeni regresyon önce başarısız, sonra başarılı oldu. Gerçek 768 px görünümde etiketin altında 4,07 px boşluk yeniden ölçüldü. Böylece dışarı taşan etiket HTML'nin `overflow:visible` davranışıyla saklanmadı.

## Fiilen denenen öğrenci akışı

1. Üç sınıfın 18'er sorusu ayrı, temiz oturumlarda açıldı; hiçbirinde sınıf seçici veya editör metaverisi yok.
2. Son sayfalama ile 6. sınıf 5, 7/8. sınıf 6'şar sayfa: toplam 17 kitapçık sayfası gerçek tarayıcıda gezildi ve ekran görüntüleri alındı.
3. CSS görünümü **768×1024** olarak doğrulandı. Tüm 54 soruda dört şık, yatay taşmasız soru alanı; bütün sayfalarda `scrollWidth = 768`. Görsel etiket sınırındaki son bulgu yukarıdaki şekilde giderildi.
4. **390×844** telefon görünümünde tek sütun, 390 px sayfa genişliği, taşmayan dört soru ve okunur seçenekler görüntülendi. Bunlar tarayıcı boyut denemesidir; fiziksel tablet/telefon kurulumu iddia edilmez.
5. 7. sınıfta bir doğru, bir yanlış cevap seçildi; üçüncü soru “Sonra bak” olarak işaretlendi. Sayfa ileri/geri ve yeniden yüklemede iki cevap/işaret korundu.
6. Bitirmeden önce **16 boş** uyarısı görüldü. Bitirme sonrası **1 doğru / 1 yanlış / 16 boş**, kilitlenmiş seçenekler ve gerekçeli çözüm gözlendi. Çözüm: verilen/istenen → neden bu yol → adımlar → kontrol → kısa ipucu.
7. Bu akışın tarayıcı konsolunda hata yoktu. Son teslim için sentetik test oturumları sıfırlandı; üç giriş de **0/18** olarak yeniden açıldı. Geçici ekran ölçüsü değişiklikleri kaldırıldı.

Yerel görsel kanıtlar Git dışında `outputs/science-booklet-reset/` içindedir: `final-grade6-page1.png`, üç sınıfın `final-grade*-page*.png` dosyaları, `final-phone-grade6.png` ve `final-solution-flow.png`. Kullanıcı ekranı/ham kaynak/medya GitHub'a eklenmez.

## Teknik doğrulama

Son tüm-depo çalıştırması:

```sh
node --test test/*.test.mjs
```

**1.519 test: 1.517 geçti, 0 başarısız, 2 atlandı; 39,53 saniye.** Atlanan iki test isteğe bağlı gerçek FFmpeg/ses birleştirme senaryolarıdır (`K12_INK_REAL_MEDIA_TEST` açık değil). Bu çalışmada video üretimi doğrulanmış sayılmaz.

Yeni kritik regresyonlar: sınıf/program eşleşmesi, cevap anahtarının bitiş öncesi gönderilmemesi, oturumlar arasında yanıt ayrımı, bitiş sonrası cevap değişiminin reddi, yanlış sınıf sorusuna yazmanın reddi, çapraz kaynak isteği, dosya yolundan kaynak/env okunmasının engellenmesi, farklı portlarda cookie çakışması, değiştirilen başlangıç nesnesinin sunucuya etkisizliği, metin/şekil sınırları ve son sayfa iki sütun dengesi. `git diff --check` temiz.

## Clef ve fabrika sınırı

Yeni Clef ön-kontrolü yalnız yeni bankadan üç soru seçer; her biri için belirsizlik, cevap desteği ve **MEB tarzı görev/üslup uygunluğu** değerlendirmelerini hazırlar. Toplam üç hazırlanmış istek/dokuz danışma kararı. Kaynak sürümü ve içerik hash'i bağlanır.

**Canlı çağrı yapılmadı, ek ücret 0.** Bu oturumda Cloudflare anahtarı oluşturulmadı/okunmadı. Görsel açıklama metni hazırlanmıştır; bu ön-kontrol raster görüntü denetimi veya 450 soruluk çalışan canlı üretim hattı diye sunulmaz. Model kararı MEB onayı, LGS'de çıkma tahmini veya psikometrik ölçüm değildir.

## Çalıştırma ve sıradaki iş

```sh
npm run science:preview -- --all
# veya tek sabit sınıf
npm run science:preview -- 6
# yalnız güvenli stok özeti
node tools/science_booklet_preview.mjs --report
```

Sunucu yalnız `127.0.0.1` üzerinde çalışır; URL'leri başlangıçta yazdırır. Oturumlar bu süreçte bellektedir; süreç kapanınca kaybolur. Gerçek okul/öğrenci verisi, kurumsal giriş ve kalıcı SQL kaydı bu yeni kitapçığa henüz bağlanmadı. Ekrandaki süre yalnız çalışma sayacıdır; yenilemede sıfırlanır, resmî süreli LGS oturumu değildir.

Sıradaki dilim: Bu yeni örneklerin öğrenci/öğretmen kabulü → mikrobeceri/soru ailesi ve zorluk dağılımıyla eksik 396 soru → aynı görsel/cevap/üslup kapıları → mevcut yetkilendirme ve gerçek DB adapter'ına bağlama. Yeni stok için gerekçeli metin çözümleri var; bunların sesli video seri üretimi bu teslimde yapılmadı.
