import test from 'node:test';
import assert from 'node:assert/strict';

// Independent worked facts. Wrong answer-key positions, a replaced distractor, or
// a mislabeled diagram must fail; these checks do not certify editorial quality.
const expected = new Map([
  ['YF7-01', 'K'],
  ['YF7-02', 'Yalnız II'],
  ['YF7-03', 'Çekim potansiyel enerjisi azalır, kinetik enerjisi artar.'],
  ['YF7-04', 'II'],
  ['YF7-05', 'X pozitif, Y negatif yüklüdür.'],
  ['YF7-06', 'Görevi biten araçları güvenli biçimde yörüngeden çıkarmak'],
  ['YF7-07', 'Proton'],
  ['YF7-08', 'X element, Y bileşiktir.'],
  ['YF7-09', 'Na – Cl – Mg'],
  ['YF7-10', 'İkisinde de toz şeker kullanmak'],
  ['YF7-11', 'Damıtma'],
  ['YF7-12', 'K homojen, L heterojendir.'],
  ['YF7-13', 'İnce bağırsak'],
  ['YF7-14', 'Kalp → Akciğer → Kalp'],
  ['YF7-15', 'Kandan havaya'],
  ['YF7-16', 'K böbrek, L mesanedir.'],
  ['YF7-17', 'Şahin'],
  ['YF7-18', 'K uygulamasında öğrenci başına günlük kullanım azalmıştır.'],
]);

test('grade7 questions have independently checked single answer texts and branch coverage', async () => {
  const loaded = await import('../packages/science-booklet/grade7.mjs').catch(() => ({ grade7Questions: [] }));
  const questions = loaded.grade7Questions;
  assert.equal(questions.length, 18, 'The replacement grade7 set has not been authored.');
  for (const q of questions) {
    assert.equal(q.options[q.answer], expected.get(q.id), q.id);
    assert.equal(q.options.filter(v => v === expected.get(q.id)).length, 1, q.id);
  }
  assert.deepEqual(['physics', 'chemistry', 'biology'].map(branch => questions.filter(q => q.branch === branch).length), [6, 6, 6]);
});

test('electric charge diagram and water-use table support the keyed conclusions', async () => {
  const { grade7Questions: questions = [] } = await import('../packages/science-booklet/grade7.mjs').catch(() => ({}));
  assert.equal(questions.length, 18);
  const charge = questions.find(q => q.id === 'YF7-05').figure.svg;
  const x = charge.match(/data-object="X"[^>]*>([\s\S]*?)<\/g>/)?.[1] || '';
  const y = charge.match(/data-object="Y"[^>]*>([\s\S]*?)<\/g>/)?.[1] || '';
  assert.equal((x.match(/>\+</g) || []).length, 4);
  assert.equal((x.match(/>−</g) || []).length, 2);
  assert.equal((y.match(/>\+</g) || []).length, 2);
  assert.equal((y.match(/>−</g) || []).length, 4);
  // Daily totals must be divided by participants: K 600/100 -> 360/100;
  // L 600/100 -> 360/60. A lower total alone does not prove per-child saving.
  assert.equal(600 / 100 > 360 / 100, true);
  assert.equal(600 / 100, 360 / 60);
  const water = questions.find(q => q.id === 'YF7-18');
  assert.match(water.figure.svg, /360/);
  assert.match(water.figure.svg, />60</);
  assert.match(water.explanation.check, /6.*3,6.*6/);
});
