# Başlangıç Denetimi — 3 Ekim 2026

## Kapsam ve durum

Bu kayıt, `codex/k12-foundation-audit` dalındaki yerel worktree için geçerlidir. Hiçbir uzak depoya push, içerik/öğrenci verisi yükleme, Drive bağlantısı, model kurulumu, ücretli kullanım, mağaza yayını veya MEB onay başvurusu yapılmamıştır.

İncelenen uygulama K–12 ya da 1–8 tamamlanmış ürün değildir. Çalışan veri seti yalnızca 5–8. sınıflar için dört ders içerir: toplam **40 test / 276 soru**. 1–4, İngilizce, DKAB, gerçek rol tabanlı erişim, gerçek PostgreSQL ve mobil/iOS teslimi bu prototipte kanıtlanmış değildir.

## Başlangıçta doğrulanan kritik açıklar

| Alan | Bulgular | Sonuç |
| --- | --- | --- |
| Öğrenme bütünlüğü | Değerlendirici yalnız kod biçimini kontrol ediyor; geçersiz ama biçimsel kazanım ile çelişen cevap anahtarı geçebiliyordu. Fallback denetimden kalsa da başarı dönebiliyordu. | Yayın / içerik üretimi durduruldu. |
| Cevap anahtarı | Ham bankalar, test API’si ve istemci içi yedek aracılığıyla doğru cevap/çözüm/çeldirici görünür durumdaydı. | İstemci ve sunucu yüzeyi değiştirildi. |
| API / mahremiyet | Geniş CORS, oturum/puanlama, model çağrısı, bulut arşivi ve video çözüm yolları kimlik/yetki olmadan açıktı. | Bunlar salt-okunur prototip yüzeyinden kaldırıldı. |
| Uygulama beyanları | Arayüz resmî kurum/uyum, model onayı, kalıcı kayıt ve kalite yüzdeleri izlenimi veriyordu. | Görünen üst yüzey yayın öncesi prototip olarak yeniden etiketlendi. |
| Görsel / erişilebilirlik | 5–7 görsel bayrakları ile içerik uyuşmuyordu; ham görsel HTML doğrudan DOM’a yazılabiliyordu; klavye, modal, kontrast ve alternatif metin açıkları vardı. | Ham görsel HTML gösterimi engellendi; tam erişilebilirlik çözümü hâlâ açık iş kalemidir. |

## Bu dalda uygulanan ilk düzeltmeler

1. Video çözüm motoru artık `correctOption` alanını kullanır; cevap anahtarı yoksa hata verir.
2. Otomatik içerik ekranı yerel prototip kazanım kaydına tam eşleşme arar; biçimsel fakat kayıtsız kodu ve çelişen cevap kanıtını reddeder.
3. `publicationEligible` her otomatik değerlendirmede `false` kalır. Durum yalnızca `automated_pass` veya `draft` olabilir.
4. Başarısız terminal fallback artık `success: false` döner.
5. Sunucu yalnızca cevap anahtarsız öğrenci DTO’su ve metadata sunar. Ham JSON bankaları, puanlama, AI üretimi, bulut eşitleme, video çözüm ve yönetim uçları `404` döner; wildcard CORS kaldırılmıştır.
6. İstemcide ham banka dosyası ve gömülü cevap anahtarlı yedek kaldırılmıştır. Taslak modda puanlama, çözüm, video, yönetici, yazdırma ve dış model işlemleri devre dışıdır.
7. Varsayılan `npm test` ağsız birim/güvenlik testleridir. Önceki yerel model yoklamalı prototip entegrasyon koşumu `npm run test:prototype-integration` adıyla ayrılmıştır ve varsayılan doğrulama değildir.

## Doğrulama kanıtı

3 Ekim 2026’da bu dalda aşağıdakiler çalıştırıldı:

```text
npm test
```

Sonuç: **17 test geçti, 0 başarısız**. Kapsanan olumsuz senaryolar; kayıtsız kazanım kodu, çelişen cevap kanıtı, başarısız fallback’in başarı sayılması, cevap anahtarı sızıntısı, CORS preflight, kapalı API rotaları, gömülü cevap anahtarı, ham görsel HTML ve devre dışı prototip kontrolleridir.

Yerel tarayıcı kontrolünde ekranın “K-12 Eğitim Platformu / Yayın öncesi doğrulama / YAYINA KAPALI” durumunu gösterdiği; sınav, öğretmen paneli, yazdırma ve puanlama düğmelerinin devre dışı olduğu doğrulandı.

## Kalan yayın engelleri

- Resmî programı sürümlü ve insan doğrulamalı `curriculum_registry` ile kurmak; yerel prototip kaydını resmî kaynak yerine geçirmemek.
- Her madde için cevap-anahtarı kanıtı, uzman incelemesi, hak kaydı, görsel varlık manifesti, erişilebilirlik ve pilot analizi eklemek.
- Kimlik doğrulama, roller, oturum güvenliği, gerçek veritabanı, denetim izi, saklama/silme ve KVKK tasarımını uygulamak.
- 1–4 için görsel/işitsel ilk-okuryazarlık deneyimi; 5–8 için güncel program ve LGS sürümü; iOS/Android gerçek cihaz kanıtı üretmek.
- WCAG 2.2 AA hedefi için klavye, odak, dialog, alternatif metin, tablolarda `scope`, görsel kontrast, hareket azaltma ve küçük ekran testlerini tamamlamak.
- Drive, JEV, Clef-Flash veya başka bir sağlayıcı/model bağlamadan önce yetki, hak, veri akışı, depolama ve harici-skill güvenlik kapılarını tamamlamak.

Bu nedenle durum: **planlama ve güvenlik temeli tamamlandı; içerik veya platform yayını onaylanmadı.**
