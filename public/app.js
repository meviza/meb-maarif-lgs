/**
 * MEB Maarif LGS Platformu - İnteraktif Soru ve Optik Sınav Motoru
 */

// Soru Veri Tabanı (Türkçe, Matematik, Fen Bilimleri)
const questionBank = {
  turkce: [
    {
      id: 'LGS-TR-PAR-0001',
      course: 'TÜRKÇE',
      outcomeCode: 'T.8.3.14 • Akışı Bozan Cümle',
      difficulty: 'LGS Yeni Nesil',
      stimulus: '(I) Yapay zekâ destekli klinik tanı sistemleri, tıp dünyasında hekimlerin en kritik karar destek mekanizması hâline gelmiştir. (II) Milyonlarca vaka ve radyolojik görüntüyü saniyeler içinde tarayan bu algoritmalar, insan gözünün kaçırabileceği mikroskobik doku anomalilerini yüksek hassasiyetle saptayabilmektedir. (III) Hastane binalarının mimari tasarımında doğal ışık kullanımının artırılması, ameliyat sonrası hasta nekahet süresini belirgin şekilde kısaltmaktadır. (IV) Hekimin klinik tecrübesiyle yapay zekânın devasa veri işleme kabiliyeti harmanlandığında, teşhis hataları en aza inmekte ve tedavi başarısı katlanmaktadır.',
      stem: 'Bu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
      options: {
        A: 'I',
        B: 'II',
        C: 'III',
        D: 'IV'
      },
      correctOption: 'C',
      solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: Bu bir "Düşüncenin Akışını Bozan Cümle" sorusudur. Çözüm algoritması: Parçanın omurgasını oluşturan anahtar kavramları (Yapay zekâ, klinik tanı, teşhis, algoritma) takip edin. Konunun ansızın hastane mimarisine saptığı cümleyi yakalayın.',
      detailedSolution: 'I, II ve IV. cümleler yapay zekânın hekim teşhislerindeki teknolojik katkısını konu edinirken, III. cümle bağlamsal bir bağ kurulmaksızın "Hastane mimarisindeki doğal ışık" konusuna geçmiştir. Bu nedenle düşüncenin akışını bozan cümle III''tür (C şıkkı).',
      distractors: {
        A: 'I. cümle parçanın giriş cümlesidir; konuyu tanımlar.',
        B: 'II. cümle I. cümlenin mantıksal devamıdır; algoritmanın gücünü açıklar.',
        D: 'IV. cümle teknolojiyi hekim tecrübesiyle bağlayıp ana fikri tamamlar.'
      }
    }
  ],
  matematik: [
    {
      id: 'LGS-MAT-EB-0001',
      course: 'MATEMATİK',
      outcomeCode: 'M.8.1.1.1 • EBOB-EKOK Modelleme',
      difficulty: 'LGS Yeni Nesil',
      stimulus: 'Bir belediye, kenar uzunlukları 180 metre ve 240 metre olan dikdörtgen biçimindeki bir afet lojistik alanının etrafına ve içine, eşit aralıklarla güneş enerjili aydınlatma direkleri dikecektir. Sahadaki köşelere de birer direk dikilmesi zorunludur. Ayrıca afet durumunda güvenli geçişi sağlamak amacıyla iki direk arasındaki mesafenin metre cinsinden bir tam sayı ve 15 metreden küçük olması istenmektedir.',
      stem: 'Buna göre bu lojistik sahasının sadece çevresi boyunca dikilecek aydınlatma direği sayısı en az kaç olabilir?',
      options: {
        A: '35',
        B: '42',
        C: '70',
        D: '84'
      },
      correctOption: 'C',
      solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: En az direk sayısı için iki direk arasındaki mesafeyi EBOB ile en büyük seçmeliyiz. Ancak kısıta dikkat: "Mesafe < 15 m olmalıdır!" 180 ve 240''ın 15''ten küçük en büyük ortak bölenini bulunuz.',
      detailedSolution: 'Adım 1: EBOB(180, 240) = 60 metredir.\nAdım 2: 60''ın 15''ten küçük en büyük böleni 12 metredir (Aralık = 12 m).\nAdım 3: Dikdörtgen Çevresi = 2 x (180 + 240) = 840 m.\nDirek Sayısı = 840 / 12 = 70 adet direk dikilir. Doğru cevap C''dir.',
      distractors: {
        A: 'Aralığı yanlışlıkla 24 m kabul eden öğrencilerin bulduğu sonuçtur.',
        B: '15''ten küçük kuralını unutup aralığı 20 m alanların düştüğü güçlü çeldiricidir (840/20 = 42).',
        D: 'Aralığı 10 m seçip en büyük böleni yakalayamayanların sonucudur.'
      }
    }
  ],
  fen: [
    {
      id: 'LGS-FEN-MEV-0001',
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
      solutionStrategy: '💡 UZMAN ÖĞRETMEN STRATEJİSİ: MEB Fen testinde "Işığın Düşme Açısı - Alan - Birim Yüzeye Düşen Enerji" kuralı sabittir: Açı küçüldükçe (eğikleştikçe) alan genişler, birim yüzeye düşen enerji azalır.',
      detailedSolution: '2. düzenekte ışık eğik açıyla geldiği için enerji daha geniş bir yüzeye dağılmıştır. Enerji dağıldığı için birim yüzeye düşen ısı miktarı düşmüş ve sıcaklık artışı daha az olmuştur. Bu nedenle C şıkkı kesinlikle doğrudur.',
      distractors: {
        A: 'Bağımsız değişken araştırmacının bizzat değiştirdiği "açı"dır; başlangıç sıcaklığı sabit tutulmuştur.',
        B: 'Açı küçüldükçe birim yüzeye düşen enerji artmaz, azalır.',
        D: 'Mevsimlerin oluşumunda Güneş\'e uzaklık etkili değildir (en yaygın LGS kavram yanılgısı).'
      }
    }
  ]
};

// Uygulama Durumu (State)
let currentMode = 'practice'; // 'practice' veya 'exam'
let currentCourse = 'turkce';
let currentQuestionIndex = 0;
let userAnswers = {}; // { 'LGS-TR-PAR-0001': 'C', ... }
let timerInterval = null;
let timerSeconds = 30 * 60;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('questions.json');
    if (res.ok) {
      const data = await res.json();
      Object.keys(data).forEach(k => {
        questionBank[k] = data[k];
      });
      console.log('⚡ Jev onaylı sorular questions.json üzerinden başarıyla yüklendi.');
    }
  } catch (err) {
    console.log('Yerel soru havuzu kullanılıyor.');
  }

  renderQuestionNav();
  loadQuestion(0);
  renderOpticalSheet();
});

// Mod Değiştirme
window.switchMode = function(mode) {
  currentMode = mode;
  document.getElementById('btnPracticeMode').classList.toggle('active', mode === 'practice');
  document.getElementById('btnExamMode').classList.toggle('active', mode === 'exam');
  
  const timer = document.getElementById('examTimer');
  const solutionBox = document.getElementById('solutionBox');

  if (mode === 'exam') {
    timer.classList.remove('hidden');
    solutionBox.classList.add('hidden');
    startTimer();
  } else {
    timer.classList.add('hidden');
    clearInterval(timerInterval);
    // Pratik modunda eğer soru çözüldüyse çözümü göster
    checkAndDisplaySolution();
  }
  renderQuestion();
  renderOpticalSheet();
};

// Ders Seçimi
window.selectCourse = function(courseKey) {
  currentCourse = courseKey;
  currentQuestionIndex = 0;
  
  document.querySelectorAll('.course-chip').forEach(chip => chip.classList.remove('active'));
  event.target.classList.add('active');

  renderQuestionNav();
  loadQuestion(0);
  renderOpticalSheet();
};

// Soru Gezinti Butonları
function renderQuestionNav() {
  const container = document.getElementById('questionNavList');
  const questions = questionBank[currentCourse];
  container.innerHTML = '';

  document.getElementById('questionCountBadge').textContent = `${questions.length} Soru`;

  questions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.className = `q-nav-btn ${idx === currentQuestionIndex ? 'active' : ''} ${userAnswers[q.id] ? 'answered' : ''}`;
    btn.textContent = `${idx + 1}`;
    btn.onclick = () => loadQuestion(idx);
    container.appendChild(btn);
  });
}

// Soru Yükleme
function loadQuestion(idx) {
  currentQuestionIndex = idx;
  renderQuestion();
  renderQuestionNav();
  renderOpticalSheet();
}

function renderQuestion() {
  const q = questionBank[currentCourse][currentQuestionIndex];
  if (!q) return;

  document.getElementById('courseTag').textContent = q.course;
  document.getElementById('outcomeTag').textContent = q.outcomeCode;
  document.getElementById('difficultyTag').textContent = q.difficulty;
  document.getElementById('questionCode').textContent = q.id;

  document.getElementById('questionStimulus').textContent = q.stimulus;
  document.getElementById('questionStem').textContent = q.stem;

  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = '';

  const selectedAnswer = userAnswers[q.id];

  ['A', 'B', 'C', 'D'].forEach(opt => {
    const row = document.createElement('div');
    row.className = `option-row ${selectedAnswer === opt ? 'selected' : ''}`;

    // Pratik modunda anında renklendirme
    if (currentMode === 'practice' && selectedAnswer) {
      if (opt === q.correctOption) {
        row.classList.add('correct');
      } else if (selectedAnswer === opt) {
        row.classList.add('wrong');
      }
    }

    row.innerHTML = `
      <div class="opt-circle">${opt}</div>
      <div class="opt-text">${q.options[opt]}</div>
    `;

    row.onclick = () => selectOption(q.id, opt);
    optionsContainer.appendChild(row);
  });

  checkAndDisplaySolution();
}

// Şık Seçimi (Kitapçıktan veya Optik Formdan)
function selectOption(qId, option) {
  userAnswers[qId] = option;
  renderQuestion();
  renderQuestionNav();
  renderOpticalSheet();
}

// Pratik Modunda Çözümü Göster
function checkAndDisplaySolution() {
  const q = questionBank[currentCourse][currentQuestionIndex];
  const solutionBox = document.getElementById('solutionBox');
  const selectedAnswer = userAnswers[q.id];

  if (currentMode === 'practice' && selectedAnswer) {
    solutionBox.classList.remove('hidden');
    document.getElementById('solutionStrategy').textContent = q.solutionStrategy;
    document.getElementById('detailedSolution').textContent = q.detailedSolution;

    const distContainer = document.getElementById('distractorAnalysis');
    distContainer.innerHTML = '';
    Object.keys(q.distractors).forEach(dKey => {
      const item = document.createElement('div');
      item.className = 'distractor-item';
      item.innerHTML = `<strong>${dKey} Şıkkı:</strong> ${q.distractors[dKey]}`;
      distContainer.appendChild(item);
    });
  } else {
    solutionBox.classList.add('hidden');
  }
}

// Sağ Paneldeki Optik Formu Çiz
function renderOpticalSheet(scanResults = null) {
  const container = document.getElementById('opticalRows');
  const questions = questionBank[currentCourse];
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const row = document.createElement('div');
    row.className = 'opt-row';

    const selected = userAnswers[q.id];

    let bubblesHtml = '';
    ['A', 'B', 'C', 'D'].forEach(opt => {
      let extraClass = '';
      if (selected === opt) extraClass += ' filled';

      if (scanResults) {
        if (opt === q.correctOption) {
          extraClass += ' correct-bubble';
        } else if (selected === opt && selected !== q.correctOption) {
          extraClass += ' wrong-bubble';
        }
      }

      bubblesHtml += `<span class="bubble ${extraClass}" onclick="selectOption('${q.id}', '${opt}')">${opt}</span>`;
    });

    row.innerHTML = `
      <span class="opt-q-num">${idx + 1}.</span>
      <div class="opt-bubbles">
        ${bubblesHtml}
      </div>
    `;

    container.appendChild(row);
  });
}

// Sınavı Tamamla ve Optik Formu Tara
window.finishExam = function() {
  clearInterval(timerInterval);
  const questions = questionBank[currentCourse];
  let correct = 0;
  let wrong = 0;
  let empty = 0;

  questions.forEach(q => {
    const ans = userAnswers[q.id];
    if (!ans) {
      empty++;
    } else if (ans === q.correctOption) {
      correct++;
    } else {
      wrong++;
    }
  });

  // LGS Kuralı: 3 Yanlış 1 Doğruyu Götürür!
  const net = Math.max(0, correct - (wrong / 3));

  // Optik Formu Renklendir
  renderOpticalSheet({ evaluated: true });

  // Sonuç Karnesini Göster
  const report = document.getElementById('scoreReport');
  report.classList.remove('hidden');

  document.getElementById('statCorrect').textContent = correct;
  document.getElementById('statWrong').textContent = wrong;
  document.getElementById('statEmpty').textContent = empty;
  document.getElementById('statNet').textContent = net.toFixed(2);

  // Kazanım Geri Bildirimi
  const feedback = document.getElementById('outcomeFeedback');
  if (wrong > 0) {
    feedback.innerHTML = `⚠️ <strong>Analiz:</strong> Hata yaptığınız soru çeldiriciye takıldı. Detaylı çözüm stratejisini inceleyip bu konudan 5 soru daha çözmeniz önerilir.`;
  } else if (correct === questions.length) {
    feedback.innerHTML = `🎉 <strong>Tebrikler:</strong> MEB Maarif Modeli LGS standartlarındaki tüm yeni nesil soruları tam başarıyla çözdünüz!`;
  } else {
    feedback.innerHTML = `📌 <strong>Bilgi:</strong> Boş bıraktığınız sorular için kısıt ve hipotez kurallarını tekrar gözden geçiriniz.`;
  }
};

window.resetExam = function() {
  userAnswers = {};
  document.getElementById('scoreReport').classList.add('hidden');
  renderQuestion();
  renderQuestionNav();
  renderOpticalSheet();
};

// Sınav Sayacı
function startTimer() {
  clearInterval(timerInterval);
  timerSeconds = 30 * 60;
  const display = document.getElementById('timerDisplay');

  timerInterval = setInterval(() => {
    timerSeconds--;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      finishExam();
      return;
    }
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
}
