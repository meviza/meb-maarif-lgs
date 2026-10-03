# Teslim Yol Haritası — Kontrollü K-12 Genişleme

Bu yol haritası tarihe bağlı satış veya yayın taahhüdü değildir. Her faz, aşağıdaki kabul kanıtları olmadan sonraki faza geçmez.

| Faz | Hedef | Bitti sayılması için |
| --- | --- | --- |
| 0 — Gerçeklik kaydı | Mevcut prototipi ve iddiaları ayırmak | Baseline, kaynak/hak politikası, ayrı worktree ve kalite kapıları kaydedildi |
| 1 — Kanonik müfredat | 1–8 program kayıtlarının sürümlü modeli | `curriculum_registry`, yıllık takvim, ders/tema/çıktı haritası ve kaynak denetimi |
| 2 — İçerik sözleşmesi | Soru/etkinlik/görsel/rubrik şeması | TDD ile doğrulanan sözleşme, hak kaydı ve örnek blueprint |
| 3 — Tasarım sistemi | Tek platform hissi ve çocuk/kurum dengesi | Üç özgün görsel yön, kullanıcı senaryosu, token/bileşen sistemi, erişilebilirlik planı |
| 4 — İlk dikey dilim | Tek sınıf–ders–tema uçtan uca | Öğrenci, öğretmen ve veli akışı; insan onaylı içerik; cihaz/erişilebilirlik testi |
| 5 — İçerik fabrikası pilotu | Güvenli ölçeklenebilir üretim | Jeneratör + deterministik test + Jev/Clef karar pilotu + uzman inceleme + küçük psikometri |
| 6 — 1–4 genişlemesi | Görsel/işitsel ve erken okuryazarlık desteği | Yaş düzeyi testi, alternatifler, sınıf bazlı kapsam ve öğretmen pilotu |
| 7 — 5–8/LGS | Ortaokul kapsamı ve yıllık LGS sürümü | Güncel program/kılavuz sürümü, açık uçlu + çoktan seçmeli denge, LGS format doğrulaması |
| 8 — Okul rolleri ve analitik | Öğretmen/veli/idare deneyimleri | Rol/yetki, KVKK tasarımı, açıklanabilir öneri ve denetim kayıtları |
| 9 — Mobil ve okul pilotu | iOS/Android ve gerçek okul bağlamı | Fiziksel cihaz, düşük ağ, bildirim, geri yükleme, destek ve pilot kanıtı |
| 10 — Bölgesel genişleme | Türkiye dışı yerelleştirme | Ayrı müfredat/hak/mahremiyet modeli; Türkçe içeriği kopyalamadan ülke bazlı süreç |

## Önceliklendirme kuralları

1. Bir öğrenci veya öğretmenin gerçek akışını doğrulamayan gösterişli dashboard, içerik doğruluğunun önüne geçmez.
2. Birkaç doğrulanmış içerik, binlerce taslak içerikten değerlidir.
3. 4 ve 8. sınıf için güncel program/uygulama kapsamı her akademik yıl tekrar doğrulanır.
4. LGS deneme modu yalnızca ilgili yılın resmî kılavuzuna sürümlü olarak bağlanır. 2026 formatı iki oturumda 90 çoktan seçmeli soruydu; bunu gelecek yıllar için sabit varsaymayız. [2026 MEB LGS kılavuzu](https://www.meb.gov.tr/meb_iys_dosyalar/2026_03/23190605_LGS_BaYvuru_ve_Uygulama_Kilavuzu_2026.pdf)
5. Harici skill, model ağırlığı veya eklenti; kaynak/sürüm, lisans, gizlilik ve güvenlik kapısı geçmeden kurulmaz.

## 3 Ekim 2026 yeniden bazlama

İlk sözleşmeler, kaynak/program kayıt modeli, yayın/varlık ve senkronizasyon kapıları artık kodda bulunuyor. Bunlar çalışan çok-kiracılı backend, gerçek PostgreSQL entegrasyonu veya uzman onaylı içerik değildir. Sadece sözleşme zincirini büyütmek yerine, kaynak arşivi + üretim pilotu + gözle görülen inceleme akışı birlikte ilerletilir.

Güncel ayrıntılı plan: [PLATFORM_REBASE_PLAN_2026-10-03.md](PLATFORM_REBASE_PLAN_2026-10-03.md). Kanıtlar: kaynak arşivi raporu, içerik fabrikası pilot raporu, manifesto denetimi ve oturum teslim raporu.

| İş paketi | Mevcut aşama | Bir sonraki kabul kapısı |
| --- | --- | --- |
| Resmî kaynaklar | Sınırlı referans arşivi ve hash'li kayıt | Tüm sınıf/ders/program kapsamı; PDF sayfa/öğrenme çıktısı ayrıştırması ve alan uzmanı eşlemesi |
| 36.000 soru hedefi | Aşağıdan yukarıya kapsam bütçesi; henüz tamamlanmış banka yok | Mikrobeceri hücreleri toplamı 36.000; eksik ders ve kazanım sıfır; her hücrede gerçek çeşitlilik |
| Üretim | Özgün bahçe sorusu ortak kalem/çözüm kaynağına bağlı; tek görselli Clef hazırlığı ve negatif güvenlik testleri var; canlı Clef token alanı boş, dış istek 0; üretici LLM çağrılmadı | Yeni tokenla tek danışma çağrısı; sonra üretici + bağımsız çözüm + görsel + alan/ölçme/dil-hak incelemesinden geçen ilk 100 |
| Konu anlatımı / çözüm | Gerçek 36,375 s sesli kalem MP4 ve ayrı çevre–alan dersi; 47,76 s ders sesi, iki özgün şekil ve iki kontrol sorusu; kısmi müfredat adayları | Uzman/yaş düzeyi, tam konuşma-sayı-birim ve kelime–kalem ölçümü; mini ders animasyon videosu henüz yok |
| Gerekçeli öğretim revizyonu | Aynı bahçe sorusunda dokuz aşamalı yeni metin/kalem editör önizlemesi: hedef → veri → yol → ara sonuç/anlam → kontrol → eşdeğer pratik yol; 9 m ve 27 m ayrı; eski ses değiştirilmedi | Yeni metnin alan/dil kabulü → yeni ses cue'ları/altyazı/MP4 → kelime–kalem ve dinleyici ölçümü; [gerekçeli pilot kanıtı](REASONED_TEACHING_PILOT_2026-10-03.md) |
| Gerekçeli fabrika bağlantısı | Ortak trace + altı dikdörtgen ailesi/sabit bahçe adaptörü + ayrı kavram dersi normal CLI'ye bağlı; taze 100 adaydan 12 taslak, 88 çeşitlilik reddi, 0 yayın | Tüm dersler için alan adaptörü, gerçek kaynak resolver, yaş/kazanım/transfer kabulü ve yeni ses/video otomasyonu; [güncel durum](REASONED_FACTORY_STATUS_2026-10-03.md) |
| Türkçe öğretmen sesi | B+C korunuyor; ilk altı-cue Charon çözümü ve ayrı Sulafat mini ders sesi teknik doğrulandı; önceki seslere genel olumlu geri bildirim var, bu yeni pilotun dinleme kabulü bekliyor; ses üretimi tarayıcıdan yarı otomatik | Dinleme tercihi + hak/sayı/birim/karakter kabulü; [persona planı](TEACHER_PERSONA_PLAN_2026-10-03.md), kelime–kalem ölçümü ve ayrı API TTS otomasyonu; [uçtan uca pilot kanıtı](TEACHING_FACTORY_E2E_PILOT_2026-10-03.md) |
| İçerik Atölyesi | Yerel, salt-okunur inceleme prototipi | Kimlik/yetki ve kalıcı işlem kaydı; editör → uzman → yayıncı görev akışı |
| Okul backend'i | Mimari ve sözleşmeler; öğrenci verisi kapalı | Gerçek DB migrasyon/tenant izolasyonu/iş kotası/geri yükleme entegrasyon testleri |
| Analitik | Ölçülebilir öğrenme kanıtı tasarımı | Açıklanabilir beceri ölçümü ve psikometri; çocukları zekâ/meslek etiketleriyle sıralamama |
| Flutter | Bilinçli olarak sonraki mobil faz | SDK için depolama kararı; backend dikey dilimi; fiziksel Android/iOS telefon-tablet kanıtı |

Kaynak indirme ve içerik taslaklarının proje Drive klasörüne aktarımı kullanıcı tarafından yetkilendirildi. Öğrenci verisi veya kimlik bilgisinin Drive/model sağlayıcısına aktarımı bu kapsamda değildir. Canlı model çağrısında yapılandırılmış kimlik ve açık iş başına bütçe gerekir; yapılandırılmamış model başarılı sayılmaz.

Önceki yerel pilot: [sesli kalem çözümü + ayrı mini ders raporu](TEACHING_FACTORY_E2E_PILOT_2026-10-03.md). Önceki ek teslim: [gerekçeli metin/kalem önizlemesi](REASONED_TEACHING_PILOT_2026-10-03.md). Son teslim: [gerekçeli fabrika bağlantısı ve konu bazlı durum kaydı](REASONED_FACTORY_STATUS_2026-10-03.md); yeni ses veya MP4 değildir. Ham hesap ekranları, sesler/video, yerel tarayıcı görüntüsü ve yerel yol içeren manifestler kamu GitHub deposuna alınmadı. Güncel teknik test kapısı: gerçek medya opt-in'i ve güvenilir Sharp ile 561/561, 0 skip; bu pedagojik kabul veya üretim yayını değildir.

Bir sonraki paralel işler: aktif müfredat/kapsam hücreleri; yeni gerekçeli ses–kalem pilotu; gerçek sentetik PostgreSQL/tenant dikey dilimi. Ardından kalıcı öğrenci defteri/öğretmen/veli analitik akışı ve bütçeli worker kabulü. Sadece yeni sözleşmeler eklemek gerçek DB, otomatik medya veya 36.000 soruluk kapsam yerine geçmez.

## 3 Ekim gece ek ilerlemesi

[Gece kanıt kaydı](OVERNIGHT_PROGRESS_2026-10-03.md): normal fabrika çıktısına kaynak-bağlı medya işi/ses isteği hazırlığı eklendi; yeni ses/video hâlâ yok. Gerçek, izole PostgreSQL 16 üzerinde iki sentetik okul için 22 davranış tanığı ana ajan tarafından yeniden doğrulandı; HTTP auth/resolver/üretim driver'ı değildir. Güncel tam test **586/586, 0 fail, 0 skip**; SQL opt-in deneyi ayrıca çalıştırıldı. Önceki 561 ve DB yok ifadeleri yukarıdaki tarihsel teslimi anlatır.

[5. sınıf matematik kapsam taslağı](GRADE5_MATH_COVERAGE_DRAFT_2026-10-03.md) sayı/konu/alt beceri ayrımını ve mevcut çevre–alan pilotunun eksiklerini kaynak sayfalarıyla kaydeder; tam 1–8 eşlemesi veya uzman kabulü değildir. Sıradaki çalışma; eksik gerçek soru aileleri, kaynak geometri + genel medya renderer, uygulama DB adapter'ı ve gerçek kayda bağlı defter/analitik akışıdır. Yeni sözleşmelerin sayısı ilerleme metriği yapılmaz. Gece devamı ve 4 Ekim 08:00 Türkiye saati raporu planlandı; dış hizmet/insan/yayın kapıları değişmedi.
