/**
 * MEB Maarif LGS Platformu - Toplu Soru Uretim Fabrikasi (Bulk Generator)
 * 
 * 4 Ana Brans ve 4 Zorluk Seviyesine Gore Deterministik, Sifir Supheli Soru Uretimi
 * Kullanim:
 *   node engine/bulk_generator.mjs --course=turkce --difficulty=LGS_YENI_NESIL --count=2
 *   node engine/bulk_generator.mjs --matrix --deterministic
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jevPipeline } from './jev_self_correction.mjs';
import { JevQualityAuditor } from './jev_evaluator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SUPPORTED_BRANCHES = [
  { key: 'turkce', name: 'Türkçe', defaultTopic: 'Paragrafta Anlam ve Yapı', outcomePrefix: 'T.8.3.' },
  { key: 'matematik', name: 'Matematik', defaultTopic: 'Çarpanlar ve Katlar / Üslü İfadeler', outcomePrefix: 'M.8.1.' },
  { key: 'fen', name: 'Fen Bilimleri', defaultTopic: 'Mevsimler ve İklim / DNA ve Genetik Kod', outcomePrefix: 'F.8.1.' },
  { key: 'inkilap', name: 'T.C. İnkılap Tarihi ve Atatürkçülük', defaultTopic: 'Bir Kahraman Doğuyor / Millî Uyanış', outcomePrefix: 'İTA.8.1.' }
];

export const SUPPORTED_DIFFICULTIES = [
  'KAVRAMA',
  'UYGULAMA',
  'LGS_YENI_NESIL',
  'SEKIL_VE_OLIMPIYAT'
];

/**
 * CLI Argumanlarini Ayristir
 */
export function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    course: 'turkce',
    difficulty: 'LGS_YENI_NESIL',
    count: 2,
    topic: null,
    model: 'qwen2.5:3b',
    deterministic: false,
    matrix: false,
    save: true
  };

  args.forEach(arg => {
    if (arg.startsWith('--course=')) options.course = arg.split('=')[1].toLowerCase();
    if (arg.startsWith('--difficulty=')) options.difficulty = arg.split('=')[1].toUpperCase();
    if (arg.startsWith('--count=')) options.count = parseInt(arg.split('=')[1], 10) || 1;
    if (arg.startsWith('--topic=')) options.topic = arg.split('=')[1];
    if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
    if (arg === '--deterministic') options.deterministic = true;
    if (arg === '--matrix') options.matrix = true;
    if (arg === '--no-save') options.save = false;
  });

  return options;
}

/**
 * Belirli bir brans ve zorluk seviyesi icin tekil veya grup soru uretir
 */
export async function generateQuestionBatch({
  course = 'turkce',
  difficulty = 'LGS_YENI_NESIL',
  topic = null,
  count = 1,
  deterministic = false,
  model = 'qwen2.5:3b',
  silent = false
}) {
  const auditor = new JevQualityAuditor();
  const branchMeta = SUPPORTED_BRANCHES.find(b => b.key === course || (course === 'sosyal' && b.key === 'inkilap')) || SUPPORTED_BRANCHES[0];
  const activeTopic = topic || branchMeta.defaultTopic;
  const questions = [];

  for (let i = 1; i <= count; i++) {
    const outcomeCode = `${branchMeta.outcomePrefix}${i}.${Math.floor(Math.random() * 9) + 1}`;
    let candidateQuestion;
    let auditResult;
    let attempts = 1;

    if (deterministic) {
      candidateQuestion = jevPipeline.generateDeterministicFallback(
        course,
        activeTopic,
        outcomeCode,
        difficulty
      );
      auditResult = await auditor.evaluateQuestion(candidateQuestion);
    } else {
      const output = await jevPipeline.produceQuestion({
        course,
        topic: activeTopic,
        outcomeCode,
        difficulty,
        model
      });
      candidateQuestion = output.question;
      auditResult = output.audit;
      attempts = output.attempts;
    }

    // Sifir suphe ve deterministik onay kontrolu
    if (!auditResult.passed || auditResult.score < 0.85) {
      // Kalite kapisindan gecemezse deterministik yedek devreye girer
      candidateQuestion = jevPipeline.generateDeterministicFallback(
        course,
        activeTopic,
        outcomeCode,
        difficulty
      );
      auditResult = await auditor.evaluateQuestion(candidateQuestion);
    }

    // Emoji temizligi garantisi
    const jsonStr = JSON.stringify(candidateQuestion);
    const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(jsonStr);
    if (hasEmoji) {
      throw new Error(`[HATA] Soru iceriginde emoji tespit edildi: ${candidateQuestion.id}`);
    }

    questions.push({
      ...candidateQuestion,
      _meta: {
        branch: branchMeta.key,
        branchName: branchMeta.name,
        difficulty,
        jevScore: auditResult.score,
        attempts,
        zeroAmbiguityVerified: auditResult.decisions.zero_ambiguity,
        deterministicVerified: auditResult.decisions.single_deterministic_answer,
        difficultyAlignmentScore: auditResult.decisions.difficulty_alignment
      }
    });

    if (!silent) {
      console.log(`  [OK] Soru: ${candidateQuestion.id} | Brans: ${branchMeta.name} | Zorluk: ${difficulty} | JEV: ${auditResult.score}`);
    }
  }

  return questions;
}

/**
 * 4 Brans x 4 Zorluk Seviyesini kapsayan tam matris uretimi (16 kombinasyon)
 */
export async function generateFullMatrix(options = {}) {
  const {
    countPerCategory = 1,
    deterministic = true,
    model = 'qwen2.5:3b',
    silent = false
  } = options;

  if (!silent) {
    console.log('====================================================');
    console.log('[BASLAT] 4 BRANS x 4 ZORLUK SEVIYESI MATRIS URETIMI');
    console.log('[BILGI] Mod: Deterministik ve Sifir Supheli');
    console.log(`[BILGI] Kategori Basi Soru: ${countPerCategory} | Toplam: ${4 * 4 * countPerCategory} Soru`);
    console.log('====================================================');
  }

  const allQuestions = [];
  const branchCounts = {};
  const difficultyCounts = {};

  for (const branch of SUPPORTED_BRANCHES) {
    branchCounts[branch.key] = 0;
    for (const diff of SUPPORTED_DIFFICULTIES) {
      difficultyCounts[diff] = (difficultyCounts[diff] || 0);

      const batch = await generateQuestionBatch({
        course: branch.key,
        difficulty: diff,
        count: countPerCategory,
        deterministic,
        model,
        silent
      });

      for (const q of batch) {
        allQuestions.push(q);
        branchCounts[branch.key]++;
        difficultyCounts[diff]++;
      }
    }
  }

  return {
    totalGenerated: allQuestions.length,
    questions: allQuestions,
    branchCounts,
    difficultyCounts
  };
}

/**
 * Toplu Soru Uretimi Ana Fonksiyonu
 */
export async function runBulkGeneration(options = null) {
  const config = options || parseArgs();
  const startTime = Date.now();

  console.log('====================================================');
  console.log('[BASLAT] MEB MAARIF LGS TOPLU SORU URETIM FABRIKASI');
  console.log('====================================================');

  let results = [];

  if (config.matrix || config.course === 'all' || config.difficulty === 'all') {
    // Matris Modu (4 Brans x 4 Zorluk)
    const matrixResult = await generateFullMatrix({
      countPerCategory: config.count || 1,
      deterministic: config.deterministic ?? true,
      model: config.model || 'qwen2.5:3b',
      silent: false
    });
    results = matrixResult.questions;
  } else {
    // Tekil Brans ve Zorluk Modu
    console.log(`[BRANS] Hedef Brans: ${config.course.toUpperCase()}`);
    console.log(`[ZORLUK] Zorluk Seviyesi: ${config.difficulty || 'LGS_YENI_NESIL'}`);
    console.log(`[KONU] Hedef Konu: ${config.topic || 'Otomatik Belirlendi'}`);
    console.log(`[ADET] Uretilecek Soru: ${config.count || 2}`);
    console.log(`[MODEL] AI Modeli: ${config.model || 'qwen2.5:3b'}`);
    console.log(`[MOD] Calisma Modu: ${config.deterministic ? 'Deterministik (Sifir Suphe)' : 'LLM Destekli'}`);
    console.log('----------------------------------------------------');

    results = await generateQuestionBatch({
      course: config.course,
      difficulty: config.difficulty || 'LGS_YENI_NESIL',
      topic: config.topic,
      count: config.count || 2,
      deterministic: config.deterministic ?? false,
      model: config.model || 'qwen2.5:3b',
      silent: false
    });
  }

  // Cikti Dosyasina Kaydet
  let outPath = null;
  if (config.save !== false) {
    const outDir = config.outDir || path.join(__dirname, '..', 'data', 'generated');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const prefix = config.matrix ? 'matrix_batch' : `ai_batch_${config.course}`;
    const fileName = `${prefix}_${Date.now()}.json`;
    outPath = path.join(outDir, fileName);
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');

    console.log('\n====================================================');
    console.log(`[KAYIT] ${results.length} Adet Onayli Soru Kaydedildi: ${outPath}`);
    console.log(`[SURE] Toplam Sure: ${Date.now() - startTime} ms`);
    console.log('====================================================');
  }

  return {
    count: results.length,
    filePath: outPath,
    questions: results
  };
}

if (process.argv[1]?.endsWith('bulk_generator.mjs')) {
  runBulkGeneration()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[HATA] Toplu soru uretim hatasi:', err);
      process.exit(1);
    });
}
