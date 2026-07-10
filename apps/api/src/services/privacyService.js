const { validationError } = require('../errors/domainError');

const REQUEST_TYPES = ['access', 'export', 'rectification', 'erasure', 'restriction', 'objection'];
const REQUEST_STATUSES = ['submitted', 'verifying_identity', 'in_progress', 'waiting_approval', 'completed', 'rejected', 'cancelled'];
const CONSENT_STATUSES = ['granted', 'withdrawn', 'expired'];
const EXPORT_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const REDACTION_STATUSES = ['queued', 'in_progress', 'completed', 'failed', 'skipped'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'];
const AUDIT_EVENT_TYPES = ['submitted', 'identity_verified', 'export_started', 'export_completed', 'redaction_completed', 'erasure_approved', 'erasure_rejected', 'completed', 'rejected', 'cancelled'];

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

function normalizePrivacyRequestInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.subjectEmail) throw validationError('subjectEmail is required');
  const requestType = input.requestType || 'access';
  const status = input.status || 'submitted';
  assertAllowed(requestType, REQUEST_TYPES, 'privacy request type');
  assertAllowed(status, REQUEST_STATUSES, 'privacy request status');
  const submittedAt = input.submittedAt || new Date().toISOString();
  return {
    tenantId: input.tenantId,
    requestNumber: input.requestNumber || '',
    requestType,
    status,
    subjectName: input.subjectName || '',
    subjectEmail: input.subjectEmail,
    requesterEmail: input.requesterEmail || input.subjectEmail,
    identityVerifiedAt: input.identityVerifiedAt || '',
    submittedAt,
    dueAt: input.dueAt || addDays(submittedAt, 30),
    completedAt: input.completedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeConsentRecordInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.subjectEmail) throw validationError('subjectEmail is required');
  if (!input.purpose) throw validationError('purpose is required');
  const status = input.status || 'granted';
  assertAllowed(status, CONSENT_STATUSES, 'consent status');
  return {
    tenantId: input.tenantId,
    subjectEmail: input.subjectEmail,
    purpose: input.purpose,
    status,
    source: input.source || 'manual',
    grantedAt: input.grantedAt || (status === 'granted' ? new Date().toISOString() : ''),
    withdrawnAt: input.withdrawnAt || '',
    expiresAt: input.expiresAt || '',
    metadata: input.metadata || {}
  };
}

function normalizePrivacyExportJobInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  const status = input.status || 'queued';
  assertAllowed(status, EXPORT_STATUSES, 'privacy export status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    status,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    outputUrl: input.outputUrl || '',
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function normalizeRedactionTaskInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.targetType) throw validationError('targetType is required');
  if (!input.targetId) throw validationError('targetId is required');
  const status = input.status || 'queued';
  assertAllowed(status, REDACTION_STATUSES, 'redaction status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    targetType: input.targetType,
    targetId: input.targetId,
    status,
    fields: Array.isArray(input.fields) ? input.fields : [],
    redactedBy: input.redactedBy || '',
    redactedAt: input.redactedAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeErasureApprovalInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'erasure approval status');
  return {
    requestId: input.requestId,
    approverId: input.approverId,
    approverName: input.approverName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    metadata: input.metadata || {}
  };
}

function normalizePrivacyAuditInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.eventType) throw validationError('eventType is required');
  assertAllowed(input.eventType, AUDIT_EVENT_TYPES, 'privacy audit event type');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    eventType: input.eventType,
    actorId: input.actorId || '',
    actorName: input.actorName || '',
    message: input.message || '',
    occurredAt: input.occurredAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function verifyIdentity(request, at = new Date().toISOString()) {
  return { ...request, status: 'in_progress', identityVerifiedAt: at, updatedAt: at };
}

function startPrivacyExport(job, at = new Date().toISOString()) {
  return { ...job, status: 'running', startedAt: at, updatedAt: at };
}

function completePrivacyExport(job, outputUrl, at = new Date().toISOString()) {
  if (!outputUrl) throw validationError('outputUrl is required');
  return { ...job, status: 'completed', outputUrl, completedAt: at, updatedAt: at };
}

function failPrivacyExport(job, errorMessage, at = new Date().toISOString()) {
  return { ...job, status: 'failed', errorMessage: errorMessage || 'Export failed', completedAt: at, updatedAt: at };
}

function completeRedactionTask(task, redactedBy, at = new Date().toISOString()) {
  if (!redactedBy) throw validationError('redactedBy is required');
  return { ...task, status: 'completed', redactedBy, redactedAt: at, updatedAt: at };
}

function failRedactionTask(task, reason, at = new Date().toISOString()) {
  return { ...task, status: 'failed', failureReason: reason || 'Redaction failed', updatedAt: at };
}

function approveErasure(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectErasure(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function completePrivacyRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'completed', completedAt: at, updatedAt: at };
}

function rejectPrivacyRequest(request, reason, at = new Date().toISOString()) {
  return { ...request, status: 'rejected', rejectionReason: reason || 'Rejected', completedAt: at, updatedAt: at };
}

function withdrawConsent(consent, at = new Date().toISOString()) {
  return { ...consent, status: 'withdrawn', withdrawnAt: at, updatedAt: at };
}

function isOverdue(request, asOf = new Date().toISOString()) {
  if (!request.dueAt || ['completed', 'rejected', 'cancelled'].includes(request.status)) return false;
  return new Date(asOf).getTime() > new Date(request.dueAt).getTime();
}

module.exports = {
  REQUEST_TYPES,
  REQUEST_STATUSES,
  CONSENT_STATUSES,
  EXPORT_STATUSES,
  REDACTION_STATUSES,
  APPROVAL_STATUSES,
  AUDIT_EVENT_TYPES,
  slugCode,
  addDays,
  normalizePrivacyRequestInput,
  normalizeConsentRecordInput,
  normalizePrivacyExportJobInput,
  normalizeRedactionTaskInput,
  normalizeErasureApprovalInput,
  normalizePrivacyAuditInput,
  verifyIdentity,
  startPrivacyExport,
  completePrivacyExport,
  failPrivacyExport,
  completeRedactionTask,
  failRedactionTask,
  approveErasure,
  rejectErasure,
  completePrivacyRequest,
  rejectPrivacyRequest,
  withdrawConsent,
  isOverdue
};
