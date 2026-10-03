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

## Sonraki uygulama adımı

Faz 1 ve 2 birlikte başlatılır: mevcut 5–8 şemasından bağımsız, 1–8 için sürümlü program kayıt modeli ve içerik varlığı sözleşmesi hazırlanır. İlk üretim kodu, önce başarısız bir testle tanımlanan bu sözleşmeyi doğrulamakla başlar; canlı model, Drive veya öğrenci verisi bağlantısı kurulmaz.
