/**
 * Pseudonymous mobile learning-event contract.
 *
 * The validator is intentionally stateless: it does not identify a learner,
 * persist an event, or transmit data. It prevents obvious direct-identity and
 * free-response fields from crossing the mobile synchronization boundary.
 */

export const LEARNING_EVENT_CONTRACT_VERSION = '1.0.0';

const FORBIDDEN_LEARNING_EVENT_FIELDS = new Set([
  'email',
  'fullName',
  'guardianEmail',
  'nationalId',
  'phone',
  'rawAnswerText'
]);

const ALLOWED_EVENT_TYPES = new Set([
  'activity_started',
  'activity_completed',
  'hint_requested',
  'assessment_submitted'
]);

const ALLOWED_SYNC_MODES = new Set(['offline_pending', 'synced']);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function requireString(errors, value, path, code, message) {
  if (!isNonEmptyString(value)) {
    addError(errors, path, code, message);
  }
}

function collectForbiddenFields(value, path, errors, visited = new WeakSet()) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (visited.has(value)) {
    return;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectForbiddenFields(item, `${path}[${index}]`, errors, visited);
    });
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = path ? `${path}.${key}` : key;
    if (FORBIDDEN_LEARNING_EVENT_FIELDS.has(key)) {
      addError(
        errors,
        nestedPath,
        'forbidden_learning_event_field',
        `${key} cannot be included in a pseudonymous learning event`
      );
    }
    collectForbiddenFields(nestedValue, nestedPath, errors, visited);
  }
}

function validateDeviceSync(deviceSync, errors) {
  if (!isRecord(deviceSync)) {
    addError(errors, 'deviceSync', 'device_sync_missing', 'Device synchronization metadata is required');
    return;
  }

  if (!Number.isInteger(deviceSync.eventSequence) || deviceSync.eventSequence < 1) {
    addError(errors, 'deviceSync.eventSequence', 'device_event_sequence_invalid', 'A positive event sequence is required');
  }
  if (!ALLOWED_SYNC_MODES.has(deviceSync.mode)) {
    addError(errors, 'deviceSync.mode', 'device_sync_mode_invalid', 'The device sync mode is invalid');
  }
}

function validateGovernance(governance, errors) {
  if (!isRecord(governance)) {
    addError(errors, 'dataGovernance', 'governance_missing', 'Data governance metadata is required');
    return;
  }

  requireString(errors, governance.owner, 'dataGovernance.owner', 'owner_missing', 'A data owner is required');
  requireString(errors, governance.steward, 'dataGovernance.steward', 'steward_missing', 'A data steward is required');
  requireString(errors, governance.classification, 'dataGovernance.classification', 'classification_missing', 'A classification is required');
  requireString(errors, governance.processingPurpose, 'dataGovernance.processingPurpose', 'processing_purpose_missing', 'A processing purpose is required');
  requireString(errors, governance.retentionClass, 'dataGovernance.retentionClass', 'retention_class_missing', 'A retention class is required');
}

/**
 * Validate a client-originated learning event without writing it anywhere.
 */
export function validatePseudonymousLearningEvent(event) {
  const errors = [];

  if (!isRecord(event)) {
    return {
      valid: false,
      errors: [{ path: 'event', code: 'learning_event_invalid', message: 'A learning event object is required' }]
    };
  }

  collectForbiddenFields(event, '', errors);

  if (event.contractVersion !== LEARNING_EVENT_CONTRACT_VERSION) {
    addError(errors, 'contractVersion', 'contract_version_unsupported', `Expected contract version ${LEARNING_EVENT_CONTRACT_VERSION}`);
  }
  requireString(errors, event.eventId, 'eventId', 'event_id_missing', 'An event identifier is required');

  if (typeof event.learnerPseudonym !== 'string' || !/^learner_[a-z0-9_-]{12,}$/i.test(event.learnerPseudonym)) {
    addError(errors, 'learnerPseudonym', 'learner_pseudonym_invalid', 'A non-identifying learner pseudonym is required');
  }

  requireString(errors, event.contentPackageId, 'contentPackageId', 'content_package_id_missing', 'A content package identifier is required');
  requireString(errors, event.contentRevisionId, 'contentRevisionId', 'content_revision_id_missing', 'A content revision identifier is required');

  if (!ALLOWED_EVENT_TYPES.has(event.eventType)) {
    addError(errors, 'eventType', 'event_type_invalid', 'The learning event type is invalid');
  }
  if (typeof event.occurredAt !== 'string' || Number.isNaN(Date.parse(event.occurredAt))) {
    addError(errors, 'occurredAt', 'occurred_at_invalid', 'A valid event timestamp is required');
  }

  validateDeviceSync(event.deviceSync, errors);
  validateGovernance(event.dataGovernance, errors);

  return { valid: errors.length === 0, errors };
}
