import test from 'node:test';
import assert from 'node:assert/strict';

const api = await import('../packages/media/ink_timeline.mjs').catch(() => ({}));
function fn(name) { assert.equal(typeof api[name], 'function', `${name} is not implemented`); return api[name]; }

test('the four dependent steps retain the hand-checked 27, 90, 86 and 172 metre meanings', () => {
  const plan = fn('createInkPlan')();
  assert.deepEqual(plan.solutionGraph.map(step => step.value), [27, 90, 86, 172]);
  assert.deepEqual(plan.solutionGraph.map(step => step.dependsOn), [[], ['step1'], ['step2'], ['step3']]);
  assert.deepEqual(plan.solutionGraph.map(step => step.expression), ['18 ÷ 2 × 3', '2 × (18 + 27)', '90 − 4', '86 × 2']);
  assert.equal(plan.answer, 172);
  assert.equal(plan.answerUnit, 'm');
  assert.equal(plan.publicationReady, false);
  assert.equal(plan.expertReview, 'pending');
  assert.equal(plan.curriculumStatus, 'unmapped_draft');
  assert.match(plan.question, /her iki tel sırasında/);
});

test('six complete cues cover a silent 35 second draft without claiming synthesized or muxed audio', () => {
  const plan = fn('createInkPlan')();
  assert.equal(plan.width, 1280); assert.equal(plan.height, 720);
  assert.equal(plan.durationSeconds, 35);
  assert.deepEqual(plan.segments.map(item => item.id), ['intro', 'step1', 'step2', 'step3', 'step4', 'outro']);
  assert.deepEqual(plan.segments.map(item => item.startSeconds), [0, 4, 11, 18, 24, 31]);
  assert.equal(plan.audio, false);
  assert.equal(plan.voiceStatus, 'not_rendered_silent_pilot');
  assert.equal(plan.segments.at(-1).startSeconds + plan.segments.at(-1).durationSeconds, 35);
});

test('measured speech extends individual segments and preserves drawing time for short speech', () => {
  const plan = fn('createInkPlan')({ segmentDurations: { intro: 8, step1: 10, step2: 12, step3: 9, step4: 11, outro: 2 } });
  assert.equal(plan.durationSeconds, 54);
  assert.deepEqual(plan.segments.map(item => item.startSeconds), [0, 8, 18, 30, 39, 50]);
  assert.deepEqual(plan.segments.map(item => item.measuredAudioSeconds), [8, 10, 12, 9, 11, 2]);
  assert.equal(plan.segments.at(-1).durationSeconds, 4);
  assert.equal(plan.voiceStatus, 'measured_audio_timing_only');
  assert.equal(plan.audio, false);
});

test('external sources, incomplete voice timings, getters and non-finite durations cannot enter the plan', () => {
  const create = fn('createInkPlan');
  const timings = { intro: 4, step1: 7, step2: 7, step3: 6, step4: 7, outro: 4 };
  for (const invalid of [null, 'https://example.org/input.svg', { svg: '<script/>' }, { segmentDurations: [4, 7, 7, 6, 7, 4] }, { segmentDurations: { intro: 4 } }]) assert.throws(() => create(invalid), /invalid_ink_options/);
  for (const bad of [0, -1, NaN, Infinity, '4', 121]) assert.throws(() => create({ segmentDurations: { ...timings, intro: bad } }), /invalid_ink_options/);
  let getterCalls = 0;
  const accessor = { get segmentDurations() { getterCalls++; return timings; } };
  assert.throws(() => create(accessor), /invalid_ink_options/);
  assert.equal(getterCalls, 0);
});

test('immutable branded plans reject JSON clones and mutated or foreign plans at both render boundaries', () => {
  const plan = fn('createInkPlan')();
  assert.throws(() => { plan.solutionGraph[0].value = 999; }, TypeError);
  assert.throws(() => { plan.motionEvents[0].points[0].x = 999; }, TypeError);
  for (const invalid of [JSON.parse(JSON.stringify(plan)), { ...plan }, {}, null, 'https://example.org/input.svg']) {
    assert.throws(() => fn('sampleInkFrame')(invalid, 1), /invalid_ink_plan/);
    assert.throws(() => fn('renderInkFrameSvg')(invalid, 1), /invalid_ink_plan/);
  }
});

test('negative, non-finite, string and beyond-end time samples are rejected instead of clamped', () => {
  const plan = fn('createInkPlan')();
  for (const bad of [-0.1, NaN, Infinity, -Infinity, '5', 35.001]) assert.throws(() => fn('sampleInkFrame')(plan, bad), /invalid_ink_time/);
  assert.equal(fn('sampleInkFrame')(plan, 0).timeSeconds, 0);
  assert.equal(fn('sampleInkFrame')(plan, 35).timeSeconds, 35);
});

test('operand highlights finish before calculation strokes and circle the written intermediate result afterwards', () => {
  const plan = fn('createInkPlan')();
  for (const step of plan.solutionGraph) {
    const events = plan.motionEvents.filter(event => event.stepId === step.id && event.kind === 'ink');
    const highlights = events.filter(event => event.role === 'highlight');
    const calculations = events.filter(event => event.role === 'calculation');
    const circles = events.filter(event => event.role === 'result-circle');
    assert.ok(highlights.length > 0); assert.ok(calculations.length > 0); assert.equal(circles.length, 1);
    assert.ok(Math.max(...highlights.map(event => event.endSeconds)) <= Math.min(...calculations.map(event => event.startSeconds)));
    assert.ok(Math.max(...calculations.map(event => event.endSeconds)) <= circles[0].startSeconds);
    assert.ok(step.labelAtSeconds >= circles[0].endSeconds);
  }
});

test('nearby time samples reveal longer real strokes with the pen exactly at each ink endpoint', () => {
  const plan = fn('createInkPlan')();
  const event = plan.motionEvents.find(item => item.kind === 'ink' && item.role === 'calculation' && item.endSeconds - item.startSeconds > 0.04);
  const firstTime = event.startSeconds + (event.endSeconds - event.startSeconds) * 0.4;
  const secondTime = event.startSeconds + (event.endSeconds - event.startSeconds) * 0.6;
  const first = fn('sampleInkFrame')(plan, firstTime);
  const second = fn('sampleInkFrame')(plan, secondTime);
  const a = first.strokes.find(stroke => stroke.id === event.id);
  const b = second.strokes.find(stroke => stroke.id === event.id);
  assert.ok(a.progress > 0 && a.progress < 1);
  assert.ok(b.drawnLength > a.drawnLength);
  assert.ok(b.progress > a.progress);
  assert.deepEqual({ x: first.pen.x, y: first.pen.y }, a.points.at(-1));
  assert.deepEqual({ x: second.pen.x, y: second.pen.y }, b.points.at(-1));
  assert.notDeepEqual(a.points.at(-1), b.points.at(-1));
  assert.equal(first.pen.down, true);
  assert.notEqual(fn('renderInkFrameSvg')(plan, firstTime), fn('renderInkFrameSvg')(plan, secondTime));
});

test('pen-up travel is interpolated instead of teleporting between writing strokes', () => {
  const plan = fn('createInkPlan')();
  const travel = plan.motionEvents.find(item => item.kind === 'travel' && item.role === 'calculation' && Math.hypot(item.points[1].x - item.points[0].x, item.points[1].y - item.points[0].y) > 10);
  const frame = fn('sampleInkFrame')(plan, (travel.startSeconds + travel.endSeconds) / 2);
  assert.equal(frame.pen.down, false);
  assert.ok(Math.abs(frame.pen.x - (travel.points[0].x + travel.points[1].x) / 2) < 1e-8);
  assert.ok(Math.abs(frame.pen.y - (travel.points[0].y + travel.points[1].y) / 2) < 1e-8);
});

test('an intermediate answer appears only after its calculation and its meaning only after its circle', () => {
  const plan = fn('createInkPlan')();
  const step = plan.solutionGraph[0];
  const before = fn('sampleInkFrame')(plan, step.resultAtSeconds - 0.001);
  assert.equal(before.resultState.step1.available, false);
  assert.equal(before.resultState.step1.value, null);
  const written = fn('sampleInkFrame')(plan, step.resultAtSeconds + 0.001);
  assert.equal(written.resultState.step1.value, 27);
  assert.equal(written.resultState.step1.meaning, null);
  const labelled = fn('sampleInkFrame')(plan, step.labelAtSeconds + 0.001);
  assert.equal(labelled.resultState.step1.meaning, 'Uzun kenar');
});

test('the final 172 metre answer stays unavailable until the fourth calculation finishes', () => {
  const plan = fn('createInkPlan')();
  const before = fn('sampleInkFrame')(plan, 24);
  assert.equal(before.resultState.finalAvailable, false);
  assert.equal(before.resultState.finalValue, null);
  const end = fn('sampleInkFrame')(plan, 35);
  assert.equal(end.resultState.finalAvailable, true);
  assert.equal(end.resultState.finalValue, 172);
  assert.deepEqual(['step1', 'step2', 'step3', 'step4'].map(id => end.resultState[id].value), [27, 90, 86, 172]);
});

test('generated frames are bounded self-contained paper and original stylus art, not caller SVG or remote assets', () => {
  const plan = fn('createInkPlan')();
  const svg = fn('renderInkFrameSvg')(plan, 6);
  assert.match(svg, /viewBox="0 0 1280 720"/);
  assert.match(svg, /data-role="stylus"/);
  assert.match(svg, /Şekil ölçekli değildir/);
  assert.match(svg, /Sessiz hareket taslağı/);
  assert.equal(svg.includes('<image'), false);
  assert.equal(svg.includes('<script'), false);
  assert.equal(svg.includes('<foreignObject'), false);
  assert.equal(svg.includes('href='), false);
  assert.ok(Buffer.byteLength(svg) < 150000);
});

test('the highlighted 3/2 ratio is on the same readable equation baseline as its meaning', () => {
  const plan = fn('createInkPlan')();
  const svg = fn('renderInkFrameSvg')(plan, 11);
  const meaningBaseline = Number(svg.match(/<text[^>]*y="([\d.]+)"[^>]*>Uzun \/ kısa =<\/text>/)[1]);
  const ratioBaseline = Number(svg.match(/<text[^>]*y="([\d.]+)"[^>]*>3\/2<\/text>/)[1]);
  assert.ok(Math.abs(meaningBaseline - ratioBaseline) <= 3, 'ratio is visually detached from its equation');
  const circle = plan.motionEvents.find(event => event.kind === 'ink' && event.role === 'highlight' && event.points.length > 50);
  const low = Math.min(...circle.points.map(item => item.y));
  const high = Math.max(...circle.points.map(item => item.y));
  assert.ok(ratioBaseline >= low && ratioBaseline <= high);
});
