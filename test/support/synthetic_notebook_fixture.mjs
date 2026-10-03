// Test-only synthetic source. Hashes are independently constructed here, not
// obtained from the preparation implementation or a live governance resolver.
import { createHash } from 'node:crypto';
export function canonicalSyntheticNotebook(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalSyntheticNotebook).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalSyntheticNotebook(value[key])}`).join(',')}}`;
}
export const hashSyntheticNotebook = (kind, value) => createHash('sha256').update(`k12.synthetic-notebook.${kind}/v1:${canonicalSyntheticNotebook(value)}`).digest('hex');
export function createSyntheticNotebookFixture(school = 'a') {
  if (!['a','b'].includes(school)) throw new Error('invalid_synthetic_notebook_fixture');
  const scope = { schoolId:`demo-school-${school}`, learnerId:`synthetic-student-${school}`, grade:6,
    schoolYear:'2026-2027', notebookId:`synthetic-notebook-${school}` };
  const asset = {assetId:'synthetic-notebook-asset',revisionId:'assetrev-001',purpose:'student_notebook',
    classification:'sensitive_student_notebook',retentionClass:'student-notebook-lifecycle',ownerId:'synthetic-owner',stewardId:'synthetic-steward'};
  asset.definitionSha256=hashSyntheticNotebook('asset',asset);
  const catalog={catalogId:'synthetic-notebook-catalog',revisionId:'catalogrev-001',asset};
  catalog.catalogSha256=hashSyntheticNotebook('catalog',catalog);
  const policy={policyId:'synthetic-notebook-policy',purpose:'student_notebook',classification:asset.classification,
    retentionClass:asset.retentionClass,catalogSha256:catalog.catalogSha256,
    limits:{maxBodyBytes:131072,textMaxUnits:4000,strokeCount:64,pointsPerStroke:512,bookmarkCount:100,noteCount:100,concernCount:100}};
  policy.policySha256=hashSyntheticNotebook('policy',policy);
  return {contractVersion:'1.0.0',sourceKind:'synthetic_fixture',scope,catalog,policy,currentRevision:{revision:0,bodySha256:null},
    allowedTargets:[{kind:'question',id:`question-${school}-001`,grade:6,schoolYear:scope.schoolYear},
      {kind:'topic',id:`topic-${school}-001`,grade:6,schoolYear:scope.schoolYear}],receipts:[]};
}
export function createSyntheticNotebookRequest(school = 'a') {
  if (!['a','b'].includes(school)) throw new Error('invalid_synthetic_notebook_fixture');
  return {contractVersion:'1.0.0',mutationId:`mutation-notebook-${school}-001`,idempotencyKey:`idem-notebook-${school}-001`,expectedRevision:0,
    body:{text:'Çözüm: çevreyi düşün. 📝 "İpucu" \\ satır\nYeni satır\tve sekme.',
      strokes:[{id:'stroke-001',color:'#1c3532',width:4,points:[{x:0.125,y:0.0001},{x:1,y:0}]}],
      bookmarks:{questions:[`question-${school}-001`],topics:[`topic-${school}-001`]},
      notes:[{id:'note-001',text:"<img src=x onerror=alert('literal')>",grade:6,format:'plain_text'}],
      concerns:[{id:'concern-001',text:'Alanı çevreden nasıl ayırırım?',grade:6,format:'plain_text'}]}};
}
export function createSyntheticNotebookReceipt(source, request) {
  const scopeSha256=hashSyntheticNotebook('scope',source.scope);
  const receipt={receiptId:`synthetic-receipt-${hashSyntheticNotebook('request',{scopeSha256,...request}).slice(0,32)}`,
    mutationId:request.mutationId,idempotencyKey:request.idempotencyKey,scopeSha256,
    requestSha256:hashSyntheticNotebook('request',{scopeSha256,...request}),bodySha256:hashSyntheticNotebook('body',request.body),
    expectedRevision:request.expectedRevision,resultingRevision:request.expectedRevision+1,
    policySha256:source.policy.policySha256,catalogSha256:source.catalog.catalogSha256};
  receipt.receiptSha256=hashSyntheticNotebook('receipt',receipt);return receipt;
}
