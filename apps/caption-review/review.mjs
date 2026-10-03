// Only current data from this page's own loopback API. No storage, tracking,
// account access, HTML sink, audio, timer alignment or automatic POST retry.
(() => {
  const names = { goal: 'İstenen', evidence: 'Verilenler', plan: 'Plan', why: 'Gerekçe', result: 'Sonuç',
    check_prompt: 'Kontrol sorusu', check_answer: 'Kontrol açıklaması', summary: 'Özet',
    transfer_prompt: 'Yeni koşul', transfer_answer: 'Aktarım açıklaması' };
  const controls = [ ['previous-page', 'previous_page', 'canPreviousPage'], ['next-page', 'next_page', 'canNextPage'],
    ['previous-cue', 'previous_cue', 'canPreviousCue'], ['next-cue', 'next_cue', 'canNextCue'],
    ['reveal-current', 'reveal_current', 'canRevealCurrent'] ];
  const get = id => document.getElementById(id);
  let current = null, busy = true;
  function buttons() {
    for (const [id, , permission] of controls) get(id).disabled = busy || !current || !current.navigation[permission];
  }
  function svgData(svg) {
    if (typeof svg !== 'string') throw new Error('invalid_current_frame');
    const bytes = new TextEncoder().encode(svg);
    if (bytes.length > 131072) throw new Error('invalid_current_frame');
    let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
    return 'data:image/svg+xml;base64,' + btoa(binary);
  }
  function show(record) {
    if (!record || !record.cursor || !record.caption || !Array.isArray(record.caption.lines)
      || record.caption.lines.length < 1 || record.caption.lines.length > 2
      || record.caption.lines.some(line => typeof line !== 'string' || line.length > 62)
      || !record.navigation || !record.narrationPacket || !record.frame
      || !Object.hasOwn(names, record.cursor.kind)) throw new Error('invalid_current_record');
    const imageData = svgData(record.frame.svg);
    const narration = record.narrationPacket.fullTranscript;
    if (narration !== null && (typeof narration !== 'string' || narration.length > 4096)) throw new Error('invalid_current_narration');
    current = record;
    const lines = record.caption.lines.map(line => { const node = document.createElement('p'); node.className = 'caption-line'; node.textContent = line; return node; });
    get('caption-lines').replaceChildren(...lines);
    get('cue-counter').textContent = `${names[record.cursor.kind]} · Adım ${record.cursor.cueIndex + 1} / ${record.cursor.cueCount} · Sayfa ${record.cursor.pageIndex + 1} / ${record.cursor.pageCount}`;
    get('source-image').setAttribute('aria-hidden', 'true'); get('source-image').setAttribute('alt', '');
    get('source-image').src = imageData;
    get('svg-preview').open = false; get('narration-preview').open = false;
    get('full-narration').textContent = narration === null ? 'Geçerli yanıt kilitli; tam anlatım henüz gösterilmiyor.' : narration;
    get('status').textContent = record.navigation.forwardBlockedReason === 'protected_response_requires_explicit_editor_reveal'
      ? 'Bu yanıtı geçmeden önce editörün açık yanıtı gösterme isteği gerekir; bu bir öğrenci yetkisi veya onay değildir.'
      : record.navigation.forwardBlockedReason === 'caption_pages_remaining' ? 'Bu açıklamanın diğer sayfaları var.'
        : record.navigation.forwardBlockedReason === 'end_of_cues' ? 'Son adım; bu durum öğrenme veya yayın onayı değildir.' : 'Yalnız geçerli adım ve sayfa gösteriliyor.';
    buttons();
  }
  async function read() {
    const response = await fetch('/api/current', { credentials: 'omit', cache: 'no-store', redirect: 'error', mode: 'same-origin' });
    if (!response.ok) throw new Error('current_request_rejected');
    return response.json();
  }
  async function send(type) {
    if (busy || !current) return;
    busy = true; buttons(); get('status').textContent = 'Yerel isteğin sonucu bekleniyor.';
    try {
      const response = await fetch('/api/action', { method: 'POST', credentials: 'omit', cache: 'no-store', redirect: 'error',
        mode: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
      if (!response.ok) throw new Error('action_request_rejected');
      show(await response.json());
    } catch {
      // Re-read uncertain local state; never retry the mutating action.
      try { show(await read()); } catch { current = null; /* Old view is stale, not mutation authority. */ }
      get('status').textContent = 'İstek reddedildi veya bağlantı kesildi. POST tekrarlanmadı; durum yeniden okunamadıysa görünüm eski olabilir.';
    } finally { busy = false; buttons(); }
  }
  for (const [id, type] of controls) get(id).addEventListener('click', () => send(type));
  buttons();
  read().then(show).catch(() => { get('status').textContent = 'Yerel geçerli durum okunamadı. Bu görünüm bir onay veya kayıt sonucu değildir.'; })
    .finally(() => { busy = false; buttons(); });
})();
