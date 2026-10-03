import test from 'node:test';
import assert from 'node:assert/strict';

const notebook = await import('../packages/student/notebook.mjs').catch(() => null);
const context = Object.freeze({
  schoolId: 'demo-school', learnerId: 'synthetic-student', grade: 6, schoolYear: '2026-2027',
});
const stroke = (id = 'stroke-1') => ({
  id, color: '#1c3532', width: 4, points: [{ x: 0.1, y: 0.2 }, { x: 0.8, y: 0.9 }],
});
function api() {
  assert.ok(notebook, 'The student notebook module is missing');
  return notebook;
}
function emptyNotebook() { return api().createNotebook({ context }); }
function apply(state, action) { return api().updateNotebook(state, { context, ...action }); }

test('new notebook contains a frozen synthetic memory-only owner scope and empty content', () => {
  const state = emptyNotebook();
  assert.equal(state.dataMode, 'synthetic');
  assert.equal(state.storageMode, 'memory_only');
  assert.deepEqual(state.context, context);
  assert.equal(state.text, '');
  assert.deepEqual(state.strokes, []);
  assert.deepEqual(state.bookmarks, { questions: [], topics: [] });
  assert.deepEqual(state.notes, []);
  assert.deepEqual(state.concerns, []);
  assert.ok(Object.isFrozen(state));
  assert.ok(Object.isFrozen(state.context));
  assert.throws(() => { state.context.grade = 7; }, TypeError);
});

test('text editing creates a new revision without mutating previous state and enforces 4000-character limit', () => {
  const first = emptyNotebook();
  const next = apply(first, { type: 'text.set', text: 'Alanı önce birim karelerle düşünmeliyim.' });
  assert.equal(first.text, '');
  assert.equal(first.revision, 0);
  assert.equal(next.revision, 1);
  assert.equal(next.text, 'Alanı önce birim karelerle düşünmeliyim.');
  assert.equal(apply(next, { type: 'text.set', text: 'a'.repeat(4000) }).text.length, 4000);
  assert.throws(() => apply(next, { type: 'text.set', text: 'a'.repeat(4001) }), /notebook_text_invalid/);
});

test('HTML-looking notes remain explicit plain text rather than executable markup fields', () => {
  const state = apply(emptyNotebook(), {
    type: 'note.add', id: 'note-1', text: '<img src=x onerror=alert(1)>', grade: 6,
  });
  assert.deepEqual(state.notes[0], { id: 'note-1', text: '<img src=x onerror=alert(1)>', grade: 6, format: 'plain_text' });
  assert.equal(Object.hasOwn(state.notes[0], 'html'), false);
  assert.ok(Object.isFrozen(state.notes[0]));
});

test('stroke addition snapshots and freezes normalized point coordinates independently of caller mutation', () => {
  const drawing = stroke();
  const state = apply(emptyNotebook(), { type: 'stroke.add', stroke: drawing });
  drawing.points[0].x = 0.7;
  assert.equal(state.strokes[0].points[0].x, 0.1);
  assert.ok(Object.isFrozen(state.strokes[0]));
  assert.ok(Object.isFrozen(state.strokes[0].points));
  assert.ok(Object.isFrozen(state.strokes[0].points[0]));
  assert.throws(() => { state.strokes[0].points[0].y = 0.8; }, TypeError);
});

test('undo removes only the latest stroke and an empty drawing is a no-op', () => {
  const first = emptyNotebook();
  assert.equal(apply(first, { type: 'stroke.undo' }), first);
  let state = apply(first, { type: 'stroke.add', stroke: stroke('first') });
  state = apply(state, { type: 'stroke.add', stroke: stroke('last') });
  const next = apply(state, { type: 'stroke.undo' });
  assert.deepEqual(next.strokes.map(s => s.id), ['first']);
  assert.equal(state.strokes.length, 2);
});

test('drawing and text clearing leave other content untouched and preserve restorable prior reference', () => {
  let state = apply(emptyNotebook(), { type: 'text.set', text: 'Hatırlatıcı' });
  state = apply(state, { type: 'stroke.add', stroke: stroke() });
  const drawingCleared = apply(state, { type: 'drawing.clear' });
  assert.equal(drawingCleared.text, 'Hatırlatıcı');
  assert.equal(drawingCleared.strokes.length, 0);
  assert.equal(state.strokes.length, 1);
  const textCleared = apply(state, { type: 'text.clear' });
  assert.equal(textCleared.text, '');
  assert.equal(textCleared.strokes.length, 1);
  assert.equal(state.text, 'Hatırlatıcı');
  assert.equal(apply(state, { type: 'text.set', text: state.text }), state);
});

test('stroke limit and point limit reject additions without altering the previous drawing', () => {
  let state = emptyNotebook();
  const maxPoints = { ...stroke(), points: Array.from({ length: 512 }, () => ({ x: 0, y: 1 })) };
  state = apply(state, { type: 'stroke.add', stroke: maxPoints });
  assert.equal(state.strokes[0].points.length, 512);
  assert.throws(() => apply(state, {
    type: 'stroke.add', stroke: { ...stroke('too-many-points'), points: [...maxPoints.points, { x: 0.5, y: 0.5 }] },
  }), /notebook_stroke_invalid/);
  for (let i = 1; i < 64; i++) state = apply(state, { type: 'stroke.add', stroke: stroke(`stroke-${i + 1}`) });
  assert.equal(state.strokes.length, 64);
  assert.throws(() => apply(state, { type: 'stroke.add', stroke: stroke('stroke-65') }), /notebook_stroke_limit/);
  assert.equal(state.strokes.length, 64);
});

test('coordinates, palette, widths and duplicate stroke identifiers are validated', () => {
  const first = emptyNotebook();
  for (const bad of [
    { ...stroke(), color: 'url(javascript:alert(1))' },
    { ...stroke(), width: 300 },
    { ...stroke(), points: [] },
    { ...stroke(), points: [{ x: -0.1, y: 0 }] },
    { ...stroke(), points: [{ x: 0, y: 1.1 }] },
    { ...stroke(), points: [{ x: Number.NaN, y: 0 }] },
    { ...stroke(), points: [{ x: 0, y: Number.POSITIVE_INFINITY }] },
  ]) assert.throws(() => apply(first, { type: 'stroke.add', stroke: bad }), /notebook_stroke_invalid/);
  const next = apply(first, { type: 'stroke.add', stroke: stroke() });
  assert.throws(() => apply(next, { type: 'stroke.add', stroke: stroke() }), /notebook_stroke_duplicate/);
});

test('question and topic bookmarks toggle identifier-only membership independently', () => {
  let state = apply(emptyNotebook(), { type: 'bookmark.toggle', kind: 'question', id: 'rectangle-1', grade: 6 });
  state = apply(state, { type: 'bookmark.toggle', kind: 'topic', id: 'rectangle-1', grade: 6 });
  assert.deepEqual(state.bookmarks, { questions: ['rectangle-1'], topics: ['rectangle-1'] });
  const next = apply(state, { type: 'bookmark.toggle', kind: 'question', id: 'rectangle-1', grade: 6 });
  assert.deepEqual(next.bookmarks, { questions: [], topics: ['rectangle-1'] });
  assert.equal(state.bookmarks.questions.length, 1);
  assert.throws(() => apply(state, {
    type: 'bookmark.toggle', kind: 'question', id: 'q2', grade: 6, questionData: { answer: 'B' },
  }), /notebook_action_invalid/);
});

test('bookmarks share a 100-item limit and removal still works when at capacity', () => {
  let state = emptyNotebook();
  for (let i = 0; i < 100; i++) state = apply(state, {
    type: 'bookmark.toggle', kind: i % 2 ? 'topic' : 'question', id: `item-${i}`, grade: 6,
  });
  assert.equal(state.bookmarks.questions.length + state.bookmarks.topics.length, 100);
  assert.throws(() => apply(state, { type: 'bookmark.toggle', kind: 'topic', id: 'overflow', grade: 6 }), /notebook_bookmark_limit/);
  const next = apply(state, { type: 'bookmark.toggle', kind: 'question', id: 'item-0', grade: 6 });
  assert.equal(next.bookmarks.questions.length + next.bookmarks.topics.length, 99);
});

test('notes and concerns are bounded, unique, plain-text entries', () => {
  let state = emptyNotebook();
  for (let i = 0; i < 100; i++) {
    state = apply(state, { type: 'note.add', id: `note-${i}`, text: 'Çevre bütün kenarları kapsar.', grade: 6 });
    state = apply(state, { type: 'concern.add', id: `concern-${i}`, text: 'Alan birimlerini tekrar çalışacağım.', grade: 6 });
  }
  assert.equal(state.notes.length, 100);
  assert.equal(state.concerns.length, 100);
  assert.equal(state.concerns[0].format, 'plain_text');
  assert.throws(() => apply(state, { type: 'note.add', id: 'extra-note', text: 'Not', grade: 6 }), /notebook_note_limit/);
  assert.throws(() => apply(state, { type: 'concern.add', id: 'extra-concern', text: 'Konu', grade: 6 }), /notebook_concern_limit/);
  assert.throws(() => apply(state, { type: 'note.add', id: 'note-0', text: 'Değiştirme', grade: 6 }), /notebook_note_duplicate/);
});

test('invalid or blank note and concern text cannot become records', () => {
  const state = emptyNotebook();
  for (const text of ['', '  ', 'a'.repeat(4001), 123, null]) {
    assert.throws(() => apply(state, { type: 'note.add', id: 'bad-note', text, grade: 6 }), /notebook_text_invalid/);
    assert.throws(() => apply(state, { type: 'concern.add', id: 'bad-concern', text, grade: 6 }), /notebook_text_invalid/);
  }
});

test('foreign owner, school, year and grade contexts cannot update a notebook', () => {
  const { updateNotebook } = api();
  const state = emptyNotebook();
  for (const changed of [
    { ...context, schoolId: 'demo-other-school' },
    { ...context, learnerId: 'synthetic-other-student' },
    { ...context, schoolYear: '2025-2026' },
    { ...context, grade: 7 },
  ]) assert.throws(() => updateNotebook(state, { type: 'text.set', context: changed, text: 'Yabancı kapsam' }), /notebook_scope_mismatch/);
  assert.equal(state.text, '');
});

test('bookmark, note and concern targets in another grade are rejected even under matching owner scope', () => {
  const state = emptyNotebook();
  for (const action of [
    { type: 'bookmark.toggle', kind: 'question', id: 'foreign-question', grade: 5 },
    { type: 'note.add', id: 'foreign-note', text: 'Not', grade: 7 },
    { type: 'concern.add', id: 'foreign-concern', text: 'Konu', grade: 8 },
  ]) assert.throws(() => apply(state, action), /notebook_grade_mismatch/);
});

test('real learner scopes, unsupported grade and malformed school year cannot create synthetic notebook', () => {
  const { createNotebook } = api();
  for (const invalid of [
    { ...context, schoolId: 'real-school' },
    { ...context, learnerId: 'real-learner' },
    { ...context, grade: 0 },
    { ...context, grade: 9 },
    { ...context, grade: 6.5 },
    { ...context, schoolYear: '2026-2028' },
  ]) assert.throws(() => createNotebook({ context: invalid }), /notebook_context_invalid/);
});

test('forged or serialized notebook state cannot bypass trusted immutable session state', () => {
  const { updateNotebook } = api();
  const state = emptyNotebook();
  assert.throws(() => updateNotebook({ ...state }, { type: 'text.set', context, text: 'Bypass' }), /notebook_state_required/);
  assert.throws(() => updateNotebook(JSON.parse(JSON.stringify(state)), { type: 'text.set', context, text: 'Bypass' }), /notebook_state_required/);
});

test('action accessors and unknown fields are rejected without invoking an accessor', () => {
  const { updateNotebook } = api();
  let invoked = false;
  const action = { type: 'text.set', context };
  Object.defineProperty(action, 'text', { enumerable: true, get() { invoked = true; return 'secret'; } });
  assert.throws(() => updateNotebook(emptyNotebook(), action), /notebook_action_invalid/);
  assert.equal(invoked, false);
  assert.throws(() => apply(emptyNotebook(), { type: 'text.set', text: 'safe', html: '<script>bad()</script>' }), /notebook_action_invalid/);
  assert.throws(() => apply(emptyNotebook(), { type: 'unknown' }), /notebook_action_invalid/);
});
