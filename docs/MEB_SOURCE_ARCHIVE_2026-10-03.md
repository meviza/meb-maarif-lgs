# MEB referans kaynak arşivi — 3 Ekim 2026

## Doğrulanan sonuç

Resmî MEB kaynaklarından **34 PDF gerçekten indirildi**. Dosyaların toplamı **142.959.822 bayt (136,34 MiB)**. Denenen 42 kaynağın 8'i indirilemedi: TYMM'nin eski `/upload/program/2024...` bağlantıları bu çalışmada HTTP 500 döndürdü. Bunlar başarılı arşiv kaydı olarak gösterilmez.

| Kaynak grubu | İndirilen | Başarısız | Kapsam |
| --- | ---: | ---: | --- |
| 2018–2024 LGS sınav kitapçıkları | 14 | 0 | Her yılın sözel ve sayısal kitapçığı; cevap anahtarları kitapçıklarda |
| Güncel TYMM ana ders programları | 10 | 0 | Türkçe ve matematik için ilkokul/ortaokul ayrı; fen, hayat bilgisi, sosyal bilgiler, DKAB, İngilizce, İnkılap Tarihi |
| Önceki MEB programları | 8 | 0 | Matematik, fen, hayat bilgisi, İngilizce, DKAB, sosyal bilgiler, İnkılap Tarihi: 2018; Türkçe: 2019 |
| Eski TYMM 2024 program bağlantıları | 0 | 8 | Bağlantılar keşfedildi ancak PDF'ler alınamadı |
| Model ortak metni ve soru yazım kılavuzu | 2 | 0 | TYMM ortak metni; çoktan seçmeli soru yazım kılavuzu |

Bu, **bütün geçmiş müfredatlar, bütün ders kitapları veya bütün aylık örnek sorular indirildi** anlamına gelmez. 2018–2024 LGS **sınav** arşivi tamamdır; [ÖDSGM aylık örnek soru indeksi](https://odsgm.meb.gov.tr/www/ornek-sorular/icerik/1011) kayıt altındadır, bütün aylık PDF'ler bu 34 dosyaya dâhil değildir. Sanat, spor, seçmeli dersler ve özel eğitim programları bu ana ders pilotunun kapsamı dışındadır.

Son dosya doğrulamasında 34 PDF'nin gerçek bayt uzunluğu, PDF başlığı ve yeniden hesaplanan SHA-256 değerleri kanonik kayıtla eşleşti. 14 sınav kitapçığının her birinde kapaktaki yıl ve son üç sayfadaki cevap anahtarı başlığı ayrıca metin olarak bulundu. Bu başlık kontrolü cevapların bağımsız matematiksel/dilsel doğrulaması değildir.

## Kanonik kayıt ve depolama

- Git'e alınabilecek kanonik metaveri: `sources/meb-reference-registry.json`.
- İndirici: `tools/meb_source_archive.mjs`; test: `test/meb_source_archive.test.mjs`.
- PDF önbelleği repo dışında: `/Users/keremcelik/Documents/Codex/2026-10-03/hedefimin-k-12-d-zeyinde-bir/outputs/meb-reference-cache`.
- İlk koşunun ham raporu önbellekte `archive-report-2026-10-03.json` adındadır. İlk sonuç 29 başarılı / 13 başarısızdı. Güncel TYMM kaynaklarının 5 geçici zaman aşımı, tek bir sınırlı yeniden deneme ile giderildi. Kanonik kayıt bu son sonuçları ve önceki başarısız denemeleri birlikte saklar.
- Dosyalar SHA-256 içeren, içerik-adresli adlarla tutulur. Başarılı kaynakların `expectedSha256` alanı sonraki denemelerde değişen içeriğin sessizce kabul edilmesini önler.
- İndirici Drive'a yüklemez, öğrenci verisi okumaz ve API/model hizmetine kaynak göndermez. Yerel Drive eşitleme klasörüne kopyalama ve uzaktaki eşitlemenin doğrulanması ayrı işlemlerdir.

Kayıt; kaynak sayfası, tam PDF URL'si, kaynak grubu, sınıf kapsamı, sürüm dayanağı, indirme zamanı, son URL, SHA-256, bayt sayısı, haklar ve kalite durumu içerir. DAMA bakımından sahip rolü `curriculum-lead`, veri sorumlusu rolü `content-source-steward` olarak kayıtlıdır. Bunlar proje rol tanımlarıdır; MEB adına verilmiş bir yetki veya onay değildir. Saklama süresi ve gerçek sorumlu kişi ataması yönetişim onayı bekler.

## Haklar ve kullanım sınırı

Bütün belgeler **`usagePolicy: reference_only` / `reuseRights: unverified`** durumundadır. Resmî sitelerde erişilebilir olmak, açık lisans veya ticari çoğaltma izni anlamına gelmez. MEB sayfalarının altlıklarında hakların saklı olduğu belirtilmektedir.

Arşiv, program/sürüm izlenebilirliği ve hak incelemesinden geçirilen referans analizine ayrılmıştır. Kaynak sorular, metinler ve görseller doğrudan ürün paketine, GitHub'a, eğitim veri setine veya üretici modele aktarılmaz. Özgün içerik; kazanım/mikro beceri hedefinden yazılır. Kaynak benzerliği denetimi, yeniden kullanım lisansı denetiminin yerini tutmaz. `rightsReview: pending` ve `semanticReview: not_performed` alanları korunmuştur: HTTPS, PDF başlığı ve SHA-256 doğrulaması pedagojik uzman onayı değildir.

## Güncel program ile uygulanan program aynı şey değildir

[TYMM temel eğitim taslak plan sayfası](https://tymm.meb.gov.tr/taslak-cerceve-planlari/temel-egitim) ve [TEGM'nin 3 Eylül 2026 duyurusu](https://tegm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-taslak-cerceve-planlar-yayinlandi/icerik/1316) 2026–2027'de TYMM uygulamasını **1, 2, 3 ve 5, 6, 7. sınıflar** için bildirir. 4 ve 8. sınıfların geçiş dışı durumları ayrı eski program bağlamında ele alınmalıdır. Her ders/sınıf/yıl bağlantısı uzman incelemesiyle kesinleştirilir; portaldaki 1–8 kapsamlı yeni bir PDF, aynı yıl bütün sınıflarda yürürlüğe girmiş sayılmaz.

İndirilen kapakların sınırlı metin kontrolünde güncel Türkçe, ortaokul matematik, fen, hayat bilgisi, sosyal bilgiler ve DKAB belgelerinin 2026; İngilizcenin 2025; İnkılap Tarihinin 2024 etiketleri görüldü. Önceki program kapakları 2018, Türkçe kapağı 2019'dur. İlkokul matematik kapağında 2026 metni görüldü; başlığın görsel kısmı bu otomatik metin kontrolünün kapsamı dışındadır. Tam içerik/sürüm ve değişim analizi hâlâ inceleme bekler.

**36 hafta**, ürünün planlama eksenidir. Resmî öğrenme çıktılarının ders saati dağılımı, güncel okul takvimi ve okul/zümre düzenlemeleriyle bağlanmadan sabit bir resmî müfredat süresi olarak sunulmaz.

## Dikdörtgen pilotu için gerçek kazanım adayları

Aşağıdaki adaylar indirilen PDF'lerde `pdftotext` ile bulundu ve belirtilen fiziksel sayfalar ayrıca tek sayfa olarak kontrol edildi. Açıklamalar ürün amaçlı kısa özetlerdir; **tam kapsam eşlemesi veya uzman onayı değildir**.

| Program ve sınıf | Kod | Pilotla ilişkisi | PDF sayfası / basılı sayfa | Kanıt kaynağı |
| --- | --- | --- | --- | --- |
| TYMM 2026, 5. sınıf | `MAT.5.4.4` | Dikdörtgen alanı ve çevresi içeren problem çözme | 51 / 51 | `tymm-current-ortaokul-matematik` |
| TYMM 2026, 5. sınıf | `MAT.5.4.2` | Birim karelerle dikdörtgen alanını değerlendirme; görselleştirme adayı | 51 / 51 | Aynı PDF |
| MEB 2018, 5. sınıf | `M.5.2.3.2` | Üçgen/dörtgen çevresi; dikdörtgen çevre soruları için aday | 58 / 56 | `legacy-2018-matematik` |
| MEB 2018, 5. sınıf | `M.5.2.4.1` | Dikdörtgen alanı ve alan birimleri | 58 / 56 | Aynı PDF |
| MEB 2018, 5. sınıf | `M.5.2.4.4` | Dikdörtgen alanı gerektiren problem çözme | 58 / 56 | Aynı PDF |

Kanıt SHA-256'ları:

- TYMM ortaokul matematik: `75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734`.
- MEB 2018 matematik: `ca94096da33478c822772425b1384bacdbe40548b0813302257fec7e8c9f9c8b`.

Saf dikdörtgen alan/çevre pilotunu doğrudan 6. sınıfın yeni kazanımı saymak doğru değildir. Yeni 6. sınıf `MAT.6.4.2`, dikdörtgen alanından paralelkenar/üçgen alanına geçişle ilgilidir (PDF sayfası 96). 6. sınıfta dikdörtgen pilotu kullanılacaksa **ön öğrenme desteği** olarak etiketlenmeli veya ilgili yeni hedefe göre yeniden yazılmalıdır. Pisagor hedefi bu pilotla ilgisizdir ve pilot kazanımı olarak kullanılamaz.

## İndirici güvenlik kapıları ve test kanıtı

İndirici yalnızca dört açıkça listelenmiş resmî HTTPS alan adını kabul eder. HTTP, kullanıcı adı/parola, alışılmadık portlar, haricî yönlendirmeler ve alan adı benzerlikleri reddedilir. Yönlendirmeler elle ve en fazla 3 geçişle izlenir. Dosya başına 25 MiB, bütün arşiv için 250 MiB üst sınır vardır; hem bildirilen uzunluk hem gerçek akış baytları kontrol edilir. Mevcut PDF önbelleği de disk bütçesine dâhildir. PDF türü/başlığı ve SHA-256 doğrulanmadan dosya kaydedilmez. İçerik-adresli mevcut bir dosya üzerine yazılmaz; symlink önbellek reddedilir.

14 testin önce eksik uygulama nedeniyle başarısız olduğu, ardından aşağıdaki komutla **14/14 geçtiği** bu fazda gözlendi:

```sh
node --test test/meb_source_archive.test.mjs
node --check tools/meb_source_archive.mjs
```

Testler URL sınırı, hak statüsünün korunması, haricî/izinli yönlendirme, döngü sınırı, HTML/PDF ayrımı, HTTP hatası, dosya/akış/toplam bayt sınırı, sabitlenen hash uyuşmazlığı, güvenli kimlik, yükseltilemeyen bütçe ve symlink reddini kapsar. Ağ yanıtları kontrollü test girdisidir; gerçek indirme ve PDF başlık kontrolü ayrıca yapılmıştır. Bu kanıt CMMI/SPICE sertifikasyonu, pedagojik yeterlilik veya güvenlik sertifikası değildir.

Yeniden doğrulama örneği; rapor adı yeni olmalıdır, var olan rapor üzerine yazılmaz:

```sh
node tools/meb_source_archive.mjs \
  --registry sources/meb-reference-registry.json \
  --cache /absolute/path/outside-repository/meb-reference-cache \
  --report /absolute/path/outside-repository/meb-reference-cache/new-archive-report.json
```

Başarısız kayıt varsa CLI çıkış kodu 2'dir; kısmî başarı tam başarı sayılmaz. Önbellek klasörü repo dışında zorunludur. PDF baytları GitHub'a eklenmeden, yalnızca bu metaveri ve faz raporu saklanır.

## Sonraki kontrollü adımlar

1. Eski TYMM 2024 dosyaları için resmî MEB/TTKB alternatiflerini bul; içerik gerçekten alınana kadar mevcut 8 başarısız kaydı açık tut.
2. Hak incelemesi, ders/sınıf/yıl uygulanabilirliği ve program onay kararlarını veri sorumluları kesinleştirsin.
3. PDF sayfası ve hash'e bağlı kazanım adaylarını ayrıştır; öğretmen onaylı kavramsal eşlemeyle eklenen, taşınan, değişen ve değişmeyen becerileri ayrı sınıflandır. Benzer metin, aynı pedagojik kapsam demek değildir.
4. Sınıf → ders → tema → mikro beceri → soru amacı → zorluk/format/yanlış kavram → hafta hücrelerini doldur; soru sayısını yalnız toplam 36.000 hedefi üzerinden değil bu hücrelerin kapsaması üzerinden izle.
5. Aylık örnek soruları ve ders kitaplarını bütçeli yeni kaynak gruplarında ele al. Telif/hak statüsü kesinleşmeden üretim veya yayın girdisi yapma.

## Resmî başlangıç kaynakları

- [Karabük ODM LGS sınav arşivi](https://karabukodm.meb.gov.tr/www/lgs-yayimlanmis-sorular/icerik/213)
- [TYMM öğretim programları](https://tymm.meb.gov.tr/ogretim-programlari)
- [TTKB önceki ve TYMM öğretim programları kataloğu](https://mufredat.meb.gov.tr/Programlar.aspx)
- [ÖDSGM örnek sorular indeksi](https://odsgm.meb.gov.tr/www/ornek-sorular/icerik/1011)
