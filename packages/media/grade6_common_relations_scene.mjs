import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6CommonRelationsDraft, verifyGrade6CommonRelationsDraft } from '../content-factory/grade6_common_relations_draft.mjs';
import { createGrade6CommonRelationsMediaPreparation } from '../content-factory/grade6_common_relations_media_adapter.mjs';
import { auditReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';
import { auditReasonedMediaJob } from './reasoned_media_job.mjs';
import { paginateReasonedCaptionText } from './reasoned_caption_text.mjs';

const plans = new WeakSet(), privateSources = new WeakMap();
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
const fail = code => { throw new Error(code); };
const bytesHash = text => createHash('sha256').update(text).digest('hex');
const hash = value => bytesHash(JSON.stringify(value));
const digest = (kind, value) => bytesHash(`k12.grade6-common-relations.${kind}/v1:${JSON.stringify(value)}`);
const escape = value => String(value).replace(/[&<>"']/gu, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const freeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

// Inspect descriptors before any access, audit, clone or hash. No foreign data
// hooks, hidden keys, sparse arrays or user-controlled XML are consumed.
function inert(input, code) {
  const visiting = new WeakSet(); let nodes = 0, bytes = 0;
  function copy(value, depth = 0) {
    if (++nodes > 50000 || depth > 24) fail(code);
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') { if (!Number.isFinite(value) || Math.abs(value) > 1e9) fail(code); return value; }
    if (typeof value === 'string') {
      bytes += Buffer.byteLength(value);
      if (value.length > 65536 || bytes > 2 * 1024 * 1024 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) fail(code);
      return value;
    }
    if (!value || typeof value !== 'object' || isProxy(value) || visiting.has(value)) fail(code);
    const array = Array.isArray(value), prototype = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype : ![Object.prototype, null].includes(prototype)) fail(code);
    const keys = Reflect.ownKeys(value);
    if (keys.length > (array ? 513 : 128)) fail(code);
    for (const key of keys) {
      if (typeof key !== 'string' || key.length > 256 || /[\u0000-\u001f]/u.test(key)) fail(code);
      const keyBytes = Buffer.byteLength(key); bytes += keyBytes;
      if (keyBytes > 256 || bytes > 2 * 1024 * 1024) fail(code);
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (keys.some(key => !Object.hasOwn(descriptors[key], 'value')
      || !descriptors[key].enumerable && !(array && key === 'length'))) fail(code);
    visiting.add(value); let output;
    if (array) {
      if (value.length > 512 || keys.length !== value.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9][0-9]*)$/u.test(key))) fail(code);
      output = Array.from({ length: value.length }, (_, index) => {
        if (!Object.hasOwn(descriptors, String(index))) fail(code);
        return copy(descriptors[String(index)].value, depth + 1);
      });
    } else output = Object.fromEntries(keys.map(key => [key, copy(descriptors[key].value, depth + 1)]));
    visiting.delete(value); return output;
  }
  return copy(input);
}
function fields(value, expected, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== expected.length
    || expected.some(key => !Object.hasOwn(value, key))) fail(code);
}
function limits() {
  return { audience: 'editor_review_only', serializedAuthority: 'none', inferredAnswerProtection: false,
    genericRendererSupported: false, numericStepsChecked: 0, semanticReview: 'pending',
    teacherApproved: false, publicationReady: false, learnerReady: false, productionReady: false,
    audioGenerated: false, videoRendered: false, wordPenAlignmentVerified: false, accessibilityPassed: false,
    providerCallsMade: 0, learnerEvidenceCollected: false, humanApproval: null, freshPdfByteChecks: 0 };
}

/** A separate live common-relations scene capability, never a generic scene
 * brand or authenticated source PDF. Public data omits future narration. */
export function createGrade6CommonRelationsScenePlan(input) {
  if (arguments.length !== 1) fail('invalid_common_relations_scene_arguments');
  let data, source, preparation;
  try {
    data = inert(input, 'invalid_common_relations_scene_input');
    fields(data, ['source', 'sourceBindingInput', 'preparation'], 'invalid_common_relations_scene_input');
    // Snapshot equality alone cannot mint the old trace/job capabilities.
    // These audits are on inert-checked originals, not on the snapshot clones.
    const original = Object.getOwnPropertyDescriptors(input).preparation.value;
    if (!Array.isArray(original.contexts) || original.contexts.length !== 2) fail('invalid_common_relations_scene_input');
    for (const context of original.contexts) { auditReasonedTeachingTrace(context.trace); auditReasonedMediaJob(context.job); }
    if (!verifyGrade6CommonRelationsDraft(data.source, data.sourceBindingInput).valid) fail('invalid_common_relations_scene_input');
    source = createGrade6CommonRelationsDraft(data.sourceBindingInput);
    preparation = createGrade6CommonRelationsMediaPreparation(source, data.sourceBindingInput);
    if (!same(data.source, source) || !same(data.preparation, preparation)) fail('invalid_common_relations_scene_input');
  } catch { fail('invalid_common_relations_scene_input'); }
  // Caller-owned objects are never read after this point.
  const [repeat, grouping] = source.problem.contexts;
  const givenGeometry = {
    repeat: { intervals: [...repeat.intervals], startMinute: repeat.startMinute, window: { ...repeat.window },
      sequences: source.representation.repeatSequences.map(values => [...values]), viewBox: { x: 0, y: 0, width: 760, height: 260 } },
    grouping: { totals: [...grouping.itemCounts], examplePackageSize: grouping.examplePackageSize,
      rows: source.representation.groupRows.map(row => ({ size: row.size, packageCounts: [...row.packageCounts] })),
      viewBox: { x: 0, y: 0, width: 760, height: 300 } },
  };
  const plan = { schemaVersion: 'grade6-common-relations-scene-plan/v1', state: 'common_relations_scene_plan_draft',
    source: { id: source.id, contentSha256: source.contentSha256, authoredTaskSha256: source.authoredTaskSha256,
      pdfSha256: source.sourceLineage.sourceSha256, applicationMetadataSha256: source.sourceLineage.applicationMetadataSha256,
      priorMatrixMetadataSha256: source.sourceLineage.priorMatrixMetadataSha256, sourceRowMetadataSha256: source.sourceLineage.sourceRowMetadataSha256 },
    preparationSha256: preparation.contentSha256,
    contexts: preparation.contexts.map(context => ({ contextId: context.contextId, cueCount: context.job.cues.length,
      trace: { id: context.trace.id, contentSha256: context.trace.contentSha256 }, job: { id: context.job.id, contentSha256: context.job.contentSha256 },
      requestSha256: context.audioRequest.contentSha256, literalUnits: context.contextId === 'repeat' ? ['minute'] : ['card_per_package', 'package'] })),
    givenGeometry, geometrySha256: hash(givenGeometry), sourceBinding: source.sourceLineage.state,
    frameRepresentation: 'specialized_common_relations_data_derived_svg_not_original_svg_embedding',
    sourceDiagramOrigin: 'canonical_own_authored_draft_not_source_pdf',
    counts: { existingAuthoredDrafts: 1, newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 },
    gates: { ...source.gates }, ...limits(),
    pending: ['teacher_semantic_and_age_review', 'rights_owner_steward_retention_review', 'native_glyph_geometry_and_accessibility_review',
      'transfer_geometry_not_in_source', 'audio_video_and_word_pen_alignment', 'student_delivery_authorization'],
  };
  plan.contentSha256 = digest('scene', plan);
  if (Buffer.byteLength(JSON.stringify(plan)) > 16384) fail('invalid_common_relations_scene_input');
  freeze(plan); privateSources.set(plan, { source, preparation }); plans.add(plan); return plan;
}

function options(input, source) {
  const data = inert(input, 'invalid_common_relations_frame_options');
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(key => !['contextId', 'cueIndex', 'progress', 'reveal', 'pageIndex'].includes(key))) fail('invalid_common_relations_frame_options');
  const contextId = Object.hasOwn(data, 'contextId') ? data.contextId : 'repeat';
  const cueIndex = Object.hasOwn(data, 'cueIndex') ? data.cueIndex : 0, pageIndex = Object.hasOwn(data, 'pageIndex') ? data.pageIndex : 0;
  const progress = Object.hasOwn(data, 'progress') ? data.progress : 0, reveal = Object.hasOwn(data, 'reveal') ? data.reveal : false;
  if (!['repeat', 'grouping'].includes(contextId) || !Number.isSafeInteger(cueIndex) || cueIndex < 0
    || !Number.isSafeInteger(pageIndex) || pageIndex < 0 || pageIndex >= 32 || typeof progress !== 'number'
    || !Number.isFinite(progress) || progress < 0 || progress > 1 || typeof reveal !== 'boolean') fail('invalid_common_relations_frame_options');
  const context = source.preparation.contexts.find(value => value.contextId === contextId);
  if (cueIndex >= context.job.cues.length) fail('invalid_common_relations_frame_options');
  return { context, contextId, cueIndex: cueIndex === 0 ? 0 : cueIndex, pageIndex: pageIndex === 0 ? 0 : pageIndex,
    progress: progress === 0 ? 0 : progress, reveal };
}
const point = (x, y) => ({ x, y });
const line = (anchorKind, ...points) => ({ anchorKind, points });
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const pathLength = path => path.points.slice(1).reduce((sum, p, index) => sum + distance(path.points[index], p), 0);
function progressive(paths, progress, semanticRegion) {
  const totalLength = paths.reduce((sum, path) => sum + pathLength(path), 0), drawnLength = totalLength * progress;
  let remaining = drawnLength, pen = null; const drawn = [];
  for (const path of paths) {
    if (remaining <= 0) break;
    const points = [path.points[0]];
    for (let index = 1; index < path.points.length && remaining > 0; index++) {
      const a = path.points[index - 1], b = path.points[index], length = distance(a, b);
      if (remaining >= length) { points.push(b); remaining -= length; }
      else { const fraction = remaining / length; points.push(point(a.x + (b.x - a.x) * fraction, a.y + (b.y - a.y) * fraction)); remaining = 0; }
    }
    if (points.length > 1) { drawn.push({ anchorKind: path.anchorKind, points }); pen = points.at(-1); }
  }
  return { semanticRegion, progress, totalLength, drawnLength, paths: drawn, pen };
}
function highlight(contextId, cue, progress, locked, transfer, source) {
  if (locked || transfer) return progressive([], progress, 'none');
  let semanticRegion, paths;
  if (protectedKinds.has(cue.kind)) {
    semanticRegion = 'canonical_result';
    paths = contextId === 'repeat'
      ? source.explanation.paths[0].result.flatMap(minute => [70, 138].map(y => {
        const x = 120 + minute * 12;
        return line('canonical_result', point(x - 12, y - 12), point(x + 12, y - 12),
          point(x + 12, y + 12), point(x - 12, y + 12), point(x - 12, y - 12));
      }))
      : source.representation.groupRows.map((_, index) => {
        const y = 100 + index * 32;
        return line('canonical_result', point(28, y - 16), point(732, y - 16), point(732, y + 10), point(28, y + 10), point(28, y - 16));
      });
  } else if (['why', 'check_prompt'].includes(cue.kind)) {
    semanticRegion = 'operation_purpose';
    paths = contextId === 'repeat'
      ? [line('operation_purpose', point(120, 70), point(696, 70)), line('operation_purpose', point(120, 138), point(696, 138))]
      : [line('operation_purpose', point(28, 76), point(732, 76))];
  } else {
    semanticRegion = 'given_conditions';
    paths = contextId === 'repeat' ? [line('given_conditions', point(120, 208), point(696, 208))]
      : [line('given_conditions', point(350, 72), point(526, 72)), line('given_conditions', point(556, 72), point(732, 72))];
  }
  return progressive(paths, progress, semanticRegion);
}
function timeline(source) {
  const repeat = source.problem.contexts[0], x = minute => 120 + minute * 12;
  const rows = source.representation.repeatSequences.map((values, index) => {
    const y = index === 0 ? 70 : 138, color = index === 0 ? '#23596a' : '#87541d';
    const marks = [repeat.startMinute, ...values].map(minute => {
      const inside = minute > repeat.window.from && (minute < repeat.window.to || minute === repeat.window.to && repeat.window.toInclusive);
      const common = `data-series="${index === 0 ? 'six-minute' : 'eight-minute'}" data-minute="${minute}" data-in-window="${inside}" fill="${inside ? color : '#ffffff'}" stroke="${color}" stroke-width="2"${inside ? '' : ' stroke-dasharray="3 2"'}`;
      return `${index === 0 ? `<circle ${common} cx="${x(minute)}" cy="${y}" r="6"/>` : `<rect ${common} x="${x(minute) - 6}" y="${y - 6}" width="12" height="12"/>`}
<text x="${x(minute)}" y="${y + 34}" text-anchor="middle" font-size="18">${minute}</text>`;
    }).join('');
    return `<line x1="120" y1="${y}" x2="696" y2="${y}" stroke="#b6cbd0"/><text x="20" y="${y + 6}" font-size="18">${repeat.intervals[index]} dk</text>${marks}`;
  }).join('');
  return `<text x="24" y="26" font-size="18">Dakika işaretleri · Daire: 6 dk; kare: 8 dk</text>${rows}
<line x1="120" y1="208" x2="696" y2="208" stroke="#647f8b"/><text x="120" y="236" text-anchor="middle" font-size="18">0 hariç</text><text x="408" y="236" text-anchor="middle" font-size="18">Dakika</text><text x="696" y="236" text-anchor="middle" font-size="18">48 dahil</text>`;
}
function grouping(source) {
  const rows = source.representation.groupRows.map((row, index) => {
    const y = 100 + index * 32;
    return `<line x1="28" y1="${y + 10}" x2="732" y2="${y + 10}" stroke="#dce5e8"/>${[row.size, ...row.packageCounts].map((value, column) =>
      `<text data-group-row="${index}" data-group-column="${column}" x="${[140, 440, 644][column]}" y="${y}" text-anchor="middle" font-size="18">${value}</text>`).join('')}`;
  }).join('');
  return `<text x="24" y="26" font-size="18">Türler ayrı; bütün kartlar kullanılır. Boyut, paket adedi değildir.</text>
<text x="140" y="64" text-anchor="middle" font-size="18">Boyut (kart/paket)</text><text x="440" y="64" text-anchor="middle" font-size="18">24 kart: paket sayısı</text><text x="644" y="64" text-anchor="middle" font-size="18">36 kart: paket sayısı</text>${rows}`;
}
const pathD = points => points.map((p, index) => `${index ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');

/** Current cue only. An explicit reveal presentation gate, not learner auth or
 * anti-cheat: the given diagram/table itself makes the mathematics inferable. */
export function renderGrade6CommonRelationsCaptionFrame(plan, inputOptions) {
  if (arguments.length !== 2) fail('invalid_common_relations_frame_arguments');
  if (!plan || typeof plan !== 'object' || isProxy(plan) || !plans.has(plan)) fail('untrusted_common_relations_scene_plan');
  const privateSource = privateSources.get(plan), { context, contextId, cueIndex, pageIndex, progress, reveal } = options(inputOptions, privateSource);
  const cue = context.job.cues[cueIndex], protectedCue = protectedKinds.has(cue.kind), resultVisible = protectedCue && reveal && progress === 1;
  const responseLocked = protectedCue && !resultVisible, transfer = cue.kind.startsWith('transfer_');
  const fullTranscript = responseLocked ? null : cue.transcript;
  const displayText = responseLocked ? 'Yanıt henüz gösterilmiyor. Açık reveal ve tamamlanmış ilerleme gerekiyor.' : fullTranscript;
  const pagination = paginateReasonedCaptionText(displayText);
  if (pageIndex >= pagination.pages.length) fail('invalid_common_relations_frame_options');
  const selectedPage = pagination.pages[pageIndex], currentCaption = selectedPage.lines.join(' ');
  const sourceHeight = transfer ? 70 : contextId === 'repeat' ? 260 : 300, height = sourceHeight + 116;
  const h = highlight(contextId, cue, progress, responseLocked, transfer, privateSource.source);
  const safeName = `Ortak ilişki · ${contextId === 'repeat' ? 'Zaman' : 'Paket'} · ${currentCaption}`;
  const sourceSvg = transfer ? '<text x="24" y="38" font-size="18">Yeni aktarım geometrisi kaynak taslakta yok; gösterim bekliyor.</text>'
    : contextId === 'repeat' ? timeline(privateSource.source) : grouping(privateSource.source);
  const strokes = h.paths.map(path => `<path d="${pathD(path.points)}" fill="none" stroke="#b84b26" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const pen = h.pen ? `<g data-layer="programmatic-pen"><circle cx="${h.pen.x}" cy="${h.pen.y}" r="4" fill="#203b50"/><path d="M ${h.pen.x} ${h.pen.y} l 7 -13 l 5 3 Z" fill="#f1bd46" stroke="#203b50"/></g>` : '';
  const caption = selectedPage.lines.map((value, index) => `<text data-caption-line="${index}" x="24" y="${sourceHeight + 44 + index * 30}" font-size="18" xml:space="preserve">${escape(value)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${height}" viewBox="0 0 760 ${height}" role="img" aria-label="${escape(safeName)}"><title>${escape(safeName)}</title><desc>${escape(safeName)}</desc><rect width="760" height="${height}" fill="#fffaf1"/><g font-family="sans-serif" fill="#183342">${sourceSvg}<g data-layer="current-cue-highlight">${strokes}${pen}</g><line x1="24" y1="${sourceHeight + 16}" x2="736" y2="${sourceHeight + 16}" stroke="#dce5e8"/><g data-layer="current-caption">${caption}</g></g></svg>`;
  if (Buffer.byteLength(svg) > 65536) fail('common_relations_frame_output_budget');
  const meta = plan.contexts.find(value => value.contextId === contextId);
  const binding = { contextId, cueId: cue.id, cueIndex, kind: cue.kind, progress, revealRequested: reveal, resultVisible, responseLocked,
    pageIndex, pageCount: pagination.pages.length, source: plan.source, trace: meta.trace, job: meta.job,
    scenePlanSha256: plan.contentSha256, preparationSha256: plan.preparationSha256, geometrySha256: plan.geometrySha256 };
  const pending = ['teacher_semantic_and_age_review', 'rights_and_owner_review', 'native_glyph_geometry_and_accessibility_review',
    'minute_and_package_caption_atom_review', 'audio_video_word_pen_alignment_not_implemented',
    ...(transfer ? ['transfer_geometry_not_in_source'] : [])];
  const result = resultVisible && !transfer ? { values: [...context.path.result], unit: context.path.unit } : null;
  const frame = { schemaVersion: 'grade6-common-relations-caption-frame/v1', state: 'current_cue_svg_frame_draft',
    svg, svgSha256: bytesHash(svg), ...binding, selectedPage, selectedPageSha256: hash(selectedPage),
    fullTranscriptSha256: fullTranscript === null ? null : bytesHash(fullTranscript), result, literalUnits: [...meta.literalUnits],
    highlight: h, penMeaning: 'programmatic_highlight_not_human_handwriting',
    sourceVisualId: transfer ? null : contextId === 'repeat' ? 'own-repeat-timeline' : 'own-group-table', sourceDiagramProof: !transfer,
    sourceDiagramOrigin: plan.sourceDiagramOrigin, frameRepresentation: plan.frameRepresentation,
    representationStatus: transfer ? 'transfer_geometry_not_in_source_pending' : responseLocked ? 'protected_response_geometry_locked' : 'canonical_given_geometry_with_current_cue_highlight',
    captionLayout: { fontSizeSvgUnits: 18, sourceHeightSvgUnits: sourceHeight, reservedLines: 2, glyphFitVerified: false,
      newUnitAtomsVerified: false, geometryRescaled: false, measurement: 'utf16_code_units_not_rendered_glyph_width' },
    ...limits(), pending };
  frame.contentSha256 = digest('frame', frame);
  const narrationPacket = { schemaVersion: 'grade6-common-relations-current-narration/v1', state: 'current_cue_editor_narration_draft',
    ...binding, frameSha256: frame.contentSha256, frameSvgSha256: frame.svgSha256, contentFormat: pagination.contentFormat,
    transcriptVisibility: responseLocked ? 'protected_response_locked' : 'current_cue_only', fullTranscript,
    fullTranscriptSha256: fullTranscript === null ? null : bytesHash(fullTranscript),
    paging: pagination.paging, pages: pagination.pages, pagingSha256: pagination.pagingSha256,
    sourceDiagramProof: !transfer, representationStatus: frame.representationStatus, ...limits(), pending };
  narrationPacket.contentSha256 = digest('narration', narrationPacket);
  const output = { frame, narrationPacket };
  if (Buffer.byteLength(JSON.stringify(output)) > 131072) fail('common_relations_frame_output_budget');
  return freeze(output);
}
