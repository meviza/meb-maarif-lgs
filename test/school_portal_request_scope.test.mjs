import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequestScope} from '../packages/school-portal/request_scope.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};

test('a delayed successful import cannot publish its credentials after an account transition',async()=>{
 const scope=createRequestScope(),pending=deferred(),ticket=scope.capture('school-admin-a');let receipt=null;
 const work=scope.resolve(ticket,pending.promise).then(data=>{receipt={owner:ticket.actorId,created:data.created};});
 scope.invalidate();scope.capture('school-admin-b');pending.resolve({created:[{temporaryPassword:'Demo-Private-A'}]});
 await assert.rejects(work,e=>e.code==='stale_request'&&e.silent===true);assert.equal(receipt,null);
});
test('a delayed unauthorized response cannot terminate the newer account',async()=>{
 const scope=createRequestScope(),pending=deferred(),ticket=scope.capture('student-a');let currentUser='student-a';
 const work=scope.resolve(ticket,pending.promise).then(response=>{if(response.status===401)currentUser=null;});
 scope.invalidate();currentUser='student-b';pending.resolve({status:401});await assert.rejects(work,e=>e.code==='stale_request');assert.equal(currentUser,'student-b');
});
test('old successful attempt responses and old network failures are both discarded',async()=>{
 const scope=createRequestScope(),success=deferred(),failure=deferred(),ticket=scope.capture('student-a');let displayed=null;
 const a=scope.resolve(ticket,success.promise).then(value=>{displayed=value;});const b=scope.resolve(ticket,failure.promise);
 scope.invalidate();success.resolve({studentId:'student-a',responses:{q:2}});failure.reject(new Error('network_failed'));
 await assert.rejects(a,e=>e.code==='stale_request');await assert.rejects(b,e=>e.code==='stale_request');assert.equal(displayed,null);
});
test('current responses preserve dispatch ownership and ordinary network errors remain visible',async()=>{
 const scope=createRequestScope(),ticket=scope.capture('school-admin-a'),data=await scope.resolve(ticket,Promise.resolve({ok:true}));
 assert.equal(ticket.actorId,'school-admin-a');assert.equal(Object.isFrozen(ticket),true);assert.deepEqual(data,{ok:true});
 await assert.rejects(scope.resolve(ticket,Promise.reject(new Error('network_failed'))),/network_failed/);assert.equal(scope.isCurrent(ticket),true);scope.invalidate();assert.equal(scope.isCurrent(ticket),false);
});
