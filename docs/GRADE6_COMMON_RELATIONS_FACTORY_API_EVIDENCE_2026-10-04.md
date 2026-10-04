# Ortak İlişkiler: Kapalı Fabrika API Kanıtı

4 Ekim 2026. **Bir mevcut editör taslağı için gerçek saf hazırlık zinciri; uzman kabulü, öğrenci teslimi, ses/video veya üretim değildir.** Başlangıç checkpoint'i root tarafından bildirilen `6d8297949fac4e7179fe96e66e853ac16a1aa6ba`, dal `codex/k12-foundation-audit`. Bu yazar Git doğrulaması/commit yapmadı.

## Sahiplik Ve Gerçek API

Yalnız üç yeni dosya:

- `packages/content-factory/grade6_common_relations_factory_preparation.mjs`
- `test/grade6_common_relations_factory_preparation.test.mjs`
- Bu kanıt belgesi.

Eski draft/verifier/media/scene/review, kaynak JSON, normal CLI, genel rapor ve diğer testler değiştirilmedi. CLI dispatch ve exclusive dosya yazımı ayrı yazarın dilimidir; bu belge CLI'ın bağlandığını veya dosya izinlerini doğruladığını ilan etmez.

```js
createGrade6CommonRelationsFactoryPreparation(sourceBindingInput)
```

Tam bir argüman gerekir. Kapalı DTO yalnız `{applicationObservations, semanticMatrix, sourceRecord}` içerir. Gerçek mevcut uygulama gözlemi, eski semantik matrix ve ana registry'nin tek `tymm-current-ortaokul-matematik` satırını tüketir. Caller candidate, plan, renderer, provider, style, kaynak yolu, sınıf/yıl, cue veya reveal seçemez. Constructor pure'dur; dosya, transport, TTS veya yayın hook'u almaz.

İlk wrapper tüketimi bounded inert snapshot'tır: Proxy/revoked Proxy, getter/setter, coercion/toJSON/function, symbol/hidden key, cycle, sparse array ve foreign prototype ret. En fazla 100.000 node, derinlik24, toplam own-key/value UTF-8 bütçesi2MiB; string65.536 code unit, object1.024 key, key160 code unit, array2.048 öğe ve finite/|number|≤1e9 sınırı. Bunlar yetki veya PII garantisi değildir. Snapshot'tan sonra gerçek eski draft kapısı üç tam metadata pinini ve kaynak SHA/rights/scope/process bağlarını tekrar doğrular. Çağıranın hash yenilemesi yeni kaynak veya onay yetkisi vermez.

API arity hatası `invalid_common_relations_factory_arguments`; kaynak/pin/alt zincir reddi yalnız `invalid_common_relations_factory_input`; output bütçesi `common_relations_factory_output_budget`. Hatalar kaynak/istek/özel yol/metin yansıtmaz. Scope ve school-year acceptance hâlâ pending'dir; bu saf API okul kimliği veya erişim resolver'ı değildir.

## Gerçek Tüketim Zinciri

1. Kendi inert metadata snapshot'ından `createGrade6CommonRelationsDraft`.
2. Gerçek bağımsız `verifyGrade6CommonRelationsDraft`; geçerli değilse hazırlık yok.
3. `createGrade6CommonRelationsMediaPreparation`: gerçek canlı branded trace/job/audio-request ve mevcut editör view.
4. `createGrade6CommonRelationsScenePlan`: özgün canlı trace/job audit'i, kanonik kaynak/preparation yeniden kurulumu ve tam eşitlik kapısı.
5. `renderGrade6CommonRelationsCaptionFrame(scenePlan,{})` ve `renderGrade6CommonRelationsReview(scenePlan,{})`.

Frozen dönüş tam dokuz alanlıdır:

```js
{
  schemaVersion: 'grade6-common-relations-factory-preparation/v1',
  state: 'editor_factory_preparation',
  draft, verification, preparation, scenePlan,
  initialFrame, initialReview, manifest
}
```

`initialFrame` gerçek `{frame,narrationPacket}` wrapper'ıdır. `initialReview.html` normal fabrikaya taşınabilecek **yalnız varsayılan güncel adım** önizlemesidir: repeat/goal/cue0/page0/progress0/revealfalse. Verilen zaman çizelgesi ve tablo matematiksel cevabı türetilebilir kılar; presentation lock anti-cheat/auth değildir.

Tam dönüş ise cevap anahtarı, tam yollar/transcript'ler ve kapalı çözüm details içeren **answer-bearing editör artefaktıdır**; öğrenciye verilemez. JSON/structuredClone canlı trace/job/scene markalarını taşımaz. Gerçek downstream audit/render consumer'larında kopyaları reddedildi; audit hash'i issuance/auth/insan karar store'u değildir.

## Manifest, Birimler Ve Sayaçlar

Manifest schema `grade6-common-relations-factory-manifest/v1`, state `editor_factory_preparation`. `sourceLineage` üç metadata/kaynak pinini korur; `bindings` draft/task, verification JSON, preparation, iki context trace/job/request, scene/geometry, default frame/SVG/narration/selected-page ve review/HTML hashlerini bağlar. `componentBytes` altı gerçek bileşenin compact JSON boyutunu, raw HTML ve SVG UTF-8 boyutunu verir. `current` yalnız cursor/kapı metadata'sı; **manifest transcript text içermez**.

Manifest içeriği için ayrı domain digest vardır. Packet compact JSON SHA başka byte tanığıdır; bunlar birbirinin yerine kullanılamaz. CLI disk byte'ları, newline eklenmesi veya farklı JSON serileştirmesi nedeniyle bu compact/newline'sız ölçümle eşit sayılmaz; IO writer bunları ayrıca ölçüp sınırlamalıdır.

Sayaçlar **retained output artefaktlarını** anlatır, scene'in iç kanonik yeniden kurma/audit invocation sayısını değil:

```text
existingAuthoredDrafts1 · contextNarrationJobs2
newAuthoredQuestions0 · acceptedProductQuestions0 · publishedQuestions0
```

İki bağlam/20 cue/49 caption sayfası iki soru veya49 yeni stok değildir. Tekrarlı çağrı aynı sabit görevi yeniden hazırlar; accepted/published artmaz. Generic resolver false kalır; dış manifest specializedScenePrepared/specializedInitialFrameRendered true der. Nested kanonik preparation'ın generic pending/frames0 snapshot'ı değiştirilmez. Yeni özel scene desteği genel geometri desteği diye sunulmaz; transferin kendi şekli hâlâ yoktur.

Bağımsız literal tanıklar: pozitif ortak zamanlar `[24,48]` dakika;0 hariç48 dahil; ortak kalansız boyutlar `[1,2,3,4,6,12]` kart/paket;6 kart/paket için iki türün paket adetleri `[4,6]` paket. Generic trace numericStepsChecked0/semanticReview pending kalır. Görev verilmiş kanıtı eşleştirme/yorumlamadır; öğrencinin liste kurması/ustalık/zekâ/kariyer ölçümü değildir. Her iki tam gerekçe yolu, dört koşullu not alanı ve üç karşı örnek aktarımı korunur.

## TDD Ve Taze Dar Doğrulama

TDD SKILL.md, writing-good-tests.md ve verification-before-completion tamamen doğrudan okundu. Implementation'dan önce yazılan consumer dinamik import'ta yalnız missing-module durumunu `{}` yapıp gerçek export assertion'ını çalıştırdı:

- İlk komut `node --test test/grade6_common_relations_factory_preparation.test.mjs`: **0/13 PASS,13 FAIL,0 skip,exit1**. Ana neden `common-relations factory preparation API is missing`; import crash değil. Negatif predicate'lerin bu aşamadaki hatası da eksik API assertion'ıydı. Bu, her devralınmış kaynak/reveal koruması için yeni ayrı bug-RED yapılmış demek değildir.
- Minimal wrapper sonrasında aynı komut **13/13 PASS,fail/skip/cancel/todo0,exit0**.
- Yeni modül/test için ayrı `node --check`: exit0.
- Aşağıdaki yedi related suite **99/99 PASS,fail/skip/cancel/todo0,exit0**. Bu sayı yalnız dar içerik zinciri; genel sistem/test/native/SQL başarısı değildir.

```sh
node --check packages/content-factory/grade6_common_relations_factory_preparation.mjs
node --check test/grade6_common_relations_factory_preparation.test.mjs
node --test test/grade6_common_relations_factory_preparation.test.mjs
node --test test/grade6_common_relations_factory_preparation.test.mjs test/grade6_common_relations_media_adapter.test.mjs test/grade6_common_relations_scene.test.mjs test/grade6_common_relations_review.test.mjs test/grade6_common_relations_draft.test.mjs test/grade6_common_relations_editor_view.test.mjs test/grade6_common_relations_application_observations.test.mjs
```

Yeni testler actual API ve real old consumer'ları kullanır; model/renderer/framework doubles yok. Literal oracle/satırlar/16 timeline markı, mevcut generic typed ret, korunmuş iki path/üç transfer, varsayılan current HTML/future yokluğu, protected dört kind'in false/half/near-one locks, transfer pending, manifest hash/bytes/bounds, clone-brand ret, arity/closed source/pin-rehash, getter/proxy/revoked/hook0, hidden/symbol/cycle/sparse/key/depth/array/value bütçeleri ve immutability ölçülür. CSS/prose/page-count snapshot'ı kabul testi yapılmadı. Child kapıların önceki testleri yeniden çalıştı; yeni human/native/kurum kabulü üretilmedi.

## Gerçek Bounded Snapshot Ölçümü

Mevcut üç metadata snapshot'ıyla ayrı in-memory pure çalışma: tek packet121.996B, manifest5.571B, current HTML9.649B. Tüm20 cue'nun gerçek frame paginator'ı ile49 current sayfa tekrar ölçüldü; bu observation yeni kaynak veya video değildir. Bir sonraki narration revision'da sayfa/hash/boyut değişebilir.

| Byte/kimlik tanığı | SHA-256/domain digest |
| --- | --- |
| Compact packet JSON121.996B | `3f8b5eee96c0e0827a0813df55f95fffa3ea6e5db38a9b1bfd073db2c0fa2991` |
| Manifest5.571B domain digest | `3f7479ef2620a3e5dbea8d18dfcffd4be3cb53537d2f6d681c971b38f5d80ce0` |
| Raw current HTML9.649B | `26749f591b71ac2397e4854d6d1631f4db2954dc56afbc2b17e7e2b087620686` |

Component compact JSON byte'ları: draft9.076, verification1.698, preparation75.183, scenePlan3.613, initialFrame12.585, initialReview14.069; raw frame SVG5.130B. API final packet≤512KiB, HTML≤64KiB, manifest≤16KiB guard'ları uygular. Yalnız fixed/pinned destekli revizyonun gerçek within-budget tanığı vardır; mevcut kapalı tek kaynak profilinden output overflow'a erişilemedi, sahte büyük fixture'la branch pass iddiası yok. Input overflow negatifleri gerçekten ölçüldü.

Module9.931B SHA `53477bacf465c209fb5d4d53a74181bf3166f98e79f6102132007c7ea0608b78`; test20.804B SHA `4572e3d3a5efe1ffd025dc941ad117f902a9169082b84a69baae77267565a1f5`. Son freeze sonrası root/başka reviewer'ın bağımsız incelemesi ayrı tanıktır; henüz yapılmış sayılmadı.

## Açık Kabul Kapıları

Altı gate pending; humanApproval null, learner/publication/production false. Default provider null; audio-request providerCallsAllowed false; TTS/provider/audio/video0. Source metadata pinleri yeni PDF byte doğrulaması veya ticari hak değildir. Aktif okul/yıl/program, pedagojik yaş/dil/alan uzmanı, zorluk/answer/benzerlik/hak, native glyph/erişilebilirlik, DAMA owner/steward/purpose/access/retention ve trusted karar store'u açık.

CLI dispatch/exclusive0700/0600 dosya IO, auth/tenant/analitik, new selected-provider voice-job bridge, gerçek TTS baytı/decode/dinleme, word-pen senkronu/MP4, transfer geometrisi ve genel resolver desteği bu API'nin kabulü değildir. Yeni provider/ağ/DB/Docker/browser/Drive/.env/credential/SDK/Git işlemi veya36.000 üretim/yayın/otomasyon açma yok. CMMI/SPICE/DAMA/MEB sertifika iddiası yok.
