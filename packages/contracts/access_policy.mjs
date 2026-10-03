/**
 * Narrow, fail-closed access-policy kernel for the future K-12 API.
 *
 * This is not authentication or a complete RBAC implementation. It expresses
 * only the decisions that have tests below; every other request is denied.
 * Its caller must first deserialize HTTP/database input into trusted data
 * records. JavaScript cannot reliably distinguish a fully transparent
 * in-process Proxy from a real own-data object, so arbitrary objects are not
 * an authorization boundary.
 */

const arrayIsArray = Array.isArray;
const objectCreate = Object.create;
const objectDefineProperty = Object.defineProperty;
const objectFreeze = Object.freeze;
const objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const objectGetPrototypeOf = Object.getPrototypeOf;
const objectHasOwn = Object.hasOwn;
const objectPrototype = Object.prototype;
const reflectOwnKeys = Reflect.ownKeys;
const MAX_AUTHORIZATION_LIST_ENTRIES = 1000;

function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || arrayIsArray(value)) return false;
  try {
    const prototype = objectGetPrototypeOf(value);
    return prototype === objectPrototype || prototype === null;
  } catch {
    return false;
  }
}

function setOwnValue(target, field, value) {
  objectDefineProperty(target, field, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

function snapshotOwnDataRecord(value) {
  if (!isPlainRecord(value)) return null;
  const snapshot = objectCreate(null);
  const fields = reflectOwnKeys(value);
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (typeof field !== 'string') return null;
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !objectHasOwn(descriptor, 'value')) return null;
    setOwnValue(snapshot, field, descriptor.value);
  }
  return snapshot;
}

function snapshotDenseDataArray(value, maximumLength = MAX_AUTHORIZATION_LIST_ENTRIES) {
  if (!arrayIsArray(value)) return null;
  const lengthDescriptor = objectGetOwnPropertyDescriptor(value, 'length');
  if (!lengthDescriptor || !objectHasOwn(lengthDescriptor, 'value') || !Number.isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
    return null;
  }
  const length = lengthDescriptor.value;
  if (length > maximumLength) return null;
  const fields = reflectOwnKeys(value);
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    if (field === 'length') continue;
    if (typeof field !== 'string' || !/^(?:0|[1-9]\d*)$/u.test(field) || Number(field) >= length) return null;
    const descriptor = objectGetOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !objectHasOwn(descriptor, 'value')) return null;
  }
  const snapshot = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = objectGetOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !objectHasOwn(descriptor, 'value')) return null;
    objectDefineProperty(snapshot, String(index), {
      configurable: false,
      enumerable: true,
      value: descriptor.value,
      writable: false
    });
  }
  return objectFreeze(snapshot);
}

function snapshotAccessRequest(value) {
  const request = snapshotOwnDataRecord(value);
  if (!request) return null;
  const actor = snapshotOwnDataRecord(request.actor);
  const resource = snapshotOwnDataRecord(request.resource);
  if (!actor || !resource) return null;

  ['relatedLearnerIds', 'assignedClassGroupIds'].forEach(field => {
    if (arrayIsArray(actor[field])) {
      const list = snapshotDenseDataArray(actor[field]);
      if (!list) {
        setOwnValue(actor, field, null);
        return;
      }
      setOwnValue(actor, field, list);
    }
  });
  setOwnValue(request, 'actor', objectFreeze(actor));
  setOwnValue(request, 'resource', objectFreeze(resource));
  return objectFreeze(request);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function deny(reason) {
  return { allowed: false, reason };
}

function allow(reason) {
  return { allowed: true, reason };
}

function hasRelatedLearner(actor, learnerId) {
  return includesValue(actor.relatedLearnerIds, learnerId);
}

function hasAssignedClassGroup(actor, classGroupId) {
  return includesValue(actor.assignedClassGroupIds, classGroupId);
}

function includesValue(list, value) {
  if (!arrayIsArray(list)) return false;
  for (let index = 0; index < list.length; index += 1) {
    if (list[index] === value) return true;
  }
  return false;
}

/**
 * Decide a request without looking up or persisting any student record.
 */
export function evaluateK12Access(request) {
  let resolvedRequest;
  try {
    resolvedRequest = snapshotAccessRequest(request);
  } catch {
    return deny('invalid_request');
  }
  if (!resolvedRequest) {
    return deny('invalid_request');
  }

  const { actor, resource, action } = resolvedRequest;
  if (!isNonEmptyString(actor.tenantId) || !isNonEmptyString(resource.tenantId)) {
    return deny('tenant_required');
  }
  if (actor.tenantId !== resource.tenantId) {
    return deny('tenant_mismatch');
  }
  if (!isNonEmptyString(actor.subjectId)) {
    return deny('subject_required');
  }

  if (actor.role === 'guardian') {
    if (action === 'read' && resource.type === 'learner_progress_summary') {
      if (!isNonEmptyString(resource.learnerId)) {
        return deny('learner_required');
      }
      return hasRelatedLearner(actor, resource.learnerId)
        ? allow('guardian_relationship')
        : deny('relationship_required');
    }
    return deny('role_action_not_allowed');
  }

  if (actor.role === 'student') {
    if (action === 'read' && resource.type === 'learner_progress_summary') {
      if (!isNonEmptyString(actor.subjectId) || !isNonEmptyString(resource.learnerId)) {
        return deny('subject_required');
      }
      return actor.subjectId === resource.learnerId
        ? allow('learner_self_access')
        : deny('subject_mismatch');
    }
    if (action === 'read' && resource.type === 'student_content_asset') {
      if (!isNonEmptyString(actor.subjectId) || !isNonEmptyString(resource.learnerId)) {
        return deny('subject_required');
      }
      if (!isNonEmptyString(resource.packageId)) {
        return deny('package_required');
      }
      return actor.subjectId === resource.learnerId
        ? allow('learner_content_asset_access')
        : deny('subject_mismatch');
    }
    if (action === 'append_learning_event_batch' && resource.type === 'learner_learning_event_stream') {
      if (!isNonEmptyString(actor.subjectId) || !isNonEmptyString(resource.learnerId)) {
        return deny('subject_required');
      }
      if (actor.subjectId !== resource.learnerId) {
        return deny('subject_mismatch');
      }
      if (!isNonEmptyString(resource.packageId)) {
        return deny('package_required');
      }
      if (!isNonEmptyString(resource.eventStreamId)) {
        return deny('event_stream_required');
      }
      return allow('learner_learning_event_append');
    }
    return deny('role_action_not_allowed');
  }

  if (actor.role === 'teacher') {
    if (action === 'read' && resource.type === 'learner_progress_summary') {
      if (!isNonEmptyString(resource.classGroupId)) {
        return deny('class_group_required');
      }
      return hasAssignedClassGroup(actor, resource.classGroupId)
        ? allow('teacher_class_assignment')
        : deny('class_assignment_required');
    }
    return deny('role_action_not_allowed');
  }

  if (actor.role === 'school_admin') {
    if (action === 'read' && resource.type === 'school_aggregate') {
      return allow('school_aggregate_access');
    }
    return deny('role_action_not_allowed');
  }

  if (actor.role === 'content_editor') {
    if (action === 'publish') {
      return deny('separation_of_duties');
    }
    if (
      action === 'edit' &&
      resource.type === 'content_revision' &&
      resource.lifecycleState === 'draft'
    ) {
      return allow('content_draft_edit');
    }
    return deny('role_action_not_allowed');
  }

  return deny('role_action_not_allowed');
}
