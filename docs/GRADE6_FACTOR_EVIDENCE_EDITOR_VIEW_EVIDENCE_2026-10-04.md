# 6. sınıf çarpan kanıtı: Sınırlı editör HTML görünümü

Tarih: 2026-10-04. Durum: **Editör incelemesi için bir HTML hazırlanıyor; öğrenci sunumu, kabul veya yayın değildir.**

Bu dilim, daha önce hazırlanmış tek özgün `grade6-factor-evidence-board-v1` taslağını dört gerçek semantik tabloyla gösterir. Yeni soru ailesi, sayı varyantı, soru üretimi veya ek stok oluşturmaz. Dört pano, tek sorunun farklı doğruluk koşullarını temsil eden dört seçeneğidir; dört ayrı soru değildir.

## Sahiplik ve API

Bu dilimin yeni dosyaları:

- `packages/content-factory/grade6_factor_evidence_editor_view.mjs`
- `test/grade6_factor_evidence_editor_view.test.mjs`
- Bu kanıt belgesi.

Eski taslak/verifier, plan, kaynak JSON, CLI, SQL, notebook ve ortak dokümanlar bu yazar tarafından değiştirilmedi. CLI ve gerçek tarayıcı/görüntü kanıtı ana ajan tarafından ayrı yürütülür.

```js
renderGrade6FactorEvidenceEditorView(candidate, sourcePlannerInput)
```

Tam iki argüman gerekir. Eksik/fazla argüman `invalid_factor_editor_view_arguments` hatası verir. Geçersiz taslak veya kaynak `invalid_factor_editor_view_input` sabit hatası verir: ham veri, ayrıntılı verifier hata metni veya HTML döndürülmez. Şablon, sayı, sayı adedi, dosya yolu, rol, öğrenci, onay veya hook seçeneği yoktur.

Başarılı dönüş, iç içe dondurulmuş şu küçük nesnedir:

```js
{
  schemaVersion: 'grade6-factor-evidence-editor-view/v1',
  state: 'editor_review_only',
  html: '<!doctype html>...',
  manifest: { /* içerik/hash/durum/ölçü sınırları */ }
}
```

Modülün dosya sistemi, sağlayıcı, ağ, tarayıcı veya gerçek öğrenci verisi giriş noktası yoktur. Testler mevcut yerel kamusal kaynak metaverilerini okur; kaynak PDF indirme/yeniden okuma yapmaz.

## Verifier ve yeniden kurma sınırı

İlk işlem mevcut `verifyGrade6FactorEvidenceDraft(candidate, sourcePlannerInput)` bağımsız matematik ve kanonik metaveri denetimidir. Başarısız denetim hiçbir HTML üretmez.

Başarılı denetimden sonra **çağıranın candidate nesnesi yeniden okunmaz**. `createGrade6FactorEvidenceDraft(sourcePlannerInput)` ile kanonik taslak tekrar kurulur. Başlık, soru, tablolar, rozetler, çözüm ve metaveri yalnız bu güvenli sabit kayıttan türetilir. Verifier raporu da güvenli dondurulmuş tanısal sonuçtur. Kaynak metaverileri yeniden mevcut planner'ın descriptor-safe sınırından geçer; bu işlem metaveri zinciridir, kaynağın resmî kimlik doğrulaması veya taze PDF bayt doğrulaması değildir.

Çağıran tarafından yeniden hashlenen yanlış anahtar, eksik kare çift, yanlış/tekrarlı asal rozet, değişmiş amaç, farklı sınıf, ek MAT.6.1.4 bağı veya insan-onayı iddiası geçemez. Geçerli serialized clone aynı sınırlı editör görünümünü üretebilir; clone/hash bir yetki, yayın veya issuance markası değildir.

Görünüm kaynak taslağını değiştirmez. Kaynak taslağındaki `representation.rendered: false` aynen kalır. Ayrı manifest yalnız bu renderer'ın bir HTML ürettiğini söyler; eski JSON'a render kabulü yazmaz.

## Gerçekte gösterilen matematik ve semantik

Dört ayrı `article` ve dört ayrı `table` bulunur. Her tabloda gerçek `caption`, üç `scope="col"` başlık ve `tbody` vardır. Küçük çarpan hücresi `scope="row"` satır başlığıdır. Her satır iki çarpanı ve bunların çarpımını literal sayı olarak gösterir.

Bağımsız elle kontrol edilen hücre beklentileri:

| Pano | Pozitif çarpan çiftleri | Asal rozetleri | Toplam |
| --- | --- | --- | --- |
| A | 1×36, 2×18, 3×12, 4×9, 6×6 | 1, 2, 3 | 6 |
| B | 1×36, 2×18, 3×12, 4×9 | 2, 3 | 5 |
| C | 1×36, 2×18, 3×12, 4×9, 6×6 | 2, 3 | 5 |
| D | 1×36, 2×18, 3×12, 4×9, 6×6 | 2, 2, 3, 3 | 10 |

Toplam **19 çarpan satırı**, **11 rozet**, **12 sütun başlığı**. Eksik kare çift ve tekrarlı/yanlış asal rozetler renderer tarafından düzeltilmez; yanlış strateji seçeneklerinin anlamını korumak için aynen gösterilir. Kaynakta kullanılan iki-sayı fan-out düzeni kopyalanmaz; mevcut özgün tek-sayı/dört-kanıt tablosu düzeni gösterilir. Bu sınırlı yapısal fark bütün arşiv için intihal taraması veya ticari hak açıklığı kanıtı değildir.

Varsayılan dört kart aynı tarafsız sınıfa ve biçime sahiptir. Doğru/yanlış rengi, doğruluk etiketi, seçim, işaret kutusu veya correctness ARIA/data niteliği yoktur. Panoların farklı sayıları ve eksik çiftleri elbette sorunun kendisinin görünür kanıtıdır; bunları gizlemek soruyu değiştirirdi.

## Gerekçeli çözüm ve cevap sınırı

Tek `details`/`summary` çözüm bölümü ilk HTML'de kapalıdır (`open` yok). Şunları içerir:

- Ne istendiği ve verilen 36'nın neyi temsil ettiği.
- Seçilen yol ve bu yolun neden seçildiği.
- Pozitif tam sayı, küçük çarpan sırası ve eş çarpan çiftinin dahil edilmesi koşulları.
- Üç adım: tüm çiftleri tamamlama → farklı asal çarpanları ayırma → istenen toplamı bulma. Her adımın gerekçesi, sonucu ve sonucun anlamı vardır.
- Çift arama kısa yolunun neden çalıştığı, kontrolü, asallık kontrolünün yerini almadığı ve sıfıra uygulanmadığı sınırı.
- Başlangıç sayısı 1 için aktarım: 1×1 çift; asal rozet yok; boş rozet toplamı 0. Bu öğreti örneğidir, alınmış öğrenci cevabı değildir.
- Yalnız çözüm içinde doğru Pano C ve diğer panoların başarısız koşulları.

**HTML cevap içerir.** Kapalı `details` öğrenme deneyimi kolaylığıdır; güvenlik, sınav cevabı koruması, erişim kontrolü veya öğrenci payload'ı koruması değildir. HTML'nin tamamını alan biri çözümü okuyabilir. Bu belge yalnız editör inceleme artefaktıdır; öğrenci teslimatı için farklı cevap/görünürlük ve yetki sözleşmesi gerekir.

Bu soru verilmiş kanıtı tanıma ve hata analizi talep eder (`recognition_of_given_evidence`). Öğrencinin bütün çarpan listesini kendisinin kurması, açıklaması, ustalığı, zekâsı, bilişsel kapasitesi, kariyer eğilimi veya soru çözme hızının ölçüldüğü iddia edilmez. `fullBriefEvidenceFulfilled`, `learnerEvidenceCollected` ve `fullOutcomeCoverage` false kalır.

## HTML/CSS ve sınırları

HTML Türkçe `lang="tr"`, UTF-8 metaverisi ve viewport metaverisi içerir. Başlık 36'yı ve editör kapsamını açıklar. Gövde/tablo/taban yazısı 18 px tasarlanmıştır; sistem fontları, tabular sayılar, tek sütun dar ekran ve iki sütun geniş ekran CSS'si kullanılır. Amaçlanan ayrı inceleme ölçüleri 390×844 ve 1440×1000'dır.

Modül testi bunların gerçek tarayıcıda sığdığını veya computed fontların tümünü ölçtüğünü iddia etmez. CSS satırlarını bire bir eşleyen font/grid/media testleri ana ajanın inceleme önerisiyle kaldırıldı: bir CSS yeniden tasarımını otomatik hata sayan change-detector değildir. Gerçek computed ölçüm, ekran görüntüsü, yatay taşma, pointer ve klavye ile açma/kapama, ekran okuyucu ve pedagojik görsel kabul ana ajan/uzman denetiminin ayrı kanıtlarıdır; bu belgede yapılmış sayılmaz.

Betik, dış font, icon seti, SVG, raster resim, ses, video, iframe, form, düğme veya uzak asset yoktur. CSS `url`, import veya font-face içermez. Tüm dinamik metinler ve nitelik değerleri escaped literal metin olarak yerleştirilir. Geçersiz HTML/enjeksiyon metni kanonik taslak denetimini geçemediği için çıktı veya hata mesajına yankılanmaz.

Sabit meta CSP script, img, media, connect, form-action ve base-uri yeteneklerini kapatır; yalnız gömülü CSS'ye izin verir. Bu meta etiketi gerçek HTTP başlıkları, kullanıcı kimlik doğrulaması, route güvenliği, OS kaynak koruması veya üretim güvenlik sertifikası değildir. Modül kendi başına sunucu başlatmaz.

Çıktı bütçeleri: HTML en fazla 65.536 UTF-8 bayt; manifest en fazla 16.384 UTF-8 bayt. Çağıran sayısal/metinsel şablon veya büyük varyant belirleyemez. Mevcut verifier aday veriye node/depth/byte/array/record bütçelerini ve getter/proxy/cycle/sparse/hidden/prototype/finite-number kapılarını uygular. Görünüm bu sınırı gevşetmez; verifier'dan sonra yalnız yeniden kurulmuş sabit kaydı kullanır.

## DAMA ve durumların ayrımı

Manifest kaynak/draft/task/plan revizyon SHA'larını, üretilen HTML SHA ve tam bayt sayısını taşır. Hashler izlenebilirlik ölçüsüdür; hak, onay, aktif program veya öğrenci kimlik yetkisi değildir.

Etkin akademik yıl, program sürümü ve resmî kazanım kodu null kalır. MAT.6.1.1 ve MAT.6.1.3 yalnız eski taslağın önerilen içerik bağlarıdır. Kaynak örneklerdeki 14/15 null kazanımlar veya MAT.6.1.4 örnek açığı bu görünümle kapanmaz. Taze kaynak PDF bayt denetimi 0'dır.

Altı kapı hâlâ `pending`: etkin program, pedagoji, haklar, zorluk, uzman yanıt incelemesi ve erişilebilirlik. Yerel matematik denetiminin geçmesi `answer: approved` anlamına gelmez. `humanApproval: null`, learner/publication/production readiness false, native visual/accessibility pass false. DAMA, CMMI veya SPICE sertifikası/uygunluk değerlendirmesi yapılmış sayılmaz.

Sayım: **1 mevcut taslak / 0 kabul edilen ürün sorusu / 0 yayımlanan soru**. Renderer faaliyeti: **1 HTML / 0 görüntü / 0 ses / 0 video / 0 ağ / 0 sağlayıcı çağrısı**. Tekrarlanan çağrılar farklı soru stoku oluşturmaz.

## Gerçek TDD ve taze doğrulama

1. İlk testler üretim modülünden önce yazıldı. Eksik export assertion gözlendi: `node --test test/grade6_factor_evidence_editor_view.test.mjs` → **0 PASS / 14 FAIL**, exit 1. Beklenen eksik özellik mesajı: `factor evidence editor renderer is missing`.
2. Minimal gerçek renderer yazıldı. Aynı komut → **14/14 PASS**, 0 skip, exit 0.
3. CSS bire bir redesign-detector assertions kaldırıldı; bu test temizliği yeni davranış veya yeni RED→GREEN diye sunulmaz. Emitted asset/ağ yasağı ve gerçek hücre semantiği testleri korundu.
   Footer ayrıca HTML tablosu ile PNG/SVG görsel dosyası ayrımını açık söyleyecek şekilde netleştirildi; bu bir prose düzeltmesidir, yeni davranış RED→GREEN diye sayılmaz.
4. Taze birleşik test:

```sh
node --test test/grade6_factor_evidence_editor_view.test.mjs test/grade6_factor_evidence_draft.test.mjs test/grade6_reference_authoring_plan.test.mjs test/grade6_reference_authoring_cli.test.mjs
```

Sonuç: **52/52 PASS**, 0 fail, 0 skip, exit 0; görünüm14 + taslak17 + planner16 + ana ajan CLI5. Root CLI işi bu yazarın owned dosyası değildir; birleşik koşuda gerçek mevcut CLI testleri ayrıca çalıştırılmıştır.

```sh
node --check packages/content-factory/grade6_factor_evidence_editor_view.mjs
node --check test/grade6_factor_evidence_editor_view.test.mjs
```

İkisi de exit 0.

Testler mevcut gerçek kaynak metaverileriyle üretici/verifier/renderer'ı birlikte çalıştırır. HTML'nin dar test parser'ı gerçek emitted element/table/body/attribute ağacını okur; üretim kaynak kodunu grep etmez ve bir DOM/browser yerine geçmez. Beklenen çift, rozet ve toplamlar elle türetilmiş literal değerlerdir; renderer'dan üretilmez.

Negatifler: yanlış anahtar/kare çift/asallar/çoklu doğru seçenek, yeniden hashlenen kaynak/scope/purpose/gate değişimi, HTML payload'ı, malformed veri, getter/proxy/revoked/nested getter, cycle/sparse/hidden/oversize/coercion ve fazla argüman; çağıran hook sayacı 0. Dar kaynak revizyonu kendi taslağını üretebilir; farklı planın candidate'ını ödünç alamaz. Doğru clone incelemeyi tekrar yapabilir ama kabul/yayın yetkisi kazanmaz.

## Taze kanonik ölçüler ve frozen dosyalar

Yerel mevcut ana/supplement kaynak metaverilerinden actual producer→renderer çalıştırması:

- Draft SHA: `2ea1112445dac6db5f22e15958ab37593fdc3123b975f7bd8ec705c66318f4d2`
- Authored task SHA: `1b1c0c3a8aff2d6358d235068042c89bf2ef244daa8d3ea56b7c515c1bc9e892`
- Plan SHA: `cb53aa3522b9e9003ecddef79f19461d465da12ba53f1336391bb15c0f1dff51`
- Kaynak SHA: `f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e`
- HTML SHA: `7a3b44acc19ef7365cae5f372e3a3a915dbbc456c66debbd2a55b0a285b80ca7`
- HTML: **12.567 bayt**; manifest: **1.633 bayt**; JSON dönüşü: **14.591 bayt**.
- Kaynak taslak `representation.rendered`: **false**.

Frozen üretim modülü SHA: `e7d3cb74a484330ed5ef9695ae13e8a914c2d250960905af25b229fc2e0072b6` (12.485 bayt).

Frozen test SHA: `5a99efe766fcda54f9f13e1c6e2663ab1d2359a40fe779ed63d3761fd4d63822` (19.159 bayt).

Bu dokümanın kendi hash'i ayrı araç çıktısında raporlanır; self-hash metne gömülmez.

## Açık kalan kabul işleri

Gerçek native browser/computed/taşma/klavye/screen-reader kontrolü; uzman matematik/pedagoji/hak incelemesi; etkin yıl/öğretim programı bağlama; zorluk kalibrasyonu; bütün arşiv özgünlük/benzerlik değerlendirmesi; öğrenciye cevap güvenli teslim sözleşmesi; rol/okul/öğrenci kimlik yetkisi; video/ses/görsel medya ve daha zor/yeni aileler bu dilimin dışında veya pending'dir. Testlerin geçmesi bu işleri kapatmaz.
