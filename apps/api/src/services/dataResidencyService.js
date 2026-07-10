const { validationError } = require('../errors/domainError');

const POLICY_STATUSES = ['draft', 'active', 'retired'];
const REGION_TYPES = ['country', 'state', 'province', 'economic_area', 'cloud_region', 'custom'];
const ASSIGNMENT_STATUSES = ['active', 'pending_change', 'retired'];
const TRANSFER_STATUSES = ['requested', 'in_review', 'approved', 'rejected', 'completed', 'cancelled'];
const REQUIREMENT_STATUSES = ['active', 'satisfied', 'waived', 'retired'];
const VIOLATION_STATUSES = ['open', 'investigating', 'remediated', 'accepted_risk', 'closed'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'];

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
  if (!input.name) throw validationError('name is required');
  if (!input.allowedRegions || !Array.isArray(input.allowedRegions) || input.allowedRegions.length === 0) {
    throw validationError('allowedRegions must contain at least one region');
  }
  const status = input.status || 'active';
  assertAllowed(status, POLICY_STATUSES, 'residency policy status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    status,
    description: input.description || '',
    allowedRegions: input.allowedRegions,
    restrictedRegions: Array.isArray(input.restrictedRegions) ? input.restrictedRegions : [],
    dataCategories: Array.isArray(input.dataCategories) ? input.dataCategories : [],
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}

function normalizeRegionAssignmentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.regionCode) throw validationError('regionCode is required');
  const status = input.status || 'active';
  const regionType = input.regionType || 'cloud_region';
  assertAllowed(status, ASSIGNMENT_STATUSES, 'region assignment status');
  assertAllowed(regionType, REGION_TYPES, 'region type');
  return {
    tenantId: input.tenantId,
    customerId: input.customerId,
    customerName: input.customerName || '',
    policyId: input.policyId || '',
    regionCode: input.regionCode,
    regionName: input.regionName || input.regionCode,
    regionType,
    status,
    assignedBy: input.assignedBy || '',
    assignedAt: input.assignedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeTransferReviewInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.sourceRegion) throw validationError('sourceRegion is required');
  if (!input.targetRegion) throw validationError('targetRegion is required');
  const status = input.status || 'requested';
  assertAllowed(status, TRANSFER_STATUSES, 'transfer status');
  return {
    tenantId: input.tenantId,
    customerId: input.customerId,
    requestNumber: input.requestNumber || '',
    sourceRegion: input.sourceRegion,
    targetRegion: input.targetRegion,
    dataCategories: Array.isArray(input.dataCategories) ? input.dataCategories : [],
    status,
    businessReason: input.businessReason || '',
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    completedAt: input.completedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeRequirementInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.regionCode) throw validationError('regionCode is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'active';
  assertAllowed(status, REQUIREMENT_STATUSES, 'localization requirement status');
  return {
    tenantId: input.tenantId,
    regionCode: input.regionCode,
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    satisfiedAt: input.satisfiedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeViolationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, VIOLATION_STATUSES, 'violation status');
  return {
    tenantId: input.tenantId,
    customerId: input.customerId,
    policyId: input.policyId || '',
    title: input.title,
    description: input.description || '',
    status,
    detectedRegion: input.detectedRegion || '',
    expectedRegions: Array.isArray(input.expectedRegions) ? input.expectedRegions : [],
    detectedAt: input.detectedAt || new Date().toISOString(),
    owner: input.owner || '',
    remediatedAt: input.remediatedAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeApprovalInput(input = {}) {
  if (!input.transferReviewId) throw validationError('transferReviewId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'transfer approval status');
  return {
    transferReviewId: input.transferReviewId,
    tenantId: input.tenantId || '',
    approverId: input.approverId,
    approverName: input.approverName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 14),
    metadata: input.metadata || {}
  };
}

function isRegionAllowed(policy, regionCode) {
  if (!policy || !regionCode) return false;
  if ((policy.restrictedRegions || []).includes(regionCode)) return false;
  return (policy.allowedRegions || []).includes(regionCode);
}

function evaluateTransfer(policy, review) {
  const sourceAllowed = isRegionAllowed(policy, review.sourceRegion);
  const targetAllowed = isRegionAllowed(policy, review.targetRegion);
  return {
    allowed: sourceAllowed && targetAllowed,
    sourceAllowed,
    targetAllowed,
    reason: sourceAllowed && targetAllowed ? 'Transfer regions satisfy policy.' : 'Transfer violates allowed or restricted residency region rules.'
  };
}

function approveTransfer(review, reviewedBy, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...review, status: 'approved', reviewedBy, reviewedAt: at, updatedAt: at };
}

function rejectTransfer(review, reviewedBy, reason = '', at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...review, status: 'rejected', reviewedBy, reviewedAt: at, rejectionReason: reason || 'Transfer rejected', updatedAt: at };
}

function completeTransfer(review, at = new Date().toISOString()) {
  return { ...review, status: 'completed', completedAt: at, updatedAt: at };
}

function approveReviewApproval(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectReviewApproval(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function satisfyRequirement(requirement, at = new Date().toISOString()) {
  return { ...requirement, status: 'satisfied', satisfiedAt: at, updatedAt: at };
}

function remediateViolation(violation, at = new Date().toISOString()) {
  return { ...violation, status: 'remediated', remediatedAt: at, updatedAt: at };
}

function closeViolation(violation, at = new Date().toISOString()) {
  return { ...violation, status: 'closed', closedAt: at, updatedAt: at };
}

function residencyMetrics({ policies = [], assignments = [], transfers = [], requirements = [], violations = [] }) {
  return {
    activePolicies: policies.filter(x => x.status === 'active').length,
    activeAssignments: assignments.filter(x => x.status === 'active').length,
    pendingTransfers: transfers.filter(x => ['requested', 'in_review'].includes(x.status)).length,
    approvedTransfers: transfers.filter(x => x.status === 'approved').length,
    activeRequirements: requirements.filter(x => x.status === 'active').length,
    openViolations: violations.filter(x => ['open', 'investigating'].includes(x.status)).length
  };
}

module.exports = {
  POLICY_STATUSES,
  REGION_TYPES,
  ASSIGNMENT_STATUSES,
  TRANSFER_STATUSES,
  REQUIREMENT_STATUSES,
  VIOLATION_STATUSES,
  APPROVAL_STATUSES,
  slugCode,
  addDays,
  normalizePolicyInput,
  normalizeRegionAssignmentInput,
  normalizeTransferReviewInput,
  normalizeRequirementInput,
  normalizeViolationInput,
  normalizeApprovalInput,
  isRegionAllowed,
  evaluateTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  approveReviewApproval,
  rejectReviewApproval,
  satisfyRequirement,
  remediateViolation,
  closeViolation,
  residencyMetrics
};
