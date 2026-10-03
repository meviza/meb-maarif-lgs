import assert from 'node:assert/strict';
import test from 'node:test';
import { createSyntheticLearningLedgerAdapter } from '../packages/persistence/synthetic_learning_ledger_adapter.mjs';
import { calculateLearningSyncStreamStateSnapshotSha256, calculateLearningSyncActivityScopeSnapshotSha256 } from '../packages/contracts/learning_event_sync_eligibility.mjs';
import { createValidServerResolvedLearningSyncInput } from './support/learning_sync_v2_fixture.mjs';

const api = await import('../packages/analytics/synthetic_activity_summary.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const row = value => ({ rowCount: 1, rows: [{ ledger_result: value }] });
async function verifiedWindow(types = ['activity_started','hint_requested','activity_completed'], activityIds = types.map(() => 'activity_counting_001')) {
  const input = await createValidServerResolvedLearningSyncInput();
  input.clientBatch.events = types.map((eventType, index) => ({ eventId: `evt_${String(41 + index).padStart(12, '0')}`, eventSequence: 41 + index,
    activityId: activityIds[index], eventType, clientOccurredAt: '2026-10-03T07:59:00.000Z' }));
  input.activityScopeSnapshot.activities = [...new Set(activityIds)].map(activityId => ({ activityId, lifecycleState: 'active', currentState: 'not_started',
    allowedEventTypes: ['activity_started','hint_requested','activity_completed'] }));
  input.activityScopeSnapshot.snapshotSha256 = calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);
  let persisted;
  const a = createSyntheticLearningLedgerAdapter({ createReceiptMetadata: () => ({ receiptId: 'RECEIPT-SYNC-SUMMARY-001', acceptedAt: '2026-10-03T07:59:31.000Z' }),
    execute(query) {
      if (query.values.length !== 3) return row(persisted);
      const command = JSON.parse(query.values[0]), receipt = JSON.parse(query.values[1]), binding = JSON.parse(query.values[2]);
      const state = { ...input.streamStateSnapshot, snapshotId: 'STREAM-SYNC-001:8', streamVersion: 8,
        lastAcceptedSequence: receipt.lastEventSequence, lastAcceptedEventSha256: receipt.eventSha256es.at(-1), capturedAt: receipt.acceptedAt };
      state.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(state);
      const cursor = { version: 8, lastSequence: state.lastAcceptedSequence, lastEventSha256: state.lastAcceptedEventSha256, stateSha256: state.stateSha256 };
      const intent = command.append.intent;
      persisted = { outcome: 'activity_window_read', streamLocator: command.streamLocator, cursor, streamStateSnapshot: state,
        includedInterval: { firstEventSequence: receipt.firstEventSequence, lastEventSequence: receipt.lastEventSequence }, receipt,
        receiptGovernanceBinding: binding, governanceAudit: { sourceKind: 'synthetic_fixture', purpose: 'learning_progress_sync',
          classification: intent.dataHandlingBinding.classification, retentionClass: intent.dataHandlingBinding.retentionClass,
          ownerId: 'owner_learning_governance_001', stewardId: 'steward_learning_governance_001',
          catalogBinding: intent.catalogBinding, dataHandlingBinding: intent.dataHandlingBinding }, events: command.append.submission.events };
      return row({ outcome: 'accepted', receipt, cursor });
    } });
  const p = a.prepareCommand({ contractVersion: '1.0.0', serverResolvedEligibilityInput: input,
    streamLocator: { locatorId: 'ledgerstream_000000000001', scopeSha256: input.streamStateSnapshot.scopeSha256, eventStreamId: input.clientBatch.eventStreamId } });
  assert.equal(p.valid, true, JSON.stringify(p.errors)); assert.equal((await a.append(p.command)).valid, true);
  assert.equal(typeof a.readActivityWindow, 'function', 'verified persisted window required');
  const window = await a.readActivityWindow(p.command); assert.equal(window.valid, true, JSON.stringify(window));
  return window;
}

test('a verified receipt interval counts events and only last-included observed activity states', async () => {
  assert.equal(typeof api.summarizeSyntheticActivityWindow, 'function', 'synthetic window summarizer missing');
  const window = await verifiedWindow(), summary = api.summarizeSyntheticActivityWindow(window);
  assert.equal(summary.valid, true);
  assert.deepEqual({ ...summary.counts }, { startedEvents: 1, hintRequestedEvents: 1, completedEvents: 1,
    observedActiveActivities: 0, observedCompletedActivities: 1 });
  assert.equal(summary.includedInterval.firstEventSequence, 41); assert.equal(summary.includedInterval.eventCount, 3);
  assert.equal(summary.provenance.receiptSha256, window.receipt.receiptSha256);
  assert.equal(summary.provenance.receiptGovernanceBindingSha256, window.receiptGovernanceBinding.bindingSha256);
  assert.equal(Object.isFrozen(summary.counts), true);
});

test('an included start and hint imply observed-active only, never verified current state or mastery', async () => {
  assert.equal(typeof api.summarizeSyntheticActivityWindow, 'function');
  const summary = api.summarizeSyntheticActivityWindow(await verifiedWindow(['activity_started','hint_requested']));
  assert.equal(summary.counts.observedActiveActivities, 1); assert.equal(summary.counts.observedCompletedActivities, 0);
  assert.equal(summary.completeHistory, false); assert.equal(summary.currentWindowOnly, true); assert.equal(summary.currentActivityStateVerified, false);
  assert.equal(summary.purpose, 'learning_progress_sync'); assert.equal(summary.analyticsAuthorization, 'separate_policy_pending');
  for (const field of ['correctness','score','mastery','ability','iq','career']) assert.equal(summary.inference[field], 'not_inferred');
  assert.equal(summary.notebookPersistence, 'separate_contract_pending'); assert.equal(summary.productionReady, false);
});

test('serialization clones hashes trust flags and proxies cannot authorize a summary', async () => {
  assert.equal(typeof api.summarizeSyntheticActivityWindow, 'function');
  const window = await verifiedWindow(); let reads = 0;
  const accessor = {}; Object.defineProperty(accessor, 'valid', { get() { reads++; return true; } });
  for (const fake of [structuredClone(window), JSON.parse(JSON.stringify(window)), { ...window, verified: true },
    { trusted: true, receiptSha256: window.receipt.receiptSha256 }, accessor, new Proxy(window, { get() { reads++; throw new Error('trap'); } }), null]) {
    const result = api.summarizeSyntheticActivityWindow(fake);
    assert.equal(result.valid, false); assert.equal(result.error.code, 'unverified_synthetic_activity_window');
    assert.equal(Object.hasOwn(result, 'counts'), false);
  }
  assert.equal(reads, 0);
});

test('no caller options can expand the authorized purpose or assert learner ability', async () => {
  assert.equal(typeof api.summarizeSyntheticActivityWindow, 'function');
  const window = await verifiedWindow();
  const result = api.summarizeSyntheticActivityWindow(window, { purpose: 'learning_analytics', score: 100, completeHistory: true });
  assert.equal(result.valid, false); assert.equal(result.error.code, 'unsupported_summary_options');
});

test('each activity contributes only its last included state rather than one global final-event state', async () => {
  const summary = api.summarizeSyntheticActivityWindow(await verifiedWindow(['activity_started','activity_started','activity_completed'],
    ['activity_counting_001','activity_counting_002','activity_counting_001']));
  assert.equal(summary.valid, true);
  assert.deepEqual({ ...summary.counts }, { startedEvents: 2, hintRequestedEvents: 0, completedEvents: 1,
    observedActiveActivities: 1, observedCompletedActivities: 1 });
});

test('the largest accepted hundred-event receipt interval remains bounded and never becomes full history', async () => {
  const types = [], activityIds = [];
  for (let index = 0; index < 50; index++) {
    types.push('activity_started','activity_completed'); activityIds.push(`activity_counting_${index}`, `activity_counting_${index}`);
  }
  const window = await verifiedWindow(types, activityIds), summary = api.summarizeSyntheticActivityWindow(window);
  assert.equal(window.events.length, 100); assert.equal(summary.includedInterval.lastEventSequence, 140);
  assert.equal(summary.counts.startedEvents, 50); assert.equal(summary.counts.completedEvents, 50);
  assert.equal(summary.counts.observedCompletedActivities, 50); assert.equal(summary.completeHistory, false);
});
