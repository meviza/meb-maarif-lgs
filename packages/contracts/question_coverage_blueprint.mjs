/**
 * Pure DAMA-governed planning and coverage contract for assessment items.
 *
 * A blueprint is not a question bank, a MEB approval, a content release, an
 * AI decision, or a database record. It contains only versioned planning and
 * evidence references. A future adapter must resolve its curriculum snapshot,
 * human approval, item metadata, and authorization from trusted sources.
 */

import { createHash } from 'node:crypto';

export const QUESTION_COVERAGE_BLUEPRINT_CONTRACT_VERSION = '1.0.0';

const arrayIsArray = Array.isArray;
const arraySort = Function.call.bind(Array.prototype.sort);
const dateConstructor = Date;
const dateParse = Date.parse;
const dateToISOString = Function.call.bind(Date.prototype.toISOString);
const jsonStringify = JSON.stringify;
const mapConstructor = Map;
const mapGet = Function.call.bind(Map.prototype.get);
const mapSet = Function.call.bind(Map.prototype.set);
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
const setConstructor = Set;
const setAdd = Function.call.bind(Set.prototype.add);
const setHas = Function.call.bind(Set.prototype.has);

const MAX_ERRORS = 32;
const MAX_OWN_FIELDS = 48;
const MAX_WEEK_COUNT = 36;
const MAX_CELLS_PER_WEEK = 48;
const MAX_VARIANTS_PER_CELL = 16;
const MAX_MISCONCEPTIONS_PER_CELL = 16;
const MAX_CURRICULUM_ENTRIES = 1_024;
const MAX_ITEMS = 20_000;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/u;
const OUTCOME_CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]{2,127}$/u;
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/u;

const BLUEPRINT_FIELDS = [
  'contractVersion',
  'blueprintId',
  'blueprintRevisionId',
  'blueprintRevisionSequence',
  'lifecycleState',
  'blueprintSha256',
  'academicYear',
  'programVersion',
  'grade',
  'courseKey',
  'curriculumBinding',
  'dataGovernance',
  'humanApproval',
  'weekPlans'
];
const BLUEPRINT_DEFINITION_FIELDS = [
  'contractVersion',
  'blueprintId',
  'blueprintRevisionId',
  'blueprintRevisionSequence',
  'academicYear',
  'programVersion',
  'grade',
  'courseKey',
  'curriculumBinding',
  'dataGovernance',
  'weekPlans'
];
const CURRICULUM_BINDING_FIELDS = [
  'registrySnapshotId',
  'registrySnapshotSha256',
  'verificationState'
];
const DATA_GOVERNANCE_FIELDS = [
  'ownerId',
  'stewardId',
  'classification',
  'processingPurpose',
  'retentionClass',
  'accessPolicyId'
];
const HUMAN_APPROVAL_FIELDS = [
  'decisionId',
  'decisionSha256',
  'approvedById',
  'approvedAt',
  'approvedBlueprintDefinitionSha256'
];
const WEEK_PLAN_FIELDS = ['weekNumber', 'cells'];
const CELL_FIELDS = [
  'blueprintCellId',
  'registryEntryId',
  'outcomeCode',
  'microSkillId',
  'itemType',
  'responseMode',
  'cognitiveProcess',
  'difficultyBand',
  'targetCount',
  'requiredVariantKeys',
  'misconceptionHypothesisIds',
  'visualRequirement',
  'audioRequirement',
  'accessibilityProfileId',
  'visualRightsPolicyRef',
  'audioAccessibilityProfileId',
  'audioRightsPolicyRef'
];
const EVALUATION_INPUT_FIELDS = [
  'contractVersion',
  'blueprint',
  'canonicalCurriculumEntries',
  'canonicalCurriculumSnapshotSha256',
  'itemMetadata'
];
const CURRICULUM_SCOPE_FIELDS = ['programVersion', 'grade', 'courseKey'];
const CURRICULUM_ENTRY_FIELDS = [
  'contractVersion',
  'registryEntryId',
  'programVersion',
  'grade',
  'courseKey',
  'outcomeCode',
  'verificationState',
  'sourceDocument',
  'canonicalReview'
];
const SOURCE_DOCUMENT_FIELDS = ['sourceId', 'sourceUrl', 'retrievedAt', 'sha256'];
const CANONICAL_REVIEW_FIELDS = ['reviewId', 'reviewerId', 'reviewedAt'];
const ITEM_METADATA_FIELDS = [
  'itemId',
  'contentItemId',
  'contentRevisionId',
  'contentRevisionSha256',
  'assetSetSha256',
  'blueprintId',
  'blueprintRevisionId',
  'blueprintSha256',
  'blueprintCellId',
  'registryEntryId',
  'outcomeCode',
  'microSkillId',
  'itemType',
  'responseMode',
  'cognitiveProcess',
  'difficultyBand',
  'itemState',
  'variantKey',
  'misconceptionHypothesisId',
  'visualEvidenceStatus',
  'audioEvidenceStatus',
  'accessibilityProfileId',
  'visualRightsPolicyRef',
  'audioAccessibilityProfileId',
  'audioRightsPolicyRef'
];

const LIFECYCLE_STATES = ['draft', 'review_pending', 'approved', 'withdrawn'];
const ITEM_TYPES = ['selected_response', 'constructed_response', 'interactive_activity', 'observation', 'portfolio'];
const RESPONSE_MODES = ['multiple_choice', 'nonverbal_choice', 'short_response', 'open_response', 'interactive', 'observation', 'portfolio'];
const COGNITIVE_PROCESSES = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const DIFFICULTY_BANDS = ['foundation', 'developing', 'secure', 'advanced'];
const REPRESENTATION_REQUIREMENTS = ['none', 'supporting', 'critical'];
const ITEM_STATES = ['draft', 'approved', 'withdrawn'];
const EVIDENCE_STATUSES = ['not_applicable', 'verified'];
const RESPONSE_MODES_BY_ITEM_TYPE = objectFreeze({
  selected_response: objectFreeze(['multiple_choice', 'nonverbal_choice']),
  constructed_response: objectFreeze(['short_response', 'open_response']),
  interactive_activity: objectFreeze(['interactive']),
  observation: objectFreeze(['observation']),
  portfolio: objectFreeze(['portfolio'])
});

function setOwnValue(target, field, value) {
  objectDefineProperty(target, field, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function appendOwnArrayValue(array, value) {
  objectDefineProperty(array, String(array.length), {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function addError(errors, path, code, message) {
  if (errors.length >= MAX_ERRORS - 1) {
    if (errors.length === MAX_ERRORS - 1) {
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
  for (let index = 0; index < values.length; index += 1) {
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

function isVersion(value) {
  return typeof value === 'string' && regExpTest(VERSION_PATTERN, value);
}

function isSha256(value) {
  return typeof value === 'string' && regExpTest(SHA256_PATTERN, value);
}

function isPositiveSafeInteger(value) {
  return numberIsSafeInteger(value) && value >= 1;
}

function isStrictUtcTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) return false;
  const timestamp = dateParse(value);
  return !numberIsNaN(timestamp) && dateToISOString(new dateConstructor(timestamp)) === value;
}

function isHttpsUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isAcademicYear(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{4})$/u.exec(value);
  return match !== null && numberConstructor(match[2]) === numberConstructor(match[1]) + 1;
}

function snapshotClosedRecord(value, allowedFields, path, errors) {
  if (!isPlainRecord(value)) {
    addError(errors, path, 'record_invalid', 'a plain record with own enumerable data fields is required');
    return null;
  }
  const fields = reflectOwnKeys(value);
  if (fields.length > MAX_OWN_FIELDS) {
    addError(errors, path, 'record_field_count_exceeds_limit', 'the record exceeds the fixed own-field limit');
    return null;
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < fields.length; index += 1) {
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
  for (let index = 0; index < fields.length; index += 1) {
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
  const lengthDescriptor = objectGetOwnPropertyDescriptor(value, 'length');
  if (!lengthDescriptor || !objectHasOwn(lengthDescriptor, 'value') || !numberIsSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
    addError(errors, path, 'array_length_invalid', 'a safe non-negative array length is required');
    return null;
  }
  const length = lengthDescriptor.value;
  if (length > maximumLength) {
    addError(errors, path, 'array_length_exceeds_limit', 'the array exceeds its fixed length limit');
    return null;
  }
  const fields = reflectOwnKeys(value);
  for (let index = 0; index < fields.length; index += 1) {
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
    const descriptor = objectGetOwnPropertyDescriptor(value, String(index));
    if (!descriptor) {
      addError(errors, `${path}[${index}]`, 'array_hole_not_allowed', 'arrays must be dense');
      continue;
    }
    if (!descriptor.enumerable || !objectHasOwn(descriptor, 'value')) continue;
    appendOwnArrayValue(snapshot, descriptor.value);
  }
  return snapshot;
}

function snapshotOpaqueIdArray(value, path, errors, maximumLength) {
  const values = snapshotDenseArray(value, path, errors, maximumLength);
  if (!values) return null;
  const seen = new setConstructor();
  const snapshot = [];
  for (let index = 0; index < values.length; index += 1) {
    const entry = values[index];
    if (!isOpaqueId(entry)) {
      addError(errors, `${path}[${index}]`, 'opaque_id_invalid', 'a stable opaque identifier is required');
      continue;
    }
    if (setHas(seen, entry)) {
      addError(errors, `${path}[${index}]`, 'duplicate_identifier', 'each identifier may appear only once');
      continue;
    }
    setAdd(seen, entry);
    appendOwnArrayValue(snapshot, entry);
  }
  if (snapshot.length === 0) {
    addError(errors, path, 'array_empty', 'at least one identifier is required');
  }
  return objectFreeze(snapshot);
}

function snapshotCurriculumBinding(value, errors) {
  const path = 'blueprint.curriculumBinding';
  const snapshot = snapshotClosedRecord(value, CURRICULUM_BINDING_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, CURRICULUM_BINDING_FIELDS, path, errors);
  if (!isOpaqueId(snapshot.registrySnapshotId) || !isSha256(snapshot.registrySnapshotSha256) || snapshot.verificationState !== 'canonical_verified') {
    addError(errors, path, 'curriculum_binding_invalid', 'a canonical, immutable curriculum registry snapshot binding is required');
  }
  return objectFreeze(snapshot);
}

function snapshotDataGovernance(value, errors) {
  const path = 'blueprint.dataGovernance';
  const snapshot = snapshotClosedRecord(value, DATA_GOVERNANCE_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, DATA_GOVERNANCE_FIELDS, path, errors);
  const idFields = ['ownerId', 'stewardId', 'accessPolicyId'];
  for (let index = 0; index < idFields.length; index += 1) {
    if (!isOpaqueId(snapshot[idFields[index]])) {
      addError(errors, `${path}.${idFields[index]}`, 'governance_identifier_invalid', 'a stable governance identifier is required');
    }
  }
  if (snapshot.classification !== 'governance_record' || snapshot.processingPurpose !== 'assessment_content_planning' || snapshot.retentionClass !== 'content-planning-lifecycle') {
    addError(errors, path, 'data_governance_policy_invalid', 'the assessment planning data-governance policy is required');
  }
  return objectFreeze(snapshot);
}

function snapshotHumanApproval(value, errors) {
  const path = 'blueprint.humanApproval';
  if (value === null) return null;
  const snapshot = snapshotClosedRecord(value, HUMAN_APPROVAL_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, HUMAN_APPROVAL_FIELDS, path, errors);
  if (!isOpaqueId(snapshot.decisionId) || !isSha256(snapshot.decisionSha256) || !isOpaqueId(snapshot.approvedById) || !isStrictUtcTimestamp(snapshot.approvedAt) || !isSha256(snapshot.approvedBlueprintDefinitionSha256)) {
    addError(errors, path, 'human_approval_invalid', 'a complete, timestamped human approval reference is required');
  }
  return objectFreeze(snapshot);
}

function validateRepresentationRequirement(snapshot, requirementField, profileField, rightsField, path, errors) {
  const requirement = snapshot[requirementField];
  if (!includesValue(REPRESENTATION_REQUIREMENTS, requirement)) {
    addError(errors, `${path}.${requirementField}`, 'representation_requirement_invalid', 'a supported visual or audio requirement is required');
    return;
  }
  if (requirement === 'none') {
    if (snapshot[profileField] !== null || snapshot[rightsField] !== null) {
      addError(errors, path, 'representation_evidence_unexpected', 'a non-required representation must not carry stale accessibility or rights references');
    }
    return;
  }
  if (!isOpaqueId(snapshot[profileField]) || !isOpaqueId(snapshot[rightsField])) {
    addError(errors, path, 'representation_evidence_missing', 'a required representation needs both accessibility and rights references');
  }
}

function isCompatibleItemTypeAndResponseMode(itemType, responseMode) {
  const allowedModes = RESPONSE_MODES_BY_ITEM_TYPE[itemType];
  return arrayIsArray(allowedModes) && includesValue(allowedModes, responseMode);
}

function snapshotCoverageCell(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, CELL_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, CELL_FIELDS, path, errors);
  const idFields = ['blueprintCellId', 'registryEntryId', 'microSkillId'];
  for (let index = 0; index < idFields.length; index += 1) {
    if (!isOpaqueId(snapshot[idFields[index]])) {
      addError(errors, `${path}.${idFields[index]}`, 'opaque_id_invalid', 'a stable opaque identifier is required');
    }
  }
  if (!isOutcomeCode(snapshot.outcomeCode)) {
    addError(errors, `${path}.outcomeCode`, 'outcome_code_invalid', 'a stable curriculum outcome code is required');
  }
  if (!includesValue(ITEM_TYPES, snapshot.itemType) || !includesValue(RESPONSE_MODES, snapshot.responseMode) || !includesValue(COGNITIVE_PROCESSES, snapshot.cognitiveProcess) || !includesValue(DIFFICULTY_BANDS, snapshot.difficultyBand)) {
    addError(errors, path, 'assessment_taxonomy_invalid', 'a supported item type, response mode, cognitive process, and difficulty band are required');
  }
  if (includesValue(ITEM_TYPES, snapshot.itemType) && includesValue(RESPONSE_MODES, snapshot.responseMode) && !isCompatibleItemTypeAndResponseMode(snapshot.itemType, snapshot.responseMode)) {
    addError(errors, path, 'assessment_taxonomy_combination_invalid', 'the response mode must be compatible with the planned item type');
  }
  if (!isPositiveSafeInteger(snapshot.targetCount) || snapshot.targetCount > 10_000) {
    addError(errors, `${path}.targetCount`, 'target_count_invalid', 'a bounded positive item target is required');
  }
  const requiredVariantKeys = snapshotOpaqueIdArray(snapshot.requiredVariantKeys, `${path}.requiredVariantKeys`, errors, MAX_VARIANTS_PER_CELL);
  const misconceptionHypothesisIds = snapshotOpaqueIdArray(snapshot.misconceptionHypothesisIds, `${path}.misconceptionHypothesisIds`, errors, MAX_MISCONCEPTIONS_PER_CELL);
  setOwnValue(snapshot, 'requiredVariantKeys', requiredVariantKeys);
  setOwnValue(snapshot, 'misconceptionHypothesisIds', misconceptionHypothesisIds);
  if (requiredVariantKeys && snapshot.targetCount < requiredVariantKeys.length) {
    addError(errors, `${path}.targetCount`, 'target_count_below_variant_minimum', 'the target must be large enough to cover every required variant');
  }
  validateRepresentationRequirement(snapshot, 'visualRequirement', 'accessibilityProfileId', 'visualRightsPolicyRef', path, errors);
  validateRepresentationRequirement(snapshot, 'audioRequirement', 'audioAccessibilityProfileId', 'audioRightsPolicyRef', path, errors);
  return objectFreeze(snapshot);
}

function snapshotWeekPlan(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, WEEK_PLAN_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, WEEK_PLAN_FIELDS, path, errors);
  if (!isPositiveSafeInteger(snapshot.weekNumber) || snapshot.weekNumber > MAX_WEEK_COUNT) {
    addError(errors, `${path}.weekNumber`, 'week_number_invalid', 'a week number from 1 through 36 is required');
  }
  const cells = snapshotDenseArray(snapshot.cells, `${path}.cells`, errors, MAX_CELLS_PER_WEEK);
  if (!cells || cells.length === 0) {
    addError(errors, `${path}.cells`, 'week_cells_missing', 'each instructional week requires at least one blueprint cell');
    setOwnValue(snapshot, 'cells', objectFreeze([]));
    return objectFreeze(snapshot);
  }
  const normalizedCells = [];
  for (let index = 0; index < cells.length; index += 1) {
    appendOwnArrayValue(normalizedCells, snapshotCoverageCell(cells[index], `${path}.cells[${index}]`, errors));
  }
  arraySort(normalizedCells, (left, right) => String(left?.blueprintCellId ?? '').localeCompare(String(right?.blueprintCellId ?? '')));
  setOwnValue(snapshot, 'cells', objectFreeze(normalizedCells));
  return objectFreeze(snapshot);
}

function snapshotBlueprint(value, errors, allowHashPlaceholder, enforceApprovalDefinitionBinding = true) {
  const snapshot = snapshotClosedRecord(value, BLUEPRINT_FIELDS, 'blueprint', errors);
  if (!snapshot) return null;
  requireFields(snapshot, BLUEPRINT_FIELDS, 'blueprint', errors);
  if (snapshot.contractVersion !== QUESTION_COVERAGE_BLUEPRINT_CONTRACT_VERSION) {
    addError(errors, 'blueprint.contractVersion', 'contract_version_unsupported', 'the question coverage blueprint contract version is unsupported');
  }
  const idFields = ['blueprintId', 'blueprintRevisionId', 'courseKey'];
  for (let index = 0; index < idFields.length; index += 1) {
    if (!isOpaqueId(snapshot[idFields[index]])) {
      addError(errors, `blueprint.${idFields[index]}`, 'opaque_id_invalid', 'a stable opaque identifier is required');
    }
  }
  if (!isPositiveSafeInteger(snapshot.blueprintRevisionSequence)) {
    addError(errors, 'blueprint.blueprintRevisionSequence', 'revision_sequence_invalid', 'a positive blueprint revision sequence is required');
  }
  if (!includesValue(LIFECYCLE_STATES, snapshot.lifecycleState)) {
    addError(errors, 'blueprint.lifecycleState', 'lifecycle_state_invalid', 'a supported blueprint lifecycle state is required');
  }
  if (!allowHashPlaceholder && !isSha256(snapshot.blueprintSha256)) {
    addError(errors, 'blueprint.blueprintSha256', 'blueprint_hash_invalid', 'an immutable blueprint SHA-256 is required');
  }
  if (allowHashPlaceholder && snapshot.blueprintSha256 !== null && !isSha256(snapshot.blueprintSha256)) {
    addError(errors, 'blueprint.blueprintSha256', 'blueprint_hash_invalid', 'the optional hash placeholder must be null or a SHA-256');
  }
  if (!isAcademicYear(snapshot.academicYear) || !isVersion(snapshot.programVersion) || !isPositiveSafeInteger(snapshot.grade) || snapshot.grade > 8) {
    addError(errors, 'blueprint', 'curriculum_scope_invalid', 'a valid academic year, program version, and grade from 1 through 8 are required');
  }
  const curriculumBinding = snapshotCurriculumBinding(snapshot.curriculumBinding, errors);
  const dataGovernance = snapshotDataGovernance(snapshot.dataGovernance, errors);
  const humanApproval = snapshotHumanApproval(snapshot.humanApproval, errors);
  setOwnValue(snapshot, 'curriculumBinding', curriculumBinding);
  setOwnValue(snapshot, 'dataGovernance', dataGovernance);
  setOwnValue(snapshot, 'humanApproval', humanApproval);
  if (snapshot.lifecycleState === 'approved' && !humanApproval) {
    addError(errors, 'blueprint.humanApproval', 'human_approval_required', 'an approved blueprint requires a human approval reference');
  }
  if (snapshot.lifecycleState !== 'approved' && snapshot.humanApproval !== null) {
    addError(errors, 'blueprint.humanApproval', 'human_approval_unexpected', 'only an approved blueprint may carry an approval reference');
  }

  const weekPlans = snapshotDenseArray(snapshot.weekPlans, 'blueprint.weekPlans', errors, MAX_WEEK_COUNT);
  if (!weekPlans || weekPlans.length !== MAX_WEEK_COUNT) {
    addError(errors, 'blueprint.weekPlans', 'instructional_week_count_invalid', 'a blueprint must contain exactly 36 instructional weeks');
    setOwnValue(snapshot, 'weekPlans', objectFreeze([]));
    return objectFreeze(snapshot);
  }
  const normalizedWeeks = [];
  const seenWeeks = new setConstructor();
  const seenCells = new setConstructor();
  for (let index = 0; index < weekPlans.length; index += 1) {
    const week = snapshotWeekPlan(weekPlans[index], `blueprint.weekPlans[${index}]`, errors);
    if (week && setHas(seenWeeks, week.weekNumber)) {
      addError(errors, `blueprint.weekPlans[${index}].weekNumber`, 'duplicate_week_number', 'each instructional week may appear only once');
    }
    if (week) {
      setAdd(seenWeeks, week.weekNumber);
      for (let cellIndex = 0; cellIndex < week.cells.length; cellIndex += 1) {
        const cell = week.cells[cellIndex];
        if (!cell) continue;
        if (setHas(seenCells, cell.blueprintCellId)) {
          addError(errors, `blueprint.weekPlans[${index}].cells[${cellIndex}].blueprintCellId`, 'duplicate_blueprint_cell', 'a blueprint cell may occur only once per revision');
        }
        setAdd(seenCells, cell.blueprintCellId);
      }
    }
    appendOwnArrayValue(normalizedWeeks, week);
  }
  for (let weekNumber = 1; weekNumber <= MAX_WEEK_COUNT; weekNumber += 1) {
    if (!setHas(seenWeeks, weekNumber)) {
      addError(errors, 'blueprint.weekPlans', 'instructional_week_missing', 'every week from 1 through 36 must be present exactly once');
    }
  }
  arraySort(normalizedWeeks, (left, right) => (left?.weekNumber ?? 0) - (right?.weekNumber ?? 0));
  setOwnValue(snapshot, 'weekPlans', objectFreeze(normalizedWeeks));
  if (
    enforceApprovalDefinitionBinding &&
    snapshot.lifecycleState === 'approved' &&
    humanApproval &&
    humanApproval.approvedBlueprintDefinitionSha256 !== calculateDefinitionHashFromBlueprint(snapshot)
  ) {
    addError(errors, 'blueprint.humanApproval.approvedBlueprintDefinitionSha256', 'human_approval_definition_mismatch', 'the human approval must bind this exact immutable blueprint definition');
  }
  return objectFreeze(snapshot);
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return jsonStringify(value);
  if (arrayIsArray(value)) {
    let serialized = '[';
    for (let index = 0; index < value.length; index += 1) {
      if (index > 0) serialized += ',';
      serialized += canonicalJson(value[index]);
    }
    return `${serialized}]`;
  }
  const keys = objectKeys(value);
  arraySort(keys);
  let serialized = '{';
  for (let index = 0; index < keys.length; index += 1) {
    if (index > 0) serialized += ',';
    const key = keys[index];
    serialized += `${jsonStringify(key)}:${canonicalJson(value[key])}`;
  }
  return `${serialized}}`;
}

function calculateHashFromBlueprint(snapshot) {
  const payload = objectCreate(null);
  for (let index = 0; index < BLUEPRINT_FIELDS.length; index += 1) {
    const field = BLUEPRINT_FIELDS[index];
    if (field !== 'blueprintSha256') setOwnValue(payload, field, snapshot[field]);
  }
  return createHash('sha256')
    .update(`k12.question-coverage-blueprint/v1:${canonicalJson(payload)}`, 'utf8')
    .digest('hex');
}

function calculateDefinitionHashFromBlueprint(snapshot) {
  const payload = objectCreate(null);
  for (let index = 0; index < BLUEPRINT_DEFINITION_FIELDS.length; index += 1) {
    const field = BLUEPRINT_DEFINITION_FIELDS[index];
    setOwnValue(payload, field, snapshot[field]);
  }
  return createHash('sha256')
    .update(`k12.question-coverage-blueprint-definition/v1:${canonicalJson(payload)}`, 'utf8')
    .digest('hex');
}

/**
 * Calculate the immutable planning-definition digest that a human approval
 * must target. It excludes lifecycle state, approval envelope, and full
 * record hash so an approval can bind a stable definition without a hash
 * cycle. This is not a proof that the referenced decision is authoritative.
 */
export function calculateQuestionCoverageBlueprintDefinitionSha256(value) {
  const errors = [];
  try {
    const snapshot = snapshotBlueprint(value, errors, true, false);
    if (!snapshot || errors.length > 0) return null;
    return calculateDefinitionHashFromBlueprint(snapshot);
  } catch {
    return null;
  }
}

/**
 * Calculate the immutable definition digest for a structurally valid blueprint
 * candidate. A `null` `blueprintSha256` placeholder is permitted only here.
 */
export function calculateQuestionCoverageBlueprintSha256(value) {
  const errors = [];
  try {
    const snapshot = snapshotBlueprint(value, errors, true, false);
    if (!snapshot || errors.length > 0) return null;
    return calculateHashFromBlueprint(snapshot);
  } catch {
    return null;
  }
}

/**
 * Validate one immutable coverage blueprint. `valid` confirms only the
 * planning record's own structure and hash, never external authority or
 * content publication.
 */
export function validateQuestionCoverageBlueprint(value) {
  const errors = [];
  try {
    const normalizedBlueprint = snapshotBlueprint(value, errors, false);
    if (!normalizedBlueprint || errors.length > 0) return createBlueprintResult(false, errors);
    if (normalizedBlueprint.blueprintSha256 !== calculateHashFromBlueprint(normalizedBlueprint)) {
      addError(errors, 'blueprint.blueprintSha256', 'blueprint_hash_mismatch', 'the immutable blueprint hash must bind every declared planning field');
      return createBlueprintResult(false, errors);
    }
    return createBlueprintResult(true, [], normalizedBlueprint);
  } catch {
    addError(errors, 'blueprint', 'blueprint_unreadable', 'the blueprint could not be safely read');
    return createBlueprintResult(false, errors);
  }
}

function createBlueprintResult(valid, errors, normalizedBlueprint = null) {
  const copiedErrors = [];
  for (let index = 0; index < errors.length; index += 1) appendOwnArrayValue(copiedErrors, errors[index]);
  return objectFreeze({
    valid,
    errors: objectFreeze(copiedErrors),
    normalizedBlueprint
  });
}

function snapshotSourceDocument(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, SOURCE_DOCUMENT_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, SOURCE_DOCUMENT_FIELDS, path, errors);
  if (!isOpaqueId(snapshot.sourceId) || !isHttpsUrl(snapshot.sourceUrl) || !isStrictUtcTimestamp(snapshot.retrievedAt) || !isSha256(snapshot.sha256)) {
    addError(errors, path, 'curriculum_source_invalid', 'a complete source-provenance record is required');
  }
  return objectFreeze(snapshot);
}

function snapshotCanonicalReview(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, CANONICAL_REVIEW_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, CANONICAL_REVIEW_FIELDS, path, errors);
  if (!isOpaqueId(snapshot.reviewId) || !isOpaqueId(snapshot.reviewerId) || !isStrictUtcTimestamp(snapshot.reviewedAt)) {
    addError(errors, path, 'canonical_review_invalid', 'a complete human canonical-review record is required');
  }
  return objectFreeze(snapshot);
}

function snapshotCanonicalCurriculumEntry(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, CURRICULUM_ENTRY_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, CURRICULUM_ENTRY_FIELDS, path, errors);
  if (snapshot.contractVersion !== '1.0.0' || !isOpaqueId(snapshot.registryEntryId) || !isVersion(snapshot.programVersion) || !isPositiveSafeInteger(snapshot.grade) || snapshot.grade > 8 || !isOpaqueId(snapshot.courseKey) || !isOutcomeCode(snapshot.outcomeCode) || snapshot.verificationState !== 'canonical_verified') {
    addError(errors, path, 'canonical_curriculum_entry_invalid', 'a canonical curriculum outcome with matching stable scope is required');
  }
  const sourceDocument = snapshotSourceDocument(snapshot.sourceDocument, `${path}.sourceDocument`, errors);
  const canonicalReview = snapshotCanonicalReview(snapshot.canonicalReview, `${path}.canonicalReview`, errors);
  setOwnValue(snapshot, 'sourceDocument', sourceDocument);
  setOwnValue(snapshot, 'canonicalReview', canonicalReview);
  if (
    sourceDocument &&
    canonicalReview &&
    isStrictUtcTimestamp(sourceDocument.retrievedAt) &&
    isStrictUtcTimestamp(canonicalReview.reviewedAt) &&
    dateParse(canonicalReview.reviewedAt) < dateParse(sourceDocument.retrievedAt)
  ) {
    addError(errors, `${path}.canonicalReview.reviewedAt`, 'canonical_review_before_source', 'a canonical review cannot predate its declared source retrieval');
  }
  return objectFreeze(snapshot);
}

function snapshotCanonicalCurriculumEntries(value, errors) {
  const entries = snapshotDenseArray(value, 'canonicalCurriculumEntries', errors, MAX_CURRICULUM_ENTRIES);
  if (!entries) return null;
  const snapshot = [];
  const identifiers = new setConstructor();
  for (let index = 0; index < entries.length; index += 1) {
    const entry = snapshotCanonicalCurriculumEntry(entries[index], `canonicalCurriculumEntries[${index}]`, errors);
    if (entry && setHas(identifiers, entry.registryEntryId)) {
      addError(errors, `canonicalCurriculumEntries[${index}].registryEntryId`, 'duplicate_curriculum_entry', 'each canonical registry entry may appear only once');
    }
    if (entry) setAdd(identifiers, entry.registryEntryId);
    appendOwnArrayValue(snapshot, entry);
  }
  return objectFreeze(snapshot);
}

function snapshotCurriculumScope(value, errors) {
  const snapshot = snapshotClosedRecord(value, CURRICULUM_SCOPE_FIELDS, 'scope', errors);
  if (!snapshot) return null;
  requireFields(snapshot, CURRICULUM_SCOPE_FIELDS, 'scope', errors);
  if (!isVersion(snapshot.programVersion) || !isPositiveSafeInteger(snapshot.grade) || snapshot.grade > 8 || !isOpaqueId(snapshot.courseKey)) {
    addError(errors, 'scope', 'curriculum_scope_invalid', 'a complete program, grade from 1 through 8, and course scope is required');
  }
  return objectFreeze(snapshot);
}

function calculateCurriculumScopeHashFromEntries(entries, scope) {
  const scopedEntries = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (
      entry.programVersion === scope.programVersion &&
      entry.grade === scope.grade &&
      entry.courseKey === scope.courseKey
    ) {
      appendOwnArrayValue(scopedEntries, entry);
    }
  }
  if (scopedEntries.length === 0) return null;
  arraySort(scopedEntries, (left, right) => {
    if (left.registryEntryId < right.registryEntryId) return -1;
    if (left.registryEntryId > right.registryEntryId) return 1;
    return 0;
  });
  const payload = objectFreeze({
    contractVersion: QUESTION_COVERAGE_BLUEPRINT_CONTRACT_VERSION,
    programVersion: scope.programVersion,
    grade: scope.grade,
    courseKey: scope.courseKey,
    canonicalCurriculumEntries: objectFreeze(scopedEntries)
  });
  return createHash('sha256')
    .update(`k12.canonical-curriculum-scope/v1:${canonicalJson(payload)}`, 'utf8')
    .digest('hex');
}

/**
 * Calculate an order-independent digest for a complete, canonical curriculum
 * snapshot in one program, grade, and course scope. It is a source-binding
 * helper, not a proof that the supplied records came from an authority.
 */
export function calculateCanonicalCurriculumScopeSnapshotSha256(entries, scope) {
  const errors = [];
  try {
    const normalizedScope = snapshotCurriculumScope(scope, errors);
    const snapshot = snapshotCanonicalCurriculumEntries(entries, errors);
    if (!normalizedScope || !snapshot || errors.length > 0) return null;
    return calculateCurriculumScopeHashFromEntries(snapshot, normalizedScope);
  } catch {
    return null;
  }
}

function validateItemRepresentation(snapshot, statusField, profileField, rightsField, path, errors) {
  if (!includesValue(EVIDENCE_STATUSES, snapshot[statusField])) {
    addError(errors, `${path}.${statusField}`, 'item_evidence_status_invalid', 'a supported item evidence status is required');
    return;
  }
  if (snapshot[statusField] === 'not_applicable') {
    if (snapshot[profileField] !== null || snapshot[rightsField] !== null) {
      addError(errors, path, 'item_evidence_unexpected', 'a non-applicable representation must not carry evidence references');
    }
    return;
  }
  if (!isOpaqueId(snapshot[profileField]) || !isOpaqueId(snapshot[rightsField])) {
    addError(errors, path, 'item_evidence_missing', 'verified item representation requires accessibility and rights references');
  }
}

function snapshotItemMetadata(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, ITEM_METADATA_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, ITEM_METADATA_FIELDS, path, errors);
  const idFields = [
    'itemId',
    'contentItemId',
    'contentRevisionId',
    'blueprintId',
    'blueprintRevisionId',
    'blueprintCellId',
    'registryEntryId',
    'microSkillId',
    'variantKey',
    'misconceptionHypothesisId'
  ];
  for (let index = 0; index < idFields.length; index += 1) {
    if (!isOpaqueId(snapshot[idFields[index]])) {
      addError(errors, `${path}.${idFields[index]}`, 'opaque_id_invalid', 'a stable opaque identifier is required');
    }
  }
  if (!isSha256(snapshot.contentRevisionSha256) || !isSha256(snapshot.assetSetSha256)) {
    addError(errors, path, 'content_revision_digest_invalid', 'an immutable content revision digest and asset-set digest are required');
  }
  if (!isSha256(snapshot.blueprintSha256) || !isOutcomeCode(snapshot.outcomeCode) || !includesValue(ITEM_STATES, snapshot.itemState)) {
    addError(errors, path, 'item_metadata_invalid', 'immutable blueprint binding, outcome, and item state are required');
  }
  if (!includesValue(ITEM_TYPES, snapshot.itemType) || !includesValue(RESPONSE_MODES, snapshot.responseMode) || !isCompatibleItemTypeAndResponseMode(snapshot.itemType, snapshot.responseMode) || !includesValue(COGNITIVE_PROCESSES, snapshot.cognitiveProcess) || !includesValue(DIFFICULTY_BANDS, snapshot.difficultyBand)) {
    addError(errors, path, 'item_assessment_taxonomy_invalid', 'a supported item type, response mode, cognitive process, and difficulty band are required');
  }
  validateItemRepresentation(snapshot, 'visualEvidenceStatus', 'accessibilityProfileId', 'visualRightsPolicyRef', path, errors);
  validateItemRepresentation(snapshot, 'audioEvidenceStatus', 'audioAccessibilityProfileId', 'audioRightsPolicyRef', path, errors);
  return objectFreeze(snapshot);
}

function snapshotItemMetadataList(value, errors) {
  const items = snapshotDenseArray(value, 'itemMetadata', errors, MAX_ITEMS);
  if (!items) return null;
  const snapshot = [];
  const itemIdentifiers = new setConstructor();
  const contentItemIdentifiers = new setConstructor();
  const contentRevisionIdentifiers = new setConstructor();
  const contentRevisionDigests = new setConstructor();
  for (let index = 0; index < items.length; index += 1) {
    const item = snapshotItemMetadata(items[index], `itemMetadata[${index}]`, errors);
    if (item && setHas(itemIdentifiers, item.itemId)) {
      addError(errors, `itemMetadata[${index}].itemId`, 'duplicate_item_metadata', 'each item may appear only once in a coverage evaluation');
    }
    if (item && setHas(contentRevisionIdentifiers, item.contentRevisionId)) {
      addError(errors, `itemMetadata[${index}].contentRevisionId`, 'duplicate_content_revision', 'one immutable content revision may contribute to coverage only once');
    }
    if (item && setHas(contentItemIdentifiers, item.contentItemId)) {
      addError(errors, `itemMetadata[${index}].contentItemId`, 'duplicate_content_item', 'one content item may contribute to coverage only once per blueprint revision');
    }
    if (item && setHas(contentRevisionDigests, item.contentRevisionSha256)) {
      addError(errors, `itemMetadata[${index}].contentRevisionSha256`, 'duplicate_content_revision_digest', 'one immutable content revision digest may contribute to coverage only once');
    }
    if (item) {
      setAdd(itemIdentifiers, item.itemId);
      setAdd(contentItemIdentifiers, item.contentItemId);
      setAdd(contentRevisionIdentifiers, item.contentRevisionId);
      setAdd(contentRevisionDigests, item.contentRevisionSha256);
    }
    appendOwnArrayValue(snapshot, item);
  }
  return objectFreeze(snapshot);
}

function createCoverageResult(valid, errors, report = null) {
  const copiedErrors = [];
  for (let index = 0; index < errors.length; index += 1) appendOwnArrayValue(copiedErrors, errors[index]);
  return objectFreeze({
    valid,
    errors: objectFreeze(copiedErrors),
    report
  });
}

function itemMatchesCell(item, cell, blueprint, errors, path) {
  if (item.blueprintId !== blueprint.blueprintId || item.blueprintRevisionId !== blueprint.blueprintRevisionId || item.blueprintSha256 !== blueprint.blueprintSha256) {
    addError(errors, path, 'item_blueprint_binding_mismatch', 'every item must bind this exact immutable blueprint revision');
  }
  if (item.registryEntryId !== cell.registryEntryId || item.outcomeCode !== cell.outcomeCode) {
    addError(errors, path, 'item_curriculum_binding_mismatch', 'every item must bind the exact blueprint curriculum outcome');
  }
  if (item.microSkillId !== cell.microSkillId) {
    addError(errors, path, 'item_micro_skill_mismatch', 'every item must bind the exact blueprint micro-skill');
  }
  if (item.itemType !== cell.itemType || item.responseMode !== cell.responseMode || item.cognitiveProcess !== cell.cognitiveProcess || item.difficultyBand !== cell.difficultyBand) {
    addError(errors, path, 'item_assessment_taxonomy_mismatch', 'every item must match the blueprint cell assessment taxonomy and difficulty');
  }
  if (!includesValue(cell.requiredVariantKeys, item.variantKey)) {
    addError(errors, path, 'item_variant_not_planned', 'the item variant is not planned by its blueprint cell');
  }
  if (!includesValue(cell.misconceptionHypothesisIds, item.misconceptionHypothesisId)) {
    addError(errors, path, 'item_misconception_not_planned', 'the item misconception hypothesis is not planned by its blueprint cell');
  }
  const representationPairs = [
    ['visualRequirement', 'visualEvidenceStatus', 'accessibilityProfileId', 'visualRightsPolicyRef'],
    ['audioRequirement', 'audioEvidenceStatus', 'audioAccessibilityProfileId', 'audioRightsPolicyRef']
  ];
  for (let index = 0; index < representationPairs.length; index += 1) {
    const [requirementField, statusField, profileField, rightsField] = representationPairs[index];
    if (cell[requirementField] === 'none') {
      if (item[statusField] !== 'not_applicable') {
        addError(errors, path, 'item_representation_unplanned', 'the item declares evidence for a representation the cell did not plan');
      }
    } else if (
      item[statusField] !== 'verified' ||
      item[profileField] !== cell[profileField] ||
      item[rightsField] !== cell[rightsField]
    ) {
      addError(errors, path, 'item_representation_evidence_mismatch', 'a required visual or audio representation must match the planned accessibility and rights evidence');
    }
  }
}

function createCoverageReport(blueprint, items) {
  const byCellId = new mapConstructor();
  const cellEntries = [];
  let targetCount = 0;
  for (let weekIndex = 0; weekIndex < blueprint.weekPlans.length; weekIndex += 1) {
    const week = blueprint.weekPlans[weekIndex];
    for (let cellIndex = 0; cellIndex < week.cells.length; cellIndex += 1) {
      const cell = week.cells[cellIndex];
      const cellEntry = {
        weekNumber: week.weekNumber,
        cell,
        approvedItems: []
      };
      mapSet(byCellId, cell.blueprintCellId, cellEntry);
      appendOwnArrayValue(cellEntries, cellEntry);
      targetCount += cell.targetCount;
    }
  }
  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];
    if (item.itemState === 'approved') {
      const cellEntry = mapGet(byCellId, item.blueprintCellId);
      appendOwnArrayValue(cellEntry.approvedItems, item);
    }
  }

  const cells = [];
  let approvedItemCount = 0;
  let underTargetCellCount = 0;
  let overTargetCellCount = 0;
  let missingRequiredVariantCellCount = 0;
  for (let entryIndex = 0; entryIndex < cellEntries.length; entryIndex += 1) {
    const entry = cellEntries[entryIndex];
    const approvedCount = entry.approvedItems.length;
    approvedItemCount += approvedCount;
    const coveredVariants = new setConstructor();
    for (let itemIndex = 0; itemIndex < entry.approvedItems.length; itemIndex += 1) {
      setAdd(coveredVariants, entry.approvedItems[itemIndex].variantKey);
    }
    const missingRequiredVariantKeys = [];
    for (let index = 0; index < entry.cell.requiredVariantKeys.length; index += 1) {
      const variant = entry.cell.requiredVariantKeys[index];
      if (!setHas(coveredVariants, variant)) appendOwnArrayValue(missingRequiredVariantKeys, variant);
    }
    const hasMissingRequiredVariant = missingRequiredVariantKeys.length > 0;
    const isUnderTarget = approvedCount < entry.cell.targetCount;
    const isOverTarget = approvedCount > entry.cell.targetCount;
    if (hasMissingRequiredVariant) missingRequiredVariantCellCount += 1;
    if (isUnderTarget) underTargetCellCount += 1;
    if (isOverTarget) overTargetCellCount += 1;
    let coverageState = 'on_target';
    if (hasMissingRequiredVariant) coverageState = 'missing_required_variant';
    else if (isUnderTarget) coverageState = 'under_target';
    else if (isOverTarget) coverageState = 'over_target';
    appendOwnArrayValue(cells, objectFreeze({
      weekNumber: entry.weekNumber,
      blueprintCellId: entry.cell.blueprintCellId,
      targetCount: entry.cell.targetCount,
      approvedItemCount: approvedCount,
      coverageState,
      missingRequiredVariantKeys: objectFreeze(missingRequiredVariantKeys)
    }));
  }
  const coverageComplete = underTargetCellCount === 0 && overTargetCellCount === 0 && missingRequiredVariantCellCount === 0;
  return objectFreeze({
    status: 'coverage_evaluated',
    coverageComplete,
    blueprintId: blueprint.blueprintId,
    blueprintRevisionId: blueprint.blueprintRevisionId,
    blueprintSha256: blueprint.blueprintSha256,
    summary: objectFreeze({
      targetCount,
      approvedItemCount,
      underTargetCellCount,
      overTargetCellCount,
      missingRequiredVariantCellCount
    }),
    cells: objectFreeze(cells)
  });
}

/**
 * Evaluate the approved item metadata against a human-approved blueprint and
 * separately supplied canonical curriculum records. The result does not
 * publish items, authorize delivery, or prove that the input snapshots are
 * authoritative; it only reports bounded, deterministic coverage evidence.
 */
export function evaluateQuestionCoverage(value) {
  const errors = [];
  try {
    const root = snapshotClosedRecord(value, EVALUATION_INPUT_FIELDS, 'input', errors);
    if (!root) return createCoverageResult(false, errors);
    requireFields(root, EVALUATION_INPUT_FIELDS, 'input', errors);
    if (root.contractVersion !== QUESTION_COVERAGE_BLUEPRINT_CONTRACT_VERSION) {
      addError(errors, 'input.contractVersion', 'contract_version_unsupported', 'the coverage evaluation contract version is unsupported');
    }
    const blueprintValidation = validateQuestionCoverageBlueprint(root.blueprint);
    if (!blueprintValidation.valid) {
      for (let index = 0; index < blueprintValidation.errors.length; index += 1) {
        const error = blueprintValidation.errors[index];
        addError(errors, error.path, error.code, error.message);
      }
    }
    const curriculumEntries = snapshotCanonicalCurriculumEntries(root.canonicalCurriculumEntries, errors);
    const items = snapshotItemMetadataList(root.itemMetadata, errors);
    if (errors.length > 0 || !blueprintValidation.valid || !curriculumEntries || !items) return createCoverageResult(false, errors);
    const blueprint = blueprintValidation.normalizedBlueprint;
    if (blueprint.lifecycleState !== 'approved') {
      addError(errors, 'input.blueprint.lifecycleState', 'blueprint_not_approved', 'coverage can be evaluated only for a human-approved blueprint');
      return createCoverageResult(false, errors);
    }
    const curriculumScope = {
      programVersion: blueprint.programVersion,
      grade: blueprint.grade,
      courseKey: blueprint.courseKey
    };
    const calculatedCurriculumSnapshotSha256 = calculateCurriculumScopeHashFromEntries(curriculumEntries, curriculumScope);
    if (
      !isSha256(root.canonicalCurriculumSnapshotSha256) ||
      !calculatedCurriculumSnapshotSha256 ||
      root.canonicalCurriculumSnapshotSha256 !== calculatedCurriculumSnapshotSha256 ||
      blueprint.curriculumBinding.registrySnapshotSha256 !== calculatedCurriculumSnapshotSha256
    ) {
      addError(errors, 'input.canonicalCurriculumSnapshotSha256', 'curriculum_snapshot_binding_mismatch', 'the supplied canonical curriculum snapshot must exactly match the immutable blueprint binding');
      return createCoverageResult(false, errors);
    }
    const approvalTimestamp = dateParse(blueprint.humanApproval.approvedAt);
    for (let index = 0; index < curriculumEntries.length; index += 1) {
      const entry = curriculumEntries[index];
      if (
        entry.programVersion === curriculumScope.programVersion &&
        entry.grade === curriculumScope.grade &&
        entry.courseKey === curriculumScope.courseKey &&
        approvalTimestamp < dateParse(entry.canonicalReview.reviewedAt)
      ) {
        addError(errors, 'input.blueprint.humanApproval.approvedAt', 'human_approval_before_curriculum_review', 'a human blueprint approval cannot predate a canonical curriculum review in its declared scope');
        break;
      }
    }
    if (errors.length > 0) return createCoverageResult(false, errors);

    const curriculumById = new mapConstructor();
    for (let index = 0; index < curriculumEntries.length; index += 1) {
      mapSet(curriculumById, curriculumEntries[index].registryEntryId, curriculumEntries[index]);
    }
    const cellsById = new mapConstructor();
    const plannedOutcomeKeys = new setConstructor();
    for (let weekIndex = 0; weekIndex < blueprint.weekPlans.length; weekIndex += 1) {
      const week = blueprint.weekPlans[weekIndex];
      for (let cellIndex = 0; cellIndex < week.cells.length; cellIndex += 1) {
        const cell = week.cells[cellIndex];
        const curriculum = mapGet(curriculumById, cell.registryEntryId);
        if (!curriculum || curriculum.programVersion !== blueprint.programVersion || curriculum.grade !== blueprint.grade || curriculum.courseKey !== blueprint.courseKey || curriculum.outcomeCode !== cell.outcomeCode || curriculum.verificationState !== 'canonical_verified') {
          addError(errors, `blueprint.weekPlans[${weekIndex}].cells[${cellIndex}]`, 'canonical_curriculum_binding_mismatch', 'every cell must bind an exact canonical curriculum outcome in this blueprint scope');
        }
        mapSet(cellsById, cell.blueprintCellId, cell);
        setAdd(plannedOutcomeKeys, `${cell.registryEntryId}\u0000${cell.outcomeCode}`);
      }
    }
    for (let index = 0; index < curriculumEntries.length; index += 1) {
      const entry = curriculumEntries[index];
      if (
        entry.programVersion === blueprint.programVersion &&
        entry.grade === blueprint.grade &&
        entry.courseKey === blueprint.courseKey &&
        !setHas(plannedOutcomeKeys, `${entry.registryEntryId}\u0000${entry.outcomeCode}`)
      ) {
        addError(errors, `canonicalCurriculumEntries[${index}]`, 'canonical_outcome_unplanned', 'every canonical outcome in this blueprint scope requires at least one planned cell');
      }
    }
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const item = items[itemIndex];
      const cell = mapGet(cellsById, item.blueprintCellId);
      if (!cell) {
        addError(errors, `itemMetadata[${itemIndex}].blueprintCellId`, 'item_cell_unknown', 'every item must bind a known cell in this blueprint revision');
        continue;
      }
      itemMatchesCell(item, cell, blueprint, errors, `itemMetadata[${itemIndex}]`);
    }
    if (errors.length > 0) return createCoverageResult(false, errors);
    return createCoverageResult(true, [], createCoverageReport(blueprint, items));
  } catch {
    addError(errors, 'input', 'coverage_input_unreadable', 'the coverage evaluation input could not be safely read');
    return createCoverageResult(false, errors);
  }
}
