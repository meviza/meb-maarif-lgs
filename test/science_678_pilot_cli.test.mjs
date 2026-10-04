import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('stale pilot commands cannot export rejected stock, start old preview or invoke Clef',()=>{
 for(const flag of [undefined,'--json','--preview','--clef-preflight','--benchmark']){
   const r=spawnSync(process.execPath,['tools/science_678_pilot.mjs',...(flag?[flag]:[])],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:3000});
   assert.equal(r.status,1);assert.equal(r.stdout,'');assert.match(r.stderr,/Retired/);
 }
});
