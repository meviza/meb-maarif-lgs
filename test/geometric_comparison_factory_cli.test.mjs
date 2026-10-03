import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));
async function report(t, count) {
  const root = await mkdtemp(join(tmpdir(), 'comparison-factory-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const child = spawnSync(process.execPath, [cli, '--count', String(count), '--out', join(root, 'review')],
    { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.stderr);
  return JSON.parse(await readFile(join(root, 'review', 'audit.json'), 'utf8'));
}

// Catches the opposite comparison direction being omitted from the normal
// factory, or treating its model rows as accepted product questions.
test('normal factory prepares both comparison directions separately from numerical question stock', async t => {
  const result = await report(t, 100);
  assert.ok(result.comparisonPreparation, 'two-direction comparison factory binding missing');
  const preparation = result.comparisonPreparation;
  assert.equal(preparation.drafts.length, 2);
  assert.deepEqual(preparation.drafts.map(d => d.direction),
    ['same_area_different_perimeter', 'same_perimeter_different_area']);
  assert.deepEqual(preparation.drafts[0].models.map(m => [m.width, m.height]), [[1, 12], [2, 6], [3, 4]]);
  assert.deepEqual(preparation.drafts[1].models.map(m => [m.width, m.height]), [[1, 7], [2, 6], [3, 5], [4, 4]]);
  for (const draft of preparation.drafts) {
    assert.ok(draft.models.every(m => m.width * m.height <= 36));
    assert.equal(draft.publicationReady, false);
    assert.equal(draft.learnerReady, false);
  }
  assert.equal(preparation.acceptedProductQuestions, 0);
  assert.equal(preparation.modelRowsAreQuestionCount, false);
  assert.equal(preparation.liveProviderCalls, 0);
  assert.equal(preparation.publicationReady, false);
  assert.equal(result.summary.producedDrafts, 12);
  assert.equal(result.summary.published, 0);
});

// Catches count=1 silently turning off topic diversity, or the source-bound
// representation being advertised as a completed narrated solution.
test('one-candidate question limit leaves comparison teaching drafts explicit and unpublished', async t => {
  const result = await report(t, 1);
  assert.ok(result.comparisonPreparation, 'comparison preparation missing at the smallest batch');
  assert.equal(result.comparisonPreparation.drafts.length, 2);
  for (const flag of ['audioAttached', 'videoAttached', 'learnerReady', 'productionReady'])
    assert.equal(result.comparisonPreparation[flag], false);
  assert.equal(result.summary.producedDrafts, 1);
  assert.equal(result.providerStatus.clef, 'not_invoked');
});
