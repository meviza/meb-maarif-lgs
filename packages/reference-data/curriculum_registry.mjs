/**
 * Versioned curriculum-record contract and lookup helpers.
 *
 * These functions are deliberately pure. They do not fetch a source document,
 * certify an external authority, write a database record, or promote content.
 */

export const CURRICULUM_REGISTRY_CONTRACT_VERSION = '1.0.0';

const VERIFICATION_STATES = new Set([
  'unverified_import',
  'canonical_review_pending',
  'canonical_verified',
  'withdrawn'
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function isValidTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isHttpsUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function validateSourceDocument(sourceDocument, errors) {
  if (!isRecord(sourceDocument)) {
    addError(errors, 'sourceDocument', 'source_document_missing', 'a source document is required');
    return;
  }

  if (!isNonEmptyString(sourceDocument.sourceId)) {
    addError(errors, 'sourceDocument.sourceId', 'source_id_missing', 'a source identifier is required');
  }
  if (!isHttpsUrl(sourceDocument.sourceUrl)) {
    addError(errors, 'sourceDocument.sourceUrl', 'source_url_invalid', 'an HTTPS source URL is required');
  }
  if (!isValidTimestamp(sourceDocument.retrievedAt)) {
    addError(errors, 'sourceDocument.retrievedAt', 'source_retrieved_at_invalid', 'a valid source retrieval timestamp is required');
  }
  if (typeof sourceDocument.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(sourceDocument.sha256)) {
    addError(errors, 'sourceDocument.sha256', 'source_sha256_invalid', 'a SHA-256 source hash is required');
  }
}

function validateCanonicalReview(canonicalReview, errors) {
  if (!isRecord(canonicalReview)) {
    addError(errors, 'canonicalReview', 'canonical_review_missing', 'canonical verification requires human review evidence');
    return;
  }

  if (!isNonEmptyString(canonicalReview.reviewId)) {
    addError(errors, 'canonicalReview.reviewId', 'canonical_review_id_missing', 'a canonical review identifier is required');
  }
  if (!isNonEmptyString(canonicalReview.reviewerId)) {
    addError(errors, 'canonicalReview.reviewerId', 'canonical_reviewer_missing', 'a canonical reviewer identifier is required');
  }
  if (!isValidTimestamp(canonicalReview.reviewedAt)) {
    addError(errors, 'canonicalReview.reviewedAt', 'canonical_reviewed_at_invalid', 'a valid canonical review timestamp is required');
  }
}

/**
 * Validate a curriculum record without treating it as a source of truth.
 */
export function validateCurriculumRegistryEntry(entry) {
  const errors = [];
  if (!isRecord(entry)) {
    return {
      valid: false,
      errors: [{ path: 'entry', code: 'registry_entry_invalid', message: 'a curriculum registry entry object is required' }]
    };
  }

  if (entry.contractVersion !== CURRICULUM_REGISTRY_CONTRACT_VERSION) {
    addError(errors, 'contractVersion', 'contract_version_unsupported', `expected contract version ${CURRICULUM_REGISTRY_CONTRACT_VERSION}`);
  }
  if (!isNonEmptyString(entry.registryEntryId)) {
    addError(errors, 'registryEntryId', 'registry_entry_id_missing', 'a stable curriculum registry entry identifier is required');
  }
  if (!isNonEmptyString(entry.programVersion)) {
    addError(errors, 'programVersion', 'program_version_missing', 'a program version is required');
  }
  if (!Number.isInteger(entry.grade) || entry.grade < 1 || entry.grade > 8) {
    addError(errors, 'grade', 'grade_invalid', 'a grade from 1 through 8 is required');
  }
  if (!isNonEmptyString(entry.courseKey)) {
    addError(errors, 'courseKey', 'course_key_missing', 'a course key is required');
  }
  if (!isNonEmptyString(entry.outcomeCode)) {
    addError(errors, 'outcomeCode', 'outcome_code_missing', 'an outcome code is required');
  }
  if (!VERIFICATION_STATES.has(entry.verificationState)) {
    addError(errors, 'verificationState', 'verification_state_invalid', 'a supported verification state is required');
  }

  validateSourceDocument(entry.sourceDocument, errors);
  if (entry.verificationState === 'canonical_verified') {
    validateCanonicalReview(entry.canonicalReview, errors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Return a matching verified record, or null. Imports and records under human
 * review never become canonical merely because their fields happen to match.
 */
export function findCanonicalCurriculumOutcome(entries, selector) {
  if (!Array.isArray(entries) || !isRecord(selector)) {
    return null;
  }

  const found = entries.find(entry => {
    const validation = validateCurriculumRegistryEntry(entry);
    return validation.valid &&
      entry.verificationState === 'canonical_verified' &&
      entry.registryEntryId === selector.registryEntryId &&
      entry.programVersion === selector.programVersion &&
      entry.grade === selector.grade &&
      entry.courseKey === selector.courseKey &&
      entry.outcomeCode === selector.outcomeCode;
  });

  return found ? structuredClone(found) : null;
}
