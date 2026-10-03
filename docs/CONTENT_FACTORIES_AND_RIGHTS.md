# İçerik Fabrikası, Haklar ve AI Denetim Mimarisi

## 1. Kanonik kaynak politikası

MEB/TYMM program sayfaları, ilgili sınıf–ders–tema–öğrenme çıktısı için kanonik başvuru kaynağıdır. 2026–2027’de yeni model uygulama kapsamı 1–3 ve 5–7. sınıflardır; 4 ve 8 için aynı etiket varsayılmaz. Her kayıtta `academic_year`, `program_version`, `decision_reference`, `retrieved_at` ve `source_url` tutulur. [TYMM program tarayıcısı](https://tymm.meb.gov.tr/ogretim-programlari) · [2026–27 uygulama duyurusu](https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316)

MEB/ÖDSGM soru, kitap, PDF ve görsellerinin kamuya erişilebilir olması açık lisanslı olduğu anlamına gelmez. Bunlar başlangıçta yalnızca `reference_only` olarak envantere girer. Yeniden barındırma, türev eser, ticari kullanım veya model eğitimi için yazılı hak sahibi izni ve kullanım kapsamı olmadan üretim veri setine alınmaz. [ÖDSGM telif notu](https://odsgm.meb.gov.tr/meb_iys_dosyalar/2017_09/15122514_ink_tar_acik_uclu.pdf) · [TTKB e-içerik kriterleri](https://ttkb.meb.gov.tr/kriter/)

## 2. Zorunlu kayıtlar

Üç ayrı kayıt tutulur; bunlar tek bir serbest metin belgesiyle karıştırılmaz:

| Kayıt | Amaç | Asgari alanlar |
| --- | --- | --- |
| `curriculum_registry` | Programın sürümlü kanıtı | program, karar, yıl, sınıf, ders, tema, öğrenme çıktısı, süreç bileşeni, öğrenme kanıtı, farklılaştırma |
| `content_rights_registry` | Kaynak/hak denetimi | kaynak URL, hak sahibi, lisans/izin, kullanım alanı, süre, atıf, yeniden kullanım yasağı, inceleyen kişi |
| `item_blueprint_registry` | Dengeli üretim planı | öğrenme çıktısı, mikro beceri, item tipi, zorluk hedefi, görsel/işitsel gereksinim, çeldirici/hata hipotezi, kota, yayın durumu |

Soru sayısı hedefi ancak bu kayıtlardan türetilir. “Bir derse 1.000 soru” hedefi, her mikro konuya rastgele dağıtılmış sayı değil; farklı bilişsel düzey, soru tipi, hata örüntüsü ve tekrar aralığını içeren onaylı blueprint sonucu olmalıdır.

İlk uygulama çekirdeği olan [`question_coverage_blueprint.mjs`](../packages/contracts/question_coverage_blueprint.mjs), `item_blueprint_registry` için kapalı ve değişmez bir planlama sözleşmesidir. Her revizyon; program/sınıf/ders kapsamındaki kanonik öğrenme çıktısı anlık görüntüsü özeti, owner/steward/amaç/saklama/erişim politikası, insan onayı ve 1–36 arası her öğretim haftasının hücrelerini bağlar. Hücre; kazanım, mikro beceri, madde/yanıt tipi, bilişsel süreç, zorluk, kota, gerekli varyant, hata hipotezi ve görsel/işitsel erişilebilirlik-hak referanslarını taşır. İnsan onayı, onay zarfı ve yaşam döngüsünden ayrı hesaplanan değişmez blueprint tanım özetini hedefler; böylece plan değiştiğinde eski onay yeniden kullanılamaz. Buradaki 36 hafta **planlama görünümüdür**; resmî okul takvimi ya da MEB onayı iddiası değildir ve ilgili takvim/program sürümünün ayrı kanonik kaynaktan çözülmesi gerekir.

Kapsam denetimi yalnız insan-onaylı blueprint ile, tam kapsam için sağlanan kanonik müfredat anlık görüntüsünün hash'i ve madde düzeyi metaveri eşleştiğinde `coverage_evaluated` sonucu üretir. Madde metaverisi; değişmez içerik öğesi, revizyon ve revizyon/varlık-seti özetlerine ek olarak aynı mikro beceri, madde/yanıt tipi, bilişsel süreç ve zorluk hedefini taşır; aynı revizyon veya hash farklı takma kimliklerle tekrar sayılmaz. Eksik kota, eksik varyant, planlanmamış kanonik kazanım veya kritik görsel/işitsel erişilebilirlik-hak kanıtı eksikliği görünür kalır. Bu saf sözleşme soru üretmez, soru metni/cevap anahtarı/öğrenci verisi taşımaz, içerik yayımlamaz ve kaynağın otoritesini kanıtlamaz; gerçek çözümleyici ileride tam ve yetkili snapshot'ı, aktif onay/geri çekme geçmişini ve gerçek içerik kimliği–hash bağını sunucu tarafında çözmelidir.

[`server_resolved_question_coverage_review_readiness.mjs`](../packages/contracts/server_resolved_question_coverage_review_readiness.mjs), sonraki sunucu çözümleyicisi için bu planlama kanıtı ile insan inceleme kanıtını birleştiren saf ara kapıdır. Çağıranın gönderdiği önden hesaplanmış kapsam raporuna güvenmez; blueprint/kapsamı yeniden değerlendirir, her kapsama maddesi için tam içerik öğesi–revizyon–revizyon özeti–varlık seti **ve bağımsız içerik yazarı** kimliğine sahip tek yaşam döngüsü snapshot'ı ister. `approved` maddelerde dört bağımsız insan incelemesinin aynı değişmez revizyonu ve yazarı hedeflediğini, karar kimliklerinin resolver snapshot'ında tekil olduğunu yeniden doğrular. Resolver bağlamı, yaşam döngüsü/inceleme kayıtlarının domain-separated `lifecycleReviewSnapshotSha256` özetiyle bağlıdır; hash yetki veya kaynak otoritesi değildir. Gözlem zamanı blueprint insan onayından önce olamaz. Başarılı durum yalnız `coverage_review_ready` olur; `scopeCoverageComplete` ayrı taşınır. Bu nedenle kısmi 36 haftalık plan, mevcut onaylı maddelerin inceleme zinciri tamam olsa bile tam kapsam, yayın, öğrenci teslimi, MEB onayı veya kaynak otoritesi olarak sunulamaz. Gerçek adapter snapshot'ları istemciden kabul etmez; yetkili append-only kaynaktan çözer, aktif geri çekme/politika durumunu commit anında yeniden denetler ve ilerideki yayın bağını atomik olarak kalıcılaştırır.

[`server_resolved_content_package_coverage_binding.mjs`](../packages/contracts/server_resolved_content_package_coverage_binding.mjs), bu sonucu tek bir değişmez paket hedefiyle (paket manifest özeti, içerik öğesi–revizyon–varlık seti ve blueprint hücresi) eşleyen bir sonraki saf sidecar'dır. Hazır bridge sonucu, kapsam raporu veya yayın/teslim beyanı kabul etmez; bridge'i içeride yeniden hesaplar ve hedefin onaylı bağlar arasında tam olarak bir kez yer aldığını doğrular. Paket resolver bağlamının domain-separated `packageCoverageSnapshotSha256` değeri; hedefi, bridge resolver bağlamını, yaşam döngüsü/inceleme özetini, blueprint/müfredat özetlerini, seçili kaydı ve kapsam özetini bağlar; bu hash yetki, manifest doğrulaması, yayın kararı ya da teslim izni değildir. Başarılı durum yalnız `package_coverage_binding_ready` olur. Kısmi kapsamda hedef bağlanabilse bile `scopeCoverageComplete: false` görünür kalır. Bu faz mevcut V3 paket manifestini, yayın kararını veya governed delivery kapısını doğrulamaz/değiştirmez; gerçek adapter değişmez paket byte/manifest özetini yetkili depodan çözmeli, geri çekme ve aktif politika durumunu commit anında yeniden denetlemeli ve sonraki bağını atomik kayıtla saklamalıdır.

## 3. İçerik yaşam döngüsü

```text
taslak
  -> şema / kaynak / cevap / hesap denetimi
  -> görsel ve erişilebilirlik denetimi
  -> bağımsız AI karar kapısı
  -> öğretmen + ölçme uzmanı + dil incelemesi
  -> küçük pilot / madde analizi
  -> onaylı
  -> yayımlanmış
  -> izleme / geri çekme / düzeltme
```

Her geçişte neden, inceleyen rol, program sürümü, araç/model sürümü, test sonucu ve imzalı onay kaydedilir. `draft`, `approved` veya `published` ile eş anlamlı değildir.

### Otomatik kapılar

1. **Şema:** zorunlu alanlar, hedef sınıf/ders/öğrenme çıktısı, çözüm, seçenek/rubrik, sürüm ve hak kaydı.
2. **Deterministik doğruluk:** matematik/geometri hesapları, birimler, tablo/grafik değerleri ve fen nicel iddiaları kod veya konu uzmanı tarafından doğrulanır.
3. **Metin kalitesi:** yaş düzeyi, Türkçe dilbilgisi, açık soru kökü, tekil cevap/rubrik tutarlılığı ve açıklanmış çeldiriciler.
4. **Görsel:** SVG/çizim ile soru metni arasındaki eşleme, ekran okuyucu alternatif metni, küçük ekran okunabilirliği, renk dışı ayırt edici işaret ve baskı sürümü.
5. **Benzerlik ve hak riski:** yalnızca kullanım hakkı olan karşılaştırma veri setlerinde benzerlik taranır. Bu tarama “sıfır intihal garantisi” vermez; şüpheli durum insan/hukuk incelemesine gider.
6. **Pilot/psikometri:** madde güçlüğü, ayırt edicilik, hatalı anahtar, yanlış anlaşılan görsel ve grup bazlı olumsuz etki gözlenir.

## 4. Jev ve Clef-Flash’ın doğru yeri

| Araç | Doğru rol | Yanlış rol |
| --- | --- | --- |
| TypeSafe Jev | Metin/JSON üzerinde şemalı ikinci görüş: kazanım eşleşmesi, belirsizlik riski, yaş uygunluğu yönlendirmesi | Soru, çözüm, görsel veya ses üreticisi; matematik doğruluk otoritesi |
| Cloudflare Clef-Flash | Metin + gömülü görsel üzerinde şemalı görsel kalite kontrolü ve insan incelemesine yönlendirme | Görsel üretici, ses üretici, serbest metin yazarı veya tek yayın otoritesi |

Jev, serbest metin üretmeyen bir karar modelidir; sayısal doğruluğun kodla doğrulanması ve Türkçe için kullanıcı verisiyle test edilmesi gerekir. [Jev model referansı](https://docs.typesafe.ai/models)
Clef-Flash da serbest metin üretmez; en çok dört gömülü görsel üzerinde choice/score/noul olasılıkları döndürür. Ağırlıkları Apache-2.0 ile yayımlanmıştır, ancak Workers AI hizmeti ayrı fiyatlandırma ve veri sözleşmesine tabidir. [Cloudflare model dokümanı](https://developers.cloudflare.com/workers-ai/models/clef-flash/) · [model kartı](https://huggingface.co/Cloudflare/clef-flash)

İlk karar-modeli pilotu, uzmanlarca etiketlenmiş küçük Türkçe bir veri setinde özellikle geometri/fen diyagramlarını kapsar. Ölçülecek metrikler: yanlış kabul, yanlış ret, kalibrasyon, sınıf/branş farkı, düşük güven oranı ve insan incelemesine aktarılan madde oranıdır. Türkçe eğitsel kalite için sağlayıcı benchmarkı yeterli kanıt değildir.

İndirilebilir TypeSafe agent skill’i veya Clef yerel model kodu bu projeye kurulmamıştır. Kurulum düşünülürse kaynak URL’si ve sabit sürümü kaydedilir; önce SkillSpector `--no-llm`, betik/izin/ağ/hassas veri incelemesi tamamlanır.

## 5. Görsel ve işitsel içerik politikası

- Ölçme açısından kritik diyagramlar, denetlenebilir parametrelerden üretilen SVG/vektör çizim olur; rastgele görüntü üretimiyle değişen sayısal etiketler kabul edilmez.
- İllüstrasyon, ikon, fotoğraf ve ses için özgün üretim ya da kaydedilmiş ticari lisans gerekir. “İnternette bulunuyor” lisans değildir.
- 1. sınıf gibi erken okuryazarlık düzeylerinde görsel/işitsel içerik ana yoldur; aynı öğrenme hedefi için metin, ses ve erişilebilir alternatif sunulur.
- Kullanım koşulları ya da resmî kanal şeffaflık gerektiriyorsa AI ile oluşturulmuş içerik saklanmaz veya insan ürünü diye gösterilmez. Hedef, AI kaynağını gizlemek değil, uzman denetiminden geçmiş özgün ve güvenilir eğitim materyali üretmektir.

## 6. Depolama yaklaşımı

Yerel disk yalnızca küçük, süreli geliştirme önbelleği tutar. Drive bağlantısı kurulmadan önce hedef klasör, sahiplik, OAuth/servis hesabı, erişim kapsamı, şifreleme, saklama/silme süresi, geri yükleme testi ve KVKK/yurtdışı aktarım değerlendirmesi belgelenir. Token, e-posta veya öğrenci verisi kaynak koduna yazılmaz. Üretimde nesne deposu + erişim denetimli PostgreSQL; Drive ise onaylı yedek/aktarılabilir arşiv hedefi olarak değerlendirilir.
