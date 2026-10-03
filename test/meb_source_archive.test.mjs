import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const archive = await import('../tools/meb_source_archive.mjs').catch(() => null);
const pdf = Buffer.from('%PDF-1.4\nminimal test fixture\n%%EOF\n');
const url = 'https://karabukodm.meb.gov.tr/meb_iys_dosyalar/2025_07/example.pdf';
const source = (id = 'lgs-2024-numerical') => ({
  id, title: '2024 LGS sayısal', kind: 'lgs_exam', year: 2024,
  sourcePage: 'https://karabukodm.meb.gov.tr/www/lgs-yayimlanmis-sorular/icerik/213',
  url, reuseRights: 'unverified', usagePolicy: 'reference_only',
});
const registry = (...sources) => ({ schemaVersion: '1.0.0', sources });
async function withCache(action) {
  const directory = await mkdtemp(join(tmpdir(), 'k12-meb-archive-test-'));
  try { return await action(directory); }
  finally { await rm(directory, { recursive: true, force: true }); }
}
function implementation() {
  assert.ok(archive, 'The bounded MEB archive implementation is missing');
  return archive;
}

test('official URL boundary rejects lookalikes, credentials, insecure and unusual-port URLs', () => {
  const { validateOfficialMebUrl } = implementation();
  assert.equal(validateOfficialMebUrl(url).href, url);
  for (const invalid of [
    'http://tymm.meb.gov.tr/program.pdf',
    'https://tymm.meb.gov.tr.evil.example/program.pdf',
    'https://evil-meb.gov.tr/program.pdf',
    'https://user:password@tymm.meb.gov.tr/program.pdf',
    'https://tymm.meb.gov.tr:8443/program.pdf',
    'https://tymm.meb.gov.tr/program.pdf#payload',
    'https://127.0.0.1/program.pdf',
    'file:///etc/passwd',
  ]) assert.throws(() => validateOfficialMebUrl(invalid), /official_https_url_required/);
});

test('archive saves verified PDF bytes outside source registry and preserves unverified rights', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const report = await archiveSources(registry(source()), {
      cacheDirectory, fetchImpl: async () => new Response(pdf, { headers: { 'content-type': 'application/pdf' } }),
    });
    assert.equal(report.successCount, 1);
    assert.equal(report.failureCount, 0);
    assert.equal(report.totalBytes, pdf.length);
    const record = report.sources[0];
    assert.equal(record.reuseRights, 'unverified');
    assert.equal(record.usagePolicy, 'reference_only');
    assert.equal(record.download.status, 'downloaded');
    assert.equal(record.download.sha256, createHash('sha256').update(pdf).digest('hex'));
    assert.deepEqual(await readFile(join(cacheDirectory, record.download.cacheFile)), pdf);
    assert.equal(record.download.originalUrl, url);
    assert.equal(record.download.finalUrl, url);
    assert.equal(report.sources[0].download.byteLength, pdf.length);
  });
});

test('external redirect is blocked before any request is made to external host', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const requests = [];
    const report = await archiveSources(registry(source()), {
      cacheDirectory, fetchImpl: async (requested, options) => {
        requests.push(requested);
        assert.equal(options.redirect, 'manual');
        return new Response(null, { status: 302, headers: { location: 'https://evil.example/file.pdf' } });
      },
    });
    assert.deepEqual(requests, [url]);
    assert.equal(report.sources[0].download.errorCode, 'official_https_url_required');
    assert.deepEqual(await readdir(cacheDirectory), []);
  });
});

test('official relative redirect is followed with bounded manual fetch', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const requests = [];
    const report = await archiveSources(registry(source()), {
      cacheDirectory, fetchImpl: async requested => {
        requests.push(requested);
        return requests.length === 1
          ? new Response(null, { status: 302, headers: { location: '/official-replacement.pdf' } })
          : new Response(pdf, { headers: { 'content-type': 'application/pdf' } });
      },
    });
    assert.deepEqual(requests, [url, 'https://karabukodm.meb.gov.tr/official-replacement.pdf']);
    assert.equal(report.sources[0].download.finalUrl, requests[1]);
    assert.equal(report.sources[0].download.redirectCount, 1);
  });
});

test('redirect loop stops at hard redirect limit and leaves no partial file', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    let calls = 0;
    const report = await archiveSources(registry(source()), {
      cacheDirectory, fetchImpl: async () => {
        calls++;
        return new Response(null, { status: 301, headers: { location: url } });
      },
    });
    assert.equal(calls, 4);
    assert.equal(report.sources[0].download.errorCode, 'redirect_limit_exceeded');
    assert.deepEqual(await readdir(cacheDirectory), []);
  });
});

test('HTML and PDF-labelled non-PDF responses cannot become downloaded records', async () => {
  const { archiveSources } = implementation();
  for (const contentType of ['text/html', 'application/pdf']) {
    await withCache(async cacheDirectory => {
      const report = await archiveSources(registry(source()), {
        cacheDirectory,
        fetchImpl: async () => new Response('<html>access denied</html>', { headers: { 'content-type': contentType } }),
      });
      assert.equal(report.successCount, 0);
      assert.equal(report.sources[0].download.errorCode, contentType === 'text/html' ? 'pdf_content_type_required' : 'pdf_magic_required');
      assert.deepEqual(await readdir(cacheDirectory), []);
    });
  }
});

test('HTTP errors are recorded as failures rather than fake archived content', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const report = await archiveSources(registry(source()), {
      cacheDirectory, fetchImpl: async () => new Response('denied', { status: 403 }),
    });
    assert.equal(report.sources[0].download.errorCode, 'http_403');
    assert.equal(report.failureCount, 1);
    assert.equal(report.totalBytes, 0);
  });
});

test('declared length cannot exceed individual file limit', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const report = await archiveSources(registry(source()), {
      cacheDirectory, maxFileBytes: 64,
      fetchImpl: async () => new Response(pdf, { headers: { 'content-type': 'application/pdf', 'content-length': '65' } }),
    });
    assert.equal(report.sources[0].download.errorCode, 'file_byte_limit_exceeded');
    assert.deepEqual(await readdir(cacheDirectory), []);
  });
});

test('streamed bytes are bounded even when content-length header is absent or false', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const report = await archiveSources(registry(source()), {
      cacheDirectory, maxFileBytes: 12,
      fetchImpl: async () => new Response(pdf, { headers: { 'content-type': 'application/pdf', 'content-length': '1' } }),
    });
    assert.equal(report.sources[0].download.errorCode, 'file_byte_limit_exceeded');
    assert.deepEqual(await readdir(cacheDirectory), []);
  });
});

test('archive total bound applies across files and does not persist over-budget second file', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const report = await archiveSources(registry(source('first'), source('second')), {
      cacheDirectory, maxTotalBytes: pdf.length + 3,
      fetchImpl: async () => new Response(pdf, { headers: { 'content-type': 'application/pdf' } }),
    });
    assert.equal(report.successCount, 1);
    assert.equal(report.failureCount, 1);
    assert.equal(report.totalBytes, pdf.length);
    assert.equal(report.sources[1].download.errorCode, 'archive_byte_limit_exceeded');
    assert.equal((await readdir(cacheDirectory)).length, 1);
  });
});

test('previously pinned PDF hash rejects remotely changed bytes', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    const pinned = { ...source(), expectedSha256: '0'.repeat(64) };
    const report = await archiveSources(registry(pinned), {
      cacheDirectory, fetchImpl: async () => new Response(pdf, { headers: { 'content-type': 'application/pdf' } }),
    });
    assert.equal(report.sources[0].download.errorCode, 'source_sha256_mismatch');
    assert.deepEqual(await readdir(cacheDirectory), []);
  });
});

test('unsafe source identifiers and duplicate identifiers fail before network or filesystem work', async () => {
  const { archiveSources } = implementation();
  let calls = 0;
  for (const input of [registry(source('../../escape')), registry(source(), source())]) {
    await withCache(async cacheDirectory => {
      await assert.rejects(() => archiveSources(input, {
        cacheDirectory, fetchImpl: async () => { calls++; return new Response(pdf); },
      }), /invalid_source_registry/);
      assert.deepEqual(await readdir(cacheDirectory), []);
    });
  }
  assert.equal(calls, 0);
});

test('caller cannot elevate fixed safety limits or clear reference-only rights boundary', async () => {
  const { archiveSources } = implementation();
  await withCache(async cacheDirectory => {
    await assert.rejects(() => archiveSources(registry(source()), {
      cacheDirectory, maxTotalBytes: 251 * 1024 * 1024,
    }), /invalid_archive_limits/);
    await assert.rejects(() => archiveSources(registry({ ...source(), usagePolicy: 'commercial_reuse' }), {
      cacheDirectory,
    }), /invalid_source_registry/);
  });
});

test('symlink cache directory is rejected instead of writing through into another location', async () => {
  const { archiveSources } = implementation();
  await withCache(async directory => {
    const target = join(directory, 'real');
    const link = join(directory, 'linked');
    await symlink(target, link);
    await assert.rejects(() => archiveSources(registry(source()), { cacheDirectory: link }), /unsafe_cache_directory/);
  });
});
