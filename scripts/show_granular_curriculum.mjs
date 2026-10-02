import { getGranularCurriculumStats, ALL_GRADES_CURRICULUM } from '../engine/meb_granular_curriculum.mjs';

const stats = getGranularCurriculumStats();

console.log("================================================================================");
console.log("   MEB MAARİF MODELİ - AYRINTILI MİKRO KONU VE KAZANIM ENVANTERİ (5, 6, 7, 8)   ");
console.log("================================================================================");
console.log(`4 Kademe Genel Mikro Konu Sayısı: ${stats.grandTotalMicroTopics} Bağımsız Mikro Konu / Alt Başlık\n`);

for (const grade of [5, 6, 7, 8]) {
  const gKey = `grade${grade}`;
  const totalSub = stats[`${gKey}TotalSubtopics`];
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`[KADEME: ${grade}. SINIF] (Toplam: ${totalSub} Mikro Konu / Alt Başlık)`);
  console.log(`--------------------------------------------------------------------------------`);
  
  const cur = stats[gKey];
  for (const [cKey, c] of Object.entries(cur)) {
    console.log(`  * ${c.courseName.padEnd(35)}: ${String(c.units).padStart(2)} Ünite | ${String(c.topics).padStart(2)} Ana Konu | ${String(c.subtopics).padStart(3)} Alt/Mikro Konu`);
  }
}
console.log("================================================================================");
console.log("Ayrıntılı döküm için: getGranularSubtopics(courseKey, grade) API fonksiyonunu kullanabilirsiniz.");
console.log("================================================================================");
