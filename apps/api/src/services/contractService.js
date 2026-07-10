const { validationError } = require('../errors/domainError');

const CONTRACT_STATUSES = ['draft', 'pending_signature', 'active', 'expired', 'terminated', 'cancelled'];
const ORDER_FORM_STATUSES = ['draft', 'pending_signature', 'active', 'expired', 'cancelled'];
const TERM_TYPES = ['payment', 'termination', 'liability', 'privacy', 'security', 'support', 'custom'];
const AMENDMENT_STATUSES = ['draft', 'pending_signature', 'executed', 'void'];
const OBLIGATION_STATUSES = ['open', 'in_progress', 'fulfilled', 'waived', 'breached'];
const RENEWAL_TYPES = ['manual', 'auto_renew', 'non_renewing'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeAgreementInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  const renewalType = input.renewalType || 'manual';
  if (!CONTRACT_STATUSES.includes(status)) throw validationError(`Unsupported contract status: ${status}`);
  if (!RENEWAL_TYPES.includes(renewalType)) throw validationError(`Unsupported renewal type: ${renewalType}`);
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    status,
    counterpartyName: input.counterpartyName || '',
    owner: input.owner || '',
    effectiveDate: input.effectiveDate || '',
    startDate: input.startDate || '',
    endDate: input.endDate || '',
    renewalType,
    noticeDays: Number(input.noticeDays || 30),
    totalContractValueCents: Number(input.totalContractValueCents || 0),
    currency: input.currency || 'USD',
    documentUrl: input.documentUrl || '',
    metadata: input.metadata || {}
  };
}

function normalizeOrderFormInput(input = {}) {
  if (!input.agreementId) throw validationError('agreementId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  if (!ORDER_FORM_STATUSES.includes(status)) throw validationError(`Unsupported order form status: ${status}`);
  return {
    agreementId: input.agreementId,
    name: input.name,
    status,
    startDate: input.startDate || '',
    endDate: input.endDate || '',
    billingInterval: input.billingInterval || 'monthly',
    amountCents: Number(input.amountCents || 0),
    currency: input.currency || 'USD',
    lineItems: Array.isArray(input.lineItems) ? input.lineItems : [],
    signedAt: input.signedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeContractTermInput(input = {}) {
  if (!input.agreementId) throw validationError('agreementId is required');
  if (!input.title) throw validationError('title is required');
  const termType = input.termType || 'custom';
  if (!TERM_TYPES.includes(termType)) throw validationError(`Unsupported term type: ${termType}`);
  return {
    agreementId: input.agreementId,
    termType,
    title: input.title,
    body: input.body || '',
    effectiveAt: input.effectiveAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeAmendmentInput(input = {}) {
  if (!input.agreementId) throw validationError('agreementId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  if (!AMENDMENT_STATUSES.includes(status)) throw validationError(`Unsupported amendment status: ${status}`);
  return {
    agreementId: input.agreementId,
    title: input.title,
    status,
    summary: input.summary || '',
    effectiveDate: input.effectiveDate || '',
    signedAt: input.signedAt || '',
    documentUrl: input.documentUrl || '',
    metadata: input.metadata || {}
  };
}

function normalizeObligationInput(input = {}) {
  if (!input.agreementId) throw validationError('agreementId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  if (!OBLIGATION_STATUSES.includes(status)) throw validationError(`Unsupported obligation status: ${status}`);
  return {
    agreementId: input.agreementId,
    title: input.title,
    description: input.description || '',
    owner: input.owner || '',
    dueDate: input.dueDate || '',
    status,
    fulfilledAt: input.fulfilledAt || '',
    evidenceUrl: input.evidenceUrl || '',
    metadata: input.metadata || {}
  };
}

function daysUntil(dateText, asOf = new Date().toISOString().slice(0, 10)) {
  if (!dateText) return null;
  const target = new Date(`${String(dateText).slice(0, 10)}T00:00:00.000Z`);
  const start = new Date(`${String(asOf).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(target.getTime()) || Number.isNaN(start.getTime())) return null;
  return Math.ceil((target.getTime() - start.getTime()) / 86400000);
}

function activateAgreement(agreement, at = new Date().toISOString()) {
  return { ...agreement, status: 'active', updatedAt: at };
}

function terminateAgreement(agreement, at = new Date().toISOString()) {
  return { ...agreement, status: 'terminated', updatedAt: at };
}

function executeAmendment(amendment, signedAt = new Date().toISOString()) {
  return { ...amendment, status: 'executed', signedAt, updatedAt: signedAt };
}

function fulfillObligation(obligation, evidenceUrl = '', fulfilledAt = new Date().toISOString()) {
  return { ...obligation, status: 'fulfilled', fulfilledAt, evidenceUrl: evidenceUrl || obligation.evidenceUrl || '', updatedAt: fulfilledAt };
}

function calculateOrderFormTotal(orderForms = []) {
  return orderForms.reduce((sum, x) => sum + Number(x.amountCents || 0), 0);
}

function evaluateRenewalWindow({ agreement, asOf = new Date().toISOString().slice(0, 10) }) {
  const daysToEnd = daysUntil(agreement && agreement.endDate, asOf);
  if (daysToEnd === null) return { inRenewalWindow: false, reason: 'Agreement end date is missing', daysToEnd: null };
  const noticeDays = Number((agreement && agreement.noticeDays) || 0);
  return {
    inRenewalWindow: daysToEnd <= noticeDays && daysToEnd >= 0,
    expired: daysToEnd < 0,
    daysToEnd,
    noticeDays,
    renewalType: agreement.renewalType || 'manual'
  };
}

function summarizeContractPortfolio(agreements = [], obligations = []) {
  return {
    totalAgreements: agreements.length,
    activeAgreements: agreements.filter(x => x.status === 'active').length,
    expiringSoon: agreements.filter(x => evaluateRenewalWindow({ agreement: x }).inRenewalWindow).length,
    openObligations: obligations.filter(x => ['open', 'in_progress'].includes(x.status)).length,
    breachedObligations: obligations.filter(x => x.status === 'breached').length,
    totalContractValueCents: agreements.reduce((sum, x) => sum + Number(x.totalContractValueCents || 0), 0)
  };
}

module.exports = {
  CONTRACT_STATUSES,
  ORDER_FORM_STATUSES,
  TERM_TYPES,
  AMENDMENT_STATUSES,
  OBLIGATION_STATUSES,
  RENEWAL_TYPES,
  slugCode,
  normalizeAgreementInput,
  normalizeOrderFormInput,
  normalizeContractTermInput,
  normalizeAmendmentInput,
  normalizeObligationInput,
  daysUntil,
  activateAgreement,
  terminateAgreement,
  executeAmendment,
  fulfillObligation,
  calculateOrderFormTotal,
  evaluateRenewalWindow,
  summarizeContractPortfolio
};
