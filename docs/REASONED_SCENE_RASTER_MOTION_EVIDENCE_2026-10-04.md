# Gerekçeli sahne: gerçek raster ve hareket tanığı

4 Ekim 2026, 00:09 Türkiye saati. Durum: **yalnız sessiz teknik kalem-vurgusu tanığı**; soru çözüm videosu, insan el yazısı veya öğrenci teslimi değildir. Renderer SHA-256 `503f92d8751ec72a099f37c2a0563fce941e587862abd9b982e1328bf743c5cf` üzerinden yeniden üretildi; önceki frame hash makbuzları yeniden etiketlenmedi.

## Gerçek byte ve hareket kontrolü

Mevcut güvenilir Sharp ve FFmpeg kullanıldı; paket/model/SDK indirilmedi. Altı dikdörtgen ailesi, sabit bahçe ve kavram dersi için gerçek kaynak → trace → iş → sahne API'leri çalıştı. Kaynak SVG'leri byte-eşit kaldı; görünür kareler bunları bütünüyle gömmeyen güvenli türetilmiş katmandır.

- Sekiz kaynakta evidence cue'sunun 0 / 0,5 / 1 ilerlemesi: **24 gerçek PNG**. Her üçlüde PNG hash'leri farklı; çizilmiş yol uzunluğu 0 → ara değer → tamamı. Kilitli sonuç metni yok; ayrı result cue reveal false/true kontrolleri geçti.
- Tek çevre evidence cue'su 12 fps, **48 kare / 4,000 saniye**, 1280×720, H.264/yuv420p. **48 farklı gerçek RGB piksel hash'i**; yalnız SVG metaverisinin değişmesi değil. ffprobe kare/süre/codec doğrulaması ve FFmpeg tam decode exit 0.
- Ses stream'i 0; yeni konuşma/TTS, kelime–kalem hizası veya tam soru çözümü yok. 24 PNG + MP4 toplamı **1.724.907 bayt**; küçük özel makbuz bu toplama dahil değil. Raw frame'ler diskte toplu saklanmadı.
- MP4 SHA-256 `c6dfef58d76c132313d21fc6b736a7f57392075e30abdf55470feee0186570c1`; özel makbuz SHA-256 `62140c54684a19a21ef0cbed2e8251b536c13d2f1736592b4907f825ddea59d8`. Dosyalar sahip erişimli repo-dışı alandadır; medya ve kişisel yollar Git'e alınmadı.

İlk doğrulama helper'ı, output 1280×720 boyutunu intrinsic SVG input sınırı sanarak bahçenin 1280×906 tuvalinde `Input image exceeds pixel limit` ile durdu. Kaynak boyutları ölçüldü; sabit 1280×960 input cap ve width/height/pixel ön kontrolüyle yeni boş özel çıktıda tekrarlandı. `fit: contain` bütün tuvali korur; crop uygulanmaz. Bu, PDF cache/indirme bütçesi artışı veya ürün renderer'ına yapılan hata düzeltmesi değildir. Helper artifact üst sınırı 16 MiB, video sınırı 4 MiB, tek thread ve 45 s timeout; süre/decode deneyi geçti. Başarısız kısmi çıktılar tamamlandı diye sayılmadı.

## Görsel ve erişilebilirlik kabul sınırı

Ana ajan son byte'ların çevre, bahçe ve kavram dersi orta karelerini görsel olarak inceledi. Bu üç karede tuval/metin kesilmesi gözlenmedi; bütün 24 kare için insan UX kabulü verilmedi. Bahçede geniş boşluk ve küçük metin, kavram dersinde yoğun açıklama paragrafı açık tasarım borcudur. Altyazı bölme, yakın plan/odak, mobil okunurluk, yaşa göre tempo ve öğretmen dinleme kabulü sonraki fazda gerekir. Bu görünüm premium UI/video kalite kabulü değildir.

Bağımsız denetimdeki sabit ID/IDREF çakışması TDD ile kaldırıldı: her intrinsic SVG kendi safe-caption `aria-label` ve ID'siz yerel title/desc taşır. 25 renderer testi ve 91 bağlantılı test geçti; farklı/kopya frame'lerin inline markup kontrolü vardır. Gerçek browser AX ağacı, screen reader ve haricî img host-alt kabulü yok. Reveal seçeneği editör kontrolüdür, auth veya öğrenci sequencing kapısı değildir. Orijinal editör varlıkları yanıt içerebilir; öğrenci payload'ı değildir.

## Normal fabrika bağı ve açık işler

Normal CLI scenePreparation bağlantısı önce **0/2 RED** (eksik scenePreparation), sonra GREEN oldu. Taze 100-aday paketinde **12 taslak / 88 ret / 12 soru planı + 1 ders planı**; bir-aday sınırında 1 + 1 plan. Kaynak/trace/job/geometri hashleri ve orijinal SVG'ler eşleşir. Serileştirilmiş plan, canlı render yetkisi sağlamaz; worker güvenilir kaynaklardan yeniden kurmalıdır. Planlar MP4 üretildi demek değildir; mevcut job'ların unresolved/not_generated/not_rendered durumları değiştirilmedi.

Yeni modülle ana ajan tam suite'i gerçek medya opt-in'i ve güvenilir Sharp ile çalıştırdı: **740/740, fail 0, skip 0**. Bu 4 s medya tanığı ayrıca koşuldu ve test toplamına eklenmez. Canlı Clef/üretici/TTS çağrısı 0, gerçek çocuk verisi 0, ücretli cloud işi 0. Altı aile + sabit örneklerden diğer şekil/ders/yaşların kapsandığı sonucu çıkarılmaz. Semantik/pedagojik, müfredat, hak, erişilebilirlik, yayın ve production kapıları kapalıdır.

[Saf renderer sözleşmesi ve bağımsız denetim sınırı](REASONED_SCENE_RENDERER_EVIDENCE_2026-10-03.md) · [Gece ilerleme kaydı](OVERNIGHT_PROGRESS_2026-10-03.md).
