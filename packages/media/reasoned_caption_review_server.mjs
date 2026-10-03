import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { TextDecoder } from 'node:util';
import { createGardenQuestion } from '../content-factory/pilot.mjs';
import { createReasonedMathTrace } from '../content-factory/reasoned_math_adapter.mjs';
import { createReasonedMediaJob } from './reasoned_media_job.mjs';
import { createReasonedScenePlan } from './reasoned_scene_renderer.mjs';
import { createReasonedCaptionReview } from './reasoned_caption_review.mjs';

const BODY_MAX = 256, BODY_DEADLINE_MS = 1000;
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src data:; font-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";
const actionBody = /^[\t\n\r ]*\{[\t\n\r ]*"type"[\t\n\r ]*:[\t\n\r ]*"(previous_page|next_page|previous_cue|next_cue|reveal_current)"[\t\n\r ]*\}[\t\n\r ]*$/u;
const assetDefinitions = [['/', 'index.html', 'text/html; charset=utf-8'], ['/index.html', 'index.html', 'text/html; charset=utf-8'],
  ['/review.mjs', 'review.mjs', 'text/javascript; charset=utf-8'], ['/review.css', 'review.css', 'text/css; charset=utf-8']];
class HttpError extends Error { constructor(status, code) { super(code); this.status = status; } }
const deny = (status, code) => { throw new HttpError(status, code); };
function reply(response, status, body, type = 'application/json; charset=utf-8', head = false) {
  if (response.destroyed || response.writableEnded) return;
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);
  response.writeHead(status, { 'Content-Type': type, 'Content-Length': bytes.length, 'Cache-Control': 'no-store',
    'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-origin', 'Connection': 'close' });
  response.end(head ? undefined : bytes);
}
function reject(response, error) {
  const known = error instanceof HttpError;
  reply(response, known ? error.status : 500, JSON.stringify({ state: 'rejected', error: { code: known ? error.message : 'caption_review_unavailable' },
    publicationReady: false, productionReady: false }));
}
function boundary(server, request) {
  const address = server.address(), socket = request.socket;
  if (!address || typeof address !== 'object' || !['127.0.0.1', '::1'].includes(address.address)
    || socket.localAddress !== address.address || socket.localPort !== address.port
    || !['127.0.0.1', '::1'].includes(socket.remoteAddress)) deny(403, 'loopback_binding_required');
  const host = `${address.address === '::1' ? '[::1]' : address.address}:${address.port}`, origin = `http://${host}`;
  const seen = new Set();
  for (let index = 0; index < request.rawHeaders.length; index += 2) {
    const name = request.rawHeaders[index].toLowerCase();
    if (seen.has(name)) deny(400, 'duplicate_request_header'); seen.add(name);
    if (/^(?:authorization|proxy-authorization|cookie|forwarded|x-|(?:school|learner|student|tenant|grade|role|scope)(?:-|$))/u.test(name)) deny(400, 'caller_scope_header_forbidden');
  }
  if (request.headers.host !== host) deny(403, 'bound_host_required');
  const declared = request.headers.origin;
  if ((declared !== undefined && declared !== origin) || (request.method === 'POST' && declared !== origin)) deny(403, 'same_origin_required');
  const site = request.headers['sec-fetch-site'], mode = request.headers['sec-fetch-mode'], destination = request.headers['sec-fetch-dest'];
  if (site !== undefined && !['same-origin', 'none'].includes(site)) deny(403, 'cross_site_request_forbidden');
  if (request.method === 'POST' && ((mode !== undefined && !['cors', 'same-origin'].includes(mode))
    || (destination !== undefined && destination !== 'empty'))) deny(403, 'cross_site_request_forbidden');
  if (typeof request.url !== 'string' || request.url.includes('?')) deny(400, 'query_not_allowed');
}
function readAction(request) {
  if (!/^application\/json(?:;\s*charset=utf-8)?$/iu.test(request.headers['content-type'] ?? '')) deny(415, 'json_content_type_required');
  if (request.headers['content-encoding'] !== undefined) deny(415, 'content_encoding_not_supported');
  const declared = request.headers['content-length'];
  if (declared !== undefined && (!/^(?:0|[1-9][0-9]*)$/u.test(declared) || Number(declared) > BODY_MAX)) deny(413, 'action_body_byte_budget');
  return new Promise((done, rejectBody) => {
    let size = 0, finished = false; const chunks = [];
    const cleanup = () => { clearTimeout(timer); request.off('data', data); request.off('end', end); request.off('aborted', aborted); request.off('error', errored); };
    const finish = (error, value) => { if (finished) return; finished = true; cleanup(); error ? rejectBody(error) : done(value); };
    const data = chunk => { size += chunk.length; if (size > BODY_MAX) finish(new HttpError(413, 'action_body_byte_budget')); else chunks.push(chunk); };
    const end = () => {
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)), match = actionBody.exec(text);
        if (!match) return finish(new HttpError(400, 'closed_action_json_required'));
        finish(null, { type: match[1] });
      } catch { finish(new HttpError(400, 'closed_action_json_required')); }
    };
    const aborted = () => finish(new HttpError(400, 'action_body_incomplete'));
    const errored = () => finish(new HttpError(400, 'action_body_incomplete'));
    const timer = setTimeout(() => finish(new HttpError(408, 'action_body_deadline')), BODY_DEADLINE_MS); timer.unref();
    request.on('data', data); request.once('end', end); request.once('aborted', aborted); request.once('error', errored);
  });
}

/** Single in-memory synthetic local editor, NOT auth/student/persistence.
 * No caller config/source/role. Construction never binds or starts listening.
 * The composition root must listen on canonical 127.0.0.1 or ::1 explicitly. */
export function createReasonedCaptionReviewServer() {
  if (arguments.length !== 0) throw new Error('invalid_reasoned_caption_review_server_arguments');
  const source = createGardenQuestion({ id: 'caption-review-loopback-garden' });
  const trace = createReasonedMathTrace(source), job = createReasonedMediaJob(trace);
  const controller = createReasonedCaptionReview(createReasonedScenePlan({ source, trace, job }));
  const assets = new Map(assetDefinitions.map(([path, file, type]) => [path, { bytes: readFileSync(new URL(`../../apps/caption-review/${file}`, import.meta.url)), type }]));
  const server = createServer({ maxHeaderSize: 8192, headersTimeout: 2000, requestTimeout: 3000,
    keepAliveTimeout: 1000, connectionsCheckingInterval: 500 }, (request, response) => {
    // An aborted native stream may emit an error after the body listener was
    // removed; it cannot be allowed to become an unhandled process exception.
    request.on('error', () => {});
    void (async () => {
      boundary(server, request);
      const asset = assets.get(request.url);
      if (asset) {
        if (!['GET', 'HEAD'].includes(request.method)) deny(405, 'method_not_allowed');
        if (request.headers['transfer-encoding'] !== undefined || Number(request.headers['content-length'] ?? 0) !== 0) deny(400, 'read_body_not_allowed');
        reply(response, 200, asset.bytes, asset.type, request.method === 'HEAD'); return;
      }
      if (request.url === '/api/current') {
        if (request.method !== 'GET') deny(405, 'method_not_allowed');
        if (request.headers['transfer-encoding'] !== undefined || Number(request.headers['content-length'] ?? 0) !== 0) deny(400, 'read_body_not_allowed');
        reply(response, 200, JSON.stringify(controller.current())); return;
      }
      if (request.url !== '/api/action') deny(404, 'route_not_found');
      if (request.method !== 'POST') deny(405, 'method_not_allowed');
      const action = await readAction(request);
      let record;
      try { record = controller.dispatch(action); }
      catch (error) {
        if (error.message === 'reasoned_caption_review_transition_blocked') deny(409, 'review_transition_blocked');
        if (error.message === 'invalid_reasoned_caption_review_action') deny(400, 'closed_action_json_required');
        throw error;
      }
      reply(response, 200, JSON.stringify(record));
    })().catch(error => reject(response, error));
  });
  server.setTimeout(3000);
  server.on('clientError', (error, socket) => {
    if (socket.writable) socket.end(`HTTP/1.1 ${error.code === 'HPE_HEADER_OVERFLOW' ? '431 Request Header Fields Too Large' : '400 Bad Request'}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  });
  server.on('checkContinue', (request, response) => { request.on('error', () => {}); reply(response, 417, JSON.stringify({ state: 'rejected', error: { code: 'expect_not_supported' }, productionReady: false })); });
  server.on('upgrade', (_request, socket) => { socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); });
  server.on('connect', (_request, socket) => { socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); });
  return server;
}
