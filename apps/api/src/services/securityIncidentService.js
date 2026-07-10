const { validationError } = require('../errors/domainError');

const INCIDENT_STATUSES = ['new', 'triaged', 'contained', 'eradicated', 'recovering', 'resolved', 'closed', 'false_positive'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const INCIDENT_TYPES = ['unauthorized_access', 'malware', 'data_exposure', 'phishing', 'availability', 'policy_violation', 'vulnerability', 'other'];
const TASK_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];
const EVIDENCE_TYPES = ['log', 'screenshot', 'file', 'email', 'ticket', 'forensic_image', 'other'];
const NOTIFICATION_STATUSES = ['pending', 'sent', 'failed', 'cancelled'];
const POSTMORTEM_STATUSES = ['draft', 'in_review', 'approved', 'published'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function normalizeIncidentInput(input = {}) {
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'new';
  const severity = input.severity || 'medium';
  const incidentType = input.incidentType || 'other';
  assertAllowed(status, INCIDENT_STATUSES, 'incident status');
  assertAllowed(severity, SEVERITIES, 'incident severity');
  assertAllowed(incidentType, INCIDENT_TYPES, 'incident type');
  return {
    incidentNumber: input.incidentNumber || '',
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    severity,
    incidentType,
    detectedAt: input.detectedAt || new Date().toISOString(),
    reportedBy: input.reportedBy || '',
    owner: input.owner || '',
    affectedSystems: Array.isArray(input.affectedSystems) ? input.affectedSystems : [],
    affectedDataTypes: Array.isArray(input.affectedDataTypes) ? input.affectedDataTypes : [],
    containedAt: input.containedAt || '',
    resolvedAt: input.resolvedAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeContainmentTaskInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, TASK_STATUSES, 'containment task status');
  return {
    incidentId: input.incidentId,
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
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
    title: input.title,
    evidenceType,
    source: input.source || '',
    collectedBy: input.collectedBy || '',
    collectedAt: input.collectedAt || new Date().toISOString(),
    hash: input.hash || '',
    uri: input.uri || '',
    chainOfCustody: Array.isArray(input.chainOfCustody) ? input.chainOfCustody : [],
    metadata: input.metadata || {}
  };
}

function normalizeNotificationInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  if (!input.recipient) throw validationError('recipient is required');
  const status = input.status || 'pending';
  assertAllowed(status, NOTIFICATION_STATUSES, 'notification status');
  return {
    incidentId: input.incidentId,
    recipient: input.recipient,
    channel: input.channel || 'email',
    status,
    subject: input.subject || '',
    body: input.body || '',
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    sentAt: input.sentAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function normalizePostmortemInput(input = {}) {
  if (!input.incidentId) throw validationError('incidentId is required');
  const status = input.status || 'draft';
  assertAllowed(status, POSTMORTEM_STATUSES, 'postmortem status');
  return {
    incidentId: input.incidentId,
    status,
    summary: input.summary || '',
    rootCause: input.rootCause || '',
    impact: input.impact || '',
    timeline: Array.isArray(input.timeline) ? input.timeline : [],
    correctiveActions: Array.isArray(input.correctiveActions) ? input.correctiveActions : [],
    owner: input.owner || '',
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    publishedAt: input.publishedAt || '',
    metadata: input.metadata || {}
  };
}

function classifySeverity({ affectedSystems = [], affectedDataTypes = [], externalExposure = false, serviceDown = false } = {}) {
  if (externalExposure && affectedDataTypes.length > 0) return 'critical';
  if (serviceDown || affectedSystems.length >= 3) return 'high';
  if (affectedSystems.length > 0 || affectedDataTypes.length > 0) return 'medium';
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

function completeTask(task, at = new Date().toISOString()) {
  return { ...task, status: 'completed', completedAt: at, updatedAt: at };
}

function addCustodyEntry(evidence, actor, action, at = new Date().toISOString()) {
  if (!actor) throw validationError('actor is required');
  if (!action) throw validationError('action is required');
  return { ...evidence, chainOfCustody: [...(evidence.chainOfCustody || []), { actor, action, at }], updatedAt: at };
}

function sendNotification(notification, at = new Date().toISOString()) {
  return { ...notification, status: 'sent', sentAt: at, updatedAt: at };
}

function failNotification(notification, reason, at = new Date().toISOString()) {
  return { ...notification, status: 'failed', failureReason: reason || 'Notification failed', updatedAt: at };
}

function approvePostmortem(postmortem, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...postmortem, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}

function publishPostmortem(postmortem, at = new Date().toISOString()) {
  return { ...postmortem, status: 'published', publishedAt: at, updatedAt: at };
}

function incidentMetrics(incidents = []) {
  return {
    total: incidents.length,
    open: incidents.filter(x => !['closed', 'false_positive'].includes(x.status)).length,
    critical: incidents.filter(x => x.severity === 'critical').length,
    unresolved: incidents.filter(x => !['resolved', 'closed', 'false_positive'].includes(x.status)).length
  };
}

module.exports = {
  INCIDENT_STATUSES,
  SEVERITIES,
  INCIDENT_TYPES,
  TASK_STATUSES,
  EVIDENCE_TYPES,
  NOTIFICATION_STATUSES,
  POSTMORTEM_STATUSES,
  slugCode,
  normalizeIncidentInput,
  normalizeContainmentTaskInput,
  normalizeEvidenceInput,
  normalizeNotificationInput,
  normalizePostmortemInput,
  classifySeverity,
  transitionIncident,
  completeTask,
  addCustodyEntry,
  sendNotification,
  failNotification,
  approvePostmortem,
  publishPostmortem,
  incidentMetrics
};
