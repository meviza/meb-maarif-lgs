# Türkçe isimli öğrenme rehberleri — taslak ürün kararı

Tarih: 2026-10-03. Durum: kullanıcı birden çok tanınabilir ses ve Türkçe isim istedi; hazır ses/isim/ders atamaları **seçilmedi, uygulanmadı, yayımlanmadı**. Sesin beğenilmesi hak ve öğretmen kabulünü tek başına sağlamaz.

## Karar ve ayrı boyutlar

B keşif/merak, C adımlı çözüm/strateji üslup adayları korunur. Hazır sesin kimliği, anlatım üslubu, ders, yaşa uygun hitap ve öğrenci tercihi ayrı boyutlardır. Bir derse tanınabilir varsayılan rehber önerilebilir; öğrenci/öğretmen değiştirebilir. Sesin cinsiyetiyle ders yeteneği veya öğrenme başarısı eşlenmez. Aynı ders/çözüm içinde ses nedensiz değişmez; değiştirilen tercih mümkünse sonraki bölüm sınırında uygulanır.

İlk isim önerileri: Iapetus → Deniz, Algieba → Arda, önceki Charon → Barış. Bunlar dinlemeyi kolaylaştıran **aday etiketler**, seçilmiş isimler veya belirli ders atamaları değildir. Uzun ders, geometri, fen terimleri, Türkçe vurgu ve İngilizce telaffuz bakımından ayrı örnekler değerlendirilmeden beş/altı ders için otomatik dağıtım yapılmaz. 1–2. sınıf hitabı bu 7–8. sınıf yönergeli matematik önizlemiyle onaylanmaz.

Kullanıcı önceki isim önerilerini genel olarak beğendi; tekil isim/ses/ders seçimi yapılmadı. İki kadın hazır ses için önizlem etiketleri Sulafat → Selin, Erinome → Ece olarak verildi; ürün isimlerinin kesinleşmesi ve ses seçimi ayrıdır. İlk A/B/C örneklerinden kadın olarak algılanan sesin gerçek hazır ses kimliği doğrulanmadığından, o sesin ismi veya yeni kadın adaylarıyla aynı kimlikte olduğu uydurulmaz.

## Dinleme geri bildirimi ve kalite hedefi

Kullanıcı önceki örneklerin tonlama, vurgu ve doğal duraklamalarını insan benzeri bulduğunu; tok erkek hitabı ile açık telaffuz ve sıcak öğretici söyleyişi tercih ettiğini belirtti. Bu **genel, öznel dinleme geri bildirimi**; belirli aday ID'sinin seçimi, rubrik puanı, öğretmen onayı veya yeni kadın örneklerinin kabulü değildir. “TRT/spiker” ifadesi düzgün artikülasyon beklentisi olarak yorumlandı; belirli bir kişiyi klonlama veya kurum bağlantısı iddiası değildir. Sıcak, açık, anlaşılır hitap tüm adaylarda değerlendirilecektir; pedagojik yetenek cinsiyetten çıkarılmaz.

Sesin öğrenci dikkatini, hatırlamayı ve çözüm isteğini artıracağı düşüncesi ürün/pedagoji **hipotezidir**, ölçülmüş öğrenme etkisi değildir. Sonraki pilotta yaşa uygun örneklerle anlama, sayı/birim doğruluğu, dinleme konforu ve öğrenme sonuçları ayrı değerlendirilir; performans iddiası yalnız uygun ölçüm ve uzman incelemesiyle yapılır.

## Çocuklara sunum

İsimler kurmaca dijital öğrenme rehberlerini tanımlar. Gerçek, lisanslı bir insan öğretmen veya tanınmış kişinin sesi olduğu iddia edilmez; klonlama yapılmaz. Yaşa uygun kısa tanıtım: “Deniz, uygulamada yapay sesle konuşan öğrenme rehberin.” Kalite hedefi doğal ve anlaşılır hitabettir; yapay ses kullanımını yanıltıcı biçimde gizlemek değildir. Kullanıcı okul öğretmenine erişim ile dijital rehberi ayırt edebilmelidir.

## DAMA sözleşmesi — sonraki uygulama için

- Sabit `personaId` ile değişebilir görünen Türkçe isim ayrılır. Kabulden sonra sağlayıcı, model, hazır ses kimliği, bilinen sürüm, yönerge/metin hashleri ve üretim kanıtına bağlanır; bilinmeyen sağlayıcı sürümü uydurulmaz.
- Her persona için owner/steward, amaç, hak kapsamı, yaş/dil/ders değerlendirmesi, inceleme/yayın durumu ve saklama kararı gerekir. İsim onayı ses veya pedagojik kabul değildir.
- Sağlayıcı/ses/yönerge değişikliği yeni sürüm ve regresyon dinleme seti doğurur. Eski persona ismi altında sessizce farklı bir ses yayımlanmaz; gerekirse yeniden dinleme/seçim sunulur.
- Gerçek öğrenci tercihleri ancak onaylı tenant kimlik/yetki ve veri-saklama tasarımında tutulur. Kayda yalnız gerekli persona/sürüm, ders kapsamı, tercih zamanı ve yetkili aktör bilgisi alınır; bu pilotta öğrenci tercihi/verisi toplanmadı.
- Kabul: kesin sayı/birim ve metin kontrolü, doğal Türkçe, hitabet, anlaşılabilirlik, ses sürekliliği, yaş uygunluğu, erişilebilirlik ve hak incelemesi. Dinleme geri bildirimi ön seçimdir; uzman kabulü ve yayın yetkisi ayrı kaydedilir.

Mevcut teknik örnekler ve gerçek süre/hash kanıtları: [ses pilotları](TEACHER_VOICE_PILOT_EVIDENCE_2026-10-03.md). Persona seçici/UI veya kalıcı tercih backend'i bu belgede tamamlanmış sayılmaz.
