import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createSyntheticStudentContext, getStudentWorkspace } from '../packages/student/workspace.mjs';

const registry = JSON.parse(await readFile(new URL('../sources/meb-reference-registry.json', import.meta.url), 'utf8'));
const notebookSource = await readFile(new URL('../packages/student/notebook.mjs', import.meta.url), 'utf8');
const studentSource = await readFile(new URL('../packages/student/student.mjs', import.meta.url), 'utf8');

// Run the real frontend and notebook logic in one realm. Only browser DOM,
// transport and pointer-delivery boundaries are fixtures; no drawing handler
// or notebook operation is reimplemented here. This is not a device test.
async function openNotebook() {
  const resolved = getStudentWorkspace({
    context: createSyntheticStudentContext(), sourceRegistry: registry,
    now: '2026-10-03T12:00:00.000Z',
  });
  assert.equal(resolved.allowed, true, 'the real synthetic workspace fixture must be eligible');
  const elements = new Map();
  const captures = new Set();
  const drawingContext = {
    setTransform() {}, clearRect() {}, beginPath() {}, arc() {}, fill() {},
    moveTo() {}, lineTo() {}, stroke() {},
  };
  function element(id = '') {
    if (!elements.has(id)) {
      const listeners = new Map();
      elements.set(id, {
        id, hidden: true, disabled: false, value: '', textContent: '',
        dataset: {}, childNodes: [], attributes: new Map(), listeners,
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener(type, listener) { listeners.set(type, listener); },
        setAttribute(name, value) { this.attributes.set(name, value); },
        removeAttribute(name) { this.attributes.delete(name); },
        append(...children) { this.childNodes.push(...children); },
        replaceChildren(...children) { this.childNodes = children; },
        querySelectorAll() { return []; },
        getClientRects() { return [{}]; },
        focus() {},
        getBoundingClientRect() { return { left: 20, top: 30, width: 500, height: 400 }; },
        getContext() { return drawingContext; },
        setPointerCapture(pointerId) { captures.add(pointerId); },
        hasPointerCapture(pointerId) { return captures.has(pointerId); },
        releasePointerCapture(pointerId) { captures.delete(pointerId); },
      });
    }
    return elements.get(id);
  }
  let created = 0;
  const document = {
    getElementById: element,
    addEventListener() {},
    querySelector(query) {
      return query.includes('pen-color') ? { value: '#1c3532' } : element(query);
    },
    querySelectorAll() { return []; },
    createElement(tag) { return element(`created-${tag}-${++created}`); },
    createDocumentFragment() { return element(`fragment-${++created}`); },
    body: { classList: { add() {}, remove() {} } },
  };
  const context = vm.createContext({
    document, window: { devicePixelRatio: 1, addEventListener() {}, scrollTo() {} },
    AbortController, setTimeout, clearTimeout,
    workspaceFixtureJSON: JSON.stringify(resolved.workspace),
  });
  // JSON parsing occurs in the browser realm just as response.json() would,
  // preserving the notebook's strict own-plain-record validation.
  vm.runInContext(`
    globalThis.fetch = async (url, options) => {
      if (url !== '/api/workspace' || options.method !== 'GET'
          || options.credentials !== 'omit' || options.cache !== 'no-store') {
        throw new Error('unexpected_transport_boundary');
      }
      return { ok: true, json: async () => JSON.parse(workspaceFixtureJSON) };
    };
  `, context);
  const notebookScript = notebookSource.replace(/^export /gm, '');
  const frontendScript = studentSource
    .replace(/^import[^\n]+\n/, '')
    .replace(/loadWorkspace\(\);\s*$/, 'globalThis.boot = loadWorkspace();');
  vm.runInContext(`${notebookScript}\n${frontendScript}`, context, { filename: 'real-student-frontend.mjs' });
  await context.boot;
  assert.equal(vm.runInContext('state.phase', context), 'ready', 'the real loadWorkspace must open the fixture');
  vm.runInContext("showPage('notebook', null, { focus: false })", context);
  const canvas = element('notebook-canvas');
  return {
    dispatch(type, pointerId, { pointerType = 'pen', clientX = 120, clientY = 130 } = {}) {
      const listener = canvas.listeners.get(type);
      assert.equal(typeof listener, 'function', `the frontend must register ${type}`);
      listener({ type, pointerId, pointerType, button: 0, clientX, clientY, preventDefault() {} });
    },
    strokes() { return JSON.parse(vm.runInContext('JSON.stringify(state.notebook.strokes)', context)); },
    hasCapture(pointerId) { return captures.has(pointerId); },
  };
}

test('canceling a second contact preserves the active pen stroke and its capture', async () => {
  const notebook = await openNotebook();
  notebook.dispatch('pointerdown', 1);
  notebook.dispatch('pointerdown', 2, { pointerType: 'touch' });
  notebook.dispatch('pointercancel', 2, { pointerType: 'touch' });
  assert.equal(notebook.hasCapture(1), true, 'an unrelated cancellation must not release the active pen');
  notebook.dispatch('pointermove', 1, { clientX: 270, clientY: 330 });
  notebook.dispatch('pointerup', 1);
  const strokes = notebook.strokes();
  assert.equal(strokes.length, 1, 'the active pen stroke must survive another contact being canceled');
  assert.deepEqual(strokes[0].points, [{ x: 0.2, y: 0.25 }, { x: 0.5, y: 0.75 }]);
  assert.equal(notebook.hasCapture(1), false, 'the completed pen stroke releases its own capture');
});

test('canceling the active pen discards that stroke, releases capture and permits a new stroke', async () => {
  const notebook = await openNotebook();
  notebook.dispatch('pointerdown', 1);
  notebook.dispatch('pointermove', 1, { clientX: 270, clientY: 330 });
  notebook.dispatch('pointercancel', 1);
  notebook.dispatch('pointerup', 1);
  assert.deepEqual(notebook.strokes(), [], 'a canceled active stroke must not be committed');
  assert.equal(notebook.hasCapture(1), false, 'the canceled active pen releases its capture');
  notebook.dispatch('pointerdown', 3);
  notebook.dispatch('pointerup', 3);
  assert.equal(notebook.strokes().length, 1, 'a new pen stroke must work after active cancellation');
});
