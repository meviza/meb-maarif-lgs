#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join, parse, resolve, sep } from 'node:path';
import { createGardenReasoningOverlay, getGardenReasoningView } from '../packages/media/garden_reasoning.mjs';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';

async function freshOutput(argv) {
  if (argv.length !== 2 || argv[0] !== '--out') throw new Error('usage: node tools/build_reasoned_teaching_preview.mjs --out ABSOLUTE_FRESH_DIRECTORY');
  const raw = argv[1];
  if (!isAbsolute(raw)) throw new Error('absolute_output_directory_required');
  const parts = raw.slice(parse(raw).root.length).split(sep).filter(Boolean);
  if (parts.some(part => part === '.' || part === '..')) throw new Error('canonical_absolute_output_directory_required');
  let current = parse(raw).root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    let info;
    try { info = await lstat(current); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      if (index !== parts.length - 1) throw new Error('output_parent_directory_must_exist');
      continue;
    }
    if (info.isSymbolicLink()) throw new Error('symlink_output_path_not_allowed');
    if (index === parts.length - 1) throw new Error('output_directory_must_be_fresh');
    if (!info.isDirectory()) throw new Error('output_parent_directory_must_exist');
  }
  if (!parts.length) throw new Error('output_directory_must_be_fresh');
  return resolve(raw);
}

async function ownedModule(relative) {
  const file = new URL(relative, import.meta.url);
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('owned_preview_module_required');
  return readFile(file, 'utf8');
}

function html() {
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'; media-src 'none'; base-uri 'none'; form-action 'none'">
<title>Gerekçeli çözüm · editör önizlemesi</title><style>
:root{color-scheme:light;--paper:#f4efe5;--sheet:#fffdf7;--teal:#164d48;--ink:#263c38;--muted:#587168;--line:#ced8cf;--clay:#a54c2c}*{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 system-ui,sans-serif}header{padding:38px max(22px,calc((100vw - 1260px)/2));background:var(--teal);color:var(--sheet);border-bottom:7px solid #c78a66}header h1{font:clamp(31px,4.5vw,52px)/1.15 Georgia,serif;margin:13px 0 16px}header p{margin:8px 0;max-width:850px}.eyebrow{font-size:11px;letter-spacing:.1em;text-transform:uppercase}.badge{display:inline-block;padding:6px 12px;border:1px solid #9ac0af;border-radius:50px;font-size:12px}.layout{max-width:1304px;margin:28px auto;padding:0 22px;display:grid;grid-template-columns:320px minmax(0,1fr);gap:26px}aside,.reason-panel,.ink-panel,.review-note{background:var(--sheet);border:1px solid var(--line);border-radius:14px}aside{align-self:start;padding:25px;position:sticky;top:24px}h2,h3{font-family:Georgia,serif;font-weight:400;line-height:1.25}h2{font-size:clamp(26px,3.6vw,38px);margin:9px 0 16px}h3{font-size:21px;margin:0 0 10px}aside h2{font-size:25px}.question{font-size:16px;line-height:1.75}mark{background:#f2d9aa;color:#263c38;border-radius:3px;padding:0 2px;text-decoration:underline;text-decoration-color:var(--clay);text-underline-offset:3px}.given-list{padding:0;list-style:none;display:grid;gap:9px}.given{padding:9px 12px;border-left:3px solid #d9ded6;background:#f5f5ed;font-size:13px}.given.active{border-color:var(--clay);background:#f6e9d7}.given strong,.given span{display:block}.given span{color:var(--muted)}.stage-list{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0 0 17px}.stage-list li{font-size:11px;line-height:1.4;padding:6px 8px;border:1px solid var(--line);border-radius:20px;color:var(--muted)}.stage-list .current{color:var(--sheet);background:var(--teal);border-color:var(--teal)}.stage-list .visited{background:#e7eee5}.reason-panel{padding:26px 30px}.counter{color:var(--muted);font-size:13px}.explanation{font-size:18px;line-height:1.65;margin:0 0 18px}.why{border-left:3px solid var(--clay);padding:10px 17px;background:#f8f0e2}.why p{margin:0}.label{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--clay);display:block;margin-bottom:7px}.result{padding:17px 20px;margin-top:18px;background:#e8efe5;border-radius:8px}.equation{font:clamp(23px,3vw,31px)/1.5 Georgia,serif;color:var(--teal);margin:0}.result p:last-child{margin:4px 0 0}.checkpoint{font-size:17px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line)}.answer{padding:12px 16px;background:#e8efe5}.controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:22px}button{font:inherit;cursor:pointer;min-height:44px;border-radius:7px;border:1px solid #bacbc0;padding:9px 16px;background:var(--sheet);color:var(--teal)}button.primary{background:var(--teal);color:var(--sheet);border-color:var(--teal)}button.reveal{background:#f0d9be;border-color:#d8b387;color:#653c23}button:disabled{opacity:.5;cursor:not-allowed}button:focus-visible,input:focus-visible{outline:3px solid var(--clay);outline-offset:3px}.hint{font-size:13px;color:var(--muted);min-height:22px}.ink-panel{margin-top:18px;overflow:hidden}.ink-panel img{width:100%;height:auto;display:block}.ink-caption{padding:12px 18px;border-top:1px solid var(--line);font-size:12px;color:var(--muted);display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px}.motion{display:flex;align-items:center;gap:8px}.motion input{width:18px;height:18px}.review-note{max-width:1260px;margin:22px auto;padding:18px 24px;font-size:13px;color:var(--muted)}.loading{padding:30px;text-align:center}.prior{font-size:13px;padding:13px 0 0;border-top:1px solid var(--line);margin-top:18px}.prior ul{padding-left:20px}.alternate{border-left:3px solid var(--teal);padding:14px 18px;margin-top:18px;background:#edf2e8}.alternate p{margin:7px 0}.screen-note{color:var(--muted);font-size:12px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:900px){.layout{grid-template-columns:1fr}aside{position:static}.given-list{grid-template-columns:1fr 1fr}.reason-panel{padding:23px}.review-note{margin:22px}}@media(max-width:520px){header{padding:28px 22px}.layout{padding:0 14px;margin-top:18px;gap:18px}.given-list{grid-template-columns:1fr}.reason-panel,aside{padding:20px}.controls button{flex:1 1 auto}.controls .reveal{flex-basis:100%}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style></head><body><header><div class="eyebrow">İçerik editörü önizlemesi · öğrencilere kapalı</div><h1>Önce nedenini bul.<br>Sonra işlemi yap.</h1><span class="badge">Gerekçeli çözüm · yeni metin taslağı</span><p>Soruyu anla → verilenleri ilişkilendir → yolunu seç → hesapla → kontrol et. Sayılar yalnız sonuç değil, birer anlam taşır.</p></header>
<p id="loading-status" class="loading" role="status">Gerekçeli çözüm yükleniyor…</p><main id="review-player" class="layout" hidden><aside><div class="eyebrow">Kaynak soru · özgün bahçe problemi</div><h2>Bizden ne isteniyor?</h2><p id="question-text" class="question"></p><h3>Verilerin görevi</h3><ul id="given-list" class="given-list"></ul><section id="prior-card" class="prior" hidden><h3>Buraya kadar bulduklarımız</h3><ul id="prior-results"></ul></section><p class="screen-note">Vurgu bu adımda kullanılan bilgiyi gösterir. Tek cevaptan öğrenci teşhisi çıkarılmaz.</p></aside><section aria-label="Gerekçeli çözüm adımları"><ol id="stage-list" class="stage-list" aria-label="Çözüm akışı"><li>İstenen</li><li>Verilenler</li><li>Plan</li><li>Uzun kenar</li><li>Çevre</li><li>Bir sıra</li><li>İki sıra</li><li>Kontrol</li><li>Pratik yol</li></ol><article class="reason-panel"><div class="counter">Adım <span id="stage-counter"></span></div><h2 id="stage-title"></h2><p id="reason-explanation" class="explanation"></p><div id="why-card" class="why"><span class="label">Neden bu yol?</span><p id="why-operation"></p></div><section id="worked-step-card" class="result" hidden><span class="label">Eş parçaları adım adım kur</span><ol id="worked-step-list"></ol></section><section id="calculation-card" class="result" hidden><p id="calculation-result" class="equation"></p><p id="calculation-meaning"></p></section><p id="check-question" class="checkpoint" hidden></p><p id="check-answer" class="answer" hidden></p><section id="alternate-card" class="alternate" hidden><h3>Aynı mantık, kısa yazım</h3><p id="alternate-expression" class="equation"></p><p id="alternate-why"></p><p id="alternate-condition"></p></section><div class="controls"><button id="previous-stage" type="button">Önceki</button><button id="reveal-calculation" class="reveal" type="button" hidden>Gerekçeyi düşündüm · işlemi gör</button><button id="next-stage" class="primary" type="button">Sonraki</button><button id="reset-stages" type="button">Baştan</button></div><p id="next-hint" class="hint" role="status"></p></article><figure class="ink-panel"><img id="ink-frame" width="1280" height="720" alt="Bahçe modeli ve yalnız açılmış çözüm adımlarının kalemle yazım önizlemesi"><figcaption class="ink-caption"><span>Özgün kalem geometrisi · yeni ses üretilmedi</span><label class="motion"><input id="reduce-motion" type="checkbox"> Hareketi azalt</label></figcaption></figure></section></main><footer class="review-note">Bu sürüm metin ve etkileşimli kalem önizlemesidir; yeni ses veya yeni video değildir. Eski kısa seslendirme burada oynatılmaz. Müfredat, pedagojik ve erişilebilirlik uzman incelemesi bekliyor. Öğrenci verisi, dış servis çağrısı ve yayın onayı yoktur.</footer><script type="module" src="./reasoned-player.mjs"></script></body></html>\n`;
}

try {
  const out = await freshOutput(process.argv.slice(2));
  const overlay = createGardenReasoningOverlay();
  const variants = {
    schemaVersion: 'garden-reasoning-views/v1',
    hidden: overlay.stages.map((_, stageIndex) => getGardenReasoningView(overlay, { stageIndex, revealAnswer: false })),
    revealed: overlay.stages.map((_, stageIndex) => getGardenReasoningView(overlay, { stageIndex, revealAnswer: true })),
  };
  const files = {
    'index.html': html(), 'reasoning.json': json(overlay), 'reasoning-views.json': json(variants),
    'reasoned-player.mjs': await ownedModule('../apps/teaching-review/reasoned_player.mjs'),
    'ink-timeline.mjs': await ownedModule('../packages/media/ink_timeline.mjs'),
  };
  files['bundle-manifest.json'] = json({
    schemaVersion: 'reasoned-teaching-preview/v1', source: variants.hidden[0].source,
    state: 'editor_review_draft', studentsAllowed: false, publicationReady: false,
    audioAttached: false, videoAttached: false, mediaStatus: 'new_narration_not_generated',
    files: Object.entries(files).map(([name, bytes]) => ({ name, sha256: sha256(bytes), byteLength: Buffer.byteLength(bytes) })),
  });
  try { await mkdir(out, { mode: 0o700 }); } catch (error) {
    if (error.code === 'EEXIST') throw new Error('output_directory_must_be_fresh');
    throw error;
  }
  for (const [name, bytes] of Object.entries(files)) await writeFile(join(out, name), bytes, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ out, files: 6, state: 'editor_review_draft', publicationReady: false, mediaStatus: 'new_narration_not_generated' }));
} catch (error) {
  console.error(error?.message ?? 'reasoned_teaching_preview_failed');
  process.exitCode = 1;
}
