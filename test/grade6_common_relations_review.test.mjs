import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGrade6CommonRelationsDraft } from '../packages/content-factory/grade6_common_relations_draft.mjs';
import { createGrade6CommonRelationsMediaPreparation } from '../packages/content-factory/grade6_common_relations_media_adapter.mjs';
import { createGrade6CommonRelationsScenePlan, renderGrade6CommonRelationsCaptionFrame } from '../packages/media/grade6_common_relations_scene.mjs';

const api = await import('../packages/media/grade6_common_relations_review.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const load = async name => JSON.parse(await readFile(new URL(`../sources/${name}.json`, import.meta.url), 'utf8'));
const [applicationObservations, semanticMatrix, registry] = await Promise.all(['grade6-common-relations-application-observations',
  'grade6-source-semantic-candidate-matrix', 'meb-reference-registry'].map(load));
function setup() {
  const sourceBindingInput = structuredClone({ applicationObservations, semanticMatrix,
    sourceRecord: registry.sources.find(row => row.id === 'tymm-current-ortaokul-matematik') });
  const source = createGrade6CommonRelationsDraft(sourceBindingInput), preparation = createGrade6CommonRelationsMediaPreparation(source, sourceBindingInput);
  return { plan: createGrade6CommonRelationsScenePlan({ source, sourceBindingInput, preparation }), preparation };
}
function render(plan, options = {}) {
  assert.equal(typeof api.renderGrade6CommonRelationsReview, 'function', 'responsive common-relations review API is missing');
  return api.renderGrade6CommonRelationsReview(plan, options);
}
const sha = text => createHash('sha256').update(text).digest('hex');
const decode = text => text.replace(/&(?:amp|lt|gt|quot|apos|#39);/gu, value => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'" })[value]);
// Narrow emitted tree, not native HTML/AX verification. SVG is trusted renderer output.
function tree(html) {
  const root = { tag: '#root', attrs: {}, children: [] }, stack = [root], voids = new Set(['meta', 'br', 'hr']);
  for (const token of html.match(/<![^>]*>|<[^>]*>|[^<]+/gu) ?? []) {
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) { assert.equal(stack.pop().tag, token.slice(2, -1).trim()); continue; }
    if (token.startsWith('<')) {
      const match = /^<([A-Za-z][A-Za-z0-9-]*)([\s\S]*?)>$/u.exec(token); assert.ok(match);
      const attrs = {}; for (const item of match[2].matchAll(/([A-Za-z_:][A-Za-z0-9_:.-]*)(?:="([^"]*)")?/gu)) attrs[item[1]] = item[2] === undefined ? true : decode(item[2]);
      const node = { tag: match[1], attrs, children: [] }; stack.at(-1).children.push(node);
      if (!voids.has(node.tag) && !match[2].endsWith('/')) stack.push(node);
    } else stack.at(-1).children.push(decode(token));
  }
  assert.equal(stack.length, 1); return root;
}
const all = (node, tag) => (typeof node === 'string' ? [] : [node, ...node.children.flatMap(child => all(child, tag))]).filter(item => item.tag === tag);
const text = node => typeof node === 'string' ? node : node.children.map(text).join('').replace(/\s+/gu, ' ').trim();
const find = (root, id) => all(root, 'section').concat(all(root, 'div'), all(root, 'p')).find(node => node.attrs.id === id);
const rows = table => all(table, 'tbody').flatMap(body => all(body, 'tr').map(row => row.children.filter(c => typeof c !== 'string' && ['th', 'td'].includes(c.tag)).map(text)));
const invalid = error => error.message === 'invalid_common_relations_review_input';

// Break: reusing the all-in-one SVG squeezes captions into the source horizontal viewport or duplicates them in AX.
test('current caption is real semantic HTML outside a labelled keyboard-scrollable cropped and aria-hidden source SVG', () => {
  const { plan } = setup(), output = render(plan), document = tree(output.html), region = find(document, 'source-scroll');
  assert.equal(all(document, 'html')[0].attrs.lang, 'tr'); assert.equal(region.attrs.role, 'region');
  assert.equal(region.attrs.tabindex, '0'); assert.equal(typeof region.attrs['aria-label'], 'string');
  const svg = all(region, 'svg')[0]; assert.equal(svg.attrs['aria-hidden'], 'true'); assert.equal(svg.attrs.focusable, 'false');
  assert.equal(Number(svg.attrs.width), 760); assert.equal(Number(svg.attrs.height), 260);
  assert.deepEqual(svg.attrs.viewBox.split(' ').map(Number), [0, 0, 760, 260]);
  const caption = find(document, 'current-caption'); assert.ok(caption); assert.equal(all(region, 'p').includes(caption), false);
  const current = renderGrade6CommonRelationsCaptionFrame(plan, {}).frame.selectedPage.lines.join(' ').replace(/\s+/gu, ' ').trim();
  assert.equal(text(caption), current); assert.equal(output.manifest.captionOutsideGeometryScroll, true);
  assert.equal(output.manifest.svgAccessibility, 'hidden_with_canonical_given_table_equivalent');
});

// Native narrow-viewport break: horizontal content was intentionally scrollable
// but there was no visible guidance and no focusable equivalent-table region.
test('a visible source-scroll hint describes both keyboard-focusable labelled geometry and given-table regions', () => {
  for (const contextId of ['repeat', 'grouping']) {
    const document = tree(render(setup().plan, { contextId }).html);
    const hint = find(document, 'geometry-scroll-hint'); assert.ok(hint, 'visible horizontal-scroll guidance is missing');
    assert.equal(Object.hasOwn(hint.attrs, 'hidden'), false); assert.notEqual(hint.attrs['aria-hidden'], 'true');
    assert.ok(text(hint).includes('kaydır')); assert.ok(text(hint).includes('ok tuş'));
    const regions = [find(document, 'source-scroll'), find(document, 'given-table-scroll')];
    for (const region of regions) {
      assert.ok(region); assert.equal(region.attrs.role, 'region'); assert.equal(region.attrs.tabindex, '0');
      assert.ok(region.attrs['aria-label'].length > 0); assert.equal(region.attrs['aria-describedby'], hint.attrs.id);
    }
    assert.notEqual(regions[0].attrs['aria-label'], regions[1].attrs['aria-label']);
    assert.equal(all(document, 'p').filter(node => node.attrs.id === hint.attrs.id).length, 1);
    assert.equal(all(regions[1], 'table').length, 1);
  }
});

// Break: semantic fallback omits zero/start condition or treats a numeric common answer as an explicitly selected answer.
test('repeat geometry preserves all sixteen mark values and both series in an independent literal given table', () => {
  const output = render(setup().plan), document = tree(output.html), table = all(document, 'table')[0];
  assert.deepEqual(rows(table), [['6 dakika', '0, 6, 12, 18, 24, 30, 36, 42, 48'], ['8 dakika', '0, 8, 16, 24, 32, 40, 48']]);
  assert.equal(all(document, 'circle').filter(n => n.attrs['data-minute']).length, 9);
  assert.equal(all(document, 'rect').filter(n => n.attrs['data-minute']).length, 7);
  assert.equal(all(table, 'th').filter(n => n.attrs.scope === 'col').length, 2);
  assert.equal(all(document, 'figcaption').some(n => /0/u.test(text(n)) && /48/u.test(text(n))), true);
  assert.equal(output.manifest.inferredAnswerProtection, false);
});

// Break: card count and group size switch units or the full canonical given row equivalent is truncated.
test('grouping table contains six literal valid-size rows and correctly separate card-per-package and package units', () => {
  const output = render(setup().plan, { contextId: 'grouping' }), document = tree(output.html), table = all(document, 'table')[0];
  assert.deepEqual(rows(table), [['1', '24', '36'], ['2', '12', '18'], ['3', '8', '12'], ['4', '6', '9'], ['6', '4', '6'], ['12', '2', '3']]);
  const headers = all(all(table, 'thead')[0], 'th').map(text); assert.ok(headers[0].includes('Kart/paket'));
  assert.ok(headers[1].includes('Paket')); assert.ok(headers[2].includes('Paket'));
  assert.deepEqual(output.manifest.literalUnits, ['card_per_package', 'package']);
  assert.equal(Number(all(document, 'svg')[0].attrs.height), 300);
});

// Break: wrapper uses narration instead of already-gated caption and leaks a protected response/full transcript or result metadata.
test('all protected responses remain absent from HTML and manifest before both explicit reveal and progress completion', () => {
  const { plan, preparation } = setup();
  for (const context of preparation.contexts) for (const cue of context.job.cues.filter(c => ['result', 'check_answer', 'summary', 'transfer_answer'].includes(c.kind))) {
    for (const [progress, reveal] of [[0, false], [.5, false], [1, false], [0, true], [.5, true]]) {
      const output = render(plan, { contextId: context.contextId, cueIndex: cue.order, progress, reveal });
      assert.equal(output.manifest.responseLocked, true); assert.equal(output.manifest.resultVisible, false);
      assert.equal(output.manifest.currentTranscriptSha256, null); assert.equal(JSON.stringify(output).includes(cue.transcript), false);
      assert.equal(all(tree(output.html), 'details').length, 0); assert.equal(output.manifest.result, undefined);
      assert.equal(/data-(?:correct|answer)|correctMapping|answerKey/u.test(output.html), false);
    }
    assert.equal(render(plan, { contextId: context.contextId, cueIndex: cue.order, progress: 1, reveal: true }).manifest.responseLocked, false);
  }
});

// Break: selected page mismatches the actual frame or a hidden full future context is added to the HTML/manifest.
test('every cue and selected page uses the real current frame and a closed current-only transcript fallback', () => {
  const { plan, preparation } = setup();
  for (const context of preparation.contexts) for (const cue of context.job.cues) {
    const options = { contextId: context.contextId, cueIndex: cue.order, progress: 1, reveal: true };
    const current = renderGrade6CommonRelationsCaptionFrame(plan, options);
    for (const page of current.narrationPacket.pages) {
      const output = render(plan, { ...options, pageIndex: page.pageIndex }), document = tree(output.html);
      assert.equal(text(find(document, 'current-caption')), page.lines.join(' ').replace(/\s+/gu, ' ').trim());
      const details = all(document, 'details'); assert.equal(details.length, 1); assert.equal(Object.hasOwn(details[0].attrs, 'open'), false);
      assert.equal(text(all(details[0], 'p')[0]), cue.transcript.replace(/\s+/gu, ' ').trim());
      assert.equal(output.manifest.currentTranscriptSha256, sha(cue.transcript));
      assert.equal(output.manifest.pageIndex, page.pageIndex); assert.equal(output.manifest.pageCount, current.frame.pageCount);
      assert.equal(output.manifest.selectedPageSha256, sha(JSON.stringify(page)));
      assert.equal(JSON.stringify(output.manifest).includes(cue.transcript), false);
      // Canonical plan can itself repeat a later short why/check sentence.
      // That authored current text is not an extra future cue projection.
      for (const later of context.job.cues.filter(c => c.order > cue.order && !cue.transcript.includes(c.transcript))) assert.equal(output.html.includes(later.transcript), false);
    }
  }
});

// Break: a new transfer source shape is falsely proved by the original timeline/table.
test('transfer review remains explicitly geometry-pending without original SVG or table reuse', () => {
  const plan = setup().plan;
  for (const contextId of ['repeat', 'grouping']) for (const cueIndex of [8, 9]) {
    const output = render(plan, { contextId, cueIndex, progress: 1, reveal: true }), document = tree(output.html);
    assert.equal(all(document, 'svg').length, 0); assert.equal(all(document, 'table').length, 0);
    assert.equal(output.manifest.geometryRendered, false); assert.equal(output.manifest.sourceDiagramProof, false);
    assert.equal(output.manifest.sourceVisualId, null); assert.equal(output.manifest.representationStatus, 'transfer_geometry_not_in_source_pending');
  }
});

// Break: a serialized or client-rehashed scene gains render authority, or passing a foreign object invokes hooks.
test('clones changed hashes foreign plans getters proxies and revoked proxies fail closed with zero caller hooks', () => {
  const plan = setup().plan; let hooks = 0;
  const proxy = new Proxy(plan, { get() { hooks++; throw new Error('private'); }, ownKeys() { hooks++; throw new Error('private'); } });
  const revoked = Proxy.revocable(plan, {}); revoked.revoke();
  const clone = structuredClone(plan); clone.contentSha256 = sha(JSON.stringify(clone));
  for (const input of [structuredClone(plan), clone, proxy, revoked.proxy, null, {}, 'private']) assert.throws(() => render(input), invalid);
  const getter = {}; Object.defineProperty(getter, 'reveal', { enumerable: true, get() { hooks++; return true; } });
  const optionsProxy = new Proxy({}, { get() { hooks++; return 1; }, ownKeys() { hooks++; return []; } });
  const optionsRevoked = Proxy.revocable({}, {}); optionsRevoked.revoke();
  for (const options of [getter, optionsProxy, optionsRevoked.proxy, { progress: { valueOf() { hooks++; return 1; } } }]) assert.throws(() => render(plan, options), invalid);
  assert.equal(hooks, 0);
});

// Break: extra knobs, nulls, hidden keys or unsupported pages silently broaden the inherited scene contract.
test('closed options and exact arity preserve source context page and reveal boundaries without coercion', () => {
  const plan = setup().plan;
  for (const options of [null, [], { contextId: 'other' }, { cueIndex: 10 }, { progress: null }, { progress: 1.01 }, { reveal: 1 },
    { pageIndex: 32 }, { pageIndex: 1 }, { style: 'private' }, { ['x'.repeat(65537)]: 1 }]) assert.throws(() => render(plan, options), invalid);
  const hidden = {}; Object.defineProperty(hidden, 'reveal', { value: true }); assert.throws(() => render(plan, hidden), invalid);
  assert.equal(typeof api.renderGrade6CommonRelationsReview, 'function'); let hooks = 0;
  const extra = new Proxy({}, { get() { hooks++; throw new Error('private'); } });
  for (const args of [[], [plan], [plan, {}, extra]]) assert.throws(() => api.renderGrade6CommonRelationsReview(...args), /invalid_common_relations_review_arguments/u);
  assert.equal(hooks, 0); assert.deepEqual(render(plan, { cueIndex: -0, pageIndex: -0, progress: -0 }), render(plan, {}));
});

// Break: generated HTML activates resources or embeds full source/job data instead of a passive current-cue page.
test('emitted document has no script external resource event handler form or full preparation payload', () => {
  const { plan, preparation } = setup(), output = render(plan, { cueIndex: 2 });
  for (const tag of ['script', 'link', 'image', 'use', 'iframe', 'foreignObject', 'audio', 'video', 'form', 'input', 'button']) assert.equal(new RegExp(`<${tag}\\b`, 'iu').test(output.html), false);
  assert.equal(/\s(?:on[a-z]+|href|xlink:href|src)=/iu.test(output.html), false);
  assert.equal(/<!ENTITY|url\s*\(|@import/iu.test(output.html), false);
  const document = tree(output.html), meta = all(document, 'meta').find(n => n.attrs['http-equiv'] === 'Content-Security-Policy');
  assert.ok(meta.attrs.content.includes("default-src 'none'")); assert.ok(meta.attrs.content.includes("script-src 'none'"));
  assert.equal(output.html.includes(JSON.stringify(preparation)), false); assert.equal(output.manifest.inlineSvgCount, 1);
  assert.equal(output.manifest.scripts, 0); assert.equal(output.manifest.externalAssets, 0);
});

// Break: HTML equality/hashes grant quality/media/auth readiness or add new questions to the existing draft.
test('immutable bounded manifest binds exact current frame and HTML bytes while every production approval remains false', () => {
  const { plan } = setup(), current = renderGrade6CommonRelationsCaptionFrame(plan, {}), output = render(plan);
  assert.equal(output.manifest.htmlSha256, sha(output.html)); assert.equal(output.manifest.htmlByteLength, Buffer.byteLength(output.html));
  assert.equal(output.manifest.frameSha256, current.frame.contentSha256); assert.equal(output.manifest.frameSvgSha256, current.frame.svgSha256);
  assert.equal(output.manifest.scenePlanSha256, plan.contentSha256); assert.equal(output.manifest.preparationSha256, plan.preparationSha256);
  assert.equal(Object.isFrozen(output), true); assert.equal(Object.isFrozen(output.manifest.source), true);
  assert.equal(Buffer.byteLength(output.html) <= 65536, true); assert.equal(Buffer.byteLength(JSON.stringify(output.manifest)) <= 16384, true);
  assert.deepEqual(render(plan), output); assert.deepEqual(output.manifest.counts, { existingAuthoredDrafts: 1, newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  for (const key of ['learnerReady', 'productionReady', 'publicationReady', 'teacherApproved', 'accessibilityPassed', 'responsiveLayoutVerified', 'audioGenerated', 'videoRendered', 'pageNavigationUiBound']) assert.equal(output.manifest[key], false);
  assert.equal(Object.values(output.manifest.gates).every(value => value === 'pending'), true); assert.equal(output.manifest.providerCallsMade, 0);
});
