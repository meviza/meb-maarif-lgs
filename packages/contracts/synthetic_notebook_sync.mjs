/**
 * Pure, synthetic-only notebook preparation. The composition root supplies
 * fixed server-owned scope/policy/revision/history DTOs, never an HTTP body.
 * No authentication, mutation, persistence, sharing or HTML sanitization.
 * Hashes detect binding drift; they do not make caller-owned sources trusted.
 */
import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { NOTEBOOK_PALETTE, NOTEBOOK_STROKE_WIDTHS } from '../student/notebook.mjs';

const MAX_DTO_BYTES = 524288;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/u;
const HASH = /^[a-f0-9]{64}$/u;
const PURPOSE = 'student_notebook';
const CLASSIFICATION = 'sensitive_student_notebook';
const RETENTION = 'student-notebook-lifecycle';
const CLIENT_FIELDS = ['contractVersion','mutationId','idempotencyKey','expectedRevision','body'];
const LIMIT_PROFILES = Object.freeze({ maxBodyBytes: [65536,131072,262144], textMaxUnits: [128,1000,4000],
  strokeCount: [8,32,64], pointsPerStroke: [32,128,512], bookmarkCount: [10,50,100], noteCount: [10,50,100], concernCount: [10,50,100] });

function plain(value) {
  if (value === null || typeof value !== 'object' || isProxy(value) || Array.isArray(value)) return false;
  return [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function closed(value, fields) {
  if (!plain(value)) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(descriptors);
  return keys.length === fields.length && keys.every(key => typeof key === 'string' && fields.includes(key)
    && descriptors[key].enumerable && Object.hasOwn(descriptors[key], 'value'));
}
function snapshot(value) {
  const active = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(v, depth) {
    if (++nodes > 100000 || depth > 14) throw new Error('invalid_dto');
    if (v === null || typeof v === 'boolean') return v;
    if (typeof v === 'number' && Number.isFinite(v)) return v === 0 ? 0 : v;
    if (typeof v === 'string') { bytes += Buffer.byteLength(v, 'utf8'); if (bytes > MAX_DTO_BYTES) throw new Error('invalid_dto'); return v; }
    if (typeof v !== 'object' || isProxy(v) || active.has(v)) throw new Error('invalid_dto');
    const array = Array.isArray(v), prototype = Object.getPrototypeOf(v);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) throw new Error('invalid_dto');
    const d = Object.getOwnPropertyDescriptors(v), keys = Reflect.ownKeys(d); active.add(v);
    let out;
    if (array) {
      const size = d.length?.value;
      if (!Number.isSafeInteger(size) || size > 512 || keys.length !== size + 1) throw new Error('invalid_dto');
      out = [];
      for (let i = 0; i < size; i++) {
        const field = d[String(i)];
        if (!field || !field.enumerable || !Object.hasOwn(field, 'value')) throw new Error('invalid_dto');
        out.push(copy(field.value, depth + 1));
      }
    } else {
      if (keys.length > 32) throw new Error('invalid_dto');
      out = Object.create(null);
      for (const key of keys) {
        const field = d[key];
        if (typeof key !== 'string' || !field.enumerable || !Object.hasOwn(field, 'value')) throw new Error('invalid_dto');
        bytes += Buffer.byteLength(key, 'utf8'); if (bytes > MAX_DTO_BYTES) throw new Error('invalid_dto');
        Object.defineProperty(out, key, { value: copy(field.value, depth + 1), enumerable: true });
      }
    }
    active.delete(v); return Object.freeze(out);
  }
  const result = copy(value, 0);
  if (Buffer.byteLength(JSON.stringify(result), 'utf8') > MAX_DTO_BYTES) throw new Error('invalid_dto');
  return result;
}
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}
const digest = (kind, value) => createHash('sha256').update(`k12.synthetic-notebook.${kind}/v1:${canonical(value)}`).digest('hex');
const without = (value, key) => Object.fromEntries(Object.entries(value).filter(([k]) => k !== key));
const id = value => typeof value === 'string' && ID.test(value);
const hash = value => typeof value === 'string' && HASH.test(value);
const revision = value => Number.isSafeInteger(value) && value >= 0 && value < Number.MAX_SAFE_INTEGER;
function validScope(scope) {
  if (!closed(scope, ['schoolId','learnerId','grade','schoolYear','notebookId'])
    || ![scope.schoolId,scope.learnerId,scope.notebookId].every(id)
    || !/^(?:demo|synthetic)-/u.test(scope.schoolId) || !/^synthetic-/u.test(scope.learnerId) || !/^synthetic-/u.test(scope.notebookId)
    || !Number.isInteger(scope.grade) || scope.grade < 1 || scope.grade > 8 || typeof scope.schoolYear !== 'string'
    || !/^20\d{2}-20\d{2}$/u.test(scope.schoolYear)) return false;
  const [first, last] = scope.schoolYear.split('-').map(Number); return last === first + 1;
}
function sourceValid(source) {
  if (!closed(source, ['contractVersion','sourceKind','scope','catalog','policy','currentRevision','allowedTargets','receipts'])
    || source.contractVersion !== '1.0.0' || source.sourceKind !== 'synthetic_fixture' || !validScope(source.scope)) return false;
  const { catalog, policy, currentRevision } = source, asset = catalog?.asset;
  if (!closed(catalog, ['catalogId','revisionId','catalogSha256','asset']) || !id(catalog.catalogId) || !id(catalog.revisionId)
    || !closed(asset, ['assetId','revisionId','definitionSha256','purpose','classification','retentionClass','ownerId','stewardId'])
    || ![asset.assetId,asset.revisionId,asset.ownerId,asset.stewardId].every(id)
    || asset.purpose !== PURPOSE || asset.classification !== CLASSIFICATION || asset.retentionClass !== RETENTION
    || !hash(asset.definitionSha256) || digest('asset', without(asset, 'definitionSha256')) !== asset.definitionSha256
    || !hash(catalog.catalogSha256) || digest('catalog', without(catalog, 'catalogSha256')) !== catalog.catalogSha256) return false;
  if (!closed(policy, ['policyId','policySha256','purpose','classification','retentionClass','catalogSha256','limits']) || !id(policy.policyId)
    || policy.purpose !== PURPOSE || policy.classification !== CLASSIFICATION || policy.retentionClass !== RETENTION
    || policy.catalogSha256 !== catalog.catalogSha256 || !hash(policy.policySha256)
    || digest('policy', without(policy, 'policySha256')) !== policy.policySha256
    || !closed(policy.limits, Object.keys(LIMIT_PROFILES))
    || Object.entries(LIMIT_PROFILES).some(([key, values]) => !values.includes(policy.limits[key]))) return false;
  if (!closed(currentRevision, ['revision','bodySha256']) || !revision(currentRevision.revision)
    || (currentRevision.revision === 0 ? currentRevision.bodySha256 !== null : !hash(currentRevision.bodySha256))) return false;
  if (!Array.isArray(source.allowedTargets) || source.allowedTargets.length > 200 || !Array.isArray(source.receipts) || source.receipts.length > 100) return false;
  const targets = new Set();
  for (const target of source.allowedTargets) {
    if (!closed(target, ['kind','id','grade','schoolYear']) || !['question','topic'].includes(target.kind) || !id(target.id)
      || target.grade !== source.scope.grade || target.schoolYear !== source.scope.schoolYear || targets.has(`${target.kind}:${target.id}`)) return false;
    targets.add(`${target.kind}:${target.id}`);
  }
  const seen = { receiptId: new Set(), mutationId: new Set(), idempotencyKey: new Set(), resultingRevision: new Set() };
  for (const receipt of source.receipts) {
    if (!closed(receipt, ['receiptId','receiptSha256','mutationId','idempotencyKey','scopeSha256','requestSha256','bodySha256','expectedRevision','resultingRevision','policySha256','catalogSha256'])
      || ![receipt.receiptId,receipt.mutationId,receipt.idempotencyKey].every(id)
      || ![receipt.receiptSha256,receipt.scopeSha256,receipt.requestSha256,receipt.bodySha256,receipt.policySha256,receipt.catalogSha256].every(hash)
      || !revision(receipt.expectedRevision) || !Number.isSafeInteger(receipt.resultingRevision) || receipt.resultingRevision !== receipt.expectedRevision + 1
      || receipt.resultingRevision > currentRevision.revision || receipt.scopeSha256 !== digest('scope', source.scope)
      || receipt.policySha256 !== policy.policySha256 || receipt.catalogSha256 !== catalog.catalogSha256
      || digest('receipt', without(receipt, 'receiptSha256')) !== receipt.receiptSha256
      || (receipt.resultingRevision === currentRevision.revision && receipt.bodySha256 !== currentRevision.bodySha256)) return false;
    for (const key of Object.keys(seen)) { if (seen[key].has(receipt[key])) return false; seen[key].add(receipt[key]); }
  }
  return true;
}
function textValid(value, limit, allowBlank = false) {
  return typeof value === 'string' && value.length <= limit && (allowBlank || value.trim().length > 0);
}
function bodyValid(body, source) {
  const limits = source.policy.limits;
  if (!closed(body, ['text','strokes','bookmarks','notes','concerns']) || !textValid(body.text, limits.textMaxUnits, true)
    || !Array.isArray(body.strokes) || body.strokes.length > limits.strokeCount
    || !closed(body.bookmarks, ['questions','topics']) || !Array.isArray(body.bookmarks.questions) || !Array.isArray(body.bookmarks.topics)
    || body.bookmarks.questions.length + body.bookmarks.topics.length > limits.bookmarkCount
    || !Array.isArray(body.notes) || body.notes.length > limits.noteCount || !Array.isArray(body.concerns) || body.concerns.length > limits.concernCount
    || Buffer.byteLength(canonical(body), 'utf8') > limits.maxBodyBytes) return false;
  const strokeIds = new Set();
  for (const stroke of body.strokes) {
    if (!closed(stroke, ['id','color','width','points']) || !id(stroke.id) || strokeIds.has(stroke.id)
      || !NOTEBOOK_PALETTE.includes(stroke.color) || !NOTEBOOK_STROKE_WIDTHS.includes(stroke.width)
      || !Array.isArray(stroke.points) || stroke.points.length < 1 || stroke.points.length > limits.pointsPerStroke) return false;
    for (const point of stroke.points) if (!closed(point, ['x','y']) || typeof point.x !== 'number' || typeof point.y !== 'number'
      || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return false;
    strokeIds.add(stroke.id);
  }
  for (const [key, kind] of [['questions','question'],['topics','topic']]) {
    const seen = new Set();
    for (const targetId of body.bookmarks[key]) {
      if (!id(targetId) || seen.has(targetId) || !source.allowedTargets.some(target => target.kind === kind && target.id === targetId)) return false;
      seen.add(targetId);
    }
  }
  for (const key of ['notes','concerns']) {
    const seen = new Set();
    for (const note of body[key]) {
      if (!closed(note, ['id','text','grade','format']) || !id(note.id) || seen.has(note.id) || note.grade !== source.scope.grade
        || note.format !== 'plain_text' || !textValid(note.text, limits.textMaxUnits)) return false;
      seen.add(note.id);
    }
  }
  return true;
}
function failure(code) {
  return Object.freeze({ valid: false, error: Object.freeze({ code }), syntheticOnly: true, persistence: 'not_implemented', authentication: 'not_implemented', productionReady: false });
}

/** Server composition boundary, not a resolver endpoint or access decision. */
export function createSyntheticNotebookSyncPreparer(serverResolved) {
  let source;
  try { source = snapshot(serverResolved); if (!sourceValid(source)) throw new Error('invalid_source'); }
  catch { throw new Error('invalid_synthetic_notebook_resolver'); }
  const scopeSha256 = digest('scope', source.scope);
  function prepare(clientRequest) {
    if (!closed(clientRequest, CLIENT_FIELDS)) return failure('notebook_request_invalid');
    const d = Object.getOwnPropertyDescriptors(clientRequest);
    const metadata = Object.fromEntries(CLIENT_FIELDS.filter(key => key !== 'body').map(key => [key, d[key].value]));
    if (metadata.contractVersion !== '1.0.0' || !id(metadata.mutationId) || !id(metadata.idempotencyKey) || !revision(metadata.expectedRevision)) return failure('notebook_request_invalid');
    let body;
    try { body = snapshot(d.body.value); if (!bodyValid(body, source)) return failure('notebook_body_invalid'); }
    catch { return failure('notebook_body_invalid'); }
    const bodySha256 = digest('body', body), requestSha256 = digest('request', { scopeSha256, ...metadata, body });
    const byKey = source.receipts.find(r => r.idempotencyKey === metadata.idempotencyKey);
    const byMutation = source.receipts.find(r => r.mutationId === metadata.mutationId);
    const existing = byKey ?? byMutation;
    if (existing && (!byKey || !byMutation || byKey !== byMutation || existing.requestSha256 !== requestSha256
      || existing.bodySha256 !== bodySha256 || existing.expectedRevision !== metadata.expectedRevision)) return failure('notebook_idempotency_conflict');
    if (!existing && metadata.expectedRevision !== source.currentRevision.revision) return failure('notebook_revision_conflict');
    const { catalog, policy } = source;
    const intent = { contractVersion: '1.0.0', scope: source.scope, scopeSha256, mutationId: metadata.mutationId, idempotencyKey: metadata.idempotencyKey,
      expectedRevision: metadata.expectedRevision, nextRevision: existing ? existing.resultingRevision : metadata.expectedRevision + 1,
      priorBodySha256: existing ? null : source.currentRevision.bodySha256, body, bodySha256, requestSha256,
      governanceBinding: { sourceKind: 'synthetic_fixture', purpose: PURPOSE, classification: policy.classification, retentionClass: policy.retentionClass,
        ownerId: catalog.asset.ownerId, stewardId: catalog.asset.stewardId, policyId: policy.policyId, policySha256: policy.policySha256,
        catalogId: catalog.catalogId, catalogRevisionId: catalog.revisionId, catalogSha256: catalog.catalogSha256,
        assetId: catalog.asset.assetId, assetRevisionId: catalog.asset.revisionId, definitionSha256: catalog.asset.definitionSha256,
        targetCatalogSha256: digest('targets', { scopeSha256, targets: source.allowedTargets }), catalogState: 'declared_synthetic_reference', limits: policy.limits },
      historicalReceipt: existing ? { receiptId: existing.receiptId, receiptSha256: existing.receiptSha256 } : null };
    intent.intentSha256 = digest('intent', intent);
    return Object.freeze({ valid: true, decision: existing ? 'prepare_exact_replay' : 'prepare_replace', intent: snapshot(intent),
      syntheticOnly: true, persistence: 'not_implemented', authentication: 'not_implemented', productionReady: false });
  }
  return Object.freeze({ prepare });
}
