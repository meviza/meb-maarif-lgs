import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, readdir, mkdir, symlink, realpath, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createInkPlan, renderInkFrameSvg } from '../packages/media/ink_timeline.mjs';

const cli = fileURLToPath(new URL('../tools/build_reasoned_teaching_preview.mjs', import.meta.url));
const playerFile = fileURLToPath(new URL('../apps/teaching-review/reasoned_player.mjs', import.meta.url));
const root = dirname(dirname(cli));
const names = ['bundle-manifest.json', 'index.html', 'ink-timeline.mjs', 'reasoned-player.mjs', 'reasoning-views.json', 'reasoning.json'];
const hash = value => createHash('sha256').update(value).digest('hex');

function run(args, cwd = root) {
  assert.ok(existsSync(cli), 'reasoned preview CLI is not implemented');
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', timeout: 15000 });
}

async function fixture(t) {
  const folder = await realpath(await mkdtemp(join(tmpdir(), 'reasoned-teaching-')));
  t.after(() => rm(folder, { recursive: true, force: true }));
  return folder;
}

async function build(t) {
  const folder = await fixture(t);
  const out = join(folder, 'review');
  const result = run(['--out', out]);
  assert.equal(result.status, 0, result.stderr);
  return { out, views: JSON.parse(await readFile(join(out, 'reasoning-views.json'), 'utf8')) };
}

async function player() {
  assert.ok(existsSync(playerFile), 'reasoned browser controller is not implemented');
  return import(pathToFileURL(playerFile));
}

// Catches missing artifacts, an altered geometry source, an answer shown before
// its reveal, or an unversioned/unlinked explanatory script.
test('real CLI builds six hash-linked reason-first editor artifacts without audio', async t => {
  const { out, views } = await build(t);
  assert.deepEqual((await readdir(out)).sort(), names);
  const overlay = JSON.parse(await readFile(join(out, 'reasoning.json'), 'utf8'));
  assert.deepEqual(overlay.stages.map(stage => stage.id), ['goal', 'givens', 'plan', 'step1', 'step2', 'step3', 'step4', 'check', 'compare']);
  assert.equal(views.hidden.length, 9);
  assert.equal(views.revealed.length, 9);
  assert.equal(views.hidden[3].stage.calculation, null);
  assert.equal(views.revealed[3].stage.calculation.value, 27);
  assert.equal(views.revealed[6].stage.calculation.value, 172);
  assert.equal(views.hidden[0].publicationReady, false);
  assert.equal(views.hidden[0].mediaStatus, 'new_narration_not_generated');
  assert.equal(await readFile(join(out, 'ink-timeline.mjs'), 'utf8'), await readFile(join(root, 'packages/media/ink_timeline.mjs'), 'utf8'));
  const manifest = JSON.parse(await readFile(join(out, 'bundle-manifest.json'), 'utf8'));
  assert.equal(manifest.studentsAllowed, false);
  assert.equal(manifest.publicationReady, false);
  assert.equal(manifest.audioAttached, false);
  assert.equal(manifest.files.length, 5);
  assert.equal((await stat(out)).mode & 0o777, 0o700);
  for (const file of manifest.files) {
    assert.equal(file.sha256, hash(await readFile(join(out, file.name))));
    assert.equal((await stat(join(out, file.name))).mode & 0o777, 0o600);
  }
  const html = await readFile(join(out, 'index.html'), 'utf8');
  for (const id of ['previous-stage', 'next-stage', 'reset-stages', 'reveal-calculation', 'reason-explanation', 'why-operation', 'given-list', 'question-text', 'ink-frame']) assert.match(html, new RegExp(`id="${id}"`, 'u'));
  assert.match(html, /script-src 'self'/u);
  assert.doesNotMatch(html, /<(?:audio|video|iframe)\b|https?:\/\//iu);
});

// Catches bypassing the reason-first gate or returning a revealed value as the
// default calculation view. Tests the same controller used by browser buttons.
test('next waits for calculation reveal and then advances without exposing the next result', async t => {
  const { views } = await build(t);
  const { createReasonedReviewController } = await player();
  const controller = createReasonedReviewController(views);
  assert.equal(controller.getState().stage.id, 'goal');
  controller.dispatch('next');
  controller.dispatch('next');
  controller.dispatch('next');
  assert.equal(controller.getState().stage.id, 'step1');
  assert.equal(controller.getState().stage.calculation, null);
  controller.dispatch('next');
  assert.equal(controller.getState().stage.id, 'step1');
  controller.dispatch('reveal');
  assert.equal(controller.getState().stage.calculation.value, 27);
  controller.dispatch('next');
  assert.equal(controller.getState().stage.id, 'step2');
  assert.equal(controller.getState().stage.calculation, null);
});

// Catches reset/back preserving a stale visible answer, or a motion preference
// changing instructional content rather than only its presentation.
test('previous and reset clear current reveal while reduced motion preserves the same explanation', async t => {
  const { views } = await build(t);
  const { createReasonedReviewController } = await player();
  const controller = createReasonedReviewController(views);
  for (let i = 0; i < 3; i++) controller.dispatch('next');
  controller.dispatch('reveal');
  controller.dispatch('next');
  controller.dispatch('previous');
  assert.equal(controller.getState().stage.id, 'step1');
  assert.equal(controller.getState().stage.calculation, null);
  const explanation = controller.getState().stage.explanation;
  controller.setReducedMotion(true);
  assert.equal(controller.getState().reducedMotion, true);
  assert.equal(controller.getState().stage.explanation, explanation);
  controller.dispatch('reset');
  assert.equal(controller.getState().stageIndex, 0);
  assert.equal(controller.getState().revealAnswer, false);
});

// Catches an animation showing a later equation, using an untrusted arbitrary
// SVG, or retaining v1 narration while presenting the new explanatory script.
test('reasoned frames remove old narration and stop at the currently revealed step', async t => {
  const { views } = await build(t);
  const { getReasonedFrameWindow, renderReasonedInkFrame } = await player();
  const plan = createInkPlan();
  const hidden = getReasonedFrameWindow(plan, views.hidden[3]);
  const revealed = getReasonedFrameWindow(plan, views.revealed[3]);
  assert.equal(hidden.startSeconds, 4);
  assert.equal(hidden.endSeconds, 4);
  assert.equal(revealed.startSeconds, 4);
  assert.ok(revealed.endSeconds > 10 && revealed.endSeconds < 11);
  const frame = renderReasonedInkFrame(plan, revealed.endSeconds, renderInkFrameSvg);
  assert.match(frame, /Uzun kenar/u);
  assert.doesNotMatch(frame, /On sekizin yarısı dokuz/u);
  assert.doesNotMatch(frame, /Tam çevre/u);
  assert.throws(() => getReasonedFrameWindow(plan, { ...views.revealed[3], stage: { ...views.revealed[3].stage, solutionStepId: 'unknown' } }), /invalid_reasoned_frame_stage/u);
});

// Catches accepting unknown controller actions or a malformed variant set that
// could swap a question or reveal content from a different stage.
test('controller rejects malformed variant sets and unrecognized actions', async t => {
  const { views } = await build(t);
  const { createReasonedReviewController } = await player();
  assert.throws(() => createReasonedReviewController({ hidden: views.hidden, revealed: [] }), /invalid_reasoned_views/u);
  const changed = JSON.parse(JSON.stringify(views));
  changed.revealed[3].stage.id = 'step4';
  assert.throws(() => createReasonedReviewController(changed), /invalid_reasoned_views/u);
  const controller = createReasonedReviewController(views);
  assert.throws(() => controller.dispatch('skip-all'), /invalid_reasoned_action/u);
  assert.throws(() => controller.setReducedMotion('true'), /invalid_motion_preference/u);
});

// Catches treating conceptual checking as an optional unlocked step, advancing
// beyond the final comparison, or moving previous before the first stage.
test('check answer is gated and comparison cannot move beyond the last stage', async t => {
  const { views } = await build(t);
  const { createReasonedReviewController } = await player();
  const controller = createReasonedReviewController(views);
  controller.dispatch('previous');
  assert.equal(controller.getState().stageIndex, 0);
  for (let index = 0; index < 7; index++) {
    if (controller.getState().requiresReveal) controller.dispatch('reveal');
    controller.dispatch('next');
  }
  assert.equal(controller.getState().stage.id, 'check');
  assert.equal(controller.getState().stage.checkAnswer, null);
  controller.dispatch('next');
  assert.equal(controller.getState().stage.id, 'check');
  controller.dispatch('reveal');
  assert.ok(controller.getState().stage.checkAnswer.length > 10);
  controller.dispatch('next');
  assert.equal(controller.getState().stage.id, 'compare');
  assert.equal(controller.getState().stage.alternate.value, 172);
  controller.dispatch('next');
  assert.equal(controller.getState().stageIndex, 8);
});

// Catches reduced motion replacing the instructional final state with an
// earlier frame or removing a visible result rather than skipping animation.
test('reduced motion skips animation but retains the same completed calculation frame', async t => {
  const { views } = await build(t);
  const { getReasonedFrameWindow, renderReasonedInkFrame } = await player();
  const plan = createInkPlan();
  const animated = getReasonedFrameWindow(plan, views.revealed[6]);
  const reduced = getReasonedFrameWindow(plan, { ...views.revealed[6], reducedMotion: true });
  assert.equal(animated.animated, true);
  assert.equal(reduced.animated, false);
  assert.equal(reduced.endSeconds, animated.endSeconds);
  const frame = renderReasonedInkFrame(plan, reduced.endSeconds, renderInkFrameSvg);
  assert.match(frame, /İki sıra toplam tel/u);
  assert.equal(frame, renderReasonedInkFrame(plan, animated.endSeconds, renderInkFrameSvg));
});

// Catches collapsing the ratio into a single opaque equation instead of
// visibly explaining the intermediate one-part value and its source meaning.
test('visible calculation lines distinguish one equal part nine from three equal parts twenty-seven', async t => {
  const { views } = await build(t);
  const { getVisibleCalculationLines } = await player();
  assert.equal(typeof getVisibleCalculationLines, 'function', 'visible worked-step presenter is not implemented');
  assert.deepEqual(getVisibleCalculationLines(views.hidden[3]), []);
  assert.deepEqual(getVisibleCalculationLines(views.revealed[3]), [
    { equation: '18 ÷ 2 = 9 m', meaning: 'Bir eş parçanın uzunluğu' },
    { equation: '9 × 3 = 27 m', meaning: 'Üç eş parça: uzun kenar' },
  ]);
});

// Catches overwrite, relative resolution, dot normalization or a symlink write.
test('CLI refuses existing relative dotted and symlink output targets without changing files', async t => {
  const folder = await fixture(t);
  const existing = join(folder, 'existing');
  await mkdir(existing);
  const link = join(folder, 'linked');
  await symlink(existing, link);
  for (const args of [['--out', existing], ['--out', 'relative'], ['--out', `${folder}/./new`], ['--out', join(link, 'new')]]) {
    const result = run(args, folder);
    assert.notEqual(result.status, 0);
  }
  assert.deepEqual(await readdir(existing), []);
  assert.deepEqual((await readdir(folder)).sort(), ['existing', 'linked']);
});
