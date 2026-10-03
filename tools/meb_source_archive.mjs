import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const OFFICIAL_HOSTS = new Set([
  'karabukodm.meb.gov.tr', 'mufredat.meb.gov.tr', 'tymm.meb.gov.tr', 'odsgm.meb.gov.tr',
  // Exact hosts verified from the official book/olympiad catalogues. Never
  // infer trust for all subdomains or follow a short link outside this set.
  'cdn.eba.gov.tr', 'meb.ai', 'bilimolimpiyatlari.tubitak.gov.tr',
]);
const HARD_FILE_BYTES = 25 * 1024 * 1024;
const HARD_TOTAL_BYTES = 250 * 1024 * 1024;
const HARD_REDIRECTS = 3;
const SOURCE_ID = /^[a-z0-9][a-z0-9-]{0,95}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function fail(code) { throw new Error(code); }

export function validateOfficialMebUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { fail('official_https_url_required'); }
  if (typeof value !== 'string' || value.length > 2048 || parsed.protocol !== 'https:'
      || !OFFICIAL_HOSTS.has(parsed.hostname) || parsed.username || parsed.password
      || parsed.port || parsed.hash) fail('official_https_url_required');
  return parsed;
}

function validateRegistry(registry) {
  if (!registry || registry.schemaVersion !== '1.0.0' || !Array.isArray(registry.sources)
      || !registry.sources.length || registry.sources.length > 100) fail('invalid_source_registry');
  const identifiers = new Set();
  for (const source of registry.sources) {
    if (!source || typeof source.id !== 'string' || !SOURCE_ID.test(source.id)
        || identifiers.has(source.id) || source.usagePolicy !== 'reference_only'
        || source.reuseRights !== 'unverified' || typeof source.title !== 'string'
        || !source.title.length || source.title.length > 240
        || typeof source.kind !== 'string' || source.kind.length > 80
        || (source.expectedSha256 !== undefined && !SHA256.test(source.expectedSha256))) fail('invalid_source_registry');
    try {
      validateOfficialMebUrl(source.url);
      validateOfficialMebUrl(source.sourcePage);
    } catch { fail('invalid_source_registry'); }
    identifiers.add(source.id);
  }
}

function limitsFor(options) {
  const limits = {
    maxFileBytes: options.maxFileBytes ?? HARD_FILE_BYTES,
    maxTotalBytes: options.maxTotalBytes ?? HARD_TOTAL_BYTES,
    timeoutMs: options.timeoutMs ?? 20_000,
  };
  if (!Number.isSafeInteger(limits.maxFileBytes) || limits.maxFileBytes <= 0 || limits.maxFileBytes > HARD_FILE_BYTES
      || !Number.isSafeInteger(limits.maxTotalBytes) || limits.maxTotalBytes <= 0 || limits.maxTotalBytes > HARD_TOTAL_BYTES
      || !Number.isSafeInteger(limits.timeoutMs) || limits.timeoutMs <= 0 || limits.timeoutMs > 60_000) fail('invalid_archive_limits');
  return limits;
}

async function prepareCache(directory, maxTotalBytes) {
  if (typeof directory !== 'string' || !isAbsolute(directory) || resolve(directory) === '/') fail('unsafe_cache_directory');
  let info = await lstat(directory).catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (info?.isSymbolicLink() || (info && !info.isDirectory())) fail('unsafe_cache_directory');
  if (!info) {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    info = await lstat(directory);
    if (info.isSymbolicLink() || !info.isDirectory()) fail('unsafe_cache_directory');
  }
  let existingBytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.name.endsWith('.pdf')) continue;
    if (entry.isSymbolicLink() || !entry.isFile()) fail('unsafe_cache_directory');
    existingBytes += (await lstat(join(directory, entry.name))).size;
    if (existingBytes > maxTotalBytes) fail('existing_cache_byte_limit_exceeded');
  }
  return existingBytes;
}

async function downloadPdf(source, limits, remainingBytes, fetchImpl) {
  const signal = AbortSignal.timeout(limits.timeoutMs);
  let current = validateOfficialMebUrl(source.url).href;
  let redirectCount = 0;
  let response;
  for (;;) {
    response = await fetchImpl(current, {
      redirect: 'manual', signal,
      headers: { accept: 'application/pdf', 'user-agent': 'K12-MEB-Reference-Archive/1.0' },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      if (redirectCount >= HARD_REDIRECTS) fail('redirect_limit_exceeded');
      const location = response.headers.get('location');
      if (!location) fail('redirect_location_required');
      current = validateOfficialMebUrl(new URL(location, current).href).href;
      redirectCount++;
      continue;
    }
    break;
  }
  if (response.status !== 200) {
    await response.body?.cancel();
    fail(`http_${response.status}`);
  }
  const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/pdf' && contentType !== 'application/octet-stream') {
    await response.body?.cancel();
    fail('pdf_content_type_required');
  }
  const declaredLength = response.headers.get('content-length');
  if (declaredLength !== null && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > limits.maxFileBytes)) {
    await response.body?.cancel();
    fail('file_byte_limit_exceeded');
  }
  if (declaredLength !== null && Number(declaredLength) > remainingBytes) {
    await response.body?.cancel();
    fail('archive_byte_limit_exceeded');
  }
  if (!response.body) fail('pdf_body_required');
  const chunks = [];
  let length = 0;
  const reader = response.body.getReader();
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > limits.maxFileBytes) fail('file_byte_limit_exceeded');
      if (length > remainingBytes) fail('archive_byte_limit_exceeded');
      chunks.push(Buffer.from(chunk.value));
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
  const bytes = Buffer.concat(chunks, length);
  if (bytes.subarray(0, 5).toString('ascii') !== '%PDF-') fail('pdf_magic_required');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (source.expectedSha256 && source.expectedSha256 !== sha256) fail('source_sha256_mismatch');
  return { bytes, sha256, finalUrl: current, redirectCount, contentType };
}

function errorCode(error) {
  const known = /^(?:official_https_url_required|redirect_limit_exceeded|redirect_location_required|http_\d{3}|pdf_content_type_required|pdf_body_required|pdf_magic_required|file_byte_limit_exceeded|archive_byte_limit_exceeded|source_sha256_mismatch|cache_sha256_mismatch)$/;
  if (known.test(error?.message)) return error.message;
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'request_timeout';
  if (['EACCES', 'ENOSPC', 'EROFS', 'ELOOP'].includes(error?.code)) return 'cache_write_failed';
  return 'request_or_storage_failed';
}

export async function archiveSources(registry, options = {}) {
  validateRegistry(registry);
  const limits = limitsFor(options);
  const fetchImpl = options.fetchImpl ?? fetch;
  if (typeof fetchImpl !== 'function') fail('invalid_fetch_implementation');
  const cacheDirectory = options.cacheDirectory;
  let diskBytes = await prepareCache(cacheDirectory, limits.maxTotalBytes);
  const report = {
    ...registry, archiveStartedAt: new Date().toISOString(), archiveCompletedAt: null,
    safetyLimits: { ...limits, maxRedirects: HARD_REDIRECTS },
    totalBytes: 0, successCount: 0, failureCount: 0, sources: [],
  };
  for (const source of registry.sources) {
    let download;
    try {
      const result = await downloadPdf(source, limits, limits.maxTotalBytes - report.totalBytes, fetchImpl);
      const cacheFile = `${source.id}-${result.sha256}.pdf`;
      const file = join(cacheDirectory, cacheFile);
      const cached = await lstat(file).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
      if (cached) {
        if (cached.isSymbolicLink() || !cached.isFile() || cached.size !== result.bytes.length
            || createHash('sha256').update(await readFile(file)).digest('hex') !== result.sha256) fail('cache_sha256_mismatch');
      } else {
        if (diskBytes + result.bytes.length > limits.maxTotalBytes) fail('archive_byte_limit_exceeded');
        await writeFile(file, result.bytes, { flag: 'wx', mode: 0o600 });
        diskBytes += result.bytes.length;
      }
      download = {
        status: 'downloaded', originalUrl: source.url, finalUrl: result.finalUrl,
        sha256: result.sha256, byteLength: result.bytes.length, cacheFile,
        downloadedAt: new Date().toISOString(), contentType: result.contentType,
        redirectCount: result.redirectCount,
        validation: 'https_allowlist_pdf_magic_byte_limits_sha256',
        semanticReview: 'not_performed', rightsReview: 'pending',
      };
      report.totalBytes += result.bytes.length;
      report.successCount++;
    } catch (error) {
      download = { status: 'failed', attemptedAt: new Date().toISOString(), errorCode: errorCode(error) };
      report.failureCount++;
    }
    report.sources.push({ ...source, download });
    options.onRecord?.(report.sources.at(-1));
  }
  report.archiveCompletedAt = new Date().toISOString();
  return report;
}

async function main() {
  const args = process.argv.slice(2);
  const allowedFlags = new Set(['--registry', '--cache', '--report']);
  const selected = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!allowedFlags.has(args[i]) || !args[i + 1] || selected[args[i]]) fail('usage: --registry JSON --cache ABSOLUTE_DIRECTORY --report ABSOLUTE_JSON');
    selected[args[i]] = args[i + 1];
  }
  if (!selected['--registry'] || !selected['--cache'] || !selected['--report']) fail('registry_cache_report_required');
  const cacheDirectory = resolve(selected['--cache']);
  const relativeCache = relative(REPOSITORY_ROOT, cacheDirectory);
  if (!relativeCache || (!relativeCache.startsWith('..') && !isAbsolute(relativeCache))) fail('reference_cache_must_be_outside_repository');
  const reportPath = resolve(selected['--report']);
  if (dirname(reportPath) !== cacheDirectory || !reportPath.endsWith('.json')) fail('report_must_be_json_in_reference_cache');
  const input = JSON.parse(await readFile(resolve(selected['--registry']), 'utf8'));
  const report = await archiveSources(input, {
    cacheDirectory,
    onRecord: record => console.log(JSON.stringify({ id: record.id, ...record.download })),
  });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ reportPath, successCount: report.successCount, failureCount: report.failureCount, totalBytes: report.totalBytes }));
  if (report.failureCount) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
