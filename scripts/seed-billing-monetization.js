const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const customerTenantId = 'tenant_customer_demo';

  const plan = await repos.billingMonetization.createPlan({ tenantId, name: 'Professional', billingInterval: 'monthly', priceCents: 9900, trialDays: 14 });
  const activePlan = await repos.billingMonetization.activatePlan(plan.id);

  const entSite = await repos.billingMonetization.createEntitlement({ tenantId, planId: plan.id, key: 'sites.max', valueType: 'number', value: 5 });
  const entAnalytics = await repos.billingMonetization.createEntitlement({ tenantId, planId: plan.id, key: 'analytics.enabled', valueType: 'boolean', value: true });

  const subscription = await repos.billingMonetization.createSubscription({ tenantId, customerTenantId, planId: plan.id, status: 'trialing' });
  const activeSubscription = await repos.billingMonetization.activateSubscription(subscription.id);

  const invoice = await repos.billingMonetization.createInvoice({ tenantId, customerTenantId, subscriptionId: subscription.id, subtotalCents: 9900, taxCents: 0, lineItems: [{ description: 'Professional monthly subscription', amountCents: 9900 }] });
  const openInvoice = await repos.billingMonetization.openInvoice(invoice.id);

  const payment = await repos.billingMonetization.createPayment({ tenantId, invoiceId: invoice.id, customerTenantId, amountCents: 9900, provider: 'demo' });
  const paidPayment = await repos.billingMonetization.succeedPayment(payment.id, 'demo_payment_001');

  const credit = await repos.billingMonetization.createCredit({ tenantId, customerTenantId, amountCents: 1000, reason: 'Launch credit' });
  const dunning = await repos.billingMonetization.createDunning({ tenantId, invoiceId: invoice.id, customerTenantId, message: 'Your invoice is due.' });
  const sentDunning = await repos.billingMonetization.sendDunning(dunning.id, 'Invoice reminder sent.');
  const resolvedDunning = await repos.billingMonetization.resolveDunning(dunning.id);

  const entitlement = await repos.billingMonetization.checkEntitlement(customerTenantId, 'analytics.enabled');
  const metrics = await repos.billingMonetization.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, plan: activePlan, entitlements: [entSite, entAnalytics], subscription: activeSubscription, invoice: openInvoice, payment: paidPayment, credit, dunning: resolvedDunning, sentDunning, entitlement, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
