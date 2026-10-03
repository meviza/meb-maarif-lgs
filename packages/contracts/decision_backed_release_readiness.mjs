/**
 * Joins validated, immutable-shaped review decisions to a single release
 * revision before delegating role/separation checks to the readiness gate.
 */

import { evaluateContentReleaseReadiness } from './content_release_readiness.mjs';
import { validateContentReviewDecision } from './content_review_decision.mjs';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function blocked(errors) {
  return { ready: false, nextState: 'blocked', errors };
}

/**
 * Evaluate release readiness against decisions that must all target the exact
 * immutable revision. The function is pure and never publishes content.
 */
export function evaluateDecisionBackedReleaseReadiness(candidate) {
  const errors = [];
  const revision = isRecord(candidate?.revision) ? candidate.revision : {};
  const decisions = Array.isArray(candidate?.decisions) ? candidate.decisions : [];
  const seenDisciplines = new Set();

  decisions.forEach((decision, index) => {
    const validation = validateContentReviewDecision(decision);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        addError(
          errors,
          `decisions[${index}].${error.path}`,
          'review_decision_invalid',
          error.message
        );
      });
      return;
    }

    if (seenDisciplines.has(decision.discipline)) {
      addError(
        errors,
        `decisions[${index}].discipline`,
        'duplicate_review_discipline',
        'only one active decision is allowed for each review discipline'
      );
      return;
    }
    seenDisciplines.add(decision.discipline);

    if (decision.contentAuthorId !== revision.authorId) {
      addError(
        errors,
        `decisions[${index}].contentAuthorId`,
        'decision_author_mismatch',
        'review decision must name the release revision author'
      );
    }

    if (decision.reviewedRevision.contentItemId !== revision.contentItemId) {
      addError(
        errors,
        `decisions[${index}].reviewedRevision.contentItemId`,
        'review_content_item_mismatch',
        'review decision must target the release content item'
      );
    }

    if (
      decision.reviewedRevision.revisionId !== revision.revisionId ||
      decision.reviewedRevision.sha256 !== revision.sha256
    ) {
      addError(
        errors,
        `decisions[${index}].reviewedRevision.sha256`,
        'review_revision_mismatch',
        'review decision must target the release revision'
      );
    }

    if (decision.outcome !== 'approved') {
      addError(
        errors,
        `decisions[${index}].outcome`,
        'review_not_approved',
        `${decision.discipline} review must be approved before release readiness`
      );
    }
  });

  if (errors.length > 0) {
    return blocked(errors);
  }

  return evaluateContentReleaseReadiness({
    revision: {
      lifecycleState: revision.lifecycleState,
      authorId: revision.authorId
    },
    reviews: decisions.map(decision => ({
      reviewId: decision.decisionId,
      discipline: decision.discipline,
      reviewerId: decision.reviewer.reviewerId,
      reviewerRole: decision.reviewer.role,
      decision: decision.outcome
    })),
    release: candidate?.release
  });
}
