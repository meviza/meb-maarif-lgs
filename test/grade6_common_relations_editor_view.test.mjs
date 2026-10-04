import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsDraft } from '../packages/content-factory/grade6_common_relations_draft.mjs';

const api = await import('../packages/content-factory/grade6_common_relations_editor_view.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [observations, matrix, registry] = await Promise.all(['grade6-common-relations-application-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry'].map(load));
const clone = value => structuredClone(value);
function source() { return { applicationObservations: clone(observations), semanticMatrix: clone(matrix),
  sourceRecord: clone(registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik')) }; }
function render(candidate, input) {
  assert.equal(typeof api.renderGrade6CommonRelationsEditorView, 'function', 'common-relations editor renderer is missing');
  return api.renderGrade6CommonRelationsEditorView(candidate, input);
}
function view() { const input = source(); return render(createGrade6CommonRelationsDraft(input), input); }
const canonical = value => Array.isArray(value) ? value.map(canonical) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
function rehash(value) {
  value.contentSha256 = createHash('sha256').update(`k12.grade6-common-relations.draft/v1:${JSON.stringify(canonical(
    Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'contentSha256'))))}`).digest('hex');
  return value;
}

// Parse the actual narrow emitted HTML/SVG tree; this is not browser/AX proof.
const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39);/gu, value => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[value]);
function tree(html) {
  const root = { tag: '#root', attrs: {}, children: [] }, stack = [root], voids = new Set(['meta', 'link', 'br', 'hr', 'input', 'img', 'source']);
  for (const token of html.match(/<![^>]*>|<[^>]*>|[^<]+/gu) ?? []) {
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) { assert.equal(stack.pop().tag, token.slice(2, -1).trim()); continue; }
    if (token.startsWith('<')) {
      const match = /^<([a-z][a-z0-9-]*)([\s\S]*?)>$/u.exec(token); assert.ok(match, 'well-formed emitted element');
      const attrs = {};
      for (const item of match[2].matchAll(/([A-Za-z_:][A-Za-z0-9_:.-]*)(?:="([^"]*)")?/gu)) attrs[item[1]] = item[2] === undefined ? true : decode(item[2]);
      const node = { tag: match[1], attrs, children: [] }; stack.at(-1).children.push(node);
      if (!voids.has(node.tag)) stack.push(node);
    } else stack.at(-1).children.push(decode(token));
  }
  assert.equal(stack.length, 1); return root;
}
function all(node, tag) { return (typeof node === 'string' ? [] : [node, ...node.children.flatMap(child => all(child, tag))]).filter(item => item.tag === tag); }
const text = node => typeof node === 'string' ? node : node.children.map(text).join('').replace(/\s+/gu, ' ').trim();
const cells = table => all(table, 'tbody').flatMap(body => all(body, 'tr').map(row => row.children
  .filter(item => typeof item !== 'string' && ['th', 'td'].includes(item.tag)).map(text)));

// Break: SVG is a placeholder, has a wrong event time, or collapses both series to the same shape.
test('actual inline SVG contains two differently shaped series at the literal time coordinates including start and endpoint', () => {
  const document = tree(view().html), svgs = all(document, 'svg'); assert.equal(svgs.length, 1);
  const svg = svgs[0], circles = all(svg, 'circle'), squares = all(svg, 'rect');
  assert.deepEqual(circles.map(node => Number(node.attrs['data-minute'])), [0, 6, 12, 18, 24, 30, 36, 42, 48]);
  assert.deepEqual(squares.map(node => Number(node.attrs['data-minute'])), [0, 8, 16, 24, 32, 40, 48]);
  assert.deepEqual(circles.map(node => Number(node.attrs.cx)), [120, 192, 264, 336, 408, 480, 552, 624, 696]);
  assert.deepEqual(squares.map(node => Number(node.attrs.x) + Number(node.attrs.width) / 2), [120, 216, 312, 408, 504, 600, 696]);
  assert.equal(new Set(circles.map(node => node.attrs.cy)).size, 1); assert.equal(new Set(squares.map(node => node.attrs.y)).size, 1);
  assert.notEqual(Number(circles[0].attrs.cy), Number(squares[0].attrs.y) + Number(squares[0].attrs.height) / 2);
  for (const marks of [circles, squares]) {
    assert.equal(marks[0].attrs['data-in-window'], 'false'); assert.equal(marks.at(-1).attrs['data-in-window'], 'true');
  }
  const minuteLabels = all(svg, 'text').filter(node => node.attrs['data-minute-label']);
  assert.deepEqual(minuteLabels.map(node => Number(text(node))), [0, 6, 12, 18, 24, 30, 36, 42, 48, 0, 8, 16, 24, 32, 40, 48]);
  assert.equal(all(svg, 'text').every(node => Number(node.attrs['font-size']) >= 18), true);
  assert.equal(view().manifest.timelineMarkCount, 16); assert.equal(view().manifest.inlineSvgCount, 1);
});

// Break: a viewport-squeezed graphic loses its textual equivalent or scroll area is unnamed/unreachable.
test('time figure has independent textual and semantic table equivalents with a named keyboard-reachable scroll region', () => {
  const document = tree(view().html), svg = all(document, 'svg')[0];
  assert.equal(svg.attrs.role, 'img'); assert.equal(all(svg, 'title').length, 1); assert.equal(all(svg, 'desc').length, 1);
  assert.deepEqual(svg.attrs['aria-labelledby'].split(' '), [all(svg, 'title')[0].attrs.id, all(svg, 'desc')[0].attrs.id]);
  assert.equal(all(svg, 'text').some(node => text(node) === '6 dk'), true); assert.equal(all(svg, 'text').some(node => text(node) === '8 dk'), true);
  assert.equal(Number(svg.attrs.width), 760); assert.equal(Number(svg.attrs.height), 240);
  const regions = all(document, 'div').filter(node => node.attrs.role === 'region'); assert.equal(regions.length, 1);
  assert.equal(regions[0].attrs.tabindex, '0'); assert.equal(typeof regions[0].attrs['aria-label'], 'string');
  const table = all(document, 'table').find(node => node.attrs.id === 'repeat-equivalent-table');
  assert.deepEqual(cells(table), [['6 dakika', '6, 12, 18, 24, 30, 36, 42, 48'], ['8 dakika', '8, 16, 24, 32, 40, 48']]);
  const caption = all(document, 'figcaption')[0]; assert.equal(text(caption).includes('daire'), true); assert.equal(text(caption).includes('kare'), true);
  assert.equal(text(caption).includes('0'), true); assert.equal(text(caption).includes('48'), true);
});

// Break: group size and package count swap columns or an incorrect divisor row appears.
test('grouping semantic table preserves all six literal size and two count rows with units in the headers', () => {
  const document = tree(view().html), tables = all(document, 'table'); assert.equal(tables.length, 2);
  const table = tables.find(node => node.attrs.id === 'group-size-table');
  assert.deepEqual(cells(table), [['1', '24', '36'], ['2', '12', '18'], ['3', '8', '12'], ['4', '6', '9'], ['6', '4', '6'], ['12', '2', '3']]);
  assert.equal(all(table, 'caption').length, 1); assert.equal(all(table, 'thead').length, 1);
  const headers = all(all(table, 'thead')[0], 'th'); assert.equal(headers.length, 3); assert.ok(text(headers[0]).includes('kart/paket'));
  assert.ok(text(headers[1]).includes('paket')); assert.ok(text(headers[2]).includes('paket'));
  assert.equal(headers.every(node => node.attrs.scope === 'col'), true); assert.equal(all(all(table, 'tbody')[0], 'th').every(node => node.attrs.scope === 'row'), true);
  assert.equal(view().manifest.groupRowCount, 6);
});

// Break: author evidence is normalized or the correct card gets a default presentation marker.
test('four neutral cards retain their literal numbers and distinct units without correctness or selection markers', () => {
  const document = tree(view().html), cards = all(document, 'article');
  assert.deepEqual(cards.map(node => node.attrs['data-card-id']), ['evidence-repeat', 'evidence-group-size', 'evidence-sum', 'evidence-package-counts']);
  assert.deepEqual(cards.map(card => all(card, 'output').map(text)), [['24, 48'], ['1, 2, 3, 4, 6, 12'], ['14'], ['4, 6']]);
  assert.deepEqual(cards.map(card => all(card, 'p').filter(node => node.attrs['data-unit']).map(text)), [['Dakika'], ['Kart/paket'], ['Dakika'], ['Paket']]);
  assert.equal(new Set(cards.map(node => node.attrs.class)).size, 1);
  for (const card of cards) {
    assert.equal(Object.keys(card.attrs).some(key => /correct|selected|answer|checked/iu.test(key)), false);
    assert.equal(text(card).includes('Doğru eşleme'), false); assert.equal(all(card, 'input').length, 0);
  }
  assert.equal(view().manifest.evidenceCardCount, 4); assert.equal(view().manifest.defaultMatchingMarked, false);
});

// Break: calculation-only text replaces cause/meaning/unit/conditional limits or transfers are silently dropped.
test('one initially closed solution includes both full rationale paths three transfers and editor-only matching answers', () => {
  const document = tree(view().html), details = all(document, 'details'); assert.equal(details.length, 1);
  const solution = details[0]; assert.equal(Object.hasOwn(solution.attrs, 'open'), false); assert.equal(all(solution, 'summary').length, 1);
  const paths = all(solution, 'section').filter(node => node.attrs['data-rationale-context']); assert.equal(paths.length, 2);
  assert.deepEqual(paths.map(node => node.attrs['data-rationale-context']), ['repeat', 'grouping']);
  for (const path of paths) {
    const parts = all(path, 'p').map(node => node.attrs['data-rationale-part']).filter(Boolean);
    for (const name of ['goal', 'given', 'why', 'operation', 'result', 'meaning', 'when', 'note-why', 'check', 'not-implied']) assert.ok(parts.includes(name));
  }
  assert.deepEqual(paths.map(path => text(all(path, 'p').find(node => node.attrs['data-rationale-part'] === 'result'))), ['24, 48 · Dakika', '1, 2, 3, 4, 6, 12 · Kart/paket']);
  const transfers = all(solution, 'section').filter(node => node.attrs['data-transfer-id']);
  assert.deepEqual(transfers.map(node => node.attrs['data-transfer-id']), ['sum-not-common-time', 'window-boundary', 'group-size-not-count']);
  assert.equal(text(transfers[0]).includes('14'), true); assert.equal(text(transfers[0]).includes('2, 6'), true);
  assert.equal(text(transfers[1]).includes('72'), true); assert.equal(text(transfers[2]).includes('4, 6'), true);
  const answer = all(solution, 'section').find(node => node.attrs['data-editor-answer']); assert.ok(answer);
  assert.equal(all(answer, 'li').length, 2); assert.equal(view().manifest.answerBearingEditorArtifact, true);
  assert.equal(view().manifest.hiddenDetailsAreLearnerSecurity, false);
});

// Break: SVG includes an executable/external resource channel or markup is fetched as an external image.
test('emitted document permits only own inline vector primitives and has no script external resource or active event handler', () => {
  const document = tree(view().html);
  for (const tag of ['script', 'link', 'img', 'image', 'use', 'foreignobject', 'iframe', 'audio', 'video', 'form', 'input', 'button']) assert.equal(all(document, tag).length, 0);
  const walk = node => typeof node === 'string' ? [] : [node, ...node.children.flatMap(walk)];
  for (const node of walk(document)) for (const key of Object.keys(node.attrs)) {
    assert.equal(/^(?:on|href$|src$|xlink:href$)/iu.test(key), false);
  }
  const styles = all(document, 'style'); assert.equal(styles.length, 1); assert.equal(/url\s*\(|@import|@font-face/iu.test(text(styles[0])), false);
  const csp = all(document, 'meta').find(node => node.attrs['http-equiv'] === 'Content-Security-Policy'); assert.ok(csp);
  assert.equal(csp.attrs.content.includes("script-src 'none'"), true); assert.equal(csp.attrs.content.includes("connect-src 'none'"), true);
  assert.equal(csp.attrs.content.includes("default-src 'none'"), true);
  assert.equal(all(document, 'html')[0].attrs.lang, 'tr');
});

// Break: renderer modifies original semantic/source state or promotes the draft to a delivered product.
test('canonical lineage source state and pending scope survive rendering without new question stock or approval', () => {
  const input = source(), draft = createGrade6CommonRelationsDraft(input), before = JSON.stringify({ draft, input });
  const output = render(draft, input), manifest = output.manifest; assert.equal(JSON.stringify({ draft, input }), before);
  assert.equal(draft.representation.rendered, false); assert.equal(output.schemaVersion, 'grade6-common-relations-editor-view/v1'); assert.equal(output.state, 'editor_review_only');
  assert.equal(manifest.draftContentSha256, draft.contentSha256); assert.equal(manifest.authoredTaskSha256, draft.authoredTaskSha256);
  assert.equal(manifest.sourceSha256, draft.sourceLineage.sourceSha256); assert.equal(manifest.applicationMetadataSha256, draft.sourceLineage.applicationMetadataSha256);
  assert.deepEqual(manifest.counts, { existingAuthoredDrafts: 1, newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  assert.equal(Object.values(manifest.gates).every(state => state === 'pending'), true);
  for (const key of ['publicationReady', 'learnerReady', 'productionReady', 'accessibilityPassed', 'nativeVisualReviewPassed', 'serializedHashIsAuthority', 'fullOutcomeCoverage']) assert.equal(manifest[key], false);
  assert.equal(manifest.humanApproval, null); assert.equal(manifest.activeAcademicYear, null); assert.equal(manifest.programVersion, null);
  assert.equal(manifest.officialOutcomeCode, null); assert.equal(manifest.freshPdfByteChecks, 0);
  assert.equal(manifest.evidenceKind, 'matching_of_given_evidence'); assert.equal(manifest.learnerEvidenceCollected, false);
  assert.deepEqual(manifest.activity, { htmlProduced: 1, inlineSvgsProduced: 1, pngProduced: 0, audioProduced: 0, videosProduced: 0, networkCallsMade: 0, providersCalled: 0 });
});

// Break: outputs are mutable, digest mismatched, or intent is mislabeled as completed native review.
test('deterministic frozen manifest binds exact HTML UTF8 bytes without issuing native responsive or accessibility acceptance', () => {
  const a = view(); assert.deepEqual(view(), a);
  assert.equal(a.manifest.htmlSha256, createHash('sha256').update(a.html).digest('hex')); assert.equal(a.manifest.htmlBytes, Buffer.byteLength(a.html));
  assert.equal(a.manifest.htmlBytes <= 65536, true); assert.equal(Buffer.byteLength(JSON.stringify(a.manifest)) <= 16384, true);
  assert.equal(Object.isFrozen(a), true); assert.equal(Object.isFrozen(a.manifest.gates), true); assert.equal(Object.isFrozen(a.manifest.intendedReviewViewports[0]), true);
  assert.deepEqual(a.manifest.intendedReviewViewports, [{ width: 320, height: 844 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }]);
  assert.throws(() => { a.manifest.gates.answer = 'approved'; }, TypeError);
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  assert.deepEqual(render(reverse(createGrade6CommonRelationsDraft(source())), source()), a);
});

// Break: a recomputed caller hash legitimizes wrong math, a wrong matching key, units or an alternate horizon.
test('rehashing answer unit missing-candidate and scope alterations never generates an editor document', () => {
  for (const mutate of [d => { d.answerKey.repeat = 'evidence-sum'; }, d => { d.problem.evidenceCards[0].values = [0, 24, 48]; },
    d => { d.problem.evidenceCards[1].values.pop(); }, d => { d.problem.evidenceCards[1].unit = 'package'; },
    d => { d.problem.contexts[0].window.to = 72; }, d => { d.scope.formalGcdLcmTeachingAllowed = true; },
    d => { d.purpose.evidenceKind = 'learner_constructed_proof'; }, d => { d.gates.answer = 'approved'; d.humanApproval = true; },
    d => { d.sourceLineage.sourceSha256 = 'f'.repeat(64); }]) {
    const input = source(), draft = clone(createGrade6CommonRelationsDraft(input)); mutate(draft); rehash(draft);
    assert.throws(() => render(draft, input), error => error.message === 'invalid_common_relations_editor_input');
  }
});

// Break: unsanitized failed candidate text becomes HTML, SVG event handlers or an error echo.
test('markup and malformed candidate containers return only constant rejection without output or text echo', () => {
  for (const mutate of [d => { d.prompt = '</style><script>secret</script>'; }, d => { d.problem.evidenceCards[0].label = '<svg onload="secret">'; },
    d => { d.representation.repeatSequences = new Array(2); }, d => { d.explanation.paths = null; },
    d => { d.explanation.transfers = [null]; }, d => { d.problem.contexts[0].intervals = [0, 8]; }, d => { d.prompt = 'x'.repeat(65537); }]) {
    const input = source(), draft = clone(createGrade6CommonRelationsDraft(input)); mutate(draft);
    // A sparse array is intentionally left sparse; hashing is not an authority.
    rehash(draft); assert.throws(() => render(draft, input), error => error.message === 'invalid_common_relations_editor_input');
  }
});

// Break: source metadata flags or a caller-authenticated hash are accepted instead of canonical pins.
test('changed full source snapshots source approvals and serialized claims cannot produce a view', () => {
  const input = source(), draft = createGrade6CommonRelationsDraft(input);
  for (const mutate of [s => { s.applicationObservations.boundaries.formalGcdLcmTeachingAllowed = true; },
    s => { s.sourceRecord.reuseRights = 'approved'; }, s => { s.semanticMatrix.source.sha256 = 'f'.repeat(64); }]) {
    const changed = source(); mutate(changed); assert.throws(() => render(draft, changed), /invalid_common_relations_editor_input/u);
  }
  for (const claim of [{ approved: true, sourceSha256: draft.sourceLineage.sourceSha256 }, null, {}]) assert.throws(() => render(draft, claim), /invalid_common_relations_editor_input/u);
});

// Break: descriptor getters/proxies/coercion run while composing output or after passing the source verifier.
test('hostile source and candidate inputs execute zero hooks and fail in a constant bounded way', () => {
  let hooks = 0; const getter = {}; Object.defineProperty(getter, 'problem', { enumerable: true, get() { hooks++; return {}; } });
  const proxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; return []; } }); const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const cycle = {}; cycle.x = cycle; const nested = clone(createGrade6CommonRelationsDraft(source()));
  Object.defineProperty(nested.problem.evidenceCards[0], 'values', { enumerable: true, get() { hooks++; return [24, 48]; } });
  const hidden = clone(createGrade6CommonRelationsDraft(source())); Object.defineProperty(hidden, 'approval', { value: true });
  for (const candidate of [getter, proxy, revoked.proxy, cycle, nested, hidden, () => { hooks++; }, null]) assert.throws(() => render(candidate, source()), /invalid_common_relations_editor_input/u);
  const sg = source(); Object.defineProperty(sg, 'sourceRecord', { enumerable: true, get() { hooks++; return {}; } });
  const sp = new Proxy(source(), { get() { hooks++; }, ownKeys() { hooks++; return []; } });
  const draft = createGrade6CommonRelationsDraft(source());
  for (const value of [sg, sp, revoked.proxy]) assert.throws(() => render(draft, value), /invalid_common_relations_editor_input/u);
  assert.equal(hooks, 0);
});

// Break: extra template/asset/approval hooks become an arbitrary rendering channel.
test('exact two-argument API rejects extra and missing options before executing their hooks', () => {
  assert.equal(typeof api.renderGrade6CommonRelationsEditorView, 'function');
  let hooks = 0; const extra = new Proxy({}, { get() { hooks++; } }), input = source(), draft = createGrade6CommonRelationsDraft(input);
  for (const args of [[], [draft], [draft, input, extra]]) assert.throws(() => api.renderGrade6CommonRelationsEditorView(...args), /invalid_common_relations_editor_arguments/u);
  assert.equal(hooks, 0);
});
