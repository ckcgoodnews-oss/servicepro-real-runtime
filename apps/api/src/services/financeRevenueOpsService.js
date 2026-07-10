const { validationError } = require('../errors/domainError');

const PERIOD_STATUSES = ['open', 'locked', 'closed'];
const SCHEDULE_STATUSES = ['draft', 'active', 'recognized', 'cancelled'];
const TAX_PROFILE_STATUSES = ['active', 'inactive'];
const REFUND_STATUSES = ['requested', 'approved', 'processed', 'rejected', 'failed'];
const PAYOUT_STATUSES = ['draft', 'approved', 'processing', 'paid', 'failed', 'cancelled'];
const LEDGER_ENTRY_TYPES = ['debit', 'credit'];
const LEDGER_STATUSES = ['draft', 'posted', 'void'];
const RECON_STATUSES = ['queued', 'running', 'matched', 'mismatch', 'failed'];

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}
function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function moneyCents(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) throw validationError('amount must be numeric');
  return Math.round(n);
}
function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}
function normalizePeriodInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'open';
  assertAllowed(status, PERIOD_STATUSES, 'accounting period status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    status,
    startsAt: input.startsAt || '',
    endsAt: input.endsAt || '',
    lockedAt: input.lockedAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeRevenueScheduleInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.invoiceId) throw validationError('invoiceId is required');
  const status = input.status || 'draft';
  assertAllowed(status, SCHEDULE_STATUSES, 'revenue schedule status');
  const amountCents = moneyCents(input.amountCents || 0);
  const recognizedCents = moneyCents(input.recognizedCents || 0);
  return {
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    customerTenantId: input.customerTenantId || '',
    status,
    amountCents,
    recognizedCents,
    deferredCents: input.deferredCents === undefined ? Math.max(0, amountCents - recognizedCents) : moneyCents(input.deferredCents),
    periodStart: input.periodStart || '',
    periodEnd: input.periodEnd || '',
    recognitionMethod: input.recognitionMethod || 'straight_line',
    recognizedAt: input.recognizedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeTaxProfileInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  const status = input.status || 'active';
  assertAllowed(status, TAX_PROFILE_STATUSES, 'tax profile status');
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    status,
    country: input.country || 'US',
    region: input.region || '',
    taxId: input.taxId || '',
    taxExempt: input.taxExempt === true,
    taxRateBps: Number(input.taxRateBps || 0),
    validatedAt: input.validatedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeRefundInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.paymentId) throw validationError('paymentId is required');
  const status = input.status || 'requested';
  assertAllowed(status, REFUND_STATUSES, 'refund status');
  return {
    tenantId: input.tenantId,
    paymentId: input.paymentId,
    invoiceId: input.invoiceId || '',
    customerTenantId: input.customerTenantId || '',
    status,
    amountCents: moneyCents(input.amountCents || 0),
    reason: input.reason || '',
    requestedBy: input.requestedBy || '',
    approvedBy: input.approvedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    approvedAt: input.approvedAt || '',
    processedAt: input.processedAt || '',
    providerRefundId: input.providerRefundId || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function normalizePayoutInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  const status = input.status || 'draft';
  assertAllowed(status, PAYOUT_STATUSES, 'payout status');
  return {
    tenantId: input.tenantId,
    payoutNumber: input.payoutNumber || '',
    status,
    currency: input.currency || 'USD',
    amountCents: moneyCents(input.amountCents || 0),
    paymentIds: Array.isArray(input.paymentIds) ? input.paymentIds : [],
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    paidAt: input.paidAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeLedgerEntryInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.accountCode) throw validationError('accountCode is required');
  const entryType = input.entryType || 'debit';
  const status = input.status || 'draft';
  assertAllowed(entryType, LEDGER_ENTRY_TYPES, 'ledger entry type');
  assertAllowed(status, LEDGER_STATUSES, 'ledger entry status');
  return {
    tenantId: input.tenantId,
    accountCode: input.accountCode,
    entryType,
    status,
    amountCents: moneyCents(input.amountCents || 0),
    currency: input.currency || 'USD',
    sourceType: input.sourceType || '',
    sourceId: input.sourceId || '',
    memo: input.memo || '',
    postedAt: input.postedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeReconciliationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  const status = input.status || 'queued';
  assertAllowed(status, RECON_STATUSES, 'reconciliation status');
  return {
    tenantId: input.tenantId,
    name: input.name || 'Finance Reconciliation',
    status,
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    expectedCents: moneyCents(input.expectedCents || 0),
    actualCents: moneyCents(input.actualCents || 0),
    differenceCents: moneyCents(input.differenceCents || 0),
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function lockPeriod(period, at = new Date().toISOString()) {
  return { ...period, status: 'locked', lockedAt: at, updatedAt: at };
}
function closePeriod(period, at = new Date().toISOString()) {
  return { ...period, status: 'closed', closedAt: at, updatedAt: at };
}
function activateSchedule(schedule, at = new Date().toISOString()) {
  return { ...schedule, status: 'active', updatedAt: at };
}
function recognizeRevenue(schedule, amountCents, at = new Date().toISOString()) {
  const amount = moneyCents(amountCents);
  const recognizedCents = Math.min(schedule.amountCents, schedule.recognizedCents + amount);
  const deferredCents = Math.max(0, schedule.amountCents - recognizedCents);
  return { ...schedule, status: deferredCents === 0 ? 'recognized' : 'active', recognizedCents, deferredCents, recognizedAt: at, updatedAt: at };
}
function validateTaxProfile(profile, at = new Date().toISOString()) {
  return { ...profile, validatedAt: at, updatedAt: at };
}
function calculateTaxCents(amountCents, taxProfile) {
  if (taxProfile.taxExempt) return 0;
  return Math.round(moneyCents(amountCents) * Number(taxProfile.taxRateBps || 0) / 10000);
}
function approveRefund(refund, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...refund, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}
function processRefund(refund, providerRefundId = '', at = new Date().toISOString()) {
  return { ...refund, status: 'processed', providerRefundId: providerRefundId || refund.providerRefundId, processedAt: at, updatedAt: at };
}
function failRefund(refund, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...refund, status: 'failed', failureReason: reason, updatedAt: at };
}
function approvePayout(payout, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...payout, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}
function payPayout(payout, at = new Date().toISOString()) {
  return { ...payout, status: 'paid', paidAt: at, updatedAt: at };
}
function postLedgerEntry(entry, at = new Date().toISOString()) {
  return { ...entry, status: 'posted', postedAt: at, updatedAt: at };
}
function voidLedgerEntry(entry, at = new Date().toISOString()) {
  return { ...entry, status: 'void', updatedAt: at };
}
function startReconciliation(run, at = new Date().toISOString()) {
  return { ...run, status: 'running', startedAt: at, updatedAt: at };
}
function completeReconciliation(run, expectedCents, actualCents, at = new Date().toISOString()) {
  const expected = moneyCents(expectedCents);
  const actual = moneyCents(actualCents);
  const difference = actual - expected;
  return { ...run, status: difference === 0 ? 'matched' : 'mismatch', expectedCents: expected, actualCents: actual, differenceCents: difference, completedAt: at, updatedAt: at };
}
function failReconciliation(run, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...run, status: 'failed', failureReason: reason, completedAt: at, updatedAt: at };
}
function ledgerBalanced(entries = []) {
  const posted = entries.filter(x => x.status === 'posted');
  const debits = posted.filter(x => x.entryType === 'debit').reduce((s, x) => s + Number(x.amountCents || 0), 0);
  const credits = posted.filter(x => x.entryType === 'credit').reduce((s, x) => s + Number(x.amountCents || 0), 0);
  return debits === credits;
}
function financeMetrics({ periods = [], schedules = [], refunds = [], payouts = [], ledger = [], reconciliations = [] }) {
  return {
    openPeriods: periods.filter(x => x.status === 'open').length,
    activeRevenueSchedules: schedules.filter(x => x.status === 'active').length,
    recognizedRevenueCents: schedules.reduce((s, x) => s + Number(x.recognizedCents || 0), 0),
    deferredRevenueCents: schedules.reduce((s, x) => s + Number(x.deferredCents || 0), 0),
    processedRefundsCents: refunds.filter(x => x.status === 'processed').reduce((s, x) => s + Number(x.amountCents || 0), 0),
    paidPayoutsCents: payouts.filter(x => x.status === 'paid').reduce((s, x) => s + Number(x.amountCents || 0), 0),
    postedLedgerEntries: ledger.filter(x => x.status === 'posted').length,
    mismatchedReconciliations: reconciliations.filter(x => x.status === 'mismatch').length
  };
}
module.exports = {
  PERIOD_STATUSES, SCHEDULE_STATUSES, TAX_PROFILE_STATUSES, REFUND_STATUSES,
  PAYOUT_STATUSES, LEDGER_ENTRY_TYPES, LEDGER_STATUSES, RECON_STATUSES, assertAllowed,
  slugCode, moneyCents, addDays, normalizePeriodInput, normalizeRevenueScheduleInput,
  normalizeTaxProfileInput, normalizeRefundInput, normalizePayoutInput, normalizeLedgerEntryInput,
  normalizeReconciliationInput, lockPeriod, closePeriod, activateSchedule, recognizeRevenue,
  validateTaxProfile, calculateTaxCents, approveRefund, processRefund, failRefund,
  approvePayout, payPayout, postLedgerEntry, voidLedgerEntry, startReconciliation,
  completeReconciliation, failReconciliation, ledgerBalanced, financeMetrics
};
