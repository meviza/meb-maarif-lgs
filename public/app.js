/**
 * MEB Maarif LGS Platformu - Çoklu Test ve Yalıtılmış Oturum Motoru (Faz 2)
 * Türkiye Yüzyılı Maarif Modeli 8. Sınıf LGS Sınav Sistemi
 */

// Uygulama Durumu (State)
const appState = {
  currentMode: 'practice', // 'practice' | 'exam'
  currentCourse: 'turkce',
  currentTestIndex: 0,
  currentQuestionIndex: 0,
  sessions: {}, // [testId]: { userAnswers: {}, examEvaluated: false, score: null }
  timerInterval: null,
  timerSeconds: 30 * 60,
  multiTestBank: {}
};

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', async () => {
  await initTestBank();
  setupEventListeners();
  renderApp();
});

// 1. Çoklu Test Bankasını Yükle
async function initTestBank() {
  try {
    const res = await fetch('questions.json');
    if (res.ok) {
      appState.multiTestBank = await res.json();
      console.log('[OK] questions.json çoklu test bankası başarıyla yüklendi.');
    } else {
      throw new Error('questions.json okunamadı');
    }
  } catch (err) {
    console.warn('questions.json yüklenemedi, varsayılan gömülü veri kullanılıyor.', err);
    // Gömülü yedek soru seti
    appState.multiTestBank = {
      turkce: {
        courseName: 'Türkçe',
        tests: [
          {
            id: 'TR-T1',
            title: 'Test 1: Paragrafta Anlam ve Yapı',
            badge: '2024 LGS Çıkmış Soru Formatı',
            questions: [
              {
                id: 'LGS-TR-01',
                course: 'TÜRKÇE',
                sourceTag: '2024 LGS Çıkmış Soru Formatı',
                outcomeCode: 'T.8.3.14.03 • Akışı Bozan Cümle',
                difficulty: 'LGS Yeni Nesil',
                stimulus: '(I) Yapay zekâ destekli klinik tanı sistemleri, tıp dünyasında hekimlerin en kritik karar destek mekanizması hâline gelmiştir. (II) Milyonlarca vaka ve radyolojik görüntüyü saniyeler içinde tarayan bu algoritmalar, insan gözünün kaçırabileceği mikroskobik doku anomalilerini yüksek hassasiyetle saptayabilmektedir. (III) Hastane binalarının mimari tasarımında doğal ışık kullanımının artırılması, ameliyat sonrası hasta nekahet süresini belirgin şekilde kısaltmaktadır. (IV) Hekimin klinik tecrübesiyle yapay zekânın devasa veri işleme kabiliyeti harmanlandığında, teşhis hataları en aza inmekte ve tedavi başarısı katlanmaktadır.',
                stem: 'Bu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
                options: { A: 'I', B: 'II', C: 'III', D: 'IV' },
                correctOption: 'C',
                solutionStrategy: 'UZMAN ÖĞRETMEN STRATEJİSİ: Parçanın omurgasını oluşturan anahtar kavramları (Yapay zekâ, klinik tanı, teşhis) takip edin. Konunun aniden hastane mimarisine saptığı cümleyi yakalayın.',
                detailedSolution: 'I, II ve IV. cümleler yapay zekânın hekim teşhislerindeki teknolojik katkısını işlerken, III. cümle bağlam dışına çıkıp hastane mimarisinden söz etmektedir. Dolayısıyla III. cümle akışı bozar.',
                distractors: {
                  A: 'I. cümle giriş cümlesidir; konuyu tanımlar.',
                  B: 'II. cümle I. cümlenin mantıksal devamıdır; algoritmanın gücünü açıklar.',
                  D: 'IV. cümle teknolojiyi hekim tecrübesiyle bağlayıp ana fikri tamamlar.'
                }
              }
            ]
          }
        ]
      }
    };
  }
}

// 2. Yardımcı Fonksiyonlar (Data Accessors)
function getCurrentCourseData() {
  return appState.multiTestBank[appState.currentCourse] || { courseName: '', tests: [] };
}

function getCurrentTest() {
  const courseData = getCurrentCourseData();
  if (!courseData.tests || courseData.tests.length === 0) return null;
  return courseData.tests[appState.currentTestIndex] || courseData.tests[0];
}

function getCurrentQuestions() {
  const test = getCurrentTest();
  return test ? test.questions : [];
}

function getCurrentQuestion() {
  const questions = getCurrentQuestions();
  return questions[appState.currentQuestionIndex] || questions[0];
}

function getSession(testId) {
  if (!appState.sessions[testId]) {
    appState.sessions[testId] = {
      userAnswers: {},
      examEvaluated: false,
      score: null
    };
  }
  return appState.sessions[testId];
}

// 3. Olay Dinleyicileri (Event Listeners)
function setupEventListeners() {
  // Mod Değiştirme
  const btnPractice = document.getElementById('btnPracticeMode');
  const btnExam = document.getElementById('btnExamMode');
  const btnAdmin = document.getElementById('btnAdminMode');
  const btnPrint = document.getElementById('btnPrintMode');

  if (btnPractice) btnPractice.addEventListener('click', () => setMode('practice'));
  if (btnExam) btnExam.addEventListener('click', () => setMode('exam'));
  if (btnAdmin) btnAdmin.addEventListener('click', () => setMode('admin'));
  if (btnPrint) btnPrint.addEventListener('click', () => setMode('print'));

  // AI Canlı Soru Stüdyosu
  const btnGenAi = document.getElementById('btnGenerateAiQuestion');
  if (btnGenAi) btnGenAi.addEventListener('click', generateAiQuestion);

  const btnSaveAi = document.getElementById('btnSaveToBank');
  if (btnSaveAi) btnSaveAi.addEventListener('click', saveAiQuestionToBank);

  // Ders Değiştirme Butonları
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

  // Mobil Optik Aç/Kapa Butonu
  const btnMobileOpt = document.getElementById('btnMobileOptical');
  const opticalCol = document.getElementById('opticalColumn');
  if (btnMobileOpt && opticalCol) {
    btnMobileOpt.addEventListener('click', () => {
      opticalCol.classList.toggle('mobile-open');
    });
  }
}

// 4. Mod Değiştirme (Öğrenme, Gerçek Sınav, Öğretmen Paneli, Yazdır)
function setMode(mode) {
  if (mode === 'print') {
    preparePrintBooklet();
    window.print();
    return;
  }

  appState.currentMode = mode;
  document.getElementById('btnPracticeMode')?.classList.toggle('active', mode === 'practice');
  document.getElementById('btnExamMode')?.classList.toggle('active', mode === 'exam');
  document.getElementById('btnAdminMode')?.classList.toggle('active', mode === 'admin');

  const mainLayout = document.getElementById('mainLayout');
  const adminDashboard = document.getElementById('adminDashboard');
  const timerEl = document.getElementById('examTimer');

  if (mode === 'admin') {
    if (mainLayout) mainLayout.classList.add('hidden');
    if (adminDashboard) adminDashboard.classList.remove('hidden');
    if (timerEl) timerEl.classList.add('hidden');
    clearInterval(appState.timerInterval);
    renderAdminDashboard();
    return;
  } else {
    if (mainLayout) mainLayout.classList.remove('hidden');
    if (adminDashboard) adminDashboard.classList.add('hidden');
  }

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
  renderScoreReport();
}

// 5. Ders Değiştirme (Dersler Arası Geçişte Durum Yalıtımı)
function selectCourse(courseKey) {
  appState.currentCourse = courseKey;
  appState.currentTestIndex = 0;
  appState.currentQuestionIndex = 0;

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

// 6. Test Değiştirme (Testler Arası Durum Yalıtımı)
function selectTest(testIndex) {
  appState.currentTestIndex = testIndex;
  appState.currentQuestionIndex = 0;
  renderApp();
}

// 7. Ana Render Metodu
function renderApp() {
  updateCourseBadges();
  renderTestList();
  renderQuestionNav();
  renderQuestion();
  renderSolutionDrawer();
  renderOpticalSheet();
  renderScoreReport();
}

// Ders Rozetlerini Güncelle (Toplam Soru Sayıları)
function updateCourseBadges() {
  const getCount = (courseKey) => {
    const course = appState.multiTestBank[courseKey];
    if (!course || !course.tests) return 0;
    return course.tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0);
  };

  const bTr = document.getElementById('badgeTurkce');
  const bMat = document.getElementById('badgeMatematik');
  const bFen = document.getElementById('badgeFen');
  const bSosyal = document.getElementById('badgeSosyal');

  if (bTr) bTr.textContent = `${getCount('turkce')} Soru`;
  if (bMat) bMat.textContent = `${getCount('matematik')} Soru`;
  if (bFen) bFen.textContent = `${getCount('fen')} Soru`;
  if (bSosyal) bSosyal.textContent = `${getCount('sosyal')} Soru`;
}

// Test Listesini Render Et
function renderTestList() {
  const testListContainer = document.getElementById('testList');
  if (!testListContainer) return;
  testListContainer.innerHTML = '';

  const courseData = getCurrentCourseData();
  const tests = courseData.tests || [];

  tests.forEach((test, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `test-card-btn ${idx === appState.currentTestIndex ? 'active' : ''}`;

    const session = getSession(test.id);
    const answeredCount = Object.keys(session.userAnswers || {}).length;
    const isCompleted = session.examEvaluated;

    let statusBadge = '';
    if (isCompleted) {
      statusBadge = `<span style="color:#059669; font-weight:700; display:inline-flex; align-items:center; gap:3px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Tamamlandı</span> • `;
    } else if (answeredCount > 0) {
      statusBadge = `<span style="color:#2563eb; font-weight:700;">${answeredCount}/${test.questions.length}</span> • `;
    }

    btn.innerHTML = `
      <div class="test-info-box">
        <span class="test-name">${test.title}</span>
        <span class="test-tag-meta">${statusBadge}${test.badge || 'MEB Maarif'}</span>
      </div>
      <span class="test-q-count">${test.questions.length} Soru</span>
    `;

    btn.addEventListener('click', () => {
      selectTest(idx);
    });

    testListContainer.appendChild(btn);
  });
}

// Soru Gezgini Butonları
function renderQuestionNav() {
  const container = document.getElementById('questionNavigator');
  const questions = getCurrentQuestions();
  const test = getCurrentTest();
  const session = test ? getSession(test.id) : { userAnswers: {} };

  container.innerHTML = '';

  const counterEl = document.getElementById('activeQuestionCounter');
  if (counterEl) {
    counterEl.textContent = `Soru ${appState.currentQuestionIndex + 1} / ${questions.length}`;
  }

  questions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-q-btn';
    btn.textContent = `${idx + 1}`;

    if (idx === appState.currentQuestionIndex) {
      btn.classList.add('active');
    }

    if (session.userAnswers[q.id]) {
      btn.classList.add('answered');
    }

    btn.addEventListener('click', () => {
      appState.currentQuestionIndex = idx;
      renderQuestion();
      renderQuestionNav();
      renderSolutionDrawer();
      renderOpticalSheet();
    });

    container.appendChild(btn);
  });
}

// Soru Kitapçığını Render Et
function renderQuestion() {
  const questions = getCurrentQuestions();
  const q = questions[appState.currentQuestionIndex];
  if (!q) return;

  const test = getCurrentTest();
  const session = test ? getSession(test.id) : { userAnswers: {}, examEvaluated: false };

  // Başlık Meta Rozetleri
  document.getElementById('qCourseBadge').textContent = q.course;
  document.getElementById('qOutcomeBadge').textContent = q.outcomeCode;
  document.getElementById('qDifficultyBadge').textContent = q.difficulty;
  document.getElementById('qCodeBadge').textContent = q.id;

  const sourceBadge = document.getElementById('qSourceBadge');
  if (sourceBadge) {
    sourceBadge.textContent = q.sourceTag || test?.badge || '2024 LGS Formatı';
  }

  // Soru Numarası
  document.getElementById('qNumberDisplay').textContent = `${appState.currentQuestionIndex + 1}.`;

  // Metin ve Soru Kökü
  document.getElementById('stimulusBox').textContent = q.stimulus;
  document.getElementById('stemBox').textContent = q.stem;

  // Alt İlerleme
  const progressEl = document.getElementById('footerProgress');
  if (progressEl) {
    progressEl.textContent = `${appState.currentQuestionIndex + 1} / ${questions.length}`;
  }

  // Şıklar Listesi
  const optionsList = document.getElementById('optionsList');
  optionsList.innerHTML = '';

  const selectedAnswer = session.userAnswers[q.id];

  ['A', 'B', 'C', 'D'].forEach(opt => {
    const card = document.createElement('div');
    card.className = 'option-card';

    if (selectedAnswer === opt) {
      card.classList.add('selected');
    }

    // YALITIM KURALI:
    // Sadece 'practice' modunda cevap verildiğinde VEYA mevcut test bitirilmişse (examEvaluated) renkleri göster!
    if ((appState.currentMode === 'practice' && selectedAnswer) || session.examEvaluated) {
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
  const test = getCurrentTest();
  if (!test) return;

  const session = getSession(test.id);

  // Sınav modu değerlendirilmişse kitle
  if (appState.currentMode === 'exam' && session.examEvaluated) {
    return;
  }

  session.userAnswers[questionId] = selectedOption;
  renderQuestionNav();
  renderQuestion();
  renderSolutionDrawer();
  renderOpticalSheet();
  renderTestList(); // Test listesindeki ilerleme sayısını güncelle
}

// Soru Değiştirme (İleri / Geri)
function navigateQuestion(delta) {
  const questions = getCurrentQuestions();
  const nextIdx = appState.currentQuestionIndex + delta;
  if (nextIdx >= 0 && nextIdx < questions.length) {
    appState.currentQuestionIndex = nextIdx;
    renderQuestion();
    renderQuestionNav();
    renderSolutionDrawer();
    renderOpticalSheet();
  }
}

// Çözüm Rehberi Çekmecesini Yönet
function renderSolutionDrawer() {
  const drawer = document.getElementById('solutionDrawer');
  const q = getCurrentQuestion();
  if (!q) return;

  const test = getCurrentTest();
  const session = test ? getSession(test.id) : { userAnswers: {}, examEvaluated: false };
  const answered = session.userAnswers[q.id];

  // Sadece pratik modunda cevap verilmişse veya sınav değerlendirilmişse göster
  if ((appState.currentMode === 'practice' && answered) || session.examEvaluated) {
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

// Sağ Panel: Optik Formu Çiz (Ders ve Test Bazlı Yalıtılmış)
function renderOpticalSheet() {
  const container = document.getElementById('opticalRowsContainer');
  const questions = getCurrentQuestions();
  const test = getCurrentTest();
  if (!test) return;

  const session = getSession(test.id);
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const row = document.createElement('div');
    row.className = 'opt-row-item';

    if (idx === appState.currentQuestionIndex) {
      row.classList.add('current-active-row');
    }

    const selected = session.userAnswers[q.id];

    let bubblesHtml = '';
    ['A', 'B', 'C', 'D'].forEach(opt => {
      let extraClass = '';

      if (selected === opt) {
        extraClass += ' filled';
      }

      // SADECE VE SADECE BU TEST DEĞERLENDİRİLMİŞSE YEŞİL/KIRMIZI GÖSTER
      if (session.examEvaluated) {
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
        appState.currentQuestionIndex = idx;
        selectOption(qid, opt);
      });
    });

    // Satıra tıklayınca o soruya git
    row.addEventListener('click', () => {
      appState.currentQuestionIndex = idx;
      renderQuestion();
      renderQuestionNav();
      renderSolutionDrawer();
      renderOpticalSheet();
    });

    container.appendChild(row);
  });
}

// Sınavı Tamamla ve Optik Formu Tara (İstemci & Sunucu REST API Entegrasyonu)
async function finishExam() {
  const test = getCurrentTest();
  if (!test) return;

  const session = getSession(test.id);
  session.examEvaluated = true;

  const questions = test.questions || [];
  let correct = 0;
  let wrong = 0;
  let empty = 0;

  questions.forEach(q => {
    const ans = session.userAnswers[q.id];
    if (!ans) {
      empty++;
    } else if (ans === q.correctOption) {
      correct++;
    } else {
      wrong++;
    }
  });

  // MEB LGS Kuralı: 3 Yanlış 1 Doğruyu Götürür!
  const net = Math.max(0, correct - (wrong / 3));

  session.score = {
    correct,
    wrong,
    empty,
    net: parseFloat(net.toFixed(2)),
    totalQuestions: questions.length
  };

  // Arayüzü Anında Güncelle
  renderOpticalSheet();
  renderQuestion();
  renderSolutionDrawer();
  renderTestList();
  renderScoreReport();

  // Faz 3: Sunucu Tarafı Güvenli Kayıt (REST API)
  try {
    const response = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testId: test.id,
        answers: session.userAnswers,
        studentName: 'Kerem Çelik',
        mode: appState.currentMode.toUpperCase(),
        durationSeconds: (30 * 60 - appState.timerSeconds)
      })
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.session) {
        session.apiSessionId = data.session.sessionId;
        session.deficiencies = data.session.deficiencies;
        renderScoreReport(); // Sunucu analiz raporuyla zenginleştir
      }
    }
  } catch (err) {
    console.log('ℹ️ API çevrimdışı, yerel değerlendirme devrede.', err);
  }
}

// Karne Raporunu Göster / Gizle
function renderScoreReport() {
  const test = getCurrentTest();
  const reportCard = document.getElementById('scoreReportCard');
  if (!reportCard) return;

  if (!test) {
    reportCard.classList.add('hidden');
    return;
  }

  const session = getSession(test.id);

  if (session.examEvaluated && session.score) {
    reportCard.classList.remove('hidden');

    document.getElementById('scoreCorrect').textContent = session.score.correct;
    document.getElementById('scoreWrong').textContent = session.score.wrong;
    document.getElementById('scoreEmpty').textContent = session.score.empty;
    document.getElementById('scoreNet').textContent = session.score.net.toFixed(2);

    const feedbackEl = document.getElementById('reportFeedbackText');
    if (feedbackEl) {
      let deficiencyHtml = '';
      if (session.deficiencies && session.deficiencies.length > 0) {
        const items = session.deficiencies.slice(0, 3).map(d => 
          `<li><strong>${d.outcomeCode}:</strong> ${d.distractorReason}</li>`
        ).join('');
        deficiencyHtml = `
          <div style="margin-top: 10px; padding: 10px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;">
            <div style="color: #b45309; font-size: 11px; font-weight: 800; margin-bottom: 4px; display:flex; align-items:center; gap:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              EKSİK KAZANIM RAPORU (JEV Analizi)
            </div>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #78350f;">
              ${items}
            </ul>
          </div>
        `;
      }

      let sessionMeta = session.apiSessionId ? 
        `<div style="font-size: 10px; color: #64748b; margin-top: 8px; font-family: var(--font-mono); display:flex; align-items:center; gap:4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Sunucuya Kaydedildi (ID: ${session.apiSessionId.slice(0, 8)}...)
        </div>` : '';

      if (session.score.wrong > 0) {
        feedbackEl.innerHTML = `<div style="display:flex; align-items:flex-start; gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div><strong>Kazanım Eksikliği Tespiti:</strong> Yanlış yaptığınız sorularda güçlü çeldiriciye takıldınız. Sağlanan "Uzman Öğretmen Çözüm Taktikleri"ni inceleyiniz.${deficiencyHtml}${sessionMeta}</div>
        </div>`;
      } else if (session.score.correct === session.score.totalQuestions) {
        feedbackEl.innerHTML = `<div style="display:flex; align-items:flex-start; gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          <div><strong>Mükemmel Başarı:</strong> ${test.title} içindeki tüm soruları tam netle tamamladınız!${sessionMeta}</div>
        </div>`;
      } else {
        feedbackEl.innerHTML = `<div style="display:flex; align-items:flex-start; gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div><strong>Tavsiye:</strong> Boş bıraktığınız sorular için kısıt ve hipotez kurallarını tekrar gözden geçiriniz.${deficiencyHtml}${sessionMeta}</div>
        </div>`;
      }
    }
  } else {
    reportCard.classList.add('hidden');
  }
}

// Sınavı Sıfırla (Sadece Mevcut Test İçin)
function resetExam() {
  const test = getCurrentTest();
  if (!test) return;

  const session = getSession(test.id);
  session.userAnswers = {};
  session.examEvaluated = false;
  session.score = null;
  appState.currentQuestionIndex = 0;

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

// ============================================================================
// FAZ 5: Shadcn/UI Öğretmen & Yönetici Paneli & Canlı AI Soru Stüdyosu
// ============================================================================

let lastGeneratedAiQuestion = null;

// Yönetici Panelini Render Et
async function renderAdminDashboard() {
  // Toplam Soru Sayısı
  let totalQ = 0;
  for (const cKey of ['turkce', 'matematik', 'fen', 'sosyal']) {
    const course = appState.multiTestBank[cKey];
    if (course && course.tests) {
      totalQ += course.tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0);
    }
  }
  const totalQEl = document.getElementById('adminStatTotalQuestions');
  if (totalQEl) totalQEl.textContent = totalQ;

  // Çözülen Oturum Sayısı ve Ortalama Net
  const completedSessions = Object.values(appState.sessions).filter(s => s.examEvaluated && s.score);
  const totalSessionsEl = document.getElementById('adminStatTotalSessions');
  const avgNetEl = document.getElementById('adminStatAvgNet');

  if (totalSessionsEl) totalSessionsEl.textContent = completedSessions.length;
  if (avgNetEl) {
    if (completedSessions.length > 0) {
      const sumNet = completedSessions.reduce((acc, s) => acc + s.score.net, 0);
      avgNetEl.textContent = (sumNet / completedSessions.length).toFixed(2);
    } else {
      avgNetEl.textContent = '--';
    }
  }

  // Ollama Modellerini Çek ve Listele
  try {
    const res = await fetch('/api/ai/models');
    if (res.ok) {
      const data = await res.json();
      const select = document.getElementById('aiModelSelect');
      const badge = document.getElementById('aiModelBadge');
      if (select && data.models && data.models.length > 0) {
        select.innerHTML = '';
        data.models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m + (m.includes('qwen') ? ' (Önerilen)' : '');
          select.appendChild(opt);
        });
        if (badge) badge.textContent = `${data.models.length} Model Aktif`;
      }
    }
  } catch (err) {
    console.log('Ollama model listesi yerel modda.');
  }

  // Oturum Geçmişi Tablosunu Doldur
  const tbody = document.getElementById('adminSessionsTableBody');
  if (tbody) {
    if (completedSessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-table-cell">Henüz çözülmüş sınav oturumu bulunmuyor. Bir test çözüp tamamlayınız.</td></tr>`;
    } else {
      tbody.innerHTML = completedSessions.map(s => `
        <tr>
          <td><strong>Kerem Çelik</strong></td>
          <td>${s.score?.totalQuestions ? `${s.score.totalQuestions} Soruluk LGS Testi` : 'LGS Denemesi'}</td>
          <td><span style="color:#059669; font-weight:700;">${s.score.correct} D</span> / <span style="color:#dc2626; font-weight:700;">${s.score.wrong} Y</span> / <span>${s.score.empty} B</span></td>
          <td><strong style="color:#2563eb; font-size:14px;">${s.score.net.toFixed(2)}</strong></td>
          <td><span class="badge-pill" style="background:#dcfce7; color:#15803d; font-weight:700; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Tamamlandı</span></td>
        </tr>
      `).join('');
    }
  }
}

// Canlı AI Soru Üret (Ollama + JEV Self-Correction Pipeline)
async function generateAiQuestion() {
  const course = document.getElementById('aiCourseSelect')?.value || 'turkce';
  const topic = document.getElementById('aiTopicInput')?.value || 'Paragrafta Anlam';
  const model = document.getElementById('aiModelSelect')?.value || 'qwen2.5:3b';
  const difficulty = document.getElementById('aiDifficultySelect')?.value || 'LGS Yeni Nesil';

  const statusEl = document.getElementById('aiGenerationStatus');
  const btnGen = document.getElementById('btnGenerateAiQuestion');
  const previewBox = document.getElementById('aiQuestionPreviewBox');

  if (statusEl) {
    statusEl.classList.remove('hidden');
    statusEl.innerHTML = `<span class="spinner" style="display:inline-block; width:12px; height:12px; border:2px solid #2563eb; border-top-color:transparent; border-radius:50%; margin-right:6px; animation:spin 1s linear infinite;"></span> ${model} modeli soruyu kurguluyor ve JEV denetliyor...`;
  }
  if (btnGen) btnGen.disabled = true;

  try {
    const res = await fetch('/api/ai/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course, topic, model, difficulty })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.question) {
        lastGeneratedAiQuestion = data.question;

        if (previewBox) {
          previewBox.classList.remove('hidden');

          document.getElementById('prevCourse').textContent = data.question.course;
          document.getElementById('prevDifficulty').textContent = data.question.difficulty;
          document.getElementById('prevJevScore').textContent = `JEV ONAYLI: ${data.audit.score} (Deneme: ${data.attempts})`;

          document.getElementById('prevStimulus').textContent = data.question.stimulus;
          document.getElementById('prevStem').textContent = data.question.stem;

          const optionsGrid = document.getElementById('prevOptions');
          if (optionsGrid && data.question.options) {
            optionsGrid.innerHTML = Object.entries(data.question.options).map(([k, v]) => `
              <div class="prev-opt-item ${k === data.question.correctOption ? 'correct' : ''}">
                <strong>${k})</strong> ${v} ${k === data.question.correctOption ? ' (Doğru Seçenek)' : ''}
              </div>
            `).join('');
          }

          const strategyBox = document.getElementById('prevStrategy');
          if (strategyBox) {
            strategyBox.innerHTML = `<strong>${data.question.solutionStrategy}</strong><br/><span style="color:#475569;">${data.question.detailedSolution}</span>`;
          }
        }
      }
    }
  } catch (err) {
    alert('AI soru üretiminde hata: ' + err.message);
  } finally {
    if (statusEl) statusEl.classList.add('hidden');
    if (btnGen) btnGen.disabled = false;
  }
}

// Üretilen Soruyu Canlı Havuza Ekle
function saveAiQuestionToBank() {
  if (!lastGeneratedAiQuestion) return;

  const courseKey = lastGeneratedAiQuestion.course.toLowerCase();
  const targetCourse = appState.multiTestBank[courseKey] || appState.multiTestBank.turkce;

  if (targetCourse && targetCourse.tests && targetCourse.tests[0]) {
    targetCourse.tests[0].questions.push(lastGeneratedAiQuestion);
    updateCourseBadges();
    renderAdminDashboard();
    alert(`Tebrikler! "${lastGeneratedAiQuestion.id}" kodlu yeni nesil soru ${targetCourse.courseName} havuzuna başarıyla eklendi.`);

    const previewBox = document.getElementById('aiQuestionPreviewBox');
    if (previewBox) previewBox.classList.add('hidden');
    lastGeneratedAiQuestion = null;
  }
}

// Resmi MEB Yazdırılabilir Kitapçık ve Optik Form (@media print)
function preparePrintBooklet() {
  const container = document.getElementById('printBookletContainer');
  if (!container) return;

  const courseData = getCurrentCourseData();
  const test = getCurrentTest();
  if (!test) return;

  let questionsHtml = '';
  test.questions.forEach((q, idx) => {
    questionsHtml += `
      <div class="print-question-card">
        <div class="print-q-num">SORU ${idx + 1} (${q.outcomeCode})</div>
        <div style="margin: 8px 0; font-size: 11pt; line-height: 1.4;">${q.stimulus}</div>
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 11pt;">${q.stem}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10pt;">
          <div><strong>A)</strong> ${q.options.A}</div>
          <div><strong>B)</strong> ${q.options.B}</div>
          <div><strong>C)</strong> ${q.options.C}</div>
          <div><strong>D)</strong> ${q.options.D}</div>
        </div>
      </div>
    `;
  });

  let opticalRows = '';
  test.questions.forEach((q, idx) => {
    opticalRows += `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px; font-family: monospace;">
        <span style="width: 24px; font-weight: bold;">${idx + 1}.</span>
        <span>( A )</span> <span>( B )</span> <span>( C )</span> <span>( D )</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="print-cover-page">
      <div style="font-size: 16pt; font-weight: bold; margin-bottom: 20px;">T.C. MİLLÎ EĞİTİM BAKANLIĞI</div>
      <div class="print-cover-title">8. SINIF MERKEZİ SINAV (LGS) DENEME KİTAPÇIĞI</div>
      <div class="print-cover-sub">Türkiye Yüzyılı Maarif Modeli • ${courseData.courseName} - ${test.title}</div>
      <div style="border: 2px solid #000; padding: 20px; width: 80%; margin: 20px auto; text-align: left; font-size: 11pt;">
        <p><strong>ADAYIN ADI SOYADI:</strong> ..............................................................</p>
        <p><strong>T.C. KİMLİK NUMARASI:</strong> ..............................................................</p>
        <p><strong>KİTAPÇIK TÜRÜ:</strong> A</p>
        <p><strong>TOPLAM SORU SAYISI:</strong> ${test.questions.length} Soru</p>
        <p><strong>SINAV SÜRESİ:</strong> 30 Dakika</p>
      </div>
      <p style="font-size: 10pt; color: #444; margin-top: 30px;">Bu test JEV System-1 yapay zekâ kalite denetiminden geçmiş ve MEB standartlarına uygun olarak derlenmiştir.</p>
    </div>

    <div style="padding: 20px 0;">
      <div style="text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 8px;">
        ${courseData.courseName.toUpperCase()} DERSİ SINAV SORULARI (${test.title})
      </div>
      <div class="print-questions-grid">
        ${questionsHtml}
      </div>
    </div>

    <div class="print-optical-page">
      <div style="text-align: center; font-weight: bold; font-size: 16pt; margin-bottom: 16px;">
        ÖDSGM LGS OPTİK CEVAP KAĞIDI (A KİTAPÇIĞI)
      </div>
      <div style="display: flex; justify-content: space-around; border: 1px solid #000; padding: 12px; margin-bottom: 20px;">
        <span><strong>DERS:</strong> ${courseData.courseName}</span>
        <span><strong>TEST:</strong> ${test.id}</span>
        <span><strong>SORU SAYISI:</strong> ${test.questions.length}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 0 40px;">
        <div>${opticalRows}</div>
      </div>
    </div>
  `;
}
