# Ortak ilişkiler: normal fabrika CLI'sinin kapalı editör dilimi

4 Ekim 2026. Durum: **yerel teknik CLI entegrasyonu; insan/öğrenci/yayın kabulü değil**. Başlangıç checkpoint'i üst görev tarafından `6d8297949fac4e7179fe96e66e853ac16a1aa6ba` olarak bildirildi; bu yazar Git çalıştırmadı. [Önceki kabul planı](NEXT_FACTORY_VERTICAL_ACCEPTANCE_2026-10-04.md) tam okundu.

Bu yazarın üç dosyası: `tools/content_factory_pilot.mjs`, yeni `test/grade6_common_relations_factory_cli.test.mjs` ve bu belge. API, source metadata, draft/verifier, scene/review, mevcut testler ve diğer belgeler değiştirilmedi. [Saf hazırlık API'si](../packages/content-factory/grade6_common_relations_factory_preparation.mjs) ayrı yazarın işidir; burada gerçek API tüketildi, mock edilmedi.

## Exact tüketici ve çıktı

```sh
node tools/content_factory_pilot.mjs --domain grade6_common_relations --out ABS_NEW_EMPTY_DIRECTORY
```

`ABS_NEW_EMPTY_DIRECTORY` bir yer tutucudur: mutlak, lexical normal ve **henüz mevcut olmayan** son dizin gerekir; üst dizinler mevcut olmalıdır. Zaten mevcut boş/nonempty dizin, dosya, symlink veya symlink ata reddedilir. Common için yalnız iki tekil bayrak vardır; sıraları değişebilir. Başka domain, `--count`, `--metadata`, provider/source-path/cue/reveal/grade/tenant/host/file/URL, fazla/tekrarlı/compound bayrak ve göreli/noktalı/çift-ayraçlı/trailing-ayraçlı yol kabul edilmez. Domain olmadan önceki rectangle/count/metadata akışı korunur; `--out` hâlâ açıkça gerekir.

CLI yalnız sabit üç public metadata dosyasını okur: `grade6-common-relations-application-observations.json`, `grade6-source-semantic-candidate-matrix.json` ve `meb-reference-registry.json`. Sonuncudan **tek** `tymm-current-ortaokul-matematik` satırı seçilir; duplicate/missing satır ret. Kullanıcı dosya/source/plan/callback seçtirmez. Dosya başına 512 KiB cap, fatal UTF-8, regular/no-follow açılış, ata kimlikleri ve descriptor/path ön–sonra kimlik/boyut/zaman eşliği uygulanır. Semantik/pin doğrulamasını gerçek exact1 API yapar. Hash; hak, müfredat veya insan onayı değildir.

| Sabit dosya | Anlamı | Disk bütçesi |
|---|---|---:|
| `batch.json` | Tam answer-bearing editör packet; JSON serialize edilen live trace/job/scene yetki kazanmaz | 512 KiB |
| `preview.html` | `initialReview.html` aynen; yalnız repeat/goal/cue0/page0/progress0/revealfalse current önizlem | 64 KiB |
| `manifest.json` | API manifest'in compact JSON'u + tek newline; domain digest alanı korunur | 16 KiB |

JSON dosyaları compact JSON + newline; HTML'ye newline eklenmez. Boyutlar **disk baytları dahil** yazım öncesi sınanır. Normal rectangle `audit.json`/`diagrams` common çıktılarına eklenmez; generic resolver'a common'u rectangle diye sokan fallback yoktur.

Yeni dizin 0700, üç dosya 0600. Ata inode snapshot'ı hazırlık öncesi alınır ve yazım sırasında tekrar kontrol edilir. Created-directory descriptor/inode ve gerçek cwd inode eşleşmesinden sonra yalnız sabit **relative** adlar exclusive/no-follow açılır. Böylece isim yolu sonradan değiştirilse de yazım yeni bir replacement dizine yönlendirilmez; değişiklik hata olur. Üç yazım bittikten sonra byte eşliği/SHA/readback yapılır; dosya kimlikleri tamamlanan kümede tekrar karşılaştırılır. Başarı stdout'u gerçek `{filename,byteLength,sha256}` kayıtlarını, `readbackVerified:true` ve `serializedAuthority:'none'` taşır. Common hatası yalnız `grade6_common_relations_factory_invalid_args` veya `grade6_common_relations_factory_failed`; path/upstream hata metni echo edilmez.

Bu aynı-UID saldırganı için sandbox, bütün platformlarda atomik işlem, sonsuza dek değişmez dosya veya durable/persistent store iddiası değildir. Hata sırasında reserve edilmiş dizin/partial dosya kalabilir; otomatik silinmez veya üzerine yazılmaz, başarı receipt'i çıkmaz. Test utility yalnız kendi `mkdtemp` kökünü kaldırır. Önceki normal branch'in geniş eski I/O davranışı bu değişiklikle güvenli ilan edilmez veya yeniden tasarlanmaz.

## TDD ve hata kökü — gerçek tarihler

TDD + writing-good-tests + verification talimatları tam okundu. Beklenmeyen test hatasında systematic-debugging de tam okundu; sonuç önce gerçek API/consumer sınırından araştırıldı.

1. Tek gerçek CLI testi **0 PASS / 1 FAIL**: eski parser `--domain` için `Usage ... --count/--out/--metadata` verdi; beklenen status0 yerine1. Missing API/import crash bu RED değildir.
2. Genişletilmiş ilk koşu **1 PASS / 9 FAIL**: normal default/1/12/100 zaten geçti, domain testleri eski parser/kapalı diagnostic nedeniyle RED idi. Bu koşu, parser ötesindeki her filesystem guard'ın bağımsız RED'i diye sunulmaz.
3. Minimal domain dispatch + actual API ile **9 PASS / 1 FAIL**. Kalan hata testin `audience` okumasıydı; gerçek API `artifactAudience` kullanır. Yalnız test düzeltildi; API'ye alias eklenmedi. Ardından **10/10 PASS**.
4. Ayrı gerçek bug regression **0 PASS / 1 FAIL**: `batch.json` ilk readback'inden sonra `preview.html` yazımı sırasında batch baytı değiştirildiğinde eski loop yanlış `readbackVerified:true` stdout'u verdi. Kök: her dosyanın readback'i sonraki yazımlardan önce yapılıyordu. Minimal fix: bütün yazımlar sonrası readback + tamamlanan kümede son identity pass. **11/11 PASS**.
5. Altı ek filesystem/consumer characterization tanığı ilk koşularında zaten GREEN: exclusive-open çakışması, cwd sonrası ata replacement, sonraki read sırasında önceki file değişimi, source leaf replacement, geçerli Unicode/ters bayrak sırası, normal metadata. Bunlara sahte RED atfedilmez. Final **17/17 PASS**, fail/skip/cancel/todo0.

Testler gerçek child CLI, gerçek canonical API ve gerçek geçici dosyalardır. Race/hata tanıklarında yalnız Node filesystem sınırına trusted test preload interposition yapılır; API, verifier, renderer veya beklenen artifact mock edilmez. Replacement dizin sentinel'i korunur; saldırı sonrası partial artifact başarılı sayılmaz. Source drift/duplicate, symlink, oversize ve bozuk UTF-8 output reserve öncesi reddedilir. Bayrak/yol matrisi **31 gerçek CLI ret çağrısıdır**; Node/framework mekaniği veya prose/CSS snapshot testi değildir.

## Taze doğrulama

```sh
node --test test/grade6_common_relations_factory_cli.test.mjs
node --test test/grade6_common_relations_factory_cli.test.mjs test/grade6_common_relations_factory_preparation.test.mjs test/content_factory_pilot.test.mjs test/grade6_common_relations_scene.test.mjs test/grade6_common_relations_review.test.mjs test/grade6_common_relations_media_adapter.test.mjs
node --check tools/content_factory_pilot.mjs
node --check test/grade6_common_relations_factory_cli.test.mjs
```

Final own **17/17**; altı suite birleşik **103/103 PASS**, fail/skip/cancel/todo0, exit0, yaklaşık4,086 saniye. İki syntax komutu exit0. Birleşik sayıya own17 ayrıca eklenmez. Önceki full-suite sayıları bu yazarın yeni koşusu değildir; genel regresyon/native/root audit ayrı kalır.

Gerçek normal consumer'da default/12→12 taslak0 ret, 1→1 taslak0 ret, 100→12 taslak88 ret; yayın0. Normal metadata seçimi aynı şemayı tüketti. Düzenleme öncesi okunan CLI baseline ile normal parser body, review fonksiyonları ve normal consumer body bellekte byte-identical karşılaştırıldı. Diff yalnız yeni imports, kapalı domain parse/dispatch, common-only bounded source/output/readback ve domain-specific sanitized catch; Git diff çalıştırılmadı.

06:46:05 UTC'de ayrı own test-temp actual CLI/readback ölçümü (temp utility temizlendi):

| Disk dosyası | Bayt | Gerçek disk SHA-256 |
|---|---:|---|
| `batch.json` |121.997|`4fdaedcf8be09fe74478466a49ed9f42dfb4e8c661f80430c541ef40d3d06e14`|
| `preview.html` |9.649|`26749f591b71ac2397e4854d6d1631f4db2954dc56afbc2b17e7e2b087620686`|
| `manifest.json` |5.572|`20d756dca59209515ebfae204bb07aac7bab078db6ffb6eb8f38a1ee5237190f`|

Packet'in newline'sız compact JSON'u121.996 bayt / byte SHA `3f8b5eee96c0e0827a0813df55f95fffa3ea6e5db38a9b1bfd073db2c0fa2991`; bu disk batch SHA değildir. API manifest `contentSha256=3f7479ef2620a3e5dbea8d18dfcffd4be3cb53537d2f6d681c971b38f5d80ce0` **domain-separated object digest**'idir; newline'lı manifest dosya SHA'sı değildir. HTML aynı baytlarla yazıldığı için API HTML digest'iyle disk SHA eşleşir.

Frozen code: `tools/content_factory_pilot.mjs`41.761 bayt / SHA `8cc777d2a3dd7809d9e764f74609cf13236af98a46096a1c8eafce828d8a543f`; yeni test19.334 bayt / SHA `6a1c9c81f83b638539ae8297659062d2eb4748dbd23dab04417aafa477365988`. Belgenin hash'i ayrı final mesajda verilir; kendi hash'ini içererek döngü oluşturmaz.

## Kabul sınırı

Tek **existingAuthoredDraft1 / contextNarrationJobs2 / newAuthoredQuestions0 / accepted0 / published0**. Zaman oracle'ı `[24,48]`; group-size `[1,2,3,4,6,12]`; 6 kart/pakette `[4,6]` paket. Dakika, kart/paket ve paket ayrı. Generic numericSteps0/semantics pending; upstream generic geometry unsupported, ayrı specialized scene/frame hazırdır. Bu iki medya işi soru stoğu değildir.

Altı kapı activeProgram/pedagogy/rights/difficulty/answer/accessibility **pending**; publication/learner/production false. Tam packet cevap taşır; current HTML'ye gelecek rationale/transcript eklenmez. Verilen tablodan matematiksel cevap çıkarılabilmesi auth/anti-cheat değildir. Transfer geometry kaynakta yok/pending. Bu yazar native browser, glyphfit/screenreader, öğretmen dinleme veya öğrenme kabulü yapmadı; önceki native kanıt tekrarlanmış sayılmaz.

Provider çağrısı0, yeni TTS/ses/video0; source PDF bytecheck0. Test geçici editör paketleri yeni yayımlanmış ürün değildir. Ağ, canlı model, credential/.env okuma, Drive, DB, Docker, browser, Git, SDK/dependency/install0. Hak/source/owner/steward/retention ve gerçek okul-yıl yetkisi fixture/hash ile atanmış olmaz. CMMI/SPICE/MEB sertifikası veya tam müfredat/36.000 soru iddiası yoktur.
