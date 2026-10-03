/**
 * Pure composition contract for a trusted server-side resolver.
 *
 * It revalidates a V3 student package manifest and composes it with a freshly
 * recomputed package-coverage binding. It produces only a governance-ready
 * intent for a later V4 publication path. Author and four review references
 * must match the same detached lifecycle evidence used during recomputation.
 * It does not resolve or validate the claimed publication decision, asset
 * evidence records, source usage rights, or package bytes,
 * write a record, publish, deliver, authenticate, authorize, or process
 * learner data. A production adapter must resolve the manifest/artifact from
 * authorized append-only sources, verify the artifact hash independently,
 * re-check policy and revocation at commit time, and atomically persist any
 * later evidence record.
 */

import { createHash } from 'node:crypto';

import { validateStudentContentPackageManifest } from './content_package_manifest.mjs';
import {
  evaluateServerResolvedContentPackageCoverageBinding
} from './server_resolved_content_package_coverage_binding.mjs';

export const SERVER_RESOLVED_CONTENT_PACKAGE_MANIFEST_COVERAGE_GOVERNANCE_READINESS_CONTRACT_VERSION = '1.0.0';

const arrayIsArray = Array.isArray;
const arraySort = Function.call.bind(Array.prototype.sort);
const dateConstructor = Date;
const dateParse = Date.parse;
const dateToISOString = Function.call.bind(Date.prototype.toISOString);
const numberConstructor = Number;
const numberIsFinite = Number.isFinite;
const numberIsNaN = Number.isNaN;
const numberIsSafeInteger = Number.isSafeInteger;
const objectCreate = Object.create;
const objectDefineProperty = Object.defineProperty;
const objectFreeze = Object.freeze;
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const objectGetPrototypeOf = Object.getPrototypeOf;
const objectHasOwn = Object.hasOwn;
const objectKeys = Object.keys;
const objectPrototype = Object.prototype;
const reflectOwnKeys = Reflect.ownKeys;
const regExpTest = Function.call.bind(RegExp.prototype.test);
const setConstructor = Set;
const setAdd = Function.call.bind(Set.prototype.add);
const setHas = Function.call.bind(Set.prototype.has);
const stringConstructor = String;
const stringReplace = Function.call.bind(String.prototype.replace);
const jsonStringify = JSON.stringify;
const weakSetConstructor = WeakSet;
const weakSetAdd = Function.call.bind(WeakSet.prototype.add);
const weakSetDelete = Function.call.bind(WeakSet.prototype.delete);
const weakSetHas = Function.call.bind(WeakSet.prototype.has);

const MAX_ERRORS = 32;
const MAX_OWN_FIELDS = 48;
const MAX_SOURCE_LINEAGE = 128;
const MAX_ASSETS = 512;
const MAX_BINDING_ERRORS = 32;
const MAX_INPUT_ARRAY_LENGTH = 20_000;
const MAX_INPUT_DEPTH = 32;
const MAX_INPUT_NODES = 1_000_000;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/u;
const CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;
const NON_WHITESPACE_PATTERN = /\S/u;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/u;
const OUTCOME_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$/u;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;

const ROOT_FIELDS = [
  'contractVersion',
  'resolverContext',
  'packageArtifact',
  'coverageBindingResolverInput'
];
const RESOLVER_CONTEXT_FIELDS = [
  'contractVersion',
  'snapshotId',
  'observedAt',
  'sourcePolicyVersion',
  'manifestGovernanceSnapshotSha256'
];
const PACKAGE_ARTIFACT_FIELDS = [
  'packageId',
  'packageArtifactSha256',
  'manifest',
  'coverageLocator'
];
const COVERAGE_LOCATOR_FIELDS = ['itemId', 'blueprintCellId'];
const COVERAGE_BINDING_INPUT_FIELDS = [
  'resolverContext',
  'coverageReviewResolverInput'
];
const MANIFEST_FIELDS = [
  'contractVersion',
  'packageId',
  'dataGovernance',
  'curriculum',
  'content',
  'assets'
];
const DATA_GOVERNANCE_FIELDS = [
  'owner',
  'steward',
  'classification',
  'processingPurpose',
  'retentionClass',
  'sourceLineage'
];
const SOURCE_LINEAGE_FIELDS = ['sourceId', 'kind', 'retrievedAt'];
const CURRICULUM_FIELDS = [
  'registryEntryId',
  'programVersion',
  'grade',
  'courseKey',
  'outcomeCode',
  'verificationState'
];
const CONTENT_FIELDS = [
  'contentItemId',
  'revisionId',
  'revisionSha256',
  'assetSetSha256',
  'authorId',
  'lifecycleState',
  'academicReviewId',
  'assessmentReviewId',
  'rightsReviewId',
  'accessibilityReviewId',
  'publicationDecisionId'
];
const ASSET_FIELDS = [
  'assetEvidenceBundleId',
  'assetId',
  'revisionId',
  'mediaType',
  'byteSha256',
  'deliveryProfile',
  'provenanceRecordId',
  'provenanceRecordSha256',
  'rightsRecordId',
  'rightsRecordSha256',
  'accessibilityRecordId',
  'accessibilityRecordSha256'
];
const PACKAGE_BINDING_RESULT_FIELDS = [
  'eligible',
  'bindingReady',
  'nextState',
  'scopeCoverageComplete',
  'coverageSummary',
  'packageCoverageBindingIntent',
  'errors'
];
const COVERAGE_SUMMARY_FIELDS = [
  'targetCount',
  'approvedItemCount',
  'underTargetCellCount',
  'overTargetCellCount',
  'missingRequiredVariantCellCount'
];
const PACKAGE_BINDING_INTENT_FIELDS = [
  'contractVersion',
  'resolverSnapshotId',
  'observedAt',
  'sourcePolicyVersion',
  'packageCoverageSnapshotSha256',
  'packageCoverageBindingSha256',
  'packageId',
  'packageManifestSha256',
  'itemId',
  'contentItemId',
  'contentRevisionId',
  'contentRevisionSha256',
  'assetSetSha256',
  'blueprintCellId',
  'blueprintId',
  'blueprintRevisionId',
  'blueprintSha256',
  'canonicalCurriculumSnapshotSha256',
  'coverageReviewReadinessIntentSha256',
  'lifecycleReviewSnapshotSha256'
];
const REVIEW_REFERENCE_FIELDS = [
  ['academic', 'academicReviewId'],
  ['assessment', 'assessmentReviewId'],
  ['rights', 'rightsReviewId'],
  ['accessibility', 'accessibilityReviewId']
];

function setOwnValue(target, field, value) {
  objectDefineProperty(target, field, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function arrayLength(value) {
  const descriptor = objectGetOwnPropertyDescriptor(value, 'length');
  return descriptor && objectHasOwn(descriptor, 'value') ? descriptor.value : -1;
}

function appendOwnArrayValue(array, value) {
  setOwnValue(array, stringConstructor(arrayLength(array)), value);
}

function createError(path, code, message) {
  const error = objectCreate(null);
  setOwnValue(error, 'path', path);
  setOwnValue(error, 'code', code);
  setOwnValue(error, 'message', message);
  return objectFreeze(error);
}

function addError(errors, path, code, message) {
  const length = arrayLength(errors);
  if (length >= MAX_ERRORS - 1) {
    if (length === MAX_ERRORS - 1) {
      appendOwnArrayValue(errors, createError(
        'input',
        'validation_error_limit_exceeded',
        'validation stopped after reaching the fixed error-output limit'
      ));
    }
    return;
  }
  appendOwnArrayValue(errors, createError(path, code, message));
}

function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || arrayIsArray(value)) return false;
  const prototype = objectGetPrototypeOf(value);
  return prototype === objectPrototype || prototype === null;
}

function includesValue(values, value) {
  for (let index = 0; index < arrayLength(values); index += 1) {
    if (values[index] === value) return true;
  }
  return false;
}

function isOpaqueId(value) {
  return typeof value === 'string' && regExpTest(OPAQUE_ID_PATTERN, value);
}

function isOutcomeCode(value) {
  return typeof value === 'string' && regExpTest(OUTCOME_CODE_PATTERN, value);
}

function isSha256(value) {
  return typeof value === 'string' && regExpTest(SHA256_PATTERN, value);
}

function isVersion(value) {
  return typeof value === 'string' && regExpTest(VERSION_PATTERN, value);
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.length <= 4_096 && regExpTest(NON_WHITESPACE_PATTERN, value);
}

function isCanonicalUtcTimestamp(value) {
  if (typeof value !== 'string' || !regExpTest(CANONICAL_TIMESTAMP_PATTERN, value)) return false;
  const timestamp = dateParse(value);
  if (numberIsNaN(timestamp)) return false;
  const canonical = dateToISOString(new dateConstructor(timestamp));
  return value === canonical || value === stringReplace(canonical, '.000Z', 'Z');
}

function snapshotClosedRecord(value, allowedFields, path, errors) {
  if (!isPlainRecord(value)) {
    addError(errors, path, 'record_invalid', 'a plain record with own enumerable data fields is required');
    return null;
  }
  const fields = reflectOwnKeys(value);
  if (arrayLength(fields) > MAX_OWN_FIELDS) {
    addError(errors, path, 'record_field_count_exceeds_limit', 'the record exceeds the fixed own-field limit');
    return null;
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(fields); index += 1) {
    const field = fields[index];
    if (typeof field !== 'string') {
      addError(errors, path, 'symbol_field_not_allowed', 'the schema permits string field names only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!includesValue(allowedFields, field)) {
      addError(errors, path, 'unexpected_field', 'the schema is closed');
      continue;
    }
    if (!descriptor || !descriptor.enumerable) {
      addError(errors, `${path}.${field}`, 'non_enumerable_field_not_allowed', 'the schema permits enumerable fields only');
      continue;
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, `${path}.${field}`, 'accessor_field_not_allowed', 'the schema permits data fields only');
      continue;
    }
    setOwnValue(snapshot, field, descriptor.value);
  }
  return snapshot;
}

function requireFields(snapshot, fields, path, errors) {
  if (!snapshot) return;
  for (let index = 0; index < arrayLength(fields); index += 1) {
    const field = fields[index];
    if (!objectHasOwn(snapshot, field)) {
      addError(errors, `${path}.${field}`, 'required_field_missing', 'a required field is missing');
    }
  }
}

function snapshotDenseArray(value, path, errors, maximumLength) {
  if (!arrayIsArray(value)) {
    addError(errors, path, 'array_invalid', 'a dense array is required');
    return null;
  }
  const length = arrayLength(value);
  if (!numberIsSafeInteger(length) || length < 0) {
    addError(errors, path, 'array_length_invalid', 'a safe non-negative array length is required');
    return null;
  }
  if (length > maximumLength) {
    addError(errors, path, 'array_length_exceeds_limit', 'the array exceeds its fixed length limit');
    return null;
  }
  const fields = reflectOwnKeys(value);
  for (let index = 0; index < arrayLength(fields); index += 1) {
    const field = fields[index];
    if (field === 'length') continue;
    if (typeof field !== 'string' || !regExpTest(ARRAY_INDEX_PATTERN, field) || numberConstructor(field) >= length) {
      addError(errors, path, 'unexpected_array_field', 'arrays may contain only dense indexed data entries');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable) {
      addError(errors, `${path}[${field}]`, 'non_enumerable_field_not_allowed', 'array entries must be enumerable data fields');
      continue;
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, `${path}[${field}]`, 'accessor_field_not_allowed', 'array entries must be data fields');
    }
  }
  const snapshot = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = objectGetOwnPropertyDescriptor(value, stringConstructor(index));
    if (!descriptor) {
      addError(errors, `${path}[${index}]`, 'array_hole_not_allowed', 'arrays must be dense');
      continue;
    }
    if (!descriptor.enumerable || !objectHasOwn(descriptor, 'value')) continue;
    appendOwnArrayValue(snapshot, descriptor.value);
  }
  return snapshot;
}

function snapshotResolverContext(value, errors, requireSnapshotHash) {
  const snapshot = snapshotClosedRecord(value, RESOLVER_CONTEXT_FIELDS, 'resolverContext', errors);
  if (!snapshot) return null;
  requireFields(snapshot, RESOLVER_CONTEXT_FIELDS, 'resolverContext', errors);
  if (
    snapshot.contractVersion !== SERVER_RESOLVED_CONTENT_PACKAGE_MANIFEST_COVERAGE_GOVERNANCE_READINESS_CONTRACT_VERSION ||
    !isOpaqueId(snapshot.snapshotId) ||
    !isCanonicalUtcTimestamp(snapshot.observedAt) ||
    !isVersion(snapshot.sourcePolicyVersion) ||
    (requireSnapshotHash
      ? !isSha256(snapshot.manifestGovernanceSnapshotSha256)
      : snapshot.manifestGovernanceSnapshotSha256 !== null && !isSha256(snapshot.manifestGovernanceSnapshotSha256))
  ) {
    addError(errors, 'resolverContext', 'resolver_context_invalid', 'a versioned, timestamped manifest-governance resolver context is required');
  }
  return objectFreeze(snapshot);
}

function copyRecordFields(record, fields) {
  const copy = objectCreate(null);
  for (let index = 0; index < arrayLength(fields); index += 1) {
    const field = fields[index];
    setOwnValue(copy, field, record[field]);
  }
  return objectFreeze(copy);
}

function snapshotSourceLineage(value, errors) {
  const entries = snapshotDenseArray(value, 'packageArtifact.manifest.dataGovernance.sourceLineage', errors, MAX_SOURCE_LINEAGE);
  if (!entries) return null;
  if (arrayLength(entries) === 0) {
    addError(errors, 'packageArtifact.manifest.dataGovernance.sourceLineage', 'source_lineage_missing', 'at least one source-lineage record is required');
  }
  const snapshot = [];
  const seen = new setConstructor();
  for (let index = 0; index < arrayLength(entries); index += 1) {
    const path = `packageArtifact.manifest.dataGovernance.sourceLineage[${index}]`;
    const entry = snapshotClosedRecord(entries[index], SOURCE_LINEAGE_FIELDS, path, errors);
    if (!entry) continue;
    requireFields(entry, SOURCE_LINEAGE_FIELDS, path, errors);
    if (!isOpaqueId(entry.sourceId) || !isNonEmptyText(entry.kind) || !isCanonicalUtcTimestamp(entry.retrievedAt)) {
      addError(errors, path, 'source_lineage_invalid', 'a stable source identifier, kind, and canonical retrieval timestamp are required');
    }
    const key = canonicalJson(copyRecordFields(entry, SOURCE_LINEAGE_FIELDS));
    if (setHas(seen, key)) {
      addError(errors, path, 'source_lineage_duplicate', 'each source-lineage record must be unique');
      continue;
    }
    setAdd(seen, key);
    appendOwnArrayValue(snapshot, copyRecordFields(entry, SOURCE_LINEAGE_FIELDS));
  }
  return objectFreeze(snapshot);
}

function snapshotDataGovernance(value, errors) {
  const governance = snapshotClosedRecord(value, DATA_GOVERNANCE_FIELDS, 'packageArtifact.manifest.dataGovernance', errors);
  if (!governance) return null;
  requireFields(governance, DATA_GOVERNANCE_FIELDS, 'packageArtifact.manifest.dataGovernance', errors);
  if (
    !isOpaqueId(governance.owner) ||
    !isOpaqueId(governance.steward) ||
    !isNonEmptyText(governance.classification) ||
    !isNonEmptyText(governance.processingPurpose) ||
    !isNonEmptyText(governance.retentionClass)
  ) {
    addError(errors, 'packageArtifact.manifest.dataGovernance', 'data_governance_invalid', 'DAMA owner, steward, classification, purpose, and retention metadata are required');
  }
  const sourceLineage = snapshotSourceLineage(governance.sourceLineage, errors);
  if (!sourceLineage) return null;
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(DATA_GOVERNANCE_FIELDS); index += 1) {
    const field = DATA_GOVERNANCE_FIELDS[index];
    setOwnValue(snapshot, field, field === 'sourceLineage' ? sourceLineage : governance[field]);
  }
  return objectFreeze(snapshot);
}

function snapshotCurriculum(value, errors) {
  const curriculum = snapshotClosedRecord(value, CURRICULUM_FIELDS, 'packageArtifact.manifest.curriculum', errors);
  if (!curriculum) return null;
  requireFields(curriculum, CURRICULUM_FIELDS, 'packageArtifact.manifest.curriculum', errors);
  if (
    !isOpaqueId(curriculum.registryEntryId) ||
    !isVersion(curriculum.programVersion) ||
    !numberIsSafeInteger(curriculum.grade) ||
    curriculum.grade < 1 ||
    curriculum.grade > 8 ||
    !isOpaqueId(curriculum.courseKey) ||
    !isOutcomeCode(curriculum.outcomeCode) ||
    curriculum.verificationState !== 'canonical_verified'
  ) {
    addError(errors, 'packageArtifact.manifest.curriculum', 'manifest_curriculum_invalid', 'a canonically verified grade-one-to-eight curriculum binding is required');
  }
  return copyRecordFields(curriculum, CURRICULUM_FIELDS);
}

function snapshotContent(value, errors) {
  const content = snapshotClosedRecord(value, CONTENT_FIELDS, 'packageArtifact.manifest.content', errors);
  if (!content) return null;
  requireFields(content, CONTENT_FIELDS, 'packageArtifact.manifest.content', errors);
  if (
    !isOpaqueId(content.contentItemId) ||
    !isOpaqueId(content.revisionId) ||
    !isSha256(content.revisionSha256) ||
    !isSha256(content.assetSetSha256) ||
    !isOpaqueId(content.authorId) ||
    content.lifecycleState !== 'published' ||
    !isOpaqueId(content.academicReviewId) ||
    !isOpaqueId(content.assessmentReviewId) ||
    !isOpaqueId(content.rightsReviewId) ||
    !isOpaqueId(content.accessibilityReviewId) ||
    !isOpaqueId(content.publicationDecisionId)
  ) {
    addError(errors, 'packageArtifact.manifest.content', 'manifest_content_invalid', 'a published immutable content revision with all review and publication references is required');
  }
  return copyRecordFields(content, CONTENT_FIELDS);
}

function snapshotAssets(value, errors) {
  const assets = snapshotDenseArray(value, 'packageArtifact.manifest.assets', errors, MAX_ASSETS);
  if (!assets) return null;
  const snapshot = [];
  const seenBundleIds = new setConstructor();
  for (let index = 0; index < arrayLength(assets); index += 1) {
    const path = `packageArtifact.manifest.assets[${index}]`;
    const asset = snapshotClosedRecord(assets[index], ASSET_FIELDS, path, errors);
    if (!asset) continue;
    requireFields(asset, ASSET_FIELDS, path, errors);
    if (
      !isOpaqueId(asset.assetEvidenceBundleId) ||
      !isOpaqueId(asset.assetId) ||
      !isOpaqueId(asset.revisionId) ||
      !isNonEmptyText(asset.mediaType) ||
      !isSha256(asset.byteSha256) ||
      !isNonEmptyText(asset.deliveryProfile) ||
      !isOpaqueId(asset.provenanceRecordId) ||
      !isSha256(asset.provenanceRecordSha256) ||
      !isOpaqueId(asset.rightsRecordId) ||
      !isSha256(asset.rightsRecordSha256) ||
      !isOpaqueId(asset.accessibilityRecordId) ||
      !isSha256(asset.accessibilityRecordSha256)
    ) {
      addError(errors, path, 'manifest_asset_invalid', 'each asset requires immutable byte, provenance, rights, and accessibility evidence identifiers and hashes');
    }
    if (setHas(seenBundleIds, asset.assetEvidenceBundleId)) {
      addError(errors, `${path}.assetEvidenceBundleId`, 'asset_evidence_bundle_duplicate', 'each asset evidence bundle may appear only once');
      continue;
    }
    setAdd(seenBundleIds, asset.assetEvidenceBundleId);
    appendOwnArrayValue(snapshot, copyRecordFields(asset, ASSET_FIELDS));
  }
  return objectFreeze(snapshot);
}

function snapshotManifest(value, errors) {
  const manifest = snapshotClosedRecord(value, MANIFEST_FIELDS, 'packageArtifact.manifest', errors);
  if (!manifest) return null;
  requireFields(manifest, MANIFEST_FIELDS, 'packageArtifact.manifest', errors);
  if (manifest.contractVersion !== '3.0.0' || !isOpaqueId(manifest.packageId)) {
    addError(errors, 'packageArtifact.manifest', 'manifest_v3_invalid', 'a closed V3 package manifest with a stable package identifier is required');
  }
  const dataGovernance = snapshotDataGovernance(manifest.dataGovernance, errors);
  const curriculum = snapshotCurriculum(manifest.curriculum, errors);
  const content = snapshotContent(manifest.content, errors);
  const assets = snapshotAssets(manifest.assets, errors);
  if (!dataGovernance || !curriculum || !content || !assets) return null;
  const snapshot = objectCreate(null);
  setOwnValue(snapshot, 'contractVersion', manifest.contractVersion);
  setOwnValue(snapshot, 'packageId', manifest.packageId);
  setOwnValue(snapshot, 'dataGovernance', dataGovernance);
  setOwnValue(snapshot, 'curriculum', curriculum);
  setOwnValue(snapshot, 'content', content);
  setOwnValue(snapshot, 'assets', assets);
  const validation = validateStudentContentPackageManifest(snapshot);
  if (!validation || validation.valid !== true || !arrayIsArray(validation.errors) || arrayLength(validation.errors) !== 0) {
    addError(errors, 'packageArtifact.manifest', 'manifest_validation_blocked', 'the closed V3 manifest must pass its baseline manifest validator');
  }
  return objectFreeze(snapshot);
}

function snapshotPackageArtifact(value, errors) {
  const artifact = snapshotClosedRecord(value, PACKAGE_ARTIFACT_FIELDS, 'packageArtifact', errors);
  if (!artifact) return null;
  requireFields(artifact, PACKAGE_ARTIFACT_FIELDS, 'packageArtifact', errors);
  if (!isOpaqueId(artifact.packageId) || !isSha256(artifact.packageArtifactSha256)) {
    addError(errors, 'packageArtifact', 'package_artifact_invalid', 'a stable package identifier and independently resolved immutable package artifact hash are required');
  }
  const locator = snapshotClosedRecord(artifact.coverageLocator, COVERAGE_LOCATOR_FIELDS, 'packageArtifact.coverageLocator', errors);
  if (!locator) return null;
  requireFields(locator, COVERAGE_LOCATOR_FIELDS, 'packageArtifact.coverageLocator', errors);
  if (!isOpaqueId(locator.itemId) || !isOpaqueId(locator.blueprintCellId)) {
    addError(errors, 'packageArtifact.coverageLocator', 'coverage_locator_invalid', 'an immutable item and blueprint-cell locator are required');
  }
  const manifest = snapshotManifest(artifact.manifest, errors);
  if (!manifest) return null;
  if (artifact.packageId !== manifest.packageId) {
    addError(errors, 'packageArtifact.packageId', 'package_id_manifest_mismatch', 'the artifact package identifier must match the V3 manifest package identifier');
  }
  const snapshot = objectCreate(null);
  setOwnValue(snapshot, 'packageId', artifact.packageId);
  setOwnValue(snapshot, 'packageArtifactSha256', artifact.packageArtifactSha256);
  setOwnValue(snapshot, 'manifest', manifest);
  setOwnValue(snapshot, 'coverageLocator', copyRecordFields(locator, COVERAGE_LOCATOR_FIELDS));
  return objectFreeze(snapshot);
}

function snapshotCoverageBindingResolverInput(value, errors) {
  const input = snapshotClosedRecord(value, COVERAGE_BINDING_INPUT_FIELDS, 'coverageBindingResolverInput', errors);
  if (!input) return null;
  requireFields(input, COVERAGE_BINDING_INPUT_FIELDS, 'coverageBindingResolverInput', errors);
  const context = { active: new weakSetConstructor(), nodeCount: 0 };
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(COVERAGE_BINDING_INPUT_FIELDS); index += 1) {
    const field = COVERAGE_BINDING_INPUT_FIELDS[index];
    setOwnValue(snapshot, field, snapshotSafeResolverValue(input[field], `coverageBindingResolverInput.${field}`, errors, context, 0));
  }
  return objectFreeze(snapshot);
}

// Detach once so author/reference matching and coverage recomputation observe
// exactly the same data, including when a caller supplied mutable records.
// The nested schemas remain owned and validated by the coverage contracts.
function snapshotSafeResolverValue(value, path, errors, context, depth) {
  if (context.nodeCount >= MAX_INPUT_NODES) {
    addError(errors, path, 'input_node_limit_exceeded', 'the resolver input exceeds its fixed structural node limit');
    return null;
  }
  context.nodeCount += 1;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (numberIsFinite(value)) return value;
    addError(errors, path, 'number_invalid', 'only finite numeric values are permitted');
    return null;
  }
  if (typeof value !== 'object') {
    addError(errors, path, 'value_type_invalid', 'only JSON-shaped resolver data is permitted');
    return null;
  }
  if (depth >= MAX_INPUT_DEPTH) {
    addError(errors, path, 'input_depth_exceeds_limit', 'the resolver input exceeds its fixed structural depth limit');
    return null;
  }
  if (weakSetHas(context.active, value)) {
    addError(errors, path, 'cyclic_value_not_allowed', 'cyclic resolver data is not permitted');
    return null;
  }
  weakSetAdd(context.active, value);
  try {
    if (arrayIsArray(value)) {
      const entries = snapshotDenseArray(value, path, errors, MAX_INPUT_ARRAY_LENGTH);
      if (!entries) return null;
      const snapshot = [];
      for (let index = 0; index < arrayLength(entries); index += 1) {
        appendOwnArrayValue(snapshot, snapshotSafeResolverValue(entries[index], `${path}[${index}]`, errors, context, depth + 1));
      }
      return objectFreeze(snapshot);
    }
    if (!isPlainRecord(value)) {
      addError(errors, path, 'record_invalid', 'only plain resolver records are permitted');
      return null;
    }
    const fields = reflectOwnKeys(value);
    if (arrayLength(fields) > MAX_OWN_FIELDS) {
      addError(errors, path, 'record_field_count_exceeds_limit', 'the resolver record exceeds its fixed own-field limit');
      return null;
    }
    const snapshot = objectCreate(null);
    for (let index = 0; index < arrayLength(fields); index += 1) {
      const field = fields[index];
      if (typeof field !== 'string') {
        addError(errors, path, 'symbol_field_not_allowed', 'resolver records permit string field names only');
        continue;
      }
      const descriptor = objectGetOwnPropertyDescriptor(value, field);
      if (!descriptor || !descriptor.enumerable) {
        addError(errors, `${path}.${field}`, 'non_enumerable_field_not_allowed', 'resolver records permit enumerable fields only');
        continue;
      }
      if (!objectHasOwn(descriptor, 'value')) {
        addError(errors, `${path}.${field}`, 'accessor_field_not_allowed', 'resolver records permit data fields only');
        continue;
      }
      setOwnValue(snapshot, field, snapshotSafeResolverValue(descriptor.value, `${path}.${field}`, errors, context, depth + 1));
    }
    return objectFreeze(snapshot);
  } finally {
    weakSetDelete(context.active, value);
  }
}

function createDerivedPackageTarget(artifact) {
  const target = objectCreate(null);
  const manifest = artifact.manifest;
  setOwnValue(target, 'packageId', artifact.packageId);
  setOwnValue(target, 'packageManifestSha256', artifact.packageArtifactSha256);
  setOwnValue(target, 'itemId', artifact.coverageLocator.itemId);
  setOwnValue(target, 'contentItemId', manifest.content.contentItemId);
  setOwnValue(target, 'contentRevisionId', manifest.content.revisionId);
  setOwnValue(target, 'contentRevisionSha256', manifest.content.revisionSha256);
  setOwnValue(target, 'assetSetSha256', manifest.content.assetSetSha256);
  setOwnValue(target, 'blueprintCellId', artifact.coverageLocator.blueprintCellId);
  setOwnValue(target, 'curriculum', objectFreeze(copyRecordFields(manifest.curriculum, [
    'registryEntryId',
    'programVersion',
    'grade',
    'courseKey',
    'outcomeCode'
  ])));
  return objectFreeze(target);
}

function snapshotCoverageSummary(value, errors) {
  const summary = snapshotClosedRecord(value, COVERAGE_SUMMARY_FIELDS, 'packageCoverageBindingResult.coverageSummary', errors);
  if (!summary) return null;
  requireFields(summary, COVERAGE_SUMMARY_FIELDS, 'packageCoverageBindingResult.coverageSummary', errors);
  for (let index = 0; index < arrayLength(COVERAGE_SUMMARY_FIELDS); index += 1) {
    const field = COVERAGE_SUMMARY_FIELDS[index];
    if (!numberIsSafeInteger(summary[field]) || summary[field] < 0) {
      addError(errors, `packageCoverageBindingResult.coverageSummary.${field}`, 'coverage_summary_invalid', 'coverage summary values must be safe non-negative integers');
    }
  }
  return copyRecordFields(summary, COVERAGE_SUMMARY_FIELDS);
}

function snapshotPackageBindingIntent(value, errors) {
  const intent = snapshotClosedRecord(value, PACKAGE_BINDING_INTENT_FIELDS, 'packageCoverageBindingResult.packageCoverageBindingIntent', errors);
  if (!intent) return null;
  requireFields(intent, PACKAGE_BINDING_INTENT_FIELDS, 'packageCoverageBindingResult.packageCoverageBindingIntent', errors);
  if (
    intent.contractVersion !== '1.0.0' ||
    !isOpaqueId(intent.resolverSnapshotId) ||
    !isCanonicalUtcTimestamp(intent.observedAt) ||
    !isVersion(intent.sourcePolicyVersion) ||
    !isSha256(intent.packageCoverageSnapshotSha256) ||
    !isSha256(intent.packageCoverageBindingSha256) ||
    !isOpaqueId(intent.packageId) ||
    !isSha256(intent.packageManifestSha256) ||
    !isOpaqueId(intent.itemId) ||
    !isOpaqueId(intent.contentItemId) ||
    !isOpaqueId(intent.contentRevisionId) ||
    !isSha256(intent.contentRevisionSha256) ||
    !isSha256(intent.assetSetSha256) ||
    !isOpaqueId(intent.blueprintCellId) ||
    !isOpaqueId(intent.blueprintId) ||
    !isOpaqueId(intent.blueprintRevisionId) ||
    !isSha256(intent.blueprintSha256) ||
    !isSha256(intent.canonicalCurriculumSnapshotSha256) ||
    !isSha256(intent.coverageReviewReadinessIntentSha256) ||
    !isSha256(intent.lifecycleReviewSnapshotSha256)
  ) {
    addError(errors, 'packageCoverageBindingResult.packageCoverageBindingIntent', 'package_coverage_binding_intent_invalid', 'the freshly recomputed package coverage binding intent is invalid');
  }
  return copyRecordFields(intent, PACKAGE_BINDING_INTENT_FIELDS);
}

function evaluateDerivedCoverageBinding(coverageBindingResolverInput, target, errors) {
  const candidate = objectCreate(null);
  setOwnValue(candidate, 'contractVersion', '1.0.0');
  setOwnValue(candidate, 'resolverContext', coverageBindingResolverInput.resolverContext);
  setOwnValue(candidate, 'packageContentTarget', target);
  setOwnValue(candidate, 'coverageReviewResolverInput', coverageBindingResolverInput.coverageReviewResolverInput);
  let result;
  try {
    result = evaluateServerResolvedContentPackageCoverageBinding(candidate);
  } catch {
    addError(errors, 'coverageBindingResolverInput', 'package_coverage_binding_unreadable', 'the package coverage binding could not be safely recomputed');
    return null;
  }
  const root = snapshotClosedRecord(result, PACKAGE_BINDING_RESULT_FIELDS, 'packageCoverageBindingResult', errors);
  if (!root) return null;
  requireFields(root, PACKAGE_BINDING_RESULT_FIELDS, 'packageCoverageBindingResult', errors);
  const resultErrors = snapshotDenseArray(root.errors, 'packageCoverageBindingResult.errors', errors, MAX_BINDING_ERRORS);
  if (
    root.eligible !== true ||
    root.bindingReady !== true ||
    root.nextState !== 'package_coverage_binding_ready' ||
    (root.scopeCoverageComplete !== true && root.scopeCoverageComplete !== false) ||
    !resultErrors ||
    arrayLength(resultErrors) !== 0
  ) {
    addError(errors, 'coverageBindingResolverInput', 'package_coverage_binding_blocked', 'a freshly recomputed package coverage binding is required');
    return null;
  }
  const coverageSummary = snapshotCoverageSummary(root.coverageSummary, errors);
  const intent = snapshotPackageBindingIntent(root.packageCoverageBindingIntent, errors);
  if (!coverageSummary || !intent) return null;
  const identityFields = [
    'packageId',
    'itemId',
    'contentItemId',
    'contentRevisionId',
    'contentRevisionSha256',
    'assetSetSha256',
    'blueprintCellId'
  ];
  for (let index = 0; index < arrayLength(identityFields); index += 1) {
    const field = identityFields[index];
    if (intent[field] !== target[field]) {
      addError(errors, `packageCoverageBindingResult.packageCoverageBindingIntent.${field}`, 'package_coverage_binding_target_mismatch', 'the freshly recomputed package coverage binding must match the manifest-derived target');
    }
  }
  if (intent.packageManifestSha256 !== target.packageManifestSha256) {
    addError(errors, 'packageCoverageBindingResult.packageCoverageBindingIntent.packageManifestSha256', 'package_coverage_binding_artifact_mismatch', 'the package coverage binding must target the immutable package artifact hash');
  }
  const snapshot = objectCreate(null);
  setOwnValue(snapshot, 'scopeCoverageComplete', root.scopeCoverageComplete);
  setOwnValue(snapshot, 'coverageSummary', coverageSummary);
  setOwnValue(snapshot, 'packageCoverageBindingIntent', intent);
  return objectFreeze(snapshot);
}

function sortRecords(records, sortFields) {
  const sorted = [];
  for (let index = 0; index < arrayLength(records); index += 1) {
    appendOwnArrayValue(sorted, records[index]);
  }
  arraySort(sorted, (left, right) => {
    for (let index = 0; index < arrayLength(sortFields); index += 1) {
      const field = sortFields[index];
      if (left[field] < right[field]) return -1;
      if (left[field] > right[field]) return 1;
    }
    return 0;
  });
  return objectFreeze(sorted);
}

function manifestForDigest(manifest) {
  const dataGovernance = objectCreate(null);
  setOwnValue(dataGovernance, 'owner', manifest.dataGovernance.owner);
  setOwnValue(dataGovernance, 'steward', manifest.dataGovernance.steward);
  setOwnValue(dataGovernance, 'classification', manifest.dataGovernance.classification);
  setOwnValue(dataGovernance, 'processingPurpose', manifest.dataGovernance.processingPurpose);
  setOwnValue(dataGovernance, 'retentionClass', manifest.dataGovernance.retentionClass);
  setOwnValue(dataGovernance, 'sourceLineage', sortRecords(
    manifest.dataGovernance.sourceLineage,
    SOURCE_LINEAGE_FIELDS
  ));
  const digestManifest = objectCreate(null);
  setOwnValue(digestManifest, 'contractVersion', manifest.contractVersion);
  setOwnValue(digestManifest, 'packageId', manifest.packageId);
  setOwnValue(digestManifest, 'dataGovernance', objectFreeze(dataGovernance));
  setOwnValue(digestManifest, 'curriculum', manifest.curriculum);
  setOwnValue(digestManifest, 'content', manifest.content);
  setOwnValue(digestManifest, 'assets', sortRecords(manifest.assets, ['assetEvidenceBundleId', 'assetId', 'revisionId']));
  return objectFreeze(digestManifest);
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return jsonStringify(value);
  if (arrayIsArray(value)) {
    let serialized = '[';
    for (let index = 0; index < arrayLength(value); index += 1) {
      if (index > 0) serialized += ',';
      serialized += canonicalJson(value[index]);
    }
    return `${serialized}]`;
  }
  const keys = objectKeys(value);
  arraySort(keys);
  let serialized = '{';
  for (let index = 0; index < arrayLength(keys); index += 1) {
    if (index > 0) serialized += ',';
    const key = keys[index];
    serialized += `${jsonStringify(key)}:${canonicalJson(value[key])}`;
  }
  return `${serialized}}`;
}

function copyResolverContextForDigest(resolverContext) {
  const context = objectCreate(null);
  setOwnValue(context, 'contractVersion', resolverContext.contractVersion);
  setOwnValue(context, 'snapshotId', resolverContext.snapshotId);
  setOwnValue(context, 'observedAt', resolverContext.observedAt);
  setOwnValue(context, 'sourcePolicyVersion', resolverContext.sourcePolicyVersion);
  return objectFreeze(context);
}

function bindingForDigest(binding) {
  const intent = binding.packageCoverageBindingIntent;
  const record = objectCreate(null);
  setOwnValue(record, 'packageCoverageBindingSha256', intent.packageCoverageBindingSha256);
  setOwnValue(record, 'packageCoverageSnapshotSha256', intent.packageCoverageSnapshotSha256);
  setOwnValue(record, 'coverageReviewReadinessIntentSha256', intent.coverageReviewReadinessIntentSha256);
  setOwnValue(record, 'lifecycleReviewSnapshotSha256', intent.lifecycleReviewSnapshotSha256);
  setOwnValue(record, 'resolverSnapshotId', intent.resolverSnapshotId);
  setOwnValue(record, 'observedAt', intent.observedAt);
  setOwnValue(record, 'sourcePolicyVersion', intent.sourcePolicyVersion);
  setOwnValue(record, 'itemId', intent.itemId);
  setOwnValue(record, 'contentItemId', intent.contentItemId);
  setOwnValue(record, 'contentRevisionId', intent.contentRevisionId);
  setOwnValue(record, 'contentRevisionSha256', intent.contentRevisionSha256);
  setOwnValue(record, 'assetSetSha256', intent.assetSetSha256);
  setOwnValue(record, 'blueprintCellId', intent.blueprintCellId);
  setOwnValue(record, 'blueprintId', intent.blueprintId);
  setOwnValue(record, 'blueprintRevisionId', intent.blueprintRevisionId);
  setOwnValue(record, 'blueprintSha256', intent.blueprintSha256);
  setOwnValue(record, 'canonicalCurriculumSnapshotSha256', intent.canonicalCurriculumSnapshotSha256);
  setOwnValue(record, 'scopeCoverageComplete', binding.scopeCoverageComplete);
  setOwnValue(record, 'coverageSummary', binding.coverageSummary);
  return objectFreeze(record);
}

function calculateManifestGovernanceSnapshotSha256FromSnapshots(resolverContext, artifact, binding) {
  const artifactRecord = objectCreate(null);
  setOwnValue(artifactRecord, 'packageId', artifact.packageId);
  setOwnValue(artifactRecord, 'packageArtifactSha256', artifact.packageArtifactSha256);
  setOwnValue(artifactRecord, 'coverageLocator', artifact.coverageLocator);
  setOwnValue(artifactRecord, 'manifest', manifestForDigest(artifact.manifest));
  const payload = objectCreate(null);
  setOwnValue(payload, 'contractVersion', SERVER_RESOLVED_CONTENT_PACKAGE_MANIFEST_COVERAGE_GOVERNANCE_READINESS_CONTRACT_VERSION);
  setOwnValue(payload, 'resolverContext', copyResolverContextForDigest(resolverContext));
  setOwnValue(payload, 'packageArtifact', objectFreeze(artifactRecord));
  setOwnValue(payload, 'coverageBinding', bindingForDigest(binding));
  return createHash('sha256')
    .update(`k12.package-manifest-coverage-governance-snapshot/v1:${canonicalJson(objectFreeze(payload))}`, 'utf8')
    .digest('hex');
}

function prepareGovernanceReadiness(resolverContext, artifact, coverageBindingResolverInput, errors) {
  const target = createDerivedPackageTarget(artifact);
  const binding = evaluateDerivedCoverageBinding(coverageBindingResolverInput, target, errors);
  if (!binding) return null;
  if (!validateManifestLifecycleReferences(artifact, coverageBindingResolverInput, errors)) return null;
  if (dateParse(resolverContext.observedAt) < dateParse(binding.packageCoverageBindingIntent.observedAt)) {
    addError(errors, 'resolverContext.observedAt', 'resolver_observed_before_package_coverage_binding', 'the manifest governance observation cannot predate the package coverage binding observation');
    return null;
  }
  return objectFreeze({ target, binding });
}

function validateManifestLifecycleReferences(artifact, coverageBindingResolverInput, errors) {
  const snapshots = coverageBindingResolverInput.coverageReviewResolverInput.itemLifecycleSnapshots;
  let selected = null;
  for (let index = 0; index < arrayLength(snapshots); index += 1) {
    if (snapshots[index].itemId === artifact.coverageLocator.itemId) selected = snapshots[index];
  }
  // A successful coverage recomputation already proves exactly one approved
  // lifecycle snapshot and four unique approved discipline decisions exist.
  if (!selected || !selected.releaseCandidate) {
    addError(errors, 'packageArtifact.coverageLocator.itemId', 'manifest_lifecycle_binding_missing', 'the manifest requires a matching recomputed approved lifecycle snapshot');
    return false;
  }
  const initialErrorCount = arrayLength(errors);
  const content = artifact.manifest.content;
  if (content.authorId !== selected.authorId) {
    addError(errors, 'packageArtifact.manifest.content.authorId', 'manifest_author_lifecycle_mismatch', 'the manifest author must match the independently resolved content author');
  }
  const decisions = selected.releaseCandidate.decisions;
  for (let referenceIndex = 0; referenceIndex < arrayLength(REVIEW_REFERENCE_FIELDS); referenceIndex += 1) {
    const discipline = REVIEW_REFERENCE_FIELDS[referenceIndex][0];
    const field = REVIEW_REFERENCE_FIELDS[referenceIndex][1];
    let decisionId = null;
    for (let decisionIndex = 0; decisionIndex < arrayLength(decisions); decisionIndex += 1) {
      if (decisions[decisionIndex].discipline === discipline) decisionId = decisions[decisionIndex].decisionId;
    }
    if (content[field] !== decisionId) {
      addError(errors, `packageArtifact.manifest.content.${field}`, 'manifest_review_lifecycle_mismatch', 'the manifest review reference must match the resolved decision for its review discipline');
    }
  }
  return arrayLength(errors) === initialErrorCount;
}

function createBlockedResult(errors) {
  const copiedErrors = [];
  for (let index = 0; index < arrayLength(errors); index += 1) {
    appendOwnArrayValue(copiedErrors, errors[index]);
  }
  const result = objectCreate(null);
  setOwnValue(result, 'eligible', false);
  setOwnValue(result, 'governanceReady', false);
  setOwnValue(result, 'nextState', 'blocked');
  setOwnValue(result, 'errors', objectFreeze(copiedErrors));
  return objectFreeze(result);
}

function createReadyResult(resolverContext, artifact, prepared, manifestGovernanceSnapshotSha256) {
  const manifest = artifact.manifest;
  const packageBinding = prepared.binding.packageCoverageBindingIntent;
  const intent = objectCreate(null);
  setOwnValue(intent, 'contractVersion', SERVER_RESOLVED_CONTENT_PACKAGE_MANIFEST_COVERAGE_GOVERNANCE_READINESS_CONTRACT_VERSION);
  setOwnValue(intent, 'resolverSnapshotId', resolverContext.snapshotId);
  setOwnValue(intent, 'observedAt', resolverContext.observedAt);
  setOwnValue(intent, 'sourcePolicyVersion', resolverContext.sourcePolicyVersion);
  setOwnValue(intent, 'manifestGovernanceSnapshotSha256', manifestGovernanceSnapshotSha256);
  setOwnValue(intent, 'packageId', artifact.packageId);
  setOwnValue(intent, 'packageArtifactSha256', artifact.packageArtifactSha256);
  setOwnValue(intent, 'packageCoverageBindingSha256', packageBinding.packageCoverageBindingSha256);
  setOwnValue(intent, 'coverageReviewReadinessIntentSha256', packageBinding.coverageReviewReadinessIntentSha256);
  setOwnValue(intent, 'lifecycleReviewSnapshotSha256', packageBinding.lifecycleReviewSnapshotSha256);
  setOwnValue(intent, 'blueprintId', packageBinding.blueprintId);
  setOwnValue(intent, 'blueprintRevisionId', packageBinding.blueprintRevisionId);
  setOwnValue(intent, 'blueprintSha256', packageBinding.blueprintSha256);
  setOwnValue(intent, 'canonicalCurriculumSnapshotSha256', packageBinding.canonicalCurriculumSnapshotSha256);
  setOwnValue(intent, 'itemId', packageBinding.itemId);
  setOwnValue(intent, 'contentItemId', packageBinding.contentItemId);
  setOwnValue(intent, 'contentRevisionId', packageBinding.contentRevisionId);
  setOwnValue(intent, 'contentRevisionSha256', packageBinding.contentRevisionSha256);
  setOwnValue(intent, 'assetSetSha256', packageBinding.assetSetSha256);
  setOwnValue(intent, 'blueprintCellId', packageBinding.blueprintCellId);
  setOwnValue(intent, 'dataGovernance', objectFreeze(copyRecordFields(manifest.dataGovernance, [
    'owner',
    'steward',
    'classification',
    'processingPurpose',
    'retentionClass'
  ])));
  const result = objectCreate(null);
  setOwnValue(result, 'eligible', true);
  setOwnValue(result, 'governanceReady', true);
  setOwnValue(result, 'nextState', 'package_manifest_coverage_governance_ready');
  setOwnValue(result, 'scopeCoverageComplete', prepared.binding.scopeCoverageComplete);
  setOwnValue(result, 'coverageSummary', prepared.binding.coverageSummary);
  const verificationScope = objectCreate(null);
  setOwnValue(verificationScope, 'manifestMetadata', 'integrity_bound');
  setOwnValue(verificationScope, 'curriculumAndCoverage', 'recomputed');
  setOwnValue(verificationScope, 'authorAndReviewReferences', 'matched_to_resolved_lifecycle');
  setOwnValue(verificationScope, 'publicationAuthority', 'not_evaluated');
  setOwnValue(verificationScope, 'assetEvidenceAndBytes', 'not_evaluated');
  setOwnValue(verificationScope, 'sourceUsageRights', 'not_evaluated');
  setOwnValue(result, 'verificationScope', objectFreeze(verificationScope));
  setOwnValue(result, 'packageManifestCoverageGovernanceIntent', objectFreeze(intent));
  setOwnValue(result, 'errors', objectFreeze([]));
  return objectFreeze(result);
}

/**
 * Calculate the detached, domain-separated integrity binding for one
 * manifest-governance snapshot. It excludes its own hash and is not an
 * authorization signature, package-byte verification, publication decision,
 * or delivery decision.
 */
export function calculatePackageManifestCoverageGovernanceSnapshotSha256(
  resolverContext,
  packageArtifact,
  coverageBindingResolverInput
) {
  const errors = [];
  try {
    const context = snapshotResolverContext(resolverContext, errors, false);
    const artifact = snapshotPackageArtifact(packageArtifact, errors);
    const bindingInput = snapshotCoverageBindingResolverInput(coverageBindingResolverInput, errors);
    if (!context || !artifact || !bindingInput || arrayLength(errors) > 0) return null;
    const prepared = prepareGovernanceReadiness(context, artifact, bindingInput, errors);
    if (!prepared || arrayLength(errors) > 0) return null;
    return calculateManifestGovernanceSnapshotSha256FromSnapshots(context, artifact, prepared.binding);
  } catch {
    return null;
  }
}

/**
 * Return only a package-manifest-coverage-governance-ready intent. It does not
 * create a V4 package, publish a V3 package, open delivery, or persist data.
 */
export function evaluateServerResolvedContentPackageManifestCoverageGovernanceReadiness(value) {
  const errors = [];
  try {
    const root = snapshotClosedRecord(value, ROOT_FIELDS, 'input', errors);
    if (!root) return createBlockedResult(errors);
    requireFields(root, ROOT_FIELDS, 'input', errors);
    if (root.contractVersion !== SERVER_RESOLVED_CONTENT_PACKAGE_MANIFEST_COVERAGE_GOVERNANCE_READINESS_CONTRACT_VERSION) {
      addError(errors, 'input.contractVersion', 'contract_version_unsupported', 'the server-resolved package manifest coverage governance contract version is unsupported');
    }
    const resolverContext = snapshotResolverContext(root.resolverContext, errors, true);
    const packageArtifact = snapshotPackageArtifact(root.packageArtifact, errors);
    const coverageBindingResolverInput = snapshotCoverageBindingResolverInput(root.coverageBindingResolverInput, errors);
    if (!resolverContext || !packageArtifact || !coverageBindingResolverInput || arrayLength(errors) > 0) {
      return createBlockedResult(errors);
    }
    const prepared = prepareGovernanceReadiness(
      resolverContext,
      packageArtifact,
      coverageBindingResolverInput,
      errors
    );
    if (!prepared || arrayLength(errors) > 0) return createBlockedResult(errors);
    const calculatedSnapshotHash = calculateManifestGovernanceSnapshotSha256FromSnapshots(
      resolverContext,
      packageArtifact,
      prepared.binding
    );
    if (resolverContext.manifestGovernanceSnapshotSha256 !== calculatedSnapshotHash) {
      addError(errors, 'resolverContext.manifestGovernanceSnapshotSha256', 'manifest_governance_snapshot_hash_mismatch', 'the resolver snapshot hash must bind the exact V3 manifest metadata, artifact identity, and recomputed coverage binding');
      return createBlockedResult(errors);
    }
    return createReadyResult(resolverContext, packageArtifact, prepared, calculatedSnapshotHash);
  } catch {
    addError(errors, 'input', 'package_manifest_coverage_governance_input_unreadable', 'the package manifest coverage governance input could not be safely read');
    return createBlockedResult(errors);
  }
}
