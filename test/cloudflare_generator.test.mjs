import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGenerationRequest } from '../packages/content-factory/providers.mjs';
const api = await import('../packages/content-factory/cloudflare_generator.mjs').catch(() => ({}));
function adapter(options = {}) { assert.equal(typeof api.createCloudflareGenerator, 'function', 'real Cloudflare generator adapter is not implemented'); return api.createCloudflareGenerator(options); }
const model = '@cf/zai-org/glm-4.7-flash';
const env = { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'fixture-key-not-real', CLOUDFLARE_GENERATOR_MODEL: model };
const metadata = { source: { sourceId: 'original-authoring', rightsStatus: 'owned_original', purpose: 'original_question_generation' }, curriculum: { mappingStatus: 'unresolved', registryEntryId: null, programVersion: null, grade: null, outcomeCode: null, sourceUrl: null, sourceSha256: null }, governance: { ownerId: 'content-owner', stewardId: 'math-editor', purpose: 'review_only', retentionPolicyId: 'pilot-review-v1' } };
function request() { return { ...buildGenerationRequest({ count: 1, metadata, coverageCellId: 'pilot:rectangle', requiredVisual: true }), taskSpec: { grade: 6, courseKey: 'matematik', topicPath: ['Geometri', 'Dikdörtgen', 'Çevre'], ageBand: { min: 10, max: 12 }, learningIntent: 'Çevreyi kenar toplamıyla ilişkilendirme.', misconceptions: ['Alan ile çevreyi karıştırma.'], questionFamilies: ['Çevreyi yorumlama.'], difficulty: 'AUTHOR_ESTIMATED' } }; }
const live = { allowLive: true, maxCompletionTokens: 2048, maxEstimatedUsd: 0.01 };
function draft(context) { return { id: 'generated-1', coverageCellId: context.coverageCellId, curriculumContextSha256: context.curriculumContextSha256, sourceContextSha256: context.sourceContextSha256, state: 'draft', prompt: 'Kenarları 8 cm ve 3 cm olan dikdörtgenin çevresi kaç santimetredir?', options: [22, 24, 11, 21], answerIndex: 0, answerExplanation: 'Dört kenarın toplamı 8 + 3 + 8 + 3 = 22 cm olur.', solutionGraph: [{ stepId: 's1', expression: '8+3+8+3', narration: 'Dört kenarı topla.' }], visualSpec: { required: true, type: 'diagram_spec', alt: '8 cm ve 3 cm kenarlı dikdörtgen.', description: 'Kenar etiketleri bulunan dikdörtgen çizimi.' }, cognitiveIntent: { description: 'Çevreyi bulma.', taskFamily: 'Çevreyi yorumlama.', misconceptionTarget: 'Alan ile çevreyi karıştırma.' }, difficulty: { level: 'introductory', calibrationStatus: 'AUTHOR_ESTIMATED' } }; }
function response(items, overrides = {}) { return { success: true, result: { id: 'completion-fixture-1', object: 'chat.completion', created: 1, model, choices: [{ index: 0, message: { role: 'assistant', content: JSON.stringify({ questions: items }), refusal: null }, finish_reason: 'stop', logprobs: null }], usage: { prompt_tokens: 450, completion_tokens: 200, total_tokens: 650 }, ...overrides } }; }

test('unconfigured transport does not invoke a network call', async () => {
  let calls = 0; const result = await adapter({ env: {}, fetchImpl: () => { calls++; } }).generate(request(), live);
  assert.equal(result.status, 'model_not_configured'); assert.equal(calls, 0);
});

test('exact model allowlist, opt-in and numeric token/cost budget all gate network calls', async () => {
  let calls = 0; const fetchImpl = () => { calls++; };
  assert.equal((await adapter({ env: { ...env, CLOUDFLARE_GENERATOR_MODEL: '@cf/cloudflare/clef-flash' }, fetchImpl }).generate(request(), live)).status, 'model_not_configured');
  const generator = adapter({ env, fetchImpl });
  assert.equal((await generator.generate(request(), {})).status, 'live_invocation_not_enabled');
  for (const options of [{ ...live, maxCompletionTokens: 0 }, { ...live, maxCompletionTokens: 8193 }, { ...live, maxEstimatedUsd: 0 }, { ...live, maxEstimatedUsd: '0.1' }]) assert.equal((await generator.generate(request(), options)).status, 'invalid_budget');
  assert.equal(calls, 0);
});

test('real REST request binds task/source/curriculum context and parses only unvalidated drafts', async () => {
  let observed;
  const generator = adapter({ env, fetchImpl: async (url, init) => { const body = JSON.parse(init.body); observed = { url, headers: init.headers, body }; const context = JSON.parse(body.prompt.split('\nCONTEXT_JSON\n')[1]); return { ok: true, json: async () => response([draft(context)]) }; } });
  const result = await generator.generate(request(), live);
  assert.equal(observed.url, `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`);
  assert.equal(observed.headers.Authorization, 'Bearer fixture-key-not-real');
  assert.equal(observed.body.max_completion_tokens, 2048); assert.equal(observed.body.stream, false); assert.equal(observed.body.store, false); assert.equal(observed.body.response_format.type, 'json_schema'); assert.equal(observed.body.chat_template_kwargs.enable_thinking, false);
  assert.equal(result.status, 'unvalidated_drafts'); assert.equal(result.items[0].state, 'draft'); assert.equal(result.items[0].kind, 'cloudflare-generated-draft/v1'); assert.equal(result.publishReady, false); assert.equal(result.mathValidated, false);
  assert.match(result.audit.requestSha256, /^[a-f0-9]{64}$/); assert.equal(result.audit.usage.total_tokens, 650); assert.equal(JSON.stringify(result).includes('fixture-key-not-real'), false);
});

test('budget includes JSON schema and the entire serialized request before any paid network call', async () => {
  let calls = 0, sentBody;
  const generator = adapter({ env, fetchImpl: async (_url, init) => { calls++; sentBody = init.body; const context = JSON.parse(JSON.parse(init.body).prompt.split('\nCONTEXT_JSON\n')[1]); return { ok: true, json: async () => response([draft(context)]) }; } });
  const allowed = await generator.generate(request(), live);
  assert.equal(allowed.status, 'unvalidated_drafts');
  const requestBytes = Buffer.byteLength(sentBody, 'utf8');
  const promptOnlyCost = ((Buffer.byteLength(JSON.parse(sentBody).prompt, 'utf8') + 512) * 0.0605 + 2048 * 0.40) / 1_000_000;
  const fullBodyCost = ((requestBytes + 512) * 0.0605 + 2048 * 0.40) / 1_000_000;
  assert.ok(fullBodyCost > promptOnlyCost);
  const betweenOldAndFullBudget = (promptOnlyCost + fullBodyCost) / 2;
  const rejected = await generator.generate(request(), { ...live, maxEstimatedUsd: betweenOldAndFullBudget });
  assert.equal(rejected.status, 'budget_exceeded');
  assert.equal(calls, 1, 'lower budget must be rejected before a second network invocation');
  assert.equal(allowed.audit.requestBytes, requestBytes);
  assert.equal(allowed.audit.estimatedInputTokenCeiling, requestBytes + 512);
  assert.equal(allowed.audit.estimatedMaxUsd, fullBodyCost);
});

test('learner identifiers, raw source documents, unknown fields and invalid context are rejected before fetch', async () => {
  let calls = 0; const generator = adapter({ env, fetchImpl: () => { calls++; } });
  const sensitive = [ { studentId: 'child-1' }, { rawMebPdf: 'JVBERi0=' }, { learnerEmail: 'child@example.com' }, { coverageCellId: '' }, { count: 101 } ];
  for (const change of sensitive) assert.equal((await generator.generate({ ...request(), ...change }, live)).status, 'invalid_request');
  const req = request(); req.metadata.source.pdfText = 'copyrighted archive text';
  assert.equal((await generator.generate(req, live)).status, 'invalid_request');
  assert.equal(calls, 0);
});

test('provider failures, malformed JSON and truncated completions fail closed without paid retries', async () => {
  let calls = 0;
  const limited = adapter({ env, fetchImpl: async () => { calls++; return { ok: false, status: 429, text: async () => 'secret=fixture-key-not-real' }; } });
  const error = await limited.generate(request(), live); assert.equal(error.status, 'provider_error'); assert.equal(calls, 1); assert.equal(JSON.stringify(error).includes('fixture-key-not-real'), false);
  for (const change of [{ content: '{bad json', finish: 'stop' }, { content: '{"questions":[]}', finish: 'length' }]) {
    const generator = adapter({ env, fetchImpl: async () => { const body = response([]); body.result.choices[0].message.content = change.content; body.result.choices[0].finish_reason = change.finish; return { ok: true, json: async () => body }; } });
    assert.equal((await generator.generate(request(), live)).status, 'invalid_provider_response');
  }
});

test('duplicate ids, wrong coverage/hash, fake publication and missing visual spec fail output validation', async () => {
  for (const mutation of ['duplicate', 'coverage', 'hash', 'approval', 'visual', 'option_alias', 'unrequested_family']) {
    const generator = adapter({ env, fetchImpl: async (_url, init) => { const context = JSON.parse(JSON.parse(init.body).prompt.split('\nCONTEXT_JSON\n')[1]); const item = draft(context); if (mutation === 'coverage') item.coverageCellId = 'other-cell'; if (mutation === 'hash') item.sourceContextSha256 = '0'.repeat(64); if (mutation === 'approval') item.state = 'published'; if (mutation === 'visual') item.visualSpec = null; if (mutation === 'option_alias') item.options = [22, '22', 21, 24]; if (mutation === 'unrequested_family') item.cognitiveIntent.taskFamily = 'Dil bilgisi'; return { ok: true, json: async () => response(mutation === 'duplicate' ? [item, item] : [item]) }; } });
    assert.equal((await generator.generate(request(), live)).status, 'invalid_provider_response', mutation);
  }
});
