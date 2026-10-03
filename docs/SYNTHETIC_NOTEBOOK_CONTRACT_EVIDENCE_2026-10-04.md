# Ayrı sentetik defter hazırlık sözleşmesi

Tarih: 2026-10-04. Durum: saf, yerel hazırlık sözleşmesi doğrulandı. DB kalıcılığı, gerçek kullanıcı yetkilendirmesi ve paylaşım uygulanmadı.

## Amaç ve otorite sınırı

Defter metni, çizimleri, kaydedilen soru/konular, notlar ve takılınan konular; `learning_progress_sync` olaylarının içine eklenmez. Ayrı amaç **`student_notebook`**, sınıflandırma **`sensitive_student_notebook`**, saklama sınıfı **`student-notebook-lifecycle`** kullanılır. Serbest metin kişisel/hassas bilgi içerebilir; içerikteki PII'yi AI ile tespit etme, anonimleştirme veya temizleme garantisi yoktur. Hash kişisel veriyi anonimleştirmez.

`createSyntheticNotebookSyncPreparer(serverResolved)` yalnız güvenilir sunucu bileşiminde kullanılmalıdır. Kurucuya verilen DTO'nun güvenilir kanaldan gelmesi çevreleyen uygulamanın sorumluluğudur; DTO'nun hashleri, `synthetic_fixture` değeri veya üretimde bulunmayan bir “trusted” bayrağı bir erişim kararı değildir. İstemci bu kurucuyu endpoint olarak çağıramaz veya `serverResolved` alanlarını seçemez. Bu dilim gerçek HTTP endpoint içermemektedir.

Sabit sunucu DTO'su:

- Sentetik school / learner / grade / schoolYear / notebook scope.
- Deftere özel küçük, **declared synthetic reference** katalog varlığı: revizyon, tanım hash'i, owner/steward, amaç, sınıflandırma ve saklama sınıfı.
- Tam hash-bağlı ayrı politika ve sunucuya ait bütçe profili.
- Mevcut sunucu revizyonu/body hash'i, en çok 100 sunucu geçmiş makbuz kaydı.
- Sınıf/yılı kapsama uyan en çok 200 soru/konu hedefi allowlist'i. Bu liste resmi müfredat veya tüm içerik kataloğu değildir.

Mevcut ortak DAMA katalog şeması/assetKinds, V2 learning-sync sözleşmesi, SQL, UI ve bellek içi defter modülü değiştirilmedi. Bu küçük defter referansı gerçek DAMA resolver'ı veya ortak katalog uygulaması sayılmaz.

## Minimal istemci ve karar API'si

```js
const preparer = createSyntheticNotebookSyncPreparer(serverResolved);
const prepared = preparer.prepare({
  contractVersion: '1.0.0',
  mutationId, idempotencyKey, expectedRevision,
  body: { text, strokes, bookmarks, notes, concerns }
});
```

Kök, gövde, entry, stroke, point, source ve receipt şemaları kapalıdır. İstemci school/tenant/learner/rol/DB role/grade/yıl/politika/limit veya `persisted`, `commitState`, `accessDecision`, `trusted`, `productionReady` gibi otorite alanları gönderemez. Entry grade, sabit scope grade'iyle eşleşir; bookmark hedefi türüyle birlikte sunucu allowlist'inde bulunmalıdır.

Başarılı sonuç `prepare_replace` veya `prepare_exact_replay` kararı ve dondurulmuş intent verir. Scope, body, request, katalog, varlık, politika, geçmiş makbuz ve intent ayrı hash alanlarıyla bağlanır; hash domain'leri `k12.synthetic-notebook.* /v1` ailesidir. İstemci gövdesi ve sunucu DTO'su derin kopyalandığından sonradan değiştirilmesi intent'i değiştiremez.

Hazırlama **closure revizyonunu ilerletmez**, yeni makbuz oluşturmaz ve saklamaz. Aynı yeni isteğin iki kez hazırlanması iki kez `prepare_replace` üretebilir; idempotent DB commit kanıtı değildir. Gerçek sunucu geçmişi aynı mutationId/key/request/body bağını içeriyorsa, eski expectedRevision için bile yalnız `prepare_exact_replay` hazırlığı yapılır. Aynı key veya mutationId altında farklı içerik/conflicting bağ reddedilir. Yeni bir istekte stale/ahead revision reddedilir. Geçmiş kaynakların politika/katalog drift'i, yanlış scope, çelişkili revizyon veya farklı head-body hash'i reddedilir; otomatik politika geçişi/historical resolver uygulanmadı.

## İçerik ve bütçe sınırları

Normal profilde en çok 4000 UTF-16 birimi metin, 64 stroke, stroke başına 512 nokta, toplam 100 bookmark, 100 not ve 100 concern vardır. Politika yalnız hardcap içinde tanımlı daha küçük sunucu profillerini seçebilir. Ayrı UTF-8 gövde bütçesi 64/128/256 KiB profillerinden biridir; bütün adet limitlerini aynı anda kullanmak byte bütçesine sığma garantisi vermez. Giriş DTO'su en çok 512 KiB, derinlik 14, düğüm 100000, dizi 512 ve obje alan sayısı 32 sınırındadır. Modül/test/belge toplam dosya boyutu ayrıca 512 KiB altında tutuldu.

Noktalar sonlu 0–1 koordinatlardır; `-0` deterministik olarak 0'a dönüşür. Palet ve kalınlık mevcut defter modülünün izinli değerleridir. Sparse/extra-field diziler, duplicate ID'ler, getter, Proxy, döngü, fonksiyon ve özel prototype reddedilir; erişim tuzakları çalıştırılmaz. Hatalar özel metni/gövdeyi echo etmez.

HTML görünümlü metin **literal plain text** olarak korunur; `html` alanı veya HTML/Markdown formatı kabul edilmez. Bu, HTML sanitizer veya güvenli DOM rendering kanıtı değildir: sonraki arayüz `textContent`/eşdeğeri kullanmalı, içeriği HTML olarak çalıştırmamalıdır. Boş snapshot temizleme intent'i hazırlayabilir; fiziksel silme veya retention enforcement gerçekleşmiş sayılmaz.

Mevcut `memory_only` notebook state'inin JSON'u, bağlamı, revizyonu ve preview bayrakları otorite kazanmaz. İçeriğin beş izinli alanı yeni request gövdesine açıkça aktarılıp tekrar doğrulanabilir; yerel state revizyonu sunucu revizyonuna otomatik dönüşmez.

## Test-first ve taze kanıt

İlk RED: `node --test test/synthetic_notebook_sync.test.mjs` → 14 FAIL; yeni factory API'sinin yokluğu nedeniyle beklenen feature-missing assertions. Uygulama sonrası 14/14 PASS. Dört ek regresyon/uç durum testiyle notebook kapsamı 18/18 PASS.

Taze ilgili regresyon komutu:

```sh
node --test test/synthetic_notebook_sync.test.mjs test/student_notebook.test.mjs test/synthetic_activity_summary.test.mjs test/learning_event_sync_eligibility_v2.test.mjs test/learning_sync_ledger_port.test.mjs
```

Sonuç: **62/62 PASS**, 0 FAIL, 0 SKIP. Syntax check ve `git diff --check` başarılı.

Pozitif kanıtlar: immutable/hash-bound body; iki okul/öğrenci/sınıf/yıl için farklı scope/request hash; eski makbuzun tam replay hazırlığı; revizyonun hazırlamada ilerlememesi; literal markup; 512 nokta; 64 stroke + 100 bookmark + 100 not + 100 concern'in kısa metinle byte bütçesine sığması; boş snapshot hazırlığı.

Negatif kanıtlar: başka sınıf/yıl hedefi; bilinmeyen bookmark; tenant/rol/persist/commit bayrağı enjeksiyonu; serileştirilmiş memory state; stale/ahead revizyon; aynı idempotency key'de değişen body/mutation; yeniden hashlenmiş farklı purpose/retention/boş owner/steward; yanlış scope/policy/catalog makbuzu; çelişkili geçmiş/head; fazla/boş/malformed text ve entry; geçersiz palette/width/point/count; aşırı byte; duplicate/sparse/extra-field veri; getter/Proxy/cycle/function/prototype. Beklentiler production hash yardımcılarından değil bağımsız test canonicalizer + Node crypto ile türetildi.

## Açık kalanlar

Gerçek HTTP auth/öğrenci-scope çözümü, okul enrolment/yıllık kota, amaç için etkili erişim politikası/izin değerlendirmesi, canonical DAMA notebook kaydı, tarihsel katalog/policy resolver, gerçek içerik-target revizyonu/onayı, atomik optimistic DB commit, sunucu makbuzu/idempotent kalıcılık, readback, cihaz senkronizasyonu, offline merge, şifreleme, anahtar yönetimi, physical retention/deletion, yedek/restore ve güvenli UI renderer bu dilime bağlı değildir. Serileştirilmiş intent, DB write veya erişim yetkisi olarak kabul edilmemelidir; gelecekteki adapter güncel güvenilir kayıtları yeniden çözümleyip doğrulamalıdır.

Bu görevde yalnız yeni modül, yeni test ve bu belge yazıldı. Ağ, model, credential, Docker, SQL, Drive, shared UI veya Git commit/push işlemi yapılmadı.

## Ana Ajan Düzeltmesi ve Bağımsız Denetim — 00:35 Türkiye Saati

Bağımsız denetim, iptal edilmiş bir Proxy'nin istemci kökünde kontrollü `notebook_request_invalid` sonucu yerine TypeError verdiğini yeniden üretti. `plain()` içindeki `Array.isArray` çağrısı, Proxy kontrolünden önceydi; nested body/source yolu ise zaten önce Proxy kontrolü yapıyordu. Yetki, DB veya kapsam aşımı yoktu; istisna/hata sözleşmesi yine de kusurluydu.

Ana ajan önce otomatik regresyon ekledi. Caption'ın ayrı unary-plus regresyonuyla birlikte **39 PASS / 2 FAIL** görüldü; revoked-root stack'i gerçek sınırdaki hatayı gösterdi. Yalnız `isProxy` kontrolünü `Array.isArray` önüne almak hatayı kapattı. Son notebook testi **19/19**; caption + notebook + fabrika CLI birlikte **43/43 PASS**, sıfır skip. Geçersiz girdiden sonra aynı closure hâlâ geçerli yeni intent hazırlar ve revizyon ilerlemez. Ana ajan tam suite'i yeniden koştu: **783/783 PASS, 0 FAIL, 0 SKIP**. Bu sayılar gerçek DB notebook commit/readback tanığı değildir.

Bağımsız son recheck **19/19 notebook, 63/63 ilgili regresyon**, ayrıca **245 negatif ret + 14 pozitif probe** geçti; erişim tuzağı/coercion hook sayısı 0. Revoked kök, iç gövde ve kaynak kontrol edildi; geçerli sonraki isteğin intent hash'i değişmedi. Denetlenen sınırlı kapsamda başka yeniden üretilebilir P1/P2 yoktur. Tümü yeniden hashlenmiş owner/steward veya ileri head kaydı hâlâ trusted composition-root girdisidir; kaynak DTO'su kendi kendini yetkilendirmez. Bu davranış DB attestasyonu veya tam geçmiş zinciri kanıtı sayılmaz.

Güncel modül SHA: `d1eb1c8828f8b8325d738cb410df720b1a7507ec5e83b3852adb600c7dfc10b8`; güncel test SHA: `31be4208a9eea6f450bcc54d80d6e91e5199a69d92534864152de69de2e8de81`. İlk 18/18 ve 62/62 yukarıda tarihsel yazım koşularıdır. Root minimal düzeltmesi mevcut V2/SQL/katalog/UI modüllerini değiştirmedi. Serileştirilmiş intent erişim kararı veya saklanmış defter değildir; gerçek auth/resolver/commit, hedef revizyonu, retention ve güvenli plain-text UI kapıları açık kalır.
