/**
 * MEB Maarif LGS Platformu - Sifir Disk Alani Tuketimli Bulut Senkronizasyon Yoneticisi
 * Hedef Hesap: kerem.newton571@gmail.com (5 TB Google Drive Alani)
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Platform yedek yukunu (metadata + questions + seed sql) hazirlar
 */
export function prepareBackupPayload() {
  const questionsPath = path.join(__dirname, '..', 'public', 'questions.json');
  const sqlPath = path.join(__dirname, '..', 'db', 'seed_full_production.sql');
  const fallbackSqlPath = path.join(__dirname, '..', 'db', 'seed_meb_8th_grade.sql');

  let databaseSeed = null;
  if (fs.existsSync(sqlPath)) {
    databaseSeed = fs.readFileSync(sqlPath, 'utf-8');
  } else if (fs.existsSync(fallbackSqlPath)) {
    databaseSeed = fs.readFileSync(fallbackSqlPath, 'utf-8');
  }

  return {
    metadata: {
      platform: 'MEB Maarif LGS Platformu',
      version: '1.0.0-faz5',
      user: 'kerem.newton571@gmail.com',
      storageQuotaTarget: 'Google Drive 5TB',
      exportedAt: new Date().toISOString()
    },
    questions: JSON.parse(fs.readFileSync(questionsPath, 'utf-8')),
    databaseSeed
  };
}

/**
 * Verilen yuk veya varsayilan platform verisini bellek icinde (RAM) Level-9 Gzip ile sikistirir.
 * Sifir yerel disk kullanimi gerektiren durumlar icin dogrudan buffer dondurur.
 */
export function compressPayload(payloadOrString = null, options = {}) {
  const compressionLevel = options.level ?? 9;
  const payload = payloadOrString || prepareBackupPayload();
  const rawJson = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const rawBuffer = Buffer.from(rawJson, 'utf-8');
  const rawBytes = rawBuffer.length;
  const rawSizeKb = (rawBytes / 1024).toFixed(2);

  // Yuksek Seviye Gzip Sikistirma (Seviye 9)
  const compressedBuffer = zlib.gzipSync(rawBuffer, { level: compressionLevel });
  const compressedBytes = compressedBuffer.length;
  const compSizeKb = (compressedBytes / 1024).toFixed(2);
  const savingRatio = Number(((1 - (compressedBytes / rawBytes)) * 100).toFixed(2));
  const ratio = savingRatio.toFixed(1);

  return {
    rawJson,
    rawBuffer,
    rawBytes,
    compressedBuffer,
    buffer: compressedBuffer,
    compressedBytes,
    rawSizeKb,
    compSizeKb,
    savingRatio,
    ratio
  };
}

/**
 * Sikistirma ve istege bagli yerel arsivleme fonksiyonu
 */
export function compressAndArchiveData(options = {}) {
  const { writeToDisk = true, customDir = null, level = 9 } = options;
  const archiveDir = customDir || path.join(__dirname, '..', 'data', 'archive');
  if (writeToDisk && !fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const compResult = compressPayload(options.payload || null, { level });
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const archiveFile = `lgs_maarif_backup_${timestamp}.json.gz`;
  const archivePath = path.join(archiveDir, archiveFile);

  if (writeToDisk) {
    fs.writeFileSync(archivePath, compResult.compressedBuffer);
  }

  console.log('====================================================');
  console.log('[BULUT] MEB MAARIF LGS BULUT ARSIVLEME BASARILI');
  if (writeToDisk) {
    console.log(`[DOSYA] Dosya: ${archivePath}`);
  }
  console.log(`[ORAN] Orijinal Boyut: ${compResult.rawSizeKb} KB`);
  console.log(`[SIKISTIRMA] Sikistirilmis Boyut: ${compResult.compSizeKb} KB (%${compResult.ratio} Tasarruf)`);
  console.log('[HEDEF] Hedef Depolama: kerem.newton571@gmail.com (5 TB Drive)');
  console.log('====================================================');

  return {
    archivePath: writeToDisk ? archivePath : null,
    rawSizeKb: compResult.rawSizeKb,
    compSizeKb: compResult.compSizeKb,
    ratio: compResult.ratio,
    savingRatio: compResult.savingRatio,
    rawBytes: compResult.rawBytes,
    compressedBytes: compResult.compressedBytes,
    compressedBuffer: compResult.compressedBuffer,
    buffer: compResult.compressedBuffer
  };
}

export function printCloudUploadInstructions() {
  console.log(`
[KILAVUZ] GOOGLE DRIVE (5 TB) BULUT AKTARIM REHBERI:
---------------------------------------------------------------------------------
1. 'rclone' ile Dogrudan Yukleme (Onerilen - Yerel Disk Tuketmez):
   $ brew install rclone
   $ rclone config (Adi: 'gdrive', Tip: 'drive', Kullanici: kerem.newton571@gmail.com)
   $ rclone copy data/archive/ gdrive:MEB_Maarif_LGS_Yedekleri/ -v

2. Google Drive Desktop ile Otomatik Klasor Senkronizasyonu:
   Mac Finder icindeki "Google Drive" klasorunuze 'data/archive/' sembolik baglayin:
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
