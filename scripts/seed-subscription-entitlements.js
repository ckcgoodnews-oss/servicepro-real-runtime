const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const plan = await repos.subscription.createPlan({
    name: 'Enterprise',
    description: 'Enterprise white-label field service platform plan.',
    billingInterval: 'monthly',
    basePriceCents: 49900,
    currency: 'USD',
    trialDays: 14
  });

  const seats = await repos.subscription.createPlanEntitlement({
    planId: plan.id,
    entitlementKey: 'users.max',
    valueType: 'number',
    value: 250,
    description: 'Maximum active users'
  });

  const whitelabel = await repos.subscription.createPlanEntitlement({
    planId: plan.id,
    entitlementKey: 'white_label.enabled',
    valueType: 'boolean',
    value: true,
    description: 'White-label branding is enabled'
  });

  const subscription = await repos.subscription.createSubscription(tenantId, {
    planId: plan.id,
    status: 'active'
  });

  const meter = await repos.subscription.createMeter({
    meterKey: 'api.calls',
    name: 'API Calls',
    unit: 'call',
    aggregation: 'sum',
    billable: true,
    metadata: { unitAmountCents: 1 }
  });

  const usage = await repos.subscription.recordUsage(tenantId, {
    subscriptionId: subscription.id,
    meterKey: 'api.calls',
    quantity: 1250,
    sourceType: 'api'
  });

  const decision = await repos.subscription.evaluateEntitlement(tenantId, {
    entitlementKey: 'users.max',
    requestedQuantity: 100
  });

  const invoice = await repos.subscription.generateInvoice(tenantId, {
    subscriptionId: subscription.id,
    invoiceNumber: 'INV-105-0001'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, plan, seats, whitelabel, subscription, meter, usage, decision, invoice }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
