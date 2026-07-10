const { validationError } = require('../errors/domainError');

const CASE_STATUSES = ['open', 'verification', 'in_progress', 'waiting', 'fulfilled', 'denied', 'cancelled'];
const TASK_STATUSES = ['pending', 'in_progress', 'blocked', 'completed', 'cancelled'];
const COMMUNICATION_TYPES = ['acknowledgement', 'verification_request', 'extension_notice', 'status_update', 'fulfillment', 'denial'];
const ESCALATION_LEVELS = ['warning', 'urgent', 'breach'];
const JURISDICTION_DAYS = { GDPR: 30, UK_GDPR: 30, CCPA: 45, CPRA: 45, VCDPA: 45, CPA: 45, CTDPA: 45, UCPA: 45, DEFAULT: 30 };

function assertAllowed(value, values, label) {
  if (!values.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}
function addDays(value, days) {
  const date = new Date(value || new Date().toISOString());
  if (Number.isNaN(date.getTime())) throw validationError('Invalid date');
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString();
}
function deadlineFor(jurisdiction, receivedAt, extensionDays = 0) {
  const key = String(jurisdiction || 'DEFAULT').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  return addDays(receivedAt, (JURISDICTION_DAYS[key] || JURISDICTION_DAYS.DEFAULT) + Number(extensionDays || 0));
}
function normalizeCaseInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.dsarId) throw validationError('dsarId is required');
  const status = input.status || 'open';
  assertAllowed(status, CASE_STATUSES, 'case status');
  const receivedAt = input.receivedAt || new Date().toISOString();
  const jurisdiction = input.jurisdiction || 'DEFAULT';
  return {
    tenantId: input.tenantId,
    dsarId: input.dsarId,
    status,
    jurisdiction,
    owner: input.owner || '',
    receivedAt,
    dueAt: input.dueAt || deadlineFor(jurisdiction, receivedAt),
    extensionDays: Number(input.extensionDays || 0),
    extensionReason: input.extensionReason || '',
    verificationStatus: input.verificationStatus || 'pending',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeTaskInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.caseId) throw validationError('caseId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'pending';
  assertAllowed(status, TASK_STATUSES, 'task status');
  return { tenantId: input.tenantId, caseId: input.caseId, name: input.name, status, assignee: input.assignee || '', dueAt: input.dueAt || '', completedAt: input.completedAt || '', evidence: input.evidence || {}, metadata: input.metadata || {} };
}
function normalizeCommunicationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.caseId) throw validationError('caseId is required');
  const type = input.type || 'status_update';
  assertAllowed(type, COMMUNICATION_TYPES, 'communication type');
  return { tenantId: input.tenantId, caseId: input.caseId, type, channel: input.channel || 'email', recipient: input.recipient || '', subject: input.subject || '', body: input.body || '', sentAt: input.sentAt || new Date().toISOString(), metadata: input.metadata || {} };
}
function recordVerification(caseRecord, evidence, at = new Date().toISOString()) {
  if (!evidence || typeof evidence !== 'object') throw validationError('verification evidence is required');
  return { ...caseRecord, status: 'in_progress', verificationStatus: 'verified', verifiedAt: at, verificationEvidence: evidence, updatedAt: at };
}
function extendDeadline(caseRecord, days, reason, at = new Date().toISOString()) {
  if (!Number.isInteger(Number(days)) || Number(days) <= 0) throw validationError('extension days must be positive');
  if (!reason) throw validationError('extension reason is required');
  const extensionDays = Number(caseRecord.extensionDays || 0) + Number(days);
  return { ...caseRecord, extensionDays, extensionReason: reason, dueAt: addDays(caseRecord.dueAt, days), updatedAt: at };
}
function completeTask(task, evidence = {}, at = new Date().toISOString()) {
  return { ...task, status: 'completed', evidence, completedAt: at, updatedAt: at };
}
function closeCase(caseRecord, outcome, at = new Date().toISOString()) {
  if (!['fulfilled', 'denied', 'cancelled'].includes(outcome)) throw validationError('invalid case outcome');
  return { ...caseRecord, status: outcome, closedAt: at, updatedAt: at };
}
function escalationFor(caseRecord, asOf = new Date().toISOString()) {
  if (['fulfilled', 'denied', 'cancelled'].includes(caseRecord.status)) return null;
  const remainingDays = Math.ceil((new Date(caseRecord.dueAt).getTime() - new Date(asOf).getTime()) / 86400000);
  if (remainingDays < 0) return { level: 'breach', remainingDays };
  if (remainingDays <= 2) return { level: 'urgent', remainingDays };
  if (remainingDays <= 7) return { level: 'warning', remainingDays };
  return null;
}
function orchestrationMetrics({ cases = [], tasks = [], communications = [] }, asOf = new Date().toISOString()) {
  const openCases = cases.filter(x => !['fulfilled', 'denied', 'cancelled'].includes(x.status));
  return {
    openCases: openCases.length,
    overdueCases: openCases.filter(x => escalationFor(x, asOf)?.level === 'breach').length,
    urgentCases: openCases.filter(x => escalationFor(x, asOf)?.level === 'urgent').length,
    pendingTasks: tasks.filter(x => ['pending', 'in_progress', 'blocked'].includes(x.status)).length,
    completedTasks: tasks.filter(x => x.status === 'completed').length,
    communicationsSent: communications.length,
    verifiedCases: cases.filter(x => x.verificationStatus === 'verified').length
  };
}

module.exports = { CASE_STATUSES, TASK_STATUSES, COMMUNICATION_TYPES, ESCALATION_LEVELS, JURISDICTION_DAYS, addDays, deadlineFor, normalizeCaseInput, normalizeTaskInput, normalizeCommunicationInput, recordVerification, extendDeadline, completeTask, closeCase, escalationFor, orchestrationMetrics };
