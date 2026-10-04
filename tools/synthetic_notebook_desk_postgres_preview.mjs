#!/usr/bin/env node
// Opt-in synthetic-only SQL/browser composition. PREPARE/EXECUTE through
// docker exec is a bounded test bridge, NOT a production wire driver/auth API.
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { isProxy } from 'node:util/types';
import { buildSyntheticNotebookDockerArgs, buildSyntheticNotebookPsqlStatement }
  from './test_synthetic_student_notebook_postgres.mjs';
import { SYNTHETIC_NOTEBOOK_ADAPTER_SQL as SQL, createSyntheticNotebookAdapter }
  from '../packages/contracts/synthetic_notebook_adapter.mjs';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
import { createSyntheticNotebookFixture, createSyntheticNotebookReceipt, hashSyntheticNotebook, canonicalSyntheticNotebook }
  from '../test/support/synthetic_notebook_fixture.mjs';

const IMAGE = 'postgres:16.15-alpine', ROLE = 'synthetic_notebook_school_a_app';
const CONTAINER = /^k12-synthetic-notebook-[a-z0-9][a-z0-9-]{0,40}$/u, DOCKER_ID = /^[a-f0-9]{64}$/u;
const SCENARIOS = ['normal', 'reply-loss-once', 'stale-once'];
const SCOPE_SHA = '0a92002eb20bf7b25d71517674560c3388a01a425b3b3b893f74a54d7f584a82';
const MAX_BYTES = 524288, MAX_QUERIES = 256, SESSION_SECONDS = 600;
const invalid = code => { throw new Error(code); };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const literal = value => `'${value.replaceAll("'", "''")}'`;
const jsonLiteral = value => `${literal(JSON.stringify(value))}::jsonb`;
function fields(value, names) {
  if (value === null || typeof value !== 'object' || isProxy(value) || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return null;
  const d = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(d);
  return keys.length === names.length && keys.every(k => typeof k === 'string' && names.includes(k)
    && d[k].enumerable && Object.hasOwn(d[k], 'value')) ? d : null;
}
function primitiveStrings(value, limit, code) {
  if (isProxy(value) || !Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) invalid(code);
  const d = Object.getOwnPropertyDescriptors(value), length = d.length?.value;
  if (!Number.isSafeInteger(length) || length > limit || Reflect.ownKeys(d).length !== length + 1) invalid(code);
  const out = [];
  for (let i = 0; i < length; i++) { const f = d[String(i)]; if (!f?.enumerable || !Object.hasOwn(f, 'value') || typeof f.value !== 'string') invalid(code); out.push(f.value); }
  return out;
}
export function parseSyntheticNotebookDeskPostgresArgs(argv) {
  if (arguments.length !== 1) invalid('invalid_synthetic_notebook_desk_postgres_args');
  const a = primitiveStrings(argv, 7, 'invalid_synthetic_notebook_desk_postgres_args');
  if (a.some(value => value.length > 96)) invalid('invalid_synthetic_notebook_desk_postgres_args');
  let run = false, port = 3341, container = 'k12-synthetic-notebook-desk', scenario = 'normal'; const seen = new Set();
  for (let i = 0; i < a.length; i++) {
    const key = a[i]; if (seen.has(key)) invalid('invalid_synthetic_notebook_desk_postgres_args'); seen.add(key);
    if (key === '--run') run = true;
    else if (key === '--port' && /^(?:0|[1-9]\d{3,4})$/u.test(a[i + 1] ?? '')) {
      port = Number(a[++i]); if (port !== 0 && (port < 1024 || port > 65535)) invalid('invalid_synthetic_notebook_desk_postgres_args');
    } else if (key === '--container' && CONTAINER.test(a[i + 1] ?? '')) container = a[++i];
    else if (key === '--scenario' && SCENARIOS.includes(a[i + 1])) scenario = a[++i];
    else invalid('invalid_synthetic_notebook_desk_postgres_args');
  }
  return Object.freeze({ run, host: '127.0.0.1', port, container, scenario });
}

function parsedJson(raw) {
  if (typeof raw !== 'string' || Buffer.byteLength(raw, 'utf8') > MAX_BYTES || raw.includes('\0')) invalid('synthetic_notebook_desk_sql_response_invalid');
  let out; try { out = JSON.parse(raw); } catch { invalid('synthetic_notebook_desk_sql_response_invalid'); }
  // Primitive JSON is safe to inspect. Bound nesting/nodes BEFORE canonical
  // hash/deep freeze helpers; this is not a caller DTO or thenable.
  const stack = [[out, 0]]; let count = 0;
  while (stack.length) { const [value, depth] = stack.pop(); if (++count > 100000 || depth > 14) invalid('synthetic_notebook_desk_sql_response_invalid');
    if (typeof value === 'number' && !Number.isFinite(value)) invalid('synthetic_notebook_desk_sql_response_invalid');
    if (value && typeof value === 'object') for (const child of Object.values(value)) stack.push([child, depth + 1]); }
  return out;
}
function sanitizedError(error) {
  let code; if (error !== null && typeof error === 'object' && !isProxy(error)) { const d = Object.getOwnPropertyDescriptor(error, 'code'); if (d && Object.hasOwn(d, 'value')) code = d.value; }
  const clean = new Error('synthetic_notebook_desk_sql_execution_failed');
  if (['42501', '40001', '23505', '22023'].includes(code)) clean.code = code;
  return clean;
}
function successfulCommit(value, intent, source) {
  const d = fields(value, ['outcome', 'receipt', 'head', 'syntheticOnly', 'productionReady']);
  if (!d || !['accepted', 'idempotent_replay'].includes(value.outcome) || value.syntheticOnly !== true || value.productionReady !== false) return false;
  const expected = createSyntheticNotebookReceipt(source, { contractVersion: intent.contractVersion, mutationId: intent.mutationId,
    idempotencyKey: intent.idempotencyKey, expectedRevision: intent.expectedRevision, body: intent.body });
  return canonicalSyntheticNotebook(value.receipt) === canonicalSyntheticNotebook(expected)
    && fields(value.head, ['revision', 'bodySha256']) && Number.isSafeInteger(value.head.revision)
    && value.head.revision >= expected.resultingRevision && value.head.revision <= 100
    && typeof value.head.bodySha256 === 'string' && /^[a-f0-9]{64}$/u.test(value.head.bodySha256)
    && (value.head.revision !== expected.resultingRevision || value.head.bodySha256 === expected.bodySha256)
    && (value.outcome !== 'accepted' || value.head.revision === expected.resultingRevision);
}
function fixedPreparedIntent(intent, fixture) {
  // Syntactic fixed-fixture preflight only: claimed prior hash/revision are
  // still checked against real SQL state by commit_intent. This checkpoint
  // does NOT elevate caller metadata to DB, rights or user authority.
  try {
    const source = structuredClone(fixture), request = { contractVersion: intent.contractVersion,
      mutationId: intent.mutationId, idempotencyKey: intent.idempotencyKey,
      expectedRevision: intent.expectedRevision, body: intent.body };
    if (intent.historicalReceipt === null) source.currentRevision = { revision: intent.expectedRevision, bodySha256: intent.priorBodySha256 };
    else {
      const receipt = createSyntheticNotebookReceipt(fixture, request);
      source.currentRevision = { revision: receipt.resultingRevision, bodySha256: receipt.bodySha256 }; source.receipts = [receipt];
    }
    const prepared = createSyntheticNotebookAdapter({ sourceFixture: source, execute() { invalid('synthetic_notebook_preflight_never_executes'); } }).prepare(request);
    return prepared.valid && canonicalSyntheticNotebook(prepared.command.intent) === canonicalSyntheticNotebook(intent);
  } catch { return false; }
}
/** A trusted synchronous transport hook is code, never a request option.
 * Its returned rows alone do not prove a real DB or grant access/approval.
 */
export function createSyntheticNotebookDeskPostgresExecutor(executeStatement, scenario) {
  if (arguments.length !== 2 || typeof executeStatement !== 'function' || isProxy(executeStatement) || !SCENARIOS.includes(scenario)) invalid('invalid_synthetic_notebook_desk_executor');
  const sourceFixture = freeze(createSyntheticNotebookFixture('a'));
  if (hashSyntheticNotebook('scope', sourceFixture.scope) !== SCOPE_SHA
    || sourceFixture.policy.policySha256 !== 'd707810971e5a0b1571e45ac8a5489eb86a76e6f9fad8764a15285e86bdf9e95'
    || sourceFixture.catalog.catalogSha256 !== '21b9481bf0a37e1a740d13368e3ea6dcf146aceaba1deca5aa0160fda70849e6') invalid('synthetic_notebook_desk_fixture_pin_failed');
  let queryCount = 0, currentReadCount = 0, commitAttemptCount = 0, commitSuccessCount = 0, acceptedCommitCount = 0,
    replayCount = 0, alternateCommitCount = 0, replyLossInjected = false, alternateCommitInjected = false;
  function run(statement) { if (queryCount >= MAX_QUERIES) invalid('synthetic_notebook_desk_query_budget_exceeded'); queryCount++;
    let raw; try { raw = executeStatement(statement); } catch (error) { throw sanitizedError(error); } return parsedJson(raw); }
  function execute(query) {
    const d = fields(query, ['text', 'values']);
    if (!d || !Object.isFrozen(query) || isProxy(d.values.value) || !Object.isFrozen(d.values.value)) invalid('synthetic_notebook_desk_query_denied');
    let values; try { values = primitiveStrings(d.values.value, 1, 'synthetic_notebook_desk_query_denied'); } catch { invalid('synthetic_notebook_desk_query_denied'); }
    if (values.length !== 1 || ![SQL.current, SQL.commit].includes(d.text.value)) invalid('synthetic_notebook_desk_query_denied');
    let intent;
    if (d.text.value === SQL.current) { if (values[0] !== SCOPE_SHA) invalid('synthetic_notebook_desk_query_denied'); }
    else { try { intent = parsedJson(values[0]); } catch { invalid('synthetic_notebook_desk_query_denied'); }
      if (!intent || typeof intent !== 'object' || Array.isArray(intent) || intent.scopeSha256 !== SCOPE_SHA
        || intent.contractVersion !== '1.0.0' || canonicalSyntheticNotebook(intent.scope) !== canonicalSyntheticNotebook(sourceFixture.scope)
        || !Number.isSafeInteger(intent.expectedRevision) || intent.expectedRevision < 0 || intent.expectedRevision >= 100) invalid('synthetic_notebook_desk_query_denied');
      if (!fixedPreparedIntent(intent, sourceFixture)) invalid('synthetic_notebook_desk_query_denied');
    }
    let statement; try { statement = buildSyntheticNotebookPsqlStatement({ text: d.text.value, values }); } catch { invalid('synthetic_notebook_desk_query_denied'); }
    if (intent && scenario === 'stale-once' && !alternateCommitInjected) {
      // Scripted competing *SQL* commit, not a connection/race/load proof.
      if (intent.expectedRevision !== 0) invalid('synthetic_notebook_desk_stale_fixture_invalid');
      const alternate = createSyntheticNotebookSyncPreparer(sourceFixture).prepare({ contractVersion: '1.0.0',
        mutationId: 'desk-scripted-alternate-001', idempotencyKey: 'desk-scripted-alternate-idem-001', expectedRevision: 0,
        body: { text: 'Sentetik diğer oturumun doğrulanacak notu.', strokes: [], bookmarks: { questions: [], topics: [] }, notes: [], concerns: [] } });
      if (!alternate.valid) invalid('synthetic_notebook_desk_stale_fixture_invalid');
      const value = run(buildSyntheticNotebookPsqlStatement({ text: SQL.commit, values: [JSON.stringify(alternate.intent)] }));
      if (!successfulCommit(value, alternate.intent, sourceFixture) || value.outcome !== 'accepted') invalid('synthetic_notebook_desk_alternate_commit_unconfirmed');
      alternateCommitInjected = true; alternateCommitCount++;
    }
    if (intent) commitAttemptCount++; else currentReadCount++;
    const value = run(statement);
    if (intent) {
      if (!successfulCommit(value, intent, sourceFixture)) invalid('synthetic_notebook_desk_sql_response_invalid');
      commitSuccessCount++; if (value.outcome === 'accepted') acceptedCommitCount++; else replayCount++;
      if (scenario === 'reply-loss-once' && !replyLossInjected) { replyLossInjected = true; invalid('synthetic_notebook_desk_post_sql_reply_loss'); }
    }
    return Object.freeze({ rowCount: 1, rows: Object.freeze([Object.freeze({ notebook_result: value })]) });
  }
  const witness = () => Object.freeze({ queryCount, currentReadCount, commitAttemptCount, commitSuccessCount, acceptedCommitCount,
    replayCount, alternateCommitCount, replyLossInjected, alternateCommitInjected, concurrencyProof: false,
    databaseProofExecuted: false, nativeBrowserVerified: false, automaticRetry: false, automaticRead: false,
    currentReadCountMeaning: 'explicit_adapter_read_attempts_not_api_get_or_startup_final_audit',
    executorProvenance: 'trusted_sync_transport_hook_not_database_proof', syntheticOnly: true, productionReady: false });
  return Object.freeze({ sourceFixture, execute, witness });
}
export function planSyntheticNotebookDeskOwnedCleanup(createdId, inspectResult) {
  const d = fields(inspectResult, ['status', 'stdout', 'stderr', 'error']);
  if (arguments.length !== 2 || typeof createdId !== 'string' || !DOCKER_ID.test(createdId) || !d
    || ![0, 1, null].includes(d.status.value) || typeof d.stdout.value !== 'string' || typeof d.stderr.value !== 'string'
    || d.stdout.value.length > 1024 || d.stderr.value.length > 8192 || typeof d.error.value !== 'boolean') invalid('invalid_synthetic_notebook_desk_cleanup');
  if (!d.error.value && d.status.value === 0 && d.stdout.value.trim() === createdId) return Object.freeze({ action: 'stop_owned_id', id: createdId, cleanupConfirmed: false });
  if (!d.error.value && d.status.value === 1 && /No such (?:container|object):/u.test(d.stderr.value)) return Object.freeze({ action: 'already_absent', id: null, cleanupConfirmed: true });
  return Object.freeze({ action: 'ownership_or_absence_unconfirmed', id: null, cleanupConfirmed: false });
}

function docker(args, input, tolerateFailure = false, timeoutMs = 20000) {
  const out = spawnSync('docker', args, { input, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 2 * 1024 * 1024, shell: false });
  if (!tolerateFailure && (out.error || out.status !== 0)) invalid('synthetic_notebook_desk_docker_failed'); return out;
}
const normalizedInspect = out => ({ status: out.status, stdout: out.stdout ?? '', stderr: out.stderr ?? '', error: Boolean(out.error) });
function confirmedAbsent(out) { return !out.error && out.status === 1 && /No such (?:container|object):/u.test(out.stderr ?? ''); }
function seedSql(source) {
  return `INSERT INTO student_notebook.notebooks(scope_sha256,scope_json,catalog_json,policy_json,targets_json) VALUES(${literal(SCOPE_SHA)},${jsonLiteral(source.scope)},${jsonLiteral(source.catalog)},${jsonLiteral(source.policy)},${jsonLiteral(source.allowedTargets)}); INSERT INTO student_notebook.principal_scopes VALUES(${literal(ROLE)},${literal(SCOPE_SHA)});`;
}
function safeSqlSummary(head, historyCount) {
  if (!head || head.scopeSha256 !== SCOPE_SHA || head.syntheticOnly !== true || head.productionReady !== false
    || !Number.isSafeInteger(head.revision) || head.revision < 0 || head.revision > 100 || historyCount !== head.revision) invalid('synthetic_notebook_desk_final_sql_unconfirmed');
  const body = head.body;
  return Object.freeze({ revision: head.revision, historyCount, scopeSha256: SCOPE_SHA, bodySha256: head.bodySha256,
    receiptSha256: head.receipt?.receiptSha256 ?? null,
    counts: body === null ? null : { textUtf16Units: body.text.length, strokeCount: body.strokes.length,
      pointCount: body.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0),
      questionBookmarkCount: body.bookmarks.questions.length, topicBookmarkCount: body.bookmarks.topics.length,
      noteCount: body.notes.length, concernCount: body.concerns.length } });
}
async function runPreview(options) {
  let createdId = null, server = null, sessionTimer = null, bridge = null, initialSqlHeadVerified = false, creationAttempted = false,
    started = false, containerStopped = false, finalSql = null, termination = 'startup_failure', shutdownPromise = null;
  const limits = Object.freeze({ cpu: 1, memoryMiB: 256, tmpfsMiB: 58, shmMiB: 2, network: 'none', hostPorts: 0, hostMounts: 0, sessionSeconds: SESSION_SECONDS });
  const base = { syntheticOnly: true, authenticationImplemented: false, learnerReady: false, productionReady: false,
    nativeBrowserVerified: false, learningAnalyticsMapped: false, automaticRead: false, automaticRetry: false,
    storage: 'isolated_ephemeral_postgresql', transport: 'bounded_docker_exec_psql_prepare_execute_test_bridge', limits };
  const psql = (role, sql, allowFailure = false, timeoutMs = 20000) => docker(['exec', '-i', createdId, 'psql', '-X', '-q', '-A', '-t',
    '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-U', role, '-d', 'synthetic_notebook'], sql, allowFailure, timeoutMs);
  const executeStatement = statement => {
    const out = psql(ROLE, statement, true);
    if (out.error || out.status !== 0) { const error = new Error('synthetic_notebook_desk_sql_execution_failed');
      const code = /ERROR:\s+([A-Z0-9]{5}):/u.exec(out.stderr ?? '')?.[1]; if (['42501', '40001', '23505', '22023'].includes(code)) error.code = code; throw error; }
    return out.stdout.trim();
  };
  const shutdown = reason => {
    if (shutdownPromise) return shutdownPromise;
    termination = reason; clearTimeout(sessionTimer);
    shutdownPromise = (async () => {
      let errorCode = createdId === null && creationAttempted ? 'created_id_and_cleanup_unconfirmed' : null;
      if (server) { await new Promise(done => { server.close(done); server.closeAllConnections(); }); }
      if (createdId) {
        try {
          if (started) {
            const auditor = createSyntheticNotebookAdapter({ sourceFixture: createSyntheticNotebookFixture('a'),
              execute: query => ({ rowCount: 1, rows: [{ notebook_result: parsedJson(executeStatement(buildSyntheticNotebookPsqlStatement(query))) }] }) });
            const head = await auditor.readCurrent(); if (!head.valid) invalid('synthetic_notebook_desk_final_sql_unconfirmed');
            const rawCount = psql(ROLE, `SELECT count(*) FROM student_notebook.history WHERE scope_sha256=${literal(SCOPE_SHA)};`).stdout.trim();
            if (!/^(?:0|[1-9]\d{0,2})$/u.test(rawCount)) invalid('synthetic_notebook_desk_final_sql_unconfirmed');
            finalSql = safeSqlSummary(head, Number(rawCount));
          }
        } catch { errorCode = 'final_sql_witness_unconfirmed'; }
        try {
          const inspect = docker(['container', 'inspect', '--format', '{{.Id}}', createdId], undefined, true);
          const plan = planSyntheticNotebookDeskOwnedCleanup(createdId, normalizedInspect(inspect));
          if (plan.action === 'stop_owned_id') {
            docker(['stop', '--time', '5', plan.id]); containerStopped = confirmedAbsent(docker(['container', 'inspect', createdId], undefined, true));
          } else containerStopped = plan.cleanupConfirmed;
          if (!containerStopped) errorCode = 'owned_cleanup_unconfirmed';
        } catch { errorCode = 'owned_cleanup_unconfirmed'; }
      }
      process.off('SIGINT', signalInt); process.off('SIGTERM', signalTerm);
      const deadline = reason === 'session_deadline';
      const canceled = !started && ['SIGINT', 'SIGTERM'].includes(reason);
      const report = { state: errorCode ? 'failed' : deadline ? 'deadline_cleanup' : started ? 'stopped_with_scoped_sql_witness' : canceled ? 'startup_canceled_cleanup' : 'startup_failed',
        termination: reason, ...base, databaseProofExecuted: started && finalSql !== null,
        initialSqlHeadVerified, serverStarted: started, serverStopped: server !== null && !server.listening, creationAttempted,
        containerStopped, cleanupConfirmed: createdId === null ? null : containerStopped,
        jointNativeBrowserProofAccepted: false, deadlineIsProofPass: false, finalSql, operations: bridge?.witness() ?? null, errorCode };
      console.log(JSON.stringify(report)); if (errorCode || !started || deadline) process.exitCode = 1;
      return report;
    })(); return shutdownPromise;
  };
  const signalInt = () => { void shutdown('SIGINT'); }, signalTerm = () => { void shutdown('SIGTERM'); };
  const requireOpen = () => { if (shutdownPromise) invalid('synthetic_notebook_desk_startup_canceled'); };
  try {
    const absent = docker(['container', 'inspect', options.container], undefined, true);
    if (absent.status === 0) invalid('synthetic_notebook_desk_container_already_exists_no_takeover');
    if (!confirmedAbsent(absent)) invalid('synthetic_notebook_desk_container_absence_not_confirmed');
    docker(['image', 'inspect', IMAGE]);
    const migration = await readFile(new URL('../db/migrations/002_synthetic_student_notebook.sql', import.meta.url), 'utf8');
    if (Buffer.byteLength(migration, 'utf8') > 262144) invalid('synthetic_notebook_desk_migration_budget');
    creationAttempted = true;
    const created = docker(buildSyntheticNotebookDockerArgs({ run: true, container: options.container })).stdout.trim();
    if (!DOCKER_ID.test(created)) invalid('synthetic_notebook_desk_created_id_unconfirmed'); createdId = created;
    process.once('SIGINT', signalInt); process.once('SIGTERM', signalTerm);
    sessionTimer = setTimeout(() => { void shutdown('session_deadline'); }, SESSION_SECONDS * 1000);
    const readyDeadline = Date.now() + 10000; let ready = false;
    for (let attempt = 0; attempt < 50 && Date.now() < readyDeadline; attempt++) { requireOpen();
      const probe = psql('postgres', 'SELECT 1;', true, Math.max(1, Math.min(500, readyDeadline - Date.now())));
      if (!probe.error && probe.status === 0 && probe.stdout.trim() === '1') { ready = true; break; }
      await new Promise(done => setTimeout(done, 200)); requireOpen(); }
    if (!ready) invalid('synthetic_notebook_desk_sql_ready_timeout');
    requireOpen();
    psql('postgres', migration); bridge = createSyntheticNotebookDeskPostgresExecutor(executeStatement, options.scenario);
    psql('postgres', seedSql(bridge.sourceFixture));
    const roleProfile = psql('postgres', `SELECT (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole) FROM pg_roles WHERE rolname=${literal(ROLE)};`).stdout.trim();
    if (roleProfile !== 'f') invalid('synthetic_notebook_desk_role_not_least_privileged');
    const auditor = createSyntheticNotebookAdapter({ sourceFixture: bridge.sourceFixture, execute: query => ({ rowCount: 1,
      rows: [{ notebook_result: parsedJson(executeStatement(buildSyntheticNotebookPsqlStatement(query))) }] }) });
    const initialHead = await auditor.readCurrent(); if (!initialHead.valid || initialHead.revision !== 0 || initialHead.body !== null) invalid('synthetic_notebook_desk_initial_head_not_zero');
    initialSqlHeadVerified = true;
    const { createSyntheticNotebookDeskServer } = await import('../packages/contracts/synthetic_notebook_application_server.mjs');
    requireOpen();
    server = createSyntheticNotebookDeskServer({ sourceFixture: bridge.sourceFixture, execute: bridge.execute });
    await new Promise((done, reject) => { server.once('error', reject); server.listen(options.port, options.host, done); });
    requireOpen(); started = true;
    console.log(JSON.stringify({ state: 'synthetic_notebook_desk_postgres_preview_ready', ...base,
      url: `http://127.0.0.1:${server.address().port}/`, scenario: options.scenario, scopeSha256: SCOPE_SHA,
      initialSqlHeadVerified: true, initialRevision: 0, databaseProofExecuted: true, realDatabaseVerified: false,
      browserProofPending: true, leastPrivilegedRole: ROLE, faultIsScriptedPostSql: options.scenario !== 'normal' }));
  } catch {
    await shutdown('startup_failure'); process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseSyntheticNotebookDeskPostgresArgs(process.argv.slice(2));
    if (!options.run) console.log(JSON.stringify({ state: 'not_run', syntheticOnly: true, databaseProofExecuted: false,
      serverStarted: false, authenticationImplemented: false, nativeBrowserVerified: false, productionReady: false }));
    else await runPreview(options);
  } catch {
    console.error('invalid_synthetic_notebook_desk_postgres_args'); process.exitCode = 1;
  }
}
