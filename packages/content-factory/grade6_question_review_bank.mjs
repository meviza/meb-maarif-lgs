import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6InverseFactorDraft,verifyGrade6InverseFactorDraft } from './grade6_inverse_factor_draft.mjs';
import { createGrade6PrimeProvenanceDraft,verifyGrade6PrimeProvenanceDraft } from './grade6_prime_provenance_draft.mjs';
import { createGrade6DivisibilityClassificationDraft,verifyGrade6DivisibilityClassificationDraft } from './grade6_divisibility_classification_draft.mjs';
import { createGrade6FactorEvidenceDraft,verifyGrade6FactorEvidenceDraft } from './grade6_factor_evidence_draft.mjs';
import { createGrade6CommonRelationsDraft,verifyGrade6CommonRelationsDraft } from './grade6_common_relations_draft.mjs';

// Fixed editorial inventory, not a count-driven generator or an exam builder.
const fail=()=>{throw new Error('invalid_grade6_question_bank_input');};
const canonical=v=>Array.isArray(v)?v.map(canonical):v!==null&&typeof v==='object'?
  Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
function inert(input){
  const active=new WeakSet();let nodes=0,bytes=0;
  function copy(v,depth=0){
    if(++nodes>100000||depth>24)fail();
    if(v===null||typeof v==='boolean')return v;
    if(typeof v==='number'){if(!Number.isFinite(v))fail();return v;}
    if(typeof v==='string'){bytes+=Buffer.byteLength(v);if(v.length>65536||bytes>2097152||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(v))fail();return v;}
    if(!v||typeof v!=='object'||isProxy(v)||active.has(v))fail();
    const array=Array.isArray(v),proto=Object.getPrototypeOf(v),keys=Reflect.ownKeys(v);
    if(array?proto!==Array.prototype:![Object.prototype,null].includes(proto))fail();
    if(keys.length>4097||keys.some(k=>typeof k!=='string'||k.length>256||/[\u0000-\u001f]/u.test(k)))fail();
    const descriptors=Object.getOwnPropertyDescriptors(v);
    if(keys.some(k=>!Object.hasOwn(descriptors[k],'value')||(k!=='length'||!array)&&!descriptors[k].enumerable))fail();
    for(const k of keys){bytes+=Buffer.byteLength(k);if(bytes>2097152)fail();}
    active.add(v);let out;
    if(array){const length=descriptors.length.value;
      if(length>4096||keys.length!==length+1||keys.some(k=>k!=='length'&&!/^(0|[1-9][0-9]*)$/u.test(k)))fail();
      out=Array.from({length},(_,i)=>{if(!Object.hasOwn(descriptors,String(i)))fail();return copy(descriptors[String(i)].value,depth+1);});
    }else out=Object.fromEntries(keys.sort().map(k=>[k,copy(descriptors[k].value,depth+1)]));
    active.delete(v);return out;
  }return copy(input);
}
function item(draft,verification,authorship){
  if(!verification.valid||verification.localMathChecks!=='passed')fail();
  return {source:{id:draft.id,contentSha256:draft.contentSha256},family:draft.problem.family,
    authorship,draft,verification,difficulty:draft.difficulty??{level:null,basis:'unassigned',calibration:null}};
}
export function createGrade6QuestionReviewBank(input){
  if(arguments.length!==1)throw new Error('invalid_grade6_question_bank_arguments');
  try{
    const data=inert(input);
    if(!data||Array.isArray(data)||typeof data!=='object'||Object.keys(data).length!==2
      ||!Object.hasOwn(data,'referencePlannerInput')||!Object.hasOwn(data,'commonSourceBindingInput'))fail();
    const p=data.referencePlannerInput,c=data.commonSourceBindingInput;
    const inverse=createGrade6InverseFactorDraft(p),prime=createGrade6PrimeProvenanceDraft(p),
      classification=createGrade6DivisibilityClassificationDraft(p),factor=createGrade6FactorEvidenceDraft(p),common=createGrade6CommonRelationsDraft(c);
    const items=[item(inverse,verifyGrade6InverseFactorDraft(inverse,p),'new_this_slice'),
      item(prime,verifyGrade6PrimeProvenanceDraft(prime,p),'new_this_slice'),
      item(classification,verifyGrade6DivisibilityClassificationDraft(classification,p),'existing'),
      item(factor,verifyGrade6FactorEvidenceDraft(factor,p),'existing'),item(common,verifyGrade6CommonRelationsDraft(common,c),'existing')];
    if(new Set(items.map(row=>row.family)).size!==5||new Set(items.map(row=>row.source.id)).size!==5)fail();
    const bank={schemaVersion:'grade6-question-review-bank/v1',id:'grade6-question-review-bank-v1',state:'partial_editor_inventory',artifactAudience:'editor_only',
      scope:{gradeCandidate:6,courseCandidate:'matematik',activeAcademicYear:null,programVersion:null,officialOutcomeCode:null,
        proposedOutcomeCodes:['MAT.6.1.1','MAT.6.1.2','MAT.6.1.3','MAT.6.1.4'],activeProgramAccepted:false,fullOutcomeCoverage:false},
      items,counts:{existingAuthoredDrafts:3,newAuthoredQuestions:2,totalAuthoredDrafts:5,semanticFamilies:5,
        newLessonDerivatives:0,parameterOnlyVariants:0,acceptedProductQuestions:0,publishedQuestions:0},
      difficultySummary:{unassigned:items.filter(row=>row.difficulty.level===null).length,
        authorEstimates:items.filter(row=>row.difficulty.basis==='author_estimate_not_empirical').length,
        empiricallyCalibrated:0,targetDistribution:null},difficultyProfileMet:false,
      inventoryMeaning:'one_task_per_family_options_rows_contexts_and_transfers_are_not_extra_questions',
      repeatedCallsCreateDistinctStock:false,answerBearingEditorArtifact:true,serializedHashIsAuthority:false,
      humanApproval:null,learnerReady:false,publicationReady:false,productionReady:false,
      governance:{purpose:'source_bound_distinct_question_editor_review',owner:'pending',steward:'pending',retention:'pending',realLearnerDataPresent:false},
      activity:{providersCalled:0,networkCallsMade:0,downloadsMade:0,audioProduced:0,videosProduced:0},
      gates:{activeProgram:'per_task_pending',pedagogy:'pending',rights:'pending',difficulty:'unassigned_or_author_estimate_only',answer:'local_independent_math_only',accessibility:'pending'},
      pending:['per_task_program_and_year_acceptance','difficulty_assignment_and_empirical_calibration',
        'source_archive_similarity_review','owner_steward_retention','expert_acceptance','learner_delivery_authorization']};
    bank.contentSha256=createHash('sha256').update(`k12.grade6-question-review-bank/v1:${JSON.stringify(canonical(bank))}`).digest('hex');
    if(Buffer.byteLength(JSON.stringify(bank))>196608)fail();return freeze(bank);
  }catch{fail();}
}
