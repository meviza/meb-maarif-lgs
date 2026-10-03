/** Read-only projection: reported evidence is not publication authority. */
const countFields = ['requested', 'producedDrafts', 'rejected', 'mathematicallyVerified', 'published'];

export function safeSourceUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function svgImageUrl(svg) {
  if (typeof svg !== 'string' || svg.length > 1_000_000 || !/^\s*<svg(?:\s|>)/u.test(svg)) return null;
  try { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; }
  catch { return null; }
}

function isQuestion(item) {
  return item && typeof item === 'object' && typeof item.id === 'string' &&
    typeof item.prompt === 'string' && Array.isArray(item.options) && item.options.length === 4 &&
    item.options.every(option => typeof option === 'string' || (typeof option === 'number' && Number.isFinite(option))) &&
    Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex < 4;
}

export function readStudioPayload(payload) {
  const base = {
    status: 'invalid', canPublish: false, metrics: null, questions: [], storyboards: [],
    sources: [], sourceStatus: 'unavailable', clefStatus: 'unknown', generatorStatus: 'unknown', report: null
  };
  if (!payload || payload.mode !== 'local_review_preview' || payload.publicationEnabled !== false) return base;
  const sourceStatus = ['available', 'unavailable', 'invalid'].includes(payload.sources?.status) ? payload.sources.status : 'invalid';
  const sources = sourceStatus === 'available' && Array.isArray(payload.sources.report?.sources)
    ? payload.sources.report.sources.filter(source => source && typeof source.id === 'string' && typeof source.title === 'string') : [];
  const pilotStatus = payload.pilot?.status;
  if (pilotStatus === 'unavailable' || pilotStatus === 'invalid') return { ...base, status: pilotStatus, sourceStatus, sources };
  const report = payload.pilot?.report;
  if (pilotStatus !== 'available' || !report?.summary || !Array.isArray(report.items) ||
    !countFields.every(field => Number.isSafeInteger(report.summary[field]) && report.summary[field] >= 0)) {
    return { ...base, sourceStatus, sources };
  }
  return {
    ...base,
    status: 'ready',
    metrics: {
      requested: report.summary.requested, drafts: report.summary.producedDrafts, rejected: report.summary.rejected,
      mathematicallyVerified: report.summary.mathematicallyVerified, published: report.summary.published
    },
    questions: report.items.filter(isQuestion),
    storyboards: Array.isArray(report.storyboards) ? report.storyboards : [],
    sources, sourceStatus,
    clefStatus: typeof report.providerStatus?.clef === 'string' ? report.providerStatus.clef : 'unknown',
    generatorStatus: typeof report.providerStatus?.generator === 'string' ? report.providerStatus.generator : 'unknown',
    report
  };
}
