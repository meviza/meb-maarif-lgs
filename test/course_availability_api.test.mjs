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

test('describes an unseeded grade as unavailable instead of treating an empty course list as ready content', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const response = await fetch(`${platform.origin}/api/courses?grade=1`);
  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.deepEqual(
    {
      grade: payload.grade,
      courses: payload.courses,
      contentState: payload.contentState,
      curriculumTraceability: payload.curriculumTraceability
    },
    {
      grade: 1,
      courses: [],
      contentState: 'not_seeded',
      curriculumTraceability: 'not_verified'
    }
  );
});

test('describes legacy prototype courses as unverified rather than published', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const response = await fetch(`${platform.origin}/api/courses?grade=5`);
  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.equal(payload.contentState, 'prototype_unverified');
  assert.equal(payload.curriculumTraceability, 'not_verified');
  assert.equal(payload.courses.length > 0, true);
});

test('does not expose an arbitrary grade outside the grades one to eight reference catalog', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const response = await fetch(`${platform.origin}/api/courses?grade=9`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});

test('never substitutes another grade test bank when the requested grade has no seeded content', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const response = await fetch(`${platform.origin}/api/courses/turkce/tests?grade=1`);
  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.deepEqual(payload, {
    courseKey: 'turkce',
    grade: 1,
    tests: []
  });
});

test('rejects an unsupported grade on the course test route as well', async (t) => {
  const platform = await startServer();
  t.after(async () => platform.stop());

  const response = await fetch(`${platform.origin}/api/courses/turkce/tests?grade=9`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});
