import {PILOT_QUESTIONS} from './pilot_questions.mjs';
import {GRADE8_CORE_QUESTIONS} from './grade8_core.mjs';
import {GRADE8_VERBAL_QUESTIONS} from './grade8_verbal.mjs';
import {grade8Questions} from '../science-booklet/grade8.mjs';
import {createHash} from 'node:crypto';
function placeOptions(q){
 const indices=q.options.map((_,i)=>i),bytes=createHash('sha256').update('pilot-options-v1:'+q.id).digest();
 for(let i=indices.length-1;i>0;i--){const j=bytes[i]% (i+1);[indices[i],indices[j]]=[indices[j],indices[i]];}
 return {...q,options:indices.map(i=>q.options[i]),answer:indices.indexOf(q.answer)};
}
export function loadPilotCatalog(){
 const eighth=[...GRADE8_CORE_QUESTIONS,...GRADE8_VERBAL_QUESTIONS,...grade8Questions.map(q=>({...q,subject:'science',familyId:q.outcomeCode,source:{...q.source,alignmentStatus:'draft'}}))];
 const order=['turkish','history','religion','english','mathematics','science'];
 eighth.sort((a,b)=>order.indexOf(a.subject)-order.indexOf(b.subject));
 return {questions:structuredClone([...PILOT_QUESTIONS,...eighth].map(placeOptions)),examBlueprints:[{grade:8,scoringMode:'lgs'}],published:0,realSchoolReady:false,paidCalls:0,acceptance:'editorial_draft'};
}
