import { createHash } from 'node:crypto';
import { isProxy } from 'node:util/types';
import { createGrade6DivisibilityClassificationDraft, verifyGrade6DivisibilityClassificationDraft } from './grade6_divisibility_classification_draft.mjs';
import { createGrade6FactorEvidenceDraft, verifyGrade6FactorEvidenceDraft } from './grade6_factor_evidence_draft.mjs';
import { createGrade6CommonRelationsDraft, verifyGrade6CommonRelationsDraft } from './grade6_common_relations_draft.mjs';
import { apportionDifficultyQuota } from './mixed_practice_plan.mjs';
import { createReasonedTeachingTrace, auditReasonedTeachingTrace } from '../contracts/reasoned_teaching_trace.mjs';

// Fixed source-backed editorial composition. It never accepts an item pool,
// answer key, lesson prose, user, provider or requested generation count.
const fail=()=>{throw new Error('invalid_grade6_number_lesson_review_input');};
const BANDS=['introductory','intermediate','advanced','challenge'];
const canonical=value=>Array.isArray(value)?value.map(canonical):value!==null&&typeof value==='object'?
  Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const hash=(kind,value)=>createHash('sha256').update(`k12.grade6-number-lesson-review${kind?'.'+kind:''}/v1:${JSON.stringify(canonical(value))}`).digest('hex');
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};

function inert(input){
  const active=new WeakSet();let nodes=0,bytes=0;
  function copy(value,depth=0){
    if(++nodes>100000||depth>24)fail();
    if(value===null||typeof value==='boolean')return value;
    if(typeof value==='number'){if(!Number.isFinite(value))fail();return value;}
    if(typeof value==='string'){
      bytes+=Buffer.byteLength(value);if(value.length>65536||bytes>2097152||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value))fail();return value;
    }
    if(!value||typeof value!=='object'||isProxy(value)||active.has(value))fail();
    const array=Array.isArray(value),proto=Object.getPrototypeOf(value),keys=Reflect.ownKeys(value);
    if(array?proto!==Array.prototype:![Object.prototype,null].includes(proto))fail();
    if(keys.length>4097||keys.some(key=>typeof key!=='string'||key.length>256||/[\u0000-\u001f]/u.test(key)))fail();
    const descriptors=Object.getOwnPropertyDescriptors(value);
    if(keys.some(key=>!Object.hasOwn(descriptors[key],'value')||(key!=='length'||!array)&&!descriptors[key].enumerable))fail();
    for(const key of keys){bytes+=Buffer.byteLength(key);if(bytes>2097152)fail();}
    active.add(value);let out;
    if(array){
      const length=descriptors.length.value;
      if(length>4096||keys.length!==length+1||keys.some(key=>key!=='length'&&!/^(0|[1-9][0-9]*)$/u.test(key)))fail();
      out=Array.from({length},(_,index)=>{if(!Object.hasOwn(descriptors,String(index)))fail();return copy(descriptors[String(index)].value,depth+1);});
    }else out=Object.fromEntries(keys.sort().map(key=>[key,copy(descriptors[key].value,depth+1)]));
    active.delete(value);return out;
  }
  return copy(input);
}

function sourceReference(draft){return {
  draftId:draft.id,draftContentSha256:draft.contentSha256,sourceId:draft.sourceLineage.sourceId,
  sourceSha256:draft.sourceLineage.sourceSha256,proposedOutcomeCodes:[...draft.scope.proposedOutcomeCodes],
  proposedMicroAimIds:[...(draft.purpose.microAimIds??draft.purpose.proposedMicroPurposeIds)],microAimIdsAreOfficial:false
};}

function lessonRecord(factor,classification,common){
  const concepts=[
    {id:'factor-and-prime',title:'Çarpan, bölen ve asal aynı şey değildir',
      statement:'Pozitif bir doğal sayıyı geri kuran çarpımın üyeleri onun çarpanlarıdır. Bir bölen sayıyı kalansız böler. Asal sayının yalnız iki farklı pozitif böleni vardır: 1 ve kendisi. Bu nedenle 1 asal değildir; bütün çarpanlar da asal olmak zorunda değildir.',
      conditionalShortcut:{worksWhen:'Pozitif bir doğal sayının bütün çarpan çiftleri isteniyorsa',
        why:'Küçük çarpanı ve onun eşini birlikte yazmak aynı çifti ters sırayla yeniden saymayı önler.',
        check:'Her çiftin çarpımı başlangıç sayısına eşit olmalı; eş çarpanlı çift varsa bir kez korunmalı.',
        notImplied:'Çarpan çiftlerini bulmak asallık denetiminin yerine geçmez; yalnız farklı asal çarpanlar isteniyorsa tekrarlar toplamda yeniden sayılmaz.'},
      sourceReferences:[sourceReference(factor)]},
    {id:'joint-divisibility',title:'İki bölünebilme koşulunu ayrı denetle',
      statement:'Kalansız bölünme, bölme sonunda kalanın sıfır olmasıdır. İki kural birlikte soruluyorsa önce her biri için ayrı karar verilir. Yalnız sözcüğü diğer kuralın sağlanmadığını, hem sözcüğü iki kuralın da sağlandığını belirtir.',
      conditionalShortcut:{...classification.explanation.conditionalShortcut},sourceReferences:[sourceReference(classification)]},
    {id:'common-context-and-unit',title:'Ortak ilişkiyi istenen birimle birlikte düşün',
      statement:'Birlikte tekrar zamanı, her iki tekrar dizisinde de bulunan bir dakika işaretidir. Ortak paket boyutu ise iki toplamı da kalansız bölen kart/paket miktarıdır. Paket boyutu ile paket sayısı aynı nicelik değildir; verilen aralık ve ayrı tür koşulu ayrıca korunur.',
      conditionalShortcut:{worksWhen:'Sonlu bir tekrar aralığı veya artansız, ayrı türleri koruyan paketleme koşulu verilmişse',
        why:'Her adayın iki ayrı koşulu da sağlaması ortaklık için gereklidir; bir koşulun doğruluğu diğerini kanıtlamaz.',
        check:'Zamanda iki tekrarın ve aralığın uygunluğunu; paket boyutunda iki toplamın kalansız bölünmesini ve birimi ayrı denetle.',
        notImplied:'Süreleri toplamak ortak zaman vermez. Paket boyutu yerine paket sayısı yazılmaz. Bu ders en küçük ortak kat veya en büyük ortak bölen algoritması öğretmez.'},
      sourceReferences:[sourceReference(common)]},
  ];
  const lesson={id:'grade6-number-property-mini-lesson-v1',title:'Sayıların özelliklerini kanıtla',state:'draft',artifactAudience:'editor_only',
    scope:{gradeCandidate:6,courseCandidate:'matematik',activeAcademicYear:null,programVersion:null,officialOutcomeCode:null,activeProgramAccepted:false},
    purpose:'Verilen koşulu, sayının özelliğini ve istenen niceliği ayırarak sonraki üç farklı görev biçimini okumaya hazırlanmak.',
    concepts,originality:{ownWording:true,sourceBodiesOptionsMediaCopied:false,archiveSimilarityPassed:false},
    teacherApproval:null,learnerEvidenceCollected:false,publicationReady:false,learnerReady:false};
  lesson.contentSha256=hash('lesson',lesson);return lesson;
}

function workedTrace(draft,verification){
  const {explanation:e,problem:p}=draft,byCard=new Map(p.cards.map(card=>[card.id,card.value]));
  const labels=new Map(p.categories.map(category=>[category.id,category.label]));
  const results=[
    '2 ve 3 ile kalansız bölünebilme koşullarını ayrı ayrı kontrol et.',
    verification.recomputed.cardMembership.map(card=>`${card.value}: 2 ile ${card.divisibleBy2?'evet':'hayır'}; 3 ile ${card.divisibleBy3?'evet':'hayır'}.`).join(' '),
    verification.recomputed.correctGroups.map(group=>`${labels.get(group.categoryId)}: ${group.cardIds.map(id=>byCard.get(id)).join(', ')}.`).join(' '),
    'Sekiz kartın her biri dört gruptan yalnız birinde bulunur.'
  ];
  const checks=[
    {prompt:'Ortak gruptaki bir kart kaç ayrı kuralı sağlamalı?',answer:'2 ve 3 ile kalansız bölünebilme koşullarının ikisini de sağlamalı.'},
    {prompt:'14 sayısının çift olması ortak kategori için yeterli mi?',answer:'Hayır. Rakamları toplamı 5 olduğundan 3 ile kalansız bölünmez.'},
    {prompt:'Yalnız 2 ile grubundaki kart diğer kuralı sağlar mı?',answer:'Hayır. 3 ile kalansız bölünmemesi de bu grubun koşuludur.'},
    {prompt:'Bir kartı iki gruba koymak görev koşulunu karşılar mı?',answer:'Hayır. Her kart tam bir kez ve iki kararına uygun tek grupta bulunmalı.'}
  ];
  return createReasonedTeachingTrace({id:'grade6-number-worked-classification-v1',kind:'question_solution',
    source:{id:draft.id,contentSha256:draft.contentSha256},
    goal:{question:e.goal,unit:'text',measurement:'joint_rule_exact_membership_interpretation'},
    evidence:[
      {id:'classification-given',type:'given',text:e.givenMeaning,anchor:'problem.cards',value:null,unit:'text'},
      {id:'classification-rules',type:'definition',text:p.rules.map(rule=>rule.label).join('; '),anchor:'problem.rules',value:null,unit:'text'}
    ],plan:{route:e.route,why:e.because,conditions:[...e.conditions,e.conditionalShortcut.worksWhen,e.conditionalShortcut.notImplied]},
    steps:e.steps.map((step,index)=>({id:step.id,why:step.why,
      operation:{kind:'interpret',inputIds:index?['classification-given','classification-rules',e.steps[index-1].id]:['classification-given','classification-rules']},
      result:{value:results[index],unit:'text',meaning:step.meaning},check:checks[index]})),
    transfer:{prompt:'Yalnız bir kurala uymak ile iki kurala birlikte uymak neden aynı grup değildir?',
      answer:'Yalnız bir kurala uyan kart diğer koşulu sağlamaz; ortak grup iki koşulu da ayrı ayrı sağlamayı gerektirir.'},
    scope:{gradeBand:'5-6',prerequisite:'Pozitif doğal sayılar, onluk sayı gösterimi, kalansız bölünme ve iki ayrı koşulun anlamı.'}
  });
}

function item(draft,verification,difficulty){return {source:{id:draft.id,contentSha256:draft.contentSha256},
  family:draft.problem.family,draft,verification,difficulty};}

/** Builds one actual lesson/example/practice review packet from fixed, verified
 * source revisions. Generic rectangle scope and difficulty gates stay closed. */
export function createGrade6NumberLessonReview(input){
  if(arguments.length!==1)throw new Error('invalid_grade6_number_lesson_review_arguments');
  try{
    const data=inert(input);
    if(!data||Array.isArray(data)||typeof data!=='object'||Object.keys(data).length!==2
      ||!Object.hasOwn(data,'referencePlannerInput')||!Object.hasOwn(data,'commonSourceBindingInput'))fail();
    const classification=createGrade6DivisibilityClassificationDraft(data.referencePlannerInput);
    const factor=createGrade6FactorEvidenceDraft(data.referencePlannerInput);
    const common=createGrade6CommonRelationsDraft(data.commonSourceBindingInput);
    const classificationVerification=verifyGrade6DivisibilityClassificationDraft(classification,data.referencePlannerInput);
    const factorVerification=verifyGrade6FactorEvidenceDraft(factor,data.referencePlannerInput);
    const commonVerification=verifyGrade6CommonRelationsDraft(common,data.commonSourceBindingInput);
    if(![classificationVerification,factorVerification,commonVerification].every(value=>value.valid&&value.localMathChecks==='passed'))fail();
    const lesson=lessonRecord(factor,classification,common),reasonedTrace=workedTrace(classification,classificationVerification);
    const workedExample={...item(classification,classificationVerification,{...classification.difficulty}),
      reasonedTrace,traceAudit:auditReasonedTeachingTrace(reasonedTrace)};
    const unassigned=()=>({level:null,basis:'unassigned',calibration:null});
    const selectedQuestions=[item(factor,factorVerification,unassigned()),item(common,commonVerification,unassigned())];
    if(new Set([workedExample,...selectedQuestions].map(row=>row.family)).size!==3)fail();
    const request={count:10,difficultyProfile:{introductory:10,intermediate:30,advanced:30,challenge:30}};
    const requestedDifficultyQuota=apportionDifficultyQuota(request.count,request.difficultyProfile);
    const selectedDifficultyCounts=Object.fromEntries(BANDS.map(band=>[band,0]));
    const difficultyRows=BANDS.map(id=>({id,requested:requestedDifficultyQuota[id],selected:0,missing:requestedDifficultyQuota[id],availableDistinctFamilies:0}));
    const countRow={id:'requested_count',requested:10,selected:2,missing:8,availableDistinctFamilies:2};
    const inventory=[workedExample,...selectedQuestions].map(row=>({source:row.source,family:row.family,difficulty:row.difficulty,
      sourceLineage:row.draft.sourceLineage,scope:row.draft.scope,purpose:row.draft.purpose}));
    const review={schemaVersion:'grade6-number-lesson-review/v1',id:'grade6-number-lesson-review-v1',state:'partial_editor_sequence',artifactAudience:'editor_only',
      scope:{gradeCandidate:6,courseCandidate:'matematik',activeAcademicYear:null,programVersion:null,officialOutcomeCode:null,
        proposedOutcomeCodes:['MAT.6.1.1','MAT.6.1.2','MAT.6.1.3','MAT.6.1.4'],activeProgramAccepted:false,fullOutcomeCoverage:false,
        formalGcdLcmTeachingAllowed:false,sourceScopeMeaning:'per_task_candidates_not_one_accepted_program'},
      lesson,workedExample,selectedQuestions,request,requestedDifficultyQuota,selectedDifficultyCounts,difficultyUnassignedCount:2,
      candidateInventory:inventory,sourcePoolSha256:hash('pool',inventory),quotaReport:{difficulty:difficultyRows,count:countRow},
      deficits:[{dimension:'count',...countRow,reason:'insufficient_distinct_eligible_families'},
        ...difficultyRows.map(row=>({dimension:'difficulty',...row,reason:'practice_difficulty_unassigned_no_band_credit'}))],
      selectedCount:2,semanticFamilyCount:2,selectionState:'blocked_review_plan',selectionReady:false,difficultyProfileMet:false,quotasMet:false,
      difficultyPolicy:'fixed_user_example_not_source_distribution_or_empirical_age_policy',practiceDifficultyPolicy:'unassigned_not_copied_from_worked_example',
      sequence:[{stage:'concept_lesson',source:{id:lesson.id,contentSha256:lesson.contentSha256}},
        {stage:'reasoned_worked_example',source:workedExample.source},{stage:'mixed_practice',sources:selectedQuestions.map(row=>row.source)}],
      counts:{existingAuthoredDrafts:3,newAuthoredQuestions:0,newLessonDerivatives:1,workedExamples:1,selectedPracticeQuestions:2,
        semanticFamilies:3,selectedPracticeFamilies:2,parameterOnlyVariants:0,acceptedProductQuestions:0,publishedQuestions:0},
      repeatedCallsCreateDistinctStock:false,humanApproval:null,publicationReady:false,learnerReady:false,productionReady:false,
      learnerEvidenceCollected:false,serializedHashIsAuthority:false,answerBearingEditorArtifact:true,
      governance:{purpose:'editor_lesson_and_distinct_practice_review',owner:'pending',steward:'pending',retention:'pending',realLearnerDataPresent:false},
      activity:{providersCalled:0,networkCallsMade:0,downloadsMade:0,imagesProduced:0,audioProduced:0,videosProduced:0},
      gates:{activeProgram:'pending',lessonPedagogy:'pending',rights:'pending',difficulty:'unassigned_practice_bands',answer:'existing_draft_local_math_only',accessibility:'pending'},
      pending:['lesson_scope_and_age_review','per_task_active_program_and_year','microaim_and_lesson_alignment_review',
        'practice_difficulty_assignment_and_empirical_calibration','eight_more_distinct_eligible_families','rights_owner_steward_retention_review',
        'expert_acceptance','learner_delivery_authorization']};
    review.contentSha256=hash('',review);
    if(Buffer.byteLength(JSON.stringify(review))>131072)fail();return freeze(review);
  }catch{fail();}
}
