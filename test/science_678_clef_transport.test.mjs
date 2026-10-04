import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {prepareScience678ClefPilot} from '../packages/content-factory/science_678_clef_preflight.mjs';

const api = await import('../packages/content-factory/science_678_clef_transport.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const ACCOUNT = '0123456789abcdef0123456789abcdef';
const TOKEN = 'synthetic-fixture-token-not-a-real-credential';
const AUTHORITY = {accountId: ACCOUNT, apiToken: TOKEN, freePlanVerified: true, allowLive: true, maxNewSpendUsd: 0};
const IDS = ['YF6-06', 'YF7-04', 'YF8-01'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const responseBody = () => ({result: {model: 'clef-flash', answers: {
  ambiguity: {type: 'noul', noul: 0.02}, answer_supported: {type: 'noul', noul: 0.98}, meb_style_fit: {type: 'noul', noul: 0.75},
}, usage: {input_tokens: 120, output_tokens: 0}}, success: true, errors: [], messages: []});
const jsonResponse = body => new Response(JSON.stringify(body), {headers: {'Content-Type': 'application/json'}});
async function run(authority, dependency) {
  assert.equal(typeof api.runScience678ClefPilot, 'function', 'closed science Clef transport is missing');
  return api.runScience678ClefPilot(authority, dependency);
}
const checkNoAuthorityLeak = result => {
  const serialized = JSON.stringify(result);
  for (const secret of [ACCOUNT, TOKEN, 'Bearer', 'Authorization', 'api.cloudflare.com', '/Users/', 'CLOUDFLARE_']) {
    assert.equal(serialized.includes(secret), false, `private transport authority leaked: ${secret}`);
  }
};

test('three real prepared requests run sequentially and preserve typed bounded advisory results', async () => {
  const plan = await prepareScience678ClefPilot(), calls = []; let active = 0, peak = 0;
  const result = await run(AUTHORITY, {fetchImpl: async (url, init) => {
    active++; peak = Math.max(peak, active);
    calls.push({url, init});
    await Promise.resolve(); active--;
    const body = responseBody(), index = calls.length - 1;
    body.result.answers.ambiguity.noul = [0.02, 0.05, 0.08][index];
    body.result.answers.answer_supported.noul = [0.98, 0.95, 0.92][index];
    body.result.usage.input_tokens = [120, 150, 180][index];
    body.result.usage.output_tokens = [0, 1, 2][index];
    return jsonResponse(body);
  }});
  assert.equal(peak, 1);
  assert.equal(result.schemaVersion, 'science-678-clef-transport/v1');
  assert.equal(result.state, 'advisory_completed');
  assert.deepEqual(result.counts, {preparedRequests: 3, requestsAttempted: 3, advisoryScreens: 3,
    decisionProbabilities: 9, generatedQuestions: 0, publishedQuestions: 0});
  assert.equal(result.preflightSha256, plan.preflightSha256);
  assert.equal(result.bankContentSha256, plan.bankContentSha256);
  assert.deepEqual(result.items.map(row => row.questionId), IDS);
  assert.deepEqual(result.items.map(row => row.decisions), [
    {ambiguity: {type: 'noul', noul: 0.02}, answer_supported: {type: 'noul', noul: 0.98}, meb_style_fit: {type: 'noul', noul: 0.75}},
    {ambiguity: {type: 'noul', noul: 0.05}, answer_supported: {type: 'noul', noul: 0.95}, meb_style_fit: {type: 'noul', noul: 0.75}},
    {ambiguity: {type: 'noul', noul: 0.08}, answer_supported: {type: 'noul', noul: 0.92}, meb_style_fit: {type: 'noul', noul: 0.75}},
  ]);
  assert.deepEqual(result.usage, {input_tokens: 450, output_tokens: 3});
  assert.equal(result.schema_basis, 'primary_cross_doc_pending_live_confirmation');
  assert.ok(Number.isFinite(result.elapsedMs) && result.elapsedMs > 0);
  assert.ok(Object.isFrozen(result.items[0].decisions.ambiguity));
  for (const [index, {url, init}] of calls.entries()) {
    assert.equal(url, `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/@cf/cloudflare/clef-flash`);
    assert.equal(init.method, 'POST'); assert.equal(init.redirect, 'error');
    assert.equal(init.headers.Authorization, `Bearer ${TOKEN}`);
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.ok(init.signal instanceof AbortSignal);
    assert.equal(init.body, JSON.stringify(plan.requests[index].request));
    assert.ok(Buffer.byteLength(init.body) <= 65536);
    assert.equal(result.items[index].requestSha256, hash(init.body));
    assert.equal(result.items[index].questionSha256, plan.requests[index].questionSha256);
    assert.equal(result.items[index].sourceBindingSha256, plan.requests[index].sourceBindingSha256);
    assert.equal(result.items[index].state, 'advisory_scored');
    assert.ok(Number.isFinite(result.items[index].elapsedMs) && result.items[index].elapsedMs > 0);
    assert.match(result.items[index].responseSha256, /^[a-f0-9]{64}$/u);
  }
  checkNoAuthorityLeak(result);
});

test('a perfect model answer never transfers source approval or publication authority', async () => {
  const result = await run(AUTHORITY, {fetchImpl: async () => {
    const body = responseBody(); body.result.answers.ambiguity.noul = 0; body.result.answers.answer_supported.noul = 1;
    return jsonResponse(body);
  }});
  assert.equal(result.autoApproved, false); assert.equal(result.publicationReady, false); assert.equal(result.learnerReady, false);
  assert.equal(result.provider.liveAccessVerified, false);
  assert.deepEqual(result.visual, {inputMode: 'text_only', visualAuditPerformed: false, rasterInputsSent: 0, svgSentAsImage: false});
  assert.deepEqual(result.budget, {allowedNewSpendUsd: 0, freePlanEvidence: 'caller_ui_attested', quotaMeasured: false,
    guaranteeBasis: 'cloudflare_workers_ai_free_plan_hard_stop'});
  for (const field of ['mebApproved', 'expertApproved', 'zeroError', 'costUsd', 'creditsRemaining', 'availableNeurons']) {
    assert.equal(Object.hasOwn(result, field), false);
  }
});

test('the first HTTP rejection stops without retry or reading the upstream error body', async () => {
  let calls = 0, read = 0;
  const result = await run(AUTHORITY, {fetchImpl: async () => {
    calls++;
    return new Response(new ReadableStream({pull(controller) {read++; controller.enqueue(new TextEncoder().encode(TOKEN));}}), {status: 429});
  }});
  assert.equal(calls, 1); assert.ok(read <= 1, 'stream was explicitly read after HTTP failure');
  assert.equal(result.state, 'stopped_on_error'); assert.equal(result.error.code, 'http_rejected');
  assert.equal(result.error.requestIndex, 0); assert.equal(result.items[0].httpStatus, 429);
  assert.equal(result.items[0].decisions, null); assert.equal(result.items[0].usage, null);
  assert.equal(result.counts.requestsAttempted, 1); assert.equal(result.counts.advisoryScreens, 0);
  checkNoAuthorityLeak(result);
});

test('a second request failure retains only the first verified advisory and stops the third', async () => {
  let calls = 0;
  const result = await run(AUTHORITY, {fetchImpl: async () => ++calls === 1 ? jsonResponse(responseBody()) : jsonResponse({success: false})});
  assert.equal(calls, 2); assert.equal(result.error.requestIndex, 1);
  assert.equal(result.error.code, 'malformed_response');
  assert.equal(result.counts.advisoryScreens, 1); assert.equal(result.counts.decisionProbabilities, 3);
  assert.deepEqual(result.usage, {input_tokens: 120, output_tokens: 0});
  assert.deepEqual(result.items.map(row => row.state), ['advisory_scored', 'failed']);
});

test('upstream exceptions cannot echo authority secrets or trigger retries', async () => {
  let calls = 0;
  const result = await run(AUTHORITY, {fetchImpl: async () => {calls++; throw new Error(`${TOKEN} ${ACCOUNT}`);}});
  assert.equal(calls, 1); assert.equal(result.error.code, 'transport_failed');
  assert.equal(result.counts.advisoryScreens, 0); checkNoAuthorityLeak(result);
});

test('unknown probability and usage shapes fail closed instead of becoming advisory successes', async () => {
  const mutations = [
    b => {b.success = false;}, b => {b.result.model = 'clef';}, b => {delete b.result.answers.answer_supported;},
    b => {b.result.answers.approve = {type: 'noul', noul: 1};}, b => {b.result.answers.ambiguity = 0.1;},
    b => {b.result.answers.ambiguity.type = 'score';}, b => {b.result.answers.ambiguity.noul = '0.1';},
    b => {b.result.answers.ambiguity.noul = -0.01;}, b => {b.result.answers.ambiguity.noul = 1.01;},
    b => {b.result.answers.ambiguity.confidence = 1;}, b => {delete b.result.usage;},
    b => {b.result.usage.input_tokens = 1.5;}, b => {b.result.usage.output_tokens = -1;},
    b => {b.result.usage.neurons = 4;}, b => {b.result.text = TOKEN;}, b => {b.errors = [{message: TOKEN}];},
    b => {b.messages = [TOKEN];}, b => {b.publicationReady = true;},
  ];
  for (const mutate of mutations) {
    const body = responseBody(); mutate(body); let calls = 0;
    const result = await run(AUTHORITY, {fetchImpl: async () => {calls++; return jsonResponse(body);}});
    assert.equal(result.state, 'stopped_on_error'); assert.equal(result.error.code, 'malformed_response');
    assert.equal(calls, 1); assert.equal(result.counts.advisoryScreens, 0);
    assert.equal(result.items[0].decisions, null); checkNoAuthorityLeak(result);
  }
});

test('a non JSON response and a forged redirected response stop before advisory parsing', async () => {
  const redirected = jsonResponse(responseBody()); Object.defineProperty(redirected, 'redirected', {value: true});
  for (const response of [new Response('<html>Not an answer</html>', {headers: {'Content-Type': 'text/html'}}),
    redirected, {}]) {
    let calls = 0;
    const result = await run(AUTHORITY, {fetchImpl: async () => {calls++; return response;}});
    assert.equal(calls, 1); assert.equal(result.error.code, 'unexpected_response');
    assert.equal(result.counts.advisoryScreens, 0);
  }
});

test('an advertised oversized response stops without collecting the body', async () => {
  let cancelled = 0;
  const response = new Response(new ReadableStream({cancel() {cancelled++;}}), {
    headers: {'Content-Type': 'application/json', 'Content-Length': '65537'},
  });
  const result = await run(AUTHORITY, {fetchImpl: async () => response});
  assert.equal(result.error.code, 'response_too_large'); assert.equal(result.items[0].responseBytes, 0);
  assert.equal(result.items[0].responseSha256, null); assert.equal(cancelled, 1);
});

test('streaming responses enforce the 64 KiB ceiling without trusting missing or false length headers', async () => {
  for (const advertisedLength of [null, '20']) {
    let cancelled = 0, pulls = 0;
    const headers = {'Content-Type': 'application/json'};
    if (advertisedLength) headers['Content-Length'] = advertisedLength;
    const result = await run(AUTHORITY, {fetchImpl: async () => new Response(new ReadableStream({
      pull(controller) {pulls++; controller.enqueue(new Uint8Array(32769));}, cancel() {cancelled++;},
    }), {headers})});
    assert.equal(result.error.code, 'response_too_large'); assert.equal(result.counts.advisoryScreens, 0);
    assert.equal(cancelled, 1); assert.ok(pulls <= 3); assert.ok(result.items[0].responseBytes <= 65536);
  }
});

test('invalid UTF-8, duplicate JSON keys and trailing bytes cannot silently become probabilities', async () => {
  const good = JSON.stringify(responseBody());
  const duplicate = good.replace('"noul":0.02', '"noul":0.9,"noul":0.02');
  for (const bytes of [Buffer.from([0xff]), Buffer.from(duplicate), Buffer.from(`${good}x`), Buffer.from('null')]) {
    const result = await run(AUTHORITY, {fetchImpl: async () => new Response(bytes, {headers: {'Content-Type': 'application/json'}})});
    assert.equal(result.error.code, 'malformed_response'); assert.equal(result.counts.advisoryScreens, 0);
  }
});

test('closed authority and dependency shapes reject without evaluating hostile getters or proxies', async () => {
  assert.equal(typeof api.runScience678ClefPilot, 'function', 'closed science Clef transport is missing');
  let hooks = 0, calls = 0;
  const getter = {...AUTHORITY}; Object.defineProperty(getter, 'apiToken', {enumerable: true, get() {hooks++; return TOKEN;}});
  const proxy = new Proxy(AUTHORITY, {get() {hooks++;}, ownKeys() {hooks++; return [];}});
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cycle = {...AUTHORITY}; cycle.loop = cycle;
  const dependencies = {fetchImpl: async () => {calls++; return jsonResponse(responseBody());}};
  for (const authority of [getter, proxy, revoked.proxy, cycle, null, undefined, [],
    {...AUTHORITY, toJSON() {hooks++; return AUTHORITY;}}, {...AUTHORITY, maxNewSpendUsd: 0.01},
    {...AUTHORITY, freePlanVerified: false}, {...AUTHORITY, allowLive: false}, {...AUTHORITY, model: 'other'},
    {...AUTHORITY, accountId: `${ACCOUNT}/../../`}, {...AUTHORITY, apiToken: `bad\r\n${TOKEN}`}]) {
    await assert.rejects(() => api.runScience678ClefPilot(authority, dependencies), /invalid_science_clef_transport_authority/u);
  }
  const dependencyGetter = {}; Object.defineProperty(dependencyGetter, 'fetchImpl', {enumerable: true, get() {hooks++; return dependencies.fetchImpl;}});
  const dependencyProxy = new Proxy(dependencies, {ownKeys() {hooks++; return ['fetchImpl'];}});
  const functionProxy = new Proxy(dependencies.fetchImpl, {apply() {hooks++;}});
  for (const dependency of [dependencyGetter, dependencyProxy, revoked.proxy, {fetchImpl: functionProxy}, null, undefined, [],
    {...dependencies, request: {}}, {...dependencies, url: 'https://elsewhere.invalid/'}, {fetchImpl: null}]) {
    await assert.rejects(() => api.runScience678ClefPilot(AUTHORITY, dependency), /invalid_science_clef_transport_dependency/u);
  }
  await assert.rejects(() => api.runScience678ClefPilot(AUTHORITY, dependencies, {}), /invalid_science_clef_transport_arguments/u);
  await assert.rejects(() => api.runScience678ClefPilot(), /invalid_science_clef_transport_arguments/u);
  assert.equal(hooks, 0); assert.equal(calls, 0);
});

test('import and fixture transport never read Cloudflare environment fields or call global fetch', async () => {
  assert.equal(typeof api.runScience678ClefPilot, 'function', 'closed science Clef transport is missing');
  const script = `
    let calls=0, reads=0;
    globalThis.fetch=async()=>{calls++;throw new Error('global_network_forbidden');};
    const original=process.env;
    process.env=new Proxy(original,{get(target,key){if(typeof key==='string'&&key.startsWith('CLOUDFLARE_')){reads++;throw new Error('env_forbidden');}return Reflect.get(target,key);}});
    const {runScience678ClefPilot}=await import('./packages/content-factory/science_678_clef_transport.mjs');
    const afterImport={calls,reads};
    const authority=${JSON.stringify(AUTHORITY)};
    const body=${JSON.stringify(responseBody())};
    const result=await runScience678ClefPilot(authority,{fetchImpl:async()=>new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json'}})});
    process.env=original;
    process.stdout.write(JSON.stringify({afterImport,calls,reads,state:result.state}));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', script], {cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 10000});
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), {afterImport: {calls: 0, reads: 0}, calls: 0, reads: 0, state: 'advisory_completed'});
});

test('one owned 15 second deadline aborts a stalled response stream and stops further requests', {timeout: 18000}, async () => {
  let calls = 0, cancelled = 0, signal;
  const start = performance.now();
  const result = await run(AUTHORITY, {fetchImpl: async (_url, init) => {
    calls++; signal = init.signal;
    return new Response(new ReadableStream({cancel() {cancelled++;}}), {headers: {'Content-Type': 'application/json'}});
  }});
  const elapsed = performance.now() - start;
  assert.equal(calls, 1); assert.equal(result.error.code, 'request_timed_out');
  assert.equal(signal.aborted, true); assert.equal(cancelled, 1);
  assert.ok(elapsed >= 14900 && elapsed < 17500, `owned deadline took ${elapsed} ms`);
  assert.equal(result.counts.advisoryScreens, 0);
});

test('a fetch that ignores abort is timed out and its late response is cancelled without late parsing', {timeout: 18000}, async () => {
  let release, calls = 0, cancelled = 0, signal;
  const late = new Promise(resolve => {release = resolve;});
  const result = await run(AUTHORITY, {fetchImpl: async (_url, init) => {calls++; signal = init.signal; return late;}});
  assert.equal(result.error.code, 'request_timed_out'); assert.equal(signal.aborted, true);
  assert.equal(calls, 1); assert.equal(result.items[0].responseBytes, 0); assert.equal(result.items[0].responseSha256, null);
  release(new Response(new ReadableStream({cancel() {cancelled++;}}), {headers: {'Content-Type': 'application/json'}}));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(cancelled, 1, 'late response resource survived the closed request deadline');
  assert.equal(result.items[0].decisions, null); assert.equal(calls, 1);
});
