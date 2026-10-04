# 6. Sınıf Kaynak Bilgili Yazım Planı — Faz 11 Kanıtı

## Kök entegrasyonu ve bağımsız kapanış

Writer kanıtından sonra fixed metadata CLI eklendi: `node tools/grade6_reference_authoring_plan.mjs`, opt-in `--plan`. Yalnız dört sabit public JSON okunur;512KiB/file, leaf nofollow/nonblocking, descriptor/path pre/post identity/size ve fatalUTF8 sınırı vardır. Keyfi path/count/provider/output seçimi yoktur, dosya yazmaz. Tam main+supplement girdisi21.423bayt plan ve `cb53aa3522b9e9003ecddef79f19461d465da12ba53f1336391bb15c0f1dff51` üretir; brief6, generated/accepted0, unmatched14/15, MAT.6.1.4 örneklem gap. CLI3 tüketici testi0/3 RED→3/3 GREEN.

Bağımsız denetim null download row'da native property-error buldu; onay/rights bypass değil, bounded domain-error kusuruydu. Root16.test önce15PASS/1RED, yalnız `record(row)` before `.sourceId`, sonra16/16 GREEN. CLI+planner19/19; bağımsız76/76 ve actual null probe typed `grade6_authoring_invalid_fields` doğruladı. Final module SHA `813227eb5b6dfff0684db7513597d49a41104763412eb35196e9687e0b7a94c0`, test SHA `d608d58be4c4c32ed3c1d98df5289849994a027253c80762bee71f67a37fb6c3`. Altındaki15test writer kaydı tarihsel kendi dilimidir; root16. testi ayrı kapatıldı. Plan içerik hash'i değişmedi. Bu bölüm eklendiğinde doc'un ilk frozen hash'i artık final doc hash'i değildir.

Bağımsız14negatif/7property, hooks0, rehashed metadata retleri ve mevcut approved coverage contract'ın bu pre-planı reddi geçti. Open source denetim bulgusu kalmadı; pedagoji/hak/etkinprogram/cevap/zorluk/erişilebilirlik kabulü hâlâ yok. [Kök final1056suite ve ayrı native kanıt](SYNTHETIC_NOTEBOOK_DESK_BROWSER_EVIDENCE_2026-10-04.md).

Durum: Saf ve sınırlı bir editör planlayıcısı. Altı brief, altı üretilmiş veya kabul edilmiş soru değildir. Soru kökü, seçenek, sayısal soru vektörü, cevap anahtarı, kaynak geometrisi, SVG, ses ve video üretilmedi/kopyalanmadı. Bu fazın ürüne soru katkısı 0.

## API ve Gerçek Tüketici

Yeni modül `packages/content-factory/grade6_reference_authoring_plan.mjs` yalnız şu API'yi dışa açar:

```js
createGrade6ReferenceAuthoringPlan({
  formObservations,
  semanticMatrix,
  sourceScopeInput
});
```

`formObservations`: Mevcut `sources/grade6-question-form-observations.json` içindeki altı kaynak dış sıra 13–18. `semanticMatrix`: Mevcut `sources/grade6-source-semantic-candidate-matrix.json`. `sourceScopeInput`: Mevcut `createSourceScopeGapReport` tüketicisinin beş alanlı public metadata girdisi: `archives`, `selection`, `downloadObservations`, `monthly`, `formObservations`.

Kapsam girdisindeki gözlem aynı kanonik metadata revizyonu olmalı. Arşivler iki değişmemiş kaynak satırını içermeli: MEB ana kaydındaki `tymm-current-ortaokul-matematik` ve ek kayıttaki `meb-archive-grade6-math-fascicle-unit1-hatay`. Tam küçük public snapshot'lar veya bu iki aynı satırla dar bir `sources` snapshot'ı kullanılabilir. İki kaynak için ayrı download override kabul edilmez. Modül dosya/ağ/model/Drive I/O yapmaz; public JSON okuması test veya çağırıcı sorumluluğundadır.

Kaynak ve metadata bağları:

- Fasikül PDF SHA: `f10cd0b17c300d5c9f0b70ba762be99534915d493e7eff37cbb07aec6a9a4b9e`; 6.199.288 bayt. Kaynak satırı kanonik metadata SHA: `e93f7e528f80858a4b4e4e779f9a69f4184deab617269a40991c023d7006c875`.
- Program PDF SHA: `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`; 3.916.466 bayt. Kaynak satırı kanonik metadata SHA: `610d60eeb3d8387517d2f74f71be171fa8663e3a177d42bd217b647ac6bdea19`.
- Gözlem metadata kanonik SHA: `6388cb4b9200d9fd7be078716b292bd7c97e478f8be12a94a8dc779c8a3b75be` (dosya SHA'sı `4032ecda60638eb0d16e37dfcfd3881ab2e3bd88a246059b226d06b3e3eb11b2`).
- Program aday matrisi kanonik SHA: `5721af3ed1445402207a11ec8d91e22308f87c9f3af0c4544fd58a9ae5b8a6c8` (dosya SHA'sı `31edb054438bda76809910ed0fcc87227093954401caec48abcd7e04ef5722c8`).

Kanonik metadata SHA; object key'lerini sıralayan, array sırasını koruyan JSON projeksiyonunun hash'idir. Sadece object key sırası değişirse aynı plan oluşur. Amaç, kaynak sayımı, item sırası, çıktı, grade/course veya hak durumu değişip çağırıcı yeni SHA hesaplarsa bilinen revizyon yerine geçmez. Yeni kaynak revizyonu ayrı inceleme ve açık pin güncellemesi gerektirir. Bu pinler kimlik doğrulaması, ticari izin, taze PDF byte kontrolü veya etkin program onayı değildir.

## Amaç → Öğrenme Kanıtı → Yeni Temsil

Her brief, kaynak aile/temsil metadata kimliklerine bağlıdır; briefin açıklaması ve temsil önerisi editör yazımıdır. Kaynak şeklinin koordinatları ve sayıları taşınmaz. On altı mikroamaç kimliği korunur; bunlar resmî öğrenme çıktısı sayılmaz.

| Kaynak dış sıra | Yeni planlanan öğrenen kanıtı | Yeni temsil önerisi | Henüz çalıştırılmamış cevap denetimi gereği |
| --- | --- | --- | --- |
| 13 | İki koşulu ayrı sınama ve ortaklığı gerekçelendirme | Koşullara göre sınıflanan metin/örüntülü kartlar | Tam üyelik tablosu, bağımsız kesin oracle ve kapalı yanıtta tek geçerli harita |
| 14 | Kısıta uygun eşdeğer ifade oluşturup değerini kontrol etme | İzinli işlem jetonları ve eşdeğerlik şeridi | Sınırlandırılmış ifade dili; kesin tamsayı/rasyonel değerlendirme; kısıt denetimi; `eval` kullanılmaması |
| 15 | Yol boyunca hata sayısını koruma ve bütün mümkün yolları açıklama | Adım/sonuç/yön/hata bütçesi defteri | Özgün sonlu topoloji; kesin işlem değerlendirmesi; tam bir hata ile erişilebilirlik gezmesi |
| 16 | Çarpan listesinin tamlığı, asal alt küme ve hedef nicelik ayrımı | Eş çarpan tablosu ve metinli asal rozetleri | Pozitif bölen kümesi; birin asal olmaması; farklı asal çarpanları tekrar saymama |
| 17 | Kısmi çarpan bilgisinden ters kurma ve belirsizliği kontrol etme | Eksik eş çarpanların tamamlandığı kanıt panosu | Sonlu aday alanında kesin eleme; kapalı yanıt için biriciklik; belirsiz girdiyi açık görev yapma veya reddetme |
| 18 | Her seçimin hangi ara sonuçtan geldiğini sıralamada koruma | Asal seçim ve köken ilişkisi tablosu | Asal alt kümeler, istenen uç değer, sıralama yönü ve tekrar koruyan çıktı |

Her temsil yalnız gereksinimdir, render değildir. Açık kanıt izi, yanıtın dışında nasıl ve neden yol seçildiğini de kaydedecek şekilde tasarlandı. Anlatım gereği: Sorunun ne istediğini ayırma → verinin neyi anlattığını belirtme → yolun neden seçildiğini açıklama → ara değerlerin kaynağını gösterme → koşullara göre sonucu kontrol etme. Bu, hızın öğrenme kanıtı sayılması değildir.

Pratik notlar koşulludur: Ne zaman işe yarayabilir, neden yardımcı olabilir, hangi kontrol yine yapılmalı? Bu notların öğretici etkinliği ve yaş uygunluğu uzman/öğrenci çalışmasıyla doğrulanmış değildir. Temsil kimliği değişmesi tek başına pedagojik yenilik veya özgünlük kanıtı değildir; gelecekte benzerlik ve hak incelemesi gereklidir.

## Ayrı Bekleyen Kapılar

`activeProgram`, `pedagogy`, `rights`, `difficulty`, `answer`, `accessibility`: Altısı da pending. `humanApproval` ve `canonicalCurriculumBinding` null; `coverageBlueprintReady`, teacher/learner/publication/production hazır bayrakları false. Kaynak kullanım politikası `reference_only`, ticari haklar unverified, modele aktarım kapalı.

14 ve 15'in önerilen resmî kodları boş, `officialOutcomeCode` null ve program bağı `unbound_additional_mapping_pending`. Diğer dört soru yalnız MAT.6.1.1–3 içerik alt kümesi önerisi taşır; onların da resmî kabul edilmiş kodu null, bütün çıktı kapsamı false. MAT.6.1.4 için `not_observed_in_this_sample` açık boşluğu vardır; bütün programda yokluk iddiası yok.

Zorluk kalibrasyonu ve kaynak dağılımı null. Kullanıcının 10/30/30/30 örneği sadece `exampleDifficultyTarget` olarak, uygulanmamış ve evrensel olmayan hedef örneği etiketiyle saklanır; MEB dağılımı veya her sınıf için zorunlu kural yapılmadı. Planın soru kotası null, stok/üretilen/kabul edilen soru sayısı 0.

Altı cevap politikası bir gereksinimdir. `automatedVerifierPassed:false`, `answerKey:null`, expert accepted false; gerçek oracle/solver çalıştırılmadı. Sonradan bu algoritmalar kurulmadan ve negatif/bağımsız kabul kanıtı olmadan kapalı soru kabul edilmemeli. Bu faz öğretmen, hak sahibi veya program kurulu adına onay kaydı üretmez.

Mevcut `question_coverage_blueprint` sözleşmesi bu pre-blueprint editör planını reddeder. Onun kanonik müfredat, insan onayı, 36 ayrı hafta ve kabul edilmiş item metadata gereklilikleri değiştirilmedi veya bypass edilmedi. Bu uyumsuzluk kanıtı, gelecekte uydurulmuş ayrı bir onay zarfının yetkili olduğunu göstermez; güvenilir dış onay/adaptör sınırı ayrıca gerekir.

## TDD, Negatif Sınırlar ve Taze Doğrulama

Önce 13 test yazıldı: API yokken 0/13 RED, modül sonrası 13/13 GREEN. Sonra iki eksik sınır için ayrı test-first döngü:

- 13 PASS / 1 RED: Eksik scope alanı hash hesaplamasına `undefined` verip ham native hata üretiyordu. Kök neden; kapalı scope alanlarının hash'ten önce denetlenmemesi. Beş alan ve nested container kontrolü öne alındı → 14/14 GREEN.
- 14 PASS / 1 RED: Çok uzun field key'i değer metni bütçesini atlayarak revision hash aşamasına ulaşıyordu. Kök neden; byte bütçesine yalnız değerlerin katılması. Key uzunluğu/kontrol karakteri kontrolü ve keys+values ortak bütçe eklendi → 15/15 GREEN.

Getter/proxy/toJSON/root proxy sıfır hook çağrısıyla reddedildi. Döngü, sparse array, ek giriş alanı, aşırı string/array/key, kontrol karakterli key ve toplam 2 MiB'ı aşan metin reddedildi. Eski veya yeniden hashlenen form/matrix; kayıp veya yanlış grade/course; değişen source SHA/byte/title/rights; eksik program; duplicate source; farklı scope gözlemi de kapalı kaldı. İnert snapshot en çok 100.000 node, depth 24, array 2.048, record 1.024 own key, key 160 karakter ve ayrı 65.536 karakter string sınırı taşır. Dönen çıktı derin frozen, kanonik hash bağlı ve en çok 64 KiB'dır; hash authority değildir.

Son taze birleşik çalışma: 72/72 PASS; sıfır hata/skip. Modül ve test syntax exit 0:

```sh
node --test test/grade6_reference_authoring_plan.test.mjs test/grade6_question_form_observations.test.mjs test/grade6_source_semantic_matrix.test.mjs test/source_scope_gaps.test.mjs test/question_coverage_blueprint.test.mjs
node --check packages/content-factory/grade6_reference_authoring_plan.mjs
node --check test/grade6_reference_authoring_plan.test.mjs
```

Gerçek public girdilerle ayrı saf çağrı kanıtı: Ana + ek arşiv, TYMM selection/download metadata, LGS aylık metadata ve yeni altı gözlem. Giriş 477.667 bayt; çıktı 21.423 bayt. Altı bağlı kaynak gözlemi, altı brief, sıfır soru, `sourceQuestionTotal:null`, `freshPdfByteChecks:0`. Çıktı SHA `689e5dbd7b4d3f222bdbaf2b33f38216ca37993ffbf826c61d36efd9c8e1767a`; tüketici rapor SHA `e3161d703783ce4be5b5d04cac20e90c751d6a5dc25c252ddbd599164aac2233`.

Yalnız main+supplement snapshot girdisinin farklı kapsam hash'i beklenir: Çıktı aynı 21.423 bayt, plan SHA `cb53aa3522b9e9003ecddef79f19461d465da12ba53f1336391bb15c0f1dff51`. Aynı iki source row'un dar snapshot'ı aynı altı briefi verir, ancak toplam kapsam raporunun SHA'sı ayrıdır. Bunlar public metadata snapshot durumlarını ayırır; fiziksel PDF sayısını veya ürün stoğunu artırmaz.

TDD ve verification becerileri davranış/soybağı kanıtını; systematic-debugging iki sınır kusurunun kök nedenini yönlendirdi. İnsan raporu prose testi yapılmadı. Testler pedagojik kabul, MEB onayı, DAMA/CMMI/SPICE sertifikasyonu veya üretim hazır kanıtı değildir.

## Sonraki Güvenli Dilim

Kabul edilmemiş program bağlarını gerçek çıktı/uzman kararlarıyla kapatma; her brief için özgün somut görev ve bağımsız kesin oracle; pedagojik/cevap/erişilebilirlik/benzerlik/hak denetimi; sonrasında güvenilir insan kararıyla mevcut coverage sözleşmesine ayrı geçiş. Normal CLI'ye bağlama bu modülün işi değildir; root ayrıca opt-in seam ile inceleyebilir. Bu fazda eski JSON'lar, ortak scope/coverage modülleri, normal CLI, Drive, kaynak PDF'ler veya Git değiştirilmedi; ağ/provider/öğrenci verisi kullanılmadı.
