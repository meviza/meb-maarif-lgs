import assert from 'node:assert/strict';
import test from 'node:test';

const studio = await import('../packages/studio/view_model.mjs').catch(() => ({}));
function read(payload) {
  assert.equal(typeof studio.readStudioPayload, 'function', 'studio needs a truthful local-review view model');
  return studio.readStudioPayload(payload);
}

function payload() {
  return {
    mode: 'local_review_preview',
    publicationEnabled: false,
    pilot: {
      status: 'available',
      report: {
        summary: { requested: 100, producedDrafts: 12, rejected: 88, mathematicallyVerified: 12, published: 0 },
        items: [{ id: 'pilot-1', template: 'perimeter', prompt: 'Çevresi kaç cm?', options: [22, 24, 11, 19], answerIndex: 0, visual: { svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', alt: '8 × 3 cm dikdörtgen' } }],
        storyboards: [],
        providerStatus: { generator: 'deterministic_math_pilot', clef: 'not_invoked' }
      }
    },
    sources: { status: 'unavailable', report: null }
  };
}

test('reads reported counts without treating drafts or provider non-invocation as approval', () => {
  const result = read(payload());
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.metrics, { requested: 100, drafts: 12, rejected: 88, mathematicallyVerified: 12, published: 0 });
  assert.equal(result.canPublish, false);
  assert.equal(result.clefStatus, 'not_invoked');
  assert.equal(result.questions.length, 1);
});

test('rejects a studio envelope that would imply publication permission or a live admin mode', () => {
  for (const changed of [{ ...payload(), publicationEnabled: true }, { ...payload(), mode: 'school_admin' }]) {
    const result = read(changed);
    assert.equal(result.status, 'invalid');
    assert.equal(result.canPublish, false);
    assert.equal(result.questions.length, 0);
  }
});

test('unavailable and invalid pilot reports produce explicit empty states rather than fabricated counts', () => {
  for (const status of ['unavailable', 'invalid']) {
    const candidate = payload();
    candidate.pilot = { status, report: null };
    const result = read(candidate);
    assert.equal(result.status, status);
    assert.equal(result.metrics, null);
    assert.equal(result.questions.length, 0);
  }
});

test('rejects invalid count values and skips malformed questions without creating a diagram claim', () => {
  const negative = payload();
  negative.pilot.report.summary.requested = -1;
  assert.equal(read(negative).status, 'invalid');
  const malformed = payload();
  malformed.pilot.report.items[0].answerIndex = 5;
  assert.equal(read(malformed).questions.length, 0);
});

test('SVG diagrams are represented by isolated image data URLs and never executable markup', () => {
  assert.equal(typeof studio.svgImageUrl, 'function', 'diagram adapter is missing');
  const result = studio.svgImageUrl('<svg xmlns="http://www.w3.org/2000/svg"><text>8 cm</text></svg>');
  assert.equal(result.startsWith('data:image/svg+xml;charset=utf-8,'), true);
  assert.match(result, /%3Csvg/);
  assert.equal(studio.svgImageUrl('not an svg'), null);
  assert.equal(studio.svgImageUrl('x'.repeat(1_000_001)), null);
});

test('source links only accept http and https protocols', () => {
  assert.equal(typeof studio.safeSourceUrl, 'function', 'source link adapter is missing');
  assert.equal(studio.safeSourceUrl('https://tymm.meb.gov.tr/ogretim-programlari'), 'https://tymm.meb.gov.tr/ogretim-programlari');
  assert.equal(studio.safeSourceUrl('javascript:alert(1)'), null);
  assert.equal(studio.safeSourceUrl('file:///private/source.pdf'), null);
});
