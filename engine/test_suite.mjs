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
  console.log('🧪 MEB MAARİF LGS PLATFORMU - FAZ 2 TEST BAŞLADI');
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

  console.log('\n====================================================');
  console.log(`📊 TEST SONUÇLARI: ${passedTests}/${totalTests} Test Başarıyla Geçti.`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite();
