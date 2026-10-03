#!/usr/bin/env node
// Explicit opt-in, isolated synthetic SQL proof. This is not an HTTP endpoint,
// production adapter, PostgreSQL wire driver, or a live authorization resolver.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isProxy } from 'node:util/types';
import { createSyntheticNotebookSyncPreparer } from '../packages/contracts/synthetic_notebook_sync.mjs';
import { createSyntheticNotebookFixture, createSyntheticNotebookRequest, createSyntheticNotebookReceipt,
  hashSyntheticNotebook, canonicalSyntheticNotebook } from '../test/support/synthetic_notebook_fixture.mjs';

const IMAGE='postgres:16.15-alpine', DEFAULT_CONTAINER='k12-synthetic-notebook-proof';
const NAME=/^k12-synthetic-notebook-[a-z0-9][a-z0-9-]{0,40}$/u;
const roles=Object.freeze({a:'synthetic_notebook_school_a_app',b:'synthetic_notebook_school_b_app',none:'synthetic_notebook_no_scope_app'});
export const SYNTHETIC_NOTEBOOK_SQL=Object.freeze({
  commit:'SELECT student_notebook.commit_intent($1) AS notebook_result',
  current:'SELECT student_notebook.read_current($1) AS notebook_result',
  historical:'SELECT student_notebook.read_revision($1,$2) AS notebook_result',
});
const literal=value=>`'${value.replaceAll("'","''")}'`;
const json=value=>`${literal(JSON.stringify(value))}::jsonb`;
function inertObject(value,fields) {
  if(value===null||typeof value!=='object'||isProxy(value)||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value))) return null;
  const d=Object.getOwnPropertyDescriptors(value),keys=Reflect.ownKeys(d);
  return keys.length===fields.length&&keys.every(k=>typeof k==='string'&&fields.includes(k)&&d[k].enumerable&&Object.hasOwn(d[k],'value'))?d:null;
}
function inertArray(value,maximum,error) {
  if(value===null||typeof value!=='object'||isProxy(value)||!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype) throw new Error(error);
  const d=Object.getOwnPropertyDescriptors(value),size=d.length?.value;
  if(!Number.isSafeInteger(size)||size>maximum||Reflect.ownKeys(d).length!==size+1) throw new Error(error);
  const out=[];
  for(let i=0;i<size;i++) {const f=d[String(i)];if(!f||!f.enumerable||!Object.hasOwn(f,'value')||typeof f.value!=='string') throw new Error(error);out.push(f.value);}
  return out;
}
export function parseSyntheticNotebookArgs(argv) {
  const a=inertArray(argv,4,'invalid_synthetic_notebook_args');let run=false,container=DEFAULT_CONTAINER,named=false,adapter=false;
  for(let i=0;i<a.length;i++) {
    if(a[i]==='--run'&&!run) run=true;
    else if(a[i]==='--adapter'&&!adapter) adapter=true;
    else if(a[i]==='--container'&&!named&&typeof a[i+1]==='string'&&NAME.test(a[i+1])) {container=a[++i];named=true;}
    else throw new Error('invalid_synthetic_notebook_args');
  }
  return Object.freeze(adapter?{run,container,adapter:true}:{run,container});
}
export function buildSyntheticNotebookDockerArgs(options) {
  const d=inertObject(options,['run','container']);
  if(!d||typeof d.run.value!=='boolean'||typeof d.container.value!=='string'||!NAME.test(d.container.value)) throw new Error('invalid_synthetic_notebook_args');
  if(!d.run.value) throw new Error('synthetic_notebook_run_required');
  return ['run','--detach','--rm','--pull=never','--name',d.container.value,'--label','k12.synthetic-notebook.proof=true',
    '--network=none','--memory=256m','--cpus=1','--pids-limit=100','--read-only','--user=postgres','--cap-drop=ALL',
    '--security-opt=no-new-privileges','--shm-size=2m',
    '--tmpfs','/var/lib/postgresql/data:rw,noexec,nosuid,size=56m,mode=1777',
    '--tmpfs','/tmp:rw,noexec,nosuid,size=1m,mode=1777','--tmpfs','/var/run/postgresql:rw,noexec,nosuid,size=1m,mode=1777',
    '-e','PGDATA=/var/lib/postgresql/data/notebook','-e','POSTGRES_DB=synthetic_notebook','-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '-e','POSTGRES_INITDB_ARGS=--wal-segsize=1 --encoding=UTF8 --locale=C',IMAGE,'postgres',
    '-c','shared_buffers=16MB','-c','max_connections=10','-c','max_wal_size=8MB','-c','min_wal_size=2MB',
    '-c','wal_level=minimal','-c','max_wal_senders=0','-c','statement_timeout=5s','-c','lock_timeout=2s',
    '-c','idle_in_transaction_session_timeout=5s','-c','standard_conforming_strings=on'];
}
// Only a bounded, allowlisted same-session PREPARE/EXECUTE proof bridge.
// Values are quoted here, not a real wire-protocol parameterized driver.
export function buildSyntheticNotebookPsqlStatement(query) {
  const d=inertObject(query,['text','values']);if(!d) throw new Error('invalid_synthetic_notebook_query');
  const plans=[[SYNTHETIC_NOTEBOOK_SQL.commit,['jsonb']],[SYNTHETIC_NOTEBOOK_SQL.current,['text']],[SYNTHETIC_NOTEBOOK_SQL.historical,['text','bigint']],
    ['SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result',['jsonb']],
    ['SELECT student_notebook.read_current($1::text) AS notebook_result',['text']],
    ['SELECT student_notebook.read_revision($1::text,$2::bigint) AS notebook_result',['text','bigint']]];
  const plan=plans.find(p=>p[0]===d.text.value);if(!plan) throw new Error('invalid_synthetic_notebook_query');
  const values=inertArray(d.values.value,2,'invalid_synthetic_notebook_query');
  if(values.length!==plan[1].length||values.some(v=>Buffer.byteLength(v,'utf8')>524288||v.includes('\0'))
    ||(plan[1][1]==='bigint'&&(!/^(?:0|[1-9]\d{0,15})$/u.test(values[1])||BigInt(values[1])>=9007199254740991n))) throw new Error('invalid_synthetic_notebook_query');
  return `PREPARE synthetic_notebook_request(${plan[1].join(',')}) AS ${plan[0]}; EXECUTE synthetic_notebook_request(${values.map(literal).join(',')}); DEALLOCATE synthetic_notebook_request;`;
}
function docker(args,input,allowFailure=false) {
  const result=spawnSync('docker',args,{input,encoding:'utf8',timeout:20000,maxBuffer:2*1024*1024,shell:false});
  if(!allowFailure&&(result.error||result.status!==0)) throw new Error(`synthetic_notebook_docker_failed: ${(result.error?.message??result.stderr).slice(0,1800)}`);
  return result;
}
function confirmedAbsent(outcome) {
  return !outcome.error&&outcome.status===1&&/No such (?:container|object):/u.test(outcome.stderr);
}
function prepared(source,request) {
  const out=createSyntheticNotebookSyncPreparer(source).prepare(request);assert.equal(out.valid,true,JSON.stringify(out.error));return JSON.parse(JSON.stringify(out.intent));
}
function seed(source) {
  const scope=hashSyntheticNotebook('scope',source.scope);
  return `INSERT INTO student_notebook.notebooks(scope_sha256,scope_json,catalog_json,policy_json,targets_json) VALUES(${literal(scope)},${json(source.scope)},${json(source.catalog)},${json(source.policy)},${json(source.allowedTargets)});`;
}
async function runProof(options) {
  const name=options.container;
  const existing=docker(['container','inspect',name],undefined,true);
  if(existing.status===0) throw new Error('synthetic_notebook_container_already_exists_no_takeover');
  if(!confirmedAbsent(existing)) throw new Error('synthetic_notebook_container_absence_not_confirmed');
  docker(['image','inspect',IMAGE]);
  const migration=await readFile(new URL('../db/migrations/002_synthetic_student_notebook.sql',import.meta.url),'utf8');
  const createdId=docker(buildSyntheticNotebookDockerArgs({run:options.run,container:options.container})).stdout.trim();
  let stopped=false;const witnesses=[],adapterWitnesses=[];
  const psql=(role,sql,allowFailure=false)=>docker(['exec','-i',name,'psql','-X','-q','-A','-t','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U',role,'-d','synthetic_notebook'],sql,allowFailure);
  const scalar=(role,sql)=>psql(role,sql).stdout.trim();
  const result=(role,text,values)=>JSON.parse(scalar(role,buildSyntheticNotebookPsqlStatement({text,values})));
  const denied=(label,role,sql,expected)=>{const outcome=psql(role,sql,true);assert.notEqual(outcome.status,0,`${label} must fail`);assert.match(outcome.stderr,expected,label);witnesses.push(label);};
  const commitSql=intent=>buildSyntheticNotebookPsqlStatement({text:SYNTHETIC_NOTEBOOK_SQL.commit,values:[JSON.stringify(intent)]});
  try {
    let ready=false;
    for(let attempt=0;attempt<50;attempt++){const probe=psql('postgres','SELECT 1;',true);if(probe.status===0&&probe.stdout.trim()==='1'){ready=true;break;}await new Promise(done=>setTimeout(done,200));}
    assert.equal(ready,true,'isolated notebook PostgreSQL failed to become ready');
    psql('postgres',migration);
    const a=createSyntheticNotebookFixture('a'),b=createSyntheticNotebookFixture('b'),req=createSyntheticNotebookRequest('a'),reqB=createSyntheticNotebookRequest('b');
    const intent=prepared(a,req),intentB=prepared(b,reqB),scope=intent.scopeSha256,scopeB=intentB.scopeSha256;
    psql('postgres',`${seed(a)}${seed(b)}INSERT INTO student_notebook.principal_scopes VALUES(${literal(roles.a)},${literal(scope)}),(${literal(roles.b)},${literal(scopeB)});`);
    // The remainder is explicit real SQL assertions, never mocked by default.
    await verifyNotebookDatabase({a,b,req,reqB,intent,intentB,scope,scopeB,psql,scalar,result,denied,commitSql,witnesses});
    if(options.adapter) await verifyNotebookAdapter({a,b,scope,scopeB,psql,scalar,result,witnesses:adapterWitnesses});
  } finally {
    const owner=docker(['container','inspect','--format','{{.Id}}',name],undefined,true);
    if(owner.status===0&&owner.stdout.trim()===createdId){docker(['stop','--time','5',name]);stopped=confirmedAbsent(docker(['container','inspect',name],undefined,true));}
    else if(confirmedAbsent(owner)) stopped=true;
    assert.equal(stopped,true,'owned synthetic notebook container cleanup not confirmed');
  }
  return {state:'passed',syntheticOnly:true,databaseProofExecuted:true,productionReady:false,container:name,containerStopped:stopped,
    limits:{cpu:1,memoryMiB:256,tmpfsMiB:58,shmMiB:2,network:'none',hostPorts:0,hostMounts:0},witnessCount:witnesses.length,witnesses,
    ...(options.adapter?{adapterProofRequested:true,adapterProofExecuted:true,adapterWitnessCount:adapterWitnesses.length,adapterWitnesses}: {})};
}
async function verifyNotebookAdapter(context) {
  const {a,b,scope,scopeB,psql,scalar,result,witnesses}=context;
  const {createSyntheticNotebookAdapter,SYNTHETIC_NOTEBOOK_ADAPTER_SQL:sql}=await import('../packages/contracts/synthetic_notebook_adapter.mjs');
  // Trusted test composition reconstructs its fixed fixture from real scoped
  // reads. This is not a learner DTO or a production catalog/auth resolver.
  const sourceAt=(base,role,sha)=>{
    const head=result(role,sql.current,[sha]),source=structuredClone(base);
    source.currentRevision={revision:head.revision,bodySha256:head.bodySha256};source.receipts=[];
    for(let n=1;n<=head.revision;n++) source.receipts.push(result(role,sql.historical,[sha,String(n)]).receipt);
    return source;
  };
  const executeAt=(role,calls,transform=value=>value)=>query=>{
    assert.equal(Object.isFrozen(query),true);assert.equal(Object.isFrozen(query.values),true);
    assert.deepEqual(Object.keys(query),['text','values']);assert.ok(Object.values(sql).includes(query.text));
    calls.push(query.text);const outcome=psql(role,buildSyntheticNotebookPsqlStatement(query),true);
    if(outcome.status!==0){const error=new Error('synthetic_sql_execution_denied');error.code=outcome.stderr.match(/ERROR:\s+([0-9A-Z]{5}):/u)?.[1];throw error;}
    return transform({rowCount:1,rows:[{notebook_result:JSON.parse(outcome.stdout.trim())}]},query);
  };
  const requestAt=(n,text)=>{const r=createSyntheticNotebookRequest('a');r.expectedRevision=n-1;r.mutationId=`mutation-notebook-adapter-${n}`;r.idempotencyKey=`idem-notebook-adapter-${n}`;r.body.text=text;return r;};
  const source2=sourceAt(a,roles.a,scope),sourceB=sourceAt(b,roles.b,scopeB),calls=[];
  assert.equal(source2.currentRevision.revision,2);assert.equal(sourceB.currentRevision.revision,1);
  const adapter=createSyntheticNotebookAdapter({sourceFixture:source2,execute:executeAt(roles.a,calls)});
  const other=createSyntheticNotebookAdapter({sourceFixture:sourceB,execute:executeAt(roles.b,[])});
  const req3=requestAt(3,'Üçüncü kayıt: çevreyi izledim. 📝'),prepared3=adapter.prepare(req3);assert.equal(prepared3.valid,true);
  assert.equal((await adapter.commit(structuredClone(prepared3.command))).error.code,'untrusted_notebook_command');
  assert.equal((await other.commit(prepared3.command)).error.code,'untrusted_notebook_command');assert.equal(calls.length,0);
  witnesses.push('adapter_clone_and_other_adapter_commands_rejected_before_database');
  const saved=await adapter.commit(prepared3.command);assert.equal(saved.valid,true);assert.equal(saved.outcome,'accepted');
  assert.equal(saved.persisted,true);assert.equal(saved.persistenceConfirmed,true);assert.equal(saved.currentHeadVerified,false);assert.equal(saved.sourceAdvanced,false);
  assert.deepEqual(saved.receipt,createSyntheticNotebookReceipt(source2,req3));assert.equal(saved.head.revision,3);
  assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'3');
  witnesses.push('adapter_exact_typed_query_values_commit_matches_real_sql_receipt');
  const next=requestAt(4,'Dördüncü kayıt');assert.equal(adapter.prepare(next).valid,false);
  const changed=structuredClone(req3);changed.body.text+=' değişti';const beforeConflict=calls.length;
  assert.equal(adapter.prepare(changed).error.code,'notebook_idempotency_conflict');assert.equal(calls.length,beforeConflict);
  witnesses.push('confirmed_write_does_not_advance_source_and_changed_idempotency_body_is_local_denial');
  const repeated=await adapter.commit(prepared3.command);assert.equal(repeated.outcome,'idempotent_replay');assert.deepEqual(repeated.receipt,saved.receipt);
  assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'3');
  witnesses.push('adapter_exact_duplicate_real_sql_replay_creates_no_extra_history');
  const current=await adapter.readCurrent();assert.equal(current.valid,true);assert.equal(current.revision,3);assert.equal(current.sourceAdvanced,true);
  assert.equal(current.body.text,req3.body.text);assert.equal(adapter.prepare(next).valid,true);
  witnesses.push('explicit_real_current_read_alone_advances_adapter_source');
  const old=await adapter.readRevision(1);assert.equal(old.valid,true);assert.equal(old.revision,1);assert.equal(old.sourceAdvanced,false);
  assert.deepEqual(old.body,createSyntheticNotebookRequest('a').body);assert.equal(adapter.prepare(next).valid,true);
  witnesses.push('adapter_real_historical_read_never_rolls_back_current_head');
  const wrongCalls=[],wrongRole=createSyntheticNotebookAdapter({sourceFixture:sourceAt(a,roles.a,scope),execute:executeAt(roles.b,wrongCalls)});
  const wrong=await wrongRole.commit(wrongRole.prepare(next).command);assert.equal(wrong.valid,false);assert.equal(wrong.error.code,'notebook_scope_denied');
  assert.equal(wrong.commitState,'unknown');assert.equal(wrong.persisted,null);assert.equal(wrong.automaticRetry,false);assert.equal(wrongCalls.length,1);
  assert.equal(result(roles.a,sql.current,[scope]).revision,3);assert.equal(result(roles.b,sql.current,[scopeB]).revision,1);
  witnesses.push('fixed_wrong_school_executor_real_sql_scope_denial_is_sanitized_unknown_not_success');
  const badReadCalls=[],badRead=createSyntheticNotebookAdapter({sourceFixture:source2,execute:executeAt(roles.a,badReadCalls,value=>({...value,rowCount:2}))});
  const malformed=await badRead.readCurrent();assert.equal(malformed.valid,false);assert.equal(malformed.readState,'unknown');assert.equal(malformed.persisted,null);
  assert.equal(badRead.prepare(next).valid,false);assert.equal(badReadCalls.length,1);
  witnesses.push('malformed_real_scoped_read_response_does_not_advance_adapter_source');
  // Failure is injected AFTER a genuine SQL commit. No fake rollback or
  // automatic retry may turn this into a known non-persisted write.
  const lostCalls=[],lost=createSyntheticNotebookAdapter({sourceFixture:sourceAt(a,roles.a,scope),execute:executeAt(roles.a,lostCalls,(value,query)=>{
    if(query.text===sql.commit)throw new Error('synthetic_response_lost_after_commit');return value;
  })});
  const unknown=await lost.commit(lost.prepare(next).command);assert.equal(unknown.valid,false);assert.equal(unknown.commitState,'unknown');
  assert.equal(unknown.persisted,null);assert.equal(unknown.persistenceConfirmed,false);assert.equal(unknown.automaticRetry,false);assert.equal(lostCalls.length,1);
  assert.equal(result(roles.a,sql.current,[scope]).revision,4);assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'4');
  witnesses.push('genuine_sql_commit_then_response_throw_remains_unknown_persisted_null_no_automatic_retry');
  const recovered=await lost.readCurrent();assert.equal(recovered.valid,true);assert.equal(recovered.revision,4);assert.equal(recovered.sourceAdvanced,true);
  assert.equal(recovered.body.text,next.body.text);
  witnesses.push('explicit_scoped_read_recovers_actual_committed_head_after_response_loss');
  const malformedCalls=[],badWrite=createSyntheticNotebookAdapter({sourceFixture:sourceAt(a,roles.a,scope),execute:executeAt(roles.a,malformedCalls,(value,query)=>{
    if(query.text===sql.commit)value.rows[0].notebook_result.head.bodySha256='0'.repeat(64);return value;
  })});
  const req5=requestAt(5,'Beşinci kayıt: sonucu denetledim.'),unknown5=await badWrite.commit(badWrite.prepare(req5).command);
  assert.equal(unknown5.valid,false);assert.equal(unknown5.error.code,'notebook_response_invalid');assert.equal(unknown5.persisted,null);assert.equal(unknown5.automaticRetry,false);
  assert.equal(malformedCalls.length,1);assert.equal(result(roles.a,sql.current,[scope]).revision,5);
  assert.equal((await badWrite.readCurrent()).revision,5);
  witnesses.push('genuine_sql_commit_with_malformed_receipt_response_remains_unknown_until_explicit_read');
  const profileCalls=[],profile=createSyntheticNotebookAdapter({sourceFixture:sourceAt(a,roles.a,scope),execute:executeAt(roles.a,profileCalls)});
  for(const mutate of [r=>{r.body.strokes[0].points[0].x=0.12345;},r=>{r.body.text='\u0000';},r=>{r.body.text='\ud800';}]) {
    const r=requestAt(6,'Altıncı kayıt');mutate(r);assert.equal(profile.prepare(r).error.code,'notebook_postgres_profile_unsupported');
  }
  assert.equal(profileCalls.length,0);assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'5');
  assert.equal(scalar(roles.b,'SELECT count(*) FROM student_notebook.history;'),'1');assert.equal(scalar(roles.none,'SELECT count(*) FROM student_notebook.history;'),'0');
  witnesses.push('postgres_precision_and_unicode_profiles_fail_before_database_without_rounding');
  witnesses.push('adapter_phase_two_school_history_and_heads_remain_isolated_a5_b1_unmapped0');
}
async function verifyNotebookDatabase(context) {
  const {a,b,req,reqB,intent,intentB,scope,scopeB,psql,scalar,result,denied,commitSql,witnesses}=context;
  const rehash=i=>{i.bodySha256=hashSyntheticNotebook('body',i.body);i.requestSha256=hashSyntheticNotebook('request',
    {scopeSha256:i.scopeSha256,contractVersion:i.contractVersion,mutationId:i.mutationId,idempotencyKey:i.idempotencyKey,expectedRevision:i.expectedRevision,body:i.body});
    i.intentSha256=hashSyntheticNotebook('intent',Object.fromEntries(Object.entries(i).filter(([k])=>k!=='intentSha256')));return i;};
  const negative=(label,mutate,pattern=/22023:/u)=>{const bad=structuredClone(intent);mutate(bad);rehash(bad);denied(label,roles.a,commitSql(bad),pattern);};
  for(const role of Object.values(roles)) assert.equal(scalar(role,'SELECT rolsuper OR rolbypassrls FROM pg_catalog.pg_roles WHERE rolname=current_user;'),'f');
  assert.equal(scalar('postgres',"SELECT rolcanlogin OR rolsuper OR rolbypassrls FROM pg_catalog.pg_roles WHERE rolname='synthetic_notebook_owner';"),'f');
  witnesses.push('application_roles_are_non_superuser_owner_nologin_nobypassrls');
  assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.notebooks;'),'1');
  assert.equal(scalar(roles.b,'SELECT count(*) FROM student_notebook.notebooks;'),'1');
  assert.equal(scalar(roles.none,'SELECT count(*) FROM student_notebook.notebooks;'),'0');
  assert.equal(scalar('postgres',"SELECT bool_and(relrowsecurity AND relforcerowsecurity) FROM pg_catalog.pg_class WHERE oid IN ('student_notebook.notebooks'::regclass,'student_notebook.history'::regclass);"),'t');
  witnesses.push('force_rls_own_scope_only_no_scope_zero_rows');
  denied('unmapped_role_commit_denied',roles.none,commitSql(intent),/42501:.*scope_denied/u);
  denied('other_school_commit_denied',roles.a,commitSql(intentB),/42501:.*scope_denied/u);
  denied('other_school_read_denied',roles.a,buildSyntheticNotebookPsqlStatement({text:SYNTHETIC_NOTEBOOK_SQL.current,values:[scopeB]}),/42501:.*scope_denied/u);
  for(const change of [{grade:7},{learnerId:b.scope.learnerId},{schoolYear:'2027-2028'},{notebookId:'synthetic-notebook-other'}]) {
    negative(`rehashed_scope_${Object.keys(change)[0]}_denied`,i=>{Object.assign(i.scope,change);i.scopeSha256=hashSyntheticNotebook('scope',i.scope);},/42501:.*scope_denied/u);
  }
  assert.equal(scalar(roles.a,`SET app.tenant_id=${literal(b.scope.schoolId)}; SET app.scope_sha256=${literal(scopeB)}; SELECT scope_sha256 FROM student_notebook.notebooks;`),scope);
  witnesses.push('caller_guc_does_not_change_fixed_session_user_scope');
  denied('set_role_owner_denied',roles.a,'SET ROLE synthetic_notebook_owner;',/42501:/u);
  denied('set_session_authorization_other_school_denied',roles.a,`SET SESSION AUTHORIZATION ${roles.b};`,/42501:/u);
  denied('principal_map_select_denied',roles.a,'SELECT * FROM student_notebook.principal_scopes;',/42501:/u);
  denied('direct_head_write_denied',roles.a,`UPDATE student_notebook.notebooks SET current_revision=9 WHERE scope_sha256=${literal(scope)};`,/42501:/u);
  // Cross-language hash witnesses must actually run against PostgreSQL before
  // the bounded Unicode/decimal profile is called verified.
  for(const [kind,value] of [['scope',a.scope],['asset',Object.fromEntries(Object.entries(a.catalog.asset).filter(([k])=>k!=='definitionSha256'))],
    ['catalog',Object.fromEntries(Object.entries(a.catalog).filter(([k])=>k!=='catalogSha256'))],
    ['policy',Object.fromEntries(Object.entries(a.policy).filter(([k])=>k!=='policySha256'))],['body',req.body],
    ['intent',Object.fromEntries(Object.entries(intent).filter(([k])=>k!=='intentSha256'))]]) {
    assert.equal(scalar('postgres',`SELECT student_notebook.hash_jsonb(${literal(kind)},${json(value)});`),hashSyntheticNotebook(kind,value));
    assert.equal(JSON.parse(scalar('postgres',`SELECT to_json(student_notebook.canonical_jsonb(${json(value)}));`)),canonicalSyntheticNotebook(value));
  }
  assert.equal(scalar('postgres',`SELECT student_notebook.utf16_units('📝Ç');`),'3');
  witnesses.push('js_sql_unicode_escaped_text_decimal_0_125_0_0001_canonical_and_hash_equal');
  const fresh=result(roles.a,SYNTHETIC_NOTEBOOK_SQL.current,[scope]);assert.equal(fresh.revision,0);assert.equal(fresh.body,null);assert.equal(fresh.receipt,null);
  witnesses.push('own_empty_head_read');
  // Deliberately rehashed malicious DTOs test SQL, not just the preparer.
  negative('extra_intent_authority_field_denied',i=>{i.authorized=true;});
  negative('null_mutation_id_denied',i=>{i.mutationId=null;});
  negative('null_idempotency_key_denied',i=>{i.idempotencyKey=null;});
  negative('null_expected_revision_denied',i=>{i.expectedRevision=null;});
  negative('fractional_expected_revision_denied',i=>{i.expectedRevision=0.5;i.nextRevision=1.5;});
  negative('null_body_text_denied',i=>{i.body.text=null;});
  negative('unknown_body_field_denied',i=>{i.body.html='<b>not plain text</b>';});
  negative('unknown_bookmark_target_denied',i=>{i.body.bookmarks.questions=['question-other-school'];});
  negative('wrong_bookmark_kind_denied',i=>{i.body.bookmarks.topics=['question-a-001'];});
  negative('duplicate_bookmark_denied',i=>{i.body.bookmarks.questions.push('question-a-001');});
  negative('foreign_grade_note_denied',i=>{i.body.notes[0].grade=7;});
  negative('non_plain_note_format_denied',i=>{i.body.notes[0].format='html';});
  negative('duplicate_note_denied',i=>{i.body.notes.push(i.body.notes[0]);});
  negative('null_note_text_denied',i=>{i.body.notes[0].text=null;});
  negative('blank_concern_denied',i=>{i.body.concerns[0].text=' \t\n\u00a0';});
  negative('excess_text_utf16_units_denied',i=>{i.body.text='📝'.repeat(2001);});
  negative('unsupported_coordinate_precision_denied_no_rounding',i=>{i.body.strokes[0].points[0].x=0.12345;});
  negative('coordinate_range_denied',i=>{i.body.strokes[0].points[0].y=1.0001;});
  negative('null_coordinate_denied',i=>{i.body.strokes[0].points[0].x=null;});
  negative('stroke_palette_denied',i=>{i.body.strokes[0].color='url(javascript:bad)';});
  negative('stroke_width_denied',i=>{i.body.strokes[0].width=3;});
  negative('empty_points_denied',i=>{i.body.strokes[0].points=[];});
  negative('extra_point_field_denied',i=>{i.body.strokes[0].points[0].pressure=0.5;});
  negative('duplicate_stroke_denied',i=>{i.body.strokes.push(i.body.strokes[0]);});
  negative('too_many_points_denied',i=>{i.body.strokes[0].points=Array(513).fill({x:0,y:1});});
  negative('too_many_notes_denied',i=>{i.body.notes=Array.from({length:101},(_,n)=>({id:`note-${n}`,text:'Not',grade:6,format:'plain_text'}));});
  negative('body_byte_budget_denied',i=>{i.body.notes=Array.from({length:100},(_,n)=>({id:`note-${n}`,text:'ğ'.repeat(1000),grade:6,format:'plain_text'}));});
  for(const key of ['purpose','ownerId','stewardId','retentionClass','catalogSha256','targetCatalogSha256']) negative(`caller_rehashed_governance_${key}_denied`,i=>{i.governanceBinding[key]='forged';});
  negative('caller_rehashed_limits_widening_denied',i=>{i.governanceBinding.limits.textMaxUnits=9999;});
  const raw=structuredClone(intent);raw.body.text='unhashed change';denied('body_hash_tamper_denied',roles.a,commitSql(raw),/22023:/u);
  const hash=structuredClone(intent);hash.intentSha256='a'.repeat(64);denied('intent_hash_tamper_denied',roles.a,commitSql(hash),/22023:/u);
  const nul=structuredClone(intent);nul.body.text='\u0000';rehash(nul);denied('postgres_null_character_profile_rejected',roles.a,commitSql(nul),/22P05:|22023:/u);
  assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'0');
  witnesses.push('rejected_intents_leave_no_history_or_revision');
  const first=result(roles.a,SYNTHETIC_NOTEBOOK_SQL.commit,[JSON.stringify(intent)]),expectedReceipt=createSyntheticNotebookReceipt(a,req);
  assert.equal(first.outcome,'accepted');assert.deepEqual(first.receipt,expectedReceipt);assert.equal(first.head.revision,1);assert.equal(first.head.bodySha256,intent.bodySha256);
  const again=result(roles.a,SYNTHETIC_NOTEBOOK_SQL.commit,[JSON.stringify(intent)]);
  assert.equal(again.outcome,'idempotent_replay');assert.deepEqual(again.receipt,expectedReceipt);
  assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'1');
  const own=result(roles.a,SYNTHETIC_NOTEBOOK_SQL.current,[scope]);assert.deepEqual(own.body,req.body);assert.deepEqual(own.receipt,expectedReceipt);assert.equal(own.revision,1);
  assert.equal(own.governanceBinding.purpose,'student_notebook');assert.equal(own.governanceBinding.ownerId,'synthetic-owner');
  assert.equal(own.syntheticOnly,true);assert.equal(own.productionReady,false);
  witnesses.push('atomic_first_commit_duplicate_exact_receipt_single_revision_literal_readback');
  negative('changed_body_same_idempotency_denied',i=>{i.body.text+='changed';},/23505:/u);
  negative('same_key_new_mutation_denied',i=>{i.mutationId='mutation-new';},/23505:/u);
  negative('same_mutation_new_key_denied',i=>{i.idempotencyKey='idem-new';},/23505:/u);
  negative('stale_new_request_denied',i=>{i.idempotencyKey='idem-stale';i.mutationId='mutation-stale';},/40001:/u);
  negative('forged_historical_receipt_denied',i=>{i.historicalReceipt={receiptId:'synthetic-forged',receiptSha256:'a'.repeat(64)};});
  const source1=structuredClone(a);source1.currentRevision={revision:1,bodySha256:intent.bodySha256};source1.receipts=[expectedReceipt];
  const req2=structuredClone(req);req2.mutationId='mutation-notebook-a-002';req2.idempotencyKey='idem-notebook-a-002';req2.expectedRevision=1;req2.body.text='İkinci revizyon — çözüm 2.';
  const secondIntent=prepared(source1,req2);
  const changedPrior=structuredClone(secondIntent);changedPrior.priorBodySha256='b'.repeat(64);rehash(changedPrior);
  denied('prior_body_mismatch_denied',roles.a,commitSql(changedPrior),/40001:/u);
  // Explicit rollback after a successful in-transaction write must leave no
  // durable history, then the identical intent can be genuinely committed.
  denied('transaction_error_rolls_back_revision_and_receipt',roles.a,`BEGIN;${commitSql(secondIntent)} SELECT 1/0; COMMIT;`,/22012:/u);
  assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'1');assert.equal(result(roles.a,SYNTHETIC_NOTEBOOK_SQL.current,[scope]).revision,1);
  const second=result(roles.a,SYNTHETIC_NOTEBOOK_SQL.commit,[JSON.stringify(secondIntent)]);assert.equal(second.head.revision,2);
  const losingIntent=structuredClone(secondIntent);losingIntent.mutationId='mutation-concurrent-candidate';losingIntent.idempotencyKey='idem-concurrent-candidate';rehash(losingIntent);
  denied('serialized_competing_revision_candidate_denied',roles.a,commitSql(losingIntent),/40001:/u);
  const source2=structuredClone(source1);source2.currentRevision={revision:2,bodySha256:secondIntent.bodySha256};source2.receipts.push(second.receipt);
  const replayIntent=prepared(source2,req);assert.equal(replayIntent.historicalReceipt.receiptSha256,expectedReceipt.receiptSha256);
  const replay=result(roles.a,SYNTHETIC_NOTEBOOK_SQL.commit,[JSON.stringify(replayIntent)]);
  assert.equal(replay.outcome,'idempotent_replay');assert.deepEqual(replay.receipt,expectedReceipt);assert.equal(replay.head.revision,2);
  const old=result(roles.a,SYNTHETIC_NOTEBOOK_SQL.historical,[scope,'1']);assert.deepEqual(old.body,req.body);assert.deepEqual(old.receipt,expectedReceipt);assert.equal(old.revision,1);
  assert.equal(result(roles.a,SYNTHETIC_NOTEBOOK_SQL.current,[scope]).body.text,req2.body.text);
  witnesses.push('historical_exact_replay_and_own_revision_read_remain_valid_after_head_advance');
  denied('other_school_historical_read_denied',roles.b,buildSyntheticNotebookPsqlStatement({text:SYNTHETIC_NOTEBOOK_SQL.historical,values:[scope,'1']}),/42501:/u);
  denied('unmapped_historical_read_denied',roles.none,buildSyntheticNotebookPsqlStatement({text:SYNTHETIC_NOTEBOOK_SQL.historical,values:[scope,'1']}),/42501:/u);
  denied('missing_historical_revision_denied',roles.a,buildSyntheticNotebookPsqlStatement({text:SYNTHETIC_NOTEBOOK_SQL.historical,values:[scope,'3']}),/22023:/u);
  denied('direct_history_update_denied',roles.a,`UPDATE student_notebook.history SET body_json='{}'::jsonb;`,/42501:/u);
  denied('direct_history_delete_denied',roles.a,'DELETE FROM student_notebook.history;',/42501:/u);
  denied('immutable_history_even_owner_update_denied','postgres',`UPDATE student_notebook.history SET body_json=body_json WHERE scope_sha256=${literal(scope)};`,/55000:/u);
  denied('immutable_history_even_owner_delete_denied','postgres',`DELETE FROM student_notebook.history WHERE scope_sha256=${literal(scope)};`,/55000:/u);
  denied('immutable_history_truncate_denied','postgres','TRUNCATE student_notebook.history;',/55000:/u);
  const savedB=result(roles.b,SYNTHETIC_NOTEBOOK_SQL.commit,[JSON.stringify(intentB)]);assert.equal(savedB.outcome,'accepted');
  assert.deepEqual(result(roles.b,SYNTHETIC_NOTEBOOK_SQL.current,[scopeB]).body,reqB.body);
  assert.equal(scalar(roles.a,'SELECT count(*) FROM student_notebook.history;'),'2');assert.equal(scalar(roles.b,'SELECT count(*) FROM student_notebook.history;'),'1');
  assert.equal(scalar(roles.none,'SELECT count(*) FROM student_notebook.history;'),'0');
  witnesses.push('two_schools_independent_heads_and_history_no_scope_fail_closed');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  try {const options=parseSyntheticNotebookArgs(process.argv.slice(2));console.log(JSON.stringify(options.run?await runProof(options):
    {state:'not_run',syntheticOnly:true,databaseProofExecuted:false,productionReady:false,
      ...(options.adapter?{adapterProofRequested:true,adapterProofExecuted:false}:{})}));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
