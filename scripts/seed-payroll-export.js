const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const period = await repos.payroll.createPeriod(tenantId, {
    name: 'Demo Payroll Week',
    startDate: '2026-07-06',
    endDate: '2026-07-12'
  });

  const batch = await repos.payroll.generateExport(tenantId, {
    periodId: period.id,
    format: 'json',
    notes: 'Seed payroll export'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, period, batch }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
