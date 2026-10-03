import { createHash } from 'node:crypto';

const V1_MODULE_URL = new URL('../../packages/contracts/learning_event_sync_eligibility.mjs', import.meta.url);
const CATALOG_MODULE_URL = new URL('../../packages/contracts/data_asset_catalog.mjs', import.meta.url);

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

export function createLearningSyncClientBatch() {
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

async function createValidDataAssetCatalog() {
  return applyCatalogIntegrity({
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
  });
}

export async function createValidServerResolvedLearningSyncInput() {
  const v1 = await import(V1_MODULE_URL.href);
  const clientBatch = createLearningSyncClientBatch();
  const clientValidation = v1.validatePseudonymousLearningSyncBatch(clientBatch);
  if (!clientValidation.valid) throw new Error('fixture client batch must satisfy the V1 contract');
  const targetSha256 = v1.calculateLearningEventContentTargetSha256(clientBatch.contentTarget);
  const scopeSha256 = v1.calculateLearningSyncScopeSha256({
    contractVersion: '1.0.0',
    tenantId: TENANT_ID,
    learnerPseudonym: LEARNER_PSEUDONYM,
    purpose: 'learning_progress_sync',
    eventStreamId: clientBatch.eventStreamId,
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
    publicationDecisionId: clientBatch.contentTarget.publicationDecisionId,
    curriculumRegistryEntryId: clientBatch.contentTarget.curriculumRegistryEntryId,
    programVersion: clientBatch.contentTarget.programVersion,
    outcomeCode: clientBatch.contentTarget.outcomeCode,
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
    clientBatch,
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
        packageId: clientBatch.contentTarget.packageId,
        eventStreamId: clientBatch.eventStreamId
      },
      action: 'append_learning_event_batch'
    },
    receiptGovernanceBindingLookup: { binding: null },
    dataAssetCatalog: await createValidDataAssetCatalog()
  };
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

export async function createExactReplayServerResolvedLearningSyncInput() {
  const input = await createValidServerResolvedLearningSyncInput();
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
  input.receiptGovernanceBindingLookup = { binding };
  return input;
}
