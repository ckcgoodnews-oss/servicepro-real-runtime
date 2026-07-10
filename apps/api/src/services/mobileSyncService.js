const crypto = require('crypto');
const { validationError } = require('../errors/domainError');

const DEVICE_STATUSES = ['active', 'suspended', 'retired'];
const CHANGE_STATUSES = ['queued', 'applied', 'conflict', 'rejected'];
const CHANGE_OPERATIONS = ['create', 'update', 'delete'];
const CONFLICT_RESOLUTIONS = ['server_wins', 'client_wins', 'manual_merge'];

function makeDeviceToken() {
  return crypto.randomBytes(24).toString('hex');
}

function normalizeEntityType(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, '_');
}

function normalizeDeviceInput(input = {}) {
  if (!input.deviceName) throw validationError('deviceName is required');
  if (!input.userId) throw validationError('userId is required');

  const status = input.status || 'active';
  if (!DEVICE_STATUSES.includes(status)) throw validationError(`Unsupported device status: ${status}`);

  return {
    userId: input.userId,
    technicianId: input.technicianId || '',
    deviceName: input.deviceName,
    devicePlatform: input.devicePlatform || 'unknown',
    appVersion: input.appVersion || '',
    status,
    deviceToken: input.deviceToken || makeDeviceToken(),
    lastSeenAt: input.lastSeenAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeSyncCursorInput(input = {}) {
  if (!input.deviceId) throw validationError('deviceId is required');
  return {
    deviceId: input.deviceId,
    lastPulledAt: input.lastPulledAt || '',
    lastPushedAt: input.lastPushedAt || '',
    lastServerVersion: Number(input.lastServerVersion || 0),
    entityVersions: input.entityVersions || {},
    metadata: input.metadata || {}
  };
}

function normalizeOfflineChangeInput(input = {}) {
  if (!input.deviceId) throw validationError('deviceId is required');
  if (!input.entityType) throw validationError('entityType is required');
  if (!input.entityId) throw validationError('entityId is required');
  if (!input.clientChangeId) throw validationError('clientChangeId is required');

  const operation = input.operation || 'update';
  if (!CHANGE_OPERATIONS.includes(operation)) throw validationError(`Unsupported offline operation: ${operation}`);

  const status = input.status || 'queued';
  if (!CHANGE_STATUSES.includes(status)) throw validationError(`Unsupported offline change status: ${status}`);

  return {
    deviceId: input.deviceId,
    technicianId: input.technicianId || '',
    clientChangeId: input.clientChangeId,
    entityType: normalizeEntityType(input.entityType),
    entityId: input.entityId,
    operation,
    status,
    baseVersion: Number(input.baseVersion || 0),
    clientVersion: Number(input.clientVersion || 0),
    serverVersion: Number(input.serverVersion || 0),
    payload: input.payload || {},
    conflictReason: input.conflictReason || '',
    resolution: input.resolution || '',
    receivedAt: input.receivedAt || new Date().toISOString(),
    appliedAt: input.appliedAt || '',
    metadata: input.metadata || {}
  };
}

function detectConflict(change = {}, serverRecord = {}) {
  const baseVersion = Number(change.baseVersion || 0);
  const serverVersion = Number(serverRecord.version || serverRecord.serverVersion || 0);
  if (!serverRecord || Object.keys(serverRecord).length === 0) {
    return { conflict: false, reason: 'No server record exists' };
  }
  if (change.operation === 'create' && serverRecord.id) {
    return { conflict: true, reason: 'Client attempted to create an entity that already exists' };
  }
  if (change.operation !== 'create' && baseVersion > 0 && serverVersion > baseVersion) {
    return { conflict: true, reason: 'Server record changed after client base version' };
  }
  return { conflict: false, reason: 'No conflict detected' };
}

function applyChangeToRecord(change = {}, serverRecord = {}, resolution = 'client_wins') {
  if (resolution && !CONFLICT_RESOLUTIONS.includes(resolution)) {
    throw validationError(`Unsupported conflict resolution: ${resolution}`);
  }

  if (change.operation === 'delete') {
    return {
      ...serverRecord,
      id: change.entityId,
      deleted: true,
      version: Number(serverRecord.version || 0) + 1,
      updatedAt: new Date().toISOString()
    };
  }

  const payload = change.payload || {};
  if (resolution === 'server_wins') {
    return {
      ...serverRecord,
      version: Number(serverRecord.version || 0),
      updatedAt: serverRecord.updatedAt || ''
    };
  }

  if (resolution === 'manual_merge') {
    return {
      ...serverRecord,
      ...(payload.merge || payload),
      id: change.entityId,
      version: Number(serverRecord.version || change.baseVersion || 0) + 1,
      updatedAt: new Date().toISOString()
    };
  }

  return {
    ...serverRecord,
    ...payload,
    id: change.entityId,
    version: Number(serverRecord.version || change.baseVersion || 0) + 1,
    updatedAt: new Date().toISOString()
  };
}

function buildPullPackage({ deviceId, sinceVersion = 0, entities = {} }) {
  if (!deviceId) throw validationError('deviceId is required');
  const changes = {};
  let maxVersion = Number(sinceVersion || 0);

  for (const [entityType, rows] of Object.entries(entities || {})) {
    const normalizedType = normalizeEntityType(entityType);
    changes[normalizedType] = (Array.isArray(rows) ? rows : [])
      .filter(row => Number(row.version || 0) > Number(sinceVersion || 0))
      .sort((a, b) => Number(a.version || 0) - Number(b.version || 0));
    for (const row of changes[normalizedType]) {
      maxVersion = Math.max(maxVersion, Number(row.version || 0));
    }
  }

  return {
    deviceId,
    sinceVersion: Number(sinceVersion || 0),
    serverVersion: maxVersion,
    generatedAt: new Date().toISOString(),
    changes
  };
}

function summarizeSyncChanges(changes = []) {
  return {
    total: changes.length,
    queued: changes.filter(x => x.status === 'queued').length,
    applied: changes.filter(x => x.status === 'applied').length,
    conflicts: changes.filter(x => x.status === 'conflict').length,
    rejected: changes.filter(x => x.status === 'rejected').length
  };
}

module.exports = {
  DEVICE_STATUSES,
  CHANGE_STATUSES,
  CHANGE_OPERATIONS,
  CONFLICT_RESOLUTIONS,
  makeDeviceToken,
  normalizeEntityType,
  normalizeDeviceInput,
  normalizeSyncCursorInput,
  normalizeOfflineChangeInput,
  detectConflict,
  applyChangeToRecord,
  buildPullPackage,
  summarizeSyncChanges
};
