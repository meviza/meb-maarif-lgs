import http from 'node:http';
import { constants, lstat, open, readFile } from 'node:fs/promises';

const ASSETS = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/studio.css', ['studio.css', 'text/css; charset=utf-8']],
  ['/studio.mjs', ['studio.mjs', 'application/javascript; charset=utf-8']],
  ['/view_model.mjs', ['../view_model.mjs', 'application/javascript; charset=utf-8']],
]);
const MAX_EVIDENCE_BYTES = 3 * 1024 * 1024;
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

async function readEvidence(file) {
  if (!file) return { status: 'unavailable', report: null };
  let handle;
  let initiallyPresent = false;
  const invalid = () => ({ status: 'invalid', report: null });
  const sameFile = (left, right) => left.dev === right.dev && left.ino === right.ino && left.size === right.size && left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs;
  try {
    const before = await lstat(file);
    initiallyPresent = true;
    if (!before.isFile() || before.isSymbolicLink() || before.size > MAX_EVIDENCE_BYTES || typeof constants.O_NOFOLLOW !== 'number') return invalid();
    handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const details = await handle.stat();
    if (!details.isFile() || !sameFile(before, details)) return invalid();
    const chunks = [];
    const buffer = Buffer.allocUnsafe(64 * 1024);
    let byteLength = 0;
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, Math.min(buffer.length, MAX_EVIDENCE_BYTES - byteLength + 1), byteLength);
      if (!bytesRead) break;
      if (byteLength + bytesRead > MAX_EVIDENCE_BYTES || byteLength + bytesRead > details.size) return invalid();
      chunks.push(Buffer.from(buffer.subarray(0, bytesRead)));
      byteLength += bytesRead;
    }
    const after = await handle.stat();
    const currentPath = await lstat(file);
    if (byteLength !== details.size || !sameFile(details, after) || currentPath.isSymbolicLink() || !currentPath.isFile() || !sameFile(details, currentPath)) return invalid();
    const bytes = Buffer.concat(chunks, byteLength);
    const report = JSON.parse(bytes.toString('utf8'));
    if (!report || typeof report !== 'object' || Array.isArray(report)) return { status: 'invalid', report: null };
    return { status: 'available', report };
  } catch (error) {
    return { status: error.code === 'ENOENT' && !initiallyPresent ? 'unavailable' : 'invalid', report: null };
  } finally { await handle?.close().catch(() => {}); }
}

// This is a developer/editor preview, not an authenticated school-admin API.
// The CLI binds only loopback. Host checks also resist browser DNS rebinding.
export function createLocalStudioServer({ pilotReportPath, sourceRegistryPath } = {}) {
  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    const sendJson = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(payload));
    };
    if (!/^(127\.0\.0\.1|localhost|\[::1\])(?::[0-9]{1,5})?$/.test(req.headers.host || '')) {
      sendJson(403, { error: 'loopback_host_required' });
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      sendJson(405, { error: 'read_only_preview' });
      return;
    }
    let pathname;
    try { pathname = new URL(req.url, 'http://127.0.0.1').pathname; }
    catch { sendJson(400, { error: 'invalid_request' }); return; }
    if (pathname === '/api/studio') {
      const [pilot, sources] = await Promise.all([readEvidence(pilotReportPath), readEvidence(sourceRegistryPath)]);
      sendJson(200, { mode: 'local_review_preview', publicationEnabled: false, pilot, sources });
      return;
    }
    const asset = ASSETS.get(pathname);
    if (!asset) { sendJson(404, { error: 'not_found' }); return; }
    try {
      const bytes = await readFile(new URL(`./web/${asset[0]}`, import.meta.url));
      res.writeHead(200, { 'Content-Type': asset[1] });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { sendJson(404, { error: 'asset_unavailable' }); }
  });
}
