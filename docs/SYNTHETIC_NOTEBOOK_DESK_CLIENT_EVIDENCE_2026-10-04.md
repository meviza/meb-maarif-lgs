# Sentetik defter masası istemci kanıtı — 2026-10-04

Kök entegrasyon ek kaydı: bu yazarın dar istemci testi sonrasında [gerçek native tarayıcı/CLI kabulü](SYNTHETIC_NOTEBOOK_DESK_BROWSER_EVIDENCE_2026-10-04.md) frozen dosyalarla ayrıca yürütüldü. Bu ek kanıt memory executor üzerindedir; UI→SQL ortak kabulü veya gerçek öğrenci kimliği değildir. Aşağıdaki ilk kapsam ve test geçmişi tarihsel sınırlarıyla korunur.

Durum: yalnız yerel, tek ortak sentetik oturum için uygulanmış istemci dilimi. Gerçek öğrenci hesabı, kimlik doğrulama, çok kullanıcı desteği, canlı veritabanı kanıtı, tarayıcı görsel kabulü veya üretim hazırlığı değildir. Bu kayıt istemcinin sınırını anlatır; sunucu/SQL ve gerçek tarayıcı incelemesi ayrı kanıtlardır.

## Sahiplik ve yüzey

Bu dilimde yalnız beş yeni dosya üretildi:

- `packages/student/notebook_desk.html`
- `packages/student/notebook_desk.css`
- `packages/student/notebook_desk.mjs`
- `test/synthetic_notebook_desk_client.test.mjs`
- Bu kanıt belgesi.

Önceki öğrenci çalışma alanı, notebook/workspace, sunucu, CLI, ortak belgeler ve kaynak modülleri değiştirilmedi. Ek bağımlılık, font, dış varlık, ağ sağlayıcısı, hesap veya kalıcı tarayıcı depolaması yoktur. Desk sunucusunun başka sahibi üç sabit yolu sunar: `/`, `/notebook-desk.css`, `/notebook-desk.mjs`. HTML'de satır içi script/style yoktur. Modülde import/ek endpoint yoktur.

İstemci yalnız mevcut varsayılan demo-A profilini kabul eder: örnek okul A / sentetik öğrenci A, sınıf 6, 2026–2027 ve sentetik defter A. Scope ve policy/catalog/asset/target digestleri sabit profil ile eşleşir. Tam yeniden hashlenmiş yabancı scope veya genişletilmiş policy bu arayüz için kabul edilmez. Bu pinler bir kullanıcıya erişim yetkisi vermez; gerçek kimlik doğrulama değildir. Genel sunucu kurucusunun farklı sentetik kaynak kabul etmesi, bu istemcinin başka profilleri desteklediği anlamına gelmez.

## İstemci sözleşmesi

Browser-safe `createSyntheticNotebookDeskClient(trustedRequest?)` donmuş receiver-bound denetleyici döndürür:

- `current()` donmuş güncel istemci kaydı; `draft`, `verifiedRead`, `receipt` ayrı alanlardır.
- `initialize()` yalnız `GET /api/notebook/current`; SQL0 durum gözlemi, kaydetme kapısını açmaz. Bir başka editörün mevcut sunucu okuması bu istemci için açık okuma yerine geçmez.
- `read()` yalnız açık `POST /api/notebook/read` ve `{}`.
- `save()` yalnız taze açık okumanın revision'ı ile kapalı `contractVersion/mutationId/idempotencyKey/expectedRevision/body` DTO gönderir.
- `replaceDraft(bodyJson)` yalnız primitive JSON metni kabul eder; ham DTO/getter/Proxy/callback nesnesi almaz.
- `loadRead()` yalnız açık “Okunan kaydı taslağa al” eylemi ile taslağın yerini değiştirir. Revizyon 0'ın null body’si boş taslak olur.
- `clearDraft()` açık yerel temizlemedir; bir sunucu silme/retention işlemi değildir.

Receiver klonu, Proxy receiver, serialized view, fazladan argüman veya endpoint/scope seçenekleri yetki oluşturmaz. İşlem sırasında read/save/load/clear/edit kapalıdır; ikinci işlem kuyruğa alınmaz. Tek bekleyen işlem nedeniyle geç bir yanıt başka yerel işlem üstüne yazılmaz; ayrıca eski doğrulanabilir revision, daha yeni gözlenmiş makbuzdan sonra save kapısını açamaz. Okuma taslağı otomatik değiştirmez.

Her kayıt denemesi save kapısını kilitler. Doğrulanmış makbuz yalnız ayrı yazma kanıtıdır; gönderilen body veya makbuz `verifiedRead` olmaz. Önceki okuma stale kalır. 409 veya doğrulanamayan/503/kaybolan yanıt sonrasında yalnız açık read ile toparlanılır. Belirsiz yazma `persisted:null` taşır; otomatik retry/read, rollback veya kesin kaydedildi iddiası yoktur. İstek üretiminden önce UUID başarısızlığı da işlem kilidini bırakır ve hiçbir write göndermeden save'i kapatır. UUID oturum kimliği veya auth token değildir.

## Wire ve içerik doğrulaması

Trusted test request callback `(fixedPath, frozenTransportOptions) → primitive wire JSON string` veya bu string'i üreten native Promise sözleşmesindedir. Envelope tam `{status,body}`; body primitive JSON metnidir. Bu hook trusted JS kodudur, adversarial callback sandbox’ı değildir. Browser runtime’da yerleşik `fetch`, `crypto`, Promise ve DOM güvenilir çalışma zamanı kabul edilir. Native Promise üreticisinin kodu/constructor davranışı için genel “sıfır hook” garantisi verilmez. Ham object/getter/Proxy/revoked response ve draft argümanlarının istemci sınırında çalıştırılmadığı test edilmiştir.

Wire envelope en çok 1 MiB; iç response JSON en çok 512 KiB. JSON parser duplicate escaped/NFC-equivalent keys, artan derinlik >14, >100000 node, >512 array entries ve >32 object keys'i reddeder. Field şemaları kapalıdır. Body, scope, revision, policy/catalog binding, body/receipt/request SHA-256 ve operasyonel sayaçlar yeniden denetlenir. `read_current` yazmaya ait outcome/preparation etiketleriyle taze sayılmaz. Unknown fields, auth/DB/production/analytics approval spoofları ve hash/receipt/count değişiklikleri gate'i açmaz.

Default browser transport üç self-relative yolu kullanır; `credentials:'omit'`, `redirect:'error'`, `cache:'no-store'`. JSON content type ve response boyutu doğrulanır; streaming UTF-8 decoder fatal, BOM korunup parser tarafından reddedilir, response 512 KiB ile sınırlıdır; browser request abort bütçesi 5 saniyedir. Hook’ların sonsuza kadar bekleyebilmesi trusted test composition sınırıdır; bu keyfi kodu izole eden bir güvenlik sandbox’ı değildir. Güvensiz error text'i DOM'a veya public status’a yansıtılmaz.

Body profilinde text en çok 4000 UTF-16 birimi, canonical JSON en çok 131072 UTF-8 byte; 64 stroke ×512 point; note/concern ayrı 100; notlar sınıf 6/plain_text ve nonblank. Targetlar yalnız mevcut iki demo-A question/topic ID. NUL ve eşleşmemiş surrogate reddedilir. Mevcut stroke coordinate fazla precision taşıyorsa reddedilir; sessiz yuvarlama/Unicode normalization yoktur.

`profileSyntheticNotebookPointer(x,y)` yalnız yeni pointer capture için açık 0–1 / dört-ondalık profilidir. Pointerdown/move sırasında geçici dot/ink feedback tuvale çizilir; pending stroke taslak/verifiedRead/sayaç/DTO içine girmez. Yeni capture nokta/alan sınırını aşarsa bütün çizgi reddedilir ve eski committed tuval geri çizilir; 512 noktaya sessiz kırpılmaz. Pointer cancel çizgiyi taslağa eklemez, committed tuvali geri getirir. Yalnız geçerli pointerup yeni çizgiyi taslağa ekler. Bu kalem, el yazısı tanıma/human handwriting veya erişilebilir çizim eşdeğerliği kanıtı değildir; alternatif plain-text not alanı vardır.

## Arayüz sınırı

18px ana tipografi, 44px minimum kontrol yüksekliği, keyboard focus, skip-link, responsive kolonlar ve reduced-motion CSS bulunur. Ayrı yerel taslak/okuma/makbuz bölgeleri, canlı durum metni ve sentetik/üretime hazır değil etiketi vardır. Notlar, kaygılar ve tüm sunucu metinleri `textContent`/native textarea üzerinden gösterilir; innerHTML/SVG/URL payload sink yoktur. Canvas yalnız doğrulanmış sayısal noktalar ve kapalı palette/width ile çizilir.

Taslak clear ve açık read-load geri alma/yedekleme değildir. Yenileme yerel taslağı kaybeder; bu açıkça gösterilir. Bookmark ve stroke verileri tam packet içinde korunur; bu ilk UI bunları read bölgesinde tam bağımsız bir görsel editör olarak sunmaz. Not/concern ekleme ve tüm taslağı temizleme vardır; tekil kayıt düzenleme/silme, undo, kalıcı draft veya gerçek öğrenci hesabı bu fazda yoktur. CSS/DOM seam testleri gerçek browser font/layout/AX ya da premium tasarım kabulü sayılmaz.

## Test-first ve taze doğrulama

İlk yeni test dosyası implementation öncesinde çalıştırıldı: 0/20 PASS; eksik export için 18 assertion, iki emitted-client senaryosunda henüz mevcut olmayan HTML dosyası. Minimal implementation ardından 20/20 GREEN. Sonraki davranış regressions:

- Yeni pointer overflow: 22/23 PASS, çizginin sessiz 512-nokta kırpıldığı repro → bütün-capture ret düzeltmesi →23/23.
- Okuma outcome/preparation semantiği: 26/27 PASS, yazma etiketli read gate'inin açıldığı repro → exact read anlamı düzeltmesi →27/27.
- Browser UUID failure: 27/28 PASS, `try/finally` dışındaki entropy hatasının busy bıraktığı repro → hazırlığı guarded alana taşıma →28/28.
- Browser streaming BOM: 28/29 PASS, decoder'ın BOM'u sessiz düşürmesi nedeniyle gate açıldığı repro → BOM koruyan fatal decoder + parser ret →29/29. Aynı test malformed UTF-8 retini de yürütür.
- Bağımsız pending-ink gözlemi: 29/30 PASS, gerçek emitted-module canvas instrumentation'da pointerheld sırasında stroke paint yokluğu → transient canvas-only paint + cancel rollback →30/30. Draft sayaçları ve network unchanged kalır.

Diğer ek testler mevcut davranışın characterization'ıdır; onlar için yeni RED iddiası yoktur. TDD, writing-good-tests ve verification-before-completion yönergeleri doğrudan okundu; iki regresyonda systematic-debugging kök neden/tekrar üretim yaklaşımı uygulandı.

Taze own suite: `node --test test/synthetic_notebook_desk_client.test.mjs` →30/30, 0 fail/skip; `node --check packages/student/notebook_desk.mjs` →exit0. Testler gerçek mevcut application/preparer/adapter ve in-memory fixed executor kullanır; ayrıca yeni gerçek loopback desk HTTP API ile init→read→save→manual read çalışır. Emitted module tam metni DOM boundary double’da yürütülür; literal malicious text, response loss, busy direct listeners, transient paint/cancel ve pointer capture bununla test edilir. Bu double gerçek native browser kabulü değildir; PostgreSQL çalıştırılmaz.

Birleşik doğrulama komutu:

```
node --test test/synthetic_notebook_desk_client.test.mjs test/synthetic_notebook_desk_server.test.mjs test/synthetic_notebook_application_server.test.mjs test/synthetic_notebook_application.test.mjs test/synthetic_notebook_adapter.test.mjs test/synthetic_notebook_sync.test.mjs
```

Taze birleşik sonuç: 130/130 PASS, 0 fail/skip, exit0. Bu komut yalnız yerel synthetic/loopback testleridir; gerçek DB/auth/retention/browser kabulüne yükseltmez.

## Frozen implementation SHA-256

| Dosya | SHA-256 |
| --- | --- |
| notebook_desk.html | 590ac6f5454602009eaaf1a08eae1a8fef8f6585eef64969a6a9208c85ac21cf |
| notebook_desk.css | 1aa8e7695ca7a5685b1afb391ea7b6975aa6bc0ff95b09ab1a4b92d3ef997cb8 |
| notebook_desk.mjs | 26c623424905ddc699b3861a0d4b4401091c1578d0e6d1ee126b4572ddff8791 |
| synthetic_notebook_desk_client.test.mjs | 89171d4f308bc8e525091345a693fba64e3ba24c53c1f2f75aeaf7478f42fa64 |

Belge digest'i bağımsız final freeze mesajında verilir; belge kendi digest'ini iddia etmez. Tüm approval/readiness flags false kalır. Renderer/audio/video/sync timestamps, öğretmen veya yayın onayı, öğrenme analitiği, gerçek auth ve production bu istemci diliminde üretilmez.
