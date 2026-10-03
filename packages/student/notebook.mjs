// Synthetic, session-memory notebook only. This is not authentication, enrolment
// authorization, persistence, sharing, or a curriculum-target approval service.
// Render all text with textContent (or equivalent), never as HTML.

export const NOTEBOOK_PALETTE = Object.freeze(['#1c3532', '#a44b35', '#2f6377', '#8b5e32', '#6f527a']);
export const NOTEBOOK_STROKE_WIDTHS = Object.freeze([2, 4, 6, 10]);
const trustedStates = new WeakSet();
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,95}$/;
const CONTEXT_KEYS = Object.freeze(['schoolId', 'learnerId', 'grade', 'schoolYear']);
const ACTION_FIELDS = new Map([
  ['text.set', ['type', 'context', 'text']],
  ['text.clear', ['type', 'context']],
  ['stroke.add', ['type', 'context', 'stroke']],
  ['stroke.undo', ['type', 'context']],
  ['drawing.clear', ['type', 'context']],
  ['bookmark.toggle', ['type', 'context', 'kind', 'id', 'grade']],
  ['note.add', ['type', 'context', 'id', 'text', 'grade']],
  ['concern.add', ['type', 'context', 'id', 'text', 'grade']],
]);

function fail(code) { throw new Error(code); }

function record(value, allowedKeys, errorCode) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(errorCode);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) fail(errorCode);
  const copy = {};
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !allowedKeys.includes(key)) fail(errorCode);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail(errorCode);
    copy[key] = descriptor.value;
  }
  return copy;
}

function contextSnapshot(value) {
  const copy = record(value, CONTEXT_KEYS, 'notebook_context_invalid');
  if (!CONTEXT_KEYS.every(key => Object.hasOwn(copy, key))
      || typeof copy.schoolId !== 'string' || !ID.test(copy.schoolId) || !/^(?:demo|synthetic)-/.test(copy.schoolId)
      || typeof copy.learnerId !== 'string' || !ID.test(copy.learnerId) || !/^synthetic-/.test(copy.learnerId)
      || !Number.isInteger(copy.grade) || copy.grade < 1 || copy.grade > 8
      || typeof copy.schoolYear !== 'string' || !/^20\d{2}-20\d{2}$/.test(copy.schoolYear)) fail('notebook_context_invalid');
  const [firstYear, secondYear] = copy.schoolYear.split('-').map(Number);
  if (secondYear !== firstYear + 1) fail('notebook_context_invalid');
  return copy;
}

function freezeTree(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeTree(child);
  return Object.freeze(value);
}

function trust(state) {
  freezeTree(state);
  trustedStates.add(state);
  return state;
}

function textValue(value, allowBlank = false) {
  // 4000 UTF-16 code units: deterministic and bounded in both Node and browser.
  if (typeof value !== 'string' || value.length > 4000 || (!allowBlank && !value.trim())) fail('notebook_text_invalid');
  return value;
}

function identifier(value, errorCode) {
  if (typeof value !== 'string' || !ID.test(value)) fail(errorCode);
  return value;
}

function strokeSnapshot(value) {
  const copy = record(value, ['id', 'color', 'width', 'points'], 'notebook_stroke_invalid');
  identifier(copy.id, 'notebook_stroke_invalid');
  if (!NOTEBOOK_PALETTE.includes(copy.color) || !NOTEBOOK_STROKE_WIDTHS.includes(copy.width)
      || !Array.isArray(copy.points) || copy.points.length < 1 || copy.points.length > 512) fail('notebook_stroke_invalid');
  const points = [];
  for (let i = 0; i < copy.points.length; i++) {
    const descriptor = Object.getOwnPropertyDescriptor(copy.points, String(i));
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) fail('notebook_stroke_invalid');
    const point = record(descriptor.value, ['x', 'y'], 'notebook_stroke_invalid');
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)
        || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) fail('notebook_stroke_invalid');
    points.push({ x: point.x === 0 ? 0 : point.x, y: point.y === 0 ? 0 : point.y });
  }
  return { id: copy.id, color: copy.color, width: copy.width, points };
}

function nextState(state, patch) {
  return trust({ ...state, ...patch, revision: state.revision + 1 });
}

export function createNotebook(value) {
  const input = record(value, ['context'], 'notebook_context_invalid');
  const context = contextSnapshot(input.context);
  return trust({
    schemaVersion: '1.0.0', dataMode: 'synthetic', storageMode: 'memory_only',
    context, revision: 0, text: '', strokes: [],
    bookmarks: { questions: [], topics: [] }, notes: [], concerns: [],
  });
}

export function updateNotebook(state, value) {
  if (!state || !trustedStates.has(state)) fail('notebook_state_required');
  const input = record(value, ['type', 'context', 'text', 'stroke', 'kind', 'id', 'grade'], 'notebook_action_invalid');
  const fields = ACTION_FIELDS.get(input.type);
  if (!fields) fail('notebook_action_invalid');
  const action = record(value, fields, 'notebook_action_invalid');
  const scope = contextSnapshot(action.context);
  if (!CONTEXT_KEYS.every(key => scope[key] === state.context[key])) fail('notebook_scope_mismatch');

  switch (action.type) {
    case 'text.set': {
      const text = textValue(action.text, true);
      return text === state.text ? state : nextState(state, { text });
    }
    case 'text.clear':
      return state.text ? nextState(state, { text: '' }) : state;
    case 'stroke.add': {
      const stroke = strokeSnapshot(action.stroke);
      if (state.strokes.some(item => item.id === stroke.id)) fail('notebook_stroke_duplicate');
      if (state.strokes.length >= 64) fail('notebook_stroke_limit');
      return nextState(state, { strokes: [...state.strokes, stroke] });
    }
    case 'stroke.undo':
      return state.strokes.length ? nextState(state, { strokes: state.strokes.slice(0, -1) }) : state;
    case 'drawing.clear':
      return state.strokes.length ? nextState(state, { strokes: [] }) : state;
    case 'bookmark.toggle': {
      if (action.grade !== scope.grade) fail('notebook_grade_mismatch');
      identifier(action.id, 'notebook_action_invalid');
      const key = action.kind === 'question' ? 'questions' : action.kind === 'topic' ? 'topics' : null;
      if (!key) fail('notebook_action_invalid');
      const selected = state.bookmarks[key];
      const exists = selected.includes(action.id);
      if (!exists && state.bookmarks.questions.length + state.bookmarks.topics.length >= 100) fail('notebook_bookmark_limit');
      const items = exists ? selected.filter(id => id !== action.id) : [...selected, action.id];
      return nextState(state, { bookmarks: { ...state.bookmarks, [key]: items } });
    }
    case 'note.add':
    case 'concern.add': {
      if (action.grade !== scope.grade) fail('notebook_grade_mismatch');
      identifier(action.id, 'notebook_action_invalid');
      const text = textValue(action.text);
      const key = action.type === 'note.add' ? 'notes' : 'concerns';
      const prefix = key === 'notes' ? 'notebook_note' : 'notebook_concern';
      if (state[key].some(item => item.id === action.id)) fail(`${prefix}_duplicate`);
      if (state[key].length >= 100) fail(`${prefix}_limit`);
      return nextState(state, { [key]: [...state[key], { id: action.id, text, grade: action.grade, format: 'plain_text' }] });
    }
    default: fail('notebook_action_invalid');
  }
}
