/** Isolated synthetic desk. A trusted test request hook is code, not an API
 * configuration or authorization capability. Only primitive wire JSON enters
 * validation; no student identity, endpoint, storage or auto-recovery options. */
const MAX_WIRE=1048576,MAX_JSON=524288;
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/u,HASH=/^[a-f0-9]{64}$/u;
const PALETTE=['#1c3532','#a44b35','#2f6377','#8b5e32','#6f527a'],WIDTHS=[2,4,6,10];
const SCOPE={schoolId:'demo-school-a',learnerId:'synthetic-student-a',grade:6,schoolYear:'2026-2027',notebookId:'synthetic-notebook-a'};
const SCOPE_HASH='0a92002eb20bf7b25d71517674560c3388a01a425b3b3b893f74a54d7f584a82';
const LIMITS={maxBodyBytes:131072,textMaxUnits:4000,strokeCount:64,pointsPerStroke:512,bookmarkCount:100,noteCount:100,concernCount:100};
const GOVERNANCE={sourceKind:'synthetic_fixture',purpose:'student_notebook',classification:'sensitive_student_notebook',
  retentionClass:'student-notebook-lifecycle',ownerId:'synthetic-owner',stewardId:'synthetic-steward',policyId:'synthetic-notebook-policy',
  policySha256:'d707810971e5a0b1571e45ac8a5489eb86a76e6f9fad8764a15285e86bdf9e95',catalogId:'synthetic-notebook-catalog',catalogRevisionId:'catalogrev-001',
  catalogSha256:'21b9481bf0a37e1a740d13368e3ea6dcf146aceaba1deca5aa0160fda70849e6',assetId:'synthetic-notebook-asset',assetRevisionId:'assetrev-001',
  definitionSha256:'483e2822f17fded4f6462af0017a3c8a35b3aefe7b2e7ae7c9dd98b70745d7d1',
  targetCatalogSha256:'ed0d4ab07fe9d417ba9a309f1ddeef895a616ef2ef38ab3eebbbfcc24288703d',catalogState:'declared_synthetic_reference',limits:LIMITS};
const FLAGS={automaticRetry:false,automaticRead:false,syntheticOnly:true,authentication:'not_implemented',learnerReady:false,productionReady:false};
const FACTS=['operation','decision','preparationDecision','commitState','readState','persisted','persistenceConfirmed','outcome','error'];
const RECEIPT=['receiptId','receiptSha256','mutationId','idempotencyKey','scopeSha256','requestSha256','bodySha256','expectedRevision','resultingRevision','policySha256','catalogSha256'];
const VIEW=['schemaVersion','state','busy','projectionFreshness','readProjection','usageCounts','lastOperation','currentHeadVerified','readProvenance','executorProvenance','realDatabaseVerified',
  'purpose','classification','usageCountMeaning','completeHistory','learningAnalyticsMapped',...Object.keys(FLAGS)];
const RESULT=['schemaVersion','valid',...FACTS,'receipt','head','view',...Object.keys(FLAGS)];
const encoder=new TextEncoder(),bytes=s=>encoder.encode(s).byteLength;
const blank=()=>({text:'',strokes:[],bookmarks:{questions:[],topics:[]},notes:[],concerns:[]});
function require(value){if(!value)throw new Error('response_invalid');}
function freeze(value){if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;}
function canonical(value){return value===null||typeof value!=='object'?JSON.stringify(value):Array.isArray(value)?`[${value.map(canonical).join(',')}]`:`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;}
const same=(a,b)=>canonical(a)===canonical(b);
const without=(v,key)=>Object.fromEntries(Object.entries(v).filter(([k])=>k!==key));
const closed=(v,keys)=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&Object.keys(v).every(k=>keys.includes(k));
const revision=v=>Number.isSafeInteger(v)&&v>=0&&v<Number.MAX_SAFE_INTEGER;
const id=v=>typeof v==='string'&&ID.test(v);
function unicode(s){if(typeof s!=='string'||s.includes('\0'))return false;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const n=s.charCodeAt(++i);if(!(n>=0xdc00&&n<=0xdfff))return false;}else if(c>=0xdc00&&c<=0xdfff)return false;}return true;}
async function sha(kind,value){const digest=await globalThis.crypto.subtle.digest('SHA-256',encoder.encode(`k12.synthetic-notebook.${kind}/v1:${canonical(value)}`));return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');}

// Parse primitive text only, before inspecting fields. Reject duplicates even
// when JSON escapes or NFC spellings differ; values are never normalized.
function parse(text,max=MAX_JSON){
  require(typeof text==='string'&&bytes(text)<=max&&text.charCodeAt(0)!==0xfeff);
  let offset=0,nodes=0;const ws=()=>{while(/[\x20\x09\x0a\x0d]/u.test(text[offset]??'x'))offset++;};
  function string(){const start=offset++;let escape=false;for(;offset<text.length;offset++){const c=text[offset];if(!escape&&c==='"'){offset++;return JSON.parse(text.slice(start,offset));}if(!escape&&c==='\\')escape=true;else escape=false;}throw new Error('response_invalid');}
  function value(depth){require(++nodes<=100000&&depth<=14);ws();const c=text[offset];
    if(c==='"')return string();
    if(c==='{'){offset++;ws();const out={},keys=new Set();if(text[offset]==='}'){offset++;return out;}for(;;){ws();require(text[offset]==='"');const key=string(),normalized=key.normalize('NFC');require(!keys.has(normalized)&&keys.size<32);keys.add(normalized);ws();require(text[offset++]===':');Object.defineProperty(out,key,{value:value(depth+1),enumerable:true,writable:true,configurable:true});ws();const next=text[offset++];if(next==='}')return out;require(next===',');}}
    if(c==='['){offset++;ws();const out=[];if(text[offset]===']'){offset++;return out;}for(;;){require(out.length<512);out.push(value(depth+1));ws();const next=text[offset++];if(next===']')return out;require(next===',');}}
    const literal=/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u.exec(text.slice(offset));require(literal);offset+=literal[0].length;const out=JSON.parse(literal[0]);require(typeof out!=='number'||Number.isFinite(out));return out===0?0:out;
  }
  const out=value(0);ws();require(offset===text.length);return out;
}
function bodyValid(body){
  require(closed(body,['text','strokes','bookmarks','notes','concerns'])&&unicode(body.text)&&body.text.length<=LIMITS.textMaxUnits
    &&Array.isArray(body.strokes)&&body.strokes.length<=64&&closed(body.bookmarks,['questions','topics'])&&Array.isArray(body.notes)&&body.notes.length<=100&&Array.isArray(body.concerns)&&body.concerns.length<=100);
  const seen=new Set();for(const stroke of body.strokes){require(closed(stroke,['id','color','width','points'])&&id(stroke.id)&&!seen.has(stroke.id)&&PALETTE.includes(stroke.color)&&WIDTHS.includes(stroke.width)&&Array.isArray(stroke.points)&&stroke.points.length>=1&&stroke.points.length<=512);seen.add(stroke.id);
    for(const p of stroke.points)require(closed(p,['x','y'])&&[p.x,p.y].every(n=>typeof n==='number'&&Number.isFinite(n)&&/^(?:0(?:\.\d{1,4})?|1)$/u.test(String(n))));}
  let bookmarks=0;for(const [key,allowed] of [['questions','question-a-001'],['topics','topic-a-001']]){const list=body.bookmarks[key];require(Array.isArray(list)&&list.length<=1&&list.every(v=>v===allowed));bookmarks+=list.length;}require(bookmarks<=100);
  for(const key of ['notes','concerns']){const ids=new Set();for(const note of body[key]){require(closed(note,['id','text','grade','format'])&&id(note.id)&&!ids.has(note.id)&&note.grade===6&&note.format==='plain_text'&&unicode(note.text)&&note.text.trim().length>0&&note.text.length<=4000);ids.add(note.id);}}
  require(bytes(canonical(body))<=LIMITS.maxBodyBytes);return body;
}
function counts(body){return {textUtf16Units:body?.text.length??0,strokeCount:body?.strokes.length??0,pointCount:body?.strokes.reduce((n,s)=>n+s.points.length,0)??0,
  questionBookmarkCount:body?.bookmarks.questions.length??0,topicBookmarkCount:body?.bookmarks.topics.length??0,noteCount:body?.notes.length??0,concernCount:body?.concerns.length??0,bodyJsonUtf8Bytes:body===null?0:bytes(JSON.stringify(body))};}
function flags(v){require(Object.entries(FLAGS).every(([k,w])=>v[k]===w));}
function facts(f){require(closed(f,FACTS)&&['save','read_current'].includes(f.operation)&&['save_confirmed','save_unknown','current_read_confirmed','read_unknown','request_rejected','application_busy'].includes(f.decision)
  &&[null,'prepare_replace','prepare_exact_replay'].includes(f.preparationDecision)&&['confirmed','unknown','not_attempted'].includes(f.commitState)&&['confirmed','unknown','not_attempted'].includes(f.readState)
  &&[true,false,null].includes(f.persisted)&&typeof f.persistenceConfirmed==='boolean'&&[null,'accepted','idempotent_replay','current_read'].includes(f.outcome)
  &&(f.error===null||(closed(f.error,['code'])&&id(f.error.code))));}
async function receiptValid(r){require(closed(r,RECEIPT)&&['receiptId','mutationId','idempotencyKey'].every(k=>id(r[k]))&&['receiptSha256','scopeSha256','requestSha256','bodySha256','policySha256','catalogSha256'].every(k=>typeof r[k]==='string'&&HASH.test(r[k]))
  &&revision(r.expectedRevision)&&revision(r.resultingRevision)&&r.resultingRevision===r.expectedRevision+1&&r.scopeSha256===SCOPE_HASH&&r.policySha256===GOVERNANCE.policySha256&&r.catalogSha256===GOVERNANCE.catalogSha256
  &&r.receiptId===`synthetic-receipt-${r.requestSha256.slice(0,32)}`&&await sha('receipt',without(r,'receiptSha256'))===r.receiptSha256);}
async function projectionValid(p){require(closed(p,['scope','scopeSha256','revision','body','bodySha256','receipt','governanceBinding'])&&same(p.scope,SCOPE)&&p.scopeSha256===SCOPE_HASH&&revision(p.revision)&&same(p.governanceBinding,GOVERNANCE));
  if(p.revision===0){require(p.body===null&&p.bodySha256===null&&p.receipt===null);return;}
  bodyValid(p.body);await receiptValid(p.receipt);require(p.bodySha256===await sha('body',p.body)&&p.receipt.bodySha256===p.bodySha256&&p.receipt.resultingRevision===p.revision
    &&p.receipt.requestSha256===await sha('request',{scopeSha256:SCOPE_HASH,contractVersion:'1.0.0',mutationId:p.receipt.mutationId,idempotencyKey:p.receipt.idempotencyKey,expectedRevision:p.receipt.expectedRevision,body:p.body}));
}
async function viewValid(v){require(closed(v,VIEW)&&v.schemaVersion==='synthetic-notebook-application-view/v1');flags(v);
  const states={not_read:'not_read',verified_current:'verified_current',read_stale_after_write:'stale_after_write',read_unknown:'unknown_after_read_failure'};
  require(Object.hasOwn(states,v.state)&&v.projectionFreshness===states[v.state]&&typeof v.busy==='boolean'&&v.currentHeadVerified===(v.state==='verified_current')
    &&v.readProvenance===(v.readProjection?'validated_fixed_executor_response':'none')&&v.executorProvenance==='trusted_server_hook_unverified'&&v.realDatabaseVerified===false&&v.purpose==='student_notebook'
    &&v.classification==='sensitive_student_notebook'&&v.usageCountMeaning==='operational_notebook_counts_not_learning_evidence'&&v.completeHistory===false&&v.learningAnalyticsMapped===false);
  if(v.readProjection===null)require(v.usageCounts===null&&v.state!=='verified_current');else {await projectionValid(v.readProjection);require(same(v.usageCounts,counts(v.readProjection.body)));}
  if(v.lastOperation!==null)facts(v.lastOperation);
}
async function resultValid(out,operation,status){require(closed(out,RESULT)&&out.schemaVersion==='synthetic-notebook-application-result/v1'&&typeof out.valid==='boolean'&&out.operation===operation);flags(out);facts(Object.fromEntries(FACTS.map(k=>[k,out[k]])));await viewValid(out.view);require(!out.view.busy&&same(out.view.lastOperation,Object.fromEntries(FACTS.map(k=>[k,out[k]]))));
  if(out.valid){require(status===200&&out.persisted===true&&out.persistenceConfirmed===true&&out.error===null);
    if(operation==='read_current')require(out.decision==='current_read_confirmed'&&out.preparationDecision===null&&out.outcome==='current_read'&&out.readState==='confirmed'&&out.commitState==='not_attempted'&&out.receipt===null&&out.head===null&&out.view.state==='verified_current');
    else {require(out.decision==='save_confirmed'&&['prepare_replace','prepare_exact_replay'].includes(out.preparationDecision)&&out.commitState==='confirmed'&&out.readState==='not_attempted'&&['accepted','idempotent_replay'].includes(out.outcome)&&closed(out.head,['revision','bodySha256'])&&revision(out.head.revision)&&typeof out.head.bodySha256==='string'&&HASH.test(out.head.bodySha256));await receiptValid(out.receipt);}
  }else {require([400,409,503].includes(status)&&out.receipt===null&&out.head===null&&out.error!==null&&out.persistenceConfirmed===false);
    if(status===503)require(out.persisted===null&&(operation==='save'?out.commitState==='unknown'&&out.decision==='save_unknown':out.readState==='unknown'&&out.decision==='read_unknown'));
    else require(out.persisted===false&&out.commitState==='not_attempted'&&out.readState==='not_attempted'&&['request_rejected','application_busy'].includes(out.decision));}
}

// Promise.prototype.then performs a native brand check without reading a
// caller object's .then/getters. The hook's execution and native promises are
// trusted code; it is not a sandbox for arbitrary callback implementations.
function hookWire(request,path,options){return new Promise((resolve,reject)=>{let raw;try{raw=request(path,options);}catch{reject(new Error('transport_failed'));return;}
  const accept=v=>{if(typeof v==='string')resolve(v);else reject(new Error('response_invalid'));};
  if(typeof raw==='string'){accept(raw);return;}try{Promise.prototype.then.call(raw,accept,()=>reject(new Error('transport_failed')));}catch{reject(new Error('response_invalid'));}});}
async function browserRequest(path,options){const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),5000);try{
  const response=await fetch(path,{...options,signal:abort.signal});require(/^application\/json(?:\s*;.*)?$/iu.test(response.headers.get('content-type')??''));let text;
  if(response.body){const reader=response.body.getReader(),decoder=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});let length=0;text='';try{for(;;){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;require(length<=MAX_JSON);text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}catch(e){await reader.cancel().catch(()=>{});throw e;}}
  else {text=await response.text();require(bytes(text)<=MAX_JSON);}return JSON.stringify({status:response.status,body:text});
}finally{clearTimeout(timer);}}

export function profileSyntheticNotebookPointer(x,y){if(arguments.length!==2||![x,y].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1))throw new Error('invalid_pointer');return Object.freeze({x:Number(x.toFixed(4)),y:Number(y.toFixed(4))});}

export function createSyntheticNotebookDeskClient(trustedRequest){
  if(arguments.length>1||(arguments.length===1&&typeof trustedRequest!=='function'))throw new Error('invalid_desk_request');
  const request=trustedRequest??browserRequest;let controller,busy=false,state='not_read',draft=freeze(blank()),verifiedRead=null,receipt=null,persisted=null,errorCode=null,fresh=false,initialized=false,highestRevision=0;
  const status=()=>freeze({schemaVersion:'synthetic-notebook-desk/v1',state,busy,draft,verifiedRead,receipt,persisted,errorCode,canSave:fresh&&!busy,
    canLoadRead:verifiedRead!==null&&!busy,draftProfile:'postgres_utf8_four_decimal_v1',realDatabaseVerified:false,learningAnalyticsMapped:false,...FLAGS});
  function guard(receiver,args,n){if(receiver!==controller)throw new Error('untrusted_desk');if(args!==n)throw new Error('invalid_desk_arguments');}
  function local(ok){return Object.freeze({ok,view:status()});}
  async function send(path,body){const options=freeze({method:body===null?'GET':'POST',credentials:'omit',cache:'no-store',redirect:'error',headers:body===null?{}:{'Content-Type':'application/json'},...(body===null?{}:{body})});
    const env=parse(await hookWire(request,path,options),MAX_WIRE);require(closed(env,['status','body'])&&Number.isInteger(env.status)&&env.status>=100&&env.status<=599&&typeof env.body==='string');return {status:env.status,data:parse(env.body)};}
  async function operation(kind){if(busy)return local(false);if(kind==='save'&&!fresh)return local(false);if(kind==='initialize'&&initialized)return local(false);
    busy=true;errorCode=null;let sent=null,writeAttempted=false;
    if(kind==='save'){fresh=false;receipt=null;persisted=null;state='read_stale_after_write';}
    try {if(kind==='save'){const nonce=globalThis.crypto.randomUUID();sent={contractVersion:'1.0.0',mutationId:`desk-${nonce}`,idempotencyKey:`desk-idem-${nonce}`,expectedRevision:verifiedRead.revision,body:draft};writeAttempted=true;}
      const wire=await send(kind==='initialize'?'/api/notebook/current':kind==='read'?'/api/notebook/read':'/api/notebook/save',kind==='initialize'?null:kind==='read'?'{}':JSON.stringify(sent));
      if(kind==='initialize'){require(wire.status===200);await viewValid(wire.data);initialized=true;}
      else {const op=kind==='read'?'read_current':'save',out=wire.data;await resultValid(out,op,wire.status);
        if(kind==='read'&&out.valid){require(out.view.readProjection.revision>=highestRevision);verifiedRead=freeze(out.view.readProjection);highestRevision=verifiedRead.revision;state='verified_current';fresh=true;persisted=true;receipt=null;}
        else if(kind==='save'&&out.valid){const r=out.receipt;require(same(out.view.readProjection,verifiedRead)&&out.view.state==='read_stale_after_write'
          &&r.mutationId===sent.mutationId&&r.idempotencyKey===sent.idempotencyKey&&r.expectedRevision===sent.expectedRevision&&r.bodySha256===await sha('body',sent.body)
          &&r.requestSha256===await sha('request',{scopeSha256:SCOPE_HASH,...sent})&&out.head.revision>=r.resultingRevision&&out.head.revision>=highestRevision
          &&(out.head.revision!==r.resultingRevision||out.head.bodySha256===r.bodySha256)&&(out.outcome!=='accepted'||out.head.revision===r.resultingRevision));
          receipt=freeze(r);highestRevision=out.head.revision;persisted=true;state='read_stale_after_write';}
        else {fresh=false;persisted=out.persisted;state=kind==='save'?(out.persisted===null?'save_unknown':'save_conflict'):'read_unknown';errorCode=kind==='save'?'save_rejected':'read_failed';}
      }
    }catch{fresh=false;persisted=kind==='save'&&!writeAttempted?false:null;state=kind==='save'?(writeAttempted?'save_unknown':'save_conflict'):kind==='read'?'read_unknown':'not_read';errorCode='response_invalid';}
    finally{busy=false;}return local(errorCode===null);
  }
  controller=Object.freeze({current(){guard(this,arguments.length,0);return status();},
    async initialize(){guard(this,arguments.length,0);return operation('initialize');},async read(){guard(this,arguments.length,0);return operation('read');},async save(){guard(this,arguments.length,0);return operation('save');},
    replaceDraft(text){guard(this,arguments.length,1);if(busy)return local(false);try{draft=freeze(bodyValid(parse(text)));errorCode=null;return local(true);}catch{errorCode='draft_invalid';return local(false);}},
    toggleBookmark(kind,id){guard(this,arguments.length,2);if(busy)return local(false);
      const key=kind==='question'&&id==='question-a-001'?'questions':kind==='topic'&&id==='topic-a-001'?'topics':null;
      if(key===null){errorCode='draft_invalid';return local(false);}
      const selected=draft.bookmarks[key];try{draft=freeze(bodyValid({...draft,bookmarks:{...draft.bookmarks,[key]:selected.includes(id)?[]:[id]}}));
        errorCode=null;return local(true);}catch{errorCode='draft_invalid';return local(false);}},
    loadRead(){guard(this,arguments.length,0);if(busy||verifiedRead===null)return local(false);draft=verifiedRead.body??freeze(blank());errorCode=null;return local(true);},
    clearDraft(){guard(this,arguments.length,0);if(busy)return local(false);draft=freeze(blank());errorCode=null;return local(true);}});
  return controller;
}

function mount(){const get=id=>document.getElementById(id),client=createSyntheticNotebookDeskClient();let drawing=null;
  const editIds=['draft-text','new-note','new-concern','add-note','add-concern','clear-draft','pen-color','pen-width','clear-pen','bookmark-question','bookmark-topic'];
  const messages={not_read:'Henüz okunmadı. Sunucudaki kaydı görmek için Oku düğmesine basın.',verified_current:'Son açık okuma doğrulandı. Taslak ayrı tutuluyor.',
    read_stale_after_write:'Kayıt makbuzu doğrulandı; önceki okuma artık güncel değil. Yeniden Oku.',save_unknown:'Kayıt sonucu belirsiz; kaydedilmiş olabilir. Otomatik tekrar yok. Açık okuma ile kontrol edin.',
    save_conflict:'Kayıt onaylanmadı. Tekrar kaydetmeden önce açık okuma gerekir.',read_unknown:'Okuma doğrulanamadı. Önceki okuma varsa yalnız eski kanıt olarak tutulur.'};
  function list(id,items){get(id).replaceChildren(...items.map(item=>{const li=document.createElement('li');li.textContent=item.text;return li;}));}
  function bookmarks(prefix,body){for(const [key,label] of [['questions','Örnek soru'],['topics','Örnek konu']])
    list(`${prefix}-${key==='questions'?'question':'topic'}-bookmarks`,(body?.bookmarks[key]??[]).map(id=>({text:`${label} A · ${id}`})));}
  function pen(body){const canvas=get('pen-canvas'),ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);for(const s of body.strokes){ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(s.points[0].x*canvas.width,s.points[0].y*canvas.height);for(const p of s.points.slice(1))ctx.lineTo(p.x*canvas.width,p.y*canvas.height);if(s.points.length===1){ctx.arc(s.points[0].x*canvas.width,s.points[0].y*canvas.height,s.width/2,0,Math.PI*2);ctx.fill();}else ctx.stroke();}}
  function render(){const v=client.current();get('desk-status').textContent=v.busy?'İşlem sürüyor. Başka işlem başlatmayın.':messages[v.state];get('draft-error').textContent=v.errorCode==='draft_invalid'?'Taslak sınırları aşıldı veya desteklenmeyen değer var. Son geçerli taslak değiştirilmedi.':'';
    get('read-notebook').disabled=v.busy;get('save-notebook').disabled=!v.canSave;get('load-read').disabled=!v.canLoadRead;for(const id of editIds)get(id).disabled=v.busy;
    get('draft-text').value=v.draft.text;list('draft-notes',v.draft.notes);list('draft-concerns',v.draft.concerns);pen(v.draft);bookmarks('draft',v.draft);
    for(const [kind,key] of [['question','questions'],['topic','topics']]){const selected=v.draft.bookmarks[key].length===1,button=get(`bookmark-${kind}`);
      button.setAttribute('aria-pressed',String(selected));button.textContent=kind==='question'?(selected?'Soru işaretini kaldır':'Örnek soruyu işaretle'):(selected?'Konu işaretini kaldır':'Örnek konuyu işaretle');}
    get('draft-counts').textContent=`${v.draft.text.length}/4000 yazı birimi · ${v.draft.strokes.length}/64 çizgi · ${v.draft.notes.length}/100 not · ${v.draft.concerns.length}/100 soru`;
    get('read-revision').textContent=v.verifiedRead===null?'Okuma yok':`Okunan sürüm: ${v.verifiedRead.revision}${v.state==='verified_current'?' · güncel':' · güncelliği doğrulanmış değil'}`;
    get('read-text').textContent=v.verifiedRead?.body?.text??(v.verifiedRead?'Bu sürümde kayıtlı içerik yok.':'Henüz okuma yapılmadı.');list('read-notes',v.verifiedRead?.body?.notes??[]);list('read-concerns',v.verifiedRead?.body?.concerns??[]);
    bookmarks('read',v.verifiedRead?.body??null);
    get('receipt-status').textContent=v.receipt?`Yazma makbuzu: sürüm ${v.receipt.resultingRevision}. Makbuz, kayıt içeriğinin yeni okuması değildir.`:v.state==='save_unknown'?'Yazma sonucu bilinmiyor (kaydedilme durumu: belirsiz).':'Henüz doğrulanmış yazma makbuzu yok.';
  }
  async function act(type){if(drawing)return;const operation=client[type]();render();await operation;render();}
  get('read-notebook').addEventListener('click',()=>act('read'));get('save-notebook').addEventListener('click',()=>act('save'));
  get('load-read').addEventListener('click',()=>{if(drawing)return;client.loadRead();render();});get('clear-draft').addEventListener('click',()=>{if(drawing)return;client.clearDraft();render();});
  for(const [kind,id] of [['question','question-a-001'],['topic','topic-a-001']])get(`bookmark-${kind}`).addEventListener('click',()=>{
    if(drawing)return;client.toggleBookmark(kind,id);render();});
  function change(body){const result=client.replaceDraft(JSON.stringify(body));render();return result.ok;}
  get('draft-text').addEventListener('input',()=>{const v=client.current();change({...v.draft,text:get('draft-text').value});});
  for(const [type,input,button] of [['notes','new-note','add-note'],['concerns','new-concern','add-concern']])get(button).addEventListener('click',()=>{
    const v=client.current();if(v.busy||drawing)return;const text=get(input).value;const entry={id:`${type}-${globalThis.crypto.randomUUID()}`,text,grade:6,format:'plain_text'};
    if(change({...v.draft,[type]:[...v.draft[type],entry]}))get(input).value='';});
  get('clear-pen').addEventListener('click',()=>{if(drawing)return;const v=client.current();change({...v.draft,strokes:[]});});
  const canvas=get('pen-canvas');function point(event){const rect=canvas.getBoundingClientRect();if(!(rect.width>0&&rect.height>0))return null;try{return profileSyntheticNotebookPointer((event.clientX-rect.left)/rect.width,(event.clientY-rect.top)/rect.height);}catch{return null;}}
  canvas.addEventListener('pointerdown',event=>{const v=client.current();if(v.busy||drawing||v.draft.strokes.length>=64||event.button!==0)return;const p=point(event);if(!p)return;
    const color=get('pen-color').value,width=Number(get('pen-width').value);if(!PALETTE.includes(color)||!WIDTHS.includes(width))return;
    get('pen-error').textContent='';drawing={pointerId:event.pointerId,id:`pen-${globalThis.crypto.randomUUID()}`,color,width,points:[p],invalid:false};canvas.setPointerCapture(event.pointerId);pen({...v.draft,strokes:[...v.draft.strokes,drawing]});});
  canvas.addEventListener('pointermove',event=>{if(!drawing||drawing.pointerId!==event.pointerId||drawing.invalid)return;const p=point(event),body=client.current().draft;
    if(!p||drawing.points.length>=512){drawing.invalid=true;pen(body);get('pen-error').textContent='Çizgi, nokta veya alan sınırı nedeniyle bütünüyle reddedildi; kırpılmadı.';}
    else {drawing.points.push(p);pen({...body,strokes:[...body.strokes,drawing]});}});
  const finish=event=>{if(!drawing||drawing.pointerId!==event.pointerId)return;const stroke=drawing;drawing=null;canvas.releasePointerCapture(event.pointerId);if(stroke.invalid){render();get('pen-error').textContent='Çizgi, nokta veya alan sınırı nedeniyle bütünüyle reddedildi; kırpılmadı.';return;}const v=client.current();change({...v.draft,strokes:[...v.draft.strokes,{id:stroke.id,color:stroke.color,width:stroke.width,points:stroke.points}]});};
  canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',event=>{if(drawing?.pointerId===event.pointerId){drawing=null;canvas.releasePointerCapture(event.pointerId);render();}});
  render();client.initialize().then(render,render);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();}
