import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6FactorEvidenceDraft } from '../packages/content-factory/grade6_factor_evidence_draft.mjs';
import { createGrade6ReferenceAuthoringPlan } from '../packages/content-factory/grade6_reference_authoring_plan.mjs';

const api = await import('../packages/content-factory/grade6_factor_evidence_editor_view.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement] = await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement'].map(load));
const clone = value => structuredClone(value);
function source() { return { formObservations: clone(forms), semanticMatrix: clone(matrix), sourceScopeInput: {
  archives: [clone(main), clone(supplement)], selection: { sources: [], inventory: [] },
  downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: clone(forms) } }; }
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
function rehash(value) {
  value.contentSha256 = createHash('sha256').update(`k12.grade6-factor-evidence.draft/v1:${JSON.stringify(canonical(
    Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256'))))}`).digest('hex');
  return value;
}
function render(candidate, input) {
  assert.equal(typeof api.renderGrade6FactorEvidenceEditorView, 'function', 'factor evidence editor renderer is missing');
  return api.renderGrade6FactorEvidenceEditorView(candidate, input);
}
function view() { const input = source(); return render(createGrade6FactorEvidenceDraft(input), input); }

// A narrow parser for the actual emitted HTML tree, not a production HTML source
// grep or a browser acceptance substitute. Expected cell values below are literal.
const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39);/gu, value => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[value]);
function tree(html) {
  const root = { tag: '#root', attrs: {}, children: [] }, stack = [root];
  const voids = new Set(['meta', 'link', 'br', 'hr', 'input', 'img', 'source']);
  for (const token of html.match(/<![^>]*>|<[^>]*>|[^<]+/gu) ?? []) {
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) { assert.equal(stack.pop().tag, token.slice(2, -1).trim()); continue; }
    if (token.startsWith('<')) {
      const match = /^<([a-z][a-z0-9-]*)([\s\S]*?)>$/u.exec(token); assert.ok(match, 'well-formed emitted element');
      const attrs = {};
      for (const item of match[2].matchAll(/([a-z][a-z0-9:-]*)(?:="([^"]*)")?/gu)) attrs[item[1]] = item[2] === undefined ? true : decode(item[2]);
      const node = { tag: match[1], attrs, children: [] }; stack.at(-1).children.push(node);
      if (!voids.has(node.tag)) stack.push(node);
    } else stack.at(-1).children.push(decode(token));
  }
  assert.equal(stack.length, 1); return root;
}
function all(node, tag) { return (typeof node === 'string' ? [] : [node, ...node.children.flatMap(child => all(child, tag))]).filter(item => item.tag === tag); }
const text = node => typeof node === 'string' ? node : node.children.map(text).join('').replace(/\s+/gu, ' ').trim();
const cells = table => all(table, 'tbody').flatMap(body => all(body, 'tr').map(row => row.children
  .filter(item => typeof item !== 'string' && ['th', 'td'].includes(item.tag)).map(text)));
const expectedPairs = [['1', '36', '36'], ['2', '18', '36'], ['3', '12', '36'], ['4', '9', '36'], ['6', '6', '36']];

// Break: a static placeholder or three numeric clones substitutes for the four evidence boards.
test('emitted HTML contains four separate semantic factor tables with the independently expected rows', () => {
  const output = view(), document = tree(output.html), tables = all(document, 'table');
  assert.equal(tables.length, 4); assert.deepEqual(tables.map(table => table.attrs.id), ['board-a-table', 'board-b-table', 'board-c-table', 'board-d-table']);
  assert.deepEqual(tables.map(cells), [expectedPairs, expectedPairs.slice(0, 4), expectedPairs, expectedPairs]);
  for (const table of tables) {
    assert.equal(all(table, 'caption').length, 1); assert.equal(all(table, 'thead').length, 1); assert.equal(all(table, 'tbody').length, 1);
    assert.equal(all(all(table, 'thead')[0], 'th').every(cell => cell.attrs.scope === 'col'), true);
    assert.equal(all(all(table, 'tbody')[0], 'th').every(cell => cell.attrs.scope === 'row'), true);
  }
  assert.equal(output.manifest.boardCount, 4); assert.equal(output.manifest.factorPairRowCount, 19);
});

// Break: prime badges are deduplicated or normalized, concealing the original wrong strategies.
test('each emitted board preserves its literal prime badges and sum including authored wrong evidence', () => {
  const document = tree(view().html), boards = all(document, 'article');
  assert.deepEqual(boards.map(board => board.attrs['data-board-id']), ['board-a', 'board-b', 'board-c', 'board-d']);
  assert.deepEqual(boards.map(board => all(board, 'li').map(text)), [['1', '2', '3'], ['2', '3'], ['2', '3'], ['2', '2', '3', '3']]);
  assert.deepEqual(boards.map(board => all(board, 'output').map(text)), [['6'], ['5'], ['5'], ['10']]);
  assert.equal(view().manifest.primeBadgeCount, 11);
});

// Break: a color, label, checkbox or correctness attribute reveals the answer before the optional solution is opened.
test('default cards have identical neutral structure and no selected or correct answer marker', () => {
  const document = tree(view().html), boards = all(document, 'article');
  assert.equal(new Set(boards.map(board => board.attrs.class)).size, 1);
  for (const board of boards) {
    assert.equal(Object.keys(board.attrs).some(key => /correct|selected|checked|answer/iu.test(key)), false);
    assert.equal(all(board, 'input').length, 0);
    assert.equal(text(board).includes('Doğru pano'), false);
    assert.equal(text(board).includes('Yanlış pano'), false);
  }
  const details = all(document, 'details'); assert.equal(details.length, 1); assert.equal(Object.hasOwn(details[0].attrs, 'open'), false);
  assert.equal(all(document, 'script').length, 0); assert.equal(view().manifest.defaultAnswerMarked, false);
  assert.equal(view().manifest.answerBearingEditorArtifact, true); assert.equal(view().manifest.hiddenDetailsAreLearnerSecurity, false);
});

// Break: computation-only captions replace the requested goal, reason, result meaning and conditional shortcut.
test('one closed solution includes goal givens reasons three result meanings conditions shortcut and transfer', () => {
  const solution = all(tree(view().html), 'details')[0];
  assert.equal(all(solution, 'summary').length, 1);
  const roles = all(solution, 'section').map(node => node.attrs['data-solution-part']);
  for (const name of ['goal', 'given', 'route', 'because', 'conditions', 'steps', 'shortcut', 'transfer', 'answer']) assert.ok(roles.includes(name));
  const steps = all(solution, 'ol')[0]; assert.equal(steps.children.filter(node => typeof node !== 'string' && node.tag === 'li').length, 3);
  const resultNodes = all(solution, 'p').filter(node => node.attrs['data-result']);
  assert.deepEqual(resultNodes.map(node => node.attrs['data-result']), ['complete-pairs', 'distinct-primes', 'target-sum']);
  assert.deepEqual(resultNodes.map(text), ['1 × 36; 2 × 18; 3 × 12; 4 × 9; 6 × 6', '2, 3', '5']);
  const transfer = all(solution, 'section').find(node => node.attrs['data-solution-part'] === 'transfer');
  assert.equal(text(transfer).includes('1 × 1'), true); assert.equal(text(transfer).includes('0'), true);
  const answer = all(solution, 'section').find(node => node.attrs['data-solution-part'] === 'answer');
  assert.equal(text(answer).includes('Pano C'), true); assert.equal(view().manifest.closedSolutionCount, 1);
});

// Break: rendering changes the source draft into an accepted, published or full outcome product.
test('manifest preserves canonical lineage and pending gates without mutating the unrendered source draft', () => {
  const input = source(), draft = createGrade6FactorEvidenceDraft(input), beforeDraft = JSON.stringify(draft), beforeInput = JSON.stringify(input);
  const output = render(draft, input), manifest = output.manifest;
  assert.equal(JSON.stringify(draft), beforeDraft); assert.equal(JSON.stringify(input), beforeInput); assert.equal(draft.representation.rendered, false);
  assert.equal(output.schemaVersion, 'grade6-factor-evidence-editor-view/v1'); assert.equal(output.state, 'editor_review_only');
  assert.equal(manifest.draftContentSha256, draft.contentSha256); assert.equal(manifest.authoredTaskSha256, draft.authoredTaskSha256);
  assert.equal(manifest.planContentSha256, draft.sourceLineage.planContentSha256); assert.equal(manifest.sourceSha256, draft.sourceLineage.sourceSha256);
  assert.deepEqual(manifest.counts, { newAuthoredDrafts: 1, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(manifest.evidenceKind, 'recognition_of_given_evidence'); assert.equal(manifest.fullBriefEvidenceFulfilled, false);
  assert.equal(manifest.activeAcademicYear, null); assert.equal(manifest.programVersion, null); assert.equal(manifest.officialOutcomeCode, null);
  assert.equal(manifest.fullOutcomeCoverage, false); assert.equal(manifest.learnerEvidenceCollected, false);
  assert.equal(Object.values(manifest.gates).every(value => value === 'pending'), true);
  for (const key of ['learnerReady', 'publicationReady', 'productionReady', 'accessibilityPassed', 'nativeVisualReviewPassed', 'serializedHashIsAuthority']) assert.equal(manifest[key], false);
  assert.equal(manifest.humanApproval, null); assert.equal(manifest.freshPdfByteChecks, 0);
  const document = tree(output.html); assert.equal(all(document, 'html')[0].attrs.lang, 'tr'); assert.equal(all(document, 'h1').length, 1);
  assert.equal(text(all(document, 'h1')[0]).includes('36'), true);
  const warnings = all(document, 'aside'); assert.equal(warnings.length >= 1, true); assert.equal(text(warnings[0]).includes('öğrenci'), true);
});

// Break: arbitrary remote assets or an executable script are included in the supposedly standalone review document.
test('actual output is standalone no-script no-external-asset HTML with honest intended review viewports', () => {
  const output = view(), document = tree(output.html);
  for (const tag of ['script', 'link', 'img', 'svg', 'audio', 'video', 'iframe', 'form', 'button']) assert.equal(all(document, tag).length, 0);
  const styles = all(document, 'style'); assert.equal(styles.length, 1);
  const stylesheet = text(styles[0]); assert.equal(/(?:url\s*\(|@import|@font-face)/iu.test(stylesheet), false);
  assert.equal(all(document, 'meta').some(node => node.attrs.name === 'viewport' && node.attrs.content.includes('width=device-width')), true);
  assert.deepEqual(output.manifest.intendedReviewViewports, [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]);
  assert.deepEqual(output.manifest.activity, { htmlProduced: 1, imagesProduced: 0, audioProduced: 0, videosProduced: 0, networkCallsMade: 0, providersCalled: 0 });
});

// Break: output hashing counts calls as stock or exposes mutable manifest approval fields.
test('HTML digest bytes and immutable deterministic manifest describe one review artifact not an approval capability', () => {
  const a = view(), b = view(); assert.deepEqual(a, b);
  assert.equal(a.manifest.htmlSha256, createHash('sha256').update(a.html).digest('hex')); assert.equal(a.manifest.htmlBytes, Buffer.byteLength(a.html));
  assert.equal(a.manifest.htmlBytes <= 65536, true); assert.equal(Buffer.byteLength(JSON.stringify(a.manifest)) <= 16384, true);
  assert.equal(Object.isFrozen(a), true); assert.equal(Object.isFrozen(a.manifest.gates), true); assert.equal(Object.isFrozen(a.manifest.intendedReviewViewports[0]), true);
  assert.throws(() => { a.manifest.gates.answer = 'approved'; }, TypeError);
  assert.equal(a.manifest.repeatedCallsCreateDistinctStock, false);
  const reversed = value => Array.isArray(value) ? value.map(reversed) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reversed(value[key])])) : value;
  assert.deepEqual(render(reversed(createGrade6FactorEvidenceDraft(source())), source()), a);
});

// Break: a caller-valid hash is accepted as an alternative source, purpose, outcome or human approval.
test('rehashing changed source scope purpose gates or instructional meaning never produces HTML', () => {
  const input = source();
  for (const mutate of [d => { d.sourceLineage.sourceSha256 = 'f'.repeat(64); }, d => { d.scope.gradeCandidate = 7; },
    d => { d.scope.proposedOutcomeCodes.push('MAT.6.1.4'); }, d => { d.purpose.evidenceKind = 'learner_constructed_proof'; },
    d => { d.governance.purpose = 'learning_analytics'; }, d => { d.explanation.steps[2].meaning = 'Learner IQ'; },
    d => { d.gates.answer = 'approved'; d.humanApproval = true; d.publicationReady = true; }]) {
    const draft = clone(createGrade6FactorEvidenceDraft(input)); mutate(draft); rehash(draft);
    assert.throws(() => render(draft, input), error => error.message === 'invalid_factor_editor_view_input');
  }
});

// Break: raw answer-bearing edits bypass the independently recomputed verifier.
test('wrong keys missing square pair altered prime badges or multiple correct boards are blocked before rendering', () => {
  const input = source();
  for (const mutate of [d => { d.answerKey.boardId = 'board-a'; }, d => { d.problem.boards[2].factorPairs.pop(); },
    d => { d.problem.boards[2].primeBadges = [1, 2, 3]; }, d => { d.problem.boards[0] = { ...clone(d.problem.boards[2]), id: 'board-a' }; }]) {
    const draft = clone(createGrade6FactorEvidenceDraft(input)); mutate(draft); rehash(draft);
    assert.throws(() => render(draft, input), /invalid_factor_editor_view_input/u);
  }
});

// Break: failed markup data is echoed as HTML or in a detailed error payload.
test('literal markup payloads are rejected without an HTML or error echo even after a valid caller rehash', () => {
  for (const payload of ['</style><script>alert(1)</script>', '<img src=x onerror=alert(1)>', '&quot; onmouseover="secret"']) {
    const input = source(), draft = clone(createGrade6FactorEvidenceDraft(input)); draft.prompt = payload; rehash(draft);
    assert.throws(() => render(draft, input), error => error.message === 'invalid_factor_editor_view_input' && !error.message.includes(payload));
  }
});

// Break: getters proxies coercion hidden fields sparse arrays cycles or unbounded DTOs execute caller hooks during rendering.
test('hostile candidate objects are rejected with zero hook execution and no native exception detail', () => {
  let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'problem', { enumerable: true, get() { hooks++; return {}; } });
  const proxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; return []; } }); const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cyclic = {}; cyclic.x = cyclic;
  const hidden = clone(createGrade6FactorEvidenceDraft(source())); Object.defineProperty(hidden, 'hidden', { value: true });
  const sparse = clone(createGrade6FactorEvidenceDraft(source())); sparse.problem.boards = new Array(4);
  const huge = clone(createGrade6FactorEvidenceDraft(source())); huge.prompt = 'x'.repeat(65537);
  const coercion = { toString() { hooks++; return 'unsafe'; } };
  const nested = clone(createGrade6FactorEvidenceDraft(source())); Object.defineProperty(nested.problem.boards[0], 'primeBadges', { enumerable: true, get() { hooks++; return []; } });
  for (const candidate of [getter, proxy, revoked.proxy, cyclic, hidden, sparse, huge, coercion, nested, () => { hooks++; }, null]) {
    assert.throws(() => render(candidate, source()), error => error.message === 'invalid_factor_editor_view_input');
  }
  assert.equal(hooks, 0);
});

// Break: caller source objects or a serialized approved plan replace the real canonical metadata chain.
test('source hooks altered canonical metadata and serialized plan authority fail before artifact creation', () => {
  let hooks = 0; const valid = source(), draft = createGrade6FactorEvidenceDraft(valid);
  const getter = source(); Object.defineProperty(getter, 'formObservations', { enumerable: true, get() { hooks++; return forms; } });
  const proxy = new Proxy(source(), { get() { hooks++; }, ownKeys() { hooks++; return []; } }); const revoked = Proxy.revocable(source(), {}); revoked.revoke();
  const altered = source(); altered.formObservations.observations[0].items[3].microPurposes[0].meaning = 'Changed canonical source';
  const plan = createGrade6ReferenceAuthoringPlan(valid);
  for (const input of [getter, proxy, revoked.proxy, altered, plan, { approved: true, contentSha256: plan.contentSha256 }, null]) {
    assert.throws(() => render(draft, input), error => error.message === 'invalid_factor_editor_view_input');
  }
  assert.equal(hooks, 0);
});

// Break: extra options introduce a raw template output path approval or hook channel.
test('exact two-argument API rejects missing and extra arguments without executing their hooks', () => {
  assert.equal(typeof api.renderGrade6FactorEvidenceEditorView, 'function');
  let hooks = 0; const extra = new Proxy({}, { get() { hooks++; } });
  const input = source(), draft = createGrade6FactorEvidenceDraft(input);
  for (const args of [[], [draft], [draft, input, extra]]) assert.throws(() => api.renderGrade6FactorEvidenceEditorView(...args), /invalid_factor_editor_view_arguments/u);
  assert.equal(hooks, 0);
});

// Break: new source-scope plans alter the question or promote multiple calls into distinct product questions.
test('narrow canonical scope can render its own draft but cannot borrow a different source plan lineage', () => {
  const wide = source(), narrow = source(); narrow.sourceScopeInput.archives = [{ sources: wide.sourceScopeInput.archives.flatMap(row => row.sources)
    .filter(row => ['tymm-current-ortaokul-matematik', 'meb-archive-grade6-math-fascicle-unit1-hatay'].includes(row.id)) }];
  const a = createGrade6FactorEvidenceDraft(wide), b = createGrade6FactorEvidenceDraft(narrow);
  assert.throws(() => render(a, narrow), /invalid_factor_editor_view_input/u);
  const av = render(a, wide), bv = render(b, narrow);
  assert.notEqual(av.manifest.planContentSha256, bv.manifest.planContentSha256);
  assert.equal(av.manifest.authoredTaskSha256, bv.manifest.authoredTaskSha256);
  assert.deepEqual(all(tree(av.html), 'table').map(cells), all(tree(bv.html), 'table').map(cells));
  assert.equal(bv.manifest.counts.newAuthoredDrafts, 1); assert.equal(bv.manifest.counts.acceptedProductQuestions, 0);
});
