import { readStudioPayload, safeSourceUrl, svgImageUrl } from '/view_model.mjs';

const $ = id => document.getElementById(id);
const numberFormat = new Intl.NumberFormat('tr-TR');
const familyNames = {
  perimeter: 'Çevreyi yorumlama', area: 'Birim karelerle alan', width_from_area: 'Alandan bilinmeyen kenar',
  width_from_perimeter: 'Çevreden bilinmeyen kenar', error_diagnosis: 'Hatanın nedenini bulma', fence_gap: 'Çevreyi yeni duruma aktarma'
};
const checkNames = {
  geometry: 'Geometri koşulları', numericAnswer: 'Sayısal yanıt', uniqueOptions: 'Seçeneklerin ayrışması',
  diagram: 'Görsel–sayı tutarlılığı', accessibility: 'Görsel alternatif metni', solutionGraph: 'Çözüm adımları', integrity: 'Sürüm bütünlüğü'
};
const pendingNames = {
  canonical_curriculum_mapping: 'Resmî kazanım eşleştirmesi', archive_similarity_review: 'Arşiv benzerliği / özgünlük denetimi',
  language_and_pedagogy_review: 'Dil ve pedagojik inceleme', trusted_expert_review: 'Bağımsız uzman kararı', calibrated_item_difficulty: 'Ölçülmüş zorluk kalibrasyonu'
};
const sourceKinds = { lgs_exam: 'LGS ARŞİVİ', curriculum_current: 'GÜNCEL MÜFREDAT', curriculum_historical: 'GEÇMİŞ MÜFREDAT', guidance: 'ORTAK ÇERÇEVE' };
let model = null;
let filteredQuestions = [];
let currentIndex = 0;
let currentFrameIndex = 0;
let currentFrames = [];
let requestSequence = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}
function setText(id, text) { $(id).textContent = text; }
function familyOf(item) { return item.problem?.template ?? item.template ?? 'unknown'; }
function familyName(item) { return familyNames[familyOf(item)] ?? 'Soru ailesi belirtilmemiş'; }
function showNotice(text, error = false) { setText('connection-message', text); $('connection-message').classList.toggle('error', error); }

function renderMetrics() {
  for (const field of ['requested', 'drafts', 'rejected', 'published']) {
    setText(`count-${field}`, model.metrics ? numberFormat.format(model.metrics[field]) : '—');
  }
}

function renderFilters() {
  const selector = $('family-filter');
  selector.replaceChildren(element('option', null, 'Tüm aileler'));
  selector.firstElementChild.value = 'all';
  for (const family of [...new Set(model.questions.map(familyOf))]) {
    const option = element('option', null, familyNames[family] ?? family);
    option.value = family;
    selector.append(option);
  }
  selector.disabled = model.questions.length === 0;
}

function updateQuestionList() {
  const family = $('family-filter').value;
  filteredQuestions = model.questions.filter(item => family === 'all' || familyOf(item) === family);
  currentIndex = 0;
  const hasQuestions = filteredQuestions.length > 0;
  $('review-workspace').hidden = !hasQuestions;
  $('empty-state').hidden = hasQuestions;
  if (!hasQuestions) {
    setText('empty-copy', model.status === 'invalid'
      ? 'Rapor biçimi veya güvenlik zarfı geçersiz. Eksik / bozuk rapordan onay ya da içerik sayısı çıkarılmadı.'
      : 'Geçerli pilot sorusu bulunamadı. Rapor üretildikten sonra bu alanı yeniden okuyabilirsiniz.');
    return;
  }
  renderQuestion();
}

function renderQuestionBrowser() {
  setText('question-position', `${currentIndex + 1} / ${filteredQuestions.length} TASLAK`);
  const controls = filteredQuestions.map((item, index) => {
    const button = element('button', null, String(index + 1).padStart(2, '0'));
    button.type = 'button';
    button.setAttribute('aria-label', `${index + 1}. taslağı incele: ${familyName(item)}`);
    button.setAttribute('aria-pressed', String(index === currentIndex));
    button.addEventListener('click', event => {
      currentIndex = index;
      renderQuestion();
      if (event.detail === 0) $('question-selector').querySelector('[aria-pressed="true"]')?.focus();
    });
    return button;
  });
  $('question-selector').replaceChildren(...controls);
}

function renderQuestion() {
  const item = filteredQuestions[currentIndex];
  renderQuestionBrowser();
  setText('question-family', familyName(item));
  setText('question-prompt', item.prompt);
  const diagramUrl = svgImageUrl(item.visual?.svg);
  const diagram = $('question-diagram');
  diagram.hidden = !diagramUrl;
  if (diagramUrl) diagram.src = diagramUrl; else diagram.removeAttribute('src');
  diagram.alt = typeof item.visual?.alt === 'string' ? item.visual.alt : 'Görsel alternatif metni bulunamadı';
  setText('diagram-caption', diagramUrl
    ? 'Özgün vektör çizim · şekil ölçekli değildir'
    : 'Gösterilebilir vektör görsel bulunamadı; görsel kontrolü yapılmış sayılmaz.');
  $('question-options').replaceChildren(...item.options.map((option, index) => {
    const row = element('li', index === item.answerIndex ? 'correct' : null);
    row.append(element('span', 'option-letter', ['A', 'B', 'C', 'D'][index]), element('span', null, `${option}${item.answerUnit ? ` ${item.answerUnit}` : ''}`));
    if (index === item.answerIndex) row.append(element('span', 'answer-marker', 'YANIT ANAHTARI'));
    return row;
  }));
  renderEvidence(item);
  const storyboard = model.storyboards.find(row => row?.questionId === item.id);
  currentFrames = Array.isArray(storyboard?.frames) ? storyboard.frames.filter(frame => frame && typeof frame.narration === 'string') : [];
  currentFrameIndex = 0;
  setText('storyboard-transcript', typeof storyboard?.transcript === 'string' ? storyboard.transcript : 'Çözüm metni bulunamadı.');
  renderFrame();
}

function metadataRow(label, value, isIntent = false) {
  const row = element('div');
  row.append(element('dt', null, label), element('dd', isIntent ? 'intent' : null, value));
  return row;
}

function renderEvidence(item) {
  const difficulty = item.difficulty?.level === 'intermediate' ? 'Orta — yazar tahmini' : item.difficulty?.level === 'introductory' ? 'Başlangıç — yazar tahmini' : 'Zorluk etiketi belirlenmemiş';
  const curriculum = item.metadata?.curriculum;
  const curriculumText = curriculum?.mappingStatus === 'unresolved' || !curriculum?.outcomeCode
    ? 'Sınıf / resmî kazanım eşleştirmesi bekliyor'
    : `${curriculum.grade ?? 'Sınıf bilinmiyor'} · ${curriculum.outcomeCode} (kanıt incelemesi gerekir)`;
  const rights = item.metadata?.source?.rightsStatus;
  $('question-metadata').replaceChildren(
    metadataRow('Bu sorunun amacı', item.cognitiveIntent?.description ?? 'Amaç tanımı bulunamadı', true),
    metadataRow('Zorluk', difficulty),
    metadataRow('Müfredat bağı', curriculumText),
    metadataRow('Üretim yolu', model.generatorStatus === 'deterministic_math_pilot' ? 'Deterministik matematik pilotu' : model.generatorStatus),
    metadataRow('Clef Flash kontrolü', model.clefStatus === 'not_invoked' ? 'Çalıştırılmadı — canlı model kanıtı yok' : model.clefStatus),
    metadataRow('Kaynak / hak kaydı', rights === 'owned_original' ? 'Özgün yerel yazım; arşiv benzerlik incelemesi açık' : rights ?? 'Hak kaydı bulunamadı')
  );
  const checks = item.review?.checks ?? {};
  $('question-checks').replaceChildren(...Object.entries(checkNames).map(([key, label]) => {
    const row = element('li');
    const status = checks[key];
    row.append(element('span', null, label), element('span', `check-status ${status === false ? 'failed' : status !== true ? 'not-run' : ''}`, status === true ? 'Geçti' : status === false ? 'Başarısız' : 'Çalıştırılmadı'));
    return row;
  }));
  const pending = Array.isArray(item.review?.pending) ? item.review.pending : [];
  $('question-pending').replaceChildren(...(pending.length ? pending.map(key => element('li', null, pendingNames[key] ?? key)) : [element('li', null, 'İnceleme kanıtı bulunamadı; kapılar açık kabul edilmez.')]));
  setText('content-hash', typeof item.contentSha256 === 'string' ? item.contentSha256 : 'İçerik SHA-256 kaydı bulunamadı.');
}

function renderFrame() {
  const frame = currentFrames[currentFrameIndex];
  const url = frame ? svgImageUrl(frame.svg) : null;
  const image = $('storyboard-image');
  image.hidden = !url;
  if (url) image.src = url; else image.removeAttribute('src');
  image.alt = frame ? `Çözüm adımı ${currentFrameIndex + 1}: ${frame.narration}` : '';
  setText('storyboard-position', frame ? `ADIM ${currentFrameIndex + 1} / ${currentFrames.length}` : 'ADIM TASLAĞI YOK');
  setText('storyboard-narration', frame?.narration ?? 'Bu soru için çözüm sahneleri bulunamadı.');
  // An expression may be a conceptual explanation, not an equation. Preserve
  // its authored wording; do not append an equality to arbitrary text.
  const expression = $('storyboard-expression');
  expression.replaceChildren(document.createTextNode(frame?.expression ?? ''));
  if (frame?.value !== undefined) expression.append(element('span', 'frame-value', `Adım değeri: ${frame.value}`));
  $('step-reset').disabled = !frame || currentFrameIndex === 0;
  $('step-next').disabled = !frame || currentFrameIndex >= currentFrames.length - 1;
}

function renderSources() {
  const rows = model.sources;
  const downloaded = rows.filter(row => row.download?.status === 'downloaded').length;
  setText('source-count', rows.length ? `${numberFormat.format(rows.length)} kayıt · ${numberFormat.format(downloaded)} indirme` : 'Kaynak kaydı yok');
  if (!rows.length) {
    $('source-list').replaceChildren(element('p', 'source-empty', model.sourceStatus === 'invalid' ? 'Kaynak raporu geçersiz; arşiv başarı iddiası gösterilmiyor.' : 'Kaynak raporu henüz bulunamadı. Resmî kaynaklar ve hash kayıtları hazır olduğunda burada görünecek.'));
    return;
  }
  $('source-list').replaceChildren(...rows.map(row => {
    const card = element('article', 'source-card');
    const top = element('div', 'source-card-top');
    const isDownloaded = row.download?.status === 'downloaded';
    top.append(element('span', 'source-kind', sourceKinds[row.kind] ?? 'KAYNAK'), element('span', `source-download ${isDownloaded ? '' : 'failed'}`, isDownloaded ? 'İndirildi' : row.download?.status === 'failed' ? 'İndirme başarısız' : 'İndirme kaydı yok'));
    card.append(top, element('h3', null, row.title));
    const sourceUrl = safeSourceUrl(row.url);
    if (sourceUrl) {
      const link = element('a', 'source-link', `${new URL(sourceUrl).hostname} · Kaynak belgeyi aç ↗`);
      link.href = sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.append(link);
    }
    const facts = element('div', 'source-facts');
    if (row.year) facts.append(element('span', null, String(row.year)));
    if (row.programVersion) facts.append(element('span', null, row.programVersion));
    if (Array.isArray(row.grades)) facts.append(element('span', null, `${row.grades.join(', ')}. sınıflar`));
    facts.append(element('span', null, 'Yalnız referans · kullanım hakları doğrulanmadı'));
    card.append(facts);
    const details = element('details');
    details.append(element('summary', null, 'Hash & köken kaydını incele'));
    details.append(element('code', null, row.download?.sha256 ?? 'SHA-256 kaydı yok'));
    details.append(element('p', null, `Kimlik: ${row.id}`));
    if (row.download?.byteLength) details.append(element('p', null, `Boyut: ${numberFormat.format(row.download.byteLength)} bayt`));
    if (row.download?.downloadedAt) details.append(element('p', null, `İndirme: ${row.download.downloadedAt}`));
    if (row.download?.errorCode) details.append(element('p', null, `Hata kaydı: ${row.download.errorCode}`));
    details.append(element('p', null, 'Hak ve semantik incelemesi ayrıca gereklidir. İndirme, yayın izni değildir.'));
    card.append(details);
    return card;
  }));
}

async function load() {
  const sequence = ++requestSequence;
  showNotice('Yerel raporlar okunuyor…');
  try {
    const response = await fetch('/api/studio', { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error('studio_report_unavailable');
    const payload = await response.json();
    if (sequence !== requestSequence) return;
    model = readStudioPayload(payload);
    renderMetrics(); renderFilters(); updateQuestionList(); renderSources();
    if (model.status === 'ready') {
      showNotice(`${numberFormat.format(model.metrics.requested)} adaydan ${numberFormat.format(model.metrics.drafts)} taslak incelemeye kaldı. Sayısal kontroller tek başına müfredat, özgünlük veya uzman onayı değildir.`);
    } else {
      showNotice(model.status === 'invalid' ? 'Yerel pilot raporu okunamadı veya biçimi geçersiz. Başarı sayısı gösterilmiyor.' : 'Pilot raporu henüz yok. Bu ekran boş durumu gösteriyor; üretim veya yayın yapılmıyor.', model.status === 'invalid');
    }
  } catch {
    if (sequence !== requestSequence) return;
    model = readStudioPayload(null);
    renderMetrics(); renderFilters(); updateQuestionList(); renderSources();
    showNotice('Yerel rapor bağlantısı kurulamadı. Önizleme sunucusunu kontrol edip yeniden deneyin.', true);
  }
}

$('family-filter').addEventListener('change', updateQuestionList);
$('step-next').addEventListener('click', () => { if (currentFrameIndex < currentFrames.length - 1) { currentFrameIndex += 1; renderFrame(); } });
$('step-reset').addEventListener('click', () => { currentFrameIndex = 0; renderFrame(); });
$('retry-load').addEventListener('click', load);
$('refresh-data').addEventListener('click', load);
for (const link of document.querySelectorAll('.rail-nav a')) {
  link.addEventListener('click', () => { for (const other of document.querySelectorAll('.rail-nav a')) other.classList.toggle('active', other === link); });
}
load();
