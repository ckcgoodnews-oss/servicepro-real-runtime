const { validationError } = require('../errors/domainError');

const POLICY_STATUSES = ['draft', 'active', 'retired'];
const RECORD_CLASS_STATUSES = ['active', 'retired'];
const SCHEDULE_STATUSES = ['scheduled', 'eligible', 'blocked', 'disposed', 'cancelled'];
const DISPOSITION_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];
const JOB_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const DISPOSITION_ACTIONS = ['delete', 'archive', 'anonymize', 'review_only'];
const RETENTION_TRIGGERS = ['created_at', 'closed_at', 'last_activity_at', 'contract_end_at', 'custom'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  if (Number.isNaN(base.getTime())) return '';
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}

function normalizePolicyInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  const action = input.dispositionAction || 'delete';
  const trigger = input.retentionTrigger || 'created_at';
  assertAllowed(status, POLICY_STATUSES, 'retention policy status');
  assertAllowed(action, DISPOSITION_ACTIONS, 'disposition action');
  assertAllowed(trigger, RETENTION_TRIGGERS, 'retention trigger');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    recordClassId: input.recordClassId || '',
    retentionDays: Number(input.retentionDays || 365),
    retentionTrigger: trigger,
    dispositionAction: action,
    requiresApproval: input.requiresApproval !== false,
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}

function normalizeRecordClassInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  assertAllowed(status, RECORD_CLASS_STATUSES, 'record class status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    dataCategory: input.dataCategory || '',
    systemOfRecord: input.systemOfRecord || '',
    owner: input.owner || '',
    metadata: input.metadata || {}
  };
}

function normalizeScheduleInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.policyId) throw validationError('policyId is required');
  if (!input.recordId) throw validationError('recordId is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, SCHEDULE_STATUSES, 'retention schedule status');
  return {
    tenantId: input.tenantId,
    policyId: input.policyId,
    recordClassId: input.recordClassId || '',
    recordId: input.recordId,
    recordLocator: input.recordLocator || '',
    triggerAt: input.triggerAt || new Date().toISOString(),
    eligibleAt: input.eligibleAt || '',
    status,
    blockedByHold: input.blockedByHold === true,
    legalHoldId: input.legalHoldId || '',
    dispositionAction: input.dispositionAction || 'delete',
    disposedAt: input.disposedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeDispositionReviewInput(input = {}) {
  if (!input.scheduleId) throw validationError('scheduleId is required');
  if (!input.reviewerId) throw validationError('reviewerId is required');
  const status = input.status || 'pending';
  assertAllowed(status, DISPOSITION_STATUSES, 'disposition review status');
  return {
    scheduleId: input.scheduleId,
    tenantId: input.tenantId || '',
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    metadata: input.metadata || {}
  };
}

function normalizeDeletionJobInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  const status = input.status || 'queued';
  assertAllowed(status, JOB_STATUSES, 'deletion job status');
  return {
    tenantId: input.tenantId,
    scheduleIds: Array.isArray(input.scheduleIds) ? input.scheduleIds : [],
    status,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    recordsProcessed: Number(input.recordsProcessed || 0),
    recordsFailed: Number(input.recordsFailed || 0),
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function calculateEligibleAt(policy, triggerAt) {
  return addDays(triggerAt, policy.retentionDays);
}

function markEligible(schedule, at = new Date().toISOString()) {
  return { ...schedule, status: 'eligible', eligibleAt: schedule.eligibleAt || at, updatedAt: at };
}

function blockForLegalHold(schedule, legalHoldId, at = new Date().toISOString()) {
  if (!legalHoldId) throw validationError('legalHoldId is required');
  return { ...schedule, status: 'blocked', blockedByHold: true, legalHoldId, updatedAt: at };
}

function unblockLegalHold(schedule, at = new Date().toISOString()) {
  return { ...schedule, status: 'eligible', blockedByHold: false, legalHoldId: '', updatedAt: at };
}

function approveDisposition(review, comments = '', at = new Date().toISOString()) {
  return { ...review, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectDisposition(review, comments = '', at = new Date().toISOString()) {
  return { ...review, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function markDisposed(schedule, at = new Date().toISOString()) {
  if (schedule.blockedByHold) throw validationError('cannot dispose record while blocked by legal hold');
  return { ...schedule, status: 'disposed', disposedAt: at, updatedAt: at };
}

function startJob(job, at = new Date().toISOString()) {
  return { ...job, status: 'running', startedAt: at, updatedAt: at };
}

function completeJob(job, recordsProcessed = 0, recordsFailed = 0, at = new Date().toISOString()) {
  return {
    ...job,
    status: 'completed',
    recordsProcessed: Number(recordsProcessed || 0),
    recordsFailed: Number(recordsFailed || 0),
    completedAt: at,
    updatedAt: at
  };
}

function failJob(job, errorMessage, at = new Date().toISOString()) {
  return { ...job, status: 'failed', errorMessage: errorMessage || 'Deletion job failed', completedAt: at, updatedAt: at };
}

function isScheduleDue(schedule, asOf = new Date().toISOString()) {
  const eligibleAt = schedule.eligibleAt || schedule.triggerAt;
  return new Date(asOf).getTime() >= new Date(eligibleAt).getTime();
}

function retentionMetrics({ policies = [], classes = [], schedules = [], reviews = [], jobs = [] }) {
  return {
    activePolicies: policies.filter(x => x.status === 'active').length,
    activeRecordClasses: classes.filter(x => x.status === 'active').length,
    eligibleSchedules: schedules.filter(x => x.status === 'eligible').length,
    blockedSchedules: schedules.filter(x => x.status === 'blocked').length,
    pendingReviews: reviews.filter(x => x.status === 'pending').length,
    completedJobs: jobs.filter(x => x.status === 'completed').length
  };
}

module.exports = {
  POLICY_STATUSES,
  RECORD_CLASS_STATUSES,
  SCHEDULE_STATUSES,
  DISPOSITION_STATUSES,
  JOB_STATUSES,
  DISPOSITION_ACTIONS,
  RETENTION_TRIGGERS,
  slugCode,
  addDays,
  normalizePolicyInput,
  normalizeRecordClassInput,
  normalizeScheduleInput,
  normalizeDispositionReviewInput,
  normalizeDeletionJobInput,
  calculateEligibleAt,
  markEligible,
  blockForLegalHold,
  unblockLegalHold,
  approveDisposition,
  rejectDisposition,
  markDisposed,
  startJob,
  completeJob,
  failJob,
  isScheduleDue,
  retentionMetrics
};
