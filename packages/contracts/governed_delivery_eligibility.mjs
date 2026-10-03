/**
 * Pure composition gate for a student-delivery candidate.
 *
 * It proves only that supplied, already-validated records align. It never
 * reads a legacy bank, authenticates a caller, writes a ledger, or serves a
 * question. A later delivery resolver must obtain these records from an
 * append-only, authorized source before opening a student endpoint.
 */

import { validateStudentDeliveryPackage } from './content_package_manifest.mjs';
import { validateContentPublicationDecision } from './content_publication_decision.mjs';
import { evaluateDecisionBackedReleaseReadiness } from './decision_backed_release_readiness.mjs';

const REVIEW_BINDINGS = [
  { discipline: 'academic', manifestField: 'academicReviewId' },
  { discipline: 'assessment', manifestField: 'assessmentReviewId' },
  { discipline: 'rights', manifestField: 'rightsReviewId' },
  { discipline: 'accessibility', manifestField: 'accessibilityReviewId' }
];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function blocked(errors) {
  return { eligible: false, nextState: 'blocked', errors };
}

function appendValidationErrors(errors, prefix, code, validation) {
  validation.errors.forEach(error => {
    addError(errors, `${prefix}.${error.path}`, code, error.message);
  });
}

function resolveEffectivePublicationDecision(history, revision) {
  const errors = [];
  if (!Array.isArray(history) || history.length === 0) {
    addError(
      errors,
      'publicationDecisionHistory',
      'publication_history_missing',
      'a publication decision history is required to resolve the effective decision'
    );
    return { errors, decision: null, index: -1 };
  }

  const seenSequences = new Set();
  const validDecisions = [];
  history.forEach((decision, index) => {
    const validation = validateContentPublicationDecision(decision);
    if (!validation.valid) {
      appendValidationErrors(errors, `publicationDecisionHistory[${index}]`, 'publication_decision_invalid', validation);
      return;
    }

    if (seenSequences.has(decision.decisionSequence)) {
      addError(
        errors,
        `publicationDecisionHistory[${index}].decisionSequence`,
        'publication_history_sequence_not_distinct',
        'each publication decision sequence must be distinct within a revision history'
      );
    }
    seenSequences.add(decision.decisionSequence);

    if (
      decision.targetRevision.contentItemId !== revision.contentItemId ||
      decision.targetRevision.revisionId !== revision.revisionId ||
      decision.targetRevision.sha256 !== revision.sha256
    ) {
      addError(
        errors,
        `publicationDecisionHistory[${index}].targetRevision`,
        'publication_history_revision_mismatch',
        'every publication history record must target the release revision'
      );
    }
    validDecisions.push({ decision, index });
  });

  if (errors.length > 0) {
    return { errors, decision: null, index: -1 };
  }

  validDecisions.sort((left, right) => right.decision.decisionSequence - left.decision.decisionSequence);
  return {
    errors: [],
    decision: validDecisions[0].decision,
    index: validDecisions[0].index
  };
}

/**
 * Evaluate whether a synthetic or ledger-supplied package has the complete
 * evidence chain needed to become eligible for a later student delivery
 * resolver. "delivery_eligible" is not a publish, HTTP, or access decision.
 */
export function evaluateGovernedStudentDeliveryEligibility(candidate) {
  const manifest = candidate?.manifest;
  const curriculumEntries = candidate?.curriculumEntries;
  const releaseCandidate = candidate?.releaseCandidate;
  const publicationDecisionHistory = candidate?.publicationDecisionHistory;

  const manifestValidation = validateStudentDeliveryPackage(manifest, curriculumEntries);
  if (!manifestValidation.valid) {
    const errors = [];
    appendValidationErrors(errors, 'manifest', 'manifest_invalid', manifestValidation);
    return blocked(errors);
  }

  // A V2 manifest records only per-asset metadata. It does not yet bind each
  // byte hash, rights record, and accessibility record to the exact human
  // review evidence. Do not let a self-declared media asset cross the future
  // student boundary until the dedicated asset-evidence gate exists.
  if (manifest.assets.length > 0) {
    return blocked([
      {
        path: 'manifest.assets',
        code: 'asset_bound_evidence_required',
        message: 'media delivery requires an asset-bound provenance, rights, and accessibility gate'
      }
    ]);
  }

  const readiness = evaluateDecisionBackedReleaseReadiness(releaseCandidate);
  if (!readiness.ready) {
    const errors = [];
    readiness.errors.forEach(error => {
      addError(errors, `releaseCandidate.${error.path}`, 'release_readiness_blocked', error.message);
    });
    return blocked(errors);
  }

  const errors = [];
  const content = isRecord(manifest.content) ? manifest.content : {};
  const revision = isRecord(releaseCandidate?.revision) ? releaseCandidate.revision : {};
  const release = isRecord(releaseCandidate?.release) ? releaseCandidate.release : {};
  const decisions = Array.isArray(releaseCandidate?.decisions) ? releaseCandidate.decisions : [];
  const decisionsByDiscipline = new Map(decisions.map(decision => [decision.discipline, decision]));
  const publicationResolution = resolveEffectivePublicationDecision(publicationDecisionHistory, revision);
  if (publicationResolution.errors.length > 0) {
    return blocked(publicationResolution.errors);
  }
  const publicationDecision = publicationResolution.decision;
  const publicationDecisionPath = `publicationDecisionHistory[${publicationResolution.index}]`;

  if (content.contentItemId !== revision.contentItemId) {
    addError(
      errors,
      'manifest.content.contentItemId',
      'manifest_revision_mismatch',
      'manifest content item identifier must match the release revision'
    );
  }
  if (content.revisionId !== revision.revisionId) {
    addError(
      errors,
      'manifest.content.revisionId',
      'manifest_revision_mismatch',
      'manifest revision identifier must match the release revision'
    );
  }
  if (content.revisionSha256 !== revision.sha256) {
    addError(
      errors,
      'manifest.content.revisionSha256',
      'manifest_revision_mismatch',
      'manifest revision hash must match the release revision'
    );
  }
  if (content.authorId !== revision.authorId) {
    addError(
      errors,
      'manifest.content.authorId',
      'manifest_author_mismatch',
      'manifest content author must match the release revision author'
    );
  }

  if (publicationDecision.contentAuthorId !== revision.authorId) {
    addError(
      errors,
      `${publicationDecisionPath}.contentAuthorId`,
      'publication_author_mismatch',
      'publication decision must name the release revision author'
    );
  }
  if (publicationDecision.decisionId !== content.publicationDecisionId) {
    addError(
      errors,
      'manifest.content.publicationDecisionId',
      'manifest_publication_decision_mismatch',
      'manifest publication decision identifier must match the publication decision'
    );
  }
  if (publicationDecision.releaseRequestId !== release.releaseRequestId) {
    addError(
      errors,
      `${publicationDecisionPath}.releaseRequestId`,
      'publication_release_request_mismatch',
      'publication decision must reference the release request under review'
    );
  }
  if (publicationDecision.rollbackPlanId !== release.rollbackPlanId) {
    addError(
      errors,
      `${publicationDecisionPath}.rollbackPlanId`,
      'publication_rollback_plan_mismatch',
      'publication decision must reference the release rollback plan'
    );
  }
  if (publicationDecision.outcome !== 'published') {
    addError(
      errors,
      `${publicationDecisionPath}.outcome`,
      'publication_outcome_not_published',
      'only a published human publication decision can enable student delivery'
    );
  }

  const publicationTimestamp = Date.parse(publicationDecision.decidedAt);
  decisions.forEach((decision, index) => {
    if (Date.parse(decision.decidedAt) > publicationTimestamp) {
      addError(
        errors,
        `releaseCandidate.decisions[${index}].decidedAt`,
        'review_decision_after_publication',
        'every review decision must precede or coincide with the effective publication decision'
      );
    }
  });

  for (const { discipline, manifestField } of REVIEW_BINDINGS) {
    const decision = decisionsByDiscipline.get(discipline);
    if (!decision) continue;

    if (content[manifestField] !== decision.decisionId) {
      addError(
        errors,
        `manifest.content.${manifestField}`,
        'manifest_review_decision_mismatch',
        `manifest ${discipline} review identifier must match the reviewed revision`
      );
    }
    if (publicationDecision.reviewDecisionIds[discipline] !== decision.decisionId) {
      addError(
        errors,
        `${publicationDecisionPath}.reviewDecisionIds.${discipline}`,
        'publication_review_decision_mismatch',
        `publication decision ${discipline} review identifier must match the reviewed revision`
      );
    }
  }

  const reviewerIds = new Set(
    decisions
      .map(decision => decision?.reviewer?.reviewerId)
      .filter(reviewerId => typeof reviewerId === 'string')
  );
  if (reviewerIds.has(publicationDecision.publisher.publisherId)) {
    addError(
      errors,
      `${publicationDecisionPath}.publisher.publisherId`,
      'publisher_reviewer_conflict',
      'the publication decision must be independent from the revision reviewers'
    );
  }

  return errors.length === 0
    ? { eligible: true, nextState: 'delivery_eligible', errors: [] }
    : blocked(errors);
}
