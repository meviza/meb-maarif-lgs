import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { resolveReasonedMediaGeometry } from './reasoned_geometry_resolver.mjs';
import { paginateReasonedCaptionText } from './reasoned_caption_text.mjs';

const plans = new WeakSet();
const protectedKinds = new Set(['result', 'check_answer', 'summary', 'transfer_answer']);
const representation = 'derived_safe_geometry_not_original_svg_embedding';
const bytesHash = value => createHash('sha256').update(value).digest('hex');
const hash = value => bytesHash(JSON.stringify(value));
const fail = code => { throw new Error(code); };
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const point = (x, y) => ({ x, y });
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function limits() {
  return { audience: 'editor_review_only', privacyInspection: 'not_performed', providerCallsMade: 0, sourceFilesRead: 0,
    videoRendered: false, audioGenerated: false, wordPenAlignmentVerified: false,
    teacherApproved: false, publicationReady: false, learnerReady: false, productionReady: false,
    expertReview: 'pending', curriculumReview: 'pending', rightsReview: 'pending' };
}

// The frame API has only three primitive options. Inspect descriptors before
// access; reject proxies (including revoked proxies) without triggering hooks.
function frameOptions(input, cueCount) {
  if (!input || typeof input !== 'object' || isProxy(input) || Array.isArray(input)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) fail('invalid_reasoned_scene_options');
  const keys = Reflect.ownKeys(input), descriptors = Object.getOwnPropertyDescriptors(input);
  if (keys.length > 3 || keys.some(key => !['cueIndex', 'progress', 'reveal'].includes(key)
    || !Object.hasOwn(descriptors[key], 'value'))) fail('invalid_reasoned_scene_options');
  const cueIndex = Object.hasOwn(descriptors, 'cueIndex') ? descriptors.cueIndex.value : 0;
  const progress = Object.hasOwn(descriptors, 'progress') ? descriptors.progress.value : 0;
  const reveal = Object.hasOwn(descriptors, 'reveal') ? descriptors.reveal.value : false;
  if (!Number.isInteger(cueIndex) || cueIndex < 0 || cueIndex >= cueCount
    || typeof progress !== 'number' || !Number.isFinite(progress) || progress < 0 || progress > 1
    || typeof reveal !== 'boolean') fail('invalid_reasoned_scene_options');
  return { cueIndex, progress: progress === 0 ? 0 : progress, reveal };
}

/** Editor-only immutable scene plan. Original root brands are audited afresh. */
export function createReasonedScenePlan(input) {
  const geometry = resolveReasonedMediaGeometry(input);
  const plan = { schemaVersion: 'reasoned-svg-scene-plan/v1', state: 'source_bound_svg_scene_plan_draft',
    source: geometry.source, trace: geometry.trace, job: geometry.job, geometrySha256: geometry.contentSha256,
    sourceBinding: geometry.sourceBinding, assets: geometry.assets, models: geometry.models,
    anchors: geometry.anchors, cues: geometry.cues, sourceSvgBytesPreserved: true,
    frameRepresentation: representation, coordinatePolicy: geometry.coordinatePolicy,
    penMeaning: 'programmatic_highlight_pen_not_human_handwriting', svgScenePrepared: true,
    ...limits(), pending: [...new Set([...geometry.pending, 'raster_and_motion_visual_review',
      'cue_text_geometry_meaning_review', 'word_pen_alignment_not_implemented'])] };
  plan.contentSha256 = hash(plan); freeze(plan); plans.add(plan); return plan;
}

function cueAnchors(plan, cue) {
  return cue.displayAnchorIds.map(id => plan.anchors.find(anchor => anchor.id === id));
}
function chooseAsset(plan, anchors) {
  // Prefer the visual containing the most distinct cue models. This selects
  // the comparison visual when both concept models are actually relevant.
  return plan.assets.reduce((best, asset) => {
    const count = new Set(anchors.flatMap(anchor => anchor.representation.regions
      .filter(region => region.visualId === asset.id).map(region => region.modelId))).size;
    return !best || count > best.count ? { asset, count } : best;
  }, null).asset;
}
function instanceFor(plan, region) {
  return plan.models.find(model => model.id === region.modelId).instances.find(instance => instance.visualId === region.visualId);
}
function boundary(bounds) {
  const { x, y, width: w, height: h } = bounds;
  return [point(x, y), point(x + w, y), point(x + w, y + h), point(x, y + h), point(x, y)];
}
function openBoundary(bounds, gap) {
  const { x, y, width: w, height: h } = bounds;
  return [point(gap.x + gap.width, gap.y), point(x + w, y + h), point(x + w, y),
    point(x, y), point(x, y + h), point(gap.x, gap.y)];
}
function regionPath(plan, anchor, region, occurrence) {
  const { x, y, width: w, height: h } = region.bounds;
  const instance = instanceFor(plan, region), box = instance.bounds;
  switch (region.feature) {
    case 'width_edge':
      return occurrence % 2 === 0 ? [point(x, y), point(x + w, y)]
        : [point(box.x + box.width, box.y + box.height), point(box.x, box.y + box.height)];
    case 'height_edge':
      return occurrence % 2 === 0 ? [point(x, y), point(x, y + h)]
        : [point(box.x, box.y + box.height), point(box.x, box.y)];
    case 'gap': return [point(x, y), point(x + w, y)];
    case 'boundary': case 'comparison': return boundary(region.bounds);
    case 'boundary_pair':
      return anchor.representation.kind === 'opposite_edge_pairs' ? boundary(region.bounds)
        : [point(x, y), point(x + w, y), point(x + w, y + h)];
    case 'boundary_without_gap': return openBoundary(region.bounds, region.gap);
    case 'interior': {
      const padding = Math.min(8, w / 4);
      return [point(x + padding, y + h / 2), point(x + w - padding, y + h / 2)];
    }
    default: fail('unsupported_reasoned_scene_region');
  }
}
function pathsFor(plan, anchors, visualId) {
  const occurrences = new Map();
  return anchors.flatMap(anchor => {
    const occurrence = occurrences.get(anchor.id) ?? 0; occurrences.set(anchor.id, occurrence + 1);
    return anchor.representation.regions.filter(region => region.visualId === visualId).map(region => ({
      anchorId: anchor.id, modelId: region.modelId, feature: region.feature,
      points: regionPath(plan, anchor, region, occurrence),
    }));
  });
}
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const pathLength = path => path.points.slice(1).reduce((total, p, i) => total + distance(path.points[i], p), 0);
function progressive(paths, progress) {
  const totalLength = paths.reduce((total, path) => total + pathLength(path), 0);
  const drawnLength = totalLength * progress; let remaining = drawnLength, pen = null;
  const visible = [];
  for (const path of paths) {
    if (remaining <= 0) break;
    const points = [path.points[0]];
    for (let i = 1; i < path.points.length && remaining > 0; i++) {
      const a = path.points[i - 1], b = path.points[i], length = distance(a, b);
      if (length === 0) continue;
      if (remaining >= length) { points.push(b); remaining -= length; }
      else { const fraction = remaining / length; points.push(point(a.x + (b.x - a.x) * fraction, a.y + (b.y - a.y) * fraction)); remaining = 0; }
    }
    if (points.length > 1) { visible.push({ ...path, points }); pen = points.at(-1); }
  }
  return { totalLength, drawnLength, paths: visible, pen };
}
const pathD = points => points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
function sourceLayer(plan, asset) {
  const evidence = id => plan.anchors.find(anchor => anchor.id === id && anchor.origin === 'evidence');
  const label = (x, y, value) => `<text x="${x}" y="${y}" fill="#263b46" font-size="17" text-anchor="middle">${escape(value)}</text>`;
  const shapes = plan.models.flatMap((model, modelIndex) => model.instances.filter(instance => instance.visualId === asset.id).map(instance => {
    const { x, y, width, height } = instance.bounds, pieces = [];
    if (instance.gap) {
      pieces.push(`<path d="${pathD(openBoundary(instance.bounds, instance.gap))}" fill="none" stroke="#c77d10" stroke-width="4"/>`);
      pieces.push(`<path d="M ${instance.gap.x} ${instance.gap.y} L ${instance.gap.x + instance.gap.width} ${instance.gap.y}" fill="none" stroke="#718b92" stroke-width="2" stroke-dasharray="5 5"/>`);
    } else pieces.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#edf8f4" stroke="#c77d10" stroke-width="3"/>`);
    if (instance.pixelsPerLengthUnit !== null) {
      const scale = instance.pixelsPerLengthUnit, lines = [];
      for (let column = 1; column < model.dimensions.width; column++) lines.push(`<path d="M ${x + scale * column} ${y} V ${y + height}"/>`);
      for (let row = 1; row < model.dimensions.height; row++) lines.push(`<path d="M ${x} ${y + scale * row} H ${x + width}"/>`);
      pieces.push(`<g data-layer="canonical-unit-grid" stroke="#9dbdb1" stroke-width="1">${lines.join('')}</g>`);
    }
    const lesson = plan.trace.kind === 'concept_lesson';
    const widthAnchor = evidence(lesson ? `${modelIndex ? 'second' : 'first'}-width` : 'side_width');
    const heightAnchor = evidence(lesson ? `${modelIndex ? 'second' : 'first'}-height` : 'side_height') ?? evidence('short_side');
    const unit = model.dimensions.unit;
    pieces.push(label(x + width / 2, y - 13, widthAnchor ? `${widthAnchor.value} ${unit}` : `? ${unit}`));
    pieces.push(label(x + width + 35, y + height / 2, `${heightAnchor.value} ${unit}`));
    const given = evidence('given_area') ?? evidence('given_perimeter');
    if (given) pieces.push(label(x + width / 2, y + height / 2, `Verilen: ${given.value} ${given.unit}`));
    if (instance.gap) {
      const gap = evidence('gap_width');
      pieces.push(label(instance.gap.x + instance.gap.width / 2, instance.gap.y + 27, `Kapı: ${gap.value} ${gap.unit}`));
    }
    if (instance.notToScale) pieces.push(label(x + width / 2, y + height + 60, 'Şekil ölçekli değildir.'));
    return `<g data-model="${model.id}">${pieces.join('')}</g>`;
  }));
  return `<g data-layer="source-geometry">${shapes.join('')}</g>`;
}
function captionLines(text, maxCharacters) {
  const result = []; let line = '';
  for (const word of text.split(/\s+/u)) {
    if (line && line.length + word.length + 1 > maxCharacters) { result.push(line); line = word; }
    else line += `${line ? ' ' : ''}${word}`;
  }
  if (line) result.push(line); return result;
}
function compactResult(plan, cue) {
  const anchor = plan.anchors.find(item => item.id === cue.displayAnchorIds[0] && item.origin === 'result');
  if (!anchor || typeof anchor.value !== 'number') return '';
  const resultCue = plan.cues.find(item => item.kind === 'result' && item.stepId === anchor.id);
  return `${resultCue.semantic.expression} = ${anchor.value} ${anchor.unit}`;
}

function sceneContext(plan, inputOptions) {
  if (!plan || typeof plan !== 'object' || isProxy(plan) || !plans.has(plan)) fail('untrusted_reasoned_scene_plan');
  const { cueIndex, progress, reveal } = frameOptions(inputOptions, plan.cues.length);
  const cue = plan.cues[cueIndex], protectedCue = protectedKinds.has(cue.kind), resultVisible = protectedCue && reveal && progress === 1;
  const locked = protectedCue && !resultVisible, transfer = cue.kind.startsWith('transfer_');
  const anchors = cueAnchors(plan, cue), asset = transfer ? null : chooseAsset(plan, anchors);
  const caption = locked ? 'Yanıt henüz gösterilmiyor. Açık reveal ve tamamlanmış ilerleme gerekiyor.' : cue.transcript;
  const equation = resultVisible && !transfer ? compactResult(plan, cue) : '';
  const highlight = progressive(locked || transfer ? [] : pathsFor(plan, anchors, asset.id), progress);
  const highlightStage = locked ? 'locked_for_reveal' : progress === 0 ? 'not_started' : progress === 1 ? 'complete' : 'drawing';
  const semanticKinds = [...new Set(anchors.map(anchor => anchor.representation.kind).filter(kind => kind.startsWith('logical_') || kind === 'text_claim'))];
  const pending = [...new Set(['raster_and_motion_visual_review', 'cue_text_geometry_meaning_review',
    'word_pen_alignment_not_implemented', 'teacher_review', 'rights_review',
    ...(transfer ? ['transfer_geometry_not_in_canonical_source'] : semanticKinds.map(kind => `${kind}_representation_review`))])];
  const width = asset?.viewBox.width ?? 560, sourceHeight = asset?.viewBox.height ?? 70;
  return { cueIndex, progress, reveal, cue, protectedCue, resultVisible, locked, transfer,
    anchors, asset, caption, equation, highlight, highlightStage, semanticKinds, pending, width, sourceHeight };
}

/** Pure inert SVG DTO; no rasterizer, animation clock, network or provider. */
export function renderReasonedSceneFrame(plan, inputOptions = {}) {
  const { cueIndex, progress, reveal, cue, resultVisible, transfer, asset, caption, equation,
    highlight, highlightStage, semanticKinds, pending, width, sourceHeight } = sceneContext(plan, inputOptions);
  const lines = captionLines(caption, Math.max(30, Math.floor((width - 48) / 8.5)));
  const height = sourceHeight + 90 + lines.length * 24 + (equation ? 32 : 0);
  const safeName = `Kaynak & gerekçe — ${caption}`;
  const textLines = lines.map((line, i) => `<text x="24" y="${sourceHeight + 49 + i * 24}" font-size="17" fill="#263b46">${escape(line)}</text>`).join('');
  const strokes = highlight.paths.map(path => `<path d="${pathD(path.points)}" fill="none" stroke="#ea5a2a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const pen = highlight.pen ? `<g data-layer="highlight-pen"><circle cx="${highlight.pen.x}" cy="${highlight.pen.y}" r="5" fill="#203b50"/><path d="M ${highlight.pen.x} ${highlight.pen.y} l 7 -13 l 5 3 Z" fill="#f1bd46" stroke="#203b50" stroke-width="1"/></g>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escape(safeName)}"><title>${escape(safeName)}</title><desc>${escape(safeName)}</desc><rect width="${width}" height="${height}" fill="#fffaf1"/><g font-family="sans-serif">${asset ? sourceLayer(plan, asset) : ''}<g data-layer="progressive-highlight">${strokes}${pen}</g><path d="M 24 ${sourceHeight + 16} H ${width - 24}" stroke="#d7e1da"/>${textLines}${equation ? `<text x="24" y="${sourceHeight + 49 + lines.length * 24}" font-size="21" fill="#a4471b">${escape(equation)}</text>` : ''}${transfer ? `<text x="24" y="${height - 24}" font-size="13" fill="#697b80">Yeni transfer şekli kaynakta yok; geometrik temsil bekliyor.</text>` : ''}</g></svg>`;
  const frame = { schemaVersion: 'reasoned-svg-scene-frame/v1', state: 'source_bound_svg_frame_draft',
    svg, svgSha256: bytesHash(svg), cueId: cue.id, cueIndex, kind: cue.kind, progress, revealRequested: reveal, resultVisible,
    sourceVisualId: asset?.id ?? null, sourceDiagramProof: !transfer, frameRepresentation: representation,
    representationStatus: transfer ? 'unsupported_new_geometry_pending' : semanticKinds.length ? 'source_regions_with_semantic_review_pending' : 'canonical_source_regions_highlighted',
    highlightStage, highlight, penMeaning: plan.penMeaning, coordinatePolicy: plan.coordinatePolicy,
    source: plan.source, trace: plan.trace, job: plan.job, geometrySha256: plan.geometrySha256,
    scenePlanSha256: plan.contentSha256, sourceAssetSvgSha256: asset?.svgSha256 ?? null,
    safeLayerSha256: bytesHash(asset ? sourceLayer(plan, asset) : ''), svgScenePrepared: true,
    ...limits(), pending };
  frame.contentSha256 = hash(frame); return freeze(frame);
}

function captionFrameOptions(input) {
  if (!input || typeof input !== 'object' || isProxy(input) || Array.isArray(input)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) fail('invalid_reasoned_caption_options');
  const descriptors = Object.getOwnPropertyDescriptors(input), keys = Reflect.ownKeys(descriptors);
  if (keys.length > 4 || keys.some(key => !['cueIndex', 'progress', 'reveal', 'pageIndex'].includes(key)
    || !descriptors[key].enumerable || !Object.hasOwn(descriptors[key], 'value'))) fail('invalid_reasoned_caption_options');
  const pageIndex = Object.hasOwn(descriptors, 'pageIndex') ? descriptors.pageIndex.value : 0;
  if (!Number.isSafeInteger(pageIndex) || pageIndex < 0 || pageIndex >= 32) fail('invalid_reasoned_caption_page_index');
  return { pageIndex: pageIndex === 0 ? 0 : pageIndex, sceneOptions: Object.fromEntries(['cueIndex', 'progress', 'reveal']
    .filter(key => Object.hasOwn(descriptors, key)).map(key => [key,
      key === 'cueIndex' && descriptors[key].value === 0 ? 0 : descriptors[key].value])) };
}
function captionLimits() {
  return { ...limits(), serializedAuthority: 'none', ttsPrepared: false,
    captionAudioSyncVerified: false, wordBoundaryTimestampsProvided: false };
}

/** Render only one current safe caption page from a live source-bound plan.
 * Full canonical narration stays in a separate editor-only plain-text packet.
 * Page changes are presentation choices, not inferred audio/word timestamps. */
export function renderReasonedCaptionFrame(plan, inputOptions = {}) {
  if (arguments.length > 2) fail('invalid_reasoned_caption_arguments');
  if (!plan || typeof plan !== 'object' || isProxy(plan) || !plans.has(plan)) fail('untrusted_reasoned_scene_plan');
  const { pageIndex, sceneOptions } = captionFrameOptions(inputOptions);
  const context = sceneContext(plan, sceneOptions);
  const { cueIndex, progress, reveal, cue, resultVisible, locked, transfer, asset, caption,
    highlight, highlightStage, semanticKinds, width, sourceHeight } = context;
  const pagination = paginateReasonedCaptionText(caption);
  if (pageIndex >= pagination.pages.length) fail('invalid_reasoned_caption_page_index');
  const selectedPage = pagination.pages[pageIndex], fullTranscript = locked ? null : cue.transcript;
  const fullTranscriptSha256 = fullTranscript === null ? null : bytesHash(fullTranscript);
  const pending = [...new Set([...context.pending, 'caption_glyph_width_and_geometry_fit_review',
    'caption_page_navigation_and_accessibility_review', 'full_narration_audio_and_word_alignment_not_implemented'])];
  const height = sourceHeight + 138;
  const safeCaption = selectedPage.lines.join(' ');
  const transferNotice = 'Yeni transfer şekli kaynakta yok; geometrik temsil bekliyor.';
  const safeName = `Kaynak & gerekçe — ${safeCaption}${transfer ? ` — ${transferNotice}` : ''}`;
  const sourceSvg = asset ? sourceLayer(plan, asset) : '';
  const textLines = selectedPage.lines.map((line, i) => `<text data-caption-line="${i}" x="24" y="${sourceHeight + 49 + i * 24}" font-size="17" fill="#263b46" xml:space="preserve">${escape(line)}</text>`).join('');
  const strokes = highlight.paths.map(path => `<path d="${pathD(path.points)}" fill="none" stroke="#ea5a2a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const pen = highlight.pen ? `<g data-layer="highlight-pen"><circle cx="${highlight.pen.x}" cy="${highlight.pen.y}" r="5" fill="#203b50"/><path d="M ${highlight.pen.x} ${highlight.pen.y} l 7 -13 l 5 3 Z" fill="#f1bd46" stroke="#203b50" stroke-width="1"/></g>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escape(safeName)}"><title>${escape(safeName)}</title><desc>${escape(safeName)}</desc><rect width="${width}" height="${height}" fill="#fffaf1"/><g font-family="sans-serif">${sourceSvg}<g data-layer="progressive-highlight">${strokes}${pen}</g>${transfer ? `<text data-layer="transfer-pending" x="24" y="38" font-size="13" fill="#697b80">${escape(transferNotice)}</text>` : ''}<path d="M 24 ${sourceHeight + 16} H ${width - 24}" stroke="#d7e1da"/><g data-layer="current-caption-page">${textLines}</g></g></svg>`;
  const binding = { source: plan.source, trace: plan.trace, job: plan.job, geometrySha256: plan.geometrySha256,
    scenePlanSha256: plan.contentSha256, cueId: cue.id, cueIndex, kind: cue.kind, progress,
    revealRequested: reveal, resultVisible, pageIndex, pageCount: pagination.pages.length, pagingSha256: pagination.pagingSha256 };
  const frame = { schemaVersion: 'reasoned-caption-svg-frame/v1', state: 'current_cue_paged_svg_frame_draft',
    svg, svgSha256: bytesHash(svg), ...binding, selectedPage, selectedPageSha256: hash(selectedPage),
    fullTranscriptSha256, sourceVisualId: asset?.id ?? null, sourceDiagramProof: !transfer,
    frameRepresentation: representation,
    representationStatus: transfer ? 'unsupported_new_geometry_pending' : semanticKinds.length ? 'source_regions_with_semantic_review_pending' : 'canonical_source_regions_highlighted',
    highlightStage, highlight, penMeaning: plan.penMeaning, coordinatePolicy: plan.coordinatePolicy,
    sourceAssetSvgSha256: asset?.svgSha256 ?? null, safeLayerSha256: bytesHash(sourceSvg),
    captionLayout: { fontSizeSvgUnits: 17, lineHeightSvgUnits: 24, reservedLines: 2,
      reservedHeightSvgUnits: 138, glyphFitVerified: false, geometryRescaled: false,
      measurement: 'utf16_code_units_not_rendered_glyph_width' },
    svgScenePrepared: true, captionPresentationPrepared: true, ...captionLimits(), pending };
  frame.contentSha256 = hash(frame); freeze(frame);
  const narrationPacket = { schemaVersion: 'reasoned-caption-narration-packet/v1', state: 'current_cue_separate_narration_draft',
    contentFormat: pagination.contentFormat, ...binding, frameSha256: frame.contentSha256, frameSvgSha256: frame.svgSha256,
    transcriptVisibility: locked ? 'protected_response_locked' : 'current_cue_only', fullTranscript, fullTranscriptSha256,
    paging: pagination.paging, pages: pagination.pages, sourceDiagramProof: frame.sourceDiagramProof,
    representationStatus: frame.representationStatus, captionPresentationPrepared: true, ...captionLimits(), pending };
  narrationPacket.contentSha256 = hash(narrationPacket);
  return freeze({ frame, narrationPacket });
}
