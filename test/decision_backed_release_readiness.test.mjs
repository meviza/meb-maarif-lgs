import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const RELEASE_GATE_MODULE_URL = new URL('../packages/contracts/decision_backed_release_readiness.mjs', import.meta.url);

async function loadDecisionBackedReleaseGate() {
  // Break caught: four unrelated review records could be mistaken for a
  // release decision for the exact revision being packaged.
  assert.equal(
    fs.existsSync(RELEASE_GATE_MODULE_URL),
    true,
    'release readiness requires decisions bound to the exact content revision'
  );
  return import(RELEASE_GATE_MODULE_URL.href);
}

const REVIEW_DETAILS = {
  academic: {
    role: 'academic_reviewer',
    evidenceKind: 'curriculum_registry_entry'
  },
  assessment: {
    role: 'assessment_reviewer',
    evidenceKind: 'assessment_rubric'
  },
  rights: {
    role: 'rights_reviewer',
    evidenceKind: 'rights_record'
  },
  accessibility: {
    role: 'accessibility_reviewer',
    evidenceKind: 'accessibility_record'
  }
};

function reviewDecision(discipline, overrides = {}) {
  const detail = REVIEW_DETAILS[discipline];
  return {
    contractVersion: '2.0.0',
    decisionId: `DEC-${discipline.toUpperCase()}-001`,
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: 'c'.repeat(64)
    },
    contentAuthorId: 'content-editor-001',
    discipline,
    outcome: 'approved',
    decidedAt: '2026-10-03T01:00:00.000Z',
    reviewPolicyVersion: 'content-review-v1',
    rationale: `${discipline} incelemesi tamamlandı.`,
    reviewer: {
      reviewerId: `${discipline}-reviewer-001`,
      role: detail.role
    },
    evidenceRefs: [
      {
        evidenceId: `EVID-${discipline.toUpperCase()}-001`,
        evidenceKind: detail.evidenceKind,
        sha256: 'b'.repeat(64)
      }
    ],
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-data-steward',
      classification: 'governance-record',
      processingPurpose: 'content-review-traceability',
      retentionClass: 'content-lifecycle'
    },
    ...overrides
  };
}

function releaseCandidate(overrides = {}) {
  return {
    revision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: 'c'.repeat(64),
      lifecycleState: 'approved',
      authorId: 'content-editor-001'
    },
    decisions: [
      reviewDecision('academic'),
      reviewDecision('assessment'),
      reviewDecision('rights'),
      reviewDecision('accessibility')
    ],
    release: {
      releaseRequestId: 'REL-001',
      requestedBy: 'release-manager-001',
      rollbackPlanId: 'ROLLBACK-001'
    },
    ...overrides
  };
}

test('marks a revision approval_ready only when all four approved decisions target the same revision hash', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();

  const result = evaluateDecisionBackedReleaseReadiness(releaseCandidate());

  assert.deepEqual(result, {
    ready: true,
    nextState: 'approval_ready',
    errors: []
  });
});

test('blocks release readiness when a valid decision belongs to a different revision hash', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();
  const candidate = releaseCandidate();
  candidate.decisions[1] = reviewDecision('assessment', {
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'c'.repeat(64),
      assetSetSha256: 'c'.repeat(64)
    }
  });

  const result = evaluateDecisionBackedReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'decisions[1].reviewedRevision.sha256',
        code: 'review_revision_mismatch',
        message: 'review decision must target the release revision'
      }
    ]
  });
});

test('blocks release readiness when a valid decision belongs to a different content item', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();
  const candidate = releaseCandidate();
  candidate.decisions[1] = reviewDecision('assessment', {
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-OTHER',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: 'c'.repeat(64)
    }
  });

  const result = evaluateDecisionBackedReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'decisions[1].reviewedRevision.contentItemId',
        code: 'review_content_item_mismatch',
        message: 'review decision must target the release content item'
      }
    ]
  });
});

test('blocks release readiness when an otherwise valid review requests changes', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();
  const candidate = releaseCandidate();
  candidate.decisions[0] = reviewDecision('academic', {
    outcome: 'changes_requested'
  });

  const result = evaluateDecisionBackedReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'decisions[0].outcome',
        code: 'review_not_approved',
        message: 'academic review must be approved before release readiness'
      }
    ]
  });
});

test('blocks release readiness when two approved decisions claim the same review discipline', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();
  const candidate = releaseCandidate();
  candidate.decisions.push(reviewDecision('academic', {
    decisionId: 'DEC-ACADEMIC-002',
    reviewer: {
      reviewerId: 'academic-reviewer-002',
      role: 'academic_reviewer'
    }
  }));

  const result = evaluateDecisionBackedReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'decisions[4].discipline',
        code: 'duplicate_review_discipline',
        message: 'only one active decision is allowed for each review discipline'
      }
    ]
  });
});

test('blocks release readiness when a decision names a different content author than the release revision', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();
  const candidate = releaseCandidate();
  candidate.decisions[0] = reviewDecision('academic', {
    contentAuthorId: 'another-content-editor-001'
  });

  const result = evaluateDecisionBackedReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'decisions[0].contentAuthorId',
        code: 'decision_author_mismatch',
        message: 'review decision must name the release revision author'
      }
    ]
  });
});

test('blocks release readiness when an approved decision targets a different immutable asset-evidence set', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();
  const candidate = releaseCandidate();
  candidate.decisions[2] = reviewDecision('rights', {
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: 'd'.repeat(64)
    }
  });

  const result = evaluateDecisionBackedReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'decisions[2].reviewedRevision.assetSetSha256',
        code: 'review_asset_set_mismatch',
        message: 'review decision must target the release asset-evidence set'
      }
    ]
  });
});

test('blocks release readiness with a clear root-cause error when the release revision omits its asset-evidence-set hash', async () => {
  const { evaluateDecisionBackedReleaseReadiness } = await loadDecisionBackedReleaseGate();
  const candidate = releaseCandidate();
  delete candidate.revision.assetSetSha256;

  const result = evaluateDecisionBackedReleaseReadiness(candidate);

  assert.deepEqual(result, {
    ready: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'revision.assetSetSha256',
        code: 'release_asset_set_sha256_invalid',
        message: 'the release revision requires an asset-evidence set SHA-256 hash'
      }
    ]
  });
});
