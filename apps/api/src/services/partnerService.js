const { validationError } = require('../errors/domainError');

const PARTNER_TYPES = ['referral', 'reseller', 'implementation', 'technology'];
const PARTNER_STATUSES = ['pending', 'active', 'suspended', 'terminated'];
const REFERRAL_STATUSES = ['submitted', 'accepted', 'won', 'lost', 'expired'];
const COMMISSION_TYPES = ['percentage', 'fixed'];
const COMMISSION_STATUSES = ['pending', 'approved', 'paid', 'void'];
const PAYOUT_STATUSES = ['draft', 'approved', 'processing', 'paid', 'failed'];
const RELATIONSHIP_STATUSES = ['active', 'suspended', 'ended'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizePartnerAccountInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  const partnerType = input.partnerType || 'referral';
  const status = input.status || 'active';

  if (!PARTNER_TYPES.includes(partnerType)) throw validationError(`Unsupported partner type: ${partnerType}`);
  if (!PARTNER_STATUSES.includes(status)) throw validationError(`Unsupported partner status: ${status}`);

  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    partnerType,
    status,
    primaryContactName: input.primaryContactName || '',
    primaryContactEmail: input.primaryContactEmail || '',
    companyUrl: input.companyUrl || '',
    taxIdRef: input.taxIdRef || '',
    payoutMethodRef: input.payoutMethodRef || '',
    metadata: input.metadata || {}
  };
}

function normalizeResellerTenantInput(input = {}) {
  if (!input.partnerId) throw validationError('partnerId is required');
  if (!input.tenantId) throw validationError('tenantId is required');

  const status = input.status || 'active';
  if (!RELATIONSHIP_STATUSES.includes(status)) throw validationError(`Unsupported relationship status: ${status}`);

  return {
    partnerId: input.partnerId,
    tenantId: input.tenantId,
    status,
    assignedAt: input.assignedAt || new Date().toISOString(),
    endedAt: input.endedAt || '',
    accountManager: input.accountManager || '',
    metadata: input.metadata || {}
  };
}

function normalizeReferralInput(input = {}) {
  if (!input.partnerId) throw validationError('partnerId is required');
  if (!input.prospectName) throw validationError('prospectName is required');

  const status = input.status || 'submitted';
  if (!REFERRAL_STATUSES.includes(status)) throw validationError(`Unsupported referral status: ${status}`);

  return {
    partnerId: input.partnerId,
    prospectName: input.prospectName,
    prospectEmail: input.prospectEmail || '',
    prospectCompany: input.prospectCompany || '',
    status,
    submittedAt: input.submittedAt || new Date().toISOString(),
    acceptedAt: input.acceptedAt || '',
    closedAt: input.closedAt || '',
    wonTenantId: input.wonTenantId || '',
    estimatedValueCents: Number(input.estimatedValueCents || 0),
    metadata: input.metadata || {}
  };
}

function normalizeCommissionRuleInput(input = {}) {
  if (!input.partnerId) throw validationError('partnerId is required');
  if (!input.name) throw validationError('name is required');

  const commissionType = input.commissionType || 'percentage';
  if (!COMMISSION_TYPES.includes(commissionType)) throw validationError(`Unsupported commission type: ${commissionType}`);

  return {
    partnerId: input.partnerId,
    name: input.name,
    commissionType,
    percentageBps: Number(input.percentageBps || 0),
    fixedAmountCents: Number(input.fixedAmountCents || 0),
    appliesTo: input.appliesTo || 'subscription_revenue',
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeCommissionLedgerInput(input = {}) {
  if (!input.partnerId) throw validationError('partnerId is required');

  const status = input.status || 'pending';
  if (!COMMISSION_STATUSES.includes(status)) throw validationError(`Unsupported commission status: ${status}`);

  return {
    partnerId: input.partnerId,
    tenantId: input.tenantId || '',
    referralId: input.referralId || '',
    commissionRuleId: input.commissionRuleId || '',
    sourceType: input.sourceType || '',
    sourceId: input.sourceId || '',
    status,
    amountCents: Number(input.amountCents || 0),
    currency: input.currency || 'USD',
    earnedAt: input.earnedAt || new Date().toISOString(),
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    paidAt: input.paidAt || '',
    metadata: input.metadata || {}
  };
}

function normalizePayoutBatchInput(input = {}) {
  if (!input.partnerId) throw validationError('partnerId is required');

  const status = input.status || 'draft';
  if (!PAYOUT_STATUSES.includes(status)) throw validationError(`Unsupported payout status: ${status}`);

  return {
    partnerId: input.partnerId,
    status,
    currency: input.currency || 'USD',
    totalAmountCents: Number(input.totalAmountCents || 0),
    commissionLedgerIds: Array.isArray(input.commissionLedgerIds) ? input.commissionLedgerIds : [],
    createdBy: input.createdBy || '',
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    paidAt: input.paidAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function acceptReferral(referral, acceptedAt = new Date().toISOString()) {
  return { ...referral, status: 'accepted', acceptedAt, updatedAt: acceptedAt };
}

function markReferralWon(referral, tenantId, closedAt = new Date().toISOString()) {
  if (!tenantId) throw validationError('tenantId is required');
  return { ...referral, status: 'won', wonTenantId: tenantId, closedAt, updatedAt: closedAt };
}

function calculateCommission({ rule, baseAmountCents }) {
  if (!rule || rule.active === false) return 0;
  if (rule.commissionType === 'fixed') return Number(rule.fixedAmountCents || 0);
  return Math.round(Number(baseAmountCents || 0) * (Number(rule.percentageBps || 0) / 10000));
}

function approveCommission(entry, approvedBy, approvedAt = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...entry, status: 'approved', approvedBy, approvedAt, updatedAt: approvedAt };
}

function approvePayoutBatch(batch, approvedBy, approvedAt = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...batch, status: 'approved', approvedBy, approvedAt, updatedAt: approvedAt };
}

function markPayoutPaid(batch, paidAt = new Date().toISOString()) {
  return { ...batch, status: 'paid', paidAt, updatedAt: paidAt };
}

function summarizePartnerPerformance({ referrals = [], commissions = [], resellerTenants = [] }) {
  const won = referrals.filter(x => x.status === 'won').length;
  const approvedCommissions = commissions.filter(x => ['approved', 'paid'].includes(x.status));
  return {
    referralsSubmitted: referrals.length,
    referralsWon: won,
    activeResellerTenants: resellerTenants.filter(x => x.status === 'active').length,
    pendingCommissionCents: commissions.filter(x => x.status === 'pending').reduce((sum, x) => sum + Number(x.amountCents || 0), 0),
    approvedCommissionCents: approvedCommissions.reduce((sum, x) => sum + Number(x.amountCents || 0), 0),
    paidCommissionCents: commissions.filter(x => x.status === 'paid').reduce((sum, x) => sum + Number(x.amountCents || 0), 0)
  };
}

module.exports = {
  PARTNER_TYPES,
  PARTNER_STATUSES,
  REFERRAL_STATUSES,
  COMMISSION_TYPES,
  COMMISSION_STATUSES,
  PAYOUT_STATUSES,
  RELATIONSHIP_STATUSES,
  slugCode,
  normalizePartnerAccountInput,
  normalizeResellerTenantInput,
  normalizeReferralInput,
  normalizeCommissionRuleInput,
  normalizeCommissionLedgerInput,
  normalizePayoutBatchInput,
  acceptReferral,
  markReferralWon,
  calculateCommission,
  approveCommission,
  approvePayoutBatch,
  markPayoutPaid,
  summarizePartnerPerformance
};
