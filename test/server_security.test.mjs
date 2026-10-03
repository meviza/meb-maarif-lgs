import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { server } from '../server.mjs';

async function startServer() {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();

  return {
    origin: `http://127.0.0.1:${port}`,
    async stop() {
      server.closeAllConnections?.();
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  };
}

test('keeps answer-bearing banks private while exposing only a student-safe test DTO', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  for (const pathname of [
    '/questions.json',
    '/questions_grade_5.json',
    '/questions_grade_6.json',
    '/questions_grade_7.json'
  ]) {
    const response = await fetch(`${platform.origin}${pathname}`);
    assert.equal(response.status, 404, pathname);
  }

  const response = await fetch(`${platform.origin}/api/tests/TR-T1`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), null);

  const testDto = await response.json();
  const question = testDto.questions[0];
  for (const forbiddenField of [
    'correctOption',
    'correct_option',
    'correctAnswer',
    'solutionStrategy',
    'solution_strategy',
    'detailedSolution',
    'detailed_solution',
    'distractors',
    'jevAudit',
    'videoSolution'
  ]) {
    assert.equal(forbiddenField in question, false, forbiddenField);
  }
});

test('rejects cross-origin preflight instead of advertising a wildcard CORS policy', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const response = await fetch(`${platform.origin}/api/cloud/sync`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://untrusted.example' }
  });

  assert.equal(response.status, 404);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('keeps mutable, generative, scoring, and answer-bearing routes unavailable', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const requests = [
    ['POST', '/api/exam/submit'],
    ['GET', '/api/exam/results/session-1'],
    ['GET', '/api/ai/models'],
    ['POST', '/api/ai/generate-question'],
    ['POST', '/api/ai/batch-generate'],
    ['POST', '/api/cloud/sync'],
    ['GET', '/api/video-solutions/demos']
  ];

  for (const [method, pathname] of requests) {
    const response = await fetch(`${platform.origin}${pathname}`, { method });
    assert.equal(response.status, 404, `${method} ${pathname}`);
  }
});
