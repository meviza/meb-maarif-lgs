/**
 * Immutable-shaped evidence contract for an independent human publication
 * decision. This is deliberately not a publishing operation or an audit
 * ledger: it neither authenticates the publisher nor writes a decision.
 */

export const CONTENT_PUBLICATION_DECISION_CONTRACT_VERSION = '2.0.0';

const REQUIRED_DISCIPLINES = ['academic', 'assessment', 'rights', 'accessibility'];
const PUBLICATION_OUTCOMES = new Set(['published', 'withdrawn']);
const FORBIDDEN_PUBLICATION_FIELDS = new Set([
  'answerKey',
  'correctAnswer',
  'correctOption',
  'correct_option',
  'detailedSolution',
  'rawHtml'
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/iu.test(value);
}

function isValidTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value)) {
    return false;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  const canonical = new Date(parsed).toISOString();
  return value === canonical || value === canonical.replace('.000Z', 'Z');
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
  if (!value || typeof value !== 'object') return;
  if (visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenFields(item, `${path}[${index}]`, errors, visited));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = path ? `${path}.${key}` : key;
    if (FORBIDDEN_PUBLICATION_FIELDS.has(key)) {
      addError(
        errors,
        nestedPath,
        'forbidden_publication_field',
        `${key} cannot be included in a content publication decision`
      );
    }
    collectForbiddenFields(nestedValue, nestedPath, errors, visited);
  }
}

function validateTargetRevision(targetRevision, errors) {
  if (!isRecord(targetRevision)) {
    addError(errors, 'targetRevision', 'target_revision_missing', 'a target revision is required');
    return;
  }

  requireString(errors, targetRevision.contentItemId, 'targetRevision.contentItemId', 'content_item_id_missing', 'a content item identifier is required');
  requireString(errors, targetRevision.revisionId, 'targetRevision.revisionId', 'revision_id_missing', 'a revision identifier is required');
  if (!isSha256(targetRevision.sha256)) {
    addError(errors, 'targetRevision.sha256', 'revision_sha256_invalid', 'a SHA-256 revision hash is required');
  }
}

function validateReviewDecisionIds(reviewDecisionIds, errors) {
  if (!isRecord(reviewDecisionIds)) {
    addError(errors, 'reviewDecisionIds', 'review_decision_ids_missing', 'all required review decision identifiers are required');
    return;
  }

  const values = [];
  for (const discipline of REQUIRED_DISCIPLINES) {
    const value = reviewDecisionIds[discipline];
    requireString(
      errors,
      value,
      `reviewDecisionIds.${discipline}`,
      'review_decision_id_missing',
      `an ${discipline} review decision identifier is required`
    );
    if (isNonEmptyString(value)) values.push(value);
  }

  if (new Set(values).size !== values.length) {
    addError(
      errors,
      'reviewDecisionIds',
      'review_decision_ids_not_distinct',
      'each required discipline must reference a distinct review decision'
    );
  }
}

function validateGovernance(governance, errors) {
  if (!isRecord(governance)) {
    addError(errors, 'dataGovernance', 'governance_missing', 'data governance metadata is required');
    return;
  }

  requireString(errors, governance.owner, 'dataGovernance.owner', 'owner_missing', 'a data owner is required');
  requireString(errors, governance.steward, 'dataGovernance.steward', 'steward_missing', 'a data steward is required');
  requireString(errors, governance.classification, 'dataGovernance.classification', 'classification_missing', 'a classification is required');
  requireString(errors, governance.processingPurpose, 'dataGovernance.processingPurpose', 'processing_purpose_missing', 'a processing purpose is required');
  requireString(errors, governance.retentionClass, 'dataGovernance.retentionClass', 'retention_class_missing', 'a retention class is required');
}

/**
 * Validate one append-only-shaped human publication decision without saving,
 * authenticating, or publishing it. An eligibility gate later verifies the
 * decision against the actual review records and revision.
 */
export function validateContentPublicationDecision(decision) {
  const errors = [];
  if (!isRecord(decision)) {
    return {
      valid: false,
      errors: [{ path: 'decision', code: 'publication_decision_invalid', message: 'a content publication decision object is required' }]
    };
  }

  collectForbiddenFields(decision, '', errors);

  if (decision.contractVersion !== CONTENT_PUBLICATION_DECISION_CONTRACT_VERSION) {
    addError(errors, 'contractVersion', 'contract_version_unsupported', `expected contract version ${CONTENT_PUBLICATION_DECISION_CONTRACT_VERSION}`);
  }
  requireString(errors, decision.decisionId, 'decisionId', 'decision_id_missing', 'a publication decision identifier is required');
  validateTargetRevision(decision.targetRevision, errors);
  requireString(errors, decision.contentAuthorId, 'contentAuthorId', 'content_author_missing', 'a content author identifier is required');
  requireString(errors, decision.publicationPolicyVersion, 'publicationPolicyVersion', 'publication_policy_version_missing', 'a publication policy version is required');
  requireString(errors, decision.rationale, 'rationale', 'rationale_missing', 'a publication rationale is required');
  requireString(errors, decision.releaseRequestId, 'releaseRequestId', 'release_request_id_missing', 'a release request identifier is required');
  requireString(errors, decision.rollbackPlanId, 'rollbackPlanId', 'rollback_plan_missing', 'a rollback plan identifier is required');
  if (!Number.isInteger(decision.decisionSequence) || decision.decisionSequence < 1) {
    addError(errors, 'decisionSequence', 'publication_sequence_invalid', 'a positive publication decision sequence is required');
  }

  if (!PUBLICATION_OUTCOMES.has(decision.outcome)) {
    addError(errors, 'outcome', 'publication_outcome_invalid', 'a supported publication outcome is required');
  }
  if (!isValidTimestamp(decision.decidedAt)) {
    addError(errors, 'decidedAt', 'decided_at_invalid', 'a valid publication decision timestamp is required');
  }

  if (!isRecord(decision.publisher)) {
    addError(errors, 'publisher', 'publisher_missing', 'a publisher record is required');
  } else {
    requireString(errors, decision.publisher.publisherId, 'publisher.publisherId', 'publisher_id_missing', 'a publisher identifier is required');
    if (decision.publisher.role !== 'content_publisher') {
      addError(errors, 'publisher.role', 'publisher_role_invalid', 'a publication decision requires publisher role content_publisher');
    }
    if (
      isNonEmptyString(decision.contentAuthorId) &&
      decision.publisher.publisherId === decision.contentAuthorId
    ) {
      addError(
        errors,
        'publisher.publisherId',
        'author_publication_conflict',
        'the content author cannot publish the same revision'
      );
    }
  }

  validateReviewDecisionIds(decision.reviewDecisionIds, errors);
  validateGovernance(decision.dataGovernance, errors);

  return { valid: errors.length === 0, errors };
}
