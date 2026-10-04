import assert from 'node:assert/strict';
import test from 'node:test';
import { request as httpRequest, Server } from 'node:http';
import { connect } from 'node:net';
import { mkdtemp, mkdir, copyFile, writeFile, rm, rename, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { createSyntheticNotebookFixture as fixture, createSyntheticNotebookRequest as notebookRequest,
  createSyntheticNotebookReceipt as receipt, hashSyntheticNotebook as sha } from './support/synthetic_notebook_fixture.mjs';

const names = ['synthetic_notebook_application_server.mjs', 'synthetic_notebook_application.mjs',
  'synthetic_notebook_adapter.mjs', 'synthetic_notebook_sync.mjs'];
const ASSETS = [
  { path: '/', file: 'notebook_desk.html', type: 'text/html; charset=utf-8', text: '<!doctype html><html lang="tr"><head><link rel="stylesheet" href="/notebook-desk.css"></head><body>Sentetik defter<script type="module" src="/notebook-desk.mjs"></script></body></html>' },
  { path: '/notebook-desk.css', file: 'notebook_desk.css', type: 'text/css; charset=utf-8', text: ':root { color-scheme: light; }\n' },
  { path: '/notebook-desk.mjs', file: 'notebook_desk.mjs', type: 'text/javascript; charset=utf-8', text: 'export const syntheticOnly = true;\n' },
];
const API_CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
const copy = value => JSON.parse(JSON.stringify(value));
function binding(s) {
  const { catalog: c, policy: p } = s, a = c.asset;
  return { sourceKind: 'synthetic_fixture', purpose: 'student_notebook', classification: p.classification, retentionClass: p.retentionClass,
    ownerId: a.ownerId, stewardId: a.stewardId, policyId: p.policyId, policySha256: p.policySha256, catalogId: c.catalogId,
    catalogRevisionId: c.revisionId, catalogSha256: c.catalogSha256, assetId: a.assetId, assetRevisionId: a.revisionId,
    definitionSha256: a.definitionSha256, targetCatalogSha256: sha('targets', { scopeSha256: sha('scope', s.scope), targets: s.allowedTargets }),
    catalogState: 'declared_synthetic_reference', limits: copy(p.limits) };
}
function readRow(s, req = null) {
  const r = req ? receipt(s, req) : null;
  return { rowCount: 1, rows: [{ notebook_result: { scope: copy(s.scope), scopeSha256: sha('scope', s.scope), revision: r?.resultingRevision ?? 0,
    body: req ? copy(req.body) : null, bodySha256: r?.bodySha256 ?? null, receipt: r, governanceBinding: binding(s), syntheticOnly: true, productionReady: false } }] };
}
function writeRow(s, req) { const r = receipt(s, req); return { rowCount: 1, rows: [{ notebook_result: { outcome: 'accepted', receipt: r,
  head: { revision: r.resultingRevision, bodySha256: r.bodySha256 }, syntheticOnly: true, productionReady: false } }] }; }

// Test-only filesystem sandbox, never a production root/path injection. The
// actual modules and their palette dependency are copied without rewriting imports and served with
// minimal independent fixture assets. Canonical UI files are never changed.
async function sandbox(t, mutate = null) {
  const root = await mkdtemp(join(tmpdir(), 'k12-notebook-desk-')), contracts = join(root, 'packages', 'contracts'), student = join(root, 'packages', 'student');
  t.after(async () => { await rm(root, { recursive: true, force: false }); });
  await mkdir(contracts, { recursive: true }); await mkdir(student);
  for (const name of names) await copyFile(new URL(`../packages/contracts/${name}`, import.meta.url), join(contracts, name));
  await copyFile(new URL('../packages/student/notebook.mjs', import.meta.url), join(student, 'notebook.mjs'));
  for (const asset of ASSETS) await writeFile(join(student, asset.file), asset.text, 'utf8');
  const api = await import(pathToFileURL(join(contracts, names[0])).href);
  if (mutate) await mutate({ root, contracts, student });
  return { api, root, student };
}
function desk(api, options = { sourceFixture: fixture(), execute() {} }) {
  assert.equal(typeof api.createSyntheticNotebookDeskServer, 'function', 'fixed notebook desk server missing');
  return api.createSyntheticNotebookDeskServer(options);
}
async function start(t, api, options = { sourceFixture: fixture(), execute() {} }, legacy = false) {
  const server = legacy ? api.createSyntheticNotebookApplicationServer(options) : desk(api, options);
  assert.ok(server instanceof Server); assert.equal(server.listening, false);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const port = server.address().port, host = `127.0.0.1:${port}`; return { server, port, host, origin: `http://${host}` };
}
function request(c, { method = 'GET', path = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', port: c.port, method, path, headers }, res => {
      let size = 0; const chunks = [];
      res.on('data', chunk => { size += chunk.length; if (size > 524288) req.destroy(new Error('test_response_budget')); else chunks.push(chunk); });
      res.on('end', () => { const bytes = Buffer.concat(chunks), text = bytes.toString('utf8'); resolve({ status: res.statusCode, headers: res.headers, bytes, text,
        json: text && res.headers['content-type']?.startsWith('application/json') ? JSON.parse(text) : null }); });
    });
    req.on('error', reject); req.setTimeout(4000, () => req.destroy(new Error('test_request_deadline'))); req.end(body);
  });
}
const current = async c => (await request(c, { path: '/api/notebook/current' })).json;
const post = (c, path, body = {}) => request(c, { method: 'POST', path: `/api/notebook/${path}`,
  headers: { Origin: c.origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
function raw(c, message) { return new Promise((resolve, reject) => { const socket = connect({ host: '127.0.0.1', port: c.port }, () => socket.write(message));
  let out = ''; socket.setTimeout(4000, () => socket.destroy(new Error('test_raw_deadline'))); socket.on('data', v => { out += v.toString('utf8'); });
  socket.on('error', reject); socket.on('end', () => resolve(out)); }); }

test('new desk serves exactly three fixed snapshot text assets and leaves current unread SQL free with API CSP unchanged', async t => {
  const kit = await sandbox(t); let calls = 0; const c = await start(t, kit.api, { sourceFixture: fixture(), execute() { calls++; } });
  for (const asset of ASSETS) {
    const out = await request(c, { path: asset.path }); assert.equal(out.status, 200); assert.equal(out.text, asset.text);
    assert.equal(out.headers['content-type'], asset.type); assert.equal(out.headers['content-length'], String(Buffer.byteLength(asset.text)));
    assert.equal(out.headers['cache-control'], 'no-store'); assert.equal(out.headers['x-content-type-options'], 'nosniff');
    assert.equal(out.headers['cross-origin-resource-policy'], 'same-origin'); assert.equal(Object.hasOwn(out.headers, 'access-control-allow-origin'), false);
    const csp = out.headers['content-security-policy']; assert.match(csp, /default-src 'none'/u); assert.match(csp, /script-src 'self'/u);
    assert.match(csp, /style-src 'self'/u); assert.match(csp, /connect-src 'self'/u); assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https?:/u);
  }
  const out = await request(c, { path: '/api/notebook/current' }); assert.equal(out.status, 200); assert.equal(out.headers['content-security-policy'], API_CSP);
  assert.equal(out.json.readProjection, null); assert.equal(out.json.state, 'not_read'); assert.equal(out.json.realDatabaseVerified, false);
  assert.equal(out.json.authentication, 'not_implemented'); assert.equal(out.json.learningAnalyticsMapped, false); assert.equal(calls, 0);
});

test('original API profile never reads desk assets and retains404 for all static paths even if their files are absent', async t => {
  const kit = await sandbox(t, async ({ student }) => { await rm(student, { recursive: true, force: false }); }); let calls = 0;
  assert.equal(typeof kit.api.createSyntheticNotebookDeskServer, 'function', 'fixed notebook desk server missing');
  const c = await start(t, kit.api, { sourceFixture: fixture(), execute() { calls++; } }, true);
  for (const asset of ASSETS) assert.equal((await request(c, { path: asset.path })).status, 404);
  assert.equal((await request(c, { path: '/api/notebook/current' })).headers['content-security-policy'], API_CSP); assert.equal(calls, 0);
});

test('browser navigation stylesheet and module headers work without widening closed auth or scope headers', async t => {
  const kit = await sandbox(t), c = await start(t, kit.api);
  for (const [path, mode, destination] of [['/', 'navigate', 'document'], ['/notebook-desk.css', 'no-cors', 'style'], ['/notebook-desk.mjs', 'cors', 'script']]) {
    const out = await request(c, { path, headers: { Accept: '*/*', 'Accept-Language': 'tr-TR', 'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent': 'Synthetic-test-browser', 'Sec-Fetch-Site': 'same-origin', 'Sec-Fetch-Mode': mode, 'Sec-Fetch-Dest': destination,
      'Sec-CH-UA': '"Synthetic";v="1"', 'Sec-CH-UA-Mobile': '?0', 'Sec-CH-UA-Platform': '"macOS"' } }); assert.equal(out.status, 200);
  }
  for (const header of ['Authorization', 'Cookie', 'X-Grade', 'Forwarded', 'Role', 'Arbitrary'])
    assert.equal((await request(c, { headers: { [header]: 'caller-owned' } })).status, 400);
  assert.equal((await current(c)).state, 'not_read');
});

test('user-activated navigation headers are allowed only for GET fixed assets never the original or desk API', async t => {
  const kit = await sandbox(t), deskContext = await start(t, kit.api), legacy = await start(t, kit.api, undefined, true);
  const navigation = { 'Sec-Fetch-User': '?1', 'Upgrade-Insecure-Requests': '1', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Site': 'none' };
  assert.equal((await request(deskContext, { headers: navigation })).status, 200);
  for (const c of [deskContext, legacy]) assert.equal((await request(c, { path: '/api/notebook/current', headers: navigation })).status, 400);
  assert.equal((await request(legacy, { headers: navigation })).status, 400);
  for (const headers of [{ 'Sec-Fetch-User': '?0' }, { 'Upgrade-Insecure-Requests': '2' }]) assert.equal((await request(deskContext, { headers })).status, 400);
  assert.equal((await request(deskContext, { method: 'POST', headers: { ...navigation, Origin: deskContext.origin } })).status, 400);
});

test('static routes are GET-only body-free query-free exact mappings with no alias or traversal exposure', async t => {
  const kit = await sandbox(t); let calls = 0; const c = await start(t, kit.api, { sourceFixture: fixture(), execute() { calls++; } });
  for (const path of ['/index.html', '/notebook_desk.html', '/notebook_desk.css', '/favicon.ico', '/notebook-desk.css/', '//notebook-desk.css',
    '/%6eotebook-desk.css', '/../packages/contracts/synthetic_notebook_application.mjs', 'http://evil.invalid/notebook-desk.mjs'])
    assert.equal((await request(c, { path })).status, 404);
  for (const asset of ASSETS) {
    for (const method of ['HEAD', 'POST', 'PUT', 'OPTIONS']) assert.equal((await request(c, { method, path: asset.path,
      headers: method === 'POST' ? { Origin: c.origin } : {} })).status, 405);
    assert.equal((await request(c, { path: asset.path + '?file=private' })).status, 400);
    assert.equal((await request(c, { path: asset.path, headers: { 'Content-Length': '2' }, body: '{}' })).status, 400);
    assert.equal((await request(c, { path: asset.path, headers: { 'Transfer-Encoding': 'chunked' }, body: '' })).status, 400);
  }
  assert.equal(calls, 0); assert.equal((await current(c)).readProjection, null);
});

test('static routes share exact Host Origin loopback fetch-site and duplicate-header checks before any asset bytes', async t => {
  const kit = await sandbox(t), c = await start(t, kit.api);
  for (const asset of ASSETS) {
    for (const headers of [{ Host: `localhost:${c.port}` }, { Origin: 'http://evil.invalid' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
      const out = await request(c, { path: asset.path, headers }); assert.equal(out.status, 403); assert.equal(out.json.state, 'rejected');
      assert.equal(out.headers['content-security-policy'], API_CSP); assert.doesNotMatch(out.text, /Sentetik defter|export const syntheticOnly/u);
    }
  }
  const output = await raw(c, `GET / HTTP/1.1\r\nHost: ${c.host}\r\nHost: evil.invalid\r\nConnection: close\r\n\r\n`);
  assert.match(output, /^HTTP\/1\.1 400 /u); assert.equal((await current(c)).state, 'not_read');
});

test('new constructor refuses client web roots paths sources and hooks before executing or invoking getters', async t => {
  const kit = await sandbox(t); assert.equal(typeof kit.api.createSyntheticNotebookDeskServer, 'function'); let hooks = 0;
  const good = { sourceFixture: fixture(), execute() { hooks++; } }, getter = { sourceFixture: fixture() };
  Object.defineProperty(getter, 'execute', { enumerable: true, get() { hooks++; return good.execute; } }); const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const options of [null, {}, getter, revoked.proxy, { ...good, webRoot: kit.student }, { ...good, path: '/tmp/private' },
    { ...good, assets: ASSETS }, { ...good, ui: 'student' }, { ...good, assetReader() { hooks++; } }, { ...good, role: 'postgres' }])
    assert.throws(() => kit.api.createSyntheticNotebookDeskServer(options), /invalid_synthetic_notebook_desk_server_options/u);
  assert.throws(() => kit.api.createSyntheticNotebookDeskServer(good, true), /invalid_synthetic_notebook_desk_server_options/u); assert.equal(hooks, 0);
});

test('desk uses the same application save/read distinction and static fetching never starts a database operation', async t => {
  const kit = await sandbox(t), s = fixture(), first = notebookRequest(), second = copy(first); second.expectedRevision = 1;
  second.mutationId = 'mutation-desk-2'; second.idempotencyKey = 'idem-desk-2'; second.body.text = 'Not only a received save receipt';
  let head = first; const calls = [], c = await start(t, kit.api, { sourceFixture: s, execute(q) { calls.push(q);
    if (q.text === 'SELECT student_notebook.read_current($1::text) AS notebook_result') return readRow(s, head);
    assert.equal(q.text, 'SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result'); assert.deepEqual(JSON.parse(q.values[0]).scope, s.scope);
    head = second; return writeRow(s, second); } });
  const prior = (await post(c, 'read')).json.view.readProjection, out = await post(c, 'save', second);
  assert.equal(out.status, 200); assert.equal(out.json.persisted, true); assert.deepEqual(out.json.view.readProjection, prior);
  assert.equal(out.json.view.projectionFreshness, 'stale_after_write'); assert.equal(out.json.automaticRead, false); assert.equal(out.json.automaticRetry, false);
  for (const asset of ASSETS) assert.equal((await request(c, { path: asset.path })).status, 200); assert.equal(calls.length, 2);
  assert.equal((await current(c)).readProjection.revision, 1); assert.equal(calls.length, 2);
  assert.equal((await post(c, 'read')).json.view.readProjection.revision, 2); assert.equal(calls.length, 3);
});

test('leaf symlink assets fail closed before listening and their target path or contents are not echoed', async t => {
  const kit = await sandbox(t, async ({ root, student }) => { const secret = join(root, 'private-synthetic.txt');
    await writeFile(secret, 'private-synthetic-never-served'); await rm(join(student, 'notebook_desk.mjs')); await symlink(secret, join(student, 'notebook_desk.mjs')); });
  let calls = 0; assert.equal(typeof kit.api.createSyntheticNotebookDeskServer, 'function');
  assert.throws(() => desk(kit.api, { sourceFixture: fixture(), execute() { calls++; } }), error => error.message === 'invalid_synthetic_notebook_desk_assets'); assert.equal(calls, 0);
});

test('asset directory symlink cannot select an alternate root', async t => {
  const kit = await sandbox(t, async ({ root, student }) => { const moved = join(root, 'alternate-assets'); await rename(student, moved); await symlink(moved, student); });
  assert.equal(typeof kit.api.createSyntheticNotebookDeskServer, 'function'); assert.throws(() => desk(kit.api), /invalid_synthetic_notebook_desk_assets/u);
});

test('a nonregular asset or missing member rejects the whole fixed bundle rather than exposing a partial desk', async t => {
  for (const kind of ['directory', 'missing']) {
    const kit = await sandbox(t, async ({ student }) => { const target = join(student, 'notebook_desk.css'); await rm(target); if (kind === 'directory') await mkdir(target); });
    assert.equal(typeof kit.api.createSyntheticNotebookDeskServer, 'function'); assert.throws(() => desk(kit.api), /invalid_synthetic_notebook_desk_assets/u);
  }
});

test('each asset is bounded before read allocation and128KiB text is an explicit supported edge', async t => {
  const bad = await sandbox(t, async ({ student }) => { await writeFile(join(student, 'notebook_desk.css'), 'x'.repeat(131073)); });
  assert.equal(typeof bad.api.createSyntheticNotebookDeskServer, 'function'); assert.throws(() => desk(bad.api), /invalid_synthetic_notebook_desk_assets/u);
  const good = await sandbox(t, async ({ student }) => { await writeFile(join(student, 'notebook_desk.css'), 'x'.repeat(131072)); });
  const c = await start(t, good.api), out = await request(c, { path: '/notebook-desk.css' }); assert.equal(out.status, 200);
  assert.equal(out.bytes.length, 131072); assert.equal(out.text, 'x'.repeat(131072));
});

test('malformed UTF8 BOM and NUL text asset bytes are denied before serving or executing any hook', async t => {
  for (const bytes of [Buffer.from([0xc0, 0xaf]), Buffer.from([0xef, 0xbb, 0xbf, 0x78]), Buffer.from('export\0bad')]) {
    const kit = await sandbox(t, async ({ student }) => { await writeFile(join(student, 'notebook_desk.mjs'), bytes); });
    let calls = 0; assert.equal(typeof kit.api.createSyntheticNotebookDeskServer, 'function');
    assert.throws(() => desk(kit.api, { sourceFixture: fixture(), execute() { calls++; } }), /invalid_synthetic_notebook_desk_assets/u); assert.equal(calls, 0);
  }
});

test('post-construction file replacement cannot change the descriptor-validated asset snapshot seen by HTTP clients', async t => {
  const kit = await sandbox(t), c = await start(t, kit.api);
  const target = join(kit.student, 'notebook_desk.mjs'), outside = join(kit.root, 'replacement-private.txt');
  await writeFile(outside, 'private replacement never appears'); await rm(target); await symlink(outside, target);
  const out = await request(c, { path: '/notebook-desk.mjs' }); assert.equal(out.status, 200); assert.equal(out.text, ASSETS[2].text);
  assert.doesNotMatch(out.text, /private replacement/u); assert.equal((await current(c)).state, 'not_read');
});

test('fixed desk instances share no application projection even while serving the same asset bytes', async t => {
  const kit = await sandbox(t), a = fixture(), b = fixture('b'); let acalls = 0, bcalls = 0;
  const first = await start(t, kit.api, { sourceFixture: a, execute() { acalls++; return readRow(a, notebookRequest()); } });
  const second = await start(t, kit.api, { sourceFixture: b, execute() { bcalls++; return readRow(b, notebookRequest('b')); } });
  assert.equal((await post(first, 'read')).json.view.readProjection.scope.schoolId, 'demo-school-a');
  assert.equal((await current(second)).readProjection, null); assert.equal((await request(second)).text, ASSETS[0].text);
  assert.equal(acalls, 1); assert.equal(bcalls, 0);
});
