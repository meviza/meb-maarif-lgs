/**
 * MEB Maarif LGS Platformu - Prompt Mühendisliği ve Şablon Motoru (Faz 4)
 * Türkiye Yüzyılı Maarif Modeli Pedagojik Yönergeleri ve Bloom Analiz Standartları
 */

// 4 Kademeli Zorluk Seviyesi Tanımları
export const DIFFICULTY_LEVELS = {
  KAVRAMA: {
    code: 'KAVRAMA',
    label: 'Kavrama (Temel)',
    description: 'Temel / Hatırlama-Kavrama: Tek adımlı kurallar, net tanımlar, doğrudan kavram yoklama.',
    cognitiveDemand: 'Düşük bilişsel karmaşıklık, doğrudan kural ve tanım hatırlama.',
    bloom: 'UNDERSTAND'
  },
  UYGULAMA: {
    code: 'UYGULAMA',
    label: 'Uygulama (Orta)',
    description: 'Orta: Kural ve formül işletimi, standart problem çözme, doğrudan veri işleme.',
    cognitiveDemand: 'Orta bilişsel karmaşıklık, formül veya yöntem uygulama, işlem yürütme.',
    bloom: 'APPLY'
  },
  LGS_YENI_NESIL: {
    code: 'LGS_YENI_NESIL',
    label: 'LGS Yeni Nesil (İleri / MEB Standart)',
    description: 'İleri / MEB LGS Standart: Çoklu öncül, grafik/deney analizi, mantık-muhakeme, hipotez kurma.',
    cognitiveDemand: 'Yüksek bilişsel karmaşıklık, bağlamsal analiz, çıkarım ve eleştirel değerlendirme.',
    bloom: 'ANALYZE'
  },
  SEKIL_VE_OLIMPIYAT: {
    code: 'SEKIL_VE_OLIMPIYAT',
    label: 'Şekil ve Olimpiyat (Üst Düzey / Şampiyon)',
    description: 'Üst Düzey / Şampiyon: Çok adımlı optimizasyon, soyut modelleme, sıra dışı kurgu, en yüksek ayırt edicilik.',
    cognitiveDemand: 'Maksimum bilişsel yük, çok adımlı kısıt optimizasyonu ve derin sentez.',
    bloom: 'EVALUATE'
  }
};

export const MEB_SYSTEM_INSTRUCTIONS = `Sen, Millî Eğitim Bakanlığı (MEB) Ölçme, Değerlendirme ve Sınav Hizmetleri Genel Müdürlüğü (ÖDSGM) soru yazım komisyonunda görevli başuzman bir eğitim bilimcisin.

GÖREVİN:
8. Sınıf Liselere Geçiş Sistemi (LGS) ve "Türkiye Yüzyılı Maarif Modeli"ne %100 uyumlu, yüksek ayırt ediciliğe sahip, halüsinasyonsuz, tek ve kesin doğru cevabı olan sorular hazırlamaktır.

4 KADEMELİ ZORLUK SEVİYELERİ:
1. KAVRAMA (Temel / Hatırlama-Kavrama): Tek adımlı kurallar, net tanımlar ve temel kavram bilgisi.
2. UYGULAMA (Orta): Kural ve formül işletimi, standart işlem adımları ve doğrudan uygulama.
3. LGS_YENI_NESIL (İleri / MEB LGS Standart): Çoklu öncül, grafik/deney analizi, mantık-muhakeme, hipotez kurma ve gerçek yaşam senaryosu.
4. SEKIL_VE_OLIMPIYAT (Üst Düzey / Şampiyon): Çok adımlı optimizasyon (en az/en fazla), kısıt yönetimi, sıra dışı kurgu ve üst düzey ayırt edicilik.

PEDAGOJİK VE TEKNİK KURALLAR:
1. BLOOM TAKSONOMİSİ VE BİLİŞSEL YÜK: İstenen zorluk seviyesine uygun bilişsel düzey (UNDERSTAND, APPLY, ANALYZE, EVALUATE) eksiksiz sağlanmalıdır.
2. ÖNCÜL VE BAĞLAM (STIMULUS):
   - Türkçe: Günlük hayatla ilişkili, edebî derinliği olan, felsefi veya bilimsel güncel bir metin içermelidir.
   - Matematik: Gerçek hayat senaryosu, geometrik veya mantıksal modelleme, net kısıtlar (ör. tam sayı, minimum/maksimum) içermelidir.
   - Fen Bilimleri: Bağımlı-bağımsız değişken kontrollü deney, grafik/tablo veya doğa olayı mekanizması içermelidir.
   - T.C. İnkılap Tarihi: Tarihî belge, Mustafa Kemal Atatürk'ün sözü veya sebep-sonuç ilişkisini irdeleyen olay analizi olmalıdır.
3. SIFIR ŞÜPHE VE TEREDDÜT İLKESİ:
   - Doğru cevap tek, mutlak ve tartışmasız olmalıdır. Şıklar arasında çelişki veya çift cevap ihtimali kesinlikle bulunmamalıdır.
   - Soru kökünde ve seçeneklerde 'belki', 'çoğu zaman', 'olabilir gibi' gibi muğlak, göreceli ve öznel ifadelere asla yer verilmez.
   - Sayısal ve mantıksal seçenekler birbirinden tamamen ayrık (disjoint) olmalı; birbirini kapsamamalı ve çakışmamalıdır.
4. ÇELDİRİCİ MÜHENDİSLİĞİ:
   - Yanlış şıklar (A, B, C veya D) rastgele olamaz; öğrencinin yapabileceği tipik kavram yanılgılarını (misconception) hedeflemelidir.
   - Her çeldiricinin pedagojik açıklaması mutlaka belirtilmelidir.
5. ÇÖZÜM REHBERİ: Öğrencinin kavramı öğrenmesini sağlayacak "Uzman Öğretmen Stratejisi" ve adım adım çözüm eklenmelidir.
6. ÇIKTI FORMATI: Yalnızca ve kesinlikle geçerli bir JSON objesi üret. Markdown veya açıklama metni ekleme.`;

export function buildQuestionPrompt({ course, topic, outcomeCode, difficulty = 'LGS_YENI_NESIL' }) {
  const diffInfo = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.LGS_YENI_NESIL;

  return `${MEB_SYSTEM_INSTRUCTIONS}

HEDEF DERS: ${course.toUpperCase()}
MÜFREDAT KONUSU: ${topic}
KAZANIM KODU: ${outcomeCode || 'LGS-KAZANIM-01'}
ZORLUK SEVİYESİ: ${diffInfo.code} (${diffInfo.label} - ${diffInfo.description})

İSTENEN JSON ŞEMASI:
{
  "id": "LGS-${course.slice(0, 3).toUpperCase()}-AI-${Date.now().toString().slice(-4)}",
  "course": "${course.toUpperCase()}",
  "sourceTag": "2024 LGS Formatı • Yapay Zekâ Destekli Soru Üretimi",
  "outcomeCode": "${outcomeCode || 'MEB.8.KAZANIM'}",
  "difficulty": "${diffInfo.label}",
  "stimulus": "Öncül metni, paragraf, deney veya modelleme kurgusu...",
  "stem": "Soru kökü (ör. Buna göre ... çıkarımlardan hangisi kesinlikle doğrudur?)",
  "options": {
    "A": "Seçenek metni A",
    "B": "Seçenek metni B",
    "C": "Seçenek metni C",
    "D": "Seçenek metni D"
  },
  "correctOption": "C",
  "solutionStrategy": "UZMAN ÖĞRETMEN STRATEJİSİ: ...",
  "detailedSolution": "Adım adım net çözüm...",
  "distractors": {
    "A": "A şıkkının hedeflediği kavram yanılgısı...",
    "B": "B şıkkının hedeflediği mantık hatası...",
    "D": "D şıkkının hedeflediği aşırı genelleme..."
  }
}

Lütfen sadece yukarıdaki JSON formatında yanıt ver:`;
}

export function buildSelfCorrectionPrompt({ originalQuestion, rejectionReasons, difficulty = 'LGS_YENI_NESIL' }) {
  const reasonsText = Array.isArray(rejectionReasons) && rejectionReasons.length > 0
    ? rejectionReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : '1. Soru kalite standartlarını karşılamadı; sıfır şüphe ve tek kesin cevap kriterlerine uyunuz.';

  return `${MEB_SYSTEM_INSTRUCTIONS}

DİKKAT: Daha önce ürettiğin soru taslağı, JEV System-1 Kalite Denetim Kapısı tarafından incelendi ve aşağıdaki kritik denetim gerekçeleriyle REDDEDİLDİ:
${reasonsText}

HEDEF ZORLUK SEVİYESİ: ${difficulty}

ÖNCEKİ KUSURLU SORU TASLAĞI:
${JSON.stringify(originalQuestion, null, 2)}

GÖREVİN VE DÜZELTME TALİMATLARI:
1. Yukarıdaki tüm ret sebeplerini (özellikle muğlak ifadeler, seçenek çakışmaları veya zorluk seviyesi uyumsuzluğu) teker teker gider.
2. SIFIR ŞÜPHE İLKESİ: Soru kökünü ve seçenekleri tamamen deterministik, ayrık (disjoint) ve tartışmasız hâle getir. 'Belki', 'çoğu zaman', 'olabilir gibi' türünden muğlak ifadeleri derhal kaldır.
3. Çeldiricileri öğrenci yanılgılarına göre yeniden kurgula ve her çeldiricinin gerekçesini eksiksiz yaz.
4. Çözüm stratejisi ve detaylı çözümü pedagojik açıklamayla güçlendir.

Yalnızca düzeltilmiş geçerli JSON objesini üret:`;
}
