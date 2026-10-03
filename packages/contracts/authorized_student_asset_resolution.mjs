/**
 * Pure binding gate for a future, server-side student asset resolver.
 *
 * It neither authenticates a caller nor reads a ledger, file, database, or
 * network. The resolver must obtain every input from its authorized internal
 * sources. In particular, client input must never supply the records,
 * snapshots, or byte-integrity evidence accepted here.
 */

import { createHash } from 'node:crypto';
import { evaluateK12Access } from './access_policy.mjs';
import { evaluateGovernedStudentDeliveryEligibility } from './governed_delivery_eligibility.mjs';

export const AUTHORIZED_STUDENT_ASSET_RESOLUTION_CONTRACT_VERSION = '1.0.0';

const ROOT_FIELDS = new Set([
  'resolverContext',
  'target',
  'authorizationSnapshot',
  'entitlementSnapshot',
  'governanceSnapshot',
  'byteIntegrityEvidence',
  'accessRequest',
  'serverResolvedRecords'
]);
const RESOLVER_CONTEXT_FIELDS = new Set([
  'contractVersion',
  'invocationId',
  'observedAt',
  'tenantId',
  'actorPseudonym',
  'actorRole',
  'purpose',
  'timeSourceId'
]);
const TARGET_FIELDS = new Set([
  'packageId',
  'contentItemId',
  'contentRevisionId',
  'revisionSha256',
  'assetSetSha256',
  'assetEvidenceBundleId',
  'assetId',
  'assetRevisionId',
  'byteSha256',
  'mediaType',
  'deliveryProfile'
]);
const AUTHORIZATION_SNAPSHOT_FIELDS = new Set([
  'decisionId',
  'decisionSha256',
  'policyVersion',
  'action',
  'effect',
  'tenantId',
  'actorPseudonym',
  'purpose',
  'targetSha256',
  'issuedAt',
  'expiresAt'
]);
const ENTITLEMENT_SNAPSHOT_FIELDS = new Set([
  'entitlementId',
  'entitlementSha256',
  'entitlementPolicyVersion',
  'state',
  'tenantId',
  'learnerPseudonym',
  'packageId',
  'contentItemId',
  'contentRevisionId',
  'revisionSha256',
  'assetSetSha256',
  'purpose',
  'issuedAt',
  'expiresAt'
]);
const GOVERNANCE_SNAPSHOT_FIELDS = new Set([
  'snapshotId',
  'snapshotSha256',
  'snapshotSequence',
  'capturedAt',
  'effectivePublicationDecisionId',
  'effectivePublicationSequence',
  'outcome',
  'revision'
]);
const GOVERNANCE_REVISION_FIELDS = new Set([
  'contentItemId',
  'revisionId',
  'sha256',
  'assetSetSha256'
]);
const BYTE_EVIDENCE_FIELDS = new Set([
  'byteSnapshotId',
  'verificationState',
  'verifiedAt',
  'bundleId',
  'assetId',
  'revisionId',
  'mediaType',
  'deliveryProfile',
  'byteSha256'
]);
const SERVER_RECORD_FIELDS = new Set([
  'manifest',
  'curriculumEntries',
  'releaseCandidate',
  'publicationDecisionHistory',
  'assetEvidenceBundles'
]);
const ACCESS_REQUEST_FIELDS = new Set(['actor', 'resource', 'action']);
const ACCESS_ACTOR_FIELDS = new Set(['tenantId', 'subjectId', 'role']);
const ACCESS_RESOURCE_FIELDS = new Set(['tenantId', 'type', 'learnerId', 'packageId']);

function isRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/iu.test(value);
}

function isUtcTimestamp(value) {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value;
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function blocked(errors) {
  return { handoffEligible: false, nextState: 'blocked', errors };
}

function requireString(errors, value, path, code, message) {
  if (!isNonEmptyString(value)) {
    addError(errors, path, code, message);
  }
}

function rejectUnsupportedFields(record, allowedFields, path, errors) {
  if (!isRecord(record)) return;
  Object.keys(record).forEach(field => {
    if (!allowedFields.has(field)) {
      addError(
        errors,
        path ? `${path}.${field}` : field,
        'resolver_field_unsupported',
        'this resolver boundary does not accept unsupported fields'
      );
    }
  });
}

function requireSha256(errors, value, path, code, message) {
  if (!isSha256(value)) {
    addError(errors, path, code, message);
  }
}

function requireTimestamp(errors, value, path, code, message) {
  if (!isUtcTimestamp(value)) {
    addError(errors, path, code, message);
  }
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function sha256Canonical(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function comparePublicationHistoryRecords(left, right) {
  const leftSequence = Number.isInteger(left?.decisionSequence) ? left.decisionSequence : -1;
  const rightSequence = Number.isInteger(right?.decisionSequence) ? right.decisionSequence : -1;
  if (leftSequence !== rightSequence) return leftSequence - rightSequence;
  const leftId = typeof left?.decisionId === 'string' ? left.decisionId : '';
  const rightId = typeof right?.decisionId === 'string' ? right.decisionId : '';
  if (leftId === rightId) return 0;
  return leftId < rightId ? -1 : 1;
}

/**
 * Canonical JSON keeps an authorization target digest independent from
 * JavaScript object insertion order and unambiguous when an identifier
 * contains a delimiter character.
 */
export function calculateStudentAssetTargetSha256(target) {
  if (!isRecord(target)) return null;
  return sha256Canonical({
    packageId: target.packageId,
    contentItemId: target.contentItemId,
    contentRevisionId: target.contentRevisionId,
    revisionSha256: target.revisionSha256,
    assetSetSha256: target.assetSetSha256,
    assetEvidenceBundleId: target.assetEvidenceBundleId,
    assetId: target.assetId,
    assetRevisionId: target.assetRevisionId,
    byteSha256: target.byteSha256,
    mediaType: target.mediaType,
    deliveryProfile: target.deliveryProfile
  });
}

/**
 * Bind an authorization snapshot to its declared non-secret fields. This is
 * an integrity relationship, not a signature or proof that a caller was
 * authenticated; the resolver must obtain the source record internally.
 */
export function calculateAuthorizationSnapshotSha256(snapshot) {
  if (!isRecord(snapshot)) return null;
  const { decisionSha256, ...payload } = snapshot;
  return sha256Canonical(payload);
}

/**
 * Bind an internal learner-assignment snapshot to its declared non-secret
 * fields. As with every pure contract in this module, an external resolver
 * must still establish that the snapshot came from an authorized source.
 */
export function calculateLearnerEntitlementSnapshotSha256(snapshot) {
  if (!isRecord(snapshot)) return null;
  const { entitlementSha256, ...payload } = snapshot;
  return sha256Canonical(payload);
}

/**
 * Bind the snapshot header to the supplied publication history in stable
 * decision-sequence order. It cannot prove that the supplied history is a
 * complete authoritative ledger; that boundary belongs to the resolver.
 */
export function calculateGovernanceSnapshotSha256(snapshot, publicationDecisionHistory) {
  if (!isRecord(snapshot) || !Array.isArray(publicationDecisionHistory)) return null;
  const { snapshotSha256, ...payload } = snapshot;
  return sha256Canonical({
    snapshot: payload,
    publicationDecisionHistory: [...publicationDecisionHistory].sort(comparePublicationHistoryRecords)
  });
}

function validateResolverContext(context, errors) {
  if (!isRecord(context)) {
    addError(errors, 'resolverContext', 'resolver_context_missing', 'a server-resolved context is required');
    return;
  }
  rejectUnsupportedFields(context, RESOLVER_CONTEXT_FIELDS, 'resolverContext', errors);
  if (context.contractVersion !== AUTHORIZED_STUDENT_ASSET_RESOLUTION_CONTRACT_VERSION) {
    addError(errors, 'resolverContext.contractVersion', 'contract_version_unsupported', `expected contract version ${AUTHORIZED_STUDENT_ASSET_RESOLUTION_CONTRACT_VERSION}`);
  }
  requireString(errors, context.invocationId, 'resolverContext.invocationId', 'invocation_id_missing', 'a resolver invocation identifier is required');
  requireTimestamp(errors, context.observedAt, 'resolverContext.observedAt', 'observed_at_invalid', 'a strict UTC server observation time is required');
  requireString(errors, context.tenantId, 'resolverContext.tenantId', 'tenant_id_missing', 'a tenant identifier is required');
  if (typeof context.actorPseudonym !== 'string' || !/^learner_[a-z0-9_-]{12,}$/iu.test(context.actorPseudonym)) {
    addError(errors, 'resolverContext.actorPseudonym', 'actor_pseudonym_invalid', 'a non-identifying learner pseudonym is required');
  }
  if (context.actorRole !== 'student') {
    addError(errors, 'resolverContext.actorRole', 'actor_role_invalid', 'only the student resolver role is accepted by this contract');
  }
  if (context.purpose !== 'student_learning_delivery') {
    addError(errors, 'resolverContext.purpose', 'purpose_invalid', 'the resolver purpose must be student_learning_delivery');
  }
  requireString(errors, context.timeSourceId, 'resolverContext.timeSourceId', 'time_source_id_missing', 'a server time-source identifier is required');
}

function validateTarget(target, errors) {
  if (!isRecord(target)) {
    addError(errors, 'target', 'target_missing', 'a resolved asset target is required');
    return;
  }
  rejectUnsupportedFields(target, TARGET_FIELDS, 'target', errors);
  [
    'packageId',
    'contentItemId',
    'contentRevisionId',
    'assetEvidenceBundleId',
    'assetId',
    'assetRevisionId',
    'mediaType',
    'deliveryProfile'
  ].forEach(field => requireString(errors, target[field], `target.${field}`, 'target_field_missing', `target ${field} is required`));
  ['revisionSha256', 'assetSetSha256', 'byteSha256'].forEach(field => {
    requireSha256(errors, target[field], `target.${field}`, 'target_sha256_invalid', `target ${field} must be a SHA-256`);
  });
}

function validateAuthorizationSnapshot(snapshot, errors) {
  if (!isRecord(snapshot)) {
    addError(errors, 'authorizationSnapshot', 'authorization_snapshot_missing', 'a server-resolved authorization snapshot is required');
    return;
  }
  rejectUnsupportedFields(snapshot, AUTHORIZATION_SNAPSHOT_FIELDS, 'authorizationSnapshot', errors);
  ['decisionId', 'policyVersion', 'tenantId', 'actorPseudonym'].forEach(field => {
    requireString(errors, snapshot[field], `authorizationSnapshot.${field}`, 'authorization_field_missing', `authorization ${field} is required`);
  });
  ['decisionSha256', 'targetSha256'].forEach(field => {
    requireSha256(errors, snapshot[field], `authorizationSnapshot.${field}`, 'authorization_sha256_invalid', `authorization ${field} must be a SHA-256`);
  });
  if (snapshot.action !== 'read_student_content_asset') {
    addError(errors, 'authorizationSnapshot.action', 'authorization_action_invalid', 'authorization must permit read_student_content_asset');
  }
  if (snapshot.effect !== 'allow') {
    addError(errors, 'authorizationSnapshot.effect', 'authorization_effect_invalid', 'authorization effect must be allow');
  }
  if (snapshot.purpose !== 'student_learning_delivery') {
    addError(errors, 'authorizationSnapshot.purpose', 'authorization_purpose_invalid', 'authorization purpose must be student_learning_delivery');
  }
  requireTimestamp(errors, snapshot.issuedAt, 'authorizationSnapshot.issuedAt', 'authorization_issued_at_invalid', 'authorization issuedAt must be strict UTC');
  requireTimestamp(errors, snapshot.expiresAt, 'authorizationSnapshot.expiresAt', 'authorization_expires_at_invalid', 'authorization expiresAt must be strict UTC');
}

function validateEntitlementSnapshot(snapshot, errors) {
  if (!isRecord(snapshot)) {
    addError(errors, 'entitlementSnapshot', 'entitlement_snapshot_missing', 'a server-resolved learner entitlement snapshot is required');
    return;
  }
  rejectUnsupportedFields(snapshot, ENTITLEMENT_SNAPSHOT_FIELDS, 'entitlementSnapshot', errors);
  [
    'entitlementId',
    'entitlementPolicyVersion',
    'tenantId',
    'learnerPseudonym',
    'packageId',
    'contentItemId',
    'contentRevisionId'
  ].forEach(field => {
    requireString(errors, snapshot[field], `entitlementSnapshot.${field}`, 'entitlement_field_missing', `learner entitlement ${field} is required`);
  });
  requireSha256(errors, snapshot.entitlementSha256, 'entitlementSnapshot.entitlementSha256', 'entitlement_sha256_invalid', 'learner entitlement SHA-256 is required');
  ['revisionSha256', 'assetSetSha256'].forEach(field => {
    requireSha256(errors, snapshot[field], `entitlementSnapshot.${field}`, 'entitlement_target_sha256_invalid', `learner entitlement ${field} must be a SHA-256`);
  });
  if (snapshot.state !== 'active') {
    addError(errors, 'entitlementSnapshot.state', 'entitlement_state_invalid', 'learner entitlement state must be active');
  }
  if (snapshot.purpose !== 'student_learning_delivery') {
    addError(errors, 'entitlementSnapshot.purpose', 'entitlement_purpose_invalid', 'learner entitlement purpose must be student_learning_delivery');
  }
  requireTimestamp(errors, snapshot.issuedAt, 'entitlementSnapshot.issuedAt', 'entitlement_issued_at_invalid', 'learner entitlement issuedAt must be strict UTC');
  requireTimestamp(errors, snapshot.expiresAt, 'entitlementSnapshot.expiresAt', 'entitlement_expires_at_invalid', 'learner entitlement expiresAt must be strict UTC');
}

function validateGovernanceSnapshot(snapshot, errors) {
  if (!isRecord(snapshot)) {
    addError(errors, 'governanceSnapshot', 'governance_snapshot_missing', 'a governance snapshot is required');
    return;
  }
  rejectUnsupportedFields(snapshot, GOVERNANCE_SNAPSHOT_FIELDS, 'governanceSnapshot', errors);
  requireString(errors, snapshot.snapshotId, 'governanceSnapshot.snapshotId', 'governance_snapshot_id_missing', 'a governance snapshot identifier is required');
  requireSha256(errors, snapshot.snapshotSha256, 'governanceSnapshot.snapshotSha256', 'governance_snapshot_sha256_invalid', 'a governance snapshot SHA-256 is required');
  if (!Number.isInteger(snapshot.snapshotSequence) || snapshot.snapshotSequence < 1) {
    addError(errors, 'governanceSnapshot.snapshotSequence', 'governance_snapshot_sequence_invalid', 'a positive governance snapshot sequence is required');
  }
  requireTimestamp(errors, snapshot.capturedAt, 'governanceSnapshot.capturedAt', 'governance_snapshot_captured_at_invalid', 'governance snapshot capturedAt must be strict UTC');
  requireString(errors, snapshot.effectivePublicationDecisionId, 'governanceSnapshot.effectivePublicationDecisionId', 'publication_decision_id_missing', 'an effective publication decision identifier is required');
  if (!Number.isInteger(snapshot.effectivePublicationSequence) || snapshot.effectivePublicationSequence < 1) {
    addError(errors, 'governanceSnapshot.effectivePublicationSequence', 'publication_sequence_invalid', 'a positive effective publication sequence is required');
  }
  if (snapshot.outcome !== 'published') {
    addError(errors, 'governanceSnapshot.outcome', 'governance_snapshot_outcome_invalid', 'the effective governance snapshot outcome must be published');
  }
  if (!isRecord(snapshot.revision)) {
    addError(errors, 'governanceSnapshot.revision', 'governance_snapshot_revision_missing', 'a snapshot revision is required');
    return;
  }
  rejectUnsupportedFields(snapshot.revision, GOVERNANCE_REVISION_FIELDS, 'governanceSnapshot.revision', errors);
  ['contentItemId', 'revisionId'].forEach(field => {
    requireString(errors, snapshot.revision[field], `governanceSnapshot.revision.${field}`, 'governance_snapshot_revision_field_missing', `snapshot revision ${field} is required`);
  });
  ['sha256', 'assetSetSha256'].forEach(field => {
    requireSha256(errors, snapshot.revision[field], `governanceSnapshot.revision.${field}`, 'governance_snapshot_revision_sha256_invalid', `snapshot revision ${field} must be a SHA-256`);
  });
}

function validateByteIntegrityEvidence(evidence, errors) {
  if (!isRecord(evidence)) {
    addError(errors, 'byteIntegrityEvidence', 'byte_integrity_evidence_missing', 'server-resolved byte-integrity evidence is required');
    return;
  }
  rejectUnsupportedFields(evidence, BYTE_EVIDENCE_FIELDS, 'byteIntegrityEvidence', errors);
  ['byteSnapshotId', 'bundleId', 'assetId', 'revisionId', 'mediaType', 'deliveryProfile'].forEach(field => {
    requireString(errors, evidence[field], `byteIntegrityEvidence.${field}`, 'byte_integrity_field_missing', `byte integrity ${field} is required`);
  });
  if (evidence.verificationState !== 'byte_integrity_verified') {
    addError(errors, 'byteIntegrityEvidence.verificationState', 'byte_integrity_state_invalid', 'byte integrity evidence must be verified');
  }
  requireTimestamp(errors, evidence.verifiedAt, 'byteIntegrityEvidence.verifiedAt', 'byte_integrity_verified_at_invalid', 'byte integrity verifiedAt must be strict UTC');
  requireSha256(errors, evidence.byteSha256, 'byteIntegrityEvidence.byteSha256', 'byte_integrity_sha256_invalid', 'a byte integrity SHA-256 is required');
}

function validateAccessRequest(accessRequest, errors) {
  if (!isRecord(accessRequest)) {
    addError(errors, 'accessRequest', 'access_request_missing', 'a policy access request is required');
    return;
  }
  rejectUnsupportedFields(accessRequest, ACCESS_REQUEST_FIELDS, 'accessRequest', errors);
  if (!isRecord(accessRequest.actor)) {
    addError(errors, 'accessRequest.actor', 'access_actor_missing', 'an access actor is required');
  } else {
    rejectUnsupportedFields(accessRequest.actor, ACCESS_ACTOR_FIELDS, 'accessRequest.actor', errors);
  }
  if (!isRecord(accessRequest.resource)) {
    addError(errors, 'accessRequest.resource', 'access_resource_missing', 'an access resource is required');
  } else {
    rejectUnsupportedFields(accessRequest.resource, ACCESS_RESOURCE_FIELDS, 'accessRequest.resource', errors);
  }
}

function validateServerResolvedRecords(records, errors) {
  if (!isRecord(records)) {
    addError(errors, 'serverResolvedRecords', 'server_records_missing', 'server-resolved governance records are required');
    return;
  }
  rejectUnsupportedFields(records, SERVER_RECORD_FIELDS, 'serverResolvedRecords', errors);
  for (const field of SERVER_RECORD_FIELDS) {
    if (!(field in records)) {
      addError(errors, `serverResolvedRecords.${field}`, 'server_record_missing', `server-resolved ${field} is required`);
    }
  }
}

function validateSnapshotIntegrity(authorization, entitlement, governance, records, errors) {
  if (isRecord(authorization) && isSha256(authorization.decisionSha256)) {
    const expectedAuthorizationSha256 = calculateAuthorizationSnapshotSha256(authorization);
    if (authorization.decisionSha256 !== expectedAuthorizationSha256) {
      addError(
        errors,
        'authorizationSnapshot.decisionSha256',
        'authorization_snapshot_hash_mismatch',
        'authorization snapshot SHA-256 must bind its declared fields'
      );
    }
  }

  if (isRecord(entitlement) && isSha256(entitlement.entitlementSha256)) {
    const expectedEntitlementSha256 = calculateLearnerEntitlementSnapshotSha256(entitlement);
    if (entitlement.entitlementSha256 !== expectedEntitlementSha256) {
      addError(
        errors,
        'entitlementSnapshot.entitlementSha256',
        'entitlement_snapshot_hash_mismatch',
        'learner entitlement SHA-256 must bind its declared assignment fields'
      );
    }
  }

  if (isRecord(governance) && isSha256(governance.snapshotSha256) && Array.isArray(records?.publicationDecisionHistory)) {
    const expectedGovernanceSha256 = calculateGovernanceSnapshotSha256(governance, records.publicationDecisionHistory);
    if (governance.snapshotSha256 !== expectedGovernanceSha256) {
      addError(
        errors,
        'governanceSnapshot.snapshotSha256',
        'governance_snapshot_hash_mismatch',
        'governance snapshot SHA-256 must bind its declared fields and publication history'
      );
    }
  }
}

function addEqualityError(errors, path, code, message) {
  addError(errors, path, code, message);
}

function validateTimeOrdering(context, authorization, entitlement, governance, byteEvidence, errors) {
  if (!isUtcTimestamp(context?.observedAt)) return;
  const observedAt = Date.parse(context.observedAt);

  if (isUtcTimestamp(authorization?.issuedAt) && Date.parse(authorization.issuedAt) > observedAt) {
    addError(errors, 'authorizationSnapshot.issuedAt', 'authorization_not_yet_valid', 'authorization cannot be issued after the resolver observation time');
  }
  if (isUtcTimestamp(authorization?.expiresAt) && Date.parse(authorization.expiresAt) < observedAt) {
    addError(errors, 'authorizationSnapshot.expiresAt', 'authorization_expired', 'authorization must remain valid at the resolver observation time');
  }
  if (
    isUtcTimestamp(authorization?.issuedAt) &&
    isUtcTimestamp(authorization?.expiresAt) &&
    Date.parse(authorization.issuedAt) > Date.parse(authorization.expiresAt)
  ) {
    addError(errors, 'authorizationSnapshot', 'authorization_time_range_invalid', 'authorization issuedAt cannot be after expiresAt');
  }
  if (isUtcTimestamp(entitlement?.issuedAt) && Date.parse(entitlement.issuedAt) > observedAt) {
    addError(errors, 'entitlementSnapshot.issuedAt', 'entitlement_not_yet_valid', 'learner entitlement cannot be issued after the resolver observation time');
  }
  if (isUtcTimestamp(entitlement?.expiresAt) && Date.parse(entitlement.expiresAt) < observedAt) {
    addError(errors, 'entitlementSnapshot.expiresAt', 'entitlement_expired', 'learner entitlement must remain valid at the resolver observation time');
  }
  if (
    isUtcTimestamp(entitlement?.issuedAt) &&
    isUtcTimestamp(entitlement?.expiresAt) &&
    Date.parse(entitlement.issuedAt) > Date.parse(entitlement.expiresAt)
  ) {
    addError(errors, 'entitlementSnapshot', 'entitlement_time_range_invalid', 'learner entitlement issuedAt cannot be after expiresAt');
  }
  if (isUtcTimestamp(governance?.capturedAt) && Date.parse(governance.capturedAt) > observedAt) {
    addError(errors, 'governanceSnapshot.capturedAt', 'governance_snapshot_after_observation', 'governance snapshot cannot be captured after resolver observation');
  }
  if (isUtcTimestamp(byteEvidence?.verifiedAt) && Date.parse(byteEvidence.verifiedAt) > observedAt) {
    addError(errors, 'byteIntegrityEvidence.verifiedAt', 'byte_integrity_after_observation', 'byte integrity cannot be verified after resolver observation');
  }
}

function validateContextBinding(context, authorization, entitlement, target, accessRequest, errors) {
  if (!isRecord(context) || !isRecord(authorization) || !isRecord(target) || !isRecord(accessRequest)) return;
  if (authorization.tenantId !== context.tenantId) {
    addEqualityError(errors, 'authorizationSnapshot.tenantId', 'authorization_tenant_mismatch', 'authorization tenant must match resolver tenant');
  }
  if (authorization.actorPseudonym !== context.actorPseudonym) {
    addEqualityError(errors, 'authorizationSnapshot.actorPseudonym', 'authorization_actor_mismatch', 'authorization actor must match resolver actor');
  }
  if (authorization.purpose !== context.purpose) {
    addEqualityError(errors, 'authorizationSnapshot.purpose', 'authorization_purpose_mismatch', 'authorization purpose must match resolver purpose');
  }
  if (isRecord(entitlement)) {
    if (entitlement.tenantId !== context.tenantId) {
      addEqualityError(errors, 'entitlementSnapshot.tenantId', 'entitlement_tenant_mismatch', 'learner entitlement tenant must match resolver tenant');
    }
    if (entitlement.learnerPseudonym !== context.actorPseudonym) {
      addEqualityError(errors, 'entitlementSnapshot.learnerPseudonym', 'entitlement_learner_mismatch', 'learner entitlement must match resolver actor');
    }
    if (entitlement.purpose !== context.purpose) {
      addEqualityError(errors, 'entitlementSnapshot.purpose', 'entitlement_purpose_mismatch', 'learner entitlement purpose must match resolver purpose');
    }
  }
  if (authorization.targetSha256 !== calculateStudentAssetTargetSha256(target)) {
    addEqualityError(errors, 'authorizationSnapshot.targetSha256', 'authorization_target_mismatch', 'authorization must bind the exact resolved asset target');
  }
  const actor = accessRequest.actor;
  const resource = accessRequest.resource;
  if (!isRecord(actor) || !isRecord(resource)) return;
  if (actor.tenantId !== context.tenantId || resource.tenantId !== context.tenantId) {
    addEqualityError(errors, 'accessRequest', 'access_tenant_mismatch', 'policy request tenant must match resolver tenant');
  }
  if (actor.subjectId !== context.actorPseudonym || actor.role !== context.actorRole) {
    addEqualityError(errors, 'accessRequest.actor', 'access_actor_mismatch', 'policy actor must match resolver actor');
  }
  if (resource.type !== 'student_content_asset' || resource.packageId !== target.packageId) {
    addEqualityError(errors, 'accessRequest.resource', 'access_resource_mismatch', 'policy resource must match the resolved student asset package');
  }
  if (accessRequest.action !== 'read') {
    addEqualityError(errors, 'accessRequest.action', 'access_action_mismatch', 'policy action must be read');
  }
}

function validateTargetBindings(target, records, entitlement, governance, byteEvidence, errors) {
  const manifest = records?.manifest;
  if (!isRecord(target) || !isRecord(manifest) || !isRecord(manifest.content)) return;

  const contentBindings = [
    ['packageId', manifest.packageId],
    ['contentItemId', manifest.content.contentItemId],
    ['contentRevisionId', manifest.content.revisionId],
    ['revisionSha256', manifest.content.revisionSha256],
    ['assetSetSha256', manifest.content.assetSetSha256]
  ];
  contentBindings.forEach(([field, expected]) => {
    if (target[field] !== expected) {
      addEqualityError(errors, `target.${field}`, 'target_manifest_mismatch', 'target must match the resolved student package manifest');
    }
  });

  const matchingAssets = Array.isArray(manifest.assets)
    ? manifest.assets.filter(asset => asset?.assetEvidenceBundleId === target.assetEvidenceBundleId)
    : [];
  if (matchingAssets.length !== 1) {
    addEqualityError(errors, 'target.assetEvidenceBundleId', 'target_asset_not_in_manifest', 'target must resolve exactly one manifest asset reference');
  } else {
    const asset = matchingAssets[0];
    const assetBindings = [
      ['assetId', asset.assetId],
      ['assetRevisionId', asset.revisionId],
      ['byteSha256', asset.byteSha256],
      ['mediaType', asset.mediaType],
      ['deliveryProfile', asset.deliveryProfile]
    ];
    assetBindings.forEach(([field, expected]) => {
      if (target[field] !== expected) {
        addEqualityError(errors, `target.${field}`, 'target_manifest_asset_mismatch', 'target must match its manifest asset reference');
      }
    });
  }

  const matchingBundles = Array.isArray(records?.assetEvidenceBundles)
    ? records.assetEvidenceBundles.filter(bundle => bundle?.bundleId === target.assetEvidenceBundleId)
    : [];
  if (matchingBundles.length !== 1) {
    addEqualityError(errors, 'target.assetEvidenceBundleId', 'target_bundle_not_resolved', 'target must resolve exactly one asset evidence bundle');
  } else {
    const asset = matchingBundles[0].asset;
    const bundleBindings = [
      ['assetId', asset?.assetId],
      ['assetRevisionId', asset?.revisionId],
      ['byteSha256', asset?.byteSha256],
      ['mediaType', asset?.mediaType],
      ['deliveryProfile', asset?.deliveryProfile]
    ];
    bundleBindings.forEach(([field, expected]) => {
      if (target[field] !== expected) {
        addEqualityError(errors, `target.${field}`, 'target_bundle_mismatch', 'target must match its resolved asset evidence bundle');
      }
    });
  }

  if (isRecord(governance?.revision)) {
    const snapshotBindings = [
      ['contentItemId', target.contentItemId],
      ['revisionId', target.contentRevisionId],
      ['sha256', target.revisionSha256],
      ['assetSetSha256', target.assetSetSha256]
    ];
    snapshotBindings.forEach(([field, expected]) => {
      if (governance.revision[field] !== expected) {
        addEqualityError(errors, `governanceSnapshot.revision.${field}`, 'governance_snapshot_target_mismatch', 'governance snapshot revision must match the resolved target');
      }
    });
  }

  if (isRecord(entitlement)) {
    const entitlementBindings = [
      ['packageId', target.packageId],
      ['contentItemId', target.contentItemId],
      ['contentRevisionId', target.contentRevisionId],
      ['revisionSha256', target.revisionSha256],
      ['assetSetSha256', target.assetSetSha256]
    ];
    entitlementBindings.forEach(([field, expected]) => {
      if (entitlement[field] !== expected) {
        addEqualityError(errors, `entitlementSnapshot.${field}`, 'entitlement_target_mismatch', 'learner entitlement must match the resolved package target');
      }
    });
  }

  if (isRecord(byteEvidence)) {
    const byteBindings = [
      ['bundleId', target.assetEvidenceBundleId],
      ['assetId', target.assetId],
      ['revisionId', target.assetRevisionId],
      ['byteSha256', target.byteSha256],
      ['mediaType', target.mediaType],
      ['deliveryProfile', target.deliveryProfile]
    ];
    byteBindings.forEach(([field, expected]) => {
      if (byteEvidence[field] !== expected) {
        addEqualityError(errors, `byteIntegrityEvidence.${field}`, 'byte_integrity_target_mismatch', 'byte integrity evidence must match the resolved target');
      }
    });
  }
}

function validatePublicationSnapshot(governance, records, context, errors) {
  if (!isRecord(governance) || !Array.isArray(records?.publicationDecisionHistory)) return null;
  const manifestPublicationDecisionId = records?.manifest?.content?.publicationDecisionId;
  const effectiveDecisions = records.publicationDecisionHistory.filter(decision =>
    decision?.decisionId === manifestPublicationDecisionId
  );
  if (
    effectiveDecisions.length !== 1 ||
    governance.effectivePublicationDecisionId !== effectiveDecisions[0].decisionId ||
    governance.effectivePublicationSequence !== effectiveDecisions[0].decisionSequence
  ) {
    addError(
      errors,
      'governanceSnapshot',
      'governance_snapshot_not_effective',
      'governance snapshot must identify the effective publication decision for the resolved package'
    );
    return null;
  }
  const matchingDecisions = records.publicationDecisionHistory.filter(decision =>
    decision?.decisionId === governance.effectivePublicationDecisionId &&
    decision?.decisionSequence === governance.effectivePublicationSequence
  );
  if (matchingDecisions.length !== 1) {
    addError(errors, 'governanceSnapshot', 'governance_publication_decision_mismatch', 'governance snapshot must bind one resolved effective publication decision');
    return null;
  }
  const decision = matchingDecisions[0];
  if (decision.outcome !== governance.outcome) {
    addError(errors, 'governanceSnapshot.outcome', 'governance_publication_outcome_mismatch', 'governance snapshot outcome must match the effective publication decision');
  }
  if (isUtcTimestamp(governance.capturedAt) && isUtcTimestamp(decision.decidedAt) && Date.parse(governance.capturedAt) < Date.parse(decision.decidedAt)) {
    addError(errors, 'governanceSnapshot.capturedAt', 'governance_snapshot_before_publication', 'governance snapshot must be captured after its effective publication decision');
  }
  if (isUtcTimestamp(context?.observedAt) && isUtcTimestamp(decision.decidedAt) && Date.parse(context.observedAt) < Date.parse(decision.decidedAt)) {
    addError(errors, 'resolverContext.observedAt', 'observation_before_publication', 'resolver observation must be at or after the effective publication decision');
  }
  return decision;
}

function appendGovernanceErrors(errors, result) {
  result.errors.forEach(error => {
    addError(errors, `serverResolvedRecords.${error.path}`, 'governance_eligibility_blocked', error.message);
  });
}

function projectTarget(target) {
  return {
    packageId: target.packageId,
    contentItemId: target.contentItemId,
    contentRevisionId: target.contentRevisionId,
    revisionSha256: target.revisionSha256,
    assetSetSha256: target.assetSetSha256,
    assetEvidenceBundleId: target.assetEvidenceBundleId,
    assetId: target.assetId,
    assetRevisionId: target.assetRevisionId,
    byteSha256: target.byteSha256,
    mediaType: target.mediaType,
    deliveryProfile: target.deliveryProfile
  };
}

/**
 * Evaluate only an internal resolver handoff precondition. A true result is
 * not authentication, an HTTP response, file delivery, SVG sanitization, or
 * an append-only audit write. The caller must separately use its private byte
 * copy and persist the audit intent before any real handoff.
 */
export function evaluateAuthorizedStudentAssetResolution(request) {
  if (!isRecord(request)) {
    return blocked([{ path: 'request', code: 'resolver_request_invalid', message: 'a resolver request object is required' }]);
  }

  const errors = [];
  rejectUnsupportedFields(request, ROOT_FIELDS, '', errors);
  const {
    resolverContext,
    target,
    authorizationSnapshot,
    entitlementSnapshot,
    governanceSnapshot,
    byteIntegrityEvidence,
    accessRequest,
    serverResolvedRecords
  } = request;

  validateResolverContext(resolverContext, errors);
  validateTarget(target, errors);
  validateAuthorizationSnapshot(authorizationSnapshot, errors);
  validateEntitlementSnapshot(entitlementSnapshot, errors);
  validateGovernanceSnapshot(governanceSnapshot, errors);
  validateByteIntegrityEvidence(byteIntegrityEvidence, errors);
  validateAccessRequest(accessRequest, errors);
  validateServerResolvedRecords(serverResolvedRecords, errors);
  validateSnapshotIntegrity(authorizationSnapshot, entitlementSnapshot, governanceSnapshot, serverResolvedRecords, errors);
  validateTimeOrdering(resolverContext, authorizationSnapshot, entitlementSnapshot, governanceSnapshot, byteIntegrityEvidence, errors);
  validateContextBinding(resolverContext, authorizationSnapshot, entitlementSnapshot, target, accessRequest, errors);

  if (errors.length > 0) return blocked(errors);

  const accessDecision = evaluateK12Access(accessRequest);
  if (!accessDecision.allowed) {
    return blocked([{
      path: 'accessRequest',
      code: 'access_denied',
      message: 'the policy kernel did not permit this student asset read'
    }]);
  }

  const governanceResult = evaluateGovernedStudentDeliveryEligibility({
    ...serverResolvedRecords,
    assetEvidenceAsOf: resolverContext.observedAt
  });
  if (!governanceResult.eligible) {
    const governanceErrors = [];
    appendGovernanceErrors(governanceErrors, governanceResult);
    return blocked(governanceErrors);
  }

  validateTargetBindings(target, serverResolvedRecords, entitlementSnapshot, governanceSnapshot, byteIntegrityEvidence, errors);
  const publicationDecision = validatePublicationSnapshot(governanceSnapshot, serverResolvedRecords, resolverContext, errors);
  if (errors.length > 0 || !publicationDecision) return blocked(errors);

  return {
    handoffEligible: true,
    nextState: 'handoff_eligible',
    errors: [],
    auditIntent: {
      eventType: 'student_asset_handoff_eligible',
      invocationId: resolverContext.invocationId,
      observedAt: resolverContext.observedAt,
      tenantId: resolverContext.tenantId,
      actorPseudonym: resolverContext.actorPseudonym,
      purpose: resolverContext.purpose,
      target: projectTarget(target),
      targetSha256: calculateStudentAssetTargetSha256(target),
      authorizationDecisionId: authorizationSnapshot.decisionId,
      authorizationDecisionSha256: authorizationSnapshot.decisionSha256,
      authorizationPolicyVersion: authorizationSnapshot.policyVersion,
      entitlementId: entitlementSnapshot.entitlementId,
      entitlementSha256: entitlementSnapshot.entitlementSha256,
      entitlementPolicyVersion: entitlementSnapshot.entitlementPolicyVersion,
      governanceSnapshotId: governanceSnapshot.snapshotId,
      governanceSnapshotSha256: governanceSnapshot.snapshotSha256,
      governanceSnapshotSequence: governanceSnapshot.snapshotSequence,
      publicationDecisionId: publicationDecision.decisionId,
      byteSnapshotId: byteIntegrityEvidence.byteSnapshotId,
      timeSourceId: resolverContext.timeSourceId,
      outcome: 'handoff_eligible'
    }
  };
}
