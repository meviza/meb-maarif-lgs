/** Own-stream learning-sync diagnostics only, not a learner assessment or an
 * authorized learning_analytics product. No serialized DTO grants authority. */
import { isVerifiedSyntheticActivityWindow } from '../persistence/synthetic_learning_ledger_adapter.mjs';

function failure(code) {
  return Object.freeze({ valid: false, error: Object.freeze({ code }), syntheticOnly: true, productionReady: false });
}
export function summarizeSyntheticActivityWindow(window) {
  if (arguments.length !== 1) return failure('unsupported_summary_options');
  if (!isVerifiedSyntheticActivityWindow(window)) return failure('unverified_synthetic_activity_window');
  const counts = { startedEvents: 0, hintRequestedEvents: 0, completedEvents: 0, observedActiveActivities: 0, observedCompletedActivities: 0 };
  const lastIncluded = new Map();
  for (const event of window.events) {
    if (event.eventType === 'activity_started') counts.startedEvents++;
    if (event.eventType === 'hint_requested') counts.hintRequestedEvents++;
    if (event.eventType === 'activity_completed') counts.completedEvents++;
    lastIncluded.set(event.activityId, event.eventType);
  }
  for (const type of lastIncluded.values()) {
    if (type === 'activity_completed') counts.observedCompletedActivities++;
    else counts.observedActiveActivities++;
  }
  return Object.freeze({ valid: true, schemaVersion: 'synthetic-activity-summary/v1', purpose: 'learning_progress_sync',
    counts: Object.freeze(counts), includedInterval: Object.freeze({ ...window.includedInterval, eventCount: window.events.length }),
    provenance: Object.freeze({ scopeSha256: window.streamLocator.scopeSha256, receiptId: window.receipt.receiptId,
      receiptSha256: window.receipt.receiptSha256, receiptGovernanceBindingSha256: window.receiptGovernanceBinding.bindingSha256,
      currentStreamStateSha256: window.streamStateSnapshot.stateSha256 }),
    completeHistory: false, currentWindowOnly: true, currentActivityStateVerified: false,
    windowBasis: 'prepared_batch_receipt_interval', activityStateBasis: 'last_event_in_included_interval_not_current_global_state',
    inference: Object.freeze({ correctness: 'not_inferred', score: 'not_inferred', mastery: 'not_inferred', ability: 'not_inferred', iq: 'not_inferred', career: 'not_inferred' }),
    analyticsAuthorization: 'separate_policy_pending', notebookPersistence: 'separate_contract_pending',
    syntheticOnly: true, productionReady: false });
}
