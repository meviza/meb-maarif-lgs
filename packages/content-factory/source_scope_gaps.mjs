import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fail = code => { throw new Error(code); };
const ROLE_KEYS = ['program', 'textbook', 'lesson_activity', 'question_bank', 'real_exam',
  'monthly_sample', 'olympiad_questions', 'olympiad_solutions', 'guidance', 'unclassified'];
const COURSE_GRADES = [
  ['turkce', [1, 2, 3, 4, 5, 6, 7, 8]], ['matematik', [1, 2, 3, 4, 5, 6, 7, 8]],
  ['hayat-bilgisi', [1, 2, 3]], ['fen-bilimleri', [3, 4, 5, 6, 7, 8]],
  ['sosyal-bilgiler', [4, 5, 6, 7]], ['inkilap-tarihi-ve-ataturkculuk', [8]],
  ['ingilizce', [2, 3, 4, 5, 6, 7, 8]], ['din-kulturu-ve-ahlak-bilgisi', [4, 5, 6, 7, 8]],
];
const COHORT = [1, 2, 3, 5, 6, 7];
const KIND_ROLES = new Map([
  ['curriculum_current', ['program']], ['curriculum_historical', ['program']], ['curriculum_current_catalog', ['program']],
  ['tymm_early_literacy_reference_candidate', ['textbook']], ['tymm_learner_textbook_reference_candidate', ['textbook']],
  ['tymm_workbook_reference_candidate', ['lesson_activity']], ['lesson_workbook', ['lesson_activity']],
  ['lesson_question_fascicle_archive', ['lesson_activity', 'question_bank']], ['question_bank_archive', ['question_bank']],
  ['lgs_exam', ['real_exam']], ['lgs_monthly_or_series_sample', ['monthly_sample']],
  ['olympiad_questions', ['olympiad_questions']], ['olympiad_solutions', ['olympiad_solutions']], ['guidance', ['guidance']],
]);
const ALIASES = new Map([['ilkokul-turkce', 'turkce'], ['ortaokul-turkce', 'turkce'],
  ['ilkokul-matematik', 'matematik'], ['ortaokul-matematik', 'matematik'],
  ['din-kulturu', 'din-kulturu-ve-ahlak-bilgisi'], ['inkilap-tarihi', 'inkilap-tarihi-ve-ataturkculuk']]);
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

// No I/O or hooks. The full small public snapshots fit; arbitrary media, model
// output or private data is not an input channel for this inventory projection.
function safeCopy(input) {
  const visiting = new WeakSet(); let nodes = 0, textBytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 100000 || depth > 24) fail('invalid_source_scope_data');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('invalid_source_scope_data'); return value; }
    if (typeof value === 'string') {
      textBytes += Buffer.byteLength(value);
      if (value.length > 65536 || textBytes > 2 * 1024 * 1024 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_source_scope_data');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('invalid_source_scope_data');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail('invalid_source_scope_data');
    const keys = Reflect.ownKeys(value);
    // Field names are data too: bound them before descriptor allocation and
    // include UTF-8 key bytes in the same aggregate budget as string values.
    for (const key of keys) {
      if (typeof key !== 'string' || key.length > 256) fail('invalid_source_scope_data');
      const keyBytes = Buffer.byteLength(key); textBytes += keyBytes;
      if (keyBytes > 256 || textBytes > 2 * 1024 * 1024) fail('invalid_source_scope_data');
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (keys.some(key => !Object.hasOwn(descriptors[key], 'value'))) fail('invalid_source_scope_data');
    visiting.add(value);
    let result;
    if (array) {
      if (value.length > 2048 || keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_source_scope_data');
      result = Array.from({ length: value.length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_source_scope_data');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return result;
  }
  return copy(input);
}
function object(value) { if (!value || typeof value !== 'object' || Array.isArray(value)) fail('invalid_source_scope_fields'); }
function list(value) { if (!Array.isArray(value)) fail('invalid_source_scope_fields'); return value; }
function id(value) { if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,159}$/u.test(value)) fail('invalid_source_scope_identity'); return value; }
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
const course = value => typeof value === 'string' ? ALIASES.get(value) ?? value : null;
function gradesOf(source) {
  const grades = Object.hasOwn(source, 'grades') ? list(source.grades) : Object.hasOwn(source, 'grade') ? [source.grade] : [];
  if (grades.some(grade => !Number.isInteger(grade) || grade < 1 || grade > 8)) fail('invalid_source_scope_grade');
  if (Object.hasOwn(source, 'grade') && !grades.includes(source.grade)) fail('conflicting_source_scope_grade');
  return [...new Set(grades)];
}
function uniqueIdentities(rows, errorCode) {
  const seen = new Set();
  for (const row of rows) {
    object(row); const key = id(row.id);
    if (seen.has(key)) fail(errorCode);
    seen.add(key);
  }
}
function acquired(source, observation) {
  const value = observation?.download ?? source.download;
  const claimed = value?.status === 'downloaded';
  const recorded = claimed && validHash(value.sha256) && Number.isSafeInteger(value.byteLength) && value.byteLength > 0;
  if (recorded && source.expectedSha256 && source.expectedSha256 !== value.sha256) fail('conflicting_source_scope_revision');
  return { status: recorded ? 'recorded_download_integrity_metadata_not_fresh_bytes'
    : claimed ? 'unverified_download_claim' : value?.status === 'failed' ? 'failed' : 'metadata_only',
  recorded, sha256: recorded ? value.sha256 : null, byteLength: recorded ? value.byteLength : null,
  byteBudgetBlocked: value?.errorCode === 'file_byte_limit_exceeded' };
}
function sumBytes(values) {
  let total = 0;
  for (const value of values) {
    // Each byte length can be safe while their sum is not. Check capacity
    // before adding, so an inexact Number never becomes a recorded total.
    if (!Number.isSafeInteger(value) || value < 0 || value > Number.MAX_SAFE_INTEGER - total) fail('source_scope_byte_total_overflow');
    total += value;
  }
  return total;
}
function acquisitionCounts(rows) {
  const acquiredRows = rows.filter(row => row.acquisition.recorded), revisions = new Map();
  for (const row of acquiredRows) {
    const { sha256, byteLength } = row.acquisition;
    if (revisions.has(sha256) && revisions.get(sha256).byteLength !== byteLength) fail('conflicting_source_scope_revision');
    if (!revisions.has(sha256)) revisions.set(sha256, { sha256, byteLength, sourceIds: [] });
    revisions.get(sha256).sourceIds.push(row.id);
  }
  return { sourceIdentityCount: rows.length, recordedDownloadedSourceCount: acquiredRows.length,
    uniqueDownloadedByteRevisionCount: revisions.size, duplicateDownloadedIdentityCount: acquiredRows.length - revisions.size,
    recordedDownloadedBytes: sumBytes(acquiredRows.map(row => row.acquisition.byteLength)),
    uniqueDownloadedBytes: sumBytes([...revisions.values()].map(row => row.byteLength)),
    failedSourceCount: rows.filter(row => row.acquisition.status === 'failed').length,
    metadataOnlySourceCount: rows.filter(row => row.acquisition.status === 'metadata_only').length,
    byteBudgetBlockedSourceCount: rows.filter(row => row.acquisition.byteBudgetBlocked).length,
    unverifiedDownloadClaimCount: rows.filter(row => row.acquisition.status === 'unverified_download_claim').length,
    duplicateRevisions: [...revisions.values()].filter(row => row.sourceIds.length > 1)
      .map(row => ({ ...row, sourceIds: row.sourceIds.sort() })).sort((a, b) => a.sha256.localeCompare(b.sha256)) };
}
function roleSummary(rows) {
  return { ...acquisitionCounts(rows), expectedDocumentCount: null, semanticCoverage: 'unknown',
    sourceIds: rows.map(row => row.id).sort() };
}
function sourceFormReport(snapshot, byId) {
  const sources = [], seen = new Set();
  for (const observation of list(snapshot.observations)) {
    object(observation); id(observation.sourceId);
    if (seen.has(observation.sourceId)) fail('duplicate_source_scope_observation');
    seen.add(observation.sourceId);
    const source = byId.get(observation.sourceId), items = list(observation.items ?? []);
    const ordinals = items.map(item => { object(item); if (!Number.isInteger(item.ordinal) || item.ordinal < 1) fail('invalid_source_scope_item'); return item.ordinal; });
    if (new Set(ordinals).size !== ordinals.length) fail('invalid_source_scope_item');
    const bound = !!source?.acquisition.recorded && source.acquisition.sha256 === observation.sourceSha256;
    const span = observation.itemOrdinalCoverage;
    const completeOrdinalSpan = bound && span?.allOrdinalPagePairsChecked === true && span.first === 1
      && Number.isInteger(span.last) && span.observedCount === items.length && span.last === items.length
      && ordinals.every((value, index) => value === index + 1);
    sources.push({ sourceId: observation.sourceId, lineageBound: bound,
      observedItemCount: bound ? items.length : 0, totalSourceItemCount: completeOrdinalSpan ? items.length : null,
      completelyEnumeratedOrdinalItemCount: completeOrdinalSpan ? items.length : 0,
      effectiveProgramMapping: 'unaccepted_current_program_equivalence_pending', expertAccepted: false,
      candidateFamilyCount: bound ? new Set(items.map(item => item.candidateFamily).filter(value => typeof value === 'string')).size : 0 });
  }
  return { observationSourceCount: sources.length, boundObservationSourceCount: sources.filter(source => source.lineageBound).length,
    unboundObservationSourceCount: sources.filter(source => !source.lineageBound).length,
    observedItemCount: sources.reduce((sum, source) => sum + source.observedItemCount, 0),
    completelyEnumeratedOrdinalItemCount: sources.reduce((sum, source) => sum + source.completelyEnumeratedOrdinalItemCount, 0),
    sourceQuestionTotal: null, acceptedOfficialFamilyCount: null, productQuestionContribution: 0,
    evidenceMeaning: 'preexisting_reference_page_observations_not_fresh_pdf_analysis_or_expert_acceptance', sources };
}

/** Pure conservative projection of versioned public metadata, never source acceptance. */
export function createSourceScopeGapReport(input) {
  const data = safeCopy(input); object(data);
  const fields = ['archives', 'selection', 'downloadObservations', 'monthly', 'formObservations'];
  if (Object.keys(data).length !== fields.length || fields.some(key => !Object.hasOwn(data, key))) fail('invalid_source_scope_fields');
  list(data.archives);
  for (const snapshot of [...data.archives, data.selection, data.downloadObservations, data.monthly, data.formObservations]) {
    object(snapshot);
    if (snapshot.learnerData === true || snapshot.studentData === true) fail('nonpublic_source_scope_input');
  }
  const selected = list(data.selection.sources), selectedIds = new Set(selected.map(source => id(source.id))), downloads = new Map();
  for (const observation of list(data.downloadObservations.sources)) {
    object(observation); const sourceId = id(observation.sourceId);
    if (!selectedIds.has(sourceId) || downloads.has(sourceId)) fail('unbound_source_scope_download');
    const selectedSource = selected.find(source => source.id === sourceId);
    if (observation.url && selectedSource.url && observation.url !== selectedSource.url) fail('unbound_source_scope_download');
    downloads.set(sourceId, observation);
  }
  const sources = [...data.archives.flatMap(snapshot => list(snapshot.sources)), ...selected, ...list(data.monthly.sources)];
  if (sources.length > 1024) fail('invalid_source_scope_data');
  const byId = new Map();
  const rows = sources.map(source => {
    object(source); const sourceId = id(source.id);
    if (byId.has(sourceId)) fail('duplicate_source_scope_identity');
    const row = { id: sourceId, kind: source.kind, grades: gradesOf(source), courseKey: course(source.courseKey),
      roles: KIND_ROLES.get(source.kind) ?? ['unclassified'], acquisition: acquired(source, downloads.get(sourceId)) };
    byId.set(sourceId, row); return row;
  });
  const roles = Object.fromEntries(ROLE_KEYS.map(key => [key, roleSummary(rows.filter(row => row.roles.includes(key)))]));
  const cells = COURSE_GRADES.flatMap(([courseKey, grades]) => grades.map(grade => {
    const matches = rows.filter(row => row.grades.includes(grade) && (row.courseKey === courseKey
      || (row.courseKey === null && row.roles.some(role => ['real_exam', 'monthly_sample'].includes(role)))));
    const cellRoles = Object.fromEntries(ROLE_KEYS.map(key => {
      const candidates = matches.filter(row => row.roles.includes(key));
      return [key, { metadataCandidateCount: candidates.length, sourceIds: candidates.map(row => row.id).sort(),
        courseUnverifiedSourceIds: candidates.filter(row => row.courseKey === null).map(row => row.id).sort(),
        recordedDownloadedSourceCount: candidates.filter(row => row.acquisition.recorded).length,
        acquisitionPendingSourceIds: candidates.filter(row => !row.acquisition.recorded).map(row => row.id).sort(),
        expectedDocumentCount: null, semanticCoverage: 'unknown', activeProgramVerified: false,
        currentCatalogSourceIds: key === 'program' ? candidates.filter(row => row.kind !== 'curriculum_historical').map(row => row.id).sort() : [],
        historicalArchiveSourceIds: key === 'program' ? candidates.filter(row => row.kind === 'curriculum_historical').map(row => row.id).sort() : [] }];
    }));
    return { grade, courseKey, academicYear: '2026-2027',
      activeProgramStatus: COHORT.includes(grade) ? 'tymm_notice_cohort_course_specific_acceptance_pending' : 'existing_program_decision_and_pdf_semantics_pending',
      courseAssignmentEvidence: 'declared_catalog_metadata_not_semantic_acceptance', roles: cellRoles,
      outcomeCoverage: null, microSkillCoverage: null, questionFamilyCoverage: null, representationCoverage: null,
      rightsStatus: 'unresolved_reference_only', pedagogyStatus: 'expert_acceptance_pending',
      gaps: ['effective_program_course_scope_acceptance_pending', 'expected_source_documents_unknown',
        'outcome_and_process_component_denominators_unknown', 'micro_skill_and_question_family_denominators_unknown',
        'rights_pedagogy_and_accessibility_acceptance_pending'] };
  }));
  const inventory = list(data.selection.inventory), selectedCells = new Set(selected.flatMap(source => {
    const key = course(source.courseKey);
    return gradesOf(source).filter(grade => cells.some(cell => cell.grade === grade && cell.courseKey === key)).map(grade => `${grade}:${key}`);
  }));
  const monthlyRows = rows.filter(row => row.roles.includes('monthly_sample'));
  const headers = data.monthly.sources.map(source => source.headerObservation);
  const batches = list(data.monthly.batches);
  uniqueIdentities(inventory, 'duplicate_source_scope_catalog_identity');
  uniqueIdentities(batches, 'duplicate_source_scope_batch_identity');
  const report = {
    schemaVersion: 'source-scope-gap-report/v1', state: 'metadata_gap_report_not_source_or_product_acceptance',
    inputSnapshotSha256: digest(data),
    profile: { authority: 'project_candidate_scope_not_official_mandatory_course_denominator', candidateCellCount: cells.length,
      academicYear: '2026-2027', tymmNoticeGradeCohort: [...COHORT], existingProgramDecisionPendingGrades: [4, 8],
      weeks: 36, weekAuthority: 'planning_view_not_official_calendar_or_teaching_hours',
      applicabilityEvidence: 'prior_repository_official_notice_metadata_not_a_new_web_or_course_decision_check' },
    denominators: { officialGradeCourseCount: null, expectedSourceDocumentCount: null, officialOutcomeCount: null,
      processComponentCount: null, microSkillCount: null, requiredQuestionFamilyCount: null, requiredRepresentationCount: null },
    coveragePercentage: null, catalog: { observedRecords: inventory.length, selectedRecords: selected.length,
      deferredRecords: inventory.filter(row => row.decision === 'defer').length, excludedRecords: inventory.filter(row => row.decision === 'exclude').length,
      selectedMetadataCandidateCells: selectedCells.size, absentSelectedMetadataCandidateCells: cells.length - selectedCells.size,
      completeness: 'one_recorded_catalog_snapshot_not_all_official_sources' },
    inventory: acquisitionCounts(rows), roles, roleCountsOverlap: rows.some(row => row.roles.length > 1), cells,
    unassignedSourceIds: rows.filter(row => !cells.some(cell => row.grades.includes(cell.grade) && row.courseKey === cell.courseKey)
      && !(row.courseKey === null && row.grades.includes(8) && row.roles.some(role => ['real_exam', 'monthly_sample'].includes(role)))).map(row => row.id).sort(),
    monthly: { discoveredBatchCount: batches.length, partLinkIdentityCount: monthlyRows.length,
      recordedDownloadedSourceCount: monthlyRows.filter(row => row.acquisition.recorded).length,
      headObservedSourceCount: headers.filter(header => header?.status === 200 && ['head_observed', 'head_observed_after_timeout'].includes(header.state)).length,
      headTimeoutSourceCount: headers.filter(header => header?.state === 'head_timeout').length,
      headNotProbedSourceCount: headers.filter(header => !header || header.state === 'not_probed').length,
      expectedAllSourcesKnown: false, pdfQuestionTotal: null },
    sourceForm: sourceFormReport(data.formObservations, byId), sourceQuestionTotal: null,
    rights: { unresolvedSourceCount: rows.length, commercialReuseApproval: 'not_established', modelTransferAllowed: false },
    pedagogy: { unacceptedSourceCount: rows.length, activeOutcomeMappingAccepted: false, empiricalDifficultyCalibration: 'not_performed_by_report' },
    productQuestions: { target: 36000, inventoryCount: null, sourceReferenceContribution: 0, generatedByReport: 0, acceptedByReport: 0 },
    fullSourcesVerified: false, fullQuestionCoverage: false, publicationReady: false, learnerReady: false, productionReady: false,
    freshPdfByteChecks: 0, modelCallsMade: 0, networkCallsMade: 0,
  };
  report.contentSha256 = digest(report); return freeze(report);
}
