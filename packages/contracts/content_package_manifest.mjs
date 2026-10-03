/**
 * Student-delivery content package contract.
 *
 * This validates the minimum metadata required before a package can cross a
 * student-facing boundary. It does not prove academic correctness, copyright
 * ownership, or legal compliance; those claims still require the referenced
 * human reviews and source records.
 */

import { findCanonicalCurriculumOutcome } from '../reference-data/curriculum_registry.mjs';

export const CONTENT_PACKAGE_CONTRACT_VERSION = '3.0.0';

const FORBIDDEN_STUDENT_FIELDS = new Set([
  'answerKey',
  'correctAnswer',
  'correctOption',
  'correct_option',
  'detailedSolution',
  'rawHtml'
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/iu.test(value);
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function requireString(errors, value, path, code, message) {
  if (!isNonEmptyString(value)) {
    addError(errors, path, code, message);
  }
}

function collectForbiddenStudentFields(value, path, errors, visited = new WeakSet()) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (visited.has(value)) {
    return;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectForbiddenStudentFields(item, `${path}[${index}]`, errors, visited);
    });
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = path ? `${path}.${key}` : key;
    if (FORBIDDEN_STUDENT_FIELDS.has(key)) {
      addError(
        errors,
        nestedPath,
        'forbidden_student_field',
        `${key} cannot be included in a student content package`
      );
    }
    collectForbiddenStudentFields(nestedValue, nestedPath, errors, visited);
  }
}

function validateGovernance(governance, errors) {
  if (!isRecord(governance)) {
    addError(errors, 'dataGovernance', 'governance_missing', 'dataGovernance is required');
    return;
  }

  requireString(errors, governance.owner, 'dataGovernance.owner', 'owner_missing', 'A data owner is required');
  requireString(errors, governance.steward, 'dataGovernance.steward', 'steward_missing', 'A data steward is required');
  requireString(errors, governance.classification, 'dataGovernance.classification', 'classification_missing', 'A classification is required');
  requireString(errors, governance.processingPurpose, 'dataGovernance.processingPurpose', 'processing_purpose_missing', 'A processing purpose is required');
  requireString(errors, governance.retentionClass, 'dataGovernance.retentionClass', 'retention_class_missing', 'A retention class is required');

  if (!Array.isArray(governance.sourceLineage) || governance.sourceLineage.length === 0) {
    addError(errors, 'dataGovernance.sourceLineage', 'source_lineage_missing', 'At least one source lineage record is required');
    return;
  }

  governance.sourceLineage.forEach((record, index) => {
    const path = `dataGovernance.sourceLineage[${index}]`;
    if (!isRecord(record)) {
      addError(errors, path, 'source_lineage_invalid', 'A lineage record must be an object');
      return;
    }
    requireString(errors, record.sourceId, `${path}.sourceId`, 'source_id_missing', 'A source identifier is required');
    requireString(errors, record.kind, `${path}.kind`, 'source_kind_missing', 'A source kind is required');
    requireString(errors, record.retrievedAt, `${path}.retrievedAt`, 'source_retrieved_at_missing', 'A retrieval timestamp is required');
  });
}

function validateCurriculum(curriculum, errors) {
  if (!isRecord(curriculum)) {
    addError(errors, 'curriculum', 'curriculum_missing', 'Curriculum metadata is required');
    return;
  }

  requireString(errors, curriculum.registryEntryId, 'curriculum.registryEntryId', 'curriculum_registry_entry_id_missing', 'A curriculum registry entry identifier is required');
  requireString(errors, curriculum.programVersion, 'curriculum.programVersion', 'program_version_missing', 'A program version is required');
  if (!Number.isInteger(curriculum.grade) || curriculum.grade < 1 || curriculum.grade > 8) {
    addError(errors, 'curriculum.grade', 'curriculum_grade_invalid', 'A grade from 1 through 8 is required');
  }
  requireString(errors, curriculum.courseKey, 'curriculum.courseKey', 'curriculum_course_key_missing', 'A course key is required');
  requireString(errors, curriculum.outcomeCode, 'curriculum.outcomeCode', 'outcome_code_missing', 'An outcome code is required');
  if (curriculum.verificationState !== 'canonical_verified') {
    addError(errors, 'curriculum.verificationState', 'curriculum_not_verified', 'Curriculum must be canonically verified before student delivery');
  }
}

function validateContentReview(content, errors) {
  if (!isRecord(content)) {
    addError(errors, 'content', 'content_missing', 'Content metadata is required');
    return;
  }

  requireString(errors, content.contentItemId, 'content.contentItemId', 'content_item_id_missing', 'A content item identifier is required');
  requireString(errors, content.revisionId, 'content.revisionId', 'revision_id_missing', 'A content revision identifier is required');
  if (!isSha256(content.revisionSha256)) {
    addError(errors, 'content.revisionSha256', 'revision_sha256_invalid', 'A content revision requires a SHA-256 hash');
  }
  if (!isSha256(content.assetSetSha256)) {
    addError(errors, 'content.assetSetSha256', 'asset_set_sha256_invalid', 'A content revision requires an asset-evidence set SHA-256 hash');
  }
  requireString(errors, content.authorId, 'content.authorId', 'content_author_missing', 'A content author identifier is required');
  if (content.lifecycleState !== 'published') {
    addError(errors, 'content.lifecycleState', 'content_not_published', 'Only published content can be packaged for students');
  }
  requireString(errors, content.academicReviewId, 'content.academicReviewId', 'academic_review_missing', 'Academic review evidence is required');
  requireString(errors, content.assessmentReviewId, 'content.assessmentReviewId', 'assessment_review_missing', 'Assessment review evidence is required');
  requireString(errors, content.rightsReviewId, 'content.rightsReviewId', 'rights_review_missing', 'Rights review evidence is required');
  requireString(errors, content.accessibilityReviewId, 'content.accessibilityReviewId', 'accessibility_review_missing', 'Accessibility review evidence is required');
  requireString(errors, content.publicationDecisionId, 'content.publicationDecisionId', 'publication_decision_missing', 'A publication decision identifier is required');
}

function validateAsset(asset, index, errors) {
  const path = `assets[${index}]`;
  if (!isRecord(asset)) {
    addError(errors, path, 'asset_invalid', 'An asset must be an object');
    return;
  }

  requireString(errors, asset.assetEvidenceBundleId, `${path}.assetEvidenceBundleId`, 'asset_evidence_bundle_id_missing', 'An asset evidence bundle identifier is required');
  requireString(errors, asset.assetId, `${path}.assetId`, 'asset_id_missing', 'An asset identifier is required');
  requireString(errors, asset.revisionId, `${path}.revisionId`, 'asset_revision_id_missing', 'An asset revision identifier is required');
  requireString(errors, asset.mediaType, `${path}.mediaType`, 'asset_media_type_missing', 'An asset media type is required');
  if (!isSha256(asset.byteSha256)) {
    addError(errors, `${path}.byteSha256`, 'asset_byte_sha256_invalid', 'An asset byte SHA-256 is required');
  }
  requireString(errors, asset.deliveryProfile, `${path}.deliveryProfile`, 'asset_delivery_profile_missing', 'An asset delivery profile is required');
  requireString(errors, asset.provenanceRecordId, `${path}.provenanceRecordId`, 'asset_provenance_record_missing', 'An asset provenance record is required');
  if (!isSha256(asset.provenanceRecordSha256)) {
    addError(errors, `${path}.provenanceRecordSha256`, 'asset_provenance_record_sha256_invalid', 'An asset provenance record SHA-256 is required');
  }
  requireString(errors, asset.rightsRecordId, `${path}.rightsRecordId`, 'asset_rights_record_missing', 'An asset rights record is required');
  if (!isSha256(asset.rightsRecordSha256)) {
    addError(errors, `${path}.rightsRecordSha256`, 'asset_rights_record_sha256_invalid', 'An asset rights record SHA-256 is required');
  }
  requireString(errors, asset.accessibilityRecordId, `${path}.accessibilityRecordId`, 'asset_accessibility_record_missing', 'An asset accessibility record is required');
  if (!isSha256(asset.accessibilityRecordSha256)) {
    addError(errors, `${path}.accessibilityRecordSha256`, 'asset_accessibility_record_sha256_invalid', 'An accessibility record SHA-256 is required');
  }
}

/**
 * Validate a manifest without persisting it or making external calls.
 */
export function validateStudentContentPackageManifest(manifest) {
  const errors = [];

  if (!isRecord(manifest)) {
    return {
      valid: false,
      errors: [{ path: 'manifest', code: 'manifest_invalid', message: 'A manifest object is required' }]
    };
  }

  collectForbiddenStudentFields(manifest, '', errors);

  if (manifest.contractVersion !== CONTENT_PACKAGE_CONTRACT_VERSION) {
    addError(errors, 'contractVersion', 'contract_version_unsupported', `Expected contract version ${CONTENT_PACKAGE_CONTRACT_VERSION}`);
  }
  requireString(errors, manifest.packageId, 'packageId', 'package_id_missing', 'A package identifier is required');

  validateGovernance(manifest.dataGovernance, errors);
  validateCurriculum(manifest.curriculum, errors);
  validateContentReview(manifest.content, errors);

  if (!Array.isArray(manifest.assets)) {
    addError(errors, 'assets', 'assets_invalid', 'Assets must be an array');
  } else {
    const seenAssetEvidenceBundleIds = new Set();
    manifest.assets.forEach((asset, index) => {
      const bundleId = asset?.assetEvidenceBundleId;
      if (isNonEmptyString(bundleId)) {
        if (seenAssetEvidenceBundleIds.has(bundleId)) {
          addError(
            errors,
            `assets[${index}].assetEvidenceBundleId`,
            'asset_evidence_bundle_duplicate',
            'each asset evidence bundle may be referenced only once per student package'
          );
        }
        seenAssetEvidenceBundleIds.add(bundleId);
      }
      validateAsset(asset, index, errors);
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a package against a supplied curriculum registry snapshot. A
 * self-declared canonical state is not enough to cross the student boundary.
 * This function is pure and never fetches, writes, or publishes anything.
 */
export function validateStudentDeliveryPackage(manifest, curriculumEntries) {
  const manifestValidation = validateStudentContentPackageManifest(manifest);
  if (!manifestValidation.valid) {
    return manifestValidation;
  }

  const canonicalEntry = findCanonicalCurriculumOutcome(curriculumEntries, {
    registryEntryId: manifest.curriculum.registryEntryId,
    programVersion: manifest.curriculum.programVersion,
    grade: manifest.curriculum.grade,
    courseKey: manifest.curriculum.courseKey,
    outcomeCode: manifest.curriculum.outcomeCode
  });

  if (!canonicalEntry) {
    return {
      valid: false,
      errors: [
        {
          path: 'curriculum',
          code: 'curriculum_registry_no_canonical_match',
          message: 'A matching canonically verified curriculum registry entry is required'
        }
      ]
    };
  }

  return { valid: true, errors: [] };
}
