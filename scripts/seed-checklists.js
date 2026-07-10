const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const existing = await repos.checklists.listTemplates(tenantId);
  let template = existing.find(t => t.code === 'JOB-CLOSEOUT');
  if (!template) {
    template = await repos.checklists.createTemplate(tenantId, {
      code: 'JOB-CLOSEOUT',
      name: 'Job Closeout Checklist',
      description: 'Required technician closeout checklist',
      items: [
        { code: 'CUSTOMER-APPROVAL', label: 'Customer approved completed work', itemType: 'checkbox', required: true, sortOrder: 10 },
        { code: 'WORK-AREA-CLEAN', label: 'Work area cleaned', itemType: 'checkbox', required: true, sortOrder: 20 },
        { code: 'TECH-NOTES', label: 'Technician notes', itemType: 'text', required: false, sortOrder: 30 }
      ]
    });
  }

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, template }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
