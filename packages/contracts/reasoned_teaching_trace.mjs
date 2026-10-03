import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';

const TRUSTED = new WeakSet();
const units = new Set(['m', 'cm', 'm²', 'cm²', 'count', 'unitless', 'text']);
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const fail = message => { throw new Error(message); };

// Data only, bounded and accessor/proxy free. This does not classify prose for
// privacy, factual truth or pedagogical quality; no provider is called here.
function safeCopy(input) {
  const visiting = new WeakSet(); let nodes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 2048 || depth > 12) fail('invalid_teaching_data');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value.length > 4096 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_teaching_data');
      return value;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail('invalid_teaching_data');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('invalid_teaching_data');
    const array = Array.isArray(value);
    if (!array && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail('invalid_teaching_data');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value'))) fail('invalid_teaching_data');
    visiting.add(value);
    let result;
    if (array) {
      if (value.length > 64 || keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_teaching_data');
      result = Array.from({ length: value.length }, (_, i) => {
        if (!Object.hasOwn(descriptors, String(i))) fail('invalid_teaching_data');
        return copy(descriptors[String(i)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return result;
  }
  return copy(input);
}

function fields(value, expected) {
  if (!value || Array.isArray(value) || typeof value !== 'object' || Object.keys(value).sort().join(',') !== [...expected].sort().join(',')) fail('invalid_teaching_fields');
}
function text(value) { if (typeof value !== 'string' || !value.trim()) fail('invalid_teaching_text'); }
function id(value) { if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,79}$/u.test(value)) fail('invalid_teaching_id'); }
function unit(value) { if (!units.has(value)) fail('invalid_teaching_unit'); }
function strings(value, max = 16) {
  if (!Array.isArray(value) || !value.length || value.length > max) fail('invalid_teaching_list');
  value.forEach(text);
}
function numericOperation(kind, inputs) {
  if (inputs.some(item => typeof item.value !== 'number' || item.unit === 'text')) fail('invalid_teaching_arithmetic');
  const [a, b] = inputs;
  let value, outputUnit;
  if (kind === 'identity' && inputs.length === 1) { value = a.value; outputUnit = a.unit; }
  else if (kind === 'add' && inputs.length >= 2) {
    if (inputs.some(item => item.unit !== a.unit)) fail('teaching_unit_mismatch');
    value = inputs.reduce((sum, item) => sum + item.value, 0); outputUnit = a.unit;
  } else if (kind === 'subtract' && inputs.length === 2) {
    if (a.unit !== b.unit) fail('teaching_unit_mismatch');
    value = a.value - b.value; outputUnit = a.unit;
  } else if (kind === 'multiply' && inputs.length === 2) {
    value = a.value * b.value;
    if (a.unit === 'unitless') outputUnit = b.unit;
    else if (b.unit === 'unitless') outputUnit = a.unit;
    else if (a.unit === b.unit && ['cm', 'm'].includes(a.unit)) outputUnit = `${a.unit}²`;
    else fail('teaching_unit_mismatch');
  } else if (kind === 'divide' && inputs.length === 2) {
    if (b.value === 0) fail('invalid_teaching_arithmetic');
    value = a.value / b.value;
    if (b.unit === 'unitless') outputUnit = a.unit;
    else if (a.unit === b.unit) outputUnit = 'unitless';
    else if (a.unit === `${b.unit}²` && ['cm', 'm'].includes(b.unit)) outputUnit = b.unit;
    else fail('teaching_unit_mismatch');
  } else fail('invalid_teaching_arithmetic');
  if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail('invalid_teaching_arithmetic');
  const symbol = { add: ' + ', subtract: ' − ', multiply: ' × ', divide: ' ÷ ', identity: '' }[kind];
  return { value, unit: outputUnit, expression: inputs.map(item => item.value).join(symbol) };
}

/** Validate an authored explanation trace, not its factual/pedagogical truth. */
export function createReasonedTeachingTrace(input) {
  const draft = safeCopy(input);
  fields(draft, ['id', 'kind', 'source', 'goal', 'evidence', 'plan', 'steps', 'transfer', 'scope']);
  id(draft.id);
  if (!['question_solution', 'concept_lesson'].includes(draft.kind)) fail('invalid_teaching_kind');
  fields(draft.source, ['id', 'contentSha256']); id(draft.source.id);
  if (typeof draft.source.contentSha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(draft.source.contentSha256)) fail('invalid_teaching_source');
  fields(draft.goal, ['question', 'unit', 'measurement']); text(draft.goal.question); unit(draft.goal.unit); id(draft.goal.measurement);
  fields(draft.plan, ['route', 'why', 'conditions']); text(draft.plan.route); text(draft.plan.why); strings(draft.plan.conditions);
  fields(draft.transfer, ['prompt', 'answer']); text(draft.transfer.prompt); text(draft.transfer.answer);
  fields(draft.scope, ['gradeBand', 'prerequisite']); text(draft.scope.prerequisite);
  if (!['unassigned', '1-2', '3-4', '5-6', '7-8'].includes(draft.scope.gradeBand)) fail('invalid_teaching_scope');
  if (!Array.isArray(draft.evidence) || !draft.evidence.length || draft.evidence.length > 32 || !Array.isArray(draft.steps) || !draft.steps.length || draft.steps.length > 24) fail('invalid_teaching_list');
  const available = new Map();
  for (const evidence of draft.evidence) {
    fields(evidence, ['id', 'type', 'text', 'anchor', 'value', 'unit']); id(evidence.id); text(evidence.text); text(evidence.anchor); unit(evidence.unit);
    if (!['given', 'shape_property', 'definition', 'text'].includes(evidence.type)) fail('invalid_teaching_evidence');
    if (available.has(evidence.id)) fail('duplicate_teaching_id');
    if (evidence.unit === 'text' ? evidence.value !== null : typeof evidence.value !== 'number') fail('invalid_teaching_evidence');
    available.set(evidence.id, { ...evidence, origin: 'evidence' });
  }
  const steps = [];
  for (const step of draft.steps) {
    fields(step, ['id', 'why', 'operation', 'result', 'check']); id(step.id); text(step.why);
    if (available.has(step.id)) fail('duplicate_teaching_id');
    fields(step.operation, ['kind', 'inputIds']); strings(step.operation.inputIds, 8);
    const inputs = step.operation.inputIds.map(key => available.get(key) ?? fail('unbound_teaching_input'));
    fields(step.result, ['value', 'unit', 'meaning']); unit(step.result.unit); text(step.result.meaning);
    fields(step.check, ['prompt', 'answer']); text(step.check.prompt); text(step.check.answer);
    let expression = null;
    if (step.operation.kind === 'interpret') {
      text(step.result.value); if (step.result.unit !== 'text') fail('teaching_unit_mismatch');
    } else {
      const calculated = numericOperation(step.operation.kind, inputs);
      // No silent approximation: a wrong small intermediate can be amplified
      // by a later step. Decimal/rational rounding needs its own future policy.
      if (typeof step.result.value !== 'number' || calculated.value !== step.result.value) fail('teaching_numeric_mismatch');
      if (calculated.unit !== step.result.unit) fail('teaching_unit_mismatch');
      expression = calculated.expression;
    }
    const owned = { ...step, expression, dependsOn: [...new Set(inputs.filter(item => item.origin === 'result').map(item => item.id))] };
    steps.push(owned); available.set(step.id, { id: step.id, ...step.result, origin: 'result' });
  }
  if (steps.at(-1).result.unit !== draft.goal.unit) fail('teaching_target_mismatch');
  const trace = {
    schemaVersion: 'reasoned-teaching-trace/v1', version: '1.0.0', ...draft, steps,
    state: 'draft', publicationReady: false, semanticReview: 'pending', curriculumReview: 'pending',
    mediaStatus: 'new_narration_not_generated', learnerEvidence: 'none_collected',
    sourceBinding: 'declared_requires_source_resolver',
    governance: { ownerId: 'unassigned', stewardId: 'unassigned', purpose: 'editor_review', rightsStatus: 'pending', accessPolicy: 'review_only_no_students', retentionPolicyId: 'reasoning-review-v1' },
  };
  trace.contentSha256 = digest(trace); freeze(trace); TRUSTED.add(trace); return trace;
}

function trusted(trace) { if (!trace || typeof trace !== 'object' || !TRUSTED.has(trace)) fail('untrusted_teaching_trace'); }

export function auditReasonedTeachingTrace(trace) {
  trusted(trace);
  return freeze({ structuralChecks: 'passed', numericStepsChecked: trace.steps.filter(step => step.operation.kind !== 'interpret').length,
    semanticReview: 'pending', sourceBinding: trace.sourceBinding, curriculumReview: 'pending',
    publicationReady: false, mediaStatus: trace.mediaStatus,
    pending: ['source_resolver', 'expert_rationale_and_transfer_review', 'curriculum_mapping', 'age_accessibility_review', 'rights_and_owner_review', 'new_voice_video_review'],
  });
}

/** Editor-visible stage only: this presentation gate is not learner authorization. */
export function getReasonedTeachingStage(trace, options = {}) {
  trusted(trace);
  const values = safeCopy(options);
  if (!values || Array.isArray(values) || typeof values !== 'object' || Object.keys(values).some(key => !['stageIndex', 'reveal'].includes(key))) fail('invalid_teaching_options');
  const stageIndex = Object.hasOwn(values, 'stageIndex') ? values.stageIndex : 0;
  const reveal = Object.hasOwn(values, 'reveal') ? values.reveal : false;
  const stageCount = trace.steps.length + 5;
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= stageCount || typeof reveal !== 'boolean') fail('invalid_teaching_options');
  const numericIndex = stageIndex - 3;
  let kind, title, explanation, result = null, check = null, inputIds = [], expression = null;
  if (stageIndex === 0) { kind = 'goal'; title = 'Ne isteniyor?'; explanation = trace.goal.question; }
  else if (stageIndex === 1) { kind = 'evidence'; title = 'Bilgi ve kanıt neyi anlatıyor?'; explanation = 'Verilen bilgiyi ait olduğu büyüklük veya metin kanıtıyla birlikte ele al.'; }
  else if (stageIndex === 2) { kind = 'plan'; title = 'Neden bu yolu seçiyoruz?'; explanation = `${trace.plan.route} ${trace.plan.why}`; }
  else if (numericIndex < trace.steps.length) {
    kind = 'reasoning'; title = `Gerekçeli adım ${numericIndex + 1}`;
    const step = trace.steps[numericIndex]; explanation = step.why; inputIds = step.operation.inputIds;
    result = reveal ? step.result : null; expression = reveal ? step.expression : null;
    check = { prompt: step.check.prompt, answer: reveal ? step.check.answer : null };
  } else if (stageIndex === stageCount - 2) {
    kind = 'summary'; title = 'Sonucu koşulla kontrol et'; explanation = trace.steps.at(-1).result.meaning;
  } else { kind = 'transfer'; title = 'Başka bir durumda ne değişir?'; explanation = trace.transfer.prompt; check = { prompt: trace.transfer.prompt, answer: reveal ? trace.transfer.answer : null }; }
  const requiresReveal = ['reasoning', 'transfer'].includes(kind);
  const previousCount = Math.max(0, Math.min(numericIndex, trace.steps.length));
  return freeze({ traceId: trace.id, source: trace.source, contentSha256: trace.contentSha256, stageIndex, stageCount,
    kind, title, explanation, result, expression, check, inputIds,
    goal: trace.goal, evidence: trace.evidence, conditions: trace.plan.conditions,
    priorResults: trace.steps.slice(0, previousCount).map(step => ({ id: step.id, ...step.result })),
    requiresReveal, reveal, canAdvance: stageIndex < stageCount - 1 && (!requiresReveal || reveal),
    publicationReady: false, mediaStatus: trace.mediaStatus,
  });
}
