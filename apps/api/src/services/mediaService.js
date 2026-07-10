const crypto = require('crypto');
const { validationError } = require('../errors/domainError');

const ALLOWED_ENTITY_TYPES = ['job', 'customer', 'asset', 'invoice', 'estimate', 'checklist', 'payment', 'agreement'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const DOCUMENT_MIME_TYPES = ['application/pdf', 'text/plain', 'text/csv'];

function safeFilename(filename = '') {
  const cleaned = String(filename || 'attachment')
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'attachment';
}

function buildStorageKey(tenantId, entityType, entityId, filename) {
  if (!tenantId) throw validationError('tenantId is required');
  if (!ALLOWED_ENTITY_TYPES.includes(entityType)) throw validationError(`Unsupported attachment entity type: ${entityType}`);
  if (!entityId) throw validationError('entityId is required');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nonce = crypto.randomBytes(6).toString('hex');
  return `${tenantId}/${entityType}/${entityId}/${stamp}-${nonce}-${safeFilename(filename)}`;
}

function inferMediaKind(mimeType = '') {
  if (IMAGE_MIME_TYPES.includes(mimeType)) return 'image';
  if (DOCUMENT_MIME_TYPES.includes(mimeType)) return 'document';
  if (String(mimeType).startsWith('video/')) return 'video';
  if (String(mimeType).startsWith('audio/')) return 'audio';
  return 'binary';
}

function normalizeAttachmentInput(input = {}, tenantId = '') {
  if (!input.entityType) throw validationError('entityType is required');
  if (!ALLOWED_ENTITY_TYPES.includes(input.entityType)) throw validationError(`Unsupported attachment entity type: ${input.entityType}`);
  if (!input.entityId) throw validationError('entityId is required');
  if (!input.filename) throw validationError('filename is required');

  const mimeType = input.mimeType || 'application/octet-stream';
  const sizeBytes = Number(input.sizeBytes || 0);
  if (sizeBytes < 0) throw validationError('sizeBytes cannot be negative');

  return {
    entityType: input.entityType,
    entityId: input.entityId,
    filename: safeFilename(input.filename),
    originalFilename: input.originalFilename || input.filename,
    mimeType,
    mediaKind: input.mediaKind || inferMediaKind(mimeType),
    sizeBytes,
    storageProvider: input.storageProvider || 'local',
    storageKey: input.storageKey || buildStorageKey(tenantId, input.entityType, input.entityId, input.filename),
    checksumSha256: input.checksumSha256 || '',
    caption: input.caption || '',
    description: input.description || '',
    visibility: input.visibility || 'internal',
    tags: Array.isArray(input.tags) ? input.tags : [],
    metadata: input.metadata || {},
    createdBy: input.createdBy || ''
  };
}

function publicAttachmentMetadata(attachment = {}) {
  return {
    id: attachment.id,
    tenantId: attachment.tenantId,
    entityType: attachment.entityType,
    entityId: attachment.entityId,
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    mediaKind: attachment.mediaKind,
    sizeBytes: attachment.sizeBytes,
    caption: attachment.caption,
    description: attachment.description,
    visibility: attachment.visibility,
    tags: attachment.tags || [],
    metadata: attachment.metadata || {},
    createdBy: attachment.createdBy || '',
    createdAt: attachment.createdAt,
    updatedAt: attachment.updatedAt
  };
}

module.exports = {
  ALLOWED_ENTITY_TYPES,
  IMAGE_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  safeFilename,
  buildStorageKey,
  inferMediaKind,
  normalizeAttachmentInput,
  publicAttachmentMetadata
};
