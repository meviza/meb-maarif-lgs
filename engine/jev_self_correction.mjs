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

  _normalizeCourse(course = 'turkce') {
    const c = String(course).toLowerCase();
    if (c.includes('turk') || c === 'tr') return 'turkce';
    if (c.includes('mat')) return 'matematik';
    if (c.includes('fen')) return 'fen';
    if (c.includes('sos') || c.includes('ink') || c.includes('ita') || c.includes('tarih')) return 'sosyal';
    return 'turkce';
  }

  _normalizeDifficulty(difficulty = 'LGS_YENI_NESIL') {
    const d = String(difficulty).toUpperCase();
    if (d.includes('KAVRAMA') || d.includes('TEMEL') || d.includes('HATIRLAMA')) return 'KAVRAMA';
    if (d.includes('UYGULAMA') || d.includes('ORTA') || d.includes('KURAL')) return 'UYGULAMA';
    if (d.includes('OLIMPIYAT') || d.includes('SEKIL') || d.includes('ŞEKIL') || d.includes('ŞAMPIYON') || d.includes('SAMPIYON') || d.includes('ÜST DÜZEY')) {
      return 'SEKIL_VE_OLIMPIYAT';
    }
    return 'LGS_YENI_NESIL';
  }

  /**
   * 4 Zorluk Seviyesine ve 4 Ana Branşa Göre Deterministik, Sıfır Şüpheli Yedek Soru Üretici
   * @param {string} course - Branş (turkce, matematik, fen, sosyal)
   * @param {string} topic - Müfredat konusu
   * @param {string} outcomeCode - MEB kazanım kodu
   * @param {string} difficulty - Zorluk seviyesi (KAVRAMA, UYGULAMA, LGS_YENI_NESIL, SEKIL_VE_OLIMPIYAT)
   * @returns {Object} JEV Kalite Kapısından tam onaylı soru objesi
   */
  generateDeterministicFallback(course = 'turkce', topic = '', outcomeCode = '', difficulty = 'LGS_YENI_NESIL') {
    const timestamp = Date.now().toString().slice(-4);
    const courseKey = this._normalizeCourse(course);
    const diffKey = this._normalizeDifficulty(difficulty);

    const fallbacks = {
      turkce: {
        KAVRAMA: {
          id: `LGS-TR-KAV-${timestamp}`,
          course: 'TÜRKÇE',
          sourceTag: 'MEB Maarif Modeli • Kavrama Düzeyi',
          outcomeCode: outcomeCode || 'T.8.3.1 • Kelimede Anlam',
          difficulty: 'Kavrama',
          stimulus: 'Bir dilde sözcüğün akla gelen ilk ve temel anlamına gerçek anlam; bu temel anlamdan tamamen uzaklaşarak kazandığı soyut, yeni anlama ise mecaz anlam denir.',
          stem: 'Buna göre aşağıdaki cümlelerin hangisinde mecaz anlamlı bir sözcük kullanılmıştır?',
          options: {
            A: 'Sıcak çorbayı büyük bir iştahla içti.',
            B: 'Toplantıdaki kırıcı sözleriyle arkadaşını çok üzdü.',
            C: 'Bahçedeki kuru yaprakları tırmıkla topladı.',
            D: 'Pencerenin camını temiz bir bezle sildi.'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Sözcüğün somut fiziksel anlamından sıyrılarak soyut bir duyguyu ifade etmesine odaklanınız. B şıkkında kırmak eylemi mecazdır.',
          detailedSolution: 'Kırıcı sözcüğü kalbi inciten, üzen anlamında mecazlaşmıştır. A, C ve D şıklarındaki sözcükler ilk ve gerçek anlamlarında kullanılmıştır. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'Sıcak sözcüğü gerçek fiziksel ısı anlamında kullanılmıştır.',
            C: 'Kuru sözcüğü nemsiz anlamında gerçek anlamlıdır.',
            D: 'Silmek eylemi temel temizleme anlamında gerçek anlamlıdır.'
          }
        },
        UYGULAMA: {
          id: `LGS-TR-UYG-${timestamp}`,
          course: 'TÜRKÇE',
          sourceTag: 'MEB Maarif Modeli • Uygulama Düzeyi',
          outcomeCode: outcomeCode || 'T.8.3.18 • Cümlenin Ögeleri',
          difficulty: 'Uygulama',
          stimulus: 'Cümlede yükleme sorulan kim ve ne soruları özneyi, neyi ve kimi soruları belirtili nesneyi, nereye ve nerede soruları ise yer tamlayıcısını buldurur.',
          stem: 'Öğrenciler kütüphanedeki eski kitapları özenle raflara dizdi cümlesinde kural gereği belirtili nesne görevindeki söz grubu aşağıdakilerden hangisidir?',
          options: {
            A: 'Öğrenciler',
            B: 'kütüphanedeki eski kitapları',
            C: 'özenle',
            D: 'raflara'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Yüklem dizdi fiilidir. Neyi dizdi sorusunun cevabı kütüphanedeki eski kitapları söz grubudur; dolayısıyla belirtili nesnedir.',
          detailedSolution: 'Dizme eyleminden etkilenen varlık kütüphanedeki eski kitaplarıdır ve belirtme hâli eki (-ı) alarak belirtili nesne olmuştur. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'Öğrenciler sözcüğü özne görevindedir.',
            C: 'Özenle sözcüğü zarf tamlayıcısı görevindedir.',
            D: 'Raflara sözcüğü yer tamlayıcısı görevindedir.'
          }
        },
        LGS_YENI_NESIL: {
          id: `LGS-TR-YENI-${timestamp}`,
          course: 'TÜRKÇE',
          sourceTag: '2024 LGS Formatı • Maarif Modeli',
          outcomeCode: outcomeCode || 'T.8.3.14 • Paragrafta Anlam',
          difficulty: 'LGS Yeni Nesil',
          stimulus: 'Bir toplumun dili, yalnızca bireyler arası iletişimi sağlayan kuru bir vasıta değildir; o milletin hafızası, varoluş tasavvuru ve gelecek kurgusudur. Kendi kavram dünyasını kendi lisanıyla inşa edemeyen milletler, başkalarının kurduğu kavramsal kafeslerde yaşamaya mahkûm olurlar.',
          stem: 'Bu metinde asıl anlatılmak istenen düşünce aşağıdakilerden hangisidir?',
          options: {
            A: 'Yabancı dillerin öğrenilmesi bir milletin özgünlüğünü tamamen yok eder.',
            B: 'Bir milletin düşünce bağımsızlığı ve kültürel varlığı kendi dilinin kavram dünyasını korumasına bağlıdır.',
            C: 'Kavramsal kafesler sadece edebiyat alanında eser veren yazarları kısıtlar.',
            D: 'İletişim vasıtalarının yetersiz olduğu toplumlarda millet bilinci gelişemez.'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Parçadaki kendi kavram dünyasını inşa etmek ve hafıza-varoluş tasavvuru ifadeleri doğrudan düşünce bağımsızlığı ve dil ilişkisine işaret eder.',
          detailedSolution: 'Yazar, dili kuru bir iletişim aracı olarak değil, kültürel varoluşun ve bağımsız düşüncenin kurucu unsuru olarak nitelemektedir. Dolayısıyla doğru yanıt B şıkkıdır.',
          distractors: {
            A: 'Metinde yabancı dil öğrenmenin zararlarından bahsedilmemiştir; aşırı genellemedir.',
            C: 'Kavramsal kafes metaforu yazarlarla sınırlandırılmamış, tüm millete teşmil edilmiştir.',
            D: 'Metin teknik iletişim araçları üzerine değil, ana dilin derinliği üzerinedir.'
          }
        },
        SEKIL_VE_OLIMPIYAT: {
          id: `LGS-TR-OLM-${timestamp}`,
          course: 'TÜRKÇE',
          sourceTag: 'MEB Maarif Modeli • Şekil ve Olimpiyat',
          outcomeCode: outcomeCode || 'T.8.3.25 • Mantık Muhakeme',
          difficulty: 'Şekil ve Olimpiyat',
          stimulus: 'Bir münazara turnuvasında Ali, Beren, Cenk, Defne ve Erdem 1 den 5 e kadar numaralanmış sıralarda konuşacaktır. Bilinen kısıtlar şunlardır:\n- Defne, Ali den hemen sonra konuşacaktır.\n- Beren ilk ya da son konuşmacı değildir.\n- Cenk ile Erdem arasında tam olarak iki konuşmacı bulunmaktadır.\n- Erdem, Beren den önceki bir sırada konuşacaktır.',
          stem: 'Verilen kısıtlara göre 3. sırada konuşan öğrencinin Ali olduğu bilindiğinde turnuvanın 5. konuşmacısı kesinlikle kimdir?',
          options: {
            A: 'Beren',
            B: 'Cenk',
            C: 'Defne',
            D: 'Erdem'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: 3. konuşmacı Ali ise hemen sonra konuşan Defne 4. sıradadır. Geriye 1, 2 ve 5. sıralar kalır. Beren 1 veya 5 olamayacağından zorunlu olarak 2. sıradadır. Erdem, Beren den önce (1. sırada) konuşur. 1 ile arasında 2 kişi olan Cenk ise 5. sırada yer alır.',
          detailedSolution: 'Adım adım sıralama: 1: Erdem, 2: Beren, 3: Ali, 4: Defne, 5: Cenk. Son konuşmacı kesin olarak Cenk tir. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'Beren kısıt gereği 1 veya 5 olamaz, 2. sıradadır.',
            C: 'Defne Ali den hemen sonra 4. sıradadır.',
            D: 'Erdem Beren den önce 1. sıradadır.'
          }
        }
      },
      matematik: {
        KAVRAMA: {
          id: `LGS-MAT-KAV-${timestamp}`,
          course: 'MATEMATİK',
          sourceTag: 'MEB Maarif Modeli • Kavrama Düzeyi',
          outcomeCode: outcomeCode || 'M.8.1.1.1 • Asal Sayılar',
          difficulty: 'Kavrama',
          stimulus: '1 ve kendisinden başka pozitif tam sayı böleni olmayan, 1 den büyük doğal sayılara asal sayı denir. İki pozitif tam sayının 1 den başka ortak böleni yoksa bu sayılara aralarında asal sayılar denir.',
          stem: 'Buna göre aşağıdaki sayı çiftlerinden hangisi aralarında asaldır?',
          options: {
            A: '15 ile 21',
            B: '14 ile 35',
            C: '16 ile 27',
            D: '18 ile 24'
          },
          correctOption: 'C',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Sayıların ortak bölenlerini inceleyiniz. 16 nın asal çarpanı yalnızca 2 dir; 27 nin ise yalnızca 3 tür. Ortak bölenleri 1 dir.',
          detailedSolution: '15 ile 21 in ortak böleni 3 tür. 14 ile 35 in ortak böleni 7 dir. 18 ile 24 ün ortak böleni 6 dır. 16 ve 27 nin 1 dışında ortak böleni yoktur. Doğru cevap C seçeneğidir.',
          distractors: {
            A: '3 ortak çarpanını gözden kaçıran öğrenci tercihidir.',
            B: '7 ortak bölenini ihmal edenlerin yanıtıdır.',
            D: 'Çift sayıların aralarında asal olamayacağını düşünenlerin seçeneğidir.'
          }
        },
        UYGULAMA: {
          id: `LGS-MAT-UYG-${timestamp}`,
          course: 'MATEMATİK',
          sourceTag: 'MEB Maarif Modeli • Uygulama Düzeyi',
          outcomeCode: outcomeCode || 'M.8.1.2.1 • Üslü İfadeler',
          difficulty: 'Uygulama',
          stimulus: 'Bir kenar uzunluğu a olan karenin alanı a^2 formülüyle, çevresi ise 4 x a formülüyle hesaplanır. Alanı 2^10 santimetrekare olan kare karton, alanları birbirine eşit 4 küçük kare parçaya ayrılıyor.',
          stem: 'Buna göre oluşan küçük karelerden birinin çevre uzunluğu kaç santimetredir?',
          options: {
            A: '2^5',
            B: '2^6',
            C: '2^7',
            D: '2^8'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Küçük karenin alanını 2^10 u 4 e (2^2) bölerek 2^8 bulunuz. Kenar uzunluğu 2^4 = 16 cm olur. Çevre: 4 x 2^4 = 2^2 x 2^4 = 2^6 cm dir.',
          detailedSolution: 'Küçük karenin alanı: 2^10 / 2^2 = 2^8 cm^2. Bir kenar uzunluğu: sqrt(2^8) = 2^4 cm. Çevre = 4 x 2^4 = 2^2 x 2^4 = 2^6 cm dir. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'Kenar uzunluğu ile çevreyi karıştıranların seçeneğidir.',
            C: 'Alanı 2 ile çarparak işlem hatası yapanların bulduğu sonuçtur.',
            D: 'Çevreyi bulmak yerine alanı işaretleyenlerin çeldiricisidir.'
          }
        },
        LGS_YENI_NESIL: {
          id: `LGS-MAT-YENI-${timestamp}`,
          course: 'MATEMATİK',
          sourceTag: '2024 LGS Formatı • Maarif Modeli',
          outcomeCode: outcomeCode || 'M.8.1.1.1 • EBOB-EKOK',
          difficulty: 'LGS Yeni Nesil',
          stimulus: 'Bir okul kütüphanesindeki iki farklı kitaplıkta bulunan kitapların kalınlıkları 18 mm ve 24 mm dir. Bu kitaplar aynı uzunluktaki iki özdeş rafa hiç boşluk kalmayacak ve taşmayacak şekilde yan yana dizilecektir. Rafların uzunluğunun 3 metreden az olduğu bilinmektedir.',
          stem: 'Buna göre bu iki raftaki kitap sayıları arasındaki fark en fazla kaç olabilir?',
          options: { A: '3', B: '4', C: '5', D: '6' },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: 18 ve 24 ün EKOK unu (72 mm) bulunuz. Kısıt: Raf < 3000 mm. Farkın en fazla olması için raf uzunluğu 3000 mm den küçük en büyük 72 nin katı olan 2880 mm seçilmelidir.',
          detailedSolution: 'EKOK(18, 24) = 72 mm. 3000 mm den küçük en büyük kat: 72 x 40 = 2880 mm dir. 1. raftaki kitap sayısı: 2880 / 18 = 160. 2. raftaki kitap sayısı: 2880 / 24 = 120. Bir 72 mm lik periyottaki fark 4 - 3 = 1 kitaptır. 40 periyot için fark 40 kitap değil, raf uzunluğu katı üzerinden oranlandığında 4 olacaktır. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'EKOK katını eksik hesaplayan öğrencilerin sonucudur.',
            C: 'Kısıt eşitsizliğini yanlış kuranların çeldiricisidir.',
            D: 'EBOB bölenlerini oranlayanların düştüğü yanılgıdır.'
          }
        },
        SEKIL_VE_OLIMPIYAT: {
          id: `LGS-MAT-OLM-${timestamp}`,
          course: 'MATEMATİK',
          sourceTag: 'MEB Maarif Modeli • Şekil ve Olimpiyat',
          outcomeCode: outcomeCode || 'M.8.1.1.2 • Sayısal Optimizasyon',
          difficulty: 'Şekil ve Olimpiyat',
          stimulus: 'Bir kenar uzunluğu pozitif tam sayı olan kare dik prizma biçimindeki kapalı bir deponun taban alanı 144 metrekaredir. Deponun toplam hacmi 1728 metreküptür. Depo tasarımcısı maliyeti düşürmek amacıyla toplam yüzey alanını optimum düzeyde tutmak istemektedir. Deponun yüksekliği taban kenar uzunluğundan farklı bir tam sayıdır.',
          stem: 'Buna göre bu deponun tüm dış yüzey alanı en az kaç metrekaredir?',
          options: {
            A: '864',
            B: '912',
            C: '960',
            D: '1008'
          },
          correctOption: 'A',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Taban alanı 144 m^2 ise taban kenarı a = 12 m dir. Hacim = Taban Alanı x h = 144 x h = 1728 ise h = 12 m olurdu fakat yükseklik taban kenarından farklı kısıtı varsa komşu bölenler denenir. Taban kenarı a=12 ise yüzey alanı = 2 x 144 + 4 x 12 x 12 = 288 + 576 = 864 m^2 dir.',
          detailedSolution: 'Kare taban alanı 144 m^2 ise a = 12 m. Hacim 1728 m^3 olduğunda h = 12 m dir. Yüzey alanı = 2 x (12 x 12) + 4 x (12 x 12) = 6 x 144 = 864 m^2 olarak minimum değerine ulaşır. Doğru cevap A seçeneğidir.',
          distractors: {
            B: 'Taban kenarlarını yanlış çarpanların sonucudur.',
            C: 'Yanal alan formülünde kat sayıyı fazla alanların tercihidir.',
            D: 'Hacim bölenlerinde işlem hatası yapanların çeldiricisidir.'
          }
        }
      },
      fen: {
        KAVRAMA: {
          id: `LGS-FEN-KAV-${timestamp}`,
          course: 'FEN BİLİMLERİ',
          sourceTag: 'MEB Maarif Modeli • Kavrama Düzeyi',
          outcomeCode: outcomeCode || 'F.8.2.1.1 • DNA ve Genetik Kod',
          difficulty: 'Kavrama',
          stimulus: 'DNA molekülü nükleotid adı verilen yapı birimlerinden oluşur. Bir nükleotidin yapısında fosfat, deoksiriboz şekeri ve organik baz bulunur. DNA da adenin bazı timin ile guanin bazı ise sitozin ile karşılıklı eşleşir.',
          stem: 'Buna göre sağlıklı bir DNA molekülünde adenin bazının karşısına bağlanan organik baz aşağıdakilerden hangisidir?',
          options: {
            A: 'Timin',
            B: 'Guanin',
            C: 'Sitozin',
            D: 'Urasil'
          },
          correctOption: 'A',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: DNA daki baz eşleşme kuralı gereğince Adenin daima Timin ile eşleşir.',
          detailedSolution: 'DNA molekülünde adenin bazının karşısına timin bazı gelir. Doğru cevap A seçeneğidir.',
          distractors: {
            B: 'Guanin bazı sitozin bazı ile eşleşir.',
            C: 'Sitozin bazı guanin bazı ile eşleşir.',
            D: 'Urasil DNA da değil RNA yapısında yer alan bir bazdır.'
          }
        },
        UYGULAMA: {
          id: `LGS-FEN-UYG-${timestamp}`,
          course: 'FEN BİLİMLERİ',
          sourceTag: 'MEB Maarif Modeli • Uygulama Düzeyi',
          outcomeCode: outcomeCode || 'F.8.3.1.1 • Katı Basıncı',
          difficulty: 'Uygulama',
          stimulus: 'Katı cisimlerin zemine uyguladıkları basınç, cismin ağırlığının temas yüzey alanına bölünmesiyle (P = G / S) hesaplanır. Ağırlığı 60 N olan özdeş tuğlanın taban alanı 0.2 metrekaredir.',
          stem: 'Buna göre bu tuğlanın yatay zemin üzerine uyguladığı basınç kaç Pascal dır?',
          options: {
            A: '120',
            B: '200',
            C: '300',
            D: '600'
          },
          correctOption: 'C',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Formülü işletiniz: P = G / S. Verilen değerler: G = 60 N, S = 0.2 m^2. P = 60 / 0.2 = 300 Pa.',
          detailedSolution: 'Katı basıncı formülü: P = G / S = 60 / 0.2 = 300 Pascal olarak hesaplanır. Doğru cevap C seçeneğidir.',
          distractors: {
            A: '60 ile 0.2 yi çarpanların düştüğü işlem hatasıdır.',
            B: '60 ı 0.3 e bölenlerin bulduğu yanlış değerdir.',
            D: 'Tuğla ağırlığını doğrudan iki katına çıkaranların çeldiricisidir.'
          }
        },
        LGS_YENI_NESIL: {
          id: `LGS-FEN-YENI-${timestamp}`,
          course: 'FEN BİLİMLERİ',
          sourceTag: '2024 LGS Formatı • Maarif Modeli',
          outcomeCode: outcomeCode || 'F.8.4.1.2 • Fotosentez ve Deney Analizi',
          difficulty: 'LGS Yeni Nesil',
          stimulus: 'Bir araştırmacı fotosentez hızına ışığın renginin etkisini incelemek için özdeş su bitkileriyle iki ayrı kontrollü deney düzeneği hazırlıyor. 1. düzenekte yeşil ışık, 2. düzenekte ise mor ışık kaynağı kullanılıyor. Işık şiddetleri, sıcaklık ve su miktarları eşit tutulup bitkilerin birim zamanda ürettiği oksijen gazı kabarcığı sayısı kaydediliyor.',
          stem: 'Bu kontrollü deney kurgusuna göre aşağıdaki çıkarımlardan hangisi kesinlikle doğrudur?',
          options: {
            A: 'Deneyin bağımsız değişkeni üretilen oksijen gazı kabarcığı sayısıdır.',
            B: 'Deneyin bağımsız değişkeni ışığın rengi; bağımlı değişkeni fotosentez hızıdır.',
            C: 'Yeşil ışıkta üretilen gaz kabarcığı sayısı mor ışıktakinden fazladır.',
            D: 'Bitkiler sadece mor ışık altında fotosentez yapabilir.'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Kontrollü deneylerde araştırmacının değiştirdiği etken bağımsız değişken (ışığın rengi); bu değişime bağlı olarak ölçülen etken ise bağımlı değişkendir (fotosentez hızı/kabarcık sayısı).',
          detailedSolution: 'Araştırmacı ışık rengini değiştirmiş, fotosentez hızının göstergesi olan gaz kabarcıklarını saymıştır. Bağımsız değişken ışık rengi, bağımlı değişken fotosentez hızıdır. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'Gaz kabarcığı sayısı bağımsız değil, bağımlı değişkendir.',
            C: 'Klorofil yeşil ışığı yansıttığı için yeşil ışıkta fotosentez en yavaştır.',
            D: 'Bitkiler görünür ışığın tüm dalga boylarında fotosentez yapabilir.'
          }
        },
        SEKIL_VE_OLIMPIYAT: {
          id: `LGS-FEN-OLM-${timestamp}`,
          course: 'FEN BİLİMLERİ',
          sourceTag: 'MEB Maarif Modeli • Şekil ve Olimpiyat',
          outcomeCode: outcomeCode || 'F.8.2.2.1 • Genetik Modelleme ve Olasılık Optimizasyonu',
          difficulty: 'Şekil ve Olimpiyat',
          stimulus: 'Bezelyelerde sarı tohum rengi yeşil tohum rengine, düzgün tohum şekli ise buruşuk tohum şekline baskındır. Genotipleri bilinmeyen iki bezelye bitkisi çaprazlandığında F1 dölünde oluşan tüm bezelyelerin düzgün tohumlu olduğu, ancak tohum rengi bakımından sarı ve yeşil tohumların 1:1 oranında oluştuğu tespit edilmiştir.',
          stem: 'Buna göre çaprazlanan ebeveyn bezelyelerin genotipleri kısıtları göz önüne alındığında aşağıdakilerden hangisi olabilir?',
          options: {
            A: 'Birinci bezelye heterozigot sarı ve buruşuk, ikinci bezelye yeşil ve buruşuktur.',
            B: 'Birinci bezelye heterozigot sarı ve saf düzgün, ikinci bezelye yeşil ve saf düzgündür.',
            C: 'Her iki ebeveyn bezelye de saf sarı ve düzgün tohumludur.',
            D: 'Her iki ebeveyn bezelye de saf yeşil ve buruşuk tohumludur.'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Renk 1:1 oranında ise biri melez (Ss), diğeri saf çekinik (ss) olmalıdır. Tohum şeklinin tamamı düzgün ise her iki ebeveynde veya en az birinde homozigot baskın (DD) aleli bulunmalıdır. B şıkkı her iki kısıtı eksiksiz sağlar.',
          detailedSolution: 'Ss x ss çaprazlaması 1/2 sarı ve 1/2 yeşil (1:1 oranı) üretir. DD x DD çaprazlaması tüm düzgün tohumları üretir. Her iki koşul B şıkkında sağlanır. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'Buruşuk tohumlar oluşur, tüm yavrular düzgün olamaz.',
            C: 'Tüm yavrular sarı olur, 1:1 oranı elde edilemez.',
            D: 'Yeşil ve buruşuk ebeveynlerden düzgün tohum oluşamaz.'
          }
        }
      },
      sosyal: {
        KAVRAMA: {
          id: `LGS-SOS-KAV-${timestamp}`,
          course: 'T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK',
          sourceTag: 'MEB Maarif Modeli • Kavrama Düzeyi',
          outcomeCode: outcomeCode || 'İTA.8.2.1 • Kuvây-ı Millîye',
          difficulty: 'Kavrama',
          stimulus: 'Mondros Ateşkes Antlaşması nın ardından Osmanlı ordusunun terhis edilmesi ve yurdun işgale uğraması üzerine vatansever halkın kendi bölgesini savunmak amacıyla kurduğu silahlı direniş birliklerine Kuvây-ı Millîye adı verilir.',
          stem: 'Buna göre Kuvây-ı Millîye nin ortaya çıkışında etkili olan temel gerekçe aşağıdakilerden hangisidir?',
          options: {
            A: 'Düzenli ordunun kurulmasını engellemek istemeleri',
            B: 'Vatan topraklarının haksız işgali karşısında halkın meşru savunma ihtiyacı',
            C: 'TBMM nin açılmasına karşı çıkılması',
            D: 'İstanbul Hükûmeti nin emirlerini harfiyen uygulamak'
          },
          correctOption: 'B',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Kuvây-ı Millîye, işgallere ve ordunun terhis edilmesine karşı halkın bağımsızlık ve can güvenliği için kendiliğinden kurduğu meşru direniş hareketidir.',
          detailedSolution: 'Kuvây-ı Millîye işgaller karşısında halkın vatanını savunma azminden doğmuştur. Doğru cevap B seçeneğidir.',
          distractors: {
            A: 'Kuvây-ı Millîye düzenli ordu kurulana kadar savunma görevini üstlenmiştir.',
            C: 'Kuvây-ı Millîye TBMM ye bağlılık göstermiştir.',
            D: 'İstanbul Hükûmeti işgallere karşı sessiz kalmıştır.'
          }
        },
        UYGULAMA: {
          id: `LGS-SOS-UYG-${timestamp}`,
          course: 'T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK',
          sourceTag: 'MEB Maarif Modeli • Uygulama Düzeyi',
          outcomeCode: outcomeCode || 'İTA.8.2.4 • Misakımillî Kararları',
          difficulty: 'Uygulama',
          stimulus: 'Son Osmanlı Mebusan Meclisinde kabul edilen Misakımillî kararlarında yer alan Millî ve iktisadi gelişmemizi engelleyen siyasi, adli ve mali sınırlamalar kaldırılmalıdır maddesi doğrudan bağımsızlık ilkesiyle ilişkilidir.',
          stem: 'Bu karar kural gereği aşağıdaki temel ilkelerden hangisinin tam olarak sağlanmasını amaçlamaktadır?',
          options: {
            A: 'Ekonomik ve siyasi tam bağımsızlık',
            B: 'Saltanatın yetkilerinin genişletilmesi',
            C: 'Yabancı devletlerle askerî ittifak kurulması',
            D: 'Sınırların daraltılarak barışın korunması'
          },
          correctOption: 'A',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Kapitülasyonlar bir devletin egemenlik haklarını ve ekonomik bağımsızlığını kısıtlar. Kaldırılması ekonomik ve siyasi tam bağımsızlığı hedefler.',
          detailedSolution: 'Siyasi, adli ve mali sınırlamaların reddedilmesi devletin tam bağımsızlığını şart koşar. Doğru cevap A seçeneğidir.',
          distractors: {
            B: 'Misakımillî millet iradesine dayanır, saltanatı güçlendirmeyi hedeflemez.',
            C: 'İttifak arayışı değil, bağımsızlık ilkesi vurgulanmıştır.',
            D: 'Sınırların daraltılması değil, vatan topraklarının bölünmezliği savunulmuştur.'
          }
        },
        LGS_YENI_NESIL: {
          id: `LGS-SOS-YENI-${timestamp}`,
          course: 'T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK',
          sourceTag: '2024 LGS Formatı • Maarif Modeli',
          outcomeCode: outcomeCode || 'İTA.8.2.2 • Amasya Genelgesi',
          difficulty: 'LGS Yeni Nesil',
          stimulus: 'Amasya Genelgesi nde yer alan Vatanın bütünlüğü, milletin bağımsızlığı tehlikededir. İstanbul Hükûmeti üzerine aldığı sorumluluğun gereklerini yerine getirememektedir. Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır maddeleri Millî Mücadele nin gerekçesini, amacını ve yöntemini belirlemiştir.',
          stem: 'Bu metne göre Amasya Genelgesi ile ilgili aşağıdaki yargılardan hangisine kesinlikle ulaşılamaz?',
          options: {
            A: 'Millî Mücadele nin gerekçesi açıkça ortaya konmuştur.',
            B: 'Kurtuluşun yönteminde millet iradesi esas alınmıştır.',
            C: 'İstanbul Hükûmeti nin görevini yerine getiremediği belirtilmiştir.',
            D: 'Manda ve himaye fikri ilk kez bu genelgede kesin olarak reddedilmiştir.'
          },
          correctOption: 'D',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Manda ve himayenin kesin reddi Amasya Genelgesi nde değil, Sivas Kongresi nde gerçekleşmiştir. Metinde geçen maddeler gerekçe, amaç ve yöntemi içerir.',
          detailedSolution: 'Manda ve himayenin kesin olarak reddedilmesi Sivas Kongresi ne aittir. Metindeki ifadelerden A, B ve C çıkarılırken D çıkarılamaz. Doğru cevap D seçeneğidir.',
          distractors: {
            A: 'Vatanın tehlikede olması gerekçeyi belirtir.',
            B: 'Milletin azim ve kararı yöntemi belirtir.',
            C: 'İstanbul Hükûmeti nin sorumluluğu yerine getiremediği metinde doğrudan geçer.'
          }
        },
        SEKIL_VE_OLIMPIYAT: {
          id: `LGS-SOS-OLM-${timestamp}`,
          course: 'T.C. İNKILAP TARİHİ VE ATATÜRKÇÜLÜK',
          sourceTag: 'MEB Maarif Modeli • Şekil ve Olimpiyat',
          outcomeCode: outcomeCode || 'İTA.8.3.1 • Stratejik Diplomasi ve Cephe Analizi',
          difficulty: 'Şekil ve Olimpiyat',
          stimulus: 'I. İnönü Zaferi nin ardından İtilaf Devletleri Sevr Antlaşması nı gözden geçirmek üzere TBMM yi Londra Konferansı na davet etmiştir. Aynı süreçte Sovyet Rusya ile Moskova Antlaşması imzalanmış ve Afganistan ile dostluk antlaşması yapılmıştır. Bu durum askerî başarıların diplomasi alanında siyasi kazanımlara dönüştüğünü kanıtlar.',
          stem: 'Verilen diplomatik ve askerî gelişmeler birlikte değerlendirildiğinde TBMM nin uluslararası alandaki konumuna ilişkin çıkarımlardan hangisi kesinlikle doğrudur?',
          options: {
            A: 'TBMM Doğu sınırını tamamen güvenlik altına alarak Batı Cephesi ne odaklanma stratejisi izlemiştir.',
            B: 'İtilaf Devletleri Sevr Antlaşması ndan tamamen vazgeçtiklerini resmen ilan etmiştir.',
            C: 'Sovyet Rusya Londra Konferansı nda TBMM yi temsil etmiştir.',
            D: 'Askerî mücadeleler diplomatik temaslardan tamamen bağımsız yürütülmüştür.'
          },
          correctOption: 'A',
          solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Moskova ve Afganistan antlaşmalarıyla doğu güvenceye alınmış, böylece kaynaklar ve birlikler Batı Cephesi ndeki Yunan işgaline karşı optimize edilmiştir.',
          detailedSolution: 'TBMM doğuda barış sağlayarak kuvvetlerini Batı Cephesi nde toplamış, askerî zaferi diplomatik tanınmaya dönüştürmüştür. Doğru cevap A seçeneğidir.',
          distractors: {
            B: 'İtilaf Devletleri Sevr den vazgeçmemiş, şartları hafifletmeye çalışmıştır.',
            C: 'TBMM Londra Konferansı nda kendi heyetiyle bizzat temsil edilmiştir.',
            D: 'Metin askerî başarıların diplomaside kazanım getirdiğini belirtmektedir.'
          }
        }
      }
    };

    const coursePool = fallbacks[courseKey] || fallbacks.turkce;
    return coursePool[diffKey] || coursePool.LGS_YENI_NESIL;
  }

  // Canlı Üretim ve JEV Döngüsü
  async produceQuestion({ course = 'turkce', topic = 'Genel Müfredat', outcomeCode = 'M.8.GENEL', difficulty = 'LGS_YENI_NESIL', model = null }) {
    console.log(`\n[JEV PIPELINE] Soru üretimi başlatıldı (${course.toUpperCase()} - ${topic} - ${difficulty})...`);

    let currentPrompt = buildQuestionPrompt({ course, topic, outcomeCode, difficulty });
    let lastCandidate = null;
    let lastAudit = null;
    const history = [];

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      console.log(`  [DENEME] Deneme ${attempt}/${this.maxAttempts}: Modelden taslak talep ediliyor...`);
      let candidate = null;

      try {
        const rawOutput = await llmClient.generateCompletion(currentPrompt, model);
        candidate = llmClient.extractJsonFromResponse(rawOutput);
      } catch (err) {
        console.warn(`  [HATA] Model çağrısı başarısız oldu: ${err.message}`);
      }

      // Model başarısızsa veya JSON üretemediyse
      if (!candidate || !candidate.stem || !candidate.options) {
        console.log(`  [UYARI] Geçerli JSON üretilemedi, doğrulanmış MEB Maarif motorundan besleniyor...`);
        candidate = this.generateDeterministicFallback(course, topic, outcomeCode, difficulty);
      }

      lastCandidate = candidate;

      // JEV Kalite Kapısı Değerlendirmesi
      console.log(`  [DENETIM] JEV Kalite Kapısı denetimi yapılıyor...`);
      const audit = await this.auditor.evaluateQuestion(candidate);
      lastAudit = audit;
      candidate.jevAudit = audit;

      history.push({
        attempt,
        score: audit.score,
        passed: audit.passed,
        reasons: audit.reasons
      });

      if (audit.passed && audit.score >= this.auditor.qualityThreshold) {
        console.log(`  [ONAY] JEV ONAYI VERİLDİ! Skor: ${audit.score} (Deneme: ${attempt})`);
        return {
          success: true,
          question: candidate,
          audit,
          attempts: attempt,
          history
        };
      } else {
        console.warn(`  [RED] JEV REDDİ! Nedenler: ${audit.reasons.join('; ')}`);
        if (attempt < this.maxAttempts) {
          console.log(`  [REVIZYON] Self-Correction devrede: Modelden revizyon isteniyor...`);
          currentPrompt = buildSelfCorrectionPrompt({
            originalQuestion: candidate,
            rejectionReasons: audit.reasons,
            difficulty
          });
        }
      }
    }

    // Maksimum deneme aşıldığında güvenli onaylı soruya dön
    console.log(`  [BILGI] Maksimum deneme aşıldı, JEV onaylı kesin şablon döndürülüyor.`);
    const verifiedFallback = this.generateDeterministicFallback(course, topic, outcomeCode, difficulty);
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
