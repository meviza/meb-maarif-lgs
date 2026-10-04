import test from 'node:test';
import assert from 'node:assert/strict';

const api = await import('../packages/content-factory/science_678_oracle.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {}; throw error;
});
const claims = facts => ({A:{assertions:Object.entries(facts).map(([key,equals])=>({key,equals}))},
  B:{assertions:[{key:Object.keys(facts)[0],equals:'wrong-1'}]}, C:{assertions:[{key:Object.keys(facts)[0],equals:'wrong-2'}]}, D:{assertions:[{key:Object.keys(facts)[0],equals:'wrong-3'}]}});
const cases = [
  ['force_work_board','opposed_force',{arrows:[{direction:'right',magnitude:7},{direction:'left',magnitude:3}]},{resultantDirection:'right',balanced:false}],
  ['ray_path','reflection_normal',{incidentAngleNormal:35},{reflectionAngleNormal:35,angleRelation:'equal'}],
  ['experiment_board','fair_test',{targetVariable:'water',rows:[{id:'R1',water:'yes',light:'yes',temperature:'warm',seedCount:10},{id:'R2',water:'no',light:'yes',temperature:'warm',seedCount:10},{id:'R3',water:'no',light:'no',temperature:'warm',seedCount:10},{id:'R4',water:'yes',light:'yes',temperature:'warm',seedCount:20}]},{fairPair:'R1-R2',changedVariable:'water'}],
  ['matter_cards','particle_composition',{clusters:[['X','Y'],['X','Y'],['X','Y']]},{materialClass:'compound',distinctParticleTypes:1}],
  ['biology_graph','digestion_route',{organs:['stomach','large_intestine','mouth','small_intestine','esophagus'],start:'mouth',finish:'large_intestine'},{route:'mouth>esophagus>stomach>small_intestine>large_intestine'}],
  ['genetic_grid','one_trait_cross',{parent1:['A','a'],parent2:['A','a'],dominantAllele:'A'},{dominantPhenotypeParts:3,recessivePhenotypeParts:1,heterozygousParts:2,totalParts:4}],
];
for (const [kind,task,inputs,facts] of cases) test(`independent ${kind}/${task} derives literal expected facts without answer key`, () => {
  assert.equal(typeof api.solveScienceModel,'function','science model oracle is missing');
  const model = {kind,task,inputs,choices:claims(facts)}, before = JSON.stringify(model);
  const result = api.solveScienceModel(model);
  assert.equal(result.valid,true); assert.equal(result.uniqueOption,'A');
  assert.deepEqual(result.facts,facts); assert.deepEqual(result.optionTruth,{A:true,B:false,C:false,D:false});
  assert.equal(JSON.stringify(model),before);
});

test('two correct options and unknown facts cannot receive an exact-answer pass', () => {
  assert.equal(typeof api.solveScienceModel,'function');
  const model = {kind:'ray_path',task:'reflection_normal',inputs:{incidentAngleNormal:35},choices:claims({reflectionAngleNormal:35,angleRelation:'equal'})};
  model.choices.B = structuredClone(model.choices.A);
  assert.equal(api.solveScienceModel(model).valid,false);
  model.choices.B = {assertions:[{key:'notARealFact',equals:true}]};
  assert.equal(api.solveScienceModel(model).valid,false);
});

test('oracle rejects hooks, authority, extra arguments and impossible physical inputs', () => {
  assert.equal(typeof api.solveScienceModel,'function'); let hooks=0;
  const getter={};Object.defineProperty(getter,'kind',{enumerable:true,get(){hooks++;return 'ray_path';}});
  const proxy=new Proxy({},{ownKeys(){hooks++;return [];}});
  for(const candidate of [getter,proxy,null,[],{kind:'ray_path',task:'reflection_normal',inputs:{incidentAngleNormal:95},choices:claims({reflectionAngleNormal:95}),approved:true}]) {
    assert.equal(api.solveScienceModel(candidate).valid,false);
  }
  assert.equal(hooks,0); assert.equal(api.solveScienceModel({},{}).valid,false);
});

test('refraction, energy conservation and displaced volume require their physical conditions', () => {
  const specifications = [
    ['ray_path','refraction_path',{from:'air',to:'water',crossesBoundary:true}, {bend:'toward_normal',speedChange:'decreases'}, {obliqueIncidence:true}],
    ['force_work_board','energy_transition',{heightChange:'decreases',speedChange:'increases',frictionIgnored:true}, {potentialChange:'decreases',kineticChange:'increases',mechanicalEnergyChange:'same'}, {gravityOnly:true}],
    ['matter_cards','density_displacement',{equalMass:true,samples:[{id:'K',before:20,after:24},{id:'L',before:20,after:28}]}, {denserSample:'K'}, {fullySubmerged:true,insoluble:true}],
  ];
  for(const [kind,task,inputs,facts,conditions] of specifications){
    const model={kind,task,inputs,choices:claims(facts)};
    assert.equal(api.solveScienceModel(model).valid,false,`${task}: omitted condition`);
    model.inputs={...inputs,...conditions};assert.equal(api.solveScienceModel(model).valid,true,`${task}: explicit condition`);
    for(const field of Object.keys(conditions)){const invalid=structuredClone(model);invalid.inputs[field]=false;
      assert.equal(api.solveScienceModel(invalid).valid,false,`${task}: false ${field}`);}
  }
});

test('pure-substance phase evidence uses time, temperature and phase rather than shape recall', () => {
  const inputs={direction:'heating',pure:true,samePressure:true,rows:[
    {time:1,temperature:50,phases:['solid']},{time:2,temperature:60,phases:['solid','liquid']},
    {time:3,temperature:60,phases:['solid','liquid']},{time:4,temperature:70,phases:['liquid']}]};
  const facts={event:'melting',eventTemperature:60,constantDuringTransition:true};
  assert.equal(api.solveScienceModel({kind:'matter_cards',task:'phase_observation',inputs,choices:claims(facts)}).valid,true);
  const falsePlateau=structuredClone(inputs);falsePlateau.rows[2].temperature=62;
  assert.equal(api.solveScienceModel({kind:'matter_cards',task:'phase_observation',inputs:falsePlateau,choices:claims(facts)}).valid,false);
  const mixed=structuredClone(inputs);mixed.pure=false;
  assert.equal(api.solveScienceModel({kind:'matter_cards',task:'phase_observation',inputs:mixed,choices:claims(facts)}).valid,false);
});

test('separation changes with the requested product, not merely the mixture name', () => {
  for(const [target,method] of [['salt','evaporation'],['water','distillation']]){
    const model={kind:'matter_cards',task:'separation_method',inputs:{components:['salt','water'],target},choices:claims({method})};
    assert.equal(api.solveScienceModel(model).valid,true);
  }
  assert.equal(api.solveScienceModel({kind:'matter_cards',task:'separation_method',inputs:{components:['salt','water'],target:'both'},choices:claims({method:'evaporation'})}).valid,false);
});

test('a selected-organ route respects requested start and finish rather than always beginning at mouth', () => {
  const inputs={organs:['small_intestine','mouth','large_intestine','esophagus','stomach'],start:'stomach',finish:'large_intestine'};
  const model={kind:'biology_graph',task:'digestion_route',inputs,choices:claims({route:'stomach>small_intestine>large_intestine'})};
  assert.equal(api.solveScienceModel(model).valid,true);
  model.inputs.start='large_intestine';model.inputs.finish='stomach';
  assert.equal(api.solveScienceModel(model).valid,false);
});

test('modification requires an observed phenotype change, not an environment change alone', () => {
  const choices=claims({classification:'modification',canBeInherited:false});
  const input={dnaSequenceChanged:false,environmentChanged:true,cellType:'somatic'};
  const model={kind:'biology_graph',task:'mutation_modification',inputs:input,choices};
  assert.equal(api.solveScienceModel(model).valid,false,'missing phenotype condition');
  model.inputs={...input,phenotypeChanged:false};
  assert.equal(api.solveScienceModel(model).valid,false,'no trait change observed');
  model.inputs.phenotypeChanged=true;
  assert.equal(api.solveScienceModel(model).valid,true,'environment-driven trait change with unchanged DNA');
  model.inputs.environmentChanged=false;
  assert.equal(api.solveScienceModel(model).valid,false,'unexplained trait change');
  model.inputs={dnaSequenceChanged:true,environmentChanged:false,cellType:'gamete',phenotypeChanged:false};
  model.choices=claims({classification:'mutation',canBeInherited:true});
  assert.equal(api.solveScienceModel(model).valid,true,'DNA changes can occur without a visible phenotype change');
});

test('solid pressure compares one controlled variable without requiring a numeric pressure formula', () => {
  const variants=[
    [{weightOrder:'equal',contactAreaOrder:'K>L'},'L'],
    [{weightOrder:'K>L',contactAreaOrder:'equal'},'K'],
    [{weightOrder:'K<L',contactAreaOrder:'equal'},'L'],
    [{weightOrder:'equal',contactAreaOrder:'equal'},'equal'],
  ];
  for(const [inputs,greaterPressure] of variants){
    assert.equal(api.solveScienceModel({kind:'experiment_board',task:'solid_pressure',inputs,choices:claims({greaterPressure})}).valid,true);
  }
  assert.equal(api.solveScienceModel({kind:'experiment_board',task:'solid_pressure',inputs:{weightOrder:'K>L',contactAreaOrder:'K>L'},choices:claims({greaterPressure:'K'})}).valid,false,'two varying quantities do not determine a qualitative order');
});

test('liquid depth comparison supports the same vessel as well as differing vessel shapes', () => {
  for(const vesselShapeDifferent of [false,true]){
    const model={kind:'experiment_board',task:'liquid_pressure',inputs:{sameLiquid:true,depthOrder:'K>L',vesselShapeDifferent},choices:claims({greaterPressure:'K'})};
    assert.equal(api.solveScienceModel(model).valid,true);
    model.inputs.sameLiquid=false;
    assert.equal(api.solveScienceModel(model).valid,false,'different liquids need an additional density condition');
  }
});

test('the current force visual contract accepts exactly two arrows, not clipped extra arrows', () => {
  const model={kind:'force_work_board',task:'opposed_force',inputs:{arrows:[{direction:'right',magnitude:7},{direction:'left',magnitude:3},{direction:'left',magnitude:1},{direction:'right',magnitude:1}]},choices:claims({resultantDirection:'right',balanced:false})};
  assert.equal(api.solveScienceModel(model).valid,false,'unsupported visual cardinality must fail closed');
});
