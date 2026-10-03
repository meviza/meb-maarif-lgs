import http from 'node:http';
import { constants, lstat, open } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createSyntheticStudentContext, getStudentWorkspace } from './workspace.mjs';

const ASSETS = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/student.css', ['student.css', 'text/css; charset=utf-8']],
  ['/student.mjs', ['student.mjs', 'application/javascript; charset=utf-8']],
  ['/notebook.mjs', ['notebook.mjs', 'application/javascript; charset=utf-8']],
]);
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const LOOPBACK_HOST = /^(127\.0\.0\.1|localhost|\[::1\])(?::[0-9]{1,5})?$/;
const MAX_ASSET_BYTES = 1024 * 1024;
const sameFile = (left, right) => left.dev === right.dev && left.ino === right.ino && left.size === right.size && left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs;
async function readAsset(path) {
  let handle;
  try {
    const before = await lstat(path);
    if (!before.isFile() || before.isSymbolicLink() || before.size > MAX_ASSET_BYTES || typeof constants.O_NOFOLLOW !== 'number') return null;
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const stat = await handle.stat();
    if (!stat.isFile() || !sameFile(before, stat)) return null;
    const chunks = [], buffer = Buffer.allocUnsafe(64 * 1024);
    let byteLength = 0;
    while (true) {
      const length = Math.min(buffer.length, MAX_ASSET_BYTES - byteLength + 1);
      const { bytesRead } = await handle.read(buffer, 0, length, byteLength);
      if (!Number.isInteger(bytesRead) || bytesRead < 0 || bytesRead > length) return null;
      if (!bytesRead) break;
      if (byteLength + bytesRead > MAX_ASSET_BYTES || byteLength + bytesRead > stat.size) return null;
      chunks.push(Buffer.from(buffer.subarray(0, bytesRead)));
      byteLength += bytesRead;
    }
    const after = await handle.stat(), currentPath = await lstat(path);
    if (byteLength !== stat.size || !sameFile(stat, after) || !currentPath.isFile() || currentPath.isSymbolicLink() || !sameFile(stat, currentPath)) return null;
    return Buffer.concat(chunks, byteLength);
  } catch { return null; } finally { await handle?.close().catch(() => {}); }
}

export function createLocalStudentServer({ sourceRegistry, context = createSyntheticStudentContext(), now = () => new Date().toISOString(), webRoot = fileURLToPath(new URL('.', import.meta.url)) } = {}) {
  const registrySnapshot = structuredClone(sourceRegistry);
  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    const send = (status, payload) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(req.method === 'HEAD' ? undefined : JSON.stringify(payload)); };
    if (!LOOPBACK_HOST.test(req.headers.host ?? '')) { send(403, { error: 'loopback_host_required' }); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { send(405, { error: 'read_only_preview' }); return; }
    const ownOrigin = 'http://' + req.headers.host;
    if (req.headers.origin && req.headers.origin !== ownOrigin || req.headers['sec-fetch-site'] === 'cross-site') { send(403, { error: 'same_origin_preview_required' }); return; }
    let url;
    try { if (!req.url.startsWith('/') || req.url.startsWith('//')) throw new Error(); url = new URL(req.url, ownOrigin); } catch { send(400, { error: 'invalid_request' }); return; }
    if (url.pathname === '/api/workspace') {
      if (url.search || ['x-student-grade', 'x-grade', 'x-tenant-id', 'x-school-id', 'x-role', 'authorization'].some(header => req.headers[header] !== undefined)) { send(400, { error: 'browser_scope_claim_rejected' }); return; }
      const result = getStudentWorkspace({ context, sourceRegistry: registrySnapshot, now: now() });
      if (!result.allowed) { send(result.reason === 'course_catalog_unavailable' ? 503 : 403, { error: result.reason, mode: 'synthetic_student_preview', publicationEnabled: false }); return; }
      send(200, result.workspace); return;
    }
    const asset = ASSETS.get(url.pathname);
    if (!asset || url.search) { send(404, { error: 'not_found' }); return; }
    const bytes = await readAsset(join(webRoot, asset[0]));
    if (!bytes) { send(404, { error: 'asset_unavailable' }); return; }
    res.writeHead(200, { 'Content-Type': asset[1] }); res.end(req.method === 'HEAD' ? undefined : bytes);
  });
}
