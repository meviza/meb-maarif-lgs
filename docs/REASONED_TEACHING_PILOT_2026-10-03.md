# Gerekçeli problem çözme — yerel editör pilotu

Tarih: 2026-10-03. Durum: **yeni metin + etkileşimli kalem önizlemesi**. Yeni ses veya MP4 üretilmedi. Öğrenci yayını, uzman kabulü ve öğrenme etkisi ölçümü yoktur.

## Kullanıcının yakaladığı eksik

Önceki sesli klip hesapları doğru gösterse de `18 ÷ 2 × 3 = 27` işleminin sorudan nasıl çıkarıldığını yeterince öğretmiyordu. Doğru sonuç ve başarılı codec/decode testi, gerekçeli öğretim kabulü değildir. Yeni taslak yalnız sonuca değil, soruyu okuma ve yol seçmeye odaklanır.

Yeni sıra: **istenen → verilenlerin anlamı → plan ve nedeni → gerekçeli işlem → ara sonucun anlamı → koşul/birim kontrolü → eşdeğer pratik yol**. Her uzun çözümün 30–35 saniyeye sığdırılması zorunlu değildir; kısa sınav özeti tam öğretici açıklamanın yerine geçmez.

## Özgün bahçe örneği

İstenen: kapı boşluğu her iki sırada açık bırakılarak gereken toplam tel uzunluğu; birim metre. Alan hesabı değildir. Bu örneğin dış sınır modeli çevre hesabını gerektirir; yalnız “tel” sözcüğünü görerek her problemde çevre formülü seçmek öğretilmez.

| Kaynak / ilişki | İşlemden önceki anlam | Hesap ve ara sonucun anlamı |
| --- | --- | --- |
| Kısa kenar 18 m; uzun kenar bunun 3/2 katı | Kısa kenar iki eş parça, uzun kenar aynı büyüklükte üç parça | `18 ÷ 2 = 9 m`: bir eş parça; `9 × 3 = 27 m`: uzun kenar |
| Dikdörtgenin iki kısa ve iki uzun kenarı | Bir kısa–uzun kenar çiftini iki kez sayarız | `2 × (18 + 27) = 90 m`: bir tam turun çevresi |
| Her sırada 4 m kapı açıklığı | Tam çevreden tel çekilmeyen bir açıklığı çıkarırız | `90 − 4 = 86 m`: kapı hariç bir sıra |
| İki sıra tel | Kapısı çıkarılmış aynı güzergâh iki kez uygulanır | `86 × 2 = 172 m`: iki sıra toplam tel |

**Üç farklı 2:** kesrin paydası eş parça sayısıdır; çevre formülündeki 2 kenar çiftlerini sayar; son çarpımdaki 2 tel sırası sayısıdır. Aynı rakamın görünmesi aynı veri rolü anlamına gelmez. İşlem girdileri sorudaki veri, şekil özelliği veya önceki sonuç olarak ayrı kaynak kimlikleri taşır.

Pratik eşdeğer yol: `2 × 90 − 2 × 4 = 180 − 8 = 172 m`. Her sırada aynı kapı boşluğu bırakılması koşuluna bağlıdır. `180 − 4`, yalnız bir sıranın açıklığını çıkarır; bu soruda yanlıştır. Pratik yol, şartını açıklayamadığımız bir ezber olarak sunulmaz.

## Çalışan yerel teslim

- `packages/media/garden_reasoning.mjs`: değişmez, kaynak-hash bağlı dokuz aşamalı açıklama; verilen/hedef/işlem gerekçesi/önceki sonuç/ara hesap/kontrol/alternatif ayrımı.
- `apps/teaching-review/reasoned_player.mjs`: gerekçe önce; işlem sonucu kullanıcı açınca görünür; geri/baştan sonucu kapatır ve devam eden kalem animasyonunu iptal eder. Hareket azaltma aynı metni ve tamamlanmış işlem karesini korur.
- `tools/build_reasoned_teaching_preview.mjs`: yalnız yeni mutlak çıktı klasöründe altı özel inceleme dosyası üretir. Var olan klasör, noktalı yol ve symlink hedef reddedilir. Klasör 0700, dosyalar 0600; HTML yalnız aynı-kaynak betik/veri ve yerel SVG görüntüsüne izin verir; ses/video/iframe yoktur.
- Metindeki ilgili kaynak ifadeleri vurgulanır. Kesrin pay ve paydası aynı ifadeyi birlikte vurgular; ayrı 3/2 glif vurgusu henüz yoktur. Kalem geometrisi eski deterministik renderer'dan alınır; eski kısa seslendirme/metin yeni gerekçe gibi oynatılmaz.

Bu **tek soru için editör prototipidir**. Dokuz aşama bütün soru ailelerinde hazır değildir. Sonuç açma düğmesi düşünmenin gerçekleştiğini kanıtlamaz; puanlanan öğrenci yanıtı veya gerçek oturum kaydı yoktur. Bütün yanıt varyantları editör paketindedir: görsel kapı, sunucu yetkilendirmesi ya da sınav cevap koruması değildir. Dosya hashleri üretimde kaydedilir; tarayıcı manifest hashlerini çalışma anında doğrulamaz.

## Sürüm ve DAMA izlenebilirliği

Yeni açıklama ayrı türevdir; kaynak soru ve eski kalem planı değiştirilmedi:

- Soru SHA-256: `a5dde54c513fcca9ae4fbcf39917ccb37a761e3fca688ba3f2a1b3cc39cc77d4`.
- Kaynak kalem planı SHA-256: `309a08895704329e9db15782fe1fdf56a449421c21019bfaaa02c8344fdc6e6b`.
- Açıklama içeriğinin kendi SHA-256'sı ve her çıktı dosyasının byte/hash kaydı yeni pakettedir.
- Durum: `draft`; `publicationReady=false`; `expertReview=pending`; `mediaStatus=new_narration_not_generated`; `learnerEvidence=none_collected`.
- Kaynak, amaç ve kalite durumu ayrıştırıldı. Üretim sahibi/steward, ticari hak kabulü, saklama/geri çekme ve denetim kaydı mevcut yayın/varlık sözleşmelerine bağlanmadan öğrenci teslimi yapılamaz. Bu pilot tam DAMA uygulaması veya sertifikasyon değildir.

Ham ses/video, hesap/credential ekranları, yerel yollar ve tarayıcı kanıt görüntüsü kamu Git deposuna alınmadı. Bu koşuda dış model/TTS isteği, öğrenci verisi, yeni credential veya SDK/skill kurulumu yoktur.

## Yeni doğrulama kanıtı

1. Veri sözleşmesi için 11 test: ilk üç aşamada açıklanmamış sonuç yok; veri rolleri ayrı; 9 m ara sonuç anlamıyla bağlı; dört hesap gerekçesi var; kontrol yanıtı ayrı; alternatif iki açıklığı çıkarıyor; sürüm hashleri, sahte/bozuk girdiler, getter/proxy sınırları.
2. Gerçek CLI ve tarayıcının kullandığı denetleyici için 9 test: altı dosya/izin/hash; sonuç açma ve sonraki adım kapısı; geri/baştan; eski ses metninin kaldırılması; yanlış aşama/eylem; son kontrol ve bitiş; hareket azaltma; ayrı 9/27 sunumu; güvenli çıktı yolu.
3. TDD: eksik API/CLI/denetleyici testleri önce RED; 9→27 ara hesap ve sunumu ayrıca RED gözlendi; uygulama sonrası GREEN. Bağımsız dar koşu, mevcut kalem testleriyle **33/33** geçti.
4. Tüm mevcut suite, gerçek medya opt-in'i ve güvenilir yerel Sharp ile **527/527 geçti; 0 başarısız, 0 atlanan**. Önceki 507 test sayısı tarihsel kayıttır.
5. Gerçek yerel tarayıcıda: hedef/veri/plan sırası; ilk işlemden önce sonuç ve ara hesap gizli/sonraki kapalı; açınca 9 m ve 27 m anlamları; animasyon sırasında geri/baştan iptali; hareket azaltma; 90→86→172 anlamları; kontrol yanıtı önce kapalı; alternatif `180−8`; bitişte ilerleme kapalı; console hata/uyarı yok.
6. Varsayılan 843 CSS px ve denemede gerçekleşen 582 CSS px genişlikte yatay taşma görülmedi. 390 px override istendi ancak araç 582 px bildirdi: **390 px telefon testi geçmiş sayılmaz**. Override geri alındı. Bu masaüstü tarayıcı kanıtı fiziksel telefon/tablet veya tam erişilebilirlik kabulü değildir.

## Sonraki kabul kapısı

Alan öğretmeni hedef/veri/strateji/ara anlam/kontrol metnini onaylar. Sonra bu **yeni** metinden yeni ses cue'ları, altyazı ve kalem zamanlaması üretilir; eski altı-cue sesi üzerine yeni gerekçe etiketi konmaz. Kesin okunacak metin ile ton/hitap yönergesi ayrı tutulur; yeni sayılar veya yöntem TTS'ye serbestçe yazdırılmaz.

Videoda veri vurgusu → neden açıklaması → gerçek düşünme fırsatı → işlem → sonuç işareti/anlamı → kontrol sırası ölçülür. Özellikle `18`, kesirdeki `2/3`, iki kenar çifti, bir sıra ve iki sıra ifadeleri ses–nesne ID eşleşmesiyle incelenir. Yeni ses/MP4, telaffuz, kelime–kalem ve bağımsız öğretmen dinleme kabulü olmadan bu pilotun tamamlanmış video revizyonu olduğu söylenmez.

Öğrenme ve sınav pratiği iki sunum modu olarak tasarlanır: açıklama/düşünme molaları ve gerekirse ek temsil; aynı doğrulanmış gerekçenin kısa özeti. Süre kazanımı veya başka soruya transfer henüz ölçülmedi. Farklı sayılar/koşullar içeren yeni görevle yöntemi açıklama ve kapı sayısını doğru takip etme, izinli öğretmen/öğrenci pilotunda ayrıca değerlendirilir; tek cevaptan zekâ/kişilik/meslek etiketi çıkarılmaz.
