const { validationError } = require('../errors/domainError');

const TIME_ENTRY_STATUSES = ['open', 'submitted', 'approved', 'rejected'];
const TIME_ENTRY_TYPES = ['labor', 'travel', 'meeting', 'admin', 'training'];

function minutesBetween(startedAt, endedAt) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  if (Number.isNaN(start.getTime())) throw validationError('startedAt is invalid');
  if (Number.isNaN(end.getTime())) throw validationError('endedAt is invalid');
  if (end < start) throw validationError('endedAt cannot be before startedAt');
  return Math.round((end - start) / 60000);
}

function normalizeTimeEntryInput(input = {}) {
  if (!input.technicianId) throw validationError('technicianId is required');
  if (!input.startedAt) throw validationError('startedAt is required');

  const entryType = input.entryType || 'labor';
  if (!TIME_ENTRY_TYPES.includes(entryType)) throw validationError(`Unsupported time entry type: ${entryType}`);

  const status = input.status || 'open';
  if (!TIME_ENTRY_STATUSES.includes(status)) throw validationError(`Unsupported time entry status: ${status}`);

  const endedAt = input.endedAt || '';
  const durationMinutes = endedAt
    ? minutesBetween(input.startedAt, endedAt)
    : Number(input.durationMinutes || 0);

  const hourlyRate = Number(input.hourlyRate || 0);
  const laborCost = Math.round((durationMinutes / 60) * hourlyRate * 100) / 100;

  return {
    technicianId: input.technicianId,
    userId: input.userId || '',
    jobId: input.jobId || '',
    appointmentId: input.appointmentId || '',
    entryType,
    status,
    startedAt: input.startedAt,
    endedAt,
    durationMinutes,
    hourlyRate,
    laborCost,
    billable: input.billable !== false,
    notes: input.notes || '',
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    metadata: input.metadata || {}
  };
}

function clockOutEntry(entry, endedAt = new Date().toISOString(), patch = {}) {
  if (!entry || entry.endedAt) throw validationError('Only an open time entry can be clocked out');
  const durationMinutes = minutesBetween(entry.startedAt, endedAt);
  const hourlyRate = Number(patch.hourlyRate !== undefined ? patch.hourlyRate : entry.hourlyRate || 0);
  return {
    ...entry,
    ...patch,
    endedAt,
    durationMinutes,
    hourlyRate,
    laborCost: Math.round((durationMinutes / 60) * hourlyRate * 100) / 100,
    updatedAt: new Date().toISOString()
  };
}

function approveEntry(entry, approvedBy, approvedAt = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return {
    ...entry,
    status: 'approved',
    approvedBy,
    approvedAt,
    updatedAt: approvedAt
  };
}

function summarizeLabor(entries = []) {
  const totals = entries.reduce((acc, entry) => {
    acc.durationMinutes += Number(entry.durationMinutes || 0);
    acc.laborCost += Number(entry.laborCost || 0);
    acc.billableMinutes += entry.billable === false ? 0 : Number(entry.durationMinutes || 0);
    return acc;
  }, { durationMinutes: 0, billableMinutes: 0, laborCost: 0 });

  return {
    entryCount: entries.length,
    durationMinutes: totals.durationMinutes,
    billableMinutes: totals.billableMinutes,
    hours: Math.round((totals.durationMinutes / 60) * 100) / 100,
    billableHours: Math.round((totals.billableMinutes / 60) * 100) / 100,
    laborCost: Math.round(totals.laborCost * 100) / 100
  };
}

module.exports = {
  TIME_ENTRY_STATUSES,
  TIME_ENTRY_TYPES,
  minutesBetween,
  normalizeTimeEntryInput,
  clockOutEntry,
  approveEntry,
  summarizeLabor
};
