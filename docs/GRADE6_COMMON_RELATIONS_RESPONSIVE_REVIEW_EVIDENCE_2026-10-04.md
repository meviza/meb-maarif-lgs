# Ortak ilişkiler: Dar responsive editör incelemesi

Tarih: 2026-10-04. Durum: **Canlı current-cue sahnesi tüketilerek ayrı HTML caption, kaydırılabilir kaynak gösterimi ve semantik verilen tablosu üretildi. Native mobil/glyph/erişilebilirlik kabulü, öğrenci teslimatı, ses/video veya yayın değildir.**

Bu dilim yeni soru/konu veya bütün platform UI'sı üretmez. Bir mevcut authored editör taslağının repeat/grouping bağlamları için tek seçilmiş anlatım adımını ve caption sayfasını statik HTML'ye bağlar. Geometri ile caption alanını birbirinden ayırma amaçlı küçük bir seam'dir.

## Sahiplik ve gerçek API

Yazar yalnız üç yeni dosyaya sahipti:

- `packages/media/grade6_common_relations_review.mjs`
- `test/grade6_common_relations_review.test.mjs`
- Bu kanıt belgesi.

Eski scene/draft/verifier/media adapter, kaynaklar, CLI, ortak dokümanlar, Git veya provider değişiklikleri bu yazarın kapsamında değildi. Ana ajan sabit CLI opt-in ve gerçek native tarayıcı/raster kontrolünü ayrıca sahiplenir. Paralel canonical anlatım değişiklikleri bu yeni modüle kopyalanmaz; gerçek canlı frame üzerinden tüketilir.

```js
renderGrade6CommonRelationsReview(livePlan, options)
```

Tam iki argüman zorunludur. `options` eski scene renderer'ın tam aynı kapalı beş primitive alanıdır: `contextId`, `cueIndex`, `progress`, `reveal`, `pageIndex`. Varsayılan `{}` → repeat, cue0, progress0, revealfalse, page0. Eksik/fazla argüman `invalid_common_relations_review_arguments`; scene input/option/brand reddi yalnız sabit `invalid_common_relations_review_input`; output bütçesi `common_relations_review_output_budget` verir. Hata source, transcript, hash veya payload'ı yansıtmaz.

Wrapper'ın **ilk gerçek input tüketicisi** `renderGrade6CommonRelationsCaptionFrame(plan, options)` olur. Clone, proxy/revoked proxy, getter, coercion, unknown/hidden key, null, aralık/page ve arity reddi eski canlı scene kapısından geçer. Wrapper kendi caller option'ını tekrar okumaz; gerçek dondurulmuş frame/packet'ten ve bu kapının kabul ettiği gerçek immutable plan'ın verilen geometrisinden çalışır. Arbitrary XML/SVG, source, provider, style, width, rol veya dosya yolu input'u yoktur.

Başarılı çıktı iç içe dondurulmuştur:

```js
{
  schemaVersion: 'grade6-common-relations-responsive-review/v1',
  state: 'editor_current_cue_review',
  html,
  manifest
}
```

HTML UTF-8 ≤64 KiB, manifest JSON ≤16 KiB. Caller seçenekleri bu sınırları artırmaz. `manifest` source/task/trace/job/scene/preparation/geometry/frame/SVG/current transcript hashleri, current context/cue/page/progress/reveal/kilit metadata'sı, literal birimler, crop/semantik eşdeğer durumları ve pending kapılarını taşır. **Transcript metni, answer/result listesi, future caption, full preparation veya bütün job/lesson planı manifest'e girmez.** Hashler serialize edilen kayda render, kullanıcı auth veya insan onayı yetkisi vermez.

## Caption ve kaynak geometri ayrımı

Statik belge `lang=tr`, viewport meta ve 18 CSS px temel yazı boyutu kullanır. Current caption gerçek `<p id="current-caption">` içinde **kaynak scroll bölgesinin dışında** bulunur; iki SVG satırının metni doğal HTML wrap ile gösterilir. `white-space:normal` ve `overflow-wrap:anywhere` uzun cümleleri, ekranı küçültmeden ve bütün sayfayı yatay kaydırmadan sarmayı amaçlar. Bu CSS kararı native computed/glyph/overflow kabul kanıtı değildir.

Desteklenen gösterim:

```text
Verilen gösterim section
  figure
    independent figcaption: kaynak sayıları/birimleri/sınırları
    named tabindex0 horizontal scroll region
      fixed760 × sourceHeight SVG viewport
    real canonical given table (HTML)

Ayrı güncel anlatım section
  adım/sayfa metadata + current kind başlığı
  yalnız selected-page HTML caption
  yalnız izin verilmiş current full transcript için kapalı details
```

Kaynak alanının role=region ve açık aria-label'i vardır; `tabindex=0` klavyeyle odaklanmasını sağlar. Geometri 760 SVG unit genişliğini korur; repeat source crop yüksekliği 260, grouping 300'dür. Kaydırma yalnız kaynak alanının içinde amaçlanır; caption dışarıda doğal sarılır. Semantic given table'ın kendi focusable, bağımsız etiketli role=region yatay scroll container'ı vardır. Kaynak ve tablo bölgeleri aynı görünür `geometry-scroll-hint` paragrafına `aria-describedby` ile bağlıdır: şekil/tabloyu sağa–sola kaydırma ve klavyedeki ok tuşlarına dair Türkçe ipucu gösterilir. Local IDREF tek görünür hint'e çözülür; caption scroll alanlarından bağımsızdır. Sayfanın 320/390/1440 px ekranlarda taşmadığı, fontların 18 CSS px kaldığı veya klavye/screen-reader/touch deneyiminin kabul edildiği bu yazar tarafından native ölçülmedi.

İpucu, ana ajanın ilk 320 px native viewport'unda yatay kaydırmanın ARIA etiketi dışında görünür açıklaması olmadığını bildirmesi üzerine eklendi. Eski template'te hint paragrafı ve tablonun focusable bölgesi yoktu; bu eksik davranış önce gerçek regression ile ölçüldü. Bu belge root'un daha sonra yaptığı native wheel/Arrow/tap ölçümünü veya touch swipe kabulünü peşinen ilan etmez. Görünür English “current-cue” bildirim cümlesi “güncel anlatım adımı” olarak prose netleştirmesiyle değiştirildi; bunun için sahte RED/test yazılmadı.

## Gerçek SVG tüketimi; arbitrary XML parse yok

SVG'nin gövdesi gerçek canlı scene renderer'ın döndürdüğü kendi kanonik SVG'den gelir. Wrapper yalnız bu güvenilen string'in sabit kökünü değiştiren küçük bir root transform yapar: width760, height/sourceHeight viewBox crop, `aria-hidden=true`, `focusable=false`. Caller XML parse etmez; kaynak gövdesi, marklar, tablo hücreleri ve source-bound/reveal-gated highlight aynen kalır. Scene'in eski caption alanı viewBox dışına crop edilir.

Bu embedded SVG **orijinal SVG'nin byte-identical kopyası değildir**: `geometryEmbedding: canonical_svg_root_crop_not_original_byte_identity`; orijinal frame SVG SHA ile transformed geometry SVG SHA ayrı tutulur. Rectangle background'un veya scene caption text'inin string içinde kalabilmesi current-cue dışında transcript eklemez. SVG aria-hidden olduğundan onun title/desc/current caption'ı AX'de ikinci bir anlatım alanı gibi sunulmaz. Bunun screen-reader'da doğru çalıştığının kabulü native QA'ya aittir.

SVG erişilebilir eşdeğeri mevcut verilenlerin gerçek semantik HTML tablosudur; geometri figure açıklaması current caption'dan bağımsızdır. `svgAccessibility: hidden_with_canonical_given_table_equivalent` tasarım yaklaşımının durum etiketidir, erişilebilirlik sertifikası değildir.

## Literal verilenler, matematik ve birimler

Repeat tablosu **başlangıç dahil bütün verilen markları** iki satırda gösterir:

| Seri | Dakika işaretleri |
| --- | --- |
| 6 dakika | 0, 6, 12, 18, 24, 30, 36, 42, 48 |
| 8 dakika | 0, 8, 16, 24, 32, 40, 48 |

Figure açıklaması dairelerin 6, karelerin 8 dakikalık seriler olduğunu; hedef pencerede 0 hariç, 48 dahil olduğunu açıklar. Gerçek SVG'de 9 daire+7 kare, toplam 16 mark korunur. Current result markları önceki label-band düzeltmesindeki küçük loop'larla gelir; wrapper yeni result path veya cevap işareti uydurmaz.

Grouping tablosunda üç nicelik karıştırılmaz:

| Boyut · Kart/paket | 24 kart · Paket | 36 kart · Paket |
| --- | --- | --- |
| 1 | 24 | 36 |
| 2 | 12 | 18 |
| 3 | 8 | 12 |
| 4 | 6 | 9 |
| 6 | 4 | 6 |
| 12 | 2 | 3 |

Türler karıştırılmaz, artan kart kalmaz; kart/paket boyutu ile paket adedi ayrı nicelikler olarak açıklanır. Current renderer'ın literalUnits alanı repeat'te `minute`; grouping'te `card_per_package`, `package` olarak korunur. count/cm/unitless yeniden etiketlemesi yoktur. Genel trace'nin **numericStepsChecked: 0**, semanticReview: pending ve generic geometry resolver'ın bu aileyi desteklememe sınırı değiştirilmez. Matematik eski source/verifier tarafından doğrulanır; bu HTML wrapper bağımsız oracle veya resmî MEB/öğretmen pedagojik kabulü değildir.

Verilen diagram/tablo sonucu matematiksel olarak çıkarmaya imkân verir. Bu nedenle `inferredAnswerProtection:false` ve görünür uyarı korunur; presentation gate anti-cheat/auth değildir.

## Current metin ve korunan yanıt

Wrapper selected page caption'ını eski frame'in **gerçek selectedPage** alanından alır. Yalnız bu adımın izinli full transcript'i başlangıçta kapalı `<details>` içinde yer alır; diğer cue'ların transcript/page/job nesneleri render edilmez. Kapalı details bir öğrenci güvenlik sınırı değildir: içerdiği izinli current metin HTML'de bulunur.

Korunan result/check_answer/summary/transfer_answer kind'lerinde eski `reveal=true && progress===1` şartı aynen uygulanır. Kilitli response'ta:

- Current caption eski güvenli notice'tur.
- Full current transcript null ve currentTranscriptSha256 null kalır.
- Current transcript details oluşturulmaz.
- Result, correct evidence-card veya future text metadata'sı eklenmez; pen/highlight eski renderer'ın kilitli çıktısıdır.

Wrapper full narration'ı alıp yeni bir reveal kararı vermez. Current yalnız current kind içindir; canonical “çözüm yolu” metni kendi içinde daha sonra kullanılan kısa why/check cümlesini tekrar edebilir. Bu, future cue projection değildir. Test current transcript fallback'ının **tam olarak** current job transcript'ine eşitliğini doğrular; başka cue metni zaten current metnin literal alt parçası değilse ayrıca yokluğunu ölçer. Paralel canonical narration güncellemeleri metin/hash/page sayısını değiştirebilir; wrapper bu güncel real frame'i tüketir, kendi copy/pin'iyle anlatımı dondurmaz.

Transfer kind'lerinde orijinal timeline/table yeni geometrik kanıt diye kullanılmaz: review SVG/table üretmez, açık HTML pending notice verir. `geometryRendered:false`, inlineSvgCount0, sourceDiagramProoffalse, sourceVisualIdnull ve transfer_geometry_not_in_source_pending korunur. Transfer current metni izin verilmişse gösterilebilir; şekil hâlâ pending'dir.

## Pasif doküman ve kalite kapıları

Belge yalnız local inline style ve kendi kanonik SVG primitive'lerini içerir. Script, dış font/resource, image/use/foreignObject/iframe/audio/video, form/input/button, href/src/xlink, event handler, ENTITY, url veya import yoktur. CSP default-src/script-src/connect-src/media-src/img-src/object-src none, inline style-only; sayfa ağ/provider çağrısı yapmaz. Current metin/başlık/kayıt kimliği HTML escape edilir; arbitrary caller metni render input'una ulaşmaz. Exact doküman/canonical SVG koşulları passive output tanıklarıyla doğrulanır, dependency/security sertifikası olarak sunulmaz.

Manifest count'ları mevcut authored draft 1, yeni soru 0, kabul 0, yayın 0. Altı eski kapı pending. learnerReady, productionReady, publicationReady, teacherApproved, accessibilityPassed, responsiveLayoutVerified, audioGenerated, videoRendered ve pageNavigationUiBound false; providerCallsMade: 0, serializedAuthority: none. İlk/current page seçimi programatik API'dedir; bu statik HTML'de ileri/geri kontrolü veya runtime navigation bağlanmadı. source draft rendered:false alanı değiştirilmedi.

## Gerçek TDD ve taze doğrulama

TDD ve writing-good-tests reference'ı, verification-before-completion tamamen doğrudan okundu. Testler implementation'dan önce yazıldı:

1. Eksik module/API ile `node --test test/grade6_common_relations_review.test.mjs`: **0/10 PASS, 10 FAIL, 0 skip**, exit1. Ana assertion `responsive common-relations review API is missing`; negatif çağrıların predicate'leri de eksik API assertion'ını aldı.
2. Minimal implementation sonrası **9/10 PASS**. Kalan hata “future transcript substring hiç bulunmamalı” test varsayımındaydı. Systematic-debugging tamamen yeniden okundu, actual canonical plan transcript'in 3 durumda kısa later why/check cümlesini zaten içerdiği doğrudan producer→current HTML sınırında teşhis edildi. Test, fallback paragrafının exact current transcript eşitliğine güçlendirildi ve yokluk beklentisi current'ın parçası olmayan future metne uygulandı. Production kodu bu yanlış-test düzeltmesinde değişmedi.
3. Taze aynı suite **10/10 PASS,0 skip**, exit0; module syntax check exit0.
4. Paralel güncel canonical narration üzerinden review+scene+root CLI yeniden çalıştırıldı: **42/42 PASS, 0 FAIL, 0 skip**, exit0. Bu sayım review 10 + scene 21 + CLI 11'dir. Root CLI'ın sabit yeni HTML opt-in dalı gerçek çalıştırılır; CLI testlerini ana ajan sahiplenir.
5. Native ilk dar viewport bulgusu için görünür scroll ipucu ve iki focusable region'ın IDREF ilişkisini ölçen yeni test önce **10 PASS /1 FAIL**, `visible horizontal-scroll guidance is missing`, exit1 verdi. Minimal template/focus fix ardından **11/11 PASS, 0 skip**. Aynı güncel canlı kaynakla sekiz related suite yeniden koşuldu: **119/119 PASS, 0 FAIL, 0 skip**, exit0; module syntax check exit0.

```sh
node --check packages/media/grade6_common_relations_review.mjs
node --test test/grade6_common_relations_review.test.mjs
node --test test/grade6_common_relations_review.test.mjs test/grade6_common_relations_scene.test.mjs test/grade6_reference_authoring_cli.test.mjs
node --test test/grade6_common_relations_review.test.mjs test/grade6_common_relations_scene.test.mjs test/grade6_common_relations_media_adapter.test.mjs test/grade6_common_relations_draft.test.mjs test/grade6_common_relations_editor_view.test.mjs test/grade6_common_relations_application_observations.test.mjs test/grade6_reference_authoring_cli.test.mjs test/reasoned_caption_pages.test.mjs
```

On bir test gerçek exported API, real source→draft→media→scene chain ve emitted dar HTML/SVG ağacını kullanır; framework/renderer mocks yoktur. Emitted literal tables/16 marks, caption region dışında olma, crop/aria-hidden, görünür hint'in iki focusable labelled region'la IDREF ilişkisi, source descriptions ve table units, 40 locked response durumları, bütün current cue sayfaları/fallback exact metni, transfer unsupported, live brand/clone/rehash, proxy/getter/revoked/coercion/arity/options-bounds, passive resource kanalları, byte/hash/freeze ve false readiness ölçülür. Hook sayaçları sıfırdır. CSS satırı, font/grid regex veya tam prose snapshot'ı davranış kabulü diye test edilmez.

## Mevcut canlı snapshot ölçümleri

Aşağıdaki gerçek ölçüm provider/DB/browser çağrısı olmadan mevcut üç kaynak metadata snapshot'ı→kanonik draft→güncel preparation→scene→review üzerinden alındı. Upstream güncel text revision'ın preparation SHA'sı `b182247ad5799dec161d14a8e564be47ce7d75e818f033d3e3f2a47a8d802fe5`, scene SHA'sı `f78086e9af4976688952053c611fdb0a25efc6b7e153e68477245367f3163891` idi. Önceki fazın 47 sayfa metriği bu güncel revision için kullanılmadı; gerçek 20 cue toplam **49 current sayfa** verdi.

| Mevcut varsayılan artifact | UTF-8 byte | SHA-256/domain digest |
| --- | --- | --- |
| Default HTML | 9.649 | `26749f591b71ac2397e4854d6d1631f4db2954dc56afbc2b17e7e2b087620686` |
| Default manifest JSON | 3.631 | content domain digest `13153bc6a20bf2db515cebed14532a7422382346ee0d02da1b73ae8cfae0a147` |
| Default whole output JSON | 14.069 | byte SHA `016789e87c60fd75f0d597f82010eb6c3dbe797cfb20337a018c490e573e489c` |

49 current sayfayı progress1/revealtrue ile gerçekten üretmede max HTML 11.128 byte, max manifest 3.666 byte ölçüldü. Bu taze ölçüm görünür hint/focusable tablo düzeltmesinden sonradır; ilk wrapper ölçümü 9.241 byte default HTML ve 10.720 byte max HTML idi. Bütün örnekler izin verilen 64/16 KiB sınırları içindedir. Bu ölçüm tüm hostile/native/font/tüm gelecek source revision kapsamının kanıtı değildir; output bütçeleri her render'da ayrıca uygulanır. Hashler içerik revision'ına bağlı olduğu için ileride kanonik narration değişince değişebilir; onay veya serialized yetki değildir.

## Frozen dosyalar ve pending işler

| Dosya | Byte | SHA-256 |
| --- | --- | --- |
| packages/media/grade6_common_relations_review.mjs | 10.966 | `e122e27a7fc771751fef99359497638ab679e90e5731cd3579f6dd6f1491cf53` |
| test/grade6_common_relations_review.test.mjs | 17.111 | `bd8127ad07d1f74b6f27d1645cc5e3cbae6a92c5a4fe4e263d427e2366433666` |

Pending: native responsive/font/overflow/crop ve screen-reader kontrolü; table/region mobil usability; gerçek öğrenci authentication/authorization ve delivery; teacher/age/rights/DAMA owner-steward-purpose-retention kabulü; yeni transfer geometry; yeni birim caption atomları; doğal ses/hitabet/kelime-pen/video üretimi ve hizası. Üretim analitik/ustalık/bilişsel/kariyer çıkarımı, resmî müfredat onayı, tüm kazanım kapsamı veya CMMI/SPICE sertifikasyonu yoktur. Native kontrolü ana ajan ayrı raporlayacak; test/mock/hash bu kabulün yerine geçmez.
