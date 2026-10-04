# Common-relations: yalnız güncel adımın ses isteği

Tarih: 2026-10-04. Durum: `draft_only_no_provider_call`. Bu dilim, önceden yazılmış tek editör taslağının mevcut iki bağlamından seçilen **tek güncel adım** için saf bir istek DTO'su hazırlar. TTS çağrısı, ses baytı, dinleme, oynatma, MP4, kelime-kalem hizalama veya öğrenci teslimi yapılmadı. Yeni/ürünce kabul edilmiş/yayımlanmış soru sayısı 0'dır.

Son yeniden doğrulama, üst köprüde bağımsız incelemeyle bulunan iki P2'nin düzeltildiği `fc69a980…48dc3c` sürümündedir. Önceki köprü `9c0227be…a9c93`, current test `f439ddbf…93c22`, belge `e11917c3…db713` ve 97/97 kaydı **tarihsel pre-hardening** tanıklardır; son kabul/freeze kanıtı değildir. Current modül değişmedi; test ve bu belge yenilendi.

## Sahiplik ve gerçek tüketici sınırı

Yalnız yeni dosyalar:

- `packages/media/grade6_common_relations_current_voice_cue.mjs`
- `test/grade6_common_relations_current_voice_cue.test.mjs`
- Bu kanıt belgesi.

Eski CLI, medya işi, kaynak, köprü, sahne, ses hazırlama veya sözleşme modülleri değiştirilmedi. Testler yalnız sabit üç kamuya açık kaynak metaverisi JSON'unu okur; gerçek kaynak PDF içeriği/baytı yeniden incelenmedi. Git, ağ, sağlayıcı, model, SDK, hesap, `.env`, Drive, veritabanı, Docker ve tarayıcı işlemi yoktur.

Kullanılan beceriler: test-driven-development ve writing-good-tests, uygulamadan önce eksik tüketici davranışını RED üretmek için; systematic-debugging, yanlış çok-sayfalılık beklentisini gerçek kanonik sayfa sayılarıyla ayırmak için; verification-before-completion, son donmuş dosyalar üstündeki taze çalıştırmayı başarı iddiasından önce yapmak için okundu.

## API ve güven zinciri

`createGrade6CommonRelationsCurrentVoiceCue(bridge, options)` tam iki argüman ister. `options` zorunlu, yalnız `cueIndex`, `pageIndex`, `progress`, `reveal` adlı isteğe bağlı ilkel alanları taşır. Varsayılanlar 0/0/0/false; `-0` aynı 0'a kanonikleştirilir. Başka bağlam, sağlayıcı, kaynak yolu, URL, callback, zaman, kelime zamanı veya ses ekleme seçeneği yoktur.

İlk işlem gerçek `auditGrade6CommonRelationsVoiceBridge(bridge)` çağrısıdır; çağıranın köprü alanları bundan önce okunmaz. Köprü audit'i yerel issuance/capability sınırıdır; kimlik, yetki, sağlayıcı adresi, ses kimliği, hak veya öğretmen onayı değildir. JSON/structured clone, proxy ve yeniden hashlenmiş köprü biçimli veri canlı köprü yerine geçmez. Üst factory wrapper'ın ayrı bir issuer brand'i varmış gibi iddia edilmez; üst API'nin kanonik shallow wrapper + gerçek canlı alt capability kabul sınırı değişmedi.

Auditten sonra gerçek `renderGrade6CommonRelationsCaptionFrame` çağrılır. `contextId` yalnız köprüden gelir. Güncel sahne/source/trace/görsel-job/preparation/geometry kimlikleri; seçilen voice-job/request/provider/style kimlikleri; güncel cue sırası, türü, metni, metin hash'i, anchor'ları ve düşünme arası gerçek canlı köprü alanlarıyla karşılaştırılır. Görsel işin sağlayıcısı null olarak kalır. Seçilen ses işi aynı job ID'ye sahip olsa da farklı tam job SHA'sı ve request SHA'sı taşır; ID eşitliği ses kanıtı değildir.

Sonuç derin dondurulmuş altı alan içerir: `{schemaVersion,state,frame,narrationPacket,voiceRequest,manifest}`. Frame ve narration mevcut sahne tüketicisinin gerçek güncel çıktılarıdır; yeni renderer veya kaynak SVG kanıtı üretilmiş sayılmaz.

## Korumalı yanıt ve güncel metin

`result`, `check_answer`, `summary`, `transfer_answer` yalnız `reveal === true && progress === 1` ile açılır. Bu bir editör sunum kilididir; çocuk yetkilendirmesi veya matematiğin verilenlerden çıkarılmasını engelleyen anti-cheat değildir.

Kilitliyken `voiceRequest === null`, manifest request SHA'sı null ve request baytı 0'dır. Güncel tam yanıt metni/hash'i, seçilen provider/style, voice-job SHA'sı/request SHA'sı ve gelecek cue listesi kopyalanmaz. Mevcut sahne/narration kilidi korunur. Ortak source/trace/scene/issuance hash'leri sunum bağını gösterir; ses/gelecek cue içeriği taşıyan bir liste değildir.

Açık isteğin şeması `grade6-common-relations-current-voice-request/v1`'dir. Kaynak/trace, görsel ve ses job/request kimlikleri, seçilmiş **beyan** provider/style, yalnız güncel cue'nun tam metni/hash'i/sırası/türü, literal birimler ve düşünme arası taşınır. Sayfa metni tam metnin yerine geçmez. Çok sayfalı tek adım için bütün sayfalarda aynı tam güncel metin ve aynı istek kimliği korunur.

İstek gövdesi sayfa/ilerleme/reveal/cursor içermez. Domain hash'i:

```text
SHA256('k12.grade6-common-relations.current-voice-request/v1:' + JSON.stringify(bodyWithoutContentSha256))
```

Bu kimlik playback, exactly-once sağlayıcı çağrısı, tekrar denememe veya ses cache yetkisi değildir. Cursor ve gerçek frame/narration hash'leri ayrı manifestte bağlanır. Farklı cue, bağlam, provider veya style beyanı farklı istek kimliği üretir. İstek ve manifest JSON bayt SHA'ları domain hash'leriyle aynı algoritmik nesne değildir.

`narrationPacket` tam **güncel** metni ve o adımın sayfalarını taşır; bütün 10 cue'nun ses isteği, full factory packet, job, bridge veya gelecek cue hash listesi sonuçta taşınmaz. Kanonik güncel açıklamanın kendi içinde başka kısa cümleyle aynı metni içermesi ekstra gelecek payload sayılmaz. Üst köprü artık iki kanonik bağlamın 20 cue'suna ait tam literal metni veya case-insensitive bireysel SHA referansını style/provider alanlarında issuance öncesinde reddeder. Bu sınırlı referans izolasyonudur; fragment, yeniden anlatım, encoding, kanonik olmayan içerik veya genel gizlilik sınıflandırması değildir. Serbest style beyanının içerik uygunluğu/onayı yapılmış değildir.

## Birim, düşünme arası ve eksik medya kanıtı

Bağımsız literal tanıklar: zaman sonucu `[24,48]`, literal birim `minute`; paket boyutları `[1,2,3,4,6,12]`, literal birimler `card_per_package` ve `package`. Paket boyutu paket adediyle, dakika skaler fiziksel uzunlukla değiştirilmez. Sonuç ses metnindeki sayılar bu kümelerle tek dizi olarak karşılaştırıldı; yeni seslendirme veya dinleyici doğrulaması yapılmadı.

Her bağlamda check-prompt ve transfer-prompt sonrasında 4'er saniye düşünme arası **beyan** edilir; bağlam toplamı 8'dir. `measuredSpeechSeconds:null`; konuşma süresi, boundary timestamp, kelime hizası veya ses dosyası süresi türetilmez. Aynı current cue'nun sayfa değişimi yeni bir konuşma süresi veya TTS çağrısı değildir.

Transfer metni açıkken de yeni şekil kaynakta yoktur: `sourceDiagramProof:false`, sourceVisualId null ve `transfer_geometry_not_in_source_pending`. Mevcut sabit verilenlerin uzmanlık sahnesi, generic resolver desteği veya PDF'nin özgün şekli gibi sunulmaz.

Provider fixture açıkça sentetiktir: `synthetic-tts-provider` / `synthetic-teacher-v1` / `synthetic-baritone`. Bunların hizmet/ürün/model mevcutluğu ya da lisansı doğrulanmadı. Gerçek credential veya hizmet çağrısı yoktur. ProviderCallsAllowed/audioPlaybackAllowed false; audioGenerated/videoRendered/bytesVerified/spokenTranscriptVerified/voiceIdentityVerified/wordPenAlignmentVerified/captionAudioSyncVerified/learnerReady/publicationReady/productionReady false; humanApproval null. PrivacyInspection `not_performed`, styleApproved false. Üst köprünün tüm bekleyen maddeleri yeni manifestte aynen korunur; activeProgram, pedagogy, rights, difficulty, answer, accessibility altı kapı pending'dir.

## Bütçe ve düşmanca girdiler

Toplam çıktı 131072 bayt, tek istek 32768 bayt, manifest 16384 bayt üst sınırındadır; ölçüm `Buffer.byteLength(JSON.stringify(value))` ile compact UTF-8 JSON'dur. Disk dosyası yazımı/readback'i veya HTTP/TTS aktarım boyutu kanıtı değildir.

Seçenekler record, dört own alan ve primitive tiplerle kapalıdır; kendi key'leri descriptor okumadan önce kontrol edilir. Getters, gizli/symbol/inherited alanlar, conversion hook'ları, proxy/revoked proxy, sparse array, cycle, yanlış/null/undefined değer, NaN/Infinity, kesirli/negatif/out-of-range cursor, bilinmeyen alan ve eksik/fazla argüman constant typed hatayla reddedilir. Hook çağrısı 0 tanığı vardır. Hatalar caller metni, özel yol veya callback mesajı yankılamaz. Clone ve yeni hesaplanmış hash canlı capability üretmez.

## TDD tarihi ve son doğrulama

1. Yeni tüketici export assertion'ı köprü import/kurulumundan **önce** çalıştı: gerçek 0/1 RED, ardından genişletilmiş 0/12 RED. Hata `current voice cue consumer export is not implemented` idi; eksik köprü import crash'i başarı/RED sayılmadı.
2. İlk canlı uygulama 11/12 geçti. Kalan hata testin grouping evidence cue'sunu çok sayfalı sanmasıydı: gerçek evidence 1, plan 7 sayfadır. Repeat evidence 2 ve grouping plan 7 sayfa seçildi; üretim kodu değiştirilmeden 12/12 GREEN oldu. Bu test beklentisi düzeltmesi uygulama bugfix'i gibi sayılmadı.
3. İlk export-only tanık varsayılan gerçek güncel metin + kilitli request davranışına genişletildi. Dynamic import yalnız tam yeni modülün `ERR_MODULE_NOT_FOUND` hatasını yakalar; başka import/syntax hatası örtülmez.
4. İlave üst pending koruma tanığı gerçek 0/1 RED verdi: `active_program_and_curriculum_review` manifestte yoktu. Minimal pending union + açık inceleme false etiketleri sonrası GREEN oldu. Kimlik ayrımı ve multibyte upper-bound testleri ek characterization'dır; fake RED iddiası yoktur.
5. Bir combined run, üst writer testleri hâlâ yazılırken 95/96 çıktı; üstteki trace insertion-order fixture beklentisi düzeltildi. Bu run tamamlanmış kanıt sayılmadı. Aşağıdaki son çalışma frozen bridge üstündedir.
6. Önceki 97/97 sonrasında root/bağımsız auditor iki gerçek P2 buldu: (a) gerçek selected job'un style/provider metaverisi, açık current goal isteğine aynı/öteki bağlamın korumalı tam yanıt metnini veya hash'ini taşıyabiliyordu; (b) kanonik fakat unbranded visual request root'u shallow-frozen olduğunda üst freeze alt cue/style nesnelerini atlıyor, stored bridge digest'i bayatlayabiliyordu. Bunlar gerçek TTS/öğrenci işlemi değildi. Üst API writer test-önce guard ve recursive-child-freeze düzeltmelerini yaptı; burada current production modülü değiştirilmedi.
7. İki yeni gerçek downstream characterization tanığı **düzeltme sonrasında** eklendi; bu tur kendi testleri için fake RED veya eski dosya swap'ı yapılmadı. 144 gerçek selected-job/bridge denemesi: iki seçilen bağlam × aynı/öteki bağlamın dört protected cue'su × üç style referansı ve üç provider ID alanındaki lower/upper SHA; tamamı typed bridge hatasıyla issuance öncesi reddedildi, currentCalls 0. İkinci tanık iki bağlamda gerçek trace/job/scene alt capability'lerini koruyan shallow factory + shallow-frozen canonical request'i kabul ettirir; cue/style alt nesneleri frozen, bağlam başına üç mutation TypeError, sonraki current tam metni/request SHA/frame SHA değişmez; stored bridge digest gerçek JSON domain digest'iyle eşleşir. Kaynak/sahne snapshot'ı değişmedi.

Son dar komut:

```sh
node --test test/grade6_common_relations_current_voice_cue.test.mjs test/grade6_common_relations_voice_bridge.test.mjs test/grade6_common_relations_factory_preparation.test.mjs test/grade6_common_relations_scene.test.mjs test/grade6_common_relations_media_adapter.test.mjs test/reasoned_media_job.test.mjs
node --check packages/media/grade6_common_relations_current_voice_cue.mjs
node --check test/grade6_common_relations_current_voice_cue.test.mjs
```

Son BOTHFIX sonuç: kendi 17/17; altı suite 102/102, fail/skip 0, exit 0; süre 11.418s; iki syntax exit 0. Kullanılan frozen köprü module SHA `fc69a9802a8c69e0c486f57d2769d5ae148c38d5fbb14af5c5f6329ec848dc3c`, test SHA `67e1305059162440ee6c73c741d23281011c1d8f6dcab9b7310fbccbbac1e092` taze eşleşti. Root full-suite/native/bağımsız audit sonuçları bu belgenin kendi tanığı değildir. Eski 97/97 bu iki karşı-örneği kapsamadığından final başarı olarak kullanılmaz.

Ek bellekteki gerçek tüketici property çalışması BOTHFIX köprüyle taze tekrarlandı: 2 bağlam, 20 cue, açık durumda 49 sayfa; sekiz progress/reveal vektörü ve her geçerli sayfada **280** çağrı: 56 kilitli / 224 açık, 20 farklı current-request kimliği. Her açık istek aynı cue için cursor'dan bağımsız, tam güncel metin ve bağımsız domain-hash hesabıyla eşleşti. Synthetic fixture maksimumları: output 22585, request 3353, manifest 3584 bayt. Son 17/17 içindeki 4096 adet multibyte style karakteri + her provider ID alanı 80 karakter profili kırpmasız bütçeye sığar; önceki ölçümü output 32831, request 15736, manifest 3544 bayttı. Bu geniş-gövdeli beyanlar genel privacy/endpoint kabulü değildir.

Sentetik repeat varsayılan compact çıktı: 18833 bayt, JSON-byte SHA `0a7deaa8db7c88ab5e7e2df0f1f4f769d00b99ec455ed278565e9f478403f7af`; request 2579 bayt, **domain** SHA `fc62cb5d641a87334460119c8fd2d04c3d493746acb80b60dc49a9e08610802d`, JSON-byte SHA `4b0c28c5f8aa7a191091839885acc694bfd6e8fb5ac458522930d651dd0c74ac`. Bunlar üretilmiş WAV/MP4 hash'i değildir.

## Donmuş kod/test parmak izleri

- Module: 12236 bayt; SHA256 `d5cc8e49368aef45c2cd68188951afab0c5aba43027a5659c5c3e8d46e1ccf30`.
- Test: 24766 bayt; SHA256 `27352a685b419daaa52217e1e771b37adf7dfff9d29bc4ece7322aeedbccebbe`.

Belge hash'i son freeze mesajında ayrı verilir; self-referential hash eklenmez. Sonuç saf editör hazırlığıdır. Yeni metin→TTS baytı→dinleyici→kelime/kalem→sesli MP4 kabul zinciri halen açık; tarihsel garden medya tanığı bu iki bağlamın ses/video kabulü değildir.
