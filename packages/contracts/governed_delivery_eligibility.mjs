/**
 * Pure composition gate for a student-delivery candidate.
 *
 * It proves only that supplied, already-validated records align. It never
 * reads a legacy bank, authenticates a caller, writes a ledger, or serves a
 * question. A later delivery resolver must obtain these records from an
 * append-only, authorized source before opening a student endpoint.
 */

import { validateStudentDeliveryPackage } from './content_package_manifest.mjs';
import { validateContentPublicationDecision } from './content_publication_decision.mjs';
import { evaluateDecisionBackedReleaseReadiness } from './decision_backed_release_readiness.mjs';
import { evaluateAssetEvidenceBundleSet } from './asset_evidence_bundle.mjs';

const REVIEW_BINDINGS = [
  { discipline: 'academic', manifestField: 'academicReviewId' },
  { discipline: 'assessment', manifestField: 'assessmentReviewId' },
  { discipline: 'rights', manifestField: 'rightsReviewId' },
  { discipline: 'accessibility', manifestField: 'accessibilityReviewId' }
];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function blocked(errors) {
  return { eligible: false, nextState: 'blocked', errors };
}

function appendValidationErrors(errors, prefix, code, validation) {
  validation.errors.forEach(error => {
    addError(errors, `${prefix}.${error.path}`, code, error.message);
  });
}

function resolveEffectivePublicationDecision(history, revision) {
  const errors = [];
  if (!Array.isArray(history) || history.length === 0) {
    addError(
      errors,
      'publicationDecisionHistory',
      'publication_history_missing',
      'a publication decision history is required to resolve the effective decision'
    );
    return { errors, decision: null, index: -1 };
  }

  const seenSequences = new Set();
  const validDecisions = [];
  history.forEach((decision, index) => {
    const validation = validateContentPublicationDecision(decision);
    if (!validation.valid) {
      appendValidationErrors(errors, `publicationDecisionHistory[${index}]`, 'publication_decision_invalid', validation);
      return;
    }

    if (seenSequences.has(decision.decisionSequence)) {
      addError(
        errors,
        `publicationDecisionHistory[${index}].decisionSequence`,
        'publication_history_sequence_not_distinct',
        'each publication decision sequence must be distinct within a revision history'
      );
    }
    seenSequences.add(decision.decisionSequence);

    if (
      decision.targetRevision.contentItemId !== revision.contentItemId ||
      decision.targetRevision.revisionId !== revision.revisionId ||
      decision.targetRevision.sha256 !== revision.sha256
    ) {
      addError(
        errors,
        `publicationDecisionHistory[${index}].targetRevision`,
        'publication_history_revision_mismatch',
        'every publication history record must target the release revision'
      );
    }
    if (decision.targetRevision.assetSetSha256 !== revision.assetSetSha256) {
      addError(
        errors,
        `publicationDecisionHistory[${index}].targetRevision.assetSetSha256`,
        'publication_history_asset_set_mismatch',
        'every publication history record must target the release asset-evidence set'
      );
    }
    validDecisions.push({ decision, index });
  });

  if (errors.length > 0) {
    return { errors, decision: null, index: -1 };
  }

  validDecisions.sort((left, right) => right.decision.decisionSequence - left.decision.decisionSequence);
  return {
    errors: [],
    decision: validDecisions[0].decision,
    index: validDecisions[0].index
  };
}

function validateManifestAssetBindings(manifestAssets, bundles, errors) {
  const bundlesById = new Map();
  bundles.forEach((bundle, index) => {
    if (bundlesById.has(bundle.bundleId)) {
      addError(
        errors,
        `assetEvidenceBundles[${index}].bundleId`,
        'asset_evidence_bundle_id_duplicate',
        'each asset evidence bundle identifier must be unique in a delivery candidate'
      );
      return;
    }
    bundlesById.set(bundle.bundleId, bundle);
  });

  const referencedBundleIds = new Set();
  const bindings = [
    ['assetId', bundle => bundle.asset.assetId],
    ['revisionId', bundle => bundle.asset.revisionId],
    ['mediaType', bundle => bundle.asset.mediaType],
    ['byteSha256', bundle => bundle.asset.byteSha256],
    ['deliveryProfile', bundle => bundle.asset.deliveryProfile],
    ['provenanceRecordId', bundle => bundle.asset.origin.provenanceRecordId],
    ['provenanceRecordSha256', bundle => bundle.asset.origin.provenanceRecordSha256],
    ['rightsRecordId', bundle => bundle.rights.rightsRecordId],
    ['rightsRecordSha256', bundle => bundle.rights.rightsRecordSha256],
    ['accessibilityRecordId', bundle => bundle.accessibility.accessibilityRecordId],
    ['accessibilityRecordSha256', bundle => bundle.accessibility.accessibilityRecordSha256]
  ];

  manifestAssets.forEach((asset, index) => {
    const path = `manifest.assets[${index}]`;
    const bundle = bundlesById.get(asset.assetEvidenceBundleId);
    if (!bundle) {
      addError(
        errors,
        `${path}.assetEvidenceBundleId`,
        'asset_evidence_bundle_missing',
        'every manifest asset reference must resolve to an asset evidence bundle'
      );
      return;
    }
    referencedBundleIds.add(bundle.bundleId);

    bindings.forEach(([field, getExpected]) => {
      if (asset[field] !== getExpected(bundle)) {
        addError(
          errors,
          `${path}.${field}`,
          'asset_reference_mismatch',
          'manifest asset reference must match its immutable asset evidence bundle'
        );
      }
    });
  });

  bundles.forEach((bundle, index) => {
    if (!referencedBundleIds.has(bundle.bundleId)) {
      addError(
        errors,
        `assetEvidenceBundles[${index}]`,
        'asset_evidence_bundle_unreferenced',
        'every asset evidence bundle must be referenced by the manifest'
      );
    }
  });
}

function validateAssetReviewEvidence(bundles, decisions, errors) {
  const requiredEvidence = [
    {
      discipline: 'rights',
      evidenceKind: 'rights_record',
      recordId: bundle => bundle.rights.rightsRecordId,
      recordSha256: bundle => bundle.rights.rightsRecordSha256,
      message: 'rights review must include the exact asset rights record evidence'
    },
    {
      discipline: 'accessibility',
      evidenceKind: 'accessibility_record',
      recordId: bundle => bundle.accessibility.accessibilityRecordId,
      recordSha256: bundle => bundle.accessibility.accessibilityRecordSha256,
      message: 'accessibility review must include the exact asset accessibility record evidence'
    }
  ];

  requiredEvidence.forEach(requirement => {
    const decisionIndex = decisions.findIndex(decision => decision?.discipline === requirement.discipline);
    const decision = decisions[decisionIndex];
    if (!decision) return;

    bundles.forEach(bundle => {
      const hasExactEvidence = decision.evidenceRefs.some(evidence =>
        evidence?.evidenceKind === requirement.evidenceKind &&
        evidence.evidenceId === requirement.recordId(bundle) &&
        evidence.sha256 === requirement.recordSha256(bundle)
      );
      if (!hasExactEvidence) {
        addError(
          errors,
          `releaseCandidate.decisions[${decisionIndex}].evidenceRefs`,
          'asset_review_evidence_missing',
          requirement.message
        );
      }
    });
  });
}

function validateAssetGradeCompatibility(grade, bundles, errors) {
  bundles.forEach((bundle, index) => {
    const audience = bundle.asset.audience;
    const treatmentRange = bundle.accessibility.treatment.gradeRange;
    if (grade < audience.minGrade || grade > audience.maxGrade) {
      addError(
        errors,
        `assetEvidenceBundles[${index}].asset.audience`,
        'asset_audience_grade_mismatch',
        'asset audience range must cover the manifest curriculum grade'
      );
    }
    if (grade < treatmentRange.minGrade || grade > treatmentRange.maxGrade) {
      addError(
        errors,
        `assetEvidenceBundles[${index}].accessibility.treatment.gradeRange`,
        'accessibility_grade_range_mismatch',
        'accessibility treatment range must cover the manifest curriculum grade'
      );
    }
  });
}

/**
 * Evaluate whether a synthetic or ledger-supplied package has the complete
 * evidence chain needed to become eligible for a later student delivery
 * resolver. "delivery_eligible" is not a publish, HTTP, or access decision.
 */
export function evaluateGovernedStudentDeliveryEligibility(candidate) {
  const manifest = candidate?.manifest;
  const curriculumEntries = candidate?.curriculumEntries;
  const releaseCandidate = candidate?.releaseCandidate;
  const publicationDecisionHistory = candidate?.publicationDecisionHistory;
  const assetEvidenceBundles = candidate?.assetEvidenceBundles;
  const assetEvidenceAsOf = candidate?.assetEvidenceAsOf;

  const manifestValidation = validateStudentDeliveryPackage(manifest, curriculumEntries);
  if (!manifestValidation.valid) {
    const errors = [];
    appendValidationErrors(errors, 'manifest', 'manifest_invalid', manifestValidation);
    return blocked(errors);
  }

  const assetEvidence = evaluateAssetEvidenceBundleSet(assetEvidenceBundles, assetEvidenceAsOf);
  if (!assetEvidence.valid) {
    const errors = [];
    appendValidationErrors(errors, 'assetEvidenceBundles', 'asset_evidence_invalid', assetEvidence);
    return blocked(errors);
  }

  if (manifest.content.assetSetSha256 !== assetEvidence.assetSetSha256) {
    return blocked([
      {
        path: 'assetEvidenceBundles',
        code: 'asset_set_sha256_mismatch',
        message: 'recomputed asset-evidence set must match the manifest content revision'
      }
    ]);
  }

  const readiness = evaluateDecisionBackedReleaseReadiness(releaseCandidate);
  if (!readiness.ready) {
    const errors = [];
    readiness.errors.forEach(error => {
      addError(errors, `releaseCandidate.${error.path}`, 'release_readiness_blocked', error.message);
    });
    return blocked(errors);
  }

  const errors = [];
  const content = isRecord(manifest.content) ? manifest.content : {};
  const revision = isRecord(releaseCandidate?.revision) ? releaseCandidate.revision : {};
  const release = isRecord(releaseCandidate?.release) ? releaseCandidate.release : {};
  const decisions = Array.isArray(releaseCandidate?.decisions) ? releaseCandidate.decisions : [];
  const decisionsByDiscipline = new Map(decisions.map(decision => [decision.discipline, decision]));
  const publicationResolution = resolveEffectivePublicationDecision(publicationDecisionHistory, revision);
  if (publicationResolution.errors.length > 0) {
    return blocked(publicationResolution.errors);
  }
  const publicationDecision = publicationResolution.decision;
  const publicationDecisionPath = `publicationDecisionHistory[${publicationResolution.index}]`;

  if (Date.parse(assetEvidenceAsOf) < Date.parse(publicationDecision.decidedAt)) {
    return blocked([
      {
        path: 'assetEvidenceAsOf',
        code: 'asset_evidence_time_before_publication',
        message: 'asset evidence must be evaluated at or after the effective publication decision'
      }
    ]);
  }

  if (content.contentItemId !== revision.contentItemId) {
    addError(
      errors,
      'manifest.content.contentItemId',
      'manifest_revision_mismatch',
      'manifest content item identifier must match the release revision'
    );
  }
  if (content.revisionId !== revision.revisionId) {
    addError(
      errors,
      'manifest.content.revisionId',
      'manifest_revision_mismatch',
      'manifest revision identifier must match the release revision'
    );
  }
  if (content.revisionSha256 !== revision.sha256) {
    addError(
      errors,
      'manifest.content.revisionSha256',
      'manifest_revision_mismatch',
      'manifest revision hash must match the release revision'
    );
  }
  if (content.assetSetSha256 !== revision.assetSetSha256) {
    addError(
      errors,
      'manifest.content.assetSetSha256',
      'manifest_asset_set_mismatch',
      'manifest asset-evidence set hash must match the release revision'
    );
  }
  if (content.authorId !== revision.authorId) {
    addError(
      errors,
      'manifest.content.authorId',
      'manifest_author_mismatch',
      'manifest content author must match the release revision author'
    );
  }

  if (publicationDecision.contentAuthorId !== revision.authorId) {
    addError(
      errors,
      `${publicationDecisionPath}.contentAuthorId`,
      'publication_author_mismatch',
      'publication decision must name the release revision author'
    );
  }
  if (publicationDecision.decisionId !== content.publicationDecisionId) {
    addError(
      errors,
      'manifest.content.publicationDecisionId',
      'manifest_publication_decision_mismatch',
      'manifest publication decision identifier must match the publication decision'
    );
  }
  if (publicationDecision.releaseRequestId !== release.releaseRequestId) {
    addError(
      errors,
      `${publicationDecisionPath}.releaseRequestId`,
      'publication_release_request_mismatch',
      'publication decision must reference the release request under review'
    );
  }
  if (publicationDecision.rollbackPlanId !== release.rollbackPlanId) {
    addError(
      errors,
      `${publicationDecisionPath}.rollbackPlanId`,
      'publication_rollback_plan_mismatch',
      'publication decision must reference the release rollback plan'
    );
  }
  if (publicationDecision.outcome !== 'published') {
    addError(
      errors,
      `${publicationDecisionPath}.outcome`,
      'publication_outcome_not_published',
      'only a published human publication decision can enable student delivery'
    );
  }

  const publicationTimestamp = Date.parse(publicationDecision.decidedAt);
  decisions.forEach((decision, index) => {
    if (Date.parse(decision.decidedAt) > publicationTimestamp) {
      addError(
        errors,
        `releaseCandidate.decisions[${index}].decidedAt`,
        'review_decision_after_publication',
        'every review decision must precede or coincide with the effective publication decision'
      );
    }
  });

  for (const { discipline, manifestField } of REVIEW_BINDINGS) {
    const decision = decisionsByDiscipline.get(discipline);
    if (!decision) continue;

    if (content[manifestField] !== decision.decisionId) {
      addError(
        errors,
        `manifest.content.${manifestField}`,
        'manifest_review_decision_mismatch',
        `manifest ${discipline} review identifier must match the reviewed revision`
      );
    }
    if (publicationDecision.reviewDecisionIds[discipline] !== decision.decisionId) {
      addError(
        errors,
        `${publicationDecisionPath}.reviewDecisionIds.${discipline}`,
        'publication_review_decision_mismatch',
        `publication decision ${discipline} review identifier must match the reviewed revision`
      );
    }
  }

  validateManifestAssetBindings(manifest.assets, assetEvidenceBundles, errors);
  validateAssetReviewEvidence(assetEvidenceBundles, decisions, errors);
  validateAssetGradeCompatibility(manifest.curriculum.grade, assetEvidenceBundles, errors);

  const reviewerIds = new Set(
    decisions
      .map(decision => decision?.reviewer?.reviewerId)
      .filter(reviewerId => typeof reviewerId === 'string')
  );
  if (reviewerIds.has(publicationDecision.publisher.publisherId)) {
    addError(
      errors,
      `${publicationDecisionPath}.publisher.publisherId`,
      'publisher_reviewer_conflict',
      'the publication decision must be independent from the revision reviewers'
    );
  }

  return errors.length === 0
    ? { eligible: true, nextState: 'delivery_eligible', errors: [] }
    : blocked(errors);
}
