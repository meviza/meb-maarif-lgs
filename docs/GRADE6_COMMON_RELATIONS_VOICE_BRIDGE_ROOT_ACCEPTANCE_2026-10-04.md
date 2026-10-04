# Ortak İlişkiler: Görsel–Ses Köprüsü Ve Güncel Adım Teknik Kabulü

4 Ekim 2026. Başlangıç commit'i `617268207647a33efdbe382564ae03f584893769`, dal `codex/k12-foundation-audit`. Kullanıcının devam talebiyle [sesli video planının](NEXT_REASONED_VIDEO_ACCEPTANCE_2026-10-04.md) ilk saf bağlantı dilimi uygulandı. **Yeni ses veya video üretilmedi; bu teknik hazırlık öğrenci teslimi, uzman kabulü veya üretim yayını değildir.** Gemini'nin asıl checkout'u ve gece/sabah otomasyonları değiştirilmedi.

## Gerçek Fabrika Bağlantısı

[Yeni köprü](../packages/media/grade6_common_relations_voice_bridge.mjs), mevcut gerçek fabrika hazırlığını ve kaynak metaverisi pinlerini yeniden kanonik doğrular. Özgün canlı iki trace/job ile scene yetenekleri kopyalanmadan denetlenir. Seçili bağlam için mevcut genel medya API'siyle oluşturulmuş ayrı, sağlayıcı/stil **beyanlı** ses işini tüketir; sağlayıcı çağırmaz. Görsel işin sağlayıcısı `null` kalır. Kaynak, iz, bütün on adımın metni/hash'i, tür/sıra/step/anchor ve düşünme araları birebir bağlıdır.

Görsel ve ses işinin ID'si aynı olabilir; bu aynı revizyon değildir. Sesin kendi job/request/style hash'leri görselin hash'lerinden ayrı bağlanır. Değişmiş metin, başka bağlam, garden işi, varsayılan sağlayıcı, caller rehash veya JSON kopyası bu köprüye dönüştürülemez. Başka geçerli beyanlı provider/style ayrı köprü revizyonudur; canlı uç nokta, ticari izin, ses kimliği veya dinleyici onayı değildir. Beyan alanlarında iki kanonik bağlamın bilinen tam cue metni veya tekil cue hash'i varsa köprü reddedilir; hash karşılaştırması büyük/küçük harf varyantlarını da kapsar. Bu dar literal referans izolasyonudur, genel gizlilik/prompt uygunluğu veya kısmi/yeniden yazılmış/kodlanmış metin sınıflandırması değildir.

Yeni bridge'in yerel WeakSet issuance'ı vardır; bütün kopyaları audit'te reddedilir. Eski factory dış wrapper'ının issuer markası yoktur: tam kanonik veri ve gerçek değişmez canlı çocukları koruyan yüzeysel wrapper kabul edilebilir. Bu wrapper kökenini doğrulamaz. Genel job, creator trace nesne referansını kanıtlamaz; farklı gerçek kanonik üretimde aynı trace ID/hash/metin anlamı kabul edilebilir. `audit.valid=true` yalnız yerel teknik issuance'dır; auth veya yayın kararı değildir.

Bu faz normal CLI'yi değiştirmedi, yeni CLI/HTTP/oynatma yolu eklemedi. Gerçek fabrika API'si → genel ses işi → bridge → mevcut gerçek frame/narration tüketimi doğrulandı. Önceki özel paket/disk CLI kanıtı korunur; JSON paketini yeniden okumak canlı yetenek veya ses üretimi değildir.

## Yalnız Güncel Adımın Ses İsteği

[Güncel tüketici](../packages/media/grade6_common_relations_current_voice_cue.mjs) önce canlı bridge audit'i yapar. İkinci argüman yalnız dört primitive editör cursor alanını kabul eder: `cueIndex`, `pageIndex`, `progress`, `reveal`. Bağlam, provider/style, kaynak yolu, endpoint, zaman veya callback seçilemez. Mevcut gerçek scene renderer'ı aynı kaynak/iz/görsel iş/scene/geometry ile tüketilir.

- `result`, `check_answer`, `summary`, `transfer_answer` yalnız `reveal=true` ve `progress=1` birlikteyken açılır. Diğer durumlarda `voiceRequest=null`, request hash'i `null`, request byte'ı0; korunan metin/hash ve ses provider/style kimliği çıktıda yoktur.
- Açık adımda yalnız **bir güncel cue'nun tam kanonik anlatımı** vardır; seçili caption sayfasının kısaltılmış metni veya bütün on cue listesi yoktur.
- Aynı açık cue'nun request kimliği caption sayfası/ilerleme/reveal değişiminden bağımsızdır. Frame/manifest ayrı cursor kimliğini taşır. Bu tekrar seslendirmeyi önlemeye uygun bir hazırlıktır; playback, idempotent taşıma veya exactly-once yürütme kanıtı değildir.
- Transfer cue'su kaynakta olmayan yeni geometriyi uydurmaz; `sourceDiagramProof=false`, geometry pending. Verilen tablodan cevabın çıkarılabilmesi anti-cheat/auth güvencesi değildir.

Bridge bütün metni ve cevap tanıklarını taşıyan editör artefaktıdır; current-only teslim sınırı olarak bütün bridge serialize edilmez. Güncel çıktı da öğrenci yetkilendirmesi değildir. TTS çağrısı, ses baytı, kelime zamanlaması, ölçülmüş süre veya audio playback üretilmez.

## Anlam Ve Açık Kapılar

Mevcut bağımsız sonlu-küme oracle'ı korunur: `[24,48]` dakika; `[1,2,3,4,6,12]` kart/paket;6 kart/paket örneğinde `[4,6]` paket. Dakika, paket boyutu ve paket adedi karıştırılmaz. Generic numeric adım0 ve semantic review pending; bu formal EBOB/EKOK, öğrencinin ustalığı veya bilişsel/mesleki tanı kabulü değildir.

On cue içinde iki düşünme prompt'u dörder saniye beyan eder: bağlam başına8 saniye **planlı ara**, konuşma/video süresi değil. `measuredSpeechSeconds=null`; frame progress'i veya caption sayfalaması kelime timestamp'i üretmez.

Altı kapı activeProgram/pedagogy/rights/difficulty/answer/accessibility pending. Canonical fabrika, medya hazırlığı ve iki işin28 açık yükümlülüğü kayıpsız taşınır; current manifest bunları korur. Tarihsel nested `provider_selected_voice_job_bridge` başlığı silinmez: bu yerel bağlantının varlığı yetkili provider/TTS/endpoint/öğretmen kapısını açmaz. Native glyph, öğretmen/cevap ve erişilebilirlik yükümlülükleri kaybolmaz.

DAMA kaynak/sürüm/amaç/lineage/kalite durumları bağlanır; owner/steward/access/retention karar store'u, ticari haklar ve gerçek okul-yıl kararları hâlâ gerekir. CMMI/SPICE hazırlığına test/hata/izlenebilirlik kaydı eklenmiştir; olgunluk derecesi veya sertifika değildir. Provider declaration, endpoint/privacy/style/voice acceptance değildir. Clef danışma katmanı ve önceki üretici adaptörü bu fazda çağrılmadı.

Sayaçlar: bir mevcut özgün görev; bağlam başına bir mevcut görsel iş ve bir beyanlı ses varyantı. Fabrika hâlâ iki mevcut anlatım işi taşır. Yeni ürün sorusu, uzman kabulü ve yayın0;36.000 hedefi veya tüm müfredat tamamlığı ilan edilmez.

## TDD Ve Root Taze Doğrulaması

İki çakışmayan yazar ve bir bağımsız readonly denetçi kullanıldı. Root iki modül/test ve kanıt belgelerini okudu. [Köprü yazar kanıtı](GRADE6_COMMON_RELATIONS_VOICE_BRIDGE_API_EVIDENCE_2026-10-04.md): gerçek eksik-export, pending aktarımı ve son iki P2 için ayrı RED→minimal kod→GREEN; final20/20, o anda ilgili121/121. [Güncel cue kanıtı](GRADE6_COMMON_RELATIONS_CURRENT_VOICE_CUE_EVIDENCE_2026-10-04.md): eksik consumer ve açık-iş aktarımı RED→GREEN, son onarımları tüketen iki postrepair characterization; final17/17 ve102/102. Eski17/15 ve103/97 sonuçları pre-hardening tarihseldir, final kabul değildir.

Grouping konuşma birimi, caption sayfa sayısı ve elle oluşturulan trace fixture'ının insertion-order digest varsayımları gerçek üretim okunarak düzeltildi; ürün hatası olarak sunulmadı. Kapsam dışı completed-flag testi kaldırıldı, o davranış uygulanmış sayılmadı. Önceden geçen characterization testlerine yapay RED atfedilmedi. Test-önce, sistematik hata kökü incelemesi ve tamamlanma öncesi doğrulama kullanıldı; yeni skill/SDK/bağımlılık kurulmadı.

Root frozen dört kod/test dosyasında tam komutu yeniden çalıştırdı:

```sh
K12_INK_REAL_MEDIA_TEST=1 K12_INK_SHARP_PACKAGE=/trusted/cached/sharp/package.json node --test test/*.test.mjs
```

Gösterilen Sharp yolu kamu raporu yer tutucusudur; gerçekten mevcut güvenilen bundled paket kullanıldı. **İlk frozen set:1290/1290 PASS; fail/skip/cancel/todo0, exit0,21242.701667ms.** Sonradan aşağıdaki iki P2 karşı örneği bulunduğu için bu sayı final hardening kabulü sayılmaz. **İki düzeltme ve yeni downstream tanıklardan sonra final taze koşu:1295/1295 PASS; fail/skip/cancel/todo0, exit0,63766.296ms.** Dört final JS syntax kontrolü exit0. Paralel CPU yükünde tarihsel altı-PCM mux testi yaklaşık52 saniye sürdü; bu runtime bir common ses/video teslimi veya performans hedefi değildir. Hermetik küçük raster/codec regresyonu yeni common ses/video veya gerçek SQL/okul/sağlayıcı kabulü sayılmaz.

İlk tam testten sonra root ve bağımsız denetçi iki gerçek uç durum buldu. (1) Genel işte geçerli bir stil beyanına bilinen başka cue'nun tam metni/hash'i veya provider ID'ye cue hash'i konunca açık goal isteği bunları metadata üzerinden taşıdı. Gerçek RED60 style/120 provider referansını kabul ederken hata verdi; bridge iki bağlamın bütün20 cue'suna karşı dar literal ret guard'ı ekledi. (2) Kanonik request'in yalnız dışı dondurulmuş kopyası, gerçek live trace/job/scene referansları korunmuş shallow factory'de kabul edildi; nested cue değişebilir, audit digest'i stale kalabilirdi. Gerçek RED sonrası freeze çocukları ebeveyn zaten donmuş olsa da gezer; aynı kabul edilen kanonik request artık tamamen değişmez, mutation TypeError ve actual JSON domain hash'i sabit. Factory wrapper için yeni issuer iddiası eklenmedi. İki düzeltme TDD ile ayrıdır; önceki1290 geçişi bunların bulunmadığı anlamına gelmez.

Root ayrıca gerçek fabrika ve downstream scene tüketimini bağımsız inline probe ile sınadı ve iki onarımdan sonra tekrar etti: **280 current frame/request durumu**,56 kapalı,224 açık,49 açık caption sayfası,36 transfer-pending durum ve20 ayrı current request kimliği. Sekiz progress/reveal vektörü bütün geçerli sayfalarda çalıştı. Gerçek frame/narration deep parity, birebir birimler/sayılar/metin, her current request/manifest ve bridge/binding domain digest'i, component byte'ları, bütün pending işlerin aktarımı doğrulandı. Kapalı durumlarda korunan metin/hash/provider/style ve ses job/request hash'i yok; sentetik sabit fixture'da her iki bağlamın diğer cue metni/hash listesi yok; ilk hook tanığında çağrı0. Postrepair root ayrıca12 gerçek metadata referans ret'i ve4 kısmen frozen request varyantında16 mutation TypeError ile stored/actual bridge digest ve current request kimliği sabitliğini doğruladı. Serbest beyanın genel anlamsal gizlilik kabulü çıkarılmaz.

Bu root probe'daki sentetik provider/style için gözlenen byte'lar:

| Bağlam | Bridge | Binding | Metadata audit |
| --- | ---: | ---: | ---: |
| repeat |51254|7408|9787|
| grouping |50612|7450|9831|

En büyük current output22573B, tek-cue request3341B, manifest3584B. Bütçeler bridge512KiB/binding ve audit16KiB; current output128KiB/request32KiB/manifest16KiB. Bunlar bu sentetik fixture'ın ölçümleridir; gerçek ses/model maliyeti değildir. Desteklenen en uzun stil/kimlik profilleri testlerde ayrıca sınanır; geçerli kanonik sabit görevde output overflow guard'ının mutlaka tetiklendiği iddia edilmez.

Altı eski leaf/CLI ve altı kaynak metaverisi dosyası başlangıç commit'ine byte-identical12/12. Özgün canonical factory compact JSON121996B, raw SHA`3f8b5eee96c0e0827a0813df55f95fffa3ea6e5db38a9b1bfd073db2c0fa2991`, üretimden sonra değişmedi. Önceden saklanan üç disk dosyası da actual readback'te doğru boyut/hash/0700–0600 izinlerle aynı kaldı; sesli artefakt diye yeniden etiketlenmedi. Disk newline SHA ile domain digest ayrı tutulur.

## Bağımsız Frozen Denetim

Readonly denetçi iki onarımdan sonraki final frozen kod/test'i önce/sonra4/4 byte/SHA eşliğiyle doğruladı. Yeni iki dosyada37/37 test, fail/skip/cancel/todo0,13994.121417ms; ayrı altı bağlı pure suite86/86, aynı kapılar0,2840.344625ms. Kendi toplamı123/123; root1295 ve diğer yazar sayılarıyla toplanmaz. Dört syntax exit0. Önceden kaydettiği üç kaynak ve beş eski modülün8 pin'i değişmedi; root'un12 byte tanığı ayrı kapsamdadır.

Kendi gerçek canlı probe'ları:237 genel ret (111 bridge girdi,20 bridge-brand,106 current cursor/bridge);360 bilinen literal metadata referans ret'i (20cue×iki seçili bağlam×dokuz stil/provider varyantı);160 out-of-range sayfa ret'i; caller hook0. Sekiz gerçek kanonik/live varyant kabul edildi,20 cue anlam satırı korundu.280 cursor/sayfa durumunda56locked/224open/36transfer-pending; ek49 maksimum-stil/provider açık sayfası,273 request-domain hesabı ve20 ayrı stable request kimliği geçer. Bunlar vaka tanıklarıdır; yeni ürün sorusu veya tek bir test sayısına çevrilmez.

Dört yalnız kısmen dondurulmuş kanonik request varyantında16 mutation TypeError, nested cue/style değişmezliği, actual/stored bridge ve current request hash sabitliği yeniden doğrulandı. İlk iki P2 bağımsızca kapanmış; bu bounded seam'de açık P1/P2 bulunmadı. Genel platform güvenlik sertifikası veya öğretmen/dinleyici kabulü değildir. Altı fragment/yeniden anlatım/alt çizgiyle kodlanmış hash kontrolünün kabul edilip privacy/style/human/learner kapılarının pending/false kaldığı da sınandı; guard genel gizlilik sınıflandırıcısı gibi sunulmaz. Denetçi dosya yazmadı; Git/provider/DB/Drive/browser veya gerçek medya işi açmadı.

## Frozen Kod/Test Pinleri

Root önce/sonra dört pin'i doğruladı:

- Bridge12378B: `fc69a9802a8c69e0c486f57d2769d5ae148c38d5fbb14af5c5f6329ec848dc3c`.
- Bridge test25410B: `67e1305059162440ee6c73c741d23281011c1d8f6dcab9b7310fbccbbac1e092`.
- Current consumer12236B: `d5cc8e49368aef45c2cd68188951afab0c5aba43027a5659c5c3e8d46e1ccf30`.
- Current test24766B: `27352a685b419daaa52217e1e771b37adf7dfff9d29bc4ece7322aeedbccebbe`.

## Bir Sonraki Gerçek Dilim

Önce kapalı TTS sınırı: açık iş başına izin/credential/endpoint/rights/privacy/token/maliyet/byte/süre bütçesi olmadan transport0; tek güncel cue'dan gerçek yetkili ses baytı ve sınırlı decode/dinleme kanıtı. Yanlış konuşmayı doğru dosya hash'iyle kabul etme. Tek clip tam çözüm değildir; tam bağlam için bütün on cue gerekir. Sonra ölçülen veya insan doğrulanan sözcük aralıkları, kalem eşlemesi ve gerçek common renderer/mux. Eski garden WAV'ını rehash/remux/relabel etmek yeni anlatımı üretmez.

Bu fazda canlı provider/TTS, yeni ses/video/PDF edinimi, Drive, Docker, DB, hesap/credential, ücretli cloud/model, native browser/cihaz ve gerçek öğrenci/kurum verisi0. UI oynatma/HTTP/normal CLI'ye ses gönderme ve genel seri üretim açık; gerçek byte/transkript/sayı-birim/telaffuz/karakter/yaş/dinleyici ve kelime–kalem onayı bekliyor. Gece/sabah takipleri yeniden başlatılmadı.
