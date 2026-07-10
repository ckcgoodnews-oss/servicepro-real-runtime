const { validationError } = require('../errors/domainError');

const PLAN_STATUSES = ['draft', 'active', 'retired'];
const BILLING_INTERVALS = ['monthly', 'annual'];
const ENTITLEMENT_VALUE_TYPES = ['boolean', 'number', 'string'];
const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired'];
const INVOICE_STATUSES = ['draft', 'open', 'paid', 'void', 'uncollectible'];
const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed', 'refunded'];
const CREDIT_STATUSES = ['available', 'applied', 'expired', 'void'];
const DUNNING_STATUSES = ['scheduled', 'sent', 'resolved', 'cancelled'];

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
function moneyCents(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) throw validationError('amount must be numeric');
  return Math.round(n);
}
function normalizePlanInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  const billingInterval = input.billingInterval || 'monthly';
  assertAllowed(status, PLAN_STATUSES, 'plan status');
  assertAllowed(billingInterval, BILLING_INTERVALS, 'billing interval');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    billingInterval,
    currency: input.currency || 'USD',
    priceCents: moneyCents(input.priceCents || 0),
    trialDays: Number(input.trialDays || 0),
    metadata: input.metadata || {}
  };
}
function normalizeEntitlementInput(input = {}) {
  if (!input.planId) throw validationError('planId is required');
  if (!input.key) throw validationError('key is required');
  const valueType = input.valueType || 'boolean';
  assertAllowed(valueType, ENTITLEMENT_VALUE_TYPES, 'entitlement value type');
  return {
    tenantId: input.tenantId || '',
    planId: input.planId,
    key: input.key,
    valueType,
    value: input.value === undefined ? true : input.value,
    description: input.description || '',
    metadata: input.metadata || {}
  };
}
function normalizeSubscriptionInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  if (!input.planId) throw validationError('planId is required');
  const status = input.status || 'trialing';
  assertAllowed(status, SUBSCRIPTION_STATUSES, 'subscription status');
  const startedAt = input.startedAt || new Date().toISOString();
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    planId: input.planId,
    status,
    startedAt,
    currentPeriodStart: input.currentPeriodStart || startedAt,
    currentPeriodEnd: input.currentPeriodEnd || addDays(startedAt, 30),
    cancelledAt: input.cancelledAt || '',
    cancelReason: input.cancelReason || '',
    paymentMethodRef: input.paymentMethodRef || '',
    metadata: input.metadata || {}
  };
}
function normalizeInvoiceInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  const status = input.status || 'draft';
  assertAllowed(status, INVOICE_STATUSES, 'invoice status');
  const subtotalCents = moneyCents(input.subtotalCents || 0);
  const taxCents = moneyCents(input.taxCents || 0);
  const discountCents = moneyCents(input.discountCents || 0);
  const totalCents = input.totalCents === undefined ? Math.max(0, subtotalCents + taxCents - discountCents) : moneyCents(input.totalCents);
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    subscriptionId: input.subscriptionId || '',
    invoiceNumber: input.invoiceNumber || '',
    status,
    currency: input.currency || 'USD',
    subtotalCents,
    taxCents,
    discountCents,
    totalCents,
    balanceDueCents: input.balanceDueCents === undefined ? totalCents : moneyCents(input.balanceDueCents),
    issuedAt: input.issuedAt || '',
    dueAt: input.dueAt || addDays(new Date().toISOString(), 15),
    paidAt: input.paidAt || '',
    lineItems: Array.isArray(input.lineItems) ? input.lineItems : [],
    metadata: input.metadata || {}
  };
}
function normalizePaymentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.invoiceId) throw validationError('invoiceId is required');
  const status = input.status || 'pending';
  assertAllowed(status, PAYMENT_STATUSES, 'payment status');
  return {
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    customerTenantId: input.customerTenantId || '',
    status,
    amountCents: moneyCents(input.amountCents || 0),
    currency: input.currency || 'USD',
    provider: input.provider || '',
    providerPaymentId: input.providerPaymentId || '',
    attemptedAt: input.attemptedAt || new Date().toISOString(),
    succeededAt: input.succeededAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeCreditInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  const status = input.status || 'available';
  assertAllowed(status, CREDIT_STATUSES, 'credit status');
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    invoiceId: input.invoiceId || '',
    status,
    amountCents: moneyCents(input.amountCents || 0),
    remainingCents: input.remainingCents === undefined ? moneyCents(input.amountCents || 0) : moneyCents(input.remainingCents),
    reason: input.reason || '',
    issuedAt: input.issuedAt || new Date().toISOString(),
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 365),
    appliedAt: input.appliedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeDunningInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.invoiceId) throw validationError('invoiceId is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, DUNNING_STATUSES, 'dunning status');
  return {
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    customerTenantId: input.customerTenantId || '',
    status,
    attemptNumber: Number(input.attemptNumber || 1),
    scheduledAt: input.scheduledAt || addDays(new Date().toISOString(), 1),
    sentAt: input.sentAt || '',
    resolvedAt: input.resolvedAt || '',
    message: input.message || '',
    metadata: input.metadata || {}
  };
}
function activatePlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'active', updatedAt: at };
}
function retirePlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'retired', updatedAt: at };
}
function activateSubscription(subscription, at = new Date().toISOString()) {
  return { ...subscription, status: 'active', updatedAt: at };
}
function markSubscriptionPastDue(subscription, at = new Date().toISOString()) {
  return { ...subscription, status: 'past_due', updatedAt: at };
}
function cancelSubscription(subscription, reason = '', at = new Date().toISOString()) {
  return { ...subscription, status: 'cancelled', cancelReason: reason, cancelledAt: at, updatedAt: at };
}
function openInvoice(invoice, at = new Date().toISOString()) {
  return { ...invoice, status: 'open', issuedAt: invoice.issuedAt || at, updatedAt: at };
}
function applyPaymentToInvoice(invoice, payment, at = new Date().toISOString()) {
  if (payment.status !== 'succeeded') return invoice;
  const balanceDueCents = Math.max(0, moneyCents(invoice.balanceDueCents) - moneyCents(payment.amountCents));
  return { ...invoice, balanceDueCents, status: balanceDueCents === 0 ? 'paid' : invoice.status, paidAt: balanceDueCents === 0 ? at : invoice.paidAt, updatedAt: at };
}
function succeedPayment(payment, providerPaymentId = '', at = new Date().toISOString()) {
  return { ...payment, status: 'succeeded', providerPaymentId: providerPaymentId || payment.providerPaymentId, succeededAt: at, updatedAt: at };
}
function failPayment(payment, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...payment, status: 'failed', failureReason: reason, updatedAt: at };
}
function applyCredit(credit, invoiceId, amountCents, at = new Date().toISOString()) {
  const amount = moneyCents(amountCents);
  if (amount > credit.remainingCents) throw validationError('credit amount exceeds remaining balance');
  const remainingCents = credit.remainingCents - amount;
  return { ...credit, invoiceId, remainingCents, status: remainingCents === 0 ? 'applied' : 'available', appliedAt: at, updatedAt: at };
}
function sendDunning(dunning, message = '', at = new Date().toISOString()) {
  return { ...dunning, status: 'sent', message: message || dunning.message, sentAt: at, updatedAt: at };
}
function resolveDunning(dunning, at = new Date().toISOString()) {
  return { ...dunning, status: 'resolved', resolvedAt: at, updatedAt: at };
}
function entitlementValue(entitlements = [], key) {
  const found = entitlements.find(x => x.key === key);
  return found ? found.value : null;
}
function hasEntitlement(entitlements = [], key) {
  return entitlementValue(entitlements, key) !== null;
}
function subscriptionAllows(subscription, entitlements = [], key) {
  if (!['trialing', 'active'].includes(subscription.status)) return false;
  return hasEntitlement(entitlements, key);
}
function billingMetrics({ plans = [], subscriptions = [], invoices = [], payments = [], credits = [], dunning = [] }) {
  return {
    activePlans: plans.filter(x => x.status === 'active').length,
    activeSubscriptions: subscriptions.filter(x => ['trialing', 'active'].includes(x.status)).length,
    pastDueSubscriptions: subscriptions.filter(x => x.status === 'past_due').length,
    openInvoices: invoices.filter(x => x.status === 'open').length,
    paidInvoices: invoices.filter(x => x.status === 'paid').length,
    succeededPayments: payments.filter(x => x.status === 'succeeded').length,
    availableCreditsCents: credits.filter(x => x.status === 'available').reduce((s, x) => s + Number(x.remainingCents || 0), 0),
    activeDunningNotices: dunning.filter(x => ['scheduled', 'sent'].includes(x.status)).length,
    revenueCollectedCents: payments.filter(x => x.status === 'succeeded').reduce((s, x) => s + Number(x.amountCents || 0), 0)
  };
}
module.exports = {
  PLAN_STATUSES, BILLING_INTERVALS, ENTITLEMENT_VALUE_TYPES, SUBSCRIPTION_STATUSES,
  INVOICE_STATUSES, PAYMENT_STATUSES, CREDIT_STATUSES, DUNNING_STATUSES, assertAllowed,
  slugCode, addDays, moneyCents, normalizePlanInput, normalizeEntitlementInput,
  normalizeSubscriptionInput, normalizeInvoiceInput, normalizePaymentInput, normalizeCreditInput,
  normalizeDunningInput, activatePlan, retirePlan, activateSubscription, markSubscriptionPastDue,
  cancelSubscription, openInvoice, applyPaymentToInvoice, succeedPayment, failPayment,
  applyCredit, sendDunning, resolveDunning, entitlementValue, hasEntitlement,
  subscriptionAllows, billingMetrics
};
