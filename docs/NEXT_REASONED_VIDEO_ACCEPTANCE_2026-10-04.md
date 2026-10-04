# Yeni gerekçeli sesli video: test-önce kabul planı

İlk kayıt,4 Ekim 2026: **Yalnız plan; o kayıt anında kod/test/TTS/ses/MP4 veya yeni kabul kanıtı yoktu.** Üst görevin checkpoint'i `a4a3e1b4116a2e3fc1e41c67a58b09fc4fe70247`; o incelemede Git çalıştırılmadı. Modüller readonly incelendi. Aşağıdaki başlangıç hedefleri korunur; sonraki gerçek uygulama güncellemesi belgenin sonundadır.

## Mevcut hat ve kesin açık seam

[Common adapter](../packages/content-factory/grade6_common_relations_media_adapter.mjs): exact iki argüman, verifier→canonical rebuild; bir taslak/iki bağlam/on cue-bağlam, yeni soru 0. Dakika/kart-paket/paket birimleri ayrı. `interpret/text`, numeric check 0; matematik kanıtı ayrı sonlu-küme oracle'ıdır.

[Reasoned job](../packages/media/reasoned_media_job.mjs) gerçek branded trace'ten job ve `createReasonedMediaAudioRequest(job)` üretir. Common job'ın provider'ı null; request `providerCallsAllowed=false`. `attachReasonedMediaAudio` seçilmemiş provider'ı reddeder. Seçilmiş provider/style ile aynı live trace'ten yeni job yaratmak **yeni job/request hash'i** yaratır; ID tek başına revizyon değildir.

[Common scene](../packages/media/grade6_common_relations_scene.mjs) source+sourceBindingInput+live preparation'ı audit edip bütün kanonik default hazırlıkla tekrar karşılaştırır. Yeni provider job'ını mevcut preparation içine değiştirerek scene'e sokmak geçerli entegrasyon değildir. Gelecek bridge, değişmeyen canonical visual job/scene ile ayrı provider-selected voice job/request arasında source/trace, cue ID/order, tam transcript/hash ve style kimliğini açıkça bağlamalı. Canonical packet mutate edilmez; serialized clone veya caller rehash authority olmaz. Bridge API ve byte-reader henüz yoktur.

`attachReasonedMediaAudio` metadata bağlar, audio baytını okumaz; byte/speech/voice/video bayrakları false. Doğru dosya hash'i yanlış konuşmayı yakalamaz; yerel decode ve dinleme ayrı kanıttır.

## Eski garden sesi niye taşınamaz?

[Ink plan](../packages/media/ink_timeline.mjs) sabit garden geometrisi, metre sonuçları ve `intro/step1/step2/step3/step4/outro` altı metin taşır. [Prepare](../packages/media/prepare_ink_audio.mjs) bu altı sabit dosyayı okuyup TTS değil yerel stream-copy WAV remux yapar. [V2 validator ve renderer](../packages/media/ink_video_renderer.mjs) default garden plan ID/hash ve altı exact transcript'i doğrular; renderer yeniden garden planı yaratır. `createTeacherVoiceDirection` da live ink plan markası ister, common scene adaptörü değildir.

WAV rehash/cue relabel/remux konuşulan sözcükleri değiştirmez. Garden V1 unbound desteği common başarı yolu değil; on cue'yu altıya sıkıştırma veya metre scalar'ına dakika/küme koyma ret. `renderInkVideo` common renderer'ı değildir.

## İlk uygulama dilimleri ve davranış tanıkları

Yeni davranış: bağımsız literal test→doğru nedenle RED→minimal kod→GREEN→audit. Prose grep/mock varlığı kanıt değil; double yalnız dış taşıma sınırındadır.

| Dilim | İlk başarısız olması gereken davranış / gerçek geçiş kanıtı |
|---|---|
| 1. Saf çift-job bridge | Garden/stale audio, değişmiş source/trace/job/request/style, başka context veya cue sırası; rehashed yanlış metin, clone/Proxy/revoked/getter/hook/sparse/extra arg reddi. Geçerli live source'ta bütün on cue eşliği, hooks 0, immutable visual packet. No provider call. |
| 2. Kapalı TTS sınırı | Default call budget 0; missing credential/izin/rights/privacy/endpoint veya aşılmış call/byte/süre/maliyet bütçesinde transport 0. Hata secret/URL/body echo etmez; bilinmeyen sonuç otomatik retry değildir. Önce tek yeni cue'nun yetkili bytes tanığı; yalnız cue clip denir. Tam bağlam iddiası için on cue'nun tamamı ayrı kabul edilir. |
| 3. Yerel byte/decode receipt | Metadata-only başarıya dönüşmez. Eksik/truncated WAV, yanlış magic/codec/kanal/hız, symlink/dot path/yarış/değişmiş hash veya oversize ret; fresh exclusive çıktıda kaynak ve türev SHA/bayt, PCM sample sayısı ve tam decode. İzinli remux varsa PCM payload birebir, hız/gain/resample değişikliği yok. |
| 4. Ses–cue–kelime–kalem bridge | Süre/kelime tahmini yerine gerçek cue PCM ve ölçülen veya insan doğrulanmış kelime aralıkları. Monoton, cue içi bounded ve metin-token kimliğine bağlı zamanlar; eksik/yeniden sıralı/duplicate sözcük, başka ses/trace/frame hash ret. Timestamp kanıtı yoksa word alignment pending. |
| 5. Gerçek renderer/mux | Common live scene'den bounded frame raster→encoder→MP4. Erken/orta/son cue'da decoded frame, gerçek hareket ve konuşma; H.264/AAC beklenen stream, fps/çözünürlük/frame sayısı/süre/boyut ve MP4 SHA/readback. Audio stream yoksa silent; statik SVG/HTML veya sahte receipt video değildir. |

Caller executable/endpoint/bütçe seçmez; kapalı dosya/CPU/deadline sınırları, exclusive çıktı ve partial-failure kaydı gerekir. Legacy prepare 10 MiB/dosya, 40 MiB/toplam; render 64 MiB/180 saniye. Daha geniş attachment metadata sınırı I/O yetkisi değil. Anlatım sığmazsa hızlandırma/kesme yok; clip tam çözüm değildir, yeni kapsam/bütçe ayrıca yetkilendirilir.

## Konuşma süresi, düşünme arası ve anlam

Generic job check_prompt/transfer_prompt sonrası dörder saniye, bağlam başına **8 saniye** ara taşır; bunlar konuşma değildir. measuredSpeechSeconds ile plannedThinkingPauseSeconds ayrı; altı ondalık saniye sample doğrulaması değil. Literal test: on cue birer saniyeyse konuşma 10 + ara 8 = toplam 18; ara bir kez eklenir. Gerçek sessizlik sample sayısıyla kontrol edilir.

Garden minimumları ve voice-direction 5–6 için 0,8 saniye common pause değildir. Pagination timestamp üretmez; TTS cue'yu bir kez okur, sayfaları tekrar etmez. Frame progress'i süre değil. 24→“yirmi dört” token eşlemesi ayrıca ölçülür; karakter oranından zaman uydurulmaz.

Literal anlam tanıkları: 6/8 dakikanın ortak pozitif işaretleri [24,48], `0<t<=48`; 0 dışarıda, 48 içeride, 72 ortak olsa da pencere dışındadır. 24/36 kart için boyutlar [1,2,3,4,6,12] kart/paket; 6 kart/pakette paket sayıları [4,6] paket. Birim/bağlam karışmaz; paket sayısı ortak zaman değildir. Sonuç listesi tek kez okunur; neden, koşullu yöntem, check ve transfer metni kaybolmaz. Bu tanıklardan formal EBOB/EKOK/min-max veya öğrencinin inşa becerisi kabulü çıkarılmaz.

Korunan result/check_answer/summary/transfer_answer metni mevcut scene'de yalnız reveal=true ve progress=1 ile açılır. Ses playback de aynı explicit editor reveal sınırına bağlanmalı; kilitli cue audio/title/desc/aria/caption/future metadata sızdırmamalı. Kelime vurgusu bu mevcut sonucu-tamamlama kuralını sessiz değiştiremez; yeni zamanlı reveal davranışı ayrıca test/karar ister. Verilen tablodan cevabın matematiksel çıkarılabilmesi anti-cheat/auth kanıtı değildir. Transfer için kaynakta yeni şekil yoktur: geometry pending, uydurma kaynak çizimi yok.

## Ayrı insan ve native kapıları

Öğretmen/dinleyici bütün yeni cue'larda sayı/birim/telaffuz, tempo/durak, gerekçe, çocuklaştırmayan hitap, yaş/dil ve tekrar kontrol eder. Voice/style beyanı kimlik/doğallık/ticari hak değildir; garden tercihi common kabulü değildir.

Native: gerçek MP4'yi ses açık baştan sona oynat; decoded başlangıç/orta/son frame, kelime-vurgu, erken yanıt/caption kaybı/pen-label örtüşmesi/taşma, seek/reload ve alt metni denetle. Codec/string başarısı öğretmen/screenreader/tablet kabulü değil. Clip, tam çözüm, yayın ayrı durumdur.

[Clef](../packages/content-factory/providers.mjs) advisory QA, üretici/TTS/yayın hakemi değil. Hak/müfredat/öğretmen/answer/retention pending; reference_only/unverified. Raw PDF/çocuk sesi-verisi gönderilmez. Docker 250 USD ekranı bütçe/bakiye/auth/cloud/on-prem kanıtı değil. Provider/ağ/Drive/DB/browser/Git/SDK 0; .env/credential okunmadı. Yalnız bu belge yazıldı.

## 4 Ekim Sabah Sonrası: İlk Saf Köprü Ve Güncel İstek Uygulandı

`6172682` başlangıcı üzerinde [root teknik kanıtı](GRADE6_COMMON_RELATIONS_VOICE_BRIDGE_ROOT_ACCEPTANCE_2026-10-04.md) ilk dilimi uygular: gerçek canonical fabrika/live-child audit → değişmeyen görsel scene/default job → ayrı beyanlı provider/style ses job/request → gerçek current scene/narration consumer. Aynı iş ID'si farklı revision SHA'larını gizlemez; bütün10cue anlamı/birimi/anchor/durak eşleşir. Bridge kendi local issuance markasını taşır; factory outer-wrapper kökeni iddia edilmez. JSON/deep bridge'ler render yetkisi olmaz.

Yalnız güncel açık cue için tek tam anlatım isteği; sayfa/ilerleme request kimliğini değiştirmez. Protected cue açık reveal ve tamamlanmış ilerleme yoksa voiceRequestnull/hashnull. Metadata'ya konan20 bilinen kanonik cue metni/tekil hash'i iki bağlamda da issuance öncesi reddedilir; parent zaten frozen olsa da bütün request çocukları dondurulur. Bu dar literal izolasyon genel fragment/rephrase/encoding/gizlilik sınıflandırması değildir; style/privacy incelemesi pending. Bu TTS veya exactly-once playback değil, ayrı saf hazırlıktır.28 upstream açık iş ve altı kapı pending; eski canonical snapshot değiştirilmez. İlk1290 sonucu sonrası iki gerçek P2, ayrı RED→GREEN ile kapandı. Final root tam1295/1295, ayrıca postrepair280 gerçek frame/request durumu; yeni audio/video/provider0.

İlk kayıt içindeki “bridge API henüz yok” ifadesi tarihsel durumdur. **Hâlâ uygulanmayanlar:** kapalı yetkili/bütçeli TTS transport, gerçek ses byte/decode ve dinleyici receipt'i, measured word–pen eşlemesi, common renderer/mux/MP4/native playback ve seri yayın. Normal CLI/HTTP/UI bu ses isteğini henüz oynatmaz. Önce dilim2'nin default transport0 ve gerçek tek-cue kabulü; on cue tamamlanmadan tam çözüm denmez. Gece döngüsü yeniden açılmaz.

## 4 Ekim Sabah Sonrası: Kapalı Hazırlık Ve Bellekte PCM Sınırı Uygulandı

`27cae11` başlangıcı üzerine [root teknik kabulü](GRADE6_COMMON_RELATIONS_TTS_PCM_ROOT_ACCEPTANCE_2026-10-04.md) eklendi. Dilim2'nin **saf, çağrısız hazırlığı** gerçek bridge/current cue'dan tek kanonik istek ve yalnız exact doküman profili için unverified protokol adayı üretir; locked cue'da request/body/null-hash sınırı korunur. Transport/credential/yetki/bütçe veya response yolu yok; bütün hazırlıklar held/call0. Bu yüzden dilim2'nin gerçek yetkili tek-cue ses kabulü tamamlandı değildir.

Dilim3'ün **bellekte native WAV/PCM sample decode ve metadata bağı** uygulandı. Canonical mono24kHz/signed16LE başlık, full sample decode, WAV/PCM SHA/boyut/sample/süre gerçek; silence/tone metin okunduğunu kanıtlamaz. Receipt local-unattested; disk/response/exclusive çıktı/türev/readback/yarış/provenance ve dinleyici kabulü açık.120s max profilde costly byte-index enumeration gerçek RED sonrası kaldırıldı; unused native dekorasyonlar hook0 ile ignore edilir. Fiziksel sample süresi measured teacher speech diye sunulmaz.

Yeni `common_relations_audio_preflight.mjs` default `not_run`; yalnız açık sentetik seçenek üç fixed metadata'dan20 current cue bağını doğrular.20 farklı request/audio SHA,53 pending, yeni soru/ses/video/provider/dosya0. Root tam1336/1336, bağımsız yeni41/41 ve negatif audit; CMMI/SPICE veya pedagojik sertifika değil.

[Google API şartlarındaki](https://ai.google.dev/gemini-api/terms) reşit olmayanlara yönelik API-client sınırı ek gerçek karardır: yetişkin offline editörün statik varlık üretmesi kullanımının uygunluğu doğrulanmadı. `store:false` safety-retention yokluğu değildir; commercial/privacy/style/voice/hesap/maliyet izinleri ayrıca açık. Canlı çağrı veya eski sesin yeni metin diye etiketlenmesi yok. Dilim4 measured/human-reviewed word–pen, dilim5 gerçek common MP4/native playback hâlâ açık; gece/sabah takipleri yeniden başlatılmaz.
