import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGardenQuestion, createRectangleQuestion, validateQuestion } from '../content-factory/pilot.mjs';
import { createPerimeterLesson } from '../content-factory/perimeter_lesson.mjs';
import { createReasonedMathTrace } from '../content-factory/reasoned_math_adapter.mjs';
import { createReasonedPerimeterLessonTrace } from '../content-factory/reasoned_concept_lesson.mjs';
import { auditReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';
import { createReasonedMediaJob, auditReasonedMediaJob } from './reasoned_media_job.mjs';

const FAMILIES = new Set(['perimeter', 'area', 'width_from_area', 'width_from_perimeter', 'error_diagnosis', 'fence_gap', 'garden_two_rows']);
const bytesHash = value => createHash('sha256').update(value).digest('hex');
const hash = value => bytesHash(JSON.stringify(value));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fail = code => { throw new Error(code); };
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

// Inspect before any source access, hashing, root audit or regeneration. No
// user hooks, foreign objects, sparse arrays or unbounded SVG parsing.
function safeCopy(input) {
  const visiting = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 100000 || depth > 24) fail('invalid_reasoned_geometry_data');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('invalid_reasoned_geometry_data'); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 256 * 1024 || bytes > 2 * 1024 * 1024 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail('invalid_reasoned_geometry_data');
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail('invalid_reasoned_geometry_data');
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail('invalid_reasoned_geometry_data');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !Object.hasOwn(descriptors[key], 'value'))) fail('invalid_reasoned_geometry_data');
    visiting.add(value); let result;
    if (array) {
      if (value.length > 512 || keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('invalid_reasoned_geometry_data');
      result = Array.from({ length: value.length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail('invalid_reasoned_geometry_data');
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else result = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return result;
  }
  return copy(input);
}
function fields(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== expected.length
    || expected.some(key => !Object.hasOwn(value, key))) fail('invalid_reasoned_geometry_fields');
}
function sourceMetadata(metadata) {
  fields(metadata, ['source', 'curriculum', 'governance']);
  fields(metadata.source, ['sourceId', 'rightsStatus', 'purpose']);
  fields(metadata.governance, ['ownerId', 'stewardId', 'purpose', 'retentionPolicyId']);
  for (const value of [...Object.values(metadata.source), ...Object.values(metadata.governance)]) {
    if (typeof value !== 'string' || !value.trim() || value.length > 256) fail('reasoned_geometry_source_mismatch');
  }
  fields(metadata.curriculum, ['mappingStatus', 'registryEntryId', 'programVersion', 'grade', 'outcomeCode', 'sourceUrl', 'sourceSha256']);
  if (metadata.curriculum.mappingStatus !== 'unresolved' || ['registryEntryId', 'programVersion', 'grade', 'outcomeCode', 'sourceUrl', 'sourceSha256'].some(key => metadata.curriculum[key] !== null)) fail('reasoned_geometry_source_mismatch');
}
function canonicalSource(source) {
  if (source?.schemaVersion === 'perimeter-mini-lesson/v1') {
    const canonical = createPerimeterLesson();
    if (!same(source, canonical)) fail('reasoned_geometry_source_mismatch');
    return canonical;
  }
  if (source?.schemaVersion !== 'content-factory-pilot/v1' || !FAMILIES.has(source?.problem?.template)) fail('unsupported_reasoned_geometry_source');
  let canonical;
  try {
    sourceMetadata(source.metadata);
    canonical = source.problem.template === 'garden_two_rows'
      ? createGardenQuestion({ id: source.id, metadata: source.metadata })
      : createRectangleQuestion({ id: source.id, template: source.problem.template, width: source.problem.width, height: source.problem.height, gate: source.problem.gate, metadata: source.metadata });
    if (Object.hasOwn(source, 'review')) canonical.review = validateQuestion(canonical);
    if (!same(source, canonical)) fail('reasoned_geometry_source_mismatch');
    const review = validateQuestion(canonical);
    if (review.localMathChecks !== 'passed' || review.errors.length) fail('reasoned_geometry_source_mismatch');
  } catch { fail('reasoned_geometry_source_mismatch'); }
  return canonical;
}

// These parsers see regenerated, byte-equal local SVGs only, not arbitrary XML.
function matchNumbers(svg, pattern) {
  const match = svg.match(pattern);
  if (!match) fail('unsupported_reasoned_geometry_source');
  const result = match.slice(1).map(Number);
  if (result.some(value => !Number.isFinite(value))) fail('unsupported_reasoned_geometry_source');
  return result;
}
function asset(visual, id) {
  const [x, y, width, height] = matchNumbers(visual.svg, /viewBox="([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)"/u);
  return { id, format: visual.format, svg: visual.svg, alt: visual.alt, svgSha256: bytesHash(visual.svg), sourceVisualSha256: visual.sha256,
    coordinateSpace: 'svg_user_units', viewBox: { x, y, width, height } };
}
function sourceGeometry(source) {
  if (source.schemaVersion === 'perimeter-mini-lesson/v1') {
    const assets = source.visuals.map(visual => asset(visual, visual.id));
    const models = source.misconception.comparison.models.map(model => {
      const id = `rectangle-${model.width}x${model.height}`, instances = [];
      for (const visual of assets) {
        for (const match of visual.svg.matchAll(/<rect data-model="([a-z0-9-]+)" x="([0-9]+)" y="([0-9]+)" width="([0-9]+)" height="([0-9]+)"/gu)) {
          if (match[1] !== id) continue;
          const [x, y, width, height] = match.slice(2).map(Number), scale = width / model.width;
          if (scale !== height / model.height) fail('unsupported_reasoned_geometry_source');
          instances.push({ visualId: visual.id, bounds: { x, y, width, height }, gap: null, notToScale: false,
            pixelsPerLengthUnit: scale, scaleEvidence: 'canonical_unit_grid_model_bounds' });
        }
      }
      if (!instances.length) fail('unsupported_reasoned_geometry_source');
      return { id, dimensions: { width: model.width, height: model.height, unit: model.lengthUnit }, instances };
    });
    return { assets, models };
  }
  const visual = asset(source.visual, 'source-question-visual'), garden = source.problem.template === 'garden_two_rows';
  let x, y, width, height, gap = null;
  if (garden) {
    const [left, bottom, top, right, otherBottom, gapRight, gapLeft, gapY, otherLeft] = matchNumbers(visual.svg, /<path d="M([0-9]+) ([0-9]+) V([0-9]+) H([0-9]+) V([0-9]+) H([0-9]+) M([0-9]+) ([0-9]+) H([0-9]+)"/u);
    if (bottom !== otherBottom || bottom !== gapY || left !== otherLeft) fail('unsupported_reasoned_geometry_source');
    x = left; y = top; width = right - left; height = bottom - top;
    gap = { x: gapLeft, y: gapY, width: gapRight - gapLeft, height: 0 };
  } else {
    [x, y, width, height] = matchNumbers(visual.svg, /<rect x="([0-9]+)" y="([0-9]+)" width="([0-9]+)" height="([0-9]+)"/u);
    if (source.problem.template === 'fence_gap') {
      const [x1, y1, x2, y2] = matchNumbers(visual.svg, /<path d="M ([0-9]+) ([0-9]+) L ([0-9]+) ([0-9]+)" stroke="#fff8ec"/u);
      if (y1 !== y2) fail('unsupported_reasoned_geometry_source');
      gap = { x: x1, y: y1, width: x2 - x1, height: 0 };
    }
  }
  const w = garden ? source.problem.shortSide / source.problem.longSideRatio.denominator * source.problem.longSideRatio.numerator : source.problem.width;
  const h = garden ? source.problem.shortSide : source.problem.height;
  return { assets: [visual], models: [{ id: 'question-rectangle', dimensions: { width: w, height: h, unit: garden ? 'm' : 'cm' },
    instances: [{ visualId: visual.id, bounds: { x, y, width, height }, gap, notToScale: source.visual.notToScale,
      pixelsPerLengthUnit: null, scaleEvidence: 'source_explicitly_not_to_scale' }] }] };
}
function regions(models, feature, modelIndex = null) {
  return (modelIndex === null ? models : [models[modelIndex]]).flatMap(model => model.instances.map(instance => {
    const box = instance.bounds;
    let bounds = { ...box };
    if (feature === 'width_edge') bounds.height = 0;
    else if (feature === 'height_edge') bounds = { x: box.x + box.width, y: box.y, width: 0, height: box.height };
    else if (feature === 'gap') { if (!instance.gap) fail('reasoned_geometry_unknown_anchor'); bounds = { ...instance.gap }; }
    return { visualId: instance.visualId, modelId: model.id, feature, bounds,
      ...(feature === 'boundary_without_gap' ? { gap: instance.gap } : {}) };
  }));
}
function representation(models, kind, feature, modelIndex = null, extra = {}) {
  return { kind, status: kind.startsWith('logical_') || kind === 'text_claim' ? 'semantic_only_renderer_pending' : 'source_region_available_renderer_pending',
    regions: regions(models, feature, modelIndex), ...extra };
}
function boundAnchors(source, trace, models) {
  const lesson = trace.kind === 'concept_lesson', p = source.problem;
  const [first, second] = models;
  const w = first.dimensions.width, h = first.dimensions.height, unit = first.dimensions.unit, area = w * h, perimeter = 2 * (w + h);
  const spec = (value, targetUnit, feature, sourcePaths, kind = 'source_measurement', modelIndex = lesson ? 0 : null, extra = {}) => ({ value, unit: targetUnit, sourcePaths,
    representation: representation(models, kind, feature, modelIndex, extra) });
  const evidenceSpecs = lesson ? {
    'first-width': spec(w, unit, 'width_edge', ['misconception.comparison.models.0.width']),
    'first-height': spec(h, unit, 'height_edge', ['misconception.comparison.models.0.height']),
    'second-width': spec(second.dimensions.width, unit, 'width_edge', ['misconception.comparison.models.1.width'], 'source_measurement', 1),
    'second-height': spec(second.dimensions.height, unit, 'height_edge', ['misconception.comparison.models.1.height'], 'source_measurement', 1),
    'boundary-definition': spec(null, 'text', 'boundary', ['concept.perimeter'], 'logical_definition', null),
    'surface-definition': spec(null, 'text', 'interior', ['concept.area'], 'logical_definition', null),
  } : {
    side_width: spec(w, unit, 'width_edge', ['problem.width']), side_height: spec(h, unit, 'height_edge', ['problem.height']),
    given_area: spec(area, `${unit}²`, 'interior', ['problem.width', 'problem.height']),
    given_perimeter: spec(perimeter, unit, 'boundary', ['problem.width', 'problem.height']),
    edge_pairs: spec(2, 'unitless', 'boundary_pair', ['problem'], 'opposite_edge_pairs'),
    unit_square: spec(null, 'text', 'interior', ['problem.width', 'problem.height'], 'logical_definition'),
    area_relationship: spec(null, 'text', 'interior', ['problem.width', 'problem.height'], 'logical_definition'),
    learner_claim: spec(null, 'text', 'interior', ['prompt'], 'text_claim'),
    ...(p.template === 'fence_gap' || p.template === 'garden_two_rows' ? { gap_width: spec(p.gate ?? p.gateWidth, unit, 'gap', [p.template === 'fence_gap' ? 'problem.gate' : 'problem.gateWidth']) } : {}),
    ...(p.template === 'garden_two_rows' ? {
      short_side: spec(h, unit, 'height_edge', ['problem.shortSide']),
      ratio_denominator: spec(p.longSideRatio.denominator, 'unitless', 'height_edge', ['problem.longSideRatio.denominator'], 'logical_ratio'),
      ratio_numerator: spec(p.longSideRatio.numerator, 'unitless', 'width_edge', ['problem.longSideRatio.numerator'], 'logical_ratio'),
      wire_rows: spec(p.wireRows, 'unitless', 'boundary_without_gap', ['problem.wireRows'], 'logical_repeat', null, { repeatCount: p.wireRows }),
    } : {}),
  };
  const resultSpecs = lesson ? {
    'boundary-first': spec(perimeter, unit, 'boundary', ['misconception.comparison.models.0']),
    'area-first': spec(area, `${unit}²`, 'interior', ['misconception.comparison.models.0']),
    'area-second': spec(second.dimensions.width * second.dimensions.height, `${unit}²`, 'interior', ['misconception.comparison.models.1'], 'source_measurement', 1),
    'boundary-second': spec(2 * (second.dimensions.width + second.dimensions.height), unit, 'boundary', ['misconception.comparison.models.1'], 'source_measurement', 1),
    counterexample: spec(trace.steps.at(-1).result.value, 'text', 'comparison', ['misconception.comparison.models'], 'logical_comparison', null),
  } : {
    edge_pair: spec(w + h, unit, 'boundary_pair', ['problem']), full_perimeter: spec(perimeter, unit, 'boundary', ['problem']),
    covered_area: spec(area, `${unit}²`, 'interior', ['problem.width', 'problem.height']),
    area_check: spec(area, `${unit}²`, 'interior', ['problem.width', 'problem.height']),
    unknown_side: spec(w, unit, 'width_edge', ['problem.width', 'problem.height']),
    ...(p.template === 'fence_gap' ? { required_strip: spec(perimeter - p.gate, unit, 'boundary_without_gap', ['problem.width', 'problem.height', 'problem.gate']) } : {}),
    ...(p.template === 'garden_two_rows' ? {
      equal_part: spec(h / p.longSideRatio.denominator, unit, 'height_edge', ['problem.shortSide', 'problem.longSideRatio.denominator'], 'logical_partition'),
      long_side: spec(w, unit, 'width_edge', ['problem.shortSide', 'problem.longSideRatio']),
      one_row: spec(perimeter - p.gateWidth, unit, 'boundary_without_gap', ['problem.shortSide', 'problem.longSideRatio', 'problem.gateWidth']),
      total_wire: spec((perimeter - p.gateWidth) * p.wireRows, unit, 'boundary_without_gap', ['problem.shortSide', 'problem.longSideRatio', 'problem.gateWidth', 'problem.wireRows'], 'logical_repeat', null, { repeatCount: p.wireRows }),
    } : {}),
  };
  const anchors = trace.evidence.map(item => {
    const expected = evidenceSpecs[item.id];
    if (!expected || expected.value !== item.value || expected.unit !== item.unit) fail('reasoned_geometry_unknown_anchor');
    return { id: item.id, origin: 'evidence', sourceAnchor: item.anchor, meaning: item.text, inputAnchorIds: [], ...expected };
  });
  for (const step of trace.steps) {
    const expected = resultSpecs[step.id];
    if (!expected || expected.value !== step.result.value || expected.unit !== step.result.unit) fail('reasoned_geometry_unknown_anchor');
    anchors.push({ id: step.id, origin: 'result', sourceAnchor: null, meaning: step.result.meaning, inputAnchorIds: [...step.operation.inputIds], ...expected });
  }
  return anchors;
}
function cueBinding(cue, trace, anchors, assets) {
  if (cue.displayAnchorIds.some(id => !anchors.some(anchor => anchor.id === id))) fail('reasoned_geometry_unknown_anchor');
  const step = cue.stepId === null ? null : trace.steps.find(item => item.id === cue.stepId);
  if (cue.stepId !== null && !step) fail('reasoned_geometry_unknown_anchor');
  const transfer = cue.kind.startsWith('transfer_');
  let semantic;
  if (transfer) semantic = { kind: 'transfer_text', text: cue.transcript, sourceContainsTransferGeometry: false };
  else if (cue.kind === 'result') semantic = { kind: step.operation.kind === 'interpret' ? 'logical_result' : 'numeric_result', ...step.result, expression: step.expression, inputAnchorIds: [...step.operation.inputIds] };
  else semantic = { kind: cue.kind === 'evidence' ? 'source_evidence' : `${cue.kind}_text`, text: cue.transcript };
  return { id: cue.id, order: cue.order, kind: cue.kind, stepId: cue.stepId, transcript: cue.transcript,
    transcriptSha256: cue.transcriptSha256, styleSha256: cue.styleSha256, sourceVisualIds: assets.map(asset => asset.id),
    displayAnchorIds: [...cue.displayAnchorIds], semantic,
    representationStatus: transfer ? 'unsupported_new_geometry_pending' : 'source_geometry_bound_renderer_pending',
    pending: transfer ? ['transfer_geometry_not_in_canonical_source', 'real_renderer_binding'] : ['real_renderer_binding'] };
}

/** Pure canonical source/anchor binding. Never a renderer or approval gate. */
export function resolveReasonedMediaGeometry(input) {
  const data = safeCopy(input); fields(data, ['source', 'trace', 'job']);
  // Do not promote serialized data to a WeakSet-branded root artifact.
  const originals = Object.getOwnPropertyDescriptors(input);
  auditReasonedTeachingTrace(originals.trace.value);
  auditReasonedMediaJob(originals.job.value);
  const source = canonicalSource(data.source);
  const trace = source.schemaVersion === 'perimeter-mini-lesson/v1' ? createReasonedPerimeterLessonTrace() : createReasonedMathTrace(source);
  auditReasonedTeachingTrace(trace);
  if (!same(data.trace, trace)) fail('reasoned_geometry_trace_mismatch');
  const job = createReasonedMediaJob(trace, { style: data.job.style.text, provider: data.job.provider });
  const jobAudit = auditReasonedMediaJob(job);
  if (!same(data.job, job)) fail('reasoned_geometry_job_mismatch');
  const { assets, models } = sourceGeometry(source), anchors = boundAnchors(source, trace, models);
  const binding = {
    schemaVersion: 'reasoned-media-geometry-binding/v1', source: { ...trace.source },
    trace: { id: trace.id, kind: trace.kind, contentSha256: trace.contentSha256 }, job: { id: job.id, contentSha256: job.contentSha256 },
    sourceBinding: 'canonical_source_regenerated_and_verified', geometryStatus: 'canonical_source_geometry_bound_renderer_pending',
    assets, models, anchors, cues: job.cues.map(cue => cueBinding(cue, trace, anchors, assets)),
    sourceSvgBytesPreserved: true, coordinatePolicy: 'canonical_svg_user_units_not_inferred_physical_scale',
    state: 'geometry_binding_draft', audience: 'editor_review_only', learnerEvidence: 'none_collected',
    providerCallsMade: 0, sourceFilesRead: 0, privacyInspection: 'not_performed',
    rendererBound: false, videoRendered: false, audioGenerated: false, wordPenAlignmentVerified: false,
    teacherApproved: false, publicationReady: false, learnerReady: false, productionReady: false,
    expertReview: 'pending', curriculumReview: 'pending', rightsReview: 'pending',
    pending: [...new Set([...jobAudit.pending.filter(item => !['source_resolver', 'source_geometry_resolution'].includes(item)),
      'transfer_geometry_not_in_canonical_source', 'teacher_geometry_and_rationale_review'])],
  };
  binding.contentSha256 = hash(binding); return freeze(binding);
}
