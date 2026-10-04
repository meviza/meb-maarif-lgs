# Ortak ilişkiler: Sınırlı gerekçeli medya adapter'ı

Tarih: 2026-10-04. Durum: **Bir mevcut editör taslağından iki gerçek yerel medya işi ve iki seslendirme istek taslağı hazır; ses, video, öğrenci teslimatı veya kabul/yayın değildir.**

Bu dilim, özgün `grade6-common-relations-two-context-v1` kaydını mevcut genel gerekçeli trace/job/request API'lerine bağlar. İki bağlam işi iki yeni soru değildir. Var olan HTML/SVG görünümü ayrıca gerçekten üretilir; bunun genel sahne/caption renderer'a bağlandığı iddia edilmez.

## Sahiplik, API ve gerçek çağrı zinciri

Bu yazar yalnız üç yeni dosyayı ekledi:

- `packages/content-factory/grade6_common_relations_media_adapter.mjs`
- `test/grade6_common_relations_media_adapter.test.mjs`
- Bu kanıt belgesi.

Eski kaynak/taslak/verifier/renderer, genel trace/media/geometry/scene API'leri, CLI, ortak dokümanlar, SQL/notebook ve Git bu yazar tarafından değiştirilmedi. Ana ajan CLI opt-in ve genel faz raporunu ayrı sahiplenir.

```js
createGrade6CommonRelationsMediaPreparation(candidate, sourceBindingInput)
```

Tam iki argüman zorunludur. Kaynak input'u önceki sözleşmenin tam üç alanıdır: `applicationObservations`, `semanticMatrix`, `sourceRecord`. Yeni provider, voice, style, scene, path, source, rol veya öğrenci seçeneği yoktur. Eksik/fazla argüman `invalid_common_relations_media_arguments`; aday/kaynak/kurulum reddi yalnız `invalid_common_relations_media_input` sabit hatası verir. Hata ham metin/hash/payload/verifier ayrıntısını yansıtmaz.

Gerçek çağrılar:

```text
verifyGrade6CommonRelationsDraft(candidate, sourceBindingInput)
→ createGrade6CommonRelationsDraft(sourceBindingInput)
→ her iki kanonik path için createReasonedTeachingTrace(...)
→ auditReasonedTeachingTrace(trace)
→ createReasonedMediaJob(trace)
→ auditReasonedMediaJob(job)
→ createReasonedMediaAudioRequest(job)

Ayrı: renderGrade6CommonRelationsEditorView(canonicalDraft, sourceBindingInput)
```

Başarılı çıktı iç içe dondurulmuştur:

```js
{
  schemaVersion: 'grade6-common-relations-media-preparation/v1',
  state: 'editor_media_preparation',
  artifactAudience: 'editor_only',
  sourceLineage,
  verification,
  contexts: [
    { contextId, path, transfers, trace, traceAudit, job, jobAudit, audioRequest },
    // repeat ve grouping
  ],
  editorView,
  manifest,
  contentSha256
}
```

Verifier kapısından sonra çağıranın candidate nesnesi **yeniden okunmaz**. Kanonik taslak tekrar kurulur; trace/job/request/HTML'deki bütün sink'ler yalnız bu sabit kayıt kullanılarak üretilir. Modül user hook, provider, dosya sistemi, ağ veya tarayıcı çalıştırmaz. Testler gerçek yerel metaveri kayıtlarını okur; kaynak PDF yeniden edinilmez/denetlenmez.

## Matematik ve genel text trace farklı kanıtlardır

Önceki gerçek bağımsız modulo oracle iki sonlu kümeyi tekrar hesaplar:

- Pozitif, başlangıç hariç ve 48 dahil ortak dakika işaretleri: `[24, 48]`.
- İki kart türü ayrı kalacak biçimde ortak kalansız boyutlar: `[1, 2, 3, 4, 6, 12]` kart/paket.
- 6 kart/paket örneğinde ayrı paket adetleri: `[4, 6]`.

Genel trace sözleşmesi `minute` veya `card_per_package` aritmetik boyutunu ya da küme kesişimi işlemini desteklemez. Bu adapter birimi `count`, `cm` veya `unitless` diye yeniden etiketlemez. Her bağlamda **tek `interpret` adımı, `unit: 'text'`** kullanır; gerçek değerler/birimler outer `contextSemantics` ve anlatım metninde açıkça korunur.

| Bağlam | Oracle değeri | Gerçek birim | Genel trace birimi |
| --- | --- | --- | --- |
| repeat | 24, 48 | minute / Dakika | text |
| grouping | 1, 2, 3, 4, 6, 12 | card_per_package / Kart/paket | text |

Sonuç metinleri sırasıyla `24 ve 48 dakika` ve `1, 2, 3, 4, 6 ve 12 kart/paket` biçiminde başlar. Genel media API'si bunları yorum sonucunun anlamıyla birlikte taşır; hayalî bir eşittir/aritmetik expression üretmez. Bu metin hâlâ taslaktır: ses telaffuzu, doğal hitabet/tekrar, dinleyici ve yaş kabulü yapılmış değildir.

Gerçek genel denetim sonuçları her iki trace için `structuralChecks: passed`, **`numericStepsChecked: 0`**, `semanticReview: pending` ve `sourceBinding: declared_requires_source_resolver` kalır. Outer oracle'ın matematik geçmesi bu alanları değiştirmez; generic resolver onayı veya bağımsız yorum doğruluğu diye sunulmaz.

## İki tam yol, koşullu notlar ve üç aktarım

İki eski kanonik `path` bütün alanlarıyla ayrı context kaydında korunur: hedef, verilen değerin anlamı, neden, işlem/model anlamı, sonuç, birim, sonucun anlamı ve `conditionalNote.when/why/check/notImplied`. Bunlar ayrıca gerçek cue tüketicisinde kullanılır:

```text
goal → evidence → plan → why → result → check_prompt → check_answer
→ summary → transfer_prompt → transfer_answer
```

Her bağlamda **10 cue**, toplam **20 cue** vardır. Sonuç öncesinde neden bulunur. Kontrol ve aktarım sorularında mevcut genel API'nin planlanan dört saniyelik düşünme arası vardır; bu bir ölçülmüş audio süresi veya kelime timestamp'i değildir.

Üç aktarım kaydı eksiksiz korunur ve ilgili gerçek `transfer_answer` transcript'ine girer:

| Bağlam | Aktarım | Korunan anlam |
| --- | --- | --- |
| repeat | sum-not-common-time | 6+8=14 iki tekrarın ortak işareti değildir; kalanlar 2 ve 6 |
| repeat | window-boundary | 0 ortak başlangıç ama dışarıda; 48 ortak ve içeride; 72 ortak ama pencere dışı |
| grouping | group-size-not-count | 6 kart/paket boyutu ile 4 ve 6 paket adetleri farklı nicelikler |

Bu anlatım, verilmiş kanıtı yorumlama/eşleme içindir. Öğrencinin kendi listesini veya açıklamasını ürettiği, hızlı çözdüğü, ustalık/kabiliyet/bilişsel/psikometrik/kariyer sonucu verdiği iddia edilmez. En küçük/en büyük ortak ilişki veya formal EBOB/EKOK algoritması bu adapter ile öğretilmez.

## Canlı capability ve serialized çıktı sınırı

Trace/job değerleri gerçek mevcut oluşturuculardan gelir ve onların yerel WeakSet markalarına sahiptir. Testte gerçek `auditReasonedTeachingTrace`, `auditReasonedMediaJob` ve `createReasonedMediaAudioRequest` bunları kabul eder. Contextler farklı trace/job hash ve kimliklerine sahiptir; ikisi aynı tek kanonik source draft hashine bağlanır.

`structuredClone` veya JSON serialize sonrası trace/job aynı alanları ve hashleri taşısa da genel API'ler `untrusted_teaching_trace` / `untrusted_reasoned_media_job` ile reddeder. Outer packet/hash de yetki üretmez. Geçerli candidate clone, eski kanonik verifier'dan geçip **yeni yerel** trace/job kurulumuna izin verebilir; clone'ın kendisi onay, kaynak kimliği veya publication capability değildir.

Bütün job/request/provider alanları `provider: null`; `providerReady: false`, `providerCallsAllowed: false`, `state: draft_only_no_provider_call`. Audio evidence bağlanmaz. Duration/byte/speech/transcript/voice identity/video/audio alignment kanıtı yoktur. Gerçek ses API'sine veya ücretli modele çağrı yapılmaz.

Full job/request transcript'leri cevap içerir. `fullTranscriptEditorOnly: true`, `answerBearingEditorArtifact: true`, `serializedAuthority: none` açıkça yazılıdır. Genel stage API'sinin `reveal` davranışı yalnız editör sunumudur; paket zaten tam metin taşıdığı için öğrenci güvenliği/cevap koruması değildir. Notebook veya learning event üretmez.

## Geometry/scene/caption bağlantısı dürüstçe bekliyor

Mevcut `resolveReasonedMediaGeometry` yalnız pilot dikdörtgen aileleri ve çevre kavram kaynağını kanonik yeniden kurar. Testte her iki **gerçek** yeni trace/job ve kanonik common-relations draft ile çağrılması `unsupported_reasoned_geometry_source` verir.

Adapter dikdörtgen fallback, fake source schema, uydurma markalı scene planı veya geometry approval oluşturmaz. Manifest:

```js
geometryPreparation: {
  state: 'unsupported_common_relations_family_pending',
  genericResolverSupported: false,
  genericScenePlansCreated: 0,
  captionFramesRendered: 0,
  reason: 'unsupported_reasoned_geometry_source'
}
```

`genericSceneRevealImplemented: false`. Mevcut generic scene/caption API'si job-shaped DTO'yu sahne planı yerine kabul etmez. Zamanşeridi highlight bölgeleri, paket tablo/cell anchors, yeni transfer geometri ve current-caption sahne üretimi ayrı gelecekteki adapter gerektirir. Bu dilim o işi tamamlandı saymaz.

Bunun yanında mevcut `renderGrade6CommonRelationsEditorView` **gerçekten** çalışır: kendi tek inline SVG'sinde 9 daire +7 kare=16 işaret ve gerçek altı paket-boyutu satırı korunur. Bu editor HTML render tanığıdır, generic scene/caption veya PNG/video değildir. Kaynak taslağın `representation.rendered: false` alanı değişmez. Var olan kapalı details cevap güvenliği değildir; native/erişilebilirlik kabulü yeni packet ile otomatik devralınmaz.

## Kaynak ve DAMA sınırları

Outer manifesto kaynak/task/draft, tam uygulama gözlemi/matris/ana registry row ve editor HTML hashini taşır:

| Bağ | SHA-256 |
| --- | --- |
| Source PDF revizyonu | `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734` |
| Tam uygulama metaveri snapshot'ı | `3c1ccf730931f9704bd95ce5137ee0154d6b05daea6eb12c35a70bfa23b89c38` |
| Tam önceki matris snapshot'ı | `5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8` |
| Gerçek ana kaynak row snapshot'ı | `610d60eeb3d8387517d2f74f71be171fa8663e3a177d42bd217b647ac6bdea19` |
| Mevcut draft hash | `9c225c8f2bc97dfae1d89778cda3ff5980f0c31056330c639e5be15823d2abd7` |
| Mevcut görev hash | `c20e190e87945d6a79140819490ab09e55342a5a988eae9df5a95e0054ee6aeb` |

Outer `sourceBinding: canonical_metadata_binding_not_authentication_or_fresh_bytes`; generic trace source binding yukarıda belirtildiği gibi declared/pending kalır. Source uygulama açıklamaları kaynak soru veya ürün stoku değildir. Taze PDF bayt kontrolü 0'dır; kaynak indirme/benzerlik/rights/pedagoji işi yapılmaz.

Altı kapı hâlâ pending: aktif program, pedagoji, haklar, zorluk, uzman yanıt incelemesi, erişilebilirlik. Etkin akademik yıl/program/resmî öğrenme çıktısı null; MAT.6.1.4 yalnız önceki önerilen içerik bağının devamıdır. Öğrenci kanıtı/full outcome coverage/learner/publication/production readiness false; humanApproval null. Hash/draft/math/HTMLrender DAMA, CMMI veya SPICE sertifikası ya da MEB onayı değildir. Owner/steward/retention/hak/öğrenci authorization kapıları hâlâ ayrı bekler.

Sayım: **1 mevcut taslak /2 bağlam medya işi /0 yeni soru /0 kabul edilen ürün sorusu /0 yayın**. Görünüm faaliyeti: **2 trace +2 media job +2 audio request draft /1 HTML /1 own inline SVG /0 ses /0 video /0 ağ /0 sağlayıcı**. Tekrar çağrılar farklı stok üretmez.

## Bütçe, gerçek çıktı ve test kanıtı

Manifest UTF-8 JSON üst sınırı 16.384 bayt, tüm packet üst sınırı 131.072 bayttır. Çağıran yeni sayı/metin/template belirleyemez. Getter/proxy/revoked/sparse/cycle/depth/büyük girdiler önce mevcut inert source/candidate sınırında kapanır; hatalar sabittir. Bu profil tek sabit görev içindir, sınırsız materyal/payload kapasitesi değildir.

Doğrudan gerçek API çıktısı:

- Packet JSON: **74.995 bayt**; domain content hash `37a21884435691ac17054ca65c8c4e2002531668fc309471a96e06c9f4cd260e`.
- Packet JSON bayt SHA-256: `140f50e8cc2a24a7eff3470766391532c7174b2808cc51fa4fd1a6aa1017ae90` (domain hash ile aynı kavram değildir).
- Manifest: **2.949 bayt**.
- Mevcut editor HTML: **19.363 bayt**, SHA `7fd1e6607dab233c6244179fc52f98f020a241a60f49b0428316cd4f0f044dac`.

| Bağlam | Trace SHA-256 | Job SHA-256 | Audio request SHA-256 |
| --- | --- | --- | --- |
| repeat | `e35da34322584f6e9d578255168a39fc9b76622f77d3b807324b93ce9afbd797` | `b3f91b74912b9fe291a0a5e4524c32c12918cff4de8a697ae82c0f8e90398371` | `2aaefc8bfe6dfb2067d1cbeec56992e82485a8f96863defc9b2e9bce4ddcd234` |
| grouping | `d539dc8d38b3c30d4386426c0d9414a89033205af7be8f9126c1714572366e57` | `7a4a4710fdc45534dfddcf977145116221f2df9e2a87532ac5344683e664bcfc` | `45df9ecbded430d72499204c16524caf38ccf21cb630f9f07c8302d1944aca28` |

### Gerçek TDD

1. Yeni modül yokken 15 gerçek tüketici/ret testi yazıldı.
2. `node --test test/grade6_common_relations_media_adapter.test.mjs` → **0 PASS /15 FAIL**, exit 1, 0 skip. Beklenen eksik export assertion: `common-relations media adapter is missing`.
3. Yalnız yeni minimal adapter implementasyonu sonrası aynı komut → **15/15 PASS**, exit 0, 0 skip.
4. Taze birleşik komut:

```sh
node --test test/grade6_common_relations_media_adapter.test.mjs test/grade6_common_relations_draft.test.mjs test/grade6_common_relations_editor_view.test.mjs test/reasoned_teaching_trace.test.mjs test/reasoned_media_job.test.mjs test/grade6_reference_authoring_cli.test.mjs
```

**74/74 PASS**, 0 fail, 0 skip, exit 0: adapter15 +taslak14 +görünüm13 +genel trace10 +genel media14 +mevcut ana ajan CLI8. Root CLI gerçek yeni `--common-relations-media` dalı bu koşuda çalıştı; bu yazar CLI'yi değiştirmedi.

```sh
node --check packages/content-factory/grade6_common_relations_media_adapter.mjs
node --check test/grade6_common_relations_media_adapter.test.mjs
```

İkisi de exit 0. Testler gerçek old verifier/producer/renderer/trace/job/request kullanır; mock provider/API veya fake approved fixture yoktur. Negatifler wrong math/key/unit/conditions/purpose/source/gates rehash, changed full metadata pins, serialized capability loss, markup/depth/oversize/null/sparse/cycle, proxy/revoked/getter/coercion ve exact arity'dir. Hostile hook sayısı 0. Testlerin native browser/glyph/audio/video/human/rights/auth/prod kabulü kapsamı yoktur.

Donmuş code/test:

| Dosya | Bayt | SHA-256 |
| --- | --- | --- |
| `grade6_common_relations_media_adapter.mjs` | 8.503 | `7cbbec11cb230567aa9513b51942ff3b1a85bc4512cf2a1b43ce3470ee41bd85` |
| `grade6_common_relations_media_adapter.test.mjs` | 21.431 | `e3420017eff5a45e505ba005de7ca6ed7d3b60cfde1219dc047c0cc75362bda3` |

Sonraki gerçek geometry/caption/ses/video ve öğrenci teslimi işleri bu frozen bağları yeniden doğrulamalı; bugünkü hazırlık çıktısını onay veya tamamlanmış medya diye devralmamalıdır.
