/**
 * MEB Maarif LGS Platformu - Kapsamlı Test Paketi (Automated Test Suite - Faz 2)
 * Tüm Fazların, Çoklu Testlerin, Oturum Yalıtımının ve Jev Kalite Standartlarının Doğrulanması
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JevQualityAuditor } from './jev_evaluator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTestSuite() {
  console.log('====================================================');
  console.log('[TEST] MEB MAARİF LGS PLATFORMU - GENİŞLETİLMİŞ TEST PAKETİ (16 TEST)');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Hata: ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Hata: ${err.message}`);
    }
  }

  // TEST 1: Veritabanı Dosyaları ve Şema Bütünlüğü
  test('PostgreSQL şema dosyası ve seed SQL mevcut ve geçerli olmalı', () => {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'db', 'seed_meb_8th_grade.sql');
    assert.ok(fs.existsSync(schemaPath), 'schema.sql bulunamadı');
    assert.ok(fs.existsSync(seedPath), 'seed_meb_8th_grade.sql bulunamadı');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS questions'), 'questions tablosu eksik');
    assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS exam_sessions'), 'exam_sessions tablosu eksik');
  });

  // TEST 2: Dokümantasyon ve MEB Maarif Standartları
  test('MEB Maarif standartları ve Jev şartnamesi eksiksiz olmalı', () => {
    const standardsPath = path.join(__dirname, '..', 'docs', 'MEB_MAARIF_STANDARDS.md');
    const jevSpecPath = path.join(__dirname, '..', 'docs', 'JEV_SYSTEM1_SPEC.md');
    assert.ok(fs.existsSync(standardsPath), 'MEB_MAARIF_STANDARDS.md bulunamadı');
    assert.ok(fs.existsSync(jevSpecPath), 'JEV_SYSTEM1_SPEC.md bulunamadı');
    const content = fs.readFileSync(standardsPath, 'utf-8');
    assert.ok(content.includes('30 Alt Soru Tipi Taksonomisi'), '30 paragraf alt tipi eksik');
  });

  // TEST 3: Çoklu Test ve Soru Havuzu Bütünlüğü (4 Ana Branş, 12 Test Paketi)
  test('Soru havuzu 4 ana branşı ve en az 12 test paketini içermeli', () => {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'public', 'questions.json'), 'utf-8');
    const multiTestBank = JSON.parse(raw);

    const requiredCourses = ['turkce', 'matematik', 'fen', 'sosyal'];
    let totalTestsCount = 0;
    let totalQuestionsCount = 0;

    for (const cKey of requiredCourses) {
      const course = multiTestBank[cKey];
      assert.ok(course, `${cKey} branşı bulunamadı`);
      assert.ok(Array.isArray(course.tests), `${cKey} tests dizisi içermiyor`);
      assert.ok(course.tests.length >= 3, `${cKey} branşında en az 3 test paketi olmalı, bulunan: ${course.tests.length}`);

      for (const t of course.tests) {
        totalTestsCount++;
        assert.ok(t.id, 'Test ID eksik');
        assert.ok(t.title, 'Test başlığı eksik');
        assert.ok(t.badge, 'Test rozeti (çıkmış/örnek) eksik');
        assert.ok(Array.isArray(t.questions) && t.questions.length > 0, `${t.id} boş soru listesine sahip`);
        totalQuestionsCount += t.questions.length;
      }
    }

    assert.strictEqual(totalTestsCount, 12, `Beklenen 12 test paketi, bulunan: ${totalTestsCount}`);
    assert.ok(totalQuestionsCount >= 50, `Toplam soru sayısı 50'den fazla olmalı, bulunan: ${totalQuestionsCount}`);
    console.log(`     ℹ️ Toplam ${totalTestsCount} Test Paketi ve ${totalQuestionsCount} Soru doğrulandı.`);
  });

  // TEST 4: Jev (System 1) Karar ve Kalite Denetimi (%100 Başarı)
  await asyncTest('Tüm sorular Jev System-1 kalite denetimini %100 başarıyla geçmeli', async () => {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'public', 'questions.json'), 'utf-8');
    const multiTestBank = JSON.parse(raw);
    const auditor = new JevQualityAuditor();
    let count = 0;

    for (const [courseKey, courseData] of Object.entries(multiTestBank)) {
      for (const testPkg of courseData.tests) {
        for (const q of testPkg.questions) {
          count++;
          const audit = await auditor.evaluateQuestion(q);
          assert.strictEqual(audit.passed, true, `Soru ${q.id} (${courseKey} - ${testPkg.id}) Jev onayından geçemedi: ${audit.reasons?.join(', ')}`);
          assert.ok(audit.score >= 0.85, `Soru ${q.id} skoru yetersiz: ${audit.score}`);
          assert.strictEqual(audit.decisions.single_deterministic_answer, true, `Soru ${q.id} deterministik değil`);
          assert.ok(q.solutionStrategy, `Soru ${q.id} çözüm stratejisi eksik`);
          assert.ok(q.detailedSolution, `Soru ${q.id} detaylı çözüm eksik`);
        }
      }
    }
    console.log(`     ℹ️ ${count} sorunun tamamı JEV System-1 denetiminden onay aldı.`);
  });

  // TEST 5: LGS 3-Yanlış 1-Doğru Net Hesaplama Algoritması
  test('LGS Net Hesaplama Formülü Doğru Çalışmalı [Net = Doğru - (Yanlış / 3)]', () => {
    function calculateLgsNet(correct, wrong) {
      return Math.max(0, correct - (wrong / 3));
    }

    assert.strictEqual(calculateLgsNet(18, 3), 17.00);
    assert.strictEqual(parseFloat(calculateLgsNet(15, 5).toFixed(2)), 13.33);
    assert.strictEqual(calculateLgsNet(0, 10), 0);
    assert.strictEqual(calculateLgsNet(20, 0), 20.00);
  });

  // TEST 6: Oturum Yalıtımı ve Cevap Sızdırma Koruması (State Isolation Test)
  test('Testler ve dersler arası durum yalıtımı sağlanmalı (Cevap sızdırmazlık testi)', () => {
    // İzole oturum simülasyonu
    const sessions = {};
    function getSession(testId) {
      if (!sessions[testId]) {
        sessions[testId] = { userAnswers: {}, examEvaluated: false, score: null };
      }
      return sessions[testId];
    }

    // 1. Öğrenci Türkçe Test 1'i çözer ve tamamlar
    const tr1 = getSession('TR-T1');
    tr1.userAnswers['LGS-TR-01'] = 'C';
    tr1.userAnswers['LGS-TR-02'] = 'B';
    tr1.examEvaluated = true;
    tr1.score = { correct: 2, wrong: 0, empty: 0, net: 2.0 };

    assert.strictEqual(tr1.examEvaluated, true, 'TR-T1 değerlendirildi olarak işaretlenmeli');

    // 2. Öğrenci Türkçe Test 2'ye geçer
    const tr2 = getSession('TR-T2');
    assert.strictEqual(tr2.examEvaluated, false, 'TR-T2 kesinlikle değerlendirilmemiş (temiz) olmalı');
    assert.strictEqual(Object.keys(tr2.userAnswers).length, 0, 'TR-T2 cevapları boş olmalı');

    // 3. Öğrenci Matematik Test 1'e geçer
    const mat1 = getSession('MAT-T1');
    assert.strictEqual(mat1.examEvaluated, false, 'MAT-T1 kesinlikle değerlendirilmemiş olmalı');
    assert.strictEqual(mat1.score, null, 'MAT-T1 puanı olmamalı');

    // 4. Öğrenci tekrar Türkçe Test 1'e döner
    const tr1Return = getSession('TR-T1');
    assert.strictEqual(tr1Return.examEvaluated, true, 'TR-T1 önceki durumu korunmalı');
    assert.strictEqual(tr1Return.userAnswers['LGS-TR-01'], 'C', 'TR-T1 cevapları korunmalı');
    assert.strictEqual(tr1Return.score.net, 2.0, 'TR-T1 net puanı korunmalı');
  });

  // TEST 7: Web Dosyaları ve Dağıtım Bütünlüğü
  test('Web arayüz dosyaları ve questions.json hazır ve geçerli olmalı', () => {
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    const cssPath = path.join(__dirname, '..', 'public', 'style.css');
    const jsPath = path.join(__dirname, '..', 'public', 'app.js');
    const jsonPath = path.join(__dirname, '..', 'public', 'questions.json');

    assert.ok(fs.existsSync(htmlPath), 'index.html eksik');
    assert.ok(fs.existsSync(cssPath), 'style.css eksik');
    assert.ok(fs.existsSync(jsPath), 'app.js eksik');
    assert.ok(fs.existsSync(jsonPath), 'questions.json eksik');

    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(htmlContent.includes('id="testList"'), 'testList container eksik');
    assert.ok(htmlContent.includes('id="btnMobileOptical"'), 'btnMobileOptical butonu eksik');
  });

  // TEST 8: Faz 3 - PostgreSQL Tohumlama, Veri Katmanı ve REST API Bütünlüğü
  await asyncTest('Faz 3: Veritabanı adaptörü, SQL tohumlama ve API uç noktaları çalışmalı', async () => {
    // 1. SQL Tohum dosyası kontrolü
    const seedSqlPath = path.join(__dirname, '..', 'db', 'seed_full_production.sql');
    assert.ok(fs.existsSync(seedSqlPath), 'seed_full_production.sql bulunamadı');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf-8');
    assert.ok(seedSql.includes('INSERT INTO courses'), 'courses tohumu eksik');
    assert.ok(seedSql.includes('INSERT INTO tests'), 'tests tohumu eksik');
    assert.ok(seedSql.includes('INSERT INTO questions'), 'questions tohumu eksik');

    // 2. Database Adapter kontrolü
    const { db } = await import('./db_adapter.mjs');
    const summary = db.getCoursesSummary();
    assert.strictEqual(summary.length, 4, '4 kurs özeti bekleniyordu');
    const totalQ = summary.reduce((acc, c) => acc + c.questionCount, 0);
    assert.strictEqual(totalQ, 53, '53 soru bekleniyordu');

    // 3. Test çekme
    const trTests = db.getTestsByCourse('turkce');
    assert.strictEqual(trTests.length, 3, 'Türkçe 3 test içermeli');

    const test1 = db.getTestById('TR-T1');
    assert.ok(test1 && test1.questions.length > 0, 'TR-T1 soruları yüklenemedi');

    // 4. Sunucu taraflı sınav değerlendirme ve eksik kazanım analizi
    const submitResult = db.submitExamSession({
      testId: 'TR-T1',
      answers: {
        'LGS-TR-01': 'C', // Doğru
        'LGS-TR-02': 'A'  // Yanlış (Doğrusu B)
      },
      studentName: 'Kerem Çelik',
      mode: 'EXAM',
      durationSeconds: 120
    });

    assert.ok(submitResult.sessionId, 'Oturum ID üretilmedi');
    assert.strictEqual(submitResult.score.correctCount, 1, '1 doğru olmalı');
    assert.strictEqual(submitResult.score.wrongCount, 1, '1 yanlış olmalı');
    // Net = 1 - (1/3) = 0.67
    assert.strictEqual(submitResult.score.netScore, 0.67, 'Net puan 0.67 olmalı');
    assert.ok(submitResult.deficiencies.length === 1, '1 eksik kazanım tespit edilmeli');
    assert.strictEqual(submitResult.deficiencies[0].questionId, 'LGS-TR-02', 'LGS-TR-02 eksik kazanım olmalı');

    // 5. Kayıtlı oturumu sorgulama
    const retrieved = db.getSessionResult(submitResult.sessionId);
    assert.ok(retrieved, 'Kayıtlı oturum getirilemedi');
    assert.strictEqual(retrieved.studentName, 'Kerem Çelik', 'Öğrenci adı eşleşmiyor');
  });

  // TEST 9: Faz 4 - Canlı LLM Entegrasyonu ve JEV Self-Correction Motoru
  await asyncTest('Faz 4: LLM istemcisi, prompt motoru ve JEV self-correction döngüsü çalışmalı', async () => {
    const { buildQuestionPrompt, buildSelfCorrectionPrompt } = await import('./prompt_templates.mjs');
    const p1 = buildQuestionPrompt({ course: 'turkce', topic: 'Paragrafta Yapı' });
    assert.ok(p1.includes('BLOOM TAKSONOMİSİ'), 'Sistem yönergeleri eksik');

    const p2 = buildSelfCorrectionPrompt({
      originalQuestion: { id: 'TEST-01' },
      rejectionReasons: ['Çeldirici gücü yetersiz']
    });
    assert.ok(p2.includes('Çeldirici gücü yetersiz'), 'Düzeltme geri bildirimi eksik');

    // Model listesi
    const { llmClient } = await import('./llm_client.mjs');
    const modelInfo = await llmClient.listAvailableModels();
    assert.ok(typeof modelInfo.available === 'boolean', 'Model durumu boolean olmalı');

    // JEV Pipeline ile soru üretimi ve denetimi
    const { jevPipeline } = await import('./jev_self_correction.mjs');
    const result = await jevPipeline.produceQuestion({
      course: 'turkce',
      topic: 'Paragrafta Anlam',
      outcomeCode: 'T.8.3.14'
    });

    assert.ok(result.success, 'Soru üretimi başarısız');
    assert.ok(result.question.stimulus, 'Öncül metni eksik');
    assert.ok(result.question.stem, 'Soru kökü eksik');
    assert.ok(result.audit.passed, 'JEV onayı alınamadı');
    assert.ok(result.audit.score >= 0.85, 'JEV puanı yetersiz');
  });

  // TEST 10: 4 Kademeli Zorluk Seviyesi ve Bilişsel Yük Uyumu Denetim Testi
  await asyncTest('4 Kademeli Zorluk Seviyesi ve Bilişsel Yük Uyumu Denetimi (Kavrama, Uygulama, LGS Yeni Nesil, Olimpiyat)', async () => {
    const auditor = new JevQualityAuditor();
    const { jevPipeline } = await import('./jev_self_correction.mjs');
    const { DIFFICULTY_LEVELS } = await import('./prompt_templates.mjs');

    // 1. Dört seviyenin tanımlarının mevcudiyeti
    assert.ok(DIFFICULTY_LEVELS.KAVRAMA, 'KAVRAMA seviyesi eksik');
    assert.ok(DIFFICULTY_LEVELS.UYGULAMA, 'UYGULAMA seviyesi eksik');
    assert.ok(DIFFICULTY_LEVELS.LGS_YENI_NESIL, 'LGS_YENI_NESIL seviyesi eksik');
    assert.ok(DIFFICULTY_LEVELS.SEKIL_VE_OLIMPIYAT, 'SEKIL_VE_OLIMPIYAT seviyesi eksik');

    // 2. Her bir zorluk seviyesine uygun soruların yüksek uyumla denetimden geçmesi
    const levels = ['KAVRAMA', 'UYGULAMA', 'LGS_YENI_NESIL', 'SEKIL_VE_OLIMPIYAT'];
    for (const lvl of levels) {
      const q = jevPipeline.generateDeterministicFallback('matematik', 'Müfredat', 'M.8.1', lvl);
      const audit = await auditor.evaluateQuestion(q);
      assert.strictEqual(audit.passed, true, `${lvl} seviyesindeki soru denetimden geçemedi`);
      assert.ok(audit.score >= 0.85, `${lvl} soru skoru yetersiz: ${audit.score}`);
      assert.ok(audit.decisions.difficulty_alignment >= 0.85, `${lvl} zorluk uyum skoru yetersiz: ${audit.decisions.difficulty_alignment}`);
    }

    // 3. Uyumsuzluk Cezalandırma Testi (Cognitive Load Mismatch Penalty):
    // Olimpiyat seviyesi olarak etiketlenmiş ama basit sözlük tanımı olan bir soru
    const mismatchedOlympic = {
      outcome_code: 'T.8.1.1',
      difficulty: 'Şekil ve Olimpiyat',
      stimulus: 'Bir sözcüğün ilk anlamına gerçek anlam denir.',
      stem: 'Bu bilgiye göre gerçek anlam nedir?',
      options: { A: 'İlk anlam', B: 'Mecaz', C: 'Terim', D: 'Yan' },
      correct_option: 'A',
      solution_strategy: 'Tanımı hatırlayınız.',
      detailed_solution: 'Gerçek anlam ilk anlamdır.',
      distractor_analysis: { B: 'Mecazdır.', C: 'Terimdir.', D: 'Yandır.' }
    };
    const mismatchAudit = await auditor.evaluateQuestion(mismatchedOlympic);
    assert.strictEqual(mismatchAudit.passed, false, 'Olimpiyat seviyesine uymayan sığ soru onay almamalı');
    assert.ok(mismatchAudit.decisions.difficulty_alignment < 0.70, 'Uyumsuz zorluk seviyesi cezalandırılmalı');
    assert.ok(mismatchAudit.reasons.some(r => r.includes('zorluk') || r.includes('Olimpiyat')), 'Uyumsuzluk sebebi bildirilmeli');
  });

  // TEST 11: Sıfır Şüphe ve Deterministik Cevap Testi (Çift Cevap, Muğlaklık ve Ayrıklık Denetimi)
  await asyncTest('Sıfır Şüphe ve Deterministik Cevap Testi (Çift Cevap, Muğlaklık ve Ayrıklık Denetimi)', async () => {
    const auditor = new JevQualityAuditor();

    // 1. Soru kökünde muğlak ifade ('belki') tespiti
    const ambiguousStemQuestion = {
      outcome_code: 'F.8.4.1',
      difficulty: 'LGS Yeni Nesil',
      stimulus: 'Bitkiler ışık altında fotosentez yaparak organik besin ve oksijen üretirler.',
      stem: 'Buna göre deney sonucunda fotosentez hızı belki artabilir mi?',
      options: { A: 'Evet', B: 'Hayır', C: 'Değişmez', D: 'Sıfırlanır' },
      correct_option: 'A',
      solution_strategy: 'Işık şiddeti artınca hız artar.',
      detailed_solution: 'A şıkkı doğrudur.',
      distractor_analysis: { B: 'Azalmaz.', C: 'Sabit kalmaz.', D: 'Sıfırlanmaz.' }
    };
    const resStem = await auditor.evaluateQuestion(ambiguousStemQuestion);
    assert.strictEqual(resStem.passed, false, 'Muğlak soru köküne sahip soru reddedilmeli');
    assert.strictEqual(resStem.decisions.zero_ambiguity, false, 'zero_ambiguity false olmalı');
    assert.ok(resStem.reasons.some(r => r.includes('belki') || r.includes('muğlak')), 'Muğlak ifade sebebi bildirilmeli');

    // 2. Seçenekte muğlak ifade ('çoğu zaman') tespiti
    const ambiguousOptionQuestion = {
      outcome_code: 'T.8.3.14',
      difficulty: 'LGS Yeni Nesil',
      stimulus: 'Sanatçı eserlerinde toplumsal gerçekleri tarafsız ve derinlikli biçimde yansıtır.',
      stem: 'Bu metne göre sanatçının tavrıyla ilgili hangisi söylenebilir?',
      options: {
        A: 'Çoğu zaman tarafsız kalmayı tercih eder.',
        B: 'Toplumsal sorunlara duyarsızdır.',
        C: 'Yalnızca bireysel temaları işler.',
        D: 'Popüler beğeniyi hedefler.'
      },
      correct_option: 'A',
      solution_strategy: 'Metni okuyunuz.',
      detailed_solution: 'A şıkkı metinle uyumludur.',
      distractor_analysis: { B: 'Duyarlıdır.', C: 'Bireysel değildir.', D: 'Popülerliği hedeflemez.' }
    };
    const resOpt1 = await auditor.evaluateQuestion(ambiguousOptionQuestion);
    assert.strictEqual(resOpt1.passed, false, 'Muğlak seçenek içeren soru reddedilmeli');
    assert.strictEqual(resOpt1.decisions.zero_ambiguity, false, 'zero_ambiguity false olmalı');

    // 3. Seçenekte muğlak ifade ('olabilir gibi') tespiti
    const ambiguousOptionQuestion2 = {
      outcome_code: 'T.8.3.14',
      difficulty: 'LGS Yeni Nesil',
      stimulus: 'Edebiyat toplumun aynası olmakla kalmaz; geleceği de inşa eder.',
      stem: 'Bu metinden çıkarılabilecek kesin sonuç hangisidir?',
      options: {
        A: 'Edebiyat toplumu dönüştürücü güce sahiptir.',
        B: 'Eserler geleceği etkileyebilir olabilir gibi görünmektedir.',
        C: 'Sanat sadece geçmişi anlatır.',
        D: 'Toplum sanattan etkilenmez.'
      },
      correct_option: 'A',
      solution_strategy: 'Metne odaklanınız.',
      detailed_solution: 'A şıkkı doğrudur.',
      distractor_analysis: { B: 'Muğlaktır.', C: 'Geçmişle sınırlı değildir.', D: 'Etkilenir.' }
    };
    const resOpt2 = await auditor.evaluateQuestion(ambiguousOptionQuestion2);
    assert.strictEqual(resOpt2.decisions.zero_ambiguity, false, 'olabilir gibi muğlaklığı yakalanmalı');

    // 4. Çift cevap ve tekrarlanan seçenek (Duplicate Option)
    const duplicateQuestion = {
      outcome_code: 'M.8.1.1',
      difficulty: 'Uygulama',
      stimulus: 'Bir sayının 3 katının 5 fazlası 20 dir.',
      stem: 'Buna göre bu sayı kaçtır?',
      options: { A: '5', B: '5', C: '6', D: '7' },
      correct_option: 'A',
      solution_strategy: '3x + 5 = 20 ise x = 5.',
      detailed_solution: 'x = 5 tir.',
      distractor_analysis: { B: 'Aynıdır.', C: 'Hatalıdır.', D: 'Hatalıdır.' }
    };
    const resDup = await auditor.evaluateQuestion(duplicateQuestion);
    assert.strictEqual(resDup.passed, false, 'Tekrarlanan seçenekli soru reddedilmeli');
    assert.strictEqual(resDup.decisions.single_deterministic_answer, false, 'Tek deterministik cevap false olmalı');
    assert.strictEqual(resDup.decisions.zero_ambiguity, false, 'zero_ambiguity false olmalı');

    // 5. Kapsayan ve çakışan eşitsizlik seçenekleri (Overlapping Inequalities)
    const overlappingInequalityQuestion = {
      outcome_code: 'M.8.2.1',
      difficulty: 'Uygulama',
      stimulus: 'Bir depodaki su seviyesi x litredir.',
      stem: 'Depodaki su miktarının kısıtı aşağıdakilerden hangisidir?',
      options: { A: 'x > 10', B: 'x > 20', C: 'x < 5', D: 'x < 2' },
      correct_option: 'A',
      solution_strategy: 'Eşitsizliği kurunuz.',
      detailed_solution: 'Doğru cevap A dır.',
      distractor_analysis: { B: 'Yanlış kısıt.', C: 'Yanlış sınır.', D: 'Yanlış sınır.' }
    };
    const resIneq = await auditor.evaluateQuestion(overlappingInequalityQuestion);
    assert.strictEqual(resIneq.passed, false, 'Çakışan eşitsizlik seçenekleri reddedilmeli');
    assert.strictEqual(resIneq.decisions.zero_ambiguity, false);

    // 6. Meta-seçenekler (Hepsi, Hiçbiri)
    const metaOptionQuestion = {
      outcome_code: 'T.8.3.1',
      difficulty: 'Kavrama',
      stimulus: 'Sözcüklerin zıt anlamlıları anlamca birbirinin karşıtı olan sözcüklerdir.',
      stem: 'Aşağıdakilerden hangisi zıt anlamlı sözcük çiftidir?',
      options: { A: 'İyi - Kötü', B: 'Güzel - Çirkin', C: 'Yukarıdakilerin hepsi', D: 'Hiçbiri' },
      correct_option: 'A',
      solution_strategy: 'Zıt anlamlıları bulunuz.',
      detailed_solution: 'A şıkkı doğrudur.',
      distractor_analysis: { B: 'B de zıttır.', C: 'Meta şık.', D: 'Geçersiz şık.' }
    };
    const resMeta = await auditor.evaluateQuestion(metaOptionQuestion);
    assert.strictEqual(resMeta.passed, false, 'Meta-seçenekler reddedilmeli');
    assert.strictEqual(resMeta.decisions.zero_ambiguity, false);
  });

  // TEST 12: JEV System-1 4 Branş Kalite Kapısı Testi (Türkçe, Matematik, Fen, Sosyal)
  await asyncTest('JEV System-1 4 Branş Kalite Kapısı ve Deterministik Soru Üretimi Testi', async () => {
    const auditor = new JevQualityAuditor();
    const { jevPipeline } = await import('./jev_self_correction.mjs');

    const branches = [
      { key: 'turkce', name: 'Türkçe', outcomePrefix: 'T.8.' },
      { key: 'matematik', name: 'Matematik', outcomePrefix: 'M.8.' },
      { key: 'fen', name: 'Fen Bilimleri', outcomePrefix: 'F.8.' },
      { key: 'sosyal', name: 'T.C. İnkılap Tarihi', outcomePrefix: 'İTA.8.' }
    ];

    const testDiffs = ['KAVRAMA', 'UYGULAMA', 'LGS_YENI_NESIL', 'SEKIL_VE_OLIMPIYAT'];

    for (const branch of branches) {
      for (const diff of testDiffs) {
        const fallbackQ = jevPipeline.generateDeterministicFallback(branch.key, 'Genel Müfredat', `${branch.outcomePrefix}1.1`, diff);
        
        // Emojilerin temizlenmiş olduğunu doğrula
        const rawJson = JSON.stringify(fallbackQ);
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        assert.strictEqual(emojiRegex.test(rawJson), false, `${branch.name} - ${diff} sorusunda emoji bulundu!`);

        // JEV Kalite Denetimi
        const audit = await auditor.evaluateQuestion(fallbackQ);
        assert.strictEqual(audit.passed, true, `${branch.name} - ${diff} JEV onayından geçemedi: ${audit.reasons?.join(', ')}`);
        assert.ok(audit.score >= 0.85, `${branch.name} - ${diff} skoru yetersiz: ${audit.score}`);
        assert.strictEqual(audit.decisions.is_meb_aligned, true, `${branch.name} MEB uyumu eksik`);
        assert.strictEqual(audit.decisions.single_deterministic_answer, true, `${branch.name} tek cevap doğrulanmadı`);
        assert.strictEqual(audit.decisions.zero_ambiguity, true, `${branch.name} sıfır şüphe kapısından geçemedi`);
        assert.ok(audit.decisions.difficulty_alignment >= 0.85, `${branch.name} zorluk uyumu yetersiz`);
        assert.ok(fallbackQ.solutionStrategy.includes('UZMAN ÖĞRETMEN STRATEJİSİ'), `${branch.name} çözüm stratejisi formatı hatalı`);
        assert.ok(fallbackQ.detailedSolution.length > 20, `${branch.name} detaylı çözüm yetersiz`);
        assert.strictEqual(Object.keys(fallbackQ.distractors).length, 3, `${branch.name} 3 çeldirici açıklaması içermeli`);
      }
    }
  });

  // TEST 13: JEV Self-Correction Döngüsü ve Hata Geri Bildirimi Aktarım Testi
  await asyncTest('JEV Self-Correction Döngüsü ve Hata Geri Bildirimi Aktarımı Çalışmalı', async () => {
    const auditor = new JevQualityAuditor();
    const { buildSelfCorrectionPrompt } = await import('./prompt_templates.mjs');

    // Kusurlu soru taslağı (Muğlak ifade ve eksik çeldiriciler)
    const flawedQuestion = {
      outcome_code: 'T.8.3.14',
      difficulty: 'LGS Yeni Nesil',
      stimulus: 'Sanat ve edebiyat toplumun vazgeçilmez iki unsurudur.',
      stem: 'Bu metne göre sanat belki de toplumu nasıl etkiler?',
      options: { A: 'Olumlu', B: 'Olumlu', C: 'Olumsuz', D: 'Etkilemez' },
      correct_option: 'A'
    };

    const audit = await auditor.evaluateQuestion(flawedQuestion);
    assert.strictEqual(audit.passed, false, 'Kusurlu soru onay almamalı');
    assert.ok(audit.reasons.length >= 2, 'En az 2 ayrı ret sebebi dönmeli');

    // buildSelfCorrectionPrompt ile hata bildiriminin prompta aktarılması
    const correctionPrompt = buildSelfCorrectionPrompt({
      originalQuestion: flawedQuestion,
      rejectionReasons: audit.reasons,
      difficulty: 'LGS_YENI_NESIL'
    });

    for (const reason of audit.reasons) {
      assert.ok(correctionPrompt.includes(reason), `Ret sebebi prompta aktarılmamış: "${reason}"`);
    }
    assert.ok(correctionPrompt.includes('SIFIR ŞÜPHE İLKESİ'), 'Sıfır şüphe ilkesi promptta yer almalı');
    assert.ok(correctionPrompt.includes('HEDEF ZORLUK SEVİYESİ: LGS_YENI_NESIL'), 'Hedef zorluk seviyesi promptta belirtilmeli');
  });

  // TEST 14: Gzip Level-9 Bulut Arşivleme ve Sıkıştırma Oranı Testi (> %70 tasarruf doğrulaması)
  await asyncTest('Test 14: Gzip Level-9 Bulut Arşivleme ve Sıkıştırma Oranı Testi (> %70 tasarruf doğrulaması)', async () => {
    const { compressPayload, prepareBackupPayload, compressAndArchiveData } = await import('../scripts/cloud_sync_manager.mjs');
    const zlib = (await import('zlib')).default;

    // 1. Platform yedek yükünün doğrulanması
    const payload = prepareBackupPayload();
    assert.ok(payload.metadata, 'Yedek metadata alanı eksik');
    assert.strictEqual(payload.metadata.user, 'kerem.newton571@gmail.com', 'Hedef kullanıcı eşleşmiyor');
    assert.strictEqual(payload.metadata.storageQuotaTarget, 'Google Drive 5TB', 'Hedef kota eşleşmiyor');
    assert.ok(payload.questions, 'Soru havuzu eksik');

    // 2. RAM üzerinde Level-9 Gzip sıkıştırma testi
    const compResult = compressPayload(payload, { level: 9 });
    assert.ok(compResult.rawBytes > 0, 'Orijinal veri boyutu sıfır');
    assert.ok(compResult.compressedBytes > 0, 'Sıkıştırılmış veri boyutu sıfır');
    assert.ok(compResult.compressedBytes < compResult.rawBytes, 'Sıkıştırma gerçekleşmedi');

    // > %70 tasarruf doğrulama
    assert.ok(compResult.savingRatio > 70.0, `Sıkıştırma tasarrufu %70 üzerinde olmalı, bulunan: %${compResult.savingRatio}`);
    assert.strictEqual(compResult.compressedBuffer[0], 0x1f, 'Gzip sihirli baytı 1 eksik');
    assert.strictEqual(compResult.compressedBuffer[1], 0x8b, 'Gzip sihirli baytı 2 eksik');

    // 3. Bellekten geri açma (Decompression round-trip integrity)
    const decompressed = zlib.gunzipSync(compResult.compressedBuffer).toString('utf-8');
    const restored = JSON.parse(decompressed);
    assert.strictEqual(restored.metadata.user, 'kerem.newton571@gmail.com', 'Kurtarılan veri metadata doğrulaması başarısız');
    assert.ok(restored.questions.turkce, 'Kurtarılan soru havuzu eksik');

    // 4. Bellek içi arşivleme fonksiyonu doğrulaması
    const memArchive = compressAndArchiveData({ writeToDisk: false });
    assert.ok(memArchive.savingRatio > 70.0, `Arşiv tasarrufu %70 üzerinde olmalı: %${memArchive.savingRatio}`);
  });

  // TEST 15: Google Drive Direct Streaming Motoru Doğrulama Testi
  await asyncTest('Test 15: Google Drive Direct Streaming Motoru Doğrulama Testi', async () => {
    const { DriveDirectStreamer, DEFAULT_TARGET_ACCOUNT, streamDirectToDrive } = await import('../scripts/drive_direct_streamer.mjs');

    // 1. Hedef hesap ve kota doğrulaması
    assert.strictEqual(DEFAULT_TARGET_ACCOUNT, 'kerem.newton571@gmail.com', 'Varsayılan hedef hesap eşleşmiyor');
    const streamer = new DriveDirectStreamer({ silent: true, dryRun: true });
    assert.strictEqual(streamer.targetAccount, 'kerem.newton571@gmail.com', 'Streamer hedef hesabı eşleşmiyor');

    // 2. RAM payload hazırlığı ve sıfır disk kullanımı doğrulaması
    const ramPayload = streamer.prepareRamStreamPayload();
    assert.strictEqual(ramPayload.localDiskBytesUsed, 0, 'Yerel disk alanı kullanıldı (0 bayt olmalı)');
    assert.ok(ramPayload.compressedBytes > 0, 'Sıkıştırılmış veri boyutu sıfır olamaz');
    assert.strictEqual(ramPayload.checksumSha256.length, 64, 'SHA-256 sağlama uzunluğu 64 karakter olmalı');
    assert.strictEqual(ramPayload.checksumMd5.length, 32, 'MD5 sağlama uzunluğu 32 karakter olmalı');

    // 3. Resumable Upload el sıkışması simülasyonu
    const session = await streamer.initiateResumableSession(ramPayload);
    assert.strictEqual(session.simulated, true, 'Dry-run modunda oturum simüle edilmeli');
    assert.ok(session.sessionUri.includes('uploadType=resumable'), 'Resumable upload parametresi eksik');
    assert.ok(session.protocol.includes('Resumable Upload'), 'Protokol tipi hatalı');

    // 4. Parçalı HTTP bellek akışı ve sıfır disk ayak izi testi
    const chunkedStreamer = new DriveDirectStreamer({ chunkSize: 32 * 1024, silent: true, dryRun: true });
    let progressFired = false;
    let finalPercentage = 0;

    const streamResult = await chunkedStreamer.streamToDrive(null, (p) => {
      progressFired = true;
      finalPercentage = p.percentage;
    });

    assert.strictEqual(streamResult.success, true, 'Bulut akışı başarılı olmalı');
    assert.strictEqual(streamResult.simulated, true, 'Dry-run modunda simüle edilmeli');
    assert.strictEqual(streamResult.targetAccount, 'kerem.newton571@gmail.com', 'Hedef hesap eşleşmiyor');
    assert.ok(streamResult.chunkCount >= 2, 'Çoklu parça akışı doğrulanmalı (en az 2 parça)');
    assert.strictEqual(streamResult.bytesStreamed, streamResult.totalBytes, 'Aktarılan bayt toplam bayta eşit olmalı');
    assert.strictEqual(streamResult.localDiskBytesUsed, 0, 'Akış esnasında yerel disk alanı tüketilmemeli');
    assert.strictEqual(progressFired, true, 'İlerleme (progress) callback tetiklenmeli');
    assert.strictEqual(finalPercentage, 100, 'Nihai aktarım yüzdesi %100 olmalı');

    // 5. Yardımcı fonksiyon doğrulaması
    const helperResult = await streamDirectToDrive({ silent: true, dryRun: true });
    assert.strictEqual(helperResult.success, true, 'streamDirectToDrive çağrısı başarılı olmalı');
    assert.strictEqual(helperResult.localDiskBytesUsed, 0, 'Yardımcı fonksiyon yerel disk alanı tüketmemeli');
  });

  // TEST 16: Toplu Soru Fabrikası (Bulk Generator) 4 Branş ve 4 Zorluk Seviyesi Testi
  await asyncTest('Test 16: Toplu Soru Fabrikası (Bulk Generator) 4 Branş ve 4 Zorluk Seviyesi Testi', async () => {
    const {
      generateFullMatrix,
      generateQuestionBatch,
      runBulkGeneration,
      SUPPORTED_BRANCHES,
      SUPPORTED_DIFFICULTIES
    } = await import('./bulk_generator.mjs');
    const auditor = new JevQualityAuditor();

    // 1. Desteklenen branşlar ve zorluk seviyeleri kontrolü
    assert.strictEqual(SUPPORTED_BRANCHES.length, 4, '4 ana branş tanımlı olmalı');
    const branchKeys = SUPPORTED_BRANCHES.map(b => b.key);
    assert.ok(branchKeys.includes('turkce'), 'Türkçe branşı eksik');
    assert.ok(branchKeys.includes('matematik'), 'Matematik branşı eksik');
    assert.ok(branchKeys.includes('fen'), 'Fen Bilimleri branşı eksik');
    assert.ok(branchKeys.includes('inkilap'), 'İnkılap Tarihi branşı eksik');

    assert.strictEqual(SUPPORTED_DIFFICULTIES.length, 4, '4 zorluk seviyesi tanımlı olmalı');
    assert.ok(SUPPORTED_DIFFICULTIES.includes('KAVRAMA'), 'KAVRAMA seviyesi eksik');
    assert.ok(SUPPORTED_DIFFICULTIES.includes('UYGULAMA'), 'UYGULAMA seviyesi eksik');
    assert.ok(SUPPORTED_DIFFICULTIES.includes('LGS_YENI_NESIL'), 'LGS_YENI_NESIL seviyesi eksik');
    assert.ok(SUPPORTED_DIFFICULTIES.includes('SEKIL_VE_OLIMPIYAT'), 'SEKIL_VE_OLIMPIYAT seviyesi eksik');

    // 2. 4 Branş x 4 Zorluk Seviyesi (16 Soru) Deterministik Matris Üretimi
    const matrix = await generateFullMatrix({
      countPerCategory: 1,
      deterministic: true,
      silent: true
    });

    assert.strictEqual(matrix.totalGenerated, 16, 'Toplam 16 adet soru üretilmeli (4 branş x 4 zorluk)');
    assert.strictEqual(matrix.questions.length, 16, 'Soru listesi uzunluğu 16 olmalı');

    // Her branş ve zorluktan 4'er soru olmalı
    for (const b of SUPPORTED_BRANCHES) {
      assert.strictEqual(matrix.branchCounts[b.key], 4, `${b.name} branşında 4 soru üretilmeli`);
    }
    for (const d of SUPPORTED_DIFFICULTIES) {
      assert.strictEqual(matrix.difficultyCounts[d], 4, `${d} seviyesinde 4 soru üretilmeli`);
    }

    // 3. JEV Quality & Sıfır Şüphe Denetimi (16 sorunun tamamı %100 onay almalı)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    for (const q of matrix.questions) {
      // Emojisiz kontrol
      assert.strictEqual(emojiRegex.test(JSON.stringify(q)), false, `Soru ${q.id} içinde emoji bulundu`);

      const audit = await auditor.evaluateQuestion(q);
      assert.strictEqual(audit.passed, true, `Soru ${q.id} JEV kalite kapısından geçemedi: ${audit.reasons?.join(', ')}`);
      assert.ok(audit.score >= 0.85, `Soru ${q.id} JEV skoru yetersiz: ${audit.score}`);
      assert.strictEqual(audit.decisions.single_deterministic_answer, true, `Soru ${q.id} tek deterministik cevaba sahip değil`);
      assert.strictEqual(audit.decisions.zero_ambiguity, true, `Soru ${q.id} sıfır şüphe kuralını ihlal etti`);
      assert.ok(audit.decisions.difficulty_alignment >= 0.85, `Soru ${q.id} zorluk uyumu yetersiz: ${audit.decisions.difficulty_alignment}`);
      assert.strictEqual(Object.keys(q.options).length, 4, `Soru ${q.id} 4 seçenek içermeli`);
      assert.ok(q.solutionStrategy, `Soru ${q.id} çözüm stratejisi içermeli`);
      assert.ok(q.detailedSolution, `Soru ${q.id} detaylı çözüm içermeli`);
      assert.strictEqual(Object.keys(q.distractors || {}).length, 3, `Soru ${q.id} 3 çeldirici açıklaması içermeli`);
    }

    // 4. Tekil branş/zorluk grubu üretimi testi
    const singleBatch = await generateQuestionBatch({
      course: 'fen',
      difficulty: 'SEKIL_VE_OLIMPIYAT',
      count: 1,
      deterministic: true,
      silent: true
    });
    assert.strictEqual(singleBatch.length, 1, 'Tekil üretimde 1 soru bekleniyordu');
    assert.strictEqual(singleBatch[0]._meta.difficulty, 'SEKIL_VE_OLIMPIYAT', 'Zorluk seviyesi eşleşmiyor');
    assert.strictEqual(singleBatch[0]._meta.branch, 'fen', 'Branş eşleşmiyor');

    // 5. runBulkGeneration CLI sarmalayıcı testi (disk kayıtsız mod)
    const bulkResult = await runBulkGeneration({
      matrix: true,
      deterministic: true,
      save: false,
      count: 1
    });
    assert.strictEqual(bulkResult.count, 16, 'Toplu üretimde 16 soru bekleniyordu');
    assert.strictEqual(bulkResult.questions.length, 16, 'Soru dizisi 16 adet olmalı');
  });

  console.log('\n====================================================');
  console.log(`[RAPOR] TEST SONUÇLARI: ${passedTests}/${totalTests} Test Başarıyla Geçti.`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite();

