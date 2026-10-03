/**
 * Pure composition contract for a trusted server-side resolver.
 *
 * It recomputes assessment coverage and joins each counted approved item to
 * independently resolved lifecycle and human-review evidence. It neither
 * authenticates a caller nor writes, publishes, delivers, or exposes content.
 * A production adapter must resolve the input from authorized append-only
 * sources, re-check revocations and active policy, and atomically persist any
 * later release binding.
 */

import { createHash } from 'node:crypto';

import { evaluateDecisionBackedReleaseReadiness } from './decision_backed_release_readiness.mjs';
import { evaluateQuestionCoverage } from './question_coverage_blueprint.mjs';

export const SERVER_RESOLVED_QUESTION_COVERAGE_REVIEW_READINESS_CONTRACT_VERSION = '1.0.0';

const arrayIsArray = Array.isArray;
const arraySort = Function.call.bind(Array.prototype.sort);
const dateConstructor = Date;
const dateParse = Date.parse;
const dateToISOString = Function.call.bind(Date.prototype.toISOString);
const mapConstructor = Map;
const mapGet = Function.call.bind(Map.prototype.get);
const mapHas = Function.call.bind(Map.prototype.has);
const mapSet = Function.call.bind(Map.prototype.set);
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
const jsonStringify = JSON.stringify;
const weakSetConstructor = WeakSet;
const weakSetAdd = Function.call.bind(WeakSet.prototype.add);
const weakSetDelete = Function.call.bind(WeakSet.prototype.delete);
const weakSetHas = Function.call.bind(WeakSet.prototype.has);

const MAX_ERRORS = 32;
const MAX_OWN_FIELDS = 48;
const MAX_INPUT_ARRAY_LENGTH = 20_000;
const MAX_INPUT_DEPTH = 32;
const MAX_INPUT_NODES = 1_000_000;
const MAX_DECISIONS = 4;
const MAX_EVIDENCE_REFS = 16;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/u;
const CANONICAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;
const NON_WHITESPACE_PATTERN = /\S/u;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/u;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;

const ROOT_FIELDS = [
  'contractVersion',
  'resolverContext',
  'coverageEvaluationInput',
  'itemLifecycleSnapshots'
];
const RESOLVER_CONTEXT_FIELDS = [
  'contractVersion',
  'snapshotId',
  'observedAt',
  'sourcePolicyVersion',
  'lifecycleReviewSnapshotSha256'
];
const COVERAGE_INPUT_FIELDS = [
  'contractVersion',
  'blueprint',
  'canonicalCurriculumEntries',
  'canonicalCurriculumSnapshotSha256',
  'itemMetadata'
];
const LIFECYCLE_SNAPSHOT_FIELDS = [
  'itemId',
  'contentItemId',
  'contentRevisionId',
  'contentRevisionSha256',
  'assetSetSha256',
  'authorId',
  'itemState',
  'releaseCandidate'
];
const RELEASE_CANDIDATE_FIELDS = ['revision', 'decisions', 'release'];
const RELEASE_REVISION_FIELDS = [
  'contentItemId',
  'revisionId',
  'sha256',
  'assetSetSha256',
  'lifecycleState',
  'authorId'
];
const REVIEW_DECISION_FIELDS = [
  'contractVersion',
  'decisionId',
  'reviewedRevision',
  'contentAuthorId',
  'discipline',
  'outcome',
  'decidedAt',
  'reviewPolicyVersion',
  'rationale',
  'reviewer',
  'evidenceRefs',
  'dataGovernance'
];
const REVIEWED_REVISION_FIELDS = [
  'contentItemId',
  'revisionId',
  'sha256',
  'assetSetSha256'
];
const REVIEWER_FIELDS = ['reviewerId', 'role'];
const EVIDENCE_FIELDS = ['evidenceId', 'evidenceKind', 'sha256'];
const DATA_GOVERNANCE_FIELDS = [
  'owner',
  'steward',
  'classification',
  'processingPurpose',
  'retentionClass'
];
const RELEASE_FIELDS = ['releaseRequestId', 'requestedBy', 'rollbackPlanId'];
const ITEM_IDENTITY_FIELDS = [
  'contentItemId',
  'contentRevisionId',
  'contentRevisionSha256',
  'assetSetSha256'
];
const ITEM_STATES = ['draft', 'approved', 'withdrawn'];
const REVIEW_REQUIREMENTS = objectFreeze([
  objectFreeze({
    discipline: 'academic',
    role: 'academic_reviewer',
    evidenceKind: 'curriculum_registry_entry'
  }),
  objectFreeze({
    discipline: 'assessment',
    role: 'assessment_reviewer',
    evidenceKind: 'assessment_rubric'
  }),
  objectFreeze({
    discipline: 'rights', role: 'rights_reviewer', evidenceKind: 'rights_record' }),
  objectFreeze({
    discipline: 'accessibility',
    role: 'accessibility_reviewer',
    evidenceKind: 'accessibility_record'
  })
]);

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

function addError(errors, path, code, message) {
  const length = arrayLength(errors);
  if (length >= MAX_ERRORS - 1) {
    if (length === MAX_ERRORS - 1) {
      appendOwnArrayValue(errors, objectFreeze({
        path: 'input',
        code: 'validation_error_limit_exceeded',
        message: 'validation stopped after reaching the fixed error-output limit'
      }));
    }
    return;
  }
  appendOwnArrayValue(errors, objectFreeze({ path, code, message }));
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
  return value === canonical || value === canonical.replace('.000Z', 'Z');
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

function snapshotSafeValue(value, path, errors, context, depth) {
  if (context.nodeCount >= MAX_INPUT_NODES) {
    addError(errors, path, 'input_node_limit_exceeded', 'the input exceeds the fixed structural node limit');
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
    addError(errors, path, 'value_type_invalid', 'only JSON-shaped data values are permitted');
    return null;
  }
  if (depth >= MAX_INPUT_DEPTH) {
    addError(errors, path, 'input_depth_exceeds_limit', 'the input exceeds the fixed structural depth limit');
    return null;
  }
  if (weakSetHas(context.active, value)) {
    addError(errors, path, 'cyclic_value_not_allowed', 'cyclic input values are not permitted');
    return null;
  }
  weakSetAdd(context.active, value);
  try {
    if (arrayIsArray(value)) {
      const rawEntries = snapshotDenseArray(value, path, errors, MAX_INPUT_ARRAY_LENGTH);
      if (!rawEntries) return null;
      const snapshot = [];
      for (let index = 0; index < arrayLength(rawEntries); index += 1) {
        appendOwnArrayValue(snapshot, snapshotSafeValue(rawEntries[index], `${path}[${index}]`, errors, context, depth + 1));
      }
      return objectFreeze(snapshot);
    }
    if (!isPlainRecord(value)) {
      addError(errors, path, 'record_invalid', 'only plain records are permitted');
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
      if (!descriptor || !descriptor.enumerable) {
        addError(errors, `${path}.${field}`, 'non_enumerable_field_not_allowed', 'the schema permits enumerable fields only');
        continue;
      }
      if (!objectHasOwn(descriptor, 'value')) {
        addError(errors, `${path}.${field}`, 'accessor_field_not_allowed', 'the schema permits data fields only');
        continue;
      }
      setOwnValue(snapshot, field, snapshotSafeValue(descriptor.value, `${path}.${field}`, errors, context, depth + 1));
    }
    return objectFreeze(snapshot);
  } finally {
    weakSetDelete(context.active, value);
  }
}

function snapshotCoverageEvaluationInput(value, errors) {
  const root = snapshotClosedRecord(value, COVERAGE_INPUT_FIELDS, 'coverageEvaluationInput', errors);
  if (!root) return null;
  requireFields(root, COVERAGE_INPUT_FIELDS, 'coverageEvaluationInput', errors);
  if (arrayLength(errors) > 0) return null;
  const context = { active: new weakSetConstructor(), nodeCount: 0 };
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(COVERAGE_INPUT_FIELDS); index += 1) {
    const field = COVERAGE_INPUT_FIELDS[index];
    setOwnValue(snapshot, field, snapshotSafeValue(root[field], `coverageEvaluationInput.${field}`, errors, context, 0));
  }
  return objectFreeze(snapshot);
}

function snapshotResolverContext(value, errors, requireLifecycleReviewSnapshotHash = true) {
  const snapshot = snapshotClosedRecord(value, RESOLVER_CONTEXT_FIELDS, 'resolverContext', errors);
  if (!snapshot) return null;
  requireFields(snapshot, RESOLVER_CONTEXT_FIELDS, 'resolverContext', errors);
  if (
    snapshot.contractVersion !== SERVER_RESOLVED_QUESTION_COVERAGE_REVIEW_READINESS_CONTRACT_VERSION ||
    !isOpaqueId(snapshot.snapshotId) ||
    !isCanonicalUtcTimestamp(snapshot.observedAt) ||
    !isVersion(snapshot.sourcePolicyVersion) ||
    (requireLifecycleReviewSnapshotHash
      ? !isSha256(snapshot.lifecycleReviewSnapshotSha256)
      : snapshot.lifecycleReviewSnapshotSha256 !== null && !isSha256(snapshot.lifecycleReviewSnapshotSha256))
  ) {
    addError(errors, 'resolverContext', 'resolver_context_invalid', 'a versioned, timestamped trusted-resolver context is required');
  }
  return objectFreeze(snapshot);
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

function calculateResolvedLifecycleReviewSnapshotSha256FromSnapshots(resolverContext, lifecycleSnapshots) {
  const lifecycleRecords = [];
  for (let index = 0; index < arrayLength(lifecycleSnapshots); index += 1) {
    const entry = lifecycleSnapshots[index];
    appendOwnArrayValue(lifecycleRecords, entry?.snapshot ?? null);
  }
  const contextDefinition = objectCreate(null);
  setOwnValue(contextDefinition, 'contractVersion', resolverContext.contractVersion);
  setOwnValue(contextDefinition, 'snapshotId', resolverContext.snapshotId);
  setOwnValue(contextDefinition, 'observedAt', resolverContext.observedAt);
  setOwnValue(contextDefinition, 'sourcePolicyVersion', resolverContext.sourcePolicyVersion);
  const payload = objectCreate(null);
  setOwnValue(payload, 'contractVersion', SERVER_RESOLVED_QUESTION_COVERAGE_REVIEW_READINESS_CONTRACT_VERSION);
  setOwnValue(payload, 'resolverContext', objectFreeze(contextDefinition));
  setOwnValue(payload, 'itemLifecycleSnapshots', objectFreeze(lifecycleRecords));
  return createHash('sha256')
    .update(`k12.resolved-lifecycle-review-snapshot/v1:${canonicalJson(objectFreeze(payload))}`, 'utf8')
    .digest('hex');
}

/**
 * Calculate the detached, domain-separated integrity binding for a resolver's
 * lifecycle/review snapshot. It is not an authorization signature or proof
 * that the supplied records came from an authoritative source.
 */
export function calculateResolvedLifecycleReviewSnapshotSha256(resolverContext, itemLifecycleSnapshots) {
  const errors = [];
  try {
    const context = snapshotResolverContext(resolverContext, errors, false);
    const structuralContext = { active: new weakSetConstructor(), nodeCount: 0 };
    const lifecycleSnapshots = snapshotSafeValue(
      itemLifecycleSnapshots,
      'itemLifecycleSnapshots',
      errors,
      structuralContext,
      0
    );
    if (!context || !lifecycleSnapshots || !arrayIsArray(lifecycleSnapshots) || arrayLength(errors) > 0) return null;
    const detachedEntries = [];
    for (let index = 0; index < arrayLength(lifecycleSnapshots); index += 1) {
      appendOwnArrayValue(detachedEntries, objectFreeze({ snapshot: lifecycleSnapshots[index] }));
    }
    return calculateResolvedLifecycleReviewSnapshotSha256FromSnapshots(context, objectFreeze(detachedEntries));
  } catch {
    return null;
  }
}

function snapshotReviewedRevision(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, REVIEWED_REVISION_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, REVIEWED_REVISION_FIELDS, path, errors);
  if (!isOpaqueId(snapshot.contentItemId) || !isOpaqueId(snapshot.revisionId) || !isSha256(snapshot.sha256) || !isSha256(snapshot.assetSetSha256)) {
    addError(errors, path, 'reviewed_revision_invalid', 'a complete immutable reviewed revision identity is required');
  }
  return objectFreeze(snapshot);
}

function snapshotReviewer(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, REVIEWER_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, REVIEWER_FIELDS, path, errors);
  if (!isOpaqueId(snapshot.reviewerId) || !isOpaqueId(snapshot.role)) {
    addError(errors, path, 'reviewer_invalid', 'a stable reviewer identity and role are required');
  }
  return objectFreeze(snapshot);
}

function snapshotEvidenceRefs(value, path, errors) {
  const entries = snapshotDenseArray(value, path, errors, MAX_EVIDENCE_REFS);
  if (!entries) return null;
  if (arrayLength(entries) === 0) {
    addError(errors, path, 'evidence_missing', 'at least one review evidence record is required');
    return objectFreeze([]);
  }
  const snapshot = [];
  for (let index = 0; index < arrayLength(entries); index += 1) {
    const evidencePath = `${path}[${index}]`;
    const evidence = snapshotClosedRecord(entries[index], EVIDENCE_FIELDS, evidencePath, errors);
    if (evidence) {
      requireFields(evidence, EVIDENCE_FIELDS, evidencePath, errors);
      if (!isOpaqueId(evidence.evidenceId) || !isVersion(evidence.evidenceKind) || !isSha256(evidence.sha256)) {
        addError(errors, evidencePath, 'evidence_invalid', 'a stable evidence identity, kind, and SHA-256 are required');
      }
      appendOwnArrayValue(snapshot, objectFreeze(evidence));
    }
  }
  return objectFreeze(snapshot);
}

function snapshotDataGovernance(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, DATA_GOVERNANCE_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, DATA_GOVERNANCE_FIELDS, path, errors);
  for (let index = 0; index < arrayLength(DATA_GOVERNANCE_FIELDS); index += 1) {
    const field = DATA_GOVERNANCE_FIELDS[index];
    if (!isNonEmptyText(snapshot[field])) {
      addError(errors, `${path}.${field}`, 'data_governance_field_invalid', 'a non-empty bounded data-governance value is required');
    }
  }
  return objectFreeze(snapshot);
}

function reviewRequirementFor(discipline) {
  for (let index = 0; index < arrayLength(REVIEW_REQUIREMENTS); index += 1) {
    const requirement = REVIEW_REQUIREMENTS[index];
    if (requirement.discipline === discipline) return requirement;
  }
  return null;
}

function containsEvidenceKind(evidenceRefs, evidenceKind) {
  if (!evidenceRefs) return false;
  for (let index = 0; index < arrayLength(evidenceRefs); index += 1) {
    if (evidenceRefs[index]?.evidenceKind === evidenceKind) return true;
  }
  return false;
}

function snapshotReviewDecision(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, REVIEW_DECISION_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, REVIEW_DECISION_FIELDS, path, errors);
  const reviewedRevision = snapshotReviewedRevision(snapshot.reviewedRevision, `${path}.reviewedRevision`, errors);
  const reviewer = snapshotReviewer(snapshot.reviewer, `${path}.reviewer`, errors);
  const evidenceRefs = snapshotEvidenceRefs(snapshot.evidenceRefs, `${path}.evidenceRefs`, errors);
  const dataGovernance = snapshotDataGovernance(snapshot.dataGovernance, `${path}.dataGovernance`, errors);
  setOwnValue(snapshot, 'reviewedRevision', reviewedRevision);
  setOwnValue(snapshot, 'reviewer', reviewer);
  setOwnValue(snapshot, 'evidenceRefs', evidenceRefs);
  setOwnValue(snapshot, 'dataGovernance', dataGovernance);
  const requirement = reviewRequirementFor(snapshot.discipline);
  if (snapshot.contractVersion !== '2.0.0' || !isOpaqueId(snapshot.decisionId) || !isOpaqueId(snapshot.contentAuthorId) || !isVersion(snapshot.reviewPolicyVersion) || !isNonEmptyText(snapshot.rationale) || !requirement || snapshot.outcome !== 'approved' || !isCanonicalUtcTimestamp(snapshot.decidedAt)) {
    addError(errors, path, 'review_decision_invalid', 'a complete approved decision under the supported review policy is required');
  }
  if (requirement && reviewer && reviewer.role !== requirement.role) {
    addError(errors, `${path}.reviewer.role`, 'reviewer_role_invalid', 'the reviewer role must match the review discipline');
  }
  if (reviewer && reviewer.reviewerId === snapshot.contentAuthorId) {
    addError(errors, `${path}.reviewer.reviewerId`, 'author_review_conflict', 'a content author cannot review the same revision');
  }
  if (requirement && !containsEvidenceKind(evidenceRefs, requirement.evidenceKind)) {
    addError(errors, `${path}.evidenceRefs`, 'required_evidence_kind_missing', 'the review discipline requires its matching evidence kind');
  }
  return objectFreeze(snapshot);
}

function snapshotReleaseRevision(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, RELEASE_REVISION_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, RELEASE_REVISION_FIELDS, path, errors);
  if (!isOpaqueId(snapshot.contentItemId) || !isOpaqueId(snapshot.revisionId) || !isSha256(snapshot.sha256) || !isSha256(snapshot.assetSetSha256) || snapshot.lifecycleState !== 'approved' || !isOpaqueId(snapshot.authorId)) {
    addError(errors, path, 'release_revision_invalid', 'an approved immutable revision with a stable author is required');
  }
  return objectFreeze(snapshot);
}

function snapshotRelease(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, RELEASE_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, RELEASE_FIELDS, path, errors);
  for (let index = 0; index < arrayLength(RELEASE_FIELDS); index += 1) {
    const field = RELEASE_FIELDS[index];
    if (!isOpaqueId(snapshot[field])) {
      addError(errors, `${path}.${field}`, 'release_field_invalid', 'a stable release workflow identifier is required');
    }
  }
  return objectFreeze(snapshot);
}

function reviewedRevisionMatchesReleaseRevision(reviewedRevision, revision) {
  return (
    reviewedRevision &&
    revision &&
    reviewedRevision.contentItemId === revision.contentItemId &&
    reviewedRevision.revisionId === revision.revisionId &&
    reviewedRevision.sha256 === revision.sha256 &&
    reviewedRevision.assetSetSha256 === revision.assetSetSha256
  );
}

function snapshotReleaseCandidate(value, path, errors, observedAt) {
  const initialErrorCount = arrayLength(errors);
  const snapshot = snapshotClosedRecord(value, RELEASE_CANDIDATE_FIELDS, path, errors);
  if (!snapshot) return { snapshot: null, valid: false };
  requireFields(snapshot, RELEASE_CANDIDATE_FIELDS, path, errors);
  const revision = snapshotReleaseRevision(snapshot.revision, `${path}.revision`, errors);
  const rawDecisions = snapshotDenseArray(snapshot.decisions, `${path}.decisions`, errors, MAX_DECISIONS);
  const release = snapshotRelease(snapshot.release, `${path}.release`, errors);
  setOwnValue(snapshot, 'revision', revision);
  setOwnValue(snapshot, 'release', release);
  const decisions = [];
  const seenDisciplines = new setConstructor();
  const seenDecisionIds = new setConstructor();
  const seenReviewers = new setConstructor();
  if (rawDecisions) {
    if (arrayLength(rawDecisions) !== MAX_DECISIONS) {
      addError(errors, `${path}.decisions`, 'review_decision_count_invalid', 'exactly four independent review decisions are required');
    }
    for (let index = 0; index < arrayLength(rawDecisions); index += 1) {
      const decisionPath = `${path}.decisions[${index}]`;
      const decision = snapshotReviewDecision(rawDecisions[index], decisionPath, errors);
      appendOwnArrayValue(decisions, decision);
      if (!decision) continue;
      if (setHas(seenDecisionIds, decision.decisionId)) {
        addError(errors, `${decisionPath}.decisionId`, 'duplicate_review_decision_id', 'each independent review requires a distinct immutable decision identifier');
      }
      setAdd(seenDecisionIds, decision.decisionId);
      const requirement = reviewRequirementFor(decision.discipline);
      if (requirement && setHas(seenDisciplines, decision.discipline)) {
        addError(errors, `${decisionPath}.discipline`, 'duplicate_review_discipline', 'only one active decision is allowed for each review discipline');
      }
      if (requirement) setAdd(seenDisciplines, decision.discipline);
      if (decision.reviewer && setHas(seenReviewers, decision.reviewer.reviewerId)) {
        addError(errors, `${decisionPath}.reviewer.reviewerId`, 'reviewer_discipline_conflict', 'each review discipline requires an independent reviewer');
      }
      if (decision.reviewer) setAdd(seenReviewers, decision.reviewer.reviewerId);
      if (revision && !reviewedRevisionMatchesReleaseRevision(decision.reviewedRevision, revision)) {
        addError(errors, `${decisionPath}.reviewedRevision`, 'review_revision_binding_mismatch', 'every review must bind the exact release revision and asset set');
      }
      if (revision && decision.contentAuthorId !== revision.authorId) {
        addError(errors, `${decisionPath}.contentAuthorId`, 'decision_author_mismatch', 'every decision must name the release revision author');
      }
      if (isCanonicalUtcTimestamp(decision.decidedAt) && isCanonicalUtcTimestamp(observedAt) && dateParse(decision.decidedAt) > dateParse(observedAt)) {
        addError(errors, `${decisionPath}.decidedAt`, 'decision_after_resolver_snapshot', 'a resolved review decision cannot postdate its resolver observation');
      }
    }
  }
  for (let index = 0; index < arrayLength(REVIEW_REQUIREMENTS); index += 1) {
    const discipline = REVIEW_REQUIREMENTS[index].discipline;
    if (!setHas(seenDisciplines, discipline)) {
      addError(errors, `${path}.decisions`, 'required_review_missing', `${discipline} review is required before coverage review readiness`);
    }
  }
  setOwnValue(snapshot, 'decisions', objectFreeze(decisions));
  return {
    snapshot: objectFreeze(snapshot),
    valid: arrayLength(errors) === initialErrorCount
  };
}

function snapshotLifecycleSnapshot(value, path, errors, observedAt) {
  const initialErrorCount = arrayLength(errors);
  const snapshot = snapshotClosedRecord(value, LIFECYCLE_SNAPSHOT_FIELDS, path, errors);
  if (!snapshot) return { snapshot: null, reviewCandidateValid: false };
  requireFields(snapshot, LIFECYCLE_SNAPSHOT_FIELDS, path, errors);
  const idFields = ['itemId', 'contentItemId', 'contentRevisionId', 'authorId'];
  for (let index = 0; index < arrayLength(idFields); index += 1) {
    const field = idFields[index];
    if (!isOpaqueId(snapshot[field])) {
      addError(errors, `${path}.${field}`, 'opaque_id_invalid', 'a stable opaque identifier is required');
    }
  }
  if (!isSha256(snapshot.contentRevisionSha256) || !isSha256(snapshot.assetSetSha256) || !includesValue(ITEM_STATES, snapshot.itemState)) {
    addError(errors, path, 'lifecycle_snapshot_invalid', 'a complete immutable item lifecycle snapshot is required');
  }
  let releaseCandidate = null;
  let reviewCandidateValid = false;
  if (snapshot.releaseCandidate === null) {
    releaseCandidate = null;
  } else {
    const releaseCandidateResult = snapshotReleaseCandidate(snapshot.releaseCandidate, `${path}.releaseCandidate`, errors, observedAt);
    releaseCandidate = releaseCandidateResult.snapshot;
    reviewCandidateValid = releaseCandidateResult.valid;
    if (!reviewCandidateValid) {
      addError(errors, path, 'item_review_readiness_blocked', 'the item review evidence is not ready for coverage review');
    }
  }
  if (snapshot.itemState === 'approved' && releaseCandidate === null) {
    addError(errors, `${path}.releaseCandidate`, 'approved_release_candidate_missing', 'an approved item requires independently resolved review evidence');
  }
  if (snapshot.itemState !== 'approved' && releaseCandidate !== null) {
    addError(errors, `${path}.releaseCandidate`, 'nonapproved_release_candidate_unexpected', 'a draft or withdrawn item cannot carry release readiness evidence');
  }
  setOwnValue(snapshot, 'releaseCandidate', releaseCandidate);
  return {
    snapshot: objectFreeze(snapshot),
    reviewCandidateValid: reviewCandidateValid && arrayLength(errors) === initialErrorCount
  };
}

function snapshotLifecycleSnapshots(value, errors, observedAt) {
  const entries = snapshotDenseArray(value, 'itemLifecycleSnapshots', errors, MAX_INPUT_ARRAY_LENGTH);
  if (!entries) return null;
  const snapshots = [];
  const identifiers = new setConstructor();
  for (let index = 0; index < arrayLength(entries); index += 1) {
    const entry = snapshotLifecycleSnapshot(entries[index], `itemLifecycleSnapshots[${index}]`, errors, observedAt);
    if (entry.snapshot && setHas(identifiers, entry.snapshot.itemId)) {
      addError(errors, `itemLifecycleSnapshots[${index}].itemId`, 'duplicate_item_lifecycle_snapshot', 'each coverage item requires exactly one lifecycle snapshot');
    }
    if (entry.snapshot) setAdd(identifiers, entry.snapshot.itemId);
    appendOwnArrayValue(snapshots, objectFreeze(entry));
  }
  return objectFreeze(snapshots);
}

function validateGloballyUniqueReviewDecisionIdentifiers(lifecycleSnapshots, errors) {
  const seenDecisionIds = new setConstructor();
  for (let lifecycleIndex = 0; lifecycleIndex < arrayLength(lifecycleSnapshots); lifecycleIndex += 1) {
    const lifecycleSnapshot = lifecycleSnapshots[lifecycleIndex]?.snapshot;
    const candidate = lifecycleSnapshot?.releaseCandidate;
    if (!lifecycleSnapshot || lifecycleSnapshot.itemState !== 'approved' || !candidate) continue;
    for (let decisionIndex = 0; decisionIndex < arrayLength(candidate.decisions); decisionIndex += 1) {
      const decision = candidate.decisions[decisionIndex];
      if (!decision) continue;
      if (setHas(seenDecisionIds, decision.decisionId)) {
        addError(errors, `itemLifecycleSnapshots[${lifecycleIndex}].releaseCandidate.decisions[${decisionIndex}].decisionId`, 'duplicate_review_decision_id', 'an immutable review decision identifier may appear only once in a resolver snapshot');
        continue;
      }
      setAdd(seenDecisionIds, decision.decisionId);
    }
  }
}

function lifecycleIdentityMatchesItem(lifecycleSnapshot, item) {
  for (let index = 0; index < arrayLength(ITEM_IDENTITY_FIELDS); index += 1) {
    const field = ITEM_IDENTITY_FIELDS[index];
    if (lifecycleSnapshot[field] !== item[field]) return false;
  }
  return true;
}

function releaseRevisionMatchesItem(revision, item) {
  return (
    revision &&
    revision.contentItemId === item.contentItemId &&
    revision.revisionId === item.contentRevisionId &&
    revision.sha256 === item.contentRevisionSha256 &&
    revision.assetSetSha256 === item.assetSetSha256 &&
    revision.lifecycleState === 'approved'
  );
}

function evaluateApprovedItemReviewReadiness(lifecycleEntry, item, itemIndex, errors) {
  const path = `itemLifecycleSnapshots[${itemIndex}]`;
  const candidate = lifecycleEntry.snapshot.releaseCandidate;
  if (candidate?.revision?.authorId !== lifecycleEntry.snapshot.authorId) {
    addError(errors, path, 'item_lifecycle_author_mismatch', 'the release candidate author must match the independently resolved content author');
    return false;
  }
  if (!candidate || !lifecycleEntry.reviewCandidateValid || !releaseRevisionMatchesItem(candidate.revision, item)) {
    addError(errors, path, 'item_review_readiness_blocked', 'the approved item lacks matching independently resolved human-review readiness');
    return false;
  }
  try {
    const readiness = evaluateDecisionBackedReleaseReadiness(candidate);
    if (!readiness || readiness.ready !== true || readiness.nextState !== 'approval_ready' || !arrayIsArray(readiness.errors) || arrayLength(readiness.errors) !== 0) {
      addError(errors, path, 'item_review_readiness_blocked', 'the approved item lacks matching independently resolved human-review readiness');
      return false;
    }
  } catch {
    addError(errors, path, 'item_review_readiness_blocked', 'the approved item review evidence could not be safely evaluated');
    return false;
  }
  return true;
}

function createBlockedResult(errors) {
  const copiedErrors = [];
  for (let index = 0; index < arrayLength(errors); index += 1) {
    appendOwnArrayValue(copiedErrors, errors[index]);
  }
  const result = objectCreate(null);
  setOwnValue(result, 'eligible', false);
  setOwnValue(result, 'nextState', 'blocked');
  setOwnValue(result, 'errors', objectFreeze(copiedErrors));
  return objectFreeze(result);
}

function createCoverageSummary(report) {
  const summary = objectCreate(null);
  setOwnValue(summary, 'targetCount', report.summary.targetCount);
  setOwnValue(summary, 'approvedItemCount', report.summary.approvedItemCount);
  setOwnValue(summary, 'underTargetCellCount', report.summary.underTargetCellCount);
  setOwnValue(summary, 'overTargetCellCount', report.summary.overTargetCellCount);
  setOwnValue(summary, 'missingRequiredVariantCellCount', report.summary.missingRequiredVariantCellCount);
  return objectFreeze(summary);
}

/**
 * Return only an internal coverage-review-ready intent. It is deliberately
 * not a publication decision, a delivery decision, or authority evidence.
 */
export function evaluateServerResolvedQuestionCoverageReviewReadiness(value) {
  const errors = [];
  try {
    const root = snapshotClosedRecord(value, ROOT_FIELDS, 'input', errors);
    if (!root) return createBlockedResult(errors);
    requireFields(root, ROOT_FIELDS, 'input', errors);
    if (root.contractVersion !== SERVER_RESOLVED_QUESTION_COVERAGE_REVIEW_READINESS_CONTRACT_VERSION) {
      addError(errors, 'input.contractVersion', 'contract_version_unsupported', 'the server-resolved coverage review readiness contract version is unsupported');
    }
    const resolverContext = snapshotResolverContext(root.resolverContext, errors);
    const coverageEvaluationInput = snapshotCoverageEvaluationInput(root.coverageEvaluationInput, errors);
    const lifecycleSnapshots = resolverContext
      ? snapshotLifecycleSnapshots(root.itemLifecycleSnapshots, errors, resolverContext.observedAt)
      : null;
    if (arrayLength(errors) > 0 || !resolverContext || !coverageEvaluationInput || !lifecycleSnapshots) {
      return createBlockedResult(errors);
    }
    const calculatedResolverSnapshotSha256 = calculateResolvedLifecycleReviewSnapshotSha256FromSnapshots(
      resolverContext,
      lifecycleSnapshots
    );
    if (resolverContext.lifecycleReviewSnapshotSha256 !== calculatedResolverSnapshotSha256) {
      addError(errors, 'resolverContext.lifecycleReviewSnapshotSha256', 'resolver_snapshot_hash_mismatch', 'the resolver snapshot hash must bind the exact lifecycle and review records');
      return createBlockedResult(errors);
    }
    validateGloballyUniqueReviewDecisionIdentifiers(lifecycleSnapshots, errors);
    if (arrayLength(errors) > 0) return createBlockedResult(errors);

    const coverage = evaluateQuestionCoverage(coverageEvaluationInput);
    if (!coverage.valid || !coverage.report || coverage.report.status !== 'coverage_evaluated') {
      addError(errors, 'coverageEvaluationInput', 'coverage_evaluation_invalid', 'coverage must be recomputed successfully from the supplied immutable inputs');
      return createBlockedResult(errors);
    }
    const blueprintApproval = coverageEvaluationInput.blueprint.humanApproval;
    if (!blueprintApproval || dateParse(resolverContext.observedAt) < dateParse(blueprintApproval.approvedAt)) {
      addError(errors, 'resolverContext.observedAt', 'resolver_observed_before_blueprint_approval', 'the resolver observation cannot predate the human approval of the evaluated blueprint');
      return createBlockedResult(errors);
    }

    const lifecycleByItemId = new mapConstructor();
    for (let index = 0; index < arrayLength(lifecycleSnapshots); index += 1) {
      const entry = lifecycleSnapshots[index];
      if (entry.snapshot) mapSet(lifecycleByItemId, entry.snapshot.itemId, entry);
    }
    const itemMetadata = coverageEvaluationInput.itemMetadata;
    const itemIdentifiers = new setConstructor();
    const approvedBindings = [];
    let approvedItemCount = 0;
    for (let index = 0; index < arrayLength(itemMetadata); index += 1) {
      const item = itemMetadata[index];
      setAdd(itemIdentifiers, item.itemId);
      if (!mapHas(lifecycleByItemId, item.itemId)) {
        addError(errors, `itemMetadata[${index}]`, 'item_lifecycle_snapshot_missing', 'each coverage item requires one independently resolved lifecycle snapshot');
        continue;
      }
      const lifecycleEntry = mapGet(lifecycleByItemId, item.itemId);
      const lifecycleSnapshot = lifecycleEntry.snapshot;
      if (!lifecycleIdentityMatchesItem(lifecycleSnapshot, item)) {
        addError(errors, `itemMetadata[${index}]`, 'item_lifecycle_identity_mismatch', 'the lifecycle snapshot must bind the exact immutable content identity');
      }
      if (lifecycleSnapshot.itemState !== item.itemState) {
        addError(errors, `itemMetadata[${index}].itemState`, 'item_lifecycle_state_mismatch', 'the independently resolved lifecycle state must match coverage metadata');
      }
      if (item.itemState === 'approved') {
        approvedItemCount += 1;
        if (evaluateApprovedItemReviewReadiness(lifecycleEntry, item, index, errors)) {
          appendOwnArrayValue(approvedBindings, objectFreeze({
            itemId: item.itemId,
            contentItemId: item.contentItemId,
            contentRevisionId: item.contentRevisionId,
            contentRevisionSha256: item.contentRevisionSha256,
            assetSetSha256: item.assetSetSha256,
            blueprintCellId: item.blueprintCellId
          }));
        }
      } else if (lifecycleSnapshot.releaseCandidate !== null) {
        addError(errors, `itemMetadata[${index}]`, 'nonapproved_item_review_evidence_unexpected', 'draft or withdrawn coverage items cannot carry release readiness evidence');
      }
    }
    for (let index = 0; index < arrayLength(lifecycleSnapshots); index += 1) {
      const lifecycleEntry = lifecycleSnapshots[index];
      if (lifecycleEntry.snapshot && !setHas(itemIdentifiers, lifecycleEntry.snapshot.itemId)) {
        addError(errors, `itemLifecycleSnapshots[${index}]`, 'item_lifecycle_snapshot_unexpected', 'a lifecycle snapshot must correspond to exactly one coverage item');
      }
    }
    if (approvedItemCount === 0) {
      addError(errors, 'coverageEvaluationInput.itemMetadata', 'approved_item_missing', 'at least one approved item is required for coverage review readiness');
    }
    if (arrayLength(errors) > 0) return createBlockedResult(errors);

    const intent = objectCreate(null);
    setOwnValue(intent, 'resolverSnapshotId', resolverContext.snapshotId);
    setOwnValue(intent, 'observedAt', resolverContext.observedAt);
    setOwnValue(intent, 'sourcePolicyVersion', resolverContext.sourcePolicyVersion);
    setOwnValue(intent, 'lifecycleReviewSnapshotSha256', resolverContext.lifecycleReviewSnapshotSha256);
    setOwnValue(intent, 'blueprintId', coverage.report.blueprintId);
    setOwnValue(intent, 'blueprintRevisionId', coverage.report.blueprintRevisionId);
    setOwnValue(intent, 'blueprintSha256', coverage.report.blueprintSha256);
    setOwnValue(intent, 'canonicalCurriculumSnapshotSha256', coverageEvaluationInput.canonicalCurriculumSnapshotSha256);
    setOwnValue(intent, 'approvedContentRevisionBindings', objectFreeze(approvedBindings));
    const result = objectCreate(null);
    setOwnValue(result, 'eligible', true);
    setOwnValue(result, 'nextState', 'coverage_review_ready');
    setOwnValue(result, 'scopeCoverageComplete', coverage.report.coverageComplete);
    setOwnValue(result, 'coverageSummary', createCoverageSummary(coverage.report));
    setOwnValue(result, 'coverageReviewReadinessIntent', objectFreeze(intent));
    setOwnValue(result, 'errors', objectFreeze([]));
    return objectFreeze(result);
  } catch {
    addError(errors, 'input', 'coverage_review_readiness_input_unreadable', 'the coverage review readiness input could not be safely read');
    return createBlockedResult(errors);
  }
}
