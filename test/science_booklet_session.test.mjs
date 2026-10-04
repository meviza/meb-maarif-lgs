import test from 'node:test';
import assert from 'node:assert/strict';
import { createExamSession } from '../packages/science-booklet/session.mjs';

const fixture = (id, grade, answer = 2) => ({id, grade, branch: 'physics', topic: 'Internal topic', outcomeCode: 'PRIVATE', source: {programId:'internal'}, difficulty:'hard', bloom:'analyze', stimulus:'Bir deney yapılıyor.', stem:'Hangi sonuç çıkarılır?', options:['Bir','İki','Üç','Dört'], answer, explanation:{given:'Verilenler', wanted:'İstenen', strategy:'Yol', steps:['Adım'], check:'Kontrol', tip:'İpucu'}, figure:{svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150"><circle cx="100" cy="70" r="20"/></svg>',alt:'Deney düzeneği'}, layout:'regular'});
const items = [fixture('YF6-01',6),fixture('YF6-02',6,0),fixture('YF7-01',7)];

test('student receives only enrolled grade and no answer, solution or editorial metadata', () => {
  const exam = createExamSession(items, 6);
  const b = exam.booklet();
  assert.deepEqual(b.questions.map(q=>q.id), ['YF6-01','YF6-02']);
  for(const q of b.questions) for(const forbidden of ['answer','explanation','source','bloom','difficulty','topic','outcomeCode','branch']) assert.equal(Object.hasOwn(q,forbidden),false,forbidden);
  assert.throws(()=>exam.review(), /finish_required/);
});
test('answer update and clear are real state changes; foreign question and non-choice reject', () => {
  const exam=createExamSession(items,6);
  assert.throws(()=>exam.answer('YF7-01',1),/question_not_in_exam/);
  for(const choice of [-1,4,'2',true,NaN]) assert.throws(()=>exam.answer('YF6-01',choice),/invalid_choice/);
  exam.answer('YF6-01',1); exam.answer('YF6-01',2);
  assert.equal(exam.booklet().responses['YF6-01'],2);
  exam.answer('YF6-01',null); assert.equal(exam.booklet().responses['YF6-01'],null);
});
test('submission scores the latest answers and locks state; blank stays blank', () => {
  const exam=createExamSession(items,6);
  exam.answer('YF6-01',2);
  const result=exam.finish();
  assert.deepEqual(result.summary,{correct:1,incorrect:0,blank:1,total:2});
  assert.equal(result.questions[0].correctAnswer,2);
  assert.equal(result.questions[1].selectedAnswer,null);
  assert.equal(result.questions[1].status,'blank');
  assert.throws(()=>exam.answer('YF6-02',0),/exam_finished/);
  assert.deepEqual(exam.finish(),result);
});
test('sessions are isolated and returned objects cannot overwrite authoritative state', () => {
  const a=createExamSession(items,6), b=createExamSession(items,6);
  const view=a.booklet(); view.questions[0].options[2]='Sabotage'; view.responses['YF6-01']=3;
  a.answer('YF6-01',2); a.flag('YF6-02',true);
  assert.equal(b.booklet().responses['YF6-01'],null);
  assert.deepEqual(b.booklet().flagged,[]);
  assert.equal(a.booklet().questions[0].options[2],'Üç');
  assert.deepEqual(a.booklet().flagged,['YF6-02']);
});
test('unknown enrollment, duplicate IDs and out-of-range keys never create an exam', () => {
  assert.throws(()=>createExamSession(items,8),/empty_exam/);
  assert.throws(()=>createExamSession(items,'6'),/invalid_grade/);
  assert.throws(()=>createExamSession([items[0],items[0]],6),/duplicate_question/);
  assert.throws(()=>createExamSession([fixture('bad',6,5)],6),/invalid_question/);
});
