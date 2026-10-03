import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, symlink, writeFile, stat, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const cli = fileURLToPath(new URL('../tools/build_reasoned_media_jobs.mjs', import.meta.url));
async function workspace(t) {
  // macOS /var is a symlink. Positive fixtures must use their canonical owned
  // path rather than weakening the production symlink refusal.
  const root = await realpath(await mkdtemp(join(tmpdir(), 'reasoned-media-jobs-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 15000 });

// Break caught: normal authoring bypasses the media-job/source-binding gate,
// silently treats an old WAV as new audio, or miscounts the concept lesson.
test('the real CLI creates linked question and separate lesson jobs without a live media claim', async t => {
  const root = await workspace(t), out = join(root, 'review');
  const child = run(['--out', out]);
  assert.equal(child.status, 0, child.stderr);
  const report = JSON.parse(await readFile(join(out, 'jobs.json'), 'utf8'));
  assert.equal(report.questionJobs.length, 7);
  assert.equal(report.conceptJobs.length, 1);
  assert.equal(report.providerCalls, 0);
  assert.equal(report.publicationReady, false);
  assert.equal(report.audioAttached, false);
  assert.equal(report.videoAttached, false);
  assert.equal(report.sources.length, 8);
  const traceHashes = new Set(report.traces.map(trace => trace.contentSha256));
  for (const job of [...report.questionJobs, ...report.conceptJobs]) {
    assert.ok(traceHashes.has(job.trace.contentSha256), 'job must bind an authored trace');
    assert.ok(job.cues.length >= 6, 'variable teaching phases cannot disappear');
  }
  const page = await readFile(join(out, 'index.html'), 'utf8');
  assert.doesNotMatch(page, /<(?:audio|video|iframe|script)\b/iu);
  assert.match(page, /Yeni ses veya video üretilmedi/u);
  const manifest = JSON.parse(await readFile(join(out, 'bundle-manifest.json'), 'utf8'));
  for (const file of manifest.files) {
    const bytes = await readFile(join(out, file.name));
    assert.equal(bytes.length, file.byteLength);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
  }
  assert.equal((await stat(out)).mode & 0o777, 0o700);
  assert.equal((await stat(join(out, 'jobs.json'))).mode & 0o777, 0o600);
});

// Break caught: an unattended run overwrites an existing review or writes
// through a symlink to another chat's/source directory.
test('existing outputs and symlink ancestors are refused without changing their files', async t => {
  const root = await workspace(t);
  await writeFile(join(root, 'sentinel.txt'), 'keep');
  const existing = run(['--out', root]);
  assert.notEqual(existing.status, 0);
  assert.match(existing.stderr, /^reasoned_media_jobs_request_rejected\n$/u);
  assert.equal(await readFile(join(root, 'sentinel.txt'), 'utf8'), 'keep');
  const target = join(root, 'target');
  await symlink(root, target);
  const linked = run(['--out', join(target, 'child')]);
  assert.notEqual(linked.status, 0);
  assert.match(linked.stderr, /^reasoned_media_jobs_request_rejected\n$/u);
  assert.deepEqual((await readdir(root)).sort(), ['sentinel.txt', 'target']);
});

// Break caught: a malformed scheduling argument begins output before it is
// validated or silently resolves a relative path to an unintended workspace.
test('invalid and duplicate CLI arguments fail before creating output', async t => {
  const root = await workspace(t), out = join(root, 'never-written');
  for (const args of [[], ['--out', 'relative'], ['--out', out, '--out', out], ['--out', out, '--paid'], ['--out', `${root}/../escape`]]) {
    const child = run(args);
    assert.notEqual(child.status, 0);
    assert.match(child.stderr, /^reasoned_media_jobs_request_rejected\n$/u);
  }
  assert.deepEqual(await readdir(root), []);
});
