import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const api = await import('../packages/contracts/reasoned_teaching_trace.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function create(draft) {
  assert.equal(typeof api.createReasonedTeachingTrace, 'function', 'shared reasoning contract not implemented');
  return api.createReasonedTeachingTrace(draft);
}
function draft() {
  return {
    id: 'perimeter-6x4', kind: 'question_solution', source: { id: 'owned-example-6x4', contentSha256: 'a'.repeat(64) },
    goal: { question: 'Dikdörtgenin dış sınırı boyunca kaç santimetre yol yürürüz?', measurement: 'perimeter_length', unit: 'cm' },
    evidence: [
      { id: 'width', type: 'given', text: 'Yatay kenar 6 cm.', anchor: 'soru:yatay-kenar', value: 6, unit: 'cm' },
      { id: 'height', type: 'given', text: 'Düşey kenar 4 cm.', anchor: 'soru:dusey-kenar', value: 4, unit: 'cm' },
      { id: 'pairs', type: 'shape_property', text: 'Dikdörtgende iki eş kısa–uzun kenar çifti vardır.', anchor: 'model:karsilikli-kenarlar', value: 2, unit: 'unitless' },
    ],
    plan: { route: 'Bir kenar çiftini bul, sonra iki eş çifti say.', why: 'Sınırdaki dört kenarı sayıyoruz; içteki birim kareleri değil.', conditions: ['Dikdörtgenin bütün dış kenarları sayılır.'] },
    steps: [
      { id: 'one-pair', why: '6 cm ve 4 cm aynı kenar çiftinin uzunluklarıdır; toplarız.', operation: { kind: 'add', inputIds: ['width', 'height'] }, result: { value: 10, unit: 'cm', meaning: 'Bir kısa–uzun kenar çiftinin toplam uzunluğu.' }, check: { prompt: 'Bu sonuç bütün çevre mi?', answer: 'Hayır; yalnız bir kenar çiftidir.' } },
      { id: 'all-pairs', why: 'Aynı kenar çiftinden iki tane olduğundan ikiyle çarparız.', operation: { kind: 'multiply', inputIds: ['one-pair', 'pairs'] }, result: { value: 20, unit: 'cm', meaning: 'Dört kenarın toplamı, dikdörtgenin çevresi.' }, check: { prompt: 'Sonuç hangi birimdedir?', answer: 'Uzunluğu ölçtüğümüz için santimetredir.' } },
    ],
    transfer: { prompt: 'Bu modelin içini kaplamak isteseydik neyi sayardık?', answer: 'Dış kenarlar yerine içteki birim kareleri sayar, alanı bulurduk.' },
    scope: { gradeBand: '5-6', prerequisite: 'Kenar uzunluğu ve toplama; sınıf/müfredat eşlemesi uzman incelemesinde.' },
  };
}

// Break caught: revealing unexplained results in orientation or allowing step skipping.
test('the shared consumer begins with target evidence and plan before its variable number of calculations', () => {
  const trace = create(draft());
  for (let stageIndex = 0; stageIndex < 3; stageIndex++) {
    const view = api.getReasonedTeachingStage(trace, { stageIndex });
    assert.equal(view.result, null); assert.deepEqual(view.priorResults, []);
  }
  const hidden = api.getReasonedTeachingStage(trace, { stageIndex: 3 });
  assert.equal(hidden.kind, 'reasoning'); assert.equal(hidden.result, null);
  assert.equal(hidden.check.answer, null); assert.equal(hidden.canAdvance, false);
  const shown = api.getReasonedTeachingStage(trace, { stageIndex: 3, reveal: true });
  assert.deepEqual(shown.result, { value: 10, unit: 'cm', meaning: 'Bir kısa–uzun kenar çiftinin toplam uzunluğu.' });
  assert.equal(shown.canAdvance, true);
  assert.equal(shown.stageCount, 7);
  assert.deepEqual(api.getReasonedTeachingStage(trace, { stageIndex: 4 }).priorResults.map(r => r.value), [10]);
});

test('wrong arithmetic or a correct numeric answer with a wrong dimension is rejected', () => {
  for (const change of [d => { d.steps[0].result.value = 11; }, d => { d.steps[1].result.unit = 'cm²'; }, d => { d.goal.unit = 'cm²'; }]) {
    const data = draft(); change(data); assert.throws(() => create(data), /teaching_(numeric|unit|target)_mismatch/u);
  }
});

test('all operation operands must refer to supplied evidence or an earlier result', () => {
  for (const inputs of [['width', 'missing'], ['width', 'all-pairs'], ['one-pair', 'height']]) {
    const data = draft(); data.steps[0].operation.inputIds = inputs;
    assert.throws(() => create(data), /unbound_teaching_input/u);
  }
  const duplicate = draft(); duplicate.steps[0].id = 'width';
  assert.throws(() => create(duplicate), /duplicate_teaching_id/u);
});

test('division by zero and incompatible add units cannot become a reasoned mathematical pass', () => {
  const zero = draft(); zero.evidence[1].value = 0; zero.steps[0].operation.kind = 'divide';
  assert.throws(() => create(zero), /invalid_teaching_arithmetic/u);
  const mixed = draft(); mixed.evidence[1].unit = 'cm²';
  assert.throws(() => create(mixed), /teaching_unit_mismatch/u);
});

// Break caught: accepting a tiny wrong intermediate value and amplifying it
// through a later multiplication instead of preserving exact arithmetic.
test('a near-zero incorrect intermediate cannot be magnified into a false final answer', () => {
  const data = draft(); data.goal.unit = 'm';
  data.evidence = [
    { id: 'one', type: 'given', text: 'Bir metre.', anchor: 'test:one', value: 1, unit: 'm' },
    { id: 'scale', type: 'given', text: 'Bir milyar kat tekrar.', anchor: 'test:scale', value: 1e9, unit: 'unitless' },
  ];
  data.steps[0].operation = { kind: 'subtract', inputIds: ['one', 'one'] };
  data.steps[0].result = { value: 5e-10, unit: 'm', meaning: 'Beyan edilen ama yanlış fark.' };
  data.steps[1].operation = { kind: 'multiply', inputIds: ['one-pair', 'scale'] };
  data.steps[1].result = { value: 0.5, unit: 'm', meaning: 'Yanlış ara sonucun büyütülmesi.' };
  assert.throws(() => create(data), /teaching_numeric_mismatch/u);
});

test('missing rationale conditions source anchors or transfer explanation fails closed', () => {
  for (const change of [d => { d.plan.why = ''; }, d => { d.plan.conditions = []; }, d => { d.steps[0].why = ''; }, d => { d.steps[0].result.meaning = ''; }, d => { d.evidence[0].anchor = ''; }, d => { d.transfer.answer = ''; }]) {
    const data = draft(); change(data); assert.throws(() => create(data), /invalid_teaching_/u);
  }
});

test('a text inference cites evidence without fabricating arithmetic and remains semantically pending', () => {
  const data = draft(); data.id = 'text-example'; data.goal = { question: 'Anlatıcının plan yaptığını hangi ifade gösteriyor?', unit: 'text', measurement: 'text_inference' };
  data.evidence = [{ id: 'sentence', type: 'text', text: 'Geziden önce yol haritasını hazırladım.', anchor: 'metin:cumle-1', value: null, unit: 'text' }];
  data.steps = [{ id: 'inference', why: 'Gezi öncesindeki hazırlığı belirten ifadeyi sorulan davranışla ilişkilendiriyoruz.', operation: { kind: 'interpret', inputIds: ['sentence'] }, result: { value: 'Yol haritasını önceden hazırlaması plan yaptığını gösterir.', unit: 'text', meaning: 'Metindeki hazırlık davranışına dayalı çıkarım; kişilik teşhisi değil.' }, check: { prompt: 'Bu ifade gezi sonunda yazı yazdığını da gösterir mi?', answer: 'Hayır, cümle gezi öncesi hazırlıktan söz ediyor.' } }];
  const trace = create(data), audit = api.auditReasonedTeachingTrace(trace);
  assert.equal(audit.structuralChecks, 'passed'); assert.equal(audit.numericStepsChecked, 0);
  assert.equal(audit.semanticReview, 'pending'); assert.equal(audit.publicationReady, false);
  assert.equal(api.getReasonedTeachingStage(trace, { stageIndex: 3 }).result, null);
  data.steps[0].operation.kind = 'add'; assert.throws(() => create(data), /invalid_teaching_arithmetic/u);
});

test('the transfer question is not automatically answered and the final stage cannot advance', () => {
  const trace = create(draft()), hidden = api.getReasonedTeachingStage(trace, { stageIndex: 6 });
  assert.equal(hidden.kind, 'transfer'); assert.equal(hidden.check.answer, null);
  assert.equal(hidden.canAdvance, false);
  assert.ok(api.getReasonedTeachingStage(trace, { stageIndex: 6, reveal: true }).check.answer.length > 0);
});

test('source hashes and immutable content revisions never become caller approved publication', () => {
  const data = draft(), trace = create(data);
  assert.equal(trace.source.contentSha256, 'a'.repeat(64));
  assert.equal(trace.state, 'draft'); assert.equal(trace.publicationReady, false);
  assert.equal(trace.mediaStatus, 'new_narration_not_generated');
  const { contentSha256, ...body } = trace;
  assert.equal(contentSha256, createHash('sha256').update(JSON.stringify(body)).digest('hex'));
  data.steps[0].why = 'changed'; assert.notEqual(trace.steps[0].why, 'changed');
  assert.throws(() => { trace.steps[0].result.value = 77; }, TypeError);
  assert.throws(() => api.getReasonedTeachingStage(JSON.parse(JSON.stringify(trace))), /untrusted_teaching_trace/u);
  const forged = draft(); forged.publicationReady = true; assert.throws(() => create(forged), /invalid_teaching_/u);
});

test('bounds and hostile inputs fail without running accessors coercion or proxy traps', () => {
  const data = draft(); let calls = 0;
  Object.defineProperty(data.steps[0], 'why', { enumerable: true, get() { calls++; return 'hostile'; } });
  assert.throws(() => create(data), /invalid_teaching_data/u);
  assert.throws(() => create(new Proxy({}, { ownKeys() { calls++; return []; } })), /invalid_teaching_data/u);
  assert.equal(calls, 0);
  const oversized = draft(); oversized.plan.why = 'x'.repeat(5000); assert.throws(() => create(oversized), /invalid_teaching_data/u);
  const cycle = draft(); cycle.transfer.answer = cycle; assert.throws(() => create(cycle), /invalid_teaching_data/u);
  const trace = create(draft());
  for (const options of [{ stageIndex: -1 }, { stageIndex: 7 }, { stageIndex: '3' }, { stageIndex: null }, { reveal: null }, { reveal: 1 }, { studentId: 'private' }]) assert.throws(() => api.getReasonedTeachingStage(trace, options), /invalid_teaching_/u);
});
