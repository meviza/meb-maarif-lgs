import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import test from 'node:test';

const BLUEPRINT_MODULE_URL = new URL('../packages/contracts/question_coverage_blueprint.mjs', import.meta.url);

const SHA_A = 'a'.repeat(64);
const SHA_B = 'b'.repeat(64);
const SHA_C = 'c'.repeat(64);

function canonicalOutcomeEntry(overrides = {}) {
  return {
    contractVersion: '1.0.0',
    registryEntryId: 'CURR-G1-MAT-001',
    programVersion: 'TYMM-2026.1',
    grade: 1,
    courseKey: 'matematik',
    outcomeCode: 'MAT.1.1.1',
    verificationState: 'canonical_verified',
    sourceDocument: {
      sourceId: 'source_tymm_math_g1_001',
      sourceUrl: 'https://example.edu.tr/curriculum/math-grade-1',
      retrievedAt: '2026-10-03T08:00:00.000Z',
      sha256: SHA_A
    },
    canonicalReview: {
      reviewId: 'review_curriculum_001',
      reviewerId: 'curriculum_steward_001',
      reviewedAt: '2026-10-03T08:30:00.000Z'
    },
    ...overrides
  };
}

function coverageCell(weekNumber) {
  const isCriticalVisual = weekNumber === 1;
  return {
    blueprintCellId: `bpcell_g1_math_${String(weekNumber).padStart(2, '0')}`,
    registryEntryId: 'CURR-G1-MAT-001',
    outcomeCode: 'MAT.1.1.1',
    microSkillId: `micro_counting_${String(weekNumber).padStart(2, '0')}`,
    itemType: 'selected_response',
    responseMode: 'nonverbal_choice',
    cognitiveProcess: 'apply',
    difficultyBand: 'foundation',
    targetCount: 1,
    requiredVariantKeys: ['core'],
    misconceptionHypothesisIds: ['miscount_by_one'],
    visualRequirement: isCriticalVisual ? 'critical' : 'none',
    audioRequirement: 'none',
    accessibilityProfileId: isCriticalVisual ? 'a11y_visual_g1_001' : null,
    visualRightsPolicyRef: isCriticalVisual ? 'rights_visual_g1_001' : null,
    audioAccessibilityProfileId: null,
    audioRightsPolicyRef: null
  };
}

function blueprintCandidate() {
  return {
    contractVersion: '1.0.0',
    blueprintId: 'blueprint_g1_math_2026_001',
    blueprintRevisionId: 'blueprintrev_g1_math_2026_001',
    blueprintRevisionSequence: 1,
    lifecycleState: 'approved',
    blueprintSha256: null,
    academicYear: '2026-2027',
    programVersion: 'TYMM-2026.1',
    grade: 1,
    courseKey: 'matematik',
    curriculumBinding: {
      registrySnapshotId: 'curriculum_snapshot_g1_math_001',
      registrySnapshotSha256: SHA_B,
      verificationState: 'canonical_verified'
    },
    dataGovernance: {
      ownerId: 'content_owner_primary_001',
      stewardId: 'content_steward_primary_001',
      classification: 'governance_record',
      processingPurpose: 'assessment_content_planning',
      retentionClass: 'content-planning-lifecycle',
      accessPolicyId: 'policy_blueprint_editor_001'
    },
    humanApproval: {
      decisionId: 'approval_blueprint_g1_math_001',
      decisionSha256: SHA_C,
      approvedById: 'content_board_member_001',
      approvedAt: '2026-10-03T09:00:00.000Z',
      approvedBlueprintDefinitionSha256: SHA_A
    },
    weekPlans: Array.from({ length: 36 }, (_, index) => ({
      weekNumber: index + 1,
      cells: [coverageCell(index + 1)]
    }))
  };
}

function approvedItemMetadata(blueprint) {
  return blueprint.weekPlans.map(week => {
    const cell = week.cells[0];
    const visualRequired = cell.visualRequirement !== 'none';
    const weekDigestPrefix = week.weekNumber.toString(16).padStart(2, '0');
    return {
      itemId: `item_g1_math_${String(week.weekNumber).padStart(2, '0')}`,
      contentItemId: `contentitem_g1_math_${String(week.weekNumber).padStart(2, '0')}`,
      contentRevisionId: `itemrev_g1_math_${String(week.weekNumber).padStart(2, '0')}`,
      contentRevisionSha256: `${weekDigestPrefix}${'d'.repeat(62)}`,
      assetSetSha256: `${weekDigestPrefix}${'e'.repeat(62)}`,
      blueprintId: blueprint.blueprintId,
      blueprintRevisionId: blueprint.blueprintRevisionId,
      blueprintSha256: blueprint.blueprintSha256,
      blueprintCellId: cell.blueprintCellId,
      registryEntryId: cell.registryEntryId,
      outcomeCode: cell.outcomeCode,
      microSkillId: cell.microSkillId,
      itemType: cell.itemType,
      responseMode: cell.responseMode,
      cognitiveProcess: cell.cognitiveProcess,
      difficultyBand: cell.difficultyBand,
      itemState: 'approved',
      variantKey: 'core',
      misconceptionHypothesisId: 'miscount_by_one',
      visualEvidenceStatus: visualRequired ? 'verified' : 'not_applicable',
      audioEvidenceStatus: 'not_applicable',
      accessibilityProfileId: visualRequired ? cell.accessibilityProfileId : null,
      visualRightsPolicyRef: visualRequired ? cell.visualRightsPolicyRef : null,
      audioAccessibilityProfileId: null,
      audioRightsPolicyRef: null
    };
  });
}

function coverageEvaluationInput(contract, blueprint, canonicalCurriculumEntries, itemMetadata = null) {
  const scope = {
    programVersion: blueprint.programVersion,
    grade: blueprint.grade,
    courseKey: blueprint.courseKey
  };
  const canonicalCurriculumSnapshotSha256 = contract.calculateCanonicalCurriculumScopeSnapshotSha256(
    canonicalCurriculumEntries,
    scope
  );
  blueprint.curriculumBinding.registrySnapshotSha256 = canonicalCurriculumSnapshotSha256;
  if (blueprint.humanApproval !== null) {
    blueprint.humanApproval.approvedBlueprintDefinitionSha256 =
      contract.calculateQuestionCoverageBlueprintDefinitionSha256(blueprint);
  }
  blueprint.blueprintSha256 = contract.calculateQuestionCoverageBlueprintSha256(blueprint);
  return {
    contractVersion: '1.0.0',
    blueprint,
    canonicalCurriculumEntries,
    canonicalCurriculumSnapshotSha256,
    itemMetadata: itemMetadata ?? approvedItemMetadata(blueprint)
  };
}

test('evaluates a human-approved 36-week blueprint against canonical outcomes and approved item metadata', async () => {
  // Break caught: a grade/course plan could claim complete coverage without a
  // canonical curriculum binding, all 36 instructional weeks, or item-level
  // visual/accessibility and approved-state evidence.
  assert.equal(
    fs.existsSync(BLUEPRINT_MODULE_URL),
    true,
    'a closed question-coverage blueprint contract must exist before scale claims are evaluated'
  );
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()])
  );

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.report.status, 'coverage_evaluated');
  assert.equal(result.report.summary.targetCount, 36);
  assert.equal(result.report.summary.approvedItemCount, 36);
  assert.equal(result.report.summary.underTargetCellCount, 0);
  assert.equal(result.report.summary.missingRequiredVariantCellCount, 0);
  assert.equal(result.report.cells[0].coverageState, 'on_target');
  assert.equal(result.report.cells[0].missingRequiredVariantKeys.length, 0);
  assert.equal(Object.isFrozen(result.report), true);
  assert.equal(Object.isFrozen(result.report.cells), true);
  assert.equal('published' in result.report, false);
});

test('reports both a quota deficit and a required-variant deficit for the same blueprint cell', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  blueprint.weekPlans[0].cells[0].targetCount = 2;
  blueprint.weekPlans[0].cells[0].requiredVariantKeys = ['core', 'visual'];
  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()])
  );

  assert.equal(result.valid, true);
  assert.equal(result.report.coverageComplete, false);
  assert.equal(result.report.cells[0].coverageState, 'missing_required_variant');
  assert.equal(result.report.summary.underTargetCellCount, 1);
  assert.equal(result.report.summary.missingRequiredVariantCellCount, 1);
});

test('rejects a duplicate content revision instead of letting one approved item inflate a cell quota', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  blueprint.weekPlans[0].cells[0].targetCount = 2;
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  input.itemMetadata.push({
    ...input.itemMetadata[0],
    itemId: 'item_g1_math_01_duplicate_identity'
  });

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'duplicate_content_revision'), true);
});

test('rejects an alias with a different item and revision ID but the same immutable content revision digest', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  blueprint.weekPlans[0].cells[0].targetCount = 2;
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  input.itemMetadata.push({
    ...input.itemMetadata[0],
    itemId: 'item_g1_math_01_digest_alias',
    contentItemId: 'contentitem_g1_math_digest_alias',
    contentRevisionId: 'itemrev_g1_math_digest_alias'
  });

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'duplicate_content_revision_digest'), true);
});

test('requires an immutable content-item identity and revision digest before an item can count toward coverage', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  delete input.itemMetadata[0].contentItemId;
  input.itemMetadata[0].contentRevisionSha256 = 'not-a-sha256';

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'required_field_missing'), true);
  assert.equal(result.errors.some(error => error.code === 'content_revision_digest_invalid'), true);
});

test('rejects an item that names the correct outcome but a different planned micro-skill', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  input.itemMetadata[0].microSkillId = 'micro_counting_not_the_planned_skill';

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'item_micro_skill_mismatch'), true);
});

test('rejects an item that uses a different planned assessment taxonomy', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  input.itemMetadata[0].cognitiveProcess = 'remember';

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'item_assessment_taxonomy_mismatch'), true);
});

test('rejects curriculum evidence reviewed before its declared source was retrieved', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const curriculum = canonicalOutcomeEntry();
  curriculum.canonicalReview.reviewedAt = '2026-10-03T07:59:59.000Z';

  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [curriculum])
  );

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'canonical_review_before_source'), true);
});

test('rejects a human blueprint approval that predates a scoped canonical curriculum review', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  blueprint.humanApproval.approvedAt = '2026-10-03T08:29:59.000Z';
  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()])
  );

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'human_approval_before_curriculum_review'), true);
});

test('rejects an incompatible item type and response mode before a blueprint can be counted', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  blueprint.weekPlans[0].cells[0].responseMode = 'portfolio';

  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()])
  );

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'assessment_taxonomy_combination_invalid'), true);
});

test('does not evaluate a withdrawn blueprint as current coverage', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  blueprint.lifecycleState = 'withdrawn';
  blueprint.humanApproval = null;

  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()])
  );

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'blueprint_not_approved'), true);
});

test('rejects a changed blueprint definition that reuses an approval for the prior definition', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  input.blueprint.weekPlans[0].cells[0].microSkillId = 'micro_counting_changed_after_approval';
  input.blueprint.blueprintSha256 = contract.calculateQuestionCoverageBlueprintSha256(input.blueprint);
  for (const item of input.itemMetadata) {
    item.blueprintSha256 = input.blueprint.blueprintSha256;
  }

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'human_approval_definition_mismatch'), true);
});

test('rejects answer-bearing item metadata instead of treating it as planning evidence', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  input.itemMetadata[0].answerKey = 'A';

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'unexpected_field'), true);
});

test('rejects a critical visual cell when its approved item lacks the planned accessibility and rights evidence', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const input = coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()]);
  input.itemMetadata[0].visualEvidenceStatus = 'not_applicable';
  input.itemMetadata[0].accessibilityProfileId = null;
  input.itemMetadata[0].visualRightsPolicyRef = null;

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'item_representation_evidence_mismatch'), true);
});

test('requires all 36 distinct instructional weeks before coverage can be evaluated', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  blueprint.weekPlans.pop();

  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry()], [])
  );

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'instructional_week_count_invalid'), true);
});

test('rejects a coverage claim when a canonical outcome in the blueprint scope has no planned cell', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const unplannedOutcome = canonicalOutcomeEntry({
    registryEntryId: 'CURR-G1-MAT-002',
    outcomeCode: 'MAT.1.1.2'
  });

  const result = contract.evaluateQuestionCoverage(
    coverageEvaluationInput(contract, blueprint, [canonicalOutcomeEntry(), unplannedOutcome])
  );

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'canonical_outcome_unplanned'), true);
});

test('binds coverage input to the immutable canonical curriculum scope snapshot named by the blueprint', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);

  assert.equal(
    typeof contract.calculateCanonicalCurriculumScopeSnapshotSha256,
    'function',
    'coverage cannot prove complete outcome coverage without a deterministic curriculum scope snapshot digest'
  );
});

test('derives an order-independent scope digest that changes with canonical source provenance', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const first = canonicalOutcomeEntry();
  const second = canonicalOutcomeEntry({
    registryEntryId: 'CURR-G1-MAT-002',
    outcomeCode: 'MAT.1.1.2'
  });
  second.sourceDocument = {
    ...second.sourceDocument,
    sourceId: 'source_tymm_math_g1_002',
    sha256: SHA_B
  };
  second.canonicalReview = {
    ...second.canonicalReview,
    reviewId: 'review_curriculum_002'
  };
  const scope = {
    programVersion: first.programVersion,
    grade: first.grade,
    courseKey: first.courseKey
  };

  const forward = contract.calculateCanonicalCurriculumScopeSnapshotSha256([first, second], scope);
  const reverse = contract.calculateCanonicalCurriculumScopeSnapshotSha256([second, first], scope);
  const changedSource = {
    ...first,
    sourceDocument: {
      ...first.sourceDocument,
      sha256: SHA_C
    }
  };

  assert.equal(forward, reverse);
  assert.notEqual(
    contract.calculateCanonicalCurriculumScopeSnapshotSha256([changedSource, second], scope),
    forward
  );
});

test('does not execute a caller-supplied scope accessor while calculating a curriculum snapshot digest', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  let getterReads = 0;
  const unsafeScope = {
    grade: 1,
    courseKey: 'matematik'
  };
  Object.defineProperty(unsafeScope, 'programVersion', {
    enumerable: true,
    get() {
      getterReads += 1;
      return 'TYMM-2026.1';
    }
  });

  assert.equal(
    contract.calculateCanonicalCurriculumScopeSnapshotSha256([canonicalOutcomeEntry()], unsafeScope),
    null
  );
  assert.equal(getterReads, 0);
});

test('does not let post-load Array.prototype.map pollution forge a required coverage variant', () => {
  const script = `
    import { calculateCanonicalCurriculumScopeSnapshotSha256, calculateQuestionCoverageBlueprintDefinitionSha256, calculateQuestionCoverageBlueprintSha256, evaluateQuestionCoverage } from ${JSON.stringify(BLUEPRINT_MODULE_URL.href)};
    const scope = { programVersion: 'TYMM-2026.1', grade: 1, courseKey: 'matematik' };
    const curriculumEntries = [{
      contractVersion: '1.0.0', registryEntryId: 'CURR-G1-MAT-001', programVersion: scope.programVersion, grade: scope.grade, courseKey: scope.courseKey, outcomeCode: 'MAT.1.1.1', verificationState: 'canonical_verified',
      sourceDocument: { sourceId: 'source_tymm_math_g1_001', sourceUrl: 'https://example.edu.tr/curriculum/math-grade-1', retrievedAt: '2026-10-03T08:00:00.000Z', sha256: '${SHA_A}' },
      canonicalReview: { reviewId: 'review_curriculum_001', reviewerId: 'curriculum_steward_001', reviewedAt: '2026-10-03T08:30:00.000Z' }
    }];
    const weekPlans = [];
    const itemMetadata = [];
    let identity = 0;
    for (let weekNumber = 1; weekNumber <= 36; weekNumber += 1) {
      const cell = {
        blueprintCellId: 'bpcell_g1_math_' + String(weekNumber).padStart(2, '0'), registryEntryId: 'CURR-G1-MAT-001', outcomeCode: 'MAT.1.1.1', microSkillId: 'micro_counting_' + String(weekNumber).padStart(2, '0'),
        itemType: 'selected_response', responseMode: 'nonverbal_choice', cognitiveProcess: 'apply', difficultyBand: 'foundation', targetCount: weekNumber === 1 ? 2 : 1,
        requiredVariantKeys: weekNumber === 1 ? ['core', 'visual'] : ['core'], misconceptionHypothesisIds: ['miscount_by_one'], visualRequirement: 'none', audioRequirement: 'none', accessibilityProfileId: null, visualRightsPolicyRef: null, audioAccessibilityProfileId: null, audioRightsPolicyRef: null
      };
      weekPlans.push({ weekNumber, cells: [cell] });
      const addItem = () => {
        identity += 1;
        const digest = identity.toString(16).padStart(2, '0') + 'd'.repeat(62);
        itemMetadata.push({
          itemId: 'item_' + identity, contentItemId: 'contentitem_' + identity, contentRevisionId: 'itemrev_' + identity, contentRevisionSha256: digest, assetSetSha256: identity.toString(16).padStart(2, '0') + 'e'.repeat(62),
          blueprintId: 'blueprint_g1_math_2026_001', blueprintRevisionId: 'blueprintrev_g1_math_2026_001', blueprintSha256: null, blueprintCellId: cell.blueprintCellId,
          registryEntryId: cell.registryEntryId, outcomeCode: cell.outcomeCode, microSkillId: cell.microSkillId, itemType: cell.itemType, responseMode: cell.responseMode, cognitiveProcess: cell.cognitiveProcess, difficultyBand: cell.difficultyBand,
          itemState: 'approved', variantKey: 'core', misconceptionHypothesisId: 'miscount_by_one', visualEvidenceStatus: 'not_applicable', audioEvidenceStatus: 'not_applicable', accessibilityProfileId: null, visualRightsPolicyRef: null, audioAccessibilityProfileId: null, audioRightsPolicyRef: null
        });
      };
      addItem();
      if (weekNumber === 1) addItem();
    }
    const blueprint = {
      contractVersion: '1.0.0', blueprintId: 'blueprint_g1_math_2026_001', blueprintRevisionId: 'blueprintrev_g1_math_2026_001', blueprintRevisionSequence: 1, lifecycleState: 'approved', blueprintSha256: null,
      academicYear: '2026-2027', programVersion: scope.programVersion, grade: scope.grade, courseKey: scope.courseKey,
      curriculumBinding: { registrySnapshotId: 'curriculum_snapshot_g1_math_001', registrySnapshotSha256: calculateCanonicalCurriculumScopeSnapshotSha256(curriculumEntries, scope), verificationState: 'canonical_verified' },
      dataGovernance: { ownerId: 'content_owner_primary_001', stewardId: 'content_steward_primary_001', classification: 'governance_record', processingPurpose: 'assessment_content_planning', retentionClass: 'content-planning-lifecycle', accessPolicyId: 'policy_blueprint_editor_001' },
      humanApproval: { decisionId: 'approval_blueprint_g1_math_001', decisionSha256: '${SHA_C}', approvedById: 'content_board_member_001', approvedAt: '2026-10-03T09:00:00.000Z', approvedBlueprintDefinitionSha256: '${SHA_A}' },
      weekPlans
    };
    blueprint.humanApproval.approvedBlueprintDefinitionSha256 = calculateQuestionCoverageBlueprintDefinitionSha256(blueprint);
    blueprint.blueprintSha256 = calculateQuestionCoverageBlueprintSha256(blueprint);
    for (let index = 0; index < itemMetadata.length; index += 1) itemMetadata[index].blueprintSha256 = blueprint.blueprintSha256;
    Array.prototype.map = () => ['core', 'visual'];
    const result = evaluateQuestionCoverage({ contractVersion: '1.0.0', blueprint, canonicalCurriculumEntries: curriculumEntries, canonicalCurriculumSnapshotSha256: blueprint.curriculumBinding.registrySnapshotSha256, itemMetadata });
    process.stdout.write(JSON.stringify({ valid: result.valid, coverageComplete: result.report?.coverageComplete, missingRequiredVariantCellCount: result.report?.summary.missingRequiredVariantCellCount }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), {
    valid: true,
    coverageComplete: false,
    missingRequiredVariantCellCount: 1
  });
});

test('rejects a coverage evaluation whose curriculum snapshot digest differs from the approved blueprint binding', async () => {
  const contract = await import(BLUEPRINT_MODULE_URL.href);
  const blueprint = blueprintCandidate();
  const entries = [canonicalOutcomeEntry()];
  const input = coverageEvaluationInput(contract, blueprint, entries);
  input.canonicalCurriculumSnapshotSha256 = '0'.repeat(64);

  const result = contract.evaluateQuestionCoverage(input);

  assert.equal(result.valid, false);
  assert.equal(result.report, null);
  assert.equal(result.errors.some(error => error.code === 'curriculum_snapshot_binding_mismatch'), true);
});
