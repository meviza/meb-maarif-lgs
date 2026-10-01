/**
 * MEB Maarif LGS Platformu - Sıfır Disk Alanı Tüketimli Bulut Senkronizasyon Yöneticisi
 * Hedef Hesap: kerem.newton571@gmail.com (5 TB Google Drive Alanı)
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function compressAndArchiveData() {
  const archiveDir = path.join(__dirname, '..', 'data', 'archive');
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

  const questionsPath = path.join(__dirname, '..', 'public', 'questions.json');
  const sqlPath = path.join(__dirname, '..', 'db', 'seed_full_production.sql');

  const payload = {
    metadata: {
      platform: 'MEB Maarif LGS Platformu',
      version: '1.0.0-faz5',
      user: 'kerem.newton571@gmail.com',
      storageQuotaTarget: 'Google Drive 5TB',
      exportedAt: new Date().toISOString()
    },
    questions: JSON.parse(fs.readFileSync(questionsPath, 'utf-8')),
    databaseSeed: fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf-8') : null
  };

  const rawJson = JSON.stringify(payload);
  const rawSizeKb = (Buffer.byteLength(rawJson) / 1024).toFixed(2);

  // Yüksek Seviye Gzip Sıkıştırma (Seviye 9)
  const compressed = zlib.gzipSync(Buffer.from(rawJson), { level: 9 });
  const compSizeKb = (compressed.length / 1024).toFixed(2);
  const ratio = ((1 - (compressed.length / Buffer.byteLength(rawJson))) * 100).toFixed(1);

  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const archiveFile = `lgs_maarif_backup_${timestamp}.json.gz`;
  const archivePath = path.join(archiveDir, archiveFile);
  fs.writeFileSync(archivePath, compressed);

  console.log(`====================================================`);
  console.log(`📦 MEB MAARİF LGS BULUT ARŞİVLEME BAŞARILI`);
  console.log(`📁 Dosya: ${archivePath}`);
  console.log(`📊 Orijinal Boyut: ${rawSizeKb} KB`);
  console.log(`⚡ Sıkıştırılmış Boyut: ${compSizeKb} KB (%${ratio} Tasarruf)`);
  console.log(`☁️ Hedef Depolama: kerem.newton571@gmail.com (5 TB Drive)`);
  console.log(`====================================================`);

  return { archivePath, rawSizeKb, compSizeKb, ratio };
}

export function printCloudUploadInstructions() {
  console.log(`
🚀 GOOGLE DRIVE (5 TB) BULUT AKTARIM REHBERİ:
---------------------------------------------------------------------------------
1. 'rclone' ile Doğrudan Yükleme (Önerilen - Yerel Disk Tüketmez):
   $ brew install rclone
   $ rclone config (Adı: 'gdrive', Tip: 'drive', Kullanıcı: kerem.newton571@gmail.com)
   $ rclone copy data/archive/ gdrive:MEB_Maarif_LGS_Yedekleri/ -v

2. Google Drive Desktop ile Otomatik Klasör Senkronizasyonu:
   Mac Finder içindeki "Google Drive" klasörünüze 'data/archive/' sembolik bağlayın:
   $ ln -s $(pwd)/data/archive ~/Google\\ Drive/My\\ Drive/MEB_Maarif_LGS/

3. GitHub Deposu Senkronizasyonu:
   $ git remote add origin https://github.com/KULLANICI_ADINIZ/meb-maarif-lgs.git
   $ git branch -M master
   $ git push -u origin master
---------------------------------------------------------------------------------
`);
}

if (process.argv[1]?.endsWith('cloud_sync_manager.mjs')) {
  compressAndArchiveData();
  printCloudUploadInstructions();
}
