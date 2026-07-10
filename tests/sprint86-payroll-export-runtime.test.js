const fs = require('fs');

const required = [
  'apps/api/src/services/payrollService.js',
  'apps/api/src/repositories/payrollRepository.js',
  'apps/api/src/routes/payroll.js',
  'scripts/seed-payroll-export.js',
  'packages/database/postgres/086_payroll_export_runtime.sql',
  'docs/sprint86-payroll-export-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 86 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePayrollPeriodInput,
  aggregatePayrollEntries,
  buildPayrollExportPayload,
  approvePayrollExport,
  markPayrollExported,
  isWithinPeriod
} = require('../apps/api/src/services/payrollService');

const period = { id: 'period1', ...normalizePayrollPeriodInput({ startDate: '2026-07-06', endDate: '2026-07-12' }) };
if (period.name !== '2026-07-06 to 2026-07-12') {
  console.error('Payroll period normalization failed.');
  process.exit(1);
}

const entries = [
  { id: 't1', technicianId: 'tech1', startedAt: '2026-07-06T08:00:00.000Z', durationMinutes: 120, laborCost: 80, billable: true },
  { id: 't2', technicianId: 'tech1', startedAt: '2026-07-07T08:00:00.000Z', durationMinutes: 60, laborCost: 40, billable: false },
  { id: 't3', technicianId: 'tech2', startedAt: '2026-07-08T08:00:00.000Z', durationMinutes: 90, laborCost: 45, billable: true }
];

if (!isWithinPeriod(entries[0], period.startDate, period.endDate)) {
  console.error('Period filter failed.');
  process.exit(1);
}

const rows = aggregatePayrollEntries(entries);
if (rows.length !== 2 || rows[0].regularHours !== 3 || rows[0].billableHours !== 2) {
  console.error('Payroll aggregation failed.');
  process.exit(1);
}

const payload = buildPayrollExportPayload({ period, entries, format: 'json' });
if (payload.itemCount !== 2 || payload.totalHours !== 4.5 || payload.totalLaborCost !== 165) {
  console.error('Payroll export payload failed.');
  process.exit(1);
}

const approved = approvePayrollExport({ id: 'b1', status: 'generated' }, 'owner');
if (approved.status !== 'approved') {
  console.error('Payroll approval failed.');
  process.exit(1);
}

const exported = markPayrollExported(approved);
if (exported.status !== 'exported') {
  console.error('Payroll exported marker failed.');
  process.exit(1);
}

console.log('Sprint 86 payroll export runtime patch test passed.');
