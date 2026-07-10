const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const policy = await repos.warranty.createPolicy(tenantId, {
    name: 'Standard 30 Day Labor and Parts Warranty',
    coverageType: 'labor_and_parts',
    durationDays: 30,
    laborCoveredPercent: 100,
    partsCoveredPercent: 100
  });

  const claim = await repos.warranty.createClaim(tenantId, {
    customerId: 'cust_demo_1',
    originalJobId: 'job_demo_1',
    policyId: policy.id,
    claimDate: '2026-07-06',
    problemSummary: 'Customer reports same issue returned.'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, policy, claim }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
