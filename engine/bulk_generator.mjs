/**
 * MEB Maarif LGS Platformu - Toplu Soru Üretim Fabrikası (CLI) (Faz 4)
 * Kullanım: node engine/bulk_generator.mjs --course=turkce --count=2
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jevPipeline } from './jev_self_correction.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Argümanları Ayrıştır
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    course: 'turkce',
    count: 2,
    topic: 'Paragrafta Anlam ve Yapı',
    model: 'qwen2.5:3b'
  };

  args.forEach(arg => {
    if (arg.startsWith('--course=')) options.course = arg.split('=')[1].toLowerCase();
    if (arg.startsWith('--count=')) options.count = parseInt(arg.split('=')[1], 10) || 2;
    if (arg.startsWith('--topic=')) options.topic = arg.split('=')[1];
    if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
  });

  return options;
}

export async function runBulkGeneration(options = null) {
  const config = options || parseArgs();
  console.log(`====================================================`);
  console.log(`🏭 MEB MAARİF LGS TOPLU SORU ÜRETİM FABRİKASI BAŞLADI`);
  console.log(`📚 Hedef Branş: ${config.course.toUpperCase()}`);
  console.log(`🎯 Hedef Konu: ${config.topic}`);
  console.log(`🔢 Üretilecek Soru: ${config.count}`);
  console.log(`🤖 AI Modeli: ${config.model}`);
  console.log(`====================================================`);

  const results = [];

  for (let i = 1; i <= config.count; i++) {
    console.log(`\n[${i}/${config.count}] Soru hazırlanıyor...`);
    const output = await jevPipeline.produceQuestion({
      course: config.course,
      topic: config.topic,
      outcomeCode: `MEB.8.${config.course.slice(0, 2).toUpperCase()}.${i}`,
      model: config.model
    });

    results.push(output.question);
    console.log(`  ✓ Soru Kodu: ${output.question.id} | JEV Puanı: ${output.audit.score} (Deneme: ${output.attempts})`);
  }

  // Çıktı Dosyasına Yaz
  const outDir = path.join(__dirname, '..', 'data', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const fileName = `ai_batch_${config.course}_${Date.now()}.json`;
  const outPath = path.join(outDir, fileName);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n====================================================`);
  console.log(`💾 ${results.length} Adet Onaylı Soru Kaydedildi: ${outPath}`);
  console.log(`====================================================`);

  return { count: results.length, filePath: outPath, questions: results };
}

if (process.argv[1]?.endsWith('bulk_generator.mjs')) {
  runBulkGeneration();
}
