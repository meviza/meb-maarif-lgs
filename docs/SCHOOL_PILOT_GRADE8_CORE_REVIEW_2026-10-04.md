# 8. Sınıf Çekirdek Soru Taslakları — Bağımsız İnceleme

Tarih: 4 Ekim 2026. Kapsam: `packages/school-portal/grade8_core.mjs` içindeki 20 Matematik, 20 Türkçe ve 2 Fen taslağı. İncelemeci bu 42 taslağın ilk yazarı değildir. Bu kayıt bağımsız model incelemesidir; alan öğretmeni kabulü, öğrenci denemesi, MEB onayı veya güçlük kalibrasyonu değildir.

## Somut bulgular ve uygulanan düzeltmeler

| Madde | Bulgu | İşlem |
| --- | --- | --- |
| M02 | Soru anahtarı doğruydu; test 11.00 bekliyordu. EKOK(18,24)=72 dakika, üçüncü tekrar 216 dakika sonrası 11.36. | Test beklentisi bağımsız hesapla düzeltildi. |
| M06 | Soru anahtarı doğruydu; test 90 bekliyordu. Çevre 10√2, eşkenar üçgen kenarı 10√2/3, karesi 200/9. | Test beklentisi bağımsız hesapla düzeltildi. |
| M14 | 5 m yatay uzaklık, 12 m düşey yüksekliğe rağmen yatay kenar daha uzun çizilmişti. | Çizimin düşey/yatay oranı 12/5 olacak biçimde düzeltildi; geometrik regresyon eklendi. |
| M20 | Kare olarak tanımlanan şekiller SVG’de 180×124 ve 146×90 dikdörtgenlerdi. | Gerçek kareler, 20/18 kenar oranı ve dört tarafta aynı 1 m yol genişliği çizildi. |
| M16 | Benzer üçgenlerde alan oranı, programın bu sınıftaki benzerlik sınırını aşıyordu. | Alan oranı problemi kaldırıldı. Yerine benzer fakat eş olmayan dikdörtgeni tanıma sorusu yazıldı. |
| M17 | Tek başına prizma hacminden yükseklik bulma, bu sınıftaki cisim kazanımını yeterince temsil etmiyordu. | Prizma açınımında karşılıklı taban yüzünü tanıma sorusuyla değiştirildi. |
| T01 | Çözümde yanlış seçeneklerdeki iddiaların “yok” olduğu söyleniyordu; o iddialar seçeneklerde vardı, metinde savunulmuyordu. | Açıklama doğru referansa, yani parçanın savunmadığı iddialara bağlandı. |
| T04 | Bitki gelişimi için saksıların ölçüldüğü söyleniyordu. | Saksıdaki bitkilerin boylarının ölçüldüğü belirtildi. |
| T05 | “Altı çizili olmasa da” ifadesi öğrenciye gereksiz üretim notu taşıyordu. | Sade soru kökü kullanıldı. |
| T08 | “Kanıtlama”, diğer seçeneklerle aynı anlatım biçimi sınıflandırmasında değildi. | Çeldirici “Öyküleme” olarak düzeltildi. |
| T13 | Sözcüğün görevi soruluyor, tür seçenekleri veriliyordu. | Soru kökü sözcüğün türünü soracak şekilde düzeltildi. |
| F19 | “Ortamdan alınan madde” ifadesi su/gaz ayrımını açık bırakıyordu; “su buharından oluşan bulut” bilimsel olarak sorunlu ve zayıf bir çeldiriciydi. | Havadan alınan gaz soruldu; seçeneklerin tümü gaz adı yapıldı; fotosentez/solunum ayrımı açıklamaya eklendi. |
| Kaynak alanları | Program kimlikleri envanterde bulunmayan genel adlardı. | Gerçek kayıt kimlikleri kullanıldı: `legacy-2018-matematik`, `legacy-2019-turkce`, `legacy-2018-fen-bilimleri`. Taslak durumu korundu. |
| Tipografi | Virgül, sayı-birim, tırnak ve bazı erişilebilir görsel açıklamalarında birleşik yazımlar vardı. | Görünen metinler düzeltildi; virgül/sayı-birim için regresyon eklendi. |

## Müfredat sınırı için kullanılan somut kaynak

MEB 2018 Matematik Öğretim Programı, basılı sayfa 75 / PDF fiziksel sayfa 77, yerel arşiv SHA-256 `ca94096da33478c822772425b1384bacdbe40548b0813302257fec7e8c9f9c8b`.

- M.8.3.3.1: Eşlik, benzerlik, karşılıklı kenar/açı ilişkileri.
- M.8.3.3.2(c): Çokgenlerde benzerlik problemlerine girilmez.
- M.8.3.4.1: Dik prizmaların temel elemanları ve açınımları.

İlgili sayfa hem metin olarak okundu hem raster görüntüsü incelendi. M16/M17’ye somut kazanım ve fiziksel sayfa bağı eklendi. Diğer 40 maddede katalog kimliği bulunması, madde bazlı kazanım/sayfa eşlemesinin tamamlandığı anlamına gelmez.

## Bağımsız cevap kontrolü

Matematik M01–M20 sırasıyla: 6; 11.36; 512; 6×10⁻⁴; 13; 200/9; 5/12; 72°; 72; x²−8x+16; 6; 4; 40; 12; 11; II; 6 cm×4 cm; 240; 1/3; 400.

Türkçe T01–T20 sırasıyla: B, C, B, C, A, D, C, B, C, B, D, B, C, A, C, C, C, A, C, B. Fen F19: B; F20: C. Yalnız harflere bakılmadı; parçalar, koşullar ve çözüm gerekçeleri bağımsız okundu. Cevap kontrol testi ayrıca seçenek metinlerini karşılaştırır.

Sekiz görselin tamamı raster olarak aynı inceleme levhasında görüntülendi: M08, M13, M14, M16, M17, M18, M20, T17. Son levhada etiketler okunabilir, çizgiler çakışmasız, kare/merdiven/net ilişkileri tutarlıdır. Bu görsel levha kontrolü, son mobil sınav sayfasındaki yerleşim kontrolünün yerine geçmez.

## Doğrulama ve açık kalite kapıları

- İlk regresyon: kare çizimi 180≠124 ve eski benzerlik alan sorusu nedeniyle kırmızı.
- Kaynak bağı testi: envanterde olmayan program kimliği nedeniyle kırmızı.
- Son hedefli koşum: `node --test test/school_portal_grade8_core.test.mjs`, 7 test geçti, 0 başarısız.
- Bu paket çoğunlukla kısa, temel veya tek/az adımlı görevlerden oluşuyor. Kullanıcının istediği **orta / orta-zor LGS dengesi henüz kanıtlanmadı**; özellikle Türkçede açık uçlu çeldiriciler ve kısa tek ipuçlu görevler baskın. “90 soru” sayısı veya doğru ders dağılımı, LGS güçlük/çeşitlilik niteliği demek değildir.
- Türkçe dil bilgisi ve paragraf maddelerinin, matematikte kalan 18 maddenin ve iki fen maddesinin tek tek kazanım/sayfa bağları; alan öğretmeni incelemesi ve gönüllü pilot sonucu sonrası güçlük/ayırt edicilik analizi açık işlerdir.
- Gerçek öğrenci/kurum verisi kullanılmadı; içerik yayımlanmış kabul edilmedi; canlı model/API çağrısı yapılmadı.
