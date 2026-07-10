const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const quickbooks = await repos.marketplace.createCatalogItem({
    name: 'QuickBooks Online',
    category: 'accounting',
    provider: 'Intuit',
    authType: 'oauth2',
    supportedEvents: ['invoice.created', 'payment.received'],
    supportedObjects: ['customers', 'invoices', 'payments'],
    documentationUrl: 'https://developer.intuit.com'
  });

  const installation = await repos.marketplace.createInstallation(tenantId, {
    integrationId: quickbooks.id,
    status: 'pending',
    installedBy: 'owner',
    config: { realmId: 'demo-realm' }
  });

  const connected = await repos.marketplace.markConnected(tenantId, installation.id);

  const webhook = await repos.marketplace.createWebhook(tenantId, {
    installationId: installation.id,
    eventName: 'invoice.created',
    targetUrl: 'https://app.example.com/webhooks/quickbooks'
  });

  const sync = await repos.marketplace.createSyncRun(tenantId, {
    installationId: installation.id,
    objectType: 'invoices',
    direction: 'bidirectional'
  });

  const completedSync = await repos.marketplace.completeSyncRun(tenantId, sync.id, {
    recordsRead: 20,
    recordsWritten: 20,
    recordsFailed: 0,
    cursor: 'next-20'
  });

  const health = await repos.marketplace.health(tenantId, installation.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, quickbooks, installation: connected, webhook, sync: completedSync, health }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
