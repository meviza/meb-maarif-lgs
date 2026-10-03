# Paket manifesti DAMA kapsam denetimi — 3 Ekim 2026

## Kapsam ve mevcut durum

Denetim, henüz commit edilmemiş `server_resolved_content_package_manifest_coverage_governance_readiness.mjs` modülü ve `server_resolved_question_coverage_review_readiness.test.mjs` dosyasına uygulanmıştır. Mevcut değişiklikler korunmuştur. Bu modül saf bir sunucu-resolver sözleşmesidir; çalışan veritabanı, HTTP kimlik doğrulaması, yayın veya öğrenciye teslim servisi değildir.

Girişte V3 manifestinin kapalı şeması, zorunlu DAMA alanları, müfredat kimliği, içerik sürümü, görsel varlık referansları ve kapsam konumu denetlenir. Manifestten türetilen hedef için kapsam ve insan değerlendirmesi yeniden hesaplanır. SHA-256, alan ayrımlı bir bütünlük bağlamasıdır; imza veya kaynağın gerçekliği kanıtı değildir.

## Bulgu ve giderim

**Yüksek öncelikli yanlış-pozitif:** Manifest farklı bir yazar veya ilgisiz akademik/ölçme/telif/erişilebilirlik değerlendirme kimlikleri taşıyabiliyor; manifestin bütünlük özeti yeniden hesaplandıktan sonra yine `governanceReady` sonucuna ulaşabiliyordu. İçerik kimliği eşleşmesi, bu referansların eşleştiğini tek başına kanıtlamaz.

Önce üç davranış testi eklendi. Giderim öncesi üçü de beklenen nedenle başarısız oldu: farklı yazar ve ilgisiz değerlendirme kimlikleri kabul ediliyor, denetimin sınırı çıktıdan anlaşılamıyordu. Sonrasında:

- Resolver girdisi yalnız JSON biçimli, öz veri alanlarından oluşan, sınırlı ve dondurulmuş bir kopyaya alınır. Yeniden hesaplama ile referans karşılaştırması aynı kopyayı kullanır; erişimci, döngü, derinlik ve düğüm sınırları kapalı davranır.
- Manifest yazarı, seçilen içerik öğesinin bağımsız çözülmüş yaşam döngüsü yazarıyla eşleşmek zorundadır.
- Dört değerlendirme referansı, kendi disiplininin aynı içerik/sürüm/varlık kümesine bağlı onaylı karar kimliğiyle eşleşmek zorundadır. Disiplin değiştirilerek veya yeni hash hesaplanarak aşılmaz.
- Başarılı sonuç açık `verificationScope` taşır. Yayın otoritesi, varlık kanıtları/baytları ve kaynak kullanım hakları `not_evaluated` olarak işaretlenir.

## Bilerek kapatılmayan üretim sınırları

V3 manifestindeki `lifecycleState: published` ve `publicationDecisionId` yalnız biçimsel referanslardır. Bu sözleşmede yayın kararı kaydı veya geçerli yayın/geri çekme zinciri çözümlenmez. Dolayısıyla `governanceReady`, yayınlandığı, yayına uygun olduğu veya öğrenciye teslim edilebileceği anlamına gelmez; bu izin bayrakları çıktıdan verilmez.

Benzer şekilde:

- `packageArtifactSha256` gerçek dosya baytlarından burada hesaplanmaz; güvenilen adapter bağımsız doğrulamalıdır.
- Varlıkların telif, köken ve erişilebilirlik kayıtları burada çözülmez; bunların manifest metaverisi hash içinde bağlanır.
- V3 kaynak zinciri kaynak dokümanı SHA-256'sı veya lisans kanıtı taşımaz. Bir kaynak kimliği, MEB onayı veya kullanım izni değildir.
- Genel 36 haftalık kapsam eksik olduğunda `scopeCoverageComplete: false` korunur; tek öğenin hazır olması tüm sezonun hazır olduğu anlamına gelmez.
- Üretim adapteri güvenilen/politikaya uygun kaynak çözümlemesi, bağımsız bayt kontrolü, güncel iptal ve politika denetimi, yetkilendirme ve atomik kayıt için ayrıca gereklidir.

Bu sınırlar yeni bir yayın/teslim zinciri icat edilmeden açık bırakılmıştır. Mevcut V3 sözleşmeleri değiştirilmemiştir.

## Doğrulama kanıtı

Çalışma dizini: `fearless-pasteur-codex-foundation`; dal: `codex/k12-foundation-audit`.

1. Giderim öncesi: `node --test test/server_resolved_question_coverage_review_readiness.test.mjs` — 36/36 geçti.
2. Yeni red testleri: `node --test --test-name-pattern 'freshly rehashed|publication authority' test/server_resolved_question_coverage_review_readiness.test.mjs` — 0/3 geçti, 3 beklenen davranış hatası yeniden üretildi.
3. Giderim sonrası: `node --test test/server_resolved_question_coverage_review_readiness.test.mjs` — 39/39 geçti; iptal/atlama yok.

Bu kanıt yalnız ilgili saf sözleşme/test sınırını doğrular; üretim, pedagojik doğruluk, müfredat onayı veya CMMI/SPICE sertifikasyonu değildir. Bu alt görev commit/push yapmamıştır.
