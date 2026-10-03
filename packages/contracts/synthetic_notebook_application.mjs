/** Local synthetic server application boundary, not HTTP authentication,
 * notebook UI, a DB driver, retention processing or learning analytics.
 * Construct only in a trusted fixed-source/fixed-executor composition root.
 */
import { createSyntheticNotebookAdapter } from './synthetic_notebook_adapter.mjs';

const MAX_DTO_BYTES=524288;
const flags=()=>({automaticRetry:false,automaticRead:false,syntheticOnly:true,
  authentication:'not_implemented',learnerReady:false,productionReady:false});
function bounded(value) {
  if(Buffer.byteLength(JSON.stringify(value),'utf8')>MAX_DTO_BYTES)throw new Error('synthetic_notebook_application_output_budget_exceeded');
  return Object.freeze(value);
}
function operationalCounts(body) {
  return Object.freeze({textUtf16Units:body?.text.length??0,strokeCount:body?.strokes.length??0,
    pointCount:body?.strokes.reduce((sum,stroke)=>sum+stroke.points.length,0)??0,
    questionBookmarkCount:body?.bookmarks.questions.length??0,topicBookmarkCount:body?.bookmarks.topics.length??0,
    noteCount:body?.notes.length??0,concernCount:body?.concerns.length??0,
    bodyJsonUtf8Bytes:body===null?0:Buffer.byteLength(JSON.stringify(body),'utf8')});
}
function projectionFromRead(read) {
  // Only the real adapter's inert, hash-bound validated read result enters
  // this projection. A submitted request or write receipt never does.
  return Object.freeze({scope:read.scope,scopeSha256:read.scopeSha256,revision:read.revision,
    body:read.body,bodySha256:read.bodySha256,receipt:read.receipt,governanceBinding:read.governanceBinding});
}
function failure(code,operation,decision,{attempted=false}={}) {
  return Object.freeze({valid:false,operation,decision,preparationDecision:null,
    commitState:attempted&&operation==='save'?'unknown':'not_attempted',
    readState:attempted&&operation==='read_current'?'unknown':'not_attempted',persisted:attempted?null:false,
    persistenceConfirmed:false,outcome:null,receipt:null,head:null,error:Object.freeze({code})});
}

export function createSyntheticNotebookApplication(options) {
  if(arguments.length!==1)throw new Error('invalid_synthetic_notebook_application_options');
  let adapter;
  try {adapter=createSyntheticNotebookAdapter(options);}catch{throw new Error('invalid_synthetic_notebook_application_options');}
  let controller,busy=false,state='not_read',freshness='not_read',projection=null,counts=null,lastOperation=null;
  function view() {
    return bounded({schemaVersion:'synthetic-notebook-application-view/v1',state,busy,
      projectionFreshness:freshness,readProjection:projection,usageCounts:counts,lastOperation,
      currentHeadVerified:freshness==='verified_current',readProvenance:projection?'validated_fixed_executor_response':'none',
      executorProvenance:'trusted_server_hook_unverified',realDatabaseVerified:false,
      purpose:'student_notebook',classification:'sensitive_student_notebook',
      usageCountMeaning:'operational_notebook_counts_not_learning_evidence',completeHistory:false,learningAnalyticsMapped:false,...flags()});
  }
  function output(result,exposeView=true) {
    return bounded({schemaVersion:'synthetic-notebook-application-result/v1',...result,view:exposeView?view():null,...flags()});
  }
  function facts(result) {
    return Object.freeze({operation:result.operation,decision:result.decision,preparationDecision:result.preparationDecision,
      commitState:result.commitState,readState:result.readState,persisted:result.persisted,
      persistenceConfirmed:result.persistenceConfirmed,outcome:result.outcome,error:result.error});
  }
  function adapterResult(raw,operation,preparationDecision=null) {
    const decision=operation==='save'?(raw.valid?'save_confirmed':raw.commitState==='unknown'?'save_unknown':'request_rejected')
      :raw.valid?'current_read_confirmed':'read_unknown';
    return Object.freeze({valid:raw.valid,operation,decision,preparationDecision,commitState:raw.commitState,readState:raw.readState,
      persisted:raw.persisted,persistenceConfirmed:raw.persistenceConfirmed,outcome:raw.outcome??null,
      receipt:operation==='save'&&raw.valid?raw.receipt:null,head:operation==='save'&&raw.valid?raw.head:null,error:raw.error??null});
  }
  function guard(receiver,length,wanted,operation) {
    if(receiver!==controller)return output(failure('untrusted_synthetic_notebook_application',operation,'request_rejected'),false);
    if(length!==wanted)return output(failure('invalid_synthetic_notebook_application_arguments',operation,'request_rejected'));
    if(busy)return output(failure('synthetic_notebook_application_busy',operation,'application_busy'));
    return null;
  }
  async function readCurrent() {
    const denied=guard(this,arguments.length,0,'read_current');if(denied)return denied;
    busy=true;let result;
    try {
      const read=await adapter.readCurrent();result=adapterResult(read,'read_current');
      if(read.valid){const nextProjection=projectionFromRead(read),nextCounts=operationalCounts(read.body);
        // Validate output size before replacing the application projection.
        bounded({projection:nextProjection,counts:nextCounts});projection=nextProjection;counts=nextCounts;state='verified_current';freshness='verified_current';}
      else {state='read_unknown';freshness='unknown_after_read_failure';}
    }catch{result=failure('synthetic_notebook_application_failed','read_current','read_unknown',{attempted:true});state='read_unknown';freshness='unknown_after_read_failure';}
    finally{busy=false;}
    lastOperation=facts(result);return output(result);
  }
  async function save(request) {
    const denied=guard(this,arguments.length,1,'save');if(denied)return denied;
    busy=true;let result,attempted=false;
    try {
      const prepared=adapter.prepare(request);
      if(!prepared.valid)result=adapterResult(prepared,'save');
      else {
        attempted=true;
        if(projection){state='read_stale_after_write';freshness='stale_after_write';}
        // Never replace the projection from request/receipt, advance the read
        // head here, or call readCurrent as a convenience after a write.
        result=adapterResult(await adapter.commit(prepared.command),'save',prepared.decision);
      }
    }catch{result=failure('synthetic_notebook_application_failed','save',attempted?'save_unknown':'request_rejected',{attempted});}
    finally{busy=false;}
    lastOperation=facts(result);return output(result);
  }
  controller=Object.freeze({current(){
    if(this!==controller)throw new Error('untrusted_synthetic_notebook_application');
    if(arguments.length!==0)throw new Error('invalid_synthetic_notebook_application_arguments');return view();
  },readCurrent,save});
  return controller;
}
