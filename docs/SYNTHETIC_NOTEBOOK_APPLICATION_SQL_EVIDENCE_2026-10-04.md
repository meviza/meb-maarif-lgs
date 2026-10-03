# Defter uygulama sınırı: Gerçek sentetik SQL kanıtı

## Sonuç ve kapsam

Kök ajan uygulama controller'ını sabit sentetik kaynak ve iki okulun ayrı SQL kimlikleriyle çalıştırdı. Gerçek PostgreSQL çalıştırmasında **73 temel SQL + 13 adapter + 10 uygulama tanığı** geçti; exit kodu **0**. Bu, tarayıcı defter UI'si, gerçek öğrenci yetkisi, üretim sürücüsü veya öğrenme analitiği kabulü değildir.

Komut: `node tools/test_synthetic_student_notebook_postgres.mjs --run --adapter --application --container k12-synthetic-notebook-root-app-green`.

CLI uygulama bayrağı testleri önce 0/2 geçti (beklenen RED: yeni opt-in yoktu), sonra 2/2 GREEN. `--application` yalnız `--adapter` ile kabul edilir; `--run` yoksa database/adapter/application yürütülmediğini bildirir. Eski varsayılan ve adapter-only sonuç şekilleri korunur.

## Gerçekte sınanan uygulama geçişleri

1. Sabit kaynak mevcut revizyon 5'i bilse de uygulama başlangıçta `readProjection:null`; yalnız gerçek kapsamlı güncel okuma defter gövdesini sunar.
2. Gerçek 6. revizyon kaydı doğrulanır; son okunmuş 5. revizyon korunur fakat stale işaretlenir. İstek gövdesi doğrulanmış okuma diye gösterilmez; otomatik okuma yoktur.
3. Açık güncel okuma 6. revizyonu ve aynı gövdeyi getirir. Defter sayımları operasyonel kullanım göstergesidir, biliş/başarı/zeka kanıtı değildir.
4. Tam tekrar aynı SQL makbuzunu döndürür, ek history oluşturmaz; fazladan istemci yetki alanı SQL çalıştırılmadan reddedilir.
5. SQL 7. revizyonu gerçekten yazar, ardından kök tanığı yanıt kaybı enjekte eder: `save_unknown`, `persisted:null`, eski okuma stale, otomatik retry yoktur.
6. Açık güncel okuma gerçekten kaydedilmiş 7. revizyonu geri getirir.
7. Yanlış okulun sabit executor kimliği gerçek SQL kapsam reddi alır; uygulama gövdesi sızmaz.
8. Gerçek kapsamlı SQL cevabının satır sayısı bozulduğunda uygulama güncel gövde sunmaz.
9. Gerçek SQL okumasının cevabı kontrollü bekletilirken ikinci işlem executor'a girmeden busy reddi alır. Bu, çok bağlantılı veritabanı yarış testi değildir.
10. Son SQL durumu okul A: head/history **7/7**, okul B: **1/1**, eşlenmemiş rol history: **0**.

## İzolasyon ve anlam sınırı

Mevcut `postgres:16.15-alpine` imajı; `--pull=never`, network none, host port/mount yok, 1 CPU, 256 MiB RAM, 58 MiB tmpfs, 2 MiB shm, read-only root, postgres kullanıcı, tüm capability'ler düşürülmüş, no-new-privileges. Sahipliği container ID ile kontrol edilen yalnız bu fazın container'ı durduruldu; araç `containerStopped:true` bildirdi. Bağımsız sonraki inspect `No such container` verdi.

SQL 002 yine bağımsız sentetik kanıttır; 001 ile üretim migration zinciri test edilmedi. Fixture gerçek SQL head/history'den güvenilir test kökünde hazırlanır; browser payload'ından kaynak/kapsam oluşturulmaz. Köprü allowlist edilmiş aynı-session PREPARE/EXECUTE ve kaçırılmış literal değerleri kullanır; PostgreSQL wire-protocol driver değildir.

Uygulama kendi hook'unun provenance'ını kanıtlayamaz: çıktıdaki `realDatabaseVerified:false` doğru kalır. Gerçek DB kanıtı bu dış test çalıştırmasıdır; boolean flag/hashing kimlik doğrulaması değildir. Gerçek auth, öğrenci ekranına kalıcı bağlama, çok bağlantılı yarış/çökme/yük, retention/erase/restore, telemetry ve pedagojik analitik hâlâ açık işlerdir. DAMA/CMMI/SPICE/MEB sertifikasyonu iddia edilmez.

## Bağımsız salt-okunur denetim

Uygulama yazarı kökün yeni harness/CLI değişimini ayrıca denetledi: üç CLI dosyası **13/13**, fail0/skip0/exit0. Bu ikinci Docker veya gerçek SQL koşusu değildir. Sabit rolün head5/tarihsel makbuzlarından fixture yeniden kurma, allowlist, kaynak sabitliği ve uygulama unknown/explicit-read geçişlerinde yeni P1/P2 bulgu bildirilmedi.

Bağımsız sentetik hook sınır probu: destekli body **262.144 byte**, 96 karakterli ID'ler, 200 hedef/100 bookmark, 64 stroke/100 note/100 concern ile current result266.664byte/view266.183byte; save result267.618byte/view266.184byte. Yeniden hashlenmiş262.145byte body reddedildi, eski projection değişmedi. Bu bir mock executor tanığıdır; gerçek DB/maksimum yük testi değildir. Nihai512KiB çıktı reddi dalı destekli maksimumda tetiklenmedi. Gelecekte şema/body bütçesi büyürse projection+counts önkontrolüne ek tam prospective view/result atomik sınaması gerekir.
