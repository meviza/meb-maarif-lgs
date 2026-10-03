# Caption review: normal fabrika ve ayrı DOM metni

4 Ekim 2026. [Yeni saf controller](REASONED_CAPTION_REVIEW_EVIDENCE_2026-10-04.md) local live-plan capability ile beş kapalı action sağlar. Bu root fazı normal fabrikanın **yalnız ilk current record'unu** kaydeder ve editör HTML'inde ayrı DOM metni olarak tüketir. Controller'ın ekran gezinmesi henüz bağlı değildir; production/öğrenci paketi veya yeni sesli video değildir.

## Test-first normal bağlantı

Yeni iki CLI testi **0/2 feature RED** (`captionReviewPreparation` eksik) → minimal bağlantı sonrası2/2GREEN. Son ek DOM script testi bir karakterizasyondur: actual emitted script'i inert harness üzerinde çalıştırır; markup-like iki literal satır dahil yalnız `textContent` sink'i kullanıldığını doğrular. Bu test missing-feature RED diye sunulmadı.

Normal source→trace→job→live scene plan'dan `createReasonedCaptionReview(plan).current()` hazırlanır. `captionReviewPreparation`: questionRecords1/12 ve conceptRecords1; `localControllerImplemented=true`, **pageNavigationUiBound=false**, initialCueOnlytrue/serializedAuthoritynone/editor_review_only. Önceki frame manifestleri korunur, yeni record.frame/narrationPacket bunlarla birebir eşleşir. Protected future metni primary DOM'a aktarılmaz; canonical tam current anlatım ayrı editor JSON packet'idir.

HTML'de concept ve tek worked example için **iki DOM payload** vardır. JSON string'de `< > &` unicode-escaped; emitted script JSON.parse sonrası `document.createElement('p')`, `line.textContent=text`, append kullanır. `innerHTML` yok. 18px/1.65 line-height viewBox'tan bağımsız CSS, pre-wrap ve overflow-wrap ile sunulur. Mevcut kaynak geometrili caption-bearing SVG değişmeden **ikincil kapalı details** içinde kalır; duplicated AX anlatımı ayrıca incelenmelidir. Mevcut legacy hidden gerekçeli cevaplar ve tüm audit JSON answer-bearing'dir; details/cursorflag yetki değildir. Bu HTML öğrenciye teslim edilmez.

## Gerçek özel root paketleri

Normal CLI yeni boş özel çıktı klasörlerinde1 ve100 adayla gerçekten çalıştırıldı. Mevcut soru/diagram/storyboard/media/scene/caption-frame/comparison hazırlıkları değişmedi; providercalls0, yayın0. Stok1/12, ret0/88; iki comparison görevi/seven model row stoka eklenmedi.

| Normal iş | Initial record | Audit JSON baytı / SHA-256 |
|---|---:|---|
| 1 aday | 2 | 617.353 / `09aaa5137075749cb655678bf5a3ec4420fd3d00a104b17915675f0c3e5b5ad9` |
| 100 aday | 13 | 2.647.401 / `5e28053866f1367d0df92af2f8280f5e4aaaf45364d61f69acd697aff164e4ee` |

HTML1:63.583bayt SHA`de378829d9fc56bd34d38f1394ef1c3b9fac896fe4db51342f064b325b12fcf4`; HTML100:177.113bayt SHA`81fdcc148675365806ad8db6ee8b9362f83ba4409c4e526ecc44718001ea38e0`. Hepsi iki current satır, cue/page0/resultVisiblefalse. Paketler Git dışı özel review çıktısıdır; signed URL veya child data yok. HTML/audit/media Git'e alınmadı.

Yazardan farklı ajan aynı1/100 işleri kendi geçici klasörlerinde yeniden üretti; live builder'dan her record exact eşleşti, iki DOMpayload/iki secondarySVG ve ID tekilliği geçti, narrationPacket/fullTranscript field veya caption-navbutton HTML'e konmadı. Audit/HTML digestleri root ile aynı. Agent temp çıktısı temizlendi; root özel paketleri korunur.

## Tam suite regresyonu ve düzeltme

İlk taze fullsuite **893 test/889PASS/4FAIL**. Dört eski practice/reveal testinin minimal DOM mount helper'ı bütün script taglerini siliyordu; yeni inert `application/json` caption payload da silindiği için actual consumer null aldı. Dar eski test koşusu6PASS/4FAIL ile aynı neden yeniden üretildi. **Uygulamadaki güvenlik/ret kontrolü gevşetilmedi**; yalnız test harness inert JSON düğümünü koruyacak, `createElement/append` sağlayacak şekilde düzeltildi. Caption DOM satırlarının exact JSON ile eşliği eski navigation testine eklendi. Dar mixed-flow+newcaption13/13GREEN; gerçek tarayıcı layout kanıtı değildir.

Son root fullsuite mevcut trusted Sharp + gerçek media opt-in ile **893/893 PASS, fail0/skip0**,17.777s. Önceki839'a adapter27+controller19+newSQLCLI3+normalcaptionCLI3+snapshot2=54 eklendi. RuntimeSQL73+13, remote byte proof ve agent ad-hoc probe sayıları suite'e eklenmez.

## Kabul edilmemiş alanlar

Controller ve root CLI iki ayrı çapraz audit gördü; denetlenen kapsamda açıkP1/P2 yok. Pure controller19test/baseline90 ve geniş canonical probes, explicit protected-reveal/son-sayfa/backward relock/current-only/hash binding davranışını doğrular. 128KiB overflow branch için oversized live fixture runtime kanıtı yok; canonical maximum15.893bayt. Bu bir garanti veya production security boundary değildir.

Bu faz **gerçek browser, computed font/glyph-fit, screen reader, mobile/premium UI veya yeni raster/video incelemesi yapmadı**. Eski3338 sayfası otomatik güncellenmedi. Caption cursor için kalıcı server/UI API yok; ses/TTS/timestamp/word–pen sync/video0, expert/curriculum/rights pending. `audioAttached/videoAttached/wordPenAlignmentVerified/publicationReady/learnerReady/productionReady=false`. Yeni metinlere eski pilot ses/video onayı taşınmaz. Genel sesli video fabrikası ve36.000 soru hedefi açık.
