import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const api = await import('../packages/content-factory/science_678_editor_view.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error;
});
const view = async () => {
  assert.equal(typeof api.renderScience678EditorView, 'function', 'science editor is missing');
  return api.renderScience678EditorView();
};

test('select markup uses real opening options, never attributes on closing tags', async () => {
  const source = await readFile(new URL('../packages/content-factory/science_678_editor_view.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /<\/option\s+value=/u);
});

test('fixed source-bound science editor presents 54 visuals and 450 as an unfinished target', async () => {
  const {html, manifest} = await view();
  assert.equal(manifest.authoredDrafts, 54); assert.equal(manifest.reasoningFamilies, 27);
  assert.equal(manifest.targetDrafts, 450); assert.equal(manifest.remainingDrafts, 396);
  assert.equal(manifest.publishedQuestions, 0); assert.equal(manifest.providerCallsMade, 0);
  assert.equal((html.match(/data-question-id=/gu) ?? []).length, 54);
  assert.equal((html.match(/<svg /gu) ?? []).length, 54);
  assert.match(html, /Editör pilotu/u); assert.match(html, /450 soru hedefi/u);
  assert.match(html, /54 taslak/u); assert.match(html, /396 soru/u);
  assert.match(html, /<html lang="tr"/u);
});

test('native controls support grade, branch and difficulty filters and answer/solution testing', async () => {
  const {html} = await view();
  for (const id of ['grade-filter', 'branch-filter', 'difficulty-filter', 'previous-question', 'next-question', 'check-answer', 'test-feedback']) {
    assert.match(html, new RegExp(`id="${id}"`, 'u'));
  }
  assert.match(html, /Neden bu yol\?/u);
  assert.match(html, /Ne isteniyor\?/u);
  assert.match(html, /Pratik bilgi ve püf nokta/u);
  assert.match(html, /aria-live="polite"/u);
  assert.match(html, /Yetişkin incelemesi/u);
  assert.match(html, /Öğrenci gelişimi ölçülmedi/u);
  assert.match(html, /Yalnız bu tarayıcı oturumunda/u);
});

test('renderer has pinned inline script, zero external media and correct byte/hash manifest', async () => {
  const {html, manifest} = await view();
  assert.equal(manifest.htmlBytes, Buffer.byteLength(html));
  assert.equal(manifest.htmlSha256, createHash('sha256').update(html).digest('hex'));
  assert.match(html, /default-src 'none'/u); assert.match(html, /connect-src 'none'/u);
  assert.match(html, /script-src 'sha256-[A-Za-z0-9+/=]+'/u);
  assert.doesNotMatch(html, /<script[^>]+src=|<iframe|<img|<audio|<video|@import|url\(/iu);
  assert.ok(manifest.htmlBytes < 2097152);
  assert.equal(manifest.answerBearingEditorArtifact, true);
  assert.equal(manifest.learnerReady, false); assert.equal(manifest.publicationReady, false);
  assert.equal(manifest.nativeBrowserVerified, false);
});

test('arbitrary candidate HTML, count and authority have no rendering route', async () => {
  assert.equal(typeof api.renderScience678EditorView, 'function');
  for (const arg of [null, {count: 450}, {html: '<script>alert(1)</script>'}, {approved: true}]) {
    await assert.rejects(() => api.renderScience678EditorView(arg), /invalid_science_editor_arguments/u);
  }
});

test('the answer proof is independent of the authored key, not independent of the given data', async () => {
  const {html}=await view();
  assert.doesNotMatch(html,/Model girdisinden bağımsız/u);
  assert.match(html,/Anahtardan bağımsız model hesabı/u);
});

test('tall given diagrams preserve a readable width and provide a keyboard-accessible scroll region', async () => {
  const {html}=await view();
  assert.doesNotMatch(html,/max-height:360px/u);
  assert.match(html,/min-width:520px/u);
  assert.equal((html.match(/<figure class="figure" tabindex="0"/gu)??[]).length,54);
  assert.match(html,/Görsel alanını yatay kaydır/u);
});

test('narrow metric columns wrap long Turkish labels without expanding the page viewport', async () => {
  const {html}=await view();
  assert.match(html,/\.metric strong\{[^}]*overflow-wrap:anywhere/u);
});
