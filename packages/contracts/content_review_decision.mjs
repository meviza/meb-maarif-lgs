/**
 * Immutable-shaped evidence contract for one human content review decision.
 *
 * The validator does not authenticate a reviewer, persist a record, fetch a
 * source, or publish content. Those responsibilities belong to later API and
 * audit-ledger layers.
 */

export const CONTENT_REVIEW_DECISION_CONTRACT_VERSION = '2.0.0';

const REVIEW_REQUIREMENTS = new Map([
  ['academic', { role: 'academic_reviewer', evidenceKind: 'curriculum_registry_entry' }],
  ['assessment', { role: 'assessment_reviewer', evidenceKind: 'assessment_rubric' }],
  ['rights', { role: 'rights_reviewer', evidenceKind: 'rights_record' }],
  ['accessibility', { role: 'accessibility_reviewer', evidenceKind: 'accessibility_record' }]
]);

const REVIEW_OUTCOMES = new Set(['approved', 'changes_requested', 'rejected']);
const FORBIDDEN_REVIEW_FIELDS = new Set([
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
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
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
    if (FORBIDDEN_REVIEW_FIELDS.has(key)) {
      addError(
        errors,
        nestedPath,
        'forbidden_review_field',
        `${key} cannot be included in a content review decision`
      );
    }
    collectForbiddenFields(nestedValue, nestedPath, errors, visited);
  }
}

function validateReviewedRevision(revision, errors) {
  if (!isRecord(revision)) {
    addError(errors, 'reviewedRevision', 'reviewed_revision_missing', 'a reviewed revision is required');
    return;
  }

  requireString(errors, revision.contentItemId, 'reviewedRevision.contentItemId', 'content_item_id_missing', 'a content item identifier is required');
  requireString(errors, revision.revisionId, 'reviewedRevision.revisionId', 'revision_id_missing', 'a revision identifier is required');
  if (!isSha256(revision.sha256)) {
    addError(errors, 'reviewedRevision.sha256', 'revision_sha256_invalid', 'a SHA-256 revision hash is required');
  }
  if (!isSha256(revision.assetSetSha256)) {
    addError(errors, 'reviewedRevision.assetSetSha256', 'asset_set_sha256_invalid', 'an asset-evidence set SHA-256 hash is required');
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

function validateEvidence(evidenceRefs, requiredEvidenceKind, errors) {
  if (!Array.isArray(evidenceRefs) || evidenceRefs.length === 0) {
    addError(errors, 'evidenceRefs', 'evidence_missing', 'at least one review evidence record is required');
    return;
  }

  evidenceRefs.forEach((evidence, index) => {
    const path = `evidenceRefs[${index}]`;
    if (!isRecord(evidence)) {
      addError(errors, path, 'evidence_invalid', 'a review evidence record must be an object');
      return;
    }
    requireString(errors, evidence.evidenceId, `${path}.evidenceId`, 'evidence_id_missing', 'an evidence identifier is required');
    requireString(errors, evidence.evidenceKind, `${path}.evidenceKind`, 'evidence_kind_missing', 'an evidence kind is required');
    if (!isSha256(evidence.sha256)) {
      addError(errors, `${path}.sha256`, 'evidence_sha256_invalid', 'a SHA-256 evidence hash is required');
    }
  });

  if (!evidenceRefs.some(evidence => evidence?.evidenceKind === requiredEvidenceKind)) {
    addError(
      errors,
      'evidenceRefs',
      'required_evidence_kind_missing',
      `${requiredEvidenceKind === 'curriculum_registry_entry' ? 'academic' : requiredEvidenceKind.replace(/_record$|_rubric$/u, '')} review requires evidence kind ${requiredEvidenceKind}`
    );
  }
}

/**
 * Validate one append-only review-decision payload without saving it anywhere.
 */
export function validateContentReviewDecision(decision) {
  const errors = [];
  if (!isRecord(decision)) {
    return {
      valid: false,
      errors: [{ path: 'decision', code: 'review_decision_invalid', message: 'a content review decision object is required' }]
    };
  }

  collectForbiddenFields(decision, '', errors);

  if (decision.contractVersion !== CONTENT_REVIEW_DECISION_CONTRACT_VERSION) {
    addError(errors, 'contractVersion', 'contract_version_unsupported', `expected contract version ${CONTENT_REVIEW_DECISION_CONTRACT_VERSION}`);
  }
  requireString(errors, decision.decisionId, 'decisionId', 'decision_id_missing', 'a decision identifier is required');
  validateReviewedRevision(decision.reviewedRevision, errors);
  requireString(errors, decision.contentAuthorId, 'contentAuthorId', 'content_author_missing', 'a content author identifier is required');
  requireString(errors, decision.reviewPolicyVersion, 'reviewPolicyVersion', 'review_policy_version_missing', 'a review policy version is required');
  requireString(errors, decision.rationale, 'rationale', 'rationale_missing', 'a review rationale is required');

  const reviewRequirement = REVIEW_REQUIREMENTS.get(decision.discipline);
  if (!reviewRequirement) {
    addError(errors, 'discipline', 'discipline_invalid', 'a supported review discipline is required');
  }
  if (!REVIEW_OUTCOMES.has(decision.outcome)) {
    addError(errors, 'outcome', 'outcome_invalid', 'a supported review outcome is required');
  }
  if (!isValidTimestamp(decision.decidedAt)) {
    addError(errors, 'decidedAt', 'decided_at_invalid', 'a valid decision timestamp is required');
  }

  if (!isRecord(decision.reviewer)) {
    addError(errors, 'reviewer', 'reviewer_missing', 'a reviewer record is required');
  } else {
    requireString(errors, decision.reviewer.reviewerId, 'reviewer.reviewerId', 'reviewer_id_missing', 'a reviewer identifier is required');
    if (reviewRequirement && decision.reviewer.role !== reviewRequirement.role) {
      addError(
        errors,
        'reviewer.role',
        'reviewer_role_invalid',
        `${decision.discipline} review requires reviewer role ${reviewRequirement.role}`
      );
    }
    if (
      isNonEmptyString(decision.contentAuthorId) &&
      decision.reviewer.reviewerId === decision.contentAuthorId
    ) {
      addError(
        errors,
        'reviewer.reviewerId',
        'author_review_conflict',
        'the content author cannot review the same revision'
      );
    }
  }

  if (reviewRequirement) {
    validateEvidence(decision.evidenceRefs, reviewRequirement.evidenceKind, errors);
  } else if (!Array.isArray(decision.evidenceRefs) || decision.evidenceRefs.length === 0) {
    addError(errors, 'evidenceRefs', 'evidence_missing', 'at least one review evidence record is required');
  }

  validateGovernance(decision.dataGovernance, errors);

  return { valid: errors.length === 0, errors };
}
