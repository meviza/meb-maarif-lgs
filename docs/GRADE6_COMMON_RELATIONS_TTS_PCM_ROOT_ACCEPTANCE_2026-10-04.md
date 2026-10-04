# Ortak İlişkiler: Kapalı TTS Ve Yerel PCM Ön Kontrolünün Teknik Kabulü

4 Ekim 2026, sabah sonrası kullanıcı devam talebi. Başlangıç commit'i `27cae113119d4619ec43ba0310dc27ab1f2211ee`, dal `codex/k12-foundation-audit`. [Önceki görsel–ses köprüsü](GRADE6_COMMON_RELATIONS_VOICE_BRIDGE_ROOT_ACCEPTANCE_2026-10-04.md) korunarak [sesli video planının](NEXT_REASONED_VIDEO_ACCEPTANCE_2026-10-04.md) iki dar yerel sınırı ve gerçek fabrika bağlantılı tanı aracı uygulandı. **Yeni konuşma veya video teslimi değildir.** Gece/sabah takipleri yeniden başlatılmadı; Gemini'nin asıl checkout'u değiştirilmedi.

## Fiilî Faz Çıktısı

| Sınır | Fiilî Teknik Geçiş | Sağlamadığı Kabul |
| --- | --- | --- |
| Kapalı TTS hazırlığı | Gerçek bridge → mevcut current consumer → yalnız tam güncel cue için değişmez hazırlık; kilitli cevapta istek/body/tekil metin hash'i yok. | Transport, hesap/credential, sağlayıcı izni, canlı endpoint, konuşma veya ticari hak. |
| Yerel PCM doğrulaması | Native byte-view'dan canonical WAV başlığı, her signed16 sample, tam WAV/PCM hash'i, sayım ve süre. | Konuşulan metin, öğretmen/ses kimliği, doğal hitabet, sağlayıcı kökeni veya dinleyici kabulü. |
| Gerçek fabrika bağlantısı | Aynı mevcut görev/iki bağlamın20 güncel cue'su local-unattested PCM receipt'ine bağlanır; kaynak/request/receipt lineage korunur. | Yeni soru, banka tamlığı, öğrenci yetkisi veya yayımlanmış sesli kütüphane. |
| Tanı CLI'si | Varsayılan `not_run`; yalnız açık `--synthetic-pcm` üç küçük metadata dosyasını okuyup20 fixture'ı doğrular. | TTS, ses dosyası, MP4, oynatma, Drive/Docker veya seri üretim. |

İki çakışmayan yazar, bir bağımsız readonly denetçi ve root entegrasyonu kullanıldı. Root final kod/test/kanıtları okuyup kendi tam koşusunu yaptı. Yazar raporları: [kapalı TTS](GRADE6_COMMON_RELATIONS_CLOSED_TTS_EVIDENCE_2026-10-04.md), [PCM receipt](COMMON_RELATIONS_PCM_RECEIPT_EVIDENCE_2026-10-04.md). Test-önce ve tamamlanma öncesi doğrulama kullanıldı; fixture/oracle hataları sistematik kök incelemesiyle ürün kusurundan ayrıldı. Yeni skill, SDK veya bağımlılık kurulmadı.

## Kapalı TTS Hazırlığı

[TTS modülü](../packages/media/grade6_common_relations_closed_tts.mjs) yalnız `createGrade6CommonRelationsClosedTts(bridge, cursor)` ve `auditGrade6CommonRelationsClosedTts(preparation)` sunar. Cursor dört primitive alanla sınırlı; endpoint, request/hash, credential, transport, yetki/bütçe, response veya callback seçilemez. Bridge issuance'ı önce doğrulanır; gerçek sahne/current consumer yeniden çalışır.

Her hazırlık `held_no_provider_call`. Açık body tam kanonik güncel cue'dur; caption sayfası veya bütün on cue listesi değildir. Sayfalama/ilerleme aynı açık cue'nun kimliğini değiştirmez; bu playback/idempotency değildir. Protected cue için `reveal=true` ve `progress=1` birlikte gerekir; aksi hâlde request/candidate ve request/transcript hash'i null. Aggregate bridge hash'i auth/anti-cheat kanıtı değildir.

Yalnız exact `google-gemini-interactions` / `gemini-3.8-flash-tts` / `Charon` veya `Kore` beyanı dokümana bağlı, **canlı doğrulanmamış** protokol adayı verir. Başka geçerli beyan unsupported/null candidate üretir. Sabit POST Interactions body tek verbatim metin + speech metadata style, WAV/24kHz, `store:false`, `stream:false` içerir; çağrı yetkisi veya sıfır-retention beyanı değildir. Transport/response parser/network/IO/credential yolu yok; call/retry bütçesi0. `credentialPresent:false` ortam/hesap taraması değil, yapılandırılmamış yerel sınırın durumudur.

WeakSet/WeakMap issuance, recursive freeze ve domain SHA; JSON/shallow/deep/rehash/Proxy/revoked kopyasını authority yapmaz. Audit metadata-only; hazırlık64KiB, audit16KiB, aday body16KiB. Bütün upstream pending ve yeni izin/hak/privacy/retention/minor-terms/endpoint/bütçe kararları taşınır; üretim kapıları kapalıdır.

## PCM: Gerçek Sample, Konuşma Değil

[PCM modülü](../packages/media/common_relations_pcm_receipt.mjs) inspect/audit/bind/audit-bound sunar. İlk Proxy/native-brand kontrolü, Buffer-prototipli gerçek Uint8Array, fixed native ArrayBuffer ve captured offset/length getter'ları kullanılır. Shared/resizable/detached/foreign/fake/subclass profilleri ret. Native Uint8Array'ı Buffer prototipine taşımak allocation kökeni değil, native byte-view sınırıdır. Kullanılmayan named/symbol/getter dekorasyonlar **okunmadan/kopyalanmadan yok sayılır**. Modül yüklenmeden önce global native prototiplerin değiştirilmediği bir sandbox iddiası değildir.

Canonical44-byte RIFF: tek `fmt`16/PCM1, mono24kHz/signed16LE, byteRate48000/blockAlign2, tek even `data`, başlık/gerçek boyut eşliği. Extra chunk, metadata, padding, başka sıra/codec/hız/kanal, truncated/trailing veya repair/remux yok. Min6000 sample/0,25s; max2.880.000 sample/120s, PCM5.760.000B/WAV5.760.044B; pre-copy input10MiB, süre sınırı daha dardır.

Private copy üzerinde başlık yeniden kontrol edilir, **son sample dahil bütün PCM** decode edilir; min/max/peak/nonzero sayımı ve gerçek WAV/PCM SHA üretilir. Raw ses/sample receipt/audit/WeakMap içinde tutulmaz. Receipt `local_pcm_decoded_unattested`, bağ `local_pcm_metadata_bound_unattested`; metadata/audit16KiB. Caller input'u sonradan değiştirince stored hash değişmez. Locked hazırlık receipt'e dokunmadan reddedilir; kopyalar yetki değildir.

Sample süresi fiziksel PCM süresidir, ölçülmüş öğretmen konuşması değildir. Sessizlik veya aynı tone'un farklı cue'ya bağlanması teknik kabul edilebilir; spoken-text/voice/listener/word–pen/playback/provider-delivery/learner/publication/production false kalır. Request ve audio hash'lerinin yan yana bulunması metnin okunduğunu kanıtlamaz; kapılar/pending kaybolmaz.

## Gerçek Fabrika Tanı Aracı

```sh
node tools/common_relations_audio_preflight.mjs
node tools/common_relations_audio_preflight.mjs --synthetic-pcm
```

[CLI](../tools/common_relations_audio_preflight.mjs) default/yanlış argümanda source/media yüklemez. Opt-in yalnız üç fixed metadata JSON'u regular/no-symlink/parent identity/fd stat/bounded read/final identity/strict UTF-8 ile okur; dosya başına512KiB. Caller path/output/endpoint/token/credential/live/bütçe yok. Sabit sanitized hata, partial stdout yok, fd kapanır. Snapshot kontrolleri bütün OS yarışlarının imkânsızlığı veya üretim filesystem sandbox'ı değildir.

Hardcoded `local-pcm-fixture` / `signed16-test` / `not-a-person` desteklenmeyen fixture'dır; Google/TTS değildir. Editor reveal explicit açıktır; öğrenci auth değil.20 küçük fixture aynı iki context'in bütün cue'larında gerçek factory/bridge/closed/PCM/bound API'leriyle doğrulanır; SHA/metin/birim/current/pending eşliği ve değişmeyen factory JSON'u sınanır. stdout yalnız küçük metadata/sayaç; raw transcript/body/path/sample/media dosyası yok.

Root iki actual subprocess koşusunda byte-identical sonuç gördü: default372B/`not_run`; opt-in15.701B,20 bağ/20 ayrı request/20 ayrı audio SHA/120.190 toplam sample/53 pending. Raw UTF-8 stdout SHA: `6f17f4916f5a75549bcf33e188eee412d09761ba9e8879abcf4ee1854a4e7612`. Bir mevcut görev/iki context; yeni authored/accepted/published0, provider ve dosya yazımı0. Tekrar tanı yeni stok değildir.

| Gerçek Okunan Metadata | Boyut | Raw SHA256 |
| --- | ---: | --- |
| `meb-reference-registry.json` |64117B|`40996a2fa263851f2687c7e51750b1ebdc81ae96071ada1be485d95c618b9386`|
| `grade6-common-relations-application-observations.json` |13725B|`56797b561747c51eb5a4a36b2d5296b40f8d6d955942e3290d97ee5a2bf1cb71`|
| `grade6-source-semantic-candidate-matrix.json` |28693B|`31edb054438bda76809910ed0fcc87227093954401caec48abcd7e04ef5722c8`|

Bu hash'ler yeni PDF edinimi, tam program semantiği veya uzak Drive bütünlüğü değildir.

## TDD, Karşı Örnekler Ve Final Root Kanıtı

Eksik consumer/export/CLI gerçek RED→minimal GREEN verdi. Önceden geçen postimplementation characterization'a yapay RED atfedilmedi. [Root entegrasyonu](../test/grade6_common_relations_closed_tts_pcm_integration.test.mjs) ve [CLI testi](../test/common_relations_audio_preflight_cli.test.mjs) final9/9 PASS,831.186666ms; fail/skip/cancel/todo0,exit0. Frozen TTS root tekrar15/15,1437.74875ms. Sayılar farklı koşular olduğu için toplanmaz.

Gerçek düzeltmeler:

- İlk PCM extra-own-field reddi milyonlarca byte-index property enumerate ediyordu.120s tanık1630,90ms/maxRSS660.930.560B; final kabul değil. Root unused native dekorasyonları okumadan ignore sözleşmesini açıkça revize etti. Gerçek RED resource/decorated-byte testleri sonrası enumeration kaldırıldı;120s/sample sınırı azaltılmadı.
- PCM binding'de explicit `providerCallsAllowed:false` eksikti. Ayrı RED→minimal flag→GREEN; teknik audio receipt çağrı izni değildir.
- CLI hardcoded pending listesi upstream kararları düşürüyordu. Missing-active-program RED sonrası actual factory/bound pending union; final53 yükümlülük.
- Root fixture'daki `callsAllowed`/`providerCallsAllowed` ve literal `Google AI Studio` generic-ID regex varsayımları sözleşme okunarak düzeltildi; ürün kusuru veya contract gevşetmesi değil. Denetçinin ilk future-text substring oracle'ında kanonik plan/özet doğal metin örtüşmesi vardı; doğru oracle exact current body'dir. Genel privacy/answer-extractability classifier uygulanmadı.

Root final max tanığı:5.760.044B WAV/2.880.000 sample/120s, first−32768/last32767, full decode/peak32768/nonzero2/direct WAV ve PCM SHA eşliği. Paralel tam koşu altında159,306084ms, heap delta657.784B, maxRSS71.106.560B/peak footprint32.066.272B; sonra input sıfırlandığında receipt hash sabit. Tek yerel ölçüm/paralel CPU yükü; SLA/cloud maliyet kanıtı değil.

Final yedi code/test pininde root tam regresyon:

```sh
K12_INK_REAL_MEDIA_TEST=1 K12_INK_SHARP_PACKAGE=/trusted/cached/sharp/package.json node --test test/*.test.mjs
```

Sharp yolu kamu raporu yer tutucusu; gerçekten güvenilen mevcut bundled paket kullanıldı. **1336/1336 PASS, fail/skip/cancel/todo0,exit0,23289.793375ms.** Syntax7/7 exit0. Önceki1295 checkpoint'ine41 test eklendi, ürün sorusu değil. Eski raster/codec/altı-PCM mux regresyonları yeni common konuşma/video veya gerçek SQL/okul kabulü sağlamaz.

Root üç source ve yedi eski factory/media/CLI dosyasını başlangıç Git blob'u ile disk karşılaştırmasında10/10 byte-identical doğruladı. Yeni API eski canonical akışı/genel renderer'ı değiştirmez; yeni UI/HTTP playback/DB/Docker/Drive/mobil SDK yok.

## Bağımsız Frozen Audit

Readonly denetçi dört yeni suite41/41 PASS,998,67ms; fail/skip/cancel/todo0,exit0/syntax7/7. Yedi frozen code/test ve12 eski source/software pini aynı; dosya yazmadı. Bu bounded seam'de açık P1/P2 bulmadı; genel platform/pedagoji sertifikası değil.

Ek tanıkları:560 TTS cursor/sayfa (112locked/448open),72 hostile/clone/arity ret/hook0; PCM8 pozitif,147 negatif,40 actual cue bağı,48 locked-before-receipt,120 immutable-mutation ret/hook0. Max profil28,80ms/heap delta281.584B/RSS72.056.832B; CPU koşulları root'tan farklı, SLA değil.

CLI10 yanlış argüman source-read0;15 controlled in-memory fs fault injection (link/FIFO/size/inode/short/UTF-8/JSON/lineage vb.) sanitized ret/FD-close. Bunlar intercepted faults, gerçek filesystem race kanıtı değil. Normal CLI ayrıca gerçek terminalde exit0: üç metadata106.535B/stdout15.701B/20 bağ/53 pending; üç raw hash bağımsız eşlendi.

## Resmî Sağlayıcı Bulgusu Ve Sonraki Kapı

[Google TTS dokümanı](https://ai.google.dev/gemini-api/docs/speech-generation) ve [model kaydı](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts),3.8/Interactions adayını destekler. Doküman bilinirliği live access değil; terminal response/audio parser uygulanmadı. [Interactions saklama açıklaması](https://ai.google.dev/gemini-api/docs/interactions-overview) ışığında `store:false` bütün güvenlik loglarını ortadan kaldırmaz.

[Google API şartları](https://ai.google.dev/gemini-api/terms), reşit olmayanların erişmesine yönelik API-client kullanımını sınırlar. Yetişkin offline editörün statik eğitim varlığı üretmesi yorumunun uygunluğu **doğrulanmadı**; sağlayıcı/hukuk incelemesi gerekir. Çıktı mülkiyeti ifadesi bütün ses/kaynak hakları veya koşulsuz ticari izin değildir; ücretsiz/ücretli data-use/retention ayrıca incelenir. Yetişkin login'i veya önce beğenilmiş ses K-12 canlı üretim izni sayılmaz.

Sonraki gerçek ses kapısı: scoped hesap/credential/çağrı-maliyet bütçesi, ticari haklar/minor-terms/privacy-retention/style-voice kararı; sonra tek current cue'nun gerçek yetkili response/bytes → bounded disk/readback/decode → metin/sayı/birim/telaffuz/insan dinleme. Tam çözüm için bütün on cue ayrı kabul; sonra ölçülmüş veya insan doğrulanmış word–pen → common raster/mux/MP4/native playback. Eski garden WAV'ı rehash/relabel edilmez; otomatik retry veya açıklanmamış harcama yok.

DAMA source/version/purpose/lineage/quality/pending taşınır; production owner/steward/access/retention/rights karar store'u açık. CMMI/SPICE test/hata/negatif/audit kaydı var, sertifika/olgunluk derecesi değil. Tam müfredat, uzman/psikometri, okul tenant/auth/retention/restore, premium UI/mobil ve36.000 ayrı açık işler. Clef advisory QA; bu fazda Clef/üretici/TTS çağrısı, yeni PDF/Drive/Docker/DB, gerçek çocuk/kurum verisi, harcama, ses/video veya yayın0.

## Frozen Code/Test Pinleri

| Dosya | Boyut | SHA256 |
| --- | ---: | --- |
| `grade6_common_relations_closed_tts.mjs` |6270B|`20eaad3650898ff22ff126483860ac133d9d0a40be625d0095a4473a0d081bb9`|
| `grade6_common_relations_closed_tts.test.mjs` |18823B|`c1720244564c925b00f474dc360b001ca9dd0571073148b618ff9990b1d13060`|
| `common_relations_pcm_receipt.mjs` |10170B|`3fb3a7a15c04385c0616547e8e383f0d312b439c46e241f824613f01c7f1a351`|
| `common_relations_pcm_receipt.test.mjs` |19055B|`433474847fb57edc6a7b4e0853c773e9a0ffaf3c0efc40fb94fb1c753e51a900`|
| `grade6_common_relations_closed_tts_pcm_integration.test.mjs` |14561B|`022b93a1bf34f6494f80568f90c9d3628c748dcfe8ea4e1b70cb4a37f3732f2c`|
| `common_relations_audio_preflight.mjs` |9058B|`ed57b8c9b689d6903f69e03114669103ce04bbdd94339ddae544b1c451a603f9`|
| `common_relations_audio_preflight_cli.test.mjs` |4845B|`cdd9b2266176e7d13796495b828aa42fc3ec2d3032b3a9f5749dce5c69057f66`|

Yazar belgeleri frozen: TTS11690B/SHA`e6cbdf1346f756d09a413beb2e9705b3f72b4d1741d450ad98789d6f2610d652`; PCM11969B/SHA`30a3640438f3bd7e4d17bcfde621f176886e4a439c181f54002a4dd98e428e25`. Güvenli Git tesliminin commit'i final Git çıktısından alınır; self-hash iddiası yazılmaz.

Root doküman güncellemesi sonrası aynı frozen code/test'te dört yeni suite'i tekrar koştu:41/41 PASS,1071.732083ms,fail/skip/cancel/todo0,exit0. Kamuya seçili14 dosyada9 frozen SHA, strict UTF-8/NUL/newline/512KiB sınırı,212 yerel Markdown bağlantısı ve credential/private-path kontrolü yapıldı. İlk basit path taraması yalnız testin `/Users/` ve `/var/folders/` çıktıda bulunmamalı guard literal'larını işaretledi; özel kullanıcı yolu değil. Worktree'nin `.git` dosyası directory gibi incelenmez; hook konumu `git rev-parse --git-path hooks` ile çözümlenir. Bu iki doğrulama-aracı varsayımı ürün kodu/pinleri değiştirmeden ayrıldı. Final güvenli dosya ve staged diff kontrolü Git tesliminden önce yeniden yapılır.
