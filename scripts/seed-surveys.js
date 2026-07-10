const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const template = await repos.surveys.createTemplate(tenantId, {
    code: 'JOB-COMPLETE-SURVEY',
    name: 'Job Completion Survey',
    triggerType: 'job.completed',
    questions: [
      { code: 'CSAT', label: 'How satisfied were you with the service?', questionType: 'rating_1_5', required: true, sortOrder: 10 },
      { code: 'NPS', label: 'How likely are you to recommend us?', questionType: 'nps_0_10', required: true, sortOrder: 20 },
      { code: 'COMMENT', label: 'Additional comments', questionType: 'text', required: false, sortOrder: 30 }
    ]
  });

  const send = await repos.surveys.createSend(tenantId, {
    templateId: template.id,
    customerId: 'cust_demo_1',
    entityType: 'job',
    entityId: 'job_demo_1',
    jobId: 'job_demo_1',
    email: 'customer@example.com'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, template, send }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
