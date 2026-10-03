import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const REGISTRY_MODULE_URL = new URL('../packages/reference-data/curriculum_registry.mjs', import.meta.url);

async function loadRegistry() {
  // Break caught: a source-less local list could be promoted as a canonical
  // curriculum authority for student content.
  assert.equal(
    fs.existsSync(REGISTRY_MODULE_URL),
    true,
    'curriculum records require a versioned source-and-review registry'
  );
  return import(REGISTRY_MODULE_URL.href);
}

function canonicalEntry(overrides = {}) {
  return {
    contractVersion: '1.0.0',
    registryEntryId: 'CURR-G1-TR-001',
    programVersion: 'FIXTURE-PROGRAM-2026-V1',
    grade: 1,
    courseKey: 'turkce',
    outcomeCode: 'FIXTURE.1.1',
    verificationState: 'canonical_verified',
    sourceDocument: {
      sourceId: 'SRC-FIXTURE-001',
      sourceUrl: 'https://publisher.example.test/program.pdf',
      retrievedAt: '2026-10-03T00:00:00.000Z',
      sha256: 'b'.repeat(64)
    },
    canonicalReview: {
      reviewId: 'CURR-REVIEW-001',
      reviewerId: 'curriculum-steward-001',
      reviewedAt: '2026-10-03T01:00:00.000Z'
    },
    ...overrides
  };
}

test('accepts a canonical curriculum entry only with versioned source provenance and human review evidence', async () => {
  const { validateCurriculumRegistryEntry } = await loadRegistry();

  const result = validateCurriculumRegistryEntry(canonicalEntry());

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects a record labelled canonical_verified when human canonical-review evidence is absent', async () => {
  const { validateCurriculumRegistryEntry } = await loadRegistry();
  const entry = canonicalEntry({ canonicalReview: undefined });

  const result = validateCurriculumRegistryEntry(entry);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'canonicalReview',
        code: 'canonical_review_missing',
        message: 'canonical verification requires human review evidence'
      }
    ]
  });
});

test('rejects a canonical record that has no stable registry entry identifier', async () => {
  const { validateCurriculumRegistryEntry } = await loadRegistry();
  const entry = canonicalEntry({ registryEntryId: '' });

  const result = validateCurriculumRegistryEntry(entry);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'registryEntryId',
        code: 'registry_entry_id_missing',
        message: 'a stable curriculum registry entry identifier is required'
      }
    ]
  });
});

test('resolves an outcome only from a matching canonically verified program record', async () => {
  const { findCanonicalCurriculumOutcome } = await loadRegistry();
  const entry = canonicalEntry();
  const unverifiedImport = canonicalEntry({
    sourceDocument: {
      sourceId: 'SRC-IMPORT-001',
      sourceUrl: 'https://import.example.test/catalog.json',
      retrievedAt: '2026-10-03T00:00:00.000Z',
      sha256: 'c'.repeat(64)
    },
    canonicalReview: undefined,
    verificationState: 'unverified_import'
  });

  const result = findCanonicalCurriculumOutcome(
    [unverifiedImport, entry],
    {
      registryEntryId: 'CURR-G1-TR-001',
      programVersion: 'FIXTURE-PROGRAM-2026-V1',
      grade: 1,
      courseKey: 'turkce',
      outcomeCode: 'FIXTURE.1.1'
    }
  );

  assert.deepEqual(result, entry);
});

test('does not resolve a same-scope record when the stable registry entry identifier differs', async () => {
  const { findCanonicalCurriculumOutcome } = await loadRegistry();

  const result = findCanonicalCurriculumOutcome(
    [canonicalEntry()],
    {
      registryEntryId: 'CURR-G1-TR-OTHER',
      programVersion: 'FIXTURE-PROGRAM-2026-V1',
      grade: 1,
      courseKey: 'turkce',
      outcomeCode: 'FIXTURE.1.1'
    }
  );

  assert.equal(result, null);
});
