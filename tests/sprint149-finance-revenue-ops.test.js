const fs = require('fs');
const required = ['apps/api/src/services/financeRevenueOpsService.js','apps/api/src/repositories/financeRevenueOpsRepository.js','apps/api/src/routes/financeRevenueOps.js','scripts/seed-finance-revenue-ops.js','packages/database/postgres/149_finance_revenue_ops.sql','docs/sprint149-finance-revenue-ops.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 149 patch file: ${file}`); process.exit(1); } }
const svc = require('../apps/api/src/services/financeRevenueOpsService');

let period = svc.normalizePeriodInput({ tenantId: 'tenant_demo', name: 'July 2026' });
if (period.code !== 'JULY-2026') process.exit(1);
period = svc.closePeriod(svc.lockPeriod(period));
if (period.status !== 'closed') process.exit(1);

let schedule = svc.normalizeRevenueScheduleInput({ tenantId: 'tenant_demo', invoiceId: 'inv1', amountCents: 10000 });
schedule = svc.recognizeRevenue(svc.activateSchedule(schedule), 4000);
if (schedule.recognizedCents !== 4000 || schedule.deferredCents !== 6000) process.exit(1);

let tax = svc.validateTaxProfile(svc.normalizeTaxProfileInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1', taxRateBps: 700 }));
if (svc.calculateTaxCents(10000, tax) !== 700) process.exit(1);

let refund = svc.processRefund(svc.approveRefund(svc.normalizeRefundInput({ tenantId: 'tenant_demo', paymentId: 'pay1', amountCents: 1000 }), 'finance'), 'ref1');
if (refund.status !== 'processed') process.exit(1);

let payout = svc.payPayout(svc.approvePayout(svc.normalizePayoutInput({ tenantId: 'tenant_demo', amountCents: 9000 }), 'finance'));
if (payout.status !== 'paid') process.exit(1);

let debit = svc.postLedgerEntry(svc.normalizeLedgerEntryInput({ tenantId: 'tenant_demo', accountCode: 'CASH', entryType: 'debit', amountCents: 10000 }));
let credit = svc.postLedgerEntry(svc.normalizeLedgerEntryInput({ tenantId: 'tenant_demo', accountCode: 'REVENUE', entryType: 'credit', amountCents: 10000 }));
if (!svc.ledgerBalanced([debit, credit])) process.exit(1);

let recon = svc.completeReconciliation(svc.startReconciliation(svc.normalizeReconciliationInput({ tenantId: 'tenant_demo' })), 10000, 10000);
if (recon.status !== 'matched') process.exit(1);
if (svc.failReconciliation(svc.normalizeReconciliationInput({ tenantId: 'tenant_demo' }), 'bad').status !== 'failed') process.exit(1);

const metrics = svc.financeMetrics({ periods: [{...period, status: 'open'}], schedules: [schedule], refunds: [refund], payouts: [payout], ledger: [debit, credit], reconciliations: [{...recon, status: 'mismatch'}] });
if (metrics.openPeriods !== 1 || metrics.activeRevenueSchedules !== 1 || metrics.recognizedRevenueCents !== 4000 || metrics.deferredRevenueCents !== 6000 || metrics.processedRefundsCents !== 1000 || metrics.paidPayoutsCents !== 9000 || metrics.postedLedgerEntries !== 2 || metrics.mismatchedReconciliations !== 1) process.exit(1);
console.log('Sprint 149 finance revenue ops patch test passed.');
