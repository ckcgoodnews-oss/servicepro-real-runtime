const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const event = await repos.communications.create(tenantId, {
    customerId: 'cust_demo_1',
    jobId: 'job_demo_1',
    channel: 'internal_note',
    direction: 'internal',
    subject: 'Initial customer communication',
    body: 'Customer prefers text messages before arrival.',
    tags: ['preference'],
    createdBy: 'seed'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, event }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
