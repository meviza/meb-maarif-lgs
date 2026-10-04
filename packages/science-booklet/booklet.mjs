import {packQuestions} from './pagination.mjs';
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state, pages=[], page=0, result, started=Date.now(), pending=Promise.resolve();
async function api(path, body) {
  const res=await fetch('/api/'+path,body===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok) throw new Error('Yanıt kaydedilemedi. Bağlantıyı kontrol edip yeniden dene.');
  return res.json();
}
function error(message) { const el=$('#load-status');el.hidden=false;el.className='error';el.textContent=message; }
function solution(q) {
  const r=result?.questions.find(row=>row.id===q.id);if(!r)return '';
  const e=r.explanation;
  return `<details class="solution"><summary>Çözümü incele · Doğru cevap: ${'ABCD'[r.correctAnswer]}</summary><h3>Soruda ne var, ne isteniyor?</h3><p>${esc(e.given)}</p><p>${esc(e.wanted)}</p><h3>Neden bu yolu seçiyoruz?</h3><p>${esc(e.strategy)}</p><ol>${e.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><h3>Sonucu kontrol edelim</h3><p>${esc(e.check)}</p><p class="tip"><strong>Akılda tut:</strong> ${esc(e.tip)}</p></details>`;
}
function question(q) {
  const number=state.questions.findIndex(row=>row.id===q.id)+1,selected=state.responses[q.id];
  const reviewed=result?.questions.find(row=>row.id===q.id);
  return `<article class="question" id="q-${q.id}" data-question-id="${q.id}"><div class="question-heading"><span class="question-number">${number}.</span><p class="stimulus">${esc(q.stimulus)}</p></div><figure class="figure" role="img" aria-label="${esc(q.figure.alt)}">${q.figure.svg}</figure><p class="stem" id="stem-${q.id}">${esc(q.stem)}</p><fieldset class="options" aria-labelledby="stem-${q.id}"><legend class="sr-only">${number}. sorunun seçenekleri</legend>${q.options.map((text,i)=>`<label class="option ${reviewed?(i===reviewed.correctAnswer?'correct':i===selected?'incorrect':''):''}"><input type="radio" name="${q.id}" value="${i}" ${selected===i?'checked':''} ${state.finished?'disabled':''}><span class="option-letter">${'ABCD'[i]})</span><span>${esc(text)}</span></label>`).join('')}</fieldset>${state.finished?'':`<div class="question-actions"><button data-clear="${q.id}">İşareti sil</button><button data-flag="${q.id}" aria-pressed="${state.flagged.includes(q.id)}" class="${state.flagged.includes(q.id)?'flagged':''}">${state.flagged.includes(q.id)?'Sonra bakılacak':'Sonra bak'}</button></div>`}${solution(q)}</article>`;
}
function render() {
  const total=pages.length;
  $('#booklet').innerHTML=pages.map((cols,i)=>`<section class="paper" data-page="${i}" ${i===page?'':'hidden'} aria-label="${i+1}. sayfa"><header class="paper-header"><h1>FEN BİLİMLERİ</h1><span>${state.grade}. sınıf · Deneme 01</span></header><div class="paper-columns">${cols.map(col=>`<div class="paper-column">${col.map(question).join('')}</div>`).join('')}</div><footer class="paper-footer"><span>Her sorunun yalnız bir doğru cevabı vardır.</span><span>${i+1} / ${total}</span></footer></section>`).join('');
  $('#page-position').textContent=`Sayfa ${page+1} / ${total}`;
  $('#previous').disabled=page===0;$('#next').disabled=page===total-1;
  refreshAnswerPanel();
}
function refreshAnswerPanel() {
  const answered=Object.values(state.responses).filter(v=>v!==null).length;
  $('#answered').textContent=`${answered}/${state.questions.length}`;
  $('#answer-grid').innerHTML=state.questions.map((q,i)=>`<button data-jump="${q.id}" class="${state.responses[q.id]!==null?'answered':''} ${state.flagged.includes(q.id)?'flagged':''} ${pages[page].flat().some(v=>v.id===q.id)?'is-current':''}" aria-label="${i+1}. soru${state.responses[q.id]!==null?', '+ 'ABCD'[state.responses[q.id]]+' işaretli':', boş'}${state.flagged.includes(q.id)?', sonra bakılacak':''}">${i+1}</button>`).join('');
}
function move(nextPage,id) {page=nextPage;render();window.scrollTo({top:0,behavior:'instant'});if(id){const el=$(`#q-${id}`);el.tabIndex=-1;el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'});} }
function queue(job){pending=pending.then(job).catch(e=>error(e.message));return pending;}
$('#booklet').addEventListener('change',event=>{
  const input=event.target;if(!input.matches('input[type=radio]'))return;
  const id=input.name,choice=Number(input.value);
  queue(async()=>{try{await api('answer',{id,choice});state.responses[id]=choice;refreshAnswerPanel();$('#save-status').textContent='Yanıt kaydedildi.';}catch(e){render();throw e;}});
});
$('#booklet').addEventListener('click',event=>{
  const clear=event.target.closest('[data-clear]'),flag=event.target.closest('[data-flag]');
  if(clear)queue(async()=>{const id=clear.dataset.clear;await api('answer',{id,choice:null});state.responses[id]=null;render();});
  if(flag)queue(async()=>{const id=flag.dataset.flag,enabled=!state.flagged.includes(id);await api('flag',{id,enabled});state.flagged=enabled?[...state.flagged,id]:state.flagged.filter(v=>v!==id);render();});
});
$('#previous').addEventListener('click',()=>move(Math.max(0,page-1)));
$('#next').addEventListener('click',()=>move(Math.min(pages.length-1,page+1)));
function answersPanel(open){$('#answers-panel').hidden=!open;$('#open-answers').setAttribute('aria-expanded',String(open));if(open)$('#close-answers').focus();else $('#open-answers').focus();}
$('#open-answers').addEventListener('click',()=>answersPanel($('#answers-panel').hidden));
$('#close-answers').addEventListener('click',()=>answersPanel(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#answers-panel').hidden)answersPanel(false);});
$('#answer-grid').addEventListener('click',e=>{const button=e.target.closest('[data-jump]');if(!button)return;const id=button.dataset.jump;answersPanel(false);move(pages.findIndex(cols=>cols.flat().some(q=>q.id===id)),id);});
$('#finish').addEventListener('click',async()=>{await pending;const blank=Object.values(state.responses).filter(v=>v===null).length;$('#finish-summary').textContent=blank?`${blank} soruyu boş bıraktın.`:'Bütün soruları yanıtladın.';$('#finish-dialog').showModal();});
$('#cancel-finish').addEventListener('click',()=>$('#finish-dialog').close());
$('#confirm-finish').addEventListener('click',()=>queue(async()=>{const button=$('#confirm-finish');button.disabled=true;try{result=await api('finish',{});state.finished=true;$('#finish-dialog').close();showResults();render();window.scrollTo({top:0,behavior:'instant'});$('#result-title').focus();}finally{button.disabled=false;}}));
function showResults(){const s=result.summary;$('#results').hidden=false;$('#score').textContent=`${s.correct} doğru · ${s.incorrect} yanlış · ${s.blank} boş`;$('#finish').hidden=true;}
try {
  state=await api('booklet');pages=packQuestions(state.questions);$('#enrollment').textContent=`${state.grade}. sınıf · Fen Bilimleri`;
  if(state.finished){result=await api('review');showResults();}
  render();$('#load-status').hidden=true;$('#booklet').hidden=false;$('.page-controls').hidden=false;
  setInterval(()=>{if(state.finished)return;const seconds=Math.floor((Date.now()-started)/1000);$('#elapsed').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;},1000);
} catch(e){error('Kitapçık açılamadı. Yerel önizleme sunucusunun çalıştığından emin ol.');}
