const { validationError } = require('../errors/domainError');

const INTEGRATION_STATUSES = ['draft', 'active', 'retired'];
const INSTALLATION_STATUSES = ['pending', 'active', 'error', 'disabled', 'uninstalled'];
const AUTH_TYPES = ['none', 'api_key', 'oauth2', 'basic', 'custom'];
const CONNECTION_STATUSES = ['unknown', 'connected', 'degraded', 'failed'];
const WEBHOOK_STATUSES = ['active', 'paused', 'disabled'];
const SYNC_STATUSES = ['queued', 'running', 'succeeded', 'failed', 'cancelled'];
const SYNC_DIRECTIONS = ['inbound', 'outbound', 'bidirectional'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeIntegrationCatalogInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  if (!input.category) throw validationError('category is required');

  const status = input.status || 'active';
  const authType = input.authType || 'none';

  if (!INTEGRATION_STATUSES.includes(status)) throw validationError(`Unsupported integration status: ${status}`);
  if (!AUTH_TYPES.includes(authType)) throw validationError(`Unsupported auth type: ${authType}`);

  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    category: input.category,
    description: input.description || '',
    provider: input.provider || input.name,
    status,
    authType,
    supportedEvents: Array.isArray(input.supportedEvents) ? input.supportedEvents : [],
    supportedObjects: Array.isArray(input.supportedObjects) ? input.supportedObjects : [],
    documentationUrl: input.documentationUrl || '',
    iconUrl: input.iconUrl || '',
    metadata: input.metadata || {}
  };
}

function normalizeTenantInstallationInput(input = {}) {
  if (!input.integrationId) throw validationError('integrationId is required');

  const status = input.status || 'pending';
  const connectionStatus = input.connectionStatus || 'unknown';

  if (!INSTALLATION_STATUSES.includes(status)) throw validationError(`Unsupported installation status: ${status}`);
  if (!CONNECTION_STATUSES.includes(connectionStatus)) throw validationError(`Unsupported connection status: ${connectionStatus}`);

  return {
    integrationId: input.integrationId,
    status,
    connectionStatus,
    installedBy: input.installedBy || '',
    installedAt: input.installedAt || new Date().toISOString(),
    lastConnectedAt: input.lastConnectedAt || '',
    lastError: input.lastError || '',
    config: input.config || {},
    secretRef: input.secretRef || '',
    metadata: input.metadata || {}
  };
}

function normalizeWebhookSubscriptionInput(input = {}) {
  if (!input.installationId) throw validationError('installationId is required');
  if (!input.eventName) throw validationError('eventName is required');
  if (!input.targetUrl) throw validationError('targetUrl is required');

  const status = input.status || 'active';
  if (!WEBHOOK_STATUSES.includes(status)) throw validationError(`Unsupported webhook status: ${status}`);

  return {
    installationId: input.installationId,
    eventName: input.eventName,
    targetUrl: input.targetUrl,
    status,
    signingSecretRef: input.signingSecretRef || '',
    lastDeliveredAt: input.lastDeliveredAt || '',
    failureCount: Number(input.failureCount || 0),
    metadata: input.metadata || {}
  };
}

function normalizeSyncRunInput(input = {}) {
  if (!input.installationId) throw validationError('installationId is required');
  if (!input.objectType) throw validationError('objectType is required');

  const status = input.status || 'queued';
  const direction = input.direction || 'bidirectional';

  if (!SYNC_STATUSES.includes(status)) throw validationError(`Unsupported sync status: ${status}`);
  if (!SYNC_DIRECTIONS.includes(direction)) throw validationError(`Unsupported sync direction: ${direction}`);

  return {
    installationId: input.installationId,
    objectType: input.objectType,
    direction,
    status,
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    recordsRead: Number(input.recordsRead || 0),
    recordsWritten: Number(input.recordsWritten || 0),
    recordsFailed: Number(input.recordsFailed || 0),
    cursor: input.cursor || '',
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function markInstallationConnected(installation, at = new Date().toISOString()) {
  return { ...installation, status: 'active', connectionStatus: 'connected', lastConnectedAt: at, lastError: '', updatedAt: at };
}

function markInstallationFailed(installation, error, at = new Date().toISOString()) {
  return { ...installation, status: 'error', connectionStatus: 'failed', lastError: error || 'Unknown integration error', updatedAt: at };
}

function startSyncRun(syncRun, at = new Date().toISOString()) {
  return { ...syncRun, status: 'running', startedAt: at, updatedAt: at };
}

function completeSyncRun(syncRun, stats = {}, at = new Date().toISOString()) {
  const failed = Number(stats.recordsFailed === undefined ? syncRun.recordsFailed || 0 : stats.recordsFailed);
  return {
    ...syncRun,
    status: failed > 0 ? 'failed' : 'succeeded',
    completedAt: at,
    recordsRead: Number(stats.recordsRead === undefined ? syncRun.recordsRead || 0 : stats.recordsRead),
    recordsWritten: Number(stats.recordsWritten === undefined ? syncRun.recordsWritten || 0 : stats.recordsWritten),
    recordsFailed: failed,
    cursor: stats.cursor === undefined ? syncRun.cursor || '' : stats.cursor,
    errorMessage: stats.errorMessage || '',
    updatedAt: at
  };
}

function evaluateInstallationHealth({ installation, webhooks = [], syncRuns = [] }) {
  if (!installation || installation.status === 'uninstalled' || installation.status === 'disabled') {
    return { healthy: false, status: 'disabled', reason: 'Installation is not enabled' };
  }

  if (installation.connectionStatus === 'failed' || installation.status === 'error') {
    return { healthy: false, status: 'failed', reason: installation.lastError || 'Connection failed' };
  }

  const failingWebhook = webhooks.find(x => x.status === 'active' && Number(x.failureCount || 0) >= 5);
  if (failingWebhook) {
    return { healthy: false, status: 'degraded', reason: `Webhook ${failingWebhook.eventName} has repeated delivery failures` };
  }

  const recentFailedSync = syncRuns.find(x => x.status === 'failed');
  if (recentFailedSync) {
    return { healthy: false, status: 'degraded', reason: `Recent ${recentFailedSync.objectType} sync failed` };
  }

  if (installation.connectionStatus === 'connected') {
    return { healthy: true, status: 'healthy', reason: 'Integration is connected and no active failures were found' };
  }

  return { healthy: false, status: 'unknown', reason: 'Connection has not been verified' };
}

function summarizeInstallations(installations = []) {
  return {
    total: installations.length,
    active: installations.filter(x => x.status === 'active').length,
    pending: installations.filter(x => x.status === 'pending').length,
    error: installations.filter(x => x.status === 'error').length,
    disabled: installations.filter(x => ['disabled', 'uninstalled'].includes(x.status)).length
  };
}

module.exports = {
  INTEGRATION_STATUSES,
  INSTALLATION_STATUSES,
  AUTH_TYPES,
  CONNECTION_STATUSES,
  WEBHOOK_STATUSES,
  SYNC_STATUSES,
  SYNC_DIRECTIONS,
  slugCode,
  normalizeIntegrationCatalogInput,
  normalizeTenantInstallationInput,
  normalizeWebhookSubscriptionInput,
  normalizeSyncRunInput,
  markInstallationConnected,
  markInstallationFailed,
  startSyncRun,
  completeSyncRun,
  evaluateInstallationHealth,
  summarizeInstallations
};
