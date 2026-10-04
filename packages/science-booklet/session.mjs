const clone = value => structuredClone(value);
const fail = message => { throw new Error(message); };

// Trusted server enrollment; the browser never supplies a grade or a role.
// In-memory, synthetic preview only. This is not institutional authentication.
export function createExamSession(input, grade) {
  if (![6,7,8].includes(grade)) fail('invalid_grade');
  const items=clone(input.filter(q=>q.grade===grade));
  if (!items.length) fail('empty_exam');
  const byId=new Map();
  for(const q of items) {
    if(byId.has(q.id)) fail('duplicate_question');
    if(typeof q.id!=='string' || !q.id || !Number.isInteger(q.answer) || q.answer<0 || q.answer>3 || !Array.isArray(q.options) || q.options.length!==4 || !q.options.every(v=>typeof v==='string'&&v.length)) fail('invalid_question');
    byId.set(q.id,q);
  }
  const responses=Object.fromEntries(items.map(q=>[q.id,null]));
  const flags=new Set(); let finished=false;
  const question = id => byId.get(id) ?? fail('question_not_in_exam');
  const open = () => { if(finished) fail('exam_finished'); };
  const review = () => {
    if(!finished) fail('finish_required');
    const questions=items.map(q=>({id:q.id,selectedAnswer:responses[q.id],correctAnswer:q.answer,
      status:responses[q.id]===null?'blank':responses[q.id]===q.answer?'correct':'incorrect',explanation:clone(q.explanation)}));
    return {summary:{correct:questions.filter(q=>q.status==='correct').length,incorrect:questions.filter(q=>q.status==='incorrect').length,blank:questions.filter(q=>q.status==='blank').length,total:items.length},questions};
  };
  return Object.freeze({
    booklet:()=>({grade,course:'Fen Bilimleri',finished,responses:clone(responses),flagged:[...flags],questions:items.map(q=>({
      id:q.id,stimulus:q.stimulus,stem:q.stem,options:clone(q.options),figure:clone(q.figure),layout:q.layout}))}),
    answer:(id,choice)=>{open();question(id);if(choice!==null&&(!Number.isInteger(choice)||choice<0||choice>3))fail('invalid_choice');responses[id]=choice;return {saved:true};},
    flag:(id,enabled)=>{open();question(id);if(typeof enabled!=='boolean')fail('invalid_flag');if(enabled)flags.add(id);else flags.delete(id);return {saved:true};},
    finish:()=>{finished=true;return review();}, review,
  });
}
