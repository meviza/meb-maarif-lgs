// Owned, deterministic draft art. No source images, arbitrary SVG, model calls or audio synthesis.
const PLANS = new WeakSet();
const CUE_IDS = ['intro', 'step1', 'step2', 'step3', 'step4', 'outro'];
const MINIMUM_DURATIONS = [4, 7, 7, 6, 7, 4];
const NARRATION = [
  'İki sıra tel çekilecek, ama kapı açık kalacak. Nasıl hesaplarız?',
  'On sekizin yarısı dokuz; üç katı yirmi yedi. Uzun kenarı bulduk.',
  'İki kenarı toplayıp ikiyle çarpalım. Doksan metre, bahçenin tam çevresi.',
  'Kapının dört metresini çıkaralım. Bir sıra için seksen altı metre tel gerekir.',
  'İki sıra istendiği için seksen altıyı ikiyle çarparız. Yüz yetmiş iki metre.',
  'Gizli nokta: kapı boşluğu her iki tel sırasında da bırakılır.',
];
const point = (x, y) => ({ x, y });
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const interpolate = (a, b, amount) => point(a.x + (b.x - a.x) * amount, a.y + (b.y - a.y) * amount);
function lengthOf(points) { return points.slice(1).reduce((sum, item, index) => sum + distance(points[index], item), 0); }
function ellipse(cx, cy, rx, ry, count = 64) {
  return Array.from({ length: count + 1 }, (_, index) => point(cx + rx * Math.cos(index * Math.PI * 2 / count), cy + ry * Math.sin(index * Math.PI * 2 / count)));
}
function freezeDeep(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const item of Object.values(value)) freezeDeep(item);
    Object.freeze(value);
  }
  return value;
}
function plainValues(value, allowed, required = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('invalid_ink_options');
  const keys = Reflect.ownKeys(value);
  if (keys.some(key => typeof key !== 'string' || !allowed.includes(key)) || required.some(key => !keys.includes(key))) throw new Error('invalid_ink_options');
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (keys.some(key => !Object.hasOwn(descriptors[key], 'value'))) throw new Error('invalid_ink_options');
  return Object.fromEntries(keys.map(key => [key, descriptors[key].value]));
}

// Original single-line numeral/operator paths, in a 24 by 40 coordinate box.
// This is a writing-stroke alphabet, not an outline font revealed as a slide.
const GLYPHS = {
  '0': [ellipse(12, 20, 10, 18, 32)],
  '1': [[[3, 9], [11, 2], [11, 38]], [[3, 38], [21, 38]]],
  '2': [[[2, 9], [7, 2], [17, 2], [22, 8], [20, 15], [3, 37], [22, 37]]],
  '3': [[[2, 2], [20, 2], [11, 17], [18, 18], [23, 25], [20, 34], [13, 38], [3, 35]]],
  '4': [[[18, 2], [2, 25], [23, 25]], [[18, 2], [18, 38]]],
  '5': [[[22, 2], [3, 2], [2, 18], [14, 17], [22, 23], [21, 31], [14, 38], [2, 34]]],
  '6': [[[21, 3], [13, 3], [5, 11], [2, 25], [5, 35], [14, 38], [22, 31], [21, 22], [15, 17], [5, 20]]],
  '7': [[[2, 2], [23, 2], [8, 38]]],
  '8': [ellipse(12, 10, 9, 9, 24), ellipse(12, 29, 11, 10, 28)],
  '9': [[[20, 21], [13, 23], [3, 20], [1, 12], [5, 3], [15, 1], [22, 8], [21, 22], [18, 33], [8, 38]]],
  '+': [[[1, 20], [23, 20]], [[12, 8], [12, 32]]],
  '−': [[[1, 20], [23, 20]]],
  '×': [[[3, 9], [21, 31]], [[21, 9], [3, 31]]],
  '÷': [[[1, 20], [23, 20]], ellipse(12, 8, 1.6, 1.6, 8), ellipse(12, 32, 1.6, 1.6, 8)],
  '=': [[[1, 14], [23, 14]], [[1, 27], [23, 27]]],
  '(': [[[15, 0], [8, 8], [5, 19], [8, 31], [15, 40]]],
  ')': [[[5, 0], [12, 8], [15, 19], [12, 31], [5, 40]]],
};
function glyphPaths(text, x, y, scale = 1.2) {
  const paths = [];
  for (const [index, glyph] of [...text].entries()) {
    for (const stroke of GLYPHS[glyph]) {
      paths.push(stroke.map(value => {
        const item = Array.isArray(value) ? point(value[0], value[1]) : value;
        return point(x + index * 31 * scale + item.x * scale, y + item.y * scale);
      }));
    }
  }
  return paths;
}
function underline(x, y, width) { return [point(x, y), point(x + width * 0.42, y - 1.4), point(x + width, y + 0.5)]; }

function appendMotionGroup(events, paths, startSeconds, durationSeconds, role, stepId, cursor) {
  const pending = [];
  for (const points of paths) {
    const travelLength = distance(cursor, points[0]);
    if (travelLength > 0.000001) pending.push({ kind: 'travel', points: [cursor, points[0]], weight: Math.max(2, travelLength * 0.22), role, stepId });
    pending.push({ kind: 'ink', points, weight: Math.max(2, lengthOf(points)), role, stepId });
    cursor = points.at(-1);
  }
  const totalWeight = pending.reduce((sum, item) => sum + item.weight, 0);
  let at = startSeconds;
  for (const [index, event] of pending.entries()) {
    const until = index === pending.length - 1 ? startSeconds + durationSeconds : at + durationSeconds * event.weight / totalWeight;
    events.push({ id: `${stepId}-${role}-${events.length}`, kind: event.kind, role, stepId, points: event.points, length: lengthOf(event.points), startSeconds: at, endSeconds: until });
    at = until;
  }
  return cursor;
}

/** Six durations must come from measured audio files, not inferred word counts.
 * Short speech receives a trailing drawing/readability pause; long speech extends the cue.
 * Timing is not proof that speech has been generated, listened to or muxed into video.
 */
export function createInkPlan(options = {}) {
  const values = plainValues(options, ['segmentDurations']);
  const measured = Object.hasOwn(values, 'segmentDurations') ? plainValues(values.segmentDurations, CUE_IDS, CUE_IDS) : null;
  if (measured && Object.values(measured).some(value => typeof value !== 'number' || !Number.isFinite(value) || value < 0.25 || value > 120)) throw new Error('invalid_ink_options');
  let startSeconds = 0;
  const segments = CUE_IDS.map((id, index) => {
    const durationSeconds = Math.max(MINIMUM_DURATIONS[index], measured ? measured[id] : 0);
    const segment = { id, startSeconds, durationSeconds, measuredAudioSeconds: measured ? measured[id] : null, narration: NARRATION[index] };
    startSeconds += durationSeconds;
    return segment;
  });
  if (startSeconds > 600) throw new Error('invalid_ink_options');
  const longSide = 18 / 2 * 3;
  const perimeter = 2 * (18 + longSide);
  const oneRow = perimeter - 4;
  const totalWire = oneRow * 2;
  const solutionGraph = [
    { id: 'step1', dependsOn: [], expression: '18 ÷ 2 × 3', value: longSide, unit: 'm', meaning: 'Uzun kenar' },
    { id: 'step2', dependsOn: ['step1'], expression: '2 × (18 + 27)', value: perimeter, unit: 'm', meaning: 'Tam çevre' },
    { id: 'step3', dependsOn: ['step2'], expression: '90 − 4', value: oneRow, unit: 'm', meaning: 'Kapı hariç bir sıra' },
    { id: 'step4', dependsOn: ['step3'], expression: '86 × 2', value: totalWire, unit: 'm', meaning: 'İki sıra toplam tel' },
  ];
  const motionEvents = [];
  let cursor = point(1150, 200);
  const resultBounds = [];
  for (const [index, step] of solutionGraph.entries()) {
    const segment = segments[index + 1];
    const y = 252 + index * 100;
    const expression = step.expression.replaceAll(' ', '');
    const resultX = 580 + (expression.length + 1) * 37.2;
    const resultWidth = String(step.value).length * 37.2 - 7;
    const result = { x: resultX, y, width: resultWidth, cx: resultX + resultWidth / 2, cy: y + 24 };
    resultBounds.push(result);
    const previous = index > 0 ? resultBounds[index - 1] : null;
    const highlightPaths = index === 0
      ? [underline(431, 431, 52), ellipse(305, 262, 30, 20)]
      : index === 1
        ? [underline(431, 431, 52), underline(previous.x - 3, previous.y + 52, previous.width + 6)]
        : index === 2
          ? [underline(previous.x - 3, previous.y + 52, previous.width + 6), underline(237, 559, 65)]
          : [underline(previous.x - 3, previous.y + 52, previous.width + 6), underline(108, 593, 22)];
    const writeStart = segment.startSeconds + segment.durationSeconds * 0.18;
    const writeEnd = segment.startSeconds + segment.durationSeconds * 0.72;
    const circleEnd = segment.startSeconds + segment.durationSeconds * 0.88;
    cursor = appendMotionGroup(motionEvents, highlightPaths, segment.startSeconds, segment.durationSeconds * 0.18, 'highlight', step.id, cursor);
    cursor = appendMotionGroup(motionEvents, glyphPaths(`${expression}=${step.value}`, 580, y), writeStart, writeEnd - writeStart, 'calculation', step.id, cursor);
    cursor = appendMotionGroup(motionEvents, [ellipse(result.cx, result.cy, result.width / 2 + 13, 34)], writeEnd, circleEnd - writeEnd, 'result-circle', step.id, cursor);
    Object.assign(step, { resultAtSeconds: writeEnd, labelAtSeconds: circleEnd, resultBounds: result });
  }
  const plan = freezeDeep({
    schemaVersion: 1, id: 'ink-garden-two-rows-v1', width: 1280, height: 720, fps: 24,
    durationSeconds: startSeconds, answer: totalWire, answerUnit: 'm',
    question: 'Kısa kenarı 18 m olan dikdörtgen bahçenin uzun kenarı kısa kenarın 3/2 katıdır. 4 m genişliğindeki kapı boşluğu her iki tel sırasında da bırakılıyor. İki sıra tel için kaç metre tel gerekir?',
    problem: { shortSide: 18, longSideRatio: { numerator: 3, denominator: 2 }, gateWidth: 4, wireRows: 2 },
    audio: false, voiceStatus: measured ? 'measured_audio_timing_only' : 'not_rendered_silent_pilot',
    publicationReady: false, expertReview: 'pending', curriculumStatus: 'unmapped_draft',
    segments, solutionGraph, motionEvents,
  });
  PLANS.add(plan);
  return plan;
}

function requirePlanTime(plan, timeSeconds) {
  if (!plan || typeof plan !== 'object' || !PLANS.has(plan)) throw new Error('invalid_ink_plan');
  if (typeof timeSeconds !== 'number' || !Number.isFinite(timeSeconds) || timeSeconds < 0 || timeSeconds > plan.durationSeconds) throw new Error('invalid_ink_time');
}
function prefixAtLength(points, wantedLength) {
  const prefix = [points[0]];
  let traversed = 0;
  for (let index = 1; index < points.length; index++) {
    const span = distance(points[index - 1], points[index]);
    if (traversed + span >= wantedLength) {
      prefix.push(span === 0 ? points[index] : interpolate(points[index - 1], points[index], (wantedLength - traversed) / span));
      return prefix;
    }
    prefix.push(points[index]);
    traversed += span;
  }
  return prefix;
}

/** Observable frame data: actual stroke endpoints and lengths, never an arbitrary bitmap. */
export function sampleInkFrame(plan, timeSeconds) {
  requirePlanTime(plan, timeSeconds);
  const strokes = [];
  let pen = { x: 1150, y: 200, down: false, angleRadians: 0, strokeId: null };
  let phase = 'pause';
  for (const event of plan.motionEvents) {
    if (timeSeconds < event.startSeconds) break;
    const progress = Math.min(1, (timeSeconds - event.startSeconds) / (event.endSeconds - event.startSeconds));
    const points = progress === 1 ? event.points : prefixAtLength(event.points, event.length * progress);
    const end = points.at(-1);
    if (event.kind === 'ink' && progress > 0) strokes.push({ id: event.id, role: event.role, stepId: event.stepId, points, progress, fullLength: event.length, drawnLength: event.length * progress });
    if (timeSeconds < event.endSeconds) {
      const previous = points.length > 1 ? points.at(-2) : event.points[0];
      pen = { x: end.x, y: end.y, down: event.kind === 'ink', angleRadians: Math.atan2(end.y - previous.y, end.x - previous.x), strokeId: event.kind === 'ink' ? event.id : null };
      phase = event.role;
      break;
    }
    pen = { x: end.x, y: end.y, down: false, angleRadians: 0, strokeId: null };
  }
  const active = plan.segments.find(segment => timeSeconds >= segment.startSeconds && timeSeconds < segment.startSeconds + segment.durationSeconds) ?? plan.segments.at(-1);
  const resultState = {};
  for (const step of plan.solutionGraph) {
    const available = timeSeconds >= step.resultAtSeconds;
    resultState[step.id] = { available, value: available ? step.value : null, unit: available ? step.unit : null, meaning: timeSeconds >= step.labelAtSeconds ? step.meaning : null };
  }
  resultState.finalAvailable = resultState.step4.available;
  resultState.finalValue = resultState.step4.value;
  return {
    timeSeconds, progress: timeSeconds / plan.durationSeconds, phase, activeCue: active.id,
    cues: plan.segments.map(segment => ({ id: segment.id, active: segment.id === active.id, startSeconds: segment.startSeconds, durationSeconds: segment.durationSeconds, narration: segment.narration })),
    strokes, pen, resultState,
  };
}

const xml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const number = value => value.toFixed(3);
const pathData = points => points.map((item, index) => `${index === 0 ? 'M' : 'L'}${number(item.x)},${number(item.y)}`).join(' ');
function stylusSvg(pen) {
  // The nib's exact coordinate is the stroke endpoint. The body extends upward, away from it.
  return `<g data-role="stylus" transform="translate(${number(pen.x)} ${number(pen.y)}) rotate(28)"><path d="M0 0 L-4 -12 L4 -12 Z" fill="#243f43"/><path d="M-4 -12 L-5 -80 Q0 -91 5 -80 L4 -12 Z" fill="#e3d7b6" stroke="#6d786e" stroke-width="1.5"/><path d="M-2 -73 L-2 -22" fill="none" stroke="#fffaf0" stroke-width="2"/><path d="M-5 -81 Q0 -90 5 -81" fill="none" stroke="#24464a" stroke-width="4"/></g>`;
}

export function renderInkFrameSvg(plan, timeSeconds) {
  const frame = sampleInkFrame(plan, timeSeconds);
  const accent = '#cc784b';
  const rows = plan.solutionGraph.map(step => {
    const state = frame.resultState[step.id];
    const { x, y, width } = step.resultBounds;
    return `${state.available ? `<text x="${number(x + width + 24)}" y="${number(y + 39)}" fill="#456366" font-size="25">m</text>` : ''}${state.meaning ? `<text x="582" y="${number(y + 75)}" fill="#587575" font-size="20">${xml(state.meaning)}</text>` : ''}`;
  }).join('');
  const strokes = frame.strokes.map(stroke => `<path data-role="${stroke.role}" d="${pathData(stroke.points)}" fill="none" stroke="${stroke.role === 'calculation' ? '#244e53' : accent}" stroke-width="${stroke.role === 'calculation' ? 4.2 : 3.1}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const cue = frame.cues.find(item => item.active);
  const diagramLongSide = frame.resultState.step1.available ? '27 m' : 'Uzun kenar = ?';
  const narration = cue.narration;
  const status = plan.voiceStatus === 'not_rendered_silent_pilot' ? 'Sessiz hareket taslağı' : 'Ölçülmüş ses zamanlaması · ses birleştirme ayrıca doğrulanmalı';
  const outro = frame.activeCue === 'outro' ? `<rect x="80" y="610" width="426" height="35" rx="9" fill="#e9eeeb"/><text x="94" y="634" fill="#31595d" font-size="17">Kapıyı her tel sırasında boş bırakmayı unutma.</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#fffdf5"/><stop offset="1" stop-color="#f2f0e4"/></linearGradient></defs><rect width="1280" height="720" fill="url(#paper)"/><g font-family="Arial, sans-serif"><path d="M56 45 L65 37 L74 45 L65 53 Z" fill="none" stroke="#376061" stroke-width="2"/><text x="91" y="55" fill="#214a4f" font-size="34" font-weight="600">Kalemle düşün</text><text x="1218" y="48" text-anchor="end" fill="#7b8273" font-size="14" letter-spacing="2">EDİTÖR TASLAĞI</text><path d="M60 77 H1220" stroke="#dedecf"/><text x="65" y="116" fill="#263d41" font-size="23">Bir dikdörtgen bahçenin kısa kenarı 18 m, uzun kenarı bunun 3/2 katıdır.</text><text x="65" y="150" fill="#263d41" font-size="23">4 m genişliğindeki kapı boşluğu her iki tel sırasında da bırakılıyor.</text><text x="65" y="185" fill="#263d41" font-size="23" font-weight="600">İki sıra tel için kaç metre tel gerekir?</text><path d="M530 218 V641" stroke="#dedecf"/><text x="85" y="237" fill="#758078" font-size="16" letter-spacing="1">VERİLERİ GÖR</text><text x="112" y="271" fill="#527172" font-size="20">Uzun / kısa =</text><text x="285" y="271" fill="#527172" font-size="22">3/2</text><text x="267" y="305" fill="#335e61" font-size="21" text-anchor="middle">${diagramLongSide}</text><path d="M100 525 V315 H415 V525 H302 M237 525 H100" fill="none" stroke="#6d8c81" stroke-width="3" stroke-linecap="round"/><path d="M237 520 V531 M302 520 V531" stroke="#bb9673" stroke-width="3"/><text x="434" y="420" fill="#335e61" font-size="25">18 m</text><text x="237" y="552" fill="#805f49" font-size="21">4 m kapı</text><text x="108" y="586" fill="#345a5d" font-size="21">2 sıra tel</text><text x="235" y="586" fill="#6f7f75" font-size="16">Kapı her sırada açık</text><text x="580" y="233" fill="#758078" font-size="16" letter-spacing="1">DÜŞÜNCE İZİ</text>${strokes}${rows}${outro}${stylusSvg(frame.pen)}<text x="64" y="676" fill="#496366" font-size="17">${xml(narration)}</text><text x="64" y="701" fill="#929b89" font-size="12">Şekil ölçekli değildir · ${status} · Müfredat/uzman incelemesi bekliyor</text><rect x="64" y="709" width="1152" height="3" rx="1.5" fill="#e0e2d4"/><rect x="64" y="709" width="${number(1152 * frame.progress)}" height="3" rx="1.5" fill="#8eaa9d"/></g></svg>`;
}
