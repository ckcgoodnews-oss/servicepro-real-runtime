const { makeId, now } = require('../services/id');
const {
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
} = require('../services/marketplaceService');

function createMarketplaceRepository(store) {
  if (store.type === 'json') return createJsonMarketplaceRepository(store);
  if (store.type === 'postgres') return createPostgresMarketplaceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureMarketplace(data) {
  if (!data.integrationCatalog) data.integrationCatalog = [];
  if (!data.integrationInstallations) data.integrationInstallations = [];
  if (!data.webhookSubscriptions) data.webhookSubscriptions = [];
  if (!data.integrationSyncRuns) data.integrationSyncRuns = [];
  return data;
}

function createJsonMarketplaceRepository(store) {
  return {
    listCatalog(filters = {}) {
      return ensureMarketplace(store.read()).integrationCatalog
        .filter(x => !filters.category || x.category === filters.category)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createCatalogItem(input) {
      const data = ensureMarketplace(store.read());
      const row = { id: makeId('intcat'), ...normalizeIntegrationCatalogInput(input), createdAt: now(), updatedAt: now() };
      data.integrationCatalog.push(row);
      store.write(data);
      return row;
    },
    listInstallations(tenantId, filters = {}) {
      return ensureMarketplace(store.read()).integrationInstallations
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.integrationId || x.integrationId === filters.integrationId)
        .sort((a, b) => String(b.installedAt).localeCompare(String(a.installedAt)));
    },
    createInstallation(tenantId, input) {
      const data = ensureMarketplace(store.read());
      const row = { id: makeId('intins'), tenantId, ...normalizeTenantInstallationInput(input), createdAt: now(), updatedAt: now() };
      data.integrationInstallations.push(row);
      store.write(data);
      return row;
    },
    markConnected(tenantId, id) {
      const data = ensureMarketplace(store.read());
      const idx = data.integrationInstallations.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.integrationInstallations[idx] = markInstallationConnected(data.integrationInstallations[idx]);
      store.write(data);
      return data.integrationInstallations[idx];
    },
    markFailed(tenantId, id, error) {
      const data = ensureMarketplace(store.read());
      const idx = data.integrationInstallations.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.integrationInstallations[idx] = markInstallationFailed(data.integrationInstallations[idx], error);
      store.write(data);
      return data.integrationInstallations[idx];
    },
    listWebhooks(tenantId, filters = {}) {
      return ensureMarketplace(store.read()).webhookSubscriptions
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.installationId || x.installationId === filters.installationId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.eventName).localeCompare(String(b.eventName)));
    },
    createWebhook(tenantId, input) {
      const data = ensureMarketplace(store.read());
      const row = { id: makeId('webhook'), tenantId, ...normalizeWebhookSubscriptionInput(input), createdAt: now(), updatedAt: now() };
      data.webhookSubscriptions.push(row);
      store.write(data);
      return row;
    },
    listSyncRuns(tenantId, filters = {}) {
      return ensureMarketplace(store.read()).integrationSyncRuns
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.installationId || x.installationId === filters.installationId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    createSyncRun(tenantId, input) {
      const data = ensureMarketplace(store.read());
      const row = { id: makeId('syncrun'), tenantId, ...normalizeSyncRunInput(input), createdAt: now(), updatedAt: now() };
      data.integrationSyncRuns.push(row);
      store.write(data);
      return row;
    },
    startSyncRun(tenantId, id) {
      const data = ensureMarketplace(store.read());
      const idx = data.integrationSyncRuns.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.integrationSyncRuns[idx] = startSyncRun(data.integrationSyncRuns[idx]);
      store.write(data);
      return data.integrationSyncRuns[idx];
    },
    completeSyncRun(tenantId, id, stats = {}) {
      const data = ensureMarketplace(store.read());
      const idx = data.integrationSyncRuns.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.integrationSyncRuns[idx] = completeSyncRun(data.integrationSyncRuns[idx], stats);
      store.write(data);
      return data.integrationSyncRuns[idx];
    },
    health(tenantId, installationId) {
      const data = ensureMarketplace(store.read());
      const installation = data.integrationInstallations.find(x => x.tenantId === tenantId && x.id === installationId);
      const webhooks = data.webhookSubscriptions.filter(x => x.tenantId === tenantId && x.installationId === installationId);
      const syncRuns = data.integrationSyncRuns.filter(x => x.tenantId === tenantId && x.installationId === installationId);
      return evaluateInstallationHealth({ installation, webhooks, syncRuns });
    },
    summary(tenantId) {
      return summarizeInstallations(this.listInstallations(tenantId));
    }
  };
}

function createPostgresMarketplaceRepository(store) {
  async function rows(sql, params) { return (await store.query(sql, params)).rows; }

  return {
    async listCatalog(filters = {}) {
      const params = [];
      let where = '';
      if (filters.status) { params.push(filters.status); where = 'WHERE status=$1'; }
      return rows(`SELECT id::text, code, name, category, description, provider, status, auth_type as "authType", supported_events as "supportedEvents", supported_objects as "supportedObjects", documentation_url as "documentationUrl", icon_url as "iconUrl", metadata, created_at as "createdAt", updated_at as "updatedAt" FROM integration_catalog ${where} ORDER BY name`, params);
    },
    async createCatalogItem(input) {
      const x = normalizeIntegrationCatalogInput(input);
      return (await rows(`INSERT INTO integration_catalog (code, name, category, description, provider, status, auth_type, supported_events, supported_objects, documentation_url, icon_url, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12::jsonb) RETURNING id::text, code, name, category, description, provider, status, auth_type as "authType", supported_events as "supportedEvents", supported_objects as "supportedObjects", documentation_url as "documentationUrl", icon_url as "iconUrl", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [x.code, x.name, x.category, x.description, x.provider, x.status, x.authType, JSON.stringify(x.supportedEvents), JSON.stringify(x.supportedObjects), x.documentationUrl, x.iconUrl, JSON.stringify(x.metadata || {})]))[0];
    },
    async listInstallations(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id=$1';
      if (filters.status) { params.push(filters.status); where += ` AND status=$${params.length}`; }
      if (filters.integrationId) { params.push(filters.integrationId); where += ` AND integration_id=$${params.length}`; }
      return rows(`SELECT id::text, tenant_id as "tenantId", integration_id::text as "integrationId", status, connection_status as "connectionStatus", installed_by as "installedBy", installed_at as "installedAt", last_connected_at as "lastConnectedAt", last_error as "lastError", config, secret_ref as "secretRef", metadata, created_at as "createdAt", updated_at as "updatedAt" FROM integration_installations ${where} ORDER BY installed_at DESC`, params);
    },
    async createInstallation(tenantId, input) {
      const x = normalizeTenantInstallationInput(input);
      return (await rows(`INSERT INTO integration_installations (tenant_id, integration_id, status, connection_status, installed_by, installed_at, last_connected_at, last_error, config, secret_ref, metadata) VALUES ($1,$2::uuid,$3,$4,$5,$6::timestamptz,NULLIF($7,'')::timestamptz,$8,$9::jsonb,$10,$11::jsonb) RETURNING id::text, tenant_id as "tenantId", integration_id::text as "integrationId", status, connection_status as "connectionStatus", installed_by as "installedBy", installed_at as "installedAt", last_connected_at as "lastConnectedAt", last_error as "lastError", config, secret_ref as "secretRef", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.integrationId, x.status, x.connectionStatus, x.installedBy, x.installedAt, x.lastConnectedAt, x.lastError, JSON.stringify(x.config || {}), x.secretRef, JSON.stringify(x.metadata || {})]))[0];
    },
    async markConnected(tenantId, id) {
      return (await rows(`UPDATE integration_installations SET status='active', connection_status='connected', last_connected_at=now(), last_error='', updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", integration_id::text as "integrationId", status, connection_status as "connectionStatus", installed_by as "installedBy", installed_at as "installedAt", last_connected_at as "lastConnectedAt", last_error as "lastError", config, secret_ref as "secretRef", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, id]))[0] || null;
    },
    async markFailed(tenantId, id, error) {
      return (await rows(`UPDATE integration_installations SET status='error', connection_status='failed', last_error=$3, updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text, tenant_id as "tenantId", integration_id::text as "integrationId", status, connection_status as "connectionStatus", installed_by as "installedBy", installed_at as "installedAt", last_connected_at as "lastConnectedAt", last_error as "lastError", config, secret_ref as "secretRef", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, id, error || 'Unknown integration error']))[0] || null;
    },
    async listWebhooks() { return []; },
    async createWebhook(tenantId, input) { return { id: 'postgres-webhook-placeholder', tenantId, ...normalizeWebhookSubscriptionInput(input) }; },
    async listSyncRuns() { return []; },
    async createSyncRun(tenantId, input) { return { id: 'postgres-sync-placeholder', tenantId, ...normalizeSyncRunInput(input) }; },
    async startSyncRun() { return null; },
    async completeSyncRun() { return null; },
    async health() { return { healthy: false, status: 'unknown', reason: 'PostgreSQL health query not expanded in patch' }; },
    async summary(tenantId) { return summarizeInstallations(await this.listInstallations(tenantId)); }
  };
}

module.exports = { createMarketplaceRepository };
