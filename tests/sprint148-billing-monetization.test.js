const fs = require('fs');
const required = ['apps/api/src/services/billingMonetizationService.js','apps/api/src/repositories/billingMonetizationRepository.js','apps/api/src/routes/billingMonetization.js','scripts/seed-billing-monetization.js','packages/database/postgres/148_billing_monetization.sql','docs/sprint148-billing-monetization.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 148 patch file: ${file}`); process.exit(1); } }
const svc = require('../apps/api/src/services/billingMonetizationService');

let plan = svc.normalizePlanInput({ tenantId: 'tenant_demo', name: 'Professional', priceCents: 9900 });
if (plan.code !== 'PROFESSIONAL') process.exit(1);
plan = svc.activatePlan(plan);
if (plan.status !== 'active') process.exit(1);

const ent = svc.normalizeEntitlementInput({ planId: 'plan1', key: 'analytics.enabled', valueType: 'boolean', value: true });
let subscription = svc.normalizeSubscriptionInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1', planId: 'plan1' });
subscription = svc.activateSubscription(subscription);
if (!svc.subscriptionAllows(subscription, [ent], 'analytics.enabled')) process.exit(1);

let invoice = svc.openInvoice(svc.normalizeInvoiceInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1', subtotalCents: 10000, taxCents: 0 }));
let payment = svc.succeedPayment(svc.normalizePaymentInput({ tenantId: 'tenant_demo', invoiceId: 'inv1', amountCents: 10000 }), 'pay1');
invoice = svc.applyPaymentToInvoice(invoice, payment);
if (invoice.status !== 'paid' || invoice.balanceDueCents !== 0) process.exit(1);

let credit = svc.normalizeCreditInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1', amountCents: 500 });
credit = svc.applyCredit(credit, 'inv1', 500);
if (credit.status !== 'applied') process.exit(1);

let dunning = svc.resolveDunning(svc.sendDunning(svc.normalizeDunningInput({ tenantId: 'tenant_demo', invoiceId: 'inv1' }), 'reminder'));
if (dunning.status !== 'resolved') process.exit(1);

if (svc.failPayment(svc.normalizePaymentInput({ tenantId: 'tenant_demo', invoiceId: 'inv1' }), 'declined').status !== 'failed') process.exit(1);
if (svc.cancelSubscription(subscription, 'customer request').status !== 'cancelled') process.exit(1);

const metrics = svc.billingMetrics({ plans: [plan], subscriptions: [subscription, svc.markSubscriptionPastDue(subscription)], invoices: [invoice], payments: [payment], credits: [{...credit, status: 'available', remainingCents: 250}], dunning: [{...dunning, status: 'sent'}] });
if (metrics.activePlans !== 1 || metrics.activeSubscriptions !== 1 || metrics.pastDueSubscriptions !== 1 || metrics.paidInvoices !== 1 || metrics.succeededPayments !== 1 || metrics.availableCreditsCents !== 250 || metrics.activeDunningNotices !== 1 || metrics.revenueCollectedCents !== 10000) process.exit(1);
console.log('Sprint 148 billing monetization patch test passed.');
