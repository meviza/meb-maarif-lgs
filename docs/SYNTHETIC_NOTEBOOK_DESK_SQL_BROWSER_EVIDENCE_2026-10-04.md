# Sentetik Defter: Native UI → Gerçek SQL Ortak Kanıtı

## Test öncesi QA envanteri

Bu bölüm testten önce kapsamı sabitledi. Aşağıdaki sonuçlar son frozen araçla yürütülen ayrı native UI → actual SQL tanıklarıdır. Eski memory browser proof ve ayrı API SQL regresyonu burada ortak kanıt diye yeniden sayılmaz. Bu sentetik teknik tanık üretim kalıcılığı değildir.

| İddia / akış | Normal girdi | Beklenen görünür durum | Ayrı DB tanığı |
| --- | --- | --- | --- |
| Başlangıç SQL-free; açık okuma gerekli | Sayfayı aç, Kaydı oku | Önce read yok/save kilitli; sonra revizyon0 | Fixture head0/history0; API GET DB çağrısı0 |
| Metin/not/soru/çizgi gerçekten saklanır | Klavye, düğme ve pointer; kaydet | Ayrı makbuz1, eski read0 stale; otomatik okuma yok | Gerçek commit1/history1; typed body/hash |
| Açık read yerel taslağı ezmez | Taslağı değiştir, Kaydı oku | Okunan body1; yeni taslak korunur | Gerçek scoped read1 |
| Load-read ve reload ayrımı | Okunan kaydı taslağa al; yenile | Yalnız explicit load taslağı değiştirir; reload yereli siler | Reload write/history artışı0 |
| İkinci pencere stale kayıt | İki pencere read; diğerinde kaydet | Eski revizyonla save ret; explicit read gerekir | Pre-SQL veya actualSQL conflict ayrı etiketlenir |
| Actual commit ardından yanıt kaybı | Ayrı sabit fault-mode save/read | Unknown/persistednull; no fake receipt/retry; explicit recovery | Gerçek head1/history1, yalnız ilkcommit fault, scoped read1 |
| Mobil ve klavye | 390×844touch-emulation, Tab/ShiftTab | Read/save ilkviewport; yatay taşma yok, görünür status | Aynı fixed okul/sınıf scope; physicaldevice değil |

Tüm UI girdileri normal Playwright klavye/fare/touch API'leridir; evaluate yalnız salt-okunur DOM/geometry/screenshot yardımcıları içindir. Native görüntü incelemesi işlev testinden ayrı yapılır. En az30s normal exploratory input ve iki off-happy path: double-click/response-loss ile HTML-benzeri literal not/ikinci pencere çatışması. Yeni görünür kontrol eklenirse envantere eklenir.

İzole cached/network-none CPU1/RAM256MiB proof container; ID-owned cleanup ve server/browser kapanışı ayrı doğrulanır. PREPARE/EXECUTE proof bridge üretim wire-driver, session authentication, retention/restore, concurrency/load veya gerçek öğrenci erişimi değildir. Kullanım sayımları öğrenme/zeka/meslek analitiği değildir. Ham medya/özel output yolu Git'e alınmaz; source/provider/Drive/paidcloud/realdata yoktur.

## Frozen kod ve bağımsız denetim

Son SQL aracı SHA-256: `b83aa32b2105f877096089a9b1a0b956a5bed57c10fb5678aaf8d49d6b2c1dba`; test: `9d6107a33ca94a6196ba446d4f63be63e9cce06e751cbc5d4ed0c9e953d2c9ea`. Client/server asset kodu önceki kabulden değişmedi. Kökte taze 20/20 araç testi geçti; varsayılan çağrı SQL/server/Docker çalıştırmaz.

Bağımsız P2: advanced replay head hash'i JSON array olduğunda regex metne çeviriyordu; adapter bunu reddetse bile bridge success/replay ve reply-loss witness'ı yanlış artabiliyordu. Writer 18 PASS /2 FAIL RED → yalnız primitive string guard →20/20 GREEN; bağımsız yeniden üretimde malformed response için success/replay0, lossfalse, adapter persisted:null. İlk gerçek head1 denemesi eski hash'liydi; kendi server/container'ı kapandı ve **final kabul diye sayılmadı**. Son frozen araç üç yeni/yeniden oluşturulmuş izole konteynerde ayrı çalıştırıldı. Bu hata gerçek SQL veri sızıntısı veya kullanıcı kimlik doğrulaması ihlali olarak sunulmaz.

Denetçi frozen SQL dosyalarında134/134 ilgili test; ayrıca175 negatif/6 pozitif ve7 hermetik actual CLI startup/cleanup probe geçti. Getter/Proxy hook0. Bu probe'ların OS Docker transport'u stub idi, actual DB/native browser değildi. Denetçi yeni P1/P2 bulmadı; genel security sertifikası değildir. [Araç yazarının kanıtı](SYNTHETIC_NOTEBOOK_DESK_POSTGRES_EVIDENCE_2026-10-04.md) startup lifetime/SIGINT ve intent/fault kapılarını ayrıntılandırır.

## Gerçek normal kullanıcı akışı

Kurulu native Chrome, mevcut Playwright CommonJS girişi ve ayrı geçici headless profil kullanıldı. Kullanıcının hesap profili veya eski3338/3337 sekmesi değiştirilmedi. Desktop1440×1000 ve mobile390×844 touch-emulation; input yalnız normal klavye/fare/tap.

İlk GET/current SQL0 ve save kilitliydi; explicit read0 sonrası74UTF16 metin, bir literal HTML-benzeri not, bir soru ve üç noktalı bir çizgi kaydedildi. Noktalar `(0.1,0.25)`, `(0.25,0.45)`, `(0.4,0.3)`; mavi/6px, gerçek SQL readback aynı body'yi verdi. Beş renk/dört kalınlık kontrolü dolaşıldı. Double click tek write1/history1 yaptı; makbuz read0'ın yerine geçmedi. Yeni yerel taslak yazıldı; explicit read1 taslağı ezmeden body/not/soru/çizgiyi geri getirdi. HTML-benzeri metin gerçek `b` elementine dönüşmedi.

Explicit load-read, clear-pen/load ve clear-draft/load döngüleri eski verified read'i silmedi. Desktop write2/read2 sonrası mobile'ın eski read1'iyle save409 **SQL öncesi** reddedildi. Mobile explicit read2 taslağı korudu; yalnız load-read değiştirdi. Mobile write3/read3 gerçek SQL body'yi gösterdi. Reload yalnız GET yaptı, yerel taslağı sildi ve save'i kilitledi; ortak server'ın önceki read'i client'a açık okuma yetkisi vermedi.

30.594s keşif /152 döngü: metin değişimi, Tab/ShiftTab, details aç/kapa, clear/load, boş not ve4001UTF16 ret. Bunlar wire yazma/okuma oluşturmadı. Native pointercancel/512nokta/taşma son SQL koşusunda tekrar sınanmadı; önceki client/emitted ve memory kabulü ayrı tutulur. Yeni statement/history artışı keşif veya reload kaynaklı değildir.

## İki ayrı actual SQL fault tanığı

Reply-loss-once: ilk actual commit1'in doğru SQL makbuzu doğrulandıktan sonra cevap atıldı. HTTP503, persisted:null, başarı makbuzu yok, save kilitli, read0 stale. Otomatik retry/read yok. Yeni taslak yazıldı; explicit SQL read1, kaybolan cevabın body'sini geri getirdi ve yeni taslağı korudu. Sonraki explicit save2 normal200/read2; fault yalnız bir kez. Bu gerçek HTTP bağlantısı abort tanığı değildir; post-SQL executor reply-loss'tur.

Stale-once: fixed scripted alternate SQL commit1 yapıldı; eski revision0 isteği gerçek SQL40001 ile reddedildi. Conservative adapter write-attempt politikası nedeniyle HTTP503/persisted:null ve code `notebook_revision_conflict`; normal iki-pencere pre-SQL409'dan farklıdır. Explicit read1 başka sentetik kaydı getirdi, eski yerel taslak korundu. Explicit load/save2/read2 geçti. Bu tek scriptli alternatif commit; gerçek çok bağlantılı yarış, load veya concurrency proof değildir.

## API ve SQL son durumlarının eşliği

Final native gözlemleri25 request/25 response; uncaught JavaScript0. Desktop7(GET2/read3/save2), mobile6(GET1/read3/save2), reply-loss6(GET1/read3/save2), scripted-stale6(GET1/read3/save2). Save sonuçları beş200, bir pre-SQL409 ve iki503. Bütün durumlarda otomatik okuma/tekrar0.

| Koşu | Son revision / history | Bridge read / commit attempt / success | Ek scripted commit | Son body SHA-256 |
| --- | --- | --- | --- | --- |
| Normal | 3 /3 | 6 /3 /3 | 0 | `d76b08404f2c70f3963f2d6bfdb7af5a1e26694408d6ffe5ccf22ed6a6b148a1` |
| Reply loss | 2 /2 | 3 /2 /2 | 0 | `e63dd9cb29379a0c0e9a115b7a7c3726275ed789cee1cf1fe7b112e59f8a2737` |
| Scripted stale | 2 /2 | 3 /2 /1 | 1 | `880301e8a5f2d1baeb9607b4443dae96ba8f0785e5265334e4b651d9699e8d29` |

Bridge queryCount9/5/6; API GET'ler ve startup/final audit read'leri bu sayaçta yoktur. Final actual SQL read +scope-bound history count, native read projection ve Node crypto ile yeniden hesaplanan body digest eşleşti. Normal body52UTF16/stroke1/point3/note1/concern1; loss62UTF16, stale48UTF16 ve ikisinde diğer sayımlar0. Notebook operational counts öğrenme veya beceri başarısı değildir.

Final receipt SHA'ları: normal `3427706933b4b67807c274c26c199950760f981552915731ac5912ebb29188f8`; loss `75ce4188fa9e5860d02c27b7024193298869c9cf90fbb1010f7b923c755a0f08`; stale `688b06612f2ca505db72138fe68e970b69291ceb8a5390bd6dee23982559a9b0`. Native read'in makbuzu final SQL özetiyle aynıydı. Araç kendi başına native proof kabul etmez: `jointNativeBrowserProofAccepted:false` ve application `realDatabaseVerified:false` korunur; ortak tanık bu bağımsız kök koşusudur.

## Görsel kabul, helper hataları ve temizleme

İlk viewport, draft/read ayrımı, HTML literal not, mobile conflict, read3, unknown/final recovery, scripted recovery ve footer ayrı native screenshot'larla incelendi. Ana belge genişliği1440/390; mobile font18px,10 kontrol44–49.672CSSpx. Mobile read x36/y474.516 ve save x36/y534.078,318×49.672px;844 başlangıç viewport'ta. Alt bölgeler scroll tasarımındadır. Görünür yatay taşma/çakışma/clipping bulunmadı; premium tasarım, contrast/AX sertifikası veya fiziksel Apple/Android cihaz kabulü değildir. Stored stroke için ayrı read viewer hâlâ yok; load-read tuvale taşır.

Kök helper hataları ürün hatası diye sayılmadı: ready URL yanlış aktarılıp bir connection-refused navigation oldu; pending wait rejection REPL kernel'i sıfırladı. Eski yalnız-owned headless süreç dar PID kontrolünde kalmamıştı. Yeni CommonJS girişinden fresh browser/profile kuruldu; ESM default-export interop hatasında paket kurulmadı. Bir deepStrictEqual karşılaştırması cross-realm prototype farkına takıldı; literal alan kontrolleri ve sıralı canonical JSON eşliğiyle actual body doğrulandı. Yarım browser kabulü sayılmadı; final frozen doğru URL akışı yeniden yürütüldü. Scope veya uygulama kapısı gevşetilmedi.

Üç final own CLI SIGINT sonrasıexit0; serverStopped/containerStopped/cleanupConfirmedtrue, errorCodenull. Üç exact container inspect `No such container`; deadline koşusu passed sayılmadı. Context/mobileContext/browser/browserServer explicit kapandı; son exact ownedPID metadata kontrolü exit1/empty ile process yok. Exit-eventnull kaldığından browserexit0 iddiası yok. Kullanıcının Chrome'u/başka süreç/kurum kaynağı değişmedi.

## Özel JPEG bütünlüğü

Final9JPEG757.976bayt, ayrıca eski exploratory2JPEG222.911bayt; toplam11JPEG980.887bayt yalnız özel çıktıda. Hepsi native görüntülendi; eski iki görüntü son SQL kabulüne eklenmez. Git'te ham medya ve özel mutlak output yolu yoktur.

| Final dosya | Bayt | SHA-256 |
| --- | ---: | --- |
| final-desktop-initial.jpg | 105738 | 52c5ab8589b50cc626679d47f6e40406f2d05082f93b324faca6103aba52ce78 |
| final-desktop-read-preserves-draft.jpg | 116826 | 44e049016e836c2a638c46c88b96dbfc889e402f2858e929834257371844b7cf |
| final-mobile-initial.jpg | 50407 | 54fcab035850c2f7fbe991818e511ab854eefaf1fe54a0f6b6e833ca23032d0f |
| final-mobile-stale-conflict.jpg | 49991 | 05629e3f4857a2fd2e8a5764b1942402633ff8eabfd6a8164f8af3cc8a0728fe |
| final-mobile-sql-read.jpg | 40726 | 98790cbc1562d7a5c885c3007d7511591f82f7a84d8c3c3b404058091813cabd |
| final-mobile-footer-read-receipt.jpg | 50806 | 23957a270e45166122774c4056cdb14e82984c00db4ee301070fb75d7f97316c |
| final-desktop-actual-commit-reply-loss.jpg | 117560 | c8e49bce417439631dbe09cb2e5198934f41ebccb425996dacc084e1c35d4e31 |
| final-desktop-loss-recovery-second-write.jpg | 113480 | 28d181705e1d94e58c77e25acc32bcd9d3310cbebfab9cac09310ce04697c4b8 |
| final-desktop-scripted-sql-stale-read.jpg | 112442 | 94d4e0ef5e413902472ad295958c62a85076f0c7697399b8df2dbcbde072f681 |

## Final gate ve hâlâ açık işler

Kök frozen kodla trusted Sharp/real-media opt-in full suite: **1094/1094 PASS, fail0/skip0/cancel0/todo0, exit0,18.388s**. Önceki1056'ya factor17+rootCLI1+SQLtool20=38 eklenir. Actual SQL/native browser/audit probe sayıları suite'e eklenmez. Bu DAMA/CMMI/SPICE sertifikası, MEB onayı, hak/pedagoji veya öğrenci başarısı değildir.

UI→SQL dar sentetik zincir artık ortak kanıtlıdır. Prod wire driver/auth/tenant/session/retention/erase/restore/concurrency/rate/audit ve gerçek öğrenci erişimi açık; notebook operational counts ile learning-assessment ayrı amaçlar olarak kalır. Source-family draft ayrı [matematik denetim kanıtındadır](GRADE6_FACTOR_EVIDENCE_DRAFT_EVIDENCE_2026-10-04.md):1 taslak/0 kabul/0 yayın, render/TTS/video0 ve bütün altı kapı pending. Bu faz sourcePDF/Drive/provider/Clef/paidcloud/credential/gerçekveri/yayın yapmadı;36.000 ve genel sesli kalem video tamamlanmadı.4 Ekim08:00 Europe/Istanbul gece bitiş/sabah raporu sınırı korunur.
