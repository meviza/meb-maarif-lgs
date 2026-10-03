import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, readdir, mkdir, symlink, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../tools/build_teaching_bundle.mjs', import.meta.url));
const root = dirname(dirname(cli));
const filenames = ['audit.json', 'bundle-manifest.json', 'curriculum-candidates.json', 'editor-review.html', 'lesson.json', 'question.json', 'source-plan.json', 'speech-script.json'];
const sha256 = text => createHash('sha256').update(text).digest('hex');

function run(args, cwd = root) {
  assert.equal(existsSync(cli), true, 'build_teaching_bundle CLI is not implemented');
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', timeout: 15000 });
}

async function fixture(t) {
  const directory = await realpath(await mkdtemp(join(tmpdir(), 'teaching-bundle-cli-')));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function snapshot(directory) {
  const names = (await readdir(directory)).sort();
  return Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(join(directory, name), 'utf8')])));
}

// Catches an empty/default export, changed fixture arithmetic, mismatched speech,
// or a missing output file. Expected numbers and cue text are hand-checked literals.
test('the real CLI creates eight linked private review artifacts with garden 172 and lesson 20/24/22', async t => {
  const directory = await fixture(t);
  const out = join(directory, 'fresh-bundle');
  const result = run(['--out', out]);
  assert.equal(result.status, 0, result.stderr);
  const files = await snapshot(out);
  assert.deepEqual(Object.keys(files), filenames);
  const question = JSON.parse(files['question.json']);
  const lesson = JSON.parse(files['lesson.json']);
  const plan = JSON.parse(files['source-plan.json']);
  const speech = JSON.parse(files['speech-script.json']);
  assert.equal(question.id, 'garden-two-rows-editor-v1');
  assert.equal(question.options[question.answerIndex], 172);
  assert.equal(question.answerUnit, 'm');
  assert.deepEqual(question.solutionGraph.map(value => value.value), [27, 90, 86, 172]);
  assert.equal(question.state, 'draft');
  assert.equal(question.metadata.curriculum.mappingStatus, 'unresolved');
  assert.deepEqual(lesson.workedExample.perimeter, { expression: '6 + 4 + 6 + 4', value: 20, unit: 'cm' });
  assert.deepEqual(lesson.workedExample.area, { expression: '4 × 6', value: 24, unit: 'cm²' });
  assert.deepEqual(lesson.misconception.comparison.models.map(value => value.perimeter.value), [20, 22]);
  assert.equal(lesson.publishReady, false);
  assert.equal(plan.answer, 172);
  assert.equal(plan.publicationReady, false);
  const planSha256 = sha256(JSON.stringify(plan));
  assert.equal(question.inkPlanSha256, planSha256);
  assert.deepEqual(question.inkPlan, plan);
  assert.equal(speech.sourcePlan.sha256, planSha256);
  assert.deepEqual(speech.segments, [
    { id: 'intro', narration: 'İki sıra tel çekilecek, ama kapı açık kalacak. Nasıl hesaplarız?' },
    { id: 'step1', narration: 'On sekizin yarısı dokuz; üç katı yirmi yedi. Uzun kenarı bulduk.' },
    { id: 'step2', narration: 'İki kenarı toplayıp ikiyle çarpalım. Doksan metre, bahçenin tam çevresi.' },
    { id: 'step3', narration: 'Kapının dört metresini çıkaralım. Bir sıra için seksen altı metre tel gerekir.' },
    { id: 'step4', narration: 'İki sıra istendiği için seksen altıyı ikiyle çarparız. Yüz yetmiş iki metre.' },
    { id: 'outro', narration: 'Gizli nokta: kapı boşluğu her iki tel sırasında da bırakılır.' },
  ]);
  const manifest = JSON.parse(files['bundle-manifest.json']);
  assert.deepEqual(manifest.files.map(value => value.name).sort(), filenames.filter(value => value !== 'bundle-manifest.json'));
  for (const file of manifest.files) assert.equal(file.sha256, sha256(files[file.name]));
});

// Catches false approval, a made-up grade-six geometry target, lost source
// provenance, or gates dropped merely because local arithmetic passed.
test('curriculum candidates retain verified 2026 sources, partial coverage and pending human gates', async t => {
  const directory = await fixture(t);
  const out = join(directory, 'fresh-bundle');
  const result = run(['--out', out]);
  assert.equal(result.status, 0, result.stderr);
  const curriculum = JSON.parse(await readFile(join(out, 'curriculum-candidates.json'), 'utf8'));
  assert.equal(curriculum.schoolYear, '2026-2027');
  assert.equal(curriculum.status, 'expert_pending');
  assert.equal(curriculum.source.editionYear, 2026);
  assert.equal(curriculum.source.pdfUrl, 'https://tymm.meb.gov.tr/assets/pdf/ortaokul-matematik-dersi_20260902_111111_630.pdf');
  assert.equal(curriculum.source.sha256, '75f52f93672c8991eabe102adb37ab4d16de63f35fe8488fc29cdedae9155734');
  assert.equal(curriculum.question.gradeCandidate, 6);
  assert.equal(curriculum.question.candidates[0].outcomeCode, 'MAT.6.1.7');
  assert.equal(curriculum.question.candidates[0].pdfPage, 74);
  assert.ok(curriculum.question.prerequisites.some(value => value.grade === 5 && value.outcomeCode === 'MAT.5.4.4' && value.pdfPage === 51));
  assert.equal(curriculum.lesson.gradeCandidate, 5);
  assert.deepEqual(curriculum.lesson.candidates.map(value => value.outcomeCode), ['MAT.5.4.2', 'MAT.5.4.3']);
  for (const candidate of [...curriculum.question.candidates, ...curriculum.question.prerequisites, ...curriculum.lesson.candidates]) {
    assert.equal(candidate.coverage, 'partial');
    assert.equal(candidate.reviewStatus, 'expert_pending');
  }
  const audit = JSON.parse(await readFile(join(out, 'audit.json'), 'utf8'));
  assert.equal(audit.providerStatus.generator, 'owned_deterministic_pilot');
  assert.equal(audit.providerStatus.clef, 'not_invoked');
  assert.equal(audit.providerStatus.livePaidCalls, 0);
  assert.equal(audit.audio.status, 'not_attached');
  assert.equal(audit.video.status, 'not_attached');
  assert.equal(audit.generatedDraftsAreApproval, false);
  assert.equal(audit.publicationGate.state, 'closed');
  assert.equal(audit.questionReview.localMathChecks, 'passed');
  assert.equal(audit.questionReview.automatedPass, false);
  for (const gate of ['canonical_curriculum_mapping', 'archive_similarity_review', 'language_and_pedagogy_review', 'trusted_expert_review', 'calibrated_item_difficulty', 'rights_review', 'accessibility_review']) {
    assert.ok(audit.pending.includes(gate), `missing gate: ${gate}`);
  }
  const html = await readFile(join(out, 'editor-review.html'), 'utf8');
  assert.match(html, /<h2[^>]*>Soru<\/h2>/u);
  assert.match(html, /<h2[^>]*>Çevre mi alan mı\?<\/h2>/u);
  assert.match(html, /öğrencilere kapalı/iu);
  assert.match(html, /172 m/u);
  assert.match(html, /20 cm/u);
  assert.match(html, /24 cm²/u);
  assert.match(html, /22 cm/u);
  assert.equal((html.match(/<svg\b/gu) ?? []).length, 3);
  assert.equal((html.match(/<figcaption\b/gu) ?? []).length, 3);
  assert.match(html, /script-src 'none'/u);
  assert.doesNotMatch(html, /<(?:script|iframe|video|audio|foreignObject)\b|\son(?:load|click)=|https?:\/\/[^"\s]+\.(?:png|jpg|mp4|mp3)/iu);
});

// Catches a preview that hides the alternative strategies or treats one answer
// as a learner diagnosis. Values are independently checked against the scenario.
test('the editor sees alternative strategies as author hypotheses without diagnosing a learner', async t => {
  const directory = await fixture(t);
  const out = join(directory, 'fresh-bundle');
  const result = run(['--out', out]);
  assert.equal(result.status, 0, result.stderr);
  const question = JSON.parse(await readFile(join(out, 'question.json'), 'utf8'));
  assert.deepEqual([...question.options].sort((a, b) => a - b), [86, 172, 176, 180]);
  const html = await readFile(join(out, 'editor-review.html'), 'utf8');
  assert.match(html, /data-strategy="subtract_gate_once_after_two_rows"[^>]*>[\s\S]*?176 m/u);
  assert.match(html, /data-strategy="ignore_gate_gap"[^>]*>[\s\S]*?180 m/u);
  assert.match(html, /data-strategy="calculate_one_row_only"[^>]*>[\s\S]*?86 m/u);
  assert.match(html, /yazar varsayımlarıdır; öğrenci teşhisi değildir/u);
});

// Catches a writer that accepts an existing target, including an empty one,
// or rewrites any bytes when the same output directory is used twice.
test('an existing output directory is rejected without changing its files', async t => {
  const directory = await fixture(t);
  const empty = join(directory, 'already-exists');
  await mkdir(empty);
  const emptyResult = run(['--out', empty]);
  assert.notEqual(emptyResult.status, 0);
  assert.match(emptyResult.stderr, /output_directory_must_be_fresh/u);
  assert.deepEqual(await readdir(empty), []);
  const out = join(directory, 'fresh-bundle');
  assert.equal(run(['--out', out]).status, 0);
  const before = await snapshot(out);
  const again = run(['--out', out]);
  assert.notEqual(again.status, 0);
  assert.match(again.stderr, /output_directory_must_be_fresh/u);
  assert.deepEqual(await snapshot(out), before);
});

// Catches resolving a relative path into an authorized absolute write target.
test('a relative output path is rejected before any directory is created', async t => {
  const directory = await fixture(t);
  const result = run(['--out', 'relative-bundle'], directory);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /absolute_output_directory_required/u);
  assert.deepEqual(await readdir(directory), []);
});

// Catches following a symlink at the output or at any existing ancestor.
test('symlink output paths and symlink ancestors are rejected without writing through them', async t => {
  const directory = await fixture(t);
  const target = join(directory, 'target');
  await mkdir(target);
  const link = join(directory, 'link');
  await symlink(target, link);
  for (const out of [link, join(link, 'fresh-bundle')]) {
    const result = run(['--out', out]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /symlink_output_path_not_allowed/u);
  }
  assert.deepEqual(await readdir(target), []);
});
