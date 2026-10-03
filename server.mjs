/**
 * Read-only prototype server.
 *
 * This surface deliberately excludes answer keys, solutions, AI generation,
 * student records, and cloud synchronization until identity, authorization,
 * content-rights, and audit controls exist.
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './engine/db_adapter.mjs';
import { buildGradesOneToEightFoundationCatalog } from './packages/reference-data/grade_catalog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3333);
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const PRIVATE_BANK_PATHS = new Set([
  '/questions.json',
  '/questions_grade_5.json',
  '/questions_grade_6.json',
  '/questions_grade_7.json'
]);

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function sendNotFound(res) {
  sendJson(res, 404, { error: 'Not found' });
}

function toStudentQuestionDto(question) {
  // An allow-list prevents new authoring-only fields from becoming public by
  // accident. Visual HTML is intentionally not sent until it has a reviewed
  // asset/provenance contract.
  return {
    id: question.id,
    course: question.course,
    grade: question.grade,
    stimulus: question.stimulus,
    stem: question.stem,
    options: {
      A: question.options?.A,
      B: question.options?.B,
      C: question.options?.C,
      D: question.options?.D
    }
  };
}

function toStudentTestDto(testData) {
  return {
    id: testData.id,
    grade: testData.grade,
    courseKey: testData.courseKey,
    title: testData.title,
    contentState: 'draft',
    questions: testData.questions.map(toStudentQuestionDto)
  };
}

function serveStaticFile(req, res, pathname) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    sendNotFound(res);
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const safePath = path.resolve(PUBLIC_DIR, relativePath);
  const publicRootWithSeparator = `${PUBLIC_DIR}${path.sep}`;
  if (safePath !== PUBLIC_DIR && !safePath.startsWith(publicRootWithSeparator)) {
    sendNotFound(res);
    return;
  }

  fs.stat(safePath, (error, stats) => {
    if (error || !stats.isFile()) {
      sendNotFound(res);
      return;
    }

    const contentType = MIME_TYPES[path.extname(safePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': stats.size,
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(safePath).pipe(res);
  });
}

function safeGradeSummary() {
  const prototypeSummaries = db.getGrades().map(({ grade, name, courseCount, testCount, questionCount }) => ({
    grade,
    name,
    courseCount,
    testCount,
    questionCount
  }));
  return buildGradesOneToEightFoundationCatalog(prototypeSummaries);
}

export function createPlatformServer() {
  return http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // There is no cross-origin browser API until an explicit allowed-origin
    // policy and authenticated session model are introduced.
    if (req.method === 'OPTIONS') {
      sendNotFound(res);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, {
        status: 'prototype_read_only',
        releaseState: 'blocked_pending_security_architecture',
        system: 'K-12 education platform prototype',
        contentRelease: 'not approved for publication',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/grades') {
      sendJson(res, 200, {
        grades: safeGradeSummary(),
        scope: 'foundation_reference_and_prototype_metadata'
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/courses') {
      const grade = Number(parsedUrl.searchParams.get('grade') || 8);
      const courses = db.getCoursesSummary(grade).map(({ key, name, grade: courseGrade, icon, subtitle, testCount, questionCount }) => ({
        key,
        name,
        grade: courseGrade,
        icon,
        subtitle,
        testCount,
        questionCount
      }));
      sendJson(res, 200, { grade, courses, scope: 'prototype_metadata' });
      return;
    }

    const courseTestsMatch = pathname.match(/^\/api\/courses\/([a-zA-Z0-9_-]+)\/tests$/);
    if (req.method === 'GET' && courseTestsMatch) {
      const courseKey = courseTestsMatch[1];
      const grade = parsedUrl.searchParams.get('grade');
      const tests = db.getTestsByCourse(courseKey, grade).map(({ id, title, questionCount, durationMinutes }) => ({
        id,
        title,
        questionCount,
        durationMinutes,
        contentState: 'draft'
      }));
      sendJson(res, 200, { courseKey, grade: grade ? Number(grade) : null, tests });
      return;
    }

    const testMatch = pathname.match(/^\/api\/tests\/([a-zA-Z0-9_-]+)$/);
    if (req.method === 'GET' && testMatch) {
      const testData = db.getTestById(testMatch[1]);
      if (!testData) {
        sendNotFound(res);
        return;
      }
      sendJson(res, 200, toStudentTestDto(testData));
      return;
    }

    // All mutable, generative, scoring, cloud, admin, and answer-bearing API
    // routes are intentionally absent from the prototype surface.
    if (pathname.startsWith('/api/')) {
      sendNotFound(res);
      return;
    }

    if (PRIVATE_BANK_PATHS.has(pathname)) {
      sendNotFound(res);
      return;
    }

    serveStaticFile(req, res, pathname);
  });
}

export const server = createPlatformServer();

if (process.argv[1]?.endsWith('server.mjs')) {
  server.listen(PORT, () => {
    console.log(`Read-only prototype server listening on http://localhost:${PORT}`);
  });
}
