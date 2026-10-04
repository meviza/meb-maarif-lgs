import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const api=await import('../packages/content-factory/grade6_question_review_bank.mjs').catch(error=>{
  if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;
});
const load=async name=>JSON.parse(await readFile(new URL(`../sources/${name}.json`,import.meta.url),'utf8'));
const [forms,matrix,main,supplement,observations]=await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix','meb-reference-registry','education-reference-supplement',
  'grade6-common-relations-application-observations'].map(load));
function input(){return structuredClone({referencePlannerInput:{formObservations:forms,semanticMatrix:matrix,sourceScopeInput:{
  archives:[main,supplement],selection:{sources:[],inventory:[]},downloadObservations:{sources:[]},
  monthly:{sources:[],batches:[]},formObservations:forms}},commonSourceBindingInput:{
  applicationObservations:observations,semanticMatrix:matrix,
  sourceRecord:main.sources.find(row=>row.id==='tymm-current-ortaokul-matematik')}});}
function create(value=input()){
  assert.equal(typeof api.createGrade6QuestionReviewBank,'function','question-focused bank consumer is missing');
  return api.createGrade6QuestionReviewBank(value);
}
const families=['inverse_factor_candidate_reconstruction','prime_extrema_source_preserving_order',
  'joint_divisibility_card_classification','complete_factor_pair_board_prime_subset_audit',
  'common_relation_context_unit_evidence_matching'];

// Break: lesson output or number-only variants inflate the new question count.
test('two genuinely new families lead five fixed questions without a new lesson',()=>{
  const bank=create();
  assert.equal(bank.schemaVersion,'grade6-question-review-bank/v1');
  assert.deepEqual(bank.items.map(row=>row.family),families);
  assert.deepEqual(bank.items.map(row=>row.authorship),['new_this_slice','new_this_slice','existing','existing','existing']);
  assert.deepEqual(bank.counts,{existingAuthoredDrafts:3,newAuthoredQuestions:2,totalAuthoredDrafts:5,
    semanticFamilies:5,newLessonDerivatives:0,parameterOnlyVariants:0,acceptedProductQuestions:0,publishedQuestions:0});
  assert.equal(Object.hasOwn(bank,'lesson'),false);assert.equal(bank.repeatedCallsCreateDistinctStock,false);
});

// Break: the consumer trusts supplied answer keys or flattens different source purposes.
test('source revisions and local independent answers survive composition',()=>{
  const bank=create(),[inverse,prime,classification,factor,common]=bank.items;
  assert.equal(inverse.draft.answerKey.optionId,'option-b');
  assert.equal(prime.draft.answerKey.optionId,'ledger-b');
  assert.equal(factor.draft.answerKey.boardId,'board-c');
  assert.equal(classification.draft.problem.cards.length,8);
  assert.deepEqual(common.verification.recomputed.commonPositiveTimes,[24,48]);
  assert.deepEqual(inverse.draft.scope.proposedOutcomeCodes,['MAT.6.1.1']);
  assert.deepEqual(prime.draft.scope.proposedOutcomeCodes,['MAT.6.1.3']);
  for(const row of bank.items){
    assert.equal(row.source.id,row.draft.id);assert.equal(row.source.contentSha256,row.draft.contentSha256);
    assert.equal(row.verification.valid,true);assert.equal(row.verification.localMathChecks,'passed');
    assert.equal(row.draft.scope.gradeCandidate,6);assert.equal(row.draft.scope.activeAcademicYear,null);
    assert.equal(row.draft.scope.programVersion,null);assert.equal(row.draft.scope.activeProgramAccepted,false);
    assert.equal(row.draft.scope.officialOutcomeCode,null);assert.equal(row.verification.publicationReady,false);
  }
});

// Break: editorial estimates become measured difficulty, quotas or learner acceptance.
test('difficulty remains per-question estimate or unassigned with no calibrated band credit',()=>{
  const bank=create();assert.equal(bank.difficultySummary.unassigned,2);
  assert.equal(bank.difficultySummary.authorEstimates,3);assert.equal(bank.difficultySummary.empiricallyCalibrated,0);
  assert.equal(bank.difficultySummary.targetDistribution,null);assert.equal(bank.difficultyProfileMet,false);
  for(const row of bank.items){assert.equal(row.difficulty.calibration,null);
    if(row.difficulty.level===null)assert.equal(row.difficulty.basis,'unassigned');
    else assert.equal(row.difficulty.basis,'author_estimate_not_empirical');}
  assert.equal(bank.learnerReady,false);assert.equal(bank.publicationReady,false);assert.equal(bank.productionReady,false);
  assert.equal(bank.humanApproval,null);assert.equal(bank.answerBearingEditorArtifact,true);
  assert.equal(bank.governance.realLearnerDataPresent,false);
  assert.deepEqual(bank.activity,{providersCalled:0,networkCallsMade:0,downloadsMade:0,audioProduced:0,videosProduced:0});
});

// Break: caller pools, counts, approvals or hooks open a second composition route.
test('closed root and argument guards reject caller generation and authority',()=>{
  assert.equal(typeof api.createGrade6QuestionReviewBank,'function','question bank consumer is missing');
  for(const key of ['questions','count','difficulty','answerKey','provider','approved','lesson','sourceUrl']){
    const data=input();data[key]=true;assert.throws(()=>create(data),/invalid_grade6_question_bank_input/u);}
  assert.throws(()=>api.createGrade6QuestionReviewBank(),/invalid_grade6_question_bank_arguments/u);
  assert.throws(()=>api.createGrade6QuestionReviewBank(input(),{}),/invalid_grade6_question_bank_arguments/u);
});
test('hostile objects and stale source inputs reject without executing hooks',()=>{
  let hooks=0;const getter={};Object.defineProperty(getter,'referencePlannerInput',{enumerable:true,get(){hooks++;return {};}});
  const proxy=new Proxy({},{get(){hooks++;},ownKeys(){hooks++;return [];}}),revoked=Proxy.revocable({},{});revoked.revoke();
  const cycle=input();cycle.commonSourceBindingInput=cycle;
  const nested=input();Object.defineProperty(nested.commonSourceBindingInput,'sourceRecord',{enumerable:true,get(){hooks++;return {};}});
  const sparse=input();sparse.referencePlannerInput.sourceScopeInput.archives=new Array(2);
  const huge=input();huge.commonSourceBindingInput.extra='x'.repeat(65537);
  for(const data of [getter,proxy,revoked.proxy,cycle,nested,sparse,huge,null,[]])assert.throws(()=>create(data),/invalid_grade6_question_bank_input/u);
  const stale=input();stale.referencePlannerInput.formObservations.observations[0].sourceSha256='a'.repeat(64);
  assert.throws(()=>create(stale),/invalid_grade6_question_bank_input/u);assert.equal(hooks,0);
});

// Break: repeated builds add stock or a digest is mistaken for publisher authority.
test('immutable bounded inventory is deterministic and its digest covers the actual five revisions',()=>{
  const data=input(),before=JSON.stringify(data),bank=create(data);
  assert.equal(JSON.stringify(data),before);assert.deepEqual(create(data),bank);
  assert.ok(Object.isFrozen(bank));assert.ok(Object.isFrozen(bank.items[0].draft));
  assert.throws(()=>{bank.items[0].source.id='other';},TypeError);
  const canonical=value=>Array.isArray(value)?value.map(canonical):value!==null&&typeof value==='object'?
    Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
  const {contentSha256,...body}=bank;
  assert.equal(contentSha256,createHash('sha256').update(`k12.grade6-question-review-bank/v1:${JSON.stringify(canonical(body))}`).digest('hex'));
  assert.equal(bank.serializedHashIsAuthority,false);assert.ok(Buffer.byteLength(JSON.stringify(bank))<=196608);
});
