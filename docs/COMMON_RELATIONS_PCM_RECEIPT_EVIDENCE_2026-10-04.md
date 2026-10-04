# Common-relations yerel PCM teknik makbuzu — 2026-10-04

Durum: **yalnız bellekte yerel, kaynağı doğrulanmamış PCM çözümleme ve metadata bağlama**. Bu dilimde Google/başka sağlayıcı çağrısı, dosya okuma-yazma, gerçek öğretmen konuşması, dinleme, oynatma, kelime-kalem hizalama veya MP4 üretimi yoktur. Sentetik WAV baytları test sırasında bellekte oluşturuldu; ham medya Git'e eklenmedi.

## Sahiplik ve API

Yalnız `packages/media/common_relations_pcm_receipt.mjs`, `test/common_relations_pcm_receipt.test.mjs` ve bu yeni belge değiştirildi. Mevcut TTS/voice/scene/factory/CLI dosyaları değiştirilmedi. TDD, writing-good-tests ve verification-before-completion talimatları tamamen okundu; beklenmeyen reflection bellek maliyetinde systematic-debugging talimatları da tamamen okundu. Önce gözlenebilir RED, ardından en küçük uygulama/değişiklik ve taze doğrulama kullanıldı.

Kapalı, kesin ariteli export'lar:

- `inspectCommonRelationsPcmWav(wavBytes)` — bir byte-view argümanı; yerel teknik makbuz verir.
- `auditCommonRelationsPcmReceipt(receipt)` — yalnız bu modülde gerçekten verilmiş canlı makbuzu kabul eder; metadata döndürür.
- `bindCommonRelationsPcmReceipt(closedTtsPreparation, receipt)` — iki argüman; gerçekten verilmiş açık current-cue TTS hazırlığına teknik metadata işaretçisi bağlar.
- `auditCommonRelationsBoundPcmReceipt(boundReceipt)` — yalnız bu modülün verdiği canlı bağlı makbuzu kabul eder.

WeakSet/WeakMap yalnız yerel issuance ve immutable metadata bağıdır; sağlayıcı cevabı, kurum/öğrenci kimliği, hesap, hukuki hak veya insan onayı değildir. JSON, deep/shallow clone, yeniden hashlenmiş onay iddiası ve Proxy bu audit yetkisini kazanmaz. Binding, serialized TTS/hash beyanını değil gerçek `auditGrade6CommonRelationsClosedTts` sonucunu önce denetler. Kilitli veya güvenilmeyen hazırlık, receipt alanlarına erişilmeden reddedilir.

## Dar byte profili

Desteklenen biçim tam 44-byte başlık ve tek PCM payload'dur: `RIFF`, doğru toplam boyut, `WAVE`, ilk ve tek `fmt ` chunk'ı boyut 16, ardından ilk ve tek `data`. PCM encoding 1; mono; 24.000 Hz; signed 16-bit little-endian; blockAlign 2; byteRate **48.000**. Data çift uzunlukta, 12.000–5.760.000 byte dahil sınırdadır. Böylece 6.000–2.880.000 sample ve 0,25–120 saniye elde edilir. RIFF/data/gerçek view uzunluğu tam eşleşir.

Genel RIFF metadata tarayıcısı değildir: JUNK/LIST/diğer chunk'lar, odd padding, duplicate/reordered fmt/data, extensible/float/stereo/başka hız, trailing veya truncated veri desteklenmez ve reddedilir. Eski garden/Google byteRate 96.000 toleransı burada kabul edilmez; remux/onarım yapılmaz. View uzunluğu private clone'dan önce 10 MiB ile sınırlandırılır; geçerli canonical WAV üst sınırı 5.760.044 byte'dır. Bu, caller'ın önceden ayırdığı backing allocation veya tüm süreç belleği için bir garanti değildir.

Native `isProxy` kontrolü önce gelir; gerçek Uint8Array internal brand, tam `Buffer.prototype`, native byteLength/byteOffset/buffer getter'ları, nonshared/nonresizable/non-detached ArrayBuffer ve gerçek view-window sınırları denetlenir. Plain-object Buffer-prototype spoof, Proxy/revoked Proxy, yanlış prototype/subclass, SAB, resizable ve detached backing reddedilir. Native Uint8Array'ye `Buffer.prototype` atanması ordinary Buffer'dan bu sınırda ayırt edilemez: teknik byte view kabulü **Buffer allocation/issuer kökeni kanıtı değildir**. Cross-realm/different prototype profili desteklenmez. Modül yüklenmeden önce global/native prototype'ların değiştirilmesi threat model kapsamında doğrulanmış bir sandbox değildir.

Header native integer-indexed byte erişimiyle önkontrol edilir. Captured `Uint8Array.prototype.set` ile private kopya alınır; başlık tekrar doğrulanır. Captured native `Buffer.prototype.readInt16LE` ile **her sample** çözülür; son sample da hash ve istatistiğe dahildir. Caller'ın length/read/copy/iterator/constructor/toJSON getter/metotları çağrılmaz. Private WAV ve data için ayrı tam SHA-256 hesaplanır; ham WAV/PCM/sample dizisi receipt veya WeakMap içinde tutulmaz. Receipt min/max/peakAbsolute/nonzeroSampleCount taşır; peakAbsolute 32768 olabilmesi signed16'nin -32768 sınırını doğru temsil eder.

## Bilinçli byte-decoration sözleşme revizyonu

İlk uygulama arbitrary extra own named/symbol alanları reddetmek için tüm numeric Buffer index key'lerini enumerate ediyordu. Max 120 s örnekte gözlenen maliyet: 1.630,90 ms; heap delta 362.798.448 B; `/usr/bin/time -l` max RSS 660.930.560 B, peak footprint 688.833.776 B. Bu sonuç son kabul kanıtı değildir; pahalı önceki uygulamanın tarihsel tanığıdır.

Root açıkça shape-only extra-field reddini revize etti: **kullanılmayan byte-view/backing named/symbol/getter dekorasyonları okunmadan yok sayılır**, metadata'ya kopyalanmaz; kabul yalnız intrinsic byte değerleri içindir. Scalar DTO/TTS trust sınırları gevşetilmedi. Gizli `publicationReady:true` beyanı dahil dekorasyonlar hiçbir yetki veya transport izni vermez. Proxies/wrong native brand ve fiziksel WAV kuralları değişmedi. Reflection ile tüm byte index'leri veya descriptor'ları enumerate edilmez.

Gerçek yeni RED 0/2: decorated native WAV'ın önce reddedilmesi ve max WAV üzerinde reflective-enumeration spy'ın hata vermesi. Minimal key-enumeration removal + native byteOffset window kontrolü sonrası kendi 17/17 test GREEN. Decoration testinde temiz ve getter/symbol/hidden alanlı aynı byte'lar için receipt tam eşit; hook sayısı 0. Max WAV spy, input/backing üzerinde `Reflect.ownKeys`, `Object.keys`, own-property names/symbols/descriptors çağrı sayısını 0 doğrular.

Son code pininde aynı max 5.760.044-byte silence fixture, 2.880.000 sample tamamen çözüldü: 38,30 ms; heap before 5.665.840 B / after 6.887.400 B / delta 1.221.560 B; max RSS 71.450.624 B; peak footprint 32.541.528 B; swap ve block I/O 0. Receipt compact JSON 1.811 B. RSS ve footprint araç tarafından ayrı ölçülerdir; birbiri yerine kullanılmaz. Bu tek yerel ölçüm performans/SLA/concurrency/production sertifikası değildir.

## Makbuz ve bağ anlamı

Receipt `schemaVersion:common-relations-pcm-receipt/v1`, `state:local_pcm_decoded_unattested`; audioSha256/WAV length, pcmSha256/PCM length, sample count/rate/channel/bits/format, durationSeconds ve exact sampleCount/24000 fraction, decodeStats, `decodedSamplesVerified:true`, `evidenceOrigin:local_unattested_pcm`, `silenceAcceptedTechnicalOnly:true`, limits/gates/pending taşır. Audit aynı teknik audio metadata ve receipt domain digest'ini taşır; raw sample içermez.

Bound receipt `schemaVersion:common-relations-bound-pcm-receipt/v1`, `state:local_pcm_metadata_bound_unattested`. Binding yalnız gerçek closed audit'ten currentRequestSha256, transcriptSha256, contextId, cueId, order, kind, bridgeSHA; ayrıca preparationSha256 ve pcmReceiptSha256 içerir. Audio alanı teknik receipt metadata'sıdır. Kaynak/trace/provider/style'ı current request hash bağlar; tekrar full request/cue listesi/metin/provider body kopyalanmaz. Açık, unsupported synthetic-provider hazırlığı da teknik yerel bağ için geçerlidir: bu **provider teslimi değildir**. Kilitli hazırlık first-two null hash ile receipt bağlayamaz.

Bir WAV aynı veya farklı current cue'lara metadata olarak bağlanabilir. Bu exactly-once teslim veya WAV'ın o kelimeleri söylediği kanıtı değildir. Sessiz veya yanlış tone da strict PCM kurallarına uyarsa teknik kabul edilir; test iki farklı PCM hash'ini aynı request'e ve root integration aynı PCM'yi farklı current cue'lara bağlayıp konuşma/teslim iddialarının false kaldığını gösterir. Eski garden'ın altı-cue audio lineage'ı yeni iki-context/20-cue işe aktarılmadı; herhangi bir garden-format PCM kabulü yalnız yerel, unattested byte profili anlamındadır.

Her receipt/bound/audit limits'te `providerCallsMade:0`, `providerCallsAllowed:false`; teacherSpeechVerified, spokenTranscriptVerified, voiceIdentityVerified, listenerVerified, wordPenAlignmentVerified, audioPlaybackAllowed, providerDeliveryVerified, learnerReady, publicationReady ve productionReady false; humanApproval null. Altı insan kapısı pending'dir. Closed TTS pending yükümlülüklerinin tamamı union ile korunur; fixture bound'da 47 pending, metadata-pointer-not-spoken-transcript-proof dahil. Thought pause veya speaking duration/timeline/kelime timestamp bu makbuzdan üretilmez. Decode duration fiziksel PCM uzunluğudur, öğretmen konuşma süresi veya düşünme boşluğu ölçümü değildir.

Domain-separated metadata digest'leri `k12.common-relations.pcm-receipt/v1:` ve `k12.common-relations.bound-pcm-receipt/v1:` + compact JSON body (contentSha256 alanı hariç) ile hesaplanır. Bunlar WAV/data byte SHA veya pretty/newline disk SHA değildir. Test bağımsız doğrudan SHA hesaplayarak doğrular. Bound/receipt/audit compact JSON bütçeleri 16 KiB; deeply frozen çıktılar. Yerel fixture: WAV 12.044 B, PCM 12.000 B, 6.000 sample, 0,25 s; receipt 1.815 B/audit 1.844 B; repeat bound/audit 3.781/3.805 B, grouping 3.783/3.807 B.

Bu fixture WAV byte SHA `b10162e88a06f4ef81e8ca89ec56f4b25f4e422c685d9a45ebca14ce61a1b240`, PCM byte SHA `1a993ee7e96eed6bc49e3ae80997affdc2adb933674b35760bf5c14ac9369b72`; receipt domain digest `165757b87dd669a6ee99187a1450c56bae6b619a784c5b467d782b37a396cf74`. Bunlar bellekteki sentetik fixture kimlikleridir; yeni ses dosyası/sağlayıcı cevabı değildir.

## TDD ve taze doğrulama

İlk consumer export assertion actual TTS fixture construction/import'undan önce 0/1 RED üretti; ardından davranış seti 0/15 RED → minimal uygulama 15/15 GREEN. Missing-module catch yalnız beklenen own target `ERR_MODULE_NOT_FOUND` içindi; syntax/import failure yutulmadı. Yukarıdaki bellek sözleşmesi 0/2 RED → 17/17 GREEN. Parent integration'dan açık çağrı izni alanı beklentisi geldiğinde kendi silence/noSpeech assertion `undefined !== false` ile 0/1 RED oldu; limits helper'ine yalnız `providerCallsAllowed:false` eklendi, 17/17 GREEN. TTS'nin ayrı `callsAllowed` alanı değiştirilmedi.

Son komut:

```sh
node --test test/common_relations_pcm_receipt.test.mjs test/grade6_common_relations_closed_tts_pcm_integration.test.mjs test/grade6_common_relations_closed_tts.test.mjs test/grade6_common_relations_current_voice_cue.test.mjs test/grade6_common_relations_voice_bridge.test.mjs test/grade6_common_relations_factory_preparation.test.mjs test/grade6_common_relations_scene.test.mjs test/grade6_common_relations_media_adapter.test.mjs test/reasoned_media_job.test.mjs
```

**140/140 PASS, fail/cancel/skip 0, exit 0, 6.546,34 ms.** PCM own 17; root-owned actual-chain integration 6 bu koşuda çalıştırıldı, yazılmadı. Own module ve test için ayrı `node --check` exit 0. Full repository suite, gerçek provider, dosya/race/derivative/readback, teacher listening, speech/transcript identity, audio playback, word/pen timing ve MP4/native kabul bu alt görev tarafından yapılmadı.

Frozen code SHA-256 `3fb3a7a15c04385c0616547e8e383f0d312b439c46e241f824613f01c7f1a351` (10.170 B); own test SHA-256 `433474847fb57edc6a7b4e0853c773e9a0ffaf3c0efc40fb94fb1c753e51a900` (19.055 B). Bu final koşu upstream closed TTS module `20eaad3650898ff22ff126483860ac133d9d0a40be625d0095a4473a0d081bb9` sözleşmesini kullanır. Eski reflection maliyeti veya earlier GREEN nihai byte-boundary kabulü yerine geçmez.

Sonraki kapılar [NEXT_REASONED_VIDEO_ACCEPTANCE_2026-10-04.md](NEXT_REASONED_VIDEO_ACCEPTANCE_2026-10-04.md)'deki gerçek yetkili sağlayıcı cevabı/readback, dinleme, current transcript eşleşmesi, pause/speech ayrımı, word/pen ve gerçek playable MP4 kanıtlarıdır. Bu modül bunları tamamlamaz veya çağrı bütçesi/yetki yaratmaz.
