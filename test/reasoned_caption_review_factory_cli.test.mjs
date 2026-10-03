import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const cli=fileURLToPath(new URL('../tools/content_factory_pilot.mjs',import.meta.url));
async function bundle(t,count) {
  const root=await mkdtemp(join(tmpdir(),'caption-review-factory-test-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const out=join(root,'review'),run=spawnSync(process.execPath,[cli,'--count',String(count),'--out',out],{encoding:'utf8',timeout:15000,shell:false});
  assert.equal(run.status,0,run.stderr);
  return {report:JSON.parse(await readFile(join(out,'audit.json'),'utf8')),html:await readFile(join(out,'preview.html'),'utf8')};
}

test('normal factory prepares source-bound initial DOM caption records without serializing navigation authority',async t=>{
  const {report}=await bundle(t,100),view=report.captionReviewPreparation;
  assert.ok(view,'live caption review controller not connected to factory');
  assert.equal(view.questionRecords.length,12);assert.equal(view.conceptRecords.length,1);
  for(const [records,frames] of [[view.questionRecords,report.captionFramePreparation.questionFrames],[view.conceptRecords,report.captionFramePreparation.conceptFrames]]) {
    for(const [i,record] of records.entries()) {
      assert.deepEqual(record.frame,frames[i].frame);assert.deepEqual(record.narrationPacket,frames[i].narrationPacket);
      assert.deepEqual(record.caption.lines,record.frame.selectedPage.lines);assert.equal(record.caption.recommendedFontSizeCssPx,18);
      assert.equal(record.serializedAuthority,'none');assert.equal(record.cursor.cueIndex,0);assert.equal(record.cursor.pageIndex,0);
      assert.equal(record.cursor.resultVisible,false);assert.equal(record.pageNavigationUiVerified,false);
    }
  }
  assert.equal(view.localControllerImplemented,true);assert.equal(view.pageNavigationUiBound,false);
  for(const key of ['audioAttached','videoAttached','wordPenAlignmentVerified','publicationReady','learnerReady','productionReady'])assert.equal(view[key],false);
  assert.equal(report.summary.producedDrafts,12);assert.equal(report.summary.published,0);
});

test('initial editor caption uses separately sized plain DOM text and keeps duplicate SVG in secondary closed details',async t=>{
  const {report,html}=await bundle(t,1);
  assert.ok(report.captionReviewPreparation,'DOM caption review consumer missing');
  assert.equal((html.match(/data-initial-dom-caption/g)??[]).length,3);
  const payloads=[...html.matchAll(/<script type="application\/json" data-dom-caption-payload>(.*?)<\/script>/gu)].map(m=>JSON.parse(m[1]));
  assert.equal(payloads.length,2);assert.deepEqual(payloads[0],report.captionReviewPreparation.conceptRecords[0].caption.lines);
  assert.deepEqual(payloads[1],report.captionReviewPreparation.questionRecords[0].caption.lines);
  assert.ok(html.includes("line.textContent=text"));assert.ok(html.includes('.dom-caption-lines{font-size:18px;'));
  assert.ok(html.includes('<details data-initial-caption-frame>'));
  assert.ok(html.includes(report.captionReviewPreparation.conceptRecords[0].frame.svg));
  assert.ok(html.includes(report.captionReviewPreparation.questionRecords[0].frame.svg));
  assert.equal(html.includes('data-caption-review-next'),false,'local controller is not a browser UI yet');
});

test('actual initial-caption script assigns literal textContent and never interprets markup in the DOM harness',async t=>{
  const {html}=await bundle(t,1),script=html.match(/<script>([\s\S]*?)<\/script>/u)[1];
  const payloads=[...html.matchAll(/<script type="application\/json" data-dom-caption-payload>(.*?)<\/script>/gu)].map(m=>JSON.parse(m[1]));
  payloads.push(['<img src=x onerror=sentinel()>','</script><script>sentinel()</script>']);
  const rendered=payloads.map(()=>[]);
  const panels=payloads.map((lines,i)=>({querySelector(selector){return selector==='[data-dom-caption-lines]'?{append(line){rendered[i].push(line.textContent);}}:{textContent:JSON.stringify(lines)};}}));
  const document={querySelectorAll(selector){return selector==='[data-initial-dom-caption]'?panels:[];},createElement(tag){
    assert.equal(tag,'p');return {set innerHTML(value){throw new Error('markup sink must not be used');}};
  }};
  runInNewContext(script,{document},{timeout:1000});assert.deepEqual(rendered,payloads);
  // A synthetic DOM harness proves the sink, not browser accessibility,
  // computed font size, pixel fit, animation, audio or teacher acceptance.
});
