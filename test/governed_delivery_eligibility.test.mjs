import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const ELIGIBILITY_MODULE_URL = new URL('../packages/contracts/governed_delivery_eligibility.mjs', import.meta.url);

async function loadEligibilityGate() {
  // Break caught: a package can appear published through unconnected booleans
  // or identifiers, without a verified curriculum, four review decisions,
  // and an independent human publication decision for the same revision.
  assert.equal(
    fs.existsSync(ELIGIBILITY_MODULE_URL),
    true,
    'student delivery requires a governed delivery-eligibility composition gate'
  );
  return import(ELIGIBILITY_MODULE_URL.href);
}

const REVIEW_DETAILS = {
  academic: { role: 'academic_reviewer', evidenceKind: 'curriculum_registry_entry' },
  assessment: { role: 'assessment_reviewer', evidenceKind: 'assessment_rubric' },
  rights: { role: 'rights_reviewer', evidenceKind: 'rights_record' },
  accessibility: { role: 'accessibility_reviewer', evidenceKind: 'accessibility_record' }
};

function reviewDecision(discipline, overrides = {}) {
  const detail = REVIEW_DETAILS[discipline];
  return {
    contractVersion: '1.0.0',
    decisionId: `DEC-${discipline.toUpperCase()}-001`,
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64)
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
      releaseRequestId: 'REL-G1-TR-001',
      requestedBy: 'release-manager-001',
      rollbackPlanId: 'ROLLBACK-G1-TR-001'
    },
    ...overrides
  };
}

function publicationDecision(overrides = {}) {
  return {
    contractVersion: '2.0.0',
    decisionId: 'PUB-G1-TR-001',
    targetRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64)
    },
    contentAuthorId: 'content-editor-001',
    outcome: 'published',
    decisionSequence: 1,
    decidedAt: '2026-10-03T02:00:00.000Z',
    publicationPolicyVersion: 'content-publication-v1',
    rationale: 'Dört insan incelemesi, geri alma planı ve teslim kapsamı doğrulandı.',
    publisher: {
      publisherId: 'publisher-001',
      role: 'content_publisher'
    },
    releaseRequestId: 'REL-G1-TR-001',
    rollbackPlanId: 'ROLLBACK-G1-TR-001',
    reviewDecisionIds: {
      academic: 'DEC-ACADEMIC-001',
      assessment: 'DEC-ASSESSMENT-001',
      rights: 'DEC-RIGHTS-001',
      accessibility: 'DEC-ACCESSIBILITY-001'
    },
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-data-steward',
      classification: 'governance-record',
      processingPurpose: 'content-publication-traceability',
      retentionClass: 'content-lifecycle'
    },
    ...overrides
  };
}

function studentManifest(overrides = {}) {
  return {
    contractVersion: '2.0.0',
    packageId: 'CP-G1-TR-001',
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-data-steward',
      classification: 'educational-content',
      processingPurpose: 'student-learning-delivery',
      retentionClass: 'content-lifecycle',
      sourceLineage: [
        {
          sourceId: 'SRC-ORIGINAL-001',
          kind: 'original',
          retrievedAt: '2026-10-03T00:00:00.000Z'
        }
      ]
    },
    curriculum: {
      registryEntryId: 'CURR-G1-TR-001',
      programVersion: 'fixture-program-v1',
      grade: 1,
      courseKey: 'turkce',
      outcomeCode: 'FIXTURE.1.1',
      verificationState: 'canonical_verified'
    },
    content: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      revisionSha256: 'a'.repeat(64),
      authorId: 'content-editor-001',
      lifecycleState: 'published',
      academicReviewId: 'DEC-ACADEMIC-001',
      assessmentReviewId: 'DEC-ASSESSMENT-001',
      rightsReviewId: 'DEC-RIGHTS-001',
      accessibilityReviewId: 'DEC-ACCESSIBILITY-001',
      publicationDecisionId: 'PUB-G1-TR-001'
    },
    assets: [],
    ...overrides
  };
}

function canonicalRegistryEntry(overrides = {}) {
  return {
    contractVersion: '1.0.0',
    registryEntryId: 'CURR-G1-TR-001',
    programVersion: 'fixture-program-v1',
    grade: 1,
    courseKey: 'turkce',
    outcomeCode: 'FIXTURE.1.1',
    verificationState: 'canonical_verified',
    sourceDocument: {
      sourceId: 'SRC-FIXTURE-001',
      sourceUrl: 'https://publisher.example.test/program.pdf',
      retrievedAt: '2026-10-03T00:00:00.000Z',
      sha256: 'd'.repeat(64)
    },
    canonicalReview: {
      reviewId: 'CURR-REVIEW-001',
      reviewerId: 'curriculum-steward-001',
      reviewedAt: '2026-10-03T01:00:00.000Z'
    },
    ...overrides
  };
}

function governedCandidate(overrides = {}) {
  return {
    manifest: studentManifest(),
    curriculumEntries: [canonicalRegistryEntry()],
    releaseCandidate: releaseCandidate(),
    publicationDecisionHistory: [publicationDecision()],
    ...overrides
  };
}

test('marks a synthetic package delivery_eligible only when curriculum, four review decisions, and independent publication align', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();

  const result = evaluateGovernedStudentDeliveryEligibility(governedCandidate());

  assert.deepEqual(result, {
    eligible: true,
    nextState: 'delivery_eligible',
    errors: []
  });
});

test('blocks a caller-selected publication decision when no publication history was supplied', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate();
  candidate.publicationDecision = publicationDecision();
  delete candidate.publicationDecisionHistory;

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'publicationDecisionHistory',
        code: 'publication_history_missing',
        message: 'a publication decision history is required to resolve the effective decision'
      }
    ]
  });
});

test('blocks media delivery until every asset has an evidence-bound provenance and accessibility gate', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate({
    manifest: studentManifest({
      assets: [
        {
          assetId: 'ASSET-ILLUSTRATION-001',
          mediaType: 'image/svg+xml',
          sha256: 'c'.repeat(64),
          rightsStatus: 'verified',
          rightsRecordId: 'RIGHTS-001',
          altText: 'Üç farklı renkte balon',
          longDescription: 'Sayı sayma etkinliğinde kullanılan üç balon çizimi.'
        }
      ]
    })
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'manifest.assets',
        code: 'asset_bound_evidence_required',
        message: 'media delivery requires an asset-bound provenance, rights, and accessibility gate'
      }
    ]
  });
});

test('blocks delivery when a later withdrawn decision is effective in the publication history', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const withdrawnDecision = publicationDecision({
    decisionId: 'PUB-G1-TR-002',
    outcome: 'withdrawn',
    decisionSequence: 2,
    decidedAt: '2026-10-03T03:00:00.000Z'
  });
  const baselineManifest = studentManifest();
  const candidate = governedCandidate({
    manifest: studentManifest({
      content: {
        ...baselineManifest.content,
        publicationDecisionId: 'PUB-G1-TR-002'
      }
    }),
    publicationDecisionHistory: [publicationDecision(), withdrawnDecision]
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'publicationDecisionHistory[1].outcome',
        code: 'publication_outcome_not_published',
        message: 'only a published human publication decision can enable student delivery'
      }
    ]
  });
});

test('blocks delivery when a review decision postdates the effective publication decision', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate({
    releaseCandidate: releaseCandidate({
      decisions: [
        reviewDecision('academic', { decidedAt: '2026-10-03T03:00:00.000Z' }),
        reviewDecision('assessment'),
        reviewDecision('rights'),
        reviewDecision('accessibility')
      ]
    })
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'releaseCandidate.decisions[0].decidedAt',
        code: 'review_decision_after_publication',
        message: 'every review decision must precede or coincide with the effective publication decision'
      }
    ]
  });
});

test('blocks delivery when the publication decision targets a different revision hash', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate({
    publicationDecisionHistory: [publicationDecision({
      targetRevision: {
        contentItemId: 'CONTENT-G1-TR-001',
        revisionId: 'REV-G1-TR-001',
        sha256: 'e'.repeat(64)
      }
    })]
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'publicationDecisionHistory[0].targetRevision',
        code: 'publication_history_revision_mismatch',
        message: 'every publication history record must target the release revision'
      }
    ]
  });
});

test('blocks delivery when the manifest points to a different assessment decision than the reviewed revision', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate({
    manifest: studentManifest({
      content: {
        ...studentManifest().content,
        assessmentReviewId: 'DEC-ASSESSMENT-OTHER'
      }
    })
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'manifest.content.assessmentReviewId',
        code: 'manifest_review_decision_mismatch',
        message: 'manifest assessment review identifier must match the reviewed revision'
      }
    ]
  });
});

test('blocks a valid withdrawn publication decision from student delivery', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate({
    publicationDecisionHistory: [publicationDecision({ outcome: 'withdrawn' })]
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'publicationDecisionHistory[0].outcome',
        code: 'publication_outcome_not_published',
        message: 'only a published human publication decision can enable student delivery'
      }
    ]
  });
});

test('blocks delivery when the publisher is also one of the revision reviewers', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate({
    publicationDecisionHistory: [publicationDecision({
      publisher: {
        publisherId: 'academic-reviewer-001',
        role: 'content_publisher'
      }
    })]
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'publicationDecisionHistory[0].publisher.publisherId',
        code: 'publisher_reviewer_conflict',
        message: 'the publication decision must be independent from the revision reviewers'
      }
    ]
  });
});
