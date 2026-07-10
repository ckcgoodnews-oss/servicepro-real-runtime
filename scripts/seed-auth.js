const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  await repos.users.createSeedOwner('tenant_demo', 'owner@example.com', 'ChangeMe123!');
  if (repos.store.close) await repos.store.close();
  console.log('Auth seed complete: owner@example.com / ChangeMe123!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
