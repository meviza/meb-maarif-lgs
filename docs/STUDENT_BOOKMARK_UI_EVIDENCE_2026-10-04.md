# Öğrenci Defteri Yer İmleri — Dar Tüketici Kanıtı

Tarih: 4 Ekim 2026. Başlangıç: `3f83650`, `codex/k12-foundation-audit`.

## Uygulanan Davranış

Mevcut sentetik defter sözleşmesindeki `bookmarks.questions` ve `bookmarks.topics` artık defter masasında görünür ve düzenlenebilir. Yeni backend, veri sözleşmesi veya SQL migrasyonu eklenmedi.

- İki düğme, yalnız mevcut sentetik okul A / öğrenci A / 6. sınıf / 2026–2027 hedeflerini açıp kapatır: `question-a-001` ve `topic-a-001`.
- İşaretleme yalnız yerel taslağı değiştirir; HTTP, SQL, otomatik kayıt veya otomatik okuma başlatmaz.
- Taslak soru/konu listeleri ve son açık okumadaki soru/konu listeleri ayrıdır. Yazma makbuzu okunan içerik yerine geçmez; doğrulanmış okuma yalnız açık **Kaydı oku** işlemiyle yenilenir.
- Okuma, yerel taslağı sessizce değiştirmez. **Okunan kaydı taslağa al** eylemi yer imlerini de açıkça taşır.
- Her iki düğmede `aria-pressed` taslağın mevcut seçimini gösterir. Düğmeler normal klavye düğmeleridir; dar ekranlarda sarılan düzen, mevcut 44 px kontrol ve görünür focus stili kullanılır.
- Görünür açıklama, örnek hedeflerin yayımlanmış soru veya ders olmadığını belirtir. Başka sınıfların veya okul B'nin hedefleri gösterilmez.

`createSyntheticNotebookDeskClient().toggleBookmark(kind, id)` yalnız iki izinli ilkel değer çiftini kabul eder. Yanlış tür, bilinmeyen hedef, başka okul hedefi veya ödünç alıcı reddedilir. Bekleyen işlemde düzenleme kuyruğa alınmaz. Yeni taslak aynı `bodyValid` ve UTF-8 gövde bütçesinden geçmeden mevcut taslağın yerine konmaz.

## Test-Önce Kanıtı

`test-driven-development` becerisi ve `writing-good-tests.md`, gerçek istemci / uygulama / mount tüketicisine odaklanmayı belirledi; yeni testler yalnız belge veya kaynak metni varlığını sınamaz. Mevcut DOM/HTTP sınır çiftleri kullanılır; tam uygulama yanıtları gerçek uygulama kodundan gelir. Bu bir native tarayıcı veya gerçek PostgreSQL kanıtı değildir.

1. Altı yeni test, üretim kodu değiştirilmeden çalıştırıldı: **30 mevcut PASS / 6 beklenen FAIL**, exit 1, skip 0. Beklenen nedenler `local bookmark action missing` ve `question bookmark UI missing` idi.
2. Minimal istemci ve mount değişikliği sonrası **36/36 PASS**, exit 0, skip 0.
3. Ek gövde-bütçesi testi, tam **131.072 UTF-8 bayt** taslağa yer imi eklenmesinin bütçeyi aşmamasını istedi: **1 beklenen FAIL**, `true !== false`, exit 1. Minimal düzeltme yeni taslağı mevcut `bodyValid` denetiminden geçirir; başarısız ekleme eski taslağı değiştirmez.
4. Son ilgili regresyon koşusu: **78/78 PASS**, fail / cancel / skip / todo 0, exit 0; `469.019459 ms`. `git diff --check` exit 0.

Komut:

```sh
node --test test/synthetic_notebook_desk_client.test.mjs test/synthetic_notebook_desk_server.test.mjs test/synthetic_notebook_desk_preview_cli.test.mjs test/synthetic_notebook_desk_postgres_preview.test.mjs
```

Yedi yeni davranış testi; yerel aç/kapat ve diğer notun korunması, yanlış/başka okul hedefi, bekleyen okuma kilidi, toplam UTF-8 bütçesi, ayrı taslak/okuma listeleriyle save→read, açık load ve commit sonrası yanıt kaybını sınar. Yanıt kaybında taslak kalır, eski okuma güncelmiş gibi değiştirilmez, otomatik tekrar yapılmaz; tek açık okuma sonucu toparlar. Eski grade/tenant/policy/hash ve monoton sürüm negatif testleri de aynı koşuda geçti.

## Kapsam Ve Açık Kabul

- Yalnız beş dosya: üç öğrenci UI dosyası, ilgili istemci test dosyası ve bu rapor.
- Kayıtlar öğrenme başarısı, soru çözme olayı veya beceri analitiği değildir; DAMA amaç / sınıflama / kaynak / sürüm / sahip / saklama bağı mevcut defter akışından korunur.
- Backend kimlik doğrulama / kayıt-sınıf çözümleme / çok kullanıcılı erişim eklenmedi. Bu tek sentetik deneme, gerçek öğrenci veya yayımlanmış içerik teslimi değildir.
- Bu çalışmada gerçek SQL deneyi, native tarayıcı / fiziksel cihaz / screenreader kabulü veya tam depo test koşusu yapılmadı. Ana ajan native önizleme ve bağımsız kabulü ayrıca kaydedecek.
- Yeni kaynak / Drive aktarımı / credential / sağlayıcı çağrısı / ücretli iş / Docker instance / model veya SDK indirmesi / soru / ses / video / yayın yok.

Yerel memory önizleme: `node tools/synthetic_notebook_desk_preview.mjs --port 0`. Sunucu `127.0.0.1` üzerinde rastgele boş portu bildirir; process-memory test double'dır, kalıcı PostgreSQL driver'ı değildir. Önceki opt-in SQL aracı ve gerçek SQL raporları tarihsel kanıttır; bu yeni yer-imi UI değişikliği için otomatik olarak taze SQL veya native kabul sayılmaz.
