/**
 * Narrow, fail-closed access-policy kernel for the future K-12 API.
 *
 * This is not authentication or a complete RBAC implementation. It expresses
 * only the decisions that have tests below; every other request is denied.
 */

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deny(reason) {
  return { allowed: false, reason };
}

function allow(reason) {
  return { allowed: true, reason };
}

function hasRelatedLearner(actor, learnerId) {
  return Array.isArray(actor.relatedLearnerIds) && actor.relatedLearnerIds.includes(learnerId);
}

function hasAssignedClassGroup(actor, classGroupId) {
  return Array.isArray(actor.assignedClassGroupIds) && actor.assignedClassGroupIds.includes(classGroupId);
}

/**
 * Decide a request without looking up or persisting any student record.
 */
export function evaluateK12Access(request) {
  if (!isRecord(request) || !isRecord(request.actor) || !isRecord(request.resource)) {
    return deny('invalid_request');
  }

  const { actor, resource, action } = request;
  if (typeof actor.tenantId !== 'string' || typeof resource.tenantId !== 'string') {
    return deny('tenant_required');
  }
  if (actor.tenantId !== resource.tenantId) {
    return deny('tenant_mismatch');
  }

  if (actor.role === 'guardian') {
    if (action === 'read' && resource.type === 'learner_progress_summary') {
      return hasRelatedLearner(actor, resource.learnerId)
        ? allow('guardian_relationship')
        : deny('relationship_required');
    }
    return deny('role_action_not_allowed');
  }

  if (actor.role === 'student') {
    if (action === 'read' && resource.type === 'learner_progress_summary') {
      return actor.subjectId === resource.learnerId
        ? allow('learner_self_access')
        : deny('subject_mismatch');
    }
    return deny('role_action_not_allowed');
  }

  if (actor.role === 'teacher') {
    if (action === 'read' && resource.type === 'learner_progress_summary') {
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
