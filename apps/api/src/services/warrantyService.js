const { validationError } = require('../errors/domainError');

const WARRANTY_COVERAGE_TYPES = ['labor', 'parts', 'labor_and_parts', 'manufacturer', 'none'];
const WARRANTY_CLAIM_STATUSES = ['draft', 'submitted', 'approved', 'denied', 'completed', 'void'];
const CALLBACK_STATUSES = ['open', 'scheduled', 'resolved', 'billable', 'void'];

function addDays(dateString, days) {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw validationError('Invalid date');
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

function normalizeWarrantyPolicyInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  const coverageType = input.coverageType || 'labor_and_parts';
  if (!WARRANTY_COVERAGE_TYPES.includes(coverageType)) {
    throw validationError(`Unsupported warranty coverage type: ${coverageType}`);
  }

  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    coverageType,
    durationDays: Number(input.durationDays || 30),
    laborCoveredPercent: Number(input.laborCoveredPercent ?? 100),
    partsCoveredPercent: Number(input.partsCoveredPercent ?? 100),
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeWarrantyClaimInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.originalJobId) throw validationError('originalJobId is required');
  if (!input.claimDate) throw validationError('claimDate is required');

  const status = input.status || 'draft';
  if (!WARRANTY_CLAIM_STATUSES.includes(status)) throw validationError(`Unsupported warranty claim status: ${status}`);

  return {
    customerId: input.customerId,
    originalJobId: input.originalJobId,
    callbackJobId: input.callbackJobId || '',
    policyId: input.policyId || '',
    claimDate: input.claimDate,
    status,
    problemSummary: input.problemSummary || '',
    diagnosis: input.diagnosis || '',
    covered: input.covered === true,
    deniedReason: input.deniedReason || '',
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    completedAt: input.completedAt || '',
    estimatedLaborCredit: Number(input.estimatedLaborCredit || 0),
    estimatedPartsCredit: Number(input.estimatedPartsCredit || 0),
    actualLaborCredit: Number(input.actualLaborCredit || 0),
    actualPartsCredit: Number(input.actualPartsCredit || 0),
    metadata: input.metadata || {}
  };
}

function normalizeCallbackInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.originalJobId) throw validationError('originalJobId is required');
  if (!input.reason) throw validationError('reason is required');

  const status = input.status || 'open';
  if (!CALLBACK_STATUSES.includes(status)) throw validationError(`Unsupported callback status: ${status}`);

  return {
    customerId: input.customerId,
    originalJobId: input.originalJobId,
    callbackJobId: input.callbackJobId || '',
    warrantyClaimId: input.warrantyClaimId || '',
    status,
    reason: input.reason,
    reportedAt: input.reportedAt || new Date().toISOString(),
    scheduledAt: input.scheduledAt || '',
    resolvedAt: input.resolvedAt || '',
    billable: input.billable === true,
    rootCause: input.rootCause || '',
    resolutionNotes: input.resolutionNotes || '',
    metadata: input.metadata || {}
  };
}

function evaluateWarrantyEligibility(policy, originalCompletionDate, claimDate) {
  if (!policy || policy.active === false) return { eligible: false, reason: 'No active warranty policy' };
  if (!originalCompletionDate) return { eligible: false, reason: 'Original completion date is missing' };
  if (!claimDate) return { eligible: false, reason: 'Claim date is missing' };

  const expiresOn = addDays(originalCompletionDate, Number(policy.durationDays || 0));
  const eligible = claimDate <= expiresOn;
  return {
    eligible,
    reason: eligible ? 'Within warranty period' : 'Warranty period expired',
    expiresOn,
    coverageType: policy.coverageType
  };
}

function approveClaim(claim, approvedBy, approvedAt = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return {
    ...claim,
    status: 'approved',
    covered: true,
    approvedBy,
    approvedAt,
    deniedReason: '',
    updatedAt: approvedAt
  };
}

function denyClaim(claim, deniedReason, deniedAt = new Date().toISOString()) {
  if (!deniedReason) throw validationError('deniedReason is required');
  return {
    ...claim,
    status: 'denied',
    covered: false,
    deniedReason,
    updatedAt: deniedAt
  };
}

function completeCallback(callback, resolutionNotes = '', resolvedAt = new Date().toISOString()) {
  return {
    ...callback,
    status: callback.billable ? 'billable' : 'resolved',
    resolvedAt,
    resolutionNotes: resolutionNotes || callback.resolutionNotes || '',
    updatedAt: resolvedAt
  };
}

module.exports = {
  WARRANTY_COVERAGE_TYPES,
  WARRANTY_CLAIM_STATUSES,
  CALLBACK_STATUSES,
  addDays,
  normalizeWarrantyPolicyInput,
  normalizeWarrantyClaimInput,
  normalizeCallbackInput,
  evaluateWarrantyEligibility,
  approveClaim,
  denyClaim,
  completeCallback
};
