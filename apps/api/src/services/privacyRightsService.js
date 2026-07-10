const { validationError } = require('../errors/domainError');

const REQUEST_TYPES = ['access', 'delete', 'correct', 'export', 'restrict_processing', 'opt_out', 'other'];
const REQUEST_STATUSES = ['submitted', 'verifying_identity', 'in_progress', 'waiting_approval', 'approved', 'fulfilled', 'rejected', 'cancelled'];
const VERIFICATION_STATUSES = ['pending', 'verified', 'failed', 'expired'];
const SEARCH_TASK_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const PACKAGE_STATUSES = ['draft', 'ready', 'approved', 'delivered', 'rejected'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'];
const FULFILLMENT_STATUSES = ['queued', 'sent', 'failed', 'cancelled'];

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
    jurisdiction: input.jurisdiction || '',
    submittedAt,
    dueAt: input.dueAt || addDays(submittedAt, 30),
    fulfilledAt: input.fulfilledAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeIdentityVerificationInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  const status = input.status || 'pending';
  assertAllowed(status, VERIFICATION_STATUSES, 'identity verification status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    method: input.method || 'email_challenge',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    verifiedAt: input.verifiedAt || '',
    failedAt: input.failedAt || '',
    evidenceRef: input.evidenceRef || '',
    metadata: input.metadata || {}
  };
}

function normalizeSearchTaskInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.sourceSystem) throw validationError('sourceSystem is required');
  const status = input.status || 'queued';
  assertAllowed(status, SEARCH_TASK_STATUSES, 'search task status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    sourceSystem: input.sourceSystem,
    status,
    query: input.query || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    recordsFound: Number(input.recordsFound || 0),
    outputRef: input.outputRef || '',
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function normalizeResponsePackageInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  const status = input.status || 'draft';
  assertAllowed(status, PACKAGE_STATUSES, 'response package status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    status,
    preparedBy: input.preparedBy || '',
    preparedAt: input.preparedAt || '',
    packageUrl: input.packageUrl || '',
    redactions: Array.isArray(input.redactions) ? input.redactions : [],
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function normalizeApprovalInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'privacy approval status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    approverId: input.approverId,
    approverName: input.approverName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    metadata: input.metadata || {}
  };
}

function normalizeFulfillmentInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  const status = input.status || 'queued';
  assertAllowed(status, FULFILLMENT_STATUSES, 'privacy fulfillment status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    channel: input.channel || 'email',
    recipientEmail: input.recipientEmail || '',
    status,
    queuedAt: input.queuedAt || new Date().toISOString(),
    sentAt: input.sentAt || '',
    failedAt: input.failedAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function startVerification(request, at = new Date().toISOString()) {
  return { ...request, status: 'verifying_identity', updatedAt: at };
}

function verifyIdentity(verification, at = new Date().toISOString()) {
  return { ...verification, status: 'verified', verifiedAt: at, updatedAt: at };
}

function failIdentity(verification, at = new Date().toISOString()) {
  return { ...verification, status: 'failed', failedAt: at, updatedAt: at };
}

function startSearchTask(task, at = new Date().toISOString()) {
  return { ...task, status: 'running', startedAt: at, updatedAt: at };
}

function completeSearchTask(task, recordsFound = 0, outputRef = '', at = new Date().toISOString()) {
  return { ...task, status: 'completed', recordsFound: Number(recordsFound || 0), outputRef, completedAt: at, updatedAt: at };
}

function failSearchTask(task, errorMessage, at = new Date().toISOString()) {
  return { ...task, status: 'failed', errorMessage: errorMessage || 'Search task failed', completedAt: at, updatedAt: at };
}

function markPackageReady(pkg, packageUrl, preparedBy, at = new Date().toISOString()) {
  if (!packageUrl) throw validationError('packageUrl is required');
  return { ...pkg, status: 'ready', packageUrl, preparedBy: preparedBy || pkg.preparedBy, preparedAt: at, updatedAt: at };
}

function approvePackage(pkg, at = new Date().toISOString()) {
  return { ...pkg, status: 'approved', updatedAt: at };
}

function approveRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'approved', updatedAt: at };
}

function rejectRequest(request, reason = '', at = new Date().toISOString()) {
  return { ...request, status: 'rejected', rejectionReason: reason || 'Request rejected', updatedAt: at };
}

function approveReview(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectReview(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function sendFulfillment(fulfillment, at = new Date().toISOString()) {
  return { ...fulfillment, status: 'sent', sentAt: at, updatedAt: at };
}

function failFulfillment(fulfillment, reason = '', at = new Date().toISOString()) {
  return { ...fulfillment, status: 'failed', failureReason: reason || 'Fulfillment failed', failedAt: at, updatedAt: at };
}

function markFulfilled(request, at = new Date().toISOString()) {
  return { ...request, status: 'fulfilled', fulfilledAt: at, updatedAt: at };
}

function isOverdue(request, asOf = new Date().toISOString()) {
  return !['fulfilled', 'rejected', 'cancelled'].includes(request.status) && new Date(asOf).getTime() > new Date(request.dueAt).getTime();
}

function privacyMetrics({ requests = [], verifications = [], tasks = [], packages = [], approvals = [], fulfillments = [] }) {
  return {
    totalRequests: requests.length,
    openRequests: requests.filter(x => ['submitted', 'verifying_identity', 'in_progress', 'waiting_approval'].includes(x.status)).length,
    overdueRequests: requests.filter(x => isOverdue(x)).length,
    verifiedIdentities: verifications.filter(x => x.status === 'verified').length,
    completedSearchTasks: tasks.filter(x => x.status === 'completed').length,
    readyPackages: packages.filter(x => x.status === 'ready').length,
    pendingApprovals: approvals.filter(x => x.status === 'pending').length,
    sentFulfillments: fulfillments.filter(x => x.status === 'sent').length
  };
}

module.exports = {
  REQUEST_TYPES,
  REQUEST_STATUSES,
  VERIFICATION_STATUSES,
  SEARCH_TASK_STATUSES,
  PACKAGE_STATUSES,
  APPROVAL_STATUSES,
  FULFILLMENT_STATUSES,
  slugCode,
  addDays,
  normalizePrivacyRequestInput,
  normalizeIdentityVerificationInput,
  normalizeSearchTaskInput,
  normalizeResponsePackageInput,
  normalizeApprovalInput,
  normalizeFulfillmentInput,
  startVerification,
  verifyIdentity,
  failIdentity,
  startSearchTask,
  completeSearchTask,
  failSearchTask,
  markPackageReady,
  approvePackage,
  approveRequest,
  rejectRequest,
  approveReview,
  rejectReview,
  sendFulfillment,
  failFulfillment,
  markFulfilled,
  isOverdue,
  privacyMetrics
};
