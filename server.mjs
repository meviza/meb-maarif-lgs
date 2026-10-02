/**
 * MEB Maarif LGS Platformu - Kurumsal REST API ve Web Sunucusu (Faz 3)
 * Node.js Native HTTP Sunucusu (Sıfır Bağımlılık, Yüksek Güvenilirlik)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './engine/db_adapter.mjs';
import { llmClient } from './engine/llm_client.mjs';
import { jevPipeline } from './engine/jev_self_correction.mjs';
import { compressAndArchiveData } from './scripts/cloud_sync_manager.mjs';
import { JevVideoSolutionEngine } from './engine/jev_video_solution_engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3333;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME Tipleri
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Yardımcı: JSON Yanıt Gönder
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Yardımcı: Statik Dosya Gönder
function serveStaticFile(req, res, filePath) {
  let safePath = path.normalize(filePath);
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Erişim Reddedildi');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 durumunda index.html'e yönlendir (SPA fallback)
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (err2, content) => {
        if (err2) {
          res.writeHead(404);
          res.end('Dosya Bulunamadı');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
}

// Sunucu Oluştur
export const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // ============================================================================
  // REST API UÇ NOKTALARI
  // ============================================================================

  // 1. Sistem Sağlık ve Bilgi
  if (req.method === 'GET' && pathname === '/api/health') {
    const grades = db.getGrades();
    const summary = db.getCoursesSummary(8);
    const totalQAllGrades = db.questionLookup.size;
    const totalTAllGrades = db.testLookup.size;
    sendJson(res, 200, {
      status: 'online',
      system: 'MEB Maarif Platformu (5, 6, 7 ve 8. Sınıflar)',
      version: '1.0.0-faz9',
      jevAuditor: 'ACTIVE (System-1 Multi-Grade)',
      stats: {
        totalGrades: grades.length,
        totalCourses: summary.length,
        grade8Tests: summary.reduce((sum, c) => sum + c.testCount, 0),
        grade8Questions: summary.reduce((sum, c) => sum + c.questionCount, 0),
        allGradesTests: totalTAllGrades,
        allGradesQuestions: totalQAllGrades
      },
      grades,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 1.1 Tüm Eğitim Kademeleri: GET /api/grades
  if (req.method === 'GET' && pathname === '/api/grades') {
    const grades = db.getGrades();
    sendJson(res, 200, { success: true, grades });
    return;
  }

  // 2. Kurs Listesi (Kademeye göre: ?grade=5|6|7|8, varsayılan 8)
  if (req.method === 'GET' && pathname === '/api/courses') {
    const grade = parsedUrl.searchParams.get('grade') || 8;
    const courses = db.getCoursesSummary(grade);
    sendJson(res, 200, { grade: Number(grade), courses });
    return;
  }

  // 3. Kursa Ait Test Paketleri: /api/courses/:courseKey/tests (?grade=X)
  const courseTestsMatch = pathname.match(/^\/api\/courses\/([a-zA-Z0-9_-]+)\/tests$/);
  if (req.method === 'GET' && courseTestsMatch) {
    const courseKey = courseTestsMatch[1];
    const grade = parsedUrl.searchParams.get('grade') || null;
    const tests = db.getTestsByCourse(courseKey, grade);
    sendJson(res, 200, { courseKey, grade: grade ? Number(grade) : null, tests });
    return;
  }

  // 4. Tek Bir Test ve Soruları: /api/tests/:testId
  const testMatch = pathname.match(/^\/api\/tests\/([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && testMatch) {
    const testId = testMatch[1];
    const testData = db.getTestById(testId);
    if (!testData) {
      sendJson(res, 404, { error: `Test bulunamadı: ${testId}` });
      return;
    }
    sendJson(res, 200, testData);
    return;
  }

  // 5. Optik Formu Gönder ve Sunucuda Puanla: POST /api/exam/submit
  if (req.method === 'POST' && pathname === '/api/exam/submit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (!payload.testId) {
          sendJson(res, 400, { error: 'testId alanı zorunludur' });
          return;
        }

        const sessionResult = db.submitExamSession({
          testId: payload.testId,
          answers: payload.answers || {},
          studentName: payload.studentName || 'Kerem Çelik',
          mode: payload.mode || 'EXAM',
          durationSeconds: payload.durationSeconds || 0
        });

        sendJson(res, 201, {
          success: true,
          message: 'Sınav oturumu başarıyla kaydedildi ve puanlandı.',
          session: sessionResult
        });
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
    });
    return;
  }

  // 6. Kaydedilmiş Sınav Sonucunu Getir: GET /api/exam/results/:sessionId
  const sessionResultMatch = pathname.match(/^\/api\/exam\/results\/([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && sessionResultMatch) {
    const sessionId = sessionResultMatch[1];
    const result = db.getSessionResult(sessionId);
    if (!result) {
      sendJson(res, 404, { error: `Sınav oturumu bulunamadı: ${sessionId}` });
      return;
    }
    sendJson(res, 200, result);
    return;
  }

  // 7. Faz 4: AI Model Bilgisi ve Ollama Durumu: GET /api/ai/models
  if (req.method === 'GET' && pathname === '/api/ai/models') {
    llmClient.listAvailableModels().then(info => {
      sendJson(res, 200, info);
    }).catch(err => {
      sendJson(res, 500, { error: err.message });
    });
    return;
  }

  // 8. Faz 4: Canlı Soru Üretimi ve JEV Self-Correction: POST /api/ai/generate-question
  if (req.method === 'POST' && pathname === '/api/ai/generate-question') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const generated = await jevPipeline.produceQuestion({
          course: payload.course || 'turkce',
          topic: payload.topic || 'Paragrafta Anlam',
          outcomeCode: payload.outcomeCode,
          difficulty: payload.difficulty,
          model: payload.model
        });
        sendJson(res, 200, generated);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
    });
    return;
  }

  // 9. Bulut Arşivleme & Gzip Level-9 Senkronizasyonu: POST /api/cloud/sync
  if (req.method === 'POST' && pathname === '/api/cloud/sync') {
    try {
      const result = compressAndArchiveData();
      sendJson(res, 200, {
        success: true,
        message: 'Gzip Level-9 sıkıştırma ve bulut arşivi başarıyla hazırlandı.',
        archivePath: result.archivePath,
        rawSizeKb: result.rawSizeKb,
        compSizeKb: result.compSizeKb,
        ratio: result.ratio
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // 10. Toplu Soru Üretimi (4 Branş): POST /api/ai/batch-generate
  if (req.method === 'POST' && pathname === '/api/ai/batch-generate') {
    try {
      const courses = ['turkce', 'matematik', 'fen', 'sosyal'];
      const difficulties = ['KAVRAMA', 'UYGULAMA', 'LGS_YENI_NESIL', 'SEKIL_VE_OLIMPIYAT'];
      const generatedList = [];

      for (const course of courses) {
        for (const diff of difficulties) {
          const q = jevPipeline.generateDeterministicFallback(course, 'Müfredat Analizi', null, diff);
          const audit = await jevPipeline.auditor.evaluateQuestion(q);
          q.jevAudit = audit;
          generatedList.push(q);
        }
      }

      sendJson(res, 200, {
        success: true,
        count: generatedList.length,
        message: `${generatedList.length} adet yeni nesil soru 4 branş ve 4 seviyede başarıyla üretildi.`,
        questions: generatedList
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // 11. JEV 10 Demo Video Çözüm Senaryosu ve Dizgi Portföyü: GET /api/video-solutions/demos
  if (req.method === 'GET' && pathname === '/api/video-solutions/demos') {
    try {
      db.init();
      const allQuestions = Array.from(db.questionLookup.values());
      const engine = new JevVideoSolutionEngine();
      const demos = engine.generate10DemoScripts(allQuestions);
      sendJson(res, 200, {
        success: true,
        count: demos.length,
        description: '10 Seçkin Soru İçin JEV 5 Aşamalı Video Çözüm Senaryosu ve InDesign/LaTeX Dizgi Paketi',
        demos
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // ============================================================================
  // STATİK DOSYA SUNUCUSU (PUBLIC KLASÖRÜ)
  // ============================================================================
  let targetFile = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const filePath = path.join(PUBLIC_DIR, targetFile);
  serveStaticFile(req, res, filePath);
});

// Doğrudan çalıştırıldığında dinlemeye başla
if (process.argv[1]?.endsWith('server.mjs')) {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 MEB Maarif LGS Platform Sunucusu Aktif!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📋 REST API: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}
