import {createHash} from 'node:crypto';
import {isProxy} from 'node:util/types';
import {prepareScience678ClefPilot} from './science_678_clef_preflight.mjs';
import {closedScienceObject as closed, inertScienceData, freezeScienceData} from './science_678_data.mjs';

const LIMIT = 65536, DEADLINE_MS = 15000;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const milliseconds = start => Number(process.hrtime.bigint() - start) / 1e6;
class ClefFault extends Error { constructor(code) {super(code); this.code = code;} }
const fail = code => {throw new ClefFault(code);};

function readAuthority(value) {
  try {
    const copy = inertScienceData(value);
    if (!closed(copy, ['accountId', 'apiToken', 'freePlanVerified', 'allowLive', 'maxNewSpendUsd']) ||
        typeof copy.accountId !== 'string' || !/^[a-f0-9]{32}$/iu.test(copy.accountId) ||
        typeof copy.apiToken !== 'string' || !/^[a-z0-9_-]{20,512}$/iu.test(copy.apiToken) ||
        copy.freePlanVerified !== true || copy.allowLive !== true || copy.maxNewSpendUsd !== 0) throw new Error();
    return copy;
  } catch {throw new Error('invalid_science_clef_transport_authority');}
}

function readFetch(value) {
  try {
    if (!value || typeof value !== 'object' || isProxy(value) || Array.isArray(value) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error();
    const keys = Reflect.ownKeys(value), descriptor = Object.getOwnPropertyDescriptor(value, 'fetchImpl');
    if (keys.length !== 1 || keys[0] !== 'fetchImpl' || !descriptor || !Object.hasOwn(descriptor, 'value') ||
        descriptor.enumerable !== true || typeof descriptor.value !== 'function' || isProxy(descriptor.value)) throw new Error();
    return descriptor.value;
  } catch {throw new Error('invalid_science_clef_transport_dependency');}
}

// Inference, not a directly observed live Clef grammar:
// Clef model envelope: https://developers.cloudflare.com/workers-ai/models/clef-flash/
// System One / Jev drop-in + answers.<id>.noul:
// https://developers.cloudflare.com/changelog/product/workers-ai/ (1 October 2026)
// Exact noul and token usage example: https://developers.cloudflare.com/ai/models/typesafe/jev/
// REST wrapper: https://developers.cloudflare.com/workers-ai/get-started/rest-api/
// Free-plan hard stop (not a caller quota measurement): https://developers.cloudflare.com/workers-ai/platform/pricing/
// Unknown fields fail closed. A fixture parse is not provider availability or acceptance.
function parseAdvisory(bytes) {
  try {
    const text = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true}).decode(bytes);
    const parsed = JSON.parse(text);
    // JSON.parse otherwise silently accepts duplicated (including escaped) field names.
    const stack = [];
    for (const match of text.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\],:]/gu)) {
      const token = match[0], current = stack.at(-1);
      if (token === '{') {stack.push({kind: 'object', keyExpected: true, keys: new Set()}); if (stack.length > 24) throw new Error();}
      else if (token === '[') {stack.push({kind: 'array'}); if (stack.length > 24) throw new Error();}
      else if (token === '}' || token === ']') stack.pop();
      else if (token === ',' && current?.kind === 'object') current.keyExpected = true;
      else if (token.startsWith('"') && current?.kind === 'object' && current.keyExpected) {
        const key = JSON.parse(token); if (current.keys.has(key)) throw new Error();
        current.keys.add(key); current.keyExpected = false;
      }
    }
    const body = inertScienceData(parsed);
    if (!closed(body, ['result', 'success', 'errors', 'messages']) || body.success !== true ||
        !Array.isArray(body.errors) || body.errors.length !== 0 || !Array.isArray(body.messages) || body.messages.length !== 0 ||
        !closed(body.result, ['model', 'answers', 'usage']) || body.result.model !== 'clef-flash' ||
        !closed(body.result.answers, ['ambiguity', 'answer_supported', 'meb_style_fit']) ||
        !closed(body.result.usage, ['input_tokens', 'output_tokens'])) throw new Error();
    for (const decision of Object.values(body.result.answers)) {
      if (!closed(decision, ['type', 'noul']) || decision.type !== 'noul' ||
          typeof decision.noul !== 'number' || !Number.isFinite(decision.noul) || decision.noul < 0 || decision.noul > 1) throw new Error();
    }
    if (!Object.values(body.result.usage).every(value => Number.isSafeInteger(value) && value >= 0)) throw new Error();
    return {decisions: body.result.answers, usage: body.result.usage};
  } catch {fail('malformed_response');}
}

async function attemptRequest(row, endpoint, token, fetchImpl) {
  const started = process.hrtime.bigint(), controller = new AbortController();
  let response, reader, readComplete = false, cancelled = false, timedOut = false, timer;
  const item = {questionId: row.questionId, grade: row.grade, branch: row.branch, familyId: row.familyId,
    questionSha256: row.questionSha256, sourceBindingSha256: row.sourceBindingSha256, requestSha256: row.requestSha256,
    requestBytes: row.requestBytes, responseBytes: 0, responseSha256: null, httpStatus: null,
    state: 'failed', decisions: null, usage: null, errorCode: null, elapsedMs: 0};
  const cancel = () => {
    if (cancelled || readComplete || (!reader && (isProxy(response) || !(response instanceof Response)))) return;
    cancelled = true;
    try {const pending = reader ? reader.cancel() : response?.body?.cancel(); pending?.catch(() => {});} catch {}
  };
  const deadline = new Promise((_resolve, reject) => {
    timer = setTimeout(() => {timedOut = true; reject(new ClefFault('request_timed_out')); controller.abort(); cancel();}, DEADLINE_MS);
  });
  try {
    const body = JSON.stringify(row.request);
    if (row.requestBytes !== Buffer.byteLength(body) || row.requestBytes > LIMIT || row.requestSha256 !== hash(body)) fail('invalid_preflight_request');
    const operation = (async () => {
      response = await fetchImpl(endpoint, {method: 'POST', redirect: 'error', signal: controller.signal,
        headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}, body});
      if (isProxy(response) || !(response instanceof Response)) fail('unexpected_response');
      if (timedOut) {cancel(); fail('request_timed_out');}
      item.httpStatus = response.status;
      if (response.redirected) fail('unexpected_response');
      if (!response.ok) fail('http_rejected');
      if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(response.headers.get('content-type') ?? '') || !response.body) fail('unexpected_response');
      const advertised = response.headers.get('content-length');
      if (advertised !== null && (!/^[0-9]+$/u.test(advertised) || Number(advertised) > LIMIT)) fail('response_too_large');
      reader = response.body.getReader(); const chunks = [];
      while (true) {
        const next = await reader.read(); if (next.done) {readComplete = true; break;}
        if (!(next.value instanceof Uint8Array)) fail('unexpected_response');
        if (item.responseBytes + next.value.byteLength > LIMIT) fail('response_too_large');
        item.responseBytes += next.value.byteLength; chunks.push(Buffer.from(next.value));
      }
      const bytes = Buffer.concat(chunks); item.responseSha256 = hash(bytes);
      return parseAdvisory(bytes);
    })();
    const advisory = await Promise.race([operation, deadline]);
    item.decisions = advisory.decisions; item.usage = advisory.usage; item.state = 'advisory_scored';
  } catch (error) {
    item.errorCode = timedOut ? 'request_timed_out' : error instanceof ClefFault ? error.code : 'transport_failed';
    cancel();
  } finally {
    clearTimeout(timer); controller.abort();
    try {reader?.releaseLock();} catch {}
    item.elapsedMs = milliseconds(started);
  }
  return item;
}

// Explicit trusted fetch dependency is mandatory. Importing this module does not
// read credentials, call global fetch, prepare stock or run the provider.
export async function runScience678ClefPilot(authority, dependency) {
  if (arguments.length !== 2) throw new Error('invalid_science_clef_transport_arguments');
  const access = readAuthority(authority), fetchImpl = readFetch(dependency), started = process.hrtime.bigint();
  const plan = await prepareScience678ClefPilot();
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${access.accountId}/ai/run/@cf/cloudflare/clef-flash`;
  const items = []; let error = null;
  for (const row of plan.requests) {
    const item = await attemptRequest(row, endpoint, access.apiToken, fetchImpl); items.push(item);
    if (item.state !== 'advisory_scored') {error = {code: item.errorCode, requestIndex: items.length - 1}; break;}
  }
  const successful = items.filter(item => item.state === 'advisory_scored');
  return freezeScienceData({schemaVersion: 'science-678-clef-transport/v1',
    state: error ? 'stopped_on_error' : 'advisory_completed', schema_basis: 'primary_cross_doc_pending_live_confirmation',
    bankContentSha256: plan.bankContentSha256, preflightSha256: plan.preflightSha256,
    counts: {preparedRequests: 3, requestsAttempted: items.length, advisoryScreens: successful.length,
      decisionProbabilities: successful.length * 3, generatedQuestions: 0, publishedQuestions: 0},
    activity: {localJevScreens: plan.counts.localJevScreens, transportFetchCalls: items.length},
    provider: {model: 'clef-flash', configured: 'caller_supplied_authority', liveAccessVerified: false},
    budget: {allowedNewSpendUsd: 0, freePlanEvidence: 'caller_ui_attested', quotaMeasured: false,
      guaranteeBasis: 'cloudflare_workers_ai_free_plan_hard_stop'},
    visual: {inputMode: 'text_only', visualAuditPerformed: false, rasterInputsSent: 0, svgSentAsImage: false},
    usage: {input_tokens: successful.reduce((sum, item) => sum + item.usage.input_tokens, 0),
      output_tokens: successful.reduce((sum, item) => sum + item.usage.output_tokens, 0)},
    items, error, elapsedMs: milliseconds(started), autoApproved: false, publicationReady: false, learnerReady: false});
}
