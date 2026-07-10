const fs = require('fs');

const required = [
  'apps/api/src/services/marketplaceService.js',
  'apps/api/src/repositories/marketplaceRepository.js',
  'apps/api/src/routes/marketplace.js',
  'scripts/seed-marketplace-integrations.js',
  'packages/database/postgres/106_marketplace_integration_runtime.sql',
  'docs/sprint106-marketplace-integration-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 106 patch file: ${file}`);
    process.exit(1);
  }
}

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
} = require('../apps/api/src/services/marketplaceService');

const catalog = { id: 'cat1', ...normalizeIntegrationCatalogInput({ name: 'QuickBooks Online', category: 'accounting', authType: 'oauth2' }) };
if (catalog.code !== 'QUICKBOOKS-ONLINE' || catalog.status !== 'active') process.exit(1);

let installation = { id: 'ins1', tenantId: 'tenant_demo', ...normalizeTenantInstallationInput({ integrationId: 'cat1' }) };
installation = markInstallationConnected(installation);
if (installation.status !== 'active' || installation.connectionStatus !== 'connected') process.exit(1);

const failedInstallation = markInstallationFailed(installation, 'token expired');
if (failedInstallation.status !== 'error' || failedInstallation.connectionStatus !== 'failed') process.exit(1);

const webhook = normalizeWebhookSubscriptionInput({
  installationId: 'ins1',
  eventName: 'invoice.created',
  targetUrl: 'https://example.com/webhook'
});
if (webhook.status !== 'active') process.exit(1);

let sync = normalizeSyncRunInput({ installationId: 'ins1', objectType: 'invoices' });
sync = startSyncRun(sync);
if (sync.status !== 'running') process.exit(1);

sync = completeSyncRun(sync, { recordsRead: 10, recordsWritten: 10, recordsFailed: 0 });
if (sync.status !== 'succeeded') process.exit(1);

const health = evaluateInstallationHealth({ installation, webhooks: [webhook], syncRuns: [sync] });
if (!health.healthy) process.exit(1);

const summary = summarizeInstallations([installation, failedInstallation]);
if (summary.total !== 2 || summary.active !== 1 || summary.error !== 1) process.exit(1);

console.log('Sprint 106 marketplace integration runtime patch test passed.');
