import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGardenQuestion, createRectangleQuestion, validateQuestion } from './pilot.mjs';
import { createPerimeterLesson } from './perimeter_lesson.mjs';
import { createReasonedMathTrace } from './reasoned_math_adapter.mjs';

const BANDS = ['introductory', 'intermediate', 'advanced', 'challenge'];
const SKILLS = {
  perimeter: 'boundary_length', area: 'unit_square_area', width_from_area: 'inverse_area',
  width_from_perimeter: 'inverse_perimeter', error_diagnosis: 'distinguish_area_perimeter',
  fence_gap: 'boundary_with_gap', garden_two_rows: 'ratio_boundary_per_row',
};
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rank = value => createHash('sha256').update(value).digest('hex');
const fail = code => { throw new Error(code); };
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

function safeCopy(input) {
  const visiting = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 100000 || depth > 24) fail('mixed_invalid_data');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('mixed_invalid_data'); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 256 * 1024 || bytes > 8 * 1024 * 1024 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('mixed_invalid_data');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('mixed_invalid_data');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail('mixed_invalid_data');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value'))) fail('mixed_invalid_data');
    visiting.add(value); let result;
    if (array) {
      if (value.length > 512 || keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('mixed_invalid_data');
      result = Array.from({ length: value.length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('mixed_invalid_data');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return result;
  }
  return copy(input);
}
function fields(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== expected.length
      || expected.some(key => !Object.hasOwn(value, key))) fail('mixed_invalid_fields');
}
function boundedInteger(value, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) fail('mixed_invalid_number');
}
function id(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,79}$/u.test(value)) fail('mixed_invalid_id');
}
function text(value, max = 256) { if (typeof value !== 'string' || !value.trim() || value.length > max) fail('mixed_invalid_text'); }
function hash(value) { if (typeof value !== 'string' || !/^[a-f0-9]{64}$/u.test(value)) fail('mixed_invalid_hash'); }

function apportioned(count, profile) {
  boundedInteger(count, 1, 100); fields(profile, BANDS);
  BANDS.forEach(band => boundedInteger(profile[band], 0, 100));
  if (BANDS.reduce((sum, band) => sum + profile[band], 0) !== 100) fail('mixed_invalid_profile');
  const result = Object.fromEntries(BANDS.map(band => [band, Math.floor(count * profile[band] / 100)]));
  const remainders = BANDS.map((band, index) => ({ band, index, remainder: count * profile[band] % 100 }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  const extra = count - Object.values(result).reduce((sum, value) => sum + value, 0);
  for (let index = 0; index < extra; index++) result[remainders[index].band]++;
  return result;
}
/** Explicit caller profile, not an age recommendation or measured difficulty. */
export function apportionDifficultyQuota(count, profile) { return freeze(apportioned(count, safeCopy(profile))); }

function quotaRows(value, count) {
  if (!Array.isArray(value) || value.length > 32) fail('mixed_invalid_quotas');
  const seen = new Set();
  const rows = value.map(row => {
    fields(row, ['id', 'count']); id(row.id); boundedInteger(row.count, 0, count);
    if (seen.has(row.id)) fail('mixed_invalid_quotas'); seen.add(row.id);
    return { id: row.id, count: row.count };
  });
  if (rows.length && rows.reduce((sum, row) => sum + row.count, 0) !== count) fail('mixed_invalid_quotas');
  return rows.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
function requestData(request) {
  fields(request, ['count', 'seed', 'scope', 'exampleFamily', 'difficultyProfile', 'quotas']);
  boundedInteger(request.count, 1, 100); id(request.seed); id(request.exampleFamily);
  fields(request.scope, ['grade', 'programVersion']);
  if (request.scope.grade !== null) boundedInteger(request.scope.grade, 1, 8);
  if (request.scope.programVersion !== null) id(request.scope.programVersion);
  fields(request.quotas, ['skills', 'families', 'formats']);
  const profile = Object.fromEntries(BANDS.map(band => [band, request.difficultyProfile?.[band]]));
  const difficultyQuota = apportioned(request.count, request.difficultyProfile);
  return { request: { count: request.count, seed: request.seed, scope: { ...request.scope }, exampleFamily: request.exampleFamily,
    difficultyProfile: profile, quotas: Object.fromEntries(['skills', 'families', 'formats'].map(axis => [axis, quotaRows(request.quotas[axis], request.count)])) }, difficultyQuota };
}
function sourceScope(metadata, scope) {
  fields(metadata, ['source', 'curriculum', 'governance']);
  fields(metadata.curriculum, ['mappingStatus', 'registryEntryId', 'programVersion', 'grade', 'outcomeCode', 'sourceUrl', 'sourceSha256']);
  const curriculum = metadata.curriculum;
  if (curriculum.grade !== scope.grade || curriculum.programVersion !== scope.programVersion) fail('mixed_scope_mismatch');
  // This adapter is deliberately limited to the current unresolved local pilot.
  if (curriculum.mappingStatus !== 'unresolved' || ['registryEntryId', 'programVersion', 'grade', 'outcomeCode', 'sourceUrl', 'sourceSha256'].some(key => curriculum[key] !== null)) fail('mixed_unverified_scope');
  fields(metadata.governance, ['ownerId', 'stewardId', 'purpose', 'retentionPolicyId']);
  Object.values(metadata.governance).forEach(value => text(value));
}
function lessonSource(lesson, scope) {
  sourceScope(lesson?.metadata, scope); id(lesson.id); hash(lesson.contentSha256); hash(lesson.sourceSha256);
  const { contentSha256, ...body } = lesson;
  const canonical = createPerimeterLesson({ metadata: lesson.metadata });
  if (sha(body) !== contentSha256 || canonical.contentSha256 !== contentSha256 || canonical.sourceSha256 !== lesson.sourceSha256) fail('mixed_source_lesson_mismatch');
  return { id: lesson.id, contentSha256, sourceSha256: lesson.sourceSha256 };
}
function candidate(question, scope) {
  const garden = question?.problem?.template === 'garden_two_rows';
  const expectedFields = ['schemaVersion', 'id', 'state', 'problem', 'prompt', 'options', 'answerIndex', 'answerUnit', 'solutionGraph', 'cognitiveIntent', 'difficulty', 'metadata', 'visual', 'contentSha256', ...(garden ? ['inkPlan', 'inkPlanSha256'] : []), ...(Object.hasOwn(question ?? {}, 'review') ? ['review'] : [])];
  fields(question, expectedFields); id(question.id); hash(question.contentSha256);
  if (question.schemaVersion !== 'content-factory-pilot/v1' || question.state !== 'draft') fail('mixed_invalid_candidate_state');
  sourceScope(question.metadata, scope);
  fields(question.metadata.source, ['sourceId', 'rightsStatus', 'purpose']); Object.values(question.metadata.source).forEach(value => text(value));
  const family = question.problem?.template;
  if (!Object.hasOwn(SKILLS, family) || question.cognitiveIntent?.family !== family) fail('mixed_invalid_family');
  const review = validateQuestion(question);
  if (review.localMathChecks !== 'passed' || review.errors.length) fail('mixed_unverified_candidate');
  const canonical = garden ? createGardenQuestion({ id: question.id, metadata: question.metadata }) : createRectangleQuestion({ id: question.id, template: family,
    width: question.problem.width, height: question.problem.height, gate: question.problem.gate, metadata: question.metadata });
  if (canonical.contentSha256 !== question.contentSha256) fail('mixed_noncanonical_candidate');
  if (Object.hasOwn(question, 'review') && sha(question.review) !== sha(review)) fail('mixed_unverified_candidate_review');
  return { source: { id: question.id, contentSha256: question.contentSha256 }, family, skillId: SKILLS[family],
    format: 'visual_mcq', difficulty: canonical.difficulty.level, question };
}
const compact = ({ source, family, skillId, format, difficulty }) => ({ source, family, skillId, format, difficulty });
function seededOrder(items, seed, purpose) {
  return [...items].sort((a, b) => {
    const left = rank(`${seed}\0${purpose}\0${a.source.id}\0${a.source.contentSha256}`), right = rank(`${seed}\0${purpose}\0${b.source.id}\0${b.source.contentSha256}`);
    return left < right ? -1 : left > right ? 1 : a.source.id < b.source.id ? -1 : a.source.id > b.source.id ? 1 : 0;
  });
}
function selectedCounts(items, property, ids) { return Object.fromEntries(ids.map(key => [key, items.filter(item => item[property] === key).length])); }
function fitsQuotas(items, request, difficultyQuota) {
  const difficulty = selectedCounts(items, 'difficulty', BANDS);
  if (items.length > request.count || BANDS.some(band => difficulty[band] > difficultyQuota[band])) return false;
  for (const [axis, property] of [['skills', 'skillId'], ['families', 'family'], ['formats', 'format']]) {
    if (!request.quotas[axis].length) continue;
    const quotas = new Map(request.quotas[axis].map(row => [row.id, row.count])), counts = new Map();
    for (const item of items) counts.set(item[property], (counts.get(item[property]) ?? 0) + 1);
    if ([...counts].some(([key, count]) => count > (quotas.get(key) ?? 0))) return false;
  }
  return true;
}
function reportRows(rows, property, selected, eligible) {
  return rows.map(row => ({ id: row.id, requested: row.count, selected: selected.filter(item => item[property] === row.id).length,
    missing: Math.max(0, row.count - selected.filter(item => item[property] === row.id).length),
    availableDistinctFamilies: new Set(eligible.filter(item => item[property] === row.id).map(item => item.family)).size }));
}

/** Pure current-pilot review planner; never a learner test or approval store. */
export function createMixedPracticePlan(input) {
  const data = safeCopy(input); fields(data, ['lesson', 'candidates', 'request']);
  const { request, difficultyQuota } = requestData(data.request), lesson = lessonSource(data.lesson, request.scope);
  if (!Array.isArray(data.candidates) || !data.candidates.length || data.candidates.length > 100) fail('mixed_invalid_candidate_count');
  const seen = new Set();
  const candidates = data.candidates.map(question => {
    const item = candidate(question, request.scope); if (seen.has(item.source.id)) fail('mixed_invalid_duplicate_candidate_id');
    seen.add(item.source.id); return item;
  }).sort((a, b) => a.source.id < b.source.id ? -1 : a.source.id > b.source.id ? 1 : 0);
  const examples = candidates.filter(item => item.family === request.exampleFamily);
  if (!examples.length) fail('mixed_invalid_example_family_unavailable');
  const example = seededOrder(examples, request.seed, 'example')[0];
  const eligible = candidates.filter(item => item.source.id !== example.source.id || item.source.contentSha256 !== example.source.contentSha256);
  const families = [...new Set(eligible.map(item => item.family))].sort();
  const representatives = families.map(family => seededOrder(eligible.filter(item => item.family === family), request.seed, 'variant')[0]);
  // At most seven canonical families: enumerate <=128 subsets, never an
  // unbounded backtracking search or numeric-variant diversity shortcut.
  let selected = [], bestRank = null;
  for (let mask = 0; mask < 2 ** representatives.length; mask++) {
    const subset = representatives.filter((_, index) => mask & 2 ** index);
    if (!fitsQuotas(subset, request, difficultyQuota)) continue;
    const tie = rank(`${request.seed}\0subset\0${subset.map(item => item.source.contentSha256).join('\0')}`);
    if (subset.length > selected.length || (subset.length === selected.length && (bestRank === null || tie < bestRank))) { selected = subset; bestRank = tie; }
  }
  selected = seededOrder(selected, request.seed, 'test-order');
  const quotaReport = {
    difficulty: reportRows(BANDS.map(id => ({ id, count: difficultyQuota[id] })), 'difficulty', selected, eligible),
    ...Object.fromEntries([['skills', 'skillId'], ['families', 'family'], ['formats', 'format']].map(([axis, property]) => [axis, reportRows(request.quotas[axis], property, selected, eligible)])),
  };
  const deficits = Object.entries(quotaReport).flatMap(([dimension, rows]) => rows.filter(row => row.missing > 0).map(row => ({ dimension, ...row,
    reason: dimension === 'difficulty' && row.availableDistinctFamilies === 0 ? 'missing_difficulty_band' : 'distinct_family_shortage_or_joint_quota_conflict' })));
  if (selected.length < request.count) deficits.push({ dimension: 'count', id: 'requested_count', requested: request.count, selected: selected.length,
    missing: request.count - selected.length, availableDistinctFamilies: families.length, reason: 'insufficient_distinct_eligible_families_or_joint_quotas' });
  const candidateInventory = candidates.map(compact), sourcePoolSha256 = sha(candidateInventory);
  const plan = {
    schemaVersion: 'mixed-practice-plan/v1', id: `mixed-plan-${sha({ lesson, request, sourcePoolSha256 }).slice(0, 32)}`,
    request, lessonSource: lesson, lesson: data.lesson, workedExample: { ...example, reasonedTrace: createReasonedMathTrace(example.question) },
    selectedQuestions: selected, selectedCount: selected.length, semanticFamilyCount: new Set(selected.map(item => item.family)).size,
    candidateInventory, candidatePool: { candidateCount: candidates.length, distinctFamilyCount: new Set(candidates.map(item => item.family)).size,
      difficultyFamilyCounts: Object.fromEntries(BANDS.map(band => [band, new Set(candidates.filter(item => item.difficulty === band).map(item => item.family)).size])) },
    sourcePoolSha256, requestedDifficultyQuota: difficultyQuota, selectedDifficultyCounts: selectedCounts(selected, 'difficulty', BANDS), quotaReport, deficits,
    selectionState: deficits.length ? 'blocked_review_plan' : 'review_plan_ready', selectionReady: deficits.length === 0,
    difficultyProfileMet: quotaReport.difficulty.every(row => row.missing === 0), quotasMet: deficits.length === 0,
    sequence: [{ stage: 'concept_lesson', source: lesson }, { stage: 'reasoned_worked_example', source: example.source },
      { stage: 'mixed_test', sources: selected.map(item => item.source) }],
    sourceScope: request.scope, scopeAlignment: 'unresolved_editor_scope_not_grade_assignment', difficultyPolicy: 'caller_requested_not_universal_age_policy',
    dataAuthorEstimated: true, dataMeasured: false, state: 'draft', audience: 'editor_review_only', publicationReady: false, learnerReady: false, productionReady: false,
    modelCalls: 0, egress: 'none', learnerEvidence: 'none_collected', expertReview: 'pending', curriculumReview: 'pending', rightsReview: 'pending',
    pending: ['lesson_skill_alignment_review', 'canonical_curriculum_mapping', 'age_accessibility_review', 'trusted_expert_review', 'rights_review', 'empirical_difficulty_calibration'],
  };
  plan.contentSha256 = sha(plan); return freeze(plan);
}
