// Synthetic server-issued enrolment policy only. Not production authentication,
// billing, MEB outcome approval, or permission to deliver the draft question bank.
const issuedContexts = new WeakSet();
const SCHOOL = 'synthetic-school', YEAR = '2026-2027', GRADE = 6;
const COURSE_CATEGORIES = [
  ['turkce', 'Türkçe', 'Okumak, anlamak ve kendini ifade etmek', 'tymm-current-ortaokul-turkce'],
  ['matematik', 'Matematik', 'Düşünmek, ilişki kurmak ve çözüm geliştirmek', 'tymm-current-ortaokul-matematik'],
  ['fen', 'Fen Bilimleri', 'Gözlemlemek, araştırmak ve keşfetmek', 'tymm-current-fen-bilimleri'],
  ['sosyal', 'Sosyal Bilgiler', 'İnsan, toplum ve yaşadığımız dünya', 'tymm-current-sosyal-bilgiler'],
  ['ingilizce', 'İngilizce', 'Yeni bir dilde iletişim kurmak', 'tymm-current-ingilizce'],
  ['din', 'Din Kültürü ve Ahlak Bilgisi', 'Anlamak, değerler ve birlikte yaşamak', 'tymm-current-din-kulturu'],
];
const deny = reason => ({ allowed: false, reason });
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value ? time : null;
}

// Overrides are explicitly server-side fixture configuration for negative tests.
// No HTTP body/query/cookie can call this factory or install a trusted context.
export function createSyntheticStudentContext({ enrollment = {}, subscription = {} } = {}) {
  const context = Object.freeze({
    mode: 'synthetic_server_issued',
    enrollment: Object.freeze({ learnerId: 'synthetic-learner-6', schoolId: SCHOOL, schoolYear: YEAR, grade: GRADE, role: 'student', status: 'active', ...enrollment }),
    subscription: Object.freeze({ schoolId: SCHOOL, schoolYear: YEAR, status: 'active', startsAt: '2026-09-01T00:00:00.000Z', expiresAt: '2027-09-01T00:00:00.000Z', ...subscription }),
  });
  issuedContexts.add(context);
  return context;
}

function courseMetadata(sourceRegistry) {
  if (!sourceRegistry || !Array.isArray(sourceRegistry.sources) || sourceRegistry.sources.length > 128) return null;
  const result = [];
  for (const [id, title, subtitle, registryEntryId] of COURSE_CATEGORIES) {
    const entries = sourceRegistry.sources.filter(source => source?.id === registryEntryId);
    if (entries.length !== 1) return null;
    const source = entries[0];
    if (source.kind !== 'curriculum_current' || !Array.isArray(source.grades) || !source.grades.includes(GRADE) || source.usagePolicy !== 'reference_only' || source.download?.status !== 'downloaded' || !/^[a-f0-9]{64}$/.test(source.download?.sha256 ?? '') || source.expectedSha256 !== source.download.sha256) return null;
    try { const url = new URL(source.url); if (url.protocol !== 'https:' || !(url.hostname === 'meb.gov.tr' || url.hostname.endsWith('.meb.gov.tr')) || url.username || url.password) return null; } catch { return null; }
    result.push({ id, title, subtitle, source: { registryEntryId, sha256: source.download.sha256, verification: 'source_catalog_metadata_only' } });
  }
  return result;
}

export function getStudentWorkspace({ context, sourceRegistry, now = new Date().toISOString(), requestedScope = {} } = {}) {
  if (!context || !issuedContexts.has(context)) return deny('server_context_required');
  const current = timestamp(now);
  if (current === null) return deny('invalid_time');
  const enrollment = context.enrollment, subscription = context.subscription;
  if (enrollment.role !== 'student' || enrollment.status !== 'active') return deny('active_student_enrollment_required');
  if (enrollment.schoolId !== SCHOOL || enrollment.schoolId !== subscription.schoolId) return deny('school_scope_mismatch');
  if (enrollment.schoolYear !== YEAR || enrollment.schoolYear !== subscription.schoolYear) return deny('school_year_mismatch');
  if (enrollment.grade !== GRADE || enrollment.learnerId !== 'synthetic-learner-6') return deny('synthetic_grade_context_mismatch');
  if (subscription.status !== 'active') return deny('active_subscription_required');
  const start = timestamp(subscription.startsAt), expiry = timestamp(subscription.expiresAt);
  if (start === null || expiry === null || start >= expiry || subscription.startsAt !== '2026-09-01T00:00:00.000Z' || subscription.expiresAt !== '2027-09-01T00:00:00.000Z') return deny('invalid_subscription_interval');
  if (current < start) return deny('subscription_not_started');
  if (current >= expiry) return deny('subscription_expired');
  if (!requestedScope || typeof requestedScope !== 'object' || Array.isArray(requestedScope) || Object.keys(requestedScope).some(key => !['schoolId', 'schoolYear', 'grade'].includes(key)) || ['schoolId', 'schoolYear', 'grade'].some(key => Object.hasOwn(requestedScope, key) && requestedScope[key] !== enrollment[key])) return deny('scope_mismatch');
  const courses = courseMetadata(sourceRegistry);
  if (!courses) return deny('course_catalog_unavailable');
  return { allowed: true, workspace: {
    mode: 'synthetic_student_preview', grade: GRADE, schoolYear: YEAR, publicationEnabled: false,
    context: { schoolId: SCHOOL, learnerId: enrollment.learnerId, grade: GRADE, schoolYear: YEAR },
    subscription: { status: 'active', kind: 'annual_school_preview', expiresAt: subscription.expiresAt },
    courses, library: { questions: [], lessons: [], videos: [] },
    contentStatus: 'metadata_only_no_published_library', authenticationStatus: 'synthetic_fixture_not_production_auth',
  } };
}
