# DAMA-DMBOK Veri Yönetişimi ve Ürün Veri Mimarisi

**Durum:** Mimari karar kaydı — uygulanacak sözleşmelerin kaynağı

**Kapsam:** 1–8. sınıfla başlayacak birleşik eğitim platformu; öğrenci mobil uygulaması, veli görünümü, öğretmen/içerik editörü/idari web portalı ve gelecekteki veri/AI hizmetleri.

Bu belge, DAMA-DMBOK'u bir veritabanı ürünü veya otomatik uygunluk sertifikası olarak değil; veri varlıklarının sahiplik, karar, kalite, güvenlik, soy-ağacı ve yaşam döngüsünü yöneten çalışma sistemi olarak uyarlar. DAMA'nın 2024 revizyonu, çerçevenin temel bilgi alanlarını değiştirmeden veri sahibi rolünü iş kararlarından hesap verebilir kişi olarak netleştirir ve AI yönetişimi/etiğini veri yönetişimiyle ilişkilendirir. [DAMA revizyon notu](https://dama.org/dama-dmbok-revision/)

## 1. Değişmez ilkeler

1. **Veri kurumsal varlıktır.** Öğrenci, içerik, müfredat, hak, ölçme ve analitik verisi bir uygulama tablosundan ibaret değildir.
2. **Sahiplik ve amaç kaydı zorunludur.** Her kritik veri ürünü için `owner`, `steward`, `classification`, `processing_purpose`, `retention_class`, `schema_version` ve `source_lineage` tutulur.
3. **AI yayın otoritesi değildir.** JEV/Clef/LLM sinyal üretir; veri sahibi ve insan inceleme kurulu yayın, geri çekme veya öğrenci verisi kullanımı kararını verir.
4. **Kaynak ve haklar önce gelir.** Program, soru, görsel, ses veya türev varlıkta kaynak, lisans/kullanım kapsamı, sürüm, erişilebilirlik ve insan inceleme kaydı olmadan yayın durumu verilemez.
5. **Çocuk verisi varsayılan olarak asgari ve ayrıştırılmıştır.** Doğrudan kimlik bilgileri ile öğrenme olayları ayrı alanlarda; öğrenme/analitik akışları takma kimlikli anahtarla yürütülür.
6. **DAMA uyumu sertifikasyon iddiası değildir.** Uyum, ölçülebilir süreç, sözleşme, kanıt ve periyodik gözden geçirmeyle aşamalı kurulur.

## 2. Yönetişim işlevi ve roller

| Rol | Hesap verebilirlik |
|---|---|
| Veri Yönetişimi Kurulu | Politika, yüksek riskli kullanım, veri paylaşımı, yayın/geri çekme ve istisna kararları |
| Domain Data Owner | Kendi iş alanındaki veri kararları: öğrenci, müfredat, içerik, ölçme, kurum, haklar veya analitik |
| Data Steward | Sözlük, kalite kuralı, veri sorunu, metaveri ve güncel kayıtların günlük işletimi |
| Data Custodian | Şifreleme, yedek, erişim altyapısı, operasyon ve geri-yükleme kanıtı |
| İçerik Onay Kurulu | Akademik, ölçme-değerlendirme, dil/erişilebilirlik ve hak incelemesinin ayrık kanıtı |

Her karar; karar sahibi, gerekçe, kanıt bağlantıları, etki alanı, geçerlilik tarihi ve gözden geçirme tarihiyle kayıt altına alınır. DAMA'nın açıkladığı politika–insan–süreç–teknoloji dengesi, bu rol modelinin temelidir. [DAMA P3T yaklaşımı](https://dama.org/2026/01/04/establishing-the-office-of-the-chief-data-officer-cdo/)

## 3. Kanonik veri alanları

| Alan | Temel kayıtlar | Kritik kalite/erişim sınırı |
|---|---|---|
| `identity_access` | `person_identity`, `learner`, `guardian_relationship`, `educator_assignment`, `school`, `class_group`, `role_grant` | Doğrudan kimlik ayrı kasada; tenant, rol ve amaç temelli erişim |
| `curriculum_registry` | `program_version`, `source_document`, `curriculum_node`, `learning_outcome`, `academic_term` | Kaynak URL/hash, alınma tarihi, yürürlük ve inceleme durumu |
| `content_registry` | `content_item`, `content_revision`, `assessment_item`, `rubric`, `review_decision`, `release` | Öğrenme çıktısı, yaş/sınıf, kalite kapısı ve geri çekme zinciri |
| `asset_rights_registry` | `asset`, `asset_derivative`, `rights_record`, `accessibility_record` | Hash, hak sahibi/lisans, kullanım kapsamı, alt metin, uzun açıklama, üretim yöntemi |
| `learning_assessment` | `learning_event`, `attempt`, `response`, `scoring_result`, `mastery_evidence` | Takma kimlik, soru/rubrik/program/motor sürümüne bağlanmış değişmez olay kaydı |
| `governance_catalog` | `data_asset`, `data_contract`, `business_term`, `quality_rule`, `lineage_edge`, `retention_policy`, `audit_event`, `data_issue` | Tüm alanlar için sözlük, soy-ağacı, kalite ve saklama kanıtı |

Mevcut prototipteki ham JSON bankaları ve serbest denetim JSON'ları bu kayıtlara taşınana kadar yalnız `unverified_import` statüsünde kalır. `is_approved` veya `is_published` gibi tek başına bayraklar yayın kanıtı değildir.

## 4. Zorunlu içerik ve varlık yaşam döngüsü

```text
unverified_import → sourced → rights_verified → academic_review
→ assessment_review → accessibility_review → release_approved
→ published → revised | withdrawn | archived
```

- Her geçiş, değiştirilemez inceleme kaydı ve sorumlu rol gerektirir.
- Aktif program kanıtı, kullanım hakkı, cevap/rubrik kanıtı, kritik görsel erişilebilirliği ve insan onayı yüzde 100 zorunlu yayın koşuludur.
- Soru/çözüm/görsel üretimi için kullanılan model, istem, araç ve kaynak özetleri sürümlenir; kişisel öğrenci verisi varsayılan olarak bu sürece girmez.
- DAMA-DMBOK kavramları referans gösterilerek kullanılabilir; metin/şema kopyalamadan önce ilgili lisans kontrol edilir. [DAMA lisans notu](https://dama.org/dmbok2r-infographics/)

## 5. Veri kalitesi ölçümü

| Boyut | Örnek ölçüm | Yayın/işletim eşiği |
|---|---|---|
| Doğruluk | Uzman kanıtıyla eşleşen cevap/rubrik oranı | Kritik içerikte %100 kanıt |
| Eksiksizlik | Kaynak, hak, program, erişilebilirlik ve sürüm alanı doluluk oranı | Yayınlananda %100 |
| Tutarlılık | Ders–sınıf–kazanım–içerik ilişkisi geçerliliği | Bozuk referans sıfır |
| Geçerlilik | Şema/alan kurallarını geçen kayıt oranı | Sözleşme ihlali sıfır |
| Bütünlük | Yetim ilişki, yinelenen kimlik veya tenant karışması | Kritik olay sıfır |
| Güncellik | Program/hak/içerik geçerlilik süresinde kayıt oranı | Süresi dolan yayın otomatik inceleme |
| İzlenebilirlik | Yayından programa, kaynağa, hakka ve karara tam soy-ağacı | Yayınlananda %100 |

DAMA'nın 2024 revizyonu veri kalitesi boyutları içinde güncelliği (currency) ayrıca tanımlar. [DAMA revizyon notu](https://dama.org/dama-dmbok-revision/)

## 6. Ürün mimarisi kararı

```text
Flutter öğrenci uygulaması ─┐
                              ├─ Sürümlü API sözleşmeleri ─ Modüler öğrenme hizmeti ─ PostgreSQL
React/Next okul web portalı ─┘                              │                  └─ nesne deposu
                                                             └─ denetim/olay hattı ─ ayrıştırılmış analitik
```

- **Öğrenci uygulaması:** Flutter ile Android+iOS; telefon/tablet/foldable, çevrimdışı içerik paketi ve erişilebilir öğrenme deneyimi.
- **Okul web portalı:** React/Next ile öğretmen, içerik editörü ve idari işlevler; ayrı rol ve iş akışları.
- **Backend:** Önce sürümlü sözleşmelere sahip modüler monolit; kimlik/erişim, içerik dağıtımı, değerlendirme, senkronizasyon ve denetim alanları birbirinden ayrılır. Flutter hiçbir zaman doğrudan LLM, Drive veya yönetim veritabanı anahtarı taşımaz.
- **İşlemsel veri:** PostgreSQL, kanonik ilişki/veri bütünlüğü için önerilen başlangıç noktasıdır. Canlı sağlayıcı seçimi, veri konumu, KVKK değerlendirmesi ve yetkilendirme tamamlanana kadar gerçek bulut verisi oluşturulmaz.
- **Medya ve arşiv:** Sürümlü/hash'li nesne deposu ana hedef; Drive yalnızca onaylı OAuth kapsamı, saklama/silme, erişim, şifreleme ve geri-yükleme kanıtı sonrasında arşiv hedefi olabilir. Drive birincil öğrenci veritabanı değildir.
- **Analitik:** Pseudonymized olaylardan üretilir; doğrudan PII, küçük grup yeniden tanımlama riski veya serbest öğrenci metni varsayılan olarak analitik/AI akışına girmez.

## 7. Mobil sözleşme ve güvenlik kapıları

Mobil istemci ham cevap anahtarını gizli saymaz. İndirilen her ders paketi `content_package_manifest` ile sürüm, hash, kaynak/hak, yaş düzeyi, erişilebilirlik ve geçerlilik bilgisi taşır. Öğrenme olayları sıra kimliğiyle çevrimdışı kuyrukta tutulur ve sunucuya tekrar güvenli (idempotent) biçimde eşitlenir.

Birinci mobil dikey dilim için kanıtlar:

1. 1. sınıf için onaylı fixture üzerinden bir görsel ders, alternatif metin/uzun açıklama, lisans kaydı ve insan onaylı ses/transkript.
2. Android telefon, Android tablet, iPhone ve iPad üzerinde çalıştırılmış erişilebilirlik/çevrimdışı/senkronizasyon senaryoları.
3. Güvenli veli kapısı ve amaç-temelli veri özeti; öğretmen/idari işlemler yalnız web portalında.
4. Uygulamada reklam, izleyici SDK, doğrudan AI sağlayıcı anahtarı, kamera/mikrofon/konum varsayılanı yok.

## 8. Uygulama fazları

1. **Veri şartı:** sözlük, sınıflandırma, owner/steward, karar kaydı, saklama sınıfı ve mevcut veri envanteri.
2. **Tek dikey dilim:** program → içerik → varlık/hak → öğrenci etkinliği → öğretmen geri bildirimi zincirini gerçek öğrenci verisi olmadan sözleşme testleriyle kurma.
3. **Kurum ve yetki:** okul/şube/rol/veli ilişkisi, tenant izolasyonu, amaç-temelli erişim ve denetim günlüğü.
4. **Ölçme ve analitik:** sürümlü puanlama, açıklanabilir ölçme kaydı, ayrıştırılmış veri ürünü ve metrik kataloğu.
5. **Pilot/operasyon:** saklama-imha, erişim gözden geçirmesi, geri-yükleme, veri kalite panosu ve küçük insan denetimli okul pilotu.
6. **1–8 ölçekleme:** yalnız doğrulanmış sözleşmeler, veri kalite kapıları ve onaylı içerik fabrikasıyla genişleme.

## 9. Kabul kapıları

- Şema/doğrulama testleri: sözleşme sürümü, zorunlu metaveri, yabancı anahtar, tenant ve durum geçişi ihlallerini reddeder.
- API testleri: rol/amaç dışı erişim, cevap anahtarı sızıntısı, silme ve audit kayıt boşluğu için negatif senaryolar içerir.
- Mobil testleri: Flutter unit/widget/integration; gerçek cihazda çevrimdışı devam, tekrar güvenli senkronizasyon, alternatif metin, büyük ekran ve veli kapısı.
- Operasyon testleri: yedek geri-yükleme, saklama/imha, erişim gözden geçirmesi, veri kalite skor kartı ve geri çekme tatbikatı.

Bu kapılar çalışmadan DAMA, CMMI veya SPICE uyumu; MEB onayı; ya da üretime hazır çocuk eğitim platformu iddia edilmez.

## 10. Uygulanmış sözleşme çekirdeği

İlk teknik dikey dilim, istemci veya veritabanına veri yazmadan önce paylaşılabilir veri sınırlarını uygulamaya alır:

- [`packages/contracts/content_package_manifest.mjs`](../packages/contracts/content_package_manifest.mjs), öğrenciye dağıtılacak içerik paketinde sürüm, owner/steward, amaç/saklama sınıfı, kaynak soy-ağacı, kanonik müfredat durumu, insan incelemeleri ve varlık hak/erişilebilirlik metadatasını denetler. Cevap anahtarı, doğru şık, ayrıntılı çözüm ve ham HTML öğrenci paketinde reddedilir.
- [`packages/contracts/learning_event.mjs`](../packages/contracts/learning_event.mjs), Flutter'ın ilerideki çevrimdışı eşitlemesinde yalnız takma kimlikli, sürümlü içerik bağlamına bağlı olayları kabul eder. E-posta, telefon, ulusal kimlik, veli e-postası ve serbest yanıt metni reddedilir.
- [`packages/reference-data/grade_catalog.mjs`](../packages/reference-data/grade_catalog.mjs) ve `/api/grades`, 1–8'i ana referans veri olarak döndürür. `not_seeded`, `prototype_unverified` ve `not_verified` durumları içerik, kanonik müfredat veya yayın kanıtı varmış gibi sunulmasını engeller.
- [`packages/contracts/access_policy.mjs`](../packages/contracts/access_policy.mjs), gelecek kimlik/izin katmanı için varsayılanı reddet olan karar çekirdeğidir. Tenant sınırı, öğrenci öz-erişimi, veli bağı, öğretmen sınıf ataması, okul yönetiminin yalnız toplu veriye erişimi ve içerik editörü/yayıncı görev ayrımı testlidir. Bu modül tek başına oturum doğrulaması veya üretim RBAC değildir.
- Bu doğrulayıcılar saf ve durum tutmayan fonksiyonlardır: veri yazmaz, ağ çağrısı yapmaz, kimlik çözmez veya bir paketi kendiliğinden yayımlamaz. İnsan onayı ve gerçek yetkilendirme yerlerine geçmezler.

Bu çekirdek, sonraki `learning_api`, Flutter ve React/Next istemcilerinin aynı sözleşmeyi uygulaması için başlangıç noktasıdır. Sözleşme sürüm değişiklikleri geriye dönük uyumluluk ve veri migrasyonu kanıtı olmadan yayınlanmaz.
