#!/usr/bin/env node
// Isolated editor/learner-layout experiment. The fixed executor below is a
// bounded memory test double, NOT a PostgreSQL driver or an authenticated user.
import { pathToFileURL } from 'node:url';
import { isProxy } from 'node:util/types';
import { createSyntheticNotebookFixture, createSyntheticNotebookReceipt, hashSyntheticNotebook }
  from '../test/support/synthetic_notebook_fixture.mjs';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
import { SYNTHETIC_NOTEBOOK_ADAPTER_SQL as SQL } from '../packages/contracts/synthetic_notebook_adapter.mjs';

export function parseSyntheticNotebookDeskPreviewArgs(argv) {
  const fail = () => { throw new Error('invalid_synthetic_notebook_desk_preview_args'); };
  if (isProxy(argv) || !Array.isArray(argv) || Object.getPrototypeOf(argv) !== Array.prototype) fail();
  const fields = Object.getOwnPropertyDescriptors(argv), length = fields.length?.value;
  if (![0, 2, 4, 6].includes(length) || Reflect.ownKeys(fields).length !== length + 1) fail();
  const args = [];
  for (let index = 0; index < length; index++) {
    const field = fields[String(index)];
    if (!field?.enumerable || !Object.hasOwn(field, 'value') || typeof field.value !== 'string') fail();
    args.push(field.value);
  }
  let host = '127.0.0.1', port = 3340, scenario = 'normal', hostSeen = false, portSeen = false, scenarioSeen = false;
  for (let index = 0; index < length; index += 2) {
    if (args[index] === '--port' && !portSeen) {
      if (!/^(?:0|[1-9]\d{3,4})$/u.test(args[index + 1])) fail();
      port = Number(args[index + 1]); portSeen = true;
      if (port !== 0 && (port < 1024 || port > 65535)) fail();
    } else if (args[index] === '--scenario' && !scenarioSeen && ['normal', 'reply-loss'].includes(args[index + 1])) {
      scenario = args[index + 1]; scenarioSeen = true;
    } else if (args[index] === '--host' && !hostSeen && ['127.0.0.1', '::1'].includes(args[index + 1])) {
      host = args[index + 1]; hostSeen = true;
    } else fail();
  }
  return Object.freeze({ host, port, scenario });
}

function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

/** Trusted fixed preview composition only. No caller fixture/SQL/body option,
 * real account, disk persistence, DB, cloud, telemetry or learning inference.
 */
export function createSyntheticNotebookDeskPreviewExecutor(scenario) {
  if (arguments.length !== 1 || !['normal', 'reply-loss'].includes(scenario)) throw new Error('invalid_synthetic_notebook_preview_scenario');
  const sourceFixture = freeze(createSyntheticNotebookFixture('a'));
  const scopeSha256 = hashSyntheticNotebook('scope', sourceFixture.scope);
  const empty = createSyntheticNotebookSyncPreparer(sourceFixture).prepare({ contractVersion: '1.0.0',
    mutationId: 'preview-binding-probe', idempotencyKey: 'preview-binding-probe', expectedRevision: 0,
    body: { text: '', strokes: [], bookmarks: { questions: [], topics: [] }, notes: [], concerns: [] } });
  if (!empty.valid) throw new Error('synthetic_memory_fixture_unavailable');
  const governanceBinding = empty.intent.governanceBinding;
  let head = null, replyLossUsed = false;
  const byKey = new Map(), byMutation = new Map();
  const row = value => freeze({ rowCount: 1, rows: [{ notebook_result: value }] });
  const denied = () => { throw new Error('synthetic_memory_query_denied'); };
  const conflict = code => { const error = new Error('synthetic_memory_conflict'); error.code = code; throw error; };
  function execute(query) {
    // Queries originate only from the existing branded adapter, never HTTP.
    if (!query || isProxy(query) || !Object.isFrozen(query) || !Object.isFrozen(query.values)
      || Object.keys(query).join(',') !== 'text,values' || !Array.isArray(query.values) || query.values.length !== 1) denied();
    if (query.text === SQL.current) {
      if (query.values[0] !== scopeSha256) denied();
      return row({ scope: sourceFixture.scope, scopeSha256, revision: head?.receipt.resultingRevision ?? 0,
        body: head?.request.body ?? null, bodySha256: head?.receipt.bodySha256 ?? null,
        receipt: head?.receipt ?? null, governanceBinding, syntheticOnly: true, productionReady: false });
    }
    if (query.text !== SQL.commit || typeof query.values[0] !== 'string' || Buffer.byteLength(query.values[0]) > 262144) denied();
    let intent;
    try { intent = JSON.parse(query.values[0]); } catch { denied(); }
    if (!intent || intent.scopeSha256 !== scopeSha256 || intent.contractVersion !== '1.0.0'
      || hashSyntheticNotebook('scope', intent.scope) !== scopeSha256) denied();
    const request = freeze({ contractVersion: intent.contractVersion, mutationId: intent.mutationId,
      idempotencyKey: intent.idempotencyKey, expectedRevision: intent.expectedRevision, body: intent.body });
    const receipt = createSyntheticNotebookReceipt(sourceFixture, request);
    if (receipt.bodySha256 !== intent.bodySha256 || receipt.requestSha256 !== intent.requestSha256) denied();
    const previousKey = byKey.get(request.idempotencyKey), previousMutation = byMutation.get(request.mutationId);
    const prior = previousKey ?? previousMutation;
    if (prior) {
      if (!previousKey || !previousMutation || previousKey !== previousMutation || prior.receipt.requestSha256 !== receipt.requestSha256) conflict('23505');
      return row({ outcome: 'idempotent_replay', receipt: prior.receipt,
        head: { revision: head.receipt.resultingRevision, bodySha256: head.receipt.bodySha256 }, syntheticOnly: true, productionReady: false });
    }
    if (request.expectedRevision !== (head?.receipt.resultingRevision ?? 0)) conflict('40001');
    if (byKey.size >= 100) denied();
    head = freeze({ request, receipt }); byKey.set(request.idempotencyKey, head); byMutation.set(request.mutationId, head);
    if (scenario === 'reply-loss' && !replyLossUsed) { replyLossUsed = true; throw new Error('synthetic_memory_reply_loss'); }
    return row({ outcome: 'accepted', receipt,
      head: { revision: receipt.resultingRevision, bodySha256: receipt.bodySha256 }, syntheticOnly: true, productionReady: false });
  }
  return Object.freeze({ sourceFixture, execute });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseSyntheticNotebookDeskPreviewArgs(process.argv.slice(2));
    const { createSyntheticNotebookDeskServer } = await import('../packages/contracts/synthetic_notebook_application_server.mjs');
    const server = createSyntheticNotebookDeskServer(createSyntheticNotebookDeskPreviewExecutor(options.scenario));
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(options.port, options.host, resolve); });
    console.log(JSON.stringify({ state: 'synthetic_notebook_desk_memory_preview',
      url: `http://${options.host === '::1' ? '[::1]' : options.host}:${server.address().port}/`, scenario: options.scenario,
      storage: 'process_memory_test_double', authenticationImplemented: false, realDatabaseVerified: false,
      learningAnalyticsMapped: false, syntheticOnly: true, learnerReady: false, productionReady: false }));
    let closing = false;
    const close = () => { if (!closing) { closing = true; server.close(); server.closeAllConnections(); } };
    process.once('SIGINT', close); process.once('SIGTERM', close);
  } catch (error) {
    console.error(error?.message === 'invalid_synthetic_notebook_desk_preview_args'
      ? error.message : 'synthetic_notebook_desk_preview_start_failed');
    process.exitCode = 1;
  }
}
