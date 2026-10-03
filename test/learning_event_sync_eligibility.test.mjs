import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const ELIGIBILITY_MODULE_URL = new URL('../packages/contracts/learning_event_sync_eligibility.mjs', import.meta.url);
const OBSERVED_AT = '2026-10-03T08:00:00.000Z';
const TENANT_ID = 'tenant_ankara_001';
const LEARNER_PSEUDONYM = 'learner_abcdef123456';

async function loadEligibilityContract() {
  // Break caught: a future sync adapter could treat a locally valid client
  // batch as accepted progress without binding it to server-only scope,
  // publication, assignment, activity, and ledger evidence.
  assert.equal(
    fs.existsSync(ELIGIBILITY_MODULE_URL),
    true,
    'learning-event sync requires a server-resolved eligibility contract'
  );
  return import(ELIGIBILITY_MODULE_URL.href);
}

function clientBatch(overrides = {}) {
  const base = {
    contractVersion: '1.0.0',
    batchId: 'batch_000000000001',
    idempotencyKey: 'idem_000000000001',
    eventStreamId: 'stream_000000000001',
    contentTarget: {
      packageId: 'CP-G1-TR-001',
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      revisionSha256: 'a'.repeat(64),
      assetSetSha256: 'b'.repeat(64),
      publicationDecisionId: 'PUB-G1-TR-001',
      curriculumRegistryEntryId: 'CURR-G1-TR-001',
      programVersion: 'TYMM-2024.1',
      outcomeCode: 'MAT.1.1.1'
    },
    events: [
      {
        eventId: 'evt_000000000041',
        eventSequence: 41,
        activityId: 'activity_counting_001',
        eventType: 'activity_started',
        clientOccurredAt: '2026-10-03T07:59:00.000Z'
      },
      {
        eventId: 'evt_000000000042',
        eventSequence: 42,
        activityId: 'activity_counting_001',
        eventType: 'activity_completed',
        clientOccurredAt: '2026-10-03T07:59:30.000Z'
      }
    ]
  };
  return {
    ...base,
    ...overrides,
    contentTarget: { ...base.contentTarget, ...(overrides.contentTarget ?? {}) },
    events: overrides.events ?? base.events
  };
}

function scopeFields(targetSha256, eventStreamId = 'stream_000000000001') {
  return {
    contractVersion: '1.0.0',
    tenantId: TENANT_ID,
    learnerPseudonym: LEARNER_PSEUDONYM,
    purpose: 'learning_progress_sync',
    eventStreamId,
    targetSha256
  };
}

async function resolvedInput(overrides = {}) {
  const contract = await loadEligibilityContract();
  const batch = clientBatch(overrides.clientBatch);
  const validation = contract.validatePseudonymousLearningSyncBatch(batch);
  assert.equal(validation.valid, true, 'the fixture client batch must be structurally valid');

  const targetSha256 = contract.calculateLearningEventContentTargetSha256(batch.contentTarget);
  const scope = scopeFields(targetSha256, batch.eventStreamId);
  const scopeSha256 = contract.calculateLearningSyncScopeSha256(scope);
  const resolverContext = {
    contractVersion: '1.0.0',
    invocationId: 'syncinv_000000000001',
    observedAt: OBSERVED_AT,
    tenantId: TENANT_ID,
    actorPseudonym: LEARNER_PSEUDONYM,
    actorRole: 'student',
    purpose: 'learning_progress_sync',
    timeSourceId: 'server_clock_001'
  };
  const authorizationSnapshot = {
    authorizationId: 'AUTHZ-SYNC-001',
    authorizationSha256: null,
    policyVersion: 'access-policy-v1',
    action: 'append_learning_event_batch',
    effect: 'allow',
    scopeSha256,
    issuedAt: '2026-10-03T07:00:00.000Z',
    expiresAt: '2026-10-03T09:00:00.000Z'
  };
  authorizationSnapshot.authorizationSha256 = contract.calculateLearningSyncAuthorizationSnapshotSha256(authorizationSnapshot);
  const entitlementSnapshot = {
    entitlementId: 'ENT-SYNC-001',
    entitlementSha256: null,
    entitlementPolicyVersion: 'learning-assignment-v1',
    state: 'active',
    scopeSha256,
    issuedAt: '2026-10-03T07:00:00.000Z',
    expiresAt: '2026-10-03T09:00:00.000Z'
  };
  entitlementSnapshot.entitlementSha256 = contract.calculateLearningSyncEntitlementSnapshotSha256(entitlementSnapshot);
  const governedTargetSnapshot = {
    snapshotId: 'GOV-SYNC-001',
    snapshotSha256: null,
    snapshotSequence: 4,
    capturedAt: '2026-10-03T07:30:00.000Z',
    outcome: 'published',
    targetSha256,
    publicationDecisionId: batch.contentTarget.publicationDecisionId,
    curriculumRegistryEntryId: batch.contentTarget.curriculumRegistryEntryId,
    programVersion: batch.contentTarget.programVersion,
    outcomeCode: batch.contentTarget.outcomeCode,
    governancePolicyVersion: 'content-publication-v1'
  };
  governedTargetSnapshot.snapshotSha256 = contract.calculateLearningSyncGovernedTargetSnapshotSha256(governedTargetSnapshot);
  const activityScopeSnapshot = {
    snapshotId: 'ACT-SYNC-001',
    snapshotSha256: null,
    targetSha256,
    scopeSha256,
    catalogVersion: 'activity-catalog-v1',
    capturedAt: '2026-10-03T07:30:00.000Z',
    streamVersion: 7,
    stateThroughSequence: 40,
    lastEventSha256: 'c'.repeat(64),
    activities: [{
      activityId: 'activity_counting_001',
      lifecycleState: 'active',
      currentState: 'not_started',
      allowedEventTypes: ['activity_started', 'hint_requested', 'activity_completed']
    }]
  };
  activityScopeSnapshot.snapshotSha256 = contract.calculateLearningSyncActivityScopeSnapshotSha256(activityScopeSnapshot);
  const dataHandlingSnapshot = {
    policyId: 'DATA-SYNC-001',
    policySha256: null,
    purpose: 'learning_progress_sync',
    classification: 'pseudonymous_learning_telemetry',
    retentionClass: 'learning-event-lifecycle',
    auditPolicyVersion: 'audit-v1'
  };
  dataHandlingSnapshot.policySha256 = contract.calculateLearningSyncDataHandlingSnapshotSha256(dataHandlingSnapshot);
  const streamStateSnapshot = {
    snapshotId: 'STREAM-SYNC-001',
    stateSha256: null,
    scopeSha256,
    lastAcceptedSequence: 40,
    lastAcceptedEventSha256: 'c'.repeat(64),
    streamVersion: 7,
    capturedAt: '2026-10-03T07:58:00.000Z'
  };
  streamStateSnapshot.stateSha256 = contract.calculateLearningSyncStreamStateSnapshotSha256(streamStateSnapshot);
  const input = {
    resolverContext,
    clientBatch: batch,
    authorizationSnapshot,
    entitlementSnapshot,
    governedTargetSnapshot,
    activityScopeSnapshot,
    dataHandlingSnapshot,
    streamStateSnapshot,
    receiptLookup: {
      byIdempotencyKey: null,
      byBatchId: null,
      eventReceipts: []
    },
    accessRequest: {
      actor: {
        tenantId: TENANT_ID,
        subjectId: LEARNER_PSEUDONYM,
        role: 'student'
      },
      resource: {
        tenantId: TENANT_ID,
        type: 'learner_learning_event_stream',
        learnerId: LEARNER_PSEUDONYM,
        packageId: batch.contentTarget.packageId,
        eventStreamId: batch.eventStreamId
      },
      action: 'append_learning_event_batch'
    }
  };
  return { contract, input: { ...input, ...overrides.input }, validation, scopeSha256, targetSha256 };
}

function receiptFor(contract, input, validation, scopeSha256, overrides = {}) {
  const events = input.clientBatch.events;
  const receipt = {
    receiptId: 'RECEIPT-SYNC-001',
    receiptSha256: null,
    scopeSha256,
    batchId: input.clientBatch.batchId,
    idempotencyKey: input.clientBatch.idempotencyKey,
    batchSha256: validation.integrity.batchSha256,
    firstEventSequence: events[0].eventSequence,
    lastEventSequence: events[events.length - 1].eventSequence,
    eventSha256es: validation.integrity.eventSha256es,
    predecessorSequence: 40,
    predecessorEventSha256: 'c'.repeat(64),
    streamVersionBefore: 7,
    acceptedAt: '2026-10-03T07:59:31.000Z',
    authorizationId: input.authorizationSnapshot.authorizationId,
    entitlementId: input.entitlementSnapshot.entitlementId,
    governanceSnapshotId: input.governedTargetSnapshot.snapshotId,
    dataHandlingPolicyId: input.dataHandlingSnapshot.policyId,
    outcome: 'accepted'
  };
  Object.assign(receipt, overrides);
  receipt.receiptSha256 = contract.calculateLearningSyncReceiptSha256(receipt);
  return receipt;
}

async function exactReplayInput() {
  const resolved = await resolvedInput();
  const { contract, input, validation, scopeSha256 } = resolved;
  const receipt = receiptFor(contract, input, validation, scopeSha256);
  input.receiptLookup = {
    byIdempotencyKey: receipt,
    byBatchId: { ...receipt },
    eventReceipts: validation.integrity.eventSha256es.map((eventSha256, index) => ({
      eventId: input.clientBatch.events[index].eventId,
      eventSequence: input.clientBatch.events[index].eventSequence,
      eventSha256,
      receiptId: receipt.receiptId,
      scopeSha256
    }))
  };
  input.streamStateSnapshot = {
    ...input.streamStateSnapshot,
    lastAcceptedSequence: 42,
    lastAcceptedEventSha256: validation.integrity.eventSha256es[1],
    streamVersion: 8,
    stateSha256: null
  };
  input.streamStateSnapshot.stateSha256 = contract.calculateLearningSyncStreamStateSnapshotSha256(input.streamStateSnapshot);
  input.activityScopeSnapshot = {
    ...input.activityScopeSnapshot,
    streamVersion: 8,
    stateThroughSequence: 42,
    lastEventSha256: validation.integrity.eventSha256es[1],
    activities: input.activityScopeSnapshot.activities.map(activity => ({
      ...activity,
      currentState: 'completed'
    })),
    snapshotSha256: null
  };
  input.activityScopeSnapshot.snapshotSha256 = contract.calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);
  return { ...resolved, receipt };
}

test('returns a minimal append intent only when a server-resolved scope, target, activity transition, policy, and cursor all align', async () => {
  const { contract, input, validation, scopeSha256, targetSha256 } = await resolvedInput();

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.deepEqual(result.errors, []);
  assert.equal(result.eligible, true);
  assert.equal(result.nextState, 'append_eligible');
  assert.deepEqual(result.appendIntent, {
    invocationId: input.resolverContext.invocationId,
    scopeSha256,
    targetSha256,
    batchSha256: validation.integrity.batchSha256,
    expectedStreamVersion: 7,
    firstEventSequence: 41,
    lastEventSequence: 42,
    eventCount: 2,
    authorizationId: input.authorizationSnapshot.authorizationId,
    entitlementId: input.entitlementSnapshot.entitlementId,
    governanceSnapshotId: input.governedTargetSnapshot.snapshotId,
    dataHandlingPolicyId: input.dataHandlingSnapshot.policyId,
    activityScopeSnapshotId: input.activityScopeSnapshot.snapshotId,
    activityScopeSnapshotSha256: input.activityScopeSnapshot.snapshotSha256
  });
  assert.equal('learnerPseudonym' in result.appendIntent, false);
  assert.equal('tenantId' in result.appendIntent, false);
  assert.equal('synced' in result, false);
});

test('returns an idempotent replay intent only for the exact server-recorded receipt', async () => {
  const { contract, input, validation, scopeSha256, receipt } = await exactReplayInput();

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'idempotent_replay');
  assert.deepEqual(result.replayIntent, {
    invocationId: input.resolverContext.invocationId,
    receiptId: receipt.receiptId,
    receiptSha256: receipt.receiptSha256,
    scopeSha256,
    batchSha256: validation.integrity.batchSha256
  });
  assert.equal('appendIntent' in result, false);
});

test('blocks a replay receipt that is not reflected by the authoritative stream cursor', async () => {
  const { contract, input } = await exactReplayInput();
  input.streamStateSnapshot = {
    ...input.streamStateSnapshot,
    lastAcceptedSequence: 40,
    lastAcceptedEventSha256: 'c'.repeat(64),
    streamVersion: 7,
    stateSha256: null
  };
  input.streamStateSnapshot.stateSha256 = contract.calculateLearningSyncStreamStateSnapshotSha256(input.streamStateSnapshot);
  input.activityScopeSnapshot = {
    ...input.activityScopeSnapshot,
    streamVersion: 7,
    stateThroughSequence: 40,
    lastEventSha256: 'c'.repeat(64),
    activities: input.activityScopeSnapshot.activities.map(activity => ({
      ...activity,
      currentState: 'not_started'
    })),
    snapshotSha256: null
  };
  input.activityScopeSnapshot.snapshotSha256 = contract.calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'receipt_stream_state_mismatch'), true);
});

test('blocks lookup records that claim the same receipt hash but contain different immutable receipt fields', async () => {
  const { contract, input } = await exactReplayInput();
  input.receiptLookup.byBatchId = {
    ...input.receiptLookup.byBatchId,
    eventSha256es: ['d'.repeat(64), 'e'.repeat(64)]
  };

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'receipt_hash_mismatch'), true);
});

test('blocks contradictory duplicate event receipts instead of selecting the first matching row', async () => {
  const { contract, input } = await exactReplayInput();
  input.receiptLookup.eventReceipts.push({
    ...input.receiptLookup.eventReceipts[0],
    eventSha256: 'd'.repeat(64)
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'event_receipt_duplicate'), true);
});

test('blocks a replay lookup that reuses one event identifier at another sequence in the same scope', async () => {
  const { contract, input } = await exactReplayInput();
  input.receiptLookup.eventReceipts.push({
    ...input.receiptLookup.eventReceipts[0],
    eventSequence: 43,
    eventSha256: 'd'.repeat(64)
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'event_receipt_duplicate'), true);
});

test('blocks a replay lookup that reuses one sequence for another event identifier in the same scope', async () => {
  const { contract, input } = await exactReplayInput();
  input.receiptLookup.eventReceipts.push({
    ...input.receiptLookup.eventReceipts[0],
    eventId: 'evt_000000000099',
    eventSha256: 'd'.repeat(64)
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'event_receipt_duplicate'), true);
});

test('blocks a replay receipt whose prior stream version is not before the current stream version', async () => {
  const { contract, input } = await exactReplayInput();
  const receipt = {
    ...input.receiptLookup.byIdempotencyKey,
    streamVersionBefore: input.streamStateSnapshot.streamVersion,
    receiptSha256: null
  };
  receipt.receiptSha256 = contract.calculateLearningSyncReceiptSha256(receipt);
  input.receiptLookup.byIdempotencyKey = receipt;
  input.receiptLookup.byBatchId = { ...receipt };

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'receipt_stream_version_mismatch'), true);
});

test('rejects an oversized resolver receipt array before traversing its sparse entries', async () => {
  const { contract, input } = await resolvedInput();
  input.receiptLookup.eventReceipts = new Array(101);

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'array_length_exceeds_limit'), true);
});

test('ignores a foreign-scope receipt row when an exact receipt exists for the replay scope', async () => {
  const { contract, input } = await exactReplayInput();
  input.receiptLookup.eventReceipts.unshift({
    ...input.receiptLookup.eventReceipts[0],
    receiptId: 'RECEIPT-FOREIGN-SCOPE-001',
    scopeSha256: 'f'.repeat(64)
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'idempotent_replay');
});

test('blocks a sequence gap rather than accepting a client-created stream position', async () => {
  const { contract, input } = await resolvedInput({
    clientBatch: {
      events: clientBatch().events.map(event => ({ ...event, eventSequence: event.eventSequence + 2 }))
    }
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'sequence_gap'), true);
});

test('blocks a completed event when the server activity state has not observed a valid start transition', async () => {
  const { contract, input } = await resolvedInput({
    clientBatch: {
      events: [{
        eventId: 'evt_000000000041',
        eventSequence: 41,
        activityId: 'activity_counting_001',
        eventType: 'activity_completed',
        clientOccurredAt: '2026-10-03T07:59:30.000Z'
      }]
    }
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'activity_transition_invalid'), true);
});

test('blocks a client event timestamp that is later than the authoritative server observation', async () => {
  const { contract, input } = await resolvedInput({
    clientBatch: {
      events: clientBatch().events.map((event, index) => ({
        ...event,
        clientOccurredAt: index === 1 ? '2026-10-03T08:00:01.000Z' : event.clientOccurredAt
      }))
    }
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'client_event_after_observation'), true);
});

test('allows a client event timestamp exactly at the authoritative server observation boundary', async () => {
  const { contract, input } = await resolvedInput({
    clientBatch: {
      events: clientBatch().events.map((event, index) => ({
        ...event,
        clientOccurredAt: index === 1 ? OBSERVED_AT : event.clientOccurredAt
      }))
    }
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, true);
  assert.equal(result.nextState, 'append_eligible');
});

test('blocks a batch whose client event timestamps move backward while sequences move forward', async () => {
  const { contract, input } = await resolvedInput({
    clientBatch: {
      events: clientBatch().events.map((event, index) => ({
        ...event,
        clientOccurredAt: index === 0 ? '2026-10-03T07:59:30.000Z' : '2026-10-03T07:59:00.000Z'
      }))
    }
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'client_event_time_nonmonotonic'), true);
});

test('blocks activity state resolved from a different learner or stream scope', async () => {
  const { contract, input } = await resolvedInput();
  input.activityScopeSnapshot = {
    ...input.activityScopeSnapshot,
    scopeSha256: 'f'.repeat(64),
    snapshotSha256: null
  };
  input.activityScopeSnapshot.snapshotSha256 = contract.calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'activity_scope_scope_mismatch'), true);
});

test('blocks an activity state snapshot that is stale relative to the authoritative stream cursor', async () => {
  const { contract, input } = await resolvedInput();
  input.activityScopeSnapshot = {
    ...input.activityScopeSnapshot,
    streamVersion: 6,
    snapshotSha256: null
  };
  input.activityScopeSnapshot.snapshotSha256 = contract.calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'activity_scope_stream_state_mismatch'), true);
});

test('blocks an activity state with the current version but a different cursor hash', async () => {
  const { contract, input } = await resolvedInput();
  input.activityScopeSnapshot = {
    ...input.activityScopeSnapshot,
    lastEventSha256: 'd'.repeat(64),
    snapshotSha256: null
  };
  input.activityScopeSnapshot.snapshotSha256 = contract.calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'activity_scope_stream_state_mismatch'), true);
});

test('does not block a new append because an event receipt belongs to a different scope', async () => {
  const { contract, input } = await resolvedInput();
  input.receiptLookup.eventReceipts = [{
    eventId: input.clientBatch.events[0].eventId,
    eventSequence: input.clientBatch.events[0].eventSequence,
    eventSha256: 'd'.repeat(64),
    receiptId: 'RECEIPT-OTHER-SCOPE-001',
    scopeSha256: 'f'.repeat(64)
  }];

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, true);
  assert.equal(result.nextState, 'append_eligible');
});

test('blocks a non-replay batch that overlaps the authoritative cursor', async () => {
  const { contract, input } = await resolvedInput({
    clientBatch: {
      events: clientBatch().events.map(event => ({ ...event, eventSequence: event.eventSequence - 1 }))
    }
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'sequence_overlap'), true);
});

test('blocks a grammar-valid client target when it does not match the server-published target snapshot', async () => {
  const { contract, input } = await resolvedInput();
  input.clientBatch = {
    ...input.clientBatch,
    contentTarget: {
      ...input.clientBatch.contentTarget,
      outcomeCode: 'MAT.1.1.2'
    }
  };

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'governed_target_mismatch'), true);
});

test('uses the validated immutable client batch rather than a post-validation Proxy view', async () => {
  const { contract, input } = await resolvedInput();
  const originalBatch = input.clientBatch;
  const swappedEvents = originalBatch.events.map(event => ({
    ...event,
    eventSequence: event.eventSequence + 2
  }));
  input.clientBatch = new Proxy(originalBatch, {
    get(target, property, receiver) {
      if (property === 'events') return swappedEvents;
      return Reflect.get(target, property, receiver);
    }
  });

  const validation = contract.validatePseudonymousLearningSyncBatch(input.clientBatch);
  assert.equal(validation.valid, true);

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, true);
  assert.equal(result.nextState, 'append_eligible');
  assert.equal(result.appendIntent.firstEventSequence, 41);
  assert.equal(result.appendIntent.lastEventSequence, 42);
  assert.equal(result.appendIntent.batchSha256, validation.integrity.batchSha256);
});

test('blocks a server snapshot whose required authorization fields are not own data fields', async () => {
  const { contract, input } = await resolvedInput();
  const virtualFields = {
    ...input.authorizationSnapshot,
    authorizationSha256: contract.calculateLearningSyncAuthorizationSnapshotSha256({})
  };
  input.authorizationSnapshot = new Proxy({}, {
    get(target, property, receiver) {
      if (typeof property === 'string' && Object.hasOwn(virtualFields, property)) return virtualFields[property];
      return Reflect.get(target, property, receiver);
    }
  });

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'authorization_field_invalid'), true);
});

test('fails closed rather than throwing when a server snapshot field is an accessor that throws', async () => {
  const { contract, input } = await resolvedInput();
  const throwingAuthorization = { ...input.authorizationSnapshot };
  Object.defineProperty(throwingAuthorization, 'authorizationId', {
    enumerable: true,
    configurable: true,
    get() {
      throw new Error('unreadable server snapshot');
    }
  });
  input.authorizationSnapshot = throwingAuthorization;

  let result;
  assert.doesNotThrow(() => {
    result = contract.evaluateServerResolvedLearningSyncEligibility(input);
  });
  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'server_snapshot_unreadable' || error.code === 'accessor_field_not_allowed'), true);
});

test('fails closed rather than throwing when a server snapshot Proxy cannot enumerate its fields', async () => {
  const { contract, input } = await resolvedInput();
  input.authorizationSnapshot = new Proxy({ ...input.authorizationSnapshot }, {
    ownKeys() {
      throw new Error('snapshot enumeration failed');
    }
  });

  let result;
  assert.doesNotThrow(() => {
    result = contract.evaluateServerResolvedLearningSyncEligibility(input);
  });
  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'server_snapshot_unreadable'), true);
});

test('blocks an expired entitlement and never labels the batch as accepted', async () => {
  const { contract, input } = await resolvedInput();
  input.entitlementSnapshot = {
    ...input.entitlementSnapshot,
    expiresAt: '2026-10-03T07:59:59.000Z',
    entitlementSha256: null
  };
  input.entitlementSnapshot.entitlementSha256 = contract.calculateLearningSyncEntitlementSnapshotSha256(input.entitlementSnapshot);

  const result = contract.evaluateServerResolvedLearningSyncEligibility(input);

  assert.equal(result.eligible, false);
  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'entitlement_expired'), true);
  assert.equal('accepted' in result, false);
});
