export const INK_COLORS=['#172b4d','#1d4ed8','#b91c1c'];
export function validateAnnotation(body){
 const invalid=()=>{throw new Error('invalid_annotation');};
 if(!body||typeof body.text!=='string'||body.text.length>2000||!Array.isArray(body.strokes)||body.strokes.length>100)invalid();
 let count=0;const ids=new Set();
 const strokes=body.strokes.map(s=>{
  if(!s||typeof s.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/u.test(s.id)||ids.has(s.id)||!INK_COLORS.includes(s.color)||![2,4,6].includes(s.width)||!Array.isArray(s.points)||!s.points.length||s.points.length>512)invalid();
  ids.add(s.id);count+=s.points.length;if(count>10000)invalid();
  return {id:s.id,color:s.color,width:s.width,points:s.points.map(p=>{if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)invalid();return {x:p.x,y:p.y};})};
 });return {text:body.text,strokes};
}
export function createAnnotationDraft(initial){
 let body=validateAnnotation(initial.body),saved=JSON.stringify(body),revision=initial.revision;
 if(!Number.isInteger(revision)||revision<0)throw new Error('invalid_revision');
 const history=[];
 function drawing(next){history.push(structuredClone(body.strokes));if(history.length>20)history.shift();body=validateAnnotation({...body,strokes:next});}
 return {body:()=>structuredClone(body),isDirty:()=>JSON.stringify(body)!==saved,
  setText:text=>{body=validateAnnotation({...body,text});},
  addStroke:s=>drawing([...body.strokes,s]),clearDrawing:()=>drawing([]),
  undo:()=>{if(history.length)body={...body,strokes:history.pop()};},
  request:()=>({body:structuredClone(body),expectedRevision:revision}),
  acknowledge:result=>{if(!Number.isInteger(result.revision)||result.revision<=revision)throw new Error('invalid_ack');saved=JSON.stringify(validateAnnotation(result.body));revision=result.revision;}
 };
}
