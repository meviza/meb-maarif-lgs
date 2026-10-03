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
| Üretim | Özgün deterministik geometri pilotu; model üretimi ayrıca yapılandırılır | Üretici + bağımsız çözüm + görsel + Clef + alan/ölçme/dil-hak incelemesinden geçen ilk 100 |
| Konu anlatımı / çözüm | Pilot çözüm grafiği ve sahne/transkript | Yaş düzeyi onaylı ders paketleri; gerçek video/ses çıktısının kare ve altyazı denetimi |
| Türkçe öğretmen sesi | B+C korunuyor; ilk üç, Charon, Iapetus/Algieba ve Sulafat/Erinome kısa önizlemleri teknik doğrulandı; önceki örneklerde genel olumlu dinleme geri bildirimi var, tekil ses/ders seçimi ve yeni kadın örneklerinin kabulü bekliyor | Dinleme tercihi + hak/sayı/birim/karakter kabulü; [Türkçe isimli persona planı](TEACHER_PERSONA_PLAN_2026-10-03.md), sonra altı cue ve kelime–kalem ölçümü; [pilot kanıtı](TEACHER_VOICE_PILOT_EVIDENCE_2026-10-03.md) |
| İçerik Atölyesi | Yerel, salt-okunur inceleme prototipi | Kimlik/yetki ve kalıcı işlem kaydı; editör → uzman → yayıncı görev akışı |
| Okul backend'i | Mimari ve sözleşmeler; öğrenci verisi kapalı | Gerçek DB migrasyon/tenant izolasyonu/iş kotası/geri yükleme entegrasyon testleri |
| Analitik | Ölçülebilir öğrenme kanıtı tasarımı | Açıklanabilir beceri ölçümü ve psikometri; çocukları zekâ/meslek etiketleriyle sıralamama |
| Flutter | Bilinçli olarak sonraki mobil faz | SDK için depolama kararı; backend dikey dilimi; fiziksel Android/iOS telefon-tablet kanıtı |

Kaynak indirme ve içerik taslaklarının proje Drive klasörüne aktarımı kullanıcı tarafından yetkilendirildi. Öğrenci verisi veya kimlik bilgisinin Drive/model sağlayıcısına aktarımı bu kapsamda değildir. Canlı model çağrısında yapılandırılmış kimlik ve açık iş başına bütçe gerekir; yapılandırılmamış model başarılı sayılmaz.
