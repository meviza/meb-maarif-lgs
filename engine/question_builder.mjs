/**
 * MEB Maarif LGS Platformu - Soru Üretim ve Derleme Fabrikası (Question Builder & Compiler)
 * Çoklu Ajan Tarafından Üretilen Tüm Soruları Birleştirir ve JEV ile Denetler
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JevQualityAuditor } from './jev_evaluator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadAndMergeAllQuestions() {
  const generatedDir = path.join(__dirname, '..', 'data', 'generated');
  const mergedBank = {
    turkce: [],
    matematik: [],
    fen: [],
    sosyal: []
  };

  // 1. Temel Çekirdek Sorular
  const baseQuestions = {
    turkce: [
      {
        id: 'LGS-TR-01',
        course: 'TÜRKÇE',
        outcomeCode: 'T.8.3.14.03 • Akışı Bozan Cümle',
        difficulty: 'LGS Yeni Nesil',
        stimulus: '(I) Yapay zekâ destekli klinik tanı sistemleri, tıp dünyasında hekimlerin en kritik karar destek mekanizması hâline gelmiştir. (II) Milyonlarca vaka ve radyolojik görüntüyü saniyeler içinde tarayan bu algoritmalar, insan gözünün kaçırabileceği mikroskobik doku anomalilerini yüksek hassasiyetle saptayabilmektedir. (III) Hastane binalarının mimari tasarımında doğal ışık kullanımının artırılması, ameliyat sonrası hasta nekahet süresini belirgin şekilde kısaltmaktadır. (IV) Hekimin klinik tecrübesiyle yapay zekânın devasa veri işleme kabiliyeti harmanlandığında, teşhis hataları en aza inmekte ve tedavi başarısı katlanmaktadır.',
        stem: 'Bu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
        options: { A: 'I', B: 'II', C: 'III', D: 'IV' },
        correctOption: 'C',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Parçanın omurgasını oluşturan anahtar kavramları (Yapay zekâ, klinik tanı, teşhis) takip edin. Konunun aniden hastane mimarisine saptığı cümleyi yakalayın.',
        detailedSolution: 'I, II ve IV. cümleler yapay zekânın hekim teşhislerindeki teknolojik katkısını işlerken, III. cümle bağlam dışına çıkıp hastane mimarisinden söz etmektedir. Dolayısıyla III. cümle akışı bozar.',
        distractors: {
          A: 'I. cümle giriş cümlesidir; konuyu tanımlar.',
          B: 'II. cümle I. cümlenin mantıksal devamıdır; algoritmanın gücünü açıklar.',
          D: 'IV. cümle teknolojiyi hekim tecrübesiyle bağlayıp ana fikri tamamlar.'
        }
      },
      {
        id: 'LGS-TR-02',
        course: 'TÜRKÇE',
        outcomeCode: 'T.8.3.14.01 • Ana Düşünce (Vurgulanan Fikir)',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Gerçek bir yazar, çağının tanığı olmakla yetinmez; o, toplumun duymadığı fısıltıları, görmezden geldiği yaraları kelimelerin büyüteci altına alır. Sanat, yalnızca bir ayna gibi gerçeği yansıtmaz; gerçeğin karanlıkta kalmış köşelerine fener tutarak insanı dönüştürmeyi hedefler. Sadece alkış almak için yazılmış suya sabuna dokunmayan eserler, zamanın acımasız eleğinde savrulup yok olmaya mahkûmdur.',
        stem: 'Bu parçada asıl vurgulanmak istenen düşünce aşağıdakilerden hangisidir?',
        options: {
          A: 'Sanatçılar, toplumun beğenisini kazanmak için güncel konuları işlemelidir.',
          B: 'Kalıcı ve değerli edebiyat, toplumsal gerçekleri aydınlatıp insanı dönüştürme gücü taşıyan edebiyattır.',
          C: 'Zamanın eleğinden yalnızca estetik kaygıyla yazılmış süslü metinler geçebilir.',
          D: 'Toplumun sorunlarını işlemeyen yazarlar geleceğe kalıcı eser bırakamaz.'
        },
        correctOption: 'B',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Parçanın son cümlesindeki "zamanın acımasız eleği" ve ortadaki "insanı dönüştürmeyi hedefler" ifadesi doğrudan kalıcılık ve dönüştürücü güç vurgusunu işaret eder.',
        detailedSolution: 'Yazar, sanatın pasif bir ayna olmanın ötesine geçerek insanı dönüştürmesi gerektiğini ve suya sabuna dokunmayan eserlerin unutulacağını savunmaktadır. Bu da B şıkkındaki yargıyı doğrular.',
        distractors: {
          A: 'Yazar alkış ve beğeni peşinde koşmayı eleştirmektedir, tam zıttıdır.',
          C: 'Metinde estetik süsten değil, gerçeğe fener tutmaktan bahsedilir.',
          D: 'D şıkkı güçlü bir çeldiricidir ancak yazarın asıl amacı sadece olumsuzlamak değil, kalıcı sanatın dönüştürücü gücünü vurgulamaktır.'
        }
      },
      {
        id: 'LGS-TR-03',
        course: 'TÜRKÇE',
        outcomeCode: 'T.8.3.26 • Sözel Mantık ve Muhakeme',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Ahmet, Burak, Ceren, Deniz ve Elif isimli beş öğrenci bir münazara yarışmasına katılmıştır. Öğrencilerin aldıkları derecelerle (1, 2, 3, 4 ve 5.) ilgili bilinenler şunlardır:\n• Ceren, yarışmayı Ahmet\'ten hemen önceki sırada tamamlamıştır.\n• Deniz yarışmayı 4. sırada tamamlamamıştır.\n• Elif yarışmanın birincisi olmuştur.\n• Burak, Ceren\'den sonraki bir sırada yer almıştır.',
        stem: 'Buna göre yarışmayı 3. sırada tamamlayan öğrenci kesinlikle kimdir?',
        options: { A: 'Ahmet', B: 'Burak', C: 'Ceren', D: 'Deniz' },
        correctOption: 'A',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Sabitleri yerleştirin: 1. sıra = Elif. Ceren ve Ahmet peş peşe (Ceren, Ahmet) blok hâlindedir. Kısıtları test ediniz.',
        detailedSolution: '1. Elif (kesin). Ceren ve Ahmet peş peşe olmalıdır. Ceren 2., Ahmet 3. olur. Kalan 4 ve 5\'e Burak ve Deniz gelir. Deniz 4. olamayacağına göre Deniz 5., Burak 4. olur. Dolayısıyla 3. sıradaki öğrenci kesinlikle Ahmet\'tir (A şıkkı).',
        distractors: {
          B: 'Burak 4. sıradadır.',
          C: 'Ceren 2. sıradadır.',
          D: 'Deniz 5. sıradadır.'
        }
      },
      {
        id: 'LGS-TR-04',
        course: 'TÜRKÇE',
        outcomeCode: 'T.8.3.15 • Cümlede Anlam ve Örtülü Anlam',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Usta fotoğrafçı, sergi açılışında kendisine yöneltilen bir soru üzerine şöyle demiştir: "Fotoğraf makinesi, hayata bakan herkesin elinde olabilir; ancak deklanşöre basıldığında ortaya çıkan kare, yalnızca vizörün arkasındaki zihnin derinliğini ve kalbin ritmini yansıtır."',
        stem: 'Fotoğrafçının bu sözünden aşağıdaki yargılardan hangisi çıkarılamaz?',
        options: {
          A: 'Fotoğraf sanatı, teknik ekipmandan çok sanatçının kişisel birikimine dayanır.',
          B: 'Aynı nesneye bakan farklı fotoğrafçılar bambaşka duygular yansıtabilir.',
          C: 'Nitelikli bir fotoğraf üretmek için en gelişmiş teknolojik ekipmana sahip olmak ön koşuldur.',
          D: 'Bir eserin özgünlüğü, yaratıcısının iç dünyasından ve duyarlılığından beslenir.'
        },
        correctOption: 'C',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Soru kökündeki olumsuz ifadeye ("çıkarılamaz") odaklanın.',
        detailedSolution: 'Fotoğrafçı ekipmanın belirleyici olmadığını, asıl belirleyicinin zihnin derinliği olduğunu söylemektedir. Dolayısıyla C şıkkı parçanın ana fikrine tamamen aykırıdır.',
        distractors: {
          A: 'Zihnin derinliği ifadesi sanatçının birikimine işaret eder.',
          B: 'Kalbin ritmi ifadesi farklı duyguların yansımasını doğrular.',
          D: 'Vizörün arkasındaki zihin ifadesi iç dünyayı karşılar.'
        }
      }
    ],
    matematik: [
      {
        id: 'LGS-MAT-01',
        course: 'MATEMATİK',
        outcomeCode: 'M.8.1.1.1 • EBOB-EKOK Modelleme',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Bir belediye, kenar uzunlukları 180 metre ve 240 metre olan dikdörtgen biçimindeki bir afet lojistik alanının etrafına ve içine, eşit aralıklarla güneş enerjili aydınlatma direkleri dikecektir. Sahadaki köşelere de birer direk dikilmesi zorunludur. Ayrıca afet durumunda güvenli geçişi sağlamak amacıyla iki direk arasındaki mesafenin metre cinsinden bir tam sayı ve 15 metreden küçük olması istenmektedir.',
        stem: 'Buna göre bu lojistik sahasının sadece çevresi boyunca dikilecek aydınlatma direği sayısı en az kaç olabilir?',
        options: { A: '35', B: '42', C: '70', D: '84' },
        correctOption: 'C',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: En az direk için aralık en büyük seçilmelidir. Kısıt: Mesafe < 15 m. 180 ve 240\'ın EBOB\'unun (60) 15\'ten küçük en büyük bölenini bulunuz.',
        detailedSolution: 'EBOB(180, 240) = 60 m. 60\'ın 15\'ten küçük en büyük böleni: 12 m. Çevre = 2 x (180 + 240) = 840 m. Direk Sayısı = 840 / 12 = 70 adet.',
        distractors: {
          A: 'Aralığı yanlışlıkla 24 m kabul eden öğrencilerin bulduğu sonuçtur.',
          B: '15\'ten küçük kuralını unutup aralığı 20 m alanların düştüğü güçlü çeldiricidir (840/20 = 42).',
          D: 'Aralığı 10 m seçip en büyük böleni yakalayamayanların sonucudur.'
        }
      },
      {
        id: 'LGS-MAT-02',
        course: 'MATEMATİK',
        outcomeCode: 'M.8.1.2.2 • Üslü İfadeler ve Bilimsel Gösterim',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Bir veri depolama merkezi, saniyede 2^14 bayt veri işleyen 16 adet özdeş sunucu barındırmaktadır. Bu merkezde veri işleme işlemi kesintisiz olarak 32 saniye boyunca devam etmiştir.',
        stem: 'Buna göre 32 saniye sonunda işlenen toplam veri miktarının bayt cinsinden değeri aşağıdakilerden hangisine eşittir?',
        options: { A: '2^21', B: '2^23', C: '2^25', D: '2^27' },
        correctOption: 'B',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Verilen tüm sayıları 2\'nin kuvveti olarak yazınız: 16 = 2^4, 32 = 2^5.',
        detailedSolution: '1 sunucu saniyede: 2^14 bayt. 16 sunucu saniyede: 16 x 2^14 = 2^4 x 2^14 = 2^18 bayt. 32 saniyede toplam: 32 x 2^18 = 2^5 x 2^18 = 2^23 bayt işlenir.',
        distractors: {
          A: 'Zamanı hesaba katmayan öğrencilerin sonucudur.',
          C: '16 ve 32\'yi çarpmayıp üsleri yanlış toplayanların sonucudur.',
          D: 'Üsleri birbiriyle çarpanların düştüğü kavram yanılgısıdır.'
        }
      },
      {
        id: 'LGS-MAT-03',
        course: 'MATEMATİK',
        outcomeCode: 'M.8.1.3.1 • Kareköklü İfadeler ve Alan Analizi',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Alanı 108 santimetrekare olan dikdörtgen şeklindeki bir mukavvanın kenar uzunlukları santimetre cinsinden birer tam sayı değildir ve kenarlarından biri √12 santimetredir. Bu mukavva, kenar uzunluğu √3 santimetre olan kare biçimindeki eş parçalara ayrılacaktır.',
        stem: 'Buna göre bu mukavvadan elde edilecek kare parça sayısı kaçtır?',
        options: { A: '18', B: '24', C: '36', D: '48' },
        correctOption: 'C',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: 1 kare parçanın alanı = (√3) x (√3) = 3 santimetrekaredir.',
        detailedSolution: 'Toplam alan 108 santimetrekaredir. Her bir küçük karenin alanı = 3 santimetrekare. Parça sayısı = 108 / 3 = 36 adettir.',
        distractors: {
          A: 'Alanı yanlışlıkla 6\'ya bölenlerin sonucudur.',
          B: 'Kenar oranını karıştıranların sonucudur.',
          D: 'Çevre üzerinden hesaplama yapanların sonucudur.'
        }
      }
    ],
    fen: [
      {
        id: 'LGS-FEN-01',
        course: 'FEN BİLİMLERİ',
        outcomeCode: 'F.8.1.1.1 • Işık Açısı ve Sıcaklık İlişkisi',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Fen bilimleri öğretmeni, özdeş iki el feneri ve özdeş iki termometre kullanarak karanlık bir laboratuvarda aşağıdaki deney düzeneğini kuruyor:\n• 1. Düzenek: El feneri düz bir zemine dik (90°) açıyla tutuluyor ve aydınlanan dairesel alanın sıcaklığı 10 dakika sonra ölçülüyor.\n• 2. Düzenek: El feneri aynı mesafeden eğik (30°) açıyla tutuluyor ve aydınlanan elips şeklindeki alanın sıcaklığı 10 dakika sonra ölçülüyor.\nDeney sonucunda 1. düzenekteki termometrenin 2. düzenekten 8 °C daha yüksek bir sıcaklık gösterdiği kaydediliyor.',
        stem: 'Yapılan bu kontrollü deneyle ilgili aşağıdaki çıkarımlardan hangisi doğrudur?',
        options: {
          A: 'Deneyde bağımsız değişken, aydınlanan yüzeyin başlangıç sıcaklığıdır.',
          B: 'Güneş ışınlarının gelme açısı küçüldükçe birim yüzeye düşen ışık enerjisi miktarı artar.',
          C: '2. düzenekte aydınlanan alanın daha geniş olması, birim yüzeye aktarılan ısı enerjisinin daha az olduğunu kanıtlar.',
          D: 'Deney sonucuna göre mevsimlerin oluşumunda Dünya\'nın Güneş\'e olan uzaklığının değişmesi belirleyicidir.'
        },
        correctOption: 'C',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Açı eğikleştikçe alan genişler, birim yüzeye düşen enerji azalır.',
        detailedSolution: '2. düzenekte ışık eğik açıyla geldiği için enerji daha geniş bir yüzeye dağılmıştır. Enerji dağıldığı için birim alana aktarılan ısı enerjisi azalmış ve sıcaklık artışı daha düşük kalmıştır.',
        distractors: {
          A: 'Bağımsız değişken ışığın gelme açısıdır.',
          B: 'Açı küçüldükçe birim yüzeye düşen enerji azalır.',
          D: 'Güneş\'e uzaklık mevsimlerde etkili değildir.'
        }
      },
      {
        id: 'LGS-FEN-02',
        course: 'FEN BİLİMLERİ',
        outcomeCode: 'F.8.2.1.2 • DNA ve Genetik Kod Replikasyonu',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Radyasyona maruz bırakılan bir hücrede DNA molekülünün kendini eşlemesi sırasında karşılıklı nükleotid zincirlerinde şu durumlar gözleniyor:\n• 1. Bölge: Birinci zincirdeki Adenin nükleotidinin karşısındaki Timin nükleotidi kopmuştur (boşluk oluşmuştur).\n• 2. Bölge: Karşılıklı iki zincirdeki nükleotidlerin her ikisi de aynı anda kopmuş ve çift taraflı boşluk meydana gelmiştir.',
        stem: 'Buna göre bu DNA hasarının onarımı ile ilgili aşağıdakilerden hangisi kesinlikle doğrudur?',
        options: {
          A: 'Her iki bölgedeki hasar da hücredeki onarım enzimleri tarafından eksiksiz tamir edilir.',
          B: '1. bölgedeki hasar karşı zincirdeki baz referans alınarak onarılırken 2. bölgedeki hasar onarılamaz ve mutasyona yol açar.',
          C: 'DNA eşlenmesi sırasında tek zincirdeki boşluklar onarılamaz mutasyon kabul edilir.',
          D: 'Radyasyon etkisiyle oluşan tüm baz eksiklikleri sonraki nesillere kesinlikle aktarılır.'
        },
        correctOption: 'B',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Tek taraflı boşluklar tamir edilebilir; çift taraflı boşluklar onarılamaz.',
        detailedSolution: '1. bölgede karşısında A olduğu için enzimler boşluğa T yerleştirerek hasarı onarır. Ancak 2. bölgede her iki baz da olmadığı için genetik kod referansı kaybolmuştur ve tamir edilemez.',
        distractors: {
          A: 'Çift taraflı boşluk onarılamaz.',
          C: 'Tek zincirdeki boşluklar kolaylıkla onarılır.',
          D: 'Yalnızca üreme hücrelerindeki mutasyonlar sonraki nesillere aktarılır.'
        }
      },
      {
        id: 'LGS-FEN-03',
        course: 'FEN BİLİMLERİ',
        outcomeCode: 'F.8.3.1.1 • Katı Basıncı ve Temas Yüzeyi',
        difficulty: 'LGS Yeni Nesil',
        stimulus: 'Özdeş ve homojen yapıdaki dört adet tuğla kullanılarak kum zemin üzerinde sırasıyla şu işlemler yapılıyor:\n1. Durum: Bir tuğla en geniş yüzeyi (4S) üzerine kum zemine konuluyor ve batma miktarı (h1) ölçülüyor.\n2. Durum: Aynı tuğlanın üzerine özdeş bir tuğla daha eklenerek toplam ağırlık iki katına çıkarılıyor ve batma miktarı (h2) ölçülüyor.\n3. Durum: İki tuğla yan yana getirilerek en dar yüzeyleri (S) üzerine kum zemine konuluyor ve batma miktarı (h3) ölçülüyor.',
        stem: 'Kum zemindeki batma derinlikleri (h1, h2, h3) arasındaki büyüklük ilişkisi aşağıdakilerin hangisinde doğru verilmiştir?',
        options: {
          A: 'h3 > h2 > h1',
          B: 'h2 > h3 > h1',
          C: 'h3 = h2 > h1',
          D: 'h1 > h2 > h3'
        },
        correctOption: 'A',
        solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Basınç P = Ağırlık / Yüzey Alanı. Batma miktarı basınç ile orantılıdır.',
        detailedSolution: 'P3 (1.00 P) > P2 (0.50 P) > P1 (0.25 P). Batma miktarları h3 > h2 > h1 şeklindedir.',
        distractors: {
          B: 'Dar yüzeyin basıncı katladığını hesaba katmayanların sonucudur.',
          C: 'Ağırlık artışını alan artışıyla eşitleyenlerin yanılgısıdır.',
          D: 'Basınç ile batma derinliğini ters orantılı sananların düştüğü kavram tuzağıdır.'
        }
      }
    ],
    sosyal: []
  };

  // 2. Birleştirme (Base + Subagent Generated)
  for (const c of ['turkce', 'matematik', 'fen', 'sosyal']) {
    mergedBank[c] = [...(baseQuestions[c] || [])];
    const genFile = path.join(generatedDir, `${c}.json`);
    if (fs.existsSync(genFile)) {
      try {
        const fileContent = fs.readFileSync(genFile, 'utf-8');
        const generatedList = JSON.parse(fileContent);
        // ID çakışması olmaksızın ekle
        generatedList.forEach(item => {
          if (!mergedBank[c].some(q => q.id === item.id)) {
            mergedBank[c].push(item);
          }
        });
      } catch (err) {
        console.warn(`Hata: ${genFile} okunamadı:`, err.message);
      }
    }
  }

  return mergedBank;
}

export async function compileAndAuditAll() {
  const auditor = new JevQualityAuditor();
  console.log('=== MEB MAARİF LGS ÇOKLU AJAN SORU DERLEMESİ BAŞLATILDI ===');
  
  const questionBank = loadAndMergeAllQuestions();
  let totalEvaluated = 0;
  let totalPassed = 0;

  for (const [courseName, questions] of Object.entries(questionBank)) {
    console.log(`\n📚 [${courseName.toUpperCase()}] Toplam ${questions.length} Soru Denetleniyor:`);
    for (const q of questions) {
      totalEvaluated++;
      const audit = await auditor.evaluateQuestion(q);
      q.jevAudit = audit;
      if (audit.passed) {
        totalPassed++;
        console.log(`  ✓ [${q.id}] ${q.outcomeCode} - JEV ONAYLANDI (Skor: ${audit.score})`);
      } else {
        console.log(`  ✗ [${q.id}] Reddedildi: ${audit.reasons?.join(', ')}`);
      }
    }
  }

  const publicPath = path.join(__dirname, '..', 'public', 'questions.json');
  fs.writeFileSync(publicPath, JSON.stringify(questionBank, null, 2), 'utf-8');
  console.log(`\n💾 Tüm sorular derlenerek kaydedildi: ${publicPath}`);
  console.log(`🏆 Tamamlanma Raporu: ${totalPassed}/${totalEvaluated} soru Jev onayından geçerek yayın havuzuna alındı.`);
  return { totalEvaluated, totalPassed, questionBank };
}

if (process.argv[1]?.endsWith('question_builder.mjs')) {
  compileAndAuditAll();
}
