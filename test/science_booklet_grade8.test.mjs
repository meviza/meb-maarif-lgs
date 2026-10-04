import test from 'node:test';
import assert from 'node:assert/strict';

test('modification figure keeps its footer inside the SVG viewport with descender space',async()=>{
 const {grade8Questions}=await import('../packages/science-booklet/grade8.mjs');
 const svg=grade8Questions.find(q=>q.id==='YF8-15').figure.svg;
 const baseline=Number(svg.match(/<text x="176" y="([\d.]+)"[^>]*>Başlangıçta/)?.[1]);
 assert.ok(baseline<=142,'A 12px footer needs space below its baseline in a 150px viewport.');
});

test('identical bricks retain their drawn dimensions under rotation and show consistent contact areas',async()=>{
 const {grade8Questions}=await import('../packages/science-booklet/grade8.mjs');
 const svg=grade8Questions.find(q=>q.id==='YF8-02').figure.svg;
 const rects=[...svg.matchAll(/<rect[^>]*width="(\d+)"[^>]*height="(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]);
 assert.deepEqual(rects,[[50,20],[20,50],[50,20],[50,20],[20,50],[20,50]]);
 assert.equal((svg.match(/>20 cm²</g)||[]).length,2);
});

// Independently solved answers, not a second invocation of an answer generator.
const expected = [
  'K: Yaz, L: Kış', 'K ve L', 'Sıvı yağ, 10 cm derinlik', 'Desteği yüke yaklaştırmak',
  'Elektrik enerjisinden hareket enerjisine', 'I ve II',
  'Si, yarı metal olarak değiştirilmelidir.', 'Yeni özellikte bir madde oluşması',
  'K asit, L bazdır.', 'Suyun kütlesi',
  'Isı almaya devam ederken hâl değiştirmektedir.', '170 g',
  'T – G – A', 'Yüzde 50', 'Çevre koşullarına bağlı modifikasyon',
  'Başlangıçta var olan koyu renkli bireylerin yaşama şansı artmıştır.',
  'Bu koşullarda ışık kaynağına yakın olan bitkide fotosentez daha hızlıdır.',
  'X: Buharlaşma, Y: Yoğuşma',
];

test('grade8 independent solutions survive option-order changes and cover each branch', async () => {
  const { grade8Questions: qs = [] } = await import('../packages/science-booklet/grade8.mjs').catch(() => ({}));
  assert.equal(qs.length, 18, 'New grade8 content is missing.');
  for (let i = 0; i < expected.length; i++) {
    const q = qs.find(v => v.id === `YF8-${String(i + 1).padStart(2, '0')}`);
    assert.equal(q.options[q.answer], expected[i], q.id);
    assert.equal(q.options.filter(v => v === expected[i]).length, 1);
  }
  assert.deepEqual(['physics', 'chemistry', 'biology'].map(b => qs.filter(q => q.branch === b).length), [6, 6, 6]);
});

test('closed-system mass and one-character cross have independently recomputed results', async () => {
  const { grade8Questions: qs = [] } = await import('../packages/science-booklet/grade8.mjs').catch(() => ({}));
  assert.equal(qs.length, 18);
  const cross = ['A', 'a'].flatMap(left => ['a', 'a'].map(right => left + right));
  assert.equal(cross.filter(pair => pair.includes('A')).length / cross.length, .5);
  const q = qs.find(v => v.id === 'YF8-14');
  assert.match(q.stimulus, /Aa.*aa/);
  assert.equal(q.figure.svg.match(/>Aa</g)?.length, 2);
  assert.equal(q.figure.svg.match(/>aa</g)?.length, 2);
  // The gas remains inside the closed bottle + balloon system; it is not lost.
  assert.match(qs.find(v => v.id === 'YF8-12').stimulus, /dışarıya madde çıkmıyor/);
  assert.equal(qs.find(v => v.id === 'YF8-12').options[qs.find(v => v.id === 'YF8-12').answer], '170 g');
});
