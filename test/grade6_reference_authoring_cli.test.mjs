import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const file = fileURLToPath(new URL('../tools/grade6_reference_authoring_plan.mjs', import.meta.url));
const run = args => spawnSync(process.execPath, [file, ...args], { encoding: 'utf8', timeout: 4000, maxBuffer: 524288 });
test('fixed authoring CLI consumes actual source snapshots and prints a pending summary, never a stock count', () => {
  const out = run([]); assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  const result = JSON.parse(out.stdout);
  assert.equal(result.schemaVersion, 'grade6-reference-authoring-summary/v1');
  assert.equal(result.state, 'editor_candidate_pre_blueprint');
  assert.equal(result.counts.plannedBriefs, 6); assert.equal(result.counts.generatedQuestions, 0); assert.equal(result.counts.acceptedProductQuestions, 0);
  assert.equal(result.briefTitles.length, 6); assert.equal(new Set(result.briefTitles).size, 6);
  assert.equal(result.fullCurriculumCoveragePercent, null); assert.equal(result.productionReady, false);
  assert.equal(result.unmatchedSourceOrdinals.join(','), '14,15'); assert.equal(result.unsampledPriorityOutcome, 'MAT.6.1.4');
  assert.equal(result.providerCallsMade, 0); assert.equal(result.freshPdfByteChecks, 0);
  assert.equal(Object.values(result.gates).every(value => value === 'pending'), true);
  assert.match(result.planContentSha256, /^[a-f0-9]{64}$/u);
});
test('fixed full plan opt-in exposes six metadata-only briefs with no approval conversion or answer key', () => {
  const out = run(['--plan']); assert.equal(out.status, 0, out.stderr);
  const result = JSON.parse(out.stdout); assert.equal(result.briefs.length, 6);
  assert.equal(result.coverageBlueprintReady, false); assert.equal(result.humanApproval, null);
  for (const brief of result.briefs) {
    assert.equal(brief.answerValidationPolicy.answerKey, null); assert.equal(brief.answerValidationPolicy.automatedVerifierPassed, false);
    assert.equal(brief.plannedRepresentation.numericInputs, null); assert.equal(brief.plannedRepresentation.imageProduced, false);
  }
});
test('authoring CLI rejects paths counts providers and unknown or duplicated flags before planning', () => {
  for (const args of [['--count','36000'],['--source','arbitrary'],['--provider','clef'],['--plan','--plan'],['--out','anything'],
    ['--factor-draft','--plan'],['--factor-draft','--factor-draft'],['--factor-draft','--source','arbitrary'],
    ['--factor-html','--plan'],['--factor-html','--factor-draft'],['--factor-html','--factor-html'],['--factor-html','--out','anything'],
    ['--common-relations-draft','--plan'],['--common-relations-draft','--common-relations-draft'],
    ['--common-relations-draft','--factor-draft'],['--common-relations-draft','--source','arbitrary'],
    ['--common-relations-draft','--count','100'],['--common-relations-draft','--provider','clef'],
    ['--common-relations-html','--plan'],['--common-relations-html','--common-relations-html'],
    ['--common-relations-html','--common-relations-draft'],['--common-relations-html','--factor-html'],
    ['--common-relations-html','--source','arbitrary'],['--common-relations-html','--provider','clef'],
    ['--common-relations-html','--count','100'],['--common-relations-html','--out','anything'],
    ['--common-relations-media','--plan'],['--common-relations-media','--common-relations-media'],
    ['--common-relations-media','--common-relations-html'],['--common-relations-media','--factor-draft'],
    ['--common-relations-media','--source','arbitrary'],['--common-relations-media','--provider','clef'],
    ['--common-relations-media','--count','100'],['--common-relations-media','--out','anything'],
    ...['--common-relations-scene','--common-relations-frame'].flatMap(flag => [[flag,'--plan'],[flag,flag],
      [flag,'--common-relations-media'],[flag,'--source','arbitrary'],[flag,'--provider','clef'],
      [flag,'--count','100'],[flag,'--out','anything'],[flag,'--reveal'],[flag,'--cue','4']])]) {
    const out = run(args); assert.equal(out.status, 1); assert.equal(out.stdout, ''); assert.equal(out.stderr.trim(), 'invalid_grade6_reference_authoring_args');
  }
});
// Break caught: a closed scene opt-in is missing, emits the answer-bearing
// preparation rather than a public scene plan, or promotes it to pupil stock.
test('closed common-relations-scene CLI emits a bounded editor plan without future narration', () => {
  const out = run(['--common-relations-scene']);
  assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  assert.ok(Buffer.byteLength(out.stdout) < 65536);
  const result = JSON.parse(out.stdout);
  assert.equal(result.schemaVersion, 'grade6-common-relations-scene-preview/v1');
  assert.equal(result.state, 'editor_scene_preparation');
  assert.equal(result.scenePlan.learnerReady, false);
  assert.equal(result.scenePlan.publicationReady, false);
  assert.equal(result.scenePlan.productionReady, false);
  assert.equal(result.scenePlan.videoRendered, false);
  assert.equal(result.scenePlan.audioGenerated, false);
  assert.equal(result.scenePlan.genericRendererSupported, false);
  assert.match(result.scenePlan.contentSha256, /^[a-f0-9]{64}$/u);
  // Full media cues are editor-only and must not escape inside the scene plan.
  assert.equal(/"(?:fullTranscript|transcript|answerKey|conditionalNote)"/u.test(JSON.stringify(result.scenePlan)), false);
});
// Break caught: frame CLI emits a serialized fake plan, future narration or an
// ungated response rather than the default source-bound current goal caption.
test('closed common-relations-frame CLI renders actual current SVG and separate current narration only', () => {
  const out = run(['--common-relations-frame']);
  assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  assert.ok(Buffer.byteLength(out.stdout) < 65536);
  const result = JSON.parse(out.stdout);
  assert.equal(result.schemaVersion, 'grade6-common-relations-frame-preview/v1');
  assert.equal(result.state, 'editor_current_cue_frame');
  assert.match(result.frame.svg, /^<svg\b/u);
  assert.equal(result.frame.contextId, 'repeat');
  assert.equal(result.frame.cueIndex, 0); assert.equal(result.frame.kind, 'goal');
  assert.equal(result.frame.progress, 0); assert.equal(result.frame.revealRequested, false);
  assert.equal(result.frame.resultVisible, false);
  assert.equal(result.frame.learnerReady, false); assert.equal(result.frame.publicationReady, false);
  assert.equal(result.frame.videoRendered, false); assert.equal(result.frame.audioGenerated, false);
  assert.equal(result.narrationPacket.transcriptVisibility, 'current_cue_only');
  assert.equal(typeof result.narrationPacket.fullTranscript, 'string');
  assert.equal(/<script\b|<image\b|<foreignObject\b|https?:\/\//u.test(result.frame.svg.replace('http://www.w3.org/2000/svg','')), false);
});
// Break caught: context narration preparation is missing, loses its oracle or
// source binding, labels text interpretation as arithmetic, or promotes jobs.
test('closed common-relations-media opt-in builds two actual pending narration jobs for one existing draft', () => {
  const out = run(['--common-relations-media']);
  assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  assert.ok(Buffer.byteLength(out.stdout) < 131072);
  const result = JSON.parse(out.stdout);
  assert.equal(result.schemaVersion, 'grade6-common-relations-media-preparation/v1');
  assert.equal(result.state, 'editor_media_preparation'); assert.equal(result.artifactAudience, 'editor_only');
  assert.equal(result.verification.valid, true); assert.equal(result.verification.localMathChecks, 'passed');
  assert.deepEqual(result.contexts.map(c => c.contextId), ['repeat', 'grouping']);
  assert.deepEqual(result.manifest.counts, {existingAuthoredDrafts:1,contextNarrationJobs:2,newAuthoredQuestions:0,acceptedProductQuestions:0,publishedQuestions:0});
  for (const context of result.contexts) {
    assert.equal(context.trace.schemaVersion, 'reasoned-teaching-trace/v1');
    assert.equal(context.trace.goal.unit, 'text'); assert.equal(context.traceAudit.numericStepsChecked, 0);
    assert.equal(context.job.schemaVersion, 'reasoned-media-job/v1');
    assert.equal(context.job.source.contentSha256, context.trace.source.contentSha256);
    assert.equal(context.job.trace.contentSha256, context.trace.contentSha256);
    assert.equal(context.job.cues.length, 10); assert.equal(context.job.provider, null);
    assert.equal(context.job.audioStatus, 'not_generated'); assert.equal(context.job.videoStatus, 'not_rendered');
    assert.equal(context.audioRequest.schemaVersion, 'reasoned-media-audio-request/v1');
    assert.equal(context.audioRequest.jobSha256, context.job.contentSha256);
    assert.equal(context.audioRequest.providerCallsAllowed, false); assert.equal(context.audioRequest.providerReady, false);
    assert.equal(context.jobAudit.voiced, false); assert.equal(context.jobAudit.rendered, false);
    assert.equal(context.jobAudit.publicationReady, false);
    assert.equal(context.trace.publicationReady, false); assert.equal(context.trace.semanticReview, 'pending');
  }
  assert.equal(result.editorView.manifest.inlineSvgCount, 1);
  assert.equal(result.editorView.manifest.groupRowCount, 6);
  assert.equal(result.editorView.manifest.publicationReady, false);
  assert.equal(Object.values(result.manifest.gates).every(v => v === 'pending'), true);
});
// Break caught: the common-relation view is unavailable, returns its JSON draft
// instead of actual SVG/tables, or adds script/external media delivery.
test('closed common-relations-html opt-in emits actual timeline and unit tables with closed editorial reasoning', () => {
  const out = run(['--common-relations-html']);
  assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  assert.ok(Buffer.byteLength(out.stdout) < 65536);
  assert.match(out.stdout, /^<!doctype html>/iu);
  assert.equal([...out.stdout.matchAll(/<svg\b/gu)].length, 1);
  assert.equal([...out.stdout.matchAll(/<table\b/gu)].length, 2);
  assert.equal([...out.stdout.matchAll(/<tbody\b/gu)].length, 2);
  assert.equal([...out.stdout.matchAll(/<script\b|<iframe\b|<img\b|<video\b|<audio\b/giu)].length, 0);
  assert.equal([...out.stdout.matchAll(/<details\b[^>]*>/gu)].length, 1);
  assert.equal(/<details\b[^>]*\bopen(?:\s|=|>)/u.test(out.stdout), false);
});
// Break caught: a distinct common-relation opt-in is missing, emits a prior
// factor task, drops the finite interval boundaries, or promotes math to stock.
test('closed common-relations opt-in binds actual application metadata and distinguishes time from group size', () => {
  const out = run(['--common-relations-draft']);
  assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  assert.ok(Buffer.byteLength(out.stdout) < 65536);
  const result = JSON.parse(out.stdout);
  assert.equal(result.schemaVersion, 'grade6-common-relations-preview/v1');
  assert.equal(result.draft.schemaVersion, 'grade6-common-relations-draft/v1');
  assert.equal(result.draft.state, 'draft'); assert.equal(result.draft.artifactAudience, 'editor_only');
  assert.equal(result.draft.counts.newAuthoredDrafts, 1);
  assert.equal(result.draft.counts.semanticFamilies, 1); assert.equal(result.draft.counts.parameterOnlyVariants, 0);
  assert.equal(result.draft.counts.acceptedProductQuestions, 0); assert.equal(result.draft.counts.publishedQuestions, 0);
  assert.deepEqual(result.draft.scope.proposedOutcomeCodes, ['MAT.6.1.4']);
  assert.equal(result.draft.scope.officialOutcomeCode, null); assert.equal(result.draft.scope.activeProgramAccepted, false);
  assert.equal(result.verification.valid, true); assert.equal(result.verification.localMathChecks, 'passed');
  assert.deepEqual(result.verification.recomputed.commonPositiveTimes, [24, 48]);
  assert.deepEqual(result.verification.recomputed.commonPositiveGroupSizes, [1, 2, 3, 4, 6, 12]);
  assert.equal(result.verification.humanApproval, null);
  assert.equal(result.verification.learnerReady, false); assert.equal(result.verification.publicationReady, false);
  assert.equal(result.draft.activity.providersCalled, 0); assert.equal(result.draft.activity.downloadsMade, 0);
  assert.equal(Object.values(result.draft.gates).every(value => value === 'pending'), true);
});
// Break caught: the HTML opt-in is unimplemented, returns a plan instead of
// actual semantic tables, or expands into script/asset/learner delivery.
test('closed factor-html opt-in renders four actual evidence tables with initially closed editorial reasoning', () => {
  const out = run(['--factor-html']);
  assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  assert.ok(Buffer.byteLength(out.stdout) < 65536);
  assert.match(out.stdout, /^<!doctype html>/iu);
  assert.equal([...out.stdout.matchAll(/<table\b/gu)].length, 4);
  assert.equal([...out.stdout.matchAll(/<tbody\b/gu)].length, 4);
  assert.equal([...out.stdout.matchAll(/<script\b|<iframe\b|<img\b|<video\b|<audio\b/giu)].length, 0);
  assert.equal([...out.stdout.matchAll(/<details\b[^>]*>/gu)].length, 1);
  assert.equal(/<details\b[^>]*\bopen(?:\s|=|>)/u.test(out.stdout), false);
  // Two factors and their product: three column headers in each of four tables.
  assert.equal([...out.stdout.matchAll(/<th\b[^>]*scope="col"/gu)].length, 12);
});
// Break caught: previewing a pending task without consuming the actual source
// planner and independently recomputing its key, or relabeling math as approval.
test('closed factor-draft opt-in emits one source-bound editor task and an independently recomputed non-approval audit', () => {
  const out = run(['--factor-draft']); assert.equal(out.status, 0, out.stderr); assert.equal(out.stderr, '');
  assert.ok(Buffer.byteLength(out.stdout) < 65536);
  const result = JSON.parse(out.stdout);
  assert.equal(result.schemaVersion, 'grade6-factor-evidence-preview/v1');
  assert.equal(result.draft.artifactAudience, 'editor_only');
  assert.equal(result.draft.counts.newAuthoredDrafts, 1); assert.equal(result.draft.counts.parameterOnlyVariants, 0);
  assert.equal(result.draft.counts.acceptedProductQuestions, 0); assert.equal(result.draft.counts.publishedQuestions, 0);
  assert.equal(result.draft.sourceLineage.sourceOrdinal, 16);
  assert.equal(result.draft.answerKey.boardId, 'board-c');
  assert.equal(result.verification.valid, true); assert.equal(result.verification.localMathChecks, 'passed');
  assert.deepEqual(result.verification.recomputed.positiveDivisors, [1,2,3,4,6,9,12,18,36]);
  assert.deepEqual(result.verification.recomputed.factorPairs, [[1,36],[2,18],[3,12],[4,9],[6,6]]);
  assert.deepEqual(result.verification.recomputed.distinctPrimeFactors, [2,3]);
  assert.equal(result.verification.recomputed.primeBadgeSum, 5);
  assert.deepEqual(result.verification.recomputed.correctBoardIds, ['board-c']);
  assert.equal(result.verification.humanApproval, null); assert.equal(result.verification.serializedHashIsAuthority, false);
  assert.equal(result.verification.learnerReady, false); assert.equal(result.verification.publicationReady, false);
  assert.equal(result.verification.counts.acceptedProductQuestions, 0);
  assert.equal(result.draft.scope.officialOutcomeCode, null); assert.equal(result.draft.scope.fullOutcomeCoverage, false);
  assert.ok(Object.values(result.draft.gates).every(value => value === 'pending'));
});
