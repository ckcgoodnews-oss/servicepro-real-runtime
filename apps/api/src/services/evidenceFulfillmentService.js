const { validationError } = require('../errors/domainError');

const BUNDLE_STATUSES = ['draft', 'ready', 'approved', 'delivered', 'archived'];
const ITEM_TYPES = ['document', 'report', 'attestation', 'policy', 'certificate', 'questionnaire', 'other'];
const REQUEST_STATUSES = ['submitted', 'in_progress', 'waiting_approval', 'approved', 'delivered', 'rejected', 'cancelled'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'];
const LINK_STATUSES = ['active', 'expired', 'revoked'];
const ACCESS_EVENT_TYPES = ['link_created', 'link_opened', 'item_downloaded', 'link_revoked', 'request_delivered'];

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

function normalizeBundleInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  assertAllowed(status, BUNDLE_STATUSES, 'bundle status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    owner: input.owner || '',
    customerName: input.customerName || '',
    validUntil: input.validUntil || '',
    metadata: input.metadata || {}
  };
}

function normalizeBundleItemInput(input = {}) {
  if (!input.bundleId) throw validationError('bundleId is required');
  if (!input.title) throw validationError('title is required');
  const itemType = input.itemType || 'document';
  assertAllowed(itemType, ITEM_TYPES, 'bundle item type');
  return {
    bundleId: input.bundleId,
    tenantId: input.tenantId || '',
    title: input.title,
    itemType,
    sourceSystem: input.sourceSystem || '',
    sourceId: input.sourceId || '',
    fileUrl: input.fileUrl || '',
    version: input.version || '',
    sensitivity: input.sensitivity || 'confidential',
    included: input.included !== false,
    metadata: input.metadata || {}
  };
}

function normalizeFulfillmentRequestInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerName) throw validationError('customerName is required');
  if (!input.requesterEmail) throw validationError('requesterEmail is required');
  const status = input.status || 'submitted';
  assertAllowed(status, REQUEST_STATUSES, 'fulfillment request status');
  const requestedAt = input.requestedAt || new Date().toISOString();
  return {
    tenantId: input.tenantId,
    requestNumber: input.requestNumber || '',
    bundleId: input.bundleId || '',
    customerName: input.customerName,
    requesterName: input.requesterName || '',
    requesterEmail: input.requesterEmail,
    status,
    businessReason: input.businessReason || '',
    requestedAt,
    dueAt: input.dueAt || addDays(requestedAt, 5),
    deliveredAt: input.deliveredAt || '',
    rejectedAt: input.rejectedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeApprovalInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'delivery approval status');
  return {
    requestId: input.requestId,
    tenantId: input.tenantId || '',
    approverId: input.approverId,
    approverName: input.approverName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    metadata: input.metadata || {}
  };
}

function normalizeDeliveryLinkInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.bundleId) throw validationError('bundleId is required');
  const status = input.status || 'active';
  assertAllowed(status, LINK_STATUSES, 'delivery link status');
  const createdAt = input.createdAt || new Date().toISOString();
  return {
    requestId: input.requestId,
    bundleId: input.bundleId,
    tenantId: input.tenantId || '',
    recipientEmail: input.recipientEmail || '',
    token: input.token || '',
    status,
    createdBy: input.createdBy || '',
    createdAt,
    expiresAt: input.expiresAt || addDays(createdAt, 14),
    openedAt: input.openedAt || '',
    revokedBy: input.revokedBy || '',
    revokedAt: input.revokedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeAccessEventInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.eventType) throw validationError('eventType is required');
  assertAllowed(input.eventType, ACCESS_EVENT_TYPES, 'access event type');
  return {
    requestId: input.requestId,
    linkId: input.linkId || '',
    bundleId: input.bundleId || '',
    bundleItemId: input.bundleItemId || '',
    tenantId: input.tenantId || '',
    eventType: input.eventType,
    actorEmail: input.actorEmail || '',
    occurredAt: input.occurredAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function markBundleReady(bundle, at = new Date().toISOString()) {
  return { ...bundle, status: 'ready', updatedAt: at };
}

function approveBundle(bundle, at = new Date().toISOString()) {
  return { ...bundle, status: 'approved', updatedAt: at };
}

function approveRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'approved', updatedAt: at };
}

function rejectRequest(request, reason = '', at = new Date().toISOString()) {
  return { ...request, status: 'rejected', rejectedAt: at, rejectionReason: reason || 'Rejected', updatedAt: at };
}

function approveDelivery(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectDelivery(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function createDeliveryToken(requestId, recipientEmail, at = new Date().toISOString()) {
  return slugCode(`${requestId}-${recipientEmail}-${at}`).slice(0, 56);
}

function markDelivered(request, at = new Date().toISOString()) {
  return { ...request, status: 'delivered', deliveredAt: at, updatedAt: at };
}

function openDeliveryLink(link, at = new Date().toISOString()) {
  return { ...link, openedAt: link.openedAt || at, updatedAt: at };
}

function revokeDeliveryLink(link, revokedBy, at = new Date().toISOString()) {
  if (!revokedBy) throw validationError('revokedBy is required');
  return { ...link, status: 'revoked', revokedBy, revokedAt: at, updatedAt: at };
}

function isDeliveryLinkActive(link, asOf = new Date().toISOString()) {
  if (link.status !== 'active') return false;
  if (!link.expiresAt) return true;
  return new Date(asOf).getTime() <= new Date(link.expiresAt).getTime();
}

function fulfillmentMetrics({ bundles = [], requests = [], approvals = [], links = [] }) {
  return {
    totalBundles: bundles.length,
    approvedBundles: bundles.filter(x => x.status === 'approved').length,
    openRequests: requests.filter(x => ['submitted', 'in_progress', 'waiting_approval'].includes(x.status)).length,
    deliveredRequests: requests.filter(x => x.status === 'delivered').length,
    pendingApprovals: approvals.filter(x => x.status === 'pending').length,
    activeLinks: links.filter(x => x.status === 'active').length
  };
}

module.exports = {
  BUNDLE_STATUSES,
  ITEM_TYPES,
  REQUEST_STATUSES,
  APPROVAL_STATUSES,
  LINK_STATUSES,
  ACCESS_EVENT_TYPES,
  slugCode,
  addDays,
  normalizeBundleInput,
  normalizeBundleItemInput,
  normalizeFulfillmentRequestInput,
  normalizeApprovalInput,
  normalizeDeliveryLinkInput,
  normalizeAccessEventInput,
  markBundleReady,
  approveBundle,
  approveRequest,
  rejectRequest,
  approveDelivery,
  rejectDelivery,
  createDeliveryToken,
  markDelivered,
  openDeliveryLink,
  revokeDeliveryLink,
  isDeliveryLinkActive,
  fulfillmentMetrics
};
