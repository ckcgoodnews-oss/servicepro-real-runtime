const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
const { defaultTenantSettings } = require('../apps/api/src/services/tenantSettingsService');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const settings = await repos.tenantSettings.upsert(tenantId, defaultTenantSettings(tenantId));
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, settings }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
