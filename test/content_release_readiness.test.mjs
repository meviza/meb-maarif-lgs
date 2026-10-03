import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const RELEASE_GATE_MODULE_URL = new URL('../packages/contracts/content_release_readiness.mjs', import.meta.url);

async function loadReleaseGate() {
  // Break caught: an automated screen or an author's own assertion could be
  // mistaken for the independent human evidence required before release.
  assert.equal(
    fs.existsSync(RELEASE_GATE_MODULE_URL),
    true,
    'content release requires an independent human-review readiness gate'
  );
  return import(RELEASE_GATE_MODULE_URL.href);
}

function reviewedRevision(overrides = {}) {
  return {
    contentItemId: 'CONTENT-G1-TR-001',
    revisionId: 'REV-G1-TR-001',
    sha256: 'a'.repeat(64),
    ...overrides
  };
}

function review({ reviewId, discipline, reviewerId, reviewerRole, decision = 'approved', reviewedRevision: target = reviewedRevision() }) {
  return { reviewId, discipline, reviewerId, reviewerRole, decision, reviewedRevision: target };
}

function releaseReadyCandidate(overrides = {}) {
  return {
    contractVersion: '1.0.0',
    revision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      lifecycleState: 'approved',
      authorId: 'content-editor-001',
      automatedScreeningStatus: 'passed'
    },
    reviews: [
      review({
        reviewId: 'AR-001',
        discipline: 'academic',
        reviewerId: 'academic-reviewer-001',
        reviewerRole: 'academic_reviewer'
      }),
      review({
        reviewId: 'MR-001',
        discipline: 'assessment',
        reviewerId: 'assessment-reviewer-001',
        reviewerRole: 'assessment_reviewer'
      }),
      review({
        reviewId: 'RR-001',
        discipline: 'rights',
        reviewerId: 'rights-reviewer-001',
        reviewerRole: 'rights_reviewer'
      }),
      review({
        reviewId: 'AC-001',
        discipline: 'accessibility',
        reviewerId: 'accessibility-reviewer-001',
        reviewerRole: 'accessibility_reviewer'
      })
    ],
    release: {
      releaseRequestId: 'REL-001',
      requestedBy: 'release-manager-001',
      rollbackPlanId: 'ROLLBACK-001'
    },
    ...overrides
  };
}

test('marks an approved revision ready only with four distinct human review disciplines and a rollback plan', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();

  const result = evaluateContentReleaseReadiness(releaseReadyCandidate());

  assert.deepEqual(result, {
    ready: true,
    nextState: 'approval_ready',
    errors: []
  });
});

test('rejects automated screening as a substitute for the required academic human review', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate({
    reviews: [
      review({
        reviewId: 'AR-AUTO-001',
        discipline: 'academic',
        reviewerId: 'model-clef-flash',
        reviewerRole: 'automated_system',
        decision: 'automated_pass'
      }),
      review({
        reviewId: 'MR-001',
        discipline: 'assessment',
        reviewerId: 'assessment-reviewer-001',
        reviewerRole: 'assessment_reviewer'
      }),
      review({
        reviewId: 'RR-001',
        discipline: 'rights',
        reviewerId: 'rights-reviewer-001',
        reviewerRole: 'rights_reviewer'
      }),
      review({
        reviewId: 'AC-001',
        discipline: 'accessibility',
        reviewerId: 'accessibility-reviewer-001',
        reviewerRole: 'accessibility_reviewer'
      })
    ]
  });

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'reviews[0]',
        code: 'review_not_human_approved',
        message: 'academic review must be approved by an authorized human reviewer'
      }
    ]
  });
});

test('rejects author self-review and a reviewer serving more than one required discipline', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate({
    reviews: [
      review({
        reviewId: 'AR-SELF-001',
        discipline: 'academic',
        reviewerId: 'content-editor-001',
        reviewerRole: 'academic_reviewer'
      }),
      review({
        reviewId: 'MR-DUPLICATE-001',
        discipline: 'assessment',
        reviewerId: 'content-editor-001',
        reviewerRole: 'assessment_reviewer'
      }),
      review({
        reviewId: 'RR-001',
        discipline: 'rights',
        reviewerId: 'rights-reviewer-001',
        reviewerRole: 'rights_reviewer'
      }),
      review({
        reviewId: 'AC-001',
        discipline: 'accessibility',
        reviewerId: 'accessibility-reviewer-001',
        reviewerRole: 'accessibility_reviewer'
      })
    ]
  });

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'reviews[0].reviewerId',
        code: 'author_review_conflict',
        message: 'the content author cannot review the same revision'
      },
      {
        path: 'reviews[1].reviewerId',
        code: 'author_review_conflict',
        message: 'the content author cannot review the same revision'
      },
      {
        path: 'reviews[1].reviewerId',
        code: 'reviewer_discipline_conflict',
        message: 'each required review discipline must have a distinct reviewer'
      }
    ]
  });
});

test('blocks an otherwise human-reviewed revision when the release request has no rollback plan', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate({
    release: {
      releaseRequestId: 'REL-001',
      requestedBy: 'release-manager-001'
    }
  });

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'release.rollbackPlanId',
        code: 'rollback_plan_missing',
        message: 'a rollback plan is required before release readiness'
      }
    ]
  });
});

test('blocks a direct draft-to-release attempt even when review records are supplied', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate({
    revision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      lifecycleState: 'draft',
      authorId: 'content-editor-001',
      automatedScreeningStatus: 'passed'
    }
  });

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'revision.lifecycleState',
        code: 'revision_not_approved',
        message: 'only an approved revision can enter release readiness review'
      }
    ]
  });
});

test('blocks a human review for another content item even when its revision identifier and hash match', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate();
  candidate.reviews[1] = review({
    reviewId: 'MR-001',
    discipline: 'assessment',
    reviewerId: 'assessment-reviewer-001',
    reviewerRole: 'assessment_reviewer',
    reviewedRevision: reviewedRevision({ contentItemId: 'CONTENT-G1-TR-OTHER' })
  });

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'reviews[1].reviewedRevision.contentItemId',
        code: 'review_content_item_mismatch',
        message: 'review record must target the release content item'
      }
    ]
  });
});

test('blocks a human review for a different revision hash even when its content item and revision identifier match', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate();
  candidate.reviews[2] = review({
    reviewId: 'RR-001',
    discipline: 'rights',
    reviewerId: 'rights-reviewer-001',
    reviewerRole: 'rights_reviewer',
    reviewedRevision: reviewedRevision({ sha256: 'b'.repeat(64) })
  });

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'reviews[2].reviewedRevision.sha256',
        code: 'review_revision_mismatch',
        message: 'review record must target the release revision'
      }
    ]
  });
});

test('blocks a purported human review without a review record or reviewer identifier', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate({
    reviews: [
      review({
        reviewId: '',
        discipline: 'academic',
        reviewerId: '',
        reviewerRole: 'academic_reviewer'
      }),
      review({
        reviewId: 'MR-001',
        discipline: 'assessment',
        reviewerId: 'assessment-reviewer-001',
        reviewerRole: 'assessment_reviewer'
      }),
      review({
        reviewId: 'RR-001',
        discipline: 'rights',
        reviewerId: 'rights-reviewer-001',
        reviewerRole: 'rights_reviewer'
      }),
      review({
        reviewId: 'AC-001',
        discipline: 'accessibility',
        reviewerId: 'accessibility-reviewer-001',
        reviewerRole: 'accessibility_reviewer'
      })
    ]
  });

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'reviews[0].reviewId',
        code: 'review_id_missing',
        message: 'a human review record identifier is required'
      },
      {
        path: 'reviews[0].reviewerId',
        code: 'reviewer_id_missing',
        message: 'a human reviewer identifier is required'
      }
    ]
  });
});

test('blocks a raw release candidate with duplicate review disciplines', async () => {
  const { evaluateContentReleaseReadiness } = await loadReleaseGate();
  const candidate = releaseReadyCandidate();
  candidate.reviews.push(review({
    reviewId: 'AR-002',
    discipline: 'academic',
    reviewerId: 'academic-reviewer-002',
    reviewerRole: 'academic_reviewer'
  }));

  const result = evaluateContentReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'reviews[4].discipline',
        code: 'duplicate_review_discipline',
        message: 'only one active review is allowed for each discipline'
      }
    ]
  });
});
