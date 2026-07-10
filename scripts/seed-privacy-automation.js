const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const request = await repos.privacy.createRequest({
    tenantId,
    requestType: 'export',
    subjectName: 'Demo Customer',
    subjectEmail: 'customer@example.com'
  });

  const verified = await repos.privacy.verifyIdentity(request.id);

  const consent = await repos.privacy.createConsent({
    tenantId,
    subjectEmail: 'customer@example.com',
    purpose: 'service communications',
    source: 'portal'
  });

  const exportJob = await repos.privacy.createExportJob({
    requestId: request.id,
    tenantId,
    requestedBy: 'privacy-admin'
  });

  await repos.privacy.startExportJob(exportJob.id);
  const completedExport = await repos.privacy.completeExportJob(exportJob.id, 's3://privacy-exports/customer.zip');

  const redaction = await repos.privacy.createRedactionTask({
    requestId: request.id,
    tenantId,
    targetType: 'customer_profile',
    targetId: 'customer_demo',
    fields: ['phone', 'address']
  });

  const completedRedaction = await repos.privacy.completeRedactionTask(redaction.id, 'privacy-admin');
  const completedRequest = await repos.privacy.completeRequest(request.id);
  const audit = await repos.privacy.auditTrail(request.id);
  const summary = await repos.privacy.summary(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, request: verified, consent, exportJob: completedExport, redaction: completedRedaction, completedRequest, audit, summary }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
