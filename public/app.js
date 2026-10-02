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
  multiTestBank: {},
  theme: localStorage.getItem('meb_theme') || 'light',
  user: JSON.parse(localStorage.getItem('meb_user') || 'null') || {
    name: 'Kerem Çelik',
    no: '571',
    class: '8/A',
    target: 'Fen Lisesi (500 Tam Puan Hedefi)'
  }
};

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initPortalAuth();
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

  // Detaylı Çeldirici Raporu Aç/Kapa
  const btnToggleBreakdown = document.getElementById('btnToggleDetailedBreakdown');
  const breakdownBox = document.getElementById('detailedBreakdownContainer');
  if (btnToggleBreakdown && breakdownBox) {
    btnToggleBreakdown.addEventListener('click', () => {
      breakdownBox.classList.toggle('hidden');
    });
  }

  // JEV Video Çözüm Modalı Dinleyicileri
  const btnOpenVideo = document.getElementById('btnOpenVideoSolution');
  const btnCloseVideo = document.getElementById('btnCloseVideoModal');
  if (btnOpenVideo) btnOpenVideo.addEventListener('click', openVideoSolutionModal);
  if (btnCloseVideo) btnCloseVideo.addEventListener('click', closeVideoSolutionModal);

  // Toplu Üretim & Bulut Senkronizasyon Eylemleri
  const btnBatch = document.getElementById('btnTriggerBatchGen');
  const btnCloud = document.getElementById('btnTriggerCloudBackup');
  const cloudStatus = document.getElementById('cloudSyncStatusText');

  if (btnBatch) {
    btnBatch.addEventListener('click', async () => {
      if (cloudStatus) {
        cloudStatus.classList.remove('hidden');
        cloudStatus.innerHTML = '<span class="spinner" style="display:inline-block; width:12px; height:12px; border:2px solid #7c3aed; border-top-color:transparent; border-radius:50%; margin-right:6px; animation:spin 1s linear infinite;"></span> 4 branş ve 4 seviyede JEV denetimli 16 soru üretiliyor...';
      }
      try {
        const res = await fetch('/api/ai/batch-generate', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          if (cloudStatus) {
            cloudStatus.innerHTML = `[OK] ${data.count} yeni nesil soru başarıyla üretildi ve JEV System-1 tarafından %100 onaylandı.`;
          }
          alert(`Tebrikler! ${data.count} yeni nesil LGS sorusu JEV onaylı olarak üretildi.`);
          renderAdminDashboard();
        }
      } catch (err) {
        if (cloudStatus) cloudStatus.innerHTML = `[HATA] Toplu üretim başarısız: ${err.message}`;
      }
    });
  }

  if (btnCloud) {
    btnCloud.addEventListener('click', async () => {
      if (cloudStatus) {
        cloudStatus.classList.remove('hidden');
        cloudStatus.innerHTML = '<span class="spinner" style="display:inline-block; width:12px; height:12px; border:2px solid #2563eb; border-top-color:transparent; border-radius:50%; margin-right:6px; animation:spin 1s linear infinite;"></span> Gzip Level-9 sıkıştırma ve Google Drive streaming başlatıldı...';
      }
      try {
        const res = await fetch('/api/cloud/sync', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          if (cloudStatus) {
            cloudStatus.innerHTML = `[BULUT AKTARIMI BAŞARILI]<br/>Hedef: kerem.newton571@gmail.com (5 TB Drive)<br/>Orijinal: ${data.rawSizeKb} KB | Sıkıştırılmış: ${data.compSizeKb} KB (%${data.ratio} Tasarruf)<br/>Yerel SSD Tüketimi: 0 KB (Zero-Disk Stream)`;
          }
        }
      } catch (err) {
        if (cloudStatus) cloudStatus.innerHTML = `[HATA] Bulut yedekleme: ${err.message}`;
      }
    });
  }
}

// 3.1. Tema Yönetimi (Dark / Light)
function initTheme() {
  const saved = localStorage.getItem('meb_theme') || 'light';
  applyTheme(saved);

  const btn = document.getElementById('btnThemeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('meb_theme', next);
    });
  }
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-theme');
    document.querySelector('.icon-sun')?.classList.add('hidden');
    document.querySelector('.icon-moon')?.classList.remove('hidden');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('dark-theme');
    document.querySelector('.icon-sun')?.classList.remove('hidden');
    document.querySelector('.icon-moon')?.classList.add('hidden');
  }
}

// 3.2. Kurumsal MEB Maarif Portalı (Giriş Ekranı & Profil)
function initPortalAuth() {
  const savedUser = JSON.parse(localStorage.getItem('meb_user') || 'null');
  if (savedUser) {
    appState.user = savedUser;
  }
  updateUserDisplay();

  const btnUser = document.getElementById('btnUserProfile');
  if (btnUser) {
    btnUser.addEventListener('click', openPortalModal);
  }

  const form = document.getElementById('portalLoginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inputStudentName')?.value.trim() || 'Kerem Çelik';
      const no = document.getElementById('inputStudentNo')?.value.trim() || '571';
      const cls = document.getElementById('selectStudentClass')?.value || '8/A';
      const target = document.getElementById('selectStudentTarget')?.value || 'Fen Lisesi (500 Tam Puan)';

      appState.user = { name, no, class: cls, target };
      localStorage.setItem('meb_user', JSON.stringify(appState.user));
      updateUserDisplay();
      closePortalModal();
    });
  }

  const btnDemo = document.getElementById('btnQuickDemoLogin');
  if (btnDemo) {
    btnDemo.addEventListener('click', () => {
      appState.user = {
        name: 'Kerem Çelik',
        no: '571',
        class: '8/A',
        target: 'Fen Lisesi (500 Tam Puan Hedefi)'
      };
      localStorage.setItem('meb_user', JSON.stringify(appState.user));
      updateUserDisplay();
      closePortalModal();
    });
  }

  // İlk gelişte kullanıcı kayıtlı değilse modalı göster
  if (!savedUser) {
    openPortalModal();
  }
}

function updateUserDisplay() {
  const nameEl = document.getElementById('navUserName');
  const badgeEl = document.getElementById('navUserBadge');
  if (nameEl) nameEl.textContent = appState.user.name;
  if (badgeEl) badgeEl.textContent = `${appState.user.class} • No: ${appState.user.no}`;
}

function openPortalModal() {
  const modal = document.getElementById('portalAuthModal');
  if (modal) {
    modal.classList.remove('hidden');
    if (document.getElementById('inputStudentName')) {
      document.getElementById('inputStudentName').value = appState.user.name;
    }
    if (document.getElementById('inputStudentNo')) {
      document.getElementById('inputStudentNo').value = appState.user.no;
    }
  }
}

function closePortalModal() {
  const modal = document.getElementById('portalAuthModal');
  if (modal) modal.classList.add('hidden');
}

// 3.3. Zorluk Seviyesi Yardımcıları
function getDifficultyBadgeClass(diff) {
  if (!diff) return 'badge-diff-lgs';
  const d = diff.toLowerCase();
  if (d.includes('kavrama') || d === 'kavrama') return 'badge-diff-kavrama';
  if (d.includes('uygulama') || d === 'uygulama') return 'badge-diff-uygulama';
  if (d.includes('olimpiyat') || d.includes('sampiyon') || d.includes('şampiyon') || d === 'sekil_ve_olimpiyat') return 'badge-diff-sampiyon';
  return 'badge-diff-lgs';
}

function formatDifficultyText(diff) {
  if (!diff) return 'LGS Yeni Nesil';
  if (diff === 'KAVRAMA') return 'Temel (Kavrama)';
  if (diff === 'UYGULAMA') return 'Orta (Uygulama)';
  if (diff === 'LGS_YENI_NESIL') return 'LGS Yeni Nesil';
  if (diff === 'SEKIL_VE_OLIMPIYAT') return 'Şampiyon Düzeyi';
  return diff;
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
  const diffBadge = document.getElementById('qDifficultyBadge');
  if (diffBadge) {
    diffBadge.textContent = formatDifficultyText(q.difficulty);
    diffBadge.className = 'badge-pill ' + getDifficultyBadgeClass(q.difficulty);
  }
  document.getElementById('qCodeBadge').textContent = q.id;

  const sourceBadge = document.getElementById('qSourceBadge');
  if (sourceBadge) {
    sourceBadge.textContent = q.sourceTag || test?.badge || '2024 LGS Formatı';
  }

  // JEV 1-5 Yıldız Zorluk Derecelendirmesi
  const starBadge = document.getElementById('qStarBadge');
  const jevStarEl = document.getElementById('jevStarRatingText');
  const starInfo = q.starRating || {
    stars: 4,
    starLabel: '★★★★☆',
    category: '4 Yıldız • LGS Yeni Nesil',
    placement: 'LGS Standart Deneme Ana Omurgası'
  };

  if (starBadge) {
    starBadge.textContent = `${starInfo.starLabel} ${starInfo.stars} Yıldız`;
    starBadge.title = `${starInfo.category} (${starInfo.placement})`;
  }

  if (jevStarEl) {
    jevStarEl.textContent = `${starInfo.starLabel} (${starInfo.stars}/5)`;
    jevStarEl.title = starInfo.category;
  }

  // Soru Numarası
  document.getElementById('qNumberDisplay').textContent = `${appState.currentQuestionIndex + 1}.`;

  // Metin ve Soru Kökü
  document.getElementById('stimulusBox').textContent = q.stimulus;

  // Görsel / SVG / Tablo
  const visualBox = document.getElementById('visualContentBox');
  if (visualBox) {
    if (q.visualContent) {
      visualBox.innerHTML = q.visualContent;
      visualBox.classList.remove('hidden');
    } else {
      visualBox.innerHTML = '';
      visualBox.classList.add('hidden');
    }
  }

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

// 4.2. JEV Video Çözüm Senaryosu ve Dizgi Modalı Fonksiyonları
function openVideoSolutionModal() {
  const questions = getCurrentQuestions();
  const q = questions[appState.currentQuestionIndex];
  if (!q) return;

  const modal = document.getElementById('videoSolutionModal');
  const titleEl = document.getElementById('videoModalTitle');
  const contentEl = document.getElementById('videoModalContent');
  if (!modal || !contentEl) return;

  titleEl.textContent = `🎬 JEV Video Çözüm Senaryosu — ${q.id} (${q.course})`;

  const correctOpt = q.correctAnswer || 'A';
  const wrongOptions = ['A', 'B', 'C', 'D'].filter(opt => opt !== correctOpt);
  const distractors = q.distractors || {};

  contentEl.innerHTML = `
    <div style="background:rgba(37,99,235,0.08); border:1px solid #bfdbfe; border-radius:8px; padding:12px; font-size:12px;">
      <div style="display:flex; justify-content:space-between; font-weight:700; color:#1e40af; margin-bottom:4px;">
        <span>🎯 Hedef Süre: 90 Saniye (1.5 Dk)</span>
        <span>⭐ Zorluk: ${q.starRating?.starLabel || '4 Yıldız'}</span>
        <span>🏷️ Kazanım: ${q.outcomeCode || 'MEB Maarif'}</span>
      </div>
      <div style="color:var(--text-muted);">
        <strong>Öğretmen Replik Tonu:</strong> Samimi, anlaşılır, MEB Maarif ve LGS odaklı motive edici ses tonu.
      </div>
    </div>

    <!-- Sahne 1 -->
    <div class="storyboard-step">
      <div class="storyboard-step-header">
        <strong style="color:#2563eb;">1. Sahne: Soru Kökü ve Kritik İpucu Vurgusu</strong>
        <span class="storyboard-time">00:00 - 00:15</span>
      </div>
      <div style="font-size:12px; margin-bottom:6px; color:var(--text-muted);">
        <strong>Görsel/Tahta Aksiyonu:</strong> Soru ekranda tam sayfa belirir; soru kökündeki olumsuz veya kilit ifadeler sarı fosforla çizilir.
      </div>
      <div style="font-size:13px; line-height:1.5; padding:8px; background:rgba(0,0,0,0.03); border-left:3px solid #2563eb; border-radius:4px;">
        <em>"Sevgili öğrencilerimiz, bu sorumuzda <strong>${q.topic || 'ilgili MEB konusu'}</strong> kazanımını ele alıyoruz. İlk önce soru kökünü dikkatle okuyoruz ve bizden tam olarak neyin istendiğini belirliyoruz."</em>
      </div>
    </div>

    <!-- Sahne 2 -->
    <div class="storyboard-step">
      <div class="storyboard-step-header">
        <strong style="color:#10b981;">2. Sahne: Verilerin Şematize Edilmesi & İpucu</strong>
        <span class="storyboard-time">00:15 - 00:35</span>
      </div>
      <div style="font-size:12px; margin-bottom:6px; color:var(--text-muted);">
        <strong>Görsel/Tahta Aksiyonu:</strong> Öncüldeki kritik veriler tahtaya kısa maddeler halinde çıkarılır, varsa geometri veya deney şeması çizilir.
      </div>
      <div style="font-size:13px; line-height:1.5; padding:8px; background:rgba(0,0,0,0.03); border-left:3px solid #10b981; border-radius:4px;">
        <em>"Soruda bize verilen kilit bilgilere bakalım: ${q.stimulus ? q.stimulus.slice(0, 110) + '...' : 'Verilen öncül verileri'} bizim hareket noktamızı oluşturuyor."</em>
      </div>
    </div>

    <!-- Sahne 3 -->
    <div class="storyboard-step">
      <div class="storyboard-step-header">
        <strong style="color:#f59e0b;">3. Sahne: Adım Adım Çözüm ve Mantık Yürütme</strong>
        <span class="storyboard-time">00:35 - 01:05</span>
      </div>
      <div style="font-size:12px; margin-bottom:6px; color:var(--text-muted);">
        <strong>Görsel/Tahta Aksiyonu:</strong> Çözüm adımları tahtada renkli kalemlerle satır satır yazılır; ara işlemler netleştirilir.
      </div>
      <div style="font-size:13px; line-height:1.5; padding:8px; background:rgba(0,0,0,0.03); border-left:3px solid #f59e0b; border-radius:4px;">
        <em>"Şimdi çözüm stratejimize geçelim: ${q.detailedSolution ? q.detailedSolution.slice(0, 200) + '...' : q.solutionStrategy} Gördüğünüz gibi işlem zinciri bizi şüpheye yer bırakmadan doğru hedefe taşıyor."</em>
      </div>
    </div>

    <!-- Sahne 4 -->
    <div class="storyboard-step">
      <div class="storyboard-step-header">
        <strong style="color:#ef4444;">4. Sahne: Çeldiricilerin Elenmesi (Tuzak Analizi)</strong>
        <span class="storyboard-time">01:05 - 01:20</span>
      </div>
      <div style="font-size:12px; margin-bottom:6px; color:var(--text-muted);">
        <strong>Görsel/Tahta Aksiyonu:</strong> Yanlış seçeneklerin üstü kırmızı çizgiyle çizilir, tuzağın sebebi ekranda ikaz simgesiyle gösterilir.
      </div>
      <div style="font-size:13px; line-height:1.5; padding:8px; background:rgba(0,0,0,0.03); border-left:3px solid #ef4444; border-radius:4px;">
        <em>"Peki diğer seçenekler neden eleniyor? Örneğin ${wrongOptions[0]} seçeneğinde en sık yapılan hata: ${distractors[wrongOptions[0]] || 'kuralın ters yorumlanmasıdır'}. Bu nedenle bu şıkları eliyoruz."</em>
      </div>
    </div>

    <!-- Sahne 5 -->
    <div class="storyboard-step">
      <div class="storyboard-step-header">
        <strong style="color:#8b5cf6;">5. Sahne: Doğru Cevabın Mühürlenmesi</strong>
        <span class="storyboard-time">01:20 - 01:30</span>
      </div>
      <div style="font-size:12px; margin-bottom:6px; color:var(--text-muted);">
        <strong>Görsel/Tahta Aksiyonu:</strong> Doğru seçenek olan <strong>${correctOpt}</strong> şıkkı yeşil halka içine alınır ve onay tiki konur.
      </div>
      <div style="font-size:13px; line-height:1.5; padding:8px; background:rgba(0,0,0,0.03); border-left:3px solid #8b5cf6; border-radius:4px;">
        <em>"Dolayısıyla doğru cevabımız kesin ve net bir şekilde <strong>${correctOpt}</strong> seçeneğidir. Başarılar dilerim!"</em>
      </div>
    </div>

    <!-- Yayınevi Dizgi ve InDesign/LaTeX Bilgisi -->
    <div style="margin-top:10px; padding:12px; background:#18181b; color:#10b981; font-family:monospace; font-size:11px; border-radius:8px; overflow-x:auto;">
      <div style="color:#a1a1aa; margin-bottom:4px;">// Adobe InDesign XML & LaTeX Dizgi Etiketi</div>
      &lt;question id="${q.id}" stars="${q.starRating?.stars || 4}" format="LGS_2Column_A4"&gt;<br/>
      &nbsp;&nbsp;&lt;stem&gt;${q.stem ? q.stem.slice(0, 80) : ''}...&lt;/stem&gt;<br/>
      &nbsp;&nbsp;&lt;correct_option&gt;${correctOpt}&lt;/correct_option&gt;<br/>
      &nbsp;&nbsp;&lt;has_vector_svg&gt;${q.hasVisual ? 'true' : 'false'}&lt;/has_vector_svg&gt;<br/>
      &lt;/question&gt;
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeVideoSolutionModal() {
  const modal = document.getElementById('videoSolutionModal');
  if (modal) modal.classList.add('hidden');
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
        studentName: appState.user?.name || 'Kerem Çelik',
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
    renderDetailedBreakdown();
  } else {
    reportCard.classList.add('hidden');
  }
}

// Detaylı Soru ve Çeldirici Raporunu Doldur
function renderDetailedBreakdown() {
  const test = getCurrentTest();
  const container = document.getElementById('detailedBreakdownContainer');
  if (!test || !container) return;

  const session = getSession(test.id);
  const questions = test.questions || [];

  container.innerHTML = questions.map((q, idx) => {
    const userAns = session.userAnswers[q.id];
    const isCorrect = userAns === q.correctOption;
    const isEmpty = !userAns;

    let statusBadge = '';
    let itemBorder = '#e2e8f0';
    let itemBg = 'var(--bg-page)';

    if (isCorrect) {
      statusBadge = '<span class="badge-pill" style="background:#dcfce7; color:#15803d; font-weight:700;">Doğru (+' + userAns + ')</span>';
      itemBorder = '#bbf7d0';
    } else if (isEmpty) {
      statusBadge = '<span class="badge-pill" style="background:#f1f5f9; color:#475569; font-weight:700;">Boş</span>';
      itemBorder = '#e2e8f0';
    } else {
      statusBadge = '<span class="badge-pill" style="background:#fee2e2; color:#b91c1c; font-weight:700;">Yanlış (' + userAns + ' / Doğru: ' + q.correctOption + ')</span>';
      itemBorder = '#fecaca';
      itemBg = '#fffafa';
    }

    let distractorExplanation = '';
    if (!isCorrect && !isEmpty && q.distractors && q.distractors[userAns]) {
      distractorExplanation = `<div style="font-size:11px; color:#b45309; margin-top:4px;"><strong>Yanılgı Analizi:</strong> ${q.distractors[userAns]}</div>`;
    }

    return `
      <div class="breakdown-q-card" style="padding:10px 12px; border:1px solid ${itemBorder}; background:${itemBg}; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:12px;">Soru ${idx + 1}: ${q.outcomeCode || 'LGS Kazanımı'}</strong>
          ${statusBadge}
        </div>
        ${distractorExplanation}
        <button type="button" class="btn-goto-solution" onclick="inspectQuestionSolution(${idx})" style="margin-top:6px; background:none; border:none; color:var(--accent-blue); font-size:11px; font-weight:700; cursor:pointer; text-decoration:underline;">
          Çözüm ve Taktikleri İncele →
        </button>
      </div>
    `;
  }).join('');
}

// İlgili Soruya Odaklan ve Çözüm Çekmecesini Aç
window.inspectQuestionSolution = function(idx) {
  appState.currentQuestionIndex = idx;
  setMode('practice');
  renderQuestion();
  renderSolutionDrawer();
  const drawer = document.getElementById('solutionDrawer');
  if (drawer) {
    drawer.scrollIntoView({ behavior: 'smooth' });
  }
};

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
          const prevDiffEl = document.getElementById('prevDifficulty');
          if (prevDiffEl) {
            prevDiffEl.textContent = formatDifficultyText(data.question.difficulty);
            prevDiffEl.className = 'badge-pill ' + getDifficultyBadgeClass(data.question.difficulty);
          }
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
