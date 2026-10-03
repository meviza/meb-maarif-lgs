import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { createPilotBatch, createLesson, createStoryboard } from '../packages/content-factory/pilot.mjs';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));

// Minimal test DOM for the generated, owned script. This is dispatch evidence,
// not browser layout/accessibility proof; the parent separately runs real QA.
class Element {
  constructor(tag = 'document', attributes = {}) {
    this.tag = tag;
    this.attributes = attributes;
    this.children = [];
    this.listeners = new Map();
    this.dataset = Object.fromEntries(Object.entries(attributes).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase()), value]));
    this.hidden = Object.hasOwn(attributes, 'hidden');
    this.disabled = Object.hasOwn(attributes, 'disabled');
    this.open = Object.hasOwn(attributes, 'open');
    this.textContent = '';
  }
  querySelectorAll(selector) {
    const result = [];
    const field = /^\[([^\]]+)\]$/u.exec(selector)?.[1];
    for (const child of this.children) {
      if (field ? Object.hasOwn(child.attributes, field) : child.tag === selector) result.push(child);
      result.push(...child.querySelectorAll(selector));
    }
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  dispatchEvent(event) { for (const listener of this.listeners.get(event.type) ?? []) listener(event); }
  click() { if (!this.disabled) this.dispatchEvent({ type: 'click' }); }
}

function mount(html) {
  const script = /<script>([\s\S]*?)<\/script>/u.exec(html)?.[1];
  assert.ok(script, 'real preview controller script must be emitted');
  const document = new Element();
  const stack = [document];
  const markup = html.replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gu, '');
  let end = 0;
  for (const match of markup.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*)>/gu)) {
    stack.at(-1).textContent += markup.slice(end, match.index);
    end = match.index + match[0].length;
    const [, close, name, suffix] = match;
    const tag = name.toLowerCase();
    if (close) {
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index > 0) stack.length = index;
      continue;
    }
    const attributes = Object.fromEntries([...suffix.matchAll(/\s([^\s=/>]+)(?:="([^"]*)")?/gu)].map(attribute => [attribute[1], attribute[2] ?? '']));
    const element = new Element(tag, attributes);
    stack.at(-1).children.push(element);
    if (!suffix.endsWith('/') && !['meta', 'input', 'br', 'hr', 'img', 'link'].includes(tag)) stack.push(element);
  }
  vm.runInNewContext(script, { document, Event }, { timeout: 2000, filename: 'real-mixed-flow-preview-script.js' });
  return document;
}
async function run(t, metadata, count = 12) {
  const root = await mkdtemp(join(tmpdir(), 'lesson-mixed-flow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const out = join(root, 'review');
  const args = [cli, '--count', String(count), '--out', out];
  if (metadata) {
    const metadataPath = join(root, 'metadata.json');
    await writeFile(metadataPath, JSON.stringify(metadata));
    args.push('--metadata', metadataPath);
  }
  const child = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.stderr);
  return { out, report: JSON.parse(await readFile(join(out, 'audit.json'), 'utf8')), html: await readFile(join(out, 'preview.html'), 'utf8') };
}

// Break caught: displaying every numeric variant before the lesson, or leaving
// the complete author bank open as if it were the learner practice sequence.
test('real CLI presents lesson then one worked example then single-question practice and a closed author bank', async t => {
  const { html } = await run(t);
  const lesson = html.indexOf('data-lesson-introduction');
  const worked = html.indexOf('data-worked-example');
  const practice = html.indexOf('data-mixed-practice');
  const bank = html.indexOf('data-author-bank');
  assert.ok(lesson >= 0, 'lesson-first flow is not connected');
  assert.ok(lesson < worked && worked < practice && practice < bank);
  assert.equal((html.match(/\bdata-worked-example(?:\s|>)/gu) ?? []).length, 1);
  assert.match(html, /<details[^>]*data-author-bank[^>]*>/u);
  assert.doesNotMatch(html.match(/<details[^>]*data-author-bank[^>]*>/u)[0], /\bopen(?:\s|=|>)/u);
  assert.match(html, /Editör: Tüm taslaklar/u);
  assert.match(html, /data-practice-back/u);
  assert.match(html, /data-practice-next/u);
  const questionTags = [...html.matchAll(/<article\b[^>]*data-practice-question[^>]*>/gu)].map(match => match[0]);
  assert.equal(questionTags.length, 6);
  assert.equal(questionTags.filter(tag => !/\bhidden(?:\s|=|>)/u.test(tag)).length, 1);
  assert.ok(html.indexOf('id="question-1-title"') > bank, 'all canonical author cards must stay under the closed bank');
  for (const label of ['Formül', 'Kısa yöntem', 'Püf nokta', 'cm²', 'dikdörtgen', 'Tahmin']) assert.ok(html.includes(label), label);
});

// Break caught: practice repeats one family, reuses its teaching example, or
// represents author-estimated local selection as publication/student readiness.
test('practice preparation selects six different families and excludes the exact worked-example revision', async t => {
  const { report } = await run(t);
  assert.ok(report.practicePreparation, 'practice preparation report is not connected');
  const plan = report.practicePreparation.reviewPlan;
  assert.equal(plan.selectionState, 'review_plan_ready');
  assert.equal(plan.selectedCount, 6);
  assert.equal(new Set(plan.selectedQuestions.map(item => item.family)).size, 6);
  assert.deepEqual(plan.selectedDifficultyCounts, { introductory: 3, intermediate: 3, advanced: 0, challenge: 0 });
  assert.ok(plan.selectedQuestions.every(item => !(item.source.id === plan.workedExample.source.id && item.source.contentSha256 === plan.workedExample.source.contentSha256)));
  assert.equal(plan.dataAuthorEstimated, true);
  assert.equal(plan.dataMeasured, false);
  assert.equal(plan.publicationReady, false);
  assert.equal(plan.learnerReady, false);
  assert.equal(plan.productionReady, false);
});

// Break caught: silently changing difficulty labels or diluting an impossible
// 10/30/30/30 request instead of visibly preserving advanced/challenge deficits.
test('the ten-question example profile remains blocked by unavailable advanced and challenge families', async t => {
  const { report, html } = await run(t);
  assert.ok(report.practicePreparation, 'practice preparation report is not connected');
  const audit = report.practicePreparation.exampleProfileAudit;
  assert.equal(audit.request.count, 10);
  assert.deepEqual(audit.requestedDifficultyQuota, { introductory: 1, intermediate: 3, advanced: 3, challenge: 3 });
  assert.equal(audit.selectionState, 'blocked_review_plan');
  assert.equal(audit.difficultyProfileMet, false);
  for (const difficulty of ['advanced', 'challenge']) {
    const deficit = audit.deficits.find(item => item.dimension === 'difficulty' && item.id === difficulty);
    assert.ok(deficit, `missing ${difficulty} deficit`);
    assert.equal(deficit.missing, 3);
    assert.equal(deficit.availableDistinctFamilies, 0);
  }
  assert.match(html, /data-practice-profile-audit/u);
  assert.match(html, /Hedef profil/u);
  assert.match(html, /Mevcut havuz/u);
  assert.doesNotMatch(html, /AUTHOR_ESTIMATED/u);
  assert.match(html, /Yazar tahmini/u);
  assert.deepEqual(report.items.map(item => item.difficulty.level), ['introductory', 'introductory', 'intermediate', 'intermediate', 'introductory', 'intermediate', 'introductory', 'introductory', 'intermediate', 'intermediate', 'introductory', 'intermediate']);
});

// Break caught: adjusting canonical question/SVG/storyboard bytes while
// introducing review-only copies or rebuilding media as if it had new audio.
test('mixed presentation leaves canonical questions and downstream draft media unchanged', async t => {
  const { out, report } = await run(t);
  assert.ok(report.practicePreparation, 'practice preparation report is not connected');
  const original = createPilotBatch({ requested: 12 });
  assert.deepEqual(report.items, original.items);
  assert.deepEqual(report.storyboards, original.items.map(createStoryboard));
  assert.deepEqual(report.lessons, original.items.map(createLesson));
  for (const [index, item] of report.items.entries()) {
    assert.equal(await readFile(join(out, 'diagrams', `${item.id}.svg`), 'utf8'), `${item.visual.svg}\n`);
    assert.equal(report.mediaPreparation.questionJobs[index].source.contentSha256, item.contentSha256);
  }
  assert.equal(report.mediaPreparation.audioAttached, false);
  assert.equal(report.mediaPreparation.videoAttached, false);
  assert.equal(report.practicePreparation.liveProviderCalls, 0);
  assert.equal(report.practicePreparation.publicationReady, false);
  assert.equal(report.publicationGate.state, 'closed');
});

// Break caught: visible review copies reuse the author bank's title/desc IDs,
// causing an unrelated rectangle's accessible name to win document-wide.
test('lesson example practice and author bank SVG labels stay document-unique', async t => {
  const { html } = await run(t);
  assert.ok(html.includes('aria-labelledby="worked-example-title worked-example-desc"'), 'worked-example review SVG is not connected');
  const ids = [...html.matchAll(/\sid="([^"]+)"/gu)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (let index = 1; index <= 12; index++) assert.match(html, new RegExp(`aria-labelledby="question-${index}-title question-${index}-desc"`, 'u'));
  for (let index = 1; index <= 6; index++) assert.match(html, new RegExp(`aria-labelledby="practice-${index}-title practice-${index}-desc"`, 'u'));
});

// Break caught: copied source metadata is rendered as executable HTML or the
// editor preview starts implying a live provider, generated media, or approval.
test('source markup is escaped in author provenance and draft gates remain explicit', async t => {
  const metadata = {
    source: { sourceId: '<img src=x onerror="source()">', rightsStatus: 'owned_original', purpose: 'original_math_pilot' },
    curriculum: { mappingStatus: 'unresolved', registryEntryId: null, programVersion: null, grade: null, outcomeCode: null, sourceUrl: null, sourceSha256: null },
    governance: { ownerId: 'content-owner', stewardId: 'math-editor', purpose: 'review_only', retentionPolicyId: 'pilot-review-v1' },
  };
  const { html, report } = await run(t, metadata);
  assert.ok(html.includes('&lt;img src=x onerror=&quot;source()&quot;&gt;'));
  assert.doesNotMatch(html, /<img src=x/u);
  assert.doesNotMatch(html, /<(?:audio|video|iframe)\b/iu);
  assert.equal(report.providerStatus.livePaidCalls, 0);
  assert.equal(report.providerStatus.studentDataTransferred, false);
  assert.equal(report.practicePreparation.reviewPlan.publicationReady, false);
  assert.match(html, /Taslak içeriktir/u);
  assert.match(html, /MEB onaylı değildir/u);
});

// Break caught: the rendered buttons exist but do not change which question
// is visible, or let navigation go before the first/after the final question.
test('the emitted practice controller navigates one visible question and respects both bounds', async t => {
  const { html } = await run(t);
  const document = mount(html);
  const practice = document.querySelector('[data-mixed-practice]');
  assert.ok(practice, 'mixed practice controller is not connected');
  const questions = practice.querySelectorAll('[data-practice-question]');
  const back = practice.querySelector('[data-practice-back]');
  const next = practice.querySelector('[data-practice-next]');
  assert.equal(back.disabled, true);
  assert.equal(next.disabled, false);
  assert.equal(practice.querySelector('[data-practice-counter]').textContent, 'Soru 1 / 6');
  back.click();
  for (let index = 1; index <= 5; index++) {
    next.click();
    assert.deepEqual(questions.map(question => question.hidden), questions.map((_, position) => position !== index));
    assert.equal(practice.querySelector('[data-practice-counter]').textContent, `Soru ${index + 1} / 6`);
  }
  assert.equal(next.disabled, true);
  next.click();
  assert.equal(practice.querySelector('[data-practice-counter]').textContent, 'Soru 6 / 6');
  for (let index = 4; index >= 0; index--) back.click();
  assert.equal(back.disabled, true);
  assert.equal(questions.filter(question => !question.hidden).length, 1);
  assert.equal(questions[0].hidden, false);
});

// Break caught: changing questions carries an old revealed answer/reasoning
// stage into the new question, or resets a different independent example.
test('reasoned reveal remains gated and returning to a question clears answers without sharing panel state', async t => {
  const { html } = await run(t);
  const document = mount(html);
  const practice = document.querySelector('[data-mixed-practice]');
  assert.ok(practice, 'mixed practice controller is not connected');
  const questions = practice.querySelectorAll('[data-practice-question]');
  const example = document.querySelector('[data-worked-example]').querySelector('[data-reasoned-review]');
  const review = questions[0].querySelector('[data-reasoned-review]');
  const stages = review.querySelectorAll('[data-reason-stage]');
  const nextReason = review.querySelector('[data-reason-next]');
  for (let index = 0; index < 3; index++) nextReason.click();
  assert.equal(stages[3].hidden, false);
  assert.equal(nextReason.disabled, true);
  assert.equal(stages[3].querySelector('[data-reason-answer]').hidden, true);
  nextReason.click();
  assert.equal(stages[3].hidden, false);
  stages[3].querySelector('[data-reveal-reason]').click();
  assert.equal(stages[3].querySelector('[data-reason-answer]').hidden, false);
  assert.equal(nextReason.disabled, false);
  assert.equal(example.querySelector('[data-reason-counter]').textContent, 'Adım 1 / 7');
  const detail = questions[0].querySelector('details');
  detail.open = true;
  practice.querySelector('[data-practice-next]').click();
  assert.equal(questions[1].hidden, false);
  assert.equal(questions[1].querySelector('[data-reason-counter]').textContent.startsWith('Adım 1 / '), true);
  assert.ok(questions[1].querySelectorAll('[data-reason-answer]').every(answer => answer.hidden));
  practice.querySelector('[data-practice-back]').click();
  assert.equal(questions[0].hidden, false);
  assert.equal(detail.open, false);
  assert.equal(review.querySelector('[data-reason-counter]').textContent.startsWith('Adım 1 / '), true);
  assert.ok(review.querySelectorAll('[data-reason-answer]').every(answer => answer.hidden));
  assert.equal(example.querySelector('[data-reason-counter]').textContent, 'Adım 1 / 7');
});

// Break caught: a stale/inactive stage event reveals the current step because
// the callback reads only the shared index rather than checking its own button.
test('an inactive reasoned-stage reveal does not reveal the current result', async t => {
  const { html } = await run(t);
  const document = mount(html);
  const review = document.querySelector('[data-worked-example]').querySelector('[data-reasoned-review]');
  const stages = review.querySelectorAll('[data-reason-stage]');
  for (let index = 0; index < 3; index++) review.querySelector('[data-reason-next]').click();
  const answer = stages[3].querySelector('[data-reason-answer]');
  assert.equal(answer.hidden, true);
  stages.at(-1).querySelector('[data-reveal-reason]').click();
  assert.equal(answer.hidden, true, 'an inactive stage button must not reveal the active stage');
  assert.equal(review.querySelector('[data-reason-next]').disabled, true);
});

// Break caught: a small author pool gets padded with its teaching example or
// the one-question controller assumes a nonempty selected array and crashes.
test('a one-candidate job reports blocked practice without inventing a question and disables navigation', async t => {
  const { html, report } = await run(t, undefined, 1);
  assert.equal(report.practicePreparation.reviewPlan.selectionState, 'blocked_review_plan');
  assert.equal(report.practicePreparation.reviewPlan.selectedCount, 0);
  const document = mount(html);
  const practice = document.querySelector('[data-mixed-practice]');
  assert.equal(practice.querySelectorAll('[data-practice-question]').length, 0);
  assert.equal(practice.querySelector('[data-practice-back]').disabled, true);
  assert.equal(practice.querySelector('[data-practice-next]').disabled, true);
  assert.equal(practice.querySelector('[data-practice-counter]').textContent, 'Soru 0 / 0');
});
