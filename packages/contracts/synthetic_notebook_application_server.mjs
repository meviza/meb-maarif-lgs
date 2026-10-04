/** One shared local synthetic notebook instance. This is not HTTP/user
 * authentication, a production driver, a notebook UI or learning analytics.
 * Source and executor are supplied only by a trusted server composition root.
 */
import { createServer } from 'node:http';
import { TextDecoder } from 'node:util';
import { createSyntheticNotebookApplication } from './synthetic_notebook_application.mjs';

const BODY_MAX = 262144, RESPONSE_MAX = 524288, BODY_DEADLINE_MS = 1000;
const HEADERS = new Set(['host', 'origin', 'connection', 'content-type', 'content-length', 'transfer-encoding',
  'content-encoding', 'accept', 'accept-encoding', 'accept-language', 'user-agent', 'cache-control', 'pragma',
  'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform']);
const CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
class HttpError extends Error { constructor(status, code) { super(code); this.status = status; } }
const deny = (status, code) => { throw new HttpError(status, code); };
function reply(response, status, value) {
  if (response.destroyed || response.writableEnded) return;
  const bytes = Buffer.from(JSON.stringify(value), 'utf8');
  if (bytes.length > RESPONSE_MAX) throw new Error('notebook_http_output_budget_exceeded');
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': bytes.length,
    'Cache-Control': 'no-store', 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer', 'Cross-Origin-Resource-Policy': 'same-origin', 'Connection': 'close' });
  response.end(bytes);
}
function reject(response, error) {
  const known = error instanceof HttpError;
  reply(response, known ? error.status : 500, { state: 'rejected', error: { code: known ? error.message : 'synthetic_notebook_http_unavailable' },
    syntheticOnly: true, authentication: 'not_implemented', automaticRead: false, automaticRetry: false,
    learnerReady: false, productionReady: false });
}
function boundary(server, request) {
  const address = server.address(), socket = request.socket;
  if (!address || typeof address !== 'object' || !['127.0.0.1', '::1'].includes(address.address)
    || socket.localAddress !== address.address || socket.localPort !== address.port
    || !['127.0.0.1', '::1'].includes(socket.remoteAddress)) deny(403, 'loopback_binding_required');
  const host = `${address.address === '::1' ? '[::1]' : address.address}:${address.port}`, origin = `http://${host}`;
  const seen = new Set();
  for (let i = 0; i < request.rawHeaders.length; i += 2) {
    const name = request.rawHeaders[i].toLowerCase();
    if (seen.has(name)) deny(400, 'duplicate_request_header'); seen.add(name);
    if (!HEADERS.has(name)) deny(400, 'closed_request_headers_required');
  }
  if (request.headers.host !== host) deny(403, 'bound_host_required');
  const declared = request.headers.origin;
  if ((declared !== undefined && declared !== origin) || (request.method === 'POST' && declared !== origin)) deny(403, 'same_origin_required');
  const site = request.headers['sec-fetch-site'], mode = request.headers['sec-fetch-mode'], destination = request.headers['sec-fetch-dest'];
  if (site !== undefined && !['same-origin', 'none'].includes(site)) deny(403, 'cross_site_request_forbidden');
  if (request.method === 'POST' && ((mode !== undefined && !['cors', 'same-origin'].includes(mode))
    || (destination !== undefined && destination !== 'empty'))) deny(403, 'cross_site_request_forbidden');
  if (typeof request.url !== 'string' || request.url.includes('?') || request.url.includes('#')) deny(400, 'query_not_allowed');
}

// Validate exact JSON grammar before JSON.parse, whose last-member-wins
// behavior would otherwise erase duplicates. NFC applies only to key names
// in this detection set; no text, coordinate, or returned key is normalized.
function strictJson(text) {
  let index = 0, nodes = 0;
  const invalid = () => { throw new Error('invalid_json'); };
  const whitespace = () => { while (/[\t\n\r ]/u.test(text[index] ?? '\0')) index++; };
  function string() {
    if (text[index] !== '"') invalid();
    const start = index++;
    while (index < text.length) {
      if (text[index] === '"') { index++; return JSON.parse(text.slice(start, index)); }
      if (text[index] === '\\') index += 2; else index++;
    }
    invalid();
  }
  function value(depth) {
    if (depth > 14 || ++nodes > 100000) invalid();
    whitespace();
    if (text[index] === '{') {
      index++; whitespace(); const keys = new Set();
      if (text[index] === '}') { index++; return; }
      while (true) {
        whitespace(); const key = string().normalize('NFC');
        if (keys.has(key)) invalid(); keys.add(key); whitespace();
        if (text[index++] !== ':') invalid(); value(depth + 1); whitespace();
        const next = text[index++]; if (next === '}') return; if (next !== ',') invalid();
      }
    }
    if (text[index] === '[') {
      index++; whitespace(); if (text[index] === ']') { index++; return; }
      while (true) { value(depth + 1); whitespace(); const next = text[index++]; if (next === ']') return; if (next !== ',') invalid(); }
    }
    if (text[index] === '"') { string(); return; }
    const primitive = /^(?:true|false|null|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/u.exec(text.slice(index));
    if (!primitive) invalid(); index += primitive[0].length;
  }
  value(0); whitespace(); if (index !== text.length) invalid(); return JSON.parse(text);
}
function readBody(request) {
  if (!/^application\/json(?:;\s*charset=utf-8)?$/iu.test(request.headers['content-type'] ?? '')) deny(415, 'json_content_type_required');
  if (request.headers['content-encoding'] !== undefined) deny(415, 'content_encoding_not_supported');
  const declared = request.headers['content-length'];
  if (declared !== undefined && (!/^(?:0|[1-9][0-9]*)$/u.test(declared) || Number(declared) > BODY_MAX)) deny(413, 'notebook_body_byte_budget');
  return new Promise((resolve, rejectBody) => {
    let size = 0, finished = false; const chunks = [];
    const cleanup = () => { clearTimeout(timer); request.off('data', data); request.off('end', end); request.off('aborted', aborted); request.off('error', errored); };
    const finish = (error, value) => { if (finished) return; finished = true; cleanup(); error ? rejectBody(error) : resolve(value); };
    const data = chunk => { size += chunk.length; if (size > BODY_MAX) finish(new HttpError(413, 'notebook_body_byte_budget')); else chunks.push(chunk); };
    const end = () => {
      try { finish(null, strictJson(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(Buffer.concat(chunks)))); }
      catch { finish(new HttpError(400, 'closed_notebook_json_required')); }
    };
    const aborted = () => finish(new HttpError(400, 'notebook_body_incomplete'));
    const errored = () => finish(new HttpError(400, 'notebook_body_incomplete'));
    const timer = setTimeout(() => finish(new HttpError(408, 'notebook_body_deadline')), BODY_DEADLINE_MS); timer.unref();
    request.on('data', data); request.once('end', end); request.once('aborted', aborted); request.once('error', errored);
  });
}
function status(result) {
  if (result.valid) return 200;
  if (result.commitState === 'unknown' || result.readState === 'unknown') return 503;
  if (result.decision === 'application_busy' || ['notebook_revision_conflict', 'notebook_idempotency_conflict'].includes(result.error?.code)) return 409;
  return 400;
}

/** Construction validates inert trusted options but neither listens nor
 * executes SQL. Bind explicitly to canonical 127.0.0.1 or ::1. GET/current
 * exposes this single application's last explicit read, never fixture data.
 */
export function createSyntheticNotebookApplicationServer(options) {
  if (arguments.length !== 1) throw new Error('invalid_synthetic_notebook_application_server_options');
  let app;
  try { app = createSyntheticNotebookApplication(options); }
  catch { throw new Error('invalid_synthetic_notebook_application_server_options'); }
  const server = createServer({ maxHeaderSize: 8192, headersTimeout: 2000, requestTimeout: 3000,
    keepAliveTimeout: 1000, connectionsCheckingInterval: 500 }, (request, response) => {
    request.on('error', () => {});
    void (async () => {
      boundary(server, request);
      if (request.url === '/api/notebook/current') {
        if (request.method !== 'GET') deny(405, 'method_not_allowed');
        if (request.headers['transfer-encoding'] !== undefined || Number(request.headers['content-length'] ?? 0) !== 0) deny(400, 'read_body_not_allowed');
        reply(response, 200, app.current()); return;
      }
      if (!['/api/notebook/read', '/api/notebook/save'].includes(request.url)) deny(404, 'route_not_found');
      if (request.method !== 'POST') deny(405, 'method_not_allowed');
      const body = await readBody(request);
      let result;
      if (request.url === '/api/notebook/read') {
        if (body === null || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 0) deny(400, 'empty_read_json_required');
        result = await app.readCurrent();
      } else result = await app.save(body);
      reply(response, status(result), result);
    })().catch(error => reject(response, error));
  });
  server.setTimeout(3000);
  server.on('clientError', (error, socket) => {
    if (socket.writable) socket.end(`HTTP/1.1 ${error.code === 'HPE_HEADER_OVERFLOW' ? '431 Request Header Fields Too Large' : '400 Bad Request'}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  });
  server.on('checkContinue', (request, response) => { request.on('error', () => {}); reject(response, new HttpError(417, 'expect_not_supported')); });
  server.on('checkExpectation', (request, response) => { request.on('error', () => {}); reject(response, new HttpError(417, 'expect_not_supported')); });
  server.on('upgrade', (_request, socket) => { socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); });
  server.on('connect', (_request, socket) => { socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); });
  return server;
}
