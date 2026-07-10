const { validationError } = require('../errors/domainError');

const INCIDENT_STATUSES = ['reported', 'triage', 'contained', 'assessing', 'notifying', 'resolved', 'closed', 'false_positive'];
const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const DATA_TYPES = ['contact', 'financial', 'credentials', 'health', 'government_id', 'children', 'special_category', 'other'];
const ASSESSMENT_STATUSES = ['draft', 'in_review', 'approved', 'rejected'];
const BREACH_DECISIONS = ['not_breach', 'breach_notification_required', 'breach_no_notification', 'escalate_to_counsel'];
const OBLIGATION_STATUSES = ['pending', 'in_progress', 'completed', 'waived', 'overdue'];
const NOTICE_TYPES = ['regulator', 'customer', 'data_subject', 'processor', 'insurance', 'internal'];
const NOTICE_STATUSES = ['draft', 'approved', 'sent', 'failed', 'cancelled'];
const EVIDENCE_TYPES = ['timeline', 'containment', 'forensics', 'legal_review', 'notification', 'other'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function addHours(dateText, hours) {
  const base = new Date(dateText || new Date().toISOString());
  if (Number.isNaN(base.getTime())) return '';
  base.setUTCHours(base.getUTCHours() + Number(hours || 0));
  return base.toISOString();
}

function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  if (Number.isNaN(base.getTime())) return '';
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}

function normalizeIncidentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'reported';
  const severity = input.severity || 'medium';
  assertAllowed(status, INCIDENT_STATUSES, 'privacy incident status');
  assertAllowed(severity, INCIDENT_SEVERITIES, 'privacy incident severity');
  return {
    tenantId: input.tenantId,
    incidentNumber: input.incidentNumber || '',
    title: input.title,
    description: input.description || '',
    status,
    severity,
    reportedBy: input.reportedBy || '',
    reportedAt: input.reportedAt || new Date().toISOString(),
    discoveredAt: input.discoveredAt || input.reportedAt || new Date().toISOString(),
    containedAt: input.containedAt || '',
    resolvedAt: input.resolvedAt || '',
    affectedSubjects: Number(input.affectedSubjects || 0),
    affectedDataTypes: Array.isArray(input.affectedDataTypes) ? input.affectedDataTypes : [],
    systems: Array.isArray(input.systems) ? input.systems : [],
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}

function normalizeAssessmentInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  const status = input.status || 'draft';
  const decision = input.decision || 'escalate_to_counsel';
  assertAllowed(status, ASSESSMENT_STATUSES, 'breach assessment status');
  assertAllowed(decision, BREACH_DECISIONS, 'breach decision');
  return {
    incidentId: input.incidentId,
    tenantId: input.tenantId || '',
    status,
    decision,
    assessor: input.assessor || '',
    assessedAt: input.assessedAt || '',
    riskOfHarm: input.riskOfHarm || 'unknown',
    encryptedData: input.encryptedData === true,
    containmentEffective: input.containmentEffective === true,
    summary: input.summary || '',
    legalBasis: input.legalBasis || '',
    metadata: input.metadata || {}
  };
}

function normalizeObligationInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.noticeType) throw validationError('noticeType is required');
  const status = input.status || 'pending';
  assertAllowed(input.noticeType, NOTICE_TYPES, 'notice type');
  assertAllowed(status, OBLIGATION_STATUSES, 'notification obligation status');
  return {
    incidentId: input.incidentId,
    tenantId: input.tenantId || '',
    noticeType: input.noticeType,
    jurisdiction: input.jurisdiction || '',
    recipient: input.recipient || '',
    status,
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    waivedReason: input.waivedReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeNoticeInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.noticeType) throw validationError('noticeType is required');
  const status = input.status || 'draft';
  assertAllowed(input.noticeType, NOTICE_TYPES, 'notice type');
  assertAllowed(status, NOTICE_STATUSES, 'notice status');
  return {
    incidentId: input.incidentId,
    obligationId: input.obligationId || '',
    tenantId: input.tenantId || '',
    noticeType: input.noticeType,
    recipient: input.recipient || '',
    subject: input.subject || '',
    body: input.body || '',
    status,
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    sentAt: input.sentAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeEvidenceInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.title) throw validationError('title is required');
  const evidenceType = input.evidenceType || 'other';
  assertAllowed(evidenceType, EVIDENCE_TYPES, 'evidence type');
  return {
    incidentId: input.incidentId,
    tenantId: input.tenantId || '',
    evidenceType,
    title: input.title,
    description: input.description || '',
    fileUrl: input.fileUrl || '',
    collectedBy: input.collectedBy || '',
    collectedAt: input.collectedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function transitionIncident(incident, status, at = new Date().toISOString()) {
  assertAllowed(status, INCIDENT_STATUSES, 'privacy incident status');
  const next = { ...incident, status, updatedAt: at };
  if (status === 'contained' && !next.containedAt) next.containedAt = at;
  if ((status === 'resolved' || status === 'closed') && !next.resolvedAt) next.resolvedAt = at;
  return next;
}

function assessBreachRisk(incident) {
  const sensitive = (incident.affectedDataTypes || []).some(x => ['credentials', 'health', 'government_id', 'children', 'special_category', 'financial'].includes(x));
  const count = Number(incident.affectedSubjects || 0);
  if (incident.severity === 'critical' || (sensitive && count > 0)) return 'high';
  if (incident.severity === 'high' || count >= 1000) return 'medium';
  return 'low';
}

function recommendDecision(incident, assessment = {}) {
  const risk = assessment.riskOfHarm && assessment.riskOfHarm !== 'unknown' ? assessment.riskOfHarm : assessBreachRisk(incident);
  if (assessment.encryptedData && assessment.containmentEffective && risk !== 'high') return 'breach_no_notification';
  if (risk === 'high' || incident.severity === 'critical') return 'breach_notification_required';
  if (risk === 'medium') return 'escalate_to_counsel';
  return 'not_breach';
}

function submitAssessment(assessment, assessor, at = new Date().toISOString()) {
  if (!assessor) throw validationError('assessor is required');
  return { ...assessment, status: 'in_review', assessor, assessedAt: at, updatedAt: at };
}

function approveAssessment(assessment, at = new Date().toISOString()) {
  return { ...assessment, status: 'approved', updatedAt: at };
}

function rejectAssessment(assessment, at = new Date().toISOString()) {
  return { ...assessment, status: 'rejected', updatedAt: at };
}

function regulatorDueAt(discoveredAt) {
  return addHours(discoveredAt, 72);
}

function subjectNoticeDueAt(discoveredAt) {
  return addDays(discoveredAt, 30);
}

function completeObligation(obligation, at = new Date().toISOString()) {
  return { ...obligation, status: 'completed', completedAt: at, updatedAt: at };
}

function waiveObligation(obligation, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...obligation, status: 'waived', waivedReason: reason, updatedAt: at };
}

function markObligationOverdue(obligation, asOf = new Date().toISOString()) {
  if (['completed', 'waived'].includes(obligation.status)) return obligation;
  if (obligation.dueAt && new Date(asOf).getTime() > new Date(obligation.dueAt).getTime()) {
    return { ...obligation, status: 'overdue', updatedAt: asOf };
  }
  return obligation;
}

function approveNotice(notice, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...notice, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}

function sendNotice(notice, at = new Date().toISOString()) {
  return { ...notice, status: 'sent', sentAt: at, updatedAt: at };
}

function failNotice(notice, reason = '', at = new Date().toISOString()) {
  return { ...notice, status: 'failed', failureReason: reason || 'Notice send failed', updatedAt: at };
}

function breachMetrics({ incidents = [], assessments = [], obligations = [], notices = [], evidence = [] }) {
  return {
    openIncidents: incidents.filter(x => !['closed', 'false_positive'].includes(x.status)).length,
    criticalIncidents: incidents.filter(x => x.severity === 'critical' && !['closed', 'false_positive'].includes(x.status)).length,
    approvedAssessments: assessments.filter(x => x.status === 'approved').length,
    pendingObligations: obligations.filter(x => ['pending', 'in_progress', 'overdue'].includes(x.status)).length,
    overdueObligations: obligations.filter(x => x.status === 'overdue').length,
    sentNotices: notices.filter(x => x.status === 'sent').length,
    evidenceItems: evidence.length
  };
}

module.exports = {
  INCIDENT_STATUSES,
  INCIDENT_SEVERITIES,
  DATA_TYPES,
  ASSESSMENT_STATUSES,
  BREACH_DECISIONS,
  OBLIGATION_STATUSES,
  NOTICE_TYPES,
  NOTICE_STATUSES,
  EVIDENCE_TYPES,
  slugCode,
  addHours,
  addDays,
  normalizeIncidentInput,
  normalizeAssessmentInput,
  normalizeObligationInput,
  normalizeNoticeInput,
  normalizeEvidenceInput,
  transitionIncident,
  assessBreachRisk,
  recommendDecision,
  submitAssessment,
  approveAssessment,
  rejectAssessment,
  regulatorDueAt,
  subjectNoticeDueAt,
  completeObligation,
  waiveObligation,
  markObligationOverdue,
  approveNotice,
  sendNotice,
  failNotice,
  breachMetrics
};
