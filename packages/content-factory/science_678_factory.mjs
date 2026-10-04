import { constants, lstat, open } from 'node:fs/promises';
import { createScienceAuthoringSeeds } from './science_678_authoring_seeds.mjs';
import { screenScienceQuestionWithJev } from './science_jev_screen.mjs';
import { solveScienceModel } from './science_678_oracle.mjs';
import { closedScienceObject as closed, inertScienceData, freezeScienceData, scienceDigest } from './science_678_data.mjs';

const FAIL=()=>{throw new Error('invalid_science_packet');};
const requireValue=condition=>{if(!condition)FAIL();};
const GRADES=[6,7,8],BRANCHES=['physics','chemistry','biology'],LETTERS=['A','B','C','D'];
const TASKS={force_opposed_arrows:['force_work_board','opposed_force'],reflection_normal:['ray_path','reflection_normal'],
  circuit_fair_variable:['experiment_board','fair_test'],density_displacement:['matter_cards','density_displacement'],
  phase_identification:['matter_cards','phase_observation'],ice_water_density:['matter_cards','ice_density'],
  germination_control:['experiment_board','fair_test'],reproduction_comparison:['biology_graph','reproduction_compare'],
  biodiversity_evidence:['biology_graph','biodiversity_evidence'],work_direction:['force_work_board','work_direction'],
  kinetic_potential_transform:['force_work_board','energy_transition'],refraction_path:['ray_path','refraction_path'],
  particle_element_compound:['matter_cards','particle_composition'],dissolution_fair_test:['experiment_board','fair_test'],
  separation_method:['matter_cards','separation_method'],digestion_route:['biology_graph','digestion_route'],
  circulation_route:['biology_graph','circulation_route'],food_web_roles:['biology_graph','food_web_roles'],
  solid_pressure_control:['experiment_board','solid_pressure'],liquid_depth_control:['experiment_board','liquid_pressure'],
  machine_work_tradeoff:['force_work_board','machine_tradeoff'],periodic_pattern:['matter_cards','periodic_pattern'],
  pH_classification:['matter_cards','pH_classification'],chemical_new_substance:['matter_cards','new_substance'],
  one_trait_cross:['genetic_grid','one_trait_cross'],mutation_modification:['biology_graph','mutation_modification'],
  photosynthesis_control:['experiment_board','fair_test']};
const SOURCE_HASH={'tymm-current-fen-bilimleri':'a56aab9c648f8293341be3f70c0b49e644ecb1d56be9fcaa200d6419bf1eeb97',
  'legacy-2018-fen-bilimleri':'3a8aa21327083bf15c33b9c404f299ff784b11d26024522a8c24b61387c8c0c1'};
// Review-pinned metadata, not only a PDF hash: co-edited outcome lists cannot
// manufacture a source binding. A new source revision needs an explicit review.
const BLUEPRINT_REVISION='815e947c2a55b706b29102e0b15c4fe4690072079efc861c3962095f4b648d7b';
const PACKET_KEYS=['id','grade','branch','familyId','variant','topic','outcomeCode','source','cognitiveIntent','difficulty','question','model','visualSpec','reasoning'];
const Q_KEYS=['grade','topic','branch','outcomeCode','stimulus','stem','options','correctOption','solutionStrategy','detailedSolution','distractors','difficultyJEV'];
const text=value=>typeof value==='string'&&value.trim().length>0&&value.length<=8192;
const stable=(a,b)=>a.dev===b.dev&&a.ino===b.ino&&a.size===b.size&&a.mtimeMs===b.mtimeMs&&a.ctimeMs===b.ctimeMs;
async function readBlueprint(){
  const path=new URL('../../sources/science-678-source-blueprint.json',import.meta.url),before=await lstat(path);
  if(!before.isFile()||before.isSymbolicLink()||before.size>524288||typeof constants.O_NOFOLLOW!=='number')FAIL();
  const fd=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  try{const stat=await fd.stat();if(!stat.isFile()||!stable(before,stat))FAIL();
    const bytes=Buffer.alloc(stat.size+1);let read=0;while(read<bytes.length){const chunk=await fd.read(bytes,read,bytes.length-read,read);if(!chunk.bytesRead)break;read+=chunk.bytesRead;}
    const after=await fd.stat(),current=await lstat(path);if(read!==stat.size||!stable(stat,after)||!current.isFile()||current.isSymbolicLink()||!stable(stat,current))FAIL();
    return inertScienceData(JSON.parse(new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes.subarray(0,read))));
  }finally{await fd.close();}
}
function sourceBinding(p,b){
  requireValue(scienceDigest('k12.science-blueprint/v1',b)===BLUEPRINT_REVISION
    &&b.schemaVersion==='science-678-source-blueprint/v1'&&b.courseKey==='fen-bilimleri'&&b.academicYear==='2026-2027');
  const cell=b.cells.find(row=>row.grade===p.grade&&row.branch===p.branch),s=p.source;
  requireValue(closed(s,['sourceId','pdfSha256','physicalPdfPage','pageEvidenceId'])&&Number.isInteger(s.physicalPdfPage));
  const source=b.programSources.find(row=>row.id===s.sourceId),page=b.pageEvidence.find(row=>row.id===s.pageEvidenceId),family=cell?.priorityFamilies.find(row=>row.id===p.familyId);
  requireValue(source&&page&&cell&&family&&source.pdfSha256===SOURCE_HASH[source.id]&&s.pdfSha256===source.pdfSha256
    &&cell.programSourceId===source.id&&page.sourceId===source.id&&page.physicalPdfPage===s.physicalPdfPage
    &&page.verifiedOutcomeCodes.includes(p.outcomeCode)&&family.outcomeCodes.includes(p.outcomeCode));
  const task=TASKS[p.familyId];requireValue(task&&p.model.kind===task[0]&&p.model.task===task[1]);
  return {cell,source,page,family};
}
function validPacket(p){
  requireValue(closed(p,PACKET_KEYS)&&GRADES.includes(p.grade)&&BRANCHES.includes(p.branch)&&text(p.id)&&text(p.topic)
    &&text(p.outcomeCode)&&[1,2].includes(p.variant));
  requireValue(closed(p.cognitiveIntent,['level','knowledgeDimension','evidence','rationale'])
    &&['remember','understand','apply','analyze','evaluate'].includes(p.cognitiveIntent.level)
    &&['factual','conceptual','procedural','metacognitive'].includes(p.cognitiveIntent.knowledgeDimension)
    &&text(p.cognitiveIntent.evidence)&&text(p.cognitiveIntent.rationale));
  requireValue(closed(p.difficulty,['level','rationale','estimatedOnly'])&&['easy','medium','hard','very_hard'].includes(p.difficulty.level)
    &&p.difficulty.estimatedOnly===true&&text(p.difficulty.rationale));
  const q=p.question;requireValue(closed(q,Q_KEYS)&&q.grade===p.grade&&q.branch===p.branch&&q.topic===p.topic&&q.outcomeCode===p.outcomeCode
    &&text(q.stimulus)&&q.stimulus.length>=30&&text(q.stem)&&q.stem.endsWith('?')&&closed(q.options,LETTERS)
    &&Object.values(q.options).every(text)&&new Set(Object.values(q.options)).size===4&&LETTERS.includes(q.correctOption)
    &&text(q.solutionStrategy)&&text(q.detailedSolution)&&closed(q.distractors,LETTERS.filter(letter=>letter!==q.correctOption))
    &&Object.values(q.distractors).every(text)&&['KAVRAMA','UYGULAMA','LGS_YENI_NESIL','SEKIL_VE_OLIMPIYAT'].includes(q.difficultyJEV));
  const r=p.reasoning;requireValue(closed(r,['given','wanted','whyStrategy','steps','check','shortTip'])
    &&['given','wanted','whyStrategy','check','shortTip'].every(key=>text(r[key]))&&Array.isArray(r.steps)&&r.steps.length>=2&&r.steps.length<=8);
  for(const step of r.steps)requireValue(closed(step,['because','action','result','meaning'])&&Object.values(step).every(text));
  requireValue(closed(p.visualSpec,['kind','modelRef','alt'])&&p.visualSpec.kind===p.model.kind&&p.visualSpec.modelRef==='model.inputs'
    &&text(p.visualSpec.alt)&&p.visualSpec.alt.length>=30&&!/Doğru cevap|Doğru seçenek|Cevap [A-D]|Çözüm:/u.test(p.visualSpec.alt));
}

const esc=v=>String(v).replace(/[&<>"']/gu,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const LABEL={right:'Sağ',left:'Sol',up:'Yukarı',down:'Aşağı',none:'Yok',yes:'Var',no:'Yok',warm:'Ilık',cold:'Soğuk',
  water:'Su',air:'Hava',light:'Işık',temperature:'Sıcaklık',seedCount:'Tohum sayısı',length:'Tel uzunluğu',thickness:'Tel kalınlığı',material:'Tel türü',batteryCount:'Pil sayısı',
  waterTemperature:'Su sıcaklığı',stirring:'Karıştırma',grainSize:'Tanecik boyutu',waterAmount:'Su miktarı',carbonDioxide:'Karbondioksit',plantCount:'Bitki sayısı',
  solid:'Katı',liquid:'Sıvı',gas:'Gaz',salt:'Tuz',plant:'Bitki',grass:'Ot',grasshopper:'Çekirge',frog:'Kurbağa',algae:'Alg',
  mouth:'Ağız',esophagus:'Yemek borusu',stomach:'Mide',small_intestine:'İnce bağırsak',large_intestine:'Kalın bağırsak',
  heart:'Kalp',lungs:'Akciğer',body:'Vücut',pine:'Çam',oak:'Meşe',birch:'Huş',rose:'Gül',daisy:'Papatya',
  heating:'Isıtma',cooling:'Soğutma',increases:'Artıyor',decreases:'Azalıyor',same:'Aynı',equal:'Eşit',
  budding:'Tomurcuklanma',seed_from_fertilization:'Döllenme sonrası tohum',somatic:'Vücut hücresi',gamete:'Üreme hücresi',
  iron_rusting:'Demirin paslanması',paper_tearing:'Kâğıdın yırtılması',movable_pulley:'Hareketli makara',fixed_pulley:'Sabit makara',
  floating:'Yüzme gözlemi',freezing:'Donma gözlemi',equal_volume:'Eşit hacim',equal_mass:'Eşit kütle',
  copper:'Bakır',iron:'Demir',coarse:'İri',fine:'İnce',thin:'İnce',thick:'Kalın',juniper:'Ardıç',
  oxygenate:'Akciğerde oksijenlenme',distribute:'Vücuda dağıtma',low:'Düşük',high:'Yüksek'};
const human=value=>typeof value==='boolean'?(value?'Evet':'Hayır'):LABEL[value]??String(value);
const tx=(x,y,value,size=24)=>`<text x="${x}" y="${y}" font-size="${size}" fill="#193d3c">${esc(value)}</text>`;
const line=(x1,y1,x2,y2,color='#285f58')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4"/>`;
function arrow(x1,y1,x2,y2,color='#285f58'){
  const angle=Math.atan2(y2-y1,x2-x1),a=angle+2.6,b=angle-2.6;
  return line(x1,y1,x2,y2,color)+`<path d="M${x2+12*Math.cos(a)} ${y2+12*Math.sin(a)} L${x2} ${y2} L${x2+12*Math.cos(b)} ${y2+12*Math.sin(b)}" fill="none" stroke="${color}" stroke-width="4"/>`;
}
function rowsGraphic(rows,title){
  const chunks=rows.map((row,i)=>{const y=70+i*72;return `<rect x="18" y="${y-29}" width="484" height="63" rx="9" fill="${i%2?'#e3ece1':'#fbfcf5'}"/>${tx(32,y,row[0],22)}${tx(32,y+27,row[1],19)}`;}).join('');
  return {body:tx(20,29,title,25)+chunks,height:Math.max(160,rows.length*72+83)};
}
function visualFor(p){
  const x=p.model.inputs,task=p.model.task;let body='',height=280;
  if(task==='opposed_force'){
    body=tx(20,30,'Aynı doğrultudaki kuvvetler',25)+`<rect x="205" y="116" width="110" height="75" rx="12" fill="#ebd497" stroke="#8b762f" stroke-width="2"/>`;
    x.arrows.forEach((a,i)=>{const y=96+i*67,horizontal=['right','left'].includes(a.direction),positive=['right','up'].includes(a.direction);
      const start=horizontal?260:y,end=positive?460:60;
      body+=horizontal?arrow(260,y,end,y):arrow(y,140,y,positive?48:246);
      body+=tx(horizontal?(positive?360:45):Math.min(y+10,360),horizontal?y-14:(positive?45:263),`${a.magnitude} N · ${human(a.direction)}`,21);
    });
  }else if(task==='reflection_normal'||task==='refraction_path'){
    const angle=task==='reflection_normal'?x.incidentAngleNormal:40,rad=angle*Math.PI/180;
    const endX=260-170*Math.sin(rad),endY=200-170*Math.cos(rad);
    body=tx(20,28,task==='reflection_normal'?'Gelen ışın ve yüzey normali':'İki saydam ortamın sınırı',25)
      +line(30,200,490,200)+`<line x1="260" y1="52" x2="260" y2="258" stroke="#7c8f79" stroke-width="3" stroke-dasharray="8 6"/>`
      +arrow(endX,endY,260,200,'#a75e32')+tx(280,65,'Normal',22)
      +(task==='reflection_normal'?tx(75,179,`${angle}° (Normale göre)`,22):tx(355,126,human(x.from),23)+tx(355,244,human(x.to),23));
    // No reflected/refracted answer ray is drawn in the question stimulus.
  }else if(task==='particle_composition'){
    body=tx(18,28,'Semboller atom türlerini gösterir',24);
    x.clusters.forEach((cluster,i)=>{const cx=85+(i%3)*155,cy=92+Math.floor(i/3)*86;
      cluster.forEach((symbol,j)=>{if(j)body+=line(cx+(j-1)*34,cy,cx+j*34,cy);body+=`<circle cx="${cx+j*34}" cy="${cy}" r="22" fill="${symbol==='X'?'#efd699':'#b7d3c2'}" stroke="#34594e" stroke-width="2"/>${tx(cx+j*34-9,cy+8,symbol,24)}`;});
    });height=Math.max(230,Math.ceil(x.clusters.length/3)*86+92);
  }else if(task==='one_trait_cross'){
    body=tx(18,29,'Bir karakter · Olası eşleşme alanı',24)+tx(36,70,`Baskın alel: ${x.dominantAllele}`,22);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)body+=`<rect x="${140+j*93}" y="${92+i*59}" width="93" height="59" fill="#f8fbf3" stroke="#719587" stroke-width="2"/>`;
    x.parent1.forEach((a,i)=>body+=tx(272+i*93,131,a,27));x.parent2.forEach((a,i)=>body+=tx(170,190+i*59,a,27));height=300;
  }else if(task==='fair_test'){
    const keys=Object.keys(x.rows[0]).filter(key=>key!=='id');
    const r=x.rows.flatMap(row=>[[row.id,keys.slice(0,2).map(k=>`${human(k)}: ${human(row[k])}`).join(' · ')],
      ['',keys.slice(2).map(k=>`${human(k)}: ${human(row[k])}`).join(' · ')]]);
    ({body,height}=rowsGraphic(r,`İncelenen etken: ${human(x.targetVariable)}`));
  }else if(task==='phase_observation'){
    ({body,height}=rowsGraphic(x.rows.map(row=>[`${row.time}. zaman · ${row.temperature} °C`,row.phases.map(human).join(' + ')]),`Saf madde · ${human(x.direction)}`));
  }else if(task==='density_displacement'){
    body=tx(18,28,'Eşit kütleli cisimler · Ölçülen hacim',23);
    const scale=125/Math.max(...x.samples.map(sample=>sample.after)),bottom=245;
    x.samples.forEach((sample,i)=>{const left=32+i*258;body+=tx(left,70,sample.id,25);
      for(const [index,state,volume,label] of [[0,'before',sample.before,'İlk'],[1,'after',sample.after,'Son']]){
        const cx=left+index*91,fillHeight=volume*scale,top=bottom-fillHeight;
        body+=`<rect x="${cx}" y="90" width="70" height="155" rx="6" fill="#fffef9" stroke="#547c71" stroke-width="3"/>`
          +`<rect data-sample="${sample.id}" data-state="${state}" data-volume="${volume}" x="${cx+3}" y="${top}" width="64" height="${fillHeight}" fill="#8fc7c2"/>`
          +line(cx+3,top,cx+67,top)+tx(cx+5,278,label,21)+tx(cx-3,307,`${volume} mL`,20);
      }
    });height=330;
  }else if(task==='digestion_route'){
    ({body,height}=rowsGraphic(x.organs.map(organ=>[human(organ),'Seçilmiş organ kartı · Sıra henüz verilmedi']),'Organ kartlarını ilişkilendir'));
  }else if(task==='food_web_roles'){
    const nodes=[...new Set(x.edges.flat())];body=tx(18,28,'Ok: Besinden tüketene',25);
    nodes.forEach((node,i)=>{const y=84+i*65;body+=`<rect x="105" y="${y-25}" width="250" height="45" rx="10" fill="#e6efe0"/>${tx(125,y+5,human(node),23)}`;});
    for(const [from,to] of x.edges){const a=nodes.indexOf(from),b=nodes.indexOf(to);body+=arrow(385,84+a*65,385,84+b*65);}
    body+=tx(18,84+nodes.length*65,`İncelenen: ${human(x.target)}`,23);height=135+nodes.length*65;
  }else if(task==='periodic_pattern'){
    const r=x.elements.map(element=>[element.id,`Grup (Sütun): ${element.group} · Periyot (Satır): ${element.period}`]);
    ({body,height}=rowsGraphic(r,'Periyodik tablo konum kartları'));
  }else if(task==='biodiversity_evidence'){
    ({body,height}=rowsGraphic(x.sites.map(site=>[`${site.id} · Aynı büyüklükte örnek alan`,site.species.map(human).join(' · ')]),'Gözlenen tür kayıtları'));
  }else{
    const keys={forceDirection:'Kuvvet yönü',displacementDirection:'Yer değiştirme',heightChange:'Yükseklik',speedChange:'Hareket hızı',frictionIgnored:'Sürtünme ihmal ediliyor',gravityOnly:'Yalnız yerçekimi etkisi',
      weightOrder:'Ağırlıklar',contactAreaOrder:'Temas alanı sırası',sameLiquid:'Aynı sıvı',depthOrder:'Yüzeyden derinlik sırası',vesselShapeDifferent:'Kap şekilleri farklı',
      machine:'Düzenek',ideal:'İdeal makine',loadSame:'Aynı yük',scenario:'Gözlem',comparison:'Karşılaştırma şartı',purpose:'Dolaşım amacı',
      method:'Görülen süreç',samplePH:'Ölçülmüş pH',process:'Görülen işlem',dnaSequenceChanged:'DNA dizisi değişmiş',environmentChanged:'Çevre değişmiş',phenotypeChanged:'Gözlenen özellik değişmiş',cellType:'Hücre türü',
      components:'Karışım bileşenleri',target:'Elde edilmek istenen'};
    const r=Object.entries(x).map(([key,value])=>[keys[key]??human(key),Array.isArray(value)?value.map(human).join(' + '):human(value)]);
    ({body,height}=rowsGraphic(r,'Sorunun verilenlerini oku'));
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 ${height}" role="img" aria-label="${esc(p.visualSpec.alt)}"><rect width="520" height="${height}" rx="14" fill="#f0f4ec"/>${body}</svg>`;
  return {svg,alt:p.visualSpec.alt,derivedFrom:'model.inputs',containsAnswerRayOrGridCompletion:false};
}

export function verifyScience678Question(input,blueprint){
  const result={valid:false,sourceBindingPassed:false,answerOraclePassed:false,visualBindingPassed:false,
    answerOracle:null,freeTextSemanticReview:'pending',plagiarismComparison:'not_run',expertAcceptance:'pending',publicationReady:false,reasons:[]};
  if(arguments.length!==2){result.reasons=['invalid_science_verification_arguments'];return freezeScienceData(result);}
  try{
    const p=inertScienceData(input),b=inertScienceData(blueprint);validPacket(p);
    try{sourceBinding(p,b);result.sourceBindingPassed=true;}catch{result.reasons.push('science_source_or_scope_binding_failed');}
    result.answerOracle=solveScienceModel(p.model);result.answerOraclePassed=result.answerOracle.valid&&result.answerOracle.uniqueOption===p.question.correctOption;
    if(!result.answerOraclePassed)result.reasons.push('science_structured_answer_failed');
    if(result.answerOracle.valid){visualFor(p);result.visualBindingPassed=true;}
    if(!result.visualBindingPassed)result.reasons.push('science_visual_binding_failed');
    result.valid=result.sourceBindingPassed&&result.answerOraclePassed&&result.visualBindingPassed;
  }catch{result.reasons.push('invalid_science_packet');}
  return freezeScienceData(result);
}

export async function buildScience678Pilot(){
  if(arguments.length!==0)throw new Error('invalid_science_pilot_arguments');
  const blueprint=await readBlueprint(),packets=createScienceAuthoringSeeds(),items=[],ids=new Set(),familyCounts=new Map();
  for(const packet of packets){
    requireValue(!ids.has(packet.id));ids.add(packet.id);const n=(familyCounts.get(packet.familyId)??0)+1;requireValue(n<=2);familyCounts.set(packet.familyId,n);
    const verification=verifyScience678Question(packet,blueprint);if(!verification.valid)throw new Error(`science_pilot_verification_failed:${packet.id}:${verification.reasons.join(',')}`);
    const expectation={sourceId:packet.source.sourceId,sourceSha256:packet.source.pdfSha256,expectedGrade:packet.grade,expectedCourseKey:'fen-bilimleri',expectedOutcomeCode:packet.outcomeCode};
    const {difficultyJEV,...question}=packet.question;
    const jev=await screenScienceQuestionWithJev({...question,difficulty:difficultyJEV},expectation);
    if(jev.state!=='advisory_scored'||!jev.advisory.performed)throw new Error(`science_pilot_jev_unavailable:${packet.id}`);
    items.push({packet,verification,jev,visual:visualFor(packet)});
  }
  requireValue(items.length===54&&familyCounts.size===27);
  const cells=blueprint.cells.map(cell=>{const selected=items.filter(row=>row.packet.grade===cell.grade&&row.packet.branch===cell.branch);return {
    id:cell.id,grade:cell.grade,branch:cell.branch,requested:50,authored:selected.length,remaining:50-selected.length,
    reasoningFamilies:new Set(selected.map(row=>row.packet.familyId)).size,minimumFamiliesForTarget:25,
    activeProgramBindingStatus:cell.activeProgramBindingStatus,fullOutcomeCoverage:false};});
  requireValue(cells.length===9&&cells.every(cell=>cell.authored===6&&cell.reasoningFamilies===3));
  const bloomCounts={},difficultyCounts={},answerPositionCounts={A:0,B:0,C:0,D:0};
  for(const {packet} of items){bloomCounts[packet.cognitiveIntent.level]=(bloomCounts[packet.cognitiveIntent.level]??0)+1;
    difficultyCounts[packet.difficulty.level]=(difficultyCounts[packet.difficulty.level]??0)+1;answerPositionCounts[packet.question.correctOption]++;}
  const bank={schemaVersion:'science-678-pilot/v1',state:'source_bound_partial_editor_pilot',items,
    counts:{authoredDrafts:54,reasoningFamilies:27,technicalModelTasks:new Set(items.map(row=>`${row.packet.model.kind}:${row.packet.model.task}`)).size,
      targetDrafts:450,remainingDrafts:396,acceptedProductQuestions:0,publishedQuestions:0},
    plan:{cells,maxVariantsPerReasoningFamily:2,minimumTotalFamiliesForTarget:225,additionalFamiliesNeeded:198,
      targetDifficultyPerCell:{easy:5,medium:15,hard:15,very_hard:15},difficultyProfileMet:false,
      quotaMeaning:'human_requested_editorial_mix_not_official_meb_exam_weights'},
    measurement:{bloomCounts,difficultyCounts,answerPositionCounts,learnerDevelopmentMeasured:false,psychometricCalibration:false,intuitionMeasured:false,
      bloomMeaning:'authored_task_demand_not_learner_measurement',difficultyMeaning:'author_estimate_not_empirical',
      sourceArchiveSimilarityChecked:false,freeTextExpertReview:'pending',technicalModelProof:'finite_structured_claims_under_conditions'},
    generator:{state:'not_run',reason:'no_authorized_text_generation_provider',generatedQuestions:0,fallbackQuestions:0,
      decisionModelsAreTextGenerators:false},
    activity:{localJevScreens:54,externalCalls:{generator:0,jev:0,clef:0,tts:0},videoRenders:0,newDownloads:0,realLearnerDataUsed:false},
    lineage:{sourceBlueprintSha256:scienceDigest('k12.science-blueprint/v1',blueprint),sourceRevisions:SOURCE_HASH,
      sourceTextsRedistributed:false,sourceApprovalTransferredToProduct:false},
    governance:{purpose:'adult_source_bound_science_pilot_review',owner:'pending',steward:'pending',retention:'pending',audit:'revision_bound_technical_evidence',
      access:'local_editor_only',realLearnerDataPresent:false,originality:'authored_not_archive_copied_similarity_review_pending'},
    full450Completed:false,fullAnnualCoverage:false,repeatedCallsCreateNewStock:false,answerBearingEditorArtifact:true,
    learnerReady:false,publicationReady:false,productionReady:false,serializedHashIsAuthority:false,
    pending:['198_additional_source_grounded_task_families','396_additional_authored_drafts','zero_budget_authorized_generator_if_automated_generation',
      'source_archive_similarity_review','per_question_free_text_and_visual_expert_review','real_item_difficulty_calibration','student_delivery_and_identity']};
  bank.contentSha256=scienceDigest('k12.science-678-pilot/v1',bank);
  requireValue(Buffer.byteLength(JSON.stringify(bank))<3145728);return freezeScienceData(bank);
}
