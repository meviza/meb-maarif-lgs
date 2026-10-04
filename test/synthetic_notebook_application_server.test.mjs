import assert from 'node:assert/strict';
import test from 'node:test';
import { request as httpRequest, Server } from 'node:http';
import { connect } from 'node:net';
import { createSyntheticNotebookFixture as fixture, createSyntheticNotebookRequest as notebookRequest,
  createSyntheticNotebookReceipt as receipt, hashSyntheticNotebook as sha } from './support/synthetic_notebook_fixture.mjs';

const api = await import('../packages/contracts/synthetic_notebook_application_server.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const SQL = { current: 'SELECT student_notebook.read_current($1::text) AS notebook_result',
  commit: 'SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result' };
const copy = value => JSON.parse(JSON.stringify(value));
function binding(s) {
  const { catalog: c, policy: p } = s, a = c.asset;
  return { sourceKind: 'synthetic_fixture', purpose: 'student_notebook', classification: p.classification,
    retentionClass: p.retentionClass, ownerId: a.ownerId, stewardId: a.stewardId, policyId: p.policyId,
    policySha256: p.policySha256, catalogId: c.catalogId, catalogRevisionId: c.revisionId,
    catalogSha256: c.catalogSha256, assetId: a.assetId, assetRevisionId: a.revisionId,
    definitionSha256: a.definitionSha256, targetCatalogSha256: sha('targets', { scopeSha256: sha('scope', s.scope), targets: s.allowedTargets }),
    catalogState: 'declared_synthetic_reference', limits: copy(p.limits) };
}
function readRow(s, request = null) {
  const r = request ? receipt(s, request) : null;
  return { rowCount: 1, rows: [{ notebook_result: { scope: copy(s.scope), scopeSha256: sha('scope', s.scope),
    revision: r?.resultingRevision ?? 0, body: request ? copy(request.body) : null, bodySha256: r?.bodySha256 ?? null,
    receipt: r, governanceBinding: binding(s), syntheticOnly: true, productionReady: false } }] };
}
function writeRow(s, request, outcome = 'accepted', head = null) {
  const r = receipt(s, request);
  return { rowCount: 1, rows: [{ notebook_result: { outcome, receipt: r,
    head: head ?? { revision: r.resultingRevision, bodySha256: r.bodySha256 }, syntheticOnly: true, productionReady: false } }] };
}
function create(options) {
  assert.equal(typeof api.createSyntheticNotebookApplicationServer, 'function', 'guarded notebook HTTP seam missing');
  return api.createSyntheticNotebookApplicationServer(options);
}
async function start(t, { sourceFixture = fixture(), execute = () => readRow(sourceFixture), address = '127.0.0.1' } = {}) {
  const server = create({ sourceFixture, execute });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, address, resolve); });
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const port = server.address().port, hostname = address === '0.0.0.0' ? '127.0.0.1' : address;
  const host = `${hostname === '::1' ? '[::1]' : hostname}:${port}`;
  return { server, hostname, port, host, origin: `http://${host}` };
}
function request(context, { method = 'GET', path = '/api/notebook/current', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: context.hostname, port: context.port, method, path, headers }, res => {
      const chunks = []; let bytes = 0;
      res.on('data', chunk => { bytes += chunk.length; if (bytes > 524288) req.destroy(new Error('test_response_budget')); else chunks.push(chunk); });
      res.on('end', () => { const text = Buffer.concat(chunks).toString('utf8'); resolve({ status: res.statusCode, headers: res.headers, text,
        json: text && res.headers['content-type']?.startsWith('application/json') ? JSON.parse(text) : null }); });
    });
    req.setTimeout(4000, () => req.destroy(new Error('test_request_deadline'))); req.on('error', reject); req.end(body);
  });
}
const current = async c => (await request(c)).json;
const post = (c, path, body = '{}', headers = {}) => request(c, { method: 'POST', path,
  headers: { Origin: c.origin, 'Content-Type': 'application/json', ...headers },
  body: typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body) });
const read = c => post(c, '/api/notebook/read');
const save = (c, body, headers) => post(c, '/api/notebook/save', body, headers);
function raw(c, message) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: c.hostname, port: c.port }, () => socket.write(message));
    let output = ''; socket.setTimeout(4000, () => socket.destroy(new Error('test_raw_deadline')));
    socket.on('data', chunk => { output += chunk.toString('utf8'); if (output.length > 524288) socket.destroy(new Error('test_raw_budget')); });
    socket.on('error', reject); socket.on('end', () => resolve(output));
  });
}
function flags(v) {
  assert.equal(v.authentication, 'not_implemented'); assert.equal(v.syntheticOnly, true);
  assert.equal(v.automaticRead, false); assert.equal(v.automaticRetry, false); assert.equal(v.productionReady, false);
}
function next(n) { const r = notebookRequest(); r.expectedRevision = n - 1; r.mutationId = `mutation-http-${n}`;
  r.idempotencyKey = `idem-http-${n}`; r.body.text = `Only request ${n}; not yet read`; return r; }
function pending() { let resolve; return { promise: new Promise(done => { resolve = done; }), resolve: value => resolve(value) }; }

// A constructor that executes a hook, accepts caller configuration or leaks
// source receipts/body as a current projection breaks this contract.
test('constructor is an unbound native server and current exposes only unread application state without SQL', async t => {
  let calls = 0; const s = fixture(), server = create({ sourceFixture: s, execute() { calls++; } });
  assert.ok(server instanceof Server); assert.equal(server.listening, false); assert.equal(calls, 0);
  const c = await start(t, { sourceFixture: s, execute() { calls++; } }), out = await request(c);
  assert.equal(out.status, 200); assert.equal(out.json.state, 'not_read'); assert.equal(out.json.readProjection, null);
  assert.equal(out.json.usageCounts, null); assert.equal(out.json.realDatabaseVerified, false); assert.equal(out.json.currentHeadVerified, false);
  assert.equal(out.json.completeHistory, false); assert.equal(out.json.learningAnalyticsMapped, false); flags(out.json); assert.equal(calls, 0);
  assert.equal(out.headers['cache-control'], 'no-store'); assert.equal(out.headers['x-content-type-options'], 'nosniff');
  assert.equal(out.headers['cross-origin-resource-policy'], 'same-origin'); assert.equal(Object.hasOwn(out.headers, 'access-control-allow-origin'), false);
  assert.match(out.headers['content-security-policy'], /default-src 'none'/u); assert.equal(JSON.stringify(out.json).includes(s.scope.schoolId), false);
});

test('unsafe factory options getters proxies role and approval cannot become server composition', () => {
  assert.equal(typeof api.createSyntheticNotebookApplicationServer, 'function'); let hooks = 0;
  const good = { sourceFixture: fixture(), execute() { hooks++; } }, getter = { sourceFixture: fixture() };
  Object.defineProperty(getter, 'execute', { enumerable: true, get() { hooks++; return good.execute; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const options of [null, {}, getter, revoked.proxy, new Proxy(good, { ownKeys() { hooks++; return []; } }),
    { ...good, role: 'postgres' }, { ...good, origin: 'http://evil.invalid' }, { ...good, realDatabaseVerified: true },
    { ...good, execute: new Proxy(() => {}, { apply() { hooks++; } }) }])
    assert.throws(() => api.createSyntheticNotebookApplicationServer(options), /invalid_synthetic_notebook_application_server_options/u);
  assert.throws(() => api.createSyntheticNotebookApplicationServer(good, true), /invalid_synthetic_notebook_application_server_options/u);
  assert.equal(hooks, 0);
});

test('explicit read runs the real application and validates scoped readback while subsequent GET is SQL free', async t => {
  const s = fixture(), req = notebookRequest(), calls = [], c = await start(t, { sourceFixture: s,
    execute(q) { calls.push(q); assert.deepEqual(q, { text: SQL.current, values: [sha('scope', s.scope)] }); return readRow(s, req); } });
  const out = await read(c); assert.equal(out.status, 200); assert.equal(out.json.decision, 'current_read_confirmed');
  assert.equal(out.json.readState, 'confirmed'); assert.equal(out.json.view.readProjection.revision, 1);
  assert.deepEqual(out.json.view.readProjection.body, req.body); assert.equal(out.json.view.usageCounts.strokeCount, 1);
  assert.equal(out.json.view.purpose, 'student_notebook'); assert.equal(out.json.view.realDatabaseVerified, false); flags(out.json);
  assert.deepEqual(await current(c), out.json.view); assert.deepEqual(await current(c), out.json.view); assert.equal(calls.length, 1);
});

test('save receipt is separate from current projection and explicit read is required after confirmed write', async t => {
  const s = fixture(), first = notebookRequest(), second = next(2), calls = []; let head = first;
  const c = await start(t, { sourceFixture: s, execute(q) { calls.push(q); if (q.text === SQL.current) return readRow(s, head);
    assert.equal(q.text, SQL.commit); const intent = JSON.parse(q.values[0]); assert.deepEqual(intent.scope, s.scope);
    assert.deepEqual(intent.body, second.body); head = second; return writeRow(s, second); } });
  const before = (await read(c)).json.view.readProjection, out = await save(c, second);
  assert.equal(out.status, 200); assert.equal(out.json.decision, 'save_confirmed'); assert.equal(out.json.persisted, true);
  assert.equal(out.json.persistenceConfirmed, true); assert.equal(out.json.receipt.resultingRevision, 2);
  assert.deepEqual(out.json.view.readProjection, before); assert.equal(out.json.view.projectionFreshness, 'stale_after_write');
  assert.equal(out.json.view.currentHeadVerified, false); assert.deepEqual(calls.map(q => q.text), [SQL.current, SQL.commit]);
  assert.deepEqual((await current(c)).readProjection, before); assert.equal(calls.length, 2);
  const blocked = await save(c, next(3)); assert.equal(blocked.status, 409); assert.equal(blocked.json.persisted, false); assert.equal(calls.length, 2);
  const explicit = await read(c); assert.equal(explicit.json.view.readProjection.revision, 2); assert.equal(calls.length, 3);
  assert.equal(explicit.json.view.readProjection.body.text, second.body.text);
});

test('unknown post-commit hook error stays persisted null with no retry no auto-read and no secret echo', async t => {
  const s = fixture(), first = notebookRequest(), second = next(2); let head = first; const calls = [];
  const c = await start(t, { sourceFixture: s, execute(q) { calls.push(q.text); if (q.text === SQL.current) return readRow(s, head);
    head = second; throw new Error('private-token private-request-body'); } });
  const before = (await read(c)).json.view.readProjection, out = await save(c, second);
  assert.equal(out.status, 503); assert.equal(out.json.decision, 'save_unknown'); assert.equal(out.json.commitState, 'unknown');
  assert.equal(out.json.persisted, null); assert.equal(out.json.persistenceConfirmed, false); assert.equal(out.json.receipt, null);
  assert.deepEqual(out.json.view.readProjection, before); assert.equal(out.json.view.projectionFreshness, 'stale_after_write');
  assert.doesNotMatch(out.text, /private-token|private-request-body|Only request 2/u); flags(out.json);
  assert.deepEqual(calls, [SQL.current, SQL.commit]); assert.equal(Object.hasOwn(out.json, 'rolledBack'), false);
  const recovered = await read(c); assert.equal(recovered.status, 200); assert.equal(recovered.json.view.readProjection.revision, 2);
  assert.deepEqual(calls, [SQL.current, SQL.commit, SQL.current]);
});

test('malformed and other-school read responses cannot project notebook body and database denial is sanitized unknown', async t => {
  const a = fixture(), b = fixture('b'); let reply = readRow(b, notebookRequest('b')), calls = 0;
  const c = await start(t, { sourceFixture: a, execute() { calls++; if (reply instanceof Error) throw reply; return reply; } });
  let out = await read(c); assert.equal(out.status, 503); assert.equal(out.json.readState, 'unknown'); assert.equal(out.json.persisted, null);
  assert.equal(out.json.view.readProjection, null); assert.doesNotMatch(out.text, /demo-school-b|question-b-001/u);
  reply = { rowCount: 1, rows: [{ notebook_result: { rawSecret: 'never leak' } }] }; out = await read(c);
  assert.equal(out.status, 503); assert.equal(out.json.view.readProjection, null); assert.doesNotMatch(out.text, /never leak/u);
  reply = Object.assign(new Error('private-school-denial'), { code: '42501' }); out = await read(c);
  assert.equal(out.status, 503); assert.equal(out.json.error.code, 'notebook_scope_denied'); assert.doesNotMatch(out.text, /private-school-denial/u);
  assert.equal(calls, 3); assert.equal((await current(c)).projectionFreshness, 'unknown_after_read_failure');
});

test('caller grade tenant role source or serialized view is rejected before any SQL while read requires exactly empty object', async t => {
  let calls = 0; const c = await start(t, { execute() { calls++; } });
  for (const field of ['schoolId', 'learnerId', 'grade', 'role', 'sourceFixture', 'execute', 'query', 'approved']) {
    const req = notebookRequest(); req[field] = 'caller-controlled'; const out = await save(c, req);
    assert.equal(out.status, 400); assert.equal(out.json.valid, false); assert.equal(out.json.persisted, false);
  }
  assert.equal((await save(c, await current(c))).status, 400);
  for (const body of ['null', '[]', '{"role":"postgres"}', '{"scope":{}}']) assert.equal((await post(c, '/api/notebook/read', body)).status, 400);
  assert.equal(calls, 0); assert.equal((await current(c)).readProjection, null);
});

test('Host exact bound Origin and fetch metadata are loopback transport guards not requester authentication', async t => {
  let calls = 0; const c = await start(t, { execute() { calls++; return readRow(fixture()); } }); const before = await current(c);
  for (const host of ['evil.invalid', `localhost:${c.port}`, `127.0.0.1:${c.port + 1}`]) assert.equal((await request(c, { headers: { Host: host } })).status, 403);
  for (const origin of [undefined, 'null', 'http://evil.invalid', c.origin + '/', 'https://' + c.host]) {
    const headers = { 'Content-Type': 'application/json' }; if (origin !== undefined) headers.Origin = origin;
    assert.equal((await request(c, { method: 'POST', path: '/api/notebook/read', headers, body: '{}' })).status, 403);
  }
  for (const [header, value] of [['Sec-Fetch-Site', 'cross-site'], ['Sec-Fetch-Site', 'same-site'], ['Sec-Fetch-Mode', 'no-cors'], ['Sec-Fetch-Dest', 'document']])
    assert.equal((await post(c, '/api/notebook/read', '{}', { [header]: value })).status, 403);
  assert.equal(calls, 0); assert.deepEqual(await current(c), before);
  assert.equal((await post(c, '/api/notebook/read', '{}', { 'Sec-Fetch-Site': 'same-origin', 'Sec-Fetch-Mode': 'cors', 'Sec-Fetch-Dest': 'empty' })).status, 200);
});

test('closed headers query routes methods and GET bodies cannot supply a scope or trigger database calls', async t => {
  let calls = 0; const c = await start(t, { execute() { calls++; } }), before = await current(c);
  for (const path of ['/api/notebook/current?grade=8', '/api/notebook/read?role=postgres', '/api/notebook/save?school=a'])
    assert.equal((await request(c, { path })).status, 400);
  for (const path of ['/api/current', '/', '/api/notebook/current/', '//api/notebook/current', '/%61pi/notebook/current', 'http://evil.invalid/api/notebook/current'])
    assert.equal((await request(c, { path })).status, 404);
  for (const [method, path] of [['HEAD', '/api/notebook/current'], ['POST', '/api/notebook/current'], ['GET', '/api/notebook/read'], ['OPTIONS', '/api/notebook/save'], ['PUT', '/api/notebook/save']])
    assert.equal((await request(c, { method, path, headers: method === 'POST' ? { Origin: c.origin } : {} })).status, 405);
  for (const name of ['X-Tenant-Id', 'School', 'Grade', 'Role', 'Scope', 'Authorization', 'Cookie', 'Forwarded', 'X-Forwarded-Host', 'Arbitrary'])
    assert.equal((await post(c, '/api/notebook/read', '{}', { [name]: 'caller-controlled' })).status, 400);
  assert.equal((await request(c, { headers: { 'Content-Length': '2' }, body: '{}' })).status, 400);
  assert.equal(calls, 0); assert.deepEqual(await current(c), before);
});

test('duplicate raw headers oversized headers expect connect and upgrade are closed before application', async t => {
  let calls = 0; const c = await start(t, { execute() { calls++; } }), before = await current(c);
  const prefix = `POST /api/notebook/read HTTP/1.1\r\nHost: ${c.host}\r\nOrigin: ${c.origin}\r\nContent-Type: application/json\r\nContent-Length: 2\r\n`;
  for (const [message, status] of [
    [`GET /api/notebook/current HTTP/1.1\r\nHost: ${c.host}\r\nHost: evil.invalid\r\nConnection: close\r\n\r\n`, 400],
    [prefix + `Origin: ${c.origin}\r\nConnection: close\r\n\r\n{}`, 400],
    [`GET /api/notebook/current HTTP/1.1\r\nHost: ${c.host}\r\nHuge: ${'x'.repeat(9000)}\r\nConnection: close\r\n\r\n`, 431],
    [prefix + 'Expect: 100-continue\r\nConnection: close\r\n\r\n{}', 417],
    [`CONNECT /api/notebook/read HTTP/1.1\r\nHost: ${c.host}\r\nConnection: close\r\n\r\n`, 400],
    [`GET /api/notebook/current HTTP/1.1\r\nHost: ${c.host}\r\nConnection: upgrade\r\nUpgrade: websocket\r\n\r\n`, 400],
  ]) assert.match(await raw(c, message), new RegExp(`^HTTP/1\\.1 ${status} `, 'u'));
  assert.equal(calls, 0); assert.deepEqual(await current(c), before);
});

test('duplicate nested or escaped and canonically equivalent member names trailing JSON depth and invalid UTF8 fail before application', async t => {
  let calls = 0; const c = await start(t, { execute() { calls++; } }), before = await current(c);
  const req = JSON.stringify(notebookRequest()), bad = [
    req.replace('"expectedRevision":0', '"expectedRevision":0,"expectedRevision":0'),
    req.replace('"expectedRevision":0', '"expectedRevision":0,"expected\\u0052evision":0'),
    req.replace('"x":0.125', '"x":0.125,"x":0.125'),
    req.replace('"x":0.125', '"x":0.125,"\\u0078":0.125'),
    '{"\u00e9":1,"e\u0301":2}', req + '{}', req + ' false', '{"body":' + '['.repeat(15) + '0' + ']'.repeat(15) + '}',
    '[' + '0,'.repeat(100000) + '0]', Buffer.from([0xc0, 0xaf]), Buffer.from([0xef, 0xbb, 0xbf, 0x7b, 0x7d]),
  ];
  for (const body of bad) { const out = await save(c, body); assert.equal(out.status, 400);
    assert.equal(out.json.error.code, 'closed_notebook_json_required'); assert.deepEqual(await current(c), before); }
  assert.equal(calls, 0);
});

test('JSON content type compression declared and streamed byte caps reject before executor and exact256KiB wire payload is supported', async t => {
  const s = fixture(); let calls = 0;
  const c = await start(t, { sourceFixture: s, execute(q) { calls++; assert.equal(q.text, SQL.commit); return writeRow(s, notebookRequest()); } });
  for (const type of [undefined, 'text/plain', 'application/json; charset=latin1', 'application/json, text/plain']) {
    const headers = { Origin: c.origin }; if (type !== undefined) headers['Content-Type'] = type;
    assert.equal((await request(c, { method: 'POST', path: '/api/notebook/save', headers, body: '{}' })).status, 415);
  }
  assert.equal((await save(c, notebookRequest(), { 'Content-Encoding': 'gzip' })).status, 415);
  assert.equal((await save(c, '{}', { 'Content-Length': '262145' })).status, 413);
  const req = JSON.stringify(notebookRequest()), over = req + ' '.repeat(262145 - Buffer.byteLength(req));
  assert.equal((await save(c, over, { 'Transfer-Encoding': 'chunked' })).status, 413); assert.equal(calls, 0);
  const exact = req + ' '.repeat(262144 - Buffer.byteLength(req));
  const out = await save(c, exact, { 'Content-Type': 'application/json; charset=utf-8' }); assert.equal(out.status, 200);
  assert.equal(out.json.receipt.resultingRevision, 1); assert.equal(out.json.view.readProjection, null); assert.equal(calls, 1);
});

test('sparse incomplete body reaches one-second deadline without application mutation then a valid explicit read succeeds', async t => {
  let calls = 0; const s = fixture(), c = await start(t, { sourceFixture: s, execute() { calls++; return readRow(s); } }), before = await current(c);
  const output = await raw(c, `POST /api/notebook/save HTTP/1.1\r\nHost: ${c.host}\r\nOrigin: ${c.origin}\r\nContent-Type: application/json\r\nContent-Length: 64\r\nConnection: close\r\n\r\n{"body":`);
  assert.match(output, /^HTTP\/1\.1 408 /u); assert.equal(calls, 0); assert.deepEqual(await current(c), before);
  assert.equal((await read(c)).status, 200); assert.equal(calls, 1);
});

test('overlapping HTTP save and explicit read reject busy before second executor and do not queue', async t => {
  const s = fixture(), req = notebookRequest(), hold = pending(), entered = pending(); let calls = 0;
  const c = await start(t, { sourceFixture: s, execute(q) { calls++; assert.equal(q.text, SQL.commit); entered.resolve(); return hold.promise; } });
  const saving = save(c, req); await entered.promise;
  const snapshot = await current(c); assert.equal(snapshot.busy, true); assert.equal(snapshot.readProjection, null);
  for (const out of [await read(c), await save(c, req)]) { assert.equal(out.status, 409); assert.equal(out.json.decision, 'application_busy'); assert.equal(out.json.persisted, false); }
  assert.equal(calls, 1); hold.resolve(writeRow(s, req)); const out = await saving;
  assert.equal(out.status, 200); assert.equal(out.json.view.busy, false); assert.equal(out.json.view.readProjection, null); assert.equal(calls, 1);
});

test('one instance is deliberately shared synthetic memory but different fixed school instances cannot accept foreign requests', async t => {
  const a = fixture(), b = fixture('b'); let acalls = 0, bcalls = 0;
  const ac = await start(t, { sourceFixture: a, execute() { acalls++; return readRow(a, notebookRequest()); } });
  const bc = await start(t, { sourceFixture: b, execute() { bcalls++; return readRow(b, notebookRequest('b')); } });
  assert.equal((await read(ac)).status, 200); assert.equal((await current(ac)).readProjection.scope.schoolId, 'demo-school-a');
  assert.equal((await current(bc)).readProjection, null); assert.equal((await save(bc, notebookRequest())).status, 400); assert.equal(bcalls, 0);
  assert.equal((await read(bc)).status, 200); assert.equal((await current(bc)).readProjection.scope.schoolId, 'demo-school-b'); assert.equal(acalls, 1);
});

test('IPv6 exact origin works but wildcard binding does not authorize loopback clients', async t => {
  let calls = 0; const s = fixture(), c = await start(t, { address: '::1', execute() { calls++; return readRow(s); } });
  assert.equal((await request(c)).status, 200); assert.equal((await read(c)).status, 200);
  assert.equal((await request(c, { headers: { Host: `localhost:${c.port}` } })).status, 403);
  assert.equal((await post(c, '/api/notebook/read', '{}', { Origin: `http://127.0.0.1:${c.port}` })).status, 403); assert.equal(calls, 1);
  const wildcard = await start(t, { address: '0.0.0.0', execute() { calls++; } }); assert.equal((await request(wildcard)).status, 403); assert.equal(calls, 1);
});

test('literal plain text and canonically equivalent Unicode values are not normalized by the HTTP seam', async t => {
  const s = fixture(), req = notebookRequest(); req.body.text = 'e\u0301 \u00e9 <script>literal</script> 📝';
  const calls = []; const c = await start(t, { sourceFixture: s, execute(q) { calls.push(q); return writeRow(s, req); } });
  const out = await save(c, req); assert.equal(out.status, 200); assert.equal(out.json.receipt.bodySha256, sha('body', req.body));
  assert.equal(JSON.parse(calls[0].values[0]).body.text, req.body.text); assert.equal(out.json.view.readProjection, null);
  assert.equal(out.headers['content-type'], 'application/json; charset=utf-8');
});

// Additional characterizations exercise the already implemented application
// through actual HTTP; these are not a claim of a new RED cycle or real SQL.
test('a source fixture containing prior revision receipts is not a verified current HTTP projection', async t => {
  const s = fixture(), req = notebookRequest(), r = receipt(s, req);
  s.currentRevision = { revision: 1, bodySha256: r.bodySha256 }; s.receipts = [r]; let calls = 0;
  const c = await start(t, { sourceFixture: s, execute() { calls++; return readRow(s, req); } });
  const first = await current(c); assert.equal(first.state, 'not_read'); assert.equal(first.readProjection, null);
  assert.equal(first.usageCounts, null); assert.equal(JSON.stringify(first).includes(r.receiptId), false); assert.equal(calls, 0);
  assert.equal((await read(c)).json.view.readProjection.revision, 1); assert.equal(calls, 1);
});

test('HTTP exact replay validates the same receipt but never creates a verified read projection or retries', async t => {
  const s = fixture(), req = notebookRequest(); let calls = 0;
  const c = await start(t, { sourceFixture: s, execute(q) { calls++; assert.equal(q.text, SQL.commit);
    return writeRow(s, req, calls === 1 ? 'accepted' : 'idempotent_replay'); } });
  const first = await save(c, req), replay = await save(c, req);
  assert.equal(first.status, 200); assert.equal(replay.status, 200); assert.equal(replay.json.outcome, 'idempotent_replay');
  assert.deepEqual(first.json.receipt, replay.json.receipt); assert.equal(replay.json.view.readProjection, null); assert.equal(calls, 2);
  const conflict = copy(req); conflict.body.text += 'conflicting content';
  assert.equal((await save(c, conflict)).status, 409); assert.equal(calls, 2); assert.equal((await current(c)).readProjection, null);
});

test('client disconnect after an executor starts does not fabricate rollback retry or a read projection', async t => {
  const s = fixture(), req = notebookRequest(), hold = pending(), entered = pending(); let calls = 0;
  const c = await start(t, { sourceFixture: s, execute(q) { calls++; assert.equal(q.text, SQL.commit); entered.resolve(); return hold.promise; } });
  const client = httpRequest({ hostname: c.hostname, port: c.port, method: 'POST', path: '/api/notebook/save',
    headers: { Origin: c.origin, 'Content-Type': 'application/json' } });
  client.on('error', () => {}); client.end(JSON.stringify(req)); await entered.promise;
  const closed = new Promise(resolve => client.once('close', resolve)); client.destroy(); await closed;
  assert.equal((await current(c)).busy, true); hold.resolve(writeRow(s, req));
  let view;
  for (let attempt = 0; attempt < 20; attempt++) { view = await current(c); if (!view.busy) break; }
  assert.equal(view.busy, false); assert.equal(view.lastOperation.decision, 'save_confirmed'); assert.equal(view.lastOperation.persisted, true);
  assert.equal(view.readProjection, null); assert.equal(view.usageCounts, null); assert.equal(calls, 1);
});

test('a disconnected incomplete upload cannot reach prepare or executor and does not poison the next connection', async t => {
  let calls = 0; const c = await start(t, { execute() { calls++; return readRow(fixture()); } }), before = await current(c);
  const socket = connect({ host: c.hostname, port: c.port }); socket.on('error', () => {});
  await new Promise(resolve => socket.once('connect', resolve));
  socket.write(`POST /api/notebook/save HTTP/1.1\r\nHost: ${c.host}\r\nOrigin: ${c.origin}\r\nContent-Type: application/json\r\nContent-Length: 100\r\nConnection: close\r\n\r\n{"body":`);
  const closed = new Promise(resolve => socket.once('close', resolve)); socket.destroy(); await closed;
  assert.deepEqual(await current(c), before); assert.equal(calls, 0); assert.equal((await read(c)).status, 200); assert.equal(calls, 1);
});
