const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const entry = await repos.timeEntries.create(tenantId, {
    technicianId: 'tech_demo_1',
    userId: 'user_technician',
    jobId: 'job_demo_1',
    entryType: 'labor',
    startedAt: '2026-07-06T08:00:00.000Z',
    endedAt: '2026-07-06T10:00:00.000Z',
    hourlyRate: 35,
    notes: 'Seeded labor entry'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, entry }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
