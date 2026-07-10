const { validationError } = require('../errors/domainError');

const PAYROLL_EXPORT_STATUSES = ['draft', 'generated', 'approved', 'exported', 'void'];
const PAYROLL_EXPORT_FORMATS = ['json', 'csv', 'quickbooks', 'adp'];

function assertDate(dateString, fieldName) {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  if (!dateString || Number.isNaN(d.getTime())) throw validationError(`${fieldName} is invalid`);
  return dateString;
}

function isWithinPeriod(entry, startDate, endDate) {
  const day = String(entry.startedAt || '').slice(0, 10);
  return day >= startDate && day <= endDate;
}

function normalizePayrollPeriodInput(input = {}) {
  assertDate(input.startDate, 'startDate');
  assertDate(input.endDate, 'endDate');
  if (input.endDate < input.startDate) throw validationError('endDate cannot be before startDate');

  return {
    name: input.name || `${input.startDate} to ${input.endDate}`,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status || 'open',
    notes: input.notes || ''
  };
}

function aggregatePayrollEntries(entries = []) {
  const byTechnician = new Map();

  for (const entry of entries) {
    const technicianId = entry.technicianId || 'unknown';
    if (!byTechnician.has(technicianId)) {
      byTechnician.set(technicianId, {
        technicianId,
        entryCount: 0,
        regularMinutes: 0,
        billableMinutes: 0,
        laborCost: 0,
        entries: []
      });
    }

    const bucket = byTechnician.get(technicianId);
    const minutes = Number(entry.durationMinutes || 0);
    const cost = Number(entry.laborCost || 0);
    bucket.entryCount += 1;
    bucket.regularMinutes += minutes;
    bucket.billableMinutes += entry.billable === false ? 0 : minutes;
    bucket.laborCost += cost;
    bucket.entries.push(entry.id || '');
  }

  return Array.from(byTechnician.values()).map(row => ({
    ...row,
    regularHours: Math.round((row.regularMinutes / 60) * 100) / 100,
    billableHours: Math.round((row.billableMinutes / 60) * 100) / 100,
    laborCost: Math.round(row.laborCost * 100) / 100
  }));
}

function normalizePayrollExportInput(input = {}) {
  if (!input.periodId && (!input.startDate || !input.endDate)) {
    throw validationError('periodId or startDate/endDate is required');
  }

  const format = input.format || 'json';
  if (!PAYROLL_EXPORT_FORMATS.includes(format)) throw validationError(`Unsupported payroll export format: ${format}`);

  const status = input.status || 'draft';
  if (!PAYROLL_EXPORT_STATUSES.includes(status)) throw validationError(`Unsupported payroll export status: ${status}`);

  return {
    periodId: input.periodId || '',
    startDate: input.startDate || '',
    endDate: input.endDate || '',
    format,
    status,
    itemCount: Number(input.itemCount || 0),
    totalHours: Number(input.totalHours || 0),
    totalLaborCost: Number(input.totalLaborCost || 0),
    exportPayload: input.exportPayload || {},
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    exportedAt: input.exportedAt || '',
    notes: input.notes || ''
  };
}

function buildPayrollExportPayload({ period, entries = [], format = 'json' }) {
  const scoped = entries.filter(entry => isWithinPeriod(entry, period.startDate, period.endDate));
  const rows = aggregatePayrollEntries(scoped);
  const totalHours = Math.round(rows.reduce((sum, row) => sum + row.regularHours, 0) * 100) / 100;
  const totalLaborCost = Math.round(rows.reduce((sum, row) => sum + row.laborCost, 0) * 100) / 100;

  return {
    periodId: period.id || '',
    startDate: period.startDate,
    endDate: period.endDate,
    format,
    itemCount: rows.length,
    totalHours,
    totalLaborCost,
    rows
  };
}

function approvePayrollExport(batch, approvedBy, approvedAt = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return {
    ...batch,
    status: 'approved',
    approvedBy,
    approvedAt,
    updatedAt: approvedAt
  };
}

function markPayrollExported(batch, exportedAt = new Date().toISOString()) {
  return {
    ...batch,
    status: 'exported',
    exportedAt,
    updatedAt: exportedAt
  };
}

module.exports = {
  PAYROLL_EXPORT_STATUSES,
  PAYROLL_EXPORT_FORMATS,
  normalizePayrollPeriodInput,
  normalizePayrollExportInput,
  isWithinPeriod,
  aggregatePayrollEntries,
  buildPayrollExportPayload,
  approvePayrollExport,
  markPayrollExported
};
