import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const CONTRACT_MODULE_URL = new URL('../packages/contracts/learning_event.mjs', import.meta.url);

async function loadContract() {
  // Break caught: a mobile sync payload can bypass pseudonymous event rules.
  assert.equal(
    fs.existsSync(CONTRACT_MODULE_URL),
    true,
    'learning events require a pseudonymous-data contract validator'
  );
  return import(CONTRACT_MODULE_URL.href);
}

function validLearningEvent(overrides = {}) {
  return {
    contractVersion: '1.0.0',
    eventId: 'evt_01hxy7mce90f3krz7n4w9b6q7v',
    learnerPseudonym: 'learner_01hxy7mce90f3krz7n4w9b6q7v',
    contentPackageId: 'CP-G1-TR-001',
    contentRevisionId: 'REV-G1-TR-001',
    eventType: 'activity_completed',
    occurredAt: '2026-10-03T00:00:00.000Z',
    deviceSync: {
      eventSequence: 12,
      mode: 'offline_pending'
    },
    dataGovernance: {
      owner: 'learning-data-owner',
      steward: 'learning-data-steward',
      classification: 'pseudonymized-learning-event',
      processingPurpose: 'learning-progress-sync',
      retentionClass: 'learner-progress'
    },
    ...overrides
  };
}

test('accepts a pseudonymous offline learning event with versioned content and governance metadata', async () => {
  const { validatePseudonymousLearningEvent } = await loadContract();

  const result = validatePseudonymousLearningEvent(validLearningEvent());

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects direct identity and free-response fields from a mobile learning event', async () => {
  const { validatePseudonymousLearningEvent } = await loadContract();
  const event = validLearningEvent({
    email: 'child@example.test',
    response: {
      rawAnswerText: 'Öğrencinin serbest metin cevabı'
    }
  });

  const result = validatePseudonymousLearningEvent(event);

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.map(error => error.code),
    ['forbidden_learning_event_field', 'forbidden_learning_event_field']
  );
  assert.deepEqual(
    result.errors.map(error => error.path),
    ['email', 'response.rawAnswerText']
  );
});

test('rejects an event whose learner key is an email or whose offline sequence is invalid', async () => {
  const { validatePseudonymousLearningEvent } = await loadContract();
  const event = validLearningEvent({
    learnerPseudonym: 'child@example.test',
    deviceSync: {
      eventSequence: 0,
      mode: 'unknown'
    }
  });

  const result = validatePseudonymousLearningEvent(event);

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.map(error => error.code),
    [
      'learner_pseudonym_invalid',
      'device_event_sequence_invalid',
      'device_sync_mode_invalid'
    ]
  );
});
