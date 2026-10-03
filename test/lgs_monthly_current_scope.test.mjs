import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSourceScopeGapReport } from '../packages/content-factory/source_scope_gaps.mjs';
const load=async name=>JSON.parse(await readFile(new URL(`../sources/${name}.json`,import.meta.url),'utf8'));

// Characterization of the separately versioned acquisition snapshot, not a
// network/PDF/Drive test and not an increment in accepted product questions.
test('monthly acquisition snapshot preserves all 88 discovered identities and only one byte revision',async()=>{
  const [base,pilot]=await Promise.all(['lgs-monthly-reference-discovery','lgs-monthly-download-pilot'].map(load));
  assert.equal(base.sources.length,88);assert.equal(pilot.sources.length,88);
  for(const [i,row] of pilot.sources.entries()) {
    const original=base.sources[i];
    assert.equal(row.id,original.id);assert.equal(row.url,original.pdfUrl);assert.equal(row.section,original.part);
    assert.equal(row.publishedDate,original.publishedDate);assert.equal(row.academicYear,original.academicYear);
    assert.equal(row.gradeCandidate,original.grade);assert.equal(row.publicationReady,false);assert.equal(row.modelTransferAllowed,false);
  }
  assert.deepEqual(['downloaded','failed','not_attempted'].map(status=>pilot.sources.filter(row=>row.download.status===status).length),[1,1,86]);
  const acquired=pilot.sources.find(row=>row.download.status==='downloaded');
  assert.equal(acquired.download.byteLength,2954686);assert.equal(acquired.download.sha256,'2c4fea59203a1392df21a77765575df79c54e26249d7f6041fea890a95d36b3e');
  assert.equal(acquired.questionCount,20);assert.ok(pilot.sources.filter(row=>row!==acquired).every(row=>row.questionCount===null));
  assert.equal(pilot.sourceObservations.length,1);
  const observation=pilot.sourceObservations[0];assert.equal(observation.sourceId,acquired.id);assert.equal(observation.sourceSha256,acquired.download.sha256);
  assert.equal(observation.sourceQuestionCountObserved,20);assert.equal(observation.answerKeyEntryCountObserved,20);
  assert.equal(observation.workedSolutionCountObserved,0);assert.equal(observation.productQuestionsAdded,0);
  assert.equal(observation.answerCorrectnessValidated,false);assert.equal(observation.sourceProgramEquivalence2026,'unknown');
});

test('current acquisition overlay keeps historical snapshot unchanged and all semantic denominators unknown',async()=>{
  const [main,supplement,selection,downloadObservations,monthly,formObservations,pilot]=await Promise.all([
    'meb-reference-registry','education-reference-supplement','tymm-relevance-inventory','tymm-download-observations',
    'lgs-monthly-reference-discovery','meb-question-style-observations','lgs-monthly-download-pilot',
  ].map(load));
  const unchanged=JSON.stringify(monthly),current=structuredClone(monthly),byId=new Map(pilot.sources.map(row=>[row.id,row]));
  for(const row of current.sources)row.download=byId.get(row.id).download;
  const report=createSourceScopeGapReport({archives:[main,supplement],selection,downloadObservations,monthly:current,formObservations});
  assert.equal(JSON.stringify(monthly),unchanged);
  assert.equal(report.inventory.sourceIdentityCount,199);assert.equal(report.inventory.recordedDownloadedSourceCount,50);
  assert.equal(report.inventory.uniqueDownloadedByteRevisionCount,49);assert.equal(report.inventory.uniqueDownloadedBytes,253351598);
  assert.equal(report.inventory.recordedDownloadedBytes,261697320);assert.equal(report.inventory.failedSourceCount,63);
  assert.equal(report.inventory.metadataOnlySourceCount,86);assert.equal(report.inventory.byteBudgetBlockedSourceCount,54);
  assert.equal(report.monthly.partLinkIdentityCount,88);assert.equal(report.monthly.recordedDownloadedSourceCount,1);
  assert.equal(report.monthly.pdfQuestionTotal,null);assert.equal(report.coveragePercentage,null);
  assert.ok(report.cells.every(row=>row.outcomeCoverage===null&&row.microSkillCoverage===null&&row.questionFamilyCoverage===null));
  assert.equal(report.productQuestions.sourceReferenceContribution,0);assert.equal(report.fullSourcesVerified,false);
  assert.equal(report.fullQuestionCoverage,false);assert.equal(report.freshPdfByteChecks,0);
  assert.equal(report.contentSha256,'3f4c369d88b25cc901df60e8c51d6f61f209c3f3c85faa49bb640984779e1ef4');
});
