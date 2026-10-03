import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const REVIEW_DECISION_MODULE_URL = new URL('../packages/contracts/content_review_decision.mjs', import.meta.url);

async function loadReviewDecisionContract() {
  // Break caught: a release gate could rely on an unverifiable, role-less
  // boolean instead of a traceable human review decision bound to a revision.
  assert.equal(
    fs.existsSync(REVIEW_DECISION_MODULE_URL),
    true,
    'content review decisions require a governed contract'
  );
  return import(REVIEW_DECISION_MODULE_URL.href);
}

function approvedAcademicDecision(overrides = {}) {
  return {
    contractVersion: '2.0.0',
    decisionId: 'DEC-ACADEMIC-001',
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: 'c'.repeat(64)
    },
    contentAuthorId: 'content-editor-001',
    discipline: 'academic',
    outcome: 'approved',
    decidedAt: '2026-10-03T01:00:00.000Z',
    reviewPolicyVersion: 'content-review-v1',
    rationale: 'Kazanım, yaş düzeyi ve yönerge açıklığı uzman incelemesinden geçti.',
    reviewer: {
      reviewerId: 'academic-reviewer-001',
      role: 'academic_reviewer'
    },
    evidenceRefs: [
      {
        evidenceId: 'EVID-ACADEMIC-001',
        evidenceKind: 'curriculum_registry_entry',
        sha256: 'b'.repeat(64)
      }
    ],
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-data-steward',
      classification: 'governance-record',
      processingPurpose: 'content-review-traceability',
      retentionClass: 'content-lifecycle'
    },
    ...overrides
  };
}

test('accepts a v2 independently reviewed academic decision bound to a revision and asset-evidence-set hash', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();

  const result = validateContentReviewDecision(approvedAcademicDecision());

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects an automated result presented as an approved academic human review', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({
    reviewer: {
      reviewerId: 'model-clef-flash',
      role: 'automated_system'
    }
  });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'reviewer.role',
        code: 'reviewer_role_invalid',
        message: 'academic review requires reviewer role academic_reviewer'
      }
    ]
  });
});

test('rejects a decision when the content author attempts to review their own revision', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({
    reviewer: {
      reviewerId: 'content-editor-001',
      role: 'academic_reviewer'
    }
  });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'reviewer.reviewerId',
        code: 'author_review_conflict',
        message: 'the content author cannot review the same revision'
      }
    ]
  });
});

test('rejects a decision without durable evidence even when all other review fields are present', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({ evidenceRefs: [] });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'evidenceRefs',
        code: 'evidence_missing',
        message: 'at least one review evidence record is required'
      }
    ]
  });
});

test('rejects an academic decision whose evidence is not a curriculum registry record', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({
    evidenceRefs: [
      {
        evidenceId: 'EVID-WRONG-001',
        evidenceKind: 'rights_record',
        sha256: 'b'.repeat(64)
      }
    ]
  });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'evidenceRefs',
        code: 'required_evidence_kind_missing',
        message: 'academic review requires evidence kind curriculum_registry_entry'
      }
    ]
  });
});

test('rejects a decision with an invalid revision hash', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'not-a-hash',
      assetSetSha256: 'c'.repeat(64)
    }
  });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'reviewedRevision.sha256',
        code: 'revision_sha256_invalid',
        message: 'a SHA-256 revision hash is required'
      }
    ]
  });
});

test('rejects a retired v1 review decision that lacks an immutable asset-evidence-set binding', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({
    contractVersion: '1.0.0',
    reviewedRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64)
    }
  });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'contractVersion',
        code: 'contract_version_unsupported',
        message: 'expected contract version 2.0.0'
      },
      {
        path: 'reviewedRevision.assetSetSha256',
        code: 'asset_set_sha256_invalid',
        message: 'an asset-evidence set SHA-256 hash is required'
      }
    ]
  });
});

test('rejects a calendar-normalized or non-UTC review timestamp', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({
    decidedAt: '2026-02-30T01:00:00.000Z'
  });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'decidedAt',
        code: 'decided_at_invalid',
        message: 'a valid decision timestamp is required'
      }
    ]
  });
});

test('rejects answer-bearing fields from a governance decision record', async () => {
  const { validateContentReviewDecision } = await loadReviewDecisionContract();
  const decision = approvedAcademicDecision({
    answerKey: 'A'
  });

  const result = validateContentReviewDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'answerKey',
        code: 'forbidden_review_field',
        message: 'answerKey cannot be included in a content review decision'
      }
    ]
  });
});
