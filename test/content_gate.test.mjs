import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JevQualityAuditor } from '../engine/jev_evaluator.mjs';

const questionBank = JSON.parse(
  fs.readFileSync(new URL('../public/questions.json', import.meta.url), 'utf8')
);
const gradeFiveQuestionBank = JSON.parse(
  fs.readFileSync(new URL('../public/questions_grade_5.json', import.meta.url), 'utf8')
);
const BASE_DRAFT = questionBank.turkce.tests[0].questions[0];

function validDraft(overrides = {}) {
  return {
    ...structuredClone(BASE_DRAFT),
    ...overrides
  };
}

test('rejects an unrecognized curriculum outcome code during automated screening', async () => {
  const auditor = new JevQualityAuditor();
  const result = await auditor.evaluateQuestion(validDraft({ outcomeCode: 'NOT-A-CURRICULUM-CODE' }));

  assert.equal(result.passed, false);
  assert.match(result.reasons.join(' '), /kazanım|müfredat/i);
});

test('never marks an automated content screen as publication eligible', async () => {
  const auditor = new JevQualityAuditor();
  const result = await auditor.evaluateQuestion(validDraft({ outcomeCode: 'T.8.1.1' }));

  assert.equal(result.passed, true);
  assert.equal(result.publicationEligible, false);
  assert.equal(result.verdict, 'AUTOMATED_SCREENING_PASSED');
});

test('recognizes the prototype social studies outcome-code family used by grade 5 data', async () => {
  const auditor = new JevQualityAuditor();
  const socialQuestion = gradeFiveQuestionBank.sosyal.tests[0].questions[0];
  const result = await auditor.evaluateQuestion(socialQuestion);

  assert.equal(result.decisions.curriculum_code_recognized, true);
});

test('rejects a syntactically valid but unregistered prototype outcome code', async () => {
  const auditor = new JevQualityAuditor();
  const result = await auditor.evaluateQuestion(validDraft({ outcomeCode: 'M.8.999.999' }));

  assert.equal(result.passed, false);
  assert.equal(result.decisions.curriculum_registry_match, false);
});

test('rejects a draft when supplied answer-key evidence conflicts with the declared answer', async () => {
  const auditor = new JevQualityAuditor();
  const result = await auditor.evaluateQuestion(validDraft({
    answerKeyEvidence: {
      expectedOption: 'A',
      method: 'teacher-verified fixture',
      evidenceRef: 'test-fixture'
    }
  }));

  assert.equal(result.passed, false);
  assert.equal(result.decisions.answer_key_status, 'evidence_mismatch');
});
