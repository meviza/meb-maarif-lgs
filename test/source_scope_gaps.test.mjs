import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const api = await import('../packages/content-factory/source_scope_gaps.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const clone = value => structuredClone(value);
const empty = () => ({ archives: [{ sources: [] }], selection: { sources: [], inventory: [] },
  downloadObservations: { sources: [] }, monthly: { sources: [], batches: [] }, formObservations: { observations: [] } });
function report(input) {
  assert.equal(typeof api.createSourceScopeGapReport, 'function', 'source scope gap report not implemented');
  return api.createSourceScopeGapReport(input);
}
const source = (id, kind, extra = {}) => ({ id, kind, courseKey: 'matematik', grades: [6],
  usagePolicy: 'reference_only', reuseRights: 'unverified', ...extra });
const download = (sha256 = 'a'.repeat(64), byteLength = 10) => ({ status: 'downloaded', sha256, byteLength,
  semanticReview: 'not_performed', rightsReview: 'pending' });
async function baseline() {
  const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
  const [main, supplement, selection, downloadObservations, monthly, formObservations] = await Promise.all([
    'meb-reference-registry', 'education-reference-supplement', 'tymm-relevance-inventory',
    'tymm-download-observations', 'lgs-monthly-reference-discovery', 'meb-question-style-observations',
  ].map(load));
  return { archives: [main, supplement], selection, downloadObservations, monthly, formObservations };
}

// Break caught: an empty reference inventory becomes a complete official denominator.
test('empty input exposes all 42 project candidate cells without inventing official coverage', () => {
  const result = report(empty());
  assert.equal(result.profile.candidateCellCount, 42);
  assert.equal(result.profile.authority, 'project_candidate_scope_not_official_mandatory_course_denominator');
  assert.equal(result.cells.length, 42);
  assert.equal(result.denominators.officialGradeCourseCount, null);
  assert.equal(result.denominators.officialOutcomeCount, null);
  assert.equal(result.denominators.microSkillCount, null);
  assert.equal(result.denominators.requiredQuestionFamilyCount, null);
  assert.equal(result.coveragePercentage, null);
  assert.ok(result.cells.every(cell => cell.outcomeCoverage === null && cell.microSkillCoverage === null && cell.questionFamilyCoverage === null));
  assert.ok(result.cells.every(cell => Object.values(cell.roles).every(role => role.metadataCandidateCount === 0 && role.expectedDocumentCount === null && role.semanticCoverage === 'unknown')));
  assert.equal(result.fullSourcesVerified, false);
  assert.equal(result.fullQuestionCoverage, false);
  assert.equal(result.publicationReady, false);
});

// Break caught: two identities for one English workbook increment physical PDF totals.
test('identities links recorded downloads and unique byte revisions are different counts', () => {
  const input = empty();
  input.archives[0].sources = [source('original', 'lesson_workbook', { download: download() })];
  input.selection.sources = [source('alias', 'tymm_workbook_reference_candidate')];
  input.selection.inventory = [{ id: 'alias', decision: 'select' }];
  input.downloadObservations.sources = [{ sourceId: 'alias', download: download() }];
  input.monthly.sources = [source('head-only', 'lgs_monthly_or_series_sample', { grade: 8, grades: undefined, headerObservation: { state: 'head_observed', status: 200 } })];
  delete input.monthly.sources[0].grades;
  const result = report(input);
  assert.equal(result.inventory.sourceIdentityCount, 3);
  assert.equal(result.inventory.recordedDownloadedSourceCount, 2);
  assert.equal(result.inventory.uniqueDownloadedByteRevisionCount, 1);
  assert.equal(result.inventory.duplicateDownloadedIdentityCount, 1);
  assert.equal(result.inventory.recordedDownloadedBytes, 20);
  assert.equal(result.inventory.uniqueDownloadedBytes, 10);
  assert.equal(result.inventory.metadataOnlySourceCount, 1);
  assert.equal(result.freshPdfByteChecks, 0);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.productQuestions.inventoryCount, null);
});

// Break caught: ingestion trusts stale summary counters instead of actual rows.
test('real public snapshots reconcile 199 identities and 49 records into 48 revisions', async () => {
  const input = await baseline(), before = JSON.stringify(input), result = report(input);
  assert.equal(JSON.stringify(input), before);
  assert.equal(result.inventory.sourceIdentityCount, 199);
  assert.equal(result.inventory.recordedDownloadedSourceCount, 49);
  assert.equal(result.inventory.uniqueDownloadedByteRevisionCount, 48);
  assert.equal(result.inventory.duplicateDownloadedIdentityCount, 1);
  assert.equal(result.inventory.recordedDownloadedBytes, 258742634);
  assert.equal(result.inventory.uniqueDownloadedBytes, 250396912);
  assert.equal(result.inventory.failedSourceCount, 62);
  assert.equal(result.inventory.metadataOnlySourceCount, 88);
  assert.equal(result.inventory.byteBudgetBlockedSourceCount, 54);
  assert.deepEqual([...result.inventory.duplicateRevisions[0].sourceIds].sort(), ['meb-2026-grade6-english-workbook', 'tymm-book-297']);
  assert.equal(result.rights.unresolvedSourceCount, 199);
  assert.equal(result.pedagogy.unacceptedSourceCount, 199);
  assert.equal(result.sourceQuestionTotal, null);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.modelCallsMade, 0);
});

// Break caught: overlapping fascicle roles are summed as additional PDF identities.
test('source roles keep programs textbooks activities archives exams and solutions separate', async () => {
  const result = report(await baseline());
  const counts = Object.fromEntries(Object.entries(result.roles).map(([key, value]) => [key, value.sourceIdentityCount]));
  assert.deepEqual(counts, { program: 28, textbook: 55, lesson_activity: 6, question_bank: 3,
    real_exam: 14, monthly_sample: 88, olympiad_questions: 2, olympiad_solutions: 2, guidance: 2, unclassified: 0 });
  assert.equal(result.roles.lesson_activity.uniqueDownloadedByteRevisionCount, 2);
  assert.equal(result.roles.lesson_activity.recordedDownloadedSourceCount, 3);
  assert.equal(result.roleCountsOverlap, true);
  assert.equal(result.roles.real_exam.expectedDocumentCount, null);
  assert.equal(result.roles.monthly_sample.semanticCoverage, 'unknown');
});

// Break caught: catalog backend assignment is mistaken for semantic class coverage.
test('selected title metadata covers 31 candidate cells but does not close the 11 discovery gaps', async () => {
  const result = report(await baseline());
  assert.deepEqual(result.catalog, { observedRecords: 143, selectedRecords: 59, deferredRecords: 56,
    excludedRecords: 28, selectedMetadataCandidateCells: 31, absentSelectedMetadataCandidateCells: 11,
    completeness: 'one_recorded_catalog_snapshot_not_all_official_sources' });
  const cell = result.cells.find(value => value.grade === 7 && value.courseKey === 'ingilizce');
  assert.equal(cell.roles.textbook.metadataCandidateCount, 0);
  assert.equal(cell.roles.program.semanticCoverage, 'unknown');
  assert.equal(cell.courseAssignmentEvidence, 'declared_catalog_metadata_not_semantic_acceptance');
  assert.equal(cell.outcomeCoverage, null);
});

// Break caught: current-catalog titles automatically activate 4/8 or every English/DKAB edition.
test('active program cohort is separate from historical archives and pending 4/8 decisions', async () => {
  const result = report(await baseline());
  assert.deepEqual(result.profile.tymmNoticeGradeCohort, [1, 2, 3, 5, 6, 7]);
  assert.equal(result.cells.filter(cell => cell.activeProgramStatus === 'tymm_notice_cohort_course_specific_acceptance_pending').length, 30);
  assert.equal(result.cells.filter(cell => cell.activeProgramStatus === 'existing_program_decision_and_pdf_semantics_pending').length, 12);
  const fourth = result.cells.find(cell => cell.grade === 4 && cell.courseKey === 'matematik');
  assert.ok(fourth.roles.program.historicalArchiveSourceIds.includes('legacy-2018-matematik'));
  assert.ok(fourth.roles.program.currentCatalogSourceIds.includes('tymm-current-ilkokul-matematik'));
  assert.equal(fourth.roles.program.activeProgramVerified, false);
  assert.equal(result.profile.weeks, 36);
  assert.equal(result.profile.weekAuthority, 'planning_view_not_official_calendar_or_teaching_hours');
});

// Break caught: HEAD or publisher-declared counts increment downloaded PDFs or product questions.
test('monthly link discovery remains distinct from 14 real exam PDFs', async () => {
  const result = report(await baseline());
  assert.equal(result.monthly.discoveredBatchCount, 44);
  assert.equal(result.monthly.partLinkIdentityCount, 88);
  assert.equal(result.monthly.recordedDownloadedSourceCount, 0);
  assert.equal(result.monthly.headObservedSourceCount, 69);
  assert.equal(result.monthly.headTimeoutSourceCount, 17);
  assert.equal(result.monthly.headNotProbedSourceCount, 2);
  assert.equal(result.monthly.expectedAllSourcesKnown, false);
  assert.equal(result.monthly.pdfQuestionTotal, null);
  assert.equal(result.roles.real_exam.recordedDownloadedSourceCount, 14);
});

// Break caught: 27 reference observations become 27 original accepted questions or full season coverage.
test('real source-form observations retain lineage and incomplete source question denominators', async () => {
  const result = report(await baseline());
  assert.equal(result.sourceForm.observationSourceCount, 2);
  assert.equal(result.sourceForm.boundObservationSourceCount, 2);
  assert.equal(result.sourceForm.observedItemCount, 27);
  assert.equal(result.sourceForm.completelyEnumeratedOrdinalItemCount, 20);
  assert.equal(result.sourceForm.sourceQuestionTotal, null);
  assert.equal(result.sourceForm.acceptedOfficialFamilyCount, null);
  assert.equal(result.sourceForm.productQuestionContribution, 0);
  const sample = result.sourceForm.sources.find(row => row.sourceId.includes('fascicle'));
  assert.equal(sample.observedItemCount, 7);
  assert.equal(sample.totalSourceItemCount, null);
  assert.equal(sample.expertAccepted, false);
  assert.equal(result.productQuestions.target, 36000);
  assert.equal(result.productQuestions.generatedByReport, 0);
});

test('changing cached summary claims cannot promote acquisition or coverage', async () => {
  const input = await baseline();
  input.selection.summary.selected = 999; input.archives[0].successCount = 999;
  input.downloadObservations.summary.totalUniqueDownloadedByteRevisions = 999;
  input.formObservations.productQuestionCount = 36000;
  const result = report(input);
  assert.equal(result.catalog.selectedRecords, 59);
  assert.equal(result.inventory.uniqueDownloadedByteRevisionCount, 48);
  assert.equal(result.productQuestions.sourceReferenceContribution, 0);
  assert.equal(result.fullSourcesVerified, false);
});

test('unknown source course and family stay unclassified instead of guessing from a title', () => {
  const input = empty(); input.archives[0].sources = [{ id: 'unknown', title: 'Matematik 6. Sınıf Tam Kitap', kind: 'future_unknown' }];
  const result = report(input);
  assert.equal(result.roles.unclassified.sourceIdentityCount, 1);
  assert.deepEqual(result.unassignedSourceIds, ['unknown']);
  assert.ok(result.cells.every(cell => Object.values(cell.roles).every(role => role.metadataCandidateCount === 0)));
});

test('conflicting identities revisions or orphan observations are rejected', () => {
  const duplicate = empty(); duplicate.archives[0].sources = [source('same', 'program'), source('same', 'program')];
  assert.throws(() => report(duplicate), /duplicate_source_scope_identity/u);
  const sizes = empty(); sizes.archives[0].sources = [source('one', 'lesson_workbook', { download: download() }), source('two', 'lesson_workbook', { download: download('a'.repeat(64), 20) })];
  assert.throws(() => report(sizes), /conflicting_source_scope_revision/u);
  const orphan = empty(); orphan.downloadObservations.sources = [{ sourceId: 'absent', download: download() }];
  assert.throws(() => report(orphan), /unbound_source_scope_download/u);
});

test('a download claim without a SHA and byte length is not an integrity record', () => {
  const input = empty(); input.archives[0].sources = [source('claim', 'lesson_workbook', { download: { status: 'downloaded' } })];
  const result = report(input);
  assert.equal(result.inventory.recordedDownloadedSourceCount, 0);
  assert.equal(result.inventory.unverifiedDownloadClaimCount, 1);
  assert.equal(result.inventory.uniqueDownloadedByteRevisionCount, 0);
});

// Break caught: safe individual integers still produce a rounded unsafe aggregate.
test('three distinct revisions reject a rounded byte total instead of losing one byte', () => {
  const input = empty();
  input.archives[0].sources = [Number.MAX_SAFE_INTEGER, 1, 1].map((byteLength, index) =>
    source(`overflow-${index}`, 'lesson_workbook', { download: download(String(index + 1).repeat(64), byteLength) }));
  assert.throws(() => report(input), /source_scope_byte_total_overflow/u);
});

test('cross-role unique revision totals reject overflow when each per-role total is safe', () => {
  const acrossRoles = empty(); acrossRoles.archives[0].sources = [
    source('program-max', 'curriculum_current', { download: download('a'.repeat(64), Number.MAX_SAFE_INTEGER) }),
    source('workbook-max', 'lesson_workbook', { download: download('b'.repeat(64), Number.MAX_SAFE_INTEGER) }),
  ];
  assert.throws(() => report(acrossRoles), /source_scope_byte_total_overflow/u);
});

test('duplicate identities reject a recorded byte total overflow even when the unique total is safe', () => {
  const aliases = empty(); aliases.archives[0].sources = [
    source('original-max', 'lesson_workbook', { download: download('a'.repeat(64), Number.MAX_SAFE_INTEGER) }),
    source('alias-max', 'lesson_workbook', { download: download('a'.repeat(64), Number.MAX_SAFE_INTEGER) }),
  ];
  assert.throws(() => report(aliases), /source_scope_byte_total_overflow/u);
});

test('exact safe boundary totals remain accepted for unique revisions and duplicate identities', () => {
  const unique = empty(); unique.archives[0].sources = [9007199254740989, 1, 1].map((byteLength, index) =>
    source(`boundary-${index}`, 'lesson_workbook', { download: download(String(index + 1).repeat(64), byteLength) }));
  const result = report(unique);
  assert.equal(result.inventory.recordedDownloadedBytes, 9007199254740991);
  assert.equal(result.inventory.uniqueDownloadedBytes, 9007199254740991);
  assert.equal(result.roles.lesson_activity.recordedDownloadedBytes, 9007199254740991);
  const aliases = empty(); aliases.archives[0].sources = [
    source('original-safe', 'lesson_workbook', { download: download('a'.repeat(64), 4503599627370495) }),
    source('alias-safe', 'lesson_workbook', { download: download('a'.repeat(64), 4503599627370495) }),
  ];
  const aliased = report(aliases);
  assert.equal(aliased.inventory.recordedDownloadedBytes, 9007199254740990);
  assert.equal(aliased.inventory.uniqueDownloadedBytes, 4503599627370495);
  assert.equal(aliased.inventory.uniqueDownloadedByteRevisionCount, 1);
  assert.equal(aliased.inventory.duplicateDownloadedIdentityCount, 1);
});

test('wrong observation hash is visible as unbound and cannot increment source-form totals', () => {
  const input = empty(); input.archives[0].sources = [source('math-source', 'question_bank_archive', { download: download() })];
  input.formObservations.observations = [{ sourceId: 'math-source', sourceSha256: 'b'.repeat(64), items: [{ ordinal: 1 }] }];
  const result = report(input);
  assert.equal(result.sourceForm.boundObservationSourceCount, 0);
  assert.equal(result.sourceForm.unboundObservationSourceCount, 1);
  assert.equal(result.sourceForm.observedItemCount, 0);
});

test('repeated catalog or announcement identities cannot inflate discovery counts', () => {
  const catalog = empty(); catalog.selection.inventory = [{ id: 'catalog-one', decision: 'defer' }, { id: 'catalog-one', decision: 'defer' }];
  assert.throws(() => report(catalog), /duplicate_source_scope_catalog_identity/u);
  const monthly = empty(); monthly.monthly.batches = [{ id: 'batch-one' }, { id: 'batch-one' }];
  assert.throws(() => report(monthly), /duplicate_source_scope_batch_identity/u);
});

test('conflicting grade fields are not silently assigned to a different cell', () => {
  const input = empty(); input.archives[0].sources = [source('conflict', 'lgs_exam', { grades: [6], grade: 8 })];
  assert.throws(() => report(input), /conflicting_source_scope_grade/u);
});

test('getters proxies cycles symbols sparse arrays and oversized input fail without hooks', () => {
  let hooks = 0;
  const getter = empty(); Object.defineProperty(getter.selection, 'hidden', { get() { hooks++; return 1; } });
  assert.throws(() => report(getter), /invalid_source_scope_data/u);
  const proxy = new Proxy(empty(), { get() { hooks++; throw Error('hook'); }, ownKeys() { hooks++; throw Error('hook'); } });
  assert.throws(() => report(proxy), /invalid_source_scope_data/u);
  const nested = empty(); nested.selection = new Proxy(nested.selection, { getPrototypeOf() { hooks++; throw Error('hook'); } });
  assert.throws(() => report(nested), /invalid_source_scope_data/u);
  const revoked = Proxy.revocable(empty(), {}); revoked.revoke();
  assert.throws(() => report(revoked.proxy), /invalid_source_scope_data/u);
  const cyclic = empty(); cyclic.selection.self = cyclic;
  assert.throws(() => report(cyclic), /invalid_source_scope_data/u);
  const symbol = empty(); symbol.selection[Symbol('hidden')] = 1;
  assert.throws(() => report(symbol), /invalid_source_scope_data/u);
  const sparse = empty(); sparse.archives = Array(1);
  assert.throws(() => report(sparse), /invalid_source_scope_data/u);
  const large = empty(); large.selection.extra = 'x'.repeat(65537);
  assert.throws(() => report(large), /invalid_source_scope_data/u);
  assert.equal(hooks, 0);
});

test('report is immutable reproducible and excludes raw snapshot prose URLs and private paths', () => {
  const input = empty(); input.selection.note = '/private/synthetic-do-not-include';
  const first = report(input), second = report(clone(input));
  assert.deepEqual(first, second);
  assert.ok(Object.isFrozen(first) && Object.isFrozen(first.cells[0].roles));
  assert.ok(!JSON.stringify(first).includes('/private/'));
  assert.throws(() => { first.cells[0].grade = 99; }, TypeError);
});
