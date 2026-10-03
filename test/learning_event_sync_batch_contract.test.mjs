import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import test from 'node:test';

const CONTRACT_MODULE_URL = new URL('../packages/contracts/learning_event_sync_batch.mjs', import.meta.url);

async function loadContract() {
  // Break caught: an offline batch can reach a future sync boundary without
  // canonical event and batch hashes binding its declared content and order.
  assert.equal(
    fs.existsSync(CONTRACT_MODULE_URL),
    true,
    'offline learning-event batches require a dedicated contract validator'
  );
  return import(CONTRACT_MODULE_URL.href);
}

function validBatch() {
  return {
    contractVersion: '1.0.0',
    batchId: 'batch_000000000001',
    idempotencyKey: 'idem_000000000001',
    eventStreamId: 'stream_000000000001',
    contentTarget: {
      packageId: 'CP-G1-TR-001',
      contentItemId: 'CONTENT-G1-TR-001',
      revisionId: 'REV-G1-TR-001',
      revisionSha256: 'a'.repeat(64),
      assetSetSha256: 'b'.repeat(64),
      publicationDecisionId: 'PUB-G1-TR-001',
      curriculumRegistryEntryId: 'CURR-G1-TR-001',
      programVersion: 'TYMM-2024.1',
      outcomeCode: 'MAT.1.1.1'
    },
    events: [{
      eventId: 'evt_000000000001',
      eventSequence: 41,
      activityId: 'activity_counting_001',
      eventType: 'activity_completed',
      clientOccurredAt: '2026-10-03T00:00:00.000Z'
    }]
  };
}

test('accepts a closed privacy-minimized offline batch and derives canonical event and batch hashes from its declared content and order', async () => {
  const {
    calculateLearningEventSha256,
    calculateLearningEventBatchSha256,
    validatePseudonymousLearningSyncBatch
  } = await loadContract();
  const batch = validBatch();

  assert.equal(
    calculateLearningEventSha256(batch.events[0]),
    '9720e5f9bacf04f20463170c350c4b6f0679e8f644ecf67c8caa9b33bc314244'
  );
  assert.equal(
    calculateLearningEventBatchSha256(batch),
    'fcbe8b0de16b2471e3e44c5e2688f33b7b1eb074910d929d05b6e44e01e9151b'
  );
  const result = validatePseudonymousLearningSyncBatch(batch);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(
    { ...result.integrity },
    {
      eventSha256es: ['9720e5f9bacf04f20463170c350c4b6f0679e8f644ecf67c8caa9b33bc314244'],
      batchSha256: 'fcbe8b0de16b2471e3e44c5e2688f33b7b1eb074910d929d05b6e44e01e9151b'
    }
  );
});

test('fails closed rather than hashing an event that contains an unexpected identity field', async () => {
  const { calculateLearningEventSha256 } = await loadContract();
  const event = {
    ...validBatch().events[0],
    email: 'child@example.test'
  };

  assert.throws(
    () => calculateLearningEventSha256(event),
    {
      name: 'TypeError',
      message: 'canonical event contains an unexpected field'
    }
  );
});

test('does not echo an untrusted rejected field name into the validation result', async () => {
  const { validatePseudonymousLearningSyncBatch } = await loadContract();
  const batch = validBatch();
  batch['child@example.test'] = 'do-not-log-this';
  batch.contentTarget['guardian@example.test'] = 'do-not-log-this-either';

  const result = validatePseudonymousLearningSyncBatch(batch);
  const serialized = JSON.stringify(result);

  assert.equal(result.valid, false);
  assert.equal(result.errors.filter(error => error.code === 'unexpected_field').length, 2);
  assert.equal(serialized.includes('child@example.test'), false);
  assert.equal(serialized.includes('guardian@example.test'), false);
});

test('rejects an empty batch whose apparent fields exist only through Object.prototype pollution', () => {
  const script = `
    import { validatePseudonymousLearningSyncBatch } from ${JSON.stringify(CONTRACT_MODULE_URL.href)};
    Object.assign(Object.prototype, {
      contractVersion: '1.0.0',
      batchId: 'batch_000000000001',
      idempotencyKey: 'idem_000000000001',
      eventStreamId: 'stream_000000000001',
      contentTarget: {
        packageId: 'CP-G1-TR-001',
        contentItemId: 'CONTENT-G1-TR-001',
        revisionId: 'REV-G1-TR-001',
        revisionSha256: 'a'.repeat(64),
        assetSetSha256: 'b'.repeat(64),
        publicationDecisionId: 'PUB-G1-TR-001',
        curriculumRegistryEntryId: 'CURR-G1-TR-001',
        programVersion: 'TYMM-2024.1',
        outcomeCode: 'MAT.1.1.1'
      },
      events: [{
        eventId: 'evt_000000000001',
        eventSequence: 41,
        activityId: 'activity_counting_001',
        eventType: 'activity_completed',
        clientOccurredAt: '2026-10-03T00:00:00.000Z'
      }]
    });
    process.stdout.write(JSON.stringify(validatePseudonymousLearningSyncBatch({})));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, child.stderr);
  const result = JSON.parse(child.stdout);
  assert.equal(result.valid, false);
  assert.equal('integrity' in result, false);
});

test('does not inherit a forged integrity receipt on an invalid result', () => {
  const script = `
    import { validatePseudonymousLearningSyncBatch } from ${JSON.stringify(CONTRACT_MODULE_URL.href)};
    Object.prototype.integrity = { batchSha256: 'forged' };
    const result = validatePseudonymousLearningSyncBatch(null);
    process.stdout.write(JSON.stringify({
      valid: result.valid,
      hasOwnIntegrity: Object.hasOwn(result, 'integrity'),
      inheritedIntegrity: result.integrity
    }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), {
    valid: false,
    hasOwnIntegrity: false
  });
});

test('fails closed when Array prototype methods are polluted after the contract loads', () => {
  const script = `
    import { validatePseudonymousLearningSyncBatch } from ${JSON.stringify(CONTRACT_MODULE_URL.href)};
    const invalidBatch = {
      contractVersion: '1.0.0',
      batchId: 'batch_000000000001',
      idempotencyKey: 'idem_000000000001',
      eventStreamId: 'stream_000000000001',
      contentTarget: {
        packageId: 'CP-G1-TR-001',
        contentItemId: 'CONTENT-G1-TR-001',
        revisionId: 'REV-G1-TR-001',
        revisionSha256: 'a'.repeat(64),
        assetSetSha256: 'b'.repeat(64),
        publicationDecisionId: 'PUB-G1-TR-001',
        curriculumRegistryEntryId: 'CURR-G1-TR-001',
        programVersion: 'TYMM-2024.1',
        outcomeCode: 'MAT.1.1.1'
      },
      events: [{
        eventId: 'bad',
        eventSequence: 0,
        activityId: 'bad',
        eventType: 'bad',
        clientOccurredAt: 'not-a-date'
      }]
    };
    Array.prototype.push = () => 0;
    Array.prototype.map = () => [];
    const result = validatePseudonymousLearningSyncBatch(invalidBatch);
    process.stdout.write(JSON.stringify({ valid: result.valid, hasIntegrity: Object.hasOwn(result, 'integrity') }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), { valid: false, hasIntegrity: false });
});

test('does not lose validation errors when Object.defineProperty is replaced after the contract loads', () => {
  const script = `
    import { validatePseudonymousLearningSyncBatch } from ${JSON.stringify(CONTRACT_MODULE_URL.href)};
    const invalidBatch = {
      contractVersion: '1.0.0',
      batchId: 'batch_000000000001',
      idempotencyKey: 'idem_000000000001',
      eventStreamId: 'stream_000000000001',
      contentTarget: {
        packageId: 'CP-G1-TR-001',
        contentItemId: 'CONTENT-G1-TR-001',
        revisionId: 'REV-G1-TR-001',
        revisionSha256: 'a'.repeat(64),
        assetSetSha256: 'b'.repeat(64),
        publicationDecisionId: 'PUB-G1-TR-001',
        curriculumRegistryEntryId: 'CURR-G1-TR-001',
        programVersion: 'TYMM-2024.1',
        outcomeCode: 'MAT.1.1.1'
      },
      events: [{
        eventId: 'bad',
        eventSequence: 0,
        activityId: 'bad',
        eventType: 'bad',
        clientOccurredAt: 'not-a-date'
      }]
    };
    const nativeDefineProperty = Object.defineProperty;
    Object.defineProperty = (target, key, descriptor) => {
      if (descriptor?.value?.code) return target;
      return nativeDefineProperty(target, key, descriptor);
    };
    const result = validatePseudonymousLearningSyncBatch(invalidBatch);
    process.stdout.write(JSON.stringify({ valid: result.valid, hasIntegrity: Object.hasOwn(result, 'integrity') }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), { valid: false, hasIntegrity: false });
});

test('does not accept invalid opaque fields when RegExp prototype methods are polluted after the contract loads', () => {
  const script = `
    import { validatePseudonymousLearningSyncBatch } from ${JSON.stringify(CONTRACT_MODULE_URL.href)};
    const invalidBatch = {
      contractVersion: '1.0.0',
      batchId: 'batch_000000000001',
      idempotencyKey: 'idem_000000000001',
      eventStreamId: 'stream_000000000001',
      contentTarget: {
        packageId: 'child@example.test',
        contentItemId: 'guardian@example.test',
        revisionId: 'contains a space',
        revisionSha256: 'not-a-digest',
        assetSetSha256: 'also-not-a-digest',
        publicationDecisionId: 'PUB-G1-TR-001',
        curriculumRegistryEntryId: 'CURR-G1-TR-001',
        programVersion: 'TYMM-2024.1',
        outcomeCode: 'MAT.1.1.1'
      },
      events: [{
        eventId: 'evt_000000000001',
        eventSequence: 41,
        activityId: 'activity_counting_001',
        eventType: 'activity_completed',
        clientOccurredAt: '2026-10-03T00:00:00.000Z'
      }]
    };
    RegExp.prototype.test = () => true;
    const result = validatePseudonymousLearningSyncBatch(invalidBatch);
    process.stdout.write(JSON.stringify({ valid: result.valid, hasIntegrity: Object.hasOwn(result, 'integrity') }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), { valid: false, hasIntegrity: false });
});

test('rejects an accessor-backed event field instead of hashing a value that can change after validation', async () => {
  const { validatePseudonymousLearningSyncBatch } = await loadContract();
  const batch = validBatch();
  let reads = 0;
  Object.defineProperty(batch.events[0], 'eventId', {
    enumerable: true,
    get() {
      reads += 1;
      return reads < 3 ? 'evt_000000000001' : 'child@example.test';
    }
  });

  const result = validatePseudonymousLearningSyncBatch(batch);

  assert.equal(result.valid, false);
  assert.equal('integrity' in result, false);
  assert.equal(result.errors.some(error => error.code === 'accessor_field_not_allowed'), true);
});

test('remains valid when a polluted Array prototype has an indexed setter', () => {
  const script = `
    import { validatePseudonymousLearningSyncBatch } from ${JSON.stringify(CONTRACT_MODULE_URL.href)};
    const batch = {
      contractVersion: '1.0.0',
      batchId: 'batch_000000000001',
      idempotencyKey: 'idem_000000000001',
      eventStreamId: 'stream_000000000001',
      contentTarget: {
        packageId: 'CP-G1-TR-001',
        contentItemId: 'CONTENT-G1-TR-001',
        revisionId: 'REV-G1-TR-001',
        revisionSha256: 'a'.repeat(64),
        assetSetSha256: 'b'.repeat(64),
        publicationDecisionId: 'PUB-G1-TR-001',
        curriculumRegistryEntryId: 'CURR-G1-TR-001',
        programVersion: 'TYMM-2024.1',
        outcomeCode: 'MAT.1.1.1'
      },
      events: [{
        eventId: 'evt_000000000001',
        eventSequence: 41,
        activityId: 'activity_counting_001',
        eventType: 'activity_completed',
        clientOccurredAt: '2026-10-03T00:00:00.000Z'
      }]
    };
    Object.defineProperty(Array.prototype, '0', {
      configurable: true,
      set() { throw new Error('prototype setter must not receive snapshot entries'); }
    });
    process.stdout.write(JSON.stringify(validatePseudonymousLearningSyncBatch(batch)));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, child.stderr);
  assert.equal(JSON.parse(child.stdout).valid, true);
});

test('fails closed when an untrusted reflection trap cannot be read', async () => {
  const { validatePseudonymousLearningSyncBatch } = await loadContract();
  const { proxy, revoke } = Proxy.revocable(validBatch(), {});
  revoke();

  assert.doesNotThrow(() => validatePseudonymousLearningSyncBatch(proxy));
  const result = validatePseudonymousLearningSyncBatch(proxy);
  assert.equal(result.valid, false);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    valid: false,
    errors: [{
      path: 'batch',
      code: 'untrusted_input_unreadable',
      message: 'the client sync input could not be read safely'
    }]
  });
});

test('rejects an events array that carries a named field outside its indexed event entries', async () => {
  const { validatePseudonymousLearningSyncBatch } = await loadContract();
  const batch = validBatch();
  batch.events.email = 'child@example.test';

  const result = validatePseudonymousLearningSyncBatch(batch);

  assert.equal(result.valid, false);
  assert.equal('integrity' in result, false);
  assert.equal(result.errors.some(error => error.code === 'unexpected_array_field'), true);
});

test('rejects an oversized event array before inspecting sparse entries', async () => {
  const { validatePseudonymousLearningSyncBatch } = await loadContract();
  const batch = validBatch();
  batch.events = new Array(101);

  const result = validatePseudonymousLearningSyncBatch(batch);

  assert.equal(result.valid, false);
  assert.equal('integrity' in result, false);
  assert.equal(result.errors.some(error => error.code === 'array_length_exceeds_limit'), true);
});

test('rejects free-text target values, uppercase digests, and Unicode-confusable opaque identifiers', async () => {
  const { validatePseudonymousLearningSyncBatch } = await loadContract();
  const batch = validBatch();
  batch.contentTarget.packageId = 'child@example.test';
  batch.contentTarget.revisionSha256 = 'A'.repeat(64);
  batch.events[0].eventId = 'evt_000000000000K';

  const result = validatePseudonymousLearningSyncBatch(batch);

  assert.equal(result.valid, false);
  assert.equal('integrity' in result, false);
  assert.equal(result.errors.some(error => error.code === 'content_target_reference_invalid'), true);
  assert.equal(result.errors.some(error => error.code === 'content_target_sha256_invalid'), true);
  assert.equal(result.errors.some(error => error.code === 'event_id_invalid'), true);
});
