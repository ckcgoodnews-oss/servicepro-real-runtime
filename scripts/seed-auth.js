const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const email = process.env.OWNER_EMAIL || 'owner@example.com';
  const password = process.env.OWNER_PASSWORD || 'ChangeMe123!';
  await repos.users.createSeedOwner(tenantId, email, password);
  if (repos.store.close) await repos.store.close();
  console.log(`Auth seed complete for ${email} in ${tenantId}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
