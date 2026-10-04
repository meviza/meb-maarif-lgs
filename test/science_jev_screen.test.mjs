import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';

const api = await import('../packages/content-factory/science_jev_screen.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const clone = value => structuredClone(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.science-jev-screen.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
function question() {
  return { grade: 8, topic: 'Katı Basıncı', branch: 'physics', outcomeCode: 'F.8.3.1.1',
    stimulus: 'Ağırlığı 72 N olan bir blok, 0,3 metrekare temas yüzeyiyle yatay zeminde duruyor. Katı basıncı ağırlığın temas yüzeyine bölünmesiyle hesaplanır.',
    stem: 'Bu bloğun zemine uyguladığı basınç kaç Pascaldır?', options: { A: '24 Pa', B: '72 Pa', C: '240 Pa', D: '216 Pa' }, correctOption: 'C',
    solutionStrategy: 'Verilen ağırlığı temas yüzeyine böl; istenen basınç birimini kontrol et.',
    detailedSolution: '72 N / 0,3 m² = 240 Pa olur. C seçeneği basıncı verir.',
    distractors: { A: 'Ondalık bölme hatası.', B: 'Ağırlığı basınç sanma.', D: 'Alan yerine üçle çarpma.' }, difficulty: 'UYGULAMA' };
}
// This is an explicit synthetic editor expectation, not an official source or
// an accepted curriculum record. Real source authority belongs outside JEV.
function expectation() { return { sourceId: 'synthetic-pressure-editor-expectation', sourceSha256: 'c'.repeat(64),
  expectedGrade: 8, expectedCourseKey: 'fen-bilimleri', expectedOutcomeCode: 'F.8.3.1.1' }; }
async function screen(q = question(), e = expectation()) {
  assert.equal(typeof api.screenScienceQuestionWithJev, 'function', 'bounded real JEV science screen is missing');
  return api.screenScienceQuestionWithJev(q, e);
}
const zeroSideEffects = { providersCalled: 0, networkCallsMade: 0, generationCallsMade: 0, fallbacksProduced: 0 };

// Break: a fake adapter or default success substitutes for the real local JEV.
test('the real local heuristic auditor runs once and projects bounded advisory values', async () => {
  const result = await screen();
  assert.equal(result.state, 'advisory_scored'); assert.equal(result.advisory.performed, true);
  assert.equal(result.advisory.engine, 'JevQualityAuditor'); assert.equal(result.advisory.mode, 'local_heuristic_no_model');
  assert.equal(result.advisory.screenPassed, true); assert.equal(result.advisory.score, 1);
  assert.equal(result.advisory.prototypeCodeRecognized, true); assert.equal(result.advisory.prototypeScopeMatch, true);
  assert.equal(result.advisory.duplicateOptionCheckPassed, true); assert.equal(result.advisory.lexicalAmbiguityCheckPassed, true);
  assert.equal(result.advisory.heuristicDifficultyScore, 1); assert.equal(result.advisory.distractorEntryCountScore, 0.95);
  assert.equal(result.advisory.lexicalSpellingCheckPassed, true); assert.equal(result.advisory.hintsPresent, true);
  assert.deepEqual(result.advisory.reasons, []); assert.equal(result.activity.jevAuditorCalls, 1);
  assert.deepEqual(result.counts, { screenedCandidates: 1, generatedQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
});

// Break: a cache or canned adapter passes duplicate and ambiguous options.
test('duplicate options and lexical ambiguity exercise actual JEV rejection branches', async () => {
  const duplicate = question(); duplicate.options.A = ' 240 Pa ';
  const ambiguous = question(); ambiguous.stem = 'Bu blok belki hangi basıncı uygular?';
  const first = await screen(duplicate), second = await screen(ambiguous);
  assert.equal(first.advisory.performed, true); assert.equal(first.advisory.screenPassed, false);
  assert.equal(first.advisory.duplicateOptionCheckPassed, false);
  assert.equal(first.advisory.lexicalAmbiguityCheckPassed, false); assert.equal(first.advisory.reasons.length > 0, true);
  assert.equal(second.advisory.performed, true); assert.equal(second.advisory.screenPassed, false);
  assert.equal(second.advisory.lexicalAmbiguityCheckPassed, false);
});

// Break: syntax-shortened candidates crash when raw JEV has no decisions object.
test('a real structural rejection is projected without fallback generation or decision defaults', async () => {
  const q = question(); q.stimulus = 'Kısa öncül.'; q.stem = 'Soru işareti yok';
  const result = await screen(q);
  assert.equal(result.state, 'advisory_scored'); assert.equal(result.advisory.performed, true);
  assert.equal(result.advisory.screenPassed, false); assert.equal(result.advisory.score, 0);
  assert.equal(result.advisory.prototypeCodeRecognized, null); assert.equal(result.advisory.duplicateOptionCheckPassed, null);
  assert.equal(result.advisory.reasons.length, 2); assert.equal(result.activity.fallbacksProduced, 0);
});

// Break: official author expectations are inferred from the local prototype list.
test('an explicit FB source expectation matches independently even when the prototype code is unknown', async () => {
  const q = question(), e = expectation(); q.outcomeCode = 'FB.8.3.1'; e.expectedOutcomeCode = 'FB.8.3.1';
  const result = await screen(q, e);
  assert.equal(result.scopeExpectation.gradeMatch, true); assert.equal(result.scopeExpectation.outcomeMatch, true);
  assert.equal(result.scopeExpectation.sourceRecordDeclared, true); assert.equal(result.scopeExpectation.officialSourceValidated, false);
  assert.equal(result.scopeExpectation.expectedCourseKey, 'fen-bilimleri'); assert.equal(result.scopeExpectation.prototypeCourseKey, 'fen');
  assert.equal(result.advisory.performed, true); assert.equal(result.advisory.prototypeCodeRecognized, false);
  assert.equal(result.advisory.prototypeScopeMatch, false); assert.equal(result.advisory.screenPassed, false);
  assert.equal(result.advisory.score, 0.8); assert.equal(result.mebApproved, false);
});

// Break: a self-declared question silently supplies expected source scope.
test('mismatched grade or outcome refuses screening before applying the prototype heuristic', async () => {
  for (const e of [{ ...expectation(), expectedGrade: 7 }, { ...expectation(), expectedOutcomeCode: 'F.8.2.1.1' }]) {
    const result = await screen(question(), e);
    assert.equal(result.state, 'scope_mismatch'); assert.equal(result.advisory.performed, false);
    assert.equal(result.activity.jevAuditorCalls, 0); assert.equal(result.advisory.score, null);
    assert.equal(result.errors.length > 0, true);
  }
});

// Break: null-to-null matching is promoted as a bound official output.
test('an unbound source outcome is explicit and cannot be repaired by local prototype defaults', async () => {
  const q = question(), e = expectation(); q.outcomeCode = null; e.expectedOutcomeCode = null;
  const result = await screen(q, e);
  assert.equal(result.state, 'scope_mismatch'); assert.equal(result.scopeExpectation.outcomeMatch, false);
  assert.equal(result.advisory.performed, false); assert.equal(result.activity.jevAuditorCalls, 0);
  assert.equal(result.errors.includes('science_outcome_expectation_unbound'), true);
});

// Break: lexical or duplicate-option heuristics claim exact scientific truth.
test('even a heuristically passing wrong key cannot become an independently verified answer', async () => {
  const q = question(); q.correctOption = 'A'; q.distractors = { B: 'Yanlış ağırlık birimi.', C: 'Bu açıklama verilmiş doğru sayıya rağmen yanlış anahtar seçmez.', D: 'Yanlış alan kullanımı.' };
  const result = await screen(q);
  assert.equal(result.advisory.screenPassed, true); assert.equal(result.advisory.score, 1);
  assert.equal(result.answerIndependent, false); assert.equal(result.independentOracleRequired, true);
  assert.equal(result.plagiarismChecked, false); assert.equal(result.learnerEvidenceCollected, false);
  assert.equal(result.publicationReady, false); assert.equal(result.learnerReady, false); assert.equal(result.productionReady, false);
});

// Break: raw misleading MEB/plagiarism/Bloom/stars/video booleans leak as product claims.
test('advisory projection exports no raw guarantees ratings learner classifications or model availability', async () => {
  const result = await screen();
  const json = JSON.stringify(result);
  for (const rawKey of ['is_meb_aligned', 'zero_plagiarism_guarantee', 'single_deterministic_answer', 'bloom_taxonomy_level',
    'star_rating', 'starRating', 'video_solution_readiness', 'timestamp', 'ollamaHost', 'modelName', 'lifecycleState', 'success']) {
    assert.equal(Object.hasOwn(result, rawKey), false); assert.equal(json.includes(`\"${rawKey}\"`), false);
  }
  assert.equal(result.mebApproved, false); assert.equal(result.humanApproval, null);
  assert.equal(result.serializedHashIsAuthority, false); assert.equal(result.generatedFallbackUsed, false);
  assert.equal(result.governance.owner, 'pending'); assert.equal(result.governance.realLearnerDataPresent, false);
  assert.equal(Object.values(result.gates).every(state => state === 'pending'), true);
});

// Break: authority flags, arbitrary engine controls, duplicate aliases or hooks enter through extra fields.
test('exact closed question source and argument boundaries reject authority and provider overrides', async () => {
  await screen();
  const cases = [
    [{ ...question(), mebApproved: true }, expectation()], [{ ...question(), answerKeyEvidence: { expectedOption: 'C' } }, expectation()],
    [{ ...question(), correct_option: 'C' }, expectation()], [question(), { ...expectation(), officialSourceValidated: true }],
    [question(), { ...expectation(), qualityThreshold: 0.1 }], [question(), { ...expectation(), model: 'tev1:latest' }],
    [question(), { ...expectation(), expectedCourseKey: 'matematik' }],
  ];
  for (const [q, e] of cases) { const result = await screen(q, e); assert.equal(result.state, 'input_rejected'); assert.equal(result.activity.jevAuditorCalls, 0); }
  assert.equal((await api.screenScienceQuestionWithJev(question(), expectation(), { approve: true })).state, 'input_rejected');
  assert.equal((await api.screenScienceQuestionWithJev(question())).state, 'input_rejected');
});

// Break: malformed bounded fields throw native trim/type errors in legacy JEV.
test('malformed grade branch codes options distractors and oversized texts fail before legacy inspection', async () => {
  const changes = [q => { q.grade = 4; }, q => { q.grade = 5; }, q => { q.grade = 8.5; }, q => { q.branch = 'unknown'; },
    q => { q.outcomeCode = 'M.8.1.1.1'; }, q => { q.options.A = null; }, q => { q.options.E = 'Extra'; },
    q => { q.distractors.C = 'Claim'; }, q => { delete q.distractors.A; }, q => { q.solutionStrategy = {}; },
    q => { q.stimulus = 'x'.repeat(65537); }, q => { q.stem = '\u0000'; }, q => { q.difficulty = 'random-default'; }];
  for (const change of changes) {
    const q = question(); change(q); const result = await screen(q);
    assert.equal(result.state, 'input_rejected'); assert.equal(result.activity.jevAuditorCalls, 0); assert.equal(result.questionSha256, null);
  }
  for (const e of [{ ...expectation(), sourceSha256: 'not-a-sha' }, { ...expectation(), sourceId: '' }]) {
    assert.equal((await screen(question(), e)).state, 'input_rejected');
  }
});

// Break: caller accessors/custom objects execute during validation or error reporting.
test('hostile getters proxies revoked proxies cycles and serialization hooks execute zero times', async () => {
  let hooks = 0; const getter = {}; Object.defineProperty(getter, 'grade', { get() { hooks++; return 8; }, enumerable: true });
  const proxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke(); const cycle = {}; cycle.x = cycle;
  const nestedGetter = question(); Object.defineProperty(nestedGetter.options, 'A', { get() { hooks++; return '24 Pa'; }, enumerable: true });
  const serialization = { ...question(), toJSON() { hooks++; return question(); } };
  const hidden = question(); Object.defineProperty(hidden, 'approved', { value: true });
  const custom = Object.assign(Object.create({ inherited: true }), question());
  for (const q of [getter, proxy, revoked.proxy, cycle, nestedGetter, serialization, hidden, custom, () => { hooks++; }]) {
    const result = await screen(q); assert.equal(result.state, 'input_rejected'); assert.equal(result.activity.jevAuditorCalls, 0);
  }
  const sourceGetter = expectation(); Object.defineProperty(sourceGetter, 'sourceId', { get() { hooks++; return 'private'; }, enumerable: true });
  for (const e of [sourceGetter, proxy, revoked.proxy, cycle]) assert.equal((await screen(question(), e)).state, 'input_rejected');
  assert.equal(hooks, 0);
});

// Break: screening routes into LLM/model listing/generation/fallback or starts external HTTP.
test('the real screen makes zero HTTP fetch generation or fallback calls', async () => {
  const saved = { http: http.request, https: https.request, fetch: globalThis.fetch }; let calls = 0;
  const forbidden = () => { calls++; throw new Error('network_forbidden_in_science_screen'); };
  http.request = forbidden; https.request = forbidden; globalThis.fetch = forbidden;
  try {
    const result = await screen(); assert.equal(result.advisory.performed, true); assert.equal(calls, 0);
    assert.deepEqual(Object.fromEntries(Object.entries(result.activity).filter(([key]) => key !== 'jevAuditorCalls')), zeroSideEffects);
    assert.equal(result.generatedFallbackUsed, false);
  } finally { http.request = saved.http; https.request = saved.https; globalThis.fetch = saved.fetch; }
});

// Break: an actual engine runtime failure is disguised as a generated success.
// Only the runtime clock is faulted; the real auditor implementation still runs.
test('a real auditor timestamp failure returns unavailable without a generated fallback', async () => {
  await screen();
  const original = Date.prototype.toISOString;
  Date.prototype.toISOString = () => { throw new Error('synthetic_clock_failure_do_not_echo'); };
  try {
    const result = await screen(); assert.equal(result.state, 'screen_unavailable');
    assert.equal(result.advisory.performed, false); assert.equal(result.advisory.screenPassed, false);
    assert.equal(result.advisory.score, null); assert.equal(result.activity.jevAuditorCalls, 1);
    assert.equal(result.generatedFallbackUsed, false); assert.equal(result.activity.fallbacksProduced, 0);
    assert.equal(result.publicationReady, false); assert.deepEqual(result.errors, ['science_jev_engine_unavailable']);
    assert.equal(JSON.stringify(result).includes('synthetic_clock_failure'), false);
  } finally { Date.prototype.toISOString = original; }
});

// Break: input mutation, timestamp or harmless key order makes reports stale/nonreproducible.
test('input hashes and frozen deterministic reports preserve exact screened revisions without exposing raw content', async () => {
  const q = question(), e = expectation(), before = JSON.stringify({ q, e });
  const result = await screen(q, e), again = await screen(q, e);
  assert.equal(JSON.stringify({ q, e }), before); assert.deepEqual(result, again);
  assert.equal(result.questionSha256, hash('question', q)); assert.equal(result.expectationSha256, hash('expectation', e));
  assert.equal(result.contentSha256, hash('report', Object.fromEntries(Object.entries(result).filter(([key]) => key !== 'contentSha256'))));
  assert.equal(Object.isFrozen(result.advisory.reasons), true); assert.equal(Object.isFrozen(result.scopeExpectation), true);
  assert.throws(() => { result.publicationReady = true; }, TypeError);
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  assert.deepEqual(await screen(reverse(q), reverse(e)), result);
  q.stem = 'Bu blok belki hangi basıncı uygular?'; const changed = await screen(q, e);
  assert.notEqual(changed.questionSha256, result.questionSha256); assert.equal(changed.advisory.screenPassed, false);
  assert.equal(JSON.stringify(result).includes('72 N / 0,3'), false); assert.equal(Buffer.byteLength(JSON.stringify(result)) <= 16384, true);
});
