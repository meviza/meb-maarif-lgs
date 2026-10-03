import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const POLICY_MODULE_URL = new URL('../packages/contracts/access_policy.mjs', import.meta.url);

async function loadPolicy() {
  // Break caught: a future role handler falls open across tenants or roles.
  assert.equal(
    fs.existsSync(POLICY_MODULE_URL),
    true,
    'role-based K-12 access requires a fail-closed policy module'
  );
  return import(POLICY_MODULE_URL.href);
}

function request(overrides = {}) {
  return {
    actor: {
      role: 'guardian',
      subjectId: 'guardian_001',
      tenantId: 'school_ankara_001',
      relatedLearnerIds: ['learner_001']
    },
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_001'
    },
    action: 'read',
    ...overrides
  };
}

test('denies every request that crosses a school tenant boundary', async () => {
  const { evaluateK12Access } = await loadPolicy();

  const decision = evaluateK12Access(request({
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_002',
      learnerId: 'learner_001'
    }
  }));

  assert.deepEqual(decision, { allowed: false, reason: 'tenant_mismatch' });
});

test('denies blank tenant identifiers before applying a role rule', async () => {
  const { evaluateK12Access } = await loadPolicy();

  const decision = evaluateK12Access(request({
    actor: {
      role: 'guardian',
      subjectId: 'guardian_001',
      tenantId: ' ',
      relatedLearnerIds: ['learner_001']
    },
    resource: {
      type: 'learner_progress_summary',
      tenantId: ' ',
      learnerId: 'learner_001'
    }
  }));

  assert.deepEqual(decision, { allowed: false, reason: 'tenant_required' });
});

test('allows a guardian to read only a linked learner progress summary', async () => {
  const { evaluateK12Access } = await loadPolicy();

  const ownLearner = evaluateK12Access(request());
  const unrelatedLearner = evaluateK12Access(request({
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_999'
    }
  }));

  assert.deepEqual(ownLearner, { allowed: true, reason: 'guardian_relationship' });
  assert.deepEqual(unrelatedLearner, { allowed: false, reason: 'relationship_required' });
});

test('denies a guardian summary request with no learner scope even if malformed claims include undefined', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const decision = evaluateK12Access(request({
    actor: {
      role: 'guardian',
      subjectId: 'guardian_001',
      tenantId: 'school_ankara_001',
      relatedLearnerIds: [undefined]
    },
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001'
    }
  }));

  assert.deepEqual(decision, { allowed: false, reason: 'learner_required' });
});

test('permits an editor to revise a draft but never to publish it', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const editor = {
    role: 'content_editor',
    subjectId: 'editor_001',
    tenantId: 'school_ankara_001'
  };
  const resource = {
    type: 'content_revision',
    tenantId: 'school_ankara_001',
    lifecycleState: 'draft'
  };

  const editDecision = evaluateK12Access({ actor: editor, resource, action: 'edit' });
  const publishDecision = evaluateK12Access({ actor: editor, resource, action: 'publish' });

  assert.deepEqual(editDecision, { allowed: true, reason: 'content_draft_edit' });
  assert.deepEqual(publishDecision, { allowed: false, reason: 'separation_of_duties' });
});

test('allows a student to read only their own learning summary', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const actor = {
    role: 'student',
    subjectId: 'learner_001',
    tenantId: 'school_ankara_001'
  };

  const ownSummary = evaluateK12Access({
    actor,
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_001'
    },
    action: 'read'
  });
  const anotherSummary = evaluateK12Access({
    actor,
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_002'
    },
    action: 'read'
  });

  assert.deepEqual(ownSummary, { allowed: true, reason: 'learner_self_access' });
  assert.deepEqual(anotherSummary, { allowed: false, reason: 'subject_mismatch' });
});

test('allows a student to read only their own resolved content asset', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const actor = {
    role: 'student',
    subjectId: 'learner_001',
    tenantId: 'school_ankara_001'
  };

  const ownAsset = evaluateK12Access({
    actor,
    resource: {
      type: 'student_content_asset',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_001',
      packageId: 'package_001'
    },
    action: 'read'
  });
  const anotherLearnerAsset = evaluateK12Access({
    actor,
    resource: {
      type: 'student_content_asset',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_002',
      packageId: 'package_001'
    },
    action: 'read'
  });
  const missingPackageScope = evaluateK12Access({
    actor,
    resource: {
      type: 'student_content_asset',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_001'
    },
    action: 'read'
  });

  assert.deepEqual(ownAsset, { allowed: true, reason: 'learner_content_asset_access' });
  assert.deepEqual(anotherLearnerAsset, { allowed: false, reason: 'subject_mismatch' });
  assert.deepEqual(missingPackageScope, { allowed: false, reason: 'package_required' });
});

test('denies a student summary request when either learner subject identifier is absent', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const actor = {
    role: 'student',
    tenantId: 'school_ankara_001'
  };

  const decision = evaluateK12Access({
    actor,
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001'
    },
    action: 'read'
  });

  assert.deepEqual(decision, { allowed: false, reason: 'subject_required' });
});

test('allows a teacher to read progress only for an assigned class group', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const actor = {
    role: 'teacher',
    subjectId: 'teacher_001',
    tenantId: 'school_ankara_001',
    assignedClassGroupIds: ['class_5a']
  };

  const assignedClass = evaluateK12Access({
    actor,
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_001',
      classGroupId: 'class_5a'
    },
    action: 'read'
  });
  const unassignedClass = evaluateK12Access({
    actor,
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_002',
      classGroupId: 'class_5b'
    },
    action: 'read'
  });

  assert.deepEqual(assignedClass, { allowed: true, reason: 'teacher_class_assignment' });
  assert.deepEqual(unassignedClass, { allowed: false, reason: 'class_assignment_required' });
});

test('denies a teacher summary request with no class-group scope even if malformed claims include undefined', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const decision = evaluateK12Access({
    actor: {
      role: 'teacher',
      subjectId: 'teacher_001',
      tenantId: 'school_ankara_001',
      assignedClassGroupIds: [undefined]
    },
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_001'
    },
    action: 'read'
  });

  assert.deepEqual(decision, { allowed: false, reason: 'class_group_required' });
});

test('allows a school administrator to read aggregate school data but not a learner record', async () => {
  const { evaluateK12Access } = await loadPolicy();
  const actor = {
    role: 'school_admin',
    subjectId: 'admin_001',
    tenantId: 'school_ankara_001'
  };

  const aggregate = evaluateK12Access({
    actor,
    resource: {
      type: 'school_aggregate',
      tenantId: 'school_ankara_001'
    },
    action: 'read'
  });
  const learnerRecord = evaluateK12Access({
    actor,
    resource: {
      type: 'learner_progress_summary',
      tenantId: 'school_ankara_001',
      learnerId: 'learner_001'
    },
    action: 'read'
  });

  assert.deepEqual(aggregate, { allowed: true, reason: 'school_aggregate_access' });
  assert.deepEqual(learnerRecord, { allowed: false, reason: 'role_action_not_allowed' });
});
