import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../packages/school-portal/annotation_model.mjs').catch(()=>({}));
test('notes are bounded, normalized and cloned, never interpreted as HTML',()=>{
 assert.equal(typeof mod.validateAnnotation,'function');
 const b={text:'<script>notum</script>',strokes:[{id:'p1',color:'#172b4d',width:2,points:[{x:0,y:1},{x:.5,y:.5}]}]};
 const result=mod.validateAnnotation(b);assert.deepEqual(result,b);b.strokes[0].points[0].x=1;assert.equal(result.strokes[0].points[0].x,0);
});
test('invalid or oversized strokes cannot be saved',()=>{
 assert.equal(typeof mod.validateAnnotation,'function');
 for(const body of [{text:'x'.repeat(2001),strokes:[]},{text:'',strokes:[{id:'p1',color:'url(javascript:1)',width:2,points:[{x:0,y:0}]}]},{text:'',strokes:[{id:'p1',color:'#172b4d',width:2,points:[{x:NaN,y:0}]}]},{text:'',strokes:[{id:'p1',color:'#172b4d',width:2,points:[{x:1.1,y:0}]}]}])assert.throws(()=>mod.validateAnnotation(body));
});
test('clearing a drawing is undoable and an old save acknowledgement does not clear a newer edit',()=>{
 assert.equal(typeof mod.createAnnotationDraft,'function');
 const d=mod.createAnnotationDraft({revision:0,body:{text:'',strokes:[]}});
 d.setText('Bana verilenleri bul.');const request=d.request();d.setText('Yeni düşüncem');d.acknowledge({...request,revision:1});assert.equal(d.isDirty(),true);assert.equal(d.body().text,'Yeni düşüncem');assert.equal(d.request().expectedRevision,1);
 d.addStroke({id:'p1',color:'#172b4d',width:2,points:[{x:0,y:0},{x:1,y:1}]});d.clearDrawing();assert.equal(d.body().strokes.length,0);d.undo();assert.equal(d.body().strokes.length,1);
 const latest=d.request();d.acknowledge({...latest,revision:2});assert.equal(d.isDirty(),false);
});
