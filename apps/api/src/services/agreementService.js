const { validationError } = require('../errors/domainError');

const PLAN_INTERVALS = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 };

function addMonths(dateString, months) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw validationError('Invalid agreement date');
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function calculateNextVisitDate(startDate, frequency, completedVisitCount = 0) {
  const interval = PLAN_INTERVALS[frequency];
  if (!interval) throw validationError(`Unsupported agreement frequency: ${frequency}`);
  return addMonths(startDate, interval * (Number(completedVisitCount || 0) + 1));
}

function calculateRenewalDate(startDate, termMonths = 12) {
  return addMonths(startDate, Number(termMonths || 12));
}

function agreementStatus(agreement, today = new Date().toISOString().slice(0, 10)) {
  if (agreement.status === 'cancelled') return 'cancelled';
  if (agreement.endDate && agreement.endDate < today) return 'expired';
  if (agreement.renewalDate && agreement.renewalDate <= today) return 'renewal_due';
  return agreement.status || 'active';
}

function normalizeAgreementInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.name) throw validationError('name is required');
  if (!input.startDate) throw validationError('startDate is required');
  const frequency = input.frequency || 'annual';
  if (!PLAN_INTERVALS[frequency]) throw validationError(`Unsupported frequency: ${frequency}`);
  const termMonths = Number(input.termMonths || 12);
  const endDate = input.endDate || calculateRenewalDate(input.startDate, termMonths);
  return {
    customerId: input.customerId,
    name: input.name,
    description: input.description || '',
    frequency,
    termMonths,
    startDate: input.startDate,
    endDate,
    renewalDate: input.renewalDate || endDate,
    visitCount: Number(input.visitCount || 1),
    price: Number(input.price || 0),
    status: input.status || 'active',
    notes: input.notes || ''
  };
}

module.exports = { PLAN_INTERVALS, addMonths, calculateNextVisitDate, calculateRenewalDate, agreementStatus, normalizeAgreementInput };
