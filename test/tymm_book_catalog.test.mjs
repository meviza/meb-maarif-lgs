import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, realpath, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const url = new URL('../tools/tymm_book_catalog.mjs', import.meta.url);
const toolPath = fileURLToPath(url);
const endpoint = 'https://tymm.meb.gov.tr/Kitap/GetDersKitaplariList';
async function api() {
  assert.ok(existsSync(url), 'TYMM bounded book discovery is not implemented');
  return import(url);
}
const book = (id, sinifId = 2) => ({
  id, title: `Ders kitabı ${id}`, detailPath: `/kitap/${id}/ders-kitabi-${id}`,
  imageUrl: `https://tymm.meb.gov.tr/upload/kitap-${id}.webp`,
  pdfUrl: `https://cdn.eba.gov.tr/kitap-${id}.pdf`, etkilesimliKitapUrl: `https://meb.ai/kitap${id}`,
  sinifId, dersId: 1, kademe: 2, renkGrubu: 0,
});
const page = (number, items, totalCount, hasMore, seed = 12345) => ({ items, page: number, pageSize: 20, totalCount, totalPages: Math.ceil(totalCount / 20), seed, hasMore });
function fetchPages(payloads, requests = []) {
  let index = 0;
  return async (requested, init) => {
    requests.push({ url: String(requested), init });
    assert.ok(index < payloads.length, 'the production walker requested an unadvertised page');
    return new Response(JSON.stringify(payloads[index++]), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } });
  };
}
function runCli(args, payload = page(1, [book(1)], 1, false), fetchPrelude = '') {
  const bootstrap = `let calls=0;globalThis.fetch=async()=>{calls++;${fetchPrelude}return new Response(${JSON.stringify(JSON.stringify(payload))},{status:200,headers:{'content-type':'application/json'}})};process.on('exit',()=>console.error('TYMM_TEST_FETCH_CALLS:'+calls));process.argv=[process.execPath,${JSON.stringify(toolPath)},...${JSON.stringify(args)}];await import(${JSON.stringify(url.href)});`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', bootstrap], { encoding: 'utf8', timeout: 4000 });
  return { ...result, fetchCalls: Number(/TYMM_TEST_FETCH_CALLS:([0-9]+)/u.exec(result.stderr)?.[1]), stderr: result.stderr.replace(/TYMM_TEST_FETCH_CALLS:[0-9]+\n/u, '') };
}

// Catches stopping after the first page or counting IDs 18/outside as a grade,
// while deliberately keeping catalog discovery distinct from download/approval.
test('contiguous pages use one seed and produce a grade-specific complete metadata inventory', async () => {
  const { discoverTymmBooks } = await api(); const requests = [];
  const report = await discoverTymmBooks({ fetchImpl: fetchPages([
    page(1, [...Array.from({ length: 18 }, (_, index) => book(index + 1, 3)), book(19, 2), book(20, 7)], 23, true),
    page(2, [book(21, 9), book(22, 18), book(23, 11)], 23, false),
  ], requests) });
  assert.equal(requests[0].url, `${endpoint}?page=1&kademe=temel-egitim`);
  assert.equal(requests[1].url, `${endpoint}?page=2&kademe=temel-egitim&seed=12345`);
  for (const request of requests) {
    assert.equal(request.init.method, 'GET'); assert.equal(request.init.redirect, 'manual');
    assert.equal(request.init.credentials, 'omit'); assert.ok(request.init.signal instanceof AbortSignal);
    assert.equal(request.init.headers.authorization, undefined);
  }
  assert.equal(report.catalogState, 'catalog_page_walk_complete');
  assert.equal(report.uniqueBookCount, 23); assert.equal(report.advertisedTotalCount, 23);
  assert.deepEqual(report.gradeDistribution, [1, 18, 0, 0, 0, 1, 0, 1].map((bookCount, index) => ({ grade: index + 1, bookCount })));
  assert.equal(report.inventory[19].grade, 6); assert.equal(report.inventory[20].grade, 8);
  assert.equal(report.outsideGradeItems.length, 2);
  assert.equal(report.outsideGradeItems[0].gradeStatus, 'elective_unassigned_grade');
  assert.equal(report.outsideGradeItems[1].gradeStatus, 'outside_requested_grade_range');
  assert.equal(report.catalogPageWalkComplete, true);
  assert.equal(report.fullCurriculumCoverageVerified, false); assert.equal(report.downloaded, false);
  assert.equal(report.reuseRights, 'unverified'); assert.equal(report.semanticReview, 'not_performed');
});

// Catches a changing randomized seed/total, skipped page, duplicate item or
// prematurely exhausted list being mistaken for exact advertised completeness.
test('unstable duplicate skipped and truncated page walks cannot claim completeness', async () => {
  const { discoverTymmBooks } = await api();
  const first = page(1, Array.from({ length: 20 }, (_, index) => book(index + 1)), 21, true);
  for (const bad of [
    page(3, [book(21)], 21, false), page(2, [book(21)], 22, false),
    page(2, [book(21)], 21, false, 54321), page(2, [book(1)], 21, false),
    page(2, [], 21, false), page(2, [book(21)], 21, true),
  ]) await assert.rejects(discoverTymmBooks({ fetchImpl: fetchPages([first, bad]) }), /catalog_(?:page|total|seed|duplicate|completeness|has_more)/u);
});

// Catches type coercion and a mismatched official-looking detail ID entering
// the catalog; the JSON is data only and never evaluated as site JavaScript.
test('schema types and detail IDs are checked before metadata enters the inventory', async () => {
  const { discoverTymmBooks } = await api();
  for (const mutate of [
    item => { item.id = '1'; }, item => { item.sinifId = '2'; }, item => { item.dersId = null; },
    item => { item.title = ''; }, item => { item.detailPath = '/kitap/999/other'; },
    item => { item.pdfUrl = 22; }, item => { item.unknownCredential = 'not-allowed'; },
  ]) {
    const item = book(1); mutate(item);
    await assert.rejects(discoverTymmBooks({ fetchImpl: fetchPages([page(1, [item], 1, false)]) }), /invalid_catalog_|catalog_detail_/u);
  }
  for (const mutate of [
    data => { data.hasMore = 'false'; }, data => { data.page = '1'; }, data => { data.seed = {}; },
    data => { data.totalCount = -1; }, data => { data.items = {}; }, data => { data.extra = true; },
  ]) {
    const data = page(1, [book(1)], 1, false); mutate(data);
    await assert.rejects(discoverTymmBooks({ fetchImpl: fetchPages([data]) }), /invalid_catalog_/u);
  }
});

// Catches external links/credential-bearing URLs and following meb.ai links or
// redirects during metadata-only discovery; blank optional media stays null.
test('only official HTTPS link hosts are cataloged and no link is followed', async () => {
  const { discoverTymmBooks } = await api();
  for (const unsafe of ['https://example.org/a.pdf', 'http://tymm.meb.gov.tr/a.pdf', 'https://tymm.meb.gov.tr.evil.org/a.pdf', 'https://user:pass@tymm.meb.gov.tr/a.pdf', 'javascript:alert(1)', 'https://tymm.meb.gov.tr:444/a.pdf']) {
    const item = book(1); item.pdfUrl = unsafe;
    await assert.rejects(discoverTymmBooks({ fetchImpl: fetchPages([page(1, [item], 1, false)]) }), /invalid_catalog_link/u);
  }
  const item = book(1); item.pdfUrl = ''; item.etkilesimliKitapUrl = null; item.imageUrl = '/upload/one.webp';
  const requests = [];
  const report = await discoverTymmBooks({ fetchImpl: fetchPages([page(1, [item], 1, false)], requests) });
  assert.equal(report.inventory[0].pdfUrl, null); assert.equal(report.inventory[0].etkilesimliKitapUrl, null);
  assert.equal(report.inventory[0].imageUrl, 'https://tymm.meb.gov.tr/upload/one.webp');
  assert.equal(requests.length, 1);
});

// Catches exceeding the bounded page/record budgets rather than silently
// returning the first chunk as if it covered all advertised titles.
test('page record and timeout options are bounded and budget exhaustion is explicit', async () => {
  const { discoverTymmBooks } = await api();
  for (const options of [{ maxPages: 21 }, { maxPages: 0 }, { maxRecords: 401 }, { maxRecords: 0 }, { timeoutMs: 15001 }, { timeoutMs: 0 }, { endpoint: 'https://example.org' }]) {
    let calls = 0;
    await assert.rejects(discoverTymmBooks({ ...options, fetchImpl: async () => { calls++; throw Error('must not fetch'); } }), /invalid_catalog_options/u);
    assert.equal(calls, 0);
  }
  await assert.rejects(discoverTymmBooks({ maxPages: 1, fetchImpl: fetchPages([page(1, Array.from({ length: 20 }, (_, index) => book(index + 1)), 21, true)]) }), /catalog_page_limit/u);
  await assert.rejects(discoverTymmBooks({ maxRecords: 1, fetchImpl: fetchPages([page(1, [book(1), book(2)], 2, false)]) }), /catalog_record_limit/u);
});

// Catches accepting a redirect/login HTML or reading a response beyond its
// stream limit, and ensures a never-resolving public request times out locally.
test('redirects wrong content oversized streams and hanging requests fail closed', async () => {
  const { discoverTymmBooks } = await api();
  for (const response of [new Response('', { status: 302, headers: { location: 'https://example.org' } }), new Response('<html>login</html>', { headers: { 'content-type': 'text/html' } }), new Response('{bad json', { headers: { 'content-type': 'application/json' } })]) {
    await assert.rejects(discoverTymmBooks({ fetchImpl: async () => response }), /catalog_(?:http|content_type|json)/u);
  }
  await assert.rejects(discoverTymmBooks({ fetchImpl: async () => new Response('x'.repeat(2 * 1024 * 1024 + 1), { headers: { 'content-type': 'application/json' } }) }), /catalog_body_limit/u);
  await assert.rejects(discoverTymmBooks({ timeoutMs: 20, fetchImpl: async () => new Promise(() => {}) }), /catalog_request_timeout/u);
});

// Catches writing into Git, following a symlink, overwriting an existing
// artifact or making a network request before invalid CLI/path arguments fail.
test('real CLI refuses unsafe outputs before discovery and preserves existing files', async () => {
  await api(); const dir = await realpath(await mkdtemp(join(tmpdir(), 'tymm-catalog-test-')));
  const existing = join(dir, 'existing.json'); await writeFile(existing, 'keep');
  for (const args of [['--out', existing], ['--out', 'relative.json'], ['--out', resolve(fileURLToPath(new URL('../', import.meta.url)), 'no-write-catalog.json')], ['--unknown'], ['--out', join(dir, 'one.json'), '--out', join(dir, 'two.json')]]) {
    const result = runCli(args); assert.equal(result.status, 1); assert.equal(result.stdout, ''); assert.equal(result.fetchCalls, 0);
  }
  assert.equal(await readFile(existing, 'utf8'), 'keep');
  const link = join(dir, 'linked'); await symlink(dir, link);
  const result = runCli(['--out', join(link, 'unsafe.json')]); assert.equal(result.status, 1); assert.equal(result.fetchCalls, 0);
  assert.equal(existsSync(join(dir, 'unsafe.json')), false);
});

// Catches metadata leaking through stdout or an artifact losing restricted
// permissions, and exercises the production CLI with a local fetch boundary.
test('real CLI emits stats only and writes a fresh private metadata JSON when requested', async () => {
  await api(); const dir = await realpath(await mkdtemp(join(tmpdir(), 'tymm-catalog-test-'))); const out = join(dir, 'inventory.json');
  const result = runCli(['--out', out]); assert.equal(result.status, 0, result.stderr);
  assert.equal(result.fetchCalls, 1);
  const stats = JSON.parse(result.stdout); assert.equal(stats.uniqueBookCount, 1); assert.equal(stats.downloaded, false);
  assert.equal(stats.inventory, undefined); assert.equal(stats.outPath, undefined);
  const artifact = JSON.parse(await readFile(out, 'utf8'));
  assert.equal(artifact.inventory.length, 1); assert.equal(artifact.inventory[0].title, 'Ders kitabı 1');
  assert.equal((await stat(out)).mode & 0o777, 0o600);
  const stdoutOnly = runCli([]); assert.equal(stdoutOnly.status, 0, stdoutOnly.stderr);
  assert.equal(JSON.parse(stdoutOnly.stdout).catalogPageWalkComplete, true);
});

// Catches serializing the real endpoint's null seed as "null" and thereby
// changing the server's page selection; null remains stable across the walk.
test('the live endpoint null-seed form walks sorted pages without adding a seed query', async () => {
  const { discoverTymmBooks } = await api(); const requests = [];
  const report = await discoverTymmBooks({ fetchImpl: fetchPages([
    page(1, Array.from({ length: 20 }, (_, index) => book(index + 1)), 21, true, null),
    page(2, [book(21, 9)], 21, false, null),
  ], requests) });
  assert.equal(requests[1].url, `${endpoint}?page=2&kademe=temel-egitim`);
  assert.equal(report.seed, null); assert.equal(report.uniqueBookCount, 21);
});

// Catches comma-containing keys impersonating two exact fields in a joined
// comparison, rather than being rejected at the schema's own-key boundary.
test('compound field names are rejected as unknown fields rather than aliasing two expected keys', async () => {
  const { discoverTymmBooks } = await api();
  const data = page(1, [book(1)], 1, false); delete data.page; delete data.pageSize; data['page,pageSize'] = 1;
  await assert.rejects(discoverTymmBooks({ fetchImpl: fetchPages([data]) }), { message: 'invalid_catalog_fields' });
  const item = book(1); delete item.imageUrl; delete item.kademe; item['imageUrl,kademe'] = 'not two fields';
  await assert.rejects(discoverTymmBooks({ fetchImpl: fetchPages([page(1, [item], 1, false)]) }), { message: 'invalid_catalog_fields' });
});

// Catches a zero-result catalog being inflated into curriculum completeness,
// or a legitimate totalPages=0 empty response being rejected as a skipped page.
test('an advertised empty catalog can be walked but never proves curriculum or downloads', async () => {
  const { discoverTymmBooks } = await api();
  const report = await discoverTymmBooks({ fetchImpl: fetchPages([page(1, [], 0, false, null)]) });
  assert.equal(report.catalogPageWalkComplete, true); assert.equal(report.uniqueBookCount, 0);
  assert.equal(report.advertisedTotalPages, 0); assert.deepEqual(report.inventory, []);
  assert.equal(report.fullCurriculumCoverageVerified, false); assert.equal(report.downloaded, false);
});

// Catches a parent replaced while the public page request is in flight;
// the output must be rechecked rather than writing through a newly added link.
test('a changed output parent is rejected again after discovery before writing an artifact', async () => {
  await api(); const dir = await realpath(await mkdtemp(join(tmpdir(), 'tymm-catalog-test-')));
  const parent = join(dir, 'parent'), other = join(dir, 'other'), parked = join(dir, 'parked');
  await mkdir(parent); await mkdir(other);
  const fetchPrelude = `const fs=await import('node:fs/promises');await fs.rename(${JSON.stringify(parent)},${JSON.stringify(parked)});await fs.symlink(${JSON.stringify(other)},${JSON.stringify(parent)});`;
  const result = runCli(['--out', join(parent, 'inventory.json')], page(1, [book(1)], 1, false), fetchPrelude);
  assert.equal(result.status, 1); assert.equal(result.fetchCalls, 1);
  assert.equal(existsSync(join(other, 'inventory.json')), false);
});

// Catches a URL-normalized dot segment dropping the book ID or emptying its
// slug after the raw metadata path has passed its initial route pattern.
for (const detailPath of ['/kitap/1/..', '/kitap/1/%2e%2e', '/kitap/1/.', '/kitap/1/%2E', '/kitap/1/.%2e', '/kitap/1/%2e.']) {
  test(`a normalized detail route escape is rejected: ${detailPath}`, async () => {
    const { discoverTymmBooks } = await api(); const item = book(1); item.detailPath = detailPath;
    await assert.rejects(discoverTymmBooks({ fetchImpl: fetchPages([page(1, [item], 1, false)]) }), { message: 'catalog_detail_id_mismatch' });
  });
}

// Catches over-fixing the route gate with raw string equality, which would
// reject valid Turkish Unicode when URL serialisation percent-encodes it.
test('legal literal and encoded Turkish slugs retain their exact book route after normalization', async () => {
  const { discoverTymmBooks } = await api();
  for (const { detailPath, expectedUrl } of [
    { detailPath: '/kitap/1/öğrenci-çalışma', expectedUrl: 'https://tymm.meb.gov.tr/kitap/1/%C3%B6%C4%9Frenci-%C3%A7al%C4%B1%C5%9Fma' },
    { detailPath: '/kitap/1/%C3%B6%C4%9Frenci-%C3%A7al%C4%B1%C5%9Fma', expectedUrl: 'https://tymm.meb.gov.tr/kitap/1/%C3%B6%C4%9Frenci-%C3%A7al%C4%B1%C5%9Fma' },
    { detailPath: '/kitap/1/çevre-%C3%B6l%C3%A7me', expectedUrl: 'https://tymm.meb.gov.tr/kitap/1/%C3%A7evre-%C3%B6l%C3%A7me' },
  ]) {
    const item = book(1); item.detailPath = detailPath;
    const report = await discoverTymmBooks({ fetchImpl: fetchPages([page(1, [item], 1, false)]) });
    assert.equal(report.inventory[0].detailPath, detailPath); assert.equal(report.inventory[0].detailUrl, expectedUrl);
  }
});
