import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, readdir, writeFile, mkdir, symlink, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const mod = await import('../tools/clef_teaching_pilot.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const cli = fileURLToPath(new URL('../tools/clef_teaching_pilot.mjs', import.meta.url));
const bundledSharp = '/Users/keremcelik/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/package.json';
const selectedSharp = process.env.K12_INK_SHARP_PACKAGE ?? (existsSync(bundledSharp) ? bundledSharp : null);
const nativeSharpAvailable = typeof selectedSharp === 'string' && existsSync(selectedSharp);
const sharpPackage = nativeSharpAvailable ? selectedSharp : '/unavailable/node_modules/sharp/package.json';
// An explicit override never silently falls back. SKIP means native raster
// generation, canonical-byte binding and provider vision boundaries were not run.
// Arguments, budgets and fresh-path guards still run without a native runtime.
const native = { skip: nativeSharpAvailable ? false : 'trusted Sharp unavailable; set K12_INK_SHARP_PACKAGE to an existing package.json' };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const testEnv = { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'test-only-not-a-real-key' };
function runFunction() { assert.equal(typeof mod.runClefTeachingPilot, 'function', 'runClefTeachingPilot is not implemented'); return mod.runClefTeachingPilot; }
function spawn(args) {
  runFunction();
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 15000, env: { PATH: process.env.PATH } });
}
async function fixture(t) {
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'clef-teaching-test-')));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
function prepareArgs(out) { return ['--prepare', '--out', out, '--sharp-package', sharpPackage]; }
function evaluateArgs(prepared, out, budget = '0.01') { return ['--evaluate', '--prepared', prepared, '--out', out, '--review-record-id', 'local-visual-review-1', '--max-estimated-usd', budget, '--sharp-package', sharpPackage]; }
async function preparedFixture(t) {
  const dir = await fixture(t), prepared = join(dir, 'prepared');
  const result = spawn(prepareArgs(prepared));
  assert.equal(result.status, 0, result.stderr);
  return { dir, prepared };
}

// Catches missing rasterization, wrong garden/source binding, byte digests or false approval.
test('the real prepare CLI writes an owned 1280 by 720 PNG bound to the 172 metre garden draft', native, async t => {
  const { prepared } = await preparedFixture(t);
  assert.deepEqual((await readdir(prepared)).sort(), ['prepared.json', 'question.json', 'question.png']);
  const questionBytes = await readFile(join(prepared, 'question.json'));
  const question = JSON.parse(questionBytes), manifest = JSON.parse(await readFile(join(prepared, 'prepared.json')));
  const png = await readFile(join(prepared, 'question.png'));
  assert.equal(question.id, 'garden-two-rows-editor-v1');
  assert.equal(question.options[question.answerIndex], 172);
  assert.deepEqual(question.solutionGraph.map(step => step.value), [27, 90, 86, 172]);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1280);
  assert.equal(png.readUInt32BE(20), 720);
  assert.equal(manifest.question.sha256, digest(questionBytes));
  assert.equal(manifest.png.sha256, digest(png));
  assert.equal(manifest.png.byteLength, png.length);
  assert.equal(manifest.sourceContentSha256, question.contentSha256);
  assert.equal(manifest.sourceVisualSha256, question.visual.sha256);
  assert.equal(manifest.rightsStatus, 'owned_original');
  assert.equal(manifest.expertReview, 'pending');
  assert.equal(manifest.publishReady, false);
  assert.equal(manifest.networkRequests, 0);
});

// Catches unknown/duplicate switches, missing consent mode and implicit relative writes.
test('the real CLI rejects bad arguments before creating output files', async t => {
  const dir = await fixture(t);
  for (const args of [[], ['--prepare', '--out', 'relative', '--sharp-package', sharpPackage], ['--prepare', '--out', join(dir, 'new'), '--out', join(dir, 'other')], ['--prepare', '--out', join(dir, 'new'), '--sharp-package', '/untrusted/other/package.json'], ['--evaluate', '--prepared', dir, '--out', join(dir, 'new'), '--review-record-id', 'approved<script>', '--max-estimated-usd', '0.01']]) {
    const result = spawn(args);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /invalid_arguments|invalid_path|invalid_sharp_package|invalid_review_record/u);
  }
  assert.deepEqual(await readdir(dir), []);
});

// Catches overwriting an existing output and following a symlink ancestor.
test('prepare refuses existing outputs and symlinks without changing their bytes', async t => {
  const dir = await fixture(t), existing = join(dir, 'existing'), link = join(dir, 'link');
  await mkdir(existing); await writeFile(join(existing, 'keep.txt'), 'keep'); await symlink(existing, link);
  for (const out of [existing, link, join(link, 'new')]) {
    const result = spawn(prepareArgs(out));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /output_directory_must_be_fresh|symlink_path_not_allowed/u);
  }
  assert.equal(await readFile(join(existing, 'keep.txt'), 'utf8'), 'keep');
  assert.deepEqual(await readdir(existing), ['keep.txt']);
});

// Literal cost fixture: 65,536 × $0.09 / 1,000,000 = $0.00589824.
test('budgets below the planning estimate or above one cent fail before any transport', async t => {
  const dir = await fixture(t); let calls = 0;
  for (const budget of ['0.005', '0.0101', 'NaN', '-1']) {
    await assert.rejects(runFunction()(evaluateArgs(join(dir, 'absent'), join(dir, 'out'), budget), { env: testEnv, fetchImpl: async () => { calls++; } }), /invalid_budget/u);
  }
  assert.equal(calls, 0);
  assert.deepEqual(await readdir(dir), []);
});

test('the real evaluate CLI with sanitized missing credentials fails before an output or request', native, async t => {
  const { dir, prepared } = await preparedFixture(t);
  const result = spawn(evaluateArgs(prepared, join(dir, 'result')));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /model_not_configured/u);
  assert.deepEqual(await readdir(dir), ['prepared']);
});

test('evaluate requires the explicit trusted Sharp package before any credentials check', async t => {
  const dir = await fixture(t), prepared = join(dir, 'absent');
  const args = ['--evaluate', '--prepared', prepared, '--out', join(dir, 'result'), '--review-record-id', 'local-visual-review-1', '--max-estimated-usd', '0.01'];
  assert.match(spawn(args).stderr, /invalid_arguments/u);
  assert.match(spawn([...args, '--sharp-package', '/untrusted/other/package.json']).stderr, /invalid_sharp_package/u);
  assert.deepEqual(await readdir(dir), []);
});

// Catches stale digest acceptance and a manifest rewritten to bless a changed question.
test('changed PNG or changed source question fails before controlled transport', native, async t => {
  const { dir, prepared } = await preparedFixture(t); let calls = 0;
  const options = { env: testEnv, fetchImpl: async () => { calls++; } };
  const pngPath = join(prepared, 'question.png'), png = await readFile(pngPath);
  const changed = Buffer.from(png); changed[changed.length - 1] ^= 1; await writeFile(pngPath, changed);
  await assert.rejects(runFunction()(evaluateArgs(prepared, join(dir, 'png-result')), options), /prepared_integrity_failed/u);
  await writeFile(pngPath, png);
  const questionPath = join(prepared, 'question.json'), question = JSON.parse(await readFile(questionPath));
  question.metadata.source.studentName = 'private-student';
  const bytes = Buffer.from(JSON.stringify(question)), manifest = JSON.parse(await readFile(join(prepared, 'prepared.json')));
  manifest.question.sha256 = digest(bytes); manifest.question.byteLength = bytes.length;
  await writeFile(questionPath, bytes); await writeFile(join(prepared, 'prepared.json'), JSON.stringify(manifest));
  await assert.rejects(runFunction()(evaluateArgs(prepared, join(dir, 'source-result')), options), /prepared_integrity_failed/u);
  assert.equal(calls, 0);
});

// A caller's rewritten manifest is not evidence that the PNG belongs to our SVG.
test('a valid unrelated PNG with refreshed manifest hashes fails before transport', native, async t => {
  const { dir, prepared } = await preparedFixture(t); let calls = 0;
  const sharp = createRequire(sharpPackage)('sharp');
  const unrelated = await sharp({ create: { width: 1280, height: 720, channels: 3, background: '#112233' } }).png().toBuffer();
  const manifest = JSON.parse(await readFile(join(prepared, 'prepared.json')));
  manifest.png.sha256 = digest(unrelated); manifest.png.byteLength = unrelated.length;
  await writeFile(join(prepared, 'question.png'), unrelated);
  await writeFile(join(prepared, 'prepared.json'), JSON.stringify(manifest));
  const result = await runFunction()(evaluateArgs(prepared, join(dir, 'result')), { env: testEnv, fetchImpl: async () => {
    calls++; return { ok: false, status: 500 };
  } }).catch(error => error);
  assert.equal(result.publicCode ?? result.status, 'canonical_raster_mismatch');
  assert.equal(calls, 0);
  assert.deepEqual(await readdir(dir), ['prepared']);
});

test('symlink prepared files are rejected before transport', native, async t => {
  const { dir, prepared } = await preparedFixture(t); let calls = 0;
  const bytes = await readFile(join(prepared, 'question.png'));
  await writeFile(join(dir, 'external.png'), bytes);
  await rm(join(prepared, 'question.png')); await symlink(join(dir, 'external.png'), join(prepared, 'question.png'));
  await assert.rejects(runFunction()(evaluateArgs(prepared, join(dir, 'result')), { env: testEnv, fetchImpl: async () => { calls++; } }), /symlink_path_not_allowed/u);
  assert.equal(calls, 0);
});

// Real adapter, controlled transport: this proves the boundary, never a live provider success.
test('one controlled request uses the official typed vision schema and writes only advisory audit data', native, async t => {
  const { dir, prepared } = await preparedFixture(t); let calls = 0, bodyText, transportOptions;
  const out = join(dir, 'result');
  const result = await runFunction()(evaluateArgs(prepared, out), { env: testEnv, fetchImpl: async (url, options) => {
    calls++; bodyText = options.body; transportOptions = options;
    assert.match(url, /\/ai\/run\/@cf\/cloudflare\/clef-flash$/u);
    const body = JSON.parse(bodyText);
    assert.equal(body.model, 'clef-flash');
    assert.equal(body.images.length, 1);
    assert.equal(body.images[0].content_type, 'image/png');
    const png = Buffer.from(body.images[0].base64, 'base64');
    assert.equal(png.readUInt32BE(16), 1280); assert.equal(png.readUInt32BE(20), 720);
    assert.deepEqual(Object.keys(body.questions).sort(), ['ambiguous', 'answer_supported', 'diagram_aligned']);
    assert.ok(Object.values(body.questions).every(value => value.type === 'noul'));
    return { ok: true, json: async () => ({ success: true, result: { model: 'clef-flash', answers: { ambiguous: { type: 'noul', noul: 0.1 }, answer_supported: { type: 'noul', noul: 0.9 }, diagram_aligned: { type: 'noul', noul: 0.8 } }, usage: { input_tokens: 100, output_tokens: 3 } } }) };
  } });
  assert.equal(calls, 1);
  assert.equal(transportOptions.redirect, 'error', 'HTTP redirects must not create another physical request');
  const reportBytes = await readFile(join(out, 'report.json'), 'utf8'), report = JSON.parse(reportBytes);
  assert.deepEqual(report, result);
  assert.equal(report.status, 'advisory_only');
  assert.equal(report.calibrationStatus, 'not_calibrated');
  assert.equal(report.publishReady, false);
  assert.equal(report.trustedHumanReview, 'pending');
  assert.equal(report.reviewRecord.expertApproval, false);
  assert.equal(report.request.networkRequests, 1);
  assert.equal(report.request.maxNetworkRequests, 1);
  assert.equal(report.request.sha256, digest(bodyText));
  assert.equal(report.usageSha256, digest(JSON.stringify({ input_tokens: 100, output_tokens: 3 })));
  assert.equal(report.pricing.priceDate, '2026-10-03');
  assert.equal(report.pricing.planningUpperEstimateUsd, 0.00589824);
  assert.equal(report.pricing.isBillingCap, false);
  assert.equal(reportBytes.includes(testEnv.CLOUDFLARE_AUTH_TOKEN), false);
  assert.equal(reportBytes.includes(testEnv.CLOUDFLARE_ACCOUNT_ID), false);
  assert.deepEqual(await readdir(out), ['report.json']);
});

test('provider failure is typed, makes one attempt and never persists upstream secret-bearing text', native, async t => {
  const { dir, prepared } = await preparedFixture(t); let calls = 0, textReads = 0;
  const report = await runFunction()(evaluateArgs(prepared, join(dir, 'result')), { env: testEnv, fetchImpl: async () => {
    calls++; return { ok: false, status: 401, text: async () => { textReads++; return 'secret ' + testEnv.CLOUDFLARE_AUTH_TOKEN; } };
  } });
  assert.equal(report.status, 'provider_error');
  assert.equal(report.httpStatus, 401);
  assert.equal(report.publishReady, false);
  assert.equal(report.request.networkRequests, 1);
  assert.equal(report.usageSha256, null);
  assert.equal(calls, 1); assert.equal(textReads, 0);
  assert.equal(JSON.stringify(report).includes(testEnv.CLOUDFLARE_AUTH_TOKEN), false);
});

test('an existing evaluation output fails before the controlled provider is invoked', async t => {
  const dir = await fixture(t), prepared = join(dir, 'absent'), out = join(dir, 'existing'); let calls = 0;
  await mkdir(out);
  await assert.rejects(runFunction()(evaluateArgs(prepared, out), { env: testEnv, fetchImpl: async () => { calls++; } }), /output_directory_must_be_fresh/u);
  assert.equal(calls, 0);
  assert.deepEqual(await readdir(out), []);
});
