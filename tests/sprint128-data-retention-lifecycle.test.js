const fs = require('fs');

const required = [
  'apps/api/src/services/dataRetentionService.js',
  'apps/api/src/repositories/dataRetentionRepository.js',
  'apps/api/src/routes/dataRetention.js',
  'scripts/seed-data-retention-lifecycle.js',
  'packages/database/postgres/128_data_retention_lifecycle.sql',
  'docs/sprint128-data-retention-lifecycle.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 128 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePolicyInput,
  normalizeRecordClassInput,
  normalizeScheduleInput,
  normalizeDispositionReviewInput,
  normalizeDeletionJobInput,
  calculateEligibleAt,
  markEligible,
  blockForLegalHold,
  unblockLegalHold,
  approveDisposition,
  rejectDisposition,
  markDisposed,
  startJob,
  completeJob,
  failJob,
  isScheduleDue,
  retentionMetrics
} = require('../apps/api/src/services/dataRetentionService');

const recordClass = normalizeRecordClassInput({ tenantId: 'tenant_demo', name: 'Closed Tickets' });
if (recordClass.code !== 'CLOSED-TICKETS') process.exit(1);

const policy = normalizePolicyInput({ tenantId: 'tenant_demo', name: 'Ticket Retention', allowed: true, retentionDays: 10 });
if (!calculateEligibleAt(policy, '2026-07-07T00:00:00.000Z').startsWith('2026-07-17')) process.exit(1);

let schedule = normalizeScheduleInput({ tenantId: 'tenant_demo', policyId: 'pol1', recordId: 'rec1', triggerAt: '2026-07-01T00:00:00.000Z', eligibleAt: '2026-07-11T00:00:00.000Z' });
if (!isScheduleDue(schedule, '2026-07-12T00:00:00.000Z')) process.exit(1);
schedule = markEligible(schedule);
if (schedule.status !== 'eligible') process.exit(1);

schedule = blockForLegalHold(schedule, 'hold1');
if (schedule.status !== 'blocked' || !schedule.blockedByHold) process.exit(1);
schedule = unblockLegalHold(schedule);
if (schedule.blockedByHold) process.exit(1);

let review = normalizeDispositionReviewInput({ scheduleId: 'sched1', reviewerId: 'records' });
review = approveDisposition(review, 'ok');
if (review.status !== 'approved') process.exit(1);
const rejected = rejectDisposition({ ...review, status: 'pending' }, 'no');
if (rejected.status !== 'rejected') process.exit(1);

schedule = markDisposed(schedule);
if (schedule.status !== 'disposed') process.exit(1);

let job = normalizeDeletionJobInput({ tenantId: 'tenant_demo', scheduleIds: ['sched1'] });
job = startJob(job);
job = completeJob(job, 1, 0);
if (job.status !== 'completed' || job.recordsProcessed !== 1) process.exit(1);
const failed = failJob(normalizeDeletionJobInput({ tenantId: 'tenant_demo' }), 'bad');
if (failed.status !== 'failed') process.exit(1);

const metrics = retentionMetrics({ policies: [policy], classes: [recordClass], schedules: [schedule], reviews: [review], jobs: [job] });
if (metrics.activePolicies !== 1 || metrics.completedJobs !== 1) process.exit(1);

console.log('Sprint 128 data retention lifecycle patch test passed.');
