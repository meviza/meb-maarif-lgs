/**
 * Pure, metadata-only evidence contract for one deliverable visual or audio
 * asset revision. It contains no raw media, signed URL, prompt, learner data,
 * or publishing behavior.
 */

import { createHash } from 'node:crypto';

export const ASSET_EVIDENCE_BUNDLE_CONTRACT_VERSION = '1.0.0';

const ASSET_ROLES = new Set([
  'decorative',
  'informative',
  'instructional_critical',
  'functional'
]);
const ORIGIN_METHODS = new Set([
  'original_human',
  'commissioned',
  'licensed_third_party',
  'ai_assisted',
  'ai_generated',
  'derivative'
]);
const RIGHTS_BASES = new Set([
  'owned',
  'commissioned',
  'license',
  'permission',
  'public_domain',
  'open_license'
]);
const DELIVERY_PROFILES_BY_MEDIA_TYPE = new Map([
  ['image/svg+xml', new Set(['sanitized_static_svg_v1'])],
  ['image/png', new Set(['static_raster_v1'])],
  ['image/jpeg', new Set(['static_raster_v1'])],
  ['image/webp', new Set(['static_raster_v1'])],
  ['audio/mpeg', new Set(['encoded_audio_v1'])],
  ['audio/ogg', new Set(['encoded_audio_v1'])],
  ['audio/wav', new Set(['encoded_audio_v1'])]
]);
const FORBIDDEN_ASSET_EVIDENCE_FIELDS = new Set([
  'answerKey',
  'correctAnswer',
  'correctOption',
  'correct_option',
  'detailedSolution',
  'rawHtml',
  'rawSvg',
  'rawImage',
  'rawAudio',
  'rawMedia',
  'mediaBytes',
  'mediaUrl',
  'assetUrl',
  'downloadUrl',
  'dataUrl',
  'dataUri',
  'base64',
  'prompt',
  'promptTemplate',
  'accessToken',
  'apiKey',
  'token',
  'authorization',
  'cookie',
  'signedUrl',
  'url',
  'uri',
  'sourceUrl'
]);
const BUNDLE_FIELDS = new Set(['contractVersion', 'bundleId', 'asset', 'rights', 'accessibility', 'dataGovernance']);
const ASSET_FIELDS = new Set(['assetId', 'revisionId', 'mediaType', 'byteSha256', 'deliveryProfile', 'role', 'audience', 'origin']);
const GRADE_RANGE_FIELDS = new Set(['minGrade', 'maxGrade']);
const ORIGIN_FIELDS = new Set(['method', 'subject', 'provenanceRecordId', 'provenanceRecordSha256', 'sourceLineageIds', 'derivedFrom', 'generation']);
const SUBJECT_FIELDS = new Set(['assetId', 'revisionId', 'mediaType', 'byteSha256']);
const DERIVATIVE_PARENT_FIELDS = new Set(['assetId', 'revisionId', 'byteSha256']);
const GENERATION_FIELDS = new Set(['toolId', 'toolVersion', 'evidenceId', 'sha256']);
const RIGHTS_FIELDS = new Set(['subject', 'rightsRecordId', 'rightsRecordSha256', 'basis', 'permittedUses', 'derivativeUseAllowed', 'validity', 'attribution']);
const VALIDITY_FIELDS = new Set(['startsAt', 'endsAt']);
const ATTRIBUTION_FIELDS = new Set(['required', 'text']);
const ACCESSIBILITY_FIELDS = new Set(['subject', 'accessibilityRecordId', 'accessibilityRecordSha256', 'language', 'modality', 'treatment']);
const TREATMENT_FIELDS = new Set(['shortAlt', 'longDescription', 'transcript', 'gradeRange']);
const GOVERNANCE_FIELDS = new Set(['owner', 'steward', 'classification', 'processingPurpose', 'retentionClass', 'sourceLineage']);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/iu.test(value);
}

function isSupportedGrade(value) {
  return Number.isInteger(value) && value >= 1 && value <= 8;
}

function isValidTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value)) {
    return false;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  const canonical = new Date(parsed).toISOString();
  return value === canonical || value === canonical.replace('.000Z', 'Z');
}

function isMediaType(value) {
  return typeof value === 'string' && DELIVERY_PROFILES_BY_MEDIA_TYPE.has(value);
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function requireString(errors, value, path, code, message) {
  if (!isNonEmptyString(value)) {
    addError(errors, path, code, message);
  }
}

function validateAllowedKeys(record, allowedFields, path, errors) {
  if (!isRecord(record)) return;
  Object.keys(record).forEach(key => {
    if (!allowedFields.has(key) && !FORBIDDEN_ASSET_EVIDENCE_FIELDS.has(key)) {
      const fieldPath = path ? `${path}.${key}` : key;
      addError(
        errors,
        fieldPath,
        'asset_evidence_field_unsupported',
        `${fieldPath} is not supported by the asset evidence contract`
      );
    }
  });
}

function validateKnownShape(bundle, errors) {
  validateAllowedKeys(bundle, BUNDLE_FIELDS, '', errors);
  validateAllowedKeys(bundle?.asset, ASSET_FIELDS, 'asset', errors);
  validateAllowedKeys(bundle?.asset?.audience, GRADE_RANGE_FIELDS, 'asset.audience', errors);
  validateAllowedKeys(bundle?.asset?.origin, ORIGIN_FIELDS, 'asset.origin', errors);
  validateAllowedKeys(bundle?.asset?.origin?.subject, SUBJECT_FIELDS, 'asset.origin.subject', errors);
  if (Array.isArray(bundle?.asset?.origin?.derivedFrom)) {
    bundle.asset.origin.derivedFrom.forEach((parent, index) => {
      validateAllowedKeys(parent, DERIVATIVE_PARENT_FIELDS, `asset.origin.derivedFrom[${index}]`, errors);
    });
  }
  validateAllowedKeys(bundle?.asset?.origin?.generation, GENERATION_FIELDS, 'asset.origin.generation', errors);

  validateAllowedKeys(bundle?.rights, RIGHTS_FIELDS, 'rights', errors);
  validateAllowedKeys(bundle?.rights?.subject, SUBJECT_FIELDS, 'rights.subject', errors);
  validateAllowedKeys(bundle?.rights?.validity, VALIDITY_FIELDS, 'rights.validity', errors);
  validateAllowedKeys(bundle?.rights?.attribution, ATTRIBUTION_FIELDS, 'rights.attribution', errors);

  validateAllowedKeys(bundle?.accessibility, ACCESSIBILITY_FIELDS, 'accessibility', errors);
  validateAllowedKeys(bundle?.accessibility?.subject, SUBJECT_FIELDS, 'accessibility.subject', errors);
  validateAllowedKeys(bundle?.accessibility?.treatment, TREATMENT_FIELDS, 'accessibility.treatment', errors);
  validateAllowedKeys(bundle?.accessibility?.treatment?.gradeRange, GRADE_RANGE_FIELDS, 'accessibility.treatment.gradeRange', errors);

  validateAllowedKeys(bundle?.dataGovernance, GOVERNANCE_FIELDS, 'dataGovernance', errors);
}

function validateGradeRange(range, path, code, message, errors) {
  if (!isRecord(range) || !isSupportedGrade(range.minGrade) || !isSupportedGrade(range.maxGrade) || range.minGrade > range.maxGrade) {
    addError(errors, path, code, message);
  }
}

function validateEvidenceSubject(subject, asset, path, errors) {
  if (!isRecord(subject)) {
    addError(errors, path, 'asset_evidence_subject_missing', 'asset evidence must identify the delivered asset byte revision');
    return;
  }

  const fields = ['assetId', 'revisionId', 'mediaType', 'byteSha256'];
  fields.forEach(field => {
    if (subject[field] !== asset?.[field]) {
      addError(
        errors,
        `${path}.${field}`,
        'asset_evidence_subject_mismatch',
        'asset evidence must target the delivered asset byte revision'
      );
    }
  });
}

function collectForbiddenFields(value, path, errors, visited = new WeakSet()) {
  if (!value || typeof value !== 'object') return;
  if (visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenFields(item, `${path}[${index}]`, errors, visited));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = path ? `${path}.${key}` : key;
    if (FORBIDDEN_ASSET_EVIDENCE_FIELDS.has(key)) {
      addError(
        errors,
        nestedPath,
        'forbidden_asset_evidence_field',
        `${key} cannot be included in an asset evidence bundle`
      );
    }
    collectForbiddenFields(nestedValue, nestedPath, errors, visited);
  }
}

function validateOrigin(origin, asset, errors) {
  if (!isRecord(origin)) {
    addError(errors, 'asset.origin', 'asset_origin_missing', 'asset provenance metadata is required');
    return;
  }

  if (!ORIGIN_METHODS.has(origin.method)) {
    addError(errors, 'asset.origin.method', 'asset_origin_method_invalid', 'a supported asset origin method is required');
  }
  validateEvidenceSubject(origin.subject, asset, 'asset.origin.subject', errors);
  requireString(errors, origin.provenanceRecordId, 'asset.origin.provenanceRecordId', 'provenance_record_id_missing', 'a provenance record identifier is required');
  if (!isSha256(origin.provenanceRecordSha256)) {
    addError(errors, 'asset.origin.provenanceRecordSha256', 'provenance_record_sha256_invalid', 'a provenance record requires a SHA-256 hash');
  }
  if (!Array.isArray(origin.sourceLineageIds) || origin.sourceLineageIds.length === 0 || origin.sourceLineageIds.some(value => !isNonEmptyString(value))) {
    addError(errors, 'asset.origin.sourceLineageIds', 'asset_source_lineage_missing', 'at least one source lineage identifier is required');
  }

  if (origin.method === 'derivative') {
    if (!Array.isArray(origin.derivedFrom) || origin.derivedFrom.length === 0) {
      addError(errors, 'asset.origin.derivedFrom', 'asset_derivative_parent_missing', 'a derivative asset requires at least one parent asset revision');
    } else {
      origin.derivedFrom.forEach((parent, index) => {
        const path = `asset.origin.derivedFrom[${index}]`;
        if (!isRecord(parent)) {
          addError(errors, path, 'asset_derivative_parent_invalid', 'a derivative parent must be an object');
          return;
        }
        requireString(errors, parent.assetId, `${path}.assetId`, 'asset_derivative_parent_id_missing', 'a derivative parent asset identifier is required');
        requireString(errors, parent.revisionId, `${path}.revisionId`, 'asset_derivative_parent_revision_missing', 'a derivative parent revision identifier is required');
        if (!isSha256(parent.byteSha256)) {
          addError(errors, `${path}.byteSha256`, 'asset_derivative_parent_sha256_invalid', 'a derivative parent byte SHA-256 is required');
        }
      });
    }
  }

  if (origin.method === 'ai_assisted' || origin.method === 'ai_generated') {
    if (!isRecord(origin.generation)) {
      addError(errors, 'asset.origin.generation', 'asset_generation_evidence_missing', 'an AI-derived asset requires prompt-free generation evidence');
    } else {
      requireString(errors, origin.generation.toolId, 'asset.origin.generation.toolId', 'generation_tool_id_missing', 'a generation tool identifier is required');
      requireString(errors, origin.generation.toolVersion, 'asset.origin.generation.toolVersion', 'generation_tool_version_missing', 'a generation tool version is required');
      requireString(errors, origin.generation.evidenceId, 'asset.origin.generation.evidenceId', 'generation_evidence_id_missing', 'a generation evidence identifier is required');
      if (!isSha256(origin.generation.sha256)) {
        addError(errors, 'asset.origin.generation.sha256', 'generation_evidence_sha256_invalid', 'a generation evidence SHA-256 is required');
      }
    }
  }
}

function validateAsset(asset, errors) {
  if (!isRecord(asset)) {
    addError(errors, 'asset', 'asset_missing', 'asset metadata is required');
    return;
  }

  requireString(errors, asset.assetId, 'asset.assetId', 'asset_id_missing', 'an asset identifier is required');
  requireString(errors, asset.revisionId, 'asset.revisionId', 'asset_revision_id_missing', 'an asset revision identifier is required');
  if (!isMediaType(asset.mediaType)) {
    addError(errors, 'asset.mediaType', 'asset_media_type_invalid', 'only approved image or audio media types are supported by this contract');
  } else if (!DELIVERY_PROFILES_BY_MEDIA_TYPE.get(asset.mediaType).has(asset.deliveryProfile)) {
    addError(errors, 'asset.deliveryProfile', 'asset_delivery_profile_invalid', 'asset media type requires an approved delivery profile');
  }
  if (!isSha256(asset.byteSha256)) {
    addError(errors, 'asset.byteSha256', 'asset_byte_sha256_invalid', 'an asset byte SHA-256 is required');
  }
  if (!ASSET_ROLES.has(asset.role)) {
    addError(errors, 'asset.role', 'asset_role_invalid', 'a supported asset role is required');
  }
  validateGradeRange(
    asset.audience,
    'asset.audience',
    'asset_audience_invalid',
    'an asset audience grade range from 1 through 8 is required',
    errors
  );
  validateOrigin(asset.origin, asset, errors);
}

function validateRights(rights, asset, errors) {
  if (!isRecord(rights)) {
    addError(errors, 'rights', 'asset_rights_missing', 'asset rights metadata is required');
    return;
  }

  requireString(errors, rights.rightsRecordId, 'rights.rightsRecordId', 'asset_rights_record_id_missing', 'an asset rights record identifier is required');
  validateEvidenceSubject(rights.subject, asset, 'rights.subject', errors);
  if (!isSha256(rights.rightsRecordSha256)) {
    addError(errors, 'rights.rightsRecordSha256', 'asset_rights_record_sha256_invalid', 'an asset rights record SHA-256 is required');
  }
  if (!RIGHTS_BASES.has(rights.basis)) {
    addError(errors, 'rights.basis', 'asset_rights_basis_invalid', 'a supported rights basis is required');
  }
  if (!Array.isArray(rights.permittedUses) || !rights.permittedUses.includes('student_delivery')) {
    addError(errors, 'rights.permittedUses', 'student_delivery_not_permitted', 'asset rights must explicitly permit student_delivery');
  }
  if (typeof rights.derivativeUseAllowed !== 'boolean') {
    addError(errors, 'rights.derivativeUseAllowed', 'asset_derivative_rights_unknown', 'the derivative-use permission must be explicit');
  }
  if (!isRecord(rights.validity)) {
    addError(errors, 'rights.validity', 'asset_rights_validity_missing', 'asset rights validity metadata is required');
  } else {
    if (!isValidTimestamp(rights.validity.startsAt)) {
      addError(errors, 'rights.validity.startsAt', 'asset_rights_start_invalid', 'a valid rights start timestamp is required');
    }
    if (rights.validity.endsAt !== null && !isValidTimestamp(rights.validity.endsAt)) {
      addError(errors, 'rights.validity.endsAt', 'asset_rights_end_invalid', 'a valid rights end timestamp or null is required');
    }
    if (
      isValidTimestamp(rights.validity.startsAt) &&
      isValidTimestamp(rights.validity.endsAt) &&
      Date.parse(rights.validity.endsAt) < Date.parse(rights.validity.startsAt)
    ) {
      addError(errors, 'rights.validity', 'asset_rights_range_invalid', 'the rights end timestamp cannot precede the start timestamp');
    }
  }
  if (!isRecord(rights.attribution) || typeof rights.attribution.required !== 'boolean') {
    addError(errors, 'rights.attribution', 'asset_attribution_invalid', 'asset attribution metadata is required');
  } else if (rights.attribution.required && !isNonEmptyString(rights.attribution.text)) {
    addError(errors, 'rights.attribution.text', 'asset_attribution_text_missing', 'required asset attribution needs text');
  }
}

function validateAccessibility(accessibility, asset, errors) {
  if (!isRecord(accessibility)) {
    addError(errors, 'accessibility', 'asset_accessibility_missing', 'asset accessibility metadata is required');
    return;
  }

  requireString(errors, accessibility.accessibilityRecordId, 'accessibility.accessibilityRecordId', 'accessibility_record_id_missing', 'an accessibility record identifier is required');
  validateEvidenceSubject(accessibility.subject, asset, 'accessibility.subject', errors);
  if (!isSha256(accessibility.accessibilityRecordSha256)) {
    addError(errors, 'accessibility.accessibilityRecordSha256', 'accessibility_record_sha256_invalid', 'an accessibility record SHA-256 is required');
  }
  requireString(errors, accessibility.language, 'accessibility.language', 'accessibility_language_missing', 'an accessibility language is required');

  const isVisual = typeof asset?.mediaType === 'string' && asset.mediaType.startsWith('image/');
  const isAudio = typeof asset?.mediaType === 'string' && asset.mediaType.startsWith('audio/');
  const expectedModality = isVisual ? 'visual' : isAudio ? 'audio' : null;
  if (accessibility.modality !== expectedModality) {
    addError(errors, 'accessibility.modality', 'accessibility_modality_mismatch', 'accessibility modality must match the asset media type');
  }
  if (!isRecord(accessibility.treatment)) {
    addError(errors, 'accessibility.treatment', 'accessibility_treatment_missing', 'asset accessibility treatment is required');
    return;
  }

  validateGradeRange(
    accessibility.treatment.gradeRange,
    'accessibility.treatment.gradeRange',
    'accessibility_grade_range_invalid',
    'an accessibility treatment grade range from 1 through 8 is required',
    errors
  );

  if (isVisual && asset.role !== 'decorative' && !isNonEmptyString(accessibility.treatment.shortAlt)) {
    addError(errors, 'accessibility.treatment.shortAlt', 'visual_alt_text_missing', 'a non-decorative visual requires short alternative text');
  }
  if (isVisual && (asset.role === 'instructional_critical' || asset.role === 'functional') && !isNonEmptyString(accessibility.treatment.longDescription)) {
    addError(errors, 'accessibility.treatment.longDescription', 'critical_visual_long_description_missing', 'a critical visual requires a long description');
  }
  if (isAudio && asset.role !== 'decorative' && !isNonEmptyString(accessibility.treatment.transcript)) {
    addError(errors, 'accessibility.treatment.transcript', 'audio_transcript_missing', 'an instructional audio asset requires a transcript');
  }
}

function validateGovernance(governance, errors) {
  if (!isRecord(governance)) {
    addError(errors, 'dataGovernance', 'governance_missing', 'asset data governance metadata is required');
    return;
  }

  requireString(errors, governance.owner, 'dataGovernance.owner', 'owner_missing', 'a data owner is required');
  requireString(errors, governance.steward, 'dataGovernance.steward', 'steward_missing', 'a data steward is required');
  requireString(errors, governance.classification, 'dataGovernance.classification', 'classification_missing', 'a classification is required');
  requireString(errors, governance.processingPurpose, 'dataGovernance.processingPurpose', 'processing_purpose_missing', 'a processing purpose is required');
  requireString(errors, governance.retentionClass, 'dataGovernance.retentionClass', 'retention_class_missing', 'a retention class is required');
  if (!Array.isArray(governance.sourceLineage) || governance.sourceLineage.length === 0 || governance.sourceLineage.some(value => !isNonEmptyString(value))) {
    addError(errors, 'dataGovernance.sourceLineage', 'source_lineage_missing', 'at least one asset source lineage identifier is required');
  }
}

/**
 * Validate one immutable asset evidence bundle without accessing media files,
 * a database, a cloud provider, or a clock.
 */
export function validateAssetEvidenceBundle(bundle) {
  const errors = [];
  if (!isRecord(bundle)) {
    return {
      valid: false,
      errors: [{ path: 'bundle', code: 'asset_evidence_bundle_invalid', message: 'an asset evidence bundle object is required' }]
    };
  }

  collectForbiddenFields(bundle, '', errors);
  validateKnownShape(bundle, errors);
  if (bundle.contractVersion !== ASSET_EVIDENCE_BUNDLE_CONTRACT_VERSION) {
    addError(errors, 'contractVersion', 'contract_version_unsupported', `expected contract version ${ASSET_EVIDENCE_BUNDLE_CONTRACT_VERSION}`);
  }
  requireString(errors, bundle.bundleId, 'bundleId', 'asset_bundle_id_missing', 'an asset evidence bundle identifier is required');
  validateAsset(bundle.asset, errors);
  validateRights(bundle.rights, bundle.asset, errors);
  validateAccessibility(bundle.accessibility, bundle.asset, errors);
  validateGovernance(bundle.dataGovernance, errors);

  if (bundle.asset?.origin?.method === 'derivative' && bundle.rights?.derivativeUseAllowed !== true) {
    addError(errors, 'rights.derivativeUseAllowed', 'asset_derivative_not_permitted', 'a derivative asset requires explicit derivative-use permission');
  }

  return { valid: errors.length === 0, errors };
}

function compareStrings(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function canonicalSubject(subject) {
  return {
    assetId: subject.assetId,
    revisionId: subject.revisionId,
    mediaType: subject.mediaType,
    byteSha256: subject.byteSha256
  };
}

function canonicalAssetSetEntry(bundle) {
  return {
    contractVersion: bundle.contractVersion,
    bundleId: bundle.bundleId,
    asset: {
      assetId: bundle.asset.assetId,
      revisionId: bundle.asset.revisionId,
      mediaType: bundle.asset.mediaType,
      byteSha256: bundle.asset.byteSha256,
      deliveryProfile: bundle.asset.deliveryProfile,
      role: bundle.asset.role,
      audience: {
        minGrade: bundle.asset.audience.minGrade,
        maxGrade: bundle.asset.audience.maxGrade
      },
      origin: {
        method: bundle.asset.origin.method,
        subject: canonicalSubject(bundle.asset.origin.subject),
        provenanceRecordId: bundle.asset.origin.provenanceRecordId,
        provenanceRecordSha256: bundle.asset.origin.provenanceRecordSha256,
        sourceLineageIds: [...bundle.asset.origin.sourceLineageIds].sort(compareStrings),
        derivedFrom: Array.isArray(bundle.asset.origin.derivedFrom)
          ? bundle.asset.origin.derivedFrom
            .map(parent => ({
              assetId: parent.assetId,
              revisionId: parent.revisionId,
              byteSha256: parent.byteSha256
            }))
            .sort((left, right) => compareStrings(
              `${left.assetId}\u0000${left.revisionId}\u0000${left.byteSha256}`,
              `${right.assetId}\u0000${right.revisionId}\u0000${right.byteSha256}`
            ))
          : [],
        generation: isRecord(bundle.asset.origin.generation)
          ? {
              toolId: bundle.asset.origin.generation.toolId,
              toolVersion: bundle.asset.origin.generation.toolVersion,
              evidenceId: bundle.asset.origin.generation.evidenceId,
              sha256: bundle.asset.origin.generation.sha256
            }
          : null
      }
    },
    rights: {
      subject: canonicalSubject(bundle.rights.subject),
      rightsRecordId: bundle.rights.rightsRecordId,
      rightsRecordSha256: bundle.rights.rightsRecordSha256,
      basis: bundle.rights.basis,
      permittedUses: [...bundle.rights.permittedUses].sort(compareStrings),
      derivativeUseAllowed: bundle.rights.derivativeUseAllowed,
      validity: {
        startsAt: bundle.rights.validity.startsAt,
        endsAt: bundle.rights.validity.endsAt
      },
      attribution: {
        required: bundle.rights.attribution.required,
        text: bundle.rights.attribution.text ?? null
      }
    },
    accessibility: {
      subject: canonicalSubject(bundle.accessibility.subject),
      accessibilityRecordId: bundle.accessibility.accessibilityRecordId,
      accessibilityRecordSha256: bundle.accessibility.accessibilityRecordSha256,
      language: bundle.accessibility.language,
      modality: bundle.accessibility.modality,
      treatment: {
        shortAlt: bundle.accessibility.treatment.shortAlt ?? null,
        longDescription: bundle.accessibility.treatment.longDescription ?? null,
        transcript: bundle.accessibility.treatment.transcript ?? null,
        gradeRange: {
          minGrade: bundle.accessibility.treatment.gradeRange.minGrade,
          maxGrade: bundle.accessibility.treatment.gradeRange.maxGrade
        }
      }
    },
    dataGovernance: {
      owner: bundle.dataGovernance.owner,
      steward: bundle.dataGovernance.steward,
      classification: bundle.dataGovernance.classification,
      processingPurpose: bundle.dataGovernance.processingPurpose,
      retentionClass: bundle.dataGovernance.retentionClass,
      sourceLineage: [...bundle.dataGovernance.sourceLineage].sort(compareStrings)
    }
  };
}

function assetRightsAreCurrent(rights, asOf) {
  const timestamp = Date.parse(asOf);
  return timestamp >= Date.parse(rights.validity.startsAt) &&
    (rights.validity.endsAt === null || timestamp <= Date.parse(rights.validity.endsAt));
}

function immutableAssetSubjectKey(asset) {
  return JSON.stringify({
    assetId: asset.assetId,
    revisionId: asset.revisionId,
    mediaType: asset.mediaType,
    byteSha256: asset.byteSha256
  });
}

function registerEvidenceRecord(recordRegistry, record, subjectKey, path, kind, errors) {
  const existing = recordRegistry.get(record.recordId);
  if (!existing) {
    recordRegistry.set(record.recordId, {
      sha256: record.sha256,
      subjectKey
    });
    return;
  }
  if (existing.sha256 !== record.sha256) {
    addError(
      errors,
      path,
      'asset_evidence_record_hash_conflict',
      `the same ${kind} record identifier cannot name different immutable record hashes`
    );
    return;
  }
  if (existing.subjectKey !== subjectKey) {
    addError(
      errors,
      path,
      'asset_evidence_record_subject_conflict',
      `the same immutable ${kind} record cannot be reused for a different delivered asset subject`
    );
  }
}

/**
 * Validate a complete asset set at an explicitly supplied time and derive a
 * deterministic hash from the immutable, delivery-relevant evidence fields.
 */
export function evaluateAssetEvidenceBundleSet(bundles, asOf) {
  const errors = [];
  if (!Array.isArray(bundles)) {
    return {
      valid: false,
      errors: [{ path: 'bundles', code: 'asset_bundle_set_invalid', message: 'an asset evidence bundle array is required' }]
    };
  }
  if (!isValidTimestamp(asOf)) {
    return {
      valid: false,
      errors: [{ path: 'asOf', code: 'asset_evaluation_time_invalid', message: 'a valid UTC evaluation timestamp is required' }]
    };
  }

  const seenAssetRevisions = new Set();
  const rightsRecords = new Map();
  const accessibilityRecords = new Map();
  bundles.forEach((bundle, index) => {
    const validation = validateAssetEvidenceBundle(bundle);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        addError(errors, `bundles[${index}].${error.path}`, 'asset_bundle_invalid', error.message);
      });
      return;
    }

    const assetKey = `${bundle.asset.assetId}\u0000${bundle.asset.revisionId}`;
    const duplicateAssetRevision = seenAssetRevisions.has(assetKey);
    if (duplicateAssetRevision) {
      addError(
        errors,
        `bundles[${index}].asset`,
        'asset_revision_duplicate',
        'each asset identifier and revision identifier pair must be unique in an asset set'
      );
    }
    seenAssetRevisions.add(assetKey);

    if (!duplicateAssetRevision) {
      const subjectKey = immutableAssetSubjectKey(bundle.asset);
      registerEvidenceRecord(
        rightsRecords,
        {
          recordId: bundle.rights.rightsRecordId,
          sha256: bundle.rights.rightsRecordSha256
        },
        subjectKey,
        `bundles[${index}].rights.rightsRecordId`,
        'rights',
        errors
      );
      registerEvidenceRecord(
        accessibilityRecords,
        {
          recordId: bundle.accessibility.accessibilityRecordId,
          sha256: bundle.accessibility.accessibilityRecordSha256
        },
        subjectKey,
        `bundles[${index}].accessibility.accessibilityRecordId`,
        'accessibility',
        errors
      );
    }

    if (!assetRightsAreCurrent(bundle.rights, asOf)) {
      addError(
        errors,
        `bundles[${index}].rights.validity`,
        'asset_rights_not_current',
        'asset rights are not current at the supplied evaluation time'
      );
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const canonicalEntries = bundles
    .map(canonicalAssetSetEntry)
    .sort((left, right) => {
      const leftKey = `${left.asset.assetId}\u0000${left.asset.revisionId}`;
      const rightKey = `${right.asset.assetId}\u0000${right.asset.revisionId}`;
      return compareStrings(leftKey, rightKey);
    });
  const assetSetSha256 = createHash('sha256')
    .update(JSON.stringify({ contract: 'asset-evidence-set-v1', entries: canonicalEntries }), 'utf8')
    .digest('hex');

  return { valid: true, assetSetSha256, errors: [] };
}
