const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const policy = await repos.retention.createPolicy({
    name: 'Contracts Seven Year Retention',
    documentType: 'contract',
    retentionDays: 2555,
    reviewBeforeDeleteDays: 60,
    allowAutoDelete: false
  });

  const classification = await repos.retention.classifyDocument({
    tenantId,
    documentId: 'doc_packet_demo',
    documentType: 'contract',
    classificationLevel: 'confidential',
    policyId: policy.id,
    classifiedBy: 'legal-ops',
    sourceCreatedAt: '2026-07-07'
  });

  const hold = await repos.retention.placeLegalHold({
    tenantId,
    documentId: classification.documentId,
    reason: 'Pending customer contract dispute',
    placedBy: 'legal-ops'
  });

  const review = await repos.retention.queueReview({
    tenantId,
    documentId: classification.documentId,
    policyId: policy.id,
    reason: 'Retention period approaching',
    dueAt: classification.retainUntil
  });

  const blockedReview = await repos.retention.approveReview(review.id, 'legal-ops');

  const exportJob = await repos.retention.createExportJob({
    tenantId,
    requestedBy: 'compliance',
    format: 'zip',
    filter: { documentType: 'contract' }
  });

  const runningExport = await repos.retention.startExportJob(exportJob.id);
  const completedExport = await repos.retention.completeExportJob(exportJob.id, 's3://exports/demo.zip');
  const summary = await repos.retention.summary(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, policy, classification, hold, review: blockedReview, exportJob: runningExport, completedExport, summary }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
