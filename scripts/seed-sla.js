const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const policy = await repos.sla.createPolicy(tenantId, {
    name: 'Normal Priority SLA',
    priority: 'normal',
    responseMinutes: 60,
    resolutionMinutes: 1440,
    warningBeforeMinutes: 15
  });

  const timer = await repos.sla.createTimerFromPolicy(tenantId, policy.id, {
    jobId: 'job_demo_1',
    customerId: 'cust_demo_1',
    startedAt: '2026-07-06T08:00:00.000Z'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, policy, timer }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
