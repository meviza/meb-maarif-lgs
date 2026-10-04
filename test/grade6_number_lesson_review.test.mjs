import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { auditReasonedTeachingTrace, getReasonedTeachingStage } from '../packages/contracts/reasoned_teaching_trace.mjs';

const api=await import('../packages/content-factory/grade6_number_lesson_review.mjs').catch(error=>{
  if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;
});
const load=async name=>JSON.parse(await readFile(new URL(`../sources/${name}.json`,import.meta.url),'utf8'));
const [forms,matrix,main,supplement,observations]=await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix','meb-reference-registry','education-reference-supplement',
  'grade6-common-relations-application-observations'].map(load));
const clone=value=>structuredClone(value);
function input(){return {referencePlannerInput:{formObservations:clone(forms),semanticMatrix:clone(matrix),sourceScopeInput:{
  archives:[clone(main),clone(supplement)],selection:{sources:[],inventory:[]},downloadObservations:{sources:[]},
  monthly:{sources:[],batches:[]},formObservations:clone(forms)}},commonSourceBindingInput:{
  applicationObservations:clone(observations),semanticMatrix:clone(matrix),
  sourceRecord:clone(main.sources.find(row=>row.id==='tymm-current-ortaokul-matematik'))}};}
function create(value=input()){
  assert.equal(typeof api.createGrade6NumberLessonReview,'function','grade6 lesson-to-mixed-practice consumer is missing');
  return api.createGrade6NumberLessonReview(value);
}
const families=['joint_divisibility_card_classification','complete_factor_pair_board_prime_subset_audit',
  'common_relation_context_unit_evidence_matching'];
const bands=['introductory','intermediate','advanced','challenge'];

// Break: numeric variants or the worked family are selected again as mixed practice.
test('one worked classification precedes two actually different existing practice families',()=>{
  const review=create();
  assert.equal(review.schemaVersion,'grade6-number-lesson-review/v1');
  assert.equal(review.workedExample.family,families[0]);
  assert.deepEqual(review.selectedQuestions.map(row=>row.family),families.slice(1));
  assert.equal(new Set(review.selectedQuestions.map(row=>row.family)).size,2);
  assert.ok(review.selectedQuestions.every(row=>row.source.id!==review.workedExample.source.id));
  assert.deepEqual(review.sequence.map(row=>row.stage),['concept_lesson','reasoned_worked_example','mixed_practice']);
  assert.deepEqual(review.sequence[2].sources,review.selectedQuestions.map(row=>row.source));
  assert.equal(review.sequence[0].source.contentSha256,review.lesson.contentSha256);
  assert.equal(review.sequence[1].source.contentSha256,review.workedExample.draft.contentSha256);
});

// Break: combining drafts changes their answer or skips independent domain verification.
test('all three canonical drafts expose independently recomputed math without upgrading acceptance',()=>{
  const review=create(),[factor,common]=review.selectedQuestions;
  assert.equal(review.workedExample.verification.valid,true);assert.equal(factor.verification.valid,true);assert.equal(common.verification.valid,true);
  assert.deepEqual(review.workedExample.verification.recomputed.correctGroups.map(row=>row.cardIds),[
    ['card-14','card-32'],['card-21','card-33'],['card-24','card-42'],['card-25','card-47']]);
  assert.equal(factor.draft.answerKey.boardId,'board-c');
  assert.deepEqual(factor.verification.recomputed.distinctPrimeFactors,[2,3]);
  assert.deepEqual(common.verification.recomputed.commonPositiveTimes,[24,48]);
  assert.deepEqual(common.verification.recomputed.commonPositiveGroupSizes,[1,2,3,4,6,12]);
  for(const item of [review.workedExample,...review.selectedQuestions]){
    assert.equal(item.source.id,item.draft.id);assert.equal(item.source.contentSha256,item.draft.contentSha256);
    assert.equal(item.verification.counts.acceptedProductQuestions,0);assert.equal(item.verification.publicationReady,false);
  }
});

// Break: current candidate lineage is flattened into an approved/year-bound program.
test('per-task source output and microaim lineages remain distinct and unapproved',()=>{
  const review=create(),[worked,factor,common]=[review.workedExample,...review.selectedQuestions];
  assert.deepEqual(worked.draft.scope.proposedOutcomeCodes,['MAT.6.1.2']);
  assert.deepEqual(worked.draft.purpose.microAimIds,['G6Q13-M1','G6Q13-M2','G6Q13-M3']);
  assert.deepEqual(factor.draft.scope.proposedOutcomeCodes,['MAT.6.1.1','MAT.6.1.3']);
  assert.deepEqual(common.draft.scope.proposedOutcomeCodes,['MAT.6.1.4']);
  assert.deepEqual(common.draft.purpose.proposedMicroPurposeIds,['G6-CR-M01','G6-CR-M02','G6-CR-M03','G6-CR-M05']);
  assert.equal(worked.draft.sourceLineage.sourceId,'meb-archive-grade6-math-fascicle-unit1-hatay');
  assert.equal(common.draft.sourceLineage.sourceId,'tymm-current-ortaokul-matematik');
  for(const item of [worked,factor,common]){
    assert.equal(item.draft.scope.gradeCandidate,6);assert.equal(item.draft.scope.programVersion,null);
    assert.equal(item.draft.scope.activeAcademicYear,null);assert.equal(item.draft.scope.officialOutcomeCode,null);
    assert.equal(item.draft.scope.activeProgramAccepted,false);assert.equal(item.draft.sourceLineage.freshPdfByteChecks,0);
  }
  assert.equal(review.scope.gradeCandidate,6);assert.equal(review.scope.programVersion,null);
  assert.equal(review.scope.activeAcademicYear,null);assert.equal(review.scope.activeProgramAccepted,false);
});

// Break: undefined practice difficulty is silently assigned from the example or target.
test('ten-question example profile honestly retains eight count deficits and two unassigned difficulties',()=>{
  const review=create();
  assert.deepEqual(review.request,{count:10,difficultyProfile:{introductory:10,intermediate:30,advanced:30,challenge:30}});
  assert.deepEqual(review.requestedDifficultyQuota,{introductory:1,intermediate:3,advanced:3,challenge:3});
  assert.deepEqual(review.selectedDifficultyCounts,{introductory:0,intermediate:0,advanced:0,challenge:0});
  assert.equal(review.difficultyUnassignedCount,2);assert.equal(review.workedExample.difficulty.level,'medium');
  assert.equal(review.workedExample.difficulty.basis,'author_estimate_not_empirical');
  for(const item of review.selectedQuestions)assert.deepEqual(item.difficulty,{level:null,basis:'unassigned',calibration:null});
  const count=review.deficits.find(row=>row.dimension==='count');
  assert.equal(count.requested,10);assert.equal(count.selected,2);assert.equal(count.missing,8);
  assert.deepEqual(review.quotaReport.difficulty.map(row=>[row.id,row.requested,row.selected,row.missing]),[
    ['introductory',1,0,1],['intermediate',3,0,3],['advanced',3,0,3],['challenge',3,0,3]]);
  assert.equal(review.deficits.filter(row=>row.dimension==='difficulty').length,4);
  assert.equal(review.selectionReady,false);assert.equal(review.difficultyProfileMet,false);
});

// Break: the explanation bridge is advertised as arithmetic QA or loses the canonical source.
test('worked trace retains source goal evidence rationale and conditional checks with numeric zero',()=>{
  const review=create(),worked=review.workedExample,trace=worked.reasonedTrace;
  assert.equal(trace.kind,'question_solution');assert.deepEqual(trace.source,worked.source);
  assert.equal(trace.goal.question,worked.draft.explanation.goal);assert.equal(trace.plan.why,worked.draft.explanation.because);
  assert.equal(trace.scope.gradeBand,'5-6');assert.equal(trace.steps.length,4);
  assert.ok(trace.steps.every(step=>step.operation.kind==='interpret'&&step.result.unit==='text'));
  assert.equal(worked.traceAudit.numericStepsChecked,0);assert.equal(auditReasonedTeachingTrace(trace).numericStepsChecked,0);
  assert.equal(worked.traceAudit.semanticReview,'pending');assert.equal(trace.publicationReady,false);
  const stage=getReasonedTeachingStage(trace,{stageIndex:3,reveal:false});
  assert.equal(stage.result,null);assert.equal(stage.check.answer,null);assert.equal(stage.canAdvance,false);
  assert.ok(getReasonedTeachingStage(trace,{stageIndex:3,reveal:true}).result);
});

// Break: concept text becomes a naked shortcut without scope, reason or link to its source task.
test('own mini lesson keeps three source-bound concepts with conditional practical notes',()=>{
  const review=create(),lesson=review.lesson;
  assert.equal(lesson.title,'Sayıların özelliklerini kanıtla');assert.equal(lesson.concepts.length,3);
  assert.deepEqual(lesson.concepts.map(row=>row.id),['factor-and-prime','joint-divisibility','common-context-and-unit']);
  for(const concept of lesson.concepts){
    assert.ok(/^[A-ZÇĞİÖŞÜ]/u.test(concept.title));assert.ok(/^[A-ZÇĞİÖŞÜ]/u.test(concept.statement));
    for(const key of ['worksWhen','why','check','notImplied'])assert.ok(concept.conditionalShortcut[key].trim());
    assert.equal(concept.sourceReferences.length,1);
    const ref=concept.sourceReferences[0],item=[review.workedExample,...review.selectedQuestions].find(row=>row.source.id===ref.draftId);
    assert.equal(ref.draftContentSha256,item.source.contentSha256);assert.equal(ref.sourceSha256,item.draft.sourceLineage.sourceSha256);
    assert.deepEqual(ref.proposedOutcomeCodes,item.draft.scope.proposedOutcomeCodes);
  }
});

// Break: deterministic reconstruction creates new question stock or mutates inputs/revisions.
test('repeat calls reuse three drafts and one lesson derivative without increasing accepted stock',()=>{
  const data=input(),before=JSON.stringify(data),review=create(data);
  assert.equal(JSON.stringify(data),before);assert.deepEqual(create(data),review);
  assert.deepEqual(review.counts,{existingAuthoredDrafts:3,newAuthoredQuestions:0,newLessonDerivatives:1,
    workedExamples:1,selectedPracticeQuestions:2,semanticFamilies:3,selectedPracticeFamilies:2,
    parameterOnlyVariants:0,acceptedProductQuestions:0,publishedQuestions:0});
  assert.equal(review.repeatedCallsCreateDistinctStock,false);assert.equal(review.publicationReady,false);
  assert.equal(review.learnerReady,false);assert.equal(review.productionReady,false);
  assert.equal(review.governance.owner,'pending');assert.equal(review.governance.realLearnerDataPresent,false);
  assert.deepEqual(review.activity,{providersCalled:0,networkCallsMade:0,downloadsMade:0,imagesProduced:0,audioProduced:0,videosProduced:0});
});

// Break: adding caller candidates/answer/provider/approval fields opens an alternative authoring path.
test('exact argument and root field boundary refuses caller candidates keys lessons and runtime options',()=>{
  assert.equal(typeof api.createGrade6NumberLessonReview,'function','grade6 lesson-to-mixed-practice consumer is missing');
  for(const key of ['count','candidates','answerKey','lesson','provider','approved','request','sourceUrl']){
    const data=input();data[key]=key==='candidates'?[]:true;
    assert.throws(()=>api.createGrade6NumberLessonReview(data),/invalid_grade6_number_lesson_review_input/u);
  }
  assert.throws(()=>api.createGrade6NumberLessonReview(),/invalid_grade6_number_lesson_review_arguments/u);
  assert.throws(()=>api.createGrade6NumberLessonReview(input(),{}),/invalid_grade6_number_lesson_review_arguments/u);
});

// Break: getters/proxies/cycles or oversized wire data execute hooks or reach source constructors.
test('hostile input is rejected without invoking caller hooks',()=>{
  assert.equal(typeof api.createGrade6NumberLessonReview,'function','grade6 lesson-to-mixed-practice consumer is missing');
  let hooks=0;const getter={};Object.defineProperty(getter,'referencePlannerInput',{enumerable:true,get(){hooks++;return input().referencePlannerInput;}});
  const proxy=new Proxy({}, {get(){hooks++;},ownKeys(){hooks++;return [];}}),revoked=Proxy.revocable({},{});revoked.revoke();
  const cycle=input();cycle.commonSourceBindingInput.semanticMatrix=cycle;
  const nested=input();Object.defineProperty(nested.commonSourceBindingInput,'sourceRecord',{enumerable:true,get(){hooks++;return {};}});
  const sparse=input();sparse.referencePlannerInput.sourceScopeInput.archives=new Array(2);
  const huge=input();huge.commonSourceBindingInput.extra='x'.repeat(65537);
  for(const data of [getter,proxy,revoked.proxy,cycle,nested,sparse,huge,[],null]){
    assert.throws(()=>api.createGrade6NumberLessonReview(data),/invalid_grade6_number_lesson_review_input/u);
  }
  assert.equal(hooks,0);
});

// Break: a source/hash/grade/program override is trusted merely because the caller labels it official.
test('stale or substituted sources grade and program claims fail before exposing any lesson',()=>{
  assert.equal(typeof api.createGrade6NumberLessonReview,'function','grade6 lesson-to-mixed-practice consumer is missing');
  for(const mutate of [
    data=>{data.referencePlannerInput.formObservations.observations[0].sourceSha256='a'.repeat(64);},
    data=>{data.commonSourceBindingInput.sourceRecord.download.sha256='b'.repeat(64);},
    data=>{data.commonSourceBindingInput.sourceRecord.grades=[7];},
    data=>{data.commonSourceBindingInput.applicationObservations.outputBinding.code='MAT.8.1.4';},
    data=>{data.referencePlannerInput.semanticMatrix.activeAcademicYear='2026-2027';}
  ]){const data=input();mutate(data);assert.throws(()=>create(data),/invalid_grade6_number_lesson_review_input/u);}
});

// Break: output mutation or non-bound source/lesson/quota data survives the packet digest.
test('frozen packet digest binds the lesson canonical revisions and incomplete quota report',()=>{
  const review=create();assert.ok(Object.isFrozen(review));assert.ok(Object.isFrozen(review.lesson.concepts[0]));
  assert.ok(Object.isFrozen(review.selectedQuestions[0].draft));assert.ok(Object.isFrozen(review.deficits));
  assert.throws(()=>{review.selectedQuestions[0].source.contentSha256='a'.repeat(64);},TypeError);
  const canonical=value=>Array.isArray(value)?value.map(canonical):value!==null&&typeof value==='object'?
    Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
  const {contentSha256,...body}=review;
  const expected=createHash('sha256').update(`k12.grade6-number-lesson-review/v1:${JSON.stringify(canonical(body))}`).digest('hex');
  assert.equal(contentSha256,expected);assert.equal(review.serializedHashIsAuthority,false);
  assert.ok(Buffer.byteLength(JSON.stringify(review))<=131072);
});
