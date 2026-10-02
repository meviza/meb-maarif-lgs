import fs from 'fs';

/**
 * Sorular İçin Özgün, Telifsiz Vektörel SVG Çizimleri Üretir
 */
function generateSvgForTopic(topic, branch, id) {
  const t = (topic || '').toLowerCase();

  // 1. Dik Üçgen ve Pisagor Bağıntısı
  if (t.includes('üçgen') || t.includes('pisagor') || t.includes('dik')) {
    return `<svg class="question-svg" viewBox="0 0 320 180" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" style="background:#0F172A; border-radius:8px; border:1px solid #334155; margin:12px 0;">
      <!-- Dik Üçgen -->
      <polygon points="50,140 250,140 50,30" fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" stroke-width="3" stroke-linejoin="round"/>
      <!-- Dik Açı İşareti -->
      <path d="M 50,125 L 65,125 L 65,140" fill="none" stroke="#F59E0B" stroke-width="2"/>
      <circle cx="57" cy="132" r="2" fill="#F59E0B"/>
      <!-- Köşe Noktaları -->
      <circle cx="50" cy="30" r="4" fill="#3B82F6"/>
      <circle cx="50" cy="140" r="4" fill="#3B82F6"/>
      <circle cx="250" cy="140" r="4" fill="#3B82F6"/>
      <!-- Etiketler -->
      <text x="35" y="25" fill="#E2E8F0" font-size="13" font-weight="bold" font-family="sans-serif">A</text>
      <text x="32" y="150" fill="#E2E8F0" font-size="13" font-weight="bold" font-family="sans-serif">B (90°)</text>
      <text x="260" y="145" fill="#E2E8F0" font-size="13" font-weight="bold" font-family="sans-serif">C</text>
      <text x="20" y="90" fill="#94A3B8" font-size="12" font-family="sans-serif">a cm</text>
      <text x="140" y="160" fill="#94A3B8" font-size="12" font-family="sans-serif">b cm</text>
      <text x="160" y="80" fill="#F59E0B" font-size="13" font-weight="bold" font-family="sans-serif">c = √(a²+b²)</text>
    </svg>`;
  }

  // 2. Silindir ve Geometrik Cisim Açınımı
  if (t.includes('silindir') || t.includes('prizma') || t.includes('cisim')) {
    return `<svg class="question-svg" viewBox="0 0 320 180" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" style="background:#0F172A; border-radius:8px; border:1px solid #334155; margin:12px 0;">
      <!-- Üst Daire Taban -->
      <circle cx="160" cy="35" r="25" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="2"/>
      <line x1="160" y1="35" x2="185" y2="35" stroke="#F59E0B" stroke-dasharray="3,3"/>
      <text x="168" y="30" fill="#F59E0B" font-size="11">r</text>
      <!-- Dikdörtgen Yanal Yüz -->
      <rect x="70" y="65" width="180" height="60" fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" stroke-width="2" rx="3"/>
      <!-- Alt Daire Taban -->
      <circle cx="160" cy="150" r="25" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="2"/>
      <!-- Ölçü Bilgileri -->
      <text x="135" y="100" fill="#E2E8F0" font-size="12" font-weight="bold">Yanal Yüz = 2πr × h</text>
      <line x1="60" y1="65" x2="60" y2="125" stroke="#94A3B8" stroke-width="1.5" marker-end="url(#arrow)"/>
      <text x="45" y="98" fill="#94A3B8" font-size="11">h</text>
    </svg>`;
  }

  // 3. Veri Analizi: Sütun / Çizgi Grafiği
  if (t.includes('grafik') || t.includes('veri') || t.includes('tablo') || t.includes('daire')) {
    return `<svg class="question-svg" viewBox="0 0 320 180" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" style="background:#0F172A; border-radius:8px; border:1px solid #334155; margin:12px 0;">
      <!-- Eksenler -->
      <line x1="50" y1="20" x2="50" y2="140" stroke="#64748B" stroke-width="2"/>
      <line x1="50" y1="140" x2="290" y2="140" stroke="#64748B" stroke-width="2"/>
      <!-- Kılavuz Çizgileri -->
      <line x1="50" y1="50" x2="290" y2="50" stroke="#334155" stroke-dasharray="4,4"/>
      <line x1="50" y1="95" x2="290" y2="95" stroke="#334155" stroke-dasharray="4,4"/>
      <text x="25" y="55" fill="#94A3B8" font-size="11">100</text>
      <text x="30" y="100" fill="#94A3B8" font-size="11">50</text>
      <text x="35" y="145" fill="#94A3B8" font-size="11">0</text>
      <!-- Sütunlar -->
      <rect x="75" y="45" width="30" height="95" fill="#3B82F6" rx="3"/>
      <rect x="135" y="70" width="30" height="70" fill="#10B981" rx="3"/>
      <rect x="195" y="30" width="30" height="110" fill="#F59E0B" rx="3"/>
      <rect x="255" y="85" width="30" height="55" fill="#EC4899" rx="3"/>
      <!-- Etiketler -->
      <text x="80" y="160" fill="#E2E8F0" font-size="11">1. Grup</text>
      <text x="140" y="160" fill="#E2E8F0" font-size="11">2. Grup</text>
      <text x="200" y="160" fill="#E2E8F0" font-size="11">3. Grup</text>
      <text x="260" y="160" fill="#E2E8F0" font-size="11">4. Grup</text>
    </svg>`;
  }

  // 4. Fen: Basınç / Deney Düzeneği / Sıvı Seviyesi
  if (t.includes('basınç') || t.includes('pascal') || t.includes('sıvı') || t.includes('katı') || branch === 'fen') {
    return `<svg class="question-svg" viewBox="0 0 320 180" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" style="background:#0F172A; border-radius:8px; border:1px solid #334155; margin:12px 0;">
      <!-- Kap 1 -->
      <rect x="50" y="50" width="80" height="90" fill="none" stroke="#94A3B8" stroke-width="3" rx="2"/>
      <rect x="52" y="80" width="76" height="58" fill="rgba(6, 182, 212, 0.4)"/>
      <text x="75" y="115" fill="#E2E8F0" font-size="12" font-weight="bold">d yoğunluk</text>
      <line x1="38" y1="80" x2="38" y2="138" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="22" y="112" fill="#F59E0B" font-size="11">h</text>
      <text x="75" y="160" fill="#E2E8F0" font-size="11" font-weight="bold">1. Kap</text>

      <!-- Kap 2 (U Borusu / 2h Derinlik) -->
      <rect x="180" y="40" width="90" height="100" fill="none" stroke="#94A3B8" stroke-width="3" rx="2"/>
      <rect x="182" y="50" width="86" height="88" fill="rgba(59, 130, 246, 0.5)"/>
      <text x="205" y="100" fill="#E2E8F0" font-size="12" font-weight="bold">2d yoğunluk</text>
      <line x1="168" y1="50" x2="168" y2="138" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="150" y="98" fill="#F59E0B" font-size="11">2h</text>
      <text x="210" y="160" fill="#E2E8F0" font-size="11" font-weight="bold">2. Kap</text>
    </svg>`;
  }

  // 5. Türkçe: Sözel Mantık / Tablo
  if (branch === 'turkce' && (t.includes('mantık') || t.includes('tablo') || t.includes('paragraf'))) {
    return `<div class="question-visual-table" style="overflow-x:auto; margin:12px 0;">
      <table style="width:100%; border-collapse:collapse; background:#0F172A; color:#E2E8F0; font-size:12px; border:1px solid #334155; border-radius:6px;">
        <thead>
          <tr style="background:#1E293B; border-bottom:2px solid #3B82F6;">
            <th style="padding:8px; text-align:left;">Katılımcı</th>
            <th style="padding:8px; text-align:center;">1. Oturum (09:30)</th>
            <th style="padding:8px; text-align:center;">2. Oturum (11:00)</th>
            <th style="padding:8px; text-align:center;">Tercih Durumu</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:8px; font-weight:600;">Ahmet & Zeynep</td>
            <td style="padding:8px; text-align:center; color:#10B981;">Edebiyat / Şiir</td>
            <td style="padding:8px; text-align:center; color:#94A3B8;">Boş</td>
            <td style="padding:8px; text-align:center;">Birlikte Katılım</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:8px; font-weight:600;">Burak</td>
            <td style="padding:8px; text-align:center; color:#94A3B8;">Boş</td>
            <td style="padding:8px; text-align:center; color:#3B82F6;">Tarih / Felsefe</td>
            <td style="padding:8px; text-align:center;">Bireysel</td>
          </tr>
          <tr>
            <td style="padding:8px; font-weight:600;">Ceren & Derya</td>
            <td style="padding:8px; text-align:center; color:#F59E0B;">Sanat Atölyesi</td>
            <td style="padding:8px; text-align:center; color:#10B981;">Yazarlık</td>
            <td style="padding:8px; text-align:center;">Ardışık Oturum</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  return null;
}

console.log("Enriching questions with high-resolution vector SVGs and data tables...");
const raw = JSON.parse(fs.readFileSync('public/questions.json', 'utf-8'));

let enrichedCount = 0;
for (const [bKey, branch] of Object.entries(raw)) {
  for (const test of branch.tests) {
    for (const q of test.questions) {
      const visualHtml = generateSvgForTopic(q.topic || test.title, bKey, q.id);
      if (visualHtml) {
        q.visualContent = visualHtml;
        q.hasVisual = true;
        q.visualType = visualHtml.includes('<svg') ? 'svg_vector' : 'data_table';
        enrichedCount++;
      }
    }
  }
}

fs.writeFileSync('public/questions.json', JSON.stringify(raw, null, 2), 'utf-8');
console.log(`Successfully enriched ${enrichedCount} questions with visual assets!`);
