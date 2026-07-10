const { makeId, now } = require('../services/id');
const svc = require('../services/billingMonetizationService');

function createBillingMonetizationRepository(store) {
  if (store.type === 'json') return createJsonBillingMonetizationRepository(store);
  if (store.type === 'postgres') return createPostgresBillingMonetizationRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureBilling(data) {
  data.billingPlans ||= [];
  data.billingEntitlements ||= [];
  data.billingSubscriptions ||= [];
  data.billingInvoices ||= [];
  data.billingPayments ||= [];
  data.billingCredits ||= [];
  data.billingDunning ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonBillingMonetizationRepository(store) {
  return {
    createPlan(input) { const data = ensureBilling(store.read()); const row = { id: makeId('plan'), ...svc.normalizePlanInput(input), createdAt: now(), updatedAt: now() }; data.billingPlans.push(row); store.write(data); return row; },
    activatePlan(id) { const data = ensureBilling(store.read()); const row = updateById(data.billingPlans, id, svc.activatePlan); store.write(data); return row; },
    retirePlan(id) { const data = ensureBilling(store.read()); const row = updateById(data.billingPlans, id, svc.retirePlan); store.write(data); return row; },
    createEntitlement(input) { const data = ensureBilling(store.read()); const row = { id: makeId('ent'), ...svc.normalizeEntitlementInput(input), createdAt: now(), updatedAt: now() }; data.billingEntitlements.push(row); store.write(data); return row; },
    listEntitlements(planId) { return ensureBilling(store.read()).billingEntitlements.filter(x => x.planId === planId); },
    createSubscription(input) { const data = ensureBilling(store.read()); const row = { id: makeId('sub'), ...svc.normalizeSubscriptionInput(input), createdAt: now(), updatedAt: now() }; data.billingSubscriptions.push(row); store.write(data); return row; },
    activateSubscription(id) { const data = ensureBilling(store.read()); const row = updateById(data.billingSubscriptions, id, svc.activateSubscription); store.write(data); return row; },
    markSubscriptionPastDue(id) { const data = ensureBilling(store.read()); const row = updateById(data.billingSubscriptions, id, svc.markSubscriptionPastDue); store.write(data); return row; },
    cancelSubscription(id, reason = '') { const data = ensureBilling(store.read()); const row = updateById(data.billingSubscriptions, id, x => svc.cancelSubscription(x, reason)); store.write(data); return row; },
    createInvoice(input) { const data = ensureBilling(store.read()); const row = { id: makeId('inv'), ...svc.normalizeInvoiceInput(input), createdAt: now(), updatedAt: now() }; row.invoiceNumber = row.invoiceNumber || `INV-${String(data.billingInvoices.length + 1).padStart(8, '0')}`; data.billingInvoices.push(row); store.write(data); return row; },
    openInvoice(id) { const data = ensureBilling(store.read()); const row = updateById(data.billingInvoices, id, svc.openInvoice); store.write(data); return row; },
    createPayment(input) { const data = ensureBilling(store.read()); const row = { id: makeId('pay'), ...svc.normalizePaymentInput(input), createdAt: now(), updatedAt: now() }; data.billingPayments.push(row); store.write(data); return row; },
    succeedPayment(id, providerPaymentId = '') { const data = ensureBilling(store.read()); const payment = updateById(data.billingPayments, id, x => svc.succeedPayment(x, providerPaymentId)); if (payment) updateById(data.billingInvoices, payment.invoiceId, x => svc.applyPaymentToInvoice(x, payment)); store.write(data); return payment; },
    failPayment(id, reason) { const data = ensureBilling(store.read()); const row = updateById(data.billingPayments, id, x => svc.failPayment(x, reason)); store.write(data); return row; },
    createCredit(input) { const data = ensureBilling(store.read()); const row = { id: makeId('credit'), ...svc.normalizeCreditInput(input), createdAt: now(), updatedAt: now() }; data.billingCredits.push(row); store.write(data); return row; },
    applyCredit(id, invoiceId, amountCents) { const data = ensureBilling(store.read()); const row = updateById(data.billingCredits, id, x => svc.applyCredit(x, invoiceId, amountCents)); if (row) updateById(data.billingInvoices, invoiceId, inv => ({ ...inv, balanceDueCents: Math.max(0, inv.balanceDueCents - Number(amountCents || 0)), updatedAt: now() })); store.write(data); return row; },
    createDunning(input) { const data = ensureBilling(store.read()); const row = { id: makeId('dun'), ...svc.normalizeDunningInput(input), createdAt: now(), updatedAt: now() }; data.billingDunning.push(row); store.write(data); return row; },
    sendDunning(id, message = '') { const data = ensureBilling(store.read()); const row = updateById(data.billingDunning, id, x => svc.sendDunning(x, message)); store.write(data); return row; },
    resolveDunning(id) { const data = ensureBilling(store.read()); const row = updateById(data.billingDunning, id, svc.resolveDunning); store.write(data); return row; },
    checkEntitlement(customerTenantId, key) {
      const data = ensureBilling(store.read());
      const sub = data.billingSubscriptions.find(x => x.customerTenantId === customerTenantId && ['trialing', 'active'].includes(x.status));
      if (!sub) return { allowed: false, value: null };
      const entitlements = data.billingEntitlements.filter(x => x.planId === sub.planId);
      return { allowed: svc.subscriptionAllows(sub, entitlements, key), value: svc.entitlementValue(entitlements, key), subscriptionId: sub.id };
    },
    metrics(tenantId) { const data = ensureBilling(store.read()); return svc.billingMetrics({ plans: data.billingPlans.filter(x => !tenantId || x.tenantId === tenantId), subscriptions: data.billingSubscriptions.filter(x => !tenantId || x.tenantId === tenantId), invoices: data.billingInvoices.filter(x => !tenantId || x.tenantId === tenantId), payments: data.billingPayments.filter(x => !tenantId || x.tenantId === tenantId), credits: data.billingCredits.filter(x => !tenantId || x.tenantId === tenantId), dunning: data.billingDunning.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresBillingMonetizationRepository() {
  return {
    async createPlan(input) { return { id: 'postgres-plan-placeholder', ...svc.normalizePlanInput(input) }; }, async activatePlan() { return null; }, async retirePlan() { return null; },
    async createEntitlement(input) { return { id: 'postgres-entitlement-placeholder', ...svc.normalizeEntitlementInput(input) }; }, async listEntitlements() { return []; },
    async createSubscription(input) { return { id: 'postgres-subscription-placeholder', ...svc.normalizeSubscriptionInput(input) }; }, async activateSubscription() { return null; }, async markSubscriptionPastDue() { return null; }, async cancelSubscription() { return null; },
    async createInvoice(input) { return { id: 'postgres-invoice-placeholder', ...svc.normalizeInvoiceInput(input) }; }, async openInvoice() { return null; },
    async createPayment(input) { return { id: 'postgres-payment-placeholder', ...svc.normalizePaymentInput(input) }; }, async succeedPayment() { return null; }, async failPayment() { return null; },
    async createCredit(input) { return { id: 'postgres-credit-placeholder', ...svc.normalizeCreditInput(input) }; }, async applyCredit() { return null; },
    async createDunning(input) { return { id: 'postgres-dunning-placeholder', ...svc.normalizeDunningInput(input) }; }, async sendDunning() { return null; }, async resolveDunning() { return null; },
    async checkEntitlement() { return { allowed: false, value: null }; }, async metrics() { return svc.billingMetrics({}); }
  };
}
module.exports = { createBillingMonetizationRepository };
