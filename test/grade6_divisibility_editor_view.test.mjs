import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const loadApi = async name => import(`../packages/content-factory/${name}.mjs`).catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const api = await loadApi('grade6_divisibility_editor_view');
const draftApi = await loadApi('grade6_divisibility_classification_draft');
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement] = await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement'].map(load));
const source = () => structuredClone({ formObservations: forms, semanticMatrix: matrix, sourceScopeInput: {
  archives: [main, supplement], selection: { sources: [], inventory: [] }, downloadObservations: { sources: [] },
  monthly: { sources: [], batches: [] }, formObservations: forms } });
function view(candidate, input) {
  assert.equal(typeof api.renderGrade6DivisibilityEditorView, 'function', 'divisibility editor view is missing');
  return api.renderGrade6DivisibilityEditorView(candidate, input);
}
function fixture() {
  assert.equal(typeof api.renderGrade6DivisibilityEditorView, 'function', 'divisibility editor view is missing');
  assert.equal(typeof draftApi.createGrade6DivisibilityClassificationDraft, 'function');
  const input = source();
  return { input, draft: draftApi.createGrade6DivisibilityClassificationDraft(input) };
}

// Break: the consumer shows a placeholder, merges categories, or loses a given card.
test('editor renders eight neutral own-number cards and four text-labeled categories', () => {
  const { input, draft } = fixture();
  const out = view(draft, input);
  const cards = [...out.html.matchAll(/<li class="number-card" data-card-id="([^"]+)"><span>([0-9]+)<\/span><\/li>/gu)];
  assert.deepEqual(cards.map(row => [row[1], Number(row[2])]), [['card-14',14],['card-21',21],['card-24',24],['card-25',25],['card-32',32],['card-33',33],['card-42',42],['card-47',47]]);
  assert.deepEqual([...out.html.matchAll(/<article class="category" data-category-id="([^"]+)"/gu)].map(row => row[1]), ['only-2','only-3','both','neither']);
  assert.equal(cards.some(row => /correct|selected|checked/iu.test(row[0])), false);
  assert.equal(out.manifest.cardCount, 8);
  assert.equal(out.manifest.categoryCount, 4);
});

// Break: terse arithmetic or unlabeled colors replace the causal solution and independent key.
test('closed editorial solution retains causal teaching and literal independently checked groups', () => {
  const { input, draft } = fixture(), out = view(draft, input);
  assert.match(out.html, /<details><summary>/u);
  assert.equal(/<details[^>]*\bopen\b/iu.test(out.html), false);
  const labels = ['Ne isteniyor?', 'Verilenler neyi anlatıyor?', 'Neden bu yol?', 'Ara kararların anlamı', 'Pratik bilgi ve püf nokta', 'Eksiksizlik kontrolü'];
  for (const label of labels) assert.ok(out.html.includes(label));
  const rows = [...out.html.matchAll(/<tr data-answer-category="([^"]+)"><th scope="row">([^<]+)<\/th><td>([^<]+)<\/td><\/tr>/gu)];
  assert.deepEqual(rows.map(row => [row[1],row[3]]), [['only-2','14, 32'],['only-3','21, 33'],['both','24, 42'],['neither','25, 47']]);
  assert.equal(out.manifest.answerBearingEditorArtifact, true);
  assert.equal(out.manifest.hiddenDetailsAreLearnerSecurity, false);
});

// Break: String(object-array) hides the source number, two decisions and their meaning.
test('structured intermediate results become readable number-rule decisions, never object placeholders', () => {
  const { input, draft } = fixture(), out = view(draft, input);
  assert.equal(out.html.includes('[object Object]'), false);
  for (const sentence of ['14: 2 ile evet; 3 ile hayır.', '21: 2 ile hayır; 3 ile evet.',
    '24: 2 ile evet; 3 ile evet.', '25: 2 ile hayır; 3 ile hayır.']) assert.ok(out.html.includes(sentence));
  for (const sentence of ['Yalnız 2 ile: 14, 32.', 'Yalnız 3 ile: 21, 33.', '2 ve 3 ile: 24, 42.', 'İkisiyle de değil: 25, 47.']) assert.ok(out.html.includes(sentence));
});

// Break: the view promotes one eight-card task into eight questions or into approved stock.
test('view binds actual bytes to one draft while keeping published and learner counts zero', () => {
  const { input, draft } = fixture(), out = view(draft, input);
  assert.deepEqual(out.manifest.counts, { newAuthoredDrafts: 1, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(out.manifest.draftContentSha256, draft.contentSha256);
  assert.equal(out.manifest.htmlBytes, Buffer.byteLength(out.html));
  assert.equal(out.manifest.htmlSha256, createHash('sha256').update(out.html).digest('hex'));
  assert.ok(out.manifest.htmlBytes < 65536);
  assert.equal(out.manifest.learnerReady, false);
  assert.equal(out.manifest.publicationReady, false);
  assert.equal(out.manifest.learnerEvidenceCollected, false);
  assert.equal(out.manifest.audioGenerated, false);
  assert.equal(out.manifest.videoRendered, false);
  assert.equal(out.manifest.providerCallsMade, 0);
  assert.equal(Object.isFrozen(out.manifest.counts), true);
  assert.equal(/<script\b|<iframe\b|<img\b|<audio\b|<video\b/iu.test(out.html), false);
});

// Break: invalid caller prose or altered memberships are rendered despite the verifier.
test('invalid candidates and source snapshots are rejected before the HTML sink without executing hooks', () => {
  const { input, draft } = fixture();
  const changed = structuredClone(draft); changed.solution.correctGroups[0].cardIds = ['card-21'];
  assert.throws(() => view(changed, input), /invalid_divisibility_editor_view_input/u);
  const badSource = structuredClone(input); badSource.semanticMatrix.scope.derivedMicroSkillCount = 999;
  assert.throws(() => view(draft, badSource), /invalid_divisibility_editor_view_input/u);
  let hooks = 0;
  const hostile = { get prompt() { hooks++; return '<script>alert(1)</script>'; } };
  assert.throws(() => view(hostile, input), /invalid_divisibility_editor_view_input/u);
  const proxy = new Proxy(draft, { get() { hooks++; throw new Error('private'); }, ownKeys() { hooks++; throw new Error('private'); } });
  assert.throws(() => view(proxy, input), /invalid_divisibility_editor_view_input/u);
  assert.equal(hooks, 0);
  assert.throws(() => api.renderGrade6DivisibilityEditorView(draft, input, true), /invalid_divisibility_editor_view_arguments/u);
});
