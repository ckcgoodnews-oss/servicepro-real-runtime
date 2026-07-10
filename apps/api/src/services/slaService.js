const { validationError } = require('../errors/domainError');

const SLA_TIMER_STATUSES = ['active', 'responded', 'resolved', 'breached', 'cancelled'];
const SLA_PRIORITY_LEVELS = ['low', 'normal', 'high', 'urgent', 'emergency'];

function addMinutesIso(startIso, minutes) {
  const d = new Date(startIso);
  if (Number.isNaN(d.getTime())) throw validationError('start time is invalid');
  d.setUTCMinutes(d.getUTCMinutes() + Number(minutes || 0));
  return d.toISOString();
}

function normalizeSlaPolicyInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  const priority = input.priority || 'normal';
  if (!SLA_PRIORITY_LEVELS.includes(priority)) throw validationError(`Unsupported SLA priority: ${priority}`);

  return {
    name: input.name,
    description: input.description || '',
    priority,
    responseMinutes: Number(input.responseMinutes || 60),
    resolutionMinutes: Number(input.resolutionMinutes || 1440),
    warningBeforeMinutes: Number(input.warningBeforeMinutes || 15),
    appliesToServiceType: input.appliesToServiceType || '',
    appliesToAgreementTier: input.appliesToAgreementTier || '',
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeSlaTimerInput(input = {}) {
  if (!input.jobId) throw validationError('jobId is required');
  if (!input.policyId) throw validationError('policyId is required');
  if (!input.startedAt) throw validationError('startedAt is required');

  const status = input.status || 'active';
  if (!SLA_TIMER_STATUSES.includes(status)) throw validationError(`Unsupported SLA timer status: ${status}`);

  return {
    jobId: input.jobId,
    customerId: input.customerId || '',
    policyId: input.policyId,
    priority: input.priority || 'normal',
    status,
    startedAt: input.startedAt,
    responseDueAt: input.responseDueAt || '',
    resolutionDueAt: input.resolutionDueAt || '',
    respondedAt: input.respondedAt || '',
    resolvedAt: input.resolvedAt || '',
    breachedAt: input.breachedAt || '',
    breachReason: input.breachReason || '',
    metadata: input.metadata || {}
  };
}

function buildTimerFromPolicy(policy, input = {}) {
  if (!input.jobId) throw validationError('jobId is required');
  const startedAt = input.startedAt || new Date().toISOString();
  return normalizeSlaTimerInput({
    jobId: input.jobId,
    customerId: input.customerId || '',
    policyId: policy.id,
    priority: policy.priority,
    startedAt,
    responseDueAt: addMinutesIso(startedAt, policy.responseMinutes),
    resolutionDueAt: addMinutesIso(startedAt, policy.resolutionMinutes),
    status: 'active',
    metadata: input.metadata || {}
  });
}

function evaluateSlaTimer(timer, nowIso = new Date().toISOString()) {
  const now = new Date(nowIso).getTime();
  const responseDue = timer.responseDueAt ? new Date(timer.responseDueAt).getTime() : null;
  const resolutionDue = timer.resolutionDueAt ? new Date(timer.resolutionDueAt).getTime() : null;

  const responseBreached = !timer.respondedAt && responseDue !== null && now > responseDue;
  const resolutionBreached = !timer.resolvedAt && resolutionDue !== null && now > resolutionDue;

  return {
    responseBreached,
    resolutionBreached,
    breached: responseBreached || resolutionBreached,
    responseMinutesRemaining: responseDue === null ? null : Math.floor((responseDue - now) / 60000),
    resolutionMinutesRemaining: resolutionDue === null ? null : Math.floor((resolutionDue - now) / 60000)
  };
}

function markResponded(timer, respondedAt = new Date().toISOString()) {
  return {
    ...timer,
    status: timer.status === 'resolved' ? 'resolved' : 'responded',
    respondedAt,
    updatedAt: respondedAt
  };
}

function markResolved(timer, resolvedAt = new Date().toISOString()) {
  return {
    ...timer,
    status: 'resolved',
    respondedAt: timer.respondedAt || resolvedAt,
    resolvedAt,
    updatedAt: resolvedAt
  };
}

function markBreached(timer, reason = 'SLA breached', breachedAt = new Date().toISOString()) {
  return {
    ...timer,
    status: 'breached',
    breachedAt,
    breachReason: reason,
    updatedAt: breachedAt
  };
}

module.exports = {
  SLA_TIMER_STATUSES,
  SLA_PRIORITY_LEVELS,
  addMinutesIso,
  normalizeSlaPolicyInput,
  normalizeSlaTimerInput,
  buildTimerFromPolicy,
  evaluateSlaTimer,
  markResponded,
  markResolved,
  markBreached
};
