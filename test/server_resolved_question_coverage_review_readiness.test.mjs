import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import test from 'node:test';

const BRIDGE_MODULE_URL = new URL('../packages/contracts/server_resolved_question_coverage_review_readiness.mjs', import.meta.url);
const PACKAGE_COVERAGE_BINDING_MODULE_URL = new URL('../packages/contracts/server_resolved_content_package_coverage_binding.mjs', import.meta.url);
const COVERAGE_MODULE_URL = new URL('../packages/contracts/question_coverage_blueprint.mjs', import.meta.url);

const SHA_A = 'a'.repeat(64);
const SHA_B = 'b'.repeat(64);
const SHA_C = 'c'.repeat(64);

const REVIEW_DETAILS = {
  academic: { role: 'academic_reviewer', evidenceKind: 'curriculum_registry_entry' },
  assessment: { role: 'assessment_reviewer', evidenceKind: 'assessment_rubric' },
  rights: { role: 'rights_reviewer', evidenceKind: 'rights_record' },
  accessibility: { role: 'accessibility_reviewer', evidenceKind: 'accessibility_record' }
};

async function loadBridge() {
  assert.equal(
    fs.existsSync(BRIDGE_MODULE_URL),
    true,
    'approved assessment items need a server-resolved coverage-to-review-readiness bridge'
  );
  return import(BRIDGE_MODULE_URL.href);
}

async function loadPackageCoverageBinding() {
  assert.equal(
    fs.existsSync(PACKAGE_COVERAGE_BINDING_MODULE_URL),
    true,
    'a package target needs a server-resolved coverage binding before a later publication or delivery phase'
  );
  return import(PACKAGE_COVERAGE_BINDING_MODULE_URL.href);
}

async function loadCoverageContract() {
  return import(COVERAGE_MODULE_URL.href);
}

function syntheticSha256(identity, fill) {
  return `${identity.toString(16).padStart(2, '0')}${fill.repeat(62)}`;
}

function canonicalOutcomeEntry() {
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
    }
  };
}

function coverageCell(weekNumber, partialCoverage) {
  const isFirstWeek = weekNumber === 1;
  return {
    blueprintCellId: `bpcell_g1_math_${String(weekNumber).padStart(2, '0')}`,
    registryEntryId: 'CURR-G1-MAT-001',
    outcomeCode: 'MAT.1.1.1',
    microSkillId: `micro_counting_${String(weekNumber).padStart(2, '0')}`,
    itemType: 'selected_response',
    responseMode: 'nonverbal_choice',
    cognitiveProcess: 'apply',
    difficultyBand: 'foundation',
    targetCount: partialCoverage && isFirstWeek ? 2 : 1,
    requiredVariantKeys: partialCoverage && isFirstWeek ? ['core', 'visual'] : ['core'],
    misconceptionHypothesisIds: ['miscount_by_one'],
    visualRequirement: 'none',
    audioRequirement: 'none',
    accessibilityProfileId: null,
    visualRightsPolicyRef: null,
    audioAccessibilityProfileId: null,
    audioRightsPolicyRef: null
  };
}

function itemMetadataFor(cell, identity) {
  return {
    itemId: `item_g1_math_${identity}`,
    contentItemId: `contentitem_g1_math_${identity}`,
    contentRevisionId: `itemrev_g1_math_${identity}`,
    contentRevisionSha256: syntheticSha256(identity, 'd'),
    assetSetSha256: syntheticSha256(identity, 'e'),
    blueprintId: 'blueprint_g1_math_2026_001',
    blueprintRevisionId: 'blueprintrev_g1_math_2026_001',
    blueprintSha256: null,
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
    visualEvidenceStatus: 'not_applicable',
    audioEvidenceStatus: 'not_applicable',
    accessibilityProfileId: null,
    visualRightsPolicyRef: null,
    audioAccessibilityProfileId: null,
    audioRightsPolicyRef: null
  };
}

function reviewDecision(item, discipline) {
  const detail = REVIEW_DETAILS[discipline];
  return {
    contractVersion: '2.0.0',
    decisionId: `decision_${discipline}_${item.itemId}`,
    reviewedRevision: {
      contentItemId: item.contentItemId,
      revisionId: item.contentRevisionId,
      sha256: item.contentRevisionSha256,
      assetSetSha256: item.assetSetSha256
    },
    contentAuthorId: 'content_author_001',
    discipline,
    outcome: 'approved',
    decidedAt: '2026-10-03T10:00:00.000Z',
    reviewPolicyVersion: 'content-review-v1',
    rationale: `${discipline} review completed.`,
    reviewer: {
      reviewerId: `${discipline}_reviewer_001`,
      role: detail.role
    },
    evidenceRefs: [{
      evidenceId: `evidence_${discipline}_${item.itemId}`,
      evidenceKind: detail.evidenceKind,
      sha256: SHA_B
    }],
    dataGovernance: {
      owner: 'content_owner_001',
      steward: 'content_steward_001',
      classification: 'governance-record',
      processingPurpose: 'content-review-traceability',
      retentionClass: 'content-lifecycle'
    }
  };
}

function releaseCandidateFor(item) {
  return {
    revision: {
      contentItemId: item.contentItemId,
      revisionId: item.contentRevisionId,
      sha256: item.contentRevisionSha256,
      assetSetSha256: item.assetSetSha256,
      lifecycleState: 'approved',
      authorId: 'content_author_001'
    },
    decisions: Object.keys(REVIEW_DETAILS).map(discipline => reviewDecision(item, discipline)),
    release: {
      releaseRequestId: `release_${item.itemId}`,
      requestedBy: 'release_manager_001',
      rollbackPlanId: `rollback_${item.itemId}`
    }
  };
}

function lifecycleSnapshotFor(item) {
  return {
    itemId: item.itemId,
    contentItemId: item.contentItemId,
    contentRevisionId: item.contentRevisionId,
    contentRevisionSha256: item.contentRevisionSha256,
    assetSetSha256: item.assetSetSha256,
    authorId: 'content_author_001',
    itemState: item.itemState,
    releaseCandidate: item.itemState === 'approved' ? releaseCandidateFor(item) : null
  };
}

function refreshLifecycleReviewSnapshotHash(candidate, bridge) {
  candidate.resolverContext.lifecycleReviewSnapshotSha256 =
    bridge.calculateResolvedLifecycleReviewSnapshotSha256(
      candidate.resolverContext,
      candidate.itemLifecycleSnapshots
    );
}

function packageTargetFor(coverageCandidate, itemIndex = 0) {
  const coverageInput = coverageCandidate.coverageEvaluationInput;
  const item = coverageInput.itemMetadata[itemIndex];
  const blueprint = coverageInput.blueprint;
  return {
    packageId: 'package_g1_math_001',
    packageManifestSha256: SHA_C,
    itemId: item.itemId,
    contentItemId: item.contentItemId,
    contentRevisionId: item.contentRevisionId,
    contentRevisionSha256: item.contentRevisionSha256,
    assetSetSha256: item.assetSetSha256,
    blueprintCellId: item.blueprintCellId,
    curriculum: {
      registryEntryId: item.registryEntryId,
      programVersion: blueprint.programVersion,
      grade: blueprint.grade,
      courseKey: blueprint.courseKey,
      outcomeCode: item.outcomeCode
    }
  };
}

async function packageCoverageBindingCandidate(
  coverageCandidate,
  packageContentTarget = packageTargetFor(coverageCandidate)
) {
  const packageBinding = await loadPackageCoverageBinding();
  const resolverContext = {
    contractVersion: '1.0.0',
    snapshotId: 'package_coverage_snapshot_g1_math_001',
    observedAt: '2026-10-03T11:30:00.000Z',
    sourcePolicyVersion: 'package-coverage-source-v1',
    packageCoverageSnapshotSha256: null
  };
  resolverContext.packageCoverageSnapshotSha256 =
    packageBinding.calculatePackageCoverageSnapshotSha256(
      resolverContext,
      packageContentTarget,
      coverageCandidate
    );
  return {
    contractVersion: '1.0.0',
    resolverContext,
    packageContentTarget,
    coverageReviewResolverInput: coverageCandidate
  };
}

function coverageEvaluationInput(coverageContract, { partialCoverage = false } = {}) {
  const canonicalCurriculumEntries = [canonicalOutcomeEntry()];
  const weekPlans = [];
  const itemMetadata = [];
  let identity = 0;
  for (let weekNumber = 1; weekNumber <= 36; weekNumber += 1) {
    const cell = coverageCell(weekNumber, partialCoverage);
    weekPlans.push({ weekNumber, cells: [cell] });
    identity += 1;
    itemMetadata.push(itemMetadataFor(cell, identity));
    if (partialCoverage && weekNumber === 1) {
      identity += 1;
      itemMetadata.push(itemMetadataFor(cell, identity));
    }
  }
  const scope = { programVersion: 'TYMM-2026.1', grade: 1, courseKey: 'matematik' };
  const blueprint = {
    contractVersion: '1.0.0',
    blueprintId: 'blueprint_g1_math_2026_001',
    blueprintRevisionId: 'blueprintrev_g1_math_2026_001',
    blueprintRevisionSequence: 1,
    lifecycleState: 'approved',
    blueprintSha256: null,
    academicYear: '2026-2027',
    programVersion: scope.programVersion,
    grade: scope.grade,
    courseKey: scope.courseKey,
    curriculumBinding: {
      registrySnapshotId: 'curriculum_snapshot_g1_math_001',
      registrySnapshotSha256: coverageContract.calculateCanonicalCurriculumScopeSnapshotSha256(canonicalCurriculumEntries, scope),
      verificationState: 'canonical_verified'
    },
    dataGovernance: {
      ownerId: 'content_owner_001',
      stewardId: 'content_steward_001',
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
    weekPlans
  };
  blueprint.humanApproval.approvedBlueprintDefinitionSha256 =
    coverageContract.calculateQuestionCoverageBlueprintDefinitionSha256(blueprint);
  blueprint.blueprintSha256 = coverageContract.calculateQuestionCoverageBlueprintSha256(blueprint);
  for (let index = 0; index < itemMetadata.length; index += 1) {
    itemMetadata[index].blueprintSha256 = blueprint.blueprintSha256;
  }
  return {
    contractVersion: '1.0.0',
    blueprint,
    canonicalCurriculumEntries,
    canonicalCurriculumSnapshotSha256: blueprint.curriculumBinding.registrySnapshotSha256,
    itemMetadata
  };
}

async function bridgeCandidate(options = {}) {
  const coverageContract = await loadCoverageContract();
  const bridge = await loadBridge();
  const coverageInput = coverageEvaluationInput(coverageContract, options);
  const candidate = {
    contractVersion: '1.0.0',
    resolverContext: {
      contractVersion: '1.0.0',
      snapshotId: 'resolver_snapshot_g1_math_001',
      observedAt: '2026-10-03T11:00:00.000Z',
      sourcePolicyVersion: 'content-lifecycle-source-v1',
      lifecycleReviewSnapshotSha256: null
    },
    coverageEvaluationInput: coverageInput,
    itemLifecycleSnapshots: coverageInput.itemMetadata.map(lifecycleSnapshotFor)
  };
  refreshLifecycleReviewSnapshotHash(candidate, bridge);
  return candidate;
}

test('recomputes coverage and binds each approved assessment item to matching human-review readiness', async () => {
  const bridge = await loadBridge();
  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(await bridgeCandidate());

  assert.equal(result.eligible, true);
  assert.equal(result.nextState, 'coverage_review_ready');
  assert.equal(result.scopeCoverageComplete, true);
  assert.equal(result.coverageReviewReadinessIntent.approvedContentRevisionBindings.length, 36);
  assert.equal(Object.isFrozen(result.coverageReviewReadinessIntent), true);
  assert.equal('published' in result, false);
  assert.equal('deliveryEligible' in result, false);
});

test('rejects a caller-supplied precomputed coverage report instead of trusting it', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  candidate.precomputedCoverageReport = { coverageComplete: true };

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'unexpected_field'), true);
});

test('blocks when the resolver lifecycle state differs from the metadata state that coverage would count', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  candidate.itemLifecycleSnapshots[0].itemState = 'draft';
  candidate.itemLifecycleSnapshots[0].releaseCandidate = null;
  refreshLifecycleReviewSnapshotHash(candidate, bridge);

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'item_lifecycle_state_mismatch'), true);
});

test('blocks an approved coverage item when its independently resolved four-review chain targets another revision', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  candidate.itemLifecycleSnapshots[0].releaseCandidate.decisions[1].reviewedRevision.sha256 = SHA_A;
  refreshLifecycleReviewSnapshotHash(candidate, bridge);

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'item_review_readiness_blocked'), true);
});

test('blocks a self-consistent review chain when its declared author differs from the independently resolved content author', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  const reviewCandidate = candidate.itemLifecycleSnapshots[0].releaseCandidate;
  reviewCandidate.revision.authorId = 'forged_content_author_001';
  for (let index = 0; index < reviewCandidate.decisions.length; index += 1) {
    reviewCandidate.decisions[index].contentAuthorId = 'forged_content_author_001';
  }
  refreshLifecycleReviewSnapshotHash(candidate, bridge);

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'item_lifecycle_author_mismatch'), true);
});

test('does not let post-load global Boolean poisoning substitute another reviewed revision for a coverage item', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  const reviewCandidate = candidate.itemLifecycleSnapshots[0].releaseCandidate;
  const substitutedRevision = {
    contentItemId: 'contentitem_g1_math_substitute_001',
    revisionId: 'itemrev_g1_math_substitute_001',
    sha256: SHA_A,
    assetSetSha256: SHA_B
  };
  reviewCandidate.revision.contentItemId = substitutedRevision.contentItemId;
  reviewCandidate.revision.revisionId = substitutedRevision.revisionId;
  reviewCandidate.revision.sha256 = substitutedRevision.sha256;
  reviewCandidate.revision.assetSetSha256 = substitutedRevision.assetSetSha256;
  for (let index = 0; index < reviewCandidate.decisions.length; index += 1) {
    reviewCandidate.decisions[index].reviewedRevision = { ...substitutedRevision };
  }
  refreshLifecycleReviewSnapshotHash(candidate, bridge);
  const script = `
    import fs from 'node:fs';
    import { evaluateServerResolvedQuestionCoverageReviewReadiness } from ${JSON.stringify(BRIDGE_MODULE_URL.href)};
    const candidate = JSON.parse(fs.readFileSync(0, 'utf8'));
    globalThis.Boolean = () => true;
    const result = evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);
    process.stdout.write(JSON.stringify({ eligible: result.eligible, errorCodes: result.errors.map(error => error.code) }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8',
    input: JSON.stringify(candidate)
  });

  assert.equal(child.status, 0, child.stderr);
  const result = JSON.parse(child.stdout);
  assert.equal(result.eligible, false);
  assert.equal(result.errorCodes.includes('item_review_readiness_blocked'), true);
});

test('blocks four purported review disciplines that reuse one immutable decision identifier', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  const decisions = candidate.itemLifecycleSnapshots[0].releaseCandidate.decisions;
  decisions[1].decisionId = decisions[0].decisionId;
  refreshLifecycleReviewSnapshotHash(candidate, bridge);

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'duplicate_review_decision_id'), true);
});

test('blocks a review decision identifier reused by a different approved content revision in the same resolver snapshot', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  const firstDecision = candidate.itemLifecycleSnapshots[0].releaseCandidate.decisions[0];
  candidate.itemLifecycleSnapshots[1].releaseCandidate.decisions[0].decisionId = firstDecision.decisionId;
  refreshLifecycleReviewSnapshotHash(candidate, bridge);

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'duplicate_review_decision_id'), true);
});

test('does not inherit published or delivery claims after Object prototype pollution', async () => {
  const candidate = await bridgeCandidate();
  const script = `
    import fs from 'node:fs';
    import { evaluateServerResolvedQuestionCoverageReviewReadiness } from ${JSON.stringify(BRIDGE_MODULE_URL.href)};
    const candidate = JSON.parse(fs.readFileSync(0, 'utf8'));
    Object.defineProperties(Object.prototype, {
      published: { configurable: true, enumerable: true, value: true },
      deliveryEligible: { configurable: true, enumerable: true, value: true }
    });
    const result = evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);
    process.stdout.write(JSON.stringify({
      eligible: result.eligible,
      resultPrototypeIsNull: Object.getPrototypeOf(result) === null,
      publishedInResult: 'published' in result,
      deliveryEligibleInResult: 'deliveryEligible' in result
    }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8',
    input: JSON.stringify(candidate)
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), {
    eligible: true,
    resultPrototypeIsNull: true,
    publishedInResult: false,
    deliveryEligibleInResult: false
  });
});

test('blocks a resolver observation that predates the human approval of its evaluated blueprint', async () => {
  const bridge = await loadBridge();
  const coverageContract = await loadCoverageContract();
  const candidate = await bridgeCandidate();
  const blueprint = candidate.coverageEvaluationInput.blueprint;
  blueprint.humanApproval.approvedAt = '2026-10-03T11:30:00.000Z';
  blueprint.blueprintSha256 = coverageContract.calculateQuestionCoverageBlueprintSha256(blueprint);
  for (let index = 0; index < candidate.coverageEvaluationInput.itemMetadata.length; index += 1) {
    candidate.coverageEvaluationInput.itemMetadata[index].blueprintSha256 = blueprint.blueprintSha256;
  }
  refreshLifecycleReviewSnapshotHash(candidate, bridge);

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'resolver_observed_before_blueprint_approval'), true);
});

test('does not represent a partial 36-week scope as complete even when every currently approved item is review-ready', async () => {
  const bridge = await loadBridge();
  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(
    await bridgeCandidate({ partialCoverage: true })
  );

  assert.equal(result.eligible, true);
  assert.equal(result.scopeCoverageComplete, false);
  assert.equal(result.coverageSummary.missingRequiredVariantCellCount, 1);
});

test('blocks a resolver context whose immutable snapshot hash does not bind its lifecycle and review records', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  candidate.resolverContext.lifecycleReviewSnapshotSha256 = SHA_C;

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'resolver_snapshot_hash_mismatch'), true);
});

test('requires exactly one resolved lifecycle snapshot for each coverage item', async () => {
  const bridge = await loadBridge();
  const candidate = await bridgeCandidate();
  candidate.itemLifecycleSnapshots.pop();
  refreshLifecycleReviewSnapshotHash(candidate, bridge);

  const result = bridge.evaluateServerResolvedQuestionCoverageReviewReadiness(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'item_lifecycle_snapshot_missing'), true);
});

test('recomputes coverage review readiness before binding one immutable package target to its approved blueprint cell', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const coverageCandidate = await bridgeCandidate();
  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(
    await packageCoverageBindingCandidate(coverageCandidate)
  );

  assert.equal(result.eligible, true);
  assert.equal(result.nextState, 'package_coverage_binding_ready');
  assert.equal(result.scopeCoverageComplete, true);
  assert.equal(result.packageCoverageBindingIntent.itemId, coverageCandidate.coverageEvaluationInput.itemMetadata[0].itemId);
  assert.equal(typeof result.packageCoverageBindingIntent.packageCoverageBindingSha256, 'string');
  assert.equal(result.packageCoverageBindingIntent.packageCoverageBindingSha256.length, 64);
  assert.equal('published' in result, false);
  assert.equal('publicationEligible' in result, false);
  assert.equal('deliveryEligible' in result, false);
});

test('blocks a package target whose immutable content revision tuple aliases another coverage item', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const coverageCandidate = await bridgeCandidate();
  const candidate = await packageCoverageBindingCandidate(coverageCandidate);
  candidate.packageContentTarget.contentRevisionSha256 = SHA_A;

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(
    candidate
  );

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'package_target_content_binding_mismatch'), true);
});

test('blocks a package target that pairs an approved item identity with another blueprint cell', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const coverageCandidate = await bridgeCandidate();
  const candidate = await packageCoverageBindingCandidate(coverageCandidate);
  candidate.packageContentTarget.blueprintCellId = coverageCandidate.coverageEvaluationInput.itemMetadata[1].blueprintCellId;

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(
    candidate
  );

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'package_target_blueprint_cell_mismatch'), true);
});

test('blocks a package curriculum declaration that does not match the recomputed blueprint outcome', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const coverageCandidate = await bridgeCandidate();
  const candidate = await packageCoverageBindingCandidate(coverageCandidate);
  candidate.packageContentTarget.curriculum.outcomeCode = 'MAT.1.1.9';

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(
    candidate
  );

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'package_target_curriculum_mismatch'), true);
});

test('keeps partial scope explicit when a currently approved package target has a valid coverage binding', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const coverageCandidate = await bridgeCandidate({ partialCoverage: true });
  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(
    await packageCoverageBindingCandidate(coverageCandidate)
  );

  assert.equal(result.eligible, true);
  assert.equal(result.scopeCoverageComplete, false);
  assert.equal(result.coverageSummary.missingRequiredVariantCellCount, 1);
});

test('rejects a caller-supplied precomputed coverage-review result instead of recomputing the resolver input', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const coverageCandidate = await bridgeCandidate();
  const candidate = await packageCoverageBindingCandidate(coverageCandidate);
  candidate.precomputedCoverageReviewReadiness = { eligible: true };

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'unexpected_field'), true);
});

test('blocks a package resolver context whose hash does not bind the target and freshly recomputed coverage evidence', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const candidate = await packageCoverageBindingCandidate(await bridgeCandidate());
  candidate.resolverContext.packageCoverageSnapshotSha256 = SHA_A;

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'package_coverage_snapshot_hash_mismatch'), true);
});

test('blocks a package target whose immutable package-manifest digest changed after the resolver snapshot was formed', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const candidate = await packageCoverageBindingCandidate(await bridgeCandidate());
  candidate.packageContentTarget.packageManifestSha256 = SHA_A;

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'package_coverage_snapshot_hash_mismatch'), true);
});

test('requires every immutable target identity field to match one recomputed approved binding', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const coverageCandidate = await bridgeCandidate();
  const mutations = [
    ['itemId', 'item_g1_math_missing_001', 'package_target_item_binding_missing'],
    ['contentItemId', 'contentitem_g1_math_missing_001', 'package_target_content_binding_mismatch'],
    ['contentRevisionId', 'itemrev_g1_math_missing_001', 'package_target_content_binding_mismatch'],
    ['contentRevisionSha256', SHA_A, 'package_target_content_binding_mismatch'],
    ['assetSetSha256', SHA_A, 'package_target_content_binding_mismatch'],
    ['blueprintCellId', 'bpcell_g1_math_missing_001', 'package_target_blueprint_cell_mismatch']
  ];

  for (const [field, value, expectedCode] of mutations) {
    const candidate = await packageCoverageBindingCandidate(coverageCandidate);
    candidate.packageContentTarget[field] = value;
    const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(candidate);

    assert.equal(result.eligible, false, `${field} alias must be blocked`);
    assert.equal(result.errors.some(error => error.code === expectedCode), true, `${field} must report its immutable-binding mismatch`);
  }
});

test('does not treat a caller-shaped bridge result as a coverage-review resolver input', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const candidate = await packageCoverageBindingCandidate(await bridgeCandidate());
  candidate.coverageReviewResolverInput = {
    eligible: true,
    nextState: 'coverage_review_ready',
    scopeCoverageComplete: true,
    errors: []
  };

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'coverage_review_readiness_blocked'), true);
});

test('blocks a package resolver observation that predates the recomputed coverage-review observation', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const candidate = await packageCoverageBindingCandidate(await bridgeCandidate());
  candidate.resolverContext.observedAt = '2026-10-03T10:30:00.000Z';

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'resolver_observed_before_coverage_review_observation'), true);
});

test('does not inherit publication, delivery, or manifest claims after Object prototype pollution', async () => {
  const candidate = await packageCoverageBindingCandidate(await bridgeCandidate());
  const script = `
    import fs from 'node:fs';
    import { evaluateServerResolvedContentPackageCoverageBinding } from ${JSON.stringify(PACKAGE_COVERAGE_BINDING_MODULE_URL.href)};
    const candidate = JSON.parse(fs.readFileSync(0, 'utf8'));
    Object.defineProperties(Object.prototype, {
      published: { configurable: true, enumerable: true, value: true },
      deliveryEligible: { configurable: true, enumerable: true, value: true },
      manifestValid: { configurable: true, enumerable: true, value: true }
    });
    const result = evaluateServerResolvedContentPackageCoverageBinding(candidate);
    process.stdout.write(JSON.stringify({
      eligible: result.eligible,
      resultPrototypeIsNull: Object.getPrototypeOf(result) === null,
      publishedInResult: 'published' in result,
      deliveryEligibleInResult: 'deliveryEligible' in result,
      manifestValidInResult: 'manifestValid' in result
    }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8',
    input: JSON.stringify(candidate)
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), {
    eligible: true,
    resultPrototypeIsNull: true,
    publishedInResult: false,
    deliveryEligibleInResult: false,
    manifestValidInResult: false
  });
});

test('rejects an accessor-backed package target rather than invoking it during binding', async () => {
  const packageBinding = await loadPackageCoverageBinding();
  const candidate = await packageCoverageBindingCandidate(await bridgeCandidate());
  Object.defineProperty(candidate.packageContentTarget, 'packageId', {
    configurable: true,
    enumerable: true,
    get() {
      throw new Error('package target accessor must not run');
    }
  });

  const result = packageBinding.evaluateServerResolvedContentPackageCoverageBinding(candidate);

  assert.equal(result.eligible, false);
  assert.equal(result.errors.some(error => error.code === 'accessor_field_not_allowed'), true);
});

test('remains valid when numeric and timestamp intrinsics are poisoned after the contracts load', async () => {
  const bridge = await loadBridge();
  const coverageCandidate = await bridgeCandidate();
  coverageCandidate.resolverContext.observedAt = '2026-10-03T11:00:00Z';
  refreshLifecycleReviewSnapshotHash(coverageCandidate, bridge);
  const candidate = await packageCoverageBindingCandidate(coverageCandidate);
  const script = `
    import fs from 'node:fs';
    import { evaluateServerResolvedContentPackageCoverageBinding } from ${JSON.stringify(PACKAGE_COVERAGE_BINDING_MODULE_URL.href)};
    const candidate = JSON.parse(fs.readFileSync(0, 'utf8'));
    globalThis.Number = () => -1;
    String.prototype.replace = () => 'forged';
    const result = evaluateServerResolvedContentPackageCoverageBinding(candidate);
    process.stdout.write(JSON.stringify({
      eligible: result.eligible,
      errorCodes: result.errors.map(error => error.code)
    }));
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    encoding: 'utf8',
    input: JSON.stringify(candidate)
  });

  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), {
    eligible: true,
    errorCodes: []
  });
});
