import {createAnnotationDraft,INK_COLORS} from './annotation_model.mjs';

// DOM text is never interpreted as markup. Drawing coordinates survive resizing.
export function mountAnnotationWidget(container,{initial,onSave}){
 const draft=createAnnotationDraft(initial),abort=new AbortController(),opts={signal:abort.signal};
 container.replaceChildren();let active=null,saving=false,ink=INK_COLORS[0],width=2;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const help=el('p','Bu alan yalnız sana ait. Notların öğretmen, veli ve arkadaşlarla otomatik paylaşılmaz.','muted');
 const label=el('label','Yapışkan notum'),text=el('textarea',null,'sticky-text');text.maxLength=2000;text.rows=4;text.value=initial.body.text;text.setAttribute('aria-label','Soru notum');label.append(text);
 const tools=el('div',null,'ink-tools');
 for(const [i,color] of INK_COLORS.entries()){const b=el('button',['Siyah kalem','Mavi kalem','Kırmızı kalem'][i]);b.type='button';b.setAttribute('aria-pressed',String(i===0));b.addEventListener('click',()=>{ink=color;for(const x of tools.querySelectorAll('[aria-pressed]'))x.setAttribute('aria-pressed',String(x===b));},opts);tools.append(b);}
 const undo=el('button','Geri al'),clear=el('button','Çizimi temizle');undo.type=clear.type='button';tools.append(undo,clear);
 const canvas=el('canvas',null,'scratch-canvas');canvas.width=1000;canvas.height=520;canvas.setAttribute('aria-label','Karalama alanı. Kalem, parmak veya fare ile çizebilirsin; yazı için üstteki not alanını kullan.');
 const status=el('p','Henüz değişiklik yok.','note-status');status.setAttribute('role','status');
 const save=el('button','Notu kaydet','primary');save.type='button';
 container.append(help,label,tools,canvas,status,save);
 const ctx=canvas.getContext('2d');
 function paintStroke(s){ctx.beginPath();ctx.strokeStyle=s.color;ctx.lineWidth=s.width*2;ctx.lineCap='round';ctx.lineJoin='round';s.points.forEach((p,i)=>i?ctx.lineTo(p.x*1000,p.y*520):ctx.moveTo(p.x*1000,p.y*520));if(s.points.length===1){const p=s.points[0];ctx.lineTo(p.x*1000+.1,p.y*520+.1);}ctx.stroke();}
 function draw(){ctx.clearRect(0,0,1000,520);draft.body().strokes.forEach(paintStroke);if(active)paintStroke(active);}
 function changed(){status.textContent=draft.isDirty()?'Kaydedilmemiş değişiklik var.':'Kaydedildi.';draw();}
 function point(e){const r=canvas.getBoundingClientRect();return {x:Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),y:Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))};}
 text.addEventListener('input',()=>{draft.setText(text.value);changed();},opts);
 canvas.addEventListener('pointerdown',e=>{if(active||e.button>0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);active={id:crypto.randomUUID(),color:ink,width,points:[point(e)],pointer:e.pointerId};draw();},opts);
 canvas.addEventListener('pointermove',e=>{if(active?.pointer!==e.pointerId)return;e.preventDefault();if(active.points.length<512)active.points.push(point(e));draw();},opts);
 canvas.addEventListener('pointerup',e=>{if(active?.pointer!==e.pointerId)return;const {pointer,...s}=active;active=null;try{draft.addStroke(s);changed();}catch{status.textContent='Çizim sınırına ulaştın. Önce eski bir çizgiyi geri al.';draw();}},opts);
 canvas.addEventListener('pointercancel',()=>{active=null;draw();},opts);
 undo.addEventListener('click',()=>{draft.undo();changed();},opts);clear.addEventListener('click',()=>{draft.clearDrawing();changed();},opts);
 save.addEventListener('click',async()=>{if(saving)return;saving=true;save.disabled=true;status.textContent='Kaydediliyor…';try{draft.acknowledge(await onSave(draft.request()));changed();}catch(e){status.textContent=e.message==='revision_conflict'?'Not başka bir sekmede değişti. Buradaki metni kopyalayıp yeniden aç; üzerine yazmadık.':'Kaydedilemedi. Notun burada duruyor; tekrar deneyebilirsin.';}finally{saving=false;save.disabled=false;}},opts);
 draw();return {destroy:()=>abort.abort(),isDirty:()=>draft.isDirty()||saving,getDraft:()=>draft.body()};
}
