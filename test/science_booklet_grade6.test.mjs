import test from 'node:test';
import assert from 'node:assert/strict';

const { grade6Questions = [] } = await import('../packages/science-booklet/grade6.mjs').catch(error => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  return {};
});

test('Grade 6 bank provides the requested distinct six-question science branches', () => {
  assert.equal(grade6Questions.length, 18, 'The replacement set must contain 18 new questions.');
  for (const branch of ['physics', 'chemistry', 'biology']) {
    assert.equal(grade6Questions.filter(q => q.branch === branch).length, 6);
  }
  assert.equal(new Set(grade6Questions.map(q => q.id)).size, 18);
  assert.equal(new Set(grade6Questions.map(q => q.stimulus + q.stem)).size, 18);
});

test('forest passage diagram keeps the road label below the road and inside the native SVG',()=>{
 const svg=grade6Questions.find(q=>q.id==='YF6-18').figure.svg;
 const baseline=Number(svg.match(/<text x="[\d.]+" y="([\d.]+)"[^>]*>Yol<\/text>/)?.[1]);
 assert.ok(baseline<=143,'Road label must leave native SVG bottom space.');
 const road=svg.match(/<rect x="164" y="([\d.]+)" width="31" height="([\d.]+)"/);
 assert.ok(Number(road[1])+Number(road[2])<=baseline-14,'Label must not collide with the road.');
});

// These expected responses are hand-derived from the specified scientific situations,
// not from the bank's stored answer index or explanation. They detect a wrong key.
const scientificResponses = [
  ['YF6-01', 'Dünya ile Mars'], // Inner-to-outer order: Mercury, Venus, Earth, Mars.
  ['YF6-02', 'Ay tutulması; Dünya, Güneş ışığının Ay’a ulaşmasını engeller.'],
  ['YF6-03', 'Alınan yol sıfırdan büyüktür, yer değiştirme sıfırdır.'],
  ['YF6-04', 'Düz ayna – Tümsek ayna'],
  ['YF6-05', 'Siyah yüzey, beyaz yüzeye göre daha fazla ışık soğurmuştur.'],
  ['YF6-06', 'K: Bakır tel, L: Plastik çubuk'],
  ['YF6-07', 'Küçülür; metal parçalar ısınınca uzar.'],
  ['YF6-08', 'P ve R aynı madde olabilir; Q bu maddelerden farklıdır.'],
  ['YF6-09', 'Kütle ve hacim azalır, yoğunluk değişmez.'],
  ['YF6-10', 'L, K ve M'], // 0.8, 1.0, 1.2 g/cm3, top to bottom.
  ['YF6-11', 'Altta sıvı su kalabilmesi, su canlılarının yaşamını sürdürmesine yardımcı olur.'],
  ['YF6-12', '2 g/cm³'], // (74 g gross - 26 g cup) / 24 cm3 = 2.
  ['YF6-13', 'Yeni bitki, üreme hücreleri birleşmeden oluşmuştur.'],
  ['YF6-14', 'Tozlaşma'],
  ['YF6-15', 'Bu tohumlar, uygun diğer koşullarda ışık olmadan da çimlenebilir.'],
  ['YF6-16', 'Tırtıl – Pupa – Ergin kelebek'],
  ['YF6-17', 'Beyincik'],
  ['YF6-18', 'İki alanı bitki örtüsü bulunan bir geçitle birleştirmek'],
];

for (const [id, expected] of scientificResponses) {
  test(`${id} selects the independently reasoned scientific conclusion`, () => {
    const question = grade6Questions.find(q => q.id === id);
    assert.ok(question, `${id} exists`);
    assert.equal(question.options[question.answer], expected);
    assert.equal(question.options.filter(option => option === expected).length, 1);
  });
}

test('Every Grade 6 item includes source and compact inert diagram contracts for the student renderer', () => {
  assert.equal(grade6Questions.length, 18);
  for (const q of grade6Questions) {
    assert.equal(q.grade, 6);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.answer >= 0 && q.answer <= 3);
    assert.match(q.outcomeCode, /^FB\.6\./u);
    assert.equal(q.source.programId, 'tymm-current-fen-bilimleri');
    assert.ok(q.source.physicalPage >= 112 && q.source.physicalPage <= 145);
    assert.match(q.figure.svg, /viewBox="0 0 360 150"/u);
    for (const [, attribute, value] of q.figure.svg.matchAll(/\b(x|y|cx|cy|r|rx|ry|width|height|x1|x2|y1|y2)="([^"]+)"/gu)) {
      assert.ok(Number.isFinite(Number(value)), `${q.id}: ${attribute} must be a finite diagram coordinate, got ${value}`);
    }
    assert.doesNotMatch(q.figure.svg, /<(script|foreignObject|image|use|defs)\b|\bon\w+=|https?:\/\/(?!www\.w3\.org\/2000\/svg)/iu);
    assert.ok(q.figure.alt.length >= 25);
    assert.ok(q.stimulus.split(/\s+/u).length <= 70);
    assert.ok(q.explanation.steps.length >= 2);
    assert.ok(q.explanation.given && q.explanation.wanted && q.explanation.strategy && q.explanation.check && q.explanation.tip);
  }
});
