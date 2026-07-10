const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const template = await repos.qaInspections.createTemplate(tenantId, {
    code: 'JOB-QA',
    name: 'Job Quality Inspection',
    appliesTo: 'job',
    passingScorePercent: 100,
    items: [
      { code: 'WORK-COMPLETE', label: 'Work completed as sold', itemType: 'pass_fail', required: true, sortOrder: 10 },
      { code: 'AREA-CLEAN', label: 'Work area clean', itemType: 'pass_fail', required: true, sortOrder: 20 },
      { code: 'PHOTO', label: 'Completion photo attached', itemType: 'photo_required', required: true, sortOrder: 30 }
    ]
  });

  const inspection = await repos.qaInspections.createInspectionFromTemplate(tenantId, template.id, {
    entityType: 'job',
    entityId: 'job_demo_1',
    jobId: 'job_demo_1',
    customerId: 'cust_demo_1',
    inspectorId: 'manager_demo'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, template, inspection }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
