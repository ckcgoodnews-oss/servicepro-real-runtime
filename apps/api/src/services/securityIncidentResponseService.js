const { validationError } = require('../errors/domainError');

const INCIDENT_STATUSES = ['reported', 'triage', 'investigating', 'contained', 'eradicated', 'recovering', 'resolved', 'closed', 'false_positive'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const INCIDENT_TYPES = ['malware', 'phishing', 'credential_compromise', 'data_exfiltration', 'unauthorized_access', 'denial_of_service', 'insider_threat', 'policy_violation', 'other'];
const TASK_STATUSES = ['open', 'in_progress', 'completed', 'blocked', 'cancelled'];
const TASK_TYPES = ['triage', 'containment', 'eradication', 'recovery', 'forensics', 'legal', 'communications', 'other'];
const EVIDENCE_TYPES = ['log', 'screenshot', 'disk_image', 'packet_capture', 'edr_alert', 'siem_query', 'email', 'other'];
const COMM_STATUSES = ['draft', 'approved', 'sent', 'cancelled'];
const REVIEW_STATUSES = ['scheduled', 'completed', 'cancelled'];
const ACTION_STATUSES = ['open', 'in_progress', 'completed', 'accepted_risk', 'cancelled'];

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}
function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}
function normalizeIncidentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'reported';
  const severity = input.severity || 'medium';
  const incidentType = input.incidentType || 'other';
  assertAllowed(status, INCIDENT_STATUSES, 'incident status');
  assertAllowed(severity, SEVERITIES, 'incident severity');
  assertAllowed(incidentType, INCIDENT_TYPES, 'incident type');
  return {
    tenantId: input.tenantId, incidentNumber: input.incidentNumber || '', title: input.title,
    description: input.description || '', status, severity, incidentType, source: input.source || '',
    reportedBy: input.reportedBy || '', owner: input.owner || '',
    reportedAt: input.reportedAt || new Date().toISOString(),
    detectedAt: input.detectedAt || input.reportedAt || new Date().toISOString(),
    containedAt: input.containedAt || '', resolvedAt: input.resolvedAt || '', closedAt: input.closedAt || '',
    affectedAssetIds: Array.isArray(input.affectedAssetIds) ? input.affectedAssetIds : [],
    affectedUserIds: Array.isArray(input.affectedUserIds) ? input.affectedUserIds : [],
    relatedAlertIds: Array.isArray(input.relatedAlertIds) ? input.relatedAlertIds : [],
    relatedVulnerabilityIds: Array.isArray(input.relatedVulnerabilityIds) ? input.relatedVulnerabilityIds : [],
    businessImpact: input.businessImpact || '', metadata: input.metadata || {}
  };
}
function normalizeTaskInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const taskType = input.taskType || 'other';
  assertAllowed(status, TASK_STATUSES, 'task status');
  assertAllowed(taskType, TASK_TYPES, 'task type');
  return { incidentId: input.incidentId, tenantId: input.tenantId || '', title: input.title, description: input.description || '', taskType, status, owner: input.owner || '', dueAt: input.dueAt || '', completedAt: input.completedAt || '', metadata: input.metadata || {} };
}
function normalizeEvidenceInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.title) throw validationError('title is required');
  const evidenceType = input.evidenceType || 'other';
  assertAllowed(evidenceType, EVIDENCE_TYPES, 'evidence type');
  return { incidentId: input.incidentId, tenantId: input.tenantId || '', evidenceType, title: input.title, description: input.description || '', fileUrl: input.fileUrl || '', hash: input.hash || '', collectedBy: input.collectedBy || '', collectedAt: input.collectedAt || new Date().toISOString(), chainOfCustody: Array.isArray(input.chainOfCustody) ? input.chainOfCustody : [], metadata: input.metadata || {} };
}
function normalizeCommunicationInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.audience) throw validationError('audience is required');
  const status = input.status || 'draft';
  assertAllowed(status, COMM_STATUSES, 'communication status');
  return { incidentId: input.incidentId, tenantId: input.tenantId || '', audience: input.audience, channel: input.channel || 'email', subject: input.subject || '', body: input.body || '', status, approvedBy: input.approvedBy || '', approvedAt: input.approvedAt || '', sentAt: input.sentAt || '', metadata: input.metadata || {} };
}
function normalizeReviewInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, REVIEW_STATUSES, 'review status');
  return { incidentId: input.incidentId, tenantId: input.tenantId || '', status, facilitator: input.facilitator || '', scheduledAt: input.scheduledAt || addDays(new Date().toISOString(), 7), completedAt: input.completedAt || '', rootCause: input.rootCause || '', lessonsLearned: input.lessonsLearned || '', metadata: input.metadata || {} };
}
function normalizeActionInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, ACTION_STATUSES, 'corrective action status');
  assertAllowed(severity, SEVERITIES, 'corrective action severity');
  return { incidentId: input.incidentId, reviewId: input.reviewId || '', tenantId: input.tenantId || '', title: input.title, description: input.description || '', status, severity, owner: input.owner || '', dueAt: input.dueAt || '', completedAt: input.completedAt || '', acceptedReason: input.acceptedReason || '', metadata: input.metadata || {} };
}
function severityRank(severity) { return { low: 1, medium: 2, high: 3, critical: 4 }[severity] || 0; }
function deriveSeverity(input = {}) {
  const affectedAssets = Array.isArray(input.affectedAssetIds) ? input.affectedAssetIds.length : 0;
  const affectedUsers = Array.isArray(input.affectedUserIds) ? input.affectedUserIds.length : 0;
  const impact = String(input.businessImpact || '').toLowerCase();
  if (impact.includes('outage') || impact.includes('exfiltration') || affectedAssets >= 10 || affectedUsers >= 100) return 'critical';
  if (affectedAssets >= 3 || affectedUsers >= 10 || impact.includes('customer')) return 'high';
  if (affectedAssets > 0 || affectedUsers > 0) return 'medium';
  return 'low';
}
function transitionIncident(incident, status, at = new Date().toISOString()) {
  assertAllowed(status, INCIDENT_STATUSES, 'incident status');
  const next = { ...incident, status, updatedAt: at };
  if (status === 'contained' && !next.containedAt) next.containedAt = at;
  if (status === 'resolved' && !next.resolvedAt) next.resolvedAt = at;
  if (status === 'closed' && !next.closedAt) next.closedAt = at;
  return next;
}
function startInvestigation(incident, owner = '', at = new Date().toISOString()) { return { ...incident, status: 'investigating', owner: owner || incident.owner, updatedAt: at }; }
function completeTask(task, at = new Date().toISOString()) { return { ...task, status: 'completed', completedAt: at, updatedAt: at }; }
function blockTask(task, at = new Date().toISOString()) { return { ...task, status: 'blocked', updatedAt: at }; }
function approveCommunication(comm, approvedBy, at = new Date().toISOString()) { if (!approvedBy) throw validationError('approvedBy is required'); return { ...comm, status: 'approved', approvedBy, approvedAt: at, updatedAt: at }; }
function sendCommunication(comm, at = new Date().toISOString()) { return { ...comm, status: 'sent', sentAt: at, updatedAt: at }; }
function completeReview(review, rootCause = '', lessonsLearned = '', at = new Date().toISOString()) { return { ...review, status: 'completed', rootCause: rootCause || review.rootCause, lessonsLearned: lessonsLearned || review.lessonsLearned, completedAt: at, updatedAt: at }; }
function completeAction(action, at = new Date().toISOString()) { return { ...action, status: 'completed', completedAt: at, updatedAt: at }; }
function acceptActionRisk(action, reason, at = new Date().toISOString()) { if (!reason) throw validationError('reason is required'); return { ...action, status: 'accepted_risk', acceptedReason: reason, updatedAt: at }; }
function incidentMetrics({ incidents = [], tasks = [], evidence = [], communications = [], reviews = [], actions = [] }) {
  return { openIncidents: incidents.filter(x => !['closed', 'false_positive'].includes(x.status)).length, criticalIncidents: incidents.filter(x => x.severity === 'critical' && !['closed', 'false_positive'].includes(x.status)).length, openTasks: tasks.filter(x => ['open', 'in_progress', 'blocked'].includes(x.status)).length, evidenceItems: evidence.length, sentCommunications: communications.filter(x => x.status === 'sent').length, completedReviews: reviews.filter(x => x.status === 'completed').length, openActions: actions.filter(x => ['open', 'in_progress'].includes(x.status)).length };
}
module.exports = { INCIDENT_STATUSES, SEVERITIES, INCIDENT_TYPES, TASK_STATUSES, TASK_TYPES, EVIDENCE_TYPES, COMM_STATUSES, REVIEW_STATUSES, ACTION_STATUSES, addDays, normalizeIncidentInput, normalizeTaskInput, normalizeEvidenceInput, normalizeCommunicationInput, normalizeReviewInput, normalizeActionInput, severityRank, deriveSeverity, transitionIncident, startInvestigation, completeTask, blockTask, approveCommunication, sendCommunication, completeReview, completeAction, acceptActionRisk, incidentMetrics };
