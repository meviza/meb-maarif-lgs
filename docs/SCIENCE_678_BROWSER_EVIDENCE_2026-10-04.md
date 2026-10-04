# Fen Atölyesi: Gerçek Tarayıcı Kanıtı

## Kapsam Ve Revizyon

4 Ekim 2026 tarihli bu kontrol, yalnız 54 taslağın yetişkin editör önizlemesidir. 450 hedefinden kalan 396 soru, uzman kabulü, öğrenci teslimi ve canlı model çalışması tamamlanmış değildir.

- Banka içerik kimliği: `19f2dd31b595370d98429e2581e1788405899f1092497dafc5586cc8c71831f9`.
- Sunulan HTML: 330.864 bayt; SHA-256 `13ebea1418ac95e8e3397f64db6063d709aba1556e6bcfca9bdf552aa42aba9f`.
- Gerçek `--preview` aracı, OS tarafından seçilen portta yalnız IPv6 loopback üzerinde sabit bir HTML snapshot sundu. Görünüm, istek sırasında yeniden soru üretmez.
- Native in-app tarayıcı kullanıldı. DOM geometrisi gözlemi salt okunurdu; gezinme, filtre ve yanıt eylemleri gerçek UI kontrollerinden yapıldı. Yeni dış medya, hesap, SDK veya gerçek öğrenci verisi kullanılmadı.

## Davranış Tanıkları

1. Sınıf filtreleri 6, 7 ve 8 için ayrı 18 soru gösterdi. Gerçek Sonraki kontrolüyle 54 farklı soru aktif görünümde tek tek incelendi. Her aktif SVG'nin metin dikdörtgenleri çizim sınırları içindeydi; metin taşması bulunmadı. Bu geometrik tanık bilimsel görsel anlamının uzman kabulü değildir.
2. Her sınıfın son sorusunda Sonraki kapalıydı. Fizik filtresi altı soru ve ilk konumda kapalı Önceki gösterdi. Yanıt kontrolü seçimden önce kapalıydı.
3. 8. sınıf sıvı basıncı sorusunda yanlış A ve doğru C seçimi farklı geri bildirim verdi; gerekçeli çözüm açıldı. Kontrol düğmesinde Enter klavye eylemi çalıştı. Yanıtlar sunucuya gönderilmedi, kalıcı öğrenci kaydı oluşturulmadı.
4. Çok zor filtresi, henüz böyle bir taslak bulunmadığı için açık bir boş-kapsam mesajı gösterdi. Soru sayısı veya zorluk uydurulmadı.
5. 390 pikselde ilk ölçümde sayfa genişliği 402 piksel çıktı. Kök neden, dar özet kartındaki uzun Türkçe kelimeydi. Yeni regresyon testi önce 0 geçiş / 1 başarısızlık verdi. Minimal `overflow-wrap:anywhere` düzeltmesi sonrası test 1/1 geçti.
6. Yeni sabit snapshot ile 390 pikselde body/document genişliği 390, 320 pikselde 320 olarak yeniden ölçüldü. 1440 piksel masaüstü ölçümü de sayfa genişliğine eşitti. Dar ekranda görselin 520 piksel okunabilir genişliği, tüm sayfayı değil kendi odaklanabilir bölgesini kaydırır.
7. 390 pikselde yoğunluk görselinin kaydırma bölgesi 300 piksel, içerik 520 piksel; açıklama yazısı 17 piksel ve en kısa seçenek yüksekliği yaklaşık 57,2 pikseldi. Gerçek ArrowRight eylemiyle bölge odaklandı; sonraki gözlemde yatay konumu 0'dan 40 piksele ilerledi. Sayfa genişliği artmadı.
8. Bu tarayıcı sekmesinin hata/uyarı kaydında ilgili koşu sırasında kayıt bulunmadı. Bu, tüm ürünün genel hatasızlık veya erişilebilirlik sertifikası değildir. Geçici ekran boyutu override'ı kaldırıldı.

## Açık Kabul Kapıları

Gerçek telefon/tablet, screenreader, düşük ağ, kullanıcıyla çocuk/öğretmen kullanılabilirliği, kontrastın tam WCAG ölçümü ve tüm bilimsel çizimlerin alan incelemesi bu koşuda yapılmadı. 54 SVG'nin bir kısmı fiziksel çizim, bir kısmı verilenlerin tablo/koşul kartıdır; tümü premium illüstrasyon diye sayılmaz. Cevap içeren bu editör HTML'si öğrenci sınav güvenliği veya kimlik/tenant yetkilendirmesi sağlamaz.

Ekran görüntüleri yalnız özel, Git dışı çıktı alanında kaldı. Kamu raporuna hesap e-postası, token, özel hesap yolu veya ham kaynak sayfası alınmadı.
