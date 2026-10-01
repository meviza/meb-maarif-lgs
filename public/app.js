/**
 * MEB Maarif LGS Platformu - İnteraktif Soru ve Optik Sınav Motoru (Kurumsal Sürüm)
 */

// Uygulama Durumu (State)
const appState = {
  currentMode: 'practice', // 'practice' | 'exam'
  currentCourse: 'turkce',
  currentIndex: 0,
  userAnswers: {}, // { 'LGS-TR-01': 'C', ... }
  examEvaluated: false,
  timerInterval: null,
  timerSeconds: 30 * 60,
  questionBank: {}
};

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', async () => {
  await initQuestionBank();
  setupEventListeners();
  renderApp();
});

// 1. Soru Bankasını Yükle
async function initQuestionBank() {
  try {
    const res = await fetch('questions.json');
    if (res.ok) {
      appState.questionBank = await res.json();
      console.log('✓ questions.json başarıyla yüklendi.');
    } else {
      throw new Error('questions.json okunamadı');
    }
  } catch (err) {
    console.warn('questions.json yüklenemedi, varsayılan gömülü veri kullanılıyor.', err);
    // Gömülü yedek soru seti
    appState.questionBank = {
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
        }
      ]
    };
  }
}

// 2. Olay Dinleyicileri (Event Listeners)
function setupEventListeners() {
  // Mod Değiştirme
  const btnPractice = document.getElementById('btnPracticeMode');
  const btnExam = document.getElementById('btnExamMode');
  if (btnPractice) btnPractice.addEventListener('click', () => setMode('practice'));
  if (btnExam) btnExam.addEventListener('click', () => setMode('exam'));

  // Ders Değiştirme
  const courseButtons = document.querySelectorAll('.course-btn');
  courseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const courseKey = btn.getAttribute('data-course');
      if (courseKey) selectCourse(courseKey);
    });
  });

  // Önceki / Sonraki Soru Butonları
  const btnPrev = document.getElementById('btnPrevQuestion');
  const btnNext = document.getElementById('btnNextQuestion');
  if (btnPrev) btnPrev.addEventListener('click', () => navigateQuestion(-1));
  if (btnNext) btnNext.addEventListener('click', () => navigateQuestion(1));

  // Optik Eylemler
  const btnFinish = document.getElementById('btnFinishExam');
  const btnReset = document.getElementById('btnResetExam');
  if (btnFinish) btnFinish.addEventListener('click', finishExam);
  if (btnReset) btnReset.addEventListener('click', resetExam);
}

// 3. Mod Ayarla
function setMode(mode) {
  appState.currentMode = mode;
  document.getElementById('btnPracticeMode').classList.toggle('active', mode === 'practice');
  document.getElementById('btnExamMode').classList.toggle('active', mode === 'exam');

  const timerEl = document.getElementById('examTimer');
  if (mode === 'exam') {
    timerEl.classList.remove('hidden');
    startTimer();
  } else {
    timerEl.classList.add('hidden');
    clearInterval(appState.timerInterval);
  }

  renderQuestion();
  renderSolutionDrawer();
  renderOpticalSheet();
}

// 4. Ders Seçimi
function selectCourse(courseKey) {
  appState.currentCourse = courseKey;
  appState.currentIndex = 0;

  // Buton aktiflik sınıfları
  document.querySelectorAll('.course-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-course') === courseKey);
  });

  // Optik başlıktaki ders adı
  const courseTitles = {
    turkce: 'TÜRKÇE',
    matematik: 'MATEMATİK',
    fen: 'FEN BİLİMLERİ',
    sosyal: 'T.C. İNKILAP TARİHİ'
  };
  const opticalCourseEl = document.getElementById('opticalCourseName');
  if (opticalCourseEl) {
    opticalCourseEl.textContent = courseTitles[courseKey] || 'LGS TESTİ';
  }

  renderApp();
}

// 5. Ana Render Metodu
function renderApp() {
  updateCourseBadges();
  renderQuestionNav();
  renderQuestion();
  renderSolutionDrawer();
  renderOpticalSheet();
}

// Ders Soru Sayısı Rozetlerini Güncelle
function updateCourseBadges() {
  const turkceCount = appState.questionBank.turkce?.length || 0;
  const matCount = appState.questionBank.matematik?.length || 0;
  const fenCount = appState.questionBank.fen?.length || 0;
  const sosyalCount = appState.questionBank.sosyal?.length || 0;

  const bTr = document.getElementById('badgeTurkce');
  const bMat = document.getElementById('badgeMatematik');
  const bFen = document.getElementById('badgeFen');
  const bSosyal = document.getElementById('badgeSosyal');

  if (bTr) bTr.textContent = `${turkceCount} Soru`;
  if (bMat) bMat.textContent = `${matCount} Soru`;
  if (bFen) bFen.textContent = `${fenCount} Soru`;
  if (bSosyal) bSosyal.textContent = `${sosyalCount} Soru`;
}

// Soru Gezgini Butonları
function renderQuestionNav() {
  const container = document.getElementById('questionNavigator');
  const questions = appState.questionBank[appState.currentCourse] || [];
  container.innerHTML = '';

  const counterEl = document.getElementById('activeQuestionCounter');
  if (counterEl) {
    counterEl.textContent = `Soru ${appState.currentIndex + 1} / ${questions.length}`;
  }

  questions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-q-btn';
    btn.textContent = `${idx + 1}`;

    if (idx === appState.currentIndex) {
      btn.classList.add('active');
    }

    if (appState.userAnswers[q.id]) {
      btn.classList.add('answered');
    }

    btn.addEventListener('click', () => {
      appState.currentIndex = idx;
      renderApp();
    });

    container.appendChild(btn);
  });
}

// Soru Kitapçığını Render Et
function renderQuestion() {
  const questions = appState.questionBank[appState.currentCourse] || [];
  const q = questions[appState.currentIndex];
  if (!q) return;

  // Başlık Meta Rozetleri
  document.getElementById('qCourseBadge').textContent = q.course;
  document.getElementById('qOutcomeBadge').textContent = q.outcomeCode;
  document.getElementById('qDifficultyBadge').textContent = q.difficulty;
  document.getElementById('qCodeBadge').textContent = q.id;

  // Soru Numarası
  document.getElementById('qNumberDisplay').textContent = `${appState.currentIndex + 1}.`;

  // Metin ve Soru Kökü
  document.getElementById('stimulusBox').textContent = q.stimulus;
  document.getElementById('stemBox').textContent = q.stem;

  // Alt İlerleme
  const progressEl = document.getElementById('footerProgress');
  if (progressEl) {
    progressEl.textContent = `${appState.currentIndex + 1} / ${questions.length}`;
  }

  // Şıklar Listesi
  const optionsList = document.getElementById('optionsList');
  optionsList.innerHTML = '';

  const selectedAnswer = appState.userAnswers[q.id];

  ['A', 'B', 'C', 'D'].forEach(opt => {
    const card = document.createElement('div');
    card.className = 'option-card';

    if (selectedAnswer === opt) {
      card.classList.add('selected');
    }

    // Pratik Modunda veya Sınav Değerlendirilmişse Renklendir
    if ((appState.currentMode === 'practice' && selectedAnswer) || appState.examEvaluated) {
      if (opt === q.correctOption) {
        card.classList.add('correct');
      } else if (selectedAnswer === opt) {
        card.classList.add('wrong');
      }
    }

    card.innerHTML = `
      <div class="opt-badge-circle">${opt}</div>
      <div class="opt-text-content">${q.options[opt]}</div>
    `;

    card.addEventListener('click', () => selectOption(q.id, opt));
    optionsList.appendChild(card);
  });
}

// Şık Seçimi
function selectOption(questionId, selectedOption) {
  appState.userAnswers[questionId] = selectedOption;
  renderQuestionNav();
  renderQuestion();
  renderSolutionDrawer();
  renderOpticalSheet();
}

// Soru Değiştirme (İleri / Geri)
function navigateQuestion(delta) {
  const questions = appState.questionBank[appState.currentCourse] || [];
  const nextIdx = appState.currentIndex + delta;
  if (nextIdx >= 0 && nextIdx < questions.length) {
    appState.currentIndex = nextIdx;
    renderApp();
  }
}

// Çözüm Rehberi Çekmecesini Yönet
function renderSolutionDrawer() {
  const drawer = document.getElementById('solutionDrawer');
  const questions = appState.questionBank[appState.currentCourse] || [];
  const q = questions[appState.currentIndex];
  if (!q) return;

  const answered = appState.userAnswers[q.id];

  // Sadece pratik modunda cevap verildiğinde veya sınav bitirildiğinde göster
  if ((appState.currentMode === 'practice' && answered) || appState.examEvaluated) {
    drawer.classList.remove('hidden');

    document.getElementById('solutionStrategyText').textContent = q.solutionStrategy;
    document.getElementById('detailedSolutionText').textContent = q.detailedSolution;

    const distContainer = document.getElementById('distractorItems');
    distContainer.innerHTML = '';

    if (q.distractors) {
      Object.keys(q.distractors).forEach(dKey => {
        const item = document.createElement('div');
        item.className = 'distractor-box';
        item.innerHTML = `<strong>${dKey} Şıkkı Çeldiricisi:</strong> ${q.distractors[dKey]}`;
        distContainer.appendChild(item);
      });
    }
  } else {
    drawer.classList.add('hidden');
  }
}

// Sağ Panel: Optik Formu Çiz
function renderOpticalSheet() {
  const container = document.getElementById('opticalRowsContainer');
  const questions = appState.questionBank[appState.currentCourse] || [];
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const row = document.createElement('div');
    row.className = 'opt-row-item';

    if (idx === appState.currentIndex) {
      row.classList.add('current-active-row');
    }

    const selected = appState.userAnswers[q.id];

    let bubblesHtml = '';
    ['A', 'B', 'C', 'D'].forEach(opt => {
      let extraClass = '';

      if (selected === opt) {
        extraClass += ' filled';
      }

      if (appState.examEvaluated) {
        if (opt === q.correctOption) {
          extraClass += ' eval-correct';
        } else if (selected === opt && selected !== q.correctOption) {
          extraClass += ' eval-wrong';
        }
      }

      bubblesHtml += `<span class="opt-bubble ${extraClass}" data-qid="${q.id}" data-opt="${opt}">${opt}</span>`;
    });

    row.innerHTML = `
      <span class="opt-q-badge">${idx + 1}.</span>
      <div class="opt-bubble-group">
        ${bubblesHtml}
      </div>
    `;

    // Baloncuk tıklama olayları
    row.querySelectorAll('.opt-bubble').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const qid = b.getAttribute('data-qid');
        const opt = b.getAttribute('data-opt');
        appState.currentIndex = idx;
        selectOption(qid, opt);
      });
    });

    // Satıra tıklayınca o soruya git
    row.addEventListener('click', () => {
      appState.currentIndex = idx;
      renderApp();
    });

    container.appendChild(row);
  });
}

// Sınavı Tamamla ve Optik Formu Tara
function finishExam() {
  clearInterval(appState.timerInterval);
  appState.examEvaluated = true;

  const questions = appState.questionBank[appState.currentCourse] || [];
  let correct = 0;
  let wrong = 0;
  let empty = 0;

  questions.forEach(q => {
    const ans = appState.userAnswers[q.id];
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

  // Arayüzü Güncelle
  renderOpticalSheet();
  renderQuestion();
  renderSolutionDrawer();

  // Karne Raporunu Göster
  const reportCard = document.getElementById('scoreReportCard');
  if (reportCard) {
    reportCard.classList.remove('hidden');

    document.getElementById('scoreCorrect').textContent = correct;
    document.getElementById('scoreWrong').textContent = wrong;
    document.getElementById('scoreEmpty').textContent = empty;
    document.getElementById('scoreNet').textContent = net.toFixed(2);

    const feedbackEl = document.getElementById('reportFeedbackText');
    if (feedbackEl) {
      if (wrong > 0) {
        feedbackEl.innerHTML = `⚠️ <strong>Kazanım Eksikliği Tespiti:</strong> Yanlış yaptığınız sorularda güçlü çeldiriciye takıldınız. Sağlanan "Uzman Öğretmen Çözüm Taktikleri"ni inceleyiniz.`;
      } else if (correct === questions.length) {
        feedbackEl.innerHTML = `🎉 <strong>Mükemmel Başarı:</strong> MEB Maarif Modeli LGS standartlarındaki tüm yeni nesil soruları tam netle tamamladınız!`;
      } else {
        feedbackEl.innerHTML = `📌 <strong>Tavsiye:</strong> Boş bıraktığınız sorular için kısıt ve hipotez kurallarını tekrar gözden geçiriniz.`;
      }
    }
  }
}

// Sınavı Sıfırla
function resetExam() {
  appState.userAnswers = {};
  appState.examEvaluated = false;
  appState.currentIndex = 0;

  const reportCard = document.getElementById('scoreReportCard');
  if (reportCard) reportCard.classList.add('hidden');

  renderApp();
}

// Sınav Sayacı
function startTimer() {
  clearInterval(appState.timerInterval);
  appState.timerSeconds = 30 * 60;
  const display = document.getElementById('timerDisplay');

  appState.timerInterval = setInterval(() => {
    appState.timerSeconds--;
    if (appState.timerSeconds <= 0) {
      clearInterval(appState.timerInterval);
      finishExam();
      return;
    }
    const mins = Math.floor(appState.timerSeconds / 60);
    const secs = appState.timerSeconds % 60;
    if (display) {
      display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }, 1000);
}
