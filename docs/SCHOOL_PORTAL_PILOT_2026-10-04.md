# Okul Portalı Ve Notlu Kitapçık — Yerel Pilot

4 Ekim 2026. Kanonik dal: `codex/k12-foundation-audit`. Bu kayıt teknik yerel pilotu, içerik taslağını ve gerçek öğrenci kabulünü ayırır. Eski reddedilen yeşil 54 soru kullanılmaz. Gemini checkout'u değiştirilmedi.

## Kullanıcının Onayladığı Dağılım

| Sınıf | Soru | Bu katalogdaki ders payları |
| --- | ---: | --- |
| 1 | 10 | Matematik 4, Türkçe 3, Hayat Bilgisi 3 |
| 2 | 10 | Matematik 3, Türkçe 3, Hayat Bilgisi 2, İngilizce 2 |
| 3 | 15 | Matematik 4, Türkçe 4, Fen 3, Hayat Bilgisi 2, İngilizce 2 |
| 4 | 15 | Matematik 4, Türkçe 3, Fen 3, Sosyal 2, İngilizce 2, DKAB 1 |
| 5, 6, 7 — Her biri | 20 | Türkçe 4, Matematik 5, Fen 4, Sosyal 3, İngilizce 2, DKAB 2 |
| 8 | 90 | Türkçe 20, Matematik 20, Fen 20, Tarih 10, İngilizce 10, DKAB 10 |

Toplam **200 editöryal taslak**. Bunların 26'sı yeni beyaz bilim kitapçığından, 174'ü bu çok dersli katalog için yazılmıştır. Kaynak program sayısı veya kaynak soru adedi ürün sayısına eklenmez. Alt sınıf ders payları ürün seçimidir; MEB soru kotası değildir. Ön araştırmadaki öneri ile fiilî 1/3/4. sınıf payları farklıdır; kullanıcı sınıf toplamlarını onayladı, bu ders paylarına resmî onay verilmiş sayılmaz.

Her soruda verilen, istenen, çözüm yolu gerekçesi, adımlar, kontrol ve pratik ipucu bulunur. Cevap harfi döngüsü kararlı seçenek permütasyonuyla kırılır; doğru seçeneğin anlamı korunur. Yayın 0, uzman pedagojik kabul 0. İçerik büyük ölçüde temel/kısa alıştırma düzeyindedir; **orta–orta-zor LGS dengesi ve tam müfredat kapsamı henüz doğrulanmadı**. 450 Fen / 36.000 platform hedeflerinin tamamlandığı iddia edilmez.

## Uygulanan Dikey Akış

- Kimlik sunucu tarafında belirlenir. Öğrenci yalnız kendi sınıfını; veli yalnız bağlı çocuğunu; öğretmen atandığı sınıfı; müdür kendi okulunu görür. Süper yönetici okul/kota yönetir. Öğrencinin özel karalama/notu başka role açılmaz.
- Soru cevapları, bitirme, sonuçlar, soru metni sürümü ve notlar gerçek yerel SQLite dosyasına yazılır; yalnız tarayıcı belleği değildir. Bu, Postgres üretim işletimi veya gerçek okul verisi kanıtı değildir.
- Beyaz iki sütunlu kitapçık korunur; dar telefonda tek sütuna geçer. Öğrenci ekranında Bloom, JEV, kaynak/pipeline ölçütü veya sınıf seçici bulunmaz.
- Soruya bağlı yazılabilir yapışkan not; üç kalem rengi, çizim, geri alma, çizimi temizleme, kaydetme ve çakışan revizyon reddi. Soru metni/şekli not alınırken yan tarafta görünür. Notlar sınav bitince de düzenlenebilir.
- Bitince gerekçeli çözüm açılır. Formatif alt sınıf çalışmalarında yanlış doğruyu götürmez. 8. sınıf 90 soruluk dağılımda ham net `doğru − yanlış/3`; bu resmî LGS puanı değildir. İki oturumun 75/80 dakika zorlaması henüz yok.
- Tamamlanan cevaplardan ders/konu/soru ailesi ve soru bazında doğru–yanlış–boş; görüş sayısı ve ortalama puan. Farklı içerik sürümleri aynı soru kimliğiyle bile soru istatistiğinde karışmaz. 15 saniyelik yenileme polling'dir, gerçek zamanlı event altyapısı değildir.
- 5–8 öğrenci, 1–4 bağlı veli geri bildirim bırakabilir. Eleştirel/olumlu görüşe aynı katkı; tekrar gönderme puanı şişirmez. Katkı başarı/lig puanına eklenmez.
- Öğrenci kotası, aynı-okul sınıf değişikliği, sentetik okul/müdür oluşturma ve ilk parolayı değiştirme zorunluluğu. Excel'in dört hücre sütununu yapıştırma, önizleme, tümü-ya-da-hiç aktarım. **.xlsx dosya yükleme değildir.** Geçici parola bir kez teslim alanında görünür, genel listelere eklenmez.

## Demo Erişimi

Yerel adres: `http://127.0.0.1:64080/`. Başlatma: `npm run school:preview`. Sunucu sadece loopback dinler; internetten öğrenci erişimi yoktur. Veri `outputs/school-portal-pilot/demo.sqlite` içinde Git dışında tutulur.

| Rol | Sentetik hesap örneği |
| --- | --- |
| Süper yönetici | `demo.superadmin` |
| Müdür | `demo.mudur.a`, ikinci okul `demo.mudur.b` |
| Öğretmen | `demo.ogretmen.6a` — sınıf numarası 1–8 |
| Öğrenci | `demo.ogrenci.6.01` — sınıf 1–8, numara 01–10 |
| Veli | `demo.veli.6.01` — yalnız eşleşen öğrenci |

Tohum demo parolası `Demo2026!`; yalnız bu yerel sentetik hesaplar içindir. A okulunda 80 öğrenci ve 80 bağlı veli, 8 öğretmen; B okulunda ayrı izolasyon fixture'ları bulunur. Tarayıcı testinde eklenen `demo.qa.aktarma.01` ilave sentetik aktarım kaydıdır, 80 asıl pilot koltuğundan sayılmaz. Gerçek öğrencilere bu ortak demo parolası dağıtılmaz. Yeni aktarımın geçici parolası kaynak koda/rapora konulmaz.

## Güvenlik Ve DAMA Sınırı

Cookie HttpOnly/SameSite; aynı-origin/host kontrolü, parola hash'i, sunucu rol kapsamı, not sahipliği, değiştirilemez soru/attempt sürümü, oturum iptali, kota ve atomik aktarım negatif testleri vardır. Gerçek kişisel veri kabulü kapalı; adların `Demo`, hesapların `demo.` olması beklenir. Bu metin kontrolü kimliksizleştirme garantisi değildir; yalnız sentetik kullanın.

Veri sahibi/amacı/kapsamı/versiyonu ayrılır. Yedek–geri yükleme, saklama/silme, okul sözleşmesi, KVKK erişim değerlendirmesi, üretim TLS, gerçek hesap yaşam döngüsü/MFA/kurtarma ve olay yönetimi sonraki kapılardır. SQLite prototipi çok kiracılı üretim sertifikası değildir. TDD + bağımsız inceleme + faz kanıtı CMMI/SPICE hazırlığına katkıdır; herhangi bir olgunluk derecesi/sertifika iddia edilmez.

## Sonraki Kabul Dilimi

1. Soru kalitesini yükseltme: temel taslağı istenen orta–orta-zor dengeye dönüştürme; gerçek MEB çıktı/sayfa bağı, ders öğretmeni incelemesi, çeldirici ve görsel kontrolü. Sayı doldurmak için aynı kalıbı çoğaltma yok.
2. 1–4 yaş uyarlaması: sadece yetişkin etiketi yeterli değil. Oyun/açık yanıt/gözlem biçimi, 1–2 görsel ve sesli yönerge; okul kullanım biçiminin [resmî ölçme çerçevesi](SCHOOL_PILOT_MEB_BLUEPRINT_2026-10-04.md) ile değerlendirilmesi. Mevcut çoktan seçmeli fixture çocuklara hazır sınav ilan edilmez.
3. Okul yönetimi: .xlsx dosya doğrulama/önizleme, öğretmen ve rehberlik eşleştirme UI'si, dönem geçişi; mevcut şube değişikliğinde öğretmen ataması ayrıca gözden geçirilir. Sadece öğrenci sayısı kotası uygulanıyor; GB/CPU/faturalama değil.
4. Gerçek pilot: ayrı staging, benzersiz davet, yetki/veli bağı doğrulaması, gizlilik/saklama planı, yedek–geri yükleme ve hedef cihaz incelemesi. 40+40 gerçek çocuk henüz sisteme alınmadı.
5. Mobil arkadaşlık/20 hızlı soru/lig: ayrı tasarım ve güvenlik dilimi. İzinli kapalı okul çevresi; açık sohbet, herkese açık isimli sıralama ve süre/puan baskısı varsayılan olmaz. Henüz uygulanmadı.

Canlı Clef/JEV, TTS/video, Docker işi, Drive aktarımı, yeni credential veya ücretli çağrı bu dilimde yapılmadı. Mevcut video/fabrika durumu bu portal ile kendiliğinden tamamlanmış olmaz.

## Bağımsız İçerik Ve Regresyon Kanıtları

- [110 alt sınıf sorusu](SCHOOL_PILOT_LOWER_GRADES_REVIEW_2026-10-04.md): el ile çözümler, şekil koşulu/alt metin ve çıkarma terimi düzeltmeleri.
- [42 sekizinci sınıf çekirdek sorusu](SCHOOL_PILOT_GRADE8_CORE_REVIEW_2026-10-04.md): kapsam, geometri ve anlatım düzeltmeleri; zorluk sınırı.
- [30 sözel soru](SCHOOL_PORTAL_GRADE8_VERBAL_INDEPENDENT_REVIEW_2026-10-04.md): İngilizce saat koşulu düzeltildi; kolay–orta düzey ve zayıf çeldirici sınırı kaydedildi.
- [Portal bağımsız incelemesi](SCHOOL_PORTAL_INDEPENDENT_REVIEW_2026-10-04.md): katalogdan kaldırma ve değişmez sürüm RED→GREEN.
- [Oturum güvenliği](SCHOOL_PORTAL_SESSION_SECURITY_REVIEW_2026-10-04.md): gecikmiş yanıt/hesap değişimi, bitirme yarışı ve sunucu açılışı hata temizliği.
- Son taze test/screenshot/SQL kanıtları bu raporun kapanış ekine yazılır; önceki test sayısı yeni faz kanıtı yerine kullanılmaz.

## Root Kabul Kontrolü

Üç bağımsız ajanla paralel inceleme yapıldı. Root, P1-04'te dört eşit kenar ve defter köşesi gibi dik köşe koşulunun kareyi belirlediğini; alternatif metnin cevabı adlandırmadığını yeniden okudu. P2-02'de 40 başlangıç, 17 kalan, 23 çıkan doğru; konu adı artık çıkanı bulma. P8-EN08'de 9.15 bulaşık görevi 9.30 öncesi, 10.30 köpek gezdirme 10.00 sonrası koşulunu sağlar; sadece görev sırası değil iki saat de açık. Bunlar editöryal ikinci göz kontrolüdür, branş öğretmeni kabulü değil.

Tarayıcıda gerçekten yapılanlar:

- 6.01 öğrencisi bir doğru, bir yanlış bıraktı; 18 boşla bitirdi. Sonuç 1/1/18. Açılan çözüm verilen–istenen–gerekçe–kontrol içerdi. Bitince cevap değişimi kapalı.
- Bir soru için 2/5 eleştirel görüş gönderildi; tek katkı puanı göründü. Aynı öğrenci velisi 1/1/18 ve tek bağlı çocuğu gördü. Başka veli 6.02 sıfır sonuç ve yalnız kendi çocuğunu gördü. 6A öğretmeni 10 öğrenciyi ve bir bitmiş çalışmayı gördü.
- Müdürün 80 öğrencisi ve 100 kotası vardı. Bir temsili satır önizlenip aktarıldı; 81 öğrenci oldu. Tek seferlik geçici parola alanı oluştu ve teslim alanı kapatılınca DOM'dan kalktı. Parola rapor veya screenshot'a alınmadı.
- Not yazıldı, fareyle gerçek çizgi çizildi, kaydedildi. Uygulama sunucusu durdurulup tekrar başlatıldı; aynı öğrencide biten çalışma, not ve çizgi korundu. Revizyon not sahipliği testleri ayrıca çalıştı.
- İki sekmeli oturum kapanışında açık özel notun giriş ekranında kalması önce gözlendi, düzeltme sonrası not DOM uzunluğu 0 / açık dialog 0 görüldü. Başarılı ama gecikmiş farklı-oturum yanıtı, saf deferred-response negatif testleriyle ayrıca engellendi. Anında sekmeler arası logout bildirimi henüz yok.
- Sekiz sınıfın **200 sorusu, 54 sayfa** boyunca uygulamanın gerçek ileri sayfa/giriş kontrolleriyle gezildi. Sayfa adetleri 3/3/4/4/5/5/6/24; yatay taşma 0, yüklenmeyen şekil 0. Bu DOM/bounds kontrolü her şeklin bilimsel kalite onayı değildir.
- 390×844 telefon emülasyonunda tek sütun, 16px soru metni, document width 390; 768×1024 tablet emülasyonunda iki sütun, 13px soru metni, document width 768. Görsel olarak incelendi. Genel form CSS'sinin şık harflerini örtmesi gözle yakalandı; radio arka planı transparan yapıldı ve A/B/C/D tekrar görünür doğrulandı. Fiziksel telefon, dokunmatik kalem veya ekran okuyucu cihaz testi yapılmadı.

Yerel kanıt PNG'leri `outputs/school-portal-pilot/{note,phone,tablet}-proof.png`; Git dışında. Root test günlüğü aynı dizinde. Not kanıtı gerçek içerik/kalıcılık gösterir, güzel görünüm adına gerçek çocuk verisi veya uydurma sonuç yoktur.

### Taze Test Ve SQL Özeti

- Odaklı `node --test test/school_portal*.test.mjs`: **73/73 geçti**, 19.998 s; fail/skip/cancel/todo 0.
- Tüm depo `node --test test/*.test.mjs`: **1592 test; 1590 geçti, 0 hata, 2 isteğe bağlı medya testi atlandı**, 48.873 s, exit 0.
- Atlanan iki medya testi mevcut güvenilen Sharp ve yerel FFmpeg ile ayrıca açıldı: **2/2 geçti**, 16.526 s; indirme, ücret, üretici/TTS çağrısı yok. Teknik sentetik PCM testi yeni ders videosu sayılmaz. Bu iki ayrı koşu tek bir 1592/1592 koşusu gibi raporlanmaz.
- Kalıcı dosyaya salt-okunur SQL: 1 bitmiş / 9 açık sentetik çalışma; biten çalışma `correct:1, wrong:1, blank:18, total:20`; 2 not kaydı / toplam 1 çizim; 1 geri bildirim / 2 puan. Sayfa gezisi açık çalışmaları oluşturur, başarı/bitirme adedine katmaz.
- Sözdizimi ve `git diff --check` temiz. Test adedi öğrenci deneyimi, uzman kabulü veya psikometrik geçerlik yerine geçmez.
