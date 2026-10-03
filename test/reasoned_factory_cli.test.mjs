import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));
async function run(t, count) {
  const root = await mkdtemp(join(tmpdir(), 'reasoned-factory-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const out = join(root, 'review');
  const child = spawnSync(process.execPath, [cli, '--count', String(count), '--out', out], { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.stderr);
  return { report: JSON.parse(await readFile(join(out, 'audit.json'), 'utf8')), html: await readFile(join(out, 'preview.html'), 'utf8') };
}

// Break caught: generating questions through the normal CLI while silently
// bypassing the new per-item reasoning gate or misreporting approvals.
test('the real factory CLI gates every retained question through source-bound reasoning', async t => {
  const { report } = await run(t, 12);
  assert.ok(report.reasonedTeaching, 'factory reasoning gate not connected');
  assert.equal(report.reasonedTeaching.questionTraces.length, 12);
  assert.equal(report.reasonedTeaching.summary.reasonedQuestionDrafts, 12);
  assert.equal(report.reasonedTeaching.summary.expertApproved, 0);
  assert.equal(report.reasonedTeaching.summary.published, 0);
  assert.equal(report.reasonedTeaching.summary.liveProviderCalls, 0);
  assert.deepEqual(report.reasonedTeaching.questionTraces[0].steps.map(s => s.result.value), [4, 8]);
  for (const [index, trace] of report.reasonedTeaching.questionTraces.entries()) {
    assert.equal(trace.source.contentSha256, report.items[index].contentSha256);
    assert.equal(trace.publicationReady, false);
    assert.equal(report.reasonedTeaching.questionAudits[index].semanticReview, 'pending');
  }
  assert.equal(report.publicationGate.state, 'closed');
});

// Break caught: counting all 100 numeric candidates as accepted originals, or
// using the same question solution as the only lesson instead of concept work.
test('a 100 candidate job keeps diversity limits and adds a separate concept counterexample trace', async t => {
  const { report } = await run(t, 100);
  assert.equal(report.summary.requested, 100);
  assert.equal(report.summary.producedDrafts, 12);
  assert.ok(report.reasonedTeaching, 'factory reasoning gate not connected');
  assert.equal(report.reasonedTeaching.questionTraces.length, 12);
  assert.equal(report.reasonedTeaching.conceptLessons.length, 1);
  const lesson = report.reasonedTeaching.conceptLessons[0];
  assert.equal(lesson.kind, 'concept_lesson');
  assert.deepEqual(lesson.steps.slice(0, 4).map(s => s.result.value), [20, 24, 24, 22]);
  assert.equal(lesson.mediaStatus, 'new_narration_not_generated');
  assert.equal(report.reasonedTeaching.summary.reasonedConceptDrafts, 1);
});

// Structural artifact check accompanies real browser acceptance. It catches
// the CLI omitting the actual explanations/transfer controls from the review.
test('the generated editor page includes reason-first and transfer panels without claiming new media', async t => {
  const { html } = await run(t, 6);
  assert.match(html, /data-reasoned-review/u);
  assert.match(html, /data-reveal-reason/u);
  assert.match(html, /Neden bu yolu/u);
  assert.match(html, /Başka bir durumda/u);
  assert.match(html, /Konu anlatımı.*karşı örnek/u);
  assert.match(html, /Yeni gerekçe metinleri henüz seslendirilmedi/u);
  assert.doesNotMatch(html, /22 cm\. text<\/li>/u, 'internal text type must not be shown as a measurement unit');
  assert.doesNotMatch(html, /<(?:audio|video|iframe)\b/iu);
});

// Real browser AX exposed the first rectangle's description on every card.
// Only presentation IDs change: immutable source diagrams must remain intact.
test('each preview diagram has its own accessible label references without rewriting the source SVG', async t => {
  const { report, html } = await run(t, 6);
  const ids = [...html.matchAll(/\sid="([^"]+)"/gu)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'inline SVG IDs must be document-unique');
  for (const [index, item] of report.items.entries()) {
    const prefix = `question-${index + 1}`;
    assert.ok(html.includes(`aria-labelledby="${prefix}-title ${prefix}-desc"`));
    assert.ok(html.includes(`<desc id="${prefix}-desc">${item.visual.alt}</desc>`));
    assert.match(item.visual.svg, /aria-labelledby="title desc"/u);
    assert.equal(report.reasonedTeaching.questionTraces[index].source.contentSha256, item.contentSha256);
  }
});
