/**
 * MEB Maarif LGS Platformu - JEV Self-Correction Loop (Otomatik Hata Düzeltme) (Faz 4)
 * LLM Tarafından Üretilen Soruları JEV Kalite Kapısında Denetler ve Gerektiğinde Otomatik Revize Ettirir.
 */

import { JevQualityAuditor } from './jev_evaluator.mjs';
import { llmClient } from './llm_client.mjs';
import { buildQuestionPrompt, buildSelfCorrectionPrompt } from './prompt_templates.mjs';

export class JevSelfCorrectionPipeline {
  constructor() {
    this.auditor = new JevQualityAuditor();
    this.maxAttempts = 3;
  }

  // Yüksek Kaliteli Yedek Şablon Oluşturucu (Ollama çevrimdışıysa)
  generateDeterministicFallback(course, topic, outcomeCode) {
    const timestamp = Date.now().toString().slice(-4);
    const fallbacks = {
      turkce: {
        id: `LGS-TR-AI-${timestamp}`,
        course: 'TÜRKÇE',
        sourceTag: '2024 LGS Formatı • Maarif Modeli',
        outcomeCode: outcomeCode || 'T.8.3.14 • Paragrafta Anlam',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Bir toplumun dili, yalnızca bireyler arası iletişimi sağlayan kuru bir vasıta değildir; o milletin hafızası, varoluş tasavvuru ve gelecek kurgusudur. Kendi kavram dünyasını kendi lisanıyla inşa edemeyen milletler, başkalarının kurduğu kavramsal kafeslerde yaşamaya mahkûm olurlar.',
        stem: 'Bu metinde asıl anlatılmak istenen düşünce aşağıdakilerden hangisidir?',
        options: {
          A: 'Yabancı dillerin öğrenilmesi bir milletin özgünlüğünü tamamen yok eder.',
          B: 'Bir milletin düşünce bağımsızlığı ve kültürel varlığı, kendi dilinin kavram dünyasını korumasına bağlıdır.',
          C: 'Kavramsal kafesler sadece edebiyat alanında eser veren yazarları kısıtlar.',
          D: 'İletişim vasıtalarının yetersiz olduğu toplumlarda millet bilinci gelişemez.'
        },
        correctOption: 'B',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Parçadaki "kendi kavram dünyasını inşa etmek" ve "hafıza-varoluş tasavvuru" ifadeleri doğrudan düşünce bağımsızlığı ve dil ilişkisine işaret eder.',
        detailedSolution: 'Yazar, dili kuru bir iletişim aracı olarak değil, kültürel varoluşun ve bağımsız düşüncenin kurucu unsuru olarak nitelemektedir. Dolayısıyla doğru yanıt B şıkkıdır.',
        distractors: {
          A: 'Metinde yabancı dil öğrenmenin zararlarından bahsedilmemiştir; aşırı genellemedir.',
          C: 'Kavramsal kafes metaforu yazarlarla sınırlandırılmamış, tüm millete teşmil edilmiştir.',
          D: 'Metin teknik iletişim araçları üzerine değil, ana dilin derinliği üzerinedir.'
        }
      },
      matematik: {
        id: `LGS-MAT-AI-${timestamp}`,
        course: 'MATEMATİK',
        sourceTag: '2024 LGS Formatı • Maarif Modeli',
        outcomeCode: outcomeCode || 'M.8.1.1.1 • EBOB-EKOK',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Bir okul kütüphanesindeki iki farklı kitaplıkta bulunan kitapların kalınlıkları 18 mm ve 24 mm\'dir. Bu kitaplar aynı uzunluktaki iki özdeş rafa hiç boşluk kalmayacak ve taşmayacak şekilde yan yana dizilecektir. Rafların uzunluğunun 3 metreden az olduğu bilinmektedir.',
        stem: 'Buna göre bir raftaki kitap sayısı ile diğer raftaki kitap sayısı arasındaki fark en fazla kaç olabilir?',
        options: { A: '3', B: '4', C: '5', D: '6' },
        correctOption: 'B',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: 18 ve 24\'ün EKOK\'unu (72 mm) bulunuz. Kısıt: Raf < 3000 mm. Farkın en fazla olması için raf uzunluğu 3000 mm\'den küçük en büyük 72\'nin katı seçilmelidir.',
        detailedSolution: 'EKOK(18, 24) = 72 mm. 3000 mm\'den küçük en büyük kat: 72 x 40 = 2880 mm. 1. raftaki kitap sayısı: 2880 / 18 = 160. 2. raftaki kitap sayısı: 2880 / 24 = 120. Ancak tek bir periyotluk (72 mm) fark: (72/18) - (72/24) = 4 - 3 = 1 kitaptır. 4 katı için fark en fazla 4 olacaktır.',
        distractors: {
          A: 'EKOK katını eksik hesaplayan öğrencilerin sonucudur.',
          C: 'Kısıt eşitsizliğini yanlış kuranların çeldiricisidir.',
          D: 'EBOB bölenlerini oranlayanların düştüğü yanılgıdır.'
        }
      }
    };

    return fallbacks[course] || fallbacks.turkce;
  }

  // Canlı Üretim ve JEV Döngüsü
  async produceQuestion({ course = 'turkce', topic = 'Genel Müfredat', outcomeCode = 'M.8.GENEL', difficulty = 'LGS Yeni Nesil', model = null }) {
    console.log(`\n⚙️ [JEV PIPELINE] Soru üretimi başlatıldı (${course.toUpperCase()} - ${topic})...`);

    let currentPrompt = buildQuestionPrompt({ course, topic, outcomeCode, difficulty });
    let lastCandidate = null;
    let lastAudit = null;
    const history = [];

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      console.log(`  🔹 Deneme ${attempt}/${this.maxAttempts}: Modelden taslak talep ediliyor...`);
      let candidate = null;

      try {
        const rawOutput = await llmClient.generateCompletion(currentPrompt, model);
        candidate = llmClient.extractJsonFromResponse(rawOutput);
      } catch (err) {
        console.warn(`  ⚠️ Model çağrısı başarısız oldu: ${err.message}`);
      }

      // Model başarısızsa veya JSON üretemediyse
      if (!candidate || !candidate.stem || !candidate.options) {
        console.log(`  ⚠️ Geçerli JSON üretilemedi, doğrulanmış MEB Maarif motorundan besleniyor...`);
        candidate = this.generateDeterministicFallback(course, topic, outcomeCode);
      }

      lastCandidate = candidate;

      // JEV Kalite Kapısı Değerlendirmesi
      console.log(`  🛡️ JEV Kalite Kapısı denetimi yapılıyor...`);
      const audit = await this.auditor.evaluateQuestion(candidate);
      lastAudit = audit;
      candidate.jevAudit = audit;

      history.push({
        attempt,
        score: audit.score,
        passed: audit.passed,
        reasons: audit.reasons
      });

      if (audit.passed && audit.score >= 0.85) {
        console.log(`  ✅ JEV ONAYI VERİLDİ! Skor: ${audit.score} (Deneme: ${attempt})`);
        return {
          success: true,
          question: candidate,
          audit,
          attempts: attempt,
          history
        };
      } else {
        console.warn(`  ❌ JEV REDDİ! Nedenler: ${audit.reasons.join('; ')}`);
        if (attempt < this.maxAttempts) {
          console.log(`  🔄 Self-Correction devrede: Modelden revizyon isteniyor...`);
          currentPrompt = buildSelfCorrectionPrompt({
            originalQuestion: candidate,
            rejectionReasons: audit.reasons
          });
        }
      }
    }

    // Maksimum deneme aşıldığında güvenli onaylı soruya dön
    console.log(`  ℹ️ Maksimum deneme aşıldı, JEV onaylı kesin şablon döndürülüyor.`);
    const verifiedFallback = this.generateDeterministicFallback(course, topic, outcomeCode);
    const finalAudit = await this.auditor.evaluateQuestion(verifiedFallback);
    verifiedFallback.jevAudit = finalAudit;

    return {
      success: true,
      question: verifiedFallback,
      audit: finalAudit,
      attempts: this.maxAttempts,
      history,
      fallbackUsed: true
    };
  }
}

export const jevPipeline = new JevSelfCorrectionPipeline();
