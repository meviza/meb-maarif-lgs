import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateLearningSyncReceiptSha256, calculateLearningSyncStreamStateSnapshotSha256, calculateLearningSyncActivityScopeSnapshotSha256, calculateLearningEventBatchSha256 } from '../packages/contracts/learning_event_sync_eligibility.mjs';
import { createValidServerResolvedLearningSyncInput, createExactReplayServerResolvedLearningSyncInput } from './support/learning_sync_v2_fixture.mjs';
import { calculateLearningEventSha256 } from '../packages/contracts/learning_event_sync_batch.mjs';
import { calculateLearningSyncReceiptGovernanceBindingSha256 } from '../packages/contracts/learning_event_sync_eligibility_v2.mjs';

const moduleUrl = new URL('../packages/persistence/synthetic_learning_ledger_adapter.mjs', import.meta.url);
const api = await import(moduleUrl.href).catch(error => { if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error; });
const metadata = Object.freeze({ receiptId: 'RECEIPT-SYNC-001', acceptedAt: '2026-10-03T07:59:31.000Z' });
function makeAdapter(execute, createReceiptMetadata = () => metadata) {
  assert.equal(typeof api.createSyntheticLearningLedgerAdapter, 'function', 'safe synthetic ledger application adapter missing');
  return api.createSyntheticLearningLedgerAdapter({ execute, createReceiptMetadata });
}
async function preparation(replay = false) {
  const input = await (replay ? createExactReplayServerResolvedLearningSyncInput() : createValidServerResolvedLearningSyncInput());
  // The generic V2 fixture is semantic input, not a database resolver. This
  // adapter fixture uses the exact state revision produced by SQL's append.
  if (replay) input.streamStateSnapshot = (await acceptedFixture()).state;
  return { contractVersion: '1.0.0', serverResolvedEligibilityInput: input,
    streamLocator: { locatorId: 'ledgerstream_000000000001', scopeSha256: input.streamStateSnapshot.scopeSha256, eventStreamId: input.clientBatch.eventStreamId } };
}
async function acceptedFixture() {
  const replay = await createExactReplayServerResolvedLearningSyncInput();
  const source = await createValidServerResolvedLearningSyncInput();
  const receipt = replay.receiptLookup.byIdempotencyKey;
  const state = { ...source.streamStateSnapshot, snapshotId: 'STREAM-SYNC-001:8', streamVersion: 8,
    lastAcceptedSequence: 42, lastAcceptedEventSha256: receipt.eventSha256es[1], capturedAt: metadata.acceptedAt, stateSha256: null };
  state.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(state);
  return { receipt, state, cursor: { version: 8, lastSequence: 42, lastEventSha256: receipt.eventSha256es[1], stateSha256: state.stateSha256 } };
}
const row = ledgerResult => ({ rowCount: 1, rows: [{ ledger_result: ledgerResult }] });
const accepted = f => ({ outcome: 'accepted', receipt: f.receipt, cursor: f.cursor });

async function activityWindowFixture() {
  const input = await preparation(), f = await acceptedFixture();
  const replay = await createExactReplayServerResolvedLearningSyncInput();
  const probe = makeAdapter(() => row({})).prepareCommand(input);
  assert.equal(probe.valid, true);
  const intent = probe.command.append.intent;
  return { input, result: { outcome: 'activity_window_read', streamLocator: input.streamLocator,
    cursor: f.cursor, streamStateSnapshot: f.state,
    includedInterval: { firstEventSequence: 41, lastEventSequence: 42 }, receipt: f.receipt,
    receiptGovernanceBinding: replay.receiptGovernanceBindingLookup.binding,
    governanceAudit: { sourceKind: 'synthetic_fixture', purpose: intent.dataHandlingBinding.purpose,
      classification: intent.dataHandlingBinding.classification, retentionClass: intent.dataHandlingBinding.retentionClass,
      ownerId: 'owner_learning_governance_001', stewardId: 'steward_learning_governance_001',
      catalogBinding: intent.catalogBinding, dataHandlingBinding: intent.dataHandlingBinding },
    events: probe.command.append.submission.events } };
}

test('activity window reads one fixed bounded statement and returns a live branded immutable receipt interval', async () => {
  const f = await activityWindowFixture(); let query, metadataCalls = 0;
  const a = makeAdapter(q => { query = q; return row(f.result); }, () => { metadataCalls++; return metadata; });
  assert.equal(typeof a.readActivityWindow, 'function', 'persisted activity-window read missing');
  const p = a.prepareCommand(f.input), result = await a.readActivityWindow(p.command);
  assert.equal(result.valid, true); assert.equal(result.completeHistory, false);
  assert.equal(result.windowBasis, 'prepared_batch_receipt_interval');
  assert.equal(api.isVerifiedSyntheticActivityWindow(result), true);
  assert.equal(api.isVerifiedSyntheticActivityWindow(structuredClone(result)), false);
  assert.equal(Object.isFrozen(result.events[0]), true); assert.equal(metadataCalls, 0);
  assert.equal(query.text, api.SYNTHETIC_LEARNING_LEDGER_SQL.activityWindow);
  assert.equal(query.values.length, 8); assert.deepEqual(query.values.slice(-2), ['41','42']);
  assert.match(query.text, /ORDER BY e.event_sequence/u); assert.match(query.text, /LIMIT 101/u);
  assert.equal(query.text.includes(f.input.streamLocator.locatorId), false);
});

test('activity windows accept exact replay anchors and later cursor snapshots without claiming complete history', async () => {
  const f = await activityWindowFixture();
  f.result.cursor.version = 9; f.result.cursor.lastSequence = 45; f.result.cursor.lastEventSha256 = 'd'.repeat(64);
  Object.assign(f.result.streamStateSnapshot, { snapshotId: 'STREAM-SYNC-001:8:9', streamVersion: 9, lastAcceptedSequence: 45,
    lastAcceptedEventSha256: 'd'.repeat(64), capturedAt: '2026-10-03T07:59:51.000Z' });
  f.result.streamStateSnapshot.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(f.result.streamStateSnapshot);
  f.result.cursor.stateSha256 = f.result.streamStateSnapshot.stateSha256;
  const a = makeAdapter(() => row(f.result)); assert.equal(typeof a.readActivityWindow, 'function');
  const p = a.prepareCommand(await preparation(true));
  const result = await a.readActivityWindow(p.command);
  assert.equal(result.valid, true); assert.equal(result.events.length, 2); assert.equal(result.includedInterval.lastEventSequence, 42);
  assert.equal(result.cursor.lastSequence, 45); assert.equal(result.completeHistory, false);
});

test('window commands remain adapter-instance capabilities and missing scoped rows fail closed', async () => {
  const f = await activityWindowFixture(); let calls = 0;
  const a = makeAdapter(() => { calls++; return { rowCount: 0, rows: [] }; });
  const b = makeAdapter(() => { calls++; return row(f.result); });
  assert.equal(typeof a.readActivityWindow, 'function');
  const p = a.prepareCommand(f.input);
  for (const command of [structuredClone(p.command), null, new Proxy(p.command, {})]) {
    assert.equal((await a.readActivityWindow(command)).error.code, 'untrusted_ledger_command');
  }
  assert.equal((await b.readActivityWindow(p.command)).error.code, 'untrusted_ledger_command'); assert.equal(calls, 0);
  assert.equal((await a.readActivityWindow(p.command)).error.code, 'scope_denied'); assert.equal(calls, 1);
});

test('missing duplicate reordered and foreign interval events cannot produce a verified window', async () => {
  const f = await activityWindowFixture();
  const mutations = [r => r.events.pop(), r => r.events.push(r.events[0]), r => r.events.reverse(),
    r => { r.events[1].eventSequence = 43; }, r => { r.includedInterval.firstEventSequence = 40; },
    r => { r.receipt.lastEventSequence = 43; }];
  for (const mutate of mutations) {
    const bad = structuredClone(f.result); mutate(bad); const a = makeAdapter(() => row(bad));
    assert.equal(typeof a.readActivityWindow, 'function');
    const result = await a.readActivityWindow(a.prepareCommand(f.input).command);
    assert.equal(result.valid, false); assert.equal(result.error.code, 'ledger_response_invalid');
    assert.equal(result.commitState, 'not_attempted');
  }
});

test('fully rehashed event receipt and sidecar forgeries remain pinned to the prepared source batch', async () => {
  const f = await activityWindowFixture(), bad = structuredClone(f.result);
  bad.events[1].eventType = 'hint_requested';
  const { eventSha256: ignored, ...clean } = bad.events[1]; bad.events[1].eventSha256 = calculateLearningEventSha256(clean);
  bad.receipt.eventSha256es[1] = bad.events[1].eventSha256;
  bad.receipt.receiptSha256 = calculateLearningSyncReceiptSha256(bad.receipt);
  bad.receiptGovernanceBinding.receiptSha256 = bad.receipt.receiptSha256;
  bad.receiptGovernanceBinding.bindingSha256 = calculateLearningSyncReceiptGovernanceBindingSha256(bad.receiptGovernanceBinding);
  bad.cursor.lastEventSha256 = bad.events[1].eventSha256;
  bad.streamStateSnapshot.lastAcceptedEventSha256 = bad.events[1].eventSha256;
  bad.streamStateSnapshot.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(bad.streamStateSnapshot);
  bad.cursor.stateSha256 = bad.streamStateSnapshot.stateSha256;
  const a = makeAdapter(() => row(bad)); assert.equal(typeof a.readActivityWindow, 'function');
  assert.equal((await a.readActivityWindow(a.prepareCommand(f.input).command)).error.code, 'ledger_response_invalid');
});

test('window audit purpose owner source policy and catalog hashes are not caller assertions', async () => {
  const f = await activityWindowFixture();
  for (const mutate of [r => { r.governanceAudit.purpose = 'learning_analytics'; }, r => { r.governanceAudit.ownerId = 'another_owner'; },
    r => { r.governanceAudit.sourceKind = 'production'; }, r => { r.governanceAudit.retentionClass = 'forever'; },
    r => { r.governanceAudit.dataHandlingBinding.policySha256 = '0'.repeat(64); },
    r => { r.receiptGovernanceBinding.catalogBinding.catalogSha256 = '0'.repeat(64);
      r.receiptGovernanceBinding.bindingSha256 = calculateLearningSyncReceiptGovernanceBindingSha256(r.receiptGovernanceBinding); }]) {
    const bad = structuredClone(f.result); mutate(bad); const a = makeAdapter(() => row(bad)); assert.equal(typeof a.readActivityWindow, 'function');
    assert.equal((await a.readActivityWindow(a.prepareCommand(f.input).command)).error.code, 'ledger_response_invalid');
  }
});

test('window chronology and closed event fields forbid stale snapshots free text and hidden executable data', async () => {
  const f = await activityWindowFixture(); let reads = 0;
  const mutations = [r => { r.events[1].clientOccurredAt = '2026-10-03T07:58:59.000Z'; },
    r => { r.receipt.acceptedAt = '2026-10-03T07:58:59.000Z'; r.receipt.receiptSha256 = calculateLearningSyncReceiptSha256(r.receipt); },
    r => { r.events[0].note = 'private notebook'; }, r => { r.events[0].strokes = []; },
    r => { Object.defineProperty(r.events[0], 'eventType', { enumerable: true, get() { reads++; return 'activity_started'; } }); },
    r => { r.events = new Proxy(r.events, { ownKeys() { reads++; return []; } }); },
    r => { r.streamStateSnapshot.capturedAt = '2026-10-03T07:58:59.000Z';
      r.streamStateSnapshot.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(r.streamStateSnapshot); r.cursor.stateSha256 = r.streamStateSnapshot.stateSha256; }];
  for (const mutate of mutations) {
    const bad = structuredClone(f.result); mutate(bad); const a = makeAdapter(() => row(bad)); assert.equal(typeof a.readActivityWindow, 'function');
    assert.equal((await a.readActivityWindow(a.prepareCommand(f.input).command)).error.code, 'ledger_response_invalid');
  }
  assert.equal(reads, 0);
});

test('a receipt window rejects rehashed cursor versions that have no possible later batches', async () => {
  const f = await activityWindowFixture(), bad = structuredClone(f.result);
  bad.cursor.version = 9; bad.streamStateSnapshot.streamVersion = 9; bad.streamStateSnapshot.snapshotId = 'STREAM-SYNC-001:8:9';
  bad.streamStateSnapshot.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(bad.streamStateSnapshot);
  bad.cursor.stateSha256 = bad.streamStateSnapshot.stateSha256;
  const a = makeAdapter(() => row(bad));
  assert.equal((await a.readActivityWindow(a.prepareCommand(f.input).command)).error?.code, 'ledger_response_invalid');
});

test('the immediate persisted receipt cursor must use the exact SQL-produced snapshot revision', async () => {
  const f = await activityWindowFixture(), bad = structuredClone(f.result);
  bad.streamStateSnapshot.snapshotId = 'rehash_forged_unrelated_snapshot';
  bad.streamStateSnapshot.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(bad.streamStateSnapshot);
  bad.cursor.stateSha256 = bad.streamStateSnapshot.stateSha256;
  const a = makeAdapter(() => row(bad));
  assert.equal((await a.readActivityWindow(a.prepareCommand(f.input).command)).error?.code, 'ledger_response_invalid');
});

test('rehashing the entire returned foreign batch and sidecar does not replace the live source anchor', async () => {
  const f = await activityWindowFixture(), bad = structuredClone(f.result);
  bad.events[1].activityId = 'activity_another_001';
  const cleanEvents = bad.events.map(event => {
    const { eventSha256: ignored, ...clean } = event; event.eventSha256 = calculateLearningEventSha256(clean); return clean;
  });
  bad.receipt.eventSha256es = bad.events.map(e => e.eventSha256);
  bad.receipt.batchSha256 = calculateLearningEventBatchSha256({ ...f.input.serverResolvedEligibilityInput.clientBatch, events: cleanEvents });
  bad.receipt.receiptSha256 = calculateLearningSyncReceiptSha256(bad.receipt);
  Object.assign(bad.receiptGovernanceBinding, { batchSha256: bad.receipt.batchSha256, receiptSha256: bad.receipt.receiptSha256 });
  bad.receiptGovernanceBinding.bindingSha256 = calculateLearningSyncReceiptGovernanceBindingSha256(bad.receiptGovernanceBinding);
  bad.streamStateSnapshot.lastAcceptedEventSha256 = bad.events.at(-1).eventSha256;
  bad.streamStateSnapshot.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(bad.streamStateSnapshot);
  Object.assign(bad.cursor, { lastEventSha256: bad.events.at(-1).eventSha256, stateSha256: bad.streamStateSnapshot.stateSha256 });
  const a = makeAdapter(() => row(bad));
  assert.equal((await a.readActivityWindow(a.prepareCommand(f.input).command)).error.code, 'ledger_response_invalid');
});

test('a correctly rehashed receipt timestamp substitution cannot replace an exact historical replay anchor', async () => {
  const f = await activityWindowFixture(), bad = structuredClone(f.result);
  bad.receipt.acceptedAt = '2026-10-03T07:59:30.500Z'; bad.receipt.receiptSha256 = calculateLearningSyncReceiptSha256(bad.receipt);
  bad.receiptGovernanceBinding.receiptSha256 = bad.receipt.receiptSha256;
  bad.receiptGovernanceBinding.bindingSha256 = calculateLearningSyncReceiptGovernanceBindingSha256(bad.receiptGovernanceBinding);
  const a = makeAdapter(() => row(bad));
  assert.equal((await a.readActivityWindow(a.prepareCommand(await preparation(true)).command)).error.code, 'ledger_response_invalid');
});

test('window error replies are inert bounded and do not leak SQL raw payloads or claim a read mutation', async () => {
  const f = await activityWindowFixture();
  for (const response of [{ ...row(f.result), rowCount: 2 }, { rowCount: 1, rows: [] },
    row({ ...f.result, verified: true }), row({ ...f.result, events: Array(129).fill(f.result.events[0]) }),
    row({ ...f.result, governanceAudit: { ...f.result.governanceAudit, ownerId: 'x'.repeat(270000) } })]) {
    const a = makeAdapter(() => response), result = await a.readActivityWindow(a.prepareCommand(f.input).command);
    assert.equal(result.error.code, 'ledger_response_invalid'); assert.equal(result.commitState, 'not_attempted');
    assert.equal(Object.hasOwn(result, 'events'), false); assert.equal(result.automaticRetry, false);
  }
  const a = makeAdapter(() => { throw { code: '42501', message: 'private SQL or school data' }; });
  const result = await a.readActivityWindow(a.prepareCommand(f.input).command);
  assert.equal(result.error.code, 'scope_denied'); assert.equal(result.commitState, 'not_attempted');
  assert.equal(JSON.stringify(result).includes('private'), false);
});

test('append uses a locally prepared live capability and fixed parameterized SQL with immutable receipt binding', async () => {
  const f = await acceptedFixture(), queries = [];
  const a = makeAdapter(query => { queries.push(query); return row(accepted(f)); });
  const prepared = a.prepareCommand(await preparation());
  assert.equal(prepared.valid, true);
  const result = await a.append(prepared.command);
  assert.equal(result.valid, true); assert.equal(result.outcome, 'accepted');
  assert.deepEqual(JSON.parse(JSON.stringify(result.receipt)), f.receipt);
  assert.equal(result.cursor.version, 8); assert.equal(result.cursor.lastSequence, 42);
  assert.equal(result.productionReady, false); assert.equal(result.syntheticOnly, true);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].text, 'SELECT learning_ledger.append_batch($1::jsonb,$2::jsonb,$3::jsonb) AS ledger_result');
  assert.equal(queries[0].values.length, 3);
  assert.equal(queries[0].text.includes(prepared.command.streamLocator.locatorId), false);
  assert.deepEqual(JSON.parse(queries[0].values[0]), JSON.parse(JSON.stringify(prepared.command)));
  assert.deepEqual(JSON.parse(queries[0].values[1]), f.receipt);
  const binding = JSON.parse(queries[0].values[2]);
  assert.equal(binding.receiptSha256, f.receipt.receiptSha256);
  assert.equal(binding.scopeSha256, prepared.command.streamLocator.scopeSha256);
  assert.equal(Object.isFrozen(queries[0]), true); assert.equal(Object.isFrozen(queries[0].values), true);
});

test('duplicate append retains its first server receipt metadata and accepts only a matching immutable replay', async () => {
  const f = await acceptedFixture(), queries = []; let metadataCalls = 0;
  const a = makeAdapter(query => { queries.push(query); return row({ ...accepted(f), outcome: queries.length === 1 ? 'accepted' : 'idempotent_replay' }); }, () => { metadataCalls++; return metadata; });
  const p = a.prepareCommand(await preparation());
  assert.equal((await a.append(p.command)).valid, true);
  const replay = await a.append(p.command);
  assert.equal(replay.valid, true); assert.equal(replay.outcome, 'idempotent_replay'); assert.equal(metadataCalls, 1);
  assert.deepEqual(queries[1].values, queries[0].values);
});

test('historical replay binds its receipt hash and never requests new metadata', async () => {
  const f = await acceptedFixture(); let metadataCalls = 0;
  const a = makeAdapter(query => { assert.equal(query.text, 'SELECT learning_ledger.replay_receipt($1::jsonb) AS ledger_result'); return row({ ...accepted(f), outcome: 'idempotent_replay' }); }, () => { metadataCalls++; return metadata; });
  const p = a.prepareCommand(await preparation(true)), result = await a.replay(p.command);
  assert.equal(p.valid, true); assert.equal(result.valid, true); assert.equal(result.outcome, 'idempotent_replay'); assert.equal(metadataCalls, 0);
});

test('a stream read is scoped by prepared locator and independently validates snapshot and cursor hashes', async () => {
  const f = await acceptedFixture(), input = await preparation(); let query;
  const a = makeAdapter(q => { query = q; return row({ outcome: 'read', streamLocator: input.streamLocator, cursor: f.cursor, streamStateSnapshot: f.state }); });
  const p = a.prepareCommand(input), result = await a.read(p.command);
  assert.equal(result.valid, true); assert.equal(result.outcome, 'read'); assert.equal(result.cursor.lastSequence, 42);
  assert.deepEqual([...query.values], ['ledgerstream_000000000001', input.streamLocator.scopeSha256, 'stream_000000000001']);
  assert.equal(query.text.includes('$1'), true); assert.equal(query.text.includes('$2'), true); assert.equal(query.text.includes('$3'), true);
  assert.equal(query.text.includes(input.streamLocator.scopeSha256), false);
});

test('serialized cloned external and cross-adapter commands cannot acquire executor authority', async () => {
  let calls = 0; const a = makeAdapter(() => { calls++; throw new Error('must not execute'); }), b = makeAdapter(() => { calls++; });
  const p = a.prepareCommand(await preparation());
  for (const command of [structuredClone(p.command), JSON.parse(JSON.stringify(p.command)), { contractVersion: '1.0.0' }, null, new Proxy(p.command, { get() { throw new Error('proxy trap'); } })]) {
    assert.equal((await a.append(command)).error.code, 'untrusted_ledger_command');
  }
  assert.equal((await b.read(p.command)).error.code, 'untrusted_ledger_command');
  assert.equal((await a.replay(p.command)).error.code, 'ledger_command_kind_mismatch');
  assert.equal(calls, 0);
});

test('preparation rejects getters proxies cycles and unexpected caller role fields without running hooks', async () => {
  let reads = 0, calls = 0; const a = makeAdapter(() => { calls++; });
  const getter = await preparation(); Object.defineProperty(getter.serverResolvedEligibilityInput.resolverContext, 'tenantId', { enumerable: true, get() { reads++; return 'tenant_ankara_001'; } });
  const proxy = new Proxy(await preparation(), { ownKeys() { reads++; return []; }, getPrototypeOf() { reads++; return Object.prototype; } });
  const nested = await preparation(); nested.serverResolvedEligibilityInput.clientBatch.events[0] = new Proxy({}, { get() { reads++; return 0; } });
  const cycle = await preparation(); cycle.serverResolvedEligibilityInput.clientBatch.cycle = cycle;
  const role = await preparation(); role.dbRole = 'synthetic_school_b_app';
  for (const input of [getter, proxy, nested, cycle, role]) assert.equal(a.prepareCommand(input).valid, false);
  assert.equal(reads, 0); assert.equal(calls, 0);
});

test('constructor is closed and rejects accessor or proxy executors before side effects', () => {
  assert.equal(typeof api.createSyntheticLearningLedgerAdapter, 'function', 'safe adapter missing');
  let reads = 0;
  const accessor = { createReceiptMetadata: () => metadata }; Object.defineProperty(accessor, 'execute', { enumerable: true, get() { reads++; return () => {}; } });
  for (const options of [accessor, new Proxy({}, { ownKeys() { reads++; return []; } }), { execute() {}, createReceiptMetadata() {}, dbRole: 'postgres' }, { execute: new Proxy(() => {}, {}), createReceiptMetadata() {} }]) {
    assert.throws(() => api.createSyntheticLearningLedgerAdapter(options), /invalid_synthetic_ledger_adapter_options/u);
  }
  assert.equal(reads, 0);
});

test('response getters proxies thenables and extra fields are rejected without accessing hostile properties', async () => {
  const f = await acceptedFixture(); let reads = 0;
  const getter = row(accepted(f)); Object.defineProperty(getter.rows[0].ledger_result.receipt, 'acceptedAt', { enumerable: true, get() { reads++; return metadata.acceptedAt; } });
  const thenable = row(accepted(await acceptedFixture())); Object.defineProperty(thenable, 'then', { get() { reads++; return () => {}; } });
  const proxy = new Proxy(row(accepted(await acceptedFixture())), { get() { reads++; return null; }, ownKeys() { reads++; return []; } });
  for (const response of [getter, thenable, proxy, { ...row(accepted(await acceptedFixture())), debug: 'secret' }]) {
    const a = makeAdapter(() => response), p = a.prepareCommand(await preparation()), result = await a.append(p.command);
    assert.equal(result.valid, false); assert.equal(result.error.code, 'ledger_response_invalid'); assert.equal(result.commitState, 'unknown');
  }
  assert.equal(reads, 0);
});

test('fresh append rejects correctly rehashed wrong receipt scope and wrong cursor arithmetic or state hash', async () => {
  const f = await acceptedFixture(), wrongScope = structuredClone(accepted(f)); wrongScope.receipt.scopeSha256 = 'f'.repeat(64); wrongScope.receipt.receiptSha256 = calculateLearningSyncReceiptSha256(wrongScope.receipt);
  const wrongSequence = structuredClone(accepted(f)); wrongSequence.cursor.lastSequence = 43;
  const wrongHash = structuredClone(accepted(f)); wrongHash.cursor.stateSha256 = 'f'.repeat(64);
  const wrongOutcome = structuredClone(accepted(f)); wrongOutcome.outcome = 'published';
  for (const response of [wrongScope, wrongSequence, wrongHash, wrongOutcome]) {
    const a = makeAdapter(() => row(response)), p = a.prepareCommand(await preparation()); assert.equal((await a.append(p.command)).error.code, 'ledger_response_invalid');
  }
});

test('replay rejects mismatched immutable receipt hash and cursor regression', async () => {
  const f = await acceptedFixture(), wrongHash = { ...accepted(f), outcome: 'idempotent_replay', receipt: { ...f.receipt, receiptSha256: 'f'.repeat(64) } };
  const wrongCursor = { ...accepted(f), outcome: 'idempotent_replay', cursor: { ...f.cursor, version: 7 } };
  for (const response of [wrongHash, wrongCursor]) { const a = makeAdapter(() => row(response)), p = a.prepareCommand(await preparation(true)); assert.equal((await a.replay(p.command)).valid, false); }
});

test('scoped reads reject another stream a false snapshot hash and absence without leaking data', async () => {
  const f = await acceptedFixture(), input = await preparation();
  const wrongLocator = { outcome: 'read', streamLocator: { ...input.streamLocator, eventStreamId: 'stream_000000000002' }, cursor: f.cursor, streamStateSnapshot: f.state };
  const wrongHash = { outcome: 'read', streamLocator: input.streamLocator, cursor: f.cursor, streamStateSnapshot: { ...f.state, stateSha256: 'f'.repeat(64) } };
  for (const response of [row(wrongLocator), row(wrongHash)]) { const a = makeAdapter(() => response), p = a.prepareCommand(input); assert.equal((await a.read(p.command)).error.code, 'ledger_response_invalid'); }
  const a = makeAdapter(() => ({ rowCount: 0, rows: [] })), p = a.prepareCommand(input), result = await a.read(p.command);
  assert.equal(result.valid, false); assert.equal(result.error.code, 'scope_denied'); assert.equal(Object.hasOwn(result, 'streamStateSnapshot'), false);
});

test('executor SQLSTATE is allowlisted no SQL or error message leaks and writes are never automatically retried', async () => {
  let calls = 0;
  for (const [sqlstate, want] of [['42501', 'scope_denied'], ['40001', 'stale_cursor'], ['23505', 'idempotency_conflict'], ['22023', 'ledger_integrity_denied'], ['XX000', 'ledger_execution_failed']]) {
    const a = makeAdapter(() => { calls++; const error = new Error('sensitive SQL credential must not escape'); error.code = sqlstate; throw error; }), p = a.prepareCommand(await preparation()), result = await a.append(p.command);
    assert.equal(result.error.code, want); assert.equal(result.commitState, 'unknown'); assert.equal(JSON.stringify(result).includes('sensitive'), false);
  }
  assert.equal(calls, 5);
});

test('invalid server receipt metadata is rejected before database work and without invoking metadata accessors', async () => {
  let calls = 0, reads = 0;
  const hostile = { receiptId: 'RECEIPT-SYNC-001' }; Object.defineProperty(hostile, 'acceptedAt', { enumerable: true, get() { reads++; return metadata.acceptedAt; } });
  for (const meta of [hostile, { ...metadata, acceptedAt: null }, { ...metadata, acceptedAt: '2026-02-30T07:59:31.000Z' }, { ...metadata, dbRole: 'postgres' }]) {
    const a = makeAdapter(() => { calls++; }, () => meta), p = a.prepareCommand(await preparation()), result = await a.append(p.command);
    assert.equal(result.valid, false); assert.equal(result.error.code, 'invalid_server_receipt_metadata'); assert.equal(result.commitState, 'not_attempted');
  }
  assert.equal(reads, 0); assert.equal(calls, 0);
});

test('sparse oversized deep and prototype-bearing DTOs fail before executor work', async () => {
  let calls = 0; const a = makeAdapter(() => { calls++; });
  const sparse = await preparation(); sparse.serverResolvedEligibilityInput.clientBatch.events = new Array(2);
  const huge = await preparation(); huge.serverResolvedEligibilityInput.clientBatch.extra = 'x'.repeat(270000);
  const deep = await preparation(); let cursor = deep; for (let i = 0; i < 30; i++) { cursor.extra = {}; cursor = cursor.extra; }
  const custom = Object.create({ inherited: true }); Object.assign(custom, await preparation());
  for (const input of [sparse, huge, deep, custom]) assert.equal(a.prepareCommand(input).valid, false);
  assert.equal(calls, 0);
});

test('historical replay cannot return a cursor older than the server-resolved preparation snapshot', async () => {
  const f = await acceptedFixture(), input = await preparation(true), resolved = input.serverResolvedEligibilityInput;
  Object.assign(resolved.streamStateSnapshot, { streamVersion: 9, lastAcceptedSequence: 44, lastAcceptedEventSha256: 'd'.repeat(64) });
  resolved.streamStateSnapshot.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(resolved.streamStateSnapshot);
  Object.assign(resolved.activityScopeSnapshot, { streamVersion: 9, stateThroughSequence: 44, lastEventSha256: 'd'.repeat(64) });
  resolved.activityScopeSnapshot.snapshotSha256 = calculateLearningSyncActivityScopeSnapshotSha256(resolved.activityScopeSnapshot);
  const a = makeAdapter(() => row({ ...accepted(f), outcome: 'idempotent_replay' })), p = a.prepareCommand(input);
  assert.equal(p.valid, true);
  assert.equal((await a.replay(p.command)).error?.code, 'ledger_response_invalid');
});

test('scoped read cannot return a correctly rehashed state older than its prepared server snapshot', async () => {
  const f = await acceptedFixture(), input = await preparation();
  const state = { ...f.state, streamVersion: 6, lastAcceptedSequence: 39, lastAcceptedEventSha256: 'd'.repeat(64) };
  state.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(state);
  const cursor = { version: 6, lastSequence: 39, lastEventSha256: state.lastAcceptedEventSha256, stateSha256: state.stateSha256 };
  const a = makeAdapter(() => row({ outcome: 'read', streamLocator: input.streamLocator, cursor, streamStateSnapshot: state })), p = a.prepareCommand(input);
  assert.equal((await a.read(p.command)).error?.code, 'ledger_response_invalid');
});

test('an unchanged stream version cannot silently substitute a different valid server snapshot hash', async () => {
  const input = await preparation(), source = input.serverResolvedEligibilityInput.streamStateSnapshot;
  const state = { ...source, capturedAt: '2026-10-03T07:57:00.000Z' };
  state.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(state);
  const cursor = { version: state.streamVersion, lastSequence: state.lastAcceptedSequence, lastEventSha256: state.lastAcceptedEventSha256, stateSha256: state.stateSha256 };
  const a = makeAdapter(() => row({ outcome: 'read', streamLocator: input.streamLocator, cursor, streamStateSnapshot: state })), p = a.prepareCommand(input);
  assert.equal((await a.read(p.command)).error?.code, 'ledger_response_invalid');
});

test('a valid server snapshot id remains readable after SQL adds its revision suffix', async () => {
  const input = await preparation(), f = await acceptedFixture(), source = input.serverResolvedEligibilityInput.streamStateSnapshot;
  source.snapshotId = 's'.repeat(140); source.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(source);
  const state = { ...f.state, snapshotId: source.snapshotId + ':8' }; state.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(state);
  const cursor = { ...f.cursor, stateSha256: state.stateSha256 };
  const a = makeAdapter(() => row({ outcome: 'read', streamLocator: input.streamLocator, cursor, streamStateSnapshot: state })), p = a.prepareCommand(input);
  assert.equal(p.valid, true); assert.equal((await a.read(p.command)).valid, true);
});

test('an otherwise valid rehashed read response cannot exceed the fixed DTO byte budget', async () => {
  const input = await preparation(), f = await acceptedFixture();
  const state = { ...f.state, snapshotId: 's'.repeat(270000) }; state.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(state);
  const cursor = { ...f.cursor, stateSha256: state.stateSha256 };
  const a = makeAdapter(() => row({ outcome: 'read', streamLocator: input.streamLocator, cursor, streamStateSnapshot: state })), p = a.prepareCommand(input);
  assert.equal((await a.read(p.command)).valid, false);
});
