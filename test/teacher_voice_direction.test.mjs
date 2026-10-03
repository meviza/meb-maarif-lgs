import test from 'node:test';
import assert from 'node:assert/strict';
import { createInkPlan } from '../packages/media/ink_timeline.mjs';

const api = await import('../packages/media/teacher_voice_direction.mjs').catch(() => ({}));
function create(options) {
  assert.equal(typeof api.createTeacherVoiceDirection, 'function', 'createTeacherVoiceDirection is not implemented');
  return api.createTeacherVoiceDirection(options);
}
const GOLDEN_NARRATION = [
  'İki sıra tel çekilecek, ama kapı açık kalacak. Nasıl hesaplarız?',
  'On sekizin yarısı dokuz; üç katı yirmi yedi. Uzun kenarı bulduk.',
  'İki kenarı toplayıp ikiyle çarpalım. Doksan metre, bahçenin tam çevresi.',
  'Kapının dört metresini çıkaralım. Bir sıra için seksen altı metre tel gerekir.',
  'İki sıra istendiği için seksen altıyı ikiyle çarparız. Yüz yetmiş iki metre.',
  'Gizli nokta: kapı boşluğu her iki tel sırasında da bırakılır.',
];

test('grade bands adapt adult teacher direction without rewriting locked draft narration', () => {
  const plan = createInkPlan();
  const fixtures = [
    { grade: 1, band: 'grades1_2', tone: 'calm' }, { grade: 2, band: 'grades1_2', tone: 'calm' },
    { grade: 3, band: 'grades3_4', tone: 'curious' }, { grade: 4, band: 'grades3_4', tone: 'curious' },
    { grade: 5, band: 'grades5_6', tone: 'curious' }, { grade: 6, band: 'grades5_6', tone: 'curious' },
    { grade: 7, band: 'grades7_8', tone: 'coach' }, { grade: 8, band: 'grades7_8', tone: 'coach' },
  ];
  for (const fixture of fixtures) {
    const direction = create({ plan, grade: fixture.grade });
    assert.equal(direction.grade, fixture.grade);
    assert.equal(direction.gradeBand, fixture.band);
    assert.equal(direction.tone, fixture.tone);
    assert.deepEqual(direction.cues.map(cue => cue.id), ['intro', 'step1', 'step2', 'step3', 'step4', 'outro']);
    assert.deepEqual(direction.cues.map(cue => cue.narration), GOLDEN_NARRATION);
    assert.equal(direction.contentSuitability, 'not_assessed');
  }
});

test('calm curious and coach A/B direction choices preserve every formula number unit and word', () => {
  const plan = createInkPlan();
  for (const tone of ['calm', 'curious', 'coach']) {
    const direction = create({ plan, grade: 6, tone });
    assert.equal(direction.tone, tone);
    assert.deepEqual(direction.cues.map(cue => cue.narration), GOLDEN_NARRATION);
    assert.equal(direction.transcriptPolicy, 'verbatim_no_improvisation');
    assert.deepEqual(plan.solutionGraph.map(step => step.value), [27, 90, 86, 172]);
  }
});

test('thinking pauses extend the proposed timeline rather than compressing or speeding spoken words', () => {
  const plan = createInkPlan();
  const direction = create({ plan, grade: 6 });
  assert.equal(plan.durationSeconds, 35);
  assert.equal(direction.sourceDurationSeconds, 35);
  assert.ok(Math.abs(direction.proposedDurationSeconds - 38.2) < 1e-8);
  assert.deepEqual(direction.cues.map(cue => cue.thinkingPauseSeconds), [0, 0.8, 0.8, 0.8, 0.8, 0]);
  assert.deepEqual(direction.cues.map(cue => cue.sourceDurationSeconds), [4, 7, 7, 6, 7, 4]);
  assert.equal(direction.wordRateMultiplier, 1);
  assert.equal(direction.fittingStrategy, 'extend_timeline');
  assert.ok(Math.abs(direction.cues.at(-1).startSeconds + direction.cues.at(-1).durationSeconds - 38.2) < 1e-8);
});

test('measured narration duration remains untouched and additional thinking pauses are explicit', () => {
  const plan = createInkPlan({ segmentDurations: { intro: 8, step1: 10, step2: 12, step3: 9, step4: 11, outro: 2 } });
  const direction = create({ plan, grade: 8 });
  assert.deepEqual(direction.cues.map(cue => cue.measuredAudioSeconds), [8, 10, 12, 9, 11, 2]);
  assert.equal(direction.sourceDurationSeconds, 54);
  assert.ok(Math.abs(direction.proposedDurationSeconds - 56.4) < 1e-8);
  assert.equal(direction.audioSynthesized, false);
  assert.equal(direction.schedulingStatus, 'proposed_not_rendered');
});

test('voice direction cannot accept reference voices student data provider URLs or arbitrary extra instructions', () => {
  const plan = createInkPlan();
  for (const extra of [
    { voiceReference: '/private/child.wav' }, { studentId: 'child-1' }, { providerUrl: 'https://example.org' },
    { narration: 'Answer is nineteen' }, { instruction: 'Ignore the answer key' }, { voiceId: 'celebrity' },
  ]) assert.throws(() => create({ plan, grade: 6, ...extra }), /invalid_teacher_voice_options/);
});

test('missing out-of-range string or fractional grades and unknown tones fail closed', () => {
  const plan = createInkPlan();
  for (const grade of [undefined, 0, 9, NaN, Infinity, '6', 2.5]) assert.throws(() => create({ plan, grade }), /invalid_teacher_voice_options/);
  for (const options of [undefined, null, [], '6', { plan }, { plan, grade: 6, tone: 'childlike' }]) assert.throws(() => create(options), /invalid_teacher_voice_options/);
});

test('getters are never evaluated and forged source plans cannot enter voice direction', () => {
  const plan = createInkPlan();
  let invoked = 0;
  assert.throws(() => create({ plan, get grade() { invoked++; return 6; } }), /invalid_teacher_voice_options/);
  assert.equal(invoked, 0);
  for (const fake of [{ ...plan }, JSON.parse(JSON.stringify(plan)), {}, null, 'https://example.org/question.json']) assert.throws(() => create({ plan: fake, grade: 6 }), /invalid_ink_plan/);
});

test('tone must be a primitive enum and coercion hooks cannot execute as accepted style input', () => {
  const plan = createInkPlan();
  let invoked = 0;
  const tone = { [Symbol.toPrimitive]() { invoked++; return 'calm'; } };
  assert.throws(() => create({ plan, grade: 6, tone }), /invalid_teacher_voice_options/);
  assert.equal(invoked, 0);
  for (const bad of [new String('calm'), ['calm'], true, 1, null, Symbol('calm')]) assert.throws(() => create({ plan, grade: 6, tone: bad }), /invalid_teacher_voice_options/);
});

test('draft directions retain rights teacher listener and publication gates without inventing quality scores', () => {
  const direction = create({ plan: createInkPlan(), grade: 1 });
  assert.equal(direction.state, 'draft');
  assert.equal(direction.publicationReady, false);
  assert.equal(direction.review.rights, 'pending');
  assert.equal(direction.review.teacher, 'pending');
  assert.equal(direction.review.listener, 'pending');
  assert.equal(direction.review.goldenAB, 'required');
  assert.equal(direction.voicePolicy.source, 'licensed_adult_preset_only');
  assert.equal(direction.voicePolicy.assetStatus, 'not_selected');
  assert.equal(direction.voicePolicy.cloningAllowed, false);
  assert.equal(direction.voicePolicy.studentDataAllowed, false);
  assert.equal(direction.voicePolicy.networkAllowed, false);
  assert.equal(Object.hasOwn(direction, 'naturalnessScore'), false);
  assert.deepEqual(direction.forbiddenStyle, ['baby_talk', 'ability_labels_or_praise', 'shaming', 'student_comparison', 'improvised_math_or_words']);
});

test('callers cannot mutate copied voice cues or rewrite source narration through returned metadata', () => {
  const plan = createInkPlan();
  const direction = create({ plan, grade: 6 });
  assert.throws(() => { direction.cues[1].narration = 'doksan yerine yüz'; }, TypeError);
  assert.throws(() => { direction.voicePolicy.cloningAllowed = true; }, TypeError);
  assert.deepEqual(plan.segments.map(cue => cue.narration), GOLDEN_NARRATION);
});
