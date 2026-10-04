import test from 'node:test';import assert from 'node:assert/strict';
const mod=await import('../packages/school-portal/catalog.mjs').catch(()=>({}));
test('approved200-item catalog has exact grade and LGS subject distributions without duplicateIDs',()=>{
 assert.equal(typeof mod.loadPilotCatalog,'function');const c=mod.loadPilotCatalog();assert.equal(c.questions.length,200);assert.equal(new Set(c.questions.map(q=>q.id)).size,200);
 for(const [grade,count] of [[1,10],[2,10],[3,15],[4,15],[5,20],[6,20],[7,20],[8,90]])assert.equal(c.questions.filter(q=>q.grade===grade).length,count);
 for(const [subject,count] of [['turkish',20],['history',10],['religion',10],['english',10],['mathematics',20],['science',20]])assert.equal(c.questions.filter(q=>q.grade===8&&q.subject===subject).length,count);
 assert.equal(c.published,0);assert.equal(c.realSchoolReady,false);assert.equal(c.paidCalls,0);
});
test('student figure contracts are bounded self-contained readable drawings',()=>{
 assert.equal(typeof mod.loadPilotCatalog,'function');for(const q of mod.loadPilotCatalog().questions){if(!q.figure)continue;assert.ok(q.figure.alt.length>10);assert.ok(q.figure.svg.includes('viewBox='));assert.ok(!/<script|<foreignObject|\bon\w+=|href=|javascript:|NaN|Infinity/iu.test(q.figure.svg),q.id);}
});
test('student option placement is stable across reloads and breaks author cyclic answer patterns without changing the answer text',async()=>{
 assert.equal(typeof mod.loadPilotCatalog,'function');const {PILOT_QUESTIONS}=await import('../packages/school-portal/pilot_questions.mjs');const a=mod.loadPilotCatalog().questions,b=mod.loadPilotCatalog().questions;assert.deepEqual(a,b);
 for(const original of PILOT_QUESTIONS){const delivered=a.find(q=>q.id===original.id);assert.deepEqual([...delivered.options].sort(),[...original.options].sort());assert.equal(delivered.options[delivered.answer],original.options[original.answer]);}
 const fifth=a.filter(q=>q.grade===5).map(q=>q.answer);assert.notDeepEqual(fifth,Array.from({length:20},(_,i)=>(i+1)%4));
});
