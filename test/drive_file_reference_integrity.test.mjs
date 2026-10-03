import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
const api = await import('../packages/storage/drive_file_reference_integrity.mjs').catch(() => ({}));
const bytes = Buffer.from('bounded binary fixture\0\xff', 'latin1');
const digest = value => createHash('sha256').update(value).digest('hex');
const reference = { download_url: 'https://sdmntpritalynorth.oaiusercontent.com/assets/fixture?sig=fixture-private-signature', file_id: 'fixture-file-1', mime_type: 'application/octet-stream', file_name: 'fixture.bin', size: bytes.length };
function input(overrides = {}) { return { fileUri: reference, expectedByteLength: bytes.length, expectedSha256: digest(bytes), allowNetwork: true, ...overrides }; }
async function verify(candidate, options) { assert.equal(typeof api.verifyDriveFileReference, 'function', 'bounded Drive stream verifier is not implemented'); return api.verifyDriveFileReference(candidate, options); }
function transport(chunks, { status = 200, redirected = false, contentLength, onCancel } = {}) {
  return async () => ({ status, ok: status >= 200 && status < 300, redirected, headers: new Headers(contentLength === undefined ? {} : { 'content-length': String(contentLength) }), body: new ReadableStream({ start(controller) { for (const chunk of chunks) controller.enqueue(new Uint8Array(chunk)); controller.close(); }, cancel() { onCancel?.(); } }) });
}

test('incremental binary stream verifies exact byte length and SHA without returning a signed reference', async () => {
  let outgoing;
  const fetchImpl = async (url, options) => { outgoing = { url, options }; return transport([bytes.subarray(0, 6), bytes.subarray(6)])(); };
  const result = await verify(input(), { fetchImpl });
  assert.deepEqual(result, { state: 'verified', byteLength: bytes.length, sha256: digest(bytes) });
  assert.equal(outgoing.options.redirect, 'manual');
  assert.ok(outgoing.options.signal instanceof AbortSignal);
  assert.equal(JSON.stringify(result).includes('fixture-private-signature'), false);
});

test('connector sediment file identifiers are accepted as opaque transport metadata, not as Drive ids', async () => {
  const result = await verify(input({ fileUri: { ...reference, file_id: 'sediment://fixture-file-reference-1' } }), { fetchImpl: transport([bytes]) });
  assert.equal(result.state, 'verified');
  for (const file_id of ['http://fixture-file-1', 'sediment://../private', 'sediment://', 'sediment://fixture\nsecret']) {
    assert.equal((await verify(input({ fileUri: { ...reference, file_id } }), { fetchImpl: transport([bytes]) })).state, 'invalid_reference');
  }
});

test('explicit opt-in is required and invalid references never invoke the transport', async () => {
  let calls = 0; const fetchImpl = () => { calls++; throw new Error('must-not-run'); };
  assert.equal((await verify(input({ allowNetwork: false }), { fetchImpl })).state, 'network_not_enabled');
  assert.equal((await verify(input({ allowNetwork: undefined }), { fetchImpl })).state, 'network_not_enabled');
  for (const url of ['http://sdmntpritalynorth.oaiusercontent.com/a', 'https://attacker.example/a', 'https://oaiusercontent.com.evil.example/a', 'https://oaiusercontent.com/a', 'https://user:password@sdmntpritalynorth.oaiusercontent.com/a', 'https://sdmntpritalynorth.oaiusercontent.com:8443/a', 'https://sdmntpritalynorth.oaiusercontent.com/a#fragment', 'https://sdmntpritalynorth.oaiusercontent.com/a#']) {
    const result = await verify(input({ fileUri: { ...reference, download_url: url } }), { fetchImpl }); assert.equal(result.state, 'invalid_reference', url.split('?')[0]);
  }
  for (const bad of [{ expectedByteLength: 0 }, { expectedByteLength: 25 * 1024 * 1024 + 1 }, { expectedSha256: 'not-a-hash' }, { fileUri: { ...reference, size: bytes.length + 1 } }]) assert.equal((await verify(input(bad), { fetchImpl })).state, 'invalid_reference');
  assert.equal(calls, 0);
});

test('redirect, partial success and HTTP failure are rejected without reading upstream error bodies', async () => {
  for (const status of [302, 206, 401, 503]) {
    const result = await verify(input(), { fetchImpl: transport([], { status }) }); assert.equal(result.state, 'transport_rejected');
  }
  assert.equal((await verify(input(), { fetchImpl: transport([bytes], { redirected: true }) })).state, 'transport_rejected');
});

test('hash mismatch and truncation cannot be mistaken for verified bytes', async () => {
  const wrongHash = await verify(input({ expectedSha256: '0'.repeat(64) }), { fetchImpl: transport([bytes]) });
  assert.equal(wrongHash.state, 'hash_mismatch'); assert.equal(wrongHash.byteLength, bytes.length);
  const truncated = await verify(input(), { fetchImpl: transport([bytes.subarray(0, 8)], { contentLength: bytes.length }) });
  assert.equal(truncated.state, 'length_mismatch'); assert.equal(truncated.byteLength, 8);
});

test('actual growth despite a lying content-length header aborts without reading subsequent chunks', async () => {
  let reads = 0, cancelled = false, observedSignal;
  const fetchImpl = async (_url, options) => {
    observedSignal = options.signal;
    return { status: 200, ok: true, redirected: false, headers: new Headers({ 'content-length': String(bytes.length) }), body: new ReadableStream({ pull(controller) { reads++; controller.enqueue(new Uint8Array(Buffer.alloc(bytes.length + 1))); }, cancel() { cancelled = true; } }, { highWaterMark: 0 }) };
  };
  const result = await verify(input(), { fetchImpl });
  assert.equal(result.state, 'byte_limit_exceeded'); assert.equal(result.sha256, null);
  assert.equal(reads, 1); assert.equal(cancelled, true); assert.equal(observedSignal.aborted, true);
});

test('fetch and stream errors are sanitized even when exception messages contain signed URLs', async () => {
  const secret = reference.download_url;
  const fetchFailure = await verify(input(), { fetchImpl: async () => { throw new Error(secret); } });
  assert.equal(fetchFailure.state, 'transport_error'); assert.equal(JSON.stringify(fetchFailure).includes(secret), false);
  const streamFailure = await verify(input(), { fetchImpl: async () => ({ status: 200, ok: true, body: new ReadableStream({ pull() { throw new Error(secret); } }) }) });
  assert.equal(streamFailure.state, 'stream_error'); assert.equal(JSON.stringify(streamFailure).includes('fixture-private-signature'), false);
});

test('deadline covers a never-ending stream and aborts it, not only the fetch phase', async () => {
  let cancelled = false, observedSignal;
  const fetchImpl = async (_url, options) => { observedSignal = options.signal; return { status: 200, ok: true, body: new ReadableStream({ pull() { return new Promise(() => {}); }, cancel() { cancelled = true; } }) }; };
  const result = await verify(input(), { fetchImpl, timeoutMs: 10 });
  assert.equal(result.state, 'timeout'); assert.equal(observedSignal.aborted, true); assert.equal(cancelled, true);
});

test('deadline also bounds a transport that ignores abort and never resolves', async () => {
  const result = await verify(input(), { fetchImpl: () => new Promise(() => {}), timeoutMs: 10 });
  assert.equal(result.state, 'timeout');
});

test('CLI accepts one bounded JSON line through stdin, does not echo it and rejects argv URLs', () => {
  const cwd = new URL('..', import.meta.url);
  const result = spawnSync(process.execPath, ['tools/verify_drive_file_reference.mjs'], { cwd, input: JSON.stringify(input({ allowNetwork: false })) + '\n', encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { state: 'network_not_enabled', byteLength: 0, sha256: null });
  assert.equal(result.stdout.includes('fixture-private-signature'), false); assert.equal(result.stderr, '');
  for (const stdin of ['x'.repeat(32769), '{}\n{}\n', '{bad-json']) {
    const failure = spawnSync(process.execPath, ['tools/verify_drive_file_reference.mjs'], { cwd, input: stdin, encoding: 'utf8' });
    assert.equal(JSON.parse(failure.stdout).state, 'invalid_input'); assert.equal(failure.stdout.includes(stdin), false);
  }
  const argv = spawnSync(process.execPath, ['tools/verify_drive_file_reference.mjs', reference.download_url], { cwd, encoding: 'utf8' });
  assert.equal(JSON.parse(argv.stdout).state, 'invalid_input'); assert.equal(argv.stdout.includes('fixture-private-signature'), false);
});

test('CLI processes a complete line without requiring stdin to close', async () => {
  const child = spawn(process.execPath, ['tools/verify_drive_file_reference.mjs'], { cwd: new URL('..', import.meta.url), stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '', stderr = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.stdin.write(JSON.stringify(input({ allowNetwork: false })) + '\n');
  try {
    const state = await Promise.race([
      new Promise(resolve => child.once('exit', code => resolve({ code }))),
      new Promise(resolve => { const timer = setTimeout(() => resolve({ timeout: true }), 1000); timer.unref(); }),
    ]);
    assert.equal(state.timeout, undefined, 'a complete JSON line must not wait for stdin EOF');
    assert.equal(state.code, 0);
    assert.equal(JSON.parse(output).state, 'network_not_enabled');
    assert.equal(output.includes('fixture-private-signature'), false);
    assert.equal(stderr, '');
  } finally { child.stdin.destroy(); child.kill(); }
});
