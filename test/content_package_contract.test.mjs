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
    contractVersion: '1.0.0',
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
      revisionId: 'REV-G1-TR-001',
      lifecycleState: 'published',
      academicReviewId: 'AR-001',
      rightsReviewId: 'RR-001',
      accessibilityReviewId: 'AC-001'
    },
    assets: [
      {
        assetId: 'ASSET-ILLUSTRATION-001',
        mediaType: 'image/svg+xml',
        sha256: 'a'.repeat(64),
        rightsStatus: 'verified',
        rightsRecordId: 'RIGHTS-001',
        altText: 'Üç farklı renkte balon',
        longDescription: 'Sayı sayma etkinliğinde kullanılan üç balon çizimi.'
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

test('accepts a published student package only with ownership, canonical curriculum, reviews, and an accessible rights-verified visual', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();

  const result = validateStudentContentPackageManifest(publishableManifest());

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects a published student package whose visual lacks verified rights or accessibility evidence', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();
  const manifest = publishableManifest({
    assets: [
      {
        assetId: 'ASSET-ILLUSTRATION-001',
        mediaType: 'image/svg+xml',
        sha256: 'not-a-sha256',
        rightsStatus: 'pending',
        rightsRecordId: '',
        altText: '',
        longDescription: ''
      }
    ]
  });

  const result = validateStudentContentPackageManifest(manifest);

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.map(error => error.code),
    [
      'asset_sha256_invalid',
      'asset_rights_not_verified',
      'asset_rights_record_missing',
      'asset_alt_text_missing',
      'asset_long_description_missing'
    ]
  );
});

test('rejects answer-bearing fields and raw HTML from a student content package', async () => {
  const { validateStudentContentPackageManifest } = await loadContract();
  const manifest = publishableManifest({
    content: {
      revisionId: 'REV-G1-TR-001',
      lifecycleState: 'published',
      academicReviewId: 'AR-001',
      rightsReviewId: 'RR-001',
      accessibilityReviewId: 'AC-001',
      answerKey: 'A'
    },
    assets: [
      {
        assetId: 'ASSET-ILLUSTRATION-001',
        mediaType: 'image/svg+xml',
        sha256: 'a'.repeat(64),
        rightsStatus: 'verified',
        rightsRecordId: 'RIGHTS-001',
        altText: 'Üç farklı renkte balon',
        longDescription: 'Sayı sayma etkinliğinde kullanılan üç balon çizimi.',
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
