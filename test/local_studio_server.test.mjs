import assert from 'node:assert/strict';
import fsPromises, { mkdtemp, writeFile, appendFile, rm, symlink } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { mock } from 'node:test';
import http from 'node:http';

async function withStudio(t, options = {}) {
  const module = await import('../packages/studio/local_studio_server.mjs').catch(() => null);
  assert.ok(module?.createLocalStudioServer, 'local-only studio server must exist');
  const server = module.createLocalStudioServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('missing pilot evidence is reported as unavailable, never a successful batch', async t => {
  const base = await withStudio(t, { pilotReportPath: '/does-not-exist/batch.json' });
  const response = await fetch(`${base}/api/studio`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.mode, 'local_review_preview');
  assert.equal(result.pilot.status, 'unavailable');
  assert.equal(result.pilot.report, null);
  assert.equal(result.publicationEnabled, false);
});

test('studio reads actual bounded evidence without inventing approval totals', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'k12-studio-'));
  t.after(() => rm(dir, { recursive: true }));
  const file = path.join(dir, 'batch.json');
  await writeFile(file, JSON.stringify({ requested: 100, produced: 12, published: 0 }));
  const base = await withStudio(t, { pilotReportPath: file });
  const result = await (await fetch(`${base}/api/studio`)).json();
  assert.deepEqual(result.pilot.report, { requested: 100, produced: 12, published: 0 });
  assert.equal(result.pilot.status, 'available');
});

test('oversized evidence is refused rather than loaded into the review process', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'k12-studio-'));
  t.after(() => rm(dir, { recursive: true }));
  const file = path.join(dir, 'huge.json');
  await writeFile(file, ' '.repeat(3 * 1024 * 1024 + 1));
  const base = await withStudio(t, { pilotReportPath: file });
  const result = await (await fetch(`${base}/api/studio`)).json();
  assert.equal(result.pilot.status, 'invalid');
  assert.equal(result.pilot.report, null);
});

test('configured JSON symlinks and nonregular paths cannot supply a pilot report', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'k12-studio-symlink-'));
  t.after(() => rm(dir, { recursive: true }));
  const file = path.join(dir, 'real.json');
  const link = path.join(dir, 'linked.json');
  await writeFile(file, JSON.stringify({ published: 0 }));
  await symlink(file, link);
  for (const configuredPath of [link, dir]) {
    const base = await withStudio(t, { pilotReportPath: configuredPath });
    const result = await (await fetch(`${base}/api/studio`)).json();
    assert.equal(result.pilot.status, 'invalid');
    assert.equal(result.pilot.report, null);
  }
});

test('JSON growth during a descriptor read is rejected rather than accepted as an unchanged snapshot', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'k12-studio-growth-'));
  t.after(() => rm(dir, { recursive: true }));
  const file = path.join(dir, 'batch.json');
  await writeFile(file, JSON.stringify({ published: 0 }));
  const realOpen = fsPromises.open;
  const replacement = mock.method(fsPromises, 'open', async (...args) => {
    const handle = await realOpen(...args);
    if (args[0] === file) {
      const realRead = handle.read.bind(handle);
      let mutated = false;
      handle.read = async (...readArgs) => {
        const result = await realRead(...readArgs);
        if (!mutated) { mutated = true; await appendFile(file, ' '.repeat(3 * 1024 * 1024)); }
        return result;
      };
    }
    return handle;
  });
  syncBuiltinESMExports();
  try {
    const base = await withStudio(t, { pilotReportPath: file });
    const result = await (await fetch(`${base}/api/studio`)).json();
    assert.equal(result.pilot.status, 'invalid');
    assert.equal(result.pilot.report, null);
  } finally { replacement.mock.restore(); syncBuiltinESMExports(); }
});

test('non-loopback Host is denied to prevent remote DNS-rebinding access', async t => {
  const base = await withStudio(t);
  // Node fetch normalizes Host to the URL. A raw request exercises the actual
  // hostile header at the server boundary rather than a sanitized client call.
  const responseStatus = await new Promise((resolve, reject) => {
    const url = new URL(`${base}/api/studio`);
    http.get({ hostname: url.hostname, port: url.port, path: url.pathname, headers: { Host: 'attacker.example' } }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    }).on('error', reject);
  });
  assert.equal(responseStatus, 403);
});

test('mutations and arbitrary filesystem paths have no route', async t => {
  const base = await withStudio(t);
  assert.equal((await fetch(`${base}/api/studio`, { method: 'POST', body: '{}' })).status, 405);
  for (const route of ['/package.json', '/.env', '/questions.json', '/api/publish', '/%2e%2e/.env']) {
    assert.equal((await fetch(`${base}${route}`)).status, 404, route);
  }
});

test('preview serves a private no-store shell with restrictive script and network policy', async t => {
  const base = await withStudio(t);
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-security-policy'), /connect-src 'self'/);
  assert.doesNotMatch(response.headers.get('content-security-policy'), /unsafe-inline|unsafe-eval/);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.match(await response.text(), /İçerik Atölyesi/);
});

test('browser receives the bounded view model through one explicit module route', async t => {
  const base = await withStudio(t);
  const response = await fetch(`${base}/view_model.mjs`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /javascript/);
  assert.equal((await fetch(`${base}/packages/studio/view_model.mjs`)).status, 404);
});
