# Tek güncel cue için kapalı TTS hazırlığı

4 Ekim 2026. Bu dilim gerçek canlı common-relations bridge'den tek güncel ses isteğini tekrar hesaplayıp yerel issuance kaydı üretir. **Provider-call grant, TTS, ses teslimi, ses byte'ı, video veya öğrenci yetkisi değildir.** Bütün durumlarda state `held_no_provider_call`; çağrı ve retry bütçesi 0'dır.

## Dar sahiplik ve gerçek API

Yalnız yeni üç dosya yazıldı: `packages/media/grade6_common_relations_closed_tts.mjs`, `test/grade6_common_relations_closed_tts.test.mjs` ve bu belge. Eski bridge/current-cue/scene/job, CLI, kaynak, provider, PCM ve ortak belgeler değiştirilmedi. Kodda transport fonksiyonu/export/import'u, ağ, credential/environment okuma, dosya I/O, model/response çağrısı veya ücretli bütçe yolu yoktur.

`createGrade6CommonRelationsClosedTts(bridge,cursor)` tam iki argüman alır. Bridge gerçek orijinal WeakSet-audited artefakt olmalıdır. İlk işlem bridge issuance audit'idir; kopya/JSON/proxy/hash iddiası veya untrusted approval nesnesi okunarak yetki kazanamaz. Ardından mevcut gerçek `createGrade6CommonRelationsCurrentVoiceCue` yeniden çalışır: kapalı dört primitive cursor (`cueIndex,pageIndex,progress,reveal`), gerçek sahne render'i, kaynak/iz/job/cue bağları ve protected reveal denetimi korunur. Caller request, endpoint, credential/token, transport, bütçe, response, provider/style veya approval boolean veremez.

Dönüş derin frozen ve bu modülün yerel WeakSet'iyle issued'dır:

`{schemaVersion,state,current,voiceRequest,protocolCandidateStatus,protocolCandidate,binding,limits,gates,pending}`

Şema `grade6-common-relations-closed-tts/v1`. `current` yalnız `{contextId,cueId,order,kind,responseLocked}` taşır; bütün bridge, diğer adımlar, scene SVG veya gelecek transcript listesi çıkmaz. `voiceRequest`, mevcut tüketicinin tek tam güncel cue isteğidir. Sayfa metni kesilmez; stil ve anlatım ayrı alanlardır. Sayfa/ilerleme/erken açık cue'da reveal değişikliği aynı request ve hazırlık kimliğini değiştirmez; pagination sentez sayısı veya zaman kanıtı değildir.

`auditGrade6CommonRelationsClosedTts(preparation)` tam bir argüman alır. Yerel issuer WeakSet/WeakMap denetimi proxy/copy üzerinde property okumadan yapılır. Dönüş metadata-only:

`{schemaVersion,state,valid,preparationSha256,responseLocked,binding,limits,gates,pending}`

Audit'in exact yedi binding alanı `{currentRequestSha256,transcriptSha256,contextId,cueId,order,kind,bridgeSHA}`. Tam request hash'i bütün canonical request'i bağlar; bu sözlü konuşma, provider teslimi veya kullanıcı yetkisi değildir. `bridgeSHA` bütün issued bridge'nin aggregate digest'idir; gelecek tekil cue hash'lerinin listesi değildir. Audit metin/body/provider/style/endpoint kopyalamaz. Hash/domain kayıtları serialized requester'a issuance yetkisi vermez.

## Protected ve unsupported durumlar

Result/check_answer/summary/transfer_answer yalnız `reveal:true` **ve** `progress===1` ile açılır. Diğer protected durumlarda `voiceRequest:null`, `protocolCandidate:null`, status `locked_no_request`, güncel request ve transcript hash'leri null'dır. Body, metin, stil, provider/voice kimliği veya diğer 20 kanonik cue'nun metni/tekil hash'i teslim edilmez. Aggregate bridge kimliği, cue kimliği ve pending metadata'sı anti-cheat veya auth değildir; verilen şekilden cevabın matematiksel çıkarılabilmesi ayrı sınırdır.

Başka geçerli issued sağlayıcı/model/voice beyanı, status `unsupported_provider_candidate` ve `protocolCandidate:null` ile **held** hazırlık üretir; uydurma endpoint veya protocol destek iddiası yapılmaz. Bu durum yerel PCM teknik bağlayıcısına kaynak/request ilişkisi sağlayabilir, ancak yerel bytes provider teslimi veya doğru konuşma kanıtı olmaz.

Bridge'nin önceki tam-kanonik-referans izolasyonu korunur: iki bağlamın 20 tam cue metni veya tekil SHA'sı style/provider metadata'sına taşınamaz. Bu sınırlı literal denetim, parçalı/kodlanmış/yeniden ifade edilmiş veya kanonik olmayan içerik/genel gizlilik/talimat güvenliği sınıflandırması değildir; stil/gizlilik incelemesi hâlâ pending'dir.

## Sabit doküman adayı, sıfır canlı çağrı

Root'un bu fazda doğrudan resmî doküman kontrolüne dayandırdığı **aday** profil yalnız:

- Provider ID `google-gemini-interactions`.
- Model ID `gemini-3.8-flash-tts`.
- Voice ID exact `Charon` veya `Kore`.

Bu iki satır bütün Google ses kataloğunu destekleme iddiası değildir. Tarihsel UI model etiketi API erişim kanıtı sayılmaz. Bu alt ajan yeni docs/browser/API/account veya response denemesi yapmadı; kaynak/doküman karşı-denetimi root/ayrı denetçiye aittir. `docKnown:true` resmî doküman adayını ifade eder, `endpointVerified:false` canlı schema/model/voice/account erişiminin doğrulanmadığını belirtir. Resmî sürüm/doküman değişirse ayrı root incelemesi ve TDD gerekir; otomatik fallback yoktur.

Yalnız açık ve bu exact profile uyan request için status `documented_unverified_candidate`; candidate sabit `POST https://generativelanguage.googleapis.com/v1beta/interactions` ve body'dir:

```json
{
  "model": "gemini-3.8-flash-tts",
  "input": [{"type": "user_input", "content": [{
    "type": "text", "text": "TAM KANONİK GÜNCEL CUE",
    "annotations": [{"type": "speech_metadata", "style": "AYRI KANONİK STİL"}]
  }]}],
  "response_format": {"type": "audio", "mime_type": "audio/wav", "sample_rate": 24000},
  "generation_config": {"speech_config": [{"voice": "Charon"}]},
  "store": false,
  "stream": false
}
```

Bu yalnız şemayı açıklayan insan örneğidir; placeholder'lar üretilen body'ye yazılmaz. Gerçek test bütün cue metni/stil/voice alanlarını literal protokol yapısına karşı ölçer. Human label, inline tag, başka cue, yorum, kısaltma, hızlandırma veya düşünme arası konuşma metnine eklenmez. Store/stream false tercihinin provider tarafında gerçekten uygulandığı iddia edilmez; canlı gizlilik/retention acceptance pending'dir.

Her durumda gerekli kararlar açık: `scoped_provider_authorization`, `provider_account_credential`, `rights_commercial`, `adult_editor_minor_terms_review`, `privacy_retention_style_review`, `live_endpoint_schema_and_voice_review`, `paid_budget`. Credential/authorized/rights/privacy/budget/minor-terms inceleme alanları bu boundary'de false, human approval null'dır. Bunlar host'ta hiç credential bulunmadığına dair environment taraması değildir; hiçbir credential yapılandırması alınmadığını gösterir. Adult editor/çocuk kullanım şartları çözülmüş sayılmaz.

`callsAllowed:false`, `callBudget:0`, `transportCallsMade:0`, `transportConfigured:false`, `retryBudget:0`. Sözde caller `approved:true` veya modelin kendi değerlendirmesi bu kapıları açamaz. Transport/response branch'i yoktur; hata veya belirsiz teslim için retry/rollback/exactly-once iddiası da yoktur.

Önerilen ileriki ses/PCM profil sınırı 24.000 Hz, mono, 16 bit WAV, 10 MiB ve 120 saniyedir; **canlı bütçe veya gerçekten gelen response formatı değildir**. Bu dilimde response parser, sample decode, measuredSpeechSeconds, dinleme, kelime/kalem hizalama, playback ve MP4 yoktur. Check/transfer sonrası dörder saniye düşünme arası yalnız mevcut request beyanında kalır; context başına 8 saniye konuşma süresi sayılmaz.

## Test sırası ve taze kanıt

Eksik modülde gerçek export assertion RED:

`node --test --test-name-pattern='missing closed TTS API' test/grade6_common_relations_closed_tts.test.mjs`

Çıkış 1; **0/1 pass**, `closed TTS constructor is missing`. Eksik import boş API olarak karşılandı; import crash RED sayılmadı. Uygulama öncesi yazılmış consumer/closed cursor/reveal/protocol/issuance testlerinden sonra minimal kod yazıldı; ilk tam koşu **12/12 GREEN**.

Ardından mevcut davranış için üç ek karakterizasyon tanığı eklendi: bütün 20 kanonik güncel cue'nun tam metni, desteklenen büyük çok-baytlı stil + actual overbudget body reddi, mevcut cursor/null/own-key sınırları. Bunlar ek uygulama gerektirmeden geçti; sahte RED veya yeni özellik uygulanmış gibi sunulmaz.

Son kendi komut:

`node --test test/grade6_common_relations_closed_tts.test.mjs`

Çıkış 0, **15/15 pass, 0 fail/skip**, 1.025160375 saniye. İki bağlam × dört protected kind × üç kilitli durum = 24 gerçek kilitli hazırlıkta metin/style/provider/tekil SHA yokluğu ölçüldü; tamamlanmış protected sonuç da held kalır. Clone/JSON/yüzeysel kopya/fake approval/proxy/revoked/getter/hidden/symbol/inherited/coercion/sparse/unknown transport cursor reddinde kullanıcı hook sayısı 0.

İlişkili gerçek koşu:

`node --test test/grade6_common_relations_closed_tts.test.mjs test/grade6_common_relations_current_voice_cue.test.mjs test/grade6_common_relations_voice_bridge.test.mjs test/reasoned_media_job.test.mjs test/grade6_common_relations_scene.test.mjs`

Çıkış 0; **87/87 pass, 0 fail/skip**, 10.614391458 saniye. Mevcut current-cue suite'i iki postrepair regression ile 17 testtir. Modül/test ayrı `node --check` ile çıkış 0. Bunlar bütün repo, provider response, PCM veya native/video kabulü değildir.

Altı human kapı pending'dir; upstream current-cue pending listesi kayıpsız birleştirilir. Sample'larda 41 açık başlık vardır. Yeni authored/accepted/published soru 0, audio/video/provider çağrısı 0; bir hazırlık tek cue'dur, tam çözüm veya on cue ses kabulü değildir.

## Bütçeler ve değişmezlik

Gerçek `JSON.stringify` UTF-8 örnek ölçümleri, testteki kanonik kısa stil:

| Bağlam/adım | Status | Hazırlık byte | Audit byte | Body byte |
| --- | --- | ---: | ---: | ---: |
| Repeat/goal | documented_unverified_candidate | 6.544 | 3.251 | 505 |
| Repeat/result, kilitli | locked_no_request | 3.199 | 3.130 | 0 |
| Grouping/plan | documented_unverified_candidate | 8.068 | 3.253 | 1.253 |
| Grouping/goal, synthetic provider | unsupported_provider_candidate | 5.961 | 3.253 | 0 |

Hazırlık 64 KiB, audit/body ayrı 16 KiB üst sınırındadır. 4.096 adet `Ş` stil üst profili gerçek tam body'de kırpılmadan korunur. Mevcut generic/bridge'nin şeklen kabul ettiği 4.096 lone-surrogate stilin JSON body byte'ı 16 KiB'ı aşınca bu yeni sınır `invalid_common_relations_closed_tts_output_budget` ile issuer üretmeden reddeder; sessiz truncate/normalize/transport yoktur. Bu fixture'nun kabul edilmesi genel Unicode/TTS gizlilik kabulü olarak sunulmaz.

Hazırlık ve tüm alt öğeler, önceden frozen parent dahil recursively dondurulur. Body `store` veya cue metni mutasyonu testte TypeError üretir. Audit private domain digest'i `k12.grade6-common-relations.closed-tts/v1:` + bütün hazırlık JSON'dur; disk/newline byte SHA ve request digest ile karıştırılmaz. Source/trace/style/provider audit'e ayrı kopyalanmaz; whole canonical currentRequestSHA bağı yeterlidir, konuşma içeriğinin gerçekten okunduğuna kanıt değildir.

Kod/test frozen:

- Modül 6.270 byte; SHA-256 `20eaad3650898ff22ff126483860ac133d9d0a40be625d0095a4473a0d081bb9`.
- Test 18.823 byte; SHA-256 `c1720244564c925b00f474dc360b001ca9dd0571073148b618ff9990b1d13060`.

Açık sonraki seam: yetkili hesap/endpoint/şartlar/ticari hak/gizlilik/stil/bütçe kararlarından sonra ayrı transport tasarımı; gerçek response byte/decode ve dinleyici kabulü; measured word–pen ve common renderer/mux. Burada hiçbir credential, öğrenci/PDF aktarımı, Drive/DB/Docker/SDK, cloud ücret, Git/commit/push veya otomasyon açılması yapılmadı.
