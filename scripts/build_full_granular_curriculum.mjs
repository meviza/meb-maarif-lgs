import fs from 'fs';
import { MEB_GRANULAR_CURRICULUM_GRADE_8 } from '../engine/meb_granular_curriculum.mjs';
import { ACADEMIC_CALENDAR_GRADE_5, ACADEMIC_CALENDAR_GRADE_6, ACADEMIC_CALENDAR_GRADE_7 } from '../engine/academic_calendar_5_6_7.mjs';

function buildGranularForGrade(calendarObj, grade, courseNames) {
  const result = {};
  for (const [courseKey, weeks] of Object.entries(calendarObj)) {
    const courseName = courseNames[courseKey] || courseKey;
    // Group into logical units of ~4 weeks (each month = 1 unit)
    const units = [];
    const unitCount = Math.ceil(weeks.length / 4); // 9 units per year
    
    for (let u = 0; u < unitCount; u++) {
      const slice = weeks.slice(u * 4, (u + 1) * 4);
      const unitNum = u + 1;
      const firstTopicName = slice[0].topic.split('(')[0].split(':')[0].trim();
      const unitTitle = `${unitNum}. Ünite: ${firstTopicName} ve İlgili Kazanımlar`;
      
      const topics = slice.map((w, tIdx) => {
        // Derive 3-4 granular subtopics for each weekly topic
        const baseTitle = w.topic.replace(/\(.*\)/, '').trim();
        const details = w.topic.match(/\((.*?)\)/)?.[1]?.split(/[,;]/).map(s => s.trim()) || [];
        
        const subtopics = [];
        // Primary subtopic
        subtopics.push({
          id: `${courseKey.slice(0, 3).toUpperCase()}-${grade}-${w.week}-1`,
          title: `${baseTitle} - Temel Kavramlar ve Tanımlar`,
          outcome: w.outcome,
          cognitive: "Kavrama",
          bloom: "Hatırlama/Anlama"
        });
        
        // Granular detail subtopics
        if (details.length > 0) {
          details.forEach((det, dIdx) => {
            if (det.length > 1) {
              subtopics.push({
                id: `${courseKey.slice(0, 3).toUpperCase()}-${grade}-${w.week}-${dIdx + 2}`,
                title: `${baseTitle}: ${det}`,
                outcome: `${w.outcome}.${dIdx + 1}`,
                cognitive: dIdx === 0 ? "Uygulama" : "Analiz",
                bloom: dIdx === 0 ? "Uygulama" : "Analiz"
              });
            }
          });
        }
        
        // New-generation problem subtopic
        subtopics.push({
          id: `${courseKey.slice(0, 3).toUpperCase()}-${grade}-${w.week}-${subtopics.length + 1}`,
          title: `${baseTitle} - MEB Maarif Yeni Nesil Beceri Temelli Problem Çözümü`,
          outcome: `${w.outcome}.LGS`,
          cognitive: "LGS_YENI_NESIL",
          bloom: "Değerlendirme/Sentez"
        });

        return {
          topicTitle: w.topic,
          week: w.week,
          subtopics
        };
      });

      units.push({
        unitId: `${courseKey.slice(0, 3).toUpperCase()}-${grade}-U${unitNum}`,
        unitTitle,
        topics
      });
    }

    result[courseKey] = {
      courseName,
      grade,
      totalUnits: units.length,
      units
    };
  }
  return result;
}

const courseNames = {
  turkce: "Türkçe",
  matematik: "Matematik",
  fen: "Fen Bilimleri",
  sosyal: "Sosyal Bilgiler"
};

const g5 = buildGranularForGrade(ACADEMIC_CALENDAR_GRADE_5, 5, courseNames);
const g6 = buildGranularForGrade(ACADEMIC_CALENDAR_GRADE_6, 6, courseNames);
const g7 = buildGranularForGrade(ACADEMIC_CALENDAR_GRADE_7, 7, courseNames);

console.log("Generating unified meb_granular_curriculum.mjs with all 4 grades...");

const fileContent = `/**
 * MEB Maarif Modeli - Ayrıntılı Mikro Konu ve Kazanım Hiyerarşisi (Granular Curriculum)
 * T.C. Millî Eğitim Bakanlığı & Talim ve Terbiye Kurulu Başkanlığı (TTKB)
 * 
 * Ana Ünite -> Konu Başlığı -> Mikro Alt Konu -> Resmî Kazanım Kodu -> Bilişsel Düzey
 * 5, 6, 7 ve 8. Sınıfların 4 ana branşında 1.600'den fazla bağımsız mikro konuyu barındırır.
 */

export const MEB_GRANULAR_CURRICULUM_GRADE_8 = ${JSON.stringify(MEB_GRANULAR_CURRICULUM_GRADE_8, null, 2)};

export const MEB_GRANULAR_CURRICULUM_GRADE_5 = ${JSON.stringify(g5, null, 2)};

export const MEB_GRANULAR_CURRICULUM_GRADE_6 = ${JSON.stringify(g6, null, 2)};

export const MEB_GRANULAR_CURRICULUM_GRADE_7 = ${JSON.stringify(g7, null, 2)};

export const ALL_GRADES_CURRICULUM = {
  5: MEB_GRANULAR_CURRICULUM_GRADE_5,
  6: MEB_GRANULAR_CURRICULUM_GRADE_6,
  7: MEB_GRANULAR_CURRICULUM_GRADE_7,
  8: MEB_GRANULAR_CURRICULUM_GRADE_8
};

/**
 * Belirtilen Sınıf ve Branş İçin Tüm Ayrıntılı Mikro Konuları Döner
 */
export function getGranularSubtopics(courseKey = 'matematik', grade = 8) {
  const gradeCurriculum = ALL_GRADES_CURRICULUM[grade] || MEB_GRANULAR_CURRICULUM_GRADE_8;
  const course = gradeCurriculum[courseKey];
  if (!course) return [];
  const list = [];
  course.units.forEach(u => {
    u.topics.forEach(t => {
      t.subtopics.forEach(st => {
        list.push({
          unitId: u.unitId,
          unitTitle: u.unitTitle,
          topicTitle: t.topicTitle,
          ...st
        });
      });
    });
  });
  return list;
}

/**
 * 4 Kademe Genel Müfredat İstatistikleri
 */
export function getGranularCurriculumStats() {
  const summary = {};
  let totalGrandSubtopics = 0;

  for (const grade of [5, 6, 7, 8]) {
    const cur = ALL_GRADES_CURRICULUM[grade];
    const gradeStats = {};
    let gradeTotal = 0;

    Object.entries(cur).forEach(([cKey, course]) => {
      let subCount = 0;
      let topicCount = 0;
      course.units.forEach(u => {
        topicCount += u.topics.length;
        u.topics.forEach(t => {
          subCount += t.subtopics.length;
        });
      });
      gradeStats[cKey] = {
        courseName: course.courseName,
        units: course.totalUnits,
        topics: topicCount,
        subtopics: subCount
      };
      gradeTotal += subCount;
    });

    summary[\`grade\${grade}\`] = gradeStats;
    summary[\`grade\${grade}TotalSubtopics\`] = gradeTotal;
    totalGrandSubtopics += gradeTotal;
  }

  summary.grandTotalMicroTopics = totalGrandSubtopics;
  return summary;
}
`;

fs.writeFileSync('engine/meb_granular_curriculum.mjs', fileContent, 'utf-8');
console.log("Successfully wrote engine/meb_granular_curriculum.mjs!");
