const fs = require('fs');

const required = [
  'apps/api/src/services/retentionService.js',
  'apps/api/src/repositories/retentionRepository.js',
  'apps/api/src/routes/retention.js',
  'scripts/seed-document-retention.js',
  'packages/database/postgres/112_document_retention_compliance.sql',
  'docs/sprint112-document-retention-compliance.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 112 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeRetentionPolicyInput,
  normalizeClassificationInput,
  normalizeLegalHoldInput,
  normalizeRetentionReviewInput,
  normalizeExportJobInput,
  addDays,
  daysUntil,
  applyPolicy,
  isEligibleForReview,
  isBlockedByHold,
  approveDeletionReview,
  rejectDeletionReview,
  markDeleted,
  releaseLegalHold,
  startExportJob,
  completeExportJob,
  failExportJob
} = require('../apps/api/src/services/retentionService');

const policy = { id: 'policy1', ...normalizeRetentionPolicyInput({ name: 'Contract Retention', documentType: 'contract', retentionDays: 365, reviewBeforeDeleteDays: 30 }) };
if (policy.code !== 'CONTRACT-RETENTION') process.exit(1);

let classification = normalizeClassificationInput({ documentId: 'doc1', tenantId: 'tenant_demo', documentType: 'contract', sourceCreatedAt: '2026-01-01' });
classification = applyPolicy(classification, policy);
if (classification.retainUntil !== '2027-01-01') process.exit(1);

if (addDays('2026-01-01', 10) !== '2026-01-11') process.exit(1);
if (daysUntil('2026-02-01', '2026-01-01') !== 31) process.exit(1);
if (!isEligibleForReview(classification, policy, '2026-12-15')) process.exit(1);

let hold = normalizeLegalHoldInput({ documentId: 'doc1', reason: 'Litigation' });
if (!isBlockedByHold('doc1', [hold])) process.exit(1);
hold = releaseLegalHold(hold, 'legal');
if (hold.status !== 'released') process.exit(1);

let review = normalizeRetentionReviewInput({ documentId: 'doc1' });
review = approveDeletionReview(review, 'legal');
if (review.status !== 'approved_for_delete') process.exit(1);
review = markDeleted(review);
if (review.status !== 'deleted') process.exit(1);

let rejected = rejectDeletionReview(normalizeRetentionReviewInput({ documentId: 'doc2' }), 'legal', 'Keep');
if (rejected.status !== 'rejected' || rejected.reason !== 'Keep') process.exit(1);

let exportJob = normalizeExportJobInput({ tenantId: 'tenant_demo', format: 'zip' });
exportJob = startExportJob(exportJob);
if (exportJob.status !== 'running') process.exit(1);
exportJob = completeExportJob(exportJob, 's3://exports/out.zip');
if (exportJob.status !== 'completed') process.exit(1);

const failed = failExportJob(normalizeExportJobInput({ tenantId: 'tenant_demo' }), 'boom');
if (failed.status !== 'failed') process.exit(1);

console.log('Sprint 112 document retention compliance patch test passed.');
