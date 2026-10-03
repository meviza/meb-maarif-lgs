import { sampleInkFrame } from './ink_timeline.mjs';

const PROFILES = [
  { band: 'grades1_2', tone: 'calm', thinkingPauseSeconds: 1.2, direction: 'Sakin, sıcak ve açık konuş. Çocuklaştırıcı yapay bir ton kullanma; tek fikirdeki vurguyu belirginleştir.' },
  { band: 'grades3_4', tone: 'curious', thinkingPauseSeconds: 1, direction: 'Meraklı ve doğal bir öğretmen tonu kullan. Soru cümlesinde merakı, işlem cümlesinde açıklığı koru.' },
  { band: 'grades5_6', tone: 'curious', thinkingPauseSeconds: 0.8, direction: 'Saygılı, meraklı ve düşünmeye alan açan bir öğretmen tonu kullan. Ara sonucun anlamını sakin biçimde vurgula.' },
  { band: 'grades7_8', tone: 'coach', thinkingPauseSeconds: 0.6, direction: 'Sakin bir çalışma koçu gibi konuş. Strateji vurgusunu net tut; sınav baskısı veya performans etiketi üretme.' },
];
const TONES = {
  calm: 'Dengeli ses şiddeti, rahat vurgu ve kısa doğal duraklar kullan.',
  curious: 'Hafif merak vurgusu kullan; dramatik veya abartılı ses değişimleri yapma.',
  coach: 'Net ve güven veren bir ton kullan; acele ettirme veya rekabet baskısı kurma.',
};
function freezeDeep(value) {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) freezeDeep(item);
    Object.freeze(value);
  }
  return value;
}
function optionsValues(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || ![Object.prototype, null].includes(Object.getPrototypeOf(options))) throw new Error('invalid_teacher_voice_options');
  const keys = Reflect.ownKeys(options);
  if (keys.some(key => typeof key !== 'string' || !['plan', 'grade', 'tone'].includes(key)) || !keys.includes('plan') || !keys.includes('grade')) throw new Error('invalid_teacher_voice_options');
  const descriptors = Object.getOwnPropertyDescriptors(options);
  if (keys.some(key => !Object.hasOwn(descriptors[key], 'value'))) throw new Error('invalid_teacher_voice_options');
  return Object.fromEntries(keys.map(key => [key, descriptors[key].value]));
}

/** Offline direction only. Does not select a voice, synthesize audio, infer a learner's age,
 * certify age-appropriateness or prove naturalness. Pause values are reviewable draft heuristics.
 */
export function createTeacherVoiceDirection(options) {
  const { plan, grade, tone: selectedTone } = optionsValues(options);
  if (!Number.isInteger(grade) || grade < 1 || grade > 8 || selectedTone !== undefined && (typeof selectedTone !== 'string' || !Object.hasOwn(TONES, selectedTone))) throw new Error('invalid_teacher_voice_options');
  // Validate the source's live immutable brand before reading any source content.
  sampleInkFrame(plan, 0);
  const profile = PROFILES[Math.floor((grade - 1) / 2)];
  const tone = selectedTone ?? profile.tone;
  let startSeconds = 0;
  const cues = plan.segments.map(segment => {
    const thinkingPauseSeconds = /^step[1-4]$/.test(segment.id) ? profile.thinkingPauseSeconds : 0;
    const durationSeconds = segment.durationSeconds + thinkingPauseSeconds;
    const cue = {
      id: segment.id, narration: segment.narration,
      sourceStartSeconds: segment.startSeconds, sourceDurationSeconds: segment.durationSeconds,
      measuredAudioSeconds: segment.measuredAudioSeconds,
      startSeconds, durationSeconds, thinkingPauseSeconds,
      thinkingPausePlacement: 'after_narration_and_drawing',
    };
    startSeconds += durationSeconds;
    return cue;
  });
  return freezeDeep({
    schemaVersion: 1, state: 'draft', sourcePlanId: plan.id, grade, gradeBand: profile.band, tone,
    direction: `${profile.direction} ${TONES[tone]} Anlatım metnini aynen oku; kelime, sayı, formül veya birim değiştirme ve ek açıklama doğaçlama yapma.`,
    transcriptPolicy: 'verbatim_no_improvisation', contentSuitability: 'not_assessed',
    forbiddenStyle: ['baby_talk', 'ability_labels_or_praise', 'shaming', 'student_comparison', 'improvised_math_or_words'],
    fittingStrategy: 'extend_timeline', wordRateMultiplier: 1,
    sourceDurationSeconds: plan.durationSeconds, proposedDurationSeconds: startSeconds,
    schedulingStatus: 'proposed_not_rendered', pauseBasis: 'draft_heuristic_requires_teacher_review',
    audioSynthesized: false, publicationReady: false,
    voicePolicy: { source: 'licensed_adult_preset_only', assetStatus: 'not_selected', cloningAllowed: false, studentDataAllowed: false, networkAllowed: false },
    review: { rights: 'pending', teacher: 'pending', listener: 'pending', goldenAB: 'required', curriculum: plan.curriculumStatus },
    goldenVariants: [
      { id: 'A', direction: 'Açık ve dengeli yetişkin öğretmen anlatımı; değişmeyen metin.' },
      { id: 'B', direction: 'Sıcak ve doğal yetişkin öğretmen anlatımı; değişmeyen metin.' },
    ],
    cues,
  });
}
