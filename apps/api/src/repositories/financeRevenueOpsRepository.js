const { makeId, now } = require('../services/id');
const svc = require('../services/financeRevenueOpsService');

function createFinanceRevenueOpsRepository(store) {
  if (store.type === 'json') return createJsonFinanceRevenueOpsRepository(store);
  if (store.type === 'postgres') return createPostgresFinanceRevenueOpsRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensureFinance(data) {
  data.financePeriods ||= [];
  data.financeRevenueSchedules ||= [];
  data.financeTaxProfiles ||= [];
  data.financeRefunds ||= [];
  data.financePayouts ||= [];
  data.financeLedgerEntries ||= [];
  data.financeReconciliations ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonFinanceRevenueOpsRepository(store) {
  return {
    createPeriod(input) { const data = ensureFinance(store.read()); const row = { id: makeId('finperiod'), ...svc.normalizePeriodInput(input), createdAt: now(), updatedAt: now() }; data.financePeriods.push(row); store.write(data); return row; },
    lockPeriod(id) { const data = ensureFinance(store.read()); const row = updateById(data.financePeriods, id, svc.lockPeriod); store.write(data); return row; },
    closePeriod(id) { const data = ensureFinance(store.read()); const row = updateById(data.financePeriods, id, svc.closePeriod); store.write(data); return row; },
    createRevenueSchedule(input) { const data = ensureFinance(store.read()); const row = { id: makeId('revsched'), ...svc.normalizeRevenueScheduleInput(input), createdAt: now(), updatedAt: now() }; data.financeRevenueSchedules.push(row); store.write(data); return row; },
    activateSchedule(id) { const data = ensureFinance(store.read()); const row = updateById(data.financeRevenueSchedules, id, svc.activateSchedule); store.write(data); return row; },
    recognizeRevenue(id, amountCents) { const data = ensureFinance(store.read()); const row = updateById(data.financeRevenueSchedules, id, x => svc.recognizeRevenue(x, amountCents)); store.write(data); return row; },
    createTaxProfile(input) { const data = ensureFinance(store.read()); const row = { id: makeId('tax'), ...svc.normalizeTaxProfileInput(input), createdAt: now(), updatedAt: now() }; data.financeTaxProfiles.push(row); store.write(data); return row; },
    validateTaxProfile(id) { const data = ensureFinance(store.read()); const row = updateById(data.financeTaxProfiles, id, svc.validateTaxProfile); store.write(data); return row; },
    createRefund(input) { const data = ensureFinance(store.read()); const row = { id: makeId('refund'), ...svc.normalizeRefundInput(input), createdAt: now(), updatedAt: now() }; data.financeRefunds.push(row); store.write(data); return row; },
    approveRefund(id, approvedBy) { const data = ensureFinance(store.read()); const row = updateById(data.financeRefunds, id, x => svc.approveRefund(x, approvedBy)); store.write(data); return row; },
    processRefund(id, providerRefundId = '') { const data = ensureFinance(store.read()); const row = updateById(data.financeRefunds, id, x => svc.processRefund(x, providerRefundId)); store.write(data); return row; },
    createPayout(input) { const data = ensureFinance(store.read()); const row = { id: makeId('payout'), ...svc.normalizePayoutInput(input), createdAt: now(), updatedAt: now() }; row.payoutNumber = row.payoutNumber || `PO-${String(data.financePayouts.length + 1).padStart(8, '0')}`; data.financePayouts.push(row); store.write(data); return row; },
    approvePayout(id, approvedBy) { const data = ensureFinance(store.read()); const row = updateById(data.financePayouts, id, x => svc.approvePayout(x, approvedBy)); store.write(data); return row; },
    payPayout(id) { const data = ensureFinance(store.read()); const row = updateById(data.financePayouts, id, svc.payPayout); store.write(data); return row; },
    createLedgerEntry(input) { const data = ensureFinance(store.read()); const row = { id: makeId('ledger'), ...svc.normalizeLedgerEntryInput(input), createdAt: now(), updatedAt: now() }; data.financeLedgerEntries.push(row); store.write(data); return row; },
    postLedgerEntry(id) { const data = ensureFinance(store.read()); const row = updateById(data.financeLedgerEntries, id, svc.postLedgerEntry); store.write(data); return row; },
    createReconciliation(input) { const data = ensureFinance(store.read()); const row = { id: makeId('recon'), ...svc.normalizeReconciliationInput(input), createdAt: now(), updatedAt: now() }; data.financeReconciliations.push(row); store.write(data); return row; },
    startReconciliation(id) { const data = ensureFinance(store.read()); const row = updateById(data.financeReconciliations, id, svc.startReconciliation); store.write(data); return row; },
    completeReconciliation(id, expectedCents, actualCents) { const data = ensureFinance(store.read()); const row = updateById(data.financeReconciliations, id, x => svc.completeReconciliation(x, expectedCents, actualCents)); store.write(data); return row; },
    ledgerBalanced(tenantId) { const data = ensureFinance(store.read()); return svc.ledgerBalanced(data.financeLedgerEntries.filter(x => !tenantId || x.tenantId === tenantId)); },
    metrics(tenantId) { const data = ensureFinance(store.read()); return svc.financeMetrics({ periods: data.financePeriods.filter(x => !tenantId || x.tenantId === tenantId), schedules: data.financeRevenueSchedules.filter(x => !tenantId || x.tenantId === tenantId), refunds: data.financeRefunds.filter(x => !tenantId || x.tenantId === tenantId), payouts: data.financePayouts.filter(x => !tenantId || x.tenantId === tenantId), ledger: data.financeLedgerEntries.filter(x => !tenantId || x.tenantId === tenantId), reconciliations: data.financeReconciliations.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresFinanceRevenueOpsRepository() {
  return {
    async createPeriod(input) { return { id: 'postgres-period-placeholder', ...svc.normalizePeriodInput(input) }; }, async lockPeriod() { return null; }, async closePeriod() { return null; },
    async createRevenueSchedule(input) { return { id: 'postgres-schedule-placeholder', ...svc.normalizeRevenueScheduleInput(input) }; }, async activateSchedule() { return null; }, async recognizeRevenue() { return null; },
    async createTaxProfile(input) { return { id: 'postgres-tax-placeholder', ...svc.normalizeTaxProfileInput(input) }; }, async validateTaxProfile() { return null; },
    async createRefund(input) { return { id: 'postgres-refund-placeholder', ...svc.normalizeRefundInput(input) }; }, async approveRefund() { return null; }, async processRefund() { return null; },
    async createPayout(input) { return { id: 'postgres-payout-placeholder', ...svc.normalizePayoutInput(input) }; }, async approvePayout() { return null; }, async payPayout() { return null; },
    async createLedgerEntry(input) { return { id: 'postgres-ledger-placeholder', ...svc.normalizeLedgerEntryInput(input) }; }, async postLedgerEntry() { return null; },
    async createReconciliation(input) { return { id: 'postgres-recon-placeholder', ...svc.normalizeReconciliationInput(input) }; }, async startReconciliation() { return null; }, async completeReconciliation() { return null; },
    async ledgerBalanced() { return false; }, async metrics() { return svc.financeMetrics({}); }
  };
}
module.exports = { createFinanceRevenueOpsRepository };
