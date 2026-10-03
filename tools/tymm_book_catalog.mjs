#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isProxy } from 'node:util/types';

const ENDPOINT = 'https://tymm.meb.gov.tr/Kitap/GetDersKitaplariList';
const BASE = 'https://tymm.meb.gov.tr';
const LINK_HOSTS = new Set(['tymm.meb.gov.tr', 'meb.ai', 'cdn.eba.gov.tr']);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = code => { throw new Error(code); };

function fields(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) fail('invalid_catalog_fields');
}
function integer(value, min = 0, max = 1_000_000_000) {
  if (!Number.isSafeInteger(value) || value < min || value > max) fail('invalid_catalog_number');
}
function text(value, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/u.test(value)) fail('invalid_catalog_text');
}
function optionsFor(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || isProxy(options)
      || ![Object.prototype, null].includes(Object.getPrototypeOf(options))) fail('invalid_catalog_options');
  const descriptors = Object.getOwnPropertyDescriptors(options), keys = Reflect.ownKeys(options);
  if (keys.some(key => typeof key !== 'string' || !['fetchImpl', 'timeoutMs', 'maxPages', 'maxRecords'].includes(key)
      || !Object.hasOwn(descriptors[key], 'value'))) fail('invalid_catalog_options');
  const get = (key, fallback) => Object.hasOwn(descriptors, key) ? descriptors[key].value : fallback;
  const limits = { timeoutMs: get('timeoutMs', 15000), maxPages: get('maxPages', 20), maxRecords: get('maxRecords', 400) };
  if (!Number.isSafeInteger(limits.timeoutMs) || limits.timeoutMs < 1 || limits.timeoutMs > 15000
      || !Number.isSafeInteger(limits.maxPages) || limits.maxPages < 1 || limits.maxPages > 20
      || !Number.isSafeInteger(limits.maxRecords) || limits.maxRecords < 1 || limits.maxRecords > 400) fail('invalid_catalog_options');
  const fetchImpl = get('fetchImpl', globalThis.fetch);
  if (typeof fetchImpl !== 'function') fail('invalid_catalog_options');
  return { ...limits, fetchImpl };
}

function officialLink(value) {
  if (value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 2048 || value.trim() !== value || /[\u0000-\u0020\u007f\\]/u.test(value)) fail('invalid_catalog_link');
  let parsed;
  try { parsed = new URL(value, BASE); } catch { fail('invalid_catalog_link'); }
  if (parsed.protocol !== 'https:' || !LINK_HOSTS.has(parsed.hostname) || parsed.username || parsed.password || parsed.port || parsed.hash) fail('invalid_catalog_link');
  return parsed.href;
}
function bookRecord(item) {
  fields(item, ['id', 'title', 'detailPath', 'imageUrl', 'pdfUrl', 'etkilesimliKitapUrl', 'sinifId', 'dersId', 'kademe', 'renkGrubu']);
  integer(item.id, 1); integer(item.sinifId); integer(item.dersId, 1); integer(item.kademe); integer(item.renkGrubu);
  if (item.kademe !== 2) fail('invalid_catalog_kademe');
  text(item.title, 512); text(item.detailPath, 2048);
  const detailRoute = /^\/kitap\/([1-9][0-9]*)\/[^/?#\\]+$/u;
  const detail = detailRoute.exec(item.detailPath);
  if (!detail || detail[1] !== String(item.id) || /%2f|%5c|%00/iu.test(item.detailPath)) fail('catalog_detail_id_mismatch');
  const detailUrl = officialLink(item.detailPath);
  const normalizedPath = new URL(detailUrl).pathname, normalizedRoute = detailRoute.exec(normalizedPath);
  let sourcePath, preservedPath;
  // URL serialization may encode valid Turkish Unicode; that is not a route
  // change. Dot-segment removal must never erase the original ID or slug.
  try { sourcePath = decodeURI(item.detailPath); preservedPath = decodeURI(normalizedPath); }
  catch { fail('catalog_detail_id_mismatch'); }
  if (sourcePath !== preservedPath || !normalizedRoute || normalizedRoute[1] !== String(item.id)) fail('catalog_detail_id_mismatch');
  const grade = item.sinifId >= 2 && item.sinifId <= 9 ? item.sinifId - 1 : null;
  return { ...item, detailUrl, imageUrl: officialLink(item.imageUrl), pdfUrl: officialLink(item.pdfUrl),
    etkilesimliKitapUrl: officialLink(item.etkilesimliKitapUrl), grade,
    gradeStatus: grade !== null ? 'requested_grade' : item.sinifId === 18 ? 'elective_unassigned_grade' : 'outside_requested_grade_range' };
}
function pageMetadata(data) {
  fields(data, ['items', 'page', 'pageSize', 'totalCount', 'totalPages', 'seed', 'hasMore']);
  integer(data.page, 1, 20); integer(data.pageSize, 1, 400); integer(data.totalCount); integer(data.totalPages, 0, 1_000_000_000);
  if (data.seed !== null) integer(data.seed);
  if (!Array.isArray(data.items) || data.items.length > 400 || typeof data.hasMore !== 'boolean') fail('invalid_catalog_page');
  if (data.totalPages !== Math.ceil(data.totalCount / data.pageSize) || data.items.length > data.pageSize) fail('catalog_page_metadata_mismatch');
  return data;
}

async function requestPage(requestUrl, { fetchImpl, timeoutMs }) {
  const controller = new AbortController(); let timeout;
  const timedOut = new Promise((_, reject) => {
    timeout = setTimeout(() => { controller.abort(); reject(new Error('catalog_request_timeout')); }, timeoutMs);
  });
  const run = async () => {
    const response = await fetchImpl(requestUrl, { method: 'GET', redirect: 'manual', credentials: 'omit',
      referrerPolicy: 'no-referrer', headers: { accept: 'application/json' }, signal: controller.signal });
    if (response.status !== 200 || response.redirected || (response.url && response.url !== requestUrl)) {
      await response.body?.cancel(); fail('catalog_http_response_rejected');
    }
    const type = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
    if (type !== 'application/json') { await response.body?.cancel(); fail('catalog_content_type_required'); }
    const declaredLength = response.headers.get('content-length');
    if (declaredLength !== null && (!/^[0-9]+$/u.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) {
      await response.body?.cancel(); fail('catalog_body_limit_exceeded');
    }
    if (!response.body) fail('catalog_json_body_required');
    const reader = response.body.getReader(); const chunks = []; let byteLength = 0;
    try {
      for (;;) {
        const chunk = await reader.read(); if (chunk.done) break;
        if (!(chunk.value instanceof Uint8Array)) fail('catalog_json_body_required');
        byteLength += chunk.value.byteLength;
        if (byteLength > MAX_BODY_BYTES) fail('catalog_body_limit_exceeded');
        chunks.push(Buffer.from(chunk.value));
      }
    } catch (error) { await reader.cancel().catch(() => {}); throw error; }
    finally { reader.releaseLock(); }
    const bytes = Buffer.concat(chunks, byteLength); let data;
    try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { fail('catalog_json_invalid'); }
    return { data, byteLength, responseSha256: sha(bytes) };
  };
  try { return await Promise.race([run(), timedOut]); }
  catch (error) {
    if (controller.signal.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError') fail('catalog_request_timeout');
    if (/^catalog_[a-z_]+$/u.test(error?.message ?? '')) throw error;
    fail('catalog_request_failed');
  } finally { clearTimeout(timeout); }
}

/** Public metadata discovery only; no textbook download, auth or site JS execution. */
export async function discoverTymmBooks(options = {}) {
  const limits = optionsFor(options); const inventory = [], pages = [], seen = new Set(); let initial = null;
  for (let page = 1; page <= limits.maxPages; page++) {
    const requestUrl = new URL(ENDPOINT); requestUrl.searchParams.set('page', String(page));
    requestUrl.searchParams.set('kademe', 'temel-egitim');
    if (initial?.seed !== null && initial?.seed !== undefined) requestUrl.searchParams.set('seed', String(initial.seed));
    const response = await requestPage(requestUrl.href, limits), metadata = pageMetadata(response.data);
    if (metadata.page !== page) fail('catalog_page_mismatch');
    if (initial === null) initial = { totalCount: metadata.totalCount, totalPages: metadata.totalPages, pageSize: metadata.pageSize, seed: metadata.seed };
    if (metadata.totalCount !== initial.totalCount || metadata.totalPages !== initial.totalPages) fail('catalog_total_mismatch');
    if (metadata.pageSize !== initial.pageSize) fail('catalog_page_metadata_mismatch');
    if (metadata.seed !== initial.seed) fail('catalog_seed_mismatch');
    if (metadata.totalCount > limits.maxRecords || inventory.length + metadata.items.length > limits.maxRecords) fail('catalog_record_limit_exceeded');
    if (metadata.totalPages > limits.maxPages) fail('catalog_page_limit_exceeded');
    if (metadata.hasMore !== (page < metadata.totalPages)) fail('catalog_has_more_mismatch');
    for (const item of metadata.items) {
      const record = bookRecord(item); if (seen.has(record.id)) fail('catalog_duplicate_id');
      seen.add(record.id); inventory.push(record);
    }
    pages.push({ page, itemCount: metadata.items.length, byteLength: response.byteLength, responseSha256: response.responseSha256 });
    if (!metadata.hasMore) {
      if (inventory.length !== initial.totalCount || (initial.totalPages > 0 && page !== initial.totalPages)) fail('catalog_completeness_mismatch');
      const report = {
        schemaVersion: 'tymm-book-catalog/v1', observedAt: new Date().toISOString(), endpoint: ENDPOINT, kademe: 'temel-egitim',
        catalogState: 'catalog_page_walk_complete', catalogPageWalkComplete: true, advertisedTotalCount: initial.totalCount,
        advertisedTotalPages: initial.totalPages, pageSize: initial.pageSize, seed: initial.seed, uniqueBookCount: inventory.length,
        pages, inventory, gradeDistribution: Array.from({ length: 8 }, (_, index) => ({ grade: index + 1, bookCount: inventory.filter(item => item.grade === index + 1).length })),
        outsideGradeItems: inventory.filter(item => item.grade === null), downloaded: false, fullCurriculumCoverageVerified: false,
        semanticReview: 'not_performed', reuseRights: 'unverified', usagePolicy: 'reference_only', publicationReady: false,
        safetyLimits: { maxPages: limits.maxPages, maxRecords: limits.maxRecords, timeoutMs: limits.timeoutMs, maxBodyBytes: MAX_BODY_BYTES, redirectsFollowed: 0 },
      };
      report.contentSha256 = sha(JSON.stringify(report)); return report;
    }
  }
  fail('catalog_page_limit_exceeded');
}

async function freshOutput(argv) {
  if (argv.length === 0) return null;
  if (argv.length !== 2 || argv[0] !== '--out') fail('catalog_cli_arguments_rejected');
  const raw = argv[1];
  if (typeof raw !== 'string' || !isAbsolute(raw) || raw.length > 4096 || !raw.endsWith('.json') || /[\u0000-\u001f\u007f]/u.test(raw)) fail('catalog_output_path_rejected');
  const parts = raw.slice(parse(raw).root.length).split(sep);
  if (!parts.length || parts.length > 128 || parts.some(part => !part || part === '.' || part === '..')) fail('catalog_output_path_rejected');
  const target = resolve(raw), repositoryRelative = relative(REPOSITORY_ROOT, target);
  if (!repositoryRelative || (!repositoryRelative.startsWith('..' + sep) && !isAbsolute(repositoryRelative))) fail('catalog_output_must_be_outside_repository');
  let current = parse(raw).root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part); let info;
    try { info = await lstat(current); } catch (error) {
      if (error.code !== 'ENOENT' || index !== parts.length - 1) fail('catalog_output_path_rejected');
      continue;
    }
    if (info.isSymbolicLink() || !info.isDirectory() || index === parts.length - 1) fail('catalog_output_path_rejected');
  }
  return target;
}

async function main() {
  const out = await freshOutput(process.argv.slice(2)); const report = await discoverTymmBooks();
  if (out !== null) {
    // Requests take time: reject an output or ancestor changed during the walk.
    // This is not an openat-style guarantee against hostile concurrent races.
    await freshOutput(process.argv.slice(2));
    await writeFile(out, JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  }
  console.log(JSON.stringify({ schemaVersion: report.schemaVersion, catalogState: report.catalogState,
    catalogPageWalkComplete: report.catalogPageWalkComplete, uniqueBookCount: report.uniqueBookCount,
    advertisedTotalCount: report.advertisedTotalCount, pages: report.pages.length, gradeDistribution: report.gradeDistribution,
    outsideGradeCount: report.outsideGradeItems.length, downloaded: false, fullCurriculumCoverageVerified: false,
    reuseRights: 'unverified', contentSha256: report.contentSha256 }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(/^(?:catalog|invalid_catalog)_[a-z_]+$/u.test(error?.message ?? '') ? error.message : 'catalog_request_rejected');
    process.exitCode = 1;
  });
}
