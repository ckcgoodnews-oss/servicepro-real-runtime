const { validationError } = require('../errors/domainError');

const PROFILE_STATUSES = ['draft', 'published', 'archived'];
const DOCUMENT_STATUSES = ['draft', 'published', 'archived'];
const DOCUMENT_TYPES = ['soc2', 'iso27001', 'pen_test', 'security_whitepaper', 'privacy_policy', 'subprocessor_list', 'bcdr', 'other'];
const VISIBILITY_LEVELS = ['public', 'gated', 'nda_required', 'internal'];
const REQUEST_STATUSES = ['submitted', 'approved', 'rejected', 'expired', 'revoked'];
const NDA_STATUSES = ['not_required', 'pending', 'signed', 'rejected', 'expired'];
const SHARE_STATUSES = ['active', 'expired', 'revoked'];
const AUDIT_EVENT_TYPES = ['profile_published', 'document_published', 'access_requested', 'access_approved', 'access_rejected', 'nda_signed', 'share_created', 'share_viewed', 'share_revoked'];

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

function normalizeProfileInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.companyName) throw validationError('companyName is required');
  const status = input.status || 'draft';
  assertAllowed(status, PROFILE_STATUSES, 'profile status');
  return {
    tenantId: input.tenantId,
    companyName: input.companyName,
    status,
    overview: input.overview || '',
    securityContactEmail: input.securityContactEmail || '',
    privacyContactEmail: input.privacyContactEmail || '',
    certifications: Array.isArray(input.certifications) ? input.certifications : [],
    securityHighlights: Array.isArray(input.securityHighlights) ? input.securityHighlights : [],
    publishedAt: input.publishedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeDocumentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const documentType = input.documentType || 'other';
  const status = input.status || 'draft';
  const visibility = input.visibility || 'gated';
  assertAllowed(documentType, DOCUMENT_TYPES, 'document type');
  assertAllowed(status, DOCUMENT_STATUSES, 'document status');
  assertAllowed(visibility, VISIBILITY_LEVELS, 'document visibility');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.title),
    title: input.title,
    description: input.description || '',
    documentType,
    status,
    visibility,
    fileUrl: input.fileUrl || '',
    version: input.version || '',
    validFrom: input.validFrom || '',
    validUntil: input.validUntil || '',
    publishedAt: input.publishedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeAccessRequestInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.documentId) throw validationError('documentId is required');
  if (!input.requesterEmail) throw validationError('requesterEmail is required');
  const status = input.status || 'submitted';
  const ndaStatus = input.ndaStatus || 'not_required';
  assertAllowed(status, REQUEST_STATUSES, 'access request status');
  assertAllowed(ndaStatus, NDA_STATUSES, 'NDA status');
  return {
    tenantId: input.tenantId,
    documentId: input.documentId,
    requesterName: input.requesterName || '',
    requesterEmail: input.requesterEmail,
    companyName: input.companyName || '',
    businessReason: input.businessReason || '',
    status,
    ndaStatus,
    requestedAt: input.requestedAt || new Date().toISOString(),
    decidedBy: input.decidedBy || '',
    decidedAt: input.decidedAt || '',
    expiresAt: input.expiresAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeShareInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.documentId) throw validationError('documentId is required');
  if (!input.accessRequestId) throw validationError('accessRequestId is required');
  const status = input.status || 'active';
  assertAllowed(status, SHARE_STATUSES, 'share status');
  return {
    tenantId: input.tenantId,
    documentId: input.documentId,
    accessRequestId: input.accessRequestId,
    recipientEmail: input.recipientEmail || '',
    token: input.token || '',
    status,
    createdBy: input.createdBy || '',
    createdAt: input.createdAt || new Date().toISOString(),
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 30),
    lastViewedAt: input.lastViewedAt || '',
    revokedBy: input.revokedBy || '',
    revokedAt: input.revokedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeAuditEventInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.eventType) throw validationError('eventType is required');
  assertAllowed(input.eventType, AUDIT_EVENT_TYPES, 'audit event type');
  return {
    tenantId: input.tenantId,
    documentId: input.documentId || '',
    accessRequestId: input.accessRequestId || '',
    shareId: input.shareId || '',
    eventType: input.eventType,
    actorEmail: input.actorEmail || '',
    message: input.message || '',
    occurredAt: input.occurredAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function publishProfile(profile, at = new Date().toISOString()) {
  return { ...profile, status: 'published', publishedAt: at, updatedAt: at };
}

function publishDocument(document, at = new Date().toISOString()) {
  return { ...document, status: 'published', publishedAt: at, updatedAt: at };
}

function documentRequiresNda(document) {
  return document.visibility === 'nda_required';
}

function approveAccessRequest(request, decidedBy, at = new Date().toISOString()) {
  if (!decidedBy) throw validationError('decidedBy is required');
  return {
    ...request,
    status: 'approved',
    decidedBy,
    decidedAt: at,
    expiresAt: request.expiresAt || addDays(at, 30),
    updatedAt: at
  };
}

function rejectAccessRequest(request, decidedBy, reason = '', at = new Date().toISOString()) {
  if (!decidedBy) throw validationError('decidedBy is required');
  return { ...request, status: 'rejected', decidedBy, decidedAt: at, rejectionReason: reason || 'Rejected', updatedAt: at };
}

function markNdaSigned(request, at = new Date().toISOString()) {
  return { ...request, ndaStatus: 'signed', updatedAt: at };
}

function createShareToken(documentId, requesterEmail, at = new Date().toISOString()) {
  return slugCode(`${documentId}-${requesterEmail}-${at}`).slice(0, 48);
}

function viewShare(share, at = new Date().toISOString()) {
  return { ...share, lastViewedAt: at, updatedAt: at };
}

function revokeShare(share, revokedBy, at = new Date().toISOString()) {
  if (!revokedBy) throw validationError('revokedBy is required');
  return { ...share, status: 'revoked', revokedBy, revokedAt: at, updatedAt: at };
}

function isShareActive(share, asOf = new Date().toISOString()) {
  if (share.status !== 'active') return false;
  if (!share.expiresAt) return true;
  return new Date(asOf).getTime() <= new Date(share.expiresAt).getTime();
}

function trustCenterMetrics({ profiles = [], documents = [], requests = [], shares = [] }) {
  return {
    publishedProfiles: profiles.filter(x => x.status === 'published').length,
    publishedDocuments: documents.filter(x => x.status === 'published').length,
    pendingRequests: requests.filter(x => x.status === 'submitted').length,
    approvedRequests: requests.filter(x => x.status === 'approved').length,
    activeShares: shares.filter(x => x.status === 'active').length
  };
}

module.exports = {
  PROFILE_STATUSES,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  VISIBILITY_LEVELS,
  REQUEST_STATUSES,
  NDA_STATUSES,
  SHARE_STATUSES,
  AUDIT_EVENT_TYPES,
  slugCode,
  addDays,
  normalizeProfileInput,
  normalizeDocumentInput,
  normalizeAccessRequestInput,
  normalizeShareInput,
  normalizeAuditEventInput,
  publishProfile,
  publishDocument,
  documentRequiresNda,
  approveAccessRequest,
  rejectAccessRequest,
  markNdaSigned,
  createShareToken,
  viewShare,
  revokeShare,
  isShareActive,
  trustCenterMetrics
};
