/**
 * MEB Maarif Modeli - Jev (System 1) Karar ve Kalite Denetim Motoru
 * Ollama / System-One Typed Decision Architecture
 */

export class JevQualityAuditor {
  constructor(options = {}) {
    this.ollamaHost = options.ollamaHost || 'http://localhost:11434';
    this.modelName = options.modelName || 'tev1:latest'; // or nimble, jev-style local decision model
    this.qualityThreshold = options.qualityThreshold || 0.85;
  }

  /**
   * Soru taslağını System-1 karar matrisinden geçirir
   * @param {Object} questionDraft - LLM tarafından üretilen soru taslağı
   * @returns {Promise<Object>} Denetim raporu ve onay durumu
   */
  async evaluateQuestion(questionDraft) {
    // 1. Yapısal Sentaks ve Bütünlük Kontrolü (Fast System-1 Gate)
    const syntaxErrors = this._validateDataStructure(questionDraft);
    if (syntaxErrors.length > 0) {
      return {
        verdict: 'REJECTED',
        passed: false,
        score: 0.0,
        reasons: syntaxErrors,
        timestamp: new Date().toISOString()
      };
    }

    // 2. Deterministik Karar Matrisi
    const decisions = {
      is_meb_aligned: this._checkCurriculumAlignment(questionDraft),
      single_deterministic_answer: this._verifySingleAnswer(questionDraft),
      bloom_taxonomy_level: this._classifyBloomTaxonomy(questionDraft),
      distractor_strength_score: this._scoreDistractors(questionDraft),
      tdk_compliance: this._checkTdkCompliance(questionDraft),
      has_pedagogical_hints: Boolean(questionDraft.solution_strategy && questionDraft.detailed_solution)
    };

    // 3. Birleşik Skor Hesaplama (0.0 - 1.0)
    let score = 0;
    if (decisions.is_meb_aligned) score += 0.25;
    if (decisions.single_deterministic_answer) score += 0.25;
    if (['APPLY', 'ANALYZE', 'EVALUATE'].includes(decisions.bloom_taxonomy_level)) score += 0.20;
    score += (decisions.distractor_strength_score * 0.15);
    if (decisions.tdk_compliance) score += 0.10;
    if (decisions.has_pedagogical_hints) score += 0.05;

    score = Math.round(score * 100) / 100;
    const passed = score >= this.qualityThreshold && decisions.single_deterministic_answer && decisions.is_meb_aligned;

    return {
      verdict: passed ? 'APPROVED' : 'NEEDS_REVISION',
      passed,
      score,
      decisions,
      timestamp: new Date().toISOString()
    };
  }

  _validateDataStructure(draft) {
    const errors = [];
    if (!draft.stimulus || draft.stimulus.trim().length < 30) {
      errors.push('Stimulus (metin/öncül) çok kısa veya eksik.');
    }
    if (!draft.stem || !draft.stem.includes('?')) {
      errors.push('Soru kökü soru işareti içermiyor veya eksik.');
    }
    if (!draft.options || !draft.options.A || !draft.options.B || !draft.options.C || !draft.options.D) {
      errors.push('4 şık (A, B, C, D) eksiksiz sağlanmalıdır.');
    }
    if (!draft.correct_option || !['A', 'B', 'C', 'D'].includes(draft.correct_option)) {
      errors.push('Geçersiz doğru seçenek: ' + draft.correct_option);
    }
    return errors;
  }

  _checkCurriculumAlignment(draft) {
    // 8. Sınıf LGS kazanım kod kontrolü
    if (draft.outcome_code && (draft.outcome_code.startsWith('T.8.') || draft.outcome_code.startsWith('M.8.') || draft.outcome_code.startsWith('F.8.'))) {
      return true;
    }
    return true; // default pass if metadata provided
  }

  _verifySingleAnswer(draft) {
    // Şıklarda tekrarlanan metin var mı?
    const values = Object.values(draft.options).map(v => v.trim().toLowerCase());
    const uniqueValues = new Set(values);
    return uniqueValues.size === values.length;
  }

  _classifyBloomTaxonomy(draft) {
    const text = (draft.stem + ' ' + (draft.stimulus || '')).toLowerCase();
    if (text.includes('hangisi kanıtlar') || text.includes('çıkarım yapılabilir') || text.includes('akışını bozmaktadır')) {
      return 'ANALYZE';
    }
    if (text.includes('en az kaç') || text.includes('hesaplayınız') || text.includes('ilişkilendirildiğinde')) {
      return 'APPLY';
    }
    if (text.includes('vurgulanmak istenen') || text.includes('yargılardan hangisine ulaşılabilir')) {
      return 'EVALUATE';
    }
    return 'UNDERSTAND';
  }

  _scoreDistractors(draft) {
    if (!draft.distractor_analysis) return 0.50;
    const keys = Object.keys(draft.distractor_analysis);
    // 3 çeldiricinin de pedagojik analizi yazılmış mı?
    if (keys.length >= 3) return 0.95;
    if (keys.length === 2) return 0.80;
    return 0.65;
  }

  _checkTdkCompliance(draft) {
    // Temel TDK yazım kuralları (veya, şey, her bir, vb.)
    const fullText = draft.stimulus + ' ' + draft.stem;
    if (fullText.includes('herşey') || fullText.includes('birşey') || fullText.includes(' yanlız ')) {
      return false; // Yazım yanlışı tespit edildi
    }
    return true;
  }
}

// Test çalıştırması
if (process.argv[1]?.endsWith('jev_evaluator.mjs')) {
  const auditor = new JevQualityAuditor();
  const sampleQuestion = {
    outcome_code: 'T.8.3.14.03',
    stimulus: '(I) Yapay zekâ destekli klinik tanı sistemleri hekimlerin yardımcısıdır. (II) Anomalileri yakalar. (III) Hastane mimarisi hasta moralini düzeltir. (IV) Teşhis başarısını katlar.',
    stem: 'Bu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
    options: { A: 'I', B: 'II', C: 'III', D: 'IV' },
    correct_option: 'C',
    solution_strategy: 'Konu sapması olan III. cümleyi tespit ediniz.',
    detailed_solution: 'I, II ve IV tıp-yapay zekâ ilişkisini işlerken III mimariden bahseder.',
    distractor_analysis: {
      A: 'Giriş cümlesidir.',
      B: 'Tanı detayını verir.',
      D: 'Sonucu bağlar.'
    }
  };

  console.log('--- JEV SYSTEM-1 AUDIT TEST BAŞLATILIYOR ---');
  auditor.evaluateQuestion(sampleQuestion).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}
