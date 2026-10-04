import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {grade6Questions} from './grade6.mjs';
import {grade7Questions} from './grade7.mjs';

const blueprint=JSON.parse(await readFile(new URL('../../sources/science-678-source-blueprint.json',import.meta.url),'utf8'));
const sourcePages=new Map(blueprint.pageEvidence.map(p=>[`${p.sourceId}:${p.physicalPdfPage}`,p]));
const allowedTags=new Set(['svg','g','path','line','rect','circle','ellipse','polygon','polyline','text','tspan','title','desc']);
export function validateQuestion(q) {
  if(!/^YF[678]-\d{2}$/u.test(q.id)||q.grade!==Number(q.id[2])||!['physics','chemistry','biology'].includes(q.branch))throw new Error('invalid_question_identity');
  const expectedProgram=q.grade===8?'legacy-2018-fen-bilimleri':'tymm-current-fen-bilimleri';
  const expectedCodePrefix=q.grade===8?'F.8.':`FB.${q.grade}.`;
  if(q.source?.programId!==expectedProgram||!q.outcomeCode?.startsWith(expectedCodePrefix))throw new Error('grade_program_mismatch');
  if(!['regular','extended'].includes(q.layout)||q.options.length!==4||new Set(q.options).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3)throw new Error('invalid_question_choices');
  for(const text of [q.stimulus,q.stem,...q.options,q.figure.alt,...Object.values(q.explanation).flat()])if(typeof text!=='string'||!text.trim())throw new Error('incomplete_question');
  const evidence=sourcePages.get(`${q.source.programId}:${q.source.physicalPage}`);
  if(!evidence?.verifiedOutcomeCodes.includes(q.outcomeCode))throw new Error(`unbound_source:${q.id}`);
  const svg=q.figure.svg;
  const height=Number(svg?.match(/viewBox="0 0 360 (\d+)"/u)?.[1]);
  if(typeof svg!=='string'||svg.length>24000||!/^<svg\b/u.test(svg)||!svg.includes('xmlns="http://www.w3.org/2000/svg"')||!Number.isInteger(height)||height<50||height>180)throw new Error('invalid_figure');
  for(const tag of svg.matchAll(/<\/?([\w:-]+)/gu))if(!allowedTags.has(tag[1]))throw new Error('unsafe_figure');
  if(/\bon\w+\s*=|(?:href|src|style)\s*=|<!|<\?|url\(|javascript:|NaN|Infinity/iu.test(svg))throw new Error('unsafe_figure');
  // Transport/format safety only. Shape presence is NOT a visual or pedagogical pass.
  return true;
}
export async function loadBookletBank() {
  const {grade8Questions}=await import('./grade8.mjs');
  const questions=[...grade6Questions,...grade7Questions,...grade8Questions];
  const ids=new Set();for(const q of questions){validateQuestion(q);if(ids.has(q.id))throw new Error('duplicate_question');ids.add(q.id);}
  const counts=Object.fromEntries([6,7,8].map(grade=>[grade,Object.fromEntries(['physics','chemistry','biology'].map(branch=>[branch,questions.filter(q=>q.grade===grade&&q.branch===branch).length]))]));
  return {questions,counts,authoredDrafts:questions.length,rejectedOldQuestions:54,target:450,remaining:450-questions.length,
    published:0,providerCallsMade:0,visualAcceptance:'separate_browser_and_editor_review',expertAcceptance:'pending',
    contentSha256:createHash('sha256').update(JSON.stringify(questions)).digest('hex')};
}
export function mixForGrade(questions,grade){
  const groups=['physics','chemistry','biology'].map(branch=>questions.filter(q=>q.grade===grade&&q.branch===branch));
  const mixed=[];for(let i=0;i<Math.max(...groups.map(g=>g.length));i++)for(const group of groups)if(group[i])mixed.push(group[i]);
  return mixed;
}
