import test from 'node:test';
import assert from 'node:assert/strict';
import {loadBookletBank,validateQuestion,mixForGrade} from '../packages/science-booklet/bank.mjs';
test('source validation rejects a wrong grade code, unknown program page, bad answer and executable diagram',async()=>{
 const bank=await loadBookletBank();const base=bank.questions.find(q=>q.id==='YF6-01');
 for(const change of [q=>q.outcomeCode='F.8.3.1.1',q=>q.source.physicalPage=1,q=>q.answer=4,q=>q.figure.svg=q.figure.svg.replace('</svg>','<script>alert(1)</script></svg>'),q=>q.figure.svg=q.figure.svg.replace('<svg ','<svg onload="alert(1)" '),q=>q.figure.svg=q.figure.svg.replace('</svg>','<image href="https://evil.invalid/"/></svg>')]){
   const bad=structuredClone(base);change(bad);assert.throws(()=>validateQuestion(bad));
 }
 assert.equal(validateQuestion(base),true);
});
test('mixed student paper includes every item once without another grade or discipline blocks',async()=>{
 const bank=await loadBookletBank();for(const grade of [6,7,8]){
  const mixed=mixForGrade(bank.questions,grade);assert.equal(mixed.length,18);assert.equal(new Set(mixed.map(q=>q.id)).size,18);assert.ok(mixed.every(q=>q.grade===grade));
  assert.deepEqual(mixed.slice(0,3).map(q=>q.branch),['physics','chemistry','biology']);
 }
 assert.equal(bank.published,0);assert.equal(bank.rejectedOldQuestions,54);assert.equal(bank.questions.some(q=>q.id.startsWith('SCI-G')),false);
});

test('valid source evidence from another grade cannot be relabeled as this enrollment grade',async()=>{
 const bank=await loadBookletBank();
 const q=structuredClone(bank.questions.find(q=>q.id==='YF6-01'));
 const other=bank.questions.find(q=>q.id==='YF7-01');
 q.source=structuredClone(other.source);q.outcomeCode=other.outcomeCode;
 assert.throws(()=>validateQuestion(q),/grade_program_mismatch/);
});
