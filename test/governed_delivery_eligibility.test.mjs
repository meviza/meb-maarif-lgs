import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { evaluateAssetEvidenceBundleSet } from '../packages/contracts/asset_evidence_bundle.mjs';

const ELIGIBILITY_MODULE_URL = new URL('../packages/contracts/governed_delivery_eligibility.mjs', import.meta.url);
const ASSET_EVALUATION_TIME = '2026-10-03T04:00:00.000Z';
const EMPTY_ASSET_SET_SHA256 = evaluateAssetEvidenceBundleSet([], ASSET_EVALUATION_TIME).assetSetSha256;

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
    contractVersion: '2.0.0',
    decisionId: `DEC-${discipline.toUpperCase()}-001`,
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: EMPTY_ASSET_SET_SHA256
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
      assetSetSha256: EMPTY_ASSET_SET_SHA256,
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
    contractVersion: '3.0.0',
    decisionId: 'PUB-G1-TR-001',
    targetRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: EMPTY_ASSET_SET_SHA256
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
    contractVersion: '3.0.0',
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
      assetSetSha256: EMPTY_ASSET_SET_SHA256,
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
    assetEvidenceBundles: [],
    assetEvidenceAsOf: ASSET_EVALUATION_TIME,
    ...overrides
  };
}

function criticalSvgBundle(overrides = {}) {
  const subject = {
    assetId: 'ASSET-G1-BALLOONS-001',
    revisionId: 'ASSETREV-G1-BALLOONS-001',
    mediaType: 'image/svg+xml',
    byteSha256: 'e'.repeat(64)
  };
  return {
    contractVersion: '1.0.0',
    bundleId: 'AEB-G1-COUNTING-001',
    asset: {
      ...subject,
      deliveryProfile: 'sanitized_static_svg_v1',
      role: 'instructional_critical',
      audience: {
        minGrade: 1,
        maxGrade: 1
      },
      origin: {
        method: 'original_human',
        subject,
        provenanceRecordId: 'PROV-G1-BALLOONS-001',
        provenanceRecordSha256: 'f'.repeat(64),
        sourceLineageIds: ['SRC-ORIGINAL-001']
      }
    },
    rights: {
      subject,
      rightsRecordId: 'RIGHTS-G1-BALLOONS-001',
      rightsRecordSha256: '1'.repeat(64),
      basis: 'owned',
      permittedUses: ['student_delivery'],
      derivativeUseAllowed: true,
      validity: {
        startsAt: '2026-10-01T00:00:00.000Z',
        endsAt: null
      },
      attribution: {
        required: false,
        text: null
      }
    },
    accessibility: {
      subject,
      accessibilityRecordId: 'ACC-G1-BALLOONS-001',
      accessibilityRecordSha256: '2'.repeat(64),
      language: 'tr',
      modality: 'visual',
      treatment: {
        shortAlt: 'Üç farklı renkte balon.',
        longDescription: 'Sayı sayma etkinliğinde kullanılan, soldan sağa dizilmiş üç balon çizimi.',
        gradeRange: {
          minGrade: 1,
          maxGrade: 1
        }
      }
    },
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-asset-steward',
      classification: 'educational-asset-metadata',
      processingPurpose: 'student-learning-delivery',
      retentionClass: 'content-lifecycle',
      sourceLineage: ['SRC-ORIGINAL-001']
    },
    ...overrides
  };
}

function assetReference(bundle) {
  return {
    assetEvidenceBundleId: bundle.bundleId,
    assetId: bundle.asset.assetId,
    revisionId: bundle.asset.revisionId,
    mediaType: bundle.asset.mediaType,
    byteSha256: bundle.asset.byteSha256,
    deliveryProfile: bundle.asset.deliveryProfile,
    provenanceRecordId: bundle.asset.origin.provenanceRecordId,
    provenanceRecordSha256: bundle.asset.origin.provenanceRecordSha256,
    rightsRecordId: bundle.rights.rightsRecordId,
    rightsRecordSha256: bundle.rights.rightsRecordSha256,
    accessibilityRecordId: bundle.accessibility.accessibilityRecordId,
    accessibilityRecordSha256: bundle.accessibility.accessibilityRecordSha256
  };
}

function reviewedRevision(assetSetSha256) {
  return {
    contentItemId: 'CONTENT-G1-TR-001',
    revisionId: 'REV-G1-TR-001',
    sha256: 'a'.repeat(64),
    assetSetSha256
  };
}

function governedVisualCandidate(overrides = {}) {
  const bundle = criticalSvgBundle();
  const assetSet = evaluateAssetEvidenceBundleSet([bundle], ASSET_EVALUATION_TIME);
  assert.equal(assetSet.valid, true, 'visual fixture must form a valid asset-evidence set');
  const assetSetSha256 = assetSet.assetSetSha256;
  const decisions = [
    reviewDecision('academic', { reviewedRevision: reviewedRevision(assetSetSha256) }),
    reviewDecision('assessment', { reviewedRevision: reviewedRevision(assetSetSha256) }),
    reviewDecision('rights', {
      reviewedRevision: reviewedRevision(assetSetSha256),
      evidenceRefs: [{
        evidenceId: bundle.rights.rightsRecordId,
        evidenceKind: 'rights_record',
        sha256: bundle.rights.rightsRecordSha256
      }]
    }),
    reviewDecision('accessibility', {
      reviewedRevision: reviewedRevision(assetSetSha256),
      evidenceRefs: [{
        evidenceId: bundle.accessibility.accessibilityRecordId,
        evidenceKind: 'accessibility_record',
        sha256: bundle.accessibility.accessibilityRecordSha256
      }]
    })
  ];
  const baseManifest = studentManifest();
  const baseRelease = releaseCandidate();
  const basePublication = publicationDecision();

  return governedCandidate({
    manifest: studentManifest({
      content: {
        ...baseManifest.content,
        assetSetSha256
      },
      assets: [assetReference(bundle)]
    }),
    releaseCandidate: releaseCandidate({
      revision: {
        ...baseRelease.revision,
        assetSetSha256
      },
      decisions
    }),
    publicationDecisionHistory: [publicationDecision({
      targetRevision: {
        ...basePublication.targetRevision,
        assetSetSha256
      }
    })],
    assetEvidenceBundles: [bundle],
    ...overrides
  });
}

function rebindCandidateAssetSet(candidate, assetSetSha256) {
  candidate.manifest.content.assetSetSha256 = assetSetSha256;
  candidate.releaseCandidate.revision.assetSetSha256 = assetSetSha256;
  candidate.releaseCandidate.decisions.forEach(decision => {
    decision.reviewedRevision.assetSetSha256 = assetSetSha256;
  });
  candidate.publicationDecisionHistory.forEach(decision => {
    decision.targetRevision.assetSetSha256 = assetSetSha256;
  });
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

test('blocks delivery rather than defaulting to a local clock when the asset-evidence evaluation time is absent', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedCandidate();
  delete candidate.assetEvidenceAsOf;

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'assetEvidenceBundles.asOf',
        code: 'asset_evidence_invalid',
        message: 'a valid UTC evaluation timestamp is required'
      }
    ]
  });
});

test('blocks a caller-supplied pre-publication asset-evidence time from hiding rights that expired before publication', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const expiredBundle = criticalSvgBundle({
    rights: {
      ...criticalSvgBundle().rights,
      validity: {
        startsAt: '2026-10-01T00:00:00.000Z',
        endsAt: '2026-10-02T23:59:59.000Z'
      }
    }
  });
  const prePublicationTime = '2026-10-01T12:00:00.000Z';
  const assetSet = evaluateAssetEvidenceBundleSet([expiredBundle], prePublicationTime);
  assert.equal(assetSet.valid, true, 'the fixture is valid only before its rights expire');
  const candidate = governedVisualCandidate({
    assetEvidenceBundles: [expiredBundle],
    assetEvidenceAsOf: prePublicationTime
  });
  candidate.manifest.assets = [assetReference(expiredBundle)];
  rebindCandidateAssetSet(candidate, assetSet.assetSetSha256);

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'assetEvidenceAsOf',
        code: 'asset_evidence_time_before_publication',
        message: 'asset evidence must be evaluated at or after the effective publication decision'
      }
    ]
  });
});

test('blocks a grade-one package when an asset or its alternative treatment is not approved for grade one', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const gradeTwoBundle = criticalSvgBundle({
    asset: {
      ...criticalSvgBundle().asset,
      audience: {
        minGrade: 2,
        maxGrade: 8
      }
    },
    accessibility: {
      ...criticalSvgBundle().accessibility,
      treatment: {
        ...criticalSvgBundle().accessibility.treatment,
        gradeRange: {
          minGrade: 2,
          maxGrade: 8
        }
      }
    }
  });
  const assetSet = evaluateAssetEvidenceBundleSet([gradeTwoBundle], ASSET_EVALUATION_TIME);
  assert.equal(assetSet.valid, true, 'the fixture is structurally valid before grade compatibility is evaluated');
  const candidate = governedVisualCandidate({ assetEvidenceBundles: [gradeTwoBundle] });
  candidate.manifest.assets = [assetReference(gradeTwoBundle)];
  rebindCandidateAssetSet(candidate, assetSet.assetSetSha256);

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'assetEvidenceBundles[0].asset.audience',
        code: 'asset_audience_grade_mismatch',
        message: 'asset audience range must cover the manifest curriculum grade'
      },
      {
        path: 'assetEvidenceBundles[0].accessibility.treatment.gradeRange',
        code: 'accessibility_grade_range_mismatch',
        message: 'accessibility treatment range must cover the manifest curriculum grade'
      }
    ]
  });
});

test('marks a governed critical SVG package delivery_eligible only when every asset evidence reference is bound to the approved decision chain', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedVisualCandidate();

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: true,
    nextState: 'delivery_eligible',
    errors: []
  });
});

test('blocks media delivery when a reviewed accessibility treatment changes after the immutable decision chain was approved', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedVisualCandidate({
    assetEvidenceBundles: [criticalSvgBundle({
      accessibility: {
        ...criticalSvgBundle().accessibility,
        treatment: {
          shortAlt: 'Dört farklı renkte balon.',
          longDescription: 'Sayı sayma etkinliğinde kullanılan, soldan sağa dizilmiş dört balon çizimi.',
          gradeRange: {
            minGrade: 1,
            maxGrade: 1
          }
        }
      }
    })]
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'assetEvidenceBundles',
        code: 'asset_set_sha256_mismatch',
        message: 'recomputed asset-evidence set must match the manifest content revision'
      }
    ]
  });
});

test('blocks media delivery when a manifest asset reference does not match its evidence bundle byte hash', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedVisualCandidate();
  candidate.manifest.assets[0].byteSha256 = '9'.repeat(64);

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'manifest.assets[0].byteSha256',
        code: 'asset_reference_mismatch',
        message: 'manifest asset reference must match its immutable asset evidence bundle'
      }
    ]
  });
});

test('blocks media delivery when the rights review omits the exact rights record for a referenced asset', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const candidate = governedVisualCandidate();
  candidate.releaseCandidate.decisions[2].evidenceRefs = [{
    evidenceId: 'RIGHTS-UNRELATED-001',
    evidenceKind: 'rights_record',
    sha256: '7'.repeat(64)
  }];

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.deepEqual(result, {
    eligible: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'releaseCandidate.decisions[2].evidenceRefs',
        code: 'asset_review_evidence_missing',
        message: 'rights review must include the exact asset rights record evidence'
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

test('blocks a publication history whose decision sequence conflicts with the later withdrawal timestamp', async () => {
  const { evaluateGovernedStudentDeliveryEligibility } = await loadEligibilityGate();
  const publishedAtSequenceTwo = publicationDecision({
    decisionId: 'PUB-G1-TR-002',
    decisionSequence: 2,
    decidedAt: '2026-10-03T02:00:00.000Z'
  });
  const withdrawnLaterButAtSequenceOne = publicationDecision({
    decisionId: 'PUB-G1-TR-001',
    outcome: 'withdrawn',
    decisionSequence: 1,
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
    publicationDecisionHistory: [withdrawnLaterButAtSequenceOne, publishedAtSequenceTwo]
  });

  const result = evaluateGovernedStudentDeliveryEligibility(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'publication_history_timestamp_regression'), true);
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
        sha256: 'e'.repeat(64),
        assetSetSha256: EMPTY_ASSET_SET_SHA256
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
