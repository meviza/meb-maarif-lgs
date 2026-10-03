import test from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest, Server } from 'node:http';
import { connect } from 'node:net';
import { Script, createContext } from 'node:vm';

const api = await import('../packages/media/reasoned_caption_review_server.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function create() {
  assert.equal(typeof api.createReasonedCaptionReviewServer, 'function', 'loopback caption review HTTP API missing');
  return api.createReasonedCaptionReviewServer();
}
async function start(t, hostname = '127.0.0.1') {
  const server = create();
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, hostname, done); });
  const port = server.address().port;
  t.after(async () => { server.closeAllConnections(); await new Promise(done => server.close(done)); });
  const host = `${hostname === '::1' ? '[::1]' : hostname}:${port}`;
  return { server, port, hostname, origin: `http://${host}`, host };
}
function request(context, { method = 'GET', path = '/api/current', headers = {}, body } = {}) {
  return new Promise((done, reject) => {
    const req = httpRequest({ hostname: context.hostname, port: context.port, method, path, headers }, res => {
      const chunks = []; let bytes = 0;
      res.on('data', chunk => { bytes += chunk.length; if (bytes > 262144) req.destroy(new Error('response_budget')); else chunks.push(chunk); });
      res.on('end', () => { const text = Buffer.concat(chunks).toString('utf8'); done({ status: res.statusCode, headers: res.headers, text,
        json: res.headers['content-type']?.startsWith('application/json') && text ? JSON.parse(text) : null }); });
    });
    req.setTimeout(4000, () => req.destroy(new Error('test_http_deadline'))); req.on('error', reject);
    req.end(body);
  });
}
const current = async context => (await request(context)).json;
const post = (context, body, headers = {}) => request(context, { method: 'POST', path: '/api/action',
  headers: { Origin: context.origin, 'Content-Type': 'application/json', ...headers },
  body: typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body) });
const action = (context, type) => post(context, { type });
async function finishPages(context) {
  for (let bound = 0; bound < 32 && (await current(context)).navigation.canNextPage; bound++) assert.equal((await action(context, 'next_page')).status, 200);
}
async function toCue(context, cueIndex) {
  for (let bound = 0; bound < 40 && (await current(context)).cursor.cueIndex < cueIndex; bound++) {
    if ((await current(context)).navigation.canRevealCurrent) assert.equal((await action(context, 'reveal_current')).status, 200);
    await finishPages(context); assert.equal((await action(context, 'next_cue')).status, 200);
  }
  assert.equal((await current(context)).cursor.cueIndex, cueIndex);
  return current(context);
}
async function rejectedWithoutAdvance(context, options, wanted) {
  const before = await current(context), outcome = await request(context, options);
  assert.equal(outcome.status, wanted); assert.deepEqual(await current(context), before);
  return outcome;
}
function raw(context, text) {
  return new Promise((done, reject) => {
    const socket = connect({ host: context.hostname, port: context.port }, () => socket.write(text));
    let output = ''; socket.setTimeout(4000, () => socket.destroy(new Error('test_raw_deadline')));
    socket.on('data', chunk => { output += chunk.toString('utf8'); if (output.length > 32768) socket.destroy(new Error('raw_budget')); });
    socket.on('error', reject); socket.on('end', () => done(output));
  });
}

test('construction returns an unbound real Node server with one fixed trusted garden and no caller plan', async t => {
  const server = create(); assert.ok(server instanceof Server); assert.equal(server.listening, false);
  assert.throws(() => api.createReasonedCaptionReviewServer({ trusted: true }), /invalid_reasoned_caption_review_server_arguments/u);
  const context = await start(t), outcome = await request(context), record = outcome.json;
  assert.equal(outcome.status, 200); assert.equal(record.cursor.cueIndex, 0); assert.equal(record.cursor.pageCount, 2);
  assert.equal(record.cursor.kind, 'goal'); assert.equal(record.cursor.revealRequested, false);
  assert.equal(record.source.id, 'caption-review-loopback-garden');
  assert.deepEqual(record.caption.lines, ['Kapı her sırada açık kalacak biçimde iki tel sırası için',
    'gereken toplam tel uzunluğu isteniyor; alan ya da tek tur']);
  assert.doesNotMatch(outcome.text, /18 bölü 2 eşittir 9 metre|86 çarpı 2 eşittir 172 metre/u);
  assert.equal(record.publicationReady, false); assert.equal(record.audioGenerated, false);
  assert.equal(Object.hasOwn(record, 'cues'), false); assert.equal(Object.hasOwn(record, 'assets'), false);
});

test('real HTTP actions retain garden five-page gating and explicit protected reveal without skip fields', async t => {
  const context = await start(t);
  assert.equal((await action(context, 'next_cue')).status, 409);
  assert.equal((await current(context)).cursor.cueIndex, 0);
  assert.equal((await action(context, 'next_page')).status, 200);
  const evidence = (await action(context, 'next_cue')).json;
  assert.equal(evidence.cursor.cueIndex, 1); assert.equal(evidence.cursor.pageCount, 5);
  for (let page = 0; page < 4; page++) {
    assert.equal((await action(context, 'next_cue')).status, 409);
    assert.equal((await action(context, 'next_page')).json.cursor.pageIndex, page + 1);
  }
  assert.equal((await action(context, 'next_cue')).json.cursor.cueIndex, 2);
  const locked = await toCue(context, 4);
  assert.equal(locked.cursor.kind, 'result'); assert.equal(locked.narrationPacket.fullTranscript, null);
  assert.equal((await action(context, 'next_cue')).status, 409);
  const revealed = (await action(context, 'reveal_current')).json;
  assert.equal(revealed.cursor.resultVisible, true); assert.equal(revealed.cursor.progress, 1);
  assert.match(revealed.narrationPacket.fullTranscript, /^18 bölü 2 eşittir 9 metre/u);
  assert.equal((await action(context, 'next_cue')).json.cursor.revealRequested, false);
  const back = (await action(context, 'previous_cue')).json;
  assert.equal(back.cursor.cueIndex, 4); assert.equal(back.cursor.resultVisible, false);
  assert.equal(back.narrationPacket.fullTranscript, null);
});

test('different server instances do not share a cursor but clients of one local editor do', async t => {
  const a = await start(t), b = await start(t);
  assert.equal((await action(a, 'next_page')).json.cursor.pageIndex, 1);
  assert.equal((await current(a)).cursor.pageIndex, 1); assert.equal((await current(b)).cursor.pageIndex, 0);
});

test('exact actual bound Host and explicit same-origin mutation are required rather than caller authority', async t => {
  const context = await start(t), payload = JSON.stringify({ type: 'next_page' });
  for (const host of ['evil.invalid', 'localhost:' + context.port, '127.0.0.1:' + (context.port + 1)])
    await rejectedWithoutAdvance(context, { headers: { Host: host } }, 403);
  for (const origin of [undefined, 'null', 'http://evil.invalid', context.origin + '/', 'https://' + context.host]) {
    const headers = { 'Content-Type': 'application/json' }; if (origin !== undefined) headers.Origin = origin;
    await rejectedWithoutAdvance(context, { method: 'POST', path: '/api/action', headers, body: payload }, 403);
  }
  for (const site of ['cross-site', 'same-site', 'unknown']) await rejectedWithoutAdvance(context,
    { method: 'POST', path: '/api/action', headers: { Origin: context.origin, 'Content-Type': 'application/json', 'Sec-Fetch-Site': site }, body: payload }, 403);
  for (const mode of ['no-cors', 'navigate']) await rejectedWithoutAdvance(context,
    { method: 'POST', path: '/api/action', headers: { Origin: context.origin, 'Content-Type': 'application/json', 'Sec-Fetch-Mode': mode }, body: payload }, 403);
  await rejectedWithoutAdvance(context, { headers: { 'Sec-Fetch-Site': 'cross-site' } }, 403);
  assert.equal((await post(context, payload, { 'Sec-Fetch-Site': 'same-origin', 'Sec-Fetch-Mode': 'cors', 'Sec-Fetch-Dest': 'empty' })).status, 200);
});

test('duplicate Host or Origin and oversized HTTP headers are rejected with no cursor advance', async t => {
  const context = await start(t), before = await current(context);
  for (const text of [
    `GET /api/current HTTP/1.1\r\nHost: ${context.host}\r\nHost: evil.invalid\r\nConnection: close\r\n\r\n`,
    `POST /api/action HTTP/1.1\r\nHost: ${context.host}\r\nOrigin: ${context.origin}\r\nOrigin: ${context.origin}\r\nContent-Type: application/json\r\nContent-Length: 20\r\nConnection: close\r\n\r\n{"type":"next_page"}`,
    `GET /api/current HTTP/1.1\r\nHost: ${context.host}\r\nLong: ${'a'.repeat(9000)}\r\nConnection: close\r\n\r\n`,
  ]) {
    const output = await raw(context, text); assert.match(output, /^HTTP\/1\.1 (?:400|431) /u);
    assert.deepEqual(await current(context), before);
  }
});

test('query path method client scope auth and forwarding fields cannot route or mutate review state', async t => {
  const context = await start(t), payload = JSON.stringify({ type: 'next_page' });
  for (const path of ['/api/current?cueIndex=27', '/api/action?type=reveal_current', '/?grade=8'])
    await rejectedWithoutAdvance(context, { path }, 400);
  for (const path of ['/missing', '/%2e%2e/review.mjs', '/api/current/', '//api/current', 'http://evil.invalid/api/current'])
    await rejectedWithoutAdvance(context, { path }, 404);
  for (const [method, path] of [['HEAD', '/api/current'], ['POST', '/api/current'], ['GET', '/api/action'], ['OPTIONS', '/api/action'], ['PUT', '/api/action']])
    await rejectedWithoutAdvance(context, { method, path, headers: method === 'POST' ? { Origin: context.origin } : {} }, 405);
  for (const name of ['X-Tenant-Id', 'X-School-Id', 'X-Grade', 'X-Role', 'Grade', 'Scope', 'Authorization', 'Cookie', 'Forwarded', 'X-Forwarded-Host'])
    await rejectedWithoutAdvance(context, { method: 'POST', path: '/api/action', headers: { Origin: context.origin,
      'Content-Type': 'application/json', [name]: 'caller-owned' }, body: payload }, 400);
});

test('content type byte bound UTF-8 syntax and duplicate JSON members fail closed before dispatch', async t => {
  const context = await start(t), before = await current(context);
  for (const type of [undefined, 'text/plain', 'application/json; charset=latin1', 'application/json, text/plain']) {
    const headers = { Origin: context.origin }; if (type) headers['Content-Type'] = type;
    await rejectedWithoutAdvance(context, { method: 'POST', path: '/api/action', headers, body: '{"type":"next_page"}' }, 415);
  }
  assert.equal((await post(context, '{"type":"next_page"}', { 'Content-Encoding': 'gzip' })).status, 415);
  for (const body of ['', '{', 'null', '[]', '{"type":"go"}', '{"type":"next_page","cueIndex":27}',
    '{"type":"reveal_current","reveal":true}', '{"type":"next_page","type":"next_cue"}',
    '{"type":"next_page","html":"<script>never</script>"}', Buffer.from([0xc0, 0xaf])]) {
    assert.equal((await post(context, body)).status, 400); assert.deepEqual(await current(context), before);
  }
  const over = '{"type":"next_page"}' + ' '.repeat(238);
  assert.equal(Buffer.byteLength(over), 258);
  assert.equal((await post(context, over)).status, 413);
  assert.equal((await post(context, over, { 'Transfer-Encoding': 'chunked' })).status, 413);
  assert.deepEqual(await current(context), before);
  const edge = '{"type":"next_page"}' + ' '.repeat(236);
  assert.equal(Buffer.byteLength(edge), 256);
  assert.equal((await post(context, edge, { 'Content-Type': 'application/json; charset=utf-8' })).status, 200);
});

test('incomplete request body times out honestly without advancing then a valid follow-on works', async t => {
  const context = await start(t), before = await current(context);
  const outcome = await raw(context, `POST /api/action HTTP/1.1\r\nHost: ${context.host}\r\nOrigin: ${context.origin}\r\nContent-Type: application/json\r\nContent-Length: 64\r\nConnection: close\r\n\r\n{"type":`);
  assert.match(outcome, /^HTTP\/1\.1 408 /u);
  assert.deepEqual(await current(context), before);
  assert.equal((await action(context, 'next_page')).status, 200);
});

test('GET carries no mutation body and HEAD is available only for fixed self assets', async t => {
  const context = await start(t);
  await rejectedWithoutAdvance(context, { headers: { 'Content-Length': '2' }, body: '{}' }, 400);
  for (const [path, type] of [['/', 'text/html'], ['/index.html', 'text/html'], ['/review.mjs', 'text/javascript'], ['/review.css', 'text/css']]) {
    const get = await request(context, { path }), head = await request(context, { method: 'HEAD', path });
    assert.equal(get.status, 200); assert.ok(get.headers['content-type'].startsWith(type));
    assert.equal(head.status, 200); assert.equal(head.text, '');
    assert.equal(head.headers['content-length'], String(Buffer.byteLength(get.text)));
    assert.equal(get.headers['cache-control'], 'no-store'); assert.equal(get.headers['x-content-type-options'], 'nosniff');
    assert.equal(Object.hasOwn(get.headers, 'access-control-allow-origin'), false);
  }
  const html = await request(context, { path: '/' });
  assert.match(html.headers['content-security-policy'], /default-src 'none'/u);
  assert.match(html.headers['content-security-policy'], /script-src 'self'/u);
  assert.match(html.headers['content-security-policy'], /connect-src 'self'/u);
  assert.match(html.headers['content-security-policy'], /img-src data:/u);
  assert.doesNotMatch(html.headers['content-security-policy'], /unsafe-inline|unsafe-eval|https?:/u);
  assert.match(html.text, /TEK YEREL EDİTÖR|Tek yerel editör/u);
  assert.match(html.text, /öğrenci|kimlik doğrulama/u);
  assert.match(html.text, /sunucu örneğine/u);
  assert.match(html.text, /tam geçerli adım anlatımı/u);
  assert.doesNotMatch(html.text.replace(/<[^>]*>/gu, ''), /\b(?:server|cursor|caption|cue|mastery|Curriculum)\b/u);
  assert.doesNotMatch(html.text, /172 metre|<svg|fullTranscript|<script[^>]*>[^<]/u);
});

// Break caught: Node's special CONNECT handshake bypasses the closed request
// route without returning an honest rejection; no tunnel should be offered.
test('CONNECT upgrade and expect handshakes cannot become a tunnel or mutate a review', async t => {
  const context = await start(t), before = await current(context);
  for (const [message, code] of [
    [`CONNECT /api/action HTTP/1.1\r\nHost: ${context.host}\r\nConnection: close\r\n\r\n`, 400],
    [`GET /api/current HTTP/1.1\r\nHost: ${context.host}\r\nConnection: upgrade\r\nUpgrade: websocket\r\n\r\n`, 400],
    [`POST /api/action HTTP/1.1\r\nHost: ${context.host}\r\nOrigin: ${context.origin}\r\nContent-Type: application/json\r\nContent-Length: 20\r\nExpect: 100-continue\r\nConnection: close\r\n\r\n`, 417],
  ]) {
    const output = await raw(context, message);
    assert.match(output, new RegExp(`^HTTP/1\\.1 ${code} `, 'u'));
    assert.deepEqual(await current(context), before);
  }
});

test('actual IPv6 loopback binding uses its exact bracketed bound origin', async t => {
  const context = await start(t, '::1');
  assert.equal((await request(context)).status, 200);
  assert.equal((await action(context, 'next_page')).status, 200);
  await rejectedWithoutAdvance(context, { headers: { Host: `localhost:${context.port}` } }, 403);
  const before = await current(context);
  assert.equal((await post(context, { type: 'previous_page' }, { Origin: `http://127.0.0.1:${context.port}` })).status, 403);
  assert.deepEqual(await current(context), before);
});

// A deliberately minimal DOM boundary double: all content sinks are literal;
// the actual emitted script and actual loopback HTTP server still execute.
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.listeners = {}; this.attributes = {}; this.textContent = ''; this.disabled = true; this.open = false; this.hidden = false; this.src = ''; }
  set innerHTML(_) { throw new Error('forbidden_html_sink'); }
  set outerHTML(_) { throw new Error('forbidden_html_sink'); }
  insertAdjacentHTML() { throw new Error('forbidden_html_sink'); }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  async click() { if (!this.disabled) for (const fn of this.listeners.click ?? []) await fn({ preventDefault() {} }); }
}
async function client(context, afterResponse = async () => {}) {
  const html = (await request(context, { path: '/' })).text;
  const script = (await request(context, { path: '/review.mjs' })).text;
  const elements = new Map([...html.matchAll(/\bid="([^"]+)"/gu)].map(match => [match[1], new Element()]));
  const paths = [], calls = [];
  const fetch = async (path, options = {}) => {
    paths.push(path); calls.push(options); assert.ok(['/api/current', '/api/action'].includes(path));
    const outcome = await request(context, { path, method: options.method ?? 'GET', headers: {
      ...(options.headers ?? {}), ...(options.method === 'POST' ? { Origin: context.origin } : {}) }, body: options.body });
    await afterResponse(path, options, outcome);
    return { ok: outcome.status >= 200 && outcome.status < 300, status: outcome.status, json: async () => outcome.json };
  };
  const document = { getElementById: id => elements.get(id), createElement: tag => new Element(tag) };
  new Script(script, { filename: 'actual-emitted-review.mjs' }).runInContext(createContext({ document, fetch,
    TextEncoder, btoa: value => Buffer.from(value, 'binary').toString('base64'), console: { error() { throw new Error('unexpected_client_console'); } } }));
  for (let bound = 0; bound < 100 && elements.get('caption-lines').children.length === 0; bound++) await new Promise(done => setTimeout(done, 5));
  assert.ok(elements.get('caption-lines').children.length > 0, 'actual client did not present the current caption');
  return { elements, paths, calls };
}

test('actual emitted client presents only current literal DOM lines and posts fixed actions to its own API', async t => {
  const context = await start(t), ui = await client(context), { elements } = ui;
  assert.deepEqual(elements.get('caption-lines').children.map(line => line.textContent),
    ['Kapı her sırada açık kalacak biçimde iki tel sırası için', 'gereken toplam tel uzunluğu isteniyor; alan ya da tek tur']);
  assert.equal(elements.get('cue-counter').textContent, 'İstenen · Adım 1 / 30 · Sayfa 1 / 2');
  assert.equal(elements.get('next-cue').disabled, true); assert.equal(elements.get('next-page').disabled, false);
  assert.equal(elements.get('svg-preview').open, false); assert.equal(elements.get('narration-preview').open, false);
  assert.match(elements.get('source-image').src, /^data:image\/svg\+xml;base64,/u);
  assert.equal(elements.get('source-image').attributes['aria-hidden'], 'true');
  await elements.get('next-page').click(); assert.equal((await current(context)).cursor.pageIndex, 1);
  await elements.get('next-cue').click(); assert.equal((await current(context)).cursor.kind, 'evidence');
  assert.deepEqual(elements.get('caption-lines').children.map(line => line.textContent),
    ['Kısa kenarın soruda verilen uzunluğu. Verilen değer 18 metre.', 'Kısa kenarı iki eş parça olarak düşünmemizi sağlayan kesrin']);
  assert.equal(ui.paths[0], '/api/current'); assert.ok(ui.paths.every(path => ['/api/current', '/api/action'].includes(path)));
  for (const call of ui.calls) { assert.equal(call.credentials, 'omit'); assert.equal(call.redirect, 'error'); }
  for (const call of ui.calls.filter(call => call.method === 'POST')) assert.deepEqual(Object.keys(JSON.parse(call.body)), ['type']);
});

test('actual emitted client leaves locked narration hidden and reveals only after the explicit current button', async t => {
  const context = await start(t); await toCue(context, 4);
  const { elements } = await client(context);
  assert.equal(elements.get('next-cue').disabled, true); assert.equal(elements.get('reveal-current').disabled, false);
  assert.match(elements.get('status').textContent, /açık yanıtı gösterme isteği/u);
  assert.doesNotMatch(elements.get('status').textContent, /\b(?:reveal|Cue|cue)\b/u);
  assert.doesNotMatch(elements.get('full-narration').textContent, /18 bölü 2 eşittir 9 metre/u);
  await elements.get('reveal-current').click();
  assert.equal((await current(context)).cursor.resultVisible, true);
  assert.match(elements.get('full-narration').textContent, /^18 bölü 2 eşittir 9 metre/u);
  assert.equal(elements.get('narration-preview').open, false);
  await elements.get('next-cue').click(); await elements.get('previous-cue').click();
  assert.equal((await current(context)).cursor.resultVisible, false);
  assert.doesNotMatch(elements.get('full-narration').textContent, /18 bölü 2 eşittir 9 metre/u);
});

test('lost POST response and failed recovery read lock every mutation instead of skipping an unseen page', async t => {
  const context = await start(t); await finishPages(context); await action(context, 'next_cue');
  let responseLost = false;
  const ui = await client(context, async (path, options, outcome) => {
    if (path === '/api/action' && JSON.parse(options.body).type === 'next_page') {
      assert.equal(outcome.status, 200); responseLost = true; throw new Error('simulated_reply_lost_after_real_commit');
    }
    if (responseLost && path === '/api/current') throw new Error('simulated_recovery_read_failure');
  });
  const oldLines = ui.elements.get('caption-lines').children.map(node => node.textContent);
  await ui.elements.get('next-page').click();
  assert.equal((await current(context)).cursor.pageIndex, 1);
  assert.deepEqual(ui.elements.get('caption-lines').children.map(node => node.textContent), oldLines);
  assert.match(ui.elements.get('status').textContent, /görünüm eski olabilir/u);
  for (const id of ['previous-page', 'next-page', 'previous-cue', 'next-cue', 'reveal-current'])
    assert.equal(ui.elements.get(id).disabled, true, `${id} must stay locked until a fresh current read`);
  const posts = ui.calls.filter(call => call.method === 'POST').length;
  await ui.elements.get('next-page').click();
  await ui.elements.get('next-page').listeners.click[0]({ preventDefault() {} });
  assert.equal(ui.calls.filter(call => call.method === 'POST').length, posts);
  assert.equal((await current(context)).cursor.pageIndex, 1);
  const reloaded = await client(context);
  assert.deepEqual(reloaded.elements.get('caption-lines').children.map(node => node.textContent), (await current(context)).caption.lines);
  assert.equal(reloaded.elements.get('next-page').disabled, false);
  await reloaded.elements.get('next-page').click();
  assert.equal((await current(context)).cursor.pageIndex, 2);
});

test('successful recovery after a lost committed reply displays the fresh page before controls reopen', async t => {
  const context = await start(t); let responseLost = false;
  const ui = await client(context, async (path, _options, outcome) => {
    if (path === '/api/action' && !responseLost) {
      assert.equal(outcome.status, 200); responseLost = true; throw new Error('simulated_reply_lost_after_real_commit');
    }
  });
  await ui.elements.get('next-page').click();
  const fresh = await current(context);
  assert.equal(fresh.cursor.pageIndex, 1);
  assert.deepEqual(ui.elements.get('caption-lines').children.map(node => node.textContent), fresh.caption.lines);
  assert.equal(ui.elements.get('previous-page').disabled, false);
  assert.equal(ui.elements.get('next-cue').disabled, false);
  assert.equal(ui.calls.filter(call => call.method === 'POST').length, 1);
});

test('an in-flight action disables all controls and cannot issue a second mutation on a double click', async t => {
  const context = await start(t); let release, waiting = false;
  const gate = new Promise(done => { release = done; });
  const ui = await client(context, async path => {
    if (path === '/api/action') { waiting = true; await gate; }
  });
  const first = ui.elements.get('next-page').click();
  for (let bound = 0; bound < 100 && !waiting; bound++) await new Promise(done => setTimeout(done, 5));
  assert.equal(waiting, true);
  for (const id of ['previous-page', 'next-page', 'previous-cue', 'next-cue', 'reveal-current'])
    assert.equal(ui.elements.get(id).disabled, true);
  await ui.elements.get('next-page').click();
  // A queued event also cannot bypass send()'s private busy guard.
  await ui.elements.get('next-page').listeners.click[0]({ preventDefault() {} });
  assert.equal(ui.calls.filter(call => call.method === 'POST').length, 1);
  release(); await first;
  assert.equal((await current(context)).cursor.pageIndex, 1);
});
