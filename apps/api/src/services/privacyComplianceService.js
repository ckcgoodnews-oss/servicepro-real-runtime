const { validationError } = require('../errors/domainError');

const EVIDENCE_STATUSES = ['collected', 'review', 'accepted', 'rejected'];
const REPORT_STATUSES = ['draft', 'generated', 'published'];

function normalizeEvidenceInput(input = {}) {
  if (!input.tenantId || !input.control || !input.source || !input.reference) {
    throw validationError('tenantId, control, source, and reference are required');
  }
  return { tenantId: input.tenantId, control: input.control, source: input.source, reference: input.reference, status: 'collected', collectedAt: input.collectedAt || new Date().toISOString(), reviewer: '', reviewNote: '', reviewedAt: '', metadata: input.metadata || {} };
}
function submitEvidence(row, reviewer, at = new Date().toISOString()) { if (!reviewer) throw validationError('reviewer is required'); return { ...row, status: 'review', reviewer, updatedAt: at }; }
function reviewEvidence(row, outcome, note, at = new Date().toISOString()) { if (!['accepted', 'rejected'].includes(outcome)) throw validationError('invalid evidence outcome'); if (!note) throw validationError('review note is required'); return { ...row, status: outcome, reviewNote: note, reviewedAt: at, updatedAt: at }; }
function normalizeReportInput(input = {}) { if (!input.tenantId || !input.periodStart || !input.periodEnd) throw validationError('tenantId, periodStart, and periodEnd are required'); if (new Date(input.periodEnd) < new Date(input.periodStart)) throw validationError('periodEnd must not precede periodStart'); return { tenantId: input.tenantId, periodStart: input.periodStart, periodEnd: input.periodEnd, status: 'draft', generatedAt: '', publishedAt: '', summary: {}, metadata: input.metadata || {} }; }
function generateReport(row, evidence = [], at = new Date().toISOString()) { const inPeriod = evidence.filter(x => x.tenantId === row.tenantId && new Date(x.collectedAt) >= new Date(row.periodStart) && new Date(x.collectedAt) <= new Date(row.periodEnd)); const summary = { totalEvidence: inPeriod.length, acceptedEvidence: inPeriod.filter(x => x.status === 'accepted').length, rejectedEvidence: inPeriod.filter(x => x.status === 'rejected').length, pendingEvidence: inPeriod.filter(x => !['accepted', 'rejected'].includes(x.status)).length }; return { ...row, status: 'generated', summary, generatedAt: at, updatedAt: at }; }
function publishReport(row, at = new Date().toISOString()) { if (row.status !== 'generated') throw validationError('report must be generated before publication'); return { ...row, status: 'published', publishedAt: at, updatedAt: at }; }
function metrics({ evidence = [], reports = [] }) { return { collectedEvidence: evidence.length, acceptedEvidence: evidence.filter(x => x.status === 'accepted').length, rejectedEvidence: evidence.filter(x => x.status === 'rejected').length, pendingReview: evidence.filter(x => ['collected', 'review'].includes(x.status)).length, generatedReports: reports.filter(x => x.status === 'generated').length, publishedReports: reports.filter(x => x.status === 'published').length }; }

module.exports = { EVIDENCE_STATUSES, REPORT_STATUSES, normalizeEvidenceInput, submitEvidence, reviewEvidence, normalizeReportInput, generateReport, publishReport, metrics };
