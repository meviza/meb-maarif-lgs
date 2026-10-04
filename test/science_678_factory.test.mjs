import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const api = await import('../packages/content-factory/science_678_factory.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error;
});
const pilot = async () => {
  assert.equal(typeof api.buildScience678Pilot, 'function', 'science pilot is missing');
  return api.buildScience678Pilot();
};
const blueprint = async () => JSON.parse(await readFile(new URL('../sources/science-678-source-blueprint.json', import.meta.url), 'utf8'));

test('nine grade-branch cells retain 450 target and do not pad the 54 authored pilot', async () => {
  const bank = await pilot();
  assert.equal(bank.schemaVersion, 'science-678-pilot/v1');
  assert.equal(bank.items.length, 54);
  assert.equal(bank.counts.authoredDrafts, 54);
  assert.equal(bank.counts.reasoningFamilies, 27);
  assert.equal(bank.counts.targetDrafts, 450);
  assert.equal(bank.counts.remainingDrafts, 396);
  assert.equal(bank.counts.acceptedProductQuestions, 0);
  assert.equal(bank.counts.publishedQuestions, 0);
  assert.equal(bank.plan.cells.length, 9);
  for (const cell of bank.plan.cells) {
    assert.equal(cell.requested, 50); assert.equal(cell.authored, 6);
    assert.equal(cell.remaining, 44); assert.equal(cell.reasoningFamilies, 3);
    assert.equal(cell.minimumFamiliesForTarget, 25);
  }
  assert.equal(bank.full450Completed, false);
  assert.equal(bank.fullAnnualCoverage, false);
});

test('every pilot item is source-bound, visual, reasoned and actually screened by local JEV', async () => {
  const bank = await pilot();
  for (const row of bank.items) {
    assert.equal(row.verification.valid, true);
    assert.equal(row.verification.answerOraclePassed, true);
    assert.equal(row.verification.sourceBindingPassed, true);
    assert.equal(row.verification.visualBindingPassed, true);
    assert.equal(row.jev.advisory.performed, true);
    assert.equal(row.jev.advisory.mode, 'local_heuristic_no_model');
    assert.equal(row.jev.publicationReady, false);
    assert.ok(row.visual.svg.startsWith('<svg'));
    assert.match(row.visual.svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/u);
    assert.doesNotMatch(row.visual.svg.replace('xmlns="http://www.w3.org/2000/svg"',''), /<(?:script|image|foreignObject)\b|\bon\w+=|https?:|\b(?:href|src)=/iu);
    assert.ok(row.visual.alt.length > 25);
    for (const field of ['given', 'wanted', 'whyStrategy', 'check', 'shortTip']) assert.ok(row.packet.reasoning[field].length > 10);
    assert.ok(row.packet.reasoning.steps.length >= 2);
    assert.equal(row.packet.difficulty.estimatedOnly, true);
  }
  assert.equal(bank.activity.localJevScreens, 54);
  assert.deepEqual(bank.activity.externalCalls, {generator: 0, jev: 0, clef: 0, tts: 0});
  assert.equal(bank.generator.state, 'not_run');
  assert.equal(bank.generator.reason, 'no_authorized_text_generation_provider');
  assert.equal(bank.generator.fallbackQuestions, 0);
});

test('difficulty/Bloom reports describe tasks rather than learner-development evidence', async () => {
  const bank = await pilot();
  assert.equal(bank.measurement.learnerDevelopmentMeasured, false);
  assert.equal(bank.measurement.psychometricCalibration, false);
  assert.equal(bank.measurement.intuitionMeasured, false);
  assert.equal(bank.measurement.bloomMeaning, 'authored_task_demand_not_learner_measurement');
  assert.equal(bank.measurement.difficultyMeaning, 'author_estimate_not_empirical');
  assert.deepEqual(bank.plan.targetDifficultyPerCell, {easy: 5, medium: 15, hard: 15, very_hard: 15});
  assert.equal(bank.plan.difficultyProfileMet, false);
  assert.equal(Object.values(bank.measurement.bloomCounts).reduce((a, b) => a + b, 0), 54);
  assert.equal(Object.values(bank.measurement.difficultyCounts).reduce((a, b) => a + b, 0), 54);
  assert.equal(bank.answerBearingEditorArtifact, true);
  assert.equal(bank.learnerReady, false); assert.equal(bank.publicationReady, false);
});

test('wrong answers and stale sources fail independent packet verification', async () => {
  const bank = await pilot(), source = await blueprint();
  assert.equal(typeof api.verifyScience678Question, 'function');
  for (const row of bank.items) {
    const wrong = structuredClone(row.packet);
    wrong.question.correctOption = ['A', 'B', 'C', 'D'].find(key => key !== row.packet.question.correctOption);
    wrong.question.distractors=Object.fromEntries(['A','B','C','D'].filter(key=>key!==wrong.question.correctOption).map(key=>[key,'Test için değiştirilmiş anahtarın seçenek açıklaması.']));
    const result = api.verifyScience678Question(wrong, source);
    assert.equal(result.valid, false, row.packet.id);
    assert.equal(result.answerOraclePassed, false);
    assert.equal(result.answerOracle.valid,true);
  }
  const stale = structuredClone(bank.items[0].packet);
  stale.source.pdfSha256 = 'f'.repeat(64);
  const badSource = api.verifyScience678Question(stale, source);
  assert.equal(badSource.valid, false); assert.equal(badSource.sourceBindingPassed, false);
  const unknown = structuredClone(bank.items[0].packet); unknown.outcomeCode = 'FB.6.99.99'; unknown.question.outcomeCode = unknown.outcomeCode;
  assert.equal(api.verifyScience678Question(unknown, source).valid, false);
});

test('co-editing a claimed blueprint cannot mint a fake MEB outcome under a real PDF hash', async () => {
  const {createScienceAuthoringSeeds}=await import('../packages/content-factory/science_678_authoring_seeds.mjs');
  const packet=structuredClone(createScienceAuthoringSeeds()[0]),source=await blueprint();
  packet.outcomeCode='FB.6.99.99';packet.question.outcomeCode=packet.outcomeCode;
  source.pageEvidence.find(page=>page.id===packet.source.pageEvidenceId).verifiedOutcomeCodes.push(packet.outcomeCode);
  source.cells.find(cell=>cell.grade===packet.grade&&cell.branch===packet.branch).priorityFamilies.find(family=>family.id===packet.familyId).outcomeCodes.push(packet.outcomeCode);
  const result=api.verifyScience678Question(packet,source);
  assert.equal(result.valid,false);assert.equal(result.sourceBindingPassed,false);
});

test('malformed objects, approvals and unknown grades reject without executing caller hooks', async () => {
  const bank = await pilot(), source = await blueprint(); let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'id', {enumerable: true, get() {hooks++; return 'hostile';}});
  const proxy = new Proxy({}, {ownKeys() {hooks++; return [];}, get() {hooks++;}});
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cycle = {}; cycle.packet = cycle;
  for (const item of [getter, proxy, revoked.proxy, cycle, null, [], {...bank.items[0].packet, approved: true}, {...bank.items[0].packet, grade: 5}]) {
    assert.equal(api.verifyScience678Question(item, source).valid, false);
  }
  assert.equal(hooks, 0);
  await assert.rejects(() => api.buildScience678Pilot({count: 450}), /invalid_science_pilot_arguments/u);
});

test('repeat builds are immutable identical stock, not new questions or a model-speed benchmark', async () => {
  const one = await pilot(), two = await pilot();
  assert.equal(one.contentSha256, two.contentSha256);
  assert.equal(one.repeatedCallsCreateNewStock, false);
  assert.ok(Object.isFrozen(one)); assert.ok(Object.isFrozen(one.items[0].packet));
  const {contentSha256, ...body} = one;
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  assert.equal(contentSha256, createHash('sha256').update(`k12.science-678-pilot/v1:${JSON.stringify(canonical(body))}`).digest('hex'));
  assert.equal(Object.hasOwn(one, 'modelGenerationSeconds'), false);
});

test('displacement diagrams draw both measured levels at a shared scale and no answer label', async () => {
  const bank=await pilot();
  for(const row of bank.items.filter(item=>item.packet.familyId==='density_displacement')){
    const svg=row.visual.svg,levels=[];
    for(const sample of row.packet.model.inputs.samples){
      for(const [state,volume] of [['before',sample.before],['after',sample.after]]){
        const expression=new RegExp(`<rect data-sample="${sample.id}" data-state="${state}" data-volume="${volume}"[^>]* y="([0-9.]+)"[^>]* height="([0-9.]+)"`,'u');
        const match=svg.match(expression);assert.ok(match,`${sample.id}/${state}: measured fill missing`);
        levels.push({sample:sample.id,state,volume,y:Number(match[1]),height:Number(match[2])});
      }
    }
    for(let index=0;index<levels.length;index+=2){assert.ok(levels[index+1].y<levels[index].y);assert.ok(levels[index+1].height>levels[index].height);}
    assert.ok(levels.every(level=>Math.abs(level.height/level.volume-levels[0].height/levels[0].volume)<0.0001));
    assert.doesNotMatch(svg,/Daha yoğun|Yoğunluğu büyük|Doğru seçenek/u);
  }
});

test('given diagrams translate scientific condition labels instead of leaking engine tokens', async () => {
  const bank=await pilot();
  for(const {visual} of bank.items){
    assert.doesNotMatch(visual.svg,/>[^<]*(?:phenotypeChanged|oxygenate|distribute|copper|coarse|fine|thin|thick|juniper|\blow\b|\bhigh\b)[^<]*</u);
  }
});
