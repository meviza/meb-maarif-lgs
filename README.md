# K–12 Eğitim Platformu — Denetlenmiş Temel ve İçerik Atölyesi

Bu dal, Antigravity prototipini koruyarak 1–8. sınıf için ortak platform temeli kurar. **Üretim sistemi, MEB onaylı ürün veya uzman onaylı soru bankası değildir.** Öğrenciye içerik teslimi kapalıdır. Geçmiş README'deki sıfır hata, tam müfredat, PostgreSQL ve sıfır disk/Drive iddiaları doğrulanmış beyan değildir; tarihsel metin Git geçmişinde korunur.

## Güncel çalışma

- [Yenilenmiş faz planı](docs/PLATFORM_REBASE_PLAN_2026-10-03.md)
- [Antigravity kodunun yeniden denetimi](docs/ANTIGRAVITY_CODE_REAUDIT_2026-10-03.md)
- [Gerçek MEB indirme kaydı](docs/MEB_SOURCE_ARCHIVE_2026-10-03.md) ve [kaynak/hash defteri](sources/meb-reference-registry.json)
- [İçerik fabrikası ve canlı model sınırları](docs/CONTENT_FACTORY_PILOT.md)
- [DAMA-DMBOK veri yönetimi](docs/DAMA_DATA_GOVERNANCE.md)
- [Mac/Docker/okul barındırma kararı](docs/HOSTING_STRATEGY_2026-10-03.md), [video kanıtı](docs/VIDEO_PILOT_EVIDENCE_2026-10-03.md) ve [medya araç/lisans araştırması](docs/MEDIA_TOOL_RESEARCH_2026-10-03.md)
- [Öğretmen ses/hareket standardı](docs/TEACHER_VIDEO_STANDARD_2026-10-03.md) ve [üç gerçek Türkçe ses önizlemi / V2 bağlama kanıtı](docs/TEACHER_VOICE_PILOT_EVIDENCE_2026-10-03.md)
- [Kalite kapıları](docs/QUALITY_GATES.md) ve [belge dizini](docs/README.md)

36.000 soru hedefi kazanım/alt beceri/soru ailesi kapsama matrisinden hesaplanacak; ders anlatımları ayrı sayılacak. Haftalık akış okul takvimi ve uygulanan program sürümüne bağlanacak. İndirilmiş MEB belgeleri yalnız referanstır; ticari yeniden kullanım hakları henüz doğrulanmadı.

## Yerel çalıştırma

Node.js ile, yeni bağımlılık veya Flutter SDK indirmeden:

```sh
npm test
npm run generate:pilot -- --count 100 --out /absolute/path/to/new-empty-pilot-directory
K12_PILOT_REPORT=/absolute/path/to/new-empty-pilot-directory/batch.json npm run studio
```

Stüdyo yalnız `http://127.0.0.1:3334` üzerinde çalışır. Filtrelenebilir taslak sorular, özgün SVG çizimler, adım adım çözümler ve kaynak defteri gösterir. Gerçek okul yönetici kimlik doğrulaması, rol/tenant yetkileri veya öğrenci analitiği sunmaz. Ayrı CLI bir soru için sessiz MP4 pilotu üretir; bu video öğrenci kütüphanesine bağlanmış/yayımlanmış değildir. Çözüm anahtarı editöryal incelemede görünür; öğrenci API'sine açılmaz.

`npm run student:preview` ayrı `http://127.0.0.1:3335` öğrenci tasarım önizlemesini açar: yalnız sentetik 6. sınıf/yıllık okul kaydı, altı ders çekmecesi, kaydedilenler, takıldıklarım ve metin/çizim defteri. Başka sınıf seçimi yoktur; istemci sınıf/rol/yıl beyanları API'de reddedilir. Defter yalnız oturum belleğindedir; yenilenince silinir, öğretmene gönderilmez. Soru/ders/video kütüphanesi uzman onaylı içerik bulunmadığı için boştur. Bu, gerçek kimlik/abonelik servisi veya kalıcı öğrenci uygulaması değildir.

100 adaylık yerel sayısal pilotta 12 taslak kalır, 88 aday tekrar/çeşitlilik sınırında elenir. Bu pilot Clef veya canlı metin modeli çağırmaz. Sayısal kontrol, arşiv özgünlüğü veya pedagojik uzman kararı yerine geçmez. Rastgele 100 soruyu onaylı sayma veya otomatik yayınlama yoktur.

## Cloudflare sınırı

Clef Flash metin/görsel karar ve değerlendirme modelidir; serbest soru yazarı değildir. Ayrı metin üretim adaptörü yalnız denetlenmiş `@cf/zai-org/glm-4.7-flash` uç noktasını kabul eder. Hesap/anahtar, açık canlı çağrı seçeneği ve sayısal token/maliyet bütçesi olmadan ağ çağrısı yapmaz. Anahtarlar Git'e veya sohbete yazılmaz; [.env.example](.env.example) sadece alanları belgeler ve otomatik yüklenmez.

Model çıktısı doğrulanmamış taslaktır. Clef sonucu yalnız yardımcı kanıttır. Matematik, görsel-sayı bağı, dil, müfredat, haklar, benzerlik, erişilebilirlik ve bağımsız insan incelemesi tamamlanmadan yayın kapısı açılmaz.

## Eski komutlar ve depolama

`scale:bank`, `generate:curriculum`, `seed`, `cloud:backup`, `cloud:sync`, `drive:stream` npm girişleri denetlenmemiş eski akışları başlatmaz; exit 2 ile karantina durumunu bildirir. Eski kaynak dosyaları doğrudan çalıştırılabilir tarihsel koddur; işletim sistemi seviyesinde engellenmiş değillerdir.

GitHub'da yalnız kod, yönetişim ve kaynak metaverisi tutulur. PDF/cache, anahtar ve öğrenci verisi tutulmaz. Drive Desktop kopyası ile uzak yükleme doğrulaması farklıdır; [gerçek depolama sınırları](docs/GITHUB_AND_DRIVE_SETUP.md) geçerlidir. Drive PostgreSQL, canlı içerik CDN'i veya veritabanı simülasyonu değildir.
