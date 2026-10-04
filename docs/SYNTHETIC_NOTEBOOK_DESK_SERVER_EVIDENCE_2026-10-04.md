# Sentetik Defter Masası: Sabit Asset Sunucusu — 2026-10-04

Kök ek kanıtı: frozen canonical üç asset startup-smoke ve native desktop/mobile memory-desk akışı artık geçti; aşağıdaki writer snapshot'ında pending olan canonical/browser kontrolü [ayrı kök raporunda](SYNTHETIC_NOTEBOOK_DESK_BROWSER_EVIDENCE_2026-10-04.md) tamamlandı. Gerçek UI→SQL joint proof hâlâ pending; eski HTTP profili actual106 SQL regresyonu ayrı tutulur. İki owned CLI exit0 ve owned browser PID yokluğu doğrulandı. Yeni production/öğrenci kabulü yoktur.

## Kapsam ve durum

Bu dilim yeni **opt-in** defter arayüzü sunucu profilini ekler. Eski `createSyntheticNotebookApplicationServer(options)` profili aynı API/CSP/JSON davranışını korur; arayüz dosyası okumaz ve statik yollar hâlâ 404'tür. Mevcut application/adapter/preparer ve aynı transport sınırı kullanılır. Eski SQL, driver, UI asset'leri, caption sunucusu ve paylaşılan planlar bu dilimde düzenlenmedi.

Yeni profil, gerçek kullanıcı authentication'ı, üretim wire driver'ı veya gerçek öğrenci ekranı acceptance'ı değildir. Her instance bilerek tek ortak sentetik application state'idir. Farklı instance'lar application projection paylaşmaz. Defter `student_notebook` amacında kalır; not/çizgi/bookmark operasyon sayıları learning/ability/mastery/psikometrik sonuç değildir. Source/executor yalnız güvenilen root composition'dan gelir; hash veya localhost erişimi kendiliğinden yetki kazandırmaz.

## Senkron API ve sabit yollar

```js
createSyntheticNotebookDeskServer({ sourceFixture, execute })
```

Constructor **senkrondur** ve henüz dinlemeyen native Node `Server` döndürür. Önce eski application constructor inert/closed seçenekleri doğrular; sonra üç bounded dosya descriptor'ı üzerinden startup snapshot yüklenir. Constructor executor'ı çalıştırmaz ve otomatik listen etmez. `webRoot`, path, asset-reader hook'u, UI seçimi, rol veya başka konfigürasyon kabul edilmez. Root açıkça canonical loopback üzerinde bind etmelidir.

| Yalnız GET yolu | Sabit proje dosyası | MIME |
| --- | --- | --- |
| `/` | `packages/student/notebook_desk.html` | `text/html; charset=utf-8` |
| `/notebook-desk.css` | `packages/student/notebook_desk.css` | `text/css; charset=utf-8` |
| `/notebook-desk.mjs` | `packages/student/notebook_desk.mjs` | `text/javascript; charset=utf-8` |

HEAD, `/index.html`, favicon, underscore aliases, encoded/absolute alternatif yollar, traversal ve query parametreleri yoktur. GET body veya Transfer-Encoding reddedilir. Request'ten filesystem path üretilmez. Aynı socket/Host/Origin/header kontrolleri **asset bytes sunulmadan önce** çalışır.

Üç eski endpoint değişmez:

- `GET /api/notebook/current`: yalnız son in-memory application view, SQL 0.
- `POST /api/notebook/read`: tam `{}`, açık DB read.
- `POST /api/notebook/save`: eski closed notebook DTO. Makbuz, gönderilen body'yi verified read projection'a dönüştürmez. Eski projection stale kalır; yalnız bir sonraki explicit read günceller. Unknown write `persisted:null` kalır; auto retry/read yoktur.

## Dosya yükleme sınırı ve yarış kapsamı

Her dosya **1–131.072 bayt** olabilir; toplam üç snapshot en çok 384KiB'dir. Sabit 128KiB+1 buffer tahsisi/pozisyonlu okuma büyüyen dosyanın sınırsız okunmasını engeller. Bu cap request/response cap'leri veya okul depolama kotası değildir.

Canonical asset directory ve leaf realpath kontrol edilir. Symlink directory/leaf ve nonregular leaf reddedilir. Leaf `O_NOFOLLOW | O_NONBLOCK` ile açılır; raced-in pipe constructor'ı bloklamamalıdır. Ön lstat, açılmış descriptor fstat, okuma sonrası fstat/lstat arasında dev/ino/mode/nlink/size/mtime/ctime eşleşmesi ve directory identity korunmalıdır; okunan byte sayısı başlangıç boyutuna eşit olmalıdır. Descriptor her başarı/ret durumunda finally ile kapatılır. Hiçbir dosya kısmen başarılı bundle olarak sunulmaz.

Fatal UTF‑8 decoder malformed sequence'i reddeder; BOM ve NUL bu dar text-asset profilinde kabul edilmez. Hata yalnız `invalid_synthetic_notebook_desk_assets` olur; path, içerik veya alttaki filesystem hata mesajı geri verilmez. Startup snapshot private closure'da tutulur. Sonraki dosya silme/değiştirme/symlink replacement HTTP response'u değiştirmez; yeni sürüm için yeni güvenilen server instance gerekir.

**OS yarışı sınırı:** Bu scoped preview, sabit güvenilen proje asset path'leri ve descriptor/stability kontrolleri içindir. Aynı UID ile projeyi değiştirebilen saldırgana karşı atomik directory-relative `openat` veya işletim sistemi sandbox garantisi değildir. Mac üzerinde küçük owned temp probe'da `/dev/fd/<dirfd>/child` ve `/proc/self/fd` child lookup ENOENT verdi; probe silindi. Yeni native dependency/FFI/driver kurulmadı. Kontroller normal leaf replacement/growth drift'ini fail-closed yakalamak üzere yazıldı; constructor sırasında sürekli adversarial directory swap/restore stress veya her mid-read mutation dalı runtime kanıtı diye sunulmaz.

## HTTP ve tarayıcı başlıkları

Statik response no-store, nosniff, same-origin resource policy ve doğru text MIME verir; CORS açılmaz. Static CSP:

```text
default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self';
object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
```

Inline script/style, harici host veya eval izni verilmez. API ve hata JSON response'larının eski `default-src 'none'` CSP'si aynen kalır. Navigation/stylesheet/module için mevcut Accept/User-Agent/CH/fetch başlıkları desteklenir. Ayrıca yalnız **GET fixed asset** için tam `Sec-Fetch-User:?1` ve `Upgrade-Insecure-Requests:1` kabul edilir. Yanlış değer, API, eski profil veya POST'ta bu yeni başlıklar 400'tür. Role/auth/cookie/forwarding/keyfi header allowlist'i genişletilmez. Bunlar browser-header compatibility testidir; gerçek browser/layout/accessibility acceptance'ı değildir.

## TDD ve fresh verification

Önce 14 yeni gerçek loopback/filesystem testi yazıldı. İlk sandbox koşusu palette dependency `packages/student/notebook.mjs` kopyalanmadığı için import hatasıydı; bu **RED kanıtı sayılmadı**. Gerçek dependency kopyalandıktan sonra beklenen `fixed notebook desk server missing` assertion ile doğru RED görüldü:

```text
node --test test/synthetic_notebook_desk_server.test.mjs
RED 0 pass / 14 fail / 0 skip / exit 1
```

Minimal implementation sonrası desk14 + eski HTTP21 =35/35, 0 skip. Browser user-activation başlığı için ayrı negatif kabul testi eklendi; mevcut static GET 400 verdiği için RED14/15 görüldü. Yalnız fixed GET asset'a dar başlık izni sonrası GREEN15/15 oldu. Eski API aynı başlıklara 400 vermeyi sürdürdü.

Son taze birleşik komut:

```text
node --test test/synthetic_notebook_desk_server.test.mjs \
  test/synthetic_notebook_application_server.test.mjs \
  test/synthetic_notebook_application.test.mjs \
  test/synthetic_notebook_adapter.test.mjs \
  test/synthetic_notebook_sync.test.mjs
100 tests / 100 pass / 0 fail / 0 skip / exit 0
```

Desk15 + eski HTTP21 + application18 + adapter27 + pure19. Yeni testler gerçek native loopback socket'ları ve her testin kendi mkdtemp sandbox'ındaki gerçek kopyalanmış modülleri kullanır. Canonical UI asset'lerine dokunulmadı. Missing/nonregular/symlink directory/leaf, over-limit ve **tam 128KiB** asset, bozuk UTF‑8/BOM/NUL, constructor option/getter/proxy, browser transport, GET-only/body/query/header/Origin/Host, ayrı instance ve post-construction replacement tanıkları vardır. Temp sandbox'ları ve ephemeral server'lar test lifecycle'da yalnız kendi exact scope'larında kapatılıp temizlenir.

Read/save tanığında application/adapter/preparer gerçek, yalnız external DB executor tam shaped fixed-scope fixture double'ıdır. Dosya bytes sunulması UI işlevi, insan kullanılabilirliği veya SQL persistence kabulü değildir. Bu kanıt anında canonical HTML/CSS/JS writer'ının üç dosyası henüz hazır değildi; canonical asset smoke ve gerçek browser QA ayrı pending'dir. Root'un gerçek SQL→desk/HTTP tanıkları da ayrı koşuya aittir.

## Pending

Gerçek UI/browser erişilebilirlik ve layout; canonical asset smoke; actual isolated SQL→desk proof; authenticated source/policy/role resolver; production wire driver/TLS; global rate/capacity/abuse limits; gerçek öğrenci verisi; retention/deletion ve audit sink; okul kotaları ve çok sunuculu state lifecycle bu dilimde tamamlandı sayılmaz. DAMA purpose/source/owner/steward/policy/retention hash bağları eski katmanda korunur, fakat canlı governance veya sertifikasyon iddiası yoktur.
