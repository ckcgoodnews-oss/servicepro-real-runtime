const { validationError } = require('../errors/domainError');

const SCAN_STATUSES = ['queued', 'running', 'completed', 'failed'];
const PACKAGE_STATUSES = ['draft', 'review', 'approved', 'delivered', 'revoked'];

function normalizeScanInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.caseId) throw validationError('caseId is required');
  if (!Array.isArray(input.sources) || !input.sources.length) throw validationError('sources are required');
  return { tenantId: input.tenantId, caseId: input.caseId, subjectId: input.subjectId || '', sources: input.sources, status: input.status || 'queued', startedAt: '', completedAt: '', recordsFound: 0, failureReason: '', metadata: input.metadata || {} };
}
function startScan(scan, at = new Date().toISOString()) { return { ...scan, status: 'running', startedAt: at, updatedAt: at }; }
function completeScan(scan, recordsFound, at = new Date().toISOString()) { return { ...scan, status: 'completed', recordsFound: Number(recordsFound || 0), completedAt: at, updatedAt: at }; }
function failScan(scan, reason, at = new Date().toISOString()) { if (!reason) throw validationError('reason is required'); return { ...scan, status: 'failed', failureReason: reason, completedAt: at, updatedAt: at }; }
function normalizeRecordInput(input = {}) { if (!input.tenantId || !input.scanId || !input.source) throw validationError('tenantId, scanId, and source are required'); return { tenantId: input.tenantId, scanId: input.scanId, source: input.source, recordType: input.recordType || 'record', recordId: input.recordId || '', fields: input.fields || {}, redactions: input.redactions || [], included: input.included !== false, metadata: input.metadata || {} }; }
function normalizePackageInput(input = {}) { if (!input.tenantId || !input.caseId) throw validationError('tenantId and caseId are required'); return { tenantId: input.tenantId, caseId: input.caseId, status: 'draft', format: input.format || 'json', recordIds: Array.isArray(input.recordIds) ? input.recordIds : [], checksum: input.checksum || '', approvedBy: '', approvedAt: '', deliveredAt: '', deliveryChannel: '', metadata: input.metadata || {} }; }
function submitPackage(pkg, at = new Date().toISOString()) { return { ...pkg, status: 'review', updatedAt: at }; }
function approvePackage(pkg, approvedBy, at = new Date().toISOString()) { if (!approvedBy) throw validationError('approvedBy is required'); return { ...pkg, status: 'approved', approvedBy, approvedAt: at, updatedAt: at }; }
function deliverPackage(pkg, channel, at = new Date().toISOString()) { if (pkg.status !== 'approved') throw validationError('package must be approved'); return { ...pkg, status: 'delivered', deliveryChannel: channel || 'secure_link', deliveredAt: at, updatedAt: at }; }
function discoveryMetrics({ scans = [], records = [], packages = [] }) { return { queuedScans: scans.filter(x => x.status === 'queued').length, runningScans: scans.filter(x => x.status === 'running').length, completedScans: scans.filter(x => x.status === 'completed').length, recordsFound: records.length, recordsIncluded: records.filter(x => x.included).length, packagesInReview: packages.filter(x => x.status === 'review').length, packagesDelivered: packages.filter(x => x.status === 'delivered').length }; }

module.exports = { SCAN_STATUSES, PACKAGE_STATUSES, normalizeScanInput, startScan, completeScan, failScan, normalizeRecordInput, normalizePackageInput, submitPackage, approvePackage, deliverPackage, discoveryMetrics };
