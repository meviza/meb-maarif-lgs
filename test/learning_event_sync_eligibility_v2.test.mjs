import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const V2_MODULE_URL = new URL('../packages/contracts/learning_event_sync_eligibility_v2.mjs', import.meta.url);
const V1_MODULE_URL = new URL('../packages/contracts/learning_event_sync_eligibility.mjs', import.meta.url);
const CATALOG_MODULE_URL = new URL('../packages/contracts/data_asset_catalog.mjs', import.meta.url);

const OBSERVED_AT = '2026-10-03T08:00:00.000Z';
const TENANT_ID = 'tenant_ankara_001';
const LEARNER_PSEUDONYM = 'learner_abcdef123456';

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(',')}}`;
}

function receiptGovernanceBindingSha256(binding) {
  const { bindingSha256: ignored, ...payload } = binding;
  return createHash('sha256')
    .update(`k12.learning-sync.receipt-governance-binding/v2:${canonicalJson(payload)}`, 'utf8')
    .digest('hex');
}

async function loadV2Contract() {
  // Break caught: a governed DAMA catalog could remain an isolated document
  // while a future sync append intent names no data-product revision or
  // lifecycle metadata at all.
  assert.equal(
    fs.existsSync(V2_MODULE_URL),
    true,
    'catalog-bound learning sync requires a versioned V2 composition contract'
  );
  return import(V2_MODULE_URL.href);
}

function clientBatch() {
  return {
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
}

function catalogAsset({ assetId, assetKind, revisionId, revisionSequence, domain, dataGovernance, prefix }) {
  return {
    assetId,
    assetKind,
    revisionId,
    revisionSequence,
    lifecycleState: 'registered',
    definitionSha256: null,
    domain,
    dataGovernance: {
      owner: 'owner_learning_governance_001',
      steward: 'steward_learning_governance_001',
      classification: 'pseudonymous_learning_telemetry',
      processingPurpose: 'learning_progress_sync',
      retentionClass: 'learning-event-lifecycle',
      accessPolicyId: 'policy_catalog_access_001',
      ...dataGovernance
    },
    dataContractRefs: [{
      contractId: `contract_${prefix}_001`,
      contractVersion: '1.0.0',
      contractSha256: 'a'.repeat(64),
      bindingState: 'declared'
    }],
    businessTermIds: [`term_${prefix}_001`],
    qualityRuleIds: [`quality_${prefix}_001`]
  };
}

async function applyCatalogIntegrity(catalog) {
  const catalogContract = await import(CATALOG_MODULE_URL.href);
  for (const asset of catalog.assets) {
    asset.definitionSha256 = catalogContract.calculateDataAssetDefinitionSha256(asset);
  }
  const byAssetId = new Map(catalog.assets.map(asset => [asset.assetId, asset]));
  for (const edge of catalog.lineageEdges) {
    edge.upstream.definitionSha256 = byAssetId.get(edge.upstream.assetId).definitionSha256;
    edge.downstream.definitionSha256 = byAssetId.get(edge.downstream.assetId).definitionSha256;
  }
  catalog.catalogSha256 = catalogContract.calculateDataAssetCatalogSha256(catalog);
  return catalog;
}

async function validDataAssetCatalog() {
  const catalog = {
    contractVersion: '1.0.0',
    catalogId: 'catalog_learning_governance_001',
    catalogRevisionId: 'catalogrev_learning_governance_001',
    catalogRevisionSequence: 1,
    lifecycleState: 'registered',
    catalogSha256: null,
    assets: [
      catalogAsset({
        assetId: 'dataasset_governed_delivery_snapshot_001',
        assetKind: 'governed_content_delivery_snapshot',
        revisionId: 'dataassetrev_governed_delivery_snapshot_001',
        revisionSequence: 1,
        domain: 'content_delivery',
        dataGovernance: {
          classification: 'governance_record',
          processingPurpose: 'student_content_delivery',
          retentionClass: 'content-delivery-lifecycle',
          accessPolicyId: 'policy_content_delivery_001'
        },
        prefix: 'delivery'
      }),
      catalogAsset({
        assetId: 'dataasset_learning_event_stream_001',
        assetKind: 'learning_event_stream',
        revisionId: 'dataassetrev_learning_event_stream_001',
        revisionSequence: 1,
        domain: 'learning_assessment',
        dataGovernance: {},
        prefix: 'event_stream'
      }),
      catalogAsset({
        assetId: 'dataasset_learning_sync_receipt_001',
        assetKind: 'learning_sync_receipt',
        revisionId: 'dataassetrev_learning_sync_receipt_001',
        revisionSequence: 1,
        domain: 'learning_assessment',
        dataGovernance: {},
        prefix: 'receipt'
      }),
      catalogAsset({
        assetId: 'dataasset_learning_analytics_aggregate_001',
        assetKind: 'learning_analytics_aggregate',
        revisionId: 'dataassetrev_learning_analytics_aggregate_001',
        revisionSequence: 1,
        domain: 'analytics',
        dataGovernance: {
          classification: 'aggregated_learning_analytics',
          processingPurpose: 'learning_analytics',
          retentionClass: 'analytics-lifecycle',
          accessPolicyId: 'policy_learning_analytics_001'
        },
        prefix: 'analytics'
      })
    ],
    lineageEdges: [
      {
        edgeId: 'lineage_delivery_to_event_001',
        relationship: 'derives_from',
        upstream: {
          assetId: 'dataasset_governed_delivery_snapshot_001',
          revisionId: 'dataassetrev_governed_delivery_snapshot_001',
          definitionSha256: null
        },
        downstream: {
          assetId: 'dataasset_learning_event_stream_001',
          revisionId: 'dataassetrev_learning_event_stream_001',
          definitionSha256: null
        }
      },
      {
        edgeId: 'lineage_event_to_receipt_001',
        relationship: 'derives_from',
        upstream: {
          assetId: 'dataasset_learning_event_stream_001',
          revisionId: 'dataassetrev_learning_event_stream_001',
          definitionSha256: null
        },
        downstream: {
          assetId: 'dataasset_learning_sync_receipt_001',
          revisionId: 'dataassetrev_learning_sync_receipt_001',
          definitionSha256: null
        }
      },
      {
        edgeId: 'lineage_receipt_to_analytics_001',
        relationship: 'derives_from',
        upstream: {
          assetId: 'dataasset_learning_sync_receipt_001',
          revisionId: 'dataassetrev_learning_sync_receipt_001',
          definitionSha256: null
        },
        downstream: {
          assetId: 'dataasset_learning_analytics_aggregate_001',
          revisionId: 'dataassetrev_learning_analytics_aggregate_001',
          definitionSha256: null
        }
      }
    ]
  };

  return applyCatalogIntegrity(catalog);
}

async function validServerResolvedInput() {
  const v1 = await import(V1_MODULE_URL.href);
  const batch = clientBatch();
  const clientValidation = v1.validatePseudonymousLearningSyncBatch(batch);
  assert.equal(clientValidation.valid, true, 'the V2 fixture must begin with a valid V1 client batch');
  const targetSha256 = v1.calculateLearningEventContentTargetSha256(batch.contentTarget);
  const scopeSha256 = v1.calculateLearningSyncScopeSha256({
    contractVersion: '1.0.0',
    tenantId: TENANT_ID,
    learnerPseudonym: LEARNER_PSEUDONYM,
    purpose: 'learning_progress_sync',
    eventStreamId: batch.eventStreamId,
    targetSha256
  });
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
  authorizationSnapshot.authorizationSha256 = v1.calculateLearningSyncAuthorizationSnapshotSha256(authorizationSnapshot);
  const entitlementSnapshot = {
    entitlementId: 'ENT-SYNC-001',
    entitlementSha256: null,
    entitlementPolicyVersion: 'learning-assignment-v1',
    state: 'active',
    scopeSha256,
    issuedAt: '2026-10-03T07:00:00.000Z',
    expiresAt: '2026-10-03T09:00:00.000Z'
  };
  entitlementSnapshot.entitlementSha256 = v1.calculateLearningSyncEntitlementSnapshotSha256(entitlementSnapshot);
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
  governedTargetSnapshot.snapshotSha256 = v1.calculateLearningSyncGovernedTargetSnapshotSha256(governedTargetSnapshot);
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
  activityScopeSnapshot.snapshotSha256 = v1.calculateLearningSyncActivityScopeSnapshotSha256(activityScopeSnapshot);
  const dataHandlingSnapshot = {
    policyId: 'DATA-SYNC-001',
    policySha256: null,
    purpose: 'learning_progress_sync',
    classification: 'pseudonymous_learning_telemetry',
    retentionClass: 'learning-event-lifecycle',
    auditPolicyVersion: 'audit-v1'
  };
  dataHandlingSnapshot.policySha256 = v1.calculateLearningSyncDataHandlingSnapshotSha256(dataHandlingSnapshot);
  const streamStateSnapshot = {
    snapshotId: 'STREAM-SYNC-001',
    stateSha256: null,
    scopeSha256,
    lastAcceptedSequence: 40,
    lastAcceptedEventSha256: 'c'.repeat(64),
    streamVersion: 7,
    capturedAt: '2026-10-03T07:58:00.000Z'
  };
  streamStateSnapshot.stateSha256 = v1.calculateLearningSyncStreamStateSnapshotSha256(streamStateSnapshot);

  return {
    resolverContext: {
      contractVersion: '1.0.0',
      invocationId: 'syncinv_000000000001',
      observedAt: OBSERVED_AT,
      tenantId: TENANT_ID,
      actorPseudonym: LEARNER_PSEUDONYM,
      actorRole: 'student',
      purpose: 'learning_progress_sync',
      timeSourceId: 'server_clock_001'
    },
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
    },
    receiptGovernanceBindingLookup: { binding: null },
    dataAssetCatalog: await validDataAssetCatalog()
  };
}

async function exactReplayServerResolvedInput() {
  const input = await validServerResolvedInput();
  const v1 = await import(V1_MODULE_URL.href);
  const validation = v1.validatePseudonymousLearningSyncBatch(input.clientBatch);
  const scopeSha256 = input.streamStateSnapshot.scopeSha256;
  const receipt = {
    receiptId: 'RECEIPT-SYNC-001',
    receiptSha256: null,
    scopeSha256,
    batchId: input.clientBatch.batchId,
    idempotencyKey: input.clientBatch.idempotencyKey,
    batchSha256: validation.integrity.batchSha256,
    firstEventSequence: 41,
    lastEventSequence: 42,
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
  receipt.receiptSha256 = v1.calculateLearningSyncReceiptSha256(receipt);
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
  input.streamStateSnapshot.stateSha256 = v1.calculateLearningSyncStreamStateSnapshotSha256(input.streamStateSnapshot);
  input.activityScopeSnapshot = {
    ...input.activityScopeSnapshot,
    streamVersion: 8,
    stateThroughSequence: 42,
    lastEventSha256: validation.integrity.eventSha256es[1],
    activities: input.activityScopeSnapshot.activities.map(activity => ({ ...activity, currentState: 'completed' })),
    snapshotSha256: null
  };
  input.activityScopeSnapshot.snapshotSha256 = v1.calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);
  return { input, receipt };
}

function catalogBindingFor(input) {
  const byKind = new Map(input.dataAssetCatalog.assets.map(asset => [asset.assetKind, asset]));
  const reference = asset => ({
    assetId: asset.assetId,
    revisionId: asset.revisionId,
    definitionSha256: asset.definitionSha256
  });
  return {
    catalogId: input.dataAssetCatalog.catalogId,
    catalogRevisionId: input.dataAssetCatalog.catalogRevisionId,
    catalogRevisionSequence: input.dataAssetCatalog.catalogRevisionSequence,
    catalogSha256: input.dataAssetCatalog.catalogSha256,
    governedContentDeliverySnapshot: reference(byKind.get('governed_content_delivery_snapshot')),
    learningEventStream: reference(byKind.get('learning_event_stream')),
    learningSyncReceipt: reference(byKind.get('learning_sync_receipt'))
  };
}

function receiptGovernanceBindingFor(input, receipt) {
  const binding = {
    bindingContractVersion: '2.0.0',
    bindingSha256: '0'.repeat(64),
    receiptId: receipt.receiptId,
    receiptSha256: receipt.receiptSha256,
    scopeSha256: receipt.scopeSha256,
    batchSha256: receipt.batchSha256,
    dataHandlingPolicyId: input.dataHandlingSnapshot.policyId,
    dataHandlingPolicySha256: input.dataHandlingSnapshot.policySha256,
    catalogBinding: catalogBindingFor(input)
  };
  binding.bindingSha256 = receiptGovernanceBindingSha256(binding);
  return binding;
}

test('returns an immutable catalog binding only when the V1 append decision and server catalog align', async () => {
  const v2 = await loadV2Contract();
  const input = await validServerResolvedInput();

  const result = v2.evaluateCatalogBoundLearningSyncEligibility(input);

  assert.equal(result.eligible, true);
  assert.equal(result.nextState, 'append_eligible');
  assert.deepEqual(result.errors, []);
  assert.equal(result.appendIntent.dataHandlingPolicyId, 'DATA-SYNC-001');
  assert.deepEqual(result.appendIntent.catalogBinding, {
    catalogId: 'catalog_learning_governance_001',
    catalogRevisionId: 'catalogrev_learning_governance_001',
    catalogRevisionSequence: 1,
    catalogSha256: input.dataAssetCatalog.catalogSha256,
    governedContentDeliverySnapshot: {
      assetId: 'dataasset_governed_delivery_snapshot_001',
      revisionId: 'dataassetrev_governed_delivery_snapshot_001',
      definitionSha256: input.dataAssetCatalog.assets[0].definitionSha256
    },
    learningEventStream: {
      assetId: 'dataasset_learning_event_stream_001',
      revisionId: 'dataassetrev_learning_event_stream_001',
      definitionSha256: input.dataAssetCatalog.assets[1].definitionSha256
    },
    learningSyncReceipt: {
      assetId: 'dataasset_learning_sync_receipt_001',
      revisionId: 'dataassetrev_learning_sync_receipt_001',
      definitionSha256: input.dataAssetCatalog.assets[2].definitionSha256
    }
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.appendIntent), true);
  assert.equal(Object.isFrozen(result.appendIntent.catalogBinding), true);
  assert.equal(Object.isFrozen(result.appendIntent.catalogBinding.learningEventStream), true);
  assert.equal('owner' in result.appendIntent.catalogBinding, false);
  assert.equal('accessPolicyId' in result.appendIntent.catalogBinding, false);
  assert.equal('dataAssetCatalog' in result.appendIntent, false);

  input.dataAssetCatalog.assets[1].dataGovernance.owner = 'owner_changed_after_binding_001';
  assert.equal(result.appendIntent.catalogBinding.learningEventStream.assetId, 'dataasset_learning_event_stream_001');
});

test('blocks a stale catalog hash, a client-injected catalog field, and each governed data-handling mismatch', async () => {
  const v2 = await loadV2Contract();

  const staleCatalogInput = await validServerResolvedInput();
  staleCatalogInput.dataAssetCatalog.assets[1].dataGovernance.steward = 'steward_stale_hash_001';
  const staleCatalogResult = v2.evaluateCatalogBoundLearningSyncEligibility(staleCatalogInput);
  assert.equal(staleCatalogResult.nextState, 'blocked');
  assert.equal(staleCatalogResult.errors.some(error => error.code === 'definition_sha256_mismatch'), true);
  assert.equal('appendIntent' in staleCatalogResult, false);

  const clientInjectedInput = await validServerResolvedInput();
  clientInjectedInput.clientBatch.dataAssetCatalog = { catalogId: 'forged_catalog_001' };
  const clientInjectedResult = v2.evaluateCatalogBoundLearningSyncEligibility(clientInjectedInput);
  assert.equal(clientInjectedResult.nextState, 'blocked');
  assert.equal(clientInjectedResult.errors.some(error => error.code === 'client_batch_invalid'), true);
  assert.equal('appendIntent' in clientInjectedResult, false);

  const classificationMismatchInput = await validServerResolvedInput();
  const v1 = await import(V1_MODULE_URL.href);
  classificationMismatchInput.dataHandlingSnapshot = {
    ...classificationMismatchInput.dataHandlingSnapshot,
    classification: 'different_classification_001',
    policySha256: null
  };
  classificationMismatchInput.dataHandlingSnapshot.policySha256 = v1.calculateLearningSyncDataHandlingSnapshotSha256(classificationMismatchInput.dataHandlingSnapshot);
  const classificationMismatchResult = v2.evaluateCatalogBoundLearningSyncEligibility(classificationMismatchInput);
  assert.equal(classificationMismatchResult.nextState, 'blocked');
  assert.equal(classificationMismatchResult.errors.some(error => error.code === 'catalog_event_stream_classification_mismatch'), true);
  assert.equal('appendIntent' in classificationMismatchResult, false);

  const retentionMismatchInput = await validServerResolvedInput();
  const receiptAsset = retentionMismatchInput.dataAssetCatalog.assets.find(item => item.assetKind === 'learning_sync_receipt');
  receiptAsset.dataGovernance.retentionClass = 'different_retention_001';
  await applyCatalogIntegrity(retentionMismatchInput.dataAssetCatalog);
  const retentionMismatchResult = v2.evaluateCatalogBoundLearningSyncEligibility(retentionMismatchInput);
  assert.equal(retentionMismatchResult.nextState, 'blocked');
  assert.equal(retentionMismatchResult.errors.some(error => error.code === 'catalog_receipt_retentionClass_mismatch'), true);
  assert.equal('appendIntent' in retentionMismatchResult, false);
});

test('does not equate catalog access policy with data-handling policy and leaves delivery metadata outside the handling comparison', async () => {
  const v2 = await loadV2Contract();
  const input = await validServerResolvedInput();
  const delivery = input.dataAssetCatalog.assets.find(item => item.assetKind === 'governed_content_delivery_snapshot');
  const eventStream = input.dataAssetCatalog.assets.find(item => item.assetKind === 'learning_event_stream');
  const receipt = input.dataAssetCatalog.assets.find(item => item.assetKind === 'learning_sync_receipt');

  assert.notEqual(eventStream.dataGovernance.accessPolicyId, input.dataHandlingSnapshot.policyId);
  assert.notEqual(receipt.dataGovernance.accessPolicyId, input.dataHandlingSnapshot.policyId);
  assert.notEqual(delivery.dataGovernance.processingPurpose, input.dataHandlingSnapshot.purpose);
  assert.notEqual(delivery.dataGovernance.classification, input.dataHandlingSnapshot.classification);

  const result = v2.evaluateCatalogBoundLearningSyncEligibility(input);
  assert.equal(result.nextState, 'append_eligible');
});

test('rejects malformed data-handling values before they can invoke nested getters during hash verification', async () => {
  const v2 = await loadV2Contract();
  const input = await validServerResolvedInput();
  let reads = 0;
  const hostileClassification = {};
  Object.defineProperty(hostileClassification, 'value', {
    enumerable: true,
    get() {
      reads += 1;
      return 'do-not-read';
    }
  });
  input.dataHandlingSnapshot.classification = hostileClassification;
  let result;

  assert.doesNotThrow(() => {
    result = v2.evaluateCatalogBoundLearningSyncEligibility(input);
  });

  assert.equal(result.nextState, 'blocked');
  assert.equal(reads, 0, 'invalid nested data-handling values must not reach a hash helper');
  assert.equal(result.errors.some(error => error.code === 'data_handling_field_invalid'), true);
  assert.equal(result.errors.some(error => error.code === 'server_snapshot_unreadable'), false);
});

test('binds the complete immutable data-handling policy snapshot to a V2 append intent', async () => {
  const v2 = await loadV2Contract();
  const v1 = await import(V1_MODULE_URL.href);
  const firstInput = await validServerResolvedInput();
  const changedAuditInput = await validServerResolvedInput();
  changedAuditInput.dataHandlingSnapshot = {
    ...changedAuditInput.dataHandlingSnapshot,
    auditPolicyVersion: 'audit-v2',
    policySha256: null
  };
  changedAuditInput.dataHandlingSnapshot.policySha256 = v1.calculateLearningSyncDataHandlingSnapshotSha256(changedAuditInput.dataHandlingSnapshot);

  const firstResult = v2.evaluateCatalogBoundLearningSyncEligibility(firstInput);
  const changedAuditResult = v2.evaluateCatalogBoundLearningSyncEligibility(changedAuditInput);

  assert.equal(firstResult.nextState, 'append_eligible');
  assert.equal(changedAuditResult.nextState, 'append_eligible');
  assert.equal(firstResult.appendIntent.dataHandlingPolicyId, 'DATA-SYNC-001');
  assert.equal(changedAuditResult.appendIntent.dataHandlingPolicyId, 'DATA-SYNC-001');
  assert.deepEqual(firstResult.appendIntent.dataHandlingBinding, {
    sourceContractVersion: '1.0.0',
    policyId: 'DATA-SYNC-001',
    policySha256: firstInput.dataHandlingSnapshot.policySha256,
    purpose: 'learning_progress_sync',
    classification: 'pseudonymous_learning_telemetry',
    retentionClass: 'learning-event-lifecycle',
    auditPolicyVersion: 'audit-v1'
  });
  assert.notEqual(
    firstResult.appendIntent.dataHandlingBinding.policySha256,
    changedAuditResult.appendIntent.dataHandlingBinding.policySha256,
    'a policy revision under the same policy ID must remain distinguishable to the future ledger adapter'
  );
  assert.equal(Object.isFrozen(firstResult.appendIntent.dataHandlingBinding), true);
});

test('blocks a V1-only idempotent replay when no V2 receipt governance binding proves its history', async () => {
  const v2 = await loadV2Contract();
  const { input } = await exactReplayServerResolvedInput();

  const result = v2.evaluateCatalogBoundLearningSyncEligibility(input);

  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'v2_replay_provenance_missing'), true);
  assert.equal('replayIntent' in result, false);
  assert.equal('catalogBinding' in result, false);
});

test('returns only a verified historical receipt governance binding for an exact V2 replay', async () => {
  const v2 = await loadV2Contract();
  const { input, receipt } = await exactReplayServerResolvedInput();
  const sidecar = receiptGovernanceBindingFor(input, receipt);
  input.receiptGovernanceBindingLookup = { binding: sidecar };

  const result = v2.evaluateServerResolvedLearningSyncEligibilityV2(input);

  assert.equal(result.nextState, 'idempotent_replay');
  assert.equal(result.eligible, false);
  assert.equal(result.replayIntent.receiptId, receipt.receiptId);
  assert.equal(result.replayIntent.bindingContractVersion, '2.0.0');
  assert.equal(result.replayIntent.receiptGovernanceBindingSha256, sidecar.bindingSha256);
  assert.deepEqual(result.replayIntent.catalogBinding, sidecar.catalogBinding);
  assert.deepEqual(result.replayIntent.dataHandlingBinding, {
    sourceContractVersion: '1.0.0',
    policyId: 'DATA-SYNC-001',
    policySha256: input.dataHandlingSnapshot.policySha256,
    purpose: 'learning_progress_sync',
    classification: 'pseudonymous_learning_telemetry',
    retentionClass: 'learning-event-lifecycle',
    auditPolicyVersion: 'audit-v1'
  });
  assert.equal(Object.isFrozen(result.replayIntent), true);
  assert.equal(Object.isFrozen(result.replayIntent.catalogBinding), true);
  assert.equal(Object.isFrozen(result.replayIntent.dataHandlingBinding), true);
});

test('derives a receipt governance binding hash without trusting Object.keys after module initialization', async () => {
  const v2 = await loadV2Contract();
  const { input, receipt } = await exactReplayServerResolvedInput();
  const sidecar = receiptGovernanceBindingFor(input, receipt);
  const expected = receiptGovernanceBindingSha256(sidecar);
  const originalObjectKeys = Object.keys;
  let actual;

  try {
    Object.keys = () => {
      throw new Error('global Object.keys must not be used after contract initialization');
    };
    assert.doesNotThrow(() => {
      actual = v2.calculateLearningSyncReceiptGovernanceBindingSha256(sidecar);
    });
  } finally {
    Object.keys = originalObjectKeys;
  }

  assert.equal(actual, expected);
});

test('blocks an exact replay when the current immutable data-handling policy has drifted under the same policy ID', async () => {
  const v2 = await loadV2Contract();
  const v1 = await import(V1_MODULE_URL.href);
  const { input, receipt } = await exactReplayServerResolvedInput();
  input.receiptGovernanceBindingLookup = { binding: receiptGovernanceBindingFor(input, receipt) };
  input.dataHandlingSnapshot = {
    ...input.dataHandlingSnapshot,
    auditPolicyVersion: 'audit-v2',
    policySha256: null
  };
  input.dataHandlingSnapshot.policySha256 = v1.calculateLearningSyncDataHandlingSnapshotSha256(input.dataHandlingSnapshot);

  const result = v2.evaluateCatalogBoundLearningSyncEligibility(input);

  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'receipt_governance_binding_policy_mismatch'), true);
  assert.equal('replayIntent' in result, false);
});

test('blocks an exact replay when the resolver supplies a different catalog revision than the historical receipt binding', async () => {
  const v2 = await loadV2Contract();
  const { input, receipt } = await exactReplayServerResolvedInput();
  input.receiptGovernanceBindingLookup = { binding: receiptGovernanceBindingFor(input, receipt) };
  input.dataAssetCatalog = {
    ...input.dataAssetCatalog,
    catalogRevisionId: 'catalogrev_learning_governance_002',
    catalogRevisionSequence: 2,
    catalogSha256: null
  };
  await applyCatalogIntegrity(input.dataAssetCatalog);

  const result = v2.evaluateCatalogBoundLearningSyncEligibility(input);

  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'receipt_governance_binding_catalog_mismatch'), true);
  assert.equal('replayIntent' in result, false);
});

test('blocks a sidecar whose declared binding hash no longer covers its historical references', async () => {
  const v2 = await loadV2Contract();
  const { input, receipt } = await exactReplayServerResolvedInput();
  const sidecar = receiptGovernanceBindingFor(input, receipt);
  sidecar.catalogBinding.learningEventStream.revisionId = 'dataassetrev_tampered_001';
  input.receiptGovernanceBindingLookup = { binding: sidecar };

  const result = v2.evaluateCatalogBoundLearningSyncEligibility(input);

  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'receipt_governance_binding_hash_mismatch'), true);
  assert.equal('replayIntent' in result, false);
});

test('blocks a new append when server input presents an already-existing receipt governance binding', async () => {
  const v2 = await loadV2Contract();
  const appendInput = await validServerResolvedInput();
  const { input: replayInput, receipt } = await exactReplayServerResolvedInput();
  appendInput.receiptGovernanceBindingLookup = { binding: receiptGovernanceBindingFor(replayInput, receipt) };

  const result = v2.evaluateCatalogBoundLearningSyncEligibility(appendInput);

  assert.equal(result.nextState, 'blocked');
  assert.equal(result.errors.some(error => error.code === 'receipt_governance_binding_unexpected_for_append'), true);
  assert.equal('appendIntent' in result, false);
});
