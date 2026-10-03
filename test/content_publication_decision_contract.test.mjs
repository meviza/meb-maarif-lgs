import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const PUBLICATION_DECISION_MODULE_URL = new URL('../packages/contracts/content_publication_decision.mjs', import.meta.url);

async function loadPublicationDecisionContract() {
  // Break caught: a manifest can self-declare "published" without an
  // independent, traceable human publication decision.
  assert.equal(
    fs.existsSync(PUBLICATION_DECISION_MODULE_URL),
    true,
    'student delivery requires a governed human publication-decision contract'
  );
  return import(PUBLICATION_DECISION_MODULE_URL.href);
}

function publicationDecision(overrides = {}) {
  return {
    contractVersion: '3.0.0',
    decisionId: 'PUB-G1-TR-001',
    targetRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64),
      assetSetSha256: 'c'.repeat(64)
    },
    contentAuthorId: 'content-editor-001',
    outcome: 'published',
    decisionSequence: 1,
    decidedAt: '2026-10-03T02:00:00.000Z',
    publicationPolicyVersion: 'content-publication-v1',
    rationale: 'Dört insan incelemesi, geri alma planı ve teslim kapsamı doğrulandı.',
    publisher: {
      publisherId: 'publisher-001',
      role: 'content_publisher'
    },
    releaseRequestId: 'REL-G1-TR-001',
    rollbackPlanId: 'ROLLBACK-G1-TR-001',
    reviewDecisionIds: {
      academic: 'DEC-ACADEMIC-001',
      assessment: 'DEC-ASSESSMENT-001',
      rights: 'DEC-RIGHTS-001',
      accessibility: 'DEC-ACCESSIBILITY-001'
    },
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-data-steward',
      classification: 'governance-record',
      processingPurpose: 'content-publication-traceability',
      retentionClass: 'content-lifecycle'
    },
    ...overrides
  };
}

test('accepts a v3 independent human publication decision bound to a revision, asset-evidence set, and all four review decisions', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();

  const result = validateContentPublicationDecision(publicationDecision());

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects the retired v2 publication-decision contract', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();

  const result = validateContentPublicationDecision(publicationDecision({ contractVersion: '2.0.0' }));

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'contractVersion',
        code: 'contract_version_unsupported',
        message: 'expected contract version 3.0.0'
      }
    ]
  });
});

test('rejects a publication decision without a positive decision sequence for effective-history resolution', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();
  const decision = publicationDecision({
    decisionSequence: 0
  });

  const result = validateContentPublicationDecision(decision);

  assert.equal(result.valid, false);
  assert.equal(
    result.errors.some(error => error.code === 'publication_sequence_invalid'),
    true
  );
});

test('rejects a publication decision whose target revision lacks an immutable asset-evidence-set hash', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();
  const decision = publicationDecision({
    targetRevision: {
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      sha256: 'a'.repeat(64)
    }
  });

  const result = validateContentPublicationDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'targetRevision.assetSetSha256',
        code: 'asset_set_sha256_invalid',
        message: 'an asset-evidence set SHA-256 hash is required'
      }
    ]
  });
});

test('rejects a calendar-normalized or non-UTC publication timestamp', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();
  const decision = publicationDecision({
    decidedAt: '2026-02-30T02:00:00.000Z'
  });

  const result = validateContentPublicationDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'decidedAt',
        code: 'decided_at_invalid',
        message: 'a valid publication decision timestamp is required'
      }
    ]
  });
});

test('rejects a publication decision when the content author acts as publisher', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();
  const decision = publicationDecision({
    publisher: {
      publisherId: 'content-editor-001',
      role: 'content_publisher'
    }
  });

  const result = validateContentPublicationDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'publisher.publisherId',
        code: 'author_publication_conflict',
        message: 'the content author cannot publish the same revision'
      }
    ]
  });
});

test('rejects a publication decision that omits a required review-decision binding', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();
  const decision = publicationDecision({
    reviewDecisionIds: {
      academic: 'DEC-ACADEMIC-001',
      assessment: 'DEC-ASSESSMENT-001',
      rights: 'DEC-RIGHTS-001'
    }
  });

  const result = validateContentPublicationDecision(decision);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'reviewDecisionIds.accessibility',
        code: 'review_decision_id_missing',
        message: 'an accessibility review decision identifier is required'
      }
    ]
  });
});

test('rejects answer-bearing fields from a publication governance record', async () => {
  const { validateContentPublicationDecision } = await loadPublicationDecisionContract();

  const result = validateContentPublicationDecision(publicationDecision({ answerKey: 'A' }));

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'answerKey',
        code: 'forbidden_publication_field',
        message: 'answerKey cannot be included in a content publication decision'
      }
    ]
  });
});
