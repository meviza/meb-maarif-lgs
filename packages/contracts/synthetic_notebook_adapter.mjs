/** Synthetic server composition only. No HTTP/auth endpoint, PostgreSQL wire
 * driver, notebook UI, live catalog resolver, erasure or analytics pipeline.
 * The executor owns its DB identity; neither a DTO hash nor a trust flag does.
 */
import { createHash } from 'node:crypto';
import { isPromise, isProxy } from 'node:util/types';
import { createSyntheticNotebookSyncPreparer } from './synthetic_notebook_sync.mjs';

const MAX_BYTES=524288,MAX_RECEIPTS=100;
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/u,HASH=/^[a-f0-9]{64}$/u;
const RECEIPT_FIELDS=['receiptId','receiptSha256','mutationId','idempotencyKey','scopeSha256','requestSha256','bodySha256','expectedRevision','resultingRevision','policySha256','catalogSha256'];
const READ_FIELDS=['scope','scopeSha256','revision','body','bodySha256','receipt','governanceBinding','syntheticOnly','productionReady'];
export const SYNTHETIC_NOTEBOOK_ADAPTER_SQL=Object.freeze({
  commit:'SELECT student_notebook.commit_intent($1::jsonb) AS notebook_result',
  current:'SELECT student_notebook.read_current($1::text) AS notebook_result',
  historical:'SELECT student_notebook.read_revision($1::text,$2::bigint) AS notebook_result',
});
function closed(value,fields) {
  if(value===null||typeof value!=='object'||isProxy(value)||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))return false;
  const d=Object.getOwnPropertyDescriptors(value),keys=Reflect.ownKeys(d);
  return keys.length===fields.length&&keys.every(k=>typeof k==='string'&&fields.includes(k)&&d[k].enumerable&&Object.hasOwn(d[k],'value'));
}
function snapshot(value) {
  const active=new WeakSet();let nodes=0,bytes=0;
  function copy(v,depth) {
    if(++nodes>100000||depth>18)throw new Error('unsafe_notebook_dto');
    if(v===null||typeof v==='boolean')return v;
    if(typeof v==='number'&&Number.isFinite(v))return v===0?0:v;
    if(typeof v==='string'){bytes+=Buffer.byteLength(v,'utf8');if(bytes>MAX_BYTES)throw new Error('unsafe_notebook_dto');return v;}
    if(typeof v!=='object'||isProxy(v)||active.has(v))throw new Error('unsafe_notebook_dto');
    const array=Array.isArray(v),prototype=Object.getPrototypeOf(v),d=Object.getOwnPropertyDescriptors(v),keys=Reflect.ownKeys(d);
    if(array?prototype!==Array.prototype:![Object.prototype,null].includes(prototype))throw new Error('unsafe_notebook_dto');
    active.add(v);let out;
    if(array){const size=d.length?.value;if(!Number.isSafeInteger(size)||size>512||keys.length!==size+1)throw new Error('unsafe_notebook_dto');out=[];
      for(let i=0;i<size;i++){const f=d[String(i)];if(!f||!f.enumerable||!Object.hasOwn(f,'value'))throw new Error('unsafe_notebook_dto');out.push(copy(f.value,depth+1));}}
    else {if(keys.length>32)throw new Error('unsafe_notebook_dto');out={};for(const key of keys){const f=d[key];
      if(typeof key!=='string'||!f.enumerable||!Object.hasOwn(f,'value'))throw new Error('unsafe_notebook_dto');bytes+=Buffer.byteLength(key,'utf8');if(bytes>MAX_BYTES)throw new Error('unsafe_notebook_dto');
      Object.defineProperty(out,key,{value:copy(f.value,depth+1),enumerable:true});}}
    active.delete(v);return Object.freeze(out);
  }
  const result=copy(value,0);if(Buffer.byteLength(JSON.stringify(result),'utf8')>MAX_BYTES)throw new Error('unsafe_notebook_dto');return result;
}
function canonical(v) {
  if(v===null||typeof v!=='object')return JSON.stringify(v);
  return Array.isArray(v)?`[${v.map(canonical).join(',')}]`:`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
}
const sha=(kind,value)=>createHash('sha256').update(`k12.synthetic-notebook.${kind}/v1:${canonical(value)}`).digest('hex');
const without=(v,key)=>Object.fromEntries(Object.entries(v).filter(([k])=>k!==key));
const same=(a,b)=>canonical(a)===canonical(b);
const hash=v=>typeof v==='string'&&HASH.test(v);
const id=v=>typeof v==='string'&&ID.test(v);
const revision=v=>Number.isSafeInteger(v)&&v>=0&&v<Number.MAX_SAFE_INTEGER;
function unicodeSupported(value) {
  if(value.includes('\0'))return false;
  for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const next=value.charCodeAt(++i);if(!(next>=0xdc00&&next<=0xdfff))return false;}
    else if(c>=0xdc00&&c<=0xdfff)return false;}
  return true;
}
function bodyProfile(body) {
  if(!unicodeSupported(body.text)||[...body.notes,...body.concerns].some(n=>!unicodeSupported(n.text)))return false;
  // Inspect the decimal representation, not x*10000 (which would wrongly
  // reject 0.0003 due to binary floating-point multiplication). Never round.
  return body.strokes.every(s=>s.points.every(p=>[p.x,p.y].every(v=>/^(?:0(?:\.\d{1,4})?|1)$/u.test(String(v)))));
}
const flags=()=>({automaticRetry:false,syntheticOnly:true,authentication:'not_implemented',productionReady:false});
function failure(code,{writeAttempted=false,readState='not_attempted'}={}) {
  const unknown=writeAttempted||readState==='unknown';
  return Object.freeze({valid:false,error:Object.freeze({code}),commitState:writeAttempted?'unknown':'not_attempted',readState,
    persisted:unknown?null:false,persistenceConfirmed:false,...flags()});
}
function executorError(error) {
  let code;
  if(error!==null&&typeof error==='object'&&!isProxy(error)){const field=Object.getOwnPropertyDescriptor(error,'code');if(field&&Object.hasOwn(field,'value'))code=field.value;}
  return new Map([['42501','notebook_scope_denied'],['40001','notebook_revision_conflict'],['23505','notebook_idempotency_conflict'],['22023','notebook_integrity_denied']]).get(code)??'notebook_execution_failed';
}

/** Fixed source + fixed executor belong to a trusted synthetic server root.
 * Do not construct this factory from a learner request or serialized UI state.
 */
export function createSyntheticNotebookAdapter(options) {
  if(arguments.length!==1||!closed(options,['sourceFixture','execute']))throw new Error('invalid_synthetic_notebook_adapter_options');
  const fields=Object.getOwnPropertyDescriptors(options),execute=fields.execute.value;
  if(typeof execute!=='function'||isProxy(execute))throw new Error('invalid_synthetic_notebook_adapter_options');
  let source,preparer,bodyPreparer,scopeSha256,governanceBinding;
  try {
    source=snapshot(fields.sourceFixture.value);preparer=createSyntheticNotebookSyncPreparer(source);
    bodyPreparer=createSyntheticNotebookSyncPreparer({...source,currentRevision:{revision:0,bodySha256:null},receipts:[]});
    const probe=bodyPreparer.prepare({contractVersion:'1.0.0',mutationId:'adapter-body-validation',idempotencyKey:'adapter-body-validation',expectedRevision:0,
      body:{text:'',strokes:[],bookmarks:{questions:[],topics:[]},notes:[],concerns:[]}});
    if(!probe.valid)throw new Error('invalid_source');scopeSha256=probe.intent.scopeSha256;governanceBinding=probe.intent.governanceBinding;
  }catch{throw new Error('invalid_synthetic_notebook_adapter_options');}
  const commands=new WeakMap();let knownReceipts=[...source.receipts];
  function receiptValid(r) {
    return closed(r,RECEIPT_FIELDS)&&['receiptId','mutationId','idempotencyKey'].every(k=>id(r[k]))
      &&['receiptSha256','scopeSha256','requestSha256','bodySha256','policySha256','catalogSha256'].every(k=>hash(r[k]))
      &&revision(r.expectedRevision)&&revision(r.resultingRevision)&&r.resultingRevision===r.expectedRevision+1
      &&r.scopeSha256===scopeSha256&&r.policySha256===source.policy.policySha256&&r.catalogSha256===source.catalog.catalogSha256
      &&r.receiptId===`synthetic-receipt-${r.requestSha256.slice(0,32)}`&&sha('receipt',without(r,'receiptSha256'))===r.receiptSha256;
  }
  if(!knownReceipts.every(receiptValid))throw new Error('invalid_synthetic_notebook_adapter_options');
  function knownReceiptBound(r) {
    const matches=knownReceipts.filter(old=>['receiptId','mutationId','idempotencyKey','resultingRevision'].some(k=>old[k]===r[k]));
    return matches.every(old=>same(old,r));
  }
  const maximumKnownRevision=()=>Math.max(source.currentRevision.revision,...knownReceipts.map(r=>r.resultingRevision));
  function rememberReceipt(r) {
    if(!knownReceiptBound(r))throw new Error('notebook_response_invalid');
    if(knownReceipts.some(old=>old.receiptSha256===r.receiptSha256))return;
    if(knownReceipts.length>=MAX_RECEIPTS)throw new Error('notebook_history_capacity_exceeded');
    knownReceipts=[...knownReceipts,r];
  }
  function prepare(request) {
    if(arguments.length!==1)return failure('invalid_notebook_adapter_arguments');
    const result=preparer.prepare(request);if(!result.valid)return failure(result.error.code);
    if(!bodyProfile(result.intent.body)||!revision(result.intent.nextRevision))return failure('notebook_postgres_profile_unsupported');
    // A confirmed write pins its idempotency body even before a separate
    // current read advances the fixed preparer. Receipt knowledge is not head
    // authority: exact duplicates may replay, changed aliases fail locally.
    const byKey=knownReceipts.find(r=>r.idempotencyKey===result.intent.idempotencyKey);
    const byMutation=knownReceipts.find(r=>r.mutationId===result.intent.mutationId);
    const known=byKey??byMutation;
    if(known&&(!byKey||!byMutation||byKey!==byMutation
      ||['mutationId','idempotencyKey','requestSha256','bodySha256','expectedRevision'].some(k=>known[k]!==result.intent[k])))return failure('notebook_idempotency_conflict');
    if(!known&&result.decision==='prepare_replace'&&knownReceipts.length>=MAX_RECEIPTS)return failure('notebook_history_capacity_exceeded');
    const command=Object.freeze({schemaVersion:'synthetic-notebook-adapter-command/v1',decision:result.decision,intent:result.intent});
    commands.set(command,result.intent);
    return Object.freeze({valid:true,decision:result.decision,command,commitState:'not_attempted',persisted:false,persistenceConfirmed:false,...flags()});
  }
  function writeBound(result,intent) {
    if(!closed(result,['outcome','receipt','head','syntheticOnly','productionReady'])||!['accepted','idempotent_replay'].includes(result.outcome)
      ||result.syntheticOnly!==true||result.productionReady!==false||!receiptValid(result.receipt)||!knownReceiptBound(result.receipt)
      ||!closed(result.head,['revision','bodySha256'])||!revision(result.head.revision)||!hash(result.head.bodySha256)
      ||result.head.revision<Math.max(maximumKnownRevision(),intent.nextRevision))return false;
    const r=result.receipt;
    if(['mutationId','idempotencyKey','scopeSha256','requestSha256','bodySha256','expectedRevision'].some(k=>r[k]!==intent[k])
      ||r.resultingRevision!==intent.nextRevision)return false;
    if(intent.historicalReceipt&&(result.outcome!=='idempotent_replay'||intent.historicalReceipt.receiptId!==r.receiptId||intent.historicalReceipt.receiptSha256!==r.receiptSha256))return false;
    if(result.outcome==='accepted'&&(result.head.revision!==r.resultingRevision||result.head.bodySha256!==r.bodySha256))return false;
    if(result.head.revision===r.resultingRevision&&result.head.bodySha256!==r.bodySha256)return false;
    const knownHead=knownReceipts.find(old=>old.resultingRevision===result.head.revision);
    if(knownHead&&knownHead.bodySha256!==result.head.bodySha256)return false;
    return result.head.revision!==source.currentRevision.revision||result.head.bodySha256===source.currentRevision.bodySha256;
  }
  function readBound(result,requestedRevision) {
    if(!closed(result,READ_FIELDS)||result.syntheticOnly!==true||result.productionReady!==false||!same(result.scope,source.scope)
      ||result.scopeSha256!==scopeSha256||!same(result.governanceBinding,governanceBinding)||!revision(result.revision)
      ||(requestedRevision!==null&&result.revision!==requestedRevision))return false;
    if(requestedRevision===null&&(result.revision<maximumKnownRevision()
      ||(result.revision===source.currentRevision.revision&&result.bodySha256!==source.currentRevision.bodySha256)))return false;
    if(result.revision===0)return requestedRevision===null&&result.body===null&&result.bodySha256===null&&result.receipt===null;
    if(!receiptValid(result.receipt)||!knownReceiptBound(result.receipt)||result.receipt.resultingRevision!==result.revision
      ||result.receipt.bodySha256!==result.bodySha256)return false;
    const validation=bodyPreparer.prepare({contractVersion:'1.0.0',mutationId:'adapter-body-validation',idempotencyKey:'adapter-body-validation',expectedRevision:0,body:result.body});
    if(!validation.valid||!bodyProfile(validation.intent.body)||validation.intent.bodySha256!==result.bodySha256)return false;
    const r=result.receipt,requestHash=sha('request',{scopeSha256,contractVersion:'1.0.0',mutationId:r.mutationId,idempotencyKey:r.idempotencyKey,expectedRevision:r.expectedRevision,body:result.body});
    return r.requestSha256===requestHash;
  }
  async function perform(kind,commandOrRevision) {
    const write=kind==='commit';let intent,query;
    if(write){if(commandOrRevision===null||typeof commandOrRevision!=='object'||isProxy(commandOrRevision)||!commands.has(commandOrRevision))return failure('untrusted_notebook_command');
      intent=commands.get(commandOrRevision);query={text:SYNTHETIC_NOTEBOOK_ADAPTER_SQL.commit,values:[JSON.stringify(intent)]};}
    else query={text:SYNTHETIC_NOTEBOOK_ADAPTER_SQL[kind],values:kind==='current'?[scopeSha256]:[scopeSha256,String(commandOrRevision)]};
    query=Object.freeze({text:query.text,values:Object.freeze(query.values)});let raw,response,result;
    try {raw=execute(query);if(!isProxy(raw)&&isPromise(raw)) {
      // Await consults a native Promise's constructor. Reject subclasses and
      // all own string/getter fields first; inert symbols accommodate Node's
      // async-hook IDs, which are not application authorization or content.
      const promiseFields=Object.getOwnPropertyDescriptors(raw),promiseKeys=Reflect.ownKeys(promiseFields);
      if(Object.getPrototypeOf(raw)!==Promise.prototype||promiseKeys.length>16
        ||promiseKeys.some(k=>typeof k!=='symbol'||!Object.hasOwn(promiseFields[k],'value')))return failure('notebook_response_invalid',
        {writeAttempted:write,readState:write?'not_attempted':'unknown'});
      raw=await raw;
    }}
    catch(error){return failure(executorError(error),{writeAttempted:write,readState:write?'not_attempted':'unknown'});}
    try {response=snapshot(raw);
      if(!closed(response,['rowCount','rows'])||response.rowCount!==1||!Array.isArray(response.rows)||response.rows.length!==1
        ||!closed(response.rows[0],['notebook_result']))throw new Error('notebook_response_invalid');
      result=response.rows[0].notebook_result;
      if(write?!writeBound(result,intent):!readBound(result,kind==='historical'?commandOrRevision:null))throw new Error('notebook_response_invalid');
      if(write)rememberReceipt(result.receipt);
      else if(kind==='current') {
        const candidateReceipt=result.receipt,extra=candidateReceipt&&!knownReceipts.some(r=>r.receiptSha256===candidateReceipt.receiptSha256)?[candidateReceipt]:[];
        if(knownReceipts.length+extra.length>MAX_RECEIPTS)throw new Error('notebook_history_capacity_exceeded');
        const nextSource=snapshot({...source,currentRevision:{revision:result.revision,bodySha256:result.bodySha256},receipts:[...knownReceipts,...extra]});
        const nextPreparer=createSyntheticNotebookSyncPreparer(nextSource);const advanced=result.revision>source.currentRevision.revision;
        source=nextSource;preparer=nextPreparer;knownReceipts=[...nextSource.receipts];
        return Object.freeze({valid:true,outcome:'current_read',...result,readState:'confirmed',commitState:'not_attempted',persisted:true,
          persistenceConfirmed:true,currentHeadVerified:true,sourceAdvanced:advanced,...flags()});
      }
    }catch(error){return failure(error?.message==='notebook_history_capacity_exceeded'?'notebook_history_capacity_exceeded':'notebook_response_invalid',
      {writeAttempted:write,readState:write?'not_attempted':'unknown'});}
    return Object.freeze({valid:true,...(write?result:{outcome:'historical_read',...result}),readState:write?'not_attempted':'confirmed',
      commitState:write?'confirmed':'not_attempted',persisted:true,persistenceConfirmed:true,currentHeadVerified:false,sourceAdvanced:false,...flags()});
  }
  return Object.freeze({prepare,
    commit(command){return arguments.length===1?perform('commit',command):Promise.resolve(failure('invalid_notebook_adapter_arguments'));},
    readCurrent(){return arguments.length===0?perform('current'):Promise.resolve(failure('invalid_notebook_adapter_arguments'));},
    readRevision(value){return arguments.length===1&&revision(value)&&value>0?perform('historical',value):Promise.resolve(failure('invalid_notebook_adapter_arguments'));},
  });
}
