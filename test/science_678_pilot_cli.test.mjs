import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { request } from 'node:http';

const root = new URL('..', import.meta.url);
const entry = new URL('../tools/science_678_pilot.mjs', import.meta.url);
function run(...args) {
  assert.ok(existsSync(entry), 'science pilot CLI entry is missing');
  return spawnSync(process.execPath, ['tools/science_678_pilot.mjs', ...args], {cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 2097152});
}
function json(...args) {
  const result = run(...args);
  assert.equal(result.status, 0, `science pilot dependency integration not ready or command failed: ${result.stderr}`);
  assert.equal(result.stderr, '');
  return JSON.parse(result.stdout);
}
test('JSON emits the actual 54 item draft stock rather than a padded 450 question count', () => {
  const bank = json('--json');
  assert.equal(bank.schemaVersion, 'science-678-pilot/v1'); assert.equal(bank.items.length, 54);
  assert.equal(bank.counts.authoredDrafts, 54); assert.equal(bank.counts.reasoningFamilies, 27);
  assert.equal(bank.counts.targetDrafts, 450); assert.equal(bank.counts.remainingDrafts, 396);
  assert.equal(bank.counts.publishedQuestions, 0); assert.equal(bank.learnerReady, false);
  assert.deepEqual(bank.activity.externalCalls, {generator: 0, jev: 0, clef: 0, tts: 0});
  assert.equal(bank.generator.state, 'not_run');
});
test('zero argument summary reports stock, pending work and model absence explicitly', () => {
  const summary = json();
  assert.equal(summary.schemaVersion, 'science-678-pilot-summary/v1');
  assert.equal(summary.state, 'partial_editor_inventory');
  assert.equal(summary.authoredDrafts, 54); assert.equal(summary.reasoningFamilies, 27);
  assert.equal(summary.targetDrafts, 450); assert.equal(summary.remainingDrafts, 396);
  assert.equal(summary.publishedQuestions, 0); assert.equal(summary.localJevScreens, 54);
  assert.equal(summary.providerCallsMade, 0); assert.equal(summary.modelGeneratedQuestions, 0);
  assert.equal(summary.learnerReady, false); assert.equal(summary.publicationReady, false);
  assert.match(summary.contentSha256, /^[a-f0-9]{64}$/u);
  assert.equal(Object.hasOwn(summary, 'modelGenerationSeconds'), false);
});
test('Clef preflight CLI prepares three real typed requests but never executes or claims configured access', () => {
  const prepared = json('--clef-preflight');
  assert.equal(prepared.schemaVersion, 'science-678-clef-preflight/v1');
  assert.equal(prepared.state, 'prepared_not_run');
  assert.deepEqual(prepared.requests.map(row => row.questionId), ['SCI-G8-solid_pressure_control-V1', 'SCI-G8-periodic_pattern-V1', 'SCI-G8-one_trait_cross-V1']);
  assert.equal(prepared.counts.preparedRequests, 3); assert.equal(prepared.counts.preparedDecisions, 6);
  assert.equal(prepared.counts.localDrafts, 54); assert.equal(prepared.counts.externalCalls, 0);
  assert.equal(prepared.counts.generatedQuestions, 0); assert.equal(prepared.counts.publishedQuestions, 0);
  assert.equal(prepared.provider.configured, 'not_checked'); assert.equal(prepared.provider.liveAccessVerified, false);
  assert.equal(prepared.transport.state, 'not_run'); assert.equal(prepared.transport.requestsMade, 0);
  assert.equal(prepared.transport.allowedNewSpendUsd, 0); assert.equal(prepared.transport.quotaVerified, false);
  assert.equal(prepared.learnerReady, false); assert.equal(prepared.publicationReady, false);
  assert.match(prepared.preflightSha256, /^[a-f0-9]{64}$/u);
  assert.match(prepared.bankContentSha256, /^[a-f0-9]{64}$/u);
  for (const row of prepared.requests) {
    assert.equal(row.request.model, 'clef-flash');
    assert.equal(row.request.state.bankContentSha256, prepared.bankContentSha256);
    assert.match(row.questionSha256, /^[a-f0-9]{64}$/u);
    assert.match(row.requestSha256, /^[a-f0-9]{64}$/u);
    assert.ok(row.requestBytes <= 65536);
    assert.equal(Object.hasOwn(row.request, 'images'), false);
    assert.ok(Object.values(row.request.questions).every(question => question.type === 'noul'));
  }
});
test('benchmark measures separate real bank and editor build timings without model ETA or extrapolation', () => {
  const benchmark = json('--benchmark');
  assert.equal(benchmark.schemaVersion, 'science-678-local-benchmark/v1');
  assert.equal(benchmark.mode, 'local_existing_stock_no_model');
  assert.equal(benchmark.authoredDrafts, 54); assert.equal(benchmark.targetDrafts, 450);
  assert.equal(benchmark.remainingDrafts, 396); assert.equal(benchmark.publishedQuestions, 0);
  assert.equal(benchmark.providerCallsMade, 0); assert.equal(benchmark.modelGeneratedQuestions, 0);
  assert.equal(benchmark.editorRenderIncludesInternalBankBuild, true);
  assert.equal(benchmark.bankBuildsMeasured, 2);
  assert.equal(benchmark.directBankLocalJevScreens, 54);
  assert.equal(benchmark.editorRenderLocalJevScreens, 54);
  assert.equal(benchmark.localJevScreensAcrossMeasuredBuilds, 108);
  assert.equal(benchmark.sameStockRevision, true);
  assert.equal(benchmark.newStockCreatedByBenchmark, 0);
  assert.ok(Number.isFinite(benchmark.bankBuildMilliseconds) && benchmark.bankBuildMilliseconds > 0);
  assert.ok(Number.isFinite(benchmark.editorRenderMilliseconds) && benchmark.editorRenderMilliseconds > 0);
  assert.ok(benchmark.bankJsonBytes > 1000 && benchmark.bankJsonBytes <= 2097152);
  assert.ok(benchmark.editorHtmlBytes > 1000 && benchmark.editorHtmlBytes <= 2097152);
  for (const prohibited of ['modelGenerationSeconds', 'estimated450Seconds', 'estimated36000Seconds', 'questionsPerSecond', 'modelEta', 'modelName', 'outputFile']) assert.equal(Object.hasOwn(benchmark, prohibited), false);
});
test('benchmark screen total agrees with a counting observer that delegates to the real JEV auditor', () => {
  assert.ok(existsSync(entry), 'science pilot CLI entry is missing');
  const source = `
    import { JevQualityAuditor } from './engine/jev_evaluator.mjs';
    const realEvaluate = JevQualityAuditor.prototype.evaluateQuestion;
    let calls = 0;
    JevQualityAuditor.prototype.evaluateQuestion = async function(...args) {
      calls++; return realEvaluate.apply(this, args);
    };
    const realWrite = process.stdout.write.bind(process.stdout);
    let output = '';
    process.stdout.write = chunk => {output += chunk; return true;};
    process.argv = [process.execPath, 'tools/science_678_pilot.mjs', '--benchmark'];
    try {await import('./tools/science_678_pilot.mjs');}
    finally {process.stdout.write = realWrite; JevQualityAuditor.prototype.evaluateQuestion = realEvaluate;}
    if (process.exitCode) process.exit(process.exitCode);
    realWrite(JSON.stringify({benchmark: JSON.parse(output), observedLocalJevCalls: calls}) + '\\n');
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 16384});
  assert.equal(result.status, 0, result.stderr); assert.equal(result.stderr, '');
  const observed = JSON.parse(result.stdout);
  assert.equal(observed.observedLocalJevCalls, 108);
  assert.equal(observed.benchmark.localJevScreensAcrossMeasuredBuilds, observed.observedLocalJevCalls);
  assert.equal(observed.benchmark.authoredDrafts, 54);
  assert.equal(observed.benchmark.providerCallsMade, 0);
});
test('all unknown or combined controls reject before dependency loading and print no paths', () => {
  for (const args of [['--count', '450'], ['--port', '3339'], ['--model', 'synthetic'], ['--file', '/private/file'], ['--env'], ['--budget', '1'], ['--json', '--benchmark'], ['--preview', '--preview'], ['--clef-preflight', '--json'], ['--clef-preflight', '--clef-preflight'], ['--clef-preflight', '--count', '3'], ['--clef-preflight=live'], ['--json=1'], ['--help'], ['anything']]) {
    const result = run(...args);
    assert.equal(result.status, 1); assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'invalid_science_678_pilot_arguments\n');
  }
});
test('preview lifecycle owns and closes a real loopback snapshot without a model or request-time rebuild', async t => {
  assert.ok(existsSync(entry), 'science pilot CLI entry is missing');
  const child = spawn(process.execPath, ['tools/science_678_pilot.mjs', '--preview'], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
  t.after(async () => {if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM'); await closed;});
  let stderr = ''; child.stderr.setEncoding('utf8'); child.stderr.on('data', chunk => {stderr += chunk;});
  const closed = new Promise(resolve => child.once('close', (code, signal) => resolve({code, signal})));
  const info = await new Promise((resolve, reject) => {
    let text = '';
    const timer = setTimeout(() => reject(new Error('science preview start timed out')), 10000);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      text += chunk;
      if (text.includes('\n')) {clearTimeout(timer); try {resolve(JSON.parse(text.trim()));} catch(error) {reject(error);}}
    });
    child.once('close', code => {clearTimeout(timer); if (!text.includes('\n')) reject(new Error(`science preview integration not ready: code ${code}; ${stderr}`));});
    child.once('error', error => {clearTimeout(timer); reject(error);});
  });
  assert.equal(info.state, 'loopback_editor_preview'); assert.equal(info.snapshotBuilds, 1);
  assert.match(info.url, /^http:\/\/\[::1\]:[1-9]\d*\/$/u);
  assert.equal(info.manifest.authoredDrafts, 54); assert.equal(info.manifest.providerCallsMade, 0);
  assert.equal(info.manifest.learnerReady, false);
  const get = () => new Promise((resolve, reject) => {
    const url = new URL(info.url);
    const req = request({hostname: '::1', port: url.port, path: '/', method: 'GET'}, res => {
      const chunks = []; res.on('data', chunk => chunks.push(chunk)); res.on('end', () => resolve({status: res.statusCode, body: Buffer.concat(chunks).toString('utf8')}));
    });
    req.on('error', reject); req.end();
  });
  const first = await get(), second = await get();
  assert.equal(first.status, 200); assert.equal(first.body, second.body);
  assert.equal((first.body.match(/data-question-id=/gu) ?? []).length, 54);
  child.kill('SIGTERM');
  const result = await closed;
  assert.equal(result.code, 0); assert.equal(result.signal, null); assert.equal(stderr, '');
  await assert.rejects(get, error => error.code === 'ECONNREFUSED');
});
