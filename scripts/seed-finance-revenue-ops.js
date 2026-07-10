const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const customerTenantId = 'tenant_customer_demo';

  const period = await repos.financeRevenueOps.createPeriod({ tenantId, name: 'July 2026', startsAt: '2026-07-01', endsAt: '2026-07-31' });
  const schedule = await repos.financeRevenueOps.createRevenueSchedule({ tenantId, invoiceId: 'inv_demo_001', customerTenantId, amountCents: 9900, periodStart: '2026-07-01', periodEnd: '2026-07-31' });
  const activeSchedule = await repos.financeRevenueOps.activateSchedule(schedule.id);
  const recognized = await repos.financeRevenueOps.recognizeRevenue(schedule.id, 9900);

  const tax = await repos.financeRevenueOps.createTaxProfile({ tenantId, customerTenantId, country: 'US', region: 'IN', taxRateBps: 700 });
  const validTax = await repos.financeRevenueOps.validateTaxProfile(tax.id);

  const refund = await repos.financeRevenueOps.createRefund({ tenantId, paymentId: 'pay_demo_001', invoiceId: 'inv_demo_001', customerTenantId, amountCents: 1000, reason: 'Courtesy refund', requestedBy: 'billing' });
  const approvedRefund = await repos.financeRevenueOps.approveRefund(refund.id, 'finance');
  const processedRefund = await repos.financeRevenueOps.processRefund(refund.id, 'refund_demo_001');

  const payout = await repos.financeRevenueOps.createPayout({ tenantId, amountCents: 8900, paymentIds: ['pay_demo_001'] });
  const approvedPayout = await repos.financeRevenueOps.approvePayout(payout.id, 'finance');
  const paidPayout = await repos.financeRevenueOps.payPayout(payout.id);

  const debit = await repos.financeRevenueOps.createLedgerEntry({ tenantId, accountCode: 'CASH', entryType: 'debit', amountCents: 9900, sourceType: 'payment', sourceId: 'pay_demo_001' });
  const credit = await repos.financeRevenueOps.createLedgerEntry({ tenantId, accountCode: 'REVENUE', entryType: 'credit', amountCents: 9900, sourceType: 'invoice', sourceId: 'inv_demo_001' });
  const postedDebit = await repos.financeRevenueOps.postLedgerEntry(debit.id);
  const postedCredit = await repos.financeRevenueOps.postLedgerEntry(credit.id);

  const recon = await repos.financeRevenueOps.createReconciliation({ tenantId, name: 'July payment reconciliation' });
  const runningRecon = await repos.financeRevenueOps.startReconciliation(recon.id);
  const matchedRecon = await repos.financeRevenueOps.completeReconciliation(recon.id, 9900, 9900);

  const balanced = await repos.financeRevenueOps.ledgerBalanced(tenantId);
  const closedPeriod = await repos.financeRevenueOps.closePeriod(period.id);
  const metrics = await repos.financeRevenueOps.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, period: closedPeriod, schedule: recognized, activeSchedule, tax: validTax, refund: processedRefund, approvedRefund, payout: paidPayout, approvedPayout, ledger: [postedDebit, postedCredit], reconciliation: matchedRecon, runningRecon, balanced, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
