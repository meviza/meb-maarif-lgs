import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { JevQualityAuditor } from '../../engine/jev_evaluator.mjs';

// JEV's existing evaluator is a local lexical/structure heuristic, not its LLM
// generation pipeline. This adapter exposes advice without promoting its raw
// MEB/plagiarism/answer/Bloom/star/video labels to scientific or learner claims.
const QUESTION_FIELDS = ['grade', 'topic', 'branch', 'outcomeCode', 'stimulus', 'stem', 'options', 'correctOption',
  'solutionStrategy', 'detailedSolution', 'distractors', 'difficulty'];
const EXPECTATION_FIELDS = ['sourceId', 'sourceSha256', 'expectedGrade', 'expectedCourseKey', 'expectedOutcomeCode'];
const OPTIONS = ['A', 'B', 'C', 'D'];
const GATES = { activeProgram: 'pending', pedagogy: 'pending', rights: 'pending', answer: 'pending', originality: 'pending', difficulty: 'pending', accessibility: 'pending' };
const FLAGS = { answerIndependent: false, independentOracleRequired: true, plagiarismChecked: false, mebApproved: false,
  learnerEvidenceCollected: false, humanApproval: null, publicationReady: false, learnerReady: false, productionReady: false,
  serializedHashIsAuthority: false, generatedFallbackUsed: false };
const LIMITATIONS = ['Prototype registry is not official source authority.', 'Option uniqueness is not scientific answer uniqueness.',
  'Lexical ambiguity and spelling checks are not semantic or editorial review.', 'Distractor score counts entries, not correctness.',
  'Difficulty keywords are not learner cognition or psychometric evidence.', 'Plagiarism is not checked.',
  'Topic, branch and active program binding need separate source review.', 'Independent science verification and human acceptance are required.'];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = (kind, value) => createHash('sha256').update(`k12.science-jev-screen.${kind}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const reject = () => { throw new Error('invalid_science_jev_data'); };
const closed = (value, fields) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key));

// Copy descriptor values before any field access, trim, hashing or legacy call.
// No accessor, proxy, custom prototype, sparse array or serialization hook runs.
function inert(input) {
  const active = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 4096 || depth > 16) reject();
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value) || Math.abs(value) > 1e9) reject(); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 8192 || bytes > 65536 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) reject();
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || active.has(value)) reject();
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) reject();
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.length > 65 || keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value')
      || (key !== 'length' || !array) && !descriptors[key].enumerable || key.length > 128 || /[\u0000-\u001f]/u.test(key))) reject();
    for (const key of keys) { bytes += Buffer.byteLength(key); if (bytes > 65536) reject(); }
    active.add(value); let result;
    if (array) {
      const length = descriptors.length.value;
      if (length > 64 || keys.length !== length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) reject();
      result = Array.from({ length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) reject();
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.sort().map(key => [key, copy(descriptors[key].value, depth + 1)]));
    active.delete(value); return result;
  }
  return copy(input);
}
const text = (value, maximum = 8192, allowEmpty = false) => typeof value === 'string' && value.length <= maximum && (allowEmpty || value.trim().length > 0);
const grade = value => Number.isInteger(value) && [6, 7, 8].includes(value);
const code = value => value === null || typeof value === 'string' && /^(?:F|FB)\.[678](?:\.[1-9][0-9]?){2,4}$/u.test(value);
function validQuestion(q) {
  return closed(q, QUESTION_FIELDS) && grade(q.grade) && text(q.topic, 256)
    && ['physics', 'chemistry', 'biology', 'integrated'].includes(q.branch) && code(q.outcomeCode)
    && text(q.stimulus) && text(q.stem, 2048) && closed(q.options, OPTIONS) && OPTIONS.every(key => text(q.options[key], 2048))
    && OPTIONS.includes(q.correctOption) && text(q.solutionStrategy, 8192, true) && text(q.detailedSolution, 8192, true)
    && closed(q.distractors, OPTIONS.filter(key => key !== q.correctOption)) && Object.values(q.distractors).every(value => text(value, 2048))
    && ['KAVRAMA', 'UYGULAMA', 'LGS_YENI_NESIL', 'SEKIL_VE_OLIMPIYAT'].includes(q.difficulty);
}
function validExpectation(e) {
  return closed(e, EXPECTATION_FIELDS) && typeof e.sourceId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(e.sourceId)
    && typeof e.sourceSha256 === 'string' && /^[a-f0-9]{64}$/u.test(e.sourceSha256) && grade(e.expectedGrade)
    && e.expectedCourseKey === 'fen-bilimleri' && code(e.expectedOutcomeCode);
}
function emptyAdvisory() {
  return { performed: false, engine: 'JevQualityAuditor', mode: 'local_heuristic_no_model', screenPassed: false, score: null,
    prototypeCodeRecognized: null, prototypeScopeMatch: null, duplicateOptionCheckPassed: null, lexicalAmbiguityCheckPassed: null,
    heuristicDifficultyScore: null, distractorEntryCountScore: null, lexicalSpellingCheckPassed: null, hintsPresent: null,
    reasons: [], reasonsTruncated: false };
}
const booleanOrNull = value => typeof value === 'boolean' ? value : null;
const scoreOrNull = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
function projectAdvisory(result) {
  const raw = inert(result);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || typeof raw.passed !== 'boolean' || scoreOrNull(raw.score) === null
    || !Array.isArray(raw.reasons) || raw.reasons.length > 16 || raw.reasons.some(reason => typeof reason !== 'string')) reject();
  const decisions = raw.decisions && typeof raw.decisions === 'object' && !Array.isArray(raw.decisions) ? raw.decisions : {};
  return { performed: true, engine: 'JevQualityAuditor', mode: 'local_heuristic_no_model', screenPassed: raw.passed, score: raw.score,
    prototypeCodeRecognized: booleanOrNull(decisions.curriculum_code_recognized),
    prototypeScopeMatch: booleanOrNull(decisions.curriculum_registry_match),
    duplicateOptionCheckPassed: booleanOrNull(decisions.single_deterministic_answer),
    lexicalAmbiguityCheckPassed: booleanOrNull(decisions.zero_ambiguity),
    heuristicDifficultyScore: scoreOrNull(decisions.difficulty_alignment), distractorEntryCountScore: scoreOrNull(decisions.distractor_strength_score),
    lexicalSpellingCheckPassed: booleanOrNull(decisions.tdk_compliance), hintsPresent: booleanOrNull(decisions.has_pedagogical_hints),
    reasons: raw.reasons.map(reason => reason.slice(0, 512)), reasonsTruncated: raw.reasons.some(reason => reason.length > 512) };
}
function report({ state = 'input_rejected', errors = ['science_jev_invalid_input'], questionSha256 = null, expectationSha256 = null,
  scopeExpectation = null, advisory = emptyAdvisory(), jevAuditorCalls = 0 } = {}) {
  const result = { schemaVersion: 'science-jev-screen/v1', state, artifactAudience: 'editor_only', errors,
    questionSha256, expectationSha256, scopeExpectation, advisory, limitations: [...LIMITATIONS],
    counts: { screenedCandidates: advisory.performed ? 1 : 0, generatedQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    activity: { jevAuditorCalls, providersCalled: 0, networkCallsMade: 0, generationCallsMade: 0, fallbacksProduced: 0 },
    gates: { ...GATES }, governance: { purpose: 'editor_science_local_advisory', owner: 'pending', steward: 'pending', retention: 'pending', realLearnerDataPresent: false }, ...FLAGS };
  result.contentSha256 = hash('report', result);
  if (Buffer.byteLength(JSON.stringify(result)) > 16384) throw new Error('science_jev_output_budget');
  return freeze(result);
}

/** Only advisory screening of one closed question against an explicit declared
 * source expectation. No source review, exact science oracle or learner model. */
export async function screenScienceQuestionWithJev(question, sourceExpectation) {
  if (arguments.length !== 2) return report({ errors: ['science_jev_invalid_arguments'] });
  let q, e;
  try { q = inert(question); e = inert(sourceExpectation); if (!validQuestion(q) || !validExpectation(e)) return report(); }
  catch { return report(); }
  const scope = { ...e, state: 'caller_declared_editor_scope_not_source_validation', prototypeCourseKey: 'fen',
    sourceRecordDeclared: true, officialSourceValidated: false, gradeMatch: q.grade === e.expectedGrade,
    outcomeMatch: q.outcomeCode !== null && e.expectedOutcomeCode !== null && q.outcomeCode === e.expectedOutcomeCode };
  const bound = { questionSha256: hash('question', q), expectationSha256: hash('expectation', e), scopeExpectation: scope };
  const errors = [];
  if (!scope.gradeMatch) errors.push('science_grade_expectation_mismatch');
  if (q.outcomeCode === null || e.expectedOutcomeCode === null) errors.push('science_outcome_expectation_unbound');
  else if (!scope.outcomeMatch) errors.push('science_outcome_expectation_mismatch');
  if (errors.length) return report({ ...bound, state: 'scope_mismatch', errors });

  // Canonical course key remains fen-bilimleri in the evidence. Only this local
  // prototype lookup expects fen; no legacy code alias substitutes for FB.
  try {
    const auditor = new JevQualityAuditor();
    const raw = await auditor.evaluateQuestion({ ...q }, {
      expectedGrade: e.expectedGrade, expectedCourseKey: 'fen', expectedOutcomeCode: e.expectedOutcomeCode,
    });
    return report({ ...bound, state: 'advisory_scored', errors: [], advisory: projectAdvisory(raw), jevAuditorCalls: 1 });
  } catch {
    return report({ ...bound, state: 'screen_unavailable', errors: ['science_jev_engine_unavailable'], jevAuditorCalls: 1 });
  }
}
