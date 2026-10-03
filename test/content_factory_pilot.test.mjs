import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const pilot = await import('../packages/content-factory/pilot.mjs').catch(() => ({}));
const providers = await import('../packages/content-factory/providers.mjs').catch(() => ({}));
function requireFunction(module, name) { assert.equal(typeof module[name], 'function', `${name} is not implemented`); return module[name]; }
const metadata = {
  source: { sourceId: 'internal-authoring:rectangle-pilot', rightsStatus: 'owned_original', purpose: 'original_math_pilot' },
  curriculum: { mappingStatus: 'unresolved', registryEntryId: null, programVersion: null, grade: null, outcomeCode: null, sourceUrl: null, sourceSha256: null },
  governance: { ownerId: 'content-owner', stewardId: 'math-editor', purpose: 'review_only', retentionPolicyId: 'pilot-review-v1' },
};
function rectangle(overrides = {}) { return requireFunction(pilot, 'createRectangleQuestion')({ id: 'pilot-1', template: 'perimeter', width: 8, height: 3, metadata, ...overrides }); }
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function rehash(item) { item.contentSha256 = digest({ id: item.id, problem: item.problem, prompt: item.prompt, options: item.options, answerIndex: item.answerIndex, answerUnit: item.answerUnit, solutionGraph: item.solutionGraph, visual: item.visual, metadata: item.metadata, cognitiveIntent: item.cognitiveIntent, difficulty: item.difficulty }); }
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/s8kAAAAASUVORK5CYII=';
function raster(item, overrides = {}) { return { contentType: 'image/png', base64: PNG_BASE64, sha256: createHash('sha256').update(Buffer.from(PNG_BASE64, 'base64')).digest('hex'), sourceContentSha256: item.contentSha256, sourceVisualSha256: item.visual.sha256, reviewRecordId: 'raster-review-test-1', ...overrides }; }

test('perimeter solution, options and diagram encode the hand-checked answer 22', () => {
  const item = rectangle();
  assert.equal(item.options[item.answerIndex], 22);
  assert.equal(item.solutionGraph.at(-1).value, 22);
  assert.match(item.visual.svg, /8 cm/);
  assert.match(item.visual.svg, /3 cm/);
  assert.match(item.visual.alt, /8.*3/);
  assert.equal(new Set(item.options).size, 4);
  assert.equal(item.difficulty.calibrationStatus, 'AUTHOR_ESTIMATED');
  assert.equal(item.state, 'draft');
});

test('six reasoning families solve independent hand-checked fixtures', () => {
  const verify = requireFunction(pilot, 'validateQuestion');
  for (const [template, answer] of [['perimeter', 22], ['area', 24], ['width_from_area', 8], ['width_from_perimeter', 8], ['error_diagnosis', 22], ['fence_gap', 20]]) {
    const item = rectangle({ template, gate: 2 });
    assert.equal(item.options[item.answerIndex], answer, template);
    const report = verify(item);
    assert.equal(report.checks.numericAnswer, true, template);
    assert.equal(report.checks.geometry, true, template);
    assert.equal(report.checks.diagram, true, template);
    assert.equal(report.publishReady, false);
  }
});

test('independent verifier rejects a wrong selected option even when answer index is well formed', () => {
  const item = rectangle();
  item.answerIndex = (item.answerIndex + 1) % 4;
  const report = requireFunction(pilot, 'validateQuestion')(item);
  assert.equal(report.checks.numericAnswer, false);
  assert.ok(report.errors.includes('incorrect_answer_key'));
});

test('factory rejects zero, negative, non-integer, excessive sides and impossible gate geometry', () => {
  for (const width of [0, -1, 1.2, 101]) assert.throws(() => rectangle({ width }), /geometry/);
  assert.throws(() => rectangle({ template: 'fence_gap', gate: 23 }), /geometry/);
});

test('a missing visual alt text blocks automated readiness', () => {
  const item = rectangle();
  item.visual.alt = '';
  const report = requireFunction(pilot, 'validateQuestion')(item);
  assert.equal(report.checks.accessibility, false);
  assert.ok(report.errors.includes('missing_visual_alt'));
});

test('source and curriculum references are required and unresolved mapping remains a draft', () => {
  const verify = requireFunction(pilot, 'validateQuestion');
  const item = rectangle();
  item.metadata.source = null;
  item.metadata.curriculum = null;
  const report = verify(item);
  assert.ok(report.errors.includes('missing_source_metadata'));
  assert.ok(report.errors.includes('missing_curriculum_metadata'));
  const unresolved = verify(rectangle());
  assert.equal(unresolved.state, 'draft');
  assert.ok(unresolved.pending.includes('canonical_curriculum_mapping'));
});

test('caller claims of expert approval cannot bypass the unconnected trusted review gate', () => {
  const item = rectangle();
  item.state = 'expert_approved';
  item.expertApproval = { approved: true, reviewerId: 'caller' };
  const result = requireFunction(pilot, 'requestStateTransition')(item, 'published');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'trusted_review_store_not_connected');
  assert.equal(requireFunction(pilot, 'validateQuestion')(item).state, 'draft');
});

test('changed geometry with stale diagram and stale solution is rejected', () => {
  const item = rectangle();
  item.problem.width = 9;
  const report = requireFunction(pilot, 'validateQuestion')(item);
  assert.equal(report.checks.numericAnswer, false);
  assert.equal(report.checks.diagram, false);
  assert.equal(report.checks.solutionGraph, false);
  assert.equal(report.checks.integrity, false);
});

test('rehashing changed prompt, unit or alt does not evade semantic binding to geometry', () => {
  for (const field of ['prompt', 'answerUnit', 'alt']) {
    const item = rectangle();
    if (field === 'prompt') item.prompt = 'Bu dikdörtgenin alanı kaçtır?';
    if (field === 'answerUnit') item.answerUnit = 'cm³';
    if (field === 'alt') { item.visual.alt = 'Yanlış çizim: bir üçgenin üç kenarı.'; item.visual.sha256 = digest({ svg: item.visual.svg, alt: item.visual.alt }); }
    rehash(item);
    const report = requireFunction(pilot, 'validateQuestion')(item);
    assert.equal(report.checks.integrity, true, field);
    assert.equal(report.checks.semanticBinding, false, field);
    assert.equal(report.localMathChecks, 'failed', field);
  }
});

test('same numeric problem with rewritten text is a duplicate, not a fresh question', () => {
  const first = rectangle();
  const reskin = rectangle({ id: 'pilot-2' });
  reskin.prompt = 'Başka bir hikâye içinde aynı dikdörtgenin çevresini bulun.';
  const result = requireFunction(pilot, 'auditBatch')([first, reskin]);
  assert.equal(result.items.length, 1);
  assert.equal(result.rejections[0].reason, 'duplicate_problem');
});

test('rotating a fully given rectangle does not evade near-duplicate rejection', () => {
  const result = requireFunction(pilot, 'auditBatch')([rectangle(), rectangle({ id: 'rotated', width: 3, height: 8 })]);
  assert.equal(result.items.length, 1);
  assert.equal(result.rejections[0].reason, 'duplicate_problem');
});

test('100 candidates are reduced to twelve drafts by duplicate and six-family variant gates', () => {
  const result = requireFunction(pilot, 'createPilotBatch')({ requested: 100, metadata });
  assert.equal(result.summary.requested, 100);
  assert.equal(result.summary.producedDrafts, 12);
  assert.equal(result.summary.rejected, 88);
  assert.equal(result.summary.mathematicallyVerified, 12);
  assert.equal(result.summary.published, 0);
  assert.equal(result.summary.semanticFamilies, 6);
  assert.ok(result.rejections.every(row => ['low_diversity_variant_cap', 'duplicate_problem'].includes(row.reason)));
  assert.ok(result.rejections.some(row => row.reason === 'duplicate_problem'));
  assert.ok(result.rejections.some(row => row.reason === 'low_diversity_variant_cap'));
  assert.throws(() => requireFunction(pilot, 'createPilotBatch')({ requested: 101, metadata }), /batch_limit/);
});

test('storyboard and transcript use the verified solution graph and reject stale solutions', () => {
  const create = requireFunction(pilot, 'createStoryboard');
  const item = rectangle();
  const scene = create(item);
  assert.equal(scene.format, 'svg-step-storyboard/v1');
  assert.equal(scene.frames.at(-1).value, 22);
  assert.match(scene.transcript, /22/);
  assert.equal(scene.videoRendered, false);
  item.solutionGraph.at(-1).value = 33;
  assert.throws(() => create(item), /unverified_solution/);
});

test('lesson factory derives worked examples and misconception hints only from verified math', () => {
  const lesson = requireFunction(pilot, 'createLesson')(rectangle());
  assert.equal(lesson.state, 'draft');
  assert.equal(lesson.workedExample.answer, 22);
  assert.match(lesson.teacherHint, /alan/);
  assert.equal(lesson.metadata.curriculum.mappingStatus, 'unresolved');
  const broken = rectangle();
  broken.options[broken.answerIndex] = 23;
  assert.throws(() => requireFunction(pilot, 'createLesson')(broken), /unverified_solution/);
});

test('generator request is bounded and declares curriculum, rights and visual obligations', () => {
  const request = requireFunction(providers, 'buildGenerationRequest')({ count: 12, metadata, coverageCellId: 'pilot:rectangle', requiredVisual: true });
  assert.equal(request.count, 12);
  assert.equal(request.outputState, 'draft');
  assert.equal(request.constraints.copySourceQuestions, false);
  assert.equal(request.constraints.requiredVisual, true);
  assert.equal(request.requiredFields.includes('solutionGraph'), true);
  assert.throws(() => requireFunction(providers, 'buildGenerationRequest')({ count: 101, metadata }), /batch_limit/);
});

test('absent generation and Clef credentials produce model_not_configured, not a successful audit', async () => {
  const generator = await requireFunction(providers, 'runGenerationProvider')({ count: 1 }, {});
  assert.equal(generator.status, 'model_not_configured');
  let calls = 0;
  const clef = requireFunction(providers, 'createClefAdapter')({ env: {}, fetchImpl: () => { calls++; } });
  const result = await clef.evaluate(rectangle());
  assert.equal(result.status, 'model_not_configured');
  assert.equal(calls, 0);
});

test('generation transport output cannot set a trusted publication state and excessive results fail closed', async () => {
  const invoke = requireFunction(providers, 'runGenerationProvider');
  const result = await invoke({ count: 1 }, { providerId: 'test-transport', generate: async () => [{ id: 'x', state: 'published', expertApproval: { approved: true } }] });
  assert.equal(result.status, 'unvalidated_drafts');
  assert.equal(result.items[0].state, 'draft');
  assert.equal(Object.hasOwn(result.items[0], 'expertApproval'), false);
  const excessive = await invoke({ count: 1 }, { providerId: 'test-transport', generate: async () => [{ id: 'x' }, { id: 'y' }] });
  assert.equal(excessive.status, 'invalid_provider_response');
  assert.deepEqual(excessive.items, []);
});

test('Clef text request uses official typed QA endpoint without treating confidence as approval', async () => {
  let observed;
  const clef = requireFunction(providers, 'createClefAdapter')({
    env: { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'test-only-not-a-real-key' },
    fetchImpl: async (url, init) => {
      observed = { url, body: JSON.parse(init.body) };
      return { ok: true, json: async () => ({ success: true, result: { model: 'clef-flash', answers: { ambiguous: { type: 'noul', noul: 0.01 }, answer_supported: { type: 'noul', noul: 0.99 } }, usage: { input_tokens: 120, output_tokens: 0 } } }) };
    },
  });
  const result = await clef.evaluate(rectangle());
  assert.equal(observed.url, `https://api.cloudflare.com/client/v4/accounts/${'a'.repeat(32)}/ai/run/@cf/cloudflare/clef-flash`);
  assert.equal(observed.body.model, 'clef-flash');
  assert.equal(observed.body.questions.ambiguous.type, 'noul');
  assert.equal(result.status, 'advisory_only');
  assert.equal(result.publishReady, false);
  assert.equal(result.visualAuditStatus, 'not_run_svg_requires_rasterization');
  assert.equal(JSON.stringify(result).includes('test-only-not-a-real-key'), false);
});

test('review-referenced PNG is bound to current question and sent as official embedded image object', async () => {
  const item = rectangle();
  let body;
  const adapter = requireFunction(providers, 'createClefAdapter')({ env: { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'test-only-not-a-real-key' }, fetchImpl: async (_url, init) => {
    body = JSON.parse(init.body);
    return { ok: true, json: async () => ({ success: true, result: { model: 'clef-flash', answers: { ambiguous: { type: 'noul', noul: 0.02 }, answer_supported: { type: 'noul', noul: 0.97 }, diagram_aligned: { type: 'noul', noul: 0.94 } }, usage: { input_tokens: 250, output_tokens: 0 } } }) };
  } });
  const result = await adapter.evaluate(item, { reviewedRasters: [raster(item)] });
  assert.deepEqual(body.images, [{ content_type: 'image/png', base64: PNG_BASE64 }]);
  assert.equal(body.questions.diagram_aligned.type, 'noul');
  assert.equal(result.status, 'advisory_only');
  assert.equal(result.visualAuditStatus, 'advisory_result_not_expert_approval');
  assert.equal(result.publishReady, false);
});

test('Clef vision rejects URLs, SVG, MIME mismatch, stale source/digest and missing review reference without network', async () => {
  const item = rectangle();
  let calls = 0;
  const adapter = requireFunction(providers, 'createClefAdapter')({ env: { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'test-only-not-a-real-key' }, fetchImpl: async () => { calls++; throw new Error('network_should_not_be_called'); } });
  const invalid = [
    { base64: 'https://example.org/a.png' }, { contentType: 'image/svg+xml' }, { contentType: 'image/jpeg' },
    { sourceContentSha256: '0'.repeat(64) }, { sourceVisualSha256: '0'.repeat(64) }, { sha256: '0'.repeat(64) }, { reviewRecordId: '' },
  ];
  for (const change of invalid) assert.equal((await adapter.evaluate(item, { reviewedRasters: [raster(item, change)] })).status, 'invalid_raster');
  assert.equal((await adapter.evaluate(item, { reviewedRasters: Array.from({ length: 5 }, () => raster(item)) })).status, 'invalid_raster');
  assert.equal(calls, 0);
});

test('Clef image byte, megapixel and aggregate bounds fail before a network request', async () => {
  const item = rectangle();
  let calls = 0;
  const adapter = requireFunction(providers, 'createClefAdapter')({ env: { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'test-only-not-a-real-key' }, fetchImpl: async () => { calls++; throw new Error('network_should_not_be_called'); } });
  const large = Buffer.alloc(4 * 1024 * 1024 + 1); Buffer.from(PNG_BASE64, 'base64').copy(large);
  const tooManyPixels = Buffer.from(PNG_BASE64, 'base64'); tooManyPixels.writeUInt32BE(5000, 16); tooManyPixels.writeUInt32BE(4000, 20);
  const threeMB = Buffer.alloc(3 * 1024 * 1024); Buffer.from(PNG_BASE64, 'base64').copy(threeMB);
  const image = bytes => raster(item, { base64: bytes.toString('base64'), sha256: createHash('sha256').update(bytes).digest('hex') });
  assert.equal((await adapter.evaluate(item, { reviewedRasters: [image(large)] })).status, 'invalid_raster');
  assert.equal((await adapter.evaluate(item, { reviewedRasters: [image(tooManyPixels)] })).status, 'invalid_raster');
  assert.equal((await adapter.evaluate(item, { reviewedRasters: [image(threeMB), image(threeMB), image(threeMB)] })).status, 'invalid_raster');
  assert.equal(calls, 0);
});

test('untyped probabilities and malformed official Clef response do not become advisory results', async () => {
  const adapter = requireFunction(providers, 'createClefAdapter')({ env: { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'test-only-not-a-real-key' }, fetchImpl: async () => ({ ok: true, json: async () => ({ success: true, result: { model: 'clef-flash', answers: { ambiguous: 0.02, answer_supported: 0.97 } } }) }) });
  assert.equal((await adapter.evaluate(rectangle())).status, 'invalid_provider_response');
});

test('Clef server errors fail closed and never return secret-bearing upstream text', async () => {
  const clef = requireFunction(providers, 'createClefAdapter')({
    env: { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_AUTH_TOKEN: 'test-only-not-a-real-key' },
    fetchImpl: async () => ({ ok: false, status: 401, text: async () => 'Authorization: Bearer test-only-not-a-real-key' }),
  });
  const result = await clef.evaluate(rectangle());
  assert.equal(result.status, 'provider_error');
  assert.equal(JSON.stringify(result).includes('test-only-not-a-real-key'), false);
});

test('CLI produces private-review JSON, vector diagrams and playable step HTML without a network call', async () => {
  const out = await mkdtemp(join(tmpdir(), 'k12-factory-test-'));
  try {
    const processResult = spawnSync(process.execPath, ['tools/content_factory_pilot.mjs', '--count', '100', '--out', out], { cwd: new URL('..', import.meta.url), encoding: 'utf8', env: { PATH: process.env.PATH } });
    assert.equal(processResult.status, 0, processResult.stderr);
    const report = JSON.parse(await readFile(join(out, 'audit.json'), 'utf8'));
    assert.equal(report.summary.producedDrafts, 12);
    assert.equal(report.providerStatus.clef, 'not_invoked');
    assert.equal(report.summary.published, 0);
    assert.equal((await readdir(join(out, 'diagrams'))).length, 12);
    const html = await readFile(join(out, 'preview.html'), 'utf8');
    assert.match(html, /Taslak/);
    assert.match(html, /data-step/);
    assert.match(html, /Kenarları 2 cm ve 2 cm/);
  } finally { await rm(out, { recursive: true, force: true }); }
});
