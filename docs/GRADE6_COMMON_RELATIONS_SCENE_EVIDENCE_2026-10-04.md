# Ortak ilişkiler: Yerel, current-cue sahne ve caption kanıtı

Tarih: 2026-10-04. Durum: **Bir mevcut editör taslağının iki bağlamından, canlı yetenek işaretli ayrı bir yerel scene planı ve gerçek current-cue SVG/caption paketleri üretildi. Ses, video, öğrenci teslimatı, uzman kabulü veya yayın değildir.**

Bu dilim genel dikdörtgen geometry resolver'ını genişletmez. Önceki genel resolver bu soru ailesini hâlâ desteklemez. Yeni kapalı common-relations scene, mevcut gerçek markalı trace/job'ları tüketir ve genel caption paginator'ını gerçekten kullanır; yeni capability yalnız bu kendi veri-türevi gösterimi içindir.

## Sahiplik ve API

Yazar yalnız üç yeni dosyaya sahipti:

- `packages/media/grade6_common_relations_scene.mjs`
- `test/grade6_common_relations_scene.test.mjs`
- Bu kanıt belgesi.

Kaynak gözlemleri, eski taslak/verifier, medya adapter'ı, genel trace/job/geometry/scene/paginator, CLI, ortak dokümanlar ve Git değiştirilmedi. Ana ajan CLI bağlantısını ve gerçek native raster/tarayıcı incelemesini ayrı sahiplenir. Bu belge o incelemelerin gerçekleştiğini iddia etmez.

```js
createGrade6CommonRelationsScenePlan({ source, sourceBindingInput, preparation })
renderGrade6CommonRelationsCaptionFrame(livePlan, options)
```

İlk fonksiyon tam bir argüman ve tam üç alan ister. `source`, gerçek eski kanonik draft kaydı; `sourceBindingInput`, mevcut tam `applicationObservations`, `semanticMatrix`, `sourceRecord` input'u; `preparation`, gerçek Phase16 oluşturucusunun canlı trace/job'ları içeren çıktısıdır. Snapshot/hash veya çağıran `approved` alanı canlı yetenek işareti değildir.

İkinci fonksiyon tam iki argüman ister. `options` zorunlu inert record'dur; yalnız aşağıdaki alanlar isteğe bağlıdır:

| Alan | Varsayılan | Kabul sınırı |
| --- | --- | --- |
| contextId | repeat | repeat veya grouping |
| cueIndex | 0 | Tamsayı, seçilen bağlamda 0–9 |
| progress | 0 | Sonlu sayı, 0–1 |
| reveal | false | Boolean |
| pageIndex | 0 | Tamsayı, 0–31 ve gerçek cue sayfa aralığında |

Null, eksik zorunlu argüman, fazla argüman, gizli/symbol key, sparse array, coercion veya bilinmeyen seçenek kabul edilmez. `-0`, cue/page/progress metadata'sında `0` olarak kanonikleştirilir; eşdeğer seçim ayrı hash üretmez. Range clamp, sayısal string dönüşümü veya yanlış bağlama fallback yoktur.

Sabit, payload yansıtmayan hata kodları: `invalid_common_relations_scene_arguments`, `invalid_common_relations_scene_input`, `invalid_common_relations_frame_arguments`, `untrusted_common_relations_scene_plan`, `invalid_common_relations_frame_options`, `common_relations_frame_output_budget`.

## Gerçek çağrı zinciri ve güven sınırı

```text
Descriptor/proxy/bütçe kapısı → inert snapshot
→ özgün nesnelerde auditReasonedTeachingTrace + auditReasonedMediaJob
→ verifyGrade6CommonRelationsDraft(snapshot, sourceBindingSnapshot)
→ createGrade6CommonRelationsDraft(sourceBindingSnapshot)
→ createGrade6CommonRelationsMediaPreparation(canonicalDraft, sourceBindingSnapshot)
→ tam kanonik draft + preparation snapshot eşitliği
→ private WeakMap kaynağı + ayrı canlı WeakSet scene planı

render(current options)
→ canlı plan + kapalı primitive options kapısı
→ private kanonik job'ın yalnız current cue'su
→ protected response presentation gate
→ paginateReasonedCaptionText(current text)
→ seçilen sayfa + kendi veri-türevi SVG + current-cue narration packet
```

Canlı trace/job audit'i snapshot clone üzerinde yapılmaz: önce inert kontrol, sonra özgün obje üzerinde mevcut gerçek audit yapılır. Clone preparation, aynı hashleri taşısa da bu aşamayı geçmez. Sahne verilen source ve preparation'ı tam kanonik yeniden üretimle karşılaştırır. Sonra çağıranın nesneleri yeniden okunmaz; yalnız yeniden kurulmuş private canonical kaynak kullanılır.

Scene planı dondurulur ve özel WeakSet/WeakMap'e bağlanır. JSON/structuredClone veya rehash bu render yeteneğini yeniden üretmez. Ayrı sahne, genel `renderReasonedCaptionFrame` için eski generic scene markası değildir; gerçek generic renderer bu planı reddeder. Bu in-memory yetenek işareti kullanıcı kimlik doğrulaması veya production authorization değildir.

## Kamuya açık plan ve current paketler

Plan `grade6-common-relations-scene-plan/v1`, durum `common_relations_scene_plan_draft` taşır. Açık alanları source/task/metadata SHA'ları, preparation SHA'sı, iki context için trace/job id+SHA ve request SHA, cue sayıları, gerçek birimler, verilen geometry, geometry SHA ve pending/readiness alanlarıdır. Full preparation, source input, explanation paths, cevap anahtarı veya future transcript'ler plan içinde bulunmaz. Private closure bunları tutar; JSON aktarımı closure'ı taşımaz.

Render sonucu iç içe dondurulmuş `{ frame, narrationPacket }` nesnesidir:

- `frame`: gerçek SVG, SVG SHA, source/trace/job/scene/preparation/geometry bağları, current cue/kind/progress/reveal, yalnız seçilen caption sayfası+SHA, açık izin verilmişse current transcript SHA, programmatic highlight ve pending durumları.
- `narrationPacket`: yalnız current cue'nun düz metni veya kilitliyse null; aynı current cue'nun bütün sayfaları ve paging SHA; frame/SVG SHA'larına bağlı ayrı editör seslendirme taslağıdır.

Bir cue'nun bütün caption sayfaları packet içinde bulunabilir; sonraki cue veya bütün bağlamın transcript'i bulunmaz. SVG, title, desc ve aria-label yalnız seçilen current sayfa metnini kullanır. `contentFormat: plain_text_textContent_only`; packet düz metni HTML olarak çalıştırma talimatı değildir. Mevcut genel paginator'a gerçek çağrı yapılır; text/page SHA'ları gerçek aynı cue metni üzerinden gelir.

## İki özgün veri-türevi temsil ve birimler

Gösterimler eski HTML'den regex ile çıkarılmış SVG veya MEB PDF crop'u değildir. Kanonik özgün draft sayıları doğrudan kullanılarak kendi timeline/table SVG primitive'leri üretilir. `sourceDiagramOrigin: canonical_own_authored_draft_not_source_pdf`; `frameRepresentation: specialized_common_relations_data_derived_svg_not_original_svg_embedding`.

| Bağlam | Gerçek temsil | Matematik/birim |
| --- | --- | --- |
| repeat | 6 dakikalık daire işaretleri ve 8 dakikalık kare işaretleri, 0–48 zaman şeridi | Ortak pozitif dakika işaretleri 24, 48; 0 dışarıda, 48 içeride |
| grouping | Altı literal satır, kart/paket boyutu ile 24 ve 36 kartın ayrı paket adetleri | Boyutlar 1, 2, 3, 4, 6, 12 kart/paket; paket adetleri ayrı sütunlar |

Zaman şeridinde 16 gerçek mark vardır: dairelerde `[0,6,12,18,24,30,36,42,48]`, karelerde `[0,8,16,24,32,40,48]`. Ortak `x = 120 + minute×12` koordinatı her iki seride kullanılır. Start markları boş/kesik ve `data-in-window=false`; pozitif 48 markları içeridedir. Ayrı shape ve literal label renk dışında da seriyi ayırır.

Tablonun gerçek satırları, soldan boyut ve iki ayrı paket adedi olarak şöyledir:

| Kart/paket | 24 karttan paket | 36 karttan paket |
| --- | --- | --- |
| 1 | 24 | 36 |
| 2 | 12 | 18 |
| 3 | 8 | 12 |
| 4 | 6 | 9 |
| 6 | 4 | 6 |
| 12 | 2 | 3 |

Bu değerler eski gerçek bağımsız modulo verifier'ının kanonik sonuçlarına bağlıdır. Genel text trace matematik oracle'ı değildir: **numericStepsChecked 0 ve semanticReview pending** kalır. Dakika veya kart/paket, legacy count/cm/unitless diye yeniden etiketlenmez. Bu sahne MAT.6.1.4 resmî onayı, tüm kazanım kapsamı veya öğrencinin kendi liste/açıklamasını ürettiğine dair kanıt değildir.

## Gerekçe bölgesi ve sonuç kilidi

Highlight kaynak geometrisini her cue'da körlemesine sonuca bağlamaz:

| Current cue | Vurgulanan bölge |
| --- | --- |
| goal, evidence, plan | Verilen sayılar/sınır: zaman penceresi veya iki kart sütununun verilen başlığı |
| why, check_prompt | İşlemin amacı: iki tekrar serisinin tüm ilgili bölgesi veya paket tablosunun başlık bölgesi |
| result, check_answer, summary | Yalnız açık reveal=true ve progress=1 sonrasında kanonik ortak marklar etrafında dört ayrı küçük kapalı loop / geçerli tablo satırları |
| transfer_prompt, transfer_answer | Yeni transfer geometry yok; boş path/pen ve açık pending gösterim |

Korunan dört kind: `result`, `check_answer`, `summary`, `transfer_answer`. İki şarttan herhangi biri yokken current cevap transcript'i, transcript SHA'sı, sonuç metadata'sı ve answer-specific highlight verilmez. Title/desc/aria/selected-page/paging yalnız sabit güvenli kilit notice'u taşır. Page sayısı o notice için birdir; future cevap sayfa sayısı da yansıtılmaz. Doğru evidence-card kimliği veya matching answer, erken cue metadata/markup'ında yayınlanmaz.

**Bu presentation gate anti-cheat veya öğrenci güvenliği değildir.** Verilen timeline'daki ortak marklar ve verilen tablonun satırları matematiksel cevabı çıkarmaya zaten imkân verir. Bu dürüst sınır plan/frame/packet'te `inferredAnswerProtection: false` olarak açıktır. Yetkili öğrenci/öğretmen teslimat resolver'ı yoktur.

Transfer anlatımı current cue metni olarak kalabilir; transferin kendi kanıt geometrisi kaynak taslakta olmadığı için bütün progress/reveal durumlarında `sourceDiagramProof: false`, `sourceVisualId: null`, `representationStatus: transfer_geometry_not_in_source_pending`, boş highlight/pen kalır. Eski çizelge/tablo yeni problem şekli diye yeniden kullanılmaz.

`sourceDiagramProof: true` kalan iki gösterim için yalnız **kanonik kendi authored draft'ının** veri-türevi gösterimi anlamına gelir; MEB kaynak PDF geometrisinin kimlik/doğruluk/kopya izni veya uzman pedagojik onayı değildir.

### Native bulgunun dar geometri düzeltmesi

Ana ajanın açılmış repeat-result SVG incelemesi gerçek bir kusur buldu: ilk iki dikey sonuç path'i x408/696 üzerinde y48'den172'ye uzanıyor, kaynak sayı label baseline'ları y104/y172'yi kesiyordu; pen alt etiketin üzerine biniyordu. Systematic-debugging becerisi tamamen yeniden okundu, native bulgu emitted layout'a izlenerek kök neden doğrulandı. Bu belge bağımsız yazarın görüntüyü/native font bbox'unu yeniden ölçtüğünü iddia etmez.

Yeni test, emitted numeric label baseline'larından türeyen **muhafazakâr layout bantları** `[86,108.5]` ve `[154,176.5]` içinde sonuç stroke'u/pen olmadığına bakar. Stroke için ±1.5, pen için merkezden −13/+4 pay sayılır; bu bir native glyph-fit sertifikası değildir. Doğrudan source marklarını çevreleyen dört kapalı loop merkezleri `(408,70)`, `(408,138)`, `(696,70)`, `(696,138)` oldu. 24 ve48 sonucu, kaynak/verifier/preparation/trace/job, API, birimler ve reveal kilidi değiştirilmedi. Tamamlanmış path uzunluğu384 SVG unit; pen son loop başlangıcı `(684,126)` noktasına bağlıdır. Label'ın üzerinden bağlantı çizilmez. Native görsel kontrolün tekrarını ana ajan ayrı yapmalıdır.

Mevcut generic result narration'ın 24/48 sayısını yakın ardışık cümlelerde tekrarlaması **açık pedagojik/premium anlatım borcudur**. Bu scene geometri düzeltmesi metin adapter'ını değiştirmedi; doğal hitabet, gereksiz tekrar ve gerçek ses üslubu kabul edilmiş değildir.

## Kalem, caption ve yerleşim sınırı

Path'ler programmatic polyline'dır. `progress` toplam path uzunluğunun çizilmiş payını belirler; pen ucu çizilen son point'te bulunur. Yarım progress gerçek yarım çizim uzunluğu verir. Bu bir insan elinin yazısı, handwriting modeli, oynatılmış animasyon, ses hizası veya gerçek video değildir. `penMeaning: programmatic_highlight_not_human_handwriting`, `wordPenAlignmentVerified: false`.

Her source text ve caption `font-size=18` SVG unit kullanır. SVG width 760; repeat frame height 376, grouping 416, transfer 186 SVG unit'dir. Current caption için iki satır ayrılır, mevcut paginator sınırı satırda 62 UTF-16 code unit'dir. Ölçüm gerçek font glyph width değildir. Tam current transcript, line-span separator'larıyla kayıpsız yeniden kurulur; sayfa değiştirme sözcük kısaltma veya title case uygulamaz.

Genel paginator'ın unit atom kuralları burada yeni dakika/kart-paket birimleri için genişletilmedi. `newUnitAtomsVerified: false`, `glyphFitVerified: false`, `measurement: utf16_code_units_not_rendered_glyph_width`. Yeni birim atomlarının satır sınırında birleşik kaldığı, native fontta hiçbir metnin taştığı/çakıştığı, mobilde 18 CSS px görüldüğü veya erişilebilirlik/premium tasarım kabulü yapıldığı iddia edilmez. SVG ölçeklemesi bu modülün dışında; `geometryRescaled: false` yalnız emitted SVG'ye ilişkindir. Ana ajan native raster/tarayıcı kanıtını ayrıca toplar.

## Kapalı bütçeler ve pasif içerik

Descriptor-only copy'nin sınırları: 50.000 node, depth 24, array length 512; record başına 128 own key, array'de length dahil 513; key başına 256 UTF-8 byte ve control character yok; string length 65.536; key+value toplam UTF-8 bütçesi 2 MiB; sayılar sonlu ve mutlak değer ≤1e9. Record/prototype yalnız plain/null; array yalnız gerçek Array prototype. Proxy/revoked proxy ilk kapıda reddedilir; accessor/hidden/symbol/sparse/cycle/function/foreign prototype/coercion çalıştırılmaz. Key count kontrolü descriptor map üretilmeden önce yapılır.

Kanonik plan JSON ≤16 KiB; SVG ≤64 KiB; frame+narration JSON ≤128 KiB. Bütçeyi seçenekle artırmak mümkün değildir. Key cap savunma-derinliği düzeltmesidir: bilinmeyen büyük key'ler önce de closed schema tarafından reddediliyordu. Aşağıdaki kayıt bunu sahte RED olarak sunmaz; üst bütçe ve erken kaynak sınırı eklendi.

SVG yalnız kendi primitive'lerini, escaped current text'i ve local shape'leri taşır. Script/style/image/use/foreignObject/iframe/audio/video, event handler, href/xlink/src, ENTITY/DOCTYPE/url, dış font/resource ve duplicate IDREF kanalını içermez. Title/desc birer tane ve kendi aria-label'i vardır; belge dışı ID çözümlemesi gerektirmez. Kullanıcı metni SVG primitive/path/caption seçtiremez.

## Gerçek test kronolojisi

1. Implementation yokken testler yazıldı. İlk 18 test eksik API assertion'ıyla reddedildi; `-0` regression'ı implementation öncesi eklenip tam çıktı yeniden okunarak **0/19 PASS, 19 FAIL, 0 skip** ve `common-relations scene is missing` gözlendi.
2. İlk implementation'da **2/19 PASS, 17 FAIL** görüldü. Gerçek hata `grouping.materialCounts is not iterable` idi. Systematic-debugging ile üretici kanonik draft'ın gerçek `itemCounts` alanı okundu; yalnız yanlış alan adı düzeltildi. Sonra **19/19 PASS, 0 skip**.
3. Key uzunluğu/sayısı/UTF-8 tanıkları testlere eklendi: önce de closed schema reddiyle **20/20 PASS**. Ayrı key cap+aggregate key-byte guard savunma-derinliği olarak eklendi; ardından yine **20/20 PASS**. Bu adım yeni davranışsal RED iddiası değildir.
4. İlk kod/test freeze'ında module syntax check exit0; scene+medya adapter+draft+editor view+application observations+root CLI+generic caption pages koşusu **104/104 PASS, 0 FAIL, 0 skip**, exit0 verdi. Bu native bulgu öncesinin tarihsel sonucu, visual acceptance değildir.
5. Native stroke-label bulgusu için yeni regression önce **20 PASS /1 FAIL**, `result stroke crosses a number-label band` ve exit1 verdi. Tek dar geometri düzeltmesi ve eski primitive sayımının iki bağlantıdan dört yerel loop'a uyarlanmasından sonra **21/21 PASS, 0 skip**. Aynı birleşik taze komut yeniden çalıştırılıp **105/105 PASS, 0 FAIL, 0 skip**, exit0 görüldü.

Son taze komutlar:

```sh
node --check packages/media/grade6_common_relations_scene.mjs
node --test test/grade6_common_relations_scene.test.mjs
node --test test/grade6_common_relations_scene.test.mjs test/grade6_common_relations_media_adapter.test.mjs test/grade6_common_relations_draft.test.mjs test/grade6_common_relations_editor_view.test.mjs test/grade6_common_relations_application_observations.test.mjs test/grade6_reference_authoring_cli.test.mjs test/reasoned_caption_pages.test.mjs
```

Scene testleri gerçek emitted SVG literal sayı/cell/shape'leri, source binding ve current cue packet'lerini ölçer; CSS/prose change detector değildir. Testler 40 locked response kombinasyonunu ve 8 açık protected cue'yu, 20 current cue'nun bütün 47 gerçek sayfasını, 24 transfer progress/reveal kombinasyonunu doğrular. Ek regresyon result/check_answer/summary kind'lerinin her birinde label-band/stroke/pen ayrımını ve dört doğru markı çevreleyen kapalı loop'u ölçer. Klon/rehashed/fake/generic markaları, source/purpose/gates/key/units değişiklikleri, arity, hostile getters/proxies/revoked/cycles/sparse/depth/bytes/hiddenkeys/coercion ve options range/page sınırları reddedilir. Hook sayaçları sıfırdır. Doğru giriş clone'ı kanonik doğrulamadan sonra yerel yeni source/plan üretimi için kullanılabilir; onay aktarmaz.

## Tekrarlanabilir mevcut çıktı ölçümleri

Bu ölçümler provider/DB/browser çağrısı olmadan gerçek kanonik metadata → eski draft → eski medya preparation → yeni scene → bütün current-cue frame çağrılarıyla toplandı. İki bağlam tek mevcut editör taslağıdır; yeni soru stokuna sayılmaz.

| Artifact | UTF-8 byte | SHA-256 / domain digest |
| --- | --- | --- |
| Public plan JSON | 3.613 | JSON bytes `a31049605fe6f20400d8534241b3861adcf0231fafa42b6fb9a05e38887a136c` |
| Plan content | — | `9ea34deb3996b6ebbe9a9326d3827a2fb3c0a871f67120f21668aaa104c7ad76` |
| Given geometry JSON | — | `e6e6c626da7bce917f6f03c07e35d7bd63406e49321479a6f872ca9f441d4da7` |
| Varsayılan repeat/goal SVG | 5.130 | `d58038bd4d34c068db876333c19146709421a57809ace38bae9b10170fa68b7b` |
| Varsayılan frame content | — | `13b5e8a345902a0722127c6973cb471c4f38266b67f0240937efad25f40d7acf` |
| Varsayılan narration content | — | `60a60d098340ce75cca5276e559e537fc7c2b8df36770945f711f02865b417da` |
| Varsayılan `{frame,narrationPacket}` JSON | 12.585 | JSON bytes `ef67e6d5ee3476f9f1018a75815413a56e89aa65947f3c50575c2fdb97086566` |

`contentSha256` alanları domain-separated hash'lerdir; whole serialized byte hash ile aynı şey diye sunulmaz. Page+geometry+SVG hashleri ise belgelenen JSON/string bytes üzerinden gelir. Farklı hashler aktarıma veya insan onayına yetki vermez.

Native geometri düzeltmesinden sonra 47 current cue sayfasının tamamında en büyük SVG **6.062 byte**; en büyük frame+packet **15.799 byte** yeniden ölçüldü. İlk freeze ölçümleri 5.702/15.149 byte idi; yeniden ölçüm eski sınırlar içine kalır. Public plan ve varsayılan goal SVG/packet hashleri değişmedi. Açılmış repeat/result SVG 6.046 byte ve SHA `40f36374071304afc9321e5af9bf0e1544f257d0b9f2ed61ff7641c0b258aa44`; frame content SHA `1f04fb7481879e49e368efe7280665bac6d01bfeadbbcb410b816736482695fe`. Tekrar bağlamının cue sayfa sayıları sırasıyla `[1,2,6,1,1,1,2,5,1,4]`; paket bağlamının `[2,1,7,1,1,1,2,5,1,2]`. Bu süre/audio frame oranı değildir.

Kanonik eski source draft SHA `9c225c8f2bc97dfae1d89778cda3ff5980f0c31056330c639e5be15823d2abd7`; task SHA `c20e190e87945d6a79140819490ab09e55342a5a988eae9df5a95e0054ee6aeb`; preparation SHA `37a21884435691ac17054ca65c8c4e2002531668fc309471a96e06c9f4cd260e` aynen bağlanır. MAT.6.1.4 **proposed** bağı ayrı, resmî/human-approved binding null ve altı eski kapı pending kalır. Mevcut source artifact'ın `rendered:false` alanı değiştirilmedi; yeni scene'in gerçekten SVG üretebilmesi eski kaydı yeniden etiketlemez.

Koddaki `freshPdfByteChecks:0`: mevcut üç tam metaveri snapshot pin'i ve source PDF SHA deklarasyonu doğrulanır, PDF bu fazda yeniden indirilmedi/semantik incelenmedi. Rights/owner/steward/retention kararı bu hash karşılaştırmasından çıkmaz.

## Freeze ve açık kalan kapılar

Kod/test freeze:

| Dosya | Byte | SHA-256 |
| --- | --- | --- |
| packages/media/grade6_common_relations_scene.mjs | 21.300 | `c8608c6cdb231b248f1df770ce19e018c1822082d7e55685f772c75196c36bb3` |
| test/grade6_common_relations_scene.test.mjs | 29.479 | `d0f621fd5386f384a32ed4691fe30f4a356154cfbb51c6c3bacbd524fe78a015` |

Her plan/frame/packet'te publicationReady, learnerReady, productionReady, teacherApproved, audioGenerated, videoRendered, wordPenAlignmentVerified ve accessibilityPassed false; providerCallsMade0, humanApproval null, learnerEvidenceCollected false kalır. Counts: mevcut authored draft1, yeni soru0, kabul0, yayın0. Caption pagination/SVG render/hashes de bu kapıları açmaz.

Henüz yapılmayanlar: native glyph/font/overflow ve mobile/tablet raster incelemesi; screen-reader/erişilebilirlik kabulü; transfer için yeni doğru geometry; yeni dakika/kart-paket atomlarının paginator desteği; gerçek audio/voice/hitabet ve kelime-pen hizası; playable video/codec/duration; öğretmen/alan/yaş ve haklar/DAMA resolver kabulü; authenticated öğrenci teslimatı; learning/analytics/ustalık/psikometri kanıtı. Bu küçük yerel dilim CMMI/SPICE sertifikasyonu, bütün müfredat veya 36.000 kabul edilmiş soru bankası değildir.
