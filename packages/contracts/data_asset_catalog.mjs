/**
 * Closed DAMA-style metadata catalog for the first governed learning vertical
 * slice. It registers metadata only: it never carries learner rows, content
 * bodies, answer keys, credentials, endpoints, storage locations, or a
 * persistence/acceptance claim.
 *
 * This V1 deliberately names exactly four logical data products and their
 * three permitted lineage edges. It is not a general-purpose lineage engine,
 * a database schema, an API, a ledger transaction, or proof that a declared
 * contract is implemented. A future trusted adapter must deserialize JSON or
 * database records into DTOs before using this kernel; JavaScript cannot
 * distinguish a fully transparent in-process Proxy from a real data record.
 */

import { createHash } from 'node:crypto';

export const DATA_ASSET_CATALOG_CONTRACT_VERSION = '1.0.0';

const arrayIsArray = Array.isArray;
const objectCreate = Object.create;
const objectDefineProperty = Object.defineProperty;
const objectFreeze = Object.freeze;
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const objectGetPrototypeOf = Object.getPrototypeOf;
const objectHasOwn = Object.hasOwn;
const objectPrototype = Object.prototype;
const reflectOwnKeys = Reflect.ownKeys;
const regExpTest = Function.call.bind(RegExp.prototype.test);
const weakSetConstructor = WeakSet;

const MAX_ASSETS = 4;
const MAX_DATA_CONTRACT_REFS = 8;
const MAX_BUSINESS_TERMS = 32;
const MAX_QUALITY_RULES = 32;
const MAX_LINEAGE_EDGES = 3;
const MAX_RECORD_OWN_KEYS = 32;
const MAX_VALIDATION_ERRORS = 64;

const OPAQUE_REFERENCE_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{2,127}$/u;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/u;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/u;

const ROOT_FIELDS = [
  'contractVersion',
  'catalogId',
  'catalogRevisionId',
  'catalogRevisionSequence',
  'lifecycleState',
  'catalogSha256',
  'assets',
  'lineageEdges'
];
const ASSET_FIELDS = [
  'assetId',
  'assetKind',
  'revisionId',
  'revisionSequence',
  'lifecycleState',
  'definitionSha256',
  'domain',
  'dataGovernance',
  'dataContractRefs',
  'businessTermIds',
  'qualityRuleIds'
];
const GOVERNANCE_FIELDS = [
  'owner',
  'steward',
  'classification',
  'processingPurpose',
  'retentionClass',
  'accessPolicyId'
];
const DATA_CONTRACT_REF_FIELDS = [
  'contractId',
  'contractVersion',
  'contractSha256',
  'bindingState'
];
const LINEAGE_EDGE_FIELDS = [
  'edgeId',
  'relationship',
  'upstream',
  'downstream'
];
const LINEAGE_ENDPOINT_FIELDS = [
  'assetId',
  'revisionId',
  'definitionSha256'
];

const ASSET_PROFILES = [
  {
    assetKind: 'governed_content_delivery_snapshot',
    domain: 'content_delivery',
    classification: 'governance_record',
    processingPurpose: 'student_content_delivery'
  },
  {
    assetKind: 'learning_event_stream',
    domain: 'learning_assessment',
    classification: 'pseudonymous_learning_telemetry',
    processingPurpose: 'learning_progress_sync'
  },
  {
    assetKind: 'learning_sync_receipt',
    domain: 'learning_assessment',
    classification: 'pseudonymous_learning_telemetry',
    processingPurpose: 'learning_progress_sync'
  },
  {
    assetKind: 'learning_analytics_aggregate',
    domain: 'analytics',
    classification: 'aggregated_learning_analytics',
    processingPurpose: 'learning_analytics'
  }
];

const EXPECTED_LINEAGE_KIND_PAIRS = [
  ['governed_content_delivery_snapshot', 'learning_event_stream'],
  ['learning_event_stream', 'learning_sync_receipt'],
  ['learning_sync_receipt', 'learning_analytics_aggregate']
];

const errorLimitReported = new weakSetConstructor();

function appendOwnArrayValue(array, value) {
  objectDefineProperty(array, String(array.length), {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function setOwnValue(target, field, value) {
  objectDefineProperty(target, field, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function addError(errors, path, code, message) {
  if (errors.length >= MAX_VALIDATION_ERRORS - 1) {
    if (!errorLimitReported.has(errors)) {
      const limitError = objectCreate(null);
      setOwnValue(limitError, 'path', 'catalog');
      setOwnValue(limitError, 'code', 'validation_error_limit_exceeded');
      setOwnValue(limitError, 'message', 'validation stopped after reaching the fixed error-output limit');
      appendOwnArrayValue(errors, objectFreeze(limitError));
      errorLimitReported.add(errors);
    }
    return;
  }
  const error = objectCreate(null);
  setOwnValue(error, 'path', path);
  setOwnValue(error, 'code', code);
  setOwnValue(error, 'message', message);
  appendOwnArrayValue(errors, objectFreeze(error));
}

function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || arrayIsArray(value)) return false;
  const prototype = objectGetPrototypeOf(value);
  return prototype === objectPrototype || prototype === null;
}

function isOpaqueReference(value) {
  return typeof value === 'string' && regExpTest(OPAQUE_REFERENCE_PATTERN, value);
}

function isSha256(value) {
  return typeof value === 'string' && regExpTest(SHA256_PATTERN, value);
}

function isVersion(value) {
  return typeof value === 'string' && regExpTest(SEMVER_PATTERN, value);
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function listIncludes(list, value) {
  for (let index = 0; index < list.length; index += 1) {
    if (list[index] === value) return true;
  }
  return false;
}

function compareText(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return 0;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function sortedCopy(values, compare) {
  const copy = [];
  for (let index = 0; index < values.length; index += 1) {
    appendOwnArrayValue(copy, values[index]);
  }
  for (let index = 1; index < copy.length; index += 1) {
    const value = copy[index];
    let position = index;
    while (position > 0 && compare(value, copy[position - 1]) < 0) {
      copy[position] = copy[position - 1];
      position -= 1;
    }
    copy[position] = value;
  }
  return copy;
}

function snapshotClosedRecord(value, allowedFields, path, errors) {
  if (!isPlainRecord(value)) {
    addError(errors, path, 'record_invalid', 'a plain object with own data fields is required');
    return null;
  }

  const snapshot = objectCreate(null);
  const fields = reflectOwnKeys(value);
  if (fields.length > MAX_RECORD_OWN_KEYS) {
    addError(errors, path, 'record_field_count_exceeds_limit', 'the metadata record exceeds the fixed own-field limit');
    return null;
  }
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field !== 'string') {
      addError(errors, path, 'symbol_field_not_allowed', 'the metadata schema permits string field names only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!listIncludes(allowedFields, field)) {
      addError(errors, path, 'unexpected_field', 'the metadata schema is closed');
      continue;
    }
    if (!descriptor || !descriptor.enumerable) {
      addError(errors, path, 'non_enumerable_field_not_allowed', 'the metadata schema permits enumerable fields only');
      continue;
    }
    if (!objectHasOwn(descriptor, 'value')) {
      addError(errors, path, 'accessor_field_not_allowed', 'the metadata schema permits data fields only');
      continue;
    }
    setOwnValue(snapshot, field, descriptor.value);
  }
  return snapshot;
}

function snapshotDenseArray(value, path, errors, maximumLength) {
  if (!arrayIsArray(value)) {
    addError(errors, path, 'array_invalid', 'a dense array is required');
    return null;
  }
  const lengthDescriptor = objectGetOwnPropertyDescriptor(value, 'length');
  if (!lengthDescriptor || !objectHasOwn(lengthDescriptor, 'value') || !Number.isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
    addError(errors, path, 'array_length_invalid', 'an array with a safe non-negative length is required');
    return null;
  }
  const length = lengthDescriptor.value;
  if (length > maximumLength) {
    addError(errors, path, 'array_length_exceeds_limit', `the metadata array cannot exceed ${maximumLength} entries`);
    return null;
  }

  const fields = reflectOwnKeys(value);
  if (fields.length > maximumLength + 1) {
    addError(errors, path, 'array_property_count_exceeds_limit', 'the metadata array exceeds the fixed own-property limit');
    return null;
  }
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (field === 'length') continue;
    if (typeof field !== 'string' || !regExpTest(ARRAY_INDEX_PATTERN, field) || Number(field) >= length) {
      addError(errors, path, 'unexpected_array_field', 'the metadata array may contain indexed elements only');
      continue;
    }
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable) {
      addError(errors, `${path}[${field}]`, 'non_enumerable_field_not_allowed', 'the metadata array permits enumerable elements only');
    }
    if (!descriptor || !objectHasOwn(descriptor, 'value')) {
      addError(errors, `${path}[${field}]`, 'accessor_field_not_allowed', 'the metadata array permits data elements only');
    }
  }

  const snapshot = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = objectGetOwnPropertyDescriptor(value, String(index));
    if (!descriptor) {
      addError(errors, `${path}[${index}]`, 'array_hole_not_allowed', 'the metadata array must be dense');
      continue;
    }
    if (!descriptor.enumerable || !objectHasOwn(descriptor, 'value')) continue;
    appendOwnArrayValue(snapshot, descriptor.value);
  }
  return snapshot;
}

function requireOpaqueReference(snapshot, field, path, errors) {
  if (!isOpaqueReference(snapshot[field])) {
    addError(errors, `${path}.${field}`, 'opaque_reference_invalid', `a bounded opaque ${field} reference is required`);
  }
}

function requireSha256(snapshot, field, path, errors, required) {
  if (!required && (snapshot[field] === null || snapshot[field] === undefined)) return;
  if (!isSha256(snapshot[field])) {
    addError(errors, `${path}.${field}`, 'sha256_invalid', `a ${field} SHA-256 value is required`);
  }
}

function requireAllFields(snapshot, fields, path, errors, optionalField) {
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (field === optionalField) continue;
    if (!objectHasOwn(snapshot, field)) {
      addError(errors, `${path}.${field}`, 'required_field_missing', `a ${field} field is required`);
    }
  }
}

function profileFor(assetKind) {
  for (let index = 0; index < ASSET_PROFILES.length; index += 1) {
    if (ASSET_PROFILES[index].assetKind === assetKind) return ASSET_PROFILES[index];
  }
  return null;
}

function referenceKey(assetId, revisionId) {
  if (!isOpaqueReference(assetId) || !isOpaqueReference(revisionId)) return null;
  return `${assetId}\u0000${revisionId}`;
}

function edgeKey(edge) {
  if (
    !edge ||
    edge.relationship !== 'derives_from' ||
    !edge.upstream ||
    !edge.downstream ||
    !isOpaqueReference(edge.upstream.assetId) ||
    !isOpaqueReference(edge.upstream.revisionId) ||
    !isOpaqueReference(edge.downstream.assetId) ||
    !isOpaqueReference(edge.downstream.revisionId)
  ) {
    return null;
  }
  return `${edge.relationship}\u0000${edge.upstream.assetId}\u0000${edge.upstream.revisionId}\u0000${edge.downstream.assetId}\u0000${edge.downstream.revisionId}`;
}

function snapshotGovernance(value, path, errors) {
  const governance = snapshotClosedRecord(value, GOVERNANCE_FIELDS, path, errors);
  if (!governance) return null;
  requireAllFields(governance, GOVERNANCE_FIELDS, path, errors);
  for (let index = 0; index < GOVERNANCE_FIELDS.length; index += 1) {
    requireOpaqueReference(governance, GOVERNANCE_FIELDS[index], path, errors);
  }
  return governance;
}

function snapshotDataContractRef(value, path, errors) {
  const reference = snapshotClosedRecord(value, DATA_CONTRACT_REF_FIELDS, path, errors);
  if (!reference) return null;
  requireAllFields(reference, DATA_CONTRACT_REF_FIELDS, path, errors);
  requireOpaqueReference(reference, 'contractId', path, errors);
  if (!isVersion(reference.contractVersion)) {
    addError(errors, `${path}.contractVersion`, 'contract_version_invalid', 'a semantic contract version is required');
  }
  requireSha256(reference, 'contractSha256', path, errors, true);
  if (reference.bindingState !== 'declared') {
    addError(errors, `${path}.bindingState`, 'binding_state_invalid', 'a V1 catalog contract binding must be declared');
  }
  return reference;
}

function snapshotOpaqueList(value, path, errors, maximumLength, fieldCode) {
  const values = snapshotDenseArray(value, path, errors, maximumLength);
  if (!values) return null;
  if (values.length === 0) {
    addError(errors, path, `${fieldCode}_missing`, 'at least one opaque metadata reference is required');
  }
  const seen = objectCreate(null);
  const normalizedValues = [];
  for (let index = 0; index < values.length; index += 1) {
    if (!isOpaqueReference(values[index])) {
      addError(errors, `${path}[${index}]`, `${fieldCode}_invalid`, 'a bounded opaque metadata reference is required');
      continue;
    }
    if (objectHasOwn(seen, values[index])) {
      addError(errors, `${path}[${index}]`, `${fieldCode}_duplicate`, 'metadata references must be unique within an asset');
    }
    setOwnValue(seen, values[index], true);
    appendOwnArrayValue(normalizedValues, values[index]);
  }
  return sortedCopy(normalizedValues, compareText);
}

function snapshotAsset(value, path, errors, options) {
  const asset = snapshotClosedRecord(value, ASSET_FIELDS, path, errors);
  if (!asset) return null;
  requireAllFields(
    asset,
    ASSET_FIELDS,
    path,
    errors,
    options.requireDefinitionSha256 ? undefined : 'definitionSha256'
  );
  requireOpaqueReference(asset, 'assetId', path, errors);
  requireOpaqueReference(asset, 'revisionId', path, errors);
  if (!isPositiveSafeInteger(asset.revisionSequence)) {
    addError(errors, `${path}.revisionSequence`, 'revision_sequence_invalid', 'a positive asset revision sequence is required');
  }
  if (asset.lifecycleState !== 'registered') {
    addError(errors, `${path}.lifecycleState`, 'asset_lifecycle_invalid', 'a V1 asset must be registered metadata only');
  }
  requireSha256(asset, 'definitionSha256', path, errors, options.requireDefinitionSha256);

  const profile = profileFor(asset.assetKind);
  if (!profile) {
    addError(errors, `${path}.assetKind`, 'asset_kind_invalid', 'the asset kind is outside the V1 governed vertical slice');
  }
  if (!isOpaqueReference(asset.domain)) {
    addError(errors, `${path}.domain`, 'domain_invalid', 'a bounded opaque domain is required');
  } else if (profile && asset.domain !== profile.domain) {
    addError(errors, `${path}.domain`, 'asset_domain_mismatch', 'the asset domain does not match its V1 asset kind');
  }

  const governance = snapshotGovernance(asset.dataGovernance, `${path}.dataGovernance`, errors);
  if (profile && governance) {
    if (governance.classification !== profile.classification) {
      addError(errors, `${path}.dataGovernance.classification`, 'asset_classification_mismatch', 'the asset classification does not match its V1 asset kind');
    }
    if (governance.processingPurpose !== profile.processingPurpose) {
      addError(errors, `${path}.dataGovernance.processingPurpose`, 'asset_processing_purpose_mismatch', 'the asset processing purpose does not match its V1 asset kind');
    }
  }

  const rawContractRefs = snapshotDenseArray(asset.dataContractRefs, `${path}.dataContractRefs`, errors, MAX_DATA_CONTRACT_REFS);
  const dataContractRefs = [];
  if (rawContractRefs) {
    if (rawContractRefs.length === 0) {
      addError(errors, `${path}.dataContractRefs`, 'data_contract_refs_missing', 'at least one declared data-contract reference is required');
    }
    const seen = objectCreate(null);
    for (let index = 0; index < rawContractRefs.length; index += 1) {
      const reference = snapshotDataContractRef(rawContractRefs[index], `${path}.dataContractRefs[${index}]`, errors);
      if (
        reference &&
        isOpaqueReference(reference.contractId) &&
        isVersion(reference.contractVersion) &&
        isSha256(reference.contractSha256) &&
        reference.bindingState === 'declared'
      ) {
        const key = `${reference.contractId}\u0000${reference.contractVersion}`;
        if (objectHasOwn(seen, key)) {
          addError(errors, `${path}.dataContractRefs[${index}]`, 'data_contract_ref_duplicate', 'each contract identifier and version pair must be unique within an asset');
        }
        setOwnValue(seen, key, true);
        appendOwnArrayValue(dataContractRefs, reference);
      }
    }
  }

  const businessTermIds = snapshotOpaqueList(asset.businessTermIds, `${path}.businessTermIds`, errors, MAX_BUSINESS_TERMS, 'business_term');
  const qualityRuleIds = snapshotOpaqueList(asset.qualityRuleIds, `${path}.qualityRuleIds`, errors, MAX_QUALITY_RULES, 'quality_rule');

  const normalized = objectCreate(null);
  setOwnValue(normalized, 'assetId', asset.assetId);
  setOwnValue(normalized, 'assetKind', asset.assetKind);
  setOwnValue(normalized, 'revisionId', asset.revisionId);
  setOwnValue(normalized, 'revisionSequence', asset.revisionSequence);
  setOwnValue(normalized, 'lifecycleState', asset.lifecycleState);
  setOwnValue(normalized, 'definitionSha256', asset.definitionSha256);
  setOwnValue(normalized, 'domain', asset.domain);
  setOwnValue(normalized, 'dataGovernance', governance);
  setOwnValue(normalized, 'dataContractRefs', sortedCopy(dataContractRefs, (left, right) => {
    if (!left || !right) return 0;
    const idComparison = compareText(left.contractId, right.contractId);
    return idComparison === 0 ? compareText(left.contractVersion, right.contractVersion) : idComparison;
  }));
  setOwnValue(normalized, 'businessTermIds', businessTermIds);
  setOwnValue(normalized, 'qualityRuleIds', qualityRuleIds);
  return normalized;
}

function snapshotEndpoint(value, path, errors) {
  const endpoint = snapshotClosedRecord(value, LINEAGE_ENDPOINT_FIELDS, path, errors);
  if (!endpoint) return null;
  requireAllFields(endpoint, LINEAGE_ENDPOINT_FIELDS, path, errors);
  requireOpaqueReference(endpoint, 'assetId', path, errors);
  requireOpaqueReference(endpoint, 'revisionId', path, errors);
  requireSha256(endpoint, 'definitionSha256', path, errors, true);
  return endpoint;
}

function snapshotLineageEdge(value, path, errors) {
  const edge = snapshotClosedRecord(value, LINEAGE_EDGE_FIELDS, path, errors);
  if (!edge) return null;
  requireAllFields(edge, LINEAGE_EDGE_FIELDS, path, errors);
  requireOpaqueReference(edge, 'edgeId', path, errors);
  if (edge.relationship !== 'derives_from') {
    addError(errors, `${path}.relationship`, 'lineage_relationship_invalid', 'a V1 lineage edge must derive from its upstream asset');
  }
  const upstream = snapshotEndpoint(edge.upstream, `${path}.upstream`, errors);
  const downstream = snapshotEndpoint(edge.downstream, `${path}.downstream`, errors);
  const normalized = objectCreate(null);
  setOwnValue(normalized, 'edgeId', edge.edgeId);
  setOwnValue(normalized, 'relationship', edge.relationship);
  setOwnValue(normalized, 'upstream', upstream);
  setOwnValue(normalized, 'downstream', downstream);
  return normalized;
}

function findAssetByReference(assets, assetId, revisionId) {
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    if (asset && asset.assetId === assetId && asset.revisionId === revisionId) return asset;
  }
  return null;
}

function validateAssets(assets, errors) {
  const assetIds = objectCreate(null);
  const revisions = objectCreate(null);
  const kinds = objectCreate(null);
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    if (!asset) continue;
    if (isOpaqueReference(asset.assetId)) {
      if (objectHasOwn(assetIds, asset.assetId)) {
        addError(errors, `assets[${index}].assetId`, 'asset_id_duplicate', 'each logical data asset may appear only once in a catalog revision');
      }
      setOwnValue(assetIds, asset.assetId, true);
    }
    if (isOpaqueReference(asset.revisionId)) {
      if (objectHasOwn(revisions, asset.revisionId)) {
        addError(errors, `assets[${index}].revisionId`, 'asset_revision_duplicate', 'each data-asset revision identifier must be unique');
      }
      setOwnValue(revisions, asset.revisionId, true);
    }
    const profile = profileFor(asset.assetKind);
    if (profile) {
      if (objectHasOwn(kinds, asset.assetKind)) {
        addError(errors, `assets[${index}].assetKind`, 'asset_kind_duplicate', 'each V1 logical asset kind must appear once');
      }
      setOwnValue(kinds, asset.assetKind, true);
    }
  }
  if (assets.length !== MAX_ASSETS) {
    addError(errors, 'assets', 'asset_count_invalid', 'the V1 catalog must contain its four governed logical assets');
  }
  for (let index = 0; index < ASSET_PROFILES.length; index += 1) {
    const kind = ASSET_PROFILES[index].assetKind;
    if (!objectHasOwn(kinds, kind)) {
      addError(errors, 'assets', 'asset_kind_missing', 'the V1 catalog is missing a governed logical asset kind');
    }
  }
}

function hasCycle(assets, edges) {
  const state = objectCreate(null);
  function visit(asset) {
    const key = referenceKey(asset.assetId, asset.revisionId);
    if (!key) return false;
    if (state[key] === 'visiting') return true;
    if (state[key] === 'visited') return false;
    setOwnValue(state, key, 'visiting');
    for (let index = 0; index < edges.length; index += 1) {
      const edge = edges[index];
      if (!edge || !edge.upstream || !edge.downstream) continue;
      if (edge.upstream.assetId !== asset.assetId || edge.upstream.revisionId !== asset.revisionId) continue;
      const next = findAssetByReference(assets, edge.downstream.assetId, edge.downstream.revisionId);
      if (next && visit(next)) return true;
    }
    setOwnValue(state, key, 'visited');
    return false;
  }
  for (let index = 0; index < assets.length; index += 1) {
    if (assets[index] && visit(assets[index])) return true;
  }
  return false;
}

function validateLineage(assets, edges, errors) {
  if (edges.length !== MAX_LINEAGE_EDGES) {
    addError(errors, 'lineageEdges', 'lineage_edge_count_invalid', 'the V1 catalog must contain its three governed lineage edges');
  }
  const edgeIds = objectCreate(null);
  const edgeIdentities = objectCreate(null);
  for (let index = 0; index < edges.length; index += 1) {
    const edge = edges[index];
    if (!edge || !edge.upstream || !edge.downstream) continue;
    if (isOpaqueReference(edge.edgeId)) {
      if (objectHasOwn(edgeIds, edge.edgeId)) {
        addError(errors, `lineageEdges[${index}].edgeId`, 'lineage_edge_id_duplicate', 'each lineage edge identifier must be unique');
      }
      setOwnValue(edgeIds, edge.edgeId, true);
    }
    const identity = edgeKey(edge);
    if (identity) {
      if (objectHasOwn(edgeIdentities, identity)) {
        addError(errors, `lineageEdges[${index}]`, 'lineage_edge_duplicate', 'each lineage relationship must be unique');
      }
      setOwnValue(edgeIdentities, identity, true);
    }

    const upstream = findAssetByReference(assets, edge.upstream.assetId, edge.upstream.revisionId);
    const downstream = findAssetByReference(assets, edge.downstream.assetId, edge.downstream.revisionId);
    if (!upstream || !downstream) {
      addError(errors, `lineageEdges[${index}]`, 'lineage_reference_unknown', 'each lineage endpoint must refer to an asset revision in this catalog');
      continue;
    }
    if (upstream.assetId === downstream.assetId && upstream.revisionId === downstream.revisionId) {
      addError(errors, `lineageEdges[${index}]`, 'lineage_self_reference', 'a lineage edge cannot reference the same asset revision at both ends');
    }
    if (upstream.definitionSha256 !== edge.upstream.definitionSha256 || downstream.definitionSha256 !== edge.downstream.definitionSha256) {
      addError(errors, `lineageEdges[${index}]`, 'lineage_definition_mismatch', 'each lineage endpoint must bind the exact cataloged asset definition');
    }
  }

  if (hasCycle(assets, edges)) {
    addError(errors, 'lineageEdges', 'lineage_cycle_detected', 'the V1 lineage graph must be acyclic');
  }

  for (let pairIndex = 0; pairIndex < EXPECTED_LINEAGE_KIND_PAIRS.length; pairIndex += 1) {
    const [upstreamKind, downstreamKind] = EXPECTED_LINEAGE_KIND_PAIRS[pairIndex];
    let matched = false;
    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
      const edge = edges[edgeIndex];
      if (!edge || !edge.upstream || !edge.downstream) continue;
      const upstream = findAssetByReference(assets, edge.upstream.assetId, edge.upstream.revisionId);
      const downstream = findAssetByReference(assets, edge.downstream.assetId, edge.downstream.revisionId);
      if (upstream?.assetKind === upstreamKind && downstream?.assetKind === downstreamKind && edge.relationship === 'derives_from') {
        matched = true;
        break;
      }
    }
    if (!matched) {
      addError(errors, 'lineageEdges', 'lineage_chain_incomplete', 'the V1 catalog must retain the governed delivery-to-analytics chain');
    }
  }

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
    const edge = edges[edgeIndex];
    if (!edge || !edge.upstream || !edge.downstream) continue;
    const upstream = findAssetByReference(assets, edge.upstream.assetId, edge.upstream.revisionId);
    const downstream = findAssetByReference(assets, edge.downstream.assetId, edge.downstream.revisionId);
    if (!upstream || !downstream) continue;
    let permitted = false;
    for (let pairIndex = 0; pairIndex < EXPECTED_LINEAGE_KIND_PAIRS.length; pairIndex += 1) {
      const pair = EXPECTED_LINEAGE_KIND_PAIRS[pairIndex];
      if (pair[0] === upstream.assetKind && pair[1] === downstream.assetKind && edge.relationship === 'derives_from') {
        permitted = true;
        break;
      }
    }
    if (!permitted) {
      addError(errors, `lineageEdges[${edgeIndex}]`, 'lineage_chain_invalid', 'the V1 catalog permits only the governed delivery-to-analytics lineage chain');
    }
  }
}

function assetDefinitionProjection(asset) {
  const projection = objectCreate(null);
  setOwnValue(projection, 'assetId', asset.assetId);
  setOwnValue(projection, 'assetKind', asset.assetKind);
  setOwnValue(projection, 'revisionId', asset.revisionId);
  setOwnValue(projection, 'revisionSequence', asset.revisionSequence);
  setOwnValue(projection, 'lifecycleState', asset.lifecycleState);
  setOwnValue(projection, 'domain', asset.domain);
  setOwnValue(projection, 'dataGovernance', asset.dataGovernance);
  setOwnValue(projection, 'dataContractRefs', asset.dataContractRefs);
  setOwnValue(projection, 'businessTermIds', asset.businessTermIds);
  setOwnValue(projection, 'qualityRuleIds', asset.qualityRuleIds);
  return projection;
}

function catalogProjection(catalog) {
  const projection = objectCreate(null);
  setOwnValue(projection, 'contractVersion', catalog.contractVersion);
  setOwnValue(projection, 'catalogId', catalog.catalogId);
  setOwnValue(projection, 'catalogRevisionId', catalog.catalogRevisionId);
  setOwnValue(projection, 'catalogRevisionSequence', catalog.catalogRevisionSequence);
  setOwnValue(projection, 'lifecycleState', catalog.lifecycleState);
  setOwnValue(projection, 'assets', catalog.assets);
  setOwnValue(projection, 'lineageEdges', catalog.lineageEdges);
  return projection;
}

function canonicalJson(value, seen = new WeakSet()) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('canonical JSON requires finite numbers');
    return JSON.stringify(value);
  }
  if (arrayIsArray(value)) {
    if (seen.has(value)) throw new TypeError('canonical JSON does not support cyclic arrays');
    seen.add(value);
    let serialized = '[';
    for (let index = 0; index < value.length; index += 1) {
      if (index > 0) serialized += ',';
      serialized += canonicalJson(value[index], seen);
    }
    serialized += ']';
    seen.delete(value);
    return serialized;
  }
  if (!isPlainRecord(value)) throw new TypeError('canonical JSON requires plain records');
  if (seen.has(value)) throw new TypeError('canonical JSON does not support cyclic records');
  seen.add(value);
  const keys = [];
  const ownKeys = reflectOwnKeys(value);
  for (let index = 0; index < ownKeys.length; index += 1) {
    const key = ownKeys[index];
    if (typeof key !== 'string') throw new TypeError('canonical JSON requires string record fields');
    const descriptor = objectGetOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !objectHasOwn(descriptor, 'value')) {
      throw new TypeError('canonical JSON requires own enumerable data fields');
    }
    appendOwnArrayValue(keys, key);
  }
  const sortedKeys = sortedCopy(keys, compareText);
  let serialized = '{';
  for (let index = 0; index < sortedKeys.length; index += 1) {
    if (index > 0) serialized += ',';
    const key = sortedKeys[index];
    serialized += `${JSON.stringify(key)}:${canonicalJson(value[key], seen)}`;
  }
  serialized += '}';
  seen.delete(value);
  return serialized;
}

function sha256Canonical(value) {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

function freezeAsset(asset) {
  if (asset.dataGovernance) objectFreeze(asset.dataGovernance);
  if (asset.dataContractRefs) {
    for (let index = 0; index < asset.dataContractRefs.length; index += 1) {
      if (asset.dataContractRefs[index]) objectFreeze(asset.dataContractRefs[index]);
    }
    objectFreeze(asset.dataContractRefs);
  }
  if (asset.businessTermIds) objectFreeze(asset.businessTermIds);
  if (asset.qualityRuleIds) objectFreeze(asset.qualityRuleIds);
  return objectFreeze(asset);
}

function freezeCatalog(catalog) {
  for (let index = 0; index < catalog.assets.length; index += 1) {
    if (catalog.assets[index]) freezeAsset(catalog.assets[index]);
  }
  objectFreeze(catalog.assets);
  for (let index = 0; index < catalog.lineageEdges.length; index += 1) {
    const edge = catalog.lineageEdges[index];
    if (!edge) continue;
    if (edge.upstream) objectFreeze(edge.upstream);
    if (edge.downstream) objectFreeze(edge.downstream);
    objectFreeze(edge);
  }
  objectFreeze(catalog.lineageEdges);
  return objectFreeze(catalog);
}

function snapshotCatalog(catalog, options, errors) {
  const root = snapshotClosedRecord(catalog, ROOT_FIELDS, 'catalog', errors);
  if (!root) return null;
  requireAllFields(
    root,
    ROOT_FIELDS,
    'catalog',
    errors,
    options.requireCatalogSha256 ? undefined : 'catalogSha256'
  );
  if (root.contractVersion !== DATA_ASSET_CATALOG_CONTRACT_VERSION) {
    addError(errors, 'catalog.contractVersion', 'contract_version_unsupported', `expected contract version ${DATA_ASSET_CATALOG_CONTRACT_VERSION}`);
  }
  requireOpaqueReference(root, 'catalogId', 'catalog', errors);
  requireOpaqueReference(root, 'catalogRevisionId', 'catalog', errors);
  if (!isPositiveSafeInteger(root.catalogRevisionSequence)) {
    addError(errors, 'catalog.catalogRevisionSequence', 'catalog_revision_sequence_invalid', 'a positive catalog revision sequence is required');
  }
  if (root.lifecycleState !== 'registered') {
    addError(errors, 'catalog.lifecycleState', 'catalog_lifecycle_invalid', 'a V1 catalog is registered metadata only');
  }
  requireSha256(root, 'catalogSha256', 'catalog', errors, options.requireCatalogSha256);

  const rawAssets = snapshotDenseArray(root.assets, 'catalog.assets', errors, MAX_ASSETS);
  const assets = [];
  if (rawAssets) {
    for (let index = 0; index < rawAssets.length; index += 1) {
      appendOwnArrayValue(assets, snapshotAsset(rawAssets[index], `catalog.assets[${index}]`, errors, options));
    }
  }
  validateAssets(assets, errors);

  const rawEdges = snapshotDenseArray(root.lineageEdges, 'catalog.lineageEdges', errors, MAX_LINEAGE_EDGES);
  const lineageEdges = [];
  if (rawEdges) {
    for (let index = 0; index < rawEdges.length; index += 1) {
      appendOwnArrayValue(lineageEdges, snapshotLineageEdge(rawEdges[index], `catalog.lineageEdges[${index}]`, errors));
    }
  }
  validateLineage(assets, lineageEdges, errors);

  const normalized = objectCreate(null);
  setOwnValue(normalized, 'contractVersion', root.contractVersion);
  setOwnValue(normalized, 'catalogId', root.catalogId);
  setOwnValue(normalized, 'catalogRevisionId', root.catalogRevisionId);
  setOwnValue(normalized, 'catalogRevisionSequence', root.catalogRevisionSequence);
  setOwnValue(normalized, 'lifecycleState', root.lifecycleState);
  setOwnValue(normalized, 'catalogSha256', root.catalogSha256);
  setOwnValue(normalized, 'assets', sortedCopy(assets, (left, right) => {
    if (!left || !right) return 0;
    const idComparison = compareText(left.assetId, right.assetId);
    return idComparison === 0 ? compareText(left.revisionId, right.revisionId) : idComparison;
  }));
  setOwnValue(normalized, 'lineageEdges', sortedCopy(lineageEdges, (left, right) => {
    if (!left || !right) return 0;
    return compareText(left.edgeId, right.edgeId);
  }));
  return normalized;
}

function assertSnapshotIsValid(errors, message) {
  if (errors.length > 0) throw new TypeError(message);
}

/**
 * Derive a SHA-256 definition identity from an asset's closed metadata. The
 * helper accepts a null/absent `definitionSha256` because that is the value it
 * calculates; it still rejects all other invalid or unreadable metadata.
 */
export function calculateDataAssetDefinitionSha256(asset) {
  try {
    const errors = [];
    const normalized = snapshotAsset(asset, 'asset', errors, { requireDefinitionSha256: false });
    assertSnapshotIsValid(errors, 'a valid metadata-only asset definition is required');
    return sha256Canonical(assetDefinitionProjection(normalized));
  } catch {
    throw new TypeError('a valid metadata-only asset definition is required');
  }
}

/**
 * Derive a catalog integrity value from a complete closed metadata catalog.
 * The catalog's own SHA field is excluded from this projection, while each
 * asset definition and every exact lineage endpoint remains bound.
 */
export function calculateDataAssetCatalogSha256(catalog) {
  try {
    const errors = [];
    const normalized = snapshotCatalog(catalog, {
      requireCatalogSha256: false,
      requireDefinitionSha256: true
    }, errors);
    assertSnapshotIsValid(errors, 'a valid metadata-only data-asset catalog is required');
    for (let index = 0; index < normalized.assets.length; index += 1) {
      const asset = normalized.assets[index];
      if (asset.definitionSha256 !== sha256Canonical(assetDefinitionProjection(asset))) {
        throw new TypeError('a valid metadata-only data-asset catalog is required');
      }
    }
    return sha256Canonical(catalogProjection(normalized));
  } catch {
    throw new TypeError('a valid metadata-only data-asset catalog is required');
  }
}

function createValidationResult(valid, errors, integrity, normalizedCatalog) {
  const result = objectCreate(null);
  setOwnValue(result, 'valid', valid);
  setOwnValue(result, 'outcome', valid ? 'catalog_valid' : 'catalog_invalid');
  setOwnValue(result, 'errors', objectFreeze(errors));
  if (integrity) setOwnValue(result, 'integrity', objectFreeze(integrity));
  if (normalizedCatalog) setOwnValue(result, 'normalizedCatalog', normalizedCatalog);
  return objectFreeze(result);
}

/**
 * Validate metadata only. A valid result means that this V1 catalog is a
 * coherent, closed, integrity-bound registration of the four logical data
 * products. It does not publish content, grant access, write a ledger,
 * synchronize a device, resolve a policy, or create analytics.
 */
function validateDataAssetCatalogInternal(catalog) {
  const errors = [];
  const normalized = snapshotCatalog(catalog, {
    requireCatalogSha256: true,
    requireDefinitionSha256: true
  }, errors);
  if (!normalized || errors.length > 0) return createValidationResult(false, errors);

  for (let index = 0; index < normalized.assets.length; index += 1) {
    const asset = normalized.assets[index];
    const calculated = sha256Canonical(assetDefinitionProjection(asset));
    if (asset.definitionSha256 !== calculated) {
      addError(errors, `catalog.assets[${index}].definitionSha256`, 'definition_sha256_mismatch', 'the asset definition SHA-256 does not bind its declared metadata');
    }
  }
  if (errors.length > 0) return createValidationResult(false, errors);

  const calculatedCatalogSha256 = sha256Canonical(catalogProjection(normalized));
  if (normalized.catalogSha256 !== calculatedCatalogSha256) {
    addError(errors, 'catalog.catalogSha256', 'catalog_sha256_mismatch', 'the catalog SHA-256 does not bind its declared metadata and lineage');
    return createValidationResult(false, errors);
  }

  const integrity = objectCreate(null);
  setOwnValue(integrity, 'catalogSha256', calculatedCatalogSha256);
  return createValidationResult(true, errors, integrity, freezeCatalog(normalized));
}

/**
 * Fail closed without allowing exotic client objects to escape as exceptions.
 */
export function validateDataAssetCatalog(catalog) {
  try {
    return validateDataAssetCatalogInternal(catalog);
  } catch {
    const errors = [];
    addError(errors, 'catalog', 'catalog_input_unreadable', 'the metadata catalog could not be read safely');
    return createValidationResult(false, errors);
  }
}
