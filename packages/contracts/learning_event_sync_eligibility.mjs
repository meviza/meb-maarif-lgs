/**
 * Pure server-resolved eligibility gate for a future learning-event sync
 * adapter. This is intentionally not an HTTP/body schema. The only
 * client-originated subtree is `clientBatch`; every other input must be
 * resolved from authorized server-side sources before this function is called.
 * The adapter must deserialize server records into trusted data values before
 * calling this kernel: JavaScript cannot reliably distinguish a fully
 * transparent in-process Proxy from a real own-data record.
 *
 * It never authenticates, persists, accepts, scores, grants mastery, or marks
 * a batch synchronized. `append_eligible` is only a compare-and-swap intent
 * for a future ledger service.
 */

import { createHash } from 'node:crypto';
import { evaluateK12Access } from './access_policy.mjs';
import {
  calculateLearningEventBatchSha256,
  calculateLearningEventContentTargetSha256,
  validatePseudonymousLearningSyncBatch
} from './learning_event_sync_batch.mjs';

export const LEARNING_EVENT_SYNC_ELIGIBILITY_CONTRACT_VERSION = '1.0.0';

export {
  calculateLearningEventBatchSha256,
  calculateLearningEventContentTargetSha256,
  validatePseudonymousLearningSyncBatch
};

const ROOT_FIELDS = [
  'resolverContext',
  'clientBatch',
  'authorizationSnapshot',
  'entitlementSnapshot',
  'governedTargetSnapshot',
  'activityScopeSnapshot',
  'dataHandlingSnapshot',
  'streamStateSnapshot',
  'receiptLookup',
  'accessRequest'
];
const RESOLVER_CONTEXT_FIELDS = [
  'contractVersion',
  'invocationId',
  'observedAt',
  'tenantId',
  'actorPseudonym',
  'actorRole',
  'purpose',
  'timeSourceId'
];
const AUTHORIZATION_FIELDS = [
  'authorizationId',
  'authorizationSha256',
  'policyVersion',
  'action',
  'effect',
  'scopeSha256',
  'issuedAt',
  'expiresAt'
];
const ENTITLEMENT_FIELDS = [
  'entitlementId',
  'entitlementSha256',
  'entitlementPolicyVersion',
  'state',
  'scopeSha256',
  'issuedAt',
  'expiresAt'
];
const GOVERNED_TARGET_FIELDS = [
  'snapshotId',
  'snapshotSha256',
  'snapshotSequence',
  'capturedAt',
  'outcome',
  'targetSha256',
  'publicationDecisionId',
  'curriculumRegistryEntryId',
  'programVersion',
  'outcomeCode',
  'governancePolicyVersion'
];
const ACTIVITY_SCOPE_FIELDS = [
  'snapshotId',
  'snapshotSha256',
  'targetSha256',
  'scopeSha256',
  'catalogVersion',
  'capturedAt',
  'streamVersion',
  'stateThroughSequence',
  'lastEventSha256',
  'activities'
];
const ACTIVITY_FIELDS = [
  'activityId',
  'lifecycleState',
  'currentState',
  'allowedEventTypes'
];
const DATA_HANDLING_FIELDS = [
  'policyId',
  'policySha256',
  'purpose',
  'classification',
  'retentionClass',
  'auditPolicyVersion'
];
const STREAM_STATE_FIELDS = [
  'snapshotId',
  'stateSha256',
  'scopeSha256',
  'lastAcceptedSequence',
  'lastAcceptedEventSha256',
  'streamVersion',
  'capturedAt'
];
const RECEIPT_LOOKUP_FIELDS = ['byIdempotencyKey', 'byBatchId', 'eventReceipts'];
const RECEIPT_FIELDS = [
  'receiptId',
  'receiptSha256',
  'scopeSha256',
  'batchId',
  'idempotencyKey',
  'batchSha256',
  'firstEventSequence',
  'lastEventSequence',
  'eventSha256es',
  'predecessorSequence',
  'predecessorEventSha256',
  'streamVersionBefore',
  'acceptedAt',
  'authorizationId',
  'entitlementId',
  'governanceSnapshotId',
  'dataHandlingPolicyId',
  'outcome'
];
const EVENT_RECEIPT_FIELDS = ['eventId', 'eventSequence', 'eventSha256', 'receiptId', 'scopeSha256'];
const ACCESS_REQUEST_FIELDS = ['actor', 'resource', 'action'];
const ACCESS_ACTOR_FIELDS = ['tenantId', 'subjectId', 'role'];
const ACCESS_RESOURCE_FIELDS = ['tenantId', 'type', 'learnerId', 'packageId', 'eventStreamId'];
const ALLOWED_ACTIVITY_EVENT_TYPES = ['activity_started', 'hint_requested', 'activity_completed'];
const arrayIsArray = Array.isArray;
const objectCreate = Object.create;
const objectDefineProperty = Object.defineProperty;
const objectFreeze = Object.freeze;
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const objectGetPrototypeOf = Object.getPrototypeOf;
const objectHasOwn = Object.hasOwn;
const objectPrototype = Object.prototype;
const reflectOwnKeys = Reflect.ownKeys;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/u;
const MAX_SERVER_ACTIVITY_ENTRIES = 10_000;
const MAX_CLIENT_BATCH_EVENT_COUNT = 100;

function isRecord(value) {
  if (value === null || typeof value !== 'object' || arrayIsArray(value)) return false;
  try {
    const prototype = objectGetPrototypeOf(value);
    return prototype === objectPrototype || prototype === null;
  } catch {
    return false;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
}

function isStrictUtcTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    return false;
  }
  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString() === value;
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function includes(list, value) {
  for (let index = 0; index < list.length; index += 1) {
    if (list[index] === value) return true;
  }
  return false;
}

function setOwnValue(target, field, value) {
  objectDefineProperty(target, field, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function snapshotClosedRecord(value, allowedFields, path, errors) {
  if (!isRecord(value)) {
    addError(errors, path, 'record_invalid', 'a plain server-resolved record with own data fields is required');
    return null;
  }
  const snapshot = objectCreate(null);
  const fields = reflectOwnKeys(value);
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field !== 'string') {
      addError(errors, path, 'symbol_field_not_allowed', 'server-resolved contracts permit string field names only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!includes(allowedFields, field)) {
      addError(errors, path, 'unsupported_field', 'this server-resolved contract has a closed schema');
      continue;
    }
    const fieldPath = path ? `${path}.${field}` : field;
    if (!descriptor.enumerable) {
      addError(errors, fieldPath, 'non_enumerable_field_not_allowed', 'server-resolved contracts require enumerable data fields');
      continue;
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, fieldPath, 'accessor_field_not_allowed', 'server-resolved contracts do not read accessors');
      continue;
    }
    setOwnValue(snapshot, field, descriptor.value);
  }
  return snapshot;
}

function snapshotDenseArray(value, path, errors, maximumLength = MAX_SERVER_ACTIVITY_ENTRIES) {
  if (!arrayIsArray(value)) {
    addError(errors, path, 'array_invalid', 'a dense server-resolved array is required');
    return null;
  }
  const lengthDescriptor = objectGetOwnPropertyDescriptor(value, 'length');
  if (!lengthDescriptor || !objectHasOwn(lengthDescriptor, 'value') || !Number.isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
    addError(errors, path, 'array_length_invalid', 'a safe non-negative array length is required');
    return null;
  }
  const length = lengthDescriptor.value;
  if (length > maximumLength) {
    addError(errors, path, 'array_length_exceeds_limit', `server-resolved array length cannot exceed ${maximumLength}`);
    return null;
  }
  const fields = reflectOwnKeys(value);
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (field === 'length') continue;
    if (typeof field !== 'string' || !ARRAY_INDEX_PATTERN.test(field) || Number(field) >= length) {
      addError(errors, path, 'unexpected_array_field', 'server-resolved arrays may contain indexed data entries only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!descriptor.enumerable) {
      addError(errors, `${path}[${field}]`, 'non_enumerable_field_not_allowed', 'server-resolved arrays require enumerable data entries');
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, `${path}[${field}]`, 'accessor_field_not_allowed', 'server-resolved arrays do not read accessors');
    }
  }
  const snapshot = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = objectGetOwnPropertyDescriptor(value, String(index));
    if (!descriptor) {
      addError(errors, `${path}[${index}]`, 'array_hole_not_allowed', 'server-resolved arrays must be dense');
      continue;
    }
    if (!descriptor.enumerable || !objectHasOwn(descriptor, 'value')) continue;
    setOwnValue(snapshot, String(index), descriptor.value);
  }
  return snapshot;
}

function freezeSnapshot(value) {
  return value === null ? null : objectFreeze(value);
}

function snapshotActivityScope(value, errors) {
  const snapshot = snapshotClosedRecord(value, ACTIVITY_SCOPE_FIELDS, 'activityScopeSnapshot', errors);
  if (!snapshot) return null;
  if (!objectHasOwn(snapshot, 'activities')) return freezeSnapshot(snapshot);
  const activities = snapshotDenseArray(snapshot.activities, 'activityScopeSnapshot.activities', errors);
  if (!activities) {
    setOwnValue(snapshot, 'activities', null);
    return freezeSnapshot(snapshot);
  }
  for (let index = 0; index < activities.length; index += 1) {
    const activity = snapshotClosedRecord(activities[index], ACTIVITY_FIELDS, `activityScopeSnapshot.activities[${index}]`, errors);
    if (!activity) {
      setOwnValue(activities, String(index), null);
      continue;
    }
    if (objectHasOwn(activity, 'allowedEventTypes')) {
      const allowedEventTypes = snapshotDenseArray(
        activity.allowedEventTypes,
        `activityScopeSnapshot.activities[${index}].allowedEventTypes`,
        errors,
        ALLOWED_ACTIVITY_EVENT_TYPES.length
      );
      setOwnValue(activity, 'allowedEventTypes', allowedEventTypes ? freezeSnapshot(allowedEventTypes) : null);
    }
    setOwnValue(activities, String(index), freezeSnapshot(activity));
  }
  setOwnValue(snapshot, 'activities', freezeSnapshot(activities));
  return freezeSnapshot(snapshot);
}

function snapshotReceipt(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, RECEIPT_FIELDS, path, errors);
  if (!snapshot) return null;
  if (objectHasOwn(snapshot, 'eventSha256es')) {
    const eventSha256es = snapshotDenseArray(snapshot.eventSha256es, `${path}.eventSha256es`, errors, MAX_CLIENT_BATCH_EVENT_COUNT);
    setOwnValue(snapshot, 'eventSha256es', eventSha256es ? freezeSnapshot(eventSha256es) : null);
  }
  return freezeSnapshot(snapshot);
}

function snapshotReceiptLookup(value, errors) {
  const snapshot = snapshotClosedRecord(value, RECEIPT_LOOKUP_FIELDS, 'receiptLookup', errors);
  if (!snapshot) return null;
  ['byIdempotencyKey', 'byBatchId'].forEach(field => {
    if (objectHasOwn(snapshot, field) && snapshot[field] !== null) {
      setOwnValue(snapshot, field, snapshotReceipt(snapshot[field], `receiptLookup.${field}`, errors));
    }
  });
  if (objectHasOwn(snapshot, 'eventReceipts')) {
    const eventReceipts = snapshotDenseArray(snapshot.eventReceipts, 'receiptLookup.eventReceipts', errors, MAX_CLIENT_BATCH_EVENT_COUNT);
    if (!eventReceipts) {
      setOwnValue(snapshot, 'eventReceipts', null);
    } else {
      for (let index = 0; index < eventReceipts.length; index += 1) {
        const eventReceipt = snapshotClosedRecord(eventReceipts[index], EVENT_RECEIPT_FIELDS, `receiptLookup.eventReceipts[${index}]`, errors);
        setOwnValue(eventReceipts, String(index), freezeSnapshot(eventReceipt));
      }
      setOwnValue(snapshot, 'eventReceipts', freezeSnapshot(eventReceipts));
    }
  }
  return freezeSnapshot(snapshot);
}

function snapshotAccessRequest(value, errors) {
  const snapshot = snapshotClosedRecord(value, ACCESS_REQUEST_FIELDS, 'accessRequest', errors);
  if (!snapshot) return null;
  if (objectHasOwn(snapshot, 'actor')) {
    setOwnValue(snapshot, 'actor', freezeSnapshot(snapshotClosedRecord(snapshot.actor, ACCESS_ACTOR_FIELDS, 'accessRequest.actor', errors)));
  }
  if (objectHasOwn(snapshot, 'resource')) {
    setOwnValue(snapshot, 'resource', freezeSnapshot(snapshotClosedRecord(snapshot.resource, ACCESS_RESOURCE_FIELDS, 'accessRequest.resource', errors)));
  }
  return freezeSnapshot(snapshot);
}

function normalizeServerResolvedInput(value, errors) {
  const input = snapshotClosedRecord(value, ROOT_FIELDS, 'input', errors);
  if (!input) return null;
  if (objectHasOwn(input, 'resolverContext')) {
    setOwnValue(input, 'resolverContext', freezeSnapshot(snapshotClosedRecord(input.resolverContext, RESOLVER_CONTEXT_FIELDS, 'resolverContext', errors)));
  }
  if (objectHasOwn(input, 'authorizationSnapshot')) {
    setOwnValue(input, 'authorizationSnapshot', freezeSnapshot(snapshotClosedRecord(input.authorizationSnapshot, AUTHORIZATION_FIELDS, 'authorizationSnapshot', errors)));
  }
  if (objectHasOwn(input, 'entitlementSnapshot')) {
    setOwnValue(input, 'entitlementSnapshot', freezeSnapshot(snapshotClosedRecord(input.entitlementSnapshot, ENTITLEMENT_FIELDS, 'entitlementSnapshot', errors)));
  }
  if (objectHasOwn(input, 'governedTargetSnapshot')) {
    setOwnValue(input, 'governedTargetSnapshot', freezeSnapshot(snapshotClosedRecord(input.governedTargetSnapshot, GOVERNED_TARGET_FIELDS, 'governedTargetSnapshot', errors)));
  }
  if (objectHasOwn(input, 'activityScopeSnapshot')) {
    setOwnValue(input, 'activityScopeSnapshot', snapshotActivityScope(input.activityScopeSnapshot, errors));
  }
  if (objectHasOwn(input, 'dataHandlingSnapshot')) {
    setOwnValue(input, 'dataHandlingSnapshot', freezeSnapshot(snapshotClosedRecord(input.dataHandlingSnapshot, DATA_HANDLING_FIELDS, 'dataHandlingSnapshot', errors)));
  }
  if (objectHasOwn(input, 'streamStateSnapshot')) {
    setOwnValue(input, 'streamStateSnapshot', freezeSnapshot(snapshotClosedRecord(input.streamStateSnapshot, STREAM_STATE_FIELDS, 'streamStateSnapshot', errors)));
  }
  if (objectHasOwn(input, 'receiptLookup')) {
    setOwnValue(input, 'receiptLookup', snapshotReceiptLookup(input.receiptLookup, errors));
  }
  if (objectHasOwn(input, 'accessRequest')) {
    setOwnValue(input, 'accessRequest', snapshotAccessRequest(input.accessRequest, errors));
  }
  return freezeSnapshot(input);
}

function rejectUnsupportedFields(record, allowedFields, path, errors) {
  if (!isRecord(record)) return;
  Object.keys(record).forEach(field => {
    if (!includes(allowedFields, field)) {
      addError(errors, path, 'unsupported_field', 'this server-resolved contract has a closed schema');
    }
  });
}

function requireString(errors, value, path, code) {
  if (!isNonEmptyString(value)) addError(errors, path, code, 'a non-empty server-resolved string is required');
}

function requireSha256(errors, value, path, code) {
  if (!isSha256(value)) addError(errors, path, code, 'a lowercase SHA-256 digest is required');
}

function requireTimestamp(errors, value, path, code) {
  if (!isStrictUtcTimestamp(value)) addError(errors, path, code, 'a strict UTC timestamp is required');
}

function requirePositiveInteger(errors, value, path, code) {
  if (!Number.isSafeInteger(value) || value < 1) {
    addError(errors, path, code, 'a positive safe integer is required');
  }
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(',')}}`;
}

function sha256Canonical(value) {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

function omitHashField(snapshot, hashField) {
  if (!isRecord(snapshot)) return null;
  const { [hashField]: ignored, ...payload } = snapshot;
  return payload;
}

export function calculateLearningSyncScopeSha256(scope) {
  if (!isRecord(scope)) return null;
  return sha256Canonical({
    contractVersion: scope.contractVersion,
    tenantId: scope.tenantId,
    learnerPseudonym: scope.learnerPseudonym,
    purpose: scope.purpose,
    eventStreamId: scope.eventStreamId,
    targetSha256: scope.targetSha256
  });
}

export function calculateLearningSyncAuthorizationSnapshotSha256(snapshot) {
  const payload = omitHashField(snapshot, 'authorizationSha256');
  return payload === null ? null : sha256Canonical(payload);
}

export function calculateLearningSyncEntitlementSnapshotSha256(snapshot) {
  const payload = omitHashField(snapshot, 'entitlementSha256');
  return payload === null ? null : sha256Canonical(payload);
}

export function calculateLearningSyncGovernedTargetSnapshotSha256(snapshot) {
  const payload = omitHashField(snapshot, 'snapshotSha256');
  return payload === null ? null : sha256Canonical(payload);
}

export function calculateLearningSyncActivityScopeSnapshotSha256(snapshot) {
  const payload = omitHashField(snapshot, 'snapshotSha256');
  return payload === null ? null : sha256Canonical(payload);
}

export function calculateLearningSyncDataHandlingSnapshotSha256(snapshot) {
  const payload = omitHashField(snapshot, 'policySha256');
  return payload === null ? null : sha256Canonical(payload);
}

export function calculateLearningSyncStreamStateSnapshotSha256(snapshot) {
  const payload = omitHashField(snapshot, 'stateSha256');
  return payload === null ? null : sha256Canonical(payload);
}

export function calculateLearningSyncReceiptSha256(receipt) {
  const payload = omitHashField(receipt, 'receiptSha256');
  return payload === null ? null : sha256Canonical(payload);
}

function validateResolverContext(context, errors) {
  if (!isRecord(context)) {
    addError(errors, 'resolverContext', 'resolver_context_missing', 'a server-resolved context is required');
    return;
  }
  rejectUnsupportedFields(context, RESOLVER_CONTEXT_FIELDS, 'resolverContext', errors);
  if (context.contractVersion !== LEARNING_EVENT_SYNC_ELIGIBILITY_CONTRACT_VERSION) {
    addError(errors, 'resolverContext.contractVersion', 'contract_version_unsupported', 'the server resolver contract version is unsupported');
  }
  requireString(errors, context.invocationId, 'resolverContext.invocationId', 'invocation_id_invalid');
  requireTimestamp(errors, context.observedAt, 'resolverContext.observedAt', 'observed_at_invalid');
  requireString(errors, context.tenantId, 'resolverContext.tenantId', 'tenant_id_invalid');
  if (typeof context.actorPseudonym !== 'string' || !/^learner_[A-Za-z0-9_-]{12,}$/u.test(context.actorPseudonym)) {
    addError(errors, 'resolverContext.actorPseudonym', 'actor_pseudonym_invalid', 'a non-identifying learner pseudonym is required');
  }
  if (context.actorRole !== 'student') {
    addError(errors, 'resolverContext.actorRole', 'actor_role_invalid', 'only a student may append this event stream');
  }
  if (context.purpose !== 'learning_progress_sync') {
    addError(errors, 'resolverContext.purpose', 'purpose_invalid', 'the resolver purpose must be learning_progress_sync');
  }
  requireString(errors, context.timeSourceId, 'resolverContext.timeSourceId', 'time_source_id_invalid');
}

function validateSnapshot(snapshot, fields, path, errors) {
  if (!isRecord(snapshot)) {
    addError(errors, path, `${path}_missing`, 'a server-resolved snapshot is required');
    return false;
  }
  rejectUnsupportedFields(snapshot, fields, path, errors);
  return true;
}

function validateAuthorization(snapshot, errors) {
  if (!validateSnapshot(snapshot, AUTHORIZATION_FIELDS, 'authorizationSnapshot', errors)) return;
  ['authorizationId', 'policyVersion', 'scopeSha256'].forEach(field => {
    requireString(errors, snapshot[field], `authorizationSnapshot.${field}`, 'authorization_field_invalid');
  });
  requireSha256(errors, snapshot.authorizationSha256, 'authorizationSnapshot.authorizationSha256', 'authorization_hash_invalid');
  if (snapshot.action !== 'append_learning_event_batch' || snapshot.effect !== 'allow') {
    addError(errors, 'authorizationSnapshot', 'authorization_not_append_allow', 'authorization must allow append_learning_event_batch');
  }
  requireTimestamp(errors, snapshot.issuedAt, 'authorizationSnapshot.issuedAt', 'authorization_issued_at_invalid');
  requireTimestamp(errors, snapshot.expiresAt, 'authorizationSnapshot.expiresAt', 'authorization_expires_at_invalid');
}

function validateEntitlement(snapshot, errors) {
  if (!validateSnapshot(snapshot, ENTITLEMENT_FIELDS, 'entitlementSnapshot', errors)) return;
  ['entitlementId', 'entitlementPolicyVersion', 'scopeSha256'].forEach(field => {
    requireString(errors, snapshot[field], `entitlementSnapshot.${field}`, 'entitlement_field_invalid');
  });
  requireSha256(errors, snapshot.entitlementSha256, 'entitlementSnapshot.entitlementSha256', 'entitlement_hash_invalid');
  if (snapshot.state !== 'active') addError(errors, 'entitlementSnapshot.state', 'entitlement_state_invalid', 'the learner entitlement must be active');
  requireTimestamp(errors, snapshot.issuedAt, 'entitlementSnapshot.issuedAt', 'entitlement_issued_at_invalid');
  requireTimestamp(errors, snapshot.expiresAt, 'entitlementSnapshot.expiresAt', 'entitlement_expires_at_invalid');
}

function validateGovernedTarget(snapshot, errors) {
  if (!validateSnapshot(snapshot, GOVERNED_TARGET_FIELDS, 'governedTargetSnapshot', errors)) return;
  ['snapshotId', 'targetSha256', 'publicationDecisionId', 'curriculumRegistryEntryId', 'programVersion', 'outcomeCode', 'governancePolicyVersion'].forEach(field => {
    requireString(errors, snapshot[field], `governedTargetSnapshot.${field}`, 'governed_target_field_invalid');
  });
  requireSha256(errors, snapshot.snapshotSha256, 'governedTargetSnapshot.snapshotSha256', 'governed_target_hash_invalid');
  requirePositiveInteger(errors, snapshot.snapshotSequence, 'governedTargetSnapshot.snapshotSequence', 'governed_target_sequence_invalid');
  if (snapshot.outcome !== 'published') addError(errors, 'governedTargetSnapshot.outcome', 'governed_target_not_published', 'the target must be effectively published');
  requireTimestamp(errors, snapshot.capturedAt, 'governedTargetSnapshot.capturedAt', 'governed_target_captured_at_invalid');
}

function validateActivityScope(snapshot, errors) {
  if (!validateSnapshot(snapshot, ACTIVITY_SCOPE_FIELDS, 'activityScopeSnapshot', errors)) return;
  ['snapshotId', 'targetSha256', 'scopeSha256', 'catalogVersion'].forEach(field => {
    requireString(errors, snapshot[field], `activityScopeSnapshot.${field}`, 'activity_scope_field_invalid');
  });
  requireSha256(errors, snapshot.snapshotSha256, 'activityScopeSnapshot.snapshotSha256', 'activity_scope_hash_invalid');
  requireTimestamp(errors, snapshot.capturedAt, 'activityScopeSnapshot.capturedAt', 'activity_scope_captured_at_invalid');
  requirePositiveInteger(errors, snapshot.streamVersion, 'activityScopeSnapshot.streamVersion', 'activity_scope_stream_version_invalid');
  if (!Number.isSafeInteger(snapshot.stateThroughSequence) || snapshot.stateThroughSequence < 0) {
    addError(errors, 'activityScopeSnapshot.stateThroughSequence', 'activity_scope_state_sequence_invalid', 'activity state must identify a non-negative stream sequence');
  }
  if (snapshot.stateThroughSequence === 0 && snapshot.lastEventSha256 !== null) {
    addError(errors, 'activityScopeSnapshot.lastEventSha256', 'activity_scope_state_hash_invalid', 'an initial activity state cannot name a prior event hash');
  }
  if (snapshot.stateThroughSequence > 0) {
    requireSha256(errors, snapshot.lastEventSha256, 'activityScopeSnapshot.lastEventSha256', 'activity_scope_state_hash_invalid');
  }
  if (!Array.isArray(snapshot.activities) || snapshot.activities.length === 0) {
    addError(errors, 'activityScopeSnapshot.activities', 'activity_scope_activities_invalid', 'at least one active activity is required');
    return;
  }
  const seenActivityIds = new Set();
  snapshot.activities.forEach((activity, index) => {
    if (!isRecord(activity)) {
      addError(errors, `activityScopeSnapshot.activities[${index}]`, 'activity_record_invalid', 'an activity record is required');
      return;
    }
    rejectUnsupportedFields(activity, ACTIVITY_FIELDS, `activityScopeSnapshot.activities[${index}]`, errors);
    requireString(errors, activity.activityId, `activityScopeSnapshot.activities[${index}].activityId`, 'activity_id_invalid');
    if (seenActivityIds.has(activity.activityId)) {
      addError(errors, `activityScopeSnapshot.activities[${index}].activityId`, 'activity_id_duplicate', 'activity identifiers must be unique');
    }
    seenActivityIds.add(activity.activityId);
    if (activity.lifecycleState !== 'active') addError(errors, `activityScopeSnapshot.activities[${index}].lifecycleState`, 'activity_not_active', 'only active activities may receive events');
    if (!['not_started', 'started', 'completed'].includes(activity.currentState)) {
      addError(errors, `activityScopeSnapshot.activities[${index}].currentState`, 'activity_state_invalid', 'activity state is invalid');
    }
    if (!Array.isArray(activity.allowedEventTypes) || activity.allowedEventTypes.length === 0 || activity.allowedEventTypes.some(type => !includes(ALLOWED_ACTIVITY_EVENT_TYPES, type))) {
      addError(errors, `activityScopeSnapshot.activities[${index}].allowedEventTypes`, 'activity_event_types_invalid', 'allowed activity event types are invalid');
    }
  });
}

function validateDataHandling(snapshot, errors) {
  if (!validateSnapshot(snapshot, DATA_HANDLING_FIELDS, 'dataHandlingSnapshot', errors)) return;
  ['policyId', 'purpose', 'classification', 'retentionClass', 'auditPolicyVersion'].forEach(field => {
    requireString(errors, snapshot[field], `dataHandlingSnapshot.${field}`, 'data_handling_field_invalid');
  });
  requireSha256(errors, snapshot.policySha256, 'dataHandlingSnapshot.policySha256', 'data_handling_hash_invalid');
  if (snapshot.purpose !== 'learning_progress_sync') {
    addError(errors, 'dataHandlingSnapshot.purpose', 'data_handling_purpose_invalid', 'the data policy purpose must be learning_progress_sync');
  }
}

function validateStreamState(snapshot, errors) {
  if (!validateSnapshot(snapshot, STREAM_STATE_FIELDS, 'streamStateSnapshot', errors)) return;
  ['snapshotId', 'scopeSha256'].forEach(field => {
    requireString(errors, snapshot[field], `streamStateSnapshot.${field}`, 'stream_state_field_invalid');
  });
  requireSha256(errors, snapshot.stateSha256, 'streamStateSnapshot.stateSha256', 'stream_state_hash_invalid');
  if (!Number.isSafeInteger(snapshot.lastAcceptedSequence) || snapshot.lastAcceptedSequence < 0) {
    addError(errors, 'streamStateSnapshot.lastAcceptedSequence', 'stream_cursor_invalid', 'a non-negative stream cursor is required');
  }
  if (snapshot.lastAcceptedSequence === 0 && snapshot.lastAcceptedEventSha256 !== null) {
    addError(errors, 'streamStateSnapshot.lastAcceptedEventSha256', 'stream_cursor_hash_invalid', 'the initial cursor must have no prior event hash');
  }
  if (snapshot.lastAcceptedSequence > 0) {
    requireSha256(errors, snapshot.lastAcceptedEventSha256, 'streamStateSnapshot.lastAcceptedEventSha256', 'stream_cursor_hash_invalid');
  }
  requirePositiveInteger(errors, snapshot.streamVersion, 'streamStateSnapshot.streamVersion', 'stream_version_invalid');
  requireTimestamp(errors, snapshot.capturedAt, 'streamStateSnapshot.capturedAt', 'stream_state_captured_at_invalid');
}

function validateReceipt(receipt, path, errors) {
  if (!isRecord(receipt)) {
    addError(errors, path, 'receipt_invalid', 'an immutable receipt record is required');
    return;
  }
  rejectUnsupportedFields(receipt, RECEIPT_FIELDS, path, errors);
  ['receiptId', 'scopeSha256', 'batchId', 'idempotencyKey', 'authorizationId', 'entitlementId', 'governanceSnapshotId', 'dataHandlingPolicyId'].forEach(field => {
    requireString(errors, receipt[field], `${path}.${field}`, 'receipt_field_invalid');
  });
  ['receiptSha256', 'batchSha256'].forEach(field => requireSha256(errors, receipt[field], `${path}.${field}`, 'receipt_hash_invalid'));
  ['firstEventSequence', 'lastEventSequence', 'streamVersionBefore'].forEach(field => requirePositiveInteger(errors, receipt[field], `${path}.${field}`, 'receipt_sequence_invalid'));
  if (receipt.lastEventSequence < receipt.firstEventSequence) {
    addError(errors, `${path}.lastEventSequence`, 'receipt_range_invalid', 'the receipt event range is invalid');
  }
  if (!Number.isSafeInteger(receipt.predecessorSequence) || receipt.predecessorSequence < 0) {
    addError(errors, `${path}.predecessorSequence`, 'receipt_predecessor_invalid', 'receipt predecessor sequence is invalid');
  }
  if (receipt.predecessorSequence === 0 && receipt.predecessorEventSha256 !== null) {
    addError(errors, `${path}.predecessorEventSha256`, 'receipt_predecessor_hash_invalid', 'initial receipt predecessor must have no event hash');
  }
  if (receipt.predecessorSequence > 0) requireSha256(errors, receipt.predecessorEventSha256, `${path}.predecessorEventSha256`, 'receipt_predecessor_hash_invalid');
  if (!Array.isArray(receipt.eventSha256es) || receipt.eventSha256es.length !== receipt.lastEventSequence - receipt.firstEventSequence + 1 || receipt.eventSha256es.some(value => !isSha256(value))) {
    addError(errors, `${path}.eventSha256es`, 'receipt_events_invalid', 'receipt event hashes must cover the full immutable event range');
  }
  if (
    Number.isSafeInteger(receipt.predecessorSequence) &&
    Number.isSafeInteger(receipt.firstEventSequence) &&
    receipt.firstEventSequence !== receipt.predecessorSequence + 1
  ) {
    addError(errors, `${path}.firstEventSequence`, 'receipt_predecessor_range_invalid', 'receipt range must begin immediately after its predecessor cursor');
  }
  requireTimestamp(errors, receipt.acceptedAt, `${path}.acceptedAt`, 'receipt_accepted_at_invalid');
  if (receipt.outcome !== 'accepted') addError(errors, `${path}.outcome`, 'receipt_outcome_invalid', 'only an accepted immutable receipt may prove a replay');
  if (isSha256(receipt.receiptSha256) && receipt.receiptSha256 !== calculateLearningSyncReceiptSha256(receipt)) {
    addError(errors, `${path}.receiptSha256`, 'receipt_hash_mismatch', 'receipt hash must bind its immutable fields');
  }
}

function validateReceiptLookup(lookup, errors) {
  if (!validateSnapshot(lookup, RECEIPT_LOOKUP_FIELDS, 'receiptLookup', errors)) return;
  if (!Object.hasOwn(lookup, 'byIdempotencyKey') || !Object.hasOwn(lookup, 'byBatchId') || !Object.hasOwn(lookup, 'eventReceipts')) {
    addError(errors, 'receiptLookup', 'receipt_lookup_fields_missing', 'all authoritative receipt lookup fields are required');
    return;
  }
  if (lookup.byIdempotencyKey !== null) validateReceipt(lookup.byIdempotencyKey, 'receiptLookup.byIdempotencyKey', errors);
  if (lookup.byBatchId !== null) validateReceipt(lookup.byBatchId, 'receiptLookup.byBatchId', errors);
  if (!Array.isArray(lookup.eventReceipts)) {
    addError(errors, 'receiptLookup.eventReceipts', 'event_receipts_invalid', 'event receipt lookup must be an array');
    return;
  }
  const eventIdsByScope = new Map();
  const eventSequencesByScope = new Map();
  lookup.eventReceipts.forEach((entry, index) => {
    if (!isRecord(entry)) {
      addError(errors, `receiptLookup.eventReceipts[${index}]`, 'event_receipt_invalid', 'an event receipt record is required');
      return;
    }
    rejectUnsupportedFields(entry, EVENT_RECEIPT_FIELDS, `receiptLookup.eventReceipts[${index}]`, errors);
    requireString(errors, entry.eventId, `receiptLookup.eventReceipts[${index}].eventId`, 'event_receipt_id_invalid');
    requirePositiveInteger(errors, entry.eventSequence, `receiptLookup.eventReceipts[${index}].eventSequence`, 'event_receipt_sequence_invalid');
    requireSha256(errors, entry.eventSha256, `receiptLookup.eventReceipts[${index}].eventSha256`, 'event_receipt_hash_invalid');
    requireString(errors, entry.receiptId, `receiptLookup.eventReceipts[${index}].receiptId`, 'event_receipt_receipt_invalid');
    requireString(errors, entry.scopeSha256, `receiptLookup.eventReceipts[${index}].scopeSha256`, 'event_receipt_scope_invalid');
    let eventIds = eventIdsByScope.get(entry.scopeSha256);
    if (!eventIds) {
      eventIds = new Set();
      eventIdsByScope.set(entry.scopeSha256, eventIds);
    }
    let eventSequences = eventSequencesByScope.get(entry.scopeSha256);
    if (!eventSequences) {
      eventSequences = new Set();
      eventSequencesByScope.set(entry.scopeSha256, eventSequences);
    }
    if (eventIds.has(entry.eventId) || eventSequences.has(entry.eventSequence)) {
      addError(errors, `receiptLookup.eventReceipts[${index}]`, 'event_receipt_duplicate', 'each scope may bind an event identifier and sequence to only one authoritative receipt row');
    }
    eventIds.add(entry.eventId);
    eventSequences.add(entry.eventSequence);
  });
}

function validateAccessRequest(request, errors) {
  if (!validateSnapshot(request, ACCESS_REQUEST_FIELDS, 'accessRequest', errors)) return;
  if (!isRecord(request.actor)) {
    addError(errors, 'accessRequest.actor', 'access_actor_invalid', 'a server-resolved access actor is required');
  } else {
    rejectUnsupportedFields(request.actor, ACCESS_ACTOR_FIELDS, 'accessRequest.actor', errors);
  }
  if (!isRecord(request.resource)) {
    addError(errors, 'accessRequest.resource', 'access_resource_invalid', 'a server-resolved access resource is required');
  } else {
    rejectUnsupportedFields(request.resource, ACCESS_RESOURCE_FIELDS, 'accessRequest.resource', errors);
  }
}

function timestampMs(value) {
  return isStrictUtcTimestamp(value) ? Date.parse(value) : null;
}

function validateSnapshotHash(snapshot, calculator, hashField, path, errors) {
  if (!isRecord(snapshot) || !isSha256(snapshot[hashField])) return;
  if (snapshot[hashField] !== calculator(snapshot)) {
    addError(errors, path, 'snapshot_hash_mismatch', 'the immutable snapshot hash must bind its declared fields');
  }
}

function valuesEqual(left, right) {
  return left === right;
}

function validateServerBindings(input, batch, validation, errors) {
  const context = input.resolverContext;
  if (!isRecord(context) || !validation.valid) return null;
  const targetSha256 = calculateLearningEventContentTargetSha256(batch.contentTarget);
  const scope = scopeFieldsFor(context, batch.eventStreamId, targetSha256);
  const scopeSha256 = calculateLearningSyncScopeSha256(scope);

  validateSnapshotHash(input.authorizationSnapshot, calculateLearningSyncAuthorizationSnapshotSha256, 'authorizationSha256', 'authorizationSnapshot.authorizationSha256', errors);
  validateSnapshotHash(input.entitlementSnapshot, calculateLearningSyncEntitlementSnapshotSha256, 'entitlementSha256', 'entitlementSnapshot.entitlementSha256', errors);
  validateSnapshotHash(input.governedTargetSnapshot, calculateLearningSyncGovernedTargetSnapshotSha256, 'snapshotSha256', 'governedTargetSnapshot.snapshotSha256', errors);
  validateSnapshotHash(input.activityScopeSnapshot, calculateLearningSyncActivityScopeSnapshotSha256, 'snapshotSha256', 'activityScopeSnapshot.snapshotSha256', errors);
  validateSnapshotHash(input.dataHandlingSnapshot, calculateLearningSyncDataHandlingSnapshotSha256, 'policySha256', 'dataHandlingSnapshot.policySha256', errors);
  validateSnapshotHash(input.streamStateSnapshot, calculateLearningSyncStreamStateSnapshotSha256, 'stateSha256', 'streamStateSnapshot.stateSha256', errors);

  const authorization = input.authorizationSnapshot;
  const entitlement = input.entitlementSnapshot;
  const governed = input.governedTargetSnapshot;
  const activities = input.activityScopeSnapshot;
  const dataHandling = input.dataHandlingSnapshot;
  const stream = input.streamStateSnapshot;
  if (isRecord(authorization) && !valuesEqual(authorization.scopeSha256, scopeSha256)) addError(errors, 'authorizationSnapshot.scopeSha256', 'authorization_scope_mismatch', 'authorization must bind the resolved stream scope');
  if (isRecord(entitlement) && !valuesEqual(entitlement.scopeSha256, scopeSha256)) addError(errors, 'entitlementSnapshot.scopeSha256', 'entitlement_scope_mismatch', 'entitlement must bind the resolved stream scope');
  if (isRecord(stream) && !valuesEqual(stream.scopeSha256, scopeSha256)) addError(errors, 'streamStateSnapshot.scopeSha256', 'stream_scope_mismatch', 'stream state must bind the resolved stream scope');
  if (isRecord(governed)) {
    if (governed.targetSha256 !== targetSha256 ||
      governed.publicationDecisionId !== batch.contentTarget.publicationDecisionId ||
      governed.curriculumRegistryEntryId !== batch.contentTarget.curriculumRegistryEntryId ||
      governed.programVersion !== batch.contentTarget.programVersion ||
      governed.outcomeCode !== batch.contentTarget.outcomeCode) {
      addError(errors, 'governedTargetSnapshot', 'governed_target_mismatch', 'the client target must match the server-published target snapshot exactly');
    }
  }
  if (isRecord(activities) && activities.targetSha256 !== targetSha256) addError(errors, 'activityScopeSnapshot.targetSha256', 'activity_scope_target_mismatch', 'activity scope must bind the exact published target');
  if (isRecord(activities) && activities.scopeSha256 !== scopeSha256) addError(errors, 'activityScopeSnapshot.scopeSha256', 'activity_scope_scope_mismatch', 'activity state must bind the resolved learner and stream scope');
  if (
    isRecord(activities) &&
    isRecord(stream) &&
    (
      activities.streamVersion !== stream.streamVersion ||
      activities.stateThroughSequence !== stream.lastAcceptedSequence ||
      activities.lastEventSha256 !== stream.lastAcceptedEventSha256
    )
  ) {
    addError(errors, 'activityScopeSnapshot', 'activity_scope_stream_state_mismatch', 'activity state must come from the same authoritative stream version and cursor as the append precondition');
  }
  if (isRecord(dataHandling) && dataHandling.purpose !== context.purpose) addError(errors, 'dataHandlingSnapshot.purpose', 'data_handling_context_mismatch', 'data handling policy must match resolver purpose');

  const observedAt = timestampMs(context.observedAt);
  if (observedAt !== null) {
    validateTimeRange(authorization, 'authorizationSnapshot', observedAt, errors);
    validateTimeRange(entitlement, 'entitlementSnapshot', observedAt, errors);
    if (timestampMs(governed?.capturedAt) !== null && timestampMs(governed.capturedAt) > observedAt) addError(errors, 'governedTargetSnapshot.capturedAt', 'governed_target_after_observation', 'target snapshot cannot be captured after observation');
    if (timestampMs(activities?.capturedAt) !== null && timestampMs(activities.capturedAt) > observedAt) addError(errors, 'activityScopeSnapshot.capturedAt', 'activity_scope_after_observation', 'activity snapshot cannot be captured after observation');
    if (timestampMs(stream?.capturedAt) !== null && timestampMs(stream.capturedAt) > observedAt) addError(errors, 'streamStateSnapshot.capturedAt', 'stream_state_after_observation', 'stream state cannot be captured after observation');
  }

  validateAccessRequestBinding(input.accessRequest, context, batch, errors);
  return { scopeSha256, targetSha256 };
}

function scopeFieldsFor(context, eventStreamId, targetSha256) {
  return {
    contractVersion: LEARNING_EVENT_SYNC_ELIGIBILITY_CONTRACT_VERSION,
    tenantId: context.tenantId,
    learnerPseudonym: context.actorPseudonym,
    purpose: context.purpose,
    eventStreamId,
    targetSha256
  };
}

function validateTimeRange(snapshot, path, observedAt, errors) {
  if (!isRecord(snapshot)) return;
  const issuedAt = timestampMs(snapshot.issuedAt);
  const expiresAt = timestampMs(snapshot.expiresAt);
  if (issuedAt !== null && issuedAt > observedAt) addError(errors, `${path}.issuedAt`, `${path === 'entitlementSnapshot' ? 'entitlement' : 'authorization'}_not_yet_valid`, 'the snapshot is not valid yet');
  if (expiresAt !== null && expiresAt < observedAt) addError(errors, `${path}.expiresAt`, `${path === 'entitlementSnapshot' ? 'entitlement' : 'authorization'}_expired`, 'the snapshot has expired');
  if (issuedAt !== null && expiresAt !== null && issuedAt > expiresAt) addError(errors, path, 'snapshot_time_range_invalid', 'issuedAt cannot be after expiresAt');
}

function validateClientEventTimeline(batch, observedAt, errors) {
  if (!Number.isFinite(observedAt)) return;
  let previousOccurredAt = null;
  batch.events.forEach((event, index) => {
    const occurredAt = timestampMs(event.clientOccurredAt);
    if (occurredAt === null) return;
    if (occurredAt > observedAt) {
      addError(errors, `clientBatch.events[${index}].clientOccurredAt`, 'client_event_after_observation', 'a client event cannot be later than the authoritative resolver observation');
    }
    if (previousOccurredAt !== null && occurredAt < previousOccurredAt) {
      addError(errors, `clientBatch.events[${index}].clientOccurredAt`, 'client_event_time_nonmonotonic', 'client event times cannot move backward as event sequence increases');
    }
    previousOccurredAt = occurredAt;
  });
}

function validateAccessRequestBinding(request, context, batch, errors) {
  if (!isRecord(request) || !isRecord(request.actor) || !isRecord(request.resource)) return;
  if (request.actor.tenantId !== context.tenantId || request.actor.subjectId !== context.actorPseudonym || request.actor.role !== context.actorRole ||
    request.resource.tenantId !== context.tenantId || request.resource.learnerId !== context.actorPseudonym || request.resource.packageId !== batch.contentTarget.packageId || request.resource.eventStreamId !== batch.eventStreamId ||
    request.resource.type !== 'learner_learning_event_stream' || request.action !== 'append_learning_event_batch') {
    addError(errors, 'accessRequest', 'access_request_scope_mismatch', 'access request must match the server-resolved append scope');
    return;
  }
  const decision = evaluateK12Access(request);
  if (!decision.allowed || decision.reason !== 'learner_learning_event_append') {
    addError(errors, 'accessRequest', 'access_denied', 'the narrow append access policy must allow this resolved request');
  }
}

function validateActivityTransitions(batch, snapshot, errors) {
  if (!isRecord(snapshot) || !Array.isArray(snapshot.activities)) return;
  const activityById = new Map(snapshot.activities.map(activity => [activity.activityId, { ...activity }]));
  batch.events.forEach((event, index) => {
    const activity = activityById.get(event.activityId);
    if (!activity || activity.lifecycleState !== 'active' || !Array.isArray(activity.allowedEventTypes) || !activity.allowedEventTypes.includes(event.eventType)) {
      addError(errors, `clientBatch.events[${index}]`, 'activity_not_permitted', 'the event is not permitted by the server-published activity scope');
      return;
    }
    if (event.eventType === 'activity_started') {
      if (activity.currentState !== 'not_started') addError(errors, `clientBatch.events[${index}]`, 'activity_transition_invalid', 'activity_started requires a not_started server state');
      activity.currentState = 'started';
    }
    if (event.eventType === 'hint_requested' && activity.currentState !== 'started') {
      addError(errors, `clientBatch.events[${index}]`, 'activity_transition_invalid', 'hint_requested requires a started server state');
    }
    if (event.eventType === 'activity_completed') {
      if (activity.currentState !== 'started') addError(errors, `clientBatch.events[${index}]`, 'activity_transition_invalid', 'activity_completed requires a started server state');
      activity.currentState = 'completed';
    }
  });
}

function receiptMatchesBatch(receipt, batch, validation, bindings, input, errors) {
  if (!isRecord(receipt)) return false;
  if (receipt.receiptSha256 !== calculateLearningSyncReceiptSha256(receipt)) {
    addError(errors, 'receiptLookup', 'receipt_hash_mismatch', 'receipt hash must bind its immutable fields');
    return false;
  }
  const events = batch.events;
  const exact = receipt.scopeSha256 === bindings.scopeSha256 &&
    receipt.batchId === batch.batchId &&
    receipt.idempotencyKey === batch.idempotencyKey &&
    receipt.batchSha256 === validation.integrity.batchSha256 &&
    receipt.firstEventSequence === events[0].eventSequence &&
    receipt.lastEventSequence === events[events.length - 1].eventSequence &&
    JSON.stringify(receipt.eventSha256es) === JSON.stringify(validation.integrity.eventSha256es) &&
    receipt.authorizationId === input.authorizationSnapshot.authorizationId &&
    receipt.entitlementId === input.entitlementSnapshot.entitlementId &&
    receipt.governanceSnapshotId === input.governedTargetSnapshot.snapshotId &&
    receipt.dataHandlingPolicyId === input.dataHandlingSnapshot.policyId;
  if (!exact) addError(errors, 'receiptLookup', 'receipt_batch_mismatch', 'the existing receipt does not prove this exact batch and resolved scope');
  return exact;
}

function eventReceiptsMatchBatch(receipts, batch, validation, receipt, bindings, errors) {
  if (!Array.isArray(receipts)) return false;
  for (let index = 0; index < batch.events.length; index += 1) {
    const event = batch.events[index];
    const match = receipts.find(entry =>
      entry.scopeSha256 === bindings.scopeSha256 &&
      entry.eventId === event.eventId &&
      entry.eventSequence === event.eventSequence
    );
    if (!match || match.eventSha256 !== validation.integrity.eventSha256es[index] || match.receiptId !== receipt.receiptId || match.scopeSha256 !== bindings.scopeSha256) {
      addError(errors, `receiptLookup.eventReceipts[${index}]`, 'event_receipt_mismatch', 'each replay event requires an exact authoritative receipt lookup');
    }
  }
}

function anyEventReceiptConflicts(receipts, batch, scopeSha256) {
  if (!Array.isArray(receipts)) return false;
  return receipts.some(receipt =>
    receipt.scopeSha256 === scopeSha256 &&
    batch.events.some(event => receipt.eventId === event.eventId || receipt.eventSequence === event.eventSequence)
  );
}

function blocked(errors) {
  return { eligible: false, nextState: 'blocked', errors };
}

/**
 * Decide whether a validated client batch can be appended or is an exact
 * idempotent replay. The caller must use the returned append intent in one
 * atomic, authorized ledger transaction; this pure function writes nothing.
 */
export function evaluateServerResolvedLearningSyncEligibility(input) {
  const errors = [];
  try {
    const resolvedInput = normalizeServerResolvedInput(input, errors);
    if (!resolvedInput) {
      if (errors.length === 0) addError(errors, 'input', 'input_invalid', 'a server-resolved input record is required');
      return blocked(errors);
    }
    input = resolvedInput;
    if (errors.length > 0) return blocked(errors);

    ROOT_FIELDS.forEach(field => {
      if (!objectHasOwn(input, field)) addError(errors, `input.${field}`, 'input_field_missing', 'all server-resolved fields are required');
    });
    validateResolverContext(input.resolverContext, errors);
    validateAuthorization(input.authorizationSnapshot, errors);
    validateEntitlement(input.entitlementSnapshot, errors);
    validateGovernedTarget(input.governedTargetSnapshot, errors);
    validateActivityScope(input.activityScopeSnapshot, errors);
    validateDataHandling(input.dataHandlingSnapshot, errors);
    validateStreamState(input.streamStateSnapshot, errors);
    validateReceiptLookup(input.receiptLookup, errors);
    validateAccessRequest(input.accessRequest, errors);

    const clientValidation = validatePseudonymousLearningSyncBatch(input.clientBatch);
    if (!clientValidation.valid) {
      addError(errors, 'clientBatch', 'client_batch_invalid', 'the only client-originated subtree must satisfy the closed batch contract');
    }
    if (errors.length > 0) return blocked(errors);

    const batch = clientValidation.normalizedBatch;
    const bindings = validateServerBindings(input, batch, clientValidation, errors);
    if (!bindings || errors.length > 0) return blocked(errors);
    validateClientEventTimeline(batch, timestampMs(input.resolverContext.observedAt), errors);
    if (errors.length > 0) return blocked(errors);

    const lookup = input.receiptLookup;
    const idempotencyReceipt = lookup.byIdempotencyKey;
    const batchReceipt = lookup.byBatchId;
    if ((idempotencyReceipt === null) !== (batchReceipt === null)) {
      addError(errors, 'receiptLookup', 'receipt_lookup_incomplete', 'idempotency and batch lookups must both be absent or identify the same receipt');
      return blocked(errors);
    }
    if (idempotencyReceipt !== null || batchReceipt !== null) {
      if (idempotencyReceipt.receiptId !== batchReceipt.receiptId || idempotencyReceipt.receiptSha256 !== batchReceipt.receiptSha256) {
        addError(errors, 'receiptLookup', 'receipt_lookup_conflict', 'idempotency and batch lookups must identify the same immutable receipt');
        return blocked(errors);
      }
      if (!receiptMatchesBatch(idempotencyReceipt, batch, clientValidation, bindings, input, errors)) return blocked(errors);
      if (
        input.streamStateSnapshot.lastAcceptedSequence < idempotencyReceipt.lastEventSequence ||
        (
          input.streamStateSnapshot.lastAcceptedSequence === idempotencyReceipt.lastEventSequence &&
          input.streamStateSnapshot.lastAcceptedEventSha256 !== idempotencyReceipt.eventSha256es[idempotencyReceipt.eventSha256es.length - 1]
        )
      ) {
        addError(errors, 'streamStateSnapshot', 'receipt_stream_state_mismatch', 'an idempotent replay receipt must already be reflected by the authoritative stream state');
      }
      if (idempotencyReceipt.streamVersionBefore >= input.streamStateSnapshot.streamVersion) {
        addError(errors, 'receiptLookup.byIdempotencyKey.streamVersionBefore', 'receipt_stream_version_mismatch', 'a replay receipt must predate the current authoritative stream version');
      }
      if (timestampMs(idempotencyReceipt.acceptedAt) !== null && timestampMs(idempotencyReceipt.acceptedAt) > timestampMs(input.resolverContext.observedAt)) {
        addError(errors, 'receiptLookup.byIdempotencyKey.acceptedAt', 'receipt_after_observation', 'a replay receipt cannot be accepted after the resolver observation time');
      }
      eventReceiptsMatchBatch(lookup.eventReceipts, batch, clientValidation, idempotencyReceipt, bindings, errors);
      if (errors.length > 0) return blocked(errors);
      return {
        eligible: false,
        nextState: 'idempotent_replay',
        errors: [],
        replayIntent: {
          invocationId: input.resolverContext.invocationId,
          receiptId: idempotencyReceipt.receiptId,
          receiptSha256: idempotencyReceipt.receiptSha256,
          scopeSha256: bindings.scopeSha256,
          batchSha256: clientValidation.integrity.batchSha256
        }
      };
    }

    const firstSequence = batch.events[0].eventSequence;
    const expectedSequence = input.streamStateSnapshot.lastAcceptedSequence + 1;
    if (firstSequence > expectedSequence) {
      addError(errors, 'clientBatch.events[0].eventSequence', 'sequence_gap', 'the batch begins after the authoritative stream cursor');
      return blocked(errors);
    }
    if (firstSequence < expectedSequence) {
      addError(errors, 'clientBatch.events[0].eventSequence', 'sequence_overlap', 'a non-replay batch overlaps the authoritative stream cursor');
      return blocked(errors);
    }
    if (anyEventReceiptConflicts(lookup.eventReceipts, batch, bindings.scopeSha256)) {
      addError(errors, 'receiptLookup.eventReceipts', 'event_receipt_conflict', 'a new append cannot reuse an existing event identifier or sequence');
      return blocked(errors);
    }

    validateActivityTransitions(batch, input.activityScopeSnapshot, errors);
    if (errors.length > 0) return blocked(errors);

    return {
      eligible: true,
      nextState: 'append_eligible',
      errors: [],
      appendIntent: {
        invocationId: input.resolverContext.invocationId,
        scopeSha256: bindings.scopeSha256,
        targetSha256: bindings.targetSha256,
        batchSha256: clientValidation.integrity.batchSha256,
        expectedStreamVersion: input.streamStateSnapshot.streamVersion,
        firstEventSequence: batch.events[0].eventSequence,
        lastEventSequence: batch.events[batch.events.length - 1].eventSequence,
        eventCount: batch.events.length,
        authorizationId: input.authorizationSnapshot.authorizationId,
        entitlementId: input.entitlementSnapshot.entitlementId,
        governanceSnapshotId: input.governedTargetSnapshot.snapshotId,
        dataHandlingPolicyId: input.dataHandlingSnapshot.policyId,
        activityScopeSnapshotId: input.activityScopeSnapshot.snapshotId,
        activityScopeSnapshotSha256: input.activityScopeSnapshot.snapshotSha256
      }
    };
  } catch {
    addError(errors, 'input', 'server_snapshot_unreadable', 'server-resolved input could not be safely read');
    return blocked(errors);
  }
}
