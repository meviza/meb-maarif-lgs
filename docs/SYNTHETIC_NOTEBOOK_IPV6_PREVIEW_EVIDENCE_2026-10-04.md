# Sentetik Defter: Kanonik IPv6 Önizleme — 4 Ekim 2026

## Teşhis: İstek Nerede Reddedildi?

Native tarayıcıda görülen `ERR_BLOCKED_BY_CLIENT`, tek başına uygulama/CSP/host/origin hatası veya HTTP isteğinin hiç ulaşmadığı anlamına gelmez. Systematic-debugging yöntemiyle değişmemiş gerçek desk server, mevcut normal process-memory executor ve yalnız güvenli transport metaverisi üzerinden aynı deneme gözlendi.

Instrumentation yalnız method, sabit route, header **adları**, status, güvenli canonical hata kodu ve sayımları çıkardı. Cookie, Authorization, User-Agent veya diğer header değerleri, öğrenci/not gövdesi, hesap verisi veya credential loglanmadı. Yeni DB, provider, kaynak indirme, SDK veya servis kullanılmadı. Instrumentation repo koduna eklenmedi.

| Ayrı tanık | İstek / sonuç | Yorum |
| --- | --- | --- |
| IPv4 doğrudan kontrol | GET 200, HEAD 405, OPTIONS 405 | Server canlı; GET-only sınırı korunuyor |
| IPv4 native navigation | Tek yeni GET; 400 `closed_request_headers_required` | Header adlarında `cookie` var; istek server'a ulaşmış |
| IPv6 doğrudan kontrol | GET 200, HEAD 405, OPTIONS 405 | Aynı mevcut boundary, kanonik `::1` bind |
| IPv6 native bootstrap | Root, CSS, module, current için dört yeni GET; hepsi 200 | Header adlarında `cookie` yok; native HEAD/OPTIONS/POST yok |

IPv4 toplamı 4 istek: kontrol GET/HEAD/OPTIONS ve tek native GET. İlk IPv6 toplamı 7 istek: kontrol GET/HEAD/OPTIONS ve dört native GET. Bu tanıkta HEAD/preflight hipotezi desteklenmedi. Cookie varlığı kapalı-header ret yoluna ulaştı; bunun değeri veya hangi uygulamaya ait olduğu araştırılmadı. Tarayıcı çerezleri okunmadı, silinmedi veya değiştirilmedi.

Root, ilk IPv6 native ekranda sentetik defterin yüklenmesini, başlangıç `not_read` durumunu ve kaydetmenin kilitli oluşunu ayrıca gördü. Bu ilk dört GET tam read/save akışı veya SQL kanıtı değildir. İlk teşhis serverının koordinasyon nedeniyle erken kontrollü kapanması, sonraki root read denemesini erişimsiz bıraktı; `read_unknown` başarı sayılmadı. İki ilk owned server closed/exit 0 ile kapandı. Aynı kanonik IPv6 adreste ayrı fresh process-memory instance açıldı; önceki kayıt devamlılığı iddia edilmez.

Fresh instance ayrı kanıtla yürütüldü: root reload → explicit read/revision 0 → 33 karakterlik sentetik taslak ve iki bookmark seçimi → explicit save/makbuz 1 akışını native UI'de gördü. Eski read/revision 0 stale kaldı ve save kilitlendi. Aynı instance instrumentation'ı **6 request /6 response** verdi: root/CSS/module/current için dört GET 200, ardından `POST /api/notebook/read` 200 ve `POST /api/notebook/save` 200. Header adlarında Cookie veya Authorization yok; HEAD/OPTIONS 0. Gövde veya header değerleri loglanmadı. Sonraki explicit readback bu fresh instrument tanığında yoktur; frozen CLI normal/reply-loss native tam akışları root'un ayrı fazıdır.

Root kendi frozen CLI önizlemelerini açıp geçici instrument turunu tamamladığını bildirdikten sonra yalnız bu agentin fresh serverı kapandı: final sayım GET 4/POST 2, closed ve process exit 0. Root'un normal/reply-loss CLI'leri veya kullanıcı tarayıcısı kapatılmadı. Önceki erken kapanış ve fresh başarılı save aynı süreç veya tek kesintisiz kabul diye birleştirilmez.

## Güvenlik Kuralını Gevşetmeden En Küçük Uygulama

`packages/contracts/synthetic_notebook_application_server.mjs` zaten `127.0.0.1` ve `::1` kanonik loopback bind'lerini destekliyordu. Değiştirilen yalnız `tools/synthetic_notebook_desk_preview.mjs` CLI seçimidir:

- Yeni `--host` yalnız tam `127.0.0.1` veya `::1` değerini kabul eder.
- Varsayılan hâlâ IPv4 `127.0.0.1`, port 3340 ve `normal` senaryosu.
- `--port`, `--scenario`, `--host` unique çiftleri 0/2/4/6 inert argüman sınırında işlenir; sıraları değişebilir.
- IPv6 ready URL `http://[::1]:port/` biçimindedir.
- Wildcard, `localhost`, başka loopback adresi, mapped IPv6, URL biçimli veya boşluklu alias, duplicate host ve extra flag reddedilir; ready/listen çıktısı yoktur.
- GET-only, Cookie ret, exact Host/Origin, fetch-site, CSP, body/schema/byte sınırları aynen kaldı. Yeni alias, CORS veya izin eklenmedi.

```sh
node tools/synthetic_notebook_desk_preview.mjs --host ::1 --port 0
node tools/synthetic_notebook_desk_preview.mjs --host ::1 --port 0 --scenario reply-loss
```

Bu, tarayıcı profilini veya mevcut çerezleri değiştirmek yerine zaten izinli ayrı kanonik loopback origin üzerinde sentetik önizleme seçeneğidir. Çerez bulunmaması kalıcı garanti değildir: IPv6'ya da Cookie gönderilirse aynı ret kuralı işler.

## TDD Ve Gerçek CLI Kanıtı

TDD ve writing-good-tests becerileri tamamen okunup consumer testleri implementasyondan önce yazıldı. Beklenen parse sonucu, IPv6 URL ve HTTP durumları literal/bağımsız beklentilerdir. Production source grep veya mock server kullanarak kabul üretilmedi.

1. Yeni parse/six-pair/gerçek CLI testleri mevcut kodda **8 PASS /4 FAIL**, exit 1, 759.942 ms verdi. RED, `canonical IPv6 host flag is not supported`, üç unique flag gereksinimi ve gerçek CLI readiness consumer assertion'larıydı.
2. Minimal host değişikliğinden sonra aynı suite **12/12 PASS**, fail/skip/cancel/todo 0, exit 0, 776.164292 ms.
3. HTTP application ve desk server regresyonlarıyla **48/48 PASS**, fail/skip/cancel/todo 0, exit 0, 1259.142417 ms. Bu dar suite kanıtıdır; bütün repo suite'i bu ajan tarafından koşulmadı.
4. İki syntax kontrolü exit 0. Server dosyasının working-tree diff'i boş; transport/güvenlik kodu değiştirilmedi.

```sh
node --test test/synthetic_notebook_desk_preview_cli.test.mjs
node --test test/synthetic_notebook_desk_preview_cli.test.mjs test/synthetic_notebook_desk_server.test.mjs test/synthetic_notebook_application_server.test.mjs
node --check tools/synthetic_notebook_desk_preview.mjs
node --check test/synthetic_notebook_desk_preview_cli.test.mjs
```

Yeni testler iki gerçek child CLI'yi `::1` ve ephemeral port ile açtı; yalnız kendi süreçlerini SIGINT/exit 0 ile kapattı. Asset/current HTTP 200 ve başlangıç read boşluğu gerçek wire'da gözlendi. Synthetic Cookie 400, alias Host 403, HEAD/OPTIONS 405 kaldı. Cross-origin read 403; same-origin explicit read 200/revision 0 oldu. Reply-loss save 503/persisted null, makbuz yok ve otomatik read/retry yok; ancak sonraki açık read revision 1 ve aynı sentetik gövdeyi getirdi. Bu process-memory tanığı gerçek SQL, öğrenci kalıcılığı veya kimlik doğrulaması değildir.

IPv6 bu Mac ortamında gerçek bind ve native bootstrap ile desteklendi. Bu testlerde atlama yapılmadı; farklı bir ortamın IPv6 desteği ayrıca değerlendirilmelidir, sessiz skip başarı değildir.

## Pinler Ve Kapsam

- CLI SHA-256: `69594d0c8a508a7aa426e378b17bf3871fc7d5d02ab6c9aea83f214ad6269ba1`.
- Test SHA-256: `1f9d9a4458fce48066428e1be8b0004395233c8117376cf32fed38e0109b249d`.
- Değişmemiş server SHA-256: `b6f196991dd1d7af1dcee4903d03b8398849e589a9faf7354be73d43164cc39c`.
- Soru/konu/ses/video/yayın katkısı 0; çağrı maliyeti 0; provider/Drive/credential/gerçek kurum veya çocuk verisi yok.
- Bu agent yalnız CLI, ilgili testi ve bu belgeyi değiştirdi; commit/push yapmadı. Native root UI/read/save ve final preview URL kabulü root'un ayrı kanıtıdır. Gerçek auth/tenant/retention/analytics veya üretim sertifikası iddia edilmez.

Systematic-debugging, güvenlik kontrolünü gevşetmeden gerçek ret sınırını ayırdı; TDD, backward-compatible host seçimini ve negatifleri uygulama öncesi sabitledi. Tamamlanma doğrulaması yalnız koşulmuş testleri ve gerçek gözlenen başlangıç tanığını tamamlandı saydı.
