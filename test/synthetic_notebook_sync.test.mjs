import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { createNotebook, updateNotebook } from '../packages/student/notebook.mjs';

const api = await import('../packages/contracts/synthetic_notebook_sync.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
// Independent fixture hashing: no production builders compute expectations.
const canonical = value => value === null || typeof value !== 'object' ? JSON.stringify(value)
  : Array.isArray(value) ? `[${value.map(canonical).join(',')}]`
    : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
const sha = (kind, value) => createHash('sha256').update(`k12.synthetic-notebook.${kind}/v1:${canonical(value)}`).digest('hex');
const without = (value, key) => Object.fromEntries(Object.entries(value).filter(([k]) => k !== key));
function fixture() {
  const scope = { schoolId: 'demo-school-a', learnerId: 'synthetic-student-a', grade: 6, schoolYear: '2026-2027', notebookId: 'synthetic-notebook-a' };
  const asset = { assetId: 'synthetic-notebook-asset', revisionId: 'assetrev-001', purpose: 'student_notebook',
    classification: 'sensitive_student_notebook', retentionClass: 'student-notebook-lifecycle', ownerId: 'synthetic-owner', stewardId: 'synthetic-steward' };
  asset.definitionSha256 = sha('asset', asset);
  const catalog = { catalogId: 'synthetic-notebook-catalog', revisionId: 'catalogrev-001', asset };
  catalog.catalogSha256 = sha('catalog', catalog);
  const policy = { policyId: 'synthetic-notebook-policy', purpose: 'student_notebook', classification: asset.classification,
    retentionClass: asset.retentionClass, catalogSha256: catalog.catalogSha256,
    limits: { maxBodyBytes: 131072, textMaxUnits: 4000, strokeCount: 64, pointsPerStroke: 512, bookmarkCount: 100, noteCount: 100, concernCount: 100 } };
  policy.policySha256 = sha('policy', policy);
  return { contractVersion: '1.0.0', sourceKind: 'synthetic_fixture', scope, catalog, policy,
    currentRevision: { revision: 0, bodySha256: null },
    allowedTargets: [{ kind: 'question', id: 'question-a-001', grade: 6, schoolYear: '2026-2027' },
      { kind: 'topic', id: 'topic-a-001', grade: 6, schoolYear: '2026-2027' }], receipts: [] };
}
function request() {
  return { contractVersion: '1.0.0', mutationId: 'mutation-notebook-001', idempotencyKey: 'idem-notebook-001', expectedRevision: 0,
    body: { text: 'Birim kareleri düşün.', strokes: [{ id: 'stroke-001', color: '#1c3532', width: 4, points: [{ x: 0.1, y: 0.2 }, { x: 0.8, y: 0.9 }] }],
      bookmarks: { questions: ['question-a-001'], topics: ['topic-a-001'] },
      notes: [{ id: 'note-001', text: '<img src=x onerror=alert(1)>', grade: 6, format: 'plain_text' }],
      concerns: [{ id: 'concern-001', text: 'Alan ve çevreyi tekrar ayıracağım.', grade: 6, format: 'plain_text' }] } };
}
function preparer(source = fixture()) {
  assert.equal(typeof api.createSyntheticNotebookSyncPreparer, 'function', 'separate synthetic notebook contract missing');
  return api.createSyntheticNotebookSyncPreparer(source);
}
function rehashPolicy(source) { source.policy.policySha256 = sha('policy', without(source.policy, 'policySha256')); }
function historicalReceipt(source, req) {
  const receipt = { receiptId: 'synthetic-receipt-001', mutationId: req.mutationId, idempotencyKey: req.idempotencyKey,
    scopeSha256: sha('scope', source.scope), requestSha256: sha('request', { scopeSha256: sha('scope', source.scope), ...req }),
    bodySha256: sha('body', req.body), expectedRevision: req.expectedRevision, resultingRevision: req.expectedRevision + 1,
    policySha256: source.policy.policySha256, catalogSha256: source.catalog.catalogSha256 };
  receipt.receiptSha256 = sha('receipt', receipt); return receipt;
}
function rejected(p, req, code) {
  const result = p.prepare(req); assert.equal(result.valid, false); assert.equal(result.error.code, code);
  assert.equal(Object.hasOwn(result, 'intent'), false); assert.equal(JSON.stringify(result).includes('onerror'), false);
}

test('revoked client roots return a typed invalid decision without throwing or changing the preparer', () => {
  const p = preparer(), revoked = Proxy.revocable({}, {});
  revoked.revoke();
  rejected(p, revoked.proxy, 'notebook_request_invalid');
  assert.equal(p.prepare(request()).valid, true);
  assert.equal(p.prepare(request()).intent.nextRevision, 1);
});

test('closed notebook snapshot becomes immutable hash-bound intent under a separate declared purpose', () => {
  const source = fixture(), req = request(), p = preparer(source), result = p.prepare(req);
  assert.equal(result.valid, true); assert.equal(result.decision, 'prepare_replace');
  assert.equal(result.intent.expectedRevision, 0); assert.equal(result.intent.nextRevision, 1);
  assert.equal(result.intent.scopeSha256, sha('scope', source.scope));
  assert.equal(result.intent.bodySha256, sha('body', req.body));
  assert.equal(result.intent.requestSha256, sha('request', { scopeSha256: sha('scope', source.scope), ...req }));
  assert.equal(result.intent.intentSha256, sha('intent', without(result.intent, 'intentSha256')));
  assert.equal(result.intent.governanceBinding.purpose, 'student_notebook');
  assert.equal(result.intent.governanceBinding.ownerId, 'synthetic-owner');
  assert.equal(result.intent.governanceBinding.stewardId, 'synthetic-steward');
  assert.equal(result.intent.governanceBinding.catalogState, 'declared_synthetic_reference');
  assert.equal(result.persistence, 'not_implemented'); assert.equal(result.authentication, 'not_implemented'); assert.equal(result.productionReady, false);
  assert.equal(Object.isFrozen(result.intent.body.strokes[0].points[0]), true);
  source.scope.grade = 7; source.policy.limits.textMaxUnits = 128; req.body.text = 'Tamper';
  assert.equal(result.intent.scope.grade, 6); assert.equal(result.intent.body.text, 'Birim kareleri düşün.');
  assert.equal(p.prepare(request()).intent.nextRevision, 1, 'preparation must not advance the fixed authoritative revision');
});

test('HTML-looking content stays literal plain text and no HTML payload field is accepted', () => {
  const p = preparer(), req = request(), result = p.prepare(req);
  assert.equal(result.intent.body.notes[0].text, '<img src=x onerror=alert(1)>');
  assert.equal(result.intent.body.notes[0].format, 'plain_text');
  for (const mutate of [r => { r.body.html = '<script>bad()</script>'; }, r => { r.body.notes[0].format = 'html'; },
    r => { r.body.notes[0].html = '<b>note</b>'; }, r => { r.body.concerns[0].format = 'markdown'; }]) {
    const bad = request(); mutate(bad); rejected(p, bad, 'notebook_body_invalid');
  }
});

test('two schools students grades and years bind separate scopes without caller tenant routing', () => {
  const a = fixture(), req = request(), first = preparer(a).prepare(req);
  for (const change of [{ schoolId: 'demo-school-b' }, { learnerId: 'synthetic-student-b' }, { grade: 7 }, { schoolYear: '2027-2028' }]) {
    const source = fixture(); Object.assign(source.scope, change);
    source.allowedTargets.forEach(t => { t.grade = source.scope.grade; t.schoolYear = source.scope.schoolYear; });
    const nextReq = request(); [...nextReq.body.notes, ...nextReq.body.concerns].forEach(n => { n.grade = source.scope.grade; });
    const next = preparer(source).prepare(nextReq); assert.equal(next.valid, true);
    assert.notEqual(next.intent.scopeSha256, first.intent.scopeSha256); assert.notEqual(next.intent.requestSha256, first.intent.requestSha256);
  }
  for (const key of ['tenantId','schoolId','learnerId','grade','schoolYear','scope','context','role','dbRole','trusted','published']) {
    rejected(preparer(), { ...request(), [key]: 'forged' }, 'notebook_request_invalid');
  }
});

test('foreign grade notes and unknown question or topic targets cannot enter the scoped intent', () => {
  for (const mutate of [r => { r.body.notes[0].grade = 7; }, r => { r.body.concerns[0].grade = 5; },
    r => { r.body.bookmarks.questions = ['question-school-b']; }, r => { r.body.bookmarks.topics = ['question-a-001']; }]) {
    const bad = request(); mutate(bad); rejected(preparer(), bad, 'notebook_body_invalid');
  }
  for (const mutate of [s => { s.allowedTargets[0].grade = 7; }, s => { s.allowedTargets[0].schoolYear = '2025-2026'; }]) {
    const source = fixture(); mutate(source); assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
  }
});

test('serialized memory-only state and preview flags do not replace a request or trusted server source', () => {
  const context = { schoolId: 'demo-school-a', learnerId: 'synthetic-student-a', grade: 6, schoolYear: '2026-2027' };
  const local = updateNotebook(createNotebook({ context }), { type: 'text.set', context, text: 'Local session only' });
  rejected(preparer(), JSON.parse(JSON.stringify(local)), 'notebook_request_invalid');
  assert.throws(() => preparer(JSON.parse(JSON.stringify(local))), /invalid_synthetic_notebook_resolver/u);
  for (const key of ['persisted','commitState','accessDecision','productionReady']) rejected(preparer(), { ...request(), [key]: true }, 'notebook_request_invalid');
  const req = request(); req.body = { text: local.text, strokes: local.strokes, bookmarks: local.bookmarks, notes: local.notes, concerns: local.concerns };
  assert.equal(preparer().prepare(req).valid, true, 'plain local content may be validated but supplies no authorization');
});

test('stale or ahead expected revision fails without changing the fixed preparation state', () => {
  const source = fixture(); source.currentRevision = { revision: 3, bodySha256: 'a'.repeat(64) }; const p = preparer(source);
  for (const rev of [0,2,4,999]) rejected(p, { ...request(), expectedRevision: rev }, 'notebook_revision_conflict');
  const valid = p.prepare({ ...request(), expectedRevision: 3 }); assert.equal(valid.valid, true); assert.equal(valid.intent.nextRevision, 4);
  assert.equal(p.prepare({ ...request(), expectedRevision: 3 }).intent.nextRevision, 4);
});

test('exact historical idempotency prepares replay before stale revision and never accepts a changed body', () => {
  const source = fixture(), req = request(), receipt = historicalReceipt(source, req);
  source.currentRevision = { revision: 5, bodySha256: 'b'.repeat(64) }; source.receipts = [receipt]; const p = preparer(source);
  const replay = p.prepare(req); assert.equal(replay.valid, true); assert.equal(replay.decision, 'prepare_exact_replay');
  assert.equal(replay.intent.nextRevision, 1); assert.equal(replay.intent.historicalReceipt.receiptSha256, receipt.receiptSha256);
  const changed = request(); changed.body.text = 'Another content'; rejected(p, changed, 'notebook_idempotency_conflict');
  rejected(p, { ...request(), mutationId: 'another-mutation' }, 'notebook_idempotency_conflict');
  rejected(p, { ...request(), idempotencyKey: 'another-key' }, 'notebook_idempotency_conflict');
});

test('malformed rehashed receipt scope version body and policy cannot become trusted history', () => {
  for (const mutate of [r => { r.scopeSha256 = 'f'.repeat(64); }, r => { r.resultingRevision = 0; },
    r => { r.policySha256 = 'f'.repeat(64); }, r => { r.catalogSha256 = 'f'.repeat(64); }]) {
    const source = fixture(), receipt = historicalReceipt(source, request()); mutate(receipt);
    receipt.receiptSha256 = sha('receipt', without(receipt, 'receiptSha256')); source.receipts = [receipt];
    source.currentRevision = { revision: 1, bodySha256: receipt.bodySha256 };
    assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
  }
  const source = fixture(), receipt = historicalReceipt(source, request()); source.receipts = [receipt];
  source.currentRevision = { revision: 1, bodySha256: 'c'.repeat(64) };
  assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
});

test('separate purpose classification retention owner steward and complete policy hashes are required', () => {
  for (const mutate of [s => { s.policy.purpose = 'learning_progress_sync'; }, s => { s.policy.classification = 'public'; },
    s => { s.policy.retentionClass = 'forever'; }, s => { s.catalog.asset.ownerId = ''; }, s => { s.catalog.asset.stewardId = ''; },
    s => { s.policy.catalogSha256 = 'f'.repeat(64); }, s => { s.catalog.catalogSha256 = 'f'.repeat(64); },
    s => { s.sourceKind = 'production'; }, s => { s.authorized = true; }]) {
    const source = fixture(); mutate(source); rehashPolicy(source); assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
  }
});

test('byte text and entry budgets follow server limits and cannot be widened by the client', () => {
  const source = fixture(); source.policy.limits.textMaxUnits = 128; source.policy.limits.noteCount = 10; rehashPolicy(source); const p = preparer(source);
  const max = request(); max.body.text = 'a'.repeat(128); assert.equal(p.prepare(max).valid, true);
  const excess = request(); excess.body.text = 'a'.repeat(129); rejected(p, excess, 'notebook_body_invalid');
  const notes = request(); notes.body.notes = Array.from({ length: 11 }, (_, i) => ({ id: `note-${i}`, text: 'Not', grade: 6, format: 'plain_text' }));
  rejected(p, notes, 'notebook_body_invalid');
  const huge = request(); huge.body.notes = Array.from({ length: 100 }, (_, i) => ({ id: `note-${i}`, text: 'ğ'.repeat(4000), grade: 6, format: 'plain_text' }));
  rejected(preparer(), huge, 'notebook_body_invalid');
  const over = fixture(); over.policy.limits.maxBodyBytes = 524288; rehashPolicy(over); assert.throws(() => preparer(over), /invalid_synthetic_notebook_resolver/u);
  rejected(p, { ...request(), limits: { textMaxUnits: 999999 } }, 'notebook_request_invalid');
});

test('stroke palette width count point count finite normalized coordinates and unique identifiers stay bounded', () => {
  for (const mutate of [r => { r.body.strokes[0].color = 'url(javascript:bad)'; }, r => { r.body.strokes[0].width = 300; },
    r => { r.body.strokes[0].points = []; }, r => { r.body.strokes[0].points = Array(513).fill({ x: 0, y: 1 }); },
    r => { r.body.strokes[0].points[0].x = -0.1; }, r => { r.body.strokes[0].points[0].y = 1.1; },
    r => { r.body.strokes[0].points[0].x = NaN; }, r => { r.body.strokes[0].points[0].x = Infinity; },
    r => { r.body.strokes.push(r.body.strokes[0]); }, r => { r.body.strokes = Array.from({ length: 65 }, (_, i) => ({ ...r.body.strokes[0], id: `stroke-${i}` })); }]) {
    const bad = request(); mutate(bad); rejected(preparer(), bad, 'notebook_body_invalid');
  }
  const valid = request(); valid.body.strokes[0].points = Array.from({ length: 512 }, () => ({ x: -0, y: 1 }));
  const result = preparer().prepare(valid); assert.equal(result.valid, true); assert.equal(Object.is(result.intent.body.strokes[0].points[0].x, -0), false);
});

test('arrays entries and note identifiers are closed dense unique plain data', () => {
  for (const mutate of [r => { r.body.notes.push(r.body.notes[0]); }, r => { r.body.bookmarks.questions.push('question-a-001'); },
    r => { r.body.concerns[0].text = ' '; }, r => { r.body.notes[0].id = 'bad identifier'; },
    r => { r.body.strokes[0].points.label = 'extra'; }, r => { delete r.body.strokes[0].points[0]; },
    r => { r.body.bookmarks.extra = []; }, r => { r.body.notes[0].target = 'private'; }]) {
    const bad = request(); mutate(bad); rejected(preparer(), bad, 'notebook_body_invalid');
  }
});

test('getters proxies cycles functions and hostile prototypes are denied before code or payload exposure', () => {
  let invoked = 0;
  for (const mutate of [r => { Object.defineProperty(r.body, 'text', { enumerable: true, get() { invoked++; return 'secret'; } }); },
    r => { r.body.strokes = new Proxy(r.body.strokes, { ownKeys() { invoked++; return []; } }); },
    r => { r.body.notes[0].text = () => { invoked++; }; }, r => { r.body.loop = r.body; },
    r => { Object.setPrototypeOf(r.body, { get text() { invoked++; return 'secret'; } }); }]) {
    const bad = request(); mutate(bad); rejected(preparer(), bad, 'notebook_body_invalid');
  }
  const proxy = new Proxy({}, { ownKeys() { invoked++; return []; } });
  rejected(preparer(), proxy, 'notebook_request_invalid');
  const source = fixture(); Object.defineProperty(source.policy, 'purpose', { enumerable: true, get() { invoked++; return 'student_notebook'; } });
  assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u); assert.equal(invoked, 0);
});

test('unsafe numeric revisions malformed source scope and conflicting history fail closed', () => {
  const p = preparer();
  for (const expectedRevision of [-1,0.5,'0',null,Number.MAX_SAFE_INTEGER]) rejected(p, { ...request(), expectedRevision }, 'notebook_request_invalid');
  for (const change of [{ schoolId: 'real-school' }, { learnerId: 'real-student' }, { grade: 9 }, { schoolYear: '2026-2028' }]) {
    const source = fixture(); Object.assign(source.scope, change); assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
  }
  const source = fixture(), receipt = historicalReceipt(source, request()); source.currentRevision = { revision: 1, bodySha256: receipt.bodySha256 };
  source.receipts = [receipt, { ...receipt }]; assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
});

test('an empty content snapshot prepares explicit clearing without claiming deletion or persistence', () => {
  const source = fixture(); source.currentRevision = { revision: 2, bodySha256: 'a'.repeat(64) };
  const req = request(); req.expectedRevision = 2;
  req.body = { text: '', strokes: [], bookmarks: { questions: [], topics: [] }, notes: [], concerns: [] };
  const result = preparer(source).prepare(req);
  assert.equal(result.valid, true); assert.equal(result.intent.nextRevision, 3); assert.equal(result.intent.priorBodySha256, 'a'.repeat(64));
  assert.equal(result.intent.body.text, ''); assert.equal(result.persistence, 'not_implemented');
  assert.equal(Object.hasOwn(result, 'deleted'), false);
});

test('maximum entry counts are accepted when their combined UTF-8 body stays within the independent byte budget', () => {
  const source = fixture(), req = request();
  source.allowedTargets = Array.from({ length: 100 }, (_, i) => ({ id: `question-${i}`, kind: 'question', grade: 6, schoolYear: '2026-2027' }));
  req.body.bookmarks = { questions: source.allowedTargets.map(t => t.id), topics: [] };
  req.body.strokes = Array.from({ length: 64 }, (_, i) => ({ id: `stroke-${i}`, color: '#1c3532', width: 2, points: [{ x: 0, y: 1 }] }));
  req.body.notes = Array.from({ length: 100 }, (_, i) => ({ id: `note-${i}`, text: 'Not', grade: 6, format: 'plain_text' }));
  req.body.concerns = Array.from({ length: 100 }, (_, i) => ({ id: `concern-${i}`, text: 'Tekrar', grade: 6, format: 'plain_text' }));
  const result = preparer(source).prepare(req); assert.equal(result.valid, true);
  assert.equal(result.intent.body.strokes.length, 64); assert.equal(result.intent.body.notes.length, 100);
  assert.equal(result.intent.body.concerns.length, 100); assert.equal(result.intent.body.bookmarks.questions.length, 100);
});

test('matching freshly rehashed catalog and policy cannot convert a different purpose or invalid owner into notebook governance', () => {
  for (const mutate of [s => { s.catalog.asset.purpose = s.policy.purpose = 'learning_progress_sync'; },
    s => { s.catalog.asset.ownerId = ''; }, s => { s.catalog.asset.stewardId = ''; },
    s => { s.catalog.asset.retentionClass = s.policy.retentionClass = 'forever'; }]) {
    const source = fixture(); mutate(source);
    source.catalog.asset.definitionSha256 = sha('asset', without(source.catalog.asset, 'definitionSha256'));
    source.catalog.catalogSha256 = sha('catalog', without(source.catalog, 'catalogSha256'));
    source.policy.catalogSha256 = source.catalog.catalogSha256; rehashPolicy(source);
    assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
  }
});

test('server source identity switches hostile receipts and excessive lookup arrays are rejected without side effects', () => {
  let invoked = 0;
  for (const mutate of [s => { s.dbRole = 'postgres'; }, s => { s.accessDecision = { authorized: true }; },
    s => { s.receipts = Array(101).fill({}); }, s => { s.allowedTargets = Array(201).fill(s.allowedTargets[0]); },
    s => { Object.defineProperty(s, 'scope', { enumerable: true, get() { invoked++; return fixture().scope; } }); },
    s => { s.currentRevision = new Proxy(s.currentRevision, { ownKeys() { invoked++; return []; } }); },
    s => { s.policy.limits.noteCount = 101; rehashPolicy(s); }, s => { s.catalog.asset.self = s.catalog.asset; }]) {
    const source = fixture(); mutate(source); assert.throws(() => preparer(source), /invalid_synthetic_notebook_resolver/u);
  }
  const p = preparer(), inherited = Object.create(request()); rejected(p, inherited, 'notebook_request_invalid');
  const req = request(); Object.defineProperty(req, 'mutationId', { enumerable: true, get() { invoked++; return 'secret'; } });
  rejected(p, req, 'notebook_request_invalid'); assert.equal(invoked, 0);
});
