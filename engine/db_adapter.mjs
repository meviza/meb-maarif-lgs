/**
 * MEB Maarif LGS Platformu - Veritabanı ve Oturum Yönetim Katmanı (Faz 3)
 * PostgreSQL ve Bellek-İçi Hibrit Veri Katmanı
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseAdapter {
  constructor() {
    this.multiTestBank = {};
    this.sessions = new Map(); // sessionId -> sessionData
    this.testLookup = new Map(); // testId -> { courseKey, test }
    this.questionLookup = new Map(); // questionId -> question
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    const questionsPath = path.join(__dirname, '..', 'public', 'questions.json');
    if (fs.existsSync(questionsPath)) {
      this.multiTestBank = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    }

    // İndeksleri oluştur
    for (const [courseKey, courseData] of Object.entries(this.multiTestBank)) {
      if (courseData.tests) {
        for (const test of courseData.tests) {
          this.testLookup.set(test.id, { courseKey, test });
          if (test.questions) {
            for (const q of test.questions) {
              this.questionLookup.set(q.id, q);
            }
          }
        }
      }
    }

    this.isInitialized = true;
    console.log(`[OK] DatabaseAdapter baslatildi (${this.testLookup.size} test, ${this.questionLookup.size} soru indekslendi).`);
  }

  // 1. Kurs Özetleri
  getCoursesSummary() {
    this.init();
    const result = [];
    const courseMeta = {
      turkce: { icon: 'book-open', subtitle: 'Paragraf & Sözel Mantık' },
      matematik: { icon: 'compass', subtitle: 'EBOB-EKOK & Üslü Sayılar' },
      fen: { icon: 'atom', subtitle: 'Mevsimler, DNA & Basınç' },
      sosyal: { icon: 'flag', subtitle: 'Sosyal Bilgiler & Maarif' }
    };

    for (const [courseKey, courseData] of Object.entries(this.multiTestBank)) {
      const tests = courseData.tests || [];
      const totalQuestions = tests.reduce((sum, t) => sum + (t.questions?.length || 0), 0);
      result.push({
        key: courseKey,
        name: courseData.courseName,
        icon: courseMeta[courseKey]?.icon || 'book',
        subtitle: courseMeta[courseKey]?.subtitle || '',
        testCount: tests.length,
        questionCount: totalQuestions
      });
    }
    return result;
  }

  // 2. Bir Kursa Ait Test Paketleri
  getTestsByCourse(courseKey) {
    this.init();
    const course = this.multiTestBank[courseKey];
    if (!course || !course.tests) return [];

    return course.tests.map(t => ({
      id: t.id,
      title: t.title,
      badge: t.badge,
      questionCount: t.questions?.length || 0,
      durationMinutes: 30
    }));
  }

  // 3. Tek Bir Testi ve Sorularını Getir
  getTestById(testId) {
    this.init();
    const item = this.testLookup.get(testId);
    if (!item) return null;

    return {
      id: item.test.id,
      courseKey: item.courseKey,
      title: item.test.title,
      badge: item.test.badge,
      questions: item.test.questions
    };
  }

  // 4. Optik Sınav Sonucunu Gönder, Sunucu Tarafında Puanla ve Kaydet
  submitExamSession({ testId, answers = {}, studentName = 'Öğrenci', mode = 'EXAM', durationSeconds = 0 }) {
    this.init();
    const testItem = this.testLookup.get(testId);
    if (!testItem) {
      throw new Error(`Test bulunamadı: ${testId}`);
    }

    const questions = testItem.test.questions || [];
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    const breakdown = [];
    const deficiencies = [];

    questions.forEach(q => {
      const selected = answers[q.id] || null;
      let isCorrect = false;

      if (!selected) {
        empty++;
      } else if (selected === q.correctOption) {
        correct++;
        isCorrect = true;
      } else {
        wrong++;
        // Yanlış yapılan sorulardaki kazanım eksikliğini ve çeldirici notunu topla
        const distNote = q.distractors ? q.distractors[selected] : null;
        deficiencies.push({
          questionId: q.id,
          outcomeCode: q.outcomeCode,
          selected,
          correctOption: q.correctOption,
          distractorReason: distNote || 'Çeldiriciye takıldı.',
          solutionStrategy: q.solutionStrategy
        });
      }

      breakdown.push({
        questionId: q.id,
        outcomeCode: q.outcomeCode,
        selectedOption: selected,
        correctOption: q.correctOption,
        isCorrect
      });
    });

    // MEB LGS Resmi Puanlama Formülü: 3 Yanlış 1 Doğruyu Götürür!
    const net = Math.max(0, correct - (wrong / 3));
    const sessionId = crypto.randomUUID();

    const sessionRecord = {
      sessionId,
      testId,
      courseKey: testItem.courseKey,
      testTitle: testItem.test.title,
      studentName,
      mode,
      durationSeconds,
      score: {
        totalQuestions: questions.length,
        correctCount: correct,
        wrongCount: wrong,
        emptyCount: empty,
        netScore: parseFloat(net.toFixed(2)),
        lgsScoreEquivalent: parseFloat((net * 5).toFixed(2)) // 100 üzerinden LGS başarı katsayısı
      },
      breakdown,
      deficiencies,
      completedAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, sessionRecord);
    return sessionRecord;
  }

  // 5. Kayıtlı Oturum Karnesini Getir
  getSessionResult(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
}

export const db = new DatabaseAdapter();
