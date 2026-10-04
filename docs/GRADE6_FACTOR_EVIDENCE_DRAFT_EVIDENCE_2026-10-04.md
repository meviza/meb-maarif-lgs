# 6. Sınıf Çarpan Kanıt Panosu - Faz 12 Kanıtı

Durum: Bir adet, cevap taşıyan, yalnız editör incelemesine ayrılmış soru taslağı ve çalışan deterministik matematik denetimi. Bir taslak / bir anlamsal aile / sıfır parametre varyantı / sıfır kabul edilmiş ürün sorusu / sıfır yayımlanmış soru. Bu dilim öğrenciye soru sunmaz, insan onayı üretmez, etkin MEB programını kabul etmez veya bütün müfredat kapsamını kapatmaz.

## Sahiplik ve API

Yalnız üç yeni dosya bu dilimde yazıldı:

- `packages/content-factory/grade6_factor_evidence_draft.mjs`
- `test/grade6_factor_evidence_draft.test.mjs`
- Bu belge.

İki dışa açılan saf API:

```js
createGrade6FactorEvidenceDraft(sourcePlannerInput);
verifyGrade6FactorEvidenceDraft(candidate, sourcePlannerInput);
```

İlk API tam bir, ikinci API tam iki argüman ister. `sourcePlannerInput`, önceki planlayıcının gerçek public metadata girdisidir: `formObservations`, `semanticMatrix`, `sourceScopeInput`. Her çağrıda gerçek `createGrade6ReferenceAuthoringPlan` yeniden çalışır. Gözlem/matris revizyonları ve iki bilinen kaynak satırı aynı önceki pin denetimlerinden geçer. `g6-reference-authoring-16` briefinin task kind'i ve MAT.6.1.1 / MAT.6.1.3 aday bağlantısı ayrı kontrol edilir.

Gönderilmiş plan JSON'u, çağırıcının yeni SHA'sı veya `approved:true` bu girdi yerine geçmez. Denetim, adayın bildirdiği `sourceLineage` ile yeniden oluşturulan plan/brief bağını karşılaştırır. Metadata hash'i kimlik doğrulaması, kaynak gerçekliği, hak izni veya insan kararı değildir. Program kaynağı halen yalnız aday içerik bağlantısıdır; `officialOutcomeCode:null`, etkin yıl/program sürümü null, `activeProgramAccepted:false`, `fullOutcomeCoverage:false`.

Taslak JSON klonu aynı gerçek kaynak girdisiyle matematik denetimine alınabilir; bu klonun basılması veya hashlenmesi yayın/erişim/issuance yetkisi sağlamaz. Denetim sonucu da yalnız editör tanısıdır. Çağırıcı sayı, soru sayısı, aile, prompt, scope, provider veya key şablonu seçemez.

Root ayrıca mevcut authoring CLI'nin `--factor-draft` kapalı seçeneğini bu iki gerçek API'ye bağladı. Bu CLI değişikliği bu üç dosyanın yazarı tarafından yapılmadı. Varsayılan özet ve `--plan` ayrı önceki davranışlardır; normal üretim blueprint'i değiştirilmedi.

## Özgün Yazım ve Kaynak Sınırı

Seçilen brief, çarpanların tamlığı ile asal alt kümesini ayırma amacını taşıyordu. Mevcut yerel sayfa-15 görüntüsü PDF becerisiyle yeniden salt-okunur incelendi: kaynak 16'nın iki başlangıç sayısı, bizim sabit 36 seçimimiz değildir. Kaynakta iki sayının kutulara yayıldığı çizgi düzeni bulunurken bu taslak tek sayı için dört ayrı eş-çarpan / asal-rozet / hedef-toplam kanıt panosu önerir. Kaynak soru kökü, seçenekler, sayı vektörü, kutu koordinatları, SVG veya cevap anahtarı taşınmadı. Yeni indirme, PDF paketi, model/Drive aktarımı veya provider çağrısı yoktur.

Bu sınırlı karşılaştırma bütün soru arşivinde benzerlik taraması değildir. Yaygın matematik amaçları veya sayıların başka kaynaklarda bulunmaması kanıtlanmadı. `originalityVerified:false`, `archiveSimilarityPassed:false`, ticari haklar unverified ve kaynak-model aktarımı kapalı kalır. Kaynak malzemesinin açık erişilebilirliği ticari açık lisans kabulü yapılmaz. Yeni görev kendi editör yazımıdır; hukuki/pedagojik kabul ayrıca gereklidir.

Taslak, MEB kaynağındaki ordinal 16'nın tamamını veya mikroamaçlarını yerine getirmiş öğrenci kanıtı diye sunulmaz. Görev verilmiş kanıtı tanıma/hata denetimidir:

`evidenceKind: recognition_of_given_evidence` / `learnerEvidenceCollected:false` / `fullBriefEvidenceFulfilled:false`.

Öğrencinin kendi çarpan listesini kurması, açıklama kalitesi, ustalık, hız, zekâ veya bütün çıktı kapsamı ölçülmez. MAT.6.1.4 veya kaynaktaki bağlantısız 14/15 için yeni program eşlemesi yoktur.

## Görev, Gerekçe ve Bağımsız Hesap

Görev, dört panodan üç koşulu birlikte sağlayan tek panoyu seçmeyi ister: 36'nın bütün pozitif çarpan çiftleri eksiksiz ve tekrar etmeden bulunmalı; çiftte küçük üye önce olmalı ve eş üyeli çift de bulunmalı; asal rozetlerde yalnız farklı asal çarpanlar bulunmalı; hedef bu farklı asal çarpanların toplamıdır. Prompt'ta eksiksiz bütün çiftler koşulu açıkça yazılır.

El ile türetilmiş kabul değerleri:

- Pozitif bölenler: 1, 2, 3, 4, 6, 9, 12, 18, 36.
- Sırasız eş-çarpan çiftleri: (1,36), (2,18), (3,12), (4,9), (6,6). Son çift bir kez sayılır.
- Farklı asal çarpanlar: 2 ve 3; istenen toplam 5.
- Tek doğru pano: `board-c`.

Diğer panolar ayrı yanlış stratejiler taşır: `board-a` 1'i asal sayar; `board-b` eş çarpanlı çifti atlar; `board-d` aynı asalı üs/tekrar kadar yazıp toplar. Bunlar bir çocuğa tanı veya kalıcı yanlış-anlama etiketi atamaz; yalnız editörün gerekçelendirdiği görev seçenekleridir.

Üretici küçük çarpan üyelerini tarar, eşi bölümle bulur ve asal üslerini ayırarak farklı asal listesini çıkarır. **Denetleyici bu matematik yardımcılarını, yazılmış key'i veya anlatım sonucunu okumadan** 1'den 36'ya kadar bütün kalansız bölenleri ayrı tarar. Her bölenin asal olup olmadığını ayrı deneme bölenleriyle sınar; çiftleri ve asal toplamını yeniden kurar. Dört panonun her birini bu yeniden kurulan kümelere karşı sınar ve tam olarak bir doğru pano şartını kontrol eder. Yanlış key yeniden hashlenmiş olsa da ret edilir; iki doğru veya hiç doğru seçenek de ret edilir.

Tamlık testi çift sırasından bağımsız matematik kümesi üzerinden yapılır; ters üyeli çift, tekrar, eksik/yanlış çarpım kabul edilmez. Sabit editör kaydının kendisi ayrıca kanonik profile bağlanmıştır: farklı sıra/metin/temsil yeni bir kaydın incelenmesi olmadan mevcut kayıt yerine geçmez. Bu tek sabit kayıt genel sayı şablonu veya toplu soru üreticisi değildir.

Anlatımda ne istendiği, 36'nın hangi büyüklük olduğu, neden çiftlerle tamlık denetlendiği, asal alt kümenin neden ayrıca ayrıldığı ve 5'in neyin toplamı olduğu ayrı tutulur. Koşullu kısa yol, küçük üye büyük üyeyi geçtiğinde ters çiftlerin tekrar başladığını açıklar; eş üyeli çifti atlamaz ve asal tanımının yerine geçmez. Transfer örneği 1 için (1,1) çifti, boş asal kümesi ve tanımlanmış boş toplam 0'dır; bağımsız oracle bu özel durumu da denetler.

Bu yerel anlatım nesnesi `reasoned_teaching_trace/v1` veya yeni ses/video zincirine bağlanmış gibi sunulmaz. Öğretici dilin yaş/okuryazarlık uygunluğu ve öğrenci tarafından anlaşılması halen uzman/öğrenci incelemesindedir. 6. sınıf bir aday etikettir; çarpma-bölme, pozitif çarpan ve asal tanımı önkoşullardır.

## Temsil, Sayım ve Yönetişim

Temsil yalnız kapalı, sayısal dört tablo verisidir: `semantic_factor_evidence_boards/v1`; `rendered:false`. SVG/PNG/HTML masa görünümü, alt metin/klavye/ekran okuyucu incelemesi, ses ve video üretilmedi. Görsel gereksinim kapısı kapatılmış değildir. İçerik ve key cevap taşır; bu artifact bir korumalı öğrenci payload'ı değildir.

`activeProgram`, `pedagogy`, `rights`, `difficulty`, `answer`, `accessibility` kapılarının altısı pending kalır. Yerel kesin matematik geçişi uzman cevap kabulü değildir; `gates.answer` onaylanmaz. `humanApproval:null`; learner/publication/production hazır bayrakları false. Sayım, bir taslak ve ayrı bir denetlenmiş taslak sayısını ayırır; kabul edilmiş ve yayımlanmış ürün katkısı ikisinde de 0'dır.

Tekrar çağrı yeni stok oluşturmaz. Farklı geniş/dar kaynak envanteri plan metadata SHA'sını değiştirebilir; fakat `authoredTaskSha256` aynı sabit sorunun anlamsal revizyonunu korur. Böyle metadata varyantlarını yeni soru saymak yasaktır. Her taslağın onaylanmış coverage sözleşmesine girmesi ayrıca mümkün değildir; mevcut `question_coverage_blueprint` bu editor artifact'i reddeder.

DAMA amacı `editor_original_math_draft`; owner/steward/retention pending; gerçek öğrenen verisi yok. Bu metadata DAMA/CMMI/SPICE sertifikasyonu değildir. Bu modül disk/ağ/model/hesap/anahtar/Drive/DB I/O yapmaz. Kanonik public JSON okuması mevcut CLI/test çağırıcısının işidir.

## Bounded Ret ve TDD Kanıtı

Aday snapshot: en çok 4096 node, depth 16, 64 array entries / record keys, key 128 karakter, değer string'i 8192 karakter ve keys+values toplam 65536 UTF-8 byte. Gizli/symbol/accessor/function/custom prototype, Proxy/revoked Proxy, sparse array ve döngü reddedilir. Problem yalnız sabit 36 ve tam dört belirli kimlikli pano kabul eder; her pano en çok 16 çift / 16 rozet, çiftin iki üyesi ve pozitif sınırlı tamsayı profili taşır. Kaynak snapshot'ı önceki planlayıcının ayrı daha geniş public metadata sınırlarından geçer. Bu sınırlar metnin kişisel veri olmadığını otomatik tespit garantisi değildir.

İlk 15 test implementation öncesi çalıştırıldı: beklenen eksik API assertion'larıyla 0/15 RED. Gerçek üretici ve bağımsız oracle sonrası 15/15 GREEN. El ile yazılmış literal doğru key/kümeler, kaynak/purpose/scope, yanlış key, iki/sıfır doğru pano, eksik/ters/tekrar çarpan çifti, 1-asal/kompozit/tekrar-asal/yanlış toplam, yeniden hashlenmiş değişiklikler ve pending kapılar sınandı.

Sonraki regression: 16 PASS / 1 RED. Düz veri kopyası güvenli olsa da açıklama `steps:{}` alanına `.map` çağrılıp native TypeError üretiliyordu. Systematic-debugging kök nedenini semantik dizi/step kontrolünün eksikliği olarak ayırdı; Array + kapalı step denetimi eklendi. Null/yanlış tip adımlar artık kontrollü failed diagnostic döndürür; 17/17 GREEN. Aynı dönemde eklenen kaynak-hook/onay testi mevcut ret davranışını karakterize eder; onun için yeni RED iddiası yoktur.

Root'un prompt'taki bütün çiftler koşulunu açık yazdırması editör açıklığı düzeltmesidir; prose için sahte bir yeni TDD davranışı veya string-grep testi üretilmedi. Var olan eksik çift matematik ret testleri korunur.

Son taze doğrulama: own suite 17/17; own + root CLI 21/21; on dosyalı birleşik suite 145/145 PASS, 0 fail/skip, exit 0. Modül ve test syntax exit 0.

```sh
node --test test/grade6_factor_evidence_draft.test.mjs
node --test test/grade6_factor_evidence_draft.test.mjs test/grade6_reference_authoring_plan.test.mjs test/grade6_reference_authoring_cli.test.mjs test/grade6_question_form_observations.test.mjs test/grade6_source_semantic_matrix.test.mjs test/source_scope_gaps.test.mjs test/question_coverage_blueprint.test.mjs test/content_factory_pilot.test.mjs test/reasoned_math_adapter.test.mjs test/reasoned_teaching_trace.test.mjs
node --check packages/content-factory/grade6_factor_evidence_draft.mjs
node --check test/grade6_factor_evidence_draft.test.mjs
```

Birleşik çalışmada eski geometry/factory/teaching-guard testleri de yürütülür; yeni soru o eski renderer/medya sözleşmesine bağlanmış değildir. TDD ve writing-good-tests bağımsız literal beklentileri, verification taze gerçek komutları, PDF yalnız yerel kaynak karşılaştırmasını ve systematic-debugging dar ret düzeltmesini yönlendirdi. İnsan raporu prose testi yapılmadı.

## Donmuş Kayıt ve Bekleyenler

Gerçek main + supplement public snapshot'ıyla CLI opt-in ölçümü: draft 6859 bayt; diagnostic 1298 bayt; preview 8235 bayt. Draft SHA `2ea1112445dac6db5f22e15958ab37593fdc3123b975f7bd8ec705c66318f4d2`; authored task SHA `1b1c0c3a8aff2d6358d235068042c89bf2ef244daa8d3ea56b7c515c1bc9e892`. Plan SHA `cb53aa3522b9e9003ecddef79f19461d465da12ba53f1336391bb15c0f1dff51`; brief SHA `f04b7661a277e3b48eecdd73cb5dc82b7551e949e392dac87636418c4f11a381`. Bunlar bütünlük/soybağı ayrımıdır; authority değildir.

Implementation SHA `03417f7d144b9200b7f3f9a2303a99d7ab963136068998a1e0ad00b3bbb0956e`; test SHA `1414539ebf32aa4f7b00be53276dc699d95f31a89069a977433a5dc48f98cfd7`. Belge kendi hash'ini iddia etmez; ayrı freeze raporunda verilir.

Bekleyenler: bağımsız kişi/uzman incelemesi; etkin program ve hak kararı; gerçek benzerlik taraması; tablo renderi ve native UI/erişilebilirlik; kendi listesini kuran öğrenci görevleri; zorluk kalibrasyonu; güvenilir insan kararı/approved blueprint; yeni ses/video/resolver zinciri. Testler, yerel metadata veya JSON onay bayrağı bunların yerine geçmez. Git/common docs/README, mevcut kaynak JSON'ları, provider veya öğrenci kanalı bu dosyaların yazarı tarafından değiştirilmedi.
