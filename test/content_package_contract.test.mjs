import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const CONTRACT_MODULE_URL = new URL('../packages/contracts/content_package_manifest.mjs', import.meta.url);

async function loadContract() {
  // Break caught: removing the contract or returning to unvalidated delivery
  // must prevent the package from being accepted.
  assert.equal(
    fs.existsSync(CONTRACT_MODULE_URL),
    true,
    'student content packages require a DAMA contract validator'
  );
  return import(CONTRACT_MODULE_URL.href);
}

function publishableManifest(overrides = {}) {
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
      assetSetSha256: 'b'.repeat(64),
      authorId: 'content-editor-001',
      lifecycleState: 'published',
      academicReviewId: 'AR-001',
      assessmentReviewId: 'ASR-001',
      rightsReviewId: 'RR-001',
      accessibilityReviewId: 'AC-001',
      publicationDecisionId: 'PUB-G1-TR-001'
    },
    assets: [
      {
        assetEvidenceBundleId: 'AEB-G1-COUNTING-001',
        assetId: 'ASSET-ILLUSTRATION-001',
        revisionId: 'ASSETREV-ILLUSTRATION-001',
        mediaType: 'image/svg+xml',
        byteSha256: 'a'.repeat(64),
        deliveryProfile: 'sanitized_static_svg_v1',
        provenanceRecordId: 'PROV-001',
        provenanceRecordSha256: 'b'.repeat(64),
        rightsRecordId: 'RIGHTS-001',
        rightsRecordSha256: 'c'.repeat(64),
        accessibilityRecordId: 'ACC-001',
        accessibilityRecordSha256: 'd'.repeat(64)
      }
    ],
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
      sha256: 'b'.repeat(64)
    },
    canonicalReview: {
      reviewId: 'CURR-REVIEW-001',
      reviewerId: 'curriculum-steward-001',
      reviewedAt: '2026-10-03T01:00:00.000Z'
    },
    ...overrides
  };
}

test('accepts a v3 published student package only with immutable asset-evidence references and canonical curriculum', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();

  const result = validateStudentContentPackageManifest(publishableManifest());

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects the retired v2 package contract before it can reach a governed delivery gate', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();

  const result = validateStudentContentPackageManifest(publishableManifest({ contractVersion: '2.0.0' }));

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'contractVersion',
        code: 'contract_version_unsupported',
        message: 'Expected contract version 3.0.0'
      }
    ]
  });
});

test('requires immutable revision, immutable asset-set hash, all four review bindings, and a publication decision in a v3 package', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();
  const manifest = publishableManifest({
    content: {
      revisionId: 'REV-G1-TR-001',
      lifecycleState: 'published',
      academicReviewId: 'AR-001',
      rightsReviewId: 'RR-001',
      accessibilityReviewId: 'AC-001'
    }
  });

  const result = validateStudentContentPackageManifest(manifest);

  assert.deepEqual(
    result.errors.map(error => error.code),
    [
      'content_item_id_missing',
      'revision_sha256_invalid',
      'asset_set_sha256_invalid',
      'content_author_missing',
      'assessment_review_missing',
      'publication_decision_missing'
    ]
  );
});

test('rejects a published student package whose asset reference omits immutable evidence bindings', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();
  const manifest = publishableManifest({
    assets: [
      {
        assetId: 'ASSET-ILLUSTRATION-001',
        mediaType: 'image/svg+xml',
        byteSha256: 'not-a-sha256'
      }
    ]
  });

  const result = validateStudentContentPackageManifest(manifest);

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.map(error => error.code),
    [
      'asset_evidence_bundle_id_missing',
      'asset_revision_id_missing',
      'asset_byte_sha256_invalid',
      'asset_delivery_profile_missing',
      'asset_provenance_record_missing',
      'asset_provenance_record_sha256_invalid',
      'asset_rights_record_missing',
      'asset_rights_record_sha256_invalid',
      'asset_accessibility_record_missing',
      'asset_accessibility_record_sha256_invalid'
    ]
  );
});

test('rejects a package that references the same immutable asset evidence bundle more than once', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();
  const manifest = publishableManifest();
  manifest.assets.push({ ...manifest.assets[0] });

  const result = validateStudentContentPackageManifest(manifest);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'assets[1].assetEvidenceBundleId',
        code: 'asset_evidence_bundle_duplicate',
        message: 'each asset evidence bundle may be referenced only once per student package'
      }
    ]
  });
});

test('rejects answer-bearing fields and raw HTML from a student content package', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();
  const manifest = publishableManifest({
    content: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      revisionSha256: 'a'.repeat(64),
      assetSetSha256: 'b'.repeat(64),
      authorId: 'content-editor-001',
      lifecycleState: 'published',
      academicReviewId: 'AR-001',
      assessmentReviewId: 'ASR-001',
      rightsReviewId: 'RR-001',
      accessibilityReviewId: 'AC-001',
      publicationDecisionId: 'PUB-G1-TR-001',
      answerKey: 'A'
    },
    assets: [
      {
        assetEvidenceBundleId: 'AEB-G1-COUNTING-001',
        assetId: 'ASSET-ILLUSTRATION-001',
        revisionId: 'ASSETREV-ILLUSTRATION-001',
        mediaType: 'image/svg+xml',
        byteSha256: 'a'.repeat(64),
        deliveryProfile: 'sanitized_static_svg_v1',
        provenanceRecordId: 'PROV-001',
        provenanceRecordSha256: 'b'.repeat(64),
        rightsRecordId: 'RIGHTS-001',
        rightsRecordSha256: 'c'.repeat(64),
        accessibilityRecordId: 'ACC-001',
        accessibilityRecordSha256: 'd'.repeat(64),
        rawHtml: '<svg><script>alert(1)</script></svg>'
      }
    ]
  });

  const result = validateStudentContentPackageManifest(manifest);

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.map(error => error.code),
    ['forbidden_student_field', 'forbidden_student_field']
  );
  assert.deepEqual(
    result.errors.map(error => error.path),
    ['content.answerKey', 'assets[0].rawHtml']
  );
});

test('rejects a self-declared canonical curriculum that lacks stable registry scope', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();
  const manifest = publishableManifest({
    curriculum: {
      programVersion: 'fixture-program-v1',
      outcomeCode: 'FIXTURE.1.1',
      verificationState: 'canonical_verified'
    }
  });

  const result = validateStudentContentPackageManifest(manifest);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'curriculum.registryEntryId',
        code: 'curriculum_registry_entry_id_missing',
        message: 'A curriculum registry entry identifier is required'
      },
      {
        path: 'curriculum.grade',
        code: 'curriculum_grade_invalid',
        message: 'A grade from 1 through 8 is required'
      },
      {
        path: 'curriculum.courseKey',
        code: 'curriculum_course_key_missing',
        message: 'A course key is required'
      }
    ]
  });
});

test('accepts student delivery only when a package exactly matches a canonically verified curriculum registry entry', async () => {
  const { validateStudentDeliveryPackage } = await loadContract();
  assert.equal(typeof validateStudentDeliveryPackage, 'function');

  const result = validateStudentDeliveryPackage(
    publishableManifest(),
    [canonicalRegistryEntry()]
  );

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects a self-declared canonical package when its matching registry record is still unverified', async () => {
  const { validateStudentDeliveryPackage } = await loadContract();
  assert.equal(typeof validateStudentDeliveryPackage, 'function');
  const unverifiedEntry = canonicalRegistryEntry({
    canonicalReview: undefined,
    verificationState: 'unverified_import'
  });

  const result = validateStudentDeliveryPackage(
    publishableManifest(),
    [unverifiedEntry]
  );

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'curriculum',
        code: 'curriculum_registry_no_canonical_match',
        message: 'A matching canonically verified curriculum registry entry is required'
      }
    ]
  });
});
