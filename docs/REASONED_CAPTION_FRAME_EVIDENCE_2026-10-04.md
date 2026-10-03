# Kaynak-bağlı görünür caption sayfası SVG dilimi

Tarih: 2026-10-04. Durum: saf, deterministik editor-review SVG/paket hazırlığı. Bu belge raster görünüm, gerçek ekran okuyucu uyumu, premium arayüz kabulü veya çözüm videosu kanıtı değildir.

## API ve kaynak otoritesi

```js
const { frame, narrationPacket } = renderReasonedCaptionFrame(liveScenePlan, {
  cueIndex, progress, reveal, pageIndex
});
```

Export `packages/media/reasoned_scene_renderer.mjs` içindedir. Yerel olarak branded ve immutable `createReasonedScenePlan({source,trace,job})` sonucu gerekir; plan oluşturma mevcut canonical source/trace/job resolver audit'ini yeniden uygular. Serileştirilmiş plan, frame, narration/caption paketi veya caller tarafından yeniden hesaplanan hash otorite kazanmaz.

Dört seçenek kapalı, own-enumerable data DTO alanlarıdır. Varsayılanlar cue 0, progress 0, reveal false, page 0'dır. Cue aralık içinde integer, progress sonlu 0–1, reveal boolean, pageIndex sonlu safe integer 0–31 olmalı ve mevcut cue'nun gerçek sayfa sayısına sığmalıdır. Clamping, coercion, custom caption/font/line budget, callback, approval ve timestamp seçenekleri yoktur. Getter, Proxy/revoked Proxy, özel prototype, cycle, symbol ve bilinmeyen alanlar reddedilir; input hook çalıştırılmaz.

`frame.svg` yalnız seçili sayfanın bir veya iki caption satırını taşır; `frame.selectedPage.lines/lineSpans`, pageIndex/pageCount, pagingSha256/selectedPageSha256, svgSha256/contentSha256 ve source/trace/job/geometrySha256/scenePlanSha256/cue/progress/reveal bağları bulunur. Frame bütün sayfaları veya tam anlatım metnini taşımaz.

`narrationPacket` ayrı editor-only plain-text pakettir: fullTranscript/fullTranscriptSha256, pages[].lines/lineSpans, paging/pagingSha256, aynı kaynak/cue/page bağları, frameSha256/frameSvgSha256 ve contentSha256. Spans/separatorAfter bütün current-cue canonical transcript'i kayıpsız yeniden oluşturur. Bu paket diğer cue'ların metnini, original SVG assetlerini veya ses zamanlarını içermez. Tam anlatım caption kısaltmasına feda edilmez; küçük caption sayfa değişimi ses hizalaması değildir.

## Görünür katman ve reveal sınırı

Mevcut private scene-context/source-layer/progressive path/pen modeli yeniden kullanılır. Gerçek source bounds, gap, koordinatlar, safeLayerSha256, sourceAssetSvgSha256 ve highlight path/pen çıktısı aynı cue/progress/reveal için eski renderer ile aynıdır. Original source SVG byte'ları plan assetlerinde korunur; cevap taşıyan original desc/metinler doğrudan visible frame'e embed edilmez. Temsil hâlâ `derived_safe_geometry_not_original_svg_embedding` durumudur; şekle fiziksel ölçek uydurulmaz.

Caption fontu 17 SVG birimi, satır aralığı 24, sabit iki satır rezervi ve kaynak yüksekliğine ek 138 birim kullanılır. Paragrafı sığdırmak için font/geometry ölçeği küçültülmez; ellipsis, hard token split, textLength/lengthAdjust veya crop uygulanmaz. Sabit garden kaynak alanı 1280×720, yeni frame 1280×858; standart rectangle 560×502, transfer fallback 560×208'dir. Bunlar intrinsic SVG boyutlarıdır; root raster helper kendi cap bütçesinde contain/scale uygular. Bu modül rasterizer veya disk/cache cap artırımı yapmaz.

62 UTF-16 code-unit sınırı **rendered glyph width garantisi değildir**. Bütün sözcükler, desteklenen sayı+birim/math atomları ve exact canonical casing/whitespace korunur; tek aşırı uzun atom/32 sayfa bütçesi fail-closed kalır. Garden'ın mevcut kaynak geometrisindeki boşluk/yerleşim ve premium okunabilirlik borcu çözülmüş sayılmaz. `caption_glyph_width_and_geometry_fit_review` ile navigation/accessibility ve raster/motion incelemeleri pending'dir.

Result/check_answer/summary/transfer_answer ancak açık reveal=true ve progress=1 birlikte sağlanırsa açılır. Aksi halde görünür sayfa yalnız güvenli placeholder'dır, fullTranscript/hash null'dır ve highlight yoktur. Kilitli placeholder'da olmayan bir pageIndex de reddedilir; ileride açılabilecek sayfa veya cevap sayısı bu yoldan görünür metne taşınmaz. Yeni caption frame ek compact-equation/üçüncü caption satırı üretmez.

Transfer cue'ları sourceDiagramProof=false, sourceVisualId=null ve `unsupported_new_geometry_pending` taşır. Yeni transfer şekli çizilmez; açık pending bildirimi boş source alanında görünür ve AX adına eklenir. Caption alanı yine seçili en çok iki satırdır.

SVG text/attribute içerikleri XML-escape edilir. `aria-label`, ID-free yerel title/desc yalnız current selected-page safe caption'ı kullanır; başka sayfa/tam anlatım/future response AX adına sızmaz. Yan yana farklı veya birebir duplicate frame'ler global ID/IDREF paylaşmaz. Bu intrinsic markup kanıtıdır; gerçek browser/assistive-technology kabulü değildir. Dış URL/hook/font/medya kaynağı oluşturulmaz; SVG namespace URI bir ağ çağrısı değildir.

## Geri uyumluluk ve TDD kanıtı

Önce mevcut renderer+caption baseline: **47/47 PASS**. İlk yeni test koşusu: **21 FAIL + 1 PASS**. Fail'lerin nedeni `renderReasonedCaptionFrame` export'unun olmamasıydı; tek PASS değişim öncesi gerçek-source fingerprint karakterizasyonuydu. Minimal uygulamada ilk combined koşu 68 PASS/1 FAIL verdi: yeni testte garden sağ kenarı için hatalı yazılan 887 literalinin original source SVG'deki `M100 525 V315 H415 ...` ile yanlış olduğu doğrulandı; yalnız test literal 415'e düzeltildi, production geometry değiştirilmedi. Sonrasında yeni testler **22/22**, eski+yeniler **69/69 PASS**.

Pure paginator aynı davranışla `reasoned_caption_text.mjs` içine çıkarıldı. Eski `reasoned_caption_pages.mjs` export'u re-export olarak kaldı; renderer bu pure utility'yi import ederek cycle oluşturmaz. Mevcut scene/caption API output/property order/hash-domain davranışı korunur. Değişim öncesinde kaydedilen üç gerçek evidence fixture fingerprint'i sonrasında aynıdır:

| Fixture | Eski SVG SHA-256 | Eski frame SHA-256 | Eski caption SHA-256 |
| --- | --- | --- | --- |
| perimeter | b0d51a48883fb7882c47d9b1209e4266345ae8e5427f9e2b3d9f479324affd85 | bf4159e9166ec468fc2cb7136a20e879c6d4b28f715c9e367e739e7f5ce58af9 | b77be4f5bf1cd2d2450249fbe288d992cbf20111b2fe5767c5cbb7134cf39f6a |
| garden_two_rows | 552d42a8d33dcf3e8d65a96f559cb50f46f662fa8e60e084db2582d398519c9d | 0b7e4434432ccd97536059c33d4703f94fefefe7824a408d94752f6fa78b106d | e9b2b2d1cd4812c14bc635f91c85e0da8a1dc47775216b1bf43955e6b2d8256b |
| concept_lesson | 1bd54bfc6e66ea8b55c29e45c259626b639a35efffa92028932f179964937c82 | c59c53a25a2cba1a303298f99aadb8bcee3e3b79df166b954c9f0be20885e187 | 9d5376de7a2b60ce2fa6e8c0bbe85f8404b157b1acff14ce25d72db24415cd04 |

Taze ilgili saf regresyon:

```sh
node --test test/reasoned_caption_frame.test.mjs test/reasoned_scene_renderer.test.mjs test/reasoned_caption_pages.test.mjs test/reasoned_geometry_resolver.test.mjs test/reasoned_media_job.test.mjs test/reasoned_math_adapter.test.mjs test/reasoned_concept_lesson.test.mjs test/reasoned_teaching_trace.test.mjs
```

Sonuç **136/136 PASS**, 0 FAIL, 0 SKIP. Son yeni-test kapsamı **23/23**, eski+yeniler **70/70 PASS**. Üç runtime module syntax check başarılı. Root full-suite/CLI/raster kanıtı bu saf koşuyla eşitlenmez.

Ek salt-okunur matrix: width/height 1,2,3,4,6,50,100; altı rectangle family, fence gate 1/width, sabit garden ve canonical concept. Alanı çevresine eşit üç error-diagnosis kombinasyonu mevcut source kuralıyla atlandı. **335 valid source**, **42.061 selected-page frame**, **74.273 visible caption line**, **10.510 locked protected output**, **4.950 pending transfer output**, max **5** sayfa. Bütün source-safe-layer/asset digestleri, highlight path/pen/coordinatePolicy eski frame ile aynı; seçili 1–2 satır, exact narration reconstruction ve reveal/approval sınırları geçti. İlk exploratory matrix yanlış exception adını beklediği için source `invalid_geometry` kuralında durdu; bu incomplete koşu başarı sayılmadı, yeniden koşulan matrix yukarıdaki tam sonuçları verdi.

Ek hostile probe: **41** malformed/cloned giriş reddi, **0** getter/proxy/coercion hook; valid follow-on deterministik kaldı. İlk probe'da negatif sıfır pageIndex'in canonical selectedPage.pageIndex=0 ile structural farkı bulundu; incomplete koşu başarı sayılmadı. Ayrı regression önce **22 PASS/1 FAIL RED** verdi; pageIndex'in -0→0 minimal normalizasyonundan sonra **23/23 GREEN**, taze hostile probe 41/0 sonucu verdi. Mevcut eski API davranışı değişmedi. Şema/reveal, page bounds, duplicate-frame AX, full narration separation, manifest hash, no style-to-markup/URL, no serialized authority testleri gerçek modülleri kullanır; beklentiler literal sayfa/metrik veya bağımsız Node crypto üzerinden hesaplanır.

## Sınırlar ve dosya freeze

### Bağımsız root doğrulaması ve ikinci negatif-sıfır regresyonu

İkinci ajan yeni caption API'sinde `cueIndex:-0` değerinin metadata'da -0 kalıp JSON/hash ve SVG'nin cueIndex0 ile aynı olduğunu yeniden üretti. Root regresyon önce **23 PASS/1 FAIL** verdi; yalnız yeni caption seçenek kapısında cueIndex sıfırı normalize edildi. **24/24 yeni test ve 71/71 eski+caption birleşimi GREEN**; eski API/fingerprint davranışı değişmedi. Önceki pageIndex düzeltmesinden farklı ikinci kayıt tutarlılığı düzeltmesidir; cevap sızıntısı değildir.

Fix sonrası bağımsız **137/137** saf test; 26 gerçek canonical kaynakta **4.517 seçili-page frame**, 1.190 locked / 207 revealed / 505 transfer kontrolü; 78 güvensiz giriş reddi ve hook0. Kaynak/trace/job/geometry, safe-layer/highlight/koordinat bağları ve current-page-only AX kontrolü geçti. Gerçek bir/100-aday root paketlerinde 15 saved plan fresh canonical source üzerinden yeniden kuruldu ve 15 frame eşleşti; serileştirilmiş plan renderer yetkisi alamadı. Dört actual HTML caption SVG eklemesi exact bytes kontrolünden geçti.

Root ayrıca [normal fabrika/raster kanıtı](CAPTION_COMPARISON_FACTORY_ACCEPTANCE_2026-10-04.md) üretti: 18 gerçek PNG/583.691 bayt, bunların sekizi doğrudan görüntülendi. Bu sınırlı raster gözlemi tüm glyph-fit/mobil/AX veya sesli video kabulü değildir. Taze tam suite **839/839**, fail0/skip0; source/Drive/provider/TTS işi yok.

providerCallsMade=0, sourceFilesRead=0, privacyInspection=not_performed. Audio/TTS/video/captionAudioSync/wordPenAlignment/wordBoundaryTimestamps ve teacher/publication/learner/production bayrakları false; rights/curriculum/expert review pending. Sayfa geçişi timing, audio, tam çözüm videosu, insan el yazısı veya pedagojik onay kanıtı değildir.

Bu dilimde yalnız owned renderer/caption modules, yeni pure caption-text module, yeni test ve bu evidence belgesi değişti. Eski test dosyaları, CLI/UI/CSS/SQL/source modules değiştirilmedi; Git/network/model/Docker/download veya süreç/environment incelemesi yapılmadı. Root CLI integration ve gerçek küçük raster/visual inspect ayrı görevdir.

Runtime/test freeze hashleri:

```text
reasoned_scene_renderer.mjs 62dc4a1e9079eda41d5a1b84b14b0a0ae90d67a5b75cc429c17d5dc09629fb7a
reasoned_caption_pages.mjs 391e4862028a5ac711b43ddc21cfca5132aa315c03830ebff4f17c7f974ce341
reasoned_caption_text.mjs b687030d2b83112cd8a7249c063433bd4fac23a8f8dabb3d552f1118a008a468
reasoned_caption_frame.test.mjs dc4390c6ef9b91234e127666e1e5827a28369d38bc39d288efd5530425467a96
```
