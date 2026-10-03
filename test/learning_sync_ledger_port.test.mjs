import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  createExactReplayServerResolvedLearningSyncInput,
  createValidServerResolvedLearningSyncInput
} from './support/learning_sync_v2_fixture.mjs';

const PORT_MODULE_URL = new URL('../packages/contracts/learning_sync_ledger_port.mjs', import.meta.url);

async function validAppendCommandInput() {
  const serverResolvedEligibilityInput = await createValidServerResolvedLearningSyncInput();
  return {
    contractVersion: '1.0.0',
    serverResolvedEligibilityInput,
    streamLocator: {
      locatorId: 'ledgerstream_000000000001',
      scopeSha256: serverResolvedEligibilityInput.streamStateSnapshot.scopeSha256,
      eventStreamId: serverResolvedEligibilityInput.clientBatch.eventStreamId
    }
  };
}

async function validReplayCommandInput() {
  const serverResolvedEligibilityInput = await createExactReplayServerResolvedLearningSyncInput();
  return {
    contractVersion: '1.0.0',
    serverResolvedEligibilityInput,
    streamLocator: {
      locatorId: 'ledgerstream_000000000001',
      scopeSha256: serverResolvedEligibilityInput.streamStateSnapshot.scopeSha256,
      eventStreamId: serverResolvedEligibilityInput.clientBatch.eventStreamId
    }
  };
}

test('re-evaluates a trusted V2 input before preparing a detached immutable append command', async () => {
  // Break caught: an adapter could persist a caller-shaped V2 decision without
  // checking its authorization, policy, catalog, receipt, or cursor evidence.
  assert.equal(
    fs.existsSync(PORT_MODULE_URL),
    true,
    'an adapter-neutral ledger port contract must exist before any ledger implementation'
  );
  const port = await import(PORT_MODULE_URL.href);
  const input = await validAppendCommandInput();

  const result = port.prepareLearningSyncLedgerCommand(input);

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.command.contractVersion, '1.0.0');
  assert.equal(result.command.commandKind, 'append');
  assert.equal(result.command.append.submission.batchId, 'batch_000000000001');
  assert.equal(result.command.append.submission.idempotencyKey, 'idem_000000000001');
  assert.equal(result.command.append.submission.eventSha256es.length, 2);
  assert.equal(result.command.append.submission.events[0].eventId, 'evt_000000000041');
  assert.equal(result.command.append.expectedCursor.lastAcceptedSequence, 40);
  assert.equal(result.command.append.intent.catalogBinding.catalogId, 'catalog_learning_governance_001');
  assert.equal(result.command.append.intent.dataHandlingBinding.policySha256, input.serverResolvedEligibilityInput.dataHandlingSnapshot.policySha256);
  assert.equal(Object.isFrozen(result.command), true);
  assert.equal(Object.isFrozen(result.command.append), true);
  assert.equal(Object.isFrozen(result.command.append.submission), true);
  assert.equal(Object.isFrozen(result.command.append.submission.events), true);
  assert.equal(Object.isFrozen(result.command.append.submission.events[0]), true);
  assert.equal('syncDecision' in result.command, false);
  assert.equal('committed' in result.command, false);
  const serializedCommand = JSON.stringify(result.command);
  assert.equal(serializedCommand.includes('learner_abcdef123456'), false);
  assert.equal(serializedCommand.includes('tenant_ankara_001'), false);
  assert.equal(serializedCommand.includes('contentTarget'), false);

  input.serverResolvedEligibilityInput.clientBatch.events[0].eventId = 'evt_mutated_after_preparation_001';
  assert.equal(result.command.append.submission.events[0].eventId, 'evt_000000000041');
});

test('re-evaluates V2 historical evidence before preparing a replay lookup command', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const input = await validReplayCommandInput();

  const result = port.prepareLearningSyncLedgerCommand(input);

  assert.equal(result.valid, true);
  assert.equal(result.command.commandKind, 'replay');
  assert.equal(result.command.replay.intent.receiptId, 'RECEIPT-SYNC-001');
  assert.equal(result.command.replay.intent.receiptGovernanceBindingSha256.length, 64);
  assert.equal(result.command.replay.intent.catalogBinding.catalogRevisionId, 'catalogrev_learning_governance_001');
  assert.equal(Object.isFrozen(result.command.replay.intent), true);
  assert.equal('append' in result.command, false);
  assert.equal('syncDecision' in result.command, false);
  assert.equal('committed' in result.command, false);
});

test('rejects the retired caller-shaped decision, kind, batch, and cursor fields', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const input = await validAppendCommandInput();
  input.commandKind = 'append';
  input.syncDecision = { eligible: true, nextState: 'append_eligible', errors: [], appendIntent: {} };
  input.clientBatch = input.serverResolvedEligibilityInput.clientBatch;
  input.expectedCursor = input.serverResolvedEligibilityInput.streamStateSnapshot;

  const result = port.prepareLearningSyncLedgerCommand(input);

  assert.equal(result.valid, false);
  assert.equal(result.command, null);
  assert.equal(result.errors.some(error => error.code === 'unexpected_field'), true);
});

test('does not prepare a command when the internally re-evaluated V2 evidence is blocked', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const input = await validAppendCommandInput();
  input.serverResolvedEligibilityInput.dataHandlingSnapshot.purpose = 'forged_purpose_001';

  const result = port.prepareLearningSyncLedgerCommand(input);

  assert.equal(result.valid, false);
  assert.equal(result.command, null);
  assert.equal(result.errors.some(error => error.code === 'v2_eligibility_blocked'), true);
});

test('rejects append commands when a server-resolved locator does not bind the evaluated scope and event stream', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const scopeMismatch = await validAppendCommandInput();
  scopeMismatch.streamLocator.scopeSha256 = '0'.repeat(64);
  const streamMismatch = await validAppendCommandInput();
  streamMismatch.streamLocator.eventStreamId = 'stream_000000000099';

  const scopeResult = port.prepareLearningSyncLedgerCommand(scopeMismatch);
  const streamResult = port.prepareLearningSyncLedgerCommand(streamMismatch);

  assert.equal(scopeResult.valid, false);
  assert.equal(scopeResult.command, null);
  assert.equal(scopeResult.errors.some(error => error.code === 'append_scope_mismatch'), true);
  assert.equal(streamResult.valid, false);
  assert.equal(streamResult.command, null);
  assert.equal(streamResult.errors.some(error => error.code === 'append_scope_mismatch'), true);
});

test('requires the exact historical V2 sidecar before a replay command can be prepared', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const missingSidecar = await validReplayCommandInput();
  missingSidecar.serverResolvedEligibilityInput.receiptGovernanceBindingLookup = { binding: null };
  const tamperedSidecar = await validReplayCommandInput();
  tamperedSidecar.serverResolvedEligibilityInput.receiptGovernanceBindingLookup.binding.bindingSha256 = '0'.repeat(64);

  const missingResult = port.prepareLearningSyncLedgerCommand(missingSidecar);
  const tamperedResult = port.prepareLearningSyncLedgerCommand(tamperedSidecar);

  assert.equal(missingResult.valid, false);
  assert.equal(missingResult.command, null);
  assert.equal(missingResult.errors.some(error => error.code === 'v2_eligibility_blocked'), true);
  assert.equal(tamperedResult.valid, false);
  assert.equal(tamperedResult.command, null);
  assert.equal(tamperedResult.errors.some(error => error.code === 'v2_eligibility_blocked'), true);
});

test('rejects a replay command when the server-resolved locator is outside the historical receipt scope', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const input = await validReplayCommandInput();
  input.streamLocator.scopeSha256 = '0'.repeat(64);

  const result = port.prepareLearningSyncLedgerCommand(input);

  assert.equal(result.valid, false);
  assert.equal(result.command, null);
  assert.equal(result.errors.some(error => error.code === 'replay_scope_mismatch'), true);
});

test('rejects a replay locator whose event stream differs from the V2-evaluated batch scope', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const input = await validReplayCommandInput();
  input.streamLocator.eventStreamId = 'stream_000000000099';

  const result = port.prepareLearningSyncLedgerCommand(input);

  assert.equal(result.valid, false);
  assert.equal(result.command, null);
  assert.equal(result.errors.some(error => error.code === 'replay_event_stream_mismatch'), true);
});

test('fails closed on an accessor root field without invoking its getter', async () => {
  const port = await import(PORT_MODULE_URL.href);
  const input = await validAppendCommandInput();
  let reads = 0;
  Object.defineProperty(input, 'serverResolvedEligibilityInput', {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return null;
    }
  });

  const result = port.prepareLearningSyncLedgerCommand(input);

  assert.equal(result.valid, false);
  assert.equal(result.command, null);
  assert.equal(reads, 0);
  assert.equal(result.errors.some(error => error.code === 'accessor_field_not_allowed'), true);
});
