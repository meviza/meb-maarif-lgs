import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

let moduleUnderTest;
try { moduleUnderTest = await import('../packages/content-factory/science_678_authoring_seeds.mjs'); }
catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
function seeds() {
  assert.equal(typeof moduleUnderTest?.createScienceAuthoringSeeds, 'function', 'Original fixed science seeds must be implemented');
  return moduleUnderTest.createScienceAuthoringSeeds();
}
const expectedFamilies = [
  [6,'physics','force_opposed_arrows','FB.6.2.1',116],
  [6,'physics','reflection_normal','FB.6.4.2',127],
  [6,'physics','circuit_fair_variable','FB.6.6.2',138],
  [6,'chemistry','density_displacement','FB.6.5.3',132],
  [6,'chemistry','phase_identification','FB.6.5.2',132],
  [6,'chemistry','ice_water_density','FB.6.5.5',132],
  [6,'biology','germination_control','FB.6.3.3',120],
  [6,'biology','reproduction_comparison','FB.6.3.1',120],
  [6,'biology','biodiversity_evidence','FB.6.7.1',142],
  [7,'physics','work_direction','FB.7.2.1',152],
  [7,'physics','kinetic_potential_transform','FB.7.2.3',152],
  [7,'physics','refraction_path','FB.7.4.1',165],
  [7,'chemistry','particle_element_compound','FB.7.5.4',169],
  [7,'chemistry','dissolution_fair_test','FB.7.5.9',169],
  [7,'chemistry','separation_method','FB.7.5.10',169],
  [7,'biology','digestion_route','FB.7.3.1',156],
  [7,'biology','circulation_route','FB.7.3.3',156],
  [7,'biology','food_web_roles','FB.7.7.1',181],
  [8,'physics','solid_pressure_control','F.8.3.1.1',51],
  [8,'physics','liquid_depth_control','F.8.3.1.2',51],
  [8,'physics','machine_work_tradeoff','F.8.5.1.1',53],
  [8,'chemistry','periodic_pattern','F.8.4.1.2',52],
  [8,'chemistry','pH_classification','F.8.4.4.4',52],
  [8,'chemistry','chemical_new_substance','F.8.4.2.1',52],
  [8,'biology','one_trait_cross','F.8.2.2.2',50],
  [8,'biology','mutation_modification','F.8.2.3.3',50],
  [8,'biology','photosynthesis_control','F.8.6.2.2',54],
];
const currentSha='a56aab9c648f8293341be3f70c0b49e644ecb1d56be9fcaa200d6419bf1eeb97';
const legacySha='3a8aa21327083bf15c33b9c404f299ff784b11d26024522a8c24b61387c8c0c1';

test('Fixed authoring preview has six items in each of nine cells, never the450 production target',()=>{
  const result=seeds(); assert.equal(result.length,54);
  for(const grade of [6,7,8]) for(const branch of ['physics','chemistry','biology']) {
    const cell=result.filter(row=>row.grade===grade&&row.branch===branch);
    assert.equal(cell.length,6); assert.equal(new Set(cell.map(row=>row.familyId)).size,3);
  }
  assert.equal(new Set(result.map(row=>row.id)).size,54);
});
test('Only the27 source-scoped family proposals receive exactly two variants',()=>{
  const result=seeds(); assert.equal(new Set(result.map(row=>row.familyId)).size,27);
  for(const [grade,branch,family,code,page] of expectedFamilies) {
    const rows=result.filter(row=>row.familyId===family);
    assert.deepEqual(rows.map(row=>row.variant).sort(),[1,2]);
    for(const row of rows) {assert.equal(row.grade,grade);assert.equal(row.branch,branch);assert.equal(row.outcomeCode,code);assert.equal(row.source.physicalPdfPage,page);}
  }
});
test('All source bindings identify actual source revisions and verified physical pages',async()=>{
  const result=seeds();const blueprint=JSON.parse(await readFile(new URL('../sources/science-678-source-blueprint.json',import.meta.url),'utf8'));
  for(const row of result) {
    const expectedId=row.grade===8?'legacy-2018-fen-bilimleri':'tymm-current-fen-bilimleri';
    assert.equal(row.source.sourceId,expectedId);assert.equal(row.source.pdfSha256,row.grade===8?legacySha:currentSha);
    assert.equal(row.source.pageEvidenceId,`${expectedId}:p${row.source.physicalPdfPage}`);
    const page=blueprint.pageEvidence.find(p=>p.id===row.source.pageEvidenceId);
    assert.ok(page);assert.ok(page.verifiedOutcomeCodes.includes(row.outcomeCode));
  }
});
test('Every multiple choice has four distinct options, three explanations and evidence-based reasoning',()=>{
  for(const row of seeds()) {
    const q=row.question;assert.deepEqual(Object.keys(q.options),['A','B','C','D']);
    assert.equal(new Set(Object.values(q.options)).size,4);assert.ok(['A','B','C','D'].includes(q.correctOption));
    assert.deepEqual(Object.keys(q.distractors).sort(),['A','B','C','D'].filter(k=>k!==q.correctOption));
    assert.equal(q.grade,row.grade);assert.equal(q.branch,row.branch);assert.equal(q.outcomeCode,row.outcomeCode);
    assert.ok(q.stimulus.length>=30);assert.ok(q.stem.endsWith('?'));
    for(const key of ['given','wanted','whyStrategy','check','shortTip'])assert.ok(row.reasoning[key].length>15,key);
    assert.ok(row.reasoning.steps.length>=2);
    for(const step of row.reasoning.steps)for(const key of ['because','action','result','meaning'])assert.ok(step[key].length>8,key);
  }
});
test('Six finite scientific model kinds contain no declared answer or truth flags',()=>{
  const result=seeds(); assert.deepEqual([...new Set(result.map(r=>r.model.kind))].sort(),
    ['biology_graph','experiment_board','force_work_board','genetic_grid','matter_cards','ray_path']);
  for(const row of result){assert.deepEqual(Object.keys(row.model),['kind','task','inputs','choices']);
    assert.deepEqual(Object.keys(row.model.choices),['A','B','C','D']);
    assert.ok(!/"(?:correctOption|answerIndex|expectedFacts|truthFlags|correct|expected)"/u.test(JSON.stringify(row.model)));
    for(const choice of Object.values(row.model.choices)){assert.deepEqual(Object.keys(choice),['assertions']);assert.ok(choice.assertions.length>=1);
      for(const claim of choice.assertions){assert.deepEqual(Object.keys(claim),['key','equals']);assert.equal(typeof claim.key,'string');}}
  }
});
test('Visual descriptions refer to given model evidence rather than supplying the answer',()=>{
  for(const row of seeds()){assert.deepEqual(Object.keys(row.visualSpec),['kind','modelRef','alt']);
    assert.equal(row.visualSpec.modelRef,'model.inputs');assert.ok(row.visualSpec.alt.length>=30);
    assert.ok(!/Doğru cevap|Doğru seçenek|Cevap [A-D]|Çözüm:/u.test(row.visualSpec.alt));
  }
});
test('Bloom labels describe task demand with an explicit evidence rationale, never child development',()=>{
  for(const row of seeds()){const c=row.cognitiveIntent;
    assert.ok(['remember','understand','apply','analyze','evaluate'].includes(c.level));
    assert.ok(['factual','conceptual','procedural','metacognitive'].includes(c.knowledgeDimension));
    assert.ok(c.evidence.length>15);assert.ok(c.rationale.length>15);
    assert.equal(row.difficulty.estimatedOnly,true);assert.ok(['easy','medium','hard','very_hard'].includes(row.difficulty.level));assert.ok(row.difficulty.rationale.length>15);
  }
});
test('Source exclusions remain absent from all54 questions and model tasks',()=>{
  const result=seeds();
  assert.ok(!result.some(r=>r.grade===6&&/speed|velocity|distance_time|surat|sürat/u.test(r.model.task)));
  assert.ok(!result.some(r=>r.grade===8&&/pressure_equation|rho|torque|reaction_formula|Qmc|deltaT|biochemical/u.test(JSON.stringify(r.model))));
  assert.ok(!result.some(r=>r.grade===6&&r.model.task==='particle_composition'));
  for(const row of result.filter(r=>r.grade===8&&r.branch==='physics'))assert.ok(!/P\s*=|F\s*\/\s*A|ρ|\bgh\b/u.test(row.question.stimulus+' '+row.question.detailedSolution));
});
test('Two variants differ in actual evidence or task context, not merely id/outcome labels',()=>{
  for(const [, ,family] of expectedFamilies){const [a,b]=seeds().filter(r=>r.familyId===family);
    assert.notEqual(a.question.stimulus,b.question.stimulus);assert.notEqual(a.question.stem,b.question.stem);
    assert.notEqual(JSON.stringify(a.model.inputs),JSON.stringify(b.model.inputs));
  }
});
test('Repeated reads preserve immutable fixed seeds and perform no input-driven generation',()=>{
  const first=seeds(),second=seeds();assert.deepEqual(first,second);assert.ok(Object.isFrozen(first));
  assert.ok(Object.isFrozen(first[0].question.options));assert.ok(Object.isFrozen(first[0].model.inputs));
  assert.throws(()=>{first[0].question.correctOption='D';},TypeError);
  assert.throws(()=>moduleUnderTest.createScienceAuthoringSeeds({count:450}),/fixed_science_seed_api/u);
  let hooks=0;assert.throws(()=>moduleUnderTest.createScienceAuthoringSeeds({get count(){hooks++;return450;}}),/fixed_science_seed_api/u);assert.equal(hooks,0);
});
test('Water-to-air transmitted oblique ray uses the agreed away-from-normal claim key',()=>{
  const row=seeds().find(r=>r.id==='SCI-G7-refraction_path-V2');
  assert.equal(row.model.inputs.obliqueIncidence,true);assert.equal(row.model.inputs.crossesBoundary,true);
  assert.ok(Object.values(row.model.choices).some(c=>c.assertions.some(a=>a.key==='bend'&&a.equals==='away_from_normal')));
  assert.ok(!JSON.stringify(row.model.choices).includes('away_normal'));
});
test('Natural-language words and following numbers are separated for readable Turkish typography',()=>{
  for(const row of seeds()){
    const text=[row.question.stimulus,row.question.stem,row.question.detailedSolution,...Object.values(row.question.options),
      ...Object.values(row.question.distractors),row.visualSpec.alt,...Object.values(row.reasoning).filter(v=>typeof v==='string'),
      ...row.reasoning.steps.flatMap(Object.values)].join(' ');
    assert.ok(!/\p{L}{2,}\d/u.test(text),row.id);
  }
});
test('Control-pair options use Turkish labels while finite model variable keys stay stable',()=>{
  for(const row of seeds().filter(r=>r.model.task==='fair_test')){
    for(const text of Object.values(row.question.options))assert.ok(!/Yalnız (?:length|thickness|water|air|waterTemperature|stirring|light|carbonDioxide) /u.test(text),row.id);
  }
});
test('Visible modification and nonvisible DNA mutation distinguish phenotype evidence',()=>{
  const rows=seeds().filter(r=>r.familyId==='mutation_modification');
  assert.equal(rows[0].model.inputs.phenotypeChanged,true);
  assert.equal(rows[1].model.inputs.phenotypeChanged,false);
  assert.match(rows[1].question.stimulus,/görünüm/u);
});
test('Relative-density alternatives stay within the given K-L comparison, not an unprovided water-density claim',()=>{
  for(const row of seeds().filter(r=>r.model.task==='density_displacement')) {
    for(const [letter,option] of Object.entries(row.model.choices)) {
      const claim=option.assertions.find(a=>a.key==='denserSample');
      assert.ok(claim);
      assert.doesNotMatch(row.question.options[letter],/sudan|suya göre/u,row.id);
      if(claim.equals==='neither') {
        assert.match(row.question.options[letter],/karşılaştırılamaz|seçilemez/u,row.id);
        assert.doesNotMatch(row.question.distractors[letter],/batma koşuluyla.*bağdaşmaz/u,row.id);
      }
    }
  }
});
test('All-forces distractors assert mechanical work, not equality of unmeasured work amounts',()=>{
  for(const row of seeds().filter(r=>r.model.task==='work_direction')) {
    const letter=Object.keys(row.model.choices).find(k=>row.model.choices[k].assertions.some(a=>a.equals==='all_forces'));
    assert.match(row.question.options[letter],/her kuvvet|bütün kuvvetler/u,row.id);
    assert.match(row.question.options[letter],/iş yapar/u,row.id);
    assert.doesNotMatch(row.question.options[letter],/iş aynıdır|işi aynıdır/u,row.id);
  }
});
test('Wrong K-density explanation addresses inverted equal-mass volume reasoning, not a strategy that still selects L',()=>{
  const row=seeds().find(r=>r.id==='SCI-G6-density_displacement-V2');
  const letter=Object.keys(row.model.choices).find(k=>row.model.choices[k].assertions.some(a=>a.equals==='K'));
  assert.match(row.question.distractors[letter],/büyük hacim|hacmi daha büyük/u);
  assert.doesNotMatch(row.question.distractors[letter],/Son su düzeyleri/u);
});
test('Each germination comparison specifies the seed count per setup, not an ambiguous total across setups',()=>{
  const row=seeds().find(r=>r.id==='SCI-G6-germination_control-V2');
  assert.ok(row.model.inputs.rows.every(r=>r.seedCount===12));
  assert.match(row.question.stimulus,/Her birinde.*12 tohum/u);
});
test('Each authored variant has a specific task-demand and difficulty rationale, never an empirical student claim',()=>{
  const result=seeds();
  assert.equal(new Set(result.map(r=>r.cognitiveIntent.rationale)).size,54);
  assert.equal(new Set(result.map(r=>r.difficulty.rationale)).size,54);
  for(const row of result) {
    assert.notEqual(row.cognitiveIntent.evidence,row.question.stem,row.id);
    assert.ok(!row.cognitiveIntent.rationale.includes(row.question.stem),row.id);
    assert.match(row.cognitiveIntent.rationale,/yazar|Yazar/u,row.id);
    assert.match(row.difficulty.rationale,/kalibre edilmedi/u,row.id);
    assert.equal(row.difficulty.estimatedOnly,true);
  }
});
test('Demand and load notes address the actual density, circuit and crossing evidence rather than a shared slogan',()=>{
  const result=seeds();
  const density=result.find(r=>r.id==='SCI-G6-density_displacement-V2');
  assert.match(density.difficulty.rationale,/[Bb]aşlangıç.*30.*10|30.*10.*[Bb]aşlangıç/u);
  assert.match(density.cognitiveIntent.evidence,/hacim.*artış|artış.*hacim/u);
  const circuit=result.find(r=>r.id==='SCI-G6-circuit_fair_variable-V1');
  assert.match(circuit.difficulty.rationale,/[Dd]ört|4/u);
  assert.match(circuit.cognitiveIntent.evidence,/uzunlu[kğ]/u);
  const cross=result.find(r=>r.id==='SCI-G8-one_trait_cross-V2');
  assert.match(cross.difficulty.rationale,/Aa.*aa/u);
  assert.match(cross.cognitiveIntent.evidence,/heterozigot/u);
});
test('Liquid-width evidence notes do not claim a vessel illustration for a given-condition card',()=>{
  const row=seeds().find(r=>r.id==='SCI-G8-liquid_depth_control-V2');
  assert.equal(row.model.inputs.vesselShapeDifferent,true);
  assert.equal(row.model.inputs.depthOrder,'equal');
  assert.doesNotMatch(row.difficulty.rationale,/Görsel kap genişliği/u);
  assert.match(row.difficulty.rationale,/[Vv]erilen kap genişliği/u);
});
