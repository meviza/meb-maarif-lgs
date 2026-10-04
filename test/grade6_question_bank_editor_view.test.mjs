import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { execFileSync,spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const api=await import('../packages/content-factory/grade6_question_bank_editor_view.mjs').catch(error=>{
  if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;
});
const load=async name=>JSON.parse(await readFile(new URL(`../sources/${name}.json`,import.meta.url),'utf8'));
const [forms,matrix,main,supplement,observations]=await Promise.all(['grade6-question-form-observations',
  'grade6-source-semantic-candidate-matrix','meb-reference-registry','education-reference-supplement',
  'grade6-common-relations-application-observations'].map(load));
const input=()=>structuredClone({referencePlannerInput:{formObservations:forms,semanticMatrix:matrix,sourceScopeInput:{
  archives:[main,supplement],selection:{sources:[],inventory:[]},downloadObservations:{sources:[]},
  monthly:{sources:[],batches:[]},formObservations:forms}},commonSourceBindingInput:{
  applicationObservations:observations,semanticMatrix:matrix,
  sourceRecord:main.sources.find(row=>row.id==='tymm-current-ortaokul-matematik')}});
function render(data=input()){
  assert.equal(typeof api.renderGrade6QuestionBankEditorView,'function','question-focused editor view is missing');
  return api.renderGrade6QuestionBankEditorView(data);
}

// Break: new questions only exist as labels, lack given evidence or options.
test('five self-contained families show actual new evidence and options before their closed solutions',()=>{
  const {html,manifest}=render();
  assert.equal((html.match(/data-question-family=/gu)??[]).length,5);
  assert.equal((html.match(/<details /gu)??[]).length,5);
  assert.equal((html.match(/<details[^>]* open/gu)??[]).length,0);
  for(const value of ['60–95','3 × □','□ × 14','7 × 12','54','35','28','75','121','En büyük','En küçük',
    '14, 21, 24, 25, 32, 33, 42, 47','36','24 karakter kartı','36 mekân kartı'])assert.ok(html.includes(value),value);
  assert.equal((html.match(/data-choice-id="option-/gu)??[]).length,4);
  assert.equal((html.match(/data-choice-id="ledger-/gu)??[]).length,4);
  assert.equal(manifest.closedAnswerSections,5);assert.equal(manifest.newAuthoredQuestions,2);
  assert.equal(manifest.existingDraftsReused,3);assert.equal(manifest.newLessonDerivatives,0);
});

// Break: render drops rationale, duplicate selections, row identities, units or source revision.
test('solutions preserve goals reasons meaning exact provenance and traceable source candidates',()=>{
  const {html}=render();
  for(const label of ['Ne isteniyor?','Verilenler neyi anlatıyor?','Neden bu yol?','Pratik bilgi ve püf nokta',
    'Kaynak satır','row-a','row-d','Kart/paket','Etkin yıl ve program kabulü bekliyor',
    'MAT.6.1.1','MAT.6.1.3'])assert.ok(html.includes(label),label);
  assert.equal((html.match(/data-answer-revision="[a-f0-9]{64}"/gu)??[]).length,5);
  assert.equal((html.match(/data-task-revision="[a-f0-9]{64}"/gu)??[]).length,5);
  assert.ok(html.includes('Öğrenci verisiyle kalibre edilmedi'));
  assert.ok(html.includes('Zorluk atanmadı'));assert.ok(html.includes('Kabul edilmiş ve yayımlanmış soru: 0'));
});

// Break: caller prose/source/approval becomes HTML, or helper runs an active resource.
test('closed sink has scripts and network disabled and rejects arbitrary caller fields without hooks',()=>{
  const {html,manifest}=render();
  assert.ok(html.includes("script-src 'none'"));assert.ok(html.includes("connect-src 'none'"));
  assert.ok(!/<script\b|<iframe\b|<audio\b|<video\b|\son\w+=/iu.test(html));
  assert.equal(manifest.answerBearingEditorArtifact,true);assert.equal(manifest.hiddenDetailsAreLearnerSecurity,false);
  assert.equal(manifest.nativeVisualReviewPassed,false);assert.equal(manifest.accessibilityPassed,false);
  assert.equal(manifest.learnerReady,false);assert.equal(manifest.publicationReady,false);
  let hooks=0;const hostile=input();Object.defineProperty(hostile,'questions',{enumerable:true,get(){hooks++;return '<script>';}});
  assert.throws(()=>render(hostile),/invalid_question_bank_editor_input/u);assert.equal(hooks,0);
  for(const key of ['html','manifest','questions','approval','count','sourceUrl']){
    const data=input();data[key]='<script>alert(1)</script>';assert.throws(()=>render(data),/invalid_question_bank_editor_input/u);}
  assert.throws(()=>api.renderGrade6QuestionBankEditorView(input(),{}),/invalid_question_bank_editor_arguments/u);
});

test('deterministic immutable manifest hashes bounded actual HTML bytes without claiming media',()=>{
  const view=render();assert.deepEqual(render(),view);assert.ok(Object.isFrozen(view.manifest));
  assert.equal(view.manifest.htmlSha256,createHash('sha256').update(view.html).digest('hex'));
  assert.equal(view.manifest.htmlBytes,Buffer.byteLength(view.html));assert.ok(view.manifest.htmlBytes<=131072);
  assert.equal(view.manifest.providerCallsMade,0);assert.equal(view.manifest.audioGenerated,false);
  assert.equal(view.manifest.videoRendered,false);assert.equal(view.manifest.publishedQuestions,0);
});

// Break: CLI lets counts/providers/paths select a noncanonical source or promises an exam.
test('exact CLI JSON and HTML consume the same closed five-question inventory',()=>{
  const tool=new URL('../tools/grade6_reference_authoring_plan.mjs',import.meta.url);
  const raw=execFileSync(process.execPath,[tool.pathname,'--question-bank-review'],{encoding:'utf8',maxBuffer:1048576});
  const bank=JSON.parse(raw);assert.equal(bank.counts.newAuthoredQuestions,2);assert.equal(bank.counts.totalAuthoredDrafts,5);
  const html=execFileSync(process.execPath,[tool.pathname,'--question-bank-html'],{encoding:'utf8',maxBuffer:1048576});
  assert.equal(html,render().html+'\n');
  assert.equal(bank.contentSha256,render().manifest.reviewContentSha256);
});
test('unknown and combined question CLI arguments reject before emitting metadata',()=>{
  const tool=new URL('../tools/grade6_reference_authoring_plan.mjs',import.meta.url);
  for(const args of [['--question-bank-html','--plan'],['--question-bank-review','--count','100'],
    ['--question-bank-review','--provider','clef'],['--question-bank-review','--source','other.json'],['--question-bank-publish']]){
    const result=spawnSync(process.execPath,[tool.pathname,...args],{encoding:'utf8'});
    assert.equal(result.status,1);assert.equal(result.stdout,'');
    assert.equal(result.stderr.trim(),'invalid_grade6_reference_authoring_args');}
});
