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
    ['--factor-draft','--plan'],['--factor-draft','--factor-draft'],['--factor-draft','--source','arbitrary']]) {
    const out = run(args); assert.equal(out.status, 1); assert.equal(out.stdout, ''); assert.equal(out.stderr.trim(), 'invalid_grade6_reference_authoring_args');
  }
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
