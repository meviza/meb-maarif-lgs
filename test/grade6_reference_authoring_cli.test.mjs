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
  for (const args of [['--count','36000'],['--source','arbitrary'],['--provider','clef'],['--plan','--plan'],['--out','anything']]) {
    const out = run(args); assert.equal(out.status, 1); assert.equal(out.stdout, ''); assert.equal(out.stderr.trim(), 'invalid_grade6_reference_authoring_args');
  }
});
