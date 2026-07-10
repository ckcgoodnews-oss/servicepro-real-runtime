const { validationError } = require('../errors/domainError');

const MATTER_STATUSES = ['open', 'active', 'stayed', 'closed', 'archived'];
const MATTER_TYPES = ['litigation', 'investigation', 'regulatory', 'employment', 'commercial', 'other'];
const HOLD_STATUSES = ['draft', 'active', 'released', 'cancelled'];
const CUSTODIAN_STATUSES = ['notified', 'acknowledged', 'escalated', 'released'];
const SCOPE_TYPES = ['email', 'document', 'ticket', 'audit_log', 'database_record', 'chat', 'other'];
const COLLECTION_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const EXPORT_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const EXPORT_FORMATS = ['zip', 'pst', 'jsonl', 'csv', 'pdf'];

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

function normalizeMatterInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'open';
  const matterType = input.matterType || 'other';
  assertAllowed(status, MATTER_STATUSES, 'matter status');
  assertAllowed(matterType, MATTER_TYPES, 'matter type');
  return {
    tenantId: input.tenantId,
    matterNumber: input.matterNumber || '',
    name: input.name,
    description: input.description || '',
    matterType,
    status,
    owner: input.owner || '',
    outsideCounsel: input.outsideCounsel || '',
    openedAt: input.openedAt || new Date().toISOString(),
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeHoldInput(input = {}) {
  if (!input.matterId) throw validationError('matterId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  assertAllowed(status, HOLD_STATUSES, 'legal hold status');
  return {
    matterId: input.matterId,
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    issuedBy: input.issuedBy || '',
    issuedAt: input.issuedAt || '',
    releasedBy: input.releasedBy || '',
    releasedAt: input.releasedAt || '',
    instructions: input.instructions || '',
    metadata: input.metadata || {}
  };
}

function normalizeCustodianInput(input = {}) {
  if (!input.holdId) throw validationError('holdId is required');
  if (!input.email) throw validationError('email is required');
  const status = input.status || 'notified';
  assertAllowed(status, CUSTODIAN_STATUSES, 'custodian status');
  return {
    holdId: input.holdId,
    tenantId: input.tenantId || '',
    name: input.name || '',
    email: input.email,
    status,
    notifiedAt: input.notifiedAt || new Date().toISOString(),
    acknowledgedAt: input.acknowledgedAt || '',
    releasedAt: input.releasedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeScopeInput(input = {}) {
  if (!input.holdId) throw validationError('holdId is required');
  if (!input.scopeType) throw validationError('scopeType is required');
  assertAllowed(input.scopeType, SCOPE_TYPES, 'preservation scope type');
  return {
    holdId: input.holdId,
    tenantId: input.tenantId || '',
    scopeType: input.scopeType,
    sourceSystem: input.sourceSystem || '',
    query: input.query || '',
    dateFrom: input.dateFrom || '',
    dateTo: input.dateTo || '',
    preserved: input.preserved === true,
    preservedAt: input.preservedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeCollectionJobInput(input = {}) {
  if (!input.holdId) throw validationError('holdId is required');
  const status = input.status || 'queued';
  assertAllowed(status, COLLECTION_STATUSES, 'collection status');
  return {
    holdId: input.holdId,
    tenantId: input.tenantId || '',
    status,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    itemCount: Number(input.itemCount || 0),
    outputLocation: input.outputLocation || '',
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function normalizeExportJobInput(input = {}) {
  if (!input.matterId) throw validationError('matterId is required');
  const status = input.status || 'queued';
  const format = input.format || 'zip';
  assertAllowed(status, EXPORT_STATUSES, 'export status');
  assertAllowed(format, EXPORT_FORMATS, 'export format');
  return {
    matterId: input.matterId,
    holdId: input.holdId || '',
    tenantId: input.tenantId || '',
    status,
    format,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    outputUrl: input.outputUrl || '',
    itemCount: Number(input.itemCount || 0),
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function issueHold(hold, issuedBy, at = new Date().toISOString()) {
  if (!issuedBy) throw validationError('issuedBy is required');
  return { ...hold, status: 'active', issuedBy, issuedAt: at, updatedAt: at };
}

function releaseHold(hold, releasedBy, at = new Date().toISOString()) {
  if (!releasedBy) throw validationError('releasedBy is required');
  return { ...hold, status: 'released', releasedBy, releasedAt: at, updatedAt: at };
}

function acknowledgeCustodian(custodian, at = new Date().toISOString()) {
  return { ...custodian, status: 'acknowledged', acknowledgedAt: at, updatedAt: at };
}

function releaseCustodian(custodian, at = new Date().toISOString()) {
  return { ...custodian, status: 'released', releasedAt: at, updatedAt: at };
}

function markScopePreserved(scope, at = new Date().toISOString()) {
  return { ...scope, preserved: true, preservedAt: at, updatedAt: at };
}

function startCollection(job, at = new Date().toISOString()) {
  return { ...job, status: 'running', startedAt: at, updatedAt: at };
}

function completeCollection(job, itemCount = 0, outputLocation = '', at = new Date().toISOString()) {
  return { ...job, status: 'completed', itemCount: Number(itemCount || 0), outputLocation, completedAt: at, updatedAt: at };
}

function failCollection(job, errorMessage, at = new Date().toISOString()) {
  return { ...job, status: 'failed', errorMessage: errorMessage || 'Collection failed', completedAt: at, updatedAt: at };
}

function startExport(job, at = new Date().toISOString()) {
  return { ...job, status: 'running', startedAt: at, updatedAt: at };
}

function completeExport(job, outputUrl, itemCount = 0, at = new Date().toISOString()) {
  if (!outputUrl) throw validationError('outputUrl is required');
  return { ...job, status: 'completed', outputUrl, itemCount: Number(itemCount || 0), completedAt: at, updatedAt: at };
}

function failExport(job, errorMessage, at = new Date().toISOString()) {
  return { ...job, status: 'failed', errorMessage: errorMessage || 'Export failed', completedAt: at, updatedAt: at };
}

function closeMatter(matter, at = new Date().toISOString()) {
  return { ...matter, status: 'closed', closedAt: at, updatedAt: at };
}

function holdResponseDue(custodian, days = 7) {
  return addDays(custodian.notifiedAt, days);
}

function legalHoldMetrics({ matters = [], holds = [], custodians = [], collections = [], exports = [] }) {
  return {
    openMatters: matters.filter(x => ['open', 'active', 'stayed'].includes(x.status)).length,
    activeHolds: holds.filter(x => x.status === 'active').length,
    pendingCustodianAcknowledgements: custodians.filter(x => x.status === 'notified').length,
    completedCollections: collections.filter(x => x.status === 'completed').length,
    completedExports: exports.filter(x => x.status === 'completed').length
  };
}

module.exports = {
  MATTER_STATUSES,
  MATTER_TYPES,
  HOLD_STATUSES,
  CUSTODIAN_STATUSES,
  SCOPE_TYPES,
  COLLECTION_STATUSES,
  EXPORT_STATUSES,
  EXPORT_FORMATS,
  slugCode,
  addDays,
  normalizeMatterInput,
  normalizeHoldInput,
  normalizeCustodianInput,
  normalizeScopeInput,
  normalizeCollectionJobInput,
  normalizeExportJobInput,
  issueHold,
  releaseHold,
  acknowledgeCustodian,
  releaseCustodian,
  markScopePreserved,
  startCollection,
  completeCollection,
  failCollection,
  startExport,
  completeExport,
  failExport,
  closeMatter,
  holdResponseDue,
  legalHoldMetrics
};
