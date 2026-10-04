import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const api = await import('../packages/content-factory/grade6_number_lesson_editor_view.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [forms, matrix, main, supplement, applications] = await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement',
  'grade6-common-relations-application-observations'].map(load));
function input() {
  return structuredClone({ referencePlannerInput: { formObservations: forms, semanticMatrix: matrix,
    sourceScopeInput: { archives: [main, supplement], selection: { sources: [], inventory: [] },
      downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: forms } },
    commonSourceBindingInput: { applicationObservations: applications, semanticMatrix: matrix,
      sourceRecord: main.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') } });
}
function render(value = input()) {
  assert.equal(typeof api.renderGrade6NumberLessonEditorView, 'function', 'number lesson editor consumer missing');
  return api.renderGrade6NumberLessonEditorView(value);
}

// Break: the view repeats the example family or hides the actual two-item pool.
test('editor places a concept lesson before one worked example and two distinct practice families', () => {
  const { html } = render();
  const stages = [...html.matchAll(/<section id="(concepts|worked-example|practice)"/gu)].map(row => row[1]);
  assert.deepEqual(stages, ['concepts', 'worked-example', 'practice']);
  assert.equal((html.match(/data-worked-family="joint_divisibility_card_classification"/gu) ?? []).length, 1);
  const practice = [...html.matchAll(/data-practice-family="([^"]+)"/gu)].map(row => row[1]);
  assert.deepEqual(practice.sort(), ['common_relation_context_unit_evidence_matching', 'complete_factor_pair_board_prime_subset_audit']);
  assert.equal(new Set(practice).size, 2);
});

// Break: absent difficulty becomes invented medium and the 10-item quota looks met.
test('editor shows every unmet band and the eight-item count deficit instead of inflating stock', () => {
  const { html, manifest } = render();
  const rows = [...html.matchAll(/<tr data-difficulty-band="([^"]+)"><th scope="row">[^<]+<\/th><td>(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><\/tr>/gu)];
  assert.deepEqual(rows.map(row => [row[1], Number(row[2]), Number(row[3]), Number(row[4])]),
    [['introductory',1,0,1], ['intermediate',3,0,3], ['advanced',3,0,3], ['challenge',3,0,3]]);
  assert.deepEqual(manifest.practice, { requestedCount:10, selectedCount:2, missingCount:8, difficultyUnassignedCount:2,
    selectionReady:false, dataMeasured:false });
  assert.equal((html.match(/Zorluk atanmadı/gu) ?? []).length, 2);
});

// Break: bare keys displace the requested given-goal-reason-shortcut explanation.
test('editor preserves causal worked explanation and scopes each hidden answer to its own source', () => {
  const { html } = render();
  for (const label of ['Ne isteniyor?', 'Verilenler neyi anlatıyor?', 'Neden bu yol?', 'Pratik bilgi ve püf nokta']) assert.ok(html.includes(label));
  const details = [...html.matchAll(/<details data-answer-source="([^"]+)"/gu)].map(row => row[1]);
  assert.equal(details.length, 3);
  assert.equal(new Set(details).size, 3);
  assert.equal(/<details[^>]*\bopen\b/u.test(html), false);
  assert.equal(html.includes('[object Object]'), false);
  assert.ok(html.includes('14, 32'));
  assert.ok(html.includes('24, 42'));
});

// Break: presentation bytes or derivative counting claims new stock/audio/publication.
test('editor manifest binds the exact HTML and keeps new question and delivery counts zero', () => {
  const { html, manifest } = render();
  assert.equal(manifest.htmlBytes, Buffer.byteLength(html));
  assert.equal(manifest.htmlSha256, createHash('sha256').update(html).digest('hex'));
  assert.ok(manifest.htmlBytes < 131072);
  assert.equal(manifest.newAuthoredQuestions, 0);
  assert.equal(manifest.existingDraftsReused, 3);
  assert.equal(manifest.publishedQuestions, 0);
  assert.equal(manifest.learnerReady, false);
  assert.equal(manifest.providerCallsMade, 0);
  assert.equal(manifest.audioGenerated, false);
  assert.equal(manifest.videoRendered, false);
  assert.equal(manifest.hiddenDetailsAreLearnerSecurity, false);
  assert.equal(/<script\b|<iframe\b|<img\b|<audio\b|<video\b/iu.test(html), false);
});

// Break: scaling the timeline to a phone shrinks its numeric labels below body type.
test('timeline keeps its labels unscaled inside a keyboard-reachable scroll region and offers equivalent text', () => {
  const { html } = render();
  assert.match(html, /class="timeline-window" role="region" tabindex="0" aria-label="Zaman şeridi; dar ekranda yatay kaydırılabilir"/u);
  assert.match(html, /\.timeline-window svg\{width:588px;max-width:none\}/u);
  assert.match(html, /6 dakikalık döngü: daire\. 8 dakikalık döngü: kare\./u);
  assert.match(html, /<rect[^>]+data-series="eight-minute"/u);
  assert.match(html, /Zaman şeridinin metin eşdeğeri/u);
});

// Break: invalid caller metadata/prose is rendered or a hostile accessor executes.
test('renderer rejects invalid sources and extra arguments before its HTML sink without hooks', () => {
  render();
  let hooks = 0;
  const getter = { get referencePlannerInput() { hooks++; throw new Error('private'); }, commonSourceBindingInput:{} };
  const proxy = new Proxy(input(), { ownKeys() { hooks++; throw new Error('private'); }, get() { hooks++; throw new Error('private'); } });
  for (const value of [getter, proxy, {...input(), lesson:'<script>private</script>'}])
    assert.throws(() => api.renderGrade6NumberLessonEditorView(value), /invalid_number_lesson_editor_input/u);
  const changed = input(); changed.commonSourceBindingInput.sourceRecord.id = 'wrong-source';
  assert.throws(() => api.renderGrade6NumberLessonEditorView(changed), /invalid_number_lesson_editor_input/u);
  assert.throws(() => api.renderGrade6NumberLessonEditorView(input(), true), /invalid_number_lesson_editor_arguments/u);
  assert.equal(hooks, 0);
});
