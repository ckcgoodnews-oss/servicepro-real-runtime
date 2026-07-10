const fs = require('fs');

const required = [
  'apps/api/src/services/subscriptionService.js',
  'apps/api/src/repositories/subscriptionRepository.js',
  'apps/api/src/routes/subscription.js',
  'scripts/seed-subscription-entitlements.js',
  'packages/database/postgres/105_subscription_entitlement_runtime.sql',
  'docs/sprint105-subscription-entitlement-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 105 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePlanInput,
  normalizePlanEntitlementInput,
  normalizeTenantSubscriptionInput,
  normalizeUsageMeterInput,
  normalizeUsageRecordInput,
  evaluateEntitlement,
  aggregateUsage,
  buildInvoiceFromPlan,
  markInvoicePaid
} = require('../apps/api/src/services/subscriptionService');

const plan = { id: 'plan1', ...normalizePlanInput({ name: 'Enterprise', basePriceCents: 49900 }) };
if (plan.code !== 'ENTERPRISE' || plan.basePriceCents !== 49900) process.exit(1);

const entitlement = normalizePlanEntitlementInput({
  planId: 'plan1',
  entitlementKey: 'users.max',
  valueType: 'number',
  value: 100
});
if (entitlement.valueType !== 'number') process.exit(1);

const subscription = { id: 'sub1', tenantId: 'tenant_demo', ...normalizeTenantSubscriptionInput({ planId: 'plan1', status: 'active' }) };

const allowed = evaluateEntitlement({
  subscription,
  entitlements: [entitlement],
  entitlementKey: 'users.max',
  requestedQuantity: 50
});
if (!allowed.allowed) process.exit(1);

const denied = evaluateEntitlement({
  subscription,
  entitlements: [entitlement],
  entitlementKey: 'users.max',
  requestedQuantity: 150
});
if (denied.allowed) process.exit(1);

const meter = normalizeUsageMeterInput({
  meterKey: 'api.calls',
  aggregation: 'sum',
  billable: true,
  metadata: { unitAmountCents: 1 }
});

const usage = [
  normalizeUsageRecordInput({ meterKey: 'api.calls', quantity: 10 }),
  normalizeUsageRecordInput({ meterKey: 'api.calls', quantity: 15 })
];

if (aggregateUsage(usage, 'api.calls', 'sum') !== 25) process.exit(1);

const invoice = buildInvoiceFromPlan({
  subscription,
  plan,
  meters: [meter],
  usage,
  invoiceNumber: 'INV-1'
});
if (invoice.totalCents !== 49925) process.exit(1);

const paid = markInvoicePaid(invoice);
if (paid.status !== 'paid') process.exit(1);

console.log('Sprint 105 subscription entitlement runtime patch test passed.');
