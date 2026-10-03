/**
 * Stateless readiness gate for a content revision before a human release
 * decision. It never publishes content or writes a review record.
 */

const REQUIRED_REVIEWS = [
  { discipline: 'academic', reviewerRole: 'academic_reviewer' },
  { discipline: 'assessment', reviewerRole: 'assessment_reviewer' },
  { discipline: 'rights', reviewerRole: 'rights_reviewer' },
  { discipline: 'accessibility', reviewerRole: 'accessibility_reviewer' }
];

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function findReviews(reviews, discipline) {
  return reviews
    .map((review, index) => ({ review, index }))
    .filter(({ review }) => review?.discipline === discipline);
}

/**
 * Return whether a revision has the independent human evidence needed to
 * enter a later release-approval workflow. This is deliberately not a
 * publishing operation.
 */
export function evaluateContentReleaseReadiness(candidate) {
  const errors = [];
  const revision = candidate?.revision || {};
  const reviews = Array.isArray(candidate?.reviews) ? candidate.reviews : [];
  const release = candidate?.release || {};
  const reviewerDisciplines = new Map();

  if (revision.lifecycleState !== 'approved') {
    addError(
      errors,
      'revision.lifecycleState',
      'revision_not_approved',
      'only an approved revision can enter release readiness review'
    );
  }

  for (const requiredReview of REQUIRED_REVIEWS) {
    const matchingReviews = findReviews(reviews, requiredReview.discipline);
    if (matchingReviews.length === 0) {
      addError(
        errors,
        'reviews',
        'required_review_missing',
        `${requiredReview.discipline} review is required before release readiness`
      );
      continue;
    }

    if (matchingReviews.length > 1) {
      matchingReviews.slice(1).forEach(({ index }) => {
        addError(
          errors,
          `reviews[${index}].discipline`,
          'duplicate_review_discipline',
          'only one active review is allowed for each discipline'
        );
      });
      continue;
    }

    const { review, index: reviewIndex } = matchingReviews[0];
    const reviewPath = `reviews[${reviewIndex}]`;
    if (review.decision !== 'approved' || review.reviewerRole !== requiredReview.reviewerRole) {
      addError(
        errors,
        reviewPath,
        'review_not_human_approved',
        `${requiredReview.discipline} review must be approved by an authorized human reviewer`
      );
      continue;
    }

    if (!isNonEmptyString(review.reviewId)) {
      addError(
        errors,
        `${reviewPath}.reviewId`,
        'review_id_missing',
        'a human review record identifier is required'
      );
    }

    if (!isNonEmptyString(review.reviewerId)) {
      addError(
        errors,
        `${reviewPath}.reviewerId`,
        'reviewer_id_missing',
        'a human reviewer identifier is required'
      );
    }

    if (review.reviewerId === revision.authorId) {
      addError(
        errors,
        `${reviewPath}.reviewerId`,
        'author_review_conflict',
        'the content author cannot review the same revision'
      );
    }

    const firstDiscipline = reviewerDisciplines.get(review.reviewerId);
    if (firstDiscipline) {
      addError(
        errors,
        `${reviewPath}.reviewerId`,
        'reviewer_discipline_conflict',
        'each required review discipline must have a distinct reviewer'
      );
    } else {
      reviewerDisciplines.set(review.reviewerId, requiredReview.discipline);
    }
  }

  if (typeof release.rollbackPlanId !== 'string' || release.rollbackPlanId.trim().length === 0) {
    addError(
      errors,
      'release.rollbackPlanId',
      'rollback_plan_missing',
      'a rollback plan is required before release readiness'
    );
  }

  return {
    ready: errors.length === 0,
    nextState: errors.length === 0 ? 'approval_ready' : 'blocked',
    errors
  };
}
