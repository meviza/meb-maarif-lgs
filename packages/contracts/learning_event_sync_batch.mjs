/**
 * Closed, privacy-minimized client-offline learning-event batch contract.
 *
 * The client body carries no direct identity, tenant, device identifier,
 * score, answer, or client-declared governance state. Its persistent stream,
 * batch, event, time, and activity data remain pseudonymous learning data and
 * require server-side purpose, retention, access, and audit controls.
 *
 * This module only validates a client payload and derives deterministic
 * integrity values. It does not authenticate, authorize a write, resolve a
 * learner, persist a receipt, deduplicate retries, or transmit anything.
 */

import { createHash } from 'node:crypto';

export const LEARNING_EVENT_SYNC_BATCH_CONTRACT_VERSION = '1.0.0';

const MAX_EVENTS_PER_BATCH = 100;
const arrayIsArray = Array.isArray;
const objectDefineProperty = Object.defineProperty;
const objectFreeze = Object.freeze;
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const objectGetOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
const objectGetPrototypeOf = Object.getPrototypeOf;
const objectHasOwn = Object.hasOwn;
const reflectOwnKeys = Reflect.ownKeys;
const regExpConstructor = RegExp;
const regExpTest = Function.call.bind(RegExp.prototype.test);

const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const OPAQUE_REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/u;

const ALLOWED_EVENT_TYPES = [
  'activity_started',
  'activity_completed',
  'hint_requested'
];

const ROOT_FIELDS = [
  'contractVersion',
  'batchId',
  'idempotencyKey',
  'eventStreamId',
  'contentTarget',
  'events'
];
const CONTENT_TARGET_FIELDS = [
  'packageId',
  'contentItemId',
  'revisionId',
  'revisionSha256',
  'assetSetSha256',
  'publicationDecisionId',
  'curriculumRegistryEntryId',
  'programVersion',
  'outcomeCode'
];
const EVENT_FIELDS = [
  'eventId',
  'eventSequence',
  'activityId',
  'eventType',
  'clientOccurredAt'
];

function appendOwnArrayValue(array, value) {
  objectDefineProperty(array, String(array.length), {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function listIncludes(list, value) {
  for (let index = 0; index < list.length; index += 1) {
    if (list[index] === value) return true;
  }
  return false;
}

function createValidationResult(valid, errors, integrity, normalizedBatch) {
  const result = Object.create(null);
  result.valid = valid;
  result.errors = errors;
  if (integrity !== undefined) result.integrity = integrity;
  if (normalizedBatch !== undefined) result.normalizedBatch = normalizedBatch;
  return result;
}

function createIntegrity(eventSha256es, batchSha256) {
  const integrity = Object.create(null);
  integrity.eventSha256es = objectFreeze(eventSha256es);
  integrity.batchSha256 = batchSha256;
  return objectFreeze(integrity);
}

function freezeNormalizedBatch(batch) {
  objectFreeze(batch.contentTarget);
  for (let index = 0; index < batch.events.length; index += 1) {
    objectFreeze(batch.events[index]);
  }
  objectFreeze(batch.events);
  return objectFreeze(batch);
}

function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || arrayIsArray(value)) return false;
  const prototype = objectGetPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && regExpTest(SHA256_PATTERN, value);
}

function isOpaqueReference(value) {
  return typeof value === 'string' && regExpTest(OPAQUE_REFERENCE_PATTERN, value);
}

function isOpaquePrefixedId(value, prefix, minimumSuffixLength) {
  return typeof value === 'string' && regExpTest(
    new regExpConstructor(`^${prefix}[A-Za-z0-9_-]{${minimumSuffixLength},124}$`),
    value
  );
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isStrictUtcTimestamp(value) {
  if (typeof value !== 'string' || !regExpTest(UTC_TIMESTAMP_PATTERN, value)) {
    return false;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  const canonical = new Date(parsed).toISOString();
  return value === canonical || value === canonical.replace('.000Z', 'Z');
}

function addError(errors, path, code, message) {
  const error = Object.create(null);
  error.path = path;
  error.code = code;
  error.message = message;
  appendOwnArrayValue(errors, error);
}

function snapshotClosedRecord(value, allowedFields, path, errors) {
  if (!isPlainRecord(value)) {
    addError(errors, path, 'record_invalid', 'a plain object is required');
    return null;
  }

  const snapshot = Object.create(null);
  const fields = reflectOwnKeys(value);
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field !== 'string') {
      addError(errors, path, 'symbol_field_not_allowed', 'the client sync schema permits string field names only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!listIncludes(allowedFields, field)) {
      addError(errors, path || 'batch', 'unexpected_field', 'the client sync schema is closed');
      continue;
    }
    const fieldPath = path ? `${path}.${field}` : field;
    if (!descriptor.enumerable) {
      addError(errors, fieldPath, 'non_enumerable_field_not_allowed', 'the client sync schema permits enumerable fields only');
      continue;
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, fieldPath, 'accessor_field_not_allowed', 'the client sync schema permits data fields only');
      continue;
    }
    snapshot[field] = descriptor.value;
  }
  return snapshot;
}

function snapshotDenseArray(value, path, errors, maximumLength = Number.MAX_SAFE_INTEGER) {
  if (!arrayIsArray(value)) {
    addError(errors, path, 'array_invalid', 'an array is required');
    return null;
  }

  const descriptors = objectGetOwnPropertyDescriptors(value);
  const length = descriptors.length?.value;
  if (!Number.isSafeInteger(length) || length < 0) {
    addError(errors, path, 'array_length_invalid', 'an array with a safe non-negative length is required');
    return null;
  }
  if (length > maximumLength) {
    addError(errors, path, 'array_length_exceeds_limit', `the client sync array cannot exceed ${maximumLength} entries`);
    return null;
  }

  const descriptorFields = reflectOwnKeys(descriptors);
  for (let index = 0; index < descriptorFields.length; index += 1) {
    const field = descriptorFields[index];
    if (field === 'length') continue;
    if (typeof field !== 'string' || !regExpTest(ARRAY_INDEX_PATTERN, field) || Number(field) >= length) {
      addError(errors, path, 'unexpected_array_field', 'the client sync array may contain indexed elements only');
      continue;
    }
    const descriptor = descriptors[field];
    if (!descriptor.enumerable) {
      addError(errors, `${path}[${field}]`, 'non_enumerable_field_not_allowed', 'the client sync array permits enumerable elements only');
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, `${path}[${field}]`, 'accessor_field_not_allowed', 'the client sync array permits data elements only');
    }
  }

  const snapshot = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = descriptors[String(index)];
    if (!descriptor) {
      addError(errors, `${path}[${index}]`, 'array_hole_not_allowed', 'the client sync array must be dense');
      continue;
    }
    if (!descriptor.enumerable || !objectHasOwn(descriptor, 'value')) continue;
    appendOwnArrayValue(snapshot, descriptor.value);
  }
  return snapshot;
}

function describeFirstHashSnapshotError(errors, label) {
  const error = errors[0];
  if (error?.code === 'unexpected_field') {
    return `canonical ${label} contains an unexpected field`;
  }
  return `canonical ${label} requires own enumerable data fields`;
}

function snapshotClosedHashRecord(value, allowedFields, label) {
  const errors = [];
  const snapshot = snapshotClosedRecord(value, allowedFields, '', errors);
  if (!snapshot || errors.length > 0) throw new TypeError(describeFirstHashSnapshotError(errors, label));
  return snapshot;
}

function snapshotDenseHashArray(value, label, maximumLength) {
  const errors = [];
  const snapshot = snapshotDenseArray(value, label, errors, maximumLength);
  if (!snapshot || errors.length > 0) throw new TypeError(describeFirstHashSnapshotError(errors, label));
  return snapshot;
}

function requireHashField(snapshot, field, label) {
  if (!objectHasOwn(snapshot, field)) {
    throw new TypeError(`canonical ${label} requires an own field: ${field}`);
  }
  return snapshot[field];
}

function canonicalJson(value, seen = new WeakSet()) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('canonical JSON requires finite numbers');
    return JSON.stringify(value);
  }
  if (arrayIsArray(value)) {
    if (seen.has(value)) throw new TypeError('canonical JSON does not support cyclic arrays');
    seen.add(value);
    let serialized = '[';
    for (let index = 0; index < value.length; index += 1) {
      if (index > 0) serialized += ',';
      serialized += canonicalJson(value[index], seen);
    }
    serialized += ']';
    seen.delete(value);
    return serialized;
  }
  if (!isPlainRecord(value)) throw new TypeError('canonical JSON requires plain records');
  if (seen.has(value)) throw new TypeError('canonical JSON does not support cyclic records');
  seen.add(value);
  const keys = [];
  const ownKeys = reflectOwnKeys(value);
  for (let index = 0; index < ownKeys.length; index += 1) {
    const key = ownKeys[index];
    if (typeof key !== 'string') throw new TypeError('canonical JSON requires string record fields');
    const descriptor = objectGetOwnPropertyDescriptor(value, key);
    if (!descriptor.enumerable || !objectHasOwn(descriptor, 'value')) {
      throw new TypeError('canonical JSON requires own enumerable data fields');
    }
    appendOwnArrayValue(keys, key);
  }
  for (let index = 1; index < keys.length; index += 1) {
    const key = keys[index];
    let position = index;
    while (position > 0 && key < keys[position - 1]) {
      keys[position] = keys[position - 1];
      position -= 1;
    }
    keys[position] = key;
  }
  let serialized = '{';
  for (let index = 0; index < keys.length; index += 1) {
    if (index > 0) serialized += ',';
    const key = keys[index];
    serialized += `${JSON.stringify(key)}:${canonicalJson(value[key], seen)}`;
  }
  serialized += '}';
  seen.delete(value);
  return serialized;
}

function sha256Canonical(value) {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

function eventHashProjection(event) {
  const source = snapshotClosedHashRecord(event, EVENT_FIELDS, 'event');
  return {
    eventId: requireHashField(source, 'eventId', 'event'),
    eventSequence: requireHashField(source, 'eventSequence', 'event'),
    activityId: requireHashField(source, 'activityId', 'event'),
    eventType: requireHashField(source, 'eventType', 'event'),
    clientOccurredAt: requireHashField(source, 'clientOccurredAt', 'event')
  };
}

function contentTargetHashProjection(target) {
  const source = snapshotClosedHashRecord(target, CONTENT_TARGET_FIELDS, 'content target');
  return {
    packageId: requireHashField(source, 'packageId', 'content target'),
    contentItemId: requireHashField(source, 'contentItemId', 'content target'),
    revisionId: requireHashField(source, 'revisionId', 'content target'),
    revisionSha256: requireHashField(source, 'revisionSha256', 'content target'),
    assetSetSha256: requireHashField(source, 'assetSetSha256', 'content target'),
    publicationDecisionId: requireHashField(source, 'publicationDecisionId', 'content target'),
    curriculumRegistryEntryId: requireHashField(source, 'curriculumRegistryEntryId', 'content target'),
    programVersion: requireHashField(source, 'programVersion', 'content target'),
    outcomeCode: requireHashField(source, 'outcomeCode', 'content target')
  };
}

/**
 * Hash the closed, revision-bound content target used by a validated batch.
 * This is an integrity comparison value only; it does not establish that a
 * target exists, is published, assigned, or authorized for a learner.
 */
export function calculateLearningEventContentTargetSha256(target) {
  return sha256Canonical(contentTargetHashProjection(target));
}

function batchHashProjection(batch) {
  const source = snapshotClosedHashRecord(batch, ROOT_FIELDS, 'batch');
  const events = snapshotDenseHashArray(
    requireHashField(source, 'events', 'batch'),
    'batch events',
    MAX_EVENTS_PER_BATCH
  );
  const eventProjections = [];
  for (let index = 0; index < events.length; index += 1) {
    appendOwnArrayValue(eventProjections, eventHashProjection(events[index]));
  }
  return {
    contractVersion: requireHashField(source, 'contractVersion', 'batch'),
    batchId: requireHashField(source, 'batchId', 'batch'),
    idempotencyKey: requireHashField(source, 'idempotencyKey', 'batch'),
    eventStreamId: requireHashField(source, 'eventStreamId', 'batch'),
    contentTarget: contentTargetHashProjection(requireHashField(source, 'contentTarget', 'batch')),
    events: eventProjections
  };
}

/**
 * Hash one closed-shape event projection. This helper intentionally does not
 * validate event semantics; call it only after a successful batch validation.
 * The hash is an integrity comparison value, not proof of a learner's
 * identity, a signature, authorization, or an acceptance receipt.
 */
export function calculateLearningEventSha256(event) {
  return sha256Canonical(eventHashProjection(event));
}

/**
 * Hash the complete closed-shape client batch after successful validation.
 * Event order is intentionally part of the batch identity, so reordering
 * changes this result. This helper does not independently authorize or
 * semantically validate the batch.
 */
export function calculateLearningEventBatchSha256(batch) {
  return sha256Canonical(batchHashProjection(batch));
}

function validateContentTarget(value, errors) {
  const target = snapshotClosedRecord(value, CONTENT_TARGET_FIELDS, 'contentTarget', errors);
  if (!target) return null;

  const referenceFields = [
    'packageId',
    'contentItemId',
    'revisionId',
    'publicationDecisionId',
    'curriculumRegistryEntryId',
    'programVersion',
    'outcomeCode'
  ];
  for (let index = 0; index < referenceFields.length; index += 1) {
    const field = referenceFields[index];
    if (!isNonEmptyString(target[field])) {
      addError(errors, `contentTarget.${field}`, 'content_target_field_missing', `a ${field} is required`);
    } else if (!isOpaqueReference(target[field])) {
      addError(errors, `contentTarget.${field}`, 'content_target_reference_invalid', `a bounded opaque ${field} is required`);
    }
  }
  const sha256Fields = ['revisionSha256', 'assetSetSha256'];
  for (let index = 0; index < sha256Fields.length; index += 1) {
    const field = sha256Fields[index];
    if (!isSha256(target[field])) {
      addError(errors, `contentTarget.${field}`, 'content_target_sha256_invalid', `a ${field} SHA-256 is required`);
    }
  }
  return target;
}

function validateEvent(value, index, errors) {
  const path = `events[${index}]`;
  const event = snapshotClosedRecord(value, EVENT_FIELDS, path, errors);
  if (!event) return null;
  if (!isOpaquePrefixedId(event.eventId, 'evt_', 12)) {
    addError(errors, `${path}.eventId`, 'event_id_invalid', 'a random event identifier is required');
  }
  if (!isPositiveSafeInteger(event.eventSequence)) {
    addError(errors, `${path}.eventSequence`, 'event_sequence_invalid', 'an event sequence must be a positive safe integer');
  }
  if (!isOpaquePrefixedId(event.activityId, 'activity_', 3)) {
    addError(errors, `${path}.activityId`, 'activity_id_invalid', 'an opaque activity identifier is required');
  }
  if (!listIncludes(ALLOWED_EVENT_TYPES, event.eventType)) {
    addError(errors, `${path}.eventType`, 'event_type_invalid', 'the batch event type is not supported');
  }
  if (!isStrictUtcTimestamp(event.clientOccurredAt)) {
    addError(errors, `${path}.clientOccurredAt`, 'client_occurred_at_invalid', 'an exact UTC client event timestamp is required');
  }
  return event;
}

function validateEvents(value, errors) {
  const inputEvents = snapshotDenseArray(value, 'events', errors, MAX_EVENTS_PER_BATCH);
  if (!inputEvents) return null;
  if (inputEvents.length === 0 || inputEvents.length > MAX_EVENTS_PER_BATCH) {
    addError(errors, 'events', 'events_invalid', `a batch must contain from 1 through ${MAX_EVENTS_PER_BATCH} events`);
    return null;
  }

  const eventIds = Object.create(null);
  const eventSequences = Object.create(null);
  let priorSequence = null;
  const events = [];
  for (let index = 0; index < inputEvents.length; index += 1) {
    appendOwnArrayValue(events, validateEvent(inputEvents[index], index, errors));
  }
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (!event) continue;
    if (isNonEmptyString(event.eventId)) {
      if (objectHasOwn(eventIds, event.eventId)) {
        addError(errors, `events[${index}].eventId`, 'event_id_duplicate', 'each event identifier must be unique within a batch');
      }
      eventIds[event.eventId] = true;
    }
    if (isPositiveSafeInteger(event.eventSequence)) {
      if (objectHasOwn(eventSequences, String(event.eventSequence))) {
        addError(errors, `events[${index}].eventSequence`, 'event_sequence_duplicate', 'each event sequence must be unique within a batch');
      }
      if (priorSequence !== null && event.eventSequence !== priorSequence + 1) {
        addError(errors, `events[${index}].eventSequence`, 'event_sequence_not_contiguous', 'event sequences must be increasing and contiguous within a batch');
      }
      eventSequences[event.eventSequence] = true;
      priorSequence = event.eventSequence;
    }
  }
  return events;
}

/**
 * Validate a client-originated pseudonymous event batch. A successful result
 * is not an accepted sync, write authorization, replay decision, or
 * persistence receipt. A future server-resolved handoff must supply the
 * learner, tenant, authoritative clock, policy, entitlement, and ledger state.
 */
function validatePseudonymousLearningSyncBatchInternal(batch) {
  const errors = [];
  const snapshot = snapshotClosedRecord(batch, ROOT_FIELDS, '', errors);
  if (!snapshot) return createValidationResult(false, errors);

  if (snapshot.contractVersion !== LEARNING_EVENT_SYNC_BATCH_CONTRACT_VERSION) {
    addError(errors, 'contractVersion', 'contract_version_unsupported', `expected contract version ${LEARNING_EVENT_SYNC_BATCH_CONTRACT_VERSION}`);
  }
  if (!isOpaquePrefixedId(snapshot.batchId, 'batch_', 12)) {
    addError(errors, 'batchId', 'batch_id_invalid', 'a random batch identifier is required');
  }
  if (!isOpaquePrefixedId(snapshot.idempotencyKey, 'idem_', 12)) {
    addError(errors, 'idempotencyKey', 'idempotency_key_invalid', 'a random idempotency key is required');
  }
  if (!isOpaquePrefixedId(snapshot.eventStreamId, 'stream_', 12)) {
    addError(errors, 'eventStreamId', 'event_stream_id_invalid', 'a random event stream identifier is required');
  }

  const contentTarget = validateContentTarget(snapshot.contentTarget, errors);
  const events = validateEvents(snapshot.events, errors);
  if (errors.length > 0) return createValidationResult(false, errors);

  const normalizedBatch = {
    contractVersion: snapshot.contractVersion,
    batchId: snapshot.batchId,
    idempotencyKey: snapshot.idempotencyKey,
    eventStreamId: snapshot.eventStreamId,
    contentTarget,
    events
  };
  freezeNormalizedBatch(normalizedBatch);

  try {
    const eventSha256es = [];
    for (let index = 0; index < events.length; index += 1) {
      appendOwnArrayValue(eventSha256es, calculateLearningEventSha256(events[index]));
    }
    return createValidationResult(
      true,
      [],
      createIntegrity(eventSha256es, calculateLearningEventBatchSha256(normalizedBatch)),
      normalizedBatch
    );
  } catch {
    const hashErrors = [];
    addError(hashErrors, 'batch', 'canonical_hash_unavailable', 'canonical integrity values could not be calculated');
    return createValidationResult(false, hashErrors);
  }
}

/**
 * Validate a client-originated pseudonymous event batch without permitting
 * exotic JavaScript objects to escape as exceptions from the public boundary.
 */
export function validatePseudonymousLearningSyncBatch(batch) {
  try {
    return validatePseudonymousLearningSyncBatchInternal(batch);
  } catch {
    const errors = [];
    addError(errors, 'batch', 'untrusted_input_unreadable', 'the client sync input could not be read safely');
    return createValidationResult(false, errors);
  }
}
