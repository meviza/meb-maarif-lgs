# Aylık LGS kaynağı: root edinim/Drive ve güncel kapsam kanıtı

4 Ekim 2026, yaklaşık 01:44 Türkiye saati. Bu kayıt [kaynak ajanının bounded edinim raporundan](LGS_MONTHLY_DOWNLOAD_PILOT_2026-10-04.md) ayrıdır: root bir yeni dosyanın yerel SHA'sını, iki gerçek sayfa görselini ve özel Drive arşivindeki uzak baytlarını kontrol etti. Bütün müfredat veya kaynak soru bankası kabulü değildir.

## Edinim ve kaynak biçimi

[Yeni pilot registry](../sources/lgs-monthly-download-pilot.json), eski keşif kaydının aynı 88 kimliğini korur: **1 indirildi, 1 başarısız, 86 denenmedi**. Eski snapshot değiştirilmedi. Başarısız Kasım 2019 CDN denemesinin nedeni bilinmiyor; tekrar GET yapılmadı. Dosya/phase/cache/küresel sınırlar artırılmadı; root yeni PDF GET yapmadı.

Başarılı [Mayıs 2019 resmî sayısal kitapçığı](https://odsgm.meb.gov.tr/meb_iys_dosyalar/2019_05/24094027_Sayisal_mayis_ornek_sorular.pdf): **2.954.686 bayt**, SHA-256 `2c4fea59203a1392df21a77765575df79c54e26249d7f6041fea890a95d36b3e`. Root mevcut dosyayı yeniden hashledi; pdfinfo ile 23 sayfa/A4/PDF1.5/tagged değil/form ve JavaScript yok gözlemi eşleşti. Bu PDF güvenlik veya erişilebilirlik sertifikası değildir.

Kaynak ajanı 23 sayfanın metninde Matematik10/Fen10 soru ordinali ve 20 cevap anahtarı girdisi saydı; adımlı çözüm0 gözlendi. Root bu tam metin sayımını yeniden yapmadı; **fiziksel 3 ve 12. sayfa için iki gerçek 745×1053 rasterı ayrıca gördü**. Birim ızgara–dik üçgen/uzunluk karşılaştırması ve önce–sonra bileşik prizma/yüzey değişimi gerçekten görseldir. İki özgün mikroamaç/aile etiketi proje yazarlık önerisi; etkin çıktı, ölçülmüş zorluk veya cevap doğruluğu kabulü değildir. Bu 20 referans sorusu ürünün 36.000 hedefine eklenmez; kaynak soru/seçenek/anahtar/görsel kopyası Git veya ürün bankasına alınmadı.

## Özel Drive aktarımı ve gerçek readback

Mevcut Drive becerisi yalnız önceden belgelenmiş özel proje arşivi için kullanıldı. Aynı kurulu skill hash'i önceki kısmi CAUTION incelemesiyle eşleşti; yeni plugin/skill kurma, script indirme veya tam güvenlik sertifikası iddiası yok.

1. Bağlı hesabın profil kimliği ve exact proje klasörü metadata'sı okundu. Klasör paylaşılmamış, tek kullanıcı/owner izni bağlı kullanıcıyla eşleşti. Başka Drive klasörü aranmadı; paylaşım/senkronizasyon ayarı değiştirilmedi.
2. Doğrudan klasör listesinde 48 kayıt ve exact yeni ad için0 eşleşme görüldü; yeni dosya overwrite değil **tek upload** ile bu klasöre oluşturuldu.
3. Uzak ad, 2.954.686 boyut, PDF MIME, exact parent, shared=false ve tek user/owner email eşleşmesi kontrol edildi. İlk karşılaştırmada connector profilinin `email` alanı yerine `emailAddress` okunması false verdi; alan şeması görülüp düzeltildi. Gerçek farklı hesap veya ek izin gözlenmedi.
4. Connector raw file reference sağladı. Mevcut integrity verifier, kısa ömürlü ref'i **echo kapalı stdin** üzerinden aldı; URL argv'ye, kalıcı dosyaya, Git'e veya çıktıya konmadı. İlk pipes invocation stdin EOF yüzünden başlamadı; ağ/bayt doğrulaması sayılmadı. İkinci invocation gerçekten stream etti: **state=verified, 2.954.686 bayt, aynı SHA**. Yeni local download kopyası yazılmadı.
5. Son doğrudan klasör listesi **49 kayıt / exact yeni dosya1 / listed shared=true0** gösterdi. Bu yeni dosyanın uzak SHA'sı doğrulandı; eski48 dosyanın SHA'sı bu fazda yeniden okunmadı. **49 uzak dosyanın tamamı taze byte-verified denmez.**

Özel devam receipt'i yalnız Git dışındaki mevcut çıktı alanına mode0600 yazıldı; signed reference/credential içermiyor. Bu yeni tek kaydın hash bayrağı diğer kayıtlar için true yapılmadı. Dosya silme, taşıma, yeni folder, public paylaşım veya öğrenci verisi yükleme yok. Drive arşivdir; PostgreSQL, CDN, işlemci/kota veya on-prem testinin yerine geçmez.

## Güncel kapsam projeksiyonu

Root eski aylık satırların `pdfUrl/part/grade` alanlarını yeni `url/section/gradeCandidate` ile exact eşleştirerek yalnız download durumunu **bellek içi kopyaya** overlay yaptı. İlk helper alan adı farkıyla durdu; tamamlanmış rapor sayılmadı. Düzeltilen eşlik kontrolü 88 ID/URL/bölüm/tarih/yıl/sınıfı korudu. Mevcut saf kaynak raporu kullanıldı; modül, eski JSON ve önceki tarihli 42-hücre raporu değiştirilmedi.

| Ölçü | Güncel ayrı overlay |
|---|---:|
| Kaynak kimliği | 199 |
| Kayıtlı download kimliği | 50 |
| Eşsiz PDF SHA revizyonu | 49 |
| Kimlik bazlı toplam bayt | 261.697.320 |
| Eşsiz SHA bazlı toplam bayt | 253.351.598 |
| Başarısız/bütçede bekleyen durum | 63 (8 eski +54 büyük kitap +1 yeni başarısız) |
| Metadata-only kimlik | 86 |
| Büyük kitap byte-budget blocked | 54 |
| Aylık bölüm | 88: download1, henüz edinilmemiş87 |

İngilizce workbook alias'ı iki kimlik/tek SHA kalır. Katalog143/selected59/deferred56/excluded28 ve 42 aday sınıf–ders hücresi değişmedi. Altı 8. sınıf aday ders hücresinde aynı çok-dersli aylık kitapçık görünmesi altı PDF veya altı kabul edilmiş ders kapsamı değildir. Etkin program, çıktı/süreç, mikrobeceri, soru ailesi/temsil ve beklenen kaynak paydaları **null/unknown**, coveragePercentage=null, hak/uzman kabulü pending, ürün soru katkısı0. Saf raporun freshPdfByteChecks=0 alanı korunur; root tek dosya kontrolü ayrı kanıttır.

Overlay digest `3f4c369d88b25cc901df60e8c51d6f61f209c3f3c85faa49bb640984779e1ef4`. Eski digest `24532a523f923539e71dae72d6601e5e3d4675ad3c382acdaead3481dfbacd42` tarihsel snapshot için geçerlidir. Önceki27 kaynak-biçim gözlemi ile bu ayrı20 kaynak sorusu tam arşiv sayısı olarak toplanmadı; raporun sourceQuestionTotal/monthly.pdfQuestionTotal null kalır.

Yeni iki snapshot karakterizasyon testi **2/2** geçti; network/PDF/Drive testi veya missing-feature RED iddiası değildir. Kaynak edinimi ve remote byte proof test suite sayısından ayrıdır. Açık erişim açık ticari lisans değildir; `reference_only/unverified`, model aktarımı/yayın false. 2026–27 aktif program eşdeğerliği ayrıca bekler.
