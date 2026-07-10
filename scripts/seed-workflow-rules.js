const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
const { defaultWorkflowRules } = require('../apps/api/src/services/workflowService');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const rule = await repos.workflows.upsertRule(tenantId, defaultWorkflowRules(tenantId));
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, rule }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
