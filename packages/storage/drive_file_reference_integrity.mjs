import { createHash } from 'node:crypto';

const MAX_BYTES = 25 * 1024 * 1024;
const result = (state, byteLength = 0, sha256 = null) => ({ state, byteLength, sha256 });
function record(value, required, optional = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  const keys = Reflect.ownKeys(value);
  return keys.every(key => typeof key === 'string' && [...required, ...optional].includes(key) && Object.getOwnPropertyDescriptor(value, key)?.enumerable && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')) && required.every(key => keys.includes(key));
}
function validatedInput(input) {
  try {
    if (!record(input, ['fileUri', 'expectedByteLength', 'expectedSha256'], ['allowNetwork'])) return null;
    if (!Number.isInteger(input.expectedByteLength) || input.expectedByteLength <= 0 || input.expectedByteLength > MAX_BYTES || typeof input.expectedSha256 !== 'string' || !/^[a-fA-F0-9]{64}$/.test(input.expectedSha256)) return null;
    const uri = input.fileUri;
    if (!record(uri, ['download_url', 'file_id', 'mime_type', 'file_name'], ['size'])) return null;
    if (typeof uri.download_url !== 'string' || uri.download_url.length > 16384 || /[\r\n\u0000#]/.test(uri.download_url) || typeof uri.file_id !== 'string' || !/^(?:sediment:\/\/)?[A-Za-z0-9_-]{1,200}$/.test(uri.file_id) || typeof uri.mime_type !== 'string' || !/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/.test(uri.mime_type) || typeof uri.file_name !== 'string' || !uri.file_name || uri.file_name.length > 512 || /[\u0000\r\n]/.test(uri.file_name)) return null;
    if (Object.hasOwn(uri, 'size')) {
      const declaredSize = typeof uri.size === 'string' && /^[1-9][0-9]{0,7}$/.test(uri.size) ? Number(uri.size) : uri.size;
      if (!Number.isInteger(declaredSize) || declaredSize !== input.expectedByteLength) return null;
    }
    const url = new URL(uri.download_url);
    if (url.protocol !== 'https:' || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+oaiusercontent\.com$/.test(url.hostname) || url.username || url.password || url.hash || url.port && url.port !== '443') return null;
    return { url: url.href, expectedByteLength: input.expectedByteLength, expectedSha256: input.expectedSha256.toLowerCase(), allowNetwork: input.allowNetwork === true };
  } catch { return null; }
}

// Integrity only: does not prove Drive account/parent/ownership, rights, source
// authority or publication readiness. Input is a short-lived authenticated URI
// supplied separately by the connector; it is never returned or logged here.
export async function verifyDriveFileReference(input, { fetchImpl = globalThis.fetch, timeoutMs = 30000 } = {}) {
  const reference = validatedInput(input);
  if (!reference || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) return result('invalid_reference');
  if (!reference.allowNetwork) return result('network_not_enabled');
  if (typeof fetchImpl !== 'function') return result('transport_error');
  const controller = new AbortController();
  let reader, byteLength = 0, stopped = false, timer;
  const stop = () => {
    stopped = true;
    controller.abort();
    // Do not let a hostile stream's cancel promise extend the hard deadline.
    try { const cancel = reader?.cancel(); cancel?.catch(() => {}); } catch {}
  };
  const deadline = new Promise(resolve => { timer = setTimeout(() => { stop(); resolve(result('timeout', byteLength)); }, timeoutMs); });
  const read = async () => {
    let phase = 'fetch';
    try {
      const response = await fetchImpl(reference.url, { method: 'GET', redirect: 'manual', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal });
      if (stopped) { try { const cancel = response?.body?.cancel(); cancel?.catch(() => {}); } catch {} return result('timeout', byteLength); }
      if (response?.status !== 200 || response?.ok !== true || response?.redirected === true) { stop(); return result('transport_rejected'); }
      phase = 'stream';
      if (typeof response?.body?.getReader !== 'function') { stop(); return result('stream_error'); }
      reader = response.body.getReader();
      const hash = createHash('sha256');
      while (!stopped) {
        const next = await reader.read();
        if (stopped) return result('timeout', byteLength);
        if (next.done) break;
        if (!(next.value instanceof Uint8Array)) { stop(); return result('stream_error', byteLength); }
        byteLength += next.value.byteLength;
        if (byteLength > reference.expectedByteLength || byteLength > MAX_BYTES) { stop(); return result('byte_limit_exceeded', byteLength); }
        hash.update(next.value);
      }
      if (stopped) return result('timeout', byteLength);
      const sha256 = hash.digest('hex');
      if (byteLength !== reference.expectedByteLength) return result('length_mismatch', byteLength, sha256);
      if (sha256 !== reference.expectedSha256) return result('hash_mismatch', byteLength, sha256);
      return result('verified', byteLength, sha256);
    } catch {
      const state = stopped ? 'timeout' : phase === 'fetch' ? 'transport_error' : 'stream_error';
      stop();
      return result(state, byteLength);
    }
  };
  try { return await Promise.race([read(), deadline]); }
  finally {
    clearTimeout(timer);
    stopped = true;
    try { reader?.releaseLock(); } catch {}
  }
}
