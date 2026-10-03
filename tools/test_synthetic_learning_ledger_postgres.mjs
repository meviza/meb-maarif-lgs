#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isProxy } from 'node:util/types';
import { prepareLearningSyncLedgerCommand } from '../packages/contracts/learning_sync_ledger_port.mjs';
import * as v1 from '../packages/contracts/learning_event_sync_eligibility.mjs';
import { calculateLearningEventSha256 } from '../packages/contracts/learning_event_sync_batch.mjs';
import { calculateLearningSyncReceiptGovernanceBindingSha256 } from '../packages/contracts/learning_event_sync_eligibility_v2.mjs';
import { createValidServerResolvedLearningSyncInput, createExactReplayServerResolvedLearningSyncInput } from '../test/support/learning_sync_v2_fixture.mjs';

const IMAGE = 'postgres:16.15-alpine';
const DEFAULT_CONTAINER = 'k12-synthetic-ledger-proof';
const NAME = /^k12-synthetic-ledger-[a-z0-9][a-z0-9-]{0,40}$/u;
const roles = { a: 'synthetic_school_a_app', b: 'synthetic_school_b_app', none: 'synthetic_no_scope_app' };
const sqlLiteral = value => `'${String(value).replaceAll("'", "''")}'`;
const jsonLiteral = value => `${sqlLiteral(JSON.stringify(value))}::jsonb`;

function validName(name) {
  if (typeof name !== 'string' || !NAME.test(name)) throw new Error('invalid_synthetic_container_name');
  return name;
}

export function parseSyntheticLedgerArgs(argv) {
  if (!Array.isArray(argv) || isProxy(argv) || Object.getPrototypeOf(argv) !== Array.prototype) throw new Error('invalid_synthetic_ledger_args');
  const fields = Object.getOwnPropertyDescriptors(argv), size = fields.length.value;
  if (size > 3 || Reflect.ownKeys(fields).length !== size + 1) throw new Error('invalid_synthetic_ledger_args');
  const copied = [];
  for (let index = 0; index < size; index++) {
    if (!Object.hasOwn(fields[String(index)] ?? {}, 'value') || typeof fields[String(index)].value !== 'string') throw new Error('invalid_synthetic_ledger_args');
    copied.push(fields[String(index)].value);
  }
  argv = copied;
  let run = false, container = DEFAULT_CONTAINER, named = false;
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--run' && !run) run = true;
    else if (argv[index] === '--container' && !named && argv[index + 1]) { container = validName(argv[++index]); named = true; }
    else throw new Error('invalid_synthetic_ledger_args');
  }
  return Object.freeze({ run, container });
}

export function buildSyntheticDockerArgs(options) {
  if (!options || typeof options !== 'object' || isProxy(options) || Array.isArray(options)) throw new Error('invalid_synthetic_ledger_args');
  const descriptors = Object.getOwnPropertyDescriptors(options);
  if (Reflect.ownKeys(descriptors).length !== 2 || !Object.hasOwn(descriptors.run ?? {}, 'value') || !Object.hasOwn(descriptors.container ?? {}, 'value') || typeof descriptors.run.value !== 'boolean') throw new Error('invalid_synthetic_ledger_args');
  const container = validName(descriptors.container.value);
  if (!descriptors.run.value) throw new Error('explicit_run_required');
  return [
    'run', '--detach', '--rm', '--pull=never', '--name', container,
    '--label', 'k12.synthetic-ledger.proof=true', '--network=none', '--memory=256m', '--cpus=1',
    '--pids-limit=100', '--read-only', '--user=postgres', '--cap-drop=ALL', '--security-opt=no-new-privileges',
    '--shm-size=2m', '--tmpfs', '/var/lib/postgresql/data:rw,noexec,nosuid,size=56m,mode=1777',
    '--tmpfs', '/tmp:rw,noexec,nosuid,size=1m,mode=1777', '--tmpfs', '/var/run/postgresql:rw,noexec,nosuid,size=1m,mode=1777',
    '-e', 'PGDATA=/var/lib/postgresql/data/ledger', '-e', 'POSTGRES_DB=synthetic_ledger',
    '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-e', 'POSTGRES_INITDB_ARGS=--wal-segsize=1 --encoding=UTF8 --locale=C',
    IMAGE, 'postgres', '-c', 'shared_buffers=16MB', '-c', 'max_connections=10',
    '-c', 'max_wal_size=8MB', '-c', 'min_wal_size=2MB', '-c', 'wal_level=minimal', '-c', 'max_wal_senders=0',
    '-c', 'statement_timeout=5s', '-c', 'lock_timeout=2s', '-c', 'idle_in_transaction_session_timeout=5s',
  ];
}

function docker(args, input, { allowFailure = false } = {}) {
  const result = spawnSync('docker', args, { encoding: 'utf8', input, timeout: 20000, maxBuffer: 2 * 1024 * 1024, shell: false });
  if (!allowFailure && (result.error || result.status !== 0)) throw new Error(`synthetic_docker_failed: ${(result.error?.message ?? result.stderr).slice(0, 1800)}`);
  return result;
}

function prepared(input, locator) {
  const result = prepareLearningSyncLedgerCommand({ contractVersion: '1.0.0', serverResolvedEligibilityInput: input,
    streamLocator: { locatorId: locator, scopeSha256: input.streamStateSnapshot.scopeSha256, eventStreamId: input.clientBatch.eventStreamId } });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  return result.command;
}

async function fixture({ tenantId = 'tenant_ankara_001', learner = 'learner_abcdef123456', grade = 1, stream = 'stream_000000000001', locator = 'ledgerstream_000000000001', receiptId = 'RECEIPT-SYNC-001' } = {}) {
  const input = await createValidServerResolvedLearningSyncInput();
  input.resolverContext.tenantId = tenantId; input.resolverContext.actorPseudonym = learner;
  input.accessRequest.actor.tenantId = tenantId; input.accessRequest.actor.subjectId = learner;
  input.accessRequest.resource.tenantId = tenantId; input.accessRequest.resource.learnerId = learner;
  input.clientBatch.eventStreamId = stream; input.accessRequest.resource.eventStreamId = stream;
  const target = v1.calculateLearningEventContentTargetSha256(input.clientBatch.contentTarget);
  const scope = v1.calculateLearningSyncScopeSha256({ contractVersion: '1.0.0', tenantId, learnerPseudonym: learner,
    purpose: 'learning_progress_sync', eventStreamId: stream, targetSha256: target });
  input.authorizationSnapshot.scopeSha256 = scope; input.authorizationSnapshot.authorizationSha256 = v1.calculateLearningSyncAuthorizationSnapshotSha256(input.authorizationSnapshot);
  input.entitlementSnapshot.scopeSha256 = scope; input.entitlementSnapshot.entitlementSha256 = v1.calculateLearningSyncEntitlementSnapshotSha256(input.entitlementSnapshot);
  input.activityScopeSnapshot.scopeSha256 = scope; input.activityScopeSnapshot.snapshotSha256 = v1.calculateLearningSyncActivityScopeSnapshotSha256(input.activityScopeSnapshot);
  input.streamStateSnapshot.scopeSha256 = scope; input.streamStateSnapshot.stateSha256 = v1.calculateLearningSyncStreamStateSnapshotSha256(input.streamStateSnapshot);
  const command = prepared(input, locator), { intent, submission, expectedCursor } = command.append;
  const receipt = { receiptId, receiptSha256: null, scopeSha256: scope, batchId: submission.batchId, idempotencyKey: submission.idempotencyKey,
    batchSha256: submission.batchSha256, firstEventSequence: intent.firstEventSequence, lastEventSequence: intent.lastEventSequence,
    eventSha256es: [...submission.eventSha256es], predecessorSequence: expectedCursor.lastAcceptedSequence,
    predecessorEventSha256: expectedCursor.lastAcceptedEventSha256, streamVersionBefore: expectedCursor.streamVersion,
    acceptedAt: '2026-10-03T07:59:31.000Z', authorizationId: intent.authorizationId, entitlementId: intent.entitlementId,
    governanceSnapshotId: intent.governanceSnapshotId, dataHandlingPolicyId: intent.dataHandlingPolicyId, outcome: 'accepted' };
  receipt.receiptSha256 = v1.calculateLearningSyncReceiptSha256(receipt);
  const binding = { bindingContractVersion: '2.0.0', bindingSha256: null, receiptId, receiptSha256: receipt.receiptSha256,
    scopeSha256: scope, batchSha256: receipt.batchSha256, dataHandlingPolicyId: intent.dataHandlingBinding.policyId,
    dataHandlingPolicySha256: intent.dataHandlingBinding.policySha256, catalogBinding: intent.catalogBinding };
  binding.bindingSha256 = calculateLearningSyncReceiptGovernanceBindingSha256(binding);
  assert.match(binding.bindingSha256, /^[a-f0-9]{64}$/u);
  return { tenantId, learner, grade, input, command, receipt, binding };
}

function seedFixture(f) {
  const { streamLocator, append: { intent } } = f.command;
  return `INSERT INTO learning_ledger.streams(locator_id,tenant_id,learner_pseudonym,grade,event_stream_id,scope_sha256,target_sha256,content_target,state_snapshot,version,last_sequence,last_event_sha256)
    VALUES(${sqlLiteral(streamLocator.locatorId)},${sqlLiteral(f.tenantId)},${sqlLiteral(f.learner)},${f.grade},${sqlLiteral(streamLocator.eventStreamId)},${sqlLiteral(streamLocator.scopeSha256)},${sqlLiteral(intent.targetSha256)},${jsonLiteral(f.input.clientBatch.contentTarget)},${jsonLiteral(f.input.streamStateSnapshot)},7,40,${sqlLiteral('c'.repeat(64))});
    INSERT INTO learning_ledger.stream_governance(locator_id,tenant_id,learner_pseudonym,grade,catalog_binding,data_handling_binding,owner_id,steward_id)
    VALUES(${sqlLiteral(streamLocator.locatorId)},${sqlLiteral(f.tenantId)},${sqlLiteral(f.learner)},${f.grade},${jsonLiteral(intent.catalogBinding)},${jsonLiteral(intent.dataHandlingBinding)},'owner_learning_governance_001','steward_learning_governance_001');`;
}

function appendSql(f) { return `SELECT learning_ledger.append_batch(${jsonLiteral(f.command)},${jsonLiteral(f.receipt)},${jsonLiteral(f.binding)});`; }

// Deliberately corrupted synthetic commands exercise SQL's own boundary,
// independently from the V2 preparer's client-schema and eligibility gates.
function rehashMutatedFixture(f) {
  const { submission, intent } = f.command.append;
  const cleanEvents = submission.events.map(event => {
    const { eventSha256: ignored, ...clean } = event;
    event.eventSha256 = calculateLearningEventSha256(clean);
    return clean;
  });
  submission.eventSha256es = submission.events.map(event => event.eventSha256);
  submission.batchSha256 = v1.calculateLearningEventBatchSha256({ contractVersion: '1.0.0', batchId: submission.batchId,
    idempotencyKey: submission.idempotencyKey, eventStreamId: submission.eventStreamId, contentTarget: f.input.clientBatch.contentTarget, events: cleanEvents });
  intent.batchSha256 = submission.batchSha256;
  f.receipt.batchSha256 = submission.batchSha256; f.receipt.eventSha256es = submission.eventSha256es;
  f.receipt.receiptSha256 = v1.calculateLearningSyncReceiptSha256(f.receipt);
  f.binding.batchSha256 = submission.batchSha256; f.binding.receiptSha256 = f.receipt.receiptSha256;
  f.binding.bindingSha256 = calculateLearningSyncReceiptGovernanceBindingSha256(f.binding);
  return f;
}

async function runProof(options) {
  const name = options.container;
  if (docker(['container', 'inspect', name], undefined, { allowFailure: true }).status === 0) throw new Error('synthetic_container_already_exists_no_takeover');
  docker(['image', 'inspect', IMAGE]);
  const migration = await readFile(new URL('../db/migrations/001_synthetic_learning_ledger.sql', import.meta.url), 'utf8');
  const createdId = docker(buildSyntheticDockerArgs(options)).stdout.trim();
  let stopped = false;
  const witnesses = [];
  const psql = (role, sql, allowFailure = false) => docker(['exec', '-i', name, 'psql', '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-U', role, '-d', 'synthetic_ledger'], sql, { allowFailure });
  const scalar = (role, sql) => psql(role, sql).stdout.trim();
  const result = (role, sql) => JSON.parse(scalar(role, sql));
  const denied = (label, role, sql, expected) => {
    const outcome = psql(role, sql, true);
    assert.notEqual(outcome.status, 0, `${label} must fail`); assert.match(outcome.stderr, expected, label);
    witnesses.push(label);
  };
  try {
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      // pg_isready also sees initdb's temporary server, before POSTGRES_DB
      // exists. Require the target database and a real successful query.
      const probe = psql('postgres', 'SELECT 1;', true);
      if (probe.status === 0 && probe.stdout.trim() === '1') { ready = true; break; }
      await new Promise(resolveWait => setTimeout(resolveWait, 200));
    }
    assert.equal(ready, true, 'isolated PostgreSQL failed to become ready');
    psql('postgres', migration);
    const a = await fixture(), b = await fixture({ tenantId: 'tenant_ankara_002', locator: 'ledgerstream_000000000002', receiptId: 'RECEIPT-SYNC-002' });
    const otherGrade = await fixture({ grade: 2, stream: 'stream_000000000002', locator: 'ledgerstream_000000000003', receiptId: 'RECEIPT-SYNC-003' });
    const otherLearner = await fixture({ learner: 'learner_bbbbbbbbbbbb', stream: 'stream_000000000003', locator: 'ledgerstream_000000000004', receiptId: 'RECEIPT-SYNC-004' });
    psql('postgres', `INSERT INTO learning_ledger.principal_scopes VALUES ('${roles.a}',${sqlLiteral(a.tenantId)},${sqlLiteral(a.learner)},1),('${roles.b}',${sqlLiteral(b.tenantId)},${sqlLiteral(b.learner)},1);${[a,b,otherGrade,otherLearner].map(seedFixture).join('\n')}`);
    for (const role of Object.values(roles)) assert.equal(scalar(role, 'SELECT rolsuper FROM pg_catalog.pg_roles WHERE rolname=current_user;'), 'f');
    witnesses.push('application_roles_are_not_superusers');
    assert.equal(scalar(roles.a, 'SELECT count(*) FROM learning_ledger.streams;'), '1');
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.streams;'), '1');
    assert.equal(scalar(roles.none, 'SELECT count(*) FROM learning_ledger.streams;'), '0');
    denied('unmapped_role_fails_closed', roles.none, appendSql(a), /scope_denied/u);
    denied('other_school_denied', roles.a, appendSql(b), /scope_denied/u);
    denied('other_grade_denied', roles.a, appendSql(otherGrade), /scope_denied/u);
    denied('other_learner_denied', roles.a, appendSql(otherLearner), /scope_denied/u);
    assert.equal(scalar(roles.a, `SET app.tenant_id=${sqlLiteral(b.tenantId)}; SELECT tenant_id FROM learning_ledger.streams;`), a.tenantId);
    witnesses.push('caller_tenant_setting_cannot_change_database_scope');
    const first = result(roles.a, appendSql(a));
    assert.equal(first.outcome, 'accepted'); assert.deepEqual(first.receipt, a.receipt); assert.equal(first.cursor.version, 8); assert.equal(first.cursor.lastSequence, 42);
    assert.equal(scalar(roles.a, 'SELECT count(*) FROM learning_ledger.events;'), '2');
    const again = result(roles.a, appendSql(a));
    assert.equal(again.outcome, 'idempotent_replay'); assert.deepEqual(again.receipt, a.receipt);
    assert.equal(scalar(roles.a, 'SELECT count(*) FROM learning_ledger.events;'), '2');
    assert.equal(scalar(roles.a, 'SELECT count(*) FROM learning_ledger.receipts;'), '1');
    witnesses.push('append_and_duplicate_replay_have_two_events_one_receipt');
    const replayInput = await createExactReplayServerResolvedLearningSyncInput();
    const replayCommand = prepared(replayInput, a.command.streamLocator.locatorId);
    const replay = result(roles.a, `SELECT learning_ledger.replay_receipt(${jsonLiteral(replayCommand)});`);
    assert.equal(replay.outcome, 'idempotent_replay'); assert.deepEqual(replay.receipt, first.receipt);
    witnesses.push('v2_prepared_historical_replay_matches_stored_receipt');
    const conflict = structuredClone(a); conflict.command.append.submission.batchSha256 = '0'.repeat(64); conflict.command.append.intent.batchSha256 = '0'.repeat(64);
    denied('conflicting_idempotency_hash_denied', roles.a, appendSql(conflict), /idempotency_conflict/u);
    const stale = structuredClone(a); stale.command.append.submission.batchId = 'batch_000000000099'; stale.command.append.submission.idempotencyKey = 'idem_000000000099';
    denied('stale_cursor_denied', roles.a, appendSql(stale), /stale_cursor/u);
    const wrongHistorical = structuredClone(replayCommand); wrongHistorical.replay.intent.receiptGovernanceBindingSha256 = '0'.repeat(64);
    denied('historical_sidecar_hash_mismatch_denied', roles.a, `SELECT learning_ledger.replay_receipt(${jsonLiteral(wrongHistorical)});`, /receipt_governance_mismatch/u);
    denied('receipt_update_forbidden', roles.a, "UPDATE learning_ledger.receipts SET receipt_sha256=repeat('0',64);", /permission denied/u);
    denied('direct_event_insert_forbidden', roles.a, 'INSERT INTO learning_ledger.events SELECT * FROM learning_ledger.events;', /permission denied/u);
    const invalidType = structuredClone(b); invalidType.command.append.submission.events[1].eventType = null;
    denied('null_event_type_denied_even_with_matching_hashes', roles.b, appendSql(rehashMutatedFixture(invalidType)), /invalid_event_integrity/u);
    const nullActivity = structuredClone(b); nullActivity.command.append.submission.events[1].activityId = null;
    denied('null_activity_id_denied_even_with_matching_hashes', roles.b, appendSql(rehashMutatedFixture(nullActivity)), /invalid_event_integrity/u);
    const nullTimestamp = structuredClone(b); nullTimestamp.command.append.submission.events[1].clientOccurredAt = null;
    denied('null_client_timestamp_denied_even_with_matching_hashes', roles.b, appendSql(rehashMutatedFixture(nullTimestamp)), /invalid_event_integrity/u);
    const stringSequence = structuredClone(b); stringSequence.command.append.submission.events[1].eventSequence = '42';
    denied('numeric_string_sequence_denied_even_with_matching_hashes', roles.b, appendSql(rehashMutatedFixture(stringSequence)), /invalid_event_integrity/u);
    const nullAcceptedAt = structuredClone(b); nullAcceptedAt.receipt.acceptedAt = null;
    denied('null_receipt_timestamp_denied_even_with_matching_hashes', roles.b, appendSql(rehashMutatedFixture(nullAcceptedAt)), /invalid_receipt_integrity/u);
    const duplicateEvent = structuredClone(b);
    duplicateEvent.command.append.submission.events[1].eventId = duplicateEvent.command.append.submission.events[0].eventId;
    denied('sql_function_mid_write_conflict_rolls_back', roles.b, appendSql(rehashMutatedFixture(duplicateEvent)), /duplicate key value violates unique constraint/u);
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.events;'), '0');
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.receipts;'), '0');
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.receipt_governance;'), '0');
    assert.equal(scalar(roles.b, 'SELECT version FROM learning_ledger.streams;'), '7');
    const sidecar = result(roles.a, 'SELECT json_build_object(\'purpose\',purpose,\'retentionClass\',retention_class,\'sourceHash\',catalog_binding->>\'catalogSha256\',\'binding\',binding_json) FROM learning_ledger.receipt_governance;');
    assert.equal(sidecar.purpose, 'learning_progress_sync'); assert.equal(sidecar.retentionClass, 'learning-event-lifecycle'); assert.deepEqual(sidecar.binding, a.binding);
    witnesses.push('immutable_dama_source_purpose_retention_sidecar');
    // The second school's full append is rolled back by a later denied write in
    // the SAME SQL transaction; no testing-only failure flag enters the routine.
    denied('atomic_rollback_no_partial_event_receipt_or_cursor', roles.b, `BEGIN;${appendSql(b)} UPDATE learning_ledger.receipts SET receipt_sha256=repeat('0',64);COMMIT;`, /permission denied/u);
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.events;'), '0');
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.receipts;'), '0');
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.receipt_governance;'), '0');
    assert.equal(scalar(roles.b, 'SELECT version FROM learning_ledger.streams;'), '7');
    const second = result(roles.b, appendSql(b)); assert.equal(second.outcome, 'accepted');
    assert.equal(scalar(roles.b, 'SELECT count(*) FROM learning_ledger.events;'), '2');
    assert.equal(scalar(roles.a, 'SELECT count(*) FROM learning_ledger.events;'), '2');
    witnesses.push('two_schools_have_separate_two_event_ledgers');
    const runtime = JSON.parse(docker(['container', 'inspect', name, '--format', '{{json .HostConfig}}']).stdout);
    assert.equal(runtime.NetworkMode, 'none'); assert.equal(runtime.Memory, 268435456); assert.equal(runtime.NanoCpus, 1000000000);
    assert.equal(Object.keys(runtime.PortBindings ?? {}).length, 0);
    return { state: 'synthetic_sql_proof_passed', database: 'PostgreSQL 16', syntheticSchools: 2, seededScopedStreams: 4,
      applicationSuperuser: false, scopeIdentity: 'session_user_to_synthetic_role_mapping_not_http_auth',
      witnesses, runtime: { network: 'none', hostPorts: 0, cpu: 1, memoryBytes: runtime.Memory, explicitTmpfsMiB: 58, shmMiB: 2 },
      integration: 'prepared_V2_commands_to_SQL_functions_via_local_psql_not_a_production_driver',
      productionReady: false, liveStudentDataUsed: false, authenticationResolver: 'not_connected', sourceResolver: 'synthetic_seed_only' };
  } finally {
    const inspection = docker(['container', 'inspect', name, '--format', '{{.Id}}'], undefined, { allowFailure: true });
    if (inspection.status === 0 && inspection.stdout.trim() === createdId) { docker(['stop', '--time', '5', name]); stopped = true; }
    if (!stopped) throw new Error('synthetic_container_cleanup_not_confirmed');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const options = parseSyntheticLedgerArgs(process.argv.slice(2));
    if (!options.run) console.log(JSON.stringify({ state: 'not_run', reason: 'explicit_run_required', databaseOpened: false }));
    else console.log(JSON.stringify({ ...await runProof(options), ownedContainerStoppedAndRemoved: true }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
