# Ortak ilişkiler: saf ses–görsel iş köprüsü

Tarih: 4 Ekim 2026. Bu dilim bir mevcut özgün editör taslağının seçilmiş tek bağlamını, aynı gerekçeli metne ait beyan edilmiş sağlayıcılı ses işiyle bağlar. TTS çağrısı, ses dosyası, video, yeni soru, öğrenci teslimi veya yayın onayı değildir. Kaynak ve DAMA amaç/hak/uzman kapıları açık kalır.

## Sahiplik ve API

Yalnız üç yeni dosya bu dilimde yazıldı:

- `packages/media/grade6_common_relations_voice_bridge.mjs`
- `test/grade6_common_relations_voice_bridge.test.mjs`
- Bu kanıt belgesi.

Eski taslak, bağımsız matematik doğrulayıcı, fabrika, genel medya işi, özel sahne, inceleme görünümü, CLI, kaynak dosyaları ve sağlayıcılar değiştirilmedi. API yerel dosya/ağ/sağlayıcı/ses/veritabanı işlemi yapmaz.

`createGrade6CommonRelationsVoiceBridge(input)` tam bir argüman alır. Kök tam dört alanlıdır: `{factoryPreparation, sourceBindingInput, contextId, voiceJob}`. `contextId` yalnız `repeat` veya `grouping`; `sourceBindingInput` mevcut üç metadata alanıdır. `voiceJob`, mevcut `createReasonedMediaJob` ile aynı kanonik bağlamın izinden üretilmiş, `provider !== null` olan gerçek canlı iş olmalıdır. Kurucu stil/sağlayıcı oluşturma seçenekleri, model çağrısı, oynatma veya ses eki kabul etmez.

Dönüş derin dondurulmuş sekiz alanlıdır: `{schemaVersion, state, contextId, visual, voice, binding, limits, pending}`. Şema `grade6-common-relations-voice-bridge/v1`, durum `editor_voice_bridge_preparation`. `visual` gerçek canlı `{scenePlan, trace, job, request}`; `voice` gerçek canlı `{job, request}` taşır. Bütün cevap taşıyan on adım editöre aittir; bu paket güncel-adım öğrenci önizlemesi değildir.

`auditGrade6CommonRelationsVoiceBridge(bridge)` tam bir argüman alır; canlı yerel WeakSet kaydını denetler. Dönüş `{schemaVersion, state, valid, contextId, bridgeContentSha256, binding, limits, pending}`; anlatım metni yoktur. `valid: true` yalnız bu modülün yerel köprü üretimini ifade eder; kullanıcı/öğrenci yetkisi, uç nokta, gizlilik, haklar veya öğretmen onayı değildir.

## Gerçek tüketim ve güven sınırı

İlk işlem bütün girdinin bounded inert snapshot'ıdır. Proxy ve iptal edilmiş proxy, getter/setter, sembol, gizli alan, fonksiyon/`toJSON`, coercion, döngü, seyrek dizi, desteklenmeyen prototip ve aşırı kendi anahtar/değer profilleri hiçbir kullanıcı hook'u yürütmeden reddedilir. Sınırlar: 100.000 düğüm, derinlik 24, toplam anahtar ve dize UTF-8 bütçesi 2 MiB, dize 65.536 UTF-16 birimi, anahtar 160 birim, nesne 1.024 anahtar ve dizi 2.048 öğe. Sonrasında yalnız kontrol edilmiş düz nesneler ve canlı değişmez yetenekler okunur.

Snapshot'tan yeni gerçek `createGrade6CommonRelationsFactoryPreparation` çağrılır. Tam fabrika içeriği kanonik sıralı alan karşılaştırmasıyla eşleşmelidir; üç kaynak metadata pin'i ve mevcut draft→bağımsız verifier→media→özel scene zinciri yeniden çalışır. Orijinal fabrika içindeki **iki** bağlamın iz ve işlerinin gerçek audit'leri yapılır; orijinal canlı sahne gerçek frame renderer'dan geçer. JSON kopyalarından yeni brand üretmek orijinal girdi doğrulaması yerine geçmez.

Fabrika wrapper'ının issuer WeakSet'i yoktur: aynı kanonik veri ve gerçek canlı değişmez çocuk yeteneklerini koruyan yüzeysel wrapper kopyası kabul edilir; derin/JSON kopyası kabul edilmez. Bu, wrapper köken doğrulaması değildir. Genel medya işi creator-trace nesne referansını dışa sunmaz; köprü canlı issuance ile tam kanonik iz kimliği/hash/içerik anlamını bağlar. Başka bir gerçek kanonik üretimden alınan farklı iz nesnesi aynı kanonik hash ve metinle kabul edilebilir; değiştirilmiş gerekçeli gerçek canlı iz/iş kabul edilmez.

Orijinal ses işinin gerçek audit'i ve tam snapshot'ı, yeni kanonik seçili iz üzerinde `createReasonedMediaJob(trace,{provider,style})` ve `createReasonedMediaAudioRequest` ile bağımsız yeniden oluşturulan beklenen iş/istekle karşılaştırılır. Sadece kimlik veya hash beyanı yeterli değildir. On adımın kimliği, sırası, türü, step bağlantısı, tam metni, metin hash'i, anchor'ları ve planlı düşünme durakları görsel işle aynıdır. Stil hash'inin görsel varsayılandan farklı olması kasıtlı ve beklenen yeni ses işiyle bağlıdır.

Bağımsız denetimde iki gerçek karşı-örnek bulundu; önceki 17 testli freeze nihai kabul için geçersizdir. Birincisinde gerçek canlı ses işinin stil metnine korunan gelecek cue metni eklemek veya sağlayıcı kimliğine gelecek cue SHA'sını koymak, sonraki güncel-adım tüketicisine metadata üzerinden cevap/metin hash'i taşıyabiliyordu. Genel medya işi, stil/sağlayıcı beyanını içerik referansından ayırmıyordu; yeni köprünün kanonik iş eşitliği de aynı metadata'yı beklenen işte yeniden oluşturduğu için bunu reddetmiyordu. Minimal kapı, yeni köprü üretiminden önce **iki kanonik bağlamın bütün 20 cue'sunun** literal tam metnini veya bireysel transcript SHA'sını `style.text`, `provider.id`, `modelId`, `voiceId` içinde taşıyan beyanı reddeder. Hex SHA karşılaştırması büyük/küçük harfi eşdeğer sayar; anlatım metninin harfleri, öğrenci metni veya çıktısı dönüştürülmez. Aggregate job/bridge hash'leri bu taramanın konusu değildir.

Bu yalnız **bilinen tam kanonik içerik-referansı izolasyonudur**. Parçalar, kodlanmış/yeniden ifade edilmiş metin, kanonik olmayan içerik, kişisel bilgi, kötü niyetli talimat veya genel anlamsal sızıntı/gizlilik sınıflandırması yapılmaz. Metadata/stil gizlilik ve uzman incelemesi pending kalır; güncel-adım iddiası bu dar bilinen referans kapısına ve mevcut reveal sınırına tabidir, genel güvenli öğrenci payload'ı değildir. Diğer geçerli sağlayıcı/stil varyantları, 80 karakterli ID ve 4.096 karakterli çok baytlı stil profili korunur.

İkinci karşı-örnekte orijinal canlı trace/job/scene referanslarını koruyan kanonik wrapper içine yalnız kökü `Object.freeze` edilmiş, alt cue'ları değişebilir bir istek kopyası konabiliyordu. Freeze helper'ın zaten frozen nesnede erken çıkması, audit'in sakladığı digest ile sonraki gerçek JSON'un ayrışmasına yol açıyordu. Minimal onarım, üst nesne frozen olsa da çocukların tamamını recursive dondurur; üst nesneyi yalnız gerektiğinde dondurur. Kanonik unbranded istek kopyasına yeni issuer şartı eklenmez; nesne ve alt cue'ları bridge üretiminde değişmez olur. Bu accepted alias'ın alt nesneleri de dondurulur; sonradan mutasyon testte `TypeError` üretir ve audit digest'i gerçek bütün JSON ile aynı kalır.

Görsel işin sağlayıcısı `null` ve eski generic-geometri hazırlığı unsupported/pending kalır; eski snapshot değiştirilmez. Genel `providerReady` alanı non-null sağlayıcı beyanını gösterir, doğrulanmış uç nokta erişimini değil. Aynı kanonik metne ait başka geçerli sağlayıcı/stil beyanı ayrı hash'li yeni köprü varyantı olarak kabul edilebilir; bu bir ses kataloğu, lisans veya dinleyici kabulü değildir.

Yeni köprü issuer WeakSet'i vardır: derin kopya, JSON kopyası ve yüzeysel bridge kopyası audit'ten geçemez; proxy audit'ten önce okunmaz. Hatalar yalnız sabit `invalid_common_relations_voice_bridge_arguments`, `invalid_common_relations_voice_bridge_input`, `untrusted_common_relations_voice_bridge` veya çıktı bütçesi kodudur; kaynak/sağlayıcı/özel payload yankılanmaz.

## Metadata, matematik ve sayaçlar

`binding` kaynak draft kimliği/hash'i ile ayrı PDF/program metadata lineage'ını, görev/fabrika manifesti/preparation/scene/geometry hash'lerini, iz kimliği/hash'ini, görsel ve ses iş/istek hash'lerini, görsel/ses stil hash'lerini ve beyan edilmiş sağlayıcı kimliklerini bağlar. On `cueMappings` satırı metin yerine metin hash'i, sıra, tür, step, anchor ve düşünme duraklarını taşır. Bu bütün-adım metadata'sı da editör artefaktıdır; gelecekteki adım hash'lerini öğrenciye sunma yetkisi değildir.

Bağımsız mevcut sonlu-modulo doğrulayıcının literal tanıkları korunur: ortak pozitif dakikalar `[24,48]`, ortak kalansız boyutlar `[1,2,3,4,6,12]`, 6 kart/paket örneğinin iki paket sayısı `[4,6]`. Seçili bağlam birimleri `repeat:[minute]`, `grouping:[card_per_package,package]`; eski count/cm aritmetiğine çevrilmez. Genel iz `interpret/text`, `genericNumericStepsChecked:0` ve semantik inceleme pending'dir. Matematik pass insan cevap/pedagoji onayı değildir.

On cue türü: goal, evidence, plan, why, result, check_prompt, check_answer, summary, transfer_prompt, transfer_answer. İki prompt sonrasında 4'er saniye planlanır; toplam 8 saniye **düşünme duraklamasıdır**, ölçülmüş konuşma/video süresi veya sözcük–kalem hizalaması değildir. `measuredSpeechSeconds:null`.

Sayaçlar tam `{existingAuthoredTasks:1, selectedContexts:1, visualJobs:1, voiceVariants:1, newAuthoredQuestions:0, acceptedProductQuestions:0, publishedQuestions:0}`. İki bağlam iki yeni soru sayılmaz; yinelenen köprü üretimi stok veya yayına dönüşmez.

Altı draft kapısının tamamı pending olarak binding'e aktarılır. Fabrika, media preparation ve iki işin bekleyen yükümlülüklerinin birleşimi kayıpsız korunur; bu fixture'da 28 başlık vardır. Tarihsel nested `provider_selected_voice_job_bridge` başlığı da korunur: yerel beyan edilmiş iş köprüsünün varlığı yetkili sağlayıcı/TTS/endpoint/öğretmen kapısını kapatmaz. Zorluk/cevap uzmanı ve native glyph/erişilebilirlik başlıkları silinmez. Nested snapshot'a başarı yazılmaz.

Hak/owner/listener, aktif program ve öğretmen incelemeleri pending; `providerDeclarationOnly:true`. Uç nokta, gizlilik incelemesi, stil kabulü, ses kimliği/metni/byte'ı, oynatma, ses/video üretimi, hizalama, öğrenci ve production/yayın alanları false; sağlayıcı/TTS çağrıları 0.

## RED → GREEN ve taze doğrulama

Gerçek ilk consumer assertion, uygulama yokken:

`node --test --test-name-pattern='consumer gets' test/grade6_common_relations_voice_bridge.test.mjs`

Çıkış 1; 0/1 pass, `voice bridge constructor is missing`. Dinamik import eksik modülü boş API olarak karşılayıp beklenen export'u assertion ile ölçer; import crash RED sayılmadı. Ardından minimal modül yazıldı.

Bekleyen işlerin kayıpsız aktarımı için gerçek ek regression:

`node --test --test-name-pattern='outer pending' test/grade6_common_relations_voice_bridge.test.mjs`

Önce çıkış 1, 0/1; eksik `difficulty_and_answer_expert_review` gözlendi. Minimal upstream pending union düzeltmesi yapıldı; ilgili 15 test 15/15 geçti. Kanonik kabiliyet ve desteklenen üst stil/sağlayıcı profili tanıklarıyla tarihsel toplam 17 test oldu; bağımsız karşı-örnekler bu sayının nihai güvenlik kabulü olmadığını gösterdi.

İki hazırlama testi beklentisi ürün hatası olarak sunulmaz: grouping result konuşma metni kanonik olarak `bir paketteki kart sayısı` söyler; testteki yazılı `kart/paket` alt-dize varsayımı gerçek üretim gözlenerek düzeltildi. Ayrı iz fixture'ının elle değişen alan ekleme sırası genel izdeki insertion-order JSON digest'ini değiştirdi; gerçek ikinci kanonik fabrika iziyle düzeltildi. Ürün anlatımı veya eski digest politikası değiştirilmedi. Dış pending'den yerel başlığı kaldırma/ek completed flag önerisinin bir test denemesi RED oldu; kapsam kararıyla o test kaldırıldı, bu davranış uygulanmadı veya başarı sayılmadı.

Bilinen metadata referansı regresyonu:

`node --test --test-name-pattern='declared style cannot|each declared provider identifier' test/grade6_common_relations_voice_bridge.test.mjs`

Gerçek canlı işler ve mevcut iki bağlam üzerinden uygulama öncesi çıkış 1, **0/2 pass**: 20 cue × (literal tam metin + küçük/büyük harfli SHA) = 60 stil beyanı, 20 cue × üç provider ID alanı × küçük/büyük harfli SHA = 120 sağlayıcı beyanı kabul edildi. Minimal guard sonrası 180 beyanın tamamı sabit input hatasıyla reddedilir; iki test GREEN. Bu bir sahte brand/rehash testi değil, gerçek generic iş tarafından kabul edilen metadata karşı-örneğidir.

Değişmezlik regresyonu:

`node --test --test-name-pattern='canonical shallow-frozen request' test/grade6_common_relations_voice_bridge.test.mjs`

Önce çıkış 1, **0/1 pass**, kabul edilen isteğin cue dizisi frozen olmadığından gerçek assertion başarısız. Minimal recursive freeze düzeltmesinden sonra canonical alias/derin freeze/mutasyon reddi/gerçek JSON domain digest eşitliği geçer. Eski fabrika, generic job ve güncel cue modülleri değiştirilmedi; yeni başarı alanı/issuer/metadata şeması eklenmedi.

Son kendi koşu:

`node --test test/grade6_common_relations_voice_bridge.test.mjs`

Çıkış 0; **20/20 pass, 0 fail/skip**, 5.331930666 saniye; 17/17 önceki sürümün tarihsel sonucudur.

İlişkili gerçek hermetik koşu:

`node --test test/grade6_common_relations_voice_bridge.test.mjs test/grade6_common_relations_current_voice_cue.test.mjs test/grade6_common_relations_factory_preparation.test.mjs test/grade6_common_relations_media_adapter.test.mjs test/grade6_common_relations_scene.test.mjs test/grade6_common_relations_review.test.mjs test/reasoned_media_job.test.mjs test/reasoned_teaching_trace.test.mjs`

Çıkış 0; **121/121 pass, 0 fail/skip**, 5.437462875 saniye (20 bridge + 15 güncel cue + 86 önceki bağlı test). Modül ve test ayrı `node --check` ile çıkış 0. Bu koşu bütün repo testi, provider, native/browser, ses veya video kabulü değildir; tarihsel 103/103 kanıtı önceki sürüme aittir.

## Byte/hash tanıkları ve freeze

Testteki beyan edilmiş üç provider kimliği ve Türkçe stil ile kompakt `JSON.stringify` ölçümü:

| Bağlam | Bridge byte | Binding byte | Audit byte | Bridge domain digest |
| --- | ---: | ---: | ---: | --- |
| repeat | 51.297 | 7.401 | 9.780 | `0261dc842bfd742f57bc4c9ae436c074d57c6d6be5a7dfe9c5f0e1b49f75ca2c` |
| grouping | 50.655 | 7.443 | 9.824 | `611d7f86ce8d01609595b222e31452d92fd89566777b1aba759ac8fdc0ae56de` |

Üst bütçeler bridge 512 KiB, binding/audit ayrı 16 KiB'dır. Genel medya API'sinin 80 karakterli üç provider kimliği ve 4.096 karakterli stil üst profili gerçek olumlu testte kırpılmadan kabul edildi. Çıktı bütçesi aşım guard'ı vardır; kanonik sabit görevde geçerli bir üretimle overflow dalı tetiklendiği iddia edilmez. Snapshot hook tanıklarında çağrı sayısı 0.

Bridge domain digest'i `k12.grade6-common-relations.voice-bridge/v1:` öneki ve bütün JSON ile audit'te tutulur; binding digest'i farklı `...voice-binding/v1:` domain'idir. Raw JSON byte SHA veya newline'lı disk SHA ile aynı değildir. Bu modül çıktı dosyası yazmaz.

Kod/test frozen:

- Modül: **12.378 byte**, SHA-256 `fc69a9802a8c69e0c486f57d2769d5ae148c38d5fbb14af5c5f6329ec848dc3c`.
- Test: **25.410 byte**, SHA-256 `67e1305059162440ee6c73c741d23281011c1d8f6dcab9b7310fbccbbac1e092`.

Yapılmayanlar: canlı endpoint/credential erişimi, gerçek TTS ve byte/transkript dinleme denetimi, MP4/codec/süre/ses, kalem hizalaması, browser/native UI, auth/tenant, öğrenci/veri aktarımı, PDF yeniden byte doğrulaması, Drive, DB, bulk üretim, publication ve Git. Bu saf teknik köprü tamamlandı; bu açık işler tamamlanmış video veya 36 bin kabul edilmiş soru olarak sunulamaz.
