# Sonraki Fabrika Dilimi: Ortak İlişkiler Kabul Planı

4 Ekim 2026. **Plan; özellik/test başarısı değildir.** Root başlangıcı `a4a3e1b4116a2e3fc1e41c67a58b09fc4fe70247`; Git veya Xcode lisansı/ayarları değiştirilmedi. Yalnız okuma ve bu belge; kod dilimi08:00 sonrasında ayrıca başlatılır.

## Dar Hedef Ve Mevcut Boşluk

Özel ortak-ilişki hazırlığını **normal fabrikanın kapalı domain girişine** taşımak; genel resolver desteği, yeni soru veya öğrenci teslimi değil.

`tools/content_factory_pilot.mjs`: `--count/--out/--metadata`; batch → rectangle trace/job → generic geometry/scene. Common'u `batch.items` içine koyma: farklı şema/birim için `resolveReasonedMediaGeometry` `unsupported_reasoned_geometry_source` verir; ret korunur. Ayrı `tools/grade6_reference_authoring_plan.mjs` özel common draft/media/scene/frame/review tüketir; normal fabrikaya bağlı değildir.

## Önerilen Exact Seam — Henüz Yok

Yeni `packages/content-factory/grade6_common_relations_factory_preparation.mjs`:

```js
createGrade6CommonRelationsFactoryPreparation(sourceBindingInput)
```

Exact1; mevcut üç metadata alanı: `applicationObservations`, `semanticMatrix`, `sourceRecord`. Güvenilen CLI kökü mevcut sabit dosyaları okur; yeni fixture yok:

- `sources/grade6-common-relations-application-observations.json`
- `sources/grade6-source-semantic-candidate-matrix.json`
- `sources/meb-reference-registry.json` içinden tek `tymm-current-ortaokul-matematik` kaydı.

Girdi pin/şema doğrulaması gerçek draft API'siyle yapılır; hash yalnız bütünlük/lineage ilişkisidir, kaynak erişim veya insan kabul yetkisi değildir. Caller candidate, plan, trace, job, SVG/XML, provider, URL, sınıf/yıl veya reveal seçtirmez. Getter/Proxy/coercion/cycle/sparse/hidden/unknown alanlar, own-key dahil bounded inert doğrulamadan sonra kapalı tanıyla reddedilir; user hook0. Sonraki tüketim yalnız kanonik yeniden kurulmuş nesnelerde olur.

Gerçek mevcut export zinciri:

1. `grade6_common_relations_draft.mjs`: `createGrade6CommonRelationsDraft(input)` / `verifyGrade6CommonRelationsDraft(draft,input)`.
2. `grade6_common_relations_media_adapter.mjs`: `createGrade6CommonRelationsMediaPreparation(draft,input)`; iki gerçek trace/job ve ayrı oracle.
3. `grade6_common_relations_scene.mjs`: `createGrade6CommonRelationsScenePlan({source:draft,sourceBindingInput:input,preparation})`; audit özgün canlı nesnelerde.
4. Aynı modülde `renderGrade6CommonRelationsCaptionFrame(scenePlan,{})`; `grade6_common_relations_review.mjs`: `renderGrade6CommonRelationsReview(scenePlan,{})`.

Önerilen frozen dönüş: `{schemaVersion:'grade6-common-relations-factory-preparation/v1',state:'editor_factory_preparation',draft,verification,preparation,scenePlan,initialFrame,initialReview,manifest}`. Bu tam paket cevap taşıyan **editör artefaktıdır**; JSON serileştirmesi canlı WeakSet yetkisi kazanmaz. `manifest` kaynak/draft/task/preparation/trace/job/scene/frame/review hashlerini, byte boyutlarını, birimleri, kapıları ve sayaçları bağlar; gelecekteki anlatım metinlerini taşımaz. Toplam JSON≤512KiB, HTML≤64KiB, manifest≤16KiB; output-budget ihlali yazım öncesi ret.

Normal araç için önerilen tek yeni kullanım:

```sh
node tools/content_factory_pilot.mjs --domain grade6_common_relations --out ABS_EMPTY_OUTPUT
```

Bu modda `--count`, `--metadata`, cue/reveal/provider/source-path ve birleşik/fazla/tekrarlı bayraklar ret. Domain yoksa rectangle 1/12/100 değişmez. Common `createPilotBatch` çağırmaz; preview=`initialReview.html`. Generic resolver fallback yok; `genericResolverSupported:false` yanında ayrı specialized-scene bağı. Tek task/iki iş: **existingDraft1 /jobs2 /newQuestions0 /accepted0 /published0**; tekrar stok değildir.

Önerilen sahiplik: yeni modül + `test/grade6_common_relations_factory_preparation.test.mjs`; ayrı yazar normal CLI + `test/grade6_common_relations_factory_cli.test.mjs`. Eski domain modüllerinde feature/refactor yok. Açık boş output'ta audit JSON/current-only HTML;0700/0600, sabit adlar/bütçe, symlink/unstable-path/overwrite ret. Eski cache değişmez.

## RED Önce, Koruma Testleri Ayrı

Eksik API/export için consumer assertion RED; typo/crash değil. CLI özel paket beklentisi eski parser'da RED; minimal implementation → GREEN. Plan prose'u ve zaten geçen koruma regresyonları yeni-feature RED sayılmaz.

| Yakalanacak yanlış değişiklik | Bağımsız davranış beklentisi |
| --- | --- |
| Common'u rectangle/count/cm diye yeniden etiketleme | Oracle zaman `[24,48]`; kart/paket `[1,2,3,4,6,12]`; 6 kart/paket örneğinin paket adetleri `[4,6]`. Dakika/kart-paket/paket ayrı; generic numericSteps0/semantics pending. |
| Metadata yeniden hashlenince yetki/çıktı değişimini kabul | Üç tam metadata pin, task/draft ve source SHA bağı; yanlış çıktı/birim/amaç/formal-EBOB-EKOK/min-max/kapı değişimleri yeniden hashlenmiş olsa da ret. Aktif yıl, resmî binding ve insan kabulü otomatik doldurulmaz. |
| Caller markalıymış gibi serialized payload kullanma | Trace/job/scene structuredClone veya JSON kopyası ilgili canlı audit/render'da ret. Yeni consumer caller hook/plan/renderer almaz; opaque hash aynı diye kabul yok. |
| Desteklenmeyeni fallback ile çizme | Generic common ret aynen; bilinmeyen domain/family ret; transferde sourceDiagramProof false/sourceVisualId null ve geometry pending. Eski şekil transferin kanıtı yapılmaz. |
| Cevabı erken/current dışına sızdırma | `result/check_answer/summary/transfer_answer` için reveal true **ve** progress===1 birlikte gerekir. 0/.5/1 ve 1'e yakın değerlerde tüm geçerli sayfaları test et; locked transcript/hash/result/pen/answer-specific mapping null/boş, SVG title/desc/aria ve selected metadata aynı kapıya uyar. |
| Current preview'e tam geleceği ekleme | Default repeat/cue0/page0/progress0/revealfalse; yalnız current caption/fallback. Full editör audit ile preview ayrı. Verilenlerden sonucu türetebilmek anti-cheat güvenliği sayılmaz; digit-yokluğu testi kullanılmaz. |
| Sayfalamayı, kaynak vurgusunu veya mobil okumayı bozma | Actual DOM literal timeline16 işaret/0 dışarıda48 içeride, altı paket satırı/iki tür adedi; source/table eşdeğeri, görünür scrollhint ve focus/IDREF bağı. Tam current metin kayıpsız; future caption yok. CSS/prose snapshot testi değil. |
| Lokal teknik geçişi onay/yayın sayma | Tüm altı insan kapısı pending; provider/audio/video/learner/production false. Normal100→12/88 korunur; common yeni kabul stoğuna eklenmez. |

Raw XML/HTML/URL/crop/dış asset girdisi yok. Escaping/literal DOM actual HTML'de; loop/label-band ve erken kaynak vurgusu korunur. Native min18px/320/390/1440 overflow/focus ayrı gelecek kanıttır. CSS/prose/HTML-byte/page-total snapshot'ı değil gerçek anlam ve bütçe sınanır.

## Yerel Teknik Kabul ≠ İnsan/Yayın Kabulü

Tek canonical task normal CLI domain'inden kurulmalı; gerçek verifier/live trace/job/scene/current HTML lineage eşleşmeli. Hermetik CLI kendi temp paketini üretip siler; kötü girdi yazım öncesi ret/dosya0. Taze dar test+independent hostile/rehash/reveal audit, syntax/byte/hash/cleanup raporlanır. Eski test sayısı yeni koşu değildir; root genel regresyonu ayrı yapar.

Bu sonuç yalnız `editor_factory_preparation` teknik geçişidir. Altı kapı — activeProgram, pedagogy, rights, difficulty, answer, accessibility — yetkili karar store'unda ayrı bekler; oracle answer gate'ini approved yapmaz. Hak/benzerlik incelemesi, aktif okul-yıl/çıktı binding, yaş/alan/dil uzmanı ve gerçek erişilebilirlik kabulü olmadan öğrenci kütüphanesi/stok artmaz. DAMA owner/steward/purpose/source/version/access/retention ve audit kararları fixture/hash ile atanmış sayılmaz.

Canlı model/TTS, ses/video, öğrenci auth/analitik, bulk36.000, indirme/Drive/ücretli Docker kapsam dışı. Test kanıtı CMMI/SPICE/MEB sertifikası veya tam müfredat başarısı değildir.
