import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const workspace = await import('../packages/student/workspace.mjs').catch(() => ({}));
const registry = JSON.parse(await readFile(new URL('../sources/meb-reference-registry.json', import.meta.url), 'utf8'));
const now = '2026-10-03T12:00:00.000Z';
function issue(options) { assert.equal(typeof workspace.createSyntheticStudentContext, 'function', 'server-issued synthetic context is not implemented'); return workspace.createSyntheticStudentContext(options); }
function resolve(context, options = {}) { assert.equal(typeof workspace.getStudentWorkspace, 'function', 'grade-isolated workspace policy is not implemented'); return workspace.getStudentWorkspace({ context, sourceRegistry: registry, now, ...options }); }

test('active annual school-year context exposes six grade-six course metadata cards and no unpublished content', () => {
  const result = resolve(issue());
  assert.equal(result.allowed, true);
  assert.equal(result.workspace.mode, 'synthetic_student_preview');
  assert.equal(result.workspace.grade, 6);
  assert.equal(result.workspace.schoolYear, '2026-2027');
  assert.equal(result.workspace.publicationEnabled, false);
  assert.deepEqual(result.workspace.courses.map(course => course.id), ['turkce', 'matematik', 'fen', 'sosyal', 'ingilizce', 'din']);
  assert.deepEqual(result.workspace.library, { questions: [], lessons: [], videos: [] });
  assert.equal(result.workspace.subscription.kind, 'annual_school_preview');
  assert.equal(JSON.stringify(result.workspace).includes('answerIndex'), false);
  assert.ok(result.workspace.courses.every(course => course.source.verification === 'source_catalog_metadata_only'));
});

test('missing or browser-forged copied context cannot claim synthetic server authority', () => {
  assert.equal(resolve(null).reason, 'server_context_required');
  const valid = issue();
  assert.equal(resolve(JSON.parse(JSON.stringify(valid))).reason, 'server_context_required');
  assert.equal(resolve({ role: 'student', grade: 6, tenantId: 'synthetic-school' }).allowed, false);
});

test('requested cross-grade, cross-year and cross-school scopes cannot read another workspace', () => {
  const context = issue();
  for (const requestedScope of [{ grade: 5 }, { schoolYear: '2027-2028' }, { schoolId: 'other-school' }]) assert.equal(resolve(context, { requestedScope }).reason, 'scope_mismatch');
});

test('annual entitlement is active only during its own school-year interval and expiry is exclusive', () => {
  const context = issue();
  assert.equal(resolve(context, { now: '2026-08-31T23:59:59.999Z' }).reason, 'subscription_not_started');
  assert.equal(resolve(context, { now: '2027-08-31T23:59:59.999Z' }).allowed, true);
  assert.equal(resolve(context, { now: '2027-09-01T00:00:00.000Z' }).reason, 'subscription_expired');
  assert.equal(resolve(context, { now: 'not-a-date' }).reason, 'invalid_time');
});

test('withdrawn, non-student or cross-tenant enrollment and wrong school-year subscription deny access', () => {
  for (const overrides of [
    { enrollment: { status: 'withdrawn' } }, { enrollment: { role: 'teacher' } }, { enrollment: { schoolId: 'other-school' } },
    { enrollment: { grade: 7 } }, { enrollment: { schoolYear: '2027-2028' } }, { subscription: { status: 'cancelled' } }, { subscription: { schoolYear: '2027-2028' } },
  ]) assert.equal(resolve(issue(overrides)).allowed, false);
});

test('missing, duplicate or unverified course source metadata cannot become a fallback content catalog', () => {
  const context = issue();
  for (const changed of [
    { ...registry, sources: registry.sources.filter(source => source.id !== 'tymm-current-ingilizce') },
    { ...registry, sources: [...registry.sources, registry.sources.find(source => source.id === 'tymm-current-ingilizce')] },
    { ...registry, sources: registry.sources.map(source => source.id === 'tymm-current-ingilizce' ? { ...source, grades: [8] } : source) },
  ]) assert.equal(resolve(context, { sourceRegistry: changed }).reason, 'course_catalog_unavailable');
});

test('browser editing a returned course card cannot mutate subsequent server policy resolution', () => {
  const context = issue();
  const result = resolve(context); result.workspace.grade = 8; result.workspace.courses[0].id = 'fake';
  const fresh = resolve(context);
  assert.equal(fresh.workspace.grade, 6); assert.equal(fresh.workspace.courses[0].id, 'turkce');
  assert.equal(Object.isFrozen(context), true); assert.equal(Object.isFrozen(context.enrollment), true);
});
