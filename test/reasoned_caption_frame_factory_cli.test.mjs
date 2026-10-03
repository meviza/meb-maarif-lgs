import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));
async function bundle(t, count) {
  const root = await mkdtemp(join(tmpdir(), 'caption-frame-factory-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const out = join(root, 'review');
  const child = spawnSync(process.execPath, [cli, '--count', String(count), '--out', out],
    { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.stderr);
  return { report: JSON.parse(await readFile(join(out, 'audit.json'), 'utf8')),
    html: await readFile(join(out, 'preview.html'), 'utf8') };
}

// Catches caption geometry being left disconnected from the normal factory,
// or a first-page SVG being advertised as a generated solution video.
test('normal factory links an initial short-caption frame to every retained question and concept source', async t => {
  const { report } = await bundle(t, 100);
  assert.ok(report.captionFramePreparation, 'visible short-caption frames not connected');
  const view = report.captionFramePreparation;
  assert.equal(view.questionFrames.length, 12);
  assert.equal(view.conceptFrames.length, 1);
  for (const [plans, packets] of [[report.scenePreparation.questionPlans, view.questionFrames],
    [report.scenePreparation.conceptPlans, view.conceptFrames]]) {
    for (const [index, plan] of plans.entries()) {
      const { frame, narrationPacket } = packets[index];
      assert.equal(frame.source.contentSha256, plan.source.contentSha256);
      assert.equal(frame.trace.contentSha256, plan.trace.contentSha256);
      assert.equal(frame.job.contentSha256, plan.job.contentSha256);
      assert.equal(frame.geometrySha256, plan.geometrySha256);
      assert.equal(frame.scenePlanSha256, plan.contentSha256);
      assert.equal(frame.cueIndex, 0);
      assert.equal(frame.pageIndex, 0);
      assert.equal(frame.resultVisible, false);
      assert.match(frame.svg, /^<svg/u);
      assert.equal(narrationPacket.fullTranscript, plan.cues[0].transcript);
    }
  }
  for (const key of ['audioAttached', 'videoAttached', 'wordPenAlignmentVerified', 'publicationReady', 'learnerReady', 'productionReady'])
    assert.equal(view[key], false);
  assert.equal(view.liveProviderCalls, 0);
  assert.equal(report.summary.published, 0);
});

// Catches the generated editor page embedding the old dense paragraph frame
// instead of the exact live prepared first page, or never displaying it.
test('one-candidate editor preview embeds the prepared concept and worked-example caption frame SVGs', async t => {
  const { report, html } = await bundle(t, 1);
  assert.ok(report.captionFramePreparation, 'caption frame consumer missing');
  assert.ok(html.includes(report.captionFramePreparation.questionFrames[0].frame.svg));
  assert.ok(html.includes(report.captionFramePreparation.conceptFrames[0].frame.svg));
  assert.equal(report.captionFramePreparation.initialCueOnly, true);
  assert.equal(report.captionFramePreparation.pageNavigationImplemented, false);
});
