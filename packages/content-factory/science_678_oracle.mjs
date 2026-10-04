import { closedScienceObject as closed, inertScienceData, freezeScienceData } from './science_678_data.mjs';

// These deliberately finite scientific rules are independently implemented from
// authoring choices. They prove structured claims under their explicit conditions,
// not all free-text prose, pedagogy, source copyright or real learner performance.
const fail=()=>{throw new Error('unsupported_or_ambiguous_science_model');};
const demand=(condition)=>{if(!condition)fail();};
const exactly=(value,keys)=>demand(closed(value,keys));
const number=(value,min=0,max=10000)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
const id=value=>typeof value==='string'&&/^[A-Za-z][A-Za-z0-9_]{0,24}$/u.test(value);
const array=(value,min=1,max=16)=>Array.isArray(value)&&value.length>=min&&value.length<=max;
const direction=value=>['left','right','up','down'].includes(value);
const sortedPair=(a,b)=>[a,b].sort().join('-');

function force(task,x) {
  if(task==='opposed_force'){
    // The pilot drawing contract supports two collinear forces only.
    exactly(x,['arrows']);demand(array(x.arrows,2,2));const horizontal=[],vertical=[];
    for(const arrow of x.arrows){exactly(arrow,['direction','magnitude']);demand(direction(arrow.direction)&&number(arrow.magnitude,1,100));
      (['left','right'].includes(arrow.direction)?horizontal:vertical).push(arrow);}
    demand(horizontal.length===x.arrows.length||vertical.length===x.arrows.length);
    const sum=x.arrows.reduce((total,arrow)=>total+(['right','up'].includes(arrow.direction)?1:-1)*arrow.magnitude,0);
    return {resultantDirection:sum===0?'none':horizontal.length?(sum>0?'right':'left'):(sum>0?'up':'down'),balanced:sum===0};
  }
  if(task==='work_direction'){
    exactly(x,['forceDirection','displacementDirection']);demand(direction(x.forceDirection)&&direction(x.displacementDirection));
    const horizontal=d=>['left','right'].includes(d);
    demand(x.forceDirection===x.displacementDirection||horizontal(x.forceDirection)!==horizontal(x.displacementDirection));
    return {mechanicalWork:x.forceDirection===x.displacementDirection?'done':'none'};
  }
  if(task==='energy_transition'){
    exactly(x,['heightChange','speedChange','frictionIgnored','gravityOnly']);demand(x.frictionIgnored===true&&x.gravityOnly===true
      &&['increases','decreases','same'].includes(x.heightChange)&&['increases','decreases','same'].includes(x.speedChange)
      && (x.heightChange==='same'?x.speedChange==='same':x.heightChange!==x.speedChange&&x.speedChange!=='same'));
    return {potentialChange:x.heightChange,kineticChange:x.speedChange,mechanicalEnergyChange:'same'};
  }
  if(task==='machine_tradeoff'){
    exactly(x,['machine','ideal','loadSame']);demand(x.ideal===true&&x.loadSame===true&&['movable_pulley','fixed_pulley'].includes(x.machine));
    return {forceNeeded:x.machine==='movable_pulley'?'less':'same',pulledDistance:x.machine==='movable_pulley'?'more':'same',workSaved:false};
  }fail();
}
function ray(task,x){
  if(task==='reflection_normal'){exactly(x,['incidentAngleNormal']);demand(number(x.incidentAngleNormal,1,89));return {reflectionAngleNormal:x.incidentAngleNormal,angleRelation:'equal'};}
  if(task==='refraction_path'){exactly(x,['from','to','crossesBoundary','obliqueIncidence']);demand(x.crossesBoundary===true&&x.obliqueIncidence===true&&['air','water'].includes(x.from)
    &&['air','water'].includes(x.to)&&x.from!==x.to);return {bend:x.to==='water'?'toward_normal':'away_from_normal',speedChange:x.to==='water'?'decreases':'increases'};}
  fail();
}
function experiment(task,x){
  if(task==='fair_test'){
    exactly(x,['targetVariable','rows']);demand(array(x.rows,2,8));
    const allowed=['water','air','light','temperature','seedCount','length','thickness','material','batteryCount',
      'waterTemperature','stirring','grainSize','waterAmount','carbonDioxide','plantCount'];
    const keys=Object.keys(x.rows[0]);demand(keys.includes('id')&&keys.includes(x.targetVariable)&&allowed.includes(x.targetVariable)
      &&keys.every(key=>key==='id'||allowed.includes(key))&&keys.length>=3);
    for(const row of x.rows){exactly(row,keys);demand(id(row.id));for(const key of keys.filter(key=>key!=='id'))demand(['string','number','boolean'].includes(typeof row[key]));}
    demand(new Set(x.rows.map(row=>row.id)).size===x.rows.length);
    const pairs=[];for(let i=0;i<x.rows.length;i++)for(let j=i+1;j<x.rows.length;j++){
      const differences=keys.filter(key=>key!=='id'&&x.rows[i][key]!==x.rows[j][key]);
      if(differences.length===1&&differences[0]===x.targetVariable)pairs.push(sortedPair(x.rows[i].id,x.rows[j].id));
    }
    demand(pairs.length===1);return {fairPair:pairs[0],changedVariable:x.targetVariable};
  }
  if(task==='solid_pressure'){
    exactly(x,['weightOrder','contactAreaOrder']);demand(['K>L','K<L','equal'].includes(x.weightOrder)&&['K>L','K<L','equal'].includes(x.contactAreaOrder)
      &&(x.weightOrder==='equal'||x.contactAreaOrder==='equal'));
    return {greaterPressure:x.weightOrder!=='equal'?(x.weightOrder==='K>L'?'K':'L'):x.contactAreaOrder==='equal'?'equal':x.contactAreaOrder==='K>L'?'L':'K'};
  }
  if(task==='liquid_pressure'){
    exactly(x,['sameLiquid','depthOrder','vesselShapeDifferent']);demand(x.sameLiquid===true&&typeof x.vesselShapeDifferent==='boolean'&&['K>L','K<L','equal'].includes(x.depthOrder));
    return {greaterPressure:x.depthOrder==='equal'?'equal':x.depthOrder==='K>L'?'K':'L'};
  }fail();
}
function matter(task,x){
  if(task==='phase_observation'){
    exactly(x,['direction','pure','samePressure','rows']);demand(['heating','cooling'].includes(x.direction)&&x.pure===true&&x.samePressure===true&&array(x.rows,4,4));
    for(const row of x.rows){exactly(row,['time','temperature','phases']);demand(number(row.time,0,100)&&number(row.temperature,-100,500)
      &&array(row.phases,1,2)&&row.phases.every(phase=>['solid','liquid','gas'].includes(phase))&&new Set(row.phases).size===row.phases.length);}
    demand(x.rows.every((row,i)=>i===0||row.time>x.rows[i-1].time));
    const [before,middle,next,after]=x.rows,pair=[...middle.phases].sort().join('-');
    demand(middle.phases.length===2&&next.phases.length===2&&pair===[...next.phases].sort().join('-')&&middle.temperature===next.temperature
      &&before.phases.length===1&&after.phases.length===1);
    const relation=x.direction==='heating'?(before.temperature<middle.temperature&&after.temperature>middle.temperature):(before.temperature>middle.temperature&&after.temperature<middle.temperature);
    demand(relation);let event;
    if(pair==='liquid-solid'){demand(before.phases[0]===(x.direction==='heating'?'solid':'liquid')&&after.phases[0]===(x.direction==='heating'?'liquid':'solid'));event=x.direction==='heating'?'melting':'freezing';}
    else if(pair==='gas-liquid'){demand(before.phases[0]===(x.direction==='heating'?'liquid':'gas')&&after.phases[0]===(x.direction==='heating'?'gas':'liquid'));event=x.direction==='heating'?'boiling':'condensing';}
    else fail();return {event,eventTemperature:middle.temperature,constantDuringTransition:true};
  }
  if(task==='particle_composition'){
    exactly(x,['clusters']);demand(array(x.clusters,2,8));
    for(const cluster of x.clusters)demand(array(cluster,1,4)&&cluster.every(symbol=>['X','Y','Z'].includes(symbol)));
    const kinds=new Set(x.clusters.map(cluster=>[...cluster].sort().join(''))),symbols=new Set(x.clusters.flat());
    return {materialClass:kinds.size>1?'mixture':symbols.size>1?'compound':'element',distinctParticleTypes:kinds.size};
  }
  if(task==='density_displacement'){
    exactly(x,['equalMass','samples','fullySubmerged','insoluble']);demand(x.equalMass===true&&x.fullySubmerged===true&&x.insoluble===true&&array(x.samples,2,2));
    for(const sample of x.samples){exactly(sample,['id','before','after']);demand(id(sample.id)&&number(sample.before,1,1000)&&number(sample.after,1,1000)&&sample.after>sample.before);}
    demand(x.samples[0].id!==x.samples[1].id);const volumes=x.samples.map(sample=>sample.after-sample.before);demand(volumes[0]!==volumes[1]);
    return {denserSample:x.samples[volumes[0]<volumes[1]?0:1].id};
  }
  if(task==='phase_properties'){
    exactly(x,['fixedShape','fixedVolume']);demand(typeof x.fixedShape==='boolean'&&typeof x.fixedVolume==='boolean'&&(!x.fixedShape||x.fixedVolume));
    return {phase:x.fixedShape?'solid':x.fixedVolume?'liquid':'gas'};
  }
  if(task==='ice_density'){
    exactly(x,['scenario','comparison']);demand(['floating','freezing'].includes(x.scenario)&&['equal_volume','equal_mass'].includes(x.comparison));
    return {denser:'water',iceVolumeAtEqualMass:'greater',iceMassAtEqualVolume:'less'};
  }
  if(task==='separation_method'){
    exactly(x,['components','target']);demand(array(x.components,2,2)&&[...x.components].sort().join('-')==='salt-water'&&['salt','water'].includes(x.target));
    return {method:x.target==='salt'?'evaporation':'distillation'};
  }
  if(task==='periodic_pattern'){
    exactly(x,['elements','target']);demand(array(x.elements,3,4)&&['same_group_pair','same_period_pair'].includes(x.target));
    for(const element of x.elements){exactly(element,['id','group','period']);demand(id(element.id)&&Number.isInteger(element.group)&&number(element.group,1,18)&&Number.isInteger(element.period)&&number(element.period,1,7));}
    demand(new Set(x.elements.map(element=>element.id)).size===x.elements.length);
    const field=x.target==='same_group_pair'?'group':'period',matches=[];
    for(let i=0;i<x.elements.length;i++)for(let j=i+1;j<x.elements.length;j++)if(x.elements[i][field]===x.elements[j][field])matches.push(sortedPair(x.elements[i].id,x.elements[j].id));
    demand(matches.length===1);return {pair:matches[0],locationRule:field==='group'?'same_column':'same_row'};
  }
  if(task==='pH_classification'){exactly(x,['samplePH']);demand(number(x.samplePH,0,14));return {category:x.samplePH<7?'acidic':x.samplePH>7?'basic':'neutral'};}
  if(task==='new_substance'){exactly(x,['process']);demand(['iron_rusting','paper_tearing'].includes(x.process));return {changeType:x.process==='iron_rusting'?'chemical':'physical',newSubstanceFormed:x.process==='iron_rusting'};}
  fail();
}
const DIGESTION=['mouth','esophagus','stomach','small_intestine','large_intestine'];
const PRODUCERS=['grass','algae','plant'];
function biology(task,x){
  if(task==='digestion_route'){
    exactly(x,['organs','start','finish']);const start=DIGESTION.indexOf(x.start),finish=DIGESTION.indexOf(x.finish);
    demand(array(x.organs,5,5)&&new Set(x.organs).size===5&&DIGESTION.every(organ=>x.organs.includes(organ))&&start>=0&&finish>start);
    return {route:DIGESTION.slice(start,finish+1).join('>')};
  }
  if(task==='reproduction_compare'){exactly(x,['method']);demand(['budding','seed_from_fertilization'].includes(x.method));return {reproductionType:x.method==='budding'?'asexual':'sexual',gameteFusion:x.method!=='budding'};}
  if(task==='biodiversity_evidence'){
    exactly(x,['sites','sameSampleArea']);demand(x.sameSampleArea===true&&array(x.sites,2,2));
    for(const site of x.sites){exactly(site,['id','species']);demand(id(site.id)&&array(site.species,1,8)&&site.species.every(id));}
    const counts=x.sites.map(site=>new Set(site.species).size);demand(counts[0]!==counts[1]&&x.sites[0].id!==x.sites[1].id);
    return {richerSite:x.sites[counts[0]>counts[1]?0:1].id,criterion:'distinct_species'};
  }
  if(task==='circulation_route'){exactly(x,['purpose']);demand(['oxygenate','distribute'].includes(x.purpose));return {route:x.purpose==='oxygenate'?'heart>lungs>heart':'heart>body>heart',circulationType:x.purpose==='oxygenate'?'pulmonary':'systemic'};}
  if(task==='food_web_roles'){
    exactly(x,['edges','target']);demand(array(x.edges,2,6)&&id(x.target));
    for(const edge of x.edges)demand(array(edge,2,2)&&edge.every(id)&&edge[0]!==edge[1]);
    const nodes=new Set(x.edges.flat()),roots=[...nodes].filter(node=>!x.edges.some(edge=>edge[1]===node));
    demand(roots.length===1&&PRODUCERS.includes(roots[0])&&nodes.has(x.target));
    const levels=new Map([[roots[0],0]]);for(let pass=0;pass<nodes.size;pass++)for(const [from,to] of x.edges){
      if(levels.has(from)){const level=levels.get(from)+1;if(levels.has(to)&&levels.get(to)!==level)fail();levels.set(to,level);}
    }
    demand(levels.size===nodes.size);const level=levels.get(x.target),foods=x.edges.filter(edge=>edge[1]===x.target).map(edge=>edge[0]).sort();
    demand(level>=1&&level<=2&&foods.length===1);return {role:level===1?'primary_consumer':'secondary_consumer',food:foods[0]};
  }
  if(task==='mutation_modification'){
    exactly(x,['dnaSequenceChanged','environmentChanged','cellType','phenotypeChanged']);demand(typeof x.dnaSequenceChanged==='boolean'&&typeof x.environmentChanged==='boolean'
      &&typeof x.phenotypeChanged==='boolean'&&['somatic','gamete'].includes(x.cellType)
      &&(x.dnaSequenceChanged||(x.environmentChanged&&x.phenotypeChanged)));
    return {classification:x.dnaSequenceChanged?'mutation':'modification',canBeInherited:x.dnaSequenceChanged&&x.cellType==='gamete'};
  }fail();
}
function genetic(task,x){
  demand(task==='one_trait_cross');exactly(x,['parent1','parent2','dominantAllele']);
  demand(/^[A-Z]$/u.test(x.dominantAllele));const dominant=x.dominantAllele,recessive=dominant.toLowerCase();
  demand(array(x.parent1,2,2)&&array(x.parent2,2,2)&&[...x.parent1,...x.parent2].every(allele=>[dominant,recessive].includes(allele)));
  let dominantPhenotypeParts=0,recessivePhenotypeParts=0,heterozygousParts=0;
  for(const a of x.parent1)for(const b of x.parent2){if(a===dominant||b===dominant)dominantPhenotypeParts++;else recessivePhenotypeParts++;if(a!==b)heterozygousParts++;}
  return {dominantPhenotypeParts,recessivePhenotypeParts,heterozygousParts,totalParts:4};
}
const DERIVE={force_work_board:force,ray_path:ray,experiment_board:experiment,matter_cards:matter,biology_graph:biology,genetic_grid:genetic};
export function solveScienceModel(input){
  const rejected=()=>freezeScienceData({valid:false,facts:null,optionTruth:null,uniqueOption:null,reasons:['unsupported_or_ambiguous_science_model'],proves:'structured_claims_only'});
  if(arguments.length!==1)return rejected();
  try{
    const model=inertScienceData(input);exactly(model,['kind','task','inputs','choices']);
    demand(Object.hasOwn(DERIVE,model.kind)&&typeof model.task==='string');exactly(model.choices,['A','B','C','D']);
    const facts=DERIVE[model.kind](model.task,model.inputs),optionTruth={};
    for(const letter of ['A','B','C','D']){
      const choice=model.choices[letter];exactly(choice,['assertions']);demand(array(choice.assertions,1,6));
      const keys=[];for(const assertion of choice.assertions){exactly(assertion,['key','equals']);demand(Object.hasOwn(facts,assertion.key)
        && ['string','number','boolean'].includes(typeof assertion.equals)&&!keys.includes(assertion.key));keys.push(assertion.key);}
      optionTruth[letter]=choice.assertions.every(assertion=>Object.is(facts[assertion.key],assertion.equals));
    }
    const correct=Object.keys(optionTruth).filter(letter=>optionTruth[letter]);demand(correct.length===1);
    return freezeScienceData({valid:true,facts,optionTruth,uniqueOption:correct[0],reasons:[],proves:'structured_claims_only'});
  }catch{return rejected();}
}
