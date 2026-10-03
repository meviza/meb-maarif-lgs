import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Breaks caught: a downloaded program becoming accepted active curriculum,
// a derived question-family name becoming an official outcome, or a local
// candidate row silently becoming a source/product question count.
const matrixUrl = new URL('../sources/grade6-source-semantic-candidate-matrix.json', import.meta.url);
const registry = JSON.parse(await readFile(new URL('../sources/meb-reference-registry.json', import.meta.url), 'utf8'));
const raw = await readFile(matrixUrl, 'utf8').catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
const matrix = raw === null ? null : JSON.parse(raw);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function actual() {
  assert.ok(matrix, 'grade6 source semantic candidate matrix is not prepared');
  return matrix;
}

test('observed grade6 program binding matches the existing official downloaded registry rather than a guessed subject source', () => {
  const m = actual();
  const source = registry.sources.find(row => row.id === m.source.sourceId);
  assert.ok(source);
  assert.equal(source.id, 'tymm-current-ortaokul-matematik');
  assert.ok(source.grades.includes(6));
  assert.equal(source.download.status, 'downloaded');
  assert.equal(m.source.sha256, source.download.sha256);
  assert.equal(m.source.sha256, '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734');
  assert.equal(m.source.byteLength, 3916466);
  assert.equal(m.source.byteLength, source.download.byteLength);
  assert.equal(m.source.pdfUrl, source.url);
  assert.equal(m.source.catalogPageUrl, source.sourcePage);
  assert.equal(m.source.pdfPageCount, 222);
});

test('the inspected slice exposes four actual outputs and seventeen printed process components without claiming the full denominator', () => {
  const m = actual();
  assert.deepEqual(m.source.pages.map(p => [p.physicalPdfPage, p.printedPage]), [[67, 67], [68, 68], [69, 69], [70, 70]]);
  assert.ok(m.source.pages.every(p => p.textInspected === true));
  assert.deepEqual(m.outcomes.map(row => row.code), ['MAT.6.1.1', 'MAT.6.1.2', 'MAT.6.1.3', 'MAT.6.1.4']);
  const expected = [
    ['MAT.6.1.1', ['a', 'b', 'c', 'ç', 'd', 'e', 'f']],
    ['MAT.6.1.2', ['a', 'b', 'c', 'ç', 'd']],
    ['MAT.6.1.3', ['a', 'b']],
    ['MAT.6.1.4', ['a', 'b', 'c']]
  ];
  for (const [code, labels] of expected) {
    const row = m.outcomes.find(o => o.code === code);
    assert.deepEqual(row.processComponents.map(p => p.printedLabel), labels);
    assert.ok(row.processComponents.every(p => p.physicalPdfPage === 67 && p.printedPage === 67));
  }
  assert.equal(m.outcomes.reduce((n, row) => n + row.processComponents.length, 0), 17);
  assert.equal(m.scope.observedOutputCount, 4);
  assert.equal(m.scope.observedPrintedProcessComponentCount, 17);
  for (const key of ['officialMandatoryCourseDenominator', 'fullGrade6OutcomeDenominator', 'fullProgramSemanticDenominator',
    'fullCurriculumCoveragePercent', 'sourceQuestionTotal', 'officialDifficultyDistribution', 'questionQuotaPerMicroSkill']) {
    assert.equal(m.scope[key], null);
  }
  assert.equal(m.scope.fullCurriculumSemanticReviewComplete, false);
});

test('project micro-skills are derived planning rows linked to observed processes, not new official process codes or learner records', () => {
  const m = actual();
  assert.equal(m.microSkills.length, 17);
  assert.equal(m.scope.derivedMicroSkillCount, 17);
  assert.equal(new Set(m.microSkills.map(row => row.id)).size, 17);
  const links = m.outcomes.flatMap(o => o.processComponents.map(p => `${o.code}:${p.printedLabel}`));
  assert.deepEqual(m.microSkills.map(row => `${row.sourceOutputCode}:${row.sourceProcessLabel}`).sort(), links.sort());
  for (const row of m.microSkills) {
    assert.match(row.id, /^G6-NQ-\d{2}$/u);
    assert.equal(row.origin, 'derived_project_candidate');
    assert.equal(row.officialCode, false);
    assert.equal(row.studentMasteryVerified, false);
    assert.equal(row.evidenceCollected, false);
    assert.equal(row.sourcePage, 67);
    assert.ok(row.questionFamilyIds.length > 0);
    assert.ok(row.questionFamilyIds.every(id => m.questionFamilies.some(f => f.id === id && f.outputCodes.includes(row.sourceOutputCode))));
  }
});

test('question-family and representation diversity is separate from source questions, generated stock and difficulty calibration', () => {
  const m = actual();
  assert.equal(m.questionFamilies.length, 13);
  assert.equal(m.representations.length, 8);
  assert.equal(m.scope.derivedQuestionFamilyCount, 13);
  assert.equal(m.scope.derivedRepresentationCount, 8);
  assert.equal(m.scope.familyTaxonomyIsOfficial, false);
  assert.equal(m.scope.microSkillIdsAreOfficial, false);
  assert.equal(m.scope.productQuestionsContributed, 0);
  assert.equal(m.scope.sourceQuestionsCopied, 0);
  assert.equal(m.scope.lessonsContributed, 0);
  assert.equal(m.scope.publishedContentContributed, 0);
  assert.equal(m.scope.difficultyCalibration, 'unknown');
  assert.equal(new Set(m.questionFamilies.map(row => row.id)).size, 13);
  assert.equal(new Set(m.representations.map(row => row.id)).size, 8);
  for (const row of m.questionFamilies) {
    assert.equal(row.origin, 'derived_project_candidate');
    assert.equal(row.acceptedQuestionCount, 0);
    assert.equal(row.questionTextPresent, false);
    assert.ok(row.outputCodes.every(code => m.outcomes.some(o => o.code === code)));
    assert.ok(row.representationIds.every(id => m.representations.some(r => r.id === id)));
    assert.ok(row.learnerEvidence.length > 0);
  }
  assert.ok(m.questionFamilies.some(row => row.formats.includes('construction')));
  assert.ok(m.questionFamilies.some(row => row.formats.includes('open_ended_explanation')));
  assert.ok(m.questionFamilies.some(row => row.formats.includes('error_diagnosis_with_reason')));
});

test('source fit keeps the exact divisibility set and zero/one/model guards without inventing ratio or classic word-problem acceptance', () => {
  const m = actual();
  assert.deepEqual(m.boundaries.divisibilityTargetDivisors, [2, 3, 4, 5, 6, 9, 10]);
  assert.equal(m.boundaries.divisibilityBy7AcceptedInThisSlice, false);
  assert.equal(m.boundaries.positiveFactorEnumerationRequiredForFiniteList, true);
  assert.equal(m.boundaries.zeroFactorOrMultipleConventionsNeedSeparateReview, true);
  assert.equal(m.boundaries.oneIsPrime, false);
  assert.equal(m.boundaries.oneIsComposite, false);
  assert.equal(m.boundaries.primeFactorTreeMinimumInteger, 2);
  assert.equal(m.boundaries.grade5Area36LimitInherited, false);
  assert.equal(m.boundaries.formalGcdLcmAlgorithmAcceptance, 'not_verified_in_this_slice');
  assert.deepEqual(m.scope.unreviewedRequestedAreas, ['ratio', 'fractions_as_independent_outcomes', 'worker_pool_age_problem_families']);
  assert.equal(m.scope.requestedAreasAreGloballyAbsentFromProgram, false);
});

test('each practical note teaches a conditional meaning-and-check route rather than presenting speed as mastery or source text', () => {
  const m = actual();
  assert.equal(m.practicalNotes.length, 4);
  assert.deepEqual(m.practicalNotes.map(row => row.outputCode), m.outcomes.map(row => row.code));
  for (const row of m.practicalNotes) {
    assert.equal(row.origin, 'derived_project_candidate');
    assert.ok(row.whenApplicable.length > 0);
    assert.ok(row.whyItWorks.length > 0);
    assert.ok(row.check.length > 0);
    assert.ok(row.notImplied.length > 0);
    assert.equal(row.expertApproved, false);
    assert.equal(row.videoOrAudioPrepared, false);
  }
});

test('active cohort expert rights and known application gaps remain independent unresolved gates', () => {
  const m = actual();
  assert.equal(m.activeProgram.schoolYearCandidate, '2026-2027');
  assert.equal(m.activeProgram.grade6ProgramCourseAccepted, false);
  assert.equal(m.activeProgram.effectiveProgramDecision, 'pending');
  assert.equal(m.activeProgram.outcomeExistsDoesNotEstablishActiveAcceptance, true);
  assert.equal(m.source.usagePolicy, 'reference_only');
  assert.equal(m.source.commercialReuseRights, 'unverified');
  assert.equal(m.source.sourceToModelTransferAllowed, false);
  assert.equal(m.source.sourceContentRedistributionAllowed, false);
  assert.equal(m.outcomes.find(row => row.code === 'MAT.6.1.4').applicationReview, 'continuation_outside_selected_pages_pending');
  assert.ok(m.gaps.some(row => row.id === 'G01' && row.state === 'unresolved'));
  assert.ok(m.gaps.some(row => row.id === 'G02' && row.outputCodes.includes('MAT.6.1.4')));
  assert.equal(m.governance.artifactAudience, 'editor_review_only');
  for (const key of ['publicationReady', 'learnerReady', 'productionReady', 'teacherApproved', 'officialMebApprovalClaim', 'studentDataPresent']) {
    assert.equal(m.governance[key], false);
  }
  for (const key of ['expertReview', 'curriculumApproval', 'rightsReview', 'ownerAssignment', 'retentionDecision']) assert.equal(m.governance[key], 'pending');
  assert.equal(m.governance.providerCallsMade, 0);
  assert.equal(m.governance.modelTransfersMade, 0);
});

test('public metadata is bounded digest-checked and carries no raw source paragraphs questions media credentials or private cache paths', () => {
  const m = actual();
  assert.ok(Buffer.byteLength(raw, 'utf8') <= 32768);
  const { contentSha256, ...body } = m;
  assert.equal(contentSha256, hash(body));
  assert.doesNotMatch(raw, /\/Users\/|\.env|Bearer\s|cfut_|data:image|<svg|questionText"|options"|sourceParagraph"|verbatim"/iu);
  const strings = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
  assert.ok(strings(m).every(value => value.length <= 500));
  assert.equal(m.source.rawSourceParagraphsPublished, false);
  assert.equal(m.source.rawSourceMediaPublished, false);
});
