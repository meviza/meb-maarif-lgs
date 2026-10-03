import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRectangleQuestion } from '../packages/content-factory/pilot.mjs';
const api = await import('../packages/media/rectangle_video_pilot.mjs').catch(() => ({}));
function fn(name) { assert.equal(typeof api[name], 'function', `${name} is not implemented`); return api[name]; }
const question = () => createRectangleQuestion({ id: 'video-fixture', template: 'perimeter', width: 8, height: 3 });

test('five bounded silent scenes bind the exact hand-checked perimeter answer and verified solution graph', () => {
  const plan = fn('createRectangleVideoPlan')(question());
  assert.deepEqual(plan.scenes.map(scene => scene.role), ['question', 'geometry', 'solution', 'result', 'pause']);
  assert.equal(plan.durationSeconds, 35); assert.equal(plan.width, 1280); assert.equal(plan.height, 720); assert.equal(plan.fps, 24);
  assert.equal(plan.answer, 22); assert.equal(plan.answerUnit, 'cm'); assert.equal(plan.audio, false);
  assert.deepEqual(plan.solutionGraph.map(step => step.value), [11, 22]);
  assert.equal(plan.publicationReady, false); assert.equal(plan.expertReview, 'pending');
  assert.equal(plan.scenes.at(-1).startSeconds + plan.scenes.at(-1).durationSeconds, 35);
});

test('area plan keeps square units and the area answer rather than substituting a perimeter solution', () => {
  const area = createRectangleQuestion({ id: 'video-area', template: 'area', width: 8, height: 3 });
  const plan = fn('createRectangleVideoPlan')(area);
  assert.equal(plan.answer, 24); assert.equal(plan.answerUnit, 'cm²');
});

test('an area counting explanation is not rendered as a false numerical equality', () => {
  const area = createRectangleQuestion({ id: 'video-area-label', template: 'area', width: 8, height: 3 });
  const plan = fn('createRectangleVideoPlan')(area);
  const scene = fn('renderRectangleSceneSvg')(plan, 2);
  assert.doesNotMatch(scene, /3 sıra, her sırada 8 birim kare = 8/);
  assert.match(scene, /Bir sırada: 8 birim kare/);
  assert.match(scene, /8 × 3 = 24/);
  assert.deepEqual(plan.solutionGraph.map(step => step.value), [8, 24]);
});

test('wrong keys, stale graphs, square-only toy input, invalid geometry and remote input cannot enter rendering', () => {
  const create = fn('createRectangleVideoPlan');
  for (const mutate of [item => item.answerIndex = (item.answerIndex + 1) % 4, item => item.solutionGraph.at(-1).value = 50, item => item.problem.width = 0]) {
    const item = question(); mutate(item); assert.throws(() => create(item), /unverified_question/);
  }
  assert.throws(() => create(createRectangleQuestion({ id: 'square', template: 'perimeter', width: 2, height: 2 })), /non_square_rectangle_required/);
  assert.throws(() => create('https://attacker.example/question.svg'), /unverified_question/);
  assert.throws(() => create({ url: 'https://attacker.example/question.svg' }), /unverified_question/);
});

test('generated math art never embeds caller-supplied SVG and escapes XML text', () => {
  assert.equal(fn('escapeVideoXml')('8 < 9 & "etiket"'), '8 &lt; 9 &amp; &quot;etiket&quot;');
  const plan = fn('createRectangleVideoPlan')(question());
  const svg = fn('renderRectangleSceneSvg')(plan, 2);
  assert.match(svg, /8 \+ 3/); assert.match(svg, /2 × 11/); assert.match(svg, /22/);
  assert.equal(svg.includes('http://attacker.example'), false); assert.equal(svg.includes('<script'), false);
  for (let index = 0; index < 5; index++) assert.match(fn('renderRectangleSceneSvg')(plan, index), /Şekil ölçekli değildir/);
  assert.throws(() => fn('renderRectangleSceneSvg')({ ...plan, answer: 999 }, 0), /invalid_video_plan/);
  assert.throws(() => fn('renderRectangleSceneSvg')(plan, 5), /invalid_scene_index/);
});

test('renderer runtime defaults are portable and explicit trusted local paths cannot be remote or relative', () => {
  const resolve = fn('resolveRectangleVideoRuntime');
  assert.deepEqual(resolve(), { sharpPackage: null, ffmpegPath: 'ffmpeg', ffprobePath: 'ffprobe' });
  assert.deepEqual(resolve({ sharpPackage: '/trusted/node_modules/sharp/package.json', ffmpegPath: '/usr/bin/ffmpeg', ffprobePath: '/usr/bin/ffprobe' }), { sharpPackage: '/trusted/node_modules/sharp/package.json', ffmpegPath: '/usr/bin/ffmpeg', ffprobePath: '/usr/bin/ffprobe' });
  for (const runtime of [{ sharpPackage: 'https://attacker.example/sharp/package.json' }, { sharpPackage: '/trusted/other/package.json' }, { ffmpegPath: './ffmpeg' }, { ffprobePath: 'https://example.org/ffprobe' }, { ffmpegPath: '/usr/bin/sh' }, { sourceUrl: 'https://example.org' }]) assert.throws(() => resolve(runtime), /invalid_trusted_runtime/);
});

test('captions match scene boundaries, graph narration and explicit silent draft disclosure', () => {
  const plan = fn('createRectangleVideoPlan')(question());
  const vtt = fn('rectanglePlanToVtt')(plan);
  assert.match(vtt, /^WEBVTT/); assert.match(vtt, /00:00:13\.000 --> 00:00:22\.000/);
  assert.match(vtt, /çevre 22 santimetre/); assert.match(vtt, /00:00:28\.000 --> 00:00:35\.000/);
  assert.equal(plan.voiceStatus, 'not_rendered_silent_pilot');
});

test('renderer refuses an existing output directory without modifying existing user files', async () => {
  const out = await mkdtemp(join(tmpdir(), 'k12-video-protection-'));
  try {
    await writeFile(join(out, 'sentinel.txt'), 'existing-user-file');
    await assert.rejects(fn('renderRectangleVideoPilot')({ question: question(), outputDirectory: out }), /output_directory_exists/);
    assert.equal(await readFile(join(out, 'sentinel.txt'), 'utf8'), 'existing-user-file');
  } finally { await rm(out, { recursive: true, force: true }); }
});

test('sidecar bytes and reserved receipt space reduce the encoder budget below the total 30 MiB cap', () => {
  const budget = fn('createRectangleVideoOutputBudget')(400000);
  assert.equal(budget.maximumTotalByteLength, 30 * 1024 * 1024);
  assert.equal(budget.maximumVideoByteLength + budget.sidecarByteLength + budget.receiptReservedByteLength, budget.maximumTotalByteLength);
  assert.equal(budget.receiptReservedByteLength, 64 * 1024);
  assert.throws(() => fn('createRectangleVideoOutputBudget')(30 * 1024 * 1024), /total_output_byte_limit/);
  for (const invalid of [-1, Infinity, 2.5, '400000']) assert.throws(() => fn('createRectangleVideoOutputBudget')(invalid), /invalid_artifact_byte_length/);
});
