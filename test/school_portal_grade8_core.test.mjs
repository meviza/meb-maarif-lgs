import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const mod=await import('../packages/school-portal/grade8_core.mjs').catch(()=>({}));
test('grade8 core has20 distinct Turkish,20 math and2 additional science drafts',()=>{
 assert.ok(Array.isArray(mod.GRADE8_CORE_QUESTIONS));const qs=mod.GRADE8_CORE_QUESTIONS;
 assert.equal(qs.length,42);for(const [subject,count] of [['turkish',20],['mathematics',20],['science',2]])assert.equal(qs.filter(q=>q.subject===subject).length,count);
 assert.equal(new Set(qs.map(q=>q.id)).size,42);assert.equal(new Set(qs.map(q=>q.stimulus+' '+q.stem)).size,42);
 for(const q of qs){assert.equal(q.grade,8);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert.ok(q.explanation.steps.length);assert.ok(q.explanation.strategy.length>10);assert.ok(q.source.programId);assert.equal(q.source.alignmentStatus,'draft');}
});
test('geometry diagrams preserve the square border and 5-12-13 ladder relationships',()=>{
 const get=id=>mod.GRADE8_CORE_QUESTIONS.find(q=>q.id===id);
 const rects=[...get('P8-M20').figure.svg.matchAll(/<rect\s+x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/gu)].map(m=>m.slice(1).map(Number));
 assert.equal(rects.length,2);for(const [, ,w,h] of rects)assert.equal(w,h,'A shape called a square must be drawn square');
 assert.ok(Math.abs(rects[0][2]/rects[1][2]-20/18)<1e-9);assert.equal(rects[1][0]-rects[0][0],rects[1][1]-rects[0][1]);
 const lines=[...get('P8-M14').figure.svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/gu)].map(m=>m.slice(1).map(Number));
 const diagonal=lines.find(([x,y,a,b])=>x!==a&&y!==b);assert.ok(diagonal);assert.ok(Math.abs(Math.abs(diagonal[3]-diagonal[1])/Math.abs(diagonal[2]-diagonal[0])-12/5)<1e-9);
});
test('grade8 similarity and prism items assess recognition and nets rather than excluded similarity-area problems',()=>{
 const get=id=>mod.GRADE8_CORE_QUESTIONS.find(q=>q.id===id);
 const similar=get('P8-M16');assert.equal(similar.options[similar.answer],'II');assert.equal(similar.familyId,'similar_not_congruent');assert.ok(similar.figure);
 const net=get('P8-M17');assert.equal(net.options[net.answer],'6 cm × 4 cm');assert.ok(net.figure);
});
test('Turkish and science keys follow independent reading of all22 passages and tasks',()=>{
 const expected={
 'P8-T01':'Okumak, kişinin metinle kendi yaşamı arasında bağ kurmasıyla derinleşir.',
 'P8-T02':'Akşam erişimi bazı öğrencilerin çalışma düzenini etkilemiştir.',
 'P8-T03':'Neden: Yolun buzlanması; sonuç: Servisin yavaş ilerlemesi.',
 'P8-T04':'Bitkilerin gelişimini karşılaştırmak',
 'P8-T05':'Yeni bir düşünme olanağı sağlamak','P8-T06':'II–III–I','P8-T07':'III','P8-T08':'Betimleme','P8-T09':'Karşılaştırma','P8-T10':'Günlük',
 'P8-T11':'Seninde fikrini dinleyelim.','P8-T12':'İki nokta','P8-T13':'İsim-fiil','P8-T14':'Öğrenciler','P8-T15':'Sınıfta hiç kimse kalmamış.','P8-T16':'Ece–Deniz–Ali','P8-T17':'Robotik',
 'P8-T18':'Gözlem yaparken tek bir özelliğe bağlı kalmamak gerekir.','P8-T19':'hataları öğrenmeyi yönlendiren işaretler olarak görmeliyiz.','P8-T20':'Kişileştirme','P8-F19':'Karbondioksit','P8-F20':'I hava olayı, II iklim'};
 for(const [id,answer] of Object.entries(expected)){const q=mod.GRADE8_CORE_QUESTIONS.find(q=>q.id===id);assert.equal(q.options[q.answer],answer,id);}
});
test('student wording keeps readable comma spacing and number-unit spacing',()=>{
 for(const q of mod.GRADE8_CORE_QUESTIONS){const texts=[q.stimulus,q.stem,...q.options,...Object.values(q.explanation).flat(),q.figure?.alt??''];for(const text of texts){assert.doesNotMatch(text,/,[\p{L}“]/u,q.id);assert.doesNotMatch(text,/\d(?:cm|mm|m(?:\.|,|²|³|\s)|TL|kat|öğrenci|ürün)/u,q.id);}}
});
test('source references point to real catalog entries without claiming item-level acceptance',()=>{
 const registry=JSON.parse(readFileSync(new URL('../sources/meb-reference-registry.json',import.meta.url),'utf8'));
 const ids=new Set(registry.sources.map(source=>source.id));
 for(const q of mod.GRADE8_CORE_QUESTIONS){assert.ok(ids.has(q.source.programId),q.id);assert.equal(q.source.alignmentStatus,'draft');}
 const reviewed=mod.GRADE8_CORE_QUESTIONS.find(q=>q.id==='P8-M16');assert.equal(reviewed.outcomeCode,'M.8.3.3.1');assert.equal(reviewed.source.physicalPage,77);
});
test('math keys match independent computations across number,algebra,geometry and data tasks',()=>{
 assert.ok(Array.isArray(mod.GRADE8_CORE_QUESTIONS));const qs=mod.GRADE8_CORE_QUESTIONS;const answer=id=>{const q=qs.find(q=>q.id===id);return q.options[q.answer];};
 assert.equal(answer('P8-M01'),'6');assert.equal(answer('P8-M02'),'11.36');assert.equal(answer('P8-M03'),String(2**9));assert.equal(answer('P8-M04'),'6 × 10⁻⁴');assert.equal(answer('P8-M05'),'13');assert.equal(answer('P8-M06'),'200/9');assert.equal(answer('P8-M07'),'5/12');assert.equal(answer('P8-M08'),'72°');assert.equal(answer('P8-M09'),'72');assert.equal(answer('P8-M10'),'x² − 8x + 16');assert.equal(answer('P8-M11'),'6');assert.equal(answer('P8-M12'),'4');assert.equal(answer('P8-M13'),'40');assert.equal(answer('P8-M14'),'12');assert.equal(answer('P8-M15'),'11');assert.equal(answer('P8-M16'),'II');assert.equal(answer('P8-M17'),'6 cm × 4 cm');assert.equal(answer('P8-M18'),'240');assert.equal(answer('P8-M19'),'1/3');assert.equal(answer('P8-M20'),'400');
});
