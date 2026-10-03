// Browser-only presentation of an owned, versioned editor-review bundle.
// No synthesis, analytics, student records, storage, or external service calls.
const stageIds = ['goal', 'givens', 'plan', 'step1', 'step2', 'step3', 'step4', 'check', 'compare'];

const clone = value => JSON.parse(JSON.stringify(value));
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
}

export function createReasonedReviewController(variants) {
  if (!variants || !Array.isArray(variants.hidden) || !Array.isArray(variants.revealed) || variants.hidden.length !== 9 || variants.revealed.length !== 9) throw new Error('invalid_reasoned_views');
  const views = clone(variants);
  for (let index = 0; index < 9; index++) {
    const hidden = views.hidden[index];
    const revealed = views.revealed[index];
    if (!hidden?.stage || !revealed?.stage || hidden.stage.id !== stageIds[index] || revealed.stage.id !== stageIds[index] || hidden.stageIndex !== index || revealed.stageIndex !== index || hidden.stageCount !== 9 || revealed.stageCount !== 9 || JSON.stringify(hidden.source) !== JSON.stringify(revealed.source) || JSON.stringify(hidden.source) !== JSON.stringify(views.hidden[0].source) || hidden.publicationReady !== false || revealed.publicationReady !== false || hidden.revealAnswer !== false || revealed.revealAnswer !== true || hidden.stage.calculation !== null || hidden.stage.checkAnswer !== null) throw new Error('invalid_reasoned_views');
  }
  freeze(views);
  let stageIndex = 0;
  let revealAnswer = false;
  let reducedMotion = false;
  const getState = () => freeze({ ...views[revealAnswer ? 'revealed' : 'hidden'][stageIndex], reducedMotion });
  return Object.freeze({
    getState,
    dispatch(action) {
      if (!['next', 'previous', 'reset', 'reveal'].includes(action)) throw new Error('invalid_reasoned_action');
      if (action === 'reveal') revealAnswer = true;
      if (action === 'reset') { stageIndex = 0; revealAnswer = false; }
      if (action === 'previous' && stageIndex > 0) { stageIndex--; revealAnswer = false; }
      if (action === 'next' && stageIndex < 8 && getState().canAdvance) { stageIndex++; revealAnswer = false; }
      return getState();
    },
    setReducedMotion(value) {
      if (typeof value !== 'boolean') throw new Error('invalid_motion_preference');
      reducedMotion = value;
      return getState();
    },
  });
}

export function getReasonedFrameWindow(plan, view) {
  const stage = view?.stage;
  if (!stage || !stageIds.includes(stage.id)) throw new Error('invalid_reasoned_frame_stage');
  if (stage.kind === 'calculate') {
    const step = plan.solutionGraph.find(item => item.id === stage.solutionStepId);
    const segment = plan.segments.find(item => item.id === stage.solutionStepId);
    if (!step || !segment) throw new Error('invalid_reasoned_frame_stage');
    return { startSeconds: segment.startSeconds, endSeconds: view.revealAnswer ? step.labelAtSeconds : segment.startSeconds, animated: view.revealAnswer && !view.reducedMotion };
  }
  const time = ['check', 'compare'].includes(stage.kind) ? plan.solutionGraph.at(-1).labelAtSeconds : 0;
  return { startSeconds: time, endSeconds: time, animated: false };
}

export function renderReasonedInkFrame(plan, time, renderInkFrameSvg) {
  if (typeof renderInkFrameSvg !== 'function') throw new Error('trusted_ink_renderer_required');
  // The exact owned renderer is the only source of SVG. Keep its geometry and
  // calculation strokes, removing the obsolete v1 cue text in this derivative.
  return renderInkFrameSvg(plan, time).replace(/<text x="64" y="676"[^>]*>[\s\S]*?<\/text>/u, '<text x="64" y="676" fill="#496366" font-size="17">Yeni gerekçe metni üst panelde · bu önizlemede ses yok</text>');
}

export function getVisibleCalculationLines(view) {
  if (!view?.revealAnswer || !view.stage?.calculation) return [];
  return (view.stage.workedSteps ?? []).map(step => ({
    equation: `${step.expression} = ${step.value} ${step.unit}`, meaning: step.meaning,
  }));
}

function markQuestion(container, text, givens, selectedIds) {
  const spans = givens.filter(given => selectedIds.includes(given.id) && typeof given.questionPhrase === 'string' && given.questionPhrase.length > 0)
    .map(given => ({ start: text.indexOf(given.questionPhrase), end: text.indexOf(given.questionPhrase) + given.questionPhrase.length, given }))
    .filter(item => item.start >= 0).sort((a, b) => a.start - b.start || b.end - a.end);
  container.replaceChildren();
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue;
    container.append(document.createTextNode(text.slice(cursor, span.start)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(span.start, span.end);
    mark.dataset.givenId = span.given.id;
    container.append(mark);
    cursor = span.end;
  }
  container.append(document.createTextNode(text.slice(cursor)));
}

async function mount() {
  const response = await fetch('./reasoning-views.json', { credentials: 'omit', cache: 'no-store' });
  if (!response.ok) throw new Error('reasoned_views_unavailable');
  const views = await response.json();
  const controller = createReasonedReviewController(views);
  const { createInkPlan, renderInkFrameSvg } = await import('./ink-timeline.mjs');
  const plan = createInkPlan();
  const byId = id => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  controller.setReducedMotion(reducedMotion.matches);
  byId('reduce-motion').checked = reducedMotion.matches;
  let animationId = null;
  let revision = 0;
  const cancel = () => { revision++; if (animationId !== null) cancelAnimationFrame(animationId); animationId = null; };
  const draw = time => { byId('ink-frame').src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderReasonedInkFrame(plan, time, renderInkFrameSvg))}`; };
  function paint(animate = false) {
    cancel();
    const view = controller.getState();
    const stage = view.stage;
    byId('stage-counter').textContent = `${view.stageIndex + 1} / ${view.stageCount}`;
    byId('stage-title').textContent = stage.title;
    byId('reason-explanation').textContent = stage.explanation;
    byId('why-operation').textContent = stage.whyThisOperation;
    byId('why-card').hidden = !stage.whyThisOperation;
    markQuestion(byId('question-text'), view.questionText, view.givens, stage.givenIds);
    byId('given-list').replaceChildren(...view.givens.map(given => {
      const item = document.createElement('li');
      item.className = stage.givenIds.includes(given.id) ? 'given active' : 'given';
      const meaning = document.createElement('strong');
      meaning.textContent = given.meaning;
      const phrase = document.createElement('span');
      phrase.textContent = given.questionPhrase;
      item.append(meaning, phrase);
      return item;
    }));
    byId('prior-results').replaceChildren(...view.priorResults.map(result => {
      const item = document.createElement('li');
      item.textContent = `${result.meaning}: ${result.value} ${result.unit}`;
      return item;
    }));
    byId('prior-card').hidden = view.priorResults.length === 0;
    const calculation = stage.calculation;
    byId('calculation-result').textContent = calculation ? `${calculation.expression} = ${calculation.value} ${calculation.unit}` : '';
    byId('calculation-meaning').textContent = calculation?.meaning ?? '';
    byId('calculation-card').hidden = !calculation;
    const workedLines = getVisibleCalculationLines(view);
    byId('worked-step-list').replaceChildren(...workedLines.map(line => {
      const item = document.createElement('li');
      const equation = document.createElement('p');
      equation.className = 'equation';
      equation.textContent = line.equation;
      const meaning = document.createElement('p');
      meaning.textContent = line.meaning;
      item.append(equation, meaning);
      return item;
    }));
    byId('worked-step-card').hidden = workedLines.length === 0;
    byId('check-question').textContent = stage.checkQuestion ?? '';
    byId('check-question').hidden = !stage.checkQuestion;
    byId('check-answer').textContent = stage.checkAnswer ?? '';
    byId('check-answer').hidden = !stage.checkAnswer;
    const alternate = stage.alternate;
    byId('alternate-expression').textContent = alternate ? `${alternate.expression} = ${alternate.value} ${alternate.unit}` : '';
    byId('alternate-why').textContent = alternate?.whyEquivalent ?? '';
    byId('alternate-condition').textContent = alternate?.condition ?? '';
    byId('alternate-card').hidden = !alternate;
    byId('reveal-calculation').hidden = !view.requiresReveal || view.revealAnswer;
    byId('reveal-calculation').textContent = stage.kind === 'check' ? 'Kontrol yanıtını gör' : 'Gerekçeyi düşündüm · işlemi gör';
    byId('previous-stage').disabled = view.stageIndex === 0;
    byId('next-stage').disabled = !view.canAdvance || view.stageIndex === view.stageCount - 1;
    byId('next-hint').textContent = !view.canAdvance && view.requiresReveal ? 'Önce gerekçeyi düşün, sonra işlemi göster.' : view.stageIndex === 8 ? 'İnceleme tamamlandı; uzman onayı değildir.' : '';
    for (const [index, item] of [...byId('stage-list').children].entries()) {
      item.className = index === view.stageIndex ? 'current' : index < view.stageIndex ? 'visited' : '';
      if (index === view.stageIndex) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    }
    const frameWindow = getReasonedFrameWindow(plan, view);
    if (!animate || !frameWindow.animated) { draw(frameWindow.endSeconds); return; }
    const ownRevision = revision;
    const started = performance.now();
    const duration = 3800;
    draw(frameWindow.startSeconds);
    const tick = now => {
      if (revision !== ownRevision) return;
      const progress = Math.min(1, (now - started) / duration);
      draw(frameWindow.startSeconds + (frameWindow.endSeconds - frameWindow.startSeconds) * progress);
      animationId = progress < 1 ? requestAnimationFrame(tick) : null;
    };
    animationId = requestAnimationFrame(tick);
  }
  for (const [id, action] of [['previous-stage', 'previous'], ['next-stage', 'next'], ['reset-stages', 'reset'], ['reveal-calculation', 'reveal']]) byId(id).addEventListener('click', () => { controller.dispatch(action); paint(action === 'reveal'); });
  byId('reduce-motion').addEventListener('change', event => { controller.setReducedMotion(event.target.checked); paint(); });
  reducedMotion.addEventListener('change', event => { controller.setReducedMotion(event.matches); byId('reduce-motion').checked = event.matches; paint(); });
  window.addEventListener('pagehide', cancel);
  paint();
  byId('loading-status').hidden = true;
  byId('review-player').hidden = false;
}

if (typeof document !== 'undefined') mount().catch(() => {
  const status = document.getElementById('loading-status');
  status.hidden = false;
  status.textContent = 'Önizleme yüklenemedi. Paket bütünlüğünü ve yerel sunucuyu kontrol edin.';
});
