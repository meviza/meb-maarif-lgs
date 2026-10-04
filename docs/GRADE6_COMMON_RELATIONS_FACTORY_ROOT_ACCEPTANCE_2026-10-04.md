# Ortak İlişkiler Fabrika Girişi: Root Teknik Kabulü

4 Ekim 2026, sabah tesliminden sonraki kullanıcı devam talebi. Başlangıç `6d8297949fac4e7179fe96e66e853ac16a1aa6ba`; dal `codex/k12-foundation-audit`. **Dar editör hazırlığının teknik bağlantısı tamamlandı; uzman kabulü, öğrenci teslimi veya üretim yayını değildir.** Gemini'nin asıl checkout'u değiştirilmedi. Gece ve tek seferlik sabah otomasyonları yeniden başlatılmadı.

## Gerçek Bağlantı

[Önceden tanımlanan kabul planı](NEXT_FACTORY_VERTICAL_ACCEPTANCE_2026-10-04.md) uygulandı. [Saf API](../packages/content-factory/grade6_common_relations_factory_preparation.mjs) exact1 kapalı metadata DTO'sunu inert/bounded olarak kopyalar; eski canonical draft→bağımsız verifier→iki gerçek live trace/job/audio-request→özel scene→varsayılan frame/review zincirini tüketir. Caller plan/provider/kaynak yolu/cue/reveal almaz. Altı insan kapısı pending kalır.

Normal [fabrika aracı](../tools/content_factory_pilot.mjs) artık ayrı bir kapalı domain girişine sahiptir:

```sh
node tools/content_factory_pilot.mjs --domain grade6_common_relations --out /absolute/path/to/not-yet-existing-directory
```

Bu yol yer tutucudur: mutlak ve normal yol, mevcut üst dizinler, henüz mevcut olmayan son dizin gerekir. Mevcut boş/nonempty dizin de reddedilir. Üç sabit kaynak metadata dosyası okunur; raw PDF, .env, model veya öğrenci verisi okunmaz. Extra/duplicate/compound bayraklar, count/metadata/provider/reveal/kaynak yolu, symlink ve değişmiş ata/file kimlikleri kapalı tanıyla reddedilir. Normal rectangle/count/metadata branch'i bu hardening kapsamı değildir.

Yeni dizin0700; `batch.json`, `preview.html`, `manifest.json`0600/exclusive. Tamamlanan üç yazımdan **sonra** gerçek baytlar yeniden okunur, SHA/boyut/eşlik ve son dosya kimlikleri kontrol edilir. Stdout yalnız başarılı kümede readback receipt'i verir. Partial-failure dosyaları otomatik silinmez veya üzerine yazılmaz; başarı sayılmaz. Bu aynı-UID sandbox, atomik/durable transaction veya kalıcı review-store garantisi değildir.

## Tek Görev, İki İş; Yeni Soru Değil

Manifest: **existingAuthoredDrafts1 / contextNarrationJobs2 / newAuthoredQuestions0 / acceptedProductQuestions0 / publishedQuestions0**. Tekrar hazırlamak stoğu artırmaz. İç leaf'in draft oluşturma kaydı ile yeni ürün stoğu farklıdır.

Literal sonlu-küme oracle'ı: pozitif ortak zamanlar `[24,48]` dakika,0 hariç48 dahil; ortak boyutlar `[1,2,3,4,6,12]` kart/paket;6 kart/pakette iki türün paket adetleri `[4,6]` paket. Formal EBOB/EKOK/uç değer öğretimi, öğrencinin kanıt inşası/ustalığı veya zekâ/kariyer çıkarımı yapılmaz. Generic numericSteps0/semanticReview pending; matematik kanıtı ayrı verifier'dır.

Tam `batch.json` cevap/transcript taşıyan **editör artefaktıdır**. `preview.html` yalnız repeat/goal/cue0/page0/progress0/revealfalse başlangıcını gösterir; gelecek anlatım metinlerini taşımaz. Manifest de transcript text içermez. Verilenlerden cevabın türetilebilmesi auth/anti-cheat güvenliği değildir. JSON/clone gerçek WeakSet trace/job/scene yetkisini taşımaz.

Nested canonical media preparation'ın generic pending/frames0 snapshot'ı değiştirilmedi. Yeni dış manifest genericResolverSupportedfalse ve ayrı specializedScenePreparedtrue der. Transfer için kaynakta yeni şekil yok; geometry pending korunur. Özel scene bağlantısı genel common resolver desteği olarak ilan edilmez.

## TDD, Bulgu Ve Düzeltme

Çakışmayan iki yazar ve ayrı readonly denetçi kullanıldı. Root yeni API/test, CLI diff/test ve her iki kanıt belgesini tam okudu. [API yazar kanıtı](GRADE6_COMMON_RELATIONS_FACTORY_API_EVIDENCE_2026-10-04.md): gerçek eksik-export consumer assertion RED0/13→GREEN13/13; ilgili yedi suite99/99. [CLI yazar kanıtı](GRADE6_COMMON_RELATIONS_FACTORY_CLI_EVIDENCE_2026-10-04.md): eski parser'da gerçek domain consumer RED0/1; final17/17 ve altı suite103/103.

İlk CLI GREEN sonrası ayrıca gerçek yanlış-success bug'ı yakalandı: ilk dosya readback'inden sonra sonraki yazım sırasında ilk dosya değişebiliyordu. Gerçek regression RED0/1→bütün yazımlar sonrası readback/son identity pass→GREEN. Testin `audience` yerine gerçek `artifactAudience` alanını okuma düzeltmesi ürün bug'ı sayılmadı; API'ye alias eklenmedi. Önceden geçen koruma/characterization testlerine sahte RED atfedilmedi. TDD, sistematik hata kökü incelemesi ve tamamlanma beyanından önce doğrulama kapıları uygulandı; dış skill/SDK/bağımlılık kurulmadı.

## Root Taze Doğrulama

Frozen code/test üzerinde tam komut:

```sh
K12_INK_REAL_MEDIA_TEST=1 K12_INK_SHARP_PACKAGE=/trusted/cached/sharp/package.json node --test test/*.test.mjs
```

Gösterilen Sharp yolu kamu raporu için yer tutucudur; root gerçekten mevcut güvenilen bundled Sharp'ı kullandı, indirme yapmadı. **1258/1258 PASS; fail/skip/cancel/todo0; exit0;20777.155375ms.** Dört yeni/değişen JS modül/test için syntax exit0. Hermetik regresyonun küçük raster/codec/test-media tanıkları yeni common ders sesi veya çözüm videosu değildir. Bu koşu yeni gerçek SQL/cloud/provider/native öğrenci kabulü sayılmaz.

Root ayrıca gerçek live API ve downstream frame/review tüketicileriyle20 cue×8progress/reveal vektörünü tüm geçerli sayfalarda sınadı: **280 frame/review durumu**,56 kapalı protected sayfa,24 açık protected sayfa,36 transfer-pending durumu. Protected result/check_answer/summary/transfer_answer yalnız revealtrue ve progress1 birlikteyken açıldı; diğerlerinde transcript/hash/result/pen/path boş kaldı. Generic common typed ret ve serialized scene ret tekrar doğrulandı. Manifest domain hash'i actual bileşenlerden yeniden hesaplandı.

Root normal main consumer ve preview fonksiyonlarını başlangıç commit'inden okuyarak byte-identical karşılaştırdı. Gerçek normal default/1/12/100 ve metadata tanıkları yazar/auditor testlerinde ayrıca çalıştı;100→12taslak/88ret/0yayın korunur. Source metadata'nın altı ilgili dosyası başlangıç commit'iyle byte-identical; yeni kaynak edinimi veya hak kararı yok.

İlk root artefakt denemesi, Git-dışı `outputs` üst dizini bulunmadığından ENOENT/exit1 ile durdu; uygulama bug'ı veya başarılı çıktı değildi. Yalnız belirlenmiş üst dizin oluşturuldu; yeniden deneme exit0. Root'un saklanan yeni özel paketinde API/CLI deep parity,0700/0600 izinler, yalnız üç sabit dosya, tüm disk hashleri ve ikinci çağrıda no-overwrite ret/unchangedSHA doğrulandı. Artefaktlar Git'e alınmadı.

## Bağımsız Frozen Denetim

Readonly denetçi code/test freeze SHA'larını öncesi/sonrası4/4 doğruladı. Yeni iki suite ayrı13/13 ve17/17; altı ilgili suite birleşik **93/93 PASS**, fail/skip/cancel/todo0,exit0,3978.032083ms. Bu dar sayı root1258 veya writer103 ile toplanmaz.

Bağımsız pure probe:42 inert/pin/rehash/budget ret,7 capability-clone/proxy ret,caller hook0;20 cue'nun49 açık sayfası,48 kapalı protected sayfa,8 transfer-pending sayfa. SVG/title/desc/ARIA/HTML/transcript/hash/result/pen current sınırları ve tüm component byte/domain graph yeniden hesaplandı. Bağımsız child CLI:28 yanlış argv,7 filesystem/no-overwrite/symlink/file/missing-parent ret; aynı-boyut postwrite tamper'da stdout başarı0; iki common ve normal default/1/12/100 olmak üzere6 gerçek başarı. Yalnız kendi mkdtemp fixture'ları temizlendi; kullanıcı dosyası edit/silme0. Bu bounded seam'de yeni P1/P2 bulgu yok; genel platform güvenlik sertifikası değildir.

## Saklanan Root Paketinin Bayt Kanıtı

| Disk artefaktı | Bayt | Gerçek disk SHA-256 |
| --- | ---: | --- |
| `batch.json` |121997|`4fdaedcf8be09fe74478466a49ed9f42dfb4e8c661f80430c541ef40d3d06e14`|
| `preview.html` |9649|`26749f591b71ac2397e4854d6d1631f4db2954dc56afbc2b17e7e2b087620686`|
| `manifest.json` |5572|`20d756dca59209515ebfae204bb07aac7bab078db6ffb6eb8f38a1ee5237190f`|

Toplam137218B; disk bütçeleri512/64/16KiB içinde. Compact newline'sız packet121996B SHA`3f8b5eee96c0e0827a0813df55f95fffa3ea6e5db38a9b1bfd073db2c0fa2991`; manifest compact5571B **domain digest**`3f7479ef2620a3e5dbea8d18dfcffd4be3cb53537d2f6d681c971b38f5d80ce0`. Compact/domain ve newline'lı disk SHA birbirinin yerine kullanılmaz. HTML aynı bayttır.

Frozen application/test SHA'ları:

- API9931B: `53477bacf465c209fb5d4d53a74181bf3166f98e79f6102132007c7ea0608b78`.
- API test20804B: `4572e3d3a5efe1ffd025dc941ad117f902a9169082b84a69baae77267565a1f5`.
- CLI41761B: `8cc777d2a3dd7809d9e764f74609cf13236af98a46096a1c8eafce828d8a543f`.
- CLI test19334B: `6a1c9c81f83b638539ae8297659062d2eb4748dbd23dab04417aafa477365988`.

## Açık Kapılar Ve Sonraki Dilim

ActiveProgram/pedagogy/rights/difficulty/answer/accessibility pending; humanApprovalnull ve learner/publication/productionfalse. Source pinleri etkin okul-yıl, tam müfredat, ticari izin veya PDF fresh byte proof değildir. DAMA source/version/lineage/quality durumları taşınır; owner/steward/purpose/access/retention karar store'u, gerçek auth/tenant ve öğrenci analitiği hâlâ ayrı gereksinimdir. CMMI/SPICE/MEB/DAMA sertifikası veya36.000 yayımlanmış soru iddiası yok.

Yeni provider/TTS/audio/video0; Drive/DB/Docker/credential/ücretli model/SDK işleri açılmadı. Bu faz native browser/glyph/screenreader/cihaz/öğretmen dinleme kanıtını tekrar üretmedi; önceki responsive kanıt tarihsel kalır. [Sonraki sesli video planı](NEXT_REASONED_VIDEO_ACCEPTANCE_2026-10-04.md) açık: kanonik visual job'ı değiştirmeyen ayrı selected-provider voice-job bridge, ardından yetkili/bütçeli gerçek ses baytları/decode/dinleme ve kelime–kalem/MP4 kabulü. Eski garden WAV'ını yeni common metin olarak yeniden etiketlemek geçerli yol değildir. Trusted review-store, kaynaklı blueprint ve okul işletim dilimleri de devam eder.
