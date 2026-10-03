import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));
async function run(t, count) {
  const root = await mkdtemp(join(tmpdir(), 'reasoned-caption-factory-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const out = join(root, 'review');
  const child = spawnSync(process.execPath, [cli, '--count', String(count), '--out', out], { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.stderr);
  const path = join(out, 'audit.json');
  assert.ok((await stat(path)).size < 4 * 1024 * 1024, 'fixed pilot review metadata remains bounded');
  return JSON.parse(await readFile(path, 'utf8'));
}

// Catches omitted scene/cue coverage, lost transcript spans or treating
// prepared plain-text caption pages as generated narration/video.
test('normal factory prepares complete bounded caption pages for each retained question and lesson cue', async t => {
  const report = await run(t, 100);
  assert.ok(report.captionPreparation, 'normal factory caption pages not connected');
  const caption = report.captionPreparation;
  assert.equal(caption.questionCuePages.length, 12);
  assert.equal(caption.conceptCuePages.length, 1);
  for (const [plans, groups] of [[report.scenePreparation.questionPlans, caption.questionCuePages], [report.scenePreparation.conceptPlans, caption.conceptCuePages]]) {
    for (const [index, plan] of plans.entries()) {
      const group = groups[index];
      assert.equal(group.length, plan.cues.length);
      for (const [cueIndex, packet] of group.entries()) {
        assert.equal(packet.scenePlanSha256, plan.contentSha256);
        assert.equal(packet.geometrySha256, plan.geometrySha256);
        assert.equal(packet.source.contentSha256, plan.source.contentSha256);
        assert.equal(packet.trace.contentSha256, plan.trace.contentSha256);
        assert.equal(packet.job.contentSha256, plan.job.contentSha256);
        assert.equal(packet.cueIndex, cueIndex);
        assert.ok(packet.pages.length >= 1 && packet.pages.length <= 32);
        for (const page of packet.pages) {
          assert.ok(page.lines.length >= 1 && page.lines.length <= 2);
          for (const line of page.lines) assert.ok(line.length <= 62);
        }
        if (packet.fullTranscript !== null) {
          assert.equal(packet.fullTranscript, plan.cues[cueIndex].transcript);
          assert.equal(packet.pages.flatMap(page => page.lineSpans).map(span => packet.displayText.slice(span.start, span.end) + span.separatorAfter).join(''), packet.displayText);
        }
      }
    }
  }
  for (const flag of ['audioAttached','videoAttached','wordPenAlignmentVerified','publicationReady','learnerReady','productionReady']) assert.equal(caption[flag], false);
  assert.equal(caption.liveProviderCalls, 0);
  assert.equal(report.summary.published, 0);
});

// Catches the default bulk sidecar revealing current protected response
// transcripts merely because the scene plan exists or progress is complete.
test('single-candidate default caption sidecar keeps every protected cue response withheld', async t => {
  const report = await run(t, 1);
  assert.ok(report.captionPreparation, 'normal factory caption pages not connected');
  const groups = [...report.captionPreparation.questionCuePages, ...report.captionPreparation.conceptCuePages];
  const plans = [...report.scenePreparation.questionPlans, ...report.scenePreparation.conceptPlans];
  let locked = 0;
  for (const [index, plan] of plans.entries()) {
    for (const [cueIndex, cue] of plan.cues.entries()) {
      if (!['result','check_answer','summary','transfer_answer'].includes(cue.kind)) continue;
      const packet = groups[index][cueIndex]; locked++;
      assert.equal(packet.resultVisible, false);
      assert.equal(packet.fullTranscript, null);
      assert.equal(packet.fullTranscriptSha256, null);
      assert.notEqual(packet.displayText, cue.transcript);
      assert.equal(packet.pages.flatMap(page => page.lines).join(' ').includes(cue.transcript), false);
    }
  }
  assert.ok(locked >= 4);
  for (const job of [...report.mediaPreparation.questionJobs, ...report.mediaPreparation.conceptJobs]) {
    assert.equal(job.audioStatus, 'not_generated');
    assert.equal(job.videoStatus, 'not_rendered');
  }
});
