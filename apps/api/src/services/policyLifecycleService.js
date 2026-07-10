const { validationError } = require('../errors/domainError');

const POLICY_STATUSES = ['draft', 'active', 'retired', 'archived'];
const POLICY_TYPES = ['security', 'privacy', 'hr', 'compliance', 'operations', 'ai_governance', 'other'];
const VERSION_STATUSES = ['draft', 'in_review', 'approved', 'published', 'superseded', 'rejected'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'];
const ATTESTATION_STATUSES = ['assigned', 'acknowledged', 'overdue', 'waived', 'cancelled'];
const EXCEPTION_STATUSES = ['requested', 'approved', 'rejected', 'expired', 'revoked'];
const REVIEW_STATUSES = ['scheduled', 'completed', 'overdue', 'cancelled'];

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

function normalizePolicyInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  const policyType = input.policyType || 'other';
  assertAllowed(status, POLICY_STATUSES, 'policy status');
  assertAllowed(policyType, POLICY_TYPES, 'policy type');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.title),
    title: input.title,
    description: input.description || '',
    policyType,
    status,
    owner: input.owner || '',
    businessUnit: input.businessUnit || '',
    currentVersionId: input.currentVersionId || '',
    reviewFrequencyDays: Number(input.reviewFrequencyDays || 365),
    lastReviewedAt: input.lastReviewedAt || '',
    nextReviewAt: input.nextReviewAt || addDays(new Date().toISOString(), Number(input.reviewFrequencyDays || 365)),
    metadata: input.metadata || {}
  };
}

function normalizeVersionInput(input = {}) {
  if (!input.policyId) throw validationError('policyId is required');
  if (!input.version) throw validationError('version is required');
  const status = input.status || 'draft';
  assertAllowed(status, VERSION_STATUSES, 'policy version status');
  return {
    policyId: input.policyId,
    tenantId: input.tenantId || '',
    version: input.version,
    status,
    summary: input.summary || '',
    body: input.body || '',
    documentUrl: input.documentUrl || '',
    author: input.author || '',
    createdAt: input.createdAt || new Date().toISOString(),
    reviewedAt: input.reviewedAt || '',
    approvedAt: input.approvedAt || '',
    publishedAt: input.publishedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeApprovalInput(input = {}) {
  if (!input.policyVersionId) throw validationError('policyVersionId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'policy approval status');
  return {
    policyVersionId: input.policyVersionId,
    policyId: input.policyId || '',
    tenantId: input.tenantId || '',
    approverId: input.approverId,
    approverName: input.approverName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 30),
    metadata: input.metadata || {}
  };
}

function normalizeAttestationInput(input = {}) {
  if (!input.policyId) throw validationError('policyId is required');
  if (!input.policyVersionId) throw validationError('policyVersionId is required');
  if (!input.subjectId) throw validationError('subjectId is required');
  const status = input.status || 'assigned';
  assertAllowed(status, ATTESTATION_STATUSES, 'attestation status');
  const assignedAt = input.assignedAt || new Date().toISOString();
  return {
    policyId: input.policyId,
    policyVersionId: input.policyVersionId,
    tenantId: input.tenantId || '',
    subjectId: input.subjectId,
    subjectName: input.subjectName || '',
    subjectEmail: input.subjectEmail || '',
    status,
    assignedAt,
    dueAt: input.dueAt || addDays(assignedAt, 14),
    acknowledgedAt: input.acknowledgedAt || '',
    waiverReason: input.waiverReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeExceptionInput(input = {}) {
  if (!input.policyId) throw validationError('policyId is required');
  if (!input.requesterId) throw validationError('requesterId is required');
  if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'requested';
  assertAllowed(status, EXCEPTION_STATUSES, 'policy exception status');
  return {
    policyId: input.policyId,
    policyVersionId: input.policyVersionId || '',
    tenantId: input.tenantId || '',
    requesterId: input.requesterId,
    requesterName: input.requesterName || '',
    reason: input.reason,
    status,
    compensatingControls: input.compensatingControls || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    decidedBy: input.decidedBy || '',
    decidedAt: input.decidedAt || '',
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 90),
    revokedAt: input.revokedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeReviewInput(input = {}) {
  if (!input.policyId) throw validationError('policyId is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, REVIEW_STATUSES, 'policy review status');
  return {
    policyId: input.policyId,
    tenantId: input.tenantId || '',
    status,
    reviewerId: input.reviewerId || '',
    reviewerName: input.reviewerName || '',
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function submitVersion(version, at = new Date().toISOString()) {
  return { ...version, status: 'in_review', reviewedAt: at, updatedAt: at };
}

function approveVersion(version, at = new Date().toISOString()) {
  return { ...version, status: 'approved', approvedAt: at, updatedAt: at };
}

function rejectVersion(version, at = new Date().toISOString()) {
  return { ...version, status: 'rejected', updatedAt: at };
}

function publishVersion(version, at = new Date().toISOString()) {
  return { ...version, status: 'published', publishedAt: at, updatedAt: at };
}

function publishPolicy(policy, version, at = new Date().toISOString()) {
  return {
    ...policy,
    status: 'active',
    currentVersionId: version.id || policy.currentVersionId,
    lastReviewedAt: at,
    nextReviewAt: addDays(at, policy.reviewFrequencyDays || 365),
    updatedAt: at
  };
}

function approveGate(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectGate(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function acknowledgeAttestation(attestation, at = new Date().toISOString()) {
  return { ...attestation, status: 'acknowledged', acknowledgedAt: at, updatedAt: at };
}

function markAttestationOverdue(attestation, asOf = new Date().toISOString()) {
  if (attestation.status !== 'assigned') return attestation;
  if (attestation.dueAt && new Date(asOf).getTime() > new Date(attestation.dueAt).getTime()) {
    return { ...attestation, status: 'overdue', updatedAt: asOf };
  }
  return attestation;
}

function waiveAttestation(attestation, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...attestation, status: 'waived', waiverReason: reason, updatedAt: at };
}

function approveException(exception, decidedBy, at = new Date().toISOString()) {
  if (!decidedBy) throw validationError('decidedBy is required');
  return { ...exception, status: 'approved', decidedBy, decidedAt: at, updatedAt: at };
}

function rejectException(exception, decidedBy, at = new Date().toISOString()) {
  if (!decidedBy) throw validationError('decidedBy is required');
  return { ...exception, status: 'rejected', decidedBy, decidedAt: at, updatedAt: at };
}

function revokeException(exception, at = new Date().toISOString()) {
  return { ...exception, status: 'revoked', revokedAt: at, updatedAt: at };
}

function completeReview(review, notes = '', at = new Date().toISOString()) {
  return { ...review, status: 'completed', notes: notes || review.notes, completedAt: at, updatedAt: at };
}

function applyReviewToPolicy(policy, review, at = new Date().toISOString()) {
  return {
    ...policy,
    lastReviewedAt: review.completedAt || at,
    nextReviewAt: addDays(review.completedAt || at, policy.reviewFrequencyDays || 365),
    updatedAt: at
  };
}

function policyMetrics({ policies = [], versions = [], approvals = [], attestations = [], exceptions = [], reviews = [] }) {
  return {
    activePolicies: policies.filter(x => x.status === 'active').length,
    draftVersions: versions.filter(x => x.status === 'draft').length,
    pendingApprovals: approvals.filter(x => x.status === 'pending').length,
    overdueAttestations: attestations.filter(x => x.status === 'overdue').length,
    acknowledgedAttestations: attestations.filter(x => x.status === 'acknowledged').length,
    activeExceptions: exceptions.filter(x => x.status === 'approved').length,
    overdueReviews: reviews.filter(x => x.status === 'overdue').length
  };
}

module.exports = {
  POLICY_STATUSES,
  POLICY_TYPES,
  VERSION_STATUSES,
  APPROVAL_STATUSES,
  ATTESTATION_STATUSES,
  EXCEPTION_STATUSES,
  REVIEW_STATUSES,
  slugCode,
  addDays,
  normalizePolicyInput,
  normalizeVersionInput,
  normalizeApprovalInput,
  normalizeAttestationInput,
  normalizeExceptionInput,
  normalizeReviewInput,
  submitVersion,
  approveVersion,
  rejectVersion,
  publishVersion,
  publishPolicy,
  approveGate,
  rejectGate,
  acknowledgeAttestation,
  markAttestationOverdue,
  waiveAttestation,
  approveException,
  rejectException,
  revokeException,
  completeReview,
  applyReviewToPolicy,
  policyMetrics
};
