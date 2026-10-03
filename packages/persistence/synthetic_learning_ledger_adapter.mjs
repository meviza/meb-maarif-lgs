/**
 * Dependency-free, synthetic-only application boundary. The composition root
 * owns both hooks and the executor's database identity. This is not an HTTP
 * request schema, an authentication resolver, or a PostgreSQL wire driver.
 * Only command references prepared by this adapter instance can execute.
 */
import { isPromise, isProxy } from 'node:util/types';
import { prepareLearningSyncLedgerCommand } from '../contracts/learning_sync_ledger_port.mjs';
import { calculateLearningSyncReceiptSha256, calculateLearningSyncStreamStateSnapshotSha256 } from '../contracts/learning_event_sync_eligibility.mjs';
import { calculateLearningSyncReceiptGovernanceBindingSha256 } from '../contracts/learning_event_sync_eligibility_v2.mjs';

const MAX_BYTES = 262144;
const HASH = /^[a-f0-9]{64}$/u;
const TIMESTAMP = /^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;
const RECEIPT_FIELDS = ['receiptId','receiptSha256','scopeSha256','batchId','idempotencyKey','batchSha256','firstEventSequence','lastEventSequence','eventSha256es','predecessorSequence','predecessorEventSha256','streamVersionBefore','acceptedAt','authorizationId','entitlementId','governanceSnapshotId','dataHandlingPolicyId','outcome'];
const CURSOR_FIELDS = ['version','lastSequence','lastEventSha256','stateSha256'];
const STATE_FIELDS = ['snapshotId','stateSha256','scopeSha256','lastAcceptedSequence','lastAcceptedEventSha256','streamVersion','capturedAt'];
const LOCATOR_FIELDS = ['locatorId','scopeSha256','eventStreamId'];
const APPEND_SQL = 'SELECT learning_ledger.append_batch($1::jsonb,$2::jsonb,$3::jsonb) AS ledger_result';
const REPLAY_SQL = 'SELECT learning_ledger.replay_receipt($1::jsonb) AS ledger_result';
const READ_SQL = `SELECT jsonb_build_object('outcome','read','streamLocator',jsonb_build_object('locatorId',s.locator_id,'scopeSha256',s.scope_sha256,'eventStreamId',s.event_stream_id),'cursor',jsonb_build_object('version',s.version,'lastSequence',s.last_sequence,'lastEventSha256',s.last_event_sha256,'stateSha256',s.state_sha256),'streamStateSnapshot',s.state_snapshot||jsonb_build_object('stateSha256',s.state_sha256)) AS ledger_result FROM learning_ledger.streams AS s WHERE s.locator_id=$1::text AND s.scope_sha256=$2::text AND s.event_stream_id=$3::text`;
export const SYNTHETIC_LEARNING_LEDGER_SQL = Object.freeze({ append: APPEND_SQL, replay: REPLAY_SQL, read: READ_SQL });

function plain(value) {
  if (value === null || typeof value !== 'object' || isProxy(value) || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function closed(value, fields) {
  if (!plain(value)) return false;
  const keys = Reflect.ownKeys(value);
  return keys.length === fields.length && keys.every(key => typeof key === 'string' && fields.includes(key));
}
function safeSnapshot(value) {
  const active = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(v, depth) {
    if (++nodes > 10000 || depth > 24) throw new Error('unsafe_dto');
    if (v === null || typeof v === 'boolean') return v;
    if (typeof v === 'string') { bytes += Buffer.byteLength(v, 'utf8'); if (bytes > MAX_BYTES) throw new Error('unsafe_dto'); return v; }
    if (typeof v === 'number' && Number.isSafeInteger(v)) return v;
    if (typeof v !== 'object' || isProxy(v) || active.has(v)) throw new Error('unsafe_dto');
    const array = Array.isArray(v), prototype = Object.getPrototypeOf(v);
    if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) throw new Error('unsafe_dto');
    const descriptors = Object.getOwnPropertyDescriptors(v), keys = Reflect.ownKeys(descriptors);
    active.add(v);
    let out;
    if (array) {
      const size = descriptors.length?.value;
      if (!Number.isSafeInteger(size) || size > 128 || keys.length !== size + 1) throw new Error('unsafe_dto');
      out = [];
      for (let i = 0; i < size; i++) {
        const d = descriptors[String(i)];
        if (!d || !d.enumerable || !Object.hasOwn(d, 'value')) throw new Error('unsafe_dto');
        out.push(copy(d.value, depth + 1));
      }
    } else {
      if (keys.length > 64) throw new Error('unsafe_dto');
      out = Object.create(null);
      for (const key of keys) {
        const d = descriptors[key];
        if (typeof key !== 'string' || !d.enumerable || !Object.hasOwn(d, 'value')) throw new Error('unsafe_dto');
        bytes += Buffer.byteLength(key, 'utf8');
        if (bytes > MAX_BYTES) throw new Error('unsafe_dto');
        Object.defineProperty(out, key, { value: copy(d.value, depth + 1), enumerable: true });
      }
    }
    active.delete(v);
    return Object.freeze(out);
  }
  const result = copy(value, 0);
  if (Buffer.byteLength(JSON.stringify(result), 'utf8') > MAX_BYTES) throw new Error('unsafe_dto');
  return result;
}
const hash = v => typeof v === 'string' && HASH.test(v);
const positive = v => Number.isSafeInteger(v) && v > 0;
const nonnegative = v => Number.isSafeInteger(v) && v >= 0;
const id = v => typeof v === 'string' && v.length > 0 && v.length <= 140;
function timestamp(value) {
  if (typeof value !== 'string' || !TIMESTAMP.test(value)) return false;
  const expected = value.includes('.') ? value : value.replace(/Z$/u, '.000Z');
  const ms = Date.parse(value);
  return Number.isFinite(ms) && new Date(ms).toISOString() === expected;
}
function failure(code, commitState = 'not_attempted') {
  return Object.freeze({ valid: false, error: Object.freeze({ code }), commitState, automaticRetry: false, syntheticOnly: true, productionReady: false });
}
function preparationFailure() {
  return Object.freeze({ valid: false, command: null, errors: Object.freeze([Object.freeze({ path: 'input', code: 'adapter_input_unreadable', message: 'a bounded, inert server-owned DTO is required' })]) });
}
function cursorValid(cursor) {
  return closed(cursor, CURSOR_FIELDS) && positive(cursor.version) && nonnegative(cursor.lastSequence) && hash(cursor.stateSha256)
    && (cursor.lastSequence === 0 ? cursor.lastEventSha256 === null : hash(cursor.lastEventSha256));
}
function receiptValid(receipt) {
  return closed(receipt, RECEIPT_FIELDS) && ['receiptId','batchId','idempotencyKey','authorizationId','entitlementId','governanceSnapshotId','dataHandlingPolicyId'].every(k => id(receipt[k]))
    && hash(receipt.scopeSha256) && hash(receipt.batchSha256) && hash(receipt.receiptSha256) && receipt.outcome === 'accepted'
    && positive(receipt.streamVersionBefore) && positive(receipt.firstEventSequence) && positive(receipt.lastEventSequence)
    && nonnegative(receipt.predecessorSequence) && receipt.firstEventSequence === receipt.predecessorSequence + 1
    && receipt.lastEventSequence >= receipt.firstEventSequence && receipt.lastEventSequence - receipt.firstEventSequence < 100
    && (receipt.predecessorSequence === 0 ? receipt.predecessorEventSha256 === null : hash(receipt.predecessorEventSha256))
    && Array.isArray(receipt.eventSha256es) && receipt.eventSha256es.length === receipt.lastEventSequence - receipt.firstEventSequence + 1 && receipt.eventSha256es.every(hash)
    && timestamp(receipt.acceptedAt) && calculateLearningSyncReceiptSha256(receipt) === receipt.receiptSha256;
}
function historicalCursorBound(cursor, receipt) {
  return cursorValid(cursor) && cursor.version >= receipt.streamVersionBefore + 1 && cursor.lastSequence >= receipt.lastEventSequence
    && (cursor.lastSequence !== receipt.lastEventSequence || cursor.lastEventSha256 === receipt.eventSha256es.at(-1));
}
function preparationCursorBound(cursor, entry) {
  if (!cursorValid(cursor)) return false;
  const prior = entry.streamStateSnapshot;
  const versionDelta = cursor.version - prior.streamVersion, sequenceDelta = cursor.lastSequence - prior.lastAcceptedSequence;
  if (versionDelta < 0 || sequenceDelta < 0) return false;
  if (versionDelta === 0) return sequenceDelta === 0 && cursor.lastEventSha256 === prior.lastAcceptedEventSha256 && cursor.stateSha256 === prior.stateSha256;
  // Each accepted SQL batch advances version once and appends 1..100 events.
  return sequenceDelta >= versionDelta && sequenceDelta <= 100 * versionDelta;
}
function createAppendPlan(entry, serverMetadata) {
  const meta = safeSnapshot(serverMetadata);
  if (!closed(meta, ['receiptId','acceptedAt']) || !id(meta.receiptId) || !timestamp(meta.acceptedAt)) throw new Error('invalid_server_receipt_metadata');
  const { intent, submission, expectedCursor } = entry.command.append;
  const receipt = { receiptId: meta.receiptId, receiptSha256: null, scopeSha256: intent.scopeSha256, batchId: submission.batchId,
    idempotencyKey: submission.idempotencyKey, batchSha256: submission.batchSha256, firstEventSequence: intent.firstEventSequence,
    lastEventSequence: intent.lastEventSequence, eventSha256es: submission.eventSha256es, predecessorSequence: expectedCursor.lastAcceptedSequence,
    predecessorEventSha256: expectedCursor.lastAcceptedEventSha256, streamVersionBefore: expectedCursor.streamVersion, acceptedAt: meta.acceptedAt,
    authorizationId: intent.authorizationId, entitlementId: intent.entitlementId, governanceSnapshotId: intent.governanceSnapshotId,
    dataHandlingPolicyId: intent.dataHandlingPolicyId, outcome: 'accepted' };
  receipt.receiptSha256 = calculateLearningSyncReceiptSha256(receipt);
  const binding = { bindingContractVersion: '2.0.0', bindingSha256: null, receiptId: receipt.receiptId, receiptSha256: receipt.receiptSha256,
    scopeSha256: intent.scopeSha256, batchSha256: submission.batchSha256, dataHandlingPolicyId: intent.dataHandlingBinding.policyId,
    dataHandlingPolicySha256: intent.dataHandlingBinding.policySha256, catalogBinding: intent.catalogBinding };
  binding.bindingSha256 = calculateLearningSyncReceiptGovernanceBindingSha256(binding);
  const state = { ...entry.streamStateSnapshot, snapshotId: `${entry.streamStateSnapshot.snapshotId}:${expectedCursor.streamVersion + 1}`,
    streamVersion: expectedCursor.streamVersion + 1, lastAcceptedSequence: intent.lastEventSequence,
    lastAcceptedEventSha256: submission.eventSha256es.at(-1), capturedAt: meta.acceptedAt };
  state.stateSha256 = calculateLearningSyncStreamStateSnapshotSha256(state);
  return Object.freeze({ receipt: safeSnapshot(receipt), binding: safeSnapshot(binding), cursor: Object.freeze({ version: state.streamVersion,
    lastSequence: state.lastAcceptedSequence, lastEventSha256: state.lastAcceptedEventSha256, stateSha256: state.stateSha256 }) });
}
function readBound(result, entry) {
  const command = entry.command;
  if (!closed(result, ['outcome','streamLocator','cursor','streamStateSnapshot']) || result.outcome !== 'read'
    || !closed(result.streamLocator, LOCATOR_FIELDS) || !LOCATOR_FIELDS.every(k => result.streamLocator[k] === command.streamLocator[k])
    || !preparationCursorBound(result.cursor, entry)) return false;
  const state = result.streamStateSnapshot;
  return closed(state, STATE_FIELDS) && typeof state.snapshotId === 'string' && state.snapshotId.length > 0 && timestamp(state.capturedAt) && state.scopeSha256 === command.streamLocator.scopeSha256
    && state.streamVersion === result.cursor.version && state.lastAcceptedSequence === result.cursor.lastSequence
    && state.lastAcceptedEventSha256 === result.cursor.lastEventSha256 && state.stateSha256 === result.cursor.stateSha256
    && calculateLearningSyncStreamStateSnapshotSha256(state) === state.stateSha256;
}
function writeBound(result, entry, kind) {
  if (!closed(result, ['outcome','receipt','cursor']) || !receiptValid(result.receipt) || !historicalCursorBound(result.cursor, result.receipt) || !preparationCursorBound(result.cursor, entry)) return false;
  if (kind === 'append') {
    if (!['accepted','idempotent_replay'].includes(result.outcome) || result.receipt.receiptSha256 !== entry.appendPlan.receipt.receiptSha256) return false;
    if (result.outcome === 'accepted' && !CURSOR_FIELDS.every(k => result.cursor[k] === entry.appendPlan.cursor[k])) return false;
    return true;
  }
  const intent = entry.command.replay.intent;
  return result.outcome === 'idempotent_replay' && result.receipt.receiptId === intent.receiptId
    && result.receipt.receiptSha256 === intent.receiptSha256 && result.receipt.scopeSha256 === intent.scopeSha256 && result.receipt.batchSha256 === intent.batchSha256;
}
function executorError(error) {
  // Never read message/stack or caller accessors and never echo SQL or values.
  let code;
  if (error !== null && (typeof error === 'object' || typeof error === 'function') && !isProxy(error)) {
    const descriptor = Object.getOwnPropertyDescriptor(error, 'code');
    if (descriptor && Object.hasOwn(descriptor, 'value')) code = descriptor.value;
  }
  return new Map([['42501','scope_denied'],['40001','stale_cursor'],['23505','idempotency_conflict'],['22023','ledger_integrity_denied']]).get(code) ?? 'ledger_execution_failed';
}

/** Trusted server composition only; do not expose prepareCommand as an HTTP DTO. */
export function createSyntheticLearningLedgerAdapter(options) {
  if (!plain(options)) throw new Error('invalid_synthetic_ledger_adapter_options');
  const descriptors = Object.getOwnPropertyDescriptors(options);
  if (!closed(descriptors, ['execute','createReceiptMetadata']) || ['execute','createReceiptMetadata'].some(k => !descriptors[k].enumerable || !Object.hasOwn(descriptors[k], 'value') || typeof descriptors[k].value !== 'function' || isProxy(descriptors[k].value))) {
    throw new Error('invalid_synthetic_ledger_adapter_options');
  }
  const execute = descriptors.execute.value, createReceiptMetadata = descriptors.createReceiptMetadata.value;
  const commands = new WeakMap();
  function prepareCommand(input) {
    let detached;
    try { detached = safeSnapshot(input); } catch { return preparationFailure(); }
    const prepared = prepareLearningSyncLedgerCommand(detached);
    if (prepared.valid) commands.set(prepared.command, { command: prepared.command, streamStateSnapshot: detached.serverResolvedEligibilityInput.streamStateSnapshot, appendPlan: null });
    return prepared;
  }
  async function perform(kind, command) {
    if (command === null || typeof command !== 'object' || isProxy(command) || !commands.has(command)) return failure('untrusted_ledger_command');
    const entry = commands.get(command);
    if (kind !== 'read' && command.commandKind !== kind) return failure('ledger_command_kind_mismatch');
    let query;
    if (kind === 'append') {
      if (!entry.appendPlan) { try { entry.appendPlan = createAppendPlan(entry, createReceiptMetadata()); } catch { return failure('invalid_server_receipt_metadata'); } }
      query = { text: APPEND_SQL, values: [JSON.stringify(command), JSON.stringify(entry.appendPlan.receipt), JSON.stringify(entry.appendPlan.binding)] };
    } else if (kind === 'replay') query = { text: REPLAY_SQL, values: [JSON.stringify(command)] };
    else query = { text: READ_SQL, values: LOCATOR_FIELDS.map(k => command.streamLocator[k]) };
    query = Object.freeze({ text: query.text, values: Object.freeze(query.values) });
    let raw;
    try {
      raw = execute(query);
      // An arbitrary thenable is data, never an executable promise. A native
      // async executor owns Promise resolution; its internal effects are trusted.
      if (!isProxy(raw) && isPromise(raw)) raw = await raw;
    } catch (error) { return failure(executorError(error), kind === 'read' ? 'not_attempted' : 'unknown'); }
    let response;
    try { response = safeSnapshot(raw); } catch { return failure('ledger_response_invalid', kind === 'read' ? 'not_attempted' : 'unknown'); }
    if (!closed(response, ['rowCount','rows']) || !Array.isArray(response.rows) || response.rows.length !== response.rowCount || ![0,1].includes(response.rowCount)) return failure('ledger_response_invalid', kind === 'read' ? 'not_attempted' : 'unknown');
    if (kind === 'read' && response.rowCount === 0) return failure('scope_denied');
    const result = response.rows[0]?.ledger_result;
    if (response.rowCount !== 1 || !closed(response.rows[0], ['ledger_result']) || !(kind === 'read' ? readBound(result, entry) : writeBound(result, entry, kind))) return failure('ledger_response_invalid', kind === 'read' ? 'not_attempted' : 'unknown');
    return Object.freeze({ valid: true, ...result, syntheticOnly: true, productionReady: false });
  }
  return Object.freeze({ prepareCommand, append: command => perform('append', command), replay: command => perform('replay', command), read: command => perform('read', command) });
}
