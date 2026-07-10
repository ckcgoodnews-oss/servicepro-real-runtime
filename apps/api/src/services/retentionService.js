const { validationError } = require('../errors/domainError');

const POLICY_STATUSES = ['draft', 'active', 'archived'];
const CLASSIFICATION_LEVELS = ['public', 'internal', 'confidential', 'restricted'];
const HOLD_STATUSES = ['active', 'released'];
const REVIEW_STATUSES = ['pending', 'approved_for_delete', 'rejected', 'deleted'];
const EXPORT_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const EXPORT_FORMATS = ['json', 'csv', 'zip'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function addDays(dateText, days) {
  const base = new Date(`${String(dateText).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) return '';
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString().slice(0, 10);
}

function daysUntil(dateText, asOf = new Date().toISOString().slice(0, 10)) {
  if (!dateText) return null;
  const target = new Date(`${String(dateText).slice(0, 10)}T00:00:00.000Z`);
  const start = new Date(`${String(asOf).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(target.getTime()) || Number.isNaN(start.getTime())) return null;
  return Math.ceil((target.getTime() - start.getTime()) / 86400000);
}

function normalizeRetentionPolicyInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  if (!input.documentType) throw validationError('documentType is required');
  const status = input.status || 'active';
  assertAllowed(status, POLICY_STATUSES, 'retention policy status');
  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    documentType: input.documentType,
    status,
    retentionDays: Number(input.retentionDays || 2555),
    reviewBeforeDeleteDays: Number(input.reviewBeforeDeleteDays || 30),
    allowAutoDelete: input.allowAutoDelete === true,
    metadata: input.metadata || {}
  };
}

function normalizeClassificationInput(input = {}) {
  if (!input.documentId) throw validationError('documentId is required');
  const classificationLevel = input.classificationLevel || 'internal';
  assertAllowed(classificationLevel, CLASSIFICATION_LEVELS, 'classification level');
  return {
    documentId: input.documentId,
    tenantId: input.tenantId || '',
    documentType: input.documentType || 'document',
    classificationLevel,
    policyId: input.policyId || '',
    classifiedBy: input.classifiedBy || '',
    classifiedAt: input.classifiedAt || new Date().toISOString(),
    sourceCreatedAt: input.sourceCreatedAt || new Date().toISOString(),
    retainUntil: input.retainUntil || '',
    metadata: input.metadata || {}
  };
}

function normalizeLegalHoldInput(input = {}) {
  if (!input.documentId) throw validationError('documentId is required');
  if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'active';
  assertAllowed(status, HOLD_STATUSES, 'legal hold status');
  return {
    documentId: input.documentId,
    tenantId: input.tenantId || '',
    status,
    reason: input.reason,
    placedBy: input.placedBy || '',
    placedAt: input.placedAt || new Date().toISOString(),
    releasedBy: input.releasedBy || '',
    releasedAt: input.releasedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeRetentionReviewInput(input = {}) {
  if (!input.documentId) throw validationError('documentId is required');
  const status = input.status || 'pending';
  assertAllowed(status, REVIEW_STATUSES, 'retention review status');
  return {
    documentId: input.documentId,
    tenantId: input.tenantId || '',
    policyId: input.policyId || '',
    status,
    reason: input.reason || '',
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    dueAt: input.dueAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeExportJobInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  const status = input.status || 'queued';
  const format = input.format || 'json';
  assertAllowed(status, EXPORT_STATUSES, 'export status');
  assertAllowed(format, EXPORT_FORMATS, 'export format');
  return {
    tenantId: input.tenantId,
    status,
    format,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    filter: input.filter || {},
    outputUrl: input.outputUrl || '',
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function computeRetainUntil(classification, policy) {
  if (!policy) return classification.retainUntil || '';
  return addDays(classification.sourceCreatedAt || classification.classifiedAt, policy.retentionDays);
}

function applyPolicy(classification, policy) {
  return { ...classification, policyId: policy.id || classification.policyId || '', retainUntil: computeRetainUntil(classification, policy) };
}

function isEligibleForReview(classification, policy, asOf = new Date().toISOString().slice(0, 10)) {
  const retainUntil = classification.retainUntil || computeRetainUntil(classification, policy);
  const days = daysUntil(retainUntil, asOf);
  if (days === null) return false;
  return days <= Number((policy && policy.reviewBeforeDeleteDays) || 0);
}

function isBlockedByHold(documentId, holds = []) {
  return holds.some(x => x.documentId === documentId && x.status === 'active');
}

function approveDeletionReview(review, reviewedBy, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...review, status: 'approved_for_delete', reviewedBy, reviewedAt: at, updatedAt: at };
}

function rejectDeletionReview(review, reviewedBy, reason = '', at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...review, status: 'rejected', reviewedBy, reason: reason || review.reason, reviewedAt: at, updatedAt: at };
}

function markDeleted(review, at = new Date().toISOString()) {
  return { ...review, status: 'deleted', reviewedAt: review.reviewedAt || at, updatedAt: at };
}

function releaseLegalHold(hold, releasedBy, at = new Date().toISOString()) {
  if (!releasedBy) throw validationError('releasedBy is required');
  return { ...hold, status: 'released', releasedBy, releasedAt: at, updatedAt: at };
}

function startExportJob(job, at = new Date().toISOString()) {
  return { ...job, status: 'running', startedAt: at, updatedAt: at };
}

function completeExportJob(job, outputUrl, at = new Date().toISOString()) {
  if (!outputUrl) throw validationError('outputUrl is required');
  return { ...job, status: 'completed', outputUrl, completedAt: at, updatedAt: at };
}

function failExportJob(job, errorMessage, at = new Date().toISOString()) {
  return { ...job, status: 'failed', errorMessage: errorMessage || 'Export failed', completedAt: at, updatedAt: at };
}

module.exports = {
  POLICY_STATUSES,
  CLASSIFICATION_LEVELS,
  HOLD_STATUSES,
  REVIEW_STATUSES,
  EXPORT_STATUSES,
  EXPORT_FORMATS,
  slugCode,
  addDays,
  daysUntil,
  normalizeRetentionPolicyInput,
  normalizeClassificationInput,
  normalizeLegalHoldInput,
  normalizeRetentionReviewInput,
  normalizeExportJobInput,
  computeRetainUntil,
  applyPolicy,
  isEligibleForReview,
  isBlockedByHold,
  approveDeletionReview,
  rejectDeletionReview,
  markDeleted,
  releaseLegalHold,
  startExportJob,
  completeExportJob,
  failExportJob
};
