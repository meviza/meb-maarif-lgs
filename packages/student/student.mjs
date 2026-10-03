import { createNotebook, updateNotebook, NOTEBOOK_PALETTE, NOTEBOOK_STROKE_WIDTHS } from '/notebook.mjs';

// The preview reads one synthetic server fixture. No persistence, grade switch,
// content delivery, authentication or sharing request is implemented here.
const $ = id => document.getElementById(id);
const courseIds = ['turkce', 'matematik', 'fen', 'sosyal', 'ingilizce', 'din'];
const pages = ['home', 'course', 'saved', 'concerns', 'notebook'];
const state = {
  phase: 'loading', page: 'home', courseId: null, workspace: null,
  notebook: null, clearUndo: null, shareReady: new Set(), sequence: 0,
  pendingStroke: null, pointerId: null, canvasSize: { width: 0, height: 0 },
  loader: null,
};

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function readWorkspace(value) {
  const fail = () => { throw new Error('workspace_contract_unsupported'); };
  if (!value || value.mode !== 'synthetic_student_preview' || value.grade !== 6
      || value.publicationEnabled !== false || value.authenticationStatus !== 'synthetic_fixture_not_production_auth'
      || value.contentStatus !== 'metadata_only_no_published_library'
      || value.schoolYear !== '2026-2027' || value.subscription?.status !== 'active'
      || value.subscription?.kind !== 'annual_school_preview'
      || value.subscription?.expiresAt !== '2027-09-01T00:00:00.000Z'
      || value.context?.schoolId !== 'synthetic-school'
      || value.context?.learnerId !== 'synthetic-learner-6'
      || value.context?.grade !== value.grade || value.context?.schoolYear !== value.schoolYear
      || !Array.isArray(value.courses) || value.courses.length !== courseIds.length
      || !['questions', 'lessons', 'videos'].every(key => Array.isArray(value.library?.[key]) && value.library[key].length === 0)) fail();
  for (const id of courseIds) {
    const matches = value.courses.filter(course => course?.id === id);
    if (matches.length !== 1) fail();
    const course = matches[0];
    if (typeof course.title !== 'string' || !course.title.trim() || course.title.length > 100
        || typeof course.subtitle !== 'string' || course.subtitle.length > 240
        || typeof course.source?.registryEntryId !== 'string' || course.source.registryEntryId.length > 100
        || !/^[a-f0-9]{64}$/.test(course.source?.sha256 ?? '')
        || course.source?.verification !== 'source_catalog_metadata_only') fail();
  }
  return value;
}

function announce(message) { $('action-status').textContent = message; }
function selectedCourse() { return state.workspace?.courses.find(course => course.id === state.courseId); }
function setNavigationEnabled(enabled) {
  document.querySelectorAll('[data-page]').forEach(button => { button.disabled = !enabled; });
}

async function loadWorkspace() {
  state.loader?.abort();
  const controller = new AbortController();
  state.loader = controller;
  state.phase = 'loading';
  closeDrawer({ restoreFocus: false });
  setNavigationEnabled(false);
  $('connection-state').textContent = 'Çalışma alanı açılıyor…';
  $('workspace-content').hidden = true;
  $('error-view').hidden = true;
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('/api/workspace', { method: 'GET', cache: 'no-store', credentials: 'omit', signal: controller.signal });
    const payload = await response.json();
    if (state.loader !== controller) return;
    if (!response.ok) throw new Error(payload?.error ?? 'workspace_unavailable');
    state.workspace = readWorkspace(payload);
    // Retry preserves existing memory only for the identical synthetic scope.
    state.notebook ??= createNotebook({ context: state.workspace.context });
    state.phase = 'ready';
    $('school-year').textContent = state.workspace.schoolYear;
    $('entitlement-note').textContent = `${state.workspace.schoolYear.replace('-', '–')} okul yılı için sentetik yıllık erişim örneği. Gerçek abonelik veya oturum açma değildir.`;
    $('connection-state').textContent = '';
    $('workspace-content').hidden = false;
    setNavigationEnabled(true);
    renderCourses();
    renderNotebook();
    showPage(state.page, state.courseId, { focus: false });
  } catch (error) {
    if (state.loader !== controller) return;
    state.phase = 'error';
    $('connection-state').textContent = 'Önizleme kullanılabilir bir çalışma alanı alamadı.';
    $('error-view').hidden = false;
    const messages = {
      workspace_contract_unsupported: 'Gelen çalışma alanı bu sentetik 6. sınıf önizlemesinin sınırlarına uymuyor. Desteklenmeyen sınıf, içerik veya hesap durumu gizlenmedi; alan açılmadı.',
      subscription_expired: 'Sentetik okul yılı erişim süresi sona ermiş. Bu ekran gerçek ödeme veya abonelik yenileme yapmaz.',
      subscription_not_started: 'Sentetik okul yılı erişimi henüz başlamamış.',
      course_catalog_unavailable: 'Doğrulanabilir ders kaynak kataloğu şu anda kullanılamıyor. Uydurma ders veya içerik gösterilmedi.',
    };
    $('error-copy').textContent = messages[error.message] ?? 'Yerel sunucuya ulaşılamadı veya alanın erişim koşulları sağlanmadı. Kaydedilmiş öğrenci verisi ya da başarı sonucu üretilmedi. Yerel sunucu açıkken yeniden deneyebilirsin.';
  } finally {
    clearTimeout(timeout);
  }
}

function renderCourses() {
  const cards = document.createDocumentFragment();
  const links = document.createDocumentFragment();
  for (const [index, id] of courseIds.entries()) {
    const course = state.workspace.courses.find(item => item.id === id);
    const card = node('button', 'course-card');
    card.type = 'button'; card.dataset.course = id;
    card.setAttribute('aria-label', `${course.title} ders alanını aç`);
    const top = node('div', 'course-card-top');
    top.append(node('span', 'course-index', String(index + 1).padStart(2, '0')));
    const arrow = node('span', 'course-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true'); top.append(arrow);
    card.append(top, node('h3', '', course.title), node('p', '', 'Kendi ritminde, adım adım.'));
    cards.append(card);
    const link = node('button', '', course.title);
    link.type = 'button'; link.dataset.course = id;
    const end = node('span', '', '↗'); end.setAttribute('aria-hidden', 'true'); link.append(end);
    links.append(link);
  }
  $('course-grid').replaceChildren(cards);
  $('drawer-courses').replaceChildren(links);
}

function renderCourse() {
  const course = selectedCourse();
  if (!course) return;
  $('course-title').textContent = course.title;
  $('course-subtitle').textContent = course.subtitle;
  const saved = state.notebook.bookmarks.topics.includes(course.id);
  $('save-course').setAttribute('aria-pressed', String(saved));
  $('save-course').textContent = saved ? 'Kaydettiklerimden çıkar' : 'Bu dersi kaydet';
  const details = document.createDocumentFragment();
  for (const [label, value] of [
    ['Kaynak kayıt kimliği', course.source.registryEntryId],
    ['Kaynak dosya SHA-256', course.source.sha256],
    ['Doğrulama kapsamı', 'Yalnız kaynak kataloğu metaverisi'],
    ['İçerik durumu', 'Uzman onaylı öğrenci içeriği henüz yok'],
  ]) details.append(node('dt', '', label), node('dd', '', value));
  $('course-source').replaceChildren(details);
}

function emptyList(title, copy) {
  const empty = node('div', 'personal-empty');
  empty.append(node('h2', '', title), node('p', '', copy));
  return empty;
}

function recordCard(item, kind) {
  const card = node('article', 'personal-item');
  const content = node('div');
  content.append(node('span', 'eyebrow', kind === 'note' ? 'KENDİ YAZDIĞIM NOT' : 'KENDİ SORUM'));
  content.append(node('p', '', item.text));
  const actions = node('div', 'item-actions');
  const key = `${kind}:${item.id}`;
  const button = node('button', 'ready-button', state.shareReady.has(key) ? 'Paylaşmaya hazır işaretli' : 'Paylaşmaya hazır işaretle');
  button.type = 'button'; button.dataset.readyKey = key;
  button.setAttribute('aria-pressed', String(state.shareReady.has(key)));
  actions.append(button, node('small', '', 'Yerel işaret · kimseye gönderilmez'));
  card.append(content, actions);
  return card;
}

function renderSaved() {
  const content = document.createDocumentFragment();
  for (const id of state.notebook.bookmarks.topics) {
    const course = state.workspace.courses.find(item => item.id === id);
    if (!course) continue;
    const card = node('article', 'personal-item');
    const text = node('div');
    text.append(node('span', 'eyebrow', 'DERS KISAYOLU / İÇERİK ONAYI DEĞİL'), node('p', '', course.title));
    const button = node('button', 'button button-outline', 'Ders alanını aç ↗');
    button.type = 'button'; button.dataset.course = id;
    card.append(text, button); content.append(card);
  }
  state.notebook.notes.forEach(item => content.append(recordCard(item, 'note')));
  if (!content.childNodes.length) content.append(emptyList('Burada henüz bir şey yok.', 'Defterinde yazdığın bir düşünceyi not olarak ekleyebilir veya bir dersin kısayolunu kaydedebilirsin. Hazır soru ya da tamamlanmış çalışma eklenmez.'));
  $('saved-list').replaceChildren(content);
}

function renderConcerns() {
  const content = document.createDocumentFragment();
  state.notebook.concerns.forEach(item => content.append(recordCard(item, 'concern')));
  if (!content.childNodes.length) content.append(emptyList('Her güzel soru bir kapı açar.', 'Aklına takılan bir yer olduğunda yukarıya kendi cümlenle yazabilirsin. Bu liste öğretmenine göndermeden önce düşüncelerini toplamak içindir.'));
  $('concern-list').replaceChildren(content);
}

function showPage(page, courseId = null, { focus = true } = {}) {
  if (state.phase !== 'ready') return;
  if (!pages.includes(page) || (page === 'course' && !courseIds.includes(courseId))) {
    announce('Bu çalışma alanı henüz desteklenmiyor. Yalnız sentetik 6. sınıf alanları açılabilir.'); return;
  }
  state.pendingStroke = null; state.pointerId = null;
  state.page = page; state.courseId = page === 'course' ? courseId : null;
  closeDrawer({ restoreFocus: false });
  pages.forEach(key => { $(`${key}-view`).hidden = key !== page; });
  document.querySelectorAll('.personal-nav [data-page]').forEach(button => {
    const active = button.dataset.page === page;
    button.classList.toggle('is-current', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('#drawer-courses [data-course]').forEach(button => {
    const active = page === 'course' && button.dataset.course === courseId;
    button.classList.toggle('is-current', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  if (page === 'course') renderCourse();
  if (page === 'saved') renderSaved();
  if (page === 'concerns') renderConcerns();
  if (page === 'notebook') resizeCanvas();
  announce('');
  if (focus) { $('main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}

function openDrawer() {
  if (!$('drawer-layer').hidden) return;
  $('drawer-layer').hidden = false;
  $('menu-open').setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
  $('main').inert = true; document.querySelector('.topbar').inert = true;
  $('menu-close').focus();
}
function closeDrawer({ restoreFocus = true } = {}) {
  const wasOpen = !$('drawer-layer').hidden;
  $('drawer-layer').hidden = true;
  $('menu-open').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');
  $('main').inert = false; document.querySelector('.topbar').inert = false;
  if (wasOpen && restoreFocus) $('menu-open').focus();
}

function mutate(action) {
  try {
    state.notebook = updateNotebook(state.notebook, { ...action, context: state.workspace.context });
    state.clearUndo = null;
    renderNotebook();
    return true;
  } catch (error) {
    const limit = error.message.includes('limit');
    announce(limit ? 'Bu yerel defterin sınırına ulaştın. Yeni bir kayıt eklenmedi.' : 'Bu not veya çizim kabul edilmedi. Girdi ve sınıf kapsamını kontrol edelim; kayıt eklenmedi.');
    renderNotebook(); return false;
  }
}

function renderNotebook() {
  if (!state.notebook) return;
  if ($('notebook-text').value !== state.notebook.text) $('notebook-text').value = state.notebook.text;
  $('text-limit').textContent = `${state.notebook.text.length} / 4000`;
  $('save-note').disabled = !state.notebook.text.trim();
  $('undo-stroke').disabled = !state.notebook.strokes.length;
  $('clear-notebook').disabled = !state.notebook.text && !state.notebook.strokes.length;
  $('undo-clear').hidden = !state.clearUndo;
  paintCanvas();
}

function resizeCanvas() {
  const canvas = $('notebook-canvas');
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio);
  state.canvasSize = { width: rect.width, height: rect.height };
  const context = canvas.getContext('2d');
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  paintCanvas();
}

function paintCanvas() {
  const canvas = $('notebook-canvas'), context = canvas.getContext('2d');
  const { width, height } = state.canvasSize;
  if (!context || !width || !height || !state.notebook) return;
  context.clearRect(0, 0, width, height);
  const strokes = state.pendingStroke ? [...state.notebook.strokes, state.pendingStroke] : state.notebook.strokes;
  for (const stroke of strokes) {
    context.strokeStyle = stroke.color; context.fillStyle = stroke.color;
    context.lineWidth = stroke.width; context.lineCap = 'round'; context.lineJoin = 'round';
    const first = stroke.points[0];
    if (stroke.points.length === 1) { context.beginPath(); context.arc(first.x * width, first.y * height, stroke.width / 2, 0, 2 * Math.PI); context.fill(); continue; }
    context.beginPath(); context.moveTo(first.x * width, first.y * height);
    for (const point of stroke.points.slice(1)) context.lineTo(point.x * width, point.y * height);
    context.stroke();
  }
}

function pointerPoint(event) {
  const rect = $('notebook-canvas').getBoundingClientRect();
  return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
}

document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target || target.disabled) return;
  if (target.dataset.page) showPage(target.dataset.page);
  if (target.dataset.course) showPage('course', target.dataset.course);
  if (target.dataset.readyKey && state.notebook) {
    const key = target.dataset.readyKey;
    if (state.shareReady.has(key)) state.shareReady.delete(key); else state.shareReady.add(key);
    renderSaved(); renderConcerns();
    announce('Yalnız yerel hazırlık işareti değişti. Öğretmenine veya başka birine gönderim yapılmadı.');
  }
});
document.querySelector('.wordmark').addEventListener('click', event => { event.preventDefault(); showPage('home'); });
$('menu-open').addEventListener('click', openDrawer);
$('menu-close').addEventListener('click', () => closeDrawer());
$('drawer-backdrop').addEventListener('click', () => closeDrawer());
document.addEventListener('keydown', event => {
  if ($('drawer-layer').hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
  if (event.key !== 'Tab') return;
  const controls = [...$('workspace-drawer').querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(element => element.getClientRects().length);
  const first = controls[0], last = controls.at(-1);
  if (!first) { event.preventDefault(); $('workspace-drawer').focus(); return; }
  if (event.shiftKey && (document.activeElement === first || !$('workspace-drawer').contains(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !$('workspace-drawer').contains(document.activeElement))) { event.preventDefault(); first.focus(); }
});
$('retry-workspace').addEventListener('click', loadWorkspace);
$('save-course').addEventListener('click', () => {
  const course = selectedCourse();
  if (course && mutate({ type: 'bookmark.toggle', kind: 'topic', id: course.id, grade: 6 })) {
    renderCourse(); announce('Ders kısayolu yerel listende güncellendi. İçerik veya bulut kaydı oluşturulmadı.');
  }
});
$('notebook-text').addEventListener('input', event => { mutate({ type: 'text.set', text: event.target.value }); });
$('save-note').addEventListener('click', () => {
  if (mutate({ type: 'note.add', id: `note-${++state.sequence}`, text: state.notebook.text, grade: 6 })) announce('Düşüncen Kaydettiklerim listene eklendi. Yalnız bu sayfanın belleğinde; gönderim yapılmadı.');
});
$('concern-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('concern-text').value;
  if (!text.trim()) { announce('Önce takıldığın yeri kendi cümlenle yazabilirsin.'); $('concern-text').focus(); return; }
  if (mutate({ type: 'concern.add', id: `concern-${++state.sequence}`, text, grade: 6 })) {
    $('concern-text').value = ''; renderConcerns(); announce('Sorun yerel hazırlık listene eklendi. Öğretmenine gönderilmedi.');
  }
});
$('clear-notebook').addEventListener('click', () => {
  const previous = state.notebook;
  if (!previous || (!previous.text && !previous.strokes.length)) return;
  state.pendingStroke = null; state.pointerId = null;
  try {
    state.notebook = updateNotebook(state.notebook, { type: 'text.clear', context: state.workspace.context });
    state.notebook = updateNotebook(state.notebook, { type: 'drawing.clear', context: state.workspace.context });
    state.clearUndo = previous; renderNotebook();
    $('undo-clear').focus(); announce('Boş sayfaya döndün. Temizlemeyi geri alabilirsin; kayıtlı notların değişmedi.');
  } catch { state.notebook = previous; announce('Temizleme uygulanmadı; önceki sayfan korundu.'); }
});
$('undo-clear').addEventListener('click', () => {
  if (!state.clearUndo) return;
  state.notebook = state.clearUndo; state.clearUndo = null; renderNotebook();
  $('clear-notebook').focus(); announce('Temizlemeden önceki metin ve çizimler geri geldi.');
});
$('undo-stroke').addEventListener('click', () => {
  if (mutate({ type: 'stroke.undo' })) announce('Son çizgi geri alındı.');
});

const canvas = $('notebook-canvas');
canvas.addEventListener('pointerdown', event => {
  if (state.phase !== 'ready' || state.page !== 'notebook' || state.pendingStroke || (event.pointerType === 'mouse' && event.button !== 0)) return;
  if (state.notebook.strokes.length >= 64) { announce('Bu sayfada en fazla 64 çizgi tutulabilir. Son çizgiyi geri alabilir veya sayfayı temizleyebilirsin.'); return; }
  const color = document.querySelector('input[name="pen-color"]:checked')?.value;
  if (!NOTEBOOK_PALETTE.includes(color)) { announce('Bu kalem rengi desteklenmiyor. Çizim başlamadı.'); return; }
  state.pointerId = event.pointerId;
  state.pendingStroke = { id: `stroke-${++state.sequence}`, color, width: NOTEBOOK_STROKE_WIDTHS[1], points: [pointerPoint(event)] };
  canvas.setPointerCapture(event.pointerId); event.preventDefault(); paintCanvas();
});
canvas.addEventListener('pointermove', event => {
  if (!state.pendingStroke || event.pointerId !== state.pointerId) return;
  if (state.pendingStroke.points.length < 512) state.pendingStroke.points.push(pointerPoint(event));
  paintCanvas();
});
canvas.addEventListener('pointerup', event => {
  if (!state.pendingStroke || event.pointerId !== state.pointerId) return;
  const stroke = state.pendingStroke;
  state.pendingStroke = null; state.pointerId = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  if (mutate({ type: 'stroke.add', stroke })) announce(stroke.points.length === 512 ? 'Çizgi yerel defterine eklendi; bu çizginin nokta sınırına ulaşıldı.' : 'Çizgi yerel defterine eklendi.');
});
canvas.addEventListener('pointercancel', event => {
  if (!state.pendingStroke || event.pointerId !== state.pointerId) return;
  state.pendingStroke = null; state.pointerId = null;
  // Browsers may already have released a canceled pointer's capture.
  try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch { /* Capture cleanup must not restore a canceled stroke. */ }
  paintCanvas(); announce('Kesilen çizgi kaydedilmedi.');
});
window.addEventListener('resize', () => { if (state.page === 'notebook') resizeCanvas(); });
if (typeof ResizeObserver === 'function') new ResizeObserver(() => { if (state.page === 'notebook') resizeCanvas(); }).observe(canvas);

loadWorkspace();
