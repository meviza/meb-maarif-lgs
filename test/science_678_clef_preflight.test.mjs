import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {prepareScience678ClefPilot} from '../packages/content-factory/science_678_clef_preflight.mjs';
test('Clef prepares new originals with a separate MEB-style advisory, never rejected stock or claimed live review',async()=>{
 const p=await prepareScience678ClefPilot();assert.equal(p.state,'prepared_not_run');assert.equal(p.counts.externalCalls,0);
 assert.deepEqual(p.requests.map(q=>q.questionId),['YF6-06','YF7-04','YF8-01']);
 for(const row of p.requests){assert.equal(row.request.questions.meb_style_fit.type,'noul');assert.equal(row.request.state.questionId,row.questionId);assert.equal(row.requestSha256,createHash('sha256').update(JSON.stringify(row.request)).digest('hex'));assert.ok(row.requestBytes<=65536);assert.equal(Object.hasOwn(row.request,'images'),false);}
 assert.equal(p.visual.visualAuditPerformed,false);assert.equal(p.provider.liveAccessVerified,false);assert.equal(p.publicationReady,false);
});
