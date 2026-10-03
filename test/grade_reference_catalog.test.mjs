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

test('exposes grades 1 through 8 as foundation reference data without representing unavailable content as published', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const response = await fetch(`${platform.origin}/api/grades`);
  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.deepEqual(
    payload.grades.map(grade => grade.grade),
    [1, 2, 3, 4, 5, 6, 7, 8]
  );

  const gradeOne = payload.grades[0];
  assert.deepEqual(
    {
      contentState: gradeOne.contentState,
      curriculumTraceability: gradeOne.curriculumTraceability,
      referenceState: gradeOne.referenceState
    },
    {
      contentState: 'not_seeded',
      curriculumTraceability: 'not_verified',
      referenceState: 'foundation_reference'
    }
  );

  const gradeFive = payload.grades[4];
  assert.equal(gradeFive.contentState, 'prototype_unverified');
  assert.equal(gradeFive.curriculumTraceability, 'not_verified');
  assert.equal(gradeFive.questionCount > 0, true);
});
