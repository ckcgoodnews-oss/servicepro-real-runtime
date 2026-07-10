const { validationError } = require('../errors/domainError');

const DSAR_TYPES = ['access', 'delete', 'rectify', 'export', 'restrict_processing', 'object', 'withdraw_consent'];
const DSAR_STATUSES = ['received', 'identity_verification', 'in_progress', 'fulfilled', 'denied', 'cancelled', 'overdue'];
const CONSENT_STATUSES = ['granted', 'withdrawn', 'expired'];
const RETENTION_STATUSES = ['draft', 'active', 'retired'];
const DELETION_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const PROCESSING_STATUSES = ['draft', 'active', 'retired'];
const DPIA_STATUSES = ['draft', 'review', 'approved', 'rejected', 'retired'];
const BREACH_STATUSES = ['suspected', 'confirmed', 'not_reportable', 'reported', 'closed'];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}
function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}
function normalizeSubjectId(value = '') {
  return String(value || '').trim().toLowerCase();
}
function normalizeDsarInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.subjectId) throw validationError('subjectId is required');
  const requestType = input.requestType || 'access';
  const status = input.status || 'received';
  assertAllowed(requestType, DSAR_TYPES, 'DSAR type');
  assertAllowed(status, DSAR_STATUSES, 'DSAR status');
  return {
    tenantId: input.tenantId,
    requestNumber: input.requestNumber || '',
    subjectId: normalizeSubjectId(input.subjectId),
    subjectEmail: input.subjectEmail || '',
    requestType,
    status,
    jurisdiction: input.jurisdiction || 'US',
    receivedAt: input.receivedAt || new Date().toISOString(),
    dueAt: input.dueAt || addDays(new Date().toISOString(), 30),
    verifiedAt: input.verifiedAt || '',
    fulfilledAt: input.fulfilledAt || '',
    deniedAt: input.deniedAt || '',
    denialReason: input.denialReason || '',
    assignedTo: input.assignedTo || '',
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}
function normalizeConsentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.subjectId) throw validationError('subjectId is required');
  if (!input.purpose) throw validationError('purpose is required');
  const status = input.status || 'granted';
  assertAllowed(status, CONSENT_STATUSES, 'consent status');
  return {
    tenantId: input.tenantId,
    subjectId: normalizeSubjectId(input.subjectId),
    purpose: input.purpose,
    status,
    source: input.source || '',
    grantedAt: input.grantedAt || (status === 'granted' ? new Date().toISOString() : ''),
    withdrawnAt: input.withdrawnAt || '',
    expiresAt: input.expiresAt || '',
    policyVersion: input.policyVersion || '',
    metadata: input.metadata || {}
  };
}
function normalizeRetentionPolicyInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  if (!input.dataCategory) throw validationError('dataCategory is required');
  const status = input.status || 'draft';
  assertAllowed(status, RETENTION_STATUSES, 'retention policy status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    dataCategory: input.dataCategory,
    status,
    retentionDays: Number(input.retentionDays || 365),
    legalBasis: input.legalBasis || '',
    owner: input.owner || '',
    activatedAt: input.activatedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeDeletionJobInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.subjectId && !input.policyId) throw validationError('subjectId or policyId is required');
  const status = input.status || 'queued';
  assertAllowed(status, DELETION_STATUSES, 'deletion job status');
  return {
    tenantId: input.tenantId,
    subjectId: input.subjectId ? normalizeSubjectId(input.subjectId) : '',
    policyId: input.policyId || '',
    requestId: input.requestId || '',
    status,
    scope: input.scope || 'subject',
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    recordsDeleted: Number(input.recordsDeleted || 0),
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeProcessingActivityInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  const riskLevel = input.riskLevel || 'medium';
  assertAllowed(status, PROCESSING_STATUSES, 'processing activity status');
  assertAllowed(riskLevel, RISK_LEVELS, 'risk level');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    dataCategories: Array.isArray(input.dataCategories) ? input.dataCategories : [],
    subjectCategories: Array.isArray(input.subjectCategories) ? input.subjectCategories : [],
    processor: input.processor || '',
    legalBasis: input.legalBasis || '',
    riskLevel,
    owner: input.owner || '',
    reviewedAt: input.reviewedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeDpiaInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.processingActivityId) throw validationError('processingActivityId is required');
  const status = input.status || 'draft';
  const riskLevel = input.riskLevel || 'medium';
  assertAllowed(status, DPIA_STATUSES, 'DPIA status');
  assertAllowed(riskLevel, RISK_LEVELS, 'risk level');
  return {
    tenantId: input.tenantId,
    processingActivityId: input.processingActivityId,
    status,
    riskLevel,
    assessor: input.assessor || '',
    assessmentSummary: input.assessmentSummary || '',
    mitigations: Array.isArray(input.mitigations) ? input.mitigations : [],
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    approvedAt: input.approvedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeBreachNotificationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'suspected';
  const riskLevel = input.riskLevel || 'medium';
  assertAllowed(status, BREACH_STATUSES, 'breach status');
  assertAllowed(riskLevel, RISK_LEVELS, 'risk level');
  return {
    tenantId: input.tenantId,
    title: input.title,
    description: input.description || '',
    status,
    riskLevel,
    discoveredAt: input.discoveredAt || new Date().toISOString(),
    confirmedAt: input.confirmedAt || '',
    authorityNotifiedAt: input.authorityNotifiedAt || '',
    subjectsNotifiedAt: input.subjectsNotifiedAt || '',
    closedAt: input.closedAt || '',
    affectedSubjectCount: Number(input.affectedSubjectCount || 0),
    regulatorReference: input.regulatorReference || '',
    metadata: input.metadata || {}
  };
}
function verifyDsarIdentity(dsar, at = new Date().toISOString()) {
  return { ...dsar, status: 'in_progress', verifiedAt: at, updatedAt: at };
}
function fulfillDsar(dsar, notes = '', at = new Date().toISOString()) {
  return { ...dsar, status: 'fulfilled', fulfilledAt: at, notes: notes || dsar.notes, updatedAt: at };
}
function denyDsar(dsar, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...dsar, status: 'denied', denialReason: reason, deniedAt: at, updatedAt: at };
}
function withdrawConsent(consent, at = new Date().toISOString()) {
  return { ...consent, status: 'withdrawn', withdrawnAt: at, updatedAt: at };
}
function activateRetentionPolicy(policy, at = new Date().toISOString()) {
  return { ...policy, status: 'active', activatedAt: at, updatedAt: at };
}
function retireRetentionPolicy(policy, at = new Date().toISOString()) {
  return { ...policy, status: 'retired', updatedAt: at };
}
function startDeletionJob(job, at = new Date().toISOString()) {
  return { ...job, status: 'running', startedAt: at, updatedAt: at };
}
function completeDeletionJob(job, recordsDeleted = 0, at = new Date().toISOString()) {
  return { ...job, status: 'completed', recordsDeleted: Number(recordsDeleted || 0), completedAt: at, updatedAt: at };
}
function failDeletionJob(job, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...job, status: 'failed', failureReason: reason, completedAt: at, updatedAt: at };
}
function activateProcessingActivity(activity, at = new Date().toISOString()) {
  return { ...activity, status: 'active', reviewedAt: activity.reviewedAt || at, updatedAt: at };
}
function retireProcessingActivity(activity, at = new Date().toISOString()) {
  return { ...activity, status: 'retired', updatedAt: at };
}
function submitDpiaForReview(dpia, assessor = '', summary = '', at = new Date().toISOString()) {
  return { ...dpia, status: 'review', assessor: assessor || dpia.assessor, assessmentSummary: summary || dpia.assessmentSummary, reviewedAt: at, updatedAt: at };
}
function approveDpia(dpia, reviewedBy, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...dpia, status: 'approved', reviewedBy, approvedAt: at, updatedAt: at };
}
function rejectDpia(dpia, reviewedBy, reason, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  if (!reason) throw validationError('reason is required');
  return { ...dpia, status: 'rejected', reviewedBy, rejectionReason: reason, reviewedAt: at, updatedAt: at };
}
function confirmBreach(breach, at = new Date().toISOString()) {
  return { ...breach, status: 'confirmed', confirmedAt: at, updatedAt: at };
}
function markBreachNotReportable(breach, at = new Date().toISOString()) {
  return { ...breach, status: 'not_reportable', closedAt: at, updatedAt: at };
}
function reportBreach(breach, regulatorReference = '', at = new Date().toISOString()) {
  return { ...breach, status: 'reported', authorityNotifiedAt: at, regulatorReference: regulatorReference || breach.regulatorReference, updatedAt: at };
}
function notifySubjects(breach, at = new Date().toISOString()) {
  return { ...breach, subjectsNotifiedAt: at, updatedAt: at };
}
function closeBreach(breach, at = new Date().toISOString()) {
  return { ...breach, status: 'closed', closedAt: at, updatedAt: at };
}
function dsarOverdue(dsar, asOf = new Date().toISOString()) {
  return !['fulfilled', 'denied', 'cancelled'].includes(dsar.status) && dsar.dueAt && new Date(asOf).getTime() > new Date(dsar.dueAt).getTime();
}
function consentActive(consent, asOf = new Date().toISOString()) {
  if (consent.status !== 'granted') return false;
  if (!consent.expiresAt) return true;
  return new Date(asOf).getTime() <= new Date(consent.expiresAt).getTime();
}
function privacyMetrics({ dsars = [], consents = [], policies = [], deletionJobs = [], activities = [], dpias = [], breaches = [] }) {
  return {
    openDsars: dsars.filter(x => ['received', 'identity_verification', 'in_progress', 'overdue'].includes(x.status)).length,
    overdueDsars: dsars.filter(x => dsarOverdue(x)).length,
    activeConsents: consents.filter(x => consentActive(x)).length,
    activeRetentionPolicies: policies.filter(x => x.status === 'active').length,
    completedDeletionJobs: deletionJobs.filter(x => x.status === 'completed').length,
    activeProcessingActivities: activities.filter(x => x.status === 'active').length,
    approvedDpias: dpias.filter(x => x.status === 'approved').length,
    confirmedBreaches: breaches.filter(x => ['confirmed', 'reported'].includes(x.status)).length,
    reportedBreaches: breaches.filter(x => x.status === 'reported').length
  };
}
module.exports = {
  DSAR_TYPES, DSAR_STATUSES, CONSENT_STATUSES, RETENTION_STATUSES, DELETION_STATUSES,
  PROCESSING_STATUSES, DPIA_STATUSES, BREACH_STATUSES, RISK_LEVELS, assertAllowed,
  slugCode, addDays, normalizeSubjectId, normalizeDsarInput, normalizeConsentInput,
  normalizeRetentionPolicyInput, normalizeDeletionJobInput, normalizeProcessingActivityInput,
  normalizeDpiaInput, normalizeBreachNotificationInput, verifyDsarIdentity, fulfillDsar,
  denyDsar, withdrawConsent, activateRetentionPolicy, retireRetentionPolicy, startDeletionJob,
  completeDeletionJob, failDeletionJob, activateProcessingActivity, retireProcessingActivity,
  submitDpiaForReview, approveDpia, rejectDpia, confirmBreach, markBreachNotReportable,
  reportBreach, notifySubjects, closeBreach, dsarOverdue, consentActive, privacyMetrics
};
