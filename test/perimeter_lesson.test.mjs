import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const lessonModule = await import('../packages/content-factory/perimeter_lesson.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

function lesson(options) {
  assert.equal(typeof lessonModule.createPerimeterLesson, 'function', 'createPerimeterLesson is not implemented');
  return lessonModule.createPerimeterLesson(options);
}

// Independent classroom fixtures: four edges 6, 4, 6, 4 total 20;
// four rows of six unit squares total 24. No factory helper computes these wants.
test('the 6 by 4 example distinguishes boundary length 20 cm from covered area 24 cm²', () => {
  const item = lesson();
  assert.deepEqual(item.workedExample.model, { width: 6, height: 4, lengthUnit: 'cm' });
  assert.deepEqual(item.workedExample.perimeter, { expression: '6 + 4 + 6 + 4', value: 20, unit: 'cm' });
  assert.deepEqual(item.workedExample.area, { expression: '4 × 6', value: 24, unit: 'cm²' });
});

test('the owned main SVG shows 24 unit squares and correctly sized labelled 6 by 4 geometry', () => {
  const item = lesson();
  const visual = item.visuals.find(value => value.id === item.workedExample.visualId);
  assert.ok(visual, 'the worked example needs a corresponding visual');
  assert.equal((visual.svg.match(/data-unit-square="true"/g) ?? []).length, 24);
  assert.match(visual.svg, /data-boundary="true" d="M 90 80 H 342 V 248 H 90 Z"/);
  assert.match(visual.svg, /data-model="rectangle-6x4" x="90" y="80" width="252" height="168"/);
  assert.equal((visual.svg.match(/>6 cm<\/text>/g) ?? []).length, 2);
  assert.equal((visual.svg.match(/>4 cm<\/text>/g) ?? []).length, 2);
  assert.match(visual.alt, /6 cm/);
  assert.match(visual.alt, /4 cm/);
  assert.match(visual.alt, /24/);
  assert.match(visual.alt, /1 cm²/);
  assert.match(visual.alt, /20 cm/);
  assert.equal(visual.rightsStatus, 'owned_original');
  assert.equal(visual.sha256, createHash('sha256').update(visual.svg).digest('hex'));
});

test('equal covered area does not falsely imply equal boundary length in the comparison', () => {
  const item = lesson();
  assert.deepEqual(item.misconception.comparison.models, [
    { width: 6, height: 4, lengthUnit: 'cm', area: { value: 24, unit: 'cm²' }, perimeter: { value: 20, unit: 'cm' } },
    { width: 8, height: 3, lengthUnit: 'cm', area: { value: 24, unit: 'cm²' }, perimeter: { value: 22, unit: 'cm' } },
  ]);
  const visual = item.visuals.find(value => value.id === item.misconception.comparison.visualId);
  assert.ok(visual);
  assert.equal((visual.svg.match(/data-unit-square="true"/g) ?? []).length, 48);
  assert.match(visual.svg, /data-model="rectangle-6x4" x="40" y="80" width="156" height="104"/);
  assert.match(visual.svg, /data-model="rectangle-8x3" x="295" y="80" width="208" height="78"/);
  assert.match(visual.alt, /8 cm/);
  assert.match(visual.alt, /3 cm/);
  assert.match(visual.alt, /22 cm/);
});

test('the two formative questions bind their expected answers and units to their displayed model', () => {
  const item = lesson();
  assert.equal(item.formativeQuestions.length, 2);
  assert.deepEqual(item.formativeQuestions.map(value => ({ measure: value.measure, modelId: value.modelId, answer: value.answer })), [
    { measure: 'perimeter', modelId: 'rectangle-6x4', answer: { value: 20, unit: 'cm' } },
    { measure: 'area', modelId: 'rectangle-6x4', answer: { value: 24, unit: 'cm²' } },
  ]);
  for (const question of item.formativeQuestions) {
    assert.equal(question.visualId, item.workedExample.visualId);
    assert.ok(question.prompt.trim().length > 15);
    assert.ok(question.feedback.trim().length > 15);
  }
});

test('the standalone mini lesson supplies concepts, two different actions, a teacher hint and a short spoken transcript', () => {
  const item = lesson();
  assert.ok(item.concept.perimeter.trim().length > 15);
  assert.ok(item.concept.area.trim().length > 15);
  assert.deepEqual(item.activities.map(value => value.measure), ['perimeter', 'area']);
  for (const activity of item.activities) {
    assert.equal(activity.visualId, item.workedExample.visualId);
    assert.ok(activity.instruction.trim().length > 15);
  }
  assert.ok(item.misconception.explanation.trim().length > 15);
  assert.ok(item.teacherHint.trim().length > 15);
  const words = item.speechTranscript.trim().split(/\s+/u);
  assert.ok(words.length >= 70 && words.length <= 100, `spoken transcript length: ${words.length}`);
  assert.ok(!/[<>]/u.test(item.speechTranscript), 'spoken text must be plain text');
});

test('caller verified claims cannot turn the lesson into a published or expert reviewed artifact', () => {
  const item = lesson({ metadata: {
    verified: true,
    state: 'published',
    publishReady: true,
    curriculum: { mappingStatus: 'verified', verified: true },
    governance: { ownerId: 'lesson-owner', stewardId: 'math-editor' },
    expertReview: { status: 'approved' },
    rightsReview: { status: 'approved' },
  } });
  assert.equal(item.state, 'draft');
  assert.equal(item.publishReady, false);
  assert.equal(item.metadata.curriculum.mappingStatus, 'unresolved');
  assert.equal(item.review.expert, 'pending');
  assert.equal(item.review.rights, 'pending');
  assert.equal(item.difficulty.calibrationStatus, 'author_estimated');
  assert.equal(item.metadata.governance.ownerId, 'lesson-owner');
  assert.equal(item.metadata.governance.stewardId, 'math-editor');
});

test('default provenance is original, unresolved and unassigned without carrying caller student or arbitrary markup data', () => {
  const payload = '<script>private-student-name</script>';
  const item = lesson({ metadata: {
    student: { name: payload },
    visual: { svg: payload },
    source: { sourceId: payload, studentData: payload },
  } });
  assert.equal(item.metadata.source.sourceId, 'internal-authoring:perimeter-mini-lesson-v1');
  assert.equal(item.metadata.source.rightsStatus, 'owned_original');
  assert.equal(item.metadata.source.containsStudentData, false);
  assert.equal(item.metadata.source.containsPrivateData, false);
  assert.equal(item.metadata.source.externalDataUsed, false);
  assert.equal(item.metadata.curriculum.mappingStatus, 'unresolved');
  assert.equal(item.metadata.governance.ownerId, 'unassigned');
  assert.equal(item.metadata.governance.stewardId, 'unassigned');
  assert.equal(JSON.stringify(item).includes(payload), false);
  for (const visual of item.visuals) {
    assert.doesNotMatch(visual.svg, /<(?:script|foreignObject|image|iframe|style)\b|(?:href|onload|onclick)=|url\(/iu);
    assert.match(visual.svg, /role="img"/);
    assert.match(visual.svg, /aria-labelledby=/);
    assert.ok(visual.alt.length > 40);
  }
});

test('versioned content is deeply immutable and deterministic while safe metadata changes its content hash', () => {
  const input = { governance: { ownerId: 'first-owner', stewardId: 'math-editor' } };
  const item = lesson({ metadata: input });
  assert.match(item.schemaVersion, /\/v1$/u);
  assert.equal(item.version, '1.0.0');
  assert.ok(item.id.length > 0);
  assert.match(item.sourceSha256, /^[a-f0-9]{64}$/u);
  assert.match(item.contentSha256, /^[a-f0-9]{64}$/u);
  assert.equal(item.metadata.source.sha256, item.sourceSha256);
  assert.throws(() => { item.workedExample.perimeter.value = 99; }, TypeError);
  assert.throws(() => { item.visuals[0].svg = '<svg/>'; }, TypeError);
  assert.throws(() => { item.metadata.governance.ownerId = 'changed-owner'; }, TypeError);
  assert.throws(() => { item.formativeQuestions.push({}); }, TypeError);
  input.governance.ownerId = 'changed-input-owner';
  assert.equal(item.metadata.governance.ownerId, 'first-owner');
  const again = lesson({ metadata: { governance: { ownerId: 'first-owner', stewardId: 'math-editor' } } });
  assert.deepEqual(again, item);
  const defaultItem = lesson();
  assert.equal(defaultItem.sourceSha256, item.sourceSha256);
  assert.notEqual(defaultItem.contentSha256, item.contentSha256);
  const { contentSha256, ...hashedContent } = item;
  assert.equal(contentSha256, createHash('sha256').update(JSON.stringify(hashedContent)).digest('hex'));
});
