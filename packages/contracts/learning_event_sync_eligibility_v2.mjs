/**
 * Server-only V2 composition for a governed learning-event sync decision.
 *
 * It preserves the V1 eligibility kernel and adds a detached DAMA catalog
 * binding to an append or exact-replay intent. A successful outcome remains a
 * pure decision: it does not write a ledger, persist a receipt, synchronize a
 * device, enforce physical retention, create analytics, or prove that a
 * declared catalog contract is implemented.
 *
 * `dataAssetCatalog` and `receiptGovernanceBindingLookup` are server-resolved
 * inputs. For a replay, the catalog must be the receipt's historical catalog
 * revision rather than the active catalog. An HTTP adapter must keep both
 * records separate from client bodies and deserialize trusted DTOs before this
 * module is called. As with the underlying contracts, a fully transparent
 * in-process Proxy cannot be distinguished from a normal data object by
 * JavaScript.
 */

import { createHash } from 'node:crypto';
import {
  LEARNING_EVENT_SYNC_ELIGIBILITY_CONTRACT_VERSION,
  calculateLearningSyncDataHandlingSnapshotSha256,
  evaluateServerResolvedLearningSyncEligibility
} from './learning_event_sync_eligibility.mjs';
import { validateDataAssetCatalog } from './data_asset_catalog.mjs';

export const LEARNING_EVENT_SYNC_ELIGIBILITY_V2_CONTRACT_VERSION = '2.0.0';

const arrayIsArray = Array.isArray;
const arraySort = Function.call.bind(Array.prototype.sort);
const jsonStringify = JSON.stringify;
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

const MAX_ROOT_OWN_KEYS = 32;
const MAX_ERRORS = 32;

const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const V1_ROOT_FIELDS = [
  'resolverContext',
  'clientBatch',
  'authorizationSnapshot',
  'entitlementSnapshot',
  'governedTargetSnapshot',
  'activityScopeSnapshot',
  'dataHandlingSnapshot',
  'streamStateSnapshot',
  'receiptLookup',
  'accessRequest'
];
const ROOT_FIELDS = [...V1_ROOT_FIELDS, 'dataAssetCatalog', 'receiptGovernanceBindingLookup'];
const DATA_HANDLING_FIELDS = [
  'policyId',
  'policySha256',
  'purpose',
  'classification',
  'retentionClass',
  'auditPolicyVersion'
];
const RECEIPT_GOVERNANCE_BINDING_LOOKUP_FIELDS = ['binding'];
const RECEIPT_GOVERNANCE_BINDING_FIELDS = [
  'bindingContractVersion',
  'bindingSha256',
  'receiptId',
  'receiptSha256',
  'scopeSha256',
  'batchSha256',
  'dataHandlingPolicyId',
  'dataHandlingPolicySha256',
  'catalogBinding'
];
const CATALOG_BINDING_FIELDS = [
  'catalogId',
  'catalogRevisionId',
  'catalogRevisionSequence',
  'catalogSha256',
  'governedContentDeliverySnapshot',
  'learningEventStream',
  'learningSyncReceipt'
];
const ASSET_REFERENCE_FIELDS = ['assetId', 'revisionId', 'definitionSha256'];
const APPEND_INTENT_FIELDS = [
  'invocationId',
  'scopeSha256',
  'targetSha256',
  'batchSha256',
  'expectedStreamVersion',
  'firstEventSequence',
  'lastEventSequence',
  'eventCount',
  'authorizationId',
  'entitlementId',
  'governanceSnapshotId',
  'dataHandlingPolicyId',
  'activityScopeSnapshotId',
  'activityScopeSnapshotSha256'
];
const REPLAY_INTENT_FIELDS = [
  'invocationId',
  'receiptId',
  'receiptSha256',
  'scopeSha256',
  'batchSha256'
];
const RECEIPT_GOVERNANCE_BINDING_HASH_DOMAIN = 'k12.learning-sync.receipt-governance-binding/v2';

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

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && regExpTest(SHA256_PATTERN, value);
}

function isPositiveSafeInteger(value) {
  return numberIsSafeInteger(value) && value >= 1;
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

function includesValue(values, value) {
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === value) return true;
  }
  return false;
}

function snapshotClosedRecord(value, allowedFields, path, errors) {
  if (!isPlainRecord(value)) {
    addError(errors, path, 'record_invalid', 'a plain object with own data fields is required');
    return null;
  }
  const fields = reflectOwnKeys(value);
  if (fields.length > MAX_ROOT_OWN_KEYS) {
    addError(errors, path, 'record_field_count_exceeds_limit', 'the record exceeds the fixed own-field limit');
    return null;
  }
  const snapshot = objectCreate(null);
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field !== 'string') {
      addError(errors, path, 'symbol_field_not_allowed', 'the V2 schema permits string field names only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!includesValue(allowedFields, field)) {
      addError(errors, path, 'unexpected_field', 'the V2 schema is closed');
      continue;
    }
    if (!descriptor || !descriptor.enumerable) {
      addError(errors, path, 'non_enumerable_field_not_allowed', 'the V2 schema permits enumerable fields only');
      continue;
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, path, 'accessor_field_not_allowed', 'the V2 schema permits data fields only');
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
      addError(errors, `${path}.${field}`, 'required_field_missing', 'a required server-resolved field is missing');
    }
  }
}

function snapshotDataHandling(value, errors) {
  const snapshot = snapshotClosedRecord(value, DATA_HANDLING_FIELDS, 'dataHandlingSnapshot', errors);
  if (!snapshot) return null;
  requireFields(snapshot, DATA_HANDLING_FIELDS, 'dataHandlingSnapshot', errors);
  let hasOnlyHashableFields = true;
  for (let index = 0; index < DATA_HANDLING_FIELDS.length; index += 1) {
    const field = DATA_HANDLING_FIELDS[index];
    if (field === 'policySha256') continue;
    if (!isNonEmptyString(snapshot[field])) {
      hasOnlyHashableFields = false;
      addError(errors, `dataHandlingSnapshot.${field}`, 'data_handling_field_invalid', 'a non-empty data-handling field is required');
    }
  }
  if (!isSha256(snapshot.policySha256)) {
    hasOnlyHashableFields = false;
    addError(errors, 'dataHandlingSnapshot.policySha256', 'data_handling_hash_invalid', 'a SHA-256 data-handling policy hash is required');
  } else if (hasOnlyHashableFields) {
    const expected = calculateLearningSyncDataHandlingSnapshotSha256(snapshot);
    if (snapshot.policySha256 !== expected) {
      addError(errors, 'dataHandlingSnapshot.policySha256', 'data_handling_hash_mismatch', 'the data-handling policy hash does not bind its declared fields');
    }
  }
  if (snapshot.purpose !== 'learning_progress_sync') {
    addError(errors, 'dataHandlingSnapshot.purpose', 'data_handling_purpose_invalid', 'the V2 data-handling purpose must be learning_progress_sync');
  }
  return objectFreeze(snapshot);
}

function snapshotAssetReference(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, ASSET_REFERENCE_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, ASSET_REFERENCE_FIELDS, path, errors);
  if (!isNonEmptyString(snapshot.assetId)) {
    addError(errors, `${path}.assetId`, 'receipt_governance_binding_field_invalid', 'a non-empty historical asset identifier is required');
  }
  if (!isNonEmptyString(snapshot.revisionId)) {
    addError(errors, `${path}.revisionId`, 'receipt_governance_binding_field_invalid', 'a non-empty historical asset revision identifier is required');
  }
  if (!isSha256(snapshot.definitionSha256)) {
    addError(errors, `${path}.definitionSha256`, 'receipt_governance_binding_hash_invalid', 'a historical asset definition hash is required');
  }
  return objectFreeze(snapshot);
}

function snapshotCatalogBinding(value, path, errors) {
  const snapshot = snapshotClosedRecord(value, CATALOG_BINDING_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, CATALOG_BINDING_FIELDS, path, errors);
  if (!isNonEmptyString(snapshot.catalogId)) {
    addError(errors, `${path}.catalogId`, 'receipt_governance_binding_field_invalid', 'a catalog identifier is required');
  }
  if (!isNonEmptyString(snapshot.catalogRevisionId)) {
    addError(errors, `${path}.catalogRevisionId`, 'receipt_governance_binding_field_invalid', 'a catalog revision identifier is required');
  }
  if (!isPositiveSafeInteger(snapshot.catalogRevisionSequence)) {
    addError(errors, `${path}.catalogRevisionSequence`, 'receipt_governance_binding_field_invalid', 'a positive catalog revision sequence is required');
  }
  if (!isSha256(snapshot.catalogSha256)) {
    addError(errors, `${path}.catalogSha256`, 'receipt_governance_binding_hash_invalid', 'a catalog integrity hash is required');
  }
  const referenceFields = ['governedContentDeliverySnapshot', 'learningEventStream', 'learningSyncReceipt'];
  for (let index = 0; index < referenceFields.length; index += 1) {
    const field = referenceFields[index];
    const reference = snapshotAssetReference(snapshot[field], `${path}.${field}`, errors);
    setOwnValue(snapshot, field, reference);
  }
  return objectFreeze(snapshot);
}

function snapshotReceiptGovernanceBinding(value, path, errors, requireIntegrityHash = true) {
  const snapshot = snapshotClosedRecord(value, RECEIPT_GOVERNANCE_BINDING_FIELDS, path, errors);
  if (!snapshot) return null;
  requireFields(snapshot, RECEIPT_GOVERNANCE_BINDING_FIELDS, path, errors);
  if (snapshot.bindingContractVersion !== LEARNING_EVENT_SYNC_ELIGIBILITY_V2_CONTRACT_VERSION) {
    addError(errors, `${path}.bindingContractVersion`, 'receipt_governance_binding_version_invalid', 'the receipt governance binding must use the current V2 contract version');
  }
  if (requireIntegrityHash ? !isSha256(snapshot.bindingSha256) : snapshot.bindingSha256 !== null && !isSha256(snapshot.bindingSha256)) {
    addError(errors, `${path}.bindingSha256`, 'receipt_governance_binding_hash_invalid', 'a receipt governance binding hash is required');
  }
  const opaqueFields = ['receiptId', 'dataHandlingPolicyId'];
  for (let index = 0; index < opaqueFields.length; index += 1) {
    const field = opaqueFields[index];
    if (!isNonEmptyString(snapshot[field])) {
      addError(errors, `${path}.${field}`, 'receipt_governance_binding_field_invalid', 'a non-empty immutable binding identifier is required');
    }
  }
  const hashFields = ['receiptSha256', 'scopeSha256', 'batchSha256', 'dataHandlingPolicySha256'];
  for (let index = 0; index < hashFields.length; index += 1) {
    const field = hashFields[index];
    if (!isSha256(snapshot[field])) {
      addError(errors, `${path}.${field}`, 'receipt_governance_binding_hash_invalid', 'an immutable binding SHA-256 value is required');
    }
  }
  const catalogBinding = snapshotCatalogBinding(snapshot.catalogBinding, `${path}.catalogBinding`, errors);
  setOwnValue(snapshot, 'catalogBinding', catalogBinding);
  return objectFreeze(snapshot);
}

function snapshotReceiptGovernanceBindingLookup(value, errors) {
  const snapshot = snapshotClosedRecord(value, RECEIPT_GOVERNANCE_BINDING_LOOKUP_FIELDS, 'receiptGovernanceBindingLookup', errors);
  if (!snapshot) return null;
  requireFields(snapshot, RECEIPT_GOVERNANCE_BINDING_LOOKUP_FIELDS, 'receiptGovernanceBindingLookup', errors);
  if (snapshot.binding === null) return objectFreeze(snapshot);
  const binding = snapshotReceiptGovernanceBinding(snapshot.binding, 'receiptGovernanceBindingLookup.binding', errors);
  setOwnValue(snapshot, 'binding', binding);
  return objectFreeze(snapshot);
}

function receiptGovernanceBindingHashPayload(binding) {
  return {
    bindingContractVersion: binding.bindingContractVersion,
    receiptId: binding.receiptId,
    receiptSha256: binding.receiptSha256,
    scopeSha256: binding.scopeSha256,
    batchSha256: binding.batchSha256,
    dataHandlingPolicyId: binding.dataHandlingPolicyId,
    dataHandlingPolicySha256: binding.dataHandlingPolicySha256,
    catalogBinding: binding.catalogBinding
  };
}

function receiptGovernanceBindingSha256(binding) {
  return createHash('sha256')
    .update(`${RECEIPT_GOVERNANCE_BINDING_HASH_DOMAIN}:${canonicalJson(receiptGovernanceBindingHashPayload(binding))}`, 'utf8')
    .digest('hex');
}

export function calculateLearningSyncReceiptGovernanceBindingSha256(binding) {
  const errors = [];
  try {
    const snapshot = snapshotReceiptGovernanceBinding(binding, 'receiptGovernanceBinding', errors, false);
    if (!snapshot || errors.length > 0) return null;
    return receiptGovernanceBindingSha256(snapshot);
  } catch {
    return null;
  }
}

function catalogBindingsEqual(left, right) {
  if (!left || !right) return false;
  if (
    left.catalogId !== right.catalogId ||
    left.catalogRevisionId !== right.catalogRevisionId ||
    left.catalogRevisionSequence !== right.catalogRevisionSequence ||
    left.catalogSha256 !== right.catalogSha256
  ) return false;
  const referenceFields = ['governedContentDeliverySnapshot', 'learningEventStream', 'learningSyncReceipt'];
  for (let index = 0; index < referenceFields.length; index += 1) {
    const field = referenceFields[index];
    const leftReference = left[field];
    const rightReference = right[field];
    if (!leftReference || !rightReference ||
      leftReference.assetId !== rightReference.assetId ||
      leftReference.revisionId !== rightReference.revisionId ||
      leftReference.definitionSha256 !== rightReference.definitionSha256) {
      return false;
    }
  }
  return true;
}

function cloneErrors(errors) {
  const cloned = [];
  if (!arrayIsArray(errors)) return objectFreeze(cloned);
  for (let index = 0; index < errors.length && index < MAX_ERRORS; index += 1) {
    const error = errors[index];
    if (!isPlainRecord(error)) continue;
    const path = typeof error.path === 'string' ? error.path : 'input';
    const code = typeof error.code === 'string' ? error.code : 'validation_error';
    const message = typeof error.message === 'string' ? error.message : 'the server-resolved input is invalid';
    appendOwnArrayValue(cloned, objectFreeze({ path, code, message }));
  }
  return objectFreeze(cloned);
}

function blocked(errors) {
  return objectFreeze({
    eligible: false,
    nextState: 'blocked',
    errors: cloneErrors(errors)
  });
}

function createV1Payload(root, dataHandlingSnapshot) {
  const payload = objectCreate(null);
  for (let index = 0; index < V1_ROOT_FIELDS.length; index += 1) {
    const field = V1_ROOT_FIELDS[index];
    setOwnValue(payload, field, field === 'dataHandlingSnapshot' ? dataHandlingSnapshot : root[field]);
  }
  return objectFreeze(payload);
}

function findAssetByKind(catalog, assetKind) {
  let found = null;
  for (let index = 0; index < catalog.assets.length; index += 1) {
    const asset = catalog.assets[index];
    if (asset.assetKind !== assetKind) continue;
    if (found !== null) return null;
    found = asset;
  }
  return found;
}

function requireDataHandlingMatch(asset, role, dataHandlingSnapshot, errors) {
  const governance = asset?.dataGovernance;
  if (!governance) {
    addError(errors, 'dataAssetCatalog', 'catalog_asset_missing', 'the required catalog asset is missing');
    return;
  }
  const fields = ['processingPurpose', 'classification', 'retentionClass'];
  const handlingFields = ['purpose', 'classification', 'retentionClass'];
  for (let index = 0; index < fields.length; index += 1) {
    if (governance[fields[index]] !== dataHandlingSnapshot[handlingFields[index]]) {
      addError(errors, 'dataAssetCatalog', `catalog_${role}_${fields[index]}_mismatch`, 'the catalog data handling metadata must match the server-resolved data-handling snapshot');
    }
  }
}

function assetReference(asset) {
  return objectFreeze({
    assetId: asset.assetId,
    revisionId: asset.revisionId,
    definitionSha256: asset.definitionSha256
  });
}

function createDataHandlingBinding(dataHandlingSnapshot) {
  return objectFreeze({
    sourceContractVersion: LEARNING_EVENT_SYNC_ELIGIBILITY_CONTRACT_VERSION,
    policyId: dataHandlingSnapshot.policyId,
    policySha256: dataHandlingSnapshot.policySha256,
    purpose: dataHandlingSnapshot.purpose,
    classification: dataHandlingSnapshot.classification,
    retentionClass: dataHandlingSnapshot.retentionClass,
    auditPolicyVersion: dataHandlingSnapshot.auditPolicyVersion
  });
}

function cloneCatalogBinding(binding) {
  return objectFreeze({
    catalogId: binding.catalogId,
    catalogRevisionId: binding.catalogRevisionId,
    catalogRevisionSequence: binding.catalogRevisionSequence,
    catalogSha256: binding.catalogSha256,
    governedContentDeliverySnapshot: assetReference(binding.governedContentDeliverySnapshot),
    learningEventStream: assetReference(binding.learningEventStream),
    learningSyncReceipt: assetReference(binding.learningSyncReceipt)
  });
}

function createCatalogBinding(catalog, dataHandlingSnapshot, errors) {
  const delivery = findAssetByKind(catalog, 'governed_content_delivery_snapshot');
  const eventStream = findAssetByKind(catalog, 'learning_event_stream');
  const receipt = findAssetByKind(catalog, 'learning_sync_receipt');
  if (!delivery || !eventStream || !receipt) {
    addError(errors, 'dataAssetCatalog', 'catalog_asset_missing', 'the V2 catalog must include each required sync data asset');
    return null;
  }

  // `accessPolicyId` remains intentionally separate from the V1 data-handling
  // `policyId`: one is an access-control reference and the other describes a
  // processing/audit policy.
  requireDataHandlingMatch(eventStream, 'event_stream', dataHandlingSnapshot, errors);
  requireDataHandlingMatch(receipt, 'receipt', dataHandlingSnapshot, errors);
  if (errors.length > 0) return null;

  return objectFreeze({
    catalogId: catalog.catalogId,
    catalogRevisionId: catalog.catalogRevisionId,
    catalogRevisionSequence: catalog.catalogRevisionSequence,
    catalogSha256: catalog.catalogSha256,
    governedContentDeliverySnapshot: assetReference(delivery),
    learningEventStream: assetReference(eventStream),
    learningSyncReceipt: assetReference(receipt)
  });
}

function cloneIntent(intent, fields, catalogBinding, dataHandlingBinding, bindingContractVersion, receiptGovernanceBindingSha256Value = null) {
  if (!isPlainRecord(intent)) return null;
  const copied = {};
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const descriptor = objectGetOwnPropertyDescriptor(intent, field);
    if (!descriptor || !descriptor.enumerable || !objectHasOwn(descriptor, 'value')) return null;
    copied[field] = descriptor.value;
  }
  copied.catalogBinding = catalogBinding;
  copied.dataHandlingBinding = dataHandlingBinding;
  copied.bindingContractVersion = bindingContractVersion;
  if (receiptGovernanceBindingSha256Value !== null) {
    copied.receiptGovernanceBindingSha256 = receiptGovernanceBindingSha256Value;
  }
  return objectFreeze(copied);
}

function requireReplayProvenanceMatch(binding, replayIntent, catalogBinding, dataHandlingSnapshot, errors) {
  if (binding.bindingSha256 !== receiptGovernanceBindingSha256(binding)) {
    addError(errors, 'receiptGovernanceBindingLookup.binding.bindingSha256', 'receipt_governance_binding_hash_mismatch', 'the receipt governance binding hash must bind its complete immutable payload');
  }
  const replayFields = ['receiptId', 'receiptSha256', 'scopeSha256', 'batchSha256'];
  for (let index = 0; index < replayFields.length; index += 1) {
    const field = replayFields[index];
    if (binding[field] !== replayIntent[field]) {
      addError(errors, `receiptGovernanceBindingLookup.binding.${field}`, 'receipt_governance_binding_replay_mismatch', 'the historical governance binding must match the exact V1 replay intent');
    }
  }
  if (
    binding.dataHandlingPolicyId !== dataHandlingSnapshot.policyId ||
    binding.dataHandlingPolicySha256 !== dataHandlingSnapshot.policySha256
  ) {
    addError(errors, 'receiptGovernanceBindingLookup.binding', 'receipt_governance_binding_policy_mismatch', 'the historical governance binding must match the current server-resolved immutable data-handling policy');
  }
  if (!catalogBindingsEqual(binding.catalogBinding, catalogBinding)) {
    addError(errors, 'receiptGovernanceBindingLookup.binding.catalogBinding', 'receipt_governance_binding_catalog_mismatch', 'the resolver must supply the historical catalog revision recorded for this exact receipt');
  }
}

function successfulResult(v1Result, catalogBinding, dataHandlingSnapshot, receiptGovernanceBindingLookup, errors) {
  const dataHandlingBinding = createDataHandlingBinding(dataHandlingSnapshot);
  if (v1Result.nextState === 'append_eligible') {
    if (receiptGovernanceBindingLookup.binding !== null) {
      addError(errors, 'receiptGovernanceBindingLookup.binding', 'receipt_governance_binding_unexpected_for_append', 'a new append must not present an existing receipt governance binding');
      return null;
    }
    const appendIntent = cloneIntent(
      v1Result.appendIntent,
      APPEND_INTENT_FIELDS,
      catalogBinding,
      dataHandlingBinding,
      LEARNING_EVENT_SYNC_ELIGIBILITY_V2_CONTRACT_VERSION
    );
    if (!appendIntent || appendIntent.dataHandlingPolicyId === undefined) {
      addError(errors, 'v1Result', 'v1_append_intent_invalid', 'the V1 append intent could not be safely bound to the catalog');
      return null;
    }
    return objectFreeze({
      eligible: true,
      nextState: 'append_eligible',
      errors: objectFreeze([]),
      appendIntent
    });
  }
  if (v1Result.nextState === 'idempotent_replay') {
    const binding = receiptGovernanceBindingLookup.binding;
    if (binding === null) {
      addError(errors, 'receiptGovernanceBindingLookup.binding', 'v2_replay_provenance_missing', 'a V2 receipt governance binding is required before a replay can prove its historical policy and catalog context');
      return null;
    }
    requireReplayProvenanceMatch(binding, v1Result.replayIntent, catalogBinding, dataHandlingSnapshot, errors);
    if (errors.length > 0) return null;
    const historicalCatalogBinding = cloneCatalogBinding(binding.catalogBinding);
    const replayIntent = cloneIntent(
      v1Result.replayIntent,
      REPLAY_INTENT_FIELDS,
      historicalCatalogBinding,
      dataHandlingBinding,
      binding.bindingContractVersion,
      binding.bindingSha256
    );
    if (!replayIntent) {
      addError(errors, 'v1Result', 'v1_replay_intent_invalid', 'the V1 replay intent could not be safely bound to historical governance evidence');
      return null;
    }
    return objectFreeze({
      eligible: false,
      nextState: 'idempotent_replay',
      errors: objectFreeze([]),
      replayIntent
    });
  }
  addError(errors, 'v1Result', 'v1_outcome_invalid', 'the V1 eligibility result had an unsupported outcome');
  return null;
}

/**
 * Evaluate a V1 server-resolved sync decision and bind its eligible append or
 * replay intent to three validated catalog asset revisions. This is not a
 * ledger adapter or receipt writer.
 */
export function evaluateCatalogBoundLearningSyncEligibility(input) {
  const errors = [];
  try {
    const root = snapshotClosedRecord(input, ROOT_FIELDS, 'input', errors);
    if (!root) return blocked(errors);
    requireFields(root, ROOT_FIELDS, 'input', errors);
    const dataHandlingSnapshot = snapshotDataHandling(root.dataHandlingSnapshot, errors);
    const receiptGovernanceBindingLookup = snapshotReceiptGovernanceBindingLookup(root.receiptGovernanceBindingLookup, errors);
    if (errors.length > 0 || !dataHandlingSnapshot || !receiptGovernanceBindingLookup) return blocked(errors);

    const v1Result = evaluateServerResolvedLearningSyncEligibility(createV1Payload(root, dataHandlingSnapshot));
    if (!v1Result || v1Result.nextState === 'blocked') {
      return blocked(v1Result?.errors ?? errors);
    }

    const catalogValidation = validateDataAssetCatalog(root.dataAssetCatalog);
    if (!catalogValidation.valid || !catalogValidation.normalizedCatalog) {
      return blocked(catalogValidation?.errors ?? errors);
    }
    const catalogBinding = createCatalogBinding(catalogValidation.normalizedCatalog, dataHandlingSnapshot, errors);
    if (!catalogBinding || errors.length > 0) return blocked(errors);

    const result = successfulResult(v1Result, catalogBinding, dataHandlingSnapshot, receiptGovernanceBindingLookup, errors);
    return result ?? blocked(errors);
  } catch {
    addError(errors, 'input', 'server_snapshot_unreadable', 'server-resolved V2 input could not be safely read');
    return blocked(errors);
  }
}

export function evaluateServerResolvedLearningSyncEligibilityV2(input) {
  return evaluateCatalogBoundLearningSyncEligibility(input);
}
