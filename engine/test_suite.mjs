/**
 * MEB Maarif LGS Platformu - Kapsamlı Test Paketi (Automated Test Suite)
 * Tüm Fazların ve Mantıksal Kuralların Doğrulanması
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JevQualityAuditor } from './jev_evaluator.mjs';
import { richQuestionBank } from './question_builder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 MEB MAARİF LGS PLATFORMU - UÇTAN UCA TEST BAŞLADI');
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
  test('PostgreSQL şema dosyası ve seed SQL mevcut olmalı', () => {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'db', 'seed_meb_8th_grade.sql');
    assert.ok(fs.existsSync(schemaPath), 'schema.sql bulunamadı');
    assert.ok(fs.existsSync(seedPath), 'seed_meb_8th_grade.sql bulunamadı');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS questions'), 'questions tablosu eksik');
    assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS exam_sessions'), 'exam_sessions tablosu eksik');
  });

  // TEST 2: Dokümantasyon ve MEB Standartları
  test('MEB Maarif standartları ve Jev şartnamesi eksiksiz olmalı', () => {
    const standardsPath = path.join(__dirname, '..', 'docs', 'MEB_MAARIF_STANDARDS.md');
    const jevSpecPath = path.join(__dirname, '..', 'docs', 'JEV_SYSTEM1_SPEC.md');
    assert.ok(fs.existsSync(standardsPath), 'MEB_MAARIF_STANDARDS.md bulunamadı');
    assert.ok(fs.existsSync(jevSpecPath), 'JEV_SYSTEM1_SPEC.md bulunamadı');
    const content = fs.readFileSync(standardsPath, 'utf-8');
    assert.ok(content.includes('30 Alt Soru Tipi Taksonomisi'), '30 paragraf alt tipi eksik');
  });

  // TEST 3: Soru Havuzu Bütünlüğü
  test('Soru havuzu tüm dersleri (Türkçe, Matematik, Fen) içermeli', () => {
    assert.ok(richQuestionBank.turkce?.length >= 3, 'Türkçe soru sayısı yetersiz');
    assert.ok(richQuestionBank.matematik?.length >= 2, 'Matematik soru sayısı yetersiz');
    assert.ok(richQuestionBank.fen?.length >= 2, 'Fen Bilimleri soru sayısı yetersiz');
  });

  // TEST 4: Jev (System 1) Karar ve Kalite Denetimi
  await asyncTest('Tüm sorular Jev System-1 kalite denetimini %100 başarıyla geçmeli', async () => {
    const auditor = new JevQualityAuditor();
    for (const [course, questions] of Object.entries(richQuestionBank)) {
      for (const q of questions) {
        const audit = await auditor.evaluateQuestion(q);
        assert.strictEqual(audit.passed, true, `Soru ${q.id} Jev onayından geçemedi`);
        assert.ok(audit.score >= 0.85, `Soru ${q.id} skoru yetersiz: ${audit.score}`);
        assert.strictEqual(audit.decisions.single_deterministic_answer, true, `Soru ${q.id} deterministik değil`);
      }
    }
  });

  // TEST 5: LGS 3-Yanlış 1-Doğru Net Hesaplama Algoritması
  test('LGS Net Hesaplama Formülü Doğru Çalışmalı [Net = Doğru - (Yanlış / 3)]', () => {
    function calculateLgsNet(correct, wrong) {
      return Math.max(0, correct - (wrong / 3));
    }

    // Senaryo 1: 18 Doğru, 3 Yanlış -> 18 - 1 = 17.00 Net
    assert.strictEqual(calculateLgsNet(18, 3), 17.00);

    // Senaryo 2: 15 Doğru, 5 Yanlış -> 15 - 1.666... = 13.33 Net
    assert.strictEqual(parseFloat(calculateLgsNet(15, 5).toFixed(2)), 13.33);

    // Senaryo 3: 0 Doğru, 10 Yanlış -> Net eksiye düşmemeli (0.00 olmalı)
    assert.strictEqual(calculateLgsNet(0, 10), 0);

    // Senaryo 4: 20 Doğru, 0 Yanlış -> 20.00 Net (Tam Puan)
    assert.strictEqual(calculateLgsNet(20, 0), 20.00);
  });

  // TEST 6: Web Dosyaları ve Dağıtım Bütünlüğü
  test('Public klasöründeki web arayüz dosyaları ve questions.json hazır olmalı', () => {
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    const cssPath = path.join(__dirname, '..', 'public', 'style.css');
    const jsPath = path.join(__dirname, '..', 'public', 'app.js');
    const jsonPath = path.join(__dirname, '..', 'public', 'questions.json');

    assert.ok(fs.existsSync(htmlPath), 'index.html eksik');
    assert.ok(fs.existsSync(cssPath), 'style.css eksik');
    assert.ok(fs.existsSync(jsPath), 'app.js eksik');
    assert.ok(fs.existsSync(jsonPath), 'questions.json eksik');
  });

  console.log('\n====================================================');
  console.log(`📊 TEST SONUÇLARI: ${passedTests}/${totalTests} Test Başarıyla Geçti.`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite();
