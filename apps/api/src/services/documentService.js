const { validationError } = require('../errors/domainError');

const TEMPLATE_STATUSES = ['draft', 'active', 'archived'];
const PACKET_STATUSES = ['draft', 'generated', 'pending_approval', 'approved', 'sent_for_signature', 'completed', 'void'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];
const SIGNATURE_STATUSES = ['draft', 'sent', 'partially_signed', 'completed', 'declined', 'void'];
const RECIPIENT_STATUSES = ['pending', 'sent', 'viewed', 'signed', 'declined'];
const AUDIT_EVENT_TYPES = ['created', 'generated', 'approved', 'rejected', 'sent', 'viewed', 'signed', 'declined', 'voided', 'completed'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function normalizeTemplateInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  if (!input.body) throw validationError('body is required');
  const status = input.status || 'draft';
  assertAllowed(status, TEMPLATE_STATUSES, 'template status');
  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    documentType: input.documentType || 'contract',
    body: input.body,
    requiredFields: Array.isArray(input.requiredFields) ? input.requiredFields : [],
    metadata: input.metadata || {}
  };
}

function normalizePacketInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.templateId) throw validationError('templateId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  assertAllowed(status, PACKET_STATUSES, 'packet status');
  return {
    tenantId: input.tenantId,
    templateId: input.templateId,
    relatedType: input.relatedType || '',
    relatedId: input.relatedId || '',
    title: input.title,
    status,
    mergeData: input.mergeData || {},
    generatedBody: input.generatedBody || '',
    generatedAt: input.generatedAt || '',
    approvedAt: input.approvedAt || '',
    completedAt: input.completedAt || '',
    documentUrl: input.documentUrl || '',
    metadata: input.metadata || {}
  };
}

function normalizeApprovalInput(input = {}) {
  if (!input.packetId) throw validationError('packetId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'approval status');
  return {
    packetId: input.packetId,
    approverId: input.approverId,
    approverName: input.approverName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    metadata: input.metadata || {}
  };
}

function normalizeSignatureRequestInput(input = {}) {
  if (!input.packetId) throw validationError('packetId is required');
  const status = input.status || 'draft';
  assertAllowed(status, SIGNATURE_STATUSES, 'signature status');
  return {
    packetId: input.packetId,
    status,
    provider: input.provider || 'internal',
    externalEnvelopeId: input.externalEnvelopeId || '',
    subject: input.subject || '',
    message: input.message || '',
    sentAt: input.sentAt || '',
    completedAt: input.completedAt || '',
    declinedAt: input.declinedAt || '',
    voidedAt: input.voidedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeRecipientInput(input = {}) {
  if (!input.signatureRequestId) throw validationError('signatureRequestId is required');
  if (!input.name) throw validationError('name is required');
  if (!input.email) throw validationError('email is required');
  const status = input.status || 'pending';
  assertAllowed(status, RECIPIENT_STATUSES, 'recipient status');
  return {
    signatureRequestId: input.signatureRequestId,
    name: input.name,
    email: input.email,
    role: input.role || 'signer',
    routingOrder: Number(input.routingOrder || 1),
    status,
    sentAt: input.sentAt || '',
    viewedAt: input.viewedAt || '',
    signedAt: input.signedAt || '',
    declinedAt: input.declinedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeAuditEventInput(input = {}) {
  if (!input.packetId) throw validationError('packetId is required');
  if (!input.eventType) throw validationError('eventType is required');
  assertAllowed(input.eventType, AUDIT_EVENT_TYPES, 'audit event type');
  return {
    packetId: input.packetId,
    signatureRequestId: input.signatureRequestId || '',
    eventType: input.eventType,
    actorId: input.actorId || '',
    actorName: input.actorName || '',
    message: input.message || '',
    occurredAt: input.occurredAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function mergeTemplate(templateBody, mergeData = {}) {
  return String(templateBody || '').replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_, key) => {
    let value = mergeData;
    for (const part of key.split('.')) {
      value = value && value[part] !== undefined ? value[part] : '';
    }
    return String(value === null || value === undefined ? '' : value);
  });
}

function validateRequiredFields(requiredFields = [], mergeData = {}) {
  const missing = [];
  for (const field of requiredFields) {
    let value = mergeData;
    for (const part of String(field).split('.')) {
      value = value && value[part] !== undefined ? value[part] : undefined;
    }
    if (value === undefined || value === null || value === '') missing.push(field);
  }
  return { valid: missing.length === 0, missing };
}

function generatePacket(packet, template, at = new Date().toISOString()) {
  const required = validateRequiredFields(template.requiredFields || [], packet.mergeData || {});
  if (!required.valid) throw validationError('Missing required merge fields', { missing: required.missing });
  return {
    ...packet,
    status: 'generated',
    generatedBody: mergeTemplate(template.body, packet.mergeData),
    generatedAt: at,
    updatedAt: at
  };
}

function approveApprovalRequest(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectApprovalRequest(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function sendSignatureRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'sent', sentAt: at, updatedAt: at };
}

function signRecipient(recipient, at = new Date().toISOString()) {
  return { ...recipient, status: 'signed', viewedAt: recipient.viewedAt || at, signedAt: at, updatedAt: at };
}

function declineRecipient(recipient, at = new Date().toISOString()) {
  return { ...recipient, status: 'declined', declinedAt: at, updatedAt: at };
}

function evaluateSignatureStatus(request, recipients = [], at = new Date().toISOString()) {
  if (recipients.some(x => x.status === 'declined')) {
    return { ...request, status: 'declined', declinedAt: at, updatedAt: at };
  }
  if (recipients.length > 0 && recipients.every(x => x.status === 'signed')) {
    return { ...request, status: 'completed', completedAt: at, updatedAt: at };
  }
  if (recipients.some(x => x.status === 'signed')) {
    return { ...request, status: 'partially_signed', updatedAt: at };
  }
  return request;
}

function completePacket(packet, at = new Date().toISOString()) {
  return { ...packet, status: 'completed', completedAt: at, updatedAt: at };
}

module.exports = {
  TEMPLATE_STATUSES,
  PACKET_STATUSES,
  APPROVAL_STATUSES,
  SIGNATURE_STATUSES,
  RECIPIENT_STATUSES,
  AUDIT_EVENT_TYPES,
  slugCode,
  normalizeTemplateInput,
  normalizePacketInput,
  normalizeApprovalInput,
  normalizeSignatureRequestInput,
  normalizeRecipientInput,
  normalizeAuditEventInput,
  mergeTemplate,
  validateRequiredFields,
  generatePacket,
  approveApprovalRequest,
  rejectApprovalRequest,
  sendSignatureRequest,
  signRecipient,
  declineRecipient,
  evaluateSignatureStatus,
  completePacket
};
