import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { once } from 'node:events';
import { mkdtemp, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import fsPromises from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
const api = await import('../packages/student/local_student_server.mjs').catch(() => ({}));
const registry = JSON.parse(await readFile(new URL('../sources/meb-reference-registry.json', import.meta.url), 'utf8'));

async function start(t, options = {}) {
  assert.equal(typeof api.createLocalStudentServer, 'function', 'local student preview server is not implemented');
  const webRoot = await mkdtemp(join(tmpdir(), 'k12-student-preview-'));
  for (const file of ['index.html', 'student.css', 'student.mjs', 'notebook.mjs']) await writeFile(join(webRoot, file), file === 'index.html' ? '<!doctype html><html lang="tr"><title>Öğrenci</title></html>' : '/* local test fixture */');
  const server = api.createLocalStudentServer({ sourceRegistry: registry, webRoot, now: () => '2026-10-03T12:00:00.000Z', ...options });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = server.address().port;
  t.after(async () => { server.closeAllConnections?.(); await new Promise(resolve => server.close(resolve)); await rm(webRoot, { recursive: true, force: true }); });
  return { origin: `http://127.0.0.1:${port}`, port, webRoot, server };
}
function raw(port, path, headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => { const req = http.request({ host: '127.0.0.1', port, path, headers, method }, response => { let body = ''; response.setEncoding('utf8'); response.on('data', chunk => body += chunk); response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body })); }); req.on('error', reject); req.end(); });
}
async function withAssetOpenBoundary(path, instrument, run) {
  const original = fsPromises.open;
  fsPromises.open = async (requested, ...options) => {
    const handle = await original(requested, ...options);
    if (requested !== path) return handle;
    const overrides = instrument(handle);
    return new Proxy(handle, { get(target, key) { if (Object.hasOwn(overrides, key)) return overrides[key]; const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value; } });
  };
  syncBuiltinESMExports();
  try { return await run(); }
  finally { fsPromises.open = original; syncBuiltinESMExports(); }
}

test('GET workspace is server-scoped synthetic grade six with no published library, CORS or answer keys', async t => {
  const server = await start(t); const response = await fetch(server.origin + '/api/workspace'); const data = await response.json();
  assert.equal(response.status, 200); assert.equal(data.grade, 6); assert.equal(data.courses.length, 6); assert.equal(data.publicationEnabled, false); assert.equal(data.mode, 'synthetic_student_preview');
  assert.deepEqual(data.library, { questions: [], lessons: [], videos: [] });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null); assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(response.headers.get('Content-Security-Policy'), /connect-src 'self'/);
  assert.equal(JSON.stringify(data).includes('answerIndex'), false);
});

test('grade, tenant, year, role query alternatives are all rejected, not trusted browser claims', async t => {
  const server = await start(t);
  for (const query of ['grade=5', 'grade=6', 'tenant=other', 'schoolYear=2027-2028', 'role=admin', 'grade=6&grade=8']) assert.equal((await fetch(server.origin + '/api/workspace?' + query)).status, 400);
  const response = await fetch(server.origin + '/api/workspace', { headers: { 'X-Student-Grade': '8' } }); assert.equal(response.status, 400);
});

test('non-loopback Host, cross-origin reads and every mutation method fail closed', async t => {
  const server = await start(t);
  assert.equal((await raw(server.port, '/api/workspace', { Host: 'attacker.example' })).status, 403);
  assert.equal((await raw(server.port, '/api/workspace', { Origin: 'https://attacker.example' })).status, 403);
  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) assert.equal((await raw(server.port, '/api/workspace', {}, method)).status, 405);
});

test('only four frontend assets are readable, traversal and symlink targets never expose arbitrary files', async t => {
  const server = await start(t);
  for (const route of ['/', '/index.html', '/student.css', '/student.mjs', '/notebook.mjs']) assert.equal((await fetch(server.origin + route)).status, 200, route);
  for (const route of ['/workspace.mjs', '/../../package.json', '/source-registry.json', '/api/workspace/../secret']) assert.equal((await raw(server.port, route)).status, 404, route);
  await rm(join(server.webRoot, 'student.css')); await symlink(new URL('../package.json', import.meta.url), join(server.webRoot, 'student.css'));
  assert.equal((await fetch(server.origin + '/student.css')).status, 404);
});

test('expired synthetic school subscription gives denial rather than empty success', async t => {
  const server = await start(t, { now: () => '2027-09-01T00:00:00.000Z' });
  const response = await fetch(server.origin + '/api/workspace'); const data = await response.json();
  assert.equal(response.status, 403); assert.equal(data.error, 'subscription_expired'); assert.equal(Object.hasOwn(data, 'courses'), false);
});

test('a valid asset is served through bounded positional reads without unbounded readFile capability', async t => {
  const server = await start(t);
  const response = await withAssetOpenBoundary(join(server.webRoot, 'student.css'), () => ({ readFile: async () => { throw new Error('unbounded_storage_read_not_available'); } }), () => fetch(server.origin + '/student.css'));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '/* local test fixture */');
});

test('descriptor metadata drift during a read rejects the stale asset rather than returning a successful response', async t => {
  const server = await start(t);
  let changed = false;
  const changeMetadata = async handle => { if (!changed) { changed = true; await handle.utimes(new Date('2030-01-01T00:00:00.000Z'), new Date('2030-01-01T00:00:00.000Z')); } };
  const response = await withAssetOpenBoundary(join(server.webRoot, 'student.css'), handle => ({
    readFile: async (...args) => { const result = await handle.readFile(...args); await changeMetadata(handle); return result; },
    read: async (...args) => { const result = await handle.read(...args); await changeMetadata(handle); return result; },
  }), () => fetch(server.origin + '/student.css'));
  assert.equal(changed, true);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'asset_unavailable' });
});
