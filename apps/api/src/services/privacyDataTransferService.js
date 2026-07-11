const { validationError } = require('../errors/domainError');

const TRANSFER_STATUSES = ['draft', 'assessment', 'approved', 'active', 'suspended', 'terminated'];
const TRANSFER_MECHANISMS = ['adequacy', 'scc', 'bcr', 'derogation', 'localization', 'other'];
const ASSESSMENT_STATUSES = ['draft', 'in_review', 'approved', 'rejected', 'expired'];
const SAFEGUARD_STATUSES = ['draft', 'active', 'expired', 'revoked'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}
function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}
function normalizeTransfer(input = {}) {
  if (!input.tenantId || !input.name || !input.sourceCountry || !input.destinationCountry) {
    throw validationError('tenantId, name, sourceCountry, and destinationCountry are required');
  }
  const status = input.status || 'draft';
  const mechanism = input.mechanism || 'other';
  const riskLevel = input.riskLevel || 'medium';
  assertAllowed(status, TRANSFER_STATUSES, 'transfer status');
  assertAllowed(mechanism, TRANSFER_MECHANISMS, 'transfer mechanism');
  assertAllowed(riskLevel, RISK_LEVELS, 'risk level');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    sourceCountry: input.sourceCountry,
    destinationCountry: input.destinationCountry,
    exporter: input.exporter || '',
    importer: input.importer || '',
    processor: input.processor || '',
    dataCategories: Array.isArray(input.dataCategories) ? input.dataCategories : [],
    subjectCategories: Array.isArray(input.subjectCategories) ? input.subjectCategories : [],
    purpose: input.purpose || '',
    mechanism,
    riskLevel,
    owner: input.owner || '',
    approvedAt: input.approvedAt || '',
    activatedAt: input.activatedAt || '',
    nextReviewAt: input.nextReviewAt || addDays(new Date().toISOString(), 365),
    terminatedAt: input.terminatedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeAssessment(input = {}) {
  if (!input.tenantId || !input.transferId) throw validationError('tenantId and transferId are required');
  const status = input.status || 'draft';
  const riskLevel = input.riskLevel || 'medium';
  assertAllowed(status, ASSESSMENT_STATUSES, 'assessment status');
  assertAllowed(riskLevel, RISK_LEVELS, 'risk level');
  return {
    tenantId: input.tenantId,
    transferId: input.transferId,
    status,
    riskLevel,
    assessor: input.assessor || '',
    localLawSummary: input.localLawSummary || '',
    governmentAccessRisk: input.governmentAccessRisk || '',
    supplementaryMeasures: Array.isArray(input.supplementaryMeasures) ? input.supplementaryMeasures : [],
    conclusion: input.conclusion || '',
    submittedAt: input.submittedAt || '',
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 365),
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeSafeguard(input = {}) {
  if (!input.tenantId || !input.transferId || !input.name) throw validationError('tenantId, transferId, and name are required');
  const status = input.status || 'draft';
  assertAllowed(status, SAFEGUARD_STATUSES, 'safeguard status');
  return {
    tenantId: input.tenantId,
    transferId: input.transferId,
    name: input.name,
    safeguardType: input.safeguardType || 'contractual',
    status,
    documentUrl: input.documentUrl || '',
    version: input.version || '1.0',
    effectiveAt: input.effectiveAt || '',
    expiresAt: input.expiresAt || '',
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}
function normalizeApproval(input = {}) {
  if (!input.tenantId || !input.transferId || !input.approver) throw validationError('tenantId, transferId, and approver are required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'approval status');
  return {
    tenantId: input.tenantId,
    transferId: input.transferId,
    assessmentId: input.assessmentId || '',
    approver: input.approver,
    role: input.role || 'privacy',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    decidedAt: input.decidedAt || '',
    comments: input.comments || '',
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 30),
    metadata: input.metadata || {}
  };
}
function submitAssessment(row, assessor = '', at = new Date().toISOString()) {
  return { ...row, status: 'in_review', assessor: assessor || row.assessor, submittedAt: at, updatedAt: at };
}
function approveAssessment(row, reviewedBy, conclusion = '', at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...row, status: 'approved', reviewedBy, conclusion: conclusion || row.conclusion, reviewedAt: at, updatedAt: at };
}
function rejectAssessment(row, reviewedBy, reason, at = new Date().toISOString()) {
  if (!reviewedBy || !reason) throw validationError('reviewedBy and reason are required');
  return { ...row, status: 'rejected', reviewedBy, rejectionReason: reason, reviewedAt: at, updatedAt: at };
}
function activateSafeguard(row, at = new Date().toISOString()) {
  return { ...row, status: 'active', effectiveAt: row.effectiveAt || at, updatedAt: at };
}
function approveTransfer(row, at = new Date().toISOString()) {
  return { ...row, status: 'approved', approvedAt: at, updatedAt: at };
}
function activateTransfer(row, at = new Date().toISOString()) {
  return { ...row, status: 'active', activatedAt: at, updatedAt: at };
}
function suspendTransfer(row, reason = '', at = new Date().toISOString()) {
  return { ...row, status: 'suspended', suspensionReason: reason, updatedAt: at };
}
function terminateTransfer(row, reason = '', at = new Date().toISOString()) {
  return { ...row, status: 'terminated', terminationReason: reason, terminatedAt: at, updatedAt: at };
}
function approveApproval(row, comments = '', at = new Date().toISOString()) {
  return { ...row, status: 'approved', comments, decidedAt: at, updatedAt: at };
}
function rejectApproval(row, comments, at = new Date().toISOString()) {
  if (!comments) throw validationError('comments are required');
  return { ...row, status: 'rejected', comments, decidedAt: at, updatedAt: at };
}
function isExpired(row, asOf = new Date().toISOString()) {
  return Boolean(row.expiresAt && new Date(asOf).getTime() > new Date(row.expiresAt).getTime());
}
function transferReady({ transfer, assessments = [], safeguards = [], approvals = [] }) {
  if (!transfer) return false;
  const assessmentOk = assessments.some(x => x.transferId === transfer.id && x.status === 'approved' && !isExpired(x));
  const safeguardOk = transfer.mechanism === 'adequacy' || safeguards.some(x => x.transferId === transfer.id && x.status === 'active' && !isExpired(x));
  const approvalsOk = approvals.some(x => x.transferId === transfer.id && x.status === 'approved' && !isExpired(x));
  return assessmentOk && safeguardOk && approvalsOk;
}
function metrics({ transfers = [], assessments = [], safeguards = [], approvals = [] }) {
  const now = new Date().toISOString();
  return {
    activeTransfers: transfers.filter(x => x.status === 'active').length,
    suspendedTransfers: transfers.filter(x => x.status === 'suspended').length,
    highRiskTransfers: transfers.filter(x => ['high', 'critical'].includes(x.riskLevel) && !['terminated'].includes(x.status)).length,
    approvedAssessments: assessments.filter(x => x.status === 'approved' && !isExpired(x, now)).length,
    expiredAssessments: assessments.filter(x => isExpired(x, now)).length,
    activeSafeguards: safeguards.filter(x => x.status === 'active' && !isExpired(x, now)).length,
    pendingApprovals: approvals.filter(x => x.status === 'pending' && !isExpired(x, now)).length
  };
}
module.exports = {
  TRANSFER_STATUSES, TRANSFER_MECHANISMS, ASSESSMENT_STATUSES, SAFEGUARD_STATUSES,
  APPROVAL_STATUSES, RISK_LEVELS, normalizeTransfer, normalizeAssessment,
  normalizeSafeguard, normalizeApproval, submitAssessment, approveAssessment,
  rejectAssessment, activateSafeguard, approveTransfer, activateTransfer,
  suspendTransfer, terminateTransfer, approveApproval, rejectApproval, isExpired,
  transferReady, metrics
};
