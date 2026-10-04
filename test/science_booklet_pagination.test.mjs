import test from 'node:test';
import assert from 'node:assert/strict';

test('regular questions preserve booklet reading order with at most four per page', async()=>{
 const {packQuestions}=await import('../packages/science-booklet/pagination.mjs');
 const items=Array.from({length:18},(_,i)=>({id:i,layout:'regular'}));
 const pages=packQuestions(items);
 assert.equal(pages.length,5);
 assert.deepEqual(pages.flat(2),items);
 assert.deepEqual(pages.slice(0,4).map(p=>p.map(c=>c.length)),Array(4).fill([2,2]));
});

test('the last two regular questions use both columns instead of leaving a blank half-page',async()=>{
 const {packQuestions}=await import('../packages/science-booklet/pagination.mjs');
 const pages=packQuestions([{id:1,layout:'regular'},{id:2,layout:'regular'}]);
 assert.deepEqual(pages.map(p=>p.map(c=>c.map(q=>q.id))),[[[1],[2]]]);
});

test('extended tasks reserve column space, and empty or single-item books are well-defined',async()=>{
 const {packQuestions}=await import('../packages/science-booklet/pagination.mjs');
 const items=[{id:1,layout:'extended'},{id:2,layout:'regular'},{id:3,layout:'regular'},{id:4,layout:'extended'}];
 const pages=packQuestions(items);
 assert.deepEqual(pages.flat(2),items);
 for(const page of pages)for(const column of page)assert.ok(column.reduce((n,q)=>n+(q.layout==='extended'?2:1),0)<=2);
 assert.deepEqual(packQuestions([]),[]);
 assert.deepEqual(packQuestions([items[0]]),[[[items[0]],[]]]);
});
