import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));
async function run(t, count) {
  const root = await mkdtemp(join(tmpdir(), 'reasoned-geometry-factory-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const out = join(root, 'review');
  const child = spawnSync(process.execPath, [cli, '--count', String(count), '--out', out], { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.stderr);
  return JSON.parse(await readFile(join(out, 'audit.json'), 'utf8'));
}

// Break caught: the ordinary factory omits geometry or binds a serialized,
// stale, fabricated source instead of the actual retained draft and live trace.
test('normal factory resolves retained source geometry without making new video or publication claims', async t => {
  const report = await run(t, 100);
  assert.ok(report.geometryPreparation, 'normal factory geometry gate not connected');
  const geometry = report.geometryPreparation;
  assert.equal(report.summary.producedDrafts, 12);
  assert.equal(report.summary.rejected, 88);
  assert.equal(geometry.questionBindings.length, 12);
  assert.equal(geometry.conceptBindings.length, 1);
  for (const [index, binding] of geometry.questionBindings.entries()) {
    assert.equal(binding.source.contentSha256, report.items[index].contentSha256);
    assert.equal(binding.trace.contentSha256, report.reasonedTeaching.questionTraces[index].contentSha256);
    assert.equal(binding.job.contentSha256, report.mediaPreparation.questionJobs[index].contentSha256);
    assert.equal(binding.assets[0].svg, report.items[index].visual.svg);
    assert.ok(binding.cues.every(cue => cue.displayAnchorIds.every(id => binding.anchors.some(anchor => anchor.id === id))));
    assert.equal(binding.models[0].instances[0].pixelsPerLengthUnit, null);
    assert.equal(binding.rendererBound, false);
    assert.equal(binding.videoRendered, false);
    assert.equal(binding.teacherApproved, false);
    assert.equal(binding.publicationReady, false);
    assert.equal(binding.learnerReady, false);
    assert.equal(binding.productionReady, false);
  }
  const concept = geometry.conceptBindings[0];
  assert.equal(concept.source.contentSha256, report.reasonedTeaching.conceptSource.contentSha256);
  assert.equal(concept.trace.contentSha256, report.reasonedTeaching.conceptLessons[0].contentSha256);
  assert.equal(concept.job.contentSha256, report.mediaPreparation.conceptJobs[0].contentSha256);
  assert.deepEqual(concept.assets.map(asset => asset.svg), report.reasonedTeaching.conceptSource.visuals.map(visual => visual.svg));
  assert.deepEqual(concept.models[0].instances.map(instance => instance.pixelsPerLengthUnit), [42, 26]);
  assert.equal(concept.models[1].instances[0].pixelsPerLengthUnit, 26);
  assert.deepEqual(concept.anchors.filter(anchor => anchor.origin === 'result').slice(0, 4).map(anchor => anchor.value), [20, 24, 24, 22]);
  for (const flag of ['rendererBound', 'audioAttached', 'videoAttached', 'publicationReady', 'learnerReady', 'productionReady']) {
    assert.equal(geometry[flag], false);
  }
  assert.equal(geometry.liveProviderCalls, 0);
  assert.equal(report.publicationGate.state, 'closed');
  assert.equal(report.providerStatus.clef, 'not_invoked');
});

// Break caught: resolving one draft silently changes its source job state,
// invents a physical scale or substitutes the original for a transfer diagram.
test('single candidate keeps original jobs unresolved and transfer geometry explicitly pending', async t => {
  const report = await run(t, 1);
  assert.ok(report.geometryPreparation, 'normal factory geometry gate not connected');
  assert.equal(report.geometryPreparation.questionBindings.length, 1);
  assert.equal(report.geometryPreparation.conceptBindings.length, 1);
  const binding = report.geometryPreparation.questionBindings[0];
  assert.deepEqual(binding.anchors.filter(anchor => anchor.origin === 'result').map(anchor => [anchor.value, anchor.unit]), [[4, 'cm'], [8, 'cm']]);
  assert.deepEqual(binding.models[0].instances[0].bounds, { x: 65, y: 85, width: 400, height: 165 });
  assert.equal(binding.models[0].instances[0].notToScale, true);
  for (const job of [...report.mediaPreparation.questionJobs, ...report.mediaPreparation.conceptJobs]) {
    assert.equal(job.geometryStatus, 'source_geometry_not_resolved');
    assert.equal(job.publicationReady, false);
  }
  for (const result of [...report.geometryPreparation.questionBindings, ...report.geometryPreparation.conceptBindings]) {
    const transfers = result.cues.filter(cue => cue.kind.startsWith('transfer_'));
    assert.ok(transfers.length > 0);
    assert.ok(transfers.every(cue => cue.representationStatus === 'unsupported_new_geometry_pending'));
  }
});
