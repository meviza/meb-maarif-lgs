/**
 * Soru Bankasını JEV 1-5 Yıldız Zorluk Derecelendirmesi ile Zenginleştirme Aracı
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JevQualityAuditor } from '../engine/jev_evaluator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const qPath = path.join(__dirname, '..', 'public', 'questions.json');
const rawData = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
const auditor = new JevQualityAuditor();

let enrichedCount = 0;
const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

Object.keys(rawData).forEach(courseKey => {
  const course = rawData[courseKey];
  if (!course.tests) return;

  course.tests.forEach(test => {
    if (!test.questions) return;
    test.questions.forEach(q => {
      const starRating = auditor.calculateStarRating(q);
      q.starRating = starRating;
      if (q.jevAudit && q.jevAudit.decisions) {
        q.jevAudit.decisions.star_rating = starRating;
      }
      starCounts[starRating.stars] = (starCounts[starRating.stars] || 0) + 1;
      enrichedCount++;
    });
  });
});

fs.writeFileSync(qPath, JSON.stringify(rawData, null, 2), 'utf-8');

console.log(`[OK] ${enrichedCount} soru JEV 1-5 Yıldız Zorluk Derecelendirmesi ile zenginleştirildi.`);
console.log("ZORLUK DERECESİ DAĞILIMI:");
console.log(`  * 1 Yıldız (★☆☆☆☆ - Temel Tanım)      : ${starCounts[1]} Soru`);
console.log(`  * 2 Yıldız (★★☆☆☆ - Kavrama)          : ${starCounts[2]} Soru`);
console.log(`  * 3 Yıldız (★★★☆☆ - Uygulama)         : ${starCounts[3]} Soru`);
console.log(`  * 4 Yıldız (★★★★☆ - LGS Yeni Nesil)   : ${starCounts[4]} Soru`);
console.log(`  * 5 Yıldız (★★★★★ - Şampiyon/Seçici)  : ${starCounts[5]} Soru`);
