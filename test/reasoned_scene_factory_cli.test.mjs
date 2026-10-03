import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));
async function run(t, count) {
  const root = await mkdtemp(join(tmpdir(), 'reasoned-scene-factory-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const out = join(root, 'review');
  const child = spawnSync(process.execPath, [cli, '--count', String(count), '--out', out], { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.stderr);
  return JSON.parse(await readFile(join(out, 'audit.json'), 'utf8'));
}

// Break caught: normal retained drafts never reach the new source-bound frame
// renderer, or a count request becomes a false rendered-video/publication total.
test('normal factory binds every retained question and lesson to a source-bound scene plan', async t => {
  const report = await run(t, 100);
  assert.ok(report.scenePreparation, 'normal factory scene gate not connected');
  const scene = report.scenePreparation;
  assert.equal(report.summary.producedDrafts, 12);
  assert.equal(report.summary.rejected, 88);
  assert.equal(scene.questionPlans.length, 12);
  assert.equal(scene.conceptPlans.length, 1);
  for (const [index, plan] of scene.questionPlans.entries()) {
    assert.equal(plan.source.contentSha256, report.items[index].contentSha256);
    assert.equal(plan.trace.contentSha256, report.reasonedTeaching.questionTraces[index].contentSha256);
    assert.equal(plan.job.contentSha256, report.mediaPreparation.questionJobs[index].contentSha256);
    assert.equal(plan.geometrySha256, report.geometryPreparation.questionBindings[index].contentSha256);
    assert.equal(plan.assets[0].svg, report.items[index].visual.svg);
    assert.equal(plan.cues.length, report.mediaPreparation.questionJobs[index].cues.length);
    assert.equal(plan.publicationReady, false);
  }
  const concept = scene.conceptPlans[0];
  assert.equal(concept.source.contentSha256, report.reasonedTeaching.conceptSource.contentSha256);
  assert.equal(concept.geometrySha256, report.geometryPreparation.conceptBindings[0].contentSha256);
  assert.deepEqual(concept.assets.map(asset => asset.svg), report.reasonedTeaching.conceptSource.visuals.map(visual => visual.svg));
  assert.equal(scene.videoAttached, false);
  assert.equal(scene.audioAttached, false);
  assert.equal(scene.liveProviderCalls, 0);
  assert.equal(scene.publicationReady, false);
  assert.equal(scene.learnerReady, false);
  assert.equal(scene.productionReady, false);
  assert.equal(report.publicationGate.state, 'closed');
});

// Break caught: the downstream scene preparation silently advances source job
// state or fabricates new narration when there is only one retained draft.
test('single candidate scene preparation preserves unresolved source jobs and pending narration', async t => {
  const report = await run(t, 1);
  assert.ok(report.scenePreparation, 'normal factory scene gate not connected');
  assert.equal(report.scenePreparation.questionPlans.length, 1);
  assert.equal(report.scenePreparation.conceptPlans.length, 1);
  for (const job of [...report.mediaPreparation.questionJobs, ...report.mediaPreparation.conceptJobs]) {
    assert.equal(job.geometryStatus, 'source_geometry_not_resolved');
    assert.equal(job.audioStatus, 'not_generated');
    assert.equal(job.videoStatus, 'not_rendered');
  }
  assert.equal(report.providerStatus.clef, 'not_invoked');
  assert.equal(report.providerStatus.studentDataTransferred, false);
});
