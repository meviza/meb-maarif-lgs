# İçerik fabrikası: çalıştırılabilir yerel pilot

Bu bir **özel editör inceleme pilotudur**. Öğrenci teslimi, gerçek model üretimi, yayın, MEB onayı, pedagojik sertifika, zekâ ölçümü ve MP4 üretimi değildir. Resmî öğrenme çıktısı uydurulmaz; başlangıç eşlemesi `unresolved` kalır.

## Çalıştırma

```sh
node --test test/content_factory_pilot.test.mjs
node tools/content_factory_pilot.mjs --count 100 --out /absolute/path/to/empty-output-directory
```

`--out` açıkça belirtilmiş ve boş bir dizin olmalıdır; mevcut raporların üstüne yazılmaz. Hiçbir ağ çağrısı, SDK/model indirme veya öğrenci verisi aktarımı yapılmaz. `--metadata /absolute/path/mapping.json` yazar kaynağı, müfredat ve yönetişim tanımlarını besler; dosyadaki “onaylı” iddiası kanıt yerine geçmez.

Çıktılar: tam `audit.json` ve `batch.json`, 12 vektör SVG çizimi, yerel `preview.html`, soruya bağlı çözüm sahneleri ve konu anlatımı taslakları. Önizlemede “İleri/Geri” düğmeleri çözüm grafiğindeki adımları gösterir. Bu HTML **cevap anahtarı içerir ve öğrenci arayüzüne sunulamaz**.

## Üretim ve çeşitlilik

Altı akıl yürütme ailesi: doğrudan çevre, doğrudan alan, alandan bilinmeyen kenar, çevreden bilinmeyen kenar, alan/çevre hata tanılama, açıklıklı sınır uzunluğu. Aile başına en fazla iki sayısal varyant tutulur. 100 adayın 12'si yerel aritmetik kontrollerinden geçen taslak olur; 69'u `low_diversity_variant_cap`, 19'u `duplicate_problem` ile reddedilir. Döndürülmüş aynı dikdörtgen de kopya sayılır. Bu sınır, sayıları değiştirilmiş yüzlerce soruyu “çeşitlilik” diye saymayı önler. Altı aile tüm matematik/geom. müfredatını veya gerçek semantik çeşitliliği temsil etmez.

Kaynak kitap/soru metni yüklenmez ve kopyalanmaz. Bu yüzden “MEB arşivleriyle karşılaştırıldı, benzersizdir” denmez; arşiv benzerliği kontrolü henüz bağlı değildir. Exact/problem duplicate kontrolü id veya hikâye değiştirilmesini taze soru saymaz. Bu pilotun çeşitlilik sınırı, gelecekte editör onaylı soru aileleri ve kapsam hücreleri için dağıtım kapısına dönüşmelidir.

## Doğrulama

- Üretici çevre/alan formüllerini kullanır; ayrı doğrulayıcı kenarları toplar ve birim kare sıralarını sayar. Bu iki kod yolu aritmetik kanıt sağlar; bağımsız insan veya ikinci AI incelemesi değildir.
- Dört seçenek benzersizdir; seçilen seçenek gerçek problemle tekrar çözülür.
- Geometri pozitif/tamsayı, sınırlı boyutlar ve geçerli açıklıkla kontrol edilir. Hata tanılama örneğinde “yanlış” öğrenci işlemi tesadüfen doğru sonuç veremez.
- SVG, verilen niceliklerle deterministik üretilir; bilinmeyen kenarın etiketi gizlenir. Şekil açıkça ölçekli değildir. Soru metni, cevap birimi, alt metin, çizim ve çözüm grafiği probleme bağlı yeniden üretilen beklentiyle karşılaştırılır; yalnız SHA-256 tutarlılığı yetmez. Yanlış soru metni/birim/alt yeniden hashlenmiş olsa da reddedilir.
- Zorluk `AUTHOR_ESTIMATED` etiketlidir. Öğrencinin bilişsel/sezgisel kapasitesine ilişkin psikometrik veya kalıcı yetenek sonucu çıkarılmaz.

Bu pilotta durumlar `draft -> automated_pass -> expert_approved -> published` olarak tanınır; **yalnız `draft` kullanılabilir**. `localMathChecks: passed`, `automated_pass` değildir. Müfredat kayıt çözümleme, dil/pedagoji, arşiv benzerliği, hak denetimi ve güvenilir uzman karar deposu bağlanmadan diğer durumlara geçilemez. Çağıranın gönderdiği `expertApproval` bayrağı kabul edilmez.

## Model ayrımı ve Clef Flash

Cloudflare'ın [resmî Clef Flash sayfası](https://developers.cloudflare.com/workers-ai/models/clef-flash/) onu durum ve tipli sorulardan seçenek olasılıkları döndüren çok kipli karar modeli olarak tanımlar. Bu nedenle serbest metin soru, çizim veya video üreticisi yerine **ikincil denetim** rolündedir.

`providers.mjs` sağlayıcıdan bağımsız, en fazla 100 taslaklık üretim isteği ve enjekte edilen üretim transportu içerir. Sağlayıcı yoksa `model_not_configured` döner; başarısız çağrı içerikmiş gibi gösterilmez. Başka bir üretim modeli, lisans/maliyet/veri aktarımı incelemesiyle ayrıca bağlanmalıdır.

Clef adaptörü `CLOUDFLARE_ACCOUNT_ID` ve `CLOUDFLARE_AUTH_TOKEN` (alternatif `CLOUDFLARE_API_TOKEN`) ortam değişkenlerini kullanır. Sırlar rapora yazılmaz. Resmî Workers AI REST uç noktası, `model: clef-flash`, `state`, iki `noul` denetim sorusu, 30 saniye zaman aşımı ve fail-closed yanıt kontrolü uygulanır. [Resmî çıktı şemasına](https://developers.cloudflare.com/workers-ai/models/clef-flash/schema-output.json) göre cevap doğrudan sayı değil `{type: "noul", noul: probability}` olmalıdır; model/usage alanları da doğrulanır. **CLI bu adaptörü çağırmaz.** Adaptör testleri ağ yerine kontrollü transport kullanır; canlı servis kanıtı değildir.

Görüntü verilmezse **metin QA** yapılır; SVG doğrudan vision girdisi değildir ve sonuç `not_run_svg_requires_rasterization` etiketlidir. Opsiyonel `evaluate(question, {reviewedRasters})`, her raster için `contentType`, düz `base64`, `sha256`, `sourceContentSha256`, `sourceVisualSha256`, `reviewRecordId` ister. Mevcut doğrulanmış soru/çizim hashlerine bağlanmayan dosya gönderilmez. [Resmî giriş şemasına](https://developers.cloudflare.com/workers-ai/models/clef-flash/schema-input.json) uygun olarak `images: [{content_type, base64}]` gönderilir ve üçüncü `diagram_aligned` sorusu eklenir.

En fazla dört PNG/JPEG/WebP, her biri 4 MiB ve 16 milyon piksel, toplam 8 MiB çözülmüş byte ve 13 MiB istek sınırı kontrol edilir. MIME/magic başlığı, base64 kanonikliği, görüntü boyutu ve raster SHA-256 kontrol edilir; uzak URL ve SVG reddedilir. Bu **bounded header/container kontrolüdür**, tam raster decode veya insanın gerçekten onay verdiğinin kanıtı değildir. `reviewRecordId` yalnız kayıt referansıdır; güvenilir inceleme deposu sonraki entegrasyondur. Raster renderer henüz bağlı değildir; bir incelemeci mevcut soruyla uyumlu, ayrı gözden geçirilmiş raster sağlamalıdır. Model olasılıkları yayın onayı ve matematiksel doğruluk kanıtı değildir; görüntü sonucu `advisory_result_not_expert_approval` ve kalibrasyon bekler.

## Konu anlatımı ve videolu çözüm

`createLesson` kavram, amaç, doğrulanmış çözülmüş örnek ve öğretmen ipucunu aynı soru/çözüm özetine bağlar. `createStoryboard` her doğrulanmış çözüm adımından zamanlı SVG sahnesi, ifade, sayısal değer ve transcript üretir. Eski/yanlış çözümden sahne üretimi durur.

Sonraki gerçek video yolu: güvenilir çözüm grafiği -> uzman incelemiş sahne -> render edilmiş kareler -> ses/altyazı -> karedeki sayı/metin/görsel kontrolü -> uzman onayı -> MP4/uyarlanabilir yayın. Büyük video/konuşma paketleri kurulmamıştır; şimdiki çıktı ses veya MP4 varmış gibi raporlanmaz.

## DAMA kanıtları ve kalan boşluklar

Kaynak/purpose/hak statüsü, müfredat sürümü/öğrenme çıktısı eşlemesi, owner/steward/retention alanları, içerik ve çizim özetleri, kalite sonuçları, red nedeni, kapsam ailesi ve kapalı yayın kapısı aynı rapordadır. Bu yalnız yerel veri sözleşmesi/pilot kanıtıdır; tüm DAMA alanlarının işletildiği, CMMI Level 3 veya SPICE Level 2 değerlendirmesi alındığı anlamına gelmez.

Kalanlar: gerçek kanonik kayıt çözümleme ve rol yetkileri; resmî arşiv erişim/hak/benzerlik kanıtı; tüm derslerin kapsam kotaları; dil/pedagoji ve erişilebilirlik uzman incelemesi; gerçek generatif model; görüntülü Clef kalibrasyonu; onay/değişmez kayıt/yayın işlemi; Drive kalıcı saklama ve geri yükleme; ses/MP4; gerçek öğrenci pilotu ve istatistiksel madde kalibrasyonu. Bunlar bağlanmadan 36.000 soru üretimine geçilmemelidir.

## Gerçek Cloudflare metin üretim transportu — bağlı, canlı doğrulama bekliyor

`cloudflare_generator.mjs` yalnız [resmî GLM-4.7-Flash](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/) modelinin transportunu uygular. [Senkron giriş](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/sync-input.json) ve [çıktı şeması](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/sync-output.json) doğrulandı. Metin üretimi Clef'ten ayrıdır; GLM seçimi **Türkçe eğitim kalitesi benchmark'ı geçtiği anlamına gelmez**.

Ortam: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AUTH_TOKEN` veya `CLOUDFLARE_API_TOKEN`, tam olarak `CLOUDFLARE_GENERATOR_MODEL=@cf/zai-org/glm-4.7-flash`. Varsayılan yapılandırmasızdır; key veya model eksikse `model_not_configured` verir. Endpoint/model kullanıcı girdisinden alınmaz.

```js
const generator = createCloudflareGenerator({ env: process.env });
// Açık opt-in ve bütçe olmadan ağ çağrısı yapılmaz.
const result = await generator.generate(request, {
  allowLive: true, maxCompletionTokens: 2048, maxEstimatedUsd: 0.01,
});
```

`request`, `buildGenerationRequest` çıktısı ile `taskSpec` nesnesini birleştirir: sınıf, ders, mikro konu yolu, min/max yaş bandı, öğrenme amacı, hedef yanlış kavramlar, soru aileleri ve `AUTHOR_ESTIMATED` zorluk. Kapalı alan listeleri öğrenci kimliklerini, ham MEB PDF/metnini ve bilinmeyen içerik alanlarını reddeder. Bu bir otomatik PII tespit sertifikası değildir; açık alanlara gizlenmiş hassas metin için ayrıca kaynak inceleme gerekir.

En fazla 100 taslak/istek, 16 KiB bağlam, 8.192 completion token, 1 MiB HTTP yanıtı ve 512 KiB model metni sınırı vardır. Küçük pilotlarda 1–5 soru önerilir; 100 soruyu tek küçük-token çağrıda tamamlayamadığında modelin kesilmiş yanıtı kabul edilmez. Bütçe kontrolü yalnız promptu değil **JSON şeması ve tüm sabitler dahil serileştirilmiş isteğin UTF-8 byte sayısını** kapsar: `estimatedInputTokenCeiling = requestBytes + 512`, ardından bu giriş tahmini ve maksimum completion tokenları 2026-10-03 yayımlanmış token fiyatlarıyla hesaplanır. Audit'te prompt/request byte sayıları ve giriş token tahmini ayrı kayıtlıdır. Bu muhafazakâr yerel tahmin **sağlayıcının gerçek token ölçümü veya billing cap'i değildir**; `maxEstimatedUsd` yalnız çağrı öncesi tahmini bütçe yapılandırmasıdır, sağlayıcı faturası veya gelecekteki fiyatlar için garanti değildir. Fiyatlar canlı pilot öncesi yeniden doğrulanmalı, gerçek hesap harcama sınırı ayrıca uygulanmalıdır.

İstek `prompt`, `max_completion_tokens`, `stream:false`, `store:false`, düşünme kapalı ve katı `json_schema` gönderir. Yanıt `finish_reason:stop`, rol/refusal/model/usage, JSON biçimi, tam soru sayısı, benzersiz kimlikler, kaynak/müfredat hashleri, kapsam hücresi ve taslak alanlarıyla kontrol edilir. Görsel yalnız deklaratif `visualSpec` olarak gelir; ham SVG/HTML/URL kabul edilmez. 429, kesilme, parse veya şema hatasında **ücretli otomatik tekrar yapılmaz**.

Çıktı `cloudflare-generated-draft/v1` türünde **doğrulanmamış taslaktır**; deterministik matematik pilotuymuş gibi kabul edilmez. Doğru yanıt, telif, müfredat, pedagoji, render ve Clef kalibrasyonu sonraki kapılardır. Audit'te request/context/response SHA-256, kullanım tokenları, bütçe ve model kaydı bulunur; token sırrı veya ham upstream hata gövdesi bulunmaz. Mevcut oturumda canlı çağrı/benchmark yapılmadı; yalnız sınır-transport testleriyle doğrulandı. CLI bunu otomatik çağırmaz.
