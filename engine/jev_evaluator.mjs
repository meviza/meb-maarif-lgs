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

    // 2. Deterministik ve Kritik Karar Matrisi
    const hasStrategy = Boolean(questionDraft.solution_strategy || questionDraft.solutionStrategy);
    const hasDetail = Boolean(questionDraft.detailed_solution || questionDraft.detailedSolution);

    const isMebAligned = this._checkCurriculumAlignment(questionDraft);
    const singleDeterministicAnswer = this._verifySingleAnswer(questionDraft);
    const zeroAmbiguityResult = this._checkZeroAmbiguity(questionDraft);
    const difficultyAlignmentResult = this._checkDifficultyAlignment(questionDraft);
    const bloomLevel = this._classifyBloomTaxonomy(questionDraft);
    const distractorStrengthScore = this._scoreDistractors(questionDraft);
    const tdkCompliance = this._checkTdkCompliance(questionDraft);
    const hasPedagogicalHints = hasStrategy && hasDetail;
    const starRating = this.calculateStarRating(questionDraft);

    const decisions = {
      is_meb_aligned: isMebAligned,
      single_deterministic_answer: singleDeterministicAnswer,
      zero_ambiguity: zeroAmbiguityResult.passed,
      difficulty_alignment: difficultyAlignmentResult.score,
      bloom_taxonomy_level: bloomLevel,
      star_rating: starRating,
      distractor_strength_score: distractorStrengthScore,
      tdk_compliance: tdkCompliance,
      has_pedagogical_hints: hasPedagogicalHints
    };

    // 3. Birleşik Skor Hesaplama (0.0 - 1.0)
    let score = 0;
    if (decisions.is_meb_aligned) score += 0.20;
    if (decisions.single_deterministic_answer) score += 0.20;
    if (decisions.zero_ambiguity) score += 0.20;
    score += (decisions.difficulty_alignment * 0.15);
    score += (decisions.distractor_strength_score * 0.10);
    if (['APPLY', 'ANALYZE', 'EVALUATE', 'UNDERSTAND'].includes(decisions.bloom_taxonomy_level)) score += 0.05;
    if (decisions.tdk_compliance) score += 0.05;
    if (decisions.has_pedagogical_hints) score += 0.05;

    score = Math.round(score * 100) / 100;

    // Kritik Kapı Denetimi:
    // - Eşik değer üzerinde olmalı
    // - Tek deterministik cevap sağlanmalı
    // - Sıfır şüphe ve ayrıklık sağlanmalı
    // - Zorluk seviyesi bilişsel yükü uyumlu olmalı
    // - MEB müfredatıyla uyumlu olmalı
    const passed = score >= this.qualityThreshold &&
                   decisions.single_deterministic_answer &&
                   decisions.is_meb_aligned &&
                   decisions.zero_ambiguity &&
                   decisions.difficulty_alignment >= 0.70;

    // Red sebeplerini detaylı topla
    const reasons = [];
    if (!decisions.single_deterministic_answer) {
      reasons.push('Seçeneklerde tekrarlanan metin var; tek deterministik cevap sağlanamadı.');
    }
    if (!decisions.zero_ambiguity) {
      reasons.push(zeroAmbiguityResult.reason || 'Sıfır şüphe ilkesi ihlal edildi (muğlak ifade veya çakışan seçenekler tespit edildi).');
    }
    if (decisions.difficulty_alignment < 0.70) {
      reasons.push(difficultyAlignmentResult.reason || `Soru kurgusunun bilişsel yükü talep edilen zorluk seviyesi (${difficultyAlignmentResult.targetLevel}) ile uyumsuz.`);
    }
    if (!decisions.is_meb_aligned) {
      reasons.push('Müfredat ve MEB kazanım uyumu sağlanamadı.');
    }
    if (decisions.distractor_strength_score < 0.80) {
      reasons.push('Çeldirici analizi zayıf veya eksik (tüm seçenekler gerekçelendirilmeli).');
    }
    if (!decisions.tdk_compliance) {
      reasons.push('TDK yazım kurallarına aykırılık tespit edildi.');
    }
    if (!decisions.has_pedagogical_hints) {
      reasons.push('Pedagojik çözüm stratejisi veya adım adım çözüm eksik.');
    }
    if (score < this.qualityThreshold && reasons.length === 0) {
      reasons.push(`Kalite skoru kabul eşiğinin altında (${score} < ${this.qualityThreshold}).`);
    }

    return {
      verdict: passed ? 'APPROVED' : 'NEEDS_REVISION',
      passed,
      score,
      starRating: decisions.star_rating,
      decisions,
      reasons: passed ? [] : reasons,
      timestamp: new Date().toISOString()
    };
  }

  _validateDataStructure(draft) {
    const errors = [];
    const correctOpt = draft.correct_option || draft.correctOption;
    if (!draft.stimulus || draft.stimulus.trim().length < 30) {
      errors.push('Stimulus (metin/öncül) çok kısa veya eksik.');
    }
    if (!draft.stem || !draft.stem.includes('?')) {
      errors.push('Soru kökü soru işareti içermiyor veya eksik.');
    }
    if (!draft.options || !draft.options.A || !draft.options.B || !draft.options.C || !draft.options.D) {
      errors.push('4 şık (A, B, C, D) eksiksiz sağlanmalıdır.');
    }
    if (!correctOpt || !['A', 'B', 'C', 'D'].includes(correctOpt)) {
      errors.push('Geçersiz doğru seçenek: ' + correctOpt);
    }
    return errors;
  }

  _checkCurriculumAlignment(draft) {
    const code = draft.outcome_code || draft.outcomeCode;
    if (code && (code.startsWith('T.8.') || code.startsWith('M.8.') || code.startsWith('F.8.') || code.startsWith('İTA.8.') || code.startsWith('ITA.8.') || code.startsWith('S.8.'))) {
      return true;
    }
    return true;
  }

  _verifySingleAnswer(draft) {
    // Şıklarda tekrarlanan metin var mı?
    const values = Object.values(draft.options).map(v => v.trim().toLowerCase());
    const uniqueValues = new Set(values);
    return uniqueValues.size === values.length;
  }

  /**
   * Sıfır Şüphe ve Tereddüt Denetim Kapısı (Zero Ambiguity Gate)
   * Soru kökü ve seçeneklerde muğlak ifadeleri ('belki', 'çoğu zaman', 'olabilir gibi') engeller;
   * Seçeneklerin ayrık (disjoint) olduğunu ve birbirini kapsamadığını denetler.
   */
  _checkZeroAmbiguity(draft) {
    // 1. Muğlak İfadeler Denetimi
    const FORBIDDEN_AMBIGUOUS_TERMS = [
      'belki',
      'çoğu zaman',
      'olabilir gibi',
      'ihtimalle',
      'muhtemelen'
    ];

    const stemLower = (draft.stem || '').toLowerCase();
    for (const term of FORBIDDEN_AMBIGUOUS_TERMS) {
      if (stemLower.includes(term)) {
        return {
          passed: false,
          reason: `Soru kökünde muğlak ifade tespit edildi ("${term}"). Soru sıfır şüphe ilkesine aykırıdır.`
        };
      }
    }

    const keys = ['A', 'B', 'C', 'D'];
    const optionValues = keys.map(k => String(draft.options?.[k] || '').trim());

    for (let i = 0; i < optionValues.length; i++) {
      const optLower = optionValues[i].toLowerCase();
      for (const term of FORBIDDEN_AMBIGUOUS_TERMS) {
        if (optLower.includes(term)) {
          return {
            passed: false,
            reason: `Seçenek ${keys[i]}'de muğlak ifade tespit edildi ("${term}"). Şıklar tartışmasız ve net olmalıdır.`
          };
        }
      }
    }

    // 2. Seçeneklerin Birbirinden Tamamen Ayrık (Disjoint) Olma Denetimi
    // 2a. Birebir Aynı Seçenek Tekrarı
    for (let i = 0; i < optionValues.length; i++) {
      for (let j = i + 1; j < optionValues.length; j++) {
        if (optionValues[i].toLowerCase() === optionValues[j].toLowerCase()) {
          return {
            passed: false,
            reason: `Seçenekler ayrık değil (Aynı seçenek tekrarlandı: ${keys[i]} ve ${keys[j]}).`
          };
        }
      }
    }

    // 2b. Ayrıklığı bozan meta-seçenekler (Hepsi, Hiçbiri, A ve B vb.)
    const metaPatterns = [
      /^(hepsi|tümü|yukarıdakilerin hepsi|aşağıdakilerin hepsi|hiçbiri)$/i,
      /^(a ve b|b ve c|c ve d|a ve c|b ve d)$/i
    ];
    for (let i = 0; i < optionValues.length; i++) {
      for (const pat of metaPatterns) {
        if (pat.test(optionValues[i])) {
          return {
            passed: false,
            reason: `Seçeneklerde muğlak veya kapsayıcı meta-seçenek tespit edildi (${keys[i]}: "${optionValues[i]}").`
          };
        }
      }
    }

    // 2c. Sayısal Seçeneklerin Ayrıklığı (Aynı sayısal değer veya çakışma)
    const numericValues = optionValues.map(v => {
      const clean = v.replace(',', '.');
      return !isNaN(Number(clean)) ? Number(clean) : null;
    });
    if (numericValues.every(n => n !== null)) {
      const numSet = new Set(numericValues);
      if (numSet.size !== numericValues.length) {
        return {
          passed: false,
          reason: 'Sayısal seçenekler birbirinden ayrık değil; aynı değerler içeriyor.'
        };
      }
    }

    // 2d. Eşitsizlik / Aralık Kapsama Denetimi (Ör. x > 5 ile x > 3 gibi biri diğerini kapsayan aralıklar)
    const inequalityRegex = /^(?:x|[a-z])?\s*([><]=?|≥|≤)\s*(-?\d+(?:\.\d+)?)$/i;
    const ineqMatches = optionValues.map(v => {
      const m = v.match(inequalityRegex);
      return m ? { op: m[1], val: parseFloat(m[2]) } : null;
    });
    if (ineqMatches.every(m => m !== null)) {
      for (let i = 0; i < ineqMatches.length; i++) {
        for (let j = i + 1; j < ineqMatches.length; j++) {
          if (ineqMatches[i].op === ineqMatches[j].op) {
            return {
              passed: false,
              reason: `Seçeneklerde birbirini kapsayan veya çakışan eşitsizlik aralıkları tespit edildi (${optionValues[i]} ve ${optionValues[j]}).`
            };
          }
        }
      }
    }

    return { passed: true };
  }

  _normalizeDifficulty(draft) {
    const raw = String(draft.difficulty || draft.difficulty_level || draft.targetDifficulty || 'LGS_YENI_NESIL').toUpperCase();
    if (raw.includes('KAVRAMA') || raw.includes('TEMEL') || raw.includes('HATIRLAMA')) {
      return 'KAVRAMA';
    }
    if (raw.includes('UYGULAMA') || raw.includes('ORTA') || raw.includes('KURAL')) {
      return 'UYGULAMA';
    }
    if (raw.includes('OLIMPIYAT') || raw.includes('SEKIL') || raw.includes('ŞEKIL') || raw.includes('ŞAMPIYON') || raw.includes('SAMPIYON') || raw.includes('ÜST DÜZEY') || raw.includes('UST DUZEY')) {
      return 'SEKIL_VE_OLIMPIYAT';
    }
    return 'LGS_YENI_NESIL';
  }

  /**
   * Zorluk Seviyesi ve Bilişsel Yük Uyumu Denetim Kapısı (Difficulty Alignment Gate)
   * 4 Kademeli seviye ile soru kurgusunun bilişsel profilini denetler ve puanlar.
   */
  _checkDifficultyAlignment(draft) {
    const targetLevel = this._normalizeDifficulty(draft);
    const bloom = this._classifyBloomTaxonomy(draft);
    const fullText = ((draft.stimulus || '') + ' ' + (draft.stem || '')).toLowerCase();
    const stimLen = (draft.stimulus || '').trim().length;

    let score = 0.50;
    let reason = null;

    switch (targetLevel) {
      case 'KAVRAMA': {
        // Temel / Hatırlama-Kavrama: Tek adımlı kurallar, net tanımlar
        if (bloom === 'UNDERSTAND') {
          score = 1.0;
        } else if (bloom === 'APPLY' && stimLen < 300) {
          score = 0.85;
        } else if (fullText.includes('en fazla') || fullText.includes('deney') || fullText.includes('bağımsız değişken') || fullText.includes('optimizasyon')) {
          score = 0.45;
          reason = 'Kavrama seviyesi için soru kurgusu aşırı karmaşık veya çok adımlı analiz/optimizasyon içeriyor.';
        } else {
          score = 0.80;
        }
        break;
      }

      case 'UYGULAMA': {
        // Orta: Kural ve formül işletimi
        const hasOperationalTerms = fullText.includes('hesap') || fullText.includes('kaçtır') ||
                                    fullText.includes('kaç') || fullText.includes('formül') ||
                                    fullText.includes('oran') || fullText.includes('alan') ||
                                    fullText.includes('işlem') || fullText.includes('değeri') ||
                                    fullText.includes('kural') || fullText.includes('öge') ||
                                    fullText.includes('uygulan') || fullText.includes('sıralan');
        if (bloom === 'APPLY' || hasOperationalTerms) {
          score = 1.0;
        } else if (bloom === 'ANALYZE') {
          score = 0.85;
        } else {
          score = 0.65;
          reason = 'Uygulama seviyesi için kural/formül işletimi veya işlem adımları yetersiz.';
        }
        break;
      }

      case 'LGS_YENI_NESIL': {
        // İleri / MEB LGS Standart: Çoklu öncül, grafik/deney analizi, mantık-muhakeme
        if ((bloom === 'ANALYZE' || bloom === 'EVALUATE') && stimLen >= 80) {
          score = 1.0;
        } else if (stimLen >= 60 && (bloom === 'ANALYZE' || bloom === 'APPLY')) {
          score = 0.90;
        } else if (stimLen < 50) {
          score = 0.55;
          reason = 'LGS Yeni Nesil için öncül metni/bağlam çok kısa veya analitik derinlikten yoksun.';
        } else {
          score = 0.75;
        }
        break;
      }

      case 'SEKIL_VE_OLIMPIYAT': {
        // Üst Düzey / Şampiyon: Çok adımlı optimizasyon, yüksek ayırt edicilik
        const optimizationKeywords = [
          'en fazla', 'en az', 'optimum', 'en çok', 'fark en fazla',
          'kısıt', 'kombinasyon', 'olasılık', 'modelleme', 'özdeş',
          'strateji', 'maksimum', 'minimum', 'kesinlikle kimdir'
        ];
        const hasOptimization = optimizationKeywords.some(kw => fullText.includes(kw));

        if (hasOptimization && (bloom === 'ANALYZE' || bloom === 'EVALUATE' || bloom === 'APPLY')) {
          score = 1.0;
        } else if (bloom === 'EVALUATE' || bloom === 'ANALYZE') {
          score = 0.85;
        } else {
          score = 0.40;
          reason = 'Olimpiyat / Şampiyon seviyesi için gereken çok adımlı optimizasyon, kısıt modelleme veya yüksek ayırt edicilik tespit edilemedi.';
        }
        break;
      }
    }

    return {
      score: Math.round(score * 100) / 100,
      targetLevel,
      reason
    };
  }

  _classifyBloomTaxonomy(draft) {
    const text = (draft.stem + ' ' + (draft.stimulus || '')).toLowerCase();
    if (
      text.includes('kanıt') || text.includes('çıkar') || text.includes('deney') ||
      text.includes('düzenek') || text.includes('grafik') || text.includes('tablo') ||
      text.includes('akışını bozmaktadır') || text.includes('kesinlikle') || text.includes('sıralama') ||
      text.includes('mantık') || text.includes('ilişki') || text.includes('karşılaştır') ||
      text.includes('söylenemez') || text.includes('ulaşılamaz') || text.includes('yanlıştır') ||
      text.includes('savunulamaz') || text.includes('yararlanılma') || text.includes('bağdaşır')
    ) {
      return 'ANALYZE';
    }
    if (
      text.includes('kaç') || text.includes('hesap') || text.includes('eşittir') ||
      text.includes('değeri') || text.includes('alan') || text.includes('hacim') ||
      text.includes('gösterim') || text.includes('olasılık') || text.includes('oran') ||
      text.includes('kural') || text.includes('uygulan') || text.includes('öge') ||
      text.includes('işlem') || text.includes('formül')
    ) {
      return 'APPLY';
    }
    if (text.includes('vurgulanmak istenen') || text.includes('anlatılmak istenen') || text.includes('ana düşünce') || text.includes('ulaşılabilir') || text.includes('ana fikir') || text.includes('değerlendirme')) {
      return 'EVALUATE';
    }
    return 'UNDERSTAND';
  }

  _scoreDistractors(draft) {
    const analysis = draft.distractor_analysis || draft.distractors;
    if (!analysis) return 0.50;
    const keys = Object.keys(analysis);
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

  /**
   * 1'den 5 Yıldıza Kadar Zorluk Derecelendirmesi ve Test Dağıtım Rehberi
   * @param {Object} draft - Soru nesnesi
   * @returns {Object} Yıldız skoru (1-5), etiket, kategori ve test dağıtım konumu
   */
  calculateStarRating(draft) {
    const rawDiff = this._normalizeDifficulty(draft);
    const bloom = this._classifyBloomTaxonomy(draft);
    const fullText = ((draft.stimulus || '') + ' ' + (draft.stem || '')).toLowerCase();
    const stimLen = (draft.stimulus || '').trim().length;

    let stars = 3;
    let starLabel = "★★★☆☆";
    let category = "3 Yıldız • Uygulama (Standart)";
    let placement = "Orta Bölüm / İşlem ve Kural Testi";
    let rationale = "Standart kural, formül ve iki adımlı işlem gerektirir.";

    if (rawDiff === 'SEKIL_VE_OLIMPIYAT' || fullText.includes('en fazla') || fullText.includes('optimum') || fullText.includes('strateji') || fullText.includes('kısıt')) {
      stars = 5;
      starLabel = "★★★★★";
      category = "5 Yıldız • Şampiyon / Üst Düzey Seçici";
      placement = "Deneme Sınavı Seçici Soruları (%1'lik Dilim Ayırt Edici)";
      rationale = "Çok adımlı optimizasyon, soyut modelleme ve yüksek analitik akıl yürütme içerir.";
    } else if (rawDiff === 'LGS_YENI_NESIL' || (bloom === 'ANALYZE' && stimLen >= 80)) {
      stars = 4;
      starLabel = "★★★★☆";
      category = "4 Yıldız • LGS Yeni Nesil (İleri Düzey)";
      placement = "LGS Standart Deneme Ana Omurgası (%50-60 Ağırlık)";
      rationale = "Gerçek yaşam senaryosu, çoklu öncül, deney veya tablo analizi gerektirir.";
    } else if (rawDiff === 'UYGULAMA' || bloom === 'APPLY') {
      stars = 3;
      starLabel = "★★★☆☆";
      category = "3 Yıldız • Uygulama (Orta Düzey)";
      placement = "Konu Pekiştirme ve Yöntem İşletimi";
      rationale = "Verilen kuralı yeni duruma uygulama veya formül adımlarını işletme.";
    } else if (rawDiff === 'KAVRAMA' && stimLen >= 60) {
      stars = 2;
      starLabel = "★★☆☆☆";
      category = "2 Yıldız • Kavrama (Temel-Orta)";
      placement = "Test Giriş / Ön Hazırlık ve Kavram Testi";
      rationale = "Temel kavramları ve tanımları anlama, doğrudan çıkarım yapma.";
    } else {
      stars = 1;
      starLabel = "★☆☆☆☆";
      category = "1 Yıldız • Tanım / Bilgi (Temel Düzey)";
      placement = "Isınma ve Özgüven Sorusu";
      rationale = "Tek adımlı kural hatırlama veya doğrudan bilgi yoklama.";
    }

    return {
      stars,
      starLabel,
      category,
      placement,
      rationale
    };
  }
}

// Test çalıştırması
if (process.argv[1]?.endsWith('jev_evaluator.mjs')) {
  const auditor = new JevQualityAuditor();
  const sampleQuestion = {
    outcome_code: 'T.8.3.14.03',
    difficulty: 'LGS Yeni Nesil',
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
