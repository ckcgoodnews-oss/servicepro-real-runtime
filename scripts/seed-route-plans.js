const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const plan = await repos.routePlans.createPlan(tenantId, {
    routeDate: '2026-07-06',
    technicianId: 'tech_demo_1',
    startLocationName: 'Shop',
    startLatitude: 39.7684,
    startLongitude: -86.1581
  });

  await repos.routePlans.createStop(tenantId, {
    routePlanId: plan.id,
    jobId: 'job_demo_1',
    customerId: 'cust_demo_1',
    address1: 'Demo Address',
    city: 'Indianapolis',
    state: 'IN',
    postalCode: '46220',
    latitude: 39.8684,
    longitude: -86.1581,
    serviceMinutes: 90
  });

  const optimized = await repos.routePlans.optimize(tenantId, plan.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, plan: optimized.plan, summary: optimized.summary }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
