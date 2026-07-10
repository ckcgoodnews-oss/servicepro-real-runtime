const { validationError } = require('../errors/domainError');

const VENDOR_STATUSES = ['prospect', 'active', 'inactive', 'terminated'];
const CRITICALITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const ASSESSMENT_STATUSES = ['draft', 'sent', 'in_review', 'completed', 'expired', 'cancelled'];
const FINDING_STATUSES = ['open', 'in_remediation', 'risk_accepted', 'closed', 'false_positive'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const TASK_STATUSES = ['open', 'in_progress', 'completed', 'blocked', 'cancelled'];
const EXCEPTION_STATUSES = ['pending', 'approved', 'rejected', 'expired', 'revoked'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  if (Number.isNaN(base.getTime())) return '';
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}

function normalizeVendorInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  const criticality = input.criticality || 'medium';
  assertAllowed(status, VENDOR_STATUSES, 'vendor status');
  assertAllowed(criticality, CRITICALITY_LEVELS, 'vendor criticality');
  return {
    tenantId: input.tenantId,
    vendorCode: input.vendorCode || slugCode(input.name),
    name: input.name,
    status,
    criticality,
    owner: input.owner || '',
    contactName: input.contactName || '',
    contactEmail: input.contactEmail || '',
    servicesProvided: Array.isArray(input.servicesProvided) ? input.servicesProvided : [],
    dataAccess: Array.isArray(input.dataAccess) ? input.dataAccess : [],
    contractId: input.contractId || '',
    metadata: input.metadata || {}
  };
}

function normalizeAssessmentInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  const status = input.status || 'draft';
  assertAllowed(status, ASSESSMENT_STATUSES, 'assessment status');
  const startedAt = input.startedAt || new Date().toISOString();
  return {
    vendorId: input.vendorId,
    tenantId: input.tenantId || '',
    status,
    assessmentType: input.assessmentType || 'security',
    requestedBy: input.requestedBy || '',
    startedAt,
    dueAt: input.dueAt || addDays(startedAt, 30),
    completedAt: input.completedAt || '',
    score: Number(input.score || 0),
    summary: input.summary || '',
    metadata: input.metadata || {}
  };
}

function normalizeQuestionnaireResponseInput(input = {}) {
  if (!input.assessmentId) throw validationError('assessmentId is required');
  if (!input.questionKey) throw validationError('questionKey is required');
  return {
    assessmentId: input.assessmentId,
    questionKey: input.questionKey,
    questionText: input.questionText || '',
    answer: input.answer || '',
    answeredBy: input.answeredBy || '',
    answeredAt: input.answeredAt || new Date().toISOString(),
    evidenceUrl: input.evidenceUrl || '',
    riskPoints: Number(input.riskPoints || 0),
    metadata: input.metadata || {}
  };
}

function normalizeFindingInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  if (!input.title) throw validationError('title is required');
  const severity = input.severity || 'medium';
  const status = input.status || 'open';
  assertAllowed(severity, SEVERITIES, 'finding severity');
  assertAllowed(status, FINDING_STATUSES, 'finding status');
  return {
    vendorId: input.vendorId,
    assessmentId: input.assessmentId || '',
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    severity,
    status,
    dueAt: input.dueAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeRemediationTaskInput(input = {}) {
  if (!input.findingId) throw validationError('findingId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, TASK_STATUSES, 'remediation status');
  return {
    findingId: input.findingId,
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeExceptionInput(input = {}) {
  if (!input.findingId) throw validationError('findingId is required');
  if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'pending';
  assertAllowed(status, EXCEPTION_STATUSES, 'exception status');
  return {
    findingId: input.findingId,
    tenantId: input.tenantId || '',
    status,
    reason: input.reason,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    expiresAt: input.expiresAt || '',
    revokedAt: input.revokedAt || '',
    metadata: input.metadata || {}
  };
}

function criticalityScore(level) {
  return { low: 15, medium: 35, high: 70, critical: 90 }[level] ?? 35;
}

function severityScore(severity) {
  return { low: 20, medium: 45, high: 75, critical: 100 }[severity] ?? 45;
}

function calculateVendorRisk(vendor, findings = [], responses = []) {
  const openFindings = findings.filter(x => ['open', 'in_remediation'].includes(x.status));
  const findingScore = openFindings.reduce((max, x) => Math.max(max, severityScore(x.severity)), 0);
  const questionnaireRisk = responses.reduce((sum, x) => sum + Number(x.riskPoints || 0), 0);
  const score = Math.min(100, Math.round(criticalityScore(vendor.criticality) * 0.45 + findingScore * 0.4 + Math.min(100, questionnaireRisk) * 0.15));
  return {
    score,
    level: score >= 85 ? 'critical' : score >= 65 ? 'high' : score >= 35 ? 'medium' : 'low',
    openFindings: openFindings.length
  };
}

function completeAssessment(assessment, responses = [], findings = [], vendor = {}, at = new Date().toISOString()) {
  const risk = calculateVendorRisk(vendor, findings, responses);
  return { ...assessment, status: 'completed', completedAt: at, score: risk.score, summary: assessment.summary || `Risk level: ${risk.level}`, updatedAt: at };
}

function transitionFinding(finding, status, at = new Date().toISOString()) {
  assertAllowed(status, FINDING_STATUSES, 'finding status');
  const next = { ...finding, status, updatedAt: at };
  if (status === 'closed' && !next.closedAt) next.closedAt = at;
  return next;
}

function completeRemediation(task, at = new Date().toISOString()) {
  return { ...task, status: 'completed', completedAt: at, updatedAt: at };
}

function approveException(exceptionRecord, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...exceptionRecord, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}

function rejectException(exceptionRecord, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...exceptionRecord, status: 'rejected', approvedBy, approvedAt: at, updatedAt: at };
}

function isExceptionActive(exceptionRecord, asOf = new Date().toISOString()) {
  if (exceptionRecord.status !== 'approved') return false;
  if (!exceptionRecord.expiresAt) return true;
  return new Date(asOf).getTime() <= new Date(exceptionRecord.expiresAt).getTime();
}

function vendorMetrics(vendors = [], findings = []) {
  return {
    totalVendors: vendors.length,
    activeVendors: vendors.filter(x => x.status === 'active').length,
    criticalVendors: vendors.filter(x => x.criticality === 'critical').length,
    openFindings: findings.filter(x => ['open', 'in_remediation'].includes(x.status)).length,
    criticalFindings: findings.filter(x => x.severity === 'critical' && x.status !== 'closed').length
  };
}

module.exports = {
  VENDOR_STATUSES,
  CRITICALITY_LEVELS,
  ASSESSMENT_STATUSES,
  FINDING_STATUSES,
  SEVERITIES,
  TASK_STATUSES,
  EXCEPTION_STATUSES,
  slugCode,
  addDays,
  normalizeVendorInput,
  normalizeAssessmentInput,
  normalizeQuestionnaireResponseInput,
  normalizeFindingInput,
  normalizeRemediationTaskInput,
  normalizeExceptionInput,
  criticalityScore,
  severityScore,
  calculateVendorRisk,
  completeAssessment,
  transitionFinding,
  completeRemediation,
  approveException,
  rejectException,
  isExceptionActive,
  vendorMetrics
};
