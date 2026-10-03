/**
 * Pure composition contract for a trusted server-side resolver.
 *
 * It recomputes coverage-review readiness and binds one immutable package
 * content target to one approved blueprint-cell record. It neither validates a
 * package manifest, authenticates a caller, writes, publishes, delivers, nor
 * exposes content. A production adapter must resolve records from authorized
 * append-only sources, re-check active policy and revocation state, verify the
 * immutable package artifact independently, and atomically persist any later
 * binding.
 */

import { createHash } from 'node:crypto';

import {
  evaluateServerResolvedQuestionCoverageReviewReadiness
} from './server_resolved_question_coverage_review_readiness.mjs';

export const SERVER_RESOLVED_CONTENT_PACKAGE_COVERAGE_BINDING_CONTRACT_VERSION = '1.0.0';

const arrayIsArray = Array.isArray;
const arraySort = Function.call.bind(Array.prototype.sort);
const dateConstructor = Date;
const dateParse = Date.parse;
const dateToISOString = Function.call.bind(Date.prototype.toISOString);
const numberConstructor = Number;
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
const stringConstructor = String;
const stringReplace = Function.call.bind(String.prototype.replace);
const jsonStringify = JSON.stringify;

const MAX_ERRORS = 32;
const MAX_OWN_FIELDS = 48;
const MAX_BINDINGS = 20_000;
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
  'packageContentTarget',
  'coverageReviewResolverInput'
];
const RESOLVER_CONTEXT_FIELDS = [
  'contractVersion',
  'snapshotId',
  'observedAt',
  'sourcePolicyVersion',
  'packageCoverageSnapshotSha256'
];
const PACKAGE_TARGET_FIELDS = [
  'packageId',
  'packageManifestSha256',
  'itemId',
  'contentItemId',
  'contentRevisionId',
  'contentRevisionSha256',
  'assetSetSha256',
  'blueprintCellId',
  'curriculum'
];
const CURRICULUM_FIELDS = [
  'registryEntryId',
  'programVersion',
  'grade',
  'courseKey',
  'outcomeCode'
];
const BRIDGE_RESULT_FIELDS = [
  'eligible',
  'nextState',
  'scopeCoverageComplete',
  'coverageSummary',
  'coverageReviewReadinessIntent',
  'errors'
];
const COVERAGE_SUMMARY_FIELDS = [
  'targetCount',
  'approvedItemCount',
  'underTargetCellCount',
  'overTargetCellCount',
  'missingRequiredVariantCellCount'
];
const COVERAGE_REVIEW_INTENT_FIELDS = [
  'contractVersion',
  'resolverSnapshotId',
  'observedAt',
  'sourcePolicyVersion',
  'lifecycleReviewSnapshotSha256',
  'blueprintId',
  'blueprintRevisionId',
  'blueprintSha256',
  'canonicalCurriculumSnapshotSha256',
  'programVersion',
  'grade',
  'courseKey',
  'approvedContentRevisionBindings',
  'coverageReviewReadinessIntentSha256'
];
const APPROVED_BINDING_FIELDS = [
  'itemId',
  'contentItemId',
  'contentRevisionId',
  'contentRevisionSha256',
  'assetSetSha256',
  'blueprintCellId',
  'registryEntryId',
  'outcomeCode',
  'microSkillId'
];
const EXACT_BINDING_IDENTITY_FIELDS = [
  'itemId',
  'contentItemId',
  'contentRevisionId',
  'contentRevisionSha256',
  'assetSetSha256',
  'blueprintCellId'
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
    snapshot.contractVersion !== SERVER_RESOLVED_CONTENT_PACKAGE_COVERAGE_BINDING_CONTRACT_VERSION ||
    !isOpaqueId(snapshot.snapshotId) ||
    !isCanonicalUtcTimestamp(snapshot.observedAt) ||
    !isVersion(snapshot.sourcePolicyVersion) ||
    (requireSnapshotHash
      ? !isSha256(snapshot.packageCoverageSnapshotSha256)
      : snapshot.packageCoverageSnapshotSha256 !== null && !isSha256(snapshot.packageCoverageSnapshotSha256))
  ) {
    addError(errors, 'resolverContext', 'resolver_context_invalid', 'a versioned, timestamped package-coverage resolver context is required');
  }
  return objectFreeze(snapshot);
}

function snapshotPackageContentTarget(value, errors) {
  const target = snapshotClosedRecord(value, PACKAGE_TARGET_FIELDS, 'packageContentTarget', errors);
  if (!target) return null;
  requireFields(target, PACKAGE_TARGET_FIELDS, 'packageContentTarget', errors);
  if (arrayLength(errors) > 0) return null;
  const curriculum = snapshotClosedRecord(target.curriculum, CURRICULUM_FIELDS, 'packageContentTarget.curriculum', errors);
  if (!curriculum) return null;
  requireFields(curriculum, CURRICULUM_FIELDS, 'packageContentTarget.curriculum', errors);
  if (
    !isOpaqueId(target.packageId) ||
    !isSha256(target.packageManifestSha256) ||
    !isOpaqueId(target.itemId) ||
    !isOpaqueId(target.contentItemId) ||
    !isOpaqueId(target.contentRevisionId) ||
    !isSha256(target.contentRevisionSha256) ||
    !isSha256(target.assetSetSha256) ||
    !isOpaqueId(target.blueprintCellId) ||
    !isOpaqueId(curriculum.registryEntryId) ||
    !isVersion(curriculum.programVersion) ||
    !numberIsSafeInteger(curriculum.grade) ||
    curriculum.grade < 1 ||
    curriculum.grade > 12 ||
    !isOpaqueId(curriculum.courseKey) ||
    !isOutcomeCode(curriculum.outcomeCode)
  ) {
    addError(errors, 'packageContentTarget', 'package_content_target_invalid', 'an immutable package content identity and curriculum binding are required');
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(PACKAGE_TARGET_FIELDS); index += 1) {
    const field = PACKAGE_TARGET_FIELDS[index];
    setOwnValue(snapshot, field, field === 'curriculum' ? objectFreeze(curriculum) : target[field]);
  }
  return objectFreeze(snapshot);
}

function snapshotCoverageSummary(value, errors) {
  const summary = snapshotClosedRecord(value, COVERAGE_SUMMARY_FIELDS, 'coverageReviewResult.coverageSummary', errors);
  if (!summary) return null;
  requireFields(summary, COVERAGE_SUMMARY_FIELDS, 'coverageReviewResult.coverageSummary', errors);
  for (let index = 0; index < arrayLength(COVERAGE_SUMMARY_FIELDS); index += 1) {
    const field = COVERAGE_SUMMARY_FIELDS[index];
    if (!numberIsSafeInteger(summary[field]) || summary[field] < 0) {
      addError(errors, `coverageReviewResult.coverageSummary.${field}`, 'coverage_summary_invalid', 'coverage summary values must be safe non-negative integers');
    }
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(COVERAGE_SUMMARY_FIELDS); index += 1) {
    const field = COVERAGE_SUMMARY_FIELDS[index];
    setOwnValue(snapshot, field, summary[field]);
  }
  return objectFreeze(snapshot);
}

function snapshotApprovedBinding(value, path, errors) {
  const binding = snapshotClosedRecord(value, APPROVED_BINDING_FIELDS, path, errors);
  if (!binding) return null;
  requireFields(binding, APPROVED_BINDING_FIELDS, path, errors);
  if (
    !isOpaqueId(binding.itemId) ||
    !isOpaqueId(binding.contentItemId) ||
    !isOpaqueId(binding.contentRevisionId) ||
    !isSha256(binding.contentRevisionSha256) ||
    !isSha256(binding.assetSetSha256) ||
    !isOpaqueId(binding.blueprintCellId) ||
    !isOpaqueId(binding.registryEntryId) ||
    !isOutcomeCode(binding.outcomeCode) ||
    !isOpaqueId(binding.microSkillId)
  ) {
    addError(errors, path, 'approved_binding_invalid', 'the coverage-review binding must contain one exact immutable content and curriculum identity');
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(APPROVED_BINDING_FIELDS); index += 1) {
    const field = APPROVED_BINDING_FIELDS[index];
    setOwnValue(snapshot, field, binding[field]);
  }
  return objectFreeze(snapshot);
}

function calculateCoverageReviewReadinessIntentSha256(intent) {
  const definition = objectCreate(null);
  for (let index = 0; index < arrayLength(COVERAGE_REVIEW_INTENT_FIELDS) - 1; index += 1) {
    const field = COVERAGE_REVIEW_INTENT_FIELDS[index];
    setOwnValue(definition, field, intent[field]);
  }
  return createHash('sha256')
    .update(`k12.coverage-review-readiness-intent/v1:${canonicalJson(objectFreeze(definition))}`, 'utf8')
    .digest('hex');
}

function snapshotCoverageReviewIntent(value, errors) {
  const intent = snapshotClosedRecord(value, COVERAGE_REVIEW_INTENT_FIELDS, 'coverageReviewResult.coverageReviewReadinessIntent', errors);
  if (!intent) return null;
  requireFields(intent, COVERAGE_REVIEW_INTENT_FIELDS, 'coverageReviewResult.coverageReviewReadinessIntent', errors);
  if (
    intent.contractVersion !== SERVER_RESOLVED_CONTENT_PACKAGE_COVERAGE_BINDING_CONTRACT_VERSION ||
    !isOpaqueId(intent.resolverSnapshotId) ||
    !isCanonicalUtcTimestamp(intent.observedAt) ||
    !isVersion(intent.sourcePolicyVersion) ||
    !isSha256(intent.lifecycleReviewSnapshotSha256) ||
    !isOpaqueId(intent.blueprintId) ||
    !isOpaqueId(intent.blueprintRevisionId) ||
    !isSha256(intent.blueprintSha256) ||
    !isSha256(intent.canonicalCurriculumSnapshotSha256) ||
    !isVersion(intent.programVersion) ||
    !numberIsSafeInteger(intent.grade) ||
    intent.grade < 1 ||
    intent.grade > 12 ||
    !isOpaqueId(intent.courseKey) ||
    !isSha256(intent.coverageReviewReadinessIntentSha256)
  ) {
    addError(errors, 'coverageReviewResult.coverageReviewReadinessIntent', 'coverage_review_intent_invalid', 'the recomputed coverage-review intent is structurally invalid');
  }
  const rawBindings = snapshotDenseArray(
    intent.approvedContentRevisionBindings,
    'coverageReviewResult.coverageReviewReadinessIntent.approvedContentRevisionBindings',
    errors,
    MAX_BINDINGS
  );
  if (!rawBindings) return null;
  const bindings = [];
  for (let index = 0; index < arrayLength(rawBindings); index += 1) {
    const binding = snapshotApprovedBinding(rawBindings[index], `coverageReviewResult.coverageReviewReadinessIntent.approvedContentRevisionBindings[${index}]`, errors);
    if (binding) appendOwnArrayValue(bindings, binding);
  }
  if (arrayLength(bindings) === 0) {
    addError(errors, 'coverageReviewResult.coverageReviewReadinessIntent.approvedContentRevisionBindings', 'approved_binding_missing', 'at least one approved content binding is required');
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < arrayLength(COVERAGE_REVIEW_INTENT_FIELDS); index += 1) {
    const field = COVERAGE_REVIEW_INTENT_FIELDS[index];
    setOwnValue(snapshot, field, field === 'approvedContentRevisionBindings' ? objectFreeze(bindings) : intent[field]);
  }
  const calculatedHash = calculateCoverageReviewReadinessIntentSha256(snapshot);
  if (snapshot.coverageReviewReadinessIntentSha256 !== calculatedHash) {
    addError(errors, 'coverageReviewResult.coverageReviewReadinessIntent.coverageReviewReadinessIntentSha256', 'coverage_review_intent_hash_mismatch', 'the coverage-review intent hash must bind the exact recomputed coverage evidence');
  }
  return objectFreeze(snapshot);
}

function resolveCoverageReviewReadiness(value, errors) {
  let result;
  try {
    result = evaluateServerResolvedQuestionCoverageReviewReadiness(value);
  } catch {
    addError(errors, 'coverageReviewResolverInput', 'coverage_review_readiness_unreadable', 'coverage-review readiness could not be safely recomputed');
    return null;
  }
  const root = snapshotClosedRecord(result, BRIDGE_RESULT_FIELDS, 'coverageReviewResult', errors);
  if (!root) return null;
  requireFields(root, BRIDGE_RESULT_FIELDS, 'coverageReviewResult', errors);
  const resultErrors = snapshotDenseArray(root.errors, 'coverageReviewResult.errors', errors, MAX_ERRORS);
  if (
    root.eligible !== true ||
    root.nextState !== 'coverage_review_ready' ||
    root.scopeCoverageComplete !== true && root.scopeCoverageComplete !== false ||
    !resultErrors ||
    arrayLength(resultErrors) !== 0
  ) {
    addError(errors, 'coverageReviewResolverInput', 'coverage_review_readiness_blocked', 'the package binding requires a freshly recomputed coverage-review-ready result');
    return null;
  }
  const coverageSummary = snapshotCoverageSummary(root.coverageSummary, errors);
  const intent = snapshotCoverageReviewIntent(root.coverageReviewReadinessIntent, errors);
  if (!coverageSummary || !intent) return null;
  const snapshot = objectCreate(null);
  setOwnValue(snapshot, 'scopeCoverageComplete', root.scopeCoverageComplete);
  setOwnValue(snapshot, 'coverageSummary', coverageSummary);
  setOwnValue(snapshot, 'coverageReviewReadinessIntent', intent);
  return objectFreeze(snapshot);
}

function sameFieldValues(left, right, fields) {
  for (let index = 0; index < arrayLength(fields); index += 1) {
    const field = fields[index];
    if (left[field] !== right[field]) return false;
  }
  return true;
}

function resolveExactApprovedBinding(target, intent, errors) {
  const bindings = intent.approvedContentRevisionBindings;
  const sameItemBindings = [];
  const sameContentBindings = [];
  const exactBindings = [];
  for (let index = 0; index < arrayLength(bindings); index += 1) {
    const binding = bindings[index];
    if (binding.itemId === target.itemId) appendOwnArrayValue(sameItemBindings, binding);
    if (sameFieldValues(binding, target, [
      'contentItemId',
      'contentRevisionId',
      'contentRevisionSha256',
      'assetSetSha256'
    ])) {
      appendOwnArrayValue(sameContentBindings, binding);
    }
    if (sameFieldValues(binding, target, EXACT_BINDING_IDENTITY_FIELDS)) {
      appendOwnArrayValue(exactBindings, binding);
    }
  }
  if (arrayLength(exactBindings) === 1) return exactBindings[0];
  if (arrayLength(exactBindings) > 1) {
    addError(errors, 'packageContentTarget', 'package_target_binding_ambiguous', 'the immutable package target must bind exactly one approved coverage record');
    return null;
  }
  if (arrayLength(sameItemBindings) === 0) {
    addError(errors, 'packageContentTarget.itemId', 'package_target_item_binding_missing', 'the package target item is absent from the recomputed approved coverage bindings');
    return null;
  }
  if (arrayLength(sameContentBindings) === 0) {
    addError(errors, 'packageContentTarget', 'package_target_content_binding_mismatch', 'the package target immutable content tuple does not match its approved coverage binding');
    return null;
  }
  addError(errors, 'packageContentTarget.blueprintCellId', 'package_target_blueprint_cell_mismatch', 'the package target blueprint cell does not match its approved coverage binding');
  return null;
}

function packageTargetCurriculumMatches(target, binding, intent) {
  return (
    target.curriculum.registryEntryId === binding.registryEntryId &&
    target.curriculum.outcomeCode === binding.outcomeCode &&
    target.curriculum.programVersion === intent.programVersion &&
    target.curriculum.grade === intent.grade &&
    target.curriculum.courseKey === intent.courseKey
  );
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

function copyCoverageReviewForDigest(coverageReview, selectedBinding) {
  const intent = coverageReview.coverageReviewReadinessIntent;
  const bridgeResolverContext = objectCreate(null);
  setOwnValue(bridgeResolverContext, 'resolverSnapshotId', intent.resolverSnapshotId);
  setOwnValue(bridgeResolverContext, 'observedAt', intent.observedAt);
  setOwnValue(bridgeResolverContext, 'sourcePolicyVersion', intent.sourcePolicyVersion);
  const record = objectCreate(null);
  setOwnValue(record, 'coverageReviewReadinessIntentSha256', intent.coverageReviewReadinessIntentSha256);
  setOwnValue(record, 'lifecycleReviewSnapshotSha256', intent.lifecycleReviewSnapshotSha256);
  setOwnValue(record, 'bridgeResolverContext', objectFreeze(bridgeResolverContext));
  setOwnValue(record, 'blueprintId', intent.blueprintId);
  setOwnValue(record, 'blueprintRevisionId', intent.blueprintRevisionId);
  setOwnValue(record, 'blueprintSha256', intent.blueprintSha256);
  setOwnValue(record, 'canonicalCurriculumSnapshotSha256', intent.canonicalCurriculumSnapshotSha256);
  setOwnValue(record, 'programVersion', intent.programVersion);
  setOwnValue(record, 'grade', intent.grade);
  setOwnValue(record, 'courseKey', intent.courseKey);
  setOwnValue(record, 'selectedBinding', selectedBinding);
  setOwnValue(record, 'scopeCoverageComplete', coverageReview.scopeCoverageComplete);
  setOwnValue(record, 'coverageSummary', coverageReview.coverageSummary);
  return objectFreeze(record);
}

function calculatePackageCoverageSnapshotSha256FromSnapshots(resolverContext, target, coverageReview, selectedBinding) {
  const payload = objectCreate(null);
  setOwnValue(payload, 'contractVersion', SERVER_RESOLVED_CONTENT_PACKAGE_COVERAGE_BINDING_CONTRACT_VERSION);
  setOwnValue(payload, 'resolverContext', copyResolverContextForDigest(resolverContext));
  setOwnValue(payload, 'packageContentTarget', target);
  setOwnValue(payload, 'coverageReview', copyCoverageReviewForDigest(coverageReview, selectedBinding));
  return createHash('sha256')
    .update(`k12.package-coverage-binding-snapshot/v1:${canonicalJson(objectFreeze(payload))}`, 'utf8')
    .digest('hex');
}

function prepareCoverageBinding(resolverContext, packageContentTarget, coverageReviewResolverInput, errors) {
  const coverageReview = resolveCoverageReviewReadiness(coverageReviewResolverInput, errors);
  if (!coverageReview) return null;
  const intent = coverageReview.coverageReviewReadinessIntent;
  if (dateParse(resolverContext.observedAt) < dateParse(intent.observedAt)) {
    addError(errors, 'resolverContext.observedAt', 'resolver_observed_before_coverage_review_observation', 'the package binding observation cannot predate the recomputed coverage-review observation');
    return null;
  }
  const selectedBinding = resolveExactApprovedBinding(packageContentTarget, intent, errors);
  if (!selectedBinding) return null;
  if (!packageTargetCurriculumMatches(packageContentTarget, selectedBinding, intent)) {
    addError(errors, 'packageContentTarget.curriculum', 'package_target_curriculum_mismatch', 'the package target curriculum must match the selected recomputed coverage binding and blueprint scope');
    return null;
  }
  return objectFreeze({ coverageReview, selectedBinding });
}

function createBlockedResult(errors) {
  const copiedErrors = [];
  for (let index = 0; index < arrayLength(errors); index += 1) {
    appendOwnArrayValue(copiedErrors, errors[index]);
  }
  const result = objectCreate(null);
  setOwnValue(result, 'eligible', false);
  setOwnValue(result, 'bindingReady', false);
  setOwnValue(result, 'nextState', 'blocked');
  setOwnValue(result, 'errors', objectFreeze(copiedErrors));
  return objectFreeze(result);
}

function createReadyResult(resolverContext, target, prepared, packageCoverageSnapshotSha256) {
  const intent = prepared.coverageReview.coverageReviewReadinessIntent;
  const bindingIntent = objectCreate(null);
  setOwnValue(bindingIntent, 'contractVersion', SERVER_RESOLVED_CONTENT_PACKAGE_COVERAGE_BINDING_CONTRACT_VERSION);
  setOwnValue(bindingIntent, 'resolverSnapshotId', resolverContext.snapshotId);
  setOwnValue(bindingIntent, 'observedAt', resolverContext.observedAt);
  setOwnValue(bindingIntent, 'sourcePolicyVersion', resolverContext.sourcePolicyVersion);
  setOwnValue(bindingIntent, 'packageCoverageSnapshotSha256', packageCoverageSnapshotSha256);
  setOwnValue(bindingIntent, 'packageCoverageBindingSha256', packageCoverageSnapshotSha256);
  setOwnValue(bindingIntent, 'packageId', target.packageId);
  setOwnValue(bindingIntent, 'packageManifestSha256', target.packageManifestSha256);
  setOwnValue(bindingIntent, 'itemId', target.itemId);
  setOwnValue(bindingIntent, 'contentItemId', target.contentItemId);
  setOwnValue(bindingIntent, 'contentRevisionId', target.contentRevisionId);
  setOwnValue(bindingIntent, 'contentRevisionSha256', target.contentRevisionSha256);
  setOwnValue(bindingIntent, 'assetSetSha256', target.assetSetSha256);
  setOwnValue(bindingIntent, 'blueprintCellId', target.blueprintCellId);
  setOwnValue(bindingIntent, 'blueprintId', intent.blueprintId);
  setOwnValue(bindingIntent, 'blueprintRevisionId', intent.blueprintRevisionId);
  setOwnValue(bindingIntent, 'blueprintSha256', intent.blueprintSha256);
  setOwnValue(bindingIntent, 'canonicalCurriculumSnapshotSha256', intent.canonicalCurriculumSnapshotSha256);
  setOwnValue(bindingIntent, 'coverageReviewReadinessIntentSha256', intent.coverageReviewReadinessIntentSha256);
  setOwnValue(bindingIntent, 'lifecycleReviewSnapshotSha256', intent.lifecycleReviewSnapshotSha256);
  const result = objectCreate(null);
  setOwnValue(result, 'eligible', true);
  setOwnValue(result, 'bindingReady', true);
  setOwnValue(result, 'nextState', 'package_coverage_binding_ready');
  setOwnValue(result, 'scopeCoverageComplete', prepared.coverageReview.scopeCoverageComplete);
  setOwnValue(result, 'coverageSummary', prepared.coverageReview.coverageSummary);
  setOwnValue(result, 'packageCoverageBindingIntent', objectFreeze(bindingIntent));
  setOwnValue(result, 'errors', objectFreeze([]));
  return objectFreeze(result);
}

/**
 * Calculate a detached, domain-separated package-coverage snapshot binding.
 * It is an integrity binding only, not an authorization signature, manifest
 * validation result, publication decision, or delivery decision.
 */
export function calculatePackageCoverageSnapshotSha256(
  resolverContext,
  packageContentTarget,
  coverageReviewResolverInput
) {
  const errors = [];
  try {
    const context = snapshotResolverContext(resolverContext, errors, false);
    const target = snapshotPackageContentTarget(packageContentTarget, errors);
    if (!context || !target || arrayLength(errors) > 0) return null;
    const prepared = prepareCoverageBinding(context, target, coverageReviewResolverInput, errors);
    if (!prepared || arrayLength(errors) > 0) return null;
    return calculatePackageCoverageSnapshotSha256FromSnapshots(
      context,
      target,
      prepared.coverageReview,
      prepared.selectedBinding
    );
  } catch {
    return null;
  }
}

/**
 * Return only a package-coverage-binding-ready intent. It deliberately does
 * not validate a package manifest or create publication or delivery authority.
 */
export function evaluateServerResolvedContentPackageCoverageBinding(value) {
  const errors = [];
  try {
    const root = snapshotClosedRecord(value, ROOT_FIELDS, 'input', errors);
    if (!root) return createBlockedResult(errors);
    requireFields(root, ROOT_FIELDS, 'input', errors);
    if (root.contractVersion !== SERVER_RESOLVED_CONTENT_PACKAGE_COVERAGE_BINDING_CONTRACT_VERSION) {
      addError(errors, 'input.contractVersion', 'contract_version_unsupported', 'the server-resolved package coverage binding contract version is unsupported');
    }
    const resolverContext = snapshotResolverContext(root.resolverContext, errors, true);
    const packageContentTarget = snapshotPackageContentTarget(root.packageContentTarget, errors);
    if (!resolverContext || !packageContentTarget || arrayLength(errors) > 0) return createBlockedResult(errors);
    const prepared = prepareCoverageBinding(
      resolverContext,
      packageContentTarget,
      root.coverageReviewResolverInput,
      errors
    );
    if (!prepared || arrayLength(errors) > 0) return createBlockedResult(errors);
    const calculatedSnapshotHash = calculatePackageCoverageSnapshotSha256FromSnapshots(
      resolverContext,
      packageContentTarget,
      prepared.coverageReview,
      prepared.selectedBinding
    );
    if (resolverContext.packageCoverageSnapshotSha256 !== calculatedSnapshotHash) {
      addError(errors, 'resolverContext.packageCoverageSnapshotSha256', 'package_coverage_snapshot_hash_mismatch', 'the resolver snapshot hash must bind the exact package target and recomputed coverage-review evidence');
      return createBlockedResult(errors);
    }
    return createReadyResult(resolverContext, packageContentTarget, prepared, calculatedSnapshotHash);
  } catch {
    addError(errors, 'input', 'package_coverage_binding_input_unreadable', 'the package coverage binding input could not be safely read');
    return createBlockedResult(errors);
  }
}
