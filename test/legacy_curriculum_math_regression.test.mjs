import assert from 'node:assert/strict';
import test from 'node:test';
import { CurriculumScaleFactory } from '../engine/curriculum_scale_factory.mjs';

test('legacy 240 by 300 by 360 cube packing keeps all six height layers and selects 120 cubes', () => {
  const batch = new CurriculumScaleFactory().generateWeekQuestionSet({ grade: 6, courseKey: 'matematik', weekNum: 1, countPerWeek: 28 });
  const questions = batch.questions.filter(question => question.difficulty === 'SEKIL_VE_OLIMPIYAT');
  assert.ok(questions.length > 0);
  // Independently hand-checked: gcd(240, 300, 360) = 60; 4 × 5 × 6 = 120.
  // The break caught is substituting three height layers or the B=60 answer.
  for (const question of questions) {
    assert.equal(Number(question.options[question.correctOption]), 120);
    assert.doesNotMatch(question.detailedSolution, /hacim\s+denge\s+katsayısı/iu);
  }
});
