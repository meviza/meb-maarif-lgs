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
    this.gradeBanks = { 5: {}, 6: {}, 7: {}, 8: {} };
    this.sessions = new Map(); // sessionId -> sessionData
    this.testLookup = new Map(); // testId -> { grade, courseKey, test }
    this.questionLookup = new Map(); // questionId -> question
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // 8. Sınıf (questions.json)
    const questionsPath = path.join(__dirname, '..', 'public', 'questions.json');
    if (fs.existsSync(questionsPath)) {
      this.gradeBanks[8] = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
      this.multiTestBank = this.gradeBanks[8];
    }

    // 5, 6, 7. Sınıflar
    [5, 6, 7].forEach(g => {
      const gPath = path.join(__dirname, '..', 'public', `questions_grade_${g}.json`);
      if (fs.existsSync(gPath)) {
        this.gradeBanks[g] = JSON.parse(fs.readFileSync(gPath, 'utf-8'));
      }
    });

    // İndeksleri oluştur (Tüm kademelerin testleri ve soruları)
    for (const [gradeNum, bank] of Object.entries(this.gradeBanks)) {
      const g = Number(gradeNum);
      for (const [courseKey, courseData] of Object.entries(bank)) {
        if (courseData.tests) {
          for (const test of courseData.tests) {
            this.testLookup.set(test.id, { grade: g, courseKey, test });
            if (test.questions) {
              for (const q of test.questions) {
                this.questionLookup.set(q.id, { ...q, grade: q.grade || g });
              }
            }
          }
        }
      }
    }

    this.isInitialized = true;
    console.log(`[OK] DatabaseAdapter baslatildi (${this.testLookup.size} test, ${this.questionLookup.size} soru indekslendi).`);
  }

  // 0. Tüm Eğitim Kademeleri (Grades)
  getGrades() {
    this.init();
    return [
      {
        grade: 5,
        name: "5. Sınıf",
        title: "5. Sınıf Maarif Modeli",
        subtitle: "Temel Bilişsel Beceriler ve Kavram Pekiştirme",
        courseCount: Object.keys(this.gradeBanks[5] || {}).length,
        testCount: Object.values(this.gradeBanks[5] || {}).reduce((sum, c) => sum + (c.tests?.length || 0), 0),
        questionCount: Object.values(this.gradeBanks[5] || {}).reduce((sum, c) => sum + (c.tests?.reduce((s, t) => s + (t.questions?.length || 0), 0) || 0), 0)
      },
      {
        grade: 6,
        name: "6. Sınıf",
        title: "6. Sınıf Maarif Modeli",
        subtitle: "Analitik Düşünme ve Problem Çözme Becerileri",
        courseCount: Object.keys(this.gradeBanks[6] || {}).length,
        testCount: Object.values(this.gradeBanks[6] || {}).reduce((sum, c) => sum + (c.tests?.length || 0), 0),
        questionCount: Object.values(this.gradeBanks[6] || {}).reduce((sum, c) => sum + (c.tests?.reduce((s, t) => s + (t.questions?.length || 0), 0) || 0), 0)
      },
      {
        grade: 7,
        name: "7. Sınıf",
        title: "7. Sınıf Maarif Modeli",
        subtitle: "LGS Hazırlık Temeli ve Mantıksal Çıkarım",
        courseCount: Object.keys(this.gradeBanks[7] || {}).length,
        testCount: Object.values(this.gradeBanks[7] || {}).reduce((sum, c) => sum + (c.tests?.length || 0), 0),
        questionCount: Object.values(this.gradeBanks[7] || {}).reduce((sum, c) => sum + (c.tests?.reduce((s, t) => s + (t.questions?.length || 0), 0) || 0), 0)
      },
      {
        grade: 8,
        name: "8. Sınıf (LGS)",
        title: "8. Sınıf LGS Sınav Simülatörü",
        subtitle: "MEB Maarif LGS Maratonu ve Beceri Temelli Sorular",
        courseCount: Object.keys(this.gradeBanks[8] || {}).length,
        testCount: Object.values(this.gradeBanks[8] || {}).reduce((sum, c) => sum + (c.tests?.length || 0), 0),
        questionCount: Object.values(this.gradeBanks[8] || {}).reduce((sum, c) => sum + (c.tests?.reduce((s, t) => s + (t.questions?.length || 0), 0) || 0), 0)
      }
    ];
  }

  // 1. Kurs Özetleri (Varsayılan grade = 8 ile geriye dönük %100 uyumlu)
  getCoursesSummary(grade = 8) {
    this.init();
    const requestedGrade = Number(grade);
    const g = Number.isInteger(requestedGrade) ? requestedGrade : 8;
    const bank = this.gradeBanks[g] || {};
    const result = [];
    const courseMeta = {
      turkce: { icon: 'book-open', subtitle: g === 8 ? 'Paragraf & Sözel Mantık' : 'Okuma Anlama & Dil Becerileri' },
      matematik: { icon: 'compass', subtitle: g === 8 ? 'EBOB-EKOK & Üslü Sayılar' : 'Sayısal Beceriler & Modelleme' },
      fen: { icon: 'atom', subtitle: g === 8 ? 'Mevsimler, DNA & Basınç' : 'Bilimsel Keşif & Deneyler' },
      inkilap: { icon: 'flag', subtitle: 'T.C. İnkılap Tarihi ve Atatürkçülük' },
      sosyal: { icon: 'flag', subtitle: 'Kültür, Miras & Toplumsal Yaşam' }
    };

    for (const [courseKey, courseData] of Object.entries(bank)) {
      const tests = courseData.tests || [];
      const totalQuestions = tests.reduce((sum, t) => sum + (t.questions?.length || 0), 0);
      result.push({
        key: courseKey,
        name: courseData.courseName,
        grade: g,
        icon: courseMeta[courseKey]?.icon || 'book',
        subtitle: courseMeta[courseKey]?.subtitle || '',
        testCount: tests.length,
        questionCount: totalQuestions
      });
    }
    return result;
  }

  // 2. Bir Kursa Ait Test Paketleri
  getTestsByCourse(courseKey, grade = null) {
    this.init();
    const g = grade ? Number(grade) : 8;
    const course = this.gradeBanks[g]?.[courseKey];
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
      grade: item.grade,
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
      grade: testItem.grade || 8,
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
