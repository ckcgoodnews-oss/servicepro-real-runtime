const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const recordClass = await repos.dataRetention.createRecordClass({
    tenantId,
    name: 'Closed Service Tickets',
    dataCategory: 'service_records',
    systemOfRecord: 'servicepro',
    owner: 'operations'
  });

  const policy = await repos.dataRetention.createPolicy({
    tenantId,
    name: 'Closed Tickets 7 Year Retention',
    recordClassId: recordClass.id,
    retentionDays: 2555,
    retentionTrigger: 'closed_at',
    dispositionAction: 'archive',
    owner: 'records'
  });

  const schedule = await repos.dataRetention.createSchedule({
    tenantId,
    policyId: policy.id,
    recordClassId: recordClass.id,
    recordId: 'ticket_1001',
    recordLocator: '/tickets/ticket_1001',
    triggerAt: '2019-07-07T00:00:00.000Z',
    dispositionAction: 'archive'
  });

  const eligible = await repos.dataRetention.markEligible(schedule.id);
  const blocked = await repos.dataRetention.blockForLegalHold(schedule.id, 'hold_demo');
  const unblocked = await repos.dataRetention.unblockLegalHold(schedule.id);

  const review = await repos.dataRetention.createReview({
    scheduleId: schedule.id,
    tenantId,
    reviewerId: 'records-manager',
    reviewerName: 'Records Manager'
  });
  const approvedReview = await repos.dataRetention.approveReview(review.id, 'Approved for archival.');

  const job = await repos.dataRetention.createDeletionJob({
    tenantId,
    scheduleIds: [schedule.id],
    requestedBy: 'records-manager'
  });
  await repos.dataRetention.startJob(job.id);
  const completedJob = await repos.dataRetention.completeJob(job.id, 1, 0);
  const metrics = await repos.dataRetention.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, recordClass, policy, schedule, eligible, blocked, unblocked, review: approvedReview, job: completedJob, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
