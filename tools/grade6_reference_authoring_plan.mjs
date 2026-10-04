#!/usr/bin/env node
// Fixed public metadata -> editor pre-blueprint only. No provider, source PDF,
// arbitrary path, question count, provider, approval, or file output option.
// Closed factor draft/HTML opt-ins emit one own editor task, never learner stock.
import { constants, lstat, open } from 'node:fs/promises';

const stable = (a, b) => a.dev === b.dev && a.ino === b.ino && a.size === b.size
  && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs;
async function readSnapshot(name) {
  const path = new URL(`../sources/${name}.json`, import.meta.url);
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size > 524288 || typeof constants.O_NOFOLLOW !== 'number') throw new Error('source_metadata_unavailable');
  const fd = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = await fd.stat();
    if (!stat.isFile() || !stable(before, stat)) throw new Error('source_metadata_unavailable');
    const buffer = Buffer.alloc(stat.size + 1); let size = 0;
    while (size < buffer.length) {
      const result = await fd.read(buffer, size, buffer.length - size, size);
      if (!result.bytesRead) break; size += result.bytesRead;
    }
    const after = await fd.stat(), now = await lstat(path);
    if (size !== stat.size || !stable(stat, after) || !now.isFile() || now.isSymbolicLink() || !stable(stat, now)) throw new Error('source_metadata_unavailable');
    return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(buffer.subarray(0, size)));
  } finally { await fd.close(); }
}

try {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 1 || !['--plan', '--factor-draft', '--factor-html'].includes(args[0]))) throw new Error('invalid_grade6_reference_authoring_args');
  const { createGrade6ReferenceAuthoringPlan } = await import('../packages/content-factory/grade6_reference_authoring_plan.mjs');
  const [forms, matrix, main, supplement] = await Promise.all(['grade6-question-form-observations',
    'grade6-source-semantic-candidate-matrix', 'meb-reference-registry', 'education-reference-supplement'].map(readSnapshot));
  const plannerInput = { formObservations: forms, semanticMatrix: matrix,
    sourceScopeInput: { archives: [main, supplement], selection: { sources: [], inventory: [] },
      downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: forms } };
  if (['--factor-draft', '--factor-html'].includes(args[0])) {
    const { createGrade6FactorEvidenceDraft, verifyGrade6FactorEvidenceDraft } = await import('../packages/content-factory/grade6_factor_evidence_draft.mjs');
    const draft = createGrade6FactorEvidenceDraft(plannerInput);
    const verification = verifyGrade6FactorEvidenceDraft(draft, plannerInput);
    if (!verification.valid) throw new Error('grade6_factor_draft_audit_failed');
    if (args[0] === '--factor-html') {
      const { renderGrade6FactorEvidenceEditorView } = await import('../packages/content-factory/grade6_factor_evidence_editor_view.mjs');
      const view = renderGrade6FactorEvidenceEditorView(draft, plannerInput);
      console.log(view.html);
    } else console.log(JSON.stringify({ schemaVersion: 'grade6-factor-evidence-preview/v1', draft, verification }));
  } else {
    const plan = createGrade6ReferenceAuthoringPlan(plannerInput);
    const summary = { schemaVersion: 'grade6-reference-authoring-summary/v1', state: plan.state,
      planContentSha256: plan.contentSha256, counts: plan.counts, gates: plan.gates,
      briefTitles: plan.briefs.map(brief => brief.title),
      unmatchedSourceOrdinals: plan.briefs.filter(brief => !brief.proposedOutcomeCodes.length).map(brief => brief.sourceReference.ordinal),
      unsampledPriorityOutcome: 'MAT.6.1.4', fullCurriculumCoveragePercent: null,
      freshPdfByteChecks: plan.lineage.sourceScope.freshPdfByteChecks, providerCallsMade: plan.activity.providersCalled,
      humanApproval: null, coverageBlueprintReady: false, productionReady: false };
    console.log(JSON.stringify(args.length ? plan : summary));
  }
} catch (error) {
  console.error(error?.message === 'invalid_grade6_reference_authoring_args' ? error.message : 'grade6_reference_authoring_failed');
  process.exitCode = 1;
}
