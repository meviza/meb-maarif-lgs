# GitHub ve Google Drive (5 TB) Senkronizasyon Kılavuzu

> **Hedef:** Kullanıcı hesabı: `kerem.newton571@gmail.com`  
> **Amaç:** Yerel Mac diskinde yer tasarrufu sağlamak, tüm projeyi GitHub'da versiyonlamak ve soru paketleri ile MEB müfredat verilerini doğrudan 5 TB bulut alanında depolamak.

---

## 1. GitHub Uzak Depo (Remote Repository) Entegrasyonu

Projeyi GitHub hesabınıza bağlamak için terminalden aşağıdaki adımları uygulayın:

```bash
# 1. GitHub üzerinde yeni boş bir repo oluşturun (örn: meb-maarif-lgs)
# 2. Yerel projeyi GitHub deposuna bağlayın:
git remote add origin https://github.com/KULLANICI_ADINIZ/meb-maarif-lgs.git

# 3. Ana dalı ayarlayıp kodları yükleyin:
git branch -M master
git push -u origin master
```

Bundan sonraki her geliştirme adımında tek komutla buluta gönderebilirsiniz:
```bash
git push
```

---

## 2. Google Drive 5 TB Bulut Yedekleme (Sıfır Disk Tüketimi)

### Yöntem A: `rclone` ile Doğrudan Bulut Yüklemesi (Önerilen)
`rclone`, dosyaları yerel SSD'nizde tutmadan doğrudan Google Drive'a akıtır:

1. Kurulum:
   ```bash
   brew install rclone
   ```
2. Yapılandırma:
   ```bash
   rclone config
   # 'n' (yeni remote) -> İsim: 'gdrive' -> Tip: 'drive'
   # Giriş ekranında 'kerem.newton571@gmail.com' hesabınızı seçip izin verin.
   ```
3. Tek Komutla Buluta Aktar:
   ```bash
   # Sıkıştırılmış soru paketlerini ve veritabanı yedeğini Drive'a yükler:
   npm run cloud:sync
   ```

### Yöntem B: Google Drive for Desktop
Eğer Mac'inizde Google Drive masaüstü uygulaması kuruluysa:
```bash
# data/archive klasörünü Drive içerisine sembolik bağlayın:
mkdir -p ~/Google\ Drive/My\ Drive/MEB_Maarif_LGS
cp data/archive/*.json.gz ~/Google\ Drive/My\ Drive/MEB_Maarif_LGS/
```

---

## 3. Otomatik Paket Komutları
Platformumuza eklenen yeni scriptler:
- `npm run cloud:backup`: Tüm 53 soruyu ve SQL şemasını gzip formatında arşivler (< 100 KB).
- `npm run cloud:sync`: Arşivi Google Drive'a aktarır ve yükleme rehberini yazdırır.
