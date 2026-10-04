import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { types } from 'node:util';

const MAX_HTML_BYTES = 2097152;
const PROFILE = Object.freeze({
  schemaVersion: 'science-678-editor-view/v1', state: 'partial_editor_inventory', authoredDrafts: 54,
  reasoningFamilies: 27, targetDrafts: 450, remainingDrafts: 396, publishedQuestions: 0,
  providerCallsMade: 0, answerBearingEditorArtifact: true, learnerReady: false,
  publicationReady: false, nativeBrowserVerified: false,
});
const MANIFEST_KEYS = Object.freeze([...Object.keys(PROFILE), 'reviewContentSha256', 'htmlSha256', 'htmlBytes']);
const ALLOWED_HEADERS = new Set([
  'host', 'connection', 'accept', 'accept-encoding', 'accept-language', 'user-agent', 'cache-control', 'pragma',
  'origin', 'referer', 'content-length', 'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-fetch-user',
  'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform', 'upgrade-insecure-requests', 'dnt', 'sec-gpc', 'priority',
]);
const invalidSnapshot = () => new Error('invalid_science_preview_snapshot');

function snapshot(html, manifest) {
  if (typeof html !== 'string' || !html.startsWith('<!doctype html>') || Buffer.byteLength(html) > MAX_HTML_BYTES ||
      manifest === null || typeof manifest !== 'object' || types.isProxy(manifest) || Object.getPrototypeOf(manifest) !== Object.prototype) throw invalidSnapshot();
  const descriptors = Object.getOwnPropertyDescriptors(manifest), keys = Reflect.ownKeys(descriptors);
  if (keys.length !== MANIFEST_KEYS.length || keys.some(key => typeof key !== 'string' || !MANIFEST_KEYS.includes(key))) throw invalidSnapshot();
  const copy = {};
  for (const key of MANIFEST_KEYS) {
    const descriptor = descriptors[key];
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw invalidSnapshot();
    copy[key] = descriptor.value;
  }
  if (Object.entries(PROFILE).some(([key, value]) => copy[key] !== value) ||
      typeof copy.reviewContentSha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(copy.reviewContentSha256) ||
      typeof copy.htmlSha256 !== 'string' || copy.htmlSha256 !== createHash('sha256').update(html).digest('hex') ||
      copy.htmlBytes !== Buffer.byteLength(html)) throw invalidSnapshot();
  // This is an internal trusted renderer snapshot, not a sanitizer or source-approval service.
  // The hash binds exact bytes; CSP permits only the inline script present in those bytes.
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gu)];
  if (scripts.length > 1 || (html.match(/<script\b/giu) ?? []).length !== scripts.length) throw invalidSnapshot();
  const scriptSources = scripts.map(match => `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`).join(' ') || "'none'";
  const csp = `default-src 'none'; style-src 'unsafe-inline'; script-src ${scriptSources}; connect-src 'none'; img-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
  return {bytes: Buffer.from(html), manifest: Object.freeze(copy), csp};
}

function headers(csp, type, length) {
  return {
    'Content-Type': type, 'Content-Length': length, 'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store',
    'X-Frame-Options': 'DENY', Connection: 'close',
  };
}

export async function createScience678PreviewServer(html, manifest) {
  if (arguments.length !== 2) throw new Error('invalid_science_preview_arguments');
  const frozen = snapshot(html, manifest);
  let port = 0;
  const reject = (response, code, message, extra = {}) => {
    response.writeHead(code, {...headers(frozen.csp, 'text/plain; charset=utf-8', Buffer.byteLength(message)), ...extra});
    response.end(message);
  };
  const rejectSocket = (socket, status, message, extra = {}) => {
    if (!socket.writable) return socket.destroy();
    const security = {...headers(frozen.csp, 'text/plain; charset=utf-8', Buffer.byteLength(message)), ...extra};
    socket.end(`HTTP/1.1 ${status}\r\n` + Object.entries(security).map(([key, value]) => `${key}: ${value}\r\n`).join('') + '\r\n' + message);
  };
  const handle = (req, res) => {
    if (req.method !== 'GET') return reject(res, 405, 'Method not allowed.\n', {Allow: 'GET'});
    if (req.url !== '/') return reject(res, 404, 'Not found.\n');
    const seen = new Set();
    for (let index = 0; index < req.rawHeaders.length; index += 2) {
      const key = req.rawHeaders[index].toLowerCase();
      if (!ALLOWED_HEADERS.has(key) || seen.has(key)) return reject(res, 400, 'Invalid preview request.\n');
      seen.add(key);
    }
    const ownOrigin = `http://[::1]:${port}`;
    if (req.headers.host !== `[::1]:${port}` ||
        (req.headers['content-length'] !== undefined && req.headers['content-length'] !== '0') ||
        (req.headers.origin !== undefined && req.headers.origin !== ownOrigin) ||
        (req.headers['sec-fetch-site'] === 'cross-site' && req.headers['sec-fetch-mode'] !== 'navigate')) return reject(res, 400, 'Invalid preview request.\n');
    res.writeHead(200, headers(frozen.csp, 'text/html; charset=utf-8', frozen.bytes.length));
    res.end(frozen.bytes);
  };
  const server = createServer({maxHeaderSize: 8192, requestTimeout: 5000, headersTimeout: 5000}, handle);
  server.maxRequestsPerSocket = 1;
  server.timeout = 5000;
  server.on('checkContinue', (_req, res) => reject(res, 400, 'Invalid preview request.\n'));
  server.on('checkExpectation', (_req, res) => reject(res, 400, 'Invalid preview request.\n'));
  server.on('clientError', (_error, socket) => rejectSocket(socket, '400 Bad Request', 'Invalid preview request.\n'));
  server.on('connect', (_req, socket) => rejectSocket(socket, '405 Method Not Allowed', 'Method not allowed.\n', {Allow: 'GET'}));
  server.on('upgrade', (_req, socket) => rejectSocket(socket, '400 Bad Request', 'Invalid preview request.\n'));
  await new Promise((resolve, rejectStart) => {
    server.once('error', () => rejectStart(new Error('science_preview_start_failed')));
    server.listen({host: '::1', port: 0, ipv6Only: true}, resolve);
  });
  port = server.address().port;
  let closing;
  const close = () => {
    if (!closing) closing = new Promise((resolve, rejectClose) => {
      server.close(error => error ? rejectClose(new Error('science_preview_close_failed')) : resolve());
      server.closeAllConnections();
    });
    return closing;
  };
  return Object.freeze({schemaVersion: 'science-678-preview-server/v1', state: 'loopback_editor_preview', url: `http://[::1]:${port}/`, manifest: frozen.manifest, close});
}
