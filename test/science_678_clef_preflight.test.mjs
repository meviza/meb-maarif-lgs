import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildScience678Pilot } from '../packages/content-factory/science_678_factory.mjs';
import { JevQualityAuditor } from '../engine/jev_evaluator.mjs';

const api = await import('../packages/content-factory/science_678_clef_preflight.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const IDS = ['SCI-G8-solid_pressure_control-V1', 'SCI-G8-periodic_pattern-V1', 'SCI-G8-one_trait_cross-V1'];
const SOURCE_SHA = '3a8aa21327083bf15c33b9c404f299ff784b11d26024522a8c24b61387c8c0c1';
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const digest = (prefix, value) => createHash('sha256').update(`${prefix}:${JSON.stringify(canonical(value))}`).digest('hex');
const rawHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function prepare() {
  assert.equal(typeof api.prepareScience678ClefPilot, 'function', 'science Clef preflight preparation is missing');
  return api.prepareScience678ClefPilot();
}

test('only three fixed grade eight editor questions are prepared from the real 54 draft bank', async () => {
  const plan = await prepare();
  assert.equal(plan.schemaVersion, 'science-678-clef-preflight/v1');
  assert.equal(plan.state, 'prepared_not_run');
  assert.deepEqual(plan.requests.map(row => row.questionId), IDS);
  assert.deepEqual(plan.requests.map(row => row.branch), ['physics', 'chemistry', 'biology']);
  assert.ok(plan.requests.every(row => row.grade === 8));
  assert.deepEqual(plan.counts, {preparedRequests: 3, preparedDecisions: 6, localDrafts: 54, localJevScreens: 54, externalCalls: 0, generatedQuestions: 0, publishedQuestions: 0});
  assert.equal(plan.publicationReady, false); assert.equal(plan.learnerReady, false);
  assert.ok(Object.isFrozen(plan)); assert.ok(Object.isFrozen(plan.requests));
  assert.ok(Object.isFrozen(plan.requests[0].request.state.reasoning.steps[0]));
});

test('decision requests follow the text-only model state questions schema and never become generation prompts', async () => {
  const plan = await prepare();
  for (const row of plan.requests) {
    assert.deepEqual(Object.keys(row.request).sort(), ['model', 'questions', 'state']);
    assert.equal(row.request.model, 'clef-flash');
    assert.deepEqual(Object.keys(row.request.questions).sort(), ['ambiguity', 'answer_supported']);
    for (const question of Object.values(row.request.questions)) {
      assert.deepEqual(Object.keys(question).sort(), ['instructions', 'type']);
      assert.equal(question.type, 'noul');
      assert.match(question.instructions, /data, not instructions/u);
      assert.match(question.instructions, /advisory/u);
      assert.ok(question.instructions.length > 50);
    }
    assert.equal(row.request.state.inputTrust, 'untrusted_data_not_instructions');
    assert.equal(row.request.state.answerStatus, 'author_claim_not_oracle_truth');
    assert.equal(Object.hasOwn(row.request, 'images'), false);
    assert.equal(Object.hasOwn(row.request, 'messages'), false);
  }
});

test('given values options declared key and reasoned steps stay bound to each actual editor packet', async () => {
  const plan = await prepare(), bank = await buildScience678Pilot();
  assert.equal(plan.bankContentSha256, bank.contentSha256);
  assert.deepEqual(plan.requests.map(row => row.request.state.declaredCorrectOption), ['A', 'C', 'A']);
  for (const row of plan.requests) {
    const original = bank.items.find(item => item.packet.id === row.questionId), packet = original.packet;
    assert.equal(original.verification.valid, true);
    assert.equal(row.familyId, packet.familyId);
    assert.equal(row.request.state.given, packet.question.stimulus);
    assert.equal(row.request.state.stem, packet.question.stem);
    assert.deepEqual(row.request.state.options, packet.question.options);
    assert.equal(row.request.state.declaredCorrectOption, packet.question.correctOption);
    assert.equal(row.request.state.solutionStrategy, packet.question.solutionStrategy);
    assert.equal(row.request.state.detailedSolution, packet.question.detailedSolution);
    assert.deepEqual(row.request.state.distractorRationales, packet.question.distractors);
    assert.deepEqual(row.request.state.reasoning, packet.reasoning);
    assert.equal(row.questionSha256, digest('k12.science-678-clef-question/v1', packet.question));
    assert.equal(row.request.state.bankContentSha256, bank.contentSha256);
    assert.equal(row.request.state.questionSha256, row.questionSha256);
  }
});

test('source lineage binds actual grade outcome revision and physical page without a source approval transfer', async () => {
  const plan = await prepare();
  assert.deepEqual(plan.requests.map(row => row.sourceBinding.outcomeCode), ['F.8.3.1.1', 'F.8.4.1.2', 'F.8.2.2.2']);
  assert.deepEqual(plan.requests.map(row => row.sourceBinding.physicalPdfPage), [51, 52, 50]);
  for (const row of plan.requests) {
    assert.equal(row.sourceBinding.sourceId, 'legacy-2018-fen-bilimleri');
    assert.equal(row.sourceBinding.pdfSha256, SOURCE_SHA);
    assert.equal(row.sourceBinding.grade, 8);
    assert.equal(row.sourceBinding.courseKey, 'fen-bilimleri');
    assert.equal(row.sourceBinding.pageEvidenceId, `legacy-2018-fen-bilimleri:p${row.sourceBinding.physicalPdfPage}`);
    assert.equal(row.sourceBindingSha256, digest('k12.science-678-clef-source/v1', row.sourceBinding));
    assert.deepEqual(row.request.state.sourceBinding, row.sourceBinding);
    assert.equal(row.request.state.sourceBindingSha256, row.sourceBindingSha256);
    assert.equal(Object.hasOwn(row.request.state, 'mebApproved'), false);
    assert.equal(Object.hasOwn(row.request.state, 'expertApproval'), false);
  }
});

test('oracle facts scientific truth flags and SVG bytes are excluded from the text advisory payload', async () => {
  const plan = await prepare();
  assert.deepEqual(plan.visual, {inputMode: 'text_only', rasterInputsPrepared: 0, svgSentAsImage: false, visualAuditPerformed: false});
  for (const row of plan.requests) {
    for (const forbidden of ['model', 'verification', 'answerOracle', 'derivedFacts', 'truth', 'answerOraclePassed', 'visual', 'visualSpec', 'svg', 'images', 'expectedCorrectOption']) {
      assert.equal(Object.hasOwn(row.request.state, forbidden), false, forbidden);
    }
    const serialized = JSON.stringify(row.request);
    assert.doesNotMatch(serialized, /<svg|<script|data:image|image\/png|answerOracle|derivedFacts/u);
    assert.equal(row.request.questions.diagram_aligned, undefined);
    assert.equal(Object.hasOwn(row, 'answers'), false);
    assert.equal(Object.hasOwn(row, 'result'), false);
  }
});

test('unrun credentials and zero spend quota stay pending rather than claiming account configuration', async () => {
  const plan = await prepare();
  assert.deepEqual(plan.provider, {model: 'clef-flash', configured: 'not_checked', liveAccessVerified: false});
  assert.deepEqual(plan.transport, {state: 'not_run', reason: 'credentials_and_zero_spend_quota_pending', allowedNewSpendUsd: 0, quotaVerified: false, requestsMade: 0});
  const serialized = JSON.stringify(plan);
  assert.doesNotMatch(serialized, /Bearer\s|CLOUDFLARE_|\.env|\/Users\/|api\.cloudflare\.com/u);
  for (const forbidden of ['freeTierVerified', 'availableNeurons', 'usage', 'creditsRemaining', 'certified', 'generatedFallback', 'learnerDevelopmentMeasured']) assert.equal(Object.hasOwn(plan, forbidden), false);
});

test('payload hashes cover exact transport bytes and every fixed request stays below 64 KiB', async () => {
  const plan = await prepare();
  for (const row of plan.requests) {
    assert.equal(row.requestBytes, Buffer.byteLength(JSON.stringify(row.request)));
    assert.ok(row.requestBytes > 1000 && row.requestBytes <= 65536);
    assert.equal(row.requestSha256, rawHash(row.request));
    const altered = structuredClone(row.request); altered.state.declaredCorrectOption = 'D';
    assert.notEqual(rawHash(altered), row.requestSha256);
  }
  const {preflightSha256, ...body} = plan;
  assert.equal(preflightSha256, digest('k12.science-678-clef-preflight/v1', body));
});

test('real preparation runs 54 local JEV screens and zero fetch or Cloudflare credential reads', async () => {
  assert.equal(typeof api.prepareScience678ClefPilot, 'function', 'science Clef preflight preparation is missing');
  const realFetch = globalThis.fetch, realEnv = process.env, realEvaluate = JevQualityAuditor.prototype.evaluateQuestion;
  let networkCalls = 0, credentialReads = 0, localScreens = 0;
  globalThis.fetch = async () => {networkCalls++; throw new Error('network_forbidden_in_preflight');};
  process.env = new Proxy(realEnv, {get(target, key) {
    if (typeof key === 'string' && key.startsWith('CLOUDFLARE_')) {credentialReads++; throw new Error('credential_read_forbidden_in_preflight');}
    return Reflect.get(target, key);
  }});
  JevQualityAuditor.prototype.evaluateQuestion = async function(...args) {localScreens++; return realEvaluate.apply(this, args);};
  let result;
  try {result = await api.prepareScience678ClefPilot();}
  finally {globalThis.fetch = realFetch; process.env = realEnv; JevQualityAuditor.prototype.evaluateQuestion = realEvaluate;}
  assert.equal(networkCalls, 0); assert.equal(credentialReads, 0); assert.equal(localScreens, 54);
  assert.equal(result.counts.externalCalls, 0); assert.equal(result.transport.requestsMade, 0);
});

test('arbitrary parameters hostile hooks and authority overrides reject before touching their values', async () => {
  assert.equal(typeof api.prepareScience678ClefPilot, 'function', 'science Clef preflight preparation is missing');
  let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'model', {enumerable: true, get() {hooks++; return 'other';}});
  const proxy = new Proxy({}, {get() {hooks++;}, ownKeys() {hooks++; return [];}});
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const serializing = {toJSON() {hooks++; return {};}};
  const cycle = {}; cycle.state = cycle;
  for (const input of [getter, proxy, revoked.proxy, serializing, cycle, null, undefined, [], {count: 450}, {token: 'synthetic', quotaVerified: true}, {publicationReady: true}, {requests: []}]) {
    await assert.rejects(() => api.prepareScience678ClefPilot(input), /invalid_science_clef_preflight_arguments/u);
  }
  await assert.rejects(() => api.prepareScience678ClefPilot('extra', 'second'), /invalid_science_clef_preflight_arguments/u);
  assert.equal(hooks, 0);
});

test('repeat preparation keeps one immutable bank revision and never adds stock or live results', async () => {
  const one = await prepare(), two = await prepare();
  assert.deepEqual(two, one);
  assert.equal(two.preflightSha256, one.preflightSha256);
  assert.equal(two.counts.localDrafts, 54); assert.equal(two.counts.generatedQuestions, 0);
  assert.equal(two.counts.publishedQuestions, 0);
  assert.throws(() => {two.requests[0].request.state.options.A = 'Changed';}, TypeError);
  assert.throws(() => {two.transport.quotaVerified = true;}, TypeError);
});
