/**
 * MEB Maarif LGS Platformu - Kapsamlı Soru Kalite ve Müfredat Analitik Motoru
 * Türkiye Yüzyılı Maarif Modeli & JEV System-1 Kurumsal Kalite Endeksi
 * 
 * Bu motor her bir soruyu ve tüm soru bankasını 8 pedagojik boyutta denetler:
 * 1. MEB Maarif Müfredat ve Kazanım Uyumu (Öğrenme çıktıları ve beceri temelli yaklaşım)
 * 2. Sıfır Şüphe ve Deterministik Tek Cevap Güvencesi (Zero-Ambiguity Index)
 * 3. 4 Kademeli Zorluk Seviyesi ve Bilişsel Yük Dengesi
 * 4. Bloom Taksonomisi Bilişsel Süreç Dağılımı
 * 5. Çeldirici Gücü ve Pedagojik Hata Teşhis Kalitesi
 * 6. Uzman Öğretmen Çözüm Stratejisi ve Adım Adım Açıklama
 * 7. TDK İmla, Dilbilgisi ve Soru Kökü Standartları
 * 8. Sıfır Emoji ve Kurumsal Tasarım Uyumu
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JevQualityAuditor } from './jev_evaluator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class QuestionQualityAnalytics {
  constructor(options = {}) {
    this.jevAuditor = new JevQualityAuditor(options);
    this.minAcceptableScore = options.minAcceptableScore || 0.85;
  }

  /**
   * Tek bir sorunun kapsamlı kalite analizini yapar
   */
  async evaluateSingleQuestion(question) {
    const jevAudit = await this.jevAuditor.evaluateQuestion(question);
    const jsonStr = JSON.stringify(question);
    const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(jsonStr);

    const outcome = question.outcomeCode || question.outcome_code || '';
    const isMaarifCoded = /^(T|M|F|İTA|ITA|S)\.8\./i.test(outcome);

    const distractors = question.distractor_analysis || question.distractors || {};
    const distractorKeys = Object.keys(distractors);
    const distractorCompleteness = distractorKeys.length >= 3 ? 1.0 : (distractorKeys.length / 3);

    const hasStrategy = Boolean((question.solution_strategy || question.solutionStrategy || '').trim().length >= 15);
    const hasDetailed = Boolean((question.detailed_solution || question.detailedSolution || '').trim().length >= 25);

    // Kalite Endeksi [0 - 100]
    let qualityIndex = Math.round(jevAudit.score * 100);
    if (!isMaarifCoded) qualityIndex = Math.max(0, qualityIndex - 15);
    if (hasEmoji) qualityIndex = Math.max(0, qualityIndex - 30);
    if (!hasStrategy || !hasDetailed) qualityIndex = Math.max(0, qualityIndex - 10);

    return {
      id: question.id,
      course: question.course || 'GENEL',
      outcomeCode: outcome,
      difficulty: question.difficulty || 'LGS_YENI_NESIL',
      jevScore: jevAudit.score,
      qualityIndex,
      isApproved: jevAudit.passed && qualityIndex >= 85 && !hasEmoji,
      decisions: {
        ...jevAudit.decisions,
        is_maarif_coded: isMaarifCoded,
        zero_emoji: !hasEmoji,
        distractor_completeness: distractorCompleteness,
        has_pedagogical_strategy: hasStrategy,
        has_detailed_solution: hasDetailed
      },
      reasons: jevAudit.reasons
    };
  }

  /**
   * Tüm Soru Bankasını (questions.json) denetler ve genel kalite karnesi üretir
   */
  async auditFullBank(multiTestBank = null) {
    let bank = multiTestBank;
    if (!bank) {
      const qPath = path.join(__dirname, '..', 'public', 'questions.json');
      bank = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
    }

    const report = {
      timestamp: new Date().toISOString(),
      totalCourses: 0,
      totalTests: 0,
      totalQuestions: 0,
      approvedQuestions: 0,
      overallQualityScore: 0,
      overallQualityIndex: 0, // 100 üzerinden
      metrics: {
        mebCurriculumAlignmentRate: 0,
        zeroAmbiguityRate: 0,
        zeroEmojiRate: 0,
        distractorCompletenessRate: 0,
        pedagogicalStrategyRate: 0
      },
      difficultyDistribution: {
        KAVRAMA: 0,
        UYGULAMA: 0,
        LGS_YENI_NESIL: 0,
        SEKIL_VE_OLIMPIYAT: 0
      },
      bloomDistribution: {
        UNDERSTAND: 0,
        APPLY: 0,
        ANALYZE: 0,
        EVALUATE: 0
      },
      branchReports: {},
      failedQuestions: []
    };

    let totalScoreSum = 0;
    let alignedCount = 0;
    let zeroAmbiguityCount = 0;
    let zeroEmojiCount = 0;
    let distractorFullCount = 0;
    let strategyCount = 0;

    for (const [courseKey, courseData] of Object.entries(bank)) {
      if (!courseData.tests) continue;
      report.totalCourses++;

      const branchStat = {
        courseKey,
        courseName: courseData.courseName,
        testCount: courseData.tests.length,
        questionCount: 0,
        approvedCount: 0,
        avgJevScore: 0,
        avgQualityIndex: 0,
        scoreSum: 0,
        difficulties: { KAVRAMA: 0, UYGULAMA: 0, LGS_YENI_NESIL: 0, SEKIL_VE_OLIMPIYAT: 0 }
      };

      for (const test of courseData.tests) {
        report.totalTests++;
        if (!test.questions) continue;

        for (const q of test.questions) {
          report.totalQuestions++;
          branchStat.questionCount++;

          const audit = await this.evaluateSingleQuestion(q);
          totalScoreSum += audit.jevScore;
          branchStat.scoreSum += audit.jevScore;

          if (audit.isApproved) {
            report.approvedQuestions++;
            branchStat.approvedCount++;
          } else {
            report.failedQuestions.push({
              id: q.id,
              course: courseKey,
              testId: test.id,
              reasons: audit.reasons
            });
          }

          if (audit.decisions.is_meb_aligned && audit.decisions.is_maarif_coded) alignedCount++;
          if (audit.decisions.zero_ambiguity && audit.decisions.single_deterministic_answer) zeroAmbiguityCount++;
          if (audit.decisions.zero_emoji) zeroEmojiCount++;
          if (audit.decisions.distractor_completeness >= 0.95) distractorFullCount++;
          if (audit.decisions.has_pedagogical_strategy && audit.decisions.has_detailed_solution) strategyCount++;

          // Zorluk dağılımı
          const diffNorm = this.jevAuditor._normalizeDifficulty(q);
          report.difficultyDistribution[diffNorm] = (report.difficultyDistribution[diffNorm] || 0) + 1;
          branchStat.difficulties[diffNorm] = (branchStat.difficulties[diffNorm] || 0) + 1;

          // Bloom dağılımı
          const bloom = audit.decisions.bloom_taxonomy_level || 'UNDERSTAND';
          report.bloomDistribution[bloom] = (report.bloomDistribution[bloom] || 0) + 1;
        }
      }

      branchStat.avgJevScore = branchStat.questionCount > 0 ? Number((branchStat.scoreSum / branchStat.questionCount).toFixed(3)) : 0;
      branchStat.avgQualityIndex = Number((branchStat.avgJevScore * 100).toFixed(1));
      delete branchStat.scoreSum;
      report.branchReports[courseKey] = branchStat;
    }

    if (report.totalQuestions > 0) {
      report.overallQualityScore = Number((totalScoreSum / report.totalQuestions).toFixed(3));
      report.overallQualityIndex = Number((report.overallQualityScore * 100).toFixed(1));
      report.metrics.mebCurriculumAlignmentRate = Number(((alignedCount / report.totalQuestions) * 100).toFixed(1));
      report.metrics.zeroAmbiguityRate = Number(((zeroAmbiguityCount / report.totalQuestions) * 100).toFixed(1));
      report.metrics.zeroEmojiRate = Number(((zeroEmojiCount / report.totalQuestions) * 100).toFixed(1));
      report.metrics.distractorCompletenessRate = Number(((distractorFullCount / report.totalQuestions) * 100).toFixed(1));
      report.metrics.pedagogicalStrategyRate = Number(((strategyCount / report.totalQuestions) * 100).toFixed(1));
    }

    return report;
  }

  /**
   * Kurumsal Denetim Raporunu Konsola ve String Çıktıya Formatlar
   */
  formatConsoleReport(report) {
    const lines = [];
    lines.push('================================================================================');
    lines.push('       MEB TÜRKIYE YÜZYILI MAARIF MODELI - JEV SYSTEM-1 KALITE ENDEKSI RAPORU');
    lines.push('================================================================================');
    lines.push(`Rapor Tarihi         : ${report.timestamp}`);
    lines.push(`Toplam Branş         : ${report.totalCourses} Temel Branş`);
    lines.push(`Toplam Test Paketi   : ${report.totalTests} Paket`);
    lines.push(`Toplam Soru Havuzu   : ${report.totalQuestions} Soru`);
    lines.push(`JEV Onaylı Soru      : ${report.approvedQuestions} / ${report.totalQuestions} (%${((report.approvedQuestions / report.totalQuestions) * 100).toFixed(1)})`);
    lines.push('--------------------------------------------------------------------------------');
    lines.push(`GENEL KALİTE ENDEKSİ : ${report.overallQualityIndex} / 100 (JEV Ortalama: ${report.overallQualityScore})`);
    lines.push('--------------------------------------------------------------------------------');
    lines.push('TEMEL KALİTE GÜVENCESİ METRİKLERİ:');
    lines.push(`  * MEB Müfredat ve Maarif Kod Uyumu : %${report.metrics.mebCurriculumAlignmentRate}`);
    lines.push(`  * Sıfır Şüphe & Tek Deterministik  : %${report.metrics.zeroAmbiguityRate}`);
    lines.push(`  * Sıfır Emoji ve Kurumsal Vektör   : %${report.metrics.zeroEmojiRate}`);
    lines.push(`  * Pedagojik Çeldirici Analizi (3/3): %${report.metrics.distractorCompletenessRate}`);
    lines.push(`  * Uzman Öğretmen Çözüm Stratejisi  : %${report.metrics.pedagogicalStrategyRate}`);
    lines.push('--------------------------------------------------------------------------------');
    lines.push('4 KADEMELİ ZORLUK SEVİYESİ DAĞILIMI:');
    lines.push(`  - Temel Seviye (Kavrama)           : ${report.difficultyDistribution.KAVRAMA} Soru (%${((report.difficultyDistribution.KAVRAMA / report.totalQuestions) * 100).toFixed(1)})`);
    lines.push(`  - Orta Seviye (Uygulama)           : ${report.difficultyDistribution.UYGULAMA} Soru (%${((report.difficultyDistribution.UYGULAMA / report.totalQuestions) * 100).toFixed(1)})`);
    lines.push(`  - İleri Seviye (LGS Yeni Nesil)    : ${report.difficultyDistribution.LGS_YENI_NESIL} Soru (%${((report.difficultyDistribution.LGS_YENI_NESIL / report.totalQuestions) * 100).toFixed(1)})`);
    lines.push(`  - Üst Düzey (Şampiyon / Beceri)    : ${report.difficultyDistribution.SEKIL_VE_OLIMPIYAT} Soru (%${((report.difficultyDistribution.SEKIL_VE_OLIMPIYAT / report.totalQuestions) * 100).toFixed(1)})`);
    lines.push('--------------------------------------------------------------------------------');
    lines.push('BLOOM TAKSONOMİSİ BİLİŞSEL SÜREÇ DAĞILIMI:');
    lines.push(`  - Kavrama (Understand)             : ${report.bloomDistribution.UNDERSTAND} Soru`);
    lines.push(`  - Uygulama (Apply)                 : ${report.bloomDistribution.APPLY} Soru`);
    lines.push(`  - Analiz (Analyze)                 : ${report.bloomDistribution.ANALYZE} Soru`);
    lines.push(`  - Değerlendirme (Evaluate)         : ${report.bloomDistribution.EVALUATE} Soru`);
    lines.push('--------------------------------------------------------------------------------');
    lines.push('BRANŞ BAZLI KALİTE KARNELERİ:');
    for (const [, b] of Object.entries(report.branchReports)) {
      lines.push(`  [${b.courseName.toUpperCase()}]`);
      lines.push(`    - Test Paketi : ${b.testCount} Paket | Soru Sayısı: ${b.questionCount} Soru`);
      lines.push(`    - Kalite Puanı: ${b.avgQualityIndex}/100 (JEV Skor: ${b.avgJevScore}) | Onay: ${b.approvedCount}/${b.questionCount}`);
      lines.push(`    - Dağılım     : Kavrama: ${b.difficulties.KAVRAMA} | Uygulama: ${b.difficulties.UYGULAMA} | LGS: ${b.difficulties.LGS_YENI_NESIL} | Şampiyon: ${b.difficulties.SEKIL_VE_OLIMPIYAT}`);
    }
    lines.push('================================================================================');

    if (report.failedQuestions.length > 0) {
      lines.push('DİKKAT: JEV Kalite Kapısını Geçemeyen Sorular:');
      report.failedQuestions.forEach(f => {
        lines.push(`  * ${f.id} (${f.course} - ${f.testId}): ${f.reasons?.join(', ')}`);
      });
      lines.push('================================================================================');
    }

    return lines.join('\n');
  }
}

// CLI Calistirma
if (process.argv[1]?.endsWith('quality_analytics.mjs')) {
  const analytics = new QuestionQualityAnalytics();
  analytics.auditFullBank().then(report => {
    console.log(analytics.formatConsoleReport(report));
    if (report.failedQuestions.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }).catch(err => {
    console.error('[HATA] Kalite denetimi calistirilamadi:', err);
    process.exit(1);
  });
}
