import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { request } from 'node:http';
import { connect } from 'node:net';

const api = await import('../packages/content-factory/science_678_preview_server.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const fixtureHtml = '<!doctype html><html lang="tr"><head><title>Sentetik editör testi</title><style>body{color:#123}</style></head><body><h1>Sentetik taslak</h1><script>document.documentElement.dataset.fixture="local";</script></body></html>';
const fixtureManifest = html => ({
  schemaVersion: 'science-678-editor-view/v1', state: 'partial_editor_inventory', authoredDrafts: 54,
  reasoningFamilies: 27, targetDrafts: 450, remainingDrafts: 396, publishedQuestions: 0, providerCallsMade: 0,
  reviewContentSha256: 'a'.repeat(64), htmlSha256: createHash('sha256').update(html).digest('hex'),
  htmlBytes: Buffer.byteLength(html), answerBearingEditorArtifact: true, learnerReady: false,
  publicationReady: false, nativeBrowserVerified: false,
});
async function open(t, html = fixtureHtml, manifest = fixtureManifest(html)) {
  assert.equal(typeof api.createScience678PreviewServer, 'function', 'science preview server constructor is missing');
  const server = await api.createScience678PreviewServer(html, manifest);
  t.after(async () => server.close());
  return server;
}
function get(url, options = {}) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = request({hostname: '::1', port: parsed.port, path: options.path ?? '/', method: options.method ?? 'GET', headers: options.headers ?? {}}, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8')}));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

test('frozen editor snapshot binds only IPv6 loopback port zero and serves exact bytes', async t => {
  const server = await open(t);
  assert.equal(server.schemaVersion, 'science-678-preview-server/v1');
  assert.equal(server.state, 'loopback_editor_preview');
  assert.match(server.url, /^http:\/\/\[::1\]:[1-9]\d*\/$/u);
  assert.ok(Object.isFrozen(server)); assert.ok(Object.isFrozen(server.manifest));
  assert.deepEqual(server.manifest, fixtureManifest(fixtureHtml));
  const first = await get(server.url), second = await get(server.url);
  assert.equal(first.status, 200); assert.equal(first.body, fixtureHtml);
  assert.equal(second.body, first.body);
  assert.equal(Number(first.headers['content-length']), Buffer.byteLength(fixtureHtml));
  assert.match(first.headers['content-type'], /^text\/html; charset=utf-8$/u);
  await assert.rejects(() => new Promise((resolve, reject) => {
    const req = request({hostname: '127.0.0.1', port: new URL(server.url).port, path: '/', method: 'GET'}, resolve);
    req.on('error', reject); req.end();
  }), error => error.code === 'ECONNREFUSED');
});

test('HTTP protections preserve only the exact trusted inline script and disallow external resources', async t => {
  const server = await open(t), result = await get(server.url);
  const scriptSha = createHash('sha256').update('document.documentElement.dataset.fixture="local";').digest('base64');
  assert.equal(result.headers['x-content-type-options'], 'nosniff');
  assert.equal(result.headers['referrer-policy'], 'no-referrer');
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.equal(result.headers['x-frame-options'], 'DENY');
  assert.equal(result.headers.connection, 'close');
  assert.match(result.headers['content-security-policy'], /default-src 'none'/u);
  assert.ok(result.headers['content-security-policy'].includes(`script-src 'sha256-${scriptSha}'`));
  for (const directive of ["connect-src 'none'", "img-src 'none'", "media-src 'none'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'none'"]) {
    assert.ok(result.headers['content-security-policy'].includes(directive));
  }
  assert.equal(Object.hasOwn(result.headers, 'access-control-allow-origin'), false);
});

test('only GET slash is a resource and errors never echo request paths or private filesystem paths', async t => {
  const server = await open(t);
  for (const path of ['/favicon.ico', '/?count=450', '/../../Users/private/secrets', '/%2e%2e/env', '/#solution']) {
    const response = await get(server.url, {path});
    assert.equal(response.status, 404);
    assert.equal(response.body, 'Not found.\n');
    assert.doesNotMatch(response.body, /Users|private|secrets|count|solution/u);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
  }
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']) {
    const response = await get(server.url, {method});
    assert.equal(response.status, 405); assert.equal(response.headers.allow, 'GET');
    if (method !== 'HEAD') assert.equal(response.body, 'Method not allowed.\n');
  }
});

test('request bodies, authentication, forwarding, unknown headers and foreign host or origin reject', async t => {
  const server = await open(t), parsed = new URL(server.url);
  const badRequests = [
    {headers: {'content-length': '1'}, body: 'x'}, {headers: {'transfer-encoding': 'chunked'}, body: 'x'},
    {headers: {authorization: 'Bearer synthetic-test'}}, {headers: {cookie: 'session=synthetic'}},
    {headers: {'x-forwarded-host': 'example.test'}}, {headers: {'x-extra-workflow': 'arbitrary'}},
    {headers: {host: 'localhost:' + parsed.port}}, {headers: {origin: 'https://example.test'}},
    {headers: {'sec-fetch-site': 'cross-site', 'sec-fetch-mode': 'cors'}},
  ];
  for (const options of badRequests) {
    const response = await get(server.url, options);
    assert.equal(response.status, 400);
    assert.equal(response.body, 'Invalid preview request.\n');
  }
  const browser = await get(server.url, {headers: {accept: 'text/html', 'user-agent': 'Synthetic browser', origin: parsed.origin, 'sec-fetch-site': 'none', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'sec-ch-ua': '"Chromium"', 'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': '"macOS"', priority: 'u=0, i'}});
  assert.equal(browser.status, 200);
});

test('closed renderer manifest rejects stale hashes, fabricated authority, counts and extra arguments', async () => {
  assert.equal(typeof api.createScience678PreviewServer, 'function', 'science preview server constructor is missing');
  const base = fixtureManifest(fixtureHtml);
  for (const manifest of [
    {...base, htmlSha256: 'f'.repeat(64)}, {...base, htmlBytes: base.htmlBytes + 1},
    {...base, authoredDrafts: 450}, {...base, publishedQuestions: 54}, {...base, providerCallsMade: 1},
    {...base, learnerReady: true}, {...base, publicationReady: true}, {...base, nativeBrowserVerified: true},
    {...base, mebApproved: true}, {...base, sourceApproved: true}, {...base, schemaVersion: 'other'},
  ]) await assert.rejects(() => api.createScience678PreviewServer(fixtureHtml, manifest), /invalid_science_preview_snapshot/u);
  await assert.rejects(() => api.createScience678PreviewServer(fixtureHtml, base, {port: 8080}), /invalid_science_preview_arguments/u);
  const externalScript = fixtureHtml.replace('<script>', '<script src="https://example.test/private.js">');
  await assert.rejects(() => api.createScience678PreviewServer(externalScript, fixtureManifest(externalScript)), /invalid_science_preview_snapshot/u);
});

test('hostile descriptors and proxies are inert and output limits are fixed rather than caller configurable', async () => {
  assert.equal(typeof api.createScience678PreviewServer, 'function', 'science preview server constructor is missing');
  let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'schemaVersion', {enumerable: true, get() {hooks++; return 'science-678-editor-view/v1';}});
  const proxy = new Proxy({}, {get() {hooks++;}, ownKeys() {hooks++; return [];}});
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cycle = {}; cycle.manifest = cycle;
  for (const manifest of [getter, proxy, revoked.proxy, cycle, null, [], new Date()]) {
    await assert.rejects(() => api.createScience678PreviewServer(fixtureHtml, manifest), /invalid_science_preview_snapshot/u);
  }
  const hostileHtml = {toString() {hooks++; return fixtureHtml;}};
  await assert.rejects(() => api.createScience678PreviewServer(hostileHtml, fixtureManifest(fixtureHtml)), /invalid_science_preview_snapshot/u);
  const oversized = '<!doctype html>' + 'x'.repeat(2097152);
  await assert.rejects(() => api.createScience678PreviewServer(oversized, fixtureManifest(oversized)), /invalid_science_preview_snapshot/u);
  assert.equal(hooks, 0);
});

test('close is idempotent and releases the real ephemeral listener', async t => {
  const server = await open(t);
  assert.equal((await get(server.url)).status, 200);
  await server.close(); await server.close();
  await assert.rejects(() => get(server.url), error => error.code === 'ECONNREFUSED');
});

test('duplicate and oversized raw HTTP headers fail closed without request reflection', async t => {
  const server = await open(t), port = new URL(server.url).port;
  const raw = payload => new Promise((resolve, reject) => {
    const socket = connect({host: '::1', port}, () => socket.write(payload));
    let response = '';
    socket.setEncoding('utf8'); socket.setTimeout(2000, () => {socket.destroy(); reject(new Error('raw response timed out'));});
    socket.on('data', text => {response += text;});
    socket.on('end', () => resolve(response)); socket.on('error', reject);
  });
  const duplicate = await raw(`GET / HTTP/1.1\r\nHost: [::1]:${port}\r\nAccept: text/html\r\nAccept: text/plain\r\n\r\n`);
  assert.match(duplicate, /^HTTP\/1.1 400/u); assert.match(duplicate, /Invalid preview request\.\n$/u);
  const oversized = await raw(`GET / HTTP/1.1\r\nHost: [::1]:${port}\r\nX-Private-Request: ${'private'.repeat(1500)}\r\n\r\n`);
  assert.match(oversized, /^HTTP\/1.1 400/u);
  assert.doesNotMatch(oversized, /X-Private|privateprivate/u);
  assert.match(oversized, /Content-Security-Policy:/iu);
  assert.match(oversized, /X-Frame-Options: DENY/iu);
  const tunnel = await raw(`CONNECT private.example:443 HTTP/1.1\r\nHost: [::1]:${port}\r\n\r\n`);
  assert.match(tunnel, /^HTTP\/1.1 405/u);
  assert.match(tunnel, /Allow: GET/iu);
  assert.doesNotMatch(tunnel, /private\.example/u);
  const upgrade = await raw(`GET / HTTP/1.1\r\nHost: [::1]:${port}\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n`);
  assert.match(upgrade, /^HTTP\/1.1 400/u);
  assert.match(upgrade, /Content-Security-Policy:/iu);
});

test('root renderer snapshot is served unchanged and the draft profile remains explicit', async t => {
  assert.equal(typeof api.createScience678PreviewServer, 'function', 'science preview server constructor is missing');
  const renderer = await import('../packages/content-factory/science_678_editor_view.mjs').catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
    throw error;
  });
  assert.equal(typeof renderer.renderScience678EditorView, 'function', 'root renderer/factory integration is not ready');
  const snapshot = await renderer.renderScience678EditorView();
  const server = await open(t, snapshot.html, snapshot.manifest);
  const response = await get(server.url);
  assert.equal(response.body, snapshot.html);
  assert.equal((response.body.match(/data-question-id=/gu) ?? []).length, 54);
  assert.equal(server.manifest.publishedQuestions, 0);
  assert.equal(server.manifest.learnerReady, false);
  assert.ok(response.headers['content-security-policy'].includes("script-src 'sha256-"));
});
