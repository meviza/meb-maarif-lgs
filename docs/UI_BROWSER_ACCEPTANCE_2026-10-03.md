# Tarayıcı kabul kaydı — 3 Ekim 2026

Bu kayıt gerçek yerel tarayıcı etkileşimleriyle yapılmıştır. Fiziksel telefon/tablet, Flutter, tam WCAG değerlendirmesi veya üretim erişim kabulü değildir. Ham ekranlar yerel sohbet çıktısında saklanır; Cloudflare hesap/token ekranları Git'e aktarılmaz.

## Önceki prototip

Port 3333 ekranı görüntülendi. Menünün yoğunluğu ve içerik API'si kapalıyken boş/yanıltıcı kartlar yeni öğrenci tasarımına taşınmadı. Eski HTTP cevap anahtarı/üretim/puanlama kapıları yeni UI uğruna açılmadı.

## Editör atölyesi — 3334

- Gerçek rapor: 100 aday, 12 taslak, 88 ret, 0 yayın; kaynak defteri 42 kayıt/34 indirme.
- Soru ailesi filtresi, taslak seçimi, SVG, çözümün ikinci adımı ve başa dönme işlemi gözlendi. Alandan kenar sorusu `8 ÷ 2 = 4` ile aynı çizim/veri izini kullanıyor.
- CSS viewport genişlikleri 390, 769/1280 civarı ölçülerek yatay taşma olmadığı denetlendi. Tarayıcının 0,67 yakınlaştırma etkisi nedeniyle talep edilen ve gerçekten ölçülen boyutlar ayrıldı. Geçici override'lar kaldırıldı.
- Bu yüzey yanıt anahtarlı yerel editör incelemesidir; okul admin auth/rol/persist servisi değildir.

## Öğrenci çalışma alanı — 3335

- İlk yükleme sentetik 6. sınıf / 2026–2027; altı ana ders. Başka sınıf seçici veya banka/reklam sayacı yok.
- Ders çekmecesi açıldı; Escape kapatıp `aria-expanded=false` durumuna döndü. Matematik ders alanı ve boş, onaysız içerik durumu görüldü. Ders kısayolu kaydedildi.
- Deftere düz metin yazıldı, not listesine eklendi. `<b>Deneme</b>` içeren sentetik not HTML gibi yürütülmeden aynen gösterildi.
- Gerçek fare sürüklemesi canvas üzerinde çizgi oluşturdu; “Son çizgiyi geri al” etkinleşti, geri alma sonrasında devre dışı kaldı.
- Temizleme ve temizlemeyi geri alma doğrulandı; metin geri geldi, kayıtlı notların değişmediği gözlendi.
- Kaydettiklerim ekranında ders kısayolu/not, Takıldıklarım ekranında özgün merak sorusu görüldü. “Paylaşmaya hazır işaretli” yalnız yerel durum; ağ gönderimi yok.
- Ölçülen mobil CSS viewport 390×844 ve tablet 769×1024, yatay taşma yok. Native mobil ekran yakalayıcı emülasyon sırasında ölçekli/boş kenarlı çıktı verdi; ayrıca denenen yüksek DPR screenshot başarısızdı. Bu nedenle mobil görsel mükemmellik iddiası yok; final görsel kanıt masaüstü ekranıdır. Geçici ekran ayarları kaldırıldı.
- Diğer yaş bantları ve gerçek kalıcı defter/öğretmene paylaşım tamamlanmış kabul edilmez. Tasarım rehberi bunları sonraki dikey dilime bağlar.

## Bağımsız hata incelemesi

Tablet/kalem akışında ilgisiz ikinci pointer'ın iptali birinci pointer çizgisini kaybettiriyordu. Gerçek frontend kaynağıyla handler-düzeyi deterministik regresyon testi yazıldı; fiziki cihaz kanıtı değildir. Giderim ve taze tüm-test sonucu ana teslim kanıtında kaydedilir.

## Artefaktlar

Yerel ekran dosyaları: `01-original-prototype.jpg`, `07-studio-desktop-css1281.png`, `student-home-desktop.jpg`, `student-notebook-drawn.jpg`. Bu görüntüler yerel önizlemedir; yayımlanmış site veya kabul edilmiş eğitim içeriği değildir.
