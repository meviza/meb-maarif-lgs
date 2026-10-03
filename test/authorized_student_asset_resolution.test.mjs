import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import { evaluateAssetEvidenceBundleSet } from '../packages/contracts/asset_evidence_bundle.mjs';

const RESOLUTION_MODULE_URL = new URL('../packages/contracts/authorized_student_asset_resolution.mjs', import.meta.url);
const OBSERVED_AT = '2026-10-03T04:00:00.000Z';
const TENANT_ID = 'tenant-ankara-001';
const ACTOR_PSEUDONYM = 'learner_abcdef123456';

async function loadResolutionContract() {
  // Break caught: a resolver could combine unbound governance, access, and
  // byte assertions, then hand a student an asset that was never authorized
  // for the resolved published package.
  assert.equal(
    fs.existsSync(RESOLUTION_MODULE_URL),
    true,
    'student asset handoff requires a server-resolved binding contract'
  );
  return import(RESOLUTION_MODULE_URL.href);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function targetDigest(target) {
  return sha256(canonicalJson({
    packageId: target.packageId,
    contentItemId: target.contentItemId,
    contentRevisionId: target.contentRevisionId,
    revisionSha256: target.revisionSha256,
    assetSetSha256: target.assetSetSha256,
    assetEvidenceBundleId: target.assetEvidenceBundleId,
    assetId: target.assetId,
    assetRevisionId: target.assetRevisionId,
    byteSha256: target.byteSha256,
    mediaType: target.mediaType,
    deliveryProfile: target.deliveryProfile
  }));
}

function authorizationSnapshotDigest(snapshot) {
  const { decisionSha256, ...payload } = snapshot;
  return sha256(canonicalJson(payload));
}

function governanceSnapshotDigest(snapshot, publicationDecisionHistory) {
  const { snapshotSha256, ...payload } = snapshot;
  const orderedHistory = [...publicationDecisionHistory].sort((left, right) => {
    if (left.decisionSequence !== right.decisionSequence) {
      return left.decisionSequence - right.decisionSequence;
    }
    return left.decisionId.localeCompare(right.decisionId, 'en');
  });
  return sha256(canonicalJson({
    snapshot: payload,
    publicationDecisionHistory: orderedHistory
  }));
}

function entitlementSnapshotDigest(snapshot) {
  const { entitlementSha256, ...payload } = snapshot;
  return sha256(canonicalJson(payload));
}

function criticalSvgBundle() {
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
      audience: { minGrade: 1, maxGrade: 1 },
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
      attribution: { required: false, text: null }
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
        gradeRange: { minGrade: 1, maxGrade: 1 }
      }
    },
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-asset-steward',
      classification: 'educational-asset-metadata',
      processingPurpose: 'student-learning-delivery',
      retentionClass: 'content-lifecycle',
      sourceLineage: ['SRC-ORIGINAL-001']
    }
  };
}

function resolvedRequest() {
  const bundle = criticalSvgBundle();
  const assetSet = evaluateAssetEvidenceBundleSet([bundle], OBSERVED_AT);
  assert.equal(assetSet.valid, true, 'fixture asset evidence must be valid');
  const assetSetSha256 = assetSet.assetSetSha256;
  const revision = {
    contentItemId: 'CONTENT-G1-TR-001',
    revisionId: 'REV-G1-TR-001',
    sha256: 'a'.repeat(64),
    assetSetSha256
  };
  const reviewDetails = {
    academic: { role: 'academic_reviewer', evidenceRefs: [{ evidenceId: 'CURR-G1-TR-001', evidenceKind: 'curriculum_registry_entry', sha256: 'b'.repeat(64) }] },
    assessment: { role: 'assessment_reviewer', evidenceRefs: [{ evidenceId: 'RUBRIC-G1-TR-001', evidenceKind: 'assessment_rubric', sha256: 'c'.repeat(64) }] },
    rights: { role: 'rights_reviewer', evidenceRefs: [{ evidenceId: bundle.rights.rightsRecordId, evidenceKind: 'rights_record', sha256: bundle.rights.rightsRecordSha256 }] },
    accessibility: { role: 'accessibility_reviewer', evidenceRefs: [{ evidenceId: bundle.accessibility.accessibilityRecordId, evidenceKind: 'accessibility_record', sha256: bundle.accessibility.accessibilityRecordSha256 }] }
  };
  const decisions = Object.entries(reviewDetails).map(([discipline, detail]) => ({
    contractVersion: '2.0.0',
    decisionId: `DEC-${discipline.toUpperCase()}-001`,
    reviewedRevision: revision,
    contentAuthorId: 'content-editor-001',
    discipline,
    outcome: 'approved',
    decidedAt: '2026-10-03T01:00:00.000Z',
    reviewPolicyVersion: 'content-review-v1',
    rationale: `${discipline} incelemesi tamamlandı.`,
    reviewer: { reviewerId: `${discipline}-reviewer-001`, role: detail.role },
    evidenceRefs: detail.evidenceRefs,
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-data-steward',
      classification: 'governance-record',
      processingPurpose: 'content-review-traceability',
      retentionClass: 'content-lifecycle'
    }
  }));
  const publicationDecision = {
    contractVersion: '3.0.0',
    decisionId: 'PUB-G1-TR-001',
    targetRevision: revision,
    contentAuthorId: 'content-editor-001',
    outcome: 'published',
    decisionSequence: 1,
    decidedAt: '2026-10-03T02:00:00.000Z',
    publicationPolicyVersion: 'content-publication-v1',
    rationale: 'Dört insan incelemesi, geri alma planı ve teslim kapsamı doğrulandı.',
    publisher: { publisherId: 'publisher-001', role: 'content_publisher' },
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
    }
  };
  const assetReference = {
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
  const manifest = {
    contractVersion: '3.0.0',
    packageId: 'CP-G1-TR-001',
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-data-steward',
      classification: 'educational-content',
      processingPurpose: 'student-learning-delivery',
      retentionClass: 'content-lifecycle',
      sourceLineage: [{ sourceId: 'SRC-ORIGINAL-001', kind: 'original', retrievedAt: '2026-10-03T00:00:00.000Z' }]
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
      contentItemId: revision.contentItemId,
      revisionId: revision.revisionId,
      revisionSha256: revision.sha256,
      assetSetSha256,
      authorId: 'content-editor-001',
      lifecycleState: 'published',
      academicReviewId: 'DEC-ACADEMIC-001',
      assessmentReviewId: 'DEC-ASSESSMENT-001',
      rightsReviewId: 'DEC-RIGHTS-001',
      accessibilityReviewId: 'DEC-ACCESSIBILITY-001',
      publicationDecisionId: publicationDecision.decisionId
    },
    assets: [assetReference]
  };
  const target = {
    packageId: manifest.packageId,
    contentItemId: revision.contentItemId,
    contentRevisionId: revision.revisionId,
    revisionSha256: revision.sha256,
    assetSetSha256,
    assetEvidenceBundleId: bundle.bundleId,
    assetId: bundle.asset.assetId,
    assetRevisionId: bundle.asset.revisionId,
    byteSha256: bundle.asset.byteSha256,
    mediaType: bundle.asset.mediaType,
    deliveryProfile: bundle.asset.deliveryProfile
  };
  const authorizationSnapshot = {
    decisionId: 'AUTH-G1-000001',
    decisionSha256: null,
    policyVersion: 'access-policy-v1',
    action: 'read_student_content_asset',
    effect: 'allow',
    tenantId: TENANT_ID,
    actorPseudonym: ACTOR_PSEUDONYM,
    purpose: 'student_learning_delivery',
    targetSha256: targetDigest(target),
    issuedAt: '2026-10-03T03:59:00.000Z',
    expiresAt: '2026-10-03T04:30:00.000Z'
  };
  authorizationSnapshot.decisionSha256 = authorizationSnapshotDigest(authorizationSnapshot);
  const governanceSnapshot = {
    snapshotId: 'GOVSNAP-G1-000001',
    snapshotSha256: null,
    snapshotSequence: 8,
    capturedAt: '2026-10-03T03:59:30.000Z',
    effectivePublicationDecisionId: publicationDecision.decisionId,
    effectivePublicationSequence: publicationDecision.decisionSequence,
    outcome: 'published',
    revision
  };
  governanceSnapshot.snapshotSha256 = governanceSnapshotDigest(governanceSnapshot, [publicationDecision]);
  const entitlementSnapshot = {
    entitlementId: 'ENT-G1-000001',
    entitlementSha256: null,
    entitlementPolicyVersion: 'learner-assignment-v1',
    state: 'active',
    tenantId: TENANT_ID,
    learnerPseudonym: ACTOR_PSEUDONYM,
    packageId: target.packageId,
    contentItemId: target.contentItemId,
    contentRevisionId: target.contentRevisionId,
    revisionSha256: target.revisionSha256,
    assetSetSha256: target.assetSetSha256,
    purpose: 'student_learning_delivery',
    issuedAt: '2026-10-03T03:58:00.000Z',
    expiresAt: '2026-10-03T05:00:00.000Z'
  };
  entitlementSnapshot.entitlementSha256 = entitlementSnapshotDigest(entitlementSnapshot);
  return {
    resolverContext: {
      contractVersion: '1.0.0',
      invocationId: 'RESOLVE-G1-000001',
      observedAt: OBSERVED_AT,
      tenantId: TENANT_ID,
      actorPseudonym: ACTOR_PSEUDONYM,
      actorRole: 'student',
      purpose: 'student_learning_delivery',
      timeSourceId: 'server-clock-001'
    },
    target,
    authorizationSnapshot,
    entitlementSnapshot,
    governanceSnapshot,
    byteIntegrityEvidence: {
      byteSnapshotId: 'BYTE-G1-000001',
      verificationState: 'byte_integrity_verified',
      verifiedAt: '2026-10-03T03:59:45.000Z',
      bundleId: bundle.bundleId,
      assetId: bundle.asset.assetId,
      revisionId: bundle.asset.revisionId,
      mediaType: bundle.asset.mediaType,
      deliveryProfile: bundle.asset.deliveryProfile,
      byteSha256: bundle.asset.byteSha256
    },
    accessRequest: {
      actor: { tenantId: TENANT_ID, subjectId: ACTOR_PSEUDONYM, role: 'student' },
      resource: {
        tenantId: TENANT_ID,
        type: 'student_content_asset',
        learnerId: ACTOR_PSEUDONYM,
        packageId: manifest.packageId
      },
      action: 'read'
    },
    serverResolvedRecords: {
      manifest,
      curriculumEntries: [{
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
        }
      }],
      releaseCandidate: {
        revision: {
          ...revision,
          lifecycleState: 'approved',
          authorId: 'content-editor-001'
        },
        decisions,
        release: {
          releaseRequestId: 'REL-G1-TR-001',
          requestedBy: 'release-manager-001',
          rollbackPlanId: 'ROLLBACK-G1-TR-001'
        }
      },
      publicationDecisionHistory: [publicationDecision],
      assetEvidenceBundles: [bundle]
    }
  };
}

test('binds a server-resolved student asset handoff to one published package, target, access decision, byte identity, and minimal audit intent', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: true,
    nextState: 'handoff_eligible',
    errors: [],
    auditIntent: {
      eventType: 'student_asset_handoff_eligible',
      invocationId: 'RESOLVE-G1-000001',
      observedAt: OBSERVED_AT,
      tenantId: TENANT_ID,
      actorPseudonym: ACTOR_PSEUDONYM,
      purpose: 'student_learning_delivery',
      target: request.target,
      targetSha256: targetDigest(request.target),
      authorizationDecisionId: 'AUTH-G1-000001',
      authorizationDecisionSha256: request.authorizationSnapshot.decisionSha256,
      authorizationPolicyVersion: 'access-policy-v1',
      entitlementId: 'ENT-G1-000001',
      entitlementSha256: request.entitlementSnapshot.entitlementSha256,
      entitlementPolicyVersion: 'learner-assignment-v1',
      governanceSnapshotId: 'GOVSNAP-G1-000001',
      governanceSnapshotSha256: request.governanceSnapshot.snapshotSha256,
      governanceSnapshotSequence: 8,
      publicationDecisionId: 'PUB-G1-TR-001',
      byteSnapshotId: 'BYTE-G1-000001',
      timeSourceId: 'server-clock-001',
      outcome: 'handoff_eligible'
    }
  });
});

test('rejects a caller-provided asset evaluation time instead of allowing it to override the resolver observation time', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.serverResolvedRecords.assetEvidenceAsOf = '2026-10-01T00:00:00.000Z';

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'serverResolvedRecords.assetEvidenceAsOf',
      code: 'resolver_field_unsupported',
      message: 'this resolver boundary does not accept unsupported fields'
    }]
  });
});

test('blocks a handoff when the server-resolved authorization expires before the observation time', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.authorizationSnapshot.expiresAt = '2026-10-03T03:59:59.999Z';
  request.authorizationSnapshot.decisionSha256 = authorizationSnapshotDigest(request.authorizationSnapshot);

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'authorizationSnapshot.expiresAt',
      code: 'authorization_expired',
      message: 'authorization must remain valid at the resolver observation time'
    }]
  });
});

test('blocks an otherwise governed handoff when byte-integrity evidence is for a different byte revision', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.byteIntegrityEvidence.byteSha256 = '9'.repeat(64);

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'byteIntegrityEvidence.byteSha256',
      code: 'byte_integrity_target_mismatch',
      message: 'byte integrity evidence must match the resolved target'
    }]
  });
});

test('uses an unambiguous digest when two distinct target fields would collide under newline joining', async () => {
  const { calculateStudentAssetTargetSha256 } = await loadResolutionContract();
  const first = resolvedRequest().target;
  const second = structuredClone(first);
  first.packageId = 'CP-G1\nCONTENT';
  first.contentItemId = 'ITEM-001';
  second.packageId = 'CP-G1';
  second.contentItemId = 'CONTENT\nITEM-001';

  assert.notEqual(
    calculateStudentAssetTargetSha256(first),
    calculateStudentAssetTargetSha256(second),
    'distinct field boundaries must not share an authorization target digest'
  );
});

test('blocks an authorization snapshot whose SHA-256 does not bind its declared allow decision', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.authorizationSnapshot.decisionSha256 = '0'.repeat(64);

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'authorizationSnapshot.decisionSha256',
      code: 'authorization_snapshot_hash_mismatch',
      message: 'authorization snapshot SHA-256 must bind its declared fields'
    }]
  });
});

test('blocks a governance snapshot whose SHA-256 does not bind the resolved publication history', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.governanceSnapshot.snapshotSha256 = '0'.repeat(64);

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'governanceSnapshot.snapshotSha256',
      code: 'governance_snapshot_hash_mismatch',
      message: 'governance snapshot SHA-256 must bind its declared fields and publication history'
    }]
  });
});

test('requires a server-resolved learner entitlement before a student asset handoff can be eligible', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  delete request.entitlementSnapshot;

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'entitlementSnapshot',
      code: 'entitlement_snapshot_missing',
      message: 'a server-resolved learner entitlement snapshot is required'
    }]
  });
});

test('blocks an entitlement that names a different package even when the coarse student access policy allows the learner', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.entitlementSnapshot.packageId = 'CP-G1-TR-OTHER';
  request.entitlementSnapshot.entitlementSha256 = entitlementSnapshotDigest(request.entitlementSnapshot);

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'entitlementSnapshot.packageId',
      code: 'entitlement_target_mismatch',
      message: 'learner entitlement must match the resolved package target'
    }]
  });
});

test('blocks an entitlement snapshot whose SHA-256 does not bind its learner-package assignment', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.entitlementSnapshot.entitlementSha256 = '0'.repeat(64);

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'entitlementSnapshot.entitlementSha256',
      code: 'entitlement_snapshot_hash_mismatch',
      message: 'learner entitlement SHA-256 must bind its declared assignment fields'
    }]
  });
});

test('returns an independent audit target projection that cannot change when the resolver request is later mutated', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  const expectedAssetId = request.target.assetId;

  const result = evaluateAuthorizedStudentAssetResolution(request);
  request.target.assetId = 'ASSET-MUTATED-AFTER-EVALUATION';

  assert.equal(result.handoffEligible, true);
  assert.notStrictEqual(result.auditIntent.target, request.target);
  assert.equal(result.auditIntent.target.assetId, expectedAssetId);
});

test('blocks an audit snapshot that identifies an older published decision instead of the effective publication decision', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  const effectiveDecision = request.serverResolvedRecords.publicationDecisionHistory[0];
  const olderDecision = structuredClone(effectiveDecision);
  olderDecision.decisionId = 'PUB-G1-TR-OLD';
  olderDecision.decisionSequence = 1;
  effectiveDecision.decisionId = 'PUB-G1-TR-002';
  effectiveDecision.decisionSequence = 2;
  request.serverResolvedRecords.manifest.content.publicationDecisionId = effectiveDecision.decisionId;
  request.governanceSnapshot.effectivePublicationDecisionId = olderDecision.decisionId;
  request.governanceSnapshot.effectivePublicationSequence = olderDecision.decisionSequence;
  request.serverResolvedRecords.publicationDecisionHistory = [olderDecision, effectiveDecision];
  request.governanceSnapshot.snapshotSha256 = governanceSnapshotDigest(
    request.governanceSnapshot,
    request.serverResolvedRecords.publicationDecisionHistory
  );

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'governanceSnapshot',
      code: 'governance_snapshot_not_effective',
      message: 'governance snapshot must identify the effective publication decision for the resolved package'
    }]
  });
});

test('rejects a resolver context whose required fields are inherited through a prototype instead of supplied as a plain record', async () => {
  const { evaluateAuthorizedStudentAssetResolution } = await loadResolutionContract();
  const request = resolvedRequest();
  request.resolverContext = Object.create(request.resolverContext);

  const result = evaluateAuthorizedStudentAssetResolution(request);

  assert.deepEqual(result, {
    handoffEligible: false,
    nextState: 'blocked',
    errors: [{
      path: 'resolverContext',
      code: 'resolver_context_missing',
      message: 'a server-resolved context is required'
    }]
  });
});
