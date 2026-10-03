/**
 * Adapter-neutral preparation contract for a future atomic learning-sync
 * ledger port. It prepares an immutable command; it does not open a database,
 * acquire a lock, write a receipt, return a durable outcome, or authorize an
 * HTTP caller. The surrounding server adapter must obtain every server record
 * and the stream locator from trusted DTOs; only the nested V2 client batch
 * may originate from the client. This module never accepts a precomputed V2
 * decision, and it derives that decision in the same call as command creation.
 */

import {
  calculateLearningEventContentTargetSha256,
  calculateLearningSyncStreamStateSnapshotSha256,
  validatePseudonymousLearningSyncBatch
} from './learning_event_sync_eligibility.mjs';
import {
  evaluateServerResolvedLearningSyncEligibilityV2
} from './learning_event_sync_eligibility_v2.mjs';

export const LEARNING_SYNC_LEDGER_PORT_CONTRACT_VERSION = '1.0.0';

const arrayIsArray = Array.isArray;
const objectCreate = Object.create;
const objectDefineProperty = Object.defineProperty;
const objectFreeze = Object.freeze;
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const objectGetPrototypeOf = Object.getPrototypeOf;
const objectHasOwn = Object.hasOwn;
const objectPrototype = Object.prototype;
const reflectOwnKeys = Reflect.ownKeys;
const regExpTest = Function.call.bind(RegExp.prototype.test);
const numberIsSafeInteger = Number.isSafeInteger;

const MAX_OWN_FIELDS = 32;
const MAX_ERRORS = 32;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const ROOT_FIELDS = [
  'contractVersion',
  'serverResolvedEligibilityInput',
  'streamLocator'
];
const SERVER_RESOLVED_ELIGIBILITY_INPUT_FIELDS = [
  'resolverContext',
  'clientBatch',
  'authorizationSnapshot',
  'entitlementSnapshot',
  'governedTargetSnapshot',
  'activityScopeSnapshot',
  'dataHandlingSnapshot',
  'streamStateSnapshot',
  'receiptLookup',
  'accessRequest',
  'dataAssetCatalog',
  'receiptGovernanceBindingLookup'
];
const APPEND_DECISION_FIELDS = ['eligible', 'nextState', 'errors', 'appendIntent'];
const REPLAY_DECISION_FIELDS = ['eligible', 'nextState', 'errors', 'replayIntent'];
const APPEND_INTENT_FIELDS = [
  'invocationId',
  'scopeSha256',
  'targetSha256',
  'batchSha256',
  'expectedStreamVersion',
  'firstEventSequence',
  'lastEventSequence',
  'eventCount',
  'authorizationId',
  'entitlementId',
  'governanceSnapshotId',
  'dataHandlingPolicyId',
  'activityScopeSnapshotId',
  'activityScopeSnapshotSha256',
  'bindingContractVersion',
  'catalogBinding',
  'dataHandlingBinding'
];
const REPLAY_INTENT_FIELDS = [
  'invocationId',
  'receiptId',
  'receiptSha256',
  'scopeSha256',
  'batchSha256',
  'bindingContractVersion',
  'receiptGovernanceBindingSha256',
  'catalogBinding',
  'dataHandlingBinding'
];
const STREAM_STATE_SNAPSHOT_FIELDS = [
  'snapshotId',
  'stateSha256',
  'scopeSha256',
  'lastAcceptedSequence',
  'lastAcceptedEventSha256',
  'streamVersion',
  'capturedAt'
];
const STREAM_LOCATOR_FIELDS = ['locatorId', 'scopeSha256', 'eventStreamId'];
const CATALOG_BINDING_FIELDS = [
  'catalogId',
  'catalogRevisionId',
  'catalogRevisionSequence',
  'catalogSha256',
  'governedContentDeliverySnapshot',
  'learningEventStream',
  'learningSyncReceipt'
];
const ASSET_REFERENCE_FIELDS = ['assetId', 'revisionId', 'definitionSha256'];
const DATA_HANDLING_BINDING_FIELDS = [
  'sourceContractVersion',
  'policyId',
  'policySha256',
  'purpose',
  'classification',
  'retentionClass',
  'auditPolicyVersion'
];
const V2_BINDING_CONTRACT_VERSION = '2.0.0';

function setOwnValue(target, field, value) {
  objectDefineProperty(target, field, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function appendOwnArrayValue(array, value) {
  objectDefineProperty(array, String(array.length), {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function addError(errors, path, code, message) {
  if (errors.length >= MAX_ERRORS - 1) {
    if (errors.length === MAX_ERRORS - 1) {
      appendOwnArrayValue(errors, objectFreeze({
        path: 'input',
        code: 'validation_error_limit_exceeded',
        message: 'validation stopped after reaching the fixed error-output limit'
      }));
    }
    return;
  }
  appendOwnArrayValue(errors, objectFreeze({ path, code, message }));
}

function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || arrayIsArray(value)) return false;
  const prototype = objectGetPrototypeOf(value);
  return prototype === objectPrototype || prototype === null;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && regExpTest(SHA256_PATTERN, value);
}

function isPositiveSafeInteger(value) {
  return numberIsSafeInteger(value) && value >= 1;
}

function isNonNegativeSafeInteger(value) {
  return numberIsSafeInteger(value) && value >= 0;
}

function includesValue(values, value) {
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === value) return true;
  }
  return false;
}

function snapshotClosedRecord(value, allowedFields, path, errors) {
  if (!isPlainRecord(value)) {
    addError(errors, path, 'record_invalid', 'a plain record with own enumerable data fields is required');
    return null;
  }
  const fields = reflectOwnKeys(value);
  if (fields.length > MAX_OWN_FIELDS) {
    addError(errors, path, 'record_field_count_exceeds_limit', 'the record exceeds the fixed own-field limit');
    return null;
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field !== 'string') {
      addError(errors, path, 'symbol_field_not_allowed', 'the schema permits string field names only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!includesValue(allowedFields, field)) {
      addError(errors, path, 'unexpected_field', 'the schema is closed');
      continue;
    }
    if (!descriptor || !descriptor.enumerable) {
      addError(errors, `${path}.${field}`, 'non_enumerable_field_not_allowed', 'the schema permits enumerable fields only');
      continue;
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, `${path}.${field}`, 'accessor_field_not_allowed', 'the schema permits data fields only');
      continue;
    }
    setOwnValue(snapshot, field, descriptor.value);
  }
  return snapshot;
}

function requireFields(snapshot, fields, path, errors) {
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (!objectHasOwn(snapshot, field)) {
      addError(errors, `${path}.${field}`, 'required_field_missing', 'a required server-resolved field is missing');
    }
  }
}

function snapshotEmptyErrors(value, errors) {
  if (!arrayIsArray(value)) {
    addError(errors, 'syncDecision.errors', 'v2_decision_errors_invalid', 'an eligible V2 decision must carry an empty dense error list');
    return null;
  }
  const lengthDescriptor = objectGetOwnPropertyDescriptor(value, 'length');
  if (
    !lengthDescriptor ||
    !objectHasOwn(lengthDescriptor, 'value') ||
    lengthDescriptor.value !== 0 ||
    reflectOwnKeys(value).length !== 1
  ) {
    addError(errors, 'syncDecision.errors', 'v2_decision_errors_invalid', 'an eligible V2 append decision must carry an empty dense error list');
    return null;
  }
  return objectFreeze([]);
}

function snapshotAssetReference(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, ASSET_REFERENCE_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, ASSET_REFERENCE_FIELDS, path, errors);
  if (!isNonEmptyString(snapshot.assetId) || !isNonEmptyString(snapshot.revisionId) || !isSha256(snapshot.definitionSha256)) {
    addError(errors, path, 'catalog_binding_reference_invalid', 'a complete immutable catalog asset reference is required');
  }
  return objectFreeze(snapshot);
}

function snapshotCatalogBinding(value, errors) {
  const snapshot = snapshotClosedRecord(value, CATALOG_BINDING_FIELDS, 'syncDecision.appendIntent.catalogBinding', errors);
  if (!snapshot) return null;
  requireFields(snapshot, CATALOG_BINDING_FIELDS, 'syncDecision.appendIntent.catalogBinding', errors);
  if (!isNonEmptyString(snapshot.catalogId) || !isNonEmptyString(snapshot.catalogRevisionId) || !isPositiveSafeInteger(snapshot.catalogRevisionSequence) || !isSha256(snapshot.catalogSha256)) {
    addError(errors, 'syncDecision.appendIntent.catalogBinding', 'catalog_binding_invalid', 'a complete immutable DAMA catalog binding is required');
  }
  const referenceFields = ['governedContentDeliverySnapshot', 'learningEventStream', 'learningSyncReceipt'];
  for (let index = 0; index < referenceFields.length; index += 1) {
    const field = referenceFields[index];
    setOwnValue(snapshot, field, snapshotAssetReference(snapshot[field], `syncDecision.appendIntent.catalogBinding.${field}`, errors));
  }
  return objectFreeze(snapshot);
}

function snapshotDataHandlingBinding(value, errors) {
  const snapshot = snapshotClosedRecord(value, DATA_HANDLING_BINDING_FIELDS, 'syncDecision.appendIntent.dataHandlingBinding', errors);
  if (!snapshot) return null;
  requireFields(snapshot, DATA_HANDLING_BINDING_FIELDS, 'syncDecision.appendIntent.dataHandlingBinding', errors);
  if (snapshot.sourceContractVersion !== '1.0.0') {
    addError(errors, 'syncDecision.appendIntent.dataHandlingBinding.sourceContractVersion', 'data_handling_binding_version_invalid', 'the V2 data-handling binding must name its V1 source contract');
  }
  const stringFields = ['policyId', 'purpose', 'classification', 'retentionClass', 'auditPolicyVersion'];
  for (let index = 0; index < stringFields.length; index += 1) {
    const field = stringFields[index];
    if (!isNonEmptyString(snapshot[field])) {
      addError(errors, `syncDecision.appendIntent.dataHandlingBinding.${field}`, 'data_handling_binding_field_invalid', 'a non-empty immutable data-handling field is required');
    }
  }
  if (!isSha256(snapshot.policySha256)) {
    addError(errors, 'syncDecision.appendIntent.dataHandlingBinding.policySha256', 'data_handling_binding_hash_invalid', 'an immutable data-handling policy hash is required');
  }
  return objectFreeze(snapshot);
}

function snapshotAppendIntent(value, errors) {
  const snapshot = snapshotClosedRecord(value, APPEND_INTENT_FIELDS, 'syncDecision.appendIntent', errors);
  if (!snapshot) return null;
  requireFields(snapshot, APPEND_INTENT_FIELDS, 'syncDecision.appendIntent', errors);
  const opaqueFields = [
    'invocationId',
    'authorizationId',
    'entitlementId',
    'governanceSnapshotId',
    'dataHandlingPolicyId',
    'activityScopeSnapshotId'
  ];
  for (let index = 0; index < opaqueFields.length; index += 1) {
    const field = opaqueFields[index];
    if (!isNonEmptyString(snapshot[field])) {
      addError(errors, `syncDecision.appendIntent.${field}`, 'append_intent_field_invalid', 'a non-empty V2 append intent field is required');
    }
  }
  const hashFields = ['scopeSha256', 'targetSha256', 'batchSha256', 'activityScopeSnapshotSha256'];
  for (let index = 0; index < hashFields.length; index += 1) {
    const field = hashFields[index];
    if (!isSha256(snapshot[field])) {
      addError(errors, `syncDecision.appendIntent.${field}`, 'append_intent_hash_invalid', 'a V2 append intent SHA-256 value is required');
    }
  }
  const positiveFields = ['expectedStreamVersion', 'firstEventSequence', 'lastEventSequence', 'eventCount'];
  for (let index = 0; index < positiveFields.length; index += 1) {
    const field = positiveFields[index];
    if (!isPositiveSafeInteger(snapshot[field])) {
      addError(errors, `syncDecision.appendIntent.${field}`, 'append_intent_sequence_invalid', 'a positive V2 append intent sequence value is required');
    }
  }
  if (snapshot.lastEventSequence < snapshot.firstEventSequence || snapshot.lastEventSequence - snapshot.firstEventSequence + 1 !== snapshot.eventCount) {
    addError(errors, 'syncDecision.appendIntent', 'append_intent_range_invalid', 'the V2 append intent range must match its declared event count');
  }
  if (snapshot.bindingContractVersion !== V2_BINDING_CONTRACT_VERSION) {
    addError(errors, 'syncDecision.appendIntent.bindingContractVersion', 'v2_binding_contract_version_invalid', 'the current V2 governance binding contract is required');
  }
  const catalogBinding = snapshotCatalogBinding(snapshot.catalogBinding, errors);
  const dataHandlingBinding = snapshotDataHandlingBinding(snapshot.dataHandlingBinding, errors);
  setOwnValue(snapshot, 'catalogBinding', catalogBinding);
  setOwnValue(snapshot, 'dataHandlingBinding', dataHandlingBinding);
  if (snapshot.dataHandlingPolicyId !== dataHandlingBinding?.policyId) {
    addError(errors, 'syncDecision.appendIntent.dataHandlingPolicyId', 'data_handling_binding_mismatch', 'the V2 append intent must match its immutable data-handling binding');
  }
  return objectFreeze(snapshot);
}

function snapshotAppendDecision(value, errors) {
  const snapshot = snapshotClosedRecord(value, APPEND_DECISION_FIELDS, 'syncDecision', errors);
  if (!snapshot) return null;
  requireFields(snapshot, APPEND_DECISION_FIELDS, 'syncDecision', errors);
  if (snapshot.eligible !== true || snapshot.nextState !== 'append_eligible') {
    addError(errors, 'syncDecision', 'v2_append_decision_required', 'only a V2 append-eligible decision may prepare an append command');
  }
  snapshotEmptyErrors(snapshot.errors, errors);
  setOwnValue(snapshot, 'appendIntent', snapshotAppendIntent(snapshot.appendIntent, errors));
  return objectFreeze(snapshot);
}

function snapshotReplayIntent(value, errors) {
  const snapshot = snapshotClosedRecord(value, REPLAY_INTENT_FIELDS, 'syncDecision.replayIntent', errors);
  if (!snapshot) return null;
  requireFields(snapshot, REPLAY_INTENT_FIELDS, 'syncDecision.replayIntent', errors);
  const opaqueFields = ['invocationId', 'receiptId'];
  for (let index = 0; index < opaqueFields.length; index += 1) {
    const field = opaqueFields[index];
    if (!isNonEmptyString(snapshot[field])) {
      addError(errors, `syncDecision.replayIntent.${field}`, 'replay_intent_field_invalid', 'a non-empty V2 replay intent field is required');
    }
  }
  const hashFields = ['receiptSha256', 'scopeSha256', 'batchSha256', 'receiptGovernanceBindingSha256'];
  for (let index = 0; index < hashFields.length; index += 1) {
    const field = hashFields[index];
    if (!isSha256(snapshot[field])) {
      addError(errors, `syncDecision.replayIntent.${field}`, 'replay_intent_hash_invalid', 'a V2 replay intent SHA-256 value is required');
    }
  }
  if (snapshot.bindingContractVersion !== V2_BINDING_CONTRACT_VERSION) {
    addError(errors, 'syncDecision.replayIntent.bindingContractVersion', 'v2_binding_contract_version_invalid', 'the current V2 governance binding contract is required');
  }
  setOwnValue(snapshot, 'catalogBinding', snapshotCatalogBinding(snapshot.catalogBinding, errors));
  setOwnValue(snapshot, 'dataHandlingBinding', snapshotDataHandlingBinding(snapshot.dataHandlingBinding, errors));
  return objectFreeze(snapshot);
}

function snapshotReplayDecision(value, errors) {
  const snapshot = snapshotClosedRecord(value, REPLAY_DECISION_FIELDS, 'syncDecision', errors);
  if (!snapshot) return null;
  requireFields(snapshot, REPLAY_DECISION_FIELDS, 'syncDecision', errors);
  if (snapshot.eligible !== false || snapshot.nextState !== 'idempotent_replay') {
    addError(errors, 'syncDecision', 'v2_replay_decision_required', 'only a V2 idempotent-replay decision may prepare a replay command');
  }
  snapshotEmptyErrors(snapshot.errors, errors);
  setOwnValue(snapshot, 'replayIntent', snapshotReplayIntent(snapshot.replayIntent, errors));
  return objectFreeze(snapshot);
}

function snapshotStreamStateSnapshot(value, errors) {
  const path = 'serverResolvedEligibilityInput.streamStateSnapshot';
  const snapshot = snapshotClosedRecord(value, STREAM_STATE_SNAPSHOT_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, STREAM_STATE_SNAPSHOT_FIELDS, path, errors);
  if (!isSha256(snapshot.scopeSha256) || !isPositiveSafeInteger(snapshot.streamVersion) || !isNonNegativeSafeInteger(snapshot.lastAcceptedSequence) || !isSha256(snapshot.stateSha256)) {
    addError(errors, path, 'expected_cursor_invalid', 'a complete server-resolved cursor precondition is required');
  }
  if (!isNonEmptyString(snapshot.snapshotId) || !isNonEmptyString(snapshot.capturedAt)) {
    addError(errors, path, 'expected_cursor_invalid', 'a complete immutable stream-state snapshot is required');
  }
  if (snapshot.lastAcceptedSequence === 0) {
    if (snapshot.lastAcceptedEventSha256 !== null) {
      addError(errors, `${path}.lastAcceptedEventSha256`, 'expected_cursor_predecessor_invalid', 'an initial cursor must have no predecessor event hash');
    }
  } else if (!isSha256(snapshot.lastAcceptedEventSha256)) {
    addError(errors, `${path}.lastAcceptedEventSha256`, 'expected_cursor_predecessor_invalid', 'a non-initial cursor requires its predecessor event hash');
  }
  if (isSha256(snapshot.stateSha256) && snapshot.stateSha256 !== calculateLearningSyncStreamStateSnapshotSha256(snapshot)) {
    addError(errors, `${path}.stateSha256`, 'expected_cursor_hash_mismatch', 'the cursor precondition must retain the authoritative stream-state snapshot hash');
  }
  return objectFreeze(snapshot);
}

function createExpectedCursor(streamStateSnapshot) {
  return objectFreeze({
    scopeSha256: streamStateSnapshot.scopeSha256,
    streamVersion: streamStateSnapshot.streamVersion,
    lastAcceptedSequence: streamStateSnapshot.lastAcceptedSequence,
    lastAcceptedEventSha256: streamStateSnapshot.lastAcceptedEventSha256,
    stateSha256: streamStateSnapshot.stateSha256
  });
}

function snapshotServerResolvedEligibilityInput(value, errors) {
  const snapshot = snapshotClosedRecord(
    value,
    SERVER_RESOLVED_ELIGIBILITY_INPUT_FIELDS,
    'serverResolvedEligibilityInput',
    errors
  );
  if (!snapshot) return null;
  requireFields(snapshot, SERVER_RESOLVED_ELIGIBILITY_INPUT_FIELDS, 'serverResolvedEligibilityInput', errors);

  const clientValidation = validatePseudonymousLearningSyncBatch(snapshot.clientBatch);
  if (!clientValidation.valid) {
    addError(errors, 'serverResolvedEligibilityInput.clientBatch', 'client_batch_invalid', 'the only client-originated subtree must satisfy the closed V1 batch contract');
  }
  const streamStateSnapshot = snapshotStreamStateSnapshot(snapshot.streamStateSnapshot, errors);
  if (errors.length > 0 || !clientValidation.valid || !streamStateSnapshot) return null;

  // This detached V1-normalized batch and detached cursor prevent the port
  // from rereading caller-owned client/cursor objects after V2 evaluation.
  setOwnValue(snapshot, 'clientBatch', clientValidation.normalizedBatch);
  setOwnValue(snapshot, 'streamStateSnapshot', streamStateSnapshot);
  return objectFreeze({
    evaluationInput: objectFreeze(snapshot),
    clientValidation,
    expectedCursor: createExpectedCursor(streamStateSnapshot)
  });
}

function snapshotStreamLocator(value, errors) {
  const snapshot = snapshotClosedRecord(value, STREAM_LOCATOR_FIELDS, 'streamLocator', errors);
  if (!snapshot) return null;
  requireFields(snapshot, STREAM_LOCATOR_FIELDS, 'streamLocator', errors);
  if (typeof snapshot.locatorId !== 'string' || !/^ledgerstream_[A-Za-z0-9_-]{12,}$/u.test(snapshot.locatorId)) {
    addError(errors, 'streamLocator.locatorId', 'stream_locator_invalid', 'a server-only opaque stream locator is required');
  }
  if (!isSha256(snapshot.scopeSha256) || typeof snapshot.eventStreamId !== 'string' || !/^stream_[A-Za-z0-9_-]{12,}$/u.test(snapshot.eventStreamId)) {
    addError(errors, 'streamLocator', 'stream_locator_invalid', 'the stream locator must bind an opaque stream and scope');
  }
  return objectFreeze(snapshot);
}

function cloneAssetReference(reference) {
  return objectFreeze({
    assetId: reference.assetId,
    revisionId: reference.revisionId,
    definitionSha256: reference.definitionSha256
  });
}

function cloneCatalogBinding(binding) {
  return objectFreeze({
    catalogId: binding.catalogId,
    catalogRevisionId: binding.catalogRevisionId,
    catalogRevisionSequence: binding.catalogRevisionSequence,
    catalogSha256: binding.catalogSha256,
    governedContentDeliverySnapshot: cloneAssetReference(binding.governedContentDeliverySnapshot),
    learningEventStream: cloneAssetReference(binding.learningEventStream),
    learningSyncReceipt: cloneAssetReference(binding.learningSyncReceipt)
  });
}

function cloneDataHandlingBinding(binding) {
  return objectFreeze({
    sourceContractVersion: binding.sourceContractVersion,
    policyId: binding.policyId,
    policySha256: binding.policySha256,
    purpose: binding.purpose,
    classification: binding.classification,
    retentionClass: binding.retentionClass,
    auditPolicyVersion: binding.auditPolicyVersion
  });
}

function cloneAppendIntent(intent) {
  return objectFreeze({
    invocationId: intent.invocationId,
    scopeSha256: intent.scopeSha256,
    targetSha256: intent.targetSha256,
    batchSha256: intent.batchSha256,
    expectedStreamVersion: intent.expectedStreamVersion,
    firstEventSequence: intent.firstEventSequence,
    lastEventSequence: intent.lastEventSequence,
    eventCount: intent.eventCount,
    authorizationId: intent.authorizationId,
    entitlementId: intent.entitlementId,
    governanceSnapshotId: intent.governanceSnapshotId,
    dataHandlingPolicyId: intent.dataHandlingPolicyId,
    activityScopeSnapshotId: intent.activityScopeSnapshotId,
    activityScopeSnapshotSha256: intent.activityScopeSnapshotSha256,
    bindingContractVersion: intent.bindingContractVersion,
    catalogBinding: cloneCatalogBinding(intent.catalogBinding),
    dataHandlingBinding: cloneDataHandlingBinding(intent.dataHandlingBinding)
  });
}

function cloneReplayIntent(intent) {
  return objectFreeze({
    invocationId: intent.invocationId,
    receiptId: intent.receiptId,
    receiptSha256: intent.receiptSha256,
    scopeSha256: intent.scopeSha256,
    batchSha256: intent.batchSha256,
    bindingContractVersion: intent.bindingContractVersion,
    receiptGovernanceBindingSha256: intent.receiptGovernanceBindingSha256,
    catalogBinding: cloneCatalogBinding(intent.catalogBinding),
    dataHandlingBinding: cloneDataHandlingBinding(intent.dataHandlingBinding)
  });
}

function cloneExpectedCursor(cursor) {
  return objectFreeze({
    scopeSha256: cursor.scopeSha256,
    streamVersion: cursor.streamVersion,
    lastAcceptedSequence: cursor.lastAcceptedSequence,
    lastAcceptedEventSha256: cursor.lastAcceptedEventSha256,
    stateSha256: cursor.stateSha256
  });
}

function cloneStreamLocator(locator) {
  return objectFreeze({
    locatorId: locator.locatorId,
    scopeSha256: locator.scopeSha256,
    eventStreamId: locator.eventStreamId
  });
}

function createSubmission(validation) {
  const normalizedBatch = validation.normalizedBatch;
  const events = [];
  const eventSha256es = [];
  for (let index = 0; index < normalizedBatch.events.length; index += 1) {
    const event = normalizedBatch.events[index];
    const eventSha256 = validation.integrity.eventSha256es[index];
    appendOwnArrayValue(events, objectFreeze({
      eventId: event.eventId,
      eventSequence: event.eventSequence,
      activityId: event.activityId,
      eventType: event.eventType,
      clientOccurredAt: event.clientOccurredAt,
      eventSha256
    }));
    appendOwnArrayValue(eventSha256es, eventSha256);
  }
  return objectFreeze({
    batchId: normalizedBatch.batchId,
    idempotencyKey: normalizedBatch.idempotencyKey,
    eventStreamId: normalizedBatch.eventStreamId,
    targetSha256: calculateLearningEventContentTargetSha256(normalizedBatch.contentTarget),
    batchSha256: validation.integrity.batchSha256,
    eventSha256es: objectFreeze(eventSha256es),
    events: objectFreeze(events)
  });
}

function validateAppendBindings(intent, submission, expectedCursor, streamLocator, errors) {
  if (intent.batchSha256 !== submission.batchSha256 || intent.targetSha256 !== submission.targetSha256) {
    addError(errors, 'syncDecision.appendIntent', 'append_submission_integrity_mismatch', 'the V2 append intent must bind the normalized submission hashes exactly');
  }
  if (
    intent.firstEventSequence !== submission.events[0]?.eventSequence ||
    intent.lastEventSequence !== submission.events[submission.events.length - 1]?.eventSequence ||
    intent.eventCount !== submission.events.length
  ) {
    addError(errors, 'syncDecision.appendIntent', 'append_submission_range_mismatch', 'the V2 append intent must bind the complete normalized event range');
  }
  if (
    expectedCursor.scopeSha256 !== intent.scopeSha256 ||
    streamLocator.scopeSha256 !== intent.scopeSha256 ||
    streamLocator.eventStreamId !== submission.eventStreamId
  ) {
    addError(errors, 'streamLocator', 'append_scope_mismatch', 'the trusted cursor, locator, V2 intent, and normalized submission must identify one stream scope');
  }
  if (expectedCursor.streamVersion !== intent.expectedStreamVersion) {
    addError(errors, 'expectedCursor.streamVersion', 'append_cursor_version_mismatch', 'the expected cursor version must equal the V2 compare-and-swap precondition');
  }
  if (expectedCursor.lastAcceptedSequence + 1 !== intent.firstEventSequence) {
    addError(errors, 'expectedCursor.lastAcceptedSequence', 'append_cursor_sequence_mismatch', 'the expected cursor must immediately precede the intended event range');
  }
}

function createResult(valid, errors, command = null) {
  const copiedErrors = [];
  for (let index = 0; index < errors.length; index += 1) {
    appendOwnArrayValue(copiedErrors, errors[index]);
  }
  return objectFreeze({
    valid,
    errors: objectFreeze(copiedErrors),
    command
  });
}

/**
 * Re-evaluate one detached, server-resolved V2 input and prepare a closed,
 * immutable append or replay command for a future atomic ledger port. This
 * does not call a port or establish atomicity; `valid: true` only proves local
 * command consistency. It is not an HTTP schema: the surrounding adapter must
 * resolve all server records and the locator from authenticated context and
 * authoritative sources, then recheck them inside its eventual transaction.
 */
export function prepareLearningSyncLedgerCommand(input) {
  const errors = [];
  try {
    const root = snapshotClosedRecord(input, ROOT_FIELDS, 'input', errors);
    if (!root) return createResult(false, errors);
    requireFields(root, ROOT_FIELDS, 'input', errors);
    if (root.contractVersion !== LEARNING_SYNC_LEDGER_PORT_CONTRACT_VERSION) {
      addError(errors, 'input.contractVersion', 'contract_version_unsupported', 'the ledger port command contract version is unsupported');
    }
    const streamLocator = snapshotStreamLocator(root.streamLocator, errors);
    const serverResolved = snapshotServerResolvedEligibilityInput(root.serverResolvedEligibilityInput, errors);
    if (errors.length > 0 || !streamLocator || !serverResolved) return createResult(false, errors);

    const v2Decision = evaluateServerResolvedLearningSyncEligibilityV2(serverResolved.evaluationInput);
    if (!v2Decision || v2Decision.nextState === 'blocked') {
      addError(errors, 'serverResolvedEligibilityInput', 'v2_eligibility_blocked', 'the current server-resolved V2 evidence is not eligible for a ledger command');
      return createResult(false, errors);
    }
    if (v2Decision.nextState === 'append_eligible') {
      const decision = snapshotAppendDecision(v2Decision, errors);
      if (errors.length > 0 || !decision) return createResult(false, errors);

      const submission = createSubmission(serverResolved.clientValidation);
      validateAppendBindings(decision.appendIntent, submission, serverResolved.expectedCursor, streamLocator, errors);
      if (errors.length > 0) return createResult(false, errors);

      const command = objectFreeze({
        contractVersion: LEARNING_SYNC_LEDGER_PORT_CONTRACT_VERSION,
        commandKind: 'append',
        streamLocator: cloneStreamLocator(streamLocator),
        append: objectFreeze({
          intent: cloneAppendIntent(decision.appendIntent),
          submission,
          expectedCursor: cloneExpectedCursor(serverResolved.expectedCursor)
        })
      });
      return createResult(true, [], command);
    }
    if (v2Decision.nextState === 'idempotent_replay') {
      const decision = snapshotReplayDecision(v2Decision, errors);
      if (errors.length > 0 || !decision) return createResult(false, errors);
      if (streamLocator.scopeSha256 !== decision.replayIntent.scopeSha256) {
        addError(errors, 'streamLocator.scopeSha256', 'replay_scope_mismatch', 'the trusted stream locator must match the V2 replay scope exactly');
        return createResult(false, errors);
      }
      if (streamLocator.eventStreamId !== serverResolved.clientValidation.normalizedBatch.eventStreamId) {
        addError(errors, 'streamLocator.eventStreamId', 'replay_event_stream_mismatch', 'the trusted stream locator must match the V2-evaluated replay event stream exactly');
        return createResult(false, errors);
      }
      const command = objectFreeze({
        contractVersion: LEARNING_SYNC_LEDGER_PORT_CONTRACT_VERSION,
        commandKind: 'replay',
        streamLocator: cloneStreamLocator(streamLocator),
        replay: objectFreeze({
          intent: cloneReplayIntent(decision.replayIntent)
        })
      });
      return createResult(true, [], command);
    }
    addError(errors, 'serverResolvedEligibilityInput', 'v2_outcome_unsupported', 'the V2 eligibility evaluator returned an unsupported outcome');
    return createResult(false, errors);
  } catch {
    addError(errors, 'input', 'server_snapshot_unreadable', 'the server-resolved ledger command input could not be safely read');
    return createResult(false, errors);
  }
}
