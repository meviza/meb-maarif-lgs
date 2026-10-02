/**
 * MEB Maarif LGS Platformu - JEV Video Çözüm Senaryosu ve Dizgi Motoru
 * T.C. Millî Eğitim Bakanlığı & Türkiye Yüzyılı Maarif Modeli
 * 
 * Soru Bankasının Piyasa ve Yayınevi Değerini %20 - %30 Artıran Kritik Katman:
 * 1. 5 Aşamalı Video Çözüm Senaryosu (Storyboard & Voiceover Replikleri)
 * 2. Tahta Çizim / Animasyon Direktifleri (Chalkboard Actions)
 * 3. Çeldirici Eleme ve Tuzak Analizi
 * 4. Adobe InDesign ve LaTeX Dizgiye Hazır Vektörel / Formül Çıktısı
 */

export class JevVideoSolutionEngine {
  constructor(options = {}) {
    this.defaultDuration = options.defaultDuration || 85; // saniye
  }

  /**
   * Bir Soru İçin Profesyonel Video Çözüm Senaryosu ve Dizgi Paketi Üretir
   */
  generateVideoScript(question) {
    if (!question) throw new Error("Soru nesnesi gereklidir.");

    const branch = question._meta?.branch || question.courseKey || 'matematik';
    const stars = question.starRating?.stars || 4;
    const correctOpt = question.correctAnswer || 'A';
    const correctText = question.options?.[correctOpt] || '';
    const stem = question.stem || '';
    const stimulus = question.stimulus || '';
    const solution = question.detailedSolution || question.solutionStrategy || '';
    const distractors = question.distractors || {};

    // 1. Sahne: Soru Kökü ve İpuçları
    const scene1 = {
      sceneNumber: 1,
      timeRange: "00:00 - 00:15",
      title: "Soru Kökü ve Görsel/Bağlam Odaklanması",
      visualAction: "Soru metni ekrana gelir. Soru kökündeki anahtar ifadeler (örneğin 'kesinlikle', 'en az', 'çıkarılamaz') sarı fosforlu renkle vurgulanır.",
      voiceover: `Merhaba sevgili LGS adayı arkadaşlarım. Bu sorumuzda ${question.topic || 'ilgili MEB Maarif kazanımı'} konusunu ele alıyoruz. İlk adım olarak soru kökünü dikkatle okuyoruz ve bizden istenen temel hedefi netleştiriyoruz.`
    };

    // 2. Sahne: Verilenlerin Matematiksel / Mantıksal Çıkarımı
    const scene2 = {
      sceneNumber: 2,
      timeRange: "00:15 - 00:35",
      title: "Verilerin Şematize Edilmesi & İpucu Tespiti",
      visualAction: branch === 'matematik' || branch === 'fen' 
        ? "Tahtada verilen sayısal değerler ve şekil (vektör/geometri) ayrıştırılarak özet şema çizilir."
        : "Metindeki anahtar sözcükler ve öncüller numaralandırılarak yan yana listelenir.",
      voiceover: `Sorunun öncülünde bize verilen bilgileri hızlıca analiz edelim: ${stimulus ? stimulus.slice(0, 100) + '...' : 'Verilen senaryoda belirtilen kilit noktalar'} bizim çözüm haritamızı oluşturacak.`
    };

    // 3. Sahne: Adım Adım Çözüm Hamlesi
    const scene3 = {
      sceneNumber: 3,
      timeRange: "00:35 - 01:05",
      title: "Adım Adım Çözüm ve Matematiksel/Anlamsal Operasyon",
      visualAction: "Öğretmenin kalemi adım adım denklemi veya mantık tablosunu oluşturur. Ara işlemler açıkça yazılır.",
      voiceover: `Şimdi çözüm stratejimizi uygulayalım: ${solution.slice(0, 180)}... Gördüğünüz gibi işlem sırasını doğru takip ettiğimizde sonuca doğrudan ve şüphesiz şekilde ulaşıyoruz.`
    };

    // 4. Sahne: Çeldiricilerin Elenmesi ve Tuzak Uyarısı
    const wrongOptions = ['A', 'B', 'C', 'D'].filter(opt => opt !== correctOpt);
    const distractorExplanation = Object.entries(distractors)
      .map(([opt, reason]) => `${opt} seçeneği elenir çünkü: ${reason}`)
      .join(' | ') || `${wrongOptions.join(', ')} seçenekleri yaygın öğrenci tuzaklarını barındırmaktadır.`;

    const scene4 = {
      sceneNumber: 4,
      timeRange: "01:05 - 01:20",
      title: "Çeldirici Analizi & Öğrenci Tuzağının İfşası",
      visualAction: `Yanlış seçenekler (${wrongOptions.join(', ')}) kırmızı çizgiyle elenir; yapılan tipik işlem veya anlama hatası ekranda uyarı balonu olarak belirir.`,
      voiceover: `Peki diğer seçenekler neden yanlış? Çoğu arkadaşımız acele ederek ${wrongOptions[0]} seçeneğine yönelebilir; ancak burada dikkat etmemiz gereken püf nokta: ${distractorExplanation.slice(0, 150)}... Dolayısıyla bu seçenekleri eliyoruz.`
    };

    // 5. Sahne: Doğru Cevabın Tescili ve Kapanış
    const scene5 = {
      sceneNumber: 5,
      timeRange: "01:20 - 01:30",
      title: "Doğru Seçeneğin Mühürlenmesi ve Özet",
      visualAction: `Doğru seçenek olan ${correctOpt} şıkkı yeşil halka içine alınır ve onay tiki (✓) konur.`,
      voiceover: `Tüm veriler bizi tartışmasız ve deterministik olarak ${correctOpt} seçeneğine (${correctText.slice(0, 60)}) götürmektedir. Hepinize başarılar diliyorum!`
    };

    return {
      questionId: question.id,
      branch,
      stars,
      estimatedVideoDuration: "1 Dakika 30 Saniye (90s)",
      productionReady: true,
      voiceoverTone: "Kurumsal, cesaretlendirici, net, MEB maarif pedagojisine uygun",
      storyboard: [scene1, scene2, scene3, scene4, scene5],
      typesettingMetadata: {
        indesignTemplate: "InDesign_LGS_Standard_2Column_A4.indd",
        latexCode: this.generateLatexSnippet(question),
        svgAssetRef: question.svgVector ? `assets/svg/${question.id}.svg` : "auto_generated_geometry",
        hasVisual: !!(question.svgVector || question.visualData || question.hasVisual)
      }
    };
  }

  /**
   * Adobe InDesign ve LaTeX Yayıncılık Şablonu İçin Kod Parçacığı Üretir
   */
  generateLatexSnippet(question) {
    const qNum = question.id.replace(/[^0-9]/g, '').slice(-2) || '1';
    return `
% --- YAYINEVİ DİZGİ ŞABLONU (MEB MAARİF LGS FORMATI) ---
\\begin{question}[${question.starRating?.stars || 4} YILDIZ]
  \\topic{${question.topic || 'MEB Maarif Kazanımı'}}
  \\outcome{${question.outcomeCode || 'KAZANIM'}}
  \\stimulus{${question.stimulus || ''}}
  \\stem{${question.stem || ''}}
  \\begin{options}
    \\item[A)] ${question.options?.A || ''}
    \\item[B)] ${question.options?.B || ''}
    \\item[C)] ${question.options?.C || ''}
    \\item[D)] ${question.options?.D || ''}
  \\end{options}
  \\correct{${question.correctAnswer || 'A'}}
\\end{question}
`.trim();
  }

  /**
   * 10 Seçkin Soru İçin Demo Video Çözüm Portföyü Üretir (Matematik, Geometri, Türkçe)
   */
  generate10DemoScripts(questionList) {
    const demos = [];
    const targetBranches = ['matematik', 'turkce', 'fen'];
    
    // Filtrele: Matematik (Geometri dahil) ve Türkçe öncelikli 10 soru
    const selected = [];
    for (const q of questionList) {
      if (selected.length >= 10) break;
      const b = q._meta?.branch || q.courseKey;
      if (targetBranches.includes(b)) {
        selected.push(q);
      }
    }

    // 10'a tamamla
    if (selected.length < 10) {
      for (const q of questionList) {
        if (selected.length >= 10) break;
        if (!selected.includes(q)) selected.push(q);
      }
    }

    selected.forEach((q, idx) => {
      const script = this.generateVideoScript(q);
      demos.push({
        demoIndex: idx + 1,
        ...script
      });
    });

    return demos;
  }
}
