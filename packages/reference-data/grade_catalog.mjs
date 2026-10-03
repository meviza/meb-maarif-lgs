/**
 * Grades 1–8 are reference data, not evidence that curriculum, questions, or
 * lesson media have been published for every grade.
 */

const GRADE_REFERENCE_CATALOG = Object.freeze([
  { grade: 1, name: '1. Sınıf', educationStage: 'ilkokul' },
  { grade: 2, name: '2. Sınıf', educationStage: 'ilkokul' },
  { grade: 3, name: '3. Sınıf', educationStage: 'ilkokul' },
  { grade: 4, name: '4. Sınıf', educationStage: 'ilkokul' },
  { grade: 5, name: '5. Sınıf', educationStage: 'ortaokul' },
  { grade: 6, name: '6. Sınıf', educationStage: 'ortaokul' },
  { grade: 7, name: '7. Sınıf', educationStage: 'ortaokul' },
  { grade: 8, name: '8. Sınıf', educationStage: 'ortaokul' }
]);

/**
 * Combine stable grade reference data with the legacy prototype's non-release
 * metadata. This deliberately never upgrades prototype content to published.
 */
export function buildGradesOneToEightFoundationCatalog(prototypeGradeSummaries = []) {
  const summariesByGrade = new Map(
    prototypeGradeSummaries.map(summary => [summary.grade, summary])
  );

  return GRADE_REFERENCE_CATALOG.map(reference => {
    const prototype = summariesByGrade.get(reference.grade);
    return {
      ...reference,
      referenceState: 'foundation_reference',
      curriculumTraceability: 'not_verified',
      contentState: prototype ? 'prototype_unverified' : 'not_seeded',
      courseCount: prototype?.courseCount ?? 0,
      testCount: prototype?.testCount ?? 0,
      questionCount: prototype?.questionCount ?? 0
    };
  });
}
