# Sonraki Kaynak–Blueprint Kabul Dilimi

4 Ekim 2026; gece sonu **planı**, uygulanmış faz değil. Mevcut metadata/modül/test sözleşmeleri incelendi. Yeni PDF/web/Drive/provider/üretim veya test koşusu yok; geçmiş başarı yeni kabul değildir.

## Tek Hedef Ve Etkinlik Kapısı

Hedef aday: **6. sınıf Matematik, 2026–27, olağan ortaokul programını kullanan özel kolej**. Gerçek okul/tenant kimliği, okul profili karar kaydı, etkin program sürümü ve ders–sınıf–yıl kabulü henüz bağlı değildir. Genel TYMM kohortu, bunların yerine geçmez. `sources/meb-reference-registry.json` içindeki `tymm-current-ortaokul-matematik` kaydı, `TYMM-catalog-snapshot-2026-10-03-2026` katalog sürümüdür; etkin ders onayı değildir. İlk paket editör taslağı kalır; okul profili ve etkin karar bağlanmadan öğrenciye açılmaz.

`ACTIVE_YEAR_COURSE_BOUNDARY_RECHECK_2026-10-04.md` sınırı korunur: İngilizce olağan/çoklu dil ve izin kohortu ayrı; İngilizce 2026–27 sınıf–sürüm tablosu ve DKAB 4/8 dosya/kitap bağı pending. Okul materyali/deneme kullanımı ayrı mevzuat değerlendirmesi ister.

## Kaynak → Amaç → Kanıt Zinciri

Kaynak kayıt SHA'sı `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`; bu fazda yeniden hashlenmedi. `grade6-source-semantic-candidate-matrix.json` fiziksel 67–70 gözleminden MAT.6.1.4 ve a/b/c süreçlerini; `grade6-common-relations-application-observations.json` 71/72 uygulama gözleminden bağlam, gösterim ve gerekçeyi taşır. Fiziksel 73 sonraki tema bağlamıdır; yeni ortak ilişki çıktısı değildir. Tam PDF anlamsal kapsamı veya etkin program kabulü yoktur.

| Katman | Bu paketin adayı | Kabulde korunacak sınır |
| --- | --- | --- |
| Gözlenen çıktı/süreç | MAT.6.1.4; bağlamı ilişkilendirme, gösterme, anlamı açıklama | Kaynakta çıktı bulunması etkin okul sürümü onayı değildir |
| Türetilen mikroamaç | G6-CR-M01 bağlama uygun ilişki; M04 gösterim–değer bağı; M05 gerekçe | Proje aday kimlikleri; resmî mikrobeceri taksonomisi değil |
| Soru amacı/aile | Ortak ilişkiyi bağlam ve birimle kanıt kartına eşleme | Sayısal satır veya iki bağlam ayrı ürün ailesi/stok değildir |
| Temsil | Özgün bağlam tablosu, kanıt kartı ve gerekçeli çözüm izi | Kaynak görseli kopyalanmaz; tablo/görsel varlığı erişilebilirlik kabulü değildir |
| Beklenen öğrenci kanıtı | Verilen kanıttan doğru bağlam–birim eşlemesi | Hazır listeleri seçmek, öğrencinin liste üretmesini veya tam M02/M03 ustalığını kanıtlamaz |

Gerekçe, neden bu ilişkinin seçildiğini ve değerlerin neyi anlattığını açıklamalı; kısa pratik not **koşullu** olmalı. Sonuçtan önce cevap sızmamalı. Liste oluşturma/açık uçlu açıklama ayrıca rubrik ve yetkili ölçüm ister; mevcut eşleme görevine ölçülmeyen beceri etiketi eklenmez. Formal EBOB/EKOK, en küçük/en büyük ortak değer görevleri ve sınırsız ortak kat listesi bu dilimde yoktur.

## Tek Özgün Taslağı Yeniden Kullanma

İlk kabul adayı mevcut `grade6-common-relations-two-context-v1` taslağıdır: **1 taslak, 2 bağlam, 1 anlamsal aile**; yeni üretim/stok artışı **0**. Özgün yazım hedefi, arşiv benzerlik/hak/uzman kabulünün geçtiği anlamına gelmez. Sadece sayıları değiştirip altı–yedi aynı tip soru saymak yok.

Kapalı DTO: `{applicationObservations, semanticMatrix, sourceRecord}`. `packages/content-factory/grade6_common_relations_draft.mjs` içindeki `createGrade6CommonRelationsDraft(sourceBindingInput)` ve `verifyGrade6CommonRelationsDraft(candidate, sourceBindingInput)` kullanılır. Tam metadata ve kaynak satırı pinleri korunur; çağıranın yeniden hashlemesi kaynak/hak otoritesi vermez.

`grade6_reference_authoring_plan.mjs` / `createGrade6ReferenceAuthoringPlan({formObservations, semanticMatrix, sourceScopeInput})`, eski altı kaynak gözleminden altı ön-brief üretir; bu hedefin tam blueprint'i değildir. 14/15'in null çıktı bağı doldurulmaz; eski örneklemde MAT.6.1.4 görülmemesi yeni uygulama kaydıyla geçmişten silinmez. `source_scope_gaps.mjs` / `createSourceScopeGapReport(input)` eksik/payda görünümünü sürdürür; resmî çıktı/mikrobeceri/aile paydaları ve kapsam yüzdesi null kalır.

## Zorluk Ve Karıştırma

Tek kabul adayında zorluk kalibrasyonu ve difficulty mix **null**. Kullanıcının %10/%30/%30/%30 dağılımı örnek bir hedef; MEB'de gözlenen oran, evrensel kural veya uygulanmış varsayılan değildir. Önce uzman gerekçeli aday düzeyi; ancak uygun yetkili pilot sonrasında ampirik madde güçlüğü/ayırt edicilik değerlendirmesi. Şimdiki sentetik testlerden çocuk gelişimi veya psikometrik sonuç çıkarılmaz.

Çok-maddeli planda öğretmen onaylı toplam N, tamsayı kota/yuvarlama, amaç/aile/temsil çeşitliliği, komşu aynı-tip sınırı ve önkoşul ayrı kurallar olmalı. Oran kapsam değildir; yetersiz stok klonlarla doldurulmaz.

## Kabul Sırası Ve Negatif Kanıt

1. **Bağlam ve lineage:** Yetkili okul profili/sınıf/yıl/program kararı belge kimliği ve kaynağıyla bağlanır. Yanlış tenant/sınıf/yıl, eksik karar, stale SHA, değiştirilmiş tam metadata, yeniden hashlenmiş gate, null satır, getter/proxy/cycle ve aşırı boyut fail-closed; reddedilen girdide provider/yazma çağrısı 0. Mevcut `test/grade6_common_relations_draft.test.mjs` ve `test/grade6_reference_authoring_plan.test.mjs` taze koşulur; eksik okul-context davranışı önce RED yazılarak ayrı adapter diliminde eklenir.
2. **İçerik ve ölçüm:** Bağımsız modulo/birim/sınır denetimi; eksik aday, yanlış toplama, paket sayısı–paket boyutu karışması, sıfır/ufuk ihlali ve yanlış kanıt kartı reddi. Tam çözüm gerekçesi, koşullu kısa not ve transferler insan editör/branş uzmanı tarafından incelenir. Eşleme sonucu ustalık/zeka/meslek yönelimi diye yükseltilmez.
3. **Blueprint:** `question_coverage_blueprint.mjs` / `validateQuestionCoverageBlueprint` ve `evaluateQuestionCoverage` mevcut tam kanonik kapsam, 36 ayrı hafta ve insan onayı şartlarını korur. Bir taslakla kalan haftalar/çıktılar/kanıtlar uydurulmaz. `test/question_coverage_blueprint.test.mjs` içindeki kanonik boşluk, mükerrer hash/alias, yanlış mikrobeceri, stale sürüm ve cevap taşıyan metadata negatifleri korunur. Ön-brief tam blueprint kabul edilmez; 36 haftalık görünüm resmî eşit konu dağılımı değildir.
4. **Hak ve insan-store:** Owner/steward, amaç, hak dayanağı, kaynak/asset sürümü, erişim ve saklama kaydı tamamlanır. Reference-only/unverified açık erişim ticari lisans değildir. `validateContentReviewDecision`, `validateContentPublicationDecision`, `evaluateDecisionBackedReleaseReadiness` ve `evaluateServerResolvedQuestionCoverageReviewReadiness` mevcut pure sözleşmeleri kullanır; gerçek yetkili append-only resolver/store ayrı engeldir. Sahte onay bayrağı, yanlış rol, iptal edilmiş karar, eski içerik/asset/hash ve yetkisiz öğrenci kapsamı negatifleri gerekir. Pure değerlendirme tek başına kimlik doğrulamaz, store'a yazmaz, yayımlamaz.
5. **Medya:** `createGrade6CommonRelationsMediaPreparation` → `createGrade6CommonRelationsScenePlan` → `renderGrade6CommonRelationsCaptionFrame`; canlı plan, stale/serialized reddi ve reveal kapısı korunur. Desteklenmeyen aile yanlış geometri fallback'i almaz. Gerçek ses/kalem senkronu, okunurluk ve dinleyici/uzman kabulü olmadan videolu ürün artmaz. Sentetik SQL gerçek öğrenci entegrasyonu değildir.

## Faz Sonu Kayıt Ve Sayaçlar

Sonraki faz RED → minimal GREEN → bağımsız negatif audit → taze kanıt; bu prose plan TDD/test-pass değildir. PDF/link, kaynak sorusu/lesson/video ile taslak/teknik geçiş/uzman kabulü/yayın ayrı sayaçtır. Kaynak sorusu stok değildir; 143 katalog kaydı ve 42 aday hücre resmî payda değildir. Aynı revizyon iki kez sayılmaz. 36.000, MEB onayı veya DAMA/CMMI/SPICE sertifikası açılmaz. Gece 08:00 İstanbul'da durur; uygulama/açık kararlar sonraki yetkili oturuma kalır.
