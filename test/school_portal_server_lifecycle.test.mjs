import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {createSchoolPortalServer} from '../packages/school-portal/server.mjs';

test('a failed listen closes the opened synthetic database',async t=>{
 const occupied=createServer();
 await new Promise(resolve=>occupied.listen({host:'127.0.0.1',port:0},resolve));
 t.after(()=>new Promise(resolve=>occupied.close(resolve)));
 const originalClose=DatabaseSync.prototype.close;let closed=0;
 t.mock.method(DatabaseSync.prototype,'close',function(){closed++;return originalClose.call(this);});
 await assert.rejects(createSchoolPortalServer({databasePath:':memory:',questions:[],port:occupied.address().port}),{code:'EADDRINUSE'});
 assert.equal(closed,1,'the failed server must not retain a database handle');
});
