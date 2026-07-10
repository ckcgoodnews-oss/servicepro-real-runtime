const { validationError } = require('../errors/domainError');

const PLAN_STATUSES = ['draft', 'active', 'retired'];
const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'suspended', 'cancelled'];
const BILLING_INTERVALS = ['monthly', 'annual'];
const ENTITLEMENT_VALUE_TYPES = ['boolean', 'number', 'text'];
const USAGE_AGGREGATIONS = ['sum', 'max', 'last'];
const INVOICE_STATUSES = ['draft', 'open', 'paid', 'void', 'uncollectible'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizePlanInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  const status = input.status || 'active';
  const billingInterval = input.billingInterval || 'monthly';

  if (!PLAN_STATUSES.includes(status)) throw validationError(`Unsupported plan status: ${status}`);
  if (!BILLING_INTERVALS.includes(billingInterval)) throw validationError(`Unsupported billing interval: ${billingInterval}`);

  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    billingInterval,
    basePriceCents: Number(input.basePriceCents || 0),
    currency: input.currency || 'USD',
    trialDays: Number(input.trialDays || 0),
    metadata: input.metadata || {}
  };
}

function normalizePlanEntitlementInput(input = {}) {
  if (!input.planId) throw validationError('planId is required');
  if (!input.entitlementKey) throw validationError('entitlementKey is required');

  const valueType = input.valueType || 'boolean';
  if (!ENTITLEMENT_VALUE_TYPES.includes(valueType)) throw validationError(`Unsupported entitlement value type: ${valueType}`);

  return {
    planId: input.planId,
    entitlementKey: input.entitlementKey,
    valueType,
    value: input.value === undefined ? true : input.value,
    description: input.description || '',
    metadata: input.metadata || {}
  };
}

function normalizeTenantSubscriptionInput(input = {}) {
  if (!input.planId) throw validationError('planId is required');

  const status = input.status || 'active';
  if (!SUBSCRIPTION_STATUSES.includes(status)) throw validationError(`Unsupported subscription status: ${status}`);

  return {
    planId: input.planId,
    status,
    startedAt: input.startedAt || new Date().toISOString(),
    currentPeriodStart: input.currentPeriodStart || new Date().toISOString(),
    currentPeriodEnd: input.currentPeriodEnd || '',
    cancelledAt: input.cancelledAt || '',
    externalCustomerId: input.externalCustomerId || '',
    externalSubscriptionId: input.externalSubscriptionId || '',
    metadata: input.metadata || {}
  };
}

function normalizeUsageMeterInput(input = {}) {
  if (!input.meterKey) throw validationError('meterKey is required');

  const aggregation = input.aggregation || 'sum';
  if (!USAGE_AGGREGATIONS.includes(aggregation)) throw validationError(`Unsupported usage aggregation: ${aggregation}`);

  return {
    meterKey: input.meterKey,
    name: input.name || input.meterKey,
    description: input.description || '',
    unit: input.unit || 'count',
    aggregation,
    billable: input.billable === true,
    metadata: input.metadata || {}
  };
}

function normalizeUsageRecordInput(input = {}) {
  if (!input.meterKey) throw validationError('meterKey is required');

  return {
    subscriptionId: input.subscriptionId || '',
    meterKey: input.meterKey,
    quantity: Number(input.quantity || 0),
    sourceId: input.sourceId || '',
    sourceType: input.sourceType || '',
    recordedAt: input.recordedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeInvoiceInput(input = {}) {
  if (!input.subscriptionId) throw validationError('subscriptionId is required');

  const status = input.status || 'open';
  if (!INVOICE_STATUSES.includes(status)) throw validationError(`Unsupported invoice status: ${status}`);

  return {
    subscriptionId: input.subscriptionId,
    invoiceNumber: input.invoiceNumber || '',
    status,
    subtotalCents: Number(input.subtotalCents || 0),
    taxCents: Number(input.taxCents || 0),
    totalCents: Number(input.totalCents || 0),
    currency: input.currency || 'USD',
    issuedAt: input.issuedAt || new Date().toISOString(),
    dueAt: input.dueAt || '',
    paidAt: input.paidAt || '',
    lineItems: Array.isArray(input.lineItems) ? input.lineItems : [],
    metadata: input.metadata || {}
  };
}

function castEntitlementValue(entitlement) {
  if (!entitlement) return null;
  if (entitlement.valueType === 'number') return Number(entitlement.value || 0);
  if (entitlement.valueType === 'text') return String(entitlement.value || '');
  return entitlement.value === true || entitlement.value === 'true';
}

function evaluateEntitlement({ subscription, entitlements = [], entitlementKey, requestedQuantity = 1 }) {
  if (!subscription || !['trialing', 'active'].includes(subscription.status)) {
    return { allowed: false, reason: 'Subscription is not active', entitlementKey };
  }

  const entitlement = entitlements.find(x => x.entitlementKey === entitlementKey);
  if (!entitlement) {
    return { allowed: false, reason: 'Entitlement is not included in the current plan', entitlementKey };
  }

  const value = castEntitlementValue(entitlement);
  if (entitlement.valueType === 'boolean') {
    return {
      allowed: value === true,
      reason: value === true ? 'Boolean entitlement is enabled' : 'Boolean entitlement is disabled',
      entitlementKey,
      value
    };
  }

  if (entitlement.valueType === 'number') {
    const requested = Number(requestedQuantity || 0);
    return {
      allowed: requested <= value,
      reason: requested <= value ? 'Requested quantity is within entitlement limit' : 'Requested quantity exceeds entitlement limit',
      entitlementKey,
      value,
      requestedQuantity: requested
    };
  }

  return {
    allowed: Boolean(value),
    reason: 'Text entitlement is present',
    entitlementKey,
    value
  };
}

function aggregateUsage(records = [], meterKey, aggregation = 'sum') {
  const scoped = records.filter(x => x.meterKey === meterKey);
  if (scoped.length === 0) return 0;
  if (aggregation === 'max') return Math.max(...scoped.map(x => Number(x.quantity || 0)));
  if (aggregation === 'last') return Number(scoped[scoped.length - 1].quantity || 0);
  return scoped.reduce((sum, x) => sum + Number(x.quantity || 0), 0);
}

function buildInvoiceFromPlan({ subscription, plan, usage = [], meters = [], invoiceNumber = '' }) {
  if (!subscription) throw validationError('subscription is required');
  if (!plan) throw validationError('plan is required');

  const lineItems = [
    {
      description: `${plan.name} base subscription`,
      quantity: 1,
      unitAmountCents: Number(plan.basePriceCents || 0),
      amountCents: Number(plan.basePriceCents || 0)
    }
  ];

  for (const meter of meters.filter(x => x.billable)) {
    const quantity = aggregateUsage(usage, meter.meterKey, meter.aggregation);
    const unitAmountCents = Number((meter.metadata && meter.metadata.unitAmountCents) || 0);
    lineItems.push({
      description: meter.name,
      quantity,
      unitAmountCents,
      amountCents: quantity * unitAmountCents
    });
  }

  const subtotalCents = lineItems.reduce((sum, x) => sum + Number(x.amountCents || 0), 0);
  return normalizeInvoiceInput({
    subscriptionId: subscription.id || '',
    invoiceNumber,
    status: 'open',
    subtotalCents,
    taxCents: 0,
    totalCents: subtotalCents,
    currency: plan.currency,
    lineItems
  });
}

function markInvoicePaid(invoice, paidAt = new Date().toISOString()) {
  return { ...invoice, status: 'paid', paidAt, updatedAt: paidAt };
}

module.exports = {
  PLAN_STATUSES,
  SUBSCRIPTION_STATUSES,
  BILLING_INTERVALS,
  ENTITLEMENT_VALUE_TYPES,
  USAGE_AGGREGATIONS,
  INVOICE_STATUSES,
  slugCode,
  normalizePlanInput,
  normalizePlanEntitlementInput,
  normalizeTenantSubscriptionInput,
  normalizeUsageMeterInput,
  normalizeUsageRecordInput,
  normalizeInvoiceInput,
  castEntitlementValue,
  evaluateEntitlement,
  aggregateUsage,
  buildInvoiceFromPlan,
  markInvoicePaid
};
